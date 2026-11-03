// Location and identity in image metadata, for the public-repository audit (DECISOES § 332). The format readers and
// the GPS kind come from the test readers (tests/e2e/lib/), the same ones the privacy tests trust; this file only adds
// what they do not need: the coordinate itself, the identity tags (Artist, Copyright, XPAuthor, CameraOwnerName,
// BodySerialNumber) and the GPS and creator fields of an XMP packet. No dependency.
import { exifItems } from '../../../tests/e2e/lib/bmff.ts';
import { metadataReport, sniff, type Format } from '../../../tests/e2e/lib/images.ts';
import { exifBlock, type GpsKind } from '../../../tests/e2e/lib/jpeg.ts';
import { pngExif } from '../../../tests/e2e/lib/png.ts';
import { webpExif } from '../../../tests/e2e/lib/webp.ts';

export const IMAGE_FORMATS: readonly Format[] = ['jpeg', 'png', 'webp', 'avif', 'heic'];

export interface IdentityTag {
  /** Tag name as the Exif standard spells it, or "XMP dc:creator". */
  tag: string;
  value: string;
}

export interface ImageMetadata {
  format: Format;
  gpsKind: GpsKind;
  /** Decimal degrees, south and west negative; null when the file has no real coordinate. */
  latitude: number | null;
  longitude: number | null;
  /** The GPS fields of an XMP packet, as written (they carry no Exif rational). */
  xmpGps: string[];
  identity: IdentityTag[];
}

interface Tiff {
  bytes: Uint8Array;
  u16(at: number): number;
  u32(at: number): number;
}

function openTiff(bytes: Uint8Array): Tiff | null {
  const little = bytes[0] === 0x49;
  if (bytes.length < 8 || (!little && bytes[0] !== 0x4d)) return null;
  const u16 = (at: number): number => (little ? (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8) : ((bytes[at] ?? 0) << 8) | (bytes[at + 1] ?? 0));
  const u32 = (at: number): number => (little ? u16(at) + u16(at + 2) * 65536 : u16(at) * 65536 + u16(at + 2));
  return { bytes, u16, u32 };
}

interface Entry {
  tag: number;
  type: number;
  count: number;
  /** Offset of the 4-byte value or offset field. */
  field: number;
}

function entries(tiff: Tiff, ifd: number): Entry[] {
  if (ifd <= 0 || ifd + 2 > tiff.bytes.length) return [];
  const count = tiff.u16(ifd);
  const out: Entry[] = [];
  for (let index = 0; index < count && ifd + 2 + (index + 1) * 12 <= tiff.bytes.length; index += 1) {
    const at = ifd + 2 + index * 12;
    out.push({ tag: tiff.u16(at), type: tiff.u16(at + 2), count: tiff.u32(at + 4), field: at + 8 });
  }
  return out;
}

/** Bytes of a value: inline when it fits in the 4-byte field, at the offset otherwise. */
function valueBytes(tiff: Tiff, entry: Entry, size: number): Uint8Array {
  const length = entry.count * size;
  const from = length <= 4 ? entry.field : tiff.u32(entry.field);
  return tiff.bytes.subarray(from, Math.min(tiff.bytes.length, from + length));
}

function ascii(tiff: Tiff, entry: Entry): string {
  const bytes = valueBytes(tiff, entry, 1);
  const end = bytes.indexOf(0);
  return new TextDecoder('latin1').decode(end === -1 ? bytes : bytes.subarray(0, end)).trim();
}

function utf16(tiff: Tiff, entry: Entry): string {
  const bytes = valueBytes(tiff, entry, 1);
  return new TextDecoder('utf-16le').decode(bytes).replace(/\0+$/, '').trim();
}

function rationals(tiff: Tiff, entry: Entry): number[] {
  if (entry.type !== 5) return [];
  const at = tiff.u32(entry.field);
  const out: number[] = [];
  for (let part = 0; part < entry.count; part += 1) {
    const numerator = tiff.u32(at + part * 8);
    const denominator = tiff.u32(at + part * 8 + 4);
    out.push(denominator === 0 ? Number.NaN : numerator / denominator);
  }
  return out;
}

const IFD0_TAGS: Record<number, string> = { 0x013b: 'Artist', 0x8298: 'Copyright' };
const EXIF_TAGS: Record<number, string> = { 0xa430: 'CameraOwnerName', 0xa431: 'BodySerialNumber' };

export interface TiffFacts {
  latitude: number | null;
  longitude: number | null;
  identity: IdentityTag[];
}

/** The coordinate (when real) and the identity tags of one bare TIFF block. */
export function tiffFacts(block: Uint8Array): TiffFacts {
  const facts: TiffFacts = { latitude: null, longitude: null, identity: [] };
  const tiff = openTiff(block);
  if (!tiff) return facts;
  const ifd0 = entries(tiff, tiff.u32(4));
  for (const entry of ifd0) {
    const name = IFD0_TAGS[entry.tag];
    if (name && entry.type === 2) {
      const value = ascii(tiff, entry);
      if (value) facts.identity.push({ tag: name, value });
    }
    if (entry.tag === 0x9c9d) {
      const value = utf16(tiff, entry);
      if (value) facts.identity.push({ tag: 'XPAuthor', value });
    }
  }
  const exifPointer = ifd0.find((entry) => entry.tag === 0x8769);
  if (exifPointer) {
    for (const entry of entries(tiff, tiff.u32(exifPointer.field))) {
      const name = EXIF_TAGS[entry.tag];
      if (name && entry.type === 2) {
        const value = ascii(tiff, entry);
        if (value) facts.identity.push({ tag: name, value });
      }
    }
  }
  const gpsPointer = ifd0.find((entry) => entry.tag === 0x8825);
  if (gpsPointer) {
    const gps = entries(tiff, tiff.u32(gpsPointer.field));
    const ref = (tag: number): string => {
      const entry = gps.find((candidate) => candidate.tag === tag);
      return entry ? ascii(tiff, entry).toUpperCase() : '';
    };
    const degrees = (tag: number): number | null => {
      const entry = gps.find((candidate) => candidate.tag === tag);
      const parts = entry ? rationals(tiff, entry) : [];
      if (parts.length === 0 || parts.some((part) => !Number.isFinite(part))) return null;
      return (parts[0] ?? 0) + (parts[1] ?? 0) / 60 + (parts[2] ?? 0) / 3600;
    };
    const latitude = degrees(2);
    const longitude = degrees(4);
    if (latitude !== null && longitude !== null && (latitude !== 0 || longitude !== 0)) {
      facts.latitude = ref(1) === 'S' ? -latitude : latitude;
      facts.longitude = ref(3) === 'W' ? -longitude : longitude;
    }
  }
  return facts;
}

/** The TIFF blocks a file keeps, through the test readers. A broken container gives none. */
function tiffBlocks(bytes: Uint8Array, format: Format): Uint8Array[] {
  try {
    if (format === 'jpeg') return [exifBlock(bytes)].filter((block): block is Uint8Array => block !== null);
    if (format === 'png') return [pngExif(bytes)].filter((block): block is Uint8Array => block !== null);
    if (format === 'webp') return [webpExif(bytes)].filter((block): block is Uint8Array => block !== null);
    if (format === 'avif' || format === 'heic') return exifItems(bytes).map((item) => item.tiff);
  } catch {
    // a container the readers cannot walk has no block we can trust
  }
  return [];
}

const XMP_GPS = /exif:GPS(?:Latitude|Longitude)(?:="([^"]+)"|>([^<]+)<)/g;
const XMP_CREATOR = /<dc:creator>\s*<rdf:Seq>\s*<rdf:li[^>]*>([^<]+)<\/rdf:li>/g;

/** Location and identity of an image, or null when the bytes are not one of the five formats. Never throws. */
export function imageMetadata(bytes: Uint8Array): ImageMetadata | null {
  const format = sniff(bytes);
  if (!IMAGE_FORMATS.includes(format)) return null;
  let gpsKind: GpsKind = 'none';
  try {
    gpsKind = metadataReport(bytes).gpsKind;
  } catch {
    // the report could not walk the file: the blocks below still say what they can
  }
  const result: ImageMetadata = { format, gpsKind, latitude: null, longitude: null, xmpGps: [], identity: [] };
  for (const block of tiffBlocks(bytes, format)) {
    const facts = tiffFacts(block);
    if (result.latitude === null && facts.latitude !== null) {
      result.latitude = facts.latitude;
      result.longitude = facts.longitude;
    }
    for (const tag of facts.identity) if (!result.identity.some((known) => known.tag === tag.tag && known.value === tag.value)) result.identity.push(tag);
  }
  const text = new TextDecoder('latin1').decode(bytes);
  if (text.includes('<x:xmpmeta')) {
    for (const match of text.matchAll(XMP_GPS)) result.xmpGps.push((match[1] ?? match[2] ?? '').trim());
    for (const match of text.matchAll(XMP_CREATOR)) result.identity.push({ tag: 'XMP dc:creator', value: (match[1] ?? '').trim() });
  }
  return result;
}

/** A coordinate as text with six decimals, the precision the report compares. */
export function coordinate(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
