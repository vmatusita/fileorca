import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS, HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS, LIFE_CALC_PAGES, guidePathIn, moneyPage } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { visible } from '../../src/tools/calc/form.ts';
import type { ChoiceSpec, FieldSpec } from '../../src/tools/calc/types.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { LANGS, QR_ID, ROUTES, moneyHubId, routeById } from '../../src/i18n/routes.ts';
import { GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';
import { chooseImage, chooseImages, coffeeLineInOneUse, dismissCookies, dragOver, generatedJpeg, hydrated, jpegBatch, searchWithoutResult, slowEngine, useBadFile } from './lib/page.ts';
import { INBOX_CACHE, INBOX_TOOL_KEY, inboxEntryPath } from '../../src/sw/shared.ts';
import { DEFAULT_BUILD_ORIGIN, useTestBuild } from './lib/test-build.ts';
import { CLEARANCE, HUB_TARGETS, RAIL, TARGETS, TRANSLATED, VIEWPORTS, boxes, distance, english, expectAdsOutsideThePanel, expectClearance, openOnScreen, smallFiles } from './lib/ad-clearance.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// Review F13b c-3 (DECISOES § 592): the header, the PDF tools and the file guides are in clearance.spec.ts, a name that falls
// in a lighter part of the CI; the helpers of both are in tests/e2e/lib/ad-clearance.ts.

// F12, Mudança 10 (DECISOES § 413 and § 418): with no unit id there is no ad box, so the default build has none and
// every distance below is measured on the test build (fake ids in the 37 units of the map, the worst case). What the
// default build must not have is checked on it, by its own origin.
useTestBuild(test);

// The tool pages and presets that exist. A tool adds its path here when its page is built.
const TOOL_PAGES = [
  '/compress-image/',
  '/compress-image/to-100kb/',
  '/compress-image/to-1mb/',
  '/resize-image/',
  '/resize-image/youtube-thumbnail/',
  '/crop-image/',
  '/rotate-image/',
  '/heic-to-jpg/',
  '/webp-to-jpg/',
  '/png-to-jpg/',
  // F17 (decision 13; DECISOES § 715): the two tools of the run 2b; their pt and es pages come in below, from the registry.
  '/avif-to-jpg/',
  '/convert-to-webp/',
  '/image-to-pdf/',
  // F18 (decision 19; DECISOES § 742): the image tool and the image preset of the run; their pt and es pages come in below,
  // from the registry. The PDF tool and the PDF presets are walked in clearance.spec.ts, with the other PDF pages.
  '/remove-exif-data/',
  '/rotate-image/flip/',
];
// F6 (decision 9): the same pages in Portuguese and Spanish, read from the route map, with the same states and the
// same targets as the English page (SMALL_OF and ON_SCREEN are read through the English path of each one).
const TRANSLATED_TOOL_PAGES = TRANSLATED.flatMap((lang) => (Object.keys(IMAGE_PAGES) as ImagePageId[]).map((id) => routeById(id).paths[lang] ?? ''));
// F1b: the coffee line of the result card is measured too (the card itself is already in TARGETS).
const TARGETS_WITH_COFFEE = `${TARGETS}, .fo-result__support`;

// What each result must put on screen besides the card, so the clearance is measured against it and not against its
// absence: the number fields of Resize, the crop editor with its box and corner handles, the comparison of the
// tools that lose quality on purpose. Every result has the queue once there are two files (checked in the test).
const ON_SCREEN: Record<string, string[]> = {
  '/compress-image/': ['.fo-ba'],
  '/compress-image/to-100kb/': ['.fo-ba'],
  '/compress-image/to-1mb/': ['.fo-ba'],
  '/resize-image/': ['#rz-width', '#rz-height', '.fo-input'],
  '/resize-image/youtube-thumbnail/': ['.fo-ba'],
  '/crop-image/': ['.fo-crop', '.fo-crop__box', '.fo-crop__handle', '#cr-x', '#cr-y', '#cr-width', '#cr-height'],
  '/heic-to-jpg/': ['.fo-ba'],
  '/webp-to-jpg/': ['.fo-ba'],
  // F17: both lose quality on purpose (beforeAfter 'lossy'), so the comparison is on screen with the result.
  '/avif-to-jpg/': ['.fo-ba'],
  '/convert-to-webp/': ['.fo-ba'],
  // F18: Flip image keeps the quality (beforeAfter 'never', as Rotate image), and its one choice, Horizontal or Vertical, is in
  // "Adjust" with the result. Remove EXIF data has no field and no comparison: the card, the band and the queue.
  '/rotate-image/flip/': ['.fo-adjust .fo-seg'],
};

// One load per page and browser, walked through four states: at rest, while the first file is processed (the
// WaterLevel), with the result and Download on screen, and with a batch of two (the queue, the comparison and
// the ZIP card). In every state the page is measured at 360×740 and at 1280×800 on the same load: the layout is
// CSS (and a media query the island listens to, which a11y.spec.ts also relies on), so resizing the window in place
// gives what a fresh load at that width gives, and the processing runs once instead of twice. Each state keeps
// 150px between every AdSlot and the Download, the fields, the crop box and its handles, the queue, the
// comparison, the panel and the Oli, and none puts an AdSlot inside the panel.
test.describe('distância dos anúncios a 360×740 e a 1280×800', () => {
  for (const path of [...TOOL_PAGES, ...TRANSLATED_TOOL_PAGES]) {
    test(`${path}: at rest, while processing, with the result and with a batch`, async ({ page }) => {
      const gaps: string[] = [];
      let flip = false;
      /** Runs the check at both widths (the order alternates, so the window is resized once per state) and keeps the smallest gap of each. */
      const atBothWidths = async (state: string, check: (viewport: (typeof VIEWPORTS)[number]) => Promise<number>): Promise<void> => {
        const smallest: string[] = [];
        for (const viewport of flip ? [...VIEWPORTS].reverse() : VIEWPORTS) {
          await page.setViewportSize(viewport);
          // The island moves the comparison into the card or under it when the width crosses 768px, on the media query
          // change and a re-render after it: two frames later the layout has settled. Measured before that, the
          // comparison was once missing and the island once 17px into the rail's gap (DECISOES § 107).
          await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
          smallest.push(`${viewport.width}px ${(await check(viewport)).toFixed(0)}`);
        }
        flip = !flip;
        gaps.push(`${state}: ${smallest.join(', ')}`);
      };

      // The worker is held from the start: a pointer that rests over the panel (or the focus) warms the codecs and
      // starts the worker before the first file, and an engine already running would not stay in processing.
      const engine = await slowEngine(page);
      await page.setViewportSize(VIEWPORTS[0]);
      await page.goto(path);
      await hydrated(page);
      await dismissCookies(page);
      const adCount = await page.locator('.fo-ad').count();
      expect(adCount).toBeGreaterThan(0);
      // F12 (decision 3; UX-04 A, § 371; DECISOES § 423): the first content AdSlot comes right after the "How to" block,
      // which the GuideCard closes, and no longer right after the panel.
      expect(await page.locator('main > section[data-content="how"] + .fo-ad--content[data-ad-unit="conteudo"]').count(), 'o 1º anúncio depois do "Como usar"').toBe(1);

      // At rest: no content AdSlot above the tool panel, the rail from 1280px, and the clearance from every target.
      await atBothWidths('repouso', async (viewport) => {
        const panel = (await boxes(page, '.fo-drop'))[0];
        expect(panel).toBeDefined();
        for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, 'AdSlot acima do painel').toBeGreaterThan((panel?.y ?? 0) + (panel?.h ?? 0));
        if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
        await expectAdsOutsideThePanel(page, 'antes do arquivo', adCount);
        return expectClearance(page, 'antes do arquivo');
      });

      // Processing: the worker is held, so the panel is the WaterLevel.
      const batch = await smallFiles(page, path, 2);
      await chooseImages(page, batch.slice(0, 1));
      await expect(page.locator('.fo-level')).toBeVisible();
      await atBothWidths('processando', async () => {
        await expectAdsOutsideThePanel(page, 'processando', adCount);
        return expectClearance(page, 'processando');
      });
      engine.release();

      // The result of one file.
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      // F13a (UX-04 A): the one Oli of the island sits in the corner of the rectangle; the comparison and the options open
      // only when asked, so the result opens both before the clearance is measured (they are on screen, as a person makes
      // them be; § 473).
      await expect(page.locator('#fo-tool-root [data-oli]')).toHaveCount(1);
      await openOnScreen(page);
      await atBothWidths('resultado', async () => {
        for (const selector of ON_SCREEN[english(path)] ?? []) expect((await boxes(page, selector)).length, `${selector} na tela com o resultado`).toBeGreaterThan(0);
        await expectAdsOutsideThePanel(page, 'com o resultado', adCount);
        return expectClearance(page, 'com o resultado');
      });

      // A second batch on the result starts over: two files, the queue under the options, the card for both.
      await chooseImages(page, batch);
      await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(2);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('.fo-filelist .fo-bar')).toHaveCount(0);
      await openOnScreen(page);
      await atBothWidths('fila', async () => {
        for (const selector of ['.fo-filelist', '.fo-filelist .fo-file', ...(ON_SCREEN[english(path)] ?? [])]) {
          expect((await boxes(page, selector)).length, `${selector} na tela com a fila`).toBeGreaterThan(0);
        }
        await expectAdsOutsideThePanel(page, 'com a fila de dois arquivos', adCount);
        return expectClearance(page, 'com a fila de dois arquivos');
      });
      console.log(`${path} menor vão: ${gaps.join(' | ')}`);
    });
  }
});

// F1b: the same 150px in the other states of the panel and with the search dialog open and empty.
async function measure(page: Page, label: string, selector?: string): Promise<void> {
  const gap = await expectClearance(page, label, selector);
  console.log(`${label}: menor vão ${gap.toFixed(0)} px`);
}

for (const viewport of VIEWPORTS) {
  test.describe(`distância dos anúncios nos outros estados a ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    // The cookie choice is made by each test: the coffee line needs the Accept, the others the Decline.
    test.beforeEach(async ({ page }) => {
      await page.goto('/compress-image/');
      await hydrated(page);
    });

    test('with a file over the drop zone', async ({ page }) => {
      await dismissCookies(page);
      await dragOver(page);
      await measure(page, 'arquivo em cima');
    });

    test('while processing (WaterLevel on screen)', async ({ page }) => {
      await dismissCookies(page);
      const engine = await slowEngine(page);
      await chooseImage(page);
      await expect(page.locator('.fo-level')).toBeVisible();
      await measure(page, 'processando');
      engine.release();
      await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    });

    test('with the error message', async ({ page }) => {
      await dismissCookies(page);
      await useBadFile(page);
      await measure(page, 'erro');
    });

    // F13a (D-17; decision 10; DECISOES § 473): the error of a PNG on HEIC to JPG puts the chip to PNG to JPG in the
    // band, in place of the options: the chip keeps the 150px too.
    test('with the error of a PNG on HEIC to JPG: the chip to PNG to JPG in the band', async ({ page }) => {
      await page.goto('/heic-to-jpg/');
      await hydrated(page);
      await dismissCookies(page);
      await chooseImages(page, [{ name: 'notes.png', mimeType: 'image/png', buffer: readFileSync(resolve('fixtures/images', 'gen-png-transparente.png')) }]);
      await expect(page.locator('.fo-band .fo-next a.fo-chip')).toBeVisible({ timeout: 30_000 });
      await measure(page, 'erro do PNG no HEIC');
    });

    test('with a batch: the queue, the error row, the comparison and the chips', async ({ page }) => {
      await dismissCookies(page);
      const photos = await jpegBatch(page, 8);
      await chooseImages(page, [...photos.slice(0, 2), { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }, ...photos.slice(2)]);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(6);
      await openOnScreen(page);
      await expect(page.locator('.fo-ba')).toHaveCount(1);
      await expect(page.locator('.fo-next')).toBeVisible();
      await measure(page, 'lote com a fila, o comparador e os atalhos');
      await page.getByRole('button', { name: /^Show \d+ more$/ }).click();
      await measure(page, 'fila inteira');
    });

    test('with the result and the coffee line', async ({ page }) => {
      await coffeeLineInOneUse(page);
      await measure(page, 'resultado com a linha do café', TARGETS_WITH_COFFEE);
    });

    // F13a (UX-14, decision 10; DECISOES § 506): a next-step chip sent files here. With them in the inbox the result
    // comes at once with the note of where they came from; with the note in the tab and no inbox, the empty box. Both are
    // written in the page as the chip of Resize image writes them, and the page is opened again.
    const CHOICE = JSON.stringify({ tool: 'compress-image', order: [0], from: 'resize-image' });

    test.describe(() => {
      // The Cache Storage of the WebKit of Playwright does not outlive a reload while service workers are blocked (the
      // default of the config), and a chip only carries with a worker anyway: this state runs with them allowed.
      test.use({ serviceWorkers: 'allow' });

      test('with the arrival of a file a chip brought: the note of where it came from', async ({ page }) => {
        await dismissCookies(page);
        const photo = (await generatedJpeg(page)).toString('base64');
        await page.evaluate(
          async ([base64, cache, entry, key, choice]) => {
            const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
            const headers = { 'Content-Type': 'image/jpeg', 'X-FileOrca-Name': 'photo.jpg', 'X-FileOrca-Stored': String(Date.now()) };
            await (await caches.open(cache)).put(new Request(new URL(entry, location.origin).href), new Response(new Blob([bytes], { type: 'image/jpeg' }), { headers }));
            sessionStorage.setItem(key, choice);
          },
          [photo, INBOX_CACHE, inboxEntryPath(0), INBOX_TOOL_KEY, CHOICE] as const,
        );
        await page.reload();
        await hydrated(page);
        await expect(page.locator('.fo-result__from')).toBeVisible({ timeout: 30_000 });
        await openOnScreen(page);
        await measure(page, 'chegada com a nota de origem');
      });
    });

    test('with the empty box: the note of a chip and no file', async ({ page }) => {
      await dismissCookies(page);
      await page.evaluate(([key, choice]) => sessionStorage.setItem(key, choice), [INBOX_TOOL_KEY, CHOICE] as const);
      await page.reload();
      await hydrated(page);
      await expect(page.locator('.fo-drop[data-state="lost"]')).toBeVisible();
      await measure(page, 'caixa vazia');
    });

    // With the dialog open the page behind it is untouched. The dialog itself sits 24px from the
    // rail at 1280, so the full TARGETS list (the field, the empty message) does not apply there;
    // what must stay 150px from every AdSlot is the Oli, and in the empty state that is the peek.
    test('search dialog open without a result: the Oli keeps its distance', async ({ page }) => {
      await dismissCookies(page);
      await searchWithoutResult(page);
      expect((await boxes(page, '[data-oli="peek"]')).length, 'a peek na tela').toBeGreaterThan(0);
      await measure(page, 'busca sem resultado', '[data-oli]');
    });
  });
}

// F11 (decision 5; DECISOES § 393 and § 400): the guides hub of each language was born with no AdSlot and no ad area.
// F12 (decision 3; DECISOES § 423): the home and the guides hub have ads now, in the area "geral" (the map checks them,
// fo-ad-map.spec.ts); the free pages are the 27 of the map, with the offline page and "Open with" too, read from the route
// map (every route with no ad area), and none has a box, a unit, the loader or the push script.
test('the 27 free pages (legal, institutional, support, 404, offline and "Open with") have no AdSlot and no ad code', async ({ page }) => {
  const paths = ROUTES.filter((route) => !route.adArea).flatMap((route) => LANGS.flatMap((lang) => route.paths[lang] ?? []));
  expect(paths).toHaveLength(27);
  for (const free of ['/privacy/', '/pt/termos/', '/es/acerca-de/', '/contact/', '/pt/licencas/', '/es/apoyo/', '/404.html', '/pt/offline/', '/es/abrir-con/']) expect(paths).toContain(free);
  for (const withAds of ['/', '/pt/', '/es/', ...LANGS.map((lang) => routeById(GUIDES_HUB_ID).paths[lang] ?? '/guides/')]) expect(paths).not.toContain(withAds);
  for (const path of paths) {
    const response = await page.goto(path);
    if (!path.endsWith('404.html')) expect(response?.status(), path).toBe(200);
    expect(await page.locator('.fo-ad, aside.fo-rail').count(), path).toBe(0);
    expect(await page.locator('script[src*="adsbygoogle"], ins.adsbygoogle').count(), path).toBe(0);
    const html = await page.content();
    expect(html, `${path}: o carregador do AdSense`).not.toContain('pagead2.googlesyndication.com');
    expect(html, `${path}: o script de push`).not.toMatch(/adsbygoogle[^;]*\.push\s*\(/);
  }
});

// F2: the hub /image-tools/ has no panel, field, Download or Oli on screen; what holds there is the order. Its one
// content AdSlot sits under the grid of tools (never above them on the phone), the rail is the tool pages' one, and
// none is within 150px of a visible Oli.
// F12 (decision 3; DECISOES § 423): the hub has more content AdSlots on the phone (the map's); the first one is right
// after the grid of tools, and every content AdSlot on screen at each width is under the grid.
test('the hub keeps its first content AdSlot right after the grid of tools and every one under it, at 360 and 1280px', async ({ page }) => {
  // F6: in the three languages.
  for (const path of (['en', ...TRANSLATED] as const).map((lang) => routeById('image-tools').paths[lang] ?? '')) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    await expect(page.locator('main > section:has(.fo-grid) + .fo-ad--content[data-ad-unit="conteudo"]')).toHaveCount(1);
    await expect(page.locator(RAIL)).toHaveCount(1);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      const grid = await page.locator('.fo-grid').boundingBox();
      const ads = await boxes(page, '.fo-ad--content');
      expect(grid && ads.length > 0, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      for (const ad of ads) expect(ad.y, `${path} ${viewport.width}px: AdSlot acima da grade`).toBeGreaterThanOrEqual(grid!.y + grid!.height);
      for (const oli of await boxes(page, '[data-oli]')) {
        for (const slot of await boxes(page, '.fo-ad')) expect(distance(slot, oli), `${path} ${viewport.width}px: AdSlot perto da Oli`).toBeGreaterThanOrEqual(CLEARANCE);
      }
      // F13b (DECISOES § 573): the sea of the band and the cards, as on the other hubs.
      await expectClearance(page, `${path} a ${viewport.width}px`, HUB_TARGETS);
    }
  }
});

test('the AdSlot shows the accepted label per language and reserves its height, and nothing exists without the variables', async ({ page }) => {
  for (const [path, label] of [['/compress-image/', 'Advertisements'], ['/pt/comprimir-imagem/', 'Publicidade'], ['/es/comprimir-imagen/', 'Anuncios']] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path);
    // F12 (DECISOES § 423): every box carries the label (the content ones, the multiplex and the rails).
    for (const box of await page.locator('.fo-ad').all()) await expect(box.locator('.fo-ad__label')).toHaveText(label);
    const content = page.locator('.fo-ad--content').first();
    expect((await content.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(300);
    expect((await page.locator(RAIL).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(644);
    await expect(page.locator('aside.fo-rail')).toHaveAttribute('aria-label', label);
    // The default build: no box, no label, no reserved space, no meta, no unit, no loader (Mudança 10).
    expect((await page.goto(`${DEFAULT_BUILD_ORIGIN}${path}`))?.status(), path).toBe(200);
    expect(await page.locator('.fo-ad, .fo-ad__label, aside.fo-rail').count()).toBe(0);
    expect(await page.locator('meta[name="google-adsense-account"]').count()).toBe(0);
    expect(await page.locator('ins.adsbygoogle, script[src*="adsbygoogle"]').count()).toBe(0);
  }
  const adsTxt = await page.request.get(`${DEFAULT_BUILD_ORIGIN}/ads.txt`);
  expect(adsTxt.status()).toBe(404);
  expect(readFileSync('dist/_headers', 'utf8')).not.toContain('ads.txt');
});


// F4 (prompt decision 13): every calculator, preset and guide, at 360x740 and 1280x800 on one load, with the
// schedule closed and with one year open. Measured on top of TARGETS: the ResultHero, the three ExportBar buttons,
// the ScenarioCompare, the schedule section and its table. No AdSlot above the tool on a phone, inside the island,
// between the fields or inside the schedule; on a phone the result sits above the fold, right under the main fields.
// F13b (UX-12 A, decision 10; DECISOES § 545, § 547 and § 554): the card with the Download PDF in it and the message of an
// error in its place, the row of Download CSV and Copy link under it, the block of costs that folds (its button and, open, the
// echo of the result), and the schedule, now in the island before the chips.
const CALC_TARGETS = `${TARGETS}, .fo-rhero, .fo-rhero__get, .fo-rhero__error, .fo-export .fo-btn, .fo-calc__fold, .fo-disclose, .fo-calc__echo, .fo-compare, .fo-calc-schedule, .fo-amort-wrap, .fo-debt`;
// F6: the Spanish calculators and the Brazilian ones too, read from the registry, with the result above the fold.
// Languages adjustment (decision 4): every calculator and preset in Spanish (moneyPage(id, 'es'), the 18 of the English
// list) and the five money guides in Spanish; the result of each Spanish calculator is held above the fold at 360×740 too.
const EN_CALC_PATHS = CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path);
const ES_CALC_PATHS = CALC_PAGE_IDS.map((id) => moneyPage(id, 'es')?.path ?? '');
const BR_CALC_PATHS = BR_CALC_IDS.map((id) => moneyPage(id, 'pt')?.path ?? '');
const CALCULATOR_PATHS = [...EN_CALC_PATHS, ...ES_CALC_PATHS, ...BR_CALC_PATHS];
const MONEY_PAGES = [
  ...EN_CALC_PATHS,
  ...GUIDE_IDS.map((id) => GUIDES[id].path),
  ...ES_CALC_PATHS,
  ...GUIDE_IDS.map((id) => guidePathIn(id, 'es') ?? ''),
  ...BR_CALC_PATHS,
];

test.describe('distância dos anúncios nas calculadoras, a 360×740 e a 1280×800', () => {
  for (const path of MONEY_PAGES) {
    test(`${path}: with the schedule closed and with a year open`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS[0]);
      expect((await page.goto(path))?.status()).toBe(200);
      await hydrated(page);
      await dismissCookies(page);
      const adCount = await page.locator('.fo-ad').count();
      expect(adCount).toBeGreaterThan(0);
      const measure = async (state: string) => {
        for (const viewport of VIEWPORTS) {
          await page.setViewportSize(viewport);
          await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
          const label = `${state} a ${viewport.width}px`;
          const tool = (await boxes(page, '#fo-tool-root'))[0];
          expect(tool, label).toBeDefined();
          // No content AdSlot above the tool, on a phone or a computer.
          for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${label}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
          if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
          expect(await page.locator('#fo-calc-schedule .fo-ad, .fo-amort .fo-ad').count(), `${label}: AdSlot dentro do cronograma`).toBe(0);
          await expectAdsOutsideThePanel(page, label, adCount);
          await expectClearance(page, label, CALC_TARGETS);
        }
      };
      // The result above the fold on a phone, on a calculator page (a guide opens with its text first).
      if (CALCULATOR_PATHS.includes(path)) {
        await page.setViewportSize(VIEWPORTS[0]);
        const number = await page.locator('.fo-rhero__num').boundingBox();
        expect((number?.y ?? 999) + (number?.height ?? 0), 'número do resultado acima da dobra a 360×740').toBeLessThanOrEqual(740);
      }
      await measure('cronograma fechado');
      // F13b (DECISOES § 554): the block of costs open, where the page has one, with its fields and the echo of the result.
      const fold = page.locator('[aria-controls="fo-calc-more-fields"]');
      if (await fold.count()) {
        await fold.click();
        await expect(page.locator('#fo-calc-more-fields input').first()).toBeVisible();
        await measure('bloco de custos aberto');
      }
      await page.locator('#fo-calc-schedule button[aria-controls]').click();
      await expect(page.locator('.fo-amort tbody tr').first()).toBeVisible();
      await measure('um ano aberto');
    });
  }
});

// F12 (decision 3; DECISOES § 423): the first content AdSlot of the money hub goes right after the grid of the credit
// calculators (before, after both grids), and every content AdSlot on screen is under that grid and 150px from every grid.
test('the money hub keeps its first content AdSlot right after the grid of credit calculators, at 360 and 1280px', async ({ page }) => {
  // F6: the Spanish hub and the Brazilian one too.
  for (const path of (['en', ...TRANSLATED] as const).map((lang) => routeById(moneyHubId(lang)).paths[lang] ?? '')) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    await expect(page.locator('main > section[aria-labelledby="calcs-credit"] + .fo-ad--content[data-ad-unit="conteudo"]')).toHaveCount(1);
    await expect(page.locator(RAIL)).toHaveCount(1);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      const credit = (await boxes(page, 'main section[aria-labelledby="calcs-credit"] .fo-grid'))[0];
      const ads = await boxes(page, '.fo-ad--content');
      expect(credit && ads.length > 0, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      for (const ad of ads) expect(ad.y, `${path} ${viewport.width}px: AdSlot acima da grade de crédito`).toBeGreaterThanOrEqual(credit!.y + credit!.h);
      await expectClearance(page, `${path} a ${viewport.width}px`, HUB_TARGETS);
    }
  }
});

// F7 (decision 11): the 11 home and health calculators, read from the registry, at 360x740 and 1280x800, with the targets
// of the money calculators and the date field and the error line too. Their table is the result itself and shows open, with
// no Show button (CalcView.open): it is measured as it loads, and the money test above, which opens a closed schedule, does
// not change. The states: the example at load; a field out of its range (its error line on screen); a list with a row added
// (the areas of the square footage); and, on a page with US and metric units, the metric load of its link (#v=1&u=metric).
// On a phone the number of the result ends above 740px in every unit system (DECISOES § 124 and § 268). Every AdSlot of
// these pages is in the ad area of the route map (casa-saude).
const LIFE_TARGETS = `${CALC_TARGETS}, .fo-input--date, .fo-field__error`;

/** What a person types to put a field out of its range: a number above every range of these pages, or a day before 2000. */
function outOfRange(spec: FieldSpec): string {
  return spec.kind === 'date' ? '1999-12-31' : '99999999';
}

test.describe('distância dos anúncios nas calculadoras de casa e saúde, a 360×740 e a 1280×800', () => {
  for (const id of LIFE_CALC_IDS) {
    const path = LIFE_CALC_PAGES[id].path;
    test(`${path}: with the example, a field out of its range and every unit system`, async ({ page }) => {
      const def = DEFS[id];
      const area = routeById(id).adArea;
      const gaps: string[] = [];
      let adCount = 0;
      const load = async (hash: string) => {
        await page.setViewportSize(VIEWPORTS[0]);
        await page.goto('about:blank');
        expect((await page.goto(`${path}${hash}`))?.status()).toBe(200);
        await hydrated(page);
        await dismissCookies(page);
        adCount = await page.locator('.fo-ad').count();
        expect(adCount).toBeGreaterThan(0);
        await expect(page.locator(`.fo-ad[data-ad-area="${area}"]`), 'AdSlots na área do mapa').toHaveCount(adCount);
        // The table is open from the start, with no button to show it.
        await expect(page.locator('#fo-schedule-table .fo-amort')).toBeVisible();
        await expect(page.locator('#fo-calc-schedule button[aria-controls]')).toHaveCount(0);
        // The result above the fold on a phone, in this unit system.
        const number = await page.locator('.fo-rhero__num').boundingBox();
        const end = (number?.y ?? 999) + (number?.height ?? 0);
        gaps.push(`fim do número ${hash || 'no exemplo'}: ${end.toFixed(0)} px`);
        expect(end, `${hash || 'exemplo'}: número do resultado acima da dobra a 360×740`).toBeLessThanOrEqual(740);
      };
      const measure = async (state: string) => {
        let min = Infinity;
        for (const viewport of VIEWPORTS) {
          await page.setViewportSize(viewport);
          await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
          const label = `${state} a ${viewport.width}px`;
          const tool = (await boxes(page, '#fo-tool-root'))[0];
          expect(tool, label).toBeDefined();
          for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${label}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
          if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
          expect(await page.locator('#fo-calc-schedule .fo-ad, .fo-amort .fo-ad').count(), `${label}: AdSlot dentro da tabela`).toBe(0);
          await expectAdsOutsideThePanel(page, label, adCount);
          min = Math.min(min, await expectClearance(page, label, LIFE_TARGETS));
        }
        gaps.push(`${state}: ${min.toFixed(0)}`);
      };

      await load('');
      await measure('exemplo');
      // A list gets a row more (the areas of the square footage: the table grows with it).
      for (const spec of def.fields) {
        if (spec.kind !== 'list') continue;
        const rows = await page.locator('#fo-tool-root fieldset.fo-debt').count();
        await page.locator(`#fo-calc-${spec.key}-add`).click();
        await expect(page.locator('#fo-tool-root fieldset.fo-debt')).toHaveCount(rows + 1);
        await expect(page.locator('#fo-schedule-table tbody tr')).toHaveCount(rows + 1);
        await measure('uma linha a mais');
      }
      // The first field of the page out of its range: the error line under it, the last result kept.
      const first = def.fields.find((spec) => visible(spec, def.initial) && (spec.kind === 'date' || spec.kind === 'int' || spec.kind === 'dec' || spec.kind === 'list'));
      expect(first, 'um campo para errar').toBeDefined();
      if (first) {
        const field = first.kind === 'list' ? `#fo-calc-${first.key}0${first.item[0]?.key ?? ''}` : `#fo-calc-${first.key}`;
        await page.locator(field).fill(outOfRange(first.kind === 'list' ? (first.item[0] ?? first) : first));
        // F13b (DECISOES § 545): the words are in the card, in the place of the Download.
        await expect(page.locator(field)).toHaveAttribute('aria-invalid', 'true');
        await expect(page.locator('#fo-rhero-error')).toBeVisible();
        await measure('campo fora da faixa');
      }
      // The other unit system, as its link opens it.
      const units = def.fields.find((spec): spec is ChoiceSpec => spec.kind === 'choice' && spec.key === 'u');
      for (const option of units?.options.slice(1) ?? []) {
        await load(`#v=1&u=${option}`);
        await expect(page.locator(`input[name="fo-calc-u"][value="${option}"]`)).toBeChecked();
        await measure(`unidade ${option}`);
      }
      console.log(`${path} dobra e menor vão: ${gaps.join(' | ')}`);
    });
  }
});

// F7 (decision 8): the QR code generator, in the ad area "utilidades": no AdSlot above the tool on a phone or inside the
// island, the rail from 1280px, and 150px from the text box, the preview with the Oli, the options and the two Download
// buttons, at rest, with a code made and with the error of a text over the limit.
// F15 (DECISOES § 658): the panel goes field, output, options; the old .fo-qr__form (the field and the options) is now the
// field (.fo-qr__field) and the node of the options (.fo-qr__options).
const QR_TARGETS = `${TARGETS}, .fo-qr, .fo-qr__field, .fo-qr__options, .fo-qr__preview, .fo-qr__code, .fo-qr__oli, .fo-qr__actions, .fo-qr__out, .fo-btn, .fo-field__error`;

// Languages adjustment (decision 3): the same page in Portuguese and Spanish, with the same states and targets.
for (const lang of LANGS) {
  const path = routeById(QR_ID).paths[lang] ?? '';
  test(`${path}: the QR code generator keeps every AdSlot 150px from the tool, at rest, with a code and with an error`, async ({ page }) => {
    expect(path, `o QR existe em ${lang}`).not.toBe('');
    expect(routeById(QR_ID).adArea).toBe('utilidades');
    await page.setViewportSize(VIEWPORTS[0]);
    expect((await page.goto(path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const adCount = await page.locator('.fo-ad').count();
    expect(adCount).toBeGreaterThan(0);
    await expect(page.locator('.fo-ad[data-ad-area="utilidades"]')).toHaveCount(adCount);
    const gaps: string[] = [];
    const measure = async (state: string) => {
      let min = Infinity;
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
        const label = `${state} a ${viewport.width}px`;
        const tool = (await boxes(page, '#fo-tool-root'))[0];
        expect(tool, label).toBeDefined();
        for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${label}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
        if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
        await expectAdsOutsideThePanel(page, label, adCount);
        min = Math.min(min, await expectClearance(page, label, QR_TARGETS));
      }
      gaps.push(`${state}: ${min.toFixed(0)}`);
    };
    await measure('repouso');
    const box = page.locator('#fo-tool-root textarea');
    await box.fill('https://fileorca.com/qr-code-generator/');
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeEnabled();
    await measure('com o QR');
    await box.fill('x'.repeat(1_274));
    await expect(page.locator('#fo-tool-root .fo-field__error')).toBeVisible();
    await measure('acima do limite');
    console.log(`${path} menor vão: ${gaps.join(' | ')}`);
  });
}

// The home and health hubs, like the money hub: one content AdSlot under the grid of calculators (never above it on a
// phone), the rail from 1280px, 150px from the grid and from every Oli on screen, and both in the ad area casa-saude.
// F12 (decision 3; DECISOES § 423): the first content AdSlot right after the grid, every one under it, and every box of
// the page (the content ones, the multiplex and the rails) in the ad area casa-saude.
test('the home and health hubs keep their first content AdSlot right after the grid of calculators, at 360 and 1280px', async ({ page }) => {
  for (const id of [HOUSE_HUB_ID, HEALTH_HUB_ID] as const) {
    const route = routeById(id);
    const path = route.paths.en ?? '';
    expect(route.adArea, `${path}: área de anúncio`).toBe('casa-saude');
    expect((await page.goto(path))?.status(), path).toBe(200);
    await expect(page.locator('main > section:has(.fo-grid) + .fo-ad--content[data-ad-unit="conteudo"]')).toHaveCount(1);
    await expect(page.locator(RAIL)).toHaveCount(1);
    const all = await page.locator('.fo-ad').count();
    expect(all).toBeGreaterThan(2);
    await expect(page.locator('.fo-ad[data-ad-area="casa-saude"]')).toHaveCount(all);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      const grid = (await boxes(page, 'main .fo-grid'))[0];
      const ads = await boxes(page, '.fo-ad--content');
      expect(grid && ads.length > 0, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      for (const ad of ads) expect(ad.y, `${path} ${viewport.width}px: AdSlot acima da grade`).toBeGreaterThanOrEqual(grid!.y + grid!.h);
      await expectClearance(page, `${path} a ${viewport.width}px`, HUB_TARGETS);
    }
  }
});

// F5a (prompt decision 12; DECISOES § 170): every PDF tool page, at 360x740 and 1280x800 on one load, in each
// state the page reaches (tests/e2e/lib/pdf-states.ts): at rest, while the file is read (the engine held back, so the

// F14 (criterion 4, decision 14; DECISOES § 634): the page view of the PDF tools, open in "Fit" and in "Enlarge", at
// 360 × 740 and at 1280 × 800, in the five grid tools in English and in Delete in Portuguese and Spanish, with the result
// of Delete ("View the new PDF") and the Merge list ("View pages of {name}"). Every control of the view (its buttons, the
// frame and the pictures), the magnifier, "View the new PDF", "View pages" and the size choice stay 150 px from every ad
// (they are in TARGETS), no ad is inside the island, and nothing of the site is over a simulated AdSense anchor (fixed at
// the foot, 100 px, as in cookie-footer.spec.ts): at every point of it, elementFromPoint gives the anchor, never the
// <main> or the island, with the bar and with the page of the view under it.
type ViewTool = 'delete-pdf-pages' | 'split-pdf' | 'rotate-pdf' | 'sign-pdf' | 'reorder-pdf-pages';
const VIEW_CASES: { id: ViewTool; lang: 'en' | 'pt' | 'es' }[] = [
  ...(['delete-pdf-pages', 'split-pdf', 'rotate-pdf', 'sign-pdf', 'reorder-pdf-pages'] as const).map((id) => ({ id, lang: 'en' as const })),
  { id: 'delete-pdf-pages', lang: 'pt' },
  { id: 'delete-pdf-pages', lang: 'es' },
];
const VIEW_TARGETS = `${TARGETS}, .fo-pdf-island, .fo-ready, .fo-pages, .fo-pages__grid, .fo-page, .fo-page__main, .fo-merge-panel, .fo-merge, .fo-merge__remove`;

/** Nothing of the site over the anchor: every point of it gives the anchor, with each part of the view brought under it. */
async function expectAnchorOnTop(page: Page, label: string): Promise<void> {
  await page.evaluate(() => {
    const anchor = document.createElement('ins');
    anchor.className = 'adsbygoogle';
    anchor.id = 'fo-test-anchor';
    anchor.setAttribute('data-anchor-status', 'displayed');
    anchor.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:100px;display:block';
    document.body.append(anchor);
  });
  for (const part of ['.fo-pview__bar', '.fo-pview__frame', '.fo-pview__top']) {
    const covered = await page.evaluate((selector) => {
      const element = document.querySelector(`#fo-tool-root ${selector}`);
      const anchor = document.getElementById('fo-test-anchor');
      if (!element || !anchor) return ['missing'];
      const box = element.getBoundingClientRect();
      // The middle of the part 50 px above the foot of the window, in the band of the anchor.
      window.scrollBy(0, box.top + Math.min(box.height / 2, 60) - (innerHeight - 50));
      const found: string[] = [];
      for (let x = innerWidth * 0.05; x < innerWidth; x += innerWidth * 0.1) {
        for (let y = innerHeight - 95; y < innerHeight; y += 30) {
          const hit = document.elementFromPoint(x, y);
          if (hit !== anchor || hit.closest('main, #fo-tool-root')) found.push(`${Math.round(x)},${Math.round(y)} ${hit ? `${hit.tagName}.${hit.className}` : 'nothing'}`);
        }
      }
      return found;
    }, part);
    expect(covered, `${label}: o site por cima da âncora, com ${part} embaixo dela`).toEqual([]);
  }
  await page.evaluate(() => document.getElementById('fo-test-anchor')?.remove());
}

/** The 150 px, the ads outside the island and the anchor, in "Fit" and "Enlarge", at both sizes of window. */
async function measureView(page: Page, label: string, adCount: number, gaps: string[], enlarge: string, fit: string): Promise<void> {
  const view = page.locator('#fo-tool-root .fo-pview');
  for (const mode of ['Fit', 'Enlarge'] as const) {
    if (mode === 'Enlarge') await view.getByRole('button', { name: enlarge, exact: true }).click();
    await expect(view.locator('.fo-pview__img')).toBeVisible({ timeout: 30_000 });
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
      const at = `${label}, ${mode}, ${viewport.width}px`;
      await view.scrollIntoViewIfNeeded();
      const tool = (await boxes(page, '#fo-tool-root'))[0];
      for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${at}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
      if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
      await expectAdsOutsideThePanel(page, at, adCount);
      const least = await expectClearance(page, at, VIEW_TARGETS);
      // The picture as seen: enlarged, its box passes the frame that scrolls, and the part on screen is inside the frame.
      const seen = await view.evaluate((element) => {
        const frame = (element.querySelector('.fo-pview__frame') as HTMLElement).getBoundingClientRect();
        const img = (element.querySelector('.fo-pview__img') as HTMLElement).getBoundingClientRect();
        const left = Math.max(frame.left, img.left);
        const top = Math.max(frame.top, img.top);
        return { kind: 'fo-pview__img (seen)', x: left + scrollX, y: top + scrollY, w: Math.min(frame.right, img.right) - left, h: Math.min(frame.bottom, img.bottom) - top };
      });
      expect(seen.w * seen.h, `${at}: the picture on screen`).toBeGreaterThan(0);
      const ads = await boxes(page, '.fo-ad');
      for (const ad of ads) expect(distance(ad, seen), `${at}: AdSlot a ${distance(ad, seen).toFixed(0)}px da página vista`).toBeGreaterThanOrEqual(CLEARANCE);
      const picture = Math.min(...ads.map((ad) => distance(ad, seen)));
      gaps.push(`${mode} ${viewport.width}px ${least.toFixed(0)} (${await nearest(page, ['.fo-pview .fo-btn', '.fo-pview__frame'])}, the picture seen ${picture.toFixed(0)})`);
      await expectAnchorOnTop(page, at);
    }
  }
  await view.getByRole('button', { name: fit, exact: true }).click();
  await page.setViewportSize(VIEWPORTS[0]);
}

/** The 150 px of what is on screen without the view (the magnifiers and the size choice, a button of the result or a row). */
async function measureNow(page: Page, label: string, adCount: number, gaps: string[], selectors: string[]): Promise<void> {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
    for (const selector of selectors) expect((await boxes(page, selector)).length, `${label} ${viewport.width}px: ${selector} na tela`).toBeGreaterThan(0);
    await expectAdsOutsideThePanel(page, `${label} ${viewport.width}px`, adCount);
    const least = await expectClearance(page, `${label} a ${viewport.width}px`, VIEW_TARGETS);
    gaps.push(`${viewport.width}px ${least.toFixed(0)} (${await nearest(page, selectors)})`);
  }
  await page.setViewportSize(VIEWPORTS[0]);
}

/** The smallest distance from each control to an ad, for the report (DECISOES § 634). */
async function nearest(page: Page, selectors: string[]): Promise<string> {
  const ads = await boxes(page, '.fo-ad');
  const parts: string[] = [];
  for (const selector of selectors) {
    const found = await boxes(page, selector);
    if (found.length > 0) parts.push(`${selector} ${Math.min(...found.flatMap((box) => ads.map((ad) => distance(ad, box)))).toFixed(0)}`);
  }
  return parts.join(', ');
}

test.describe('distância dos anúncios com a vista da página aberta, a 360×740 e a 1280×800', () => {
  for (const { id, lang } of VIEW_CASES) {
    const path = routeById(id).paths[lang] ?? '';
    test(`${path}: the magnifier, the size choice and the page view in "Fit" and "Enlarge", 150px from every ad and under the anchor`, async ({ page }) => {
      test.setTimeout(120_000);
      const words = PDF_PANEL_TEXTS[lang];
      const options = (PDF_TOOL_TEXTS[lang][id].panel as unknown as { options: Record<string, string> }).options;
      const gaps: string[] = [];
      await page.setViewportSize(VIEWPORTS[0]);
      await openTool(page, path);
      const adCount = await page.locator('.fo-ad').count();
      expect(adCount, 'AdSlots da página').toBeGreaterThan(0);
      const root = page.locator('#fo-tool-root');
      await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
      if (id === 'rotate-pdf') {
        await expect(root.locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
        await root.locator('.fo-adjust > summary').click();
      } else await expect(root.locator('.fo-ready:not(.fo-ready--reading)')).toBeVisible({ timeout: 30_000 });
      const pick = id === 'split-pdf' || id === 'rotate-pdf' ? options['pick'] : id === 'sign-pdf' ? options['pickPages'] : undefined;
      if (pick) await root.locator('.fo-seg__opt').filter({ hasText: pick }).first().click();
      const cells = root.locator('.fo-pages__grid > li');
      await expect(cells).toHaveCount(8, { timeout: 30_000 });
      await measureNow(page, `${path} grade`, adCount, gaps, ['.fo-page__zoom', '.fo-pages .fo-seg']);
      await cells.nth(0).locator('.fo-page__zoom').click();
      await measureView(page, `${path} vista`, adCount, gaps, words.view.enlarge, words.view.fit);
      if (id === 'delete-pdf-pages') {
        await root.locator('.fo-pview').getByRole('button', { name: words.view.back, exact: true }).click();
        await cells.nth(1).locator('.fo-page__main').click();
        await root.locator('.fo-ready .fo-btn--brand').click();
        const view = root.getByRole('button', { name: words.view.openResult, exact: true });
        await expect(view).toBeVisible({ timeout: 60_000 });
        await measureNow(page, `${path} resultado`, adCount, gaps, ['.fo-result__view']);
        await view.click();
        await measureView(page, `${path} vista do resultado`, adCount, gaps, words.view.enlarge, words.view.fit);
      }
      console.log(`${path} menor vão com a vista: ${gaps.join(' | ')}`);
    });
  }

  test('/merge-pdf/: "View pages of {name}" on each row and the view of a file, 150px from every ad and under the anchor', async ({ page }) => {
    test.setTimeout(120_000);
    const words = PDF_PANEL_TEXTS.en;
    const gaps: string[] = [];
    await page.setViewportSize(VIEWPORTS[0]);
    await openTool(page, '/merge-pdf/');
    const adCount = await page.locator('.fo-ad').count();
    const root = page.locator('#fo-tool-root');
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf')]);
    await expect(root.locator('.fo-merge-panel .fo-btn--brand')).toBeVisible({ timeout: 30_000 });
    await measureNow(page, '/merge-pdf/ lista', adCount, gaps, ['.fo-merge__view']);
    await root.locator('.fo-merge__view').nth(1).click();
    await measureView(page, '/merge-pdf/ vista de um arquivo', adCount, gaps, words.view.enlarge, words.view.fit);
    console.log(`/merge-pdf/ menor vão com a vista: ${gaps.join(' | ')}`);
  });
});

// F15 (frente L; decision 12; DECISOES § 662 and § 668): the list of Image to PDF with three photos, the arrows and the bin
// outside each card, then the line a row leaves with its Undo, at 360 × 740 and at 1280 × 800: 150 px from every ad, no
// ad in the island, and the shortest distance of each new control for the report.
test.describe('distância dos anúncios da lista da Imagem para PDF, a 360×740 e a 1280×800', () => {
  test('/image-to-pdf/: the arrows, the bins and the line of Undo of the list, 150px from every ad', async ({ page }) => {
    test.setTimeout(120_000);
    const gaps: string[] = [];
    await page.setViewportSize(VIEWPORTS[0]);
    expect((await page.goto('/image-to-pdf/'))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const adCount = await page.locator('.fo-ad').count();
    expect(adCount, 'AdSlots da página').toBeGreaterThan(0);
    await chooseImages(page, await jpegBatch(page, 3));
    await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#fo-tool-root .fo-filelist__remove')).toHaveCount(3);
    const list = ['.fo-filelist__row', '.fo-filelist__move', '.fo-filelist__none', '.fo-filelist__remove'];
    await measureNow(page, '/image-to-pdf/ lista', adCount, gaps, list);
    await page.getByRole('button', { name: 'Remove photo-2.jpg', exact: true }).click();
    await expect(page.locator('#fo-tool-root .fo-filelist__undo')).toBeVisible();
    await measureNow(page, '/image-to-pdf/ linha do Desfazer', adCount, gaps, ['.fo-filelist__undo', ...list]);
    console.log(`/image-to-pdf/ menor vão da lista: ${gaps.join(' | ')}`);
  });
});

// F15, frente Q (decision 12; DECISOES § 662): Compress image with "Up to a size" chosen and the field "Maximum size" open,
// before the result (in the band), with the result (in "Adjust", with the comparison open) and with the error of the field,
// at 360 × 740 and 1280 × 800, in the three languages: 150 px from every ad, no ad in the panel. The third choice and the
// field are in TARGETS (.fo-seg, .fo-field, .fo-input, input, .fo-field__help, .fo-field__error).
test.describe('distância dos anúncios com o "Até um tamanho" do Comprimir, a 360×740 e a 1280×800', () => {
  for (const lang of LANGS) {
    const path = routeById('compress-image').paths[lang] ?? '';
    test(`${path}: "Up to a size" with its field, before the result, in "Adjust" and with the error, 150px from every ad`, async ({ page }) => {
      test.setTimeout(120_000);
      const gaps: string[] = [];
      const atBothWidths = async (state: string): Promise<void> => {
        const smallest: string[] = [];
        for (const viewport of VIEWPORTS) {
          await page.setViewportSize(viewport);
          await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
          const label = `${path} ${state} a ${viewport.width}px`;
          expect((await boxes(page, '#ci-max')).length, `${label}: o campo na tela`).toBe(1);
          const panel = (await boxes(page, '#fo-tool-root'))[0];
          for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${label}: AdSlot acima da ferramenta`).toBeGreaterThan((panel?.y ?? 0) + (panel?.h ?? 0));
          await expectAdsOutsideThePanel(page, label, adCount);
          smallest.push(`${viewport.width}px ${(await expectClearance(page, label)).toFixed(0)}`);
        }
        gaps.push(`${state}: ${smallest.join(', ')}`);
      };
      await page.setViewportSize(VIEWPORTS[0]);
      expect((await page.goto(path))?.status()).toBe(200);
      await hydrated(page);
      await dismissCookies(page);
      const adCount = await page.locator('.fo-ad').count();
      expect(adCount).toBeGreaterThan(0);
      await page.locator('.fo-seg__opt', { has: page.locator('input[name="ci-level"][value="size"]') }).click();
      await expect(page.locator('#ci-max')).toBeVisible();
      await atBothWidths('campo aberto');
      await chooseImage(page);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await openOnScreen(page);
      await expect(page.locator('details.fo-adjust #ci-max')).toBeVisible();
      await atBothWidths('com o resultado e o Ajustar');
      await page.locator('#ci-max').fill('5');
      await page.locator('#ci-max').blur();
      await expect(page.locator('#ci-max-error')).toBeVisible();
      await atBothWidths('com o erro do campo');
      console.log(`${path} menor vão com o "Até um tamanho": ${gaps.join(' | ')}`);
    });
  }
});
