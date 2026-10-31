import { expect, test } from '@playwright/test';
import { fixtureFile, takeDownload } from './lib/matrix.ts';
import { dismissCookies, hydrated, startOver } from './lib/page.ts';

// The technical claims of the launch texts (docs/lancamento/show-hn.md; DECISOES § 98), proven over the dist/
// in both browsers, on a JPEG codec, the libheif decoder and the PDF worker:
// 1. no byte of the file leaves the browser: every request the page and its workers make is a GET to the
//    site's own origin, with no body;
// 2. once the page and the codec are loaded, the tool keeps working offline: the network goes off and the
//    next file is processed and downloaded.

const CASES = [
  { path: '/compress-image/', first: 'jpg-02-iphone6-paisagem-gps.jpg', second: 'jpg-01-pixel2-retrato-gps.jpg', magic: [0xff, 0xd8, 0xff] },
  { path: '/heic-to-jpg/', first: 'heic-06-iphone7-paisagem-gps.heic', second: 'heic-04-iphone11promax-retrato-livephoto-gps.heic', magic: [0xff, 0xd8, 0xff] },
  { path: '/image-to-pdf/', first: 'jpg-02-iphone6-paisagem-gps.jpg', second: 'gen-png-transparente.png', magic: [0x25, 0x50, 0x44, 0x46] },
] as const;

for (const { path, first, second, magic } of CASES) {
  test(`${path}: no byte of the file leaves the browser, and the tool keeps working offline`, async ({ page, context }) => {
    const requests: { url: string; method: string; body: number }[] = [];
    context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postDataBuffer()?.length ?? 0 }));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const origin = new URL(page.url()).origin;

    await page.setInputFiles('input[type="file"]', fixtureFile(first));
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
    const online = await takeDownload(page);
    expect([...online.bytes.subarray(0, magic.length)], `${first}: a real result`).toEqual([...magic]);

    // What the page and its workers asked for while the file was read, processed and downloaded.
    const sent = requests.filter((request) => !/^(blob|data|about):/.test(request.url));
    expect(sent.length, 'the page, its scripts and the codec were requested').toBeGreaterThan(2);
    expect(sent.filter((request) => new URL(request.url).origin !== origin), 'nothing goes to another origin').toEqual([]);
    expect(sent.filter((request) => request.method !== 'GET' || request.body > 0), 'nothing is sent with a body').toEqual([]);
    // Nor in the address: no request carries a query string (second pass p2-integridade-03).
    expect(sent.filter((request) => new URL(request.url).search !== ''), 'nothing is sent in a query string').toEqual([]);

    // The network goes off; the next file goes through the same loaded worker and codec.
    await context.setOffline(true);
    const before = requests.length;
    await startOver(page);
    await page.setInputFiles('input[type="file"]', fixtureFile(second));
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
    const offline = await takeDownload(page);
    expect([...offline.bytes.subarray(0, magic.length)], `${second}: a real result offline`).toEqual([...magic]);
    expect(requests.slice(before).filter((request) => !/^(blob|data|about):/.test(request.url)), 'offline, nothing was asked of the network').toEqual([]);
    await context.setOffline(false);
  });
}
