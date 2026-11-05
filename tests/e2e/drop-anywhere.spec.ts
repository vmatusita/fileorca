// F13a · UX-18 A, the drop anywhere on the page (decision 9 and criterion 7 of the run; DECISOES § 501 to § 503).
// On a page with a file tool, files dragged into the window light the DropZone where it is, and a drop anywhere (the H1 of a
// guide, far from the zone) goes to the tool, with the panel brought into view; a drag that leaves the window (or goes over
// an ad, a frame of another origin) gives the zone back its rest. On a page with no file tool, the cursor never promises a
// copy: the dragover of files ends with dropEffect "none", and the drop is refused, so the browser never opens the file.
// setInputFiles fires none of these events: each test builds a DataTransfer in the page with the bytes of a fixture and
// dispatches dragenter, dragover and drop on the element, in both browsers. A DataTransfer built in the page keeps its
// dropEffect at "none" whatever is written to it (outside a real drag), so the tests of the dropEffect give the events a
// stand-in that starts at "copy" (or "none") and keeps what the page writes (docs/claude/playwright.md).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { FILE_GUIDES } from '../../src/tools/guides/registry.ts';
import { dismissCookies, dropOn, hydrated, transferOf } from './lib/page.ts';
import { pdfFile } from './lib/pdf-tools.ts';

const HEIC = { name: 'heic-06.heic', mimeType: 'image/heic', buffer: readFileSync(resolve('fixtures/images', 'heic-06-iphone7-paisagem-gps.heic')) };

/** The rectangle of the tool is whole on screen (the page may scroll smoothly to it, so this waits). */
async function panelInView(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const slot = document.querySelector('#fo-tool-root .fo-slot')?.getBoundingClientRect();
          return slot ? slot.top >= -1 && slot.bottom <= innerHeight + 1 : false;
        }),
      { timeout: 10_000, message: 'the panel is brought into view' },
    )
    .toBe(true);
}

test.describe('a page with a file tool takes the drop anywhere', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the HEIC guide: a HEIC let go on the H1 goes to the tool, and the panel comes into view', async ({ page }) => {
    const path = FILE_GUIDES['guides-heic-to-jpg-on-windows'].paths.en;
    expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    // At 1280 × 800 only a strip of the zone is on the first screen (D-47): the H1 is far from it.
    await page.evaluate(() => scrollTo(0, 0));
    const before = await page.evaluate(() => document.querySelector('#fo-tool-root .fo-slot')?.getBoundingClientRect().bottom ?? 0);
    expect(before, 'the panel does not fit the first screen of the guide').toBeGreaterThan(800);
    const { taken } = await dropOn(page, 'h1', [HEIC]);
    expect(taken, 'the page takes the dragover and the drop over').toBe(true);
    await expect(page.locator('#fo-tool-root :is(.fo-level, .fo-result)')).toBeVisible({ timeout: 60_000 });
    await panelInView(page);
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toHaveAttribute('download', 'heic-06.jpg');
  });

  test('files that come into the window light the zone where it is, and go back to rest when they leave it', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    const zone = page.locator('#fo-tool-root .fo-drop');
    await expect(zone).not.toHaveAttribute('data-state', 'over');
    const transfer = await transferOf(page, [HEIC]);
    // dragenter on the body, far from the zone (a file came into the window): the zone goes to "over".
    await page.evaluate((data) => {
      document.body.dispatchEvent(new DragEvent('dragenter', { dataTransfer: data, bubbles: true, cancelable: true }));
    }, transfer);
    await expect(zone).toHaveAttribute('data-state', 'over');
    await expect(page.locator('#fo-tool-root .fo-slot > .fo-slot__oli')).toHaveAttribute('data-oli', 'gulp');
    // The drag moves from the body to the H1 (enter the H1, leave the body): still over.
    await page.evaluate((data) => {
      document.querySelector('h1')?.dispatchEvent(new DragEvent('dragenter', { dataTransfer: data, bubbles: true, cancelable: true }));
      document.body.dispatchEvent(new DragEvent('dragleave', { dataTransfer: data, bubbles: true, cancelable: true, relatedTarget: document.querySelector('h1') }));
    }, transfer);
    await expect(zone).toHaveAttribute('data-state', 'over');
    // It leaves the window (or goes over an ad): the last dragleave, with no related target. The zone rests again.
    await page.evaluate((data) => {
      document.querySelector('h1')?.dispatchEvent(new DragEvent('dragleave', { dataTransfer: data, bubbles: true, cancelable: true }));
    }, transfer);
    await expect(zone).not.toHaveAttribute('data-state', 'over');
    await expect(page.locator('#fo-tool-root .fo-slot > .fo-slot__oli')).toHaveAttribute('data-oli', 'wave');
    // The cursor says "copy" where the page takes the file: here, anywhere on it (the stand-in starts at "none").
    expect(await dragOverWith(page, ['Files'], 'none')).toEqual({ overPrevented: true, effect: 'copy', dropPrevented: true });
    await expect(zone).not.toHaveAttribute('data-state', 'over');
  });

  // F13a, revisão c-2 (DECISOES § 519): the drag that comes into the window over the Choose button or the help of
  // the zone flips it to "over", and those nodes leave the DOM; Chromium sends no dragleave to a node that is gone, so the
  // counter kept one and the zone stayed in "over" (with no button) after the drag left the window. The same events here:
  // dragenter on the node, dragenter on the H1, and the last dragleave on the H1. A node that left the DOM no longer counts.
  for (const [path, entered] of [['/compress-image/', '.fo-btn--brand'], ['/compress-image/', '.fo-drop__help > span'], ['/compress-pdf/', '.fo-btn--brand']] as const) {
    test(`${path}: a drag that comes in over ${entered === '.fo-btn--brand' ? 'the Choose button' : 'the words of the help'} and leaves the window gives the zone back its rest`, async ({ page }) => {
      await page.goto(path);
      await hydrated(page);
      await dismissCookies(page);
      const zone = page.locator('#fo-tool-root .fo-drop');
      const transfer = await transferOf(page, [path.includes('pdf') ? pdfFile('gen-paginas-mistas.pdf') : HEIC]);
      await page.evaluate(([data, selector]) => {
        const node = document.querySelector(`#fo-tool-root .fo-drop ${selector}`);
        (window as unknown as { __foEntered: Element | null }).__foEntered = node;
        node?.dispatchEvent(new DragEvent('dragenter', { dataTransfer: data as DataTransfer, bubbles: true, cancelable: true }));
      }, [transfer, entered] as const);
      await expect(zone).toHaveAttribute('data-state', 'over');
      expect(await page.evaluate(() => (window as unknown as { __foEntered: Element | null }).__foEntered?.isConnected), 'the node the drag came in over left the DOM').toBe(false);
      await page.evaluate((data) => {
        document.querySelector('h1')?.dispatchEvent(new DragEvent('dragenter', { dataTransfer: data, bubbles: true, cancelable: true }));
      }, transfer);
      await expect(zone).toHaveAttribute('data-state', 'over');
      await page.evaluate((data) => {
        document.querySelector('h1')?.dispatchEvent(new DragEvent('dragleave', { dataTransfer: data, bubbles: true, cancelable: true }));
      }, transfer);
      await expect(zone).not.toHaveAttribute('data-state', 'over');
      await expect(page.locator('#fo-tool-root .fo-drop .fo-btn--brand')).toBeVisible();
    });
  }

  test('Merge PDF: two PDFs let go on the H1 both go into the list', async ({ page }) => {
    await page.goto('/merge-pdf/');
    await hydrated(page);
    await dismissCookies(page);
    await page.evaluate(() => scrollTo(0, 0));
    const { taken } = await dropOn(page, 'h1', [pdfFile('gen-paginas-mistas.pdf', 'first.pdf'), pdfFile('gen-ja-otimizado.pdf', 'second.pdf')]);
    expect(taken).toBe(true);
    const rows = page.locator('#fo-tool-root .fo-merge-panel .fo-merge__row');
    await expect(rows).toHaveCount(2, { timeout: 30_000 });
    await expect(rows.nth(0)).toContainText('first.pdf');
    await expect(rows.nth(1)).toContainText('second.pdf');
    await panelInView(page);
  });
});

/**
 * A dragover on the body and a drop on the H1 that carry `types` ("Files", or "text/plain" for a drag of text), with the
 * dropEffect `effect` before the page sees them; returns what the page did. A DataTransfer built in the page ignores every
 * write to its dropEffect outside a real drag, in both browsers (it stays "none", so a test of it passes without the
 * change): the events get a stand-in of their own (an own `dataTransfer` on the event), which keeps what the page writes.
 */
async function dragOverWith(page: Page, types: string[], effect: string): Promise<{ overPrevented: boolean; effect: string; dropPrevented: boolean }> {
  return page.evaluate(
    ([kinds, start]) => {
      const transfer = { types: kinds, dropEffect: start, effectAllowed: 'all', files: [] as File[], items: [] as DataTransferItem[] };
      const fire = (type: string, target: Element | null) => {
        const event = new DragEvent(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'dataTransfer', { value: transfer });
        (target ?? document.body).dispatchEvent(event);
        return event;
      };
      const over = fire('dragover', document.body);
      const after = transfer.dropEffect;
      const drop = fire('drop', document.querySelector('h1'));
      return { overPrevented: over.defaultPrevented, effect: after, dropPrevented: drop.defaultPrevented };
    },
    [types, effect] as const,
  );
}

// F10 p-11: the cursor never promises what the page does not do.
test.describe('a page with no file tool refuses a dragged file', () => {
  for (const path of ['/', '/money-calculators/']) {
    test(`${path}: the dragover of files says "none" and the drop is refused; a drag of text is left alone`, async ({ page }) => {
      expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
      await dismissCookies(page);
      expect(await dragOverWith(page, ['Files'], 'copy')).toEqual({ overPrevented: true, effect: 'none', dropPrevented: true });
      expect(await dragOverWith(page, ['text/plain'], 'copy'), 'a drag of text is not touched').toEqual({ overPrevented: false, effect: 'copy', dropPrevented: false });
    });
  }
});
