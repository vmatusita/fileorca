import { expect, test, type Page } from '@playwright/test';
import { dismissCookies, generatedJpeg, hydrated } from './lib/page.ts';

// F13b · the waterline of the dark theme (UX-15 A, night-sea.html ?alt=a; decision 3 of the run; DECISOES § 378 and
// § 539). The deep sea reads by its shape in both themes, not by the luminance (G-07):
// - the result of a tool page (.fo-result) is the water that rose of the F13a (§ 463): a band of water at the top of the
//   card, the wave on its edge and the deep sea under it. That band is its waterline: no pseudo-element of the card
//   paints a second wave;
// - the footer keeps its wave with a crest of 2px in stroke over it, in both themes.
// The waterline of the ResultHero (.fo-sea-top) is in the calculator specs, with the Oli that sits on its edge.

const THEMES = ['light', 'dark'] as const;
const VIEWPORTS = [
  { width: 360, height: 740, surf: 20 },
  { width: 1280, height: 800, surf: 24 },
] as const;

/** The value of a token in the page, as a computed colour (rgb()). */
function tokenColor(page: Page, name: string): Promise<string> {
  return page.evaluate((token) => {
    const probe = document.createElement('i');
    probe.style.color = `var(--${token})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}

async function theme(page: Page, value: (typeof THEMES)[number]): Promise<void> {
  await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), value);
}

/** The mask of a pseudo-element, under its two names (WebKit gives the prefixed one). */
const maskOf = (page: Page, selector: string, pseudo: '::before' | '::after') =>
  page.evaluate(
    ([sel, p]) => {
      const el = document.querySelector(sel ?? '');
      if (!el) return null;
      const style = getComputedStyle(el, p) as CSSStyleDeclaration & { webkitMaskImage?: string };
      return {
        content: style.content,
        mask: style.maskImage && style.maskImage !== 'none' ? style.maskImage : (style.webkitMaskImage ?? 'none'),
        background: style.backgroundColor,
        top: style.top,
        height: style.height,
        zIndex: style.zIndex,
      };
    },
    [selector, pseudo] as const,
  );

test.describe('the result of a tool page: its waterline is the water band of the F13a', () => {
  for (const viewport of VIEWPORTS) {
    test(`Compress image at ${viewport.width}px, in both themes`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/compress-image/');
      await hydrated(page);
      await dismissCookies(page);
      await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
      const result = page.locator('.fo-result');
      await expect(result).toBeVisible({ timeout: 30_000 });
      for (const value of THEMES) {
        await theme(page, value);
        const water = await tokenColor(page, 'water');
        const deep = await tokenColor(page, 'deep');
        const shape = await page.evaluate(() => {
          const card = document.querySelector('.fo-result');
          const sea = document.querySelector('.fo-result > .fo-result__sea');
          if (!card || !sea) return null;
          const cardStyle = getComputedStyle(card);
          const wave = getComputedStyle(sea, '::before') as CSSStyleDeclaration & { webkitMaskImage?: string };
          return {
            card: cardStyle.backgroundColor,
            sea: getComputedStyle(sea).backgroundColor,
            waveMask: wave.maskImage && wave.maskImage !== 'none' ? wave.maskImage : (wave.webkitMaskImage ?? 'none'),
            waveColor: wave.backgroundColor,
            surf: sea.getBoundingClientRect().top - card.getBoundingClientRect().top - parseFloat(cardStyle.borderTopWidth),
            before: getComputedStyle(card, '::before').content,
            after: getComputedStyle(card, '::after').content,
          };
        });
        expect(shape, `${value}: the card and its sea`).not.toBeNull();
        expect(shape?.card, `${value}: the band at the top is the water`).toBe(water);
        expect(shape?.sea, `${value}: the sea under it is deep`).toBe(deep);
        expect(shape?.waveMask, `${value}: the edge of the sea is a wave`).toMatch(/url\(/);
        expect(shape?.waveColor, `${value}: the wave is the deep sea`).toBe(deep);
        expect(Math.abs((shape?.surf ?? 0) - viewport.surf), `${value}: the band is ${viewport.surf}px`).toBeLessThanOrEqual(1);
        // No second wave: the card's own pseudo-elements stay empty.
        expect(shape?.before, `${value}: no ::before on the card`).toBe('none');
        expect(shape?.after, `${value}: no ::after on the card`).toBe('none');
      }
    });
  }
});

test.describe('the footer: the wave keeps a crest of 2px in stroke', () => {
  for (const viewport of VIEWPORTS) {
    test(`the home at ${viewport.width}px, in both themes`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await dismissCookies(page);
      for (const value of THEMES) {
        await theme(page, value);
        const stroke = await tokenColor(page, 'stroke');
        const deep = await tokenColor(page, 'deep');
        const wave = await maskOf(page, '.fo-footer', '::before');
        const crest = await maskOf(page, '.fo-footer', '::after');
        expect(wave?.mask, `${value}: the wave`).toMatch(/url\(/);
        expect(wave?.background, `${value}: the wave is the deep sea`).toBe(deep);
        expect(crest?.mask, `${value}: the crest has the same wave`).toBe(wave?.mask);
        expect(crest?.background, `${value}: the crest is stroke`).toBe(stroke);
        // The crest is the same wave 2px higher, under the deep one.
        expect(parseFloat(crest?.top ?? '0'), `${value}: 2px above the wave`).toBe(parseFloat(wave?.top ?? '0') - 2);
        expect(crest?.height, value).toBe(wave?.height);
        expect(Number(wave?.zIndex), `${value}: the deep wave over the crest`).toBeGreaterThan(Number(crest?.zIndex));
      }
    });
  }
});
