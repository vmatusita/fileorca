// The theme the person picks in the header (F11, decision 2 and criterion 4; DECISOES § 385, § 386 and § 391), in both
// browsers: the stored choice is in the first frame of every mold with the system in the opposite scheme (no flash), the
// choice follows from page to page and from language to language and stays on reload, System follows the emulated
// prefers-color-scheme and removes the key, the button says its state in each language (and the status region says it
// again), a blocked storage throws no page error, and switching sends nothing: no request, no event, no new address.
// The page kept by the service worker, offline, is in header-theme-offline.spec.ts.
import { expect, test, type Browser, type Page } from '@playwright/test';
import { LANGS, pathFor, routeById } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { dataLayer, hydrated } from './lib/page.ts';
import { MOLD_PAGES, background, painting } from './lib/header.ts';

const themeButton = (page: Page) => page.locator('.fo-header__theme');
const status = (page: Page) => page.locator('[data-theme-status]');

interface Frame {
  theme: string | null;
  meta: string | null;
  bg: string | null;
}

/**
 * A first visit with fo-theme written before the load and the system in the other scheme. The init script notes the theme
 * of <html> when the <body> is created (before any of it can paint) and the background of every animation frame until the
 * load is over: none may be in the system's colour.
 */
async function firstFrames(browser: Browser, path: string, stored: 'light' | 'dark'): Promise<{ atBody: Frame | null; frames: Frame[] }> {
  const context = await browser.newContext({ colorScheme: stored === 'light' ? 'dark' : 'light', viewport: { width: 360, height: 740 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.addInitScript((value) => {
    try {
      localStorage.setItem('fo-theme', value);
    } catch {
      /* about:blank has no storage */
    }
    const now = (): { theme: string | null; meta: string | null; bg: string | null } => ({
      theme: document.documentElement.getAttribute('data-theme'),
      meta: document.querySelector('meta[name="color-scheme"]')?.getAttribute('content') ?? null,
      bg: document.body && document.styleSheets.length ? getComputedStyle(document.body).backgroundColor : null,
    });
    const record = { atBody: null as ReturnType<typeof now> | null, frames: [] as ReturnType<typeof now>[], done: false };
    (window as unknown as { __theme: typeof record }).__theme = record;
    const observer = new MutationObserver(() => {
      if (!document.body) return;
      record.atBody = now();
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
    const frame = () => {
      record.frames.push(now());
      if (!record.done) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(() => (record.done = true))));
  }, stored);
  const page = await context.newPage();
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  // WebKit may run no frame for a while (DECISOES § 305): wait for the load and two frames, with a ceiling.
  await page.waitForFunction(() => (window as unknown as { __theme: { done: boolean } }).__theme.done, undefined, { timeout: 10_000 }).catch(() => undefined);
  const result = await page.evaluate(() => {
    const record = (window as unknown as { __theme: { atBody: Frame | null; frames: Frame[] } }).__theme;
    return { atBody: record.atBody, frames: record.frames };
  });
  await context.close();
  return result;
}

test.describe('the first frame in the stored theme, with the system in the other scheme', () => {
  for (const mold of MOLD_PAGES.filter((page) => page.lang === 'en')) {
    test(`${mold.mold} (${mold.path})`, async ({ browser }) => {
      for (const stored of ['light', 'dark'] as const) {
        const { atBody, frames } = await firstFrames(browser, mold.path, stored);
        const label = `${mold.path} stored ${stored}`;
        // The <head> script ran before the body existed: the theme and the meta were already the stored ones.
        expect(atBody, label).toEqual(expect.objectContaining({ theme: stored, meta: stored }));
        const painted = frames.filter((frame) => frame.bg !== null);
        expect(painted.length, `${label}: frames with the page`).toBeGreaterThan(0);
        // Every frame, from the first one with the stylesheet, is in the stored theme: the page never flashes.
        expect([...new Set(painted.map((frame) => frame.bg))], label).toEqual([background(stored)]);
        expect([...new Set(frames.map((frame) => frame.theme))], label).toEqual([stored]);
      }
    });
  }
});

test('the choice follows from page to page and from language to language, stays on reload, and System removes the key', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/compress-image/');
  const en = TEXTS.en.common.header.theme;
  await expect(page.getByRole('button', { name: en.system, exact: true })).toBeVisible();
  expect(await painting(page)).toEqual({ bg: background('light'), theme: null, meta: 'light dark', key: null });
  await themeButton(page).click();
  await themeButton(page).click();
  await expect(page.getByRole('button', { name: en.dark, exact: true })).toBeVisible();
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });

  // Another page, another language: the same choice, the name in that language.
  await page.goto(pathFor('pdf-tools', 'pt'));
  await expect(page.getByRole('button', { name: TEXTS.pt.common.header.theme.dark, exact: true })).toBeVisible();
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });
  await page.goto(routeById('mortgage-calculator').paths.es ?? '');
  await expect(page.getByRole('button', { name: TEXTS.es.common.header.theme.dark, exact: true })).toBeVisible();
  await page.reload();
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });

  // Back to System: the key goes, and the page follows the emulated prefers-color-scheme, both ways.
  await themeButton(page).click();
  await expect(page.getByRole('button', { name: TEXTS.es.common.header.theme.system, exact: true })).toBeVisible();
  expect(await painting(page)).toEqual({ bg: background('light'), theme: null, meta: 'light dark', key: null });
  await page.emulateMedia({ colorScheme: 'dark' });
  expect((await painting(page)).bg).toBe(background('dark'));
  await page.emulateMedia({ colorScheme: 'light' });
  expect((await painting(page)).bg).toBe(background('light'));
  await page.reload();
  expect(await painting(page)).toEqual({ bg: background('light'), theme: null, meta: 'light dark', key: null });
});

test('a page forced to light on a dark system has the colours of the light page, and the other way round', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/about/');
  expect((await painting(page)).bg).toBe(background('dark'));
  await themeButton(page).click();
  expect(await painting(page)).toEqual({ bg: background('light'), theme: 'light', meta: 'light', key: 'light' });
  const ink = () => page.evaluate(() => getComputedStyle(document.body).color);
  const lightInk = await ink();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.evaluate(() => localStorage.removeItem('fo-theme'));
  await page.reload();
  expect(await ink(), 'the text of a page forced to light is the text of the light page').toBe(lightInk);
  await themeButton(page).click();
  await themeButton(page).click();
  expect((await painting(page)).bg).toBe(background('dark'));
});

// Review F11 C-1 (DECISOES § 404): Dark stored, or a dark system, reached the print, and the browser prints no background
// by default: pale text on white paper. The dark theme is on screen only, so the print has the text of the light page.
test('the print is in the light theme, with Dark stored and with a dark system, and the screen stays dark', async ({ page }) => {
  const look = () => page.evaluate(() => ({ ink: getComputedStyle(document.body).color, bg: getComputedStyle(document.body).backgroundColor, scheme: getComputedStyle(document.documentElement).colorScheme }));
  await page.emulateMedia({ media: 'screen', colorScheme: 'light' });
  await page.goto('/mortgage-calculator/');
  const light = await look();
  expect(light.bg).toBe(background('light'));
  await themeButton(page).click();
  await themeButton(page).click();
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: 'dark', meta: 'dark', key: 'dark' });
  const dark = await look();
  expect(dark.ink, 'the screen is dark').not.toBe(light.ink);

  await page.emulateMedia({ media: 'print' });
  expect(await look(), 'Dark stored, on paper').toEqual(light);
  await page.emulateMedia({ media: 'screen' });
  expect(await look(), 'Dark stored, back on screen').toEqual(dark);

  // System on a dark system: dark on screen, light on paper.
  await page.evaluate(() => localStorage.removeItem('fo-theme'));
  await page.emulateMedia({ media: 'screen', colorScheme: 'dark' });
  await page.reload();
  expect(await painting(page)).toEqual({ bg: background('dark'), theme: null, meta: 'light dark', key: null });
  await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
  expect(await look(), 'System on a dark system, on paper').toEqual(light);
});

test('the button says its state in each language, and the status region says the new name', async ({ page }) => {
  for (const lang of LANGS) {
    await page.goto(pathFor('home', lang));
    const names = TEXTS[lang].common.header.theme;
    await expect(page.getByRole('button', { name: names.system, exact: true }), lang).toBeVisible();
    await expect(status(page)).toHaveText('');
    await expect(status(page)).toHaveAttribute('role', 'status');
    for (const name of [names.light, names.dark, names.system]) {
      await themeButton(page).click();
      await expect(page.getByRole('button', { name, exact: true }), lang).toBeVisible();
      await expect(status(page), lang).toHaveText(name);
    }
    // By keyboard: Enter and Space go on with the cycle, and the focus stays on the button. (A click does not focus a
    // button in WebKit, as in Safari on the Mac, so the focus is put there first.)
    await themeButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: names.light, exact: true })).toBeVisible();
    await expect(themeButton(page)).toBeFocused();
    await page.keyboard.press(' ');
    await expect(page.getByRole('button', { name: names.dark, exact: true })).toBeVisible();
    await expect(themeButton(page)).toBeFocused();
    await expect(status(page), lang).toHaveText(names.dark);
    await themeButton(page).click();
  }
});

test('with the storage blocked, the page opens in System with no error and the button still switches it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    // As a private window or blocked site data does: reading localStorage throws, and so does every call.
    try {
      Object.defineProperty(window, 'localStorage', { configurable: true, get: blocked });
    } catch {
      /* the property cannot be redefined here: the calls below throw instead */
    }
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) Storage.prototype[method] = blocked;
  });
  for (const path of ['/', '/about/', routeById('guides-jpg-vs-png').paths.pt ?? '']) {
    await page.goto(path);
    expect((await painting(page)).theme, path).toBeNull();
    await themeButton(page).click();
    expect((await painting(page)).theme, path).toBe('light');
    await themeButton(page).click();
    expect((await painting(page)).theme, path).toBe('dark');
    // Nothing was kept: the next page opens in System again.
  }
  await page.reload();
  expect((await painting(page)).theme).toBeNull();
  expect(errors).toEqual([]);
});

test('switching the theme sends nothing: no request, no event in the dataLayer, no new address or history entry', async ({ page }) => {
  await page.goto('/compress-image/');
  await hydrated(page);
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`));
  const before = { url: page.url(), events: (await dataLayer(page)).length, history: await page.evaluate(() => history.length), href: await page.evaluate(() => location.href) };
  for (let click = 0; click < 3; click += 1) await themeButton(page).click();
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  expect((await dataLayer(page)).length).toBe(before.events);
  expect(page.url()).toBe(before.url);
  expect(await page.evaluate(() => location.href)).toBe(before.href);
  expect(await page.evaluate(() => history.length)).toBe(before.history);
  // The only thing written is the key of the theme, and only for Light or Dark (back to System after three clicks).
  expect((await painting(page)).key).toBeNull();
});
