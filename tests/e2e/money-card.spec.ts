// F13b (UX-12 A, decision 4; docs/propostas/ux-v2/calc.html, "Os testes da F13"; DECISOES § 544 and the next ones): the
// calculator page with the result, the Download PDF and the error in one card. Every calculator page in the languages it has
// (the 18 money pages in English and in Spanish, the 8 of Brazil, the 11 home and health pages): the signature in one line,
// the number above the cookie notice and the Download PDF above the fold at 360 x 740, the card that never changes its height,
// the error said in the card with the last result that worked, the order of the island and its blocks, and the headings.
// The name puts it right after money-calc.spec.ts, among the money specs of the light parts (DECISOES § 142).
import { expect, test, type Page } from '@playwright/test';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, LIFE_CALC_IDS, LIFE_CALC_PAGES, moneyPage } from '../../src/tools/calc/registry.ts';
import { QR_ID, routeById } from '../../src/i18n/routes.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import ptShared from '../../src/tools/calc/i18n/pt.ts';
import { dismissCookies, hydrated } from './lib/page.ts';

/** Every calculator page, in the languages it exists in. */
const CALC_PATHS: string[] = [
  ...CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path),
  ...CALC_PAGE_IDS.map((id) => moneyPage(id, 'es')?.path ?? `(${id} sem página em es)`),
  ...BR_CALC_IDS.map((id) => moneyPage(id, 'pt')?.path ?? `(${id} sem página em pt)`),
  ...LIFE_CALC_IDS.map((id) => LIFE_CALC_PAGES[id].path),
];
const BLOCK = 14;
/** The pages in blocks, a test each, so a block keeps the room of its time on the WebKit of the CI (DECISOES § 306). */
const blocks = (paths: readonly string[]): { name: string; paths: string[] }[] => {
  const out: { name: string; paths: string[] }[] = [];
  for (let start = 0; start < paths.length; start += BLOCK) out.push({ name: `pages ${start + 1} to ${Math.min(start + BLOCK, paths.length)}`, paths: paths.slice(start, start + BLOCK) });
  return out;
};

/** Opens a page with the choice of cookies stored (the notice closed), at a width. */
async function openAt(page: Page, path: string, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  expect((await page.goto(path))?.status(), path).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
});

// "Revisado" (G-23): the signature of the top takes one line at 360 px (20 px), with the name and the day as <time datetime>;
// the first publication went down to the block of the sources. gate:dinheiro-saude reads the same block.
for (const block of blocks(CALC_PATHS)) {
  test(`the signature takes one line at 360 px, and the first publication is with the sources (${block.name})`, async ({ page }) => {
    test.setTimeout(120_000);
    const wrong: string[] = [];
    for (const path of block.paths) {
      await openAt(page, path, 360, 740);
      const signed = page.locator('.fo-top [data-ymyl="reviewed"]');
      await expect(signed, path).toHaveCount(1);
      const height = await signed.evaluate((node) => node.getBoundingClientRect().height);
      if (height > 20) wrong.push(`${path}: a assinatura tem ${height} px`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test((await signed.locator('time').getAttribute('datetime')) ?? '')) wrong.push(`${path}: sem <time datetime>`);
      if (!/Victor Yuki Matusita · /.test((await signed.textContent()) ?? '')) wrong.push(`${path}: sem o nome e o ponto`);
      if ((await page.locator('[data-ymyl="source"] .fo-reviewed time[datetime]').count()) !== 1) wrong.push(`${path}: a primeira publicação não está nas fontes`);
    }
    expect(wrong).toEqual([]);
  });
}

/** Two frames: Preact has drawn the last change. */
const frames = (page: Page) => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));

/** The card: its top and height in the page, and the Download PDF in it (null while there is none). */
async function card(page: Page): Promise<{ top: number; height: number; download: { bottom: number; width: number } | null; inner: number }> {
  return page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('.fo-rhero');
    if (!hero) throw new Error('no ResultHero');
    const box = hero.getBoundingClientRect();
    const style = getComputedStyle(hero);
    const button = hero.querySelector('.fo-btn--download')?.getBoundingClientRect();
    return {
      top: Math.round(box.top + window.scrollY),
      height: Math.round(box.height * 10) / 10,
      download: button ? { bottom: button.bottom + window.scrollY, width: button.width } : null,
      inner: hero.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
    };
  });
}

/** The first field of the main fields, a number or a day: the one the person types in first. */
const firstField = (page: Page) => page.locator('.fo-calc__main :is(input[inputmode], input[type="date"])').first();

/** A value of the same length with its last digit changed: "375,000" → "375,001", "2026-09-07" → "2026-09-01". */
const nudged = (value: string): string => `${value.slice(0, -1)}${value.endsWith('1') ? '2' : '1'}`;

/** The first key: the last digit of the first field changes (the visit's first result, and the Oli's cheer). */
async function firstKey(page: Page): Promise<string> {
  const field = firstField(page);
  const value = await field.inputValue();
  await field.fill(nudged(value));
  await frames(page);
  return value;
}

/** A value the first field cannot take: letters in a number, a day before 2000 in a date. */
async function breakField(page: Page): Promise<void> {
  const field = firstField(page);
  await field.fill((await field.getAttribute('type')) === 'date' ? '1999-12-31' : 'abc');
  await field.blur();
  await expect(page.locator('#fo-rhero-error')).toBeVisible();
}

/** The height of the sentence of the card (a result with more digits may take a line more). */
const sentenceHeight = (page: Page) => page.locator('.fo-rhero__sentence').evaluate((node) => node.getBoundingClientRect().height);

// "Dobra": after the first key, the Download PDF of every calculator ends above the fold, 740 px at 360 x 740 and 800 px at
// 1280 x 800, and on the phone it takes the width of the card's content (in block). Before, it was under the card, in the
// ExportBar, from 878 to 1,094 px at 360.
for (const block of blocks(CALC_PATHS)) {
  test(`the Download PDF is in the card and above the fold at 360 x 740 and 1280 x 800 (${block.name})`, async ({ page }) => {
    test.setTimeout(120_000);
    const wrong: string[] = [];
    for (const [width, height] of [[360, 740], [1280, 800]] as const) {
      for (const path of block.paths) {
        await openAt(page, path, width, height);
        await hydrated(page);
        await firstKey(page);
        const now = await card(page);
        if (!now.download) {
          wrong.push(`${path} a ${width}: sem o Baixar no card`);
          continue;
        }
        if (now.download.bottom > height) wrong.push(`${path} a ${width}: o Baixar termina em ${Math.round(now.download.bottom)}`);
        if (width < 768 && Math.abs(now.download.width - now.inner) > 1) wrong.push(`${path} a ${width}: o Baixar tem ${now.download.width} de ${now.inner} px`);
      }
    }
    expect(wrong).toEqual([]);
  });
}

// "Sem salto" and the four states of the card, at 360 and 1280 px: the example; the first key (the last digit of the first
// field, the visit's first result, and the Oli's cheer); a result (the example's value typed back); and an error (a value the
// field cannot take). The card keeps its height (1 px of tolerance) and its top: the Oli changes her pose in her box, the
// Download leaves its place to the message and the last result takes the cell of the sentence. The first key is compared
// with the example when its sentence keeps its lines (another number may take a line more), and the error with the result
// it stands on. Before, the first key brought the Oli and the Placard under the chart (+96 to +100 px) and an error pushed a
// line under the card (+50 px).
for (const block of blocks(CALC_PATHS)) {
  test(`the card keeps its height in the example, after the first key, in a result and in an error (${block.name})`, async ({ page }) => {
    test.setTimeout(180_000);
    const wrong: string[] = [];
    for (const width of [360, 1280]) {
      for (const path of block.paths) {
        await openAt(page, path, width, 900);
        await hydrated(page);
        const example = await card(page);
        const lines = await sentenceHeight(page);
        // The fields after the result (the block of costs, where there is one): their top never moves on the first key.
        const moreTop = () => page.evaluate(() => Math.round((document.querySelector('.fo-calc__more')?.getBoundingClientRect().top ?? 0) + window.scrollY));
        const more = await moreTop();
        const value = await firstKey(page);
        const key = await card(page);
        const keyLines = await sentenceHeight(page);
        const moreKey = await moreTop();
        await firstField(page).fill(value);
        await frames(page);
        const result = await card(page);
        await breakField(page);
        const error = await card(page);
        const same = (state: string, from: { top: number; height: number }, now: { top: number; height: number }) => {
          if (Math.abs(now.height - from.height) > 1) wrong.push(`${path} a ${width}, ${state}: ${from.height} → ${now.height} px`);
          if (now.top !== from.top) wrong.push(`${path} a ${width}, ${state}: o topo foi de ${from.top} a ${now.top}`);
        };
        if (keyLines === lines) {
          same('1ª tecla', example, key);
          if (moreKey !== more) wrong.push(`${path} a ${width}, 1ª tecla: os campos depois do resultado foram de ${more} a ${moreKey}`);
        }
        same('resultado', example, result);
        same('erro', result, error);
      }
    }
    expect(wrong).toEqual([]);
  });
}

// "Erro" (spec; F4 ACE-11): 99 in the rate of the mortgage (en, es) and 5 months in the SAC × PRICE, and a wait of 900 ms
// (the range error waits 800 ms for the last key, § 305). The card stays where it was, nothing moved without a key
// (layout-shift with no recent input), the card says the message and the last result that worked, the field is
// aria-invalid and described by the message of the card, and no Download is ever there turned off.
const ERRORS = [
  { path: CALC_PAGES['mortgage-calculator'].path, field: 'r', value: '99', message: 'Enter a rate from 0 to 40%.', last: 'Last result that worked: Rate 6.5%.', stale: enShared.island.stale },
  { path: moneyPage('mortgage-calculator', 'es')?.path ?? '', field: 'r', value: '99', message: 'Escribe una tasa de 0 a 40 %.', last: 'Último resultado válido: Tasa 6.5 %.', stale: esShared.island.stale },
  { path: moneyPage('br-sac-price', 'pt')?.path ?? '', field: 'n', value: '5', message: 'Digite um prazo de 12 a 420 meses.', last: 'Último resultado que valeu: Prazo 360 meses.', stale: ptShared.island.stale },
];
for (const { path, field, value, message, last, stale } of ERRORS) {
  test(`${path}: an error is said in the card, with the last result that worked, and nothing moves`, async ({ page, browserName }) => {
    await page.addInitScript(() => {
      const shifts = { cls: 0 };
      (window as unknown as { __shifts: typeof shifts }).__shifts = shifts;
      if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) shifts.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: false });
    });
    await openAt(page, path, 360, 740);
    await hydrated(page);
    await frames(page);
    // What the load moved (the fonts) is not the error's: the count starts at the key.
    await page.evaluate(() => ((window as unknown as { __shifts: { cls: number } }).__shifts.cls = 0));
    const before = await card(page);
    const input = page.locator(`#fo-calc-${field}`);
    await input.fill(value);
    await page.waitForTimeout(900);
    const error = page.locator('.fo-rhero #fo-rhero-error');
    await expect(error).toBeVisible();
    if (message) await expect(error).toHaveText(message);
    await expect(page.locator('.fo-rhero__stale')).toHaveText(`${last} ${stale}`);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', /(^| )fo-rhero-error( |$)/);
    await expect(page.locator('button.fo-btn--download[disabled]')).toHaveCount(0);
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'oops');
    const after = await card(page);
    expect(after.top).toBe(before.top);
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
    if (browserName === 'chromium') expect(await page.evaluate(() => (window as unknown as { __shifts: { cls: number } }).__shifts.cls)).toBe(0);
    // The region of the card says it, half a second after: the one voice of the result (§ 102).
    await expect(page.locator('.fo-rhero [aria-live="polite"]')).toContainText(last, { timeout: 2_000 });
  });
}

// Review F13b b-2 (DECISOES § 593): with two fields in error, the card says the first one of the form (§ 545), and only that
// field is described by the card; the other is described by its own message, with its own range, and no role or live
// region repeats it (the card stays the one voice). Before, both pointed to the card, and the rate was described by the
// message of the home price.
test('/mortgage-calculator/: with two fields in error, each is described by its own range, and only the first by the card', async ({ page }) => {
  await openAt(page, CALC_PAGES['mortgage-calculator'].path, 1280, 900);
  await hydrated(page);
  await page.locator('#fo-calc-p').fill('abc');
  await page.locator('#fo-calc-r').fill('99');
  await page.waitForTimeout(900);
  await expect(page.locator('#fo-rhero-error')).toHaveText('Enter a home price from $10,000 to $20,000,000.');
  const price = page.locator('#fo-calc-p');
  const rate = page.locator('#fo-calc-r');
  await expect(price).toHaveAttribute('aria-invalid', 'true');
  await expect(rate).toHaveAttribute('aria-invalid', 'true');
  await expect(price).toHaveAttribute('aria-describedby', /(^| )fo-rhero-error( |$)/);
  await expect(rate).not.toHaveAttribute('aria-describedby', /fo-rhero-error/);
  await expect(price).toHaveAccessibleDescription(/Enter a home price from \$10,000 to \$20,000,000\./);
  await expect(rate).toHaveAccessibleDescription(/Enter a rate from 0 to 40%\./);
  await expect(rate).not.toHaveAccessibleDescription(/home price/);
  // The rate's own message has no role and no live region: the card's region is the one voice.
  const own = page.locator('#fo-calc-r-error');
  await expect(own).toHaveText('Enter a rate from 0 to 40%.');
  expect(await own.evaluate((node) => [node.getAttribute('role'), node.closest('[aria-live]')?.getAttribute('aria-live') ?? null])).toEqual([null, null]);
  await expect(page.locator('#fo-tool-root [aria-live]')).toHaveCount(1);
  // The price fixed, the card says the rate, and the rate is described by the card.
  await price.fill('375000');
  await page.waitForTimeout(900);
  await expect(page.locator('#fo-rhero-error')).toHaveText('Enter a rate from 0 to 40%.');
  await expect(rate).toHaveAttribute('aria-describedby', /(^| )fo-rhero-error( |$)/);
  await expect(page.locator('#fo-calc-r-error')).toHaveAttribute('aria-hidden', 'true');
});

// Review F13b f-2 (DECISOES § 594): on a phone the card is above the screen while the person types in a field after it, so the
// message of that field (or the problem the card says about it) shows right under the field while it has the focus, on
// screen, on top of what comes next: nothing moves, not even 800 ms after the key (layout-shift with no recent input, 0 in
// Chromium), and the message leaves with the focus. From 768 px the card stands beside the fields and the message stays in
// it. Before, the field after the card had only its stroke and icon, and the words were in the card, off the screen.
const AFTER_CARD = [
  { path: CALC_PAGES['home-affordability-calculator'].path, open: false, fill: [['fr', '500']], field: 'fr', message: 'Enter a limit from 1 to 100% of income.' },
  { path: CALC_PAGES['debt-consolidation-calculator'].path, open: false, fill: [['d1r', '99']], field: 'd1r', message: 'Enter an APR from 0 to 60%.' },
  { path: CALC_PAGES['debt-consolidation-calculator'].path, open: false, fill: [['d0p', '1']], field: 'd0p', message: /^The payment on debt 1 doesn't cover its interest\./ },
  { path: CALC_PAGES['mortgage-calculator'].path, open: true, fill: [['tx', '99999999']], field: 'tx', message: 'Enter a property tax from $0 to $1,000,000.' },
] as const;
for (const { path, open, fill, field, message } of AFTER_CARD) {
  test(`${path} (#fo-calc-${field}): on a phone, the message of a field after the card shows under it while it has the focus, and nothing moves`, async ({ page, browserName }) => {
    await page.addInitScript(() => {
      const shifts = { cls: 0 };
      (window as unknown as { __shifts: typeof shifts }).__shifts = shifts;
      if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) shifts.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: false });
    });
    await openAt(page, path, 360, 740);
    await hydrated(page);
    if (open) await page.locator('[aria-controls="fo-calc-more-fields"]').click();
    const input = page.locator(`#fo-calc-${field}`);
    await input.evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await frames(page);
    const tops = () => page.evaluate(() => [...document.querySelectorAll('#fo-tool-root .fo-calc__more .fo-field, #fo-tool-root .fo-calc__next, #fo-calc-schedule')].map((node) => Math.round(node.getBoundingClientRect().top + window.scrollY)));
    const before = await tops();
    await page.evaluate(() => ((window as unknown as { __shifts: { cls: number } }).__shifts.cls = 0));
    for (const [key, text] of fill) await page.locator(`#fo-calc-${key}`).fill(text);
    await page.waitForTimeout(900);
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    const said = page.locator(`#fo-calc-${field}-error`);
    /** The height of the message: the 1 px of the screen reader's copy, or the lines under the field. */
    const height = () => said.evaluate((node) => node.getBoundingClientRect().height);
    await expect.poll(height).toBeGreaterThanOrEqual(20);
    await expect(said).toHaveText(message);
    // Under the field, and on the screen with it; the card is above the screen.
    const where = await page.evaluate((id) => {
      const box = document.getElementById(id)!.getBoundingClientRect();
      const words = document.getElementById(`${id}-error`)!.getBoundingClientRect();
      return { gap: words.top - box.bottom, top: words.top, bottom: words.bottom };
    }, `fo-calc-${field}`);
    expect(where.gap).toBeGreaterThanOrEqual(0);
    expect(where.top).toBeGreaterThanOrEqual(0);
    expect(where.bottom).toBeLessThanOrEqual(740);
    const shown = await tops();
    // A range error comes 800 ms after the key and moves nothing; a problem of the account comes on the key (the scenarios
    // leave with it, a change the key made), so its page is compared with the message and without it, below.
    if (typeof message === 'string') expect(shown).toEqual(before);
    if (browserName === 'chromium') expect(await page.evaluate(() => (window as unknown as { __shifts: { cls: number } }).__shifts.cls)).toBe(0);
    // The focus leaves: the message leaves with it, and the card keeps it.
    await page.locator('.fo-rhero__label').click();
    await expect.poll(height).toBeLessThanOrEqual(1);
    expect(await tops(), 'a mensagem embaixo do campo não empurra nada').toEqual(shown);
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    // From 768 px the card is beside the fields: the message stays in it, never under the field.
    await page.setViewportSize({ width: 1280, height: 900 });
    await input.focus();
    await expect(input).toBeFocused();
    expect(await height()).toBeLessThanOrEqual(1);
  });
}

// F10 p-19: on the first visit (no choice of cookies yet), at 360 x 740, the number of the mortgage (en, es) and of the
// SAC × PRICE ends above 596 px, clear of the cookie notice, which starts at 604 px; after Accept, the Download PDF is whole
// above 740 px, in the width of the card. Before: 636 (en) and 678 px (es, pt), covered by 32 and 52 px of the notice.
for (const path of [CALC_PAGES['mortgage-calculator'].path, moneyPage('mortgage-calculator', 'es')?.path ?? '', moneyPage('br-sac-price', 'pt')?.path ?? '']) {
  test(`${path}: the number ends above the cookie notice at 360 x 740, and after Accept the Download is above the fold`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    expect((await page.goto(path))?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await hydrated(page);
    const seen = await page.evaluate(() => {
      const number = document.querySelector('.fo-rhero__num')!.getBoundingClientRect();
      const notice = document.getElementById('fo-cookie');
      const box = notice && !notice.hidden ? notice.getBoundingClientRect() : null;
      return { bottom: number.bottom, top: number.top, notice: box ? { top: box.top, bottom: box.bottom } : null };
    });
    expect(seen.notice, 'o aviso da primeira visita').not.toBeNull();
    expect(seen.bottom).toBeLessThanOrEqual(596);
    expect(Math.max(0, Math.min(seen.bottom, seen.notice?.bottom ?? 0) - Math.max(seen.top, seen.notice?.top ?? 0))).toBe(0);
    await dismissCookies(page, 'granted');
    const now = await card(page);
    expect(now.download?.bottom ?? 999).toBeLessThanOrEqual(740);
    expect(Math.abs((now.download?.width ?? 0) - now.inner)).toBeLessThanOrEqual(1);
    await context.close();
  });
}

// F4 ACE-11: a problem of the account that points to a field marks that field as an error of its range does, with
// aria-invalid and the card's message as its description (never the message repeated next to it): the payment that does not
// cover the interest of the credit card, the extra of the debt payoff, the payment of a debt to consolidate, and the down
// payment of the SAC × PRICE that leaves nothing to finance.
const PROBLEMS = [
  { path: CALC_PAGES['credit-card-payoff-calculator'].path, fill: [['pay', '10']], field: 'pay' },
  { path: CALC_PAGES['debt-payoff-calculator'].path, fill: [['d0m', '0'], ['d1m', '0'], ['d2m', '0'], ['d3m', '0'], ['x', '0']], field: 'x' },
  { path: CALC_PAGES['debt-consolidation-calculator'].path, fill: [['d0p', '1']], field: 'd0p' },
  { path: moneyPage('br-sac-price', 'pt')?.path ?? '', fill: [['d', '100']], field: 'd' },
] as const;
for (const { path, fill, field } of PROBLEMS) {
  test(`${path}: the field a problem points to is aria-invalid and described by the card (ACE-11)`, async ({ page }) => {
    await openAt(page, path, 360, 740);
    await hydrated(page);
    for (const [key, text] of fill) await page.locator(`#fo-calc-${key}`).fill(text);
    const input = page.locator(`#fo-calc-${field}`);
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', /(^| )fo-rhero-error( |$)/);
    // The words are in the card only: nothing under the field repeats them.
    await expect(page.locator('#fo-tool-root .fo-field__error')).toHaveCount(0);
    await expect(page.locator('#fo-tool-root [role="alert"]')).toHaveCount(0);
  });
}

// The Oli of the card (§ 375): in the HTML of the page, so on the first paint, aria-hidden, sitting on the top edge of the
// card at its right (64 px on the phone, 80 from 768 px); still in wave on the example, cheer once on the first result of
// the visit, oops on an error, and wave after it, in the same box. Never cheer on a health page.
test('the Oli is in the card from the first paint, cheers once, says oops on an error and waves after it', async ({ page, request }) => {
  const path = CALC_PAGES['auto-loan-calculator'].path;
  const html = await (await request.get(path)).text();
  expect(html).toMatch(/<div class="fo-rhero__oli" data-oli="wave" aria-hidden="true">/);
  for (const [width, size] of [[360, 64], [1280, 80]] as const) {
    await openAt(page, path, width, 800);
    const box = await page.evaluate(() => {
      const oli = document.querySelector('.fo-rhero__oli')!.getBoundingClientRect();
      const hero = document.querySelector('.fo-rhero')!.getBoundingClientRect();
      return { width: oli.width, top: oli.top - hero.top, right: hero.right - oli.right };
    });
    expect(box.width, `${width}px`).toBe(size);
    expect(box.top, `${width}px: acima da borda de cima`).toBeLessThan(0);
    expect(box.right, `${width}px: à direita`).toBeLessThanOrEqual(24);
  }
  await hydrated(page);
  const oli = page.locator('.fo-rhero__oli');
  const handle = await oli.elementHandle();
  await expect(oli).toHaveAttribute('data-oli', 'wave');
  expect(await oli.evaluate((node) => getComputedStyle(node.querySelector('svg')!).animationName)).toBe('none');
  await firstKey(page);
  await expect(oli).toHaveAttribute('data-oli', 'cheer');
  await breakField(page);
  await expect(oli).toHaveAttribute('data-oli', 'oops');
  await firstField(page).fill('33000');
  await expect(oli).toHaveAttribute('data-oli', 'wave');
  // The same element all along: the pose changes in the box.
  expect(await oli.evaluate((node, first) => node === first, handle)).toBe(true);
});

test('a health page never cheers: the Oli of the card waves on a result and says oops on an error', async ({ page }) => {
  await openAt(page, LIFE_CALC_PAGES['bmi-calculator'].path, 360, 740);
  await hydrated(page);
  const oli = page.locator('.fo-rhero__oli');
  await page.locator('#fo-calc-lb').fill('170');
  await frames(page);
  await expect(oli).toHaveAttribute('data-oli', 'wave');
  await page.locator('#fo-calc-lb').fill('abc');
  await page.locator('#fo-calc-lb').blur();
  await expect(oli).toHaveAttribute('data-oli', 'oops');
  await expect(page.locator('symbol#oli-cheer')).toHaveCount(0);
});

// The waterline of the deep sea (§ 539, night-sea.html ?alt=a) on the card, in both themes: the ::after is the air (the mask of
// the wave, in surface), the ::before the crest (stroke), the Oli above them, and the card keeps its height without them.
for (const scheme of ['light', 'dark'] as const) {
  test(`the card has the waterline of the deep sea in the ${scheme} theme, and its height does not depend on it`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const width of [360, 1280]) {
      await openAt(page, CALC_PAGES['mortgage-calculator'].path, width, 900);
      const seen = await page.evaluate(() => {
        const hero = document.querySelector('.fo-rhero')!;
        const after = getComputedStyle(hero, '::after');
        const before = getComputedStyle(hero, '::before');
        const probe = document.createElement('i');
        document.body.append(probe);
        const color = (token: string) => {
          probe.style.color = `var(${token})`;
          return getComputedStyle(probe).color;
        };
        const tokens = { surface: color('--surface'), stroke: color('--stroke') };
        probe.remove();
        const mask = after.maskImage || after.getPropertyValue('-webkit-mask-image');
        return { air: after.backgroundColor, crest: before.backgroundColor, mask, tokens, oli: getComputedStyle(hero.querySelector('.fo-rhero__oli')!).zIndex, height: hero.getBoundingClientRect().height };
      });
      expect(seen.mask, `${width}px`).toContain('svg');
      expect(seen.air).toBe(seen.tokens.surface);
      expect(seen.crest).toBe(seen.tokens.stroke);
      expect(seen.oli).toBe('1');
      await page.addStyleTag({ content: '.fo-rhero::before, .fo-rhero::after { display: none !important; }' });
      expect(await page.locator('.fo-rhero').evaluate((node) => node.getBoundingClientRect().height)).toBe(seen.height);
    }
  });
}

// The block of costs that folds (D-32 and D-33; DECISOES § 547): the taxes, insurance and fees of the mortgage and of its
// presets (en, es) and the TR, insurance and fees of the SAC × PRICE, closed when the page opens, with their total in the
// title, a heading in Fredoka. The fields are in the page only while it is open; the name of its button (the title and the
// total) is the same open and closed, only aria-expanded changes; and on a phone the open block ends in the echo of the
// result, with the number of the card (from 768 px the card is beside the fields and the echo goes).
const FOLDS = [
  { path: CALC_PAGES['mortgage-calculator'].path, title: 'Taxes, insurance and fees', meta: '$500.00 a month in your payment', fields: ['tx', 'in', 'pmi', 'hoa'] },
  { path: CALC_PAGES['mortgage-calculator-biweekly'].path, title: 'Taxes, insurance and fees', meta: '$500.00 a month in your payment', fields: ['tx', 'in', 'pmi', 'hoa'] },
  { path: CALC_PAGES['mortgage-calculator-extra-payments'].path, title: 'Taxes, insurance and fees', meta: '$500.00 a month in your payment', fields: ['tx', 'in', 'pmi', 'hoa'] },
  { path: moneyPage('mortgage-calculator', 'es')?.path ?? '', title: 'Impuestos, seguros y cuotas', meta: '$500.00 al mes en tu pago', fields: ['tx', 'in', 'pmi', 'hoa'] },
  { path: moneyPage('mortgage-calculator-extra-payments', 'es')?.path ?? '', title: 'Impuestos, seguros y cuotas', meta: '$500.00 al mes en tu pago', fields: ['tx', 'in', 'pmi', 'hoa'] },
  { path: moneyPage('br-sac-price', 'pt')?.path ?? '', title: 'TR, seguros e taxas', meta: 'R$ 150,00 por mês na parcela, TR em 0%', fields: ['tr', 'f'] },
];
for (const { path, title, meta, fields } of FOLDS) {
  test(`${path}: the costs fold into a closed block with their total in the title, and the echo of the result on a phone`, async ({ page }) => {
    for (const width of [360, 1280]) {
      await openAt(page, path, width, 900);
      await hydrated(page);
      const button = page.locator('#fo-tool-root .fo-calc__more h2.fo-disclose > button[aria-controls="fo-calc-more-fields"]');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#fo-calc-more-fields')).toBeHidden();
      for (const key of fields) await expect(page.locator(`#fo-calc-${key}`), `#fo-calc-${key} fechado`).toHaveCount(0);
      await expect(button.locator('.fo-disclose__title')).toHaveText(title);
      await expect(button.locator('.fo-disclose__meta')).toHaveText(meta);
      expect(await button.locator('.fo-disclose__title').evaluate((node) => getComputedStyle(node).fontFamily)).toMatch(/^"?Fredoka/);
      const name = await button.evaluate((node) => node.textContent?.replace(/\s+/g, ' ').trim());
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      for (const key of fields) await expect(page.locator(`#fo-calc-${key}`), `#fo-calc-${key} aberto`).toBeVisible();
      expect(await button.evaluate((node) => node.textContent?.replace(/\s+/g, ' ').trim())).toBe(name);
      await expect(button).toHaveAccessibleName(`${title} ${meta}`);
      const echo = page.locator('#fo-calc-more-fields .fo-calc__echo');
      if (width < 768) {
        await expect(echo).toBeVisible();
        await expect(echo).toHaveAttribute('aria-hidden', 'true');
        expect((await echo.locator('b').textContent()) ?? '').toBe((await page.locator('.fo-rhero__num > span').first().textContent()) ?? '-');
      } else await expect(echo).toBeHidden();
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator(`#fo-calc-${fields[0]}`)).toHaveCount(0);
    }
  });
}

// Every H2 of the island is in Fredoka 24/30, like every H2 of the site (D-46, G-19): the heading of the fields after the
// result too, which was the Figtree 18 of an H3.
test('the headings of the island are in Fredoka', async ({ page }) => {
  for (const path of [CALC_PAGES['mortgage-calculator-extra-payments'].path, CALC_PAGES['refinance-calculator'].path, moneyPage('br-sac-price', 'pt')?.path ?? '']) {
    await openAt(page, path, 360, 740);
    const fonts = await page.locator('#fo-tool-root h2').evaluateAll((headings) => headings.map((heading) => getComputedStyle(heading.querySelector('.fo-disclose__title') ?? heading).fontFamily));
    expect(fonts.length, path).toBeGreaterThan(0);
    for (const font of fonts) expect(font, path).toMatch(/^"?Fredoka/);
  }
});

// "Ordem e blocos" (D-43; F4 ACE-8): the island goes card, costs, scenarios, schedule, chips, in the order of the DOM (the
// order of the phone); the schedule is a block of the island with a fixed name, closed when the page opens, whose button
// keeps its name open and closed (only aria-expanded changes) and whose chevron turns; the CSV says what it does.
test('the island goes card, costs, scenarios, schedule and chips, and the schedule keeps its name open and closed (ACE-8)', async ({ page }) => {
  for (const [path, schedule, csv] of [
    [CALC_PAGES['mortgage-calculator-extra-payments'].path, 'Schedule with extra payments', 'Download CSV'],
    [moneyPage('br-sac-price', 'pt')?.path ?? '', 'Cronograma de parcelas', 'Baixar CSV'],
    [moneyPage('mortgage-calculator', 'es')?.path ?? '', 'Tabla de amortización', 'Descargar CSV'],
  ] as const) {
    await openAt(page, path, 360, 740);
    await hydrated(page);
    const order = await page.evaluate(() => {
      const island = document.querySelector('#fo-tool-root .fo-calc')!;
      const at = (selector: string) => [...island.children].findIndex((child) => child.matches(selector) || child.querySelector(selector) !== null);
      return [at('.fo-rhero'), at('.fo-calc__more'), at('.fo-calc__compare'), at('#fo-calc-schedule'), at('.fo-calc__next')];
    });
    const present = order.filter((index) => index >= 0);
    expect(present, path).toEqual([...present].sort((a, b) => a - b));
    expect(order[3], `${path}: o cronograma na ilha`).toBeGreaterThan(order[0] ?? 99);
    expect(order[3], `${path}: o cronograma antes dos chips`).toBeLessThan(order[4] ?? -1);
    await expect(page.locator('.fo-export .fo-btn').first()).toHaveText(csv);
    const button = page.locator('#fo-calc-schedule h2.fo-disclose > button[aria-controls="fo-schedule-table"]');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#fo-calc-schedule tr')).toHaveCount(0);
    await expect(button.locator('.fo-disclose__title')).toHaveText(schedule);
    const name = (await button.textContent())?.trim();
    const turned = () => button.locator('.fo-disclose__icon').evaluate((node) => getComputedStyle(node).transform);
    const before = await turned();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#fo-calc-schedule .fo-amort tbody tr').first()).toBeVisible();
    expect((await button.textContent())?.trim()).toBe(name);
    await expect.poll(turned).not.toBe(before);
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    expect((await button.textContent())?.trim()).toBe(name);
  }
});

// F4 ACE-9 (the half of the calculators; DECISOES § 548): every table of a calculator, open, has a row header (th scope="row")
// on each row of data, with no sticky (position static), and its scrolling frame is a region named by the heading of its
// section, not by the caption of the table.
for (const block of blocks(CALC_PATHS)) {
  test(`every table of a calculator has a row header with no sticky, and a region named apart from the table (${block.name})`, async ({ page }) => {
    test.setTimeout(120_000);
    const wrong: string[] = [];
    for (const path of block.paths) {
      await openAt(page, path, 360, 740);
      await hydrated(page);
      const button = page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]');
      if (await button.count()) await button.click();
      await expect(page.locator('#fo-calc-schedule .fo-amort tbody tr').first(), path).toBeVisible();
      const seen = await page.evaluate(() => {
        const wrap = document.querySelector('#fo-calc-schedule .fo-amort-wrap')!;
        const rows = [...wrap.querySelectorAll('tbody tr:not(.fo-amort__year)')];
        const headed = rows.filter((row) => row.firstElementChild?.matches('th[scope="row"]'));
        const sticky = headed.filter((row) => getComputedStyle(row.firstElementChild!).position !== 'static');
        const label = (wrap.getAttribute('aria-labelledby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim() ?? '').join(' ');
        return { rows: rows.length, headed: headed.length, sticky: sticky.length, role: wrap.getAttribute('role'), label, caption: wrap.querySelector('caption')?.textContent?.trim() ?? '' };
      });
      if (seen.rows === 0) wrong.push(`${path}: sem linhas`);
      if (seen.headed !== seen.rows) wrong.push(`${path}: ${seen.headed} de ${seen.rows} linhas com th[scope=row]`);
      if (seen.sticky) wrong.push(`${path}: ${seen.sticky} cabeçalhos de linha fixos`);
      if (seen.role !== 'region' || !seen.label) wrong.push(`${path}: a moldura sem nome de região`);
      if (seen.label === seen.caption) wrong.push(`${path}: a região e a tabela com o mesmo nome "${seen.label}"`);
    }
    expect(wrong).toEqual([]);
  });
}

// SAC × PRICE (D-38; DECISOES § 549): the PRICE is in the card, under the Download, with the first payment the account gives
// (the B card of the scenarios says the same number, never typed in a text); the two bars are on one scale, the PRICE's the
// widest, with both totals in the name of the chart and in its legend; and the two scenarios stay side by side down to 320 px.
test('/pt/simulador-sac-price/: the PRICE is in the card, with two bars on one scale, and the scenarios side by side at 320 px', async ({ page }) => {
  const path = moneyPage('br-sac-price', 'pt')?.path ?? '';
  await openAt(page, path, 360, 740);
  await hydrated(page);
  const price = (await page.locator('.fo-scn').nth(1).locator('dd').first().textContent()) ?? '';
  expect(price).toMatch(/^R\$\s[\d.]+,\d\d$/);
  const versus = page.locator('.fo-rhero .fo-rhero__versus');
  await expect(versus).toHaveText(`Na PRICE: ${price} por mês`);
  // Under the Download, in the card, above the sentence.
  expect(await page.evaluate(() => {
    const get = document.querySelector('.fo-rhero__get')!.getBoundingClientRect();
    const line = document.querySelector('.fo-rhero__versus')!.getBoundingClientRect();
    const said = document.querySelector('.fo-rhero__said')!.getBoundingClientRect();
    return line.top >= get.bottom && line.bottom <= said.top;
  })).toBe(true);
  const chart = page.locator('.fo-rhero .fo-split--pair [role="img"]');
  await expect(chart).toHaveAttribute('aria-label', /^Valor financiado de R\$\s[\d.]+ nos dois sistemas\. Juros de R\$\s[\d.]+ no SAC e de R\$\s[\d.]+ na PRICE\.$/);
  const bars = await page.locator('.fo-rhero .fo-split__row svg').evaluateAll((svgs) => svgs.map((svg) => svg.getBoundingClientRect().width));
  expect(bars).toHaveLength(2);
  expect(bars[0]).toBeLessThan(bars[1] ?? 0);
  const row = await page.locator('.fo-rhero .fo-split__row').last().evaluate((node) => node.getBoundingClientRect().width - 56 - 8);
  expect(Math.abs((bars[1] ?? 0) - row)).toBeLessThanOrEqual(1);
  await expect(page.locator('.fo-rhero .fo-split__legend li').nth(1)).toHaveText(/^Juros: SAC R\$\s[\d.]+ · PRICE R\$\s[\d.]+$/);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.locator('.fo-compare').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const inside = await page.locator('.fo-scn dd').evaluateAll((dds) => dds.every((dd) => dd.scrollWidth <= dd.clientWidth + 1));
  expect(inside).toBe(true);
});

// The CLS of the interaction (§ 375; F10 p-19): at 360 x 740, in Chromium (the layout-shift API), with the choice of cookies
// stored and the observer open before the first key, on the mortgage and the SAC × PRICE: the first key (the cheer comes in
// the same box, the card keeps its height) moves nothing it did not touch, up to 0.05. The error, 800 ms after the key, moves
// nothing at all: the test "an error is said in the card…" above asks for 0. Before, the first key grew the card 96 to 100 px.
for (const path of [CALC_PAGES['mortgage-calculator'].path, moneyPage('br-sac-price', 'pt')?.path ?? '']) {
  test(`${path}: the first key shifts the layout by 0.05 at most, at 360 x 740`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'the layout-shift API is only in Chromium');
    await page.addInitScript(() => {
      const shifts = { cls: 0 };
      (window as unknown as { __shifts: typeof shifts }).__shifts = shifts;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) shifts.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: false });
    });
    await openAt(page, path, 360, 740);
    await hydrated(page);
    await frames(page);
    await page.evaluate(() => ((window as unknown as { __shifts: { cls: number } }).__shifts.cls = 0));
    await firstKey(page);
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'cheer');
    // Past the half second of the voice and the 800 ms of an error: anything that would come on its own has come.
    await page.waitForTimeout(1_200);
    expect(await page.evaluate(() => (window as unknown as { __shifts: { cls: number } }).__shifts.cls)).toBeLessThanOrEqual(0.05);
  });
}

// Every control this run made or changed is 48 px or more on both sides (tap-min), at 360 and 1280 px: the Download PDF of the
// card (60 px), Download CSV and Copy link, the button of the block of costs and of the schedule, and the two downloads of the
// QR code generator.
test('the new and changed controls of the calculators and of the QR are 48 px or more, at 360 and 1280 px', async ({ page }) => {
  const small: string[] = [];
  /** Each selector must find its controls (a measure of none proves nothing), and each control must be 48 px or more. */
  const measure = async (where: string, selectors: string[]) => {
    for (const selector of selectors) {
      const boxes = await page.locator(selector).evaluateAll((nodes) => nodes.map((node) => ({ name: node.textContent?.trim().slice(0, 30) ?? '', ...node.getBoundingClientRect().toJSON() })));
      if (!boxes.length) small.push(`${where}: nenhum ${selector}`);
      for (const box of boxes) if (box.width < 48 || box.height < 48) small.push(`${where}: "${box.name}" ${Math.round(box.width)}×${Math.round(box.height)}`);
    }
  };
  for (const width of [360, 1280]) {
    for (const path of [CALC_PAGES['mortgage-calculator'].path, moneyPage('br-sac-price', 'pt')?.path ?? '', moneyPage('mortgage-calculator', 'es')?.path ?? '']) {
      await openAt(page, path, width, 900);
      await hydrated(page);
      await measure(`${path} a ${width}`, ['.fo-rhero .fo-btn--download', '.fo-export .fo-btn', '[aria-controls="fo-calc-more-fields"]', '#fo-calc-schedule button[aria-controls="fo-schedule-table"]']);
    }
    const qr = routeById(QR_ID).paths.en ?? '';
    await openAt(page, qr, width, 900);
    await hydrated(page);
    await page.locator('#fo-tool-root textarea').fill('https://fileorca.com/');
    await expect(page.locator('.fo-qr__actions .fo-btn')).toHaveCount(2);
    await measure(`${qr} a ${width}`, ['.fo-qr__actions .fo-btn']);
  }
  expect(small).toEqual([]);
});

// F4 ACE-7, accepted (DECISOES § 555): the order of the DOM is the phone's, so at 1280 px the Tab goes from the main fields
// to the column of the result (the Download PDF, Download CSV, Copy link) and back to the left column, now to one button,
// the block of costs (before, to its four fields). WebKit's Tab skips links and buttons, as Safari does by default: there the
// walk is Option+Tab, the key that reaches them (docs/claude/playwright.md).
test('at 1280 px the Tab goes from the main fields to the Download, the CSV, the link and the one button of the costs (ACE-7)', async ({ page, browserName }) => {
  await openAt(page, CALC_PAGES['mortgage-calculator'].path, 1280, 900);
  await hydrated(page);
  await page.locator('#fo-calc-t').focus();
  const order: string[] = [];
  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    order.push(await page.evaluate(() => {
      const node = document.activeElement as HTMLElement;
      return node.classList.contains('fo-btn--download') ? 'pdf' : node.closest('.fo-export') ? (node.textContent ?? '').trim() : node.getAttribute('aria-controls') ?? node.id;
    }));
  }
  expect(order).toEqual(['pdf', 'Download CSV', 'Copy link', 'fo-calc-more-fields', 'fo-schedule-table']);
});
