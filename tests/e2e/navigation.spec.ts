import { expect, test } from '@playwright/test';
import { LAUNCHED } from '../../src/platform/site.ts';
import { QR_ID, ROUTES, type Lang } from '../../src/i18n/routes.ts';
import ptCommon from '../../src/i18n/pt/common.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, GUIDE_IDS, LIFE_CALC_IDS, LIFE_CALC_PAGES, type LifeCalcId } from '../../src/tools/calc/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { filterEntries, type SearchEntry } from '../../src/search/search.ts';

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

// F2 (DECISOES § 84): a page that exists only in English offers the other languages' homes, never a missing page. F6: HEIC to
// JPG has its Portuguese and Spanish pages now, so the example is a file guide, which stays in English (DECISOES § 233).
test('on a page that exists only in English, the language menu leads to the home of each language', async ({ page }) => {
  await page.goto('/guides/heic-to-jpg-on-windows/');
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
  // F6: the English synonym finds the Portuguese pages, Compress image first (its presets, Resize image and Compress PDF follow).
  await expect(dialog.getByRole('option').first()).toHaveText(/Comprimir imagem/);
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.fill('youtube downloader');
  // The empty title (the status region says the same words since the F3, so the text alone matches two elements).
  await expect(dialog.locator('[data-search-empty-title]')).toContainText('Nenhuma ferramenta chamada "youtube downloader"');
  await input.fill('reduzir');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/pt\/comprimir-imagem\/$/);
});

// F2: the index has every image tool and preset, and each language shows only the pages it has. F6: Portuguese has the
// image and PDF tools and the Brazilian calculators, read from the route map, and still never offers a page that exists
// only in English (DECISOES § 233). F7: and the home and health calculators and the QR code generator, English only, read
// from the registry and the route map (the English count grows by construction, DECISOES § 259).
const SEARCHED = new Set<string>([...IMAGE_TOOL_IDS, ...IMAGE_PRESET_IDS, ...PDF_TOOL_IDS, ...CALC_PAGE_IDS, ...BR_CALC_IDS, ...GUIDE_IDS, ...FILE_GUIDE_IDS, ...LIFE_CALC_IDS, QR_ID]);
const searchedIn = (lang: Lang): number => ROUTES.filter((route) => SEARCHED.has(route.id) && route.paths[lang]).length;
const PT_NAMES = [...Object.values(ptCommon.tools), ...Object.values(ptCommon.pdf), ...Object.values(ptCommon.calcs)].map((blurb) => blurb.name);

test('the search shows only the pages that exist in the language and never falls back to English', async ({ page }) => {
  await page.goto('/pt/');
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  // Nothing typed: every page Portuguese has (31 in the F6, fewer than the English list).
  expect(searchedIn('pt')).toBeLessThan(searchedIn('en'));
  await expect(dialog.getByRole('option')).toHaveCount(searchedIn('pt'));
  // 'compress' and 'jpg' match pages that exist in Portuguese: every row is the Portuguese name of one of them.
  for (const query of ['compress', 'jpg', 'jpeg']) {
    await input.fill(query);
    const rows = await dialog.getByRole('option').allInnerTexts();
    expect(rows.length, query).toBeGreaterThan(0);
    for (const row of rows) expect(PT_NAMES.some((name) => row.replace(/\s+/g, ' ').startsWith(name)), `${query}: ${row}`).toBe(true);
  }
  await input.fill('compress');
  await expect(dialog.getByRole('option').first()).toHaveText(/Comprimir imagem/);
  // The mortgage calculator exists in English and Spanish only: Portuguese finds nothing, and does not offer the English page.
  await input.fill('mortgage');
  await expect(dialog.locator('[data-search-empty]')).toBeVisible();
  await expect(dialog.getByRole('option')).toHaveCount(0);
  await expect(dialog.locator('[data-search-empty-title]')).toContainText('mortgage');
  // F3: a screen reader hears the empty state through the status region (WCAG 4.1.3, DECISOES § 101).
  await expect(dialog.getByRole('status')).toHaveText('Nenhuma ferramenta chamada "mortgage"');
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
  // F5b: and the guide on PDF to JPG resolution, whose name has the three words too, last (DECISOES § 190).
  await expect(dialog.getByRole('option')).toHaveText([...rows('Image to PDF'), 'PDF to JPGPDF', 'Which resolution to choose for PDF to JPGPDF']);
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

// DECISOES § 180: the first row is where Enter goes, so a tool typed by its name is never behind a neighbour that only
// shares its words (Image to PDF has "pdf", "to" and "jpg", and used to say "merge").
test('Enter on the name of a PDF tool opens that tool, not Image to PDF', async ({ page }) => {
  await page.goto('/');
  const dialog = page.locator('#fo-search-dialog');
  for (const [query, path, first] of [
    ['merge pdf', /\/merge-pdf\/$/, 'Merge PDFPDF'],
    ['pdf to jpg', /\/pdf-to-jpg\/$/, 'PDF to JPGPDF'],
    ['jpg to pdf', /\/image-to-pdf\/$/, 'Image to PDFImage'],
  ] as const) {
    await page.keyboard.press('Control+K');
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole('combobox');
    await input.fill(query);
    await expect(dialog.getByRole('option').first(), query).toHaveText(first);
    await expect(dialog.getByRole('option').first(), query).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');
    await expect(page, query).toHaveURL(path);
  }
});

test('the search box lists every page on a phone and scrolls, so the Close button stays on screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 667 });
  await page.goto('/');
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  // F4: the English search also lists the calculators, their presets and the guides (DECISOES § 125); F5a: and the PDF tools;
  // F5b: and the file guides (DECISOES § 190). F7: and the 11 home and health calculators and the QR code generator, read from
  // the registry and the route map (the count grows by construction, DECISOES § 259).
  const utilities = ROUTES.filter((route) => route.id === QR_ID && route.paths.en).length;
  const pages = IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length + PDF_TOOL_IDS.length + CALC_PAGE_IDS.length + GUIDE_IDS.length + FILE_GUIDE_IDS.length + LIFE_CALC_IDS.length + utilities;
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
  // F6: Compress PDF exists in Spanish and says "achicar pdf" too; Compress image comes first.
  await expect(page.locator('[data-search-inline]').getByRole('option').first()).toHaveText(/Comprimir imagen/);
});

// F7 (decision 9): the English search finds the home and health calculators by the words people use ("pregnancy", "AC size",
// "cubic yards"), each in its category, and Enter opens the first one. Portuguese and Spanish do not have these pages: the
// same words there never offer an English page (the search never falls back to English), only pages of the language.
const LIFE_SEARCHES = [
  ['pregnancy', ['due-date-calculator']],
  ['ac size', ['btu-calculator']],
  ['cubic yards', ['concrete-calculator', 'mulch-calculator']],
] as const satisfies readonly (readonly [string, readonly LifeCalcId[]])[];
const CATEGORY_OF = { house: enCommon.search.homeCategory, health: enCommon.search.healthCategory } as const;
const lifeRow = (id: LifeCalcId): string => `${enCommon.calcs[id].name}${CATEGORY_OF[LIFE_CALC_PAGES[id].hub]}`;

test('the English search finds the home and health calculators by their synonyms and opens the first one', async ({ page }) => {
  const dialog = page.locator('#fo-search-dialog');
  for (const [query, ids] of LIFE_SEARCHES) {
    await page.goto('/');
    await page.keyboard.press('Control+K');
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole('combobox');
    await input.fill(query);
    const options = dialog.getByRole('option');
    for (const [index, id] of ids.entries()) await expect(options.nth(index), `${query}: ${id}`).toHaveText(lifeRow(id));
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');
    await expect(page, query).toHaveURL(new RegExp(`${LIFE_CALC_PAGES[ids[0]].path}$`));
  }
});

test('in Portuguese and Spanish the same words never offer a page that exists only in English', async ({ page, request }) => {
  const index = (await (await request.get('/search-index.json')).json()) as SearchEntry[];
  const englishOnly = index.filter((entry) => entry.href['en'] && !entry.href['pt'] && !entry.href['es']).map((entry) => entry.name['en'] ?? '');
  for (const id of LIFE_CALC_IDS) expect(englishOnly, `${id} só em inglês no índice`).toContain(enCommon.calcs[id].name);
  for (const lang of ['pt', 'es'] as const) {
    const own = index.filter((entry) => entry.href[lang]).map((entry) => entry.name[lang] ?? '');
    await page.goto(`/${lang}/`);
    await page.keyboard.press('Control+K');
    const dialog = page.locator('#fo-search-dialog');
    const input = dialog.getByRole('combobox');
    await expect(input).toBeFocused();
    for (const [query] of LIFE_SEARCHES) {
      await input.fill(query);
      // What the dialog lists for this query in this language (the list repaints after the index answers): the count is
      // waited for, so the rows read below are this query's and not the last one's.
      const shown = filterEntries(index, query, lang);
      await expect(dialog.getByRole('option'), `${lang} ${query}`).toHaveCount(shown.length);
      if (shown.length === 0) await expect(dialog.locator('[data-search-empty-title]')).toContainText(query);
      const rows = (await dialog.getByRole('option').allInnerTexts()).map((row) => row.replace(/\s+/g, ' ').trim());
      for (const row of rows) {
        expect(own.some((name) => row.startsWith(name)), `${lang} ${query}: ${row} é uma página do idioma`).toBe(true);
        expect(englishOnly.some((name) => row.startsWith(name)), `${lang} ${query}: ${row} só existe em inglês`).toBe(false);
      }
    }
  }
});

test('the English 404 page finds every home and health calculator by its name', async ({ page }) => {
  expect((await page.goto('/nope/deep/'))?.status()).toBe(404);
  const search = page.locator('[data-search-inline]');
  const box = search.getByRole('combobox');
  await box.click();
  for (const id of LIFE_CALC_IDS) {
    await box.fill(enCommon.calcs[id].name);
    await expect(search.getByRole('option').first(), id).toHaveText(lifeRow(id));
  }
  await box.fill('pregnancy');
  await expect(search.getByRole('option').first()).toHaveText(lifeRow('due-date-calculator'));
});

test('trailing slash: a path without it redirects', async ({ request }) => {
  const response = await request.get('/pt/sobre', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers()['location']).toBe('/pt/sobre/');
});
