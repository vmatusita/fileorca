// Build-time side of an image tool page (server only: never import this from an island). It turns the
// registry, the texts and the route map into the plain data the page and the island need: the panel
// props that go into data-props, the crumbs, the next-step chips, the related grid and the preset
// table. A link is only made to a page that exists in the language of the page (DECISOES § 6); every image page
// exists in the three languages since the F6, and the filters stay for a page that may not.
import { languagesOf, pathFor, routeById, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import type { ImageToolPanelTexts, ToolBlurb } from '../../i18n/types.ts';
import enCommon from '../../i18n/en/common.ts';
import { ICONS } from '../../icons/icons.ts';
import { KOFI_URL } from '../../platform/site.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import { CONVERTER_FOR, IMAGE_PAGES, presetsOf, type ImagePageId, type ImageToolId } from './registry.ts';
import { IMAGE_PANEL_TEXTS, imageToolTexts } from './texts.ts';
import type { ChipData, ConverterLink, ImagePanelData } from './types.ts';

/** Most chips under a result (the design: 2 to 4). */
const MAX_CHIPS = 4;
/** Most cards in the related grid. */
const MAX_RELATED = 6;

/** Name, one line and synonyms of a page in a language (English when that language has none: the converter links). */
export function blurbOf(id: ImagePageId, lang: Lang): ToolBlurb | undefined {
  return lang === 'en' ? enCommon.tools[id] : TEXTS[lang].common.tools[id];
}

/** Whether the page exists in this language. */
export function existsIn(id: ImagePageId, lang: Lang): boolean {
  return languagesOf(routeById(id)).includes(lang);
}

const categoryOf = (id: ImageToolId): 'image' | 'pdf' => (IMAGE_PAGES[id].pdf ? 'pdf' : 'image');

/** The next-step chips under a result; the home chip stands in when no other tool exists in the language. */
export function chipsFor(id: ImagePageId, lang: Lang): ChipData[] {
  const chips = IMAGE_PAGES[id].next
    .filter((tool) => existsIn(tool, lang))
    .slice(0, MAX_CHIPS)
    .flatMap((tool): ChipData[] => {
      const blurb = blurbOf(tool, lang);
      return blurb ? [{ href: pathFor(tool, lang), name: blurb.name, target: tool, icon: ICONS[IMAGE_PAGES[tool].icon], category: categoryOf(tool) }] : [];
    });
  if (chips.length > 0) return chips;
  return [{ href: homePath(lang), name: IMAGE_PANEL_TEXTS[lang].next.moreTools, target: 'home', icon: ICONS.home, category: 'none' }];
}

/** The page a refused HEIC or AVIF is sent to, in the language of the page (English where a language had no converter). */
function converterLink(tool: ImageToolId, lang: Lang): ConverterLink {
  const route = routeById(tool);
  const path = route.paths[lang] ?? route.paths.en ?? '/';
  return { href: path, name: (blurbOf(tool, lang) ?? blurbOf(tool, 'en'))?.name ?? tool };
}

/**
 * The links of the refused formats that have a converter (CONVERTER_FOR). A format with no entry, such as
 * AVIF in this release, has no link: the row says what the tool takes instead and points nowhere.
 */
function convertersFor(lang: Lang): ImagePanelData['converters'] {
  const links: ImagePanelData['converters'] = {};
  for (const format of ['heic', 'avif'] as const) {
    const tool = CONVERTER_FOR[format];
    if (tool) links[format] = converterLink(tool, lang);
  }
  return links;
}

/** The plain data of the island for a page, in a language. */
export function panelData<O = object>(id: ImagePageId, lang: Lang, initial?: Record<string, unknown>): ImagePanelData<O> {
  const def = IMAGE_PAGES[id];
  const texts = imageToolTexts(id, lang);
  return {
    lang,
    page: id,
    t: IMAGE_PANEL_TEXTS[lang],
    texts: texts.panel as ImageToolPanelTexts<O>,
    accepts: [...def.accepts],
    beforeAfter: def.beforeAfter,
    pdf: def.pdf === true,
    chips: chipsFor(id, lang),
    converters: convertersFor(lang),
    // In Portuguese the coffee line leads to the Pix of the support page (PLANO "Doações"; F6, decision 8).
    coffeeHref: lang === 'pt' ? `${pathFor('support', lang)}#pix` : KOFI_URL,
    ...(initial ? { initial } : {}),
  };
}

/** Home › Image tools › tool (› preset), in the language of the page. */
export function crumbsFor(id: ImagePageId, lang: Lang): Crumb[] {
  const def = IMAGE_PAGES[id];
  const common = TEXTS[lang].common;
  const crumbs: Crumb[] = [{ name: common.breadcrumb.home, path: homePath(lang) }];
  const hub = routeById('image-tools').paths[lang];
  if (hub && common.imageTools) crumbs.push({ name: common.imageTools, path: hub });
  if (def.parent) {
    crumbs.push({ name: blurbOf(def.parent, lang)?.name ?? imageToolTexts(def.parent, lang).h1, path: pathFor(def.parent, lang) });
  }
  crumbs.push({ name: imageToolTexts(id, lang).h1, path: pathFor(id, lang) });
  return crumbs;
}

export interface RelatedCard {
  href: string;
  name: string;
  description: string;
  icon: (typeof IMAGE_PAGES)[ImagePageId]['icon'];
  category: 'image' | 'pdf';
}

/** The related grid: tools that exist in this language, at most six. */
export function relatedFor(id: ImagePageId, lang: Lang): RelatedCard[] {
  return IMAGE_PAGES[id].related
    .filter((tool) => existsIn(tool, lang))
    .slice(0, MAX_RELATED)
    .flatMap((tool): RelatedCard[] => {
      const blurb = blurbOf(tool, lang);
      return blurb ? [{ href: pathFor(tool, lang), name: blurb.name, description: blurb.description, icon: IMAGE_PAGES[tool].icon, category: categoryOf(tool) }] : [];
    });
}

export interface PresetRow {
  href: string;
  name: string;
  description: string;
}

/** The presets of a parent tool that exist in this language, for the table on the parent page. */
export function presetRows(id: ImagePageId, lang: Lang): PresetRow[] {
  if (IMAGE_PAGES[id].parent) return [];
  return presetsOf(id as ImageToolId)
    .filter((preset) => existsIn(preset, lang))
    .flatMap((preset): PresetRow[] => {
      const blurb = blurbOf(preset, lang);
      return blurb ? [{ href: pathFor(preset, lang), name: blurb.name, description: blurb.description }] : [];
    });
}
