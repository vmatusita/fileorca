// Every calculator definition, by page id: the island imports this map, so the one calculator entry
// (src/tools/calc/mount.ts) carries the 18 definitions and the engines, and moving from one calculator to
// another costs only the HTML (DECISOES § 110).
import type { CalcPageId } from '../registry.ts';
import type { CalcDef } from '../types.ts';
import { creditCardDef, consolidationDef, debtPayoffDef } from './debts.ts';
import { affordabilityDef, biweeklyDef, extraPaymentsDef, fifteenVsThirtyDef, refinanceDef } from './homes.ts';
import { autoLoanDef, balloonDef, loanAmortizationDef, personalLoanDef } from './loans.ts';
import { mortgageDef } from './mortgage.ts';
import { rentVsBuyDef } from './rent.ts';
import { aprApyDef, compoundDef, savingsGoalDef, simpleInterestDef } from './savings.ts';

const defs = [
  mortgageDef,
  personalLoanDef,
  autoLoanDef,
  refinanceDef,
  affordabilityDef,
  loanAmortizationDef,
  creditCardDef,
  debtPayoffDef,
  consolidationDef,
  rentVsBuyDef,
  compoundDef,
  savingsGoalDef,
  simpleInterestDef,
  aprApyDef,
  extraPaymentsDef,
  biweeklyDef,
  fifteenVsThirtyDef,
  balloonDef,
] as unknown as CalcDef[];

export const DEFS = Object.fromEntries(defs.map((def) => [def.id, def])) as Record<CalcPageId, CalcDef>;
