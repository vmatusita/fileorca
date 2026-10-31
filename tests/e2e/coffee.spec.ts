import { expect, test, type Page } from '@playwright/test';
import enSupport from '../../src/i18n/en/support.ts';
import esSupport from '../../src/i18n/es/support.ts';
import ptSupport from '../../src/i18n/pt/support.ts';
import { dataLayer, dismissCookies, hydrated, nextUse, reachCoffeeLine, settle, useImage } from './lib/page.ts';

// F1b criterion 12: the coffee line of the ResultCard and the support page.
// Rule (PLANO "Doações", F1b decision 10): a "use" is a file that reached the result card. With the
// cookie choice "granted" each use is counted in localStorage 'fo-coffee' = {uses, shownAt?, never?}.
// The line shows from the 3rd use and then at most once every 7 days; showing sets shownAt. Without
// the choice, or after Decline, nothing is written and the line never shows. "Don't show this again"
// writes never:true always.

const DAY = 24 * 60 * 60 * 1000;
const KOFI = 'https://ko-fi.com/victormatusita';
const LINE = '.fo-result .fo-result__support';

const LANGS = [
  { lang: 'en', tool: '/compress-image/', link: 'Support with a coffee', hide: "Don't show this again", href: KOFI },
  { lang: 'pt', tool: '/pt/comprimir-imagem/', link: 'Apoiar com um café', hide: 'Não mostrar de novo', href: '/pt/apoie/' },
  { lang: 'es', tool: '/es/comprimir-imagen/', link: 'Invítame un café', hide: 'No mostrar de nuevo', href: KOFI },
] as const;

interface CoffeeState {
  uses: number;
  shownAt?: number;
  never?: true;
}

async function coffee(page: Page): Promise<CoffeeState | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('fo-coffee');
    return raw === null ? null : (JSON.parse(raw) as CoffeeState);
  });
}

/**
 * Opens a tool page. With `clock`, Playwright's clock is installed before the page loads: it keeps
 * running in real time (timers, animation frames and the engine work as usual), and skipDays moves
 * only the wall time, as a person changing the date would.
 */
async function open(page: Page, path: string, clock = false): Promise<void> {
  if (clock) await page.clock.install();
  await page.goto(path);
  await hydrated(page);
}

/** setSystemTime shifts Date without firing timers and without pausing the clock (unlike pauseAt). */
async function skipDays(page: Page, days: number): Promise<void> {
  const now = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(now + days * DAY);
}

async function lastEvent(page: Page, name: string) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === name).at(-1);
}

/** Cancels link navigation (document-level listener, as events.spec does) and can undo it. */
async function blockLinks(page: Page, on: boolean): Promise<void> {
  await page.evaluate((block) => {
    const holder = window as unknown as { __stop?: (event: Event) => void };
    if (block) {
      holder.__stop = (event) => event.preventDefault();
      document.addEventListener('click', holder.__stop);
    } else if (holder.__stop) {
      document.removeEventListener('click', holder.__stop);
    }
  }, on);
}

test.describe('coffee line rules (English)', () => {
  test('not on the 1st or 2nd use, on the 3rd, not again the same day, and again after 7 days', async ({ page }) => {
    const start = Date.now();
    await open(page, '/compress-image/', true);
    await dismissCookies(page, 'granted');
    const line = page.locator(LINE);

    await useImage(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 1 });

    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 2 });

    await nextUse(page);
    await expect(line).toBeVisible();
    const third = await coffee(page);
    expect(third).toMatchObject({ uses: 3 });
    expect(third?.never).toBeUndefined();
    const shownAt = third?.shownAt ?? 0;
    expect(shownAt).toBeGreaterThanOrEqual(start);
    expect(shownAt).toBeLessThanOrEqual(Date.now() + 1000);
    // Download is still there, before the line.
    await expect(page.locator('.fo-btn--download')).toBeVisible();

    // 4th use, same day: hidden, and shownAt does not move.
    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 4, shownAt });

    // 6 days later is still inside the 7 days.
    await skipDays(page, 6);
    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 5, shownAt });

    // A day and an hour more makes it 7 days since the line showed: it shows again and shownAt moves.
    await skipDays(page, 1 + 1 / 24);
    await nextUse(page);
    await expect(line).toBeVisible();
    const again = await coffee(page);
    expect(again?.uses).toBe(6);
    expect(again?.shownAt ?? 0).toBeGreaterThanOrEqual(shownAt + 7 * DAY);
  });

  test('"Don\'t show this again" hides the line at once, is stored and holds after 7 days and a reload', async ({ page }) => {
    await open(page, '/compress-image/', true);
    await reachCoffeeLine(page);
    const line = page.locator(LINE);
    await line.getByRole('button', { name: "Don't show this again" }).click();
    await expect(line).toBeHidden();
    await expect(page.locator('.fo-btn--download')).toBeVisible();
    expect(await coffee(page)).toMatchObject({ uses: 3, never: true });

    await skipDays(page, 8);
    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);

    await page.reload();
    await hydrated(page);
    await useImage(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toMatchObject({ never: true });
  });

  test('"Don\'t show this again" is stored even if the cookie choice was withdrawn meanwhile', async ({ page }) => {
    await open(page, '/compress-image/');
    await reachCoffeeLine(page);
    await page.evaluate(() => localStorage.setItem('fo-consent', 'denied'));
    await page.locator(LINE).getByRole('button', { name: "Don't show this again" }).click();
    await expect(page.locator(LINE)).toBeHidden();
    expect(await coffee(page)).toMatchObject({ never: true });
  });

  test('Decline after the line showed erases the count and stops the line, even 8 days later', async ({ page }) => {
    await open(page, '/compress-image/', true);
    await reachCoffeeLine(page);
    expect(await coffee(page)).toMatchObject({ uses: 3 });

    await page.goto('/privacy/');
    await page.getByRole('button', { name: 'Change my cookie choice' }).click();
    await page.locator('#fo-cookie').getByRole('button', { name: 'Decline' }).click();

    // Consent withdrawn: the tool page erases the count as soon as it loads (DECISOES § 49).
    await open(page, '/compress-image/');
    expect(await coffee(page)).toBeNull();
    await skipDays(page, 8);
    await useImage(page);
    await settle(page);
    await expect(page.locator(LINE)).toHaveCount(0);
    expect(await coffee(page)).toBeNull();
  });
});

for (const choice of ['no choice', 'Decline'] as const) {
  test(`${choice}: four uses never show the line and nothing is stored`, async ({ page }) => {
    await open(page, '/compress-image/');
    if (choice === 'Decline') await dismissCookies(page, 'denied');
    await useImage(page);
    for (let use = 2; use <= 4; use += 1) {
      await settle(page);
      await expect(page.locator(LINE)).toHaveCount(0);
      await nextUse(page);
    }
    await settle(page);
    await expect(page.locator(LINE)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('fo-coffee'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('fo-consent'))).toBe(choice === 'Decline' ? 'denied' : null);
  });
}

test('uses before the Accept are not counted: the count starts when the choice is granted', async ({ page }) => {
  await open(page, '/compress-image/');
  await useImage(page);
  await nextUse(page);
  await settle(page);
  expect(await page.evaluate(() => localStorage.getItem('fo-coffee'))).toBeNull();
  await dismissCookies(page, 'granted');
  await nextUse(page);
  await settle(page);
  await expect(page.locator(LINE)).toHaveCount(0);
  expect(await coffee(page)).toEqual({ uses: 1 });
  await nextUse(page);
  await settle(page);
  await expect(page.locator(LINE)).toHaveCount(0);
  expect(await coffee(page)).toEqual({ uses: 2 });
  await nextUse(page);
  await expect(page.locator(LINE)).toBeVisible();
});

for (const { lang, tool, link, hide, href } of LANGS) {
  test(`${lang}: texts, placement, link target and donate_click with place result`, async ({ page }) => {
    await open(page, tool);
    await reachCoffeeLine(page);
    const line = page.locator(LINE);
    const anchor = line.getByRole('link', { name: link });
    await expect(anchor).toHaveAttribute('href', href);
    await expect(line.getByRole('button', { name: hide })).toBeVisible();

    // One short paragraph that does not repeat the Oli's "Done!" (one exclamation per screen).
    const text = (await line.locator('p').first().textContent())?.trim() ?? '';
    expect(text.length, 'coffee line text').toBeGreaterThan(20);
    expect(text).not.toMatch(/[!¡]/);

    // Below the actions (so after Download), never in place of it, and a secondary button (not the sun one).
    expect(
      await line.evaluate((node) => {
        const actions = document.querySelector('.fo-result__actions');
        return !!actions && !!(actions.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
      }),
    ).toBe(true);
    await expect(page.locator('.fo-btn--download')).toBeVisible();
    await expect(anchor).toHaveClass(/(^|\s)fo-btn(\s|$)/);
    await expect(anchor).not.toHaveClass(/fo-btn--(download|brand)/);

    await blockLinks(page, true);
    await anchor.click();
    expect(await lastEvent(page, 'donate_click')).toEqual(['event', 'donate_click', { lang, place: 'result' }]);
    if (lang === 'pt') {
      // Until the Pix comes (F6) the Portuguese button goes to the support page.
      await blockLinks(page, false);
      await anchor.click();
      await expect(page).toHaveURL(/\/pt\/apoie\/$/);
    }
  });
}

const SUPPORT = [
  { path: '/support/', texts: enSupport },
  { path: '/pt/apoie/', texts: ptSupport },
  { path: '/es/apoyo/', texts: esSupport },
];

for (const { path, texts } of SUPPORT) {
  test(`support page ${path}: card title as H1, the coffee Oli, the Ko-fi link and no other origin`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
    const foreign: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol !== 'data:' && url.protocol !== 'blob:' && url.origin !== origin) foreign.push(request.url());
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('.fo-support h1')).toHaveText(texts.h1);
    const oli = page.locator('.fo-support [data-oli="coffee"]');
    await expect(oli).toBeVisible();
    await expect(oli).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator(`.fo-support a[href="${KOFI}"]`).first()).toBeVisible();
    expect(foreign).toEqual([]);
  });
}
