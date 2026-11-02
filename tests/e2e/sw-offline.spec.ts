// The site offline (F8, decision 4 and criterion 7; DECISOES § 285 to § 292). With the network on, a page is visited
// and used once: Compress image and Rotate PDF, a money calculator in English and one in Portuguese (CSV and PDF), the
// Due date with the clock fixed, and the QR code. Then the network goes away for real (the test server closes and the
// browser is offline) and each page reloads from the service worker and works: another file, a new number, the CSV
// and the PDF, today from the device clock, a PNG that jsQR reads back. A page never visited shows the offline page of
// its language, with the buoy and the list of kept pages; a tool kept without its engine says so in buoy.
import { readFileSync } from 'node:fs';
import jsQR from 'jsqr';
import { expect, test, type Page } from '@playwright/test';
import imageTexts from '../../src/tools/image/i18n/en.ts';
import offlineEn from '../../src/i18n/en/offline.ts';
import offlinePt from '../../src/i18n/pt/offline.ts';
import qrTexts from '../../src/tools/qr-code-generator/i18n/en.ts';
import { BR_CALC_PAGES, CALC_PAGES, LIFE_CALC_PAGES } from '../../src/tools/calc/registry.ts';
import { chooseImage, downloadBytes, generatedJpeg } from './lib/page.ts';
import { choosePdfs, filesOf, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
import { pngPixels } from './lib/png.ts';
import { violationIds } from './lib/axe.ts';
import { WARM_SELECTOR } from '../../src/platform/sw-register.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { allKept, cacheKeys, controlled, kept, offline, online, reloadOffline, visit } from './lib/sw.ts';

test.use({ serviceWorkers: 'allow' });

let server: SwServer;
test.beforeEach(async () => {
  server = await startSwServer();
});
test.afterEach(async () => {
  await server.close();
});

async function compress(page: Page, name: string): Promise<void> {
  await chooseImage(page, name);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });
}

async function saved(page: Page, index: number): Promise<{ name: string; bytes: Buffer }> {
  const download = page.waitForEvent('download');
  await page.locator('.fo-export .fo-btn').nth(index).click();
  const file = await download;
  return { name: file.suggestedFilename(), bytes: readFileSync((await file.path()) ?? '') };
}

async function exportBoth(page: Page): Promise<void> {
  const pdf = await saved(page, 0);
  expect(pdf.bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  const csv = await saved(page, 1);
  expect(csv.bytes.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
  expect(csv.name).toMatch(/\.csv$/);
}

test('Compress image and Rotate PDF, used once with the network, work offline with other files', async ({ page, context }) => {
  await visit(page, server, '/compress-image/');
  await controlled(page);
  await compress(page, 'first.jpg');
  await visit(page, server, '/rotate-pdf/');
  await controlled(page);
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  expect(filesOf(await takePdfDownload(page))[0]?.name).toBe('gen-paginas-mistas-rotated.pdf');
  await kept(page, '/compress-image/');
  await kept(page, '/rotate-pdf/');
  await allKept(page);
  // The engines were kept as they loaded: no file of the engine is fetched only for the offline use.
  const keys = Object.values(await cacheKeys(page)).flat();
  expect(keys.some((key) => /\/_astro\/worker-/.test(key)), 'the engine workers were kept when they loaded').toBe(true);

  await offline(context, server);
  await page.goto(`${server.origin}/compress-image/`);
  await reloadOffline(page);
  await compress(page, 'second.jpg');
  const jpeg = await downloadBytes(page);
  expect([...jpeg.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  await page.goto(`${server.origin}/rotate-pdf/`);
  await reloadOffline(page);
  await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
  expect(filesOf(await takePdfDownload(page))[0]?.name).toBe('gen-ja-otimizado-rotated.pdf');
});

test('a money calculator in English and one in Portuguese recalculate and export the CSV and the PDF offline', async ({ page, context }) => {
  const english = CALC_PAGES['mortgage-calculator'].path;
  const portuguese = BR_CALC_PAGES['br-sac-price'].path;
  for (const path of [english, portuguese]) {
    await visit(page, server, path);
    await controlled(page);
    // Used once with the network: the PDF maker loads on the first PDF and is kept then (DECISOES § 292).
    await exportBoth(page);
    await kept(page, path);
    await allKept(page);
  }

  await offline(context, server);
  for (const path of [english, portuguese]) {
    await page.goto(`${server.origin}${path}`);
    await reloadOffline(page);
    const hero = page.locator('.fo-rhero__num');
    const before = await hero.textContent();
    await page.locator('#fo-tool-root input[id^="fo-calc-"]').first().fill('123456');
    await expect(hero).not.toHaveText(before ?? '');
    await exportBoth(page);
  }
});

test('the Due date offline still reads today from the device clock', async ({ page, context }) => {
  // Kept with the real clock: the fake clock of Playwright empties the resource timing in WebKit, which the page uses to
  // tell the worker its files (src/platform/sw-register.ts also reads the page's own tags).
  const path = LIFE_CALC_PAGES['due-date-calculator'].path;
  await visit(page, server, path);
  await controlled(page);
  await kept(page, path);
  await allKept(page);

  await offline(context, server);
  await page.clock.setFixedTime(new Date('2026-11-02T12:00:00'));
  await reloadOffline(page);
  await expect(page.locator('.fo-rhero__sentence')).toContainText('8 weeks and 0 days');
  await page.clock.setFixedTime(new Date('2026-11-04T12:00:00'));
  await reloadOffline(page);
  await expect(page.locator('.fo-rhero__sentence')).toContainText('8 weeks and 2 days');
});

test('the QR code offline: the PNG read by jsQR gives the text back', async ({ page, context }) => {
  await visit(page, server, '/qr-code-generator/');
  await controlled(page);
  await kept(page, '/qr-code-generator/');
  await allKept(page);

  await offline(context, server);
  await reloadOffline(page);
  const text = 'https://fileorca.com/offline-check';
  await page.locator('#fo-qr-text').fill(text);
  await expect(page.locator('.fo-qr__code > svg')).toBeVisible();
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: new RegExp(`^${qrTexts.panel.download.png}`) }).click()]);
  const { width, height, rgba } = pngPixels(new Uint8Array(readFileSync((await file.path()) ?? '')));
  const read = jsQR(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.length), width, height);
  expect(Buffer.from(Uint8Array.from(read?.binaryData ?? [])).toString('utf8')).toBe(text);
});

test('a page never visited shows the offline page of its language, with the buoy and the kept pages', async ({ page, context }) => {
  await visit(page, server, '/pt/', { island: false });
  await controlled(page);
  await visit(page, server, '/compress-image/');
  await kept(page, '/pt/');
  await kept(page, '/compress-image/');
  await kept(page, '/pt/offline/');

  await offline(context, server);
  const response = await page.goto(`${server.origin}/pt/girar-pdf/`);
  expect(response?.fromServiceWorker()).toBe(true);
  await expect(page.locator('h1')).toHaveText(offlinePt.h1);
  await expect(page.locator('.fo-says[role="status"] [data-oli="buoy"]')).toHaveCount(1);
  await expect(page.locator('.fo-says')).toContainText(offlinePt.says);
  const saved = page.locator('[data-saved] a');
  await expect(saved.first()).toBeVisible();
  const hrefs = await saved.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs).toEqual(expect.arrayContaining(['/pt/', '/compress-image/']));
  expect(hrefs.some((href) => href?.includes('offline') || href?.includes('abrir'))).toBe(false);
  expect(await violationIds(page), 'axe on the offline page with its list').toEqual([]);
  // An English path gets the English page, kept when the worker installed on an English page.
  await page.goto(`${server.origin}/resize-image/`);
  await expect(page.locator('h1')).toHaveText(offlineEn.h1);
});

test('a tool kept without its engine says so offline, in buoy, and works again with the network', async ({ page, context, browserName }) => {
  await visit(page, server, '/rotate-image/');
  await controlled(page);
  await kept(page, '/rotate-image/');
  await allKept(page);
  await generatedJpeg(page);

  await offline(context, server);
  await reloadOffline(page);
  await chooseImage(page, 'later.jpg');
  const zone = page.locator('.fo-drop[data-state="offline"]');
  await expect(zone).toBeVisible({ timeout: 30_000 });
  await expect(zone.locator('[role="status"]')).toContainText(imageTexts.errors.offline);
  await expect(zone.locator('[data-oli="buoy"]')).toHaveCount(1);
  await expect(page.locator('#fo-tool-root')).not.toContainText('reload the page');
  expect(await violationIds(page), 'axe on the offline line of the tool').toEqual([]);

  // With the network back, the page is reloaded as the load line has always asked (a failed import() is not tried again
  // by every browser): the tool then loads its engine and works. In the WebKit of Playwright, setOffline(false) does not
  // reach the service worker, which stays offline (DECISOES § 294): there the step is recorded, not asserted.
  await online(context, server);
  await visit(page, server, '/rotate-image/');
  if (browserName === 'chromium') {
    await chooseImage(page, 'again.jpg');
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });
  } else {
    test.info().annotations.push({ type: 'webkit', description: 'setOffline(false) does not reach the service worker; the online path is covered with the worker blocked' });
  }
});

// The budget with the worker on (criterion 12; DECISOES § 287): the tool page still loads its 2 JS files and nothing of
// the engine before the first file. After the load event the page fetches /sw.js, and the worker (Chromium shows its
// requests) fetches only files of the site: the offline page of the language and its files, and the page's own files
// again, mostly from the HTTP cache. The list goes to the log for the report.
test('with the worker on, a tool page keeps its 2 JS files and no engine before the first file', async ({ page, context, browserName }) => {
  const seen: { path: string; after: boolean; worker: boolean }[] = [];
  let loaded = false;
  context.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin === server.origin) seen.push({ path: url.pathname, after: loaded, worker: request.serviceWorker() !== null });
  });
  await page.goto(`${server.origin}/compress-image/`);
  await page.waitForLoadState('load');
  loaded = true;
  await controlled(page);
  await allKept(page);
  await kept(page, '/offline/');
  const before = seen.filter((entry) => !entry.after && !entry.worker);
  const scripts = new Set(before.filter((entry) => /^\/_astro\/.*\.js$/.test(entry.path)).map((entry) => entry.path));
  expect(scripts.size, [...scripts].join(', ')).toBe(2);
  for (const entry of seen) expect(entry.path, 'no engine before the first file').not.toMatch(/worker|\.wasm$/);
  // The browser fetches the worker's script itself: the server sees it, the context does not.
  expect(server.requests.some((request) => request.pathname === '/sw.js')).toBe(true);
  const byWorker = [...new Set(seen.filter((entry) => entry.worker).map((entry) => entry.path))].sort();
  if (browserName === 'chromium') {
    // The files the page names (its scripts, stylesheet, preloads, manifest and icon) or fetched: decision 4.
    const named = await page.evaluate((selector) => [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(selector)].map((tag) => new URL('src' in tag ? tag.src : tag.href).pathname), WARM_SELECTOR);
    const pageFiles = new Set(['/compress-image/', '/sw.js', ...named, ...before.map((entry) => entry.path)]);
    for (const path of byWorker) expect(path === '/offline/' || pageFiles.has(path), `${path} is a file of the page or of the offline page`).toBe(true);
  }
  console.log(`[sw-orcamento] ${browserName}: antes do load ${before.length} pedidos (${scripts.size} JS); depois: /sw.js e ${byWorker.length} pelo worker: ${byWorker.join(' ')}`);
});
