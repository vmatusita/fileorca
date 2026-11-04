import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, guidesOfTool, isFileGuide, type FileGuideTool } from '../../src/tools/guides/registry.ts';
import { guideCardData } from '../../src/tools/guides/card.ts';
import { CALC_PAGES, GUIDE_IDS, guidePathIn, isBrCalc, isCalcPage, isLifeCalc } from '../../src/tools/calc/registry.ts';
import { IMAGE_PAGES, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { HUB_GROUPS, hubGroup } from '../../src/tools/guides/hub.ts';
import { routeById } from '../../src/i18n/routes.ts';
import { DIST, allPages, fileForPath, listFiles } from '../../scripts/lib/dist.ts';

// The entries of the guides (F11, decision 7; DECISOES § 396), read from the built pages in dist/ (run `pnpm build` first,
// as for guides-hub-route.test.ts): what every page of a language carries, and where the guides hub leads from.

const HUB: Record<Lang, string> = { en: routeById(GUIDES_HUB_ID).paths.en ?? '', pt: routeById(GUIDES_HUB_ID).paths.pt ?? '', es: routeById(GUIDES_HUB_ID).paths.es ?? '' };
/** Every built page of the route map (the 404s included), with its language. */
const PAGES = allPages().filter((page) => existsSync(fileForPath(page.path)));
const read = (path: string): string => readFileSync(fileForPath(path), 'utf8');
/** The footer of a page, parsed alone (the rest of the page is not needed, and 211 pages parse faster this way). */
const footerOf = (path: string): HTMLElement => {
  const html = read(path);
  const start = html.indexOf('<footer');
  const end = html.indexOf('</footer>', start);
  expect(start, `${path}: sem <footer>`).toBeGreaterThan(-1);
  return parse(html.slice(start, end + '</footer>'.length));
};

describe('the Guides block of the footer, on every page of each language', () => {
  it('reads every page the route map builds: 211, in three languages', () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(211);
    expect(new Set(PAGES.map((page) => page.lang))).toEqual(new Set(LANGS));
  });

  for (const lang of LANGS) {
    it(`${lang}: under Utilities, "${TEXTS[lang].common.footer.guidesAll}" leads to the guides hub and each group of the hub that has a guide in the language`, () => {
      const common = TEXTS[lang].common;
      const groups = HUB_GROUPS.filter((group) => hubGroup(group, lang).length > 0);
      // pt has no money guide: its block lists the hub, the image and the PDF groups; en and es, the three groups.
      expect(groups, lang).toEqual(lang === 'pt' ? ['image', 'pdf'] : ['image', 'pdf', 'money']);
      const want = [
        [HUB[lang], common.footer.guidesAll],
        ...groups.map((group) => [`${HUB[lang]}#${group}`, TEXTS[lang].guides.groups[group].heading]),
      ];
      const pages = PAGES.filter((page) => page.lang === lang);
      expect(pages.length, lang).toBeGreaterThan(50);
      for (const page of pages) {
        const footer = footerOf(page.path);
        const block = footer.querySelector('.fo-footer__cols > div > .fo-footer__more');
        expect(block, `${page.path}: o bloco Guias`).not.toBeNull();
        // In the column of the utilities, right after its list (the QR code generator).
        expect(block?.parentNode.querySelector('h2')?.text, page.path).toBe(common.footer.utilityColumn);
        expect(block?.querySelector('h2')?.text, page.path).toBe(common.guidesHub);
        const links = block?.querySelectorAll('li a') ?? [];
        expect(links.map((link) => [link.getAttribute('href'), link.text]), page.path).toEqual(want);
        // "All guides" is the current page on the hub only.
        const here = links.filter((link) => link.getAttribute('aria-current') === 'page').map((link) => link.getAttribute('href'));
        expect(here, page.path).toEqual(page.route.id === GUIDES_HUB_ID ? [HUB[lang]] : []);
      }
    }, 60_000);
  }

  it('leads to anchors the hub has: a section with the id of each group', () => {
    for (const lang of LANGS) {
      const hub = parse(read(HUB[lang]));
      for (const group of HUB_GROUPS) expect(hub.querySelector(`main section#${group}`), `${lang} #${group}`).not.toBeNull();
    }
  });
});

// F11 (decision 7): a tool or a calculator that a guide embeds shows the GuideCard of that guide (--here) at the end of its
// "How to" block, the first block after the panel, and the line "Read the guide" is gone. The count is the registries':
// guidesOfTool for the image and PDF tools, CALC_PAGES[id].guide for the calculators where the guide has a page.
describe('the GuideCard on the page of each tool and calculator a guide embeds', () => {
  const OLD_LINE = /Read the guide:|Leia o guia:|Lee la guía:/;
  const IMAGE = new Set<string>(IMAGE_TOOL_IDS);
  const PDF = new Set<string>(PDF_TOOL_IDS);
  /** The guides a page should show, in order, by the registries alone. */
  const wanted = (id: string, lang: Lang): string[] => {
    if (IMAGE.has(id) || PDF.has(id)) return guidesOfTool(id as FileGuideTool).map((guide) => FILE_GUIDES[guide].paths[lang]);
    if (isCalcPage(id)) {
      const guide = CALC_PAGES[id].guide;
      const path = guide ? guidePathIn(guide, lang) : null;
      return path ? [path] : [];
    }
    return [];
  };
  const MOLDS = PAGES.filter((page) => Object.hasOwn(IMAGE_PAGES, page.route.id) || PDF.has(page.route.id) || isCalcPage(page.route.id) || isBrCalc(page.route.id) || isLifeCalc(page.route.id));

  it('shows a card for every guide of the registries, one under the other, and nothing on the other tools and calculators', () => {
    let pages = 0;
    let cards = 0;
    for (const page of MOLDS) {
      const root = parse(read(page.path));
      const main = root.querySelector('main');
      const want = wanted(page.route.id, page.lang);
      const here = main?.querySelectorAll('.fo-guidecard') ?? [];
      expect(here.map((card) => card.getAttribute('href')), page.path).toEqual(want);
      expect(main?.querySelectorAll('.fo-guide-links'), page.path).toHaveLength(0);
      expect(OLD_LINE.test(main?.text ?? ''), `${page.path}: a linha antiga`).toBe(false);
      if (want.length === 0) continue;
      pages += 1;
      cards += here.length;
      // The cards close the "How to" block, the first block of content after the panel, inside one wrapper.
      const how = main?.querySelector('section[data-content="how"]');
      expect(main?.querySelector('[data-content]'), page.path).toBe(how);
      expect(how?.querySelectorAll('.fo-guidehere > a.fo-guidecard.fo-guidecard--here').length, page.path).toBe(want.length);
      expect(how?.lastElementChild?.classList.contains('fo-guidehere'), `${page.path}: o cartão fecha o bloco`).toBe(true);
      expect(how?.querySelector('.fo-guidehere')?.previousElementSibling?.tagName.toLowerCase(), `${page.path}: depois dos passos`).toBe('ol');
      expect(root.querySelector('#fo-tool-root .fo-guidecard'), page.path).toBeNull();
      for (const card of here) {
        const data = guideCardData(FILE_GUIDE_IDS.find((id) => FILE_GUIDES[id].paths[page.lang] === card.getAttribute('href')) ?? GUIDE_IDS.find((id) => guidePathIn(id, page.lang) === card.getAttribute('href')) ?? 'guides-jpg-vs-png', page.lang);
        // --here: no heading and no foot (the tool in the guide is the page's own tool); one link, whose name starts with
        // the kind; the measure of the guide.
        expect(card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a'), page.path).toHaveLength(0);
        expect(card.querySelector('.fo-guidecard__tool'), page.path).toBeNull();
        expect(card.classList.contains('fo-tool'), page.path).toBe(false);
        expect(card.structuredText.replace(/\s+/g, ' ').trim().startsWith(`${TEXTS[page.lang].guides.card.kind} ${data.name}`), page.path).toBe(true);
        expect(card.querySelector('span.fo-guidecard__name')?.text, page.path).toBe(data.name);
        expect(card.querySelector('.fo-guidecard__proof')?.text.trim(), page.path).toBe(data.proof);
      }
    }
    // 9 tools in three languages, Resize image with two guides (30 cards), and the six calculators of the five money guides
    // in English and Spanish (12): read from the registries above, checked here against the counts of the specification.
    expect([pages, cards]).toEqual([27 + 12, 30 + 12]);
  }, 60_000);
});

// F11 (decision 7; the F5b F-12): a guide is never drawn with the ToolCard, on any page of the site, and every guide in the
// related grid of a guide is a GuideCard (with its foot: the tool it embeds).
describe('no guide with the ToolCard, on any page of dist/', () => {
  /** Every path of a guide, in every language that has it. */
  const GUIDE_PATHS = new Set([...FILE_GUIDE_IDS.flatMap((id) => LANGS.map((lang) => FILE_GUIDES[id].paths[lang])), ...GUIDE_IDS.flatMap((id) => LANGS.flatMap((lang) => guidePathIn(id, lang) ?? []))]);
  const HTML_FILES = listFiles(DIST).filter((file) => file.endsWith('.html'));

  it('reads the 40 guide pages and every HTML file of dist/', () => {
    expect(GUIDE_PATHS.size).toBe(40);
    expect(HTML_FILES.length).toBeGreaterThanOrEqual(211);
  });

  it('finds no a.fo-tool that leads to a guide, and no card that leads to a guide without being a GuideCard', () => {
    const wrong: string[] = [];
    let guideCards = 0;
    for (const file of HTML_FILES) {
      const html = readFileSync(file, 'utf8');
      if (!html.includes('fo-tool') && !html.includes('fo-guidecard')) continue;
      const main = parse(html).querySelector('main');
      for (const card of main?.querySelectorAll('a.fo-tool') ?? []) {
        if (GUIDE_PATHS.has(card.getAttribute('href') ?? '')) wrong.push(`${file}: ToolCard de ${card.getAttribute('href')}`);
      }
      for (const card of main?.querySelectorAll('.fo-grid > li > a, .fo-guidecards > li > a') ?? []) {
        const href = card.getAttribute('href') ?? '';
        if (GUIDE_PATHS.has(href) && !card.classList.contains('fo-guidecard')) wrong.push(`${file}: cartão de ${href} sem a classe fo-guidecard`);
        if (card.classList.contains('fo-guidecard')) guideCards += 1;
      }
    }
    expect(wrong).toEqual([]);
    expect(guideCards).toBeGreaterThan(0);
  }, 60_000);

  it('draws each guide of the related grid of a guide with the GuideCard and its foot, in the order of the registry', () => {
    let total = 0;
    for (const id of FILE_GUIDE_IDS) {
      for (const lang of LANGS) {
        const path = FILE_GUIDES[id].paths[lang];
        const section = parse(read(path)).querySelector('main section[data-content="related"]');
        const links = section?.querySelectorAll('ul.fo-grid > li > a') ?? [];
        const related = FILE_GUIDES[id].related.slice(0, 6);
        expect(links.length, path).toBe(related.length);
        for (const [index, target] of related.entries()) {
          const link = links[index];
          if (!isFileGuide(target)) {
            expect(link?.classList.contains('fo-tool'), `${path}: ${target}`).toBe(true);
            continue;
          }
          total += 1;
          const data = guideCardData(target, lang);
          expect(link?.getAttribute('href'), `${path}: ${target}`).toBe(data.href);
          expect(link?.classList.value, `${path}: ${target}`).toEqual(['fo-guidecard', 'fo-dogear', `fo-cat--${data.category}`]);
          expect(link?.querySelector('h3.fo-guidecard__name')?.text, `${path}: ${target}`).toBe(data.name);
          expect(link?.querySelector('.fo-guidecard__proof')?.text.trim(), `${path}: ${target}`).toBe(data.proof);
          expect(link?.querySelector('.fo-guidecard__tool > span:last-child > span:last-child')?.text, `${path}: ${target}`).toBe(data.tool.name);
          // One link per card: the gate counts the related links, six at most.
          expect(link?.querySelectorAll('a'), `${path}: ${target}`).toHaveLength(0);
        }
      }
    }
    // 18 guides in the related grids of each language (§ 189), now drawn as guides.
    expect(total).toBe(18 * LANGS.length);
  });
});
