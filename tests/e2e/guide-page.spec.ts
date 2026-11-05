import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { fixtureFile } from './lib/matrix.ts';
import { hydrated, type TestFile } from './lib/page.ts';
import { pdfFile } from './lib/pdf-tools.ts';

// F13b · a página de guia (UX-13 A, decision 5 of the run; DECISOES § 376 and § G-1 to § G-9), the tests of the
// specification (docs/propostas/ux-v2/guide-page.html, "Testes que a F13 escreve") on the 30 file guides, in both
// browsers: the panel starts above the fold of a 360 × 740 phone and the Choose button ends above 800px at 1280 × 800
// (D-47); the signature is one line (G-23); using the tool moves nothing below it, a layout shift of 0.05 at most at 360
// and at 1280px (D-50; the island of the F13a, a control proves the measure); with the Download at the top of the screen
// the first chip is whole on it (D-49); the hint of a table wider than its frame shows at 360 and not where the table fits
// (F5b F-2). The axe of the frame scrolled and focused, in both themes. The dist tests of the tables, the sheet and the
// link are in tests/unit/guide-page.test.ts. Named so it falls in a light part of the CI (Chromium 3, WebKit 7).

const PHONE = { width: 360, height: 740 } as const;
const WIDE = { width: 1280, height: 800 } as const;
const PAGES = FILE_GUIDE_IDS.flatMap((id) => LANGS.map((lang) => ({ id, lang, path: FILE_GUIDES[id].paths[lang] })));
const FONTS = /(figtree|fredoka)[^/]*\.woff2$/;

/** The file each guide's tool takes on its usual path (the cases of tool-guides.spec.ts), and the tools with a button. */
const USE: Record<FileGuideId, { files: () => TestFile[]; action?: true }> = {
  'guides-heic-to-jpg-on-windows': { files: () => [fixtureFile('heic-06-iphone7-paisagem-gps.heic')] },
  'guides-why-is-my-pdf-so-large': { files: () => [pdfFile('gen-fotos.pdf')] },
  'guides-social-media-image-sizes': { files: () => [fixtureFile('jpg-02-iphone6-paisagem-gps.jpg')] },
  'guides-open-webp-save-as-jpg': { files: () => [fixtureFile('gen-webp-exif-gps.webp')] },
  'guides-jpg-vs-png': { files: () => [fixtureFile('gen-png-transparente.png')] },
  'guides-remove-location-from-photos': { files: () => [fixtureFile('jpg-03-iphone5-paisagem-orientacao3-gps.jpg')] },
  'guides-pdf-to-jpg-resolution': { files: () => [pdfFile('gen-paginas-mistas.pdf')] },
  'guides-split-pdf-file-size': { files: () => [pdfFile('gen-paginas-mistas.pdf')], action: true },
  'guides-combine-pdfs-on-phone': { files: () => [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-acoes.pdf')], action: true },
  'guides-photos-to-one-pdf': { files: () => [fixtureFile('jpg-02-iphone6-paisagem-gps.jpg'), fixtureFile('gen-png-transparente.png')] },
};

async function guideContext(browser: Browser, viewport: { width: number; height: number }, fonts = true): Promise<BrowserContext> {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
  if (!fonts) await context.route(FONTS, (route) => route.abort());
  return context;
}

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

interface Fold {
  slotTop: number;
  chooseBottom: number;
  signature: number;
  oliOverSheet: boolean;
  oliInSheet: number;
  frames: { wider: boolean; hint: boolean; cue: string }[];
}

/** Where the panel, the Choose button and the signature are, in page coordinates, and what each table frame shows. */
function fold(page: Page): Promise<Fold> {
  return page.evaluate(() => {
    // An empty box where a page has no such element (the guides of before the F13b had no sheet).
    const box = (selector: string): DOMRect => document.querySelector(selector)?.getBoundingClientRect() ?? new DOMRect();
    const sheet = box('[data-content="facts"]');
    const oli = box('#fo-tool-root [data-oli]');
    return {
      slotTop: box('#fo-tool-root .fo-slot').top + scrollY,
      chooseBottom: box('#fo-tool-root .fo-drop button').bottom + scrollY,
      signature: box('.fo-top .fo-reviewed').height,
      oliOverSheet: sheet.height > 0 && oli.top < sheet.bottom && oli.bottom > sheet.top && oli.left < sheet.right && oli.right > sheet.left,
      oliInSheet: document.querySelectorAll('[data-content="facts"] [data-oli]').length,
      frames: [...document.querySelectorAll<HTMLElement>('[data-content="measured"] .fo-table-wrap')].map((frame) => {
        const hint = frame.querySelector('.fo-guide__hint');
        return { wider: frame.scrollWidth > frame.clientWidth + 1, hint: Boolean(hint?.checkVisibility()), cue: getComputedStyle(frame).backgroundImage };
      }),
    };
  });
}

/** Whether the browser has scroll-state queries: where it does not, the hint shows under 768px whatever the table. */
const scrollState = (page: Page): Promise<boolean> => page.evaluate(() => CSS.supports('container-type', 'scroll-state'));

test.describe('the tool before the prose: the fold, the signature and the hint (D-47, G-23, F5b F-2)', () => {
  for (const { path } of PAGES) {
    test(`${path}: the panel starts above 740px at 360, the Choose button ends above 800px at 1280, the signature is one line`, async ({ browser }) => {
      const context = await guideContext(browser, PHONE);
      const page = await context.newPage();
      await open(page, path);
      const phone = await fold(page);
      expect(phone.slotTop, 'the top of the panel at 360 × 740').toBeLessThan(PHONE.height);
      expect(phone.signature, 'the signature in one line at 360').toBeLessThanOrEqual(20);
      expect(phone.oliInSheet, 'no Oli in the sheet').toBe(0);
      expect(phone.oliOverSheet, 'the Oli of the panel clear of the sheet at 360').toBe(false);
      const states = await scrollState(page);
      for (const frame of phone.frames) {
        if (frame.wider) {
          expect(frame.hint, 'the hint of a table wider than its frame, at 360').toBe(true);
          expect(frame.cue, 'the edge cue of the frame').not.toBe('none');
        } else if (states) expect(frame.hint, 'no hint where the table fits').toBe(false);
      }
      await page.setViewportSize(WIDE);
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
      const wide = await fold(page);
      expect(wide.chooseBottom, 'the bottom of the Choose button at 1280 × 800').toBeLessThan(WIDE.height);
      expect(wide.oliOverSheet, 'the Oli of the panel clear of the sheet at 1280').toBe(false);
      expect(wide.frames.filter((frame) => frame.hint), 'no hint line from 768px').toEqual([]);
      await context.close();
    });
  }

  // The fold with the fallback faces only (the fonts aborted), as tool-slot.spec.ts does for the tool pages: the sheet and
  // the signature are in Figtree Steady, so the first paint is the layout; the H1 and the lead wrap again when the fonts come.
  for (const lang of LANGS) {
    test(`every guide in ${lang}: the panel starts above 740px at 360 with the fallback faces`, async ({ browser }) => {
      const context = await guideContext(browser, PHONE, false);
      const page = await context.newPage();
      const over: string[] = [];
      for (const { path } of PAGES.filter((one) => one.lang === lang)) {
        await open(page, path);
        const { slotTop, signature } = await fold(page);
        if (slotTop >= PHONE.height) over.push(`${path}: o painel em ${Math.round(slotTop)}px`);
        if (signature > 20) over.push(`${path}: a assinatura com ${signature}px`);
      }
      expect(over).toEqual([]);
      await context.close();
    });
  }
});

// The pixels of the frame's edge: how many of the column `edge` px wide at its left or right side are the colour of the
// dashed line (the token stroke), over the height of the frame. A cue drawn: about 8 of every 14 px; none: 0.
async function cuePixels(page: Page, side: 'left' | 'right'): Promise<number> {
  const frame = page.locator('[data-content="measured"] .fo-table-wrap').first();
  const box = await frame.boundingBox();
  if (!box) throw new Error('no frame');
  const strip = await page.screenshot({ clip: { x: side === 'left' ? box.x : box.x + box.width - 2, y: box.y, width: 2, height: Math.min(box.height, 600) } });
  return page.evaluate(async (png) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    const probe = document.createElement('span');
    probe.style.color = 'var(--stroke)';
    document.body.append(probe);
    const [r = 0, g = 0, b = 0] = (getComputedStyle(probe).color.match(/\d+/g) ?? []).map(Number);
    probe.remove();
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let hits = 0;
    for (let at = 0; at < data.length; at += 4) if (Math.abs((data[at] ?? 0) - r) + Math.abs((data[at + 1] ?? 0) - g) + Math.abs((data[at + 2] ?? 0) - b) < 60) hits += 1;
    return hits / (canvas.width * canvas.height);
  }, strip.toString('base64'));
}

test.describe('the edge cue of a table wider than its frame, CSS only (F5b F-2)', () => {
  test('the HEIC guide: the dashed edge on the side where columns are left, and none where the table fits', async ({ browser }) => {
    const context = await guideContext(browser, PHONE);
    const page = await context.newPage();
    await open(page, FILE_GUIDES['guides-heic-to-jpg-on-windows'].path);
    // The first column starts at the left edge of the frame, so its letters put a few dark pixels in the left strip (about
    // 2%); the dashed line covers more than half of it (8 of every 14px).
    const DRAWN = 0.3;
    const NONE = 0.1;
    await page.locator('[data-content="measured"] .fo-table-wrap').first().scrollIntoViewIfNeeded();
    expect(await cuePixels(page, 'right'), 'at the start, the right edge: columns left').toBeGreaterThan(DRAWN);
    expect(await cuePixels(page, 'left'), 'at the start, the left edge: nothing before').toBeLessThan(NONE);
    await page.locator('[data-content="measured"] .fo-table-wrap').first().evaluate((frame) => frame.scrollTo({ left: frame.scrollWidth }));
    expect(await cuePixels(page, 'left'), 'at the end, the left edge: columns before').toBeGreaterThan(DRAWN);
    expect(await cuePixels(page, 'right'), 'at the end, the right edge: nothing after').toBeLessThan(NONE);
    await page.setViewportSize(WIDE);
    await page.locator('[data-content="measured"] .fo-table-wrap').first().scrollIntoViewIfNeeded();
    const fits = await page.locator('[data-content="measured"] .fo-table-wrap').first().evaluate((frame) => frame.scrollWidth <= frame.clientWidth + 1);
    expect(fits, 'the table of the HEIC guide fits its frame at 1280').toBe(true);
    expect(await cuePixels(page, 'right'), 'at 1280 the table fits: no cue').toBeLessThan(NONE);
    expect(await cuePixels(page, 'left'), 'at 1280 the table fits: no cue').toBeLessThan(NONE);
    await expect(page.locator('.fo-guide__hint').first()).toBeHidden();
    await context.close();
  });
});

// D-50 and D-49: the use, with the Choose button brought into view the way a tap brings it (a shift counts only on the
// screen; DECISOES § G-5). A PerformanceObserver of layout-shift, opened before the files are chosen, adds every shift
// without a recent input until 1.5 s after the Download (Chromium; WebKit has no such API, and there the paragraph under the
// tool keeps its place whenever it was on the screen); the click of a tool's button is a recent input. Then, at 360, the
// first chip ends at most one screen below the top of the Download. The control puts the panel at the top of the screen,
// where the whole band and the text under it are seen, and turns the height lock of the island off.
async function watchShifts(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    const shifts = { cls: 0, moved: [] as string[], from: Infinity };
    (window as unknown as { __shifts: typeof shifts }).__shifts = shifts;
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Shift[]) {
        if (entry.hadRecentInput || entry.startTime < shifts.from) continue;
        shifts.cls += entry.value;
        for (const { node, previousRect, currentRect } of entry.sources) {
          const name = node instanceof Element ? `<${node.tagName.toLowerCase()} class="${node.className}">` : `"${(node?.textContent ?? '').trim().slice(0, 24)}"`;
          shifts.moved.push(`${entry.value.toFixed(3)} ${name} y ${Math.round(previousRect.y)}→${Math.round(currentRect.y)}`);
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

const UNLOCK = '.fo-slot, .fo-slot > * { min-height: 0 !important; } .fo-band { min-height: 0 !important; } .fo-band__ghost { display: none !important; }';

/** One use of the guide's tool: the layout shift, where the paragraph under the tool was before and after, and the chip. */
async function oneUse(browser: Browser, id: FileGuideId, lang: Lang, viewport: { width: number; height: number }, unlock = false): Promise<{ cls: number; moved: string[]; before: number; after: number; onScreen: boolean; chipBelowDownload: number }> {
  const context = await guideContext(browser, viewport);
  await watchShifts(context);
  const page = await context.newPage();
  await open(page, FILE_GUIDES[id].paths[lang]);
  await hydrated(page);
  if (unlock) {
    await page.addStyleTag({ content: UNLOCK });
    await page.evaluate(() => document.querySelector('#fo-tool-root .fo-slot')?.scrollIntoView({ block: 'start' }));
  } else await page.locator('#fo-tool-root .fo-drop button').scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
  // The first block under the island (the paragraph of the tool; the link of before the F13b), not one of its scripts:
  // its top in the page, and in the window.
  const under = (): Promise<[number, number]> =>
    page.evaluate(() => {
      let element = document.querySelector('#fo-tool-root')?.nextElementSibling ?? null;
      while (element && element.tagName === 'SCRIPT') element = element.nextElementSibling;
      const top = (element ?? document.body).getBoundingClientRect().top;
      return [Math.round(top + scrollY), top];
    });
  const [before, inWindow] = await under();
  const onScreen = inWindow < viewport.height;
  await page.evaluate(() => {
    (window as unknown as { __shifts: { from: number } }).__shifts.from = performance.now();
  });
  await page.setInputFiles('#fo-tool-root input[type="file"]', USE[id].files());
  if (USE[id].action) {
    const ready = page.locator('#fo-tool-root :is(.fo-ready, .fo-merge-panel)');
    await expect(ready).toBeVisible({ timeout: 30_000 });
    await ready.locator('.fo-btn--brand').click();
  }
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(1500);
  const shifts = await page.evaluate(() => (window as unknown as { __shifts: { cls: number; moved: string[] } }).__shifts);
  const [after] = await under();
  const chipBelowDownload = await page.evaluate(() => {
    const download = document.querySelector('#fo-tool-root .fo-btn--download')?.getBoundingClientRect();
    const chip = document.querySelector('#fo-tool-root nav.fo-next a.fo-chip')?.getBoundingClientRect();
    return download && chip && chip.height > 0 ? chip.bottom - download.top : Infinity;
  });
  await context.close();
  return { cls: shifts.cls, moved: shifts.moved, before, after, onScreen, chipBelowDownload };
}

test.describe('the result pushes no text: the use moves nothing, and the first chip is on the screen of the Download (D-49, D-50)', () => {
  for (const { id, lang, path } of PAGES) {
    test(`${path}: a layout shift of 0.05 at most at 360 and 1280, and the first chip within one screen of the Download at 360 × 740`, async ({ browser, browserName }) => {
      test.setTimeout(150_000);
      for (const viewport of [PHONE, WIDE]) {
        const use = await oneUse(browser, id, lang, viewport);
        console.log(`[cls do uso] ${browserName} ${path} ${viewport.width}: ${use.cls.toFixed(3)}${use.moved.length ? ` (${use.moved.slice(0, 3).join('; ')})` : ''}`);
        if (browserName === 'chromium') expect(use.cls, `${viewport.width}px: ${use.moved.join('; ')}`).toBeLessThanOrEqual(0.05);
        if (use.onScreen) expect(use.after, `${viewport.width}px: the paragraph under the tool, on the screen, keeps its place`).toBe(use.before);
        if (viewport === PHONE) expect(use.chipBelowDownload, 'the first chip, measured from the top of the Download').toBeLessThanOrEqual(PHONE.height);
      }
    });
  }

  // The control: the same measure with the height lock of the F13a island turned off sees the result push the page.
  test('the measure sees the shift when the height lock of the island is off (control, HEIC guide at 360)', async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'the layout-shift API is Chromium only');
    test.setTimeout(90_000);
    const use = await oneUse(browser, 'guides-heic-to-jpg-on-windows', 'en', PHONE, true);
    expect(use.cls, use.moved.join('; ')).toBeGreaterThan(0.05);
  });
});

// The axe of the table frame scrolled to its middle and focused (both edge cues and the focus ring), at 360 and 1280px,
// in both themes (the guides at rest and with the result are read by a11y.spec.ts).
test.describe('axe on the table of a guide, scrolled and focused, at 360 and 1280px, in both themes', () => {
  for (const id of ['guides-heic-to-jpg-on-windows', 'guides-social-media-image-sizes'] as const) {
    test(`${FILE_GUIDES[id].paths.pt}: the frame of the table scrolled and focused`, async ({ page }) => {
      await page.setViewportSize(PHONE);
      await open(page, FILE_GUIDES[id].paths.pt);
      const frame = page.locator('[data-content="measured"] .fo-table-wrap').first();
      await frame.focus();
      await frame.evaluate((element) => element.scrollTo({ left: (element.scrollWidth - element.clientWidth) / 2 }));
      expect(await violationsEverywhere(page)).toEqual([]);
    });
  }
});
