// Review F13b e-6 (DECISOES § 598): the costs of the mortgage and the TR of the SAC × PRICE are in a block that folds, closed
// when the page opens (§ 547), so the step of "How to use" that asks for them says to open it, by the name the page shows.
import { describe, expect, it } from 'vitest';
import { calcTexts } from '../../src/tools/calc/page.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';

describe('the how-to of a calculator with a block that folds', () => {
  it('names the block in the step that asks for its fields: the mortgage in en and es, the SAC × PRICE in pt', () => {
    for (const [id, lang] of [['mortgage-calculator', 'en'], ['mortgage-calculator', 'es'], ['br-sac-price', 'pt']] as const) {
      expect(DEFS[id].disclose?.length, id).toBeGreaterThan(0);
      const t = calcTexts(id, lang);
      const title = t.panel.disclose ?? t.panel.moreHeading ?? '';
      expect(title, `${id} ${lang}`).not.toBe('');
      expect(t.howSteps.some((step) => step.includes(`"${title}"`)), `${id} ${lang}: ${t.howSteps.join(' | ')}`).toBe(true);
    }
  });
});
