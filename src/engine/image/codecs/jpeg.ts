// MozJPEG through jSquash: the decoder is for photos above the canvas limit (it applies the Exif
// Orientation itself), the encoder is the one that writes the smaller JPEG for Compress, the target
// size and the cover. Both load on first use, each its own chunk and its own .wasm.
// Self-contained: nothing here imports from outside src/engine/image/.

import { defaultOptions } from '@jsquash/jpeg/meta.js';
import decoderWasm from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url';
import encoderWasm from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import type { Raster } from '../pixels.ts';
import { compiled, copyOut, startEmscripten } from './runtime.ts';

interface Decoder {
  decode(data: ArrayBuffer, preserveOrientation: boolean): Raster | null;
}

interface Encoder {
  encode(data: Uint8ClampedArray, width: number, height: number, options: object): Uint8Array;
}

let decoder: Promise<Decoder> | undefined;
let encoder: Promise<Encoder> | undefined;
let warnings: string[] = [];

function decoderModule(): Promise<Decoder> {
  decoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([import('@jsquash/jpeg/codec/dec/mozjpeg_dec.js'), compiled(decoderWasm)]);
    return startEmscripten<Decoder>(factory, module, { printErr: (message) => warnings.push(message) });
  })();
  decoder.catch(() => (decoder = undefined));
  return decoder;
}

function encoderModule(): Promise<Encoder> {
  encoder ??= (async () => {
    const [{ default: factory }, module] = await Promise.all([import('@jsquash/jpeg/codec/enc/mozjpeg_enc.js'), compiled(encoderWasm)]);
    return startEmscripten<Encoder>(factory, module);
  })();
  encoder.catch(() => (encoder = undefined));
  return encoder;
}

/** Downloads and compiles both codecs (JS glue and .wasm); nothing runs. */
export async function warmJpeg(): Promise<void> {
  await Promise.all([import('@jsquash/jpeg/codec/dec/mozjpeg_dec.js'), import('@jsquash/jpeg/codec/enc/mozjpeg_enc.js'), compiled(decoderWasm), compiled(encoderWasm)]);
}

export interface DecodedJpeg {
  image: Raster;
  /** libjpeg reported "Premature end of JPEG file": the data stops before the image does. */
  truncated: boolean;
}

/** Decodes a JPEG and applies its Exif Orientation, so the pixels are upright. */
export async function decodeJpeg(buffer: ArrayBuffer): Promise<DecodedJpeg> {
  const module = await decoderModule();
  warnings = [];
  const image = module.decode(buffer, true); // true: apply the Orientation tag (jSquash calls it preserveOrientation)
  if (!image) throw new Error('jpeg decode failed');
  return { image, truncated: warnings.some((message) => /premature end/i.test(message)) };
}

/** Progressive MozJPEG at the given quality (1 to 100). The output carries no metadata. */
export async function encodeJpeg(image: Raster, quality: number): Promise<Uint8Array> {
  const module = await encoderModule();
  return copyOut(module.encode(image.data, image.width, image.height, { ...defaultOptions, quality, progressive: true }));
}
