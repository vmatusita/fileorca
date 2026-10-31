// Byte-level JPEG and Exif assembly for the fixture generator. The pixels come from Chromium; the
// metadata is moved around here, so the Exif (with its GPS) of the original photos survives untouched
// except for the one value a fixture exists to change.

const SOI = [0xff, 0xd8];
const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"

export interface ExifLocation {
  /** Offset of the 0xFF of the APP1 marker. */
  start: number;
  /** Offset just after the segment. */
  end: number;
  /** The TIFF block (everything after "Exif\0\0"), a view into the input. */
  tiff: Uint8Array;
}

const u16 = (bytes: Uint8Array, at: number): number => ((bytes[at] ?? 0) << 8) | (bytes[at + 1] ?? 0);

/** Top-level marker segments up to the first SOS, as [marker, start, end] (start at the 0xFF). */
export function markerSegments(jpeg: Uint8Array): { marker: number; start: number; end: number }[] {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error('not a JPEG');
  const out: { marker: number; start: number; end: number }[] = [];
  let i = 2;
  while (i + 4 <= jpeg.length) {
    if (jpeg[i] !== 0xff) throw new Error(`bad marker at ${i}`);
    const marker = jpeg[i + 1] ?? 0;
    if (marker === 0xda) break;
    const end = i + 2 + u16(jpeg, i + 2);
    out.push({ marker, start: i, end });
    i = end;
  }
  return out;
}

export function findExif(jpeg: Uint8Array): ExifLocation | null {
  for (const segment of markerSegments(jpeg)) {
    if (segment.marker !== 0xe1) continue;
    const body = jpeg.subarray(segment.start + 4, segment.end);
    if (EXIF_HEADER.every((byte, i) => body[i] === byte)) return { start: segment.start, end: segment.end, tiff: body.subarray(6) };
  }
  return null;
}

/**
 * Returns a copy of the TIFF block with Orientation (IFD0 tag 0x0112) set to `value`. The tag is
 * patched in place when it exists. When it does not, IFD0 is rewritten at the end of the block with
 * the new entry and the header pointer moved there: every other offset in the block stays valid.
 */
export function setOrientation(tiff: Uint8Array, value: number): Uint8Array {
  const order = String.fromCharCode(tiff[0] ?? 0, tiff[1] ?? 0);
  if (order !== 'II' && order !== 'MM') throw new Error('not a TIFF block');
  const little = order === 'II';
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const ifd0 = view.getUint32(4, little);
  const count = view.getUint16(ifd0, little);
  for (let entry = 0; entry < count; entry += 1) {
    const at = ifd0 + 2 + entry * 12;
    if (view.getUint16(at, little) !== 0x0112) continue;
    const copy = tiff.slice();
    new DataView(copy.buffer).setUint16(at + 8, value, little);
    return copy;
  }
  const table = ifd0 + 2;
  const entries: Uint8Array[] = [];
  for (let entry = 0; entry < count; entry += 1) entries.push(tiff.slice(table + entry * 12, table + entry * 12 + 12));
  const added = new Uint8Array(12);
  const addedView = new DataView(added.buffer);
  addedView.setUint16(0, 0x0112, little);
  addedView.setUint16(2, 3, little);
  addedView.setUint32(4, 1, little);
  addedView.setUint16(8, value, little);
  const tagOf = (entryBytes: Uint8Array): number => new DataView(entryBytes.buffer, entryBytes.byteOffset).getUint16(0, little);
  entries.push(added);
  entries.sort((a, b) => tagOf(a) - tagOf(b));
  const next = view.getUint32(table + count * 12, little);
  const at = tiff.length + (tiff.length % 2);
  const out = new Uint8Array(at + 2 + entries.length * 12 + 4);
  out.set(tiff);
  const outView = new DataView(out.buffer);
  outView.setUint32(4, at, little);
  outView.setUint16(at, entries.length, little);
  entries.forEach((entryBytes, i) => out.set(entryBytes, at + 2 + i * 12));
  outView.setUint32(at + 2 + entries.length * 12, next, little);
  return out;
}

/** An Exif APP1 segment (marker, length, "Exif\0\0", TIFF block). */
export function exifSegment(tiff: Uint8Array): Uint8Array {
  const length = 2 + EXIF_HEADER.length + tiff.length;
  if (length > 0xffff) throw new Error('Exif block too large for one APP1');
  const out = new Uint8Array(2 + length);
  out.set([0xff, 0xe1, length >> 8, length & 0xff, ...EXIF_HEADER]);
  out.set(tiff, 10);
  return out;
}

/** The JPEG with `segment` right after SOI (where Exif belongs), dropping any Exif it already had. */
export function withSegmentAfterSoi(jpeg: Uint8Array, segment: Uint8Array): Uint8Array {
  const existing = findExif(jpeg);
  const rest = existing ? [jpeg.subarray(2, existing.start), jpeg.subarray(existing.end)] : [jpeg.subarray(2)];
  const parts = [Uint8Array.from(SOI), segment, ...rest];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/** Cuts the file at `fraction` of its bytes, never right after an 0xFF, so there is no EOI and no half marker. */
export function truncateJpeg(jpeg: Uint8Array, fraction: number): Uint8Array {
  let cut = Math.floor(jpeg.length * fraction);
  while (cut > 0 && jpeg[cut - 1] === 0xff) cut -= 1;
  return jpeg.slice(0, cut);
}

/**
 * Damages the marker structure, keeping SOI + 0xFF and a trailing EOI: the first DQT announces a
 * length that ends in the middle of the scan data (libjpeg: "Bogus marker length", and a segment walk
 * lands on a byte that is not a marker), and the SOF reports a height of zero. Browsers do not
 * decode the result; entropy-coded damage alone would not do it, because decoders conceal that.
 */
export function corruptJpegStructure(jpeg: Uint8Array): Uint8Array {
  const segments = markerSegments(jpeg);
  const dqt = segments.find((segment) => segment.marker === 0xdb);
  const sof = segments.find((segment) => segment.marker === 0xc0);
  if (!dqt || !sof) throw new Error('expected a baseline JPEG with DQT and SOF0');
  if (jpeg[jpeg.length - 2] !== 0xff || jpeg[jpeg.length - 1] !== 0xd9) throw new Error('source JPEG has no EOI');
  const out = jpeg.slice();
  let length = 0x0400;
  while (dqt.start + 2 + length < out.length - 2 && out[dqt.start + 2 + length] === 0xff) length += 1;
  out[dqt.start + 2] = length >> 8;
  out[dqt.start + 3] = length & 0xff;
  out[sof.start + 5] = 0;
  out[sof.start + 6] = 0;
  return out;
}
