// The five guides (prompt F4, decision 10): the main example of each guide is a case of the oracle, the
// embedded calculator starts from it, and every sentence of the text that describes a result in words (less
// interest, sooner, later than the shortcut) still holds for the numbers the engines give. If a text and its
// numbers drift apart, this test fails before the page does.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GUIDE_FACTS } from '../../src/tools/calc/guides.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { GUIDES, GUIDE_IDS } from '../../src/tools/calc/registry.ts';
import { mortgage15vs30, mortgageExtraPayments, refinance, type ExtraPaymentsInput, type FifteenVsThirtyInput, type RefinanceInput } from '../../src/calc/loans.ts';
import { debtPayoff, type DebtPayoffInput } from '../../src/calc/debts.ts';
import { rentVsBuy, type RentVsBuyInput } from '../../src/calc/rent-vs-buy.ts';
import { ENGINES } from '../../src/calc/index.ts';

interface Case {
  id: string;
  source: string;
  input: unknown;
  expected: unknown;
}
const cases = (id: string): Case[] => (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: Case[] }).cases;
const stripped = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (key, item: unknown) => (key === 'rows' || key === 'years' ? undefined : item)));

describe('the guides', () => {
  it('embed their own calculator, started from a case of the oracle marked with the guide', () => {
    for (const id of GUIDE_IDS) {
      const guide = GUIDE_FACTS[id]();
      expect(guide.calc, id).toBe(GUIDES[id].calc);
      const input = DEFS[guide.calc].toInput(guide.example);
      const marked = cases(guide.calc).filter((item) => item.source === `guide:${id.replace(/^guides-/, '')}`);
      const main = marked.find((item) => JSON.stringify(item.input) === JSON.stringify(input));
      expect(main, `${id}: the example is not a case of the oracle`).toBeDefined();
      const engine = ENGINES[guide.calc] as (value: unknown) => unknown;
      expect(stripped(engine(input)), id).toEqual(main?.expected);
    }
  });

  it('fill every placeholder of their texts with a number from the engines', () => {
    for (const id of GUIDE_IDS) {
      const source = readFileSync(`src/i18n/en/guide-${id.replace(/^guides-/, '')}.ts`, 'utf8');
      const facts = GUIDE_FACTS[id]().facts;
      const used = [...source.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').filter((name) => name !== 'date');
      for (const name of used) expect(facts[name], `${id}: {${name}}`).toBeDefined();
      for (const value of Object.values(facts)) expect(value, id).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it('measure a table of their own, with the same number of cells in every row', () => {
    for (const id of GUIDE_IDS) {
      const { table } = GUIDE_FACTS[id]();
      expect(table.rows.length, id).toBeGreaterThanOrEqual(5);
      for (const row of table.rows) expect(row, id).toHaveLength(table.head.length);
    }
  });
});

describe('the words of the guides still match their numbers', () => {
  it('15 vs 30: the shorter term costs more a month and saves interest, more so with a lower rate', () => {
    const input = DEFS['mortgage-calculator-15-vs-30-year'].toInput(DEFS['mortgage-calculator-15-vs-30-year'].initial) as FifteenVsThirtyInput;
    const same = mortgage15vs30(input);
    const lower = mortgage15vs30({ ...input, rate15: 58_750 });
    expect(same.paymentDiff).toBeGreaterThan(0);
    expect(same.interestDiff).toBeGreaterThan(0);
    expect(same.fifteen.payment).toBeLessThan(2 * same.thirty.payment);
    expect(lower.interestDiff).toBeGreaterThan(same.interestDiff);
    expect(lower.paymentDiff).toBeGreaterThan(0);
  });

  it('snowball vs avalanche: the avalanche pays less and finishes sooner; the gap is widest in the middle rows', () => {
    const input = DEFS['debt-payoff-calculator'].toInput(DEFS['debt-payoff-calculator'].initial) as DebtPayoffInput;
    const result = debtPayoff(input);
    if ('error' in result) throw new Error('the example must make an account');
    expect(result.interestDiff).toBeGreaterThan(0);
    expect(result.monthsDiff).toBeGreaterThan(0);
    // The first snowball payoff (the small card) comes before the first avalanche payoff (the big card).
    expect(Math.min(...result.snowball.paidOff)).toBeLessThan(Math.min(...result.avalanche.paidOff));
    const gaps = [0, 10_000, 20_000, 40_000, 80_000].map((extra) => {
      const at = debtPayoff({ ...input, extra });
      return 'error' in at ? 0 : at.interestDiff;
    });
    const widest = Math.max(...gaps);
    expect(gaps[0]).toBeLessThan(widest / 10);
    expect([gaps[1], gaps[2]]).toContain(widest);
    expect(gaps[4]).toBeLessThan(widest);
  });

  it('extra payments: once a year saves a little less than every month; early money saves more than late money', () => {
    const input = DEFS['mortgage-calculator-extra-payments'].toInput(DEFS['mortgage-calculator-extra-payments'].initial) as ExtraPaymentsInput;
    const none = { ...input, extraMonthly: 0, extraYearly: 0, extraOnce: 0 };
    const monthly = mortgageExtraPayments(input);
    const yearly = mortgageExtraPayments({ ...none, extraYearly: input.extraMonthly * 12 });
    expect(yearly.interestSaved).toBeLessThan(monthly.interestSaved);
    expect(yearly.interestSaved).toBeGreaterThan(monthly.interestSaved * 0.9);
    const early = mortgageExtraPayments({ ...none, extraOnce: 1_000_000, extraOnceMonth: 12 });
    const late = mortgageExtraPayments({ ...none, extraOnce: 1_000_000, extraOnceMonth: 240 });
    expect(early.interestSaved).toBeGreaterThan(late.interestSaved);
    expect(early.monthsSaved).toBeGreaterThan(late.monthsSaved);
  });

  it('refinance: the shortcut is too hopeful for a longer loan and too gloomy for the same term; rolling the costs in breaks even later', () => {
    const input = DEFS['refinance-calculator'].toInput(DEFS['refinance-calculator'].initial) as RefinanceInput;
    const longer = refinance(input);
    const same = refinance({ ...input, newYears: 25 });
    const rolled = refinance({ ...input, costsMode: 'loan' });
    expect(input.monthsLeft).toBe(300);
    expect(input.newYears * 12 - input.monthsLeft).toBe(60);
    expect(longer.simpleBreakEven).not.toBeNull();
    expect(longer.breakEven ?? 0).toBeGreaterThan(longer.simpleBreakEven ?? 0);
    expect(longer.interestDiff).toBeGreaterThan(0);
    expect(longer.costDiff).toBeLessThan(0);
    expect(same.simpleBreakEven ?? 0).toBeGreaterThan(same.breakEven ?? Infinity);
    expect(same.interestDiff).toBeGreaterThan(longer.interestDiff);
    expect(rolled.breakEven ?? 0).toBeGreaterThan(longer.breakEven ?? 0);
  });

  it('rent vs buy: buying starts behind, catches up within the example, and the table moves the way the text says', () => {
    const input = DEFS['rent-vs-buy-calculator'].toInput(DEFS['rent-vs-buy-calculator'].initial) as RentVsBuyInput;
    const result = rentVsBuy(input);
    expect(result.buyer[0] ?? 0).toBeLessThan(result.renter[0] ?? 0);
    expect(result.breakEven).not.toBeNull();
    expect(result.buyerFinal).toBeGreaterThan(result.renterFinal);
    const year = (appreciationRate: number, returnRate: number) => rentVsBuy({ ...input, appreciationRate, returnRate, years: 30 }).breakEven ?? 99;
    for (const ret of [40_000, 60_000, 80_000])
      for (const appreciation of [0, 10_000, 20_000, 30_000, 40_000]) expect(year(appreciation + 10_000, ret)).toBeLessThanOrEqual(year(appreciation, ret));
    for (const appreciation of [0, 10_000, 20_000, 30_000, 40_000, 50_000]) {
      expect(year(appreciation, 60_000)).toBeGreaterThanOrEqual(year(appreciation, 40_000));
      expect(year(appreciation, 80_000)).toBeGreaterThanOrEqual(year(appreciation, 60_000));
    }
    // At the highest return, buying only catches up with fast-rising home values.
    expect([0, 10_000, 20_000, 30_000].map((appreciation) => year(appreciation, 80_000))).toEqual([99, 99, 99, 99]);
    expect(year(40_000, 80_000)).toBeLessThan(99);
  });
});
