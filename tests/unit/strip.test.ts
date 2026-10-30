import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { jpegOrientation, sniffType, stripJpeg, stripMetadata, stripPng, stripWebp } from '../../src/engine/image/strip.ts';
import { exifBlock, hasGps, segments } from '../e2e/lib/jpeg.ts';

const read = (name: string) => new Uint8Array(readFileSync(`fixtures/images/${name}`));

function u32be(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}
function pngChunk(type: string, data: number[]): number[] {
  return [...u32be(data.length), ...[...type].map((c) => c.charCodeAt(0)), ...data, 0, 0, 0, 0];
}
function riffChunk(type: string, data: number[]): number[] {
  const size = data.length;
  return [...[...type].map((c) => c.charCodeAt(0)), size & 0xff, (size >> 8) & 0xff, 0, 0, ...data, ...(size % 2 ? [0] : [])];
}

describe('removedor de metadados (caso sem ganho)', () => {
  it('drops EXIF and GPS from a real JPEG and keeps the image data byte for byte', () => {
    const original = read('jpg-02-iphone6-paisagem-gps.jpg');
    expect(hasGps(original)).toBe(true);
    const stripped = stripJpeg(original);
    expect(hasGps(stripped)).toBe(false);
    expect(exifBlock(stripped)).toBeNull();
    expect(stripped.length).toBeLessThan(original.length);
    const scan = (bytes: Uint8Array) => {
      let i = 2;
      while (bytes[i + 1] !== 0xda) i += 2 + (((bytes[i + 2] ?? 0) << 8) | (bytes[i + 3] ?? 0));
      return bytes.subarray(i);
    };
    expect(Buffer.from(scan(stripped)).equals(Buffer.from(scan(original)))).toBe(true);
    expect(segments(stripped).some((segment) => segment.marker === 0xdb)).toBe(true);
  });

  it('keeps only the Orientation tag of a rotated JPEG, so it still shows upright', () => {
    const original = read('jpg-03-iphone5-paisagem-orientacao3-gps.jpg');
    const app1 = segments(original).find((segment) => segment.marker === 0xe1);
    expect(app1 && jpegOrientation(app1.data)).toBe(3);
    const stripped = stripJpeg(original);
    expect(hasGps(stripped)).toBe(false);
    const kept = segments(stripped).filter((segment) => segment.marker === 0xe1);
    expect(kept).toHaveLength(1);
    expect(kept[0] && jpegOrientation(kept[0].data)).toBe(3);
    expect(kept[0]?.data.length).toBeLessThan(40);
  });

  it('drops text and eXIf chunks from a PNG and keeps the image chunks', () => {
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...pngChunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
      ...pngChunk('tEXt', [...'GPS\0-25.4,-49.2'].map((c) => c.charCodeAt(0))),
      ...pngChunk('eXIf', [0x4d, 0x4d, 0, 0x2a]),
      ...pngChunk('IDAT', [1, 2, 3]),
      ...pngChunk('IEND', []),
    ]);
    const text = (bytes: Uint8Array) => Buffer.from(bytes).toString('latin1');
    const stripped = stripPng(png);
    expect(text(stripped)).not.toContain('tEXt');
    expect(text(stripped)).not.toContain('eXIf');
    expect(text(stripped)).toContain('IHDR');
    expect(text(stripped)).toContain('IDAT');
    expect(text(stripped)).toContain('IEND');
  });

  it('drops EXIF and XMP chunks from a WebP, clears their flags and fixes the RIFF size', () => {
    const body = [
      ...[...'WEBP'].map((c) => c.charCodeAt(0)),
      ...riffChunk('VP8X', [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      ...riffChunk('VP8L', [0x2f, 0, 0, 0, 0]),
      ...riffChunk('EXIF', [1, 2, 3, 4, 5]),
      ...riffChunk('XMP ', [6, 7, 8]),
    ];
    const size = body.length;
    const webp = new Uint8Array([...[...'RIFF'].map((c) => c.charCodeAt(0)), size & 0xff, (size >> 8) & 0xff, 0, 0, ...body]);
    const stripped = stripWebp(webp);
    const text = Buffer.from(stripped).toString('latin1');
    expect(text).not.toContain('EXIF');
    expect(text).not.toContain('XMP ');
    expect(stripped[20]).toBe(0);
    expect((stripped[4] ?? 0) | ((stripped[5] ?? 0) << 8)).toBe(stripped.length - 8);
  });

  it('picks the stripper from the bytes, not from the name: a JPEG called .png still loses its GPS', () => {
    const jpeg = read('jpg-02-iphone6-paisagem-gps.jpg');
    expect(sniffType(jpeg)).toBe('image/jpeg');
    const out = stripMetadata(jpeg);
    expect(out.type).toBe('image/jpeg');
    expect(hasGps(out.bytes)).toBe(false);
    expect(() => stripPng(jpeg)).toThrow(/not a PNG/);
  });

  it('refuses formats it does not know', () => {
    expect(() => stripMetadata(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toThrow();
    expect(() => stripJpeg(new Uint8Array([0, 1, 2]))).toThrow();
  });
});
