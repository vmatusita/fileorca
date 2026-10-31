// Route map with equivalence (PLANO "Idiomas e URLs"; DECISOES § 4).
// Each row lists the URL of the same page in every language that has an equivalent version.
// hreflang only links languages present in a row; the sitemap and IndexNow read this map too.

export const LANGS = ['en', 'pt', 'es'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

/** BCP 47 tags for <html lang>, hreflang and og:locale. */
export const LANG_TAG: Record<Lang, string> = { en: 'en', pt: 'pt-BR', es: 'es' };
export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', pt: 'pt_BR', es: 'es_ES' };

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
  | 'avif-to-jpg'
  | 'convert-to-webp'
  | 'image-to-pdf'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'contact'
  | 'licenses'
  | 'support'
  | 'not-found';

export type AdArea = 'arquivos' | 'dinheiro' | 'casa-saude' | 'utilidades';

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

export const ROUTES: readonly RouteDef[] = [
  {
    id: 'home',
    paths: { en: '/', pt: '/pt/', es: '/es/' },
    indexable: true,
    view: 'src/views/HomeView.astro',
    texts: ['src/i18n/{lang}/home.ts'],
  },
  {
    id: 'compress-image',
    paths: { en: '/compress-image/', pt: '/pt/comprimir-imagem/', es: '/es/comprimir-imagen/' },
    indexable: true,
    view: 'src/tools/compress-image/',
    texts: ['src/tools/compress-image/i18n/{lang}.ts', 'src/tools/image/i18n/{lang}.ts'],
    adArea: 'arquivos',
  },
  // The other image tools, their presets and the hub exist only in English for now (DECISOES § 58).
  {
    id: 'image-tools',
    paths: { en: '/image-tools/' },
    indexable: true,
    view: 'src/views/ImageToolsView.astro',
    texts: ['src/i18n/{lang}/image-tools.ts'],
    adArea: 'arquivos',
  },
  ...imageToolRoutes(),
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
  {
    id: 'not-found',
    paths: { en: '/404.html', pt: '/pt/404.html', es: '/es/404.html' },
    indexable: false,
    view: 'src/views/NotFoundView.astro',
    texts: ['src/i18n/{lang}/not-found.ts'],
  },
];

/** English-only image tools (folder src/tools/<slug>/) and presets (src/tools/<parent>/presets/<name>/). */
function imageToolRoutes(): RouteDef[] {
  const tools: [RouteId, string][] = [
    ['resize-image', 'resize-image'],
    ['crop-image', 'crop-image'],
    ['rotate-image', 'rotate-image'],
    ['heic-to-jpg', 'heic-to-jpg'],
    ['webp-to-jpg', 'webp-to-jpg'],
    ['png-to-jpg', 'png-to-jpg'],
    ['avif-to-jpg', 'avif-to-jpg'],
    ['convert-to-webp', 'convert-to-webp'],
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
      paths: { en: `/${slug}/` },
      indexable: true,
      view: `src/tools/${slug}/`,
      texts: [`src/tools/${slug}/i18n/{lang}.ts`, 'src/tools/image/i18n/{lang}.ts'],
      adArea: 'arquivos',
    })),
    ...presets.map(([id, parent, name]): RouteDef => ({
      id,
      paths: { en: `/${parent}/${name}/` },
      indexable: true,
      view: `src/tools/${parent}/presets/${name}/`,
      texts: [`src/tools/${parent}/presets/${name}/i18n/{lang}.ts`, 'src/tools/image/i18n/{lang}.ts'],
      adArea: 'arquivos',
    })),
  ];
}

export function routeById(id: RouteId): RouteDef {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (!route) throw new Error(`unknown route ${id}`);
  return route;
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
