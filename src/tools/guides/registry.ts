// The ten file guides (prompt F5b, decisions 1 and 2): /guides/<slug>/, each embedding a tool that is already live. Since
// the languages adjustment they exist in Portuguese and Spanish too (/pt/guias/<slug>/, /es/guias/<slug>/), each the same
// guide translated, with a pair in hreflang. The pages, the hubs, the search, the gates and the tests read this registry,
// the way the money guides read GUIDES (src/tools/calc/registry.ts). Plain data: never import it from an island.
import type { Lang } from '../../i18n/routes.ts';
import type { ImagePresetId, ImageToolId } from '../image/registry.ts';
import type { PdfToolId } from '../pdf/registry.ts';

export const FILE_GUIDE_IDS = [
  'guides-heic-to-jpg-on-windows',
  'guides-why-is-my-pdf-so-large',
  'guides-social-media-image-sizes',
  'guides-open-webp-save-as-jpg',
  'guides-jpg-vs-png',
  'guides-remove-location-from-photos',
  'guides-pdf-to-jpg-resolution',
  'guides-split-pdf-file-size',
  'guides-combine-pdfs-on-phone',
  'guides-photos-to-one-pdf',
] as const;
export type FileGuideId = (typeof FILE_GUIDE_IDS)[number];

/**
 * The route id of the guides hub (F11, decision 5): /guides/, /pt/guias/ and /es/guias/, the page that lists every guide
 * of a language, the file guides of this registry and the money guides of src/tools/calc/registry.ts. "guides" alone, with
 * no hyphen, so it never reads as a guide id (they all start with "guides-").
 */
export const GUIDES_HUB_ID = 'guides';

/**
 * The day the ten English guides were reviewed, and when they were first published (prompt F5b). In UTC, like the date
 * pnpm guias:medir stamps, and never before it (DECISOES § 207): the last measurement and the merge fall on this day.
 * Plain data here since the F13b (DECISOES § 558), so src/tools/guides/measured.ts can give the history line of a guide
 * its dates in Node too (the lint:texto); src/tools/guides/page.ts gives them to the pages as before.
 * F18 (DECISOES § 733): the guides were measured again on 2026-11-11, when guide 6 took Remove EXIF data, so the review
 * moves to that day (a measurement is one day for the whole file: every number carries the date of measuredOn). The first
 * publication stays the day of the first version: a later measurement never moves it, and the history line of each guide
 * says when the numbers were measured again.
 */
export const GUIDE_REVIEWED = '2026-11-11';
export const GUIDE_PUBLISHED = '2026-11-02';

/**
 * Per language: the day the guides were reviewed and first published. The Portuguese and Spanish guides were written in
 * the languages adjustment, on the day in Brasília of the run (DECISOES § 223), never before the measurement (§ 207); since
 * the F18 measurement, reviewed on the same day as the English ones, and still first published on 2026-11-03 (§ 733).
 */
export const GUIDE_REVIEWED_ON: Record<Lang, string> = { en: GUIDE_REVIEWED, pt: '2026-11-11', es: '2026-11-11' };
export const GUIDE_PUBLISHED_ON: Record<Lang, string> = { en: GUIDE_PUBLISHED, pt: '2026-11-03', es: '2026-11-03' };

export type FileGuideHub = 'image-tools' | 'pdf-tools';
export type FileGuideTool = ImageToolId | PdfToolId;
export type FileGuideRelated = ImageToolId | ImagePresetId | PdfToolId | FileGuideId;

export interface FileGuideDef {
  id: FileGuideId;
  /** The English URL path, with the trailing slash. */
  path: string;
  /** The URL path in each language (the slugs of pt and es by the glossaries of docs/i18n/). */
  paths: Record<Lang, string>;
  /** The tool the guide embeds: the same island and entry as the tool's own page. */
  tool: FileGuideTool;
  /** The hub of the breadcrumb, which also lists the guide. */
  hub: FileGuideHub;
  /** Up to 6 pages that exist: tools, presets or other guides. */
  related: readonly FileGuideRelated[];
  /**
   * The part of the text (the index of `sections` in the guide's texts) that ends with the sentence linking to the tool's
   * own page (F13b, D-54; DECISOES § 562): the link left the line under the panel for the part that talks about the tool.
   */
  toolSection: number;
}

const path = (id: FileGuideId): string => `/guides/${id.replace(/^guides-/, '')}/`;

/** The slug of each guide in Portuguese and Spanish, without accents (prompt of the languages adjustment, decision 2). */
const SLUGS: Record<FileGuideId, { pt: string; es: string }> = {
  'guides-heic-to-jpg-on-windows': { pt: 'heic-para-jpg-no-windows', es: 'heic-a-jpg-en-windows' },
  'guides-why-is-my-pdf-so-large': { pt: 'por-que-meu-pdf-esta-tao-grande', es: 'por-que-mi-pdf-pesa-tanto' },
  'guides-social-media-image-sizes': { pt: 'tamanhos-de-imagem-para-redes-sociais', es: 'tamanos-de-imagen-para-redes-sociales' },
  'guides-open-webp-save-as-jpg': { pt: 'abrir-webp-e-salvar-como-jpg', es: 'abrir-webp-y-guardar-como-jpg' },
  'guides-jpg-vs-png': { pt: 'jpg-ou-png', es: 'jpg-o-png' },
  'guides-remove-location-from-photos': { pt: 'remover-localizacao-das-fotos', es: 'quitar-la-ubicacion-de-las-fotos' },
  'guides-pdf-to-jpg-resolution': { pt: 'resolucao-de-pdf-para-jpg', es: 'resolucion-de-pdf-a-jpg' },
  'guides-split-pdf-file-size': { pt: 'dividir-pdf-e-tamanho-do-arquivo', es: 'dividir-pdf-y-tamano-del-archivo' },
  'guides-combine-pdfs-on-phone': { pt: 'juntar-pdfs-no-celular', es: 'unir-pdf-en-el-celular' },
  'guides-photos-to-one-pdf': { pt: 'fotos-em-um-pdf', es: 'fotos-en-un-solo-pdf' },
};

/**
 * The part of each guide that ends with the link to the tool's page (F13b, D-54; DECISOES § 562): the part that talks
 * about the tool the guide embeds (its modes, what it did to our files, how to use it), the same in the three languages.
 */
const TOOL_SECTION: Record<FileGuideId, number> = {
  'guides-heic-to-jpg-on-windows': 3, // Convert the files you already have
  'guides-why-is-my-pdf-so-large': 3, // What each mode of Compress PDF did
  'guides-social-media-image-sizes': 1, // Fit inside, or fill the frame
  'guides-open-webp-save-as-jpg': 2, // What we did to test it
  'guides-jpg-vs-png': 3, // Back to JPG: close, but not the same
  'guides-remove-location-from-photos': 3, // Strip it from the file without changing the photo
  'guides-pdf-to-jpg-resolution': 5, // A quick way to choose
  'guides-split-pdf-file-size': 4, // How to split without the extra weight
  'guides-combine-pdfs-on-phone': 2, // On any phone, in the browser
  'guides-photos-to-one-pdf': 2, // What the tool does with each photo
};

const def = (id: FileGuideId, tool: FileGuideTool, hub: FileGuideHub, related: readonly FileGuideRelated[]): FileGuideDef => ({
  id,
  path: path(id),
  paths: { en: path(id), pt: `/pt/guias/${SLUGS[id].pt}/`, es: `/es/guias/${SLUGS[id].es}/` },
  tool,
  hub,
  related,
  toolSection: TOOL_SECTION[id],
});

export const FILE_GUIDES: Record<FileGuideId, FileGuideDef> = {
  'guides-heic-to-jpg-on-windows': def('guides-heic-to-jpg-on-windows', 'heic-to-jpg', 'image-tools', [
    'compress-image',
    'resize-image',
    'image-to-pdf',
    'guides-remove-location-from-photos',
    'guides-jpg-vs-png',
  ]),
  'guides-why-is-my-pdf-so-large': def('guides-why-is-my-pdf-so-large', 'compress-pdf', 'pdf-tools', [
    'split-pdf',
    'pdf-to-jpg',
    'compress-image',
    'guides-split-pdf-file-size',
    'guides-photos-to-one-pdf',
  ]),
  'guides-social-media-image-sizes': def('guides-social-media-image-sizes', 'resize-image', 'image-tools', [
    'resize-image-youtube-thumbnail',
    'crop-image',
    'compress-image',
    'compress-image-to-1mb',
    'guides-jpg-vs-png',
  ]),
  'guides-open-webp-save-as-jpg': def('guides-open-webp-save-as-jpg', 'webp-to-jpg', 'image-tools', [
    'png-to-jpg',
    'heic-to-jpg',
    'compress-image',
    'guides-jpg-vs-png',
    'guides-heic-to-jpg-on-windows',
  ]),
  'guides-jpg-vs-png': def('guides-jpg-vs-png', 'png-to-jpg', 'image-tools', [
    'compress-image',
    'webp-to-jpg',
    'resize-image',
    'guides-open-webp-save-as-jpg',
    'guides-social-media-image-sizes',
  ]),
  'guides-remove-location-from-photos': def('guides-remove-location-from-photos', 'remove-exif-data', 'image-tools', [
    'heic-to-jpg',
    'compress-image',
    'crop-image',
    'guides-heic-to-jpg-on-windows',
    'guides-photos-to-one-pdf',
  ]),
  'guides-pdf-to-jpg-resolution': def('guides-pdf-to-jpg-resolution', 'pdf-to-jpg', 'pdf-tools', [
    'image-to-pdf',
    'compress-pdf',
    'compress-image',
    'guides-why-is-my-pdf-so-large',
    'guides-jpg-vs-png',
  ]),
  'guides-split-pdf-file-size': def('guides-split-pdf-file-size', 'split-pdf', 'pdf-tools', [
    'merge-pdf',
    'compress-pdf',
    'delete-pdf-pages',
    'guides-why-is-my-pdf-so-large',
    'guides-combine-pdfs-on-phone',
  ]),
  'guides-combine-pdfs-on-phone': def('guides-combine-pdfs-on-phone', 'merge-pdf', 'pdf-tools', [
    'split-pdf',
    'compress-pdf',
    'reorder-pdf-pages',
    'image-to-pdf',
    'guides-split-pdf-file-size',
  ]),
  'guides-photos-to-one-pdf': def('guides-photos-to-one-pdf', 'image-to-pdf', 'image-tools', [
    'compress-image',
    'merge-pdf',
    'compress-pdf',
    'guides-why-is-my-pdf-so-large',
    'guides-combine-pdfs-on-phone',
  ]),
};

export function isFileGuide(id: string): id is FileGuideId {
  return Object.hasOwn(FILE_GUIDES, id);
}

/** The guides that embed a tool, in registry order: the line under the tool's page links to them. */
export function guidesOfTool(tool: FileGuideTool): FileGuideId[] {
  return FILE_GUIDE_IDS.filter((id) => FILE_GUIDES[id].tool === tool);
}

/** The guides a hub lists. */
export function guidesOfHub(hub: FileGuideHub): FileGuideId[] {
  return FILE_GUIDE_IDS.filter((id) => FILE_GUIDES[id].hub === hub);
}
