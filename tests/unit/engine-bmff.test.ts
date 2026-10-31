import { describe, expect, it } from 'vitest';
import {
  displayInfo,
  exifItemId,
  exifItemOrientation,
  hasAlphaAuxiliary,
  iccIsDisplayP3,
  isDisplayP3,
  itemRanges,
  parseHeif,
  primaryCodec,
  primaryColour,
  primaryInfo,
  topLevelImages,
} from '../../src/engine/image/bmff.ts';
import { auxC, box, buildHeif, cat, clap, colrIcc, colrNclx, imir, irot, ispe, simpleHeif, text, u16, u32 } from './lib/bytes.ts';
import { fixture, names, oracle } from './lib/oracle.ts';

describe('bmff: the ten HEIC files against the oracle', () => {
  for (const name of names('heic-')) {
    it(`${name.slice(0, 7)} primary item, display size, images, Exif and colour`, () => {
      const entry = oracle()[name]!;
      const oracleHeif = entry.heif!;
      const bytes = fixture(name);
      const heif = parseHeif(bytes)!;
      expect(heif).not.toBeNull();
      expect(heif.majorBrand).toBe(oracleHeif.majorBrand);
      expect(heif.compatibleBrands).toEqual(oracleHeif.compatibleBrands);
      expect(heif.primaryId).toBe(oracleHeif.primaryItemId);

      const primary = primaryInfo(heif)!;
      expect(primary.type).toBe(oracleHeif.primaryType);
      expect([primary.storedWidth, primary.storedHeight]).toEqual(oracleHeif.ispe);
      expect([primary.width, primary.height]).toEqual([entry.displayWidth, entry.displayHeight]);
      const rotation = primary.transforms.find((transform) => transform.kind === 'irot');
      expect(rotation?.kind === 'irot' ? rotation.degrees : null).toBe(oracleHeif.irot);
      expect(primary.transforms.some((transform) => transform.kind === 'imir')).toBe(oracleHeif.imir !== null);

      // Gain maps, depth maps, thumbnails and grid tiles are not images the user sees.
      const images = topLevelImages(heif);
      expect(images).toEqual(oracleHeif.topLevelImageItemIds);
      expect(images.length).toBe(entry.imageCount);
      for (const id of [...oracleHeif.auxiliaryItemIds, ...oracleHeif.thumbnailItemIds]) expect(images).not.toContain(id);

      // The Exif item that describes the primary image (heic-10 has two Exif items, one per eye).
      expect(oracleHeif.exifItemIds).toContain(exifItemId(heif));
      expect(exifItemOrientation(bytes, heif) ?? 1).toBe(entry.orientation);

      expect(isDisplayP3(primaryColour(heif))).toBe(oracleHeif.iccDisplayP3);
      expect(primaryCodec(heif)).toBe('heic');
      expect(heif.cut).toBe(false);
      expect(heif.extentsEnd).toBeLessThanOrEqual(bytes.length);
      expect(hasAlphaAuxiliary(heif)).toBe(false);
    });
  }

  it('heic-10 describes the primary image with the first of its two Exif items', () => {
    const name = names('heic-10')[0]!;
    const heif = parseHeif(fixture(name))!;
    expect(heif.primaryId).toBe(26);
    expect(exifItemId(heif)).toBe(54);
    expect(topLevelImages(heif)).toEqual([26, 52]);
  });

  it('shows the double-rotation trap of heic-05 and heic-09: irot already turns the photo, the Exif tag says 6 as well', () => {
    for (const name of [...names('heic-05'), ...names('heic-09')]) {
      const bytes = fixture(name);
      const heif = parseHeif(bytes)!;
      const primary = primaryInfo(heif)!;
      expect([primary.storedWidth, primary.storedHeight]).toEqual([4032, 3024]);
      expect([primary.width, primary.height]).toEqual([3024, 4032]);
      expect(exifItemOrientation(bytes, heif)).toBe(6);
    }
  });

  it('finds the item data ranges, whichever order meta and mdat come in', () => {
    const name = names('heic-09')[0]!;
    const bytes = fixture(name);
    const heif = parseHeif(bytes)!;
    const boxes: string[] = [];
    for (let at = 0; at + 8 <= bytes.length; ) {
      const size = new DataView(bytes.buffer, bytes.byteOffset).getUint32(at);
      boxes.push(String.fromCharCode(...bytes.subarray(at + 4, at + 8)));
      at += size;
    }
    expect(boxes.indexOf('mdat')).toBeLessThan(boxes.indexOf('meta')); // meta after mdat
    const range = itemRanges(heif, exifItemId(heif)!)![0]!;
    expect(range.end).toBeLessThanOrEqual(bytes.length);
    expect(range.end - range.start).toBeGreaterThan(8);
  });
});

describe('bmff: what the fixtures cannot prove, from bytes built here', () => {
  it('swaps the display size for irot 90 and 270, not for 180', () => {
    for (const [quarterTurns, width, height] of [
      [0, 200, 100],
      [1, 100, 200],
      [2, 200, 100],
      [3, 100, 200],
    ] as const) {
      const heif = parseHeif(simpleHeif({ width: 200, height: 100, transforms: [irot(quarterTurns)] }))!;
      const primary = primaryInfo(heif)!;
      expect([primary.width, primary.height], `irot ${quarterTurns * 90}`).toEqual([width, height]);
      expect([primary.storedWidth, primary.storedHeight]).toEqual([200, 100]);
    }
  });

  it('keeps the size for imir and records the axis', () => {
    for (const axis of [0, 1] as const) {
      const primary = primaryInfo(parseHeif(simpleHeif({ width: 200, height: 100, transforms: [imir(axis)] }))!)!;
      expect([primary.width, primary.height]).toEqual([200, 100]);
      expect(primary.transforms).toEqual([{ kind: 'imir', axis }]);
    }
  });

  it('crops to the clean aperture and applies the properties in association order', () => {
    const cropped = primaryInfo(parseHeif(simpleHeif({ width: 200, height: 100, transforms: [clap(150, 80, 2, -3)] }))!)!;
    expect([cropped.width, cropped.height]).toEqual([150, 80]);
    expect(cropped.transforms).toEqual([{ kind: 'clap', width: 150, height: 80, xOffset: 2, yOffset: -3 }]);
  });

  it('turns after cropping and cropping after turning give the same shape here', () => {
    const cropThenTurn = primaryInfo(parseHeif(simpleHeif({ width: 200, height: 100, transforms: [clap(100, 50), irot(1)] }))!)!;
    const turnThenCrop = primaryInfo(parseHeif(simpleHeif({ width: 200, height: 100, transforms: [irot(1), clap(50, 100)] }))!)!;
    expect([cropThenTurn.width, cropThenTurn.height]).toEqual([50, 100]);
    expect([turnThenCrop.width, turnThenCrop.height]).toEqual([50, 100]);
  });

  it('reads 15-bit property indexes (ipma flags 1) and 32-bit ids (infe 3, pitm 1, iloc 2, ipma 1, iref 1)', () => {
    const bytes = buildHeif({
      major: 'heic',
      compatible: ['mif1'],
      primary: 70000,
      pitmVersion: 1,
      infeVersion: 3,
      ilocVersion: 2,
      irefVersion: 1,
      ipma: { version: 1, flags: 1 },
      items: [
        { id: 70000, type: 'hvc1' },
        { id: 70001, type: 'hvc1' },
        { id: 70002, type: 'Exif' },
      ],
      properties: [ispe(640, 480), irot(1), ispe(64, 48)],
      associations: { 70000: [1, 2], 70001: [3] },
      refs: [{ type: 'cdsc', from: 70002, to: [70000] }],
      data: { 70000: new Uint8Array(30), 70002: new Uint8Array([0, 0, 0, 0, 1, 2, 3, 4]) },
    });
    const heif = parseHeif(bytes)!;
    expect(heif.primaryId).toBe(70000);
    const primary = primaryInfo(heif)!;
    expect([primary.width, primary.height]).toEqual([480, 640]);
    expect(topLevelImages(heif)).toEqual([70000, 70001]);
    expect(exifItemId(heif)).toBe(70002);
    expect(itemRanges(heif, 70002)![0]!.end - itemRanges(heif, 70002)![0]!.start).toBe(8);
  });

  it('reads iloc version 0 and a plain hvc1 primary that is not a grid', () => {
    const heif = parseHeif(simpleHeif({ width: 33, height: 44, ilocVersion: 0 }))!;
    const primary = primaryInfo(heif)!;
    expect(primary.type).toBe('hvc1');
    expect([primary.width, primary.height]).toEqual([33, 44]);
    expect(topLevelImages(heif)).toEqual([1]);
    expect(itemRanges(heif, 1)).toHaveLength(1);
  });

  it('leaves tiles, thumbnails, auxiliary maps and hidden items out of the images', () => {
    const bytes = buildHeif({
      major: 'heic',
      compatible: ['mif1', 'heic'],
      primary: 1,
      items: [
        { id: 1, type: 'grid' },
        { id: 2, type: 'hvc1', hidden: true },
        { id: 3, type: 'hvc1', hidden: true },
        { id: 4, type: 'hvc1' }, // thumbnail
        { id: 5, type: 'hvc1' }, // gain map
        { id: 6, type: 'hvc1' }, // a second picture
        { id: 7, type: 'hvc1', hidden: true }, // hidden, not a tile
      ],
      properties: [ispe(32, 16), ispe(16, 16), auxC('urn:com:apple:photo:2020:aux:hdrgainmap')],
      associations: { 1: [1], 2: [2], 3: [2], 4: [2], 5: [2, 3], 6: [2] },
      refs: [
        { type: 'dimg', from: 1, to: [2, 3] },
        { type: 'thmb', from: 4, to: [1] },
        { type: 'auxl', from: 5, to: [1] },
      ],
      data: { 1: new Uint8Array(8) },
    });
    expect(topLevelImages(parseHeif(bytes)!)).toEqual([1, 6]);
  });

  it('works with meta after mdat', () => {
    const heif = parseHeif(simpleHeif({ width: 10, height: 20, metaAfterMdat: true }))!;
    expect(primaryInfo(heif)).toMatchObject({ width: 10, height: 20 });
    expect(heif.cut).toBe(false);
  });

  it('knows the file is cut when mdat or meta run past the end', () => {
    const whole = simpleHeif({ width: 10, height: 20 });
    expect(parseHeif(whole)!.cut).toBe(false);
    expect(parseHeif(whole.subarray(0, whole.length - 5))!.cut).toBe(true);
    const metaFirstCut = cat(whole.subarray(0, 40)); // inside meta
    expect(parseHeif(metaFirstCut)!.cut).toBe(true);
    // The extents the iloc box promises are visible even for a cut that spares the boxes.
    const heif = parseHeif(whole)!;
    expect(heif.extentsEnd).toBe(whole.length);
  });

  it('returns null for a file that does not start with ftyp', () => {
    expect(parseHeif(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toBeNull();
    expect(parseHeif(new Uint8Array(0))).toBeNull();
    expect(parseHeif(cat(box('free', [1, 2, 3, 4])))).toBeNull();
  });

  it('finds an alpha plane among the auxiliary images', () => {
    const bytes = buildHeif({
      major: 'avif',
      compatible: ['mif1'],
      primary: 1,
      items: [
        { id: 1, type: 'av01' },
        { id: 2, type: 'av01' },
      ],
      properties: [ispe(8, 8), auxC('urn:mpeg:mpegB:cicp:systems:auxiliary:alpha')],
      associations: { 1: [1], 2: [1, 2] },
      refs: [{ type: 'auxl', from: 2, to: [1] }],
      data: { 1: new Uint8Array(8) },
    });
    const heif = parseHeif(bytes)!;
    expect(hasAlphaAuxiliary(heif)).toBe(true);
    expect(topLevelImages(heif)).toEqual([1]);
    expect(primaryCodec(heif)).toBe('avif');
    expect(displayInfo(heif, 99)).toBeNull();
  });
});

// --- Display P3 --------------------------------------------------------------------------------

function s15(value: number): number[] {
  return u32(Math.round(value * 65536) >>> 0);
}

function icc(tags: Record<string, Uint8Array>): Uint8Array {
  const signatures = Object.keys(tags);
  const table = 4 + signatures.length * 12;
  let offset = 128 + table;
  const entries: number[][] = [];
  for (const signature of signatures) {
    const data = tags[signature]!;
    entries.push([...text(signature), ...u32(offset), ...u32(data.length)]);
    offset += data.length;
  }
  return cat(new Uint8Array(128), u32(signatures.length), ...entries.map((entry) => Uint8Array.from(entry)), ...Object.values(tags));
}

const xyz = (x: number, y: number, z: number) => cat(text('XYZ '), u32(0), s15(x), s15(y), s15(z));
const descAscii = (value: string) => cat(text('desc'), u32(0), u32(value.length + 1), text(value), [0]);
const descUtf16 = (value: string) => cat(text('mluc'), u32(0), u32(1), u32(12), text('enUS'), u32(value.length * 2), u32(28), ...[...value].map((char) => u16(char.charCodeAt(0))));

describe('bmff: Display P3 detection', () => {
  it('recognises the description text, ASCII or UTF-16', () => {
    expect(iccIsDisplayP3(icc({ desc: descAscii('Display P3') }))).toBe(true);
    expect(iccIsDisplayP3(icc({ desc: descUtf16('Display P3') }))).toBe(true);
    expect(iccIsDisplayP3(icc({ desc: descAscii('sRGB IEC61966-2.1') }))).toBe(false);
  });

  it('recognises the colorants when the description says something else', () => {
    const p3 = { desc: descAscii('Wide gamut screen'), rXYZ: xyz(0.5151, 0.2412, -0.0011), gXYZ: xyz(0.292, 0.6922, 0.0419), bXYZ: xyz(0.1571, 0.0666, 0.7841) };
    expect(iccIsDisplayP3(icc(p3))).toBe(true);
    const srgb = { desc: descAscii('Screen'), rXYZ: xyz(0.4361, 0.2225, 0.0139), gXYZ: xyz(0.3851, 0.7169, 0.0971), bXYZ: xyz(0.1431, 0.0606, 0.7141) };
    expect(iccIsDisplayP3(icc(srgb))).toBe(false);
  });

  it('says no to a profile that is too short or empty', () => {
    expect(iccIsDisplayP3(new Uint8Array(10))).toBe(false);
    expect(iccIsDisplayP3(icc({}))).toBe(false);
  });

  it('reads nclx primaries and the ICC profile of the primary image', () => {
    const withColour = (colour: Uint8Array) =>
      parseHeif(simpleHeif({ width: 8, height: 8, transforms: [colour] }))!;
    expect(isDisplayP3(primaryColour(withColour(colrNclx(12))))).toBe(true);
    expect(isDisplayP3(primaryColour(withColour(colrNclx(1))))).toBe(false);
    expect(isDisplayP3(primaryColour(withColour(colrIcc(icc({ desc: descAscii('Display P3') })))))).toBe(true);
    expect(isDisplayP3(primaryColour(parseHeif(simpleHeif({ width: 8, height: 8 }))!))).toBe(false);
  });

  it('reads the Exif Orientation of an Exif item in both byte orders', () => {
    for (const order of ['big', 'little'] as const) {
      const tiff =
        order === 'big'
          ? cat(text('MM'), u16(42), u32(8), u16(1), u16(0x0112), u16(3), u32(1), u16(6), u16(0), u32(0))
          : cat(text('II'), [42, 0], [8, 0, 0, 0], [1, 0], [0x12, 0x01], [3, 0], [1, 0, 0, 0], [6, 0], [0, 0], [0, 0, 0, 0]);
      const exif = cat(u32(6), text('Exif'), [0, 0], tiff);
      const bytes = buildHeif({
        major: 'heic',
        compatible: ['mif1'],
        primary: 1,
        items: [
          { id: 1, type: 'hvc1' },
          { id: 2, type: 'Exif' },
        ],
        properties: [ispe(8, 8)],
        associations: { 1: [1] },
        refs: [{ type: 'cdsc', from: 2, to: [1] }],
        data: { 1: new Uint8Array(8), 2: exif },
      });
      expect(exifItemOrientation(bytes, parseHeif(bytes)!), order).toBe(6);
    }
  });
});
