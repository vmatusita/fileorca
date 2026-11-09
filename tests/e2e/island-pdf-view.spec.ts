import { expect, test, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import panel from '../../src/tools/pdf/i18n/en.ts';
import { PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// F14 (PLANO-UX-QV.md, section A; DECISOES § 624): the page view the magnifier of each cell opens, in the place of the
// grid of the five grid tools. Criterion 2: it opens from every tool; its picture is drawn at its width times the pixel
// ratio; a Letter page standing is 300 px wide or more in "Fit" at 360 × 740 and 600 px or more in "Enlarge"; at
// 1280 × 800 the page and the two bars fit the window, the page 520 px high or more; ← → Home End change the page, Esc goes
// back with the focus on the magnifier; a sideways swipe of 48 px changes it in "Fit". Criterion 3: the action of the view
// changes the grid and the count, with one sentence; in Rotate the large picture shows the turns. Criterion 5: from the
// press of the magnifier to the large picture, nothing moves without a gesture.

const MIXED = 'gen-paginas-mistas.pdf';
const root = (page: Page) => page.locator('#fo-tool-root');
const cells = (page: Page) => root(page).locator('.fo-pages__grid > li');
const view = (page: Page) => root(page).locator('.fo-pview');
const heading = (page: Page) => view(page).locator('.fo-pview__title');
const big = (page: Page) => view(page).locator('.fo-pview__img');
const option = (page: Page, label: string) => root(page).locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const optionsOf = (id: string): Record<string, string> => (PDF_TOOL_TEXTS.en[id as 'split-pdf'].panel as unknown as { options: Record<string, string> }).options;
const v = panel.view;

type GridTool = 'delete-pdf-pages' | 'split-pdf' | 'rotate-pdf' | 'sign-pdf' | 'reorder-pdf-pages';
const GRID_TOOLS: readonly GridTool[] = ['delete-pdf-pages', 'split-pdf', 'rotate-pdf', 'sign-pdf', 'reorder-pdf-pages'];
/** The action of each tool in the view: its name and whether it is a toggle. */
const ACTIONS: Record<GridTool, { name: string; pressed: boolean } | null> = {
  'delete-pdf-pages': { name: v.remove, pressed: true },
  'split-pdf': { name: v.mark, pressed: true },
  'sign-pdf': { name: v.sign, pressed: true },
  'rotate-pdf': { name: v.turn, pressed: false },
  'reorder-pdf-pages': null,
};

/** Opens a grid tool with a file and brings its page grid on screen (Rotate: page by page, under "Adjust" after the result). */
async function toGrid(page: Page, id: GridTool): Promise<void> {
  await openTool(page, `/${id}/`);
  await choosePdfs(page, [pdfFile(MIXED)]);
  const ready = root(page).locator('.fo-ready:not(.fo-ready--reading)');
  if (id === 'rotate-pdf') {
    await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
    await root(page).locator('.fo-adjust > summary').click();
    await option(page, optionsOf(id)['pick'] ?? '');
  } else {
    await expect(ready).toBeVisible({ timeout: 30_000 });
    // The action takes the focus a frame after the grid shows (DECISOES § 240): the test waits for it before the grid.
    if (id !== 'split-pdf' && id !== 'sign-pdf') await expect(ready.locator('.fo-btn--brand')).toBeFocused();
    if (id === 'split-pdf') await option(page, optionsOf(id)['pick'] ?? '');
    if (id === 'sign-pdf') await option(page, optionsOf(id)['pickPages'] ?? '');
  }
  await expect(cells(page)).toHaveCount(8, { timeout: 30_000 });
}

/** The magnifier of a cell opens the view, and the focus is on its heading. */
async function openView(page: Page, index: number): Promise<void> {
  await cells(page).nth(index).locator('.fo-page__zoom').click();
  await expect(heading(page)).toBeFocused();
}

/** Waits until the large picture of the page on view is on screen and decoded. */
async function bigDrawn(page: Page): Promise<void> {
  await expect
    .poll(() => big(page).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 })
    .toBe(true);
}

/** The large picture against the width it shows. */
const sizeOf = (page: Page) => big(page).evaluate((img: HTMLImageElement) => ({ natural: img.naturalWidth, css: img.getBoundingClientRect().width, dpr: devicePixelRatio }));

/** Records every sentence the status region of the panel takes, from now on (as pdf-tool.spec.ts does). */
async function recordStatus(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('#fo-tool-root .fo-pdf-island > p.fo-sr[role="status"]');
    if (!region) throw new Error('no status region');
    const log: string[] = [];
    (window as unknown as { __status: string[] }).__status = log;
    new MutationObserver(() => {
      const text = (region.textContent ?? '').trim();
      if (text) log.push(text);
    }).observe(region, { childList: true, characterData: true, subtree: true });
  });
}

/** What the status region said since recordStatus, once the last sentence has been set; the log starts again. */
async function said(page: Page, last: string): Promise<string[]> {
  // The region of the panel (Sign has one of its own for the box, deeper in the band).
  await expect(root(page).locator('.fo-pdf-island > p.fo-sr[role="status"]')).toHaveText(last);
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const log = (window as unknown as { __status: string[] }).__status;
    return log.splice(0, log.length);
  });
}

/** A swipe with the pointer on the page of the view, from the middle of what is seen of it (the frame). */
async function swipe(page: Page, dx: number, dy: number): Promise<void> {
  const box = await view(page).locator('.fo-pview__frame').boundingBox();
  if (!box) throw new Error('no frame');
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(box.height / 2, 200);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
}

test.describe('criterion 2: the view opens from the magnifier of each grid tool', () => {
  for (const id of GRID_TOOLS) {
    test(`${id}: page 2 opens large in the place of the grid, drawn at its width, and Esc gives the focus back to its magnifier`, async ({ page }) => {
      await toGrid(page, id);
      await openView(page, 1);
      await expect(heading(page)).toHaveText(id === 'reorder-pdf-pages' ? fmt(v.titleOrder, { n: 2, p: 2, total: 8 }) : fmt(v.title, { n: 2, total: 8 }));
      // The view takes the place of the whole grid: the size choice, the bar, the cells and the help.
      await expect(root(page).locator('.fo-pages__grid, .fo-pages .fo-seg, .fo-pages .fo-pages__bar, .fo-pages .fo-field__help')).toHaveCount(0);
      await expect(view(page).locator('.fo-pview__frame')).toHaveAccessibleName(fmt(v.frame, { n: 2 }));
      await bigDrawn(page);
      const size = await sizeOf(page);
      expect(size.natural, 'the picture is drawn at its width times the pixel ratio').toBeGreaterThanOrEqual(size.css * size.dpr - 0.5);
      const action = ACTIONS[id];
      const bar = view(page).locator('.fo-pview__bar');
      if (action) {
        const button = bar.getByRole('button', { name: action.name, exact: true });
        await expect(button).toBeVisible();
        if (action.pressed) await expect(button).toHaveAttribute('aria-pressed', 'false');
        else await expect(button).not.toHaveAttribute('aria-pressed');
      }
      await expect(bar.getByRole('button')).toHaveCount(action ? 3 : 2);
      await page.keyboard.press('Escape');
      await expect(view(page)).toHaveCount(0);
      await expect(cells(page)).toHaveCount(8);
      const zoom = cells(page).nth(1).locator('.fo-page__zoom');
      await expect(zoom).toBeFocused();
      await expect(zoom).toHaveAttribute('tabindex', '0');
      await expect(zoom).toBeInViewport();
    });
  }

  test('reorder-pdf-pages: Previous and Next follow the order of the grid, and the heading says the position', async ({ page }) => {
    await toGrid(page, 'reorder-pdf-pages');
    await root(page).getByRole('button', { name: fmt(panel.grid.moveLater, { n: 1 }) }).click();
    await expect(cells(page).first()).toHaveAttribute('data-page', '1');
    await openView(page, 0);
    await expect(heading(page)).toHaveText(fmt(v.titleOrder, { n: 2, p: 1, total: 8 }));
    await page.keyboard.press('ArrowRight');
    await expect(heading(page)).toHaveText(fmt(v.titleOrder, { n: 1, p: 2, total: 8 }));
    await page.keyboard.press('ArrowRight');
    await expect(heading(page)).toHaveText(fmt(v.titleOrder, { n: 3, p: 3, total: 8 }));
  });

  test('← → Home End change the page with one sentence each, the ends stay focusable, and Esc brings the cell back on screen', async ({ page }) => {
    await toGrid(page, 'delete-pdf-pages');
    await cells(page).nth(2).locator('.fo-page__main').click();
    await openView(page, 0);
    await recordStatus(page);
    const title = (n: number) => fmt(v.title, { n, total: 8 });
    await page.keyboard.press('ArrowRight');
    await expect(heading(page)).toHaveText(title(2));
    expect(await said(page, title(2))).toEqual([title(2)]);
    // A page that comes out says so after its heading (the words of the grid).
    await page.keyboard.press('ArrowRight');
    expect(await said(page, title(3) + panel.grid.leaving)).toEqual([title(3) + panel.grid.leaving]);
    await page.keyboard.press('End');
    await expect(heading(page)).toHaveText(title(8));
    const next = view(page).locator('.fo-pview__next');
    const previous = view(page).locator('.fo-pview__prev');
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(previous).not.toHaveAttribute('aria-disabled');
    // At the end, Next does nothing and keeps the focus (never the body).
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(heading(page)).toHaveText(title(8));
    await expect(next).toBeFocused();
    await page.keyboard.press('Home');
    await expect(heading(page)).toHaveText(title(1));
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    await previous.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowLeft');
    await expect(heading(page)).toHaveText(title(1));
    await expect(previous).toBeFocused();
    // The buttons work from the keyboard too, and the arrows from any control of the view.
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(heading(page)).toHaveText(title(2));
    await page.keyboard.press('ArrowRight');
    await expect(heading(page)).toHaveText(title(3));
    await page.keyboard.press('Escape');
    const zoom = cells(page).nth(2).locator('.fo-page__zoom');
    await expect(zoom).toBeFocused();
    await expect(cells(page).nth(2)).toBeInViewport();
    // Nothing went to the URL or to the history.
    expect(new URL(page.url()).pathname).toBe('/delete-pdf-pages/');
    expect(new URL(page.url()).search + new URL(page.url()).hash).toBe('');
  });

  test('a sideways swipe of 48 px or more changes the page in "Fit"; a short, steep or enlarged one does not', async ({ page }) => {
    await toGrid(page, 'split-pdf');
    await openView(page, 0);
    const title = (n: number) => fmt(v.title, { n, total: 8 });
    await swipe(page, -50, 8);
    await expect(heading(page)).toHaveText(title(2));
    await swipe(page, 60, -10);
    await expect(heading(page)).toHaveText(title(1));
    await swipe(page, -44, 0);
    await swipe(page, -60, 45);
    await page.waitForTimeout(200);
    await expect(heading(page)).toHaveText(title(1));
    await view(page).getByRole('button', { name: v.enlarge, exact: true }).click();
    await expect(view(page).locator('.fo-pview__frame')).toHaveAttribute('data-zoom', '');
    await swipe(page, -80, 0);
    await page.waitForTimeout(200);
    await expect(heading(page)).toHaveText(title(1));
    await expect(view(page).getByRole('button', { name: v.fit, exact: true })).toBeVisible();
  });
});

test.describe('criterion 2 at 360 × 740 with a pixel ratio of 2', () => {
  test.use({ deviceScaleFactor: 2, viewport: { width: 360, height: 740 } });

  test('a Letter page standing is 300 px wide or more in "Fit" and 600 px or more in "Enlarge", drawn at twice that', async ({ page }) => {
    await toGrid(page, 'delete-pdf-pages');
    await openView(page, 0);
    await bigDrawn(page);
    const fit = await sizeOf(page);
    expect(fit.css).toBeGreaterThanOrEqual(300);
    expect(fit.natural).toBeGreaterThanOrEqual(fit.css * 2 - 0.5);
    // The two bars: the action takes the first row under 480 px, Previous and Next the second, side by side.
    const [act, previous, next] = await Promise.all(['.fo-pview__act', '.fo-pview__prev', '.fo-pview__next'].map((selector) => view(page).locator(selector).boundingBox()));
    expect(Math.abs((previous?.y ?? 0) - (next?.y ?? 1))).toBeLessThanOrEqual(1);
    expect(previous?.y ?? 0).toBeGreaterThan((act?.y ?? 0) + (act?.height ?? 0) - 1);
    expect(act?.width ?? 0).toBeGreaterThan((previous?.width ?? 0) + (next?.width ?? 0));
    await view(page).getByRole('button', { name: v.enlarge, exact: true }).click();
    await expect.poll(async () => (await sizeOf(page)).natural, { timeout: 30_000 }).toBeGreaterThan(fit.natural);
    await bigDrawn(page);
    const enlarged = await sizeOf(page);
    expect(enlarged.css).toBeGreaterThanOrEqual(600);
    expect(enlarged.natural).toBeGreaterThanOrEqual(enlarged.css * 2 - 0.5);
    // Enlarged, the frame scrolls both ways inside the column, and the keyboard reaches it (it has a name and a tab stop).
    const frame = view(page).locator('.fo-pview__frame');
    const scroll = await frame.evaluate((element) => ({ wide: element.scrollWidth > element.clientWidth, tall: element.scrollHeight > element.clientHeight, inside: element.getBoundingClientRect().right <= innerWidth }));
    expect(scroll).toEqual({ wide: true, tall: true, inside: true });
    await expect(frame).toHaveAttribute('tabindex', '0');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test.describe('criterion 2 at 1280 × 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('in "Fit" the page and the two bars are in the window, the page 520 px high or more', async ({ page }) => {
    await toGrid(page, 'sign-pdf');
    await openView(page, 0);
    await bigDrawn(page);
    const boxes = await view(page).evaluate((element) => {
      const of = (selector: string) => {
        const rect = (element.querySelector(selector) as HTMLElement).getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height };
      };
      return { top: of('.fo-pview__top'), frame: of('.fo-pview__frame'), bar: of('.fo-pview__bar'), height: innerHeight };
    });
    for (const part of [boxes.top, boxes.frame, boxes.bar]) {
      expect(part.top).toBeGreaterThanOrEqual(0);
      expect(part.bottom).toBeLessThanOrEqual(boxes.height);
    }
    expect(boxes.frame.height).toBeGreaterThanOrEqual(520);
    const size = await sizeOf(page);
    expect(size.natural).toBeGreaterThanOrEqual(size.css - 0.5);
  });
});

test.describe('criterion 3: the action of the view goes the way of the cell', () => {
  for (const id of ['delete-pdf-pages', 'split-pdf', 'sign-pdf'] as const) {
    test(`${id}: picking page 3 in the view picks it on the grid and in the count, with one sentence`, async ({ page }) => {
      await toGrid(page, id);
      const count = root(page).locator('.fo-pages__count');
      await openView(page, 2);
      await recordStatus(page);
      const action = view(page).getByRole('button', { name: ACTIONS[id]?.name ?? '', exact: true });
      await action.click();
      await expect(action).toHaveAttribute('aria-pressed', 'true');
      const sentences = await said(page, fmt(panel.grid.selectedCount, { count: 1, total: 8 }));
      expect(sentences).toHaveLength(1);
      if (id === 'delete-pdf-pages') await expect(root(page).locator('.fo-ready .fo-btn--brand')).toHaveText(optionsOf(id)['actionOne'] ?? '');
      await view(page).getByRole('button', { name: v.back, exact: true }).click();
      await expect(cells(page).nth(2).locator('.fo-page__zoom')).toBeFocused();
      await expect(cells(page).nth(2)).toHaveAttribute('data-selected', 'true');
      await expect(root(page).locator('.fo-page[data-selected="true"]')).toHaveCount(1);
      // The sentence is the count the grid shows.
      await expect(count).toHaveText(sentences[0] ?? '');
      // Again: the page goes back, on the grid too.
      await openView(page, 2);
      await view(page).getByRole('button', { name: ACTIONS[id]?.name ?? '', exact: true }).click();
      await expect(view(page).getByRole('button', { name: ACTIONS[id]?.name ?? '', exact: true })).toHaveAttribute('aria-pressed', 'false');
      await view(page).getByRole('button', { name: v.back, exact: true }).click();
      await expect(root(page).locator('.fo-page[data-selected="true"]')).toHaveCount(0);
    });
  }

  test('rotate-pdf: two turns in the view turn the page on the grid, and the large picture shows the half turn', async ({ page }) => {
    await toGrid(page, 'rotate-pdf');
    await openView(page, 0);
    await bigDrawn(page);
    await recordStatus(page);
    const turn = view(page).getByRole('button', { name: v.turn, exact: true });
    const turned = (degrees: number) => fmt(panel.grid.turned, { n: 1, degrees });
    await turn.click();
    await expect(big(page)).toHaveAttribute('data-turn', '1');
    await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
    // The view says the turn once. The "Done!" of the run the turn starts is the panel's (d-8, front M, DECISOES § 629).
    const done = (await root(page).locator('#fo-says').textContent()) ?? '';
    await page.waitForTimeout(300);
    const first = await page.evaluate(() => (window as unknown as { __status: string[] }).__status.splice(0));
    expect(first.filter((sentence) => sentence !== done.trim())).toEqual([turned(90)]);
    await turn.click();
    await expect(big(page)).toHaveAttribute('data-turn', '2');
    expect(await big(page).evaluate((img) => getComputedStyle(img).rotate)).toBe('180deg');
    // A half turn keeps the shape of the frame; the picture fills it whole.
    const fit = await view(page).locator('.fo-pview__sheet').evaluate((sheet) => {
      const outer = sheet.getBoundingClientRect();
      const img = (sheet.querySelector('.fo-pview__img') as HTMLElement).getBoundingClientRect();
      return Math.abs(outer.width - img.width) <= 1 && Math.abs(outer.height - img.height) <= 1;
    });
    expect(fit).toBe(true);
    await view(page).getByRole('button', { name: v.back, exact: true }).click();
    await expect(cells(page).first().locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '2');
  });
});

test.describe('the view goes with the file', () => {
  test('Start over and another file close the view, and the focus goes where the panel takes it, never to the body', async ({ page }) => {
    await toGrid(page, 'delete-pdf-pages');
    await openView(page, 1);
    await root(page).locator('.fo-ready').getByRole('button', { name: panel.result.startOver, exact: true }).click();
    await expect(root(page).locator('.fo-drop')).toBeVisible();
    await expect(view(page)).toHaveCount(0);
    await expect(root(page).locator('.fo-drop .fo-btn--brand')).toBeFocused();
    await choosePdfs(page, [pdfFile(MIXED)]);
    await expect(root(page).locator('.fo-ready .fo-btn--brand')).toBeFocused({ timeout: 30_000 });
    await expect(cells(page)).toHaveCount(8);
    await openView(page, 3);
    await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
    await expect(cells(page)).toHaveCount(12, { timeout: 30_000 });
    await expect(view(page)).toHaveCount(0);
    await expect(root(page).locator('.fo-ready .fo-btn--brand')).toBeFocused();
  });
});

test.describe('criterion 5: nothing moves from the magnifier to the large picture', () => {
  test('with the CPU 20 times slower, the large picture comes after the 500 ms of the press, and no shift without input is seen', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'the layout-shift entries are the Chromium ones');
    // The pages are drawn on the page, the path of a worker without OffscreenCanvas (the WebKit of the Windows), so the
    // slower CPU slows the drawing too: in the worker it is not throttled, and the picture came in 235 ms; on the page with
    // the CPU 6 times slower, in 226 to 297 ms. 20 times brings it past the 500 ms the press excuses.
    await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      await route.fulfill({ response, body: body.includes('PDFDocument') ? `delete globalThis.OffscreenCanvas;\n${body}` : body });
    });
    await page.addInitScript(() => {
      const w = window as unknown as { __shifts: { value: number; nodes: string[] }[]; __measure: boolean; __bigAt: number; __pressAt: number };
      w.__shifts = [];
      w.__measure = false;
      w.__bigAt = 0;
      w.__pressAt = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
          if (!w.__measure || entry.hadRecentInput) continue;
          w.__shifts.push({ value: entry.value, nodes: (entry.sources ?? []).map((source) => (source.node as Element | undefined)?.className?.toString() ?? '') });
        }
      }).observe({ type: 'layout-shift', buffered: true });
      // When the large picture of the view loads, from the page itself (no hook in the site).
      document.addEventListener('load', (event) => {
        const target = event.target as Element;
        if (target instanceof HTMLImageElement && target.classList.contains('fo-pview__img') && !w.__bigAt) w.__bigAt = performance.now();
      }, true);
      document.addEventListener('pointerdown', (event) => {
        if ((event.target as Element).closest?.('.fo-page__zoom')) w.__pressAt = performance.now();
      }, true);
    });
    // Four pages of photos: a large picture of a photo takes longer to draw than one of text.
    await openTool(page, '/delete-pdf-pages/');
    await choosePdfs(page, [pdfFile('gen-fotos.pdf')]);
    await expect(root(page).locator('.fo-ready .fo-btn--brand')).toBeFocused({ timeout: 30_000 });
    await expect(cells(page)).toHaveCount(4);
    await expect.poll(() => cells(page).nth(1).locator('.fo-page__sheet img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 }).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 20 });
    await page.evaluate(() => ((window as unknown as { __measure: boolean }).__measure = true));
    await cells(page).nth(1).locator('.fo-page__zoom').click();
    await expect(heading(page)).toBeFocused();
    await bigDrawn(page);
    await page.waitForTimeout(600);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const seen = await page.evaluate(() => {
      const w = window as unknown as { __shifts: { value: number; nodes: string[] }[]; __bigAt: number; __pressAt: number };
      return { shifts: w.__shifts, after: w.__bigAt - w.__pressAt };
    });
    console.log(`[criterion 5] the large picture came ${Math.round(seen.after)} ms after the press; shifts without input: ${seen.shifts.length}`);
    expect(seen.after, 'the large picture came after the 500 ms the press excuses').toBeGreaterThan(500);
    expect(seen.shifts).toEqual([]);
  });
});
