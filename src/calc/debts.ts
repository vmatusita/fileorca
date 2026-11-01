// The debt calculators: credit card payoff, debt payoff (snowball and avalanche) and debt consolidation.
// Same contract as loans.ts: whole numbers in, exactly the oracle's output out (fixtures/calc/).
import { MAX_MONTHS, amortize, annuityPayment, interest, schedule, share, summarize, type Summary } from './money.ts';

export type CardInput =
  | { balance: number; apr: number; mode: 'payment'; payment: number }
  | { balance: number; apr: number; mode: 'months'; months: number };

export type CardResult =
  | (Summary & { payment: number; months: number })
  /** The payment does not cover the first month's interest; `minimum` is the smallest one that does. */
  | { error: 'too-low'; minimum: number }
  | { error: 'too-long' };

export function creditCardPayoff(input: CardInput): CardResult {
  const first = interest(input.balance, input.apr);
  if (input.mode === 'payment') {
    if (input.payment <= first) return { error: 'too-low', minimum: first + 1 };
    const rows = amortize(input.balance, input.apr, Infinity, input.payment, 12, undefined, MAX_MONTHS);
    if (!rows) return { error: 'too-long' };
    return { payment: input.payment, months: rows.length, ...summarize(rows) };
  }
  const payment = annuityPayment(input.balance, input.apr, input.months);
  const rows = schedule(input.balance, input.apr, input.months, payment);
  return { payment, months: rows.length, ...summarize(rows) };
}

export interface Debt {
  balance: number;
  apr: number;
  minimum: number;
}

export interface PayoffPlan {
  months: number;
  totalInterest: number;
  totalPaid: number;
  /** The month each debt is paid off, in the order the debts were entered. */
  paidOff: number[];
  /** Debt indexes in the order they are paid off. */
  payoffOrder: number[];
  /** What is still owed on all debts at the end of each year. */
  yearEnd: number[];
}

export interface DebtPayoffInput {
  debts: Debt[];
  extra: number;
}

export type DebtPayoffResult =
  | { budget: number; snowball: PayoffPlan; avalanche: PayoffPlan; interestDiff: number; monthsDiff: number }
  | { error: 'too-low'; minimum: number; budget: number }
  | { error: 'too-long'; budget: number };

/**
 * One month at a time: interest on every debt, the minimum on every debt (never more than it owes), then
 * whatever is left of the budget (the minimums plus the extra) to the debts in `order`. A paid-off debt's
 * minimum stays in the budget, so it rolls to the next one.
 */
export function payoffPlan(debts: readonly Debt[], extra: number, order: readonly number[]): PayoffPlan | null {
  const balances = debts.map((debt) => debt.balance);
  const budget = debts.reduce((sum, debt) => sum + debt.minimum, 0) + extra;
  const paidOff: (number | null)[] = debts.map(() => null);
  const yearEnd: number[] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  while (balances.some((balance) => balance > 0)) {
    month += 1;
    if (month > MAX_MONTHS) return null;
    const owed = balances.map((balance, i) => {
      if (balance <= 0) return 0;
      const it = interest(balance, debts[i]!.apr);
      totalInterest += it;
      return balance + it;
    });
    const pay = owed.map((o, i) => Math.min(debts[i]!.minimum, o));
    let left = budget - pay.reduce((sum, p) => sum + p, 0);
    for (const i of order) {
      const room = owed[i]! - pay[i]!;
      if (room > 0 && left > 0) {
        const x = Math.min(room, left);
        pay[i]! += x;
        left -= x;
      }
    }
    for (let i = 0; i < debts.length; i += 1) {
      if (owed[i]! > 0) {
        balances[i] = owed[i]! - pay[i]!;
        if (balances[i] === 0) paidOff[i] = month;
      }
    }
    totalPaid += pay.reduce((sum, p) => sum + p, 0);
    if (month % 12 === 0) yearEnd.push(balances.reduce((sum, b) => sum + b, 0));
  }
  if (month % 12 !== 0) yearEnd.push(0);
  const position = new Map(order.map((debt, rank) => [debt, rank]));
  const done = paidOff as number[];
  const payoffOrder = debts.map((_, i) => i).sort((a, b) => done[a]! - done[b]! || position.get(a)! - position.get(b)!);
  return { months: month, totalInterest, totalPaid, paidOff: done, payoffOrder, yearEnd };
}

/** Smallest balance first (ties: the order entered). */
export function snowballOrder(debts: readonly Debt[]): number[] {
  return debts.map((_, i) => i).sort((a, b) => debts[a]!.balance - debts[b]!.balance || a - b);
}

/** Highest APR first (ties: the order entered). */
export function avalancheOrder(debts: readonly Debt[]): number[] {
  return debts.map((_, i) => i).sort((a, b) => debts[b]!.apr - debts[a]!.apr || a - b);
}

export function debtPayoff(input: DebtPayoffInput): DebtPayoffResult {
  const budget = input.debts.reduce((sum, debt) => sum + debt.minimum, 0) + input.extra;
  const first = input.debts.reduce((sum, debt) => sum + interest(debt.balance, debt.apr), 0);
  if (budget <= first) return { error: 'too-low', minimum: first + 1, budget };
  const snowball = payoffPlan(input.debts, input.extra, snowballOrder(input.debts));
  const avalanche = payoffPlan(input.debts, input.extra, avalancheOrder(input.debts));
  if (!snowball || !avalanche) return { error: 'too-long', budget };
  return {
    budget,
    snowball,
    avalanche,
    interestDiff: snowball.totalInterest - avalanche.totalInterest,
    monthsDiff: snowball.months - avalanche.months,
  };
}

export interface CurrentDebt {
  balance: number;
  apr: number;
  payment: number;
}

export interface ConsolidationInput {
  debts: CurrentDebt[];
  newRate: number;
  newMonths: number;
  /** Origination fee, added to the new loan. */
  feeRate: number;
}

export type ConsolidationResult =
  | {
      principal: number;
      current: { payment: number; months: number; totalInterest: number; totalPaid: number };
      new: Summary & { loan: number; fee: number; payment: number; months: number };
      paymentDiff: number;
      interestDiff: number;
      costDiff: number;
      monthsDiff: number;
    }
  | { error: 'too-low'; debt: number; minimum: number }
  | { error: 'too-long'; debt: number };

export function debtConsolidation(input: ConsolidationInput): ConsolidationResult {
  const current = { payment: 0, months: 0, totalInterest: 0, totalPaid: 0 };
  for (const [index, debt] of input.debts.entries()) {
    const first = interest(debt.balance, debt.apr);
    if (debt.payment <= first) return { error: 'too-low', debt: index, minimum: first + 1 };
    const rows = amortize(debt.balance, debt.apr, Infinity, debt.payment, 12, undefined, MAX_MONTHS);
    if (!rows) return { error: 'too-long', debt: index };
    const summary = summarize(rows);
    current.payment += debt.payment;
    current.months = Math.max(current.months, rows.length);
    current.totalInterest += summary.totalInterest;
    current.totalPaid += summary.totalPaid;
  }
  const principal = input.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const fee = share(principal, input.feeRate);
  const payment = annuityPayment(principal + fee, input.newRate, input.newMonths);
  const summary = summarize(schedule(principal + fee, input.newRate, input.newMonths, payment));
  return {
    principal,
    current,
    new: { loan: principal + fee, fee, payment, months: summary.count, ...summary },
    paymentDiff: current.payment - payment,
    interestDiff: current.totalInterest - (summary.totalInterest + fee),
    costDiff: current.totalPaid - summary.totalPaid,
    monthsDiff: current.months - summary.count,
  };
}
