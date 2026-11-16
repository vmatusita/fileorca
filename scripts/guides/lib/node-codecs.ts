// F19b (guides 1 and 2): what the outputs of Compress image and Convert to WebP say about themselves, read in Node from
// their bytes. The quality the target size reached, which the page never shows, from the quantization tables (DQT) of
// the JPEG it wrote against the tables the site's own MozJPEG encoder (src/engine/image/codecs/jpeg.ts, the same
// WebAssembly and the same options) writes at each quality of the search; and the pixels of the corners of a JPEG, a
// PNG, a WebP or an AVIF, decoded by the engine's own codecs, to tell transparent corners from white ones.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { decodeAvif } from '../../../src/engine/image/codecs/avif.ts';
import { encodeJpeg } from '../../../src/engine/image/codecs/jpeg.ts';
import { configureWasm, type WasmUrls } from '../../../src/engine/image/codecs/wasm.ts';
import { decodeWebp } from '../../../src/engine/image/codecs/webp.ts';
import { makeRaster } from '../../../src/engine/image/pixels.ts';
import { TARGET } from '../../../src/engine/image/target.ts';
import { sniff } from '../../../tests/e2e/lib/images.ts';
import { segments } from '../../../tests/e2e/lib/jpeg.ts';
import { pixelsOf } from './node-image.ts';

export const NODE_DQT = 'the quantization tables of the JPEG, matched with the tables src/engine/image/codecs/jpeg.ts (MozJPEG through jSquash) writes at each quality in Node';
export const NODE_CORNERS = 'the codecs of src/engine/image (MozJPEG, libwebp and libavif through jSquash) and a PNG reader in Node, reading the four corner pixels';

const require = createRequire(import.meta.url);
/** The .wasm files these readers use, served to the engine's codecs from node_modules (they fetch by URL, as in the browser). */
const FILES: Partial<Record<keyof WasmUrls, string>> = {
  jpegEncoder: '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm',
  webpDecoder: '@jsquash/webp/codec/dec/webp_dec.wasm',
  avifDecoder: '@jsquash/avif/codec/dec/avif_dec.wasm',
};
let ready = false;

export function codecs(): void {
  if (ready) return;
  const served = new Map<string, Uint8Array>();
  const urls: Partial<Record<keyof WasmUrls, string>> = {};
  for (const [key, file] of Object.entries(FILES) as [keyof WasmUrls, string][]) {
    const url = `https://wasm.measure.invalid/${key}.wasm`;
    served.set(url, new Uint8Array(readFileSync(require.resolve(file))));
    urls[key] = url;
  }
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const bytes = served.get(url);
    if (bytes) return new Response(bytes as BlobPart, { headers: { 'content-type': 'application/wasm' } });
    return original(input, init);
  }) as typeof fetch;
  configureWasm(urls);
  ready = true;
}

// ---- the quality of a JPEG the target size wrote ---------------------------------------------------------------

/** The quantization tables of a JPEG's own header (the segments before the first scan), by table id, as text. */
export function dqtTables(bytes: Uint8Array): string {
  const tables = new Map<number, number[]>();
  for (const segment of segments(bytes)) {
    if (segment.marker !== 0xdb) continue;
    const data = segment.data;
    let at = 0;
    while (at < data.length) {
      const head = data[at] ?? 0;
      const wide = head >> 4 === 1;
      const id = head & 0x0f;
      at += 1;
      const values: number[] = [];
      for (let i = 0; i < 64; i += 1) {
        values.push(wide ? ((data[at] ?? 0) << 8) | (data[at + 1] ?? 0) : (data[at] ?? 0));
        at += wide ? 2 : 1;
      }
      tables.set(id, values);
    }
  }
  if (tables.size === 0) throw new Error('a JPEG with no quantization table');
  return [...tables.entries()].sort(([a], [b]) => a - b).map(([id, values]) => `${id}:${values.join(',')}`).join(' | ');
}

let reference: Promise<Map<number, string>> | undefined;

/** The tables the site's MozJPEG writes at each quality the target size may pick (TARGET.qualityMin to qualityMax). */
function referenceTables(): Promise<Map<number, string>> {
  reference ??= (async () => {
    codecs();
    // A small picture with colour in it: the tables depend on the quality and the options, never on the pixels.
    const raster = makeRaster(32, 32);
    for (let y = 0; y < 32; y += 1) for (let x = 0; x < 32; x += 1) raster.data.set([x * 8, y * 8, (x + y) * 4, 255], (y * 32 + x) * 4);
    const out = new Map<number, string>();
    for (let quality = TARGET.qualityMin; quality <= TARGET.qualityMax; quality += 1) out.set(quality, dqtTables(await encodeJpeg(raster, quality)));
    return out;
  })();
  return reference;
}

/**
 * The quality of the search whose tables are exactly the JPEG's, or null when none is or more than one is: a number goes
 * into the guide only from an exact and single match (prompt F19b, front M1).
 */
export async function qualityOf(bytes: Uint8Array): Promise<{ quality: number | null; matches: number[] }> {
  const tables = dqtTables(bytes);
  const matches = [...(await referenceTables()).entries()].filter(([, known]) => known === tables).map(([quality]) => quality);
  return { quality: matches.length === 1 ? (matches[0] as number) : null, matches };
}

export const NODE_FULL_SIZE = 'src/engine/image/codecs/jpeg.ts (MozJPEG) in Node on the whole photo, upright, as the MozJPEG decoder gives its pixels: the highest quality of the search whose copy at the full size fits the limit';

const upright = new Map<string, ReturnType<typeof pixelsOf>>();

/**
 * The highest quality of the target search (40 to 90) at which the whole photo, at its full size, fits `limit` bytes, or
 * null when not even the lowest does: what lowering only the quality could have given. A binary search, as the engine's
 * own: the bytes grow with the quality.
 */
export async function fullSizeQuality(name: string, bytes: Uint8Array, limit: number): Promise<number | null> {
  codecs();
  let image = upright.get(name);
  if (!image) {
    image = pixelsOf(bytes);
    upright.set(name, image);
  }
  const pixels = await image;
  let low: number = TARGET.qualityMin;
  let high: number = TARGET.qualityMax;
  let best: number | null = null;
  while (low <= high) {
    const quality = (low + high) >> 1;
    if ((await encodeJpeg(pixels, quality)).length <= limit) {
      best = quality;
      low = quality + 1;
    } else {
      high = quality - 1;
    }
  }
  return best;
}

// ---- the corners of a picture ----------------------------------------------------------------------------------

/** The RGBA of the four corner pixels (top left, top right, bottom left, bottom right). */
export async function cornersOf(bytes: Uint8Array): Promise<number[][]> {
  codecs();
  const format = sniff(bytes);
  const buffer = (): ArrayBuffer => bytes.slice().buffer as ArrayBuffer;
  const image = format === 'webp' ? await decodeWebp(buffer()) : format === 'avif' ? await decodeAvif(buffer()) : await pixelsOf(bytes);
  const { data, width, height } = image;
  return [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]].map(([x, y]) => {
    const at = ((y as number) * width + (x as number)) * 4;
    return [data[at] as number, data[at + 1] as number, data[at + 2] as number, data[at + 3] as number];
  });
}

/** Corners a person sees through (alpha under 40 of 255, the line of the image matrix, tests/e2e/lib/matrix.ts). */
export const clearCorners = (corners: number[][]): number => corners.filter((corner) => (corner[3] as number) < 40).length;
/** Opaque white corners (each channel 250 or more, the line of guide 5). */
export const whiteCorners = (corners: number[][]): number => corners.filter((corner) => (corner[3] as number) === 255 && corner.slice(0, 3).every((value) => value >= 250)).length;
