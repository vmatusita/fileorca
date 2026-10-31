// One entry point over the format readers: what a byte string IS (by signature, never by name), its
// size and Orientation as stored, and the metadata report the privacy tests assert on:
// "this output carries no Exif, no XMP and no GPS", whatever the format.
import { exifItems, isBmff, parseBmff, primaryImage, xmpItems } from './bmff.ts';
import { displaySize, exifBlock, jpegMetadata, orientation as jpegOrientation, sofSize, tiffGpsKind, tiffHasGps, tiffOrientation, type GpsKind } from './jpeg.ts';
import { isPdf, parsePdf } from './pdf.ts';
import { isPng, pngExif, pngInfo, pngMetadataChunks, pngText } from './png.ts';
import { isWebp, webpExif, webpInfo, webpMetadataChunks } from './webp.ts';

export type Format = 'jpeg' | 'png' | 'webp' | 'avif' | 'heic' | 'gif' | 'pdf' | 'zip' | 'text' | 'empty' | 'unknown';

const ascii = (bytes: Uint8Array, from: number, to: number): string => String.fromCharCode(...bytes.subarray(from, to));

/** ftyp brands that name an AVIF / a HEIC. mif1 alone says "HEIF" and decides nothing. */
const AVIF_BRANDS = ['avif', 'avis'];
const HEIC_BRANDS = ['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs'];

/** The ftyp box alone: major brand and compatible brands. */
function readFtyp(bytes: Uint8Array): { majorBrand: string; compatibleBrands: string[] } {
  const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  const compatibleBrands: string[] = [];
  for (let at = 16; at + 4 <= Math.min(size, bytes.length); at += 4) compatibleBrands.push(ascii(bytes, at, at + 4));
  return { majorBrand: ascii(bytes, 8, 12), compatibleBrands };
}

/** AVIF or HEIC: the major brand first, then the compatible list, then the type of the items. */
function sniffBmff(bytes: Uint8Array): 'avif' | 'heic' | 'unknown' {
  const { majorBrand, compatibleBrands } = readFtyp(bytes);
  if (AVIF_BRANDS.includes(majorBrand)) return 'avif';
  if (HEIC_BRANDS.includes(majorBrand)) return 'heic';
  if (compatibleBrands.some((brand) => AVIF_BRANDS.includes(brand))) return 'avif';
  if (compatibleBrands.some((brand) => HEIC_BRANDS.includes(brand))) return 'heic';
  try {
    const items = parseBmff(bytes).items;
    if (items.some((item) => item.type === 'av01')) return 'avif';
    if (items.some((item) => item.type === 'hvc1' || item.type === 'hev1')) return 'heic';
  } catch {
    // a container we cannot walk is not one we can name
  }
  return 'unknown';
}

export function sniff(bytes: Uint8Array): Format {
  if (bytes.length === 0) return 'empty';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (isPng(bytes)) return 'png';
  if (isWebp(bytes)) return 'webp';
  if (isBmff(bytes)) return sniffBmff(bytes);
  if (ascii(bytes, 0, 3) === 'GIF') return 'gif';
  if (isPdf(bytes)) return 'pdf';
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 3 || bytes[2] === 5)) return 'zip';
  const head = bytes.subarray(0, 512);
  const printable = head.every((byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte < 127) || byte >= 0x80);
  return printable && !head.includes(0) ? 'text' : 'unknown';
}

/** The mime type to give a Blob for these bytes. */
export function mimeOf(format: Format): string {
  const types: Partial<Record<Format, string>> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', heic: 'image/heic', gif: 'image/gif', pdf: 'application/pdf', zip: 'application/zip' };
  return types[format] ?? 'application/octet-stream';
}

export interface ImageSize {
  format: Format;
  /** Pixels as stored. */
  width: number;
  height: number;
  /** Exif Orientation 1-8, 1 when the file has none (HEIC/AVIF: the container turns it, see displayWidth). */
  orientation: number;
  /** On screen, orientation applied once. HEIC/AVIF: ispe with irot/imir/clap of the primary item. */
  displayWidth: number;
  displayHeight: number;
}

/** Size of a JPEG, PNG, WebP, AVIF or HEIC from its own headers. Throws for anything else. */
export function imageSize(bytes: Uint8Array): ImageSize {
  const format = sniff(bytes);
  switch (format) {
    case 'jpeg': {
      const sof = sofSize(bytes);
      const shown = displaySize(bytes);
      if (!sof || !shown) throw new Error('JPEG without SOF');
      return { format, width: sof.width, height: sof.height, orientation: jpegOrientation(bytes), displayWidth: shown.width, displayHeight: shown.height };
    }
    case 'png': {
      const { width, height } = pngInfo(bytes);
      return { format, width, height, orientation: 1, displayWidth: width, displayHeight: height };
    }
    case 'webp': {
      const { width, height } = webpInfo(bytes);
      const exif = webpExif(bytes);
      return { format, width, height, orientation: (exif && tiffOrientation(exif)) || 1, displayWidth: width, displayHeight: height };
    }
    case 'avif':
    case 'heic': {
      const primary = primaryImage(parseBmff(bytes));
      return { format, width: primary.ispe[0], height: primary.ispe[1], orientation: 1, displayWidth: primary.displayWidth, displayHeight: primary.displayHeight };
    }
    default:
      throw new Error(`no image size for a ${format} file`);
  }
}

export interface MetadataReport {
  format: Format;
  /** An Exif block / item / chunk exists. */
  exif: boolean;
  /** An XMP packet exists. */
  xmp: boolean;
  /** The Exif has the GPS IFD pointer (what no output may carry). */
  gps: boolean;
  gpsKind: GpsKind;
  /** The Orientation tag of the Exif block, null when there is none. */
  orientation: number | null;
  /** Anything else that can hold a place or an author: IPTC, PNG text chunks and tIME, PDF Info strings. */
  other: string[];
}

/**
 * Every place the format keeps Exif, XMP or location, in one report. A clean output has exif false,
 * xmp false, gps false and an empty `other`. For a PDF it looks inside the embedded JPEG images and
 * at the XMP and Info entries of the file itself.
 */
export function metadataReport(bytes: Uint8Array): MetadataReport {
  const format = sniff(bytes);
  const report: MetadataReport = { format, exif: false, xmp: false, gps: false, gpsKind: 'none', orientation: null, other: [] };
  const absorbExif = (tiff: Uint8Array): void => {
    report.exif = true;
    report.gps = report.gps || tiffHasGps(tiff);
    const kind = tiffGpsKind(tiff);
    if (kind !== 'none') report.gpsKind = kind;
    report.orientation = tiffOrientation(tiff) ?? report.orientation;
  };
  const absorbJpeg = (jpeg: Uint8Array): void => {
    const meta = jpegMetadata(jpeg);
    report.xmp = report.xmp || meta.xmp;
    if (meta.iptc) report.other.push('iptc');
    const tiff = exifBlock(jpeg);
    if (tiff) absorbExif(tiff);
  };
  if (format === 'jpeg') {
    absorbJpeg(bytes);
  } else if (format === 'png') {
    const exif = pngExif(bytes);
    if (exif) absorbExif(exif);
    report.other.push(...pngMetadataChunks(bytes).filter((type) => type !== 'eXIf'));
    if (pngText(bytes).some((entry) => /xmp/i.test(entry.keyword) || entry.text.includes('<x:xmpmeta'))) report.xmp = true;
  } else if (format === 'webp') {
    const exif = webpExif(bytes);
    if (exif) absorbExif(exif);
    report.xmp = webpMetadataChunks(bytes).includes('XMP ');
  } else if (format === 'avif' || format === 'heic') {
    const bmff = parseBmff(bytes);
    for (const item of exifItems(bytes, bmff)) absorbExif(item.tiff);
    report.xmp = xmpItems(bytes, bmff).length > 0;
  } else if (format === 'pdf') {
    const pdf = parsePdf(bytes);
    report.xmp = pdf.hasXmp;
    for (const key of ['Title', 'Author', 'Subject', 'Keywords']) if (pdf.info[key]) report.other.push(`Info/${key}`);
    for (const image of pdf.images) if (image.jpeg) absorbJpeg(image.jpeg);
  }
  return report;
}
