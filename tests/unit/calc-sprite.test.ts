// F13b (§ 375; DECISOES § 553): the sprite of every page with the calculator island carries the poses of the Oli of its card
// (wave, cheer, oops; no cheer on a health page) and the peek of the layout, and no other pose of a panel (gulp, swim, buoy,
// lost). Read from the HTML of dist/ (the build runs before the Vitest in pnpm verificar): the money calculators in their three
// languages, the home and health ones and the money guides that embed the island.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fileForPath } from '../../scripts/lib/dist.ts';
import { LANGS } from '../../src/i18n/routes.ts';
import { CALC_POSES } from '../../src/oli/poses.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, GUIDE_IDS, HEALTH_CALC_IDS, LIFE_CALC_IDS, LIFE_CALC_PAGES, guidePathIn, moneyPage } from '../../src/tools/calc/registry.ts';

const sprite = (path: string): string[] => [...readFileSync(fileForPath(path), 'utf8').matchAll(/<symbol id="oli-([a-z]+)"/g)].map((match) => match[1] as string).sort();

describe('the sprite of the calculator pages', () => {
  it('carries the poses of the card and the peek, and no other pose of a panel', () => {
    const money = [
      ...LANGS.flatMap((lang) => [...CALC_PAGE_IDS, ...BR_CALC_IDS].flatMap((id) => moneyPage(id, lang)?.path ?? [])),
      ...LANGS.flatMap((lang) => GUIDE_IDS.flatMap((id) => guidePathIn(id, lang) ?? [])),
      ...LIFE_CALC_IDS.filter((id) => !(HEALTH_CALC_IDS as readonly string[]).includes(id)).map((id) => LIFE_CALC_PAGES[id].path),
    ];
    expect(money.length).toBeGreaterThan(50);
    const card = [...CALC_POSES, 'peek'].sort();
    for (const path of money) expect(sprite(path), path).toEqual(card);
    for (const id of HEALTH_CALC_IDS) expect(sprite(LIFE_CALC_PAGES[id].path), id).toEqual(card.filter((pose) => pose !== 'cheer'));
  });
});
