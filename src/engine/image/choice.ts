// The two pure decisions of the decoding path, kept apart from the decoders so a Vitest can run
// them with fake decoders (DECISOES § 7).
//   1. Canvas or not, by pixel count alone: the same in every browser, so both paths run in the
//      Chromium and WebKit of the test matrix. The limit is the Safari canvas area on the iPhone.
//   2. HEIC (and AVIF): the browser's own decoder is accepted only when it returns the size the
//      container declares (ispe with irot, imir and clap). A browser that skips the rotation, or
//      applies the Exif Orientation on top of it, gives other dimensions and is not trusted.
// Self-contained: nothing here imports from outside src/engine/image/.

import { CANVAS_MAX_PIXELS, WASM_MAX_PIXELS } from './types.ts';

export type DecodePath = 'canvas' | 'wasm';

/** Up to and including CANVAS_MAX_PIXELS (4096 × 4096) is the canvas; one pixel more is not. */
export function decodePath(width: number, height: number): DecodePath {
  return width * height <= CANVAS_MAX_PIXELS ? 'canvas' : 'wasm';
}

/** More pixels than the no-canvas path can hold in memory: the file is refused before any decoder runs. */
export function beyondDecoding(width: number, height: number): boolean {
  return width * height > WASM_MAX_PIXELS;
}

export interface Sized {
  width: number;
  height: number;
}

export interface Decoders<T extends Sized> {
  /** The browser's decoder (createImageBitmap). May reject when the browser cannot read the format. */
  native: () => Promise<T>;
  /** The WASM decoder (libheif, jSquash AVIF). */
  wasm: () => Promise<T>;
  /** Frees a native result that was not used. */
  discard?: (value: T) => void;
}

export interface Decision<T> {
  via: 'native' | 'wasm';
  value: T;
}

export async function nativeIfSizeMatches<T extends Sized>(expected: Sized, decoders: Decoders<T>): Promise<Decision<T>> {
  let native: T | undefined;
  try {
    native = await decoders.native();
  } catch {
    native = undefined;
  }
  if (native && native.width === expected.width && native.height === expected.height) return { via: 'native', value: native };
  if (native) decoders.discard?.(native);
  return { via: 'wasm', value: await decoders.wasm() };
}
