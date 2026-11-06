// One icon per tool (F13a, decision 8 and criterion 6; UX-16, DECISOES § 379 and § 490): no hub repeats an
// icon among its cards. The drawing inside the <svg> of each card's .fo-tool__icon is what the person sees, so two
// cards with the same drawing are a repeat, whatever the field says. The pages are read from dist/ (run `pnpm build`
// first, as `pnpm verificar` does). The homes mix the categories: there, only the verbs that image and PDF share
// (compress and rotate) may repeat, once each (icons.html: 35 icons on the 37 cards of the English home). The F13b
// (DECISOES § 576) read the home by the chips of its bands; since the ajuste-home-cards (§ 612) the home shows one
// ToolCard per tool again, and it is read by its cards, with the same rule.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ICONS } from '../../src/icons/icons.ts';
import type { IconName } from '../../src/icons/svg.ts';
import { LANGS, pagePath, type RouteId } from '../../src/i18n/routes.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_TOOL_IDS, HEALTH_CALC_IDS, HEALTH_HUB_ID, HOUSE_CALC_IDS, HOUSE_HUB_ID, MONEY_HUB_ID } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

// FO_HUB_ICONS_DIST points the test at another build folder (the proof that it fails on the dist/ of the starting point).
const DIST = process.env['FO_HUB_ICONS_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));

/** Each hub and the fewest cards it shows (its tools), so an empty or broken page cannot pass. */
const HUBS: [RouteId, number][] = [
  ['image-tools', IMAGE_TOOL_IDS.length],
  [PDF_HUB_ID, PDF_TOOL_IDS.length],
  [MONEY_HUB_ID, CALC_TOOL_IDS.length],
  [BR_HUB_ID, BR_CALC_IDS.length],
  [HOUSE_HUB_ID, HOUSE_CALC_IDS.length],
  [HEALTH_HUB_ID, HEALTH_CALC_IDS.length],
];

/** The icons the homes may show twice: the same verb on an image card and on a PDF card. */
const SHARED_VERBS: IconName[] = ['compress', 'rotate'];

const NAME_OF = new Map(Object.entries(ICONS).map(([name, inner]) => [inner, name]));

/** The drawing of each tool card of a page, in order (the inner markup of the card's icon). */
function cardIcons(html: string): string[] {
  return [...html.matchAll(/<a class="fo-tool\b[\s\S]*?<span class="fo-tool__icon"[^>]*><svg\b[^>]*>([\s\S]*?)<\/svg>/g)].map((match) => (match[1] ?? '').trim());
}

/** The drawings a page shows more than once, by name when it is one of ours, with the count. */
function repeats(icons: string[]): string[] {
  const counts = new Map<string, number>();
  for (const icon of icons) counts.set(icon, (counts.get(icon) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([icon, count]) => `${NAME_OF.get(icon) ?? icon} ×${count}`);
}

function read(path: string): string {
  return readFileSync(join(DIST, path, 'index.html'), 'utf8');
}

const PAGES = HUBS.flatMap(([id, least]) => LANGS.flatMap((lang) => {
  const path = pagePath(id, lang);
  return path ? [{ id, lang, path, least }] : [];
}));

describe.runIf(BUILT)('one icon per tool card (UX-16)', () => {
  it('checks the hubs of every language they exist in', () => {
    expect(PAGES.map((page) => page.path)).toEqual([
      '/image-tools/', '/pt/ferramentas-de-imagem/', '/es/herramientas-de-imagen/',
      '/pdf-tools/', '/pt/ferramentas-pdf/', '/es/herramientas-pdf/',
      '/money-calculators/', '/es/calculadoras-financieras/',
      '/pt/calculadoras-financeiras/',
      '/home-calculators/',
      '/health-calculators/',
    ]);
  });

  for (const { path, least } of PAGES) {
    it(`${path} repeats no icon among its cards`, () => {
      const icons = cardIcons(read(path));
      expect(icons.length, path).toBeGreaterThanOrEqual(least);
      expect(repeats(icons), path).toEqual([]);
    });
  }

  for (const lang of LANGS) {
    const path = lang === 'en' ? '/' : `/${lang}/`;
    it(`the home ${path} repeats only compress and rotate, once each (image and PDF)`, () => {
      const icons = cardIcons(read(path));
      expect(icons.length, path).toBeGreaterThanOrEqual(IMAGE_TOOL_IDS.length + PDF_TOOL_IDS.length);
      expect(repeats(icons).sort(), path).toEqual(SHARED_VERBS.map((name) => `${name} ×2`));
    });
  }

  it('catches a repeat (control)', () => {
    const card = (name: IconName, href: string): string =>
      `<a class="fo-tool fo-dogear fo-cat--money" href="${href}"><span class="fo-tool__icon" aria-hidden="true"><svg class="fo-icon" viewBox="0 0 24 24">${ICONS[name]}</svg></span><h3 class="fo-tool__name">x</h3></a>`;
    expect(cardIcons(card('car', '/a/') + card('card', '/b/'))).toHaveLength(2);
    expect(repeats(cardIcons(card('car', '/a/') + card('card', '/b/')))).toEqual([]);
    expect(repeats(cardIcons(card('home', '/a/') + card('key', '/b/') + card('home', '/c/')))).toEqual(['home ×2']);
  });
});
