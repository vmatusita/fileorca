// Provisional image engine (DECISOES § 7): decode with createImageBitmap and save again from an
// OffscreenCanvas in the same format. Saving from a canvas writes no metadata, so EXIF and GPS
// are gone. The F2 swaps this file for the real engine (jSquash, libheif) behind the same API.
// Self-contained on purpose: nothing here imports from outside src/engine/image/ (lint rule).

export type Level = 'recommended' | 'strong';

export const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type SupportedType = (typeof SUPPORTED_TYPES)[number];

export const QUALITY: Record<Level, number> = { recommended: 0.82, strong: 0.6 };

export interface RecompressResult {
  /** The lighter copy, or the original when the copy would not be smaller. */
  blob: Blob;
  width: number;
  height: number;
  /** True when the original is handed back (no gain, or the browser cannot encode the type). */
  unchanged: boolean;
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
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
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
    output = await canvas.convertToBlob(type === 'image/png' ? { type } : { type, quality: QUALITY[level] });
  } catch {
    throw new EngineError('encode', 'the browser could not save this format');
  }
  onProgress(100);
  // A browser that cannot encode the type silently returns PNG: keep the original then.
  if (output.type !== type || output.size >= file.size) return { blob: file, width, height, unchanged: true };
  return { blob: output, width, height, unchanged: false };
}
