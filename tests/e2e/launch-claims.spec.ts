import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { expect, test, type Page } from '@playwright/test';
import { fixtureFile, takeDownload } from './lib/matrix.ts';
import { dismissCookies, hydrated, startOver, type TestFile } from './lib/page.ts';
import { actionOf } from './lib/pdf-privacy.ts';
import { pdfFile } from './lib/pdf-tools.ts';
import { arriveFrom, inboxGone } from './lib/inbox.ts';
import compressPdfTexts from '../../src/tools/compress-pdf/i18n/en.ts';
import mergePdfTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import imagesPdfTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import pngPdfTexts from '../../src/tools/pdf-to-jpg/presets/to-png/i18n/en.ts';
import organizePdfTexts from '../../src/tools/organize-pdf/i18n/en.ts';
import protectPdfTexts from '../../src/tools/protect-pdf/i18n/en.ts';
import extractPdfTexts from '../../src/tools/split-pdf/presets/extract-pages/i18n/en.ts';

// The technical claims of the launch texts (docs/lancamento/show-hn.md and, from the F5b, product-hunt.md; DECISOES § 98),
// proven over the dist/
// in both browsers, on a JPEG codec, the libheif decoder, the PDF worker and, since F5a, qpdf (Compress PDF,
// Protect PDF) and PDF.js (PDF to JPG), since the F17 the AVIF of AVIF to JPG and Convert to WebP, and since the F18 the
// five new pages (Remove EXIF data, Flip image, Organize PDF, Extract pages from PDF and PDF to PNG):
// 1. no byte of the file leaves the browser: every request the page and its workers make is a GET to the
//    site's own origin, with no body;
// 2. once the page and the codec are loaded, the tool keeps working offline: the network goes off and the
//    next file is processed and downloaded.

const JPEG = [0xff, 0xd8, 0xff];
const PDF = [0x25, 0x50, 0x44, 0x46];
const ZIP = [0x50, 0x4b];
/** "ftypavif": the first box of an AVIF, at byte 4. */
const AVIF = [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66];

interface Case {
  path: string;
  first: string;
  second: string;
  /** The first bytes of what each file gives back. */
  magic: readonly number[];
  /** Where the magic starts (an AVIF says what it is at byte 4, after the size of its first box). */
  at?: number;
  /** Where the files come from: the image fixtures, unless the case says otherwise. */
  load?: (name: string) => TestFile;
  /** An option the tool needs set before the file arrives. Start over clears it, so it is set again for the second file. */
  setup?: (page: Page) => Promise<void>;
  /** What the tool needs once the file is in (a password and the button), also done again for the second file. */
  act?: (page: Page) => Promise<void>;
}

const option = (page: Page, label: string) => page.locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const PASSWORD = 'launch-claims-password';

const CASES: Case[] = [
  { path: '/compress-image/', first: 'jpg-02-iphone6-paisagem-gps.jpg', second: 'jpg-01-pixel2-retrato-gps.jpg', magic: JPEG },
  { path: '/heic-to-jpg/', first: 'heic-06-iphone7-paisagem-gps.heic', second: 'heic-04-iphone11promax-retrato-livephoto-gps.heic', magic: JPEG },
  { path: '/image-to-pdf/', first: 'jpg-02-iphone6-paisagem-gps.jpg', second: 'gen-png-transparente.png', magic: PDF },
  // F17 (criterion 4 of the run; DECISOES § 711): AVIF to JPG reads the AVIF (with the decoder of the site where the browser
  // cannot; the one AVIF fixture goes in twice), and Convert to WebP writes AVIF with the encoder of the site, which the
  // first file fetches and the second, offline, uses again.
  { path: '/avif-to-jpg/', first: 'gen-avif.avif', second: 'gen-avif.avif', magic: JPEG },
  { path: '/convert-to-webp/', first: 'gen-jpg-01-orientacao6.jpg', second: 'gen-png-transparente.png', magic: AVIF, at: 4, setup: (page) => option(page, 'AVIF') },
  // Lossless is qpdf alone: no codec of the images to fetch for the second file.
  {
    path: '/compress-pdf/',
    first: 'gen-fotos.pdf',
    second: 'gen-paginas-mistas.pdf',
    magic: PDF,
    load: (name) => pdfFile(name),
    setup: (page) => option(page, compressPdfTexts.panel.options.lossless),
  },
  // PDF.js draws the pages; what it fetches for the first file (the standard fonts) serves the second one too.
  {
    path: '/pdf-to-jpg/',
    first: 'gen-paginas-mistas.pdf',
    second: 'gen-acoes.pdf',
    magic: ZIP,
    load: (name) => pdfFile(name),
    setup: (page) => option(page, imagesPdfTexts.panel.options.low),
  },
  // qpdf encrypts: the password stays in the page and the work is done in the worker, with nothing sent.
  {
    path: '/protect-pdf/',
    first: 'gen-paginas-mistas.pdf',
    second: 'gen-ja-otimizado.pdf',
    magic: PDF,
    load: (name) => pdfFile(name),
    act: async (page) => {
      await page.getByLabel(protectPdfTexts.panel.options.passwordLabel, { exact: true }).fill(PASSWORD);
      await page.getByLabel(protectPdfTexts.panel.options.confirmLabel, { exact: true }).fill(PASSWORD);
      await page.getByRole('button', { name: actionOf(protectPdfTexts) }).click();
    },
  },
  // F18 (criterion 5 of the run; review E-1): the five new pages. Remove EXIF data hands the file back without its metadata
  // without decoding it; Flip image mirrors it in the worker of its parent, which the second file, offline, uses again.
  { path: '/remove-exif-data/', first: 'jpg-02-iphone6-paisagem-gps.jpg', second: 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg', magic: JPEG },
  { path: '/rotate-image/flip/', first: 'jpg-02-iphone6-paisagem-gps.jpg', second: 'gen-jpg-01-orientacao6.jpg', magic: JPEG },
  // Organize PDF draws the grid with PDF.js and writes the PDF in the worker: the grid is drawn again offline, a page moves,
  // and the action saves it.
  {
    path: '/organize-pdf/',
    first: 'gen-paginas-mistas.pdf',
    second: 'gen-acoes.pdf',
    magic: PDF,
    load: (name) => pdfFile(name),
    act: async (page) => {
      await expect(page.locator('#fo-tool-root .fo-pages__grid .fo-page__sheet img').first(), 'the grid was drawn').toBeVisible({ timeout: 30_000 });
      await page.getByRole('button', { name: 'Move page 2 earlier', exact: true }).click();
      await page.getByRole('button', { name: actionOf(organizePdfTexts) }).click();
    },
  },
  // Extract pages: the pages are picked by number, typed in the page, and go together into one new PDF.
  {
    path: '/split-pdf/extract-pages/',
    first: 'gen-paginas-mistas.pdf',
    second: 'gen-acoes.pdf',
    magic: PDF,
    load: (name) => pdfFile(name),
    act: async (page) => {
      const action = page.getByRole('button', { name: actionOf(extractPdfTexts) });
      await expect(action, 'the file is read').toBeVisible({ timeout: 30_000 });
      await page.getByLabel('Pick pages by number').fill('2');
      await page.getByRole('button', { name: 'Pick these' }).click();
      await action.click();
    },
  },
  // PDF to PNG: PDF.js draws the pages as for PDF to JPG, and the PNG is written without a codec to fetch.
  {
    path: '/pdf-to-jpg/to-png/',
    first: 'gen-paginas-mistas.pdf',
    second: 'gen-acoes.pdf',
    magic: ZIP,
    load: (name) => pdfFile(name),
    setup: (page) => option(page, pngPdfTexts.panel.options.low),
  },
  // F5b (prompt decision 7): the same claims through a file guide, which embeds the tool with its own island and entry.
  { path: '/guides/heic-to-jpg-on-windows/', first: 'heic-06-iphone7-paisagem-gps.heic', second: 'heic-04-iphone11promax-retrato-livephoto-gps.heic', magic: JPEG },
  {
    path: '/guides/why-is-my-pdf-so-large/',
    first: 'gen-fotos.pdf',
    second: 'gen-paginas-mistas.pdf',
    magic: PDF,
    load: (name) => pdfFile(name),
    setup: (page) => option(page, compressPdfTexts.panel.options.lossless),
  },
];

for (const { path, first, second, magic, at = 0, load = fixtureFile, setup, act } of CASES) {
  test(`${path}: no byte of the file leaves the browser, and the tool keeps working offline`, async ({ page, context }) => {
    const requests: { url: string; method: string; body: number }[] = [];
    context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postDataBuffer()?.length ?? 0 }));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    // The pointer leaves the tool: nothing warms the codecs before the first file, as when a file is dropped anywhere on
    // the page (UX-18 A) or pasted. Where the click on the notice left it depended on the fonts of each system (F13a,
    // DECISOES § 534).
    await page.mouse.move(0, 0);
    const origin = new URL(page.url()).origin;

    await setup?.(page);
    await page.setInputFiles('input[type="file"]', load(first));
    await act?.(page);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
    const online = await takeDownload(page);
    expect([...online.bytes.subarray(at, at + magic.length)], `${first}: a real result`).toEqual([...magic]);

    // What the page and its workers asked for while the file was read, processed and downloaded.
    const sent = requests.filter((request) => !/^(blob|data|about):/.test(request.url));
    expect(sent.length, 'the page, its scripts and the codec were requested').toBeGreaterThan(2);
    expect(sent.filter((request) => new URL(request.url).origin !== origin), 'nothing goes to another origin').toEqual([]);
    expect(sent.filter((request) => request.method !== 'GET' || request.body > 0), 'nothing is sent with a body').toEqual([]);
    // Nor in the address: no request carries a query string (second pass p2-integridade-03).
    expect(sent.filter((request) => new URL(request.url).search !== ''), 'nothing is sent in a query string').toEqual([]);

    // The network goes off; the next file goes through the same loaded worker and codec.
    await context.setOffline(true);
    const before = requests.length;
    await startOver(page);
    await setup?.(page);
    await page.setInputFiles('input[type="file"]', load(second));
    await act?.(page);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
    const offline = await takeDownload(page);
    expect([...offline.bytes.subarray(at, at + magic.length)], `${second}: a real result offline`).toEqual([...magic]);
    expect(requests.slice(before).filter((request) => !/^(blob|data|about):/.test(request.url)), 'offline, nothing was asked of the network').toEqual([]);
    await context.setOffline(false);
  });
}

// F15 (decision 6 and criterion 4 of the run; DECISOES § 655): the PDFs a next-step chip takes to a tool with an action
// (here Compress PDF to Merge PDF) go through the inbox of the device and wait for the action; from the page that receives
// them to the merged PDF, nothing goes to another origin, with a body or with a query string. The inbox is written in the
// page as the chip writes it (tests/e2e/lib/inbox.ts); the Cache Storage of the WebKit of Playwright does not outlive a
// reload while service workers are blocked (docs/claude/playwright.md, F13a), so this test allows them.
test.describe(() => {
  test.use({ serviceWorkers: 'allow' });

  test('/merge-pdf/ reached by a chip: the PDFs wait for the action, and no byte of them leaves the browser', async ({ page, context }) => {
    const requests: { url: string; method: string; body: number }[] = [];
    context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postDataBuffer()?.length ?? 0 }));
    const response = await page.goto('/merge-pdf/');
    expect(response?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    await page.mouse.move(0, 0);
    const origin = new URL(page.url()).origin;
    await arriveFrom(page, 'merge-pdf', 'compress-pdf', [pdfFile('gen-paginas-mistas.pdf', 'first.pdf'), pdfFile('gen-acoes.pdf', 'second.pdf')]);
    const merge = page.getByRole('button', { name: actionOf(mergePdfTexts) });
    await expect(merge, 'the PDFs wait for the action').toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-result')).toHaveCount(0);
    await merge.click();
    await expect(page.locator('.fo-result__from'), 'the note of where they came from').toBeVisible({ timeout: 45_000 });
    const merged = await takeDownload(page);
    expect([...merged.bytes.subarray(0, PDF.length)], 'a real result').toEqual([...PDF]);
    expect(await inboxGone(page), 'the inbox is gone').toEqual({ inbox: false, choice: null });

    const sent = requests.filter((request) => !/^(blob|data|about):/.test(request.url));
    expect(sent.length, 'the page, its scripts and the PDF worker were requested').toBeGreaterThan(2);
    expect(sent.filter((request) => new URL(request.url).origin !== origin), 'nothing goes to another origin').toEqual([]);
    expect(sent.filter((request) => request.method !== 'GET' || request.body > 0), 'nothing is sent with a body').toEqual([]);
    expect(sent.filter((request) => new URL(request.url).search !== ''), 'nothing is sent in a query string').toEqual([]);
  });
});

// F19a (decision 7; DECISOES § 759): what the How it works page says and no test proved before. The list of the sentences
// of that page and the test that proves each one is tests/unit/how-it-works-claims.test.ts.

// "Download saves it from the memory of the browser": the result is a blob: address the page made from bytes it holds,
// and taking it asks nothing of the network.
test('Download saves the result from the memory of the browser: its address is a blob: made in the page', async ({ page, context }) => {
  const requests: string[] = [];
  const response = await page.goto('/compress-image/');
  expect(response?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  await page.mouse.move(0, 0);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  context.on('request', (request) => requests.push(request.url()));
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.fo-btn--download').click()]);
  expect(download.url(), 'the address of what Download saves').toMatch(/^blob:/);
  expect(new URL(download.url().slice('blob:'.length)).origin, 'a blob: of the page itself').toBe(new URL(page.url()).origin);
  const saved = await download.path();
  expect(saved, 'the download was saved').toBeTruthy();
  expect([...new Uint8Array(readFileSync(saved ?? '')).subarray(0, JPEG.length)], 'a real JPEG').toEqual([...JPEG]);
  expect(requests.filter((url) => !/^(blob|data|about):/.test(url)), 'taking the result asks nothing of the network').toEqual([]);
});

// "The tool does the work there, with the code your browser downloaded from fileorca.com": Compress image writes the JPEG
// with MozJPEG, whose .wasm the page fetches from its own origin, with a GET and no body, the first time it is needed.
test('Compress image makes a JPEG smaller with the MozJPEG .wasm, fetched from the site', async ({ page, context }) => {
  const requests: { url: string; method: string; body: number }[] = [];
  context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postDataBuffer()?.length ?? 0 }));
  const response = await page.goto('/compress-image/');
  expect(response?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  await page.mouse.move(0, 0);
  const origin = new URL(page.url()).origin;
  const before = requests.length;
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  const wasm = requests.slice(before).filter((request) => /\/_astro\/mozjpeg_enc[-.][\w-]{8}\.wasm$/.test(new URL(request.url).pathname));
  expect(wasm.length, 'the MozJPEG encoder was fetched for the file').toBeGreaterThan(0);
  expect(wasm.every((request) => new URL(request.url).origin === origin && request.method === 'GET' && request.body === 0), 'from the site, with a GET and no body').toBe(true);
  const result = await takeDownload(page);
  expect([...result.bytes.subarray(0, JPEG.length)]).toEqual([...JPEG]);
});

// "Copy link puts them after the #, the part of an address your browser keeps to itself and never sends to a server": a
// server of the test records the request line each browser sends for an address with a #, as it reaches the wire.
test('the part of an address after the # never reaches the server: the browser keeps it to itself', async ({ page }) => {
  const targets: string[] = [];
  const server = createServer((request, response) => {
    targets.push(request.url ?? '');
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><head><title>Hash</title></head><body><p>Hash</p></body></html>');
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address() as AddressInfo;
  try {
    const fragment = '#v=1&p=4817&r=6.25';
    await page.goto(`http://127.0.0.1:${port}/mortgage-calculator/${fragment}`);
    expect(await page.evaluate(() => location.hash), 'the page keeps the part after the #').toBe(fragment);
    const asked = targets.filter((target) => !target.startsWith('/favicon'));
    expect(asked, 'the server got the address without it').toEqual(['/mortgage-calculator/']);
    expect(targets.some((target) => target.includes('#') || target.includes('4817')), 'nothing of it in any request').toBe(false);
  } finally {
    await new Promise<void>((done) => server.close(() => done()));
  }
});
