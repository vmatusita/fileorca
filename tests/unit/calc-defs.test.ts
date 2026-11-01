// The calculator definitions against the oracle and against their own texts (F4; DECISOES § 110 to § 116): the
// example each page starts with is the oracle's page-example case; every field's error says its range; every
// view has its texts; the scenario link goes and comes back, and anything outside a field's range is ignored;
// the CSV of a schedule is the oracle's schedule, cent for cent.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatScaled } from '../../src/calc/parse.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { CALC_PAGES, CALC_PAGE_IDS } from '../../src/tools/calc/registry.ts';
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
  return specs.flatMap((spec) => (spec.kind === 'list' ? spec.item : spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' ? [spec] : []));
}

/** How a range bound reads in an English error: $10,000 or $0.01, 40%, 1,200. */
function bound(spec: NumberSpec, value: number): string {
  if (spec.kind === 'money') return `$${formatScaled(value, 2, 'en', { min: value % 100 === 0 ? 0 : 2 })}`;
  if (spec.kind === 'rate') return formatScaled(value, 4, 'en');
  return formatScaled(value, 0, 'en');
}

describe('the calculator definitions', () => {
  it('cover the 18 pages of the registry', () => {
    expect(Object.keys(DEFS).sort()).toEqual([...CALC_PAGE_IDS].sort());
    for (const id of CALC_PAGE_IDS) expect(DEFS[id].id).toBe(id);
  });

  it("start every page from the oracle's page-example case, and the engine gives that case's result", () => {
    for (const id of CALC_PAGE_IDS) {
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
    for (const id of CALC_PAGE_IDS) {
      const texts = calcTexts(id).panel.fields;
      for (const spec of numberSpecs(DEFS[id].fields)) {
        const error = texts[spec.key]?.error ?? '';
        expect(error, `${id} ${spec.key}`).toContain(bound(spec, spec.min).replace('-', '−'));
        expect(error, `${id} ${spec.key}`).toContain(bound(spec, spec.max));
      }
      for (const spec of DEFS[id].fields) {
        if (spec.kind === 'down') {
          expect(texts[spec.key]?.over, id).toBeTruthy();
          expect(texts[spec.percentKey]?.error, id).toMatch(/0 to 100%/);
        }
        if ((spec.kind === 'money' || spec.kind === 'int') && spec.atMost) expect(texts[spec.key]?.over, `${id} ${spec.key}`).toBeTruthy();
      }
    }
  });

  it('render every view from its own texts, with no placeholder left', () => {
    for (const id of CALC_PAGE_IDS) {
      const def = DEFS[id];
      const data = panelData(id, 'en');
      const view = viewOf(def, data, def.initial);
      const said = [view.hero.label, view.hero.value, ...view.hero.sentence.map((part) => (typeof part === 'string' ? part : part.b))].join(' ');
      expect(said, id).not.toMatch(/\{\w+\}|undefined|NaN/);
      expect(view.summary.length, id).toBeGreaterThan(0);
      expect(view.premises.length, id).toBeGreaterThan(1);
      const table = view.table();
      expect(table.head.length, id).toBeGreaterThan(1);
      for (const row of table.rows) expect(row.length, id).toBe(table.head.length);
      expect(CALC_PAGES[id].file, id).not.toMatch(/\d{3,}/);
    }
  });

  // Review F4 (COR-3 and ANU-2): every number field at the ends of its range, one at a time, and the savings goal
  // that outgrew 10^15 cents. Whatever the view says (a result or a problem) and whatever goes to the PDF summary
  // has its amounts filled in and no number in exponent notation.
  it('render the ends of every range and the error states with every amount filled in', () => {
    const withProblem = new Set<string>();
    const check = (id: string, values: Values) => {
      const def = DEFS[id as keyof typeof DEFS];
      if (Object.keys(problems(def.fields, values)).length > 0) return;
      const view = viewOf(def, panelData(id as keyof typeof DEFS, 'en'), values);
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
    for (const id of CALC_PAGE_IDS) {
      const def = DEFS[id];
      for (const spec of def.fields) {
        if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int') {
          for (const value of [spec.min, spec.max]) check(id, { ...def.initial, [spec.key]: value });
        } else if (spec.kind === 'list') {
          // Each item of the first debt at both ends (second pass of the review: the list was left out).
          const rows = def.initial[spec.key] as Record<string, number>[];
          for (const item of spec.item) for (const value of [item.min, item.max]) check(id, { ...def.initial, [spec.key]: rows.map((row, index) => (index === 0 ? { ...row, [item.key]: value } : row)) });
        } else if (spec.kind === 'down') {
          // The down payment in percent and in dollars, at both ends.
          for (const rate of [0, 1_000_000]) check(id, { ...def.initial, [spec.unitKey]: 'percent', [spec.percentKey]: rate });
          for (const cents of [0, Number(def.initial[spec.of])]) check(id, { ...def.initial, [spec.unitKey]: 'amount', [spec.key]: cents });
        }
      }
    }
    check('savings-goal-calculator', { g: 10_000_000_000, s: 10_000_000_000, r: 400_000, md: 'months', m: 1200, dep: 0 });
    check('savings-goal-calculator', { g: 2_000_000, s: 0, r: 0, md: 'deposit', m: 36, dep: 0 });
    check('credit-card-payoff-calculator', { b: 650_000, r: 229_900, md: 'payment', pay: 1_000, m: 24 });
    check('compound-interest-calculator', { i: 1_000_000_000, m: 100_000_000, r: 400_000, y: 80, c: '365', tm: 'begin' });
    expect([...withProblem].sort()).toEqual(expect.arrayContaining(['compound-interest-calculator', 'credit-card-payoff-calculator', 'savings-goal-calculator']));
  });
});

describe('the scenario link', () => {
  it('goes and comes back with the same values on every page', () => {
    for (const id of CALC_PAGE_IDS) {
      const def = DEFS[id];
      const hash = linkHash(def.fields, def.initial);
      expect(hash, id).toMatch(/^#v=1&/);
      expect(readLink(hash, def.fields, {} as Values), id).toEqual(expect.objectContaining(def.initial));
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
      expect(privacy.updated, lang).toBe({ en: 'Last updated: November 1, 2026', pt: 'Última atualização: 1º de novembro de 2026', es: 'Última actualización: 1 de noviembre de 2026' }[lang]);
    }
  });
});
