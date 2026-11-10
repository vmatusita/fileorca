// The share target (F8, decisions 1, 9 and 10 and criterion 10; DECISOES § 290). Android sends the shared files in a
// POST of navigation to the action of the manifest; here a real form does the same. The service worker answers it
// (the server never sees the POST: it would answer 405, like Cloudflare), keeps the files in the inbox and sends the
// page to itself in GET. The "Open with" page shows the files and the tools that take them; the tool chosen gets them
// through its island, by the way of a drop, and the inbox ends empty.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import openWith from '../../src/i18n/en/open-with.ts';
import pt from '../../src/i18n/pt/open-with.ts';
import { fmt } from '../../src/i18n/format.ts';
import { SW_ENABLED } from '../../src/platform/site.ts';
import { INBOX_CACHE, INBOX_TOOL_KEY } from '../../src/sw/shared.ts';
import { downloadBytes, generatedJpeg } from './lib/page.ts';
import { violationIds } from './lib/axe.ts';
import { filesOf, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { controlled, share, visit, workerOff } from './lib/sw.ts';
import type { TestFile } from './lib/page.ts';

test.use({ serviceWorkers: 'allow' });

let server: SwServer;
test.beforeEach(async () => {
  server = await startSwServer();
});
test.afterEach(async () => {
  await server.close();
});

const inboxState = (page: Page) =>
  page.evaluate(async ([name, key]) => ({ inbox: await caches.has(name), choice: sessionStorage.getItem(key) }), [INBOX_CACHE, INBOX_TOOL_KEY] as const);

test('an image and a PDF shared: the files, the tools that take them, and Compress image gets them', async ({ page }) => {
  await visit(page, server, '/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  const jpeg: TestFile = { name: 'beach day.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) };
  await share(page, '/open-with/', [jpeg, pdfFile('gen-paginas-mistas.pdf')]);

  const files = page.locator('[data-files] li');
  await expect(files).toHaveCount(2);
  await expect(files.nth(0)).toContainText('beach day.jpg');
  await expect(files.nth(0)).toContainText('JPG');
  await expect(files.nth(1)).toContainText('gen-paginas-mistas.pdf');
  await expect(files.nth(1)).toContainText('PDF');
  // Only tools, from the registries: the image tools that take a JPG and the twelve PDF tools. F17 (DECISOES § 716):
  // Convert to WebP takes a JPG too, in the order of the registry.
  const shown = await page.locator('[data-tool]:visible').evaluateAll((items) => items.map((item) => item.getAttribute('data-tool')));
  expect(shown).toEqual([
    'compress-image', 'resize-image', 'crop-image', 'rotate-image', 'png-to-jpg', 'convert-to-webp', 'image-to-pdf',
    'merge-pdf', 'split-pdf', 'pdf-to-jpg', 'compress-pdf', 'rotate-pdf', 'delete-pdf-pages', 'add-page-numbers-to-pdf', 'sign-pdf',
    'protect-pdf', 'unlock-pdf', 'reorder-pdf-pages', 'watermark-pdf',
  ]);
  await expect(page.locator('[data-tool="compress-image"] [data-takes]')).toHaveText(fmt(openWith.takesSome, { count: 1, total: 2 }));
  await expect(page.locator('[data-tool="split-pdf"] [data-takes]')).toHaveText(fmt(openWith.takesSome, { count: 1, total: 2 }));
  await expect(page.locator('[data-empty]').first()).toBeHidden();
  expect(await violationIds(page), 'axe on the page with files').toEqual([]);

  await page.locator('[data-tool="compress-image"] a').click();
  await page.waitForURL('**/compress-image/');
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });
  const out = await downloadBytes(page);
  expect([...out.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  // The PDF is refused on its row, as a drop of it would be.
  await expect(page.locator('#fo-tool-root')).toContainText('gen-paginas-mistas.pdf');
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
  expect(server.requests.filter((request) => request.method !== 'GET' && request.method !== 'HEAD')).toEqual([]);
});

// F17 (decision 9; DECISOES § 710): AVIF to JPG takes AVIF, so the accept of the share target has it (the manifests,
// tests/unit/open-with.test.ts), and a shared AVIF finds AVIF to JPG, alone, which gets it by its island and gives a JPG.
// Before the F17 no tool took it: the page said so (data-no-tool), and no card showed.
test('an AVIF shared: the page reads it as AVIF and shows AVIF to JPG alone, which gets it and gives a JPG', async ({ page }) => {
  await visit(page, server, '/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  await share(page, '/open-with/', [{ name: 'holiday.avif', mimeType: 'image/avif', buffer: readFileSync('fixtures/images/gen-avif.avif') }]);
  const files = page.locator('[data-files] li');
  await expect(files).toHaveCount(1);
  await expect(files.nth(0)).toContainText('holiday.avif');
  await expect(files.nth(0)).toContainText('AVIF');
  const shown = await page.locator('[data-tool]:visible').evaluateAll((items) => items.map((item) => item.getAttribute('data-tool')));
  expect(shown).toEqual(['avif-to-jpg']);
  await expect(page.locator('[data-tool="avif-to-jpg"] [data-takes]')).toHaveText(openWith.takesThis);
  await expect(page.locator('[data-no-tool]')).toBeHidden();

  await page.locator('[data-tool="avif-to-jpg"] a').click();
  await page.waitForURL('**/avif-to-jpg/');
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });
  const out = await downloadBytes(page);
  expect([...out.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
  expect(server.requests.filter((request) => request.method !== 'GET' && request.method !== 'HEAD')).toEqual([]);
});

test('a PDF shared in Portuguese goes to Rotate PDF by its island', async ({ page }) => {
  await visit(page, server, '/pt/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  await share(page, '/pt/abrir-com/', [pdfFile('gen-ja-otimizado.pdf')]);
  await expect(page.locator('[data-tool="rotate-pdf"] [data-takes]')).toHaveText(pt.takesThis);
  await expect(page.locator('[data-group="image"]')).toBeHidden();
  await page.locator('[data-tool="rotate-pdf"] a').click();
  await page.waitForURL('**/pt/girar-pdf/');
  const out = filesOf(await takePdfDownload(page));
  expect(out[0]?.bytes.subarray(0, 5)).toEqual(new Uint8Array(Buffer.from('%PDF-')));
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
  expect(server.requests.some((request) => request.method === 'POST')).toBe(false);
});

// Review F8 d-2 (DECISOES § 307): the page painted "nothing to open" over shared files until its script read the inbox,
// and the list then pushed the footer (CLS 0.25). Every frame until the files show is sampled.
test('shared files: the page never says there is nothing to open, and nothing on screen moves', async ({ page, browserName }) => {
  await visit(page, server, '/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  await page.addInitScript(() => {
    if (location.pathname !== '/open-with/') return;
    const seen = { empty: false, cls: 0 };
    (window as unknown as { __seen: typeof seen }).__seen = seen;
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) seen.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    }
    const look = () => {
      if ([...document.querySelectorAll<HTMLElement>('[data-empty]')].some((element) => element.checkVisibility())) seen.empty = true;
      if (!document.querySelector<HTMLElement>('[data-shared]')?.checkVisibility()) requestAnimationFrame(look);
    };
    document.addEventListener('DOMContentLoaded', look);
  });
  await share(page, '/open-with/', [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(page.locator('[data-files] li')).toHaveCount(1);
  await page.waitForTimeout(300);
  const seen = await page.evaluate(() => (window as unknown as { __seen: { empty: boolean; cls: number } }).__seen);
  expect(seen.empty, 'the empty state showed before the files').toBe(false);
  if (browserName === 'chromium') expect(seen.cls, 'layout shift of the page').toBeLessThan(0.05);
});

// Review F8 a-2 (DECISOES § 307): the worker deletes an inbox past its hour on the next visit to the site, as the
// Privacy page says, and leaves one that is still within the hour.
test('an inbox past its hour is deleted on the next visit; one within the hour stays', async ({ page }) => {
  await visit(page, server, '/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  const plant = (minutes: number) =>
    page.evaluate(
      async ([name, ago]) => {
        await caches.delete(name);
        await (await caches.open(name)).put(`${location.origin}/__fileorca-inbox/0`, new Response('x', { headers: { 'X-FileOrca-Stored': String(Date.now() - ago * 60_000) } }));
      },
      [INBOX_CACHE, minutes] as const,
    );
  await plant(10);
  await visit(page, server, '/pt/', { island: false });
  await page.waitForTimeout(500);
  expect((await inboxState(page)).inbox, 'ten minutes old: kept').toBe(true);
  await plant(65);
  await visit(page, server, '/es/', { island: false });
  await expect.poll(async () => (await inboxState(page)).inbox, { timeout: 10_000, message: 'past the hour: deleted' }).toBe(false);
});

test('a file no tool takes: the files are listed and the page says so', async ({ page }) => {
  await visit(page, server, '/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  await share(page, '/open-with/', [{ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }]);
  await expect(page.locator('[data-files] li')).toContainText(openWith.unknown);
  await expect(page.locator('[data-no-tool]')).toBeVisible();
  await expect(page.locator('[data-tool]:visible')).toHaveCount(0);
});

test('opened directly, with no files, the page explains and leads to the hubs, with at most 2 JS files', async ({ page }) => {
  const scripts = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    // /sw.js is the worker the page registers after the load event, not a file of the page (WebKit reports it here).
    if (url.origin === server.origin && url.pathname.endsWith('.js') && url.pathname !== '/sw.js') scripts.add(url.pathname);
  });
  await visit(page, server, '/open-with/', { island: false });
  await page.waitForLoadState('load');
  expect(scripts.size, [...scripts].join(', ')).toBeLessThanOrEqual(2);
  await expect(page.locator('.fo-says')).toContainText(openWith.emptySays);
  await expect(page.locator('.fo-openwith__hubs a')).toHaveCount(2);
  await expect(page.locator('[data-shared]')).toBeHidden();
});

test('the three manifests of the build: the icons, the id and the action of the share target answer', async ({ request }) => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    const response = await request.get(`${server.origin}/manifest-${lang}.webmanifest`);
    expect(response.status()).toBe(200);
    const manifest = (await response.json()) as { id: string; start_url: string; icons: { src: string }[]; share_target?: { action: string } };
    expect(manifest.id).toBe(manifest.start_url);
    for (const icon of manifest.icons) expect((await request.get(`${server.origin}${icon.src}`)).status(), icon.src).toBe(200);
    // With the kill switch on, the manifest has no share target (DECISOES § 288 and § 307).
    expect(manifest.share_target !== undefined, 'the share target follows SW_ENABLED').toBe(SW_ENABLED);
    if (manifest.share_target) expect((await request.get(`${server.origin}${manifest.share_target.action}`)).status(), manifest.share_target.action).toBe(200);
  }
});
