import { expect, test, type Page } from '@playwright/test';
import { readZip } from './lib/zip.ts';
import { chooseImages, dataLayer, dismissCookies, downloadBytes, dropFiles, hydrated, jpegBatch, openAdjust, openCompare, slowEngine, type TestFile } from './lib/page.ts';

// The shared island (src/tools/image/ImagePanel.tsx) through the Compress image page: the queue while
// it works, a batch where every file fails, the options, drop, the events and the comparison. What a
// batch gives back (N files and N outputs, the ZIP, names, more than 6 rows, files that cannot be read
// in the middle, Ctrl+V) is in image-batch.spec.ts; what each tool does with each fixture, including a
// HEIC or an AVIF sent to a tool that does not take it, is in image-matrix.spec.ts.

const text = (name: string): TestFile => ({ name, mimeType: 'text/plain', buffer: Buffer.from('hello, this is not an image') });
const junk = (name: string): TestFile => ({ name, mimeType: 'image/jpeg', buffer: Buffer.from(Array.from({ length: 2048 }, (_, i) => (i * 37) % 251)) });

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
  test('the WaterLevel counts the batch ("0%, 0 of 3 images") and the queue shows working and waiting rows', async ({ page }) => {
    const gate = await slowEngine(page);
    // The focus is on "Choose images", as for someone who opened the picker with the keyboard.
    await page.getByRole('button', { name: 'Choose images' }).focus();
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
    // The drop zone went away with the button that had the focus: the focus follows to the WaterLevel instead of
    // falling to the page, and the status region says what is going on from the start of the batch.
    await expect(level).toBeFocused();
    await expect(page.locator('#fo-tool-root').getByRole('status')).toHaveText('Compressing images');
    gate.release();
    await done(page);
    await expect(page.locator('.fo-filelist .fo-file__gain')).toHaveCount(3);
    await expect(page.locator('#fo-tool-root').getByRole('status')).toHaveText(/^Done! Your 3 images are \d+% lighter\.$/);
    // The status region is the one live region of the tool: the card does not say the result a second time
    // (F2 low 6 and review d-03, DECISOES § 102).
    await expect(page.locator('#fo-tool-root [aria-live], #fo-tool-root [role="alert"]:not(:empty)')).toHaveCount(0);
    await expect(page.locator('#fo-tool-root [role="status"]')).toHaveCount(1);
  });

  test('when every file fails the drop zone says so once and the rows say why', async ({ page }) => {
    await chooseImages(page, [junk('x.jpg'), text('y.png')]);
    const zone = page.locator('.fo-drop[data-state="error"]');
    await expect(zone).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('alert')).toContainText("Oops, Oli couldn't read this file");
    await expect(page.getByRole('alert')).toContainText("Oli couldn't read any of these 2 files");
    await expect(page.locator('.fo-file[data-state="error"]')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Choose other files' })).toBeVisible();
    // Removing a row takes it off the list; removing the last returns to the start. With the keyboard, the focus
    // does not fall to the page: with no row left it goes to the button that offers other files.
    await page.getByRole('button', { name: 'Remove x.jpg' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.fo-filelist')).toHaveCount(0);
    await expect(page.getByRole('alert')).toContainText('y.png');
    await expect(page.getByRole('button', { name: 'Choose other files' })).toBeFocused();

    // Eight files that fail: six rows and "Show 2 more". A HEIC called "{tool}.heic" and a name with "$&" show as they are.
    const heic = { name: '{tool}.heic', mimeType: 'image/heic', buffer: Buffer.from([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63, 0, 0, 0, 0]) };
    const names = ['cost$&1.jpg', 'junk-3.jpg', 'junk-4.jpg', 'junk-5.jpg', 'junk-6.jpg', 'junk-7.jpg', 'junk-8.jpg'];
    await chooseImages(page, [heic, ...names.map(junk)]);
    await expect(page.locator('.fo-file[data-state="error"]')).toHaveCount(6);
    const heicRow = page.locator('.fo-file[data-state="error"]').first();
    await expect(heicRow).toContainText('{tool}.heic is a HEIC file. Open it in HEIC to JPG.');
    await expect(heicRow.getByRole('link', { name: 'HEIC to JPG' })).toHaveAttribute('href', '/heic-to-jpg/');
    await expect(page.getByRole('button', { name: 'Remove cost$&1.jpg' })).toBeVisible();
    // "Show 2 more" goes away when it is used: the first new row (the 7th) takes the focus.
    await page.getByRole('button', { name: 'Show 2 more' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Remove junk-7.jpg' })).toBeFocused();
    // A row in the middle is removed: the focus goes to the next row. The last one: to the previous row.
    await page.getByRole('button', { name: 'Remove junk-4.jpg' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Remove junk-5.jpg' })).toBeFocused();
    await page.getByRole('button', { name: 'Remove junk-8.jpg' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Remove junk-7.jpg' })).toBeFocused();
    await expect(page.locator('.fo-file')).toHaveCount(6);
  });

  test('changing the level re-processes the whole batch at once and keeps the focus on the option', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, 3));
    await done(page);
    const before = readZip(await downloadBytes(page)).reduce((sum, entry) => sum + entry.size, 0);
    // What the status region held over time, to see that it is emptied before the new sentence comes: a live
    // region that gets the same text again says nothing.
    await page.evaluate(() => {
      const region = document.querySelector('#fo-tool-root [role="status"]');
      const said: string[] = [];
      (window as unknown as { __said: string[] }).__said = said;
      if (region) new MutationObserver(() => said.push(region.textContent ?? '')).observe(region, { childList: true, characterData: true, subtree: true });
    });
    // F13a (UX-04 A): after the result the level is folded under "Adjust"; it stays the same node while the batch runs again.
    await openAdjust(page);
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
    await expect(page.locator('#fo-tool-root').getByRole('status')).toContainText('Done!');
    const said = await page.evaluate(() => (window as unknown as { __said: string[] }).__said);
    expect(said[0], 'the sentence of the first run is cleared when the re-run starts').toBe('');
    expect(said.at(-1)).toMatch(/^Done! Your 3 images are \d+% lighter\.$/);
  });
});

test.describe('drop', () => {
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
    // The option runs the batch again, and the card stays on screen for the first 400 ms of it: wait for the new
    // ZIP (its size changes with Strong) so the row's Download is not clicked while the row is redrawn (DECISOES § 99).
    const zip = (await page.locator('.fo-btn--download').textContent()) ?? '';
    await openAdjust(page);
    await page.locator('label.fo-seg__opt', { has: page.locator('input[value="strong"]') }).click();
    await expect(page.locator('.fo-btn--download')).not.toHaveText(zip, { timeout: 30_000 });
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
  // F13a (UX-04 A; DECISOES § 467): the comparison opens only when the person asks, behind "Before and after"
  // (aria-expanded, aria-controls); before the click there is no slider and no picture is decoded. Then, as before: named,
  // at 50, moved by the arrow keys.
  test('opens only when asked, is named, starts at 50 and moves with the arrow keys', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, ['one.jpg', 'two.jpg']));
    await done(page);
    const open = page.getByRole('button', { name: 'Before and after', exact: true });
    await expect(open).toHaveAttribute('aria-expanded', 'false');
    await expect(open).toHaveAttribute('aria-controls', 'fo-compare');
    await expect(page.locator('#fo-compare')).toBeHidden();
    await expect(page.locator('.fo-ba')).toHaveCount(0);
    await expect(page.getByRole('slider', { name: 'Compare before and after' })).toHaveCount(0);
    await openCompare(page);
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

  // F13a (UX-04 A): it took the place of "sits inside the card from 768px and under it on the phone, without moving the
  // Download". The comparison lives in the card at every width now (useWide is gone), the one Oli is in the corner of the
  // rectangle, and the pictures that load still never move the Download.
  test('sits inside the card at every width, with the one Oli in the corner, without moving the Download', async ({ page }) => {
    await chooseImages(page, await jpegBatch(page, 1));
    await done(page);
    await openCompare(page);
    const download = page.locator('.fo-btn--download');
    for (const width of [1280, 360]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(page.locator('.fo-ba')).toHaveCount(1);
      await expect(page.locator('.fo-result .fo-ba')).toHaveCount(1);
      await expect(page.locator('#fo-tool-root [data-oli]')).toHaveCount(1);
      await expect(page.locator('.fo-slot > .fo-slot__oli[data-oli="cheer"]')).toHaveCount(1);
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
