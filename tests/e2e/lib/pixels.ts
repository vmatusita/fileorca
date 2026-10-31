// Pixel checks for the browser tests: decode bytes in the page and compare small thumbnails.
//
// HOW THE ORIENTATION CHECK MUST BE USED (read this before writing one)
//
//   1. The output of the tools has no Orientation tag, so its raw pixels ARE the picture on screen.
//      Decode it with `browserThumbnail` and compare as it is. Never apply an orientation to it.
//   2. The reference is built from the fixture's STORED pixels plus the orientation of the fixture,
//      applied exactly once, here in Node:
//        stored   = await thumbnail(page, withOrientation(fixtureBytes, 1))   // jpeg.ts patches the tag
//        upright  = orientThumbnail(stored.gray, stored.size, tag)             // tag from jpeg.ts orientation()
//        output   = await thumbnail(page, outputBytes)
//        expect(meanAbsDiff(output.gray, upright)).toBeLessThan(LIMIT)
//      The tag-1 copy is needed because Chromium and WebKit apply the Exif Orientation themselves when
//      they decode, and `imageOrientation: 'none'` does not turn that off (it is a legacy alias of
//      'from-image' in both: measured). Decode the copy with the tag at 1 and you get the stored pixels.
//   3. Applying the orientation to a browser decode that already applied it turns the picture twice:
//      jpg-03 (180) comes out upright by luck of symmetry in size, and 6 and 8 come out lying down.
//      The fixtures that expose it are gen-jpg-01-orientacao6, gen-jpg-02-orientacao8 and jpg-03.
//   4. HEIC is not decodable by Chromium. For heic-05 and heic-09 (container irot 270 plus Exif
//      Orientation 6) compare dimensions (3024x4032), which a double rotation gets wrong; see bmff.ts.
//
// Thumbnails are n x n grids of area averages over the WHOLE image, stretched, so they do not depend
// on the image size, and turning or flipping the image turns or flips the grid the same way. That is
// what lets the reference be built from the stored thumbnail. Grey and RGB are composited over white,
// so a flatten-to-white conversion of a transparent PNG compares equal to its input; the alpha grid
// is separate. Tolerances: lossless steps stay under 1; one lossy re-encode stays under about 6.
import type { Page } from '@playwright/test';

export interface ThumbnailRequest {
  base64: string;
  mime: string;
  /** Grid side, 24 by default. */
  size: number;
  /** Optional [x, y, width, height] as fractions of the image, to compare a crop. */
  region: [number, number, number, number] | null;
}

export interface Thumbnail {
  ok: boolean;
  error: string;
  /** Pixels of the decoded bitmap (after the browser's own orientation). */
  width: number;
  height: number;
  size: number;
  /** size*size luma values 0-255 over white, row by row. */
  gray: number[];
  /** size*size*3 values, over white. */
  rgb: number[];
  /** size*size mean alpha values 0-255 (255 for an opaque image). */
  alpha: number[];
  /** Alpha of the four corner pixels of the bitmap: top-left, top-right, bottom-left, bottom-right. */
  cornerAlpha: number[];
}

/**
 * Runs in the page (pass it to page.evaluate, or use `thumbnail`). Self-contained: Playwright sends
 * its source, so it cannot use anything from this module.
 */
export async function browserThumbnail(request: ThumbnailRequest): Promise<Thumbnail> {
  const empty = { width: 0, height: 0, size: request.size, gray: [], rgb: [], alpha: [], cornerAlpha: [] };
  try {
    const binary = atob(request.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const bitmap = await createImageBitmap(new Blob([bytes], { type: request.mime }), { imageOrientation: 'from-image' });
    const n = request.size;
    const scale = 4;
    const canvas = document.createElement('canvas');
    canvas.width = n * scale;
    canvas.height = n * scale;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('no 2d context');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    const [rx, ry, rw, rh] = request.region ?? [0, 0, 1, 1];
    context.drawImage(bitmap, rx * bitmap.width, ry * bitmap.height, rw * bitmap.width, rh * bitmap.height, 0, 0, n * scale, n * scale);
    const pixels = context.getImageData(0, 0, n * scale, n * scale).data;
    const gray: number[] = [];
    const rgb: number[] = [];
    const alpha: number[] = [];
    for (let ty = 0; ty < n; ty += 1) {
      for (let tx = 0; tx < n; tx += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let y = 0; y < scale; y += 1) {
          for (let x = 0; x < scale; x += 1) {
            const i = ((ty * scale + y) * n * scale + tx * scale + x) * 4;
            const opacity = (pixels[i + 3] as number) / 255;
            r += (pixels[i] as number) * opacity + 255 * (1 - opacity);
            g += (pixels[i + 1] as number) * opacity + 255 * (1 - opacity);
            b += (pixels[i + 2] as number) * opacity + 255 * (1 - opacity);
            a += pixels[i + 3] as number;
          }
        }
        const cell = scale * scale;
        rgb.push(r / cell, g / cell, b / cell);
        gray.push((0.299 * r + 0.587 * g + 0.114 * b) / cell);
        alpha.push(a / cell);
      }
    }
    const cornerAlpha: number[] = [];
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const probeContext = probe.getContext('2d', { willReadFrequently: true });
    if (!probeContext) throw new Error('no 2d context');
    for (const [x, y] of [[0, 0], [bitmap.width - 1, 0], [0, bitmap.height - 1], [bitmap.width - 1, bitmap.height - 1]] as [number, number][]) {
      probeContext.clearRect(0, 0, 1, 1);
      probeContext.drawImage(bitmap, x, y, 1, 1, 0, 0, 1, 1);
      cornerAlpha.push(probeContext.getImageData(0, 0, 1, 1).data[3] as number);
    }
    const result = { ok: true, error: '', width: bitmap.width, height: bitmap.height, size: n, gray, rgb, alpha, cornerAlpha };
    bitmap.close();
    return result;
  } catch (error) {
    return { ok: false, error: String(error), ...empty };
  }
}

export function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
}

/** Decodes the bytes in the page and returns the thumbnail grids. `ok` is false when the browser cannot decode them. */
export async function thumbnail(page: Page, bytes: Uint8Array, mime: string, options: { size?: number; region?: [number, number, number, number] } = {}): Promise<Thumbnail> {
  const request: ThumbnailRequest = { base64: toBase64(bytes), mime, size: options.size ?? 24, region: options.region ?? null };
  return page.evaluate(browserThumbnail, request);
}

/**
 * Turns an n x n grid by an Exif orientation (1-8) as a viewer would display the stored image:
 * 2 mirror horizontal, 3 rotate 180, 4 mirror vertical, 5 transpose, 6 rotate 90 clockwise,
 * 7 transverse, 8 rotate 90 counter-clockwise. `channels` is 1 for gray and alpha, 3 for rgb.
 */
export function orientGrid(values: ArrayLike<number>, n: number, orientationTag: number, channels = 1): number[] {
  if (orientationTag < 1 || orientationTag > 8) throw new Error(`Exif orientation ${orientationTag} is not 1-8`);
  const out = new Array<number>(n * n * channels).fill(0);
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const [nx, ny] =
        orientationTag === 1 ? [x, y]
        : orientationTag === 2 ? [n - 1 - x, y]
        : orientationTag === 3 ? [n - 1 - x, n - 1 - y]
        : orientationTag === 4 ? [x, n - 1 - y]
        : orientationTag === 5 ? [y, x]
        : orientationTag === 6 ? [n - 1 - y, x]
        : orientationTag === 7 ? [n - 1 - y, n - 1 - x]
        : [y, n - 1 - x];
      for (let c = 0; c < channels; c += 1) out[(ny * n + nx) * channels + c] = values[(y * n + x) * channels + c] as number;
    }
  }
  return out;
}

/** The gray grid of a STORED image turned into the grid of the picture on screen. */
export function orientThumbnail(gray: ArrayLike<number>, n: number, orientationTag: number): number[] {
  return orientGrid(gray, n, orientationTag, 1);
}

/** Mean absolute difference of two grids of equal length (0 identical, 255 black against white). */
export function meanAbsDiff(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== b.length || a.length === 0) throw new Error(`cannot compare grids of ${a.length} and ${b.length} values`);
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs((a[i] as number) - (b[i] as number));
  return sum / a.length;
}
