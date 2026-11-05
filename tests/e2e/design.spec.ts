import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { LANGS, ROUTES, languagesOf, moneyHubId, pagePath } from '../../src/i18n/routes.ts';
import { HEALTH_HUB_ID, HOUSE_HUB_ID } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID } from '../../src/tools/pdf/registry.ts';
import { chooseImage, chooseImages, dismissCookies, dragOver, hydrated, jpegBatch, openAdjust, searchWithoutResult, settle, slowEngine, startOver, useBadFile, useImage } from './lib/page.ts';

// F1b criteria 6 (the Oli boxes), 8 (reduced motion) and 9 (fonts), plus the LCP rule of criterion 3:
// the Oli never is the largest contentful paint. Markup contract: DECISOES § 19 (the [data-oli]
// selector) and the F1b sprite (one <symbol id="oli-<pose>"> per pose, used through <svg><use>).

const POSES = ['wave', 'gulp', 'swim', 'cheer', 'oops', 'buoy', 'lost', 'coffee', 'peek', 'sad'];
const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 1280, height: 800 },
];
const PAGES = ROUTES.flatMap((route) => languagesOf(route).map((lang) => route.paths[lang] ?? '/'));
// F13b (UX-15 A; DECISOES § 575): the category hubs with the sea, in every language they exist in, and one of each view.
const SEA_HUBS = LANGS.flatMap((lang) => (['image-tools', PDF_HUB_ID, moneyHubId(lang), HOUSE_HUB_ID, HEALTH_HUB_ID] as const).flatMap((id) => pagePath(id, lang) ?? []));
const ONE_HUB_A_VIEW = ['/image-tools/', pagePath(PDF_HUB_ID, 'en') ?? '', pagePath('money-calculators', 'en') ?? '', pagePath(HOUSE_HUB_ID, 'en') ?? ''];

/** The widths (px) at which the page, as it is now, scrolls sideways; the label says which state was measured. */
async function sidewaysAt(page: Page, label: string, widths: number[]): Promise<string[]> {
  const found: string[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 700 });
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scroll > width) found.push(`${label} at ${width}px scrolls to ${scroll}px`);
  }
  return found;
}

// ---- fonts (criterion 9) -------------------------------------------------------------------------

test.describe('fonts', () => {
  test('first visit to the tool page: only the two latin woff2, once each, and a Fredoka-only preload', async ({ page }) => {
    const fonts: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith('.woff2')) fonts.push(url.pathname);
    });
    await page.goto('/compress-image/');
    await page.waitForLoadState('networkidle');
    const state = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        // check() is true when no @font-face matches, so also look at the faces that are really loaded.
        faces: [...document.fonts].map((face) => ({ family: face.family.replaceAll('"', ''), status: face.status })),
        fredoka: document.fonts.check('600 28px Fredoka'),
        figtree: document.fonts.check('400 16px Figtree'),
      };
    });
    expect(fonts.map((path) => path.replace(/\.[\w-]+\.woff2$/, '')).sort(), `woff2 requests: ${fonts.join(', ')}`).toEqual([
      '/_astro/figtree-latin-wght-normal',
      '/_astro/fredoka-latin-wght-normal',
    ]);
    const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) =>
      links.map((link) => ({ href: link.getAttribute('href'), type: link.getAttribute('type'), crossorigin: link.getAttribute('crossorigin') })),
    );
    expect(preloads).toHaveLength(1);
    const fredoka = fonts.find((path) => path.includes('fredoka'));
    expect(preloads[0]?.href).toBe(fredoka);
    expect(preloads[0]?.type).toBe('font/woff2');
    // `crossorigin` with no value (or "anonymous") makes the preload reusable by the @font-face fetch.
    expect(['', 'anonymous']).toContain(preloads[0]?.crossorigin);
    expect(state.faces).toEqual(expect.arrayContaining([{ family: 'Fredoka', status: 'loaded' }, { family: 'Figtree', status: 'loaded' }]));
    expect(state.fredoka).toBe(true);
    expect(state.figtree).toBe(true);
  });

  test('every page has exactly one font preload, the same Fredoka file, with crossorigin', async ({ request }) => {
    const hrefs = new Set<string>();
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      const tags = (html.match(/<link\b[^>]*>/g) ?? []).filter((tag) => /\brel=["']?preload\b/.test(tag) && /\bas=["']?font\b/.test(tag));
      expect(tags, `${path}: font preloads`).toHaveLength(1);
      const tag = tags[0] ?? '';
      expect(tag, `${path}: crossorigin`).toMatch(/\bcrossorigin\b/);
      expect(tag, `${path}: type`).toMatch(/\btype=["']?font\/woff2\b/);
      const href = /\bhref=["']?([^"'\s>]+)/.exec(tag)?.[1] ?? '';
      expect(href, `${path}: href`).toMatch(/^\/_astro\/fredoka-latin-wght-normal\.[\w-]+\.woff2$/);
      hrefs.add(href);
    }
    expect([...hrefs]).toHaveLength(1);
  });
});

// ---- the Oli boxes (criterion 6) -----------------------------------------------------------------

interface OliBox {
  pose: string;
  where: string;
  ariaHidden: string | null;
  width: number;
  height: number;
  svgHidden: string | null;
  svgWidth: number;
  svgHeight: number;
  uses: number;
  href: string | null;
  symbol: string | null;
}

/** Every [data-oli] that takes room on screen, with what the contract asks of it. */
async function visibleOlis(page: Page): Promise<OliBox[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-oli]')].flatMap((node) => {
      const box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0 || getComputedStyle(node).visibility === 'hidden') return [];
      const pose = node.dataset['oli'] ?? '';
      const svg = node.querySelector(':scope > svg');
      const uses = node.querySelectorAll(':scope > svg > use');
      const svgBox = svg?.getBoundingClientRect();
      return [
        {
          pose,
          where: node.getAttribute('class') ?? node.tagName,
          ariaHidden: node.getAttribute('aria-hidden'),
          width: box.width,
          height: box.height,
          svgHidden: svg?.getAttribute('aria-hidden') ?? null,
          svgWidth: svgBox?.width ?? 0,
          svgHeight: svgBox?.height ?? 0,
          uses: uses.length,
          href: uses[0]?.getAttribute('href') ?? null,
          symbol: document.getElementById(`oli-${pose}`)?.tagName.toLowerCase() ?? null,
        },
      ];
    }),
  );
}

async function expectOlis(page: Page, label: string, expected: { pose: string; selector: string }): Promise<void> {
  const olis = await visibleOlis(page);
  expect(olis.length, `${label}: no visible [data-oli]`).toBeGreaterThan(0);
  for (const oli of olis) {
    const id = `${label}: [data-oli="${oli.pose}"] (${oli.where})`;
    expect(POSES, id).toContain(oli.pose);
    expect(oli.ariaHidden, `${id} aria-hidden`).toBe('true');
    expect(oli.width, `${id} width`).toBeGreaterThanOrEqual(32);
    expect(oli.height, `${id} height`).toBeGreaterThanOrEqual(32);
    expect(oli.uses, `${id} <svg><use> count`).toBe(1);
    expect(oli.href, `${id} <use href>`).toBe(`#oli-${oli.pose}`);
    expect(oli.symbol, `${id} sprite symbol`).toBe('symbol');
    expect(oli.svgHidden, `${id} svg aria-hidden`).toBe('true');
    expect(oli.svgWidth, `${id} svg width`).toBeGreaterThan(0);
    expect(oli.svgHeight, `${id} svg height`).toBeGreaterThan(0);
  }
  // The box the state is about shows the pose the state calls for.
  const wanted = page.locator(expected.selector);
  await expect(wanted, `${label}: ${expected.selector}`).toHaveAttribute('data-oli', expected.pose);
  expect(olis.some((oli) => oli.pose === expected.pose), `${label}: ${expected.pose} is not visible`).toBe(true);
}

for (const viewport of VIEWPORTS) {
  test.describe(`Oli boxes a ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    test.describe('tool page states', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/compress-image/');
        await hydrated(page);
        await dismissCookies(page);
      });

      test('idle: wave', async ({ page }) => {
        // F13a (UX-04 A; DECISOES § 465): one Oli, in the top-right corner of the rectangle, in every state.
        await expectOlis(page, 'idle', { pose: 'wave', selector: '.fo-slot > .fo-slot__oli' });
      });

      test('a file over the drop zone: gulp', async ({ page }) => {
        await dragOver(page);
        await expectOlis(page, 'over', { pose: 'gulp', selector: '.fo-slot > .fo-slot__oli' });
      });

      test('processing: swim', async ({ page }) => {
        const engine = await slowEngine(page);
        await chooseImage(page);
        await expect(page.locator('.fo-level')).toBeVisible();
        await expectOlis(page, 'processing', { pose: 'swim', selector: '.fo-slot > .fo-slot__oli' });
        engine.release();
        await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
      });

      test('result: cheer, and the one Oli of the rectangle in its corner, none inside the card', async ({ page }) => {
        await useImage(page);
        await expect(page.locator('#fo-tool-root [data-oli]')).toHaveCount(1);
        await expect(page.locator('.fo-result [data-oli]')).toHaveCount(0);
        await expectOlis(page, 'result', { pose: 'cheer', selector: '.fo-slot > .fo-slot__oli' });
      });

      test('error: oops', async ({ page }) => {
        await useBadFile(page);
        await expectOlis(page, 'error', { pose: 'oops', selector: '.fo-slot > .fo-slot__oli' });
      });

      test('search without a result: the peek shows, and only then', async ({ page }) => {
        await searchWithoutResult(page);
        await expectOlis(page, 'search without result', { pose: 'peek', selector: '.fo-search__empty .fo-search__peek' });
        const dialog = page.locator('#fo-search-dialog');
        // 'heif' has one result (HEIC to JPG) and 'compress' has four (Compress image, its two presets and, F5a, Compress PDF).
        await page.keyboard.press('Control+A');
        await page.keyboard.type('heif');
        await expect(dialog.getByRole('option')).toHaveCount(1);
        await expect(dialog.locator('.fo-search__peek')).toBeHidden();
        await page.keyboard.press('Control+A');
        await page.keyboard.type('compress');
        await expect(dialog.getByRole('option')).toHaveCount(4);
        await expect(dialog.locator('.fo-search__peek')).toBeHidden();
      });
    });

    test.describe('other pages', () => {
      const CASES = [
        // F13b (UX-03 B and UX-15 A; DECISOES § 567 and § 575): the Oli of the home swims in the sea of the top, the one of
        // a category hub in the sea at the foot of its band.
        { name: 'home', paths: ['/', '/pt/', '/es/'], pose: 'swim', selector: '.fo-home-sea__oli' },
        { name: 'hub', paths: SEA_HUBS, pose: 'swim', selector: '.fo-hubband__oli' },
        { name: '404', paths: ['/404.html', '/pt/404.html', '/es/404.html'], pose: 'lost', selector: '[data-oli="lost"]' },
        { name: 'support', paths: ['/support/', '/pt/apoie/', '/es/apoyo/'], pose: 'coffee', selector: '.fo-support__oli' },
      ];
      for (const { name, paths, pose, selector } of CASES) {
        for (const path of paths) {
          test(`${name} ${path}: ${pose}`, async ({ page }) => {
            await page.goto(path);
            await expectOlis(page, `${name} ${path}`, { pose, selector });
          });
        }
      }
    });
  });
}

// ---- reduced motion (criterion 8) ----------------------------------------------------------------

/** What is animating or transitioning in the document, as readable strings. */
async function animations(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document.getAnimations().map((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      const name = 'animationName' in animation ? String(animation.animationName) : 'transitionProperty' in animation ? String(animation.transitionProperty) : animation.id;
      return `${animation.constructor.name} ${name} on ${target?.getAttribute('class') ?? target?.tagName ?? '?'} (${animation.playState})`;
    }),
  );
}

async function running(page: Page): Promise<number> {
  return page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length);
}

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' });

  test.describe('tool page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/compress-image/');
      await hydrated(page);
      await dismissCookies(page);
    });

    test('idle', async ({ page }) => {
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });

    test('a file over the drop zone', async ({ page }) => {
      await dragOver(page);
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });

    test('processing', async ({ page }) => {
      const engine = await slowEngine(page);
      await chooseImage(page);
      await expect(page.locator('.fo-level')).toBeVisible();
      await settle(page);
      expect(await animations(page)).toEqual([]);
      engine.release();
      await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    });

    test('result', async ({ page }) => {
      await useImage(page);
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });

    test('error', async ({ page }) => {
      await useBadFile(page);
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });

    test('result, start over and back to idle', async ({ page }) => {
      await useImage(page);
      await startOver(page);
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });
  });

  for (const path of ['/support/', '/404.html']) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });
  }

  // F13a · a Oli por estado (UX-10; DECISOES § 460): the other pages where a move starts on its own stay still too.
  // F13b (DECISOES § 575): and a category hub of each view, with the sea and its Oli.
  for (const path of ['/', '/merge-pdf/', '/qr-code-generator/', '/open-with/', ...ONE_HUB_A_VIEW]) {
    test(`${path}: nothing moves`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await settle(page);
      expect(await animations(page)).toEqual([]);
    });
  }
});

// The same pages without the preference do animate, so the checks above are not vacuous.
test.describe('motion without the preference', () => {
  test.use({ reducedMotion: 'no-preference' });

  // F13a · a Oli por estado (UX-10; DECISOES § 460): the wave greets once (3 s) and rests on the drawn pose; it looped with
  // no end before (F3 d-02). It still moves at first, so the reduced-motion checks above are not vacuous.
  test('idle: the wave greets once, then rests', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    await expect.poll(() => running(page)).toBeGreaterThan(0);
    await expect.poll(() => running(page), { timeout: 10_000 }).toBe(0);
  });

  // F13a (UX-10; DECISOES § 460): every move that starts on its own has a finite count and ends by 5 s (WCAG 2.2.2), and
  // 3.2 s after the page opens none runs; only the progress (.fo-level, .fo-water, .fo-spin) may loop, and none shows here.
  // F13b (UX-03 B and UX-15 A; DECISOES § 574 and § 577): on the home and on a category hub of each view the swim and the
  // water are no progress: nothing is left out there, the Oli bobs for 4.8 s, and none runs 5.2 s after opening.
  const MOTION_PAGES: { path: string; sea: boolean }[] = [
    ...['/compress-image/', '/merge-pdf/', '/qr-code-generator/', '/open-with/', '/support/'].map((path) => ({ path, sea: false })),
    ...['/', ...ONE_HUB_A_VIEW].map((path) => ({ path, sea: true })),
  ];
  for (const { path, sea } of MOTION_PAGES) {
    test(`${path}: every move that starts on its own ends by 5 s, none runs ${sea ? '5.2' : '3.2'} s after opening`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      const timings = () =>
        page.evaluate((sea) =>
          document
            .getAnimations()
            .filter((animation) => {
              const target = (animation.effect as KeyframeEffect | null)?.target;
              return sea || !(target instanceof Element && target.closest('.fo-level, .fo-water, .fo-spin'));
            })
            .map((animation) => {
              const timing = animation.effect?.getComputedTiming();
              const name = animation instanceof CSSAnimation ? animation.animationName : animation instanceof CSSTransition ? animation.transitionProperty : animation.id;
              return { name, iterations: Number(timing?.iterations), end: Number(timing?.endTime), state: animation.playState };
            }),
        sea);
      await expect.poll(async () => (await timings()).length, { message: `${path}: something moves at first` }).toBeGreaterThan(0);
      for (const timing of await timings()) {
        expect(Number.isFinite(timing.iterations), `${path}: ${timing.name} has a finite count`).toBe(true);
        expect(timing.end, `${path}: ${timing.name} ends by 5 s`).toBeLessThanOrEqual(5000);
      }
      await page.waitForTimeout(sea ? 5200 : 3200);
      expect((await timings()).filter((timing) => timing.state === 'running'), `${path}: still running ${sea ? '5.2' : '3.2'} s after opening`).toEqual([]);
    });
  }

  test('processing: the swim loops', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    const engine = await slowEngine(page);
    await chooseImage(page);
    await expect(page.locator('.fo-level')).toBeVisible();
    await expect.poll(() => running(page)).toBeGreaterThan(0);
    engine.release();
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  });

  // F12 (decision 7; DECISOES § 439): the steam of the coffee pose rises, then rests by itself, still and visible, by
  // 4.8 s (WCAG 2.2.2; it looped every 1.8 s, F3 d-02). It still moves at first, so this check is not vacuous. A finished
  // animation with "forwards" stays in getAnimations(): what is counted is the playState "running".
  // F13a (UX-10; DECISOES § 460): 1.4 cycles that end on the 40 % frame, visible and still, by 3.12 s (it was 4.8 s).
  test('support page: the coffee steam rises, then rests, still and visible, by 3.2 s', async ({ page }) => {
    await page.goto('/support/');
    await expect.poll(() => running(page)).toBeGreaterThan(0);
    const steam = () =>
      page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation): animation is CSSAnimation => animation instanceof CSSAnimation && animation.animationName.startsWith('fo-steam'))
          .map((animation) => ({ name: animation.animationName, end: Number(animation.effect?.getComputedTiming().endTime), state: animation.playState })),
      );
    const timings = await steam();
    expect(timings.length, 'the steam animates').toBeGreaterThan(0);
    for (const timing of timings) expect(timing.end, `${timing.name} ends`).toBeLessThanOrEqual(3200);
    console.log(`[café] vapor: ${timings.length} animações, a última termina em ${Math.max(...timings.map((timing) => timing.end))} ms`);
    // On the clock too: after the 3.12 s nothing on the page runs, and the two wisps rest in place, fully visible (without
    // "forwards" a finished animation leaves getAnimations(), and the drawn steam is the frame it ends on).
    await expect.poll(() => running(page), { timeout: 10_000 }).toBe(0);
    expect((await steam()).every((timing) => timing.state === 'finished')).toBe(true);
    const wisps = await page.evaluate(() =>
      [...document.querySelectorAll('#oli-coffee .oli-steam path')].map((path) => {
        const style = getComputedStyle(path);
        // "forwards" keeps the last keyframe (transform: none), which the engine may write as the identity matrix.
        return { opacity: style.opacity, transform: ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(style.transform) ? 'in place' : style.transform };
      }),
    );
    expect(wisps).toEqual([{ opacity: '1', transform: 'in place' }, { opacity: '1', transform: 'in place' }]);
  });
});

// ---- the Oli never is the LCP (criterion 3) ------------------------------------------------------

interface Candidate {
  tag: string;
  className: string;
  inOli: boolean;
  inSvg: boolean;
  size: number;
}

test.describe('largest contentful paint', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('on the tool page the LCP element is not the Oli nor an svg', async ({ page, browserName }) => {
    // The observer starts with the document, so no candidate is missed; entries are summarized
    // when they arrive because the element can leave the DOM later.
    await page.addInitScript(() => {
      const seen: Candidate[] = [];
      (window as unknown as { __lcp: Candidate[] }).__lcp = seen;
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { element?: Element | null; size?: number })[]) {
            const element = entry.element ?? null;
            seen.push({
              tag: element?.tagName ?? 'none',
              className: element?.getAttribute('class') ?? '',
              inOli: !!element?.closest('[data-oli]'),
              inSvg: !!element?.closest('svg') || element instanceof SVGElement,
              size: entry.size ?? 0,
            });
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // the browser has no LCP entry type
      }
    });
    await page.goto('/compress-image/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    });
    const supported = await page.evaluate(() => PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint'));
    if (!supported) {
      // Only Chromium reports LCP; WebKit joins the check on its own the day it ships the entry type.
      expect(browserName).not.toBe('chromium');
      return;
    }
    const entries = () => page.evaluate(() => (window as unknown as { __lcp: Candidate[] }).__lcp);
    await expect.poll(async () => (await entries()).length).toBeGreaterThan(0);
    const last = (await entries()).at(-1);
    const label = `LCP element <${last?.tag}> .${last?.className} (${last?.size}px²)`;
    expect(last?.inOli, `${label} is inside [data-oli]`).toBe(false);
    expect(last?.inSvg, `${label} is an svg`).toBe(false);
  });
});

// ---- regressions of the adversarial review (DECISOES § 40, § 42 and § 44) ------------------------

test.describe('review regressions', () => {
  // Every page of the site in one test passed the 60 s limit in the WebKit of the CI when the F8 added six pages: the
  // loads took 34 s and the batch below had no room left. The pages go in blocks, each a test (DECISOES § 306).
  const REFLOW_BLOCK = 60;
  for (let start = 0; start < PAGES.length; start += REFLOW_BLOCK) {
    const block = PAGES.slice(start, start + REFLOW_BLOCK);
    test(`reflow at 320px: no page scrolls sideways (pages ${start + 1} to ${start + block.length})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      const wide: string[] = [];
      for (const path of block) {
        await page.goto(path);
        const width = await page.evaluate(() => document.documentElement.scrollWidth);
        if (width > 320) wide.push(`${path} ${width}px`);
      }
      expect(wide).toEqual([]);
    });
  }

  test('reflow at 320px: no tool state scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    const wide: string[] = [];
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', { name: 'IMG_20240101_123456_family_vacation_photo_final_v2.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
    await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible();
    const error = await page.evaluate(() => document.documentElement.scrollWidth);
    if (error > 320) wide.push(`error with a long file name ${error}px`);
    // F2: a batch with long names, an error row and the comparison under the card. Two pictures are ready,
    // so the card offers "Download all · ZIP", the widest label of the page (checked below at three widths).
    const long = 'IMG_20240101_123456_family_vacation_photo_final_v2_without_spaces_in_the_name_at_all';
    await page.setInputFiles('input[type="file"]', [
      { name: `${long}.jpg`, mimeType: 'image/jpeg', buffer: readFileSync('fixtures/images/jpg-02-iphone6-paisagem-gps.jpg') },
      { name: `${long}_2.jpg`, mimeType: 'image/jpeg', buffer: readFileSync('fixtures/images/gen-jpg-02-orientacao8.jpg') },
      { name: `${long}.txt`, mimeType: 'text/plain', buffer: Buffer.from('x') },
    ]);
    await expect(page.locator('.fo-file[data-state="error"]')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-result .fo-btn--download')).toContainText('ZIP');
    const batch = await page.evaluate(() => document.documentElement.scrollWidth);
    if (batch > 320) wide.push(`batch with long file names ${batch}px`);
    wide.push(...(await sidewaysAt(page, 'en batch with the ZIP button', [360, 390])));
    expect(wide).toEqual([]);
  });

  test('reflow: the ZIP button of pt and es and the crop handles stay inside the page from 320 px', async ({ page }) => {
    const wide: string[] = [];
    // WCAG 1.4.10: "Download all · ZIP 1.4 MB" is wider than the card on a phone; the label wraps instead of scrolling the page.
    const compress = ROUTES.find((route) => route.id === 'compress-image');
    for (const lang of ['pt', 'es'] as const) {
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(compress?.paths[lang] ?? '/');
      await hydrated(page);
      await dismissCookies(page);
      await chooseImages(page, await jpegBatch(page, 2));
      await expect(page.locator('.fo-result .fo-btn--download')).toContainText('ZIP', { timeout: 30_000 });
      wide.push(...(await sidewaysAt(page, `${lang} batch with the ZIP button`, [320, 360, 390])));
    }
    // The crop handles are 48 px targets centred on the box corners, so a box that spans the picture sticks out half
    // a handle on each side: a portrait photo with Square (320 px) and a landscape one with 16:9 (360 px).
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/crop-image/');
    await hydrated(page);
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', 'fixtures/images/gen-jpg-01-orientacao6.jpg');
    await expect(page.locator('.fo-crop__img')).toHaveAttribute('width', '1200', { timeout: 30_000 });
    // F13a (UX-04 A): after the result the editor is folded under "Adjust"; open, it is on screen to be measured.
    await openAdjust(page);
    wide.push(...(await sidewaysAt(page, 'crop editor, portrait photo, Square', [320, 360, 390])));
    await page.setInputFiles('input[type="file"]', 'fixtures/images/gen-jpg-02-orientacao8.jpg');
    await expect(page.locator('.fo-crop__img')).toHaveAttribute('width', '1600', { timeout: 30_000 });
    await openAdjust(page);
    await page.locator('label.fo-seg__opt:has(input[name="cr-ratio"][value="wide"])').click();
    await expect(page.locator('input[name="cr-ratio"][value="wide"]')).toBeChecked();
    wide.push(...(await sidewaysAt(page, 'crop editor, landscape photo, 16:9', [360, 320, 390])));
    expect(wide).toEqual([]);
  });

  test('the prose keeps its width when the webfont replaces the fallback (no CLS from 68ch)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    let release = (): void => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/*.woff2', async (route) => {
      await held;
      await route.continue();
    });
    const figtreeLoaded = () => page.evaluate(() => [...document.fonts].some((face) => face.family.includes('Figtree') && !face.family.includes('Fallback') && face.status === 'loaded'));
    await page.goto('/es/privacidad/', { waitUntil: 'domcontentloaded' });
    expect(await figtreeLoaded()).toBe(false);
    const before = await page.locator('article.fo-prose').evaluate((article) => article.getBoundingClientRect().width);
    release();
    await expect.poll(figtreeLoaded).toBe(true);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const after = await page.locator('article.fo-prose').evaluate((article) => article.getBoundingClientRect().width);
    expect(after).toBe(before);
  });

  test('the segmented option keeps a focus ring after an arrow key', async ({ page }) => {
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    await page.locator('input[name="ci-level"][value="recommended"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('input[name="ci-level"][value="strong"]')).toBeFocused();
    const outline = await page.locator('label.fo-seg__opt:has(input[value="strong"])').evaluate((label) => {
      const style = getComputedStyle(label);
      return `${style.outlineStyle} ${style.outlineWidth}`;
    });
    expect(outline).toBe('solid 3px');
  });

  test('the search placeholder is ink-muted, not the faint browser default', async ({ page }) => {
    await page.goto('/404.html');
    const colors = await page.evaluate(() => {
      const input = document.querySelector('.fo-search__field input');
      const probe = document.createElement('span');
      probe.style.color = 'var(--ink-muted)';
      document.body.append(probe);
      const inkMuted = getComputedStyle(probe).color;
      probe.remove();
      return { placeholder: input ? getComputedStyle(input, '::placeholder').color : '', inkMuted };
    });
    expect(colors.placeholder).toBe(colors.inkMuted);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('a pressed button still sinks into its lip', async ({ page }) => {
      await page.goto('/compress-image/');
      const decline = page.locator('#fo-cookie [data-consent="denied"]');
      await expect(decline).toBeVisible();
      const box = await decline.boundingBox();
      if (!box) throw new Error('no Decline button');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      const pressed = await decline.evaluate((button) => getComputedStyle(button).transform);
      await page.mouse.up();
      expect(pressed).toBe('matrix(1, 0, 0, 1, 0, 4)');
    });
  });
});
