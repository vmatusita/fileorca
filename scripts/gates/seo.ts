// Gate: technical SEO of the built site (PLANO "SEO agressivo › Técnico").
// hreflang reciprocal and self-referencing with x-default in English; one sitemap per language
// inside an index, valid and matching the route map; canonical, title and description per page;
// robots.txt fixed; no robots meta; JSON-LD parses; 404 out of sitemaps and hreflang.
import { readFileSync } from 'node:fs';
import { DIST, Problems, allPages, readHtml, requireDist } from '../lib/dist.ts';
import { validateHreflang, validateSitemap, type PageHead } from '../lib/seo-checks.ts';
import { LANGS, LANG_TAG, ROUTES } from '../../src/i18n/routes.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';
import { sitemapPath, sitemapUrls } from '../../src/seo/sitemap.ts';

requireDist();
const problems = new Problems();
const heads: PageHead[] = [];
const titles = new Map<string, string>();
const descriptions = new Map<string, string>();

for (const page of allPages()) {
  const root = readHtml(page.path);
  const url = new URL(page.path, SITE_ORIGIN).href;
  const html = root.querySelector('html');
  if (html?.getAttribute('lang') !== LANG_TAG[page.lang]) problems.add(`${page.path}: <html lang> diferente de ${LANG_TAG[page.lang]}`);
  const title = root.querySelector('title')?.text.trim() ?? '';
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if (!title.endsWith(' | FileOrca')) problems.add(`${page.path}: título sem " | FileOrca"`);
  if (description.length < 50 || description.length > 170) problems.add(`${page.path}: descrição com ${description.length} caracteres`);
  if (root.querySelector('meta[name="robots"]')) problems.add(`${page.path}: tem <meta name="robots"> (noindex é só por cabeçalho)`);
  const h1s = root.querySelectorAll('h1');
  if (h1s.length !== 1) problems.add(`${page.path}: ${h1s.length} H1`);
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.text) as { '@graph'?: { '@type'?: string; aggregateRating?: unknown }[] };
      if (JSON.stringify(data).includes('aggregateRating') || JSON.stringify(data).includes('"review"')) {
        problems.add(`${page.path}: schema com nota ou avaliação`);
      }
    } catch {
      problems.add(`${page.path}: JSON-LD inválido`);
    }
  }
  if (!page.route.indexable) {
    if (root.querySelector('link[rel="canonical"]')) problems.add(`${page.path}: página não indexável com canonical`);
    if (root.querySelectorAll('link[rel="alternate"][hreflang]').length) problems.add(`${page.path}: página não indexável com hreflang`);
    continue;
  }
  if (titles.has(title)) problems.add(`${page.path}: título repetido de ${titles.get(title)}`);
  if (descriptions.has(description)) problems.add(`${page.path}: descrição repetida de ${descriptions.get(description)}`);
  titles.set(title, page.path);
  descriptions.set(description, page.path);
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonical !== url) problems.add(`${page.path}: canonical ${canonical ?? 'ausente'} em vez de ${url}`);
  const og = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
  try {
    readFileSync(`${DIST}${new URL(og).pathname}`);
  } catch {
    problems.add(`${page.path}: og:image ${og} não existe no dist`);
  }
  heads.push({
    url,
    alternates: root.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => ({
      hreflang: link.getAttribute('hreflang') ?? '',
      href: link.getAttribute('href') ?? '',
    })),
  });
}
for (const problem of validateHreflang(heads, { xDefaultLang: 'en', langTags: Object.values(LANG_TAG) })) problems.add(problem);

// Sitemaps: index -> one per language, each matching the indexable routes of that language.
const index = readFileSync(`${DIST}/sitemap-index.xml`, 'utf8');
const indexed = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedIndex = LANGS.map((lang) => new URL(sitemapPath(lang), SITE_ORIGIN).href);
if (JSON.stringify(indexed) !== JSON.stringify(expectedIndex)) problems.add(`sitemap-index.xml lista ${indexed.join(', ')}`);
if (!index.includes('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) problems.add('sitemap-index.xml sem o namespace');
for (const lang of LANGS) {
  const xml = readFileSync(`${DIST}${sitemapPath(lang)}`, 'utf8');
  for (const problem of validateSitemap(xml, sitemapUrls(lang), SITE_ORIGIN)) problems.add(`${sitemapPath(lang)}: ${problem}`);
}
for (const route of ROUTES.filter((candidate) => !candidate.indexable)) {
  for (const path of Object.values(route.paths)) {
    if (index.includes(path) || LANGS.some((lang) => readFileSync(`${DIST}${sitemapPath(lang)}`, 'utf8').includes(`${SITE_ORIGIN}${path}`))) {
      problems.add(`${path} não indexável aparece num sitemap`);
    }
  }
}

// robots.txt: fixed, allows everything and points to the sitemap index.
const robots = readFileSync(`${DIST}/robots.txt`, 'utf8');
if (robots !== readFileSync('public/robots.txt', 'utf8')) problems.add('dist/robots.txt diferente de public/robots.txt');
if (!/^User-agent: \*$/m.test(robots) || !/^Allow: \/$/m.test(robots) || /^Disallow: \S/m.test(robots)) problems.add('robots.txt não libera tudo');
if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap-index.xml`)) problems.add('robots.txt não aponta o índice de sitemaps');

problems.finish('seo', `${heads.length} páginas indexáveis em ${LANGS.length} idiomas, hreflang recíproco, ${LANGS.length} sitemaps`);
