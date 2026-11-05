import { expect, test, type Locator } from '@playwright/test';
import { LANGS, pagePath, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { HUB_MONEY_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { dismissCookies } from './lib/page.ts';

// F13b · as páginas institucionais (decision 8 of the run; UX-17 A, pages.html; DECISOES § I-1 to § I-4 and § I-7).
// - The 404 in the three languages: the status 404 of a missing address (and of a missing address deep in a language,
//   which the server answers with the 404 of that language), the Oli lost in the band of water, the search with no
//   shadow, the first tool of each hub of the language as a chip (read from the registries), above the fold at 360 × 740
//   in English, and no ad.
// - At 1280 px the six pages without ads keep the grid of the pages with ads (760 + 150 + 300) and put a piece of the page
//   in the right column (the sea, the card of numbers, the index); the index links lead to H2 that exist and stays in
//   sight on scroll; below 1280 the index and the Contact's card are not there.
// - The About: the card of numbers after the first paragraph, and the Oli wave beside "Orcas are dolphins".
// axe on these pages, at 360 and 1280 px in both themes, is in a11y.spec.ts (every route); the motion of the two new Olis is
// in design.spec.ts ("motion without the preference" and reduced motion); the footer is in footer-phone.spec.ts.

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });

const MISSING: Record<Lang, string> = { en: '/no-such-page-f13b/', pt: '/pt/nada-aqui/de-novo/', es: '/es/no-existe-esta/' };

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  expect(found, String(locator)).not.toBeNull();
  return found ?? { x: 0, y: 0, width: 0, height: 0 };
}

/** The first tool of the image, the PDF and the money hub of the language: its path and its name. */
function firstTools(lang: Lang): [string, string][] {
  const common = TEXTS[lang].common;
  const image = IMAGE_TOOL_IDS[0];
  const pdf = PDF_TOOL_IDS[0];
  const money = HUB_MONEY_IDS[lang][0] as RouteId & keyof typeof common.calcs;
  return [
    [pagePath(image, lang) ?? '', common.tools[image].name],
    [pagePath(pdf, lang) ?? '', common.pdf?.[pdf]?.name ?? ''],
    [pagePath(money, lang) ?? '', common.calcs[money]?.name ?? ''],
  ];
}

test.describe('the 404', () => {
  for (const lang of LANGS) {
    test(`${lang}: status 404, the Oli lost in the water, the search with only its stroke, and the first tool of each hub`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      const t = TEXTS[lang]['not-found'];
      // The server answers a missing address with the nearest 404 and its status (serve-dist, like the Worker).
      const response = await page.goto(MISSING[lang]);
      expect(response?.status(), MISSING[lang]).toBe(404);
      await expect(page.locator('h1')).toHaveText(t.h1);
      const sea = page.locator('main .fo-sea');
      await expect(sea).toHaveAttribute('aria-hidden', 'true');
      const oli = sea.locator('[data-oli="lost"]');
      await expect(oli).toHaveAttribute('aria-hidden', 'true');
      expect((await box(oli)).width).toBeGreaterThanOrEqual(128);
      expect((await box(sea)).height).toBe(176);
      // The water is in front of the Oli and still (outside the tool it is no progress).
      await expect(sea.locator('.fo-water')).toBeVisible();
      await expect(sea.locator('.fo-water--moving')).toHaveCount(0);
      // The search of the page does not float (no shadow-pop); the one of the dialog does.
      const shadows = await page.evaluate(() => ({
        inline: getComputedStyle(document.querySelector('main [data-search-inline] .fo-search')!).boxShadow,
        dialog: getComputedStyle(document.querySelector('#fo-search-dialog .fo-search')!).boxShadow,
      }));
      expect(shadows.inline).toBe('none');
      expect(shadows.dialog).not.toBe('none');
      // Three chips: the first tool of each hub of the language, from the registries.
      const chips = page.locator('main nav.fo-404__tools ul.fo-next > li > a.fo-chip');
      await expect(page.locator('main nav.fo-404__tools h2')).toHaveText(t.toolsHeading);
      expect(await chips.evaluateAll((links) => links.map((link) => [link.getAttribute('href'), (link.textContent ?? '').trim()]))).toEqual(firstTools(lang));
      for (const chip of await chips.all()) expect((await box(chip)).height).toBeGreaterThanOrEqual(48);
      expect((await box(page.locator('main .fo-404__home a'))).height).toBeGreaterThanOrEqual(48);
      expect((await box(page.locator('main [data-search-inline] .fo-search__field'))).height).toBeGreaterThanOrEqual(60);
      // In English, the H1, the line, the band, the search and the three chips are above the fold of 360 × 740.
      if (lang === 'en') expect((await box(chips.last())).y + (await box(chips.last())).height).toBeLessThanOrEqual(740);
      // A free page: no ad and no rail.
      await expect(page.locator('.fo-ad, aside')).toHaveCount(0);
      // At 768 px the band is 208 px and the Oli 160 px; at 1280 the band is the right column, 400 px at least.
      await page.setViewportSize({ width: 768, height: 1024 });
      expect((await box(sea)).height).toBe(208);
      expect((await box(oli)).width).toBe(160);
      await page.setViewportSize({ width: 1280, height: 800 });
      const main = await box(page.locator('main'));
      const column = await box(sea);
      expect(column.height).toBeGreaterThanOrEqual(400);
      expect(column.width).toBe(300);
      expect(Math.round(column.x + column.width)).toBe(Math.round(main.x + main.width));
      expect(column.x - (await box(page.locator('main .fo-404__text'))).x).toBeGreaterThanOrEqual(760 + 150 - 2);
    });
  }

  test('the 404.html of each language is served as the page itself', async ({ page }) => {
    for (const lang of LANGS) {
      const path = pagePath('not-found', lang) ?? '';
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator('main .fo-sea [data-oli="lost"]'), path).toHaveCount(1);
    }
  });
});

/** The six pages of the decision 8 and the piece of the right column of each. */
const SIDE: { id: RouteId; piece: string }[] = [
  { id: 'not-found', piece: '.fo-sea' },
  { id: 'about', piece: '.fo-stats' },
  { id: 'contact', piece: '.fo-stats' },
  { id: 'privacy', piece: '.fo-toc' },
  { id: 'terms', piece: '.fo-toc' },
  { id: 'licenses', piece: '.fo-toc' },
];

test.describe('the right column at 1280 px of the pages without ads', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  for (const { id, piece } of SIDE) {
    for (const lang of LANGS) {
      const path = pagePath(id, lang) ?? '';
      test(`${path}: the piece of the page in the right column, beside the 760 px column, and no ad`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status(), path).toBe(200);
        await dismissCookies(page);
        const main = await box(page.locator('main'));
        const side = page.locator(`main .fo-view--side > ${piece}.fo-side`);
        await expect(side).toBeVisible();
        const column = await box(side);
        // The grid of the pages with ads: the content column of 760 px at most, 150 px, and the column of 300 px.
        expect(main.width, path).toBeGreaterThan(1100);
        expect(column.width, path).toBe(300);
        expect(Math.round(column.x + column.width), path).toBe(Math.round(main.x + main.width));
        const content = await page.locator('main .fo-view--side > :not(.fo-side)').evaluateAll((blocks) => Math.max(...blocks.map((block) => block.getBoundingClientRect().right)));
        expect(column.x - content, path).toBeGreaterThanOrEqual(150 - 2);
        expect(content - main.x, path).toBeLessThanOrEqual(760);
        await expect(page.locator('.fo-ad, aside, .fo-rail')).toHaveCount(0);
        if (piece === '.fo-toc') {
          // Each link of the index leads to an H2 of the page, and is a 48 px target.
          const links = side.locator('ol > li > a');
          const hrefs = await links.evaluateAll((all) => all.map((link) => link.getAttribute('href') ?? ''));
          expect(hrefs.length, path).toBeGreaterThanOrEqual(4);
          for (const href of hrefs) await expect(page.locator(`h2${href}`), `${path} ${href}`).toHaveCount(1);
          for (const link of await links.all()) expect((await box(link)).height).toBeGreaterThanOrEqual(48);
        }
        if (piece !== '.fo-sea') {
          // Sticky: after a scroll the piece stays at the top of the screen, 20 px under it (while the page goes on).
          const tall = await page.evaluate(() => document.querySelector('main .fo-view--side')!.getBoundingClientRect().height);
          if (tall > 1400) {
            await page.evaluate(() => window.scrollTo(0, 900));
            await expect.poll(async () => Math.round((await box(side)).y), { message: `${path} sticky` }).toBe(20);
          }
        }
        // Below 1280 px the index and the Contact's card are not there; the card of the About stays in the text.
        await page.setViewportSize({ width: 1279, height: 800 });
        if (piece === '.fo-toc' || id === 'contact') await expect(side, `${path} at 1279 px`).toBeHidden();
        else await expect(side, `${path} at 1279 px`).toBeVisible();
      });
    }
  }

  test('a link of the index takes the reader to its H2', async ({ page }) => {
    await page.goto('/privacy/');
    await dismissCookies(page);
    const link = page.locator('main .fo-toc ol > li > a').nth(5);
    const href = (await link.getAttribute('href')) ?? '';
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect.poll(async () => Math.round((await box(page.locator(`h2${href}`))).y)).toBeLessThan(100);
  });
});

test.describe('the About page', () => {
  for (const lang of LANGS) {
    const path = pagePath('about', lang) ?? '';
    test(`${path}: the card of numbers after the first paragraph and the Oli wave beside the orcas`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      const card = page.locator('main section.fo-stats');
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute('aria-labelledby', 'stats-title');
      await expect(page.locator('#stats-title')).toHaveText(TEXTS[lang].about.stats.heading);
      const first = await box(page.locator('main .fo-view--about > .fo-prose').first().locator('p').first());
      const second = await box(page.locator('main .fo-view--about > .fo-prose').last().locator('p').first());
      const at = await box(card);
      expect(at.y, path).toBeGreaterThan(first.y + first.height);
      expect(at.y + at.height, path).toBeLessThan(second.y);
      // Each count reads as one phrase: the number and its label.
      await expect(card.locator('li').first()).toHaveText(new RegExp(`^\\d+ ${TEXTS[lang].about.stats.image}$`));
      const oli = page.locator('main .fo-orca [data-oli="wave"]');
      await expect(oli).toHaveAttribute('aria-hidden', 'true');
      expect((await box(oli)).width).toBe(96);
      await expect(page.locator('main .fo-orca h2')).toHaveText(TEXTS[lang].about.orcaHeading);
      await page.setViewportSize({ width: 768, height: 1024 });
      expect((await box(oli)).width).toBe(128);
    });
  }
});
