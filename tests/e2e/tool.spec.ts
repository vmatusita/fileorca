import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { exifBlock, hasGps } from './lib/jpeg.ts';
import { dataLayer, dismissCookies, downloadBytes, hydrated } from './lib/page.ts';

const GPS_PHOTO = 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg';

test.describe('Compress image (motor provisório)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
  });

  test('the fixture really has GPS, and the compressed copy has no metadata at all', async ({ page }) => {
    const original = new Uint8Array(readFileSync(GPS_PHOTO));
    expect(hasGps(original)).toBe(true);
    const outbound: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin !== 'http://127.0.0.1:4173' && !url.protocol.startsWith('blob')) outbound.push(request.url());
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

  test('changing the option re-processes at once, without an Apply button', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    const recommended = (await downloadBytes(page)).length;
    await page.locator('label.fo-seg__opt', { hasText: 'Strong' }).click();
    await expect.poll(async () => (await downloadBytes(page)).length, { timeout: 30_000 }).toBeLessThan(recommended);
    await expect(page.getByRole('button', { name: /apply/i })).toHaveCount(0);
  });

  test('a file the browser cannot decode shows the Oli error in text, with role alert', async ({ page }) => {
    const junk = Buffer.from(Array.from({ length: 2048 }, (_, i) => (i * 37) % 251));
    await page.setInputFiles('input[type="file"]', { name: 'broken.jpg', mimeType: 'image/jpeg', buffer: junk });
    const alert = page.getByRole('alert');
    await expect(alert).toContainText("Oops, Oli couldn't read this file", { timeout: 30_000 });
    await expect(alert).toContainText('broken.jpg');
    await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose another file' })).toBeVisible();
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
    await expect(page.locator('nav.fo-next a.fo-chip')).toHaveAttribute('href', '/');
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.locator('.fo-drop')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose image' })).toBeFocused();
  });
});

test('the tool works in Portuguese and Spanish too', async ({ page }) => {
  for (const [path, done] of [['/pt/comprimir-imagem/', /Prontinho! Sua imagem ficou \d+% mais leve\./], ['/es/comprimir-imagen/', /¡Listo! Tu imagen quedó \d+ % más ligera\./]] as const) {
    await page.goto(path);
    await hydrated(page);
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', GPS_PHOTO);
    await expect(page.locator('.fo-result')).toContainText(done, { timeout: 30_000 });
  }
});
