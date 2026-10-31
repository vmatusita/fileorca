// A picture being worked on: either on a canvas (the native path, up to CANVAS_MAX_PIXELS) or as
// plain RGBA pixels (the path without a canvas, above that). The operations of the tools (crop,
// turn, scale, flatten) are the same on both, so process.ts does not care which one it holds.
// Every operation returns a NEW work and leaves the old one valid; the caller closes what it is
// done with, which zeroes the canvases so the memory goes back at once.
// Self-contained: nothing here imports from outside src/engine/image/.

import { EngineError } from './errors.ts';
import { clampBox, crop, flattenOnWhite, hasTransparency, spinMatrix, transform } from './pixels.ts';
import type { Raster, Spin } from './pixels.ts';
import type { Box } from './types.ts';

export interface Work {
  readonly width: number;
  readonly height: number;
  crop(box: Box): Promise<Work>;
  spin(spin: Spin): Promise<Work>;
  /** Scales to exactly width × height (shrinking by halves on a canvas, Lanczos3 on pixels). */
  scale(width: number, height: number): Promise<Work>;
  /** Paints transparent pixels white, in place. */
  flatten(): void;
  hasTransparency(): boolean;
  /** The RGBA pixels (read back from the canvas once and kept until the work changes). */
  raster(): Raster;
  /** The canvas's own encoder; null when this work has no canvas or the canvas refused. */
  nativeBlob(type: string, quality?: number): Promise<Blob | null>;
  close(): void;
}

type Canvas = OffscreenCanvas | HTMLCanvasElement;
type Context = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export function canvasAvailable(): boolean {
  return typeof OffscreenCanvas !== 'undefined' || typeof document !== 'undefined';
}

function makeCanvas(width: number, height: number): Canvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  if (typeof document === 'undefined') throw new EngineError('decode', 'no canvas in this worker');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function contextOf(canvas: Canvas): Context {
  const context = canvas.getContext('2d', { willReadFrequently: true }) as Context | null;
  if (!context) throw new EngineError('decode', '2d context unavailable');
  return context;
}

function release(canvas: Canvas): void {
  canvas.width = 0;
  canvas.height = 0;
}

export class CanvasWork implements Work {
  private cached: Raster | null = null;

  constructor(
    private canvas: Canvas,
    readonly width: number,
    readonly height: number,
  ) {}

  /** Takes over the bitmap (closes it) and draws it on a canvas of its own size. */
  static fromBitmap(bitmap: ImageBitmap): CanvasWork {
    const { width, height } = bitmap;
    try {
      const canvas = makeCanvas(width, height);
      contextOf(canvas).drawImage(bitmap, 0, 0);
      return new CanvasWork(canvas, width, height);
    } finally {
      bitmap.close();
    }
  }

  /** Puts pixels a WASM decoder returned on a canvas, so the native encoders and filters can take over. */
  static fromRaster(raster: Raster): CanvasWork {
    const canvas = makeCanvas(raster.width, raster.height);
    contextOf(canvas).putImageData(new ImageData(raster.data as Uint8ClampedArray<ArrayBuffer>, raster.width, raster.height), 0, 0);
    return new CanvasWork(canvas, raster.width, raster.height);
  }

  async crop(box: Box): Promise<Work> {
    const area = clampBox(box, this.width, this.height);
    const canvas = makeCanvas(area.width, area.height);
    contextOf(canvas).drawImage(this.canvas, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
    return new CanvasWork(canvas, area.width, area.height);
  }

  async spin(spin: Spin): Promise<Work> {
    const { matrix, width, height } = spinMatrix(spin, this.width, this.height);
    const canvas = makeCanvas(width, height);
    const context = contextOf(canvas);
    context.imageSmoothingEnabled = false; // whole-pixel moves only: nothing to smooth
    context.setTransform(...matrix);
    context.drawImage(this.canvas, 0, 0);
    return new CanvasWork(canvas, width, height);
  }

  async scale(width: number, height: number): Promise<Work> {
    // Browsers scale down with a box or bilinear filter that aliases above 2x, so shrink by halves.
    let current: Canvas = this.canvas;
    let currentWidth = this.width;
    let currentHeight = this.height;
    let owned = false;
    while (currentWidth !== width || currentHeight !== height) {
      const nextWidth = width < currentWidth ? Math.max(width, Math.ceil(currentWidth / 2)) : width;
      const nextHeight = height < currentHeight ? Math.max(height, Math.ceil(currentHeight / 2)) : height;
      const next = makeCanvas(nextWidth, nextHeight);
      const context = contextOf(next);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(current, 0, 0, currentWidth, currentHeight, 0, 0, nextWidth, nextHeight);
      if (owned) release(current);
      current = next;
      currentWidth = nextWidth;
      currentHeight = nextHeight;
      owned = true;
    }
    if (!owned) return this.crop({ x: 0, y: 0, width, height }); // same size: a copy
    return new CanvasWork(current, width, height);
  }

  flatten(): void {
    const context = contextOf(this.canvas);
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, this.width, this.height);
    context.globalCompositeOperation = 'source-over';
    this.cached = null;
  }

  hasTransparency(): boolean {
    return hasTransparency(this.raster());
  }

  raster(): Raster {
    this.cached ??= contextOf(this.canvas).getImageData(0, 0, this.width, this.height);
    return this.cached;
  }

  async nativeBlob(type: string, quality?: number): Promise<Blob | null> {
    const canvas = this.canvas;
    try {
      if ('convertToBlob' in canvas) return await canvas.convertToBlob(quality === undefined ? { type } : { type, quality });
      return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    } catch {
      return null;
    }
  }

  close(): void {
    this.cached = null;
    release(this.canvas);
  }
}

export class RasterWork implements Work {
  constructor(private pixels: Raster) {}

  get width(): number {
    return this.pixels.width;
  }

  get height(): number {
    return this.pixels.height;
  }

  async crop(box: Box): Promise<Work> {
    return new RasterWork(crop(this.pixels, box));
  }

  async spin(spin: Spin): Promise<Work> {
    return new RasterWork(transform(this.pixels, spin));
  }

  async scale(width: number, height: number): Promise<Work> {
    if (width === this.width && height === this.height) return new RasterWork(crop(this.pixels, { x: 0, y: 0, width, height }));
    const { resizeRaster } = await import('./codecs/resize.ts');
    return new RasterWork(await resizeRaster(this.pixels, width, height));
  }

  flatten(): void {
    flattenOnWhite(this.pixels);
  }

  hasTransparency(): boolean {
    return hasTransparency(this.pixels);
  }

  raster(): Raster {
    return this.pixels;
  }

  async nativeBlob(): Promise<Blob | null> {
    return null;
  }

  close(): void {
    this.pixels = { data: new Uint8ClampedArray(0), width: 0, height: 0 };
  }
}
