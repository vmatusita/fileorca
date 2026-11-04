// Build-time side of a PDF tool page (server only: never import this from an island). It turns the registry, the texts
// and the route map into the data the page and the island need: the panel props written into data-props, the crumbs,
// the next-step chips and the related grid, in the language of the page. Links go only to pages that exist in that
// language (DECISOES § 6): the PDF pages and the image pages they point at exist in the three languages since the F6.
import { pathFor, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import { ICONS } from '../../icons/icons.ts';
import { KOFI_URL } from '../../platform/site.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import { IMAGE_PAGES } from '../image/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, type ImageNeighbour, type PdfToolId } from './registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from './texts.ts';
import type { PdfChip, PdfPanelData } from './types.ts';
import tokens from '../../../docs/design/tokens.json';

const MAX_CHIPS = 4;
const MAX_RELATED = 6;

type Target = PdfToolId | ImageNeighbour;
const isPdf = (id: Target): id is PdfToolId => id in PDF_PAGES;

/** Name, one line and synonyms of a PDF tool or of the image page it points at, in the language. */
export function blurbOf(id: Target, lang: Lang = 'en'): { name: string; description: string } {
  const common = TEXTS[lang].common;
  return isPdf(id) ? common.pdf[id] : common.tools[id];
}

const iconOf = (id: Target) => (isPdf(id) ? PDF_PAGES[id].icon : IMAGE_PAGES[id].icon);
const categoryOf = (id: Target): 'pdf' | 'image' => (isPdf(id) || id === 'image-to-pdf' ? 'pdf' : 'image');

export function chipsFor(id: PdfToolId, lang: Lang = 'en'): PdfChip[] {
  return PDF_PAGES[id].next
    .slice(0, MAX_CHIPS)
    .map((target) => ({ href: pathFor(target, lang), name: blurbOf(target, lang).name, target, icon: ICONS[iconOf(target)], category: categoryOf(target) }));
}

export interface PdfRelatedCard {
  href: string;
  name: string;
  description: string;
  icon: ReturnType<typeof iconOf>;
  category: 'image' | 'pdf';
}

export function relatedFor(id: PdfToolId, lang: Lang = 'en'): PdfRelatedCard[] {
  return PDF_PAGES[id].related.slice(0, MAX_RELATED).map((target) => {
    const blurb = blurbOf(target, lang);
    return { href: pathFor(target, lang), name: blurb.name, description: blurb.description, icon: iconOf(target), category: categoryOf(target) };
  });
}

/** Home › PDF tools › tool. */
export function crumbsFor(id: PdfToolId, lang: Lang = 'en'): Crumb[] {
  const common = TEXTS[lang].common;
  return [
    { name: common.breadcrumb.home, path: homePath(lang) },
    { name: common.pdfTools, path: pathFor(PDF_HUB_ID, lang) },
    { name: PDF_TOOL_TEXTS[lang][id].h1, path: pathFor(id, lang) },
  ];
}

/** The light value of the "ink" token: the signature lands on a white page whatever the theme on screen. */
function lightInk(): string {
  const entry = (tokens as { color: { tokens: { name: string; value: { light: string } }[] } }).color.tokens.find((token) => token.name === 'ink');
  if (!entry) throw new Error('docs/design/tokens.json has no ink token');
  return entry.value.light;
}

/** Where the coffee line of the result card leads: the Pix on the Portuguese support page, Ko-fi elsewhere. */
export function coffeeHrefFor(lang: Lang): string {
  return lang === 'pt' ? `${pathFor('support', 'pt')}#pix` : KOFI_URL;
}

export function panelData(id: PdfToolId, lang: Lang = 'en'): PdfPanelData {
  const def = PDF_PAGES[id];
  const texts = PDF_TOOL_TEXTS[lang][id];
  return {
    lang,
    page: id,
    t: PDF_PANEL_TEXTS[lang],
    texts: texts.panel,
    files: def.files,
    run: def.run,
    suffix: texts.panel.suffix,
    chips: chipsFor(id, lang),
    links: {
      unlock: { href: pathFor('unlock-pdf', lang), name: blurbOf('unlock-pdf', lang).name },
      imageToPdf: { href: pathFor('image-to-pdf', lang), name: blurbOf('image-to-pdf', lang).name },
    },
    icons: { pdf: ICONS.pdf, rotate: ICONS.rotate, trash: ICONS.trash, chevron: ICONS['chevron-right'], plus: ICONS.upload, reorder: ICONS.reorder },
    ink: lightInk(),
    coffeeHref: coffeeHrefFor(lang),
  };
}

