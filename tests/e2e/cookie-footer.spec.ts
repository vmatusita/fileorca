import { expect, test, type Page } from '@playwright/test';

// The cookie notice and the end of the page (DECISOES § 91). While the notice is open it reserves its
// height so the focus is never under it (§ 36), but that room belongs to the footer: the document ends
// at the footer, on the deep sea, and nothing of the body background shows below it. After Accept or
// Decline the room goes away. One load per page and browser; the width and the theme change in place,
// by prefers-color-scheme and by html[data-theme] (§ 76).

const SIZES = [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
] as const;
const THEMES = ['light', 'dark'] as const;
const HOW = ['media', 'attribute'] as const;
const PAGES = [
  { path: '/', choice: 'Accept' },
  { path: '/compress-image/', choice: 'Decline' },
  { path: '/privacy/', choice: 'Decline' },
] as const;

/** Scrolls to the end and measures what lies below the footer and how the footer meets the notice. */
async function end(page: Page) {
  return page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const footer = document.querySelector<HTMLElement>('footer.fo-footer')!;
    const base = footer.querySelector<HTMLElement>('.fo-footer__base')!;
    const notice = document.getElementById('fo-cookie')!;
    const below = Math.round(document.documentElement.scrollHeight - (footer.getBoundingClientRect().bottom + window.scrollY));
    const gap = notice.hidden ? null : Math.round(notice.getBoundingClientRect().top - base.getBoundingClientRect().bottom);
    return { below, gap, padding: getComputedStyle(footer).paddingBottom };
  });
}

/** The end of the page with the 1px of slack the rule allows (WebKit lays the footer on a subpixel). */
async function settled(page: Page) {
  const at = await end(page);
  return { ...at, below: at.below <= 1 ? 'ok' : at.below };
}

async function theme(page: Page, value: (typeof THEMES)[number], how: (typeof HOW)[number]) {
  if (how === 'media') {
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    await page.emulateMedia({ colorScheme: value });
  } else {
    // The attribute wins over the media query: the media query says the other theme.
    await page.emulateMedia({ colorScheme: value === 'dark' ? 'light' : 'dark' });
    await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), value);
  }
}

/** The page holds no leftover of the reservation. */
async function released(page: Page) {
  return page.evaluate(() => ({
    body: getComputedStyle(document.body).paddingBottom,
    scrollPadding: getComputedStyle(document.documentElement).scrollPaddingBottom,
    inline: document.documentElement.style.cssText + document.body.style.cssText,
  }));
}

for (const { path, choice } of PAGES) {
  test(`${path}: with the cookie notice open the page ends at the footer, and ${choice} takes the room away`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const notice = page.locator('#fo-cookie');
    await expect(notice).toBeVisible();
    for (const size of SIZES) {
      for (const value of THEMES) {
        for (const how of HOW) {
          await page.setViewportSize(size);
          await theme(page, value, how);
          const label = `${path} ${size.width}px ${value} (${how})`;
          // The notice re-measures itself on resize; poll until the page settles.
          await expect.poll(async () => {
            const at = await end(page);
            return { below: at.below <= 1 ? 'ok' : at.below, footerAboveNotice: at.gap !== null && at.gap >= 0 ? 'ok' : at.gap };
          }, { message: label }).toEqual({ below: 'ok', footerAboveNotice: 'ok' });
          const colours = await page.evaluate(() => ({
            footer: getComputedStyle(document.querySelector('footer.fo-footer')!).backgroundColor,
            body: getComputedStyle(document.body).backgroundColor,
          }));
          expect(colours.footer, `${label}: o rodapé é o fundo do mar`).not.toBe(colours.body);
        }
      }
    }
    await notice.getByRole('button', { name: choice }).click();
    await expect(notice).toBeHidden();
    for (const size of [SIZES[0], SIZES[2]]) {
      await page.setViewportSize(size);
      await expect.poll(() => settled(page), { message: `${path} ${size.width}px depois de ${choice}` }).toEqual({ below: 'ok', gap: null, padding: '24px' });
    }
    expect(await released(page)).toEqual({ body: '0px', scrollPadding: 'auto', inline: '' });
  });
}

// With the room in the footer, the last link of the page still gets out from under the notice when it
// takes the focus, with and without the scroll-padding (§ 36 stands for a browser that ignores it).
test('the last footer link stays above the open notice when it takes the focus', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('#fo-cookie')).toBeVisible();
  const link = page.locator('footer a').last();
  for (const size of [SIZES[0], SIZES[2]]) {
    for (const padding of ['kept', 'removed'] as const) {
      await page.setViewportSize(size);
      await page.evaluate((p) => {
        if (p === 'removed') document.documentElement.style.setProperty('scroll-padding-bottom', '0px');
        (document.activeElement as HTMLElement | null)?.blur();
        window.scrollTo(0, 0);
      }, padding);
      await link.focus();
      const at = await link.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          visible: Boolean(hit && (hit === element || element.contains(hit))),
          gap: Math.round(document.getElementById('fo-cookie')!.getBoundingClientRect().top - rect.bottom) >= 0,
        };
      });
      expect(at, `${size.width}px, scroll-padding ${padding}`).toEqual({ visible: true, gap: true });
    }
  }
});

test('with the AdSense anchor and the notice at once, the anchor is not counted twice', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.addInitScript(() => {
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
  });
  const response = await page.goto('/compress-image/');
  expect(response?.status()).toBe(200);
  await page.evaluate(() => {
    // What a build with the ads on gives the footer (Footer README: 96px for the anchor on the phone).
    document.querySelector('footer.fo-footer')!.classList.add('fo-footer--anchor');
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
  // The footer ends the page and its last line sits just above the notice: the normal 24px of room plus the
  // 8px margin of the reservation, not the 96px of the anchor on top of it.
  await expect.poll(async () => {
    const at = await end(page);
    return { below: at.below <= 1 ? 'ok' : at.below, gap: at.gap !== null && at.gap >= 0 && at.gap <= 48 ? 'ok' : at.gap };
  }).toEqual({ below: 'ok', gap: 'ok' });
  await notice.getByRole('button', { name: 'Decline' }).click();
  await expect(notice).toBeHidden();
  // With the notice gone, the anchor keeps its own room (100px + 8px): the end of the footer and the focus stay
  // above it (DECISOES § 101). When the anchor goes too, nothing is left of the reservation.
  await expect.poll(() => settled(page)).toEqual({ below: 'ok', gap: null, padding: '132px' });
  expect(await released(page)).toMatchObject({ body: '0px', scrollPadding: '108px' });
  await page.evaluate(() => document.querySelector('ins.adsbygoogle')?.remove());
  await expect.poll(() => settled(page)).toEqual({ below: 'ok', gap: null, padding: '96px' });
  expect(await released(page)).toEqual({ body: '0px', scrollPadding: 'auto', inline: '' });
});

// The AdSense anchor covers the bottom of the screen with or without the notice: no element that takes the
// keyboard focus may end up under it (WCAG 2.4.11, DECISOES § 101). Same walk as the 45 Tabs of events.spec.ts.
test('the AdSense anchor never covers the keyboard focus, with the notice already closed', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.addInitScript(() => {
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
    localStorage.setItem('fo-consent', 'denied');
  });
  const response = await page.goto('/compress-image/');
  expect(response?.status()).toBe(200);
  await page.evaluate(() => {
    document.querySelector('footer.fo-footer')!.classList.add('fo-footer--anchor');
    const anchor = document.createElement('ins');
    anchor.className = 'adsbygoogle';
    anchor.setAttribute('data-anchor-status', 'displayed');
    anchor.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:100px;display:block;z-index:30';
    document.body.append(anchor);
  });
  await expect(page.locator('#fo-cookie')).toBeHidden();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingBottom)).toBe('108px');
  for (let i = 0; i < 45; i += 1) {
    await page.keyboard.press('Tab');
    const covered = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit && (hit === element || element.contains(hit) || hit.contains(element)) ? null : `${element.tagName} ${element.textContent?.trim().slice(0, 40)}`;
    });
    expect(covered, 'foco coberto pela âncora').toBeNull();
  }
});
