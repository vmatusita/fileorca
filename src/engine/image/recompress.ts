// Provisional image engine (DECISOES § 7): decode with createImageBitmap and save again from an
// OffscreenCanvas in the same format. Saving from a canvas writes no metadata, so EXIF and GPS
// are gone. When the copy would not be smaller, the original pixels go back with the metadata
// stripped losslessly (strip.ts). The F2 swaps this engine (jSquash, libheif) behind the same API.
// Self-contained on purpose: nothing here imports from outside src/engine/image/ (lint rule).

import { stripMetadata } from './strip.ts';

export type Level = 'recommended' | 'strong';

export const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type SupportedType = (typeof SUPPORTED_TYPES)[number];

export const QUALITY: Record<Level, number> = { recommended: 0.82, strong: 0.6 };

export interface RecompressResult {
  /** The lighter copy, or the original pixels without metadata when the copy would not be smaller. */
  blob: Blob;
  width: number;
  height: number;
  /** smaller: new copy; no-gain: the copy would not be smaller; cannot-encode: this browser cannot save the type. */
  outcome: 'smaller' | 'no-gain' | 'cannot-encode';
}

export class EngineError extends Error {
  readonly reason: 'unsupported' | 'decode' | 'encode';

  constructor(reason: EngineError['reason'], message: string) {
    super(message);
    this.name = 'EngineError';
    this.reason = reason;
  }
}

export function isSupportedType(type: string): type is SupportedType {
  return (SUPPORTED_TYPES as readonly string[]).includes(type);
}

export type Progress = (percent: number) => void;

/** Workers need OffscreenCanvas; Safari before 16.4 (and Playwright's WebKit on Windows) lacks it. */
export function workerCanEncode(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

function makeCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function encode(canvas: OffscreenCanvas | HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  if ('convertToBlob' in canvas) return canvas.convertToBlob(quality === undefined ? { type } : { type, quality });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))), type, quality);
  });
}

export async function recompress(file: Blob, level: Level, onProgress: Progress = () => {}): Promise<RecompressResult> {
  const type = file.type;
  if (!isSupportedType(type)) throw new EngineError('unsupported', `type ${type || 'unknown'} is not supported`);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new EngineError('decode', 'the browser could not decode this file');
  }
  onProgress(40);
  const { width, height } = bitmap;
  const canvas = makeCanvas(width, height);
  const context = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new EngineError('encode', '2d context unavailable');
  if (type === 'image/jpeg') {
    // JPEG has no alpha: paint a white ground so transparent pixels do not turn black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  onProgress(70);
  let output: Blob;
  try {
    output = await encode(canvas, type, type === 'image/png' ? undefined : QUALITY[level]);
  } catch {
    throw new EngineError('encode', 'the browser could not save this format');
  }
  onProgress(100);
  // A browser that cannot encode the type silently returns PNG; a copy that is not smaller is
  // never handed out. In both cases the original goes back, without its metadata.
  if (output.type !== type || output.size >= file.size) {
    let stripped: { bytes: Uint8Array; type: string };
    try {
      stripped = stripMetadata(new Uint8Array(await file.arrayBuffer()));
    } catch {
      throw new EngineError('encode', 'could not remove the metadata of this file');
    }
    const outcome = output.type !== type ? 'cannot-encode' : 'no-gain';
    return { blob: new Blob([stripped.bytes as BlobPart], { type: stripped.type }), width, height, outcome };
  }
  return { blob: output, width, height, outcome: 'smaller' };
}
