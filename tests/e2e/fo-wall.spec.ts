import { expect, test, type Page } from '@playwright/test';
import { describedViolations } from './lib/axe.ts';
import { PRODUCTION_ORIGIN, serveAsProduction } from './lib/production.ts';
import { TEST_BUILD_ORIGIN, useTestBuild } from './lib/test-build.ts';
import { STATUS, WALL_TOOL, expectWallOpen, googlefcStub, openAsProduction, wallEvents } from './lib/wall.ts';
import enWall from '../../src/i18n/en/wall.ts';
import ptWall from '../../src/i18n/pt/wall.ts';

// F12 · a parede do bloqueador (decision 5 and 11; § F12-P2 and § F12-P9). The wall in the test build (the fake unit ids and
// PUBLIC_ADBLOCK_WALL=bloqueio), seen as fileorca.com (tests/e2e/lib/production.ts): every request to fileorca.com is
// answered by the test server, the AdSense loader fails (what a blocker does) or gets an empty stub, and the ad blocking
// recovery tag gets a stub that defines googlefc with the status of each case, or fails. No test reaches Google.
// The cases: Google's signal (extension, network, none, unknown, late), the fallback (the loader's error and the bait
// hidden, both), the pages and hosts where it never opens, the escape over the day (page.clock), the region (the __tcfapi
// and the time zone), the keyboard, the Esc in each mode, the search, the look (nothing sun, no ad, the scroll locked, the
// motion), the targets, the sad pose in the sprite and axe. The adblock_wall event is in events.spec.ts.

useTestBuild(test);
// A time zone outside Europe for every test, so the region is the one each test sets (the CI runs in UTC, this machine in
// America/Sao_Paulo; both are outside the list, but the test says it).
test.use({ timezoneId: 'America/Sao_Paulo' });

const wall = (page: Page) => page.locator('#fo-wall');

/** Hides the bait the way a blocker's cosmetic list does: a stylesheet with display none !important. */
async function hideBait(page: Page): Promise<void> {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = '.adsbox, .ad-banner, .textads { display: none !important; }';
      document.head.append(style);
    });
  });
}

/** The detection window closes 4 s after the load event; then a beat more, and the wall must still be closed. */
async function expectNeverOpens(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await page.waitForTimeout(4_800);
  await expect(wall(page)).not.toHaveAttribute('open', '');
}

const actions = async (page: Page) => (await wallEvents(page)).map((event) => event['action']);

test.describe('o sinal do Google', () => {
  test('the extension blocker opens the wall in bloqueio, with the focus on the reload', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    await expect(page.getByRole('dialog', { name: enWall.title })).toBeVisible();
    await expect(page.locator('[data-wall="reload"]')).toBeFocused();
    await expect(page.locator('[data-wall="escape"]')).toBeVisible();
    await expect(page.locator('.fo-wall__later')).toBeHidden();
    expect(await wallEvents(page)).toEqual([{ action: 'shown', mode: 'bloqueio', lang: 'en' }]);
  });

  test("the name of Google's own example (EXTENSION_LEVEL_AD_BLOCKER) opens it too", async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION, { exampleNames: true }) });
    await expectWallOpen(page, 'bloqueio');
  });

  test('the network-level blocker always gets the closable notice, even with the variable in bloqueio', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NETWORK) });
    await expectWallOpen(page, 'aviso');
    expect(await wallEvents(page)).toEqual([{ action: 'shown', mode: 'aviso', lang: 'en' }]);
  });

  test('no ad blocker ends the detection: no wall, even with the loader failing and the bait hidden', async ({ page, context }) => {
    await hideBait(page);
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NONE), loader: 'error' });
    await expectNeverOpens(page);
    expect(await wallEvents(page)).toEqual([]);
  });

  test('an unknown status decides nothing: the fallback still opens the wall', async ({ page, context }) => {
    await hideBait(page);
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.UNKNOWN), loader: 'error' });
    await expectWallOpen(page, 'bloqueio');
  });

  test('an answer of Google after the window of 4 s leaves the page alone', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION, { delay: 6_000 }), loader: 'stub' });
    await page.waitForLoadState('load');
    await page.waitForTimeout(7_000);
    await expect(wall(page)).not.toHaveAttribute('open', '');
  });

  test('the page in Portuguese gets the wall in Portuguese', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) }, `${PRODUCTION_ORIGIN}/pt/comprimir-imagem/`);
    await expectWallOpen(page, 'bloqueio');
    await expect(page.getByRole('dialog', { name: ptWall.title })).toBeVisible();
    await expect(page.getByRole('button', { name: ptWall.reload })).toBeFocused();
    expect(await wallEvents(page)).toEqual([{ action: 'shown', mode: 'bloqueio', lang: 'pt' }]);
  });
});

test.describe('o sinal reserva', () => {
  test('the loader error and the bait hidden, together, open the wall 4 s after the load event', async ({ page, context }) => {
    await hideBait(page);
    await openAsProduction(page, context, { recovery: 'error', loader: 'error' });
    await page.waitForLoadState('load');
    await page.waitForTimeout(2_500);
    await expect(wall(page)).not.toHaveAttribute('open', '');
    await expectWallOpen(page, 'bloqueio');
  });

  test('only the loader error, with the bait in place (the Googlebot), never opens it', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: 'error', loader: 'error' });
    await page.waitForLoadState('load');
    expect(await page.evaluate(() => (window as unknown as { foAdsFailed?: boolean }).foAdsFailed)).toBe(true);
    await expectNeverOpens(page);
  });

  test('only the bait hidden, with the loader there, never opens it', async ({ page, context }) => {
    await hideBait(page);
    await openAsProduction(page, context, { recovery: 'error', loader: 'stub' });
    await expectNeverOpens(page);
  });
});

test.describe('onde ela nunca abre', () => {
  test('a filled ad on the page ends the detection (Acceptable Ads)', async ({ page, context }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        ad.setAttribute('data-ad-status', 'filled');
        document.querySelector('main')?.append(ad);
      });
    });
    await hideBait(page);
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION), loader: 'error' });
    await expectNeverOpens(page);
  });

  test('offline, nothing is detected', async ({ page, context }) => {
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'onLine', { get: () => false, configurable: true }));
    await hideBait(page);
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION), loader: 'error' });
    await expectNeverOpens(page);
  });

  test('the free pages have no wall at all, nor its pose', async ({ page, context }) => {
    await serveAsProduction(context, { recovery: googlefcStub(STATUS.EXTENSION) });
    for (const path of ['/privacy/', '/pt/apoie/', '/es/terminos/', '/about/', '/contact/', '/licenses/']) {
      const response = await page.goto(`${PRODUCTION_ORIGIN}${path}`);
      expect(response?.status(), path).toBe(200);
      expect(await page.locator('#fo-wall, #fo-bait, #oli-sad').count(), path).toBe(0);
    }
  });

  test('outside fileorca.com (the same test build on 127.0.0.1) the wall never opens', async ({ page }) => {
    await page.addInitScript(googlefcStub(STATUS.EXTENSION));
    const response = await page.goto(`${TEST_BUILD_ORIGIN}/compress-image/`);
    expect(response?.status()).toBe(200);
    // The wall is in the HTML of the test build, and its script leaves it closed.
    expect(await wall(page).count()).toBe(1);
    await expectNeverOpens(page);
    // The loader and the recovery tag are locked to fileorca.com too.
    expect(await page.locator('script[src*="fundingchoices"], script[src*="googlesyndication"]').count()).toBe(0);
  });
});

test.describe('o escape: uma vez por dia, por 30 minutos', () => {
  const at = (time: string) => new Date(`2026-11-04T${time}-03:00`);

  test('frees the site for 30 minutes, then the wall comes back without it until local midnight', async ({ page, context }) => {
    await serveAsProduction(context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await page.clock.setFixedTime(at('10:00:00'));
    await page.goto(WALL_TOOL);
    await expectWallOpen(page, 'bloqueio');
    await page.locator('[data-wall="escape"]').click();
    await expect(wall(page)).not.toHaveAttribute('open', '');
    expect(await page.evaluate(() => localStorage.getItem('fo-wall-escape'))).toBe(String(at('10:00:00').getTime()));
    expect(await actions(page)).toEqual(['shown', 'escape']);
    // The focus had nowhere to go back to: it lands on <main>.
    await expect(page.locator('main')).toBeFocused();

    // 29 minutes later a new page is still free, and it stays free past the 30 minutes until the next navigation.
    await page.clock.setFixedTime(at('10:29:00'));
    await page.goto(`${PRODUCTION_ORIGIN}/pdf-tools/`);
    await page.clock.setFixedTime(at('10:45:00'));
    await expectNeverOpens(page);

    // After 30 minutes the next page brings the wall back, without the escape and with the line about tomorrow.
    await page.goto(WALL_TOOL);
    await expectWallOpen(page, 'bloqueio');
    await expect(page.locator('[data-wall="escape"]')).toBeHidden();
    await expect(page.locator('.fo-wall__later')).toHaveText(enWall.later);

    // Still the same day at 23:59.
    await page.clock.setFixedTime(at('23:59:00'));
    await page.goto(WALL_TOOL);
    await expectWallOpen(page, 'bloqueio');
    await expect(page.locator('[data-wall="escape"]')).toBeHidden();

    // The next day, past local midnight, the escape is back.
    await page.clock.setFixedTime(new Date('2026-11-05T00:00:30-03:00'));
    await page.goto(WALL_TOOL);
    await expectWallOpen(page, 'bloqueio');
    await expect(page.locator('[data-wall="escape"]')).toBeVisible();
    await expect(page.locator('.fo-wall__later')).toBeHidden();
  });

  test('without localStorage the escape frees only the page that is open', async ({ page, context }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('denied', 'SecurityError');
        },
      });
    });
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    await page.locator('[data-wall="escape"]').click();
    await expect(wall(page)).not.toHaveAttribute('open', '');
    await page.waitForTimeout(500);
    await expect(wall(page)).not.toHaveAttribute('open', '');
    await page.goto(WALL_TOOL);
    await expectWallOpen(page, 'bloqueio');
    await expect(page.locator('[data-wall="escape"]')).toBeVisible();
  });
});

test.describe('a região', () => {
  /** A fake __tcfapi: gdprApplies, the status it starts with, and window.__tcf(status) to move it on. */
  async function fakeTcf(page: Page, gdprApplies: boolean, start: string): Promise<void> {
    await page.addInitScript(
      ([applies, status]) => {
        const listeners: ((data: unknown, ok: boolean) => void)[] = [];
        const state = { status };
        const target = window as unknown as { __tcfapi: unknown; __tcf: (next: string) => void };
        target.__tcfapi = (command: string, _version: number, callback: (data: unknown, ok: boolean) => void) => {
          if (command !== 'addEventListener') return;
          listeners.push(callback);
          callback({ gdprApplies: applies, eventStatus: state.status, cmpStatus: 'loaded' }, true);
        };
        target.__tcf = (next: string) => {
          state.status = next;
          for (const listener of listeners) listener({ gdprApplies: applies, eventStatus: next, cmpStatus: 'loaded' }, true);
        };
      },
      [gdprApplies, start] as const,
    );
  }

  test('where the __tcfapi says GDPR applies, the wall waits for the consent message, then opens closable', async ({ page, context }) => {
    await fakeTcf(page, true, 'cmpuishown');
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1_500);
    await expect(wall(page)).not.toHaveAttribute('open', '');
    await page.evaluate(() => (window as unknown as { __tcf: (next: string) => void }).__tcf('useractioncomplete'));
    await expectWallOpen(page, 'aviso');
  });

  test('tcloaded with GDPR is the closable notice at once', async ({ page, context }) => {
    await fakeTcf(page, true, 'tcloaded');
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'aviso');
  });

  test('the __tcfapi that says GDPR does not apply keeps the variable (bloqueio)', async ({ page, context }) => {
    await fakeTcf(page, false, 'tcloaded');
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
  });

  for (const timezoneId of ['Europe/Berlin', 'Europe/London', 'Atlantic/Canary']) {
    test.describe(`sem __tcfapi, no fuso ${timezoneId}`, () => {
      test.use({ timezoneId });
      test('the time zone of the device gives the closable notice, and stays on the device', async ({ page, context }) => {
        await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
        await expectWallOpen(page, 'aviso');
        expect(JSON.stringify(await page.evaluate(() => window.dataLayer))).not.toMatch(/Europe|Atlantic/);
        expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toMatch(/Europe|Atlantic/);
      });
    });
  }
});

test.describe('o teclado e o Esc', () => {
  test('the focus stays in the dialog, and lands on <main> when the notice closes with Esc', async ({ page, context, browserName }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NETWORK) });
    await expectWallOpen(page, 'aviso');
    await expect(page.locator('[data-wall="reload"]')).toBeFocused();
    // Tab and Shift+Tab go round the controls of the dialog only: the rest of the page is inert (WebKit tabs with Option).
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    for (const key of [tab, tab, tab, tab, tab, `Shift+${tab}`, `Shift+${tab}`]) {
      await page.keyboard.press(key);
      expect(await page.evaluate(() => document.activeElement?.closest('#fo-wall') !== null || document.activeElement === document.body), key).toBe(true);
    }
    // The page under the water takes no focus.
    await page.evaluate(() => document.querySelector<HTMLElement>('header a')?.focus());
    expect(await page.evaluate(() => document.activeElement?.closest('header') ?? null)).toBeNull();
    await page.keyboard.press('Escape');
    await expect(wall(page)).not.toHaveAttribute('open', '');
    await expect(page.locator('main')).toBeFocused();
    await expect(page.locator('main')).toHaveAttribute('tabindex', '-1');
  });

  test('the close button closes the notice for good', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NETWORK) });
    await expectWallOpen(page, 'aviso');
    await page.locator('[data-wall="close"]').click();
    await expect(wall(page)).not.toHaveAttribute('open', '');
    await expect(page.locator('main')).toBeFocused();
    await page.waitForTimeout(500);
    await expect(wall(page)).not.toHaveAttribute('open', '');
  });

  test('in bloqueio no Esc closes the wall, not even two in a row', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expectWallOpen(page, 'bloqueio');
    // A close that gets through anyway (the CloseWatcher of Chromium lets a second Esc close it) opens it again.
    await page.evaluate(() => (document.getElementById('fo-wall') as HTMLDialogElement).close());
    await expectWallOpen(page, 'bloqueio');
    await expect(page.locator('[data-wall="reload"]')).toBeFocused();
  });

  test('Ctrl+K never opens the search over the wall', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    await page.keyboard.press('Control+K');
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(800);
    await expect(page.locator('#fo-search-dialog')).not.toHaveAttribute('open', '');
    await expect(page.locator('[data-wall="reload"]')).toBeFocused();
  });

  test('the help button has aria-expanded and opens the nine entries, one at a time, with the footer in sight', async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    const toggle = page.locator('[data-wall="help"]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#fo-wall-help')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('region', { name: enWall.helpTitle })).toBeVisible();
    const summaries = page.locator('#fo-wall-help summary');
    await expect(summaries).toHaveCount(9);
    await summaries.nth(0).click();
    await summaries.nth(4).scrollIntoViewIfNeeded();
    await summaries.nth(4).click();
    expect(await page.locator('#fo-wall-help details[open]').count()).toBe(1);
    // The footer with the reload and the escape stays in sight with the panel open.
    for (const name of [enWall.reload, enWall.escape]) await expect(page.getByRole('button', { name })).toBeInViewport();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#fo-wall-help')).toBeHidden();
    // help only when the panel opens.
    expect(await actions(page)).toEqual(['shown', 'help']);
  });
});

test.describe('a cara', () => {
  test('every target is 48 px or more, with the help open, at 360 and 1280 px', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NETWORK) });
    await expectWallOpen(page, 'aviso');
    await page.locator('[data-wall="help"]').click();
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: width === 360 ? 740 : 800 });
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('#fo-wall button, #fo-wall summary')]
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => ({ name: element.textContent?.trim() || element.getAttribute('aria-label') || '?', box: element.getBoundingClientRect() }))
          .filter(({ box }) => box.height < 48 || box.width < 48)
          .map(({ name, box }) => `${name}: ${box.width}x${box.height}`),
      );
      expect(small, `${width}px`).toEqual([]);
      expect(await page.locator('#fo-wall button:visible, #fo-wall summary:visible').count(), `${width}px`).toBe(4 + 9);
    }
  });

  test('nothing sun, no ad, no link inside; the sea over the page; the scroll locked without a shift; the Oli of the page hidden', async ({ page, context }) => {
    await hideBait(page);
    await openAsProduction(page, context, { recovery: 'error', loader: 'error' });
    await page.waitForLoadState('load');
    // Before the wall opens (the fallback waits 4 s): where the page is, and how much of the width its scrollbar takes.
    const measure = () =>
      page.evaluate(() => ({
        main: document.querySelector('main')?.getBoundingClientRect().left ?? 0,
        scrollbar: innerWidth - document.documentElement.clientWidth,
        // What a stable gutter reserves in this browser: the width of a classic scrollbar, or 0 with overlay ones.
        gutter: (() => {
          const probe = document.createElement('div');
          probe.style.cssText = 'position:absolute;top:0;left:-200px;width:100px;height:50px;overflow:hidden;scrollbar-gutter:stable';
          document.body.append(probe);
          const width = probe.offsetWidth - probe.clientWidth;
          probe.remove();
          return width;
        })(),
      }));
    const before = await measure();
    await expectWallOpen(page, 'bloqueio');
    const after = await measure();
    // With the wall open the page cannot scroll, and its scrollbar leaves the same room it took (scrollbar-gutter:
    // stable): a page with a classic scrollbar does not move. The headless browser hides the scrollbar but still
    // reserves the gutter, so there the centred page moves by half the gutter, and by nothing else.
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarGutter)).toBe('stable');
    expect(after.main - before.main).toBeCloseTo((before.scrollbar - before.gutter) / 2, 1);
    await page.mouse.move(20, 400);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    // The Oli of the page hides under the water; the sad Oli is the one of the wall.
    const olis = await page.evaluate(() =>
      [...document.querySelectorAll('[data-oli]')].map((oli) => ({ pose: oli.getAttribute('data-oli'), inWall: oli.classList.contains('fo-wall__oli'), visibility: getComputedStyle(oli).visibility })),
    );
    expect(olis.filter((oli) => oli.inWall)).toEqual([{ pose: 'sad', inWall: true, visibility: 'visible' }]);
    expect(olis.filter((oli) => !oli.inWall).length).toBeGreaterThan(0);
    expect(olis.filter((oli) => !oli.inWall && oli.visibility !== 'hidden')).toEqual([]);
    // No ad, no AdSlot look, no link; and nothing in the colour of the sun, the yellow of the Download.
    expect(await page.locator('#fo-wall ins, #fo-wall .fo-ad, #fo-wall a').count()).toBe(0);
    const sunny = await page.evaluate(() => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--sun)';
      document.body.append(probe);
      const sun = getComputedStyle(probe).color;
      probe.remove();
      const all = [document.getElementById('fo-wall') as HTMLElement, ...document.querySelectorAll<HTMLElement>('#fo-wall *')];
      return all.filter((element) => {
        const style = getComputedStyle(element);
        return [style.color, style.backgroundColor, style.borderTopColor, style.fill, style.outlineColor].includes(sun);
      }).length;
    });
    expect(sunny).toBe(0);
    // The sea: a colour at 92 %, never opaque, over the page.
    const backdrop = await page.evaluate(() => getComputedStyle(document.getElementById('fo-wall') as HTMLElement, '::backdrop').backgroundColor);
    expect(backdrop).toContain('0.92');
  });

  test('one entrance of up to 480 ms, and nothing moves with reduced motion', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    const inWall = () =>
      page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target;
            return target instanceof Element && target.closest('#fo-wall') !== null;
          })
          .map((animation) => Number(animation.effect?.getComputedTiming().duration)),
      );
    const durations = await inWall();
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations) expect(duration).toBeLessThanOrEqual(480);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(WALL_TOOL);
    await expectWallOpen(page, 'bloqueio');
    expect(await inWall()).toEqual([]);
  });

  test('the sad pose is in the sprite only of the pages with the wall, within 4 KB', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NONE) });
    const bytes = await page.evaluate(() => {
      const symbol = document.getElementById('oli-sad');
      if (!symbol) return 0;
      const pieces = new Set<string>(['oli-clip']);
      for (const use of symbol.querySelectorAll('use')) pieces.add((use.getAttribute('href') ?? '').slice(1));
      return new TextEncoder().encode(symbol.outerHTML + [...pieces].map((id) => document.getElementById(id)?.outerHTML ?? '').join('')).length;
    });
    expect(bytes).toBeGreaterThan(0);
    expect(bytes).toBeLessThanOrEqual(4096);
    const response = await page.goto(`${PRODUCTION_ORIGIN}/privacy/`);
    expect(response?.status()).toBe(200);
    expect(await page.locator('#oli-sad').count()).toBe(0);
  });

  for (const state of ['bloqueio', 'aviso', 'ajuda', 'depois do escape'] as const) {
    test(`axe finds nothing in ${state}, in both themes, at 360 and 1280 px`, async ({ page, context }) => {
      if (state === 'depois do escape') {
        // Escaped today, 31 minutes ago: the wall comes back without the escape and with the line about tomorrow.
        const now = new Date('2026-11-04T15:00:00-03:00').getTime();
        await page.clock.setFixedTime(now);
        await page.addInitScript((time) => localStorage.setItem('fo-wall-escape', String(time)), now - 31 * 60_000);
      }
      await openAsProduction(page, context, { recovery: googlefcStub(state === 'aviso' ? STATUS.NETWORK : STATUS.EXTENSION) });
      await expectWallOpen(page, state === 'aviso' ? 'aviso' : 'bloqueio');
      if (state === 'ajuda') {
        await page.locator('[data-wall="help"]').click();
        await page.locator('#fo-wall-help summary').first().click();
      }
      if (state === 'depois do escape') await expect(page.locator('.fo-wall__later')).toBeVisible();
      const found: string[] = [];
      for (const [width, height] of [[360, 740], [1280, 800]] as const) {
        await page.setViewportSize({ width, height });
        for (const colorScheme of ['light', 'dark'] as const) {
          await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
          found.push(...(await describedViolations(page, `${width}px ${colorScheme}`)));
        }
      }
      expect(found).toEqual([]);
    });
  }
});
