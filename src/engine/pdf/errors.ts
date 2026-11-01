// The one error class of the PDF engine: a failure with the reason the page will show. Every operation turns what it
// throws into a PdfFailure at the edge (worker.ts), so no error escapes to the page. The model of
// src/engine/image/errors.ts (DECISOES § 102 and § 104): code that did not load is 'load', never a damaged file.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import type { PdfFailure, PdfReason } from './types.ts';

export class PdfEngineError extends Error {
  readonly reason: PdfReason;

  constructor(reason: PdfReason, message: string = reason) {
    super(message);
    this.name = 'PdfEngineError';
    this.reason = reason;
  }
}

/** A promise for code the engine loads on first use (qpdf, PDF.js, a codec, a .wasm): failing to load it is 'load'. */
export async function loading<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    throw error instanceof PdfEngineError ? error : new PdfEngineError('load', 'the PDF engine could not load a part of itself');
  }
}

/** The failure for anything an operation threw: its own reason, or `fallback` for an error of a library. */
export function failureOf(error: unknown, fallback: PdfReason): PdfFailure {
  return { ok: false, reason: error instanceof PdfEngineError ? error.reason : fallback };
}
