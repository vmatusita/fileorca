import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ROUTES } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { exifBlock, hasGps, segments as segmentsOf } from './lib/jpeg.ts';
import { dataLayer, dismissCookies, downloadBytes, hydrated } from './lib/page.ts';

const GPS_PHOTO = 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg';

test.describe('Compress image (shared island)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
  });

  test('the fixture really has GPS, and the compressed copy has no metadata at all', async ({ page, baseURL }) => {
    const original = new Uint8Array(readFileSync(GPS_PHOTO));
    expect(hasGps(original)).toBe(true);
    const outbound: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin !== new URL(baseURL ?? '').origin && !url.protocol.startsWith('blob')) outbound.push(request.url());
      if (request.method() !== 'GET') outbound.push(`${request.method()} ${request.url()}`);
    });
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    const result = page.locator('.fo-result');
    await expect(result).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-btn--download')).toBeFocused();
    await expect(result).toContainText('3264 × 2448');
    const bytes = await downloadBytes(page);
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xd8);
    expect(exifBlock(bytes)).toBeNull();
    expect(hasGps(bytes)).toBe(false);
    expect(bytes.length).toBeLessThan(original.length);
    await expect(result).toContainText(/Done! Your image is \d+% lighter\./);
    expect(outbound).toEqual([]);
  });

  test('the work runs in the Web Worker where the browser supports OffscreenCanvas', async ({ page }) => {
    const workerSupported = await page.evaluate(() => typeof OffscreenCanvas !== 'undefined');
    const workers: string[] = [];
    page.on('worker', (worker) => workers.push(worker.url()));
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    expect(workers.some((url) => /\/_astro\/worker-[\w-]+\.js$/.test(url))).toBe(true);
    if (!workerSupported) console.log('este navegador não tem OffscreenCanvas: o motor rodou na página (DECISOES § 22)');
  });

  test('changing the option re-processes at once, without an Apply button, and keeps the focus', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-btn--download')).toBeFocused();
    const recommended = (await downloadBytes(page)).length;
    await page.locator('input[name="ci-level"][value="recommended"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('input[name="ci-level"][value="strong"]')).toBeChecked();
    // While it re-processes the card may give way to the progress for a moment; wait for it back.
    await expect
      .poll(async () => {
        try {
          return (await downloadBytes(page)).length;
        } catch {
          return Number.POSITIVE_INFINITY; // the card is giving way to the progress right now
        }
      }, { timeout: 30_000 })
      .toBeLessThan(recommended);
    await expect(page.locator('input[name="ci-level"][value="strong"]')).toBeFocused();
    await expect(page.getByRole('button', { name: /apply/i })).toHaveCount(0);
  });

  test('without gain, the original goes back without metadata and the text says so', async ({ page }) => {
    const exif = segmentsOf(new Uint8Array(readFileSync(GPS_PHOTO))).find((segment) => segment.marker === 0xe1);
    expect(exif).toBeDefined();
    // A small, noisy, already very compressed JPEG: saving it again at 82% makes it bigger.
    const tiny = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      const pixels = context.createImageData(800, 600);
      let seed = 12345;
      for (let i = 0; i < pixels.data.length; i += 1) {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        pixels.data[i] = i % 4 === 3 ? 255 : seed % 256;
      }
      context.putImageData(pixels, 0, 0);
      const blob = await new Promise<Blob>((done) => canvas.toBlob((b) => done(b as Blob), 'image/jpeg', 0.2));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    });
    const length = (exif?.data.length ?? 0) + 2;
    const app1 = [0xff, 0xe1, length >> 8, length & 0xff, ...(exif?.data ?? [])];
    const withGps = Buffer.from([...tiny.slice(0, 2), ...app1, ...tiny.slice(2)]);
    expect(hasGps(new Uint8Array(withGps))).toBe(true);
    await page.setInputFiles('input[type="file"]', { name: 'tiny.jpg', mimeType: 'image/jpeg', buffer: withGps });
    await expect(page.locator('.fo-result')).toContainText('This image was already optimized', { timeout: 30_000 });
    const bytes = await downloadBytes(page);
    expect(hasGps(bytes)).toBe(false);
    expect(exifBlock(bytes)).toBeNull();
    expect(bytes.length).toBeLessThanOrEqual(withGps.length);
    await expect(page.locator('.fo-placard')).toHaveCount(0);
  });

  test('a file the browser cannot decode shows the Oli error in text, with role alert', async ({ page }) => {
    const junk = Buffer.from(Array.from({ length: 2048 }, (_, i) => (i * 37) % 251));
    await page.setInputFiles('input[type="file"]', { name: 'broken.jpg', mimeType: 'image/jpeg', buffer: junk });
    const alert = page.getByRole('alert');
    await expect(alert).toContainText("Oops, Oli couldn't read this file", { timeout: 30_000 });
    await expect(alert).toContainText('broken.jpg');
    await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose other files' })).toBeVisible();
  });

  test('an unsupported type is refused with the same message', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    await expect(page.getByRole('alert')).toContainText('notes.txt');
  });

  test('events carry only the listed parameters and never the file name', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await page.locator('.fo-btn--download').click();
    await page.getByRole('button', { name: 'Start over' }).click();
    await page.setInputFiles('input[type="file"]', { name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(64, 7) });
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30_000 });
    const allowed: Record<string, string[]> = {
      tool_start: ['tool', 'lang'],
      tool_complete: ['tool', 'lang', 'outcome'],
      download: ['tool', 'lang'],
      next_step_click: ['tool', 'lang', 'target'],
      tool_error: ['tool', 'lang', 'browser', 'codec', 'reason'],
      donate_click: ['place', 'lang'],
    };
    const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event');
    const names = events.map((entry) => entry[1]);
    expect(names).toEqual(expect.arrayContaining(['tool_start', 'tool_complete', 'download']));
    for (const [, name, params] of events) {
      expect(Object.keys(allowed)).toContain(name);
      for (const key of Object.keys(params as object)) expect(allowed[name as string]).toContain(key);
      expect(JSON.stringify(params)).not.toContain('jpg-02');
      expect(JSON.stringify(params)).not.toContain('broken');
    }
  });

  test('the result offers the next step and Start over returns to the drop zone', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    // 2 to 4 chips, each one to a tool that exists (DECISOES § 58): the first leads to a page of the site.
    const chips = page.locator('nav.fo-next a.fo-chip');
    expect(await chips.count()).toBeGreaterThanOrEqual(2);
    expect(await chips.count()).toBeLessThanOrEqual(4);
    const href = await chips.first().getAttribute('href');
    const target = ROUTES.find((route) => route.paths.en === href);
    expect(target, `${href} is a page of the route map`).toBeDefined();
    expect(IMAGE_PAGES['compress-image'].next).toContain(target?.id);
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.locator('.fo-drop')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose images' })).toBeFocused();
  });
});

test('the tool works in Portuguese and Spanish too', async ({ page }) => {
  for (const [path, done] of [['/pt/comprimir-imagem/', /Prontinho! Sua imagem ficou \d+% mais leve\./], ['/es/comprimir-imagen/', /¡Listo! Tu imagen quedó un \d+ % más ligera\./]] as const) {
    await page.goto(path);
    await hydrated(page);
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toContainText(done, { timeout: 30_000 });
    // The other image tools exist only in English, so the only chip leads to the home of the language (DECISOES § 27).
    await expect(page.locator('nav.fo-next a.fo-chip')).toHaveAttribute('href', path.startsWith('/pt/') ? '/pt/' : '/es/');
  }
});
