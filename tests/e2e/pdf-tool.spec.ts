import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import panel from '../../src/tools/pdf/i18n/en.ts';
import reorderTexts from '../../src/tools/reorder-pdf-pages/i18n/en.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import jpgTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import { violationIds } from './lib/axe.ts';
import { REFUSAL_TEXT, choosePdfs, filesOf, openTool, pdfBytes, pdfFile, pdfOracle, rowReason, takePdfDownload } from './lib/pdf-tools.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';

// The PDF island in use (F5a): the flows the matrix does not cover, one page load each.

/** Clicks the label of a segmented option (the radio itself is hidden), as pdf-matrix.spec.ts does. */
const option = (page: Page, label: string) => page.locator('.fo-seg__opt').filter({ hasText: label }).first().click();

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

test('Rotate PDF: a scan cut inside its image is refused on its row, with no download (DECISOES § 174)', async ({ page }) => {
  const full = pdfBytes('pdf-escaneado-01-pagina-livro-cor.pdf');
  const cut = { name: 'scan-cut.pdf', mimeType: 'application/pdf', buffer: full.subarray(0, Math.floor(full.length / 2)) };
  await openTool(page, '/rotate-pdf/');
  await choosePdfs(page, [cut]);
  expect(await rowReason(page, 'scan-cut.pdf')).toMatch(REFUSAL_TEXT['gen-cortado.pdf']);
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toHaveCount(0);
  await expect(page.locator('#fo-tool-root .fo-drop [role="alert"]')).toContainText('stops before its end');
});

// ---- What the options of one file do to the next, and what the result line says (DECISOES § 178) ---------------------

test('PDF to JPG: a range with no page of the file is a field error; in a batch only the file without those pages is refused', async ({ page }) => {
  const field = page.getByLabel('Pages to turn into images');
  // One 12-page PDF, pages 50-60: the field says so (before, the panel waited with nothing said).
  await openTool(page, '/pdf-to-jpg/');
  await option(page, 'Page range');
  await field.fill('50-60');
  await field.press('Enter');
  await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
  await expect(page.locator('#fo-tool-root [role="alert"]').filter({ hasText: 'using only pages the PDF has' })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toHaveCount(0);

  // An 8-page and a 12-page PDF, pages 10-12: the 12-page one gives its three pages, the other says why it gave none.
  await openTool(page, '/pdf-to-jpg/');
  await option(page, 'Page range');
  await field.fill('10-12');
  await field.press('Enter');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf')]);
  const out = filesOf(await takePdfDownload(page));
  expect(out.map((file) => file.name).sort()).toEqual(['gen-ja-otimizado-page-10.jpg', 'gen-ja-otimizado-page-11.jpg', 'gen-ja-otimizado-page-12.jpg']);
  expect(await rowReason(page, 'gen-paginas-mistas.pdf')).toBe(fmt(panel.errors.noPages, { name: 'gen-paginas-mistas.pdf' }));
});

test('Rotate PDF: the pages turned one by one in a file are not turned in the next file dropped', async ({ page }) => {
  await openTool(page, '/rotate-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 30_000 });
  // F13a (UX-04 A; DECISOES § 487): after the result the options of a tool that runs by itself fold under "Adjust".
  await page.locator('#fo-tool-root .fo-adjust > summary').click();
  await option(page, 'Page by page');
  const cells = page.locator('.fo-pages__grid > li .fo-page__main');
  await expect(cells).toHaveCount(8, { timeout: 30_000 });
  await cells.nth(0).click();
  await cells.nth(2).click();
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 30_000 });
  // A new file on the finished card, with no Start over: it comes out as the default turns it, all pages a quarter.
  await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
  const [out] = filesOf(await takePdfDownload(page));
  expect(out?.name).toBe('gen-ja-otimizado-rotated.pdf');
  const read = await readWithPdfjs(out?.bytes as Uint8Array);
  expect(read.pages.map((p) => p.rotate)).toEqual(new Array(12).fill(90));
});

test('PDF to JPG: the success line counts the images, for one PDF of many pages and for several PDFs', async ({ page }) => {
  const says = page.locator('#fo-tool-root .fo-result__says');
  const status = page.locator('#fo-tool-root [role="status"]');
  for (const [names, sentence] of [
    [['gen-paginas-mistas.pdf'], fmt(jpgTexts.panel.doneMany, { count: 8 })],
    [['gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf'], fmt(jpgTexts.panel.doneMany, { count: 20 })],
    [['pdf-escaneado-01-pagina-livro-cor.pdf'], jpgTexts.panel.done],
  ] as const) {
    await openTool(page, '/pdf-to-jpg/');
    await choosePdfs(page, names.map((name) => pdfFile(name)));
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
    await expect(says).toHaveText(sentence);
    await expect(status).toHaveText(sentence);
    // One PDF is never "your 8 PDFs" (the line used to count the images as PDFs).
    expect(await says.innerText()).not.toMatch(/\d+ PDFs/);
  }
});

// ---- The page grid's pictures after a fast sweep (DECISOES § 180) -------------------------------------------------------
// A cell that left before its picture came used to get it anyway, after the cache had let it go: the <img> pointed at
// a revoked blob URL (ERR_FILE_NOT_FOUND in the console, a broken picture), and the worker drew every page swept past.

test('Reorder PDF pages: after a fast sweep through 300 pages, no picture points at a released URL and the cells on screen fill in', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith('blob:')) errors.push(`failed ${request.url()}`);
  });
  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-300.pdf')]);
  const cells = page.locator('.fo-pages__grid > li');
  await expect(cells).toHaveCount(300, { timeout: 60_000 });
  await expect(cells.first().locator('.fo-page__sheet img')).toBeVisible({ timeout: 30_000 });
  // About a second from the top to the bottom of the grid and back to its middle.
  for (let i = 0; i < 30; i += 1) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(25);
  }
  await page.evaluate(() => {
    const grid = document.querySelector('.fo-pages__grid')?.getBoundingClientRect();
    if (grid) window.scrollTo(0, window.scrollY + grid.top + grid.height / 2);
  });
  // Every cell on screen gets its picture.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const shown = [...document.querySelectorAll('.fo-pages__grid > li')].filter((cell) => {
            const box = cell.getBoundingClientRect();
            return box.bottom > 0 && box.top < innerHeight;
          });
          return shown.length > 0 && shown.every((cell) => {
            const img = cell.querySelector<HTMLImageElement>('.fo-page__sheet img');
            return img !== null && img.complete && img.naturalWidth > 0;
          });
        }),
      { timeout: 30_000 },
    )
    .toBe(true);
  await page.waitForTimeout(500);
  // No <img> of the grid points at a URL that was let go, and none failed to load.
  const dead = await page.evaluate(async () => {
    const out: string[] = [];
    for (const img of document.querySelectorAll<HTMLImageElement>('.fo-pages__grid img')) {
      try {
        await (await fetch(img.src)).arrayBuffer();
      } catch {
        out.push(img.src);
      }
    }
    return out;
  });
  expect(dead, 'pictures whose blob URL was revoked').toEqual([]);
  expect(errors, 'console errors and failed blob loads').toEqual([]);
});

// ---- The new pieces in the design system's patterns (DECISOES § 181) ----------------------------------------------------

test('Merge PDF at 360 px: a refused file keeps a card the width of the list, its sentence on a few lines', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-cifrado-aes256.pdf'), pdfFile('gen-vazio.pdf')]);
  for (const name of ['gen-cifrado-aes256.pdf', 'gen-vazio.pdf']) {
    const row = page.locator('.fo-merge .fo-filelist__row').filter({ hasText: name });
    await expect(row.locator('.fo-file__err')).toBeVisible({ timeout: 30_000 });
    const [rowBox, cardBox, textBox] = await Promise.all([row.boundingBox(), row.locator('.fo-file').boundingBox(), row.locator('.fo-file > div:not([class])').boundingBox()]);
    expect(cardBox?.width ?? 0, `${name}: the card takes the row`).toBeGreaterThanOrEqual((rowBox?.width ?? 0) - 1);
    expect(textBox?.width ?? 0, `${name}: the text column`).toBeGreaterThanOrEqual(150);
    // The same card in the list of Compress PDF, which has no handle or arrows, is 152 px tall; it was 412 px here.
    expect(cardBox?.height ?? 999, `${name}: the card height`).toBeLessThan(160);
    // F13a (UX-04 A; DECISOES § 487): a refused row has no handle and no arrows (it is not in the order); its own
    // remove button, in the card, keeps the full target size.
    await expect(row.locator('.fo-merge__grab, .fo-merge__move, .fo-merge__none')).toHaveCount(0);
    expect((await row.getByRole('button', { name: `Remove ${name}`, exact: true }).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
  }
  // The row that is read has its arrows and its remove button, each a full target, under the card that takes the width of
  // the list (under 480 px, as the § 181 of the F5a had it; F13a, revisão b-2, DECISOES § 515).
  const read = page.locator('.fo-merge .fo-filelist__row').filter({ hasText: 'gen-paginas-mistas.pdf' });
  const [readRow, card] = await Promise.all([read.boundingBox(), read.locator('.fo-file').boundingBox()]);
  expect(card?.width ?? 0, 'the card of the row that is read takes the row').toBeGreaterThanOrEqual((readRow?.width ?? 0) - 1);
  for (const control of await read.locator(':scope > .fo-merge__moves > .fo-btn, :scope > .fo-merge__remove').all()) {
    const box = await control.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
    expect(box?.y ?? 0).toBeGreaterThanOrEqual((card?.y ?? 0) + (card?.height ?? 0) - 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

/** Every field error on the panel has the alert icon before its sentence (docs/design/README: never only the colour). */
async function errorsHaveIcons(page: Page, at: string): Promise<void> {
  const lines = page.locator('#fo-tool-root .fo-field__error');
  await expect(lines.first()).toBeVisible({ timeout: 15_000 });
  for (const line of await lines.all()) {
    await expect(line.locator(':scope > svg.fo-icon'), `${at}: "${await line.innerText()}"`).toHaveCount(1);
    await expect(line).toHaveCSS('color', await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--danger)';
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }));
  }
}

test('Delete, Reorder, Split and Sign: their field errors have the alert icon, in the danger colour', async ({ page }) => {
  await openTool(page, '/delete-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  await page.getByRole('button', { name: 'Delete pages' }).click();
  await errorsHaveIcons(page, 'Delete, nothing picked');
  await page.getByRole('button', { name: panel.grid.selectAll }).click();
  await errorsHaveIcons(page, 'Delete, every page picked');

  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  await page.getByRole('button', { name: must(reorderTexts.panel.action) }).click();
  await errorsHaveIcons(page, 'Reorder, nothing moved');

  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, 'Pick pages');
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  await page.getByRole('button', { name: 'Split PDF' }).click();
  await errorsHaveIcons(page, 'Split, nothing picked');

  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.getByRole('button', { name: 'Sign PDF' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Sign PDF' }).click();
  await errorsHaveIcons(page, 'Sign, no signature');
  await option(page, 'Upload');
  await page.getByLabel('Choose a signature image').setInputFiles({ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not an image at all') });
  await expect(page.locator('#fo-tool-root .fo-field__error').filter({ hasText: 'Oli can only use a PNG or JPG here.' })).toBeVisible();
  await errorsHaveIcons(page, 'Sign, an upload that is not an image');
});

// F5a (DECISOES § 182): Start over clears the tool's state, signature included, so the signature area starts fresh with
// the next file. Before, its own fields kept the typed name while the signature was gone, and typing the same name again
// drew nothing (found while the matrix signed one file after another).
test('Sign PDF: after Start over, the same typed name signs the next file', async ({ page }) => {
  await openTool(page, '/sign-pdf/');
  const box = page.locator('#fo-tool-root .fo-sign__box');
  const typed = page.getByLabel('Type your name');
  for (const round of [1, 2]) {
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
    await expect(page.getByRole('button', { name: 'Sign PDF' })).toBeVisible({ timeout: 30_000 });
    await option(page, 'Type');
    await expect(typed, `round ${round}: the name field starts empty`).toHaveValue('');
    await typed.fill('Orca Signer');
    await typed.blur();
    await expect(box, `round ${round}: the signature is on the preview`).toBeVisible({ timeout: 30_000 });
    if (round === 1) await page.getByRole('button', { name: 'Start over' }).click();
  }
});

// F5a, the second pass of the review (DECISOES § 183): three things the fixes of the first pass left behind.
test('Sign PDF: moving the signature does not draw the page preview again', async ({ page }) => {
  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.getByRole('button', { name: 'Sign PDF' })).toBeVisible({ timeout: 30_000 });
  await option(page, 'Type');
  await page.getByLabel('Type your name').fill('Orca Signer');
  await page.getByLabel('Type your name').blur();
  const box = page.locator('#fo-tool-root .fo-sign__box');
  const preview = page.locator('#fo-tool-root .fo-sign__sheet > img');
  await expect(box).toBeVisible({ timeout: 30_000 });
  await expect(preview).toBeVisible({ timeout: 30_000 });
  // Every picture the preview shows from now on, however briefly (the redraw is asynchronous).
  await page.evaluate(() => {
    const frame = document.querySelector('#fo-tool-root .fo-sign__page');
    const seen = new Set<string>([frame?.querySelector('img')?.getAttribute('src') ?? '']);
    (window as unknown as { previewSources: Set<string> }).previewSources = seen;
    new MutationObserver(() => seen.add(frame?.querySelector('img')?.getAttribute('src') ?? '')).observe(frame as Node, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  });
  await box.focus();
  for (let step = 0; step < 10; step += 1) await page.keyboard.press('ArrowRight');
  // Long enough for a picture drawn again in the worker to come back (a page of this file takes well under a second).
  await page.waitForTimeout(1_500);
  const sources = await page.evaluate(() => [...(window as unknown as { previewSources: Set<string> }).previewSources]);
  // The same picture all along: every re-render of the panel used to let it go and draw it again in the worker.
  expect(sources, 'the preview kept the picture it had before the moves').toHaveLength(1);
});

test('Merge PDF: the success line says how many files went into the one PDF', async ({ page }) => {
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, ['gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf', 'gen-acoes.pdf'].map((name) => pdfFile(name)));
  await page.getByRole('button', { name: mergeTexts.panel.action ?? 'Merge PDF' }).click();
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#fo-tool-root')).toContainText(fmt(mergeTexts.panel.doneMany, { count: 3 }));
});

test('Sign PDF: switching away from Upload lets the chosen image go with its signature', async ({ page }) => {
  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.getByRole('button', { name: 'Sign PDF' })).toBeVisible({ timeout: 30_000 });
  await option(page, 'Upload');
  await page.getByLabel('Choose a signature image').setInputFiles('fixtures/images/gen-png-transparente.png');
  const chosen = page.locator('#fo-tool-root .fo-sign__chosen');
  await expect(chosen).toHaveText('gen-png-transparente.png');
  await expect(page.locator('#fo-tool-root .fo-sign__box')).toBeVisible({ timeout: 30_000 });
  await option(page, 'Draw');
  await option(page, 'Upload');
  // No signature now, so no name of an image either: the name said there was one.
  await expect(page.locator('#fo-tool-root .fo-sign__box')).toHaveCount(0);
  await expect(chosen).toHaveCount(0);
});

test('Sign PDF, Upload: the control that opens the picker is a button of the site, by pointer and by keyboard', async ({ page }) => {
  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.getByRole('button', { name: 'Sign PDF' })).toBeVisible({ timeout: 30_000 });
  await option(page, 'Upload');
  const input = page.getByLabel('Choose a signature image');
  const control = page.locator('label[for="fo-sign-upload"]');
  // The look of the site's buttons: the stroke, the target size, the upload icon and the site's own words.
  await expect(control).toHaveClass(/\bfo-btn\b/);
  await expect(control).toHaveText('Choose a signature image');
  await expect(control.locator('svg.fo-icon')).toHaveCount(1);
  expect((await control.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
  expect(await control.evaluate((element) => getComputedStyle(element).borderTopWidth)).not.toBe('0px');
  // The native control is out of sight, still the one the keyboard and a screen reader reach.
  expect((await input.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1);
  // Tab from the "Upload" choice reaches the input, the button shows the focus ring, and Space opens the picker.
  await page.getByRole('radio', { name: 'Upload' }).focus();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  const [byKeyboard] = await Promise.all([page.waitForEvent('filechooser', { timeout: 5_000 }), page.keyboard.press('Space')]);
  expect(byKeyboard.isMultiple()).toBe(false);
  const [byPointer] = await Promise.all([page.waitForEvent('filechooser'), control.click()]);
  expect(byPointer.isMultiple()).toBe(false);
  // A file chosen: its name shows next to the button, and the signature goes on the page.
  await input.setInputFiles({ name: 'my-signature.png', mimeType: 'image/png', buffer: Buffer.from(await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 40;
    const context = canvas.getContext('2d');
    if (context) context.fillRect(10, 18, 100, 4);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    return [...new Uint8Array(await (blob as Blob).arrayBuffer())];
  })) });
  await expect(page.locator('.fo-sign__chosen')).toHaveText('my-signature.png');
  await expect(page.locator('.fo-sign__box')).toBeVisible();
});

// ---- Criterion 10 (prompt F5a, decision 6): the keyboard does what dragging does -------------------------------------
// The same new order is made three ways on the same page load: by pointer drag, with the "earlier" and "later" buttons
// (WCAG 2.5.7) and with the keyboard (Space picks up, the arrow keys move, Space drops). The three outputs list the pages
// in the same order, read with PDF.js in Node, and the status region says each move once, in the order it happened.

/**
 * Records every sentence the status region of the panel takes, from now on (a sentence said twice in a row is recorded
 * twice). F13a: the region of the panel is the hidden paragraph (p.fo-sr); the count of the Merge list has its own.
 */
async function recordStatus(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('#fo-tool-root p.fo-sr[role="status"]');
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
  await expect(page.locator('#fo-tool-root p.fo-sr[role="status"]')).toHaveText(last);
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

// ---- The press of the action asks for the result (DECISOES § 176) ---------------------------------------------------
// After a page was picked, moved or an option changed, Enter on the action used to leave the focus on the body, and the
// empty DropZone (with its "Choose a PDF") stood in the slot while the file was worked on. Now the ready card stays on
// screen while Oli works and the focus goes to Download when it comes.

/** From now on, whether the DropZone is put in the panel at any moment (a new element or a class turned into it). */
async function watchDropZone(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = document.querySelector('#fo-tool-root');
    if (!root) throw new Error('no tool root');
    const seen = { drop: root.querySelector('.fo-drop') !== null };
    (window as unknown as { __drop: typeof seen }).__drop = seen;
    const isDrop = (node: Node): boolean => node instanceof Element && (node.matches('.fo-drop') || node.querySelector('.fo-drop') !== null);
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && isDrop(record.target)) seen.drop = true;
        for (const node of Array.from(record.addedNodes)) if (isDrop(node)) seen.drop = true;
      }
      if (root.querySelector('.fo-drop')) seen.drop = true;
    }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });
}

const dropZoneShown = (page: Page): Promise<boolean> => page.evaluate(() => (window as unknown as { __drop: { drop: boolean } }).__drop.drop);

const keyboardCases: { name: string; path: string; prepare: (page: Page) => Promise<string> }[] = [
  {
    name: 'Delete PDF pages, Space on a page',
    path: '/delete-pdf-pages/',
    prepare: async (page) => {
      const first = page.locator('.fo-pages__grid > li').first().locator('.fo-page__main');
      await first.focus();
      await page.keyboard.press('Space');
      await expect(first).toHaveAttribute('aria-pressed', 'true');
      return 'Delete 1 page';
    },
  },
  {
    name: 'Reorder PDF pages, one move by the keyboard',
    path: '/reorder-pdf-pages/',
    prepare: async (page) => {
      const cell = (position: number) => page.locator('.fo-pages__grid > li').nth(position).locator('.fo-page__main');
      await cell(1).focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('ArrowLeft');
      await expect(cell(0)).toBeFocused();
      await page.keyboard.press('Space');
      await expect(page.locator('.fo-pages__grid > li').first()).toHaveAttribute('data-page', '1');
      return must(reorderTexts.panel.action);
    },
  },
  {
    name: 'Split PDF, page ranges typed',
    path: '/split-pdf/',
    prepare: async (page) => {
      await page.getByRole('radio', { name: 'Every page' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('radio', { name: 'Page ranges' })).toBeChecked();
      const field = page.getByLabel('Pages for each file');
      await field.focus();
      await page.keyboard.type('1-3, 5');
      await page.keyboard.press('Enter');
      return 'Split PDF';
    },
  },
];

for (const { name, path, prepare } of keyboardCases) {
  test(`${name}: Enter on the action puts the focus on Download, and the DropZone never shows meanwhile`, async ({ page }) => {
    await openTool(page, path);
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
    await expect(page.locator('.fo-pages__grid > li, .fo-ready')).not.toHaveCount(0, { timeout: 30_000 });
    if (path !== '/split-pdf/') await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
    const action = page.getByRole('button', { name: await prepare(page) });
    await action.focus();
    await watchDropZone(page);
    await page.keyboard.press('Enter');
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeFocused({ timeout: 30_000 });
    expect(await dropZoneShown(page), 'the DropZone showed between the press and the result').toBe(false);
  });
}

// ---- Errors are said, the toggles have their own names, the focus stays put (DECISOES § 177) ------------------------

/** The sentence is in an alert of the panel (WCAG 4.1.3: said when it shows, with no focus move). */
const alerted = (page: Page, text: string | RegExp) => expect(page.locator('#fo-tool-root [role="alert"]').filter({ hasText: text })).toBeVisible({ timeout: 15_000 });

test('Unlock PDF: the wrong password is an alert', async ({ page }) => {
  await openTool(page, '/unlock-pdf/');
  await choosePdfs(page, [pdfFile('gen-cifrado-aes256.pdf')]);
  const field = page.getByLabel('Password to open the PDF');
  await field.fill('not the password');
  await field.press('Enter');
  await alerted(page, "That password didn't open gen-cifrado-aes256.pdf");
});

test('Protect PDF: the broken rule and the two passwords that differ are alerts', async ({ page }) => {
  await openTool(page, '/protect-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await page.getByRole('button', { name: 'Protect PDFs' }).click();
  await alerted(page, 'Use 4 to 100 characters.');
  await page.getByLabel('Password', { exact: true }).fill('abcd');
  await page.getByLabel('Confirm password').fill('abce');
  await alerted(page, "The two passwords don't match");
});

test('Protect PDF: each Show toggle names its field, and the name stays when it is pressed', async ({ page }) => {
  await openTool(page, '/protect-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  // The file is read (the action takes the focus then), so nothing moves the focus after the press below.
  await expect(page.getByRole('button', { name: 'Protect PDFs' })).toBeFocused({ timeout: 30_000 });
  await expect(page.locator('#fo-tool-root .fo-pass__toggle')).toHaveCount(2);
  const password = page.getByRole('button', { name: panel.password.showPassword, exact: true });
  const confirm = page.getByRole('button', { name: panel.password.showConfirm, exact: true });
  await expect(password).toHaveCount(1);
  await expect(confirm).toHaveCount(1);
  await expect(password).toHaveAttribute('aria-pressed', 'false');
  await password.focus();
  await page.keyboard.press('Space');
  // Found again by the same name: pressing it changed the state, not the name (WAI-ARIA toggle button).
  await expect(password).toHaveAttribute('aria-pressed', 'true');
  await expect(password).toBeFocused();
  await expect(page.locator('#fo-protect-password')).toHaveAttribute('type', 'text');
  await expect(page.locator('#fo-protect-confirm')).toHaveAttribute('type', 'password');
});

test('Split PDF and Reorder: an arrow key that moves nothing leaves no focus behind for the grid to take back', async ({ page }) => {
  const cells = page.locator('.fo-pages__grid > li');
  const first = cells.first().locator('.fo-page__main');

  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, 'Pick pages');
  await expect(cells).toHaveCount(8, { timeout: 30_000 });
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  // ArrowLeft on the first page: nothing to move to. Then "Pick none", which changes the grid.
  await page.keyboard.press('ArrowLeft');
  const none = page.getByRole('button', { name: panel.grid.selectNone });
  await none.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.fo-pages__count')).toHaveText(fmt(panel.grid.selectedCount, { count: 0, total: 8 }));
  await page.waitForTimeout(150);
  await expect(none).toBeFocused();

  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(cells).toHaveCount(8, { timeout: 30_000 });
  await first.focus();
  await page.keyboard.press('ArrowLeft');
  const reverse = page.getByRole('button', { name: must(reorderTexts.panel.options.reverse) });
  await reverse.focus();
  // Twice: the order goes back to the first, where page 1 stands at position 1 again.
  await page.keyboard.press('Enter');
  await expect(cells.first()).toHaveAttribute('data-page', '7');
  await page.keyboard.press('Enter');
  await expect(cells.first()).toHaveAttribute('data-page', '0');
  await page.waitForTimeout(150);
  await expect(reverse).toBeFocused();
});

test('Merge PDF: "Move down" keeps the focus on the same button of the moved row, so Enter twice moves it twice', async ({ page }) => {
  const names = ['gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf', 'gen-acoes.pdf'] as const;
  const row = (position: number) => page.locator('.fo-merge .fo-filelist__row').nth(position);
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, names.map((name) => pdfFile(name)));
  await expect(page.getByRole('button', { name: must(mergeTexts.panel.action) })).toBeVisible({ timeout: 30_000 });
  const down = page.getByRole('button', { name: fmt(panel.queue.moveLater, { name: names[0] }) });
  await down.focus();
  await page.keyboard.press('Enter');
  await expect(row(1).locator('.fo-file__name')).toHaveText(names[0]);
  await expect(down).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(row(2).locator('.fo-file__name')).toHaveText(names[0]);
  // At the bottom "down" gives its place to an empty one (F13a, D-23): the focus goes to "up" of the same row, never to the body.
  await expect(row(2).locator('.fo-merge__none')).toHaveCount(1);
  await expect(page.getByRole('button', { name: fmt(panel.queue.moveEarlier, { name: names[0] }) })).toBeFocused();
});

test('Delete, Reorder and Split: the press of the action with nothing to do is an alert', async ({ page }) => {
  for (const [path, action, sentence] of [
    ['/delete-pdf-pages/', 'Delete pages', 'Pick at least one page to delete.'],
    ['/reorder-pdf-pages/', 'Save new order', 'Move a page to save a new order.'],
  ] as const) {
    await openTool(page, path);
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
    await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
    await page.getByRole('button', { name: action }).click();
    await alerted(page, sentence);
  }
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, 'Pick pages');
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(8, { timeout: 30_000 });
  await page.getByRole('button', { name: 'Split PDF' }).click();
  await alerted(page, 'Pick at least one page first.');
  await option(page, 'Page ranges');
  await page.getByLabel('Pages for each file').fill('99-100');
  await page.getByLabel('Pages for each file').press('Enter');
  await alerted(page, 'Type page numbers like 1-3, 5, 8-10');
});

test('Watermark and Sign: text Oli cannot draw and an image that is not one are alerts', async ({ page }) => {
  await openTool(page, '/watermark-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await page.getByLabel('Watermark text').fill('日本語');
  await page.getByLabel('Watermark text').press('Enter');
  await alerted(page, 'The watermark needs text Oli can draw.');

  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, 'Upload');
  const input = page.getByLabel('Choose a signature image');
  await input.setInputFiles({ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not an image at all') });
  await alerted(page, 'Oli can only use a PNG or JPG here.');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
});

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
    // When the file is ready the panel moves the focus to the action, a frame after the grid shows (DECISOES § 240). A
    // step that focuses a page waits for that move first, or the move takes the focus away from the page (§ 321).
    await focused(page.getByRole('button', { name: must(reorderTexts.panel.action) }));
    await page.evaluate(() => ((window as unknown as { __status: string[] }).__status.length = 0));
  }

  await choosePdfs(page, [pdfFile(fixture)]);
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(all.length, { timeout: 30_000 });
  // As in again(): the panel says the file is ready and moves the focus to the action a frame after the grid shows
  // (DECISOES § 240 and § 321). Without this wait the "1 PDF ready" came after the drag and covered its sentence, once,
  // on the Chromium of the CI runner (F18, DECISOES § 750).
  await focused(page.getByRole('button', { name: must(reorderTexts.panel.action) }));
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
  // The page grid with a page in the hand is a state of its own for axe: names, pressed state and targets.
  expect(await violationIds(page), 'axe on the grid with a page picked up').toEqual([]);
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
  const names = ['gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf', 'gen-acoes.pdf'] as const;
  const last = names[2];
  const markersOf = (name: string) => pdfOracle(name).markers ?? [];
  // The last file goes to the front: two places up.
  const expected = [...markersOf(last), ...markersOf(names[0]), ...markersOf(names[1])];
  const q = panel.queue;
  const moved = (position: number) => fmt(q.moved, { name: last, position, total: 3 });
  const row = (position: number) => page.locator('.fo-merge .fo-filelist__row').nth(position);

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
  expect(await merge()).toEqual({ name: 'gen-acoes-merged.pdf', markers: expected });

  // 2. Buttons: "Move gen-acoes.pdf up" twice.
  await again();
  await page.getByRole('button', { name: fmt(q.moveEarlier, { name: last }) }).click();
  await expect(row(1).locator('.fo-file__name')).toHaveText(last);
  await page.getByRole('button', { name: fmt(q.moveEarlier, { name: last }) }).click();
  await expect(row(0).locator('.fo-file__name')).toHaveText(last);
  expect(await said(page, moved(1))).toEqual([moved(2), moved(1)]);
  expect(await merge()).toEqual({ name: 'gen-acoes-merged.pdf', markers: expected });

  // 3. Keyboard. F13a (UX-04 A; DECISOES § 487): the handle is gone, and the arrows of the row do what it did: Enter
  // on "Move up" twice, the focus following the row on the same arrow, then on the other one when the row reaches the top
  // and "up" gives its place to the empty one. Each move is said once.
  await again();
  await expect(page.locator('#fo-tool-root .fo-merge__grab')).toHaveCount(0);
  const up = page.getByRole('button', { name: fmt(q.moveEarlier, { name: last }), exact: true });
  await up.focus();
  await page.keyboard.press('Enter');
  await expect(row(1).locator('.fo-file__name')).toHaveText(last);
  await focused(up);
  // The list as the keyboard leaves it: every arrow named, a target big enough (WCAG 2.5.8), no disabled control.
  expect(await violationIds(page), 'axe on the Merge list after a move by the keyboard').toEqual([]);
  await page.keyboard.press('Enter');
  await expect(row(0).locator('.fo-file__name')).toHaveText(last);
  await focused(page.getByRole('button', { name: fmt(q.moveLater, { name: last }), exact: true }));
  expect(await said(page, moved(1))).toEqual([moved(2), moved(1)]);
  expect(await merge()).toEqual({ name: 'gen-acoes-merged.pdf', markers: expected });
});

// DECISOES § 240: the options and their fields come with the ready card, and the island moves the focus to the action
// in an effect that runs a frame later. A field the person is already in keeps the focus and what is typed in it (before,
// the keys typed in that frame went to the action button, and a range typed in the Delete pages field was lost).
test('Delete PDF pages: a field focused as the file is read keeps the focus and what is typed in it', async ({ page }) => {
  await openTool(page, '/delete-pdf-pages/');
  // The page focuses the range field the moment it appears, as a quick person would, before the island's effects run.
  await page.evaluate(() => {
    new MutationObserver((_, observer) => {
      const field = document.getElementById('fo-delete-pick');
      if (!field) return;
      field.focus();
      observer.disconnect();
    }).observe(document.body, { childList: true, subtree: true });
  });
  await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
  const field = page.getByLabel('Pick pages by number');
  await expect(field).toBeVisible({ timeout: 30_000 });
  // Two frames and a task: the island's effects have run.
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 100)))));
  await expect(field).toBeFocused();
  await page.keyboard.type('2-3');
  await expect(field).toHaveValue('2-3');
});

// The review F4-F7 (d-1; DECISOES § 305): in a tool with an action button the focus goes to the button once the files
// are read, so the status says what the reading found, the files ready or the ones refused.
test('a PDF tool with an action says, once the files are read, how many are ready and how many were refused', async ({ page }) => {
  const status = page.locator('#fo-tool-root p.fo-sr[role="status"]');
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.getByRole('button', { name: 'Split PDF' })).toBeFocused({ timeout: 30_000 });
  await expect(status).toHaveText(panel.queue.readyOne);

  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf'), { name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') }]);
  await expect(page.getByRole('button', { name: 'Merge PDFs' })).toBeFocused({ timeout: 30_000 });
  await expect(status).toHaveText(fmt(panel.errors.some, { count: 1 }));

  // One PDF left after the refusals: Merge says the refusal and what it still needs (second pass, s-3).
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), { name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') }]);
  await expect(status).toHaveText(`${fmt(panel.errors.some, { count: 1 })} ${mergeTexts.panel.options.needMore}`, { timeout: 30_000 });
});
