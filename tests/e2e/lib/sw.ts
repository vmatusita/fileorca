// What the specs of the service worker share (F8; DECISOES § 294): wait for the worker to control the page and to keep
// a page, read every cache key, and turn the network off for real (the test server closes) with the browser offline.
import { expect, type BrowserContext, type Page } from '@playwright/test';
import { dismissCookies, hydrated } from './page.ts';
import type { SwServer } from './sw-server.ts';

/** The page is controlled by the worker (it registers after the load event and claims the page when it activates). */
export async function controlled(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), { timeout: 20_000 }).toBe(true);
}

/** Some cache of the site keeps `path` (the worker stores pages after it answers, in waitUntil). */
export async function kept(page: Page, path: string): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(async (wanted) => {
          for (const name of await caches.keys()) if (await (await caches.open(name)).match(new URL(wanted, location.origin).href)) return true;
          return false;
        }, path),
      { timeout: 20_000, message: `${path} is in the cache` },
    )
    .toBe(true);
}

/** The page and every same-origin file it fetched are kept (the worker stores the first page's files one by one). */
export async function allKept(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const tags = [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src],link[rel=stylesheet],link[rel=modulepreload]')];
          const wanted = [location.origin + location.pathname, ...tags.map((tag) => ('src' in tag ? tag.src : tag.href)), ...performance.getEntriesByType('resource').map((entry) => entry.name)]
            .map((url) => new URL(url))
            .filter((url) => url.origin === location.origin && url.pathname.startsWith('/_astro/'))
            .map((url) => url.origin + url.pathname);
          const missing: string[] = [];
          for (const url of new Set(wanted)) {
            let found = false;
            for (const name of await caches.keys()) if (await (await caches.open(name)).match(url)) found = true;
            if (!found) missing.push(url);
          }
          return missing;
        }),
      { timeout: 20_000, message: 'every file of the page is in the cache' },
    )
    .toEqual([]);
}

/** Every cache of the origin and its keys. */
export async function cacheKeys(page: Page): Promise<Record<string, string[]>> {
  return page.evaluate(async () => {
    const out: Record<string, string[]> = {};
    for (const name of await caches.keys()) {
      // caches.open() creates a cache that is missing: one the worker deleted in between is skipped.
      if (await caches.has(name)) out[name] = (await (await caches.open(name)).keys()).map((request) => request.url);
    }
    return out;
  });
}

/** Opens a page of the test server; a tool or a calculator waits for its island. */
export async function visit(page: Page, server: SwServer, path: string, { island = true } = {}): Promise<void> {
  const response = await page.goto(`${server.origin}${path}`);
  expect(response?.status(), `${path} answers 200`).toBe(200);
  if (island) await hydrated(page);
  await dismissCookies(page);
}

/** The network goes away for real: the server closes (the worker's fetch fails) and the browser says it is offline. */
export async function offline(context: BrowserContext, server: SwServer): Promise<void> {
  await server.close();
  await context.setOffline(true);
}

export async function online(context: BrowserContext, server: SwServer): Promise<void> {
  await server.reopen();
  await context.setOffline(false);
}

/** Reloads while offline: the page must come from the worker, in Chromium and in WebKit. */
export async function reloadOffline(page: Page, { island = true } = {}): Promise<void> {
  const response = await page.reload();
  expect(response?.status(), 'the kept page answers 200').toBe(200);
  expect(response?.fromServiceWorker(), 'the page comes from the service worker').toBe(true);
  if (island) await hydrated(page);
}
