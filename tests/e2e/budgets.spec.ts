import { gzipSync } from 'node:zlib';
import { expect, test, type Page, type Request } from '@playwright/test';
import { CALC_PAGES as CALC_PAGES_OF, CALC_PAGE_IDS, GUIDES, GUIDE_IDS } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { chooseImage, dismissCookies, hydrated } from './lib/page.ts';
import { choosePdfs, pdfFile } from './lib/pdf-tools.ts';
import imagesTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';

// Performance budgets (PLANO "Orçamento de desempenho"): initial JS of the tool page at most
// 80 KB gzip (own-domain JS only, no WASM, inline scripts included); at most 8 own-domain
// requests on the first page and 3 new ones on the next page (hashed assets are immutable cache,
// so a URL already fetched does not count again).
const JS_BUDGET = 80 * 1024;
const REQUEST_BUDGET = 8;
const NEW_REQUEST_BUDGET = 3;
// Every tool page and preset that exists (a tool adds its path here when its page is built): each one loads
// its own entry and the shared island chunk, and never a worker or a .wasm before the first file.
const TOOL_PAGES = [
  '/compress-image/',
  '/compress-image/to-100kb/',
  '/compress-image/to-1mb/',
  '/pt/comprimir-imagem/',
  '/es/comprimir-imagen/',
  '/resize-image/',
  '/resize-image/youtube-thumbnail/',
  '/crop-image/',
  '/rotate-image/',
  '/heic-to-jpg/',
  '/webp-to-jpg/',
  '/png-to-jpg/',
  '/image-to-pdf/',
];
// The hubs have no island: they are held to the same JS and request budgets, with at most the two files of a tool page.
const HUB_PAGES = ['/image-tools/', '/money-calculators/', `/${PDF_HUB_ID}/`];
// The money calculators, their presets and the guides (F4; DECISOES § 110): one entry shared by all of them and
// the shared island chunk, exactly two files, read from the calculator registry.
const CALC_PAGES = [...CALC_PAGE_IDS.map((id) => CALC_PAGES_OF[id].path), ...GUIDE_IDS.map((id) => GUIDES[id].path)];
const CALC_JS_FILES = 2;
// The 12 PDF tools (F5a, prompt decision 5; DECISOES § F5a-orcamento-pdf), read from the PDF registry and in a list of their
// own: one entry shared by all of them (PdfIsland) and the shared island chunk, exactly two files. TOOL_PAGES and
// CALC_PAGES do not change. Before the first file a PDF page asks for nothing of the engine: no worker, no Comlink, no
// .wasm, no pdf-lib, no PDF.js, no qpdf (the lazy chunks all have these names in dist/_astro).
const PDF_PAGES_LIST = PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path);
const PDF_JS_FILES = 2;
const PDF_ENGINE_FILE = /worker|comlink|\.wasm$|pdfjs|qpdf|pdf\.worker|\/_astro\/(?:pdf|pdf-client|client|render|process|zip)[-.]/;
// What only the tools that need it may fetch: qpdf (Compress, Protect, Unlock) and PDF.js (page drawing).
const QPDF_FILE = /qpdf/;
const PDFJS_FILE = /pdfjs|pdf\.worker/;

const QUIET_MS = 1_000;
const SETTLE_LIMIT_MS = 20_000;

/**
 * Waits until the page has stopped asking for things: the load event, then QUIET_MS with no new request and an
 * answer (or a failure) for every request made. It replaces Playwright's networkidle, which on the Linux WebKit of
 * the CI never fired on the two hubs although their five requests had answered in under 2 s (traces of runs
 * 41272269545 and 41273044165; DECISOES § 138). Stricter than networkidle (1 s of quiet instead of 0.5 s), and it
 * fails with the requests still open instead of hanging.
 */
function settler(page: Page): { settled: () => Promise<void> } {
  const open = new Set<Request>();
  let lastStart = Date.now();
  page.on('request', (request) => {
    open.add(request);
    lastStart = Date.now();
  });
  page.on('response', (response) => open.delete(response.request()));
  page.on('requestfailed', (request) => open.delete(request));
  return {
    async settled() {
      await page.waitForLoadState('load');
      const start = Date.now();
      while (open.size > 0 || Date.now() - lastStart < QUIET_MS) {
        if (Date.now() - start > SETTLE_LIMIT_MS) throw new Error(`requisições ainda abertas: ${[...open].map((request) => request.url()).join(', ')}`);
        await page.waitForTimeout(100);
      }
    },
  };
}

/** Own-origin URLs (path + query) the page asks for; the origin is the one Playwright serves (its port may change). */
function track(page: Page, origin: string): Set<string> {
  const urls = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === origin) urls.add(url.pathname + url.search);
  });
  return urls;
}

for (const path of [...TOOL_PAGES, ...HUB_PAGES, ...CALC_PAGES, ...PDF_PAGES_LIST]) {
  const isTool = TOOL_PAGES.includes(path);
  const isCalc = CALC_PAGES.includes(path);
  const isPdf = PDF_PAGES_LIST.includes(path);
  test(`initial JS and requests of ${path} fit the budgets, with no worker and no wasm`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
    const scripts = new Map<string, Buffer>();
    const bodies: Promise<void>[] = [];
    const requested = track(page, origin);
    const { settled } = settler(page);
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.origin === origin && response.request().resourceType() === 'script' && !url.pathname.endsWith('.wasm')) {
        bodies.push(response.body().then((body) => void scripts.set(url.pathname, body)));
      }
    });
    expect((await page.goto(path))?.status(), `${path} existe`).toBe(200);
    await settled();
    await Promise.all(bodies);
    const inline = await page.evaluate(() => [...document.querySelectorAll('script:not([src])')].map((node) => node.textContent ?? '').join('\n'));
    const external = [...scripts.values()].reduce((sum, body) => sum + gzipSync(body).length, 0);
    const total = external + gzipSync(Buffer.from(inline)).length;
    console.log(`${path} JS inicial: ${(total / 1024).toFixed(1)} KB gzip (${scripts.size} arquivos + inline), ${requested.size} requisições`);
    expect(total).toBeLessThanOrEqual(JS_BUDGET);
    // A tool page is its own entry plus the shared chunk, no more (a third file would be a request the next-page rule cannot afford).
    if (isTool) expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(2);
    else if (isCalc) expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(CALC_JS_FILES);
    else if (isPdf) expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(PDF_JS_FILES);
    else expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBeLessThanOrEqual(2);
    // A calculator page never loads the PDF maker before the click (pdf-lib lives in the PDF worker).
    if (isCalc) expect([...requested].some((url) => /pdf-client|comlink/.test(url)), 'nada do PDF antes do clique').toBe(false);
    // A PDF page (and the PDF hub, which has no island) never loads the PDF engine (worker, Comlink, pdf-lib, qpdf, PDF.js and
    // their .wasm and data) before the first file.
    if (isPdf || path === `/${PDF_HUB_ID}/`) expect([...requested].filter((url) => PDF_ENGINE_FILE.test(url)), 'nada do motor de PDF antes do primeiro arquivo').toEqual([]);
    expect([...requested].some((url) => /worker|\.wasm$/.test(url)), 'nenhum worker nem .wasm antes do primeiro arquivo').toBe(false);
    expect(requested.size, `requisições: ${[...requested].join(', ')}`).toBeLessThanOrEqual(REQUEST_BUDGET);
  });
}

for (const [first, second] of [
  ['/compress-image/', '/privacy/'],
  ['/', '/compress-image/'],
  ['/pt/comprimir-imagem/', '/pt/sobre/'],
  // The shared chunk is already cached: the next tool page brings its HTML and its own entry only.
  ['/compress-image/', '/compress-image/to-100kb/'],
  ['/compress-image/', '/resize-image/'],
  ['/resize-image/', '/crop-image/'],
  // The hub brings no island: the first tool opened from it costs the HTML and the two JS files of a tool page.
  ['/image-tools/', '/heic-to-jpg/'],
  // F4: from an image tool to a calculator (the HTML and the calculator entry), from a calculator to another one (the
  // HTML only), from the money hub to a calculator, from the home to the money hub, and to a guide.
  ['/compress-image/', '/mortgage-calculator/'],
  ['/mortgage-calculator/', '/refinance-calculator/'],
  ['/money-calculators/', '/debt-payoff-calculator/'],
  ['/', '/money-calculators/'],
  ['/refinance-calculator/', '/guides/refinance-break-even/'],
  ['/mortgage-calculator/', '/resize-image/'],
  // F5a (prompt decision 5), in both directions: the PDF entry and the island chunk are one pair of files for the 12 PDF
  // tools, so from one PDF tool to another it is the HTML only; from an image tool, a calculator or the PDF hub it is the
  // HTML and the PDF entry; back to an image tool or a calculator it is the HTML and that page's own entry.
  ['/merge-pdf/', '/split-pdf/'],
  ['/compress-pdf/', '/unlock-pdf/'],
  ['/pdf-tools/', '/merge-pdf/'],
  ['/', '/pdf-tools/'],
  ['/merge-pdf/', '/pdf-tools/'],
  ['/compress-image/', '/compress-pdf/'],
  ['/compress-pdf/', '/compress-image/'],
  ['/image-to-pdf/', '/merge-pdf/'],
  ['/merge-pdf/', '/image-to-pdf/'],
  ['/mortgage-calculator/', '/merge-pdf/'],
  ['/merge-pdf/', '/mortgage-calculator/'],
] as const) {
  test(`requests: ${first} then ${second}`, async ({ page, baseURL }) => {
    const urls = track(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
    const { settled } = settler(page);
    expect((await page.goto(first))?.status(), `${first} existe`).toBe(200);
    await settled();
    const firstPage = new Set(urls);
    console.log(`${first}: ${firstPage.size} requisições (${[...firstPage].join(', ')})`);
    expect(firstPage.size).toBeLessThanOrEqual(REQUEST_BUDGET);
    expect((await page.goto(second))?.status(), `${second} existe`).toBe(200);
    await settled();
    const added = [...urls].filter((url) => !firstPage.has(url));
    console.log(`${second}: ${added.length} novas (${added.join(', ')})`);
    expect(added.length).toBeLessThanOrEqual(NEW_REQUEST_BUDGET);
  });
}

// F5a (prompt decision 5; DECISOES § F5a-orcamento-pdf): who pays for which part of the PDF engine. The worker is one for
// Image to PDF, the PDF of the calculators and the 12 PDF tools, but qpdf and PDF.js load inside it only for the
// operation that needs them. Image to PDF and the PDF of a calculator write their file with pdf-lib alone; Compress PDF
// brings qpdf with its first file and PDF to JPG brings PDF.js, each without the other. The last two tests are the
// controls of the first two: they prove the patterns below see the real file names when the part does load.
const WORKER_FILE = /\/_astro\/worker-[\w-]+\.js$/;

/** Every own-origin URL (path + query) the page and its workers ask for: the workers' requests are reported on the context. */
function trackAll(page: Page, origin: string): Set<string> {
  const urls = new Set<string>();
  page.context().on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === origin) urls.add(url.pathname + url.search);
  });
  return urls;
}

test('Image to PDF writes its PDF in the shared worker and fetches neither qpdf nor PDF.js', async ({ page, baseURL }) => {
  const urls = trackAll(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
  const { settled } = settler(page);
  expect((await page.goto('/image-to-pdf/'))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  await chooseImage(page);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  await settled();
  console.log(`/image-to-pdf/ com o arquivo: ${urls.size} URLs (${[...urls].join(', ')})`);
  expect([...urls].some((url) => WORKER_FILE.test(url)), 'o PDF saiu do worker compartilhado').toBe(true);
  expect([...urls].filter((url) => QPDF_FILE.test(url) || PDFJS_FILE.test(url)), 'nem qpdf nem PDF.js').toEqual([]);
});

test('the PDF of a calculator is written in the shared worker and fetches neither qpdf nor PDF.js', async ({ page, baseURL }) => {
  const urls = trackAll(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
  const { settled } = settler(page);
  expect((await page.goto('/mortgage-calculator/'))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  // The page opens with its example already worked out: the PDF button is on.
  const saved = page.waitForEvent('download');
  await page.locator('.fo-export .fo-btn--download').click();
  expect((await saved).suggestedFilename()).toMatch(/\.pdf$/);
  await settled();
  console.log(`/mortgage-calculator/ com o PDF: ${urls.size} URLs (${[...urls].join(', ')})`);
  expect([...urls].some((url) => WORKER_FILE.test(url)), 'o PDF saiu do worker compartilhado').toBe(true);
  expect([...urls].filter((url) => QPDF_FILE.test(url) || PDFJS_FILE.test(url)), 'nem qpdf nem PDF.js').toEqual([]);
});

test('Compress PDF fetches the worker and qpdf with its first file, and never PDF.js', async ({ page, baseURL }) => {
  const urls = trackAll(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
  const { settled } = settler(page);
  expect((await page.goto('/compress-pdf/'))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  await settled();
  expect([...urls].filter((url) => PDF_ENGINE_FILE.test(url)), 'nada do motor antes do primeiro arquivo').toEqual([]);
  // The pointer over the drop zone may warm only what the first file would fetch (qpdf here), never PDF.js (DECISOES § 61, § 69).
  await page.locator('#fo-tool-root .fo-slot').hover();
  await settled();
  expect([...urls].filter((url) => PDFJS_FILE.test(url)), 'o aquecimento não busca o PDF.js').toEqual([]);
  await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
  await settled();
  console.log(`/compress-pdf/ com o arquivo: ${urls.size} URLs (${[...urls].filter((url) => PDF_ENGINE_FILE.test(url)).join(', ')})`);
  expect([...urls].some((url) => WORKER_FILE.test(url)), 'o worker').toBe(true);
  expect([...urls].some((url) => QPDF_FILE.test(url) && url.endsWith('.wasm')), 'o .wasm do qpdf').toBe(true);
  // The pieces of PDF_ENGINE_FILE that are names of the real files, so the "nothing before the first file" check above is not blind to them.
  for (const part of [/comlink/, /\/_astro\/client[-.]/, /qpdf-[\w-]+\.js$/]) expect([...urls].some((url) => part.test(url) && PDF_ENGINE_FILE.test(url)), `${part} é um arquivo do motor`).toBe(true);
  expect([...urls].filter((url) => PDFJS_FILE.test(url)), 'sem PDF.js').toEqual([]);
});

test('PDF to JPG fetches the worker and PDF.js with its first file, and never qpdf', async ({ page, baseURL }) => {
  const urls = trackAll(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
  const { settled } = settler(page);
  expect((await page.goto('/pdf-to-jpg/'))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  await settled();
  expect([...urls].filter((url) => PDF_ENGINE_FILE.test(url)), 'nada do motor antes do primeiro arquivo').toEqual([]);
  // The pointer over the drop zone may warm only what the first file would fetch (PDF.js here), never qpdf.
  await page.locator('#fo-tool-root .fo-slot').hover();
  await settled();
  expect([...urls].filter((url) => QPDF_FILE.test(url)), 'o aquecimento não busca o qpdf').toEqual([]);
  // 72 ppi and one page: the cheapest drawing there is.
  await page.locator('#fo-tool-root .fo-seg__opt').filter({ hasText: imagesTexts.panel.options.low }).first().click();
  await choosePdfs(page, [pdfFile('pdf-escaneado-01-pagina-livro-cor.pdf')]);
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
  await settled();
  console.log(`/pdf-to-jpg/ com o arquivo: ${urls.size} URLs (${[...urls].filter((url) => PDF_ENGINE_FILE.test(url)).join(', ')})`);
  expect([...urls].some((url) => WORKER_FILE.test(url)), 'o worker').toBe(true);
  expect([...urls].some((url) => PDFJS_FILE.test(url)), 'o PDF.js').toBe(true);
  // The pieces of PDF_ENGINE_FILE that are names of the real files: pdf-lib's chunk is /_astro/pdf-*.js, and PDF.js is
  // pdf.worker-*.js when the worker has an OffscreenCanvas or render-*.js and pdfjs-core-*.js when the page draws (DECISOES § 22).
  for (const part of [/comlink/, /\/_astro\/client[-.]/, /\/_astro\/pdf[-.][\w-]+\.js$/, /pdfjs-core|pdf\.worker/]) expect([...urls].some((url) => part.test(url) && PDF_ENGINE_FILE.test(url)), `${part} é um arquivo do motor`).toBe(true);
  expect([...urls].filter((url) => QPDF_FILE.test(url)), 'sem qpdf').toEqual([]);
});
