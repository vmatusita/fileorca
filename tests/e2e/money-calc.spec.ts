// The money calculators end to end (prompt F4, decisions 5 to 7): the CSV read back equals the oracle's schedule
// to the cent, the PDF passes strictPdf and draws the total and the last row, a value out of range says the range
// and keeps the last result, the result has one voice, the schedule is built only when it is opened, the scenario
// link is read once and never written, the Oli cheers once a visit, and a PDF that cannot load says so.
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { BR_CALC_IDS, CALC_PAGES, CALC_PAGE_IDS, GUIDES, moneyPage, type CalcPageId } from '../../src/tools/calc/registry.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import ptShared from '../../src/tools/calc/i18n/pt.ts';
import sacPriceTexts from '../../src/tools/br-sac-price/i18n/pt.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { dismissCookies, hydrated } from './lib/page.ts';
import { parsePdf, strictPdf } from './lib/pdf.ts';
import { pdfTextLines } from './lib/pdf-text.ts';

interface OracleCase {
  id: string;
  input: unknown;
  expected: { rows?: number[][] };
}

/** The oracle's case for the example a page opens with (fixtures/calc, written before the engines). */
function pageCase(id: CalcPageId): OracleCase {
  const def = DEFS[id];
  const input = JSON.parse(JSON.stringify(def.toInput(def.initial as never)));
  const cases = (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: OracleCase[] }).cases;
  const found = cases.find((entry) => entry.expected.rows && isDeepStrictEqual(entry.input, input));
  if (!found) throw new Error(`no oracle schedule for the example of ${id}`);
  return found;
}

async function open(page: Page, id: CalcPageId, hash = ''): Promise<void> {
  expect((await page.goto(`${CALC_PAGES[id].path}${hash}`))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

async function saved(page: Page, button: Locator): Promise<{ name: string; bytes: Buffer }> {
  const download = page.waitForEvent('download');
  await button.click();
  const file = await download;
  return { name: file.suggestedFilename(), bytes: readFileSync((await file.path()) ?? '') };
}

// F13b (DECISOES § 545): the Download PDF is in the card; Download CSV and Copy link share the row under it.
const pdfButton = (page: Page) => page.locator('.fo-rhero .fo-btn--download');
const csvButton = (page: Page) => page.locator('.fo-export .fo-btn').nth(0);
const linkButton = (page: Page) => page.locator('.fo-export .fo-btn').nth(1);
const heroNumber = (page: Page) => page.locator('.fo-rhero__num');

// The calculators whose result is a payment schedule; their example is in the oracle with every row.
const SCHEDULES = [
  'mortgage-calculator',
  'personal-loan-calculator',
  'auto-loan-calculator',
  'loan-amortization-calculator',
  'credit-card-payoff-calculator',
  'loan-amortization-calculator-balloon-payment',
] as const satisfies readonly CalcPageId[];

for (const id of SCHEDULES) {
  test(`${CALC_PAGES[id].path}: the CSV read back is the oracle's schedule, cent by cent`, async ({ page }) => {
    await open(page, id);
    const { name, bytes } = await saved(page, csvButton(page));
    expect(name).toBe(`${CALC_PAGES[id].file}.csv`);
    const text = bytes.toString('utf8');
    expect(text.startsWith('﻿'), 'BOM UTF-8').toBe(true);
    const lines = text.slice(1).split('\r\n');
    expect(lines.pop(), 'the file ends with CRLF').toBe('');
    const [header, ...rows] = lines.map((line) => line.split(','));
    expect(header).toEqual(['Year', 'Payment', 'Amount', 'Principal', 'Interest', 'Balance']);
    // The oracle's row is [number, payment, interest, principal, balance]; the table puts principal first.
    const expected = (pageCase(id).expected.rows ?? []).map(([n, payment, interest, principal, balance]) => [
      `Year ${Math.ceil((n ?? 0) / 12)}`,
      String(n),
      ...[payment, principal, interest, balance].map((cents) => (Number(cents) / 100).toFixed(2)),
    ]);
    expect(rows.length).toBe(expected.length);
    expect(rows).toEqual(expected);
  });
}

test('the mortgage PDF passes strictPdf and draws the total and the last row of the schedule', async ({ page }) => {
  await open(page, 'mortgage-calculator');
  const { name, bytes } = await saved(page, pdfButton(page));
  expect(name).toBe('mortgage-schedule.pdf');
  const strict = await strictPdf(new Uint8Array(bytes));
  expect(strict.problems).toEqual([]);
  expect(strict.pageCount).toBeGreaterThan(5);
  const lines = pdfTextLines(new Uint8Array(bytes));
  // The oracle: $682,636.71 paid on the loan, and payment 360 of $1,900.91 ($1,890.67 of principal and $10.24 of
  // interest) leaves $0.00.
  expect(lines).toContain('$682,636.71');
  const last = lines.lastIndexOf('360');
  expect(last, 'the last payment number').toBeGreaterThan(0);
  expect(lines.slice(last - 1, last + 5)).toEqual(['Year 30', '360', '$1,900.91', '$1,890.67', '$10.24', '$0.00']);
  expect(lines).toContain('Made with the free calculators at fileorca.com');
});

test('a value out of range says the range in words and keeps the last result', async ({ page }) => {
  await open(page, 'mortgage-calculator');
  const rate = page.locator('#fo-calc-r');
  const before = await heroNumber(page).textContent();
  await rate.fill('99');
  await expect(rate).toHaveAttribute('aria-invalid', 'true');
  // F13b (DECISOES § 545): the words are in the card, in the place of the Download, and the field points to them.
  const error = page.locator('.fo-rhero #fo-rhero-error');
  await expect(error).toHaveText('Enter a rate from 0 to 40%.');
  await expect(rate).toHaveAttribute('aria-describedby', /fo-rhero-error/);
  await expect(heroNumber(page)).toHaveText(before ?? '');
  await rate.fill('7');
  await expect(error).toHaveCount(0);
  await expect(heroNumber(page)).not.toHaveText(before ?? '');
});

test('every valid key press recalculates, with no Calculate button', async ({ page }) => {
  await open(page, 'loan-amortization-calculator');
  await expect(page.getByRole('button', { name: /calculate/i })).toHaveCount(0);
  const rate = page.locator('#fo-calc-r');
  await rate.fill('');
  const seen: string[] = [];
  for (const key of ['8', '.', '2', '5']) {
    await rate.press(key);
    seen.push((await heroNumber(page).textContent()) ?? '');
  }
  // 8%, then "8." is still 8%, then 8.2% and 8.25%: three different payments.
  expect(seen[1]).toBe(seen[0]);
  expect(new Set(seen).size).toBe(3);
});

test('the result has one voice: the hero speaks after the typing, and Copy link has its own status', async ({ page }) => {
  await page.addInitScript(() => {
    const clipboard = navigator.clipboard;
    if (clipboard) clipboard.writeText = async () => undefined;
  });
  await open(page, 'mortgage-calculator');
  const island = page.locator('#fo-tool-root');
  const voices = island.locator('[aria-live], [role="status"], [role="alert"]');
  await expect(voices).toHaveCount(2);
  const live = island.locator('.fo-rhero [aria-live="polite"]');
  await expect(live).toHaveText('');
  await page.locator('#fo-calc-p').fill('400000');
  await expect(live).toHaveText('');
  await expect(live).toContainText('Monthly payment: $', { timeout: 2_000 });
  await linkButton(page).click();
  await expect(island.locator('.fo-export-wrap [role="status"]')).toHaveText('Link copied');
  await expect(voices).toHaveCount(2);
});

test('without a clipboard, Copy link shows the link in a read-only field', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await open(page, 'refinance-calculator');
  await linkButton(page).click();
  const field = page.locator('#fo-calc-link');
  await expect(field).toBeVisible();
  await expect(field).toHaveAttribute('readonly', '');
  await expect(field).toHaveValue(/\/refinance-calculator\/#v=1&/);
});

test('the schedule is built only when opened, by year, with the first year open', async ({ page }) => {
  await open(page, 'mortgage-calculator');
  const schedule = page.locator('#fo-calc-schedule');
  await expect(schedule.locator('tr')).toHaveCount(0);
  await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
  const years = schedule.locator('tr.fo-amort__year');
  await expect(years).toHaveCount(30);
  const months = schedule.locator('tbody tr:not(.fo-amort__year)');
  await expect(months).toHaveCount(12);
  await expect(years.nth(0).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  await years.nth(1).getByRole('button').click();
  await expect(months).toHaveCount(24);
  // At 320px the open schedule scrolls inside its frame, never the page sideways.
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('the scenario link is read once, invalid values are ignored, and the page never writes the address', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { foHistory: string[] }).foHistory = calls;
    for (const name of ['pushState', 'replaceState'] as const) {
      const original = history[name].bind(history);
      history[name] = (...args: Parameters<History['pushState']>) => {
        calls.push(name);
        original(...args);
      };
    }
  });
  const hash = '#v=1&p=40000000&du=percent&dp=100000&r=999999999&t=15';
  await open(page, 'mortgage-calculator', hash);
  await expect(page.locator('#fo-calc-p')).toHaveValue('400,000');
  await expect(page.locator('#fo-calc-d')).toHaveValue('10');
  await expect(page.locator('#fo-calc-r')).toHaveValue('6.5');
  await expect(page.locator('#fo-calc-t')).toHaveValue('15');
  await page.locator('#fo-calc-p').fill('410000');
  // F13b (DECISOES § 547): the costs fold into a block; their fields are in the page once it is open.
  await page.locator('[aria-controls="fo-calc-more-fields"]').click();
  await page.locator('#fo-calc-tx').fill('5000');
  await expect(heroNumber(page)).toBeVisible();
  expect(new URL(page.url()).hash).toBe(hash);
  expect(await page.evaluate(() => (window as unknown as { foHistory: string[] }).foHistory)).toEqual([]);
  // A link of another version is ignored as a whole (a fresh load: a new # on the same page loads nothing).
  await page.goto('about:blank');
  await open(page, 'mortgage-calculator', '#v=2&p=40000000');
  await expect(page.locator('#fo-calc-p')).toHaveValue('375,000');
});

test('the Oli cheers on the first result of the visit only, and the visit keeps a yes, never a number', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page, 'personal-loan-calculator');
  // F13b (DECISOES § 545): the Oli is in the card from the first paint, waving; the first result of the visit makes her
  // cheer in the same box, and nothing moves.
  const oli = page.locator('.fo-rhero__oli');
  await expect(oli).toHaveAttribute('data-oli', 'wave');
  const top = () => heroNumber(page).evaluate((node) => Math.round(node.getBoundingClientRect().top + window.scrollY));
  const before = await top();
  await page.locator('#fo-calc-a').fill('16000');
  await expect(oli).toHaveAttribute('data-oli', 'cheer');
  await expect(oli.locator('use')).toHaveAttribute('href', '#oli-cheer');
  // The cheer is in the same box: the number does not move, and on a phone it stays above the fold.
  expect(await top()).toBe(before);
  expect(await heroNumber(page).evaluate((node) => node.getBoundingClientRect().bottom + window.scrollY)).toBeLessThanOrEqual(740);
  expect(await page.evaluate(() => sessionStorage.getItem('fo-calc-cheer'))).toBe('1');
  await open(page, 'auto-loan-calculator');
  await page.locator('#fo-calc-p').fill('33000');
  await expect(heroNumber(page)).toBeVisible();
  await expect(oli).toHaveCount(1);
  await expect(oli).toHaveAttribute('data-oli', 'wave');
});

test('a PDF maker that cannot load says to reload the page, and the calculator keeps working', async ({ page }) => {
  await page.route(/pdf-client|worker-/, (route) => route.abort());
  await open(page, 'loan-amortization-calculator');
  await pdfButton(page).click();
  await expect(page.locator('.fo-export-wrap [role="alert"]')).toHaveText("Oli couldn't load the PDF maker. Reload the page and try again.");
  // The error says it with the alert icon, as every error of the island does (review F4, DES-8).
  await expect(page.locator('.fo-export-wrap [role="alert"] svg')).toHaveCount(1);
  await expect(pdfButton(page)).not.toHaveAttribute('aria-busy', 'true');
  const before = await heroNumber(page).textContent();
  await page.locator('#fo-calc-a').fill('30000');
  await expect(heroNumber(page)).not.toHaveText(before ?? '');
});

test('two fields side by side keep their inputs on one line, also next to a field with help under it', async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'mortgage-calculator');
    // F13b (DECISOES § 547): the costs are in the block that folds, opened here.
    await page.locator('[aria-controls="fo-calc-more-fields"]').click();
    const top = (id: string) => page.locator(`#fo-calc-${id}`).evaluate((node) => Math.round(node.getBoundingClientRect().top));
    // PMI has a line of help under its input; HOA, next to it, has none.
    for (const [left, right] of [['p', 'd'], ['r', 't'], ['tx', 'in'], ['pmi', 'hoa']] as const) expect(await top(right), `${left} e ${right} a ${width}px`).toBe(await top(left));
  }
});

test('the Download PDF in yellow is in the card, then Download CSV and Copy link, and the chips lead to calculators', async ({ page }) => {
  await open(page, 'mortgage-calculator');
  // F13b (DECISOES § 545; F4 ACE-8): the PDF under the number, in the card; the CSV with its verb, next to Copy link.
  await expect(page.locator('.fo-rhero .fo-btn')).toHaveText(['Download PDF']);
  await expect(pdfButton(page)).toHaveClass(/fo-btn--download/);
  const buttons = page.locator('.fo-export .fo-btn');
  await expect(buttons).toHaveText(['Download CSV', 'Copy link']);
  await expect(page.locator('.fo-export .fo-btn--download')).toHaveCount(0);
  for (const href of await page.locator('.fo-calc__next a').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))) {
    expect(Object.values(CALC_PAGES).some((entry) => entry.path === href), href).toBe(true);
  }
});

// ---- regressions of the review F4 (docs/relatorios/REVISAO-F4.md; DECISOES § 139) --------------------------

test.describe('review F4 regressions', () => {
  test('a problem makes the Oli say oops, puts no Download and turns the CSV off; the cheer waits for a result (DES-2, COR-3)', async ({ page }) => {
    await open(page, 'credit-card-payoff-calculator');
    await page.locator('#fo-calc-pay').fill('10');
    // F13b (DECISOES § 545): the problem is said in the card, in the place of the Download, with the last result that worked;
    // the Oli is in the card in every state, and says oops.
    await expect(page.locator('#fo-rhero-error')).toContainText("doesn't cover the interest");
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'oops');
    await expect(pdfButton(page)).toHaveCount(0);
    await expect(page.locator('button.fo-btn--download[disabled]')).toHaveCount(0);
    await expect(csvButton(page)).toBeDisabled();
    await expect(linkButton(page)).toBeEnabled();
    await page.locator('#fo-calc-pay').fill('300');
    await expect(page.locator('.fo-rhero__oli')).toHaveAttribute('data-oli', 'cheer');
    await expect(pdfButton(page)).toBeEnabled();
  });

  test('a long result stays in its column and never scrolls the page sideways (ANU-1, ACE-10)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await open(page, 'home-affordability-calculator');
    await page.locator('#fo-calc-i').fill('800000');
    await expect(page.locator('.fo-rhero__oli')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.locator('#fo-calc-i').fill('30000000');
    const edge = await page.evaluate(() => {
      const hero = document.querySelector('.fo-rhero')!.getBoundingClientRect();
      const column = document.querySelector('.fo-calc__result')!.getBoundingClientRect();
      return { hero: Math.round(hero.right), column: Math.round(column.right) };
    });
    expect(edge.hero).toBeLessThanOrEqual(edge.column);
    // At 320px a 10-digit amount in the chart's legend and the Download wrap inside the card (second pass of the review;
    // F13b, DECISOES § 545: the placard that also had to wrap left the card).
    const fresh = await page.context().newPage();
    await fresh.setViewportSize({ width: 320, height: 700 });
    await open(fresh, 'simple-interest-calculator', '#v=1&pr=10000000000&r=1000000&u=years&ty=100');
    await fresh.locator('#fo-calc-pr').fill('99999999');
    await expect(fresh.locator('.fo-split__legend')).toContainText('$9,999,999,900');
    const inside = await fresh.evaluate(() => {
      const card = document.querySelector('.fo-rhero')!.getBoundingClientRect();
      const parts = [...document.querySelectorAll('.fo-rhero .fo-btn--download, .fo-split__legend li > span')].map((node) => node.getBoundingClientRect());
      return parts.every((box) => box.left >= card.left - 1 && box.right <= card.right + 1) && document.documentElement.scrollWidth <= 320;
    });
    expect(inside).toBe(true);
    await fresh.close();
  });

  test('the hero speaks half a second after the last key press, also one that leaves the number as it was (ACE-1)', async ({ page }) => {
    await open(page, 'mortgage-calculator');
    const heard = await page.evaluate(async () => {
      const input = document.querySelector<HTMLInputElement>('#fo-calc-r')!;
      const live = document.querySelector('.fo-rhero [aria-live="polite"]')!;
      const wait = (ms: number) => new Promise((done) => window.setTimeout(done, ms));
      const type = (text: string) => {
        input.focus();
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      type('6');
      await wait(300);
      type('6.'); // the number does not change
      await wait(350);
      const early = live.textContent;
      await wait(400);
      return { early, late: live.textContent };
    });
    expect(heard.early).toBe('');
    expect(heard.late).toContain('Monthly payment: $');
  });

  test('the one field that takes a minus opens the text keyboard; the others the decimal one (ACE-2)', async ({ page }) => {
    await open(page, 'rent-vs-buy-calculator');
    await expect(page.locator('#fo-calc-ap')).toHaveAttribute('inputmode', 'text');
    await expect(page.locator('#fo-calc-p')).toHaveAttribute('inputmode', 'decimal');
  });

  test('without a clipboard, the shown link follows the numbers as they change (PRI-3)', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
    await open(page, 'mortgage-calculator');
    await linkButton(page).click();
    await expect(page.locator('#fo-calc-link')).toHaveValue(/&p=37500000(&|$)/);
    await page.locator('#fo-calc-p').fill('500000');
    await expect(page.locator('#fo-calc-link')).toHaveValue(/&p=50000000(&|$)/);
  });

  test('the chart is named with whole dollars and both shares, and its legend keeps the share with its amount (ACE-4, DES-7)', async ({ page }) => {
    await open(page, 'mortgage-calculator');
    await expect(page.locator('.fo-split__bar')).toHaveAttribute('aria-label', 'Principal $300,000, 44%. Interest $382,637, 56%.');
    await expect(page.locator('.fo-split__legend li > span').first()).toHaveText(/^Principal \$300,000 · 44%$/);
  });

  test('the keyboard focus stays in the list when debts come and go (ACE-6)', async ({ page }) => {
    await open(page, 'debt-payoff-calculator');
    const add = page.getByRole('button', { name: 'Add a debt' });
    while ((await page.locator('.fo-debt').count()) < 10) {
      await add.focus();
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('#fo-calc-d9b')).toBeFocused();
    await page.locator('#fo-calc-d9-remove').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#fo-calc-d8-remove')).toBeFocused();
    await page.locator('#fo-calc-d4-remove').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#fo-calc-d4-remove')).toBeFocused();
    while ((await page.locator('.fo-debt').count()) > 1) {
      await page.locator('.fo-debt__remove').last().focus();
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('#fo-calc-d-add')).toBeFocused();
  });

  test('on a phone the balance of each year stays in the frame of the schedule, and the header never hides a year (DES-10, ACE-5)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await open(page, 'mortgage-calculator');
    await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
    const inside = await page.evaluate(() => {
      const frame = document.querySelector('.fo-amort-wrap')!.getBoundingClientRect();
      const cell = document.querySelector('.fo-amort__year td:last-child')!.getBoundingClientRect();
      return cell.left >= frame.left - 1 && cell.right <= frame.right + 1;
    });
    expect(inside).toBe(true);
    const years = page.locator('.fo-amort__year button');
    await years.last().focus();
    for (let step = 0; step < 6; step += 1) await page.keyboard.press('Shift+Tab');
    // WebKit scrolls the frame to the focus a moment after the key: the check waits for the scroll to settle.
    const covered = () =>
      page.evaluate(() => {
        const button = document.activeElement as HTMLElement;
        const box = button.getBoundingClientRect();
        const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return !(hit && button.contains(hit));
      });
    await expect.poll(covered).toBe(false);
  });

  // F13b (D-38; DECISOES § 549): side by side down to 320 px (it was from 340 px of column, at 375 px).
  test('the two scenarios stay side by side down to 320px (DES-9)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page, 'mortgage-calculator-15-vs-30-year');
    expect(await page.locator('.fo-compare').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  });

  test('every prefilled rate carries the example tag (COR-4)', async ({ page }) => {
    for (const [id, field] of [['refinance-calculator', 'r'], ['debt-payoff-calculator', 'd0r'], ['debt-consolidation-calculator', 'd0r']] as const) {
      await open(page, id);
      await expect(page.locator(`label[for="fo-calc-${field}"] .fo-tag`), id).toHaveText('example');
    }
  });

  test('the box of every field is control-h high, next to help, a tag or an error (DES-1)', async ({ page }) => {
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      for (const id of ['mortgage-calculator', 'rent-vs-buy-calculator', 'home-affordability-calculator', 'mortgage-calculator-extra-payments'] as const) {
        await page.goto('about:blank');
        await open(page, id);
        if (id === 'mortgage-calculator') await page.locator('#fo-calc-r').fill('99');
        // The field in error keeps the same box inside the 3px border of the design system: the others are compared.
        const heights = await page.locator('.fo-calc .fo-field:not([data-state="error"]) .fo-input').evaluateAll((boxes) => [...new Set(boxes.map((box) => Math.round(box.getBoundingClientRect().height)))]);
        expect(heights, `${id} a ${width}px`).toEqual([52]);
      }
    }
  });

  test('the pages name their calculator as their H1, and each guide links the calculator it embeds (SEO-3, SEO-1, COR-5)', async ({ page }) => {
    for (const id of ['mortgage-calculator-extra-payments', 'mortgage-calculator-15-vs-30-year', 'mortgage-calculator'] as const) {
      await page.goto(CALC_PAGES[id].path);
      const names = await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((node) => {
          const data = JSON.parse(node.textContent ?? '{}');
          const items: { '@type'?: string; name?: string }[] = Array.isArray(data) ? data : (data['@graph'] ?? [data]);
          return items.filter((item) => item['@type'] === 'WebApplication').map((item) => item.name);
        }),
      );
      expect(names, id).toEqual([await page.locator('h1').textContent()]);
    }
    for (const guide of Object.values(GUIDES)) {
      await page.goto(guide.path);
      await expect(page.locator(`main a[href="${CALC_PAGES[guide.calc].path}"]`).first(), guide.path).toBeAttached();
      expect(await page.locator('main').textContent(), guide.path).not.toMatch(/\b\d+ years loan\b/);
    }
  });
});

// ---- second pass of the review F4 (docs/relatorios/REVISAO-F4.md) ------------------------------------------

test.describe('second pass of the review F4', () => {
  test('a stale result (a field to fix) puts no PDF and turns the CSV off, so new inputs never go with an old result', async ({ page }) => {
    await open(page, 'mortgage-calculator-extra-payments');
    await page.locator('#fo-calc-eo').fill('5000');
    await page.locator('#fo-calc-eom').fill('300');
    await page.locator('#fo-calc-t').fill('10');
    // F13b (DECISOES § 545): the line is in the card, after the last result that worked, and the Download is not there.
    await expect(page.locator('.fo-rhero__stale')).toContainText('Fix the highlighted field to update the result.');
    await expect(pdfButton(page)).toHaveCount(0);
    await expect(csvButton(page)).toBeDisabled();
    await page.locator('#fo-calc-eom').fill('100');
    await expect(page.locator('.fo-rhero__stale')).toHaveCount(0);
    await expect(pdfButton(page)).toBeEnabled();
  });

  test('a group of options keeps the 16px gap to the next field, with no empty space under it', async ({ page }) => {
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      for (const id of ['apr-to-apy-calculator', 'compound-interest-calculator', 'refinance-calculator'] as const) {
        await page.goto('about:blank');
        await open(page, id);
        const gaps = await page.locator('.fo-calc__fields > fieldset').evaluateAll((sets) =>
          sets.map((set) => {
            const next = set.nextElementSibling;
            const below = next ? next.getBoundingClientRect().top - set.getBoundingClientRect().bottom : 16;
            const content = [...set.children].reduce((bottom, child) => Math.max(bottom, child.getBoundingClientRect().bottom), 0);
            return { below: Math.round(below), empty: Math.round(set.getBoundingClientRect().bottom - content) };
          }),
        );
        for (const gap of gaps) {
          expect(gap.below, `${id} a ${width}px`).toBe(16);
          expect(gap.empty, `${id} a ${width}px`).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  test('on a phone the Balance heading stays over the balance of the year', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await open(page, 'mortgage-calculator');
    await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
    const column = await page.evaluate(() => {
      const heading = document.querySelector('.fo-amort th:last-child')!.getBoundingClientRect();
      const cell = document.querySelector('.fo-amort__year td:last-child')!.getBoundingClientRect();
      return { heading: Math.round(heading.right), cell: Math.round(cell.right) };
    });
    expect(column.heading).toBe(column.cell);
  });
});

// F6 (decisions 1, 5 and 6): the files of the Spanish and Portuguese pages, saved from the page. The Spanish mortgage has
// the English oracle's schedule in the English CSV shape, with the Spanish header and year, and a Letter PDF; the
// Brazilian SAC × PRICE has its oracle's two schedules in the Portuguese CSV (semicolon, decimal comma, BOM) and an A4 PDF.
test.describe('F6: the CSV and the PDF in Spanish and Portuguese', () => {
  test('the Spanish mortgage CSV is the English oracle schedule in Spanish words, and its PDF is Letter', async ({ page }) => {
    const es = moneyPage('mortgage-calculator', 'es');
    expect((await page.goto(es?.path ?? ''))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const { name, bytes } = await saved(page, csvButton(page));
    expect(name).toBe(`${es?.file}.csv`);
    const text = bytes.toString('utf8');
    expect(text.startsWith('﻿'), 'BOM UTF-8').toBe(true);
    const lines = text.slice(1).split('\r\n');
    expect(lines.pop(), 'the file ends with CRLF').toBe('');
    const [header, ...rows] = lines.map((line) => line.split(','));
    const s = esShared.island;
    expect(header).toEqual([s.year.replace(/\s*\{n\}/, ''), s.columns.number, s.columns.payment, s.columns.principal, s.columns.interest, s.columns.balance]);
    const expected = (pageCase('mortgage-calculator').expected.rows ?? []).map(([n, payment, interest, principal, balance]) => [
      s.year.replace('{n}', String(Math.ceil((n ?? 0) / 12))),
      String(n),
      ...[payment, principal, interest, balance].map((cents) => (Number(cents) / 100).toFixed(2)),
    ]);
    expect(rows).toEqual(expected);

    const pdf = await saved(page, pdfButton(page));
    expect(pdf.name).toBe(`${es?.file}.pdf`);
    const read = parsePdf(new Uint8Array(pdf.bytes));
    for (const sheet of read.pages) expect([sheet.width, sheet.height]).toEqual([612, 792]);
    const drawn = pdfTextLines(new Uint8Array(pdf.bytes));
    expect(drawn).toContain('$682,636.71');
    const last = drawn.lastIndexOf('360');
    expect(drawn.slice(last - 1, last + 5)).toEqual([s.year.replace('{n}', '30'), '360', '$1,900.91', '$1,890.67', '$10.24', '$0.00']);
  });

  test('the SAC × PRICE CSV has both oracle schedules with semicolons and the decimal comma, and its PDF is A4', async ({ page }) => {
    const pt = moneyPage('br-sac-price', 'pt');
    expect((await page.goto(pt?.path ?? ''))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const { name, bytes } = await saved(page, csvButton(page));
    expect(name).toBe(`${pt?.file}.csv`);
    const text = bytes.toString('utf8');
    expect(text.startsWith('﻿'), 'BOM UTF-8').toBe(true);
    const lines = text.slice(1).split('\r\n');
    expect(lines.pop(), 'the file ends with CRLF').toBe('');
    const [header, ...rows] = lines.map((line) => line.split(';'));
    const s = ptShared.island;
    const v = sacPriceTexts.panel.view;
    expect(header).toEqual([s.year.replace(/\s*\{n\}/, ''), s.columns.number, s.columns.payment, s.columns.principal, s.columns.interest, v.feesColumn, s.columns.balance, v.correction]);
    // The oracle's row is [number, payment, interest, principal, balance, correction]; the table puts principal first, and the
    // payment carries the insurance and fees of the month, in a column of their own too (review F6, a-2; DECISOES § 252).
    const fees = Number(DEFS['br-sac-price'].initial['f']);
    const real = (cents: number) => `${Math.trunc(cents / 100)},${String(Math.abs(cents) % 100).padStart(2, '0')}`;
    const fixture = JSON.parse(readFileSync('fixtures/calc/br-sac-price.json', 'utf8')) as { cases: { id: string; expected: { sac: { rows: number[][] }; price: { rows: number[][] } } }[] };
    const example = fixture.cases.find((entry) => entry.id === 'page-example')?.expected;
    const expected = (['sac', 'price'] as const).flatMap((plan) =>
      (example?.[plan].rows ?? []).map(([n, payment, interest, principal, balance, correction]) => [
        `${v[plan]} · ${s.year.replace('{n}', String(Math.ceil((n ?? 0) / 12)))}`,
        String(n),
        ...[Number(payment) + fees, principal, interest, fees, balance, correction].map((cents) => real(Number(cents))),
      ]),
    );
    expect(fees).toBeGreaterThan(0);
    expect(rows.length).toBe(720);
    expect(rows).toEqual(expected);

    const pdf = await saved(page, pdfButton(page));
    expect(pdf.name).toBe(`${pt?.file}.pdf`);
    const read = parsePdf(new Uint8Array(pdf.bytes));
    for (const sheet of read.pages) expect([sheet.width, sheet.height]).toEqual([595.28, 841.89]);
    const drawn = pdfTextLines(new Uint8Array(pdf.bytes)).join('\n');
    expect(drawn).toContain('R$ 4.754,95');
    expect(drawn).toMatch(/Página 1 de \d+/);
  });
});

// Every money calculator page in the three languages: the 18 in English, the same 18 in Spanish (every row of the registry
// has its Spanish page since the languages adjustment) and the 8 of Brazil. The two tests that walk them all go in blocks of
// pages, a test each, so a block keeps the room of its 120 s on the WebKit of the CI as the site grows (DECISOES § 306).
const MONEY_PATHS = [
  ...CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path),
  ...CALC_PAGE_IDS.map((id) => moneyPage(id, 'es')?.path ?? ''),
  ...BR_CALC_IDS.map((id) => moneyPage(id, 'pt')?.path ?? ''),
];
const MONEY_BLOCK = 15;
/** The pages in blocks of MONEY_BLOCK, each with the words of its test title ("pages 16 to 30"). */
function moneyBlocks(paths: readonly string[]): { name: string; paths: string[] }[] {
  const out: { name: string; paths: string[] }[] = [];
  for (let start = 0; start < paths.length; start += MONEY_BLOCK) {
    const block = paths.slice(start, start + MONEY_BLOCK);
    out.push({ name: `pages ${start + 1} to ${start + block.length}`, paths: block });
  }
  return out;
}

// Review F6 (f-3; DECISOES § 246): the number of the ResultHero, with its unit, stays on one line from 320 to 1280px on every
// calculator in the three languages, with the example it opens with. Before, "R$ 166.010,85" broke in the middle from 768px
// ("R$ 166.010,8" and "5"), and the Portuguese "/mês" went to a line of its own.
// Second pass (DECISOES § 253): and a long whole amount typed in, "$22,222,828", which used to break at 320, 768 and 1280px.
const HERO_PATHS = [...MONEY_PATHS, `${CALC_PAGES['compound-interest-calculator'].path}#v=1&i=58900000&m=0&r=120000&y=30`];
for (const block of moneyBlocks(HERO_PATHS)) {
  test(`the ResultHero number and its unit stay on one line at 320, 360, 768 and 1280px, in the three languages (${block.name})`, async ({ page }) => {
    test.setTimeout(120_000);
    const broken: string[] = [];
    const english = new Set(CALC_PAGE_IDS.map((id) => CALC_PAGES[id].path));
    for (const path of block.paths) {
      await page.setViewportSize({ width: 320, height: 900 });
      expect((await page.goto(path))?.status(), path).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      for (const width of [320, 360, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const { lines, size } = await page.locator('.fo-rhero__num').first().evaluate((num) => ({
          lines: Math.round(num.getBoundingClientRect().height / parseFloat(getComputedStyle(num).lineHeight)),
          size: parseFloat(getComputedStyle(num).fontSize),
        }));
        if (lines !== 1) broken.push(`${path} a ${width}px: ${lines} linhas`);
        // The English numbers fit at their full size with their example: they stay at 48px, and 60px from 768px, as before.
        if (english.has(path) && size < (width >= 768 ? 60 : 48)) broken.push(`${path} a ${width}px: ${size}px`);
      }
    }
    expect(broken).toEqual([]);
  });
}

// Review F6 (f-4; DECISOES § 247): no value of the worked example breaks inside a word or a number, at 320, 360 and 1280px, on
// every calculator in the three languages ("R$ 1.084.638,2" and "0" before, and "$375,000.0" and "0" in Spanish); a value
// may wrap at a space, and the page never scrolls sideways.
for (const block of moneyBlocks(MONEY_PATHS)) {
  test(`the values of the worked example never break inside a number at 320, 360 and 1280px, in the three languages (${block.name})`, async ({ page }) => {
    test.setTimeout(120_000);
    const broken: string[] = [];
    for (const path of block.paths) {
      await page.setViewportSize({ width: 320, height: 900 });
      expect((await page.goto(path))?.status(), path).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      for (const width of [320, 360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const cells = await page.locator('.fo-example td').evaluateAll((tds) =>
          tds.flatMap((td) => {
            // Every run of characters with no ordinary space between them (a number, with its no-break space) is on one line.
            const tops: { char: string; top: number }[] = [];
            const walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const text = node.textContent ?? '';
              for (let i = 0; i < text.length; i += 1) {
                const range = document.createRange();
                range.setStart(node, i);
                range.setEnd(node, i + 1);
                const rect = range.getClientRects()[0];
                if (rect) tops.push({ char: text[i] ?? '', top: Math.round(rect.top) });
              }
            }
            let token: number[] = [];
            const split: string[] = [];
            for (const { char, top } of [...tops, { char: ' ', top: 0 }]) {
              if (char === ' ') {
                if (new Set(token).size > 1) split.push(td.textContent ?? '');
                token = [];
              } else token.push(top);
            }
            return split.slice(0, 1);
          }),
        );
        expect(await page.locator('.fo-example td').count(), path).toBeGreaterThan(0);
        for (const cell of cells) broken.push(`${path} a ${width}px: "${cell}"`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} a ${width}px`).toBeLessThanOrEqual(width);
      }
    }
    expect(broken).toEqual([]);
  });
}

// Review F6 (d-1; DECISOES § 251): text that is not a number of the page's language gets the range and how the page writes
// decimals (WCAG 3.3.3); a number out of the range gets the range alone, in the three languages.
// F16 (items 1 and 2; DECISOES § 683, § 684 and § 696): a thousands separator and two digits at the end of the price gets the
// hint too ("3,755,00"), and a number written right with more decimals than the field keeps gets how many it keeps, alone:
// four in the rate, two in the price, none in the term (until the F16 the term said its range).
const DECIMALS_SAID = {
  en: { rate: 'Use up to 4 decimal places.', price: 'Use up to 2 decimal places.', term: 'Use a whole number.' },
  pt: { rate: 'Use até 4 casas decimais.', price: 'Use até 2 casas decimais.', term: 'Use um número inteiro.' },
  es: { rate: 'Usa hasta 4 decimales.', price: 'Usa hasta 2 decimales.', term: 'Usa un número entero.' },
};
test('a decimal written the way of another language gets the range and how to write it, and too many decimals how many', async ({ page }) => {
  for (const [lang, path, wrong, out] of [
    ['pt', moneyPage('br-sac-price', 'pt')?.path ?? '', '11.5', '99'],
    ['es', moneyPage('mortgage-calculator', 'es')?.path ?? '', '6,5', '99'],
    ['en', CALC_PAGES['mortgage-calculator'].path, '6,5', '99'],
  ] as const) {
    expect((await page.goto(path))?.status(), path).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const hint = { en: enShared, pt: ptShared, es: esShared }[lang].island.decimalHint;
    const field = page.locator('#fo-calc-r');
    // F13b (DECISOES § 545): the words of the field in error are said in the card.
    const error = page.locator('#fo-rhero-error');
    await field.fill(wrong);
    await expect(error, `${lang} ${wrong}`).toContainText(hint);
    await field.fill(out);
    await expect(error, `${lang} ${out}`).toBeVisible();
    await expect(error, `${lang} ${out}`).not.toContainText(hint);
    // Second pass (DECISOES § 254): letters and an empty field are not a matter of decimals, and a whole-number field takes none.
    for (const text of ['abc', '']) {
      await field.fill(text);
      await expect(error, `${lang} "${text}"`).toBeVisible();
      await expect(error, `${lang} "${text}"`).not.toContainText(hint);
    }
    // F16: a number written right with five decimals in the rate gets the four the rate keeps, with no range and no hint.
    await field.fill(lang === 'pt' ? '6,55555' : '6.55555');
    await expect(error, `${lang} taxa com 5 casas`).toHaveText(DECIMALS_SAID[lang].rate);
    await field.fill(lang === 'pt' ? '11,5' : '6.5');
    await expect(error, `${lang} taxa certa`).toHaveCount(0);
    // F16: the price, with three decimals, and with a separator and two digits at its end (the hint, as "6,5" in the rate).
    const price = page.locator('#fo-calc-p');
    await price.fill(lang === 'pt' ? '500.000,555' : '375,000.555');
    await expect(error, `${lang} preço com 3 casas`).toHaveText(DECIMALS_SAID[lang].price);
    await price.fill(lang === 'pt' ? '5.005.00' : '3,755,00');
    await expect(error, `${lang} preço com o separador`).toContainText(hint);
    await price.fill(lang === 'pt' ? '500.000' : '375,000');
    await expect(error, `${lang} preço certo`).toHaveCount(0);
    const term = page.locator('#fo-calc-n, #fo-calc-t').first();
    await term.fill(lang === 'pt' ? '12,5' : '30.5');
    await expect(term, `${lang} prazo`).toHaveAttribute('aria-invalid', 'true');
    await expect(error, `${lang} prazo`).toHaveText(DECIMALS_SAID[lang].term);
    await expect(error, `${lang} prazo`).not.toContainText(hint);
  }
});

// Second pass of the review F6 (DECISOES § 256): in the SAC × PRICE schedule, whose last columns are the insurance and fees
// and the TR correction, the balance at the end of each year sits under "Saldo devedor", not under the last column.
test('the year rows of the SAC × PRICE schedule put the balance under its column', async ({ page }) => {
  const pt = moneyPage('br-sac-price', 'pt');
  expect((await page.goto(pt?.path ?? ''))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
  await page.locator('#fo-calc-schedule button[aria-controls="fo-schedule-table"]').click();
  await expect(page.locator('.fo-amort tr.fo-amort__year').first()).toBeVisible();
  const columns = await page.locator('.fo-amort').evaluate((table) => {
    const head = [...table.querySelectorAll('thead th')].map((th) => th.textContent?.trim() ?? '');
    const year = table.querySelector('tr.fo-amort__year');
    let column = 0;
    let balanceAt = -1;
    for (const cell of [...(year?.children ?? [])] as HTMLTableCellElement[]) {
      if (/R\$/.test(cell.textContent ?? '')) balanceAt = column;
      column += cell.colSpan;
    }
    return { head, balanceAt, width: column };
  });
  expect(columns.width).toBe(columns.head.length);
  expect(columns.head[columns.balanceAt]).toBe(ptShared.island.columns.balance);
});
