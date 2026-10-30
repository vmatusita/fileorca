// Image worker: the page talks to it through Comlink, so the main thread never decodes pixels.
import { expose } from 'comlink';
import { EngineError, recompress, type Level, type Progress } from './recompress.ts';

export interface EngineFailure {
  ok: false;
  reason: EngineError['reason'];
}

const api = {
  async compress(file: Blob, level: Level, onProgress: Progress) {
    try {
      const result = await recompress(file, level, onProgress);
      return { ok: true as const, ...result };
    } catch (error) {
      // Errors cross the worker boundary as plain data.
      const reason = error instanceof EngineError ? error.reason : 'decode';
      return { ok: false as const, reason } satisfies EngineFailure;
    }
  },
};

export type EngineApi = typeof api;

expose(api);
