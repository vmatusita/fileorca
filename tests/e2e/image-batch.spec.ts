import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { sniff } from './lib/images.ts';
import { fixtureFile, watchRequests } from './lib/matrix.ts';
import { readZip } from './lib/zip.ts';
import { chooseImages, dataLayer, dismissCookies, downloadBytes, hydrated, jpegBatch, pasteFiles, type TestFile } from './lib/page.ts';

// Batches on the shared island (criteria 5 and 6), through Compress image: files that cannot be read
// in the middle of a batch, N files and N outputs, the ZIP and its names, every row against the ZIP,
// one file alone, more than six files, and Ctrl+V. The fixture matrix (spec image-matrix) already
// covers a refused file in the middle of every tool's batch; this spec covers what the batch does
// around them and what comes after. Small generated photos keep the page load and the engine cheap.

test.beforeEach(async ({ page }) => {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
});

async function done(page: Page): Promise<void> {
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.fo-btn--download')).toBeFocused();
}

async function savedAs(page: Page, name: string): Promise<{ name: string; bytes: Buffer }> {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: `Download ${name}`, exact: true }).click()]);
  return { name: download.suggestedFilename(), bytes: readFileSync((await download.path()) as string) };
}

test.describe('files that cannot be read, in the middle of a batch', () => {
  test('the corrupted, the truncated, the empty and the text file each say why, the others come out, the page does not hang and a new batch works', async ({ page }) => {
    const requests = watchRequests(page);
    const photos = await jpegBatch(page, ['one.jpg', 'two.jpg']);
    await chooseImages(page, [
      photos[0] as TestFile,
      fixtureFile('gen-jpg-corrompido.jpg'),
      fixtureFile('gen-jpg-truncado.jpg'),
      fixtureFile('gen-vazio.jpg'),
      fixtureFile('gen-texto-extensao-png.png'),
      photos[1] as TestFile,
    ]);
    await done(page);
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(6);
    const errors = page.locator('.fo-file[data-state="error"]');
    await expect(errors).toHaveCount(4);
    // Each row names its file and says what to do. The rows are not alerts: the count is announced once, politely.
    await expect(errors.nth(0)).toContainText("gen-jpg-corrompido.jpg is damaged, so Oli can't read it. Try another copy of the file.");
    await expect(errors.nth(1)).toContainText('gen-jpg-truncado.jpg stops before its end, so part of the image is missing.');
    await expect(errors.nth(2)).toContainText('gen-vazio.jpg is empty, so there is nothing to read.');
    await expect(errors.nth(3)).toContainText("gen-texto-extensao-png.png isn't an image Oli can read. Try JPG, PNG or WebP.");
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText("4 files couldn't be read; the rest are ready.");
    expect(readZip(await downloadBytes(page)).map((entry) => entry.name)).toEqual(['one.jpg', 'two.jpg']);

    // An option changed afterwards processes the good files again and does not try the lost ones, nor report them twice.
    await page.locator('label.fo-seg__opt', { has: page.locator('input[value="strong"]') }).click();
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(errors).toHaveCount(4);
    const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event');
    expect(events.filter((entry) => entry[1] === 'tool_error')).toHaveLength(4);
    expect(events.filter((entry) => entry[1] === 'tool_start')).toHaveLength(1);

    // Nothing hung: start over, and a new batch goes through.
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.locator('.fo-drop')).toBeVisible();
    await chooseImages(page, await jpegBatch(page, ['again-1.jpg', 'again-2.jpg']));
    await done(page);
    expect(readZip(await downloadBytes(page)).map((entry) => entry.name)).toEqual(['again-1.jpg', 'again-2.jpg']);
    expect(requests.outside()).toEqual([]);
  });
});

test.describe('N files, N outputs', () => {
  test('one ZIP with unique names that opens, every row hands out what the ZIP holds, and a single file downloads as it is', async ({ page }) => {
    const same = 'gen-jpg-02-orientacao8.jpg';
    await chooseImages(page, [fixtureFile(same), fixtureFile(same), fixtureFile(same), fixtureFile('gen-webp-exif-gps.webp')]);
    await done(page);
    const download = page.locator('.fo-btn--download');
    await expect(download).toHaveText(/Download all\s*· ZIP \d/);
    await expect(download).toHaveAttribute('download', 'fileorca-images.zip');
    await expect(page.locator('.fo-result__says')).toContainText(/Done! Your 4 images are \d+% lighter\./);
    await expect(page.locator('.fo-result__stat').last()).toContainText('4');

    const entries = readZip(await downloadBytes(page));
    expect(entries.map((entry) => entry.name), 'repeated names get (2), (3) and the ZIP opens').toEqual([
      'gen-jpg-02-orientacao8.jpg',
      'gen-jpg-02-orientacao8 (2).jpg',
      'gen-jpg-02-orientacao8 (3).jpg',
      'gen-webp-exif-gps.webp',
    ]);
    expect(entries.every((entry) => entry.method === 0 && entry.intact), 'stored, not compressed again, and intact').toBe(true);
    expect(entries.map((entry) => sniff(entry.bytes))).toEqual(['jpeg', 'jpeg', 'jpeg', 'webp']);

    // Each row's download is the same bytes as its entry of the ZIP, under the same name.
    for (const entry of entries) {
      const file = await savedAs(page, entry.name);
      expect(file.name).toBe(entry.name);
      expect(Buffer.compare(file.bytes, Buffer.from(entry.bytes)), `${entry.name}: row download equals the ZIP entry`).toBe(0);
    }

    // One file alone downloads directly, with no ZIP and no queue.
    await page.getByRole('button', { name: 'Start over' }).click();
    await chooseImages(page, [fixtureFile(same)]);
    await done(page);
    await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', same);
    await expect(page.locator('.fo-filelist')).toHaveCount(0);
    expect(sniff(await downloadBytes(page))).toBe('jpeg');
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
    expect(readZip(await downloadBytes(page))).toHaveLength(9);
  });
});

test.describe('Ctrl+V', () => {
  test('takes every image of the clipboard as one batch and leaves a file that is no image out', async ({ page }) => {
    const photos = await jpegBatch(page, ['p1.jpg', 'p2.jpg']);
    const notes: TestFile = { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') };
    const taken = await pasteFiles(page, [photos[0] as TestFile, notes, photos[1] as TestFile]);
    expect(taken, 'the page took the paste over').toBe(true);
    await done(page);
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(2);
    expect(readZip(await downloadBytes(page)).map((entry) => entry.name)).toEqual(['p1.jpg', 'p2.jpg']);
  });

  test('a paste with no image, or one aimed at the search field, is left alone', async ({ page }) => {
    expect(await pasteFiles(page, []), 'nothing on the clipboard').toBe(false);
    expect(await pasteFiles(page, [{ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }]), 'only a text file').toBe(false);
    await page.keyboard.press('Control+K');
    await expect(page.locator('#fo-search-dialog')).toBeVisible();
    const taken = await pasteFiles(page, await jpegBatch(page, ['p1.jpg']), '#fo-search-dialog input');
    expect(taken, 'a paste in the search input').toBe(false);
    await expect(page.locator('.fo-level, .fo-result')).toHaveCount(0);
  });

  test('a paste aimed at a number field of the page is left alone, and the same paste anywhere else starts a batch', async ({ page }) => {
    await page.goto('/resize-image/');
    await hydrated(page);
    const photos = await jpegBatch(page, ['p1.jpg']);
    await page.locator('#rz-width').focus();
    expect(await pasteFiles(page, photos, '#rz-width'), 'a paste in the width field').toBe(false);
    await expect(page.locator('.fo-level, .fo-result')).toHaveCount(0);
    expect(await pasteFiles(page, photos), 'the same paste on the page').toBe(true);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', 'p1.jpg');
  });
});
