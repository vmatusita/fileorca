// Operations on RGBA pixels in plain JavaScript: the Exif orientation, turns, flips, crops, the
// white background for JPEG and the Display P3 to sRGB conversion. They run on the path without a
// canvas (a photo above CANVAS_MAX_PIXELS) and in the Vitest, where no canvas exists.
// A Raster is the shape ImageData has, so an ImageData can be passed in as it is.
// Self-contained: nothing here imports from outside src/engine/image/.

import type { Box } from './types.ts';

export interface Raster {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/** A clockwise turn first, then the flips (the order the Rotate tool and the Exif tags use). */
export interface Spin {
  rotate: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
}

export function makeRaster(width: number, height: number): Raster {
  return { data: new Uint8ClampedArray(width * height * 4), width, height };
}

/** The spin that stands a photo upright for each Exif Orientation value (1 to 8). */
export function exifSpin(orientation: number): Spin {
  switch (orientation) {
    case 2:
      return { rotate: 0, flipH: true, flipV: false };
    case 3:
      return { rotate: 180, flipH: false, flipV: false };
    case 4:
      return { rotate: 0, flipH: false, flipV: true };
    case 5: // transpose
      return { rotate: 90, flipH: true, flipV: false };
    case 6:
      return { rotate: 90, flipH: false, flipV: false };
    case 7: // transverse
      return { rotate: 90, flipH: false, flipV: true };
    case 8:
      return { rotate: 270, flipH: false, flipV: false };
    default:
      return { rotate: 0, flipH: false, flipV: false };
  }
}

export function isIdentity(spin: Spin): boolean {
  return spin.rotate === 0 && !spin.flipH && !spin.flipV;
}

/** The pixels as 32-bit words (one per pixel), copying only when the buffer is not aligned. */
function words(data: Uint8ClampedArray): Uint32Array {
  if (data.byteOffset % 4 === 0) return new Uint32Array(data.buffer, data.byteOffset, data.length >> 2);
  return new Uint32Array(data.slice().buffer);
}

function fromWords(buffer: Uint32Array, width: number, height: number): Raster {
  return { data: new Uint8ClampedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength), width, height };
}

/** Turns and flips a picture; always a new Raster (the source is left as it was). */
export function transform(src: Raster, spin: Spin): Raster {
  const { width: w, height: h } = src;
  const swap = spin.rotate === 90 || spin.rotate === 270;
  const ow = swap ? h : w;
  const oh = swap ? w : h;
  // Source index = base + ox * dx + oy * dy, for each of the four turns.
  let base = 0;
  let dx = 1;
  let dy = w;
  if (spin.rotate === 90) {
    base = (h - 1) * w;
    dx = -w;
    dy = 1;
  } else if (spin.rotate === 180) {
    base = h * w - 1;
    dx = -1;
    dy = -w;
  } else if (spin.rotate === 270) {
    base = w - 1;
    dx = w;
    dy = -1;
  }
  if (spin.flipH) {
    base += (ow - 1) * dx;
    dx = -dx;
  }
  if (spin.flipV) {
    base += (oh - 1) * dy;
    dy = -dy;
  }
  const from = words(src.data);
  const to = new Uint32Array(ow * oh);
  let out = 0;
  for (let oy = 0; oy < oh; oy += 1) {
    let at = base + oy * dy;
    for (let ox = 0; ox < ow; ox += 1) {
      to[out] = from[at] ?? 0;
      out += 1;
      at += dx;
    }
  }
  return fromWords(to, ow, oh);
}

/** The box clamped to the picture: whole pixels, at least 1 × 1, entirely inside. */
export function clampBox(box: Box, width: number, height: number): Box {
  const x = Math.min(Math.max(0, Math.round(box.x)), width - 1);
  const y = Math.min(Math.max(0, Math.round(box.y)), height - 1);
  return {
    x,
    y,
    width: Math.min(Math.max(1, Math.round(box.width)), width - x),
    height: Math.min(Math.max(1, Math.round(box.height)), height - y),
  };
}

export function crop(src: Raster, box: Box): Raster {
  const area = clampBox(box, src.width, src.height);
  const from = words(src.data);
  const to = new Uint32Array(area.width * area.height);
  for (let row = 0; row < area.height; row += 1) {
    const start = (area.y + row) * src.width + area.x;
    to.set(from.subarray(start, start + area.width), row * area.width);
  }
  return fromWords(to, area.width, area.height);
}

/** Tiles of one size laid out in a grid with `columns` columns (the sample for the target size). */
export function mosaic(tiles: Raster[], columns: number): Raster {
  const first = tiles[0];
  if (!first) return makeRaster(1, 1);
  const rows = Math.ceil(tiles.length / columns);
  const out = makeRaster(first.width * columns, first.height * rows);
  const to = words(out.data);
  tiles.forEach((tile, index) => {
    const from = words(tile.data);
    const left = (index % columns) * first.width;
    const top = Math.floor(index / columns) * first.height;
    for (let row = 0; row < first.height; row += 1) {
      to.set(from.subarray(row * first.width, (row + 1) * first.width), (top + row) * out.width + left);
    }
  });
  return out;
}

export function hasTransparency(img: Raster): boolean {
  const { data } = img;
  for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) return true;
  return false;
}

/** Paints the picture over white and makes it opaque (JPEG has no alpha); in place. */
export function flattenOnWhite(img: Raster): void {
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] ?? 255;
    if (alpha === 255) continue;
    const rest = 255 * (255 - alpha);
    data[i] = ((data[i] ?? 0) * alpha + rest) / 255;
    data[i + 1] = ((data[i + 1] ?? 0) * alpha + rest) / 255;
    data[i + 2] = ((data[i + 2] ?? 0) * alpha + rest) / 255;
    data[i + 3] = 255;
  }
}

// --- Display P3 to sRGB ----------------------------------------------------------------------

// Display P3 uses the sRGB transfer curve, so the conversion is: decode to linear light, a 3 × 3
// matrix between the two sets of primaries (both D65), clamp to the sRGB gamut, encode again.
// The CSS Color 4 matrices: both come from the same D65 white point, so every row of the product
// sums to 1 and greys stay grey.
const P3_TO_XYZ = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976],
] as const;
const XYZ_TO_SRGB = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
] as const;

/** P3 linear light to sRGB linear light (rows: red, green, blue out). */
export const P3_TO_SRGB: readonly (readonly [number, number, number])[] = XYZ_TO_SRGB.map((row) => [0, 1, 2].map((column) => row[0] * P3_TO_XYZ[0][column]! + row[1] * P3_TO_XYZ[1][column]! + row[2] * P3_TO_XYZ[2][column]!) as [number, number, number]);

const ENCODE_STEPS = 16384;
let decodeTable: Float32Array | null = null;
let encodeTable: Uint8Array | null = null;

function tables(): { decode: Float32Array; encode: Uint8Array } {
  if (!decodeTable || !encodeTable) {
    decodeTable = new Float32Array(256);
    for (let i = 0; i < 256; i += 1) {
      const c = i / 255;
      decodeTable[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }
    encodeTable = new Uint8Array(ENCODE_STEPS + 1);
    for (let i = 0; i <= ENCODE_STEPS; i += 1) {
      const l = i / ENCODE_STEPS;
      const c = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
      encodeTable[i] = Math.round(c * 255);
    }
  }
  return { decode: decodeTable, encode: encodeTable };
}

/** Display P3 pixels to sRGB, in place. Colours outside the sRGB gamut are clamped. */
export function displayP3ToSrgb(img: Raster): void {
  const { decode, encode } = tables();
  const m = P3_TO_SRGB;
  const [r0, r1, r2] = m[0]!;
  const [g0, g1, g2] = m[1]!;
  const [b0, b1, b2] = m[2]!;
  const { data } = img;
  const clamp = (v: number) => (v <= 0 ? 0 : v >= 1 ? ENCODE_STEPS : Math.round(v * ENCODE_STEPS));
  for (let i = 0; i < data.length; i += 4) {
    const r = decode[data[i] ?? 0]!;
    const g = decode[data[i + 1] ?? 0]!;
    const b = decode[data[i + 2] ?? 0]!;
    data[i] = encode[clamp(r0 * r + r1 * g + r2 * b)]!;
    data[i + 1] = encode[clamp(g0 * r + g1 * g + g2 * b)]!;
    data[i + 2] = encode[clamp(b0 * r + b1 * g + b2 * b)]!;
  }
}

// --- The same turns and flips as a canvas transform ------------------------------------------

/** A 2D affine matrix as canvas setTransform takes it: x' = a x + c y + e, y' = b x + d y + f. */
export type Matrix = readonly [a: number, b: number, c: number, d: number, e: number, f: number];

function multiply(m: Matrix, n: Matrix): Matrix {
  // m after n: the point goes through n first.
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

/**
 * The canvas matrix that draws a width × height picture turned and flipped like transform() does,
 * so the canvas path and the pixel path agree (a Vitest checks every combination).
 */
export function spinMatrix(spin: Spin, width: number, height: number): { matrix: Matrix; width: number; height: number } {
  const swap = spin.rotate === 90 || spin.rotate === 270;
  const ow = swap ? height : width;
  const oh = swap ? width : height;
  const turn: Matrix =
    spin.rotate === 90 ? [0, 1, -1, 0, height, 0] : spin.rotate === 180 ? [-1, 0, 0, -1, width, height] : spin.rotate === 270 ? [0, -1, 1, 0, 0, width] : [1, 0, 0, 1, 0, 0];
  let matrix = turn;
  if (spin.flipH) matrix = multiply([-1, 0, 0, 1, ow, 0], matrix);
  if (spin.flipV) matrix = multiply([1, 0, 0, -1, 0, oh], matrix);
  return { matrix, width: ow, height: oh };
}
