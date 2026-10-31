// The image fixtures against their oracle (fixtures/images/expected.json) and their record
// (fixtures/ORIGEM.md): every file is listed, nothing changed under its SHA-256, every number of the
// oracle is measured again by the independent readers of tests/e2e/lib, and each generated file has
// the structure it was built for. The oracle is written by hand; nothing here produces the expected.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { exifItems, parseBmff, primaryImage, topLevelImages, auxiliaryIds, thumbnailIds } from '../e2e/lib/bmff.ts';
import { imageSize, metadataReport, sniff, type Format } from '../e2e/lib/images.ts';
import { exifBlock, hasEoi, hasGps, orientation, segments, sofSize, tiffGpsKind, tiffOrientation } from '../e2e/lib/jpeg.ts';
import { pngInfo, pngMetadataChunks, pngPixels } from '../e2e/lib/png.ts';
import { webpExif, webpFrames, webpInfo } from '../e2e/lib/webp.ts';
import { exifSegment, findExif, markerSegments, setOrientation, truncateJpeg, withSegmentAfterSoi } from '../../scripts/fixtures/lib/jpeg.ts';
import { fadeToTransparent, rotate } from '../../scripts/fixtures/lib/rgba.ts';
import { animation, readChunks, withExif } from '../../scripts/fixtures/lib/webp.ts';

const DIR = 'fixtures/images/';
const read = (name: string): Uint8Array => new Uint8Array(readFileSync(DIR + name));
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

interface Heif {
  majorBrand: string;
  compatibleBrands: string[];
  primaryItemId: number;
  primaryType: string;
  ispe: [number, number];
  irot: number | null;
  imir: number | null;
  exifItem: boolean;
  exifItemIds: number[];
  topLevelImageItemIds: number[];
  auxiliaryItemIds: number[];
  thumbnailItemIds: number[];
  iccDisplayP3: boolean;
}
interface Expected {
  format: Format;
  displayWidth: number | null;
  displayHeight: number | null;
  storedWidth: number | null;
  storedHeight: number | null;
  orientation: number;
  hasGps: boolean;
  gpsKind: 'real' | 'zeroed' | 'empty' | 'none';
  hasAlpha: boolean;
  imageCount: number;
  expect: 'ok' | 'empty' | 'unsupported' | 'truncated' | 'decode';
  animated?: boolean;
  frameCount?: number;
  pixels?: number;
  heif?: Heif;
  notes?: string[];
}
const oracle = JSON.parse(readFileSync(`${DIR}expected.json`, 'utf8')) as { _doc: string; files: Record<string, Expected> };
const names = Object.keys(oracle.files);
const origem = readFileSync('fixtures/ORIGEM.md', 'utf8');

describe('fixtures/images/expected.json', () => {
  it('lists exactly the files in the folder, so a new fixture cannot arrive without its oracle entry', () => {
    const onDisk = readdirSync(DIR).filter((name) => name !== 'expected.json' && !name.startsWith('.'));
    expect([...onDisk].sort()).toEqual([...names].sort());
  });

  it('documents its own fields', () => {
    expect(oracle._doc).toContain('displayWidth');
    expect(oracle._doc).toContain('gpsKind');
    expect(oracle._doc).toContain('expect');
  });

  it('keeps the discrepancy of heic-09 on record: the GPS tag is there, the coordinates are not', () => {
    const entry = oracle.files['heic-09-samsung-s10-retrato-orientacao6.heic'];
    expect(entry?.hasGps).toBe(true);
    expect(entry?.gpsKind).toBe('empty');
    expect(entry?.notes?.join(' ')).toContain('ORIGEM says this file has real GPS');
    expect(oracle.files['heic-10-visionpro-espacial-2imagens.heic']?.gpsKind).toBe('zeroed');
  });
});

describe('fixtures/ORIGEM.md', () => {
  it('has the SHA-256 of every real fixture, and the files still match', () => {
    const recorded = new Map<string, string>();
    for (const match of origem.matchAll(/^([0-9a-f]{64}) {2}images\/(\S+)$/gm)) recorded.set(match[2] as string, match[1] as string);
    const real = names.filter((name) => !name.startsWith('gen-'));
    expect(real).toHaveLength(13);
    for (const name of real) expect(sha256(read(name)), name).toBe(recorded.get(name));
  });

  it('has a row for each generated file with the SHA-256 of the file on disk and the licence of the source', () => {
    const rows = new Map<string, { from: string; sha: string; run: string }>();
    for (const match of origem.matchAll(/^\| images\/(gen-\S+) \| (.+?) \| \S+ · sha256 ([0-9a-f]{64}) \| (\S+) \|$/gm)) rows.set(match[1] as string, { from: match[2] as string, sha: match[3] as string, run: match[4] as string });
    const generated = names.filter((name) => name.startsWith('gen-'));
    expect(generated).toHaveLength(12);
    for (const name of generated) {
      const row = rows.get(name);
      expect(row, `ORIGEM row of ${name}`).toBeDefined();
      expect(sha256(read(name)), name).toBe(row?.sha);
      expect(row?.run).toBe('F2');
      expect(row?.from, name).toMatch(/uso livre|sem fonte externa/);
    }
    expect(origem).toContain('scripts/fixtures/generate.ts · sha256 ');
  });
});

describe('every fixture measured again by the independent readers', () => {
  for (const name of names) {
    const want = oracle.files[name] as Expected;
    const bytes = read(name);

    it(`${name}: sniffed as ${want.format}`, () => {
      expect(sniff(bytes)).toBe(want.format);
    });

    if (want.expect === 'ok' || want.expect === 'truncated') {
      it(`${name}: size, orientation and GPS`, () => {
        const size = imageSize(bytes);
        expect([size.width, size.height], 'stored').toEqual([want.storedWidth, want.storedHeight]);
        expect([size.displayWidth, size.displayHeight], 'on screen').toEqual([want.displayWidth, want.displayHeight]);
        const report = metadataReport(bytes);
        expect(report.gps, 'gps').toBe(want.hasGps);
        expect(report.gpsKind, 'gps kind').toBe(want.gpsKind);
        if (want.format === 'jpeg') expect(orientation(bytes), 'jpeg orientation').toBe(want.orientation);
      });
    }

    if (want.heif) {
      const heif = want.heif;
      it(`${name}: container matches the oracle`, () => {
        const bmff = parseBmff(bytes);
        expect(bmff.majorBrand).toBe(heif.majorBrand);
        expect(bmff.compatibleBrands).toEqual(heif.compatibleBrands);
        expect(bmff.primaryItemId).toBe(heif.primaryItemId);
        const primary = primaryImage(bmff);
        expect(primary.type).toBe(heif.primaryType);
        expect(primary.ispe).toEqual(heif.ispe);
        expect(primary.irot).toBe(heif.irot);
        expect(primary.imir).toBe(heif.imir);
        expect(primary.displayP3).toBe(heif.iccDisplayP3);
        expect(topLevelImages(bmff).map((item) => item.id)).toEqual(heif.topLevelImageItemIds);
        expect(auxiliaryIds(bmff)).toEqual(heif.auxiliaryItemIds);
        expect(thumbnailIds(bmff)).toEqual(heif.thumbnailItemIds);
        const exifs = exifItems(bytes, bmff);
        expect(exifs.map((item) => item.id)).toEqual(heif.exifItemIds);
        expect(exifs.length > 0).toBe(heif.exifItem);
        expect(topLevelImages(bmff)).toHaveLength(want.imageCount);
      });
    }

    if (want.format === 'heic') {
      it(`${name}: the Exif Orientation repeats the container rotation, and the size on screen counts it once`, () => {
        const bmff = parseBmff(bytes);
        const primaryExif = exifItems(bytes, bmff)[0];
        const tag = primaryExif ? tiffOrientation(primaryExif.tiff) : null;
        expect(tag ?? 1).toBe(want.orientation);
        const primary = primaryImage(bmff);
        // irot counts anticlockwise, the Exif tag clockwise: irot 270 and tag 6 are the same turn
        const clockwise = (360 - (primary.irot ?? 0)) % 360;
        expect(clockwise).toBe(({ 1: 0, 3: 180, 6: 90, 8: 270 } as Record<number, number>)[tag ?? 1]);
        expect([primary.displayWidth, primary.displayHeight]).toEqual(clockwise % 180 === 0 ? primary.ispe : [primary.ispe[1], primary.ispe[0]]);
        expect([primary.displayWidth, primary.displayHeight]).toEqual([want.displayWidth, want.displayHeight]);
      });
    }
  }
});

describe('generated fixtures: the structure they were built for', () => {
  const original = (name: string): Uint8Array => read(name);

  it('gen-jpg-01-orientacao6 and gen-jpg-02-orientacao8 differ from the original Exif by the Orientation value alone', () => {
    for (const [gen, source, tag] of [
      ['gen-jpg-01-orientacao6.jpg', 'jpg-01-pixel2-retrato-gps.jpg', 6],
      ['gen-jpg-02-orientacao8.jpg', 'jpg-02-iphone6-paisagem-gps.jpg', 8],
    ] as const) {
      const made = exifBlock(original(gen));
      const first = exifBlock(original(source));
      expect(made && first, gen).toBeTruthy();
      expect(made?.length).toBe(first?.length);
      const changed = [...(made ?? [])].flatMap((byte, i) => (byte === first?.[i] ? [] : [i]));
      expect(changed, `${gen}: bytes that differ from ${source}`).toHaveLength(1);
      expect(tiffOrientation(made as Uint8Array)).toBe(tag);
      expect(hasGps(original(gen))).toBe(true);
      expect(tiffGpsKind(made as Uint8Array)).toBe('real');
    }
  });

  it('the Exif of the Orientation files comes first, before the JFIF segment, like the camera files', () => {
    for (const name of ['gen-jpg-01-orientacao6.jpg', 'gen-jpg-02-orientacao8.jpg']) {
      expect(segments(original(name))[0]?.marker).toBe(0xe1);
    }
  });

  it('the SOF of the Orientation files is the stored size, not the Exif thumbnail', () => {
    expect(sofSize(original('gen-jpg-01-orientacao6.jpg'))).toMatchObject({ width: 1600, height: 1200 });
    expect(sofSize(original('gen-jpg-02-orientacao8.jpg'))).toMatchObject({ width: 1200, height: 1600 });
    expect(sofSize(original('jpg-01-pixel2-retrato-gps.jpg'))).toMatchObject({ width: 3024, height: 4032 });
  });

  it('gen-png-transparente has real transparency: four clear corners, an opaque middle, a fade in between', () => {
    const png = original('gen-png-transparente.png');
    const info = pngInfo(png);
    expect([info.width, info.height, info.colorType, info.bitDepth]).toEqual([800, 600, 6, 8]);
    expect(pngMetadataChunks(png)).toEqual([]);
    const { rgba, width, height } = pngPixels(png);
    const alphaAt = (x: number, y: number): number => rgba[(y * width + x) * 4 + 3] as number;
    for (const [x, y] of [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]] as const) expect(alphaAt(x, y), `corner ${x},${y}`).toBe(0);
    expect(alphaAt(width / 2, height / 2)).toBe(255);
    const edge = alphaAt(0, height / 2);
    expect(edge).toBeGreaterThan(20);
    expect(edge).toBeLessThan(235);
  });

  it('gen-png-extensao-jpg is an opaque PNG', () => {
    const png = original('gen-png-extensao-jpg.jpg');
    expect(sniff(png)).toBe('png');
    const { rgba } = pngPixels(png);
    let opaque = true;
    for (let i = 3; i < rgba.length; i += 4) if (rgba[i] !== 255) opaque = false;
    expect(opaque).toBe(true);
  });

  it('gen-webp-exif-gps has a VP8X header with the EXIF flag and an EXIF chunk with the GPS of jpg-02', () => {
    const webp = original('gen-webp-exif-gps.webp');
    const info = webpInfo(webp);
    expect(info.chunkTypes).toEqual(['VP8X', 'VP8 ', 'EXIF']);
    expect(info).toMatchObject({ width: 1600, height: 1200, kind: 'extended', hasExif: true, hasXmp: false, animated: false, hasAlpha: false });
    expect((readChunks(webp)[0]?.payload[0] ?? 0) & 0x08, 'VP8X EXIF flag').toBe(0x08);
    const tiff = webpExif(webp);
    expect(tiff && tiffGpsKind(tiff)).toBe('real');
    expect(tiff && tiffOrientation(tiff)).toBe(1);
    expect(tiff).toEqual(exifBlock(original('jpg-02-iphone6-paisagem-gps.jpg')));
  });

  it('gen-webp-animada has two frames of 320x240 and the animation flag', () => {
    const webp = original('gen-webp-animada.webp');
    expect(webpInfo(webp)).toMatchObject({ width: 320, height: 240, animated: true, frameCount: 2, chunkTypes: ['VP8X', 'ANIM', 'ANMF', 'ANMF'] });
    expect(webpFrames(webp)).toEqual([
      { x: 0, y: 0, width: 320, height: 240, durationMs: 500 },
      { x: 0, y: 0, width: 320, height: 240, durationMs: 500 },
    ]);
  });

  it('gen-avif is an AVIF by its major brand, shares mif1 with HEIF, and carries no Exif', () => {
    const avif = original('gen-avif.avif');
    const bmff = parseBmff(avif);
    expect(bmff.majorBrand).toBe('avif');
    expect(bmff.compatibleBrands).toContain('mif1');
    expect(sniff(avif)).toBe('avif');
    expect(sniff(read('heic-06-iphone7-paisagem-gps.heic'))).toBe('heic');
    expect(bmff.items.map((item) => item.type)).toEqual(['av01']);
    expect(exifItems(avif, bmff)).toEqual([]);
    expect(primaryImage(bmff)).toMatchObject({ ispe: [1600, 1200], irot: null, imir: null });
  });

  it('gen-jpg-truncado is cut inside the scan: header and tables intact, no EOI', () => {
    const jpeg = original('gen-jpg-truncado.jpg');
    expect(hasEoi(jpeg)).toBe(false);
    expect(sofSize(jpeg)).toMatchObject({ width: 1600, height: 1200 });
    expect(jpeg.length).toBeGreaterThan(100_000);
    expect(jpeg.length).toBeLessThan(400_000);
  });

  it('gen-jpg-corrompido starts with FF D8 FF and ends with FF D9, but its marker structure does not walk', () => {
    const jpeg = original('gen-jpg-corrompido.jpg');
    expect([...jpeg.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    expect([...jpeg.subarray(jpeg.length - 2)]).toEqual([0xff, 0xd9]);
    expect(() => segments(jpeg)).toThrow(/bad marker/);
    expect(() => markerSegments(jpeg)).toThrow(/bad marker/);
  });

  it('gen-grande-4100x4100 is 4100 x 4100, above the 16,777,216 px canvas limit, and small', () => {
    const jpeg = original('gen-grande-4100x4100.jpg');
    expect(sofSize(jpeg)).toMatchObject({ width: 4100, height: 4100 });
    expect(4100 * 4100).toBe(16_810_000);
    expect(4100 * 4100 - 4096 * 4096).toBe(32_784);
    expect(jpeg.length).toBeLessThan(1_000_000);
    expect(metadataReport(jpeg)).toMatchObject({ exif: false, xmp: false, gps: false });
    expect(hasEoi(jpeg)).toBe(true);
  });

  it('gen-texto-extensao-png is UTF-8 text and gen-vazio is empty', () => {
    const text = original('gen-texto-extensao-png.png');
    expect(new TextDecoder('utf-8', { fatal: true }).decode(text)).toContain('texto');
    expect(original('gen-vazio.jpg')).toHaveLength(0);
  });
});

describe('generator helpers', () => {
  /** A big-endian TIFF with two IFD0 entries (Make, Software) and no Orientation. */
  function tiffWithoutOrientation(): Uint8Array {
    const out = new Uint8Array(8 + 2 + 2 * 12 + 4 + 8);
    const view = new DataView(out.buffer);
    out.set([0x4d, 0x4d, 0, 0x2a]);
    view.setUint32(4, 8);
    view.setUint16(8, 2);
    view.setUint16(10, 0x010f); // Make, ASCII, 4 chars inline
    view.setUint16(12, 2);
    view.setUint32(14, 4);
    out.set([0x41, 0x42, 0x43, 0], 18);
    view.setUint16(22, 0x0131); // Software, ASCII, 8 bytes at offset 38
    view.setUint16(24, 2);
    view.setUint32(26, 8);
    view.setUint32(30, 38);
    view.setUint32(34, 0); // next IFD
    out.set([0x53, 0x57, 0x2d, 0x31, 0x2e, 0x30, 0, 0], 38);
    return out;
  }

  it('setOrientation inserts the tag when the block has none and keeps every other value readable', () => {
    const original = tiffWithoutOrientation();
    expect(tiffOrientation(original)).toBeNull();
    const patched = setOrientation(original, 6);
    expect(tiffOrientation(patched)).toBe(6);
    expect(patched.length).toBeGreaterThan(original.length);
    expect([...patched.subarray(38, 46)]).toEqual([...original.subarray(38, 46)]);
  });

  it('setOrientation patches in place when the tag exists', () => {
    const once = setOrientation(tiffWithoutOrientation(), 6);
    const twice = setOrientation(once, 8);
    expect(twice.length).toBe(once.length);
    expect(tiffOrientation(twice)).toBe(8);
  });

  it('setOrientation works on the little-endian Exif of jpg-01 and the big-endian one of jpg-02', () => {
    for (const name of ['jpg-01-pixel2-retrato-gps.jpg', 'jpg-02-iphone6-paisagem-gps.jpg']) {
      const tiff = findExif(read(name))?.tiff as Uint8Array;
      for (const value of [3, 6, 8]) expect(tiffOrientation(setOrientation(tiff, value))).toBe(value);
    }
  });

  it('exifSegment and withSegmentAfterSoi put the Exif first and replace the old one', () => {
    const jpeg = read('jpg-02-iphone6-paisagem-gps.jpg');
    const tiff = setOrientation(findExif(jpeg)?.tiff as Uint8Array, 8);
    const rebuilt = withSegmentAfterSoi(jpeg, exifSegment(tiff));
    expect(rebuilt.length).toBe(jpeg.length);
    expect(orientation(rebuilt)).toBe(8);
    expect(segments(rebuilt).filter((segment) => segment.marker === 0xe1)).toHaveLength(1);
  });

  it('truncateJpeg never ends on an 0xFF and never keeps the EOI', () => {
    const jpeg = read('jpg-02-iphone6-paisagem-gps.jpg');
    const cut = truncateJpeg(jpeg, 0.6);
    expect(cut.length).toBeLessThanOrEqual(Math.floor(jpeg.length * 0.6));
    expect(cut[cut.length - 1]).not.toBe(0xff);
    expect(hasEoi(cut)).toBe(false);
  });

  it('rotate is exact and reversible', () => {
    const data = Uint8ClampedArray.from({ length: 3 * 2 * 4 }, (_, i) => i);
    const image = { width: 3, height: 2, data };
    const cw = rotate(image, 'cw');
    expect([cw.width, cw.height]).toEqual([2, 3]);
    expect(rotate(cw, 'ccw').data).toEqual(data);
    expect(rotate(rotate(image, '180'), '180').data).toEqual(data);
    expect(rotate(rotate(image, 'cw'), 'cw').data).toEqual(rotate(image, '180').data);
  });

  it('fadeToTransparent leaves the corners clear and the middle opaque', () => {
    const image = { width: 40, height: 30, data: new Uint8ClampedArray(40 * 30 * 4).fill(200) };
    fadeToTransparent(image);
    const alpha = (x: number, y: number): number => image.data[(y * 40 + x) * 4 + 3] as number;
    expect([alpha(0, 0), alpha(39, 0), alpha(0, 29), alpha(39, 29)]).toEqual([0, 0, 0, 0]);
    expect(alpha(20, 15)).toBe(255);
  });

  it('withExif and animation build RIFF files whose size field is right', () => {
    const photo = read('gen-webp-exif-gps.webp');
    const tiff = new Uint8Array([0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0]); // an empty IFD and an odd length on purpose
    const wrapped = withExif(photo, tiff, 1600, 1200);
    expect(webpInfo(wrapped).chunkTypes).toEqual(['VP8X', 'VP8 ', 'EXIF']);
    expect(webpExif(wrapped)).toEqual(tiff);
    const frames = animation([photo, photo], 1600, 1200, 40);
    expect(webpInfo(frames)).toMatchObject({ animated: true, frameCount: 2 });
  });
});
