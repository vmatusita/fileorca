// The measures of the performance budgets (PLANO "Orçamento de desempenho"), shared by budgets.spec.ts (the English pages)
// and i18n-budgets.spec.ts (the Portuguese and Spanish ones, F6): initial JS of a page at most 80 KB gzip (own-domain JS
// only, no WASM, inline scripts included); at most 8 own-domain requests on the first page and 3 new ones on the next page
// (hashed assets are immutable cache, so a URL already fetched does not count again).
import { gzipSync } from 'node:zlib';
import { expect, type Page, type Request } from '@playwright/test';

export const JS_BUDGET = 80 * 1024;
export const REQUEST_BUDGET = 8;
export const NEW_REQUEST_BUDGET = 3;
/** The lazy chunks of the PDF engine (worker, Comlink, pdf-lib, qpdf, PDF.js and their .wasm and data) all have these names in dist/_astro. */
export const PDF_ENGINE_FILE = /worker|comlink|\.wasm$|pdfjs|qpdf|pdf\.worker|\/_astro\/(?:pdf|pdf-client|client|render|process|zip)[-.]/;

const QUIET_MS = 1_000;
const SETTLE_LIMIT_MS = 20_000;

/**
 * Waits until the page has stopped asking for things: the load event, then QUIET_MS with no new request and an
 * answer (or a failure) for every request made. It replaces Playwright's networkidle, which on the Linux WebKit of
 * the CI never fired on the two hubs although their five requests had answered in under 2 s (traces of runs
 * 41272269545 and 41273044165; DECISOES § 138). Stricter than networkidle (1 s of quiet instead of 0.5 s), and it
 * fails with the requests still open instead of hanging.
 */
export function settler(page: Page): { settled: () => Promise<void> } {
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
export function track(page: Page, origin: string): Set<string> {
  const urls = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === origin) urls.add(url.pathname + url.search);
  });
  return urls;
}

/** What a page must keep besides the budgets: its number of JS files, and what it never loads before use. */
export interface PageRules {
  /** Exactly this many JS files, or at most two (a page with no island). */
  files: number | 'at most 2';
  /** A calculator: nothing of the PDF maker before the click. */
  noPdfMaker?: boolean;
  /** A PDF page or the PDF hub: nothing of the PDF engine before the first file. */
  noPdfEngine?: boolean;
}

/** Loads the page and holds it to the budgets and to its rules; returns the JS files it loaded. */
export async function expectInitialBudget(page: Page, origin: string, path: string, rules: PageRules): Promise<string[]> {
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
  if (rules.files === 'at most 2') expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBeLessThanOrEqual(2);
  else expect(scripts.size, `arquivos de JS: ${[...scripts.keys()].join(', ')}`).toBe(rules.files);
  // A calculator page never loads the PDF maker before the click (pdf-lib lives in the PDF worker).
  if (rules.noPdfMaker) expect([...requested].some((url) => /pdf-client|comlink/.test(url)), 'nada do PDF antes do clique').toBe(false);
  // A PDF page (and the PDF hub, which has no island) never loads the PDF engine (worker, Comlink, pdf-lib, qpdf, PDF.js and
  // their .wasm and data) before the first file.
  if (rules.noPdfEngine) expect([...requested].filter((url) => PDF_ENGINE_FILE.test(url)), 'nada do motor de PDF antes do primeiro arquivo').toEqual([]);
  expect([...requested].some((url) => /worker|\.wasm$/.test(url)), 'nenhum worker nem .wasm antes do primeiro arquivo').toBe(false);
  expect(requested.size, `requisições: ${[...requested].join(', ')}`).toBeLessThanOrEqual(REQUEST_BUDGET);
  return [...scripts.keys()];
}

/** The first page, then the second: the first within the request budget, the second adding at most three. */
export async function expectNextPage(page: Page, origin: string, first: string, second: string): Promise<void> {
  const urls = track(page, origin);
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
}
