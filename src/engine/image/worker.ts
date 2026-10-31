// Image worker: the page talks to it through Comlink, so the main thread never decodes pixels.
// The page asks canvasInWorker() once. When it is false (Safari before 16.4, and the WebKit of
// Playwright on Windows) the page calls processImage from process.ts itself, on the main thread
// with a <canvas> (DECISOES § 22), and so do the WASM codecs it loads; only the ZIP and the codec warm-up
// still go to the worker in that case.
// The WASM codecs and the HEIF reader load inside process() when a file needs them, never here.
import { expose } from 'comlink';
import { warm } from './codecs/warm.ts';
import { processImage } from './process.ts';
import { zipStored } from './zip.ts';

const api = {
  /** One file through one operation. Never rejects: failures come back as { ok: false, reason }. */
  process: processImage,
  /** A stored ZIP of the outputs of a batch, built from Blobs without recompressing them. */
  zip: zipStored,
  /** Fetches and compiles codecs ahead of the first file (pointer over the zone, focus on the button). */
  warm,
  canvasInWorker: async () => typeof OffscreenCanvas !== 'undefined',
};

export type ImageEngineApi = typeof api;

expose(api);
