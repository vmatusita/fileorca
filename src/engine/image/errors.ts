// The one error class of the engine: a failure with the reason the page will show. Everything the
// engine throws is turned into an EngineFailure at the edge (process.ts), so no error escapes.
// Self-contained: nothing here imports from outside src/engine/image/.

import type { FailureReason } from './types.ts';

export class EngineError extends Error {
  readonly reason: FailureReason;

  constructor(reason: FailureReason, message: string = reason) {
    super(message);
    this.name = 'EngineError';
    this.reason = reason;
  }
}

export function reasonOf(error: unknown, fallback: FailureReason): FailureReason {
  return error instanceof EngineError ? error.reason : fallback;
}
