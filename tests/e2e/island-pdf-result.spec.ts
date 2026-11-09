import { expect, test, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import { routeById, type Lang } from '../../src/i18n/routes.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';
import { walkPdfTool } from './lib/pdf-states.ts';

// F14 (PLANO-UX-QV.md, items 6 and 7, section A; DECISOES § 625 and § 626). Criterion 6: "View the new PDF" is on every
// result that is one PDF with no password (Split with one part too), never on Protect, PDF to JPG or a ZIP, in the 12 PDF
// tools; the rectangle keeps 356 px at 320 and 360 px and 340 px at 1280 px with it, in the three languages. The view of
// the result opens first in the band, shows the pages of the new PDF and gives the focus back to its button. The Merge
// list: "View pages of {name}" in the actions of each read row, 48 px, under the card below 480 px, never on a refused
// row; its view opens first in the band and gives the focus back to the button of its row.

const root = (page: Page) => page.locator('#fo-tool-root');
const view = (page: Page) => root(page).locator('.fo-pview');
const heading = (page: Page) => view(page).locator('.fo-pview__title');
const LANGS: readonly Lang[] = ['en', 'pt', 'es'];
const WIDTHS = [
  { width: 320, slot: 356 },
  { width: 360, slot: 356 },
  { width: 1280, slot: 340 },
] as const;
const frames = (page: Page) => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));

test.describe('criterion 6: "View the new PDF" on every result that is one PDF with no password, with the rectangle of always', () => {
  for (const lang of LANGS) {
    for (const id of PDF_TOOL_IDS) {
      test(`${routeById(id).paths[lang] ?? ''}: the button where the result is one PDF with no password, and the rectangle at 320, 360 and 1280 px`, async ({ page }) => {
        const texts = PDF_PANEL_TEXTS[lang].view;
        const seen: string[] = [];
        await page.setViewportSize({ width: 360, height: 740 });
        await walkPdfTool(
          page,
          id,
          async (state, note) => {
            if (state !== 'result') return;
            const name = (await root(page).locator('.fo-btn--download').getAttribute('download')) ?? '';
            const button = root(page).locator('.fo-result__more > .fo-result__view');
            const wanted = name.endsWith('.pdf') && id !== 'protect-pdf';
            await expect(button, `${note}: ${name}`).toHaveCount(wanted ? 1 : 0);
            if (wanted) {
              await expect(button).toHaveText(texts.openResult);
              await expect(button).toHaveAttribute('aria-expanded', 'false');
              // After Start over, which the tests press as the first button of the row.
              await expect(root(page).locator('.fo-result__more > button:first-child')).toHaveText(PDF_PANEL_TEXTS[lang].result.startOver);
            }
            for (const { width, slot } of WIDTHS) {
              await page.setViewportSize({ width, height: 740 });
              await frames(page);
              const measured = await root(page).evaluate((element) => {
                const rect = (selector: string) => element.querySelector(selector)?.getBoundingClientRect();
                const buttons = [...element.querySelectorAll('.fo-result__more > .fo-btn')].map((button) => button.getBoundingClientRect());
                const row = buttons.length ? Math.max(...buttons.map((box) => box.right)) - Math.min(...buttons.map((box) => box.left)) : 0;
                return { slot: rect('.fo-slot')?.height ?? 0, rows: new Set(buttons.map((box) => Math.round(box.top))).size, row, room: rect('.fo-result__actions')?.width ?? 0, scroll: document.documentElement.scrollWidth <= innerWidth };
              });
              expect(Math.abs(measured.slot - slot), `${note} at ${width} px: the rectangle is ${measured.slot}`).toBeLessThanOrEqual(1);
              expect(measured.scroll).toBe(true);
              // The row of Start over and the view is one line here, with a few px to spare in Spanish at 320 px; the wider
              // fonts of another system may break it (DECISOES § 625). Broken in two on purpose, the rectangle still holds.
              const broken = await page.evaluate(async () => {
                const style = document.head.appendChild(document.createElement('style'));
                style.textContent = '#fo-tool-root .fo-result__more { flex-direction: column; align-items: center; }';
                await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null))));
                const height = document.querySelector('#fo-tool-root .fo-slot')?.getBoundingClientRect().height ?? 0;
                style.remove();
                return height;
              });
              seen.push(`${note} ${width}px: ${measured.slot.toFixed(1)} px, ${measured.rows} row(s) of ${measured.row.toFixed(0)} of ${measured.room.toFixed(0)} px, ${broken.toFixed(1)} px in two rows`);
              expect(Math.abs(broken - slot), `${note} at ${width} px, the row in two: the rectangle is ${broken}`).toBeLessThanOrEqual(1);
            }
            await page.setViewportSize({ width: 360, height: 740 });
          },
          { hold: false, lang },
        );
        console.log(`[criterion 6] ${lang} ${id}: ${seen.join(' | ')}`);
      });
    }
  }

  test('a ZIP never has the button: Split by every page, and PDF to JPG of many pages', async ({ page }) => {
    await openTool(page, '/split-pdf/');
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
    await root(page).locator('.fo-ready .fo-btn--brand').click({ timeout: 30_000 });
    await expect(root(page).locator('.fo-btn--download')).toHaveAttribute('download', /\.zip$/, { timeout: 60_000 });
    await expect(root(page).locator('.fo-result__view')).toHaveCount(0);
    await openTool(page, '/pdf-to-jpg/');
    await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
    await expect(root(page).locator('.fo-btn--download')).toHaveAttribute('download', /\.zip$/, { timeout: 60_000 });
    await expect(root(page).locator('.fo-result__view')).toHaveCount(0);
  });
});

test.describe('the view of the result', () => {
  test('Delete: the new PDF opens first in the band, with its own pages, and Esc gives the focus back to the button', async ({ page }) => {
    const texts = PDF_PANEL_TEXTS.en.view;
    await openTool(page, '/delete-pdf-pages/');
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
    const action = root(page).locator('.fo-ready .fo-btn--brand');
    await expect(action).toBeFocused({ timeout: 30_000 });
    const cells = root(page).locator('.fo-pages__grid > li');
    await cells.nth(1).locator('.fo-page__main').click();
    await cells.nth(3).locator('.fo-page__main').click();
    await action.click();
    const button = root(page).getByRole('button', { name: texts.openResult, exact: true });
    await button.click({ timeout: 60_000 });
    await expect(heading(page)).toBeFocused();
    await expect(heading(page)).toHaveText(fmt(texts.title, { n: 1, total: 6 }));
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    // The first item of the band, before the chips; only to see: Previous and Next, no action.
    expect(await root(page).locator('.fo-band').evaluate((band) => band.firstElementChild?.classList.contains('fo-pview'))).toBe(true);
    await expect(view(page).locator('.fo-pview__bar').getByRole('button')).toHaveCount(2);
    await expect.poll(() => view(page).locator('.fo-pview__img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 }).toBe(true);
    await page.keyboard.press('End');
    await expect(heading(page)).toHaveText(fmt(texts.title, { n: 6, total: 6 }));
    // The grid of the file is still there, under the view: the view of the result is its own.
    await expect(cells).toHaveCount(8);
    await page.keyboard.press('Escape');
    await expect(view(page)).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    // A change of the picks makes the result an old one: its view goes.
    await button.click();
    await expect(heading(page)).toBeFocused();
    await cells.nth(5).locator('.fo-page__main').click();
    await expect(view(page)).toHaveCount(0);
    await expect(root(page).locator('.fo-ready .fo-btn--brand')).toBeVisible();
  });

  test('Compress: Start over closes the view of the result and the focus goes to Choose', async ({ page }) => {
    await openTool(page, '/compress-pdf/');
    await choosePdfs(page, [pdfFile('gen-fotos.pdf')]);
    const button = root(page).getByRole('button', { name: PDF_PANEL_TEXTS.en.view.openResult, exact: true });
    await button.click({ timeout: 60_000 });
    await expect(heading(page)).toHaveText(fmt(PDF_PANEL_TEXTS.en.view.title, { n: 1, total: 4 }));
    await root(page).locator('.fo-result__more > button:first-child').click();
    await expect(view(page)).toHaveCount(0);
    await expect(root(page).locator('.fo-drop .fo-btn--brand')).toBeFocused();
  });
});

test.describe('the Merge list: "View pages of {name}"', () => {
  for (const { width, height, row } of [
    { width: 360, height: 740, row: 154 },
    { width: 1280, height: 800, row: 76 },
  ]) {
    test(`at ${width} px: a button of 48 px on each read row (under the card below 480 px), none on a refused one, and its view`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      const texts = PDF_PANEL_TEXTS.en.view;
      await openTool(page, '/merge-pdf/');
      await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf'), pdfFile('gen-vazio.pdf')]);
      const rows = root(page).locator('.fo-merge > .fo-merge__row');
      await expect(root(page).locator('.fo-merge-panel .fo-btn--brand')).toBeVisible({ timeout: 30_000 });
      await expect(rows).toHaveCount(3);
      const buttons = root(page).locator('.fo-merge__view');
      await expect(buttons).toHaveCount(2);
      await expect(rows.nth(2).locator('.fo-merge__view, .fo-merge__gap')).toHaveCount(0);
      await expect(buttons.nth(1)).toHaveAccessibleName(fmt(texts.openFile, { name: 'gen-ja-otimizado.pdf' }));
      const placed = await rows.evaluateAll((items) =>
        items.slice(0, 2).map((item) => {
          const card = (item.querySelector('.fo-file') as HTMLElement).getBoundingClientRect();
          const button = (item.querySelector('.fo-merge__view') as HTMLElement).getBoundingClientRect();
          const remove = (item.querySelector('.fo-merge__remove') as HTMLElement).getBoundingClientRect();
          return { w: button.width, h: button.height, below: button.top >= card.bottom - 1, after: button.left >= remove.right - 1, row: item.getBoundingClientRect().height };
        }),
      );
      for (const one of placed) {
        expect(one.w).toBeGreaterThanOrEqual(47.5);
        expect(one.h).toBeGreaterThanOrEqual(47.5);
        expect(one.below).toBe(width < 480);
        expect(one.after).toBe(true);
        expect(Math.abs(one.row - row)).toBeLessThanOrEqual(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await buttons.nth(1).click();
      await expect(heading(page)).toBeFocused();
      await expect(heading(page)).toHaveText(fmt(texts.title, { n: 1, total: 12 }));
      expect(await root(page).locator('.fo-band').evaluate((band) => band.firstElementChild?.classList.contains('fo-pview'))).toBe(true);
      await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
      await expect.poll(() => view(page).locator('.fo-pview__img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 }).toBe(true);
      await page.keyboard.press('ArrowRight');
      await expect(heading(page)).toHaveText(fmt(texts.title, { n: 2, total: 12 }));
      await page.keyboard.press('Escape');
      await expect(view(page)).toHaveCount(0);
      await expect(buttons.nth(1)).toBeFocused();
      // The row that leaves takes its view with it.
      await buttons.nth(0).click();
      await expect(heading(page)).toHaveText(fmt(texts.title, { n: 1, total: 8 }));
      await rows.nth(0).locator('.fo-merge__remove').click();
      await expect(view(page)).toHaveCount(0);
      await expect(root(page).locator('.fo-merge__undo')).toBeVisible();
    });
  }
});
