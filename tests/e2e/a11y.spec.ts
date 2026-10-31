import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import { animationsDone, coffeeLineInOneUse, dismissCookies, hydrated, searchWithoutResult, useImage } from './lib/page.ts';

// axe-core (WCAG 2.2 AA and best practices) on every page, at 360 and 1280px. It runs with reduced
// motion (DECISOES § 57): the site animates only transform and opacity, so the colours axe checks are
// the same, the page is still, and the run fits the 15 minutes of pnpm verificar on the CI runner.
// The motion itself is tested in design.spec.ts.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const PAGES = ROUTES.flatMap((route) => languagesOf(route).map((lang) => route.paths[lang] ?? '/'));

// F1b: the states of the tool page and of the search dialog that the page-by-page pass does not
// reach. They run in both themes at 360 and 1280px. The finite animations (the cheer jump, fades)
// are let finish first so axe reads the final colors.
async function violations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map((violation) => violation.id);
}

async function resultOnScreen(page: Page): Promise<void> {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await useImage(page);
  await animationsDone(page);
}

async function searchDialogOpen(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Search tools/ }).click();
  await expect(page.locator('#fo-search-dialog')).toBeVisible();
  await page.keyboard.type('compress');
  await expect(page.getByRole('option')).toHaveCount(1);
  await animationsDone(page);
}

async function coffeeLineOnScreen(page: Page): Promise<void> {
  await page.goto('/compress-image/');
  await hydrated(page);
  await coffeeLineInOneUse(page);
  await animationsDone(page);
}

async function searchWithoutResultOnScreen(page: Page): Promise<void> {
  await page.goto('/');
  await searchWithoutResult(page);
  await expect(page.locator('#fo-search-dialog .fo-search__peek')).toBeVisible();
  await animationsDone(page);
}

// F2 (DECISOES § 76): each page loads once per browser and axe runs at both widths and in both themes
// on that load. The site has no layout or theme decided by script at load, so resizing and switching
// prefers-color-scheme in place gives the same page a fresh load would, with the same rules and reach.
const COMBOS = [
  { width: 360, height: 740, colorScheme: 'dark' },
  { width: 360, height: 740, colorScheme: 'light' },
  { width: 1280, height: 800, colorScheme: 'dark' },
  { width: 1280, height: 800, colorScheme: 'light' },
] as const;

test.describe('axe em toda página, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of PAGES) {
    test(`${path}`, async ({ page }) => {
      const found: string[] = [];
      for (const [index, combo] of COMBOS.entries()) {
        await page.setViewportSize({ width: combo.width, height: combo.height });
        await page.emulateMedia({ colorScheme: combo.colorScheme, reducedMotion: 'reduce' });
        if (index === 0) await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        for (const violation of results.violations) {
          found.push(`${combo.width}px ${combo.colorScheme} · ${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
        }
      }
      expect(found).toEqual([]);
    });
  }
});

for (const width of [360, 1280]) {
  test.describe(`axe a ${width}px, tema escuro`, () => {
    test.use({ viewport: { width, height: width === 360 ? 740 : 800 }, colorScheme: 'dark', reducedMotion: 'reduce' });

    test('tool page with the result on screen', async ({ page }) => {
      await resultOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search dialog open', async ({ page }) => {
      await searchDialogOpen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('tool page with the coffee line on screen', async ({ page }) => {
      await coffeeLineOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search without a result (peek visible)', async ({ page }) => {
      await searchWithoutResultOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });
  });

  test.describe(`axe a ${width}px`, () => {
    test.use({ viewport: { width, height: width === 360 ? 740 : 800 }, reducedMotion: 'reduce' });

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

    test('tool page with the coffee line on screen', async ({ page }) => {
      await coffeeLineOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });

    test('search without a result (peek visible)', async ({ page }) => {
      await searchWithoutResultOnScreen(page);
      expect(await violations(page)).toEqual([]);
    });
  });
}
