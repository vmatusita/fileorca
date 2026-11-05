// F13b (UX-12 A, decision 4; DECISOES § 550): the labels and the narrow tables of the calculators, in both browsers, with
// Figtree and with the fallback font of the first visit (the Figtree files blocked, so the calibrated "Figtree Fallback" of
// fonts.css draws, § 305 and § 537): the BTU rail (Normal, Shade, Sun) and the Paint labels (Coverage, Door area, Window area)
// on one line at 360 and 320 px, with the "example" tag where they have it (F7 f-13, obs 3 with the F10 p-3); the compact tag
// below 400 px; the Spanish labels of Idiomas E-2 on one line at 360 px with the fallback font, so the tool never moves when
// Figtree arrives; the short dates of the ovulation in fixed columns at 320 and 360 px (F7 obs 2); and the years of the 15 o
// 30 años rates in the accessible description (Idiomas R2-03). The name puts it next to calc-form.spec.ts, before the design
// spec, in a light part (DECISOES § 142 and § 274).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { LIFE_CALC_PAGES, moneyPage } from '../../src/tools/calc/registry.ts';
import { hydrated } from './lib/page.ts';

const FIGTREE = /figtree[^/]*\.woff2$/i;

/** A page with the choice of cookies stored, at a width, with Figtree or with the fallback font only. */
async function openWith(browser: Browser, path: string, width: number, font: 'figtree' | 'fallback'): Promise<Page> {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  await context.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
  if (font === 'fallback') await context.route(FIGTREE, (route) => route.abort());
  const page = await context.newPage();
  expect((await page.goto(path))?.status(), path).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  await hydrated(page);
  if (font === 'figtree') await page.evaluate(() => document.fonts.load('600 15px Figtree'));
  return page;
}

/** How many lines a label (or an option) takes: its height over its line height. */
async function lines(page: Page, selector: string): Promise<{ text: string; lines: number }[]> {
  return page.locator(selector).evaluateAll((nodes) =>
    nodes.map((node) => ({ text: node.textContent?.trim() ?? '', lines: Math.round(node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight)) })),
  );
}

for (const font of ['figtree', 'fallback'] as const) {
  for (const width of [360, 320]) {
    test(`the BTU rail and the Paint labels take one line at ${width} px, with ${font === 'figtree' ? 'Figtree' : 'the fallback font'} (F7 f-13, obs 3)`, async ({ browser }) => {
      const btu = await openWith(browser, LIFE_CALC_PAGES['btu-calculator'].path, width, font);
      const options = await btu.locator('fieldset:has(input[name="fo-calc-su"]) .fo-seg__opt').evaluateAll((labels) =>
        labels.map((label) => ({ text: label.textContent?.trim() ?? '', height: Math.round(label.getBoundingClientRect().height) })),
      );
      expect(options.map((option) => option.text)).toEqual(['Normal', 'Shade', 'Sun']);
      // One line each: the three options of the rail are as tall as one another and as a single line of the rail (48 px).
      for (const option of options) expect(option.height, option.text).toBeLessThanOrEqual(48);
      await expect(btu.locator('#fo-calc-su-note')).toHaveText("Shade takes 10% off the table's size; sun adds 10%.");
      await expect(btu.locator('fieldset:has(input[name="fo-calc-su"])')).toHaveAttribute('aria-describedby', 'fo-calc-su-note');
      await btu.context().close();
      const paint = await openWith(browser, LIFE_CALC_PAGES['paint-calculator'].path, width, font);
      const labels = await lines(paint, 'label[for="fo-calc-cv"], label[for="fo-calc-da"], label[for="fo-calc-wn"]');
      expect(labels.map((label) => label.text)).toEqual(['Coverageexample', 'Door areaexample', 'Window areaexample']);
      for (const label of labels) expect(label.lines, label.text).toBe(1);
      expect(await paint.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await paint.context().close();
    });
  }
}

// The compact tag below 400 px: 6 px from the label, 4 px of padding and 0.02em of letter-spacing, about 12 px less than the
// tag of 400 px and up (Idiomas E-2, F7 obs 3).
test('the "example" tag is compact below 400 px', async ({ browser }) => {
  const path = moneyPage('refinance-calculator', 'es')?.path ?? '';
  const narrow = await openWith(browser, path, 360, 'figtree');
  const wide = await openWith(browser, path, 412, 'figtree');
  const tag = (page: Page) => page.locator('label[for="fo-calc-r"] .fo-tag').evaluate((node) => ({ width: node.getBoundingClientRect().width, padding: getComputedStyle(node).paddingLeft }));
  const small = await tag(narrow);
  const big = await tag(wide);
  expect(small.padding).toBe('4px');
  expect(big.width - small.width).toBeGreaterThanOrEqual(8);
  await narrow.context().close();
  await wide.context().close();
});

// Idiomas E-2: the Spanish half-width labels with the tag ("Tasa nueva", "Plazo nuevo", "Tasa anual") take one line at 360 px
// with the fallback font, and the tool does not move when Figtree arrives (the field under them keeps its place).
const E2 = [
  [moneyPage('refinance-calculator', 'es')?.path ?? '', ['r']],
  [moneyPage('debt-consolidation-calculator', 'es')?.path ?? '', ['nr', 'nm']],
  [moneyPage('compound-interest-calculator', 'es')?.path ?? '', ['r']],
  [moneyPage('simple-interest-calculator', 'es')?.path ?? '', ['r']],
  [moneyPage('savings-goal-calculator', 'es')?.path ?? '', ['r']],
] as const;
for (const [path, keys] of E2) {
  test(`${path}: the labels with the tag take one line at 360 px with the fallback font, and the tool stays when Figtree arrives (E-2)`, async ({ browser }) => {
    const fallback = await openWith(browser, path, 360, 'fallback');
    const figtree = await openWith(browser, path, 360, 'figtree');
    for (const key of keys) {
      const label = `label[for="fo-calc-${key}"]`;
      if (!(await fallback.locator(label).count())) continue;
      for (const [page, name] of [[fallback, 'reserva'], [figtree, 'Figtree']] as const) {
        const height = await page.locator(label).evaluate((node) => node.getBoundingClientRect().height);
        expect(height, `${key} com a ${name}`).toBeLessThanOrEqual(20);
      }
    }
    const where = (page: Page) => page.locator('.fo-rhero').evaluate((node) => Math.round(node.getBoundingClientRect().top + window.scrollY));
    expect(await where(fallback)).toBe(await where(figtree));
    await fallback.context().close();
    await figtree.context().close();
  });
}

// F7 obs 2: the ovulation's dates on the screen are short, in fixed columns: at 320 and 360 px no date breaks between its month
// and its day, and the table never scrolls sideways.
for (const width of [320, 360]) {
  test(`the ovulation dates never break between the month and the day at ${width} px, in fixed columns (obs 2)`, async ({ browser }) => {
    const page = await openWith(browser, LIFE_CALC_PAGES['ovulation-calculator'].path, width, 'figtree');
    const seen = await page.locator('#fo-calc-schedule .fo-amort-wrap').evaluate((wrap) => {
      const broken: string[] = [];
      for (const cell of wrap.querySelectorAll('tbody th, tbody td')) {
        const text = cell.firstChild;
        if (!text || text.nodeType !== Node.TEXT_NODE) continue;
        // Each "Mon d" (glued by a no-break space) is on one line.
        for (const match of (text.textContent ?? '').matchAll(/[A-Z][a-z]{2} \d{1,2}/g)) {
          const range = document.createRange();
          range.setStart(text, match.index);
          range.setEnd(text, match.index + match[0].length);
          if (new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size > 1) broken.push(match[0]);
        }
      }
      const table = wrap.querySelector('table')!;
      return { broken, scroll: wrap.scrollWidth - wrap.clientWidth, layout: getComputedStyle(table).tableLayout, first: table.querySelector('thead th')!.getBoundingClientRect().width / table.getBoundingClientRect().width };
    });
    expect(seen.broken).toEqual([]);
    expect(seen.scroll).toBeLessThanOrEqual(0);
    expect(seen.layout).toBe('fixed');
    expect(Math.round(seen.first * 100)).toBe(30);
    await expect(page.locator('#fo-calc-schedule tbody tr').first().locator('td').first()).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    await page.context().close();
  });
}

// Idiomas R2-03: in the 15 o 30 años preset, the rate fields keep their short visible label ("Tasa a 15", § 124) and get the
// years in their accessible description, from a hidden text; the result stays above the fold at 360 x 740.
test('the 15 o 30 años rates have the years in their accessible description, and the result stays above the fold (R2-03)', async ({ browser }) => {
  const page = await openWith(browser, moneyPage('mortgage-calculator-15-vs-30-year', 'es')?.path ?? '', 360, 'figtree');
  await page.setViewportSize({ width: 360, height: 740 });
  await expect(page.locator('label[for="fo-calc-r15"] > span').first()).toHaveText('Tasa a 15');
  await expect(page.locator('#fo-calc-r15')).toHaveAccessibleDescription(/Tasa a 15 años/);
  await expect(page.locator('#fo-calc-r30')).toHaveAccessibleDescription(/Tasa a 30 años/);
  const number = await page.locator('.fo-rhero__num').evaluate((node) => node.getBoundingClientRect().bottom + window.scrollY);
  expect(number).toBeLessThanOrEqual(740);
  await page.context().close();
});
