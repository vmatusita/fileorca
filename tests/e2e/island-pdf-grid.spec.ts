import { expect, test, type Locator, type Page } from '@playwright/test';
import panel from '../../src/tools/pdf/i18n/en.ts';
import { PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// F14 (PLANO-UX-QV.md, items 1, 2 and 3; DECISOES § 618, § 619 and § 621): the cells of the page grid in the five grid
// tools. Criterion 1: the picture of a cell fits whole in its sheet and fills at least 95 % of the "contain" fit, standing,
// lying, with a /Rotate and, in Rotate, after one and three turns. Criterion 7: the magnifier is 48 px, never over the
// picture or the check, from 320 to 1280 px, with three-digit page numbers. Section B: "Small" and "Large" set the
// columns, and every picture is asked at the width its sheet shows.

const MIXED = 'gen-paginas-mistas.pdf';
const MANY = 'gen-paginas-300.pdf';
const root = (page: Page) => page.locator('#fo-tool-root');
const cells = (page: Page) => root(page).locator('.fo-pages__grid > li');
/** Clicks the label of a segmented option (the radio itself is hidden). */
const option = (page: Page, label: string) => root(page).locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const optionsOf = (id: string): Record<string, string> => (PDF_TOOL_TEXTS.en[id as 'split-pdf'].panel as unknown as { options: Record<string, string> }).options;

// F18 (decision 6): Organize PDF is a grid tool too; its targets and turns are measured in island-pdf-organize.spec.ts.
type GridTool = 'delete-pdf-pages' | 'split-pdf' | 'rotate-pdf' | 'sign-pdf' | 'reorder-pdf-pages' | 'organize-pdf';
const GRID_TOOLS: readonly GridTool[] = ['delete-pdf-pages', 'split-pdf', 'rotate-pdf', 'sign-pdf', 'reorder-pdf-pages', 'organize-pdf'];

/** Opens a grid tool with a file and brings its page grid on screen. */
async function toGrid(page: Page, id: GridTool, file = MIXED, pages = 8): Promise<void> {
  await openTool(page, `/${id}/`);
  await choosePdfs(page, [pdfFile(file)]);
  const ready = root(page).locator('.fo-ready:not(.fo-ready--reading)');
  if (id === 'rotate-pdf') {
    await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
    await root(page).locator('.fo-adjust > summary').click();
    await option(page, optionsOf(id)['pick'] ?? '');
  } else if (id === 'split-pdf') {
    await expect(ready).toBeVisible({ timeout: 30_000 });
    await option(page, optionsOf(id)['pick'] ?? '');
  } else if (id === 'sign-pdf') {
    await expect(ready).toBeVisible({ timeout: 30_000 });
    await option(page, optionsOf(id)['pickPages'] ?? '');
  }
  await expect(cells(page)).toHaveCount(pages, { timeout: 30_000 });
}

/** Waits until the picture of a cell is on screen and decoded. */
async function drawn(cell: Locator): Promise<void> {
  await cell.scrollIntoViewIfNeeded();
  await expect
    .poll(() => cell.locator('.fo-page__sheet img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 })
    .toBe(true);
}

/** The picture of a cell against its sheet: does it fit whole, and how much of the "contain" fit does it fill. */
function fitOf(cell: Locator) {
  return cell.evaluate((li) => {
    const sheet = (li.querySelector('.fo-page__sheet') as HTMLElement).getBoundingClientRect();
    const img = li.querySelector('.fo-page__sheet img') as HTMLImageElement;
    const box = img.getBoundingClientRect();
    const fits = box.left >= sheet.left - 0.5 && box.top >= sheet.top - 0.5 && box.right <= sheet.right + 0.5 && box.bottom <= sheet.bottom + 0.5;
    // The picture is the page as drawn (its /Rotate applied); a quarter turn of the person turns it once more.
    const turned = /(^|\s)(90|270)deg/.test(getComputedStyle(img).rotate);
    const ratio = turned ? img.naturalHeight / img.naturalWidth : img.naturalWidth / img.naturalHeight;
    const scale = Math.min(sheet.width / ratio, sheet.height);
    const contain = scale * ratio * scale;
    return { page: Number(li.dataset['page']) + 1, fits, filled: (box.width * box.height) / contain, sheet: [sheet.width, sheet.height], img: [box.width, box.height] };
  });
}

async function expectWhole(page: Page, label: string, only?: number[]): Promise<void> {
  const total = await cells(page).count();
  for (let i = 0; i < total; i += 1) {
    if (only && !only.includes(i)) continue;
    const cell = cells(page).nth(i);
    await drawn(cell);
    const fit = await fitOf(cell);
    expect(fit.fits, `${label}, page ${fit.page}: the picture ${fit.img.join(' × ')} fits in its sheet ${fit.sheet.join(' × ')}`).toBe(true);
    expect(fit.filled, `${label}, page ${fit.page}: the picture fills the "contain" fit`).toBeGreaterThanOrEqual(0.95);
  }
}

test.describe('criterion 1: the whole page in every cell', () => {
  for (const id of GRID_TOOLS) {
    test(`${id}: every page of the mixed file (standing, lying, /Rotate 90, 180 and 270) fits whole in its sheet`, async ({ page }) => {
      await toGrid(page, id);
      await expectWhole(page, id);
    });
  }

  test('rotate-pdf: after one and three turns of a standing page and of a page with /Rotate 90, the turned page fits whole', async ({ page }) => {
    await toGrid(page, 'rotate-pdf');
    const turn = (index: number) => cells(page).nth(index).locator('.fo-page__main').click();
    for (const index of [0, 3]) {
      await turn(index);
      await expect(cells(page).nth(index).locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '1');
      await expectWhole(page, `page ${index + 1} after one turn`, [index]);
      await turn(index);
      await turn(index);
      await expect(cells(page).nth(index).locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '3');
      await expectWhole(page, `page ${index + 1} after three turns`, [index]);
    }
  });

  test('delete-pdf-pages at 360 px: every page fits whole, and the sheets of a row stand on the line of their numbers', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await toGrid(page, 'delete-pdf-pages');
    await expectWhole(page, '360 px');
    // Pages 3 (lying) and 4 (/Rotate 90) share a row: their numbers are on one line, and each sheet ends above it.
    const rows = await cells(page).evaluateAll((items) =>
      items.map((li) => ({
        top: Math.round((li as HTMLElement).getBoundingClientRect().top),
        sheet: (li.querySelector('.fo-page__sheet') as HTMLElement).getBoundingClientRect().bottom,
        number: (li.querySelector('.fo-page__n') as HTMLElement).getBoundingClientRect().top,
      })),
    );
    const [third, fourth] = [rows[2], rows[3]];
    expect(third?.top).toBe(fourth?.top);
    expect(Math.abs((third?.number ?? 0) - (fourth?.number ?? 1))).toBeLessThanOrEqual(1);
    for (const row of rows) expect(row.sheet).toBeLessThanOrEqual(row.number + 0.5);
  });
});

/** The magnifier of a cell against the picture and the check, by box and by hit test. */
async function magnifierOf(cell: Locator) {
  return cell.evaluate((li) => {
    const rect = (selector: string) => (li.querySelector(selector) as HTMLElement).getBoundingClientRect();
    const zoom = rect('.fo-page__zoom');
    const img = rect('.fo-page__sheet');
    const check = li.querySelector('.fo-page__check') ? rect('.fo-page__check') : null;
    const cellBox = li.getBoundingClientRect();
    const overlaps = (a: DOMRect, b: DOMRect) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const hit = (box: DOMRect) => document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    const pictureHit = hit(img);
    const checkHit = check ? hit(check) : null;
    return {
      page: Number(li.dataset['page']) + 1,
      zoom: [zoom.width, zoom.height],
      overPicture: overlaps(zoom, img),
      overCheck: check ? overlaps(zoom, check) : false,
      pictureHitsPage: Boolean(pictureHit?.closest('.fo-page__main')) && !pictureHit?.closest('.fo-page__zoom'),
      checkHitsCheck: check ? Boolean(checkHit?.closest('.fo-page__check')) : true,
      inside: zoom.left >= cellBox.left - 0.5 && zoom.right <= cellBox.right + 0.5,
    };
  });
}

test.describe('criterion 7: the magnifier is 48 px and never over the picture or the check', () => {
  for (const id of ['delete-pdf-pages', 'reorder-pdf-pages'] as const) {
    test(`${id}, 300 pages: at 320, 360, 768 and 1280 px, with page numbers of one to three digits`, async ({ page }) => {
      test.setTimeout(120_000);
      await toGrid(page, id, MANY, 300);
      for (const width of [320, 360, 768, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        for (const index of [0, 9, 99, 299]) {
          const cell = cells(page).nth(index);
          await cell.scrollIntoViewIfNeeded();
          const found = await magnifierOf(cell);
          const label = `${id} at ${width} px, page ${found.page}`;
          expect(found.zoom[0], `${label}: magnifier width`).toBeGreaterThanOrEqual(47.5);
          expect(found.zoom[1], `${label}: magnifier height`).toBeGreaterThanOrEqual(47.5);
          expect(found.overPicture, `${label}: the magnifier is off the picture`).toBe(false);
          expect(found.overCheck, `${label}: the magnifier is off the check`).toBe(false);
          expect(found.pictureHitsPage, `${label}: the middle of the picture is the page`).toBe(true);
          expect(found.checkHitsCheck, `${label}: the middle of the check is the check`).toBe(true);
          expect(found.inside, `${label}: the magnifier stays in its cell`).toBe(true);
        }
        // Nothing passes the width of the page (the arrows of Reorder and the magnifier share the cell).
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    });
  }

  test('the magnifier has the name of its page, and only the active cell has its magnifier in the Tab order', async ({ page }) => {
    await toGrid(page, 'delete-pdf-pages');
    const zooms = root(page).locator('.fo-page__zoom');
    await expect(zooms).toHaveCount(8);
    await expect(zooms.nth(2)).toHaveAccessibleName('View page 3 enlarged');
    await expect(root(page).locator('.fo-page__zoom[tabindex="0"]')).toHaveCount(1);
    await expect(cells(page).nth(0).locator('.fo-page__zoom')).toHaveAttribute('tabindex', '0');
    // The action takes the focus a frame after the grid shows (DECISOES § 240): then the arrows move the active cell.
    await expect(root(page).locator('.fo-ready .fo-btn--brand')).toBeFocused();
    await cells(page).nth(0).locator('.fo-page__main').focus();
    await page.keyboard.press('ArrowRight');
    await expect(cells(page).nth(1).locator('.fo-page__main')).toBeFocused();
    await expect(cells(page).nth(1).locator('.fo-page__zoom')).toHaveAttribute('tabindex', '0');
    await expect(root(page).locator('.fo-page__zoom[tabindex="0"]')).toHaveCount(1);
  });
});

/** The columns of the grid: the cells on the first row. */
const columnsOf = (page: Page) =>
  cells(page).evaluateAll((items) => {
    const top = (items[0] as HTMLElement).getBoundingClientRect().top;
    return items.filter((li) => Math.abs((li as HTMLElement).getBoundingClientRect().top - top) < 1).length;
  });

/** The width each sheet asks of the cache, as the page works it out (section B). */
const askedOf = (cell: Locator) =>
  cell.evaluate((li) => {
    const sheet = (li.querySelector('.fo-page__sheet') as HTMLElement).getBoundingClientRect().width;
    const img = li.querySelector('.fo-page__sheet img') as HTMLImageElement | null;
    return { natural: img?.naturalWidth ?? 0, asked: Math.max(60, Math.ceil(Math.min(720, sheet * devicePixelRatio) / 60) * 60) };
  });

test.describe('section B: Small and Large', () => {
  test('Small has two columns at 320 and 360 px and five at 1280 px; Large has one at 360 px and three at 1280 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await toGrid(page, 'delete-pdf-pages');
    const sizes = root(page).getByRole('group', { name: panel.grid.sizeLegend, exact: true });
    await expect(sizes.getByRole('radio', { name: panel.grid.sizeSmall })).toBeChecked();
    const expected: [number, 'Small' | 'Large', number][] = [
      [320, 'Small', 2],
      [360, 'Small', 2],
      [1280, 'Small', 5],
      [360, 'Large', 1],
      [1280, 'Large', 3],
    ];
    for (const [width, size, columns] of expected) {
      await page.setViewportSize({ width, height: 800 });
      await option(page, size === 'Small' ? panel.grid.sizeSmall : panel.grid.sizeLarge);
      await expect.poll(() => columnsOf(page), { message: `${size} at ${width} px` }).toBe(columns);
    }
    // The choice is not stored anywhere.
    expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key !== 'fo-consent'))).toEqual([]);
  });

  test('every picture is as wide as its sheet shows, and Large asks wider ones and lets the small ones go', async ({ page }) => {
    await toGrid(page, 'delete-pdf-pages');
    const first = cells(page).first();
    await drawn(first);
    const small = await askedOf(first);
    expect(Math.abs(small.natural - small.asked)).toBeLessThanOrEqual(2);
    await option(page, panel.grid.sizeLarge);
    await expect.poll(async () => (await askedOf(first)).natural, { timeout: 30_000 }).toBeGreaterThan(small.natural);
    const large = await askedOf(first);
    expect(Math.abs(large.natural - large.asked)).toBeLessThanOrEqual(2);
    // Every picture on the grid still opens: the small ones were let go, never shown after.
    const broken = await root(page)
      .locator('.fo-pages__grid img')
      .evaluateAll((images) => Promise.all((images as HTMLImageElement[]).map((img) => fetch(img.src).then((r) => (r.ok ? null : img.src)).catch(() => img.src))));
    expect(broken.filter(Boolean)).toEqual([]);
  });
});

test.describe('section B at a pixel ratio of 2', () => {
  test.use({ deviceScaleFactor: 2, viewport: { width: 360, height: 740 } });

  test('the picture of a cell is drawn at its width times the pixel ratio, rounded up to 60 px', async ({ page }) => {
    await toGrid(page, 'split-pdf');
    const first = cells(page).first();
    await drawn(first);
    const { natural, asked } = await askedOf(first);
    expect(Math.abs(natural - asked)).toBeLessThanOrEqual(2);
    expect(natural).toBeGreaterThanOrEqual(await first.locator('.fo-page__sheet').evaluate((sheet) => sheet.getBoundingClientRect().width * 2 - 1));
  });
});
