import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  BROKEN,
  EXT,
  baseOf,
  batchOf,
  converterLink,
  expectConverterRow,
  fixturesOf,
  openTool,
  oracle,
  runCase,
  wrongTool,
  type Lang,
  type Expect,
  type MatrixCase,
  type OutFormat,
  type Outcome,
  type PixelCheck,
  type Refuse,
} from './lib/matrix.ts';
import type { Format } from './lib/images.ts';

// The fixture matrix (criteria 3 to 5, 8 and 9, and the privacy half of 10): every tool of the image
// phase gets ONE page load and ONE upload with every fixture it accepts plus the ones it refuses in
// the middle, in Chromium and WebKit. What must come out is derived from the oracle
// (fixtures/images/expected.json) and the options, never from the engine. Each output is read from
// the ZIP (or the PDF) in Node: its real format, its size, that it opens in the browser, its
// orientation by pixels, its transparency, and that it carries no Exif, XMP, IPTC or GPS. The records
// the table docs/relatorios/fase-02-matriz.md is built from (fase-17-matriz.md since the F17, with AVIF to JPG and
// Convert to WebP) are written to test-results/matriz/.

const JPG_03 = 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg';
const ORIENTED = [JPG_03, 'gen-jpg-01-orientacao6.jpg', 'gen-jpg-02-orientacao8.jpg'];
const ANIMATED = 'gen-webp-animada.webp';
const TRANSPARENT = 'gen-png-transparente.png';
/** The 12 MP and 8 MP photos: the ones Compress must make smaller. */
const BIG_PHOTOS = ['jpg-01-pixel2-retrato-gps.jpg', 'jpg-02-iphone6-paisagem-gps.jpg', JPG_03];
/** Small files of a format, for the tools that refuse it. */
const SMALL = { jpeg: 'gen-jpg-02-orientacao8.jpg', png: 'gen-png-extensao-jpg.jpg', webp: ANIMATED, avif: 'gen-avif.avif', heic: 'heic-08-iphone13pro-paisagem-hdr-ios17.heic' } as const;

const PHOTO = fixturesOf('jpeg', 'png', 'webp');
/** The line the card adds when an animation became a still image (the animated WebP is in the batch). */
const FIRST_FRAME = ['kept the first frame'] as const;

/** What each tool says it takes in the refusal (the "formats" line of its panel texts, in its i18n/en.ts), by the formats it accepts. */
const TAKES: Record<string, string> = { 'jpeg,png,webp': 'JPG, PNG or WebP', heic: 'HEIC or HEIF', webp: 'WebP', 'png,jpeg': 'PNG or JPG', avif: 'AVIF', 'jpeg,png': 'JPG or PNG' };

/** How a fixture that this tool cannot use is refused. */
function refusal(fixture: string, accepts: readonly Format[]): Refuse | null {
  const entry = oracle(fixture);
  if (entry.expect === 'empty') return { refuse: 'empty' };
  if (entry.expect === 'unsupported') return { refuse: 'unsupported' };
  if (!accepts.includes(entry.format)) {
    const takes = TAKES[accepts.join()];
    if (takes === undefined) throw new Error(`no "takes" text for ${accepts.join()}`);
    return wrongTool(fixture, takes);
  }
  if (entry.expect === 'truncated') return { refuse: 'truncated' };
  if (entry.expect === 'decode') return { refuse: 'decode' };
  return null;
}

const display = (fixture: string): [number, number] => {
  const entry = oracle(fixture);
  return [entry.displayWidth as number, entry.displayHeight as number];
};

const sameName = (fixture: string, format: OutFormat): string => `${baseOf(fixture)}.${EXT[format]}`;
const realFormat = (fixture: string): OutFormat => oracle(fixture).format as OutFormat;

/** One lossy pass and a resample: the grey grids of the picture stay this close. */
const CLOSE = 6;
const pixelsOf = (fixture: string, extra: Partial<PixelCheck> = {}): { pixels: PixelCheck } | Record<string, never> =>
  ORIENTED.includes(fixture) ? { pixels: { from: fixture, limit: CLOSE, ...extra } } : {};

function outcomeFor(accepts: readonly Format[], make: (fixture: string) => Expect): (fixture: string) => Outcome {
  return (fixture) => refusal(fixture, accepts) ?? make(fixture);
}

const GENERAL_REFUSED = [SMALL.heic, SMALL.avif, ...BROKEN];

const CASES: MatrixCase[] = [];

// A batch that would not fit the 60 s of a test on the CI runner is cut in two, never by dropping a
// fixture: the big photos (12 MP and 8 MP) go in one batch, everything else in the other, both with the
// refused files in the middle.
const SMALL_PHOTOS = PHOTO.filter((name) => !BIG_PHOTOS.includes(name));

// ---- Compress image: keeps the format and the display size, never grows a file, no-canvas path included ----------------
const compressCase = (id: string, accepted: string[]): MatrixCase => ({
  id,
  tool: 'compress-image',
  path: '/compress-image/',
  options: 'Recommended',
  batch: batchOf(accepted, GENERAL_REFUSED),
  deliverable: 'files',
  outcome: outcomeFor(['jpeg', 'png', 'webp'], (fixture) => {
    const [width, height] = display(fixture);
    const format = realFormat(fixture);
    return {
      name: sameName(fixture, format),
      format,
      width,
      height,
      notBigger: true,
      ...(BIG_PHOTOS.includes(fixture) ? { smaller: true } : {}),
      ...(fixture === TRANSPARENT ? { alpha: 'kept' as const } : {}),
      ...(fixture === ANIMATED ? { animated: true } : {}),
      ...(ORIENTED.includes(fixture) ? { tagMayStay: true } : {}),
      ...pixelsOf(fixture),
    };
  }),
});
CASES.push(compressCase('compress-image-photos', BIG_PHOTOS), compressCase('compress-image-rest', SMALL_PHOTOS));

// ---- Resize image: untouched is 50% of every picture; never enlarges --------------------------------------------------------
const half = (value: number): number => Math.round(value / 2);
CASES.push({
  id: 'resize-image',
  tool: 'resize-image',
  path: '/resize-image/',
  options: 'Untouched: 50% of each image',
  batch: batchOf(PHOTO, GENERAL_REFUSED),
  deliverable: 'files',
  says: FIRST_FRAME,
  outcome: outcomeFor(['jpeg', 'png', 'webp'], (fixture) => {
    const [width, height] = display(fixture);
    const format = realFormat(fixture);
    return {
      name: sameName(fixture, format),
      format,
      width: half(width),
      height: half(height),
      ...(fixture === TRANSPARENT ? { alpha: 'kept' as const } : {}),
      ...(fixture === ANIMATED ? { still: true } : {}),
      ...pixelsOf(fixture),
    };
  }),
});

// ---- Crop image: Square, centred, on every picture --------------------------------------------------------------------------
CASES.push({
  id: 'crop-image',
  tool: 'crop-image',
  path: '/crop-image/',
  options: 'Square (default), centred',
  batch: batchOf(PHOTO, GENERAL_REFUSED),
  deliverable: 'files',
  says: FIRST_FRAME,
  outcome: outcomeFor(['jpeg', 'png', 'webp'], (fixture) => {
    const [width, height] = display(fixture);
    const side = Math.min(width, height);
    const format = realFormat(fixture);
    const whole = width === height;
    return {
      name: sameName(fixture, format),
      format,
      width: side,
      height: side,
      ...(whole ? { notBigger: true } : {}),
      ...(fixture === TRANSPARENT ? { alpha: 'kept' as const } : {}),
      ...(fixture === ANIMATED ? { still: true } : {}),
      ...(ORIENTED.includes(fixture) ? { pixels: { from: fixture, limit: CLOSE, box: [(1 - side / width) / 2, (1 - side / height) / 2, side / width, side / height] as [number, number, number, number] } } : {}),
    };
  }),
});

// ---- Rotate image: Right 90° turns every picture, the sides swap ---------------------------------------------------------------
// In two batches (the three big photos, then the rest with the animation): one batch of 16 took 52 s on a slow CI WebKit,
// too close to the 60 s a test has (DECISOES § 88). Each batch has refused files in the middle; together, all of them.
const rotateCase = (id: string, fixtures: readonly string[], refused: readonly string[], says: readonly string[]): MatrixCase => ({
  id,
  tool: 'rotate-image',
  path: '/rotate-image/',
  options: 'Right 90° (default), no mirror',
  batch: batchOf([...fixtures], [...refused]),
  deliverable: 'files',
  says,
  outcome: outcomeFor(['jpeg', 'png', 'webp'], (fixture) => {
    const [width, height] = display(fixture);
    const format = realFormat(fixture);
    return {
      name: sameName(fixture, format),
      format,
      width: height,
      height: width,
      ...(fixture === TRANSPARENT ? { alpha: 'kept' as const } : {}),
      ...(fixture === ANIMATED ? { still: true } : {}),
      ...pixelsOf(fixture, { after: 6 }),
    };
  }),
});
CASES.push(
  rotateCase('rotate-image-photos', BIG_PHOTOS, [SMALL.heic, BROKEN[0], BROKEN[1]], []),
  rotateCase('rotate-image-rest', SMALL_PHOTOS, [SMALL.avif, BROKEN[2], BROKEN[3]], FIRST_FRAME),
);

// ---- HEIC to JPG/PNG: the main image of each file, in its display size --------------------------------------------------------
const HEIC = fixturesOf('heic');
const HEIC_REFUSED = [SMALL.jpeg, SMALL.png, SMALL.webp, SMALL.avif, ...BROKEN];
const heicOutcome = (to: 'jpeg' | 'png') =>
  outcomeFor(['heic'], (fixture) => {
    const [width, height] = display(fixture);
    return { name: sameName(fixture, to), format: to, width, height };
  });
const choosePng = async (page: Page): Promise<void> => {
  await page.locator('.fo-seg__opt', { hasText: 'PNG' }).click();
};
// The ten, in four batches of two or three (heic-01 to 03, 05, 06, 07 and 09 are 12 MP; the libheif decode is the
// cost): two batches of five took 59 s and 49 s on a slow CI WebKit, too close to the 60 s a test has (DECISOES § 88).
// heic-05 and heic-09 (the double-rotation trap) are in the second and the fourth. The refused files are shared out,
// each batch with some in the middle, all of them in the tool.
const heicIds = (...numbers: number[]): string[] => HEIC.filter((name) => numbers.some((number) => name.startsWith(`heic-${String(number).padStart(2, '0')}-`)));
const heicCase = (id: string, numbers: number[], refused: readonly string[], options = 'JPG (default)', format: 'jpeg' | 'png' = 'jpeg'): MatrixCase => ({
  id,
  tool: 'heic-to-jpg',
  path: '/heic-to-jpg/',
  options,
  batch: batchOf(heicIds(...numbers), refused),
  ...(format === 'png' ? { setup: choosePng } : {}),
  deliverable: 'files',
  outcome: heicOutcome(format),
});
CASES.push(
  heicCase('heic-to-jpg-a', [1, 2], HEIC_REFUSED.slice(0, 4)),
  heicCase('heic-to-jpg-b', [5, 6], [BROKEN[0]]),
  heicCase('heic-to-jpg-c', [3, 4, 10], HEIC_REFUSED.slice(4)),
  heicCase('heic-to-jpg-d', [7, 8, 9], [BROKEN[1]]),
  heicCase('heic-to-jpg-png', [5, 10], [BROKEN[2]], 'PNG', 'png'),
  heicCase('heic-to-jpg-png-b', [7], [BROKEN[3]], 'PNG', 'png'),
);

// ---- WebP to JPG/PNG --------------------------------------------------------------------------------------------------------------
CASES.push({
  id: 'webp-to-jpg',
  tool: 'webp-to-jpg',
  path: '/webp-to-jpg/',
  options: 'JPG (default)',
  batch: batchOf(fixturesOf('webp'), [SMALL.jpeg, SMALL.png, SMALL.heic, SMALL.avif, ...BROKEN]),
  deliverable: 'files',
  says: FIRST_FRAME,
  outcome: outcomeFor(['webp'], (fixture) => {
    const [width, height] = display(fixture);
    return {
      name: sameName(fixture, 'jpeg'),
      format: 'jpeg',
      width,
      height,
      ...(fixture === ANIMATED ? { mostlyRed: true } : { pixels: { from: 'jpg-02-iphone6-paisagem-gps.jpg', limit: 8 } }),
    };
  }),
});

// ---- PNG to JPG: a PNG becomes a JPG (transparency white), a JPG becomes a PNG ----------------------------------------------------
const PNG_TO_JPG_ACCEPTS: Format[] = ['png', 'jpeg'];
const swapTests = (fixtures: string[], refused: string[], id: string, options: string, says: readonly string[] = []): MatrixCase => ({
  id,
  tool: 'png-to-jpg',
  path: '/png-to-jpg/',
  options,
  batch: batchOf(fixtures, refused),
  deliverable: 'files',
  says,
  outcome: outcomeFor(PNG_TO_JPG_ACCEPTS, (fixture) => {
    const [width, height] = display(fixture);
    const toJpg = realFormat(fixture) === 'png';
    return {
      name: sameName(fixture, toJpg ? 'jpeg' : 'png'),
      format: toJpg ? 'jpeg' : 'png',
      width,
      height,
      ...(fixture === TRANSPARENT ? { flatten: true } : {}),
      ...pixelsOf(fixture, { limit: toJpg ? CLOSE : 2 }),
    };
  }),
});
// JPG to PNG is the heavy half (a 12 MP photo becomes a PNG of tens of MB): the 12 MP photo alone, then the other two
// big ones (the three in one batch passed the 60 s of a test on a slow CI WebKit, DECISOES § 88).
const JPEGS = fixturesOf('jpeg');
CASES.push(
  swapTests(fixturesOf('png'), [SMALL.webp, SMALL.heic, SMALL.avif, BROKEN[2], BROKEN[3]], 'png-to-jpg-png', 'PNG files go to JPG', ['Transparent areas became white']),
  swapTests(BIG_PHOTOS.slice(0, 1), [SMALL.webp, SMALL.heic, BROKEN[0]], 'png-to-jpg-photos', 'JPG files go to PNG'),
  swapTests(BIG_PHOTOS.slice(1), [SMALL.avif, BROKEN[1]], 'png-to-jpg-photos-b', 'JPG files go to PNG'),
  swapTests(
    JPEGS.filter((name) => !BIG_PHOTOS.includes(name)),
    [SMALL.webp, SMALL.heic, SMALL.avif, BROKEN[0], BROKEN[1]],
    'png-to-jpg-rest',
    'JPG files go to PNG',
  ),
);

// ---- AVIF to JPG and Convert to WebP / AVIF (F17, decision 10; DECISOES § 711) --------------------------------------------------
// The two tools the F2 left for the run 2b (§ 85), back from the draft of 840d565^ and fitted to the matrix of today. An
// AVIF output opens where this browser opens the AVIF fixture (the probe of decodeInPage) and is checked by its bytes
// elsewhere (the WebKit of Playwright on Windows): the real format, the size in the header, the alpha plane, no metadata.
const CONVERTIBLE = fixturesOf('jpeg', 'png');
const CONVERT_ACCEPTS: Format[] = ['jpeg', 'png'];
/** What Convert to WebP refuses, in the middle of each of its batches: a WebP, a HEIC, the AVIF and the four broken files. */
const CONVERT_REFUSED = [SMALL.webp, SMALL.heic, SMALL.avif, ...BROKEN];
/** What AVIF to JPG refuses, in the middle of its batch: a small file of every other format and the four broken files. */
const AVIF_REFUSED = [SMALL.jpeg, SMALL.png, SMALL.webp, SMALL.heic, ...BROKEN];
/**
 * The small pictures the AVIF encoder gets: the two JPGs with an Orientation (6 and 8), the transparent PNG and the PNG
 * named .jpg. Never the 12 MP photo nor the 4100 × 4100 one: the AVIF of the eight cost 50 s on the CI WebKit in the F2,
 * and the 12 MP photo has its own measure (image-avif-speed.spec.ts).
 */
const AVIF_SMALL = ['gen-jpg-01-orientacao6.jpg', 'gen-jpg-02-orientacao8.jpg', TRANSPARENT, SMALL.png];
/** The AVIF with alpha that Convert to WebP makes of the transparent PNG: it goes on to AVIF to JPG in the same test. */
const MADE_AVIF = `${baseOf(TRANSPARENT)}.avif`;

const avifToJpg = outcomeFor(['avif'], (fixture) => {
  const [width, height] = display(fixture);
  // gen-avif.avif is the jpg-03 photo with its Orientation 3 applied (fixtures/ORIGEM.md): the picture of JPG_03 turned by its own tag.
  return { name: sameName(fixture, 'jpeg'), format: 'jpeg', width, height, pixels: { from: JPG_03, limit: 8 } };
});

/**
 * AVIF to JPG, one batch: the AVIF fixture first, the refused files in the middle, and last the AVIF with alpha that
 * Convert to WebP made of the transparent PNG in the same test (no new fixture): it comes out a JPG painted white where it
 * was transparent, and the card says so.
 */
const avifToJpgCase = (madeAvif: string): MatrixCase => ({
  id: 'avif-to-jpg',
  tool: 'avif-to-jpg',
  path: '/avif-to-jpg/',
  options: 'JPG (no choice)',
  batch: [...fixturesOf('avif'), ...AVIF_REFUSED, MADE_AVIF],
  paths: { [MADE_AVIF]: madeAvif },
  deliverable: 'files',
  says: ['Transparent areas became white, because JPG has no transparency.'],
  avif: true,
  outcome: (fixture) => {
    if (fixture !== MADE_AVIF) return avifToJpg(fixture);
    const [width, height] = display(TRANSPARENT);
    return { name: `${baseOf(MADE_AVIF)}.jpg`, format: 'jpeg', width, height, flatten: true };
  },
});

const chooseAvif = async (page: Page): Promise<void> => {
  await page.locator('.fo-seg__opt', { hasText: 'AVIF' }).click();
};

const convertCase = (id: string, to: 'webp' | 'avif', fixtures: readonly string[], then?: MatrixCase['then']): MatrixCase => ({
  id,
  tool: 'convert-to-webp',
  path: '/convert-to-webp/',
  options: to === 'webp' ? 'WebP, Recommended (default)' : 'AVIF, Recommended',
  batch: batchOf(fixtures, CONVERT_REFUSED),
  ...(to === 'avif' ? { setup: chooseAvif, avif: true as const } : {}),
  ...(then ? { then } : {}),
  deliverable: 'files',
  outcome: outcomeFor(CONVERT_ACCEPTS, (fixture) => {
    const [width, height] = display(fixture);
    return {
      name: sameName(fixture, to),
      format: to,
      width,
      height,
      ...(fixture === TRANSPARENT ? { alpha: 'kept' as const } : {}),
      ...pixelsOf(fixture, { limit: to === 'avif' ? 8 : CLOSE }),
    };
  }),
});

/** The AVIF with alpha goes on to AVIF to JPG, on the same page, with the AVIF fixture and the files that tool refuses. */
const onToAvifToJpg: MatrixCase['then'] = async (page, browser, outputs) => {
  const made = outputs.find((out) => out.name === MADE_AVIF);
  if (!made) throw new Error(`${MADE_AVIF} did not come out of Convert to WebP`);
  const path = test.info().outputPath(MADE_AVIF);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, made.bytes);
  await runCase(page, browser, avifToJpgCase(path));
};

// WebP on every picture it takes, in two batches by the rule of § 88 (the three big photos, then the rest), and AVIF on
// the small ones, whose AVIF with alpha then goes through AVIF to JPG.
CASES.push(
  convertCase('convert-to-webp-webp-photos', 'webp', BIG_PHOTOS),
  convertCase('convert-to-webp-webp-rest', 'webp', CONVERTIBLE.filter((name) => !BIG_PHOTOS.includes(name))),
  convertCase('convert-to-webp-avif', 'avif', AVIF_SMALL, onToAvifToJpg),
);
// ---- Image to PDF --------------------------------------------------------------------------------------------------------------------
CASES.push({
  id: 'image-to-pdf',
  tool: 'image-to-pdf',
  path: '/image-to-pdf/',
  options: 'Image size (default)',
  batch: batchOf(PHOTO, GENERAL_REFUSED),
  deliverable: 'pdf',
  says: FIRST_FRAME,
  outcome: outcomeFor(['jpeg', 'png', 'webp'], (fixture) => {
    const [width, height] = display(fixture);
    return {
      name: 'page',
      format: fixture === TRANSPARENT ? 'png' : 'jpeg',
      width,
      height,
      ...(fixture === TRANSPARENT ? { alpha: 'kept' as const } : {}),
      ...pixelsOf(fixture),
    };
  }),
});

for (const kase of CASES) {
  test(`${kase.id}: ${kase.batch.length} files in one batch`, async ({ page, browserName }) => {
    const record = await runCase(page, browserName, kase);
    test.info().annotations.push({ type: 'matrix', description: `${record.files.length} files in ${record.ms} ms, ${record.requests} requests` });
  });
}

// ---- a refused AVIF in the language of the page, and on the presets (F17, decision 7; DECISOES § 708) ---------------------------
// The batches above run in English, where every tool that does not take AVIF (or HEIC) already shows the row with the
// link. These pages show the same row in Portuguese and Spanish, with the link to the converter of the page's language,
// and on the three presets; the link leads to a page that exists. The sentences are the exact ones (lib/matrix.ts).
const REFUSED_ELSEWHERE: readonly { path: string; lang: Lang }[] = [
  { path: '/pt/comprimir-imagem/', lang: 'pt' },
  { path: '/es/redimensionar-imagen/', lang: 'es' },
  { path: '/compress-image/to-100kb/', lang: 'en' },
  { path: '/compress-image/to-1mb/', lang: 'en' },
  { path: '/resize-image/youtube-thumbnail/', lang: 'en' },
];
for (const { path, lang } of REFUSED_ELSEWHERE) {
  test(`${path}: a refused AVIF and HEIC link to their converters in the language of the page`, async ({ page }) => {
    await openTool(page, path);
    await page.setInputFiles('input[type="file"]', [SMALL.avif, SMALL.heic].map((name) => resolve('fixtures/images', name)));
    await expect(page.locator('.fo-file[data-state="error"]'), 'both files are refused').toHaveCount(2);
    for (const [name, format] of [[SMALL.avif, 'avif'], [SMALL.heic, 'heic']] as const) {
      const link = converterLink(format, lang, name);
      await expectConverterRow(page, name, link);
      const target = await page.request.get(link.href);
      expect(target.status(), `${link.href} exists`).toBe(200);
    }
  });
}
