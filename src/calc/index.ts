// The engines of the money calculators, by page id (the route id: the slug with "/" turned into "-").
// tests/unit/calc-oracle.test.ts runs each one against fixtures/calc/<id>.json; the island imports the
// engine of its own page through the calculator registry (src/tools/calc/registry.ts).
import { creditCardPayoff, debtConsolidation, debtPayoff } from './debts.ts';
import {
  autoLoan,
  balloonLoan,
  homeAffordability,
  loanAmortization,
  mortgage,
  mortgage15vs30,
  mortgageBiweekly,
  mortgageExtraPayments,
  personalLoan,
  refinance,
} from './loans.ts';
import { rentVsBuy } from './rent-vs-buy.ts';
import { aprToApy, compoundInterest, savingsGoal, simpleInterest } from './savings.ts';

export const ENGINES = {
  'mortgage-calculator': mortgage,
  'personal-loan-calculator': personalLoan,
  'auto-loan-calculator': autoLoan,
  'refinance-calculator': refinance,
  'home-affordability-calculator': homeAffordability,
  'loan-amortization-calculator': loanAmortization,
  'compound-interest-calculator': compoundInterest,
  'credit-card-payoff-calculator': creditCardPayoff,
  'debt-payoff-calculator': debtPayoff,
  'rent-vs-buy-calculator': rentVsBuy,
  'mortgage-calculator-extra-payments': mortgageExtraPayments,
  'mortgage-calculator-biweekly': mortgageBiweekly,
  'mortgage-calculator-15-vs-30-year': mortgage15vs30,
  'loan-amortization-calculator-balloon-payment': balloonLoan,
  'savings-goal-calculator': savingsGoal,
  'debt-consolidation-calculator': debtConsolidation,
  'simple-interest-calculator': simpleInterest,
  'apr-to-apy-calculator': aprToApy,
} as const;

export type CalcId = keyof typeof ENGINES;
export const CALC_IDS = Object.keys(ENGINES) as CalcId[];
export type EngineInput<Id extends CalcId> = Parameters<(typeof ENGINES)[Id]>[0];
export type EngineResult<Id extends CalcId> = ReturnType<(typeof ENGINES)[Id]>;
