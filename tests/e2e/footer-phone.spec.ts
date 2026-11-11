import { expect, test, type Locator, type Page } from '@playwright/test';
import { LANGS, QR_ID, moneyHubId, pagePath, pathFor, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { HEALTH_HUB_ID, HOME_MONEY_IDS, HOUSE_HUB_ID, LIFE_HUB_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';
import { describedViolations } from './lib/axe.ts';
import { dismissCookies } from './lib/page.ts';

// F13b · o rodapé no celular (decision 8 of the run; UX-17 A, pages.html; DECISOES § 587 and § 589). Below 768 px the footer
// has two columns, each category with its hub in sight and its tools in a <details>; from 768 px it is the footer of
// before. At 360 px it is at most half the height of the starting point in the three languages, its links in sight (the
// coffee line, the hubs, "All guides", the QR code and the FileOrca links) and its summaries have 48 px, and the tools of an
// open list keep the 32 px line of before (the exception b-04 of § 381). From 768 px it shows the same links, in the same
// order, as the starting point (the list of the registries, which this file checks against the dist of the starting point
// too), all in sight, with no summary. axe on it at 360 px, a disclosure closed and open, in both themes.

test.use({ reducedMotion: 'reduce', serviceWorkers: 'block' });

/** The footer at 360 px in the dist of the starting point (bd844ca, .cache/f13b/antes/measure.json): 2,118, 1,572 and 1,606 px. */
const FOOTER_BEFORE: Record<Lang, number> = { en: 2118, pt: 1572, es: 1606 };

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  expect(found, String(locator)).not.toBeNull();
  return found ?? { x: 0, y: 0, width: 0, height: 0 };
}

/** The links of the footer as the starting point had them, in order (they come from the registries). */
function footerLinks(lang: Lang): string[] {
  const guidesHub = pagePath(GUIDES_HUB_ID, lang) ?? '';
  const exists = (ids: readonly string[]) => ids.flatMap((id) => pagePath(id as RouteId, lang) ?? []);
  return [
    pathFor('support', lang),
    routeById('image-tools').paths[lang] ?? '', ...exists(IMAGE_TOOL_IDS),
    pagePath(PDF_HUB_ID, lang) ?? '', ...exists(PDF_TOOL_IDS.slice(0, 6)),
    pagePath(moneyHubId(lang), lang) ?? '', ...exists(HOME_MONEY_IDS[lang]),
    ...(lang === 'en' ? [pagePath(HOUSE_HUB_ID, 'en') ?? '', ...exists(LIFE_HUB_IDS.house), pagePath(HEALTH_HUB_ID, 'en') ?? '', ...exists(LIFE_HUB_IDS.health)] : []),
    pagePath(QR_ID, lang) ?? '',
    guidesHub, ...(lang === 'pt' ? ['image', 'pdf'] : ['image', 'pdf', 'money']).map((group) => `${guidesHub}#${group}`),
    ...(['about', 'privacy', 'terms', 'licenses', 'contact'] as const).map((id) => pathFor(id, lang)),
  ];
}

/** The footer of the home of a language, scrolled into view, with the cookie notice closed. */
async function footerAt(page: Page, lang: Lang, width: number): Promise<Locator> {
  await page.setViewportSize({ width, height: width < 768 ? 740 : 900 });
  await page.goto(pagePath('home', lang) ?? '/');
  await dismissCookies(page);
  await page.evaluate(() => document.fonts.ready);
  const footer = page.locator('footer.fo-footer');
  await footer.scrollIntoViewIfNeeded();
  return footer;
}

test.describe('the footer on the phone: the hub in sight and the tools in a disclosure', () => {
  for (const lang of LANGS) {
    test(`${lang} at 360 px: at most half the height of before, 48 px links in sight and the 32 px line in an open list`, async ({ page }) => {
      const footer = await footerAt(page, lang, 360);
      const height = (await box(footer)).height;
      expect(height, `${lang}: ${height} px, before ${FOOTER_BEFORE[lang]}`).toBeLessThanOrEqual(FOOTER_BEFORE[lang] / 2);
      // Two columns.
      expect(await footer.locator('.fo-footer__cols').evaluate((cols) => getComputedStyle(cols).gridTemplateColumns.split(' ').length)).toBe(2);
      // In sight and 48 px: the coffee line, the hub of each category and "All guides", the QR code and the FileOrca links.
      const inSight = footer.locator('.fo-footer__coffee, .fo-footer__hub, .fo-footer__solo a, .fo-footer__col--site a, summary');
      // en: the coffee, 6 hubs ("All guides" one of them), 6 summaries, the QR code and 5 FileOrca links; pt and es: 1, 4, 4, 1, 5.
      expect(await inSight.count()).toBe(lang === 'en' ? 19 : 15);
      for (const link of await inSight.all()) expect((await box(link)).height, (await link.textContent()) ?? '').toBeGreaterThanOrEqual(48);
      // The tools are in closed disclosures; opened, each tool keeps the 32 px line of before (§ 381, b-04).
      const first = footer.locator('details.fo-footer__tools').first();
      await expect(first.locator('li a').first()).toBeHidden();
      await first.locator('summary').click();
      await expect(first).toHaveAttribute('open', '');
      const lines = await first.locator('li').evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().height)));
      expect(lines.every((line) => line % 32 === 0 && line >= 32), lines.join(',')).toBe(true);
      expect(lines.filter((line) => line === 32).length).toBeGreaterThanOrEqual(lines.length - 2);
      await expect(first.locator('li a').first()).toBeVisible();
      expect(height).toBeLessThan((await box(footer)).height);
    });

    test(`${lang}: each summary is a native button whose name starts with what it shows`, async ({ page }) => {
      const footer = await footerAt(page, lang, 360);
      const common = TEXTS[lang].common.footer;
      const summary = footer.locator('details.fo-footer__tools > summary').first();
      const shown = (await summary.locator(':scope > span').evaluate((span) => span.firstChild?.textContent ?? '')).trim();
      // F17 (DECISOES § 716): the ten image tools of the registry (eight before AVIF to JPG and Convert to WebP). F18 (DECISOES
      // § 743): eleven, with Remove EXIF data (a preset is no tool: Flip image does not count).
      expect(shown).toBe(common.tools.all.replace('{n}', '11'));
      await expect(summary).toHaveAccessibleName(`${shown} ${common.tools.image}`);
      // Enter and Space open and close it (the details of the browser, no script).
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(footer.locator('details.fo-footer__tools').first()).toHaveAttribute('open', '');
      await page.keyboard.press('Space');
      await expect(footer.locator('details.fo-footer__tools').first()).not.toHaveAttribute('open', '');
    });

    for (const width of [768, 1280]) {
      test(`${lang} at ${width} px: the footer of before, the same links in the same order, all in sight`, async ({ page }) => {
        const footer = await footerAt(page, lang, width);
        const hrefs = await footer.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
        expect(hrefs).toEqual(footerLinks(lang));
        for (const link of await footer.locator('a').all()) await expect(link).toBeVisible();
        for (const summary of await footer.locator('summary').all()) await expect(summary).toBeHidden();
        // The hub sits on the 32 px line it had as the first item of the list, 2 px above the first tool.
        for (const hub of await footer.locator('.fo-footer__hub').all()) {
          const at = await box(hub);
          expect(Math.round(at.height) % 32, (await hub.textContent()) ?? '').toBe(0);
          const next = await box(hub.locator('xpath=following-sibling::details[1]').locator('li').first());
          expect(Math.round(next.y - (at.y + at.height))).toBe(2);
        }
      });
    }
  }

  test('axe at 360 px, with the disclosures closed and with one open, in both themes', async ({ page }) => {
    const found: string[] = [];
    for (const lang of LANGS) {
      const footer = await footerAt(page, lang, 360);
      for (const colorScheme of ['dark', 'light'] as const) {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        found.push(...(await describedViolations(page, `${lang} ${colorScheme} fechado`)));
        await footer.locator('details.fo-footer__tools > summary').first().click();
        await expect(footer.locator('details.fo-footer__tools').first()).toHaveAttribute('open', '');
        found.push(...(await describedViolations(page, `${lang} ${colorScheme} aberto`)));
        await footer.locator('details.fo-footer__tools > summary').first().click();
      }
    }
    expect(found).toEqual([]);
  });
});
