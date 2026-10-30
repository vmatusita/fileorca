import { expect, test, type Page } from '@playwright/test';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';

// donate_click, next_step_click and the cookie notice, end to end.

async function lastEvent(page: Page, name: string) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === name).at(-1);
}

test('the footer coffee link sends donate_click with place footer and the language', async ({ page }) => {
  await page.goto('/pt/sobre/');
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await page.locator('footer').getByRole('link', { name: 'Curtiu? Me paga um café' }).click();
  expect(await lastEvent(page, 'donate_click')).toEqual(['event', 'donate_click', { lang: 'pt', place: 'footer' }]);
});

test('the support page button links to Ko-fi without any Ko-fi script and sends donate_click', async ({ page }) => {
  await page.goto('/support/');
  const button = page.getByRole('link', { name: 'Support with a coffee' });
  await expect(button).toHaveAttribute('href', 'https://ko-fi.com/victormatusita');
  expect(await page.locator('script[src*="ko-fi"], iframe[src*="ko-fi"]').count()).toBe(0);
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await button.click();
  expect(await lastEvent(page, 'donate_click')).toEqual(['event', 'donate_click', { lang: 'en', place: 'support_page' }]);
});

test('the next-step chip sends next_step_click', async ({ page }) => {
  await page.goto('/es/comprimir-imagen/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', 'fixtures/images/jpg-02-iphone6-paisagem-gps.jpg');
  const chip = page.locator('nav.fo-next a.fo-chip');
  await expect(chip).toHaveAttribute('href', '/es/');
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await chip.click();
  expect(await lastEvent(page, 'next_step_click')).toEqual(['event', 'next_step_click', { tool: 'compress-image', lang: 'es', target: 'home' }]);
});

test('the cookie notice has Decline first, two neutral buttons and no yellow', async ({ page }) => {
  await page.goto('/');
  const buttons = page.locator('#fo-cookie button');
  await expect(buttons).toHaveText(['Decline', 'Accept']);
  for (const button of await buttons.all()) {
    await expect(button).toHaveClass('fo-btn');
  }
  await expect(page.locator('#fo-cookie')).toHaveAttribute('role', 'dialog');
});

test('the cookie notice rises above the AdSense anchor instead of covering it', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.addInitScript(() => {
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
  });
  await page.goto('/compress-image/');
  await page.evaluate(() => {
    const anchor = document.createElement('ins');
    anchor.className = 'adsbygoogle';
    anchor.setAttribute('data-anchor-status', 'displayed');
    anchor.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:100px;display:block';
    document.body.append(anchor);
  });
  const notice = page.locator('#fo-cookie');
  await expect.poll(async () => {
    const box = await notice.boundingBox();
    return box ? box.y + box.height : 9999;
  }).toBeLessThanOrEqual(740 - 100);
});

test('the cookie notice never covers the keyboard focus (WCAG 2.4.11)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/', '/compress-image/']) {
    await page.goto(path);
    await expect(page.locator('#fo-cookie')).toBeVisible();
    for (let i = 0; i < 45; i += 1) {
      await page.keyboard.press('Tab');
      const covered = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body || element.closest('#fo-cookie')) return null;
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return hit && (hit === element || element.contains(hit) || hit.contains(element)) ? null : `${element.tagName} ${element.textContent?.trim().slice(0, 40)}`;
      });
      expect(covered, `${path}: foco coberto`).toBeNull();
    }
  }
});

test('the search dialog has a visible close button', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('button', { name: /Buscar ferramentas/ }).click();
  const dialog = page.locator('#fo-search-dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();
});
