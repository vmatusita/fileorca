// The saving calculators: compound interest, savings goal, simple interest and APR to APY. Same contract
// as loans.ts: whole numbers in, exactly the oracle's output out (fixtures/calc/).
import {
  MAX_CENTS,
  MAX_MONTHS,
  ONE,
  ROOT_ONE,
  divCeil,
  divRound,
  interest,
  interest30,
  monthlyRate30,
  root30,
} from './money.ts';

export const COMPOUNDINGS = [1, 2, 4, 12, 365] as const;
export type Compounding = (typeof COMPOUNDINGS)[number];

export interface CompoundInput {
  initial: number;
  monthly: number;
  rate: number;
  compounding: Compounding;
  years: number;
  /** Monthly deposits at the start or at the end of each month. */
  timing: 'begin' | 'end';
}

/** A year of the compound table: year, deposits that year, interest that year, balance at the end. */
export type YearRow = [year: number, deposits: number, interest: number, balance: number];

export type CompoundResult =
  | {
      /** The monthly rate cut to 30 decimals (a whole number of 10^−30), null when it is exactly rate / 12. */
      monthlyRate30: string | null;
      final: number;
      contributed: number;
      interest: number;
      yearEnd: number[];
      years: YearRow[];
    }
  | { error: 'too-large' };

export function compoundInterest(input: CompoundInput): CompoundResult {
  const rate30 = input.compounding === 12 ? null : monthlyRate30(input.rate, input.compounding);
  const begin = input.timing === 'begin';
  let balance = input.initial;
  let contributed = input.initial;
  const years: YearRow[] = [];
  for (let y = 1; y <= input.years; y += 1) {
    let deposits = 0;
    let earned = 0;
    for (let m = 0; m < 12; m += 1) {
      if (begin) {
        balance += input.monthly;
        deposits += input.monthly;
      }
      const it = rate30 === null ? interest(balance, input.rate) : interest30(balance, rate30);
      balance += it;
      earned += it;
      if (!begin) {
        balance += input.monthly;
        deposits += input.monthly;
      }
    }
    // The balance never goes down, so passing the cap at any point means passing it at the end.
    if (balance > MAX_CENTS) return { error: 'too-large' };
    contributed += deposits;
    years.push([y, deposits, earned, balance]);
  }
  return {
    monthlyRate30: rate30 === null ? null : rate30.toString(),
    final: balance,
    contributed,
    interest: balance - contributed,
    yearEnd: years.map((row) => row[3]),
    years,
  };
}

export type SavingsInput =
  | { goal: number; current: number; rate: number; mode: 'months'; months: number }
  | { goal: number; current: number; rate: number; mode: 'deposit'; deposit: number };

/** A month of the savings plan: month, deposit, interest, balance at the end. */
export type SavingsRow = [month: number, deposit: number, interest: number, balance: number];

export type SavingsResult =
  | { deposit: number; months: number; final: number; deposited: number; interest: number; yearEnd: number[]; rows: SavingsRow[] }
  | { error: 'too-long' | 'too-large' };

function savingsRun(current: number, rate: number, deposit: number, months: number): SavingsRow[] {
  const rows: SavingsRow[] = [];
  let balance = current;
  for (let m = 1; m <= months; m += 1) {
    const it = interest(balance, rate);
    balance += it + deposit;
    rows.push([m, deposit, it, balance]);
  }
  return rows;
}

/**
 * The smallest whole-cent monthly deposit that takes the balance to the goal by month n: the closed
 * formula (rounded up) gives a first value, and the cent loop moves it to the exact smallest one.
 */
function depositFor(goal: number, current: number, rate: number, n: number): number {
  const reaches = (deposit: number): boolean => savingsRun(current, rate, deposit, n).at(-1)![3] >= goal;
  let deposit: number;
  if (rate === 0) deposit = Math.max(0, Number(divCeil(BigInt(goal - current), BigInt(n))));
  else {
    const d = BigInt(ONE * 12);
    const grown = (d + BigInt(rate)) ** BigInt(n);
    const base = d ** BigInt(n);
    const gap = BigInt(goal) * base - BigInt(current) * grown;
    deposit = gap <= 0n ? 0 : Number(divCeil(gap * BigInt(rate), d * (grown - base)));
  }
  while (deposit > 0 && reaches(deposit - 1)) deposit -= 1;
  while (!reaches(deposit)) deposit += 1;
  return deposit;
}

export function savingsGoal(input: SavingsInput): SavingsResult {
  const { goal, current, rate } = input;
  let deposit: number;
  let rows: SavingsRow[];
  if (input.mode === 'months') {
    deposit = current >= goal ? 0 : depositFor(goal, current, rate, input.months);
    rows = savingsRun(current, rate, deposit, input.months);
  } else {
    deposit = input.deposit;
    rows = [];
    let balance = current;
    while (balance < goal) {
      if (rows.length >= MAX_MONTHS) return { error: 'too-long' };
      const it = interest(balance, rate);
      balance += it + deposit;
      rows.push([rows.length + 1, deposit, it, balance]);
    }
  }
  // The balance only grows: past MAX_CENTS it is "too-large", as in compound interest (a goal already met, left
  // for decades at a high rate, outgrew what a number holds exactly).
  if ((rows.at(-1)?.[3] ?? 0) > MAX_CENTS) return { error: 'too-large' };
  const final = rows.at(-1)?.[3] ?? current;
  const deposited = deposit * rows.length;
  const yearEnd: number[] = [];
  for (let end = 12; end < rows.length + 12; end += 12) yearEnd.push(rows[Math.min(end, rows.length) - 1]![3]);
  return { deposit, months: rows.length, final, deposited, interest: final - current - deposited, yearEnd, rows };
}

export interface SimpleInterestInput {
  principal: number;
  rate: number;
  unit: 'years' | 'months' | 'days';
  /** A whole number of the unit; a year has 365 days. */
  time: number;
}

export interface SimpleInterestResult {
  interest: number;
  total: number;
}

const PER_YEAR: Record<SimpleInterestInput['unit'], number> = { years: 1, months: 12, days: 365 };

export function simpleInterest(input: SimpleInterestInput): SimpleInterestResult {
  const it = Number(divRound(BigInt(input.principal) * BigInt(input.rate) * BigInt(input.time), BigInt(ONE * PER_YEAR[input.unit])));
  return { interest: it, total: input.principal + it };
}

export interface AprApyInput {
  rate: number;
  compounding: Compounding;
  direction: 'apr-to-apy' | 'apy-to-apr';
}

export interface AprApyResult {
  /** The other rate, in hundredths of a percent (5.13% = 513), rounded half up as Regulation DD asks. */
  result: number;
  /** The same conversion for every compounding. */
  table: [Compounding, number][];
}

/** APY = (1 + r/n)^n − 1, exact, in hundredths of a percent, half up. */
export function apyHundredths(rate: number, comp: number): number {
  const base = BigInt(ONE * comp) ** BigInt(comp);
  const grown = (BigInt(ONE * comp) + BigInt(rate)) ** BigInt(comp);
  return Number(divRound((grown - base) * 10_000n, base));
}

/** APR = n · ((1 + APY)^(1/n) − 1), from the root cut to 30 decimals, in hundredths of a percent, half up. */
export function aprFromApyHundredths(rate: number, comp: number): number {
  return Number(divRound(BigInt(comp) * (root30(rate, comp) - ROOT_ONE) * 10_000n, ROOT_ONE));
}

export function aprToApy(input: AprApyInput): AprApyResult {
  const convert = input.direction === 'apr-to-apy' ? apyHundredths : aprFromApyHundredths;
  return { result: convert(input.rate, input.compounding), table: COMPOUNDINGS.map((comp): [Compounding, number] => [comp, convert(input.rate, comp)]) };
}
