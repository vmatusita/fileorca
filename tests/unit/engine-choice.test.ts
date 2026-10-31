import { describe, expect, it, vi } from 'vitest';
import { beyondDecoding, decodePath, nativeIfSizeMatches } from '../../src/engine/image/choice.ts';
import { applyContainerTransforms, decodeSource } from '../../src/engine/image/decode.ts';
import { makeRaster } from '../../src/engine/image/pixels.ts';
import type { Raster } from '../../src/engine/image/pixels.ts';
import { CANVAS_MAX_PIXELS, WASM_MAX_PIXELS } from '../../src/engine/image/types.ts';
import type { ImageFormat } from '../../src/engine/image/types.ts';
import { oracle } from './lib/oracle.ts';

describe('choice: canvas or WASM, by pixel count alone', () => {
  it('uses the Safari-on-iPhone limit', () => {
    expect(CANVAS_MAX_PIXELS).toBe(16_777_216);
    expect(4096 * 4096).toBe(CANVAS_MAX_PIXELS);
  });

  it('puts exactly 4096 × 4096 on the canvas and one pixel more off it', () => {
    expect(decodePath(4096, 4096)).toBe('canvas');
    expect(decodePath(4097, 4096)).toBe('wasm');
    expect(decodePath(4096, 4097)).toBe('wasm');
    expect(decodePath(1, 1)).toBe('canvas');
    expect(decodePath(16_777_216, 1)).toBe('canvas'); // a 1-pixel-high strip with the same area
    expect(decodePath(16_777_217, 1)).toBe('wasm');
  });

  it('does not look at the shape, so a tall picture and a wide one agree', () => {
    expect(decodePath(3024, 4032)).toBe(decodePath(4032, 3024));
    expect(decodePath(6000, 4000)).toBe('wasm'); // a 24 MP phone photo
    expect(decodePath(4032, 3024)).toBe('canvas'); // 12 MP
  });

  it('sends the large generated fixture, when there is one, to WASM and the small ones to the canvas', () => {
    for (const [name, entry] of Object.entries(oracle())) {
      if (entry.expect !== 'ok') continue;
      const path = decodePath(entry.displayWidth, entry.displayHeight);
      expect(path, name).toBe(entry.displayWidth * entry.displayHeight > CANVAS_MAX_PIXELS ? 'wasm' : 'canvas');
    }
    const large = Object.entries(oracle()).filter(([name]) => name.includes('grande'));
    for (const [name, entry] of large) expect(decodePath(entry.displayWidth, entry.displayHeight), name).toBe('wasm');
  });
});

describe('choice: the ceiling of the no-canvas path (50 million pixels)', () => {
  it('lets the 48 MP phone photos through and stops at 50 000 000 pixels, whatever the shape', () => {
    expect(WASM_MAX_PIXELS).toBe(50_000_000);
    expect(beyondDecoding(8000, 6000)).toBe(false); // 48 MP
    expect(beyondDecoding(10_000, 5000)).toBe(false); // exactly 50 MP
    expect(beyondDecoding(50_000_001, 1)).toBe(true);
    expect(beyondDecoding(5000, 10_001)).toBe(true);
    expect(beyondDecoding(12_000, 9000)).toBe(true); // 108 MP: about 3.4 GB at 32 bytes per pixel
    expect(beyondDecoding(9000, 12_000)).toBe(beyondDecoding(12_000, 9000));
  });

  it('refuses every format above it before a decoder is loaded', async () => {
    const source = (format: ImageFormat) => ({
      format, width: 12_000, height: 9000, storedWidth: 12_000, storedHeight: 9000, orientation: 1, alpha: false, animated: false, displayP3: false, transforms: [],
    });
    for (const format of ['jpeg', 'png', 'webp', 'heic', 'avif'] as const) {
      await expect(decodeSource(new Uint8Array(8), new Blob([]), source(format)), format).rejects.toMatchObject({ name: 'EngineError', reason: 'too-large' });
    }
  });

  it('keeps the canvas limit where it was: 16 777 216 pixels, and the ceiling is above it', () => {
    expect(decodePath(8000, 6000)).toBe('wasm');
    expect(beyondDecoding(8000, 6000)).toBe(false);
    expect(WASM_MAX_PIXELS).toBeGreaterThan(CANVAS_MAX_PIXELS);
  });
});

interface Fake {
  width: number;
  height: number;
  via: string;
}

describe('choice: the browser decoder against the size the container declares (HEIC)', () => {
  // heic-05: stored 4032 × 3024 with irot 270, so it is 3024 × 4032 on screen.
  const expected = { width: 3024, height: 4032 };

  function decoders(native: () => Promise<Fake>) {
    return {
      native: vi.fn(native),
      wasm: vi.fn(async (): Promise<Fake> => ({ width: 3024, height: 4032, via: 'libheif' })),
      discard: vi.fn(),
    };
  }

  it('accepts the native result when its size matches', async () => {
    const d = decoders(async () => ({ width: 3024, height: 4032, via: 'safari' }));
    const result = await nativeIfSizeMatches(expected, d);
    expect(result.via).toBe('native');
    expect(result.value.via).toBe('safari');
    expect(d.wasm).not.toHaveBeenCalled();
    expect(d.discard).not.toHaveBeenCalled();
  });

  it('rejects a native result that skipped the rotation (4032 × 3024) and uses libheif, freeing the other', async () => {
    const lyingDown: Fake = { width: 4032, height: 3024, via: 'safari' };
    const d = decoders(async () => lyingDown);
    const result = await nativeIfSizeMatches(expected, d);
    expect(result.via).toBe('wasm');
    expect(result.value.via).toBe('libheif');
    expect(d.discard).toHaveBeenCalledWith(lyingDown);
  });

  it('rejects a native result of another size altogether (a thumbnail, an auxiliary image)', async () => {
    const d = decoders(async () => ({ width: 320, height: 240, via: 'safari' }));
    expect((await nativeIfSizeMatches(expected, d)).via).toBe('wasm');
  });

  it('uses libheif when the browser throws (Chromium and most WebKit builds do not read HEIC)', async () => {
    const d = decoders(async () => {
      throw new DOMException('The source image could not be decoded.', 'InvalidStateError');
    });
    const result = await nativeIfSizeMatches(expected, d);
    expect(result.via).toBe('wasm');
    expect(d.native).toHaveBeenCalledTimes(1);
    expect(d.wasm).toHaveBeenCalledTimes(1);
    expect(d.discard).not.toHaveBeenCalled();
  });

  it('fails when both decoders fail, with the error of libheif', async () => {
    const d = {
      native: async (): Promise<Fake> => {
        throw new Error('native');
      },
      wasm: async (): Promise<Fake> => {
        throw new Error('libheif: no image in the file');
      },
    };
    await expect(nativeIfSizeMatches(expected, d)).rejects.toThrow('libheif');
  });

  it('agrees with the oracle: the size to expect for each HEIC is the display size, never the stored one', () => {
    for (const [name, entry] of Object.entries(oracle())) {
      if (!entry.heif) continue;
      const wanted = { width: entry.displayWidth, height: entry.displayHeight };
      const stored = { width: entry.heif.ispe[0], height: entry.heif.ispe[1] };
      // A native decoder that returns the stored size is only right when no rotation is involved.
      const rotated = entry.heif.irot === 90 || entry.heif.irot === 270;
      expect(wanted.width === stored.width && wanted.height === stored.height, name).toBe(!rotated);
    }
  });
});

describe('choice: the container transformations for decoders that do not apply them (AVIF)', () => {
  const letters = 'ABCDEFGHIJKLMNOP';
  function labelled(width: number, height: number): Raster {
    const raster = makeRaster(width, height);
    for (let i = 0; i < width * height; i += 1) raster.data.set([i + 1, 0, 0, 255], i * 4);
    return raster;
  }
  const rows = (raster: Raster) =>
    Array.from({ length: raster.height }, (_, y) => Array.from({ length: raster.width }, (_, x) => letters[(raster.data[(y * raster.width + x) * 4] ?? 0) - 1]).join(''));

  it('turns anticlockwise for irot', () => {
    expect(rows(applyContainerTransforms(labelled(3, 2), [{ kind: 'irot', degrees: 90 }]))).toEqual(['CF', 'BE', 'AD']);
    expect(rows(applyContainerTransforms(labelled(3, 2), [{ kind: 'irot', degrees: 270 }]))).toEqual(['DA', 'EB', 'FC']);
    expect(rows(applyContainerTransforms(labelled(3, 2), [{ kind: 'irot', degrees: 180 }]))).toEqual(['FED', 'CBA']);
    expect(rows(applyContainerTransforms(labelled(3, 2), [{ kind: 'irot', degrees: 0 }]))).toEqual(['ABC', 'DEF']);
  });

  it('mirrors for imir: axis 0 swaps left and right, axis 1 swaps top and bottom', () => {
    expect(rows(applyContainerTransforms(labelled(3, 2), [{ kind: 'imir', axis: 0 }]))).toEqual(['CBA', 'FED']);
    expect(rows(applyContainerTransforms(labelled(3, 2), [{ kind: 'imir', axis: 1 }]))).toEqual(['DEF', 'ABC']);
  });

  it('crops to the clean aperture around the centre, then goes on in order', () => {
    expect(rows(applyContainerTransforms(labelled(4, 4), [{ kind: 'clap', width: 2, height: 2, xOffset: 0, yOffset: 0 }]))).toEqual(['FG', 'JK']);
    expect(rows(applyContainerTransforms(labelled(4, 4), [{ kind: 'clap', width: 2, height: 2, xOffset: -1, yOffset: 1 }]))).toEqual(['IJ', 'MN']);
    const both = applyContainerTransforms(labelled(3, 2), [
      { kind: 'irot', degrees: 90 },
      { kind: 'imir', axis: 0 },
    ]);
    expect(rows(both)).toEqual(['FC', 'EB', 'DA']);
  });
});
