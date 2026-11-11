import { expect, test, type Page } from '@playwright/test';
import { routeById } from '../../src/i18n/routes.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { CLEARANCE, RAIL, TARGETS, VIEWPORTS, boxes, distance, expectAdsOutsideThePanel, expectClearance } from './lib/ad-clearance.ts';
import { densityOf, frames, measureMap } from './lib/ad-map.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';
import { useTestBuild } from './lib/test-build.ts';

// F18 (decision 19 of the prompt; DECISOES § 727): the ads around Organize PDF, as the criterion 4 of the F14 (§ 634) for
// the other grid tools, on the test build (fake ids in every unit of the map). In en, pt and es, at 360 × 740 and at
// 1280 × 800: the grid with its bar (two pages picked, turned and taken out), then the page view in "Fit" and in
// "Enlarge" with its two actions pressed. Every control (the bar, the arrows, the trash, the magnifier, the buttons and
// the frame of the view, the picture seen) stays 150 px from every ad, no ad is inside the island, nothing is above the
// tool on the phone, nothing of the site is over a simulated AdSense anchor (fixed at the foot, 100 px), and the density
// of § 351 at 360 × 740 stays at 30 % or less. A file of its own named "ads-*": it falls in the part of ads.spec.ts, which
// pays the test build once.
useTestBuild(test);

const DENSITY = 0.3;
const TARGETS_HERE = `${TARGETS}, .fo-pdf-island, .fo-ready, .fo-pages, .fo-pages__bar, .fo-pages__act, .fo-pages__grid, .fo-page, .fo-page__main, .fo-page__moves, .fo-page__badge`;

/** Nothing of the site over the anchor: every point of it gives the anchor, with each part brought under it. */
async function expectAnchorOnTop(page: Page, label: string, parts: string[]): Promise<void> {
  await page.evaluate(() => {
    const anchor = document.createElement('ins');
    anchor.className = 'adsbygoogle';
    anchor.id = 'fo-test-anchor';
    anchor.setAttribute('data-anchor-status', 'displayed');
    anchor.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:100px;display:block';
    document.body.append(anchor);
  });
  for (const part of parts) {
    const covered = await page.evaluate((selector) => {
      const element = document.querySelector(`#fo-tool-root ${selector}`);
      const anchor = document.getElementById('fo-test-anchor');
      if (!element || !anchor) return ['missing'];
      const box = element.getBoundingClientRect();
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

/** At both sizes of the window: the 150 px, the ads outside the island and above nothing of the tool, the density, the anchor. */
async function measure(page: Page, label: string, adCount: number, gaps: string[], selectors: string[], anchorParts: string[]): Promise<void> {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await frames(page);
    const at = `${label}, ${viewport.width}px`;
    for (const selector of selectors) expect((await boxes(page, selector)).length, `${at}: ${selector} na tela`).toBeGreaterThan(0);
    const tool = (await boxes(page, '#fo-tool-root'))[0];
    for (const ad of await boxes(page, '.fo-ad--content')) expect(ad.y, `${at}: AdSlot acima da ferramenta`).toBeGreaterThan((tool?.y ?? 0) + (tool?.h ?? 0));
    if (viewport.width >= 1280) await expect(page.locator(RAIL)).toBeVisible();
    await expectAdsOutsideThePanel(page, at, adCount);
    const least = await expectClearance(page, at, TARGETS_HERE);
    const ads = await boxes(page, '.fo-ad');
    const parts = [];
    for (const selector of selectors) {
      const found = await boxes(page, selector);
      parts.push(`${selector} ${Math.min(...found.flatMap((box) => ads.map((ad) => distance(ad, box)))).toFixed(0)}`);
    }
    if (viewport.width === 360) {
      const density = densityOf(await measureMap(page));
      expect(density, `${at}: densidade`).toBeLessThanOrEqual(DENSITY);
      parts.push(`densidade ${(density * 100).toFixed(1)} %`);
    }
    gaps.push(`${at}: ${least.toFixed(0)} (${parts.join(', ')})`);
    await expectAnchorOnTop(page, at, anchorParts);
  }
  await page.setViewportSize(VIEWPORTS[0]);
}

test.describe('distância e densidade dos anúncios no Organizar PDF, com a barra e com a vista aberta', () => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    const path = routeById('organize-pdf').paths[lang] ?? '';
    test(`${path}: the bar, the cells and the page view in "Fit" and "Enlarge", 150px from every ad, under the anchor, 30 % at most`, async ({ page }) => {
      test.setTimeout(180_000);
      const words = PDF_PANEL_TEXTS[lang];
      const gaps: string[] = [];
      await page.setViewportSize(VIEWPORTS[0]);
      await openTool(page, path);
      const adCount = await page.locator('.fo-ad').count();
      expect(adCount, 'AdSlots da página').toBeGreaterThan(0);
      const root = page.locator('#fo-tool-root');
      await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
      await expect(root.locator('.fo-ready:not(.fo-ready--reading)')).toBeVisible({ timeout: 30_000 });
      const cells = root.locator('.fo-pages__grid > li');
      await expect(cells).toHaveCount(8, { timeout: 30_000 });
      await cells.nth(1).locator('.fo-page__main').click();
      await cells.nth(3).locator('.fo-page__main').click();
      await root.locator('.fo-pages__act--right').click();
      await root.locator('.fo-pages__act--out').click();
      await expect(root.locator('.fo-page[data-leaving="true"]')).toHaveCount(2);
      await measure(page, `${path} grade`, adCount, gaps, ['.fo-pages__act', '.fo-page__moves', '.fo-page__badge--out', '.fo-page__zoom', '.fo-pages .fo-seg'], ['.fo-pages__acts', '.fo-pages__grid']);
      await cells.nth(1).locator('.fo-page__zoom').click();
      const view = root.locator('.fo-pview');
      await view.getByRole('button', { name: words.view.turn, exact: true }).click();
      await expect(view.getByRole('button', { name: words.view.remove, exact: true })).toHaveAttribute('aria-pressed', 'true');
      for (const mode of ['Fit', 'Enlarge'] as const) {
        if (mode === 'Enlarge') await view.getByRole('button', { name: words.view.enlarge, exact: true }).click();
        await expect(view.locator('.fo-pview__img')).toBeVisible({ timeout: 30_000 });
        await view.scrollIntoViewIfNeeded();
        await measure(page, `${path} vista, ${mode}`, adCount, gaps, ['.fo-pview .fo-btn', '.fo-pview__frame', '.fo-pview__act'], ['.fo-pview__bar', '.fo-pview__frame', '.fo-pview__top']);
        // The picture as seen: enlarged, its box passes the frame that scrolls, and the part on screen is inside the frame.
        for (const viewport of VIEWPORTS) {
          await page.setViewportSize(viewport);
          await frames(page);
          await view.scrollIntoViewIfNeeded();
          const seen = await view.evaluate((element) => {
            const frame = (element.querySelector('.fo-pview__frame') as HTMLElement).getBoundingClientRect();
            const img = (element.querySelector('.fo-pview__img') as HTMLElement).getBoundingClientRect();
            const left = Math.max(frame.left, img.left);
            const top = Math.max(frame.top, img.top);
            return { kind: 'fo-pview__img (seen)', x: left + scrollX, y: top + scrollY, w: Math.min(frame.right, img.right) - left, h: Math.min(frame.bottom, img.bottom) - top };
          });
          expect(seen.w * seen.h, `${path} ${mode} ${viewport.width}px: the picture on screen`).toBeGreaterThan(0);
          for (const ad of await boxes(page, '.fo-ad')) expect(distance(ad, seen), `${path} ${mode} ${viewport.width}px: AdSlot a ${distance(ad, seen).toFixed(0)}px da página vista`).toBeGreaterThanOrEqual(CLEARANCE);
        }
        await page.setViewportSize(VIEWPORTS[0]);
      }
      console.log(`${path} menor vão: ${gaps.join(' | ')}`);
    });
  }
});
