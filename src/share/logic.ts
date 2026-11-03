// What the "Open with" page decides without a browser (F8, decision 1; DECISOES § 290): the format of a shared file
// from its first bytes (the sniffers of the engines, the same rule the tools use), how many files each tool takes,
// the order the chosen tool gets them in, and the size as each language writes it.
// Nothing of the island chunk is imported here (astro.config.ts), so the page loads at most 2 JS files.
import { sniff } from '../engine/image/sniff.ts';
import { sniffPdf } from '../engine/pdf/sniff.ts';

export type OpenWithLang = 'en' | 'pt' | 'es';

/** The format read from the first bytes of a file: 'pdf', an image format, or 'unknown'. */
export function formatOfBytes(bytes: Uint8Array): string {
  if (sniffPdf(bytes) === 'pdf') return 'pdf';
  const image = sniff(bytes);
  return image === 'empty' ? 'unknown' : image;
}

/** How the page writes a format next to the file name. */
export const FORMAT_LABEL: Record<string, string> = { pdf: 'PDF', jpeg: 'JPG', png: 'PNG', webp: 'WebP', heic: 'HEIC', avif: 'AVIF', gif: 'GIF' };

/** How many of the shared files a tool takes: the ones in its formats, and one at most for a one-file tool. */
export function takes(accepts: readonly string[], single: boolean, formats: readonly string[]): number {
  const count = formats.filter((format) => accepts.includes(format)).length;
  return single ? Math.min(count, 1) : count;
}

/** The order the chosen tool gets the files in: the ones it takes first, so a one-file tool gets one it can open. */
export function deliveryOrder(accepts: readonly string[], formats: readonly string[]): number[] {
  const indexes = formats.map((_, index) => index);
  return [...indexes.filter((index) => accepts.includes(formats[index] ?? '')), ...indexes.filter((index) => !accepts.includes(formats[index] ?? ''))];
}

/** Size in bytes like fileSize() of src/i18n/format.ts (tests/unit/open-with.test.ts compares them): 2.4 MB, 2,4 MB. */
export function sizeLabel(bytes: number, lang: OpenWithLang): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const tenths = unit === 0 || value >= 100 ? null : Math.round(value * 10);
  const whole = String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'pt' ? '.' : ',');
  const body = tenths === null ? whole : `${Math.floor(tenths / 10)}${lang === 'pt' ? ',' : '.'}${tenths % 10}`;
  return `${body} ${units[unit]}`;
}
