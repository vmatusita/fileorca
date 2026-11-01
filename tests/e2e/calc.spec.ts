// The money calculators end to end (prompt F4, decisions 5 to 7): the CSV read back equals the oracle's schedule
// to the cent, the PDF passes strictPdf and draws the total and the last row, a value out of range says the range
// and keeps the last result, the result has one voice, the schedule is built only when it is opened, the scenario
// link is read once and never written, the Oli cheers once a visit, and a PDF that cannot load says so.
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { CALC_PAGES, GUIDES, type CalcPageId } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { dismissCookies, hydrated } from './lib/page.ts';
import { strictPdf } from './lib/pdf.ts';
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

const pdfButton = (page: Page) => page.locator('.fo-export .fo-btn').nth(0);
const csvButton = (page: Page) => page.locator('.fo-export .fo-btn').nth(1);
const linkButton = (page: Page) => page.locator('.fo-export .fo-btn').nth(2);
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
  const error = page.locator('#fo-calc-r-error');
  await expect(error).toHaveText('Enter a rate from 0 to 40%.');
  await expect(rate).toHaveAttribute('aria-describedby', /fo-calc-r-error/);
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
  await page.getByRole('button', { name: 'Show the full schedule' }).click();
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
  const cheer = page.locator('.fo-rhero__oli');
  await expect(cheer).toHaveCount(0);
  const top = () => heroNumber(page).evaluate((node) => Math.round(node.getBoundingClientRect().top + window.scrollY));
  const before = await top();
  await page.locator('#fo-calc-a').fill('16000');
  await expect(cheer).toHaveCount(1);
  // The cheer comes in under the chart: the number does not move, and on a phone it stays above the fold.
  expect(await top()).toBe(before);
  expect(await heroNumber(page).evaluate((node) => node.getBoundingClientRect().bottom + window.scrollY)).toBeLessThanOrEqual(740);
  expect(await page.evaluate(() => sessionStorage.getItem('fo-calc-cheer'))).toBe('1');
  await open(page, 'auto-loan-calculator');
  await page.locator('#fo-calc-p').fill('33000');
  await expect(heroNumber(page)).toBeVisible();
  await expect(cheer).toHaveCount(0);
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
    const top = (id: string) => page.locator(`#fo-calc-${id}`).evaluate((node) => Math.round(node.getBoundingClientRect().top));
    // PMI has a line of help under its input; HOA, next to it, has none.
    for (const [left, right] of [['p', 'd'], ['r', 't'], ['tx', 'in'], ['pmi', 'hoa']] as const) expect(await top(right), `${left} e ${right} a ${width}px`).toBe(await top(left));
  }
});

test('the ExportBar is PDF in yellow, then CSV, then Copy link, and the chips lead to calculators', async ({ page }) => {
  await open(page, 'mortgage-calculator');
  const buttons = page.locator('.fo-export .fo-btn');
  await expect(buttons).toHaveText(['Download PDF', 'CSV', 'Copy link']);
  await expect(buttons.nth(0)).toHaveClass(/fo-btn--download/);
  for (const href of await page.locator('.fo-calc__next a').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))) {
    expect(Object.values(CALC_PAGES).some((entry) => entry.path === href), href).toBe(true);
  }
});

// ---- regressions of the review F4 (docs/relatorios/REVISAO-F4.md; DECISOES § 139) --------------------------

test.describe('review F4 regressions', () => {
  test('a problem shows no Oli and turns the PDF and CSV off; the cheer waits for a result (DES-2, COR-3)', async ({ page }) => {
    await open(page, 'credit-card-payoff-calculator');
    await page.locator('#fo-calc-pay').fill('10');
    await expect(page.locator('.fo-rhero__sentence')).toContainText("doesn't cover the interest");
    await expect(page.locator('.fo-rhero__oli')).toHaveCount(0);
    await expect(pdfButton(page)).toBeDisabled();
    await expect(csvButton(page)).toBeDisabled();
    await expect(linkButton(page)).toBeEnabled();
    await page.locator('#fo-calc-pay').fill('300');
    await expect(page.locator('.fo-rhero__oli')).toHaveCount(1);
    await expect(page.locator('.fo-rhero__oli .fo-placard')).toHaveClass(/fo-pop/);
    await expect(pdfButton(page)).toBeEnabled();
  });

  test('a long result with the cheer stays in its column and never scrolls the page sideways (ANU-1, ACE-10)', async ({ page }) => {
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
    // A 10-digit amount in the chart's legend wraps inside the card at 320px.
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('about:blank');
    await open(page, 'simple-interest-calculator', '#v=1&pr=10000000000&r=1000000&u=years&ty=100');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
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
    await page.getByRole('button', { name: 'Show the full schedule' }).click();
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

  test('the two scenarios stay side by side from 340px of column (DES-9)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
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
