import { expect, test, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import { routeById, type Lang } from '../../src/i18n/routes.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import type { MergeTexts } from '../../src/tools/pdf/option-texts.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { dragOver, hydrated, slowEngine } from './lib/page.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { choosePdfs, openTool, pdfFile } from './lib/pdf-tools.ts';

// F13a (UX-04 A, tool-a-merge; DECISOES § 479 and § 489): the Merge list lives in the rectangle. Its tests:
// the row that leaves with its Undo (D-21), the Merge button where the Choose button was (D-22), the order help in view
// (D-26), the reading that is already the list (D-27), the rectangle that keeps the height of the list, the interaction
// that moves nothing (CLS, also on the 3rd use with the coffee line) and the chips near the Download.

const LANGS = ['en', 'pt', 'es'] as const;
const pathOf = (lang: Lang) => routeById('merge-pdf').paths[lang] ?? '/merge-pdf/';
const mergeTexts = (lang: Lang) => PDF_TOOL_TEXTS[lang]['merge-pdf'].panel as unknown as { action: string; options: MergeTexts };
const PHONE = { width: 360, height: 740 } as const;
/** Two PDFs under the names of the specification: form.pdf (8 pages) and scan.pdf (12 pages). */
const TWO = () => [pdfFile('gen-paginas-mistas.pdf', 'form.pdf'), pdfFile('gen-ja-otimizado.pdf', 'scan.pdf')];

/** The cookie choice stored before the page loads, so the notice does not cover the page (and the coffee may count). */
async function consent(page: Page, choice: 'granted' | 'denied', coffeeUses = 0): Promise<void> {
  await page.addInitScript(
    ({ choice, coffeeUses }) => {
      try {
        localStorage.setItem('fo-consent', choice);
        if (coffeeUses > 0 && !sessionStorage.getItem('fo-test-coffee')) {
          sessionStorage.setItem('fo-test-coffee', '1');
          localStorage.setItem('fo-coffee', JSON.stringify({ uses: coffeeUses }));
        }
      } catch {
        // no storage: the test fails on what it reads
      }
    },
    { choice, coffeeUses },
  );
}

async function open(page: Page, lang: Lang = 'en'): Promise<void> {
  expect((await page.goto(pathOf(lang)))?.status()).toBe(200);
  await hydrated(page);
}

const mergeButton = (page: Page, lang: Lang = 'en') => page.locator('#fo-tool-root .fo-merge-panel').getByRole('button', { name: mergeTexts(lang).action, exact: true });

test('D-21: a row taken out leaves its place to a line with Undo, until Undo puts it back in the same order', async ({ page }) => {
  const q = PDF_PANEL_TEXTS.en.queue;
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, TWO());
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
  const rows = page.locator('#fo-tool-root .fo-merge-panel .fo-merge__row');
  await expect(rows).toHaveCount(2);
  await page.getByRole('button', { name: fmt(q.remove, { name: 'scan.pdf' }), exact: true }).click();
  // One row is left, the count says so, and the line in the place of the row has its sentence in a region and the focus on Undo.
  await expect(rows).toHaveCount(1);
  await expect(page.locator('#fo-tool-root .fo-count')).toContainText(q.readyOne);
  const undo = page.getByRole('button', { name: q.undo, exact: true });
  await expect(undo).toBeFocused();
  await expect(page.locator('#fo-tool-root .fo-merge__undo [role="status"]')).toHaveText(fmt(q.out, { name: 'scan.pdf' }));
  // The line stands where the row was (the second place), at the height of a row: no timer takes it away.
  const [kept, line] = await Promise.all([rows.first().boundingBox(), page.locator('#fo-tool-root .fo-merge__undo').boundingBox()]);
  expect(line?.y ?? 0).toBeGreaterThan((kept?.y ?? 0) + (kept?.height ?? 0) - 1);
  expect(Math.abs((line?.height ?? 0) - (kept?.height ?? 0))).toBeLessThanOrEqual(1);
  await page.waitForTimeout(1_500);
  await expect(undo).toBeVisible();
  // With one PDF, the place of the Merge button says what is missing.
  await expect(page.locator('#fo-tool-root .fo-merge__hold')).toHaveText(mergeTexts('en').options.needMore);
  // Undo: the two rows again, in the same order, and the focus on the remove button of the row that came back.
  await page.keyboard.press('Enter');
  await expect(rows).toHaveCount(2);
  await expect(rows.locator('.fo-file__name')).toHaveText(['form.pdf', 'scan.pdf']);
  await expect(page.getByRole('button', { name: fmt(q.remove, { name: 'scan.pdf' }), exact: true })).toBeFocused();
  await expect(page.locator('#fo-tool-root .fo-merge__undo')).toHaveCount(0);
  await expect(mergeButton(page)).toBeVisible();
});

test('D-21: the next action (another remove, Add more, Merge) takes the Undo away', async ({ page }) => {
  const q = PDF_PANEL_TEXTS.en.queue;
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [...TWO(), pdfFile('gen-acoes.pdf', 'notes.pdf')]);
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: fmt(q.remove, { name: 'notes.pdf' }), exact: true }).click();
  await expect(page.locator('#fo-tool-root .fo-merge__undo')).toHaveCount(1);
  await page.getByRole('button', { name: fmt(q.remove, { name: 'scan.pdf' }), exact: true }).click();
  // Only the last row out has its line: notes.pdf is gone for good.
  await expect(page.locator('#fo-tool-root .fo-merge__undo')).toHaveCount(1);
  await expect(page.locator('#fo-tool-root .fo-merge__undo [role="status"]')).toHaveText(fmt(q.out, { name: 'scan.pdf' }));
  await choosePdfs(page, [pdfFile('gen-acoes.pdf', 'notes.pdf')]);
  await expect(page.locator('#fo-tool-root .fo-merge__undo')).toHaveCount(0);
  await expect(page.locator('#fo-tool-root .fo-merge__row .fo-file__name')).toHaveText(['form.pdf', 'notes.pdf'], { timeout: 30_000 });
});

for (const lang of LANGS) {
  test(`D-22: at 360 × 740 on a first visit, the point of the Choose button falls on Merge PDFs, never on Start over (${lang})`, async ({ page }) => {
    await page.setViewportSize(PHONE);
    await open(page, lang);
    // The cookie notice of the first visit is open: no choice stored.
    await expect(page.locator('#fo-cookie')).toBeVisible();
    const choose = page.locator('#fo-tool-root .fo-drop .fo-btn--brand');
    const box = await choose.boundingBox();
    expect(box, 'the Choose button at rest').not.toBeNull();
    const point = { x: (box?.x ?? 0) + (box?.width ?? 0) / 2, y: (box?.y ?? 0) + (box?.height ?? 0) / 2 };
    await choosePdfs(page, TWO());
    await expect(mergeButton(page, lang)).toBeVisible({ timeout: 30_000 });
    const hit = await page.evaluate(({ x, y }) => {
      const button = document.elementFromPoint(x, y)?.closest('button');
      return { text: button?.textContent?.trim() ?? null, restart: button?.classList.contains('fo-merge__restart') ?? false };
    }, point);
    expect(hit.text, 'the button under the point').toBe(mergeTexts(lang).action);
    expect(hit.restart).toBe(false);
    // Start over is at the foot of the rectangle, under "Add more PDFs".
    const [restart, add] = await Promise.all([page.locator('#fo-tool-root .fo-merge__restart').boundingBox(), page.locator('#fo-tool-root .fo-merge__add').boundingBox()]);
    expect(restart?.y ?? 0).toBeGreaterThan((add?.y ?? 0) + (add?.height ?? 0) - 1);
  });

  test(`D-26: the order help is in view, above the first row and above the fold at 360 × 740 (${lang})`, async ({ page }) => {
    await consent(page, 'denied');
    await page.setViewportSize(PHONE);
    await open(page, lang);
    await choosePdfs(page, TWO());
    await expect(mergeButton(page, lang)).toBeVisible({ timeout: 30_000 });
    const help = page.locator('#fo-tool-root .fo-merge__help');
    await expect(help).toHaveText(mergeTexts(lang).options.help);
    await expect(help).toBeVisible();
    const [helpBox, row] = await Promise.all([help.boundingBox(), page.locator('#fo-tool-root .fo-merge__row').first().boundingBox()]);
    expect((helpBox?.y ?? 0) + (helpBox?.height ?? 0)).toBeLessThanOrEqual(row?.y ?? 0);
    expect((helpBox?.y ?? 0) + (helpBox?.height ?? 0)).toBeLessThanOrEqual(PHONE.height);
    // The list points at it, and the number of each row is only seen (the list says "1 of 2").
    await expect(page.locator('#fo-tool-root ol.fo-merge')).toHaveAttribute('aria-describedby', 'fo-merge-help');
    await expect(page.locator('#fo-tool-root .fo-merge__n').first()).toHaveAttribute('aria-hidden', 'true');
  });
}

/** From now on, when the WaterLevel first shows and when the Merge button first shows, in ms after the call. */
async function watchReading(page: Page): Promise<void> {
  await page.evaluate(() => {
    const start = performance.now();
    const seen: { level: number | null; ready: number | null; panel: { rows: number; hold: string; count: string } | null } = { level: null, ready: null, panel: null };
    (window as unknown as { __reading: typeof seen }).__reading = seen;
    const look = () => {
      if (seen.level === null && document.querySelector('#fo-tool-root .fo-level')) seen.level = performance.now() - start;
      if (seen.ready === null && document.querySelector('#fo-tool-root .fo-merge-panel .fo-btn--brand')) seen.ready = performance.now() - start;
      // The last picture of the reading panel before the WaterLevel takes its place: a test that read it live raced the
      // 400 ms on a busy machine (the panel was gone by the time the assertion ran).
      const panel = document.querySelector('#fo-tool-root .fo-merge-panel[data-state="reading"]');
      if (panel && seen.level === null) {
        seen.panel = {
          rows: panel.querySelectorAll('.fo-merge__row').length,
          hold: panel.querySelector('.fo-merge__hold')?.textContent?.trim() ?? '',
          count: panel.querySelector('.fo-count')?.textContent?.trim() ?? '',
        };
      }
    };
    new MutationObserver(look).observe(document.getElementById('fo-tool-root') as Node, { childList: true, subtree: true, attributes: true });
  });
}
const reading = (page: Page) => page.evaluate(() => (window as unknown as { __reading: { level: number | null; ready: number | null; panel: { rows: number; hold: string; count: string } | null } }).__reading);

test('D-27: a reading under 400 ms never shows the WaterLevel; the list shows at once, with Reading and the line in the place of Merge', async ({ page }) => {
  await openTool(page, '/merge-pdf/');
  // A first round loads the engine, so the second reading is the one of the files alone.
  await choosePdfs(page, TWO());
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
  await page.locator('#fo-tool-root .fo-merge__restart').click();
  await watchReading(page);
  await choosePdfs(page, TWO());
  // The rectangle is the list from the first frame: the count says it reads, and the rows say "Reading…".
  await expect(page.locator('#fo-tool-root .fo-merge-panel')).toBeVisible();
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
  const times = await reading(page);
  console.log(`[D-27] Merge button after ${times.ready?.toFixed(0)} ms; WaterLevel ${times.level === null ? 'never' : `after ${times.level.toFixed(0)} ms`}`);
  // The WaterLevel never before 400 ms; and a reading done before that has none at all.
  if (times.level !== null) expect(times.level).toBeGreaterThanOrEqual(395);
  if ((times.ready ?? Infinity) < 395) expect(times.level).toBeNull();
  expect(times.ready, 'the reading of two small files, with the engine loaded').toBeLessThan(400);
});

test('D-27: a reading held past 400 ms (the CPU 6 times slower) shows the WaterLevel only after 400 ms', async ({ page, browserName }) => {
  const held = await slowEngine(page);
  await openTool(page, '/merge-pdf/');
  if (browserName === 'chromium') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  }
  await watchReading(page);
  await choosePdfs(page, TWO());
  await expect(page.locator('#fo-tool-root .fo-level')).toBeVisible({ timeout: 10_000 });
  const times = await reading(page);
  // What the reading showed in its 400 ms, read from the observer of the page (DECISOES § 512).
  expect(times.panel, 'the reading panel showed before the WaterLevel').toEqual({
    rows: 2,
    hold: PDF_PANEL_TEXTS.en.progress.reading,
    count: fmt(PDF_PANEL_TEXTS.en.queue.readingCount, { count: 2 }),
  });
  console.log(`[D-27] WaterLevel after ${times.level?.toFixed(0)} ms (${browserName})`);
  expect(times.level).toBeGreaterThanOrEqual(395);
  held.release();
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
});

// UX-04 A: the rectangle of every PDF tool is 356 px on the phone and 340 px from 768 px at rest, with a file over it and in
// the error, in the three languages (with the round seal of the ficha, § 456; DECISOES § 478).
for (const viewport of [PHONE, { width: 1280, height: 800 }]) {
  test(`the rectangle of the PDF tools has one height at rest, with a file over it and in the error, at ${viewport.width} px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize(viewport);
    const wanted = viewport.width < 768 ? 356 : 340;
    const wrong: string[] = [];
    for (const lang of LANGS) {
      for (const id of PDF_TOOL_IDS) {
        expect((await page.goto(routeById(id).paths[lang] ?? ''))?.status()).toBe(200);
        await hydrated(page);
        const slot = page.locator('#fo-tool-root .fo-slot');
        const rest = (await slot.boundingBox())?.height ?? 0;
        await dragOver(page);
        const over = (await slot.boundingBox())?.height ?? 0;
        for (const [state, height] of [['rest', rest], ['over', over]] as const) if (Math.abs(height - wanted) > 1) wrong.push(`${lang}/${id} ${state}: ${height}`);
        if (id === 'split-pdf') {
          await page.locator('#fo-tool-root .fo-drop').dispatchEvent('dragleave');
          await choosePdfs(page, [{ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf at all') }]);
          await expect(page.locator('#fo-tool-root .fo-drop[data-state="error"]')).toBeVisible({ timeout: 30_000 });
          const error = (await slot.boundingBox())?.height ?? 0;
          if (Math.abs(error - wanted) > 1) wrong.push(`${lang}/${id} error: ${error}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });
}

test('the rectangle keeps the height of the list from the reading to the result, and the island keeps its height at the result', async ({ page }) => {
  await consent(page, 'denied');
  await page.setViewportSize(PHONE);
  await open(page);
  const slot = page.locator('#fo-tool-root .fo-slot');
  expect(Math.abs(((await slot.boundingBox())?.height ?? 0) - 356), 'at rest').toBeLessThanOrEqual(1);
  await choosePdfs(page, TWO());
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
  const list = (await slot.boundingBox())?.height ?? 0;
  expect(list).toBeGreaterThan(356);
  // Every height the rectangle and the island take from the press to the result.
  await page.evaluate(() => {
    const slot = document.querySelector('#fo-tool-root .fo-slot') as HTMLElement;
    const island = document.querySelector('#fo-tool-root .fo-tool-island') as HTMLElement;
    const log: { slot: number; island: number; level: boolean; result: boolean }[] = [];
    (window as unknown as { __heights: typeof log }).__heights = log;
    const note = () => log.push({ slot: slot.getBoundingClientRect().height, island: island.getBoundingClientRect().height, level: Boolean(slot.querySelector('.fo-level')), result: Boolean(slot.querySelector('.fo-result')) });
    note();
    new ResizeObserver(note).observe(slot);
    new ResizeObserver(note).observe(island);
    new MutationObserver(note).observe(slot, { childList: true });
  });
  const island = (await page.locator('#fo-tool-root .fo-tool-island').boundingBox())?.height ?? 0;
  await mergeButton(page).click();
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(300);
  const heights = await page.evaluate(() => (window as unknown as { __heights: { slot: number; island: number; level: boolean; result: boolean }[] }).__heights);
  for (const entry of heights.filter((height) => !height.result)) expect(Math.abs(entry.slot - list), `the rectangle before the result: ${JSON.stringify(entry)}`).toBeLessThanOrEqual(1);
  for (const entry of heights) expect(Math.abs(entry.island - island), `the island: ${JSON.stringify(entry)}`).toBeLessThanOrEqual(1);
  // The result is the rectangle of its own height again, the band under it takes the room the list left.
  expect(Math.abs(((await slot.boundingBox())?.height ?? 0) - 356), 'with the result').toBeLessThanOrEqual(1);
});

for (const lang of LANGS) {
  test(`the chips are 400 px or less under the Download at 360 px, with the closed Order after them (${lang})`, async ({ page }) => {
    await consent(page, 'denied');
    await page.setViewportSize(PHONE);
    await open(page, lang);
    await choosePdfs(page, TWO());
    await mergeButton(page, lang).click({ timeout: 30_000 });
    const download = page.locator('#fo-tool-root .fo-btn--download');
    await expect(download).toBeVisible({ timeout: 30_000 });
    await expect(download).toBeFocused();
    const [button, chips, order] = await Promise.all([download.boundingBox(), page.locator('#fo-tool-root .fo-band .fo-next').boundingBox(), page.locator('#fo-tool-root .fo-merge__order').boundingBox()]);
    const gap = (chips?.y ?? Infinity) - ((button?.y ?? 0) + (button?.height ?? 0));
    console.log(`[chips] ${lang}: ${gap.toFixed(0)} px under the Download`);
    expect(gap).toBeLessThanOrEqual(400);
    expect(order?.y ?? 0).toBeGreaterThan((chips?.y ?? 0) + (chips?.height ?? 0) - 1);
    await expect(page.locator('#fo-tool-root .fo-merge__order')).not.toHaveAttribute('open', '');
    await expect(page.locator('#fo-tool-root .fo-merge__order summary')).toContainText(fmt(mergeTexts(lang).options.order, { count: 2 }));
  });
}

test('after the result, a change of the order under "Order" merges again at once, with the result on screen', async ({ page }) => {
  const q = PDF_PANEL_TEXTS.en.queue;
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, TWO());
  await mergeButton(page).click({ timeout: 30_000 });
  const download = page.locator('#fo-tool-root .fo-btn--download');
  await expect(download).toBeVisible({ timeout: 30_000 });
  const first = await download.getAttribute('href');
  await page.locator('#fo-tool-root .fo-merge__order summary').click();
  await page.getByRole('button', { name: fmt(q.moveEarlier, { name: 'scan.pdf' }), exact: true }).click();
  await expect(download).not.toHaveAttribute('href', first ?? '', { timeout: 30_000 });
  await expect(download).toHaveAttribute('download', 'scan-merged.pdf');
  await expect(page.locator('#fo-tool-root .fo-merge__order')).toHaveAttribute('open', '');
});

/** The sum of the layout shifts with no recent input, from now on (Chromium; the observer is opened at load). */
async function openShifts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    (window as unknown as { __shifts: unknown[] }).__shifts = [];
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Node | null }[] })[]) {
        if (entry.hadRecentInput || !(window as unknown as { __measure?: boolean }).__measure) continue;
        (window as unknown as { __cls: number }).__cls += entry.value;
        (window as unknown as { __shifts: unknown[] }).__shifts.push({ value: entry.value, at: Math.round(entry.startTime), nodes: (entry.sources ?? []).map((source) => (source.node instanceof Element ? source.node.className : String(source.node?.nodeName))) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

for (const use of ['1st', '3rd'] as const) {
  test(`the CLS of the interaction stays at 0.05 or less at 360 × 740, ${use} use${use === '3rd' ? ', with the coffee line' : ''}`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'the layout-shift API is only in Chromium');
    await consent(page, use === '3rd' ? 'granted' : 'denied', use === '3rd' ? 2 : 0);
    await openShifts(page);
    await page.setViewportSize(PHONE);
    await open(page);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.evaluate(() => ((window as unknown as { __measure: boolean }).__measure = true));
    await choosePdfs(page, TWO());
    await mergeButton(page).click({ timeout: 30_000 });
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 30_000 });
    if (use === '3rd') await expect(page.locator('#fo-tool-root .fo-result__support')).toBeVisible();
    await page.waitForTimeout(1_500);
    const [cls, shifts] = await page.evaluate(() => [(window as unknown as { __cls: number }).__cls, (window as unknown as { __shifts: unknown[] }).__shifts] as const);
    console.log(`[CLS] merge ${use} use: ${cls.toFixed(4)} ${JSON.stringify(shifts)}`);
    expect(cls).toBeLessThanOrEqual(0.05);
  });
}

// F13a (DECISOES § 495): the PDF tools that run by themselves, from the drop to the Download and 1.5 s more, in the 1st use
// and in the 3rd (the coffee line). The file picker is no recent input, so what the drop moves counts: before, the drop
// turned the DropZone's node into the reading card (0.035) and, on the 3rd use, grew the rectangle (0.232).
for (const use of ['1st', '3rd'] as const) {
  test(`the PDF tools that run by themselves move nothing from the drop to the result at 360 × 740, ${use} use`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'the layout-shift API is only in Chromium');
    test.slow();
    await consent(page, use === '3rd' ? 'granted' : 'denied', use === '3rd' ? 2 : 0);
    await openShifts(page);
    await page.setViewportSize(PHONE);
    const found: string[] = [];
    for (const [id, file] of [['compress-pdf', 'gen-fotos.pdf'], ['rotate-pdf', 'gen-paginas-mistas.pdf'], ['pdf-to-jpg', 'gen-fotos.pdf'], ['add-page-numbers-to-pdf', 'gen-paginas-mistas.pdf']] as const) {
      // A use of its own per tool: the coffee count of the 3rd use is set once per tab (sessionStorage), so a new page each time.
      await page.evaluate(() => sessionStorage.removeItem('fo-test-coffee')).catch(() => {});
      expect((await page.goto(routeById(id).paths.en ?? '/'))?.status()).toBe(200);
      await hydrated(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await page.evaluate(() => ((window as unknown as { __measure: boolean }).__measure = true));
      await choosePdfs(page, [pdfFile(file)]);
      await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
      if (use === '3rd') await expect(page.locator('#fo-tool-root .fo-result__support')).toBeVisible();
      await page.waitForTimeout(1_500);
      const [cls, shifts] = await page.evaluate(() => [(window as unknown as { __cls: number }).__cls, (window as unknown as { __shifts: unknown[] }).__shifts] as const);
      console.log(`[CLS] ${id} ${use} use: ${cls.toFixed(4)} ${JSON.stringify(shifts)}`);
      if (cls > 0.05) found.push(`${id}: ${cls.toFixed(3)}`);
    }
    expect(found).toEqual([]);
  });
}

// The reading list for axe: the WaterLevel of the reading comes at 400 ms, before axe ends, so the test holds the timer of
// 400 ms of the page (and only it) while axe reads the list; the engine is held too, so the files stay "Reading…".
test('axe: the Merge list while the files are read, at 360 and 1280 px in both themes', async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    const real = window.setTimeout.bind(window);
    const held: (() => void)[] = [];
    (window as unknown as { __releaseLevel: () => void }).__releaseLevel = () => held.splice(0).forEach((call) => call());
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...rest: unknown[]) => {
      if (timeout === 400 && typeof handler === 'function' && (window as unknown as { __holdLevel?: boolean }).__holdLevel) {
        held.push(() => (handler as (...args: unknown[]) => void)(...rest));
        return 0;
      }
      return real(handler, timeout, ...rest);
    }) as typeof window.setTimeout;
  });
  const held = await slowEngine(page);
  await openTool(page, '/merge-pdf/');
  await page.evaluate(() => ((window as unknown as { __holdLevel: boolean }).__holdLevel = true));
  await choosePdfs(page, TWO());
  await expect(page.locator('#fo-tool-root .fo-merge-panel[data-state="reading"] .fo-merge__row')).toHaveCount(2);
  expect(await violationsEverywhere(page)).toEqual([]);
  await expect(page.locator('#fo-tool-root .fo-level')).toHaveCount(0);
  held.release();
  await expect(mergeButton(page)).toBeVisible({ timeout: 30_000 });
});
