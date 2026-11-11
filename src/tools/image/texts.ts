// The texts of the image tools and presets, by page id and language: every page exists in the three languages since
// the F6 (decision 4). tests/unit/image-texts.test.ts checks this map against the route map, so a page and its texts
// cannot drift apart.
import type { Lang } from '../../i18n/routes.ts';
import type { ImagePanelTexts, ImageToolTexts } from '../../i18n/types.ts';
import type { ImagePageId } from './registry.ts';
import enPanel from './i18n/en.ts';
import ptPanel from './i18n/pt.ts';
import esPanel from './i18n/es.ts';
import enCompress from '../compress-image/i18n/en.ts';
import ptCompress from '../compress-image/i18n/pt.ts';
import esCompress from '../compress-image/i18n/es.ts';
import enCompress100 from '../compress-image/presets/to-100kb/i18n/en.ts';
import ptCompress100 from '../compress-image/presets/to-100kb/i18n/pt.ts';
import esCompress100 from '../compress-image/presets/to-100kb/i18n/es.ts';
import enCompress1mb from '../compress-image/presets/to-1mb/i18n/en.ts';
import ptCompress1mb from '../compress-image/presets/to-1mb/i18n/pt.ts';
import esCompress1mb from '../compress-image/presets/to-1mb/i18n/es.ts';
import enResize from '../resize-image/i18n/en.ts';
import ptResize from '../resize-image/i18n/pt.ts';
import esResize from '../resize-image/i18n/es.ts';
import enYoutube from '../resize-image/presets/youtube-thumbnail/i18n/en.ts';
import ptYoutube from '../resize-image/presets/youtube-thumbnail/i18n/pt.ts';
import esYoutube from '../resize-image/presets/youtube-thumbnail/i18n/es.ts';
import enCrop from '../crop-image/i18n/en.ts';
import ptCrop from '../crop-image/i18n/pt.ts';
import esCrop from '../crop-image/i18n/es.ts';
import enRotate from '../rotate-image/i18n/en.ts';
import ptRotate from '../rotate-image/i18n/pt.ts';
import esRotate from '../rotate-image/i18n/es.ts';
import enHeic from '../heic-to-jpg/i18n/en.ts';
import ptHeic from '../heic-to-jpg/i18n/pt.ts';
import esHeic from '../heic-to-jpg/i18n/es.ts';
import enWebp from '../webp-to-jpg/i18n/en.ts';
import ptWebp from '../webp-to-jpg/i18n/pt.ts';
import esWebp from '../webp-to-jpg/i18n/es.ts';
import enPng from '../png-to-jpg/i18n/en.ts';
import ptPng from '../png-to-jpg/i18n/pt.ts';
import esPng from '../png-to-jpg/i18n/es.ts';
import enAvif from '../avif-to-jpg/i18n/en.ts';
import ptAvif from '../avif-to-jpg/i18n/pt.ts';
import esAvif from '../avif-to-jpg/i18n/es.ts';
import enConvert from '../convert-to-webp/i18n/en.ts';
import ptConvert from '../convert-to-webp/i18n/pt.ts';
import esConvert from '../convert-to-webp/i18n/es.ts';
import enPdf from '../image-to-pdf/i18n/en.ts';
import ptPdf from '../image-to-pdf/i18n/pt.ts';
import esPdf from '../image-to-pdf/i18n/es.ts';
// F18 (decisions 9 and 10): Remove EXIF data and Flip image, a preset of Rotate image.
import enExif from '../remove-exif-data/i18n/en.ts';
import ptExif from '../remove-exif-data/i18n/pt.ts';
import esExif from '../remove-exif-data/i18n/es.ts';
import enFlip from '../rotate-image/presets/flip/i18n/en.ts';
import ptFlip from '../rotate-image/presets/flip/i18n/pt.ts';
import esFlip from '../rotate-image/presets/flip/i18n/es.ts';

/** Page blocks and panel bits of any tool: the option texts are each tool's own shape. */
export type AnyToolTexts = ImageToolTexts<object>;

export const IMAGE_TOOL_TEXTS: Record<ImagePageId, Record<Lang, AnyToolTexts>> = {
  'compress-image': { en: enCompress, pt: ptCompress, es: esCompress },
  'compress-image-to-100kb': { en: enCompress100, pt: ptCompress100, es: esCompress100 },
  'compress-image-to-1mb': { en: enCompress1mb, pt: ptCompress1mb, es: esCompress1mb },
  'resize-image': { en: enResize, pt: ptResize, es: esResize },
  'resize-image-youtube-thumbnail': { en: enYoutube, pt: ptYoutube, es: esYoutube },
  'crop-image': { en: enCrop, pt: ptCrop, es: esCrop },
  'rotate-image': { en: enRotate, pt: ptRotate, es: esRotate },
  'heic-to-jpg': { en: enHeic, pt: ptHeic, es: esHeic },
  'webp-to-jpg': { en: enWebp, pt: ptWebp, es: esWebp },
  'png-to-jpg': { en: enPng, pt: ptPng, es: esPng },
  'avif-to-jpg': { en: enAvif, pt: ptAvif, es: esAvif },
  'convert-to-webp': { en: enConvert, pt: ptConvert, es: esConvert },
  'image-to-pdf': { en: enPdf, pt: ptPdf, es: esPdf },
  'remove-exif-data': { en: enExif, pt: ptExif, es: esExif },
  'rotate-image-flip': { en: enFlip, pt: ptFlip, es: esFlip },
};

/** The texts of a page in a language. */
export function imageToolTexts(id: ImagePageId, lang: Lang): AnyToolTexts {
  return IMAGE_TOOL_TEXTS[id][lang];
}

/** Texts shared by every image tool panel, per language. */
export const IMAGE_PANEL_TEXTS: Record<Lang, ImagePanelTexts> = { en: enPanel, pt: ptPanel, es: esPanel };
