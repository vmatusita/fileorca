import { expect, test, type Page } from '@playwright/test';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// F14 (PLANO-UX-QV.md, criterion 11; DECISOES § 624 to § 626): axe with the page view open, in "Fit" and in "Enlarge", at
// 360 and 1280 px, in the dark and the light theme, in the five grid tools, on the result ("View the new PDF") and on a
// row of the Merge list. A spec of its own, as the walks of axe-pdf-states.spec.ts (§ 307): its name falls in a light part.
// F18: and in Organize PDF, with its two actions.

const MIXED = 'gen-paginas-mistas.pdf';
const root = (page: Page) => page.locator('#fo-tool-root');
const view = (page: Page) => root(page).locator('.fo-pview');
const option = (page: Page, label: string) => root(page).locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const optionsOf = (id: string): Record<string, string> => (PDF_TOOL_TEXTS.en[id as 'split-pdf'].panel as unknown as { options: Record<string, string> }).options;
const texts = PDF_PANEL_TEXTS.en.view;

/** axe in "Fit" and in "Enlarge" on the view open now, everywhere. */
async function bothModes(page: Page): Promise<string[]> {
  await expect(view(page).locator('.fo-pview__title')).toBeFocused();
  await expect.poll(() => view(page).locator('.fo-pview__img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 }).toBe(true);
  const found = (await violationsEverywhere(page)).map((line) => `Fit · ${line}`);
  await view(page).getByRole('button', { name: texts.enlarge, exact: true }).click();
  await expect(view(page).locator('.fo-pview__frame')).toHaveAttribute('data-zoom', '');
  found.push(...(await violationsEverywhere(page)).map((line) => `Enlarge · ${line}`));
  return found;
}

test.describe('axe with the page view open, in "Fit" and "Enlarge", at 360 and 1280 px, in both themes', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const id of ['delete-pdf-pages', 'split-pdf', 'rotate-pdf', 'sign-pdf', 'reorder-pdf-pages'] as const) {
    test(`${id}: the view of a page of the grid, with its action picked or turned`, async ({ page }) => {
      await openTool(page, `/${id}/`);
      await choosePdfs(page, [pdfFile(MIXED)]);
      if (id === 'rotate-pdf') {
        await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
        await root(page).locator('.fo-adjust > summary').click();
        await option(page, optionsOf(id)['pick'] ?? '');
      } else {
        await expect(root(page).locator('.fo-ready:not(.fo-ready--reading)')).toBeVisible({ timeout: 30_000 });
        if (id === 'split-pdf') await option(page, optionsOf(id)['pick'] ?? '');
        if (id === 'sign-pdf') await option(page, optionsOf(id)['pickPages'] ?? '');
      }
      const cells = root(page).locator('.fo-pages__grid > li');
      await expect(cells).toHaveCount(8, { timeout: 30_000 });
      await cells.nth(3).locator('.fo-page__zoom').click();
      // The pressed state of the action is measured too (its colours), except in Reorder, which has none.
      const act = view(page).locator('.fo-pview__act');
      if (id !== 'reorder-pdf-pages') {
        await act.click();
        if (id === 'rotate-pdf') await expect(view(page).locator('.fo-pview__img')).toHaveAttribute('data-turn', '1', { timeout: 30_000 });
        else await expect(act).toHaveAttribute('aria-pressed', 'true');
        await view(page).locator('.fo-pview__title').focus();
      }
      expect(await bothModes(page)).toEqual([]);
    });
  }

  // F18 (decision 19): Organize PDF, with its two actions, the page turned and taken out (the pressed state measured too).
  test('organize-pdf: the view of a page of the grid, turned and taken out', async ({ page }) => {
    await openTool(page, '/organize-pdf/');
    await choosePdfs(page, [pdfFile(MIXED)]);
    await expect(root(page).locator('.fo-ready:not(.fo-ready--reading)')).toBeVisible({ timeout: 30_000 });
    const cells = root(page).locator('.fo-pages__grid > li');
    await expect(cells).toHaveCount(8, { timeout: 30_000 });
    await cells.nth(3).locator('.fo-page__zoom').click();
    await view(page).getByRole('button', { name: texts.turn, exact: true }).click();
    await expect(view(page).locator('.fo-pview__img')).toHaveAttribute('data-turn', '1', { timeout: 30_000 });
    const remove = view(page).getByRole('button', { name: texts.remove, exact: true });
    await remove.click();
    await expect(remove).toHaveAttribute('aria-pressed', 'true');
    await view(page).locator('.fo-pview__title').focus();
    expect(await bothModes(page)).toEqual([]);
  });

  test('the view of the result, from "View the new PDF"', async ({ page }) => {
    await openTool(page, '/add-page-numbers-to-pdf/');
    await choosePdfs(page, [pdfFile(MIXED)]);
    await root(page).getByRole('button', { name: texts.openResult, exact: true }).click({ timeout: 60_000 });
    expect(await bothModes(page)).toEqual([]);
  });

  test('the view of a file of the Merge list, from "View pages of {name}"', async ({ page }) => {
    await openTool(page, '/merge-pdf/');
    await choosePdfs(page, [pdfFile(MIXED), pdfFile('gen-ja-otimizado.pdf')]);
    await expect(root(page).locator('.fo-merge-panel .fo-btn--brand')).toBeVisible({ timeout: 30_000 });
    await root(page).locator('.fo-merge__view').first().click();
    expect(await bothModes(page)).toEqual([]);
  });
});
