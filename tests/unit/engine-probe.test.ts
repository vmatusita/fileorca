import { describe, expect, it } from 'vitest';
import { probe } from '../../src/engine/image/probe.ts';
import type { ImageFormat } from '../../src/engine/image/types.ts';
import { app1Exif, cat, jpegShell, pngChunk, riff, riffChunk, text, tinyPng, u16, u32, u32le } from './lib/bytes.ts';
import { fixture, names, oracle } from './lib/oracle.ts';

describe('probe: size and facts from the headers, against the oracle', () => {
  it('gives the display size of every fixture that decodes', () => {
    for (const [name, entry] of Object.entries(oracle())) {
      if (entry.expect !== 'ok') continue;
      const info = probe(fixture(name), entry.format as ImageFormat);
      expect(info, name).not.toBeNull();
      expect([info!.width, info!.height], name).toEqual([entry.displayWidth, entry.displayHeight]);
      expect([info!.storedWidth, info!.storedHeight], name).toEqual([entry.storedWidth, entry.storedHeight]);
      expect(info!.orientation, name).toBe(entry.format === 'jpeg' ? entry.orientation : 1);
      // alpha is a hint (an RGBA PNG may be opaque): it must never say no to a picture that is transparent.
      if (entry.hasAlpha) expect(info!.alpha, name).toBe(true);
      if (entry.format === 'jpeg' || entry.format === 'heic') expect(info!.alpha, name).toBe(false);
      expect(info!.animated, name).toBe(entry.animated ?? false);
    }
  });

  it('reads the Exif Orientation of the turned JPEGs without confusing the Exif thumbnail for the photo', () => {
    // jpg-02 has an Exif thumbnail of 160 × 120 before the real 3264 × 2448 frame.
    const jpg02 = probe(fixture(names('jpg-02')[0]!), 'jpeg')!;
    expect([jpg02.width, jpg02.height]).toEqual([3264, 2448]);
    const six = probe(fixture(names('gen-jpg-01')[0]!), 'jpeg')!;
    expect([six.orientation, six.storedWidth, six.storedHeight, six.width, six.height]).toEqual([6, 1600, 1200, 1200, 1600]);
    const eight = probe(fixture(names('gen-jpg-02')[0]!), 'jpeg')!;
    expect([eight.orientation, eight.storedWidth, eight.storedHeight, eight.width, eight.height]).toEqual([8, 1200, 1600, 1600, 1200]);
    const three = probe(fixture(names('jpg-03')[0]!), 'jpeg')!;
    expect([three.orientation, three.width, three.height]).toEqual([3, 3264, 2448]); // 180 degrees: same size
  });

  it('swaps the size for orientations 5 to 8 only', () => {
    for (const orientation of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const info = probe(jpegShell(300, 200, { segments: [app1Exif(orientation)] }), 'jpeg')!;
      const swapped = orientation >= 5;
      expect([info.width, info.height], `orientation ${orientation}`).toEqual(swapped ? [200, 300] : [300, 200]);
      expect([info.storedWidth, info.storedHeight]).toEqual([300, 200]);
    }
    // An out-of-range value is ignored.
    expect(probe(jpegShell(300, 200, { segments: [app1Exif(9)] }), 'jpeg')).toMatchObject({ orientation: 1, width: 300, height: 200 });
  });

  it('returns null when the headers give no size', () => {
    expect(probe(jpegShell(0, 0), 'jpeg')).toBeNull();
    expect(probe(cat([0xff, 0xd8, 0xff, 0xd9]), 'jpeg')).toBeNull();
    expect(probe(new Uint8Array(40), 'png')).toBeNull();
    expect(probe(new Uint8Array(40), 'webp')).toBeNull();
    expect(probe(new Uint8Array(40), 'heic')).toBeNull();
  });
});

describe('probe: PNG', () => {
  it('reads the size and finds transparency in the colour type or in tRNS', () => {
    expect(probe(tinyPng(7, 5), 'png')).toMatchObject({ width: 7, height: 5, alpha: true }); // RGBA
    const rgb = cat([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], pngChunk('IHDR', cat(u32(3), u32(2), [8, 2, 0, 0, 0])), pngChunk('IDAT', [1]), pngChunk('IEND', []));
    expect(probe(rgb, 'png')).toMatchObject({ width: 3, height: 2, alpha: false });
    const palette = cat([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], pngChunk('IHDR', cat(u32(3), u32(2), [8, 3, 0, 0, 0])), pngChunk('PLTE', [0, 0, 0]), pngChunk('tRNS', [0]), pngChunk('IDAT', [1]), pngChunk('IEND', []));
    expect(probe(palette, 'png')).toMatchObject({ alpha: true });
  });
});

describe('probe: WebP', () => {
  it('reads the three kinds of image chunk', () => {
    // VP8 (lossy): start code 9d 01 2a, then 14-bit width and height.
    const lossy = riff([riffChunk('VP8 ', [0, 0, 0, 0x9d, 0x01, 0x2a, 0x40, 0x01, 0xf0, 0x00, 0, 0])]);
    expect(probe(lossy, 'webp')).toMatchObject({ width: 320, height: 240, alpha: false, animated: false });
    // VP8L (lossless): signature 2f, then width - 1, height - 1 and the alpha bit.
    const bits = (319 | (239 << 14) | (1 << 28)) >>> 0;
    const lossless = riff([riffChunk('VP8L', [0x2f, ...u32le(bits), 0, 0])]);
    expect(probe(lossless, 'webp')).toMatchObject({ width: 320, height: 240, alpha: true });
    // VP8X (extended): flags, then a 24-bit canvas width - 1 and height - 1.
    const extended = riff([riffChunk('VP8X', [0x12, 0, 0, 0, 0x3f, 0x01, 0, 0xef, 0, 0])]);
    expect(probe(extended, 'webp')).toMatchObject({ width: 320, height: 240, alpha: true, animated: true });
    expect(probe(riff([riffChunk('JUNK', [1, 2, 3, 4])]), 'webp')).toBeNull();
  });
});

describe('probe: colour', () => {
  it('finds Display P3 in the HEIC files that carry it and not in the one that does not', () => {
    for (const name of names('heic-')) expect(probe(fixture(name), 'heic')!.displayP3, name).toBe(oracle()[name]!.heif!.iccDisplayP3);
  });

  it('is false for the sRGB JPEG and PNG', () => {
    for (const name of names('jpg-')) expect(probe(fixture(name), 'jpeg')!.displayP3, name).toBe(false);
  });

  it('finds a Display P3 ICC profile split across JPEG segments', () => {
    const profile = (() => {
      const tags = [text('desc'), u32(128 + 4 + 12), u32(22)].flat();
      const desc = [...text('desc'), ...u32(0), ...u32(11), ...text('Display P3'), 0];
      return Uint8Array.from([...new Array(128).fill(0), ...u32(1), ...tags, ...desc]);
    })();
    const half = Math.floor(profile.length / 2);
    const part = (index: number, bytes: Uint8Array) => cat([0xff, 0xe2], u16(bytes.length + 16), text('ICC_PROFILE'), [0, index, 2], bytes);
    const info = probe(jpegShell(10, 10, { segments: [part(1, profile.subarray(0, half)), part(2, profile.subarray(half))] }), 'jpeg')!;
    expect(info.displayP3).toBe(true);
    // With a part missing the profile is not trusted.
    expect(probe(jpegShell(10, 10, { segments: [part(1, profile.subarray(0, half))] }), 'jpeg')!.displayP3).toBe(false);
  });
});
