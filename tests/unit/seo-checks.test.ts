import { describe, expect, it } from 'vitest';
import { validateHreflang, validateSitemap, type PageHead } from '../../scripts/lib/seo-checks.ts';
import { alternatesFor, graph } from '../../src/seo/meta.ts';
import { sitemapIndexXml, sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';
import { ROUTES, routeById } from '../../src/i18n/routes.ts';

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
    const ptOnly = { id: 'home', paths: { pt: '/pt/so-pt/' }, indexable: true, view: 'v', texts: [] } as const;
    expect(alternatesFor(ptOnly)).toEqual([]);
    expect(validateHreflang([{ url: `${O}/pt/so-pt/`, alternates: [] }], tags)).toEqual([]);
    const ptEs = { id: 'home', paths: { pt: '/pt/b/', es: '/es/b/' }, indexable: true, view: 'v', texts: [] } as const;
    const heads = Object.values(ptEs.paths).map((path) => ({ url: `${O}${path}`, alternates: alternatesFor(ptEs) }));
    expect(heads[0]?.alternates.map((alt) => alt.hreflang)).toEqual(['pt-BR', 'es']);
    expect(validateHreflang(heads, tags)).toEqual([]);
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
  it('builds one valid sitemap per language and an index', () => {
    for (const lang of ['en', 'pt', 'es'] as const) {
      expect(validateSitemap(sitemapXml(lang), sitemapUrls(lang), O)).toEqual([]);
      expect(sitemapUrls(lang)).toHaveLength(8);
    }
    expect(sitemapIndexXml()).toContain(`<loc>${O}/sitemap-pt.xml</loc>`);
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
});
