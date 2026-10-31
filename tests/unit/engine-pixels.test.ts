import { describe, expect, it } from 'vitest';
import { clampBox, crop, displayP3ToSrgb, exifSpin, flattenOnWhite, hasTransparency, makeRaster, mosaic, P3_TO_SRGB, spinMatrix, transform } from '../../src/engine/image/pixels.ts';
import type { Raster, Spin } from '../../src/engine/image/pixels.ts';

/** A raster whose pixel i carries the label i in red, so every move is visible. */
function labelled(width: number, height: number): Raster {
  const raster = makeRaster(width, height);
  for (let i = 0; i < width * height; i += 1) raster.data.set([i + 1, 0, 0, 255], i * 4);
  return raster;
}

/** The labels as rows: letters for a 3 × 2 picture, so the expectations read like the Exif tables. */
function rows(raster: Raster, letters = 'ABCDEFGHIJKLMNOP'): string[] {
  const out: string[] = [];
  for (let y = 0; y < raster.height; y += 1) {
    let row = '';
    for (let x = 0; x < raster.width; x += 1) row += letters[(raster.data[(y * raster.width + x) * 4] ?? 0) - 1] ?? '?';
    out.push(row);
  }
  return out;
}

describe('pixels: Exif orientations 1 to 8 on a 3 × 2 picture (ABC / DEF)', () => {
  // The standard table of what each orientation value shows once the picture is stood up.
  const upright: Record<number, string[]> = {
    1: ['ABC', 'DEF'],
    2: ['CBA', 'FED'], // mirror horizontal
    3: ['FED', 'CBA'], // rotate 180
    4: ['DEF', 'ABC'], // mirror vertical
    5: ['AD', 'BE', 'CF'], // transpose
    6: ['DA', 'EB', 'FC'], // rotate 90 clockwise
    7: ['FC', 'EB', 'DA'], // transverse
    8: ['CF', 'BE', 'AD'], // rotate 90 counter-clockwise
  };

  for (const [orientation, expected] of Object.entries(upright)) {
    it(`orientation ${orientation}`, () => {
      const result = transform(labelled(3, 2), exifSpin(Number(orientation)));
      expect(rows(result)).toEqual(expected);
      expect([result.width, result.height]).toEqual([expected[0]!.length, expected.length]);
    });
  }

  it('leaves an unknown value alone', () => {
    for (const value of [0, 9, 99]) expect(rows(transform(labelled(3, 2), exifSpin(value)))).toEqual(['ABC', 'DEF']);
  });
});

// --- reference implementation on plain arrays, written differently on purpose ---------------

type Grid = number[][];
const toGrid = (r: Raster): Grid => Array.from({ length: r.height }, (_, y) => Array.from({ length: r.width }, (_, x) => r.data[(y * r.width + x) * 4] ?? 0));
const turnRight = (g: Grid): Grid => g[0]!.map((_, x) => g.map((row) => row[x]!).reverse());
const mirrorH = (g: Grid): Grid => g.map((row) => [...row].reverse());
const mirrorV = (g: Grid): Grid => [...g].reverse();

function reference(g: Grid, spin: Spin): Grid {
  let out = g;
  for (let i = 0; i < spin.rotate / 90; i += 1) out = turnRight(out);
  if (spin.flipH) out = mirrorH(out);
  if (spin.flipV) out = mirrorV(out);
  return out;
}

const SPINS: Spin[] = [];
for (const rotate of [0, 90, 180, 270] as const) for (const flipH of [false, true]) for (const flipV of [false, true]) SPINS.push({ rotate, flipH, flipV });

describe('pixels: turns and flips', () => {
  it('all sixteen combinations match the reference on a rectangle and on a square', () => {
    for (const [w, h] of [
      [5, 3],
      [4, 4],
      [1, 6],
    ]) {
      for (const spin of SPINS) {
        const source = labelled(w!, h!);
        const result = transform(source, spin);
        expect(toGrid(result), `${w}x${h} ${JSON.stringify(spin)}`).toEqual(reference(toGrid(source), spin));
      }
    }
  });

  it('never changes the source', () => {
    const source = labelled(3, 2);
    const before = Array.from(source.data);
    transform(source, { rotate: 90, flipH: true, flipV: false });
    expect(Array.from(source.data)).toEqual(before);
  });

  it('works on pixels that do not start at a multiple of four bytes', () => {
    const buffer = new Uint8ClampedArray(3 * 2 * 4 + 1);
    const data = buffer.subarray(1);
    data.set(labelled(3, 2).data);
    expect(rows(transform({ data, width: 3, height: 2 }, { rotate: 90, flipH: false, flipV: false }))).toEqual(['DA', 'EB', 'FC']);
  });

  it('gives the canvas matrix the same answer as the pixel path for every combination', () => {
    for (const [w, h] of [
      [5, 3],
      [4, 4],
    ]) {
      for (const spin of SPINS) {
        const source = labelled(w!, h!);
        const moved = transform(source, spin);
        const { matrix, width, height } = spinMatrix(spin, w!, h!);
        expect([width, height]).toEqual([moved.width, moved.height]);
        const [a, b, c, d, e, f] = matrix;
        for (let y = 0; y < h!; y += 1) {
          for (let x = 0; x < w!; x += 1) {
            // The centre of source pixel (x, y) must land on the centre of the pixel that holds its label.
            const px = a * (x + 0.5) + c * (y + 0.5) + e;
            const py = b * (x + 0.5) + d * (y + 0.5) + f;
            const label = moved.data[(Math.floor(py) * moved.width + Math.floor(px)) * 4];
            expect(label, `${w}x${h} ${JSON.stringify(spin)} pixel ${x},${y}`).toBe(source.data[(y * w! + x) * 4]);
          }
        }
      }
    }
  });
});

describe('pixels: crop', () => {
  it('copies the box', () => {
    expect(rows(crop(labelled(4, 3), { x: 1, y: 1, width: 2, height: 2 }))).toEqual(['FG', 'JK']);
  });

  it('clamps the box to the picture, to whole pixels and at least 1 × 1', () => {
    expect(clampBox({ x: -5, y: -5, width: 100, height: 100 }, 4, 3)).toEqual({ x: 0, y: 0, width: 4, height: 3 });
    expect(clampBox({ x: 3.6, y: 2.4, width: 10, height: 10 }, 4, 3)).toEqual({ x: 3, y: 2, width: 1, height: 1 });
    expect(clampBox({ x: 1, y: 1, width: 0, height: -2 }, 4, 3)).toEqual({ x: 1, y: 1, width: 1, height: 1 });
    expect(clampBox({ x: 99, y: 99, width: 5, height: 5 }, 4, 3)).toEqual({ x: 3, y: 2, width: 1, height: 1 });
    const cut = crop(labelled(4, 3), { x: 2, y: 1, width: 50, height: 50 });
    expect([cut.width, cut.height]).toEqual([2, 2]);
  });

  it('lays tiles out in a grid', () => {
    const tiles = [1, 2, 3, 4].map((value) => {
      const tile = makeRaster(2, 2);
      for (let i = 0; i < 4; i += 1) tile.data.set([value, 0, 0, 255], i * 4);
      return tile;
    });
    const grid = mosaic(tiles, 2);
    expect([grid.width, grid.height]).toEqual([4, 4]);
    expect(toGrid(grid)).toEqual([
      [1, 1, 2, 2],
      [1, 1, 2, 2],
      [3, 3, 4, 4],
      [3, 3, 4, 4],
    ]);
  });
});

describe('pixels: transparency and the white ground', () => {
  it('tells transparent pixels from opaque ones', () => {
    const solid = makeRaster(2, 2);
    for (let i = 3; i < solid.data.length; i += 4) solid.data[i] = 255;
    expect(hasTransparency(solid)).toBe(false);
    solid.data[7] = 254;
    expect(hasTransparency(solid)).toBe(true);
  });

  it('paints over white by the alpha, in place', () => {
    const img = makeRaster(4, 1);
    img.data.set([100, 0, 0, 128, 10, 20, 30, 255, 50, 60, 70, 0, 255, 255, 255, 64]);
    flattenOnWhite(img);
    expect(Array.from(img.data)).toEqual([
      177, 127, 127, 255, // (100*128 + 255*127) / 255 = 177.2, (0*128 + 255*127) / 255 = 127
      10, 20, 30, 255, // opaque: untouched
      255, 255, 255, 255, // fully transparent: white whatever the colour was
      255, 255, 255, 255, // white stays white
    ]);
    expect(hasTransparency(img)).toBe(false);
  });
});

describe('pixels: Display P3 to sRGB', () => {
  // The same conversion by the long way, in floating point: P3 decode, P3 to XYZ (D65), XYZ to
  // sRGB, clamp, sRGB encode. The matrices are the CSS Color 4 ones.
  const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const encode = (l: number) => (l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055);
  function reference(r: number, g: number, b: number): [number, number, number] {
    const [lr, lg, lb] = [r, g, b].map((v) => decode(v / 255)) as [number, number, number];
    const x = 0.4865709486482162 * lr + 0.26566769316909306 * lg + 0.1982172852343625 * lb;
    const y = 0.2289745640697488 * lr + 0.6917385218365064 * lg + 0.079286914093745 * lb;
    const z = 0.0 * lr + 0.04511338185890264 * lg + 1.043944368900976 * lb;
    const out = [3.2409699419045226 * x - 1.537383177570094 * y - 0.4986107602930034 * z, -0.9692436362808796 * x + 1.8759675015077202 * y + 0.04155505740717559 * z, 0.05563007969699366 * x - 0.20397695888897652 * y + 1.0569715142428786 * z];
    return out.map((v) => Math.round(encode(Math.min(1, Math.max(0, v))) * 255)) as [number, number, number];
  }

  function convert(r: number, g: number, b: number): number[] {
    const img = makeRaster(1, 1);
    img.data.set([r, g, b, 200]);
    displayP3ToSrgb(img);
    return Array.from(img.data);
  }

  it('has the well-known matrix', () => {
    const expected = [
      [1.2249401763, -0.2249401763, 0],
      [-0.0420569547, 1.0420569547, 0],
      [-0.0196375546, -0.0786360456, 1.0982735985],
    ];
    P3_TO_SRGB.forEach((row, i) => row.forEach((value, j) => expect(value).toBeCloseTo(expected[i]![j]!, 4)));
  });

  it('leaves greys alone, every level of them, and the alpha too', () => {
    for (let level = 0; level < 256; level += 1) expect(convert(level, level, level), `grey ${level}`).toEqual([level, level, level, 200]);
  });

  it('clamps colours that sRGB cannot show', () => {
    expect(convert(255, 0, 0)).toEqual([255, 0, 0, 200]);
    expect(convert(0, 255, 0)).toEqual([0, 255, 0, 200]);
    expect(convert(0, 0, 255)).toEqual([0, 0, 255, 200]);
    expect(convert(255, 255, 255)).toEqual([255, 255, 255, 200]);
  });

  it('moves in-gamut colours like the floating-point reference, within one level', () => {
    let seed = 12345;
    const next = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed;
    };
    for (let i = 0; i < 2000; i += 1) {
      const [r, g, b] = [next() % 256, next() % 256, next() % 256] as [number, number, number];
      const got = convert(r, g, b);
      const want = reference(r, g, b);
      for (let channel = 0; channel < 3; channel += 1) {
        expect(Math.abs((got[channel] ?? 0) - want[channel]!), `P3 ${r},${g},${b} channel ${channel}: ${got.slice(0, 3)} vs ${want}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('shows the desaturation a missing conversion causes: P3 orange is a more saturated sRGB colour', () => {
    // Pixels stored as P3 (255, 128, 0) look the same as sRGB (255, ~117, ~?): at least the green goes down.
    const [r, g, b] = convert(255, 128, 0);
    expect(r).toBe(255);
    expect(g).toBeLessThan(128);
    expect(b).toBe(0);
  });
});
