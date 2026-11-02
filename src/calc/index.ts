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
import { brCompound, brDebtPayoff, brPersonalLoan, creditCard, earlyPayoff, rentOrBuy, sacPrice, vehicleLoan } from './br.ts';
import { btu, concrete, mulch, paint, squareFootage, tile } from './home.ts';
import { bmi, bodyFat, calorie, dueDate, ovulation } from './health.ts';

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
  // The calculators adapted to Brazil (F6; oracle: scripts/oracle/calc_br.py).
  'br-sac-price': sacPrice,
  'br-vehicle-loan': vehicleLoan,
  'br-personal-loan': brPersonalLoan,
  'br-early-payoff': earlyPayoff,
  'br-credit-card': creditCard,
  'br-debt-payoff': brDebtPayoff,
  'br-compound-interest': brCompound,
  'br-rent-or-buy': rentOrBuy,
  // The home and health calculators (F7; oracle: scripts/oracle/calc_home_health.py).
  'square-footage-calculator': squareFootage,
  'concrete-calculator': concrete,
  'mulch-calculator': mulch,
  'paint-calculator': paint,
  'tile-calculator': tile,
  'btu-calculator': btu,
  'bmi-calculator': bmi,
  'calorie-calculator': calorie,
  'ovulation-calculator': ovulation,
  'body-fat-calculator': bodyFat,
  'due-date-calculator': dueDate,
} as const;

export type CalcId = keyof typeof ENGINES;
export const CALC_IDS = Object.keys(ENGINES) as CalcId[];
export type EngineInput<Id extends CalcId> = Parameters<(typeof ENGINES)[Id]>[0];
export type EngineResult<Id extends CalcId> = ReturnType<(typeof ENGINES)[Id]>;
