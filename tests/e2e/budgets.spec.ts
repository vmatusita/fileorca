import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';
import { CALC_PAGES as CALC_PAGES_OF, CALC_PAGE_IDS, GUIDES, GUIDE_IDS } from '../../src/tools/calc/registry.ts';

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
const HUB_PAGES = ['/image-tools/', '/money-calculators/'];
// The money calculators, their presets and the guides (F4; DECISOES § 110): one entry shared by all of them and
// the shared island chunk, exactly two files, read from the calculator registry.
const CALC_PAGES = [...CALC_PAGE_IDS.map((id) => CALC_PAGES_OF[id].path), ...GUIDE_IDS.map((id) => GUIDES[id].path)];
const CALC_JS_FILES = 2;

/** Own-origin URLs (path + query) the page asks for; the origin is the one Playwright serves (its port may change). */
function track(page: Page, origin: string): Set<string> {
  const urls = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === origin) urls.add(url.pathname + url.search);
  });
  return urls;
}

for (const path of [...TOOL_PAGES, ...HUB_PAGES, ...CALC_PAGES]) {
  const isTool = TOOL_PAGES.includes(path);
  const isCalc = CALC_PAGES.includes(path);
  test(`initial JS and requests of ${path} fit the budgets, with no worker and no wasm`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
    const scripts = new Map<string, Buffer>();
    const requested = track(page, origin);
    page.on('response', async (response) => {
      const url = new URL(response.url());
      if (url.origin === origin && response.request().resourceType() === 'script' && !url.pathname.endsWith('.wasm')) {
        scripts.set(url.pathname, await response.body());
      }
    });
    expect((await page.goto(path))?.status(), `${path} existe`).toBe(200);
    await page.waitForLoadState('networkidle');
    const inline = await page.evaluate(() => [...document.querySelectorAll('script:not([src])')].map((node) => node.textContent ?? '').join('\n'));
    const external = [...scripts.values()].reduce((sum, body) => sum + gzipSync(body).length, 0);
    const total = external + gzipSync(Buffer.from(inline)).length;
    console.log(`${path} JS inicial: ${(total / 1024).toFixed(1)} KB gzip (${scripts.size} arquivos + inline), ${requested.size} requisições`);
    expect(total).toBeLessThanOrEqual(JS_BUDGET);
    // A tool page is its own entry plus the shared chunk, no more (a third file would be a request the next-page rule cannot afford).
    if (isTool) expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(2);
    else if (isCalc) expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(CALC_JS_FILES);
    else expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBeLessThanOrEqual(2);
    // A calculator page never loads the PDF maker before the click (pdf-lib lives in the PDF worker).
    if (isCalc) expect([...requested].some((url) => /pdf-client|comlink/.test(url)), 'nada do PDF antes do clique').toBe(false);
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
] as const) {
  test(`requests: ${first} then ${second}`, async ({ page, baseURL }) => {
    const urls = track(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
    expect((await page.goto(first))?.status(), `${first} existe`).toBe(200);
    await page.waitForLoadState('networkidle');
    const firstPage = new Set(urls);
    console.log(`${first}: ${firstPage.size} requisições (${[...firstPage].join(', ')})`);
    expect(firstPage.size).toBeLessThanOrEqual(REQUEST_BUDGET);
    expect((await page.goto(second))?.status(), `${second} existe`).toBe(200);
    await page.waitForLoadState('networkidle');
    const added = [...urls].filter((url) => !firstPage.has(url));
    console.log(`${second}: ${added.length} novas (${added.join(', ')})`);
    expect(added.length).toBeLessThanOrEqual(NEW_REQUEST_BUDGET);
  });
}
