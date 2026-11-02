import { expect, test, type Page } from '@playwright/test';
import { CALC_PAGES as CALC_PAGES_OF, CALC_PAGE_IDS, GUIDES, GUIDE_IDS } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { chooseImage, dismissCookies, hydrated } from './lib/page.ts';
import { choosePdfs, pdfFile } from './lib/pdf-tools.ts';
import imagesTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { PDF_ENGINE_FILE, expectInitialBudget, expectNextPage, settler } from './lib/budgets.ts';

// Performance budgets (PLANO "Orçamento de desempenho"): initial JS of the tool page at most
// 80 KB gzip (own-domain JS only, no WASM, inline scripts included); at most 8 own-domain
// requests on the first page and 3 new ones on the next page (hashed assets are immutable cache,
// so a URL already fetched does not count again). The measures are in tests/e2e/lib/budgets.ts since the F6, which
// holds the Portuguese and Spanish pages to them in i18n-budgets.spec.ts.
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
// The 12 PDF tools (F5a, prompt decision 5; DECISOES § 170), read from the PDF registry and in a list of their
// own: one entry shared by all of them (PdfIsland) and the shared island chunk, exactly two files. TOOL_PAGES and
// CALC_PAGES do not change. Before the first file a PDF page asks for nothing of the engine: no worker, no Comlink, no
// .wasm, no pdf-lib, no PDF.js, no qpdf (the lazy chunks all have these names in dist/_astro).
const PDF_PAGES_LIST = PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path);
const PDF_JS_FILES = 2;
// What only the tools that need it may fetch: qpdf (Compress, Protect, Unlock) and PDF.js (page drawing).
// F5b (prompt decision 4): the ten file guides, read from their registry and in a list of their own. Each embeds its tool
// with the tool page's own entry (an image tool's mount entry, or the PDF island's) and the shared island chunk: exactly
// two files, and nothing of the engine before the first file. The lists above do not change.
const FILE_GUIDE_PAGES = FILE_GUIDE_IDS.map((id) => FILE_GUIDES[id].path);
const FILE_GUIDE_JS_FILES = 2;
const PDF_GUIDE_PAGES = FILE_GUIDE_IDS.filter((id) => FILE_GUIDES[id].hub === 'pdf-tools' && Object.hasOwn(PDF_PAGES, FILE_GUIDES[id].tool)).map((id) => FILE_GUIDES[id].path);
const QPDF_FILE = /qpdf/;
const PDFJS_FILE = /pdfjs|pdf\.worker/;

for (const path of [...TOOL_PAGES, ...HUB_PAGES, ...CALC_PAGES, ...PDF_PAGES_LIST, ...FILE_GUIDE_PAGES]) {
  const isTool = TOOL_PAGES.includes(path);
  const isCalc = CALC_PAGES.includes(path);
  const isPdf = PDF_PAGES_LIST.includes(path);
  const isFileGuide = FILE_GUIDE_PAGES.includes(path);
  test(`initial JS and requests of ${path} fit the budgets, with no worker and no wasm`, async ({ page, baseURL }) => {
    await expectInitialBudget(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin, path, {
      files: isTool ? 2 : isCalc ? CALC_JS_FILES : isPdf ? PDF_JS_FILES : isFileGuide ? FILE_GUIDE_JS_FILES : 'at most 2',
      noPdfMaker: isCalc,
      noPdfEngine: isPdf || path === `/${PDF_HUB_ID}/` || PDF_GUIDE_PAGES.includes(path),
    });
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
  // F5b: a guide loads its tool's entry, so from the tool to its guide and back it is the HTML only; from a hub to a guide
  // it is the HTML and the two files; from an image guide to a PDF guide, the HTML and the PDF entry.
  ['/heic-to-jpg/', '/guides/heic-to-jpg-on-windows/'],
  ['/guides/heic-to-jpg-on-windows/', '/heic-to-jpg/'],
  ['/compress-pdf/', '/guides/why-is-my-pdf-so-large/'],
  ['/image-tools/', '/guides/social-media-image-sizes/'],
  ['/pdf-tools/', '/guides/split-pdf-file-size/'],
  ['/guides/jpg-vs-png/', '/guides/why-is-my-pdf-so-large/'],
] as const) {
  test(`requests: ${first} then ${second}`, async ({ page, baseURL }) => {
    await expectNextPage(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin, first, second);
  });
}

// F5a (prompt decision 5; DECISOES § 170): who pays for which part of the PDF engine. The worker is one for
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
