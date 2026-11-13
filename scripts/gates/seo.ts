// Gate: technical SEO of the built site (PLANO "SEO agressivo › Técnico").
// hreflang reciprocal and self-referencing with x-default in English; one sitemap per language
// inside an index, valid and matching the route map; canonical, title and description per page;
// robots.txt fixed; no robots meta; JSON-LD parses; 404 out of sitemaps and hreflang.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { DIST, Problems, allPages, readHtml, requireDist } from '../lib/dist.ts';
import { compareAlternates, robotsProblems, validateHreflang, validateSitemap, type PageHead } from '../lib/seo-checks.ts';
import { BR_PAGE_IDS, SITEMAP_REGISTRY_IDS, descriptionProblem, fileGuideTitleProblems, fileGuideWant, missingFromSitemap, requiredSchemaTypes, schemaProblems, titleProblem, type LdNode } from '../lib/seo-pages.ts';
import { isFileGuide } from '../../src/tools/guides/registry.ts';
import { alternatesFor } from '../../src/seo/meta.ts';
import { LANGS, LANG_TAG, ROUTES, type Lang } from '../../src/i18n/routes.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';
import { sitemapEntries, sitemapPath, sitemapUrls } from '../../src/seo/sitemap.ts';

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
  // A file guide (F5b): its own name first, no year, and not the H1 of the tool it embeds (read from that tool's page).
  // Since the languages adjustment, in the language of the page: the name of the guide's card and the tool page of that language.
  if (isFileGuide(page.route.id)) {
    const want = fileGuideWant(page.route.id, page.lang);
    const toolH1 = want.toolPath ? (readHtml(want.toolPath).querySelector('h1')?.text.trim() ?? '') : '';
    if (!want.name) problems.add(`${page.path}: o guia não tem nome no cartão do idioma (common.fileGuides de ${page.lang})`);
    if (!toolH1) problems.add(`${page.path}: a página da ferramenta embutida não tem H1`);
    for (const issue of fileGuideTitleProblems(want.name, title, h1, toolH1)) problems.add(`${page.path}: ${issue}`);
  }
  // 50 to 170 characters; the image and PDF pages in Portuguese and Spanish 120 to 160 (prompt F6, decision 4).
  const descriptionIssue = descriptionProblem(page.route.id, page.lang, description);
  if (descriptionIssue) problems.add(`${page.path}: ${descriptionIssue}`);
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
// F19a (decision 3; DECISOES § 753): every <url> has a <lastmod> in the form AAAA-MM-DD, never after the day of the build in
// UTC (the day dist/build.txt was written), and the one src/platform/changelog.ts gives the page in the language.
const buildDay = statSync(`${DIST}/build.txt`).mtime.toISOString().slice(0, 10);
for (const lang of LANGS) {
  const xml = readFileSync(`${DIST}${sitemapPath(lang)}`, 'utf8');
  const lastmods = new Map(sitemapEntries(lang).map((entry) => [entry.url, entry.lastmod]));
  for (const problem of validateSitemap(xml, sitemapUrls(lang), SITE_ORIGIN, { today: buildDay, lastmods })) problems.add(`${sitemapPath(lang)}: ${problem}`);
}
// Every image tool, preset and the hub is in the English sitemap; the money hub, calculators, presets and guides of the
// F4 too, the PDF hub and tools of the F5a and the file guides of the F5b. F6: each one is also in the sitemap of every
// other language its route has (the image and PDF pages in pt and es, the Spanish money pages), and in no sitemap of a
// language it does not have. The Brazilian pages (Portuguese only, no English route) are read once their rows are in the map.
// The languages adjustment: the QR code generator too, in its three languages (SITEMAP_REGISTRY_IDS).
const sitemapOf = Object.fromEntries(LANGS.map((lang) => [lang, readFileSync(`${DIST}${sitemapPath(lang)}`, 'utf8')])) as Record<Lang, string>;
const registryUrls: Record<Lang, string[]> = { en: [], pt: [], es: [] };
const brazilian = BR_PAGE_IDS.filter((id) => ROUTES.some((candidate) => candidate.id === id));
for (const id of [...SITEMAP_REGISTRY_IDS, ...brazilian]) {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (!route?.paths['en'] && !brazilian.includes(id)) problems.add(`página ${id} do registro de imagem sem rota em inglês`);
  for (const lang of LANGS) {
    const path = route?.paths[lang];
    if (!path) continue;
    const url = new URL(path, SITE_ORIGIN).href;
    registryUrls[lang].push(url);
    for (const other of LANGS.filter((candidate) => candidate !== lang)) {
      if (!missingFromSitemap(sitemapOf[other], [url]).length) problems.add(`${sitemapPath(other)}: ${url} é de outro idioma`);
    }
  }
}
for (const lang of LANGS) for (const url of missingFromSitemap(sitemapOf[lang], registryUrls[lang])) problems.add(`${sitemapPath(lang)}: falta ${url}`);
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
