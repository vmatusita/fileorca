// The kill switch and the change of version (F8, decisions 5 and 7 and criterion 9; DECISOES § 288 and § 293). The
// test server swaps /sw.js for what the build writes with SW_ENABLED = false (the same script with enabled: false) and
// for a build of another commit (the same script with another version), and the page asks the browser to check for
// an update, as a navigation does. The kill switch empties every cache of the site and unregisters, and the page then
// comes from the network only; turned back on, the worker registers and keeps pages again. A new version deletes the
// caches of the old one and the inbox.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { SW_ENABLED } from '../../src/platform/site.ts';
import { CACHE_PREFIX, INBOX_CACHE, pagesCacheName } from '../../src/sw/shared.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { allKept, controlled, kept, offline, reloadOffline, visit, workerOff } from './lib/sw.ts';

test.use({ serviceWorkers: 'allow' });

const SCRIPT = readFileSync('dist/sw.js', 'utf8');
const VERSION = readFileSync('dist/build.txt', 'utf8').trim();

let server: SwServer;
test.beforeEach(async () => {
  server = await startSwServer();
});
test.afterEach(async () => {
  await server.close();
});

// Names only: caches.open() would create again a cache the worker has just deleted.
const siteCaches = (page: Page) => page.evaluate(async (prefix) => (await caches.keys()).filter((name) => name.startsWith(prefix)), CACHE_PREFIX);
const registrations = (page: Page) => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
const update = (page: Page) => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());

test('the built /sw.js follows SW_ENABLED, at the version of build.txt', () => {
  expect(SCRIPT).toContain(`"enabled":${String(SW_ENABLED)}`);
  expect(SCRIPT).toContain(`"version":"${VERSION}"`);
});

test('the kill switch empties every cache of the site and unregisters; turned back on, it keeps pages again', async ({ page }) => {
  await visit(page, server, '/compress-image/');
  if (await workerOff(page, server)) return;
  await controlled(page);
  await allKept(page);
  await visit(page, server, '/pt/', { island: false });
  await kept(page, '/pt/');
  expect(await siteCaches(page)).toEqual([pagesCacheName(VERSION)]);

  // SW_ENABLED = false: the build writes the same script with enabled false.
  server.override('/sw.js', SCRIPT.replace('"enabled":true', '"enabled":false'));
  await update(page);
  await expect.poll(() => registrations(page), { timeout: 20_000 }).toBe(0);
  await expect.poll(() => siteCaches(page), { timeout: 20_000 }).toEqual([]);
  const before = server.requests.length;
  const response = await page.goto(`${server.origin}/compress-image/`);
  expect(response?.fromServiceWorker(), 'the page comes from the network only').toBe(false);
  expect(server.requests.slice(before).some((request) => request.pathname === '/compress-image/')).toBe(true);
  await page.waitForLoadState('load');
  // The page registers /sw.js after its load, and it is still the kill switch: that registration must come and go first,
  // or the one of the reload below joins it and is unregistered with it (second pass of the final review, s-4).
  await expect.poll(() => server.requests.slice(before).some((request) => request.pathname === '/sw.js'), { timeout: 20_000 }).toBe(true);
  await expect.poll(() => registrations(page), { timeout: 20_000 }).toBe(0);

  // Turned back on (a build with SW_ENABLED = true): the page registers it and it keeps pages again.
  server.override('/sw.js', null);
  await page.reload();
  await controlled(page);
  await kept(page, '/compress-image/');
  expect(await siteCaches(page)).toEqual([pagesCacheName(VERSION)]);
});

test('a new build deletes the caches of the old one and the inbox when it activates, and keeps the page that brought it', async ({ page, context }) => {
  await visit(page, server, '/compress-image/');
  if (await workerOff(page, server)) return;
  await controlled(page);
  await allKept(page);
  // An inbox nobody took.
  await page.evaluate(async (name) => {
    await (await caches.open(name)).put(`${location.origin}/__fileorca-inbox/0`, new Response('x', { headers: { 'X-FileOrca-Stored': String(Date.now()) } }));
  }, INBOX_CACHE);
  expect((await siteCaches(page)).sort()).toEqual([INBOX_CACHE, pagesCacheName(VERSION)].sort());

  // The deploy: the next visit to the page finds the new /sw.js, and the new worker takes the page over after its load.
  // The page and its files must be in the new cache right away, without another visit (review F8 b-1; DECISOES § 307).
  server.override('/sw.js', SCRIPT.replace(`"version":"${VERSION}"`, '"version":"next-build"'));
  await page.goto(`${server.origin}/compress-image/`);
  await update(page);
  await expect.poll(() => siteCaches(page), { timeout: 20_000 }).toEqual([pagesCacheName('next-build')]);
  await allKept(page);
  await offline(context, server);
  await reloadOffline(page);
  expect(await siteCaches(page)).toEqual([pagesCacheName('next-build')]);
});
