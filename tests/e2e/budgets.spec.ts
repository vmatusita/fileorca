import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

// Performance budgets (PLANO "Orçamento de desempenho"): initial JS of the tool page at most
// 80 KB gzip (own-domain JS only, no WASM, inline scripts included); at most 8 own-domain
// requests on the first page and 3 new ones on the next page (hashed assets are immutable cache,
// so a URL already fetched does not count again).
const ORIGIN = 'http://127.0.0.1:4173';
const JS_BUDGET = 80 * 1024;

async function track(page: Page): Promise<Set<string>> {
  const urls = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === ORIGIN) urls.add(url.pathname + url.search);
  });
  return urls;
}

test('initial JS of the tool page fits 80 KB gzip', async ({ page }) => {
  const scripts = new Map<string, Buffer>();
  page.on('response', async (response) => {
    const url = new URL(response.url());
    if (url.origin === ORIGIN && response.request().resourceType() === 'script' && !url.pathname.endsWith('.wasm')) {
      scripts.set(url.pathname, await response.body());
    }
  });
  await page.goto('/compress-image/');
  await page.waitForLoadState('networkidle');
  const inline = await page.evaluate(() => [...document.querySelectorAll('script:not([src])')].map((node) => node.textContent ?? '').join('\n'));
  const external = [...scripts.values()].reduce((sum, body) => sum + gzipSync(body).length, 0);
  const total = external + gzipSync(Buffer.from(inline)).length;
  console.log(`JS inicial: ${(total / 1024).toFixed(1)} KB gzip (${scripts.size} arquivos + inline)`);
  expect(total).toBeLessThanOrEqual(JS_BUDGET);
  expect([...scripts.keys()].some((path) => path.includes('worker'))).toBe(false);
});

for (const [first, second] of [
  ['/compress-image/', '/privacy/'],
  ['/', '/compress-image/'],
  ['/pt/comprimir-imagem/', '/pt/sobre/'],
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
