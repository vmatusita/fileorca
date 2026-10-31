// Gate: technical SEO of the built site (PLANO "SEO agressivo › Técnico").
// hreflang reciprocal and self-referencing with x-default in English; one sitemap per language
// inside an index, valid and matching the route map; canonical, title and description per page;
// robots.txt fixed; no robots meta; JSON-LD parses; 404 out of sitemaps and hreflang.
import { existsSync, readFileSync } from 'node:fs';
import { DIST, Problems, allPages, readHtml, requireDist } from '../lib/dist.ts';
import { compareAlternates, robotsProblems, validateHreflang, validateSitemap, type PageHead } from '../lib/seo-checks.ts';
import { HUB_ID, IMAGE_PAGE_IDS, missingFromSitemap, requiredSchemaTypes, schemaProblems, titleProblem, type LdNode } from '../lib/seo-pages.ts';
import { alternatesFor } from '../../src/seo/meta.ts';
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
  const brandFirst = page.route.id === 'home' && title.startsWith('FileOrca') && !title.includes(' | FileOrca');
  if (!title.endsWith(' | FileOrca') && !brandFirst) problems.add(`${page.path}: título sem " | FileOrca"`);
  if ((title.match(/FileOrca/g) ?? []).length > 1 && page.route.id === 'home') problems.add(`${page.path}: marca repetida no título`);
  const h1 = root.querySelector('h1')?.text.trim() ?? '';
  // Every tool and preset of the image registry: the title starts with the name of the tool (prompt F2, decision 9).
  const titleIssue = titleProblem(page.route.id, title, h1);
  if (titleIssue) problems.add(`${page.path}: ${titleIssue}`);
  if (description.length < 50 || description.length > 170) problems.add(`${page.path}: descrição com ${description.length} caracteres`);
  if (root.querySelector('meta[name="robots"]')) problems.add(`${page.path}: tem <meta name="robots"> (noindex é só por cabeçalho)`);
  const h1s = root.querySelectorAll('h1');
  if (h1s.length !== 1) problems.add(`${page.path}: ${h1s.length} H1`);
  const types = new Set<string>();
  const nodes: LdNode[] = [];
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.text) as { '@graph'?: (LdNode & { logo?: string; name?: string })[] };
      for (const node of data['@graph'] ?? []) {
        nodes.push(node);
        if (node['@type']) types.add(node['@type']);
        if (node['@type'] === 'Organization' && (!node.logo || !existsSync(`${DIST}${new URL(node.logo).pathname}`))) {
          problems.add(`${page.path}: Organization sem logo que exista no dist`);
        }
        if (node['@type'] === 'Person' && node.name !== 'Victor Yuki Matusita') problems.add(`${page.path}: Person diferente do autor`);
      }
      if (JSON.stringify(data).includes('aggregateRating') || JSON.stringify(data).includes('"review"')) {
        problems.add(`${page.path}: schema com nota ou avaliação`);
      }
    } catch {
      problems.add(`${page.path}: JSON-LD inválido`);
    }
  }
  // The tools and presets of the image registry carry a WebApplication; they and the hub carry a BreadcrumbList.
  for (const type of requiredSchemaTypes(page.route.id)) {
    if (!types.has(type)) problems.add(`${page.path}: falta o schema ${type}`);
  }
  if (page.route.indexable && page.route.id !== 'home' && !types.has('BreadcrumbList')) problems.add(`${page.path}: falta o schema BreadcrumbList`);
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
  for (const issue of schemaProblems(page.route.id, nodes, url)) problems.add(`${page.path}: ${issue}`);
  const og = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
  try {
    readFileSync(`${DIST}${new URL(og).pathname}`);
  } catch {
    problems.add(`${page.path}: og:image ${og} não existe no dist`);
  }
  const alternates = root.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => ({
    hreflang: link.getAttribute('hreflang') ?? '',
    href: link.getAttribute('href') ?? '',
  }));
  // The HTML must carry exactly the cluster the route map defines (a missing tag fails too).
  for (const problem of compareAlternates(alternates, alternatesFor(page.route))) problems.add(`${page.path}: ${problem}`);
  heads.push({ url, alternates });
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
// Every image tool, preset and the hub is in the English sitemap (the ones with only an English page are in no other).
const englishSitemap = readFileSync(`${DIST}${sitemapPath('en')}`, 'utf8');
const imageUrls: string[] = [];
for (const id of [...IMAGE_PAGE_IDS, HUB_ID]) {
  const path = ROUTES.find((candidate) => candidate.id === id)?.paths['en'];
  if (path) imageUrls.push(new URL(path, SITE_ORIGIN).href);
  else problems.add(`página ${id} do registro de imagem sem rota em inglês`);
}
for (const url of missingFromSitemap(englishSitemap, imageUrls)) problems.add(`${sitemapPath('en')}: falta ${url}`);
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
for (const problem of robotsProblems(robots, SITE_ORIGIN)) problems.add(problem);

problems.finish('seo', `${heads.length} páginas indexáveis em ${LANGS.length} idiomas, hreflang recíproco, ${LANGS.length} sitemaps`);
