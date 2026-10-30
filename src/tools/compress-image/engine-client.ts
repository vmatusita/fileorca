// Loaded only when the first image arrives, so Comlink and the worker stay out of the initial JS.
// When the worker has no OffscreenCanvas (Safari before 16.4), the same engine runs on the page
// with a <canvas> (DECISOES § 22).
import { proxy, wrap, type Remote } from 'comlink';
import type { EngineApi } from '../../engine/image/worker.ts';
import { EngineError, recompress, type Level, type RecompressResult } from '../../engine/image/recompress.ts';

let remote: Remote<EngineApi> | null = null;
let mainThread = false;

function engine(): Remote<EngineApi> {
  remote ??= wrap<EngineApi>(
    new Worker(new URL('../../engine/image/worker.ts', import.meta.url), { type: 'module', name: 'fileorca-image' }),
  );
  return remote;
}

export type CompressOutcome = ({ ok: true } & RecompressResult) | { ok: false; reason: EngineError['reason'] };

async function onPage(file: Blob, level: Level, onProgress: (percent: number) => void): Promise<CompressOutcome> {
  try {
    return { ok: true, ...(await recompress(file, level, onProgress)) };
  } catch (error) {
    return { ok: false, reason: error instanceof EngineError ? error.reason : 'decode' };
  }
}

export async function compress(file: Blob, level: Level, onProgress: (percent: number) => void): Promise<CompressOutcome> {
  if (mainThread) return onPage(file, level, onProgress);
  const outcome = await engine().compress(file, level, proxy(onProgress));
  if (!outcome.ok && outcome.reason === 'no-canvas') {
    mainThread = true;
    return onPage(file, level, onProgress);
  }
  return outcome as CompressOutcome;
}
