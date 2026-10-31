// The metadata and header readers of tests/e2e/lib, proven on files that DO carry what they look for.
// A reader that finds nothing proves nothing, so every "this output is clean" assertion in the
// matrix rests on these positive controls: the GPS of jpg-02, the WebP EXIF chunk, the Exif item of
// a HEIC, a PNG with eXIf and text chunks, and a PDF that embeds the original JPEG.
import { readFileSync } from 'node:fs';
import { PDFDocument } from '@cantoo/pdf-lib';
import { Zip, ZipPassThrough, zipSync, zlibSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { auxiliaryIds, exifItems, parseBmff, primaryImage, topLevelImages, xmpItems } from '../e2e/lib/bmff.ts';
import { imageSize, metadataReport, mimeOf, sniff } from '../e2e/lib/images.ts';
import { exifBlock, hasEoi, hasGps, jpegMetadata, orientation, segments, sofSize, tiffGpsKind, tiffHasGps, withOrientation } from '../e2e/lib/jpeg.ts';
import { parsePdf } from '../e2e/lib/pdf.ts';
import { meanAbsDiff, orientGrid, orientThumbnail } from '../e2e/lib/pixels.ts';
import { pngChunks, pngColorChunks, pngExif, pngInfo, pngMetadataChunks, pngPixels, pngText } from '../e2e/lib/png.ts';
import { crc32, readZip, zipNames } from '../e2e/lib/zip.ts';
import { chunk as riffChunk, readChunks, riff } from '../../scripts/fixtures/lib/webp.ts';
import { webpChunks, webpExif, webpInfo, webpMetadataChunks } from '../e2e/lib/webp.ts';

const read = (name: string): Uint8Array => new Uint8Array(readFileSync(`fixtures/images/${name}`));
const JPG01 = 'jpg-01-pixel2-retrato-gps.jpg';
const JPG02 = 'jpg-02-iphone6-paisagem-gps.jpg';
const JPG03 = 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg';
const same = (a: Uint8Array, b: Uint8Array): boolean => Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;
const ascii = (text: string): number[] => [...text].map((char) => char.charCodeAt(0));

describe('jpeg.ts', () => {
  it('finds the Exif block and the GPS of jpg-02 (positive control)', () => {
    const jpeg = read(JPG02);
    expect(exifBlock(jpeg)).not.toBeNull();
    expect(hasGps(jpeg)).toBe(true);
    expect(tiffHasGps(exifBlock(jpeg) as Uint8Array)).toBe(true);
    expect(tiffGpsKind(exifBlock(jpeg) as Uint8Array)).toBe('real');
    expect(jpegMetadata(jpeg)).toMatchObject({ exif: true, xmp: false, gps: true, orientation: 1 });
  });

  it('finds the GPS in the little-endian Exif of jpg-01 as well as the big-endian ones', () => {
    for (const name of [JPG01, JPG02, JPG03]) expect(hasGps(read(name)), name).toBe(true);
  });

  it('reads the Orientation: 3 for jpg-03, 1 for the others, 1 when there is no Exif at all', () => {
    expect(orientation(read(JPG03))).toBe(3);
    expect(orientation(read(JPG01))).toBe(1);
    expect(orientation(read('gen-grande-4100x4100.jpg'))).toBe(1);
    expect(jpegMetadata(read('gen-grande-4100x4100.jpg')).orientation).toBeNull();
  });

  it('reads the size of the image from the SOF, not of the thumbnail inside the Exif', () => {
    expect(sofSize(read(JPG02))).toMatchObject({ width: 3264, height: 2448, components: 3, precision: 8, marker: 0xc0 });
    expect(sofSize(read(JPG01))).toMatchObject({ width: 3024, height: 4032 });
    // the Exif thumbnail is a JPEG with its own SOF: a byte search would find 160x120 first
    const bytes = read(JPG02);
    const first = Buffer.from(bytes).indexOf(Buffer.from([0xff, 0xc0]));
    expect(first).toBeLessThan(5000); // inside the Exif segment, long before the real SOF
    expect([(bytes[first + 7] as number) * 256 + (bytes[first + 8] as number), (bytes[first + 5] as number) * 256 + (bytes[first + 6] as number)]).toEqual([160, 120]);
  });

  it('withOrientation patches the tag alone, and throws without a tag', () => {
    const jpeg = read(JPG03);
    const flat = withOrientation(jpeg, 1);
    expect(orientation(flat)).toBe(1);
    expect(flat.length).toBe(jpeg.length);
    expect([...flat].filter((byte, i) => byte !== jpeg[i])).toHaveLength(1);
    expect(orientation(jpeg)).toBe(3);
    expect(() => withOrientation(read('gen-grande-4100x4100.jpg'), 1)).toThrow(/no Exif/);
  });

  it('flags XMP in APP1 and IPTC in APP13, and passes a clean JPEG', () => {
    const app = (marker: number, body: number[]): number[] => [0xff, marker, (body.length + 2) >> 8, (body.length + 2) & 0xff, ...body];
    const frame = [0xff, 0xc0, 0, 11, 8, 0, 1, 0, 1, 1, 1, 0x11, 0];
    const make = (...segmentsToAdd: number[][]): Uint8Array => Uint8Array.from([0xff, 0xd8, ...segmentsToAdd.flat(), ...frame, 0xff, 0xda, 0, 2, 0xff, 0xd9]);
    const xmp = make(app(0xe1, [...ascii('http://ns.adobe.com/xap/1.0/'), 0, ...ascii('<x:xmpmeta/>')]));
    expect(jpegMetadata(xmp)).toMatchObject({ exif: false, xmp: true, iptc: false, gps: false });
    const iptc = make(app(0xed, [...ascii('Photoshop 3.0'), 0]));
    expect(jpegMetadata(iptc)).toMatchObject({ iptc: true, xmp: false });
    const clean = make(app(0xe0, [...ascii('JFIF'), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]));
    expect(jpegMetadata(clean)).toMatchObject({ exif: false, xmp: false, iptc: false, gps: false, apps: ['E0'] });
  });

  it('says whether the file ends with EOI', () => {
    expect(hasEoi(read(JPG02))).toBe(true);
    expect(hasEoi(read('gen-jpg-truncado.jpg'))).toBe(false);
    expect(() => segments(read('gen-jpg-corrompido.jpg'))).toThrow();
  });

  it('classifies the GPS IFD of the HEIC files: real, zeroed and empty', () => {
    const kind = (name: string): string => {
      const bytes = read(name);
      const kinds = exifItems(bytes).map((item) => tiffGpsKind(item.tiff));
      return kinds.find((value) => value !== 'none') ?? 'none';
    };
    expect(kind('heic-04-iphone11promax-retrato-livephoto-gps.heic')).toBe('real');
    expect(kind('heic-10-visionpro-espacial-2imagens.heic')).toBe('zeroed');
    expect(kind('heic-09-samsung-s10-retrato-orientacao6.heic')).toBe('empty');
    expect(kind('heic-01-iphone11pro-retrato-livephoto.heic')).toBe('none');
  });
});

describe('png.ts', () => {
  function chunk(type: string, data: number[]): number[] {
    const body = Uint8Array.from([...ascii(type), ...data]);
    const crc = crc32(body);
    return [(data.length >>> 24) & 0xff, (data.length >> 16) & 0xff, (data.length >> 8) & 0xff, data.length & 0xff, ...body, crc >>> 24, (crc >> 16) & 0xff, (crc >> 8) & 0xff, crc & 0xff];
  }
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const header = (width: number, height: number, colorType: number): number[] => chunk('IHDR', [0, 0, 0, width, 0, 0, 0, height, 8, colorType, 0, 0, 0]);
  const exifTiff = (): number[] => {
    // big-endian TIFF, IFD0 with the GPSInfo pointer only
    return [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x88, 0x25, 0, 4, 0, 0, 0, 1, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0];
  };

  it('flags eXIf, tEXt, zTXt, iTXt and tIME, and reads the GPS inside eXIf (positive control)', () => {
    const png = Uint8Array.from([
      ...signature,
      ...header(1, 1, 2),
      ...chunk('eXIf', exifTiff()),
      ...chunk('tEXt', [...ascii('Comment'), 0, ...ascii('51.7 N 0.3 W')]),
      ...chunk('zTXt', [...ascii('Place'), 0, 0, ...zlibSync(Uint8Array.from(ascii('Cardiff')))]),
      ...chunk('iTXt', [...ascii('XML:com.adobe.xmp'), 0, 0, 0, 0, 0, ...ascii('<x:xmpmeta/>')]),
      ...chunk('tIME', [7, 234, 10, 31, 12, 0, 0]),
      ...chunk('IDAT', [...zlibSync(Uint8Array.from([0, 1, 2, 3]))]),
      ...chunk('IEND', []),
    ]);
    expect(pngMetadataChunks(png)).toEqual(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME']);
    expect(pngChunks(png).every((entry) => entry.crcOk)).toBe(true);
    expect(tiffHasGps(pngExif(png) as Uint8Array)).toBe(true);
    expect(pngText(png)).toEqual([
      { chunk: 'tEXt', keyword: 'Comment', text: '51.7 N 0.3 W' },
      { chunk: 'zTXt', keyword: 'Place', text: 'Cardiff' },
      { chunk: 'iTXt', keyword: 'XML:com.adobe.xmp', text: '<x:xmpmeta/>' },
    ]);
    expect(metadataReport(png)).toMatchObject({ format: 'png', exif: true, gps: true, xmp: true, other: ['tEXt', 'zTXt', 'iTXt', 'tIME'] });
  });

  it('passes a clean PNG and reports the colour chunks apart', () => {
    const png = read('gen-png-transparente.png');
    expect(pngMetadataChunks(png)).toEqual([]);
    expect(pngColorChunks(png)).toEqual([]);
    expect(metadataReport(png)).toMatchObject({ exif: false, xmp: false, gps: false, other: [] });
    const tagged = Uint8Array.from([...signature, ...header(1, 1, 2), ...chunk('iCCP', [...ascii('P3'), 0, 0, 1]), ...chunk('IEND', [])]);
    expect(pngColorChunks(tagged)).toEqual(['iCCP']);
    expect(pngMetadataChunks(tagged)).toEqual([]);
  });

  it('reads the header, the alpha channel and a corrupt CRC', () => {
    expect(pngInfo(read('gen-png-transparente.png'))).toMatchObject({ width: 800, height: 600, colorType: 6, hasAlphaChannel: true, interlaced: false, bitDepth: 8 });
    const broken = read('gen-png-extensao-jpg.jpg').slice();
    broken[40] = (broken[40] as number) ^ 0xff;
    expect(pngChunks(broken).some((entry) => !entry.crcOk)).toBe(true);
  });

  it('decodes filtered scanlines (Sub, Up, Average, Paeth) of an RGBA PNG', () => {
    // 2x4 RGBA image, rows filtered with 1, 2, 3, 4 from the same raw pixels
    const raw = [
      [10, 20, 30, 255, 12, 22, 32, 200],
      [14, 24, 34, 255, 16, 26, 36, 100],
      [18, 28, 38, 255, 20, 30, 40, 50],
      [22, 32, 42, 255, 24, 34, 44, 0],
    ];
    const filtered: number[] = [];
    raw.forEach((row, y) => {
      const filter = y + 1;
      filtered.push(filter);
      row.forEach((value, x) => {
        const left = x >= 4 ? (row[x - 4] as number) : 0;
        const up = y > 0 ? ((raw[y - 1] as number[])[x] as number) : 0;
        const upLeft = y > 0 && x >= 4 ? ((raw[y - 1] as number[])[x - 4] as number) : 0;
        let predicted = 0;
        if (filter === 1) predicted = left;
        if (filter === 2) predicted = up;
        if (filter === 3) predicted = (left + up) >> 1;
        if (filter === 4) {
          const p = left + up - upLeft;
          const [pa, pb, pc] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
          predicted = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        }
        filtered.push((value - predicted) & 0xff);
      });
    });
    const png = Uint8Array.from([...signature, ...chunk('IHDR', [0, 0, 0, 2, 0, 0, 0, 4, 8, 6, 0, 0, 0]), ...chunk('IDAT', [...zlibSync(Uint8Array.from(filtered))]), ...chunk('IEND', [])]);
    const { width, height, rgba } = pngPixels(png);
    expect([width, height]).toEqual([2, 4]);
    expect([...rgba]).toEqual(raw.flat());
  });
});

describe('webp.ts', () => {
  it('finds the EXIF chunk and the GPS of gen-webp-exif-gps (positive control)', () => {
    const webp = read('gen-webp-exif-gps.webp');
    expect(webpMetadataChunks(webp)).toEqual(['EXIF']);
    expect(webpInfo(webp)).toMatchObject({ width: 1600, height: 1200, hasExif: true });
    expect(tiffHasGps(webpExif(webp) as Uint8Array)).toBe(true);
    expect(metadataReport(webp)).toMatchObject({ format: 'webp', exif: true, gps: true, gpsKind: 'real', orientation: 1 });
  });

  it('accepts an EXIF chunk with the "Exif\\0\\0" prefix some writers add', () => {
    const webp = read('gen-webp-exif-gps.webp');
    const image = readChunks(webp).find((chunk) => chunk.fourcc === 'VP8 ')?.whole as Uint8Array;
    const tiff = [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8];
    const prefixed = riff([image, riffChunk('EXIF', Uint8Array.from([...ascii('Exif'), 0, 0, ...tiff]))]);
    const bare = riff([image, riffChunk('EXIF', Uint8Array.from(tiff))]);
    expect([...(webpExif(prefixed) as Uint8Array)]).toEqual(tiff);
    expect([...(webpExif(bare) as Uint8Array)]).toEqual(tiff);
  });

  it('passes a plain lossy WebP with only the bitstream, and flags an XMP chunk', () => {
    const image = readChunks(read('gen-webp-exif-gps.webp')).find((chunk) => chunk.fourcc === 'VP8 ')?.whole as Uint8Array;
    const plain = riff([image]);
    expect(webpInfo(plain)).toMatchObject({ width: 1600, height: 1200, kind: 'lossy', hasAlpha: false, hasExif: false, animated: false, frameCount: 1 });
    expect(metadataReport(plain)).toMatchObject({ exif: false, xmp: false, gps: false });
    const withXmp = riff([image, riffChunk('XMP ', Uint8Array.from(ascii('<x/>')))]);
    expect(webpMetadataChunks(withXmp)).toEqual(['XMP ']);
    expect(metadataReport(withXmp).xmp).toBe(true);
  });

  it('refuses a RIFF whose size field is wrong', () => {
    const webp = read('gen-webp-exif-gps.webp').slice();
    webp[4] = (webp[4] as number) ^ 1;
    expect(() => webpChunks(webp)).toThrow(/RIFF size/);
  });
});

describe('bmff.ts', () => {
  it('finds the Exif item and the real GPS of heic-04 (positive control)', () => {
    const bytes = read('heic-04-iphone11promax-retrato-livephoto-gps.heic');
    const items = exifItems(bytes);
    expect(items).toHaveLength(1);
    expect(tiffHasGps(items[0]?.tiff as Uint8Array)).toBe(true);
    expect(tiffGpsKind(items[0]?.tiff as Uint8Array)).toBe('real');
    expect(metadataReport(bytes)).toMatchObject({ format: 'heic', exif: true, gps: true, gpsKind: 'real' });
  });

  it('finds the XMP packet of a Live Photo and the zeroed GPS of heic-10, with two photos', () => {
    expect(xmpItems(read('heic-01-iphone11pro-retrato-livephoto.heic'))[0]?.xml).toContain('xmpmeta');
    const bytes = read('heic-10-visionpro-espacial-2imagens.heic');
    const bmff = parseBmff(bytes);
    expect(topLevelImages(bmff).map((item) => item.id)).toEqual([26, 52]);
    expect(bmff.primaryItemId).toBe(26);
    expect(metadataReport(bytes)).toMatchObject({ gps: true, gpsKind: 'zeroed' });
  });

  it('walks heic-09, whose meta box comes after mdat and which ends with a box of its own', () => {
    const bmff = parseBmff(read('heic-09-samsung-s10-retrato-orientacao6.heic'));
    expect(bmff.metaBeforeMdat).toBe(false);
    expect(bmff.topLevelBoxes).toEqual(['ftyp', 'mdat', 'meta', 'sefd']);
    expect(primaryImage(bmff)).toMatchObject({ ispe: [4032, 3024], irot: 270, displayWidth: 3024, displayHeight: 4032, displayP3: false });
  });

  it('keeps gain maps, depth maps and thumbnails out of the photos', () => {
    const bmff = parseBmff(read('heic-07-iphone13pro-paisagem-profundidade-hdr-gps.heic'));
    expect(auxiliaryIds(bmff)).toEqual([52, 54]);
    expect(topLevelImages(bmff).map((item) => item.id)).toEqual([49]);
  });

  it('takes the primary from pitm, not the first image: heic-10 with its pitm pointed at the second photo', () => {
    const bytes = read('heic-10-visionpro-espacial-2imagens.heic').slice();
    const at = Buffer.from(bytes).indexOf(Buffer.from('pitm'));
    expect(at).toBeGreaterThan(0);
    // pitm: size, "pitm", version+flags, item_ID (16 bits) = 26
    expect((bytes[at + 8] as number) * 256 + (bytes[at + 9] as number)).toBe(26);
    bytes[at + 9] = 52;
    const bmff = parseBmff(bytes);
    expect(bmff.primaryItemId).toBe(52);
    expect(primaryImage(bmff).id).toBe(52);
  });

  it('applies irot 90 with imir and clap in association order, on bytes built for the case (nothing in the fixtures covers them)', () => {
    const u32 = (value: number): number[] => [(value >>> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
    const box = (type: string, ...payload: number[][]): number[] => {
      const body = payload.flat();
      return [...u32(body.length + 8), ...ascii(type), ...body];
    };
    const full = (type: string, version: number, flags: number, ...payload: number[][]): number[] => box(type, [version, (flags >> 16) & 0xff, (flags >> 8) & 0xff, flags & 0xff], ...payload);
    const infe = full('infe', 3, 0, u32(7), [0, 0], ascii('hvc1'), [0]);
    const ipco = box('ipco', full('ispe', 0, 0, u32(400), u32(300)), box('irot', [1]), box('imir', [0]));
    // ipma version 1 (32-bit item ids) with flags 1 (15-bit property indexes): properties 1, 2, 3
    const ipma = full('ipma', 1, 1, u32(1), u32(7), [3], [0x80, 1], [0x80, 2], [0x00, 3]);
    const meta = full('meta', 0, 0, full('pitm', 1, 0, u32(7)), full('iinf', 1, 0, u32(1), infe), box('iprp', ipco, ipma));
    const file = Uint8Array.from([...box('ftyp', ascii('mif1'), u32(0), ascii('mif1'), ascii('heic')), ...meta]);
    const bmff = parseBmff(file);
    expect(bmff.primaryItemId).toBe(7);
    expect(primaryImage(bmff)).toMatchObject({ id: 7, type: 'hvc1', ispe: [400, 300], irot: 90, imir: 0, displayWidth: 300, displayHeight: 400 });
    expect(sniff(file)).toBe('heic');
  });

  it('decides AVIF or HEIC by the major brand, then the compatible brands, then the items', () => {
    const u32 = (value: number): number[] => [(value >>> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
    const ftyp = (major: string, ...compatible: string[]): Uint8Array => Uint8Array.from([...u32(16 + compatible.length * 4), ...ascii('ftyp'), ...ascii(major), ...u32(0), ...compatible.flatMap(ascii)]);
    expect(sniff(ftyp('avif', 'mif1', 'miaf'))).toBe('avif');
    expect(sniff(ftyp('heic', 'mif1'))).toBe('heic');
    expect(sniff(ftyp('mif1', 'avif', 'miaf'))).toBe('avif');
    expect(sniff(ftyp('mif1', 'heic'))).toBe('heic');
    expect(sniff(ftyp('mif1', 'miaf'))).toBe('unknown');
    expect(sniff(read('gen-avif.avif'))).toBe('avif');
  });
});

describe('pdf.ts', () => {
  async function build(jpegs: Uint8Array[], useObjectStreams = false): Promise<Uint8Array> {
    const doc = await PDFDocument.create({ updateMetadata: false });
    doc.setProducer('FileOrca');
    doc.setCreator('FileOrca');
    for (const jpeg of jpegs) {
      const image = await doc.embedJpg(jpeg);
      const page = doc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    return doc.save({ useObjectStreams });
  }

  it('flags a PDF that embeds the ORIGINAL jpg-02: the JPEG goes in byte for byte, with its GPS (positive control)', async () => {
    const original = read(JPG02);
    const pdf = await build([original]);
    const parsed = parsePdf(pdf);
    expect(parsed.pageCount).toBe(1);
    expect(parsed.pages[0]).toMatchObject({ mediaBox: [0, 0, 3264, 2448], width: 3264, height: 2448 });
    expect(parsed.pages[0]?.images).toHaveLength(1);
    const embedded = parsed.images[0];
    expect(embedded).toMatchObject({ width: 3264, height: 2448, filters: ['DCTDecode'], colorSpace: 'DeviceRGB', bitsPerComponent: 8, hasSoftMask: false });
    expect(same(embedded?.jpeg as Uint8Array, original)).toBe(true);
    expect(hasGps(embedded?.jpeg as Uint8Array)).toBe(true);
    expect(metadataReport(pdf)).toMatchObject({ format: 'pdf', exif: true, gps: true, gpsKind: 'real' });
  });

  it('does not flag a PDF that embeds a clean JPEG, and reads Producer and Creator from the hex strings', async () => {
    const pdf = await build([read('gen-grande-4100x4100.jpg'), read('gen-grande-4100x4100.jpg')]);
    const parsed = parsePdf(pdf);
    expect(parsed.pageCount).toBe(2);
    expect(parsed.info).toEqual({ Producer: 'FileOrca', Creator: 'FileOrca' });
    expect(parsed.hasXmp).toBe(false);
    expect(metadataReport(pdf)).toMatchObject({ exif: false, xmp: false, gps: false, other: [] });
    expect(parsed.pages.map((page) => [page.width, page.height])).toEqual([[4100, 4100], [4100, 4100]]);
  });

  it('flags the default pdf-lib metadata: dates, a Producer that is not ours, and a Title when one is set', async () => {
    const doc = await PDFDocument.create();
    doc.setTitle('IMG_4521 Rua Augusta');
    doc.addPage([100, 100]);
    const parsed = parsePdf(await doc.save({ useObjectStreams: false }));
    expect(parsed.info.Title).toBe('IMG_4521 Rua Augusta');
    expect(parsed.info.Producer).toContain('pdf-lib');
    expect(parsed.info.CreationDate).toMatch(/^D:/);
    expect(metadataReport(await doc.save({ useObjectStreams: false })).other).toContain('Info/Title');
  });

  it('reads the compressed layout (object streams) as well', async () => {
    const pdf = await build([read(JPG01)], true);
    const parsed = parsePdf(pdf);
    expect(parsed.usesObjectStreams).toBe(true);
    expect(parsed.pageCount).toBe(1);
    expect(parsed.info.Producer).toBe('FileOrca');
    expect(metadataReport(pdf).gps).toBe(true);
  });

  it('reads literal strings with escapes, an inherited MediaBox and an XMP stream from a hand-written file', () => {
    const text = [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R /Metadata 5 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 /MediaBox [0 0 612 792] >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R >> endobj',
      '4 0 obj << /Title (Caf\\351 \\(draft\\)) /Author <FEFF00480069> /Keywords (a\\\nb) >> endobj',
      '5 0 obj << /Type /Metadata /Subtype /XML /Length 4 >> stream',
      'abcd',
      'endstream endobj',
      '6 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] >> endobj',
      'trailer << /Root 1 0 R /Info 4 0 R >>',
    ].join('\n');
    const parsed = parsePdf(new TextEncoder().encode(text));
    expect(parsed.version).toBe('1.4');
    expect(parsed.pages.map((page) => page.mediaBox)).toEqual([[0, 0, 612, 792], [0, 0, 200, 100]]);
    expect(parsed.info).toEqual({ Title: 'Café (draft)', Author: 'Hi', Keywords: 'ab' });
    expect(parsed.hasXmp).toBe(true);
  });
});

describe('zip.ts', () => {
  async function streamed(entries: [string, Uint8Array][]): Promise<Uint8Array> {
    const parts: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      const zip = new Zip((error, chunk, final) => {
        if (error) return reject(error);
        parts.push(chunk);
        if (final) resolve();
      });
      for (const [name, bytes] of entries) {
        const file = new ZipPassThrough(name);
        zip.add(file);
        file.push(bytes, true);
      }
      zip.end();
    });
    return new Uint8Array(await new Blob(parts as BlobPart[]).arrayBuffer());
  }

  it('lists a stored streaming archive: names, methods, sizes, CRCs, UTF-8 names and an empty file', async () => {
    const payload = read('gen-avif.avif');
    const zip = await streamed([
      ['foto.jpg', read(JPG02).subarray(0, 5000)],
      ['foto (2).jpg', payload],
      ['ação café ñ.png', Uint8Array.from(ascii('x'))],
      ['vazio.txt', new Uint8Array(0)],
    ]);
    const entries = readZip(zip);
    expect(entries.map((entry) => entry.name)).toEqual(['foto.jpg', 'foto (2).jpg', 'ação café ñ.png', 'vazio.txt']);
    expect(entries.every((entry) => entry.method === 0 && entry.intact)).toBe(true);
    expect(entries.map((entry) => entry.utf8)).toEqual([false, false, true, false]);
    expect(same(entries[1]?.bytes as Uint8Array, payload)).toBe(true);
    expect(entries[3]?.size).toBe(0);
  });

  it('lists duplicate names, which an object keyed by name would hide', async () => {
    const zip = await streamed([
      ['a.png', Uint8Array.from([1])],
      ['a.png', Uint8Array.from([2])],
    ]);
    expect(zipNames(zip)).toEqual(['a.png', 'a.png']);
    expect(readZip(zip).map((entry) => entry.bytes[0])).toEqual([1, 2]);
  });

  it('reads deflated entries and detects a flipped bit', () => {
    const data = Uint8Array.from({ length: 4000 }, (_, i) => i % 7);
    const zip = zipSync({ 'dados.bin': [data, { level: 6 }] });
    const [entry] = readZip(zip);
    expect(entry?.method).toBe(8);
    expect(entry?.compressedSize).toBeLessThan(data.length);
    expect(entry?.intact).toBe(true);
    expect(same(entry?.bytes as Uint8Array, data)).toBe(true);
    const stored = zipSync({ 'x.bin': [Uint8Array.from([5, 6, 7]), { level: 0 }] });
    stored[Buffer.from(stored).indexOf(Buffer.from([5, 6, 7]))] = 9;
    expect(readZip(stored)[0]?.intact).toBe(false);
  });

  it('refuses a file that is not a ZIP', () => {
    expect(() => readZip(read(JPG02))).toThrow(/not a ZIP/);
  });
});

describe('images.ts', () => {
  it('sniffs by signature, not by name', () => {
    expect(sniff(read('gen-png-extensao-jpg.jpg'))).toBe('png');
    expect(sniff(read('gen-texto-extensao-png.png'))).toBe('text');
    expect(sniff(read('gen-vazio.jpg'))).toBe('empty');
    expect(sniff(Uint8Array.from([...ascii('GIF89a'), 1, 0, 1, 0]))).toBe('gif');
    expect(sniff(Uint8Array.from([...ascii('%PDF-1.7'), 10]))).toBe('pdf');
    expect(sniff(Uint8Array.from([0x50, 0x4b, 3, 4, 0, 0]))).toBe('zip');
    expect(sniff(Uint8Array.from([0, 1, 2, 3, 250, 251]))).toBe('unknown');
    expect(mimeOf('avif')).toBe('image/avif');
    expect(mimeOf('text')).toBe('application/octet-stream');
  });

  it('gives stored and displayed sizes: Orientation swaps the sides of 5-8, never of 3', () => {
    expect(imageSize(read('gen-jpg-01-orientacao6.jpg'))).toMatchObject({ width: 1600, height: 1200, orientation: 6, displayWidth: 1200, displayHeight: 1600 });
    expect(imageSize(read('gen-jpg-02-orientacao8.jpg'))).toMatchObject({ width: 1200, height: 1600, orientation: 8, displayWidth: 1600, displayHeight: 1200 });
    expect(imageSize(read(JPG03))).toMatchObject({ width: 3264, height: 2448, orientation: 3, displayWidth: 3264, displayHeight: 2448 });
    expect(imageSize(read('heic-05-iphone13promax-retrato-orientacao6-hdr.heic'))).toMatchObject({ format: 'heic', width: 4032, height: 3024, displayWidth: 3024, displayHeight: 4032 });
    expect(imageSize(read('gen-avif.avif'))).toMatchObject({ format: 'avif', width: 1600, height: 1200 });
    expect(imageSize(read('gen-webp-exif-gps.webp'))).toMatchObject({ format: 'webp', width: 1600, height: 1200 });
    expect(() => imageSize(read('gen-texto-extensao-png.png'))).toThrow(/no image size/);
  });

  it('reports every kind of leak in one place, and a clean file as clean', () => {
    for (const name of [JPG01, JPG02, JPG03, 'gen-jpg-01-orientacao6.jpg', 'gen-webp-exif-gps.webp', 'heic-06-iphone7-paisagem-gps.heic']) {
      expect(metadataReport(read(name)), name).toMatchObject({ exif: true, gps: true, gpsKind: 'real' });
    }
    for (const name of ['gen-png-transparente.png', 'gen-grande-4100x4100.jpg', 'gen-avif.avif', 'gen-webp-animada.webp']) {
      expect(metadataReport(read(name)), name).toMatchObject({ exif: false, xmp: false, gps: false, gpsKind: 'none', other: [] });
    }
  });
});

describe('pixels.ts', () => {
  const stored = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // the stored image, 3x3, row by row
  const want: Record<number, number[]> = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [3, 2, 1, 6, 5, 4, 9, 8, 7], // mirror horizontal
    3: [9, 8, 7, 6, 5, 4, 3, 2, 1], // rotate 180
    4: [7, 8, 9, 4, 5, 6, 1, 2, 3], // mirror vertical
    5: [1, 4, 7, 2, 5, 8, 3, 6, 9], // transpose
    6: [7, 4, 1, 8, 5, 2, 9, 6, 3], // rotate 90 clockwise
    7: [9, 6, 3, 8, 5, 2, 7, 4, 1], // transverse
    8: [3, 6, 9, 2, 5, 8, 1, 4, 7], // rotate 90 counter-clockwise
  };

  it('turns a grid exactly as the Exif table says, for each of the eight orientations (hand-written tables)', () => {
    for (let tag = 1; tag <= 8; tag += 1) expect(orientThumbnail(stored, 3, tag), `orientation ${tag}`).toEqual(want[tag]);
  });

  it('keeps the channels of an rgb grid together', () => {
    const rgb = stored.flatMap((value) => [value, value * 10, value * 100]);
    const turned = orientGrid(rgb, 3, 6, 3);
    expect(turned.filter((_, i) => i % 3 === 0)).toEqual(want[6]);
    expect(turned.filter((_, i) => i % 3 === 1)).toEqual((want[6] as number[]).map((value) => value * 10));
  });

  it('6 and 8 undo each other, 3 undoes itself, and 5 and 7 are their own inverses', () => {
    expect(orientThumbnail(orientThumbnail(stored, 3, 6), 3, 8)).toEqual(stored);
    expect(orientThumbnail(orientThumbnail(stored, 3, 3), 3, 3)).toEqual(stored);
    expect(orientThumbnail(orientThumbnail(stored, 3, 5), 3, 5)).toEqual(stored);
    expect(orientThumbnail(orientThumbnail(stored, 3, 7), 3, 7)).toEqual(stored);
  });

  it('turning the image turns the thumbnail the same way, so the reference can come from the stored pixels', () => {
    // 8x12 gradient with a bright block, thumbnails of 4x4 cells (2x3 pixels each)
    const width = 8;
    const height = 12;
    const pixel = (x: number, y: number): number => (x >= 5 && y < 4 ? 250 : x * 12 + y * 5);
    const thumb = (w: number, h: number, at: (x: number, y: number) => number): number[] => {
      const out: number[] = [];
      for (let ty = 0; ty < 4; ty += 1) {
        for (let tx = 0; tx < 4; tx += 1) {
          let sum = 0;
          const [cw, ch] = [w / 4, h / 4];
          for (let y = 0; y < ch; y += 1) for (let x = 0; x < cw; x += 1) sum += at(tx * cw + x, ty * ch + y);
          out.push(sum / (cw * ch));
        }
      }
      return out;
    };
    const storedThumb = thumb(width, height, pixel);
    // the picture shown for Orientation 6: stored turned 90 degrees clockwise (new width = old height)
    const shown = thumb(height, width, (x, y) => pixel(y, height - 1 - x));
    expect(orientThumbnail(storedThumb, 4, 6)).toEqual(shown);
    const mirrored = thumb(width, height, (x, y) => pixel(width - 1 - x, y));
    expect(orientThumbnail(storedThumb, 4, 2)).toEqual(mirrored);
  });

  it('measures the mean absolute difference, and refuses grids of different sizes or a bad tag', () => {
    expect(meanAbsDiff([0, 0, 0, 0], [4, 4, 4, 4])).toBe(4);
    expect(meanAbsDiff(stored, stored)).toBe(0);
    expect(() => meanAbsDiff([1, 2], [1])).toThrow();
    expect(() => orientThumbnail(stored, 3, 9)).toThrow(/1-8/);
  });
});
