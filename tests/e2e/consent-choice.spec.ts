import { expect, test } from '@playwright/test';
import { dataLayer } from './lib/page.ts';

// The cookie choice after the F3 review (DECISOES § 101): Google's CMP that arrives after the load event still hides
// the notice where GDPR applies; Decline erases the coffee count at once; "Change my cookie choice" keeps the choice
// already made until a new one is made.

type Entry = unknown[];
const updates = (entries: Entry[]) => entries.filter((entry) => entry[0] === 'consent' && entry[1] === 'update').map((entry) => entry[2]);
const denied = { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

for (const delay of [300, 3000]) {
  test(`the notice goes away where GDPR applies even when the CMP arrives ${delay} ms after the load event`, async ({ page }) => {
    await page.addInitScript((ms) => {
      addEventListener('load', () => {
        setTimeout(() => {
          (window as unknown as { __tcfapi: unknown }).__tcfapi = (command: string, _version: number, callback: (data: unknown, ok: boolean) => void) => {
            if (command === 'addEventListener') callback({ gdprApplies: true, eventStatus: 'tcloaded', cmpStatus: 'loaded' }, true);
          };
        }, ms);
      });
    }, delay);
    await page.goto('/compress-image/');
    await expect(page.locator('#fo-cookie')).toBeVisible();
    await expect(page.locator('#fo-cookie')).toBeHidden({ timeout: delay + 3000 });
  });
}

// The CMP that is there by the load event (the common case) hides the notice at the load event, not half a second
// later (second pass p2-consentimento-01, DECISOES § 104).
test('the notice goes away at the load event when the CMP arrived before it', async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { __tcfapi: unknown }).__tcfapi = (command: string, _version: number, callback: (data: unknown, ok: boolean) => void) => {
        if (command === 'addEventListener') callback({ gdprApplies: true, eventStatus: 'tcloaded', cmpStatus: 'loaded' }, true);
      };
    });
  });
  await page.goto('/compress-image/', { waitUntil: 'load' });
  await expect(page.locator('#fo-cookie')).toBeHidden({ timeout: 100 });
});

test('Decline erases the coffee count at once, and keeps only "don\'t show again"', async ({ page }) => {
  await page.goto('/');
  await page.locator('#fo-cookie').getByRole('button', { name: 'Accept' }).click();
  // What countUse writes after a use with the Accept (src/tools/image/coffee.ts).
  await page.evaluate(() => localStorage.setItem('fo-coffee', JSON.stringify({ uses: 2, last: 1 })));
  await page.goto('/privacy/');
  await page.getByRole('button', { name: 'Change my cookie choice' }).click();
  await page.locator('#fo-cookie').getByRole('button', { name: 'Decline' }).click();
  expect(await page.evaluate(() => localStorage.getItem('fo-coffee'))).toBeNull();

  await page.getByRole('button', { name: 'Change my cookie choice' }).click();
  await page.locator('#fo-cookie').getByRole('button', { name: 'Accept' }).click();
  await page.evaluate(() => localStorage.setItem('fo-coffee', JSON.stringify({ uses: 1, never: true })));
  await page.getByRole('button', { name: 'Change my cookie choice' }).click();
  await page.locator('#fo-cookie').getByRole('button', { name: 'Decline' }).click();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('fo-coffee'))) ?? 'null')).toEqual({ uses: 0, never: true });
});

test('after a choice in the notice opened again, the keyboard focus goes back to "Change my cookie choice"', async ({ page }) => {
  await page.goto('/privacy/');
  await page.locator('#fo-cookie').getByRole('button', { name: 'Accept' }).click();
  const change = page.getByRole('button', { name: 'Change my cookie choice' });
  await change.focus();
  await page.keyboard.press('Enter');
  const decline = page.locator('#fo-cookie').getByRole('button', { name: 'Decline' });
  await expect(decline).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#fo-cookie')).toBeHidden();
  await expect(change).toBeFocused();
});

test('"Change my cookie choice" keeps the Decline until a new choice is made', async ({ page }) => {
  await page.goto('/');
  await page.locator('#fo-cookie').getByRole('button', { name: 'Decline' }).click();
  await page.goto('/privacy/');
  await page.getByRole('button', { name: 'Change my cookie choice' }).click();
  await expect(page.locator('#fo-cookie')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('fo-consent'))).toBe('denied');
  // The person leaves without choosing: the next page still has the Decline, replayed before the config.
  await page.goto('/compress-image/');
  await expect(page.locator('#fo-cookie')).toBeHidden();
  expect(updates(await dataLayer(page))).toEqual([denied]);
});
