import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import en from '../../src/tools/pdf/i18n/en.ts';
import es from '../../src/tools/pdf/i18n/es.ts';
import pt from '../../src/tools/pdf/i18n/pt.ts';
import { PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { choosePdfs, openTool, pdfFile, pdfOracle, soundPdf, takePdfDownload } from './lib/pdf-tools.ts';

// F18 (decision 6 of the prompt; DECISOES § 727): the grid of Organize PDF, in the mold of the F14 grid specs.
//  - the marking of the select mode (a press, Shift+click by place in the grid's order, Pick all, Pick none, Invert, the
//    typed range) and its count, "{count} picked · the new PDF keeps {left} pages", with the forms of one, in en, pt, es;
//  - the bar over the grid: Rotate right, Rotate left and Remove (Put back when every picked page comes out), aria-disabled
//    and still in the Tab order with no page picked; the turn on the sheet; the page that comes out stays, with Delete's
//    look, until it is put back; the error when every page comes out;
//  - the order of the order mode: the arrows of the cell by touch and by keyboard, the focus following the page, and the
//    mouse; Space and Enter pick, never pick up (no key does two things);
//  - the page view: the heading with the position, Previous and Next in the grid's order, "Turn 90°" and "Take this page
//    out" going the way of the bar, with one sentence;
//  - the result: one PDF, read back in Node; the 48 px targets from 320 to 1280 px in Small and Large; a press on the
//    300-page grid draws only the cells that changed.

const MIXED = 'gen-paginas-mistas.pdf';
const MANY = 'gen-paginas-300.pdf';
const PAGES = 8;
const TEXTS = { en, pt, es } as const;
type Lang = keyof typeof TEXTS;
const PATH: Record<Lang, string> = { en: '/organize-pdf/', pt: '/pt/gerenciar-paginas-pdf/', es: '/es/organizar-pdf/' };
const OPTIONS = (lang: Lang) => (PDF_TOOL_TEXTS[lang]['organize-pdf'].panel as unknown as { options: Record<string, string> }).options;
const grid = en.grid;
const v = en.view;

const root = (page: Page) => page.locator('#fo-tool-root');
const cells = (page: Page) => root(page).locator('.fo-pages__grid > li');
const main = (page: Page, position: number) => cells(page).nth(position).locator('.fo-page__main');
const count = (page: Page) => root(page).locator('.fo-pages__count');
const button = (page: Page, name: string) => root(page).getByRole('button', { name, exact: true });
const acts = (page: Page) => root(page).locator('.fo-pages__acts');
const act = (page: Page, which: 'right' | 'left' | 'out') => acts(page).locator(`.fo-pages__act--${which}`);
const view = (page: Page) => root(page).locator('.fo-pview');
const heading = (page: Page) => view(page).locator('.fo-pview__title');
const action = (page: Page) => root(page).locator('.fo-ready .fo-btn--brand');

/** The pages (1-based) in the grid's order. */
const order = (page: Page) => cells(page).evaluateAll((items) => items.map((li) => Number(li.getAttribute('data-page')) + 1));
/** The pages picked, by the cells' state, in the grid's order. */
const pickedPages = (page: Page) => cells(page).evaluateAll((items) => items.filter((li) => li.getAttribute('data-selected') === 'true').map((li) => Number(li.getAttribute('data-page')) + 1));
/** The cell of a page of the file (1-based), wherever it is. */
const cellOf = (page: Page, n: number) => root(page).locator(`.fo-pages__grid > li[data-page="${n - 1}"]`);
const nameOf = (page: Page, n: number) => cellOf(page, n).locator('.fo-page__main').getAttribute('aria-label');

/** "{count} picked · the new PDF keeps {left} pages", written here from the words (the forms of one included). */
function counted(lang: Lang, picked: number, left: number): string {
  const words = TEXTS[lang].grid;
  return `${picked === 1 ? words.markedOne : fmt(words.markedCount, { count: picked })} · ${left === 1 ? words.keptOne : fmt(words.keptCount, { left })}`;
}
/** Delete's sentence of what comes out, which Remove and Put back say. */
function leaving(lang: Lang, out: number, total = PAGES): string {
  const words = TEXTS[lang].grid;
  const left = total - out;
  return `${out === 1 ? fmt(words.leavingOne, { total }) : fmt(words.leavingCount, { count: out, total })} · ${left === 1 ? words.keptOne : fmt(words.keptCount, { left })}`;
}

/** Opens Organize PDF with a file and waits for the grid and for the focus on the action (DECISOES § 240). */
async function toGrid(page: Page, lang: Lang = 'en', file = MIXED, pages = PAGES): Promise<void> {
  await openTool(page, PATH[lang]);
  await choosePdfs(page, [pdfFile(file)]);
  await expect(root(page).locator('.fo-ready:not(.fo-ready--reading)')).toBeVisible({ timeout: 30_000 });
  await expect(cells(page)).toHaveCount(pages, { timeout: 30_000 });
  await expect(action(page)).toBeFocused();
}

/** From now on, every sentence the panel's region shows (the region empties itself 50 ms before each one). */
async function listen(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('#fo-tool-root .fo-pdf-island > p.fo-sr[role="status"]');
    if (!region) throw new Error('no status region');
    const log: string[] = [];
    (window as unknown as { __said: string[] }).__said = log;
    new MutationObserver(() => {
      const text = (region.textContent ?? '').trim();
      if (text) log.push(text);
    }).observe(region, { childList: true, characterData: true, subtree: true });
  });
}
const hush = (page: Page) => page.evaluate(() => ((window as unknown as { __said: string[] }).__said.length = 0));
/** What the region said since the last `hush`, once `last` is on it, with a beat for a second sentence to show. */
async function said(page: Page, last: string): Promise<string[]> {
  await expect(root(page).locator('.fo-pdf-island > p.fo-sr[role="status"]')).toHaveText(last);
  await page.waitForTimeout(250);
  const log = await page.evaluate(() => (window as unknown as { __said: string[] }).__said.slice());
  await hush(page);
  return log;
}
/** What the region said since the last `hush`, after a beat, for a gesture that says nothing. */
async function silence(page: Page): Promise<string[]> {
  await page.waitForTimeout(300);
  return page.evaluate(() => (window as unknown as { __said: string[] }).__said.slice());
}

/** Waits until the picture of a cell is on screen and decoded. */
async function drawn(cell: Locator): Promise<void> {
  await cell.scrollIntoViewIfNeeded();
  await expect
    .poll(() => cell.locator('.fo-page__sheet img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 })
    .toBe(true);
}

/** How a cell looks: its sheet's ratio, the turn of its picture and the opacity it is drawn with, the trash, the check. */
function lookOf(cell: Locator) {
  return cell.evaluate((li) => {
    const seen = (element: Element | null) => {
      let value = 1;
      for (let node = element; node && node !== li.parentElement; node = node.parentElement) value *= Number(getComputedStyle(node).opacity);
      return value;
    };
    const sheet = li.querySelector('.fo-page__sheet') as HTMLElement;
    const img = li.querySelector('.fo-page__sheet img');
    const badge = li.querySelector('.fo-page__badge--out');
    const check = li.querySelector('.fo-page__check svg');
    return {
      ratio: Number(getComputedStyle(sheet).getPropertyValue('--sheet-ratio')),
      turn: img?.getAttribute('data-turn') ?? null,
      picture: img ? seen(img) : null,
      trash: badge ? getComputedStyle(badge).display !== 'none' && seen(badge) === 1 : false,
      check: check ? getComputedStyle(check).visibility === 'visible' : false,
      leaving: li.getAttribute('data-leaving') === 'true',
    };
  });
}

/** The picture of a cell against its sheet: does it fit whole, and how much of the "contain" fit does it fill (the F14 rule). */
function fitOf(cell: Locator) {
  return cell.evaluate((li) => {
    const sheet = (li.querySelector('.fo-page__sheet') as HTMLElement).getBoundingClientRect();
    const img = li.querySelector('.fo-page__sheet img') as HTMLImageElement;
    const box = img.getBoundingClientRect();
    const fits = box.left >= sheet.left - 0.5 && box.top >= sheet.top - 0.5 && box.right <= sheet.right + 0.5 && box.bottom <= sheet.bottom + 0.5;
    const turned = /(^|\s)(90|270)deg/.test(getComputedStyle(img).rotate);
    const ratio = turned ? img.naturalHeight / img.naturalWidth : img.naturalWidth / img.naturalHeight;
    const scale = Math.min(sheet.width / ratio, sheet.height);
    return { fits, filled: (box.width * box.height) / (scale * ratio * scale) };
  });
}

const page2 = { width: 595.28, height: 841.89 };

test.describe('the marking and the count', () => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    test(`${lang}: "{count} picked · the new PDF keeps {left} pages" with the forms of one, and the names of the pages`, async ({ page }) => {
      const words = TEXTS[lang].grid;
      await toGrid(page, lang);
      await expect(count(page)).toHaveText(counted(lang, 0, PAGES));
      await main(page, 1).click();
      await expect(count(page)).toHaveText(counted(lang, 1, PAGES));
      expect(await nameOf(page, 2)).toBe(`${fmt(words.page, { n: 2, total: PAGES })}${words.selected}`);
      // The bar takes it out: the count keeps the pick and says the page that goes.
      await act(page, 'out').click();
      await expect(count(page)).toHaveText(counted(lang, 1, PAGES - 1));
      expect(await nameOf(page, 2)).toBe(`${fmt(words.page, { n: 2, total: PAGES })}${words.selected}${words.leaving}`);
      await expect(act(page, 'out')).toHaveText(words.putBack);
      // A typed range picks pages 3 to 8; out with them, the new PDF keeps one page.
      await root(page).locator('#fo-organize-pick').fill('3-8');
      await button(page, words.rangeApply).click();
      await expect(count(page)).toHaveText(counted(lang, 6, PAGES - 1));
      await expect(act(page, 'out')).toHaveText(words.takeOut);
      await act(page, 'out').click();
      await expect(count(page)).toHaveText(counted(lang, 6, 1));
      await button(page, words.selectNone).click();
      await expect(count(page)).toHaveText(counted(lang, 0, 1));
      // A page that comes out and is not picked: its name ends with the word, without the pick.
      expect(await nameOf(page, 5)).toBe(`${fmt(words.page, { n: 5, total: PAGES })}${fmt(words.rotated, { degrees: 270 })}${words.leaving}`);
      expect(await nameOf(page, 1)).toBe(fmt(words.page, { n: 1, total: PAGES }));
      // The bar's words.
      await expect(acts(page).locator('.fo-pages__act')).toHaveText([words.turnRight, words.turnLeft, words.takeOut]);
      await expect(acts(page).locator('.fo-field__help')).toHaveText(words.actsHelp);
    });
  }

  test('Pick all, Pick none, Invert and the typed range say the count once each; a plain press says nothing', async ({ page }) => {
    await toGrid(page);
    await listen(page);
    await button(page, grid.selectAll).click();
    expect(await said(page, counted('en', 8, 8))).toEqual([counted('en', 8, 8)]);
    await button(page, grid.selectNone).click();
    expect(await said(page, counted('en', 0, 8))).toEqual([counted('en', 0, 8)]);
    await root(page).locator('#fo-organize-pick').fill('2-8');
    await page.keyboard.press('Enter');
    expect(await said(page, counted('en', 7, 8))).toEqual([counted('en', 7, 8)]);
    await button(page, grid.invert).click();
    expect(await said(page, counted('en', 1, 8))).toEqual([counted('en', 1, 8)]);
    expect(await pickedPages(page)).toEqual([1]);
    await main(page, 4).click();
    expect(await silence(page)).toEqual([]);
    await expect(root(page).locator('.fo-pages__bar > button')).toHaveText([grid.selectAll, grid.selectNone, grid.invert, grid.turnRight, grid.turnLeft, grid.takeOut]);
  });

  test('Shift+click and Shift+Space go by place in the grid’s order once pages moved', async ({ page }) => {
    await toGrid(page);
    await listen(page);
    // Page 1 goes after page 2, page 4 before page 3: the grid is 2, 1, 4, 3, 5, 6, 7, 8.
    await button(page, fmt(grid.moveLater, { n: 1 })).click();
    await said(page, fmt(grid.moved, { n: 1, position: 2 }));
    await button(page, fmt(grid.moveEarlier, { n: 4 })).click();
    await said(page, fmt(grid.moved, { n: 4, position: 3 }));
    await expect.poll(() => order(page)).toEqual([2, 1, 4, 3, 5, 6, 7, 8]);
    await main(page, 0).click();
    expect(await silence(page)).toEqual([]);
    // From page 2 (place 1) to page 4 (place 3): pages 2, 1 and 4, not page 3, said by the pages at the two ends.
    await main(page, 2).click({ modifiers: ['Shift'] });
    const on = fmt(grid.spanOn, { from: 2, to: 4 });
    expect(await said(page, on)).toEqual([on]);
    expect(await pickedPages(page)).toEqual([2, 1, 4]);
    // By the keyboard: from page 4 (the anchor) to page 5 (place 5), across page 3.
    await main(page, 2).focus();
    for (const place of [3, 4]) {
      await page.keyboard.press('ArrowRight');
      await expect(main(page, place)).toBeFocused();
    }
    await page.keyboard.press('Shift+Space');
    const more = fmt(grid.spanOn, { from: 4, to: 5 });
    expect(await said(page, more)).toEqual([more]);
    expect(await pickedPages(page)).toEqual([2, 1, 4, 3, 5]);
  });
});

test.describe('the bar of actions over the picked pages', () => {
  test('with no page picked its buttons are aria-disabled, still in the Tab order, described by the help, and do nothing', async ({ page }) => {
    await toGrid(page);
    await listen(page);
    for (const which of ['right', 'left', 'out'] as const) {
      const one = act(page, which);
      await expect(one).toHaveAttribute('aria-disabled', 'true');
      await expect(one).not.toHaveAttribute('disabled');
      await expect(one).toHaveAccessibleDescription(grid.actsHelp);
      // Playwright waits for an aria-disabled button to be enabled before a click: the keyboard presses it, as a person can.
      await one.focus();
      await expect(one).toBeFocused();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
    }
    expect(await silence(page)).toEqual([]);
    expect(await cells(page).evaluateAll((items) => items.filter((li) => li.hasAttribute('data-leaving') || li.querySelector('img[data-turn]')).length)).toBe(0);
    // The Tab goes through the three, in their order, from the Invert button.
    await button(page, grid.invert).focus();
    for (const which of ['right', 'left', 'out'] as const) {
      await page.keyboard.press('Tab');
      await expect(act(page, which)).toBeFocused();
    }
    await main(page, 0).click();
    for (const which of ['right', 'left', 'out'] as const) await expect(act(page, which)).not.toHaveAttribute('aria-disabled');
  });

  test('Rotate right and left turn the picked pages on their sheet, with one sentence; Remove and Put back, with Delete’s look', async ({ page }) => {
    await toGrid(page);
    await drawn(cellOf(page, 2));
    await drawn(cellOf(page, 4));
    await listen(page);
    await main(page, 1).click();
    await main(page, 3).click();
    await act(page, 'right').click();
    const right = fmt(grid.turnedRight, { count: 2 });
    expect(await said(page, right)).toEqual([right]);
    // Page 2 (A4, standing) lies down; page 4 (/Rotate 90) stands upside down.
    await expect(cellOf(page, 2).locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '1');
    expect((await lookOf(cellOf(page, 2))).ratio).toBeCloseTo(page2.height / page2.width, 3);
    expect(await nameOf(page, 2)).toBe(`${fmt(grid.page, { n: 2, total: PAGES })}${fmt(grid.rotated, { degrees: 90 })}${grid.selected}`);
    expect(await nameOf(page, 4)).toBe(`${fmt(grid.page, { n: 4, total: PAGES })}${fmt(grid.rotated, { degrees: 180 })}${grid.selected}`);
    await act(page, 'left').click();
    const left = fmt(grid.turnedLeft, { count: 2 });
    expect(await said(page, left)).toEqual([left]);
    await expect(cellOf(page, 2).locator('.fo-page__sheet img')).not.toHaveAttribute('data-turn');
    expect((await lookOf(cellOf(page, 2))).ratio).toBeCloseTo(page2.width / page2.height, 3);
    // One page: the sentence of the turn says where it is now (page 6 has /Rotate 180: a quarter left, 90°).
    await button(page, grid.selectNone).click();
    await said(page, counted('en', 0, PAGES));
    await main(page, 5).click();
    await act(page, 'left').click();
    const six = fmt(grid.turned, { n: 6, degrees: 90 });
    expect(await said(page, six)).toEqual([six]);
    await drawn(cellOf(page, 6));
    // Remove: the page stays in the grid, faded, with the trash in a circle, and its name says it comes out.
    await act(page, 'out').click();
    expect(await said(page, leaving('en', 1))).toEqual([leaving('en', 1)]);
    await drawn(cellOf(page, 6));
    const out = await lookOf(cellOf(page, 6));
    expect(out).toMatchObject({ leaving: true, trash: true, check: true });
    expect(out.picture, 'the picture of a page that comes out is at 40 %').toBeCloseTo(0.4, 5);
    await expect(cells(page)).toHaveCount(PAGES);
    expect(await nameOf(page, 6)).toBe(`${fmt(grid.page, { n: 6, total: PAGES })}${fmt(grid.rotated, { degrees: 90 })}${grid.selected}${grid.leaving}`);
    await expect(act(page, 'out')).toHaveText(grid.putBack);
    // With one page that does not come out among the picked, the button takes them out again.
    await main(page, 6).click();
    await expect(act(page, 'out')).toHaveText(grid.takeOut);
    await act(page, 'out').click();
    expect(await said(page, leaving('en', 2))).toEqual([leaving('en', 2)]);
    await expect(act(page, 'out')).toHaveText(grid.putBack);
    await act(page, 'out').click();
    expect(await said(page, leaving('en', 0))).toEqual([leaving('en', 0)]);
    await drawn(cellOf(page, 6));
    const back = await lookOf(cellOf(page, 6));
    expect(back).toMatchObject({ leaving: false, trash: false, picture: 1 });
  });

  test('a page turned once and three times by the bar fits whole in its sheet, standing and with /Rotate 90 (criterion 1 of the F14)', async ({ page }) => {
    await toGrid(page);
    for (const n of [1, 4]) {
      const cell = cellOf(page, n);
      await button(page, grid.selectNone).click();
      await cell.locator('.fo-page__main').click();
      await act(page, 'right').click();
      await expect(cell.locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '1');
      await drawn(cell);
      expect(await fitOf(cell), `page ${n} after one turn`).toMatchObject({ fits: true });
      expect((await fitOf(cell)).filled).toBeGreaterThanOrEqual(0.95);
      await act(page, 'right').click();
      await act(page, 'right').click();
      await expect(cell.locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '3');
      await drawn(cell);
      expect(await fitOf(cell), `page ${n} after three turns`).toMatchObject({ fits: true });
      expect((await fitOf(cell)).filled).toBeGreaterThanOrEqual(0.95);
    }
  });

  test('every page out: Delete’s error, adapted, and the action does not run until one is put back', async ({ page }) => {
    await toGrid(page);
    const allOut = OPTIONS('en')['allOut'] ?? '';
    await button(page, grid.selectAll).click();
    await act(page, 'out').click();
    await expect(root(page).getByText(allOut)).toBeVisible();
    await expect(count(page)).toHaveText(counted('en', 8, 0));
    await action(page).click();
    await page.waitForTimeout(1_000);
    await expect(root(page).locator('.fo-btn--download')).toHaveCount(0);
    await expect(root(page).getByText(allOut)).toBeVisible();
    // Page 1 alone, put back.
    await button(page, grid.selectNone).click();
    await main(page, 0).click();
    await expect(act(page, 'out')).toHaveText(grid.putBack);
    await act(page, 'out').click();
    await expect(root(page).getByText(allOut)).toHaveCount(0);
    await expect(count(page)).toHaveText(counted('en', 1, 1));
  });

  test('nothing changed: the action says so instead of running', async ({ page }) => {
    await toGrid(page);
    await main(page, 2).click();
    await action(page).click();
    await expect(root(page).getByText(OPTIONS('en')['unchanged'] ?? '')).toBeVisible();
    await expect(root(page).locator('.fo-btn--download')).toHaveCount(0);
  });
});

test.describe('the order: the arrows of the cell, the keyboard and the mouse', () => {
  test('the arrows move the page and the focus follows it; Space and Enter pick, never pick up; the arrow keys move the focus', async ({ page }) => {
    await toGrid(page);
    await listen(page);
    await button(page, fmt(grid.moveLater, { n: 1 })).click();
    const moved = fmt(grid.moved, { n: 1, position: 2 });
    expect(await said(page, moved)).toEqual([moved]);
    await expect.poll(() => order(page)).toEqual([2, 1, 3, 4, 5, 6, 7, 8]);
    await expect(cellOf(page, 1).locator('.fo-page__main')).toBeFocused();
    // Space and Enter press the page's button: a pick, said by aria-pressed, never "picked up".
    await main(page, 2).focus();
    await page.keyboard.press('Space');
    await expect(cellOf(page, 3)).toHaveAttribute('data-selected', 'true');
    await expect(cellOf(page, 3).locator('.fo-page__main')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(cellOf(page, 3)).not.toHaveAttribute('data-selected', 'true');
    await expect(root(page).locator('.fo-page[data-grabbed]')).toHaveCount(0);
    expect(await silence(page)).toEqual([]);
    // The arrow keys move the focus, not the page.
    await page.keyboard.press('ArrowRight');
    await expect(main(page, 3)).toBeFocused();
    expect(await order(page)).toEqual([2, 1, 3, 4, 5, 6, 7, 8]);
    // Tab reaches the magnifier and the two arrows of the focused page; Enter on "earlier" moves it, and the focus follows.
    await page.keyboard.press('Tab');
    await expect(cellOf(page, 4).locator('.fo-page__zoom')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(cellOf(page, 4).locator('.fo-page__move--back')).toBeFocused();
    await page.keyboard.press('Enter');
    const earlier = fmt(grid.moved, { n: 4, position: 3 });
    expect(await said(page, earlier)).toEqual([earlier]);
    await expect.poll(() => order(page)).toEqual([2, 1, 4, 3, 5, 6, 7, 8]);
    await expect(cellOf(page, 4).locator('.fo-page__main')).toBeFocused();
    // The first page has no "earlier" and the last no "later".
    await expect(cells(page).nth(0).locator('.fo-page__move--back')).toBeDisabled();
    await expect(cells(page).nth(PAGES - 1).locator('.fo-page__move:not(.fo-page__move--back)')).toBeDisabled();
  });

  test('the mouse drags a page to its place, said once', async ({ page }) => {
    await toGrid(page);
    await listen(page);
    await cells(page).nth(7).dragTo(cells(page).nth(0));
    await expect.poll(() => order(page)).toEqual([8, 1, 2, 3, 4, 5, 6, 7]);
    const moved = fmt(grid.moved, { n: 8, position: 1 });
    expect(await said(page, moved)).toEqual([moved]);
  });
});

test.describe('the page view of Organize', () => {
  test('the heading says the place, Previous and Next follow the grid, and its two actions go the way of the bar', async ({ page }) => {
    await toGrid(page);
    await button(page, fmt(grid.moveLater, { n: 1 })).click();
    await expect.poll(() => order(page)).toEqual([2, 1, 3, 4, 5, 6, 7, 8]);
    await cellOf(page, 1).locator('.fo-page__zoom').click();
    await expect(heading(page)).toBeFocused();
    await expect(heading(page)).toHaveText(fmt(v.titleOrder, { n: 1, p: 2, total: PAGES }));
    const bar = view(page).locator('.fo-pview__bar');
    await expect(bar.getByRole('button')).toHaveText([v.previous, v.turn, v.remove, v.next]);
    const turn = bar.getByRole('button', { name: v.turn, exact: true });
    const remove = bar.getByRole('button', { name: v.remove, exact: true });
    await expect(turn).not.toHaveAttribute('aria-pressed');
    await expect(remove).toHaveAttribute('aria-pressed', 'false');
    await listen(page);
    await bar.getByRole('button', { name: v.next, exact: true }).click();
    const third = fmt(v.titleOrder, { n: 3, p: 3, total: PAGES });
    expect(await said(page, third)).toEqual([third]);
    await bar.getByRole('button', { name: v.previous, exact: true }).click();
    await bar.getByRole('button', { name: v.previous, exact: true }).click();
    await expect(heading(page)).toHaveText(fmt(v.titleOrder, { n: 2, p: 1, total: PAGES }));
    await bar.getByRole('button', { name: v.next, exact: true }).click();
    await said(page, fmt(v.titleOrder, { n: 1, p: 2, total: PAGES }));
    await expect(heading(page)).toHaveText(fmt(v.titleOrder, { n: 1, p: 2, total: PAGES }));
    await expect.poll(() => view(page).locator('.fo-pview__img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0).catch(() => false), { timeout: 30_000 }).toBe(true);
    await turn.click();
    const turned = fmt(grid.turned, { n: 1, degrees: 90 });
    expect(await said(page, turned)).toEqual([turned]);
    await expect(view(page).locator('.fo-pview__img')).toHaveAttribute('data-turn', '1');
    await remove.click();
    await expect(remove).toHaveAttribute('aria-pressed', 'true');
    expect(await said(page, leaving('en', 1))).toEqual([leaving('en', 1)]);
    // The state of the page is said after its heading when it comes back on view.
    await bar.getByRole('button', { name: v.next, exact: true }).click();
    expect(await said(page, third)).toEqual([third]);
    await bar.getByRole('button', { name: v.previous, exact: true }).click();
    const back = `${fmt(v.titleOrder, { n: 1, p: 2, total: PAGES })}${fmt(grid.rotated, { degrees: 90 })}${grid.leaving}`;
    expect(await said(page, back)).toEqual([back]);
    // Back on the grid: the page is turned and comes out, in the count too; the focus is on its magnifier.
    await view(page).getByRole('button', { name: v.back, exact: true }).click();
    await expect(cellOf(page, 1).locator('.fo-page__zoom')).toBeFocused();
    await expect(cellOf(page, 1)).toHaveAttribute('data-leaving', 'true');
    await expect(cellOf(page, 1).locator('.fo-page__sheet img')).toHaveAttribute('data-turn', '1');
    await expect(count(page)).toHaveText(counted('en', 0, PAGES - 1));
    await expect(act(page, 'right')).toHaveAttribute('aria-disabled', 'true');
  });

  test('the bottom bar: four buttons on one line from 768 px, the actions above Previous and Next below, one per row under 480 px', async ({ page }) => {
    await toGrid(page, 'es');
    await cells(page).nth(2).locator('.fo-page__zoom').click();
    await expect(heading(page)).toBeFocused();
    const bar = view(page).locator('.fo-pview__bar');
    for (const width of [320, 360, 479, 480, 600, 767, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const rows = await bar.evaluate((element) => {
        const list = Array.from(element.querySelectorAll('button')).map((b) => {
          const box = b.getBoundingClientRect();
          return { top: Math.round(box.top), left: box.left, right: box.right, width: box.width, height: box.height };
        });
        const bar = element.getBoundingClientRect();
        return { list, bar: [bar.left, bar.right] as [number, number], over: document.documentElement.scrollWidth > innerWidth };
      });
      const [previous, turn, remove, next] = rows.list as [typeof rows.list[0], typeof rows.list[0], typeof rows.list[0], typeof rows.list[0]];
      const label = `${width} px`;
      expect(rows.over, `${label}: no sideways scroll`).toBe(false);
      for (const item of rows.list) {
        expect(item.height, `${label}: 48 px high`).toBeGreaterThanOrEqual(47.5);
        expect(item.width, `${label}: 48 px wide`).toBeGreaterThanOrEqual(47.5);
        expect(item.left, `${label}: inside the bar`).toBeGreaterThanOrEqual(rows.bar[0] - 0.5);
        expect(item.right, `${label}: inside the bar`).toBeLessThanOrEqual(rows.bar[1] + 0.5);
      }
      if (width >= 768) {
        expect(new Set(rows.list.map((item) => item.top)).size, `${label}: one line`).toBe(1);
      } else if (width >= 480) {
        expect(turn.top, `${label}: the two actions side by side`).toBe(remove.top);
        expect(previous.top, `${label}: Previous and Next side by side, below`).toBe(next.top);
        expect(previous.top).toBeGreaterThan(turn.top);
      } else {
        expect(remove.top, `${label}: one action per row`).toBeGreaterThan(turn.top);
        expect(previous.top, `${label}: Previous and Next below`).toBeGreaterThan(remove.top);
        expect(previous.top).toBe(next.top);
        expect(Math.abs(turn.width - (rows.bar[1] - rows.bar[0])), `${label}: the action takes the whole row`).toBeLessThan(1);
        expect(Math.abs(remove.width - (rows.bar[1] - rows.bar[0]))).toBeLessThan(1);
      }
    }
  });
});

test.describe('the result', () => {
  test('one PDF in the grid’s order, with the turns and without the page out; "View the new PDF"; a change brings the action back', async ({ page }) => {
    await toGrid(page);
    await button(page, fmt(grid.moveLater, { n: 1 })).click();
    await main(page, 0).click();
    await act(page, 'right').click();
    await button(page, grid.selectNone).click();
    await cellOf(page, 6).locator('.fo-page__main').click();
    await act(page, 'out').click();
    await expect(action(page)).toHaveText(PDF_TOOL_TEXTS.en['organize-pdf'].panel.action ?? '');
    await action(page).click();
    const download = await takePdfDownload(page);
    expect(download.name).toBe('gen-paginas-mistas-organized.pdf');
    const read = await soundPdf(download.bytes);
    expect(read.pages.map((one) => one.marker)).toEqual(['Page 2', 'Page 1', 'Page 3', 'Page 4', 'Page 5', 'Page 7', 'Page 8']);
    const rotate = pdfOracle(MIXED).rotate ?? [];
    expect(read.pages.map((one) => one.rotate)).toEqual([2, 1, 3, 4, 5, 7, 8].map((n) => ((rotate[n - 1] ?? 0) + (n === 2 ? 90 : 0)) % 360));
    await expect(button(page, v.openResult)).toBeVisible();
    // The grid stays after the result; a change takes the result away and brings the action back.
    await expect(cells(page)).toHaveCount(PAGES);
    await main(page, 2).click();
    await act(page, 'right').click();
    await expect(action(page)).toBeVisible();
    await expect(root(page).locator('.fo-btn--download')).toHaveCount(0);
  });
});

/** The targets of a cell: the page's button, the magnifier and the arrows, and where they are against each other. */
function targetsOf(cell: Locator) {
  return cell.evaluate((li) => {
    const rect = (selector: string) => (li.querySelector(selector) as HTMLElement).getBoundingClientRect();
    const overlaps = (a: DOMRect, b: DOMRect) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const inside = (a: DOMRect) => a.left >= cellBox.left - 0.5 && a.right <= cellBox.right + 0.5 && a.top >= cellBox.top - 0.5 && a.bottom <= cellBox.bottom + 0.5;
    const cellBox = li.getBoundingClientRect();
    const mainBox = rect('.fo-page__main');
    const zoom = rect('.fo-page__zoom');
    const sheet = rect('.fo-page__sheet');
    const check = rect('.fo-page__check');
    const moves = Array.from(li.querySelectorAll('.fo-page__move')).map((button) => button.getBoundingClientRect());
    const hit = (box: DOMRect) => document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return {
      page: Number(li.dataset['page']) + 1,
      sizes: [[mainBox.width, mainBox.height], [zoom.width, zoom.height], ...moves.map((box) => [box.width, box.height])] as [number, number][],
      apart: !overlaps(zoom, sheet) && !overlaps(zoom, check) && moves.every((box) => !overlaps(box, zoom) && !overlaps(box, sheet) && !overlaps(box, mainBox)) && !(moves[0] && moves[1] && overlaps(moves[0], moves[1])),
      inside: [mainBox, zoom, ...moves].every(inside),
      hits: Boolean(hit(sheet)?.closest('.fo-page__main')) && Boolean(hit(check)?.closest('.fo-page__check')) && Boolean(hit(zoom)?.closest('.fo-page__zoom')) && moves.every((box) => Boolean(hit(box)?.closest('.fo-page__move'))),
      moves: moves.length,
    };
  });
}

test.describe('the 48 px targets, from 320 to 1280 px, in Small and Large', () => {
  test('300 pages: the page, the check, the magnifier and the two arrows of every cell, and the buttons of the bar', async ({ page }) => {
    test.setTimeout(180_000);
    await toGrid(page, 'en', MANY, 300);
    for (const size of [grid.sizeSmall, grid.sizeLarge]) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await root(page).locator('.fo-pages .fo-seg__opt').filter({ hasText: size }).first().click();
      for (const width of [320, 360, 768, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        for (const index of [0, 9, 99, 299]) {
          const cell = cells(page).nth(index);
          await cell.scrollIntoViewIfNeeded();
          const found = await targetsOf(cell);
          const label = `${size} at ${width} px, page ${found.page}`;
          expect(found.moves, `${label}: two arrows`).toBe(2);
          for (const [w, h] of found.sizes) {
            expect(w, `${label}: a target ${w} × ${h}`).toBeGreaterThanOrEqual(47.5);
            expect(h, `${label}: a target ${w} × ${h}`).toBeGreaterThanOrEqual(47.5);
          }
          expect(found.apart, `${label}: the magnifier and the arrows off the picture, the check and each other`).toBe(true);
          expect(found.inside, `${label}: every target inside its cell`).toBe(true);
          expect(found.hits, `${label}: the middle of each target is that target`).toBe(true);
        }
        for (const which of ['right', 'left', 'out'] as const) {
          const box = await act(page, which).boundingBox();
          expect(box?.height ?? 0, `${size} at ${width} px: the bar's ${which}`).toBeGreaterThanOrEqual(47.5);
          expect(box?.width ?? 0).toBeGreaterThanOrEqual(47.5);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${size} at ${width} px: no sideways scroll`).toBe(true);
      }
    }
  });
});

test.describe('a press on the 300-page grid draws only the cells that changed', () => {
  test('a press, Shift, a turn of the bar and a page out draw only the cells they change; Pick all draws them all (the count works)', async ({ page }) => {
    test.setTimeout(120_000);
    // Each cell writes the name of its magnifier once per drawing (fmt on grid.zoom): the names written are recorded on
    // String.prototype.replace, so the cells drawn after a gesture are known by their page.
    await page.addInitScript((template: string) => {
      const replace = String.prototype.replace;
      const drawn: string[] = [];
      (window as unknown as { __cells: string[] }).__cells = drawn;
      String.prototype.replace = function (this: string, ...args: Parameters<typeof replace>) {
        const out = replace.apply(this, args);
        if (String(this) === template) drawn.push(out);
        return out;
      } as typeof replace;
    }, grid.zoom);
    await toGrid(page, 'en', MANY, 300);
    /** The pages whose cell was drawn during the gesture. */
    const after = async (gesture: () => Promise<void>): Promise<number[]> => {
      await page.waitForTimeout(300);
      await page.evaluate(() => ((window as unknown as { __cells: string[] }).__cells.length = 0));
      await gesture();
      await page.waitForTimeout(400);
      const names = await page.evaluate(() => (window as unknown as { __cells: string[] }).__cells.slice());
      return [...new Set(names.map((name) => Number(/\d+/.exec(name)?.[0])))].sort((a, b) => a - b);
    };
    // The page pressed and the one that was the active cell before (the focus moves with the press).
    expect(await after(() => main(page, 4).click()), 'a press').toEqual([1, 5]);
    expect(await after(() => main(page, 5).click()), 'another press').toEqual([5, 6]);
    expect(await after(() => main(page, 8).click({ modifiers: ['Shift'] })), 'Shift from page 6 to page 9').toEqual([6, 7, 8, 9]);
    expect(await after(() => act(page, 'right').click()), 'Rotate right on the five picked').toEqual([5, 6, 7, 8, 9]);
    expect(await after(() => act(page, 'out').click()), 'Remove the five picked').toEqual([5, 6, 7, 8, 9]);
    expect((await after(() => button(page, grid.selectAll).click())).length, 'Pick all changes 295 cells, and they are drawn').toBeGreaterThanOrEqual(295);
  });
});
