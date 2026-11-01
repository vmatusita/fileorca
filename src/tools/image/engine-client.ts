// The page's door to the image engine. Loaded only when the first image arrives (or when the pointer
// enters the drop zone), so Comlink and the worker stay out of the initial JS of the tool pages.
// The worker is created on first use. When it has no OffscreenCanvas (Safari before 16.4, and the
// WebKit of Playwright on Windows), the same engine runs on the page with a <canvas> (DECISOES § 22);
// the ZIP and the codecs warm-up still go to the worker. Calls never reject for a bad file: that comes
// back as { ok: false, reason }. Only a worker that cannot start is turned into the page path.
//
// This is the only place that knows the bundler: the engine imports no .wasm (so it is the same code in the exported
// package), and the files are named here, once, with Vite's `?url` (the file is copied unchanged and the import gives
// its address). The worker gets the addresses by its first message; the page path sets them on the engine it loads.
// The file stays out of the 'island' chunk (astro.config.ts), so the addresses cost the initial JS nothing.
// The same engine is exported as an open source package (pnpm motor:exportar; DECISOES § F5a-motor-aberto).
import { proxy, wrap, type Remote } from 'comlink';
import avifDecoder from '@jsquash/avif/codec/dec/avif_dec.wasm?url';
import avifEncoder from '@jsquash/avif/codec/enc/avif_enc.wasm?url';
import jpegDecoder from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url';
import jpegEncoder from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import oxipng from '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm?url';
import resize from '@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url';
import webpDecoder from '@jsquash/webp/codec/dec/webp_dec.wasm?url';
import webpEncoder from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url';
import heif from 'libheif-js/libheif-wasm/libheif.wasm?url';
import type { WasmUrls } from '../../engine/image/codecs/wasm.ts';
import type { ImageEngineApi } from '../../engine/image/worker.ts';
import type { EngineResult, ImageFormat, Operation, Progress, WarmKind } from '../../engine/image/types.ts';
import type { ZipEntry } from '../../engine/image/zip.ts';

/** Strings, because only strings cross to the worker. */
const WASM: Record<keyof WasmUrls, string> = { avifDecoder, avifEncoder, heif, jpegDecoder, jpegEncoder, oxipng, resize, webpDecoder, webpEncoder };

interface Engine {
  api: Remote<ImageEngineApi>;
  /** Rejects when the worker script fails to load or throws at the top level. */
  broken: Promise<never>;
  canvas: Promise<boolean>;
}

let engine: Engine | null = null;
let failed = false;

function start(): Engine {
  const worker = new Worker(new URL('../../engine/image/worker.ts', import.meta.url), { type: 'module', name: 'fileorca-image' });
  const api = wrap<ImageEngineApi>(worker);
  const broken = new Promise<never>((_, reject) => {
    worker.addEventListener('error', () => {
      failed = true;
      reject(new Error('the image worker failed'));
    });
  });
  broken.catch(() => {});
  // First message: the worker handles messages in order, so every call after this one finds the addresses set.
  void api.configure(WASM).catch(() => {});
  return { api, broken, canvas: api.canvasInWorker().catch(() => false) };
}

function current(): Engine | null {
  if (failed) return null;
  try {
    engine ??= start();
  } catch {
    failed = true;
  }
  return engine;
}

async function onPage(file: Blob, op: Operation, accepts: readonly ImageFormat[], onProgress: Progress): Promise<EngineResult> {
  const { processImage, configureWasm } = await import('../../engine/image/process.ts');
  configureWasm(WASM);
  return processImage(file, op, accepts, onProgress);
}

/** One file through one operation: in the worker, or on the page when the worker has no canvas. */
export async function processFile(file: Blob, op: Operation, accepts: readonly ImageFormat[], onProgress: Progress): Promise<EngineResult> {
  const worker = current();
  if (!worker || !(await Promise.race([worker.canvas, worker.broken.catch(() => false)]))) return onPage(file, op, accepts, onProgress);
  try {
    return await Promise.race([worker.api.process(file, op, accepts, proxy(onProgress)), worker.broken]);
  } catch {
    return onPage(file, op, accepts, onProgress);
  }
}

/** A stored ZIP of the outputs, built by the worker without recompressing anything. */
export async function zipFiles(entries: readonly ZipEntry[]): Promise<Blob> {
  const worker = current();
  if (worker) {
    try {
      return await Promise.race([worker.api.zip([...entries]), worker.broken]);
    } catch {
      // the worker could not start: the page builds it
    }
  }
  const { zipStored } = await import('../../engine/image/zip.ts');
  return zipStored(entries);
}

/**
 * Fetches the codecs a tool will need before the first file arrives. Never throws. A worker without OffscreenCanvas
 * does no image work (the page path loads its own copy of each codec), so it fetches nothing for nothing (review
 * e-01, DECISOES § 102).
 */
export function warm(kinds: readonly WarmKind[]): void {
  const worker = current();
  if (!worker) return;
  void (async () => {
    if (await Promise.race([worker.canvas, worker.broken.catch(() => false)])) await worker.api.warm([...kinds]);
  })().catch(() => {});
}
