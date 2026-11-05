// F13b (UX-12 A, decision 4; DECISOES § 555): the new states of the calculators and of the QR code generator that the
// page-by-page pass of a11y.spec.ts does not reach, at 360 and 1280 px and in both themes (violationsEverywhere): the example
// with the Oli in the card; an error said in the card (the field marked, the Download replaced by the message, the last result
// that worked); the block of costs open with the echo of the result; the schedule open in the island, with a second year open;
// and the QR code generator with no code (the place of the downloads saying why) and with one. A file of its own, next to the
// PDF states, so the weight of a11y.spec.ts does not grow (DECISOES § 307).
import { expect, test, type Page } from '@playwright/test';
import { LANGS, QR_ID, routeById } from '../../src/i18n/routes.ts';
import { CALC_PAGES, LIFE_CALC_PAGES, moneyPage } from '../../src/tools/calc/registry.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { hydrated } from './lib/page.ts';

test.use({ reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
});

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), path).toBe(200);
  await hydrated(page);
  await page.evaluate(() => document.fonts.ready);
}

/** The violations of a state, each with the state's name. */
async function check(page: Page, state: string, found: string[]): Promise<void> {
  for (const violation of await violationsEverywhere(page)) found.push(`${state}: ${violation}`);
}

const CALCS = [
  { path: CALC_PAGES['mortgage-calculator'].path, field: 'r', wrong: '99' },
  { path: moneyPage('mortgage-calculator', 'es')?.path ?? '', field: 'r', wrong: '99' },
  { path: moneyPage('br-sac-price', 'pt')?.path ?? '', field: 'n', wrong: '5' },
  { path: CALC_PAGES['credit-card-payoff-calculator'].path, field: 'pay', wrong: '10' },
  { path: LIFE_CALC_PAGES['bmi-calculator'].path, field: 'lb', wrong: 'abc' },
];
for (const { path, field, wrong } of CALCS) {
  test(`${path}: the example, an error in the card, the block of costs open and the schedule open`, async ({ page }) => {
    test.setTimeout(120_000);
    const found: string[] = [];
    await open(page, path);
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'wave');
    await check(page, 'exemplo', found);
    await page.locator(`#fo-calc-${field}`).fill(wrong);
    await page.locator(`#fo-calc-${field}`).blur();
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    await check(page, 'erro no card', found);
    await page.goto('about:blank');
    await open(page, path);
    const fold = page.locator('[aria-controls="fo-calc-more-fields"]');
    if (await fold.count()) {
      await fold.click();
      await expect(page.locator('#fo-calc-more-fields input').first()).toBeVisible();
      await check(page, 'bloco de custos aberto', found);
    }
    const schedule = page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]');
    if (await schedule.count()) {
      await schedule.click();
      const years = page.locator('#fo-calc-schedule tr.fo-amort__year');
      if ((await years.count()) > 1) await years.nth(1).getByRole('button').click();
    }
    await expect(page.locator('#fo-calc-schedule .fo-amort tbody tr').first()).toBeVisible();
    await check(page, 'cronograma aberto', found);
    expect(found).toEqual([]);
  });
}

for (const lang of LANGS) {
  const path = routeById(QR_ID).paths[lang] ?? '';
  test(`${path}: the QR code generator with no code and with one`, async ({ page }) => {
    const found: string[] = [];
    await open(page, path);
    await expect(page.locator('.fo-qr__wait')).toBeVisible();
    await check(page, 'sem código', found);
    await page.locator('#fo-tool-root textarea').fill(`https://fileorca.com${path}`);
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible();
    await check(page, 'com código', found);
    expect(found).toEqual([]);
  });
}
