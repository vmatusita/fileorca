// The loan calculators: mortgage and its presets, personal, auto, amortization, balloon, refinance and
// home affordability. Each takes whole numbers (cents, rate units, months or years) that its page has
// already checked against the field ranges, and returns exactly what the oracle writes to
// fixtures/calc/<id>.json, plus the full schedule (tests/unit/calc-oracle.test.ts).
import {
  annuityPayment,
  cumulativeInterest,
  divCeil,
  perMonth,
  presentValue,
  schedule,
  share,
  summarize,
  type Row,
  type Summary,
} from './money.ts';

export type Down = { kind: 'amount'; cents: number } | { kind: 'percent'; rate: number };

export function downCents(price: number, down: Down): number {
  return down.kind === 'percent' ? share(price, down.rate) : down.cents;
}

function loanSchedule(loan: number, rate: number, n: number): { payment: number; rows: Row[]; summary: Summary } {
  const payment = annuityPayment(loan, rate, n);
  const rows = schedule(loan, rate, n, payment);
  return { payment, rows, summary: summarize(rows) };
}

export interface MortgageInput {
  price: number;
  down: Down;
  years: number;
  rate: number;
  taxYear: number;
  insuranceYear: number;
  pmiMonth: number;
  hoaMonth: number;
}

export interface MortgageResult extends Summary {
  down: number;
  loan: number;
  payment: number;
  taxMonth: number;
  insuranceMonth: number;
  monthlyTotal: number;
}

export function mortgage(input: MortgageInput): MortgageResult {
  const down = downCents(input.price, input.down);
  const loan = input.price - down;
  const { payment, summary } = loanSchedule(loan, input.rate, input.years * 12);
  const taxMonth = perMonth(input.taxYear);
  const insuranceMonth = perMonth(input.insuranceYear);
  return { down, loan, payment, taxMonth, insuranceMonth, monthlyTotal: payment + taxMonth + insuranceMonth + input.pmiMonth + input.hoaMonth, ...summary };
}

export interface PersonalLoanInput {
  amount: number;
  rate: number;
  months: number;
  /** Origination fee, taken from the money you receive. */
  feeRate: number;
}

export interface PersonalLoanResult extends Summary {
  payment: number;
  fee: number;
  totalCost: number;
  /** APR with the fee, in hundredths of a percent (Regulation Z, Appendix J); null without a fee. */
  aprHundredths: number | null;
}

/**
 * The actuarial APR (Regulation Z, Appendix J): the monthly rate x with net = Σ p_k / (1 + x)^k, times 12,
 * in hundredths of a percent, half up. Bisection in floating point: the APR is shown with two decimals.
 */
export function aprHundredths(net: number, payments: readonly number[]): number {
  const present = (x: number): number => {
    const v = 1 / (1 + x);
    let factor = 1;
    let total = 0;
    for (const payment of payments) {
      factor *= v;
      total += payment * factor;
    }
    return total;
  };
  let lo = 0;
  let hi = 1;
  while (present(hi) > net) hi *= 2;
  for (let step = 0; step < 200; step += 1) {
    const mid = (lo + hi) / 2;
    if (mid === lo || mid === hi) break;
    if (present(mid) > net) lo = mid;
    else hi = mid;
  }
  return Math.round(((lo + hi) / 2) * 12 * 10_000);
}

export function personalLoan(input: PersonalLoanInput): PersonalLoanResult {
  const { payment, rows, summary } = loanSchedule(input.amount, input.rate, input.months);
  const fee = share(input.amount, input.feeRate);
  const apr = fee > 0 ? aprHundredths(input.amount - fee, rows.map((row) => row[1])) : null;
  return { payment, fee, totalCost: summary.totalInterest + fee, ...summary, aprHundredths: apr };
}

export interface AutoLoanInput {
  price: number;
  down: number;
  tradeIn: number;
  /** Sales tax, title and fees in one amount: the rules change by state, so the page asks for the total. */
  taxesFees: number;
  rate: number;
  months: number;
}

export interface AutoLoanResult extends Summary {
  financed: number;
  payment: number;
  totalCost: number;
}

export function autoLoan(input: AutoLoanInput): AutoLoanResult {
  const financed = Math.max(0, input.price + input.taxesFees - input.down - input.tradeIn);
  const { payment, summary } = loanSchedule(financed, input.rate, input.months);
  return { financed, payment, totalCost: input.price + input.taxesFees + summary.totalInterest, ...summary };
}

export interface LoanAmortizationInput {
  amount: number;
  rate: number;
  years: number;
}

export interface LoanAmortizationResult extends Summary {
  payment: number;
}

export function loanAmortization(input: LoanAmortizationInput): LoanAmortizationResult {
  const { payment, summary } = loanSchedule(input.amount, input.rate, input.years * 12);
  return { payment, ...summary };
}

export interface BalloonInput {
  amount: number;
  rate: number;
  /** The amortization term the payment is figured on. */
  years: number;
  /** The payment number when the rest falls due (1 to years × 12 − 1). */
  balloonMonth: number;
}

export interface BalloonResult extends Summary {
  payment: number;
  /** What is still owed after the regular payment of the balloon month, due with it. */
  balloon: number;
}

export function balloonLoan(input: BalloonInput): BalloonResult {
  const payment = annuityPayment(input.amount, input.rate, input.years * 12);
  const rows = schedule(input.amount, input.rate, input.balloonMonth, payment);
  const balloon = rows.length === input.balloonMonth ? rows.at(-1)![1] - payment : 0;
  return { payment, balloon, ...summarize(rows) };
}

export interface ExtraPaymentsInput extends MortgageInput {
  extraMonthly: number;
  /** Paid with every 12th payment. */
  extraYearly: number;
  extraOnce: number;
  extraOnceMonth: number;
}

export interface ExtraPaymentsResult {
  down: number;
  loan: number;
  payment: number;
  monthlyTotal: number;
  base: Summary;
  extra: Summary;
  monthsSaved: number;
  interestSaved: number;
}

export function mortgageExtraPayments(input: ExtraPaymentsInput): ExtraPaymentsResult {
  const down = downCents(input.price, input.down);
  const loan = input.price - down;
  const n = input.years * 12;
  const { payment, summary: base } = loanSchedule(loan, input.rate, n);
  const extraOf = (k: number): number =>
    input.extraMonthly + (k % 12 === 0 ? input.extraYearly : 0) + (k === input.extraOnceMonth ? input.extraOnce : 0);
  const extra = summarize(schedule(loan, input.rate, n, payment, 12, extraOf));
  const monthlyTotal = payment + perMonth(input.taxYear) + perMonth(input.insuranceYear) + input.pmiMonth + input.hoaMonth;
  return {
    down,
    loan,
    payment,
    monthlyTotal,
    base,
    extra,
    monthsSaved: base.count - extra.count,
    interestSaved: base.totalInterest - extra.totalInterest,
  };
}

export interface BiweeklyResult {
  down: number;
  loan: number;
  payment: number;
  halfPayment: number;
  monthlyTotal: number;
  monthly: Summary;
  /** 26 half payments a year, interest at the yearly rate / 26 on the balance of each period. */
  biweekly: Summary;
  /** Half payments × 12 / 26, rounded up to a whole month. */
  biweeklyMonths: number;
  monthsSaved: number;
  interestSaved: number;
}

export function mortgageBiweekly(input: MortgageInput): BiweeklyResult {
  const down = downCents(input.price, input.down);
  const loan = input.price - down;
  const { payment, summary: monthly } = loanSchedule(loan, input.rate, input.years * 12);
  const halfPayment = Math.round(payment / 2);
  const biweekly = summarize(schedule(loan, input.rate, input.years * 26, halfPayment, 26), 26);
  const biweeklyMonths = Number(divCeil(BigInt(biweekly.count * 12), 26n));
  const monthlyTotal = payment + perMonth(input.taxYear) + perMonth(input.insuranceYear) + input.pmiMonth + input.hoaMonth;
  return {
    down,
    loan,
    payment,
    halfPayment,
    monthlyTotal,
    monthly,
    biweekly,
    biweeklyMonths,
    monthsSaved: monthly.count - biweeklyMonths,
    interestSaved: monthly.totalInterest - biweekly.totalInterest,
  };
}

export interface FifteenVsThirtyInput {
  price: number;
  down: Down;
  rate15: number;
  rate30: number;
}

export interface TermResult extends Summary {
  payment: number;
}

export interface FifteenVsThirtyResult {
  down: number;
  loan: number;
  fifteen: TermResult;
  thirty: TermResult;
  /** How much more the 15-year loan costs a month. */
  paymentDiff: number;
  /** How much less interest the 15-year loan pays. */
  interestDiff: number;
}

export function mortgage15vs30(input: FifteenVsThirtyInput): FifteenVsThirtyResult {
  const down = downCents(input.price, input.down);
  const loan = input.price - down;
  const a = loanSchedule(loan, input.rate15, 180);
  const b = loanSchedule(loan, input.rate30, 360);
  return {
    down,
    loan,
    fifteen: { payment: a.payment, ...a.summary },
    thirty: { payment: b.payment, ...b.summary },
    paymentDiff: a.payment - b.payment,
    interestDiff: b.summary.totalInterest - a.summary.totalInterest,
  };
}

export interface RefinanceInput {
  balance: number;
  rate: number;
  monthsLeft: number;
  newRate: number;
  newYears: number;
  costs: number;
  /** Closing costs paid at closing, or added to the new loan. */
  costsMode: 'cash' | 'loan';
}

export interface RefinanceResult {
  current: TermResult;
  new: TermResult & { loan: number };
  monthlySavings: number;
  interestDiff: number;
  costDiff: number;
  /**
   * The first month in which the closing costs plus the interest paid on the new loan are no more than
   * the interest the current loan would have charged by then; null when that never happens.
   */
  breakEven: number | null;
  /** The shortcut: closing costs / monthly savings, rounded up; null without savings. */
  simpleBreakEven: number | null;
}

export function refinance(input: RefinanceInput): RefinanceResult {
  const current = loanSchedule(input.balance, input.rate, input.monthsLeft);
  const loan = input.balance + (input.costsMode === 'loan' ? input.costs : 0);
  const upfront = input.costsMode === 'cash' ? input.costs : 0;
  const next = loanSchedule(loan, input.newRate, input.newYears * 12);
  const paidCurrent = cumulativeInterest(current.rows);
  const paidNew = cumulativeInterest(next.rows);
  const upTo = (paid: number[], m: number): number => (paid.length ? paid[Math.min(m, paid.length) - 1]! : 0);
  let breakEven: number | null = null;
  const horizon = Math.max(current.rows.length, next.rows.length);
  for (let m = 1; m <= horizon; m += 1) {
    if (input.costs + upTo(paidNew, m) <= upTo(paidCurrent, m)) {
      breakEven = m;
      break;
    }
  }
  const monthlySavings = current.payment - next.payment;
  return {
    current: { payment: current.payment, ...current.summary },
    new: { loan, payment: next.payment, ...next.summary },
    monthlySavings,
    interestDiff: current.summary.totalInterest - next.summary.totalInterest,
    costDiff: current.summary.totalPaid - (next.summary.totalPaid + upfront),
    breakEven,
    simpleBreakEven: monthlySavings > 0 ? Number(divCeil(BigInt(input.costs), BigInt(monthlySavings))) : null,
  };
}

export interface AffordabilityInput {
  /** Gross yearly income. */
  income: number;
  /** Monthly payments on other debts. */
  debts: number;
  down: number;
  rate: number;
  years: number;
  taxYear: number;
  insuranceYear: number;
  hoaMonth: number;
  /** Housing costs over monthly income (28% is a common rule of thumb). */
  frontRatio: number;
  /** All debts over monthly income (36% is a common rule of thumb). */
  backRatio: number;
}

export interface AffordabilityResult {
  frontCap: number;
  backCap: number;
  housingCap: number;
  /** Which limit held the result down. */
  limit: 'front' | 'back' | 'both';
  taxMonth: number;
  insuranceMonth: number;
  /** Taxes, insurance and HOA already use up the limit: no loan fits. */
  noRoom: boolean;
  maxPI: number;
  maxLoan: number;
  maxPrice: number;
  payment: number;
  monthlyTotal: number;
}

/** A ratio of the monthly income, rounded down: a cap never passes the limit. */
function monthlyCap(income: number, ratio: number): number {
  const num = BigInt(income) * BigInt(ratio);
  const den = BigInt(12 * 1_000_000);
  return Number(num / den);
}

export function homeAffordability(input: AffordabilityInput): AffordabilityResult {
  const frontCap = monthlyCap(input.income, input.frontRatio);
  const backCap = monthlyCap(input.income, input.backRatio) - input.debts;
  const housingCap = Math.min(frontCap, backCap);
  const limit = frontCap < backCap ? 'front' : backCap < frontCap ? 'back' : 'both';
  const taxMonth = perMonth(input.taxYear);
  const insuranceMonth = perMonth(input.insuranceYear);
  const maxPI = housingCap - taxMonth - insuranceMonth - input.hoaMonth;
  const base = { frontCap, backCap, housingCap, limit, taxMonth, insuranceMonth } as const;
  if (maxPI <= 0) return { ...base, noRoom: true, maxPI: 0, maxLoan: 0, maxPrice: 0, payment: 0, monthlyTotal: 0 };
  const n = input.years * 12;
  const maxLoan = presentValue(maxPI, input.rate, n);
  const payment = annuityPayment(maxLoan, input.rate, n);
  return {
    ...base,
    noRoom: false,
    maxPI,
    maxLoan,
    maxPrice: maxLoan + input.down,
    payment,
    monthlyTotal: payment + taxMonth + insuranceMonth + input.hoaMonth,
  };
}
