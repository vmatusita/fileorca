import { describe, expect, it, vi } from 'vitest';
import { processImage } from '../../src/engine/image/process.ts';
import type { EngineResult, ImageFormat, Operation } from '../../src/engine/image/types.ts';
import { exifBlock, hasGps, segments } from '../e2e/lib/jpeg.ts';
import { cat, jpegShell, riff, riffChunk, simpleHeif, text, tinyPng, pngChunk, u16 } from './lib/bytes.ts';
import { fixture, names } from './lib/oracle.ts';

const GENERAL: readonly ImageFormat[] = ['jpeg', 'png', 'webp'];
const COMPRESS: Operation = { kind: 'compress', level: 'recommended' };

const run = (bytes: Uint8Array, op: Operation = COMPRESS, accepts: readonly ImageFormat[] = GENERAL, onProgress?: (percent: number) => void) =>
  processImage(new Blob([bytes as BlobPart]), op, accepts, onProgress);

const jpg02 = () => fixture(names('jpg-02')[0]!);
const jpg03 = () => fixture(names('jpg-03')[0]!);

function ok(result: EngineResult) {
  if (!result.ok) throw new Error(`expected a result, got ${JSON.stringify(result)}`);
  return result;
}

describe('process: the files it refuses, each with its reason and the format it saw', () => {
  it('an empty file', async () => {
    expect(await run(new Uint8Array(0))).toEqual({ ok: false, reason: 'empty' });
  });

  it('text with an image extension, and a GIF', async () => {
    expect(await run(new Uint8Array(text('not an image, just text')))).toEqual({ ok: false, reason: 'unsupported', source: 'unknown' });
    expect(await run(new Uint8Array(text('GIF89a\x01\x00\x01\x00')))).toEqual({ ok: false, reason: 'unsupported', source: 'gif' });
  });

  it('a format the tool does not take: HEIC and AVIF in Compress, and the real type of a renamed file', async () => {
    expect(await run(fixture(names('heic-05')[0]!))).toEqual({ ok: false, reason: 'wrong-tool', source: 'heic' });
    expect(await run(simpleHeif({ width: 8, height: 8, type: 'av01', major: 'avif', compatible: ['mif1', 'avif'] }))).toEqual({ ok: false, reason: 'wrong-tool', source: 'avif' });
    // A PNG in a tool that takes JPG only is refused as a PNG, whatever the file is called.
    expect(await run(tinyPng(), COMPRESS, ['jpeg'])).toEqual({ ok: false, reason: 'wrong-tool', source: 'png' });
    // And a HEIC goes through the tool that takes it as far as the checks go.
    const cut = fixture(names('heic-05')[0]!);
    expect(await run(cut.subarray(0, cut.length >> 1), { kind: 'convert', to: 'jpeg' }, ['heic'])).toEqual({ ok: false, reason: 'truncated', source: 'heic' });
  });

  it('a truncated JPEG and a JPEG with a damaged structure', async () => {
    const bytes = jpg02();
    expect(await run(bytes.subarray(0, bytes.length >> 1))).toEqual({ ok: false, reason: 'truncated', source: 'jpeg' });
    expect(await run(jpegShell(8, 8, { eoi: false }))).toEqual({ ok: false, reason: 'truncated', source: 'jpeg' });
    expect(await run(cat([0xff, 0xd8, 0xff, 0xe1], u16(5000), [1, 2, 3]))).toEqual({ ok: false, reason: 'decode', source: 'jpeg' });
  });

  it('a cut PNG, a WebP that stops early, and a JPEG with no size', async () => {
    const png = tinyPng(16, 16);
    expect(await run(png.subarray(0, png.length - 14))).toEqual({ ok: false, reason: 'truncated', source: 'png' });
    expect(await run(riff([riffChunk('VP8 ', new Array(10).fill(1))], 9999))).toEqual({ ok: false, reason: 'truncated', source: 'webp' });
    expect(await run(jpegShell(0, 0))).toEqual({ ok: false, reason: 'decode', source: 'jpeg' });
  });

  it('a picture above 50 million pixels is refused as too large from its headers, but one that needs no decoding still goes back clean', async () => {
    // 9000 × 6000 = 54 MP: the no-canvas decoders would hold it about 32 bytes per pixel, so no decoder is started.
    const huge = jpegShell(9000, 6000);
    expect(await run(huge)).toEqual({ ok: false, reason: 'too-large', source: 'jpeg' });
    expect(await run(huge, { kind: 'convert', to: 'png' })).toEqual({ ok: false, reason: 'too-large', source: 'jpeg' });
    expect(await run(huge, { kind: 'rotate', turn: 'right', flip: 'none' })).toEqual({ ok: false, reason: 'too-large', source: 'jpeg' });
    // A target that the file already fits needs no pixel: it goes back without metadata.
    const fits = ok(await run(huge, { kind: 'target', maxBytes: 1_000_000 }));
    expect([fits.outcome, fits.width, fits.height]).toEqual(['fits', 9000, 6000]);
  });

  it('never throws, whatever the bytes', async () => {
    let seed = 7;
    for (let i = 0; i < 40; i += 1) {
      const bytes = new Uint8Array(64 + (i % 5) * 100);
      for (let k = 0; k < bytes.length; k += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        bytes[k] = seed >>> 24;
      }
      if (i % 4 === 0) bytes.set([0xff, 0xd8, 0xff]);
      if (i % 4 === 1) bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (i % 4 === 2) bytes.set([...text('RIFF'), 1, 0, 0, 0, ...text('WEBP')]);
      if (i % 4 === 3) bytes.set([0, 0, 0, 20, ...text('ftypheic')]);
      const result = await run(bytes);
      expect(result.ok, `random file ${i}`).toBe(false);
    }
  });

  it('reports that it has read the file before it refuses it', async () => {
    const progress = vi.fn();
    await run(new Uint8Array(text('plain text')), COMPRESS, GENERAL, progress);
    expect(progress).toHaveBeenCalledWith(10);
  });
});

describe('process: answers that need no decoder (the original goes back clean)', () => {
  it('a file that already fits the target size comes back as a JPEG without Exif or GPS', async () => {
    const original = jpg02();
    expect(hasGps(original)).toBe(true);
    const result = ok(await run(original, { kind: 'target', maxBytes: 100_000_000 }));
    expect(result).toMatchObject({ outcome: 'fits', format: 'jpeg', width: 3264, height: 2448, source: 'jpeg', sourceWidth: 3264, sourceHeight: 2448, notes: [] });
    expect(result.blob.type).toBe('image/jpeg');
    const out = new Uint8Array(await result.blob.arrayBuffer());
    expect(out.length).toBeLessThan(original.length);
    expect(hasGps(out)).toBe(false);
    expect(exifBlock(out)).toBeNull();
  });

  it('keeps the Orientation of a turned photo, and nothing else of the Exif, when it goes back', async () => {
    const result = ok(await run(jpg03(), { kind: 'target', maxBytes: 100_000_000 }));
    const out = new Uint8Array(await result.blob.arrayBuffer());
    expect(hasGps(out)).toBe(false);
    expect(segments(out).filter((segment) => segment.marker === 0xe1)).toHaveLength(1);
    expect([result.width, result.height]).toEqual([3264, 2448]);
  });

  it('Resize with a box the photo already fits gives it back and says it was not enlarged', async () => {
    const result = ok(await run(jpg02(), { kind: 'resize', mode: 'size', width: 8000, height: 8000 }));
    expect(result).toMatchObject({ outcome: 'fits', width: 3264, height: 2448, notes: ['not-enlarged'] });
    expect(hasGps(new Uint8Array(await result.blob.arrayBuffer()))).toBe(false);
  });

  it('Resize to exactly the photo size, or 100 percent, changes nothing and says nothing', async () => {
    expect(ok(await run(jpg02(), { kind: 'resize', mode: 'size', width: 3264, height: 2448 }))).toMatchObject({ outcome: 'fits', notes: [] });
    expect(ok(await run(jpg02(), { kind: 'resize', mode: 'percent', percent: 100 }))).toMatchObject({ outcome: 'fits', notes: [] });
  });

  it('Crop of the whole picture, by ratio or by box, gives the original back', async () => {
    expect(ok(await run(jpg02(), { kind: 'crop', ratio: 3264 / 2448 }))).toMatchObject({ outcome: 'fits', width: 3264, height: 2448 });
    expect(ok(await run(jpg02(), { kind: 'crop', ratio: null }))).toMatchObject({ outcome: 'fits' });
    expect(ok(await run(jpg02(), { kind: 'crop', ratio: 1, box: { x: -10, y: -10, width: 99_999, height: 99_999 } }))).toMatchObject({ outcome: 'fits' });
  });

  it('a PNG and a WebP lose their text chunks and Exif on the way back', async () => {
    const png = tinyPng(4, 4, [1, 2, 3, 255], [pngChunk('tEXt', text('GPS\0-25.4,-49.2')), pngChunk('eXIf', [0x4d, 0x4d, 0, 0x2a])]);
    const outPng = Buffer.from(await ok(await run(png, { kind: 'target', maxBytes: 1_000_000 })).blob.arrayBuffer()).toString('latin1');
    expect(outPng).not.toContain('tEXt');
    expect(outPng).not.toContain('eXIf');
    expect(outPng).toContain('IDAT');

    const vp8x = riffChunk('VP8X', [0x08, 0, 0, 0, 7, 0, 0, 7, 0, 0]); // EXIF flag, 8 × 8
    const webp = riff([vp8x, riffChunk('VP8 ', new Array(12).fill(1)), riffChunk('EXIF', text('Exif\0\0MM GPS secret'))]);
    const result = ok(await run(webp, { kind: 'resize', mode: 'percent', percent: 100 }));
    const outWebp = Buffer.from(await result.blob.arrayBuffer()).toString('latin1');
    expect(outWebp).not.toContain('EXIF');
    expect(outWebp).not.toContain('secret');
    expect(result).toMatchObject({ format: 'webp', outcome: 'fits' });
  });

  it('an animated WebP in Compress goes back clean and still animated, instead of losing its frames', async () => {
    const vp8x = riffChunk('VP8X', [0x0a, 0, 0, 0, 7, 0, 0, 7, 0, 0]); // animation + EXIF flags
    const webp = riff([vp8x, riffChunk('ANIM', [0, 0, 0, 0, 0, 0]), riffChunk('ANMF', new Array(20).fill(1)), riffChunk('EXIF', text('Exif\0\0MM'))]);
    const result = ok(await run(webp, COMPRESS));
    expect(result).toMatchObject({ outcome: 'no-gain', format: 'webp' });
    const out = new Uint8Array(await result.blob.arrayBuffer());
    expect(Buffer.from(out).toString('latin1')).toContain('ANMF');
    expect(Buffer.from(out).toString('latin1')).not.toContain('EXIF');
    expect(out[20]! & 0x02).toBe(0x02); // the animation flag stays
    expect(out[20]! & 0x08).toBe(0); // the EXIF flag does not
  });
});
