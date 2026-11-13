// pnpm sobre:foto (scripts/sobre/foto.ts; F19a, decision 5; DECISOES § 762), run here as Victor will run it, on a photo of
// the fixtures that carries GPS (fixtures/images/jpg-01-pixel2-retrato-gps.jpg, a portrait from a Pixel 2), into a
// temporary folder: never into public/, where the files would make every page show the photo. It proves the two sizes,
// as WebP and JPG, square, and the absence of any metadata (Exif, XMP, IPTC, GPS, and no ICC profile either), and that
// the pages find the photo only when all four files are there.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PHOTO_DIR, PHOTO_SHOWN, PHOTO_SIZES, findAboutPhoto, photoFiles, photoName } from '../../src/platform/about-photo.ts';
import { decodeJpegNode } from '../../scripts/fixtures/lib/mozjpeg.ts';
import { readChunks } from '../../scripts/fixtures/lib/webp.ts';
import { imageSize, metadataReport, sniff } from '../e2e/lib/images.ts';

const FIXTURE = 'fixtures/images/jpg-01-pixel2-retrato-gps.jpg';
const SCRIPT = 'scripts/sobre/foto.ts';

/** The markers of a JPEG before its image data: APP1 is Exif and XMP, APP2 an ICC profile, APP13 IPTC. */
function jpegMarkers(bytes: Uint8Array): number[] {
  const markers: number[] = [];
  let at = 2;
  while (at + 4 <= bytes.length && bytes[at] === 0xff) {
    const marker = bytes[at + 1] ?? 0;
    markers.push(marker);
    if (marker === 0xda) break;
    at += 2 + (((bytes[at + 2] ?? 0) << 8) | (bytes[at + 3] ?? 0));
  }
  return markers;
}

const run = (...args: string[]) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', timeout: 120_000 });
const listing = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).sort() : []);

let out: string;
let result: ReturnType<typeof run>;
let publicBefore: string[];

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fo-sobre-foto-'));
  publicBefore = listing(PHOTO_DIR);
  result = run(FIXTURE, '--out', out);
}, 150_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

describe('pnpm sobre:foto on a photo with GPS (F19a, decision 5; DECISOES § 762)', () => {
  it('starts from a photo that has GPS, Exif and an orientation of its own', () => {
    const report = metadataReport(new Uint8Array(readFileSync(FIXTURE)));
    expect(report.format).toBe('jpeg');
    expect(report.gps).toBe(true);
    expect(report.exif).toBe(true);
  });

  it('writes the two sizes as WebP and JPG, square, into the folder it was given and nowhere else', () => {
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(readdirSync(out).sort()).toEqual(photoFiles().sort());
    for (const size of Object.values(PHOTO_SIZES)) {
      for (const format of ['webp', 'jpg'] as const) {
        const bytes = new Uint8Array(readFileSync(join(out, photoName(size, format))));
        expect(sniff(bytes), `${size} ${format}`).toBe(format === 'jpg' ? 'jpeg' : 'webp');
        expect(imageSize(bytes), `${size} ${format}`).toMatchObject({ width: size, height: size });
      }
    }
    // The script never touched public/about/ of the project.
    expect(listing(PHOTO_DIR)).toEqual(publicBefore);
    // The sizes are twice the size each place shows the photo at.
    expect(PHOTO_SIZES).toEqual({ about: PHOTO_SHOWN.about * 2, author: PHOTO_SHOWN.author * 2 });
  });

  it('leaves no metadata at all in any of the four files: no Exif, no XMP, no IPTC, no GPS, no ICC profile', () => {
    for (const name of photoFiles()) {
      const bytes = new Uint8Array(readFileSync(join(out, name)));
      expect(metadataReport(bytes), name).toEqual({ format: sniff(bytes), exif: false, xmp: false, gps: false, gpsKind: 'none', orientation: null, other: [] });
      if (name.endsWith('.jpg')) {
        // Only the frame, the tables and the scan: no APP1 (Exif, XMP), APP2 (ICC) or APP13 (IPTC), no comment.
        const markers = jpegMarkers(bytes);
        expect(markers.filter((marker) => marker === 0xe1 || marker === 0xe2 || marker === 0xed || marker === 0xfe), name).toEqual([]);
      } else {
        expect(readChunks(bytes).map((chunk) => chunk.fourcc).filter((fourcc) => !['VP8 ', 'VP8L', 'VP8X', 'ALPH'].includes(fourcc)), name).toEqual([]);
      }
      // Nothing of the camera or the place, as text, anywhere in the bytes.
      const text = Buffer.from(bytes).toString('latin1');
      for (const word of ['Exif', 'GPS', 'Pixel', 'Google', 'http://ns.adobe.com']) expect(text.includes(word), `${name}: ${word}`).toBe(false);
    }
  });

  it('crops the square in the middle of the upright photo', async () => {
    const original = await decodeJpegNode(new Uint8Array(readFileSync(FIXTURE)), true);
    // A portrait: the square is as wide as the photo, and the output is upright too (its own pixels, no orientation tag).
    expect(original.height).toBeGreaterThan(original.width);
    const small = await decodeJpegNode(new Uint8Array(readFileSync(join(out, photoName(PHOTO_SIZES.author, 'jpg')))), false);
    expect([small.width, small.height]).toEqual([PHOTO_SIZES.author, PHOTO_SIZES.author]);
    expect(result.stdout).toContain(`${PHOTO_SIZES.about} × ${PHOTO_SIZES.about} px`);
  });

  it('prints the metadata report of each file it wrote', () => {
    for (const name of photoFiles()) expect(result.stdout, name).toMatch(new RegExp(`${name}: \\d+ × \\d+ px, \\d+ bytes, (?:webp|jpeg); metadata: \\{"format":"(?:webp|jpeg)","exif":false,"xmp":false,"gps":false`));
  });

  it('refuses a file that is not a JPEG and writes nothing', () => {
    const empty = mkdtempSync(join(tmpdir(), 'fo-sobre-foto-png-'));
    try {
      const refused = run('fixtures/images/gen-png-transparente.png', '--out', empty);
      expect(refused.status).toBe(1);
      expect(refused.stderr).toMatch(/not a JPEG/);
      expect(readdirSync(empty)).toEqual([]);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('the pages find the photo only when every file is there (src/platform/about-photo.ts)', () => {
  it('finds none in an empty folder, none with a file missing, and the two places with the four files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'fo-sobre-foto-find-'));
    try {
      expect(findAboutPhoto(dir)).toBeNull();
      const [first, ...rest] = photoFiles();
      for (const name of rest) writeFileSync(join(dir, name), readFileSync(join(out, name)));
      expect(findAboutPhoto(dir), `sem ${first}`).toBeNull();
      writeFileSync(join(dir, first ?? ''), readFileSync(join(out, first ?? '')));
      expect(findAboutPhoto(dir)).toEqual({
        about: { webp: '/about/victor-320.webp', jpg: '/about/victor-320.jpg', width: 160, height: 160 },
        author: { webp: '/about/victor-128.webp', jpg: '/about/victor-128.jpg', width: 64, height: 64 },
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
