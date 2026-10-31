import { expect, test } from '@playwright/test';
import { dataLayer } from './lib/page.ts';

const REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
  'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
];
const KEYS = ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'];

type Entry = unknown[];
const isConsent = (entry: Entry, kind: string) => entry[0] === 'consent' && entry[1] === kind;

test.describe('Consent Mode v2 e aviso de cookies', () => {
  test('consent defaults come before config, denied by region and granted elsewhere', async ({ page }) => {
    await page.goto('/compress-image/');
    const entries = await dataLayer(page);
    const defaults = entries.filter((entry) => isConsent(entry, 'default'));
    const config = entries.findIndex((entry) => entry[0] === 'config');
    expect(config).toBeGreaterThan(-1);
    for (const entry of defaults) expect(entries.indexOf(entry)).toBeLessThan(config);
    const regional = defaults.find((entry) => (entry[2] as { region?: string[] }).region);
    const global = defaults.find((entry) => !(entry[2] as { region?: string[] }).region);
    expect((regional?.[2] as { region: string[] }).region.sort()).toEqual([...REGIONS].sort());
    for (const key of KEYS) {
      expect((regional?.[2] as Record<string, string>)[key]).toBe('denied');
      expect((global?.[2] as Record<string, string>)[key]).toBe('granted');
    }
    expect(entries[config]?.[1]).toBe('G-T4BBJN7S11');
    expect(entries[config]?.[2]).toEqual({ page_location: `${new URL(page.url()).origin}/compress-image/` });
  });

  test('page_location never carries the query string or the hash', async ({ page }) => {
    await page.goto('/compress-image/?q=123#principal=300000');
    const config = (await dataLayer(page)).find((entry) => entry[0] === 'config');
    expect(config?.[2]).toEqual({ page_location: `${new URL(page.url()).origin}/compress-image/` });
  });

  for (const [button, value] of [['Accept', 'granted'], ['Decline', 'denied']] as const) {
    test(`${button} updates consent and the notice never comes back`, async ({ page }) => {
      await page.goto('/');
      const notice = page.locator('#fo-cookie');
      await expect(notice).toBeVisible();
      await notice.getByRole('button', { name: button }).click();
      await expect(notice).toBeHidden();
      const update = (await dataLayer(page)).find((entry) => isConsent(entry, 'update'));
      expect(update?.[2]).toEqual(Object.fromEntries(KEYS.map((key) => [key, value])));
      for (const path of ['/', '/pt/privacidade/', '/es/comprimir-imagen/']) {
        await page.goto(path);
        await expect(page.locator('#fo-cookie')).toBeHidden();
        const entries = await dataLayer(page);
        const replay = entries.findIndex((entry) => isConsent(entry, 'update'));
        expect(replay).toBeGreaterThan(-1);
        expect(replay).toBeLessThan(entries.findIndex((entry) => entry[0] === 'config'));
        expect(entries[replay]?.[2]).toEqual(Object.fromEntries(KEYS.map((key) => [key, value])));
      }
    });
  }

  test('the notice stays hidden where __tcfapi says GDPR applies', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __tcfapi: unknown }).__tcfapi = (command: string, _version: number, callback: (data: unknown, ok: boolean) => void) => {
        if (command === 'addEventListener') callback({ gdprApplies: true, eventStatus: 'tcloaded', cmpStatus: 'loaded' }, true);
      };
    });
    await page.goto('/compress-image/');
    await page.waitForLoadState('load');
    await expect(page.locator('#fo-cookie')).toBeHidden();
  });

  test('the notice shows where __tcfapi says GDPR does not apply', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __tcfapi: unknown }).__tcfapi = (command: string, _version: number, callback: (data: unknown, ok: boolean) => void) => {
        if (command === 'addEventListener') callback({ gdprApplies: false, eventStatus: 'tcloaded' }, true);
      };
    });
    await page.goto('/');
    await expect(page.locator('#fo-cookie')).toBeVisible();
  });

  test('the privacy page button reopens the choice', async ({ page }) => {
    await page.goto('/privacy/');
    await page.locator('#fo-cookie').getByRole('button', { name: 'Accept' }).click();
    await page.getByRole('button', { name: 'Change my cookie choice' }).click();
    await expect(page.locator('#fo-cookie')).toBeVisible();
    await page.locator('#fo-cookie').getByRole('button', { name: 'Decline' }).click();
    const updates = (await dataLayer(page)).filter((entry) => isConsent(entry, 'update'));
    expect((updates.at(-1)?.[2] as Record<string, string>)['analytics_storage']).toBe('denied');
  });

  test('no gtag.js and no request to Google outside fileorca.com', async ({ page }) => {
    const google: string[] = [];
    page.on('request', (request) => {
      if (/google|doubleclick|gstatic/.test(new URL(request.url()).hostname)) google.push(request.url());
    });
    for (const path of ['/', '/compress-image/', '/pt/comprimir-imagem/', '/es/privacidad/']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    expect(google).toEqual([]);
    expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
  });
});
