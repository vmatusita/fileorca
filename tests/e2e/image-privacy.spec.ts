import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { allPages, fileForPath } from '../../scripts/lib/dist.ts';
import { imageSize, sniff } from './lib/images.ts';
import { expectNoMetadata, fixtureFile, takeDownload, watchRequests } from './lib/matrix.ts';
import { dismissCookies, hydrated } from './lib/page.ts';
import { thumbnail } from './lib/pixels.ts';

// Privacy and isolation of the image phase (criteria 8, 9 and 10): no page is cross-origin isolated and
// none sends COOP or COEP; the build has no multi-thread codec, no SharedArrayBuffer and nothing
// outside the dist/ the plan allows; the libheif .wasm that is served is the unmodified file of the
// package (it is LGPL, so it stays a file of its own); and the pictures above the canvas limit take the
// path without a canvas in both browsers. The requests of every tool are asserted in the matrix
// (nothing leaves the page origin); what a person types never reaches the URL or an event in
// image-smoke.spec.ts ("typed numbers").

const DIST = 'dist';
const ASTRO = join(DIST, '_astro');
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
/**
 * Every page of the route map that the build made. A route whose page is not in dist/ is not a header
 * problem (gate:links, routes.test and the 404 of this very test's neighbours say so); it is left out
 * so that the hub, which is built beside this work, joins the list by itself the moment it exists.
 */
const PAGES = allPages()
  .map((page) => page.path)
  .filter((path) => existsSync(fileForPath(path)));

/** Hashed asset names carry an 8-character hash after "-" or "."; the rest of the name is what a rule may match. */
const withoutHash = (file: string): string => basename(file).replace(/[-.][\w-]{8}(\.[a-z0-9]+)$/i, '$1');

test.describe('no isolation headers, no multi-thread build', () => {
  test('no page, script or .wasm is sent with COOP or COEP', async ({ request }) => {
    const assets = readdirSync(ASTRO)
      .filter((file) => /\.(wasm|js|css)$/.test(file))
      .map((file) => `/_astro/${file}`);
    for (const path of [...PAGES, '/search-index.json', '/robots.txt', ...assets]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['cross-origin-opener-policy'], `${path}: COOP`).toBeUndefined();
      expect(response.headers()['cross-origin-embedder-policy'], `${path}: COEP`).toBeUndefined();
    }
  });

  test('the dist has no multi-thread codec, no worker helper and not a SharedArrayBuffer', () => {
    const files = readdirSync(DIST, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
    expect(files.length, 'dist is built').toBeGreaterThan(50);
    const forbiddenName = /_mt|\.worker\.mjs|workerHelpers|pkg-parallel|hqx|magic-kernel/i;
    const named = files.map((entry) => join(entry.parentPath, entry.name)).filter((path) => forbiddenName.test(withoutHash(path)));
    expect(named, 'no file named after a multi-thread build').toEqual([]);

    // Every .wasm is one of the single-thread builds the engine asks for, and no script uses shared memory.
    const allowed = /^(avif_dec|avif_enc|libheif|mozjpeg_dec|mozjpeg_enc|squoosh_oxipng_bg|squoosh_resize_bg|webp_dec|webp_enc_simd)\.wasm$/;
    const wasm = files.filter((entry) => entry.name.endsWith('.wasm')).map((entry) => entry.name);
    expect(wasm.length).toBeGreaterThan(0);
    expect(wasm.filter((name) => !allowed.test(withoutHash(name))), 'only the .wasm files of the codecs in use').toEqual([]);
    const shared = files
      .filter((entry) => /\.(js|mjs|html)$/.test(entry.name))
      .map((entry) => join(entry.parentPath, entry.name))
      .filter((path) => readFileSync(path, 'latin1').includes('SharedArrayBuffer'));
    expect(shared, 'SharedArrayBuffer is not mentioned by any script or page').toEqual([]);
  });

  test('the libheif .wasm in the dist is the unmodified file of the package, served as wasm and immutable', async ({ request }) => {
    const original = new Uint8Array(readFileSync('node_modules/libheif-js/libheif-wasm/libheif.wasm'));
    const hash = sha256(original);
    const copies = readdirSync(ASTRO).filter((file) => withoutHash(file) === 'libheif.wasm');
    expect(copies.length, 'libheif.wasm is in dist/_astro').toBeGreaterThan(0);
    for (const file of copies) {
      expect(sha256(new Uint8Array(readFileSync(join(ASTRO, file)))), `${file} on disk`).toBe(hash);
      const response = await request.get(`/_astro/${file}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('application/wasm');
      expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
      expect(sha256(new Uint8Array(await response.body())), `${file} as served`).toBe(hash);
    }
    // And every other codec is served as wasm with the same immutable cache (instantiateStreaming needs the type).
    for (const file of readdirSync(ASTRO).filter((name) => name.endsWith('.wasm'))) {
      const response = await request.get(`/_astro/${file}`);
      expect(response.headers()['content-type'], file).toBe('application/wasm');
      expect(response.headers()['cache-control'], file).toBe('public, max-age=31536000, immutable');
    }
  });
});

test.describe('while processing', () => {
  test('the page is not cross-origin isolated, and libheif comes to a HEIC as the unmodified file', async ({ page }) => {
    const wasm: { url: string; type: string | undefined; cache: string | undefined; hash: string }[] = [];
    const reading: Promise<void>[] = [];
    page.on('response', (response) => {
      if (!response.url().endsWith('.wasm')) return;
      reading.push(
        response.body().then(
          (body) => {
            wasm.push({ url: response.url(), type: response.headers()['content-type'], cache: response.headers()['cache-control'], hash: sha256(new Uint8Array(body)) });
          },
          () => undefined,
        ),
      );
    });
    const requests = watchRequests(page);
    const navigation = await page.goto('/heic-to-jpg/');
    expect(navigation?.headers()['cross-origin-opener-policy']).toBeUndefined();
    expect(navigation?.headers()['cross-origin-embedder-policy']).toBeUndefined();
    await hydrated(page);
    await dismissCookies(page);

    await page.setInputFiles('input[type="file"]', fixtureFile('heic-08-iphone13pro-paisagem-hdr-ios17.heic'));
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 50_000 });
    const out = await takeDownload(page);
    expect(out.name).toBe('heic-08-iphone13pro-paisagem-hdr-ios17.jpg');
    expect(imageSize(out.bytes)).toMatchObject({ format: 'jpeg', displayWidth: 1512, displayHeight: 850 });

    // Isolation is off in the page and the browser gives it no shared memory, however the work is done.
    expect(await page.evaluate(() => crossOriginIsolated)).toBe(false);
    expect(await page.evaluate(() => typeof SharedArrayBuffer)).toBe('undefined');

    // This browser cannot read HEIC itself, so the libheif of the package ran, as it is in the package.
    await Promise.all(reading);
    const original = sha256(new Uint8Array(readFileSync('node_modules/libheif-js/libheif-wasm/libheif.wasm')));
    const libheif = wasm.filter((entry) => withoutHash(entry.url) === 'libheif.wasm');
    expect(libheif.length, 'libheif.wasm was fetched for the HEIC').toBeGreaterThan(0);
    for (const entry of libheif) {
      expect(entry.type).toBe('application/wasm');
      expect(entry.cache).toBe('public, max-age=31536000, immutable');
      expect(entry.hash, 'the bytes the browser received').toBe(original);
    }
    expect(requests.outside()).toEqual([]);
  });
});

// The pictures above 16,777,216 px (the canvas of Safari on the iPhone) go from the WASM decoder to the
// encoder without a canvas, in every browser: the choice is by the number of pixels, so Chromium and
// WebKit both take both paths. That the output of the no-canvas path is right (opens, size, no
// metadata) in Compress image and in Resize image is asserted in the matrix (gen-grande-4100x4100.jpg is
// in the batch of both); what is asserted here is that the path itself ran. The Resize page is the one
// that can prove it by its requests: it warms no codec, so the JPEG decoder and the resize codec are
// fetched only for a picture that cannot use a canvas. (Compress warms all its codecs on first use.)
// 4100 × 4100 is 32,784 px above the limit; 1600 × 1200 is far below it.
test('Resize image: a picture above the canvas limit takes the path without a canvas, one below it does not', async ({ page }) => {
  const requests = watchRequests(page);
  await page.goto('/resize-image/');
  await hydrated(page);
  await dismissCookies(page);
  const fetched = (codec: string) => requests.urls.some((url) => new RegExp(`/${codec}[-.][\\w-]+\\.wasm$`).test(url));

  await page.setInputFiles('input[type="file"]', fixtureFile('gen-jpg-02-orientacao8.jpg'));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  expect(fetched('mozjpeg_dec'), '1600 × 1200 goes through the canvas: no WASM JPEG decoder').toBe(false);
  expect(fetched('squoosh_resize_bg'), '1600 × 1200 is scaled by the canvas: no WASM resize').toBe(false);

  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.locator('.fo-drop')).toBeVisible();
  await page.setInputFiles('input[type="file"]', fixtureFile('gen-grande-4100x4100.jpg'));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 50_000 });
  expect(fetched('mozjpeg_dec'), '4100 × 4100 is above the limit: the WASM decoder runs').toBe(true);
  expect(fetched('squoosh_resize_bg'), '4100 × 4100 is scaled without a canvas: the WASM resize runs').toBe(true);

  // Half of 4100 × 4100, opened by the browser, with nothing of the original's metadata.
  const out = await takeDownload(page);
  expect(sniff(out.bytes)).toBe('jpeg');
  expect(imageSize(out.bytes)).toMatchObject({ displayWidth: 2050, displayHeight: 2050 });
  expectNoMetadata({ name: out.name, bytes: out.bytes });
  const opened = await thumbnail(page, out.bytes, 'image/jpeg', { size: 8 });
  expect(opened.ok, `the output opens in the browser: ${opened.error}`).toBe(true);
  expect([opened.width, opened.height]).toEqual([2050, 2050]);
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(false);
  expect(requests.outside()).toEqual([]);
});
