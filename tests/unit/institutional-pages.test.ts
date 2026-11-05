// The pages without ads of the F13b (decision 8; UX-17 A, pages.html; DECISOES § 583 to § 586), read in the built pages:
// the right column of the 404, the About, the Contact, the legal pages and the Licenses (one piece of the page, never an
// ad), the card "FileOrca in numbers" (the counts of the module), the index "On this page" made from the H2 (each link
// leads to an H2 that exists) and the three chips of the 404 (the first tool of each hub of the language, from the
// registries). The slug module is checked in Node. The footer is in footer-phone.test.ts. FO_PAGES_DIST points the test at
// another build (the proof against the dist of the starting point).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { headingIds, headingSlug, pageIndex } from '../../src/components/page-index.ts';
import { toolCounts } from '../../src/components/tool-count.ts';
import { groupDigits } from '../../src/i18n/format.ts';
import { LANGS, languagesOf, pagePath, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { HUB_MONEY_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

describe('the ids of the H2 (src/components/page-index.ts)', () => {
  it('come from the text: no accents, lowercase, one hyphen between words', () => {
    expect(headingSlug('Who is responsible')).toBe('who-is-responsible');
    expect(headingSlug('Site delivery (Cloudflare)')).toBe('site-delivery-cloudflare');
    expect(headingSlug('Calculadoras são educativas, não aconselhamento')).toBe('calculadoras-sao-educativas-nao-aconselhamento');
    expect(headingSlug('Analítica (Google Analytics 4)')).toBe('analitica-google-analytics-4');
    expect(headingSlug('Niños')).toBe('ninos');
  });

  it('are unique in the page: a repeated text takes a number, an id the page has is never taken, a text of symbols gets one', () => {
    expect(headingIds(['Children', 'Children', 'children'])).toEqual(['children', 'children-2', 'children-3']);
    expect(headingIds(['Main'], ['main'])).toEqual(['main-2']);
    expect(headingIds(['→ ×'])).toEqual(['section-1']);
    expect(pageIndex(['A b', 'C'])).toEqual([{ id: 'a-b', text: 'A b' }, { id: 'c', text: 'C' }]);
  });
});

const DIST = process.env['FO_PAGES_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const file = (path: string) => join(DIST, ...path.split('/').filter(Boolean), ...(path.endsWith('.html') ? [] : ['index.html']));
const page = (path: string) => parse(readFileSync(file(path), 'utf8'));
const paths = (id: RouteId) => languagesOf(routeById(id)).map((lang) => ({ lang, path: pagePath(id, lang) ?? '' }));
/** The text of an element, its spaces folded. */
const text = (element: HTMLElement | null | undefined) => (element?.textContent ?? '').replace(/\s+/g, ' ').trim();

/** The six pages of the decision 8, each with the piece its right column holds from 1280 px. */
const SIDE: { id: RouteId; piece: string }[] = [
  { id: 'not-found', piece: 'div.fo-sea' },
  { id: 'about', piece: 'section.fo-stats' },
  { id: 'contact', piece: 'section.fo-stats' },
  { id: 'privacy', piece: 'nav.fo-toc' },
  { id: 'terms', piece: 'nav.fo-toc' },
  { id: 'licenses', piece: 'nav.fo-toc' },
];

describe.runIf(BUILT)('the pages without ads use the right column from 1280 px (DECISOES § 583)', () => {
  for (const { id, piece } of SIDE) {
    for (const { lang, path } of paths(id)) {
      it(`${path}: <main> on the page width, the view with its piece in the column, and no ad`, () => {
        const html = readFileSync(file(path), 'utf8');
        const root = parse(html);
        const main = root.querySelector('main');
        expect(main?.classList.contains('fo-content--wide'), `${path} <main> wide`).toBe(true);
        expect(main?.querySelectorAll('.fo-view--side'), `${path} one view`).toHaveLength(1);
        expect(main?.querySelectorAll('.fo-view--side > .fo-side'), `${path} one piece in the column`).toHaveLength(1);
        expect(main?.querySelectorAll(`.fo-view--side > ${piece}.fo-side`), `${path} ${piece}`).toHaveLength(1);
        // The column is content: no AdSlot, no box of the map, no rail.
        expect(html, `${path} fo-ad`).not.toMatch(/class="[^"]*\bfo-ad/);
        expect(root.querySelectorAll('aside'), `${path} aside`).toHaveLength(0);
        expect(html, `${path} fo-rail`).not.toContain('fo-rail');
        // The card says the counts of the module in the language of the page (the languages, from LANGS).
        if (piece === 'section.fo-stats') {
          // Recounted here from the registries: image, PDF, the money of the hub, and home and health or the languages.
          const counts = toolCounts(lang);
          const stats = TEXTS[lang].about.stats;
          const fourth = counts.house + counts.health > 0 ? [counts.house + counts.health, stats.life] : [LANGS.length, stats.languages];
          const items = main?.querySelectorAll('.fo-stats__item') ?? [];
          expect(items.map((item) => text(item.querySelector('.fo-stats__num'))), path).toEqual([counts.image, counts.pdf, counts.money, fourth[0], 0].map((n) => groupDigits(Number(n), lang)));
          expect(items.map((item) => text(item.querySelector('.fo-stats__label'))), path).toEqual([stats.image, stats.pdf, stats.money, fourth[1], stats.zero]);
          expect(text(main?.querySelector('.fo-stats__zero .fo-seal')), path).toBe(TEXTS[lang].common.seal);
        }
      });
    }
  }
});

describe.runIf(BUILT)('the index "On this page" leads to the H2 of the page (DECISOES § 585)', () => {
  const headingsOf = (id: RouteId, lang: Lang): string[] => {
    if (id === 'licenses') {
      const t = TEXTS[lang].licenses;
      return [t.lgplHeading, t.packagesHeading, t.bundledHeading, t.fontsHeading];
    }
    return TEXTS[lang][id === 'privacy' ? 'privacy' : 'terms'].sections.map((section) => section.heading);
  };
  for (const id of ['privacy', 'terms', 'licenses'] as const) {
    for (const { lang, path } of paths(id)) {
      it(`${path}: one link per H2, in order, each to an H2 with that id; the H2 keep the words of the translation`, () => {
        const root = page(path);
        const toc = root.querySelector('main nav.fo-toc');
        expect(toc, `${path} index`).not.toBeNull();
        expect(text(toc?.querySelector('h2#toc-title')), `${path} title`).toBe(TEXTS[lang].common.pageIndex);
        expect(toc?.getAttribute('aria-labelledby')).toBe('toc-title');
        const h2 = root.querySelectorAll('main h2').filter((heading) => heading.id !== 'toc-title');
        expect(h2.map((heading) => text(heading)), `${path} the H2`).toEqual(headingsOf(id, lang));
        const links = toc?.querySelectorAll('ol > li > a') ?? [];
        expect(links.map((link) => [link.getAttribute('href'), text(link)]), `${path} the links`).toEqual(h2.map((heading) => [`#${heading.id}`, text(heading)]));
        for (const link of links) {
          const target = root.querySelectorAll(`[id="${(link.getAttribute('href') ?? '').slice(1)}"]`);
          expect(target.map((element) => element.tagName.toLowerCase()), `${path} ${link.getAttribute('href')}`).toEqual(['h2']);
        }
        const ids = root.querySelectorAll('[id]').map((element) => element.id);
        expect(ids.length, `${path} unique ids`).toBe(new Set(ids).size);
      });
    }
  }

  it('the legal pages keep their date', () => {
    for (const lang of LANGS) {
      for (const id of ['privacy', 'terms'] as const) {
        const root = page(pagePath(id, lang) ?? '');
        expect(text(root.querySelector('main p.fo-muted')), `${id} ${lang}`).toBe(TEXTS[lang][id].updated);
      }
    }
  });
});

describe.runIf(BUILT)('the 404 (DECISOES § 584)', () => {
  for (const { lang, path } of paths('not-found')) {
    it(`${path}: the Oli lost in the water, the search without shadow, and the first tool of each hub of the language as a chip`, () => {
      const root = page(path);
      const common = TEXTS[lang].common;
      const sea = root.querySelector('main .fo-sea');
      expect(sea?.getAttribute('aria-hidden'), `${path} sea`).toBe('true');
      expect(sea?.querySelector('.fo-water'), `${path} water`).not.toBeNull();
      expect(sea?.querySelector('.fo-water.fo-water--moving'), `${path} still water`).toBeNull();
      expect(sea?.querySelector('[data-oli="lost"]')?.getAttribute('aria-hidden'), `${path} Oli`).toBe('true');
      expect(root.querySelectorAll('[data-oli="lost"]'), `${path} one Oli lost`).toHaveLength(1);
      expect(root.querySelector('main [data-search-inline] .fo-search'), `${path} search`).not.toBeNull();
      const image = IMAGE_TOOL_IDS[0];
      const pdf = PDF_TOOL_IDS[0];
      const money = HUB_MONEY_IDS[lang][0];
      const want = [
        [pagePath(image, lang), common.tools[image].name],
        [pagePath(pdf, lang), common.pdf?.[pdf]?.name],
        [pagePath(money as RouteId, lang), common.calcs[money as keyof typeof common.calcs]?.name],
      ];
      const nav = root.querySelector('main nav.fo-404__tools');
      expect(text(nav?.querySelector('h2')), `${path} heading`).toBe(TEXTS[lang]['not-found'].toolsHeading);
      const chips = nav?.querySelectorAll('ul.fo-next > li > a.fo-chip') ?? [];
      expect(chips.map((chip) => [chip.getAttribute('href'), text(chip)]), `${path} chips`).toEqual(want);
      expect(chips.map((chip) => chip.classList.contains(`fo-cat--${['image', 'pdf', 'money'][chips.indexOf(chip)]}`)), path).toEqual([true, true, true]);
      // The first money calculator of the hub of the language: Mortgage calculator, or Simulador SAC × PRICE in pt.
      expect(text(chips[2]), path).toBe(lang === 'pt' ? 'Simulador SAC × PRICE' : lang === 'es' ? 'Calculadora de hipoteca' : 'Mortgage calculator');
      expect(root.querySelector('main .fo-404__home a')?.getAttribute('href'), `${path} home`).toBe(pagePath('home', lang));
    });
  }
});
