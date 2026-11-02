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
