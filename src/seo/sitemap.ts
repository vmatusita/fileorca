// One sitemap per language inside an index (PLANO "SEO agressivo › Técnico").
import { LANGS, ROUTES, type Lang } from '../i18n/routes.ts';
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

export function sitemapXml(lang: Lang): string {
  const entries = sitemapUrls(lang).map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const entries = LANGS.map((lang) => `  <sitemap><loc>${absolute(sitemapPath(lang))}</loc></sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>\n`;
}
