// The calculator definitions against the oracle and against their own texts (F4; DECISOES § 110 to § 116): the
// example each page starts with is the oracle's page-example case; every field's error says its range; every
// view has its texts; the scenario link goes and comes back, and anything outside a field's range is ignored;
// the CSV of a schedule is the oracle's schedule, cent for cent. Since the F6 the same holds for the eight calculators
// adapted to Brazil (in Portuguese) and the five Spanish pages, each in the format of its language (DECISOES § 226). Since the
// F7 the same holds for the 11 home and health calculators (English only): their measures say their range with their
// decimals, the US and the metric examples are both oracle cases, and a date or a row's menu goes and comes back in the link.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatScaled, type NumberLang } from '../../src/calc/parse.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, LIFE_CALC_IDS, moneyPage, type AnyCalcId } from '../../src/tools/calc/registry.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import { calcTexts, panelData } from '../../src/tools/calc/page.ts';
import { csvText } from '../../src/tools/calc/exports.ts';
import { DECIMALS, inRange, linkHash, problems, readLink } from '../../src/tools/calc/form.ts';
import { viewOf } from '../../src/tools/calc/store.ts';
import type { FieldSpec, NumberSpec, Values } from '../../src/tools/calc/types.ts';

interface Case {
  id: string;
  source: string;
  full: boolean;
  input: unknown;
  expected: Record<string, unknown>;
}
const fixture = (id: string): Case[] => (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: Case[] }).cases;

/** Every number field of a definition, the list items included. */
function numberSpecs(specs: readonly FieldSpec[]): NumberSpec[] {
  return specs.flatMap((spec) => (spec.kind === 'list' ? spec.item : spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec' ? [spec] : []));
}

/** How a range bound reads in an error of the page's language: $10,000 or $0.01, 40%, 1,200; R$ 10.000 in Portuguese; a measure as 0.01 or 2,500 (F7). */
function bound(spec: NumberSpec, value: number, lang: Lang = 'en'): string {
  const l = lang as NumberLang;
  if (spec.kind === 'money') return `${lang === 'pt' ? 'R$ ' : '$'}${formatScaled(value, 2, l, { min: value % 100 === 0 ? 0 : 2 })}`;
  if (spec.kind === 'rate') return formatScaled(value, 4, l);
  if (spec.kind === 'dec') return formatScaled(value, spec.decimals ?? 0, l);
  return formatScaled(value, 0, l);
}

/** Every calculator page with its language: the 18 English money ones, the 8 Brazilian ones, the 5 Spanish versions and the 11 home and health ones (F7). */
const PAGES: [AnyCalcId, Lang][] = [
  ...CALC_PAGE_IDS.map((id): [AnyCalcId, Lang] => [id, 'en']),
  ...BR_CALC_IDS.map((id): [AnyCalcId, Lang] => [id, 'pt']),
  ...CALC_PAGE_IDS.map((id): [AnyCalcId, Lang] => [id, 'es']),
  ...LIFE_CALC_IDS.map((id): [AnyCalcId, Lang] => [id, 'en']),
];
/** Each definition once, with the language of its first page. */
const DEF_IDS: [AnyCalcId, Lang][] = PAGES.filter(([id], index) => PAGES.findIndex(([other]) => other === id) === index);

describe('the calculator definitions', () => {
  // The 18 of the F4, since the F6 the 8 adapted to Brazil (DECISOES § 226), and since the F7 the 11 home and health ones.
  it('cover the 37 pages of the three registries', () => {
    expect(Object.keys(DEFS).sort()).toEqual([...CALC_PAGE_IDS, ...BR_CALC_IDS, ...LIFE_CALC_IDS].sort());
    for (const [id] of DEF_IDS) expect(DEFS[id].id).toBe(id);
  });

  it("start every page from the oracle's page-example case, and the engine gives that case's result", () => {
    for (const [id] of DEF_IDS) {
      const def = DEFS[id];
      const example = fixture(id).find((item) => item.id === 'page-example');
      expect(example, id).toBeDefined();
      expect(def.toInput(def.initial), id).toEqual(example?.input);
      expect(problems(def.fields, def.initial), id).toEqual({});
      for (const spec of numberSpecs(def.fields)) {
        const values = spec.key in def.initial ? [Number(def.initial[spec.key])] : [];
        for (const value of values) expect(inRange(spec, value), `${id} ${spec.key}`).toBe(true);
      }
    }
  });

  it('say the range of every number field in its error, in the words of the page', () => {
    for (const [id, lang] of PAGES) {
      const texts = calcTexts(id, lang).panel.fields;
      for (const spec of numberSpecs(DEFS[id].fields)) {
        const error = texts[spec.key]?.error ?? '';
        expect(error, `${id} ${lang} ${spec.key}`).toContain(bound(spec, spec.min, lang).replace('-', '−'));
        expect(error, `${id} ${lang} ${spec.key}`).toContain(bound(spec, spec.max, lang));
      }
      for (const spec of DEFS[id].fields) {
        if (spec.kind === 'down') {
          expect(texts[spec.key]?.over, id).toBeTruthy();
          expect(texts[spec.percentKey]?.error, `${id} ${lang}`).toMatch(/0 (?:to|a) 100\u00a0?%/);
        }
        if ((spec.kind === 'money' || spec.kind === 'int') && spec.atMost) expect(texts[spec.key]?.over, `${id} ${spec.key}`).toBeTruthy();
      }
    }
  });

  it('render every view from its own texts, with no placeholder left', () => {
    for (const [id, lang] of PAGES) {
      const def = DEFS[id];
      const data = panelData(id, lang);
      const view = viewOf(def, data, def.initial);
      const said = [view.hero.label, view.hero.value, ...view.hero.sentence.map((part) => (typeof part === 'string' ? part : part.b))].join(' ');
      expect(said, id).not.toMatch(/\{\w+\}|undefined|NaN/);
      expect(view.summary.length, id).toBeGreaterThan(0);
      expect(view.premises.length, id).toBeGreaterThan(1);
      const table = view.table();
      expect(table.head.length, id).toBeGreaterThan(1);
      for (const row of table.rows) expect(row.length, id).toBe(table.head.length);
      expect(moneyPage(id, lang)?.file, id).not.toMatch(/\d{3,}/);
    }
  });

  // Review F4 (COR-3 and ANU-2): every number field at the ends of its range, one at a time, and the savings goal
  // that outgrew 10^15 cents. Whatever the view says (a result or a problem) and whatever goes to the PDF summary
  // has its amounts filled in and no number in exponent notation.
  it('render the ends of every range and the error states with every amount filled in', () => {
    const withProblem = new Set<string>();
    const check = (id: string, values: Values, lang: Lang = 'en') => {
      const def = DEFS[id as keyof typeof DEFS];
      if (Object.keys(problems(def.fields, values)).length > 0) return;
      const view = viewOf(def, panelData(id as keyof typeof DEFS, lang), values);
      if (view.problem) withProblem.add(id);
      const said = [
        view.hero.value,
        view.problem ?? '',
        ...view.hero.sentence.map((part) => (typeof part === 'string' ? part : part.b)),
        ...view.summary.flat(),
        view.split ? `${view.split.a.cents} ${view.split.b.cents}` : '',
      ].join(' | ');
      expect(said, `${id} ${JSON.stringify(values)}`).not.toMatch(/\{\w+\}|undefined|NaN|e\+|Infinity/);
      if (view.split) for (const cents of [view.split.a.cents, view.split.b.cents]) expect(Number.isSafeInteger(cents), id).toBe(true);
    };
    for (const [id, lang] of DEF_IDS) {
      const def = DEFS[id];
      const check1 = (values: Values) => check(id, values, lang);
      for (const spec of def.fields) {
        if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec') {
          for (const value of [spec.min, spec.max]) check1({ ...def.initial, [spec.key]: value });
        } else if (spec.kind === 'date') {
          // F7: the first and the last day the field takes, and a pregnancy whose today is before or long after them.
          for (const day of [spec.min, spec.max]) check1({ ...def.initial, [spec.key]: day });
          if (def.today) for (const today of ['1999-01-01', '2026-11-02', '2120-01-01']) check1({ ...def.initial, today });
        } else if (spec.kind === 'list') {
          // Each item of the first debt at both ends (second pass of the review: the list was left out).
          const rows = def.initial[spec.key] as Record<string, number>[];
          for (const item of spec.item) for (const value of [item.min, item.max]) check1({ ...def.initial, [spec.key]: rows.map((row, index) => (index === 0 ? { ...row, [item.key]: value } : row)) });
        } else if (spec.kind === 'down') {
          // The down payment in percent and in dollars, at both ends.
          for (const rate of [0, 1_000_000]) check1({ ...def.initial, [spec.unitKey]: 'percent', [spec.percentKey]: rate });
          for (const cents of [0, Number(def.initial[spec.of])]) check1({ ...def.initial, [spec.unitKey]: 'amount', [spec.key]: cents });
        } else if (spec.kind === 'choice' || spec.kind === 'select') {
          for (const option of spec.options) check1({ ...def.initial, [spec.key]: option });
        }
      }
    }
    check('savings-goal-calculator', { g: 10_000_000_000, s: 10_000_000_000, r: 400_000, md: 'months', m: 1200, dep: 0 });
    check('savings-goal-calculator', { g: 2_000_000, s: 0, r: 0, md: 'deposit', m: 36, dep: 0 });
    check('credit-card-payoff-calculator', { b: 650_000, r: 229_900, md: 'payment', pay: 1_000, m: 24 });
    check('compound-interest-calculator', { i: 1_000_000_000, m: 100_000_000, r: 400_000, y: 80, c: '365', tm: 'begin' });
    // The Brazilian error states: a balance past 10^15 cents, IOF and fees up front above the credit, nothing to finance.
    check('br-compound-interest', { i: 1_000_000_000, a: 100_000_000, ry: 600_000, rm: 50_000, u: 'month', n: 600 }, 'pt');
    check('br-personal-loan', { a: 10_000, n: 12, r: 20_000, iof: 500_000, tf: 0, c: 'upfront' }, 'pt');
    check('br-sac-price', { p: 50_000_000, du: 'percent', d: 0, dp: 1_000_000, n: 360, r: 110_000, tr: 0, f: 0 }, 'pt');
    expect([...withProblem].sort()).toEqual(
      expect.arrayContaining(['br-compound-interest', 'br-personal-loan', 'br-sac-price', 'compound-interest-calculator', 'credit-card-payoff-calculator', 'savings-goal-calculator']),
    );
  });
});

describe('the home and health definitions (F7)', () => {
  it('start the metric system from its own oracle example, and keep each system\'s values apart (DECISOES § 261)', () => {
    for (const id of ['bmi-calculator', 'calorie-calculator', 'body-fat-calculator'] as const) {
      const def = DEFS[id];
      const metric = fixture(id).find((item) => item.id === 'page-example-metric');
      expect(metric, id).toBeDefined();
      expect(def.toInput({ ...def.initial, u: 'metric' }), id).toEqual(metric?.input);
      expect(def.initial['u'], id).toBe('us');
      // The US and the metric fields are different keys: switching never touches the other system's values.
      const keys = (system: string) => def.fields.filter((spec) => spec.when?.key === 'u' && spec.when.is === system).map((spec) => spec.key);
      expect(keys('us').filter((key) => keys('metric').includes(key)), id).toEqual([]);
    }
  });

  it('carry a date and a row menu in the link, and ignore a day that is not real or is out of range (DECISOES § 262)', () => {
    const due = DEFS['due-date-calculator'];
    expect(readLink('#v=1&m=ivf5&d=2027-02-28', due.fields, due.initial)).toEqual({ ...due.initial, m: 'ivf5', d: '2027-02-28' });
    for (const bad of ['2027-02-29', '1999-12-31', '2100-01-01', '2027-2-3', 'March 17, 2026']) {
      expect(readLink(`#v=1&d=${encodeURIComponent(bad)}`, due.fields, due.initial)['d'], bad).toBe(due.initial['d']);
    }
    expect(linkHash(due.fields, due.initial)).not.toContain('today');
    const area = DEFS['square-footage-calculator'];
    expect(readLink('#v=1&a0s=2&a0x=1000&a0y=1000', area.fields, area.initial)['a']).toEqual([{ s: 2, x: 1000, y: 1000 }]);
    expect(readLink('#v=1&a0s=3&a0x=1000&a0y=1000', area.fields, area.initial)['a']).toEqual(area.initial['a']);
  });

  it('have the CDC category of every BMI in the oracle, in words', () => {
    const def = DEFS['bmi-calculator'];
    const data = panelData('bmi-calculator', 'en');
    for (const item of fixture('bmi-calculator')) {
      const expected = item.expected as { bmi: number; category: string };
      const input = item.input as { unit: string; feet: number; inches: number; pounds: number; cm: number; kg: number };
      const view = viewOf(def, data, { ...def.initial, u: input.unit, ft: input.feet, in: input.inches, lb: input.pounds, cm: input.cm, kg: input.kg });
      expect(view.summary.find(([label]) => label === 'CDC category')?.[1], item.id).toBe(data.texts.view[`cat-${expected.category}`]);
    }
  });

  it('never let the Oli cheer a health result, and keep the violet category on the home and health pages', () => {
    for (const id of LIFE_CALC_IDS) {
      const data = panelData(id, 'en');
      expect(data.cat, id).toBe('home');
      expect(data.cheer, id).toBe(!['bmi-calculator', 'calorie-calculator', 'ovulation-calculator', 'body-fat-calculator', 'due-date-calculator'].includes(id));
    }
    expect(panelData('mortgage-calculator', 'en')).toEqual(expect.objectContaining({ cheer: true, cat: 'money' }));
  });
});

// ---- review F7 (docs/relatorios/REVISAO-F7.md, DECISOES § 274) ------------------------------------------------------

describe('after the review F4-F7', () => {
  it('the CET of the Brazilian loans never comes out in exponent: past 10,000,000 % a year it is a problem (h-2)', () => {
    const cases = [
      // Values inside the ranges of the fields (second pass, s-5): the smallest credit and the costs at their top.
      ['br-personal-loan', { ...DEFS['br-personal-loan'].initial, a: 10_000, n: 120, r: 200_000, iof: 50_000_000, tf: 50_000_000, c: 'financed' }],
      ['br-vehicle-loan', { ...DEFS['br-vehicle-loan'].initial, p: 100_000, e: 0, n: 96, r: 150_000, iof: 50_000_000, tf: 50_000_000, c: 'financed' }],
    ] as const;
    for (const [id, values] of cases) {
      const def = DEFS[id];
      expect(problems(def.fields, values as Values), id).toEqual({});
      for (const spec of def.fields) if (spec.kind === 'money' || spec.kind === 'int' || spec.kind === 'rate') expect(inRange(spec, Number(values[spec.key as keyof typeof values])), `${id} ${spec.key}`).toBe(true);
      const view = viewOf(def, panelData(id, 'pt'), values as Values);
      expect(view.problem, id).toBeDefined();
      expect(JSON.stringify(view), id).not.toMatch(/e\+/);
      expect(view.placard.n, id).not.toMatch(/\d/);
    }
    // The example of each page still shows its CET.
    for (const id of ['br-personal-loan', 'br-vehicle-loan'] as const) expect(viewOf(DEFS[id], panelData(id, 'pt'), DEFS[id].initial as Values).problem, id).toBeUndefined();
  });
});

describe('after the review F7', () => {
  it('Body fat: measures the equation cannot take show a dash, never "0 %" as a body fat (f-7)', () => {
    const def = DEFS['body-fat-calculator'];
    const data = panelData('body-fat-calculator', 'en');
    for (const values of [{ ...def.initial, nk: 300, wa: 200 }, { ...def.initial, sx: 'male', nk: 300, wa: 200 }]) {
      const view = viewOf(def, data, values);
      expect(view.problem).toBeDefined();
      expect(view.hero.value).toBe('-');
      expect(view.hero.unit).toBeUndefined();
      expect(view.placard.n).not.toMatch(/\d/);
    }
  });

  it('Calorie and Body fat: the sentence of the result says which formula made the number (g-3)', () => {
    for (const id of ['calorie-calculator', 'body-fat-calculator'] as const) {
      const def = DEFS[id];
      const data = panelData(id, 'en');
      for (const sex of ['female', 'male'] as const) {
        const parts = viewOf(def, data, { ...def.initial, sx: sex }).hero.sentence;
        const bold = parts.flatMap((part) => (typeof part === 'string' ? [] : [part.b]));
        expect(bold, `${id} ${sex}`).toContain(sex);
      }
    }
  });

  it('the privacy policy says the copied link carries the choices too, in the three languages (b-1)', async () => {
    // The links of the health pages carry choices besides numbers and dates: the units, the sex, how the due date is counted.
    const choices = LIFE_CALC_IDS.flatMap((id) => {
      const def = DEFS[id];
      return linkHash(def.fields, def.initial)
        .slice(1)
        .split('&')
        .map((pair) => pair.split('=')[1] ?? '')
        .filter((value) => !/^-?\d+$/.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value));
    });
    expect(choices).toEqual(expect.arrayContaining(['us', 'female', 'lmp']));
    const said = { en: /Copy link carries[^.]*choices/, pt: /link que elas copiam leva[^.]*escolhas/, es: /enlace que copian lleva[^.]*opciones/ };
    for (const lang of ['en', 'pt', 'es'] as const) {
      const privacy = (await import(`../../src/i18n/${lang}/privacy.ts`)).default as { sections: { paragraphs: string[] }[] };
      expect(privacy.sections.flatMap((section) => section.paragraphs).join(' '), lang).toMatch(said[lang]);
    }
    expect(calcTexts('calorie-calculator').privacyNote).toMatch(/sex the formula uses/);
    expect(calcTexts('body-fat-calculator').privacyNote).toMatch(/sex the formula uses/);
    expect(calcTexts('due-date-calculator').privacyNote).toMatch(/how it is counted/);
  });
});

describe('the scenario link', () => {
  it('goes and comes back with the same values on every page', () => {
    for (const [id] of DEF_IDS) {
      const def = DEFS[id];
      const hash = linkHash(def.fields, def.initial);
      expect(hash, id).toMatch(/^#v=1&/);
      // Today's day (the due date, F7) is never in the link: the island reads it from the device.
      const carried = Object.fromEntries(Object.entries(def.initial).filter(([key]) => key !== 'today'));
      expect(readLink(hash, def.fields, {} as Values), id).toEqual(expect.objectContaining(carried));
      expect(hash, id).not.toMatch(/[?\s]/);
    }
  });

  it('ignores without a word what is outside a range, unknown, malformed or of another version', () => {
    const def = DEFS['mortgage-calculator'];
    const base = def.initial;
    const read = (hash: string) => readLink(hash, def.fields, base);
    expect(read('#v=1&p=99999999999')).toEqual(base); // above $20,000,000
    expect(read('#v=1&p=12.5')).toEqual(base); // not a whole number of cents
    expect(read('#v=1&r=410000')).toEqual(base); // 41% is above the 40% of the field
    expect(read('#v=1&du=pounds&t=0')).toEqual(base);
    expect(read('#v=2&p=40000000')).toEqual(base);
    expect(read('#p=40000000')).toEqual(base);
    expect(read('#v=1&zz=1&p=40000000')).toEqual({ ...base, p: 40_000_000 });
    // A pair the link breaks (a down payment above the price) keeps the values of the page.
    expect(read('#v=1&du=amount&d=50000000')).toEqual(base);
  });

  it('reads the debts of a list, row by row, and stops at a broken row', () => {
    const def = DEFS['debt-payoff-calculator'];
    const hash = '#v=1&d0b=100000&d0r=200000&d0m=2500&d1b=50000&d1r=150000&x=0';
    expect(readLink(hash, def.fields, def.initial)['d']).toEqual([{ b: 100_000, r: 200_000, m: 2_500 }]);
  });

  it('keeps the units of the engine: cents for money, 1/10,000 of a point for a rate', () => {
    expect(DECIMALS).toEqual({ money: 2, rate: 4, int: 0 });
  });
});

describe('the CSV', () => {
  it('is the oracle schedule, cent for cent, read back from the file', () => {
    const def = DEFS['mortgage-calculator'];
    const view = viewOf(def, panelData('mortgage-calculator', 'en'), def.initial);
    const csv = csvText(view.table(), 'Year');
    expect(csv.startsWith('﻿Year,Payment,Amount,Principal,Interest,Balance\r\n')).toBe(true);
    const lines = csv.slice(1).trimEnd().split('\r\n').slice(1).map((line) => line.split(','));
    const oracle = fixture('mortgage-calculator').find((item) => item.id === 'design-system')?.expected['rows'] as number[][];
    expect(oracle).toHaveLength(360);
    expect(lines).toHaveLength(360);
    const cents = (text: string) => Math.round(Number(text) * 100);
    lines.forEach((line, index) => {
      const [k, payment, interest, principal, balance] = oracle[index] ?? [];
      expect(line[0], `row ${index + 1}`).toBe(`Year ${Math.floor(index / 12) + 1}`);
      expect([Number(line[1]), cents(line[2] ?? ''), cents(line[3] ?? ''), cents(line[4] ?? ''), cents(line[5] ?? '')], `row ${index + 1}`).toEqual([
        k,
        payment,
        principal,
        interest,
        balance,
      ]);
    });
  });

  it('quotes by RFC 4180 and never groups thousands', () => {
    const csv = csvText({ caption: 'c', head: ['Debt', 'Order'], rows: [[{ text: 'Debt 1, then "Debt 2"' }, { cents: 123_456_789 }]] }, 'Year');
    expect(csv).toBe('﻿Debt,Order\r\n"Debt 1, then ""Debt 2""",1234567.89\r\n');
  });

  // Review of the languages adjustment (C-5; DECISOES § 321): the Spanish CSV is written like the English one (decision 4).
  // The APR to APY table has its percents as text, and the no-break space of the Spanish screen went into the file
  // ("5.00 %"), which a spreadsheet does not read as a number.
  it('writes no no-break space on any Spanish money page, and the percents of the APR to APY glued as in English', () => {
    for (const id of CALC_PAGE_IDS) {
      const def = DEFS[id];
      const view = viewOf(def, panelData(id, 'es'), def.initial);
      const csv = csvText(view.table(), 'Año', 'es');
      expect(csv.includes('\u00A0'), `${id}: espaço sem quebra no CSV`).toBe(false);
    }
    const def = DEFS['apr-to-apy-calculator'];
    const rows = (lang: Lang) => csvText(viewOf(def, panelData('apr-to-apy-calculator', lang), def.initial).table(), 'Year', lang).slice(1).trimEnd().split('\r\n').slice(1);
    const es = rows('es');
    expect(es.length).toBeGreaterThan(3);
    for (const line of es) expect(line, line).toMatch(/,\d+\.\d{2}%$/);
    // The numbers are the English ones, cell for cell (the words of the compounding are in each language).
    expect(es.map((line) => line.split(',').at(-1))).toEqual(rows('en').map((line) => line.split(',').at(-1)));
    // The screen keeps the Spanish percent (§ 213): only the file glues it.
    expect(viewOf(def, panelData('apr-to-apy-calculator', 'es'), def.initial).table().rows[0]?.[1]).toEqual({ text: expect.stringMatching(/\d %$/) });
  });
});

// Review of the languages adjustment (C-3; DECISOES § 321): a new Spanish page says a count of one in the singular. The
// English texts are as they were (PENDENCIAS F4 COR-6 keeps "for 1 years" and "After 1 payments" for a run of their own).
describe('the singular of the new Spanish pages', () => {
  const sentence = (id: AnyCalcId, values: Values, lang: Lang = 'es'): string =>
    viewOf(DEFS[id], panelData(id, lang), { ...DEFS[id].initial, ...values }).hero.sentence.map((part) => (typeof part === 'string' ? part : part.b)).join('');

  it('the simple interest says "1 año", "1 mes" and "1 día", and the plural from 2 on (and for 0)', () => {
    expect(sentence('simple-interest-calculator', { u: 'years', ty: 1 })).toContain('durante 1 año gana');
    expect(sentence('simple-interest-calculator', { u: 'months', tmo: 1 })).toContain('durante 1 mes gana');
    expect(sentence('simple-interest-calculator', { u: 'days', td: 1 })).toContain('durante 1 día gana');
    expect(sentence('simple-interest-calculator', { u: 'years', ty: 2 })).toContain('durante 2 años gana');
    expect(sentence('simple-interest-calculator', { u: 'months', tmo: 0 })).toContain('durante 0 meses gana');
    expect(sentence('simple-interest-calculator', { u: 'days', td: 365 })).toContain('durante 365 días gana');
    // The heading of the table keeps the plural of the unit ("Tiempo, en años").
    const view = viewOf(DEFS['simple-interest-calculator'], panelData('simple-interest-calculator', 'es'), { ...DEFS['simple-interest-calculator'].initial, ty: 1 });
    expect(view.table().head[0]).toBe('Tiempo, en años');
    // The English page writes as before.
    expect(sentence('simple-interest-calculator', { u: 'years', ty: 3 }, 'en')).toContain('for 3 years earns');
  });

  // B5: the two rates of the 15 vs 30-year page were labelled "A 15 años" and "A 30 años", so the field, its accessible name
  // and the "Lo que escribes" list never said it was a rate. A field whose error asks for a rate says "tasa" in its label.
  it('labels every rate field of the Spanish pages with "tasa"', () => {
    const unnamed: string[] = [];
    for (const id of CALC_PAGE_IDS) {
      for (const [key, field] of Object.entries(calcTexts(id, 'es').panel.fields)) {
        if (/\btasa\b/i.test(field.error) && !/\btasa\b/i.test(field.label)) unnamed.push(`${id} ${key}: ${field.label}`);
      }
    }
    expect(unnamed).toEqual([]);
  });

  it('the extra payments and the biweekly payments say "1 mes" saved in their summary, and the plural otherwise', () => {
    const saved = (id: AnyCalcId, values: Values): string =>
      viewOf(DEFS[id], panelData(id, 'es'), { ...DEFS[id].initial, ...values }).summary.find(([label]) => label === 'Meses ahorrados')?.[1] ?? '';
    // The smallest extra a month that ends the loan of the example one month sooner: found by walking up from $1.
    let extra = 100;
    while (extra < 100_000 && saved('mortgage-calculator-extra-payments', { em: extra }) === '0 meses') extra += 100;
    expect(saved('mortgage-calculator-extra-payments', { em: extra })).toBe('1 mes');
    expect(saved('mortgage-calculator-extra-payments', { em: extra + 10_000 })).toMatch(/^(?:[2-9]|\d{2,}) meses$/);
    expect(saved('mortgage-calculator-extra-payments', {})).toMatch(/^\d+ meses$/);
    expect(saved('mortgage-calculator-biweekly', {})).toMatch(/^\d+ meses$/);
  });

  it('the balloon payment never puts a count before "pagos": 0, 1 and 83 regular payments read the same way', () => {
    for (const bm of [1, 2, 84]) {
      const said = sentence('loan-amortization-calculator-balloon-payment', { bm });
      expect(said, `bm ${bm}`).not.toMatch(/\d+ pagos/);
      expect(said, `bm ${bm}`).toContain(`vence con el pago ${bm},`);
    }
  });
});

// Review F4: what the texts and the views say in the cases the lenses found.
describe('after the review', () => {
  it('Extra payments: an extra too small to end the loan sooner still says what it saves (COR-8)', () => {
    const def = DEFS['mortgage-calculator-extra-payments'];
    const view = viewOf(def, panelData('mortgage-calculator-extra-payments', 'en'), { ...def.initial, em: 100 });
    const sentence = view.hero.sentence.map((part) => (typeof part === 'string' ? part : part.b)).join('');
    expect(sentence).not.toMatch(/Without an extra payment/);
    expect(sentence).toMatch(/you save \$\d/);
  });

  it('Personal loan: the FAQ way to enter a fee added to the balance gives the true APR (COR-2)', () => {
    const faq = calcTexts('personal-loan-calculator').faq.map((item) => item.a).join(' ');
    expect(faq).toContain('enter the whole balance, fee included, as the amount, and the fee as a percent of that balance');
    // $15,000 received, $750 of fee added: a $15,750 balance at 11.5% for 36 months. The true APR solves
    // 15,000 = payment × (1 − (1 + i)^−36) / i, worked out here by bisection, apart from the engine.
    const view = viewOf(DEFS['personal-loan-calculator'], panelData('personal-loan-calculator', 'en'), { a: 1_575_000, r: 115_000, m: 36, f: Math.round((750 / 15_750) * 1_000_000) });
    const payment = Number((view.summary.find(([label]) => /monthly payment/i.test(label))?.[1] ?? '').replace(/[$,]/g, ''));
    let lo = 0;
    let hi = 1;
    for (let step = 0; step < 200; step += 1) {
      const i = (lo + hi) / 2;
      if ((payment * (1 - (1 + i) ** -36)) / i > 15_000) lo = i;
      else hi = i;
    }
    const apr = Math.round(lo * 12 * 10_000) / 100;
    const shown = view.summary.find(([label]) => label === 'APR')?.[1];
    expect(shown).toBe(`${apr}%`);
    expect(apr).toBeGreaterThan(14.5);
  });

  it('Biweekly: the monthly rule of interest is said as the comparison it is (ANU-4)', () => {
    const premises = calcTexts('mortgage-calculator-biweekly').panel.premises;
    expect(premises.filter((premise) => /^Interest is charged once a month/.test(premise))).toEqual([]);
    expect(premises.some((premise) => premise.startsWith('The monthly loan it is compared with'))).toBe(true);
  });

  it("the privacy policy names the Oli's session mark, in the three languages (ANU-5)", async () => {
    for (const lang of ['en', 'pt', 'es'] as const) {
      const privacy = (await import(`../../src/i18n/${lang}/privacy.ts`)).default as { updated: string; sections: { paragraphs: string[] }[] };
      expect(privacy.sections.flatMap((section) => section.paragraphs).join(' '), lang).toMatch(/session storage|armazenamento da sessão|almacenamiento de sesión/);
      // The Portuguese and Spanish pages changed in the F6 (the PDF, the money calculators and, in Portuguese, the Pix): their
      // date moved to the day of that change, written as decision 1 asks, without the ordinal (DECISOES § 230).
      // F7 (decision 9): the English page changed for the home and health calculators and the QR code (DECISOES § 259).
      // The languages adjustment: the pages of pt and es changed for the QR code, which exists in them now (DECISOES § 310).
      // F11 (decision 2): the three pages changed for the theme key fo-theme; the English date moved to that day, and the
      // Portuguese and Spanish dates were already on it (DECISOES § 387 and § 392).
      // F12 (decision 5, adjustment 1): the three pages changed for the ad-block wall (the recovery tag, the adblock_wall
      // event and the fo-wall-escape key); the three dates moved to that day (§ 431 and § 434).
      expect(privacy.updated, lang).toBe({ en: 'Last updated: November 4, 2026', pt: 'Última atualização: 4 de novembro de 2026', es: 'Última actualización: 4 de noviembre de 2026' }[lang]);
    }
  });
});
