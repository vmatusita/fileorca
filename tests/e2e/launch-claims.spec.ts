import { expect, test, type Page } from '@playwright/test';
import { fixtureFile, takeDownload } from './lib/matrix.ts';
import { dismissCookies, hydrated, startOver, type TestFile } from './lib/page.ts';
import { actionOf } from './lib/pdf-privacy.ts';
import { pdfFile } from './lib/pdf-tools.ts';
import compressPdfTexts from '../../src/tools/compress-pdf/i18n/en.ts';
import imagesPdfTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import protectPdfTexts from '../../src/tools/protect-pdf/i18n/en.ts';

// The technical claims of the launch texts (docs/lancamento/show-hn.md and, from the F5b, product-hunt.md; DECISOES § 98),
// proven over the dist/
// in both browsers, on a JPEG codec, the libheif decoder, the PDF worker and, since F5a, qpdf (Compress PDF,
// Protect PDF) and PDF.js (PDF to JPG):
// 1. no byte of the file leaves the browser: every request the page and its workers make is a GET to the
//    site's own origin, with no body;
// 2. once the page and the codec are loaded, the tool keeps working offline: the network goes off and the
//    next file is processed and downloaded.

const JPEG = [0xff, 0xd8, 0xff];
const PDF = [0x25, 0x50, 0x44, 0x46];
const ZIP = [0x50, 0x4b];

interface Case {
  path: string;
  first: string;
  second: string;
  /** The first bytes of what each file gives back. */
  magic: readonly number[];
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

for (const { path, first, second, magic, load = fixtureFile, setup, act } of CASES) {
  test(`${path}: no byte of the file leaves the browser, and the tool keeps working offline`, async ({ page, context }) => {
    const requests: { url: string; method: string; body: number }[] = [];
    context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postDataBuffer()?.length ?? 0 }));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const origin = new URL(page.url()).origin;

    await setup?.(page);
    await page.setInputFiles('input[type="file"]', load(first));
    await act?.(page);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
    const online = await takeDownload(page);
    expect([...online.bytes.subarray(0, magic.length)], `${first}: a real result`).toEqual([...magic]);

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
    expect([...offline.bytes.subarray(0, magic.length)], `${second}: a real result offline`).toEqual([...magic]);
    expect(requests.slice(before).filter((request) => !/^(blob|data|about):/.test(request.url)), 'offline, nothing was asked of the network').toEqual([]);
    await context.setOffline(false);
  });
}
