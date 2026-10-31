// The real format of a file, read from its first bytes. The extension and the declared type are
// never used: a PNG named photo.jpg is a PNG.
// HEIF and AVIF both start with an ftyp box and can share the mif1 brand, so the major brand decides
// first, then the compatible brands, and when both families appear the codec of the primary item.
// Self-contained: nothing here imports from outside src/engine/image/.

import { parseHeif, primaryCodec } from './bmff.ts';
import type { Sniffed } from './types.ts';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const AVIF_BRANDS = new Set(['avif', 'avis']);
const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs']);

const ascii = (bytes: Uint8Array, from: number, to: number): string => String.fromCharCode(...bytes.subarray(from, to));

function ftypBrands(bytes: Uint8Array): { major: string; compatible: string[] } | null {
  if (bytes.length < 12 || ascii(bytes, 4, 8) !== 'ftyp') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const size = view.getUint32(0);
  const end = size >= 16 && size <= bytes.length ? size : Math.min(bytes.length, 64);
  const compatible: string[] = [];
  for (let at = 16; at + 4 <= end; at += 4) compatible.push(ascii(bytes, at, at + 4));
  return { major: ascii(bytes, 8, 12), compatible };
}

function sniffIsoBmff(bytes: Uint8Array): Sniffed {
  const brands = ftypBrands(bytes);
  if (!brands) return 'unknown';
  if (AVIF_BRANDS.has(brands.major)) return 'avif';
  if (HEIC_BRANDS.has(brands.major)) return 'heic';
  // mif1, msf1, miaf or anything else: the compatible brands say which codec, and only when both
  // families are listed (or none) the container is read for the codec of the primary item.
  const all = [brands.major, ...brands.compatible];
  const avif = all.some((brand) => AVIF_BRANDS.has(brand));
  const heic = all.some((brand) => HEIC_BRANDS.has(brand));
  if (avif && !heic) return 'avif';
  if (heic && !avif) return 'heic';
  if (!avif && !heic && !all.some((brand) => brand === 'mif1' || brand === 'msf1' || brand === 'miaf')) return 'unknown';
  const heif = parseHeif(bytes);
  return (heif && primaryCodec(heif)) ?? 'unknown';
}

export function sniff(bytes: Uint8Array): Sniffed {
  if (bytes.length === 0) return 'empty';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) return 'png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 4) === 'GIF8') return 'gif';
  return sniffIsoBmff(bytes);
}

/** The MIME type to hand to createImageBitmap so the browser does not trust the file name. */
export function mimeOf(format: Exclude<Sniffed, 'empty' | 'unknown' | 'gif'>): string {
  return { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', avif: 'image/avif' }[format];
}
