// The checks every matrix test leans on (tests/e2e/lib/matrix.ts), proven here to say NO when they must:
// a check that never fails proves nothing about an output. Positive controls are the fixtures that do
// carry what the checks look for (the GPS of jpg-02, the EXIF chunk of the WebP, the Exif item of a HEIC).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stripJpeg } from '../../src/engine/image/strip.ts';
import { BROKEN, batchOf, expectNoMetadata, fixtureBytes, fixturesOf, imageBytes, orientationOnly, oracle, sameImageBytes, storedBox } from '../e2e/lib/matrix.ts';
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

// F18 (decision 15): the proof of "the same picture" of Remove EXIF data. It must see through every change of metadata and
// catch the change of one byte of the picture.
describe('imageBytes and sameImageBytes', () => {
  const flip = (source: Uint8Array, at: number): Uint8Array => {
    const copy = source.slice();
    copy[at] = (copy[at] ?? 0) ^ 0x01;
    return copy;
  };
  const insertAt = (source: Uint8Array, at: number, part: number[]): Uint8Array => Uint8Array.from([...source.subarray(0, at), ...part, ...source.subarray(at)]);
  const ascii = (value: string): number[] => [...value].map((char) => char.charCodeAt(0));
  /** Where a top-level segment starts (the Exif thumbnail of a phone photo has a DQT and a SOF of its own, inside the APP1). */
  const markerAt = (source: Uint8Array, marker: number): number => {
    let at = 2;
    while (source[at + 1] !== marker) at += 2 + (((source[at + 2] ?? 0) << 8) | (source[at + 3] ?? 0));
    return at;
  };

  it('JPEG: the same picture with other metadata, a comment or bytes after its end; another one when a byte of a table, the frame or the scan changes', () => {
    const jpeg = bytes(JPG_02);
    // A COM segment and an APP13 after the SOI, and a second picture after the EOI: the picture is the same.
    const comment = [0xff, 0xfe, 0, 8, ...ascii('Lisbon')];
    const iptc = [0xff, 0xed, 0, 6, 1, 2, 3, 4];
    expect(sameImageBytes(jpeg, insertAt(jpeg, 2, [...comment, ...iptc]))).toBe(true);
    expect(sameImageBytes(jpeg, Uint8Array.from([...jpeg, 0xff, 0xd8, 0xff, 0xd9]))).toBe(true);
    expect(sameImageBytes(jpeg, stripJpeg(jpeg))).toBe(true);
    // A byte of the quantization table, of the frame header, and of the scan near its end.
    expect(sameImageBytes(jpeg, flip(jpeg, markerAt(jpeg, 0xdb) + 10))).toBe(false);
    expect(sameImageBytes(jpeg, flip(jpeg, markerAt(jpeg, 0xc0) + 6))).toBe(false);
    expect(sameImageBytes(jpeg, flip(jpeg, jpeg.length - 100))).toBe(false);
    // And it is most of the file.
    expect(imageBytes(jpeg).length).toBeGreaterThan(jpeg.length / 2);
  });

  it('PNG: the same picture with a text chunk; another one when a byte of the IDAT or of the header changes', () => {
    const png = bytes('gen-png-transparente.png');
    const ihdrEnd = 8 + 12 + 13;
    const body = ascii('tEXtComment\0taken in Lisbon');
    const crc = crc32(Uint8Array.from(body));
    const length = body.length - 4;
    const chunk = [0, 0, length >> 8, length & 0xff, ...body, crc >>> 24, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff];
    expect(sameImageBytes(png, insertAt(png, ihdrEnd, chunk))).toBe(true);
    expect(sameImageBytes(png, flip(png, png.length - 40))).toBe(false); // in the last IDAT
    expect(sameImageBytes(png, flip(png, 8 + 8 + 9))).toBe(false); // the colour type in the IHDR
  });

  it('WebP: the same picture without its EXIF chunk; another one when a byte of the image, a frame or the VP8X flags changes', () => {
    const webp = bytes('gen-webp-exif-gps.webp');
    // The file is VP8X, VP8 and EXIF: dropping the EXIF chunk (and fixing the RIFF size) keeps the picture.
    const exifAt = Buffer.from(webp).indexOf('EXIF');
    const withoutExif = webp.slice(0, exifAt);
    new DataView(withoutExif.buffer).setUint32(4, withoutExif.length - 8, true);
    expect(sameImageBytes(webp, withoutExif)).toBe(true);
    expect(sameImageBytes(webp, flip(webp, 200))).toBe(false); // inside the VP8 chunk
    expect(sameImageBytes(webp, flip(webp, 20))).toBe(false); // the VP8X flags (bit 0 is reserved, and still counts)
    const animated = bytes('gen-webp-animada.webp');
    expect(sameImageBytes(animated, flip(animated, animated.length - 10))).toBe(false); // in the last ANMF
  });

  it('knows only JPG, PNG and WebP', () => {
    expect(() => imageBytes(bytes('gen-avif.avif'))).toThrow(/no picture bytes for a avif file/);
  });
});
