// The layout shift of the first visit on a phone, when Figtree arrives after the first paint (review F4-F7 e-1 and its
// second pass; DECISOES § 305). The fallback font was narrower than Figtree, so a breadcrumb that fit in one row went to
// two and pushed the tool 22 px down: CLS from 0.12 to 0.27 at 320 to 412 px, which Lighthouse never saw. The trail now
// has its own face of Figtree, with font-display: optional, and the fallback font is calibrated. The Figtree file is held
// until the page has painted, then released: in Chromium the shifts are summed; WebKit reports no layout shift, so there
// the breadcrumb and the H1 are measured before and after the font arrives.
import { expect, test, type Browser, type Page } from '@playwright/test';

// Each width with the pages whose trail sat on the edge of a row there, in the sweeps of every page (before the
// correction and with each candidate of it), and the twelve pages of the first measure at 360 and 393 px.
const FIRST = [
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
const CASES: Record<number, string[]> = {
  320: ['/home-affordability-calculator/', '/pt/assinar-pdf/', '/bmi-calculator/', '/btu-calculator/', '/compress-image/to-100kb/', '/compress-image/to-1mb/', '/ovulation-calculator/'],
  360: [...FIRST, '/es/imagen-a-pdf/', '/due-date-calculator/', '/pt/desbloquear-pdf/'],
  375: ['/mortgage-calculator/biweekly/', '/debt-payoff-calculator/', '/es/marca-de-agua-pdf/', '/refinance-calculator/', '/home-calculators/', '/health-calculators/', '/guides/debt-snowball-vs-avalanche/', '/debt-consolidation-calculator/', '/savings-goal-calculator/', '/mortgage-calculator/extra-payments/'],
  393: [...FIRST, '/es/numerar-paginas-pdf/'],
  412: ['/credit-card-payoff-calculator/', '/pt/organizar-paginas-pdf/', '/es/calculadora-de-deudas/', '/es/redimensionar-imagen/', '/debt-consolidation-calculator/', '/compound-interest-calculator/'],
};
const CHUNK = 8;
const FIGTREE = /figtree[^/]*\.woff2$/;

/** Two frames, or a second at most: WebKit paints no frame of a hub while its Figtree is held, so nothing can move there. */
async function painted(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        setTimeout(resolve, 1000);
      }),
  );
}

/** How tall the breadcrumb is, where the H1 ends, and how far an item of the trail passes its width (nothing cut). */
async function top(page: Page): Promise<{ crumbs: number; h1: number; over: number }> {
  return page.evaluate(() => {
    const trail = document.querySelector('.fo-crumbs');
    return {
      crumbs: trail?.getBoundingClientRect().height ?? -1,
      h1: document.querySelector('h1')?.getBoundingClientRect().bottom ?? -1,
      over: trail ? trail.scrollWidth - trail.clientWidth : 0,
    };
  });
}

/** A first visit (a context of its own, nothing in memory), with Figtree held until the page has painted. */
async function firstVisit(browser: Browser, browserName: string, path: string, width: number): Promise<{ before: Awaited<ReturnType<typeof top>>; after: Awaited<ReturnType<typeof top>>; cls: number }> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2.625, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('fo-consent', 'denied');
    (window as unknown as { __cls: number }).__cls = 0;
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const page = await context.newPage();
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
  // Chromium settles an optional face at the first paint. WebKit still takes the file in the 100 ms block period after
  // asking for it (the trail then moves, as with swap), and keeps the fallback once that period is over (§ 305).
  if (browserName !== 'chromium') await page.waitForTimeout(150);
  release();
  await page.waitForFunction(() => [...document.fonts].some((font) => font.family.replaceAll('"', '') === 'Figtree' && font.status === 'loaded'));
  await painted(page);
  await page.waitForTimeout(200);
  const after = await top(page);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  await context.close();
  return { before, after, cls };
}

for (const [width, pages] of Object.entries(CASES)) {
  for (let start = 0; start < pages.length; start += CHUNK) {
    const chunk = pages.slice(start, start + CHUNK);
    test(`no layout shift when Figtree arrives late, at ${width} px (${chunk[0]} and on)`, async ({ browser, browserName }) => {
      const results: string[] = [];
      for (const path of chunk) {
        const { before, after, cls } = await firstVisit(browser, browserName, path, Number(width));
        expect(after.over, `${path}: the trail cuts nothing at ${width} px`).toBeLessThanOrEqual(0);
        if (browserName === 'chromium') {
          results.push(`${path} ${cls.toFixed(3)}`);
          expect(cls, `${path} at ${width} px`).toBeLessThanOrEqual(0.05);
          expect(after.crumbs, `${path}: the breadcrumb keeps its height at ${width} px`).toBe(before.crumbs);
        } else {
          expect(after, `${path} at ${width} px: the breadcrumb and the H1 stay where the first paint put them`).toEqual(before);
        }
      }
      if (results.length) console.log(`[cls] ${browserName} ${width}: ${results.join(', ')}`);
    });
  }
}
