// The offline page and the "Open with" page are out of the index on purpose (F8, decisions 1 and 8; DECISOES § 289
// and § 290): reached only through the service worker and the manifest, so no link of the site leads to them. This
// test makes their exception explicit in each gate that reads the route map: the orphan gate (gate:links) skips them,
// they have no hreflang and no sitemap line (gate:seo checks both on the build), their _headers say noindex, they have
// no ads, and gate:prontidao counts only indexable pages for words, titles and the sitemaps.
import { describe, expect, it } from 'vitest';
import { LANGS, ROUTES, routeById } from '../../src/i18n/routes.ts';
import { alternatesFor } from '../../src/seo/meta.ts';
import { sitemapXml } from '../../src/seo/sitemap.ts';
import { headerRules, noindexPagePaths } from '../../src/platform/headers.ts';
import { orphanPaths, type PageLinks } from '../../scripts/lib/links-graph.ts';

const F8_PAGES = ['offline', 'open-with'] as const;
const paths = F8_PAGES.flatMap((id) => Object.values(routeById(id).paths));

describe('the noindex pages of the F8', () => {
  it('are in the route map in the three languages, not indexable and with no ad area', () => {
    for (const id of F8_PAGES) {
      const route = routeById(id);
      expect(route.indexable).toBe(false);
      expect(route.adArea).toBeUndefined();
      expect(Object.keys(route.paths).sort()).toEqual([...LANGS].sort());
    }
    expect(paths).toEqual(['/offline/', '/pt/offline/', '/es/sin-conexion/', '/open-with/', '/pt/abrir-com/', '/es/abrir-con/']);
  });

  it('have no hreflang and are in no sitemap', () => {
    for (const id of F8_PAGES) expect(alternatesFor(routeById(id))).toEqual([]);
    for (const lang of LANGS) for (const path of paths) expect(sitemapXml(lang)).not.toContain(path);
  });

  it('say noindex in _headers, path by path', () => {
    expect(noindexPagePaths()).toEqual(paths);
    const rules = headerRules({ launched: true });
    for (const path of paths) expect(rules.find((rule) => rule.pattern === path)?.headers).toEqual({ 'X-Robots-Tag': 'noindex' });
    // The only other non-indexable route is the 404, with its own rules.
    expect(ROUTES.filter((route) => !route.indexable).map((route) => route.id)).toEqual([...F8_PAGES, 'not-found']);
  });

  it('are never orphans for gate:links, though no page links to them', () => {
    const page = (path: string, routeId: string, anchors: string[]): PageLinks => ({ path, routeId, anchors });
    const pages = [page('/', 'home', ['/support/']), page('/support/', 'support', ['/']), ...paths.map((path) => page(path, path.includes('ab') || path.includes('open') ? 'open-with' : 'offline', ['/']))];
    const indexable = new Set(['/', '/support/']);
    expect(orphanPaths(pages, indexable)).toEqual([]);
    // And a noindex page that were indexable would be one: the exception comes from the route map, not from the gate.
    expect(orphanPaths(pages, new Set([...indexable, '/offline/']))).toEqual(['/offline/']);
  });
});
