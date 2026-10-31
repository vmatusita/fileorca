// The target-size algorithm ("compress to 100 KB"): a JPEG of at most maxBytes from a photo that
// can be 12 MP or more. Searching the quality on the full picture would cost six 12 MP encodes
// (several seconds each on a phone), so the work is done on small pictures:
//   1. Encode a sample (four tiles cut at native resolution, so the bytes per pixel are the real
//      ones) and binary-search the quality on it, against the budget scaled to the sample's size.
//   2. If that quality fits, encode the full picture ONCE at it. Done when it fits.
//   3. Otherwise scale the picture ONCE to the pixel budget the measured density asks for, with a
//      margin, and binary-search the quality on the reduced picture (a few small encodes).
//   4. If even the lowest quality does not fit, shrink more, up to three more times.
// A picture is never encoded at full size more than once (a Vitest counts the calls by pixel count).
// Pictures up to DIRECT_PIXELS are searched directly: they are as cheap as a sample.
// Self-contained: nothing here imports from outside src/engine/image/.

import type { Box } from './types.ts';

export const TARGET = {
  qualityMin: 40,
  qualityMax: 90,
  /** At most this many encodes per quality search (enough to settle 51 qualities exactly). */
  maxTries: 6,
  /** Extra shrinking rounds after the first reduced picture. */
  maxShrinks: 3,
  /** The estimate aims at this share of the budget, so a small error still fits. */
  safety: 0.92,
  /** A reduced picture is denser per pixel than the full one; plan for it. */
  density: 0.85,
  /** Bytes grow with pixels^e: about 0.85 for the first guess, 0.7 when a reduction already missed. */
  firstExponent: 0.85,
  retryExponent: 0.7,
  directPixels: 600_000,
  sampleTile: 256,
} as const;

export interface Sized<H> {
  handle: H;
  pixels: number;
}

export interface TargetOps<H> {
  /** Size of the picture to fit. */
  width: number;
  height: number;
  /** The full-size picture. The algorithm never releases it. */
  full(): H;
  /** Tiles of the picture at native resolution, as one small picture. */
  sample(): Promise<Sized<H>>;
  /** The picture scaled to exactly width × height. */
  scale(width: number, height: number): Promise<Sized<H>>;
  /** JPEG bytes of the picture at the quality (1 to 100). */
  encode(handle: H, quality: number): Promise<Uint8Array>;
  /** Frees a sample or a scaled picture. */
  release(handle: H): void;
}

export interface TargetResult {
  bytes: Uint8Array;
  quality: number;
  width: number;
  height: number;
  downscaled: boolean;
}

/** Four tiles around the middle of each quadrant, never past the edges. */
export function sampleBoxes(width: number, height: number, tile: number = TARGET.sampleTile): Box[] {
  const size = Math.max(1, Math.min(tile, Math.floor(width / 2), Math.floor(height / 2)));
  const boxes: Box[] = [];
  for (const fy of [0.25, 0.75]) {
    for (const fx of [0.25, 0.75]) {
      boxes.push({ x: Math.round(width * fx - size / 2), y: Math.round(height * fy - size / 2), width: size, height: size });
    }
  }
  return boxes;
}

interface Search {
  best: { quality: number; bytes: Uint8Array } | null;
  /** Bytes at the lowest quality tried (what the shrinking rounds measure against). */
  lowestBytes: number;
}

/** The side scale that would bring `actual` bytes down to `wanted`, if bytes grow with pixels^exponent. */
function scaleFor(wanted: number, actual: number, exponent: number): number {
  return (wanted / actual) ** (1 / (2 * exponent));
}

/** The highest quality in range whose encoding fits `limit`, in at most maxTries encodes. */
async function search(encode: (quality: number) => Promise<Uint8Array>, limit: number): Promise<Search> {
  let low: number = TARGET.qualityMin;
  let high: number = TARGET.qualityMax;
  let best: Search['best'] = null;
  let lowestQuality = Infinity;
  let lowestBytes = Infinity;
  for (let tries = 0; tries < TARGET.maxTries && low <= high; tries += 1) {
    const quality = (low + high) >> 1;
    const bytes = await encode(quality);
    if (quality < lowestQuality) {
      lowestQuality = quality;
      lowestBytes = bytes.length;
    }
    if (bytes.length <= limit) {
      best = { quality, bytes };
      low = quality + 1;
    } else {
      high = quality - 1;
    }
  }
  return { best, lowestBytes };
}

/** A JPEG of at most maxBytes, or null when even the smallest tries do not fit (the caller reports it). */
export async function fitToBytes<H>(ops: TargetOps<H>, maxBytes: number): Promise<TargetResult | null> {
  const { width, height } = ops;
  const pixels = width * height;

  // Scales once to `scale` of each side and searches the quality there; shrinks again if nothing fits.
  async function reduce(initialScale: number): Promise<TargetResult | null> {
    let scale = Math.min(initialScale, 0.98);
    for (let round = 0; round <= TARGET.maxShrinks; round += 1) {
      const w = Math.max(1, Math.round(width * scale));
      const h = Math.max(1, Math.round(height * scale));
      const reduced = await ops.scale(w, h);
      try {
        const { best, lowestBytes } = await search((quality) => ops.encode(reduced.handle, quality), maxBytes);
        if (best) return { bytes: best.bytes, quality: best.quality, width: w, height: h, downscaled: true };
        scale *= scaleFor(maxBytes * TARGET.safety, lowestBytes, TARGET.retryExponent) * 0.97;
      } finally {
        ops.release(reduced.handle);
      }
    }
    return null;
  }

  if (pixels <= TARGET.directPixels) {
    const { best, lowestBytes } = await search((quality) => ops.encode(ops.full(), quality), maxBytes);
    if (best) return { bytes: best.bytes, quality: best.quality, width, height, downscaled: false };
    return reduce(scaleFor(maxBytes * TARGET.safety, lowestBytes, TARGET.firstExponent) * 0.97);
  }

  const sample = await ops.sample();
  let estimate: { quality: number } | null;
  let lowestFull: number;
  try {
    const share = sample.pixels / pixels;
    const found = await search((quality) => ops.encode(sample.handle, quality), maxBytes * TARGET.safety * share);
    estimate = found.best;
    lowestFull = found.lowestBytes / share;
  } finally {
    ops.release(sample.handle);
  }

  if (estimate) {
    const bytes = await ops.encode(ops.full(), estimate.quality); // the only full-size encode
    if (bytes.length <= maxBytes) return { bytes, quality: estimate.quality, width, height, downscaled: false };
    // The sample was kinder than the whole picture: shrink by the measured size at this quality.
    return reduce(scaleFor(maxBytes * TARGET.safety, bytes.length, TARGET.firstExponent) * 0.95);
  }
  // Even the lowest quality is too big at full size: reduce until about the middle of the range fits.
  return reduce(scaleFor(maxBytes * TARGET.safety * TARGET.density, lowestFull, TARGET.firstExponent));
}
