// What a file is, read from its headers without decoding a pixel: the size on screen (after the
// photo orientation or the HEIF transformations), whether it may be transparent or animated, and
// whether its colours are Display P3. The engine picks the decoding path from this, by pixel count.
// Self-contained: nothing here imports from outside src/engine/image/.

import { hasAlphaAuxiliary, iccIsDisplayP3, isDisplayP3, parseHeif, primaryColour, primaryInfo } from './bmff.ts';
import type { Transform } from './bmff.ts';
import { jpegOrientation } from './strip.ts';
import type { ImageFormat, Probe } from './types.ts';

export interface SourceInfo extends Probe {
  /** Size as stored: the SOF of a JPEG, the IHDR of a PNG, the ispe of a HEIF primary item. */
  storedWidth: number;
  storedHeight: number;
  /** Exif Orientation of a JPEG (1 to 8); 1 for every other format. */
  orientation: number;
  /** The file may carry transparency; false means it is opaque for sure. */
  alpha: boolean;
  /** More than one frame (animated WebP). The first frame is what the engine reads. */
  animated: boolean;
  /** The colours are Display P3 (HEIC and AVIF profile, JPEG ICC profile). */
  displayP3: boolean;
  /** HEIF container transformations of the primary image, in order (empty for other formats). */
  transforms: Transform[];
}

const u16 = (bytes: Uint8Array, at: number): number => ((bytes[at] ?? 0) << 8) | (bytes[at + 1] ?? 0);
const u32 = (bytes: Uint8Array, at: number): number => u16(bytes, at) * 0x10000 + u16(bytes, at + 2);
const u24le = (bytes: Uint8Array, at: number): number => (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8) | ((bytes[at + 2] ?? 0) << 16);
const u32le = (bytes: Uint8Array, at: number): number => u24le(bytes, at) + (bytes[at + 3] ?? 0) * 0x1000000;
const ascii = (bytes: Uint8Array, from: number, to: number): string => String.fromCharCode(...bytes.subarray(from, to));

function info(format: ImageFormat, stored: [number, number], rest: Partial<SourceInfo> = {}): SourceInfo {
  return {
    format,
    width: stored[0],
    height: stored[1],
    storedWidth: stored[0],
    storedHeight: stored[1],
    orientation: 1,
    alpha: false,
    animated: false,
    displayP3: false,
    transforms: [],
    ...rest,
  };
}

function isSof(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/**
 * JPEG: the SOF and the Exif Orientation come from the top-level segments only. The Exif block
 * carries its own thumbnail JPEG with a SOF of its own, which a plain scan for FFC0 would find first.
 */
function probeJpeg(bytes: Uint8Array): SourceInfo | null {
  let at = 2;
  let size: [number, number] | null = null;
  let orientation = 1;
  let sawExif = false;
  const iccParts: (Uint8Array | undefined)[] = [];
  let iccCount = 0;
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) return null;
    const marker = bytes[at + 1] ?? 0;
    if (marker === 0xff) {
      at += 1;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    const length = u16(bytes, at + 2);
    if (length < 2) return null;
    const body = bytes.subarray(at + 4, at + 2 + length);
    if (isSof(marker) && !size) {
      size = [u16(body, 3), u16(body, 1)];
    } else if (marker === 0xe1 && !sawExif && ascii(body, 0, 6) === 'Exif\0\0') {
      sawExif = true;
      const value = jpegOrientation(body);
      orientation = value >= 1 && value <= 8 ? value : 1;
    } else if (marker === 0xe2 && ascii(body, 0, 12) === 'ICC_PROFILE\0') {
      iccParts[(body[12] ?? 1) - 1] = body.subarray(14);
      iccCount = Math.max(iccCount, body[13] ?? 1);
    }
    at += 2 + length;
  }
  if (!size || size[0] === 0 || size[1] === 0) return null;
  const icc = iccCount > 0 && iccParts.length === iccCount && iccParts.every(Boolean) ? concat(iccParts as Uint8Array[]) : null;
  const swapped = orientation >= 5;
  return info('jpeg', size, {
    width: swapped ? size[1] : size[0],
    height: swapped ? size[0] : size[1],
    orientation,
    displayP3: icc ? iccIsDisplayP3(icc) : false,
  });
}

function probePng(bytes: Uint8Array): SourceInfo | null {
  if (bytes.length < 33 || ascii(bytes, 12, 16) !== 'IHDR') return null;
  const size: [number, number] = [u32(bytes, 16), u32(bytes, 20)];
  if (size[0] === 0 || size[1] === 0) return null;
  const colourType = bytes[25] ?? 0;
  let alpha = colourType === 4 || colourType === 6;
  let at = 8;
  while (at + 8 <= bytes.length) {
    const length = u32(bytes, at);
    const type = ascii(bytes, at + 4, at + 8);
    if (type === 'tRNS') alpha = true;
    if (type === 'IDAT' || type === 'IEND') break;
    at += 12 + length;
  }
  return info('png', size, { alpha });
}

function probeWebp(bytes: Uint8Array): SourceInfo | null {
  const chunk = ascii(bytes, 12, 16);
  if (chunk === 'VP8 ') {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    return info('webp', [(bytes[26] ?? 0) | (((bytes[27] ?? 0) & 0x3f) << 8), (bytes[28] ?? 0) | (((bytes[29] ?? 0) & 0x3f) << 8)]);
  }
  if (chunk === 'VP8L') {
    if (bytes[20] !== 0x2f) return null;
    const bits = u32le(bytes, 21);
    return info('webp', [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1], { alpha: ((bits >>> 28) & 1) === 1 });
  }
  if (chunk === 'VP8X') {
    const flags = bytes[20] ?? 0;
    return info('webp', [u24le(bytes, 24) + 1, u24le(bytes, 27) + 1], { alpha: (flags & 0x10) !== 0, animated: (flags & 0x02) !== 0 });
  }
  return null;
}

function probeHeif(bytes: Uint8Array, format: 'heic' | 'avif'): SourceInfo | null {
  const heif = parseHeif(bytes);
  const primary = heif && primaryInfo(heif);
  if (!heif || !primary || primary.width === 0 || primary.height === 0) return null;
  return info(format, [primary.storedWidth, primary.storedHeight], {
    width: primary.width,
    height: primary.height,
    alpha: hasAlphaAuxiliary(heif),
    displayP3: isDisplayP3(primaryColour(heif)),
    transforms: primary.transforms,
  });
}

/** Facts about a file of a known format, or null when the headers do not give a size. */
export function probe(bytes: Uint8Array, format: ImageFormat): SourceInfo | null {
  switch (format) {
    case 'jpeg':
      return probeJpeg(bytes);
    case 'png':
      return probePng(bytes);
    case 'webp':
      return probeWebp(bytes);
    case 'heic':
    case 'avif':
      return probeHeif(bytes, format);
  }
}
