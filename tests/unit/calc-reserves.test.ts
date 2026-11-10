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
import { decimalsMessage, decimalsOf } from '../../src/tools/calc/form.ts';

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
      // F16, item 2 (DECISOES § 684): the decimals message of every number field of the page fits the place too.
      for (const n of placesOf(id)) expect(reserves.get.length, `${id} ${lang}: ${n} decimals`).toBeGreaterThanOrEqual(decimalsMessage(data.t, n).length);
    }
  });

  // F16, item 2: with every range and problem shorter than it, the decimals message is the room of the Download, so the card
  // keeps the room of a message it may say (the decimals of a rate, four, in the mortgage; a whole number in the term).
  it('keeps the room of the decimals message of the fields', () => {
    for (const lang of ['en', 'es'] as const) {
      const data = panelData('mortgage-calculator', lang);
      const short = { ...data, t: { ...data.t, decimalHint: '' }, texts: { ...data.texts, fields: Object.fromEntries(Object.entries(data.texts.fields).map(([key, texts]) => [key, { ...texts, error: 'Bad.', over: 'Over.' }])) } };
      const reserves = heroReserves(DEFS['mortgage-calculator'], short, startValues(short));
      expect(reserves.get, lang).toBe({ en: 'Use up to 2 decimal places.', es: 'Usa hasta 2 decimales.' }[lang]);
    }
    const data = panelData('br-sac-price', 'pt');
    const short = { ...data, t: { ...data.t, decimalHint: '' }, texts: { ...data.texts, view: Object.fromEntries(Object.entries(data.texts.view).map(([key, text]) => [key, (DEFS['br-sac-price'].problems ?? []).includes(key) ? 'Mal.' : text])), fields: Object.fromEntries(Object.entries(data.texts.fields).map(([key, texts]) => [key, { ...texts, error: 'Mal.', over: 'Mal.' }])) } };
    expect(heroReserves(DEFS['br-sac-price'], short, startValues(short)).get).toBe('Use até 2 casas decimais.');
  });
});

/** The decimals of every number field of a calculator (money 2, rate 4, count 0, a measure its own). */
function placesOf(id: AnyCalcId): number[] {
  const out = new Set<number>();
  for (const spec of DEFS[id].fields) {
    if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec') out.add(decimalsOf(spec.kind, spec.decimals));
    if (spec.kind === 'down') out.add(2).add(4);
    if (spec.kind === 'list') for (const item of spec.item) out.add(decimalsOf(item.kind, item.decimals));
  }
  return [...out];
}
