import { readFileSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import en from '../../src/tools/pdf/i18n/en.ts';
import es from '../../src/tools/pdf/i18n/es.ts';
import pt from '../../src/tools/pdf/i18n/pt.ts';
import { PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// F14 (PLANO-UX-QV.md, items 4, 5 and 9; criterion 9; PENDENCIAS F4-F7 d-2 and d-8; DECISOES § 627 to § 629): the marks
// of the page grid.
//  - Delete shows what comes out: the trash in the circle, the picture at 40 %, the number and the circle as they were,
//    the name ending in ", comes out" (en, pt, es), and the count with the forms of one. Split and Sign keep the check.
//  - Invert selection beside Pick all and Pick none; in Delete, inverting to every page gives the error of today.
//  - Shift+click and Shift+Space pick or unpick from the anchor to the page, with the new state of the page; without an
//    anchor (before the first touch, after Pick all, Pick none, Invert and a typed range) they are a plain press.
//  - One sentence per gesture in the panel's region, counted with a MutationObserver: the count for the batch gestures
//    and the typed range (d-2), the span for Shift, none for a plain press, and in Rotate page by page only the turn's
//    (d-8, the "Done!" of the run the turn starts is not said).

const MIXED = 'gen-paginas-mistas.pdf';
const PAGES = 8;
const TEXTS = { en, pt, es } as const;
type Lang = keyof typeof TEXTS;
const DELETE_PATH: Record<Lang, string> = { en: '/delete-pdf-pages/', pt: '/pt/excluir-paginas-pdf/', es: '/es/eliminar-paginas-pdf/' };
const PATHS = { split: '/split-pdf/', sign: '/sign-pdf/', rotate: '/rotate-pdf/', reorder: '/reorder-pdf-pages/' } as const;

/** The first stroke of each icon, as drawn in docs/design/assets/Icons/ (a spec cannot import ICONS). */
const firstPath = (name: string): string => /<path d="([^"]+)"/.exec(readFileSync(`docs/design/assets/Icons/${name}.svg`, 'utf8'))?.[1] ?? name;
const TRASH = firstPath('trash');
const CHECK = firstPath('check');

const root = (page: Page) => page.locator('#fo-tool-root');
const cells = (page: Page) => root(page).locator('.fo-pages__grid > li');
const main = (page: Page, index: number) => cells(page).nth(index).locator('.fo-page__main');
const count = (page: Page) => root(page).locator('.fo-pages__count');
const option = (page: Page, label: string) => root(page).locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const optionsOf = (id: string): Record<string, string> => (PDF_TOOL_TEXTS.en[id as 'split-pdf'].panel as unknown as { options: Record<string, string> }).options;
const button = (page: Page, name: string) => root(page).getByRole('button', { name, exact: true });

/** The pages picked, by the cells' state. */
const pickedPages = (page: Page) => cells(page).evaluateAll((items) => items.filter((li) => li.getAttribute('data-selected') === 'true').map((li) => Number(li.getAttribute('data-page')) + 1));

/** Opens a tool with the mixed file, brings its grid, and waits for the focus on the action (DECISOES § 240). */
async function toGrid(page: Page, tool: 'delete' | 'split' | 'sign', lang: Lang = 'en'): Promise<void> {
  await openTool(page, tool === 'delete' ? DELETE_PATH[lang] : PATHS[tool]);
  await choosePdfs(page, [pdfFile(MIXED)]);
  await expect(root(page).locator('.fo-ready:not(.fo-ready--reading)')).toBeVisible({ timeout: 30_000 });
  if (tool === 'split') await option(page, optionsOf('split-pdf')['pick'] ?? '');
  if (tool === 'sign') await option(page, optionsOf('sign-pdf')['pickPages'] ?? '');
  await expect(cells(page)).toHaveCount(PAGES, { timeout: 30_000 });
  // The panel moves the focus to the action a frame after the grid shows; a step that focuses a page waits for it.
  if (tool === 'delete') await expect(root(page).locator('.fo-ready .fo-btn--brand')).toBeFocused();
}

/** From now on, every sentence the panel's region shows (the region empties itself 50 ms before each one). */
async function listen(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('#fo-tool-root p.fo-sr[role="status"]');
    if (!region) throw new Error('no status region');
    const log: string[] = [];
    (window as unknown as { __said: string[] }).__said = log;
    new MutationObserver(() => {
      const text = (region.textContent ?? '').trim();
      if (text) log.push(text);
    }).observe(region, { childList: true, characterData: true, subtree: true });
  });
}

/** Forgets what was said so far. */
const hush = (page: Page) => page.evaluate(() => ((window as unknown as { __said: string[] }).__said.length = 0));

/** What the region said since the last `hush`, once `last` is on it, with a beat for a second sentence to show. */
async function said(page: Page, last: string): Promise<string[]> {
  await expect(root(page).locator('p.fo-sr[role="status"]')).toHaveText(last);
  await page.waitForTimeout(250);
  return page.evaluate(() => (window as unknown as { __said: string[] }).__said.slice());
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

/** How a cell looks: the icon in its circle, the opacity of its picture, and what the circle and the number are drawn with. */
function lookOf(cell: Locator) {
  return cell.evaluate((li) => {
    const probe = (value: string) => {
      const i = document.createElement('i');
      i.style.color = value;
      li.append(i);
      const color = getComputedStyle(i).color;
      i.remove();
      return color;
    };
    /** The opacity an element is drawn with: its own times every ancestor's, up to the cell. */
    const seen = (element: Element | null) => {
      let value = 1;
      for (let node = element; node && node !== li.parentElement; node = node.parentElement) value *= Number(getComputedStyle(node).opacity);
      return value;
    };
    const check = li.querySelector('.fo-page__check') as HTMLElement;
    const number = li.querySelector('.fo-page__n') as HTMLElement;
    const img = li.querySelector('.fo-page__sheet img');
    return {
      icon: check.querySelector('svg')?.innerHTML ?? '',
      iconShown: getComputedStyle(check.querySelector('svg') as Element).visibility === 'visible',
      picture: img ? seen(img) : null,
      number: seen(number),
      circle: seen(check),
      circleColor: getComputedStyle(check).backgroundColor === probe('var(--brand)'),
      iconColor: getComputedStyle(check).color === probe('var(--on-brand)'),
      numberColor: getComputedStyle(number).color === probe('var(--ink)'),
      name: li.querySelector('.fo-page__main')?.getAttribute('aria-label') ?? '',
    };
  });
}

test.describe('item 4: in Delete a picked page shows that it comes out', () => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    test(`${lang}: the trash in the circle, the picture at 40 %, the number and the circle as they were, the name and the count`, async ({ page }) => {
      const grid = TEXTS[lang].grid;
      await toGrid(page, 'delete', lang);
      await expect(count(page)).toHaveText(`${fmt(grid.leavingCount, { count: 0, total: PAGES })} · ${fmt(grid.keptCount, { left: PAGES })}`);
      const second = cells(page).nth(1);
      await drawn(second);
      await drawn(cells(page).nth(0));
      await main(page, 1).click();
      await expect(second).toHaveAttribute('data-selected', 'true');
      const out = await lookOf(second);
      expect(out.icon, 'the circle has the trash').toContain(TRASH);
      expect(out.icon).not.toContain(CHECK);
      expect(out.iconShown).toBe(true);
      expect(out.picture, 'the picture of a page that comes out is at 40 %').toBeCloseTo(0.4, 5);
      expect(out.number, 'the number is not faded').toBe(1);
      expect(out.circle, 'the circle is not faded').toBe(1);
      expect(out.circleColor && out.iconColor && out.numberColor, 'the circle, its icon and the number keep their colours').toBe(true);
      expect(out.name).toBe(`${fmt(grid.page, { n: 2, total: PAGES })}${grid.leaving}`);
      // A page that stays: the empty circle, the picture whole, the name without the word.
      const kept = await lookOf(cells(page).nth(0));
      expect(kept.iconShown).toBe(false);
      expect(kept.picture).toBe(1);
      expect(kept.name).toBe(fmt(grid.page, { n: 1, total: PAGES }));
      // The forms of one: "1 of 8 comes out", then "keeps 1 page".
      await expect(count(page)).toHaveText(`${fmt(grid.leavingOne, { total: PAGES })} · ${fmt(grid.keptCount, { left: PAGES - 1 })}`);
      for (const index of [2, 3, 4, 5, 6]) await main(page, index).click();
      await expect(count(page)).toHaveText(`${fmt(grid.leavingCount, { count: PAGES - 2, total: PAGES })} · ${fmt(grid.keptCount, { left: 2 })}`);
      await main(page, 7).click();
      await expect(count(page)).toHaveText(`${fmt(grid.leavingCount, { count: PAGES - 1, total: PAGES })} · ${grid.keptOne}`);
      await main(page, 1).click();
      await expect(second).not.toHaveAttribute('data-selected', 'true');
      expect((await lookOf(second)).picture, 'a page put back is whole again').toBe(1);
    });
  }

  for (const tool of ['split', 'sign'] as const) {
    test(`${tool}: nothing changes, the check means the page goes in`, async ({ page }) => {
      await toGrid(page, tool);
      const second = cells(page).nth(1);
      await drawn(second);
      await main(page, 1).click();
      await expect(second).toHaveAttribute('data-selected', 'true');
      await expect(second).not.toHaveAttribute('data-leaving', 'true');
      const look = await lookOf(second);
      expect(look.icon).toContain(CHECK);
      expect(look.picture).toBe(1);
      expect(look.name).toBe(`${fmt(en.grid.page, { n: 2, total: PAGES })}${en.grid.selected}`);
      await expect(count(page)).toHaveText(fmt(en.grid.selectedCount, { count: 1, total: PAGES }));
    });
  }
});

test.describe('item 5: Invert selection', () => {
  test('Split: it sits with Pick all and Pick none, picks every page that was not, and says the count once', async ({ page }) => {
    await toGrid(page, 'split');
    await listen(page);
    await main(page, 0).click();
    await main(page, 2).click();
    await hush(page);
    await button(page, en.grid.invert).click();
    const expected = fmt(en.grid.selectedCount, { count: 6, total: PAGES });
    expect(await said(page, expected)).toEqual([expected]);
    expect(await pickedPages(page)).toEqual([2, 4, 5, 6, 7, 8]);
    await expect(count(page)).toHaveText(expected);
    // The three buttons of the bar, in order.
    await expect(root(page).locator('.fo-pages__bar > button')).toHaveText([en.grid.selectAll, en.grid.selectNone, en.grid.invert]);
  });

  test('Delete: inverting to every page gives the error of a PDF with no page left', async ({ page }) => {
    await toGrid(page, 'delete');
    await listen(page);
    const allPicked = optionsOf('delete-pdf-pages')['allPicked'] ?? '';
    await expect(root(page).getByText(allPicked)).toHaveCount(0);
    await button(page, en.grid.invert).click();
    const expected = `${fmt(en.grid.leavingCount, { count: PAGES, total: PAGES })} · ${fmt(en.grid.keptCount, { left: 0 })}`;
    expect(await said(page, expected)).toEqual([expected]);
    await expect(root(page).getByText(allPicked)).toBeVisible();
    await hush(page);
    await button(page, en.grid.invert).click();
    const none = `${fmt(en.grid.leavingCount, { count: 0, total: PAGES })} · ${fmt(en.grid.keptCount, { left: PAGES })}`;
    expect(await said(page, none)).toEqual([none]);
    await expect(root(page).getByText(allPicked)).toHaveCount(0);
  });

  test('only the grids that pick have it: not Rotate page by page, not Reorder', async ({ page }) => {
    await openTool(page, PATHS.reorder);
    await choosePdfs(page, [pdfFile(MIXED)]);
    await expect(cells(page)).toHaveCount(PAGES, { timeout: 30_000 });
    await expect(button(page, en.grid.invert)).toHaveCount(0);
    await openTool(page, PATHS.rotate);
    await choosePdfs(page, [pdfFile(MIXED)]);
    await expect(root(page).locator('.fo-btn--download')).toBeVisible({ timeout: 60_000 });
    await root(page).locator('.fo-adjust > summary').click();
    await option(page, optionsOf('rotate-pdf')['pick'] ?? '');
    await expect(cells(page)).toHaveCount(PAGES, { timeout: 30_000 });
    await expect(button(page, en.grid.invert)).toHaveCount(0);
  });
});

const spanOn = (from: number, to: number) => fmt(en.grid.spanOn, { from, to });
const spanOff = (from: number, to: number) => fmt(en.grid.spanOff, { from, to });

test.describe('item 5 and criterion 9: Shift+click from the anchor to the page', () => {
  test('Delete: picks and unpicks the span with the new state of the page touched, and says it once', async ({ page }) => {
    await toGrid(page, 'delete');
    await listen(page);
    // A plain press says nothing (aria-pressed tells): page 2 is the anchor.
    await main(page, 1).click();
    expect(await silence(page)).toEqual([]);
    await main(page, 4).click({ modifiers: ['Shift'] });
    expect(await said(page, spanOn(2, 5))).toEqual([spanOn(2, 5)]);
    expect(await pickedPages(page)).toEqual([2, 3, 4, 5]);
    // Page 5 is the anchor now; Shift on page 3, which is picked, unpicks 3 to 5.
    await hush(page);
    await main(page, 2).click({ modifiers: ['Shift'] });
    expect(await said(page, spanOff(3, 5))).toEqual([spanOff(3, 5)]);
    expect(await pickedPages(page)).toEqual([2]);
    // Backwards, from page 3 to page 1: page 1 is not picked, so 1 to 3 are; page 2 stays picked.
    await hush(page);
    await main(page, 0).click({ modifiers: ['Shift'] });
    expect(await said(page, spanOn(1, 3))).toEqual([spanOn(1, 3)]);
    expect(await pickedPages(page)).toEqual([1, 2, 3]);
    // The pages outside the span keep their state.
    await main(page, 7).click();
    await hush(page);
    await main(page, 5).click({ modifiers: ['Shift'] });
    expect(await said(page, spanOn(6, 8))).toEqual([spanOn(6, 8)]);
    expect(await pickedPages(page)).toEqual([1, 2, 3, 6, 7, 8]);
  });

  test('Split: before the first touch there is no anchor, and Shift+click is a plain press', async ({ page }) => {
    await toGrid(page, 'split');
    await listen(page);
    await main(page, 3).click({ modifiers: ['Shift'] });
    await expect(cells(page).nth(3)).toHaveAttribute('data-selected', 'true');
    expect(await pickedPages(page)).toEqual([4]);
    expect(await silence(page)).toEqual([]);
    // Now page 4 is the anchor.
    await main(page, 6).click({ modifiers: ['Shift'] });
    expect(await said(page, spanOn(4, 7))).toEqual([spanOn(4, 7)]);
    expect(await pickedPages(page)).toEqual([4, 5, 6, 7]);
    // Page 7 is the anchor now: Shift on the anchor itself is a plain press ("Pages 7 to 7" is no span).
    await hush(page);
    await main(page, 6).click({ modifiers: ['Shift'] });
    await expect(cells(page).nth(6)).not.toHaveAttribute('data-selected', 'true');
    expect(await pickedPages(page)).toEqual([4, 5, 6]);
    expect(await silence(page)).toEqual([]);
  });

  for (const gesture of ['Pick all', 'Pick none', 'Invert selection', 'a typed range', 'a typed range of the same pages'] as const) {
    test(`Delete: after ${gesture} there is no anchor, and Shift+click is a plain press`, async ({ page }) => {
      await toGrid(page, 'delete');
      await listen(page);
      await main(page, 1).click();
      if (gesture === 'Pick all') await button(page, en.grid.selectAll).click();
      if (gesture === 'Pick none') await button(page, en.grid.selectNone).click();
      if (gesture === 'Invert selection') await button(page, en.grid.invert).click();
      if (gesture === 'a typed range' || gesture === 'a typed range of the same pages') {
        await root(page).locator('#fo-delete-pick').fill(gesture === 'a typed range' ? '1, 3' : '2');
        await button(page, en.grid.rangeApply).click();
      }
      const before = await pickedPages(page);
      await expect(root(page).locator('p.fo-sr[role="status"]')).not.toHaveText('');
      await page.waitForTimeout(200);
      await hush(page);
      // Page 6 (never picked by any of these but Pick all) toggles alone: no span from page 2.
      await main(page, 5).click({ modifiers: ['Shift'] });
      const after = await pickedPages(page);
      const toggled = before.includes(6) ? before.filter((n) => n !== 6) : [...before, 6].sort((a, b) => a - b);
      expect(after).toEqual(toggled);
      expect(await silence(page)).toEqual([]);
    });
  }
});

test.describe('item 5 and criterion 9: Shift+Space by the keyboard', () => {
  test('Delete: from the anchor to the focused page, said once, and never also a plain press', async ({ page }) => {
    await toGrid(page, 'delete');
    await listen(page);
    await main(page, 1).focus();
    await page.keyboard.press('Space');
    await expect(cells(page).nth(1)).toHaveAttribute('data-selected', 'true');
    expect(await silence(page)).toEqual([]);
    // The focus moves a render after each key: the next key waits for it.
    for (const index of [2, 3, 4]) {
      await page.keyboard.press('ArrowRight');
      await expect(main(page, index)).toBeFocused();
    }
    await page.keyboard.press('Shift+Space');
    expect(await said(page, spanOn(2, 5))).toEqual([spanOn(2, 5)]);
    // Page 5 got the new state once: a plain press on top of the span would have put it back.
    expect(await pickedPages(page)).toEqual([2, 3, 4, 5]);
    await expect(main(page, 4)).toBeFocused();
    // And back: from page 5 (the anchor) to page 4, which is picked: 4 and 5 go.
    await hush(page);
    await page.keyboard.press('ArrowLeft');
    await expect(main(page, 3)).toBeFocused();
    await page.keyboard.press('Shift+Space');
    expect(await said(page, spanOff(4, 5))).toEqual([spanOff(4, 5)]);
    expect(await pickedPages(page)).toEqual([2, 3]);
  });

  test('Split: with no anchor (after Pick none), Shift+Space is a plain press, once', async ({ page }) => {
    await toGrid(page, 'split');
    await listen(page);
    await main(page, 0).click();
    await button(page, en.grid.selectNone).click();
    await expect(count(page)).toHaveText(fmt(en.grid.selectedCount, { count: 0, total: PAGES }));
    await page.waitForTimeout(200);
    await hush(page);
    await main(page, 2).focus();
    await page.keyboard.press('Shift+Space');
    await expect(cells(page).nth(2)).toHaveAttribute('data-selected', 'true');
    expect(await pickedPages(page)).toEqual([3]);
    expect(await silence(page)).toEqual([]);
    // Space alone is still the button's own press.
    await page.keyboard.press('Space');
    await expect(cells(page).nth(2)).not.toHaveAttribute('data-selected', 'true');
  });
});

test.describe('item 9 (d-2): the batch gestures and the typed range say the count, once each', () => {
  test('Delete: Pick all, Pick none, Invert and the typed range, in the words of Delete', async ({ page }) => {
    await toGrid(page, 'delete');
    await listen(page);
    const sentence = (n: number) => `${n === 1 ? fmt(en.grid.leavingOne, { total: PAGES }) : fmt(en.grid.leavingCount, { count: n, total: PAGES })} · ${PAGES - n === 1 ? en.grid.keptOne : fmt(en.grid.keptCount, { left: PAGES - n })}`;
    await button(page, en.grid.selectAll).click();
    expect(await said(page, sentence(PAGES))).toEqual([sentence(PAGES)]);
    await hush(page);
    await button(page, en.grid.selectNone).click();
    expect(await said(page, sentence(0))).toEqual([sentence(0)]);
    await hush(page);
    await root(page).locator('#fo-delete-pick').fill('2-8');
    await page.keyboard.press('Enter');
    expect(await said(page, sentence(7))).toEqual([sentence(7)]);
    await expect(count(page)).toHaveText(sentence(7));
    await hush(page);
    await button(page, en.grid.invert).click();
    expect(await said(page, sentence(1))).toEqual([sentence(1)]);
    // A plain press says nothing.
    await hush(page);
    await main(page, 4).click();
    expect(await silence(page)).toEqual([]);
  });

  test('Split: the typed range says the pages picked; a wrong one says nothing in the region', async ({ page }) => {
    await toGrid(page, 'split');
    await listen(page);
    await root(page).locator('#fo-split-pick').fill('1-3, 8');
    await button(page, en.grid.rangeApply).click();
    const expected = fmt(en.grid.selectedCount, { count: 4, total: PAGES });
    expect(await said(page, expected)).toEqual([expected]);
    expect(await pickedPages(page)).toEqual([1, 2, 3, 8]);
    await hush(page);
    await root(page).locator('#fo-split-pick').fill('9');
    await button(page, en.grid.rangeApply).click();
    await expect(root(page).getByText(fmt(en.grid.rangeError, { total: PAGES }))).toBeVisible();
    expect(await silence(page)).toEqual([]);
  });
});

test.describe('item 9 (d-8): in Rotate page by page, one sentence per turn', () => {
  test("a turn says the turn's sentence only, before and after the result, and the run it starts adds no Done", async ({ page }) => {
    await openTool(page, PATHS.rotate);
    await choosePdfs(page, [pdfFile(MIXED)]);
    const download = root(page).locator('.fo-btn--download');
    await expect(download).toBeVisible({ timeout: 60_000 });
    await root(page).locator('.fo-adjust > summary').click();
    await option(page, optionsOf('rotate-pdf')['pick'] ?? '');
    await expect(cells(page)).toHaveCount(PAGES, { timeout: 30_000 });
    await listen(page);
    // Page by page with no turn yet has nothing to make (the result goes): the first turn makes the file again. The new
    // file is told by the address of its Download, so the run is over before the region is read.
    const hrefOf = () => download.getAttribute('href', { timeout: 1_000 }).catch(() => null);
    const old = await hrefOf();
    await main(page, 0).click();
    const first = fmt(en.grid.turned, { n: 1, degrees: 90 });
    await expect.poll(hrefOf, { timeout: 60_000 }).not.toBe(old);
    await expect.poll(hrefOf, { timeout: 60_000 }).not.toBeNull();
    expect(await said(page, first)).toEqual([first]);
    // With the result on screen, a turn makes it again in place: wait for the new file, then for a sentence too many.
    const before = await download.getAttribute('href');
    await hush(page);
    await main(page, 3).click();
    const second = fmt(en.grid.turned, { n: 4, degrees: 180 });
    await expect.poll(() => download.getAttribute('href'), { timeout: 60_000 }).not.toBe(before);
    expect(await said(page, second)).toEqual([second]);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __said: string[] }).__said.slice())).toEqual([second]);
  });

  test('an option change still says its Done, once', async ({ page }) => {
    await openTool(page, PATHS.rotate);
    await choosePdfs(page, [pdfFile(MIXED)]);
    const download = root(page).locator('.fo-btn--download');
    await expect(download).toBeVisible({ timeout: 60_000 });
    await root(page).locator('.fo-adjust > summary').click();
    await listen(page);
    const before = await download.getAttribute('href');
    await option(page, optionsOf('rotate-pdf')['half'] ?? '');
    await expect.poll(() => download.getAttribute('href'), { timeout: 60_000 }).not.toBe(before);
    await page.waitForTimeout(300);
    const log = await page.evaluate(() => (window as unknown as { __said: string[] }).__said.slice());
    expect(log).toHaveLength(1);
    expect(log[0]).toMatch(/^Done!/);
  });
});
