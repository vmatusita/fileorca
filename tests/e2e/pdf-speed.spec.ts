// What a PDF run costs the main thread (prompt F5a, criterion 9): while Merge, Split (every page to its own file),
// Compress (Lossless) and Add page numbers run on the 300 pages of fixtures/pdf/gen-paginas-300.pdf, no long task above
// 200 ms. The measure is made inside the page with a PerformanceObserver on 'longtask' (buffered), started before the
// file is dropped and read after the result shows; the tasks counted are the ones that start after the drop and before
// the result has been on screen for a beat. In Chromium the longest task is held to the limit; WebKit has no longtask
// entries, so it runs the same flow and prints the run time (the model of money-speed.spec.ts, branching inside the
// test: no skip). One page load and one batch per test; what came out is checked in Node, after the measure.
//
// A positive control comes first in every test: a busy loop of 260 ms on the main thread, before the drop, which the
// observer must report, so a limit that "passes" can not be an observer that sees nothing.
import { expect, test, type Page } from '@playwright/test';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import splitTexts from '../../src/tools/split-pdf/i18n/en.ts';
import compressTexts from '../../src/tools/compress-pdf/i18n/en.ts';
import { choosePdfs, filesOf, openTool, pdfFile, pdfOracle, takePdfDownload } from './lib/pdf-tools.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';

const LIMIT_MS = 200;
const FIXTURE = 'gen-paginas-300.pdf';
const ORIGINAL_BYTES = pdfFile(FIXTURE).buffer.length;
/** How long after the result shows a long task still counts (the tail of the render, the focus, the cookie notice). */
const TAIL_MS = 250;

interface Speed {
  tasks: { start: number; duration: number }[];
  observer: PerformanceObserver | null;
  drop: number;
  click: number;
  done: number;
}

const must = (text: string | undefined): string => {
  if (!text) throw new Error('the page has no such text');
  return text;
};

/** Starts the observer (and the marks of the click on the action button and of the result) in the page. */
async function watch(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const speed: Speed = { tasks: [], observer: null, drop: -1, click: -1, done: -1 };
    (window as unknown as { __speed: Speed }).__speed = speed;
    const supported = PerformanceObserver.supportedEntryTypes?.includes('longtask') === true;
    if (supported) {
      speed.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) speed.tasks.push({ start: entry.startTime, duration: entry.duration });
      });
      speed.observer.observe({ type: 'longtask', buffered: true });
    }
    document.addEventListener(
      'click',
      (event) => {
        if (speed.drop >= 0 && speed.click < 0 && (event.target as Element | null)?.closest?.('#fo-tool-root .fo-result__actions .fo-btn--brand')) speed.click = performance.now();
      },
      true,
    );
    new MutationObserver(() => {
      if (speed.drop >= 0 && speed.done < 0 && document.querySelector('#fo-tool-root .fo-btn--download')) speed.done = performance.now();
    }).observe(document.body, { childList: true, subtree: true });
    return supported;
  });
}

/**
 * The control: 260 ms of work on the main thread, which a working observer reports as a task of at least 250 ms. The
 * work runs in a timer task of the page: code that the protocol evaluates itself is not an event-loop task, and the
 * browser does not report it as a long one.
 */
async function control(page: Page): Promise<number> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.setTimeout(() => {
          const end = performance.now() + 260;
          while (performance.now() < end) {
            /* busy */
          }
          resolve();
        }, 0);
      }),
  );
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const speed = (window as unknown as { __speed: Speed }).__speed;
    for (const entry of speed.observer?.takeRecords() ?? []) speed.tasks.push({ start: entry.startTime, duration: entry.duration });
    return Math.max(0, ...speed.tasks.map((task) => task.duration));
  });
}

const markDrop = (page: Page) => page.evaluate(() => ((window as unknown as { __speed: Speed }).__speed.drop = performance.now()));

interface Measured {
  /** Longest long task in the window, in ms (0 when there was none), and how many there were. */
  longest: number;
  count: number;
  /** From the click on the action button (or from the drop, for a tool that runs by itself) to the result, in ms. */
  run: number;
}

/** Waits for the result, then reads the tasks of the window: after the drop, until the result has been there a beat. */
async function result(page: Page): Promise<Measured & { name: string }> {
  const link = page.locator('#fo-tool-root .fo-btn--download');
  await expect(link).toBeVisible({ timeout: 100_000 });
  await page.waitForTimeout(TAIL_MS + 100);
  const measured = await page.evaluate((tail) => {
    const speed = (window as unknown as { __speed: Speed }).__speed;
    for (const entry of speed.observer?.takeRecords() ?? []) speed.tasks.push({ start: entry.startTime, duration: entry.duration });
    const inside = speed.tasks.filter((task) => task.start >= speed.drop && task.start <= speed.done + tail);
    return {
      longest: Math.max(0, ...inside.map((task) => task.duration)),
      count: inside.length,
      run: speed.done - (speed.click >= 0 ? speed.click : speed.drop),
    };
  }, TAIL_MS);
  return { ...measured, name: (await link.getAttribute('download')) ?? '' };
}

function report(browser: string, tool: string, supported: boolean, measured: Measured): void {
  console.log(
    supported
      ? `[200 ms] ${browser} ${tool}: longest task ${measured.longest.toFixed(0)} ms (${measured.count} over 50 ms), run ${measured.run.toFixed(0)} ms`
      : `[200 ms] ${browser} ${tool}: no longtask entries in this browser, run ${measured.run.toFixed(0)} ms`,
  );
}

/** Chromium holds the longest task to the limit; WebKit has no entries to hold (and the observer says so). */
function hold(browser: string, supported: boolean, measured: Measured): void {
  expect(measured.run, 'the run ended').toBeGreaterThan(0);
  if (browser === 'chromium') {
    expect(supported, 'Chromium reports long tasks').toBe(true);
    expect(measured.longest, `the longest task of the run, ms (limit ${LIMIT_MS})`).toBeLessThanOrEqual(LIMIT_MS);
  } else {
    expect(measured.longest).toBeGreaterThanOrEqual(0);
  }
}

async function setUp(page: Page, path: string, browser: string): Promise<boolean> {
  await openTool(page, path);
  const supported = await watch(page);
  if (browser === 'chromium') expect(supported, 'Chromium reports long tasks').toBe(true);
  if (supported) expect(await control(page), 'the observer reports a 260 ms task').toBeGreaterThanOrEqual(250);
  return supported;
}

test.describe.configure({ timeout: 150_000 });

test('Merge PDF: two copies of the 300 pages, no main-thread task over 200 ms', async ({ page, browserName }) => {
  const supported = await setUp(page, '/merge-pdf/', browserName);
  await markDrop(page);
  await choosePdfs(page, [pdfFile(FIXTURE), pdfFile(FIXTURE, 'gen-paginas-300-again.pdf')]);
  await page.getByRole('button', { name: must(mergeTexts.panel.action) }).click();
  const measured = await result(page);
  report(browserName, 'merge-pdf', supported, measured);
  hold(browserName, supported, measured);
  // What came out: one file of 600 pages, in order.
  expect(measured.name).toBe('gen-paginas-300-merged.pdf');
  const [out] = filesOf(await takePdfDownload(page));
  const read = await readWithPdfjs(out?.bytes as Uint8Array);
  const markers = pdfOracle(FIXTURE).markers ?? [];
  expect(read.pages.map((p) => p.marker)).toEqual([...markers, ...markers]);
});

test('Split PDF: every one of the 300 pages to its own file, no main-thread task over 200 ms', async ({ page, browserName }) => {
  const supported = await setUp(page, '/split-pdf/', browserName);
  await markDrop(page);
  await choosePdfs(page, [pdfFile(FIXTURE)]);
  await page.getByRole('button', { name: must(splitTexts.panel.action) }).click();
  const measured = await result(page);
  report(browserName, 'split-pdf', supported, measured);
  hold(browserName, supported, measured);
  // What came out: a ZIP of 300 files, one page each.
  expect(measured.name).toBe('fileorca-pdfs.zip');
  const entries = filesOf(await takePdfDownload(page));
  expect(entries).toHaveLength(300);
  expect(entries[0]?.name).toBe('gen-paginas-300-page-1.pdf');
  expect(entries[299]?.name).toBe('gen-paginas-300-page-300.pdf');
});

test('Compress PDF (Lossless): the 300 pages, no main-thread task over 200 ms', async ({ page, browserName }) => {
  const supported = await setUp(page, '/compress-pdf/', browserName);
  await page.locator('.fo-seg__opt').filter({ hasText: compressTexts.panel.options.lossless }).first().click();
  await markDrop(page);
  await choosePdfs(page, [pdfFile(FIXTURE)]);
  const measured = await result(page);
  report(browserName, 'compress-pdf (lossless)', supported, measured);
  hold(browserName, supported, measured);
  // What came out: the 300 pages, in order, in a file that is not bigger.
  expect(measured.name).toBe('gen-paginas-300-compressed.pdf');
  const [out] = filesOf(await takePdfDownload(page));
  expect(out?.bytes.length).toBeLessThanOrEqual(ORIGINAL_BYTES);
  const read = await readWithPdfjs(out?.bytes as Uint8Array);
  expect(read.pages.map((p) => p.marker)).toEqual(pdfOracle(FIXTURE).markers);
});

test('Add page numbers: the 300 pages, no main-thread task over 200 ms', async ({ page, browserName }) => {
  const supported = await setUp(page, '/add-page-numbers-to-pdf/', browserName);
  await markDrop(page);
  await choosePdfs(page, [pdfFile(FIXTURE)]);
  const measured = await result(page);
  report(browserName, 'add-page-numbers-to-pdf', supported, measured);
  hold(browserName, supported, measured);
  // What came out: every page carries its number next to the marker.
  expect(measured.name).toBe('gen-paginas-300-numbered.pdf');
  const [out] = filesOf(await takePdfDownload(page));
  const read = await readWithPdfjs(out?.bytes as Uint8Array);
  expect(read.pages).toHaveLength(300);
  expect(read.pages.map((p) => p.texts.some((text) => text.str === '1' || /^\d+$/.test(text.str)))).not.toContain(false);
});
