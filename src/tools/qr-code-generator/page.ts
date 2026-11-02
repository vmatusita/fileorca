// Build-time side of the QR code generator page (server only: never import this from the island).
import { pathFor } from '../../i18n/routes.ts';
import enCommon from '../../i18n/en/common.ts';
import type { IconName } from '../../icons/svg.ts';
import { IMAGE_PAGES, type ImageToolId } from '../image/registry.ts';

/** The related grid: what a person does next with a QR image (fit it, convert it, put it on a sheet, make it lighter). */
export const QR_RELATED: readonly ImageToolId[] = ['resize-image', 'png-to-jpg', 'image-to-pdf', 'compress-image'];

export interface QrRelatedCard {
  href: string;
  name: string;
  description: string;
  icon: IconName;
  category: 'image' | 'pdf';
}

/** The related cards, in English (the only language of the page). */
export function qrRelated(): QrRelatedCard[] {
  return QR_RELATED.map((id) => ({
    href: pathFor(id, 'en'),
    name: enCommon.tools[id].name,
    description: enCommon.tools[id].description,
    icon: IMAGE_PAGES[id].icon,
    category: IMAGE_PAGES[id].pdf ? 'pdf' : 'image',
  }));
}
