import { expect, test, type Page } from '@playwright/test';
import enSupport from '../../src/i18n/en/support.ts';
import esSupport from '../../src/i18n/es/support.ts';
import ptSupport from '../../src/i18n/pt/support.ts';
import enCommon from '../../src/i18n/en/common.ts';
import esCommon from '../../src/i18n/es/common.ts';
import ptCommon from '../../src/i18n/pt/common.ts';
import ptPdfPanel from '../../src/tools/pdf/i18n/pt.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { chooseImages, dataLayer, dismissCookies, hydrated, jpegBatch, nextUse, openAdjust, reachCoffeeLine, settle, useBadFile, useImage } from './lib/page.ts';
import { choosePdfs, pdfFile } from './lib/pdf-tools.ts';

// F1b criterion 12: the coffee line of the ResultCard and the support page.
// Rule (PLANO "Doações", F1b decision 10; F2 decision 4): a "use" is a batch that reached the result card with at
// least one real output (a file written anew: smaller, converted, turned...), one count for every image tool. With the
// cookie choice "granted" each use is counted in localStorage 'fo-coffee' = {uses, shownAt?, never?}.
// The line shows from the 3rd use and then at most once every 7 days; showing sets shownAt. Without
// the choice, or after Decline, nothing is written and the line never shows. "Don't show this again"
// writes never:true always.

const DAY = 24 * 60 * 60 * 1000;
const KOFI = 'https://ko-fi.com/victormatusita';
const LINE = '.fo-result .fo-result__support';

// F12 (decision 7; DECISOES § 441): the buttons of PLANO-MELHORIAS section C and the confirmation of the specification.
const LANGS = [
  { lang: 'en', tool: '/compress-image/', link: 'Buy me a coffee', hide: "Don't show this again", href: KOFI, done: "Got it, I won't ask here again. The coffee link stays in the footer." },
  // Portuguese: the Pix block of the support page since the F6 (PLANO "Doações"; DECISOES § 216), one button only (§ 368).
  { lang: 'pt', tool: '/pt/comprimir-imagem/', link: 'Pagar um café no Pix', hide: 'Não mostrar de novo', href: '/pt/apoie/#pix', done: 'Combinado, não peço mais aqui. O link do café fica no rodapé.' },
  { lang: 'es', tool: '/es/comprimir-imagen/', link: 'Ayúdame con un café', hide: 'No mostrar de nuevo', href: KOFI, done: 'Entendido, no vuelvo a pedirlo aquí. El enlace del café queda en el pie de página.' },
] as const;
const DONE = '.fo-result .fo-result__support--done';

interface CoffeeState {
  uses: number;
  shownAt?: number;
  never?: true;
}

async function coffee(page: Page): Promise<CoffeeState | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('fo-coffee');
    return raw === null ? null : (JSON.parse(raw) as CoffeeState);
  });
}

/**
 * Opens a tool page. With `clock`, Playwright's clock is installed before the page loads: it keeps
 * running in real time (timers, animation frames and the engine work as usual), and skipDays moves
 * only the wall time, as a person changing the date would.
 */
async function open(page: Page, path: string, clock = false): Promise<void> {
  if (clock) await page.clock.install();
  await page.goto(path);
  await hydrated(page);
}

/** setSystemTime shifts Date without firing timers and without pausing the clock (unlike pauseAt). */
async function skipDays(page: Page, days: number): Promise<void> {
  const now = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(now + days * DAY);
}

async function lastEvent(page: Page, name: string) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === name).at(-1);
}

/** Cancels link navigation (document-level listener, as events.spec does) and can undo it. */
async function blockLinks(page: Page, on: boolean): Promise<void> {
  await page.evaluate((block) => {
    const holder = window as unknown as { __stop?: (event: Event) => void };
    if (block) {
      holder.__stop = (event) => event.preventDefault();
      document.addEventListener('click', holder.__stop);
    } else if (holder.__stop) {
      document.removeEventListener('click', holder.__stop);
    }
  }, on);
}

test.describe('coffee line rules (English)', () => {
  test('not on the 1st or 2nd use, on the 3rd, not again the same day, and again after 7 days', async ({ page }) => {
    const start = Date.now();
    await open(page, '/compress-image/', true);
    await dismissCookies(page, 'granted');
    const line = page.locator(LINE);

    await useImage(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 1 });

    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 2 });

    await nextUse(page);
    await expect(line).toBeVisible();
    const third = await coffee(page);
    expect(third).toMatchObject({ uses: 3 });
    expect(third?.never).toBeUndefined();
    const shownAt = third?.shownAt ?? 0;
    expect(shownAt).toBeGreaterThanOrEqual(start);
    expect(shownAt).toBeLessThanOrEqual(Date.now() + 1000);
    // Download is still there, before the line.
    await expect(page.locator('.fo-btn--download')).toBeVisible();

    // 4th use, same day: hidden, and shownAt does not move.
    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 4, shownAt });

    // 6 days later is still inside the 7 days.
    await skipDays(page, 6);
    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toEqual({ uses: 5, shownAt });

    // A day and an hour more makes it 7 days since the line showed: it shows again and shownAt moves.
    await skipDays(page, 1 + 1 / 24);
    await nextUse(page);
    await expect(line).toBeVisible();
    const again = await coffee(page);
    expect(again?.uses).toBe(6);
    expect(again?.shownAt ?? 0).toBeGreaterThanOrEqual(shownAt + 7 * DAY);
  });

  test('a batch is one use however many files it has, an option re-run is not another, and a batch with nothing written is none', async ({ page }) => {
    await open(page, '/compress-image/', true);
    await dismissCookies(page, 'granted');
    await chooseImages(page, await jpegBatch(page, 4));
    await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-btn--download')).toBeFocused();
    expect(await coffee(page)).toEqual({ uses: 1 });
    // The level changes and the whole batch is processed again: the same use. F13a: the level is folded under "Adjust".
    await openAdjust(page);
    await page.locator('label.fo-seg__opt', { has: page.locator('input[value="strong"]') }).click();
    await settle(page, 1500);
    await expect(page.locator('.fo-result')).toBeVisible();
    expect(await coffee(page)).toEqual({ uses: 1 });
    // A batch of which no file could be read is no use.
    await page.getByRole('button', { name: 'Start over' }).click();
    await useBadFile(page);
    await settle(page);
    expect(await coffee(page)).toEqual({ uses: 1 });
  });

  test('"Don\'t show this again" hides the line at once, is stored and holds after 7 days and a reload', async ({ page }) => {
    await open(page, '/compress-image/', true);
    await reachCoffeeLine(page);
    const line = page.locator(LINE);
    await line.getByRole('button', { name: "Don't show this again" }).click();
    await expect(line).toBeHidden();
    await expect(page.locator('.fo-btn--download')).toBeVisible();
    expect(await coffee(page)).toMatchObject({ uses: 3, never: true });

    await skipDays(page, 8);
    await nextUse(page);
    await settle(page);
    await expect(line).toHaveCount(0);

    await page.reload();
    await hydrated(page);
    await useImage(page);
    await settle(page);
    await expect(line).toHaveCount(0);
    expect(await coffee(page)).toMatchObject({ never: true });
  });

  test('"Don\'t show this again" is stored even if the cookie choice was withdrawn meanwhile', async ({ page }) => {
    await open(page, '/compress-image/');
    await reachCoffeeLine(page);
    await page.evaluate(() => localStorage.setItem('fo-consent', 'denied'));
    await page.locator(LINE).getByRole('button', { name: "Don't show this again" }).click();
    await expect(page.locator(LINE)).toBeHidden();
    expect(await coffee(page)).toMatchObject({ never: true });
  });

  test('Decline after the line showed erases the count and stops the line, even 8 days later', async ({ page }) => {
    await open(page, '/compress-image/', true);
    await reachCoffeeLine(page);
    expect(await coffee(page)).toMatchObject({ uses: 3 });

    await page.goto('/privacy/');
    await page.getByRole('button', { name: 'Change my cookie choice' }).click();
    await page.locator('#fo-cookie').getByRole('button', { name: 'Decline' }).click();

    // Consent withdrawn: the tool page erases the count as soon as it loads (DECISOES § 49).
    await open(page, '/compress-image/');
    expect(await coffee(page)).toBeNull();
    await skipDays(page, 8);
    await useImage(page);
    await settle(page);
    await expect(page.locator(LINE)).toHaveCount(0);
    expect(await coffee(page)).toBeNull();
  });
});

for (const choice of ['no choice', 'Decline'] as const) {
  test(`${choice}: four uses never show the line and nothing is stored`, async ({ page }) => {
    await open(page, '/compress-image/');
    if (choice === 'Decline') await dismissCookies(page, 'denied');
    await useImage(page);
    for (let use = 2; use <= 4; use += 1) {
      await settle(page);
      await expect(page.locator(LINE)).toHaveCount(0);
      await nextUse(page);
    }
    await settle(page);
    await expect(page.locator(LINE)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('fo-coffee'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('fo-consent'))).toBe(choice === 'Decline' ? 'denied' : null);
  });
}

test('uses before the Accept are not counted: the count starts when the choice is granted', async ({ page }) => {
  await open(page, '/compress-image/');
  await useImage(page);
  await nextUse(page);
  await settle(page);
  expect(await page.evaluate(() => localStorage.getItem('fo-coffee'))).toBeNull();
  await dismissCookies(page, 'granted');
  await nextUse(page);
  await settle(page);
  await expect(page.locator(LINE)).toHaveCount(0);
  expect(await coffee(page)).toEqual({ uses: 1 });
  await nextUse(page);
  await settle(page);
  await expect(page.locator(LINE)).toHaveCount(0);
  expect(await coffee(page)).toEqual({ uses: 2 });
  await nextUse(page);
  await expect(page.locator(LINE)).toBeVisible();
});

for (const { lang, tool, link, hide, href } of LANGS) {
  test(`${lang}: texts, placement, link target and donate_click with place result`, async ({ page }) => {
    await open(page, tool);
    await reachCoffeeLine(page);
    const line = page.locator(LINE);
    const anchor = line.getByRole('link', { name: link });
    await expect(anchor).toHaveAttribute('href', href);
    await expect(line.getByRole('button', { name: hide })).toBeVisible();

    // One short paragraph that does not repeat the Oli's "Done!" (one exclamation per screen).
    const text = (await line.locator('p').first().textContent())?.trim() ?? '';
    expect(text.length, 'coffee line text').toBeGreaterThan(20);
    expect(text).not.toMatch(/[!¡]/);

    // Below the actions (so after Download), never in place of it, and a secondary button (not the sun one).
    expect(
      await line.evaluate((node) => {
        const actions = document.querySelector('.fo-result__actions');
        return !!actions && !!(actions.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
      }),
    ).toBe(true);
    await expect(page.locator('.fo-btn--download')).toBeVisible();
    await expect(anchor).toHaveClass(/(^|\s)fo-btn(\s|$)/);
    await expect(anchor).not.toHaveClass(/fo-btn--(download|brand)/);

    await blockLinks(page, true);
    await anchor.click();
    expect(await lastEvent(page, 'donate_click')).toEqual(['event', 'donate_click', { lang, place: 'result' }]);
    if (lang === 'pt') {
      // The Portuguese button goes to the Pix block of the support page (F6, decision 8; DECISOES § 216).
      await blockLinks(page, false);
      await anchor.click();
      await expect(page).toHaveURL(/\/pt\/apoie\/#pix$/);
      await expect(page.locator('#pix')).toBeInViewport();
    }
  });
}

/** The confirmation stands where the line stood: inside the card, after Download and Start over. */
async function afterTheActions(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).evaluate((node) => {
    const actions = node.closest('.fo-result')?.querySelector('.fo-result__actions');
    return !!actions && !!(actions.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
}

// F12 (decision 7; DECISOES § 436): the card carries one coffee button (in Portuguese, the Pix one: § 368), and "Don't
// show this again" leaves one quiet sentence in the place of the line, a status that a screen reader reads once, with the
// focus back on Download. Before, the line just went away. axe on the card with the sentence, at 360 and 1280 px, in both
// themes (the line itself is in a11y.spec.ts).
for (const { lang, tool, link, hide, href, done } of LANGS) {
  test(`${lang}: one coffee button, and "${hide}" leaves the confirmation as a status in its place, with the focus on Download`, async ({ page }) => {
    await open(page, tool);
    await reachCoffeeLine(page);
    const line = page.locator(LINE);
    await expect(line.getByRole('link')).toHaveCount(1);
    await expect(line.getByRole('link')).toHaveText(link);
    await expect(line.getByRole('link')).toHaveAttribute('href', href);
    await expect(line.getByRole('button')).toHaveCount(1);
    // Enter on the ghost (WebKit gives no focus to a button on click: the keyboard path is the one of the specification).
    await line.getByRole('button', { name: hide }).focus();
    await page.keyboard.press('Enter');
    await expect(line).toHaveCount(0);
    const confirmation = page.locator(DONE);
    await expect(confirmation).toHaveText(done);
    await expect(confirmation).toHaveAttribute('role', 'status');
    await expect(page.getByRole('status').filter({ hasText: done })).toHaveCount(1);
    await expect(page.locator('.fo-btn--download')).toBeFocused();
    expect(await afterTheActions(page, DONE), 'the sentence stands after Download and Start over').toBe(true);
    await expect(page.locator(`.fo-result a[href="${href}"]`)).toHaveCount(0);
    expect(await coffee(page)).toMatchObject({ uses: 3, never: true });
    expect(await violationsEverywhere(page)).toEqual([]);
  });
}

test('pt, a PDF tool: the line on the 3rd use with the Pix button alone, and the confirmation with the focus on Download', async ({ page }) => {
  const coffeeTexts = ptPdfPanel.result.coffee;
  expect((await page.goto('/pt/girar-pdf/'))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page, 'granted');
  await page.evaluate(() => localStorage.setItem('fo-coffee', JSON.stringify({ uses: 2 })));
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  const line = page.locator(LINE);
  await expect(line).toBeVisible({ timeout: 30_000 });
  await expect(line.locator('p').first()).toHaveText(coffeeTexts.text);
  await expect(line.getByRole('link')).toHaveCount(1);
  await expect(line.getByRole('link', { name: coffeeTexts.button })).toHaveAttribute('href', '/pt/apoie/#pix');
  await line.getByRole('button', { name: coffeeTexts.hide }).focus();
  await page.keyboard.press('Enter');
  await expect(line).toHaveCount(0);
  await expect(page.locator(DONE)).toHaveText(coffeeTexts.done);
  await expect(page.locator(DONE)).toHaveAttribute('role', 'status');
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeFocused();
  expect(await afterTheActions(page, DONE)).toBe(true);
  expect(await coffee(page)).toMatchObject({ uses: 3, never: true });
});

// F12 (decision 7; DECISOES § 437, which closes the F10 p-6): the coffee line opens the footer, the first thing in it and
// its first link, with a 48 px target. At the base it sat 24 to 46 px from the AdSense anchor with the page scrolled to the
// end. Here the anchor is drawn as the page gets it with the ads on (the footer's --anchor room and a 100 px band at the
// bottom, as cookie-footer.spec.ts does), and the line stays 150 px or more from it, at 360 and 1280 px.
const FOOTERS = [
  { path: '/about/', text: enCommon.footer.coffee, href: '/support/' },
  { path: '/pt/sobre/', text: ptCommon.footer.coffee, href: '/pt/apoie/' },
  { path: '/es/acerca-de/', text: esCommon.footer.coffee, href: '/es/apoyo/' },
  { path: '/compress-image/', text: enCommon.footer.coffee, href: '/support/' },
] as const;

for (const { path, text, href } of FOOTERS) {
  test(`footer ${path}: the coffee line opens the footer with a 48 px target, 150 px or more from the anchor`, async ({ page }) => {
    for (const size of [{ width: 360, height: 740 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(size);
      expect((await page.goto(path))?.status(), path).toBe(200);
      await dismissCookies(page);
      const label = `${path} a ${size.width} px`;
      const link = page.locator('footer.fo-footer a').first();
      await expect(link, label).toHaveText(text);
      await expect(link, label).toHaveAttribute('href', href);
      await expect(link, label).toHaveClass(/(^|\s)fo-footer__coffee(\s|$)/);
      await expect(link, label).toHaveAttribute('data-track-place', 'footer');
      const at = await page.evaluate(() => {
        const footer = document.querySelector<HTMLElement>('footer.fo-footer')!;
        footer.classList.add('fo-footer--anchor');
        const band = document.createElement('ins');
        band.className = 'adsbygoogle';
        band.setAttribute('data-anchor-status', 'displayed');
        band.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:100px;display:block';
        document.body.append(band);
        return new Promise<{ first: boolean; above: boolean; height: number; gap: number }>((done) => {
          // A frame for the room of the anchor (the script of the cookie notice watches it), then the end of the page.
          setTimeout(() => {
            window.scrollTo(0, document.documentElement.scrollHeight);
            requestAnimationFrame(() => {
              const row = footer.querySelector('.fo-footer__coffee-row')!;
              const anchor = row.querySelector('a')!.getBoundingClientRect();
              const columns = footer.querySelector('.fo-footer__cols')!.getBoundingClientRect();
              done({
                first: footer.firstElementChild === row,
                above: row.getBoundingClientRect().bottom <= columns.top,
                height: anchor.height,
                gap: band.getBoundingClientRect().top - anchor.bottom,
              });
            });
          }, 300);
        });
      });
      expect(at.first, `${label}: the first thing of the footer`).toBe(true);
      expect(at.above, `${label}: above the columns`).toBe(true);
      expect(at.height, `${label}: the target`).toBeGreaterThanOrEqual(48);
      expect(at.gap, `${label}: from the anchor`).toBeGreaterThanOrEqual(150);
      console.log(`[café] rodapé ${label}: alvo de ${at.height.toFixed(1)} px, ${Math.round(at.gap)} px até a âncora de 100 px`);
    }
  });
}

const SUPPORT = [
  { path: '/support/', texts: enSupport, crumb: enCommon.header.support },
  { path: '/pt/apoie/', texts: ptSupport, crumb: ptCommon.header.support },
  { path: '/es/apoyo/', texts: esSupport, crumb: esCommon.header.support },
];

// F12 (decision 7; DECISOES § 438): the title and the text of section C, the Oli to the right of the title in the same
// row, looking at the text (she sat above it on the phone and in a column of her own from 768 px), and the last crumb is
// the name of the Menu row.
for (const { path, texts, crumb } of SUPPORT) {
  test(`support page ${path}: the Oli to the right of the title, at 360 and 1280 px, and the crumb of the Menu row`, async ({ page }) => {
    for (const size of [{ width: 360, height: 740 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(size);
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator('.fo-support > p').first()).toHaveText(texts.body);
      await expect(page.locator('.fo-crumbs [aria-current="page"]')).toHaveText(crumb);
      const title = await page.locator('.fo-support h1').boundingBox();
      const oli = await page.locator('.fo-support [data-oli="coffee"]').boundingBox();
      expect(title && oli, path).toBeTruthy();
      if (!title || !oli) continue;
      const label = `${path} a ${size.width} px`;
      expect(oli.x, `${label}: the Oli starts where the title ends`).toBeGreaterThanOrEqual(title.x + title.width);
      expect(oli.y < title.y + title.height && title.y < oli.y + oli.height, `${label}: in the row of the title`).toBe(true);
      expect(oli.width, `${label}: the size of the Oli`).toBe(size.width < 768 ? 96 : 128);
    }
  });
}

for (const { path, texts } of SUPPORT) {
  test(`support page ${path}: card title as H1, the coffee Oli, the Ko-fi link and no other origin`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
    const foreign: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol !== 'data:' && url.protocol !== 'blob:' && url.origin !== origin) foreign.push(request.url());
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('.fo-support h1')).toHaveText(texts.h1);
    const oli = page.locator('.fo-support [data-oli="coffee"]');
    await expect(oli).toBeVisible();
    await expect(oli).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator(`.fo-support a[href="${KOFI}"]`).first()).toBeVisible();
    expect(foreign).toEqual([]);
  });
}
