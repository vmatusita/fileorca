import { readFileSync } from 'node:fs';
import { expect, test, type Request } from '@playwright/test';
import ptSupport from '../../src/i18n/pt/support.ts';
import { dismissCookies } from './lib/page.ts';

// The Pix of /pt/apoie/ (prompt F6, decision 8), in both browsers: each amount shows its QR and its code, the Copy code
// button puts that exact code on the clipboard and says so, and nothing leaves the page for it. The codes come from the
// oracle (fixtures/pix.json); the QR is read back in tests/unit/pix-qr.test.ts. The file is named money-* to fall after
// design.spec.ts in the WebKit split (DECISOES § 142).

interface PixFixture {
  codes: { amount: string | null; code: string }[];
}
const fixture = JSON.parse(readFileSync('fixtures/pix.json', 'utf8')) as PixFixture;
const pix = ptSupport.pix!;
const labelOf = (amount: string | null): string => (amount === null ? pix.any : pix.amount.replace('{amount}', String(Number(amount))));

test('each amount shows its QR and its code, and Copy code copies exactly that code, with nothing sent', async ({ page }) => {
  // The clipboard is stubbed before the page loads: both engines run the page's own call, and the test reads what it got.
  await page.addInitScript(() => {
    const copied: string[] = [];
    (window as unknown as { __copied: string[] }).__copied = copied;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (text: string) => (copied.push(text), Promise.resolve()) },
    });
  });
  const response = await page.goto('/pt/apoie/');
  expect(response?.status()).toBe(200);
  await page.waitForLoadState('load');
  await dismissCookies(page);
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));

  const blocks = page.locator('.fo-pix');
  await expect(blocks).toHaveCount(fixture.codes.length);
  await expect(page.locator('#pix')).toBeVisible();
  for (const [index, { amount, code }] of fixture.codes.entries()) {
    await page.locator('.fo-pix-card .fo-seg__opt', { hasText: labelOf(amount) }).click();
    const shown = page.locator('.fo-pix:visible');
    await expect(shown, `one block for ${labelOf(amount)}`).toHaveCount(1);
    await expect(shown.locator('code')).toHaveText(code);
    await expect(shown.locator('svg.fo-pix__qr')).toBeVisible();
    await expect(shown.locator('svg.fo-pix__qr')).toHaveAttribute('aria-label', /^QR code do Pix, /);
    await expect(shown.getByText(pix.receiver.replace('{name}', 'Victor Yuki Matusita'))).toBeVisible();
    await shown.getByRole('button', { name: pix.copy }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied.length)).toBe(index + 1);
    expect(await page.evaluate((i) => (window as unknown as { __copied: string[] }).__copied[i], index)).toBe(code);
    await expect(page.locator('.fo-pix__status')).toHaveText(pix.copied);
  }
  // The amounts, the QR and the copy are the page itself: no request of any kind went out for them.
  expect(requests.map((request) => `${request.method()} ${request.url()}`)).toEqual([]);
});

test('the amounts are a radio group with a name, and the code has a name for screen readers', async ({ page }) => {
  await page.goto('/pt/apoie/');
  await page.waitForLoadState('load');
  await expect(page.getByRole('radiogroup', { name: pix.legend })).toBeVisible();
  await expect(page.getByRole('radio', { name: pix.any })).toBeChecked();
  await page.keyboard.press('Tab');
  await page.getByRole('radio', { name: pix.any }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: labelOf('5.00') })).toBeChecked();
  await expect(page.locator('.fo-pix:visible code')).toHaveText(fixture.codes[1]!.code);
  await expect(page.locator('.fo-pix:visible .fo-sr')).toHaveText(`${pix.codeLabel}: `);
});

// Review F6 (c-1, f-1 and f-6; DECISOES § 245): the four amounts stay inside the rail of the OptionGroup, and the copy
// button inside its column and the card, at the phone widths.
test('the amounts stay in their rail and the copy button in its column, from 320 to 390px', async ({ page }) => {
  for (const width of [320, 360, 375, 390]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('/pt/apoie/');
    await page.waitForLoadState('load');
    const boxes = await page.evaluate(() => {
      const right = (el: Element | null) => (el ? el.getBoundingClientRect().right : NaN);
      const options = [...document.querySelectorAll('.fo-pix-card .fo-seg__opt')];
      const side = document.querySelector('.fo-pix:not([hidden]) .fo-pix__side');
      const shown = [...document.querySelectorAll<HTMLElement>('.fo-pix')].find((block) => block.offsetParent !== null);
      return {
        rail: right(document.querySelector('.fo-pix-card .fo-seg')),
        last: Math.max(...options.map(right)),
        column: right(shown?.querySelector('.fo-pix__side') ?? side),
        button: right(shown?.querySelector('[data-pix-copy]') ?? null),
        card: right(document.querySelector('.fo-support')),
        page: document.documentElement.scrollWidth,
      };
    });
    expect(boxes.last, `${width}px: o último valor dentro do trilho`).toBeLessThanOrEqual(boxes.rail + 0.5);
    expect(boxes.button, `${width}px: o botão dentro da coluna`).toBeLessThanOrEqual(boxes.column + 0.5);
    expect(boxes.column, `${width}px: a coluna dentro do card`).toBeLessThanOrEqual(boxes.card + 0.5);
    expect(boxes.page, `${width}px: a página não rola de lado`).toBeLessThanOrEqual(width);
  }
});

// Review F6 (d-2, c-2 and d-3; DECISOES § 245): another amount clears the "copied" of the last code, and a copy the browser
// refuses, or a browser with no clipboard, says how to copy by hand instead of saying nothing.
test('another amount clears the status, and a refused copy says how to copy by hand', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.resolve() } });
  });
  await page.goto('/pt/apoie/');
  await page.waitForLoadState('load');
  await dismissCookies(page);
  const status = page.locator('.fo-pix__status');
  await page.locator('.fo-pix:visible').getByRole('button', { name: pix.copy }).click();
  await expect(status).toHaveText(pix.copied);
  await page.locator('.fo-pix-card .fo-seg__opt', { hasText: labelOf('10.00') }).click();
  await expect(status).toHaveText('');

  for (const clipboard of ['refuses', 'missing'] as const) {
    const other = await page.context().newPage();
    await other.addInitScript((kind) => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: kind === 'missing' ? undefined : { writeText: () => Promise.reject(new Error('denied')) } });
    }, clipboard);
    const errors: string[] = [];
    other.on('pageerror', (error) => errors.push(error.message));
    await other.goto('/pt/apoie/');
    await other.waitForLoadState('load');
    await dismissCookies(other);
    await other.locator('.fo-pix:visible').getByRole('button', { name: pix.copy }).click();
    await expect(other.locator('.fo-pix__status'), clipboard).toHaveText(pix.copyFailed);
    expect(errors, clipboard).toEqual([]);
    await other.close();
  }
});
