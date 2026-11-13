import { expect, test, type Page } from '@playwright/test';
import { LANGS, routeById } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { countOf } from '../../src/tools/pdf/grid-math.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_PRESET_IDS, presetsOf } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import splitTexts from '../../src/tools/split-pdf/i18n/en.ts';
import imagesTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import extractTexts from '../../src/tools/split-pdf/presets/extract-pages/i18n/en.ts';
import pngTexts from '../../src/tools/pdf-to-jpg/presets/to-png/i18n/en.ts';
import { imageSize } from './lib/images.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';
import { choosePdfs, filesOf, openTool, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';

// F18 (decisions 5, 7, 8 and 20; DECISOES § 725, § 728 and § 729): the two PDF presets in the browser. Test 2 of the rule of
// the presets (section E of the PLANO-UX-QV): each preset changes the tool, and the page shows it. Extract pages has no
// segment of Split's three modes and gives one PDF; PDF to PNG has no format choice and gives PNG. The parent of each one,
// on the same load, is the control: it still has what the preset takes away. And what a PDF preset has as an image preset
// has it: the page in the three languages (serve-dist answers the nearest 404 for a route that is missing, so the status is
// the proof), the trail of four steps without the hub under 360 px (§ 582), and the table of the presets on the parent page
// and on the PDF hub, with links that answer 200. The matrix (pdf-matrix.spec.ts) checks every fixture.

const root = (page: Page) => page.locator('#fo-tool-root');
const panel = PDF_PANEL_TEXTS.en;
/** Clicks the label of a segmented option (the radio itself is hidden). */
const option = (page: Page, label: string) => root(page).locator('.fo-seg__opt').filter({ hasText: label }).first().click();

test('the two PDF presets answer 200 in the three languages, each with its own H1', async ({ page }) => {
  for (const id of PDF_PRESET_IDS) {
    for (const lang of LANGS) {
      const path = routeById(id).paths[lang] ?? '';
      expect(path, `${id} ${lang}`).not.toBe('');
      expect((await page.goto(path))?.status(), path).toBe(200);
      await expect(page.locator('h1'), path).toHaveText(PDF_TOOL_TEXTS[lang][id].h1);
      await expect(root(page), path).toBeAttached();
    }
  }
});

test('Extract pages: no segment of the modes of Split, the grid at once, and one PDF with the picked pages', async ({ page }) => {
  // The control: Split PDF has its three modes.
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await expect(root(page).locator('input[name="fo-split-mode"]')).toHaveCount(3, { timeout: 30_000 });

  await openTool(page, '/split-pdf/extract-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  const action = page.getByRole('button', { name: extractTexts.panel.action ?? '' });
  await expect(action).toBeVisible({ timeout: 30_000 });
  // No segment of the modes, none of their labels; the help of the preset and the grid of the eight pages from the start.
  await expect(root(page).locator('input[name="fo-split-mode"]')).toHaveCount(0);
  for (const label of [splitTexts.panel.options.legend, splitTexts.panel.options.each, splitTexts.panel.options.ranges]) await expect(root(page).getByText(label, { exact: true })).toHaveCount(0);
  await expect(root(page).getByText(extractTexts.panel.options.pickHelp)).toBeVisible();
  const cells = root(page).locator('.fo-pages__grid .fo-page');
  await expect(cells).toHaveCount(8);
  // Pressed with nothing picked: the error of the preset, and nothing runs.
  await action.click();
  await expect(root(page).getByText(extractTexts.panel.options.pickNone)).toBeVisible();
  await expect(root(page).locator('.fo-btn--download')).toHaveCount(0);
  // "Pick all, Pick none and Invert selection work on the whole grid" (the specs of the page).
  const count = root(page).locator('.fo-pages__count');
  await root(page).getByRole('button', { name: panel.grid.selectAll, exact: true }).click();
  await expect(count).toHaveText(countOf(panel.grid, 8, 8, false));
  await root(page).getByRole('button', { name: panel.grid.selectNone, exact: true }).click();
  await expect(count).toHaveText(countOf(panel.grid, 0, 8, false));
  // Picked on the grid, in another order than the file's: Split's count ("picked"), never Delete's ("come out").
  await cells.nth(4).locator('.fo-page__main').click();
  await cells.nth(1).locator('.fo-page__main').click();
  await expect(count).toHaveText(countOf(panel.grid, 2, 8, false));
  await root(page).getByRole('button', { name: panel.grid.invert, exact: true }).click();
  await expect(count).toHaveText(countOf(panel.grid, 6, 8, false));
  await root(page).getByRole('button', { name: panel.grid.invert, exact: true }).click();
  await expect(count).toHaveText(countOf(panel.grid, 2, 8, false));
  await action.click();
  const download = await takePdfDownload(page);
  expect(download.name).toBe('gen-paginas-mistas-extracted.pdf');
  const read = await readWithPdfjs(download.bytes);
  expect(read.pages.map((p) => p.marker)).toEqual(['Page 2', 'Page 5']);
  // One PDF: the F14 view of the new PDF is there (DECISOES § 625).
  await expect(root(page).locator('.fo-result__more > .fo-result__view')).toHaveText(panel.view.openResult);
});

test('PDF to PNG: no format choice, PNG from the start, "PNG · <resolution>" in Adjust, and the output of PDF to JPG', async ({ page }) => {
  // The control: PDF to JPG has the choice, with JPG marked.
  await openTool(page, '/pdf-to-jpg/');
  await expect(root(page).locator('input[name="fo-images-format"]')).toHaveCount(2);
  await expect(root(page).locator('input[name="fo-images-format"][value="jpeg"]')).toBeChecked();

  await openTool(page, '/pdf-to-jpg/to-png/');
  await expect(root(page).locator('input[name="fo-images-format"]')).toHaveCount(0);
  await expect(root(page).getByText(imagesTexts.panel.options.formatLegend, { exact: true })).toHaveCount(0);
  await expect(root(page).getByText(pngTexts.panel.options.formatHelp)).toBeVisible();
  // The parent's resolution and pages stay, with its default (150 ppi, every page).
  await expect(root(page).locator('input[name="fo-images-ppi"][value="150"]')).toBeChecked();
  await expect(root(page).locator('input[name="fo-images-pages"][value="all"]')).toBeChecked();
  // Two pages: a PNG each, in the ZIP of images of the parent.
  await choosePdfs(page, [pdfFile('gen-acoes.pdf')]);
  const zip = await takePdfDownload(page);
  expect(zip.name).toBe(`${panel.files.imagesZip}.zip`);
  const outs = filesOf(zip);
  expect(outs.map((out) => out.name)).toEqual(['gen-acoes-page-1.png', 'gen-acoes-page-2.png']);
  for (const out of outs) expect(imageSize(out.bytes)).toMatchObject({ format: 'png', width: 1275, height: 1650 });
  // After the result the options fold under "Adjust", which says the format and the resolution; still no format inside.
  const adjust = root(page).locator('.fo-adjust > summary');
  await expect(adjust).toContainText(`${pngTexts.panel.options.png} · ${pngTexts.panel.options.medium}`);
  await adjust.click();
  await expect(root(page).locator('input[name="fo-images-format"]')).toHaveCount(0);
  // The option runs the tool again, and the new result replaces the Download link and revokes the old file: wait for the
  // new address before reading it. Reading in a loop met the revoked one in WebKit on Linux ("TypeError: Load failed" from
  // the fetch, which a poll does not retry), in the first full CI run of the F18 (DECISOES § 750).
  const download = root(page).locator('.fo-btn--download');
  const before = await download.getAttribute('href');
  await option(page, pngTexts.panel.options.low);
  await expect(adjust).toContainText(`${pngTexts.panel.options.png} · ${pngTexts.panel.options.low}`);
  await expect.poll(() => download.getAttribute('href'), { timeout: 30_000 }).not.toBe(before);
  expect(filesOf(await takePdfDownload(page)).map((out) => imageSize(out.bytes).width)).toEqual([612, 612]);
  // One page: one PNG, named as the page says ("report-page-1.png").
  await page.getByRole('button', { name: panel.result.startOver }).click();
  await choosePdfs(page, [pdfFile('pdf-escaneado-01-pagina-livro-cor.pdf')]);
  const single = await takePdfDownload(page);
  expect(single.name).toBe('pdf-escaneado-01-pagina-livro-cor-page-1.png');
  expect(imageSize(single.bytes).format).toBe('png');
});

test('the trail of a PDF preset has four steps, and leaves out the hub under 360 px, as an image preset', async ({ page }) => {
  for (const id of PDF_PRESET_IDS) {
    const parent = PDF_PAGES[id].parent ?? 'split-pdf';
    for (const lang of LANGS) {
      const path = routeById(id).paths[lang] ?? '';
      await page.setViewportSize({ width: 359, height: 740 });
      expect((await page.goto(path))?.status(), path).toBe(200);
      const common = TEXTS[lang].common;
      const steps = page.locator('.fo-crumbs > li');
      await expect(steps, path).toHaveText([common.breadcrumb.home, common.pdfTools, PDF_TOOL_TEXTS[lang][parent].h1, PDF_TOOL_TEXTS[lang][id].h1]);
      const links = await page.locator('.fo-crumbs a').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
      expect(links, path).toEqual([routeById('home').paths[lang], routeById(PDF_HUB_ID).paths[lang], routeById(parent).paths[lang]]);
      await expect(page.locator('.fo-crumbs [aria-current="page"]'), path).toHaveText(PDF_TOOL_TEXTS[lang][id].h1);
      const shown = () => steps.evaluateAll((items) => items.map((item) => getComputedStyle(item).display !== 'none'));
      expect(await shown(), `${path} at 359 px`).toEqual([true, false, true, true]);
      await page.setViewportSize({ width: 360, height: 740 });
      expect(await shown(), `${path} at 360 px`).toEqual([true, true, true, true]);
      // The BreadcrumbList of the page keeps the four steps.
      const lists = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
        scripts.flatMap((script) => {
          const data = JSON.parse(script.textContent ?? 'null') as { '@graph'?: unknown[] } | unknown[] | null;
          const items = Array.isArray(data) ? data : (data?.['@graph'] ?? [data]);
          return items.filter((item) => (item as { '@type'?: string })?.['@type'] === 'BreadcrumbList') as { itemListElement: unknown[] }[];
        }),
      );
      expect(lists.map((list) => list.itemListElement.length), path).toEqual([4]);
    }
  }
  // The control: a PDF tool has three steps, all of them on screen at 359 px.
  await page.setViewportSize({ width: 359, height: 740 });
  await page.goto('/split-pdf/');
  await expect(page.locator('.fo-crumbs > li')).toHaveCount(3);
  expect(await page.locator('.fo-crumbs > li').evaluateAll((items) => items.every((item) => getComputedStyle(item).display !== 'none'))).toBe(true);
});

test('the table of the presets on the parent page and on the PDF hub, in the three languages, with links that answer 200', async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const lang of LANGS) {
    for (const parent of ['split-pdf', 'pdf-to-jpg'] as const) {
      const path = routeById(parent).paths[lang] ?? '';
      expect((await page.goto(path))?.status(), path).toBe(200);
      const table = page.locator('section[data-content="specs"] #presets ~ table');
      await expect(table, path).toHaveCount(1);
      const rows = await table.locator('tbody th a').evaluateAll((anchors) => anchors.map((anchor) => [anchor.getAttribute('href'), anchor.textContent?.trim()]));
      expect(rows, path).toEqual(presetsOf(parent).map((id) => [routeById(id).paths[lang], TEXTS[lang].common.pdf[id].name]));
      for (const [href] of rows) hrefs.add(href ?? '');
    }
    // A preset page has no table of presets.
    await page.goto(routeById('split-pdf-extract-pages').paths[lang] ?? '');
    await expect(page.locator('#presets')).toHaveCount(0);
    // The hub: a table with a link to each preset after the grid, never a card of the grid (the grid is the tools).
    const hub = routeById(PDF_HUB_ID).paths[lang] ?? '';
    expect((await page.goto(hub))?.status(), hub).toBe(200);
    const links = await page.locator('section[aria-labelledby="presets"] table tbody a').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
    expect(links, hub).toEqual(PDF_PRESET_IDS.map((id) => routeById(id).paths[lang]));
    for (const id of PDF_PRESET_IDS) await expect(page.locator(`a.fo-tool[href="${routeById(id).paths[lang]}"]`), `${hub}: no card of ${id}`).toHaveCount(0);
    for (const href of links) hrefs.add(href ?? '');
  }
  expect(hrefs.size).toBe(PDF_PRESET_IDS.length * LANGS.length);
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
});
