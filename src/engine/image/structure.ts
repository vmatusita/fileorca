// Is the file whole and well formed? Decided from the bytes before any decoder runs, so a cut or
// damaged file gives the same answer in every browser. The decoders do not agree:
// browsers may show the part of a truncated JPEG that arrived, and jSquash and libheif report
// nothing for it.
//   'truncated': the file stops before its end (no EOI, no IEND, a RIFF or iloc range past the end).
//   'decode': the structure is damaged (bad marker, segment past the end, no frame header).
// Self-contained: nothing here imports from outside src/engine/image/.

import { parseHeif, primaryInfo } from './bmff.ts';
import type { ImageFormat } from './types.ts';

export type Structure = 'ok' | 'truncated' | 'decode';

const u16 = (bytes: Uint8Array, at: number): number => ((bytes[at] ?? 0) << 8) | (bytes[at + 1] ?? 0);
const u32 = (bytes: Uint8Array, at: number): number => u16(bytes, at) * 0x10000 + u16(bytes, at + 2);
const u32le = (bytes: Uint8Array, at: number): number => (bytes[at] ?? 0) + (bytes[at + 1] ?? 0) * 0x100 + (bytes[at + 2] ?? 0) * 0x10000 + (bytes[at + 3] ?? 0) * 0x1000000;
const ascii = (bytes: Uint8Array, from: number, to: number): string => String.fromCharCode(...bytes.subarray(from, to));

function isSofMarker(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

/**
 * JPEG: walks the marker segments and the entropy-coded data up to EOI. Bytes after EOI are fine
 * (Pixel motion photos and MPF files append more data). Progressive files have several scans.
 */
function checkJpeg(bytes: Uint8Array): Structure {
  let at = 2;
  let sawFrame = false;
  let sawScan = false;
  for (;;) {
    // The next marker: 0xFF, optional 0xFF fill bytes, then a code that is not 0x00.
    if (at >= bytes.length) return 'truncated';
    if (bytes[at] !== 0xff) return 'decode';
    while (bytes[at + 1] === 0xff) at += 1;
    if (at + 1 >= bytes.length) return 'truncated';
    const marker = bytes[at + 1] ?? 0;
    if (marker === 0x00) return 'decode';
    if (marker === 0xd9) return sawScan ? 'ok' : 'decode';
    if (marker === 0xd8) return 'decode';
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    if (at + 4 > bytes.length) return 'truncated';
    const length = u16(bytes, at + 2);
    if (length < 2 || at + 2 + length > bytes.length) return 'decode';
    if (isSofMarker(marker)) {
      if (length < 8 || u16(bytes, at + 5) === 0 || u16(bytes, at + 7) === 0) return 'decode';
      sawFrame = true;
    }
    at += 2 + length;
    if (marker === 0xda) {
      if (!sawFrame) return 'decode';
      sawScan = true;
      // Entropy-coded data: skip stuffed zeros (FF00) and restart markers (FFD0 to FFD7).
      for (;;) {
        const ff = bytes.indexOf(0xff, at);
        if (ff === -1 || ff + 1 >= bytes.length) return 'truncated';
        const next = bytes[ff + 1] ?? 0;
        if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
          at = ff + 2;
        } else if (next === 0xff) {
          at = ff + 1;
        } else {
          at = ff;
          break;
        }
      }
    }
  }
}

/** PNG: chunks up to IEND, with an IHDR first and at least one IDAT. */
function checkPng(bytes: Uint8Array): Structure {
  let at = 8;
  let first = true;
  let sawData = false;
  while (at + 8 <= bytes.length) {
    const length = u32(bytes, at);
    const type = ascii(bytes, at + 4, at + 8);
    if (first && (type !== 'IHDR' || length !== 13)) return 'decode';
    first = false;
    if (length > 0x7fffffff) return 'decode';
    if (at + 12 + length > bytes.length) return 'truncated';
    if (type === 'IDAT') sawData = true;
    if (type === 'IEND') return sawData ? 'ok' : 'decode';
    at += 12 + length;
  }
  return 'truncated';
}

/** WebP: the RIFF size must fit in the file, and the first chunk must be an image chunk. */
function checkWebp(bytes: Uint8Array): Structure {
  if (bytes.length < 20) return 'truncated';
  const riffEnd = u32le(bytes, 4) + 8;
  if (riffEnd > bytes.length) return 'truncated';
  const first = ascii(bytes, 12, 16);
  if (first !== 'VP8 ' && first !== 'VP8L' && first !== 'VP8X') return 'decode';
  let at = 12;
  while (at + 8 <= riffEnd) {
    const size = u32le(bytes, at + 4);
    at += 8 + size + (size % 2);
    if (at > riffEnd + 1) return 'decode'; // a chunk runs past the RIFF container
  }
  return 'ok';
}

/** HEIF and AVIF: a primary item with a size, and every byte the iloc box points at in the file. */
function checkHeif(bytes: Uint8Array): Structure {
  const heif = parseHeif(bytes);
  if (!heif) return 'decode';
  if (heif.cut) return 'truncated';
  if (!heif.hasMeta || heif.primaryId === null || !primaryInfo(heif)) return 'decode';
  if (heif.extentsEnd > bytes.length) return 'truncated';
  return 'ok';
}

export function checkStructure(bytes: Uint8Array, format: ImageFormat): Structure {
  switch (format) {
    case 'jpeg':
      return checkJpeg(bytes);
    case 'png':
      return checkPng(bytes);
    case 'webp':
      return checkWebp(bytes);
    case 'heic':
    case 'avif':
      return checkHeif(bytes);
  }
}
