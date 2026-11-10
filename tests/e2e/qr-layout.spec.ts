import { expect, test, type Browser, type Page } from '@playwright/test';
import { LANGS, QR_ID, routeById, type Lang } from '../../src/i18n/routes.ts';

// F15 · o QR code no celular (item 6, criterion 6; DECISOES § 658 and § 677), in Chromium and WebKit. The panel's DOM goes
// field, output (the preview, the sentence and the two downloads), options:
// - at 360 × 740, on a return visit (the cookie notice answered before the load), after typing a link: the whole code above
//   the fold in en, pt and es, and the Download PNG at most 200 px below it;
// - at 360 × 420 (the keyboard open), with the box scrolled to the top of the window: the upper half of the code in view;
// - the Tab goes from the box to the two downloads, then to the options, at 360 and at 1280 px;
// - at 768 × 1024 and 1280 × 800, with and without a code, every piece of the panel (the field, the two options, the output,
//   the preview and the two downloads) where it was at the starting point, to 0.5 px. With QR_BASE (the origin of a server of
//   the dist of the starting point, .cache/f15/dist-base) both pages are measured and compared box by box; without it (the
//   CI), the relations that make the drawing of before are checked: two equal columns 32 px apart, the field and under it the
//   two options on the left, 20 px apart, the output on the right with its top at the top of the field, the preview of 320 px.

const LINK = 'https://fileorca.com/';
const PHONE = { width: 360, height: 740 } as const;
const KEYBOARD = { width: 360, height: 420 } as const;
const BASE = process.env['QR_BASE'];

const pathOf = (lang: Lang): string => routeById(QR_ID).paths[lang] ?? '/';

/** A return visit: the answer to the cookie notice is there before the page loads, so nothing covers the panel. */
async function visit(browser: Browser, lang: Lang, viewport: { width: number; height: number }, baseURL?: string): Promise<Page> {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block', ...(baseURL ? { baseURL } : {}) });
  await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
  const page = await context.newPage();
  expect((await page.goto(pathOf(lang)))?.status(), `${pathOf(lang)} answers 200`).toBe(200);
  await page.waitForSelector('#fo-tool-root[data-hydrated="true"]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function typeLink(page: Page): Promise<void> {
  await page.locator('#fo-qr-text').fill(LINK);
  await expect(page.locator('.fo-qr__preview[data-state="ready"] .fo-qr__code > svg')).toBeVisible();
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The pieces of the panel, in coordinates of the document, with selectors that read the panel before and after F15. */
const pieces = (page: Page): Promise<Record<string, Box | null>> =>
  page.evaluate(() => {
    const at = (node: Element | null | undefined): Box | null => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
    };
    const options = document.querySelectorAll('.fo-qr .fo-options');
    return {
      panel: at(document.querySelector('.fo-qr')),
      field: at(document.querySelector('.fo-qr .fo-field:not(.fo-options)')),
      textarea: at(document.querySelector('#fo-qr-text')),
      optionsOli: at(options[0]),
      optionsSize: at(options[1]),
      out: at(document.querySelector('.fo-qr__out')),
      preview: at(document.querySelector('.fo-qr__preview')),
      actions: at(document.querySelector('.fo-qr__actions')),
      png: at(document.querySelector('.fo-qr__png')),
      svg: at(document.querySelector('.fo-qr__actions .fo-btn:not(.fo-qr__png)')),
      wait: at(document.querySelector('.fo-qr__wait')),
    };
  });

/** What has the focus: a short name for the steps of the Tab. */
const focused = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const node = document.activeElement as HTMLElement | null;
    if (!node) return 'none';
    if (node.id === 'fo-qr-text') return 'box';
    if (node.classList.contains('fo-qr__png')) return 'png';
    if (node.matches('.fo-qr__actions .fo-btn')) return 'svg';
    if (node instanceof HTMLInputElement && node.type === 'radio') return `radio:${node.name}`;
    return `${node.tagName.toLowerCase()}.${node.className}`;
  });

test.describe('the QR code on a phone (criterion 6)', () => {
  for (const lang of LANGS) {
    test(`${lang}, 360 × 740: the whole code is above the fold after a link is typed, and the Download PNG at most 200 px below it`, async ({ browser, browserName }) => {
      const page = await visit(browser, lang, PHONE);
      await typeLink(page);
      await page.evaluate(() => scrollTo(0, 0));
      const m = await page.evaluate(() => {
        const box = (selector: string) => document.querySelector(selector)?.getBoundingClientRect();
        const preview = box('.fo-qr__preview');
        const field = box('.fo-qr .fo-field:not(.fo-options)');
        const png = box('.fo-qr__png');
        return { fold: innerHeight, scroll: scrollY, codeTop: preview?.top ?? -1, codeEnd: preview?.bottom ?? Infinity, side: preview?.width ?? 0, fieldEnd: field?.bottom ?? -1, pngTop: png?.top ?? Infinity };
      });
      console.log(`[QR 360x740] ${browserName} ${lang} campo até ${m.fieldEnd} · código ${m.codeTop}–${m.codeEnd} (${m.side} px) · Baixar PNG em ${m.pngTop} · dobra ${m.fold}`);
      expect(m.scroll, 'the page is at its top').toBe(0);
      expect(m.codeEnd, `the code ends ${(m.codeEnd - m.fold).toFixed(1)} px from the fold`).toBeLessThanOrEqual(m.fold);
      expect(m.pngTop - m.fold, 'the Download PNG is at most 200 px below the fold').toBeLessThanOrEqual(200);
      expect(m.codeTop, 'the code is born under the box').toBeGreaterThan(m.fieldEnd);
      expect(m.side, 'the preview is at most 240 px a side below 768 px').toBeLessThanOrEqual(240);
    });

    test(`${lang}, 360 × 420 (the keyboard open): with the box at the top of the window, the upper half of the code is in view`, async ({ browser }) => {
      const page = await visit(browser, lang, KEYBOARD);
      await typeLink(page);
      await page.evaluate(() => {
        const box = document.querySelector('#fo-qr-text') as HTMLElement;
        scrollTo(0, box.getBoundingClientRect().top + scrollY);
      });
      const seen = await page.evaluate(() => {
        const box = (document.querySelector('#fo-qr-text') as HTMLElement).getBoundingClientRect();
        const code = (document.querySelector('.fo-qr__preview') as HTMLElement).getBoundingClientRect();
        return { boxTop: box.top, top: code.top, half: code.top + code.height / 2, fold: innerHeight };
      });
      expect(Math.abs(seen.boxTop), 'the box is at the top of the window').toBeLessThanOrEqual(1);
      expect(seen.top, 'the code starts in the window').toBeGreaterThanOrEqual(0);
      expect(seen.half, 'the upper half of the code is in view').toBeLessThanOrEqual(seen.fold);
    });
  }
});

test.describe('the order of the Tab: the box, the two downloads, the options (§ 658)', () => {
  for (const viewport of [PHONE, { width: 1280, height: 800 }]) {
    test(`at ${viewport.width} px, with a code and without one`, async ({ browser, browserName }) => {
      // The WebKit skips the buttons with Tab, as Safari does without its keyboard setting: Option+Tab goes through them.
      const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
      const page = await visit(browser, 'en', viewport);
      const walk = async (steps: number): Promise<string[]> => {
        await page.locator('#fo-qr-text').focus();
        const seen = [await focused(page)];
        for (let i = 0; i < steps; i += 1) {
          await page.keyboard.press(tab);
          seen.push(await focused(page));
        }
        return seen;
      };
      expect(await walk(2), 'no code yet: the place of the downloads only says why').toEqual(['box', 'radio:fo-qr-oli', 'radio:fo-qr-size']);
      await typeLink(page);
      expect(await walk(4), 'with a code').toEqual(['box', 'png', 'svg', 'radio:fo-qr-oli', 'radio:fo-qr-size']);
      // Shift+Tab walks back the same way.
      const back = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
      const seen: string[] = [];
      for (let i = 0; i < 4; i += 1) {
        await page.keyboard.press(back);
        seen.push(await focused(page));
      }
      expect(seen).toEqual(['radio:fo-qr-oli', 'svg', 'png', 'box']);
    });
  }
});

test.describe('from 768 px the panel draws as before (§ 658)', () => {
  for (const viewport of [{ width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
    test(`at ${viewport.width} × ${viewport.height}, with and without a code, in the three languages`, async ({ browser, browserName }) => {
      test.setTimeout(120_000);
      const found: string[] = [];
      let compared = 0;
      for (const lang of LANGS) {
        const page = await visit(browser, lang, viewport);
        const base = BASE ? await visit(browser, lang, viewport, BASE) : null;
        for (const state of ['empty', 'code'] as const) {
          if (state === 'code') {
            await typeLink(page);
            if (base) await typeLink(base);
          }
          const now = await pieces(page);
          const where = `${lang} ${viewport.width}px ${state}`;
          if (base) {
            // Box by box against the page of the starting point, on the same machine and in the same run.
            const before = await pieces(base);
            for (const [name, box] of Object.entries(before)) {
              const after = now[name] ?? null;
              if (box === null || after === null) {
                if (box !== after) found.push(`${where} ${name}: ${JSON.stringify(box)} → ${JSON.stringify(after)}`);
                continue;
              }
              compared += 1;
              for (const key of ['x', 'y', 'w', 'h'] as const) {
                if (Math.abs(box[key] - after[key]) > 0.5) found.push(`${where} ${name}.${key}: ${box[key].toFixed(2)} → ${after[key].toFixed(2)}`);
              }
            }
          } else {
            // The relations of the drawing of before, when no page of the starting point is served (the CI).
            const { field, optionsOli, optionsSize, out, preview, actions } = now;
            if (!field || !optionsOli || !optionsSize || !out || !preview || !actions) {
              found.push(`${where}: a piece is missing`);
              continue;
            }
            compared += 1;
            const near = (a: number, b: number) => Math.abs(a - b) <= 0.5;
            if (!near(optionsOli.x, field.x) || !near(optionsSize.x, field.x) || !near(optionsOli.w, field.w) || !near(optionsSize.w, field.w)) found.push(`${where}: the options are not under the field, in its column`);
            if (!near(out.w, field.w)) found.push(`${where}: the two columns differ (${field.w} and ${out.w})`);
            if (!near(out.x - (field.x + field.w), 32)) found.push(`${where}: the columns are ${(out.x - field.x - field.w).toFixed(1)} px apart, not 32`);
            if (!near(out.y, field.y)) found.push(`${where}: the output starts at ${out.y}, the field at ${field.y}`);
            if (!near(optionsOli.y - (field.y + field.h), 20)) found.push(`${where}: field to options ${(optionsOli.y - field.y - field.h).toFixed(1)} px, not 20`);
            if (!near(optionsSize.y - (optionsOli.y + optionsOli.h), 20)) found.push(`${where}: the two options ${(optionsSize.y - optionsOli.y - optionsOli.h).toFixed(1)} px apart, not 20`);
            if (!near(preview.w, 320) || !near(preview.h, 320)) found.push(`${where}: the preview is ${preview.w} × ${preview.h}, not 320`);
            if (!near(preview.y, out.y)) found.push(`${where}: the preview is not at the top of the output`);
            if (actions.y < preview.y + preview.h) found.push(`${where}: the downloads are not under the preview`);
          }
        }
        await page.context().close();
        await base?.context().close();
      }
      console.log(`[QR ${viewport.width}] ${browserName} ${BASE ? `caixa a caixa contra ${BASE}` : 'relações do desenho de hoje'}: ${compared} comparações, ${found.length} diferenças`);
      expect(compared).toBeGreaterThan(0);
      expect(found).toEqual([]);
    });
  }
});
