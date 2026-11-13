// One sitemap per language inside an index (PLANO "SEO agressivo › Técnico").
// F19a (decision 3; DECISOES § 753): every <url> has its <lastmod>, the date of the newest change of the page in the
// language (lastmodOf, src/platform/changelog.ts), the same source as the What's new page and the line "Updated on".
import { LANGS, ROUTES, type Lang, type RouteId } from '../i18n/routes.ts';
import { lastmodOf } from '../platform/changelog.ts';
import { absolute } from './meta.ts';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function sitemapPath(lang: Lang): string {
  return `/sitemap-${lang}.xml`;
}

export function sitemapUrls(lang: Lang): string[] {
  return ROUTES.filter((route) => route.indexable && route.paths[lang] !== undefined).map((route) =>
    absolute(route.paths[lang] ?? '/'),
  );
}

/** The URL and the <lastmod> of every indexable page of a language, in the order of the route map. */
export function sitemapEntries(lang: Lang): { id: RouteId; url: string; lastmod: string }[] {
  return ROUTES.filter((route) => route.indexable && route.paths[lang] !== undefined).map((route) => ({
    id: route.id,
    url: absolute(route.paths[lang] ?? '/'),
    lastmod: lastmodOf(route.id, lang),
  }));
}

export function sitemapXml(lang: Lang): string {
  const entries = sitemapEntries(lang).map(({ url, lastmod }) => `  <url><loc>${escapeXml(url)}</loc><lastmod>${lastmod}</lastmod></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const entries = LANGS.map((lang) => `  <sitemap><loc>${absolute(sitemapPath(lang))}</loc></sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>\n`;
}
