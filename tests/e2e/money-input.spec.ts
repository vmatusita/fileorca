// F16 (items 1, 3 and 4; criteria 2 to 4 of the ficha; DECISOES § 683, § 685 and § 686): the number field of the calculators
// as a person types in it. A digit typed in the middle of a grouped number reads ("3755,000" is the payment of 3,755,000 typed
// from scratch, with no error); the card's region speaks once per typed value, never the result of a prefix and then the
// error ("99" in the rate); and the Tab from a field whose error takes the Download out of the page leaves the focus on the
// next control, never on the body, and the Shift+Tab goes back to the field. Keys go through page.keyboard, 120 ms apart
// where the voice is counted, never fill(). The name puts it between money-home and money-life-privacy, in the light parts of
// the CI (plan of the F16, section 7; DECISOES § 695).
import { expect, test, type Page } from '@playwright/test';
import { CALC_PAGES, LIFE_CALC_PAGES, moneyPage } from '../../src/tools/calc/registry.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import ptShared from '../../src/tools/calc/i18n/pt.ts';
import { SETTLE_MS } from '../../src/tools/calc/form.ts';
import { hydrated } from './lib/page.ts';

/** The card's region speaks half a second after the last change (ResultHero's SPEAK_AFTER_MS; DECISOES § 102). */
const SPEAK_AFTER_MS = 500;

const EN = CALC_PAGES['mortgage-calculator'].path;
const ES = moneyPage('mortgage-calculator', 'es')?.path ?? '(sem hipoteca em es)';
const PT = moneyPage('br-sac-price', 'pt')?.path ?? '(sem SAC × PRICE em pt)';

const pdfButton = (page: Page) => page.locator('.fo-rhero .fo-btn--download');
const heroNumber = (page: Page) => page.locator('.fo-rhero__num');
const heroError = (page: Page) => page.locator('#fo-rhero-error');

test.beforeEach(async ({ page }) => {
  // The choice of cookies stored: the notice never covers the card or the fields.
  await page.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
});

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), path).toBe(200);
  await hydrated(page);
}

/** Puts the caret of a field at `at`, or selects all its text, as a click and a key would. */
async function caret(page: Page, id: string, at: number | 'all'): Promise<void> {
  const field = page.locator(`#${id}`);
  await field.focus();
  await field.evaluate((input: HTMLInputElement, where) => (where === 'all' ? input.select() : input.setSelectionRange(where, where)), at);
}

// Criterion 2 (F4 DES-3; the D13 of the plan): the person puts the caret in the middle of the price and types a digit.
const MIDDLE = [
  { lang: 'en', path: EN, at: 3, key: '5', typed: '3755,000', scratch: '3,755,000' },
  { lang: 'pt', path: PT, at: 3, key: '5', typed: '5005.000', scratch: '5.005.000' },
  { lang: 'es', path: ES, at: 3, key: '5', typed: '3755,000', scratch: '3,755,000' },
] as const;

for (const c of MIDDLE) {
  test(`${c.lang}: a digit typed in the middle of the price reads, as the number typed from scratch (criterion 2)`, async ({ page }) => {
    // The payment of the number typed from scratch, with its thousands separators.
    await open(page, c.path);
    const example = await heroNumber(page).textContent();
    await caret(page, 'fo-calc-p', 'all');
    await page.keyboard.type(c.scratch, { delay: 30 });
    await expect(heroNumber(page)).not.toHaveText(example ?? '');
    const scratch = (await heroNumber(page).textContent()) ?? '';

    await open(page, c.path);
    await caret(page, 'fo-calc-p', c.at);
    await page.keyboard.type(c.key);
    const field = page.locator('#fo-calc-p');
    await expect(field).toHaveValue(c.typed);
    await expect(heroNumber(page)).toHaveText(scratch);
    // Past the pause of the range error (DECISOES § 305) nothing says the field is wrong, and the Download stays.
    await page.waitForTimeout(SETTLE_MS + 200);
    await expect(heroError(page)).toHaveCount(0);
    await expect(field).not.toHaveAttribute('aria-invalid', 'true');
    await expect(pdfButton(page)).toHaveCount(1);
    // Leaving the field writes the number back in the format of the page.
    await field.blur();
    await expect(field).toHaveValue(c.scratch);
    await expect(heroError(page)).toHaveCount(0);
    await expect(heroNumber(page)).toHaveText(scratch);
  });
}

/** Records every text the card's region says from now on (the p.fo-sr[aria-live] of .fo-rhero, the one voice, § 102). */
async function listen(page: Page): Promise<void> {
  await page.evaluate(() => {
    const region = document.querySelector('.fo-rhero p.fo-sr[aria-live]');
    if (!region) throw new Error('no live region in the card');
    const said: string[] = [];
    (window as unknown as { __said: string[] }).__said = said;
    new MutationObserver(() => {
      const text = (region.textContent ?? '').trim();
      if (text !== '') said.push(text);
    }).observe(region, { childList: true, characterData: true, subtree: true });
  });
}

const voices = (page: Page) => page.evaluate(() => (window as unknown as { __said: string[] }).__said);

// Criterion 3 (review F13b b-3): one voice per typed value. In the starting point "99" in the rate said the result of 9%
// and then the error.
const SPEECH = [
  { lang: 'en', path: EN, name: '"99" in the rate', field: 'fo-calc-r', at: 'all', text: '99', error: true },
  { lang: 'en', path: EN, name: '"3755,000" in the place of "375,000"', field: 'fo-calc-p', at: 3, text: '5', error: false },
  { lang: 'en', path: EN, name: '"425000" from scratch', field: 'fo-calc-p', at: 'all', text: '425000', error: false },
  { lang: 'pt', path: PT, name: '"99" in the rate', field: 'fo-calc-r', at: 'all', text: '99', error: true },
  { lang: 'pt', path: PT, name: '"5005.000" in the place of "500.000"', field: 'fo-calc-p', at: 3, text: '5', error: false },
  { lang: 'pt', path: PT, name: '"425000" from scratch', field: 'fo-calc-p', at: 'all', text: '425000', error: false },
  { lang: 'es', path: ES, name: '"99" in the rate', field: 'fo-calc-r', at: 'all', text: '99', error: true },
  { lang: 'es', path: ES, name: '"3755,000" in the place of "375,000"', field: 'fo-calc-p', at: 3, text: '5', error: false },
  { lang: 'es', path: ES, name: '"425000" from scratch', field: 'fo-calc-p', at: 'all', text: '425000', error: false },
] as const;

for (const c of SPEECH) {
  test(`${c.lang}: ${c.name} is said once, 120 ms between the keys (criterion 3)`, async ({ page }) => {
    await open(page, c.path);
    await listen(page);
    await caret(page, c.field, c.at);
    await page.keyboard.type(c.text, { delay: 120 });
    await expect.poll(() => voices(page), { timeout: 5_000 }).not.toHaveLength(0);
    // Room for a second voice, which came about a second after the first in the starting point.
    await page.waitForTimeout(SETTLE_MS + SPEAK_AFTER_MS + 200);
    const said = await voices(page);
    expect(said, said.join(' | ')).toHaveLength(1);
    if (c.error) {
      // The error with the last result that worked, in the card and in the region.
      await expect(heroError(page)).toBeVisible();
      expect(said[0]).toContain((await heroError(page).textContent())?.trim() ?? '(no error)');
    } else {
      await expect(heroError(page)).toHaveCount(0);
      expect(said[0]).toContain((await heroNumber(page).textContent())?.trim() ?? '(no number)');
    }
  });
}

/** Where the focus is: '#id' for a control with an id, its text for one without, BODY for none. */
const focused = (page: Page) =>
  page.evaluate(() => {
    const node = document.activeElement as HTMLElement | null;
    if (!node || node === document.body) return 'BODY';
    return node.id ? `#${node.id}` : (node.textContent ?? '').trim();
  });

// Criterion 4 (review F13b b-1): a wrong value in the last field before the Download, then the Tab. In the starting point the
// Download left the page with the focus on it, and the focus fell to the body. The CSV is off while the result is stale (§ 139),
// so the next control is the Copy link. A field of a list after the result (the debts) keeps its own next control.
const FOCUS = [
  { name: 'en mortgage, the term', path: EN, field: 'fo-calc-t', wrong: '99', next: enShared.island.copyLink, download: true },
  { name: 'pt SAC × PRICE, the rate', path: PT, field: 'fo-calc-r', wrong: '99', next: ptShared.island.copyLink, download: true },
  { name: 'es mortgage, the term', path: ES, field: 'fo-calc-t', wrong: '99', next: esShared.island.copyLink, download: true },
  { name: 'square footage, the width of the one area', path: LIFE_CALC_PAGES['square-footage-calculator'].path, field: 'fo-calc-a0y', wrong: '0', next: enShared.island.copyLink, download: true },
  { name: 'debt payoff, the minimum of the last debt', path: CALC_PAGES['debt-payoff-calculator'].path, field: 'fo-calc-d3m', wrong: '999999', next: '#fo-calc-d3-remove', download: false },
] as const;

for (const c of FOCUS) {
  test(`${c.name}: the Tab after a wrong value leaves the focus on the next control, and the Shift+Tab comes back (criterion 4)`, async ({ page, browserName }) => {
    // WebKit's Tab skips buttons, as Safari does by default: there the walk is Option+Tab (docs/claude/playwright.md, F13b).
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    const back = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await open(page, c.path);
      // The field's blur says where the focus goes (its relatedTarget), in both browsers, which the card reads (§ 686).
      await page.locator(`#${c.field}`).evaluate((input) => {
        input.addEventListener('focusout', (event) => {
          const to = (event as FocusEvent).relatedTarget as HTMLElement | null;
          (window as unknown as { __to: string }).__to = to?.classList.contains('fo-btn--download') ? 'download' : (to?.id ?? String(to));
        });
      });
      await listen(page);
      await caret(page, c.field, 'all');
      await page.keyboard.type(c.wrong, { delay: 60 });
      await page.keyboard.press(tab);
      await expect.poll(() => focused(page), { message: `${c.name} a ${width}` }).toBe(c.next);
      await expect(pdfButton(page)).toHaveCount(0);
      await expect(page.locator(`#${c.field}`)).toHaveAttribute('aria-invalid', 'true');
      if (c.download) expect(await page.evaluate(() => (window as unknown as { __to?: string }).__to), `${c.name} a ${width}`).toBe('download');
      // The error is said once, by the card's region, as before the F16 (decision 6).
      await expect.poll(() => voices(page), { timeout: 5_000 }).not.toHaveLength(0);
      await page.waitForTimeout(SPEAK_AFTER_MS + 200);
      const said = await voices(page);
      expect(said, said.join(' | ')).toHaveLength(1);
      expect(said[0]).toContain((await heroError(page).textContent())?.trim() ?? '(no error)');
      // The order of the page did not change, and the field keeps no hold of the focus: the Tab goes back to it.
      await page.keyboard.press(back);
      await expect.poll(() => focused(page), { message: `${c.name} a ${width}, de volta` }).toBe(`#${c.field}`);
    }
  });
}
