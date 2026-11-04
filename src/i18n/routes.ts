// Route map with equivalence (PLANO "Idiomas e URLs"; DECISOES § 4).
// Each row lists the URL of the same page in every language that has an equivalent version.
// hreflang only links languages present in a row; the sitemap and IndexNow read this map too.
import {
  BR_CALC_IDS,
  BR_CALC_PAGES,
  BR_HUB_ID,
  CALC_PAGES,
  CALC_PRESET_IDS,
  CALC_TOOL_IDS,
  GUIDES,
  GUIDE_IDS,
  HEALTH_HUB_ID,
  HOUSE_HUB_ID,
  LIFE_CALC_IDS,
  LIFE_CALC_PAGES,
  MONEY_HUB_ID,
  type BrCalcId,
  type CalcPageId,
  type GuideId,
  type LifeCalcId,
} from '../tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS, type PdfToolId } from '../tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, type FileGuideId } from '../tools/guides/registry.ts';

export const LANGS = ['en', 'pt', 'es'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

/** BCP 47 tags for <html lang>, hreflang and og:locale. */
export const LANG_TAG: Record<Lang, string> = { en: 'en', pt: 'pt-BR', es: 'es' };
/** og:locale; the Spanish pages are for the Hispanic audience of the US (prompt F6, decision 1; DECISOES § 214). */
export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', pt: 'pt_BR', es: 'es_US' };

export type RouteId =
  | 'home'
  | 'image-tools'
  | 'compress-image'
  | 'compress-image-to-100kb'
  | 'compress-image-to-1mb'
  | 'resize-image'
  | 'resize-image-youtube-thumbnail'
  | 'crop-image'
  | 'rotate-image'
  | 'heic-to-jpg'
  | 'webp-to-jpg'
  | 'png-to-jpg'
  | 'image-to-pdf'
  | typeof MONEY_HUB_ID
  | CalcPageId
  | typeof BR_HUB_ID
  | BrCalcId
  | typeof PDF_HUB_ID
  | PdfToolId
  | GuideId
  | typeof GUIDES_HUB_ID
  | FileGuideId
  | typeof HOUSE_HUB_ID
  | typeof HEALTH_HUB_ID
  | LifeCalcId
  | typeof QR_ID
  | 'privacy'
  | 'terms'
  | 'about'
  | 'contact'
  | 'licenses'
  | 'support'
  | 'offline'
  | 'open-with'
  | 'not-found';

/** F12 (DECISOES § 412): 'geral' is the area of the home and of the guides hub. */
export type AdArea = 'geral' | 'arquivos' | 'dinheiro' | 'casa-saude' | 'utilidades';

/** The QR code generator (prompt F7, decision 8): in the ad area "utilidades", with no hub; in pt and es since the languages adjustment. */
export const QR_ID = 'qr-code-generator';

export interface RouteDef {
  id: RouteId;
  /** URL path per language, always with a trailing slash (404 pages are files). */
  paths: Partial<Record<Lang, string>>;
  /** Enters sitemaps and hreflang. */
  indexable: boolean;
  /** Shared view template under src/views/ (or the tool folder) used by every language. */
  view: string;
  /** Text files per language; `{lang}` is replaced by the language code. */
  texts: string[];
  /** Ad area for AdSlot; pages without an area never render an AdSlot. */
  adArea?: AdArea;
}

/**
 * The paths of the image and PDF pages in Portuguese and Spanish (prompt F6, decision 2): the same page translated,
 * so each row links the three languages in hreflang, with the x-default in English.
 */
const TRANSLATED_PATHS: Partial<Record<RouteId, { pt: string; es: string }>> = {
  'image-tools': { pt: '/pt/ferramentas-de-imagem/', es: '/es/herramientas-de-imagen/' },
  'compress-image-to-100kb': { pt: '/pt/comprimir-imagem/para-100kb/', es: '/es/comprimir-imagen/a-100kb/' },
  'compress-image-to-1mb': { pt: '/pt/comprimir-imagem/para-1mb/', es: '/es/comprimir-imagen/a-1mb/' },
  'resize-image': { pt: '/pt/redimensionar-imagem/', es: '/es/redimensionar-imagen/' },
  'resize-image-youtube-thumbnail': { pt: '/pt/redimensionar-imagem/miniatura-youtube/', es: '/es/redimensionar-imagen/miniatura-youtube/' },
  'crop-image': { pt: '/pt/cortar-imagem/', es: '/es/recortar-imagen/' },
  'rotate-image': { pt: '/pt/girar-imagem/', es: '/es/rotar-imagen/' },
  'heic-to-jpg': { pt: '/pt/heic-para-jpg/', es: '/es/heic-a-jpg/' },
  'webp-to-jpg': { pt: '/pt/webp-para-jpg/', es: '/es/webp-a-jpg/' },
  'png-to-jpg': { pt: '/pt/png-para-jpg/', es: '/es/png-a-jpg/' },
  'image-to-pdf': { pt: '/pt/imagem-para-pdf/', es: '/es/imagen-a-pdf/' },
  'pdf-tools': { pt: '/pt/ferramentas-pdf/', es: '/es/herramientas-pdf/' },
  'merge-pdf': { pt: '/pt/juntar-pdf/', es: '/es/unir-pdf/' },
  'split-pdf': { pt: '/pt/dividir-pdf/', es: '/es/dividir-pdf/' },
  'rotate-pdf': { pt: '/pt/girar-pdf/', es: '/es/rotar-pdf/' },
  'delete-pdf-pages': { pt: '/pt/excluir-paginas-pdf/', es: '/es/eliminar-paginas-pdf/' },
  'reorder-pdf-pages': { pt: '/pt/organizar-paginas-pdf/', es: '/es/ordenar-paginas-pdf/' },
  'pdf-to-jpg': { pt: '/pt/pdf-para-jpg/', es: '/es/pdf-a-jpg/' },
  'add-page-numbers-to-pdf': { pt: '/pt/numerar-paginas-pdf/', es: '/es/numerar-paginas-pdf/' },
  'watermark-pdf': { pt: '/pt/marca-dagua-pdf/', es: '/es/marca-de-agua-pdf/' },
  'sign-pdf': { pt: '/pt/assinar-pdf/', es: '/es/firmar-pdf/' },
  'compress-pdf': { pt: '/pt/comprimir-pdf/', es: '/es/comprimir-pdf/' },
  'protect-pdf': { pt: '/pt/proteger-pdf/', es: '/es/proteger-pdf/' },
  'unlock-pdf': { pt: '/pt/desbloquear-pdf/', es: '/es/desbloquear-pdf/' },
  // F8: the offline page and the page of the share target, by the glossaries (docs/i18n/; DECISOES § 289 and § 290).
  offline: { pt: '/pt/offline/', es: '/es/sin-conexion/' },
  'open-with': { pt: '/pt/abrir-com/', es: '/es/abrir-con/' },
};

export const ROUTES: readonly RouteDef[] = [
  {
    id: 'home',
    paths: { en: '/', pt: '/pt/', es: '/es/' },
    indexable: true,
    view: 'src/views/HomeView.astro',
    texts: ['src/i18n/{lang}/home.ts'],
    // F12 · o mapa de anúncios (decision 3; DECISOES § 419): the home has ads, in the area "geral".
    adArea: 'geral',
  },
  {
    id: 'compress-image',
    paths: { en: '/compress-image/', pt: '/pt/comprimir-imagem/', es: '/es/comprimir-imagen/' },
    indexable: true,
    view: 'src/tools/compress-image/',
    texts: ['src/tools/compress-image/i18n/{lang}.ts', 'src/tools/image/i18n/{lang}.ts'],
    adArea: 'arquivos',
  },
  {
    id: 'image-tools',
    paths: { en: '/image-tools/', ...TRANSLATED_PATHS['image-tools'] },
    indexable: true,
    view: 'src/views/ImageToolsView.astro',
    texts: ['src/i18n/{lang}/image-tools.ts'],
    adArea: 'arquivos',
  },
  ...imageToolRoutes(),
  // The money hub, the 14 calculators, the 4 presets and the 5 guides, in English and Spanish (F6 and the languages adjustment).
  ...moneyRoutes(),
  // The Brazilian money hub and the eight calculators adapted to Brazil, only in Portuguese (F6, decision 5).
  ...brMoneyRoutes(),
  // The PDF hub and the 12 PDF tools exist in the three languages (F6).
  ...pdfRoutes(),
  // F11 (decision 5): the guides hub, in the three languages, right before the file guides, the way each hub comes before
  // its pages; it lists them and the money guides. F12 · o mapa de anúncios (decision 3; DECISOES § 419): with ads, in
  // the area "geral", like the home.
  {
    id: GUIDES_HUB_ID,
    paths: { en: '/guides/', pt: '/pt/guias/', es: '/es/guias/' },
    indexable: true,
    view: 'src/views/GuidesHubView.astro',
    texts: ['src/i18n/{lang}/guides.ts'],
    adArea: 'geral',
  },
  // The ten file guides, in the three languages since the languages adjustment (F5b; DECISOES § 58 and § 184).
  ...fileGuideRoutes(),
  // The home and health hubs and their 11 calculators, only in English (F7, decision 1).
  ...lifeRoutes(),
  {
    id: QR_ID,
    paths: { en: '/qr-code-generator/', pt: '/pt/gerador-de-qr-code/', es: '/es/generador-de-codigo-qr/' },
    indexable: true,
    view: 'src/tools/qr-code-generator/',
    texts: ['src/tools/qr-code-generator/i18n/{lang}.ts'],
    adArea: 'utilidades',
  },
  {
    id: 'privacy',
    paths: { en: '/privacy/', pt: '/pt/privacidade/', es: '/es/privacidad/' },
    indexable: true,
    view: 'src/views/LegalView.astro',
    texts: ['src/i18n/{lang}/privacy.ts'],
  },
  {
    id: 'terms',
    paths: { en: '/terms/', pt: '/pt/termos/', es: '/es/terminos/' },
    indexable: true,
    view: 'src/views/LegalView.astro',
    texts: ['src/i18n/{lang}/terms.ts'],
  },
  {
    id: 'about',
    paths: { en: '/about/', pt: '/pt/sobre/', es: '/es/acerca-de/' },
    indexable: true,
    view: 'src/views/AboutView.astro',
    texts: ['src/i18n/{lang}/about.ts'],
  },
  {
    id: 'contact',
    paths: { en: '/contact/', pt: '/pt/contato/', es: '/es/contacto/' },
    indexable: true,
    view: 'src/views/ContactView.astro',
    texts: ['src/i18n/{lang}/contact.ts'],
  },
  {
    id: 'licenses',
    paths: { en: '/licenses/', pt: '/pt/licencas/', es: '/es/licencias/' },
    indexable: true,
    view: 'src/views/LicensesView.astro',
    texts: ['src/i18n/{lang}/licenses.ts'],
  },
  {
    id: 'support',
    paths: { en: '/support/', pt: '/pt/apoie/', es: '/es/apoyo/' },
    indexable: true,
    view: 'src/views/SupportView.astro',
    texts: ['src/i18n/{lang}/support.ts'],
  },
  // F8: the page the service worker shows offline for a page it did not keep, and the page the share target of the
  // manifests opens (Android). Out of the sitemaps and of hreflang, noindex in _headers, with no ads and reached
  // by no link (DECISOES § 289 and § 290).
  {
    id: 'offline',
    paths: { en: '/offline/', ...TRANSLATED_PATHS['offline'] },
    indexable: false,
    view: 'src/views/OfflineView.astro',
    texts: ['src/i18n/{lang}/offline.ts'],
  },
  {
    id: 'open-with',
    paths: { en: '/open-with/', ...TRANSLATED_PATHS['open-with'] },
    indexable: false,
    view: 'src/views/OpenWithView.astro',
    texts: ['src/i18n/{lang}/open-with.ts'],
  },
  {
    id: 'not-found',
    paths: { en: '/404.html', pt: '/pt/404.html', es: '/es/404.html' },
    indexable: false,
    view: 'src/views/NotFoundView.astro',
    texts: ['src/i18n/{lang}/not-found.ts'],
  },
];

/** The image tools (folder src/tools/<slug>/) and presets (src/tools/<parent>/presets/<name>/), in the three languages. */
function imageToolRoutes(): RouteDef[] {
  const tools: [RouteId, string][] = [
    ['resize-image', 'resize-image'],
    ['crop-image', 'crop-image'],
    ['rotate-image', 'rotate-image'],
    ['heic-to-jpg', 'heic-to-jpg'],
    ['webp-to-jpg', 'webp-to-jpg'],
    ['png-to-jpg', 'png-to-jpg'],
    ['image-to-pdf', 'image-to-pdf'],
  ];
  const presets: [RouteId, string, string][] = [
    ['compress-image-to-100kb', 'compress-image', 'to-100kb'],
    ['compress-image-to-1mb', 'compress-image', 'to-1mb'],
    ['resize-image-youtube-thumbnail', 'resize-image', 'youtube-thumbnail'],
  ];
  return [
    ...tools.map(([id, slug]): RouteDef => ({
      id,
      paths: { en: `/${slug}/`, ...TRANSLATED_PATHS[id] },
      indexable: true,
      view: `src/tools/${slug}/`,
      texts: [`src/tools/${slug}/i18n/{lang}.ts`, 'src/tools/image/i18n/{lang}.ts'],
      adArea: 'arquivos',
    })),
    ...presets.map(([id, parent, name]): RouteDef => ({
      id,
      paths: { en: `/${parent}/${name}/`, ...TRANSLATED_PATHS[id] },
      indexable: true,
      view: `src/tools/${parent}/presets/${name}/`,
      texts: [`src/tools/${parent}/presets/${name}/i18n/{lang}.ts`, 'src/tools/image/i18n/{lang}.ts'],
      adArea: 'arquivos',
    })),
  ];
}

/**
 * The money pages of the F4: the hub, each calculator (folder src/tools/<slug>/), each preset
 * (src/tools/<parent>/presets/<name>/) and each guide (src/views/GuideView.astro with src/i18n/<lang>/guide-<slug>.ts).
 * The ids and paths come from the calculator registry. Every one of them is in the ad area "dinheiro", which
 * is what gate:dinheiro-saude checks (DECISOES § 52). The hub and the five first calculators have a Spanish page since the
 * F6 (decision 6), and every other calculator, preset and guide since the languages adjustment (decision 4): the equivalent
 * page, with a pair in hreflang. No US money page exists in Portuguese, whose money hub is the Brazilian one.
 */
function moneyRoutes(): RouteDef[] {
  const shared = 'src/tools/calc/i18n/{lang}.ts';
  const calcTexts = (id: CalcPageId): string[] => {
    const def = CALC_PAGES[id];
    if (!def.parent) return [`src/tools/${id}/i18n/{lang}.ts`, shared];
    const name = def.path.split('/').at(-2) ?? '';
    return [`src/tools/${def.parent}/presets/${name}/i18n/{lang}.ts`, `src/tools/${def.parent}/i18n/{lang}.ts`, shared];
  };
  const calcView = (id: CalcPageId): string => {
    const def = CALC_PAGES[id];
    return def.parent ? `src/tools/${def.parent}/presets/${def.path.split('/').at(-2) ?? ''}/` : `src/tools/${id}/`;
  };
  return [
    {
      id: MONEY_HUB_ID,
      paths: { en: '/money-calculators/', es: '/es/calculadoras-financieras/' },
      indexable: true,
      view: 'src/views/MoneyCalculatorsView.astro',
      texts: ['src/i18n/{lang}/money-calculators.ts'],
      adArea: 'dinheiro',
    },
    ...[...CALC_TOOL_IDS, ...CALC_PRESET_IDS].map((id): RouteDef => ({
      id,
      paths: { en: CALC_PAGES[id].path, es: CALC_PAGES[id].es.path },
      indexable: true,
      view: calcView(id),
      texts: calcTexts(id),
      adArea: 'dinheiro',
    })),
    ...GUIDE_IDS.map((id): RouteDef => ({
      id,
      paths: { en: GUIDES[id].path, es: GUIDES[id].es.path },
      indexable: true,
      view: 'src/views/GuideView.astro',
      texts: [`src/i18n/{lang}/guide-${id.replace(/^guides-/, '')}.ts`, ...calcTexts(GUIDES[id].calc)],
      adArea: 'dinheiro',
    })),
  ];
}

/**
 * The money pages adapted to Brazil (F6, decision 5): pages of their own, only in Portuguese, with no pair in hreflang.
 * The hub reads src/i18n/pt/money-calculators.ts (the language's money hub texts); each calculator, its folder
 * src/tools/<id>/ with i18n/pt.ts. Every one is in the ad area "dinheiro", which gate:dinheiro-saude checks.
 */
function brMoneyRoutes(): RouteDef[] {
  return [
    {
      id: BR_HUB_ID,
      paths: { pt: '/pt/calculadoras-financeiras/' },
      indexable: true,
      view: 'src/views/MoneyCalculatorsView.astro',
      texts: ['src/i18n/{lang}/money-calculators.ts'],
      adArea: 'dinheiro',
    },
    ...BR_CALC_IDS.map((id): RouteDef => ({
      id,
      paths: { pt: BR_CALC_PAGES[id].path },
      indexable: true,
      view: `src/tools/${id}/`,
      texts: [`src/tools/${id}/i18n/{lang}.ts`, 'src/tools/calc/i18n/{lang}.ts'],
      adArea: 'dinheiro',
    })),
  ];
}

/**
 * The PDF pages (F5a), in the three languages since the F6: the hub and the 12 tools, all from the PDF registry. Every tool shares one mold and one
 * island (src/tools/pdf/); its page blocks live in src/tools/<slug>/i18n/{lang}.ts, next to the shared panel texts.
 */
function pdfRoutes(): RouteDef[] {
  return [
    {
      id: PDF_HUB_ID,
      paths: { en: '/pdf-tools/', ...TRANSLATED_PATHS[PDF_HUB_ID] },
      indexable: true,
      view: 'src/views/PdfToolsView.astro',
      texts: ['src/i18n/{lang}/pdf-tools.ts'],
      adArea: 'arquivos',
    },
    ...PDF_TOOL_IDS.map((id): RouteDef => ({
      id,
      paths: { en: `/${id}/`, ...TRANSLATED_PATHS[id] },
      indexable: true,
      view: 'src/tools/pdf/',
      texts: [`src/tools/${id}/i18n/{lang}.ts`, 'src/tools/pdf/i18n/{lang}.ts'],
      adArea: 'arquivos',
    })),
  ];
}

/**
 * The file guides (F5b), in English, Portuguese and Spanish since the languages adjustment: src/views/FileGuideView.astro
 * with src/i18n/<lang>/guide-<slug>.ts, the shared guide texts and the texts of the tool the guide embeds. The ids and
 * paths come from the guide registry; every one is in the ad area "arquivos", like the tool it embeds.
 */
function fileGuideRoutes(): RouteDef[] {
  return FILE_GUIDE_IDS.map((id): RouteDef => {
    const tool = FILE_GUIDES[id].tool;
    const toolTexts = (PDF_TOOL_IDS as readonly string[]).includes(tool)
      ? [`src/tools/${tool}/i18n/{lang}.ts`, 'src/tools/pdf/i18n/{lang}.ts']
      : [`src/tools/${tool}/i18n/{lang}.ts`, 'src/tools/image/i18n/{lang}.ts'];
    return {
      id,
      paths: { ...FILE_GUIDES[id].paths },
      indexable: true,
      view: 'src/views/FileGuideView.astro',
      texts: [`src/i18n/{lang}/guide-${id.replace(/^guides-/, '')}.ts`, 'src/i18n/{lang}/file-guides.ts', ...toolTexts],
      adArea: 'arquivos',
    };
  });
}

/**
 * The home and health pages of the F7 (decision 1): the two hubs (src/views/LifeCalculatorsView.astro with
 * src/i18n/<lang>/home-calculators.ts or health-calculators.ts) and the 11 calculators (folder src/tools/<slug>/ with
 * i18n/en.ts), only in English, with no pair in hreflang. Every one is in the ad area "casa-saude", which
 * gate:dinheiro-saude checks with the official sources of its hub (ymylHubOf).
 */
function lifeRoutes(): RouteDef[] {
  return [
    {
      id: HOUSE_HUB_ID,
      paths: { en: '/home-calculators/' },
      indexable: true,
      view: 'src/views/LifeCalculatorsView.astro',
      texts: ['src/i18n/{lang}/home-calculators.ts'],
      adArea: 'casa-saude',
    },
    {
      id: HEALTH_HUB_ID,
      paths: { en: '/health-calculators/' },
      indexable: true,
      view: 'src/views/LifeCalculatorsView.astro',
      texts: ['src/i18n/{lang}/health-calculators.ts'],
      adArea: 'casa-saude',
    },
    ...LIFE_CALC_IDS.map((id): RouteDef => ({
      id,
      paths: { en: LIFE_CALC_PAGES[id].path },
      indexable: true,
      view: `src/tools/${id}/`,
      texts: [`src/tools/${id}/i18n/{lang}.ts`, 'src/tools/calc/i18n/{lang}.ts'],
      adArea: 'casa-saude',
    })),
  ];
}

/** The hub whose official sources gate:dinheiro-saude asks of a page: money, home or health (prompt F7, decision 7). */
export function ymylHubOf(id: RouteId): 'money' | 'house' | 'health' | null {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route?.adArea === 'dinheiro') return 'money';
  if (route?.adArea !== 'casa-saude') return null;
  if (id === HOUSE_HUB_ID) return 'house';
  if (id === HEALTH_HUB_ID) return 'health';
  return (LIFE_CALC_IDS as readonly string[]).includes(id) ? LIFE_CALC_PAGES[id as LifeCalcId].hub : null;
}

export function routeById(id: RouteId): RouteDef {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (!route) throw new Error(`unknown route ${id}`);
  return route;
}

/** The path of a page in a language, or undefined where the page does not exist (no row, or no version there). */
export function pagePath(id: RouteId, lang: Lang): string | undefined {
  return ROUTES.find((candidate) => candidate.id === id)?.paths[lang];
}

/** The money hub of a language: the Brazilian hub in Portuguese, the English hub (and its Spanish version) elsewhere. */
export function moneyHubId(lang: Lang): typeof MONEY_HUB_ID | typeof BR_HUB_ID {
  return lang === 'pt' ? BR_HUB_ID : MONEY_HUB_ID;
}

export function pathFor(id: RouteId, lang: Lang): string {
  const path = routeById(id).paths[lang];
  if (!path) throw new Error(`route ${id} has no ${lang} version`);
  return path;
}

/** Source page file for a route path: '/pt/privacidade/' -> 'src/pages/pt/privacidade/index.astro'. */
export function pageFileFor(path: string): string {
  if (path.endsWith('.html')) return `src/pages${path.slice(0, -'.html'.length)}.astro`;
  return `src/pages${path}index.astro`;
}

/** Language versions of a route, in LANGS order. */
export function languagesOf(route: RouteDef): Lang[] {
  return LANGS.filter((lang) => route.paths[lang] !== undefined);
}

export function textFilesFor(route: RouteDef, lang: Lang): string[] {
  return route.texts.map((pattern) => pattern.replaceAll('{lang}', lang));
}
