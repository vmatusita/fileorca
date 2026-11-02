import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, ES_CALC_IDS, GUIDES, GUIDE_IDS, moneyPage } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PAGES } from '../../src/tools/pdf/registry.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { ROUTES, moneyHubId, routeById } from '../../src/i18n/routes.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
import type { PdfToolId } from '../../src/tools/pdf/registry.ts';
import { chooseImage, chooseImages, coffeeLineInOneUse, dismissCookies, dragOver, hydrated, jpegBatch, searchWithoutResult, slowEngine, useBadFile, type TestFile } from './lib/page.ts';
import { PDF_WALKS, walkPdfTool, type PdfState } from './lib/pdf-states.ts';

const isPdfTool = (id: string): id is PdfToolId => Object.hasOwn(PDF_PAGES, id);

// 150px between every AdSlot and the Download button, each field, the panel and the Oli
// (PLANO "Molde da página de ferramenta"). Oli selector: [data-oli] (DECISOES § 19).
const CLEARANCE = 150;
// F2: the panel (the slot and the island around it), the queue of files, the number fields (the inputs, their
// frames, labels and help lines), the comparison, the crop editor with its box and corner handles and the
// next-step chips are measured too.
const TARGETS = [
  '.fo-btn--download', 'input:not([type="file"])', 'select', 'textarea', '.fo-seg', 'fieldset',
  '.fo-tool-island', '.fo-slot', '.fo-drop', '.fo-level', '.fo-result', '[data-oli]',
  '.fo-queue', '.fo-filelist', '.fo-file', '.fo-queue__more',
  '.fo-fields', '.fo-field', '.fo-input', '.fo-field__help',
  '.fo-ba', '.fo-crop', '.fo-crop__stage', '.fo-crop__box', '.fo-crop__handle', '.fo-next',
].join(', ');
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
  '/image-to-pdf/',
];
// F6 (decision 9): the same pages in Portuguese and Spanish, read from the route map, with the same states and the
// same targets as the English page (SMALL_OF and ON_SCREEN are read through the English path of each one).
const TRANSLATED = ['pt', 'es'] as const;
const TRANSLATED_TOOL_PAGES = TRANSLATED.flatMap((lang) => (Object.keys(IMAGE_PAGES) as ImagePageId[]).map((id) => routeById(id).paths[lang] ?? ''));
const ENGLISH_OF = new Map(ROUTES.flatMap((route) => TRANSLATED.flatMap((lang) => (route.paths[lang] ? [[route.paths[lang], route.paths.en ?? '']] : []))));
const english = (path: string): string => ENGLISH_OF.get(path) ?? path;
// F1b: the coffee line of the result card is measured too (the card itself is already in TARGETS).
const TARGETS_WITH_COFFEE = `${TARGETS}, .fo-result__support`;
const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 1280, height: 800 },
] as const;
// The result states use small inputs (the clearance does not depend on the size of the photo): the 640 × 480 JPEG
// drawn in the page for the tools that take a JPG, and the smallest fixture of the format for the converters, which
// take one format each (a JPG would be refused and no result would show).
const SMALL_OF: Record<string, { fixture: string; mimeType: string }> = {
  // Over 1 MB, so the preset has something to shrink and the comparison shows (the 128 KB JPEG already fits).
  '/compress-image/to-1mb/': { fixture: 'gen-png-transparente.png', mimeType: 'image/png' }, // 800 × 600, 1.1 MB
  '/heic-to-jpg/': { fixture: 'heic-08-iphone13pro-paisagem-hdr-ios17.heic', mimeType: 'image/heic' }, // 1512 × 850, 239 KB
  '/webp-to-jpg/': { fixture: 'gen-webp-exif-gps.webp', mimeType: 'image/webp' }, // 1600 × 1200, 262 KB
};

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
};

/** `count` small files this page accepts, with names of their own (a batch of two or more shows the queue). */
async function smallFiles(page: Page, path: string, count: number): Promise<TestFile[]> {
  const own = SMALL_OF[english(path)];
  if (!own) return jpegBatch(page, count);
  const buffer = readFileSync(resolve('fixtures/images', own.fixture));
  const extension = own.fixture.split('.').pop() ?? '';
  return Array.from({ length: count }, (_, index) => ({ name: `photo-${index + 1}.${extension}`, mimeType: own.mimeType, buffer }));
}

interface Box { kind: string; x: number; y: number; w: number; h: number }

async function boxes(page: Page, selector: string): Promise<Box[]> {
  return page.locator(selector).evaluateAll((nodes) =>
    nodes
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { kind: node.className || node.tagName, x: rect.left + scrollX, y: rect.top + scrollY, w: rect.width, h: rect.height };
      })
      .filter((box) => box.w > 0 && box.h > 0),
  );
}

function distance(a: Box, b: Box): number {
  const dx = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

async function expectClearance(page: Page, label: string, selector = TARGETS): Promise<number> {
  const ads = await boxes(page, '.fo-ad');
  const targets = await boxes(page, selector);
  expect(ads.length, `${label}: nenhum AdSlot visível`).toBeGreaterThan(0);
  expect(targets.length).toBeGreaterThan(0);
  let min = Infinity;
  for (const ad of ads) {
    for (const target of targets) {
      const gap = distance(ad, target);
      min = Math.min(min, gap);
      expect(gap, `${label}: AdSlot a ${gap.toFixed(0)}px de ${target.kind}`).toBeGreaterThanOrEqual(CLEARANCE);
    }
  }
  return min;
}

/** No AdSlot inside the tool island (the panel, the options, the queue, the chips) and none added or removed by a state. */
async function expectAdsOutsideThePanel(page: Page, label: string, adCount: number): Promise<void> {
  expect(await page.locator('#fo-tool-root .fo-ad').count(), `${label}: AdSlot dentro do painel`).toBe(0);
  expect(await page.locator('.fo-ad').count(), `${label}: o número de AdSlots mudou`).toBe(adCount);
}

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

      // At rest: no content AdSlot above the tool panel, the rail from 1280px, and the clearance from every target.
      await atBothWidths('repouso', async (viewport) => {
        const panel = (await boxes(page, '.fo-drop'))[0];
        expect(panel).toBeDefined();
        for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, 'AdSlot acima do painel').toBeGreaterThan((panel?.y ?? 0) + (panel?.h ?? 0));
        if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
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
      await expect(page.locator('.fo-result [data-oli]')).toHaveCount(1);
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

    test('with a batch: the queue, the error row, the comparison and the chips', async ({ page }) => {
      await dismissCookies(page);
      const photos = await jpegBatch(page, 8);
      await chooseImages(page, [...photos.slice(0, 2), { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }, ...photos.slice(2)]);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('.fo-filelist .fo-file')).toHaveCount(6);
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

test('legal, institutional, home and 404 pages have no AdSlot and no ad code', async ({ page }) => {
  const paths = [
    '/', '/pt/', '/es/', '/privacy/', '/pt/privacidade/', '/es/privacidad/', '/terms/', '/pt/termos/', '/es/terminos/',
    '/about/', '/pt/sobre/', '/es/acerca-de/', '/contact/', '/pt/contato/', '/es/contacto/',
    '/licenses/', '/pt/licencas/', '/es/licencias/', '/support/', '/pt/apoie/', '/es/apoyo/', '/404.html', '/pt/404.html', '/es/404.html',
  ];
  for (const path of paths) {
    await page.goto(path);
    expect(await page.locator('.fo-ad').count(), path).toBe(0);
    expect(await page.locator('script[src*="adsbygoogle"], ins.adsbygoogle').count(), path).toBe(0);
  }
});

// F2: the hub /image-tools/ has no panel, field, Download or Oli on screen; what holds there is the order. Its one
// content AdSlot sits under the grid of tools (never above them on the phone), the rail is the tool pages' one, and
// none is within 150px of a visible Oli.
test('the hub keeps its one content AdSlot under the grid of tools, at 360 and 1280px', async ({ page }) => {
  // F6: in the three languages.
  for (const path of (['en', ...TRANSLATED] as const).map((lang) => routeById('image-tools').paths[lang] ?? '')) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(page.locator('.fo-ad--content')).toHaveCount(1);
      await expect(page.locator('.fo-ad--rail')).toHaveCount(1);
      const grid = await page.locator('.fo-grid').boundingBox();
      const ad = await page.locator('.fo-ad--content').boundingBox();
      expect(grid && ad, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      expect(ad!.y, `${path} ${viewport.width}px: AdSlot acima da grade`).toBeGreaterThanOrEqual(grid!.y + grid!.height);
      for (const oli of await boxes(page, '[data-oli]')) {
        for (const slot of await boxes(page, '.fo-ad')) expect(distance(slot, oli), `${path} ${viewport.width}px: AdSlot perto da Oli`).toBeGreaterThanOrEqual(CLEARANCE);
      }
    }
  }
});

test('the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables', async ({ page }) => {
  for (const [path, label] of [['/compress-image/', 'Advertisements'], ['/pt/comprimir-imagem/', 'Publicidade'], ['/es/comprimir-imagen/', 'Anuncios']] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path);
    const content = page.locator('.fo-ad--content');
    await expect(content.locator('.fo-ad__label')).toHaveText(label);
    expect((await content.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(300);
    expect((await page.locator('.fo-ad--rail').boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(644);
    expect(await page.locator('meta[name="google-adsense-account"]').count()).toBe(0);
    expect(await page.locator('ins.adsbygoogle, script[src*="adsbygoogle"]').count()).toBe(0);
  }
  const adsTxt = await page.request.get('/ads.txt');
  expect(adsTxt.status()).toBe(404);
  expect(readFileSync('dist/_headers', 'utf8')).not.toContain('ads.txt');
});

// F4 (prompt decision 13): every calculator, preset and guide, at 360x740 and 1280x800 on one load, with the
// schedule closed and with one year open. Measured on top of TARGETS: the ResultHero, the three ExportBar buttons,
// the ScenarioCompare, the schedule section and its table. No AdSlot above the tool on a phone, inside the island,
// between the fields or inside the schedule; on a phone the result sits above the fold, right under the main fields.
const CALC_TARGETS = `${TARGETS}, .fo-rhero, .fo-export .fo-btn, .fo-compare, .fo-calc-schedule, .fo-amort-wrap, .fo-debt`;
// F6: the Spanish calculators and the Brazilian ones too, read from the registry, with the result above the fold.
const CALCULATOR_PATHS = [...CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path), ...ES_CALC_IDS.map((id) => moneyPage(id, 'es')?.path ?? ''), ...BR_CALC_IDS.map((id) => moneyPage(id, 'pt')?.path ?? '')];
const MONEY_PAGES = [...CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path), ...GUIDE_IDS.map((id) => GUIDES[id].path), ...CALCULATOR_PATHS.slice(CALC_PAGE_IDS.length)];

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
          if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
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
      await page.locator('#fo-calc-schedule button[aria-controls]').click();
      await expect(page.locator('.fo-amort tbody tr').first()).toBeVisible();
      await measure('um ano aberto');
    });
  }
});

test('the money hub keeps its one content AdSlot under the grids of calculators, at 360 and 1280px', async ({ page }) => {
  // F6: the Spanish hub and the Brazilian one too.
  for (const path of (['en', ...TRANSLATED] as const).map((lang) => routeById(moneyHubId(lang)).paths[lang] ?? '')) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(page.locator('.fo-ad--content')).toHaveCount(1);
      await expect(page.locator('.fo-ad--rail')).toHaveCount(1);
      const grids = await boxes(page, 'main .fo-grid');
      const ad = await page.locator('.fo-ad--content').boundingBox();
      const last = grids.at(-1);
      expect(last && ad, `${path} ${viewport.width}px: as grades e o AdSlot na tela`).toBeTruthy();
      expect(ad!.y, `${path} ${viewport.width}px: AdSlot acima das grades`).toBeGreaterThanOrEqual(last!.y + last!.h);
      await expectClearance(page, `${path} a ${viewport.width}px`, '.fo-grid, .fo-tool, [data-oli]');
    }
  }
});

// F5a (prompt decision 12; DECISOES § 170): every PDF tool page, at 360x740 and 1280x800 on one load, in each
// state the page reaches (tests/e2e/lib/pdf-states.ts): at rest, while the file is read (the engine held back, so the
// panel is the WaterLevel), with the options and the page grid open, the Merge list, the password field or the signature
// area, and with the result. Measured on top of TARGETS: the page grid with its cells and bar, the password field with its
// toggle and error, the signature area (pad, file field, preview of the page, box and notice), the Merge list with its
// move buttons, the ready card and the stack of options. No AdSlot above the tool on a phone, none inside the island or
// added or removed by a state, and 150px from every target in every state.
const PDF_TARGETS = [
  TARGETS,
  '.fo-pdf-island', '.fo-ready', '.fo-options-stack', '.fo-fields--stack',
  '.fo-pages', '.fo-pages__bar', '.fo-pages__count', '.fo-pages__grid', '.fo-page', '.fo-page__main', '.fo-page__moves',
  '.fo-pass', '.fo-pass__toggle', '.fo-field__error',
  '.fo-sign', '.fo-sign__pad', '.fo-sign__file', '.fo-sign__place', '.fo-sign__page', '.fo-sign__box', '.fo-sign__notice',
  '.fo-merge', '.fo-merge__moves',
].join(', ');
// What a state must put on screen besides the card, so the clearance is measured against it and not against its absence.
const PDF_ON_SCREEN: Record<PdfState, string[]> = {
  rest: ['.fo-drop'],
  processing: ['.fo-level'],
  ready: ['.fo-ready'],
  list: ['.fo-ready', '.fo-merge', '.fo-merge__move'],
  grid: ['.fo-pages', '.fo-pages__grid', '.fo-page', '.fo-page[data-selected="true"], .fo-page__moves, .fo-page__badge'],
  password: ['.fo-pass', '.fo-pass__toggle', '.fo-pass .fo-field__error'],
  signature: ['.fo-sign', '.fo-sign__place', '.fo-sign__page', '.fo-sign__notice'],
  result: ['.fo-result', '.fo-btn--download'],
};

// F6: the same walk on the Portuguese and Spanish pages, with the labels of the language.
const PDF_WALKS_ALL = [...PDF_WALKS.map((walk) => ({ ...walk, lang: 'en' as const })), ...TRANSLATED.flatMap((lang) => PDF_WALKS.map(({ id }) => ({ id, path: routeById(id).paths[lang] ?? '', lang })))];

test.describe('distância dos anúncios nas ferramentas de PDF, a 360×740 e a 1280×800', () => {
  for (const { id, path, lang } of PDF_WALKS_ALL) {
    test(`${path}: at rest, while reading, with the options and the result`, async ({ page }) => {
      const gaps: string[] = [];
      let adCount = 0;
      let flip = false;
      await page.setViewportSize(VIEWPORTS[0]);
      await walkPdfTool(
        page,
        id,
        async (state, note) => {
          if (state === 'rest') {
            adCount = await page.locator('.fo-ad').count();
            expect(adCount, 'AdSlots da página').toBeGreaterThan(0);
          }
          const smallest: string[] = [];
          // The order alternates, so the window is resized once per state.
          for (const viewport of flip ? [...VIEWPORTS].reverse() : VIEWPORTS) {
            await page.setViewportSize(viewport);
            await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
            const label = `${state} (${note}) a ${viewport.width}px`;
            const tool = (await boxes(page, '#fo-tool-root'))[0];
            expect(tool, `${label}: a ferramenta na tela`).toBeDefined();
            // No content AdSlot above the tool, on a phone or a computer, in any state.
            for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${label}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
            if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
            for (const selector of PDF_ON_SCREEN[state]) expect((await boxes(page, selector)).length, `${label}: ${selector} na tela`).toBeGreaterThan(0);
            await expectAdsOutsideThePanel(page, label, adCount);
            smallest.push(`${viewport.width}px ${(await expectClearance(page, label, PDF_TARGETS)).toFixed(0)}`);
          }
          flip = !flip;
          gaps.push(`${state}: ${smallest.join(', ')}`);
        },
        { hold: true, lang },
      );
      console.log(`${path} menor vão: ${gaps.join(' | ')}`);
    });
  }
});

// The PDF hub, like the image and the money hubs: one content AdSlot under the grid of tools (never above them on a
// phone), the rail from 1280px, and 150px from the grid and from every Oli on screen.
test('the PDF hub keeps its one content AdSlot under the grid of tools, at 360 and 1280px', async ({ page }) => {
  // F6: in the three languages.
  for (const path of (['en', ...TRANSLATED] as const).map((lang) => routeById(PDF_HUB_ID).paths[lang] ?? '')) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(page.locator('.fo-ad--content')).toHaveCount(1);
      await expect(page.locator('.fo-ad--rail')).toHaveCount(1);
      const grid = await page.locator('main .fo-grid').boundingBox();
      const ad = await page.locator('.fo-ad--content').boundingBox();
      expect(grid && ad, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      expect(ad!.y, `${path} ${viewport.width}px: AdSlot acima da grade`).toBeGreaterThanOrEqual(grid!.y + grid!.height);
      await expectClearance(page, `${path} a ${viewport.width}px`, '.fo-grid, .fo-tool, [data-oli]');
    }
  }
});

// F5b (prompt decision 7): every file guide, at 360x740 and 1280x800 on one load, with the embedded tool at rest and with
// a result. The guide is the tool page's island with text around it, so the targets are the tool's own (TARGETS, and the
// PDF ones for a PDF guide). No AdSlot above the tool on a phone or a computer, none inside the island, and 150px from
// every target. A PDF guide walks the tool through the same states as its own page (tests/e2e/lib/pdf-states.ts).
const GUIDE_ON_SCREEN: Partial<Record<FileGuideId, string[]>> = {
  'guides-heic-to-jpg-on-windows': ['.fo-ba'],
  'guides-open-webp-save-as-jpg': ['.fo-ba'],
  'guides-social-media-image-sizes': ['#rz-width', '#rz-height', '.fo-input'],
  // The location guide starts Resize image at By percentage, 100 (DECISOES § 186).
  'guides-remove-location-from-photos': ['#rz-percent', '.fo-input'],
};

async function guideSpots(page: Page, label: string, adCount: number, selector: string): Promise<number> {
  let min = Infinity;
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
    const at = `${label} a ${viewport.width}px`;
    const tool = (await boxes(page, '#fo-tool-root'))[0];
    expect(tool, `${at}: a ferramenta na tela`).toBeDefined();
    for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${at}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
    if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
    await expectAdsOutsideThePanel(page, at, adCount);
    min = Math.min(min, await expectClearance(page, at, selector));
  }
  return min;
}

test.describe('distância dos anúncios nos guias de arquivo, a 360×740 e a 1280×800', () => {
  for (const id of FILE_GUIDE_IDS) {
    const guide = FILE_GUIDES[id];
    test(`${guide.path}: with the tool at rest and with a result`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS[0]);
      const gaps: string[] = [];
      if (isPdfTool(guide.tool)) {
        let adCount = 0;
        await walkPdfTool(
          page,
          guide.tool,
          async (state, note) => {
            if (state === 'rest') adCount = await page.locator('.fo-ad').count();
            gaps.push(`${state}: ${(await guideSpots(page, `${state} (${note})`, adCount, PDF_TARGETS)).toFixed(0)}`);
          },
          { hold: false, path: guide.path },
        );
        expect(gaps.some((gap) => gap.startsWith('result')), 'o passeio chegou ao resultado').toBe(true);
      } else {
        expect((await page.goto(guide.path))?.status()).toBe(200);
        await hydrated(page);
        await dismissCookies(page);
        const adCount = await page.locator('.fo-ad').count();
        expect(adCount).toBeGreaterThan(0);
        gaps.push(`repouso: ${(await guideSpots(page, 'repouso', adCount, TARGETS)).toFixed(0)}`);
        const toolPath = routeById(guide.tool).paths.en ?? '/';
        await chooseImages(page, await smallFiles(page, toolPath, 1));
        await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
        for (const selector of GUIDE_ON_SCREEN[id] ?? []) expect((await boxes(page, selector)).length, `${selector} na tela com o resultado`).toBeGreaterThan(0);
        gaps.push(`resultado: ${(await guideSpots(page, 'resultado', adCount, TARGETS)).toFixed(0)}`);
      }
      console.log(`${guide.path} menor vão: ${gaps.join(' | ')}`);
    });
  }
});

// The line that links a tool to its guide sits outside the panel and 150px from both AdSlots (prompt decision 6).
test('the guide line of each embedded tool stays 150px from every AdSlot, at 360 and 1280px', async ({ page }) => {
  const tools = [...new Set(FILE_GUIDE_IDS.map((id) => FILE_GUIDES[id].tool))];
  for (const tool of tools) {
    const path = routeById(tool).paths.en ?? '/';
    expect((await page.goto(path))?.status(), path).toBe(200);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(page.locator('.fo-guide-links a').first(), `${path}: a linha do guia`).toBeVisible();
      expect(await page.locator('#fo-tool-root .fo-guide-links').count(), `${path}: a linha dentro do painel`).toBe(0);
      await expectClearance(page, `${path} a ${viewport.width}px`, '.fo-guide-links');
    }
  }
});
