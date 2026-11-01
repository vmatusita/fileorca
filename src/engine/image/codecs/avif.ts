// libavif and libaom through jSquash. The encoder is the only AVIF writer (no browser exposes one
// through canvas); the decoder serves AVIF to JPG when createImageBitmap cannot read the file or the
// picture is above the canvas limit.
// Only avif_enc.js, the single-thread build, is imported: the package's encode.js also imports
// avif_enc_mt.js, its 3.5 MB wasm and a worker file, and the SharedArrayBuffer probe (DECISOES § 7).
// Self-contained: nothing here imports from outside src/engine/image/.

import { defaultOptions } from '@jsquash/avif/meta.js';
import type { Raster } from '../pixels.ts';
import { loading } from '../errors.ts';
import { compiled, copyOut, startEmscripten } from './runtime.ts';
import { wasmUrl } from './wasm.ts';

/**
 * Encoder effort: 0 is the slowest and smallest, 10 the fastest. Measured on a Ryzen 5 7600X with a
 * 12 MP photo (3024 × 4032) in Node; the Chromium and WebKit workers matched Node within 10 % at
 * speeds 10, 8 and 6:
 *   speed 10: 1.3 s (q50), 0.8 s (q35)   same bytes as 9
 *   speed  9: 0.9 s (q50), 0.8 s (q35)   632,681 bytes at q50
 *   speed  8: 2.5 s (q50), 1.9 s (q35)   600,699 bytes at q50 (5 % smaller)
 *   speed  7: 4.7 s,                     speed 6 (the library default): 9.4 s
 * A notebook is 2 to 4 times slower, the CI runner about 5 times. Speed 9 keeps a 12 MP photo at 2 to
 * 4 s on a notebook and a batch of twenty under a minute; speed 8 would cost 2.7 times the time for 5 %
 * fewer bytes.
 */
export const AVIF_SPEED = 9;

interface Decoder {
  decode(data: ArrayBuffer, bitDepth: 8): Raster | null;
}

interface Encoder {
  encode(data: Uint8Array, width: number, height: number, options: object): Uint8Array | null;
}

let decoder: Promise<Decoder> | undefined;
let encoder: Promise<Encoder> | undefined;

function decoderModule(): Promise<Decoder> {
  decoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([loading(import('@jsquash/avif/codec/dec/avif_dec.js')), compiled(wasmUrl('avifDecoder'))]);
    return startEmscripten<Decoder>(factory, module);
  })();
  decoder.catch(() => (decoder = undefined));
  return decoder;
}

function encoderModule(): Promise<Encoder> {
  encoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([loading(import('@jsquash/avif/codec/enc/avif_enc.js')), compiled(wasmUrl('avifEncoder'))]);
    return startEmscripten<Encoder>(factory, module);
  })();
  encoder.catch(() => (encoder = undefined));
  return encoder;
}

/** Downloads and compiles both codecs (JS glue and .wasm); nothing runs. */
export async function warmAvif(): Promise<void> {
  await Promise.all([import('@jsquash/avif/codec/dec/avif_dec.js'), import('@jsquash/avif/codec/enc/avif_enc.js'), compiled(wasmUrl('avifDecoder')), compiled(wasmUrl('avifEncoder'))]);
}

/** AVIF (8-bit) to pixels. */
export async function decodeAvif(buffer: ArrayBuffer): Promise<Raster> {
  const module = await decoderModule();
  const image = module.decode(buffer, 8);
  if (!image) throw new Error('avif decode failed');
  return image;
}

/** AVIF at the given quality (0 to 100, higher is better), alpha kept, 4:2:0. No metadata is written. */
export async function encodeAvif(image: Raster, quality: number): Promise<Uint8Array> {
  const module = await encoderModule();
  // The package's own encode() passes new Uint8Array(data.buffer) and ignores the byte offset; this does not.
  const pixels = new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength);
  const out = module.encode(pixels, image.width, image.height, { ...defaultOptions, quality, speed: AVIF_SPEED });
  if (!out) throw new Error('avif encode failed');
  return copyOut(out);
}
