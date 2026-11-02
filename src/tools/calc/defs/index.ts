// Every calculator definition, by page id: the island imports this map, so the one calculator entry
// (src/tools/calc/mount.ts) carries the 37 definitions and the engines (the 8 Brazilian ones since the F6, the 11 home and health
// ones since the F7, DECISOES § 236 and § 257), and moving from one calculator to
// another costs only the HTML (DECISOES § 110).
import type { AnyCalcId } from '../registry.ts';
import type { CalcDef } from '../types.ts';
import { creditCardDef, consolidationDef, debtPayoffDef } from './debts.ts';
import { affordabilityDef, biweeklyDef, extraPaymentsDef, fifteenVsThirtyDef, refinanceDef } from './homes.ts';
import { autoLoanDef, balloonDef, loanAmortizationDef, personalLoanDef } from './loans.ts';
import { mortgageDef } from './mortgage.ts';
import { rentVsBuyDef } from './rent.ts';
import { aprApyDef, compoundDef, savingsGoalDef, simpleInterestDef } from './savings.ts';
import { brCompoundDef, brCreditCardDef, brDebtPayoffDef, brEarlyPayoffDef, brPersonalLoanDef, brRentOrBuyDef, brSacPriceDef, brVehicleLoanDef } from './br.ts';
import { btuDef, concreteDef, mulchDef, paintDef, squareFootageDef, tileDef } from './house.ts';
import { bmiDef, bodyFatDef, calorieDef, dueDateDef, ovulationDef } from './health.ts';

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
  brSacPriceDef,
  brVehicleLoanDef,
  brPersonalLoanDef,
  brEarlyPayoffDef,
  brCreditCardDef,
  brDebtPayoffDef,
  brCompoundDef,
  brRentOrBuyDef,
  squareFootageDef,
  concreteDef,
  mulchDef,
  paintDef,
  tileDef,
  btuDef,
  bmiDef,
  calorieDef,
  ovulationDef,
  bodyFatDef,
  dueDateDef,
] as unknown as CalcDef[];

export const DEFS = Object.fromEntries(defs.map((def) => [def.id, def])) as Record<AnyCalcId, CalcDef>;
