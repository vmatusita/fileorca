// The PDF tools (F5a; PLANO "Catálogo por fase"; the 12 PDF rows of data/keywords.csv, all `entra`): the order of the
// hub, what each one takes, its icon, how it runs, the next-step chips and the related grid. The pages, the island,
// the hub, the search, the gates and the tests read this list, so a tool is declared once (DECISOES § 148).
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
  'reorder-pdf-pages',
  'watermark-pdf',
] as const;
export type PdfToolId = (typeof PDF_TOOL_IDS)[number];

export const PDF_HUB_ID = 'pdf-tools';

/** Pages of the image area a PDF chip or card may lead to. */
export type ImageNeighbour = 'image-to-pdf' | 'compress-image';

export interface PdfPageDef {
  id: PdfToolId;
  path: string;
  icon: IconName;
  /** batch: every file on its own (a ZIP for two or more); merge: all files into one; single: one file at a time. */
  files: 'batch' | 'merge' | 'single';
  /** auto: runs when the file arrives and again when an option changes (the image tools' way); action: waits for the button. */
  run: 'auto' | 'action';
  /** Next-step chips: 2 to 4 pages that exist. */
  next: readonly (PdfToolId | ImageNeighbour)[];
  /** Related grid: up to 6 pages that exist. */
  related: readonly (PdfToolId | ImageNeighbour)[];
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

export const PDF_PAGES: Record<PdfToolId, PdfPageDef> = {
  'merge-pdf': def('merge-pdf', 'merge', 'merge', 'action', 'merged', ['add-page-numbers-to-pdf', 'compress-pdf', 'image-to-pdf'], ['split-pdf', 'compress-pdf', 'reorder-pdf-pages', 'delete-pdf-pages', 'add-page-numbers-to-pdf', 'image-to-pdf']),
  'split-pdf': def('split-pdf', 'split', 'single', 'action', 'split', ['compress-pdf', 'merge-pdf'], ['merge-pdf', 'delete-pdf-pages', 'reorder-pdf-pages', 'pdf-to-jpg', 'compress-pdf', 'rotate-pdf']),
  'pdf-to-jpg': def('pdf-to-jpg', 'image', 'batch', 'auto', 'page', ['compress-image', 'image-to-pdf'], ['image-to-pdf', 'compress-pdf', 'split-pdf', 'merge-pdf', 'compress-image', 'rotate-pdf']),
  'compress-pdf': def('compress-pdf', 'compress', 'batch', 'auto', 'compressed', ['protect-pdf', 'merge-pdf'], ['merge-pdf', 'split-pdf', 'pdf-to-jpg', 'protect-pdf', 'compress-image', 'image-to-pdf']),
  'rotate-pdf': def('rotate-pdf', 'rotate', 'batch', 'auto', 'rotated', ['compress-pdf', 'merge-pdf'], ['reorder-pdf-pages', 'delete-pdf-pages', 'merge-pdf', 'split-pdf', 'add-page-numbers-to-pdf', 'compress-pdf']),
  'delete-pdf-pages': def('delete-pdf-pages', 'trash', 'single', 'action', 'edited', ['reorder-pdf-pages', 'compress-pdf'], ['split-pdf', 'reorder-pdf-pages', 'merge-pdf', 'rotate-pdf', 'add-page-numbers-to-pdf', 'compress-pdf']),
  'add-page-numbers-to-pdf': def('add-page-numbers-to-pdf', 'page-number', 'batch', 'auto', 'numbered', ['compress-pdf', 'protect-pdf'], ['merge-pdf', 'watermark-pdf', 'reorder-pdf-pages', 'delete-pdf-pages', 'sign-pdf', 'compress-pdf']),
  'sign-pdf': def('sign-pdf', 'sign', 'single', 'action', 'signed', ['protect-pdf', 'compress-pdf'], ['watermark-pdf', 'protect-pdf', 'add-page-numbers-to-pdf', 'merge-pdf', 'compress-pdf', 'image-to-pdf']),
  'protect-pdf': def('protect-pdf', 'lock', 'batch', 'action', 'protected', ['compress-pdf', 'merge-pdf'], ['unlock-pdf', 'sign-pdf', 'watermark-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf']),
  'unlock-pdf': def('unlock-pdf', 'unlock', 'single', 'auto', 'unlocked', ['compress-pdf', 'merge-pdf', 'split-pdf'], ['protect-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf', 'pdf-to-jpg', 'rotate-pdf']),
  'reorder-pdf-pages': def('reorder-pdf-pages', 'reorder', 'single', 'action', 'reordered', ['add-page-numbers-to-pdf', 'compress-pdf'], ['delete-pdf-pages', 'rotate-pdf', 'merge-pdf', 'split-pdf', 'add-page-numbers-to-pdf', 'compress-pdf']),
  'watermark-pdf': def('watermark-pdf', 'watermark', 'batch', 'action', 'watermarked', ['protect-pdf', 'compress-pdf'], ['sign-pdf', 'add-page-numbers-to-pdf', 'protect-pdf', 'compress-pdf', 'merge-pdf', 'rotate-pdf']),
};
