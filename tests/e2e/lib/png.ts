// PNG reader for the tests: the chunk list, the header, and the chunks that carry metadata
// (eXIf, tEXt, zTXt, iTXt, tIME). Colour chunks (iCCP, sRGB, gAMA, cHRM) are reported on their own,
// because a P3 profile next to sRGB pixels is a bug but not a location leak.
import { unzlibSync } from 'fflate';
import { crc32 } from './zip.ts';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export interface PngChunk {
  type: string;
  data: Uint8Array;
  /** The stored CRC matches the one computed over type + data. */
  crcOk: boolean;
}

export function isPng(bytes: Uint8Array): boolean {
  return SIGNATURE.every((byte, i) => bytes[i] === byte);
}

export function pngChunks(bytes: Uint8Array): PngChunk[] {
  if (!isPng(bytes)) throw new Error('not a PNG');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: PngChunk[] = [];
  let at = 8;
  while (at + 12 <= bytes.length) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    if (at + 12 + length > bytes.length) throw new Error(`chunk ${type} runs past the end of the file`);
    const data = bytes.subarray(at + 8, at + 8 + length);
    const crcOk = view.getUint32(at + 8 + length) === crc32(bytes.subarray(at + 4, at + 8 + length));
    out.push({ type, data, crcOk });
    at += 12 + length;
    if (type === 'IEND') break;
  }
  return out;
}

export interface PngInfo {
  width: number;
  height: number;
  bitDepth: number;
  /** 0 grey, 2 RGB, 3 palette, 4 grey + alpha, 6 RGBA. */
  colorType: number;
  interlaced: boolean;
  /** Colour type 4 or 6: there is an alpha channel (it may be all 255). */
  hasAlphaChannel: boolean;
  /** A tRNS chunk gives a palette or colour key transparency. */
  hasTrns: boolean;
  chunkTypes: string[];
}

export function pngInfo(bytes: Uint8Array): PngInfo {
  const chunks = pngChunks(bytes);
  const header = chunks[0];
  if (!header || header.type !== 'IHDR') throw new Error('PNG without IHDR first');
  const view = new DataView(header.data.buffer, header.data.byteOffset, header.data.byteLength);
  const colorType = view.getUint8(9);
  return {
    width: view.getUint32(0),
    height: view.getUint32(4),
    bitDepth: view.getUint8(8),
    colorType,
    interlaced: view.getUint8(12) === 1,
    hasAlphaChannel: colorType === 4 || colorType === 6,
    hasTrns: chunks.some((chunk) => chunk.type === 'tRNS'),
    chunkTypes: chunks.map((chunk) => chunk.type),
  };
}

export const PNG_METADATA_CHUNKS = ['eXIf', 'iTXt', 'tEXt', 'zTXt', 'tIME'] as const;

/** The metadata chunk types in the file (empty for a clean output), in file order, repeats kept. */
export function pngMetadataChunks(bytes: Uint8Array): string[] {
  return pngChunks(bytes)
    .map((chunk) => chunk.type)
    .filter((type) => (PNG_METADATA_CHUNKS as readonly string[]).includes(type));
}

/** iCCP, sRGB, gAMA and cHRM: colour description, not location. */
export function pngColorChunks(bytes: Uint8Array): string[] {
  return pngChunks(bytes)
    .map((chunk) => chunk.type)
    .filter((type) => ['iCCP', 'sRGB', 'gAMA', 'cHRM'].includes(type));
}

/** The eXIf chunk: a bare TIFF block, ready for tiffHasGps / tiffOrientation of jpeg.ts. */
export function pngExif(bytes: Uint8Array): Uint8Array | null {
  return pngChunks(bytes).find((chunk) => chunk.type === 'eXIf')?.data ?? null;
}

export interface PngText {
  chunk: 'tEXt' | 'zTXt' | 'iTXt';
  keyword: string;
  text: string;
}

const latin1 = (bytes: Uint8Array): string => String.fromCharCode(...bytes);

/** Decoded text chunks, so a test can look for coordinates or XMP in them. */
export function pngText(bytes: Uint8Array): PngText[] {
  const out: PngText[] = [];
  for (const { type, data } of pngChunks(bytes)) {
    const end = data.indexOf(0);
    if (end < 0) continue;
    const keyword = latin1(data.subarray(0, end));
    if (type === 'tEXt') out.push({ chunk: 'tEXt', keyword, text: latin1(data.subarray(end + 1)) });
    if (type === 'zTXt') out.push({ chunk: 'zTXt', keyword, text: latin1(unzlibSync(data.subarray(end + 2))) });
    if (type === 'iTXt') {
      const compressed = data[end + 1] === 1;
      let at = end + 3; // after the NUL, the compression flag and method
      for (let skip = 0; skip < 2; skip += 1) at = data.indexOf(0, at) + 1; // language tag, translated keyword
      const body = data.subarray(at);
      out.push({ chunk: 'iTXt', keyword, text: new TextDecoder().decode(compressed ? unzlibSync(body) : body) });
    }
  }
  return out;
}

export interface PngPixels {
  width: number;
  height: number;
  /** width * height * 4 bytes, straight (not premultiplied) RGBA. */
  rgba: Uint8Array;
}

/**
 * The pixels of an 8-bit, non-interlaced PNG (every colour type), decoded with fflate: enough to
 * read the alpha of a fixture or of an output without a browser. Throws for other bit depths.
 */
export function pngPixels(bytes: Uint8Array): PngPixels {
  const info = pngInfo(bytes);
  if (info.bitDepth !== 8 || info.interlaced) throw new Error('only 8-bit non-interlaced PNGs are decoded here');
  const chunks = pngChunks(bytes);
  const idat = chunks.filter((chunk) => chunk.type === 'IDAT');
  const packed = new Uint8Array(idat.reduce((sum, chunk) => sum + chunk.data.length, 0));
  let at = 0;
  for (const chunk of idat) {
    packed.set(chunk.data, at);
    at += chunk.data.length;
  }
  const raw = unzlibSync(packed);
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[info.colorType] as number;
  const stride = info.width * channels;
  const rows = new Uint8Array(info.height * stride);
  for (let y = 0; y < info.height; y += 1) {
    const filter = raw[y * (stride + 1)] as number;
    for (let x = 0; x < stride; x += 1) {
      const value = raw[y * (stride + 1) + 1 + x] as number;
      const left = x >= channels ? (rows[y * stride + x - channels] as number) : 0;
      const up = y > 0 ? (rows[(y - 1) * stride + x] as number) : 0;
      const upLeft = y > 0 && x >= channels ? (rows[(y - 1) * stride + x - channels] as number) : 0;
      let predicted = 0;
      if (filter === 1) predicted = left;
      else if (filter === 2) predicted = up;
      else if (filter === 3) predicted = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        predicted = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      rows[y * stride + x] = (value + predicted) & 0xff;
    }
  }
  const palette = chunks.find((chunk) => chunk.type === 'PLTE')?.data;
  const transparency = chunks.find((chunk) => chunk.type === 'tRNS')?.data;
  const rgba = new Uint8Array(info.width * info.height * 4);
  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const source = pixel * channels;
    const target = pixel * 4;
    const sample = (offset: number): number => rows[source + offset] as number;
    if (info.colorType === 6) rgba.set([sample(0), sample(1), sample(2), sample(3)], target);
    else if (info.colorType === 2) rgba.set([sample(0), sample(1), sample(2), 255], target);
    else if (info.colorType === 0) rgba.set([sample(0), sample(0), sample(0), 255], target);
    else if (info.colorType === 4) rgba.set([sample(0), sample(0), sample(0), sample(1)], target);
    else {
      const index = sample(0);
      rgba.set([palette?.[index * 3] ?? 0, palette?.[index * 3 + 1] ?? 0, palette?.[index * 3 + 2] ?? 0, transparency?.[index] ?? 255], target);
    }
  }
  return { width: info.width, height: info.height, rgba };
}
