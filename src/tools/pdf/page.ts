// Build-time side of a PDF tool page (server only: never import this from an island). It turns the registry, the texts
// and the route map into the data the page and the island need: the panel props written into data-props, the crumbs,
// the next-step chips and the related grid, in the language of the page. Links go only to pages that exist in that
// language (DECISOES § 6): the PDF pages and the image pages they point at exist in the three languages since the F6.
import { pathFor, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import { ICONS } from '../../icons/icons.ts';
import { KOFI_URL } from '../../platform/site.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import { IMAGE_PAGES, type ImagePageId } from '../image/registry.ts';
import { IMAGE_PANEL_TEXTS } from '../image/texts.ts';
import type { ChipCarry } from '../image/types.ts';
import type { ImagePanelTexts, PdfPanelTexts } from '../../i18n/types.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS, type ImageNeighbour, type PdfToolId } from './registry.ts';
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

/**
 * F13a · UX-14 (DECISOES § 497): what each PDF tool makes, for the chips that take it along. PDF to JPG makes images;
 * Protect PDF makes a PDF that needs a password, which no tool it points at opens (it would be refused there), so its chips
 * only link; the others make PDFs.
 */
const MAKES: Partial<Record<PdfToolId, 'images' | 'locked'>> = { 'pdf-to-jpg': 'images', 'protect-pdf': 'locked' };
type CarryPdf = keyof PdfPanelTexts['carry']['chips'];
type CarryImage = keyof ImagePanelTexts['carry']['chips'];

/**
 * F13a · UX-14 (DECISOES § 497): the chip from `source` to `target` takes the result along when the target takes what the
 * source makes; the target's formats and the label go to the island, which decides with the formats of the result itself
 * (takes() of src/share). F15 (DECISOES § 654, which replaces the "only link" of the tools with an action in § 497): the
 * target may run by itself (the result at once) or wait for its action (Merge, Split, Reorder pages, Protect: the files
 * arrive and wait, § 655); a target with no label in the language only links. Protect PDF still takes nothing along: its
 * PDF needs a password, which every tool it points at would refuse.
 */
export function carryOf(source: PdfToolId, target: Target, lang: Lang = 'en'): ChipCarry | undefined {
  const makes = MAKES[source];
  if (makes === 'locked') return undefined;
  if (isPdf(target)) {
    if (makes === 'images' || !(target in PDF_PANEL_TEXTS[lang].carry.chips)) return undefined;
    return { accepts: ['pdf'], single: PDF_PAGES[target].files === 'single', ...PDF_PANEL_TEXTS[lang].carry.chips[target as CarryPdf] };
  }
  if (makes !== 'images' || !(target in IMAGE_PANEL_TEXTS[lang].carry.chips)) return undefined;
  return { accepts: [...IMAGE_PAGES[target].accepts], single: false, ...IMAGE_PANEL_TEXTS[lang].carry.chips[target as CarryImage] };
}

/**
 * F15 (DECISOES § 653 and § 654): the chip from an image page to a PDF tool takes the PDF along when the page makes one
 * (Image to PDF, `pdf: true`; an image is no PDF) and the tool has its label in the texts of the image island ("Compress
 * this PDF"). The rule of carryOf, with the labels of the other island. It lives here, not in image/page.ts, because
 * pdfOriginsOf needs it too, and image/page.ts already imports this file: the other way round would be an import cycle.
 */
export function carryOfImage(source: ImagePageId, target: PdfToolId, lang: Lang = 'en'): ChipCarry | undefined {
  const labels = IMAGE_PANEL_TEXTS[lang].carry.chips;
  if (!IMAGE_PAGES[source].pdf || !(target in labels)) return undefined;
  return { accepts: ['pdf'], single: PDF_PAGES[target].files === 'single', ...labels[target as CarryImage] };
}

export function chipsFor(id: PdfToolId, lang: Lang = 'en'): PdfChip[] {
  return PDF_PAGES[id].next.slice(0, MAX_CHIPS).map((target) => {
    const carry = carryOf(id, target, lang);
    return { href: pathFor(target, lang), name: blurbOf(target, lang).name, target, icon: ICONS[iconOf(target)], category: categoryOf(target), ...(carry ? { carry } : {}) };
  });
}

/**
 * F13a · UX-14 (DECISOES § 498): the PDF tools whose chip takes their result to `target`, with their name. F15 (DECISOES
 * § 653): and, for a PDF tool, the image pages whose chip takes their PDF to it (Image to PDF, to Compress PDF, Merge PDF and
 * Add page numbers), by the same next-step list and the same rule as the chips of the image pages (carryOfImage).
 */
export function pdfOriginsOf(target: string, lang: Lang = 'en'): Record<string, string> {
  const origins: Record<string, string> = {};
  for (const source of PDF_TOOL_IDS) if (chipsFor(source, lang).some((chip) => chip.target === target && chip.carry)) origins[source] = blurbOf(source, lang).name;
  if (target in PDF_PAGES) {
    for (const source of Object.keys(IMAGE_PAGES) as ImagePageId[]) {
      const leads = (IMAGE_PAGES[source].next as readonly string[]).slice(0, MAX_CHIPS).includes(target);
      if (leads && carryOfImage(source, target as PdfToolId, lang)) origins[source] = TEXTS[lang].common.tools[source].name;
    }
  }
  return origins;
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
    icons: { pdf: ICONS.pdf, rotate: ICONS.rotate, trash: ICONS.trash, chevron: ICONS['chevron-right'], plus: ICONS.upload, down: ICONS['chevron-down'], info: ICONS.info, shield: ICONS.shield, zoom: ICONS.zoom },
    ink: lightInk(),
    coffeeHref: coffeeHrefFor(lang),
    origins: pdfOriginsOf(id, lang),
    // F13a · UX-14: PDF to JPG takes images along, in the words of the image tools; the others take PDFs.
    carryLine: (() => {
      const words = MAKES[id] === 'images' ? IMAGE_PANEL_TEXTS[lang].carry : PDF_PANEL_TEXTS[lang].carry;
      return { one: words.line, many: words.lineMany };
    })(),
  };
}

