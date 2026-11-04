import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';
import { HUB_GROUPS, hubGroup } from '../../src/tools/guides/hub.ts';
import { routeById } from '../../src/i18n/routes.ts';
import { allPages, fileForPath } from '../../scripts/lib/dist.ts';

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
