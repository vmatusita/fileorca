// Image worker: the page talks to it through Comlink, so the main thread never decodes pixels.
// The page asks canvasInWorker() once. When it is false (Safari before 16.4, and the WebKit of
// Playwright on Windows) the page calls processImage from process.ts itself, on the main thread
// with a <canvas> (DECISOES § 22), and so do the WASM codecs it loads; only the ZIP and the codec warm-up
// still go to the worker in that case.
// The WASM codecs and the HEIF reader load inside process() when a file needs them, never here.
// The worker knows no .wasm URL until the page sends them: the first message must be configure() (Comlink delivers
// the messages in order, so the page can fire it and go on).
import { expose } from 'comlink';
import { warm } from './codecs/warm.ts';
import { configureWasm, type WasmUrls } from './codecs/wasm.ts';
import { processImage } from './process.ts';
import { zipStored } from './zip.ts';

// WebKit can evaluate this file twice in one worker (below), and the codecs loaded on demand import the engine's helpers
// (where the .wasm files are, the load error) from the entry, so they run against the second copy. The URLs the page sends
// to the first copy are kept on the global scope too, and a second copy takes them when it starts (DECISOES § 172).
const SCOPE = globalThis as unknown as Record<symbol, unknown>;
const EXPOSED = Symbol.for('fileorca.image-engine.exposed');
const URLS = Symbol.for('fileorca.image-engine.wasm-urls');

function configure(urls: Partial<WasmUrls>): void {
  SCOPE[URLS] = { ...(SCOPE[URLS] as Partial<WasmUrls> | undefined), ...urls };
  configureWasm(urls);
}

const api = {
  /** One file through one operation. Never rejects: failures come back as { ok: false, reason }. */
  process: processImage,
  /** A stored ZIP of the outputs of a batch, built from Blobs without recompressing them. */
  zip: zipStored,
  /** Fetches and compiles codecs ahead of the first file (pointer over the zone, focus on the button). */
  warm,
  /** Where the .wasm files are (strings: a URL object does not cross the worker boundary). */
  configure,
  canvasInWorker: async () => typeof OffscreenCanvas !== 'undefined',
};

export type ImageEngineApi = typeof api;

// Once per worker. WebKit evaluates the entry script of a worker a second time when a chunk the worker loads on demand (a
// codec) imports from it, as the bundler makes the codec chunks do for its CommonJS helper: every module of this file then
// exists twice in the same worker, and a second expose() would run every call again (DECISOES § 172). The copy that answers
// is the one that came first; the second one only learns where the .wasm files are.
if (!SCOPE[EXPOSED]) {
  SCOPE[EXPOSED] = true;
  expose(api);
} else if (SCOPE[URLS]) {
  configureWasm(SCOPE[URLS] as Partial<WasmUrls>);
}
