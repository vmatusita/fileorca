import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { readZip } from './lib/zip.ts';
import {
  chooseImages,
  dataLayer,
  dismissCookies,
  downloadBytes,
  dropFiles,
  hydrated,
  jpegBatch,
  pasteFiles,
  slowEngine,
  type TestFile,
} from './lib/page.ts';

// The shared island (src/tools/image/ImagePanel.tsx) through the Compress image page: batches, the ZIP,
// the queue, paste and drop, errors file by file, the events and the comparison. The matrix of tools x
// fixtures lives in the specs of each tool.

const text = (name: string): TestFile => ({ name, mimeType: 'text/plain', buffer: Buffer.from('hello, this is not an image') });
const junk = (name: string): TestFile => ({ name, mimeType: 'image/jpeg', buffer: Buffer.from(Array.from({ length: 2048 }, (_, i) => (i * 37) % 251)) });
const empty = (name: string): TestFile => ({ name, mimeType: 'image/jpeg', buffer: Buffer.alloc(0) });

test.beforeEach(async ({ page }) => {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
});

async function done(page: Page): Promise<void> {
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.fo-btn--download')).toBeFocused();
}

test.describe('a batch', () => {
  test('N files give N outputs, one ZIP with unique names, and every row downloads what the ZIP holds', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, ['a.jpg', 'a.jpg', 'b.jpg']));
    await done(page);
    const download = page.locator('.fo-btn--download');
    await expect(download).toHaveText(/Download all\s*· ZIP \d/);
    await expect(download).toHaveAttribute('download', 'fileorca-images.zip');
    await expect(page.locator('.fo-result__says')).toContainText(/Done! Your 3 images are \d+% lighter\./);
    await expect(page.locator('.fo-result__stat').last()).toContainText('3');
    const entries = readZip(await downloadBytes(page));
    expect(entries.map((entry) => entry.name)).toEqual(['a.jpg', 'a (2).jpg', 'b.jpg']);
    expect(entries.every((entry) => entry.method === 0 && entry.intact), 'stored, not compressed again').toBe(true);
    // The row buttons are secondary, named after the output, and hand out the same bytes as the ZIP entry.
    const row = page.getByRole('button', { name: 'Download a (2).jpg' });
    await expect(row).toBeVisible();
    const [file] = await Promise.all([page.waitForEvent('download'), row.click()]);
    expect(file.suggestedFilename()).toBe('a (2).jpg');
    const bytes = readFileSync((await file.path()) as string);
    expect(Buffer.compare(bytes, Buffer.from(entries[1]?.bytes ?? []))).toBe(0);
    // One image alone downloads directly, with no ZIP.
    await page.getByRole('button', { name: 'Start over' }).click();
    await chooseImages(page, await jpegBatch(page, ['solo.jpg']));
    await done(page);
    await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', 'solo.jpg');
    await expect(page.locator('.fo-filelist')).toHaveCount(0);
  });

  test('the WaterLevel counts the batch ("0%, 0 of 3 images") and the queue shows working and waiting rows', async ({ page }) => {
    const gate = await slowEngine(page);
    await chooseImages(page, await jpegBatch(page, 3));
    const level = page.locator('.fo-level');
    await expect(level).toBeVisible();
    await expect(level).toHaveAttribute('role', 'progressbar');
    await expect(level).toHaveAttribute('aria-label', 'Compressing images');
    await expect(level).toHaveAttribute('aria-valuetext', '0%, 0 of 3 images');
    await expect(level.locator('.fo-level__count')).toHaveText('0 of 3 images');
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(3);
    await expect(page.locator('.fo-filelist [role="progressbar"]')).toHaveCount(1);
    await expect(page.locator('.fo-filelist').getByText('Waiting')).toHaveCount(2);
    gate.release();
    await done(page);
    await expect(page.locator('.fo-filelist .fo-file__gain')).toHaveCount(3);
  });

  test('more than 6 files show 6 rows and "Show 3 more", which shows the rest', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, 9));
    await done(page);
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(6);
    const more = page.getByRole('button', { name: 'Show 3 more' });
    await expect(more).toBeVisible();
    await more.click();
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(9);
    await expect(more).toHaveCount(0);
    const entries = readZip(await downloadBytes(page));
    expect(entries).toHaveLength(9);
  });

  test('a bad file in the middle shows its own row and reason, and the others come out', async ({ page }) => {
    const photos = await jpegBatch(page, ['one.jpg', 'two.jpg']);
    await chooseImages(page, [photos[0] as TestFile, junk('broken.jpg'), text('notes.png'), empty('empty.jpg'), photos[1] as TestFile]);
    await done(page);
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(5);
    await expect(page.locator('.fo-file[data-state="error"]')).toHaveCount(3);
    // No role=alert per row: the count is announced once, politely.
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText("3 files couldn't be read; the rest are ready.");
    const rows = page.locator('.fo-file[data-state="error"]');
    await expect(rows.nth(0)).toContainText("broken.jpg isn't an image Oli can read. Try JPG, PNG or WebP.");
    await expect(rows.nth(1)).toContainText('notes.png');
    await expect(rows.nth(2)).toContainText('empty.jpg is empty');
    expect(readZip(await downloadBytes(page)).map((entry) => entry.name)).toEqual(['one.jpg', 'two.jpg']);
    // A new batch works afterwards.
    await page.getByRole('button', { name: 'Start over' }).click();
    await chooseImages(page, await jpegBatch(page, ['again.jpg']));
    await done(page);
  });

  test('a HEIC or an AVIF in a tool that does not take them points to the converter', async ({ page }) => {
    const heic = readFileSync('fixtures/images/heic-08-iphone13pro-paisagem-hdr-ios17.heic');
    const avif = readFileSync('fixtures/images/gen-avif.avif');
    const photos = await jpegBatch(page, ['ok.jpg']);
    await chooseImages(page, [photos[0] as TestFile, { name: 'IMG_1.heic', mimeType: 'image/heic', buffer: heic }, { name: 'pic.avif', mimeType: 'image/avif', buffer: avif }]);
    await done(page);
    const heicRow = page.locator('.fo-file[data-state="error"]', { hasText: 'IMG_1.heic' });
    await expect(heicRow).toContainText('IMG_1.heic is a HEIC file. Open it in HEIC to JPG.');
    await expect(heicRow.getByRole('link', { name: 'HEIC to JPG' })).toHaveAttribute('href', '/heic-to-jpg/');
    await expect(page.locator('.fo-file[data-state="error"]', { hasText: 'pic.avif' }).getByRole('link', { name: 'AVIF to JPG' })).toHaveAttribute('href', '/avif-to-jpg/');
  });

  test('when every file fails the drop zone says so once and the rows say why', async ({ page }) => {
    await chooseImages(page, [junk('x.jpg'), text('y.png')]);
    const zone = page.locator('.fo-drop[data-state="error"]');
    await expect(zone).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('alert')).toContainText("Oops, Oli couldn't read this file");
    await expect(page.getByRole('alert')).toContainText("Oli couldn't read any of these 2 files");
    await expect(page.locator('.fo-file[data-state="error"]')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Choose other files' })).toBeVisible();
    // Removing a row takes it off the list; removing the last returns to the start.
    await page.getByRole('button', { name: 'Remove x.jpg' }).click();
    await expect(page.locator('.fo-filelist')).toHaveCount(0);
    await expect(page.getByRole('alert')).toContainText('y.png');
  });

  test('changing the level re-processes the whole batch at once and keeps the focus on the option', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, 3));
    await done(page);
    const before = readZip(await downloadBytes(page)).reduce((sum, entry) => sum + entry.size, 0);
    await page.locator('input[name="ci-level"][value="recommended"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () => {
        try {
          return readZip(await downloadBytes(page)).reduce((sum, entry) => sum + entry.size, 0);
        } catch {
          return Number.POSITIVE_INFINITY;
        }
      }, { timeout: 30_000 })
      .toBeLessThan(before);
    await expect(page.locator('input[name="ci-level"][value="strong"]')).toBeFocused();
  });
});

test.describe('paste and drop', () => {
  test('Ctrl+V takes every image of the clipboard as a batch', async ({ page }) => {
    const taken = await pasteFiles(page, await jpegBatch(page, ['p1.jpg', 'p2.jpg']));
    expect(taken).toBe(true);
    await done(page);
    expect(readZip(await downloadBytes(page)).map((entry) => entry.name)).toEqual(['p1.jpg', 'p2.jpg']);
  });

  test('a paste with no image, or one aimed at the search field, is left alone', async ({ page }) => {
    expect(await pasteFiles(page, [])).toBe(false);
    await page.keyboard.press('Control+K');
    await expect(page.locator('#fo-search-dialog')).toBeVisible();
    const taken = await pasteFiles(page, await jpegBatch(page, ['p1.jpg']), '#fo-search-dialog input');
    expect(taken).toBe(false);
    await expect(page.locator('.fo-level, .fo-result')).toHaveCount(0);
  });

  test('a drop on the result card starts a new batch and the browser never opens the file', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, ['first.jpg']));
    await done(page);
    const taken = await dropFiles(page, '.fo-result', await jpegBatch(page, ['second-a.jpg', 'second-b.jpg']));
    expect(taken, 'dragover and drop are both prevented').toBe(true);
    await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', 'fileorca-images.zip', { timeout: 30_000 });
    expect(readZip(await downloadBytes(page)).map((entry) => entry.name)).toEqual(['second-a.jpg', 'second-b.jpg']);
  });

  test('a drag that carries text is not taken over', async ({ page }) => {
    const prevented = await page.evaluate(() => {
      const transfer = new DataTransfer();
      transfer.setData('text/plain', 'hello');
      const event = new DragEvent('dragover', { dataTransfer: transfer, bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(prevented).toBe(false);
  });
});

test.describe('events', () => {
  test('one tool_start and one tool_complete per batch, one tool_error per failed file, a download per click', async ({ page }) => {
    const photos = await jpegBatch(page, ['a.jpg', 'b.jpg']);
    await chooseImages(page, [photos[0] as TestFile, junk('broken.jpg'), photos[1] as TestFile]);
    await done(page);
    await page.locator('.fo-btn--download').click();
    await page.locator('label.fo-seg__opt', { has: page.locator('input[value="strong"]') }).click();
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Download a.jpg' }).click();
    const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event');
    const count = (name: string) => events.filter((entry) => entry[1] === name);
    expect(count('tool_start')).toHaveLength(1);
    expect(count('tool_complete')).toHaveLength(1);
    expect(count('tool_complete')[0]?.[2]).toEqual({ tool: 'compress-image', lang: 'en', outcome: 'smaller' });
    expect(count('tool_error')).toHaveLength(1);
    expect(count('tool_error')[0]?.[2]).toMatchObject({ tool: 'compress-image', codec: 'unknown', reason: 'unsupported' });
    expect(count('download')).toHaveLength(2);
    for (const [, , params] of events) {
      const json = JSON.stringify(params);
      for (const secret of ['a.jpg', 'b.jpg', 'broken', 'photo']) expect(json).not.toContain(secret);
    }
  });
});

test.describe('the comparison', () => {
  test('appears with the card, is named, starts at 50 and moves with the arrow keys', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, ['one.jpg', 'two.jpg']));
    await done(page);
    const slider = page.getByRole('slider', { name: 'Compare before and after' });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue('50');
    await expect(page.locator('.fo-ba__tag--l')).toHaveText(/^Before · \d/);
    await expect(page.locator('.fo-ba__tag--r')).toHaveText(/^After · \d/);
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('51');
    expect(await page.locator('.fo-ba').evaluate((element) => element.style.getPropertyValue('--pos'))).toBe('51%');
  });

  test('sits inside the card from 768px and under it on the phone, without moving the Download', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, 1));
    await done(page);
    const download = page.locator('.fo-btn--download');
    for (const [width, inside] of [[1280, true], [360, false]] as const) {
      await page.setViewportSize({ width, height: 800 });
      await expect(page.locator('.fo-ba')).toHaveCount(1);
      await expect(page.locator('.fo-result .fo-ba')).toHaveCount(inside ? 1 : 0);
      await expect(page.locator('.fo-result [data-oli]')).toHaveCount(1);
      const box = await download.boundingBox();
      await page.waitForTimeout(400); // the pictures load: the box has its shape already
      expect(await download.boundingBox()).toEqual(box);
    }
  });

  test('picks the file of the queue it shows', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, ['one.jpg', 'two.jpg']));
    await done(page);
    const second = page.getByRole('button', { name: 'Show two.jpg' });
    await expect(page.getByRole('button', { name: 'Show one.jpg' })).toHaveAttribute('aria-pressed', 'true');
    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Show one.jpg' })).toHaveAttribute('aria-pressed', 'false');
  });
});

test('Start over lets go of the object URLs of the batch', async ({ page }) => {
  await chooseImages(page, await jpegBatch(page, 2));
  await done(page);
  const url = await page.locator('.fo-btn--download').getAttribute('href');
  expect(url).toMatch(/^blob:/);
  expect(await page.evaluate(async (target) => (await fetch(target as string)).ok, url)).toBe(true);
  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.locator('.fo-drop')).toBeVisible();
  expect(await page.evaluate(async (target) => fetch(target as string).then(() => true, () => false), url)).toBe(false);
  await expect(page.getByRole('button', { name: 'Choose images' })).toBeFocused();
});
