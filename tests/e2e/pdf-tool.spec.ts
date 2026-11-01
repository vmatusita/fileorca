import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import panel from '../../src/tools/pdf/i18n/en.ts';
import reorderTexts from '../../src/tools/reorder-pdf-pages/i18n/en.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import { choosePdfs, filesOf, openTool, pdfFile, pdfOracle, takePdfDownload } from './lib/pdf-tools.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';

// The PDF island in use (F5a): the flows the matrix does not cover, one page load each.

test('Merge PDF: two files in the order of the list, the order changed with the buttons', async ({ page }) => {
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf')]);
  const action = page.getByRole('button', { name: 'Merge PDFs' });
  await expect(action).toBeVisible({ timeout: 30_000 });
  // The second file moves up: the merged file starts with its pages.
  await page.getByRole('button', { name: 'Move gen-ja-otimizado.pdf up' }).click();
  await action.click();
  const out = filesOf(await takePdfDownload(page));
  expect(out).toHaveLength(1);
  expect(out[0]?.name).toBe('gen-ja-otimizado-merged.pdf');
  const read = await readWithPdfjs(out[0]?.bytes as Uint8Array);
  expect(read.pages.map((p) => p.marker)).toEqual([...Array.from({ length: 12 }, (_, i) => `Page ${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `Page ${i + 1}`)]);
});

// ---- Criterion 10 (prompt F5a, decision 6): the keyboard does what dragging does -------------------------------------
// The same new order is made three ways on the same page load: by pointer drag, with the "earlier" and "later" buttons
// (WCAG 2.5.7) and with the keyboard (Space picks up, the arrow keys move, Space drops). The three outputs list the pages
// in the same order, read with PDF.js in Node, and the status region says each move once, in the order it happened.

/** Records every sentence the status region takes, from now on (a sentence said twice in a row is recorded twice). */
async function recordStatus(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('#fo-tool-root [role="status"]');
    if (!region) throw new Error('no status region');
    const log: string[] = [];
    (window as unknown as { __status: string[] }).__status = log;
    new MutationObserver(() => {
      const text = (region.textContent ?? '').trim();
      if (text) log.push(text);
    }).observe(region, { childList: true, characterData: true, subtree: true });
  });
}

/** What the status region said since recordStatus, once the last sentence has been set. */
async function said(page: Page, last: string): Promise<string[]> {
  await expect(page.locator('#fo-tool-root [role="status"]')).toHaveText(last);
  // A beat for a second, wrong sentence to show (the region sets a sentence 50 ms after it is cleared).
  await page.waitForTimeout(150);
  return page.evaluate(() => (window as unknown as { __status: string[] }).__status.slice());
}

/** A text a tool page must have (the type allows a tool without an action button). */
const must = (text: string | undefined): string => {
  if (!text) throw new Error('the page has no such text');
  return text;
};

/** The focus is on the control, never on the body (DECISOES § 86). */
const focused = (control: Locator) => expect(control).toBeFocused();

test('Reorder PDF pages: the same new order by drag, by the buttons and by the keyboard', async ({ page }) => {
  const fixture = 'gen-paginas-mistas.pdf';
  const all = pdfOracle(fixture).markers ?? [];
  // Page 4 goes to the front: three places earlier.
  const expected = ['Page 4', ...all.filter((marker) => marker !== 'Page 4')];
  const g = panel.grid;
  const moved = (position: number) => fmt(g.moved, { n: 4, position });
  const cell = (position: number) => page.locator('.fo-pages__grid > li').nth(position);
  const main = (position: number) => cell(position).locator('.fo-page__main');

  await openTool(page, '/reorder-pdf-pages/');
  await recordStatus(page);

  /** The pages of the saved file, in order. */
  async function save(): Promise<string[]> {
    await page.getByRole('button', { name: must(reorderTexts.panel.action) }).click();
    const [out] = filesOf(await takePdfDownload(page));
    const read = await readWithPdfjs(out?.bytes as Uint8Array);
    return read.pages.map((p) => p.marker ?? '?');
  }
  async function again(): Promise<void> {
    await page.getByRole('button', { name: panel.result.startOver }).click();
    await choosePdfs(page, [pdfFile(fixture)]);
    await expect(page.locator('.fo-pages__grid > li')).toHaveCount(all.length, { timeout: 30_000 });
    await page.evaluate(() => ((window as unknown as { __status: string[] }).__status.length = 0));
  }

  await choosePdfs(page, [pdfFile(fixture)]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(all.length, { timeout: 30_000 });
  await page.evaluate(() => ((window as unknown as { __status: string[] }).__status.length = 0));

  // 1. Pointer: page 4 is dragged onto the first place. One move, said once.
  await cell(3).dragTo(cell(0));
  expect(await said(page, moved(1))).toEqual([moved(1)]);
  await focused(main(0));
  expect(await save()).toEqual(expected);

  // 2. Buttons: "Move page 4 earlier" three times, each move said once, the focus following the page.
  await again();
  for (const position of [3, 2, 1]) {
    await page.getByRole('button', { name: fmt(g.moveEarlier, { n: 4 }) }).click();
    await focused(main(position - 1));
  }
  expect(await said(page, moved(1))).toEqual([moved(3), moved(2), moved(1)]);
  expect(await save()).toEqual(expected);

  // 3. Keyboard: Space picks page 4 up, the arrow keys move it three places, Space drops it.
  await again();
  await main(3).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#fo-tool-root [role="status"]')).toHaveText(fmt(g.picked, { n: 4 }));
  await expect(main(3)).toHaveAttribute('aria-pressed', 'true');
  for (const position of [3, 2, 1]) {
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#fo-tool-root [role="status"]')).toHaveText(moved(position));
    await focused(main(position - 1));
  }
  await page.keyboard.press('Space');
  await focused(main(0));
  const dropped = fmt(g.dropped, { n: 4, position: 1 });
  // The pick-up, the three moves and the drop: every sentence once, none repeated (the drop is not a fourth "moved").
  expect(await said(page, dropped)).toEqual([fmt(g.picked, { n: 4 }), moved(3), moved(2), moved(1), dropped]);
  await expect(main(0)).toHaveAttribute('aria-pressed', 'false');
  expect(await save()).toEqual(expected);
});

test('Merge PDF: the same new order by drag, by the buttons and by the keyboard', async ({ page }) => {
  // Three files of different lengths, so the order of the pages in the output tells the order of the files.
  const names = ['gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf', 'gen-fotos.pdf'] as const;
  const last = names[2];
  const markersOf = (name: string) => pdfOracle(name).markers ?? [];
  // The last file goes to the front: two places up.
  const expected = [...markersOf(last), ...markersOf(names[0]), ...markersOf(names[1])];
  const q = panel.queue;
  const moved = (position: number) => fmt(q.moved, { name: last, position, total: 3 });
  const row = (position: number) => page.locator('.fo-merge .fo-filelist__row').nth(position);
  const handle = (position: number) => row(position).locator('.fo-merge__grab');

  await openTool(page, '/merge-pdf/');
  await recordStatus(page);

  async function load(): Promise<void> {
    await choosePdfs(page, names.map((name) => pdfFile(name)));
    await expect(page.getByRole('button', { name: must(mergeTexts.panel.action) })).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-merge .fo-filelist__row')).toHaveCount(3);
    await page.evaluate(() => ((window as unknown as { __status: string[] }).__status.length = 0));
  }
  /** The merged file: it takes its name from the first file of the list, and lists the pages in the list's order. */
  async function merge(): Promise<{ name: string; markers: string[] }> {
    await page.getByRole('button', { name: must(mergeTexts.panel.action) }).click();
    const [out] = filesOf(await takePdfDownload(page));
    const read = await readWithPdfjs(out?.bytes as Uint8Array);
    return { name: out?.name ?? '', markers: read.pages.map((p) => p.marker ?? '?') };
  }
  async function again(): Promise<void> {
    await page.getByRole('button', { name: panel.result.startOver }).click();
    await load();
  }

  await load();

  // 1. Pointer: the last row is dragged onto the first. One move, said once.
  await row(2).dragTo(row(0));
  expect(await said(page, moved(1))).toEqual([moved(1)]);
  expect(await merge()).toEqual({ name: 'gen-fotos-merged.pdf', markers: expected });

  // 2. Buttons: "Move gen-fotos.pdf up" twice.
  await again();
  await page.getByRole('button', { name: fmt(q.moveEarlier, { name: last }) }).click();
  await expect(row(1).locator('.fo-file__name')).toHaveText(last);
  await page.getByRole('button', { name: fmt(q.moveEarlier, { name: last }) }).click();
  await expect(row(0).locator('.fo-file__name')).toHaveText(last);
  expect(await said(page, moved(1))).toEqual([moved(2), moved(1)]);
  expect(await merge()).toEqual({ name: 'gen-fotos-merged.pdf', markers: expected });

  // 3. Keyboard: Space on the handle picks the row up, the arrow keys move it, Space drops it. The focus follows the row.
  await again();
  await handle(2).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#fo-tool-root [role="status"]')).toHaveText(fmt(q.picked, { name: last }));
  await expect(handle(2)).toHaveAttribute('aria-pressed', 'true');
  for (const position of [2, 1]) {
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#fo-tool-root [role="status"]')).toHaveText(moved(position));
    await focused(handle(position - 1));
  }
  await page.keyboard.press('Space');
  const dropped = fmt(q.dropped, { name: last, position: 1, total: 3 });
  expect(await said(page, dropped)).toEqual([fmt(q.picked, { name: last }), moved(2), moved(1), dropped]);
  await focused(handle(0));
  await expect(handle(0)).toHaveAttribute('aria-pressed', 'false');
  expect(await merge()).toEqual({ name: 'gen-fotos-merged.pdf', markers: expected });
});
