// libwebp through jSquash. The decoder serves photos above the canvas limit; the encoder writes
// the WebP of Compress and of the browsers whose canvas.toBlob returns something else (Safari).
// Only the SIMD encoder is imported: the package's encode.js would also bundle the non-SIMD build
// and a feature probe, and SIMD is in every browser the site supports (Safari 16.4+, Chrome 91+).
// Self-contained: nothing here imports from outside src/engine/image/.

import { defaultOptions } from '@jsquash/webp/meta.js';
import decoderWasm from '@jsquash/webp/codec/dec/webp_dec.wasm?url';
import encoderWasm from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url';
import type { Raster } from '../pixels.ts';
import { loading } from '../errors.ts';
import { compiled, copyOut, startEmscripten } from './runtime.ts';

interface Decoder {
  decode(data: ArrayBuffer): Raster | null;
}

interface Encoder {
  encode(data: Uint8ClampedArray, width: number, height: number, options: object): Uint8Array | null;
}

// The 30-byte module wasm-feature-detect uses to ask for 128-bit SIMD.
const SIMD_PROBE = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);

export function webpEncoderSupported(): boolean {
  try {
    return WebAssembly.validate(SIMD_PROBE);
  } catch {
    return false;
  }
}

let decoder: Promise<Decoder> | undefined;
let encoder: Promise<Encoder> | undefined;

function decoderModule(): Promise<Decoder> {
  decoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([loading(import('@jsquash/webp/codec/dec/webp_dec.js')), compiled(decoderWasm)]);
    return startEmscripten<Decoder>(factory, module);
  })();
  decoder.catch(() => (decoder = undefined));
  return decoder;
}

function encoderModule(): Promise<Encoder> {
  encoder ??= (async () => {
    if (!webpEncoderSupported()) throw new Error('this browser has no WebAssembly SIMD for the WebP encoder');
    const [{ default: factory }, module] = await Promise.all([loading(import('@jsquash/webp/codec/enc/webp_enc_simd.js')), compiled(encoderWasm)]);
    return startEmscripten<Encoder>(factory, module);
  })();
  encoder.catch(() => (encoder = undefined));
  return encoder;
}

/** Downloads and compiles the encoder (the decoder is only for photos above the canvas limit); nothing runs. */
export async function warmWebp(): Promise<void> {
  if (!webpEncoderSupported()) return;
  await Promise.all([loading(import('@jsquash/webp/codec/enc/webp_enc_simd.js')), compiled(encoderWasm)]);
}

/** Still WebP to pixels. Animated WebP throws (the native path reads its first frame). */
export async function decodeWebp(buffer: ArrayBuffer): Promise<Raster> {
  const module = await decoderModule();
  const image = module.decode(buffer);
  if (!image) throw new Error('webp decode failed');
  return image;
}

/** WebP at the given quality (1 to 100), alpha kept. The output carries no metadata. */
export async function encodeWebp(image: Raster, quality: number): Promise<Uint8Array> {
  const module = await encoderModule();
  const out = module.encode(image.data, image.width, image.height, { ...defaultOptions, quality });
  if (!out) throw new Error('webp encode failed');
  return copyOut(out);
}
