import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import { dismissCookies, hydrated } from './lib/page.ts';

// axe-core (WCAG 2.2 AA and best practices) on every page, at 360 and 1280px.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const PAGES = ROUTES.flatMap((route) => languagesOf(route).map((lang) => route.paths[lang] ?? '/'));

for (const width of [360, 1280]) {
  test.describe(`axe a ${width}px`, () => {
    test.use({ viewport: { width, height: width === 360 ? 740 : 800 } });

    for (const path of PAGES) {
      test(`${path}`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual([]);
      });
    }

    test('tool page with the result on screen', async ({ page }) => {
      await page.goto('/compress-image/');
      await hydrated(page);
      await dismissCookies(page);
      await page.setInputFiles('input[type="file"]', 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg');
      await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    test('search dialog open', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Search tools/ }).click();
      await expect(page.locator('#fo-search-dialog')).toBeVisible();
      await page.keyboard.type('compress');
      await expect(page.getByRole('option')).toHaveCount(1);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
  });
}
