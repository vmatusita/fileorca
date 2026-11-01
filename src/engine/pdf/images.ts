// The images of the Recommended mode of Compress PDF (F5a, decision 4; values fixed before measuring, DECISOES § 147):
// every JPEG image (DCTDecode) that is RGB or grey, 8 bits, with no /Decode array and no mask flag, is decoded by
// MozJPEG, reduced when it holds more than 150 ppi at the largest size it can have on the largest page that uses it,
// and written again by MozJPEG at quality 75. It replaces the original only when it is smaller. CMYK, YCCK, indexed,
// 16-bit, JPX, JBIG2 and CCITT images, inline images and pictures above 50 MP stay as they are. The codecs are the
// single-thread WebAssembly builds of jSquash, which need no canvas: this works in the worker in every browser.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PDFArray, PDFDict, PDFName, PDFNumber, PDFRawStream, PDFRef, PDFStream, type PDFDocument, type PDFObject } from '@cantoo/pdf-lib';
import { defaultOptions as MOZJPEG_DEFAULTS } from '@jsquash/jpeg/meta.js';
import { asset } from './assets.ts';
import { loading } from './errors.ts';
import { boxOf } from './geometry.ts';

export const RECOMMENDED_QUALITY = 75;
export const RECOMMENDED_PPI = 150;
/** Above this a decode would need hundreds of MB in the worker (the WASM limit of the image engine, DECISOES § 65). */
export const MAX_IMAGE_PIXELS = 50_000_000;

interface Raster {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}
interface Decoder {
  decode(data: ArrayBuffer, preserveOrientation: boolean): Raster | null;
}
interface Encoder {
  encode(data: Uint8ClampedArray, width: number, height: number, options: object): Uint8Array;
}

const compiledCache = new Map<string, Promise<WebAssembly.Module>>();

function compile(key: 'jpegDecoder' | 'jpegEncoder' | 'resizer'): Promise<WebAssembly.Module> {
  let module = compiledCache.get(key);
  if (!module) {
    const source = asset(key);
    module = loading(
      typeof source === 'string'
        ? fetch(source).then((response) => {
            if (!response.ok) throw new Error(`${source}: ${response.status}`);
            return response.arrayBuffer().then((buffer) => WebAssembly.compile(buffer));
          })
        : WebAssembly.compile(source.slice().buffer as ArrayBuffer),
    );
    compiledCache.set(key, module);
    module.catch(() => compiledCache.delete(key));
  }
  return module;
}

function emscripten<T>(factory: unknown, module: WebAssembly.Module): Promise<T> {
  return (factory as (options: Record<string, unknown>) => Promise<T>)({
    noInitialRun: true,
    instantiateWasm: (imports: WebAssembly.Imports, done: (instance: WebAssembly.Instance) => void) => {
      const instance = new WebAssembly.Instance(module, imports);
      done(instance);
      return instance.exports;
    },
    print: () => {},
    printErr: () => {},
  });
}

let decoder: Promise<Decoder> | undefined;
let encoder: Promise<Encoder> | undefined;
interface ResizeModule {
  default(module: WebAssembly.Module): Promise<unknown>;
  resize(pixels: Uint8Array, width: number, height: number, toWidth: number, toHeight: number, method: number, premultiply: boolean, linear: boolean): Uint8ClampedArray;
}

let resizer: Promise<ResizeModule> | undefined;

function codecs(): Promise<[Decoder, Encoder]> {
  decoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([loading(import('@jsquash/jpeg/codec/dec/mozjpeg_dec.js')), compile('jpegDecoder')]);
    return emscripten<Decoder>(factory, module);
  })();
  encoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([loading(import('@jsquash/jpeg/codec/enc/mozjpeg_enc.js')), compile('jpegEncoder')]);
    return emscripten<Encoder>(factory, module);
  })();
  decoder.catch(() => (decoder = undefined));
  encoder.catch(() => (encoder = undefined));
  return Promise.all([decoder, encoder]);
}

function resizeModule() {
  resizer ??= (async () => {
    const [lib, module] = await Promise.all([loading(import('@jsquash/resize/lib/resize/pkg/squoosh_resize.js') as Promise<ResizeModule>), compile('resizer')]);
    await lib.default(module);
    return lib;
  })();
  resizer.catch(() => (resizer = undefined));
  return resizer;
}

/** Fetches and compiles the codecs; nothing runs. */
export async function warmImageCodecs(): Promise<void> {
  await Promise.all([codecs(), resizeModule()]);
}

const name = (value: string) => PDFName.of(value);

function resolve(doc: PDFDocument, value: PDFObject | undefined): PDFObject | undefined {
  return value instanceof PDFRef ? doc.context.lookup(value) : value;
}

/** 1 or 3 when the colour space is one the encoder can write back as it is (grey or RGB), else null. */
function components(doc: PDFDocument, space: PDFObject | undefined): 1 | 3 | null {
  const value = resolve(doc, space);
  if (value === name('DeviceGray') || value === name('CalGray')) return 1;
  if (value === name('DeviceRGB') || value === name('CalRGB')) return 3;
  if (value instanceof PDFArray) {
    const family = resolve(doc, value.get(0));
    if (family === name('CalGray')) return 1;
    if (family === name('CalRGB')) return 3;
    if (family === name('ICCBased')) {
      const profile = resolve(doc, value.get(1));
      const n = profile instanceof PDFStream ? resolve(doc, profile.dict.get(name('N'))) : undefined;
      if (n instanceof PDFNumber && (n.asNumber() === 1 || n.asNumber() === 3)) return n.asNumber() as 1 | 3;
    }
  }
  return null;
}

/** Number of components in the JPEG's frame header, and whether an Adobe marker says YCCK/CMYK. */
function jpegComponents(bytes: Uint8Array): number | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1] as number;
    if (marker === 0xd9 || marker === 0xda) return null;
    const length = ((bytes[i + 2] as number) << 8) | (bytes[i + 3] as number);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      // A 12- or 16-bit frame is not 8-bit: precision is the byte after the length.
      if (bytes[i + 4] !== 8) return null;
      return bytes[i + 9] ?? null;
    }
    i += 2 + length;
  }
  return null;
}

export interface Candidate {
  ref: PDFRef;
  stream: PDFRawStream;
  width: number;
  height: number;
  gray: boolean;
}

/** The images Recommended may write again (see the head of the file for the rule). */
export function candidates(doc: PDFDocument): Candidate[] {
  const out: Candidate[] = [];
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const dict = object.dict;
    if (resolve(doc, dict.get(name('Subtype'))) !== name('Image')) continue;
    const filter = resolve(doc, dict.get(name('Filter')));
    const only = filter instanceof PDFArray ? (filter.size() === 1 ? resolve(doc, filter.get(0)) : null) : filter;
    if (only !== name('DCTDecode')) continue;
    const bits = resolve(doc, dict.get(name('BitsPerComponent')));
    if (!(bits instanceof PDFNumber) || bits.asNumber() !== 8) continue;
    if (dict.has(name('Decode')) || resolve(doc, dict.get(name('ImageMask')))?.toString() === 'true') continue;
    const space = components(doc, dict.get(name('ColorSpace')));
    const width = resolve(doc, dict.get(name('Width')));
    const height = resolve(doc, dict.get(name('Height')));
    if (!space || !(width instanceof PDFNumber) || !(height instanceof PDFNumber)) continue;
    if (width.asNumber() * height.asNumber() > MAX_IMAGE_PIXELS) continue;
    if (jpegComponents(object.getContents()) !== space) continue;
    out.push({ ref, stream: object, width: width.asNumber(), height: height.asNumber(), gray: space === 1 });
  }
  return out;
}

/** For each image used on a page (directly or in a form XObject), the largest visible page box that uses it, in points. */
export function pagesOfImages(doc: PDFDocument): Map<PDFRef, { width: number; height: number }> {
  const sizes = new Map<PDFRef, { width: number; height: number }>();
  const visit = (resources: PDFObject | undefined, page: { width: number; height: number }, seen: Set<PDFObject>, depth: number): void => {
    const dict = resolve(doc, resources);
    if (!(dict instanceof PDFDict) || seen.has(dict) || depth > 8) return;
    seen.add(dict);
    const xobjects = resolve(doc, dict.get(name('XObject')));
    if (!(xobjects instanceof PDFDict)) return;
    for (const [, value] of xobjects.entries()) {
      if (!(value instanceof PDFRef)) continue;
      const target = doc.context.lookup(value);
      if (!(target instanceof PDFStream)) continue;
      const subtype = resolve(doc, target.dict.get(name('Subtype')));
      if (subtype === name('Image')) {
        const known = sizes.get(value);
        sizes.set(value, { width: Math.max(known?.width ?? 0, page.width), height: Math.max(known?.height ?? 0, page.height) });
      } else if (subtype === name('Form')) {
        visit(target.dict.get(name('Resources')), page, seen, depth + 1);
      }
    }
  };
  for (const page of doc.getPages()) {
    const media = page.node.MediaBox();
    const box = boxOf(media ? media.asArray().map((item) => (item instanceof PDFNumber ? item.asNumber() : 0)) : [0, 0, 612, 792]);
    visit(page.node.Resources(), { width: box.width, height: box.height }, new Set(), 0);
  }
  return sizes;
}

/**
 * The size an image is reduced to: the smallest effective resolution it can have on its page (as large as the page
 * allows, in either orientation) brought down to RECOMMENDED_PPI, never enlarged.
 */
export function targetSize(width: number, height: number, page: { width: number; height: number } | undefined): { width: number; height: number } {
  if (!page || page.width <= 0 || page.height <= 0) return { width, height };
  const upright = Math.max(width / page.width, height / page.height);
  const turned = Math.max(width / page.height, height / page.width);
  const ppi = 72 * Math.min(upright, turned);
  if (ppi <= RECOMMENDED_PPI) return { width, height };
  const k = RECOMMENDED_PPI / ppi;
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)) };
}

/** Writes the candidates again; returns how many got smaller (the document is changed in place). */
export async function recompressImages(doc: PDFDocument): Promise<number> {
  const list = candidates(doc);
  if (list.length === 0) return 0;
  const [jpegDecoder, jpegEncoder] = await codecs();
  const pages = pagesOfImages(doc);
  let replaced = 0;
  for (const image of list) {
    const original = image.stream.getContents();
    const decoded = jpegDecoder.decode(original.slice().buffer as ArrayBuffer, false);
    if (!decoded) continue;
    let raster: Raster = { data: decoded.data, width: decoded.width, height: decoded.height };
    const target = targetSize(raster.width, raster.height, pages.get(image.ref));
    if (target.width !== raster.width || target.height !== raster.height) {
      const resize = await resizeModule();
      const pixels = new Uint8Array(raster.data.buffer, raster.data.byteOffset, raster.data.byteLength);
      raster = { data: new Uint8ClampedArray(resize.resize(pixels, raster.width, raster.height, target.width, target.height, 3, true, true)), width: target.width, height: target.height };
    }
    // color_space 1 is MozJPEG's GRAYSCALE, 3 its YCbCr: a grey image stays one component (/DeviceGray).
    const encoded = new Uint8Array(jpegEncoder.encode(raster.data, raster.width, raster.height, { ...MOZJPEG_DEFAULTS, quality: RECOMMENDED_QUALITY, color_space: image.gray ? 1 : 3 }));
    if (encoded.length >= original.length) continue;
    const dict = image.stream.dict.clone();
    dict.set(name('Width'), PDFNumber.of(raster.width));
    dict.set(name('Height'), PDFNumber.of(raster.height));
    dict.set(name('Length'), PDFNumber.of(encoded.length));
    dict.set(name('Filter'), name('DCTDecode'));
    dict.delete(name('DecodeParms'));
    doc.context.assign(image.ref, PDFRawStream.of(dict, encoded));
    replaced += 1;
  }
  return replaced;
}

