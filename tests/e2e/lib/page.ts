import type { Page } from '@playwright/test';

/** Waits until the tool island is hydrated (Astro removes the ssr attribute). */
export async function hydrated(page: Page): Promise<void> {
  await page.waitForSelector('#fo-tool-root[data-hydrated="true"]', { state: 'attached' });
}

/** Accepts or declines the cookie notice so it does not cover the page in a test. */
export async function dismissCookies(page: Page, choice: 'granted' | 'denied' = 'denied'): Promise<void> {
  const button = page.locator(`#fo-cookie [data-consent="${choice}"]`);
  if (await button.isVisible()) await button.click();
}

/** dataLayer entries as plain arrays (gtag pushes `arguments` objects). */
export async function dataLayer(page: Page): Promise<unknown[][]> {
  return page.evaluate(() =>
    (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>, (value) => (value instanceof Date ? 'DATE' : value))),
  );
}

export async function downloadBytes(page: Page): Promise<Uint8Array> {
  const base64 = await page.evaluate(async () => {
    const link = document.querySelector<HTMLAnchorElement>('.fo-btn--download');
    if (!link) throw new Error('no download link');
    const bytes = new Uint8Array(await (await fetch(link.href)).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  });
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
