// Rent vs buy: the net worth of each path at the end of every year (oracle: scripts/oracle/calc.py).
// Each month the owner pays the loan, taxes, insurance, HOA and upkeep and the renter pays the rent; the
// cheaper path invests the difference, and the renter starts with the down payment invested. Taxes,
// insurance and HOA stay at the amounts entered; the home value, the upkeep and the rent move once a
// year. No income tax, deduction or capital gains enter the account.
import { ONE, annuityPayment, divRound, interest, perMonth, schedule } from './money.ts';

export interface RentVsBuyInput {
  price: number;
  down: number;
  rate: number;
  termYears: number;
  taxYear: number;
  insuranceYear: number;
  /** Upkeep per year, as a share of the home value at the start of the year. */
  maintenanceRate: number;
  hoaMonth: number;
  appreciationRate: number;
  /** Cost of selling, as a share of the home value. */
  sellingRate: number;
  rent: number;
  rentIncreaseRate: number;
  /** Yearly return on what each path invests, paid monthly at the rate / 12. */
  returnRate: number;
  years: number;
}

export interface RentVsBuyResult {
  payment: number;
  taxMonth: number;
  insuranceMonth: number;
  /** Buyer's net worth at the end of each year: home value less selling cost, less the loan, plus investments. */
  buyer: number[];
  /** Renter's investments at the end of each year. */
  renter: number[];
  /** The first year in which buying is worth at least as much as renting; null when it never is. */
  breakEven: number | null;
  buyerFinal: number;
  renterFinal: number;
  totalRent: number;
  totalOwnerCost: number;
}

const grow = (amount: number, rate: number): number => Number(divRound(BigInt(amount) * BigInt(ONE + rate), BigInt(ONE)));

export function rentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const loan = input.price - input.down;
  const payment = annuityPayment(loan, input.rate, input.termYears * 12);
  const rows = schedule(loan, input.rate, input.termYears * 12, payment);
  const taxMonth = perMonth(input.taxYear);
  const insuranceMonth = perMonth(input.insuranceYear);
  let value = input.price;
  let rent = input.rent;
  let buyerSaved = 0;
  let renterSaved = input.down;
  let totalRent = 0;
  let totalOwnerCost = 0;
  let breakEven: number | null = null;
  const buyer: number[] = [];
  const renter: number[] = [];
  for (let y = 1; y <= input.years; y += 1) {
    const upkeep = Number(divRound(BigInt(value) * BigInt(input.maintenanceRate), BigInt(12 * ONE)));
    for (let m = 1; m <= 12; m += 1) {
      const k = (y - 1) * 12 + m;
      const owner = (k <= rows.length ? rows[k - 1]![1] : 0) + taxMonth + insuranceMonth + input.hoaMonth + upkeep;
      totalOwnerCost += owner;
      totalRent += rent;
      buyerSaved += interest(buyerSaved, input.returnRate);
      renterSaved += interest(renterSaved, input.returnRate);
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
    payment,
    taxMonth,
    insuranceMonth,
    buyer,
    renter,
    breakEven,
    buyerFinal: buyer.at(-1)!,
    renterFinal: renter.at(-1)!,
    totalRent,
    totalOwnerCost,
  };
}
