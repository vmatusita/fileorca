// The voice of the health pages (prompt F7, decisions 5 and 7; DECISOES § 265 and § 267). In every text of the five health
// calculators and of the health hub (every string of their en.ts files, their cards on the home, the hub and the search, and
// the texts the calculators share): no exclamation, no praise and no "you should", nothing of BANNED_HEALTH (a weight goal, an
// "ideal weight", a calorie deficit, a diet, macros, birth control), and the words "adults 18 and older" on every page. The
// Oli never cheers a health result: the island's cheer is off and the sprite of a health page has no "cheer" pose, read from
// the HTML of dist/ (the build runs before the Vitest in pnpm verificar), with the home calculators as the control.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BANNED, BANNED_HEALTH } from '../../scripts/lib/ymyl.ts';
import { visibleText } from '../../scripts/lib/conteudo.ts';
import { fileForPath } from '../../scripts/lib/dist.ts';
import { HEALTH_CALC_IDS, HEALTH_HUB_ID, HOUSE_CALC_IDS, LIFE_CALC_PAGES, calcAreaOf } from '../../src/tools/calc/registry.ts';
import { routeById } from '../../src/i18n/routes.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { CALC_POSES } from '../../src/oli/poses.ts';
import enCommon from '../../src/i18n/en/common.ts';
import enHome from '../../src/i18n/en/home.ts';
import sharedCalc from '../../src/tools/calc/i18n/en.ts';

/** Every string of a value, with its path, the way the voice test of routes.test.ts walks the texts. */
function strings(value: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => strings(item, `${path}[${index}]`, out));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) strings(item, `${path}.${key}`, out);
  return out;
}

const HEALTH_FILES = [...HEALTH_CALC_IDS.map((id) => `src/tools/${id}/i18n/en.ts`), 'src/i18n/en/health-calculators.ts'];
const load = async (file: string): Promise<unknown> => ((await import(pathToFileURL(resolve(file)).href)) as { default: unknown }).default;

/** A praise or a verdict, or telling the person what to do with the result (the prompt allows only "see a professional"). */
const PRAISE = /\b(?:great|congratulations|congrats|well done|good job|excellent|perfect|awesome|amazing|fantastic|keep it up)\b/i;
const PRESCRIBE = /\byou (?:should|must|ought to|need to)\b/i;
const ADULTS = /\badults 18 and older\b/;

describe('the voice of the health pages (F7)', () => {
  it('reads the texts of the five calculators and the hub, and the rules see what they must refuse (controls)', async () => {
    expect(HEALTH_CALC_IDS).toEqual(['bmi-calculator', 'calorie-calculator', 'ovulation-calculator', 'body-fat-calculator', 'due-date-calculator']);
    for (const file of HEALTH_FILES) expect(existsSync(file), file).toBe(true);
    for (const id of HEALTH_CALC_IDS) expect(calcAreaOf(id), id).toBe('health');
    // Positive controls: each rule catches the sentence it is there for.
    expect('Great job!').toMatch(/!/);
    expect('Great job, a healthy result.').toMatch(PRAISE);
    expect('You should talk to a coach.').toMatch(PRESCRIBE);
    for (const sample of ['Your ideal weight is 150 lb.', 'Eat 1,500 calories a day to lose weight.', 'A calorie deficit of 500 a day.', 'Use the safe days as birth control.', 'Track your macros.'])
      expect(BANNED_HEALTH.some((pattern) => pattern.test(sample)), sample).toBe(true);
    // Negative controls: the words of the pages that are allowed stay allowed.
    for (const sample of ['A BMI of 23.6 is in Healthy Weight, the range from 18.5 to 24.9.', '40.0 or greater', 'Talk with a doctor or another health professional.'])
      expect(PRAISE.test(sample) || PRESCRIBE.test(sample) || BANNED_HEALTH.some((pattern) => pattern.test(sample)), sample).toBe(false);
    expect('For adults 18 and older.').toMatch(ADULTS);
    expect('For adults 20 and older.').not.toMatch(ADULTS);
  });

  it('has no exclamation, praise, "you should" or banned health wording in any string of those texts', async () => {
    const all: [string, string][] = [];
    for (const file of HEALTH_FILES) strings(await load(file), file, all);
    // What else a health page or its cards show: the cards of the five (home, hub, search), the home section and the
    // texts every calculator shares.
    for (const id of HEALTH_CALC_IDS) strings(enCommon.calcs[id], `common.calcs.${id}`, all);
    strings(enHome.health, 'home.health', all);
    strings(sharedCalc, 'src/tools/calc/i18n/en.ts', all);
    expect(all.length).toBeGreaterThan(200);
    for (const [path, text] of all) {
      expect(text, `${path}: exclamation`).not.toMatch(/[!¡]/);
      expect(text, `${path}: praise`).not.toMatch(PRAISE);
      expect(text, `${path}: tells the person what to do`).not.toMatch(PRESCRIBE);
      for (const pattern of [...BANNED, ...BANNED_HEALTH]) expect(pattern.test(text), `${path}: ${pattern}`).toBe(false);
    }
  });

  it('says "adults 18 and older" in the texts of each calculator and of the hub', async () => {
    for (const file of HEALTH_FILES) {
      const text = strings(await load(file), file).map(([, value]) => value).join(' ');
      expect(text, file).toMatch(ADULTS);
    }
  });

  it('shows "adults 18 and older" on each built page, with no exclamation and no banned wording in its <main>', () => {
    for (const id of [...HEALTH_CALC_IDS, HEALTH_HUB_ID] as const) {
      const file = fileForPath(routeById(id).paths.en ?? '-');
      expect(existsSync(file), `${file} (run pnpm build first)`).toBe(true);
      const main = visibleText(readFileSync(file, 'utf8'), 'main', ['.fo-ad']);
      expect(main.length, id).toBeGreaterThan(500);
      expect(main, id).toMatch(ADULTS);
      expect(main, id).not.toMatch(/[!¡]/);
      for (const pattern of BANNED_HEALTH) expect(pattern.test(main), `${id}: ${pattern}`).toBe(false);
    }
  });
});

describe('the Oli never cheers a health result (F7, decision 5)', () => {
  /** The poses in the sprite of a built page: the <symbol id="oli-…"> it carries. */
  const sprite = (id: string): string[] => {
    const html = readFileSync(fileForPath(routeById(id as Parameters<typeof routeById>[0]).paths.en ?? '-'), 'utf8');
    return [...html.matchAll(/<symbol id="oli-([a-z]+)"/g)].map((match) => match[1] as string).sort();
  };

  it('keeps the cheer off in the island of every health calculator, and on in the home ones', () => {
    for (const id of HEALTH_CALC_IDS) expect(panelData(id, 'en').cheer, id).toBe(false);
    for (const id of HOUSE_CALC_IDS) expect(panelData(id, 'en').cheer, id).toBe(true);
    // The poses the calculator mold hands the layout come from the poses of the card (F13b; DECISOES § C-10), which have the
    // cheer: the health pages drop it.
    expect(CALC_POSES).toContain('cheer');
  });

  it('leaves the cheer pose out of the sprite of each health page, and keeps it in the home calculators (control)', () => {
    const panel = [...CALC_POSES].sort();
    for (const id of HEALTH_CALC_IDS) {
      expect(LIFE_CALC_PAGES[id].hub, id).toBe('health');
      const poses = sprite(id);
      expect(poses, id).not.toContain('cheer');
      // Every other pose of the card is still there (the island swaps them), and the peek of the layout.
      expect(poses, id).toEqual([...panel.filter((pose) => pose !== 'cheer'), 'peek'].sort());
    }
    for (const id of HOUSE_CALC_IDS) expect(sprite(id), id).toContain('cheer');
    // The health hub shows no Oli of the panel at all, so no cheer either.
    expect(sprite(HEALTH_HUB_ID)).not.toContain('cheer');
  });
});
