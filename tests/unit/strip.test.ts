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

  // F3 (DECISOES § 100): what is kept is a list of the chunks a picture needs, so private and unknown chunks go too.
  const SECRET = [...'GPSLatitude=25.4284S GPSLongitude=49.2733W'].map((c) => c.charCodeAt(0));
  const latin = (bytes: Uint8Array) => Buffer.from(bytes).toString('latin1');

  it('keeps only the picture chunks of a PNG: private and unknown chunks with GPS text go (caBX, zxIf, exIf, dSIG, vpAg, prVW)', () => {
    // Every chunk the allowlist keeps, the APNG and HDR ones included (second pass p2-motor-02).
    const keepers = ['PLTE', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'bKGD', 'pHYs', 'cICP', 'mDCV', 'cLLI', 'acTL', 'fcTL'];
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...pngChunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 3, 0, 0, 0]),
      ...keepers.flatMap((type) => pngChunk(type, [1, 2, 3])),
      ...['caBX', 'zxIf', 'exIf', 'dSIG', 'vpAg', 'prVW', 'teSt'].flatMap((type) => pngChunk(type, SECRET)),
      ...pngChunk('IDAT', [1, 2, 3]),
      ...pngChunk('fcTL', [4, 5]),
      ...pngChunk('fdAT', [6, 7]),
      ...pngChunk('IEND', []),
    ]);
    const stripped = latin(stripPng(png));
    expect(stripped).toContain('fdAT');
    expect(stripped).not.toContain('GPSLatitude');
    for (const type of ['caBX', 'zxIf', 'exIf', 'dSIG', 'vpAg', 'prVW', 'teSt']) expect(stripped, type).not.toContain(type);
    for (const type of ['IHDR', ...keepers, 'IDAT', 'IEND']) expect(stripped, type).toContain(type);
  });

  it('keeps APP0 only when it is JFIF and APP14 only when it is Adobe', () => {
    const app = (marker: number, data: number[]) => [0xff, marker, (data.length + 2) >> 8, (data.length + 2) & 0xff, ...data];
    const jpeg = new Uint8Array([
      0xff, 0xd8,
      ...app(0xe0, [...'JFIF\0'].map((c) => c.charCodeAt(0)).concat([1, 1, 0, 0, 1, 0, 1, 0, 0])),
      ...app(0xe0, [...'JFXX\0'].map((c) => c.charCodeAt(0)).concat(SECRET)),
      ...app(0xee, [...'Adobe'].map((c) => c.charCodeAt(0)).concat([0, 100, 0, 0, 0, 0, 1])),
      ...app(0xee, [...'Other'].map((c) => c.charCodeAt(0)).concat(SECRET)),
      ...app(0xdb, new Array(65).fill(1)),
      0xff, 0xda, 0, 2, 1, 2, 3,
      0xff, 0xd9,
    ]);
    const stripped = latin(stripJpeg(jpeg));
    expect(stripped).not.toContain('GPSLatitude');
    expect(stripped).toContain('JFIF');
    expect(stripped).toContain('Adobe');
  });

  it('keeps only the picture chunks of a WebP: an unknown chunk with GPS text goes', () => {
    const body = [
      ...[...'WEBP'].map((c) => c.charCodeAt(0)),
      ...riffChunk('VP8X', [0x2c, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      ...riffChunk('ICCP', [1, 2, 3, 4]),
      ...riffChunk('C2PA', SECRET),
      ...riffChunk('XYZW', SECRET),
      ...riffChunk('ALPH', [0, 1]),
      ...riffChunk('VP8L', [0x2f, 0, 0, 0, 0]),
      ...riffChunk('ANIM', [0, 0, 0, 0, 0, 0]),
      ...riffChunk('ANMF', [1, 2, 3, 4]),
    ];
    const size = body.length;
    const webp = new Uint8Array([...[...'RIFF'].map((c) => c.charCodeAt(0)), size & 0xff, (size >> 8) & 0xff, 0, 0, ...body]);
    const stripped = latin(stripWebp(webp));
    expect(stripped).not.toContain('GPSLatitude');
    for (const type of ['VP8X', 'ICCP', 'ALPH', 'VP8L', 'ANIM', 'ANMF']) expect(stripped, type).toContain(type);
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

// ---- what follows the EOI, the MPF segment and the fill bytes (review of the F2) -----------------------------------

const ascii = (text: string): number[] => [...text].map((char) => char.charCodeAt(0));
const marker = (code: number, payload: number[]): number[] => [0xff, code, (payload.length + 2) >> 8, (payload.length + 2) & 0xff, ...payload];
const latin1 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');

/** An Exif APP1 whose IFD0 has an Orientation and, when asked, the GPSInfo pointer (little-endian TIFF). */
function exifApp1(options: { orientation?: number; gps?: boolean }): number[] {
  const entries: number[][] = [];
  if (options.orientation) entries.push([0x12, 0x01, 3, 0, 1, 0, 0, 0, options.orientation, 0, 0, 0]);
  if (options.gps) entries.push([0x25, 0x88, 4, 0, 1, 0, 0, 0, 0x30, 0, 0, 0]);
  const tiff = [0x49, 0x49, 0x2a, 0, 8, 0, 0, 0, entries.length, 0, ...entries.flat(), 0, 0, 0, 0];
  return marker(0xe1, [...ascii('Exif'), 0, 0, ...tiff, ...(options.gps ? [0, 0, ...ascii('GPS-LAT-25.43-LON-49.27')] : [])]);
}

const DQT = marker(0xdb, [0, ...Array.from({ length: 64 }, () => 3)]);
const SOF0 = marker(0xc0, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]);
const DHT = marker(0xc4, [0, ...Array.from({ length: 16 }, (_, index) => (index === 0 ? 1 : 0)), 0]);
const SOS = marker(0xda, [1, 1, 0, 0, 63, 0]);
/** Entropy-coded data with a stuffed byte (FF00) and a restart marker (FFD0), which the walk must not take for the end of the scan. */
const SCAN = [0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56, 0x78];
const EOI = [0xff, 0xd9];
const SOI = [0xff, 0xd8];
const MPF = marker(0xe2, [...ascii('MPF'), 0, 0x49, 0x49, 0x2a, 0, 8, 0, 0, 0, 0, 0]);
const ICC = marker(0xe2, [...ascii('ICC_PROFILE'), 0, 1, 1, 0xaa, 0xbb, 0xcc]);
/** A second picture of its own, with the GPS in its own Exif, as an MPF or Ultra HDR file carries after the first. */
const SECONDARY = [...SOI, ...exifApp1({ orientation: 3, gps: true }), ...marker(0xe1, [...ascii('http://ns.adobe.com/xap/1.0/'), 0, ...ascii('<x:xmpmeta GPSLatitude="25,26N"/>')]), ...DQT, ...SOF0, ...DHT, ...SOS, ...SCAN, ...EOI];
const VIDEO_TRAILER = [0, 0, 0, 0x18, ...ascii('ftypmp42'), ...ascii('GPS-TRAILER-xyz')];

describe('JPEG com dados depois do EOI, MPF e bytes de preenchimento', () => {
  const main = (...parts: number[][]) => new Uint8Array([...SOI, ...parts.flat()]);

  it('stops at the EOI: the picture that follows it, with its own GPS and XMP, is not copied', () => {
    const file = main(exifApp1({ orientation: 6, gps: true }), MPF, DQT, SOF0, DHT, SOS, SCAN, EOI, SECONDARY, VIDEO_TRAILER);
    expect(hasGps(file)).toBe(true);
    const clean = stripJpeg(file);
    const text = latin1(clean);
    expect(text).not.toContain('GPS');
    expect(text).not.toContain('GPSLatitude');
    expect(text).not.toContain('xmpmeta');
    expect(text).not.toContain('ftyp');
    expect(hasGps(clean)).toBe(false);
    expect(Array.from(clean.subarray(clean.length - 2))).toEqual(EOI);
    // The Orientation is the first picture's (6), not the one of the picture after the EOI (3).
    const kept = segments(clean).filter((segment) => segment.marker === 0xe1);
    expect(kept).toHaveLength(1);
    expect(kept[0] && jpegOrientation(kept[0].data)).toBe(6);
  });

  it('drops the MPF APP2 and keeps the ICC profile APP2', () => {
    const clean = stripJpeg(main(ICC, MPF, DQT, SOF0, DHT, SOS, SCAN, EOI, SECONDARY));
    const apps = segments(clean).filter((segment) => segment.marker === 0xe2);
    expect(apps.map((segment) => latin1(segment.data.subarray(0, 11)))).toEqual(['ICC_PROFILE']);
    expect(latin1(clean)).not.toContain('MPF\0');
  });

  it('keeps the entropy-coded data of the picture byte for byte, stuffed zeros and restart markers included', () => {
    const clean = stripJpeg(main(DQT, SOF0, DHT, SOS, SCAN, EOI, SECONDARY));
    expect(Array.from(clean)).toEqual([...SOI, ...DQT, ...SOF0, ...DHT, ...SOS, ...SCAN, ...EOI]);
  });

  it('keeps every scan of a progressive JPEG and still stops at the EOI after the last one', () => {
    const second = marker(0xda, [1, 1, 0, 1, 5, 0x10]);
    const file = main(exifApp1({ gps: true }), DQT, marker(0xc2, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]), DHT, SOS, SCAN, DHT, second, [0x9a, 0xbc], EOI, SECONDARY);
    const clean = stripJpeg(file);
    expect(Array.from(clean)).toEqual([...SOI, ...DQT, ...marker(0xc2, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]), ...DHT, ...SOS, ...SCAN, ...DHT, ...second, 0x9a, 0xbc, ...EOI]);
  });

  it('reads a valid file with 0xFF fill bytes between its segments instead of refusing it', () => {
    const file = main([0xff, 0xff], exifApp1({ gps: true }), [0xff, 0xff, 0xff], DQT, SOF0, [0xff], DHT, [0xff, 0xff], SOS, SCAN, [0xff], EOI, SECONDARY);
    const clean = stripJpeg(file);
    expect(hasGps(clean)).toBe(false);
    expect(latin1(clean)).not.toContain('GPS');
    const markers = segments(clean).map((segment) => segment.marker);
    expect(markers).toEqual([0xdb, 0xc0, 0xc4]);
    expect(Array.from(clean.subarray(clean.length - 2))).toEqual(EOI);
    // The scan is intact: the data after SOS is the same, then the end of the picture.
    expect(latin1(clean)).toContain(latin1(new Uint8Array([...SOS, ...SCAN])));
  });

  it('still refuses a file whose segments do not add up', () => {
    expect(() => stripJpeg(new Uint8Array([...SOI, 0xff, 0xe1, 0x00, 0x40, 1, 2, 3]))).toThrow();
    expect(() => stripJpeg(new Uint8Array([...SOI, 0x12, 0x34, 0x00, 0x04]))).toThrow();
  });

  it('applies to the real fixtures: nothing but the picture and its colour profile is left, and no GPS anywhere in the bytes', () => {
    for (const name of ['jpg-01-pixel2-retrato-gps.jpg', 'jpg-02-iphone6-paisagem-gps.jpg', 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg', 'gen-jpg-01-orientacao6.jpg']) {
      const clean = stripJpeg(read(name));
      expect(hasGps(clean), name).toBe(false);
      expect(Array.from(clean.subarray(clean.length - 2)), name).toEqual(EOI);
      expect(latin1(clean), name).not.toContain('MPF\0');
    }
  });
});
