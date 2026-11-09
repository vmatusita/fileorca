import { expect, test, type Page } from '@playwright/test';
import { fixtureFile } from './lib/matrix.ts';
import { imageSize, metadataReport } from './lib/images.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';
import { meanAbsDiff, thumbnail } from './lib/pixels.ts';
import { choosePdfs, filesOf, openTool, pdfBytes, pdfFile, pdfOracle, soundPdf, takePdfDownload } from './lib/pdf-tools.ts';
import { drawWithPdfjs } from './lib/pdfjs-read.ts';
import imagesTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import compressTexts from '../../src/tools/compress-pdf/i18n/en.ts';

// The paths of the engine that the CI browsers do not take by themselves (DECISOES § 102): the page path of a worker
// without OffscreenCanvas (review a-03), and the code of the engine that does not arrive, offline or after a deploy, in
// which case a good file is not called damaged and the panel never hangs (review a-01 and a-02). One load per test.

test('without OffscreenCanvas in the worker, the engine runs on the page and still delivers', async ({ page }) => {
  // The image engine's worker (the one without pdf-lib) loses its OffscreenCanvas before its own code runs.
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body.includes('PDFDocument') ? body : `delete globalThis.OffscreenCanvas;\n${body}` });
  });
  const pagePath: string[] = [];
  const wasm: string[] = [];
  page.on('request', (request) => {
    if (/\/_astro\/process[\w.-]*\.js$/.test(request.url())) pagePath.push(request.url());
    if (/\.wasm$/.test(request.url())) wasm.push(new URL(request.url()).pathname.replace(/[-.][\w-]{8}\.wasm$/, '.wasm'));
  });
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  // The pointer over the panel warms the engine first, as a person's would (review e-01).
  await page.locator('.fo-slot').hover();
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.fo-result')).toContainText(/Done! Your image is \d+% lighter\./);
  expect(pagePath.length, 'the page path imported the engine').toBeGreaterThan(0);
  // Each codec is fetched once: the worker, which does no image work here, does not warm a copy of its own.
  expect(wasm.length, 'a codec was fetched').toBeGreaterThan(0);
  expect(wasm.filter((name, index) => wasm.indexOf(name) !== index), 'no codec fetched twice').toEqual([]);
});

const LOAD = /Oli couldn't load what she needs to read [\w-]+\.jpg\. Check your connection and reload the page\./;

async function errors(page: Page) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'tool_error').map((entry) => (entry[2] as { reason: string }).reason);
}

test('a good file whose engine cannot load is not called damaged, and says to reload', async ({ page }) => {
  await page.route(/\/_astro\/engine-client[\w.-]*\.js$/, (route) => route.abort());
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-drop').getByText(LOAD)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/is damaged/)).toHaveCount(0);
  expect(await errors(page)).toEqual(['load']);
});

// The codecs load inside the engine on first use: a .wasm that does not arrive is 'load' too, never a damaged file or a
// browser that cannot write JPG, and the file is tried again when an option changes (review p2-motor-01, DECISOES § 104).
test('a codec that cannot load says to reload, and the file is tried again once it can', async ({ page }) => {
  // The page path, so the codecs are fetched by the page, where page.route holds in every browser (the WebKit of the
  // Linux CI has OffscreenCanvas in the worker, whose own fetches page.route does not stop). The worker path loads
  // its codecs through the same loading() of the engine.
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body.includes('PDFDocument') ? body : `delete globalThis.OffscreenCanvas;\n${body}` });
  });
  await page.route(/\.wasm$/, (route) => route.abort());
  await page.goto('/heic-to-jpg/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('heic-06-iphone7-paisagem-gps.heic'));
  await expect(page.locator('.fo-drop').getByText(/Oli couldn't load what she needs to read [\w-]+\.heic\./)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/is damaged/)).toHaveCount(0);

  await page.goto('/compress-image/');
  await hydrated(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-drop').getByText(LOAD)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/can't save|is damaged/)).toHaveCount(0);
  expect(await errors(page)).toEqual(['load']);
  // The network is back: the next run takes the same file again, since 'load' is no fault of the file.
  await page.unroute(/\.wasm$/);
  await page.locator('label.fo-seg__opt', { has: page.locator('input[value="strong"]') }).click();
  await expect(page.locator('.fo-result')).toContainText(/Done! Your image is \d+% lighter\./, { timeout: 30_000 });
});

test('a PDF worker that cannot start ends in an error, not in "Building your PDF" for ever', async ({ page }) => {
  // The PDF worker is the worker chunk that carries pdf-lib; the image engine's worker goes through untouched.
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes('PDFDocument')) await route.abort();
    else await route.fulfill({ response, body });
  });
  await page.goto('/image-to-pdf/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.getByText(LOAD).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Building your PDF')).toHaveCount(0);
  expect(await errors(page)).toEqual(['load']);
});

// ---- The PDF tools without OffscreenCanvas in the worker (F5a, DECISOES § 22 and § 102) -------------------------------
// Where the drawing or the re-encoding of a PDF tool depends on OffscreenCanvas (PDF to JPG, Compress Strong, the
// thumbnails of the page grid), a worker without it hands the work to the page: PDF.js draws there, with its parser in
// the worker of the page path (src/engine/pdf/pdfjs-core.ts), and the PDF files are still written by the PDF worker. The
// PDF worker is served here with "delete globalThis.OffscreenCanvas;" in front, the way the image test above does it, so
// the path is taken in both browsers (the WebKit of the Windows takes it anyway; the Chromium and the Linux WebKit do
// not). Each test says the page path ran by the files it fetched: the PDF.js worker of the page, and never the one the PDF
// worker fetches when it can draw. What came out is read in Node, by readers that are not the engine.

const PAGE_PARSER = /\/_astro\/pdfjs-core[-.][\w-]+\.js$/;
const WORKER_PARSER = /\/_astro\/pdf\.worker[-.][\w-]+\.js$/;
const PAGE_RENDER = /\/_astro\/render[-.][\w-]+\.js$/;

/** Takes OffscreenCanvas from the PDF worker (the worker chunk that carries pdf-lib) and notes what is fetched. */
async function withoutPdfWorkerCanvas(page: Page): Promise<{ fetched: (pattern: RegExp) => string[] }> {
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body.includes('PDFDocument') ? `delete globalThis.OffscreenCanvas;\n${body}` : body });
  });
  const urls: string[] = [];
  // The context sees the requests of the workers too (the PDF.js of the worker path is fetched from inside one).
  page.context().on('request', (request) => urls.push(new URL(request.url()).pathname));
  return { fetched: (pattern) => urls.filter((url) => pattern.test(url)) };
}

/** The page path, and only it: the page's PDF.js worker and the page-side renderer came, the PDF worker's PDF.js did not. */
function expectPagePath(seen: { fetched: (pattern: RegExp) => string[] }): void {
  expect(seen.fetched(PAGE_PARSER).length, 'the PDF.js worker of the page path was fetched').toBeGreaterThan(0);
  expect(seen.fetched(PAGE_RENDER).length, 'the page-side renderer was fetched').toBeGreaterThan(0);
  expect(seen.fetched(WORKER_PARSER), 'the PDF.js of the PDF worker was not fetched').toEqual([]);
}

/** 24 x 24 grid of area averages of the gray levels of an RGBA picture: what pixels.ts reads from a decoded image. */
function grayGrid(rgba: Uint8ClampedArray, width: number, height: number, n = 24): number[] {
  const grid: number[] = [];
  for (let ty = 0; ty < n; ty += 1) {
    for (let tx = 0; tx < n; tx += 1) {
      const x0 = Math.floor((tx * width) / n);
      const x1 = Math.max(x0 + 1, Math.floor(((tx + 1) * width) / n));
      const y0 = Math.floor((ty * height) / n);
      const y1 = Math.max(y0 + 1, Math.floor(((ty + 1) * height) / n));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const i = (y * width + x) * 4;
          sum += 0.299 * (rgba[i] as number) + 0.587 * (rgba[i + 1] as number) + 0.114 * (rgba[i + 2] as number);
          count += 1;
        }
      }
      grid.push(sum / count);
    }
  }
  return grid;
}

/** The gray grid of page `pageNumber` of a PDF as PDF.js draws it in Node (the reference the browser's picture is held to). */
async function nodeGrid(bytes: Uint8Array, pageNumber: number, scale: number): Promise<number[]> {
  const drawn = await drawWithPdfjs(bytes, pageNumber, scale);
  return grayGrid(drawn.data, drawn.width, drawn.height);
}

/** A picture of a page and the page drawn in Node must agree on where the dark and the light parts are (one lossy step: under 6). */
const SAME_PICTURE = 6;

test('PDF to JPG without OffscreenCanvas in the worker: the page draws every page, the sizes and the picture are right', async ({ page }) => {
  const seen = await withoutPdfWorkerCanvas(page);
  await openTool(page, '/pdf-to-jpg/');
  await page.locator('.fo-seg__opt').filter({ hasText: imagesTexts.panel.options.low }).first().click();
  const files = ['pdf-escaneado-01-pagina-livro-cor.pdf', 'gen-paginas-mistas.pdf'];
  // The pointer over the panel warms the engine first, as a person's would; the worker has nothing to draw with.
  await page.locator('.fo-slot').hover();
  await choosePdfs(page, files.map((name) => pdfFile(name)));
  const outs = filesOf(await takePdfDownload(page, 90_000));
  expectPagePath(seen);
  expect(outs.map((out) => out.name)).toEqual([
    'pdf-escaneado-01-pagina-livro-cor-page-1.jpg',
    ...Array.from({ length: 8 }, (_, i) => `gen-paginas-mistas-page-${i + 1}.jpg`),
  ]);
  // Every picture has the size of its page at 72 ppi (the turn of the page applied), within a pixel, and no Exif or GPS.
  for (const fixture of files) {
    const oracle = pdfOracle(fixture);
    for (const [i, [w = 0, h = 0]] of (oracle.sizes ?? []).entries()) {
      const turned = oracle.rotate?.[i] === 90 || oracle.rotate?.[i] === 270;
      const out = outs.find((item) => item.name === `${fixture.replace(/\.pdf$/, '')}-page-${i + 1}.jpg`);
      const size = imageSize(out?.bytes as Uint8Array);
      expect(size.format).toBe('jpeg');
      expect(Math.abs(size.displayWidth - Math.floor(turned ? h : w)), `${fixture} page ${i + 1} width`).toBeLessThanOrEqual(1);
      expect(Math.abs(size.displayHeight - Math.floor(turned ? w : h)), `${fixture} page ${i + 1} height`).toBeLessThanOrEqual(1);
      const meta = metadataReport(out?.bytes as Uint8Array);
      expect(meta.exif || meta.gps, `${fixture} page ${i + 1}: no Exif, no GPS`).toBe(false);
    }
  }
  // The picture of the scanned page is the page: the browser decodes it and its light and dark parts match PDF.js in Node.
  const decoded = await thumbnail(page, outs[0]?.bytes as Uint8Array, 'image/jpeg');
  expect(decoded.ok, decoded.error).toBe(true);
  expect(meanAbsDiff(decoded.gray, await nodeGrid(pdfBytes(files[0] as string), 1, 1))).toBeLessThan(SAME_PICTURE);
  expect(await errors(page)).toEqual([]);
});

test('Compress PDF (Strong) without OffscreenCanvas in the worker: the page draws the pages, the worker writes the PDF', async ({ page }) => {
  const seen = await withoutPdfWorkerCanvas(page);
  await openTool(page, '/compress-pdf/');
  await page.locator('.fo-seg__opt').filter({ hasText: compressTexts.panel.options.strong }).first().click();
  // The photos must gain; the text pages as pictures are bigger than their text, and a result that is not smaller comes
  // back as the original, byte for byte (decision 4), on the page path as on the worker path.
  const files = ['gen-fotos.pdf', 'gen-paginas-mistas.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf'];
  await page.locator('.fo-slot').hover();
  await choosePdfs(page, files.map((name) => pdfFile(name)));
  const outs = filesOf(await takePdfDownload(page, 90_000));
  expectPagePath(seen);
  expect(outs.map((out) => out.name)).toEqual(files.map((name) => `${name.replace(/\.pdf$/, '')}-compressed.pdf`));
  for (const [i, fixture] of files.entries()) {
    const out = outs[i]?.bytes as Uint8Array;
    const original = pdfBytes(fixture);
    expect(out.length, fixture).toBeLessThanOrEqual(original.length);
    if (Buffer.compare(Buffer.from(out), original) === 0) {
      expect(fixture, 'the photos gain').not.toBe('gen-fotos.pdf');
      continue;
    }
    // A sound PDF of the same pages, each one now a picture of the size of the visible page (the text is no longer text).
    const read = await soundPdf(out);
    const oracle = pdfOracle(fixture);
    expect(read.pages, fixture).toHaveLength(oracle.pages ?? 0);
    for (const [p, shownPage] of read.pages.entries()) {
      const [w = 0, h = 0] = oracle.sizes?.[p] ?? [];
      const turned = oracle.rotate?.[p] === 90 || oracle.rotate?.[p] === 270;
      expect(Math.abs(shownPage.shown.width - (turned ? h : w)), `${fixture} page ${p + 1} width`).toBeLessThanOrEqual(1.5);
      expect(Math.abs(shownPage.shown.height - (turned ? w : h)), `${fixture} page ${p + 1} height`).toBeLessThanOrEqual(1.5);
      expect(shownPage.images, `${fixture} page ${p + 1} is a picture`).toBeGreaterThanOrEqual(1);
      expect(shownPage.texts, `${fixture} page ${p + 1} has no text`).toEqual([]);
    }
    // And its first page looks like the first page of the original (100 ppi, JPEG quality 60: a lossy step and a resample).
    expect(meanAbsDiff(await nodeGrid(out, 1, 0.5), await nodeGrid(pdfBytes(fixture), 1, 0.5)), `${fixture} first page`).toBeLessThan(SAME_PICTURE + 2);
  }
  expect(await errors(page)).toEqual([]);
});

test('The page grid without OffscreenCanvas in the worker: the page draws the thumbnails of every page', async ({ page }) => {
  const seen = await withoutPdfWorkerCanvas(page);
  await openTool(page, '/reorder-pdf-pages/');
  await page.locator('.fo-slot').hover();
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  const oracle = pdfOracle('gen-paginas-mistas.pdf');
  const total = oracle.pages ?? 0;
  // F14 (DECISOES § 618): the cells have the height of their pages, so the grid is brought on screen, as a person
  // scrolls to it, for every cell to draw (pictures are drawn only near the screen, § 152).
  await expect(page.locator('.fo-pages__grid > li')).toHaveCount(total, { timeout: 60_000 });
  await page.locator('.fo-pages__grid > li').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.fo-page__sheet img')).toHaveCount(total, { timeout: 60_000 });
  expectPagePath(seen);
  // Every picture is decoded, as wide as the grid asks (F14, DECISOES § 619: the width of its sheet times the pixel
  // ratio, rounded up to 60 px, at most 720), as tall as its page is (the turn of the page applied), and has dark marks on
  // a light sheet: a page, not an empty canvas.
  const asked = await page
    .locator('.fo-page__sheet')
    .first()
    .evaluate((sheet) => Math.max(60, Math.ceil(Math.min(720, sheet.getBoundingClientRect().width * devicePixelRatio) / 60) * 60));
  const pictures = await page.locator('.fo-page__sheet img').evaluateAll((images) =>
    Promise.all(
      (images as HTMLImageElement[]).map(async (image) => {
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let dark = 0;
        let light = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = ((pixels[i] as number) + (pixels[i + 1] as number) + (pixels[i + 2] as number)) / 3;
          if (gray < 100) dark += 1;
          else if (gray > 200) light += 1;
        }
        return { width: image.naturalWidth, height: image.naturalHeight, dark, light };
      }),
    ),
  );
  expect(pictures).toHaveLength(total);
  for (const [i, picture] of pictures.entries()) {
    const [w = 1, h = 1] = oracle.sizes?.[i] ?? [];
    const turned = oracle.rotate?.[i] === 90 || oracle.rotate?.[i] === 270;
    expect(Math.abs(picture.width - asked), `page ${i + 1} width`).toBeLessThanOrEqual(2);
    expect(Math.abs(picture.height - (asked * (turned ? w : h)) / (turned ? h : w)), `page ${i + 1} height`).toBeLessThanOrEqual(2);
    expect(picture.dark, `page ${i + 1} has marks`).toBeGreaterThan(0);
    expect(picture.light, `page ${i + 1} has a light sheet`).toBeGreaterThan(picture.width * picture.height * 0.5);
  }
  expect(await errors(page)).toEqual([]);
});
