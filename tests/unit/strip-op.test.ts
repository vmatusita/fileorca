// F18 (decision 10 of the prompt; DECISOES § 731 and § 732): the proof in Node, before the island, that the strip
// operation of Remove EXIF data hands back each photo with GPS of the fixtures without its location and its other
// metadata, and with the same picture. The readers are the tests' own (metadataReport, orientationOnly and imageBytes of
// tests/e2e/lib/), never the engine's: no Exif except the Orientation of a rotated JPG, no GPS, XMP, IPTC nor PNG text,
// and the bytes of the picture equal to the ones that went in (the JPEG from its SOI to its EOI without the APPn and COM
// segments, the IHDR and IDAT sequence of the PNG, the VP8, VP8L, ALPH and ANMF of the WebP). Equal bytes are a stronger
// proof of "the same pixels" than decoding them; the matrix decodes them too, in both browsers.
//
// The name keeps it out of the package of the engine (pnpm motor:exportar takes engine-*.test.ts and strip.test.ts): it
// reads the photos with real GPS, which the package cannot redistribute, and the readers of tests/e2e/lib/, which need
// pdf-lib and Playwright. The cases the package can run are in engine-process.test.ts.
import { zlibSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { processImage } from '../../src/engine/image/process.ts';
import type { EngineOutput, EngineResult, ImageFormat } from '../../src/engine/image/types.ts';
import { metadataReport } from '../e2e/lib/images.ts';
import { exifBlock, segments } from '../e2e/lib/jpeg.ts';
import { imageBytes, orientationOnly } from '../e2e/lib/matrix.ts';
import { pngChunks } from '../e2e/lib/png.ts';
import { webpChunks, webpInfo } from '../e2e/lib/webp.ts';
import { cat, pngChunk, text } from './lib/bytes.ts';
import { fixture, oracle } from './lib/oracle.ts';

const TAKES: readonly ImageFormat[] = ['jpeg', 'png', 'webp'];
const strip = (bytes: Uint8Array): Promise<EngineResult> => processImage(new Blob([bytes as BlobPart]), { kind: 'strip' }, TAKES);

function ok(result: EngineResult): EngineOutput {
  if (!result.ok) throw new Error(`expected a result, got ${JSON.stringify(result)}`);
  return result;
}

const ORACLE = oracle();
/** The JPG, PNG and WebP fixtures that carry a GPS location (oracle, written by hand): the three phone JPGs, the two rotated ones and the WebP. */
const WITH_GPS = Object.keys(ORACLE).filter((name) => ORACLE[name]?.expect === 'ok' && ORACLE[name]?.hasGps && TAKES.includes(ORACLE[name]?.format as ImageFormat));

/** The colour of the picture, which stays: the ICC APP2 of a JPEG, the colour chunks of a PNG, the ICCP of a WebP. */
function colour(bytes: Uint8Array): string[] {
  const hex = (data: Uint8Array): string => Buffer.from(data).toString('hex');
  if (bytes[0] === 0xff) return segments(bytes).filter((segment) => segment.marker === 0xe2 && String.fromCharCode(...segment.data.subarray(0, 12)) === 'ICC_PROFILE\0').map((segment) => hex(segment.data));
  if (bytes[0] === 0x89) return pngChunks(bytes).filter((chunk) => ['iCCP', 'sRGB', 'gAMA', 'cHRM'].includes(chunk.type)).map((chunk) => `${chunk.type}:${hex(chunk.data)}`);
  return webpChunks(bytes).filter((chunk) => chunk.fourcc === 'ICCP').map((chunk) => hex(chunk.data));
}

/**
 * gen-png-transparente.png (which has no metadata) with the four chunks a PNG keeps metadata in, after its IHDR: an eXIf
 * with the whole Exif of the jpg-03 photo (GPS, the camera, the date and its Orientation 3), a tEXt with a place, an iTXt
 * with an XMP packet and a zTXt with a compressed comment. Built here, so no fixture is added (decision 15).
 */
function pngWithMetadata(): Uint8Array {
  const base = fixture('gen-png-transparente.png');
  const tiff = exifBlock(fixture('jpg-03-iphone5-paisagem-orientacao3-gps.jpg'));
  if (!tiff) throw new Error('jpg-03 has no Exif block');
  const xmp = '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF><rdf:Description exif:GPSLatitude="25,25.0S"/></rdf:RDF></x:xmpmeta>';
  const extra = cat(
    pngChunk('eXIf', tiff),
    pngChunk('tEXt', text('Location\0Curitiba, -25.43, -49.27')),
    pngChunk('iTXt', cat(text('XML:com.adobe.xmp'), [0, 0, 0, 0, 0], text(xmp))),
    pngChunk('zTXt', cat(text('Comment'), [0, 0], zlibSync(new TextEncoder().encode('taken at home, -25.43 -49.27')))),
  );
  const ihdrEnd = 8 + 12 + 13;
  return cat(base.subarray(0, ihdrEnd), extra, base.subarray(ihdrEnd));
}

describe('strip: the photos with a GPS location lose it, and every other metadata, and keep their picture', () => {
  it('the fixtures with GPS are the five JPGs and the WebP (the oracle)', () => {
    expect(WITH_GPS).toEqual([
      'jpg-01-pixel2-retrato-gps.jpg',
      'jpg-02-iphone6-paisagem-gps.jpg',
      'jpg-03-iphone5-paisagem-orientacao3-gps.jpg',
      'gen-jpg-01-orientacao6.jpg',
      'gen-jpg-02-orientacao8.jpg',
      'gen-webp-exif-gps.webp',
    ]);
  });

  const cases: [string, () => Uint8Array, { format: ImageFormat; width: number; height: number; orientation: number }][] = [
    ...WITH_GPS.map((name): [string, () => Uint8Array, { format: ImageFormat; width: number; height: number; orientation: number }] => {
      const entry = ORACLE[name];
      if (!entry) throw new Error(name);
      return [name, () => fixture(name), { format: entry.format as ImageFormat, width: entry.displayWidth, height: entry.displayHeight, orientation: entry.orientation }];
    }),
    // The PNG keeps its pixels as stored: the engine reads no Orientation in a PNG (probe.ts), and its eXIf goes whole (§ 732).
    ['a PNG with eXIf, tEXt, iTXt and zTXt (made from gen-png-transparente.png)', pngWithMetadata, { format: 'png', width: 800, height: 600, orientation: 1 }],
  ];

  for (const [name, read, want] of cases) {
    it(`${name}: no GPS, XMP, IPTC or text, no Exif but a rotated JPG's Orientation, and the same picture bytes`, async () => {
      const input = read();
      const before = metadataReport(input);
      expect(before.gps, 'the file that goes in has a GPS location').toBe(true);

      const result = ok(await strip(input));
      expect(result).toMatchObject({ outcome: 'new', format: want.format, source: want.format, width: want.width, height: want.height, notes: [] });
      expect(result.blob.type).toBe(`image/${want.format}`);
      const out = new Uint8Array(await result.blob.arrayBuffer());

      const after = metadataReport(out);
      expect(after.format).toBe(want.format);
      expect(after.gps, 'GPS').toBe(false);
      expect(after.gpsKind, 'GPS of any kind').toBe('none');
      expect(after.xmp, 'XMP').toBe(false);
      expect(after.other, 'IPTC, PNG text chunks and tIME').toEqual([]);
      if (want.format === 'jpeg' && want.orientation > 1) {
        // Decision 10: the only Exif left is the Orientation of the photo, in a block with that one tag (§ 33 and § 732).
        expect(after.exif).toBe(true);
        expect(orientationOnly(out), 'the Exif block holds the Orientation and nothing else').toBe(true);
        expect(after.orientation, 'the Orientation the photo had').toBe(want.orientation);
      } else {
        expect(after.exif, 'Exif').toBe(false);
      }

      // The same picture: its bytes, and the colour it is shown in.
      const picture = imageBytes(out);
      expect(picture.length, 'the picture is most of the file').toBeGreaterThan(out.length / 2);
      expect(Buffer.from(picture).equals(Buffer.from(imageBytes(input))), 'the bytes of the picture are the ones that went in').toBe(true);
      expect(colour(out), 'the colour profile stays').toEqual(colour(input));
      expect(out.length, 'what was taken out is gone').toBeLessThan(input.length);
    });
  }

  it('the PNG made for the test really carries the four chunks, the GPS, the XMP and the Orientation (so the case above proves something)', () => {
    const report = metadataReport(pngWithMetadata());
    expect(report).toMatchObject({ format: 'png', exif: true, gps: true, gpsKind: 'real', xmp: true, orientation: 3 });
    expect(report.other).toEqual(['tEXt', 'iTXt', 'zTXt']);
  });
});

describe('strip: what it keeps, and what it refuses', () => {
  it('a file with nothing to take out comes back the same, byte for byte (the "Output" line of the page)', async () => {
    for (const name of ['gen-png-transparente.png', 'gen-png-extensao-jpg.jpg', 'gen-grande-4100x4100.jpg']) {
      const input = fixture(name);
      expect(metadataReport(input), `${name} has no metadata`).toMatchObject({ exif: false, xmp: false, gps: false, other: [] });
      const out = new Uint8Array(await ok(await strip(input)).blob.arrayBuffer());
      expect(Buffer.from(out).equals(Buffer.from(input)), `${name} is the same file`).toBe(true);
    }
  });

  it('an animated WebP stays animated, with its two frames, and no note of a first frame', async () => {
    const input = fixture('gen-webp-animada.webp');
    const result = ok(await strip(input));
    expect(result).toMatchObject({ outcome: 'new', format: 'webp', width: 320, height: 240, notes: [] });
    const out = new Uint8Array(await result.blob.arrayBuffer());
    expect(webpInfo(out)).toMatchObject({ animated: true, frameCount: 2 });
    expect(Buffer.from(imageBytes(out)).equals(Buffer.from(imageBytes(input)))).toBe(true);
  });

  it('a 16.8 MP JPG goes through without a decoder (Node has none), and a rotated photo keeps the size it is shown at', async () => {
    expect(ok(await strip(fixture('gen-grande-4100x4100.jpg')))).toMatchObject({ outcome: 'new', width: 4100, height: 4100 });
    expect(ok(await strip(fixture('gen-jpg-01-orientacao6.jpg')))).toMatchObject({ outcome: 'new', width: 1200, height: 1600, sourceWidth: 1200, sourceHeight: 1600 });
  });

  it('a damaged, empty or foreign file is refused with the reasons the other operations give', async () => {
    for (const name of ['gen-jpg-truncado.jpg', 'gen-jpg-corrompido.jpg', 'gen-vazio.jpg', 'gen-texto-extensao-png.png']) {
      const want = ORACLE[name]?.expect;
      const result = await strip(fixture(name));
      expect(result.ok, name).toBe(false);
      if (!result.ok) expect(result.reason, name).toBe(want);
    }
    expect(await strip(new Uint8Array(text('GIF89a\x01\x00\x01\x00')))).toEqual({ ok: false, reason: 'unsupported', source: 'gif' });
    expect(await strip(fixture('gen-avif.avif'))).toEqual({ ok: false, reason: 'wrong-tool', source: 'avif' });
    expect(await strip(fixture('heic-08-iphone13pro-paisagem-hdr-ios17.heic'))).toEqual({ ok: false, reason: 'wrong-tool', source: 'heic' });
  });
});
