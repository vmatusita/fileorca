// What the specs of the header share (F11; DECISOES § 391): the pages of each mold in each language, what the Menu sheet
// must list, read from the route map (not from src/components/header-menu.ts, which builds the sheet), the language links
// of a page, and the colours of the two themes from docs/design/tokens.json.
import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { colorValue } from '../../../scripts/lib/contrast.ts';
import { LANGS, QR_ID, languagesOf, moneyHubId, pagePath, pathFor, routeById, type Lang, type RouteId } from '../../../src/i18n/routes.ts';
import { GUIDE_IDS, HEALTH_HUB_ID, HOUSE_HUB_ID } from '../../../src/tools/calc/registry.ts';
import { PDF_HUB_ID } from '../../../src/tools/pdf/registry.ts';
import { GUIDES_HUB_ID } from '../../../src/tools/guides/registry.ts';

export interface MoldPage {
  mold: string;
  id: RouteId;
  lang: Lang;
  path: string;
}

/** One page per mold of the site, in each language that has it (the money guides are not in Portuguese). */
const MOLDS: { mold: string; id: (lang: Lang) => RouteId }[] = [
  { mold: 'home', id: () => 'home' },
  { mold: 'category hub', id: () => 'image-tools' },
  { mold: 'guides hub', id: () => GUIDES_HUB_ID },
  { mold: 'image tool', id: () => 'compress-image' },
  { mold: 'PDF tool', id: () => 'merge-pdf' },
  { mold: 'calculator', id: (lang) => (lang === 'pt' ? 'br-sac-price' : 'mortgage-calculator') },
  { mold: 'file guide', id: () => 'guides-jpg-vs-png' },
  { mold: 'money guide', id: () => GUIDE_IDS[0] },
  { mold: 'institutional', id: () => 'about' },
];

export const MOLD_PAGES: MoldPage[] = LANGS.flatMap((lang) =>
  MOLDS.flatMap(({ mold, id }) => {
    const path = pagePath(id(lang), lang);
    return path ? [{ mold, id: id(lang), lang, path }] : [];
  }),
);

/** The rows of the sheet in a language, in order: the category hubs that exist in it, the QR code, the guides hub and the support page. */
export function expectedSheet(lang: Lang): string[] {
  const categories = ([`image-tools`, PDF_HUB_ID, moneyHubId(lang), HOUSE_HUB_ID, HEALTH_HUB_ID, QR_ID] as RouteId[]).flatMap((id) => pagePath(id, lang) ?? []);
  return [...categories, pathFor(GUIDES_HUB_ID, lang), pathFor('support', lang)];
}

/** Where each language link of a page leads: the equivalent page, or the home of the language (the rule of the language menu). */
export function expectedLanguages(id: RouteId): string[] {
  const route = routeById(id);
  const available = new Set(languagesOf(route));
  return LANGS.map((code) => (available.has(code) && route.indexable ? (route.paths[code] ?? '') : pathFor('home', code)));
}

const tokens: unknown = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8'));

/** The --bg of each theme, as the browser computes it (rgb()). */
export function background(theme: 'light' | 'dark'): string {
  const hex = colorValue(tokens, 'bg', theme);
  const [r, g, b] = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

/** The background the page paints with now, and the theme it is in. */
export async function painting(page: Page): Promise<{ bg: string; theme: string | null; meta: string | null; key: string | null }> {
  return page.evaluate(() => {
    let key: string | null = null;
    try {
      key = localStorage.getItem('fo-theme');
    } catch {
      key = 'blocked';
    }
    return {
      bg: getComputedStyle(document.body).backgroundColor,
      theme: document.documentElement.getAttribute('data-theme'),
      meta: document.querySelector('meta[name="color-scheme"]')?.getAttribute('content') ?? null,
      key,
    };
  });
}
