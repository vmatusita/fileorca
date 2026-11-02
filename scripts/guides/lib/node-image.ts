// What the image guides read in Node: the metadata of the inputs and of the outputs (GPS, camera, date), the display
// size the engine's own probe gives, the pixels of a JPEG or PNG for the PSNR, and the WebP copies of guide 4, written
// by the engine's own libwebp codec (src/engine/image/codecs/webp.ts) at the quality of the site's WebP encoder.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { encodeWebp } from '../../../src/engine/image/codecs/webp.ts';
import { configureWasm } from '../../../src/engine/image/codecs/wasm.ts';
import { QUALITY } from '../../../src/engine/image/encode.ts';
import { probe } from '../../../src/engine/image/probe.ts';
import type { ImageFormat } from '../../../src/engine/image/types.ts';
import { decodeJpegNode } from '../../fixtures/lib/mozjpeg.ts';
import { exifItems, isBmff } from '../../../tests/e2e/lib/bmff.ts';
import { metadataReport, sniff } from '../../../tests/e2e/lib/images.ts';
import { exifBlock, type GpsKind } from '../../../tests/e2e/lib/jpeg.ts';
import { pngExif, pngPixels } from '../../../tests/e2e/lib/png.ts';
import { psnr } from '../../../tests/e2e/lib/pdfjs-read.ts';
import { webpExif } from '../../../tests/e2e/lib/webp.ts';

const DIR = 'fixtures/images';
export const imageFixture = (name: string): Uint8Array => new Uint8Array(readFileSync(join(DIR, name)));

export const NODE_IMAGE = 'the metadata readers of the tests (Exif, GPS, XMP) and src/engine/image/probe.ts in Node';
export const NODE_PIXELS = 'MozJPEG (jSquash) and a PNG reader in Node, the same decoder for the original and the copy';
export const NODE_WEBP = 'src/engine/image/codecs/webp.ts (libwebp through jSquash) in Node, at the quality of the site WebP encoder';

// ---- Exif tags: camera and date ------------------------------------------------------------------------------

interface TiffReader {
  u16(at: number): number;
  u32(at: number): number;
}

function reader(tiff: Uint8Array): TiffReader | null {
  const little = tiff[0] === 0x49;
  if (tiff.length < 8 || (!little && tiff[0] !== 0x4d)) return null;
  const u16 = (at: number): number => (little ? (tiff[at] ?? 0) | ((tiff[at + 1] ?? 0) << 8) : ((tiff[at] ?? 0) << 8) | (tiff[at + 1] ?? 0));
  const u32 = (at: number): number => (little ? u16(at) + u16(at + 2) * 65536 : u16(at) * 65536 + u16(at + 2));
  return { u16, u32 };
}

/** The ASCII tags of one IFD that this guide reads, and the offset of the Exif sub-IFD. */
function readIfd(tiff: Uint8Array, r: TiffReader, offset: number): { text: Map<number, string>; exifIfd: number | null } {
  const text = new Map<number, string>();
  let exifIfd: number | null = null;
  if (offset + 2 > tiff.length) return { text, exifIfd };
  const count = r.u16(offset);
  for (let i = 0; i < count; i += 1) {
    const entry = offset + 2 + i * 12;
    if (entry + 12 > tiff.length) break;
    const tag = r.u16(entry);
    const type = r.u16(entry + 2);
    const length = r.u32(entry + 4);
    if (tag === 0x8769) exifIfd = r.u32(entry + 8);
    if (type !== 2 || ![0x010f, 0x0110, 0x0132, 0x9003].includes(tag)) continue;
    const at = length <= 4 ? entry + 8 : r.u32(entry + 8);
    const value = String.fromCharCode(...tiff.subarray(at, at + length)).replace(/\0+$/, '').trim();
    if (value) text.set(tag, value);
  }
  return { text, exifIfd };
}

/** The TIFF block of the Exif, wherever the format keeps it. */
function tiffOf(bytes: Uint8Array): Uint8Array | null {
  const format = sniff(bytes);
  if (format === 'jpeg') return exifBlock(bytes);
  if (format === 'png') return pngExif(bytes);
  if (format === 'webp') return webpExif(bytes);
  if ((format === 'heic' || format === 'avif') && isBmff(bytes)) return exifItems(bytes)[0]?.tiff ?? null;
  return null;
}

export interface PhotoFacts {
  /** "Apple iPhone 6", from Make and Model, when the file says. */
  camera: string | null;
  /** DateTimeOriginal, or DateTime, as the file writes it. */
  taken: string | null;
  gps: GpsKind;
  exif: boolean;
  xmp: boolean;
  orientation: number | null;
}

export function photoFacts(bytes: Uint8Array): PhotoFacts {
  const report = metadataReport(bytes);
  const tiff = tiffOf(bytes);
  let camera: string | null = null;
  let taken: string | null = null;
  const r = tiff ? reader(tiff) : null;
  if (tiff && r) {
    const ifd0 = readIfd(tiff, r, r.u32(4));
    const sub = ifd0.exifIfd !== null ? readIfd(tiff, r, ifd0.exifIfd) : null;
    const make = ifd0.text.get(0x010f) ?? '';
    const model = ifd0.text.get(0x0110) ?? '';
    camera = model ? (model.toLowerCase().startsWith(make.toLowerCase()) || !make ? model : `${make} ${model}`) : make || null;
    taken = sub?.text.get(0x9003) ?? ifd0.text.get(0x0132) ?? null;
  }
  return { camera, taken, gps: report.gpsKind, exif: report.exif, xmp: report.xmp, orientation: report.orientation };
}

/** Width and height as shown (orientation applied), from the engine's own probe. */
export function shownSize(bytes: Uint8Array): { width: number; height: number } {
  const format = sniff(bytes) as ImageFormat;
  const info = probe(bytes, format);
  if (!info) throw new Error(`no size for a ${format} file`);
  return { width: info.width, height: info.height };
}

// ---- pixels ---------------------------------------------------------------------------------------------------

export interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/** RGBA of a JPEG (orientation applied) or of an 8-bit PNG. */
export async function pixelsOf(bytes: Uint8Array): Promise<Pixels> {
  const format = sniff(bytes);
  if (format === 'jpeg') return decodeJpegNode(bytes, true);
  if (format === 'png') {
    const decoded = pngPixels(bytes);
    return { data: new Uint8ClampedArray(decoded.rgba), width: decoded.width, height: decoded.height };
  }
  throw new Error(`no pixel reader for ${format}`);
}

/** PSNR in dB, or null when the pictures are not the same size (a crop, a turn, a PDF). Infinity: the same pixels. */
export function psnrOf(a: Pixels, b: Pixels): number | null {
  if (a.width !== b.width || a.height !== b.height) return null;
  return psnr(a, b);
}

// ---- WebP copies ----------------------------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const WEBP_URL = 'https://wasm.measure.invalid/webp_enc_simd.wasm';
let webpReady = false;

/** Serves the engine's .wasm from node_modules: the codec fetches by URL, as it does in the browser. */
function webpCodec(): void {
  if (webpReady) return;
  const wasm = readFileSync(require.resolve('@jsquash/webp/codec/enc/webp_enc_simd.wasm'));
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url === WEBP_URL) return new Response(new Uint8Array(wasm), { headers: { 'content-type': 'application/wasm' } });
    return original(input, init);
  }) as typeof fetch;
  configureWasm({ webpEncoder: WEBP_URL });
  webpReady = true;
}

/** A WebP of a JPEG photo, upright, at the site's WebP quality (Recommended). */
export async function webpOf(jpeg: Uint8Array): Promise<Uint8Array> {
  webpCodec();
  const image = await decodeJpegNode(jpeg, true);
  return encodeWebp(image, QUALITY.webp.recommended);
}
