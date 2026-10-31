// The checks every matrix test leans on (tests/e2e/lib/matrix.ts), proven here to say NO when they must:
// a check that never fails proves nothing about an output. Positive controls are the fixtures that do
// carry what the checks look for (the GPS of jpg-02, the EXIF chunk of the WebP, the Exif item of a HEIC).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stripJpeg } from '../../src/engine/image/strip.ts';
import { BROKEN, batchOf, expectNoMetadata, fixtureBytes, fixturesOf, orientationOnly, oracle, storedBox } from '../e2e/lib/matrix.ts';
import { crc32 } from '../e2e/lib/zip.ts';

const bytes = (name: string): Uint8Array => new Uint8Array(fixtureBytes(name));
const JPG_02 = 'jpg-02-iphone6-paisagem-gps.jpg';
const JPG_03 = 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg';

describe('expectNoMetadata', () => {
  it('fails on every kind of file that carries a location, an author or an Exif block', () => {
    for (const name of [JPG_02, JPG_03, 'gen-webp-exif-gps.webp', 'heic-06-iphone7-paisagem-gps.heic']) {
      expect(() => expectNoMetadata({ name, bytes: bytes(name) }), name).toThrow();
    }
  });

  it('fails on a PNG with a text chunk, an XMP packet or an eXIf chunk', () => {
    const png = bytes('gen-png-transparente.png');
    const insertAfterIhdr = (type: string, data: number[]): Uint8Array => {
      const ihdrEnd = 8 + 12 + 13;
      const body = [...type].map((char) => char.charCodeAt(0)).concat(data);
      const crc = crc32(Uint8Array.from(body));
      const chunk = [data.length >>> 24, (data.length >>> 16) & 0xff, (data.length >>> 8) & 0xff, data.length & 0xff, ...body, crc >>> 24, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff];
      return Uint8Array.from([...png.subarray(0, ihdrEnd), ...chunk, ...png.subarray(ihdrEnd)]);
    };
    const text = [...'Comment'].map((char) => char.charCodeAt(0)).concat([0], [...'taken in Lisbon'].map((char) => char.charCodeAt(0)));
    const xmp = [...'XML:com.adobe.xmp'].map((char) => char.charCodeAt(0)).concat([0, 0, 0, 0, 0], [...'<x:xmpmeta/>'].map((char) => char.charCodeAt(0)));
    expect(() => expectNoMetadata({ name: 'text.png', bytes: insertAfterIhdr('tEXt', text) })).toThrow();
    expect(() => expectNoMetadata({ name: 'xmp.png', bytes: insertAfterIhdr('iTXt', xmp) })).toThrow();
    expect(() => expectNoMetadata({ name: 'exif.png', bytes: insertAfterIhdr('eXIf', [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0]) })).toThrow();
  });

  it('passes on files that carry none', () => {
    for (const name of ['gen-png-transparente.png', 'gen-grande-4100x4100.jpg', 'gen-avif.avif', 'gen-webp-animada.webp']) {
      expect(() => expectNoMetadata({ name, bytes: bytes(name) }), name).not.toThrow();
    }
  });

  it('lets a rotated JPEG that went back clean keep its Orientation and nothing else, only when told it may', () => {
    const clean = stripJpeg(bytes(JPG_03));
    expect(orientationOnly(clean)).toBe(true);
    expect(() => expectNoMetadata({ name: 'clean.jpg', bytes: clean })).toThrow(); // an Exif block is still an Exif block
    expect(() => expectNoMetadata({ name: 'clean.jpg', bytes: clean }, { tagMayStay: true })).not.toThrow();
    // The permission is for the Orientation alone: the original, with its GPS, is refused even then.
    expect(orientationOnly(bytes(JPG_03))).toBe(false);
    expect(() => expectNoMetadata({ name: JPG_03, bytes: bytes(JPG_03) }, { tagMayStay: true })).toThrow();
  });
});

describe('storedBox', () => {
  // The forward map of an Exif orientation on the unit square, written out from the table of the standard
  // (pixels.ts orientGrid does the same for a grid): where the stored point (x, y) shows on screen.
  const show = (tag: number, x: number, y: number): [number, number] =>
    ({ 1: [x, y], 2: [1 - x, y], 3: [1 - x, 1 - y], 4: [x, 1 - y], 5: [y, x], 6: [1 - y, x], 7: [1 - y, 1 - x], 8: [y, 1 - x] } as Record<number, [number, number]>)[tag] as [number, number];

  it('finds in the stored picture the part that shows as the box on screen, for every orientation', () => {
    const box: [number, number, number, number] = [0.125, 0.25, 0.5, 0.375];
    for (let tag = 1; tag <= 8; tag += 1) {
      const [x, y, w, h] = storedBox(box, tag);
      const corners = [show(tag, x, y), show(tag, x + w, y + h)];
      const left = Math.min(corners[0]?.[0] ?? 0, corners[1]?.[0] ?? 0);
      const top = Math.min(corners[0]?.[1] ?? 0, corners[1]?.[1] ?? 0);
      const right = Math.max(corners[0]?.[0] ?? 0, corners[1]?.[0] ?? 0);
      const bottom = Math.max(corners[0]?.[1] ?? 0, corners[1]?.[1] ?? 0);
      expect([left, top, right - left, bottom - top].map((value) => Number(value.toFixed(6))), `orientation ${tag}`).toEqual(box);
    }
  });
});

describe('the batches', () => {
  it('put the refused files in the middle of the accepted ones, keeping the order of both', () => {
    expect(batchOf(['a', 'b', 'c', 'd'], ['x', 'y'])).toEqual(['a', 'b', 'x', 'y', 'c', 'd']);
    expect(batchOf(['a', 'b', 'c'], ['x'])).toEqual(['a', 'b', 'x', 'c']);
  });

  it('list the fixtures by what their bytes are, from the oracle, and the four that cannot be read', () => {
    expect(fixturesOf('heic')).toHaveLength(10);
    expect(fixturesOf('avif')).toEqual(['gen-avif.avif']);
    expect(fixturesOf('jpeg', 'png', 'webp')).toHaveLength(10);
    // a PNG called .jpg is a PNG, the broken ones are in no list of good files
    expect(oracle('gen-png-extensao-jpg.jpg').format).toBe('png');
    expect(fixturesOf('jpeg', 'png', 'webp', 'avif', 'heic').filter((name) => (BROKEN as readonly string[]).includes(name))).toEqual([]);
    expect(readFileSync('fixtures/images/expected.json', 'utf8')).toContain('gen-vazio.jpg');
  });
});
