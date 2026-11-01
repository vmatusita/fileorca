// Build-time side of a PDF tool page (server only: never import this from an island). It turns the registry, the texts
// and the route map into the data the page and the island need: the panel props written into data-props, the crumbs,
// the next-step chips and the related grid. Links go only to pages that exist (DECISOES § 6): the PDF pages exist in
// English only, and so do the image pages they point at.
import { pathFor, routeById } from '../../i18n/routes.ts';
import enCommon from '../../i18n/en/common.ts';
import { ICONS } from '../../icons/icons.ts';
import { buildAdsConfig } from '../../ads/config.ts';
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

/** Name, one line and synonyms of a PDF tool or of the image page it points at. */
export function blurbOf(id: Target): { name: string; description: string } {
  return isPdf(id) ? enCommon.pdf[id] : enCommon.tools[id];
}

const iconOf = (id: Target) => (isPdf(id) ? PDF_PAGES[id].icon : IMAGE_PAGES[id].icon);
const categoryOf = (id: Target): 'pdf' | 'image' => (isPdf(id) || id === 'image-to-pdf' ? 'pdf' : 'image');

export function chipsFor(id: PdfToolId): PdfChip[] {
  return PDF_PAGES[id].next.slice(0, MAX_CHIPS).map((target) => ({ href: pathFor(target, 'en'), name: blurbOf(target).name, target, icon: ICONS[iconOf(target)], category: categoryOf(target) }));
}

export interface PdfRelatedCard {
  href: string;
  name: string;
  description: string;
  icon: ReturnType<typeof iconOf>;
  category: 'image' | 'pdf';
}

export function relatedFor(id: PdfToolId): PdfRelatedCard[] {
  return PDF_PAGES[id].related.slice(0, MAX_RELATED).map((target) => ({ href: pathFor(target, 'en'), name: blurbOf(target).name, description: blurbOf(target).description, icon: iconOf(target), category: categoryOf(target) }));
}

/** Home › PDF tools › tool. */
export function crumbsFor(id: PdfToolId): Crumb[] {
  return [
    { name: enCommon.breadcrumb.home, path: homePath('en') },
    { name: enCommon.pdfTools, path: pathFor(PDF_HUB_ID, 'en') },
    { name: PDF_TOOL_TEXTS[id].h1, path: pathFor(id, 'en') },
  ];
}

/** The light value of the "ink" token: the signature lands on a white page whatever the theme on screen. */
function lightInk(): string {
  const entry = (tokens as { color: { tokens: { name: string; value: { light: string } }[] } }).color.tokens.find((token) => token.name === 'ink');
  if (!entry) throw new Error('docs/design/tokens.json has no ink token');
  return entry.value.light;
}

export function panelData(id: PdfToolId): PdfPanelData {
  const def = PDF_PAGES[id];
  const texts = PDF_TOOL_TEXTS[id];
  const unlock = routeById('unlock-pdf');
  return {
    lang: 'en',
    page: id,
    t: PDF_PANEL_TEXTS,
    texts: texts.panel,
    files: def.files,
    run: def.run,
    suffix: def.suffix,
    chips: chipsFor(id),
    links: {
      unlock: { href: unlock.paths.en ?? '/unlock-pdf/', name: enCommon.pdf['unlock-pdf'].name },
      imageToPdf: { href: pathFor('image-to-pdf', 'en'), name: enCommon.tools['image-to-pdf'].name },
    },
    icons: { pdf: ICONS.pdf, rotate: ICONS.rotate, trash: ICONS.trash, chevron: ICONS['chevron-right'], plus: ICONS.upload },
    ink: lightInk(),
    coffeeHref: KOFI_URL,
    adsOn: buildAdsConfig().scriptEnabled,
  };
}
