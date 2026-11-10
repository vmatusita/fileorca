import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt } from '../../src/i18n/format.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { dismissCookies, hydrated, jpegBatch, openAdjust } from './lib/page.ts';
import { imageIslandMessages, spyOnWorkers } from './lib/workers.ts';

// F16 · o foco no campo de número das imagens (item 8; F15 R-b-1; DECISOES § 692), in Chromium and WebKit.
//
// In a batch of three photos, after the result, Tab out of a number field of the options ("Maximum size" of Compress in "Up
// to a size", the width and the height of Resize, the height of the Crop box) commits the value on blur, and the batch is
// made again at once. The control the focus was going to (the first control of the first row: its Download, or the button
// that picks it in Compress and Crop) gave way in the render of that blur, before the focus landed, and the browser left
// the focus on the page. Now the focus is never on the page while the batch is made again (a sample at every animation
// frame and after every change of the island, once the task that made it is over), it ends on that control of the first
// row, Shift+Tab goes back to the field,
// and the batch was made once (one new bundle for the Download in both browsers; in Chromium, the messages to the image
// worker of one run, and none after Shift+Tab). WebKit leaves the field with Alt+Tab: its Tab skips the buttons (Safari's
// default; docs/claude/playwright.md).
//
// On the starting point (ee767e2) the samples are all the body and the focus ends there (the negative control in the
// report of the F16).

const q = IMAGE_PANEL_TEXTS.en.queue;
const root = (page: Page): Locator => page.locator('#fo-tool-root');
const download = (page: Page): Locator => root(page).locator('.fo-btn--download');
/** The bin of a row shows only on a ready row (F15): three bins, the batch is done; fewer, a row is being made again. */
const bins = (page: Page): Locator => root(page).locator('.fo-filelist__remove');
const firstRow = (page: Page): Locator => root(page).locator('.fo-filelist__row').first();
/** The button that picks the first photo for the comparison or the crop box (Compress and Crop). */
const pickFirst = (page: Page): Locator => firstRow(page).getByRole('button', { name: fmt(q.select, { name: 'photo-1.jpg' }), exact: true });
const downloadFirst = (page: Page): Locator => firstRow(page).getByRole('button', { name: fmt(q.download, { name: 'photo-1.jpg' }), exact: true });

interface Seen {
  /** Where the focus was, at every animation frame and after every change of the island: 'BODY' when the page had it. */
  samples: string[];
  /** How many new bundles the Download got. */
  bundles: number;
  /** When the field lost the focus, and when a row first gave way (its bin went), in ms of the page clock. */
  blurAt: number | null;
  swapAt: number | null;
}

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

/** Three photos in one batch, until every row is ready and the Download has the ZIP; then "Adjust" opens, as a person does. */
async function batchOfThree(page: Page): Promise<void> {
  await page.setInputFiles('input[type="file"]', await jpegBatch(page, 3));
  await expect(download(page)).toBeVisible({ timeout: 60_000 });
  await expect(bins(page), 'every row of the batch is ready').toHaveCount(3, { timeout: 60_000 });
  await openAdjust(page);
}

/** Starts the record of `Seen` in the page, for the field `selector`. */
async function watch(page: Page, selector: string): Promise<void> {
  await page.evaluate((field) => {
    const seen = { samples: [] as string[], bundles: 0, blurAt: null as number | null, swapAt: null as number | null, stop: false };
    (window as unknown as { __focusSeen: typeof seen }).__focusSeen = seen;
    const where = (): string => {
      const active = document.activeElement;
      if (!active || active === document.body || active === document.documentElement) return 'BODY';
      const row = active.closest<HTMLElement>('[data-row]');
      return `${active.tagName.toLowerCase()}${active.id ? `#${active.id}` : ''}${row ? ` in row ${row.dataset['row']}` : ''} "${active.getAttribute('aria-label') ?? ''}"`;
    };
    const island = document.querySelector('#fo-tool-root') as HTMLElement;
    let href = document.querySelector('#fo-tool-root .fo-btn--download')?.getAttribute('href') ?? '';
    document.addEventListener(
      'blur',
      (event) => {
        if (seen.blurAt === null && event.target === document.querySelector(field)) seen.blurAt = performance.now();
      },
      true,
    );
    // A sample inside the blur itself would see the body in every focus change, in both browsers (the page holds the focus
    // between the blur and the focus of the next control): after a change of the island, the sample waits for the task
    // that made it to end.
    const sample = () => {
      if (!seen.stop) seen.samples.push(where());
    };
    new MutationObserver(() => {
      if (seen.stop) return;
      window.setTimeout(sample, 0);
      if (seen.swapAt === null && island.querySelectorAll('.fo-filelist__remove').length < 3) seen.swapAt = performance.now();
      const now = island.querySelector('.fo-btn--download')?.getAttribute('href') ?? '';
      if (now && now !== href) {
        seen.bundles += 1;
        href = now;
      }
    }).observe(island, { subtree: true, childList: true, attributes: true, characterData: true });
    const frame = () => {
      if (seen.stop) return;
      sample();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, selector);
}

async function watched(page: Page): Promise<Seen> {
  return page.evaluate(() => {
    const seen = (window as unknown as { __focusSeen: Seen & { stop: boolean } }).__focusSeen;
    seen.stop = true;
    return { samples: seen.samples, bundles: seen.bundles, blurAt: seen.blurAt, swapAt: seen.swapAt };
  });
}

/**
 * Types `value` in the field and leaves it with `tab`; waits until the batch is made again (a new bundle for the Download,
 * every row ready) and a beat more, for a late render or a second run. Returns what the page saw, and the messages the
 * image worker got meanwhile.
 */
async function tabOut(page: Page, selector: string, value: string, tab: string): Promise<{ seen: Seen; messages: number }> {
  const field = page.locator(selector);
  const href = await download(page).getAttribute('href');
  const before = await imageIslandMessages(page);
  await field.focus();
  await watch(page, selector);
  await field.fill(value);
  await page.keyboard.press(tab);
  await expect(download(page), 'the batch was made again with the new value').not.toHaveAttribute('href', href ?? '', { timeout: 60_000 });
  await expect(bins(page), 'every row is ready again').toHaveCount(3, { timeout: 60_000 });
  await page.waitForTimeout(600);
  const seen = await watched(page);
  return { seen, messages: (await imageIslandMessages(page)).image - before.image };
}

/** The checks of one Tab out of the field, on what `tabOut` saw. */
function expectNeverOnThePage(seen: Seen, what: string): void {
  expect(seen.blurAt, `${what}: the Tab left the field`).not.toBeNull();
  // The value was taken by the blur, not by the pause after typing (500 ms): no row gave way before the Tab.
  expect(seen.swapAt === null || seen.swapAt >= (seen.blurAt ?? Infinity), `${what}: the batch was made again by the blur`).toBe(true);
  expect(seen.samples.length, `${what}: samples while the batch was made again`).toBeGreaterThan(2);
  expect(seen.samples.filter((sample) => sample === 'BODY'), `${what}: the page had the focus while the batch was made again`).toEqual([]);
  expect(seen.bundles, `${what}: the batch was made once (one new bundle)`).toBe(1);
}

/** Shift+Tab (Shift+Alt+Tab in WebKit) goes back to the field, with the value typed; nothing runs again. */
async function backToField(page: Page, selector: string, value: string, tab: string, browserName: string): Promise<void> {
  const href = await download(page).getAttribute('href');
  const before = await imageIslandMessages(page);
  await page.keyboard.press(`Shift+${tab}`);
  await expect(page.locator(selector), `Shift+${tab} goes back to ${selector}`).toBeFocused();
  await expect(page.locator(selector)).toHaveValue(value);
  await page.waitForTimeout(800);
  await expect(download(page), 'nothing ran again').toHaveAttribute('href', href ?? '');
  if (browserName === 'chromium') expect(await imageIslandMessages(page), 'no message to the workers after Shift+Tab').toEqual(before);
}

/**
 * Chromium: the messages of one run of the batch to the image worker (the photos and the ZIP, by Comlink). On the Windows
 * WebKit the photos are made on the page (docs/claude/imagem.md, F15), so the proof of one run there is the one new bundle.
 */
function expectOneRun(messages: number, first: number, browserName: string, what: string): void {
  console.log(`[mensagens] ${browserName} ${what}: fileorca-image +${messages} (a primeira execução: ${first})`);
  if (browserName === 'chromium') expect(messages, `${what}: the messages of one run to the image worker`).toBe(ONE_RUN);
}

/** Three photos and their ZIP, made again: one call per photo and one for the ZIP (measured; see expectOneRun). */
const ONE_RUN = 4;

test.beforeEach(async ({ page }) => {
  await spyOnWorkers(page);
});

test.describe('Tab out of a number field of the options, in a batch of three, after the result (item 8)', () => {
  test('Compress, "Up to a size": from "Maximum size" to the first row, never the page; Shift+Tab goes back', async ({ page, browserName }) => {
    test.setTimeout(120_000);
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    await open(page, '/compress-image/');
    await page.locator('.fo-seg__opt', { has: page.locator('input[name="ci-level"][value="size"]') }).click();
    await expect(page.locator('#ci-max')).toBeVisible();
    await batchOfThree(page);
    const first = (await imageIslandMessages(page)).image;
    const { seen, messages } = await tabOut(page, '#ci-max', '150', tab);
    expectNeverOnThePage(seen, '#ci-max');
    await expect(pickFirst(page), 'the focus ends on the control it was going to: the first row picks its photo').toBeFocused();
    expectOneRun(messages, first, browserName, 'Compress');
    await backToField(page, '#ci-max', '150', tab, browserName);
  });

  test('Resize: from the width to the height (a field that stays), then from the height to the first row, never the page', async ({ page, browserName }) => {
    test.setTimeout(150_000);
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    await open(page, '/resize-image/');
    await batchOfThree(page);
    const first = (await imageIslandMessages(page)).image;
    const width = Number(await page.locator('#rz-width').inputValue());
    const height = Number(await page.locator('#rz-height').inputValue());

    const wide = await tabOut(page, '#rz-width', String(width - 10), tab);
    expectNeverOnThePage(wide.seen, '#rz-width');
    await expect(page.locator('#rz-height'), 'the height field takes the focus and keeps it while the batch is made again').toBeFocused();
    expectOneRun(wide.messages, first, browserName, 'Resize, the width');
    await backToField(page, '#rz-width', String(width - 10), tab, browserName);

    const tall = await tabOut(page, '#rz-height', String(height - 10), tab);
    expectNeverOnThePage(tall.seen, '#rz-height');
    await expect(downloadFirst(page), 'the focus ends on the control it was going to: the Download of the first row').toBeFocused();
    expectOneRun(tall.messages, first, browserName, 'Resize, the height');
    await backToField(page, '#rz-height', String(height - 10), tab, browserName);
  });

  test('Crop: from the height of the box to the button that picks the first row, which is the one made again', async ({ page, browserName }) => {
    test.setTimeout(120_000);
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    await open(page, '/crop-image/');
    await batchOfThree(page);
    // The first row is the one picked at first: its box is on screen, and only it is made again.
    await expect(pickFirst(page)).toHaveAttribute('aria-pressed', 'true');
    const height = Number(await page.locator('#cr-height').inputValue());
    const { seen, messages } = await tabOut(page, '#cr-height', String(height - 10), tab);
    expectNeverOnThePage(seen, '#cr-height');
    await expect(pickFirst(page), 'the focus ends on the control it was going to').toBeFocused();
    console.log(`[mensagens] ${browserName} Crop: fileorca-image +${messages}`);
    if (browserName === 'chromium') expect(messages, 'Crop makes again only the picked photo, and the ZIP').toBe(2);
    await backToField(page, '#cr-height', String(height - 10), tab, browserName);
  });
});
