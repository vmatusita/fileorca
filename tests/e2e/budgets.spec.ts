import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

// Performance budgets (PLANO "Orçamento de desempenho"): initial JS of the tool page at most
// 80 KB gzip (own-domain JS only, no WASM, inline scripts included); at most 8 own-domain
// requests on the first page and 3 new ones on the next page (hashed assets are immutable cache,
// so a URL already fetched does not count again).
const ORIGIN = 'http://127.0.0.1:4173';
const JS_BUDGET = 80 * 1024;
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
  '/avif-to-jpg/',
  '/convert-to-webp/',
  '/image-to-pdf/',
];

async function track(page: Page): Promise<Set<string>> {
  const urls = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === ORIGIN) urls.add(url.pathname + url.search);
  });
  return urls;
}

for (const path of TOOL_PAGES) {
  test(`initial JS of ${path} fits 80 KB gzip, in two files and with no worker and no wasm`, async ({ page }) => {
    const scripts = new Map<string, Buffer>();
    const requested: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin === ORIGIN) requested.push(url.pathname);
    });
    page.on('response', async (response) => {
      const url = new URL(response.url());
      if (url.origin === ORIGIN && response.request().resourceType() === 'script' && !url.pathname.endsWith('.wasm')) {
        scripts.set(url.pathname, await response.body());
      }
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const inline = await page.evaluate(() => [...document.querySelectorAll('script:not([src])')].map((node) => node.textContent ?? '').join('\n'));
    const external = [...scripts.values()].reduce((sum, body) => sum + gzipSync(body).length, 0);
    const total = external + gzipSync(Buffer.from(inline)).length;
    console.log(`${path} JS inicial: ${(total / 1024).toFixed(1)} KB gzip (${scripts.size} arquivos + inline)`);
    expect(total).toBeLessThanOrEqual(JS_BUDGET);
    expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(2);
    expect(requested.some((url) => /worker|\.wasm$/.test(url)), 'nenhum worker nem .wasm antes do primeiro arquivo').toBe(false);
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
] as const) {
  test(`requests: ${first} then ${second}`, async ({ page }) => {
    const urls = await track(page);
    await page.goto(first);
    await page.waitForLoadState('networkidle');
    const firstPage = new Set(urls);
    console.log(`${first}: ${firstPage.size} requisições (${[...firstPage].join(', ')})`);
    expect(firstPage.size).toBeLessThanOrEqual(8);
    await page.goto(second);
    await page.waitForLoadState('networkidle');
    const added = [...urls].filter((url) => !firstPage.has(url));
    console.log(`${second}: ${added.length} novas (${added.join(', ')})`);
    expect(added.length).toBeLessThanOrEqual(3);
  });
}
