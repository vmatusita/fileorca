// The data of a guide card (F11, decision 6; DECISOES § 364 and § 395): what src/components/GuideCard.astro shows of a
// guide, in a language, wherever the card appears (the guides hub, the home, the related grid of a guide and, as the
// --here variant, the page of the tool or calculator the guide embeds). Always read from the registries: the name and the
// description of the guide's blurb (common.fileGuides and common.guides), the group of the guide (its colour), how its
// numbers were made and the tool it embeds.
// The measure of a file guide is "Measured on N test files", where N is the number of distinct files of every sample of the
// guide in data/guides-measured.json (the JSON that pnpm guias:medir writes and --check checks), read here at build. A money
// guide says "Numbers worked out": its numbers come from the calculator inside it, not from files.
// Build side only, importable by Node (no import.meta.glob, no Astro): never import this from an island, which would carry
// the 471 KB of the JSON.
import { pagePath, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import { fmt, groupDigits } from '../../i18n/format.ts';
import type { IconName } from '../../icons/svg.ts';
import { CALC_PAGES, GUIDES, isGuide, type GuideId } from '../calc/registry.ts';
import { IMAGE_PAGES } from '../image/registry.ts';
import { PDF_PAGES, type PdfPageId } from '../pdf/registry.ts';
import { MEASURED } from './measured.ts';
import type { MeasuredFile } from './measured-types.ts';
import { FILE_GUIDES, isFileGuide, type FileGuideId, type FileGuideTool } from './registry.ts';

/** The group of a guide on the hub, which is also the colour of its card: Image, PDF or Money. */
export type GuideGroup = 'image' | 'pdf' | 'money';

/** The tool a guide embeds, as the foot of the card shows it: its name, its icon and the colour of its own category. */
export interface GuideCardTool {
  name: string;
  icon: IconName;
  category: GuideGroup;
}

export interface GuideCardData {
  id: FileGuideId | GuideId;
  /** The path of the guide in the language. */
  href: string;
  name: string;
  description: string;
  /** The group of the guide (the colour of the fold): a file guide's hub, or money. */
  category: GuideGroup;
  /** How the numbers were made, written in the language: "Measured on 10 test files", "Numbers worked out". */
  proof: string;
  /** The tool or calculator inside the guide. */
  tool: GuideCardTool;
}

/**
 * The distinct test files of a file guide: every `sample.files` of its numbers, tables and anything else the measurement
 * wrote under it, at any depth, counted once. Ten for the HEIC guide; thirteen for the location guide (three JPG and ten
 * HEIC).
 */
export function measuredFiles(id: FileGuideId, file: MeasuredFile = MEASURED): string[] {
  const files = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const sample = (node as { sample?: { files?: unknown } }).sample;
    if (sample && Array.isArray(sample.files)) for (const name of sample.files) if (typeof name === 'string') files.add(name);
    for (const value of Object.values(node)) walk(value);
  };
  walk(file.guides[id]);
  return [...files];
}

const isPdfTool = (tool: FileGuideTool): tool is Extract<FileGuideTool, PdfPageId> => Object.hasOwn(PDF_PAGES, tool);

/** The tool of a file guide: its card name in the language, its icon, and PDF when it is a PDF tool (Image to PDF too). */
function fileTool(tool: FileGuideTool, lang: Lang): GuideCardTool {
  const common = TEXTS[lang].common;
  if (isPdfTool(tool)) return { name: common.pdf[tool].name, icon: PDF_PAGES[tool].icon, category: 'pdf' };
  const def = IMAGE_PAGES[tool];
  return { name: common.tools[tool].name, icon: def.icon, category: def.pdf ? 'pdf' : 'image' };
}

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(what);
  return value;
}

/** The card of a guide in a language. It throws for a guide with no page or no blurb in the language: never an empty card. */
export function guideCardData(id: FileGuideId | GuideId, lang: Lang = 'en'): GuideCardData {
  const href = required(pagePath(id, lang), `the guide ${id} has no page in ${lang}`);
  const texts = TEXTS[lang];
  const card = texts.guides.card;
  if (isFileGuide(id)) {
    const def = FILE_GUIDES[id];
    const blurb = required(texts.common.fileGuides?.[id], `no ${lang} card for ${id}`);
    const n = measuredFiles(id).length;
    if (n === 0) throw new Error(`${id}: no measured file in data/guides-measured.json`);
    return {
      id,
      href,
      name: blurb.name,
      description: blurb.description,
      category: def.hub === 'pdf-tools' ? 'pdf' : 'image',
      proof: fmt(card.measured, { n: groupDigits(n, lang) }),
      tool: fileTool(def.tool, lang),
    };
  }
  if (!isGuide(id)) throw new Error(`${String(id)} is not a guide`);
  const calc = GUIDES[id].calc;
  const blurb = required(texts.common.guides?.[id], `no ${lang} card for ${id}`);
  return {
    id,
    href,
    name: blurb.name,
    description: blurb.description,
    category: 'money',
    proof: required(card.workedOut, `no ${lang} text for the measure of a money guide`),
    tool: { name: required(texts.common.calcs[calc]?.name, `no ${lang} card for ${calc}`), icon: CALC_PAGES[calc].icon, category: 'money' },
  };
}
