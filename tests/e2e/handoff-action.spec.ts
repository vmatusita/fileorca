// F15 · the chip that takes the file to a tool that waits for an action (decision 6 and criterion 4 of the run; DECISOES
// § 653 to § 655, which replace the "only link" of § 497 for these tools). With a service worker in control, a plain click
// on "Merge these 2 PDFs", "Split this PDF", "Reorder the pages of this PDF" or "Protect this PDF with a password" puts the
// PDFs in the inbox of the device and goes to the tool, which takes them the way of a drop: they wait for the action, and
// nothing runs by itself. The focus goes where a drop leaves it (the action; in Merge with one PDF, nowhere new), the region
// of the island says where they came from once (counted with a MutationObserver from the load of the page to the result),
// and the action gives the result with the note of where they came from. Protect PDF takes nothing along (its PDF needs a
// password). Image to PDF takes its PDF to Compress PDF (which runs by itself) and to Merge PDF, where a PDF added to the
// list makes it another batch, and the note goes. Nothing leaves the device on the way, and the empty box is there too.
//
// The default of the Playwright config blocks service workers: this spec allows them, with a server of its own per test (a
// clean origin), as handoff.spec.ts does. Its name puts it right before handoff.spec.ts (DECISOES § 663).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { INBOX_CACHE, INBOX_TOOL_KEY } from '../../src/sw/shared.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { fmt } from '../../src/i18n/format.ts';
import common from '../../src/i18n/en/common.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import splitTexts from '../../src/tools/split-pdf/i18n/en.ts';
import protectTexts from '../../src/tools/protect-pdf/i18n/en.ts';
import reorderTexts from '../../src/tools/reorder-pdf-pages/i18n/en.ts';
import { dataLayer, generatedJpeg, hydrated } from './lib/page.ts';
import { arriveFrom } from './lib/inbox.ts';
import { actionOf } from './lib/pdf-privacy.ts';
import { pdfFile } from './lib/pdf-tools.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';
import { brokenRequests, holds, leaksIn, requestText, SENTINELS, type SeenRequest } from './lib/sentinels.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { controlled, visit, workerOff } from './lib/sw.ts';

test.use({ serviceWorkers: 'allow' });

let server: SwServer;
test.beforeEach(async () => {
  server = await startSwServer();
});
test.afterEach(async () => {
  await server.close();
});

const pdfTexts = PDF_PANEL_TEXTS.en;
const chipOf = (page: Page, path: string) => page.locator(`nav.fo-next a.fo-chip[href="${path}"]`);
const region = (page: Page) => page.locator('#fo-tool-root .fo-tool-island > p.fo-sr[role="status"]');
const fromOne = (tool: string) => fmt(pdfTexts.carry.from, { tool });
const fromMany = (tool: string, count: number) => fmt(pdfTexts.carry.fromMany, { tool, count });

const inboxState = (page: Page) =>
  page.evaluate(async ([name, key]) => ({ inbox: await caches.has(name), choice: sessionStorage.getItem(key) }), [INBOX_CACHE, INBOX_TOOL_KEY] as const);

/**
 * Every text the region of the island says on each page of this tab, from the first parse (an init script: the arrival
 * happens in the effect of the mount, before any test line runs). Empty texts are the clearing before a sentence.
 */
async function recordRegion(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const said: string[] = [];
    (window as unknown as { __said: string[] }).__said = said;
    let last = '';
    const read = () => {
      const text = document.querySelector('#fo-tool-root .fo-tool-island > p.fo-sr[role="status"]')?.textContent ?? '';
      if (text === last) return;
      last = text;
      if (text) said.push(text);
    };
    new MutationObserver(read).observe(document, { subtree: true, childList: true, characterData: true });
  });
}
const saidSoFar = (page: Page) => page.evaluate(() => [...(window as unknown as { __said: string[] }).__said]);
/** How many times the region said `sentence`, alone or in a longer line. */
const timesSaid = async (page: Page, sentence: string) => (await saidSoFar(page)).filter((text) => text.includes(sentence)).length;

/** Opens the site under the worker: the next pages of the tab are controlled. */
async function underTheWorker(page: Page, width = 1280): Promise<void> {
  await page.setViewportSize({ width, height: 800 });
  await visit(page, server, '/', { island: false });
  await controlled(page);
}

/** A tool of PDF run on `files`, up to its result with the focus on Download (the ones with an action get `act`). */
async function resultOf(page: Page, path: string, files: Parameters<Page['setInputFiles']>[1], act?: (page: Page) => Promise<void>): Promise<void> {
  await visit(page, server, path);
  await page.setInputFiles('#fo-tool-root input[type="file"]', files);
  if (act) await act(page);
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
}

/**
 * The arrival at a tool with an action: the files wait for it. Nothing ran (no result, no Download, no tool_complete: only
 * the tool_start of a drop), and the region said where they came from once.
 */
async function waiting(page: Page, path: string, sentence: string): Promise<void> {
  await page.waitForURL(`**${path}`);
  await hydrated(page);
  await expect.poll(() => timesSaid(page, sentence), { timeout: 30_000, message: 'the region says where the files came from' }).toBe(1);
  // Long enough for a run that started by itself to show (the PDFs here take well under a second on this machine).
  await page.waitForTimeout(1_500);
  await expect(page.locator('#fo-tool-root .fo-result')).toHaveCount(0);
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toHaveCount(0);
  const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => entry[1]);
  expect(events, 'the arrival is a drop, and nothing ran').toContain('tool_start');
  expect(events, 'nothing ran').not.toContain('tool_complete');
  expect(await timesSaid(page, sentence), 'said once').toBe(1);
}

/** The action gave its result: the note of where the files came from on the card, and the region does not say it again. */
async function gave(page: Page, sentence: string, done: string): Promise<void> {
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  await expect(page.locator('.fo-result__notes > li').first()).toHaveClass(/fo-result__from/);
  await expect(page.locator('.fo-result__from')).toHaveText(sentence);
  await expect(region(page)).toHaveText(done);
  expect(await timesSaid(page, sentence), 'the result does not say where the files came from again').toBe(1);
  expect(await inboxState(page), 'the inbox and the note are gone').toEqual({ inbox: false, choice: null });
}

const TWO_PDFS = [pdfFile('gen-paginas-mistas.pdf', 'first.pdf'), pdfFile('gen-acoes.pdf', 'second.pdf')];
const PASSWORD = 'orca-1234';

test('Compress PDF, then "Merge these 2 PDFs": the two PDFs wait in the Merge list, and Merge gives the PDF with the note', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await recordRegion(page);
  await underTheWorker(page);
  await resultOf(page, '/compress-pdf/', TWO_PDFS);
  const merge = chipOf(page, '/merge-pdf/');
  await expect(merge).toHaveAttribute('data-carry', '');
  await expect(merge).toHaveText(fmt(pdfTexts.carry.chips['merge-pdf'].many, { count: 2 }));
  await expect(chipOf(page, '/protect-pdf/')).toHaveText(fmt(pdfTexts.carry.chips['protect-pdf'].many, { count: 2 }));
  await expect(page.locator('.fo-band .fo-carry:not(.fo-next--kept)')).toHaveText(pdfTexts.carry.lineMany);
  await merge.click();
  const sentence = fromMany(common.pdf['compress-pdf'].name, 2);
  await waiting(page, '/merge-pdf/', sentence);
  await expect(page.locator('#fo-tool-root .fo-merge .fo-filelist__row')).toHaveCount(2);
  await expect(page.locator('#fo-tool-root .fo-count')).toContainText(fmt(pdfTexts.queue.ready, { count: 2 }));
  // A drop on a page just opened leaves the focus on nothing, so it goes to the Merge button (D-27).
  const action = page.locator('#fo-tool-root .fo-merge-panel .fo-btn--brand');
  await expect(action).toHaveText(actionOf(mergeTexts));
  await expect(action).toBeFocused();
  await action.click();
  await gave(page, sentence, fmt(mergeTexts.panel.doneMany, { count: 2 }));
});

test('Image to PDF takes its PDF to Compress PDF, which runs by itself and says where it came from', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await recordRegion(page);
  await underTheWorker(page);
  await visit(page, server, '/image-to-pdf/');
  await page.setInputFiles('#fo-tool-root input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  const image = IMAGE_PANEL_TEXTS.en.carry;
  const chips = page.locator('nav.fo-next a.fo-chip');
  await expect(chips).toHaveText([image.chips['compress-pdf'].one, image.chips['merge-pdf'].one, image.chips['add-page-numbers-to-pdf'].one]);
  for (const chip of await chips.all()) await expect(chip).toHaveAttribute('data-carry', '');
  await expect(page.locator('.fo-band__now .fo-carry')).toHaveText(image.linePdf);
  await chipOf(page, '/compress-pdf/').click();
  await page.waitForURL('**/compress-pdf/');
  await hydrated(page);
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  const sentence = fromOne(common.tools['image-to-pdf'].name);
  await expect(page.locator('.fo-result__from')).toHaveText(sentence);
  await expect(region(page)).toContainText(sentence);
  expect(await timesSaid(page, sentence)).toBe(1);
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
});

// F15 (DECISOES § 667): after the result, a move makes only the PDF again, and until it is ready the PDF in the model is the
// one of the old order. A chip pressed in that time waits and takes the new PDF, as the Download does. The move and the press
// go in the same task of the page (the press comes before the render of the move); Compress PDF, which runs by itself, gives
// the PDF that came, and its pages (each photo has its own size) are in the new order.
test('Image to PDF: a chip pressed while the PDF is made again after a move takes the PDF in the new order', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await underTheWorker(page);
  await visit(page, server, '/image-to-pdf/');
  const photo = (name: string, mimeType: string) => ({ name, mimeType, buffer: readFileSync(resolve('fixtures/images', name)) });
  // 1600 × 1200, 800 × 600 and 1200 × 1600 (Orientation 6): with "Image size", the size of a page says which photo it is.
  await page.setInputFiles('#fo-tool-root input[type="file"]', [
    photo('gen-webp-exif-gps.webp', 'image/webp'),
    photo('gen-png-transparente.png', 'image/png'),
    photo('gen-jpg-01-orientacao6.jpg', 'image/jpeg'),
  ]);
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  await expect(chipOf(page, '/compress-pdf/')).toHaveAttribute('data-carry', '');
  const pressed = await page.evaluate((label) => {
    const arrow = [...document.querySelectorAll<HTMLButtonElement>('#fo-tool-root .fo-filelist__move')].find((control) => control.getAttribute('aria-label') === label);
    arrow?.click();
    document.querySelector<HTMLAnchorElement>('nav.fo-next a.fo-chip[href="/compress-pdf/"]')?.click();
    return { moved: arrow !== undefined, at: location.pathname };
  }, fmt(IMAGE_PANEL_TEXTS.en.queue.moveEarlier, { name: 'gen-jpg-01-orientacao6.jpg' }));
  expect(pressed, 'the arrow was there, and the press did not go at once').toEqual({ moved: true, at: '/image-to-pdf/' });
  await page.waitForURL('**/compress-pdf/');
  await hydrated(page);
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  const pending = page.waitForEvent('download');
  await page.locator('.fo-result .fo-btn--download').click();
  const read = await readWithPdfjs(new Uint8Array(readFileSync(await (await pending).path())));
  expect(read.pages.map((sheet) => `${Math.round(sheet.shown.width)}x${Math.round(sheet.shown.height)}`), 'the PDF that came is the one of the new order').toEqual(['1600x1200', '1200x1600', '800x600']);
});

test('Image to PDF takes its PDF to Merge PDF: one PDF waits for another, and a PDF added makes it another batch, with no note', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await recordRegion(page);
  await underTheWorker(page);
  await visit(page, server, '/image-to-pdf/');
  await page.setInputFiles('#fo-tool-root input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  const merge = chipOf(page, '/merge-pdf/');
  await expect(merge).toHaveText(IMAGE_PANEL_TEXTS.en.carry.chips['merge-pdf'].one);
  await merge.click();
  const sentence = fromOne(common.tools['image-to-pdf'].name);
  await waiting(page, '/merge-pdf/', sentence);
  await expect(page.locator('#fo-tool-root .fo-merge .fo-filelist__row')).toHaveCount(1);
  // One PDF in Merge: the line of today, that one more is needed, in the place of the button; a drop leaves the focus where it was.
  await expect(page.locator('#fo-tool-root .fo-merge__hold--need')).toHaveText(mergeTexts.panel.options.needMore ?? '');
  await expect(page.locator('#fo-tool-root .fo-merge-panel .fo-btn--brand')).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement === document.body), 'the focus stays where a drop leaves it').toBe(true);
  // Another PDF in the list: another batch than the one that came, so the result has no note.
  await page.setInputFiles('#fo-tool-root input[type="file"]', pdfFile('gen-acoes.pdf', 'second.pdf'));
  const action = page.locator('#fo-tool-root .fo-merge-panel .fo-btn--brand');
  await expect(action).toBeVisible({ timeout: 30_000 });
  await action.click();
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  await expect(page.locator('.fo-result__from')).toHaveCount(0);
  expect(await timesSaid(page, sentence)).toBe(1);
});

// DECISOES § 655 and § 673: in Merge, a PDF taken out of the list that came makes it another batch (the note goes), and Undo
// gives the list that came back, with its note. The PDFs are written in the inbox as a chip writes them (lib/inbox.ts).
test('Merge PDF: a PDF taken out of the list a chip brought takes the note away, and Undo gives it back', async ({ page }) => {
  if (await workerOff(page, server)) return;
  const three = [pdfFile('gen-paginas-mistas.pdf', 'a.pdf'), pdfFile('gen-acoes.pdf', 'b.pdf'), pdfFile('gen-ja-otimizado.pdf', 'c.pdf')];
  const note = fromMany(common.pdf['compress-pdf'].name, 3);
  const action = page.locator('#fo-tool-root .fo-merge-panel .fo-btn--brand');
  const queue = PDF_PANEL_TEXTS.en.queue;
  for (const undo of [true, false]) {
    await visit(page, server, '/merge-pdf/');
    await arriveFrom(page, 'merge-pdf', 'compress-pdf', three);
    await expect(region(page)).toHaveText(note, { timeout: 30_000 });
    await expect(action).toBeVisible();
    await page.getByRole('button', { name: fmt(queue.remove, { name: 'c.pdf' }), exact: true }).click();
    if (undo) await page.getByRole('button', { name: queue.undo, exact: true }).click();
    await expect(page.locator('#fo-tool-root .fo-merge .fo-filelist__row')).toHaveCount(undo ? 3 : 2);
    await action.click();
    await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
    if (undo) await expect(page.locator('.fo-result__from'), 'Undo: the list that came, with its note').toHaveText(note);
    else await expect(page.locator('.fo-result__from'), 'a PDF out: another batch, with no note').toHaveCount(0);
  }
});

test('Unlock PDF, then "Split this PDF": the PDF waits in Split for the button, and Split gives the parts with the note', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await recordRegion(page);
  await underTheWorker(page);
  // An owner password only (fixtures/pdf/expected.json): Unlock PDF runs by itself, with nothing to type.
  await resultOf(page, '/unlock-pdf/', pdfFile('gen-cifrado-dono.pdf', 'locked.pdf'));
  const split = chipOf(page, '/split-pdf/');
  await expect(split).toHaveAttribute('data-carry', '');
  await expect(split).toHaveText(pdfTexts.carry.chips['split-pdf'].one);
  await split.click();
  const sentence = fromOne(common.pdf['unlock-pdf'].name);
  await waiting(page, '/split-pdf/', sentence);
  await expect(region(page)).toHaveText(`${sentence} ${pdfTexts.queue.readyOne}`);
  const action = page.getByRole('button', { name: actionOf(splitTexts), exact: true });
  await expect(action).toBeFocused();
  await action.click();
  await gave(page, sentence, fmt(splitTexts.panel.doneMany, { count: 3 }));
});

test('Delete PDF pages, then "Reorder the pages of this PDF": the PDF waits in Reorder for the new order and the button', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await recordRegion(page);
  await underTheWorker(page);
  await resultOf(page, '/delete-pdf-pages/', pdfFile('gen-paginas-mistas.pdf', 'pages.pdf'), async (page) => {
    await page.getByLabel('Pick pages by number').fill('1');
    await page.getByRole('button', { name: 'Pick these' }).click();
    await page.getByRole('button', { name: /^Delete/ }).first().click();
  });
  const reorder = chipOf(page, '/reorder-pdf-pages/');
  await expect(reorder).toHaveAttribute('data-carry', '');
  await expect(reorder).toHaveText(pdfTexts.carry.chips['reorder-pdf-pages'].one);
  await reorder.click();
  const sentence = fromOne(common.pdf['delete-pdf-pages'].name);
  await waiting(page, '/reorder-pdf-pages/', sentence);
  await expect(page.locator('#fo-tool-root .fo-pages__grid > li')).toHaveCount(7, { timeout: 30_000 });
  const action = page.getByRole('button', { name: actionOf(reorderTexts), exact: true });
  await expect(action).toBeFocused();
  await page.getByRole('button', { name: reorderTexts.panel.options.reverse }).click();
  await action.click();
  await gave(page, sentence, reorderTexts.panel.done);
});

test('Compress PDF, then "Protect this PDF with a password": the PDF waits for the password, and Protect PDF takes nothing along', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await recordRegion(page);
  await underTheWorker(page);
  await resultOf(page, '/compress-pdf/', pdfFile('gen-paginas-mistas.pdf', 'pages.pdf'));
  const protect = chipOf(page, '/protect-pdf/');
  await expect(protect).toHaveAttribute('data-carry', '');
  await expect(protect).toHaveText(pdfTexts.carry.chips['protect-pdf'].one);
  await protect.click();
  const sentence = fromOne(common.pdf['compress-pdf'].name);
  await waiting(page, '/protect-pdf/', sentence);
  await expect(region(page)).toHaveText(`${sentence} ${pdfTexts.queue.readyOne}`);
  // A drop on Protect PDF puts the focus on its button (nobody is typing yet); the fields of the password are under it.
  const action = page.getByRole('button', { name: actionOf(protectTexts), exact: true });
  await expect(action).toBeFocused();
  await page.getByLabel(protectTexts.panel.options.passwordLabel, { exact: true }).fill(PASSWORD);
  await page.getByLabel(protectTexts.panel.options.confirmLabel, { exact: true }).fill(PASSWORD);
  await action.click();
  await gave(page, sentence, protectTexts.panel.done);
  // Protect PDF: its PDF needs a password, so no chip of it takes it anywhere, and the line under them is not shown.
  await expect(page.locator('nav.fo-next a.fo-chip')).not.toHaveCount(0);
  await expect(page.locator('nav.fo-next a.fo-chip[data-carry]')).toHaveCount(0);
  await expect(page.locator('.fo-band .fo-carry:not(.fo-next--kept)')).toHaveCount(0);
});

test('nothing leaves the device on the way to a tool with an action: the requests, the tab, the caches and the events', async ({ page, context }) => {
  if (await workerOff(page, server)) return;
  const events: unknown[][] = [];
  page.on('console', (message) => {
    const text = message.text();
    if (text.startsWith('[dl] ')) events.push(JSON.parse(text.slice(5)) as unknown[]);
  });
  await page.addInitScript(() => {
    const layer: unknown[] = [];
    const push = Array.prototype.push;
    (layer as unknown as { push: (...items: unknown[]) => number }).push = function (this: unknown[], ...items: unknown[]) {
      for (const item of items) console.log(`[dl] ${JSON.stringify(Array.from(item as ArrayLike<unknown>))}`);
      return push.apply(this, items);
    };
    (window as unknown as { dataLayer: unknown[] }).dataLayer = layer;
  });
  await page.addInitScript(
    ([cache, key, tool]) => {
      // At the arrival, before the island takes the inbox: what the tab and the caches hold in transit.
      if (location.pathname !== `/${tool}/`) return;
      const seen: { choice: string | null; keys: string[]; entries: number } = { choice: sessionStorage.getItem(key), keys: [], entries: 0 };
      (window as unknown as { __transit: typeof seen; __read: Promise<void> }).__transit = seen;
      (window as unknown as { __read: Promise<void> }).__read = (async () => {
        for (const name of await caches.keys()) {
          seen.keys.push(name);
          const inbox = await caches.open(name);
          for (const request of await inbox.keys()) {
            seen.keys.push(request.url);
            if (name === cache) seen.entries += 1;
          }
        }
      })();
    },
    [INBOX_CACHE, INBOX_TOOL_KEY, 'protect-pdf'] as const,
  );
  await underTheWorker(page);
  const file = pdfFile('gen-paginas-mistas.pdf', `${SENTINELS.file}.pdf`);
  await resultOf(page, '/compress-pdf/', file);
  const seen: SeenRequest[] = [];
  context.on('request', (request) => {
    const body = request.postDataBuffer();
    seen.push({ method: request.method(), url: request.url(), headers: request.headers(), body: body ? body.toString('latin1') : '', bodyBytes: body?.length ?? 0 });
  });
  const before = events.length;
  await chipOf(page, '/protect-pdf/').click();
  await page.waitForURL('**/protect-pdf/');
  await hydrated(page);
  await expect(page.getByRole('button', { name: actionOf(protectTexts), exact: true })).toBeFocused({ timeout: 30_000 });

  const transit = await page.evaluate(async () => {
    const own = window as unknown as { __transit: { choice: string | null; keys: string[]; entries: number }; __read: Promise<void> };
    await own.__read;
    return own.__transit;
  });
  expect(JSON.parse(transit.choice ?? 'null'), 'the tab notes ids of pages only').toEqual({ tool: 'protect-pdf', order: [0], from: 'compress-pdf' });
  expect(transit.entries, 'the inbox was read in transit').toBe(1);
  for (const key of transit.keys) {
    expect(holds(key, SENTINELS.file), `a cache key holds the name: ${key}`).toBe(false);
    expect(key, key).not.toMatch(/[?#]/);
  }
  expect(brokenRequests(seen, server.origin), 'only a GET of the own origin, with no body and no query string').toEqual([]);
  expect(leaksIn(seen.map((request, i) => ({ where: `request ${i + 1} (${request.method} ${request.url.slice(0, 80)})`, text: requestText(request) }))), 'the name of the file').toEqual([]);
  const head = file.buffer.subarray(2_000, 2_064).toString('latin1');
  expect(seen.filter((request) => request.body.includes(head)), 'the bytes of the file').toEqual([]);
  expect(server.requests.filter((request) => request.method !== 'GET' && request.method !== 'HEAD'), 'the server saw only reads').toEqual([]);
  expect(server.requests.some((request) => holds(request.pathname, SENTINELS.file)), 'the server never saw the name').toBe(false);
  // The events: on the way out, the next_step_click of always; at the arrival, the tool_start of a drop and nothing else
  // (the file waits for the password). No event holds the name of the file.
  const after = events.slice(before).filter((entry) => entry[0] === 'event');
  expect(after.filter((entry) => entry[1] === 'next_step_click'), 'one next_step_click, the one of always').toEqual([['event', 'next_step_click', { tool: 'compress-pdf', lang: 'en', target: 'protect-pdf' }]]);
  expect(after.filter((entry) => entry[1] !== 'next_step_click'), 'the arrival is a drop, and nothing ran').toEqual([['event', 'tool_start', { tool: 'protect-pdf', lang: 'en' }]]);
  expect(leaksIn(events.map((entry, i) => ({ where: `event ${i + 1}`, text: JSON.stringify(entry) }))), 'an event holds the name').toEqual([]);
  expect(before, 'the page of the result counted its events').toBeGreaterThan(0);
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
});

test('the empty box in the tools with an action: a chip sent the PDF and none arrived', async ({ page }) => {
  if (await workerOff(page, server)) return;
  for (const kase of [
    { path: '/merge-pdf/', tool: 'merge-pdf', from: 'image-to-pdf', name: common.tools['image-to-pdf'].name, count: 1 },
    { path: '/split-pdf/', tool: 'split-pdf', from: 'unlock-pdf', name: common.pdf['unlock-pdf'].name, count: 1 },
    { path: '/reorder-pdf-pages/', tool: 'reorder-pdf-pages', from: 'delete-pdf-pages', name: common.pdf['delete-pdf-pages'].name, count: 1 },
    { path: '/protect-pdf/', tool: 'protect-pdf', from: 'sign-pdf', name: common.pdf['sign-pdf'].name, count: 2 },
  ]) {
    await visit(page, server, '/', { island: false });
    const order = Array.from({ length: kase.count }, (_, i) => i);
    await page.evaluate(([key, value]) => sessionStorage.setItem(key, value), [INBOX_TOOL_KEY, JSON.stringify({ tool: kase.tool, order, from: kase.from })] as const);
    await visit(page, server, kase.path);
    const box = page.locator('#fo-tool-root .fo-drop[data-state="lost"]');
    await expect(box, kase.path).toBeVisible();
    await expect(box.locator('[role="status"]')).toContainText(kase.count > 1 ? pdfTexts.carry.lostTitleMany : pdfTexts.carry.lostTitle);
    await expect(box.locator('[role="status"]')).toContainText(fmt(kase.count > 1 ? pdfTexts.carry.lostHelpMany : pdfTexts.carry.lostHelp, { tool: kase.name }));
    await expect(box.getByRole('button', { name: fmt(pdfTexts.carry.back, { tool: kase.name }), exact: true })).toBeVisible();
    await expect(page.locator('#fo-tool-root .fo-slot > .fo-slot__oli')).toHaveAttribute('data-oli', 'lost');
    expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
  }
});
