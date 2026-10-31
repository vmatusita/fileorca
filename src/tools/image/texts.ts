// The texts of the image tools and presets, by page id. English is required for every page; Portuguese
// and Spanish exist only where the page does (Compress image today, DECISOES § 58): there is no
// translated text for a page that exists only in English. tests/unit/image-texts.test.ts checks this map
// against the route map, so a page and its texts cannot drift apart.
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
import enCompress1mb from '../compress-image/presets/to-1mb/i18n/en.ts';
import enResize from '../resize-image/i18n/en.ts';
import enYoutube from '../resize-image/presets/youtube-thumbnail/i18n/en.ts';
import enCrop from '../crop-image/i18n/en.ts';
import enRotate from '../rotate-image/i18n/en.ts';
import enHeic from '../heic-to-jpg/i18n/en.ts';
import enWebp from '../webp-to-jpg/i18n/en.ts';
import enPng from '../png-to-jpg/i18n/en.ts';
import enAvif from '../avif-to-jpg/i18n/en.ts';
import enConvert from '../convert-to-webp/i18n/en.ts';
import enPdf from '../image-to-pdf/i18n/en.ts';

/** Page blocks and panel bits of any tool: the option texts are each tool's own shape. */
export type AnyToolTexts = ImageToolTexts<object>;

type Translations = { en: AnyToolTexts } & Partial<Record<Exclude<Lang, 'en'>, AnyToolTexts>>;

export const IMAGE_TOOL_TEXTS: Record<ImagePageId, Translations> = {
  'compress-image': { en: enCompress, pt: ptCompress, es: esCompress },
  'compress-image-to-100kb': { en: enCompress100 },
  'compress-image-to-1mb': { en: enCompress1mb },
  'resize-image': { en: enResize },
  'resize-image-youtube-thumbnail': { en: enYoutube },
  'crop-image': { en: enCrop },
  'rotate-image': { en: enRotate },
  'heic-to-jpg': { en: enHeic },
  'webp-to-jpg': { en: enWebp },
  'png-to-jpg': { en: enPng },
  'avif-to-jpg': { en: enAvif },
  'convert-to-webp': { en: enConvert },
  'image-to-pdf': { en: enPdf },
};

/** The texts of a page in a language; throws when the page has none there (it must not exist there). */
export function imageToolTexts(id: ImagePageId, lang: Lang): AnyToolTexts {
  const texts = IMAGE_TOOL_TEXTS[id][lang];
  if (!texts) throw new Error(`image page ${id} has no ${lang} texts`);
  return texts;
}

/** Texts shared by every image tool panel, per language. */
export const IMAGE_PANEL_TEXTS: Record<Lang, ImagePanelTexts> = { en: enPanel, pt: ptPanel, es: esPanel };
