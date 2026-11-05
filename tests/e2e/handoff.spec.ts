// F13a · UX-14, the chip that takes the result to the next tool (decision 7 and criterion 5 of the run; DECISOES § F13A-H-01
// to § F13A-H-05). With a service worker in control, a plain click on "Resize this image" puts the compressed file in the
// inbox of the device (the Cache Storage of the share, § 290), notes {tool, order, from} in the tab and goes to Resize
// image, which takes it the way of a drop: the result at once, with the note of where it came from, and the focus on
// Download. The inbox and the note are gone after the arrival. Nothing leaves the device: no request but a GET of the own
// origin, no byte and no name of the file on the network, ids only in the tab, no name in a cache key, and the dataLayer
// with the next_step_click of always. With the note and no inbox (a new worker deleted it, the hour passed, the site data
// was cleared) the tool says so: the empty box. A click with Ctrl, the middle button or a page with no worker only links.
//
// The default of the Playwright config blocks service workers (the chip only links there, as events.spec.ts proves): this
// spec allows them, with a server of its own per test (a clean origin), as share-target.spec.ts does (§ 307).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { INBOX_CACHE, INBOX_TOOL_KEY } from '../../src/sw/shared.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { fmt } from '../../src/i18n/format.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { animationsDone, hydrated } from './lib/page.ts';
import { pdfFile } from './lib/pdf-tools.ts';
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

const en = IMAGE_PANEL_TEXTS.en;
// jpg-01 is 3024 × 4032 (orientation 1, fixtures/images/expected.json): Resize at its default, half the size, makes 1512 × 2016.
const PHOTO = readFileSync(resolve('fixtures/images', 'jpg-01-pixel2-retrato-gps.jpg'));
const NAME = `${SENTINELS.file}.jpg`;

const inboxState = (page: Page) =>
  page.evaluate(async ([name, key]) => ({ inbox: await caches.has(name), choice: sessionStorage.getItem(key) }), [INBOX_CACHE, INBOX_TOOL_KEY] as const);

/** Compress image under the worker, with the photo: the result and its chips. */
async function compressed(page: Page, width = 1280): Promise<void> {
  await page.setViewportSize({ width, height: 800 });
  await visit(page, server, '/', { island: false });
  await controlled(page);
  await visit(page, server, '/compress-image/');
  await page.setInputFiles('#fo-tool-root input[type="file"]', { name: NAME, mimeType: 'image/jpeg', buffer: PHOTO });
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
}

/** The arrival on Resize image: the result of the photo, the note of where it came from, the focus on Download. */
async function arrived(page: Page): Promise<void> {
  await page.waitForURL('**/resize-image/');
  await hydrated(page);
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  const from = fmt(en.carry.from, { tool: 'Compress image' });
  await expect(page.locator('.fo-result__notes > li').first()).toHaveClass(/fo-result__from/);
  await expect(page.locator('.fo-result__from')).toHaveText(from);
  await expect(page.locator('.fo-result__notes')).toContainText('1512 × 2016 px');
  await expect(page.locator('#fo-tool-root p.fo-sr[role="status"]')).toHaveText(`Done! Your image is resized. ${from}`);
  await expect(page.locator('.fo-btn--download')).toHaveAttribute('download', NAME);
}

test('Compress image, then "Resize this image": Resize image shows the result at once and says where it came from', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await compressed(page);
  const chips = page.locator('nav.fo-next a.fo-chip');
  await expect(chips).toHaveText(['Resize this image', 'Turn this image into a PDF']);
  await expect(chips.first()).toHaveAttribute('data-carry', '');
  await expect(page.locator('.fo-band__now .fo-carry')).toHaveText(en.carry.line);
  await chips.first().click();
  await arrived(page);
  expect(await inboxState(page), 'the inbox and the note are gone').toEqual({ inbox: false, choice: null });
});

test('Enter on the chip takes the file along too: the click of the keyboard is the same plain click', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await compressed(page);
  const chip = page.locator('nav.fo-next a.fo-chip').first();
  await chip.focus();
  await page.keyboard.press('Enter');
  await arrived(page);
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
});

test('nothing leaves the device: the requests, the tab, the caches and the events', async ({ page, context }) => {
  if (await workerOff(page, server)) return;
  // Every event of both pages, as the page pushes it (the dataLayer of the first page goes with it).
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
    [INBOX_CACHE, INBOX_TOOL_KEY, 'resize-image'] as const,
  );
  await compressed(page);
  const seen: SeenRequest[] = [];
  context.on('request', (request) => {
    const body = request.postDataBuffer();
    seen.push({ method: request.method(), url: request.url(), headers: request.headers(), body: body ? body.toString('latin1') : '', bodyBytes: body?.length ?? 0 });
  });
  const before = events.length;
  await page.locator('nav.fo-next a.fo-chip').first().click();
  await arrived(page);

  const transit = await page.evaluate(async () => {
    const own = window as unknown as { __transit: { choice: string | null; keys: string[]; entries: number }; __read: Promise<void> };
    await own.__read;
    return own.__transit;
  });
  expect(JSON.parse(transit.choice ?? 'null'), 'the tab notes ids of pages only').toEqual({ tool: 'resize-image', order: [0], from: 'compress-image' });
  expect(transit.entries, 'the inbox was read in transit').toBe(1);
  for (const key of transit.keys) {
    expect(holds(key, SENTINELS.file), `a cache key holds the name: ${key}`).toBe(false);
    expect(key, key).not.toMatch(/[?#]/);
  }
  const origin = server.origin;
  expect(brokenRequests(seen, origin), 'only a GET of the own origin, with no body and no query string').toEqual([]);
  expect(leaksIn(seen.map((request, i) => ({ where: `request ${i + 1} (${request.method} ${request.url.slice(0, 80)})`, text: requestText(request) }))), 'the name of the file').toEqual([]);
  const head = PHOTO.subarray(2_000, 2_064).toString('latin1');
  expect(seen.filter((request) => request.body.includes(head)), 'the bytes of the file').toEqual([]);
  expect(server.requests.filter((request) => request.method !== 'GET' && request.method !== 'HEAD'), 'the server saw only reads').toEqual([]);
  expect(server.requests.some((request) => holds(request.pathname, SENTINELS.file)), 'the server never saw the name').toBe(false);
  // The events: on the way out, the next_step_click of always (tool, lang and target: nothing says the file went along,
  // and nothing of the file); at the arrival, the tool_start of a drop. No event holds the name of the file.
  const after = events.slice(before).filter((entry) => entry[0] === 'event');
  expect(after.filter((entry) => entry[1] === 'next_step_click'), 'one next_step_click, the one of always').toEqual([['event', 'next_step_click', { tool: 'compress-image', lang: 'en', target: 'resize-image' }]]);
  expect(after.find((entry) => entry[1] === 'tool_start'), 'the arrival is a drop').toEqual(['event', 'tool_start', { tool: 'resize-image', lang: 'en' }]);
  expect(leaksIn(events.map((entry, i) => ({ where: `event ${i + 1}`, text: JSON.stringify(entry) }))), 'an event holds the name').toEqual([]);
  expect(before, 'the page of the result counted its events').toBeGreaterThan(0);
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
});

test('Ctrl and the middle button only link: nothing is written, the tool opens empty and says nothing', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await compressed(page);
  const chip = page.locator('nav.fo-next a.fo-chip').first();
  await expect(chip).toHaveAttribute('data-carry', '');
  const clicks = await chip.evaluate((link) => {
    const out: { prevented: boolean }[] = [];
    // A listener of the document sees the click after the chip's own handler, and stops the link here.
    const stop = (event: MouseEvent) => {
      out.push({ prevented: event.defaultPrevented });
      event.preventDefault();
    };
    document.addEventListener('click', stop);
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
    }
    document.removeEventListener('click', stop);
    return out;
  });
  expect(clicks, 'no click with a key held or the middle button is taken over').toEqual([{ prevented: false }, { prevented: false }, { prevented: false }, { prevented: false }]);
  await page.waitForTimeout(300);
  expect(await inboxState(page), 'nothing was written').toEqual({ inbox: false, choice: null });
  // What the new tab opens: the tool, empty, with no empty box.
  await visit(page, server, (await chip.getAttribute('href')) ?? '');
  await expect(page.locator('#fo-tool-root .fo-drop')).toBeVisible();
  await expect(page.locator('.fo-drop[data-state="lost"]')).toHaveCount(0);
  await expect(page.locator('.fo-result')).toHaveCount(0);
});

test('the empty box: a chip sent the files and none arrived; it says so in lost, with "Choose" first and the way back', async ({ page }) => {
  if (await workerOff(page, server)) return;
  for (const kase of [
    { path: '/resize-image/', tool: 'resize-image', from: 'compress-image', name: 'Compress image', texts: en.carry, choose: en.drop.choose },
    { path: '/compress-pdf/', tool: 'compress-pdf', from: 'merge-pdf', name: 'Merge PDF', texts: PDF_PANEL_TEXTS.en.carry, choose: PDF_PANEL_TEXTS.en.drop.chooseMany },
  ]) {
    await visit(page, server, '/', { island: false });
    await page.evaluate(([key, value]) => sessionStorage.setItem(key, value), [INBOX_TOOL_KEY, JSON.stringify({ tool: kase.tool, order: [0], from: kase.from })] as const);
    await visit(page, server, kase.path);
    const box = page.locator('#fo-tool-root .fo-drop[data-state="lost"]');
    await expect(box, kase.path).toBeVisible();
    await expect(box.locator('[role="status"]')).toContainText(kase.texts.lostTitle);
    await expect(box.locator('[role="status"]')).toContainText(fmt(kase.texts.lostHelp, { tool: kase.name }));
    await expect(page.locator('#fo-tool-root .fo-slot > .fo-slot__oli')).toHaveAttribute('data-oli', 'lost');
    await expect(page.locator('#oli-lost'), 'the sprite has the pose').toHaveCount(1);
    // Nothing called focus(): the page keeps it where a new page has it.
    expect(await page.evaluate(() => document.activeElement === document.body || !document.getElementById('fo-tool-root')?.contains(document.activeElement))).toBe(true);
    // The first stop of Tab in the panel is "Choose": from the last control before it, one Tab.
    const before = await page.evaluate(() => {
      const root = document.getElementById('fo-tool-root');
      const all = [...document.querySelectorAll<HTMLElement>('a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter(
        (element) => element.checkVisibility() && !element.closest('[inert], [aria-hidden="true"], #fo-cookie'),
      );
      const first = all.findIndex((element) => root?.contains(element));
      const previous = all[first - 1];
      if (!previous) return null;
      previous.setAttribute('data-test-before', '');
      return previous.tagName;
    });
    expect(before, 'a control before the panel').not.toBeNull();
    await page.locator('[data-test-before]').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#fo-tool-root :focus')).toHaveText(kase.choose);
    // "Back to …" is history.back().
    await page.evaluate(() => {
      const own = window as unknown as { __back: number };
      own.__back = 0;
      history.back = () => {
        own.__back += 1;
      };
    });
    await box.getByRole('button', { name: fmt(kase.texts.back, { tool: kase.name }), exact: true }).click();
    expect(await page.evaluate(() => (window as unknown as { __back: number }).__back)).toBe(1);
    expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
  }
});

test('the empty box has no axe violation, in both themes at 360 and 1280px', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await visit(page, server, '/', { island: false });
  await page.evaluate(([key, value]) => sessionStorage.setItem(key, value), [INBOX_TOOL_KEY, JSON.stringify({ tool: 'resize-image', order: [0, 1], from: 'compress-image' })] as const);
  await visit(page, server, '/resize-image/');
  await expect(page.locator('.fo-drop[data-state="lost"] [role="status"]')).toContainText(en.carry.lostTitleMany);
  await animationsDone(page);
  expect(await violationsEverywhere(page)).toEqual([]);
});

test('Merge PDF, then "Compress this PDF": the merged PDF arrives in Compress PDF with the note', async ({ page }) => {
  if (await workerOff(page, server)) return;
  await page.setViewportSize({ width: 1280, height: 800 });
  await visit(page, server, '/', { island: false });
  await controlled(page);
  await visit(page, server, '/merge-pdf/');
  await page.setInputFiles('#fo-tool-root input[type="file"]', [pdfFile('gen-paginas-mistas.pdf', 'first.pdf'), pdfFile('gen-ja-otimizado.pdf', 'second.pdf')]);
  await page.locator('#fo-tool-root .fo-merge-panel .fo-btn--brand').click();
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  const chip = page.locator('nav.fo-next a.fo-chip[href="/compress-pdf/"]');
  await expect(chip).toHaveText(PDF_PANEL_TEXTS.en.carry.chips['compress-pdf'].one);
  await expect(page.locator('nav.fo-next a.fo-chip[href="/image-to-pdf/"]'), 'a PDF is no image: that chip only links').not.toHaveAttribute('data-carry', '');
  await expect(page.locator('.fo-band .fo-carry:not(.fo-next--kept)')).toHaveText(PDF_PANEL_TEXTS.en.carry.line);
  await chip.click();
  await page.waitForURL('**/compress-pdf/');
  await hydrated(page);
  await expect(page.locator('.fo-result .fo-btn--download')).toBeFocused({ timeout: 60_000 });
  await expect(page.locator('.fo-result__from')).toHaveText(fmt(PDF_PANEL_TEXTS.en.carry.from, { tool: 'Merge PDF' }));
  expect(await inboxState(page)).toEqual({ inbox: false, choice: null });
});
