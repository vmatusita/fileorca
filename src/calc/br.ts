// The calculators adapted to Brazil (prompt F6, decision 5; oracle: scripts/oracle/calc_br.py). Every rate is
// effective (Res. CMN 5.004/2022, art. 3, I): a monthly rate is used as it is, a yearly one becomes monthly by
// compounding, (1 + a)^(1/12) - 1, cut to 30 decimals (the integer root of DECISOES § 111), never a / 12. The
// interest of a month is the balance times that rate, half up; a PRICE payment comes from the closed formula with
// one rounding; the last payment zeroes the balance. Each function returns exactly what the oracle writes to
// fixtures/calc/<id>.json, plus the schedules (`rows`, `years`) that only some cases store.
import { debtPayoff, type DebtPayoffResult } from './debts.ts';
import { MAX_CENTS, ONE, ROOT_ONE, divRound, interest30, root30, share, type Row } from './money.ts';

const big = BigInt;
/** Scale of a monthly rate in 10^-30: a rate unit (1/10,000 of a point, ONE = 10^6) is 10^24 of them. */
const UNIT_30 = ROOT_ONE / big(ONE);

/** A monthly effective rate (rate units) as a whole number of 10^-30: exact. */
export function monthRate30(rate: number): bigint {
  return big(rate) * UNIT_30;
}

/** A yearly effective rate as the monthly one: floor(10^30 · ((1 + a)^(1/12) − 1)). */
export function yearRate30(rate: number): bigint {
  return root30(rate, 12) - ROOT_ONE;
}

/** P = L·j·(1+j)^n / ((1+j)^n − 1) over whole numbers (j in 10^-30), half up; at 0%, L / n. */
export function annuity30(principal: number, j: bigint, n: number): number {
  if (principal === 0) return 0;
  if (j === 0n) return Number(divRound(big(principal), big(n)));
  const grown = (ROOT_ONE + j) ** big(n);
  return Number(divRound(big(principal) * j * grown, ROOT_ONE * (grown - ROOT_ONE ** big(n))));
}

/**
 * The cent loop of a fixed payment: [k, payment, interest, amortization, balance]. With `cap`, the interest of all
 * the months together never passes it (Lei 14.690/2023, art. 28): past it a month has no interest.
 */
export function priceRows(principal: number, j: bigint, n: number, payment: number, cap?: number): Row[] {
  const rows: Row[] = [];
  let balance = principal;
  let charged = 0;
  for (let k = 1; balance > 0; k += 1) {
    let owed = interest30(balance, j);
    if (cap !== undefined) owed = Math.min(owed, cap - charged);
    charged += owed;
    const total = balance + owed;
    const paid = k >= n || payment >= total ? total : payment;
    balance = total - paid;
    rows.push([k, paid, owed, paid - owed, balance]);
  }
  return rows;
}

/** A schedule row with the TR correction of the month: [k, payment, interest, amortization, balance, correction]. */
export type TrRow = [n: number, payment: number, interest: number, principal: number, balance: number, correction: number];

/** SAC: each month the TR corrects the balance, then the amortization is the corrected balance over the months to go. */
export function sacRows(loan: number, j: bigint, n: number, tr: number): TrRow[] {
  const rows: TrRow[] = [];
  let balance = loan;
  for (let k = 1; k <= n && balance > 0; k += 1) {
    const correction = share(balance, tr);
    const corrected = balance + correction;
    const owed = interest30(corrected, j);
    const amort = k === n ? corrected : Number(divRound(big(corrected), big(n - k + 1)));
    balance = corrected - amort;
    rows.push([k, amort + owed, owed, amort, balance, correction]);
  }
  return rows;
}

/** PRICE: with the TR at zero the first payment stays; with a TR it is worked out again on the corrected balance. */
export function priceTrRows(loan: number, j: bigint, n: number, tr: number): TrRow[] {
  const first = annuity30(loan, j, n);
  const rows: TrRow[] = [];
  let balance = loan;
  for (let k = 1; k <= n && balance > 0; k += 1) {
    const correction = share(balance, tr);
    const corrected = balance + correction;
    const owed = interest30(corrected, j);
    const total = corrected + owed;
    let paid = tr === 0 ? first : annuity30(corrected, j, n - k + 1);
    if (k === n || paid >= total) paid = total;
    balance = total - paid;
    rows.push([k, paid, owed, paid - owed, balance, correction]);
  }
  return rows;
}

export interface Totals {
  count: number;
  totalInterest: number;
  totalPaid: number;
  firstPayment: number;
  lastPayment: number;
}

function totals(rows: readonly (Row | TrRow)[]): Totals {
  let totalInterest = 0;
  let totalPaid = 0;
  for (const row of rows) {
    totalPaid += row[1];
    totalInterest += row[2];
  }
  return { count: rows.length, totalInterest, totalPaid, firstPayment: rows[0]?.[1] ?? 0, lastPayment: rows.at(-1)?.[1] ?? 0 };
}

// --- SAC x PRICE ---------------------------------------------------------------------------------------

export type Down = { kind: 'amount'; cents: number } | { kind: 'percent'; rate: number };

export interface SacPriceInput {
  price: number;
  down: Down;
  months: number;
  /** Interest per year, effective. */
  rate: number;
  /** TR per month. */
  tr: number;
  /** Insurance and fees per month, the same every month. */
  fees: number;
}

export interface SystemResult extends Totals {
  totalCorrection: number;
  /** Payments plus the insurance and fees of every month. */
  totalWithFees: number;
  rows: TrRow[];
}

export interface SacPriceResult {
  down: number;
  loan: number;
  sac: SystemResult;
  price: SystemResult;
  /** How much more interest the PRICE pays. */
  interestDiff: number;
}

function systemResult(rows: TrRow[], fees: number): SystemResult {
  const sums = totals(rows);
  return { ...sums, totalCorrection: rows.reduce((sum, row) => sum + row[5], 0), totalWithFees: sums.totalPaid + fees * rows.length, rows };
}

export function sacPrice(input: SacPriceInput): SacPriceResult {
  const down = input.down.kind === 'percent' ? share(input.price, input.down.rate) : input.down.cents;
  const loan = input.price - down;
  const j = yearRate30(input.rate);
  const sac = systemResult(sacRows(loan, j, input.months, input.tr), input.fees);
  const price = systemResult(priceTrRows(loan, j, input.months, input.tr), input.fees);
  return { down, loan, sac, price, interestDiff: price.totalInterest - sac.totalInterest };
}

// --- credit with the CET (vehicle, personal) -------------------------------------------------------------

/**
 * The CET of Res. CMN 4.881/2020: the monthly rate i with released = Σ p_k / (1 + i)^k, in equal monthly periods,
 * by bisection in floating point (the CET is shown with two decimals; the oracle refuses any case whose rate sits
 * within 10^-6 of a rounding boundary). Returns the month and the year, (1 + i)^12 − 1, in hundredths of a percent.
 */
export function cetHundredths(released: number, payments: readonly number[]): { month: number; year: number } {
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
  while (present(hi) > released) hi *= 2;
  for (let step = 0; step < 200; step += 1) {
    const mid = (lo + hi) / 2;
    if (mid === lo || mid === hi) break;
    if (present(mid) > released) lo = mid;
    else hi = mid;
  }
  const i = (lo + hi) / 2;
  return { month: Math.round(i * 10_000), year: Math.round(((1 + i) ** 12 - 1) * 10_000) };
}

export interface CreditCosts {
  months: number;
  /** Interest per month, effective. */
  rate: number;
  /** IOF and fees, in cents, as the offer says them. */
  iof: number;
  fees: number;
  /** IOF and fees financed with the loan, or paid at signing. */
  costs: 'financed' | 'upfront';
}

export interface CreditResult {
  credit: number;
  principal: number;
  upfront: number;
  /** FC0 of the CET: the credit less what is paid at signing. */
  released: number;
  payment: number;
  count: number;
  totalInterest: number;
  /** The payments plus what was paid at signing. */
  totalPaid: number;
  lastPayment: number;
  /** In hundredths of a percent; null when nothing is released. */
  cetMonth: number | null;
  cetYear: number | null;
  rows: Row[];
}

function credit(creditAmount: number, input: CreditCosts): CreditResult {
  const j = monthRate30(input.rate);
  const costs = input.iof + input.fees;
  const financed = input.costs === 'financed';
  const principal = creditAmount + (financed ? costs : 0);
  const upfront = financed ? 0 : costs;
  const released = creditAmount - upfront;
  const payment = annuity30(principal, j, input.months);
  const rows = priceRows(principal, j, input.months, payment);
  const sums = totals(rows);
  let cetMonth: number | null = null;
  let cetYear: number | null = null;
  if (released > 0 && rows.length > 0) {
    const payments = rows.map((row) => row[1]);
    if (sums.totalPaid <= released) {
      cetMonth = 0;
      cetYear = 0;
    } else {
      const cet = cetHundredths(released, payments);
      cetMonth = cet.month;
      cetYear = cet.year;
    }
  }
  return {
    credit: creditAmount,
    principal,
    upfront,
    released,
    payment,
    count: sums.count,
    totalInterest: sums.totalInterest,
    totalPaid: sums.totalPaid + upfront,
    lastPayment: sums.lastPayment,
    cetMonth,
    cetYear,
    rows,
  };
}

export interface VehicleLoanInput extends CreditCosts {
  price: number;
  down: number;
}

export function vehicleLoan(input: VehicleLoanInput): CreditResult {
  return credit(Math.max(0, input.price - input.down), input);
}

export interface BrPersonalLoanInput extends CreditCosts {
  amount: number;
}

export function brPersonalLoan(input: BrPersonalLoanInput): CreditResult {
  return credit(input.amount, input);
}

// --- early payoff ----------------------------------------------------------------------------------------

export interface EarlyPayoffInput {
  balance: number;
  /** Interest per month, effective. */
  rate: number;
  months: number;
  system: 'price' | 'sac';
  /** What the person pays now, before the next payment (Res. CMN 5.004/2022, art. 7). */
  prepay: number;
}

export interface PayoffPart extends Totals {
  rows: Row[];
}

export interface SavedPart extends PayoffPart {
  interestSaved: number;
  monthsSaved: number;
}

export interface EarlyPayoffResult {
  /** The balance after the prepayment. */
  left: number;
  base: PayoffPart;
  /** Same payment (PRICE) or amortization (SAC), fewer months. */
  shorter: SavedPart;
  /** Same months, lower payment. */
  lower: SavedPart;
}

/** SAC that keeps one amortization until the balance is gone. */
function fixedSacRows(principal: number, j: bigint, amort: number): Row[] {
  const rows: Row[] = [];
  let balance = principal;
  for (let k = 1; balance > 0; k += 1) {
    const owed = interest30(balance, j);
    const part = Math.min(amort, balance);
    balance -= part;
    rows.push([k, part + owed, owed, part, balance]);
  }
  return rows;
}

const plainSac = (principal: number, j: bigint, n: number): Row[] => sacRows(principal, j, n, 0).map((row) => [row[0], row[1], row[2], row[3], row[4]]);

export function earlyPayoff(input: EarlyPayoffInput): EarlyPayoffResult {
  const j = monthRate30(input.rate);
  const left = input.balance - input.prepay;
  let base: Row[];
  let shorter: Row[];
  let lower: Row[];
  if (input.system === 'price') {
    const payment = annuity30(input.balance, j, input.months);
    base = priceRows(input.balance, j, input.months, payment);
    shorter = priceRows(left, j, input.months, payment);
    lower = priceRows(left, j, input.months, annuity30(left, j, input.months));
  } else {
    base = plainSac(input.balance, j, input.months);
    shorter = fixedSacRows(left, j, base[0]?.[3] ?? 0);
    lower = plainSac(left, j, input.months);
  }
  const baseTotals = totals(base);
  const saved = (rows: Row[]): SavedPart => {
    const sums = totals(rows);
    return { ...sums, interestSaved: baseTotals.totalInterest - sums.totalInterest, monthsSaved: base.length - rows.length, rows };
  };
  return { left, base: { ...baseTotals, rows: base }, shorter: saved(shorter), lower: saved(lower) };
}

// --- credit card -----------------------------------------------------------------------------------------

export interface CreditCardInput {
  bill: number;
  minimum: number;
  /** Interest of the revolving credit and of the installment plan, per month, effective. */
  revolvingRate: number;
  installmentRate: number;
  installments: number;
  /** IOF in cents, financed with the installment plan (outside the cap). */
  iof: number;
}

export interface CardPlan {
  financed: number;
  payment: number;
  count: number;
  totalInterest: number;
  totalPaid: number;
  /** The interest reached the cap of Lei 14.690/2023, art. 28. */
  capped: boolean;
  lastPayment: number;
  rows: Row[];
}

export interface CreditCardResult {
  /** A: the minimum now, the rest one month on the revolving credit, then the installment plan. */
  a: CardPlan & { minimum: number; revolving: number; revolvingInterest: number };
  /** B: the whole bill in installments now. */
  b: CardPlan;
  /** How much more A costs than B, in all. */
  diff: number;
}

function cardPlan(financed: number, j: bigint, n: number, cap: number, carried: number, paidNow: number): CardPlan {
  const payment = annuity30(financed, j, n);
  const rows = financed > 0 ? priceRows(financed, j, n, payment, cap - carried) : [];
  const sums = totals(rows);
  const totalInterest = carried + sums.totalInterest;
  return {
    financed,
    payment: rows.length > 0 ? payment : 0,
    count: rows.length,
    totalInterest,
    totalPaid: paidNow + sums.totalPaid,
    capped: totalInterest === cap && cap > 0,
    lastPayment: sums.lastPayment,
    rows,
  };
}

export function creditCard(input: CreditCardInput): CreditCardResult {
  const rest = input.bill - input.minimum;
  const revolving = Math.min(interest30(rest, monthRate30(input.revolvingRate)), rest);
  const jp = monthRate30(input.installmentRate);
  const financedA = rest + revolving + (rest > 0 ? input.iof : 0);
  const planA = cardPlan(financedA, jp, input.installments, rest, revolving, input.minimum);
  const a = { minimum: input.minimum, revolving: rest, revolvingInterest: revolving, ...planA };
  const b = cardPlan(input.bill + input.iof, jp, input.installments, input.bill, 0, 0);
  return { a, b, diff: a.totalPaid - b.totalPaid };
}

// --- debts: snowball x avalanche with monthly rates -----------------------------------------------------

export interface BrDebt {
  balance: number;
  /** Interest per month, effective. */
  rate: number;
  minimum: number;
}

export interface BrDebtPayoffInput {
  debts: BrDebt[];
  extra: number;
}

/**
 * The English engine with each monthly rate as twelve times itself: interest(b, 12r) = b·12r / (12·ONE) = b·r / ONE,
 * the same fraction with the same rounding, and the avalanche order of 12r is the order of r.
 */
export function brDebtPayoff(input: BrDebtPayoffInput): DebtPayoffResult {
  return debtPayoff({ debts: input.debts.map((debt) => ({ balance: debt.balance, apr: 12 * debt.rate, minimum: debt.minimum })), extra: input.extra });
}

// --- compound interest ----------------------------------------------------------------------------------

export interface BrCompoundInput {
  initial: number;
  monthly: number;
  rate: number;
  unit: 'month' | 'year';
  months: number;
}

export type BrCompoundResult = BrCompoundGrowth | { error: 'too-large' };

export interface BrCompoundGrowth {
  final: number;
  deposits: number;
  interest: number;
  /** One row per 12 months (and the last, shorter one): [year, deposits, interest, balance at its end]. */
  years: [year: number, deposits: number, interest: number, balance: number][];
}

/** The balance month by month, deposits at the end of the month; past 10^15 cents (a double would lose cents), "too-large". */
export function brCompound(input: BrCompoundInput): BrCompoundResult {
  const j = input.unit === 'month' ? monthRate30(input.rate) : yearRate30(input.rate);
  let balance = input.initial;
  let deposits = 0;
  let earned = 0;
  const years: BrCompoundGrowth['years'] = [];
  for (let m = 1; m <= input.months; m += 1) {
    const owed = interest30(balance, j);
    balance += owed + input.monthly;
    if (balance > MAX_CENTS) return { error: 'too-large' };
    earned += owed;
    deposits += input.monthly;
    if (m % 12 === 0 || m === input.months) {
      years.push([Math.floor((m + 11) / 12), deposits, earned, balance]);
      deposits = 0;
      earned = 0;
    }
  }
  const total = input.initial + input.monthly * input.months;
  return { final: balance, deposits: total, interest: balance - total, years };
}

// --- rent or buy ----------------------------------------------------------------------------------------

export interface RentOrBuyInput {
  price: number;
  down: number;
  rent: number;
  years: number;
  system: 'sac' | 'price';
  /** Interest of the financing per year, effective. */
  rate: number;
  months: number;
  /** ITBI and the notary, in shares of the price, paid at the purchase. */
  itbiRate: number;
  notaryRate: number;
  iptuYear: number;
  /** Upkeep per year, as a share of the value at the start of the year. */
  maintenanceRate: number;
  appreciationRate: number;
  sellingRate: number;
  rentIncreaseRate: number;
  /** Yearly effective return on what each path invests. */
  returnRate: number;
}

export interface RentOrBuyResult {
  payment: number;
  upfront: number;
  iptuMonth: number;
  buyer: number[];
  renter: number[];
  breakEven: number | null;
  buyerFinal: number;
  renterFinal: number;
  totalRent: number;
  totalOwnerCost: number;
}

const grow = (amount: number, rate: number): number => Number(divRound(big(amount) * big(ONE + rate), big(ONE)));

export function rentOrBuy(input: RentOrBuyInput): RentOrBuyResult {
  const loan = input.price - input.down;
  const j = yearRate30(input.rate);
  const rows = input.system === 'sac' ? sacRows(loan, j, input.months, 0) : priceTrRows(loan, j, input.months, 0);
  const upfront = share(input.price, input.itbiRate) + share(input.price, input.notaryRate);
  const iptuMonth = Number(divRound(big(input.iptuYear), 12n));
  const jr = yearRate30(input.returnRate);
  let value = input.price;
  let rent = input.rent;
  let buyerSaved = 0;
  let renterSaved = input.down + upfront;
  let totalRent = 0;
  let totalOwnerCost = 0;
  let breakEven: number | null = null;
  const buyer: number[] = [];
  const renter: number[] = [];
  for (let y = 1; y <= input.years; y += 1) {
    const upkeep = Number(divRound(big(value) * big(input.maintenanceRate), big(12 * ONE)));
    for (let m = 1; m <= 12; m += 1) {
      const k = (y - 1) * 12 + m;
      const owner = (k <= rows.length ? rows[k - 1]![1] : 0) + iptuMonth + upkeep;
      totalOwnerCost += owner;
      totalRent += rent;
      buyerSaved += interest30(buyerSaved, jr);
      renterSaved += interest30(renterSaved, jr);
      if (owner > rent) renterSaved += owner - rent;
      else if (rent > owner) buyerSaved += rent - owner;
    }
    value = grow(value, input.appreciationRate);
    rent = grow(rent, input.rentIncreaseRate);
    const k = y * 12;
    const owed = k <= rows.length ? rows[k - 1]![4] : 0;
    const net = grow(value, -input.sellingRate) - owed + buyerSaved;
    buyer.push(net);
    renter.push(renterSaved);
    if (breakEven === null && net >= renterSaved) breakEven = y;
  }
  return {
    payment: rows[0]?.[1] ?? 0,
    upfront,
    iptuMonth,
    buyer,
    renter,
    breakEven,
    buyerFinal: buyer.at(-1) ?? 0,
    renterFinal: renter.at(-1) ?? 0,
    totalRent,
    totalOwnerCost,
  };
}
