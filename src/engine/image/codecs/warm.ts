// Fetches and compiles codecs ahead of the first file, when the pointer enters the drop zone or the
// button gets focus. It only downloads and compiles: nothing is decoded or encoded, and a codec
// that is never used costs no bytes. Each kind is its own dynamic import, so the loaders stay
// out of the worker's first chunk.
// Self-contained: nothing here imports from outside src/engine/image/.

import type { WarmKind } from '../types.ts';

const WARMERS: Record<WarmKind, () => Promise<void>> = {
  jpeg: async () => (await import('./jpeg.ts')).warmJpeg(),
  webp: async () => (await import('./webp.ts')).warmWebp(),
  avif: async () => (await import('./avif.ts')).warmAvif(),
  png: async () => (await import('./png.ts')).warmPng(),
  resize: async () => (await import('./resize.ts')).warmResize(),
  heic: async () => (await import('./heic.ts')).warmHeic(),
};

/** Resolves when every kind is ready; a failure is swallowed, the real use will try again and report it. */
export async function warm(kinds: readonly WarmKind[]): Promise<void> {
  await Promise.all(kinds.map((kind) => WARMERS[kind]().catch(() => {})));
}
