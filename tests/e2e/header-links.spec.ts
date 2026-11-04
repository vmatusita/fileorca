// The header of every page, read from the HTML the server sends, without rendering (F11, decision 10a and criterion 1;
// DECISOES § 391). The list of pages comes from the route map, every language of every route (presets, guides, the hubs,
// the institutional pages, the offline, open-with and 404 pages): in each language, the Menu of every page leads to the
// guides hub of that language and to each category hub that exists in it, plus the QR code and the support page, in the
// order of the sheet, and its section is marked with aria-current="page" on the hub itself. In the same pass, the order
// of the <head> (decision 10, the theme): the color-scheme meta, then the theme script, and only then the CSS; and the
// script of the theme button right after the </header>. One test per block of pages, never one for the whole site (it
// went past the 60 s of a test in the WebKit of the CI when the site grew, § 306).
import { expect, test, type APIRequestContext } from '@playwright/test';
import { parse } from 'node-html-parser';
import { ROUTES, languagesOf, pathFor, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';
import { expectedLanguages, expectedSheet } from './lib/header.ts';

interface Page {
  id: RouteId;
  lang: Lang;
  path: string;
}

const PAGES: Page[] = ROUTES.flatMap((route) => languagesOf(route).map((lang) => ({ id: route.id, lang, path: route.paths[lang] ?? '' })));
const BLOCK = 24;

async function html(request: APIRequestContext, page: Page): Promise<string> {
  const response = await request.get(page.path);
  // The 404 pages are files: /404.html redirects to /404, which the local server answers with the file itself.
  if (page.id === 'not-found') expect([200, 404], page.path).toContain(response.status());
  else expect(response.status(), page.path).toBe(200);
  return response.text();
}

function checkHead(source: string, label: string): void {
  const head = source.slice(0, source.indexOf('</head>'));
  const at = (needle: string) => head.indexOf(needle);
  const charset = at('<meta charset="utf-8">');
  const viewport = at('<meta name="viewport"');
  const meta = at('<meta name="color-scheme" content="light dark">');
  const script = at('<script>try{let t=localStorage.getItem("fo-theme")');
  const css = at('<link rel="stylesheet"');
  expect(charset, `${label}: charset`).toBeGreaterThanOrEqual(0);
  expect(viewport, `${label}: viewport after the charset`).toBeGreaterThan(charset);
  expect(meta, `${label}: the color-scheme meta after the viewport`).toBeGreaterThan(viewport);
  expect(script, `${label}: the theme script after the meta`).toBeGreaterThan(meta);
  expect(css, `${label}: the stylesheet in the head`).toBeGreaterThan(0);
  expect(css, `${label}: the stylesheet after the theme script`).toBeGreaterThan(script);
  // Nothing styles the page before the script: no other stylesheet and no <style> above it.
  expect(head.slice(0, script), label).not.toMatch(/<style|rel="stylesheet"/);
  expect(head.match(/<meta name="color-scheme"/g), `${label}: one color-scheme meta`).toHaveLength(1);
}

function checkHeader(source: string, page: Page): void {
  const label = page.path;
  const root = parse(source);
  const header = root.querySelector('header.fo-header');
  expect(header, label).not.toBeNull();
  const sheet = header?.querySelector('nav#fo-menu[popover]');
  expect(sheet, `${label}: the Menu sheet`).not.toBeNull();
  // The Menu button opens it, with no script.
  expect(header?.querySelector('button.fo-header__menu')?.getAttribute('popovertarget'), label).toBe('fo-menu');
  const rows = sheet?.querySelectorAll('ul.fo-menu__list:not([aria-labelledby]) > li > a') ?? [];
  expect(rows.map((row) => row.getAttribute('href')), label).toEqual(expectedSheet(page.lang));
  expect(rows.map((row) => row.getAttribute('href')), `${label}: the guides hub`).toContain(pathFor(GUIDES_HUB_ID, page.lang));
  // The page's own hub is marked "page", and no other row is.
  const own = rows.filter((row) => row.getAttribute('aria-current') === 'page').map((row) => row.getAttribute('href'));
  expect(own, `${label}: aria-current="page"`).toEqual(rows.some((row) => row.getAttribute('href') === page.path) ? [page.path] : []);
  expect(rows.filter((row) => row.hasAttribute('aria-current')).length, `${label}: one section at most`).toBeLessThanOrEqual(1);
  // The language list at the end of the sheet: the same three links as the language menu, with hreflang and lang.
  const languages = (selector: string) => header?.querySelectorAll(`${selector} a[hreflang]`).map((link) => [link.getAttribute('hreflang'), link.getAttribute('lang'), link.getAttribute('href')]) ?? [];
  expect(languages('#fo-menu .fo-menu__lang'), label).toEqual(languages('#fo-langmenu'));
  expect(languages('#fo-menu .fo-menu__lang').map((link) => link[2]), label).toEqual(expectedLanguages(page.id));
  // The theme button and its status region, and the script of the button right after the header.
  expect(header?.querySelector('button.fo-header__theme[data-theme-toggle]'), label).not.toBeNull();
  expect(header?.querySelector('[role="status"][data-theme-status]'), label).not.toBeNull();
  expect(source, `${label}: the button script right after the header`).toMatch(/<\/header><script>\(function\(\)\{var d=document\.documentElement/);
}

test.describe('the header and the head of every page, in the HTML of the server', () => {
  test('the list of pages is the route map, with every language of every route', () => {
    expect(PAGES.length).toBe(ROUTES.reduce((sum, route) => sum + languagesOf(route).length, 0));
    expect(PAGES.some((page) => page.id === GUIDES_HUB_ID)).toBe(true);
    // The sheet of every language has the guides hub and at least the image, PDF and money hubs.
    for (const lang of ['en', 'pt', 'es'] as const) expect(expectedSheet(lang).length, lang).toBeGreaterThanOrEqual(6);
  });

  for (let start = 0; start < PAGES.length; start += BLOCK) {
    const block = PAGES.slice(start, start + BLOCK);
    test(`pages ${start + 1} to ${start + block.length} of ${PAGES.length} (${block[0]?.path} and on)`, async ({ request }) => {
      for (const page of block) {
        const source = await html(request, page);
        checkHead(source, page.path);
        checkHeader(source, page);
      }
    });
  }
});
