import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, LANG_TAG, ROUTES, languagesOf, moneyHubId, pageFileFor, pathFor, routeById, textFilesFor, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { absolute, alternatesFor, ogImagePath, pageTitle } from '../../src/seo/meta.ts';
import { sitemapUrls } from '../../src/seo/sitemap.ts';
import { GUIDES, GUIDE_IDS, guidePathIn } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, guidesOfHub } from '../../src/tools/guides/registry.ts';
import { HUB_GROUPS, hubGroup, hubGuides } from '../../src/tools/guides/hub.ts';
import { fileForPath } from '../../scripts/lib/dist.ts';
import { descriptionProblem, requiredSchemaTypes, schemaProblems, type LdNode } from '../../scripts/lib/seo-pages.ts';

// The guides hub of the F11 (decision 5; DECISOES § 364): /guides/, /pt/guias/ and /es/guias/, indexable, with no ad area,
// every guide of the language read from the registries, the SEO of a hub (CollectionPage and BreadcrumbList, canonical,
// hreflang with the x-default, the sitemap of each language, the Open Graph card of each language). The second half reads
// the built pages in dist/, so it needs a `pnpm build` first, like glossary.test.ts and english-leak.test.ts.

const O = 'https://fileorca.com';
const PATHS: Record<Lang, string> = { en: '/guides/', pt: '/pt/guias/', es: '/es/guias/' };
/** The guides of a language, by the registries alone: the ten file guides everywhere, the money guides where they exist. */
const wanted = (lang: Lang) => [...FILE_GUIDE_IDS.map((id) => FILE_GUIDES[id].paths[lang]), ...GUIDE_IDS.flatMap((id) => guidePathIn(id, lang) ?? [])];

const html = (path: string): HTMLElement => {
  const file = fileForPath(path);
  expect(existsSync(file), `${path} não existe no dist/: rode pnpm build antes do Vitest`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
};
const nodesOf = (root: HTMLElement): LdNode[] =>
  root.querySelectorAll('script[type="application/ld+json"]').flatMap((script) => (JSON.parse(script.text) as { '@graph': LdNode[] })['@graph']);
type ItemList = { numberOfItems?: number; itemListElement?: { position?: number; name?: string; url?: string }[] };
type Crumbs = { itemListElement?: { position?: number; name?: string; item?: string }[] };

describe('the route of the guides hub', () => {
  // F12 (decision 3; DECISOES § 423): the hub has the ads of the map now, in the area "geral" of the home.
  it('has the three paths, is indexable, has the ad area "geral" and links the three languages in hreflang with the x-default in English', () => {
    const route = routeById(GUIDES_HUB_ID);
    expect(route.paths).toEqual(PATHS);
    expect(route.indexable).toBe(true);
    expect(route.adArea).toBe('geral');
    expect(routeById('home').adArea).toBe('geral');
    expect(languagesOf(route)).toEqual([...LANGS]);
    for (const lang of LANGS) expect(pathFor(GUIDES_HUB_ID, lang), lang).toBe(PATHS[lang]);
    expect(alternatesFor(route)).toEqual([
      { hreflang: 'en', href: `${O}/guides/` },
      { hreflang: 'pt-BR', href: `${O}/pt/guias/` },
      { hreflang: 'es', href: `${O}/es/guias/` },
      { hreflang: 'x-default', href: `${O}/guides/` },
    ]);
    // Its id is not a guide id: every guide starts with "guides-", the hub is "guides" alone.
    expect(GUIDES_HUB_ID.startsWith('guides-')).toBe(false);
    expect([...FILE_GUIDE_IDS, ...GUIDE_IDS].every((id) => id.startsWith('guides-'))).toBe(true);
  });

  it('sits right before the file guides in the map, with a page file per language, its view and its text files', () => {
    const ids = ROUTES.map((candidate) => candidate.id);
    expect(ids.indexOf(GUIDES_HUB_ID)).toBe(ids.indexOf(FILE_GUIDE_IDS[0]) - 1);
    const route = routeById(GUIDES_HUB_ID);
    expect(LANGS.map((lang) => pageFileFor(PATHS[lang]))).toEqual(['src/pages/guides/index.astro', 'src/pages/pt/guias/index.astro', 'src/pages/es/guias/index.astro']);
    for (const lang of LANGS) {
      expect(existsSync(pageFileFor(PATHS[lang])), lang).toBe(true);
      expect(textFilesFor(route, lang), lang).toEqual([`src/i18n/${lang}/guides.ts`]);
    }
    expect(existsSync(route.view)).toBe(true);
  });

  it('is in the sitemap of each language, and in no other', () => {
    for (const lang of LANGS) {
      expect(sitemapUrls(lang), lang).toContain(`${O}${PATHS[lang]}`);
      for (const other of LANGS.filter((candidate) => candidate !== lang)) expect(sitemapUrls(other), `${other} lists ${PATHS[lang]}`).not.toContain(`${O}${PATHS[lang]}`);
    }
  });
});

describe('the guides of the hub, read from the registries', () => {
  it('lists each guide of the language once: 15 in en and es, 10 in pt, the file guides in registry order, then the money guides', () => {
    expect(LANGS.map((lang) => hubGuides(lang).length)).toEqual([15, 10, 15]);
    for (const lang of LANGS) {
      const guides = hubGuides(lang);
      expect(new Set(guides.map((guide) => guide.path)).size, lang).toBe(guides.length);
      expect([...guides.map((guide) => guide.path)].sort(), lang).toEqual(wanted(lang).sort());
      // The groups, in the order of the page: the image hub's guides, the PDF hub's, then the money guides of the language.
      expect(hubGroup('image', lang).map((guide) => guide.id), lang).toEqual(guidesOfHub('image-tools'));
      expect(hubGroup('pdf', lang).map((guide) => guide.id), lang).toEqual(guidesOfHub('pdf-tools'));
      expect(hubGroup('money', lang).map((guide) => guide.id), lang).toEqual(GUIDE_IDS.filter((id) => guidePathIn(id, lang) !== null));
      expect(guides.map((guide) => guide.id), lang).toEqual(HUB_GROUPS.flatMap((group) => hubGroup(group, lang).map((guide) => guide.id)));
      // The names and descriptions of the cards of the language, never a text of the hub.
      for (const guide of guides) {
        const card = guide.group === 'money' ? TEXTS[lang].common.guides?.[guide.id as (typeof GUIDE_IDS)[number]] : TEXTS[lang].common.fileGuides?.[guide.id as (typeof FILE_GUIDE_IDS)[number]];
        expect([guide.name, guide.description], `${lang} ${guide.id}`).toEqual([card?.name, card?.description]);
      }
    }
    // No money guide in Portuguese (the US money pages are not in pt): its money group is the note to the Brazilian hub.
    expect(hubGroup('money', 'pt')).toEqual([]);
    expect(TEXTS.pt.guides.moneyNote?.link).toBe('calculadoras financeiras');
    expect(GUIDE_IDS.map((id) => GUIDES[id].path).every((path) => path.startsWith('/guides/'))).toBe(true);
  });
});

describe('the three pages of the guides hub in dist/', () => {
  for (const lang of LANGS) {
    const path = PATHS[lang];
    const t = TEXTS[lang].guides;
    const n = hubGuides(lang).length;

    it(`${path}: title, description, canonical, hreflang with the x-default and the Open Graph card of ${lang}`, () => {
      const root = html(path);
      const description = fmt(t.description, { n: groupDigits(n, lang) });
      expect(root.querySelector('html')?.getAttribute('lang')).toBe(LANG_TAG[lang]);
      expect(root.querySelector('title')?.text).toBe(pageTitle(t.title));
      expect(root.querySelector('title')?.text.startsWith({ en: 'Guides', pt: 'Guias', es: 'Guías' }[lang])).toBe(true);
      expect(root.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(description);
      expect(description).toContain(String(n));
      expect(descriptionProblem(GUIDES_HUB_ID, lang, description)).toBeNull();
      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(170);
      expect(root.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${O}${path}`);
      const alternates = root.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => ({ hreflang: link.getAttribute('hreflang'), href: link.getAttribute('href') }));
      expect(alternates).toEqual(alternatesFor(routeById(GUIDES_HUB_ID)));
      expect(root.querySelector('meta[name="robots"]')).toBeNull();
      // The Open Graph card of the language: /og/<lang>/guides.png, a 1200 × 630 PNG that the build wrote.
      const og = ogImagePath(GUIDES_HUB_ID, lang);
      expect(og).toBe(`/og/${lang}/guides.png`);
      expect(root.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(absolute(og));
      expect(root.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(description);
      expect(existsSync(fileForPath(og)), og).toBe(true);
      const png = readFileSync(fileForPath(og));
      expect(png.subarray(1, 4).toString('latin1')).toBe('PNG');
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    });

    it(`${path}: a valid CollectionPage of every guide of ${lang} and the BreadcrumbList Home › Guides`, () => {
      const root = html(path);
      const nodes = nodesOf(root);
      const canonical = `${O}${path}`;
      const types = nodes.map((node) => node['@type']);
      for (const type of requiredSchemaTypes(GUIDES_HUB_ID)) expect(types).toContain(type);
      expect(requiredSchemaTypes(GUIDES_HUB_ID)).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage']);
      expect(schemaProblems(GUIDES_HUB_ID, nodes, canonical)).toEqual([]);
      expect(JSON.stringify(nodes)).not.toMatch(/aggregateRating|"review"/);
      const crumbs = (nodes.find((node) => node['@type'] === 'BreadcrumbList') as Crumbs | undefined)?.itemListElement ?? [];
      expect(crumbs.map((crumb) => [crumb.position, crumb.name, crumb.item])).toEqual([
        [1, TEXTS[lang].common.breadcrumb.home, `${O}${pathFor('home', lang)}`],
        [2, TEXTS[lang].common.guidesHub, canonical],
      ]);
      const page = nodes.find((node) => node['@type'] === 'CollectionPage') as (LdNode & { name?: string; inLanguage?: string; mainEntity?: ItemList & { '@type'?: string } }) | undefined;
      expect(page?.name).toBe(t.h1);
      expect(page?.url).toBe(canonical);
      expect(page?.inLanguage).toBe(LANG_TAG[lang]);
      expect(page?.mainEntity?.['@type']).toBe('ItemList');
      expect(page?.mainEntity?.numberOfItems).toBe(n);
      expect(page?.mainEntity?.itemListElement?.map((item) => [item.position, item.name, item.url])).toEqual(hubGuides(lang).map((guide, index) => [index + 1, guide.name, absolute(guide.path)]));
    });

    it(`${path}: one H1, the three groups with their anchors, each guide of ${lang} once, no AdSlot, no Oli and no tool card`, () => {
      const root = html(path);
      const main = root.querySelector('main');
      expect(root.querySelectorAll('h1').map((h1) => h1.text.trim())).toEqual([t.h1]);
      expect(main?.querySelector('nav ol.fo-crumbs')?.querySelectorAll('li').map((crumb) => crumb.text.trim())).toEqual([TEXTS[lang].common.breadcrumb.home, TEXTS[lang].common.guidesHub]);
      expect(main?.querySelector('.fo-hubband.fo-cat--guide .fo-eyebrow')?.text).toBe(t.eyebrow);
      expect(main?.querySelector('.fo-hubband p')?.text).toBe(fmt(t.intro, { n: groupDigits(n, lang) }));
      // The shortcuts lead to the three sections, whose ids are the anchors of the footer (#image, #pdf, #money).
      expect(main?.querySelector('nav.fo-jump')?.getAttribute('aria-label')).toBe(t.jumpLabel);
      expect(main?.querySelectorAll('nav.fo-jump a').map((link) => link.getAttribute('href'))).toEqual(['#image', '#pdf', '#money']);
      expect(main?.querySelectorAll('section[id]').map((section) => section.id)).toEqual([...HUB_GROUPS, 'how']);
      expect(main?.querySelectorAll('section > h2').map((h2) => h2.text.trim())).toEqual([...HUB_GROUPS.map((group) => t.groups[group].heading), t.howHeading]);
      // Each group links to its guides of the language, each once, and nothing else; every guide of the language is there.
      const linked: string[] = [];
      for (const group of HUB_GROUPS) {
        const links = main?.querySelectorAll(`section#${group} a[href]`).map((link) => link.getAttribute('href') ?? '') ?? [];
        const guides = hubGroup(group, lang).map((guide) => guide.path);
        expect(links, `${lang} ${group}`).toEqual(guides.length > 0 ? guides : [pathFor(moneyHubId(lang), lang)]);
        linked.push(...links.filter((href) => guides.includes(href)));
      }
      expect(linked.sort()).toEqual(wanted(lang).sort());
      // In pt the money group is only the note, with the link to the Brazilian money calculators.
      if (lang === 'pt') expect(main?.querySelector('section#money .fo-section__note a')?.getAttribute('href')).toBe('/pt/calculadoras-financeiras/');
      // No AdSlot, no rail, no ad code in the default build (Mudança 10: no unit id, nothing), no Oli in the page and no
      // ToolCard (gate:prontidao counts main a.fo-tool on a hub). F12 (DECISOES § 423): a page with ads keeps the column
      // of the rail, empty here, like the tool pages (§ 413); the boxes of the map are checked on the test build
      // (tests/e2e/fo-ad-map.spec.ts).
      expect(root.querySelectorAll('.fo-ad, ins.adsbygoogle, aside.fo-rail, script[src*="adsbygoogle"]')).toHaveLength(0);
      expect(root.querySelector('.fo-frame--rail')).not.toBeNull();
      expect(main?.querySelectorAll('[data-oli]')).toHaveLength(0);
      expect(main?.querySelectorAll('a.fo-tool')).toHaveLength(0);
    });
  }
});

// F11 (decision 7): the breadcrumb of every guide goes through the guides hub (before, the image, PDF or money hub). It is
// also the first link to the hub from a page of another route, which keeps the hub out of the orphans of gate:links.
describe('the breadcrumb of the 40 guides in dist/: Home › Guides › the guide', () => {
  const pages = [...FILE_GUIDE_IDS, ...GUIDE_IDS].flatMap((id) => LANGS.flatMap((lang) => {
    const path = routeById(id as RouteId).paths[lang];
    return path ? [{ id, lang, path }] : [];
  }));

  it('has the 40 pages of guide, 15 in en and es and 10 in pt, read from the registries', () => {
    expect(pages).toHaveLength(40);
    expect(LANGS.map((lang) => pages.filter((page) => page.lang === lang).length)).toEqual([15, 10, 15]);
  });

  it('leads each guide to the guides hub of its language, in the HTML and in the BreadcrumbList (position 2)', () => {
    for (const { id, lang, path } of pages) {
      const root = html(path);
      const items = root.querySelectorAll('main nav ol.fo-crumbs li');
      expect(items, `${lang} ${id}`).toHaveLength(3);
      expect(items[1]?.querySelector('a')?.getAttribute('href'), `${lang} ${id}`).toBe(PATHS[lang]);
      expect(items[1]?.text.trim(), `${lang} ${id}`).toBe(TEXTS[lang].common.guidesHub);
      expect(items[2]?.querySelector('[aria-current="page"]'), `${lang} ${id}`).not.toBeNull();
      const crumbs = (nodesOf(root).find((node) => node['@type'] === 'BreadcrumbList') as Crumbs | undefined)?.itemListElement ?? [];
      expect(crumbs.map((crumb) => crumb.item), `${lang} ${id}`).toEqual([`${O}${pathFor('home', lang)}`, `${O}${PATHS[lang]}`, `${O}${path}`]);
      expect(crumbs[1]?.position, `${lang} ${id}`).toBe(2);
      expect(crumbs[1]?.name, `${lang} ${id}`).toBe(TEXTS[lang].common.guidesHub);
    }
  }, 60_000);
});
