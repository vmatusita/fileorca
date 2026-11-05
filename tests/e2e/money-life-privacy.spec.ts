// Privacy of the measures and the dates (prompt F7, decision 11; DECISOES § 114, in the model of money-privacy.spec.ts): on
// every home and health calculator, read from the registry, a sentinel goes into every visible field. A measure or a count
// gets a value worked out from the field's own range (so a new field gets one by construction), with no zero at the end, so
// the field shows what was typed; a date field gets the sentinel day. The choices that show other fields (the shape of the
// concrete, the area and the material of the mulch, the walls or the area of the paint, the US or metric units of the health
// pages) are switched once, and the fields they show get their own sentinels too; the square footage gets one area of each
// shape. The PDF and the CSV are saved in each of those states, the table (open on these pages, with no Show button) is read,
// the link is copied, the first chip is clicked and the copied link is opened. Then every sentinel is searched, in every form
// it could take, in: every request URL and body of any origin, the dataLayer, document.title, location.search, localStorage,
// sessionStorage, the cookies and the names of the downloaded files. None is found, no request goes to another host, and the
// copied link (after the #) is the one place with the values.
import { expect, test, type Page } from '@playwright/test';
import { LIFE_CALC_IDS, LIFE_CALC_PAGES } from '../../src/tools/calc/registry.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { display, visible } from '../../src/tools/calc/form.ts';
import { dayOf } from '../../src/calc/dates.ts';
import type { ChoiceSpec, DateSpec, FieldSpec, ListSpec, NumberSpec, Values } from '../../src/tools/calc/types.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';

/** The sentinel day: typed into every date field, searched in every way a day can be written. */
const DAY = '2026-03-17';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Where in its range a field's sentinel falls: odd fractions, so none is a round number. */
const FRACTIONS = [0.9753, 0.8642, 0.7531, 0.6428, 0.5319, 0.4286, 0.3197, 0.2864, 0.1975, 0.1358, 0.0947];

/** The value at a fraction of a field's range (engine units), with no zero at the end, so the field shows what was typed. */
function at(spec: NumberSpec, fraction: number): number {
  const value = spec.min + Math.floor((spec.max - spec.min) * fraction);
  return value % 10 !== 0 ? value : value + 1 <= spec.max ? value + 1 : value - 1;
}

/**
 * Up to three values a number field takes, none used yet on the page: the one of the field's own slot first, then the
 * largest left (an area that must cover the doors and windows, a waist that must pass the neck).
 */
function candidates(spec: NumberSpec, slot: number, used: ReadonlySet<number>): number[] {
  const own = FRACTIONS[slot % FRACTIONS.length] ?? 0.5;
  const out: number[] = [];
  for (const fraction of [own, ...FRACTIONS.filter((other) => other !== own)]) {
    const value = at(spec, fraction);
    if (value < spec.min || value > spec.max || used.has(value) || out.includes(value)) continue;
    out.push(value);
    if (out.length === 3) break;
  }
  return out;
}

const decimalsOfSpec = (spec: NumberSpec): number => (spec.kind === 'dec' ? (spec.decimals ?? 0) : 0);

/** What a person types for a value: "287.53", "9.7", "47" (never a thousands separator). */
const typedOf = (value: number, decimals: number): string => (value / 10 ** decimals).toFixed(decimals);

const group = (whole: string, mark: string): string => whole.replace(/\B(?=(\d{3})+(?!\d))/g, mark);

/** Every form a typed number could take on its way out: as typed, grouped, with a decimal comma, in engine units, whole. */
function numberForms(value: number, decimals: number): string[] {
  const text = typedOf(value, decimals);
  const [whole = '', fraction = ''] = text.split('.');
  const forms = new Set([text, String(value), whole, group(whole, ',')]);
  if (fraction) {
    forms.add(`${whole},${fraction}`);
    forms.add(`${group(whole, ',')}.${fraction}`);
    forms.add(`${group(whole, '.')},${fraction}`);
  }
  return [...forms].filter((form) => form.length >= 3);
}

/** Every way the sentinel day could be written on its way out, and the day count and the time stamps it could turn into. */
function dateForms(iso: string): string[] {
  const [year = '', month = '', day = ''] = iso.split('-');
  const name = MONTHS[Number(month) - 1] ?? '';
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(day));
  return [
    iso,
    `${month}/${day}/${year}`,
    `${Number(month)}/${Number(day)}/${year}`,
    `${name} ${Number(day)}, ${year}`,
    `${name.slice(0, 3)} ${Number(day)}, ${year}`,
    `${day}/${month}/${year}`,
    `${year}/${month}/${day}`,
    `${year}${month}${day}`,
    String(dayOf(iso)),
    String(utc),
    String(utc / 1000),
  ];
}

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A form found with nothing glued to it. A long form (5 characters or more) only needs no digit before or after it, as in
 * money-privacy.spec.ts. A short one needs no letter or digit either (the rule of the PDF sentinels, DECISOES § 166): the
 * hashed names of the build ("/_astro/x8317Kq2.js") can hold three digits by chance, and a false alarm is as bad as a missed
 * leak. A short form that leaks with its key ("a0x=287") is still found, and its long form (in engine units) too.
 */
const pattern = (form: string): RegExp =>
  form.length >= 5 ? new RegExp(`(?<![0-9])${escape(form)}(?![0-9])`) : new RegExp(`(?<![A-Za-z0-9])${escape(form)}(?![A-Za-z0-9])`);

test('the sentinel search finds every form and ignores a number inside another one', () => {
  expect(numberForms(28_753, 2).sort()).toEqual(['28753', '287', '287,53', '287.53'].sort());
  expect(numberForms(243_753, 2).sort()).toEqual(['2,437.53', '2.437,53', '243753', '2437', '2437,53', '2437.53', '2,437'].sort());
  expect(numberForms(97, 1).sort()).toEqual(['9,7', '9.7'].sort());
  expect(numberForms(117, 0)).toEqual(['117']);
  expect(dateForms('2026-03-17')).toEqual(
    expect.arrayContaining(['2026-03-17', '03/17/2026', '3/17/2026', 'March 17, 2026', '20260317', String(dayOf('2026-03-17'))]),
  );
  const found = (form: string, text: string) => pattern(form).test(text);
  expect(found('28753', '"page_location":"/x/#v=1&a0x=28753"')).toBe(true);
  expect(found('287.53', 'GET https://x.test/?x=287.53')).toBe(true);
  expect(found('287', 'a0x=287&')).toBe(true);
  expect(found('287', '/_astro/island.Cx287q.js')).toBe(false);
  expect(found('28753', 'id 1287531')).toBe(false);
  expect(found('March 17, 2026', 'due: March 17, 2026.')).toBe(true);
  expect(found('2026-03-17', 'd=2026-03-17&')).toBe(true);
  // The candidates sit in the range, with no zero at the end, and a field never takes a value another one already has.
  const spec: NumberSpec = { kind: 'dec', key: 'x', decimals: 2, min: 1, max: 30_000 };
  const used = new Set<number>();
  for (let slot = 0; slot < FRACTIONS.length - 3; slot += 1) {
    const values = candidates(spec, slot, used);
    expect(values.length).toBe(3);
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(spec.min);
      expect(value).toBeLessThanOrEqual(spec.max);
      expect(value % 10).not.toBe(0);
    }
    expect(values.some((value) => used.has(value))).toBe(false);
    used.add(values[0] ?? 0);
  }
  // A short range gives what it has: feet of height (3 to 8).
  expect(candidates({ kind: 'int', key: 'ft', min: 3, max: 8 }, 0, new Set()).length).toBeGreaterThan(0);
});

/** One field on screen: its id, its spec, and where its value lives in the state (a list row's item, or a key). */
interface OnScreen {
  id: string;
  spec: NumberSpec | DateSpec;
  read: (values: Values) => number | string;
  write: (values: Values, value: number | string) => void;
}

/** The number and date fields on screen for these values, list rows included (an item a row's shape hides is not). */
function fieldsOnScreen(specs: readonly FieldSpec[], values: Values): OnScreen[] {
  const out: OnScreen[] = [];
  for (const spec of specs) {
    if (!visible(spec, values)) continue;
    if (spec.kind === 'list') {
      const rows = values[spec.key] as Record<string, number>[];
      rows.forEach((row, index) => {
        for (const item of spec.item) {
          if (spec.pick?.hide?.[item.key]?.includes(row[spec.pick.key] ?? 0)) continue;
          out.push({
            id: `fo-calc-${spec.key}${index}${item.key}`,
            spec: item,
            read: (state) => (state[spec.key] as Record<string, number>[])[index]?.[item.key] ?? 0,
            write: (state, value) => {
              const list = state[spec.key] as Record<string, number>[];
              state[spec.key] = list.map((entry, at) => (at === index ? { ...entry, [item.key]: Number(value) } : entry));
            },
          });
        }
      });
    } else if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec' || spec.kind === 'date') {
      out.push({
        id: `fo-calc-${spec.key}`,
        spec,
        read: (state) => state[spec.key] as number | string,
        write: (state, value) => {
          state[spec.key] = value;
        },
      });
    }
  }
  return out;
}

/** The choices that show or hide other fields: each one is switched through its options, one per phase. */
function switches(specs: readonly FieldSpec[]): ChoiceSpec[] {
  const keys = new Set(specs.flatMap((spec) => (spec.when ? [spec.when.key] : [])));
  return specs.filter((spec): spec is ChoiceSpec => (spec.kind === 'choice' || spec.kind === 'select') && keys.has(spec.key));
}

async function choose(page: Page, spec: ChoiceSpec, option: string): Promise<void> {
  if (spec.kind === 'choice') await page.locator('.fo-seg__opt', { has: page.locator(`input[name="fo-calc-${spec.key}"][value="${option}"]`) }).click();
  else await page.locator(`#fo-calc-${spec.key}`).selectOption(option);
}

async function everywhere(page: Page): Promise<string> {
  return page.evaluate(() => {
    const store = (storage: Storage) => Object.keys(storage).map((key) => `${key}=${storage.getItem(key)}`).join(';');
    return [document.title, location.search, store(localStorage), store(sessionStorage), document.cookie].join('\n');
  });
}

for (const id of LIFE_CALC_IDS) {
  const own = LIFE_CALC_PAGES[id];
  test(`${own.path}: no typed measure or date leaves the device`, async ({ page, context, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
    const outgoing: string[] = [];
    const hosts = new Set<string>();
    context.on('request', (request) => {
      outgoing.push(`${request.method()} ${request.url()}\n${request.postData() ?? ''}`);
      const url = new URL(request.url());
      if (url.protocol !== 'blob:' && url.protocol !== 'data:' && url.protocol !== 'about:') hosts.add(url.origin);
    });
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
    expect((await page.goto(own.path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);

    const def = DEFS[id];
    const values: Values = structuredClone(def.initial);
    // F13b (DECISOES § C-2): the Download PDF is in the card, and only while there is a result to save (F7 f-10).
    const download = page.locator('.fo-rhero .fo-btn--download');
    const frames = () => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    await expect(download, 'o exemplo da página tem resultado').toBeEnabled();
    /** Every form of every sentinel typed, with the field it went into (for the failure message). */
    const typed: { field: string; forms: string[] }[] = [];
    /** The fields whose sentinel stayed in (the ones the copied link carries), with the value. */
    const kept = new Map<string, OnScreen & { value: number | string }>();
    const filled = new Set<string>();
    const names: string[] = [];
    const seen: string[] = [];
    const record = async () => {
      seen.push(JSON.stringify(await dataLayer(page)), await everywhere(page));
    };

    // The square footage: one area of each shape (Add an area comes after the result, DECISOES § 268).
    for (const spec of def.fields) {
      if (spec.kind !== 'list') continue;
      const list: ListSpec = spec;
      const wanted = Math.min(list.max, Math.max(2, list.pick?.options.length ?? 2));
      while ((values[list.key] as Record<string, number>[]).length < wanted) {
        await page.locator(`#fo-calc-${list.key}-add`).click();
        values[list.key] = [...(values[list.key] as Record<string, number>[]), { ...list.blank }];
      }
      if (list.pick) {
        const pick = list.pick;
        const rows = values[list.key] as Record<string, number>[];
        for (let index = 0; index < rows.length; index += 1) {
          const option = index % pick.options.length;
          await page.locator(`#fo-calc-${list.key}${index}${pick.key}`).selectOption(String(option));
          values[list.key] = (values[list.key] as Record<string, number>[]).map((row, at) => (at === index ? { ...row, [pick.key]: option } : row));
        }
      }
    }

    const toggles = switches(def.fields);
    const phases = Math.max(1, ...toggles.map((spec) => spec.options.length));
    let slot = 0;
    /** The values already typed on the page: no two fields share a sentinel. */
    const used = new Set<number>();
    for (let phase = 0; phase < phases; phase += 1) {
      for (const spec of toggles) {
        const option = spec.options[phase % spec.options.length] ?? '';
        if (values[spec.key] !== option) {
          await choose(page, spec, option);
          values[spec.key] = option;
        }
      }
      for (const field of fieldsOnScreen(def.fields, values)) {
        if (filled.has(field.id)) continue;
        filled.add(field.id);
        const input = page.locator(`#${field.id}`);
        await expect(input, `${field.id} na tela`).toHaveCount(1);
        if (field.spec.kind === 'date') {
          await input.fill(DAY);
          await input.blur();
          typed.push({ field: field.id, forms: dateForms(DAY) });
          field.write(values, DAY);
          await expect(input).toHaveValue(DAY);
          kept.set(field.id, { ...field, value: DAY });
          continue;
        }
        const spec = field.spec;
        const decimals = decimalsOfSpec(spec);
        const before = field.read(values);
        const shown = await input.inputValue();
        // The field's own sentinel first; if the result turns into a problem (the doors and windows cover the walls, a body
        // fat out of the formula's range), the PDF and the CSV are off, so the next one goes in. If none gives a result, the
        // field goes back to its value. Every sentinel typed is searched for.
        let left: number | null = null;
        for (const value of candidates(spec, slot, used)) {
          used.add(value);
          await input.fill(typedOf(value, decimals));
          await input.blur();
          typed.push({ field: field.id, forms: numberForms(value, decimals) });
          field.write(values, value);
          await frames();
          if ((await download.count()) > 0) {
            left = value;
            break;
          }
        }
        slot += 1;
        if (left === null) {
          await input.fill(shown);
          await input.blur();
          field.write(values, before);
        } else kept.set(field.id, { ...field, value: left });
      }
      await expect(download, `fase ${phase}: há resultado para exportar`).toBeEnabled();
      // The table is the result on these pages: open, with no Show button (CalcView.open, F7).
      await expect(page.locator('#fo-schedule-table table')).toBeVisible();
      await expect(page.locator('#fo-calc-schedule button[aria-controls]')).toHaveCount(0);
      for (const button of [page.locator('.fo-export .fo-btn').nth(0), download]) {
        const saved = page.waitForEvent('download');
        await button.click();
        names.push((await saved).suggestedFilename());
      }
      await record();
    }
    expect(typed.length, 'sentinelas digitadas').toBeGreaterThan(0);
    expect(names).toEqual(Array.from({ length: phases }, () => [`${own.file}.csv`, `${own.file}.pdf`]).flat());

    await page.locator('.fo-export .fo-btn').nth(1).click();
    await expect(page.locator('.fo-export-wrap [role="status"]')).toHaveText(enShared.island.copied);
    const copied = await page.evaluate(() => (window as unknown as { foCopied?: string }).foCopied ?? (document.querySelector<HTMLInputElement>('#fo-calc-link')?.value ?? ''));
    expect(copied).toMatch(/#v=1&/);
    expect(copied).not.toContain('?');
    expect(new URL(copied).search).toBe('');
    expect(page.url()).not.toContain('#');
    await record();
    // A chip leads to another calculator; then, from a blank page (the same # on the same page does not reload), the
    // copied link opens with the values after the #.
    await page.locator('.fo-calc__next a').first().click();
    await page.waitForLoadState('load');
    expect(new URL(page.url()).search).toBe('');
    await record();
    await page.goto('about:blank');
    await page.goto(copied);
    await hydrated(page);
    expect(new URL(page.url()).search).toBe('');
    // The link was read: every field of the last state shows its sentinel in the page's format.
    for (const field of fieldsOnScreen(def.fields, values)) {
      const entry = kept.get(field.id);
      if (!entry) continue;
      const shown = entry.spec.kind === 'date' ? String(entry.value) : display(entry.spec.kind, Number(entry.value), 'en', decimalsOfSpec(entry.spec));
      await expect(page.locator(`#${field.id}`), `${field.id} lido do link`).toHaveValue(shown);
    }
    await record();

    // page_location goes without the # (DECISOES § 8).
    for (const entry of await dataLayer(page)) if (entry[0] === 'config') expect(JSON.stringify(entry[2] ?? {})).not.toContain('#');
    expect([...hosts], 'requisições para outro host').toEqual([origin]);
    const haystack = [...outgoing, ...seen, ...names].join('\n');
    const found: string[] = [];
    for (const { field, forms } of typed) for (const form of forms) if (pattern(form).test(haystack)) found.push(`${field}: ${form}`);
    expect(found, 'sentinelas fora do aparelho').toEqual([]);
    // The copied link is where the values are: each one kept, in engine units or as the day.
    for (const [field, entry] of kept) expect(copied, `${field} no link copiado`).toContain(`=${String(entry.value)}`);
  });
}
