// The theme offline (F11, decision 2: "the service worker does not change"; DECISOES § 385 and § 391). The worker keeps
// whole pages, with the <head> script, so a page kept with the network and the offline page of an address never visited
// both open in the theme the person chose, and the button still switches it with no network. A worker spec: the worker
// allowed, a test server of its own (tests/e2e/lib/sw-server.ts), and the network gone for real; with the kill switch on
// (SW_ENABLED = false) the test proves the worker is gone and ends (workerOff, § 307).
import { expect, test } from '@playwright/test';
import offlinePt from '../../src/i18n/pt/offline.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { startSwServer, type SwServer } from './lib/sw-server.ts';
import { controlled, kept, offline, reloadOffline, visit, workerOff } from './lib/sw.ts';
import { background, painting } from './lib/header.ts';

test.use({ serviceWorkers: 'allow', colorScheme: 'light' });

let server: SwServer;
test.beforeEach(async () => {
  server = await startSwServer();
});
test.afterEach(async () => {
  await server.close();
});

test('a kept page and the offline page open in the chosen theme with no network, and the button still switches it', async ({ page, context }) => {
  await visit(page, server, '/about/', { island: false });
  if (await workerOff(page, server)) return;
  await controlled(page);
  // Dark, on a light system: the choice is the fo-theme key of this origin.
  const button = page.locator('.fo-header__theme');
  await button.click();
  await button.click();
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });
  await visit(page, server, '/pt/', { island: false });
  await kept(page, '/about/');
  await kept(page, '/pt/');
  await kept(page, '/pt/offline/');

  await offline(context, server);
  // The kept page, from the worker, in the dark theme already at load.
  await page.goto(`${server.origin}/about/`);
  await reloadOffline(page, { island: false });
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });
  await expect(page.getByRole('button', { name: TEXTS.en.common.header.theme.dark, exact: true })).toBeVisible();
  // A page never visited gets the offline page of its language, in the same theme.
  const response = await page.goto(`${server.origin}/pt/girar-pdf/`);
  expect(response?.fromServiceWorker()).toBe(true);
  await expect(page.locator('h1')).toHaveText(offlinePt.h1);
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });
  // The button works offline: back to System removes the key, and the next kept page opens in the light system theme.
  await page.locator('.fo-header__theme').click();
  expect(await painting(page)).toEqual({ bg: background('light'), theme: null, meta: 'light dark', key: null });
  await page.goto(`${server.origin}/pt/`);
  expect(await painting(page)).toEqual({ bg: background('light'), theme: null, meta: 'light dark', key: null });
});
