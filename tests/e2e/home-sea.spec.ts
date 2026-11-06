// The home as the sea by category and the sea of the category hubs (F13b, decisions 6 and 7; UX-03 B, home-b.html, and
// UX-15 A, hub-sea.html ?alt=a; DECISOES § 370, § 378 and § 567 to § 577), on the default build (no ad: the distances to
// the ads are measured on the test build by fo-ad-map.spec.ts). The name puts this spec in a light part of the CI, after
// header-theme-offline.spec.ts.
//   - The home: the H1 on the full width with the count; the Oli swim, 128 px on a phone and 152 from 768, aria-hidden, in
//     the sea, right of the H1 (she looks left, at it); without the rail of ads <main> takes the width of the page at 1280
//     (G-06); the H1 is the LCP from 768 px; the load moves nothing (CLS 0) with Figtree held until the first paint.
//   - The hubs, in the four views and every language: the sea is one aria-hidden block with no pointer events and nothing
//     to focus; no text of the band crosses the water; the band grows 56 px at 360 and 64 from 768; the Oli, 72 px, half
//     under water on the right; no move of the band loops or lasts 5 s, and none with reduced motion; the first card of the
//     image hub in English ends above the fold of 360 × 740.
//   - Both: in the dark theme the band is surface and the colour of the category stays on the wave (G-21).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { LANGS, moneyHubId, pagePath, type Lang } from '../../src/i18n/routes.ts';
import { HEALTH_HUB_ID, HOUSE_HUB_ID } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID } from '../../src/tools/pdf/registry.ts';

const PHONE = { width: 360, height: 740 };
const DESKTOP = { width: 1280, height: 800 };
const HOMES: Record<Lang, string> = { en: '/', pt: '/pt/', es: '/es/' };
/** The category hubs (the guides hub keeps its band), in every language they exist in. */
const HUBS = LANGS.flatMap((lang) => (['image-tools', PDF_HUB_ID, moneyHubId(lang), HOUSE_HUB_ID, HEALTH_HUB_ID] as const).flatMap((id) => pagePath(id, lang) ?? []));

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

async function rectOf(page: Page, selector: string): Promise<Box> {
  const box = await page.locator(selector).first().boundingBox();
  expect(box, selector).not.toBeNull();
  return { x: box?.x ?? 0, y: box?.y ?? 0, w: box?.width ?? 0, h: box?.height ?? 0 };
}

/** Whether the browser reports a PerformanceObserver entry type (the LCP and the layout shift are Chromium's today). */
async function supports(browser: Browser, type: string): Promise<boolean> {
  const page = await browser.newPage();
  const found = await page.evaluate((name) => PerformanceObserver.supportedEntryTypes.includes(name), type);
  await page.close();
  return found;
}

async function open(page: Page, path: string): Promise<void> {
  await page.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
  expect((await page.goto(path))?.status(), path).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

test.describe('the home', () => {
  for (const viewport of [PHONE, DESKTOP]) {
    test(`at ${viewport.width} px: the H1 on the full width, and the Oli swims in the sea, aria-hidden, right of it`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const lang of LANGS) {
        await open(page, HOMES[lang]);
        const label = `${HOMES[lang]} a ${viewport.width}`;
        const main = await rectOf(page, 'main');
        const h1 = await rectOf(page, 'main h1');
        // The H1 has the width of the column (the Oli no longer shares its row; G-01).
        expect(Math.round(h1.w), label).toBe(Math.round(main.w));
        const sea = await rectOf(page, '.fo-home-sea');
        const oli = page.locator('.fo-home-sea > [data-oli]');
        await expect(oli, label).toHaveCount(1);
        await expect(oli, label).toHaveAttribute('data-oli', 'swim');
        await expect(oli, label).toHaveAttribute('aria-hidden', 'true');
        await expect(page.locator('.fo-home-sea > .fo-water'), label).toHaveAttribute('aria-hidden', 'true');
        const box = await rectOf(page, '.fo-home-sea > [data-oli]');
        const size = viewport.width < 768 ? 128 : 152;
        expect(Math.round(box.w), label).toBe(size);
        expect(Math.round(box.h), label).toBe(size);
        // In the sea, on its right half: she looks left, at the H1 and the seal.
        expect(box.y, label).toBeGreaterThanOrEqual(sea.y);
        expect(box.y + box.h, label).toBeLessThanOrEqual(sea.y + sea.h);
        expect(box.x, label).toBeGreaterThan(sea.x + sea.w / 2);
        expect(box.x + box.w, label).toBeLessThanOrEqual(sea.x + sea.w);
        // The seal says the promise on the water, and the Oli never covers it.
        const seal = await rectOf(page, '.fo-home-sea > .fo-seal');
        const apart = seal.x + seal.w <= box.x || seal.y >= box.y + box.h || box.y >= seal.y + seal.h;
        expect(apart, `${label}: o selo sob a Oli`).toBe(true);
      }
    });
  }

  test('without the rail of ads (the default build), <main> takes the width of the page at 1280 px (G-06)', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    for (const lang of LANGS) {
      await open(page, HOMES[lang]);
      expect(await page.locator('.fo-frame--rail, aside.fo-rail').count(), lang).toBe(0);
      const width = await page.evaluate(() => {
        const frame = document.querySelector('.fo-frame') as HTMLElement;
        const style = getComputedStyle(frame);
        return { main: document.querySelector('main')?.getBoundingClientRect().width ?? 0, frame: frame.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) };
      });
      expect(Math.round(width.main), lang).toBe(Math.round(width.frame));
      expect(width.main, lang).toBeGreaterThan(1100);
    }
    // A page with the rail column still keeps the tool column (§ 413): the image hub is not wide.
    await open(page, '/image-tools/');
    expect((await rectOf(page, 'main')).w).toBeLessThanOrEqual(760);
  });

  test('the H1 is the largest contentful paint from 768 px, and never the Oli or an svg on a phone (Chromium)', async ({ browser, browserName }) => {
    // Only Chromium reports the LCP; WebKit joins the check on its own the day it ships the entry type (as design.spec.ts).
    if (!(await supports(browser, 'largest-contentful-paint'))) {
      expect(browserName, 'o Chromium mede o LCP').not.toBe('chromium');
      return;
    }
    for (const lang of LANGS) {
      for (const viewport of [PHONE, { width: 412, height: 823 }, { width: 768, height: 1024 }, DESKTOP, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
        const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
        await context.addInitScript(() => {
          localStorage.setItem('fo-consent', 'denied');
          const seen: { tag: string; inH1: boolean; inSea: boolean; size: number }[] = [];
          (window as unknown as { __lcp: typeof seen }).__lcp = seen;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { element?: Element | null; size: number })[]) {
              const element = entry.element ?? null;
              seen.push({ tag: element?.tagName ?? '', inH1: Boolean(element?.closest('h1')), inSea: Boolean(element?.closest('.fo-home-sea, [data-oli], svg')), size: entry.size });
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        });
        const page = await context.newPage();
        await page.goto(HOMES[lang]);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        const seen = await page.evaluate(() => (window as unknown as { __lcp: { tag: string; inH1: boolean; inSea: boolean; size: number }[] }).__lcp);
        const last = seen.at(-1);
        const label = `${HOMES[lang]} a ${viewport.width}×${viewport.height}: ${JSON.stringify(seen)}`;
        expect(last, label).toBeTruthy();
        expect(last?.inSea, label).toBe(false);
        // Below 768 px the H1 is 28 px (h1-mobile) and the line under it is larger: the LCP stays a text of the page, as
        // before the F13b (§ 574). From 768 px the display H1 is the largest.
        if (viewport.width >= 768) expect(last?.inH1, label).toBe(true);
        await context.close();
      }
    }
  });

  test('the load moves nothing: Figtree held until the first paint, no layout shift from 320 to 1280 px (Chromium)', async ({ browser, browserName }) => {
    // Only Chromium reports layout shifts; WebKit joins the check on its own the day it ships the entry type.
    if (!(await supports(browser, 'layout-shift'))) {
      expect(browserName, 'o Chromium mede o deslocamento').not.toBe('chromium');
      return;
    }
    test.setTimeout(120_000);
    const shifts: string[] = [];
    for (const lang of LANGS) {
      for (const width of [320, 360, 393, 412, 768, 1280]) {
        const context = await browser.newContext({ viewport: { width, height: width < 768 ? 740 : 800 }, serviceWorkers: 'block' });
        await context.route(/figtree[^/]*\.woff2$/i, async (route) => {
          await new Promise((done) => setTimeout(done, 600));
          await route.continue();
        });
        await context.addInitScript(() => {
          (window as unknown as { __cls: number }).__cls = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
              if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
        });
        const page = await context.newPage();
        await page.goto(HOMES[lang]);
        await page.waitForFunction(() => document.fonts.status === 'loaded' && [...document.fonts].every((face) => face.status !== 'loading'), undefined, { timeout: 15_000 });
        await page.waitForTimeout(300);
        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
        if (cls > 0) shifts.push(`${HOMES[lang]} a ${width}: ${cls.toFixed(4)}`);
        await context.close();
      }
    }
    expect(shifts).toEqual([]);
  });
});

test.describe('the sea of the category hubs', () => {
  for (const viewport of [PHONE, DESKTOP]) {
    test(`at ${viewport.width} px: the sea is aria-hidden at the foot of the band, the Oli half under water, no text under the water`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const path of HUBS) {
        await open(page, path);
        const label = `${path} a ${viewport.width}`;
        const band = page.locator('main .fo-hubband.fo-hubband--sea');
        await expect(band, label).toHaveCount(1);
        const sea = band.locator(':scope > .fo-hubband__sea');
        await expect(sea, label).toHaveAttribute('aria-hidden', 'true');
        // Nothing of the sea is focusable, takes the pointer or says a word.
        const facts = await sea.evaluate((element) => ({
          pointer: getComputedStyle(element).pointerEvents,
          focusable: element.querySelectorAll('a, button, input, [tabindex]').length,
          text: (element.textContent ?? '').trim(),
          oli: element.querySelectorAll('[data-oli="swim"][aria-hidden="true"]').length,
        }));
        expect(facts, label).toEqual({ pointer: 'none', focusable: 0, text: '', oli: 1 });
        // The band grows by the room of the sea: 56 px at 360 and 64 from 768 (the padding of 24 px becomes 80 and 88).
        expect(await band.evaluate((element) => getComputedStyle(element).paddingBottom), label).toBe(viewport.width < 768 ? '80px' : '88px');
        // No text of the band crosses the water, its wave and the crest (they start 18 px above the water).
        const water = await rectOf(page, '.fo-hubband__water');
        const surface = water.y - 18;
        const texts = await band.evaluate((element) =>
          [...element.querySelectorAll('.fo-eyebrow, h1, p')].map((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            const box = range.getBoundingClientRect();
            return { text: (node.textContent ?? '').trim().slice(0, 30), bottom: box.bottom };
          }),
        );
        for (const text of texts) expect(text.bottom, `${label}: "${text.text}" na água`).toBeLessThanOrEqual(surface);
        // The Oli, 72 px, on the right of the band, half under water: her top above the water, her foot in it.
        const band$ = await rectOf(page, 'main .fo-hubband--sea');
        const oli = await rectOf(page, '.fo-hubband__oli');
        expect([Math.round(oli.w), Math.round(oli.h)], label).toEqual([72, 72]);
        expect(oli.y, label).toBeLessThan(water.y);
        expect(oli.y + oli.h, label).toBeGreaterThan(water.y);
        expect(oli.x, label).toBeGreaterThan(band$.x + band$.w / 2);
        expect(band$.x + band$.w - (oli.x + oli.w), label).toBeGreaterThanOrEqual(viewport.width < 768 ? 16 : 24);
      }
    });
  }

  test('the first card of the image hub in English ends above the fold of 360 × 740', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await open(page, '/image-tools/');
    const card = await rectOf(page, 'main .fo-grid a.fo-tool');
    expect(card.y + card.h).toBeLessThanOrEqual(740);
  });

  test('the Oli of the band bobs three times and stops: no move of the band loops or lasts 5 s', async ({ page }) => {
    for (const path of ['/image-tools/', pagePath(PDF_HUB_ID, 'en') ?? '', pagePath('money-calculators', 'en') ?? '', pagePath(HOUSE_HUB_ID, 'en') ?? '']) {
      await open(page, path);
      const moves = await page.evaluate(() =>
        document.getAnimations().flatMap((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target;
          if (!(target instanceof Element) || !target.closest('.fo-hubband')) return [];
          const timing = animation.effect?.getComputedTiming();
          return [{ name: animation instanceof CSSAnimation ? animation.animationName : animation.id, iterations: Number(timing?.iterations), end: Number(timing?.endTime) }];
        }),
      );
      expect(moves.map((move) => move.name), path).toEqual(['fo-bob']);
      for (const move of moves) {
        expect(Number.isFinite(move.iterations), `${path}: ${move.name} iterations`).toBe(true);
        expect(move.end, `${path}: ${move.name} total`).toBeLessThan(5000);
      }
    }
  });
});

test.describe('the sea with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing of the sea moves on the home and on the hubs', async ({ page }) => {
    for (const path of ['/', '/pt/', '/es/', ...HUBS]) {
      await open(page, path);
      const moves = await page.evaluate(() => document.getAnimations().map((animation) => String((animation as CSSAnimation).animationName ?? animation.id)));
      expect(moves, path).toEqual([]);
    }
  });
});

test.describe('the bands in the dark theme', () => {
  // The theme of the system (no data-theme) and the one chosen in the header (data-theme), each against the other scheme.
  const CASES = [
    { scheme: 'light', system: 'light', stored: null },
    { scheme: 'light', system: 'dark', stored: 'light' },
    { scheme: 'dark', system: 'dark', stored: null },
    { scheme: 'dark', system: 'light', stored: 'dark' },
  ] as const;
  for (const { scheme, system, stored } of CASES) {
    test(`${scheme} (system ${system}${stored ? `, chosen ${stored}` : ''}): the band is ${scheme === 'dark' ? 'surface' : 'the soft colour of its category'}, the wave keeps the full colour`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: system, viewport: PHONE, serviceWorkers: 'block' });
      await context.addInitScript((value) => {
        localStorage.setItem('fo-consent', 'denied');
        if (value) localStorage.setItem('fo-theme', value);
      }, stored);
      const page = await context.newPage();
      for (const path of ['/', '/image-tools/', pagePath(PDF_HUB_ID, 'en') ?? '']) {
        expect((await page.goto(path))?.status(), path).toBe(200);
        const colors = await page.evaluate(() => {
          const probe = (value: string) => {
            const node = document.createElement('i');
            node.style.color = value;
            document.body.append(node);
            const color = getComputedStyle(node).color;
            node.remove();
            return color;
          };
          const band = document.querySelector('main .fo-catband, main .fo-hubband--sea') as HTMLElement;
          const style = getComputedStyle(band);
          const wave = band.classList.contains('fo-catband') ? getComputedStyle(band, '::after').backgroundColor : getComputedStyle(band.querySelector('.fo-hubband__crest') as Element).backgroundColor;
          return {
            band: style.backgroundColor,
            surface: probe(getComputedStyle(document.documentElement).getPropertyValue('--surface')),
            soft: probe(style.getPropertyValue('--fo-cat-soft')),
            cat: probe(style.getPropertyValue('--fo-cat')),
            wave,
          };
        });
        const label = `${path} ${scheme}`;
        expect(colors.band, label).toBe(scheme === 'dark' ? colors.surface : colors.soft);
        expect(colors.wave, label).toBe(colors.cat);
      }
      await context.close();
    });
  }
});
