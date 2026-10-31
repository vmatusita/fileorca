import { describe, expect, it } from 'vitest';
import { fitToBytes, sampleBoxes, TARGET } from '../../src/engine/image/target.ts';
import type { TargetOps } from '../../src/engine/image/target.ts';

interface Pic {
  pixels: number;
  /** A tile mosaic cut at native resolution (same density as the full picture). */
  native: boolean;
}

interface Call {
  pixels: number;
  quality: number;
}

/**
 * A fake JPEG encoder: bytes grow with the pixel count and double every ~22 quality points, and a
 * picture scaled down is denser per pixel (the factor `shrinkDensity`), like a real photo.
 */
function fake(width: number, height: number, options: { bppAt75: number; shrinkDensity?: number; fullPenalty?: number }) {
  const full = width * height;
  const { bppAt75, shrinkDensity = 0.12, fullPenalty = 1 } = options;
  const calls: Call[] = [];
  const scales: [number, number][] = [];
  const released: Pic[] = [];
  const fullPic: Pic = { pixels: full, native: true };
  const sizeOf = (pic: Pic, quality: number) => {
    const density = pic.native ? 1 : (full / pic.pixels) ** shrinkDensity;
    const penalty = pic === fullPic ? fullPenalty : 1;
    // 600 bytes of headers, like a real JPEG, so a tiny budget is truly out of reach.
    return 600 + Math.round(pic.pixels * bppAt75 * 2 ** ((quality - 75) / 22) * density * penalty);
  };
  const ops: TargetOps<Pic> = {
    width,
    height,
    full: () => fullPic,
    async sample() {
      const handle = { pixels: 4 * 256 * 256, native: true };
      return { handle, pixels: handle.pixels };
    },
    async scale(w, h) {
      scales.push([w, h]);
      return { handle: { pixels: w * h, native: false }, pixels: w * h };
    },
    async encode(handle, quality) {
      calls.push({ pixels: handle.pixels, quality });
      return new Uint8Array(sizeOf(handle, quality));
    },
    release(handle) {
      released.push(handle);
    },
  };
  return { ops, calls, scales, released, fullPic, sizeOf, full };
}

const fullEncodes = (calls: Call[], full: number) => calls.filter((call) => call.pixels >= full).length;

describe('target: the algorithm with a fake encoder', () => {
  it('keeps a 12 MP photo at full size for 1 MB and encodes it once', async () => {
    const f = fake(3024, 4032, { bppAt75: 0.098 }); // 1.2 MB at quality 75
    const result = (await fitToBytes(f.ops, 1_000_000))!;
    expect(result.downscaled).toBe(false);
    expect([result.width, result.height]).toEqual([3024, 4032]);
    expect(result.bytes.length).toBeLessThanOrEqual(1_000_000);
    expect(result.quality).toBeLessThan(75);
    expect(fullEncodes(f.calls, f.full)).toBe(1);
    expect(f.scales).toEqual([]);
    expect(f.calls.length).toBeLessThanOrEqual(TARGET.maxTries + 1);
  });

  it('shrinks a 12 MP photo for 100 KB without ever encoding it at full size', async () => {
    const f = fake(3024, 4032, { bppAt75: 0.098 });
    const result = (await fitToBytes(f.ops, 100_000))!;
    expect(result.downscaled).toBe(true);
    expect(result.bytes.length).toBeLessThanOrEqual(100_000);
    expect(result.width).toBeLessThan(3024);
    expect(result.height).toBeLessThan(4032);
    expect(result.quality).toBeGreaterThanOrEqual(TARGET.qualityMin);
    // The aspect ratio is kept to within a pixel of rounding.
    expect(Math.abs(result.width / result.height - 3024 / 4032)).toBeLessThan(0.01);
    expect(fullEncodes(f.calls, f.full)).toBe(0);
    expect(f.scales.length).toBeLessThanOrEqual(1 + TARGET.maxShrinks);
    expect(f.scales[0]).toEqual([result.width, result.height]);
  });

  it('scales the picture once when the first guess fits, not once per quality tried', async () => {
    const f = fake(4032, 3024, { bppAt75: 0.098 });
    await fitToBytes(f.ops, 100_000);
    expect(f.scales).toHaveLength(1);
    const reducedEncodes = f.calls.filter((call) => call.pixels < f.full && call.pixels !== 4 * 256 * 256);
    expect(reducedEncodes.length).toBeLessThanOrEqual(TARGET.maxTries);
  });

  it('recovers when the full picture turns out heavier than the sample said, still with one full encode', async () => {
    const f = fake(3024, 4032, { bppAt75: 0.098, fullPenalty: 1.4 });
    const result = (await fitToBytes(f.ops, 1_000_000))!;
    expect(result.downscaled).toBe(true);
    expect(result.bytes.length).toBeLessThanOrEqual(1_000_000);
    expect(fullEncodes(f.calls, f.full)).toBe(1);
  });

  it('shrinks again, at most three more times, when the first reduction is not enough', async () => {
    // A picture that gets much denser per pixel as it shrinks fools the first estimate.
    const f = fake(3024, 4032, { bppAt75: 0.098, shrinkDensity: 0.3 });
    const result = (await fitToBytes(f.ops, 60_000))!;
    expect(result.bytes.length).toBeLessThanOrEqual(60_000);
    expect(result.downscaled).toBe(true);
    expect(f.scales.length).toBeLessThanOrEqual(1 + TARGET.maxShrinks);
    expect(fullEncodes(f.calls, f.full)).toBe(0);
  });

  it('gives up with null, after a bounded number of encodes, when nothing can fit', async () => {
    const f = fake(3024, 4032, { bppAt75: 0.098 });
    const result = await fitToBytes(f.ops, 40);
    expect(result).toBeNull();
    expect(f.scales.length).toBeLessThanOrEqual(1 + TARGET.maxShrinks);
    expect(f.calls.length).toBeLessThanOrEqual(TARGET.maxTries * (2 + TARGET.maxShrinks));
    expect(fullEncodes(f.calls, f.full)).toBe(0);
  });

  it('searches a small picture directly and returns the highest quality that fits', async () => {
    const f = fake(800, 600, { bppAt75: 0.5 }); // 240 KB at 75, under the direct threshold
    const limit = 150_000;
    const result = (await fitToBytes(f.ops, limit))!;
    expect(result.downscaled).toBe(false);
    expect(f.scales).toEqual([]);
    expect(f.calls.length).toBeLessThanOrEqual(TARGET.maxTries);
    expect(f.sizeOf(f.fullPic, result.quality)).toBeLessThanOrEqual(limit);
    if (result.quality < TARGET.qualityMax) expect(f.sizeOf(f.fullPic, result.quality + 1)).toBeGreaterThan(limit);
  });

  it('uses the top quality when everything fits', async () => {
    const f = fake(3024, 4032, { bppAt75: 0.098 });
    const result = (await fitToBytes(f.ops, 50_000_000))!;
    expect(result.quality).toBe(TARGET.qualityMax);
    expect(result.downscaled).toBe(false);
    expect(fullEncodes(f.calls, f.full)).toBe(1);
  });

  it('releases what it made and never the full picture', async () => {
    const f = fake(3024, 4032, { bppAt75: 0.098 });
    await fitToBytes(f.ops, 100_000);
    expect(f.released.length).toBeGreaterThanOrEqual(2); // the sample and the reduced picture
    expect(f.released).not.toContain(f.fullPic);
  });

  it('holds the encode count for a spread of sizes and budgets', async () => {
    for (const [w, h] of [
      [4032, 3024],
      [6000, 4000],
      [1920, 1080],
      [1000, 1000],
    ] as const) {
      for (const limit of [100_000, 1_000_000, 2_000_000]) {
        const f = fake(w, h, { bppAt75: 0.12 });
        const result = await fitToBytes(f.ops, limit);
        if (result) expect(result.bytes.length, `${w}x${h} at ${limit}`).toBeLessThanOrEqual(limit);
        if (w * h > TARGET.directPixels) expect(fullEncodes(f.calls, f.full), `${w}x${h} at ${limit}`).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('target: where the sample is cut', () => {
  it('takes four equal tiles, inside the picture, in the four quadrants', () => {
    const boxes = sampleBoxes(4000, 3000);
    expect(boxes).toHaveLength(4);
    for (const box of boxes) {
      expect([box.width, box.height]).toEqual([256, 256]);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(4000);
      expect(box.y + box.height).toBeLessThanOrEqual(3000);
    }
    expect(new Set(boxes.map((box) => `${box.x},${box.y}`)).size).toBe(4);
  });

  it('shrinks the tile for a small picture and still stays inside', () => {
    for (const [w, h] of [
      [100, 100],
      [3, 2],
      [1, 1],
      [9000, 40],
    ] as const) {
      for (const box of sampleBoxes(w, h)) {
        expect(box.width).toBeGreaterThanOrEqual(1);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(w);
        expect(box.y + box.height).toBeLessThanOrEqual(h);
      }
    }
  });
});
