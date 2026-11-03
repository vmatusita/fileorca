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

const def = (id: FileGuideId, tool: FileGuideTool, hub: FileGuideHub, related: readonly FileGuideRelated[]): FileGuideDef => ({
  id,
  path: path(id),
  paths: { en: path(id), pt: `/pt/guias/${SLUGS[id].pt}/`, es: `/es/guias/${SLUGS[id].es}/` },
  tool,
  hub,
  related,
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
  'guides-remove-location-from-photos': def('guides-remove-location-from-photos', 'resize-image', 'image-tools', [
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
