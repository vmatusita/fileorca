import { describe, expect, it } from 'vitest';
import { compareAlternates, validateHreflang, validateSitemap, type PageHead } from '../../scripts/lib/seo-checks.ts';
import { alternatesFor, collectionPageLd, graph } from '../../src/seo/meta.ts';
import { sitemapIndexXml, sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';
import { ROUTES, routeById, type RouteDef, type RouteId } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGE_IDS, ES_CALC_IDS, GUIDE_IDS, MONEY_HUB_ID, isBrCalc } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';

const O = 'https://fileorca.com';
const tags = { xDefaultLang: 'en', langTags: ['en', 'pt-BR', 'es'] };
const cluster = (urls: Record<string, string>): PageHead[] =>
  Object.values(urls).map((url) => ({
    url,
    alternates: [...Object.entries(urls).map(([hreflang, href]) => ({ hreflang, href })), { hreflang: 'x-default', href: urls['en'] ?? '' }],
  }));

describe('validador de hreflang', () => {
  const good = cluster({ en: `${O}/a/`, 'pt-BR': `${O}/pt/a/`, es: `${O}/es/a/` });

  it('accepts a reciprocal, self-referencing cluster with x-default in English', () => {
    expect(validateHreflang(good, tags)).toEqual([]);
  });

  it('rejects a link that does not come back', () => {
    const broken = structuredClone(good);
    broken[1]!.alternates = broken[1]!.alternates.filter((alt) => alt.hreflang !== 'en');
    expect(validateHreflang(broken, tags).join('\n')).toMatch(/não volta|conjunto/);
  });

  it('rejects a page that does not reference itself', () => {
    const broken = structuredClone(good);
    broken[0]!.alternates = broken[0]!.alternates.filter((alt) => alt.hreflang !== 'en');
    expect(validateHreflang(broken, tags).join('\n')).toMatch(/autorreferente/);
  });

  it('rejects a missing or wrong x-default, unknown tags and links to non-indexable pages', () => {
    const noDefault = structuredClone(good).map((page) => ({ ...page, alternates: page.alternates.filter((alt) => alt.hreflang !== 'x-default') }));
    expect(validateHreflang(noDefault, tags).join('\n')).toMatch(/0 x-default/);
    const wrongDefault = structuredClone(good);
    for (const page of wrongDefault) page.alternates.find((alt) => alt.hreflang === 'x-default')!.href = `${O}/pt/a/`;
    expect(validateHreflang(wrongDefault, tags).join('\n')).toMatch(/x-default não aponta o inglês/);
    const unknown = structuredClone(good);
    unknown[0]!.alternates.push({ hreflang: 'fr', href: `${O}/fr/a/` });
    expect(validateHreflang(unknown, tags).join('\n')).toMatch(/desconhecido fr|não é página indexável/);
  });

  it('accepts pages in one language only (no hreflang) and clusters without English (no x-default)', () => {
    const ptOnly: RouteDef = { id: 'home', paths: { pt: '/pt/so-pt/' }, indexable: true, view: 'v', texts: [] };
    expect(alternatesFor(ptOnly)).toEqual([]);
    expect(validateHreflang([{ url: `${O}/pt/so-pt/`, alternates: [] }], tags)).toEqual([]);
    const ptEs: RouteDef = { id: 'home', paths: { pt: '/pt/b/', es: '/es/b/' }, indexable: true, view: 'v', texts: [] };
    const heads = Object.values(ptEs.paths).map((path) => ({ url: `${O}${path}`, alternates: alternatesFor(ptEs) }));
    expect(heads[0]?.alternates.map((alt) => alt.hreflang)).toEqual(['pt-BR', 'es']);
    expect(validateHreflang(heads, tags)).toEqual([]);
  });

  it('fails a page whose hreflang tags are missing or different from the route map', () => {
    const expected = alternatesFor(routeById('privacy'));
    expect(compareAlternates(expected, expected)).toEqual([]);
    expect(compareAlternates([], expected).join()).toMatch(/ausente/);
    expect(compareAlternates([...expected, { hreflang: 'fr', href: `${O}/fr/` }], expected).join()).toMatch(/a mais/);
  });

  it('is green for the real route map', () => {
    const heads = ROUTES.filter((route) => route.indexable).flatMap((route) =>
      Object.values(route.paths).map((path) => ({ url: `${O}${path}`, alternates: alternatesFor(route) })),
    );
    expect(validateHreflang(heads, tags)).toEqual([]);
    expect(alternatesFor(routeById('not-found'))).toEqual([]);
  });
});

describe('sitemaps', () => {
  // English: 19 pages of the F2 and F3, 24 of the money area (F4), 13 of the PDF area (F5a) and the 10 file guides (F5b;
  // DECISOES § 190). F6: Portuguese and Spanish had 8 (home, Compress image and the 6 institutional pages); they get the
  // other 11 pages of the image area and the 13 of the PDF area (decision 4), Spanish the money hub and its five
  // calculators (decision 6), Portuguese the Brazilian money pages once their rows are in the map (decision 5).
  const brRows = ROUTES.filter((route) => route.id === BR_HUB_ID || isBrCalc(route.id)).length;
  const SIZES = { en: 19 + 24 + 13 + 10, pt: 8 + 11 + 13 + brRows, es: 8 + 11 + 13 + 1 + ES_CALC_IDS.length } as const;

  it('builds one valid sitemap per language and an index, with the counts of the route map', () => {
    expect([0, 1 + BR_CALC_IDS.length]).toContain(brRows);
    for (const lang of ['en', 'pt', 'es'] as const) {
      expect(validateSitemap(sitemapXml(lang), sitemapUrls(lang), O)).toEqual([]);
      expect(sitemapUrls(lang), lang).toHaveLength(SIZES[lang]);
      // The count of the map itself: every indexable route that has a path in the language, once.
      expect(sitemapUrls(lang), lang).toHaveLength(ROUTES.filter((route) => route.indexable && route.paths[lang] !== undefined).length);
    }
    expect(sitemapIndexXml()).toContain(`<loc>${O}/sitemap-pt.xml</loc>`);
  });

  it('lists every image and PDF page and both hubs in the sitemap of each language (F6; before, only Compress image outside English)', () => {
    const ids = [...Object.keys(IMAGE_PAGES), 'image-tools', PDF_HUB_ID, ...PDF_TOOL_IDS] as RouteId[];
    expect(ids).toHaveLength(12 + 13);
    for (const lang of ['en', 'pt', 'es'] as const) {
      const listed = new Set(sitemapUrls(lang));
      for (const id of ids) expect(listed.has(`${O}${routeById(id).paths[lang] ?? '-'}`), `${lang} ${id}`).toBe(true);
      // Each sitemap lists the pages of its own language only.
      for (const url of listed) expect(url.startsWith(lang === 'en' ? `${O}/` : `${O}/${lang}/`), url).toBe(true);
      if (lang === 'en') for (const url of listed) expect(/^https:\/\/fileorca\.com\/(?:pt|es)\//.test(url), url).toBe(false);
    }
  });

  it('gives a page that exists only in English no hreflang (no equivalent to point to), and every image and PDF page the cluster of the three languages', () => {
    // F6: the image and PDF pages are translations now, so each one has the reciprocal cluster with the x-default in English
    // (only Compress image had it before). The file guides, the money presets and guides and the calculators without a
    // Spanish page stay English only, with no hreflang.
    for (const id of [...Object.keys(IMAGE_PAGES), 'image-tools', PDF_HUB_ID, ...PDF_TOOL_IDS] as RouteId[]) {
      const route = routeById(id);
      expect(alternatesFor(route).map((alt) => alt.hreflang), id).toEqual(['en', 'pt-BR', 'es', 'x-default']);
      expect(alternatesFor(route).map((alt) => alt.href), id).toEqual([`${O}${route.paths.en}`, `${O}${route.paths.pt}`, `${O}${route.paths.es}`, `${O}${route.paths.en}`]);
    }
    const englishOnly = [...FILE_GUIDE_IDS, ...GUIDE_IDS, ...CALC_PAGE_IDS.filter((id) => !(ES_CALC_IDS as readonly string[]).includes(id))] as RouteId[];
    expect(englishOnly).toHaveLength(10 + 5 + 13);
    for (const id of englishOnly) expect(alternatesFor(routeById(id)), id).toEqual([]);
    // The Spanish money pages pair with the English ones (decision 6): en, es and the x-default.
    for (const id of [MONEY_HUB_ID, ...ES_CALC_IDS] as RouteId[]) expect(alternatesFor(routeById(id)).map((alt) => alt.hreflang), id).toEqual(['en', 'es', 'x-default']);
    // The Brazilian pages have no pair (decision 2), so no hreflang at all.
    for (const route of ROUTES.filter((candidate) => candidate.id === BR_HUB_ID || isBrCalc(candidate.id))) expect(alternatesFor(route), route.id).toEqual([]);
  });

  it('flags missing, extra, duplicated and foreign URLs', () => {
    const xml = sitemapXml('en').replace('</urlset>', `  <url><loc>${O}/</loc></url>\n  <url><loc>https://evil.test/</loc></url>\n</urlset>`);
    const problems = validateSitemap(xml, [...sitemapUrls('en'), `${O}/missing/`], O).join('\n');
    expect(problems).toMatch(/repetida/);
    expect(problems).toMatch(/fora do domínio/);
    expect(problems).toMatch(/faltam/);
    expect(problems).toMatch(/sobram/);
  });

  it('escapes the JSON-LD so a text cannot close the script tag', () => {
    expect(graph({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });

  it('describes the hub as a CollectionPage listing its pages', () => {
    const items = [
      { name: 'Compress image', path: '/compress-image/' },
      { name: 'Resize image', path: '/resize-image/' },
    ];
    const ld = collectionPageLd('Image tools', 'Ten free tools.', '/image-tools/', 'en', items) as Record<string, unknown>;
    expect(ld).toMatchObject({ '@type': 'CollectionPage', name: 'Image tools', url: `${O}/image-tools/`, inLanguage: 'en' });
    expect(ld['mainEntity']).toEqual({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Compress image', url: `${O}/compress-image/` },
        { '@type': 'ListItem', position: 2, name: 'Resize image', url: `${O}/resize-image/` },
      ],
    });
    // No rating and no review: the plan allows none (gate:seo).
    expect(JSON.stringify(ld)).not.toMatch(/aggregateRating|"review"/);
  });
});
