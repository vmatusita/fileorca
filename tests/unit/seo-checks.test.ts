import { describe, expect, it } from 'vitest';
import { compareAlternates, validateHreflang, validateSitemap, type PageHead } from '../../scripts/lib/seo-checks.ts';
import { alternatesFor, collectionPageLd, graph } from '../../src/seo/meta.ts';
import { sitemapIndexXml, sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';
import { ROUTES, routeById, type RouteDef, type RouteId } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';

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
  // English: home, hub, 8 tools, 3 presets and the 6 legal and institutional pages, plus the money hub, 14 calculators,
  // 4 presets and 5 guides of the F4; Portuguese and Spanish keep the 8 they had (home, Compress image and the 6
  // institutional pages).
  // English: 19 pages of the F2 and F3, 24 of the money area (F4) and 13 of the PDF area (F5a).
  const SIZES = { en: 19 + 24 + 13, pt: 8, es: 8 } as const;

  it('builds one valid sitemap per language and an index', () => {
    for (const lang of ['en', 'pt', 'es'] as const) {
      expect(validateSitemap(sitemapXml(lang), sitemapUrls(lang), O)).toEqual([]);
      expect(sitemapUrls(lang), lang).toHaveLength(SIZES[lang]);
    }
    expect(sitemapIndexXml()).toContain(`<loc>${O}/sitemap-pt.xml</loc>`);
  });

  it('lists every image page and the hub in the English sitemap, and only Compress image in the others', () => {
    const imagePaths = [...Object.keys(IMAGE_PAGES), 'image-tools'].map((id) => routeById(id as RouteId).paths.en);
    expect(imagePaths).toHaveLength(12);
    for (const path of imagePaths) expect(sitemapUrls('en')).toContain(`${O}${path}`);
    for (const lang of ['pt', 'es'] as const) {
      const listed = new Set(sitemapUrls(lang));
      const imageRoutes = ROUTES.filter((route) => route.adArea === 'arquivos' && listed.has(`${O}${route.paths[lang]}`));
      expect(imageRoutes.map((route) => route.id), lang).toEqual(['compress-image']);
    }
  });

  it('gives a page that exists only in English no hreflang (no equivalent to point to)', () => {
    for (const id of [...Object.keys(IMAGE_PAGES), 'image-tools'] as RouteId[]) {
      if (id === 'compress-image') continue;
      expect(alternatesFor(routeById(id)), id).toEqual([]);
    }
    expect(alternatesFor(routeById('compress-image')).map((alt) => alt.hreflang)).toEqual(['en', 'pt-BR', 'es', 'x-default']);
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
