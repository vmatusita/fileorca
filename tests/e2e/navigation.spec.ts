import { expect, test } from '@playwright/test';

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

test('pages are served with the generated headers (noindex while LAUNCHED = false)', async ({ request }) => {
  for (const path of ['/', '/compress-image/', '/pt/apoie/', '/build.txt']) {
    const response = await request.get(path);
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-robots-tag']).toContain('noindex');
    expect(headers['content-security-policy']).toBe("frame-ancestors 'self'");
    expect(headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
    expect(headers['cross-origin-opener-policy']).toBeUndefined();
    expect(headers['cross-origin-embedder-policy']).toBeUndefined();
  }
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
  await expect(dialog.getByText('Nenhuma ferramenta', { exact: false }).or(dialog.locator('[data-search-empty-title]'))).toContainText('youtube downloader');
  await input.fill('reduzir');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/pt\/comprimir-imagem\/$/);
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
