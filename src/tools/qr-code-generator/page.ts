// Build-time side of the QR code generator page (server only: never import this from the island).
import { pathFor, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import type { IconName } from '../../icons/svg.ts';
import { IMAGE_PAGES, type ImageToolId } from '../image/registry.ts';
import en from './i18n/en.ts';
import pt from './i18n/pt.ts';
import es from './i18n/es.ts';
import type { QrPageTexts } from './types.ts';

/** The texts of the page in each language (the languages adjustment added pt and es). */
export const QR_TEXTS: Record<Lang, QrPageTexts> = { en, pt, es };

/** The related grid: what a person does next with a QR image (fit it, convert it, put it on a sheet, make it lighter). */
export const QR_RELATED: readonly ImageToolId[] = ['resize-image', 'png-to-jpg', 'image-to-pdf', 'compress-image'];

export interface QrRelatedCard {
  href: string;
  name: string;
  description: string;
  icon: IconName;
  category: 'image' | 'pdf';
}

/** The related cards, in the language of the page: the four tools exist in every language. */
export function qrRelated(lang: Lang = 'en'): QrRelatedCard[] {
  const common = TEXTS[lang].common;
  return QR_RELATED.map((id) => ({
    href: pathFor(id, lang),
    name: common.tools[id].name,
    description: common.tools[id].description,
    icon: IMAGE_PAGES[id].icon,
    category: IMAGE_PAGES[id].pdf ? 'pdf' : 'image',
  }));
}
