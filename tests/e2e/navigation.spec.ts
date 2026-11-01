import { expect, test } from '@playwright/test';
import { LAUNCHED } from '../../src/platform/site.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { CALC_PAGE_IDS, GUIDE_IDS } from '../../src/tools/calc/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

test('a missing page gets the nearest 404 of its language, with status 404', async ({ page }) => {
  for (const [path, lang, heading] of [
    ['/pt/nao-existe/', 'pt-BR', 'Essa página nadou para longe.'],
    ['/es/no-existe', 'es', 'Esta página se fue nadando.'],
    ['/nope/deep/', 'en', 'This page swam away.'],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  }
});

test('pages are served with the generated headers (no X-Robots-Tag since the launch, noindex on the 404)', async ({ request }) => {
  expect(LAUNCHED).toBe(true);
  for (const path of ['/', '/compress-image/', '/pt/apoie/', '/build.txt']) {
    const response = await request.get(path);
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-robots-tag'], path).toBeUndefined();
    expect(headers['content-security-policy']).toBe("frame-ancestors 'self'");
    expect(headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
    expect(headers['cross-origin-opener-policy']).toBeUndefined();
    expect(headers['cross-origin-embedder-policy']).toBeUndefined();
  }
  for (const path of ['/404', '/pt/404', '/es/404']) {
    expect((await request.get(path)).headers()['x-robots-tag'], path).toContain('noindex');
  }
});

// F2 (DECISOES § 84): a page that exists only in English offers the other languages' homes, never a missing page.
test('on a page that exists only in English, the language menu leads to the home of each language', async ({ page }) => {
  await page.goto('/heic-to-jpg/');
  await page.getByRole('button', { name: /^EN/ }).click();
  await expect(page.getByRole('link', { name: 'Português' })).toHaveAttribute('href', '/pt/');
  await expect(page.getByRole('link', { name: 'Español' })).toHaveAttribute('href', '/es/');
});

test('the language button goes to the equivalent page', async ({ page }) => {
  await page.goto('/compress-image/');
  await page.getByRole('button', { name: /^EN/ }).click();
  await page.getByRole('link', { name: 'Português' }).click();
  await expect(page).toHaveURL(/\/pt\/comprimir-imagem\/$/);
  await page.getByRole('button', { name: /^PT/ }).click();
  await page.getByRole('link', { name: 'Español' }).click();
  await expect(page).toHaveURL(/\/es\/comprimir-imagen\/$/);
});

test('tool search loads on first use, finds synonyms in any language and opens the page in the current one', async ({ page }) => {
  const lazy: string[] = [];
  page.on('request', (request) => {
    if (/search-index\.json|\/entry-/.test(request.url())) lazy.push(request.url());
  });
  await page.goto('/pt/');
  await page.waitForLoadState('networkidle');
  expect(lazy).toEqual([]);
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  await expect(dialog).toBeVisible();
  expect(lazy.length).toBe(2);
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  await input.fill('shrink');
  await expect(dialog.getByRole('option')).toHaveText(/Comprimir imagem/);
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.fill('youtube downloader');
  // The empty title (the status region says the same words since the F3, so the text alone matches two elements).
  await expect(dialog.locator('[data-search-empty-title]')).toContainText('Nenhuma ferramenta chamada "youtube downloader"');
  await input.fill('reduzir');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/pt\/comprimir-imagem\/$/);
});

// F2: the index has every image tool and preset, and each language shows only the pages it has.
test('the search shows only the pages that exist in the language and never falls back to English', async ({ page }) => {
  await page.goto('/pt/');
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  // Nothing typed: the one tool Portuguese has. 'compress' and 'jpg' match many pages in English, one here.
  await expect(dialog.getByRole('option')).toHaveCount(1);
  for (const query of ['compress', 'jpg', 'jpeg']) {
    await input.fill(query);
    await expect(dialog.getByRole('option'), query).toHaveText(/Comprimir imagem/);
    await expect(dialog.getByRole('option'), query).toHaveCount(1);
  }
  // HEIC to JPG exists only in English: Portuguese finds nothing, and does not offer the English page.
  await input.fill('heic');
  await expect(dialog.locator('[data-search-empty]')).toBeVisible();
  await expect(dialog.getByRole('option')).toHaveCount(0);
  await expect(dialog.locator('[data-search-empty-title]')).toContainText('heic');
  // F3: a screen reader hears the empty state through the status region (WCAG 4.1.3, DECISOES § 101).
  await expect(dialog.getByRole('status')).toHaveText('Nenhuma ferramenta chamada "heic"');
  await input.fill('jpg');
  await expect(dialog.getByRole('status')).toHaveText('');
});

test('the English search finds the new tools and presets and opens the one chosen', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  await input.fill('compress');
  // Each row reads the name, then the category in small type.
  const rows = (...names: string[]) => names.map((name) => `${name}Image`);
  // F5a: the PDF tools come after the image pages, in their own category, so 'compress' also lists Compress PDF last
  // (the first three rows and their order are what they were).
  await expect(dialog.getByRole('option')).toHaveText([...rows('Compress image', 'Compress image to 100 KB', 'Compress image to 1 MB'), 'Compress PDFPDF']);
  await input.fill('shrink');
  await expect(dialog.getByRole('option')).toHaveCount(5);
  // F5a: PDF to JPG also has the words "jpg", "to" and "pdf" in its names, so it follows Image to PDF.
  await input.fill('jpg to pdf');
  await expect(dialog.getByRole('option')).toHaveText([...rows('Image to PDF'), 'PDF to JPGPDF']);
  await input.fill('heif');
  await expect(dialog.getByRole('option')).toHaveText(rows('HEIC to JPG'));
  await input.press('Enter');
  await expect(page).toHaveURL(/\/heic-to-jpg\/$/);
  // From the arrows: the second result of 'compress' is the 100 KB preset (F5a: out of four, Compress PDF being the last).
  await page.keyboard.press('Control+K');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox').fill('compress');
  await expect(dialog.getByRole('option')).toHaveCount(4);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/compress-image\/to-100kb\/$/);
});

test('the search box lists every page on a phone and scrolls, so the Close button stays on screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 667 });
  await page.goto('/');
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  // F4: the English search also lists the calculators, their presets and the guides (DECISOES § 125); F5a: and the PDF tools.
  const pages = IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length + PDF_TOOL_IDS.length + CALC_PAGE_IDS.length + GUIDE_IDS.length;
  await expect(dialog.getByRole('option')).toHaveCount(pages);
  const close = dialog.getByRole('button', { name: 'Close' });
  await expect(close).toBeInViewport({ ratio: 1 });
  // The list scrolls inside the box; the arrow keys keep the chosen row in view.
  const list = dialog.getByRole('listbox');
  expect(await list.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
  for (let step = 0; step < pages - 1; step += 1) await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('option').last()).toHaveAttribute('aria-selected', 'true');
  await expect(dialog.getByRole('option').last()).toBeInViewport({ ratio: 1 });
  await expect(close).toBeInViewport({ ratio: 1 });
});

test('the 404 page has a working tool search', async ({ page }) => {
  await page.goto('/es/404.html');
  const box = page.locator('[data-search-inline]').getByRole('combobox');
  await box.click();
  await box.fill('achicar');
  await expect(page.locator('[data-search-inline]').getByRole('option')).toHaveText(/Comprimir imagen/);
});

test('trailing slash: a path without it redirects', async ({ request }) => {
  const response = await request.get('/pt/sobre', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers()['location']).toBe('/pt/sobre/');
});
