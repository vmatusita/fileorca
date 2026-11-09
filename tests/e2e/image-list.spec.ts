import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { takeDownload } from './lib/matrix.ts';
import { dataLayer, dismissCookies, downloadBytes, hydrated, jpegBatch, openAdjust, startOver, type TestFile } from './lib/page.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';
import { recordStatus, saidAfter, saidSoFar, type Said } from './lib/status.ts';
import { holdWorker, imageIslandMessages, spyOnWorkers } from './lib/workers.ts';
import { readZip } from './lib/zip.ts';

// F15 · a lista e o lote (frente L; criteria 1 and 2 of the F15; DECISOES § 651, § 652, § 659 and § 667 to § 670).
//
// Criterion 1: in Image to PDF the list is the order of the pages. Three photos of different sizes, given out of order, are
// put in order by the mouse drag, by the arrows (a click is the touch of a phone) and by the keyboard; the PDF, read in Node
// with PDF.js, has the pages in the order of the list (with "Image size", the page has the size of the photo, so the size of
// each page says which photo it is). After the result, a move or a photo taken out makes only the PDF again: the spy on the
// Worker constructor counts no message to the image worker ("fileorca-image") after the gesture, and at least one to the
// PDF worker ("fileorca-pdf"). The order changed while the photos are prepared, or while the PDF is made, comes out right.
// Each gesture says one sentence (a MutationObserver on every status region of the tool).
//
// Criterion 2: in every image batch of two files or more, a ready row goes out by the bin outside its card, with Undo in its
// place until the next action; the ZIP is made again with the outputs that stay, without encoding anything; from two files
// to one, the list stays while Undo waits and the Download hands out the file that stayed; Crop passes the picked file on;
// with one file, no bin; no new event.

const q = IMAGE_PANEL_TEXTS.en.queue;
const ROT6 = 'gen-jpg-01-orientacao6.jpg'; // stored 1600 × 1200, shown 1200 × 1600 (Orientation 6)
const WEBP = 'gen-webp-exif-gps.webp'; // 1600 × 1200
const PNG = 'gen-png-transparente.png'; // 800 × 600, with transparency
const PAGE_OF: Record<string, string> = { [ROT6]: '1200x1600', [WEBP]: '1600x1200', [PNG]: '800x600' };
/** Given out of order; the order wanted puts the photo that stands first. */
const GIVEN = [WEBP, PNG, ROT6];
const WANTED = [ROT6, WEBP, PNG];
const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
/** The events a batch may send: the gestures of the list send none (DECISOES § 652). */
const BATCH_EVENTS = ['tool_start', 'tool_complete', 'download'];

function fixture(name: string): TestFile {
  return { name, mimeType: MIME[name.split('.').pop() ?? ''] ?? 'application/octet-stream', buffer: readFileSync(resolve('fixtures/images', name)) };
}

const root = (page: Page): Locator => page.locator('#fo-tool-root');
const rows = (page: Page): Locator => root(page).locator('.fo-filelist__row');
const download = (page: Page): Locator => root(page).locator('.fo-btn--download');
const button = (page: Page, name: string): Locator => root(page).getByRole('button', { name, exact: true });
const names = (page: Page): Promise<string[]> => rows(page).locator('.fo-file__name').allTextContents();
const texts = (said: Said[]): string[] => said.map((entry) => `${entry.where}: ${entry.text}`);

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

/** The pages of the PDF the Download holds now, by size, read with PDF.js in Node. */
async function pdfPages(page: Page): Promise<string[]> {
  let bytes: Uint8Array;
  try {
    bytes = await downloadBytes(page);
  } catch {
    return ['the PDF is being made'];
  }
  const read = await readWithPdfjs(bytes);
  return read.pages.map((sheet) => `${Math.round(sheet.shown.width)}x${Math.round(sheet.shown.height)}`);
}

/** The names in the ZIP (or the one file) a press on the Download hands out. */
async function delivered(page: Page): Promise<{ name: string; inside: string[] }> {
  const got = await takeDownload(page);
  return { name: got.name, inside: got.name.endsWith('.zip') ? readZip(got.bytes).map((entry) => entry.name) : [got.name] };
}

/** The event names the page sent so far. */
async function eventNames(page: Page): Promise<string[]> {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => String(entry[1]));
}

/** The box of an element of the list in the page (the focus on Undo may scroll the window), rounded to the half pixel. */
async function boxOf(locator: Locator): Promise<{ y: number; h: number }> {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { y: Math.round((box.top + scrollY) * 2) / 2, h: Math.round(box.height * 2) / 2 };
  });
}

test.beforeEach(async ({ page }) => {
  await spyOnWorkers(page);
});

test.describe('Image to PDF: the order of the list is the order of the pages (criterion 1)', () => {
  test('the mouse drag, the arrows and the keyboard put three photos in order; after the result a move makes only the PDF again', async ({ page }) => {
    test.setTimeout(180_000);
    const moved = (position: number) => fmt(q.moved, { name: ROT6, position, total: 3 });
    const up = button(page, fmt(q.moveEarlier, { name: ROT6 }));
    await open(page, '/image-to-pdf/');

    /** A new batch of the three photos out of order, its PDF in that order, and the count of messages before the gesture. */
    async function load(): Promise<{ image: number; pdf: number }> {
      await page.setInputFiles('input[type="file"]', GIVEN.map(fixture));
      await expect.poll(() => pdfPages(page), { timeout: 60_000 }).toEqual(GIVEN.map((name) => PAGE_OF[name]));
      expect(await names(page)).toEqual(GIVEN);
      await recordStatus(page);
      return imageIslandMessages(page);
    }
    /** The PDF in the order wanted, made again without encoding a photo, and the sentences of the gesture, once each. */
    async function inOrder(before: { image: number; pdf: number }, sentences: string[], how: string): Promise<void> {
      await expect.poll(() => pdfPages(page), { message: `${how}: the PDF in the order of the list`, timeout: 30_000 }).toEqual(WANTED.map((name) => PAGE_OF[name]));
      expect(await names(page)).toEqual(WANTED);
      expect(texts(await saidAfter(page, sentences.at(-1) ?? '')), `${how}: one sentence per move, no "Done!" after it`).toEqual(sentences.map((text) => `region: ${text}`));
      const after = await imageIslandMessages(page);
      expect(after.image - before.image, `${how}: messages to the image worker after the gesture`).toBe(0);
      expect(after.pdf - before.pdf, `${how}: messages to the PDF worker after the gesture`).toBeGreaterThan(0);
    }

    // 1. The mouse: the last row dragged onto the first.
    let before = await load();
    await rows(page).nth(2).dragTo(rows(page).nth(0));
    await inOrder(before, [moved(1)], 'drag');

    // 2. The arrows: "Move gen-jpg-01-orientacao6.jpg up" twice (a tap on a phone is the same click).
    await startOver(page);
    before = await load();
    await up.click();
    await expect(rows(page).nth(1).locator('.fo-file__name')).toHaveText(ROT6);
    await up.click();
    await expect(rows(page).nth(0).locator('.fo-file__name')).toHaveText(ROT6);
    await inOrder(before, [moved(2), moved(1)], 'arrows');

    // 3. The keyboard: Enter on "up" twice, the focus following the row on the same arrow, then on "down" when the row
    // reaches the top and "up" gives its place to the empty one (the WebKit gives no focus on a click: focus() first).
    await startOver(page);
    before = await load();
    await up.focus();
    await page.keyboard.press('Enter');
    await expect(rows(page).nth(1).locator('.fo-file__name')).toHaveText(ROT6);
    await expect(up, 'the focus follows the row on the same arrow').toBeFocused();
    await page.keyboard.press('Enter');
    await expect(rows(page).nth(0).locator('.fo-file__name')).toHaveText(ROT6);
    await expect(button(page, fmt(q.moveLater, { name: ROT6 })), 'at the top, the focus goes to the other arrow').toBeFocused();
    await expect(rows(page).nth(0).locator('.fo-filelist__move--up')).toHaveCount(0);
    await inOrder(before, [moved(2), moved(1)], 'keyboard');
  });

  test('a tap on the arrows of a phone puts the photos in order, and the Download never hands out the PDF of before', async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: false, serviceWorkers: 'block' });
    const page = await context.newPage();
    await spyOnWorkers(page);
    await open(page, '/image-to-pdf/');
    await page.setInputFiles('input[type="file"]', GIVEN.map(fixture));
    await expect.poll(() => pdfPages(page), { timeout: 60_000 }).toEqual(GIVEN.map((name) => PAGE_OF[name]));
    const up = button(page, fmt(q.moveEarlier, { name: ROT6 }));
    await up.tap();
    await expect(rows(page).nth(1).locator('.fo-file__name')).toHaveText(ROT6);
    await expect.poll(() => pdfPages(page), { timeout: 30_000 }).toEqual([WEBP, ROT6, PNG].map((name) => PAGE_OF[name]));
    // The second tap and, in the same task of the page, a press on the Download: it says it is busy, and what it hands out
    // is the PDF of the new order, never the one on screen before the tap.
    const pending = page.waitForEvent('download');
    const busy = await page.evaluate(async (label) => {
      const arrow = [...document.querySelectorAll<HTMLButtonElement>('#fo-tool-root .fo-filelist__move')].find((control) => control.getAttribute('aria-label') === label);
      arrow?.click();
      await Promise.resolve();
      const link = document.querySelector<HTMLAnchorElement>('#fo-tool-root .fo-btn--download');
      const state = link?.getAttribute('aria-busy') ?? null;
      link?.click();
      return state;
    }, fmt(q.moveEarlier, { name: ROT6 }));
    expect(busy, 'the Download says it is busy while the PDF is made again').toBe('true');
    const read = await readWithPdfjs(new Uint8Array(readFileSync(await (await pending).path())));
    expect(read.pages.map((sheet) => `${Math.round(sheet.shown.width)}x${Math.round(sheet.shown.height)}`), 'the PDF handed out').toEqual(WANTED.map((name) => PAGE_OF[name]));
    await expect(download(page)).not.toHaveAttribute('aria-busy', 'true');
    await context.close();
  });

  test('the order changed while the photos are prepared comes out right', async ({ page }) => {
    test.setTimeout(120_000);
    const engine = await holdWorker(page, 'image');
    await open(page, '/image-to-pdf/');
    await page.setInputFiles('input[type="file"]', GIVEN.map(fixture));
    await expect(rows(page)).toHaveCount(3);
    await expect(root(page).locator('.fo-filelist__remove'), 'no photo is ready yet').toHaveCount(0);
    const up = button(page, fmt(q.moveEarlier, { name: ROT6 }));
    await up.click();
    await expect(rows(page).nth(1).locator('.fo-file__name')).toHaveText(ROT6);
    await up.click();
    await expect(rows(page).nth(0).locator('.fo-file__name')).toHaveText(ROT6);
    engine.release();
    await expect.poll(() => pdfPages(page), { timeout: 60_000 }).toEqual(WANTED.map((name) => PAGE_OF[name]));
  });

  test('the order changed while the PDF is made comes out right: the PDF is made again in the new order', async ({ page }) => {
    test.setTimeout(120_000);
    const sheets = await holdWorker(page, 'pdf');
    await open(page, '/image-to-pdf/');
    await page.setInputFiles('input[type="file"]', GIVEN.map(fixture));
    // Every photo is ready (each row has its bin) and the PDF waits for its worker.
    await expect(root(page).locator('.fo-filelist__remove')).toHaveCount(3, { timeout: 60_000 });
    const up = button(page, fmt(q.moveEarlier, { name: ROT6 }));
    await up.click();
    await expect(rows(page).nth(1).locator('.fo-file__name')).toHaveText(ROT6);
    await up.click();
    await expect(rows(page).nth(0).locator('.fo-file__name')).toHaveText(ROT6);
    sheets.release();
    await expect.poll(() => pdfPages(page), { timeout: 60_000 }).toEqual(WANTED.map((name) => PAGE_OF[name]));
  });

  test('moving the 6th row down opens the whole list, and the focus follows the row', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, '/image-to-pdf/');
    await page.setInputFiles('input[type="file"]', await jpegBatch(page, 7));
    await expect(download(page)).toBeVisible({ timeout: 60_000 });
    await expect(rows(page)).toHaveCount(6);
    await expect(root(page).locator('.fo-queue__more')).toHaveText('Show 1 more');
    await recordStatus(page);
    const down = button(page, fmt(q.moveLater, { name: 'photo-6.jpg' }));
    await down.focus();
    await page.keyboard.press('Enter');
    await expect(rows(page)).toHaveCount(7);
    await expect(root(page).locator('.fo-queue__more')).toHaveCount(0);
    expect(await names(page)).toEqual(['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg', 'photo-4.jpg', 'photo-5.jpg', 'photo-7.jpg', 'photo-6.jpg']);
    await expect(button(page, fmt(q.moveEarlier, { name: 'photo-6.jpg' })), 'the row reached the end: the other arrow').toBeFocused();
    const sentence = fmt(q.moved, { name: 'photo-6.jpg', position: 7, total: 7 });
    expect(texts(await saidAfter(page, sentence))).toEqual([`region: ${sentence}`]);
  });

  test('a photo taken out after the result makes only the PDF again, and Undo puts it back in its place', async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, '/image-to-pdf/');
    await page.setInputFiles('input[type="file"]', GIVEN.map(fixture));
    await expect.poll(() => pdfPages(page), { timeout: 60_000 }).toEqual(GIVEN.map((name) => PAGE_OF[name]));
    await recordStatus(page);
    const before = await imageIslandMessages(page);
    const row = await boxOf(rows(page).nth(1));
    const out = fmt(q.out, { name: PNG });

    await button(page, fmt(q.remove, { name: PNG })).click();
    const line = root(page).locator('.fo-filelist > .fo-filelist__undo');
    await expect(line).toHaveCount(1);
    await expect(root(page).locator('.fo-filelist > *').nth(1), 'the line in the place of the row').toHaveClass(/fo-filelist__undo/);
    expect(await boxOf(line), 'the line has the place and the height of the row').toEqual(row);
    await expect(line.getByRole('button', { name: q.undo })).toBeFocused();
    expect(texts(await saidAfter(page, out)), 'the line says it; the region of the island says nothing').toEqual([`line: ${out}`]);
    await expect.poll(() => pdfPages(page), { timeout: 30_000 }).toEqual([WEBP, ROT6].map((name) => PAGE_OF[name]));
    let after = await imageIslandMessages(page);
    expect(after.image - before.image, 'messages to the image worker after the bin').toBe(0);
    expect(after.pdf - before.pdf, 'messages to the PDF worker after the bin').toBeGreaterThan(0);
    // Waiting has no timer (WCAG 2.2.1).
    await page.waitForTimeout(1500);
    await expect(line).toHaveCount(1);

    await page.keyboard.press('Enter');
    await expect(line).toHaveCount(0);
    expect(await names(page)).toEqual(GIVEN);
    await expect(button(page, fmt(q.remove, { name: PNG })), 'the focus on the bin of the row that came back').toBeFocused();
    await expect.poll(() => pdfPages(page), { timeout: 30_000 }).toEqual(GIVEN.map((name) => PAGE_OF[name]));
    after = await imageIslandMessages(page);
    expect(after.image - before.image, 'messages to the image worker after Undo').toBe(0);
    expect((await saidSoFar(page)).filter((said) => said.where === 'region'), 'no "Done!" after the PDF made again').toEqual([]);
  });

  test('from two photos to one: the list stays while Undo waits, the PDF has one page, and the next action brings the card of one file', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, '/image-to-pdf/');
    await page.setInputFiles('input[type="file"]', [ROT6, PNG].map(fixture));
    await expect.poll(() => pdfPages(page), { timeout: 60_000 }).toEqual([ROT6, PNG].map((name) => PAGE_OF[name]));
    await button(page, fmt(q.remove, { name: PNG })).click();
    await expect(rows(page)).toHaveCount(1);
    await expect(root(page).locator('.fo-filelist__undo')).toHaveCount(1);
    await expect(rows(page).locator('.fo-filelist__remove, .fo-filelist__move'), 'the last row that remains has no bin and no arrow').toHaveCount(0);
    await expect.poll(() => pdfPages(page), { timeout: 30_000 }).toEqual([PAGE_OF[ROT6]]);
    await expect(download(page)).toHaveAttribute('download', 'gen-jpg-01-orientacao6.pdf');
    await openAdjust(page);
    await root(page).locator('label.fo-seg__opt:has(input[name="pd-size"][value="a4"])').click();
    await expect(root(page).locator('.fo-filelist')).toHaveCount(0);
    await expect.poll(() => pdfPages(page), { timeout: 30_000 }).toEqual(['595x842']);
  });
});

test.describe('a ready file goes out of any batch, with Undo (criterion 2)', () => {
  for (const path of ['/compress-image/', '/resize-image/']) {
    test(`${path}: the bin on every ready row, the ZIP made again with two files and no photo encoded, and Undo`, async ({ page }) => {
      test.setTimeout(150_000);
      await open(page, path);
      await page.setInputFiles('input[type="file"]', await jpegBatch(page, 3));
      await expect(download(page)).toBeVisible({ timeout: 60_000 });
      await expect(root(page).locator('.fo-filelist__remove'), 'a bin on every ready row').toHaveCount(3);
      expect(await delivered(page)).toEqual({ name: 'fileorca-images.zip', inside: ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg'] });
      const label = await download(page).textContent();
      await recordStatus(page);
      const before = await imageIslandMessages(page);
      const row = await boxOf(rows(page).nth(1));
      const out = fmt(q.out, { name: 'photo-2.jpg' });

      await button(page, fmt(q.remove, { name: 'photo-2.jpg' })).click();
      const line = root(page).locator('.fo-filelist > .fo-filelist__undo');
      await expect(line.getByRole('button', { name: q.undo })).toBeFocused();
      expect(await boxOf(line), 'the line has the place and the height of the row').toEqual(row);
      expect(texts(await saidAfter(page, out))).toEqual([`line: ${out}`]);
      expect(await delivered(page), 'the ZIP with the two files that stay').toEqual({ name: 'fileorca-images.zip', inside: ['photo-1.jpg', 'photo-3.jpg'] });
      await expect(download(page), 'the Download says the new size').not.toHaveText(label ?? '');
      let after = await imageIslandMessages(page);
      expect(after.image - before.image, 'messages to the image worker after the bin').toBe(0);

      // The Download is no action that changes the batch: the Undo waits. Undo: the row in its place, the focus on its
      // bin, the ZIP of three again.
      await expect(line).toHaveCount(1);
      await line.getByRole('button', { name: q.undo }).focus();
      await page.keyboard.press('Enter');
      expect(await names(page)).toEqual(['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg']);
      await expect(button(page, fmt(q.remove, { name: 'photo-2.jpg' }))).toBeFocused();
      expect(await delivered(page)).toEqual({ name: 'fileorca-images.zip', inside: ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg'] });
      after = await imageIslandMessages(page);
      expect(after.image - before.image, 'messages to the image worker after Undo').toBe(0);
      expect((await saidSoFar(page)).filter((said) => said.where === 'region'), 'the region of the island said nothing').toEqual([]);

      // The next action ends the Undo: another bin (the line of the first goes, the second has its own), then an option.
      await button(page, fmt(q.remove, { name: 'photo-2.jpg' })).click();
      await expect(line).toHaveCount(1);
      await button(page, fmt(q.remove, { name: 'photo-3.jpg' })).click();
      await expect(line).toHaveCount(1);
      await expect(line.getByRole('status')).toHaveText(fmt(q.out, { name: 'photo-3.jpg' }));
      expect(await names(page)).toEqual(['photo-1.jpg']);
      await expect(line.getByRole('button', { name: q.undo })).toBeFocused();
      if (path === '/compress-image/') {
        await openAdjust(page);
        await root(page).locator('label.fo-seg__opt:has(input[name="ci-level"][value="strong"])').click();
      } else {
        await startOver(page);
      }
      await expect(line).toHaveCount(0);
      expect((await eventNames(page)).filter((name) => !BATCH_EVENTS.includes(name)), 'no new event').toEqual([]);
    });
  }

  test('from two files to one: the list stays while Undo waits, the Download hands out the file that stayed, and the next action brings the card of one file', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, '/compress-image/');
    await page.setInputFiles('input[type="file"]', await jpegBatch(page, 2));
    await expect(download(page)).toBeVisible({ timeout: 60_000 });
    await button(page, fmt(q.remove, { name: 'photo-1.jpg' })).click();
    await expect(rows(page)).toHaveCount(1);
    await expect(root(page).locator('.fo-filelist__undo')).toHaveCount(1);
    await expect(rows(page).locator('.fo-filelist__remove'), 'the last row that remains has no bin').toHaveCount(0);
    expect(await delivered(page), 'one file is never a ZIP').toEqual({ name: 'photo-2.jpg', inside: ['photo-2.jpg'] });
    await openAdjust(page);
    await root(page).locator('label.fo-seg__opt:has(input[name="ci-level"][value="strong"])').click();
    await expect(root(page).locator('.fo-filelist')).toHaveCount(0);
    await expect(download(page)).toBeVisible();
  });

  test('Crop: the picked file that goes out passes the pick to the next row, or to the one before when it was the last', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, '/crop-image/');
    await page.setInputFiles('input[type="file"]', await jpegBatch(page, 3));
    await expect(download(page)).toBeVisible({ timeout: 60_000 });
    const pick = (name: string) => button(page, fmt(q.select, { name }));
    await pick('photo-2.jpg').click();
    await expect(pick('photo-2.jpg')).toHaveAttribute('aria-pressed', 'true');
    await button(page, fmt(q.remove, { name: 'photo-2.jpg' })).click();
    await expect(pick('photo-3.jpg')).toHaveAttribute('aria-pressed', 'true');
    await expect(root(page).locator('.fo-filelist__undo'), 'the crop box of the next file does not end the Undo').toHaveCount(1);
    await button(page, fmt(q.remove, { name: 'photo-3.jpg' })).click();
    await expect(pick('photo-1.jpg')).toHaveAttribute('aria-pressed', 'true');
  });

  test('one file has no list and no bin; a refused row keeps the bin of its card, and the only file that can come out has none', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, '/compress-image/');
    await page.setInputFiles('input[type="file"]', await jpegBatch(page, 1));
    await expect(download(page)).toBeVisible({ timeout: 60_000 });
    await expect(root(page).locator('.fo-filelist')).toHaveCount(0);
    await expect(root(page).locator('.fo-filelist__remove')).toHaveCount(0);
    await startOver(page);
    const [photo] = await jpegBatch(page, 1);
    await page.setInputFiles('input[type="file"]', [photo as TestFile, { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') }]);
    await expect(download(page)).toBeVisible({ timeout: 60_000 });
    const refused = rows(page).filter({ hasText: 'notes.txt' });
    await expect(refused).toHaveAttribute('data-state', 'error');
    await expect(refused.locator('.fo-file').getByRole('button', { name: fmt(q.remove, { name: 'notes.txt' }) }), 'the bin of the refused card').toHaveCount(1);
    await expect(refused.locator(':scope > .fo-filelist__remove, :scope > .fo-filelist__none')).toHaveCount(0);
    await expect(root(page).locator('.fo-filelist__remove'), 'the only file that can come out keeps its place, with no bin').toHaveCount(0);
  });
});
