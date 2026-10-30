// Loaded only when the first image arrives, so Comlink and the worker stay out of the initial JS.
import { proxy, wrap, type Remote } from 'comlink';
import type { EngineApi } from '../../engine/image/worker.ts';
import type { Level } from '../../engine/image/recompress.ts';

let remote: Remote<EngineApi> | null = null;

function engine(): Remote<EngineApi> {
  remote ??= wrap<EngineApi>(
    new Worker(new URL('../../engine/image/worker.ts', import.meta.url), { type: 'module', name: 'fileorca-image' }),
  );
  return remote;
}

export function compress(file: Blob, level: Level, onProgress: (percent: number) => void) {
  return engine().compress(file, level, proxy(onProgress));
}
