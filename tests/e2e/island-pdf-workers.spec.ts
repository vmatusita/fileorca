import { expect, test, type Page } from '@playwright/test';
import { dropOn, startOver } from './lib/page.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// F14 (item 8, E-4; criterion 8; PENDENCIAS F5a E-4; DECISOES § 630): on the page path (a PDF worker without
// OffscreenCanvas: the WebKit of Windows takes it by itself, the Chromium is made to), each file the grid draws had a
// PDF.js parser worker of its own (`new Worker(pdfjs-core)`, name "fileorca-pdfjs") that was never ended: PDF.js does not
// destroy a PDFWorker handed to it, and PDFWorker.destroy() does not end its port. Now closing the document ends it.
// The Worker constructor is a spy (an init script) that writes down every worker made and every terminate.
//
// The Merge case (taking a row out of the list ends the worker of that file's view) belongs to the page view of the
// Merge: it is added here with `pdfjsWorkers`, `expectEnded` and `alive`, the same way, once the view is in.

const MIXED = 'gen-paginas-mistas.pdf';
const OTHER = 'pdf-escaneado-01-pagina-livro-cor.pdf';
const root = (page: Page) => page.locator('#fo-tool-root');
const cells = (page: Page) => root(page).locator('.fo-pages__grid > li');

interface Made {
  name: string;
  url: string;
  ended: boolean;
}

/** The spy: every Worker made by the page and whether it was terminated. Installed before the page's own scripts. */
async function spyOnWorkers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const Native = window.Worker;
    const made: { name: string; url: string; ended: boolean }[] = [];
    (window as unknown as { __workers: typeof made }).__workers = made;
    class Spy extends Native {
      entry: { name: string; url: string; ended: boolean };
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        this.entry = { name: options?.name ?? '', url: String(url), ended: false };
        made.push(this.entry);
      }
      override terminate(): void {
        this.entry.ended = true;
        super.terminate();
      }
    }
    window.Worker = Spy;
  });
}

/** The PDF worker loses its OffscreenCanvas before its own code runs (the `withoutPdfWorkerCanvas` of engine-paths.spec.ts). */
async function onThePagePath(page: Page): Promise<void> {
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body.includes('PDFDocument') ? `delete globalThis.OffscreenCanvas;\n${body}` : body });
  });
}

/** The PDF.js parser workers made so far, in order. */
const pdfjsWorkers = (page: Page): Promise<Made[]> =>
  page.evaluate(() => ((window as unknown as { __workers: { name: string; url: string; ended: boolean }[] }).__workers ?? []).filter((made) => made.name === 'fileorca-pdfjs').map((made) => ({ ...made })));

/** How many PDF.js parser workers are alive now. */
const alive = async (page: Page): Promise<number> => (await pdfjsWorkers(page)).filter((made) => !made.ended).length;

/** Every PDF.js worker made before `count` workers had been made is ended (the files before it were let go). */
async function expectEnded(page: Page, count: number, label: string): Promise<void> {
  await expect
    .poll(async () => (await pdfjsWorkers(page)).slice(0, count).filter((made) => !made.ended).length, { message: `${label}: the PDF.js workers of the file before are terminated`, timeout: 15_000 })
    .toBe(0);
}

/** Waits until the picture of the first cell is drawn (on the page path, by a PDF.js worker of this file). */
async function firstDrawn(page: Page): Promise<void> {
  const img = cells(page).first().locator('.fo-page__sheet img');
  await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0).catch(() => false), { timeout: 30_000 }).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await spyOnWorkers(page);
  await onThePagePath(page);
});

test('the grid: changing the file and Start over end the PDF.js worker of the file before', async ({ page }) => {
  await openTool(page, '/delete-pdf-pages/');
  await choosePdfs(page, [pdfFile(MIXED)]);
  await expect(cells(page)).toHaveCount(8, { timeout: 30_000 });
  await firstDrawn(page);
  // The page path was taken: the pictures came from a PDF.js worker of this file, alive while the grid shows it.
  const first = await pdfjsWorkers(page);
  expect(first.length, 'a PDF.js worker drew the first file').toBeGreaterThan(0);
  expect(await alive(page), 'one PDF.js worker for the file on screen').toBe(1);

  // Another file, dropped on the ready card: the worker of the first one ends.
  const taken = await dropOn(page, '#fo-tool-root .fo-ready', [pdfFile(OTHER)]);
  expect(taken.taken, 'the page took the drop').toBe(true);
  await expect(cells(page)).toHaveCount(1, { timeout: 30_000 });
  await firstDrawn(page);
  await expectEnded(page, first.length, 'after another file');
  expect(await alive(page), 'one PDF.js worker for the file on screen').toBe(1);

  // Start over (after a result, where the button is): the worker of the second file ends too, and none is left.
  const second = (await pdfjsWorkers(page)).length;
  await choosePdfs(page, [pdfFile(MIXED)]);
  await expect(cells(page)).toHaveCount(8, { timeout: 30_000 });
  await firstDrawn(page);
  await expectEnded(page, second, 'after the file chosen again');
  await cells(page).nth(1).locator('.fo-page__main').click();
  await root(page).getByRole('button', { name: /^Delete/ }).first().click();
  await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
  await startOver(page);
  const all = (await pdfjsWorkers(page)).length;
  await expectEnded(page, all, 'after Start over');
  expect(await alive(page)).toBe(0);
});

test('a file changed before its pictures came leaves no PDF.js worker behind (a late picture does not open it again)', async ({ page }) => {
  await openTool(page, '/delete-pdf-pages/');
  await choosePdfs(page, [pdfFile(MIXED)]);
  // The grid asks its pictures as soon as it shows: the file goes before they come.
  await expect(cells(page)).toHaveCount(8, { timeout: 30_000 });
  await choosePdfs(page, [pdfFile(OTHER)]);
  await expect(cells(page)).toHaveCount(1, { timeout: 30_000 });
  await firstDrawn(page);
  // Whatever the first file had asked, only the second one's worker is alive, also a beat later.
  await expect.poll(() => alive(page), { timeout: 15_000 }).toBe(1);
  await page.waitForTimeout(1_000);
  expect(await alive(page), 'one PDF.js worker, the one of the file on screen').toBe(1);
});

test('PDF to JPG on the page path: the run ends the PDF.js worker it opened', async ({ page }) => {
  await openTool(page, '/pdf-to-jpg/');
  await choosePdfs(page, [pdfFile(MIXED)]);
  await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 90_000 });
  const made = await pdfjsWorkers(page);
  expect(made.length, 'the run drew on the page path').toBeGreaterThan(0);
  await expectEnded(page, made.length, 'after the run');
  // Start over and a second file: still none left once its run is over.
  await startOver(page);
  await choosePdfs(page, [pdfFile(OTHER)]);
  await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 90_000 });
  await expectEnded(page, (await pdfjsWorkers(page)).length, 'after the second run');
});
