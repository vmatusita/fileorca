// The arithmetic every money calculator shares (PLANO "Regra das calculadoras"; DECISOES § 111).
// Money is an integer number of cents, kept in a JS number (always a safe integer: inputs are capped and
// a result past MAX_CENTS is an error). A rate is an integer in 1/10,000 of a percentage point, so
// 6.5% is 65000 and any rate typed with up to four decimals is exact. Every division that rounds is
// done on BigInt and rounded half up (away from zero), the rule of Python's decimal.ROUND_HALF_UP that
// the oracle uses (scripts/oracle/calc.py), so the engine and the oracle land on the same cent without
// floating point. Nothing in src/calc imports from outside the folder (eslint.config.ts).

/** Rate units in one percentage point: 6.5% is 65000. */
export const RATE_SCALE = 10_000;
/** Rate units in 1.0 (100%). */
export const ONE = 100 * RATE_SCALE;
/** A payoff loop past this many months is the error "too-long". */
export const MAX_MONTHS = 1200;
/** A balance past this many cents ($10 trillion) is the error "too-large". */
export const MAX_CENTS = 1e15;
/** Decimals kept when a monthly rate comes from another compounding (it is cut, not rounded). */
export const ROOT_DIGITS = 30;

const big = BigInt;
const ROOT_SCALE = 10n ** big(ROOT_DIGITS);

/** num / den rounded half up, away from zero (den > 0). */
export function divRound(num: bigint, den: bigint): bigint {
  const q = num / den;
  const r = num % den;
  if (2n * (r < 0n ? -r : r) >= den) return num < 0n ? q - 1n : q + 1n;
  return q;
}

/** floor(num / den), den > 0. */
export function divFloor(num: bigint, den: bigint): bigint {
  const q = num / den;
  return num % den !== 0n && num < 0n ? q - 1n : q;
}

/** ceil(num / den), den > 0. */
export function divCeil(num: bigint, den: bigint): bigint {
  const q = num / den;
  return num % den !== 0n && num > 0n ? q + 1n : q;
}

/** One period of interest on a balance, rounded to the cent, half up. */
export function interest(balance: number, rate: number, perYear = 12): number {
  return Number(divRound(big(balance) * big(rate), big(ONE * perYear)));
}

/** A yearly amount as a monthly one (tax and insurance), half up. */
export function perMonth(perYear: number): number {
  return Number(divRound(big(perYear), 12n));
}

/** `rate` of `amount` (a down payment in %, a fee), half up. */
export function share(amount: number, rate: number): number {
  return Number(divRound(big(amount) * big(rate), big(ONE)));
}

/** The payment of the closed formula P = L·i / (1 − (1 + i)^−n), exact, rounded half up; at 0%, L / n. */
export function annuityPayment(principal: number, rate: number, n: number, perYear = 12): number {
  if (principal === 0) return 0;
  if (rate === 0) return Number(divRound(big(principal), big(n)));
  const d = big(ONE * perYear);
  const r = big(rate);
  const grown = (d + r) ** big(n);
  return Number(divRound(big(principal) * r * grown, d * (grown - d ** big(n))));
}

/** The largest loan a payment pays off in n periods, L = P·(1 − (1 + i)^−n) / i, rounded down. */
export function presentValue(payment: number, rate: number, n: number, perYear = 12): number {
  if (rate === 0) return payment * n;
  const d = big(ONE * perYear);
  const r = big(rate);
  const grown = (d + r) ** big(n);
  return Number(divFloor(big(payment) * d * (grown - d ** big(n)), r * grown));
}

/** A schedule row: payment number, payment, interest, principal, balance after the payment. */
export type Row = [n: number, payment: number, interest: number, principal: number, balance: number];

/**
 * The cent loop. Each period the interest is added and the payment (plus any extra) taken; at the last
 * period, or as soon as the payment covers the balance and its interest, the payment is exactly that, so
 * the last payment zeroes the balance. Returns null when the loop passes `limit` periods.
 */
export function amortize(
  principal: number,
  rate: number,
  n: number,
  payment: number,
  perYear = 12,
  extra?: (k: number) => number,
  limit?: number,
): Row[] | null {
  const rows: Row[] = [];
  let balance = principal;
  let k = 0;
  while (balance > 0) {
    k += 1;
    if (limit !== undefined && k > limit) return null;
    const owed = interest(balance, rate, perYear);
    const due = payment + (extra ? extra(k) : 0);
    const total = balance + owed;
    const paid = k >= n || due >= total ? total : due;
    balance = total - paid;
    rows.push([k, paid, owed, paid - owed, balance]);
  }
  return rows;
}

/** The same loop for a schedule that always ends (a finite n, no limit). */
export function schedule(principal: number, rate: number, n: number, payment: number, perYear = 12, extra?: (k: number) => number): Row[] {
  return amortize(principal, rate, n, payment, perYear, extra) ?? [];
}

/** Balance at the end of each loan year (the last entry is the payoff, 0). */
export function yearEnd(rows: readonly Row[], perYear = 12): number[] {
  const out: number[] = [];
  for (let end = perYear; end < rows.length + perYear; end += perYear) out.push(rows[Math.min(end, rows.length) - 1]![4]);
  return out;
}

export interface Summary {
  count: number;
  totalInterest: number;
  totalPaid: number;
  lastPayment: number;
  yearEnd: number[];
  rows: Row[];
}

export function summarize(rows: Row[], perYear = 12): Summary {
  let totalInterest = 0;
  let totalPaid = 0;
  for (const row of rows) {
    totalPaid += row[1];
    totalInterest += row[2];
  }
  return { count: rows.length, totalInterest, totalPaid, lastPayment: rows.at(-1)?.[1] ?? 0, yearEnd: yearEnd(rows, perYear), rows };
}

/** Interest paid up to and including each payment. */
export function cumulativeInterest(rows: readonly Row[]): number[] {
  let total = 0;
  return rows.map((row) => (total += row[2]));
}

/** floor(m^(1/k)) for m ≥ 0, by Newton's method on integers. */
export function iroot(m: bigint, k: number): bigint {
  if (m < 2n) return m;
  const kb = big(k);
  let x = 1n << big(Math.ceil(m.toString(2).length / k));
  for (;;) {
    const y = ((kb - 1n) * x + m / x ** (kb - 1n)) / kb;
    if (y >= x) return x;
    x = y;
  }
}

/**
 * floor(10^30 · ((1 + r/comp)^(comp/12) − 1)): the monthly rate of a yearly rate compounded `comp`
 * times a year, cut to 30 decimals (a whole number of 10^−30).
 */
export function monthlyRate30(rate: number, comp: number): bigint {
  const base = big(ONE * comp);
  const grown = (base + big(rate)) ** big(comp);
  return iroot((grown * ROOT_SCALE ** 12n) / base ** big(comp), 12) - ROOT_SCALE;
}

/** Interest of one month at a rate cut to 30 decimals, half up. */
export function interest30(balance: number, rate30: bigint): number {
  return Number(divRound(big(balance) * rate30, ROOT_SCALE));
}

/** The k-th root of 1 + rate, cut to 30 decimals: floor(10^30 · (1 + r)^(1/k)). */
export function root30(rate: number, k: number): bigint {
  return iroot((big(ONE + rate) * ROOT_SCALE ** big(k)) / big(ONE), k);
}

export const ROOT_ONE = ROOT_SCALE;
