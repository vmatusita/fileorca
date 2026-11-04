import { expect, test, type Page } from '@playwright/test';
import { dismissCookies, hydrated, nextUse, settle, useImage } from './lib/page.ts';
import { PRODUCTION_ORIGIN, serveAsProduction } from './lib/production.ts';
import { useTestBuild } from './lib/test-build.ts';

// F12 (Mudança 11, decision 7; DECISOES § 435, which closes the F3 c-08): with the ads on, someone who blocks them no
// longer gets the coffee line on the 1st use. Before, the panel read the AdSense loader (window.adsbygoogle.loaded) on
// fileorca.com with the ads on at build, and a loader that never ran made the 1st use show the line, also for a loader
// that only failed (the false positive of the c-08). Now the rule is the 3rd use for everyone, and someone who blocks ads
// gets the ad-block wall instead (UX-06), never the coffee as a way out of it.
// It runs on the test build seen as fileorca.com (DECISOES § 414): the only build with the ads on, on the only host where
// the site asks for them. The loader is aborted, as an ad blocker does, and the recovery tag too; the bait stays visible,
// so the wall (which needs both signals) stays closed. The file is named ads-* to fall next to ads.spec.ts, in the parts of
// the CI that already make the test build.

useTestBuild(test);

const TOOL = `${PRODUCTION_ORIGIN}/compress-image/`;
const LINE = '.fo-result .fo-result__support';

async function coffee(page: Page): Promise<unknown> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('fo-coffee');
    return raw === null ? null : JSON.parse(raw);
  });
}

test('the ads on and blocked: no coffee line on the 1st or the 2nd use, and the line on the 3rd, as for everyone', async ({ page, context }) => {
  await serveAsProduction(context, { loader: 'error', recovery: 'error' });
  expect((await page.goto(TOOL))?.status()).toBe(200);
  await hydrated(page);
  // The ads are on in this build, and the loader did not run: the case the old rule read as "blocks ads".
  expect(await page.evaluate(() => location.hostname)).toBe('fileorca.com');
  await expect(page.locator('script[src*="/adsbygoogle.js"]')).toBeAttached();
  expect(await page.evaluate(() => (window as { adsbygoogle?: { loaded?: boolean } }).adsbygoogle?.loaded === true)).toBe(false);
  await expect(page.locator('#fo-wall[open]')).toHaveCount(0);
  await dismissCookies(page, 'granted');

  await useImage(page);
  await settle(page);
  await expect(page.locator(LINE)).toHaveCount(0);
  expect(await coffee(page)).toEqual({ uses: 1 });

  await nextUse(page);
  await settle(page);
  await expect(page.locator(LINE)).toHaveCount(0);
  expect(await coffee(page)).toEqual({ uses: 2 });

  await nextUse(page);
  await expect(page.locator(LINE)).toBeVisible();
  expect(await coffee(page)).toMatchObject({ uses: 3 });
});
