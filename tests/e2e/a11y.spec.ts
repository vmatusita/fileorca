import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { CALC_PAGE_IDS, GUIDE_IDS } from '../../src/tools/calc/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { describedViolations } from './lib/axe.ts';
import { animationsDone, chooseImages, coffeeLineInOneUse, dismissCookies, hydrated, jpegBatch, searchWithoutResult, slowEngine, useImage, type TestFile } from './lib/page.ts';
import { PDF_WALKS, walkPdfTool, type PdfState } from './lib/pdf-states.ts';

// axe-core (WCAG 2.2 AA and best practices, tests/e2e/lib/axe.ts) on every page, at 360 and 1280px, in both
// themes. It runs with reduced motion (DECISOES § 57): the site animates only transform and opacity, so the
// colours axe checks are the same, the page is still, and the run fits the 15 minutes of pnpm verificar on the
// CI runner. The motion itself is tested in design.spec.ts.
const PAGES = ROUTES.flatMap((route) => languagesOf(route).map((lang) => route.paths[lang] ?? '/'));

// F2 (DECISOES § 76 and § 83): each page and each state is reached once per browser, and axe runs at both widths
// and in both themes on it. The site has no layout or theme decided by script at load, so resizing and switching
// prefers-color-scheme in place gives what a fresh load gives, with the same rules and reach.
const COMBOS = [
  { width: 360, height: 740, colorScheme: 'dark' },
  { width: 360, height: 740, colorScheme: 'light' },
  { width: 1280, height: 800, colorScheme: 'dark' },
  { width: 1280, height: 800, colorScheme: 'light' },
] as const;

async function violationsEverywhere(page: Page): Promise<string[]> {
  const found: string[] = [];
  for (const combo of COMBOS) {
    await page.setViewportSize({ width: combo.width, height: combo.height });
    await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
    found.push(...(await describedViolations(page, `${combo.width}px ${combo.colorScheme}`)));
  }
  return found;
}

test.describe('axe em toda página, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 360, height: 740 }, colorScheme: 'dark' });

  for (const path of PAGES) {
    test(`${path}`, async ({ page }) => {
      // The nearest 404 would also be axe-clean: the page must be there (serve-dist answers 404 for a missing route).
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      expect(await violationsEverywhere(page)).toEqual([]);
    });
  }
});

// F1b: the states of the tool page and of the search dialog that the page-by-page pass does not reach. The finite
// animations (the cheer jump, fades) are let finish first so axe reads the final colors.
async function resultOnScreen(page: Page): Promise<void> {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await useImage(page);
  await animationsDone(page);
}

// F2: 'compress' finds Compress image and its two presets (F5a: and Compress PDF, 4 options); 'heif' finds HEIC to JPG
// alone, so the dialog is read with one result, as before.
async function searchDialogOpen(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Search tools/ }).click();
  await expect(page.locator('#fo-search-dialog')).toBeVisible();
  await page.keyboard.type('compress');
  await expect(page.getByRole('option')).toHaveCount(4);
  await page.keyboard.press('Control+A');
  await page.keyboard.type('heif');
  await expect(page.getByRole('option')).toHaveCount(1);
  await animationsDone(page);
}

// Nothing typed: every tool and preset page is listed and the list scrolls inside the box. F4: the English search
// also lists the calculators, their presets and the guides (DECISOES § 125), read from their registry; F5a: and the PDF tools.
async function searchDialogListed(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Search tools/ }).click();
  await expect(page.locator('#fo-search-dialog')).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length + PDF_TOOL_IDS.length + CALC_PAGE_IDS.length + GUIDE_IDS.length);
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

// Before the F2 each of these ran four times (two widths, two themes, one load each), and the result state also
// ran with the 8 MP photo; the photo's comparison and batch card are read in the batch test below.
test.describe('axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tool page with the result on screen', async ({ page }) => {
    await resultOnScreen(page);
    expect(await violationsEverywhere(page)).toEqual([]);
  });

  test('search dialog open', async ({ page }) => {
    await searchDialogOpen(page);
    expect(await violationsEverywhere(page)).toEqual([]);
  });

  test('search dialog open with every page listed', async ({ page }) => {
    await searchDialogListed(page);
    expect(await violationsEverywhere(page)).toEqual([]);
  });

  test('tool page with the coffee line on screen', async ({ page }) => {
    await coffeeLineOnScreen(page);
    expect(await violationsEverywhere(page)).toEqual([]);
  });

  test('search without a result (peek visible)', async ({ page }) => {
    await searchWithoutResultOnScreen(page);
    expect(await violationsEverywhere(page)).toEqual([]);
  });
});

// F2: a batch on the tool page (the comparison moves into the card and out of it as the width crosses 768px).
// Eight files with a bad one among them: six rows and "Show 2 more", an error row, the batch card, the comparison
// and the chips.
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
    expect(await violationsEverywhere(page)).toEqual([]);
  });

  test('the WaterLevel with the batch count, a working row and waiting rows', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    const gate = await slowEngine(page);
    await chooseImages(page, await jpegBatch(page, 3));
    await expect(page.locator('.fo-level')).toBeVisible();
    await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(3);
    const found = await violationsEverywhere(page);
    gate.release();
    expect(found).toEqual([]);
  });
});

// F2 (criterion 13): where axe reads each state of the image tools, in both themes at 360 and 1280px, on one load
// per browser. The queue with ready and error rows, the batch card, the comparison and the WaterLevel with waiting
// rows are the two tests above; the crop editor with a batch, the Resize fields (one of them in error), and the
// options of Image to PDF and Rotate are in image-smoke.spec.ts ("axe on the option states"); the refused file with
// the link to its converter, in the drop zone and in a row, is below.
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

// F4: the states of a calculator the page-by-page pass does not reach (the scenarios and the debt lists are on the
// page at load, so that pass reads them): a field in error with the last result and the Oli's first cheer, the
// schedule open with a second year open, and Copy link turned into "Link copied".
test.describe('axe nos estados da calculadora, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a field in error, the cheer, the open schedule and Link copied', async ({ page }) => {
    await page.addInitScript(() => {
      const clipboard = navigator.clipboard;
      if (clipboard) clipboard.writeText = async () => undefined;
    });
    await page.goto('/mortgage-calculator/');
    await hydrated(page);
    await dismissCookies(page);
    await page.locator('#fo-calc-p').fill('400000');
    await expect(page.locator('.fo-rhero__oli')).toHaveCount(1);
    await page.locator('#fo-calc-r').fill('99');
    await expect(page.locator('#fo-calc-r-error')).toBeVisible();
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'field in error and the cheer').toEqual([]);
    await page.locator('#fo-calc-r').fill('6.5');
    await page.getByRole('button', { name: 'Show the full schedule' }).click();
    await page.locator('#fo-calc-schedule tr.fo-amort__year').nth(1).getByRole('button').click();
    await expect(page.locator('#fo-calc-schedule tbody tr:not(.fo-amort__year)')).toHaveCount(24);
    await page.locator('.fo-export .fo-btn').nth(2).click();
    await expect(page.locator('.fo-export-wrap [role="status"]')).toHaveText('Link copied');
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'schedule open and Link copied').toEqual([]);
  });
});

// F5a (prompt decision 12; DECISOES § 170): the states of the PDF pages the page-by-page pass does not reach
// (it reads each page as loaded, with the cookie notice open and before anything is chosen). Each PDF page is reached once
// per browser (§ 76) and walked through its states by tests/e2e/lib/pdf-states.ts: at rest with the island hydrated, the
// Merge list, the page grid with a selection (a page turned, moved or picked), the password field with its error (Protect:
// the two passwords do not match; Unlock: the password is wrong), the signature area in its three ways to sign (draw, upload,
// type, with the box on the preview of the page) and the result. axe runs at both widths and in both themes on each of them.
const PDF_AXE_STATES: ReadonlySet<PdfState> = new Set<PdfState>(['rest', 'list', 'grid', 'password', 'signature', 'result']);

test.describe('axe nos estados das ferramentas de PDF, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const { id, path } of PDF_WALKS) {
    test(`${path}: at rest, with its options and with the result`, async ({ page }) => {
      const found: string[] = [];
      await walkPdfTool(
        page,
        id,
        async (state, note) => {
          if (!PDF_AXE_STATES.has(state)) return;
          for (const violation of await violationsEverywhere(page)) found.push(`${state} (${note}): ${violation}`);
        },
        { hold: false },
      );
      expect(found).toEqual([]);
    });
  }
});
