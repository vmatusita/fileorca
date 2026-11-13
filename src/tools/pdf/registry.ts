// The PDF tools (F5a; PLANO "Catálogo por fase"; the PDF rows of data/keywords.csv, all `entra`): the order of the
// hub, what each one takes, its icon, how it runs, the next-step chips and the related grid. The pages, the island,
// the hub, the search, the gates and the tests read this list, so a tool is declared once (DECISOES § 148).
// F18 (decision 5; DECISOES § 725): and the PDF presets, pages of a parent tool with their own behaviour, in the
// design of the image presets (src/tools/image/registry.ts): the path is /<parent>/<name>/ and the id <parent>-<name>.
// Plain data: no route, text or component is imported here.
import type { IconName } from '../../icons/svg.ts';

/** Hub order: by the volume band of data/keywords.csv, then the order of the file inside the band. */
export const PDF_TOOL_IDS = [
  'merge-pdf',
  'split-pdf',
  'pdf-to-jpg',
  'compress-pdf',
  'rotate-pdf',
  'delete-pdf-pages',
  'add-page-numbers-to-pdf',
  'sign-pdf',
  'protect-pdf',
  'unlock-pdf',
  // F18 (decision 4; DECISOES § 724): right before Reorder, whose search it shares ("organize pdf").
  'organize-pdf',
  'reorder-pdf-pages',
  'watermark-pdf',
] as const;
export type PdfToolId = (typeof PDF_TOOL_IDS)[number];

/** F18 (decision 5): the PDF presets with `entra` in data/keywords.csv, in catalogue order. */
export const PDF_PRESET_IDS = ['split-pdf-extract-pages', 'pdf-to-jpg-to-png'] as const;
export type PdfPresetId = (typeof PDF_PRESET_IDS)[number];

/** A PDF page: a tool or a preset. */
export type PdfPageId = PdfToolId | PdfPresetId;

export const PDF_HUB_ID = 'pdf-tools';

/** Pages of the image area a PDF chip or card may lead to. */
export type ImageNeighbour = 'image-to-pdf' | 'compress-image';

export interface PdfPageDef {
  id: PdfPageId;
  /** F18 (decision 5): the tool a preset belongs to. */
  parent?: PdfToolId;
  path: string;
  icon: IconName;
  /** batch: every file on its own (a ZIP for two or more); merge: all files into one; single: one file at a time. */
  files: 'batch' | 'merge' | 'single';
  /** auto: runs when the file arrives and again when an option changes (the image tools' way); action: waits for the button. */
  run: 'auto' | 'action';
  /** Next-step chips: 2 to 4 pages that exist. */
  next: readonly (PdfPageId | ImageNeighbour)[];
  /** Related grid: up to 6 pages that exist. */
  related: readonly (PdfPageId | ImageNeighbour)[];
  /** Suffix of the output name: "<original>-<suffix>.pdf". */
  suffix: string;
}

const def = (id: PdfToolId, icon: IconName, files: PdfPageDef['files'], run: PdfPageDef['run'], suffix: string, next: PdfPageDef['next'], related: PdfPageDef['related']): PdfPageDef => ({
  id,
  path: `/${id}/`,
  icon,
  files,
  run,
  next,
  related,
  suffix,
});

/**
 * F18 (decision 5): a preset at /<parent>/<name>/, with the parent's icon (decision 12) and its own chips, related grid
 * and suffix. `files` and `run` are the parent's unless the preset's decision says otherwise.
 */
const preset = (id: PdfPresetId, parent: PdfToolId, name: string, suffix: string, next: PdfPageDef['next'], related: PdfPageDef['related']): PdfPageDef => {
  const base = PDF_TOOL_DEFS[parent];
  return { id, parent, path: `/${parent}/${name}/`, icon: base.icon, files: base.files, run: base.run, next, related, suffix };
};

// F18 (decision 11; DECISOES § 734): each sister of a new page gives it the place, in its related grid, of the last card
// the chips above already show (the chip still leads there); Merge PDF leads to Organize PDF and Unlock PDF to Extract
// pages with a fourth chip, which takes the PDF along and waits for the action (§ 654).
const PDF_TOOL_DEFS: Record<PdfToolId, PdfPageDef> = {
  'merge-pdf': def('merge-pdf', 'merge', 'merge', 'action', 'merged', ['add-page-numbers-to-pdf', 'compress-pdf', 'image-to-pdf', 'organize-pdf'], ['split-pdf', 'compress-pdf', 'reorder-pdf-pages', 'delete-pdf-pages', 'add-page-numbers-to-pdf', 'organize-pdf']),
  'split-pdf': def('split-pdf', 'split', 'single', 'action', 'split', ['compress-pdf', 'merge-pdf'], ['merge-pdf', 'delete-pdf-pages', 'reorder-pdf-pages', 'pdf-to-jpg', 'split-pdf-extract-pages', 'rotate-pdf']),
  'pdf-to-jpg': def('pdf-to-jpg', 'image', 'batch', 'auto', 'page', ['compress-image', 'image-to-pdf'], ['image-to-pdf', 'compress-pdf', 'split-pdf', 'merge-pdf', 'pdf-to-jpg-to-png', 'rotate-pdf']),
  'compress-pdf': def('compress-pdf', 'compress', 'batch', 'auto', 'compressed', ['protect-pdf', 'merge-pdf'], ['merge-pdf', 'split-pdf', 'pdf-to-jpg', 'protect-pdf', 'compress-image', 'image-to-pdf']),
  'rotate-pdf': def('rotate-pdf', 'rotate', 'batch', 'auto', 'rotated', ['compress-pdf', 'merge-pdf'], ['reorder-pdf-pages', 'delete-pdf-pages', 'merge-pdf', 'split-pdf', 'add-page-numbers-to-pdf', 'organize-pdf']),
  'delete-pdf-pages': def('delete-pdf-pages', 'trash', 'single', 'action', 'edited', ['reorder-pdf-pages', 'compress-pdf'], ['split-pdf', 'organize-pdf', 'merge-pdf', 'rotate-pdf', 'add-page-numbers-to-pdf', 'split-pdf-extract-pages']),
  'add-page-numbers-to-pdf': def('add-page-numbers-to-pdf', 'page-number', 'batch', 'auto', 'numbered', ['compress-pdf', 'protect-pdf'], ['merge-pdf', 'watermark-pdf', 'reorder-pdf-pages', 'delete-pdf-pages', 'sign-pdf', 'compress-pdf']),
  'sign-pdf': def('sign-pdf', 'sign', 'single', 'action', 'signed', ['protect-pdf', 'compress-pdf'], ['watermark-pdf', 'protect-pdf', 'add-page-numbers-to-pdf', 'merge-pdf', 'compress-pdf', 'image-to-pdf']),
  'protect-pdf': def('protect-pdf', 'lock', 'batch', 'action', 'protected', ['compress-pdf', 'merge-pdf'], ['unlock-pdf', 'sign-pdf', 'watermark-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf']),
  'unlock-pdf': def('unlock-pdf', 'unlock', 'single', 'auto', 'unlocked', ['compress-pdf', 'merge-pdf', 'split-pdf', 'split-pdf-extract-pages'], ['protect-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf', 'pdf-to-jpg', 'rotate-pdf']),
  // F18 (decision 6): one file, the action button, "-organized". Its icon was drawn for it (decision 12; DECISOES § 735);
  // the chips are the ones of Reorder pages, and the grid the three tools that each do one of its jobs (Reorder, Delete
  // and Rotate) and Merge, Split and Extract pages (decision 11; § 734).
  'organize-pdf': def('organize-pdf', 'page-grid', 'single', 'action', 'organized', ['add-page-numbers-to-pdf', 'compress-pdf'], ['reorder-pdf-pages', 'delete-pdf-pages', 'rotate-pdf', 'merge-pdf', 'split-pdf', 'split-pdf-extract-pages']),
  'reorder-pdf-pages': def('reorder-pdf-pages', 'reorder', 'single', 'action', 'reordered', ['add-page-numbers-to-pdf', 'compress-pdf'], ['delete-pdf-pages', 'rotate-pdf', 'merge-pdf', 'split-pdf', 'add-page-numbers-to-pdf', 'organize-pdf']),
  'watermark-pdf': def('watermark-pdf', 'watermark', 'batch', 'action', 'watermarked', ['protect-pdf', 'compress-pdf'], ['sign-pdf', 'add-page-numbers-to-pdf', 'protect-pdf', 'compress-pdf', 'merge-pdf', 'rotate-pdf']),
};

/** Every PDF page, the tools in hub order and then the presets (the order of PDF_EVENT_TOOLS and of the search). */
export const PDF_PAGES: Record<PdfPageId, PdfPageDef> = {
  ...PDF_TOOL_DEFS,
  // F18 (decisions 5 and 7): Split PDF in the Pick mode only, one PDF named "-extracted". The chips of the parent, and
  // the grid with the parent first, as the image presets (decision 11; DECISOES § 734).
  'split-pdf-extract-pages': preset('split-pdf-extract-pages', 'split-pdf', 'extract-pages', 'extracted', ['compress-pdf', 'merge-pdf'], ['split-pdf', 'delete-pdf-pages', 'organize-pdf', 'merge-pdf', 'pdf-to-jpg', 'compress-pdf']),
  // F18 (decisions 5 and 8): PDF to JPG with PNG fixed; the output is the parent's, one PNG per page. The chips of the
  // parent (the two image pages that take a PNG), and the grid with the parent first (decision 11; DECISOES § 734).
  'pdf-to-jpg-to-png': preset('pdf-to-jpg-to-png', 'pdf-to-jpg', 'to-png', 'page', ['compress-image', 'image-to-pdf'], ['pdf-to-jpg', 'image-to-pdf', 'compress-image', 'split-pdf', 'compress-pdf', 'merge-pdf']),
};

/** F18 (decision 5): the presets of a PDF tool, in catalogue order (presetsOf of the image registry). */
export function presetsOf(tool: PdfToolId): PdfPresetId[] {
  return PDF_PRESET_IDS.filter((id) => PDF_PAGES[id].parent === tool);
}

/**
 * F18 (decision 5; DECISOES § 725): the tool a page is, for what the tool does: the parent of a preset, the page itself
 * for a tool. The island compares this (`base` in PdfPanelData) where it means "this tool" (the restricted PDF that PDF to
 * JPG takes, the name of its ZIP), and the page id where it means "this page" (events, the inbox, the suffix).
 */
export function toolOf(id: PdfPageId): PdfToolId {
  return PDF_PAGES[id].parent ?? (id as PdfToolId);
}
