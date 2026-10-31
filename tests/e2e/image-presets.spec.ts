import { expect, test, type Page } from '@playwright/test';
import { imageSize, sniff } from './lib/images.ts';
import {
  baseOf,
  colours,
  comparePixels,
  decodeInPage,
  expectNoMetadata,
  filesOf,
  fixtureBytes,
  fixtureFile,
  openTool,
  showAllRows,
  takeDownload,
  watchRequests,
  writePresetRecord,
  type OutFile,
  type PixelCheck,
  type PresetRecord,
  type Reference,
} from './lib/matrix.ts';
import { webpInfo } from './lib/webp.ts';

// The three presets of the image phase (criterion 7): Compress image to 100 KB and to 1 MB, and the
// YouTube thumbnail. Their engine runs through the whole matrix of the parent tool, so each preset gets
// one big photo (12 MP), the transparent PNG, a WebP and a picture that already fits, in one upload.
// What is asserted: the byte limit of every output, the format, the size and the notes the result
// states, that nothing carries metadata, that a picture which already fits comes back in its own
// format, and that an orientation survives the preset. Each output's bytes go into the record the
// report's preset table is built from (test-results/matriz/preset-*.json).

const JPG_01 = 'jpg-01-pixel2-retrato-gps.jpg'; // 12 MP, 3024 x 4032, 4.3 MB, GPS
const ROT8 = 'gen-jpg-02-orientacao8.jpg'; // 1600 x 1200 on screen, Orientation 8, 417 KB, GPS
const PNG_ALPHA = 'gen-png-transparente.png'; // 800 x 600, transparent corners, 1.1 MB
const WEBP = 'gen-webp-exif-gps.webp'; // 1600 x 1200, EXIF chunk with GPS, 262 KB
const WEBP_ANIMATED = 'gen-webp-animada.webp'; // 320 x 240, two frames, 7 KB

interface Seen {
  out: OutFile;
  fixture: string;
  width: number;
  height: number;
  opens: boolean;
}

/** One upload to the preset page; the outputs come back read from the ZIP, each decoded in the browser. */
async function usePreset(page: Page, path: string, fixtures: string[]): Promise<{ seen: Seen[]; ms: number; requests: ReturnType<typeof watchRequests> }> {
  const requests = watchRequests(page);
  await openTool(page, path);
  const started = Date.now();
  await page.setInputFiles('input[type="file"]', fixtures.map(fixtureFile));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 50_000 });
  const ms = Date.now() - started;
  await showAllRows(page);
  await expect(page.locator('.fo-file[data-state="error"]'), 'every file of the batch came out').toHaveCount(0);
  const outs = filesOf(await takeDownload(page));
  expect(outs, 'one output per file, in the order of the queue').toHaveLength(fixtures.length);
  const report = await decodeInPage(page);
  const seen = outs.map((out, index) => {
    const size = imageSize(out.bytes);
    const decoded = report.files.find((file) => file.name === out.name);
    expect(decoded?.ok, `${out.name} opens in the browser`).toBe(true);
    expect([decoded?.width, decoded?.height], `${out.name}: size once decoded`).toEqual([size.displayWidth, size.displayHeight]);
    expectNoMetadata(out, { tagMayStay: true });
    return { out, fixture: fixtures[index] as string, width: size.displayWidth, height: size.displayHeight, opens: true };
  });
  return { seen, ms, requests };
}

const noteLines = async (page: Page): Promise<string[]> => page.locator('.fo-result__notes li').allTextContents();

const sizeOf = (fixture: string): number => fixtureBytes(fixture).length;

// ---- Compress image to 100 KB and to 1 MB ----------------------------------------------------------------------------

interface Target {
  id: string;
  path: string;
  /** The limit in bytes: the smaller of the two readings of "KB" and "MB". */
  limit: number;
  fixtures: string[];
}

const TARGETS: Target[] = [
  { id: 'to-100kb', path: '/compress-image/to-100kb/', limit: 100_000, fixtures: [JPG_01, PNG_ALPHA, WEBP, WEBP_ANIMATED, ROT8] },
  { id: 'to-1mb', path: '/compress-image/to-1mb/', limit: 1_000_000, fixtures: [JPG_01, PNG_ALPHA, WEBP, ROT8] },
];

for (const target of TARGETS) {
  test(`compress-image/${target.id}: every output is a JPG of at most ${target.limit.toLocaleString('en')} bytes, what already fits comes back as it is`, async ({ page, browserName }) => {
    const { seen, ms, requests } = await usePreset(page, target.path, target.fixtures);
    const notes = await noteLines(page);
    const references = new Map<string, Reference>();
    const record: PresetRecord['files'] = [];

    for (const { out, fixture, width, height } of seen) {
      const fits = sizeOf(fixture) <= target.limit;
      expect(out.bytes.length, `${out.name}: ${out.bytes.length} bytes against the limit of ${target.limit}`).toBeLessThanOrEqual(target.limit);
      const source = imageSize(fixtureBytes(fixture));
      let note = '';
      if (fits) {
        // Already small enough: its own format, its own pixels, no metadata (the animation is not flattened to a still).
        expect(sniff(out.bytes), `${fixture} fits, so it keeps its format`).toBe(source.format);
        expect([width, height], `${fixture} fits, so it keeps its size`).toEqual([source.displayWidth, source.displayHeight]);
        if (fixture === WEBP_ANIMATED) expect(webpInfo(out.bytes).animated, 'the animation is still one').toBe(true);
        note = 'already fits: own format and no metadata';
      } else {
        expect(sniff(out.bytes), `${fixture} does not fit, so it becomes a JPG`).toBe('jpeg');
        expect(out.name, 'the output carries the JPG extension').toBe(`${baseOf(fixture)}.jpg`);
        // Never larger than the source, and the proportions stay (a rounded pixel at most).
        expect(width, `${fixture}: not wider than the source`).toBeLessThanOrEqual(source.displayWidth);
        expect(height, `${fixture}: not taller than the source`).toBeLessThanOrEqual(source.displayHeight);
        expect(Math.abs(width / height - source.displayWidth / source.displayHeight), `${fixture}: same proportions`).toBeLessThan(0.01);
        note = width < source.displayWidth ? `reduced to ${width} x ${height} px` : 'quality only';
      }
      if (fixture === PNG_ALPHA) {
        const seenColours = await colours(page, out, 'jpeg');
        const corners = [...seenColours.rgb.slice(0, 3), ...seenColours.rgb.slice(-3)];
        expect(corners.every((value) => value >= 235), `${out.name}: transparent corners are white (${corners.map(Math.round).join(',')})`).toBe(true);
        note = `${note}, transparency white`;
      }
      if (fixture === ROT8) {
        // The orientation of the file survives whichever way the preset handled it (re-encoded, or handed back clean).
        const check: PixelCheck = { from: ROT8, limit: 10 };
        const verdict = await comparePixels(page, out, 'jpeg', check, references);
        expect(verdict.right, `${out.name}: the picture is upright`).toBeLessThan(check.limit);
        if (verdict.closestWrong !== null) expect(verdict.closestWrong, `${out.name}: a wrong orientation is further`).toBeGreaterThan(verdict.right + 4);
        note = `${note}, orientation ok`;
      }
      record.push({ fixture, input: sizeOf(fixture), output: out.name, format: sniff(out.bytes), width, height, bytes: out.bytes.length, note });
    }

    // What the result says: the new dimensions when the picture was made smaller, the white that replaced the transparency.
    const reduced = seen.find(({ fixture, width }) => sizeOf(fixture) > target.limit && width < imageSize(fixtureBytes(fixture)).displayWidth);
    if (reduced) expect(notes.join(' | ')).toContain(`reduced the dimensions to ${reduced.width} × ${reduced.height} px`);
    else expect(notes.join(' | ')).not.toContain('reduced the dimensions');
    expect(notes.join(' | '), 'the result says the transparency became white').toContain('Transparent areas became white');
    expect(notes.at(-1), 'and that the metadata is gone').toContain('removed the photo metadata');
    // The 12 MP photo is the one that must be made smaller than itself at 100 KB: scaled first, never searched whole.
    if (target.limit === 100_000) expect(reduced?.fixture).toBe(JPG_01);

    expect(requests.outside(), 'no request leaves the page origin').toEqual([]);
    writePresetRecord({ id: `compress-image-${target.id}`, browser: browserName, path: target.path, limit: target.limit, ms, files: record });
  });
}

// ---- Resize image: YouTube thumbnail ------------------------------------------------------------------------------------

test('resize-image/youtube-thumbnail: 1280 × 720 JPG of at most 2,000,000 bytes, cut from the centre, with the chip to Crop image', async ({ page, browserName }) => {
  const fixtures = [JPG_01, PNG_ALPHA, WEBP, ROT8];
  const { seen, ms, requests } = await usePreset(page, '/resize-image/youtube-thumbnail/', fixtures);
  const references = new Map<string, Reference>();
  const record: PresetRecord['files'] = [];
  for (const { out, fixture, width, height } of seen) {
    expect(sniff(out.bytes), `${fixture} becomes a JPG`).toBe('jpeg');
    expect(out.name).toBe(`${baseOf(fixture)}.jpg`);
    expect([width, height], `${fixture}: the size of a thumbnail`).toEqual([1280, 720]);
    expect(out.bytes.length, `${out.name}: ${out.bytes.length} bytes against 2,000,000`).toBeLessThanOrEqual(2_000_000);
    let note = '16:9 from the centre';
    // The centre of the transparent PNG is what the frame keeps, and its transparent corners are cut off: the
    // white that replaces transparency is checked in the matrix and in the two size presets, and said on the result below.
    if (fixture === PNG_ALPHA) note = `${note}, transparency white (said on the result)`;
    if (fixture === ROT8) {
      // 1600 x 1200 on screen: the 16:9 frame takes the full width and the middle 75% of the height.
      const check: PixelCheck = { from: ROT8, limit: 10, box: [0, 0.125, 1, 0.75] };
      const verdict = await comparePixels(page, out, 'jpeg', check, references);
      expect(verdict.right, `${out.name}: the centre of the upright picture`).toBeLessThan(check.limit);
      note = `${note}, orientation ok`;
    }
    record.push({ fixture, input: sizeOf(fixture), output: out.name, format: 'jpeg', width, height, bytes: out.bytes.length, note });
  }
  const notes = (await noteLines(page)).join(' | ');
  expect(notes).toContain('cropped from the center');
  expect(notes, 'the 800 × 600 PNG is smaller than the frame').toContain('enlarged');
  expect(notes).toContain('Transparent areas became white');
  await expect(page.locator('.fo-next').getByRole('link', { name: 'Crop image' })).toHaveAttribute('href', '/crop-image/');
  expect(requests.outside(), 'no request leaves the page origin').toEqual([]);
  writePresetRecord({ id: 'resize-image-youtube-thumbnail', browser: browserName, path: '/resize-image/youtube-thumbnail/', limit: 2_000_000, ms, files: record });
});
