import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { imageSize } from './lib/images.ts';
import { chooseImages, dismissCookies, downloadBytes, generatedJpeg, hydrated, type TestFile } from './lib/page.ts';
import { meanAbsDiff, thumbnail } from './lib/pixels.ts';
import { readZip } from './lib/zip.ts';

// The crop editor with the keyboard alone (criterion 13): the box is a focusable group, the arrows move it, Shift with
// the arrows changes its size, the four number fields mirror it and are the other way to move it, the result follows
// every change, and the queue picks the photo whose box is shown. image-smoke.spec.ts proves the same on big photos and
// with the pointer; this spec is the keyboard path on small ones: the order of the focus stops, that a change from the
// keys or the fields reaches the box on screen and the pixels of the file, that focus survives the new result, Free,
// and picking a photo in the queue with Enter. One load per browser; the steps are named so a failure says where.

/** The photo drawn in the page by generatedJpeg(): a red-green gradient with a little noise, so every region differs. */
const PHOTO = { width: 640, height: 480 };
/** One arrow press moves the box by 1% of the photo along each side, rounded: 6 px across and 5 px down. */
const STEP = { x: 6, y: 5 };
const SECOND = 'gen-jpg-02-orientacao8.jpg'; // shown 1600 × 1200

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BOX = '.fo-crop__box';

async function expectFields(page: Page, region: Partial<Region>): Promise<void> {
  for (const [field, value] of Object.entries(region)) await expect(page.locator(`#cr-${field}`), `field ${field}`).toHaveValue(String(value));
}

/** The box on screen as shares of the picture under it, against the region the fields hold. */
async function expectBoxOnScreen(page: Page, region: Region, photo: { width: number; height: number }): Promise<void> {
  const expected = [region.x / photo.width, region.y / photo.height, region.width / photo.width, region.height / photo.height];
  const list = (shares: number[]) => shares.map((share) => share.toFixed(3)).join(' ');
  await expect
    .poll(async () => {
      const stage = await page.locator('.fo-crop__stage').boundingBox();
      const box = await page.locator(BOX).boundingBox();
      if (!stage || !box) return 'no box on screen';
      const shown = [(box.x - stage.x) / stage.width, (box.y - stage.y) / stage.height, box.width / stage.width, box.height / stage.height];
      // Within 0.6% of the picture: a couple of pixels of border and rounding.
      return shown.every((share, index) => Math.abs(share - (expected[index] ?? 0)) < 0.006) ? 'follows the fields' : `shown ${list(shown)}, wanted ${list(expected)}`;
    }, { message: 'the box on screen follows the fields' })
    .toBe('follows the fields');
}

/** What Download hands out right now, or null while the batch is processed again (the card and its link are gone for a moment). */
async function currentDownload(page: Page): Promise<Uint8Array | null> {
  try {
    return await downloadBytes(page);
  } catch {
    return null;
  }
}

/** The grid of the region of the source the box covers, to compare with the grid of what was downloaded. */
async function regionGrid(page: Page, source: Uint8Array, region: Region, photo: { width: number; height: number }): Promise<number[]> {
  const grid = await thumbnail(page, source, 'image/jpeg', {
    region: [region.x / photo.width, region.y / photo.height, region.width / photo.width, region.height / photo.height],
  });
  return grid.gray;
}

/** The download is the region of the source: its size, and its pixels against the source's (a gradient photo, so a shifted box is far off). */
async function expectResultIs(page: Page, source: Uint8Array, region: Region, photo = PHOTO): Promise<void> {
  const reference = await regionGrid(page, source, region, photo);
  await expect
    .poll(async () => {
      const bytes = await currentDownload(page);
      if (!bytes) return 'not ready';
      return describeCrop(page, bytes, reference);
    }, { timeout: 30_000, message: `the result should be ${region.width}x${region.height} of the box at ${region.x},${region.y}` })
    .toBe(`${region.width}x${region.height} same pixels`);
}

async function describeCrop(page: Page, bytes: Uint8Array, reference: number[]): Promise<string> {
  const size = imageSize(bytes);
  const out = await thumbnail(page, bytes, 'image/jpeg');
  const diff = out.ok ? meanAbsDiff(out.gray, reference) : 255;
  return `${size.displayWidth}x${size.displayHeight} ${diff < 1.5 ? 'same pixels' : `other pixels (off by ${diff.toFixed(1)})`}`;
}

/** Selects what a field holds and types a new number (a Tab into a field selects it already; this does not rely on that). */
async function typeInFocusedField(page: Page, text: string): Promise<void> {
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type(text);
}

test.describe('crop-image with the keyboard only', () => {
  test('focus order, arrows, Shift with the arrows, the fields, Free and the queue', async ({ page }) => {
    await page.goto('/crop-image/');
    await hydrated(page);
    await dismissCookies(page);
    const source = await generatedJpeg(page);
    const wide: TestFile = { name: 'a.jpg', mimeType: 'image/jpeg', buffer: source };
    await chooseImages(page, [wide]);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    let region: Region = { x: 80, y: 0, width: 480, height: 480 };

    await test.step('opens on Square, centred: the fields, the box on screen and the result agree', async () => {
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);
    });

    await test.step('the focus order is the ratio, the box, X, Y, Width, Height and then the chips, and back', async () => {
      const ratio = page.locator('input[name="cr-ratio"]:checked');
      await ratio.focus();
      for (const stop of [BOX, '#cr-x', '#cr-y', '#cr-width', '#cr-height']) {
        await page.keyboard.press('Tab');
        await expect(page.locator(stop), `Tab reaches ${stop}`).toBeFocused();
      }
      // After the last field the focus leaves the editor for the next-step chips. WebKit does not Tab to links (as Safari
      // does not by default), so the claim is only that it moves on, and that Shift+Tab comes back to the field.
      await page.keyboard.press('Tab');
      const left = await page.evaluate(() => {
        const active = document.activeElement;
        return Boolean(active) && active !== document.body && !active?.closest('.fo-crop, .fo-fields, .fo-seg');
      });
      expect(left, 'after the fields the focus leaves the editor').toBe(true);
      for (const stop of ['#cr-height', '#cr-width', '#cr-y', '#cr-x', BOX]) {
        await page.keyboard.press('Shift+Tab');
        await expect(page.locator(stop), `Shift+Tab reaches ${stop}`).toBeFocused();
      }
      await page.keyboard.press('Shift+Tab');
      await expect(ratio).toBeFocused();
      // The corner handles are for the pointer: the box is the one tab stop of the editor, and the handles stay big enough to hit.
      await expect(page.locator('.fo-crop :is(a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]))')).toHaveCount(1);
      const handles = await page.locator('.fo-crop__handle').evaluateAll((nodes) =>
        nodes.map((node) => ({ hidden: node.getAttribute('aria-hidden'), tabIndex: (node as HTMLElement).tabIndex, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
      );
      expect(handles).toHaveLength(4);
      for (const handle of handles) expect(handle).toMatchObject({ hidden: 'true', tabIndex: -1 });
      for (const handle of handles) expect(Math.min(handle.width, handle.height), 'handle target size').toBeGreaterThanOrEqual(44);
    });

    await test.step('arrows move the box: the fields mirror it, it moves on screen, the file follows and the focus stays', async () => {
      await page.keyboard.press('Tab');
      await expect(page.locator(BOX)).toBeFocused();
      for (let press = 0; press < 13; press += 1) await page.keyboard.press('ArrowRight');
      region = { ...region, x: 80 + 13 * STEP.x };
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);
      // The new result does not take the focus away from the box: the next arrow still moves it.
      await expect(page.locator(BOX)).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      region = { ...region, x: region.x - STEP.x };
      await expectFields(page, region);
    });

    await test.step('Shift with the arrows changes the size around the centre and keeps the shape', async () => {
      await page.keyboard.press('Shift+ArrowLeft');
      await page.keyboard.press('Shift+ArrowLeft');
      // Two presses: the width loses 6 px each time and, Square, the height with it; the box shrinks around its centre,
      // so x and y each gain 3 px per press.
      region = { x: region.x + 6, y: region.y + 6, width: region.width - 12, height: region.height - 12 };
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);
      await expect(page.locator(BOX)).toBeFocused();
    });

    await test.step('a number typed in a field moves the box: with Enter, with Tab, and after a pause', async () => {
      await page.keyboard.press('Tab');
      await expect(page.locator('#cr-x')).toBeFocused();
      await typeInFocusedField(page, '20');
      await page.keyboard.press('Enter');
      region = { ...region, x: 20 };
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);

      await page.keyboard.press('Tab');
      await expect(page.locator('#cr-y')).toBeFocused();
      await typeInFocusedField(page, '0');
      await page.keyboard.press('Tab');
      await expect(page.locator('#cr-width'), 'Tab commits the value and moves on').toBeFocused();
      region = { ...region, y: 0 };
      await expectFields(page, region);
      await expectResultIs(page, source, region);

      // No Enter and no Tab: the value is taken when the typing pauses, and Square makes the height follow.
      await typeInFocusedField(page, '300');
      region = { ...region, width: 300, height: 300 };
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);
      await expect(page.locator('#cr-width'), 'typing keeps the focus in the field').toBeFocused();
    });

    await test.step('a number the box cannot take is said in words, the box stays, and a good one clears it', async () => {
      await page.keyboard.press('Tab');
      await expect(page.locator('#cr-height')).toBeFocused();
      await typeInFocusedField(page, '9999');
      await page.keyboard.press('Tab');
      await expect(page.locator('#cr-height')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#cr-height-error')).toBeVisible();
      await expect(page.locator('#cr-height')).toHaveAttribute('aria-describedby', /cr-height-error/);
      // The height field keeps what was typed (so it can be fixed); the box and the other fields stay as they were.
      await expectFields(page, { x: region.x, y: region.y, width: region.width });
      await expect(page.locator('#cr-height')).toHaveValue('9999');
      await expectResultIs(page, source, region);

      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#cr-height')).toBeFocused();
      await typeInFocusedField(page, '200');
      await page.keyboard.press('Enter');
      region = { ...region, width: 200, height: 200 };
      await expectFields(page, region);
      await expect(page.locator('#cr-height-error')).toHaveCount(0);
      await expect(page.locator('#cr-height')).not.toHaveAttribute('aria-invalid', 'true');
      await expectResultIs(page, source, region);
    });

    await test.step('Free by the arrow keys on the ratio keeps the box, and the sides then change on their own', async () => {
      // The arrows walk Square, 4:5, 16:9, Free, and each locked ratio starts the photo over with its centred crop,
      // so Free keeps the 16:9 box: the whole width and 360 px of height, 60 px from the top.
      await page.locator('input[name="cr-ratio"]:checked').focus();
      for (let press = 0; press < 3; press += 1) await page.keyboard.press('ArrowRight');
      await expect(page.locator('input[name="cr-ratio"][value="free"]')).toBeChecked();
      await expect(page.locator('input[name="cr-ratio"][value="free"]'), 'the focus stays on the ratio').toBeFocused();
      region = { x: 0, y: 60, width: 640, height: 360 };
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);
      await page.keyboard.press('Tab');
      await expect(page.locator(BOX)).toBeFocused();
      // Free: Shift with Left takes 6 px off the width alone (the box shrinks around its centre, so x gains 3), and
      // Shift with Up takes 5 px off the height alone (y gains 2.5, which the whole pixel rounds to 3).
      await page.keyboard.press('Shift+ArrowLeft');
      await page.keyboard.press('Shift+ArrowUp');
      region = { x: 3, y: 63, width: 634, height: 355 };
      await expectFields(page, region);
      await expectBoxOnScreen(page, region, PHOTO);
      await expectResultIs(page, source, region);
    });

    await test.step('with two photos the queue picks whose box the editor shows, with Enter, and each box stays its own', async () => {
      // Back to Square, then a new batch of two photos of different sizes.
      await page.locator('input[name="cr-ratio"]:checked').focus();
      for (let press = 0; press < 3; press += 1) await page.keyboard.press('ArrowLeft');
      await expect(page.locator('input[name="cr-ratio"][value="square"]')).toBeChecked();
      const second: TestFile = { name: 'b.jpg', mimeType: 'image/jpeg', buffer: readFileSync(resolve('fixtures/images', SECOND)) };
      await chooseImages(page, [wide, second]);
      await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(2);
      await expect(page.locator('.fo-filelist .fo-bar')).toHaveCount(0);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await expectFields(page, { x: 80, y: 0, width: 480, height: 480 });

      await page.locator(BOX).focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      const adjusted: Region = { x: 80 + 2 * STEP.x, y: 0, width: 480, height: 480 };
      await expectFields(page, adjusted);
      for (const stop of ['#cr-x', '#cr-y', '#cr-width', '#cr-height']) {
        await page.keyboard.press('Tab');
        await expect(page.locator(stop)).toBeFocused();
      }
      await page.keyboard.press('Tab');
      const pickA = page.getByRole('button', { name: 'Show a.jpg' });
      const pickB = page.getByRole('button', { name: 'Show b.jpg' });
      await expect(pickA, 'after the fields come the rows of the queue').toBeFocused();
      await expect(pickA).toHaveAttribute('aria-pressed', 'true');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Download a.jpg' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(pickB).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(pickB).toHaveAttribute('aria-pressed', 'true');
      await expect(pickA).toHaveAttribute('aria-pressed', 'false');
      await expectFields(page, { x: 200, y: 0, width: 1200, height: 1200 });
      await expect(pickB, 'picking keeps the focus on the row').toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(pickA).toBeFocused();
      await page.keyboard.press('Space');
      await expectFields(page, adjusted);
      await expect(pickA).toHaveAttribute('aria-pressed', 'true');

      // The ZIP holds the adjusted crop of a.jpg and the centred crop of b.jpg.
      const reference = await regionGrid(page, source, adjusted, PHOTO);
      await expect
        .poll(async () => {
          const bytes = await currentDownload(page);
          if (!bytes) return 'not ready';
          try {
            const parts: string[] = [];
            for (const entry of readZip(bytes)) {
              const size = imageSize(entry.bytes);
              parts.push(entry.name === 'a.jpg' ? `a.jpg:${await describeCrop(page, entry.bytes, reference)}` : `${entry.name}:${size.displayWidth}x${size.displayHeight}`);
            }
            return parts.join(' | ');
          } catch {
            return 'not ready';
          }
        }, { timeout: 30_000 })
        .toBe('a.jpg:480x480 same pixels | b.jpg:1200x1200');
    });

    await test.step('at 360 px the corner handles stay big and the box stays inside the picture', async () => {
      await page.setViewportSize({ width: 360, height: 740 });
      const handles = await page.locator('.fo-crop__handle').evaluateAll((nodes) => nodes.map((node) => Math.min(node.getBoundingClientRect().width, node.getBoundingClientRect().height)));
      expect(handles.length).toBe(4);
      for (const side of handles) expect(side).toBeGreaterThanOrEqual(44);
      const stage = await page.locator('.fo-crop__stage').boundingBox();
      const box = await page.locator(BOX).boundingBox();
      expect(stage && box).toBeTruthy();
      if (stage && box) {
        expect(box.x).toBeGreaterThanOrEqual(stage.x - 1);
        expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
        expect(stage.width).toBeLessThanOrEqual(360);
      }
    });
  });
});
