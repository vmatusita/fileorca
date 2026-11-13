import { describe, expect, it } from 'vitest';
import { compareAlternates, validateHreflang, validateSitemap, type PageHead } from '../../scripts/lib/seo-checks.ts';
import { alternatesFor, collectionPageLd, graph } from '../../src/seo/meta.ts';
import { sitemapEntries, sitemapIndexXml, sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';
import { QR_ID, ROUTES, routeById, type RouteDef, type RouteId } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGE_IDS, GUIDE_IDS, HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS, MONEY_HUB_ID, isBrCalc } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PRESET_IDS, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDE_IDS, GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';

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
  // F7 (decision 9; DECISOES § 259): English gets the pages of the areas "casa-saude" and "utilidades", read from the map
  // (the two hubs, the 11 home and health calculators and the QR code generator). The languages adjustment: Portuguese and
  // Spanish get the QR code generator and the 10 file guides, and Spanish the 18 calculator pages and the 5 money guides.
  const f7Rows = ROUTES.filter((route) => route.adArea === 'casa-saude' || route.adArea === 'utilidades').map((route) => route.id);
  // F11 (decision 5): the guides hub, one page in each language (the last 1 of each sum).
  // F17 (DECISOES § 716): AVIF to JPG and Convert to WebP, in the three languages: English 21 pages of the image area and
  // the institutional ones (19 before), and the other 13 pages of the image area in Portuguese and Spanish (11 before).
  // F18 (DECISOES § 743): Remove EXIF data and Flip image in the image area (23 in English, the other 15 in pt and es), and
  // Organize PDF and the 2 PDF presets in the PDF area (16: the hub, 13 tools and 2 presets; 13 before), in each language.
  // F19a (decisions 2 and 7; DECISOES § 752): What's new and How it works, one page each in every language (the institutional
  // part grows by 2: 25 in English with the image area, 10 in Portuguese and Spanish).
  const SIZES = { en: 25 + 24 + 16 + 10 + f7Rows.length + 1, pt: 10 + 15 + 16 + brRows + 1 + 10 + 1, es: 10 + 15 + 16 + 1 + CALC_PAGE_IDS.length + GUIDE_IDS.length + 1 + 10 + 1 } as const;

  it('builds one valid sitemap per language and an index, with the counts of the route map', () => {
    expect([0, 1 + BR_CALC_IDS.length]).toContain(brRows);
    expect(f7Rows, 'the F7 rows of the map').toEqual([HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS, QR_ID]);
    // Every page of home and health is in the English sitemap, and in no other; the QR code generator in each language's.
    for (const id of f7Rows) {
      expect(sitemapUrls('en'), id).toContain(`${O}${routeById(id).paths.en ?? '-'}`);
      expect(Object.keys(routeById(id).paths), id).toEqual(id === QR_ID ? ['en', 'pt', 'es'] : ['en']);
    }
    for (const lang of ['pt', 'es'] as const) expect(sitemapUrls(lang), lang).toContain(`${O}${routeById(QR_ID).paths[lang] ?? '-'}`);
    for (const lang of ['en', 'pt', 'es'] as const) {
      expect(validateSitemap(sitemapXml(lang), sitemapUrls(lang), O)).toEqual([]);
      expect(sitemapUrls(lang), lang).toHaveLength(SIZES[lang]);
      // The count of the map itself: every indexable route that has a path in the language, once.
      expect(sitemapUrls(lang), lang).toHaveLength(ROUTES.filter((route) => route.indexable && route.paths[lang] !== undefined).length);
    }
    expect(sitemapIndexXml()).toContain(`<loc>${O}/sitemap-pt.xml</loc>`);
  });

  it('lists every image and PDF page and both hubs in the sitemap of each language (F6; before, only Compress image outside English)', () => {
    const ids = [...Object.keys(IMAGE_PAGES), 'image-tools', PDF_HUB_ID, ...PDF_TOOL_IDS, ...PDF_PRESET_IDS] as RouteId[];
    // F17: 13 image pages and the hub (12 before), and the PDF hub and its 12 tools. F18 (DECISOES § 743): 15 image pages
    // and the hub, and the PDF hub, its 13 tools and its 2 presets.
    expect(ids).toHaveLength(16 + 16);
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
    // (only Compress image had it before). The languages adjustment: the file guides and the QR code generator too. F11: the
    // guides hub.
    for (const id of [...Object.keys(IMAGE_PAGES), 'image-tools', PDF_HUB_ID, ...PDF_TOOL_IDS, ...PDF_PRESET_IDS, ...FILE_GUIDE_IDS, QR_ID, GUIDES_HUB_ID] as RouteId[]) {
      const route = routeById(id);
      expect(alternatesFor(route).map((alt) => alt.hreflang), id).toEqual(['en', 'pt-BR', 'es', 'x-default']);
      expect(alternatesFor(route).map((alt) => alt.href), id).toEqual([`${O}${route.paths.en}`, `${O}${route.paths.pt}`, `${O}${route.paths.es}`, `${O}${route.paths.en}`]);
    }
    // F7 (decision 1): the two hubs and the 11 home and health calculators have no pair, so no hreflang.
    for (const id of [HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS] as RouteId[]) expect(alternatesFor(routeById(id)), id).toEqual([]);
    // The Spanish money pages pair with the English ones (F6, decision 6; every calculator, preset and guide since the
    // languages adjustment): en, es and the x-default.
    for (const id of [MONEY_HUB_ID, ...CALC_PAGE_IDS, ...GUIDE_IDS] as RouteId[]) expect(alternatesFor(routeById(id)).map((alt) => alt.hreflang), id).toEqual(['en', 'es', 'x-default']);
    // The Brazilian pages have no pair (decision 2), so no hreflang at all.
    for (const route of ROUTES.filter((candidate) => candidate.id === BR_HUB_ID || isBrCalc(candidate.id))) expect(alternatesFor(route), route.id).toEqual([]);
  });

  it('flags missing, extra, duplicated and foreign URLs', () => {
    // F19a (DECISOES § 753): the extra entries carry a <lastmod>, as every entry of the sitemap does now.
    const xml = sitemapXml('en').replace('</urlset>', `  <url><loc>${O}/</loc><lastmod>2026-11-13</lastmod></url>\n  <url><loc>https://evil.test/</loc><lastmod>2026-11-13</lastmod></url>\n</urlset>`);
    const problems = validateSitemap(xml, [...sitemapUrls('en'), `${O}/missing/`], O).join('\n');
    expect(problems).toMatch(/repetida/);
    expect(problems).toMatch(/fora do domínio/);
    expect(problems).toMatch(/faltam/);
    expect(problems).toMatch(/sobram/);
  });

  // F19a (decision 3; DECISOES § 753 and § 757): the mutants of the <lastmod>. The real sitemaps pass with the rules of the
  // gate (the build day and the dates of the changelog); each mutant breaks one rule and is caught by it.
  describe('the <lastmod> of every <url>', () => {
    const lang = 'pt' as const;
    const entries = sitemapEntries(lang);
    const lastmods = new Map(entries.map((entry) => [entry.url, entry.lastmod]));
    const today = [...lastmods.values()].sort().at(-1) ?? '';
    const [first] = entries;
    const url = first?.url ?? '';
    const real = sitemapXml(lang);
    const tag = `<loc>${url}</loc><lastmod>${first?.lastmod}</lastmod>`;
    const mutate = (to: string) => {
      expect(real).toContain(tag);
      return real.replace(tag, () => to);
    };

    it('passes on the real sitemaps with the build day and the changelog', () => {
      for (const each of ['en', 'pt', 'es'] as const) {
        const map = new Map(sitemapEntries(each).map((entry) => [entry.url, entry.lastmod]));
        expect(validateSitemap(sitemapXml(each), sitemapUrls(each), O, { today, lastmods: map }), each).toEqual([]);
      }
    });

    it('fails a <url> without <lastmod>', () => {
      expect(validateSitemap(mutate(`<loc>${url}</loc>`), sitemapUrls(lang), O, { today, lastmods }).join('\n')).toMatch(/sem <loc> e <lastmod>/);
    });

    it('fails a <lastmod> out of the form AAAA-MM-DD, or a day that does not exist', () => {
      for (const bad of ['13/11/2026', '2026-11-13T10:00:00Z', '2026-02-30', '']) {
        expect(validateSitemap(mutate(`<loc>${url}</loc><lastmod>${bad}</lastmod>`), sitemapUrls(lang), O, { today, lastmods }).join('\n'), bad).toMatch(/fora do formato AAAA-MM-DD/);
      }
    });

    it('fails a <lastmod> after the day of the build', () => {
      const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
      expect(validateSitemap(real, sitemapUrls(lang), O, { today: yesterday, lastmods }).join('\n')).toMatch(/depois do dia do build/);
      expect(validateSitemap(mutate(`<loc>${url}</loc><lastmod>2099-01-01</lastmod>`), sitemapUrls(lang), O, { today, lastmods }).join('\n')).toMatch(/depois do dia do build/);
    });

    it('fails a <lastmod> other than the one the changelog gives the page', () => {
      const other = first?.lastmod === '2026-11-01' ? '2026-11-02' : '2026-11-01';
      const problems = validateSitemap(mutate(`<loc>${url}</loc><lastmod>${other}</lastmod>`), sitemapUrls(lang), O, { today, lastmods }).join('\n');
      expect(problems).toMatch(/o changelog diz/);
      expect(problems).not.toMatch(/fora do formato|depois do dia do build/);
    });
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
