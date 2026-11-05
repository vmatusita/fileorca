import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { QR_ID, ROUTES, languagesOf, routeById } from '../../src/i18n/routes.ts';
import { longDate } from '../../src/i18n/dates.ts';
import ptSupport from '../../src/i18n/pt/support.ts';
import ptCalcShared from '../../src/tools/calc/i18n/pt.ts';
import esCalcShared from '../../src/tools/calc/i18n/es.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS, type ImagePageId } from '../../src/tools/image/registry.ts';
import { CALC_PAGE_IDS, GUIDE_IDS, LIFE_CALC_IDS, LIFE_CALC_PAGES, type LifeCalcId } from '../../src/tools/calc/registry.ts';
import { PDF_PAGES, PDF_TOOL_IDS, type PdfToolId } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { animationsDone, chooseImages, coffeeLineInOneUse, dismissCookies, hydrated, jpegBatch, openAdjust, openCompare, searchWithoutResult, slowEngine, useImage, type TestFile } from './lib/page.ts';
import { walkPdfTool } from './lib/pdf-states.ts';

// axe-core (WCAG 2.2 AA and best practices, tests/e2e/lib/axe.ts) on every page, at 360 and 1280px, in both
// themes. It runs with reduced motion (DECISOES § 57): the site animates only transform and opacity, so the
// colours axe checks are the same, the page is still, and the run fits the 15 minutes of pnpm verificar on the
// CI runner. The motion itself is tested in design.spec.ts.
const PAGES = ROUTES.flatMap((route) => languagesOf(route).map((lang) => route.paths[lang] ?? '/'));

// Each page and each state is reached once per browser, and axe runs at both widths and in both themes on it
// (violationsEverywhere, tests/e2e/lib/axe.ts; DECISOES § 76 and § 83).

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
// also lists the calculators, their presets and the guides (DECISOES § 125), read from their registry; F5a: and the PDF tools;
// F5b: and the file guides (DECISOES § 190). F7: and the 11 home and health calculators and the QR code generator, read from
// the registry and the route map (the count grows by construction, DECISOES § 259).
async function searchDialogListed(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Search tools/ }).click();
  await expect(page.locator('#fo-search-dialog')).toBeVisible();
  const utilities = ROUTES.filter((route) => route.id === QR_ID && route.paths.en).length;
  await expect(page.getByRole('option')).toHaveCount(
    IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length + PDF_TOOL_IDS.length + CALC_PAGE_IDS.length + GUIDE_IDS.length + FILE_GUIDE_IDS.length + LIFE_CALC_IDS.length + utilities,
  );
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
    // F13a (UX-04 A): the comparison and the options open only when asked; both are open here, so axe reads them.
    await openCompare(page);
    await openAdjust(page);
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
    // F13a (UX-04 A): the reason of the error is the paragraph under the sentence with the alert icon.
    await expect(page.locator('.fo-drop__why a')).toHaveAttribute('href', '/heic-to-jpg/');
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
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'cheer');
    await page.locator('#fo-calc-r').fill('99');
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'field in error and the cheer').toEqual([]);
    await page.locator('#fo-calc-r').fill('6.5');
    // F13b (DECISOES § C-5): the schedule is a block of the island, its button named by its heading.
    await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
    await page.locator('#fo-calc-schedule tr.fo-amort__year').nth(1).getByRole('button').click();
    await expect(page.locator('#fo-calc-schedule tbody tr:not(.fo-amort__year)')).toHaveCount(24);
    await page.locator('.fo-export .fo-btn').nth(1).click();
    await expect(page.locator('.fo-export-wrap [role="status"]')).toHaveText('Link copied');
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'schedule open and Link copied').toEqual([]);
  });
});

// F7 (decision 11): the states of the home and health calculators the page-by-page pass does not reach (it reads each page
// as loaded, with the example's result and its open table): a home result with an area added (a triangle, so the two rows
// have their shape menus and the table has two areas) and the Oli's first cheer, then a field out of its range
// (aria-invalid and the alert, the last result kept); a health result in US units and in metric units (no cheer on a
// health page); and the date field, with a day and with a day out of its range. The values typed and the results expected
// are cases of the oracle (fixtures/calc, written before the engines).
interface LifeCase {
  source: string;
  input: Record<string, number | string>;
  expected: Record<string, unknown>;
}

/** The first random case of the oracle that matches. */
function lifeCase(id: LifeCalcId, match: (input: LifeCase['input']) => boolean): LifeCase {
  const cases = (JSON.parse(readFileSync(resolve(`fixtures/calc/${id}.json`), 'utf8')) as { cases: LifeCase[] }).cases;
  const found = cases.find((entry) => entry.source === 'random' && match(entry.input));
  if (!found) throw new Error(`no oracle case of ${id}`);
  return found;
}

/** A measure as typed: tenths of a pound or of a centimeter as "172.5". */
const tenths = (value: number | string | undefined): string => (Number(value) / 10).toFixed(1);

test.describe('axe nos estados das calculadoras de casa e saúde, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  test('square footage: an area added with its result and the cheer, then a field out of its range', async ({ page }) => {
    expect((await page.goto(LIFE_CALC_PAGES['square-footage-calculator'].path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    await page.locator('#fo-calc-a-add').click();
    await expect(page.locator('#fo-tool-root fieldset.fo-debt')).toHaveCount(2);
    await page.locator('#fo-calc-a1s').selectOption('1');
    await page.locator('#fo-calc-a1x').fill('8');
    await page.locator('#fo-calc-a1y').fill('6.5');
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'cheer');
    await expect(page.locator('#fo-schedule-table tbody tr')).toHaveCount(2);
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'an area added, the result and the cheer').toEqual([]);
    await page.locator('#fo-calc-a0x').fill('987');
    await expect(page.locator('#fo-calc-a0x')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'a field out of its range').toEqual([]);
  });

  test('BMI: the result in US units and in metric units', async ({ page }) => {
    expect((await page.goto(LIFE_CALC_PAGES['bmi-calculator'].path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const us = lifeCase('bmi-calculator', (input) => input['unit'] === 'us');
    await page.locator('#fo-calc-ft').fill(String(us.input['feet']));
    await page.locator('#fo-calc-in').fill(tenths(us.input['inches']));
    await page.locator('#fo-calc-lb').fill(tenths(us.input['pounds']));
    await expect(page.locator('.fo-rhero__num')).toHaveText(tenths(us.expected['bmi'] as number));
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'wave');
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'US units').toEqual([]);
    await page.locator('.fo-seg__opt', { has: page.locator('input[name="fo-calc-u"][value="metric"]') }).click();
    await expect(page.locator('#fo-calc-kg')).toBeVisible();
    const metric = lifeCase('bmi-calculator', (input) => input['unit'] === 'metric');
    await page.locator('#fo-calc-cm').fill(tenths(metric.input['cm']));
    await page.locator('#fo-calc-kg').fill(tenths(metric.input['kg']));
    await expect(page.locator('.fo-rhero__num')).toHaveText(tenths(metric.expected['bmi'] as number));
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'wave');
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'metric units').toEqual([]);
  });

  test('due date: the date field with a day, then with a day out of its range', async ({ page }) => {
    expect((await page.goto(LIFE_CALC_PAGES['due-date-calculator'].path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const date = page.locator('#fo-calc-d');
    const lmp = lifeCase('due-date-calculator', (input) => input['method'] === 'lmp');
    // The hero sets the words and the numbers of a date in pieces of their own, with gaps instead of spaces (§ 246 and § 253).
    const due = longDate(String(lmp.expected['due']), 'en').replace(/\s+/g, '');
    await date.fill(String(lmp.input['date']));
    await expect(page.locator('.fo-rhero__num')).toHaveText(due);
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'a day').toEqual([]);
    await date.fill('1999-12-31');
    await expect(date).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    await expect(page.locator('.fo-rhero__num')).toHaveText(due);
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'a day out of its range').toEqual([]);
  });

  // F7 (decision 11): the QR code generator with a code made (the preview, the options and both Download buttons), then with
  // a text over the limit (the error with the alert, and no code). The languages adjustment: the same in Portuguese and
  // Spanish, at the path of the route map, a test per language.
  for (const lang of languagesOf(routeById(QR_ID))) {
    const path = routeById(QR_ID).paths[lang] ?? '';
    test(lang === 'en' ? 'QR code generator: with a code, then with a text over the limit' : `QR code generator in ${lang} (${path}): with a code, then with a text over the limit`, async ({ page }) => {
      expect((await page.goto(path))?.status()).toBe(200);
      await hydrated(page);
      await dismissCookies(page);
      const box = page.locator('#fo-tool-root textarea');
      await box.fill(`https://fileorca.com${path}`);
      await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeEnabled();
      await animationsDone(page);
      expect(await violationsEverywhere(page), 'a code').toEqual([]);
      await box.fill('x'.repeat(1_274));
      await expect(box).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#fo-tool-root .fo-field__error[role="alert"]')).toBeVisible();
      await animationsDone(page);
      expect(await violationsEverywhere(page), 'over the limit').toEqual([]);
    });
  }
});

// The states of the PDF pages (F5a and F6) are walked in axe-pdf-states.spec.ts (DECISOES § 307).

// F5b (prompt decision 7): every file guide with its embedded tool showing a result. The guide at rest is already read by
// the page-by-page pass above (the route map lists it). An image guide gets one small file the tool takes; a PDF guide walks
// its tool to the result, the state the tool's own page is read in.
const GUIDE_FILE: Record<string, { fixture: string; mimeType: string }> = {
  'heic-to-jpg': { fixture: 'heic-08-iphone13pro-paisagem-hdr-ios17.heic', mimeType: 'image/heic' },
  'webp-to-jpg': { fixture: 'gen-webp-exif-gps.webp', mimeType: 'image/webp' },
};

test.describe('axe nos guias de arquivo com a ferramenta embutida no resultado, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const id of FILE_GUIDE_IDS) {
    const guide = FILE_GUIDES[id];
    test(`${guide.path} with the result`, async ({ page }) => {
      if (Object.hasOwn(PDF_PAGES, guide.tool)) {
        let read = false;
        await walkPdfTool(
          page,
          guide.tool as PdfToolId,
          async (state) => {
            if (state !== 'result') return;
            expect(await violationsEverywhere(page)).toEqual([]);
            read = true;
          },
          { hold: false, path: guide.path },
        );
        expect(read, 'o passeio chegou ao resultado').toBe(true);
        return;
      }
      expect((await page.goto(guide.path))?.status()).toBe(200);
      await hydrated(page);
      await dismissCookies(page);
      const own = GUIDE_FILE[guide.tool];
      const files: TestFile[] = own ? [{ name: own.fixture, mimeType: own.mimeType, buffer: readFileSync(resolve('fixtures/images', own.fixture)) }] : await jpegBatch(page, 1);
      await chooseImages(page, files);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await animationsDone(page);
      expect(await violationsEverywhere(page)).toEqual([]);
    });
  }
});

// F6 (decision 9): the same states in Portuguese and Spanish, where the words are longer and other: every image tool and
// preset with its result, every PDF tool walked through its states with the labels of the language, a calculator of each
// language with a field in error, the cheer, the schedule open and "Link copied", and the Pix of /pt/apoie/ with an amount
// chosen and its code copied. The pages at load are read by the page-by-page pass above (the route map lists them).
const TRANSLATED = ['pt', 'es'] as const;
const IMAGE_FILE: Partial<Record<ImagePageId, { fixture: string; mimeType: string }>> = {
  'heic-to-jpg': { fixture: 'heic-08-iphone13pro-paisagem-hdr-ios17.heic', mimeType: 'image/heic' },
  'webp-to-jpg': { fixture: 'gen-webp-exif-gps.webp', mimeType: 'image/webp' },
  'png-to-jpg': { fixture: 'gen-png-transparente.png', mimeType: 'image/png' },
};

test.describe('axe nas ferramentas de imagem em pt e es com o resultado, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const lang of TRANSLATED) {
    for (const id of Object.keys(IMAGE_PAGES) as ImagePageId[]) {
      const path = routeById(id).paths[lang] ?? '';
      test(`${path} with the result`, async ({ page }) => {
        expect((await page.goto(path))?.status()).toBe(200);
        await hydrated(page);
        await dismissCookies(page);
        const own = IMAGE_FILE[id];
        const files: TestFile[] = own ? [{ name: own.fixture, mimeType: own.mimeType, buffer: readFileSync(resolve('fixtures/images', own.fixture)) }] : await jpegBatch(page, 1);
        await chooseImages(page, files);
        await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
        await animationsDone(page);
        expect(await violationsEverywhere(page)).toEqual([]);
      });
    }
  }
});

test.describe('axe nos estados da calculadora em pt e es, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const [lang, id, rate, shared] of [
    ['pt', 'br-sac-price', '11,5', ptCalcShared],
    ['es', 'mortgage-calculator', '6.5', esCalcShared],
  ] as const) {
    test(`${routeById(id).paths[lang] ?? ''}: a field in error, the cheer, the open schedule and the link copied`, async ({ page }) => {
      await page.addInitScript(() => {
        const clipboard = navigator.clipboard;
        if (clipboard) clipboard.writeText = async () => undefined;
      });
      expect((await page.goto(routeById(id).paths[lang] ?? ''))?.status()).toBe(200);
      await hydrated(page);
      await dismissCookies(page);
      await page.locator('#fo-calc-p').fill('400000');
      await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'cheer');
      await page.locator('#fo-calc-r').fill('99');
      await expect(page.locator('#fo-rhero-error')).toBeVisible();
      await animationsDone(page);
      expect(await violationsEverywhere(page), 'field in error and the cheer').toEqual([]);
      await page.locator('#fo-calc-r').fill(rate);
      await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
      await page.locator('#fo-calc-schedule tr.fo-amort__year').nth(1).getByRole('button').click();
      await expect(page.locator('#fo-calc-schedule tbody tr:not(.fo-amort__year)').first()).toBeVisible();
      await page.locator('.fo-export .fo-btn').nth(1).click();
      await expect(page.locator('.fo-export-wrap [role="status"]')).toHaveText(shared.island.copied);
      await animationsDone(page);
      expect(await violationsEverywhere(page), 'schedule open and the link copied').toEqual([]);
    });
  }
});

test.describe('axe no Pix de /pt/apoie/, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  test('an amount chosen and its code copied', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.resolve() } });
    });
    expect((await page.goto('/pt/apoie/'))?.status()).toBe(200);
    await page.waitForLoadState('load');
    await dismissCookies(page);
    const pix = ptSupport.pix;
    if (!pix) throw new Error('the Portuguese support page has no Pix texts');
    await page.locator('.fo-pix-card .fo-seg__opt', { hasText: pix.amount.replace('{amount}', '10') }).click();
    const shown = page.locator('.fo-pix:visible');
    await expect(shown).toHaveCount(1);
    await shown.getByRole('button', { name: pix.copy }).click();
    await expect(page.locator('.fo-pix__status')).toHaveText(pix.copied);
    await animationsDone(page);
    expect(await violationsEverywhere(page)).toEqual([]);
  });
});
