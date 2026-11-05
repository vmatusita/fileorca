import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { expect, test, type BrowserContext, type ConsoleMessage, type Page } from '@playwright/test';
import { ACTIONS_HOST } from '../../scripts/fixtures/pdf.ts';
import { qpdfEncryption } from '../../scripts/lib/qpdf.ts';
import { imageSize } from './lib/images.ts';
import { takeDownload, watchRequests } from './lib/matrix.ts';
import { dataLayer, dropFiles, hydrated, dismissCookies, slowEngine, startOver, type TestFile } from './lib/page.ts';
import { PAGES, actionOf, activeContent, addedActive, lockedMarkerPdf, markerPdf } from './lib/pdf-privacy.ts';
import { opensWithoutPassword, readWithPdfjs } from './lib/pdfjs-read.ts';
import { choosePdfs, filesOf, openTool, pdfBytes, pdfFile, soundPdf, type Download } from './lib/pdf-tools.ts';
import { NAME_MAY_CARRY, SENTINELS, brokenRequests, bytesHold, holds, leaksIn, requestText, type SeenRequest, type Surface } from './lib/sentinels.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import splitTexts from '../../src/tools/split-pdf/i18n/en.ts';
import imagesTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import compressTexts from '../../src/tools/compress-pdf/i18n/en.ts';
import protectTexts from '../../src/tools/protect-pdf/i18n/en.ts';
import unlockTexts from '../../src/tools/unlock-pdf/i18n/en.ts';
import rotateTexts from '../../src/tools/rotate-pdf/i18n/en.ts';
import deleteTexts from '../../src/tools/delete-pdf-pages/i18n/en.ts';
import numbersTexts from '../../src/tools/add-page-numbers-to-pdf/i18n/en.ts';
import signTexts from '../../src/tools/sign-pdf/i18n/en.ts';
import reorderTexts from '../../src/tools/reorder-pdf-pages/i18n/en.ts';
import watermarkTexts from '../../src/tools/watermark-pdf/i18n/en.ts';

// Privacy and security of the PDF tools in the browser (F5a, decision 8, criteria 6 and 7; DECISOES § 166).
//
// 1. On each of the 12 pages, in both browsers: a file whose name and text hold sentinels is dropped, the options are
//    changed with more sentinels (the password, the watermark, the first number, the ranges, the signed name), the tool
//    runs, the result is downloaded and a chip is clicked. Then everything the page and its workers did and kept is
//    searched, with the rules of tests/e2e/lib/sentinels.ts, for every sentinel (not only the ones this tool takes):
//    each request of any origin with its method, address, headers and body, the dataLayer, the title and the address of
//    the page, the stores of the browser, the console, and the names of what was downloaded. Only a GET of the own origin
//    with no body and no query string goes out (the rule of tests/e2e/launch-claims.spec.ts); the name of the person's
//    own file may be in the names of the downloads and nowhere else. The protected PDF holds the password in no form.
//    The search is proven to find and to stay quiet in tests/unit/pdf-sentinels.test.ts; each test here also proves that
//    the typed value was really used by the tool (the output is read), or the test would pass for a tool that did nothing.
// 2. gen-acoes.pdf (JavaScript on open and on page 2, a Launch action, a web link, an internal link) is handed to every
//    tool that draws a page (PDF to JPG, the thumbnails of the grids of Split, Delete, Rotate and Reorder, the preview
//    of Sign, the Strong mode of Compress): no dialog, no popup, no navigation and no request, not even to the address
//    the file points at (criterion 7).
// 3. qpdf and PDF.js run on a page that is not cross-origin isolated, with no SharedArrayBuffer, and the .wasm files the
//    browser received are the files of their packages (the rules of tests/e2e/image-privacy.spec.ts, DECISOES § 80).

const STEM = SENTINELS.file;
const FILE = `${STEM}.pdf`;
const SECOND = `${STEM}-two.pdf`;
const PASSWORD = SENTINELS.password;
const option = (page: Page, label: string | RegExp) => page.locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const pdf = (name: string, buffer: Buffer): TestFile => ({ name, mimeType: 'application/pdf', buffer });
const markers = (count: number, skip: number[] = []) => Array.from({ length: count }, (_, i) => i + 1).filter((n) => !skip.includes(n)).map((n) => `Page ${n}`);

// ---- what the page and its workers did ---------------------------------------------------------------------------

interface Seen {
  requests: SeenRequest[];
  console: string[];
  dialogs: string[];
  popups: string[];
  navigations: string[];
}

/** Listens before the first request: the context sees the requests of the workers, in both browsers (docs/claude/playwright.md, F3). */
function watch(context: BrowserContext, page: Page): Seen {
  const seen: Seen = { requests: [], console: [], dialogs: [], popups: [], navigations: [] };
  context.on('request', (request) => {
    const body = request.postDataBuffer();
    seen.requests.push({ method: request.method(), url: request.url(), headers: request.headers(), body: body ? body.toString('latin1') : '', bodyBytes: body?.length ?? 0 });
  });
  const log = (message: ConsoleMessage) => void seen.console.push(`${message.type()}: ${message.text()}`);
  context.on('console', log);
  page.on('worker', (worker) => worker.on('console', log));
  page.on('pageerror', (error) => void seen.console.push(`pageerror: ${error.message}\n${error.stack ?? ''}`));
  page.on('dialog', (dialog) => {
    seen.dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    void dialog.dismiss().catch(() => {});
  });
  page.on('popup', (popup) => void seen.popups.push(popup.url()));
  return seen;
}

/** From here on, any navigation of the page is recorded: a tool that needs none must make none. */
function watchNavigation(page: Page, seen: Seen): void {
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) seen.navigations.push(frame.url());
  });
}

/** What the page holds in its address, its title, its event list and the stores of the browser. */
async function holdings(page: Page, context: BrowserContext, label: string): Promise<Surface[]> {
  const inPage = await page.evaluate(async () => {
    const dump = (store: Storage): string => {
      try {
        return JSON.stringify(Object.fromEntries(Array.from({ length: store.length }, (_, i) => [store.key(i) ?? '', store.getItem(store.key(i) ?? '')])));
      } catch {
        return '';
      }
    };
    let databases = '';
    try {
      databases = typeof indexedDB.databases === 'function' ? JSON.stringify(await indexedDB.databases()) : '';
    } catch {
      databases = '';
    }
    return { title: document.title, href: location.href, search: location.search, hash: location.hash, local: dump(localStorage), session: dump(sessionStorage), databases, cookie: document.cookie };
  });
  return [
    { where: `${label}: document.title`, text: inPage.title },
    { where: `${label}: location.href`, text: inPage.href },
    { where: `${label}: location.search`, text: inPage.search },
    { where: `${label}: location.hash`, text: inPage.hash },
    { where: `${label}: localStorage`, text: inPage.local },
    { where: `${label}: sessionStorage`, text: inPage.session },
    { where: `${label}: IndexedDB names`, text: inPage.databases },
    { where: `${label}: document.cookie`, text: inPage.cookie },
    { where: `${label}: cookies of the context`, text: JSON.stringify(await context.cookies()) },
    { where: `${label}: dataLayer`, text: JSON.stringify(await dataLayer(page)) },
  ];
}

const requestSurfaces = (seen: Seen): Surface[] => seen.requests.map((request, i) => ({ where: `request ${i + 1} (${request.method} ${request.url.slice(0, 80)})`, text: requestText(request) }));
const consoleSurfaces = (seen: Seen): Surface[] => seen.console.map((line, i) => ({ where: `console message ${i + 1} (${line.slice(0, 60)})`, text: line }));

/** The names of what was downloaded: the download itself and, for a ZIP, every entry in it. */
function nameSurfaces(delivered: Download, outs: Download[]): Surface[] {
  return [delivered, ...outs].map((file, i) => ({ where: `download name ${i + 1} (${file.name})`, text: file.name }));
}

function recordPrivacy(name: string, record: object): void {
  const dir = resolve('test-results', 'privacy-pdf');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${name}.json`), `${JSON.stringify(record, null, 2)}\n`);
}

// ---- the 12 pages ---------------------------------------------------------------------------------------------------

interface Tool {
  slug: string;
  files: () => Promise<TestFile[]>;
  /** Options changed before the file arrives: the tools that run by themselves when it does. */
  before?: (page: Page) => Promise<void>;
  /** Options changed after the file arrived, and the button: the tools that wait for it. */
  after?: (page: Page) => Promise<void>;
  /** Reads what came out and proves that the typed values were used. Returns what it proved, for the report. */
  proves: (outs: Download[]) => Promise<string>;
  /** Follow the chip to the next page instead of only clicking it (one test does, for the page after a password). */
  follow?: boolean;
}

const one = async (): Promise<TestFile[]> => [pdf(FILE, await markerPdf())];

const TOOLS: Tool[] = [
  {
    slug: 'merge-pdf',
    files: async () => [pdf(FILE, await markerPdf()), pdf(SECOND, pdfBytes('gen-paginas-mistas.pdf'))],
    after: async (page) => {
      // The second file moves up: the merged file starts with it, and is named after it. The button of the action shows
      // once every file is read, and there is a test of its own for a row moved before that.
      await page.getByRole('button', { name: `Move ${SECOND} up` }).click();
      await page.getByRole('button', { name: actionOf(mergeTexts) }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-two-merged.pdf`]);
      const read = await readWithPdfjs(outs[0]?.bytes as Uint8Array);
      expect(read.pages.map((p) => p.marker)).toEqual([...markers(8), ...markers(PAGES)]);
      expect(read.pages.slice(8).every((p) => p.texts.some((t) => t.str === SENTINELS.marker))).toBe(true);
      return `one file of ${8 + PAGES} pages, the second file first`;
    },
  },
  {
    slug: 'split-pdf',
    files: one,
    after: async (page) => {
      await option(page, splitTexts.panel.options.ranges);
      await page.getByLabel(splitTexts.panel.options.rangesLabel).fill(SENTINELS.rangeSplit);
      await page.getByLabel(splitTexts.panel.options.rangesLabel).blur();
      await page.getByRole('button', { name: actionOf(splitTexts) }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name), 'named by part, never by the typed range').toEqual([1, 2, 3, 4, 5].map((n) => `${STEM}-part-${n}.pdf`));
      const reads = await Promise.all(outs.map((out) => readWithPdfjs(out.bytes)));
      expect(reads.map((read) => read.pages.map((p) => p.marker))).toEqual([['Page 1', 'Page 2'], ['Page 4'], ['Page 6', 'Page 7'], ['Page 9'], ['Page 11', 'Page 12']]);
      return '5 parts for the 5 typed ranges';
    },
  },
  {
    slug: 'pdf-to-jpg',
    files: one,
    before: async (page) => {
      await option(page, imagesTexts.panel.options.low);
      await option(page, imagesTexts.panel.options.range);
      await page.getByLabel(imagesTexts.panel.options.rangeLabel).fill(SENTINELS.rangeImages);
      await page.getByLabel(imagesTexts.panel.options.rangeLabel).blur();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([3, 4, 6, 8, 9, 12].map((n) => `${STEM}-page-${n}.jpg`));
      for (const out of outs) expect(imageSize(out.bytes).format, out.name).toBe('jpeg');
      return '6 JPG for the 6 typed pages';
    },
  },
  {
    slug: 'compress-pdf',
    files: one,
    before: async (page) => option(page, compressTexts.panel.options.lossless),
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-compressed.pdf`]);
      expect((await readWithPdfjs(outs[0]?.bytes as Uint8Array)).pages).toHaveLength(PAGES);
      return 'the PDF back, opened by PDF.js';
    },
  },
  {
    slug: 'rotate-pdf',
    files: one,
    before: async (page) => option(page, rotateTexts.panel.options.half),
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-rotated.pdf`]);
      expect((await readWithPdfjs(outs[0]?.bytes as Uint8Array)).pages.map((p) => p.rotate)).toEqual(new Array(PAGES).fill(180));
      return `${PAGES} pages turned 180°`;
    },
  },
  {
    slug: 'delete-pdf-pages',
    files: one,
    after: async (page) => {
      await page.getByLabel('Pick pages by number').fill(SENTINELS.rangeDelete);
      await page.getByRole('button', { name: 'Pick these' }).click();
      await page.getByRole('button', { name: /^Delete/ }).first().click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-edited.pdf`]);
      expect((await readWithPdfjs(outs[0]?.bytes as Uint8Array)).pages.map((p) => p.marker)).toEqual(markers(PAGES, [2, 3, 5, 7, 8, 10]));
      return '6 pages left of the 12 after the typed range';
    },
  },
  {
    slug: 'add-page-numbers-to-pdf',
    files: one,
    before: async (page) => {
      await option(page, numbersTexts.panel.options.pageNofTotal);
      await option(page, numbersTexts.panel.options.topRight);
      await page.getByLabel(numbersTexts.panel.options.startLabel).fill(SENTINELS.start);
      await page.getByLabel(numbersTexts.panel.options.startLabel).blur();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-numbered.pdf`]);
      const read = await readWithPdfjs(outs[0]?.bytes as Uint8Array);
      const last = Number(SENTINELS.start) + PAGES - 1;
      read.pages.forEach((p, i) => expect(p.texts.some((t) => t.str === `Page ${Number(SENTINELS.start) + i} of ${last}`), `page ${i + 1} is numbered from the typed number`).toBe(true));
      return `pages numbered ${SENTINELS.start} to ${last}`;
    },
  },
  {
    slug: 'sign-pdf',
    files: one,
    after: async (page) => {
      await option(page, signTexts.panel.options.type);
      await page.getByLabel(signTexts.panel.options.typeLabel).fill(SENTINELS.signature);
      await page.getByLabel(signTexts.panel.options.typeLabel).blur();
      await expect(page.locator('.fo-sign__box')).toBeVisible({ timeout: 20_000 });
      await page.getByRole('button', { name: actionOf(signTexts) }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-signed.pdf`]);
      const read = await readWithPdfjs(outs[0]?.bytes as Uint8Array);
      expect(read.pages.map((p) => p.images)).toEqual([1, ...new Array(PAGES - 1).fill(0)]);
      return 'the typed name drawn as one image on page 1';
    },
  },
  {
    slug: 'protect-pdf',
    files: one,
    follow: true,
    after: async (page) => {
      await page.getByLabel(protectTexts.panel.options.passwordLabel, { exact: true }).fill(PASSWORD);
      await page.getByLabel(protectTexts.panel.options.confirmLabel, { exact: true }).fill(PASSWORD);
      await page.getByRole('button', { name: actionOf(protectTexts) }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-protected.pdf`]);
      const bytes = outs[0]?.bytes as Uint8Array;
      expect((await qpdfEncryption(bytes, PASSWORD)).out, 'AES-256, revision 6').toEqual(expect.arrayContaining(['R = 6', 'stream encryption method: AESv3']));
      expect(await opensWithoutPassword(bytes), 'it asks for the password').toBe(false);
      expect((await readWithPdfjs(bytes, PASSWORD)).pages).toHaveLength(PAGES);
      // The password is in no form in the file (plain, UTF-16, hex), and neither is the text of the pages.
      for (const sentinel of [SENTINELS.password, SENTINELS.wrongPassword]) expect(bytesHold(bytes, sentinel), `the file holds ${sentinel}`).toBeNull();
      expect(bytesHold(bytes, SENTINELS.marker), 'the pages are encrypted, not only the file marked').toBeNull();
      return 'R6 AESv3, asks for the password, the password and the text of the pages are in no form in the bytes';
    },
  },
  {
    slug: 'unlock-pdf',
    files: async () => [pdf(FILE, await lockedMarkerPdf(PASSWORD))],
    after: async (page) => {
      const field = page.getByLabel(unlockTexts.panel.options.passwordLabel, { exact: true });
      await field.fill(SENTINELS.wrongPassword);
      await page.getByRole('button', { name: unlockTexts.panel.options.submit }).click();
      await expect(page.getByText(/That password didn't open/).first()).toBeVisible({ timeout: 30_000 });
      await field.fill(PASSWORD);
      await page.getByRole('button', { name: unlockTexts.panel.options.submit }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-unlocked.pdf`]);
      const bytes = outs[0]?.bytes as Uint8Array;
      expect(Buffer.from(bytes).toString('latin1')).not.toMatch(/\/Encrypt\b/);
      const read = await readWithPdfjs(bytes);
      expect(read.pages.map((p) => p.marker)).toEqual(markers(PAGES));
      expect(read.pages.every((p) => p.texts.some((t) => t.str === SENTINELS.marker))).toBe(true);
      return 'a wrong password said, the right one opened it, no /Encrypt left';
    },
  },
  {
    slug: 'reorder-pdf-pages',
    files: one,
    after: async (page) => {
      await page.getByRole('button', { name: reorderTexts.panel.options.reverse }).click();
      await page.getByRole('button', { name: actionOf(reorderTexts) }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-reordered.pdf`]);
      expect((await readWithPdfjs(outs[0]?.bytes as Uint8Array)).pages.map((p) => p.marker)).toEqual(markers(PAGES).reverse());
      return 'the 12 pages in reverse';
    },
  },
  {
    slug: 'watermark-pdf',
    files: one,
    after: async (page) => {
      await page.getByLabel(watermarkTexts.panel.options.textLabel).fill(SENTINELS.watermark);
      await page.getByLabel(watermarkTexts.panel.options.textLabel).blur();
      await option(page, /^Large$/);
      await option(page, /^Light$/);
      await option(page, /^Horizontal$/);
      await page.getByRole('button', { name: actionOf(watermarkTexts) }).click();
    },
    proves: async (outs) => {
      expect(outs.map((out) => out.name)).toEqual([`${STEM}-watermarked.pdf`]);
      const read = await readWithPdfjs(outs[0]?.bytes as Uint8Array);
      read.pages.forEach((p, i) => expect(p.texts.some((t) => t.str.includes(SENTINELS.watermark)), `the mark is on page ${i + 1}`).toBe(true));
      return `the typed mark on all ${PAGES} pages`;
    },
  },
];

test.describe('typed values, names and files stay in the browser', () => {
  for (const tool of TOOLS) {
    test(`/${tool.slug}/: drop, options, run, download and chip leave nothing of the sentinels anywhere`, async ({ page, context, browserName }) => {
      const seen = watch(context, page);
      await openTool(page, `/${tool.slug}/`);
      const origin = new URL(page.url()).origin;

      await tool.before?.(page);
      expect(await dropFiles(page, '.fo-drop', await tool.files()), 'the page takes the drop over').toBe(true);
      await tool.after?.(page);
      await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });

      const delivered = await takeDownload(page);
      const outs = filesOf(delivered);
      const proof = await tool.proves(outs);

      // The chip: the click is seen by the page (it sends its event) and the address it leads to is a clean path.
      const chip = page.locator('.fo-next a.fo-chip').first();
      await expect(chip).toBeVisible();
      const href = (await chip.getAttribute('href')) ?? '';
      expect(href, 'the chip leads to a page, with no query string and no hash').toMatch(/^\/[a-z0-9-]+\/$/);
      await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { once: true }));
      await chip.click();
      const here = new URL(page.url());
      expect(here.pathname, 'the first click only counted the event').toBe(`/${tool.slug}/`);
      const surfaces: Surface[] = await holdings(page, context, 'the tool page');
      const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => entry[1]);
      expect(events, 'the page sent its four events').toEqual(expect.arrayContaining(['tool_start', 'tool_complete', 'download', 'next_step_click']));

      if (tool.follow) {
        await chip.click();
        await page.waitForURL(`**${href}`);
        await hydrated(page);
        surfaces.push(...(await holdings(page, context, 'the page after the chip')));
      }

      // The search.
      expect(seen.dialogs, 'no dialog').toEqual([]);
      expect(seen.requests.length, 'the collector saw the page, its scripts and its worker').toBeGreaterThan(5);
      expect(brokenRequests(seen.requests, origin), 'only a GET of the own origin without a body or a query string').toEqual([]);
      expect(leaksIn([...requestSurfaces(seen), ...surfaces, ...consoleSurfaces(seen)]), 'a sentinel reached a request, the page, a store or the console').toEqual([]);
      const names = nameSurfaces(delivered, outs);
      expect(leaksIn(names, NAME_MAY_CARRY), 'nothing typed is in the name of a download').toEqual([]);
      expect(names.some((name) => holds(name.text, SENTINELS.file)), 'the name of the person’s own file is in the name of the download').toBe(true);

      recordPrivacy(`${tool.slug}-${browserName}`, {
        tool: tool.slug,
        browser: browserName,
        proved: proof,
        requests: seen.requests.length,
        consoleMessages: seen.console.length,
        surfacesSearched: requestSurfaces(seen).length + surfaces.length + consoleSurfaces(seen).length + names.length,
        sentinels: Object.keys(SENTINELS).length,
        downloads: names.map((name) => basename(name.text)),
        events,
      });
    });
  }
});

// The Merge flow above moves a row right after the drop, while the files are still being read. That found a hole in the
// panel: readAll walked the live list of files, so a row moved to the front during the reading made the walk skip the
// file that had taken its place, which stayed on "Reading…" for good while the button offered to merge the other one.
// Held at the reading (slowEngine) the move is certain to come first, so this fails without the copy of the list.
test('Merge PDF: a row moved while the files are still being read does not leave a file unread', async ({ page }) => {
  const held = await slowEngine(page);
  await openTool(page, '/merge-pdf/');
  expect(await dropFiles(page, '.fo-drop', [pdf(FILE, await markerPdf()), pdf(SECOND, pdfBytes('gen-paginas-mistas.pdf'))])).toBe(true);
  await expect(page.locator('.fo-filelist__row').filter({ hasText: 'Reading' }), 'both files wait to be read').toHaveCount(2);
  await page.getByRole('button', { name: `Move ${SECOND} up` }).click();
  held.release();
  await expect(page.locator('.fo-filelist__row').filter({ hasText: 'Reading' }), 'every file is read, whatever the order it was moved to').toHaveCount(0, { timeout: 15_000 });
  await page.getByRole('button', { name: actionOf(mergeTexts) }).click();
  const [merged] = filesOf(await takeDownload(page));
  expect(merged?.name).toBe(`${STEM}-two-merged.pdf`);
  expect((await readWithPdfjs(merged?.bytes as Uint8Array)).pages, 'both files are in it').toHaveLength(8 + PAGES);
});

// The control of the collectors, in the browser: a search that cannot fail proves nothing, so the leaks are planted, one
// on every surface the tests above read, and each has to be found there. The page puts the sentinels in its title, its
// address, its stores, its event list, a query string, and (from a worker of its own) a body and the console.
test('the collectors see a leak planted in the page and in a worker, on every surface they read', async ({ page, context }) => {
  const seen = watch(context, page);
  await openTool(page, '/merge-pdf/');
  const origin = new URL(page.url()).origin;
  await page.evaluate(
    async (s) => {
      document.title = `Merge ${s.signature}`;
      history.replaceState(null, '', `#${s.rangeSplit.replace(/\s+/g, '')}`);
      localStorage.setItem('planted', s.password);
      sessionStorage.setItem('planted', s.marker);
      document.cookie = `planted=${s.watermark}`;
      (window.dataLayer ??= []).push(['event', 'planted', { n: s.rangeDelete }]);
      await new Promise<void>((done) => {
        const open = indexedDB.open(`planted-${s.file}`);
        open.onsuccess = () => done();
        open.onerror = () => done();
      });
      await fetch(`/robots.txt?q=${encodeURIComponent(s.password)}`).catch(() => undefined);
      // A worker made from a blob has no origin to resolve "/robots.txt" against, so the address is whole.
      const script = `console.log(${JSON.stringify(s.wrongPassword)}); fetch(${JSON.stringify(`${location.origin}/robots.txt`)}, { method: 'POST', body: ${JSON.stringify(s.rangeImages)} }).catch(() => {});`;
      const worker = new Worker(URL.createObjectURL(new Blob([script], { type: 'text/javascript' })));
      await new Promise((done) => setTimeout(done, 600));
      worker.terminate();
    },
    { ...SENTINELS },
  );
  await expect.poll(() => seen.requests.some((request) => request.method === 'POST'), { message: 'the request of the worker was seen' }).toBe(true);
  await expect.poll(() => seen.console.some((line) => line.includes(SENTINELS.wrongPassword)), { message: 'the console of the worker was seen' }).toBe(true);

  const found = leaksIn([...requestSurfaces(seen), ...(await holdings(page, context, 'the page')), ...consoleSurfaces(seen)]);
  for (const [where, sentinel] of [
    ['request', 'password'],
    ['request', 'rangeImages'],
    ['console message', 'wrongPassword'],
    ['the page: document.title', 'signature'],
    ['the page: location.href', 'rangeSplit'],
    ['the page: location.hash', 'rangeSplit'],
    ['the page: localStorage', 'password'],
    ['the page: sessionStorage', 'marker'],
    ['the page: document.cookie', 'watermark'],
    ['the page: cookies of the context', 'watermark'],
    ['the page: IndexedDB names', 'file'],
    ['the page: dataLayer', 'rangeDelete'],
  ] as const) {
    expect(found.some((line) => line.startsWith(where) && line.endsWith(`holds the ${sentinel} sentinel`)), `${where} holds the ${sentinel} sentinel, and the search says so`).toBe(true);
  }
  const broken = brokenRequests(seen.requests, origin);
  expect(broken.some((line) => line.startsWith('POST ')), 'the POST of the worker is broken').toBe(true);
  expect(broken.some((line) => line.includes('with a query string')), 'the query string is broken').toBe(true);
});

// ---- gen-acoes: nothing runs ---------------------------------------------------------------------------------------

interface Draws {
  title: string;
  slug: string;
  before?: (page: Page) => Promise<void>;
  after?: (page: Page) => Promise<void>;
  /** The images the page draws are on screen before the run goes on. */
  drawn: string;
  /** What the run gives back. */
  gives: 'pdf' | 'images';
}

const GRID = '.fo-pages__grid .fo-page__sheet img';
const gridDrawn = async (page: Page) => expect(page.locator(GRID).first(), 'the thumbnails of the file were drawn').toBeVisible({ timeout: 30_000 });
const gridPage = (n: number) => new RegExp(`^Page ${n} of 2`);

const DRAWS: Draws[] = [
  { title: 'PDF to JPG', slug: 'pdf-to-jpg', before: (page) => option(page, imagesTexts.panel.options.low), drawn: 'the pages become images', gives: 'images' },
  {
    title: 'the grid of Split PDF',
    slug: 'split-pdf',
    drawn: 'grid',
    gives: 'pdf',
    after: async (page) => {
      await option(page, splitTexts.panel.options.pick);
      await gridDrawn(page);
      await page.getByRole('button', { name: gridPage(1) }).click();
      await page.getByRole('button', { name: gridPage(2) }).click();
      await page.getByRole('button', { name: actionOf(splitTexts) }).click();
    },
  },
  {
    title: 'the grid of Delete PDF pages',
    slug: 'delete-pdf-pages',
    drawn: 'grid',
    gives: 'pdf',
    after: async (page) => {
      await gridDrawn(page);
      await page.getByRole('button', { name: gridPage(2) }).click();
      await page.getByRole('button', { name: deleteTexts.panel.options.actionOne }).click();
    },
  },
  {
    title: 'the preview of Sign PDF',
    slug: 'sign-pdf',
    drawn: 'preview',
    gives: 'pdf',
    after: async (page) => {
      await option(page, signTexts.panel.options.type);
      await page.getByLabel(signTexts.panel.options.typeLabel).fill('Orca Signer');
      await page.getByLabel(signTexts.panel.options.typeLabel).blur();
      await expect(page.getByRole('img', { name: signTexts.panel.options.previewLabel }), 'the page preview was drawn').toBeVisible({ timeout: 30_000 });
      await expect(page.locator('.fo-sign__box')).toBeVisible({ timeout: 20_000 });
      await page.getByRole('button', { name: actionOf(signTexts) }).click();
    },
  },
  {
    title: 'the grid of Rotate PDF',
    slug: 'rotate-pdf',
    drawn: 'grid',
    gives: 'pdf',
    after: async (page) => {
      // F13a (UX-04 A; DECISOES § F13A-P-10): Rotate runs when the file is read, and its options fold under "Adjust" then.
      await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 45_000 });
      await page.locator('#fo-tool-root .fo-adjust > summary').click();
      await option(page, rotateTexts.panel.options.pick);
      await gridDrawn(page);
      await page.getByRole('button', { name: /^Turn page 1 \(/ }).click();
    },
  },
  {
    title: 'the grid of Reorder PDF pages',
    slug: 'reorder-pdf-pages',
    drawn: 'grid',
    gives: 'pdf',
    after: async (page) => {
      await gridDrawn(page);
      await page.getByRole('button', { name: reorderTexts.panel.options.reverse }).click();
      await page.getByRole('button', { name: actionOf(reorderTexts) }).click();
    },
  },
  {
    title: 'the Strong mode of Compress PDF',
    slug: 'compress-pdf',
    drawn: 'the pages become pictures',
    gives: 'pdf',
    before: (page) => option(page, compressTexts.panel.options.strong),
  },
];

test.describe('gen-acoes.pdf: nothing in the file runs', () => {
  for (const draws of DRAWS) {
    test(`${draws.title}: no dialog, popup, navigation or request, and the output adds no action of its own`, async ({ page, context, browserName }) => {
      const seen = watch(context, page);
      await openTool(page, `/${draws.slug}/`);
      watchNavigation(page, seen);
      const address = page.url();
      const before = seen.requests.length;

      await draws.before?.(page);
      await choosePdfs(page, [pdfFile('gen-acoes.pdf')]);
      await draws.after?.(page);
      await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
      const delivered = await takeDownload(page);
      const outs = filesOf(delivered);

      expect(seen.dialogs, 'no alert, confirm or prompt: the script of the file did not run').toEqual([]);
      expect(seen.popups, 'no window was opened (app.launchURL, a Launch action)').toEqual([]);
      expect(seen.navigations, 'the page did not navigate').toEqual([]);
      expect(page.url()).toBe(address);
      expect(context.pages(), 'no other page exists').toHaveLength(1);
      expect(seen.requests.length, 'the tool made its requests after the load').toBeGreaterThan(before);
      expect(seen.requests.filter((request) => request.url.includes(ACTIONS_HOST) || /\.invalid\b/.test(request.url)), 'nothing asked for the address the file points at').toEqual([]);
      expect(brokenRequests(seen.requests, new URL(address).origin), 'only a GET of the own origin without a body or a query string').toEqual([]);
      expect(seen.console.filter((line) => /sentinel|script ran/i.test(line)), 'no script of the file wrote to the console').toEqual([]);

      // What came out. Pictures hold no action. A PDF opens in PDF.js and qpdf, and the tool put no action of its own in it:
      // what it keeps of the file's own is measured and written for the report (DECISOES § 167).
      const had = await activeContent(pdfBytes('gen-acoes.pdf'));
      const kept: Record<string, Awaited<ReturnType<typeof activeContent>>> = {};
      if (draws.gives === 'images') {
        expect(outs.map((out) => out.name)).toEqual(['gen-acoes-page-1.jpg', 'gen-acoes-page-2.jpg']);
        for (const out of outs) expect(imageSize(out.bytes).format, out.name).toBe('jpeg');
      } else {
        expect(outs, 'one PDF').toHaveLength(1);
        const bytes = outs[0]?.bytes as Uint8Array;
        const read = await soundPdf(bytes);
        expect(read.pages.length).toBeGreaterThan(0);
        kept[draws.slug] = await activeContent(bytes);
        expect(addedActive(had, kept[draws.slug] as Awaited<ReturnType<typeof activeContent>>), 'the tool put no action in the file that it did not have').toEqual([]);
      }
      recordPrivacy(`acoes-${draws.slug}-${browserName}`, { tool: draws.slug, browser: browserName, drew: draws.drawn, input: had, output: kept[draws.slug] ?? 'images', requests: seen.requests.length - before });
    });
  }
});

// ---- qpdf and PDF.js: the rules of the image engine ----------------------------------------------------------------

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
/** The hash the build puts in a name ("qpdf-C3Giu3T4.wasm") is not part of the name of the package file. */
const withoutHash = (url: string): string => basename(new URL(url).pathname).replace(/[-.][\w-]{8}(\.[a-z0-9]+)$/i, '$1');

/** The .wasm files of the two packages, by the name they have in the package. */
const PACKAGE_WASM: Record<string, string> = {
  'qpdf.wasm': 'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm',
  'jbig2.wasm': 'node_modules/pdfjs-dist/wasm/jbig2.wasm',
  'openjpeg.wasm': 'node_modules/pdfjs-dist/wasm/openjpeg.wasm',
  'qcms_bg.wasm': 'node_modules/pdfjs-dist/wasm/qcms_bg.wasm',
};

async function expectNotIsolated(page: Page, where: string): Promise<number> {
  expect(await page.evaluate(() => ({ isolated: crossOriginIsolated, shared: typeof SharedArrayBuffer })), `${where}: the page`).toEqual({ isolated: false, shared: 'undefined' });
  const workers = page.workers();
  for (const worker of workers) {
    expect(await worker.evaluate(() => ({ isolated: self.crossOriginIsolated, shared: typeof SharedArrayBuffer })), `${where}: the worker ${worker.url()}`).toEqual({ isolated: false, shared: 'undefined' });
  }
  return workers.length;
}

test('qpdf and PDF.js work on a page that is not cross-origin isolated, with the unmodified .wasm files of their packages', async ({ page, context, browserName }) => {
  // The context sees the requests of the workers in both browsers (docs/claude/playwright.md, F3).
  const qpdfFetches: string[] = [];
  context.on('request', (request) => {
    if (/\/qpdf-[\w-]+\.wasm$/.test(request.url())) qpdfFetches.push(request.url());
  });
  const wasm: { url: string; type: string | undefined; hash: string }[] = [];
  const reading: Promise<void>[] = [];
  page.on('response', (response) => {
    if (!response.url().endsWith('.wasm')) return;
    reading.push(
      response.body().then(
        (body) => void wasm.push({ url: response.url(), type: response.headers()['content-type'], hash: sha256(new Uint8Array(body)) }),
        () => undefined,
      ),
    );
  });
  const requests = watchRequests(page);

  // Compress PDF, Lossless: the mode that is qpdf alone.
  const compress = await page.goto('/compress-pdf/');
  expect(compress?.headers()['cross-origin-opener-policy']).toBeUndefined();
  expect(compress?.headers()['cross-origin-embedder-policy']).toBeUndefined();
  await hydrated(page);
  await dismissCookies(page);
  await option(page, compressTexts.panel.options.lossless);
  await choosePdfs(page, [pdfFile('gen-fotos.pdf')]);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  const compressed = await takeDownload(page);
  expect(compressed.bytes.length).toBeLessThanOrEqual(pdfBytes('gen-fotos.pdf').length);
  expect(await expectNotIsolated(page, 'Compress PDF (qpdf)'), 'the PDF worker is there to be asked').toBeGreaterThan(0);
  await Promise.all(reading);
  expect(wasm.filter((entry) => withoutHash(entry.url) === 'qpdf.wasm').length, 'qpdf.wasm was fetched for the compression').toBeGreaterThan(0);

  // A second file through the same worker: qpdf is fetched and started once for both. WebKit evaluated the entry script of
  // the worker again for the glue it loads, which made every module exist twice: qpdf was fetched twice, and every call
  // ran twice (src/engine/pdf/worker.ts, the guard around expose(); DECISOES § 168).
  await startOver(page);
  await option(page, compressTexts.panel.options.lossless);
  await choosePdfs(page, [pdfFile('gen-ja-otimizado.pdf')]);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  await takeDownload(page);
  expect(qpdfFetches, 'qpdf.wasm is fetched once for two files').toHaveLength(1);

  // PDF to JPG on the scanned report: its CCITT pages are decoded by the .wasm of PDF.js.
  const toJpg = await page.goto('/pdf-to-jpg/');
  expect(toJpg?.headers()['cross-origin-opener-policy']).toBeUndefined();
  expect(toJpg?.headers()['cross-origin-embedder-policy']).toBeUndefined();
  await hydrated(page);
  await option(page, imagesTexts.panel.options.low);
  await option(page, imagesTexts.panel.options.range);
  await page.getByLabel(imagesTexts.panel.options.rangeLabel).fill('1');
  await page.getByLabel(imagesTexts.panel.options.rangeLabel).blur();
  await choosePdfs(page, [pdfFile('pdf-escaneado-02-relatorio-nasa-150p.pdf')]);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 45_000 });
  const image = await takeDownload(page);
  expect(imageSize(image.bytes).format).toBe('jpeg');
  expect(await expectNotIsolated(page, 'PDF to JPG (PDF.js)')).toBeGreaterThan(0);
  await Promise.all(reading);

  // Every .wasm the browser received is, byte for byte, the file of the package it belongs to, served as wasm.
  const names = new Set(wasm.map((entry) => withoutHash(entry.url)));
  expect(names.has('qpdf.wasm'), 'qpdf.wasm came').toBe(true);
  expect([...names].some((name) => name === 'jbig2.wasm' || name === 'openjpeg.wasm'), 'a .wasm of PDF.js came').toBe(true);
  for (const entry of wasm) {
    const name = withoutHash(entry.url);
    const file = PACKAGE_WASM[name];
    if (!file) continue;
    expect(entry.type, `${entry.url}: served as wasm`).toBe('application/wasm');
    expect(entry.hash, `${entry.url}: the bytes the browser received`).toBe(sha256(new Uint8Array(readFileSync(file))));
  }
  const unknown = [...names].filter((name) => !PACKAGE_WASM[name] && !/^(mozjpeg_dec|mozjpeg_enc|squoosh_resize_bg)\.wasm$/.test(name));
  expect(unknown, 'every .wasm that came is one of the two packages or a codec of the engine').toEqual([]);
  expect(requests.outside(), 'nothing left the own origin').toEqual([]);
  expect(requests.writes, 'nothing was written to anywhere').toEqual([]);
  recordPrivacy(`wasm-${browserName}`, { browser: browserName, wasm: wasm.map((entry) => ({ file: entry.url.replace(/^https?:\/\/[^/]+/, ''), sha256: entry.hash, type: entry.type })) });
});
