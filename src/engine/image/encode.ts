// Encoding: from a Work to the bytes of a file. The browser's own encoder first where it is good
// enough (conversions, turned and cropped copies), the jSquash codecs where they win or where the
// browser cannot (DECISOES § 7):
//   JPEG  MozJPEG for Compress, the target size and the cover; native toBlob for the rest, MozJPEG
//         when the browser hands back another type.
//   PNG   native toBlob for conversions; OxiPNG on the file's own bytes for Compress (no decode).
//   WebP  native toBlob when the browser writes it (Safari does not: it returns PNG), else the
//         jSquash encoder; Compress always uses the jSquash encoder.
//   AVIF  always the jSquash encoder (single thread, fixed speed).
// Every encoder here writes from pixels, so no Exif, XMP, IPTC or GPS reaches the output.
// Self-contained: nothing here imports from outside src/engine/image/.

import type { Level } from './types.ts';
import type { Work } from './work.ts';

/** Qualities of the tools. MozJPEG, libwebp and libaom scales are each their own. */
export const QUALITY = {
  mozjpeg: { recommended: 75, strong: 55 },
  webp: { recommended: 75, strong: 55 },
  avif: { recommended: 50, strong: 35 },
  /** Browser JPEG and WebP for converted, turned and cropped copies, and for the PDF pages. */
  native: 92,
  /** The preview of a source the browser cannot show. */
  preview: 85,
} as const;

/** Above this many pixels OxiPNG runs at level 1 (a 12 MP photo costs 4 s at 1 and 9 s at 2 on a fast desktop). */
const PNG_LEVEL_1_ABOVE = 4_000_000;

export function blobOf(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as BlobPart], { type });
}

export async function encodeJpegMoz(work: Work, quality: number): Promise<Blob> {
  const { encodeJpeg } = await import('./codecs/jpeg.ts');
  return blobOf(await encodeJpeg(work.raster(), quality), 'image/jpeg');
}

/** Quality is 1 to 100. */
export async function encodeJpegNative(work: Work, quality: number = QUALITY.native): Promise<Blob> {
  const blob = await work.nativeBlob('image/jpeg', quality / 100);
  if (blob && blob.type === 'image/jpeg') return blob;
  return encodeJpegMoz(work, quality);
}

export async function encodePngNative(work: Work): Promise<Blob> {
  const blob = await work.nativeBlob('image/png');
  if (blob && blob.type === 'image/png') return blob;
  const { encodePng } = await import('./codecs/png.ts');
  return blobOf(await encodePng(work.raster(), work.width * work.height > PNG_LEVEL_1_ABOVE ? 1 : 2), 'image/png');
}

/** Quality is 1 to 100. `native` lets the browser write it when it can. */
export async function encodeWebpWork(work: Work, quality: number, native: boolean): Promise<Blob> {
  if (native) {
    const blob = await work.nativeBlob('image/webp', quality / 100);
    if (blob && blob.type === 'image/webp') return blob;
  }
  const { encodeWebp } = await import('./codecs/webp.ts');
  return blobOf(await encodeWebp(work.raster(), quality), 'image/webp');
}

export async function encodeAvifWork(work: Work, level: Level): Promise<Blob> {
  const { encodeAvif } = await import('./codecs/avif.ts');
  return blobOf(await encodeAvif(work.raster(), QUALITY.avif[level]), 'image/avif');
}

/** Lossless recompression of PNG bytes that strip.ts already cleaned (OxiPNG keeps every chunk it is given). */
export async function optimiseCleanPng(clean: Uint8Array, pixels: number): Promise<Uint8Array> {
  const { optimisePng } = await import('./codecs/png.ts');
  return optimisePng(clean, pixels > PNG_LEVEL_1_ABOVE ? 1 : 2);
}
