import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import { animationsDone, chooseImages, coffeeLineInOneUse, dismissCookies, hydrated, jpegBatch, searchWithoutResult, slowEngine, useImage, type TestFile } from './lib/page.ts';

// axe-core (WCAG 2.2 AA and best practices) on every page, at 360 and 1280px. It runs with reduced
// motion (DECISOES § 57): the site animates only transform and opacity, so the colours axe checks are
// the same, the page is still, and the run fits the 15 minutes of pnpm verificar on the CI runner.
// The motion itself is tested in design.spec.ts.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const PAGES = ROUTES.flatMap((route) => languagesOf(route).map((lang) => route.paths[lang] ?? '/'));

// F1b: the states of the tool page and of the search dialog that the page-by-page pass does not
// reach. They run in both themes at 360 and 1280px. The finite animations (the cheer jump, fades)
// are let finish first so axe reads the final colors.
async function violations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map((violation) => violation.id);
}

async function resultOnScreen(page: Page): Promise<void> {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await useImage(page);
  await animationsDone(page);
}

// F2: 'compress' finds Compress image and its two presets (3 options); 'heif' finds HEIC to JPG alone, so the
// dialog is read with one result, as before.
async function searchDialogOpen(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Search tools/ }).click();
  await expect(page.locator('#fo-search-dialog')).toBeVisible();
  await page.keyboard.type('compress');
  await expect(page.getByRole('option')).toHaveCount(3);
  await page.keyboard.press('Control+A');
  await page.keyboard.type('heif');
  await expect(page.getByRole('option')).toHaveCount(1);
  await animationsDone(page);
}

// Nothing typed: the 13 pages are listed and the list scrolls inside the box.
async function searchDialogListed(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Search tools/ }).click();
  await expect(page.locator('#fo-search-dialog')).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(13);
  await animationsDone(page);
}

async function coffeeLineOnScreen(page: Page): Promise<void> {
  await page.goto('/compress-image/');
  await hydrated(page);
  await coffeeLineInOneUse(page);
  await animationsDone(page);
}

async function searchWithoutResultOnScreen(page: Page): Promise<void> {
  await page.goto('/');
  await searchWithoutResult(page);
  await expect(page.locator('#fo-search-dialog .fo-search__peek')).toBeVisible();
  await animationsDone(page);
}

// F2 (DECISOES § 76): each page loads once per browser and axe runs at both widths and in both themes
// on that load. The site has no layout or theme decided by script at load, so resizing and switching
// prefers-color-scheme in place gives the same page a fresh load would, with the same rules and reach.
const COMBOS = [
  { width: 360, height: 740, colorScheme: 'dark' },
  { width: 360, height: 740, colorScheme: 'light' },
  { width: 1280, height: 800, colorScheme: 'dark' },
  { width: 1280, height: 800, colorScheme: 'light' },
] as const;

test.describe('axe em toda página, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of PAGES) {
    test(`${path}`, async ({ page }) => {
      const found: string[] = [];
      for (const [index, combo] of COMBOS.entries()) {
        await page.setViewportSize({ width: combo.width, height: combo.height });
        await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
        if (index === 0) await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        for (const violation of results.violations) {
          found.push(`${combo.width}px ${combo.colorScheme} · ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
        }
      }
      expect(found).toEqual([]);
    });
  }
});

for (const width of [360, 1280]) {
  test.describe(`axe a ${width}px, tema escuro`, () => {
    test.use({ viewport: { width, height: width === 360 ? 740 : 800 }, colorScheme: 'dark', reducedMotion: 'reduce' });

    test('tool page with the result on screen', async ({ page }) => {
      await resultOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search dialog open', async ({ page }) => {
      await searchDialogOpen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search dialog open with every page listed', async ({ page }) => {
      await searchDialogListed(page);
      expect(await violations(page)).toEqual([]);
    });

    test('tool page with the coffee line on screen', async ({ page }) => {
      await coffeeLineOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search without a result (peek visible)', async ({ page }) => {
      await searchWithoutResultOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });
  });

  test.describe(`axe a ${width}px`, () => {
    test.use({ viewport: { width, height: width === 360 ? 740 : 800 }, reducedMotion: 'reduce' });

    test('tool page with the result on screen', async ({ page }) => {
      await page.goto('/compress-image/');
      await hydrated(page);
      await dismissCookies(page);
      await page.setInputFiles('input[type="file"]', 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg');
      await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    test('search dialog open', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Search tools/ }).click();
      await expect(page.locator('#fo-search-dialog')).toBeVisible();
      await page.keyboard.type('heif');
      await expect(page.getByRole('option')).toHaveCount(1);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    test('search dialog open with every page listed', async ({ page }) => {
      await searchDialogListed(page);
      expect(await violations(page)).toEqual([]);
    });

    test('tool page with the coffee line on screen', async ({ page }) => {
      await coffeeLineOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search without a result (peek visible)', async ({ page }) => {
      await searchWithoutResultOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });
  });
}

// F2: a batch on the tool page. One load per browser, then both widths and both themes in place (the
// comparison moves into the card and out of it as the width crosses 768px). Eight files with a bad one
// among them: six rows and "Show 2 more", an error row, the batch card, the comparison and the chips.
test.describe('axe com um lote na tela, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the queue with ready and error rows, the batch card and the comparison', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    const photos = await jpegBatch(page, 7);
    await chooseImages(page, [...photos.slice(0, 3), { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }, ...photos.slice(3)]);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Show 2 more' })).toBeVisible();
    await expect(page.locator('.fo-file[data-state="error"]')).toHaveCount(1);
    await expect(page.locator('.fo-ba')).toHaveCount(1);
    await animationsDone(page);
    const found: string[] = [];
    for (const combo of COMBOS) {
      await page.setViewportSize({ width: combo.width, height: combo.height });
      await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const violation of results.violations) {
        found.push(`${combo.width}px ${combo.colorScheme} · ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
      }
    }
    expect(found).toEqual([]);
  });

  test('the WaterLevel with the batch count, a working row and waiting rows', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    const gate = await slowEngine(page);
    await chooseImages(page, await jpegBatch(page, 3));
    await expect(page.locator('.fo-level')).toBeVisible();
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(3);
    const found: string[] = [];
    for (const combo of COMBOS) {
      await page.setViewportSize({ width: combo.width, height: combo.height });
      await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const violation of results.violations) {
        found.push(`${combo.width}px ${combo.colorScheme} · ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
      }
    }
    gate.release();
    expect(found).toEqual([]);
  });
});

// F2 (criterion 13): where axe reads each state of the image tools, in both themes at 360 and 1280px, on one load
// per browser. The queue with ready and error rows, the batch card, the comparison and the WaterLevel with waiting
// rows are the two tests above; the crop editor with a batch, the Resize fields (one of them in error), and the
// options of Image to PDF, Rotate and Convert to WebP are in image-smoke.spec.ts ("axe on the option states"); the
// refused file with the link to its converter, in the drop zone and in a row, is below.
async function violationsEverywhere(page: Page): Promise<string[]> {
  const found: string[] = [];
  for (const combo of COMBOS) {
    await page.setViewportSize({ width: combo.width, height: combo.height });
    await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const violation of results.violations) {
      found.push(`${combo.width}px ${combo.colorScheme} · ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
    }
  }
  return found;
}

test.describe('axe com arquivo recusado, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a HEIC refused by Compress image, in the drop zone and in a row, with the link to HEIC to JPG', async ({ page }) => {
    const heic: TestFile = {
      name: 'heic-08.heic',
      mimeType: 'image/heic',
      buffer: readFileSync(resolve('fixtures/images/heic-08-iphone13pro-paisagem-hdr-ios17.heic')),
    };
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    // Every file refused: the error takes the drop zone, with the Oli line, the file and the link.
    await chooseImages(page, [heic]);
    await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible();
    await expect(page.locator('.fo-drop__message a')).toHaveAttribute('href', '/heic-to-jpg/');
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'drop zone error').toEqual([]);
    // One refused among good ones: the error is the row, the result is for the rest.
    await chooseImages(page, [...(await jpegBatch(page, 2)), heic]);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-file[data-state="error"] a')).toHaveAttribute('href', '/heic-to-jpg/');
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'error row').toEqual([]);
  });
});
