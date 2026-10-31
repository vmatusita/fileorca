// Minimal JPEG reader for the tests: lists APPn segments and finds the GPS IFD pointer (0x8825)
// in an Exif block. Enough to prove "the output carries no metadata, and no GPS". The TIFF helpers
// (orientation, GPS) take the bare TIFF block, so the PNG, WebP and HEIF/AVIF readers share them.

export interface Segment {
  marker: number;
  data: Uint8Array;
}

export function segments(bytes: Uint8Array): Segment[] {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a JPEG');
  const out: Segment[] = [];
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) throw new Error(`bad marker at ${i}`);
    const marker = bytes[i + 1] ?? 0;
    if (marker === 0xda) break; // start of scan: image data follows
    const length = ((bytes[i + 2] ?? 0) << 8) | (bytes[i + 3] ?? 0);
    out.push({ marker, data: bytes.subarray(i + 4, i + 2 + length) });
    i += 2 + length;
  }
  return out;
}

export function exifBlock(bytes: Uint8Array): Uint8Array | null {
  for (const segment of segments(bytes)) {
    const header = String.fromCharCode(...segment.data.subarray(0, 6));
    if (segment.marker === 0xe1 && header === 'Exif\0\0') return segment.data.subarray(6);
  }
  return null;
}

/** True when IFD0 of the Exif block has the GPSInfo tag (0x8825). */
export function hasGps(bytes: Uint8Array): boolean {
  const tiff = exifBlock(bytes);
  return tiff ? tiffHasGps(tiff) : false;
}

// ---------------------------------------------------------------------------------------------
// TIFF (the Exif payload wherever it lives)

interface Tiff {
  little: boolean;
  u16(offset: number): number;
  u32(offset: number): number;
}

function openTiff(tiff: Uint8Array): Tiff | null {
  const little = tiff[0] === 0x49;
  if (tiff.length < 8 || (!little && tiff[0] !== 0x4d)) return null;
  const u16 = (offset: number) => (little ? (tiff[offset] ?? 0) | ((tiff[offset + 1] ?? 0) << 8) : ((tiff[offset] ?? 0) << 8) | (tiff[offset + 1] ?? 0));
  const u32 = (offset: number) => (little ? u16(offset) + u16(offset + 2) * 65536 : u16(offset) * 65536 + u16(offset + 2));
  return { little, u16, u32 };
}

interface IfdEntry {
  tag: number;
  type: number;
  count: number;
  /** Offset of the 4-byte value/offset field. */
  field: number;
}

function ifdEntries(reader: Tiff, ifd: number, size: number): IfdEntry[] {
  if (ifd + 2 > size) return [];
  const count = reader.u16(ifd);
  const out: IfdEntry[] = [];
  for (let entry = 0; entry < count && ifd + 2 + (entry + 1) * 12 <= size; entry += 1) {
    const at = ifd + 2 + entry * 12;
    out.push({ tag: reader.u16(at), type: reader.u16(at + 2), count: reader.u32(at + 4), field: at + 8 });
  }
  return out;
}

/** True when IFD0 has the GPSInfo tag (0x8825): the pointer that no output may carry. */
export function tiffHasGps(tiff: Uint8Array): boolean {
  const reader = openTiff(tiff);
  if (!reader) return false;
  return ifdEntries(reader, reader.u32(4), tiff.length).some((entry) => entry.tag === 0x8825);
}

/** Exif Orientation (IFD0 tag 0x0112), or null when the block has none. */
export function tiffOrientation(tiff: Uint8Array): number | null {
  const reader = openTiff(tiff);
  if (!reader) return null;
  const entry = ifdEntries(reader, reader.u32(4), tiff.length).find((candidate) => candidate.tag === 0x0112);
  return entry ? reader.u16(entry.field) : null;
}

/**
 * What the GPS IFD holds. real: coordinates; zeroed: latitude and longitude are 0/1 rationals with a
 * hemisphere letter (the Vision Pro file); empty: the IFD exists but has no letters and 0/0 rationals
 * (the Samsung file); none: no GPS pointer at all.
 */
export type GpsKind = 'real' | 'zeroed' | 'empty' | 'none';

export function tiffGpsKind(tiff: Uint8Array): GpsKind {
  const reader = openTiff(tiff);
  if (!reader) return 'none';
  const pointer = ifdEntries(reader, reader.u32(4), tiff.length).find((entry) => entry.tag === 0x8825);
  if (!pointer) return 'none';
  const gps = ifdEntries(reader, reader.u32(pointer.field), tiff.length);
  const refs: string[] = [];
  const rationals: [number, number][] = [];
  for (const entry of gps) {
    if (entry.tag === 1 || entry.tag === 3) refs.push(entry.count > 1 && (tiff[entry.field] ?? 0) !== 0 ? String.fromCharCode(tiff[entry.field] ?? 0) : '');
    if ((entry.tag === 2 || entry.tag === 4) && entry.type === 5) {
      const at = reader.u32(entry.field);
      for (let part = 0; part < entry.count; part += 1) rationals.push([reader.u32(at + part * 8), reader.u32(at + part * 8 + 4)]);
    }
  }
  if (rationals.some(([numerator, denominator]) => numerator !== 0 && denominator !== 0)) return 'real';
  if (rationals.length > 0 && rationals.every(([, denominator]) => denominator !== 0) && refs.length > 0 && refs.every((ref) => ref !== '')) return 'zeroed';
  return 'empty';
}

// ---------------------------------------------------------------------------------------------
// JPEG structure

export interface Sof {
  /** Marker byte: 0xC0 baseline, 0xC1 extended, 0xC2 progressive. */
  marker: number;
  precision: number;
  width: number;
  height: number;
  components: number;
}

/**
 * Size of the image itself, from the SOF in the TOP-LEVEL segments. The Exif block of a camera JPEG
 * carries a thumbnail JPEG with its own SOF, so a byte search for FFC0 finds the wrong one.
 * Stored pixels: Orientation is not applied here.
 */
export function sofSize(bytes: Uint8Array): Sof | null {
  for (const segment of segments(bytes)) {
    const m = segment.marker;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      const d = segment.data;
      return { marker: m, precision: d[0] ?? 0, height: ((d[1] ?? 0) << 8) | (d[2] ?? 0), width: ((d[3] ?? 0) << 8) | (d[4] ?? 0), components: d[5] ?? 0 };
    }
  }
  return null;
}

/** Exif Orientation of a JPEG, 1 when the file has none (the value viewers assume). */
export function orientation(bytes: Uint8Array): number {
  const tiff = exifBlock(bytes);
  return (tiff ? tiffOrientation(tiff) : null) ?? 1;
}

/** Size on screen: the SOF size with the Orientation applied once (5 to 8 swap the sides). */
export function displaySize(bytes: Uint8Array): { width: number; height: number } | null {
  const sof = sofSize(bytes);
  if (!sof) return null;
  return orientation(bytes) >= 5 ? { width: sof.height, height: sof.width } : { width: sof.width, height: sof.height };
}

/** True when the file ends with the EOI marker (a truncated download does not). */
export function hasEoi(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
}

/**
 * A copy of the JPEG with its Exif Orientation set to `value`, patched in place. Browsers apply the
 * Orientation when they decode (imageOrientation 'none' is only a legacy alias of 'from-image' in
 * Chromium and WebKit), so this is how a test gets the STORED pixels: decode the copy with value 1.
 * Throws when the file has no Orientation tag to patch.
 */
export function withOrientation(bytes: Uint8Array, value: number): Uint8Array {
  const copy = bytes.slice();
  let i = 2;
  while (i + 4 <= copy.length && copy[i] === 0xff && copy[i + 1] !== 0xda) {
    const length = ((copy[i + 2] ?? 0) << 8) | (copy[i + 3] ?? 0);
    const body = i + 4;
    if (copy[i + 1] === 0xe1 && String.fromCharCode(...copy.subarray(body, body + 6)) === 'Exif\0\0') {
      const tiff = body + 6;
      const block = copy.subarray(tiff, i + 2 + length);
      const reader = openTiff(block);
      const entry = reader && ifdEntries(reader, reader.u32(4), block.length).find((candidate) => candidate.tag === 0x0112);
      if (!reader || !entry) throw new Error('the JPEG has no Orientation tag to patch');
      const at = tiff + entry.field;
      copy[at] = reader.little ? value & 0xff : value >> 8;
      copy[at + 1] = reader.little ? value >> 8 : value & 0xff;
      return copy;
    }
    i += 2 + length;
  }
  throw new Error('the JPEG has no Exif segment to patch');
}

export interface JpegMetadata {
  exif: boolean;
  xmp: boolean;
  iptc: boolean;
  gps: boolean;
  /** Orientation tag of the Exif block, null when there is no Exif or no tag. */
  orientation: number | null;
  /** The APPn markers present, e.g. ['E0', 'E1', 'E2']. */
  apps: string[];
}

/** Every place a JPEG keeps location or authorship: Exif (APP1), XMP (APP1 and extended), IPTC (APP13). */
export function jpegMetadata(bytes: Uint8Array): JpegMetadata {
  const report: JpegMetadata = { exif: false, xmp: false, iptc: false, gps: false, orientation: null, apps: [] };
  for (const segment of segments(bytes)) {
    if (segment.marker >= 0xe0 && segment.marker <= 0xef) report.apps.push(segment.marker.toString(16).toUpperCase());
    const head = String.fromCharCode(...segment.data.subarray(0, 40));
    if (segment.marker === 0xe1 && head.startsWith('Exif\0\0')) {
      report.exif = true;
      const tiff = segment.data.subarray(6);
      report.gps = tiffHasGps(tiff);
      report.orientation = tiffOrientation(tiff);
    }
    if (segment.marker === 0xe1 && (head.startsWith('http://ns.adobe.com/xap/1.0/') || head.startsWith('http://ns.adobe.com/xmp/extension/'))) report.xmp = true;
    if (segment.marker === 0xed && head.startsWith('Photoshop 3.0')) report.iptc = true;
  }
  return report;
}
