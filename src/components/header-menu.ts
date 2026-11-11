// What the Menu of the header lists (F11, decision 3; DECISOES § 388 and § 389): the sections of a language, with the
// count of each read from the registries, the section a page belongs to (its aria-current) and the language links. The
// Header reads it at build time, and the tests read it in Node (no import.meta.glob here, and never import it from an
// island). The specification is the "Especificação" of docs/propostas/ux-v2/header-a.html, alternative A.
import { LANGS, LANG_TAG, QR_ID, ROUTES, languagesOf, moneyHubId, pagePath, type Lang, type RouteDef, type RouteId } from '../i18n/routes.ts';
import type { CommonTexts } from '../i18n/types.ts';
import { fmt, groupDigits } from '../i18n/format.ts';
import type { IconName } from '../icons/svg.ts';
import { homePath } from '../seo/meta.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../tools/image/registry.ts';
import { PDF_HUB_ID, PDF_PRESET_IDS, PDF_TOOL_IDS } from '../tools/pdf/registry.ts';
import {
  BR_CALC_IDS,
  BR_HUB_ID,
  CALC_PAGE_IDS,
  GUIDE_IDS,
  HEALTH_CALC_IDS,
  HEALTH_HUB_ID,
  HOUSE_CALC_IDS,
  HOUSE_HUB_ID,
  HUB_MONEY_IDS,
  MONEY_HUB_ID,
} from '../tools/calc/registry.ts';
import { FILE_GUIDE_IDS, GUIDES_HUB_ID } from '../tools/guides/registry.ts';
import { hubGuides } from '../tools/guides/hub.ts';

/** The sections of the Menu, in the order of the sheet: the categories, then Guides and Support Oli. */
export const MENU_SECTIONS = ['image', 'pdf', 'money', 'house', 'health', 'qr', 'guides', 'support'] as const;
export type MenuSection = (typeof MENU_SECTIONS)[number];
/** The first list of the sheet (the categories with their colour) and the second one (Guides and Support Oli). */
export const MENU_GROUPS: readonly (readonly MenuSection[])[] = [
  ['image', 'pdf', 'money', 'house', 'health', 'qr'],
  ['guides', 'support'],
];

/** The own page of each section: its hub, or the page itself for the QR code and the support page. Money: per language. */
export function sectionPage(section: MenuSection, lang: Lang): RouteId {
  switch (section) {
    case 'image':
      return 'image-tools';
    case 'pdf':
      return PDF_HUB_ID;
    case 'money':
      return moneyHubId(lang);
    case 'house':
      return HOUSE_HUB_ID;
    case 'health':
      return HEALTH_HUB_ID;
    case 'qr':
      return QR_ID;
    case 'guides':
      return GUIDES_HUB_ID;
    case 'support':
      return 'support';
  }
}

/**
 * The pages of each section besides its own page: they mark the section with aria-current="true". A guide marks Guides,
 * never the category of the tool it embeds or of the calculator it explains (the specification: "e em Guias, nos guias").
 */
const MEMBERS: Record<MenuSection, readonly RouteId[]> = {
  image: [...IMAGE_TOOL_IDS, ...IMAGE_PRESET_IDS],
  // F18 (decision 5): the PDF presets mark the PDF section, as the image presets mark theirs.
  pdf: [...PDF_TOOL_IDS, ...PDF_PRESET_IDS],
  money: [...CALC_PAGE_IDS, ...BR_CALC_IDS],
  house: HOUSE_CALC_IDS,
  health: HEALTH_CALC_IDS,
  qr: [],
  guides: [...FILE_GUIDE_IDS, ...GUIDE_IDS],
  support: [],
};
/** The own pages that are not sectionPage(section, lang) for some language: the two money hubs. */
const OWN_PAGES: Record<MenuSection, readonly RouteId[]> = {
  image: ['image-tools'],
  pdf: [PDF_HUB_ID],
  money: [MONEY_HUB_ID, BR_HUB_ID],
  house: [HOUSE_HUB_ID],
  health: [HEALTH_HUB_ID],
  qr: [QR_ID],
  guides: [GUIDES_HUB_ID],
  support: ['support'],
};
/** The pages that belong to no section: the home, the institutional and legal pages, and the pages out of the sitemaps. */
export const NO_SECTION: readonly RouteId[] = ['home', 'privacy', 'terms', 'about', 'contact', 'licenses', 'offline', 'open-with', 'not-found'];

export interface PageSection {
  section: MenuSection;
  /** "page" on the section's own page (its hub), "true" on a page inside it. */
  current: 'page' | 'true';
}

/** The section of the Menu a route belongs to, or null (the home and the institutional pages). */
export function sectionOf(id: RouteId): PageSection | null {
  for (const section of MENU_SECTIONS) {
    if (OWN_PAGES[section].includes(id)) return { section, current: 'page' };
    if (MEMBERS[section].includes(id)) return { section, current: 'true' };
  }
  return null;
}

/** How many pages each section lists in a language, always from the registries; null where the section has no count. */
export function sectionCount(section: MenuSection, lang: Lang): number | null {
  const existing = (ids: readonly RouteId[]) => ids.filter((id) => pagePath(id, lang) !== undefined).length;
  switch (section) {
    case 'image':
      return existing(IMAGE_TOOL_IDS);
    case 'pdf':
      return existing(PDF_TOOL_IDS);
    case 'money':
      return existing(HUB_MONEY_IDS[lang]);
    case 'house':
      return existing(HOUSE_CALC_IDS);
    case 'health':
      return existing(HEALTH_CALC_IDS);
    case 'guides':
      return hubGuides(lang).length;
    case 'qr':
    case 'support':
      return null;
  }
}

const SECTION_ICON: Record<MenuSection, IconName> = {
  image: 'image',
  pdf: 'pdf',
  money: 'calculator',
  house: 'home',
  health: 'heart',
  qr: 'qr',
  guides: 'book',
  support: 'coffee',
};
/** The category colour of the circle (components.css .fo-cat--*); Guides and Support Oli keep the brand-soft circle. */
const SECTION_CAT: Partial<Record<MenuSection, 'image' | 'pdf' | 'money' | 'home' | 'util'>> = {
  image: 'image',
  pdf: 'pdf',
  money: 'money',
  house: 'home',
  health: 'home',
  qr: 'util',
};

export interface MenuRow {
  section: MenuSection;
  href: string;
  name: string;
  /** The line under the name: the count, the QR formats or how to support. */
  meta: string;
  icon: IconName;
  cat?: 'image' | 'pdf' | 'money' | 'home' | 'util';
  /** Present only on the section of the page; never "false" (a [aria-current] selector would match it). */
  current?: 'page' | 'true';
}

/** The name of a section in the language, from the texts the site already has; undefined where the language lacks it. */
function sectionName(section: MenuSection, t: CommonTexts): string | undefined {
  switch (section) {
    case 'image':
      return t.imageTools;
    case 'pdf':
      return t.pdfTools;
    case 'money':
      return t.moneyCalculators;
    case 'house':
      return t.homeCalculators;
    case 'health':
      return t.healthCalculators;
    case 'qr':
      return t.qr?.name;
    case 'guides':
      return t.guidesHub;
    case 'support':
      return t.header.support;
  }
}

function sectionMeta(section: MenuSection, lang: Lang, t: CommonTexts): string {
  const n = sectionCount(section, lang);
  const count = (template: string) => fmt(template, { n: groupDigits(n ?? 0, lang) });
  switch (section) {
    case 'image':
    case 'pdf':
      return count(t.header.menuTools);
    case 'money':
    case 'house':
    case 'health':
      return count(t.header.menuCalculators);
    case 'guides':
      return count(t.header.menuGuides);
    case 'qr':
      return t.header.menuQr;
    case 'support':
      return t.header.supportMeta;
  }
}

/** The lists of the sheet in a language: only the sections whose page exists in it, the page's section marked. */
export function menuGroups(lang: Lang, id: RouteId, t: CommonTexts): MenuRow[][] {
  const here = sectionOf(id);
  return MENU_GROUPS.map((group) =>
    group.flatMap((section): MenuRow[] => {
      const href = pagePath(sectionPage(section, lang), lang);
      const name = sectionName(section, t);
      if (!href || !name) return [];
      const cat = SECTION_CAT[section];
      return [{
        section,
        href,
        name,
        meta: sectionMeta(section, lang, t),
        icon: SECTION_ICON[section],
        ...(cat ? { cat } : {}),
        ...(here?.section === section ? { current: here.current } : {}),
      }];
    }),
  ).filter((group) => group.length > 0);
}

export interface LanguageLink {
  code: Lang;
  href: string;
  name: string;
  /** The hreflang and lang of the link: "pt-BR" for Portuguese. */
  tag: string;
  current: boolean;
}

/** The language links (the language menu and the end of the Menu): the equivalent page, or the home of the language. */
export function languageLinks(route: RouteDef, lang: Lang, t: CommonTexts): LanguageLink[] {
  const available = new Set(languagesOf(route));
  return LANGS.map((code) => ({
    code,
    href: available.has(code) && route.indexable ? (route.paths[code] ?? homePath(code)) : homePath(code),
    name: t.header.langNames[code],
    tag: LANG_TAG[code],
    current: code === lang,
  }));
}

/** Every route of the map with its section, for the tests: each route is in one section or in NO_SECTION. */
export function sectionsOfRoutes(): { id: RouteId; section: PageSection | null }[] {
  return ROUTES.map((route) => ({ id: route.id, section: sectionOf(route.id) }));
}
