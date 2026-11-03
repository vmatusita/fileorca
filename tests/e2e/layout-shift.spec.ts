// The layout shift of the first visit on a phone, when Figtree arrives after the first paint (review F4-F7 e-1 and its
// second pass; DECISOES § 305). The fallback font was narrower than Figtree, so a breadcrumb that fit in one row went to
// two and pushed the tool 22 px down: CLS from 0.12 to 0.27 at 320 to 412 px, which Lighthouse never saw. The trail and
// the cookie notice of the first visit now take a face of Figtree with font-display: optional, and the fallback font is
// calibrated. The Figtree file is held until the page has painted, then released, and the breadcrumb, the H1 and the
// notice must stay where the first paint put them, in both browsers. The rest of the text still swaps fonts: Chromium sums its layout shift and prints it, with what moved,
// but does not judge it here, because the fallback renders differently on each system (the CLS of a paragraph that
// loses a line was 0.046 on Windows and 0.257 on the Linux of the CI, on the same page; DECISOES § 305).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { moneyPage, type CalcPageId } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, type FileGuideId } from '../../src/tools/guides/registry.ts';

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
// Languages adjustment: the sweep of the 45 pages of pt and es that the adjustment adds or changes (the QR code generator,
// the 18 Spanish money pages, the 5 Spanish money guides and the 20 file guides) at the five widths, in both browsers, put
// these on the edge of a row: the trail had another number of rows with the fallback font than with Figtree (either
// browser), or 6 px or less left on its last row in Chromium. Measured on the texts of the time (the trail of a file guide
// ends in its own title; the Spanish calculators still had the English names); the sweep is redone when the texts of a
// page change. The paths are read from the registries.
const guideIn = (id: FileGuideId, lang: 'pt' | 'es'): string => FILE_GUIDES[id].paths[lang];
const spanish = (id: CalcPageId): string => moneyPage(id, 'es')?.path ?? `(${id} sem página em es)`;
const CASES: Record<number, string[]> = {
  320: ['/home-affordability-calculator/', '/pt/assinar-pdf/', '/bmi-calculator/', '/btu-calculator/', '/compress-image/to-100kb/', '/compress-image/to-1mb/', '/ovulation-calculator/', guideIn('guides-heic-to-jpg-on-windows', 'pt')],
  360: [...FIRST, '/es/imagen-a-pdf/', '/due-date-calculator/', '/pt/desbloquear-pdf/', guideIn('guides-open-webp-save-as-jpg', 'es'), guideIn('guides-pdf-to-jpg-resolution', 'pt')],
  375: [
    '/mortgage-calculator/biweekly/', '/debt-payoff-calculator/', '/es/marca-de-agua-pdf/', '/refinance-calculator/', '/home-calculators/', '/health-calculators/', '/guides/debt-snowball-vs-avalanche/', '/debt-consolidation-calculator/', '/savings-goal-calculator/', '/mortgage-calculator/extra-payments/',
    guideIn('guides-pdf-to-jpg-resolution', 'pt'), guideIn('guides-open-webp-save-as-jpg', 'es'),
  ],
  393: [...FIRST, '/es/numerar-paginas-pdf/', spanish('auto-loan-calculator'), spanish('mortgage-calculator-biweekly')],
  412: [
    '/credit-card-payoff-calculator/', '/pt/organizar-paginas-pdf/', '/es/calculadora-de-deudas/', '/es/redimensionar-imagen/', '/debt-consolidation-calculator/', '/compound-interest-calculator/',
    spanish('rent-vs-buy-calculator'), spanish('apr-to-apy-calculator'), guideIn('guides-jpg-vs-png', 'pt'), guideIn('guides-jpg-vs-png', 'es'),
    guideIn('guides-why-is-my-pdf-so-large', 'es'), guideIn('guides-remove-location-from-photos', 'es'), guideIn('guides-combine-pdfs-on-phone', 'es'),
  ],
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

/** How tall the breadcrumb is, where the H1 ends, how far an item of the trail passes its width (nothing cut), and where
 * the cookie notice of the first visit starts and how tall it is. */
async function top(page: Page): Promise<{ crumbs: number; h1: number; over: number; notice: string }> {
  return page.evaluate(() => {
    const trail = document.querySelector('.fo-crumbs');
    return {
      crumbs: trail?.getBoundingClientRect().height ?? -1,
      h1: document.querySelector('h1')?.getBoundingClientRect().bottom ?? -1,
      over: trail ? trail.scrollWidth - trail.clientWidth : 0,
      notice: (() => {
        const box = document.getElementById('fo-cookie');
        if (!box || box.hidden) return 'hidden';
        const rect = box.getBoundingClientRect();
        return `${rect.top} ${rect.height}`;
      })(),
    };
  });
}

/** A first visit (a context of its own, nothing in memory, no choice of cookies yet), with Figtree held until the page has painted. */
async function firstVisit(browser: Browser, browserName: string, path: string, width: number): Promise<{ before: Awaited<ReturnType<typeof top>>; after: Awaited<ReturnType<typeof top>>; cls: number; moved: string[] }> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2.625, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => {
    const shifts = { cls: 0, moved: [] as string[] };
    (window as unknown as { __shifts: typeof shifts }).__shifts = shifts;
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Shift[]) {
        if (entry.hadRecentInput) continue;
        shifts.cls += entry.value;
        for (const { node, previousRect, currentRect } of entry.sources) {
          const name = node instanceof Element ? `<${node.tagName.toLowerCase()} class="${node.className}">` : `"${(node?.textContent ?? '').trim().slice(0, 24)}"`;
          shifts.moved.push(`${entry.value.toFixed(3)} ${name} y ${Math.round(previousRect.y)}→${Math.round(currentRect.y)}`);
        }
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
  const { cls, moved } = await page.evaluate(() => (window as unknown as { __shifts: { cls: number; moved: string[] } }).__shifts);
  await context.close();
  return { before, after, cls, moved };
}

for (const [width, pages] of Object.entries(CASES)) {
  for (let start = 0; start < pages.length; start += CHUNK) {
    const chunk = pages.slice(start, start + CHUNK);
    test(`the breadcrumb, the H1 and the cookie notice keep their place when Figtree arrives late, at ${width} px (${chunk[0]} and on)`, async ({ browser, browserName }) => {
      const visits = [];
      for (const path of chunk) visits.push({ path, ...(await firstVisit(browser, browserName, path, Number(width))) });
      // Printed before any assertion, so a red run still shows the shift of every page of the chunk.
      if (browserName === 'chromium') console.log(`[cls] ${browserName} ${width}: ${visits.map(({ path, cls, moved }) => `${path} ${cls.toFixed(3)}${cls > 0.01 ? ` (${moved.join('; ')})` : ''}`).join(', ')}`);
      for (const { path, before, after, moved } of visits) {
        expect(after.over, `${path}: the trail cuts nothing at ${width} px`).toBeLessThanOrEqual(0);
        expect(after, `${path} at ${width} px: the breadcrumb, the H1 and the notice stay where the first paint put them (moved: ${moved.join('; ') || 'nothing'})`).toEqual(before);
      }
    });
  }
}
