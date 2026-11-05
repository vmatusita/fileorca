// The image tools and their presets (PLANO "Catálogo por fase", F2; DECISOES § 58 and on): what each
// one accepts, its icon, the next-step chips and the related grid. Pages, the island, the search, the
// hub and the tests read this list, so a tool is declared once.
import type { ImageFormat } from '../../engine/image/types.ts';
import type { IconName } from '../../icons/svg.ts';

export const IMAGE_TOOL_IDS = [
  'compress-image',
  'resize-image',
  'crop-image',
  'rotate-image',
  'heic-to-jpg',
  'webp-to-jpg',
  'png-to-jpg',
  'image-to-pdf',
] as const;
export type ImageToolId = (typeof IMAGE_TOOL_IDS)[number];

/** Presets with `entra` in data/keywords.csv: pages of the parent tool, with their own behaviour. */
export const IMAGE_PRESET_IDS = ['compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail'] as const;
export type ImagePresetId = (typeof IMAGE_PRESET_IDS)[number];

export type ImagePageId = ImageToolId | ImagePresetId;

export interface ImagePageDef {
  id: ImagePageId;
  /** The tool a preset belongs to. */
  parent?: ImageToolId;
  /** Real formats taken; anything else is refused with the Oli line, file by file. */
  accepts: readonly ImageFormat[];
  icon: IconName;
  /** Next-step chips: 2 to 4 tools that exist, chosen by what the person just did. */
  next: readonly ImageToolId[];
  /** Related grid at the end of the page: up to 6 tools that exist. */
  related: readonly ImageToolId[];
  /** BeforeAfter only where the output loses quality (compression and lossy conversions). */
  beforeAfter: 'always' | 'lossy' | 'never';
  /** One PDF with the whole batch instead of one file per image. */
  pdf?: true;
  /**
   * F13a (D-17; DECISOES § F13A-I-06): a refused format that another tool of the site takes, and that tool. The error of
   * one such file says so, and the band under the rectangle shows the chip to it in place of the options.
   */
  elsewhere?: { format: ImageFormat; tool: ImageToolId };
}

const PHOTO: readonly ImageFormat[] = ['jpeg', 'png', 'webp'];

export const IMAGE_PAGES: Record<ImagePageId, ImagePageDef> = {
  'compress-image': {
    id: 'compress-image',
    accepts: PHOTO,
    icon: 'compress',
    next: ['resize-image', 'image-to-pdf'],
    related: ['resize-image', 'crop-image', 'heic-to-jpg', 'webp-to-jpg', 'png-to-jpg', 'image-to-pdf'],
    beforeAfter: 'always',
  },
  'resize-image': {
    id: 'resize-image',
    accepts: PHOTO,
    icon: 'resize',
    next: ['compress-image', 'crop-image', 'image-to-pdf'],
    related: ['compress-image', 'crop-image', 'rotate-image', 'heic-to-jpg', 'png-to-jpg', 'image-to-pdf'],
    beforeAfter: 'never',
  },
  'crop-image': {
    id: 'crop-image',
    accepts: PHOTO,
    icon: 'crop',
    next: ['resize-image', 'compress-image', 'rotate-image'],
    related: ['resize-image', 'rotate-image', 'compress-image', 'image-to-pdf', 'heic-to-jpg', 'png-to-jpg'],
    beforeAfter: 'never',
  },
  'rotate-image': {
    id: 'rotate-image',
    accepts: PHOTO,
    icon: 'rotate',
    next: ['crop-image', 'compress-image', 'image-to-pdf'],
    related: ['crop-image', 'resize-image', 'compress-image', 'image-to-pdf', 'heic-to-jpg', 'png-to-jpg'],
    beforeAfter: 'never',
  },
  'heic-to-jpg': {
    id: 'heic-to-jpg',
    accepts: ['heic'],
    icon: 'convert',
    next: ['compress-image', 'resize-image', 'image-to-pdf'],
    related: ['compress-image', 'resize-image', 'image-to-pdf', 'webp-to-jpg', 'png-to-jpg', 'crop-image'],
    beforeAfter: 'lossy',
    elsewhere: { format: 'png', tool: 'png-to-jpg' },
  },
  'webp-to-jpg': {
    id: 'webp-to-jpg',
    accepts: ['webp'],
    icon: 'convert',
    next: ['compress-image', 'resize-image', 'image-to-pdf'],
    related: ['png-to-jpg', 'heic-to-jpg', 'compress-image', 'resize-image', 'image-to-pdf', 'crop-image'],
    beforeAfter: 'lossy',
  },
  'png-to-jpg': {
    id: 'png-to-jpg',
    accepts: ['png', 'jpeg'],
    icon: 'convert',
    next: ['compress-image', 'resize-image', 'image-to-pdf'],
    related: ['webp-to-jpg', 'heic-to-jpg', 'compress-image', 'resize-image', 'image-to-pdf', 'crop-image'],
    beforeAfter: 'lossy',
  },
  'image-to-pdf': {
    id: 'image-to-pdf',
    accepts: PHOTO,
    icon: 'pdf',
    next: ['compress-image', 'resize-image'],
    related: ['compress-image', 'resize-image', 'rotate-image', 'crop-image', 'heic-to-jpg', 'png-to-jpg'],
    beforeAfter: 'never',
    pdf: true,
  },
  'compress-image-to-100kb': {
    id: 'compress-image-to-100kb',
    parent: 'compress-image',
    accepts: PHOTO,
    icon: 'compress',
    next: ['resize-image', 'crop-image', 'image-to-pdf'],
    related: ['compress-image', 'resize-image', 'crop-image', 'heic-to-jpg', 'png-to-jpg', 'image-to-pdf'],
    beforeAfter: 'always',
  },
  'compress-image-to-1mb': {
    id: 'compress-image-to-1mb',
    parent: 'compress-image',
    accepts: PHOTO,
    icon: 'compress',
    next: ['resize-image', 'image-to-pdf'],
    related: ['compress-image', 'resize-image', 'crop-image', 'heic-to-jpg', 'png-to-jpg', 'image-to-pdf'],
    beforeAfter: 'always',
  },
  'resize-image-youtube-thumbnail': {
    id: 'resize-image-youtube-thumbnail',
    parent: 'resize-image',
    accepts: PHOTO,
    icon: 'resize',
    next: ['crop-image', 'compress-image'],
    related: ['resize-image', 'crop-image', 'compress-image', 'rotate-image', 'heic-to-jpg', 'png-to-jpg'],
    beforeAfter: 'always',
  },
};

/** Presets of a tool, in catalogue order. */
export function presetsOf(tool: ImageToolId): ImagePresetId[] {
  return IMAGE_PRESET_IDS.filter((id) => IMAGE_PAGES[id].parent === tool);
}

/**
 * Where a refused format can go instead. Only HEIC has a converter in this release: an AVIF refused by
 * another tool gets the "Try JPG, PNG or WebP" line with no link (AVIF to JPG is run 2b).
 */
export const CONVERTER_FOR: Partial<Record<ImageFormat, ImageToolId>> = { heic: 'heic-to-jpg' };
