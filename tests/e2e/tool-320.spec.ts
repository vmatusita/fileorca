import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { hydrated } from './lib/page.ts';

// F13b · the tool page at 320 px (decision 9 of the run; the group 22 rows the F13a left; DECISOES § M-1 and § M-2).
// - F13a R-c-1: with a photo of a phone (EXIF and GPS), the result of the presets and of the compressor grew past the
//   rectangle at 320 px (418px for 356 in "para 100 KB" in pt and es; 378 and 395 elsewhere): the placard took two lines
//   of the sentence and the ghost buttons went to two rows. Under 340 px the placard leaves the sentence, the buttons
//   keep one row, and the sentences of the presets in pt and es are shorter.
// - F13a R-a-6: from 320 to 440 px the corner of the placard (turned -4°) went 3.5 to 3.9px into the box of the page's
//   seal. It hangs 6px less, without going further into the second line of the sentence.
// The third row (R-c-3, the Choose button under the notice at 320 × 640) is in cookie-notice.spec.ts.

const PHOTO = () => ({ name: 'photo.jpg', mimeType: 'image/jpeg', buffer: readFileSync(resolve('fixtures/images/jpg-02-iphone6-paisagem-gps.jpg')) });
const PAGES = [
  '/compress-image/', '/pt/comprimir-imagem/', '/es/comprimir-imagen/',
  '/compress-image/to-100kb/', '/pt/comprimir-imagem/para-100kb/', '/es/comprimir-imagen/a-100kb/',
  '/compress-image/to-1mb/', '/pt/comprimir-imagem/para-1mb/', '/es/comprimir-imagen/a-1mb/',
  '/resize-image/youtube-thumbnail/', '/pt/redimensionar-imagem/miniatura-youtube/', '/es/redimensionar-imagen/miniatura-youtube/',
];
/** The pages with a placard (the compressors and their presets). */
const PLACARD = PAGES.filter((path) => !/youtube/.test(path));

async function result(page: Page, path: string, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 740 });
  await page.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
  expect((await page.goto(path))?.status(), path).toBe(200);
  await hydrated(page);
  await page.evaluate(() => document.fonts.ready);
  await page.setInputFiles('input[type="file"]', PHOTO());
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 60_000 });
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
}

test.describe('F13a R-c-1: at 320 px a photo of a phone keeps the rectangle', () => {
  for (const path of PAGES) {
    test(`${path}: the result is 356px tall, with the buttons in one row`, async ({ page }) => {
      await result(page, path, 320);
      const got = await page.evaluate(() => {
        const rows = new Set([...document.querySelectorAll('.fo-result__more .fo-btn')].map((button) => Math.round(button.getBoundingClientRect().top)));
        return { slot: document.querySelector('.fo-slot')?.getBoundingClientRect().height ?? 0, rows: rows.size };
      });
      expect(Math.abs(got.slot - 356), `${path}: ${got.slot}px`).toBeLessThanOrEqual(1);
      expect(got.rows, `${path}: Start over and Before and after in one row`).toBe(1);
    });
  }
});

/** How far the top edge of the turned placard goes into the seal's box, and its lowest point past the sentence's 1st line. */
function placardGeometry(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('.fo-result .fo-placard');
    const seal = document.querySelector('main .fo-seal')?.getBoundingClientRect();
    const says = document.querySelector('.fo-result .fo-result__says');
    if (!el || !seal || !says) return null;
    if (getComputedStyle(el).display === 'none') return { hidden: true, into: 0, line2: 0 };
    const box = el.getBoundingClientRect();
    const cx = (box.left + box.right) / 2;
    const cy = (box.top + box.bottom) / 2;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const a = (-4 * Math.PI) / 180;
    const at = (x: number, y: number): [number, number] => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)];
    const p0 = at(-w / 2, -h / 2);
    const p1 = at(w / 2, -h / 2);
    const left = Math.max(seal.left, p0[0]);
    const right = Math.min(seal.right, p1[0]);
    const yAt = (x: number) => p0[1] + ((x - p0[0]) * (p1[1] - p0[1])) / (p1[0] - p0[0]);
    const into = right > left ? Math.max(0, seal.bottom - Math.min(yAt(left), yAt(right))) : 0;
    const line2 = says.getBoundingClientRect().top + parseFloat(getComputedStyle(says).lineHeight);
    const bottom = Math.max(at(-w / 2, h / 2)[1], at(w / 2, h / 2)[1]);
    return { hidden: false, into, line2: bottom - line2 };
  });
}

test.describe('F13a R-a-6: the placard never touches the seal of the page', () => {
  for (const path of PLACARD) {
    test(`${path}: from 320 to 440 px`, async ({ page }) => {
      await result(page, path, 440);
      for (let width = 320; width <= 440; width += 20) {
        await page.setViewportSize({ width, height: 740 });
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
        const got = await placardGeometry(page);
        expect(got, `${path} at ${width}px`).not.toBeNull();
        expect(got?.hidden, `${path} at ${width}px: the placard shows from 340px`).toBe(width < 340);
        expect(got?.into ?? 99, `${path} at ${width}px: into the seal`).toBe(0);
        // Its lowest corner goes no further into the second line than before (2.4 to 2.9px; 3px at most).
        expect(got?.line2 ?? 99, `${path} at ${width}px: into the 2nd line`).toBeLessThanOrEqual(3);
      }
    });
  }
});
