// The quick PRICE payment of the Brazilian engine (DECISOES § 244) against the exact one: for rates across the whole range
// of the fields (monthly and yearly), principals from a cent to R$ 20 million and every term up to 420 months, the
// fixed-point payment rounds to the same cent as annuity30, the closed formula over whole numbers. The SAC × PRICE fixtures
// (calc-oracle.test.ts) prove the schedules; this proves the payment on its own, far more often than the fixtures can.
import { describe, expect, it } from 'vitest';
import { annuity30, annuityByTerm, monthRate30, yearRate30 } from '../../src/calc/br.ts';

/** A small deterministic generator (the inputs are the same on every run). */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

describe('the quick PRICE payment', () => {
  it('rounds to the cent of annuity30 for every term, across the rates and principals of the fields', () => {
    const next = random(20261102);
    const rates = [
      ...[1, 100, 9_489, 110_000, 300_000].map((rate) => ({ label: `${rate / 10_000}% a.a.`, j: yearRate30(rate) })),
      ...[1, 1_000, 18_000, 50_000].map((rate) => ({ label: `${rate / 10_000}% a.m.`, j: monthRate30(rate) })),
      ...Array.from({ length: 6 }, () => {
        const rate = 1 + Math.floor(next() * 300_000);
        return { label: `${rate / 10_000}% a.a.`, j: yearRate30(rate) };
      }),
    ];
    let compared = 0;
    for (const { label, j } of rates) {
      const n = 360 + Math.floor(next() * 61);
      const payment = annuityByTerm(j, n);
      for (let m = 1; m <= n; m += 1) {
        const principal = m % 3 === 0 ? 1 + Math.floor(next() * 100) : Math.floor(next() * 2_000_000_000);
        expect(payment(principal, m), `${label}, ${m} meses, ${principal} centavos`).toBe(annuity30(principal, j, m));
        compared += 1;
      }
    }
    expect(compared).toBeGreaterThan(5_000);
  });

  it('gives annuity30 for a rate of zero, a principal of zero and a term past the table', () => {
    expect(annuityByTerm(0n, 12)(120_000, 12)).toBe(annuity30(120_000, 0n, 12));
    const j = yearRate30(110_000);
    expect(annuityByTerm(j, 12)(0, 6)).toBe(0);
    expect(annuityByTerm(j, 12)(40_000_000, 24)).toBe(annuity30(40_000_000, j, 24));
  });
});
