import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS, HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS, LIFE_CALC_PAGES, guidePathIn, moneyPage } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { visible } from '../../src/tools/calc/form.ts';
import type { ChoiceSpec, FieldSpec } from '../../src/tools/calc/types.ts';
import { PDF_HUB_ID, PDF_PAGES } from '../../src/tools/pdf/registry.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { LANGS, QR_ID, ROUTES, moneyHubId, routeById } from '../../src/i18n/routes.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, type FileGuideId } from '../../src/tools/guides/registry.ts';
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

async function expectClearance(page: Page, label: string, selector = TARGETS, adSelector = '.fo-ad'): Promise<number> {
  const ads = await boxes(page, adSelector);
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

// F11 (decision 5; DECISOES § 393 and § 400): the guides hub of each language is born with no AdSlot and no ad area.
test('legal, institutional, home, guides hub and 404 pages have no AdSlot and no ad code', async ({ page }) => {
  const paths = [
    '/', '/pt/', '/es/', '/privacy/', '/pt/privacidade/', '/es/privacidad/', '/terms/', '/pt/termos/', '/es/terminos/',
    '/about/', '/pt/sobre/', '/es/acerca-de/', '/contact/', '/pt/contato/', '/es/contacto/',
    '/licenses/', '/pt/licencas/', '/es/licencias/', '/support/', '/pt/apoie/', '/es/apoyo/', '/404.html', '/pt/404.html', '/es/404.html',
    ...LANGS.map((lang) => routeById(GUIDES_HUB_ID).paths[lang] ?? '/guides/'),
  ];
  expect(paths.slice(-3)).toEqual(['/guides/', '/pt/guias/', '/es/guias/']);
  for (const path of paths) {
    const response = await page.goto(path);
    if (!path.endsWith('404.html')) expect(response?.status(), path).toBe(200);
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

// F11 (decision 10 and criterion 8; DECISOES § 388 and § 391): the header. Every control of it (logo, search, language,
// theme, Menu) and every open menu (the Menu sheet and the language menu) is 150 px or more from every AdSlot, at 360,
// 767 and 1280 px, on every page that has AdSlots (the route map: each route with an ad area, in each of its languages), in blocks
// of pages. On the phone the sheet opens at the top of the page and the first AdSlot of each mold sits under it (the
// nearest, Merge PDF and Unlock PDF in English, at y 796).
// Header width adjustment (DECISOES § 409): from 1280 px the header runs over the rail, as the footer does, and the rail
// starts 150 px under the header, so every control stays 150 px or more from its AdSlot. An open menu covers the top of
// the rail: it keeps the 150 px from every other AdSlot, and while it is open the rail takes no pointer (the click that
// closes it lands on the body; review F11 B-2), which the test checks against a control with the menus closed.
// Review F11 D-1 (DECISOES § 404): 767 px too. Under 768 px the sheet keeps its height at every width, while the first
// AdSlot rises as the text of the page wraps less (Merge PDF and Unlock PDF in English: y 796 up to 384 px, y 776 from
// 390 px), so 767 px is where the open sheet and the first AdSlot of the phone layout come closest.
const HEADER_CONTROLS = '.fo-header > a, .fo-header > button';
const HEADER_AD_PAGES = ROUTES.filter((route) => route.adArea).flatMap((route) => LANGS.flatMap((lang) => route.paths[lang] ?? []));
const HEADER_AD_BLOCK = 15;
const HEADER_VIEWPORTS = [VIEWPORTS[0], { width: 767, height: 800 }, VIEWPORTS[1]] as const;
/** Whether a click on the AdSlot of the rail, 20 px under its top, reaches it (no rail on screen: no). */
const railTakesPointer = (page: Page) => page.evaluate(() => {
  const ad = document.querySelector('.fo-ad--rail');
  const rect = ad?.getBoundingClientRect();
  if (!ad || !rect || rect.width === 0) return false;
  return ad.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + 20));
});
test.describe('the header and its open menus stay 150px from every AdSlot, at 360, 767 and 1280px', () => {
  for (let start = 0; start < HEADER_AD_PAGES.length; start += HEADER_AD_BLOCK) {
    const block = HEADER_AD_PAGES.slice(start, start + HEADER_AD_BLOCK);
    test(`pages ${start + 1} to ${start + block.length} of ${HEADER_AD_PAGES.length} (${block[0]} and on)`, async ({ page }) => {
      // 15 pages, each opened and measured at three widths with the menus opened and closed: a budget of its own, as the
      // long tests of the calculators have, so a loaded runner does not end it at the default 60 s (review F11 D-2).
      test.setTimeout(120_000);
      for (const path of block) {
        expect((await page.goto(path))?.status(), path).toBe(200);
        for (const viewport of HEADER_VIEWPORTS) {
          await page.setViewportSize(viewport);
          await page.evaluate(() => scrollTo(0, 0));
          const label = `${path} ${viewport.width}px`;
          await expectClearance(page, `${label}, o cabeçalho`, HEADER_CONTROLS);
          // The rail is on screen from 1280 px, and with the menus closed a click reaches it (polled: the sheet that holds
          // the page after a menu closes stays 400 ms).
          const rail = viewport.width >= 1280 && (await page.locator('.fo-ad--rail').count()) > 0;
          await expect.poll(() => railTakesPointer(page), `${label}: a lateral recebe o clique com os menus fechados`).toBe(rail);
          await page.locator('.fo-header__menu').click();
          await expect(page.locator('#fo-menu')).toBeVisible();
          await expectClearance(page, `${label}, o Menu aberto`, `#fo-menu, ${HEADER_CONTROLS}`, '.fo-ad:not(.fo-ad--rail)');
          expect(await railTakesPointer(page), `${label}: a lateral recebe o clique com o Menu aberto`).toBe(false);
          await page.keyboard.press('Escape');
          await expect(page.locator('#fo-menu')).toBeHidden();
          // The language menu has its button from 768 px; under it, the languages are in the Menu, measured above.
          if (viewport.width >= 768) {
            await page.locator('.fo-header__lang').click();
            await expect(page.locator('#fo-langmenu')).toBeVisible();
            await expectClearance(page, `${label}, o menu de idioma aberto`, `#fo-langmenu, ${HEADER_CONTROLS}`, '.fo-ad:not(.fo-ad--rail)');
            expect(await railTakesPointer(page), `${label}: a lateral recebe o clique com o menu de idioma aberto`).toBe(false);
            await page.keyboard.press('Escape');
            await expect(page.locator('#fo-langmenu')).toBeHidden();
          }
        }
      }
    });
  }
});

// F4 (prompt decision 13): every calculator, preset and guide, at 360x740 and 1280x800 on one load, with the
// schedule closed and with one year open. Measured on top of TARGETS: the ResultHero, the three ExportBar buttons,
// the ScenarioCompare, the schedule section and its table. No AdSlot above the tool on a phone, inside the island,
// between the fields or inside the schedule; on a phone the result sits above the fold, right under the main fields.
const CALC_TARGETS = `${TARGETS}, .fo-rhero, .fo-export .fo-btn, .fo-compare, .fo-calc-schedule, .fo-amort-wrap, .fo-debt`;
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
          if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
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
        await expect(page.locator(`${field}-error`)).toBeVisible();
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
const QR_TARGETS = `${TARGETS}, .fo-qr, .fo-qr__form, .fo-qr__preview, .fo-qr__code, .fo-qr__oli, .fo-qr__actions, .fo-qr__out, .fo-btn, .fo-field__error`;

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
        if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
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
test('the home and health hubs keep their one content AdSlot under the grid of calculators, at 360 and 1280px', async ({ page }) => {
  for (const id of [HOUSE_HUB_ID, HEALTH_HUB_ID] as const) {
    const route = routeById(id);
    const path = route.paths.en ?? '';
    expect(route.adArea, `${path}: área de anúncio`).toBe('casa-saude');
    expect((await page.goto(path))?.status(), path).toBe(200);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(page.locator('.fo-ad--content')).toHaveCount(1);
      await expect(page.locator('.fo-ad--rail')).toHaveCount(1);
      await expect(page.locator('.fo-ad[data-ad-area="casa-saude"]')).toHaveCount(2);
      const grids = await boxes(page, 'main .fo-grid');
      const ad = await page.locator('.fo-ad--content').boundingBox();
      const last = grids.at(-1);
      expect(last && ad, `${path} ${viewport.width}px: a grade e o AdSlot na tela`).toBeTruthy();
      expect(ad!.y, `${path} ${viewport.width}px: AdSlot acima da grade`).toBeGreaterThanOrEqual(last!.y + last!.h);
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

// Languages adjustment (decision 5): the 30 guides, each at its path in its language (FILE_GUIDES[id].paths), with the tool
// of the language: the PDF walk reads the labels of the language, and the small file of an image tool is the one of its
// English page (SMALL_OF is keyed by the English path).
test.describe('distância dos anúncios nos guias de arquivo, a 360×740 e a 1280×800', () => {
  for (const lang of LANGS) {
    for (const id of FILE_GUIDE_IDS) {
      const guide = FILE_GUIDES[id];
      const path = guide.paths[lang];
      test(`${path}: with the tool at rest and with a result`, async ({ page }) => {
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
            { hold: false, path, lang },
          );
          expect(gaps.some((gap) => gap.startsWith('result')), 'o passeio chegou ao resultado').toBe(true);
        } else {
          expect((await page.goto(path))?.status()).toBe(200);
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
        console.log(`${path} menor vão: ${gaps.join(' | ')}`);
      });
    }
  }
});

// The link from a tool to its guide sits outside the panel and 150px from both AdSlots (prompt decision 6). Languages
// adjustment: the tool pages of pt and es link to the guides of their language too, one test per language. F11 (decision 7;
// DECISOES § 396 and § 400): the link is the GuideCard (--here) at the end of the "How to" block, and the calculators that a
// guide embeds have it too (en and es), so the card is the target, on the tools and on those calculators.
for (const lang of LANGS) {
  const title = 'the guide card of each tool and calculator a guide embeds stays 150px from every AdSlot, at 360 and 1280px';
  test(lang === 'en' ? title : `${title} (${lang})`, async ({ page }) => {
    const tools = [...new Set(FILE_GUIDE_IDS.map((id) => FILE_GUIDES[id].tool))].map((tool) => routeById(tool).paths[lang] ?? '/');
    const calcs = CALC_PAGE_IDS.flatMap((id) => {
      const guide = CALC_PAGES[id].guide;
      const page = moneyPage(id, lang);
      return guide && page && guidePathIn(guide, lang) !== null ? [page.path] : [];
    });
    expect(calcs.length, `${lang}: as calculadoras com guia`).toBe(lang === 'pt' ? 0 : 6);
    for (const path of [...tools, ...calcs]) {
      expect((await page.goto(path))?.status(), path).toBe(200);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await expect(page.locator('section[data-content="how"] .fo-guidecard').first(), `${path}: o cartão do guia`).toBeVisible();
        expect(await page.locator('#fo-tool-root .fo-guidecard').count(), `${path}: o cartão dentro do painel`).toBe(0);
        await expectClearance(page, `${path} a ${viewport.width}px`, '.fo-guidecard');
      }
    }
  });
}
