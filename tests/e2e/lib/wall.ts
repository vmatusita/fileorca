// F12 · a parede do bloqueador (decision 11; § F12-P9): what the specs of the wall share (fo-wall.spec.ts and the
// adblock_wall test of events.spec.ts). The pages are the test build seen as fileorca.com (production.ts).
import { expect, type BrowserContext, type Page } from '@playwright/test';
import { PRODUCTION_ORIGIN, serveAsProduction, type ProductionOptions } from './production.ts';

/** A tool page with ads, on fileorca.com. */
export const WALL_TOOL = `${PRODUCTION_ORIGIN}/compress-image/`;
/** The numbers of googlefc.AdBlockerStatusEnum (developers.google.com/funding-choices/fc-api-docs; § 416). */
export const STATUS = { UNKNOWN: 0, EXTENSION: 1, NETWORK: 2, NONE: 3 } as const;

/**
 * The stub of Google's recovery tag: googlefc with the documented enum and getAdBlockerStatus, running the queue the page
 * fills, now and from then on, like the real script. `delay` holds the answer back (a slow Google); `exampleNames` swaps
 * the enum for the one of Google's own example (EXTENSION_LEVEL_AD_BLOCKER).
 */
export function googlefcStub(status: number, options: { delay?: number; exampleNames?: boolean } = {}): string {
  const names = options.exampleNames
    ? '{UNKNOWN:0,EXTENSION_LEVEL_AD_BLOCKER:1,NETWORK_LEVEL_AD_BLOCKER:2,NO_AD_BLOCKER:3}'
    : '{UNKNOWN:0,EXTENSION_AD_BLOCKER:1,NETWORK_LEVEL_AD_BLOCKER:2,NO_AD_BLOCKER:3}';
  return [
    '(function(){var g=window.googlefc=window.googlefc||{};',
    `g.AdBlockerStatusEnum=${names};g.getAdBlockerStatus=function(){return ${status};};`,
    "function run(e){if(e&&typeof e.AD_BLOCK_DATA_READY==='function')e.AD_BLOCK_DATA_READY();}",
    'function go(){var q=g.callbackQueue||[];for(var i=0;i<q.length;i++)run(q[i]);g.callbackQueue={push:run};}',
    options.delay ? `setTimeout(go,${options.delay});` : 'go();',
    '})();',
  ].join('');
}

/** Answers fileorca.com from the test build and Google from stubs, then opens the page (status 200). */
export async function openAsProduction(page: Page, context: BrowserContext, options: ProductionOptions, url = WALL_TOOL): Promise<void> {
  await serveAsProduction(context, options);
  const response = await page.goto(url);
  expect(response?.status(), url).toBe(200);
}

/** Waits until the wall is open in this mode: the closedby of the mode, the class and the close button of the notice. */
export async function expectWallOpen(page: Page, mode: 'aviso' | 'bloqueio', timeout = 8_000): Promise<void> {
  const wall = page.locator('#fo-wall');
  await expect(wall).toHaveAttribute('open', '', { timeout });
  await expect(wall).toHaveAttribute('closedby', mode === 'aviso' ? 'closerequest' : 'none');
  if (mode === 'aviso') await expect(wall).toHaveClass(/fo-wall--aviso/);
  else await expect(wall).not.toHaveClass(/fo-wall--aviso/);
  await expect(page.locator('[data-wall="close"]')).toBeVisible({ visible: mode === 'aviso' });
}

/** The adblock_wall events in the dataLayer: the parameters of each, as sent. */
export async function wallEvents(page: Page): Promise<Record<string, unknown>[]> {
  return page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((entry) => entry[0] === 'event' && entry[1] === 'adblock_wall')
      .map((entry) => entry[2] as Record<string, unknown>),
  );
}
