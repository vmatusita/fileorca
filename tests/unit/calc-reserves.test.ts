// The room the calculator card keeps (review F13b a-1; DECISOES § 595): the numbers drawn as wide as they may draw, every
// problem a definition says it may have is a text of each of its pages, and the reserves of every page: the longest message
// in the place of the Download covers each problem and field message, and the sentence reserve is at least as wide as the
// example's own sentence. The heights are measured in tests/e2e/money-card.spec.ts.
import { describe, expect, it } from 'vitest';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, LIFE_CALC_IDS, moneyPage, type AnyCalcId } from '../../src/tools/calc/registry.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { heroReserves, startValues } from '../../src/tools/calc/CalcPanel.tsx';
import { lineWidth, widen } from '../../src/tools/calc/view.ts';

/** Every calculator page and the language it is in. */
const PAGES: [AnyCalcId, Lang][] = [
  ...CALC_PAGE_IDS.flatMap((id) => (['en', 'es'] as const).filter((lang) => moneyPage(id, lang) !== null).map((lang): [AnyCalcId, Lang] => [id, lang])),
  ...BR_CALC_IDS.map((id): [AnyCalcId, Lang] => [id, 'pt']),
  ...LIFE_CALC_IDS.map((id): [AnyCalcId, Lang] => [id, 'en']),
];

describe('the room of the card', () => {
  it('draws every number as its widest digits, with more digits when asked, in the grouping of the language', () => {
    expect(widen('$2,396.20/mo', 'en')).toBe('$0,000.00/mo');
    expect(widen('Over 30 years at 6.5%', 'en')).toBe('Over 00 years at 0.0%');
    expect(widen('R$ 284.596', 'pt', 1)).toBe('R$ 0.000.000');
    expect(widen('6,5 %', 'pt')).toBe('0,0 %');
    expect(widen('$999', 'es', 1)).toBe('$0,000');
    expect(lineWidth('0000')).toBeGreaterThan(lineWidth('1111'.replace(/1/g, 'i')));
  });

  it('has, in every page of a calculator, the text of each problem its definition says it may have', () => {
    for (const [id, lang] of PAGES) {
      const data = panelData(id, lang);
      for (const key of DEFS[id].problems ?? []) expect(data.texts.view[key], `${id} ${lang}: ${key}`).toBeTruthy();
    }
  });

  it('keeps in the place of the Download the longest message the card may say, and room for the sentence of the example', () => {
    for (const [id, lang] of PAGES) {
      const data = panelData(id, lang);
      const reserves = heroReserves(DEFS[id], data, startValues(data));
      for (const key of DEFS[id].problems ?? []) {
        const words = (data.texts.view[key] ?? '').replace(/\{\w+\}/g, '').length;
        expect(reserves.get.length, `${id} ${lang}: ${key}`).toBeGreaterThanOrEqual(words);
      }
      for (const texts of Object.values(data.texts.fields)) if (texts.error) expect(reserves.get.length, `${id} ${lang}: ${texts.error}`).toBeGreaterThanOrEqual(texts.error.length);
      expect(reserves.sentence, `${id} ${lang}`).not.toBe('');
      expect(reserves.stale, `${id} ${lang}`).toMatch(new RegExp(data.t.lastWorked.split('{')[0]!.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
