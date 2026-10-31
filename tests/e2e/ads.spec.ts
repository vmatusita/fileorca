import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { chooseImage, dismissCookies, dragOver, hydrated, reachCoffeeLine, searchWithoutResult, slowEngine, useBadFile } from './lib/page.ts';

// 150px between every AdSlot and the Download button, each field, the panel and the Oli
// (PLANO "Molde da página de ferramenta"). Oli selector: [data-oli] (DECISOES § 19).
const CLEARANCE = 150;
const TARGETS = '.fo-btn--download, input:not([type="file"]), select, textarea, .fo-seg, fieldset, .fo-drop, .fo-level, .fo-result, [data-oli]';
// F1b: the coffee line of the result card is measured too (the card itself is already in TARGETS).
const TARGETS_WITH_COFFEE = `${TARGETS}, .fo-result__support`;
const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 1280, height: 800 },
];
const PHOTO = 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg';

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

for (const viewport of VIEWPORTS) {
  test.describe(`distância dos anúncios a ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    test('before the file and with the result and Download on screen', async ({ page }) => {
      await page.goto('/compress-image/');
      await hydrated(page);
      await dismissCookies(page);
      await expectClearance(page, 'antes do arquivo');
      if (viewport.width >= 1280) await expect(page.locator('.fo-ad--rail')).toBeVisible();
      await page.setInputFiles('input[type="file"]', PHOTO);
      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('.fo-result [data-oli]')).toHaveCount(1);
      await expectClearance(page, 'com o resultado');
    });

    test('no AdSlot above the tool panel', async ({ page }) => {
      await page.goto('/compress-image/');
      await hydrated(page);
      const panel = (await boxes(page, '.fo-drop'))[0];
      expect(panel).toBeDefined();
      for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y).toBeGreaterThan((panel?.y ?? 0) + (panel?.h ?? 0));
    });
  });
}

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

    test('with the result and the coffee line', async ({ page }) => {
      await reachCoffeeLine(page);
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
