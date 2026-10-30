// Lossless metadata removal for the "no gain" case: when the new copy would not be smaller, the
// original pixels go back, but without EXIF, GPS, XMP, IPTC or text chunks (DECISOES § 33).
// The JPEG keeps its colour profile (APP2 ICC) and, when the photo is rotated, a minimal Exif
// block with the Orientation tag only, so it still shows the right way up.
// Self-contained: nothing here imports from outside src/engine/image/.

function u16(bytes: Uint8Array, at: number, little: boolean): number {
  const a = bytes[at] ?? 0;
  const b = bytes[at + 1] ?? 0;
  return little ? a | (b << 8) : (a << 8) | b;
}

function u32(bytes: Uint8Array, at: number, little: boolean): number {
  return little ? u16(bytes, at, true) + u16(bytes, at + 2, true) * 0x10000 : u16(bytes, at, false) * 0x10000 + u16(bytes, at + 2, false);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** EXIF Orientation (1 to 8) of a JPEG APP1 block, or 1. */
export function jpegOrientation(app1: Uint8Array): number {
  if (String.fromCharCode(...app1.subarray(0, 6)) !== 'Exif\0\0') return 1;
  const tiff = app1.subarray(6);
  const little = tiff[0] === 0x49;
  const ifd = u32(tiff, 4, little);
  const count = u16(tiff, ifd, little);
  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12;
    if (u16(tiff, entry, little) === 0x0112) return u16(tiff, entry + 8, little) || 1;
  }
  return 1;
}

/** APP1 segment with an Exif block holding only the Orientation tag. */
function orientationSegment(orientation: number): Uint8Array {
  const body = [
    ...[0x45, 0x78, 0x69, 0x66, 0, 0], // "Exif\0\0"
    ...[0x4d, 0x4d, 0x00, 0x2a, 0, 0, 0, 8], // big-endian TIFF header, IFD0 at 8
    0, 1, // one entry
    0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, // Orientation, SHORT, 1 value
    0, 0, 0, 0, // no next IFD
  ];
  const length = body.length + 2;
  return new Uint8Array([0xff, 0xe1, length >> 8, length & 0xff, ...body]);
}

export function stripJpeg(bytes: Uint8Array): Uint8Array {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a JPEG');
  const keep: Uint8Array[] = [bytes.subarray(0, 2)];
  let orientation = 1;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) throw new Error('bad JPEG marker');
    const marker = bytes[i + 1] ?? 0;
    if (marker === 0xda) break; // start of scan: the rest is image data
    const length = u16(bytes, i + 2, false);
    const segment = bytes.subarray(i, i + 2 + length);
    const isApp = marker >= 0xe0 && marker <= 0xef;
    if (marker === 0xe1) orientation = Math.max(orientation, jpegOrientation(segment.subarray(4)));
    // Keep JFIF (APP0), ICC profile (APP2), Adobe (APP14) and every non-APP segment; drop the
    // rest (Exif and XMP in APP1, IPTC in APP13, comments).
    const drop = (isApp && marker !== 0xe0 && marker !== 0xe2 && marker !== 0xee) || marker === 0xfe;
    if (!drop) keep.push(segment);
    i += 2 + length;
  }
  if (orientation > 1 && orientation <= 8) keep.splice(1, 0, orientationSegment(orientation));
  keep.push(bytes.subarray(i));
  return concat(keep);
}

const PNG_DROP = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME']);

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function stripPng(bytes: Uint8Array): Uint8Array {
  if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) throw new Error('not a PNG');
  const keep: Uint8Array[] = [bytes.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= bytes.length) {
    const length = u32(bytes, i, false);
    const type = String.fromCharCode(...bytes.subarray(i + 4, i + 8));
    const chunk = bytes.subarray(i, i + 12 + length);
    if (!PNG_DROP.has(type)) keep.push(chunk);
    i += 12 + length;
    if (type === 'IEND') break;
  }
  return concat(keep);
}

export function stripWebp(bytes: Uint8Array): Uint8Array {
  if (String.fromCharCode(...bytes.subarray(0, 4)) !== 'RIFF' || String.fromCharCode(...bytes.subarray(8, 12)) !== 'WEBP') {
    throw new Error('not a WebP');
  }
  const keep: Uint8Array[] = [];
  let i = 12;
  while (i + 8 <= bytes.length) {
    const type = String.fromCharCode(...bytes.subarray(i, i + 4));
    const size = u32(bytes, i + 4, true);
    const chunk = bytes.slice(i, i + 8 + size + (size % 2));
    if (type === 'VP8X') chunk[8] = (chunk[8] ?? 0) & ~0x0c; // clear the EXIF and XMP flags
    if (type !== 'EXIF' && type !== 'XMP ') keep.push(chunk);
    i += 8 + size + (size % 2);
  }
  const body = concat(keep);
  const header = new Uint8Array(12);
  header.set(bytes.subarray(0, 12));
  const riffSize = body.length + 4;
  header.set([riffSize & 0xff, (riffSize >> 8) & 0xff, (riffSize >> 16) & 0xff, (riffSize >>> 24) & 0xff], 4);
  return concat([header, body]);
}

/** The real format from the first bytes; the declared type comes from the file name. */
export function sniffType(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) return 'image/png';
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/** Strips by the real format, whatever the file name says. */
export function stripMetadata(bytes: Uint8Array): { bytes: Uint8Array; type: string } {
  const type = sniffType(bytes);
  if (type === 'image/jpeg') return { bytes: stripJpeg(bytes), type };
  if (type === 'image/png') return { bytes: stripPng(bytes), type };
  if (type === 'image/webp') return { bytes: stripWebp(bytes), type };
  throw new Error('unknown image format');
}
