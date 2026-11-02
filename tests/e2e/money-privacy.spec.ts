// Privacy of the numbers (prompt F4, criterion 4; DECISOES § 114): on every calculator page, long and unique
// sentinel values go into every field; the schedule is opened, the PDF and the CSV are saved, the link is copied,
// a chip is clicked and the copied link is opened. Then each sentinel is searched, in every form it could take
// (as typed, grouped, in cents or rate units, whole), with no digit glued before or after it, in: every request
// URL and body of any origin, the dataLayer, document.title, location.search, localStorage, sessionStorage, the
// cookies and the names of the downloaded files. None is found. The copied link is the one place with the numbers.
// F6 (decision 9): the five Spanish calculators and the eight Brazilian ones too, with each sentinel typed as a person
// types it in the page's language (a decimal comma in Portuguese) and searched in the forms of every language.
import { expect, test, type Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/routes.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, ES_CALC_IDS, moneyPage, type MoneyPageId } from '../../src/tools/calc/registry.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import ptShared from '../../src/tools/calc/i18n/pt.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { display } from '../../src/tools/calc/form.ts';
import type { FieldSpec, NumberSpec, Values } from '../../src/tools/calc/types.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';

const MONEY = ['987654.32', '98765.43', '9876.54', '987.65'];
const RATES = ['13.5791', '7.3579', '1.3579'];
const COUNTS = ['287', '97', '37', '7'];
const SCALE = { money: 100, rate: 10_000, int: 1 } as const;

/** The sentinels of a field's kind that its range takes (and that the field it depends on allows), longest first. */
function sentinelsFor(spec: NumberSpec, values: Values): string[] {
  const list = spec.kind === 'money' ? MONEY : spec.kind === 'rate' ? RATES : COUNTS;
  const limit = typeof spec.atMost === 'function' ? spec.atMost(values) : spec.atMost ? Number(values[spec.atMost]) : Infinity;
  const fits = list.filter((text) => {
    const units = Math.round(Number(text) * SCALE[spec.kind]);
    return units >= spec.min && units <= spec.max && units <= limit;
  });
  if (fits.length === 0) throw new Error(`no sentinel for ${spec.key}`);
  return fits;
}

/**
 * Every form a typed value could take on its way out: as typed, with a thousands comma, in engine units, whole. F6: and the
 * Portuguese forms of the same number (decimal comma, thousands dot), whatever the page's language.
 */
function formsOf(text: string, kind: NumberSpec['kind']): string[] {
  const [whole = '', fraction = ''] = text.split('.');
  const forms = new Set([text, String(Math.round(Number(text) * SCALE[kind]))]);
  if (fraction) forms.add(`${whole},${fraction}`);
  if (kind === 'money') {
    forms.add(`${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`);
    forms.add(`${whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${fraction}`);
    forms.add(whole);
  }
  if (kind === 'rate') {
    forms.add(String(Number(text) / 100));
    forms.add(String(Number(text) / 100).replace('.', ','));
  }
  return [...forms].filter((form) => form.length >= 3);
}

/** What a person types for a sentinel in a language: the decimal comma in Portuguese. */
const typedIn = (text: string, lang: Lang): string => (lang === 'pt' ? text.replace('.', ',') : text);

/** The shared island texts of each language: the schedule button and the "link copied" status. */
const SHARED = { en: enShared, pt: ptShared, es: esShared } as const;
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A sentinel form with no digit glued before or after it. */
const pattern = (form: string): RegExp => new RegExp(`(?<![0-9])${form.replace(/[.]/g, '\\.')}(?![0-9])`);

/** The number fields on screen, with the spec and the state key each one stands for (list rows included). */
function numberFields(specs: readonly FieldSpec[], values: Values): { id: string; spec: NumberSpec }[] {
  const out: { id: string; spec: NumberSpec }[] = [];
  for (const spec of specs) {
    if (spec.when && values[spec.when.key] !== spec.when.is) continue;
    if (spec.kind === 'list') {
      const rows = values[spec.key] as Record<string, number>[];
      rows.forEach((_, index) => {
        for (const item of spec.item) out.push({ id: `fo-calc-${spec.key}${index}${item.key}`, spec: item });
      });
    } else if (spec.kind === 'down') {
      const percent = values[spec.unitKey] === 'percent';
      out.push({ id: `fo-calc-${spec.key}`, spec: { kind: percent ? 'rate' : 'money', key: spec.key, min: 0, max: percent ? 1_000_000 : spec.max } });
    } else if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int') out.push({ id: `fo-calc-${spec.key}`, spec });
  }
  return out;
}

async function everywhere(page: Page): Promise<string> {
  return page.evaluate(() => {
    const store = (storage: Storage) => Object.keys(storage).map((key) => `${key}=${storage.getItem(key)}`).join(';');
    return [document.title, location.search, store(localStorage), store(sessionStorage), document.cookie].join('\n');
  });
}

test('the sentinel search finds every form and ignores a number inside another one', () => {
  expect(formsOf('987654.32', 'money').sort()).toEqual(['987,654.32', '987.654,32', '987654', '987654,32', '987654.32', '98765432'].sort());
  expect(formsOf('13.5791', 'rate').sort()).toEqual(['0,135791', '0.135791', '135791', '13,5791', '13.5791'].sort());
  expect(typedIn('987654.32', 'pt')).toBe('987654,32');
  expect(typedIn('987654.32', 'es')).toBe('987654.32');
  expect(formsOf('287', 'int')).toEqual(['287']);
  const found = (form: string, text: string) => pattern(form).test(text);
  expect(found('987654.32', 'GET https://x.test/?p=987654.32')).toBe(true);
  expect(found('98765432', '"page_location":"/m/#v=1&p=98765432"')).toBe(true);
  expect(found('287', 'months=287&x')).toBe(true);
  expect(found('287', 'id 12873 and 2870')).toBe(false);
});

const PAGES: { id: MoneyPageId; lang: Lang }[] = [
  ...CALC_PAGE_IDS.map((id) => ({ id, lang: 'en' as const })),
  ...ES_CALC_IDS.map((id) => ({ id, lang: 'es' as const })),
  ...BR_CALC_IDS.map((id) => ({ id, lang: 'pt' as const })),
];

for (const { id, lang } of PAGES) {
  const own = moneyPage(id, lang);
  if (!own) throw new Error(`${id} has no page in ${lang}`);
  const path = own.path;
  test(`${path}: no typed number leaves the device`, async ({ page, context }) => {
    test.setTimeout(60_000);
    const outgoing: string[] = [];
    context.on('request', (request) => outgoing.push(`${request.method()} ${request.url()}\n${request.postData() ?? ''}`));
    // The test reads what Copy link hands to the clipboard; the page's own call goes on as it would.
    await page.addInitScript(() => {
      const clipboard = navigator.clipboard;
      const write = clipboard?.writeText?.bind(clipboard);
      if (clipboard) {
        clipboard.writeText = async (text: string) => {
          (window as unknown as { foCopied: string }).foCopied = text;
          if (write) await write(text).catch(() => undefined);
        };
      }
    });
    expect((await page.goto(path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);

    const def = DEFS[id];
    const typed: { text: string; kind: NumberSpec['kind'] }[] = [];
    const values: Values = { ...def.initial };
    const download = page.locator('.fo-export .fo-btn--download');
    /** The sentinels left in the fields, the ones the copied link carries. */
    const kept: { text: string; kind: NumberSpec['kind'] }[] = [];
    for (const field of numberFields(def.fields, values)) {
      const input = page.locator(`#${field.id}`);
      const before = await input.inputValue();
      const kept0 = values[field.spec.key];
      // The longest sentinel first; if the result turns into a problem (debts over the limit), the PDF and the CSV
      // are off (review F4, COR-3), so the next shorter one goes in. If none gives a result (a limit in percent
      // that only grows the problem), the field goes back to its value. Every sentinel typed is searched for.
      let left: string | null = null;
      for (const text of sentinelsFor(field.spec, values)) {
        await input.fill(typedIn(text, lang));
        await input.blur();
        typed.push({ text, kind: field.spec.kind });
        // Later limits (a balloon month and the term) read the values already typed.
        values[field.spec.key] = Math.round(Number(text) * SCALE[field.spec.kind]);
        if (await download.isEnabled()) {
          left = text;
          break;
        }
      }
      if (left === null) {
        await input.fill(before);
        await input.blur();
        if (kept0 !== undefined) values[field.spec.key] = kept0;
      } else kept.push({ text: left, kind: field.spec.kind });
    }
    expect(typed.length, 'sentinelas digitadas').toBeGreaterThan(0);
    await expect(download, 'há resultado para exportar').toBeEnabled();
    const seen: string[] = [];
    const record = async () => {
      seen.push(JSON.stringify(await dataLayer(page)), await everywhere(page));
    };

    await page.getByRole('button', { name: new RegExp(escape(SHARED[lang].island.showSchedule), 'i') }).click();
    await expect(page.locator('#fo-schedule-table table')).toBeVisible();
    const names: string[] = [];
    for (const button of [page.locator('.fo-export .fo-btn').nth(1), page.locator('.fo-export .fo-btn--download')]) {
      const download = page.waitForEvent('download');
      await button.click();
      names.push((await download).suggestedFilename());
    }
    expect(names).toEqual([`${own.file}.csv`, `${own.file}.pdf`]);
    await page.locator('.fo-export .fo-btn').nth(2).click();
    await expect(page.locator('.fo-export-wrap [role="status"]')).toHaveText(new RegExp(escape(SHARED[lang].island.copied), 'i'));
    const copied = await page.evaluate(() => (window as unknown as { foCopied?: string }).foCopied ?? (document.querySelector<HTMLInputElement>('#fo-calc-link')?.value ?? ''));
    expect(copied).toMatch(/#v=1&/);
    expect(new URL(copied).search).toBe('');
    expect(page.url()).not.toContain('#');
    await record();
    // A chip leads to another calculator; then the copied link opens with the numbers after the #.
    await page.locator('.fo-calc__next a').first().click();
    await page.waitForLoadState('load');
    await record();
    await page.goto(copied);
    await hydrated(page);
    expect(new URL(page.url()).search).toBe('');
    // The link was read: the first field shows its sentinel in the page's format (review F4, PRI-2: the old check
    // compared the shown text with raw cents and could not fail).
    const first = numberFields(def.fields, values)[0];
    if (first) await expect(page.locator(`#${first.id}`)).toHaveValue(display(first.spec.kind, Number(values[first.spec.key]), lang));
    await record();

    // page_location goes without the # (DECISOES § 8).
    for (const entry of await dataLayer(page)) if (entry[0] === 'config') expect(JSON.stringify(entry[2] ?? {})).not.toContain('#');
    const haystack = [...outgoing, ...seen, ...names].join('\n');
    const found: string[] = [];
    for (const { text, kind } of typed) for (const form of formsOf(text, kind)) if (pattern(form).test(haystack)) found.push(form);
    expect(found, 'sentinelas fora do aparelho').toEqual([]);
    // The copied link is where the numbers are: the first money sentinel, in cents.
    const money = kept.find((entry) => entry.kind === 'money');
    if (money) expect(copied).toContain(String(Math.round(Number(money.text) * 100)));
  });
}
