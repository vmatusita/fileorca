// Readiness for the AdSense request (prompt F3, decision 5; PLANO "Monetização › Obrigatório antes do
// primeiro anúncio", "O que derruba conta" and "Páginas obrigatórias"; DECISOES § 95). Each check reads a
// built site folder (dist/, or the extra builds of scripts/gates/prontidao.ts under .cache/prontidao/) and
// returns rows of the gate's table: the item, ok or not, how it was checked and what failed.
// tests/unit/prontidao.test.ts proves every check on small fake sites in a temporary folder.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import { LANGS, ROUTES, languagesOf, routeById, type Lang } from '../../src/i18n/routes.ts';
import { sitemapPath, sitemapUrls } from '../../src/seo/sitemap.ts';
import { AUTHOR, CONTACT_EMAIL, SITE_ORIGIN } from '../../src/platform/site.ts';
import { IMAGE_PAGES, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { CALC_PAGES, CALC_PAGE_IDS, CALC_TOOL_IDS, GUIDE_IDS, HOME_CALC_IDS, MONEY_HUB_ID } from '../../src/tools/calc/registry.ts';
import { PLACEHOLDERS, normalizeText, pathOfFile, visibleText } from './conteudo.ts';
import { listFiles } from './dist.ts';
import { headerBlocks, patternApplies } from './headers-file.ts';
import { robotsProblems, validateSitemap } from './seo-checks.ts';

/** The publisher id of the readiness build: the zeros of the example in the AdSense help. */
export const TEST_CLIENT = 'ca-pub-0000000000000000';
/**
 * The ads.txt line the AdSense help asks for, with that id. Written here by hand from the help page
 * (support.google.com/adsense/answer/12171612, read on 31/out/2026), never computed by the site's code.
 */
export const TEST_ADS_TXT = 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0';

/** The six pages the plan and AdSense ask for, in every language (PLANO "Páginas obrigatórias"). */
export const REQUIRED_PAGES = ['about', 'contact', 'privacy', 'terms', 'licenses', 'support'] as const;

/** Words of visible text in <main>, AdSlot labels aside. The smallest page of the site today is Contact (74 in English). */
export const MIN_MAIN_WORDS = 60;
/** Words of <main> each AdSlot needs: about one phone screen of text per ad (DECISOES § 95). */
export const MIN_WORDS_PER_AD = 150;

/** Wording of a page that is not finished, on top of the placeholders gate:conteudo already refuses. */
const UNFINISHED: { label: string; pattern: RegExp }[] = [
  ...PLACEHOLDERS,
  { label: 'under construction', pattern: /\bunder construction\b/i },
  { label: 'em construção', pattern: /\bem constru[cç][aã]o\b/i },
  { label: 'en construcción', pattern: /\ben construcci[oó]n\b/i },
];

/** Ids that only exist in examples and templates. */
const FAKE_IDS: { label: string; pattern: RegExp }[] = [
  { label: 'ca-pub-0000…', pattern: /ca-pub-0{4}/ },
  { label: 'pub-0000…', pattern: /\bpub-0{16}\b/ },
  { label: 'G-XXXX…', pattern: /\bG-X{4,}/i },
  { label: 'example.com', pattern: /\bexample\.(?:com|org|net)\b/i },
];

/** What the privacy policy must say about Google ads, per language (AdSense "Required content", DECISOES § 95). */
const PRIVACY_TEXT: Record<Lang, { partner: RegExp; cookies: RegExp; cookieless: RegExp }> = {
  en: { partner: /Google is the advertising partner/i, cookies: /third-party vendors, including Google, use cookies/i, cookieless: /does not switch Google Analytics off: it then works without cookies/i },
  pt: { partner: /O Google é o parceiro de publicidade/i, cookies: /fornecedores terceiros, incluindo o Google, usam cookies/i, cookieless: /não desliga o Google Analytics: ele passa a funcionar sem cookies/i },
  es: { partner: /Google es el socio de publicidad/i, cookies: /proveedores externos, incluido Google, usan cookies/i, cookieless: /no apaga Google Analytics: entonces funciona sin cookies/i },
};
/** Where Google lets a visitor opt out of personalized ads (Ads Settings, now My Ad Center). */
const ADS_SETTINGS = /^https:\/\/(?:adssettings\.google\.com|myadcenter\.google\.com|www\.google\.com\/settings\/ads)(?:\/|$)/;
const PARTNER_SITES = /^https:\/\/(?:policies\.google\.com\/technologies\/partner-sites|www\.google\.com\/policies\/privacy\/partners)\/?$/;

const LOADER = /adsbygoogle\.js|pagead2\.googlesyndication\.com/;
/** A unit push in any form: `(adsbygoogle=…||[]).push`, `window.adsbygoogle.push`, … */
const PUSH = /adsbygoogle[^;]*\.push\s*\(/;
const HOSTNAME_LOCK = 'location.hostname==="fileorca.com"';
const UNIT = /class="adsbygoogle"/;
const META = /<meta name="google-adsense-account"[^>]*>/g;

export interface SitePage {
  id: string;
  lang: Lang;
  path: string;
  indexable: boolean;
  /** The page has an ad area, so it carries AdSlots and, with the three variables, the loader. */
  ads: boolean;
}

/** A built site and what the route map and the registry say it must have. */
export interface Site {
  dir: string;
  pages: SitePage[];
  /** Paths of the tools the home of each language (and the hub) must list: the registry, nothing else. */
  tools: Record<Lang, string[]>;
  /**
   * More cards a page must list, by route id and language (F4): the home's money section (the five credit
   * calculators) and the money hub (the 14 calculators), both from the calculator registry.
   */
  cards?: Record<string, Partial<Record<Lang, string[]>>>;
  /** Ids the search index must offer: every page of both registries and the guides. */
  searchIds: string[];
}

export interface Row {
  item: string;
  ok: boolean;
  how: string;
  problems: string[];
}

function row(item: string, how: string, problems: string[]): Row {
  return { item, ok: problems.length === 0, how, problems };
}

/** The real site: every page of the route map, the tools of the registry. */
export function realSite(dir: string): Site {
  const pages = ROUTES.flatMap((route) =>
    languagesOf(route).map((lang) => ({ id: route.id, lang, path: route.paths[lang] ?? '/', indexable: route.indexable, ads: route.adArea !== undefined })),
  );
  const tools = Object.fromEntries(
    LANGS.map((lang) => [lang, IMAGE_TOOL_IDS.flatMap((id) => routeById(id).paths[lang] ?? [])]),
  ) as Record<Lang, string[]>;
  const cards: Site['cards'] = {
    home: { en: HOME_CALC_IDS.map((id) => CALC_PAGES[id].path) },
    [MONEY_HUB_ID]: { en: CALC_TOOL_IDS.map((id) => CALC_PAGES[id].path) },
  };
  return { dir, pages, tools, cards, searchIds: [...Object.keys(IMAGE_PAGES), ...CALC_PAGE_IDS, ...GUIDE_IDS] };
}

/** File of a URL path in a built folder: '/pt/sobre/' -> <dir>/pt/sobre/index.html. */
export function fileIn(dir: string, path: string): string {
  const clean = decodeURI(path.split('#')[0]?.split('?')[0] ?? '/');
  return clean.endsWith('/') ? join(dir, clean, 'index.html') : join(dir, clean);
}

function read(dir: string, path: string): string | null {
  const file = fileIn(dir, path);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

/** Every HTML file of the folder, with its URL path. */
function htmlFiles(dir: string): { path: string; html: string }[] {
  return listFiles(dir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ path: pathOfFile(file, dir), html: readFileSync(file, 'utf8') }));
}

function langOfPath(path: string): Lang {
  return (LANGS.find((lang) => lang !== 'en' && path.startsWith(`/${lang}/`)) ?? 'en') as Lang;
}

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** The page exists in the folder, so the assets handler answers it with 200 (not the nearest 404). */
function exists(dir: string, path: string): boolean {
  return existsSync(fileIn(dir, path));
}

// ---- (a) AdSense ready for the id, with no ad on ------------------------------------------------------

/** Build with PUBLIC_ADSENSE_CLIENT only (PLANO "Como o anúncio liga", step 2): what the AdSense review sees. */
export function checkClientBuild(site: Site): Row[] {
  const files = htmlFiles(site.dir);
  const meta = files.flatMap(({ path, html }) => {
    const head = /<head>[\s\S]*<\/head>/.exec(html)?.[0] ?? '';
    const tags = head.match(META) ?? [];
    const all = html.match(META) ?? [];
    return tags.length === 1 && all.length === 1 && tags[0] === `<meta name="google-adsense-account" content="${TEST_CLIENT}">`
      ? []
      : [`${path}: ${all.length} meta google-adsense-account (${tags.length} no <head>), pede uma com ${TEST_CLIENT}`];
  });
  const adsFile = join(site.dir, 'ads.txt');
  const lines = existsSync(adsFile) ? readFileSync(adsFile, 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '') : null;
  const adsTxt = lines === null ? ['ads.txt não existe'] : lines.length === 1 && lines[0] === TEST_ADS_TXT ? [] : [`ads.txt com ${JSON.stringify(lines)}`];
  const loader = files.flatMap(({ path, html }) => (LOADER.test(html) || UNIT.test(html) ? [`${path}: carregador ou unidade do AdSense`] : []));
  return [
    row('Meta tag do AdSense em toda página, com o ID', `build com só PUBLIC_ADSENSE_CLIENT=${TEST_CLIENT}: uma <meta> no <head> de cada um dos ${files.length} HTML`, meta),
    row('ads.txt com a linha exata da ajuda do AdSense', `"${TEST_ADS_TXT}", escrita à mão a partir da ajuda, contra o /ads.txt desse build`, adsTxt),
    row('Sem carregador nem unidade só com o ID', 'nenhum adsbygoogle.js, googlesyndication nem ins.adsbygoogle nesse build', loader),
  ];
}

/** Build with the three variables: the loader only on pages with an ad area, never on legal or institutional pages. */
export function checkAllBuild(site: Site): Row[] {
  const problems: string[] = [];
  for (const page of site.pages) {
    const html = read(site.dir, page.path);
    if (html === null) {
      problems.push(`${page.path}: não existe no build`);
      continue;
    }
    const loader = LOADER.test(html);
    if (loader !== page.ads) problems.push(`${page.path}: ${loader ? 'carregador numa página sem área de anúncio' : 'página de ferramenta sem o carregador'}`);
    // Each script that loads AdSense or pushes a unit carries the lock itself; one locked script elsewhere in the
    // page does not cover another (DECISOES § 101).
    for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const body = script[2] ?? '';
      // The site loads AdSense only from an inline script with the lock: a <script src> of AdSense (the snippet of the
      // AdSense help) can carry no lock at all (second pass p2-integridade-01).
      if (LOADER.test(script[1] ?? '')) {
        problems.push(`${page.path}: carregador por <script src>, sem trava possível`);
        continue;
      }
      if (!LOADER.test(body) && !PUSH.test(body)) continue;
      if (!body.includes(HOSTNAME_LOCK)) problems.push(`${page.path}: ${LOADER.test(body) ? 'carregador' : 'push de unidade'} sem a trava do hostname`);
    }
    if (!page.ads && UNIT.test(html)) problems.push(`${page.path}: unidade de anúncio numa página sem área`);
  }
  return [
    row(
      'Carregador só nas ferramentas, nunca em página jurídica ou institucional',
      'build com as três variáveis (ID, unidades de teste e PUBLIC_ADS_ENABLED=true): o carregador está nas páginas com área de anúncio, com a trava do hostname, e em nenhuma outra',
      problems,
    ),
  ];
}

/** The real build of today (no id): no meta, no ads.txt, no loader, and the AdSlots are the neutral space. */
export function checkTodayBuild(site: Site): Row[] {
  const files = htmlFiles(site.dir);
  const problems = files.flatMap(({ path, html }) => [
    ...(html.includes('google-adsense-account') ? [`${path}: meta do AdSense`] : []),
    ...(LOADER.test(html) || UNIT.test(html) ? [`${path}: carregador ou unidade do AdSense`] : []),
  ]);
  if (existsSync(join(site.dir, 'ads.txt'))) problems.push('ads.txt existe sem o ID');
  const slots = files.reduce((sum, { html }) => sum + (html.match(/class="fo-ad fo-ad--/g) ?? []).length, 0);
  return [row('Build de hoje, sem o ID: nenhum anúncio', `dist/ real: nenhuma meta, ads.txt ou script de anúncio; ${slots} AdSlot(s) só com o espaço neutro`, problems)];
}

// ---- (b) Required pages ------------------------------------------------------------------------------

export function checkRequiredPages(site: Site): Row[] {
  const missing: string[] = [];
  const paths: Record<Lang, string[]> = { en: [], pt: [], es: [] };
  for (const id of REQUIRED_PAGES) {
    for (const lang of LANGS) {
      const page = site.pages.find((candidate) => candidate.id === id && candidate.lang === lang);
      if (!page) missing.push(`${id} sem página em ${lang}`);
      else if (!page.indexable) missing.push(`${page.path}: não indexável`);
      else if (!exists(site.dir, page.path)) missing.push(`${page.path}: não existe no build`);
      if (page) paths[lang].push(page.path);
    }
  }
  const footer = htmlFiles(site.dir).flatMap(({ path, html }) => {
    const links = new Set(parse(html).querySelectorAll('footer a[href]').map((link) => link.getAttribute('href')));
    const absent = paths[langOfPath(path)].filter((href) => !links.has(href));
    return absent.length ? [`${path}: rodapé sem ${absent.join(', ')}`] : [];
  });
  const contact = site.pages
    .filter((page) => page.id === 'contact')
    .flatMap((page) => {
      const html = read(site.dir, page.path) ?? '';
      const shown = visibleText(html, 'main').includes(CONTACT_EMAIL);
      const mail = parse(html).querySelector(`main a[href="mailto:${CONTACT_EMAIL}"]`) !== null;
      return shown && mail ? [] : [`${page.path}: ${CONTACT_EMAIL} ${shown ? 'sem link mailto' : 'não aparece'}`];
    });
  const privacy = site.pages
    .filter((page) => page.id === 'privacy')
    .flatMap((page) => {
      const html = read(site.dir, page.path) ?? '';
      const text = visibleText(html, 'main');
      const hrefs = parse(html).querySelectorAll('main a[href]').map((link) => link.getAttribute('href') ?? '');
      const want = PRIVACY_TEXT[page.lang];
      return [
        ...(want.partner.test(text) ? [] : ['o Google como parceiro de anúncios']),
        ...(want.cookies.test(text) ? [] : ['os cookies de terceiros, incluindo os do Google']),
        // Consent Mode sends cookieless pings after a Decline: the policy says so (review b-04, DECISOES § 102).
        ...(want.cookieless.test(text) ? [] : ['que o Google Analytics segue sem cookies depois da Recusa']),
        ...(hrefs.some((href) => ADS_SETTINGS.test(href)) ? [] : ['o link de opt-out (Ads Settings)']),
        ...(hrefs.some((href) => PARTNER_SITES.test(href)) ? [] : ['o link de como o Google usa dados de sites parceiros']),
        ...(text.includes(AUTHOR.name) ? [] : [`o controlador (${AUTHOR.name})`]),
        ...(text.includes(CONTACT_EMAIL) ? [] : [`o e-mail ${CONTACT_EMAIL}`]),
      ].map((what) => `${page.path}: falta ${what}`);
    });
  return [
    row('Sobre, Contato, Privacidade, Termos, Licenças e Apoio nos três idiomas', 'mapa de rotas: indexáveis, com o arquivo no build (o handler responde 200)', missing),
    row('As seis no rodapé de toda página', 'links do <footer> de cada HTML, no idioma da página', footer),
    row(`O Contato mostra ${CONTACT_EMAIL}`, 'texto visível do <main> e link mailto, nos três idiomas', contact),
    row(
      'A Privacidade tem o que o AdSense pede',
      'texto do <main> nos três idiomas: Google como parceiro, cookies de terceiros, o Analytics sem cookies depois da Recusa, links do Ads Settings e de sites parceiros, controlador e e-mail',
      privacy,
    ),
  ];
}

// ---- (c) No "coming soon" page -------------------------------------------------------------------------

export function checkNothingUnfinished(site: Site): Row[] {
  const files = htmlFiles(site.dir);
  const wording = files.flatMap(({ path, html }) => {
    const text = visibleText(html);
    return UNFINISHED.filter(({ pattern }) => pattern.test(text)).map(({ label }) => `${path}: "${label}"`);
  });
  const textFiles = listFiles(site.dir).filter((file) => /\.(?:html|json|xml|txt|webmanifest)$/.test(file));
  const fake = textFiles.flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    return FAKE_IDS.filter(({ pattern }) => pattern.test(source)).map(({ label }) => `${pathOfFile(file, site.dir)}: ${label}`);
  });
  const catalog: string[] = [];
  const listing = new Set(['home', 'image-tools', ...Object.keys(site.cards ?? {})]);
  for (const page of site.pages.filter((candidate) => listing.has(candidate.id))) {
    const html = read(site.dir, page.path);
    if (html === null) continue;
    const cards = parse(html).querySelectorAll('main a.fo-tool').map((card) => card.getAttribute('href') ?? '');
    for (const href of cards) if (!exists(site.dir, href)) catalog.push(`${page.path}: cartão para ${href}, que não existe`);
    const own = page.id === 'home' || page.id === 'image-tools' ? site.tools[page.lang] : [];
    const want = [...own, ...(site.cards?.[page.id]?.[page.lang] ?? [])];
    const extra = cards.filter((href) => !want.includes(href));
    const absent = want.filter((href) => !cards.includes(href));
    if (extra.length) catalog.push(`${page.path}: cartões fora do registro: ${extra.join(', ')}`);
    if (absent.length) catalog.push(`${page.path}: faltam os cartões de ${absent.join(', ')}`);
  }
  const indexFile = join(site.dir, 'search-index.json');
  if (!existsSync(indexFile)) catalog.push('search-index.json não existe');
  else {
    const entries = JSON.parse(readFileSync(indexFile, 'utf8')) as { id: string; href: Record<string, string> }[];
    for (const entry of entries) {
      for (const href of Object.values(entry.href)) if (!exists(site.dir, href)) catalog.push(`busca: ${entry.id} leva a ${href}, que não existe`);
    }
    const ids = entries.map((entry) => entry.id);
    const extra = ids.filter((id) => !site.searchIds.includes(id));
    const absent = site.searchIds.filter((id) => !ids.includes(id));
    if (extra.length) catalog.push(`busca com itens fora do registro: ${extra.join(', ')}`);
    if (absent.length) catalog.push(`busca sem ${absent.join(', ')}`);
  }
  return [
    row('Nenhum texto de obra', `texto visível de ${files.length} HTML nos três idiomas: ${UNFINISHED.map(({ label }) => label).join(', ')}`, wording),
    row('Nenhum ID de mentira', `${textFiles.length} arquivos de texto do build: ${FAKE_IDS.map(({ label }) => label).join(', ')}`, fake),
    row('Cartões e busca só com o que existe', 'cartões da home e do hub iguais ao registro, cada link e cada item do search-index.json com a página no build', catalog),
  ];
}

// ---- (d) Real content -----------------------------------------------------------------------------------

export function checkContent(site: Site): Row[] {
  const own: string[] = [];
  const thin: string[] = [];
  const ads: string[] = [];
  const seen = { h1: new Map<string, string>(), title: new Map<string, string>(), description: new Map<string, string>() };
  let indexable = 0;
  for (const page of site.pages.filter((candidate) => candidate.indexable)) {
    const html = read(site.dir, page.path);
    if (html === null) {
      own.push(`${page.path}: não existe no build`);
      continue;
    }
    indexable += 1;
    const root = parse(html);
    const h1s = root.querySelectorAll('h1');
    const values = {
      h1: normalizeText(h1s[0]?.text ?? ''),
      title: normalizeText(root.querySelector('title')?.text ?? ''),
      description: normalizeText(root.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''),
    };
    if (h1s.length !== 1) own.push(`${page.path}: ${h1s.length} H1`);
    for (const [kind, value] of Object.entries(values) as [keyof typeof values, string][]) {
      if (!value) own.push(`${page.path}: sem ${kind}`);
      else if (seen[kind].has(value)) own.push(`${page.path}: ${kind} igual ao de ${seen[kind].get(value)}`);
      else seen[kind].set(value, page.path);
    }
    const count = words(visibleText(html, 'main', ['.fo-ad']));
    if (count < MIN_MAIN_WORDS) thin.push(`${page.path}: ${count} palavras no <main>, pede ${MIN_MAIN_WORDS}`);
    const slots = (html.match(/class="fo-ad fo-ad--/g) ?? []).length;
    if (slots && count < slots * MIN_WORDS_PER_AD) ads.push(`${page.path}: ${slots} AdSlot(s) para ${count} palavras, pede ${MIN_WORDS_PER_AD} por AdSlot`);
  }
  return [
    row('H1, título e descrição próprios', `${indexable} páginas indexáveis: um H1 e nenhum H1, título ou descrição repetido`, own),
    row('Texto mínimo no <main>', `${MIN_MAIN_WORDS} palavras visíveis, sem o rótulo dos AdSlots (o Contato tem 74 hoje)`, thin),
    row('Mais conteúdo que anúncio', `${MIN_WORDS_PER_AD} palavras do <main> para cada AdSlot (uma tela de celular de texto por anúncio)`, ads),
  ];
}

// ---- (e) Crawlable ----------------------------------------------------------------------------------------

export function checkCrawlable(site: Site): Row[] {
  const robotsFile = join(site.dir, 'robots.txt');
  const robots = existsSync(robotsFile) ? robotsProblems(readFileSync(robotsFile, 'utf8'), SITE_ORIGIN) : ['robots.txt não existe'];
  const headersFile = join(site.dir, '_headers');
  const blocks = existsSync(headersFile) ? headerBlocks(readFileSync(headersFile, 'utf8')) : new Map<string, string[]>();
  const noindex: string[] = [];
  const indexable = site.pages.filter((page) => page.indexable);
  for (const page of indexable) {
    const html = read(site.dir, page.path);
    if (html === null) continue;
    for (const meta of parse(html).querySelectorAll('meta[name="robots"], meta[name="googlebot"]')) {
      if (/noindex|none/i.test(meta.getAttribute('content') ?? '')) noindex.push(`${page.path}: <meta name="${meta.getAttribute('name')}"> com noindex`);
    }
    for (const [pattern, lines] of blocks) {
      if (!patternApplies(pattern, page.path, SITE_ORIGIN)) continue;
      if (lines.some((line) => /^X-Robots-Tag:.*\b(?:noindex|none)\b/i.test(line))) noindex.push(`${page.path}: X-Robots-Tag noindex pela regra ${pattern} do _headers`);
    }
  }
  const sitemaps: string[] = [];
  const indexFile = join(site.dir, 'sitemap-index.xml');
  const listed = existsSync(indexFile) ? [...readFileSync(indexFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '') : [];
  if (!listed.length) sitemaps.push('sitemap-index.xml ausente ou vazio');
  let urls = 0;
  for (const lang of LANGS) {
    const location = `${SITE_ORIGIN}${sitemapPath(lang)}`;
    const file = join(site.dir, sitemapPath(lang));
    if (!listed.includes(location)) sitemaps.push(`sitemap-index.xml sem ${location}`);
    if (!existsSync(file)) {
      sitemaps.push(`${sitemapPath(lang)} não existe`);
      continue;
    }
    const xml = readFileSync(file, 'utf8');
    for (const problem of validateSitemap(xml, sitemapUrls(lang).filter((url) => indexable.some((page) => `${SITE_ORIGIN}${page.path}` === url)), SITE_ORIGIN)) {
      sitemaps.push(`${sitemapPath(lang)}: ${problem}`);
    }
    for (const [, url = ''] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls += 1;
      const path = url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) : url;
      const page = site.pages.find((candidate) => candidate.path === path);
      if (!page?.indexable) sitemaps.push(`${sitemapPath(lang)}: ${url} não é página indexável`);
      else if (!exists(site.dir, path)) sitemaps.push(`${sitemapPath(lang)}: ${url} não existe no build`);
    }
  }
  return [
    row('robots.txt não bloqueia ninguém e aponta os sitemaps', 'nenhum Disallow com caminho (Googlebot e Mediapartners-Google incluídos), Allow: / e o Sitemap do índice', robots),
    row('Nenhuma página indexável com noindex', `<meta name="robots"> e regras do _headers que valem em ${SITE_ORIGIN} para as ${indexable.length} páginas indexáveis`, noindex),
    row('Sitemaps só com páginas 200 e indexáveis', `índice com os ${LANGS.length} sitemaps; ${urls} URLs, cada uma indexável e com o arquivo no build`, sitemaps),
  ];
}

/** The table of the gate, aligned for the terminal. */
export function formatTable(rows: Row[]): string {
  const width = Math.max(...rows.map((entry) => entry.item.length));
  return rows.map((entry) => `${entry.ok ? 'ok   ' : 'FALHA'} ${entry.item.padEnd(width)}  ${entry.how}`).join('\n');
}
