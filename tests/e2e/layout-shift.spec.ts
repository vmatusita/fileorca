// The layout shift of the first visit on a phone, when Figtree arrives after the first paint (review F4-F7 e-1;
// DECISOES § 305). The fallback font was narrower than Figtree, so a breadcrumb that fit in one line went to two and
// pushed the tool 22 px down: CLS from 0.12 to 0.27 at 360 and 393 px, which Lighthouse never saw (it measures at
// 412 px). In Chromium the Figtree file is held until the page has painted, then released, and the shifts are summed.
// WebKit reports no layout shift, so there the breadcrumb and the H1 are measured with Figtree blocked and with it.
import { expect, test, type Page } from '@playwright/test';

const PAGES = [
  '/mortgage-calculator/',
  '/auto-loan-calculator/',
  '/refinance-calculator/',
  '/simple-interest-calculator/',
  '/ovulation-calculator/',
  '/square-footage-calculator/',
  '/money-calculators/',
  '/guides/photos-to-one-pdf/',
  '/pt/cortar-imagem/',
  '/pt/excluir-paginas-pdf/',
  '/es/calculadora-de-hipoteca/',
  '/compress-image/',
];
const FIGTREE = /figtree[^/]*\.woff2$/;

async function painted(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

/** Where the H1 ends and how tall the breadcrumb is. */
async function top(page: Page): Promise<{ crumbs: number; h1: number }> {
  return page.evaluate(() => ({
    crumbs: document.querySelector('.fo-crumbs')?.getBoundingClientRect().height ?? -1,
    h1: document.querySelector('h1')?.getBoundingClientRect().bottom ?? -1,
  }));
}

for (const width of [360, 393]) {
  test(`no layout shift when Figtree arrives late, at ${width} px`, async ({ browser, browserName }) => {
    const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2.625, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
    const page = await context.newPage();
    if (browserName !== 'chromium') {
      for (const path of PAGES) {
        await page.route(FIGTREE, (route) => route.abort());
        await page.goto(path);
        const fallback = await top(page);
        await page.unroute(FIGTREE);
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await painted(page);
        expect(await top(page), `${path} at ${width} px: the breadcrumb and the H1 stay where the fallback put them`).toEqual(fallback);
      }
      await context.close();
      return;
    }
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    const results: string[] = [];
    for (const path of PAGES) {
      let release: () => void = () => {};
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route(FIGTREE, async (route) => {
        await held;
        await route.continue();
      });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await painted(page);
      const before = await top(page);
      release();
      await page.waitForFunction(() => [...document.fonts].some((font) => font.family.includes('Figtree') && font.status === 'loaded'));
      await painted(page);
      await page.waitForTimeout(300);
      await page.unroute(FIGTREE);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      results.push(`${path} ${cls.toFixed(3)}`);
      expect(cls, `${path} at ${width} px`).toBeLessThanOrEqual(0.05);
      expect((await top(page)).crumbs, `${path}: the breadcrumb keeps its height at ${width} px`).toBe(before.crumbs);
    }
    console.log(`[cls] ${browserName} ${width}: ${results.join(', ')}`);
    await context.close();
  });
}
