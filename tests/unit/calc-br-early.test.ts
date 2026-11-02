// The early payoff of the Brazilian calculators (review F6, a-3 and g-1; DECISOES § 249). Prepaying nothing saves
// nothing, in both systems and both ways (the SAC used to show cents of saving, even negative ones, for R$ 0), and a
// prepayment too small to shorten the term says so instead of "você termina nenhum tempo antes".
import { describe, expect, it } from 'vitest';
import { earlyPayoff } from '../../src/calc/br.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { viewOf } from '../../src/tools/calc/store.ts';

const sentenceOf = (values: Record<string, unknown>): string => {
  const def = DEFS['br-early-payoff'];
  const view = viewOf(def, panelData('br-early-payoff', 'pt'), { ...def.initial, ...values } as typeof def.initial);
  return view.hero.sentence.map((part) => (typeof part === 'string' ? part : Object.values(part).join(''))).join('');
};

describe('the early payoff', () => {
  // The two contracts of the review, the page example and a few more.
  const CONTRACTS = [
    { balance: 20_000_000, rate: 9_000, months: 300 },
    { balance: 1_621_917_635, rate: 61_000, months: 182 },
    { balance: 31_295_374, rate: 6_000, months: 106 },
    { balance: 100_000, rate: 25_000, months: 420 },
    { balance: 4_000_000, rate: 0, months: 24 },
  ];

  for (const system of ['sac', 'price'] as const) {
    it(`saves nothing for a prepayment of zero in the ${system}, both ways`, () => {
      for (const contract of CONTRACTS) {
        const result = earlyPayoff({ ...contract, system, prepay: 0 });
        for (const part of [result.shorter, result.lower]) {
          expect([part.interestSaved, part.monthsSaved], `${system} ${JSON.stringify(contract)}`).toEqual([0, 0]);
        }
      }
    });

    it(`never shows a negative saving for a small prepayment in the ${system}`, () => {
      for (const contract of CONTRACTS) {
        for (const prepay of [1, 10, 100, 1_000]) {
          const result = earlyPayoff({ ...contract, system, prepay });
          expect(result.shorter.interestSaved, `${system} ${prepay}`).toBeGreaterThanOrEqual(0);
          expect(result.shorter.monthsSaved, `${system} ${prepay}`).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }

  it('says the term stays when the prepayment is too small to shorten it, and the months when it does', () => {
    for (const system of ['sac', 'price']) {
      const small = sentenceOf({ x: 1_000, sys: system });
      expect(small, system).toContain('não chega a encurtar o prazo');
      expect(small, system).not.toContain('nenhum tempo');
      const large = sentenceOf({ sys: system });
      expect(large, system).toMatch(/você termina \d+ (?:ano|anos|mês|meses)/);
    }
  });
});
