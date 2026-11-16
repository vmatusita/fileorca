// The numbers of the five guides (prompt F4, decision 10), worked out by the engines at build: no result in
// a guide is written by hand. Each guide has its main example (the calculator it embeds starts from it, and
// it is a case of the oracle: tests/unit/calc-guides.test.ts) and a table measured by the same engines, the
// guide's own data. The texts (src/i18n/<lang>/guide-<slug>.ts) hold {placeholders} that these facts fill. Since the
// languages adjustment the guides also exist in Spanish: the same engines and examples, the numbers written in the language
// of the guide, and the few words of the facts and the table from that guide's `words` (never typed here). The F19b adds
// three guides (APR vs APY, the card minimum payment, how much house): besides the example, every input they work out is a
// case of the oracle too (GUIDE_INPUTS), so each number they quote is checked to the cent.
import { dollars, hundredthsPercent, money, ratePercent } from '../../calc/parse.ts';
import { homeAffordability, mortgage15vs30, mortgageExtraPayments, refinance, type AffordabilityInput, type AffordabilityResult, type ExtraPaymentsInput } from '../../calc/loans.ts';
import { creditCardPayoff, debtPayoff, type CardInput, type DebtPayoffInput } from '../../calc/debts.ts';
import { interest } from '../../calc/money.ts';
import { rentVsBuy, type RentVsBuyInput } from '../../calc/rent-vs-buy.ts';
import { aprToApy, type AprApyInput, type AprApyResult } from '../../calc/savings.ts';
import { fmt } from '../../i18n/format.ts';
import type { GuideTexts } from '../../i18n/types.ts';
import enShared from './i18n/en.ts';
import esShared from './i18n/es.ts';
import en15 from '../../i18n/en/guide-15-vs-30-year-mortgage.ts';
import enSnowball from '../../i18n/en/guide-debt-snowball-vs-avalanche.ts';
import enExtra from '../../i18n/en/guide-extra-mortgage-payments.ts';
import enRefinance from '../../i18n/en/guide-refinance-break-even.ts';
import enRent from '../../i18n/en/guide-rent-vs-buy-break-even.ts';
import es15 from '../../i18n/es/guide-15-vs-30-year-mortgage.ts';
import esSnowball from '../../i18n/es/guide-debt-snowball-vs-avalanche.ts';
import esExtra from '../../i18n/es/guide-extra-mortgage-payments.ts';
import esRefinance from '../../i18n/es/guide-refinance-break-even.ts';
import esRent from '../../i18n/es/guide-rent-vs-buy-break-even.ts';
import enAprApy from '../../i18n/en/guide-apr-vs-apy.ts';
import esAprApy from '../../i18n/es/guide-apr-vs-apy.ts';
import enCardMinimum from '../../i18n/en/guide-credit-card-minimum-payment.ts';
import esCardMinimum from '../../i18n/es/guide-credit-card-minimum-payment.ts';
import enAfford from '../../i18n/en/guide-how-much-house-can-i-afford.ts';
import esAfford from '../../i18n/es/guide-how-much-house-can-i-afford.ts';
import { DEFS } from './defs/index.ts';
import { duration } from './view.ts';
import type { CalcPageId, GuideId } from './registry.ts';
import type { Values } from './types.ts';

/** The languages of the money guides: English and Spanish (no US money page exists in Portuguese). */
export type GuideLang = 'en' | 'es';

/** The texts of each guide in each of its languages, typed by guide so each one carries its own words. */
export const GUIDE_TEXTS: { [Id in GuideId]: Record<GuideLang, GuideTexts<Id>> } = {
  'guides-15-vs-30-year-mortgage': { en: en15, es: es15 },
  'guides-debt-snowball-vs-avalanche': { en: enSnowball, es: esSnowball },
  'guides-extra-mortgage-payments': { en: enExtra, es: esExtra },
  'guides-refinance-break-even': { en: enRefinance, es: esRefinance },
  'guides-rent-vs-buy-break-even': { en: enRent, es: esRent },
  "guides-apr-vs-apy": { en: enAprApy, es: esAprApy },
  "guides-credit-card-minimum-payment": { en: enCardMinimum, es: esCardMinimum },
  "guides-how-much-house-can-i-afford": { en: enAfford, es: esAfford },
};

/** How a guide writes its numbers and durations, in its language. */
function writer(lang: GuideLang) {
  const island = (lang === 'es' ? esShared : enShared).island;
  return {
    island,
    usd: (cents: number): string => dollars(cents, lang),
    cents: (value: number): string => money(value, lang),
    pct: (units: number): string => ratePercent(units, lang),
    /** Hundredths of a percent, with two decimals (an APY, or how far it is from the APR): 5.13%. */
    hundredths: (value: number): string => hundredthsPercent(value, lang),
    time: (months: number): string => duration(months, island),
  };
}
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

function fifteenVsThirty(lang: GuideLang = 'en'): GuideFacts {
  const { usd, cents, pct } = writer(lang);
  const words = GUIDE_TEXTS['guides-15-vs-30-year-mortgage'][lang].words;
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
    table: { head: [...words.head], rows },
  };
}

function snowballAvalanche(lang: GuideLang = 'en'): GuideFacts {
  const { island, usd, pct, time } = writer(lang);
  const words = GUIDE_TEXTS['guides-debt-snowball-vs-avalanche'][lang].words;
  const example = DEFS['debt-payoff-calculator'].initial;
  const input = DEFS['debt-payoff-calculator'].toInput(example) as DebtPayoffInput;
  const r = debtPayoff(input);
  if ('error' in r) throw new Error('the snowball guide example must make an account');
  const name = (index: number) => words.debts[index] ?? fmt(island.row, { n: index + 1 });
  const order = (plan: typeof r.snowball) => plan.payoffOrder.map(name).join(words.then);
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
    table: { head: [...words.head], rows },
  };
}

function extraPayments(lang: GuideLang = 'en'): GuideFacts {
  const { usd, cents, pct, time } = writer(lang);
  const words = GUIDE_TEXTS['guides-extra-mortgage-payments'][lang].words;
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
    table: { head: [...words.head], rows },
  };
}

function refinanceBreakEven(lang: GuideLang = 'en'): GuideFacts {
  const { usd, cents, pct, time } = writer(lang);
  const words = GUIDE_TEXTS['guides-refinance-break-even'][lang].words;
  const example = DEFS['refinance-calculator'].initial;
  const input = DEFS['refinance-calculator'].toInput(example) as Parameters<typeof refinance>[0];
  const r = refinance(input);
  const rolled = refinance({ ...input, costsMode: 'loan' });
  const sameTerm = refinance({ ...input, newYears: 25 });
  const month = (value: number | null): string => (value === null ? words.never : fmt(words.month, { n: value }));
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
    table: { head: [...words.head], rows },
  };
}

function rentVsBuyBreakEven(lang: GuideLang = 'en'): GuideFacts {
  const { usd, cents, pct } = writer(lang);
  const words = GUIDE_TEXTS['guides-rent-vs-buy-break-even'][lang].words;
  const example = DEFS['rent-vs-buy-calculator'].initial;
  const input = DEFS['rent-vs-buy-calculator'].toInput(example) as RentVsBuyInput;
  const r = rentVsBuy(input);
  const year = (value: number | null): string => (value === null ? words.notWithin : fmt(words.year, { n: value }));
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
    table: { head: [words.head, ...returns.map((value) => fmt(words.savings, { rate: pct(value) }))], rows },
  };
}

/**
 * The inputs the three guides of the F19b work out besides their examples (prompt F19b, decision 5). Each one is a case of the
 * oracle marked with its guide (scripts/oracle/calc.py), and tests/unit/calc-guides.test.ts proves it, so every number these
 * guides quote is checked to the cent, not only the example. Money in cents, rates in 1/10,000 of a point.
 */
export const GUIDE_INPUTS = {
  /** APR vs APY: a lower and a higher APR, compounded like the example (daily). */
  aprLow: 10_000,
  aprHigh: 100_000,
  /** The card: the fixed payments of the table besides the one that barely covers the interest and the example's own. */
  cardPayments: [13_000, 15_000, 20_000, 30_000, 50_000],
  /** The months of the payment a card statement shows for paying the balance off in three years (Regulation Z, 1026.7(b)(12)). */
  cardBoxMonths: 36,
  /** The house: the other monthly debts of the table besides the example's own. */
  affordDebts: [0, 25_000, 65_000, 100_000, 150_000],
  /** The house: other debts past the point where the total debt limit sets the price, and the same plus $100 a month. */
  affordStep: [100_000, 110_000],
} as const;

/**
 * APR vs APY (F19b): the example of the calculator (5% compounded daily), whose result already holds the same APR in the five
 * compoundings the calculator offers; the same 5% read as an APY and turned back into the APR; and a lower and a higher APR
 * compounded daily. The "APR" here is the nominal yearly rate of a deposit, not the APR of a loan under Regulation Z.
 */
function aprVsApy(lang: GuideLang = 'en'): GuideFacts {
  const { pct, hundredths } = writer(lang);
  const words = GUIDE_TEXTS['guides-apr-vs-apy'][lang].words;
  const example = DEFS['apr-to-apy-calculator'].initial;
  const input = DEFS['apr-to-apy-calculator'].toInput(example) as AprApyInput;
  if (input.direction !== 'apr-to-apy' || input.compounding !== 365) throw new Error('the APR vs APY guide starts from an APR compounded daily');
  // An APR in hundredths of a percent, to set beside an APY (5% = 500); the rates of the guide have whole hundredths.
  const asHundredths = (rate: number): number => {
    if (rate % 100 !== 0) throw new Error(`the APR vs APY guide needs whole hundredths of a percent: ${rate}`);
    return rate / 100;
  };
  const at = (result: AprApyResult, comp: number): number => {
    const row = result.table.find(([value]) => value === comp);
    if (!row) throw new Error(`no compounding ${comp} in the table`);
    return row[1];
  };
  const r = aprToApy(input);
  const apr = asHundredths(input.rate);
  const back = aprToApy({ ...input, direction: 'apy-to-apr' });
  const low = aprToApy({ ...input, rate: GUIDE_INPUTS.aprLow });
  const high = aprToApy({ ...input, rate: GUIDE_INPUTS.aprHigh });
  // The rows follow the calculator's table (yearly, twice a year, quarterly, monthly, daily), and so do the names.
  const rows = r.table.map(([comp, value], index) => [words.compounding[index] ?? String(comp), String(comp), hundredths(value), hundredths(value - apr)]);
  const [first, second, third, fourth] = words.head;
  return {
    calc: 'apr-to-apy-calculator',
    example,
    facts: {
      rate: pct(input.rate),
      apy: hundredths(r.result),
      gap: hundredths(r.result - apr),
      yearlyApy: hundredths(at(r, 1)),
      twiceApy: hundredths(at(r, 2)),
      quarterlyApy: hundredths(at(r, 4)),
      monthlyApy: hundredths(at(r, 12)),
      monthlyGap: hundredths(at(r, 12) - apr),
      dailyStep: hundredths(at(r, 365) - at(r, 12)),
      backApr: hundredths(back.result),
      backGap: hundredths(apr - back.result),
      lowRate: pct(GUIDE_INPUTS.aprLow),
      lowApy: hundredths(low.result),
      lowGap: hundredths(low.result - asHundredths(GUIDE_INPUTS.aprLow)),
      lowMonthlyApy: hundredths(at(low, 12)),
      highRate: pct(GUIDE_INPUTS.aprHigh),
      highApy: hundredths(high.result),
      highGap: hundredths(high.result - asHundredths(GUIDE_INPUTS.aprHigh)),
      highMonthlyApy: hundredths(at(high, 12)),
    },
    table: { head: [first, second, fmt(third, { rate: pct(input.rate) }), fourth], rows },
  };
}

/**
 * The credit card minimum payment (F19b): the calculator does not work out the minimum a statement asks for, and this guide
 * never pretends it does. On the example's balance and APR it sets a payment of exactly the first month's interest (the
 * calculator says it is too low), the first whole dollar above that interest (the payment that barely covers it), larger
 * fixed payments and the example's own, and the payment that clears the card in three years, like the box of a statement.
 */
function cardMinimum(lang: GuideLang = 'en'): GuideFacts {
  const { usd, cents, pct, time } = writer(lang);
  const words = GUIDE_TEXTS['guides-credit-card-minimum-payment'][lang].words;
  const example = DEFS['credit-card-payoff-calculator'].initial;
  const input = DEFS['credit-card-payoff-calculator'].toInput(example) as CardInput;
  if (input.mode !== 'payment') throw new Error('the card guide starts from a fixed payment');
  const paying = (payment: number) => {
    const result = creditCardPayoff({ ...input, payment });
    if ('error' in result) throw new Error(`the card guide pays ${payment} and gets ${result.error}`);
    return result;
  };
  const first = interest(input.balance, input.apr);
  const short = creditCardPayoff({ ...input, payment: first });
  if (!('error' in short) || short.error !== 'too-low') throw new Error('a payment of the first month interest must be too low');
  const barely = (Math.floor(first / 100) + 1) * 100;
  const r = paying(input.payment);
  const low = paying(barely);
  const [nextPayment] = GUIDE_INPUTS.cardPayments;
  const topPayment = GUIDE_INPUTS.cardPayments.at(-1);
  if (nextPayment === undefined || topPayment === undefined) throw new Error('the card guide needs larger payments');
  const next = paying(nextPayment);
  const top = paying(topPayment);
  const box = creditCardPayoff({ balance: input.balance, apr: input.apr, mode: 'months', months: GUIDE_INPUTS.cardBoxMonths });
  if ('error' in box) throw new Error('the three-year payment must make an account');
  const payments = [barely, input.payment, ...GUIDE_INPUTS.cardPayments].sort((a, b) => a - b);
  const rows = payments.map((payment) => {
    const at = paying(payment);
    return [usd(payment), cents(payment - first), time(at.months), usd(at.totalInterest)];
  });
  return {
    calc: 'credit-card-payoff-calculator',
    example,
    facts: {
      balance: usd(input.balance),
      apr: pct(input.apr),
      firstInterest: cents(first),
      minimum: cents(short.minimum),
      barely: usd(barely),
      barelyToBalance: cents(barely - first),
      barelyTime: time(low.months),
      barelyCount: String(low.months),
      barelyInterest: usd(low.totalInterest),
      barelyPaid: usd(low.totalPaid),
      barelyTimes: String(Math.floor(low.totalInterest / input.balance)),
      nextPayment: usd(nextPayment),
      nextTime: time(next.months),
      nextInterest: usd(next.totalInterest),
      payment: usd(input.payment),
      toBalance: cents(input.payment - first),
      time: time(r.months),
      count: String(r.months),
      interest: usd(r.totalInterest),
      paid: usd(r.totalPaid),
      interestDiff: usd(low.totalInterest - r.totalInterest),
      topPayment: usd(topPayment),
      topTime: time(top.months),
      topInterest: usd(top.totalInterest),
      boxPayment: cents(box.payment),
      boxTime: time(box.months),
      boxInterest: usd(box.totalInterest),
      boxPaid: usd(box.totalPaid),
    },
    table: { head: [...words.head], rows },
  };
}

/**
 * How much house can I afford (F19b): the example of the calculator, which limit sets its price, and how the price moves with
 * other monthly debts (the table), including the debts at which the two limits leave the same room and what $100 more a
 * month of debts takes off the price once the total debt limit sets it. The 28% and 36% are the calculator's starting
 * rules of thumb, never a rule of law.
 */
function howMuchHouse(lang: GuideLang = 'en'): GuideFacts {
  const { usd, cents, pct, time } = writer(lang);
  const words = GUIDE_TEXTS['guides-how-much-house-can-i-afford'][lang].words;
  const example = DEFS['home-affordability-calculator'].initial;
  const input = DEFS['home-affordability-calculator'].toInput(example) as AffordabilityInput;
  const owing = (debts: number): AffordabilityResult => {
    const result = homeAffordability({ ...input, debts });
    if (result.noRoom) throw new Error(`the house guide leaves no room at ${debts} of debts`);
    return result;
  };
  const r = owing(input.debts);
  const none = owing(0);
  // How much more a month of other debts fits before the total debt limit leaves less room than the housing limit.
  const room = r.backCap - r.frontCap;
  const [stepDebts, stepMoreDebts] = GUIDE_INPUTS.affordStep;
  const step = owing(stepDebts);
  const more = owing(stepMoreDebts);
  const limitOf = (result: AffordabilityResult): string =>
    result.limit === 'front' ? fmt(words.front, { rate: pct(input.frontRatio) }) : result.limit === 'back' ? fmt(words.back, { rate: pct(input.backRatio) }) : words.both;
  const debts = [input.debts, ...GUIDE_INPUTS.affordDebts].sort((a, b) => a - b);
  const rows = debts.map((value) => {
    const at = owing(value);
    return [usd(value), limitOf(at), cents(at.housingCap), usd(at.maxPrice)];
  });
  return {
    calc: 'home-affordability-calculator',
    example,
    facts: {
      income: usd(input.income),
      debts: usd(input.debts),
      down: usd(input.down),
      rate: pct(input.rate),
      term: time(input.years * 12),
      tax: usd(input.taxYear),
      insurance: usd(input.insuranceYear),
      taxMonth: cents(r.taxMonth),
      insuranceMonth: cents(r.insuranceMonth),
      front: pct(input.frontRatio),
      back: pct(input.backRatio),
      frontCap: cents(r.frontCap),
      backTotal: cents(none.backCap),
      backCap: cents(r.backCap),
      limit: limitOf(r),
      maxPI: cents(r.maxPI),
      payment: cents(r.payment),
      housing: cents(r.monthlyTotal),
      loan: usd(r.maxLoan),
      price: usd(r.maxPrice),
      room: cents(room),
      sameRoomDebts: cents(input.debts + room),
      noDebtsPrice: usd(none.maxPrice),
      stepDebts: usd(stepDebts),
      stepExtra: usd(stepMoreDebts - stepDebts),
      stepPrice: usd(step.maxPrice),
      stepExtraPrice: usd(more.maxPrice),
      stepDrop: usd(step.maxPrice - more.maxPrice),
    },
    table: { head: [...words.head], rows },
  };
}

/** The facts of each guide, in its language (English by default). */
export const GUIDE_FACTS: Record<GuideId, (lang?: GuideLang) => GuideFacts> = {
  'guides-15-vs-30-year-mortgage': fifteenVsThirty,
  'guides-debt-snowball-vs-avalanche': snowballAvalanche,
  'guides-extra-mortgage-payments': extraPayments,
  'guides-refinance-break-even': refinanceBreakEven,
  'guides-rent-vs-buy-break-even': rentVsBuyBreakEven,
  'guides-apr-vs-apy': aprVsApy,
  'guides-credit-card-minimum-payment': cardMinimum,
  'guides-how-much-house-can-i-afford': howMuchHouse,
};
