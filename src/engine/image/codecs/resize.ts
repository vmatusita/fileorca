// Lanczos3 resizing through jSquash, for the path without a canvas (photos above CANVAS_MAX_PIXELS).
// Only lib/resize/pkg is imported: the package index also bundles hqx and magic-kernel, 150 KB of
// wasm this site never calls.
// Self-contained: nothing here imports from outside src/engine/image/.

import init, { resize } from '@jsquash/resize/lib/resize/pkg/squoosh_resize.js';
import wasmUrl from '@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url';
import type { Raster } from '../pixels.ts';
import { compiled } from './runtime.ts';

const LANCZOS3 = 3; // index in ['triangle', 'catrom', 'mitchell', 'lanczos3']

let ready: Promise<unknown> | undefined;

function start(): Promise<unknown> {
  ready ??= compiled(wasmUrl).then((module) => init(module));
  ready.catch(() => (ready = undefined));
  return ready;
}

/** Downloads and compiles the module; nothing runs. */
export async function warmResize(): Promise<void> {
  await compiled(wasmUrl);
}

/** Scales a picture to exactly width × height. Premultiplied alpha and linear light, as jSquash defaults. */
export async function resizeRaster(src: Raster, width: number, height: number): Promise<Raster> {
  await start();
  const pixels = new Uint8Array(src.data.buffer, src.data.byteOffset, src.data.byteLength);
  return { data: resize(pixels, src.width, src.height, width, height, LANCZOS3, true, true), width, height };
}
