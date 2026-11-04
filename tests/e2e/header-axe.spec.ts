// axe on the new header (F11, decision 10 and criterion 5; DECISOES § 391), in both browsers: on one page per mold in
// English and on a tool and a home in Portuguese and Spanish, with the Menu open, and with the theme button in each of its
// three states. System (no data-theme) runs at 360 and 1280 px in both schemes of the system; Light and Dark run with the
// system in the other scheme, the way a person who chose them sees the page. The guides hub also goes through a11y.spec.ts,
// which reads the route map. Rules, tags and the legacy mode are the ones of every spec (tests/e2e/lib/axe.ts).
import { expect, test, type Page } from '@playwright/test';
import { pathFor, routeById } from '../../src/i18n/routes.ts';
import { describedViolations, violationsEverywhere } from './lib/axe.ts';
import { MOLD_PAGES } from './lib/header.ts';

test.use({ reducedMotion: 'reduce', viewport: { width: 360, height: 740 } });

const PAGES = [
  ...MOLD_PAGES.filter((page) => page.lang === 'en').map((page) => page.path),
  routeById('compress-image').paths.pt ?? '',
  pathFor('home', 'pt'),
  routeById('merge-pdf').paths.es ?? '',
  pathFor('home', 'es'),
];

/** The theme button until the page is in `state` ('' is System): the cycle is System, Light, Dark. */
async function themeTo(page: Page, state: '' | 'light' | 'dark'): Promise<void> {
  for (let click = 0; click < 3; click += 1) {
    if ((await page.evaluate(() => document.documentElement.getAttribute('data-theme') ?? '')) === state) return;
    await page.locator('.fo-header__theme').click();
  }
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme') ?? '')).toBe(state);
}

async function openMenu(page: Page): Promise<void> {
  if (!(await page.evaluate(() => document.querySelector('#fo-menu')?.matches(':popover-open') ?? false))) await page.locator('.fo-header__menu').click();
  await expect(page.locator('#fo-menu')).toBeVisible();
}

for (const path of PAGES) {
  test(`axe on the header of ${path}: the Menu open, the theme button in its three states, both themes`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    const found: string[] = [];
    // System: the Menu open at 360 and 1280 px, in the dark and the light scheme of the system.
    await openMenu(page);
    found.push(...(await violationsEverywhere(page)).map((line) => `System, Menu open · ${line}`));
    // Light and Dark, each with the system in the other scheme; the Menu open again (a click on the button closes it).
    for (const [state, system] of [['light', 'dark'], ['dark', 'light']] as const) {
      await page.emulateMedia({ colorScheme: system, reducedMotion: 'reduce' });
      await themeTo(page, state);
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: width === 360 ? 740 : 800 });
        found.push(...(await describedViolations(page, `${state} on a ${system} system, ${width}px, Menu closed`)));
        await openMenu(page);
        found.push(...(await describedViolations(page, `${state} on a ${system} system, ${width}px, Menu open`)));
        await page.keyboard.press('Escape');
      }
    }
    // Back to System: the button in its first state again, with no data-theme.
    await themeTo(page, '');
    expect(found).toEqual([]);
  });
}
