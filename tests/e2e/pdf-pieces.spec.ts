import { expect, test, type Page } from '@playwright/test';
import panel from '../../src/tools/pdf/i18n/en.ts';
import reorderTexts from '../../src/tools/reorder-pdf-pages/i18n/en.ts';
import numbersTexts from '../../src/tools/add-page-numbers-to-pdf/i18n/en.ts';
import signTexts from '../../src/tools/sign-pdf/i18n/en.ts';
import compressTexts from '../../src/tools/compress-pdf/i18n/en.ts';
import { PDF_WALKS, walkPdfTool } from './lib/pdf-states.ts';
import { choosePdfs, filesOf, openTool, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';

// F13a (UX-11 A, pdf-pieces; DECISOES § F13A-P-08 and § F13A-P-09): the pieces the 12 PDF tools share, one test per row of
// the table "Testes da F13" of the specification (F5a D-6, D-7, D-8, D-9, D-10, D-11, D-12, F-5, F-6, F-7, F-8, F-10, F-11,
// F-13, F-14 and D-23). The Vitest half of D-10 is tests/unit/pdf-pieces-texts.test.ts.

/** Clicks the label of a segmented option (the radio itself is hidden). */
const option = (page: Page, label: string) => page.locator('#fo-tool-root .fo-seg__opt').filter({ hasText: label }).first().click();
/** The colour a token takes on this page, in the theme on screen, as the browser writes it. */
const tokenColor = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);

/** Sign PDF with a file read and a typed signature on the preview: the box is on screen. */
async function signReady(page: Page): Promise<void> {
  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.getByRole('button', { name: 'Sign PDF', exact: true })).toBeFocused({ timeout: 30_000 });
  await option(page, signTexts.panel.options.type);
  const typed = page.getByLabel(signTexts.panel.options.typeLabel);
  await typed.fill('Orca Signer');
  await typed.blur();
  await expect(page.locator('#fo-tool-root .fo-sign__box')).toBeVisible({ timeout: 30_000 });
}

test('D-6: on the signature box, + (Shift and Equal) and = make the box 1 % wider each, never 10 %', async ({ page }) => {
  await signReady(page);
  const width = page.locator('#fo-sign-w');
  const before = Number(await width.inputValue());
  await page.locator('#fo-tool-root .fo-sign__box').focus();
  await page.keyboard.press('Shift+Equal');
  await expect(width).toHaveValue(String(before + 1));
  await page.keyboard.press('Equal');
  await expect(width).toHaveValue(String(before + 2));
  // Shift still makes the arrows go ten times further, and the help says so.
  const x = Number(await page.locator('#fo-sign-x').inputValue());
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(page.locator('#fo-sign-x')).toHaveValue(String(x - 10));
  await expect(page.locator('#fo-sign-box-help')).toHaveText(signTexts.panel.options.keyboardHelp);
});

test('D-9: the new position is said once, 400 ms after the last key, and the frame no longer clips the ring of the box', async ({ page }) => {
  await signReady(page);
  const box = page.locator('#fo-tool-root .fo-sign__box');
  const region = page.locator('#fo-sign-box-status');
  await expect(region).toHaveAttribute('role', 'status');
  await box.focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowRight');
  await expect(region).toHaveText('');
  await page.waitForTimeout(600);
  const x = await page.locator('#fo-sign-x').inputValue();
  await expect(region).toHaveText(new RegExp(`^${signTexts.panel.options.boxLabel}: ${x}% from the left, `));
  // At the right edge of the page the ring of the box shows whole: the frame does not clip it.
  await page.locator('#fo-sign-x').fill('100');
  await page.locator('#fo-sign-x').press('Enter');
  await box.focus();
  await expect(page.locator('#fo-tool-root .fo-sign__page')).toHaveCSS('overflow', 'visible');
  // The page is a sheet of paper, light in both themes.
  await expect(page.locator('#fo-tool-root .fo-sign__sheet')).toHaveAttribute('data-theme', 'light');
});

test('D-10: after Reverse order the status says that the pages were reversed, not the name of the button', async ({ page }) => {
  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  await page.getByRole('button', { name: reorderTexts.panel.options.reverse, exact: true }).click();
  await expect(page.locator('#fo-tool-root p.fo-sr[role="status"]')).toHaveText(reorderTexts.panel.options.reversed);
});

test('D-10: Rotate says how many pages turned and which way', async ({ page }) => {
  await openTool(page, '/rotate-pdf/');
  await option(page, '180°');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('#fo-tool-root .fo-result__says')).toHaveText('Done! Oli turned the 8 pages of your PDF 180°.', { timeout: 30_000 });
});

test('D-11: in the Reorder grid, Tab out of a page picked up lets it go', async ({ page }) => {
  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  // The panel moves the focus to the action a frame after the grid shows (DECISOES § 240): wait for it first.
  await expect(page.getByRole('button', { name: reorderTexts.panel.action ?? '', exact: true })).toBeFocused();
  const main = page.locator('.fo-pages__grid > li').nth(1).locator('.fo-page__main');
  await main.focus();
  await page.keyboard.press('Space');
  await expect(main).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  await expect(main).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#fo-tool-root [data-grabbed]')).toHaveCount(0);
});

test('D-11 and F-13: Unlock with a wrong password shows one card, says the error on the field and puts the focus there, the text selected', async ({ page }) => {
  await openTool(page, '/unlock-pdf/');
  await choosePdfs(page, [pdfFile('gen-cifrado-aes256.pdf')]);
  const field = page.locator('#fo-unlock-password');
  await field.fill('not the password');
  await page.getByRole('button', { name: 'Remove password', exact: true }).click();
  await expect(page.locator('#fo-tool-root [role="alert"]')).toContainText("That password didn't open", { timeout: 30_000 });
  await expect(field).toBeFocused();
  expect(await field.evaluate((input: HTMLInputElement) => [input.selectionStart, input.selectionEnd])).toEqual([0, 'not the password'.length]);
  await expect(page.locator('#fo-tool-root .fo-file__name')).toHaveCount(1);
  // Enter sends it again.
  await field.press('Enter');
  await expect(page.locator('#fo-tool-root [role="alert"]')).toBeVisible();
});

test.describe('F-5: the preview of Sign PDF at the pixel ratio of the screen', () => {
  test.use({ deviceScaleFactor: 2 });

  test('F-5: the page preview is drawn at least as wide as its frame times the pixel ratio', async ({ page }) => {
    await signReady(page);
    const preview = page.locator('#fo-tool-root .fo-sign__sheet > img');
    await expect(preview).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => preview.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth >= Math.ceil(img.clientWidth * devicePixelRatio)), { timeout: 30_000 })
      .toBe(true);
    // The grid of the pages keeps its small pictures (240 px).
    await option(page, signTexts.panel.options.pickPages);
    const cell = page.locator('#fo-tool-root .fo-pages__grid .fo-page__sheet img').first();
    await expect(cell).toBeVisible({ timeout: 30_000 });
    expect(await cell.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeLessThanOrEqual(240);
  });
});

test('F-14: at 360 px, Pick all and Pick none share a row under the count, and the rail of three choices is one row of 56 px or less', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openTool(page, '/split-pdf/');
  const rail = page.locator('#fo-tool-root .fo-seg').first();
  expect((await rail.boundingBox())?.height ?? 999).toBeLessThanOrEqual(56);
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, 'Pick pages');
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  const [all, none, count] = await Promise.all([
    page.getByRole('button', { name: panel.grid.selectAll, exact: true }).boundingBox(),
    page.getByRole('button', { name: panel.grid.selectNone, exact: true }).boundingBox(),
    page.locator('#fo-tool-root .fo-pages__count').boundingBox(),
  ]);
  expect(all?.y).toBe(none?.y);
  expect(all?.y ?? 0).toBeGreaterThanOrEqual((count?.y ?? 0) + (count?.height ?? 0));
  // The Reorder grid has the keys in its help, not a second sentence about dragging.
  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('#fo-reorder-grid-help')).toHaveText(panel.grid.helpKeys, { timeout: 30_000 });
});

// D-12: every visible button of the PDF island is a target of 48 px or more, at 360 and 1280 px, in every state the walk of
// tests/e2e/lib/pdf-states.ts reaches, and none is the small one of the desktop (.fo-btn--sm, 40 px).
for (const { id, path } of PDF_WALKS) {
  test(`D-12: ${path} has no small button, and every visible button is 48 px or more, at 360 and 1280 px`, async ({ page }) => {
    test.slow();
    const small: string[] = [];
    await walkPdfTool(
      page,
      id,
      async (state, note) => {
        for (const width of [360, 1280]) {
          await page.setViewportSize({ width, height: width === 360 ? 740 : 800 });
          await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
          await expect(page.locator('#fo-tool-root .fo-btn--sm')).toHaveCount(0);
          const found = await page.evaluate(() =>
            [...document.querySelectorAll<HTMLElement>('#fo-tool-root button, #fo-tool-root [role="button"], #fo-tool-root label.fo-btn')]
              .filter((element) => {
                const style = getComputedStyle(element);
                const box = element.getBoundingClientRect();
                return style.visibility === 'visible' && style.display !== 'none' && box.width > 0 && box.height > 0 && !element.closest('[inert], [hidden]');
              })
              .map((element) => {
                const box = element.getBoundingClientRect();
                return { name: element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 40) ?? element.className, w: box.width, h: box.height };
              })
              .filter((box) => box.w < 47.5 || box.h < 47.5)
              .map((box) => `${box.name} ${box.w.toFixed(0)}×${box.h.toFixed(0)}`),
          );
          small.push(...found.map((line) => `${state} (${note}) a ${width}px: ${line}`));
        }
      },
      { hold: false },
    );
    expect(small).toEqual([]);
  });
}

test('D-7 and F-8: a picked page has the check before its number, and its fold sits on the border of 3 px', async ({ page }) => {
  await openTool(page, '/delete-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  const cells = page.locator('.fo-pages__grid > li');
  await expect(cells).toHaveCount(8, { timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Delete pages', exact: true })).toBeFocused();
  await cells.nth(1).locator('.fo-page__main').click();
  const picked = cells.nth(1);
  await expect(picked).toHaveAttribute('data-selected', 'true');
  await expect(picked.locator('.fo-page__check .fo-icon')).toBeVisible();
  await expect(cells.nth(0).locator('.fo-page__check .fo-icon')).toBeHidden();
  expect(await picked.evaluate((cell) => getComputedStyle(cell, '::after').top)).toBe('-3px');
  // The circle is in the number, which is only seen: the name of the cell says "picked".
  await expect(picked.locator('.fo-page__n')).toHaveAttribute('aria-hidden', 'true');
  await expect(picked.locator('.fo-page__main')).toHaveAttribute('aria-label', /, picked$/);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`F-6 and F-7 (${scheme}): the card of a PDF has the pdf icon, and in the ready card its fold cuts with the surface`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await openTool(page, '/split-pdf/');
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
    const card = page.locator('#fo-tool-root .fo-ready:not(.fo-ready--reading) .fo-file');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(card.locator('.fo-file__thumb > svg.fo-icon')).toHaveCount(1);
    const surface = await tokenColor(page, '--surface');
    const fold = await card.evaluate((element) => getComputedStyle(element, '::after').backgroundImage);
    expect(fold.replace(/\s+/g, ''), 'the fold starts with the colour of the surface').toContain(`linear-gradient(225deg,${surface.replace(/\s+/g, '')}`);
    await expect(card.locator('.fo-file__thumb')).toHaveCSS('background-color', await tokenColor(page, '--coral-soft'));
  });
}

test('F-10: the honest line of Sign PDF and the warning of Strong are the note of the design system, and Compress points at it', async ({ page }) => {
  await openTool(page, '/sign-pdf/');
  const sign = page.locator('#fo-tool-root .fo-sign .fo-note');
  await expect(sign).toHaveText(signTexts.panel.options.notice);
  await expect(sign.locator('svg.fo-icon')).toHaveCount(1);
  await expect(sign).toHaveCSS('background-color', await tokenColor(page, '--brand-soft'));
  await openTool(page, '/compress-pdf/');
  await option(page, compressTexts.panel.options.strong);
  const note = page.locator('#fo-tool-root .fo-note');
  await expect(note).toHaveText(compressTexts.panel.options.strongWarning);
  await expect(note.locator('svg.fo-icon')).toHaveCount(1);
  const id = await note.getAttribute('id');
  expect(id).toBeTruthy();
  await expect(page.locator('#fo-tool-root fieldset:has(> .fo-note)')).toHaveAttribute('aria-describedby', id ?? '');
});

test('F-11: "First page" is a rail of two, with no native check box, and "Skip it" leaves the first page without a number', async ({ page }) => {
  await openTool(page, '/add-page-numbers-to-pdf/');
  await expect(page.locator('#fo-tool-root input[type="checkbox"]')).toHaveCount(0);
  const group = page.getByRole('group', { name: numbersTexts.panel.options.firstLegend, exact: true });
  await expect(group.getByRole('radio')).toHaveCount(2);
  await expect(group.getByRole('radio', { name: numbersTexts.panel.options.numberIt, exact: true })).toBeChecked();
  await option(page, numbersTexts.panel.options.pageNofTotal);
  await option(page, numbersTexts.panel.options.skipIt);
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  const [out] = filesOf(await takePdfDownload(page));
  const read = await readWithPdfjs(out?.bytes as Uint8Array);
  const numbers = read.pages.map((p) => p.texts.map((text) => text.str).find((str) => /^Page \d+ of \d+$/.test(str)) ?? null);
  expect(numbers).toEqual([null, ...Array.from({ length: 7 }, (_, i) => `Page ${i + 1} of 7`)]);
});

test('D-23: the arrows that move are buttons with the stroke and the lip; where one cannot move there is none (Merge) or the disabled look (Reorder)', async ({ page }) => {
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf')]);
  await expect(page.locator('#fo-tool-root .fo-merge-panel .fo-btn--brand')).toBeVisible({ timeout: 30_000 });
  const moves = page.locator('#fo-tool-root .fo-merge__move:not([disabled])');
  await expect(moves).toHaveCount(2);
  for (const move of await moves.all()) expect(await move.evaluate((button) => getComputedStyle(button).boxShadow)).not.toBe('none');
  await expect(page.locator('#fo-tool-root .fo-merge__move[disabled]')).toHaveCount(0);
  const none = page.locator('#fo-tool-root .fo-merge__moves > .fo-merge__none');
  await expect(none).toHaveCount(2);
  for (const place of await none.all()) expect((await place.boundingBox())?.height).toBe(48);

  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  const live = page.locator('#fo-tool-root .fo-page__move:not([disabled])').first();
  expect(await live.evaluate((button) => getComputedStyle(button).boxShadow)).not.toBe('none');
  const off = page.locator('#fo-tool-root .fo-page__move[disabled]').first();
  expect(await off.evaluate((button) => getComputedStyle(button).boxShadow)).toBe('none');
  await expect(off).toHaveCSS('background-color', await tokenColor(page, '--surface-sunken'));
});

test('D-8: the name of a file of the Merge list takes up to two lines', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openTool(page, '/merge-pdf/');
  const long = 'a-quarterly-report-with-a-long-name-2026.pdf';
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf', long), pdfFile('gen-ja-otimizado.pdf')]);
  const name = page.locator('#fo-tool-root .fo-merge__row .fo-file__name').filter({ hasText: 'quarterly' });
  await expect(name).toBeVisible({ timeout: 30_000 });
  const lines = await name.evaluate((element) => Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight)));
  expect(lines).toBe(2);
  await expect(name).toHaveAttribute('title', long);
});
