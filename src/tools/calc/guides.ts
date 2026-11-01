// The numbers of the five guides (prompt F4, decision 10), worked out by the engines at build: no result in
// a guide is written by hand. Each guide has its main example (the calculator it embeds starts from it, and
// it is a case of the oracle: tests/unit/calc-guides.test.ts) and a table measured by the same engines, the
// guide's own data. The texts (src/i18n/en/guide-<slug>.ts) hold {placeholders} that these facts fill.
import { dollars, money, ratePercent } from '../../calc/parse.ts';
import { mortgage15vs30, mortgageExtraPayments, refinance, type ExtraPaymentsInput } from '../../calc/loans.ts';
import { debtPayoff, type DebtPayoffInput } from '../../calc/debts.ts';
import { rentVsBuy, type RentVsBuyInput } from '../../calc/rent-vs-buy.ts';
import enShared from './i18n/en.ts';
import { DEFS } from './defs/index.ts';
import { duration } from './view.ts';
import type { CalcPageId, GuideId } from './registry.ts';
import type { Values } from './types.ts';

const S = enShared.island;
const usd = (cents: number): string => dollars(cents, 'en');
const cents = (value: number): string => money(value, 'en');
const pct = (units: number): string => ratePercent(units, 'en');
const time = (months: number): string => duration(months, S);
const PCT = 10_000;

export interface GuideTable {
  head: string[];
  rows: string[][];
}

export interface GuideFacts {
  calc: CalcPageId;
  /** The values the embedded calculator starts from (by property of the page, never by the URL). */
  example: Values;
  facts: Record<string, string>;
  table: GuideTable;
}

function fifteenVsThirty(): GuideFacts {
  const example = DEFS['mortgage-calculator-15-vs-30-year'].initial;
  const input = DEFS['mortgage-calculator-15-vs-30-year'].toInput(example) as Parameters<typeof mortgage15vs30>[0];
  const r = mortgage15vs30(input);
  const lower = mortgage15vs30({ ...input, rate15: 58_750 });
  const rows = [4, 5, 6, 7, 8].map((rate) => {
    const at = mortgage15vs30({ ...input, rate15: rate * PCT, rate30: rate * PCT });
    return [pct(rate * PCT), cents(at.fifteen.payment), cents(at.thirty.payment), usd(at.fifteen.totalInterest), usd(at.thirty.totalInterest), usd(at.interestDiff)];
  });
  return {
    calc: 'mortgage-calculator-15-vs-30-year',
    example,
    facts: {
      price: usd(input.price),
      down: usd(r.down),
      loan: usd(r.loan),
      rate: pct(input.rate30),
      p15: cents(r.fifteen.payment),
      p30: cents(r.thirty.payment),
      i15: usd(r.fifteen.totalInterest),
      i30: usd(r.thirty.totalInterest),
      paid15: usd(r.fifteen.totalPaid),
      paid30: usd(r.thirty.totalPaid),
      more: usd(r.paymentDiff),
      saved: usd(r.interestDiff),
      balance30y5: usd(r.thirty.yearEnd[4] ?? 0),
      balance15y5: usd(r.fifteen.yearEnd[4] ?? 0),
      balance30y15: usd(r.thirty.yearEnd[14] ?? 0),
      paidDown30y5: usd(r.loan - (r.thirty.yearEnd[4] ?? 0)),
      paidDown15y5: usd(r.loan - (r.fifteen.yearEnd[4] ?? 0)),
      lowerRate: pct(58_750),
      lowerP15: cents(lower.fifteen.payment),
      lowerMore: usd(lower.paymentDiff),
      lowerSaved: usd(lower.interestDiff),
    },
    table: { head: ['Rate', '15-year payment', '30-year payment', '15-year interest', '30-year interest', 'Interest saved'], rows },
  };
}

function snowballAvalanche(): GuideFacts {
  const example = DEFS['debt-payoff-calculator'].initial;
  const input = DEFS['debt-payoff-calculator'].toInput(example) as DebtPayoffInput;
  const r = debtPayoff(input);
  if ('error' in r) throw new Error('the snowball guide example must make an account');
  const name = (index: number) => ['the big card', 'the small card', 'the car loan', 'the personal loan'][index] ?? `debt ${index + 1}`;
  const order = (plan: typeof r.snowball) => plan.payoffOrder.map(name).join(', then ');
  const rows = [0, 10_000, 20_000, 40_000, 80_000].map((extra) => {
    const at = debtPayoff({ ...input, extra });
    if ('error' in at) return [usd(extra), '-', '-', '-', '-', '-'];
    return [usd(extra), time(at.snowball.months), usd(at.snowball.totalInterest), time(at.avalanche.months), usd(at.avalanche.totalInterest), usd(at.interestDiff)];
  });
  const debts = input.debts;
  const facts: Record<string, string> = {
    extra: usd(input.extra),
    budget: usd(r.budget),
    minimums: usd(r.budget - input.extra),
    snowMonths: time(r.snowball.months),
    avalMonths: time(r.avalanche.months),
    snowInterest: usd(r.snowball.totalInterest),
    avalInterest: usd(r.avalanche.totalInterest),
    interestDiff: usd(Math.abs(r.interestDiff)),
    monthsDiff: time(Math.abs(r.monthsDiff)),
    snowOrder: order(r.snowball),
    avalOrder: order(r.avalanche),
    snowFirst: String(Math.min(...r.snowball.paidOff)),
    avalFirst: String(Math.min(...r.avalanche.paidOff)),
  };
  debts.forEach((debt, index) => {
    facts[`b${index + 1}`] = usd(debt.balance);
    facts[`r${index + 1}`] = pct(debt.apr);
    facts[`m${index + 1}`] = usd(debt.minimum);
  });
  return {
    calc: 'debt-payoff-calculator',
    example,
    facts,
    table: { head: ['Extra per month', 'Snowball: debt-free in', 'Snowball: interest', 'Avalanche: debt-free in', 'Avalanche: interest', 'Interest difference'], rows },
  };
}

function extraPayments(): GuideFacts {
  const example = DEFS['mortgage-calculator-extra-payments'].initial;
  const input = DEFS['mortgage-calculator-extra-payments'].toInput(example) as ExtraPaymentsInput;
  const r = mortgageExtraPayments(input);
  const none = { ...input, extraMonthly: 0, extraYearly: 0, extraOnce: 0 };
  const yearly = mortgageExtraPayments({ ...none, extraYearly: input.extraMonthly * 12 });
  const early = mortgageExtraPayments({ ...none, extraOnce: 1_000_000, extraOnceMonth: 12 });
  const late = mortgageExtraPayments({ ...none, extraOnce: 1_000_000, extraOnceMonth: 240 });
  const rows = [5_000, 10_000, 20_000, 50_000, 100_000].map((extra) => {
    const at = mortgageExtraPayments({ ...none, extraMonthly: extra });
    return [usd(extra), time(at.extra.count), time(at.monthsSaved), usd(at.interestSaved)];
  });
  return {
    calc: 'mortgage-calculator-extra-payments',
    example,
    facts: {
      loan: usd(r.loan),
      rate: pct(input.rate),
      payment: cents(r.payment),
      extra: usd(input.extraMonthly),
      yearlyExtra: usd(input.extraMonthly * 12),
      baseTime: time(r.base.count),
      baseInterest: usd(r.base.totalInterest),
      withTime: time(r.extra.count),
      saved: time(r.monthsSaved),
      interestSaved: usd(r.interestSaved),
      yearlySaved: time(yearly.monthsSaved),
      yearlyInterest: usd(yearly.interestSaved),
      lump: usd(1_000_000),
      earlyInterest: usd(early.interestSaved),
      earlySaved: time(early.monthsSaved),
      lateInterest: usd(late.interestSaved),
      lateSaved: time(late.monthsSaved),
    },
    table: { head: ['Extra per month', 'Paid off in', 'Sooner by', 'Interest saved'], rows },
  };
}

function refinanceBreakEven(): GuideFacts {
  const example = DEFS['refinance-calculator'].initial;
  const input = DEFS['refinance-calculator'].toInput(example) as Parameters<typeof refinance>[0];
  const r = refinance(input);
  const rolled = refinance({ ...input, costsMode: 'loan' });
  const sameTerm = refinance({ ...input, newYears: 25 });
  const month = (value: number | null): string => (value === null ? 'never' : `month ${value}`);
  const rows = [300_000, 600_000, 900_000].flatMap((costs) =>
    [55_000, 60_000, 65_000].map((newRate) => {
      const at = refinance({ ...input, costs, newRate });
      return [usd(costs), pct(newRate), cents(at.monthlySavings), month(at.simpleBreakEven), month(at.breakEven)];
    }),
  );
  return {
    calc: 'refinance-calculator',
    example,
    facts: {
      balance: usd(input.balance),
      rate: pct(input.rate),
      left: time(input.monthsLeft),
      newRate: pct(input.newRate),
      newTerm: time(input.newYears * 12),
      costs: usd(input.costs),
      currentPayment: cents(r.current.payment),
      newPayment: cents(r.new.payment),
      savings: cents(r.monthlySavings),
      simple: String(r.simpleBreakEven ?? 0),
      breakEven: String(r.breakEven ?? 0),
      currentInterest: usd(r.current.totalInterest),
      newInterest: usd(r.new.totalInterest),
      interestDiff: usd(Math.abs(r.interestDiff)),
      costDiff: usd(Math.abs(r.costDiff)),
      rolledBreakEven: String(rolled.breakEven ?? 0),
      rolledPayment: cents(rolled.new.payment),
      sameTermPayment: cents(sameTerm.new.payment),
      sameTermSavings: cents(sameTerm.monthlySavings),
      sameTermSimple: String(sameTerm.simpleBreakEven ?? 0),
      sameTermBreakEven: String(sameTerm.breakEven ?? 0),
      sameTermInterest: usd(sameTerm.interestDiff),
    },
    table: { head: ['Closing costs', 'New rate', 'Monthly savings', 'Shortcut: costs ÷ savings', 'Interest break-even'], rows },
  };
}

function rentVsBuyBreakEven(): GuideFacts {
  const example = DEFS['rent-vs-buy-calculator'].initial;
  const input = DEFS['rent-vs-buy-calculator'].toInput(example) as RentVsBuyInput;
  const r = rentVsBuy(input);
  const year = (value: number | null): string => (value === null ? 'not within 30 years' : `year ${value}`);
  const returns = [40_000, 60_000, 80_000];
  const rows = [0, 10_000, 20_000, 30_000, 40_000, 50_000].map((appreciation) => [
    pct(appreciation),
    ...returns.map((returnRate) => year(rentVsBuy({ ...input, appreciationRate: appreciation, returnRate, years: 30 }).breakEven)),
  ]);
  const flat = rentVsBuy({ ...input, appreciationRate: 0, years: 30 });
  return {
    calc: 'rent-vs-buy-calculator',
    example,
    facts: {
      price: usd(input.price),
      down: usd(input.down),
      rate: pct(input.rate),
      rent: usd(input.rent),
      tax: usd(input.taxYear),
      insurance: usd(input.insuranceYear),
      upkeep: pct(input.maintenanceRate),
      appreciation: pct(input.appreciationRate),
      selling: pct(input.sellingRate),
      rentIncrease: pct(input.rentIncreaseRate),
      return: pct(input.returnRate),
      years: String(input.years),
      payment: cents(r.payment),
      breakEven: year(r.breakEven),
      buyer: usd(r.buyerFinal),
      renter: usd(r.renterFinal),
      ownerCost: usd(r.totalOwnerCost),
      rentPaid: usd(r.totalRent),
      flatBreakEven: year(flat.breakEven),
      firstYearBuyer: usd(r.buyer[0] ?? 0),
      firstYearRenter: usd(r.renter[0] ?? 0),
    },
    table: { head: ['Home value change per year', ...returns.map((value) => `Savings earn ${pct(value)}`)], rows },
  };
}

export const GUIDE_FACTS: Record<GuideId, () => GuideFacts> = {
  'guides-15-vs-30-year-mortgage': fifteenVsThirty,
  'guides-debt-snowball-vs-avalanche': snowballAvalanche,
  'guides-extra-mortgage-payments': extraPayments,
  'guides-refinance-break-even': refinanceBreakEven,
  'guides-rent-vs-buy-break-even': rentVsBuyBreakEven,
};
