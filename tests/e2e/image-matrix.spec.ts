import { test, type Page } from '@playwright/test';
import {
  BROKEN,
  EXT,
  baseOf,
  batchOf,
  fixturesOf,
  oracle,
  runCase,
  wrongTool,
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
// the table docs/relatorios/fase-02-matriz.md is built from are written to test-results/matriz/.

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

/** How a fixture that this tool cannot use is refused. */
function refusal(fixture: string, accepts: readonly Format[]): Refuse | null {
  const entry = oracle(fixture);
  if (entry.expect === 'empty') return { refuse: 'empty' };
  if (entry.expect === 'unsupported') return { refuse: 'unsupported' };
  if (!accepts.includes(entry.format)) return wrongTool(fixture);
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
const CONVERTIBLE = fixturesOf('jpeg', 'png');

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
CASES.push({
  id: 'rotate-image',
  tool: 'rotate-image',
  path: '/rotate-image/',
  options: 'Right 90° (default), no mirror',
  batch: batchOf(PHOTO, GENERAL_REFUSED),
  deliverable: 'files',
  says: FIRST_FRAME,
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
// The ten, in two batches of five with about the same number of megapixels each (heic-01 to 03, 05, 06, 07
// and 09 are 12 MP; the libheif decode is the cost). heic-05 and heic-09 (the double-rotation trap) are in the second.
const heicIds = (...numbers: number[]): string[] => HEIC.filter((name) => numbers.some((number) => name.startsWith(`heic-${String(number).padStart(2, '0')}-`)));
CASES.push(
  {
    id: 'heic-to-jpg-a',
    tool: 'heic-to-jpg',
    path: '/heic-to-jpg/',
    options: 'JPG (default)',
    batch: batchOf(heicIds(1, 2, 3, 4, 10), HEIC_REFUSED),
    deliverable: 'files',
    outcome: heicOutcome('jpeg'),
  },
  {
    id: 'heic-to-jpg-b',
    tool: 'heic-to-jpg',
    path: '/heic-to-jpg/',
    options: 'JPG (default)',
    batch: batchOf(heicIds(5, 6, 7, 8, 9), BROKEN.slice(0, 2)),
    deliverable: 'files',
    outcome: heicOutcome('jpeg'),
  },
  {
    id: 'heic-to-jpg-png',
    tool: 'heic-to-jpg',
    path: '/heic-to-jpg/',
    options: 'PNG',
    batch: batchOf(heicIds(5, 7, 10), BROKEN.slice(2)),
    setup: choosePng,
    deliverable: 'files',
    outcome: heicOutcome('png'),
  },
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
// JPG to PNG is the heavy half (a 12 MP photo becomes a PNG of tens of MB): the big photos in one batch.
const JPEGS = fixturesOf('jpeg');
CASES.push(
  swapTests(fixturesOf('png'), [SMALL.webp, SMALL.heic, SMALL.avif, BROKEN[2], BROKEN[3]], 'png-to-jpg-png', 'PNG files go to JPG', ['Transparent areas became white']),
  swapTests(BIG_PHOTOS, [SMALL.webp, SMALL.heic, SMALL.avif, BROKEN[0], BROKEN[1]], 'png-to-jpg-photos', 'JPG files go to PNG'),
  swapTests(
    JPEGS.filter((name) => !BIG_PHOTOS.includes(name)),
    [SMALL.webp, SMALL.heic, SMALL.avif, BROKEN[0], BROKEN[1]],
    'png-to-jpg-rest',
    'JPG files go to PNG',
  ),
);

// ---- AVIF to JPG ---------------------------------------------------------------------------------------------------------------------
CASES.push({
  id: 'avif-to-jpg',
  tool: 'avif-to-jpg',
  path: '/avif-to-jpg/',
  options: 'JPG',
  batch: batchOf(fixturesOf('avif'), [SMALL.jpeg, SMALL.png, SMALL.webp, SMALL.heic, ...BROKEN]),
  deliverable: 'files',
  outcome: outcomeFor(['avif'], (fixture) => {
    const [width, height] = display(fixture);
    return { name: sameName(fixture, 'jpeg'), format: 'jpeg', width, height, pixels: { from: JPG_03, limit: 8 } };
  }),
});

// ---- Convert to WebP / AVIF ----------------------------------------------------------------------------------------------------------
const CONVERT_ACCEPTS: Format[] = ['jpeg', 'png'];
const chooseAvif = async (page: Page): Promise<void> => {
  await page.locator('.fo-seg__opt', { hasText: 'AVIF' }).click();
};
const convertCase = (to: 'webp' | 'avif', fixtures: string[], refused: string[], id: string, setup?: MatrixCase['setup']): MatrixCase => ({
  id,
  tool: 'convert-to-webp',
  path: '/convert-to-webp/',
  options: `${to === 'webp' ? 'WebP' : 'AVIF'}, Recommended`,
  batch: batchOf(fixtures, refused),
  ...(setup ? { setup } : {}),
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
const CONVERT_REFUSED = [SMALL.webp, SMALL.heic, SMALL.avif, ...BROKEN];
CASES.push(
  convertCase('webp', BIG_PHOTOS, CONVERT_REFUSED, 'convert-to-webp-webp-photos'),
  convertCase('webp', CONVERTIBLE.filter((name) => !BIG_PHOTOS.includes(name)), CONVERT_REFUSED, 'convert-to-webp-webp-rest'),
  convertCase('avif', CONVERTIBLE, CONVERT_REFUSED, 'convert-to-webp-avif', chooseAvif),
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
