// OxiPNG through jSquash: lossless PNG recompression. Compress runs it on the file's own bytes
// (after strip.ts removed the text and Exif chunks, because optimise() keeps every chunk it is
// given); a PNG written from pixels uses optimise_raw, which writes only IHDR, IDAT and IEND.
// Only codec/pkg (one thread) is imported: optimise.js would also bundle pkg-parallel, the rayon
// build that needs SharedArrayBuffer (DECISOES § 7).
// Self-contained: nothing here imports from outside src/engine/image/.

import init, { optimise, optimise_raw } from '@jsquash/oxipng/codec/pkg/squoosh_oxipng.js';
import wasmUrl from '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm?url';
import type { Raster } from '../pixels.ts';
import { compiled, copyOut } from './runtime.ts';

let ready: Promise<unknown> | undefined;

function start(): Promise<unknown> {
  ready ??= compiled(wasmUrl).then((module) => init(module));
  ready.catch(() => (ready = undefined));
  return ready;
}

/** Downloads and compiles the module; nothing runs. */
export async function warmPng(): Promise<void> {
  await compiled(wasmUrl);
}

/** Recompresses PNG bytes without loss. Ancillary chunks in the input stay: strip first. */
export async function optimisePng(bytes: Uint8Array, level: number): Promise<Uint8Array> {
  await start();
  return copyOut(optimise(bytes, level, false, false));
}

/** Writes a PNG from RGBA pixels (alpha kept, nothing else). */
export async function encodePng(image: Raster, level: number): Promise<Uint8Array> {
  await start();
  return copyOut(optimise_raw(image.data, image.width, image.height, level, false, false));
}
