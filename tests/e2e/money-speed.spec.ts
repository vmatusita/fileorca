// What a key press costs (prompt F4, criterion 7): 30 key presses in the three heaviest calculators (Rent vs buy,
// Debt payoff with 10 debts and the extra payments preset), measured inside the page in one page.evaluate per
// calculator, from the `input` event to the MutationObserver seeing the ResultHero change. In Chromium the p95 is
// at most 16 ms; WebKit runs the same 30 presses and prints its times (the criterion names Chromium). Every press
// changes the result (Backspace on the last digit, then a new digit), and no month row is in the DOM before the
// schedule is opened.
import { expect, test } from '@playwright/test';
import { dismissCookies, hydrated } from './lib/page.ts';

const BUDGET_MS = 16;
const PRESSES = 30;

const CASES = [
  { name: 'rent vs buy', path: '/rent-vs-buy-calculator/', field: '#fo-calc-rent', base: '2200', debts: 0 },
  { name: 'debt payoff with 10 debts', path: '/debt-payoff-calculator/', field: '#fo-calc-x', base: '200', debts: 10 },
  { name: 'mortgage with extra payments', path: '/mortgage-calculator/extra-payments/', field: '#fo-calc-em', base: '200', debts: 0 },
  // Review F4 (COR-1): APY into APR takes a 365th root for daily compounding; it cost 22 ms a key press.
  { name: 'APY into APR, daily', path: '/apr-to-apy-calculator/#v=1&dir=apy-to-apr&c=365', field: '#fo-calc-r', base: '5.25', debts: 0 },
] as const;

/** The texts a person makes with 30 presses: Backspace on the last digit, then a new digit, and again. */
function presses(base: string): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < PRESSES; i += 1) {
    out.push(base.slice(0, -1));
    if (out.length < PRESSES) out.push(`${base}${(i % 9) + 1}`);
  }
  return out;
}

const percentile = (sorted: number[], p: number): number => sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)] ?? Infinity;

for (const kase of CASES) {
  test(`${kase.name}: a key press recalculates in at most ${BUDGET_MS} ms (p95 of ${PRESSES})`, async ({ page, browserName }) => {
    expect((await page.goto(kase.path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    if (kase.debts > 0) {
      const add = page.getByRole('button', { name: 'Add a debt' });
      while ((await page.locator('.fo-debt').count()) < kase.debts) await add.click();
      await expect(page.locator('.fo-debt')).toHaveCount(kase.debts);
    }
    const field = page.locator(kase.field);
    await field.fill(kase.base);
    await expect(field).toHaveValue(kase.base);

    const { times, missed, monthRows } = await page.evaluate(
      async ({ selector, texts }) => {
        const input = document.querySelector<HTMLInputElement>(selector);
        const hero = document.querySelector('.fo-rhero');
        if (!input || !hero) throw new Error('no field or no ResultHero');
        input.focus();
        const measured: number[] = [];
        let lost = 0;
        for (const text of texts) {
          let start = 0;
          const seen = new Promise<number>((resolve) => {
            const observer = new MutationObserver(() => {
              observer.disconnect();
              resolve(performance.now() - start);
            });
            observer.observe(hero, { childList: true, subtree: true, characterData: true });
            window.setTimeout(() => {
              observer.disconnect();
              resolve(-1);
            }, 1_000);
          });
          input.value = text;
          start = performance.now();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const ms = await seen;
          if (ms < 0) lost += 1;
          else measured.push(ms);
        }
        return { times: measured, missed: lost, monthRows: document.querySelectorAll('#fo-calc-schedule tr').length };
      },
      { selector: kase.field, texts: presses(kase.base) },
    );

    expect(missed, 'presses that did not change the ResultHero').toBe(0);
    expect(times).toHaveLength(PRESSES);
    expect(monthRows, 'no month row before the schedule is opened').toBe(0);
    const sorted = [...times].sort((a, b) => a - b);
    const p50 = percentile(sorted, 0.5);
    const p95 = percentile(sorted, 0.95);
    console.log(`[16 ms] ${browserName} ${kase.name}: p50 ${p50.toFixed(2)} ms, p95 ${p95.toFixed(2)} ms, max ${(sorted.at(-1) ?? 0).toFixed(2)} ms`);
    // WebKit's clock has a 1 ms step (its p50 can read 0), so it is measured and printed, not held to the budget.
    if (browserName === 'chromium') expect(p95).toBeLessThanOrEqual(BUDGET_MS);
    else expect(p95).toBeLessThan(1_000);
  });
}
