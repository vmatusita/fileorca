// The five guides (prompt F4, decision 10): the main example of each guide is a case of the oracle, the
// embedded calculator starts from it, and every sentence of the text that describes a result in words (less
// interest, sooner, later than the shortcut) still holds for the numbers the engines give. If a text and its
// numbers drift apart, this test fails before the page does. Since the languages adjustment the guides also exist in
// Spanish: the same facts in the Spanish format, every placeholder of the Spanish texts filled, and the words of the
// engines (the table headings, the debt names) taken from each guide's texts. The F19b adds three guides (APR vs APY, the
// card minimum payment, how much house): each has its own `it` below, which also proves that every other input the guide
// works out (GUIDE_INPUTS) is a case of the oracle marked with the guide.
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { GUIDE_FACTS, GUIDE_INPUTS, GUIDE_TEXTS, type GuideLang } from '../../src/tools/calc/guides.ts';
import { placeholdersIn } from '../../src/tools/guides/measured.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { GUIDES, GUIDE_IDS, type CalcPageId } from '../../src/tools/calc/registry.ts';
import {
  homeAffordability,
  mortgage15vs30,
  mortgageExtraPayments,
  refinance,
  type AffordabilityInput,
  type ExtraPaymentsInput,
  type FifteenVsThirtyInput,
  type RefinanceInput,
} from '../../src/calc/loans.ts';
import { creditCardPayoff, debtPayoff, type CardInput, type DebtPayoffInput } from '../../src/calc/debts.ts';
import { interest } from '../../src/calc/money.ts';
import { rentVsBuy, type RentVsBuyInput } from '../../src/calc/rent-vs-buy.ts';
import { aprToApy, type AprApyInput, type AprApyResult } from '../../src/calc/savings.ts';
import { ENGINES } from '../../src/calc/index.ts';

interface Case {
  id: string;
  source: string;
  input: unknown;
  expected: unknown;
}
const cases = (id: string): Case[] => (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: Case[] }).cases;
const stripped = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (key, item: unknown) => (key === 'rows' || key === 'years' ? undefined : item)));

/**
 * F19b: every other input a new guide works out (GUIDE_INPUTS, beside its example) is a case of the oracle marked with the
 * guide, and the engine gives that case's expected output, so each number the guide quotes is checked to the cent.
 */
function expectOracleCase(calc: CalcPageId, guide: string, input: unknown): void {
  const found = cases(calc).find((item) => item.source === `guide:${guide}` && isDeepStrictEqual(item.input, input));
  expect(found, `${guide}: ${JSON.stringify(input)} is not a case of the oracle`).toBeDefined();
  const engine = ENGINES[calc as keyof typeof ENGINES] as (value: unknown) => unknown;
  expect(stripped(engine(input)), `${guide}: ${JSON.stringify(input)}`).toEqual(found?.expected);
}

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

  // The prose of a guide (every key but its `words`, whose {n} and {rate} the engines fill) in English and in Spanish.
  const LANGS: readonly GuideLang[] = ['en', 'es'];
  const prose = (id: (typeof GUIDE_IDS)[number], lang: GuideLang): unknown => ({ ...GUIDE_TEXTS[id][lang], words: undefined });

  it('fill every placeholder of their texts with a number from the engines, in English and in Spanish', () => {
    for (const lang of LANGS) {
      for (const id of GUIDE_IDS) {
        const facts = GUIDE_FACTS[id](lang).facts;
        const used = [...placeholdersIn(prose(id, lang))].filter((name) => name !== 'date');
        expect(used.length, `${id} (${lang})`).toBeGreaterThan(0);
        for (const name of used) expect(facts[name], `${id} (${lang}): {${name}}`).toBeDefined();
        for (const value of Object.values(facts)) expect(value, `${id} (${lang})`).not.toMatch(/NaN|undefined|Infinity|\{/);
      }
    }
  });

  it('use in Spanish the same placeholders as in English, and the words of the engines only through {n} and {rate}', () => {
    for (const id of GUIDE_IDS) {
      expect([...placeholdersIn(prose(id, 'es'))].sort(), id).toEqual([...placeholdersIn(prose(id, 'en'))].sort());
      for (const lang of LANGS) expect([...placeholdersIn(GUIDE_TEXTS[id][lang].words)].filter((name) => name !== 'n' && name !== 'rate'), `${id} (${lang})`).toEqual([]);
    }
  });

  it('write the same numbers in Spanish as in English, in the Spanish format', () => {
    // The digits of each fact, once the separators are gone: $1,234.56 and 6.5 % keep their digits in both languages.
    const digits = (value: string): string => value.replace(/[^\d]/g, '');
    for (const id of GUIDE_IDS) {
      const en = GUIDE_FACTS[id]('en');
      const es = GUIDE_FACTS[id]('es');
      for (const [name, value] of Object.entries(en.facts)) expect(digits(es.facts[name] ?? ''), `${id}: {${name}}`).toBe(digits(value));
      expect(es.table.rows.map((row) => row.map(digits)), id).toEqual(en.table.rows.map((row) => row.map(digits)));
      for (const value of [...Object.values(es.facts), ...es.table.rows.flat()]) expect(value, id).not.toMatch(/\d%/);
    }
  });

  it('measure a table of their own, with the same number of cells in every row', () => {
    for (const lang of LANGS) {
      for (const id of GUIDE_IDS) {
        const { table } = GUIDE_FACTS[id](lang);
        expect(table.rows.length, `${id} (${lang})`).toBeGreaterThanOrEqual(5);
        for (const row of table.rows) expect(row, `${id} (${lang})`).toHaveLength(table.head.length);
      }
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

  it('APR vs APY: the APY rises with the compounding and is never below the APR, daily adds the least, the gap grows with the rate, and an APY turned back gives a lower APR', () => {
    const input = DEFS['apr-to-apy-calculator'].toInput(DEFS['apr-to-apy-calculator'].initial) as AprApyInput;
    expect(input.direction).toBe('apr-to-apy');
    expect(input.compounding).toBe(365);
    const values = (result: AprApyResult): number[] => result.table.map(([, value]) => value);
    const example = aprToApy(input);
    const low = aprToApy({ ...input, rate: GUIDE_INPUTS.aprLow });
    const high = aprToApy({ ...input, rate: GUIDE_INPUTS.aprHigh });
    // The table runs from yearly to daily, the order of the names in the guide's words.
    expect(example.table.map(([comp]) => comp)).toEqual([1, 2, 4, 12, 365]);
    for (const [result, rate] of [
      [low, GUIDE_INPUTS.aprLow],
      [example, input.rate],
      [high, GUIDE_INPUTS.aprHigh],
    ] as const) {
      const apr = rate / 100;
      const apys = values(result);
      // Yearly compounding is the APR itself; more often never gives less, and daily gives the most (the result).
      expect(apys[0]).toBe(apr);
      for (const [index, apy] of apys.entries()) expect(apy).toBeGreaterThanOrEqual(index === 0 ? apr : (apys[index - 1] ?? Infinity));
      expect(result.result).toBe(apys.at(-1));
      expect(result.result).toBeGreaterThan(apr);
    }
    // At the example's rate each step adds something, and the last one, monthly to daily, adds the least.
    const apys = values(example);
    const steps = apys.slice(1).map((apy, index) => apy - (apys[index] ?? 0));
    for (const step of steps) expect(step).toBeGreaterThan(0);
    expect(steps.at(-1)).toBeLessThan(Math.min(...steps.slice(0, -1)));
    // At the lower rate only daily compounding shows at two decimals; the gap grows with the rate.
    expect(values(low).slice(0, -1)).toEqual(values(low).slice(0, -1).map(() => GUIDE_INPUTS.aprLow / 100));
    const gap = (result: AprApyResult, rate: number): number => result.result - rate / 100;
    expect(gap(low, GUIDE_INPUTS.aprLow)).toBeLessThan(gap(example, input.rate));
    expect(gap(example, input.rate)).toBeLessThan(gap(high, GUIDE_INPUTS.aprHigh));
    // The same 5% read as an APY comes from a lower APR, lower the more often it compounds.
    const back = aprToApy({ ...input, direction: 'apy-to-apr' });
    const aprs = values(back);
    expect(aprs[0]).toBe(input.rate / 100);
    for (const [index, apr] of aprs.entries()) if (index > 0) expect(apr).toBeLessThan(aprs[index - 1] ?? 0);
    expect(back.result).toBe(aprs.at(-1));
    // Every input the guide works out is a case of the oracle.
    for (const item of [input, { ...input, direction: 'apy-to-apr' }, { ...input, rate: GUIDE_INPUTS.aprLow }, { ...input, rate: GUIDE_INPUTS.aprHigh }])
      expectOracleCase('apr-to-apy-calculator', 'apr-vs-apy', item);
  });

  it("credit card: a payment of the first month's interest is too low, a larger fixed payment pays off sooner with less interest, each extra dollar saving fewer months, and the three-year payment is just above the example", () => {
    const input = DEFS['credit-card-payoff-calculator'].toInput(DEFS['credit-card-payoff-calculator'].initial) as CardInput;
    if (input.mode !== 'payment') throw new Error('the example pays a fixed amount');
    const paying = (payment: number) => {
      const result = creditCardPayoff({ ...input, payment });
      if ('error' in result) throw new Error(`${payment}: ${result.error}`);
      return result;
    };
    // A payment of exactly the first month's interest does not lower the balance: the calculator says it is too low and
    // names the smallest one that does; the first whole dollar above that interest barely covers it.
    const first = interest(input.balance, input.apr);
    expect(creditCardPayoff({ ...input, payment: first })).toEqual({ error: 'too-low', minimum: first + 1 });
    const barely = (Math.floor(first / 100) + 1) * 100;
    expect(barely).toBeGreaterThan(first);
    expect(barely - first).toBeLessThan(100);
    // The table, from the payment that barely covers the interest up: fewer months and less interest at every step, the
    // first month's interest the same in every row, and each extra dollar saving fewer months than the one before.
    const payments = [barely, input.payment, ...GUIDE_INPUTS.cardPayments].sort((a, b) => a - b);
    expect(payments[0]).toBe(barely);
    expect(new Set(payments).size).toBe(payments.length);
    const results = payments.map(paying);
    for (const [index, result] of results.entries()) {
      expect(result.rows[0]?.[2]).toBe(first);
      expect(result.rows[0]?.[3]).toBe((payments[index] ?? 0) - first);
      if (index === 0) continue;
      const before = results[index - 1];
      expect(result.months).toBeLessThan(before?.months ?? 0);
      expect(result.totalInterest).toBeLessThan(before?.totalInterest ?? 0);
    }
    const perDollar = results.slice(1).map((result, index) => ((results[index]?.months ?? 0) - result.months) / ((payments[index + 1] ?? 0) - (payments[index] ?? 0)));
    for (const [index, value] of perDollar.entries()) if (index > 0) expect(value).toBeLessThan(perDollar[index - 1] ?? 0);
    // Barely covering the interest costs more in interest than the balance itself, many times over.
    const low = paying(barely);
    expect(Math.floor(low.totalInterest / input.balance)).toBeGreaterThanOrEqual(2);
    // The payment that clears the card in three years (a statement's box) is just above the example's, which takes a month longer.
    const box = creditCardPayoff({ balance: input.balance, apr: input.apr, mode: 'months', months: GUIDE_INPUTS.cardBoxMonths });
    if ('error' in box) throw new Error('the three-year payment must make an account');
    const example = paying(input.payment);
    expect(box.months).toBe(GUIDE_INPUTS.cardBoxMonths);
    expect(box.payment).toBeGreaterThan(input.payment);
    expect(box.payment - input.payment).toBeLessThan(input.payment / 100);
    expect(example.months).toBe(GUIDE_INPUTS.cardBoxMonths + 1);
    expect(box.totalInterest).toBeLessThan(example.totalInterest);
    // Every input the guide works out is a case of the oracle.
    for (const item of [{ ...input, payment: first }, ...payments.map((payment) => ({ ...input, payment })), { balance: input.balance, apr: input.apr, mode: 'months', months: GUIDE_INPUTS.cardBoxMonths }])
      expectOracleCase('credit-card-payoff-calculator', 'credit-card-minimum-payment', item);
  });

  it('house: the housing limit sets the example price, so smaller debts do not raise it; past the debts where both limits leave the same room, the total debt limit sets the price and every $100 a month of debts takes about the same off it', () => {
    const input = DEFS['home-affordability-calculator'].toInput(DEFS['home-affordability-calculator'].initial) as AffordabilityInput;
    const owing = (debts: number) => homeAffordability({ ...input, debts });
    const example = owing(input.debts);
    // F19b (E8): the guide cites the CFPB home loan toolkit for the housing share it opens with (its "rule of thumb" of
    // 28%), so the calculator must keep opening there; the total debt share is the calculator's own 36%, cited from no page.
    expect([input.frontRatio, input.backRatio]).toEqual([280_000, 360_000]);
    expect(example.noRoom).toBe(false);
    expect(example.limit).toBe('front');
    expect(example.frontCap).toBeLessThan(example.backCap);
    // The room left in the total debt limit: at those debts both limits leave the same room, one cent more and the total
    // debt limit sets a lower price.
    const room = example.backCap - example.frontCap;
    const same = owing(input.debts + room);
    expect(same.limit).toBe('both');
    expect(same.maxPrice).toBe(example.maxPrice);
    const past = owing(input.debts + room + 1);
    expect(past.limit).toBe('back');
    expect(past.maxPrice).toBeLessThan(example.maxPrice);
    // The table: the housing limit and the same price up to that point, then the total debt limit and a lower price at every row.
    const debts = [input.debts, ...GUIDE_INPUTS.affordDebts].sort((a, b) => a - b);
    expect(new Set(debts).size).toBe(debts.length);
    const rows = debts.map(owing);
    for (const [index, row] of rows.entries()) {
      expect(row.noRoom).toBe(false);
      if ((debts[index] ?? 0) <= input.debts + room) {
        expect(row.limit).not.toBe('back');
        expect(row.maxPrice).toBe(example.maxPrice);
      } else {
        expect(row.limit).toBe('back');
        expect(row.maxPrice).toBeLessThan(rows[index - 1]?.maxPrice ?? 0);
      }
    }
    expect(rows.filter((row) => row.limit === 'front').length).toBeGreaterThanOrEqual(2);
    expect(rows.filter((row) => row.limit === 'back').length).toBeGreaterThanOrEqual(2);
    expect(owing(0).maxPrice).toBe(example.maxPrice);
    // $100 more a month past that point takes a price drop that every step of the table repeats, to the dollar.
    const [stepDebts, stepMoreDebts] = GUIDE_INPUTS.affordStep;
    expect(stepDebts).toBeGreaterThan(input.debts + room);
    expect(stepMoreDebts - stepDebts).toBe(10_000);
    const drop = owing(stepDebts).maxPrice - owing(stepMoreDebts).maxPrice;
    expect(drop).toBeGreaterThan(0);
    const back = debts.filter((value) => value > input.debts + room);
    for (const [index, value] of back.entries()) {
      if (index === 0) continue;
      const before = back[index - 1] ?? 0;
      const per100 = ((owing(before).maxPrice - owing(value).maxPrice) * 10_000) / (value - before);
      expect(Math.abs(per100 - drop)).toBeLessThanOrEqual(100);
    }
    // Every input the guide works out is a case of the oracle.
    for (const value of [...debts, input.debts + room, stepDebts, stepMoreDebts]) expectOracleCase('home-affordability-calculator', 'how-much-house-can-i-afford', { ...input, debts: value });
  });
});
