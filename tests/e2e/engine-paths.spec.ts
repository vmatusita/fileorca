import { expect, test, type Page } from '@playwright/test';
import { fixtureFile } from './lib/matrix.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';

// The paths of the engine that the CI browsers do not take by themselves (DECISOES § 102): the page path of a worker
// without OffscreenCanvas (review a-03), and the code of the engine that does not arrive, offline or after a deploy, in
// which case a good file is not called damaged and the panel never hangs (review a-01 and a-02). One load per test.

test('without OffscreenCanvas in the worker, the engine runs on the page and still delivers', async ({ page }) => {
  // The image engine's worker (the one without pdf-lib) loses its OffscreenCanvas before its own code runs.
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body.includes('PDFDocument') ? body : `delete globalThis.OffscreenCanvas;\n${body}` });
  });
  const pagePath: string[] = [];
  const wasm: string[] = [];
  page.on('request', (request) => {
    if (/\/_astro\/process[\w.-]*\.js$/.test(request.url())) pagePath.push(request.url());
    if (/\.wasm$/.test(request.url())) wasm.push(new URL(request.url()).pathname.replace(/[-.][\w-]{8}\.wasm$/, '.wasm'));
  });
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  // The pointer over the panel warms the engine first, as a person's would (review e-01).
  await page.locator('.fo-slot').hover();
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.fo-result')).toContainText(/Done! Your image is \d+% lighter\./);
  expect(pagePath.length, 'the page path imported the engine').toBeGreaterThan(0);
  // Each codec is fetched once: the worker, which does no image work here, does not warm a copy of its own.
  expect(wasm.length, 'a codec was fetched').toBeGreaterThan(0);
  expect(wasm.filter((name, index) => wasm.indexOf(name) !== index), 'no codec fetched twice').toEqual([]);
});

const LOAD = /Oli couldn't load what she needs to read [\w-]+\.jpg\. Check your connection and reload the page\./;

async function errors(page: Page) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'tool_error').map((entry) => (entry[2] as { reason: string }).reason);
}

test('a good file whose engine cannot load is not called damaged, and says to reload', async ({ page }) => {
  await page.route(/\/_astro\/engine-client[\w.-]*\.js$/, (route) => route.abort());
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-drop').getByText(LOAD)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/is damaged/)).toHaveCount(0);
  expect(await errors(page)).toEqual(['load']);
});

// The codecs load inside the engine on first use: a .wasm that does not arrive is 'load' too, never a damaged file or a
// browser that cannot write JPG, and the file is tried again when an option changes (review p2-motor-01, DECISOES § 104).
test('a codec that cannot load says to reload, and the file is tried again once it can', async ({ page }) => {
  await page.route(/\.wasm$/, (route) => route.abort());
  await page.goto('/heic-to-jpg/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('heic-06-iphone7-paisagem-gps.heic'));
  await expect(page.locator('.fo-drop').getByText(/Oli couldn't load what she needs to read [\w-]+\.heic\./)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/is damaged/)).toHaveCount(0);

  await page.goto('/compress-image/');
  await hydrated(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.locator('.fo-drop').getByText(LOAD)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/can't save|is damaged/)).toHaveCount(0);
  expect(await errors(page)).toEqual(['load']);
  // The network is back: the next run takes the same file again, since 'load' is no fault of the file.
  await page.unroute(/\.wasm$/);
  await page.locator('label.fo-seg__opt', { has: page.locator('input[value="strong"]') }).click();
  await expect(page.locator('.fo-result')).toContainText(/Done! Your image is \d+% lighter\./, { timeout: 30_000 });
});

test('a PDF worker that cannot start ends in an error, not in "Building your PDF" for ever', async ({ page }) => {
  // The PDF worker is the worker chunk that carries pdf-lib; the image engine's worker goes through untouched.
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes('PDFDocument')) await route.abort();
    else await route.fulfill({ response, body });
  });
  await page.goto('/image-to-pdf/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'));
  await expect(page.getByText(LOAD).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Building your PDF')).toHaveCount(0);
  expect(await errors(page)).toEqual(['load']);
});
