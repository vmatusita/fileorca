// RGBA helpers for the fixture generator. Everything here is plain integer math on pixel arrays, so
// it gives the same bytes on Windows and Ubuntu; only the drawing and the encoding go through Chromium.

export interface Rgba {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type Turn = 'cw' | 'ccw' | '180';

/** Turns the pixels by a multiple of 90 degrees. Exact: every output pixel is one input pixel. */
export function rotate(image: Rgba, turn: Turn): Rgba {
  const { width: w, height: h, data } = image;
  const swap = turn !== '180';
  const out = new Uint8ClampedArray(data.length);
  const ow = swap ? h : w;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const [nx, ny] = turn === 'cw' ? [h - 1 - y, x] : turn === 'ccw' ? [y, w - 1 - x] : [w - 1 - x, h - 1 - y];
      const from = (y * w + x) * 4;
      const to = (ny * ow + nx) * 4;
      out[to] = data[from] as number;
      out[to + 1] = data[from + 1] as number;
      out[to + 2] = data[from + 2] as number;
      out[to + 3] = data[from + 3] as number;
    }
  }
  return { width: swap ? h : w, height: swap ? w : h, data: out };
}

/**
 * Fades the photo out towards the border, in place. d is the normalised distance from the centre
 * (0 in the middle, 1 in the corners): fully opaque up to 0.45, half transparent around the edges'
 * middle, and fully transparent from 0.9 on, so the four corners are alpha 0 for sure.
 */
export function fadeToTransparent(image: Rgba): void {
  const { width: w, height: h, data } = image;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const smooth = (edge0: number, edge1: number, x: number): number => {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const d = Math.hypot((x - cx) / cx, (y - cy) / cy) / Math.SQRT2;
      const alpha = d <= 0.45 ? 1 : d >= 0.9 ? 0 : 1 - 0.75 * smooth(0.45, 0.8, d) - 0.25 * smooth(0.8, 0.9, d);
      data[(y * w + x) * 4 + 3] = Math.round(alpha * 255);
    }
  }
}

/** n x n grey thumbnail by area average (Rec. 601 luma), to compare a browser decode with the reference. */
export function grayThumbnail(image: Rgba, n: number): number[] {
  const { width: w, height: h, data } = image;
  const out: number[] = [];
  for (let ty = 0; ty < n; ty += 1) {
    for (let tx = 0; tx < n; tx += 1) {
      const x0 = Math.floor((tx * w) / n);
      const x1 = Math.max(x0 + 1, Math.floor(((tx + 1) * w) / n));
      const y0 = Math.floor((ty * h) / n);
      const y1 = Math.max(y0 + 1, Math.floor(((ty + 1) * h) / n));
      let sum = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const i = (y * w + x) * 4;
          sum += 0.299 * (data[i] as number) + 0.587 * (data[i + 1] as number) + 0.114 * (data[i + 2] as number);
        }
      }
      out.push(sum / ((x1 - x0) * (y1 - y0)));
    }
  }
  return out;
}

export function meanAbsDiff(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== b.length) throw new Error('thumbnails differ in size');
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs((a[i] as number) - (b[i] as number));
  return sum / a.length;
}

export const toBase64 = (bytes: Uint8Array | Uint8ClampedArray): string => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
export const fromBase64 = (text: string): Uint8Array => new Uint8Array(Buffer.from(text, 'base64'));
