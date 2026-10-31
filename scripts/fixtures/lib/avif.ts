// AVIF for the fixtures, from the jSquash encoder in Node. The package entry point would pick its
// multi-thread build in a browser; here we import the single-thread glue directly and give it the
// wasm read from disk, which is the same shape the engine uses in the worker.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defaultOptions } from '@jsquash/avif/meta.js';
import encoderGlue from '@jsquash/avif/codec/enc/avif_enc.js';
import { initEmscriptenModule } from '@jsquash/avif/utils.js';
import type { Rgba } from './rgba.ts';

export async function encodeAvif(image: Rgba, options: { quality: number; speed: number }): Promise<Uint8Array> {
  const wasmPath = createRequire(import.meta.url).resolve('@jsquash/avif/codec/enc/avif_enc.wasm');
  const wasm = await WebAssembly.compile(readFileSync(wasmPath));
  const encoder = await initEmscriptenModule(encoderGlue, wasm);
  const bytes = encoder.encode(new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength), image.width, image.height, {
    ...defaultOptions,
    ...options,
  });
  if (!bytes) throw new Error('AVIF encoder returned nothing');
  return bytes;
}
