// Privacy of the numbers (prompt F4, criterion 4; DECISOES § 114): on every calculator page, long and unique
// sentinel values go into every field; the schedule is opened, the PDF and the CSV are saved, the link is copied,
// a chip is clicked and the copied link is opened. Then each sentinel is searched, in every form it could take
// (as typed, grouped, in cents or rate units, whole), with no digit glued before or after it, in: every request
// URL and body of any origin, the dataLayer, document.title, location.search, localStorage, sessionStorage, the
// cookies and the names of the downloaded files. None is found. The copied link is the one place with the numbers.
// F6 (decision 9): the five Spanish calculators and the eight Brazilian ones too, with each sentinel typed as a person
// types it in the page's language (a decimal comma in Portuguese) and searched in the forms of every language. The languages
// adjustment: the 18 Spanish pages, the five of the F6 and the 13 new ones (9 calculators and the 4 presets).
import { expect, test, type Page } from '@playwright/test';
import type { Lang } from '../../src/i18n/routes.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, moneyPage, type MoneyPageId } from '../../src/tools/calc/registry.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import ptShared from '../../src/tools/calc/i18n/pt.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { SETTLE_MS, display } from '../../src/tools/calc/form.ts';
import type { FieldSpec, NumberSpec, Values } from '../../src/tools/calc/types.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';

const MONEY = ['987654.32', '98765.43', '9876.54', '987.65'];
const RATES = ['13.5791', '7.3579', '1.3579'];
const COUNTS = ['287', '97', '37', '7'];
/** Engine units per typed unit. The money pages have no measure ('dec', F7): money-life-privacy.spec.ts covers those. */
const SCALE: Record<NumberSpec['kind'], number> = { money: 100, rate: 10_000, int: 1, dec: 1 };

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

// The languages adjustment: every calculator and preset of the registry has its Spanish page, so the 18 are searched in Spanish.
const PAGES: { id: MoneyPageId; lang: Lang }[] = [
  ...CALC_PAGE_IDS.map((id) => ({ id, lang: 'en' as const })),
  ...CALC_PAGE_IDS.map((id) => ({ id, lang: 'es' as const })),
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

    // F13b (DECISOES § 547): the costs that fold into a block are in the page once it is open.
    for (const fold of await page.locator('#fo-tool-root [aria-controls="fo-calc-more-fields"][aria-expanded="false"]').all()) await fold.click();
    const def = DEFS[id];
    const typed: { text: string; kind: NumberSpec['kind'] }[] = [];
    const values: Values = { ...def.initial };
    // F13b (DECISOES § 545): the Download PDF is in the card, and only while there is a result to save (F7 f-10).
    const download = page.locator('.fo-rhero .fo-btn--download');
    const frames = () => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
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
        await frames();
        if ((await download.count()) > 0) {
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

    // F13b (DECISOES § 548): the schedule is a block of the island, named by its heading.
    await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
    await expect(page.locator('#fo-schedule-table table')).toBeVisible();
    const names: string[] = [];
    for (const button of [page.locator('.fo-export .fo-btn').nth(0), download]) {
      const download = page.waitForEvent('download');
      await button.click();
      names.push((await download).suggestedFilename());
    }
    expect(names).toEqual([`${own.file}.csv`, `${own.file}.pdf`]);
    await page.locator('.fo-export .fo-btn').nth(1).click();
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

// F16 (criterion 5 of the run's prompt; review F16, d-1): the decimals message, the hint of the separator, the draft that does
// not read, the card's voice, the focus that leaves a wrong last field and the new CSV in the path of this spec. The price is
// typed key by key, as a person types it, four times: in the other language's format ("683.917,45" in English: the range and
// the hint), cut where it does not read ("683,91": the draft, then the hint), with too many decimals ("683,917.4555": the
// decimals message) and right. The last main field takes a number with too many decimals and the Tab (the Download leaves, the
// focus goes to Copy link, § 686), then a right one. Then the CSV, which makes no request, and the PDF, which only fetches the
// PDF maker from the page origin. No form of the price (683917 with or without a separator, in cents, the draft 683,91 read
// either way) is in a request, the address, the title, the storage, the cookies, the dataLayer or the names of the files; nor,
// in Portuguese, the rate (13,5791). The expected messages are written by hand (DECISOES § 689).
const DECIMALS_PATH = [
  {
    lang: 'en',
    path: moneyPage('mortgage-calculator', 'en')?.path ?? '(no mortgage in en)',
    price: { other: '683.917,45', draft: '683,91', many: '683,917.4555', right: '683,917.45' },
    hint: 'Use a dot for the decimals, like 6.5.',
    two: 'Use up to 2 decimal places.',
    last: { id: 'fo-calc-t', many: '29.5', right: '30', message: 'Use a whole number.' },
  },
  {
    lang: 'es',
    path: moneyPage('mortgage-calculator', 'es')?.path ?? '(no mortgage in es)',
    price: { other: '683.917,45', draft: '683,91', many: '683,917.4555', right: '683,917.45' },
    hint: 'Usa punto en los decimales, como 6.5.',
    two: 'Usa hasta 2 decimales.',
    last: { id: 'fo-calc-t', many: '29.5', right: '30', message: 'Usa un número entero.' },
  },
  {
    lang: 'pt',
    path: moneyPage('br-sac-price', 'pt')?.path ?? '(no SAC × PRICE in pt)',
    price: { other: '683,917.45', draft: '683.91', many: '683.917,4555', right: '683.917,45' },
    hint: 'Use vírgula nos decimais, como 11,5.',
    two: 'Use até 2 casas decimais.',
    last: { id: 'fo-calc-r', many: '13,57915', right: '13,5791', message: 'Use até 4 casas decimais.' },
  },
] as const;

/** Every form of the typed numbers: a run of digits that starts with them, with or without a separator, not glued to a digit. */
const DECIMALS_FORMS = [/(?<![0-9])683[.,]?91/, /(?<![0-9])13[.,]?5791/];

for (const c of DECIMALS_PATH) {
  test(`${c.lang}: the decimals message, the hint, the draft, the voice and the new CSV in the path: no typed number leaves the device`, async ({ page, context, browserName }) => {
    test.setTimeout(60_000);
    const outgoing: { method: string; url: string; body: string }[] = [];
    context.on('request', (request) => outgoing.push({ method: request.method(), url: request.url(), body: request.postData() ?? '' }));
    expect((await page.goto(c.path))?.status(), c.path).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const origin = new URL(page.url()).origin;
    // WebKit's Tab skips buttons, as Safari does by default: there the walk is Option+Tab (docs/claude/playwright.md, F13b).
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    const error = page.locator('#fo-rhero-error');
    const download = page.locator('.fo-rhero .fo-btn--download');
    // The card's one voice (the p.fo-sr[aria-live] of .fo-rhero, § 102): every text it says from now on.
    await page.evaluate(() => {
      const region = document.querySelector('.fo-rhero p.fo-sr[aria-live]');
      if (!region) throw new Error('no live region in the card');
      const said: string[] = [];
      (window as unknown as { __said: string[] }).__said = said;
      new MutationObserver(() => {
        const text = (region.textContent ?? '').trim();
        if (text !== '') said.push(text);
      }).observe(region, { childList: true, characterData: true, subtree: true });
    });
    const voices = () => page.evaluate(() => (window as unknown as { __said: string[] }).__said.length);
    /** Waits until the card says `text` in a voice after the first `from` ones (the region speaks once a value settles). */
    const says = (from: number, text: string) =>
      expect.poll(() => page.evaluate((start) => (window as unknown as { __said: string[] }).__said.slice(start).join(' | '), from), { timeout: 5_000 }).toContain(text);
    /** Selects the whole text of a field and types `text` key by key, as a person does. */
    const retype = async (id: string, text: string) => {
      const field = page.locator(`#${id}`);
      await field.focus();
      await field.evaluate((input: HTMLInputElement) => input.select());
      await page.keyboard.type(text, { delay: 30 });
    };
    const price = page.locator('#fo-calc-p');

    // The other language's format: the range, with how the page writes the decimals.
    let from = await voices();
    await retype('fo-calc-p', c.price.other);
    await expect(error).toContainText(c.hint);
    await says(from, c.hint);
    await retype('fo-calc-p', c.price.right);
    await expect(error).toHaveCount(0);
    // Cut where it does not read: the card's region waits (the draft, § 685), then the error says the hint.
    from = await voices();
    await retype('fo-calc-p', c.price.draft);
    await page.waitForTimeout(SETTLE_MS + 200);
    await expect(error).toContainText(c.hint);
    await expect(price).toHaveAttribute('aria-invalid', 'true');
    await says(from, c.hint);
    // Written right with more decimals than the field keeps: the decimals message, in the card and in its voice (§ 684).
    from = await voices();
    await retype('fo-calc-p', c.price.many);
    await expect(error).toContainText(c.two);
    await says(from, c.two);
    await retype('fo-calc-p', c.price.right);
    await price.blur();
    await expect(error).toHaveCount(0);
    await expect(price).toHaveValue(c.price.right);

    // The last main field with too many decimals, then the Tab: the Download leaves, the focus goes to Copy link (§ 686).
    from = await voices();
    await retype(c.last.id, c.last.many);
    await page.keyboard.press(tab);
    await expect(error).toContainText(c.last.message);
    await expect(download).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => (document.activeElement === document.body ? 'BODY' : (document.activeElement?.textContent ?? '').trim())))
      .toBe(SHARED[c.lang].island.copyLink);
    await says(from, c.last.message);
    await retype(c.last.id, c.last.right);
    await page.locator(`#${c.last.id}`).blur();
    await expect(error).toHaveCount(0);
    await expect(download).toHaveCount(1);

    // The CSV is made on the page: no request at all. The PDF fetches only the PDF maker, a GET of the page origin with no query.
    const own = moneyPage(c.lang === 'pt' ? 'br-sac-price' : 'mortgage-calculator', c.lang);
    const csv = page.locator('.fo-export .fo-btn').nth(0);
    await expect(csv).toBeEnabled();
    const names: string[] = [];
    let mark = outgoing.length;
    const saving = page.waitForEvent('download');
    await csv.click();
    names.push((await saving).suggestedFilename());
    expect(outgoing.slice(mark).filter((request) => !/^(blob|data):/.test(request.url)), 'the CSV makes no request').toEqual([]);
    mark = outgoing.length;
    const printing = page.waitForEvent('download');
    await download.click();
    names.push((await printing).suggestedFilename());
    const pdf = outgoing.slice(mark).filter((request) => !/^(blob|data):/.test(request.url));
    expect(
      pdf.filter((request) => request.method !== 'GET' || new URL(request.url).origin !== origin || new URL(request.url).search !== ''),
      'the PDF fetches only from the page origin, by GET, with no query',
    ).toEqual([]);
    expect(names).toEqual([`${own?.file}.csv`, `${own?.file}.pdf`]);

    expect(page.url(), 'the address has neither a query nor a #').not.toMatch(/[?#]/);
    const haystack = [
      ...outgoing.map((request) => `${request.method} ${request.url}\n${request.body}`),
      JSON.stringify(await dataLayer(page)),
      await everywhere(page),
      page.url(),
      ...names,
    ].join('\n');
    expect(
      DECIMALS_FORMS.filter((form) => form.test(haystack)).map(String),
      'the typed numbers out of the device',
    ).toEqual([]);
  });
}
