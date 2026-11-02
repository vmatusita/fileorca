// The privacy of the cache (F8, decisions 5 and 10 and criterion 8; DECISOES § 286 and § 290). After links of the
// scenario with numbers (money and health), numbers typed, files processed and a share delivered to a tool, the keys of
// every cache and the IndexedDB have no "#", no "?", no sentinel typed, no file name, and no cached body is a file the
// person opened. Nothing leaves for another origin through the worker (Chromium shows the worker's own requests;
// WebKit does not, so there the rule is proved by tests/unit/sw-logic.test.ts), and the inbox ends empty.
import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { CALC_PAGES, LIFE_CALC_PAGES } from '../../src/tools/calc/registry.ts';
import { INBOX_CACHE } from '../../src/sw/shared.ts';
import { chooseImage, generatedJpeg, type TestFile } from './lib/page.ts';
import { choosePdfs, filesOf, pdfBytes, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { allKept, cacheKeys, controlled, share, visit } from './lib/sw.ts';

test.use({ serviceWorkers: 'allow' });

const TYPED = ['777123', '424242', '2026-03-15'];
const NAMES = ['sentinela-privada', 'segredo-contrato', 'compartilhado-ferias'];

let server: SwServer;
test.beforeEach(async () => {
  server = await startSwServer();
});
test.afterEach(async () => {
  await server.close();
});

test('nothing typed or opened enters a cache, nothing leaves by the worker, and the inbox ends empty', async ({ page, context, browserName }) => {
  const fromWorker: string[] = [];
  context.on('request', (request) => {
    if (request.serviceWorker()) fromWorker.push(request.url());
  });
  await visit(page, server, '/', { island: false });
  await controlled(page);

  // Links of the scenario with numbers, and numbers typed.
  await visit(page, server, `${CALC_PAGES['mortgage-calculator'].path}#v=1&p=77712300`);
  await page.locator('#fo-calc-p').fill('424242');
  await allKept(page);
  await visit(page, server, `${LIFE_CALC_PAGES['due-date-calculator'].path}#v=1&m=lmp&d=2026-03-15`);
  await allKept(page);

  // Files processed, with names that must never be in a cache.
  const jpeg = await generatedJpeg(page);
  await visit(page, server, '/compress-image/');
  await chooseImage(page, `${NAMES[0]}.jpg`);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });
  await visit(page, server, '/rotate-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf', `${NAMES[1]}.pdf`)]);
  expect(filesOf(await takePdfDownload(page))).toHaveLength(1);

  // A share, delivered to a tool.
  const shared: TestFile = { name: `${NAMES[2]}.jpg`, mimeType: 'image/jpeg', buffer: jpeg };
  await share(page, '/open-with/', [shared]);
  await page.locator('[data-tool="compress-image"] a').click();
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });

  const keys = Object.entries(await cacheKeys(page)).flatMap(([name, urls]) => [name, ...urls]);
  expect(keys.length).toBeGreaterThan(5);
  for (const key of keys) {
    const path = key.replace(server.origin, '');
    expect(path, key).not.toMatch(/[#?]/);
    for (const sentinel of [...TYPED, ...NAMES]) expect(key, sentinel).not.toContain(sentinel);
  }
  const databases = await page.evaluate(async () => ('databases' in indexedDB ? (await indexedDB.databases()).map((db) => db.name ?? '') : []));
  for (const name of databases) for (const sentinel of [...TYPED, ...NAMES]) expect(name).not.toContain(sentinel);

  // No cached body is a file the person opened.
  const opened = new Set([jpeg, pdfBytes('gen-paginas-mistas.pdf')].map((bytes) => createHash('sha256').update(bytes).digest('hex')));
  const cached = await page.evaluate(async () => {
    const hashes: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const body = await (await cache.match(request))?.arrayBuffer();
        if (body) hashes.push([...new Uint8Array(await crypto.subtle.digest('SHA-256', body))].map((byte) => byte.toString(16).padStart(2, '0')).join(''));
      }
    }
    return hashes;
  });
  for (const hash of cached) expect(opened.has(hash), 'a cached body is a file the person opened').toBe(false);

  expect(await page.evaluate((name) => caches.has(name), INBOX_CACHE), 'the inbox ends empty').toBe(false);
  expect(server.requests.filter((request) => request.method === 'POST')).toEqual([]);
  if (browserName === 'chromium') {
    expect(fromWorker.length, 'the worker fetched files').toBeGreaterThan(0);
    for (const url of fromWorker) expect(new URL(url).origin, url).toBe(server.origin);
    for (const url of fromWorker) expect(url, url).not.toMatch(/[#?]/);
  } else {
    test.info().annotations.push({ type: 'webkit', description: `the requests of the worker are not reported by WebKit (${fromWorker.length} seen)` });
  }
});
