import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { imageSize, metadataReport, sniff } from './lib/images.ts';
import { parsePdf } from './lib/pdf.ts';
import { readZip } from './lib/zip.ts';
import { dataLayer, dismissCookies, downloadBytes, hydrated, type TestFile } from './lib/page.ts';

// One quick pass over every tool of the Tools phase, in both browsers, with a small batch of fixtures:
// the page loads, a file goes in, the result card shows, and what is behind Download opens, has the
// format and the size the options ask for, and carries no Exif, XMP or GPS. The full matrix (every
// fixture of every tool) is its own spec; this one proves each tool is wired end to end.

const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', avif: 'image/avif' };
const JPG_02 = 'jpg-02-iphone6-paisagem-gps.jpg'; // 3264 × 2448, with GPS
const JPG_01_ROT6 = 'gen-jpg-01-orientacao6.jpg'; // stored 1600 × 1200, shown 1200 × 1600 (Orientation 6), with GPS
const PNG_ALPHA = 'gen-png-transparente.png'; // 800 × 600 with transparency
const WEBP_GPS = 'gen-webp-exif-gps.webp'; // 1600 × 1200 with an Exif chunk that holds GPS
const WEBP_ANIMATED = 'gen-webp-animada.webp'; // 320 × 240, two frames
const AVIF = 'gen-avif.avif'; // 1600 × 1200
const HEIC_08 = 'heic-08-iphone13pro-paisagem-hdr-ios17.heic'; // 1512 × 850 on screen

function fixture(name: string): TestFile {
  const extension = name.split('.').pop() ?? '';
  return { name: basename(name), mimeType: MIME[extension] ?? 'application/octet-stream', buffer: readFileSync(resolve('fixtures/images', name)) };
}

async function open(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await hydrated(page);
  await dismissCookies(page);
}

async function give(page: Page, names: string[]): Promise<void> {
  await page.setInputFiles('input[type="file"]', names.map(fixture));
}

async function ready(page: Page): Promise<void> {
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 55_000 });
  await expect(page.locator('.fo-btn--download')).toBeVisible();
}

interface Out {
  name: string;
  bytes: Uint8Array;
}

/** What Download hands out: one file, or the entries of the ZIP. */
async function outputs(page: Page): Promise<Out[]> {
  const name = (await page.locator('.fo-btn--download').getAttribute('download')) ?? '';
  const bytes = await downloadBytes(page);
  return name.endsWith('.zip') ? readZip(bytes).map((entry) => ({ name: entry.name, bytes: entry.bytes })) : [{ name, bytes }];
}

/** "name:format:widthxheight" of each output, as the browser would show it. */
function describe(outs: Out[]): string[] {
  return outs.map((out) => {
    const size = imageSize(out.bytes);
    return `${out.name}:${size.format}:${size.displayWidth}x${size.displayHeight}`;
  });
}

/** Waits (outputs change when an option is touched, a moment after the click) until the outputs read like this. */
async function expectOutputs(page: Page, expected: string[]): Promise<void> {
  // While the batch is processed again the card (and its Download) may be gone for a moment: that is not a failure, so the poll goes on.
  const current = async () => {
    try {
      return describe(await outputs(page)).join(' | ');
    } catch {
      return 'not ready';
    }
  };
  await expect.poll(current, { timeout: 30_000, message: `outputs should become ${expected.join(' | ')}` }).toBe(expected.join(' | '));
}

function expectClean(outs: Out[]): void {
  for (const out of outs) {
    const report = metadataReport(out.bytes);
    expect(report.exif, `${out.name}: Exif`).toBe(false);
    expect(report.xmp, `${out.name}: XMP`).toBe(false);
    expect(report.gps, `${out.name}: GPS`).toBe(false);
    expect(report.other, `${out.name}: other metadata`).toEqual([]);
  }
}

/** Clicks the label of a segmented option (the radio itself is hidden). */
async function choose(page: Page, label: string): Promise<void> {
  await page.locator('.fo-seg__opt', { hasText: label }).click();
}

test.describe('resize-image', () => {
  test('a result at once, the fields mirror half of the first photo, and the options change what comes out', async ({ page }) => {
    await open(page, '/resize-image/');
    await give(page, [JPG_02, PNG_ALPHA, WEBP_GPS]);
    await ready(page);
    // Untouched: half of each image, and the two fields show half of the first one.
    await expect(page.locator('#rz-width')).toHaveValue('1632');
    await expect(page.locator('#rz-height')).toHaveValue('1224');
    await expectOutputs(page, [`${JPG_02}:jpeg:1632x1224`, `${PNG_ALPHA}:png:400x300`, `${WEBP_GPS}:webp:800x600`]);
    expectClean(await outputs(page));

    // A width: each photo fits inside width × height and keeps its proportions.
    await page.locator('#rz-width').fill('600');
    await expectOutputs(page, [`${JPG_02}:jpeg:600x450`, `${PNG_ALPHA}:png:600x450`, `${WEBP_GPS}:webp:600x450`]);

    // A value that is not a number says so in words and the last valid result stays.
    await page.locator('#rz-height').fill('abc');
    await page.locator('#rz-height').blur();
    await expect(page.locator('#rz-height-error')).toBeVisible();
    await expect(page.locator('#rz-height')).toHaveAttribute('aria-invalid', 'true');
    await expectOutputs(page, [`${JPG_02}:jpeg:600x450`, `${PNG_ALPHA}:png:600x450`, `${WEBP_GPS}:webp:600x450`]);

    // Never enlarges: a box bigger than the photo keeps the original size and the result says so.
    await page.locator('#rz-height').fill('5000');
    await page.locator('#rz-width').fill('5000');
    await page.locator('#rz-width').blur();
    await expectOutputs(page, [`${JPG_02}:jpeg:3264x2448`, `${PNG_ALPHA}:png:800x600`, `${WEBP_GPS}:webp:1600x1200`]);
    await expect(page.locator('.fo-result__notes')).toContainText('kept the original size');

    // By percentage.
    await choose(page, 'By percentage');
    await expectOutputs(page, [`${JPG_02}:jpeg:1632x1224`, `${PNG_ALPHA}:png:400x300`, `${WEBP_GPS}:webp:800x600`]);
    await page.locator('#rz-percent').fill('25');
    await expectOutputs(page, [`${JPG_02}:jpeg:816x612`, `${PNG_ALPHA}:png:200x150`, `${WEBP_GPS}:webp:400x300`]);
    expectClean(await outputs(page));
  });
});

test.describe('resize-image/youtube-thumbnail', () => {
  test('a 1280 × 720 JPG of at most 2 MB, cut from the centre, with the chip to Crop image', async ({ page }) => {
    await open(page, '/resize-image/youtube-thumbnail/');
    await give(page, [JPG_02]);
    await ready(page);
    const [out] = await outputs(page);
    expect(out?.name).toBe(JPG_02);
    expect(describe(out ? [out] : [])).toEqual([`${JPG_02}:jpeg:1280x720`]);
    expect(out?.bytes.length).toBeLessThanOrEqual(2_000_000);
    expectClean(out ? [out] : []);
    await expect(page.locator('.fo-result__notes')).toContainText('cropped from the center');
    await expect(page.locator('.fo-next').getByRole('link', { name: 'Crop image' })).toHaveAttribute('href', '/crop-image/');
  });
});

test.describe('crop-image', () => {
  test('Square by default, then the box moves by keyboard and by pointer, and only the picked photo changes', async ({ page }) => {
    await open(page, '/crop-image/');
    // Before any file there is no editor, only the ratio.
    await expect(page.locator('.fo-crop')).toHaveCount(0);
    await give(page, [JPG_01_ROT6, JPG_02]);
    await ready(page);
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1200x1200`, `${JPG_02}:jpeg:2448x2448`]);
    expectClean(await outputs(page));

    // The editor shows the picked photo (the first), its box is a group the keyboard can reach, and the fields mirror it.
    const box = page.locator('.fo-crop__box');
    await expect(box).toHaveAttribute('role', 'group');
    await expect(box).toHaveAccessibleName('Crop area');
    await expect(box).toHaveAccessibleDescription(/Arrow keys move the box/);
    await expect(page.locator('#cr-x')).toHaveValue('0');
    await expect(page.locator('#cr-y')).toHaveValue('200');
    await expect(page.locator('#cr-width')).toHaveValue('1200');
    await expect(page.locator('#cr-height')).toHaveValue('1200');

    // Keyboard: arrows move (1% of the photo), Shift with the arrows changes the size (the ratio stays).
    await box.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#cr-y')).toHaveValue('216');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(page.locator('#cr-width')).toHaveValue('1188');
    await expect(page.locator('#cr-height')).toHaveValue('1188');
    // Only the photo that was adjusted is cropped again.
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1188x1188`, `${JPG_02}:jpeg:2448x2448`]);

    // Pointer: dragging a corner makes the box smaller; the ratio stays.
    const handle = await page.locator('.fo-crop__handle[data-corner="se"]').boundingBox();
    expect(handle).not.toBeNull();
    if (handle) {
      const x = handle.x + handle.width / 2;
      const y = handle.y + handle.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x - 40, y - 40, { steps: 4 });
      await page.mouse.up();
    }
    await expect(page.locator('#cr-width')).not.toHaveValue('1188');
    const width = Number(await page.locator('#cr-width').inputValue());
    const height = Number(await page.locator('#cr-height').inputValue());
    expect(width).toBeLessThan(1188);
    expect(Math.abs(width - height)).toBeLessThanOrEqual(1);
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:${width}x${height}`, `${JPG_02}:jpeg:2448x2448`]);

    // The fields are the accessible path: a typed value moves the box and the picture is cropped again.
    await page.locator('#cr-x').fill('10');
    await expect(page.locator('#cr-x')).toHaveValue('10');
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:${width}x${height}`, `${JPG_02}:jpeg:2448x2448`]);

    // Pointer: dragging inside the box moves it (the size stays).
    const body = await page.locator('.fo-crop__box').boundingBox();
    expect(body).not.toBeNull();
    if (body) {
      const cx = body.x + body.width / 2;
      const cy = body.y + body.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 30, cy, { steps: 4 });
      await page.mouse.up();
    }
    await expect.poll(async () => Number(await page.locator('#cr-x').inputValue())).toBeGreaterThan(10);
    await expect(page.locator('#cr-width')).toHaveValue(String(width));
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:${width}x${height}`, `${JPG_02}:jpeg:2448x2448`]);

    // Picking the other photo in the queue shows its own box, the centred one.
    await page.getByRole('button', { name: `Show ${JPG_02}` }).click();
    await expect(page.locator('#cr-width')).toHaveValue('2448');
    await expect(page.locator('#cr-x')).toHaveValue('408');

    // Another ratio starts every photo over with its centred crop.
    await choose(page, '16:9');
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1200x675`, `${JPG_02}:jpeg:3264x1836`]);
    // Free keeps the box on screen for the picked photo and leaves the other whole.
    await choose(page, 'Free');
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1200x1600`, `${JPG_02}:jpeg:3264x1836`]);
  });
});

test.describe('rotate-image', () => {
  test('a quarter turn by default, then 180° and a mirror, for the whole batch', async ({ page }) => {
    await open(page, '/rotate-image/');
    await give(page, [JPG_01_ROT6, PNG_ALPHA]);
    await ready(page);
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1600x1200`, `${PNG_ALPHA}:png:600x800`]);
    expectClean(await outputs(page));
    await choose(page, 'Left 90°');
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1600x1200`, `${PNG_ALPHA}:png:600x800`]);
    await choose(page, '180°');
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1200x1600`, `${PNG_ALPHA}:png:800x600`]);
    await choose(page, 'Horizontal');
    await expectOutputs(page, [`${JPG_01_ROT6}:jpeg:1200x1600`, `${PNG_ALPHA}:png:800x600`]);
    const outs = await outputs(page);
    expect(outs.every((out) => metadataReport(out.bytes).orientation === null), 'no Orientation tag is left in the outputs').toBe(true);
  });
});

test.describe('heic-to-jpg', () => {
  test('a HEIC becomes a JPG from its main image, a JPG is sent to the right tool, and PNG works too', async ({ page }) => {
    await open(page, '/heic-to-jpg/');
    await give(page, [HEIC_08, JPG_02]);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 55_000 });
    // The JPG is refused in its row and the HEIC comes out on its own (one file, so no ZIP).
    const outs = await outputs(page);
    expect(describe(outs)).toEqual(['heic-08-iphone13pro-paisagem-hdr-ios17.jpg:jpeg:1512x850']);
    expectClean(outs);
    await expect(page.locator('.fo-filelist [data-state="error"]')).toHaveCount(1);
    await choose(page, 'PNG');
    await expectOutputs(page, ['heic-08-iphone13pro-paisagem-hdr-ios17.png:png:1512x850']);
    expectClean(await outputs(page));
  });
});

test.describe('webp-to-jpg', () => {
  test('WebP files become JPG (an animation gives its first frame) and PNG on request', async ({ page }) => {
    await open(page, '/webp-to-jpg/');
    await give(page, [WEBP_GPS, WEBP_ANIMATED]);
    await ready(page);
    await expectOutputs(page, ['gen-webp-exif-gps.jpg:jpeg:1600x1200', 'gen-webp-animada.jpg:jpeg:320x240']);
    expectClean(await outputs(page));
    await expect(page.locator('.fo-result__notes')).toContainText('first frame');
    await choose(page, 'PNG');
    await expectOutputs(page, ['gen-webp-exif-gps.png:png:1600x1200', 'gen-webp-animada.png:png:320x240']);
  });
});

test.describe('png-to-jpg', () => {
  test('a PNG becomes a JPG (a PNG named .jpg too), a JPG becomes a PNG', async ({ page }) => {
    await open(page, '/png-to-jpg/');
    await give(page, [PNG_ALPHA, 'gen-png-extensao-jpg.jpg', JPG_02]);
    await ready(page);
    await expectOutputs(page, ['gen-png-transparente.jpg:jpeg:800x600', 'gen-png-extensao-jpg.jpg:jpeg:640x480', 'jpg-02-iphone6-paisagem-gps.png:png:3264x2448']);
    const outs = await outputs(page);
    expectClean(outs);
    expect(outs.map((out) => sniff(out.bytes))).toEqual(['jpeg', 'jpeg', 'png']);
    await expect(page.locator('.fo-result__notes')).toContainText('became white');
  });
});

test.describe('avif-to-jpg', () => {
  test('an AVIF becomes a JPG', async ({ page }) => {
    await open(page, '/avif-to-jpg/');
    await give(page, [AVIF]);
    await ready(page);
    const outs = await outputs(page);
    expect(describe(outs)).toEqual(['gen-avif.jpg:jpeg:1600x1200']);
    expectClean(outs);
  });
});

test.describe('convert-to-webp', () => {
  test('a JPG and a PNG become WebP, and AVIF when asked', async ({ page }) => {
    await open(page, '/convert-to-webp/');
    await give(page, ['gen-jpg-02-orientacao8.jpg', PNG_ALPHA]);
    await ready(page);
    await expectOutputs(page, ['gen-jpg-02-orientacao8.webp:webp:1600x1200', 'gen-png-transparente.webp:webp:800x600']);
    expectClean(await outputs(page));
    await choose(page, 'Strong');
    await expectOutputs(page, ['gen-jpg-02-orientacao8.webp:webp:1600x1200', 'gen-png-transparente.webp:webp:800x600']);
    await choose(page, 'AVIF');
    await expectOutputs(page, ['gen-jpg-02-orientacao8.avif:avif:1600x1200', 'gen-png-transparente.avif:avif:800x600']);
    expectClean(await outputs(page));
  });
});

test.describe('image-to-pdf', () => {
  test('one PDF with a page per image, in the order of the list, and the sheet changes only the PDF', async ({ page }) => {
    await open(page, '/image-to-pdf/');
    await give(page, [JPG_01_ROT6, PNG_ALPHA, JPG_02]);
    await ready(page);
    await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', 'fileorca-images.pdf');
    const sizes = async () => {
      const bytes = await downloadBytes(page);
      expect(sniff(bytes)).toBe('pdf');
      const pdf = parsePdf(bytes);
      expect(pdf.info['Producer']).toBe('FileOrca');
      expect(pdf.hasXmp).toBe(false);
      expectClean([{ name: 'fileorca-images.pdf', bytes }]);
      return pdf.pages.map((pdfPage) => `${Math.round(pdfPage.width)}x${Math.round(pdfPage.height)}`);
    };
    await expect.poll(sizes, { timeout: 30_000 }).toEqual(['1200x1600', '800x600', '3264x2448']);
    await choose(page, 'Letter');
    await expect.poll(sizes, { timeout: 30_000 }).toEqual(['612x792', '792x612', '792x612']);
    await choose(page, 'A4');
    await expect.poll(sizes, { timeout: 30_000 }).toEqual(['595x842', '842x595', '842x595']);
    await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', 'fileorca-images.pdf');
  });
});

test.describe('crop-image with the keyboard only', () => {
  test('Tab from the ratio reaches the box, the arrows move and resize it, Tab goes on to the fields', async ({ page }) => {
    await open(page, '/crop-image/');
    await give(page, [JPG_02]);
    await ready(page);
    await expect(page.locator('#cr-x')).toHaveValue('408');
    // The checked ratio is the one stop of the radio group; the box is the next one, then the four fields.
    await page.locator('input[name="cr-ratio"]:checked').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('.fo-crop__box')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#cr-x')).toHaveValue(String(408 - 2 * 33));
    // The Square box already fills the height of the photo, so it can only get smaller: Shift with Left shrinks it by 1% of the width.
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(page.locator('#cr-width')).toHaveValue('2415');
    await expect(page.locator('#cr-height')).toHaveValue('2415');
    await page.keyboard.press('Tab');
    await expect(page.locator('#cr-x')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#cr-y')).toBeFocused();
    await page.keyboard.type('5');
    await page.keyboard.press('Enter');
    await expectOutputs(page, [`${JPG_02}:jpeg:2415x2415`]);
    await expect(page.locator('#cr-y')).toHaveValue('5');
  });
});

// axe on the option states of the Tools phase (WCAG 2.2 AA and best practices), in both themes at 360 and
// 1280 px, on one load per state. The pages themselves (idle) are covered by a11y.spec.ts.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const COMBOS = [
  { width: 360, height: 740, colorScheme: 'dark' },
  { width: 360, height: 740, colorScheme: 'light' },
  { width: 1280, height: 800, colorScheme: 'dark' },
  { width: 1280, height: 800, colorScheme: 'light' },
] as const;

async function axeEverywhere(page: Page): Promise<string[]> {
  const found: string[] = [];
  for (const combo of COMBOS) {
    await page.setViewportSize({ width: combo.width, height: combo.height });
    await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const violation of results.violations) found.push(`${combo.width}px ${combo.colorScheme} · ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
  }
  return found;
}

test.describe('axe on the option states', () => {
  test.use({ reducedMotion: 'reduce' });

  test('crop editor with a result: the box, the handles, the four fields and a batch of two', async ({ page }) => {
    await open(page, '/crop-image/');
    await give(page, [JPG_01_ROT6, JPG_02]);
    await ready(page);
    await expect(page.locator('.fo-crop')).toBeVisible();
    expect(await axeEverywhere(page)).toEqual([]);
  });

  test('resize fields, one of them in error', async ({ page }) => {
    await open(page, '/resize-image/');
    await give(page, [JPG_02]);
    await ready(page);
    expect(await axeEverywhere(page)).toEqual([]);
    await page.locator('#rz-width').fill('abc');
    await page.locator('#rz-width').blur();
    await expect(page.locator('#rz-width-error')).toBeVisible();
    expect(await axeEverywhere(page)).toEqual([]);
    await choose(page, 'By percentage');
    await expect(page.locator('#rz-percent')).toBeVisible();
    expect(await axeEverywhere(page)).toEqual([]);
  });

  test('the options of Image to PDF, Rotate and Convert to WebP with a result', async ({ page }) => {
    for (const [path, files] of [
      ['/image-to-pdf/', [JPG_01_ROT6, PNG_ALPHA]],
      ['/rotate-image/', [JPG_01_ROT6]],
      ['/convert-to-webp/', [PNG_ALPHA]],
    ] as const) {
      await open(page, path);
      await give(page, [...files]);
      await ready(page);
      expect(await axeEverywhere(page), path).toEqual([]);
    }
  });
});

test.describe('typed numbers', () => {
  test('what is typed in Resize and Crop never reaches the URL or an event', async ({ page }) => {
    for (const [path, file, steps, tool, outcome, shown] of [
      ['/resize-image/', JPG_02, async () => { await page.locator('#rz-width').fill('7771'); await page.locator('#rz-height').fill('3331'); await page.locator('#rz-height').blur(); }, 'resize-image', 'resized', 'jpg-02-iphone6-paisagem-gps.jpg:jpeg:3264x2448'],
      ['/crop-image/', JPG_02, async () => { await page.locator('#cr-width').fill('1777'); await page.locator('#cr-width').blur(); }, 'crop-image', 'cropped', 'jpg-02-iphone6-paisagem-gps.jpg:jpeg:1777x1777'],
    ] as const) {
      await open(page, path);
      await give(page, [file]);
      await ready(page);
      await steps();
      await expectOutputs(page, [shown]);
      expect(new URL(page.url()).search, 'no query string').toBe('');
      expect(new URL(page.url()).hash, 'no hash').toBe('');
      const events = JSON.stringify(await dataLayer(page));
      for (const typed of ['7771', '3331', '1777']) expect(events, 'a typed number in the events').not.toContain(typed);
      const complete = (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'tool_complete');
      expect(complete, 'one tool_complete for the batch').toEqual([['event', 'tool_complete', { tool, lang: 'en', outcome }]]);
    }
  });
});
