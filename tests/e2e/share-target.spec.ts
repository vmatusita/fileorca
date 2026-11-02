// The share target (F8, decisions 1, 9 and 10 and criterion 10; DECISOES § 290). Android sends the shared files in a
// POST of navigation to the action of the manifest; here a real form does the same. The service worker answers it
// (the server never sees the POST: it would answer 405, like Cloudflare), keeps the files in the inbox and sends the
// page to itself in GET. The "Open with" page shows the files and the tools that take them; the tool chosen gets them
// through its island, by the way of a drop, and the inbox ends empty.
import { expect, test, type Page } from '@playwright/test';
import openWith from '../../src/i18n/en/open-with.ts';
import pt from '../../src/i18n/pt/open-with.ts';
import { fmt } from '../../src/i18n/format.ts';
import { INBOX_CACHE, INBOX_TOOL_KEY } from '../../src/sw/shared.ts';
import { downloadBytes, generatedJpeg } from './lib/page.ts';
import { filesOf, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { controlled, share, visit } from './lib/sw.ts';
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
  await controlled(page);
  const jpeg: TestFile = { name: 'beach day.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) };
  await share(page, '/open-with/', [jpeg, pdfFile('gen-paginas-mistas.pdf')]);

  const files = page.locator('[data-files] li');
  await expect(files).toHaveCount(2);
  await expect(files.nth(0)).toContainText('beach day.jpg');
  await expect(files.nth(0)).toContainText('JPG');
  await expect(files.nth(1)).toContainText('gen-paginas-mistas.pdf');
  await expect(files.nth(1)).toContainText('PDF');
  // Only tools, from the registries: the image tools that take a JPG and the twelve PDF tools.
  const shown = await page.locator('[data-tool]:visible').evaluateAll((items) => items.map((item) => item.getAttribute('data-tool')));
  expect(shown).toEqual([
    'compress-image', 'resize-image', 'crop-image', 'rotate-image', 'png-to-jpg', 'image-to-pdf',
    'merge-pdf', 'split-pdf', 'pdf-to-jpg', 'compress-pdf', 'rotate-pdf', 'delete-pdf-pages', 'add-page-numbers-to-pdf', 'sign-pdf',
    'protect-pdf', 'unlock-pdf', 'reorder-pdf-pages', 'watermark-pdf',
  ]);
  await expect(page.locator('[data-tool="compress-image"] [data-takes]')).toHaveText(fmt(openWith.takesSome, { count: 1, total: 2 }));
  await expect(page.locator('[data-tool="split-pdf"] [data-takes]')).toHaveText(fmt(openWith.takesSome, { count: 1, total: 2 }));
  await expect(page.locator('[data-empty]').first()).toBeHidden();

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

test('a PDF shared in Portuguese goes to Rotate PDF by its island', async ({ page }) => {
  await visit(page, server, '/pt/', { island: false });
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

test('a file no tool takes: the files are listed and the page says so', async ({ page }) => {
  await visit(page, server, '/', { island: false });
  await controlled(page);
  await share(page, '/open-with/', [{ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }]);
  await expect(page.locator('[data-files] li')).toContainText(openWith.unknown);
  await expect(page.locator('[data-no-tool]')).toBeVisible();
  await expect(page.locator('[data-tool]:visible')).toHaveCount(0);
});

test('opened directly, with no files, the page explains and leads to the hubs', async ({ page }) => {
  await visit(page, server, '/open-with/', { island: false });
  await expect(page.locator('.fo-says')).toContainText(openWith.emptySays);
  await expect(page.locator('.fo-openwith__hubs a')).toHaveCount(2);
  await expect(page.locator('[data-shared]')).toBeHidden();
});

test('the three manifests of the build: the icons, the id and the action of the share target answer', async ({ request }) => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    const response = await request.get(`${server.origin}/manifest-${lang}.webmanifest`);
    expect(response.status()).toBe(200);
    const manifest = (await response.json()) as { id: string; start_url: string; icons: { src: string }[]; share_target: { action: string } };
    expect(manifest.id).toBe(manifest.start_url);
    for (const icon of manifest.icons) expect((await request.get(`${server.origin}${icon.src}`)).status(), icon.src).toBe(200);
    expect((await request.get(`${server.origin}${manifest.share_target.action}`)).status(), manifest.share_target.action).toBe(200);
  }
});
