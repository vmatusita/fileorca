// MozJPEG and the Lanczos resize of jSquash in Node, for the PDF fixtures with photos (scripts/fixtures/pdf.ts): the
// single-thread glue of each codec with its .wasm read from disk, the shape avif.ts uses. Deterministic: the same
// WebAssembly gives the same bytes on every machine.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defaultOptions } from '@jsquash/jpeg/meta.js';
import decoderGlue from '@jsquash/jpeg/codec/dec/mozjpeg_dec.js';
import encoderGlue from '@jsquash/jpeg/codec/enc/mozjpeg_enc.js';
import { initEmscriptenModule } from '@jsquash/jpeg/utils.js';
import initResize, { resize } from '@jsquash/resize/lib/resize/pkg/squoosh_resize.js';
import type { Rgba } from './rgba.ts';

const require = createRequire(import.meta.url);
const compile = (specifier: string): Promise<WebAssembly.Module> => WebAssembly.compile(readFileSync(require.resolve(specifier)));

interface Decoder {
  decode(data: ArrayBuffer, preserveOrientation: boolean): { data: Uint8ClampedArray; width: number; height: number } | null;
}
interface Encoder {
  encode(data: Uint8ClampedArray, width: number, height: number, options: object): Uint8Array;
}

let decoder: Promise<Decoder> | undefined;
let encoder: Promise<Encoder> | undefined;
let resizer: Promise<unknown> | undefined;

/** Decodes a JPEG; `upright` applies its Exif Orientation. */
export async function decodeJpegNode(bytes: Uint8Array, upright = true): Promise<Rgba> {
  decoder ??= compile('@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm').then((wasm) => initEmscriptenModule(decoderGlue, wasm) as Promise<Decoder>);
  const copy = bytes.slice().buffer as ArrayBuffer;
  const image = (await decoder).decode(copy, upright);
  if (!image) throw new Error('jpeg decode failed');
  return { data: new Uint8ClampedArray(image.data), width: image.width, height: image.height };
}

/** MozJPEG at `quality`, baseline or progressive; `gray` writes a one-component JPEG. No metadata. */
export async function encodeJpegNode(image: Rgba, quality: number, options: { gray?: boolean } = {}): Promise<Uint8Array> {
  encoder ??= compile('@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm').then((wasm) => initEmscriptenModule(encoderGlue, wasm) as Promise<Encoder>);
  // color_space 1 is MozJpegColorSpace.GRAYSCALE, 3 is YCbCr (the default).
  const bytes = (await encoder).encode(image.data, image.width, image.height, { ...defaultOptions, quality, color_space: options.gray ? 1 : 3 });
  return new Uint8Array(bytes);
}

/** Lanczos3 to exactly width × height. */
export async function resizeNode(image: Rgba, width: number, height: number): Promise<Rgba> {
  resizer ??= compile('@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm').then((wasm) => initResize(wasm));
  await resizer;
  const pixels = new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength);
  return { data: new Uint8ClampedArray(resize(pixels, image.width, image.height, width, height, 3, true, true)), width, height };
}
