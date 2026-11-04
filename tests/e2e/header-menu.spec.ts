// The header rendered (F11, decision 10b and criteria 1, 5 and 7; DECISOES § 388 and § 391). One page per mold and per
// language, at 320, 360 and 1280 px, in both browsers: the Menu opens by click and by keyboard, the sheet leads to the
// guides hub and to each category hub of the language, under 768 px the language at the end of the sheet leads to the
// equivalent page, Esc closes it and gives the focus back to the button, the header keeps 64 px and one line. Then the
// measures of criterion 7: 64 px and one line at 320, 360, 390, 412, 768, 1024 and 1280 px in the three languages, with
// Figtree held and released; at 1280 px the controls 150 px or more from the rail, which starts 150 px under the header;
// the 48 px targets. The measures are printed ([header] lines) for the table of the report. Last, the header and the
// footer share their edges at every width, on a page with the rail and on one without (DECISOES § 409).
import { expect, test, type Browser, type Page } from '@playwright/test';
import { LANGS, routeById, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { MOLD_PAGES, expectedLanguages, expectedSheet } from './lib/header.ts';
import { dismissCookies, hydrated } from './lib/page.ts';

const WIDTHS = [320, 360, 1280] as const;
const ALL_WIDTHS = [320, 360, 390, 412, 768, 1024, 1280] as const;
const FIGTREE = /figtree[^/]*\.woff2$/;

/** The header now: its height, whether every visible control sits on one line, and whether anything overflows it. */
async function headerBox(page: Page): Promise<{ height: number; tops: number[]; bottoms: number[]; overflow: number; controls: { name: string; left: number; right: number; width: number; height: number }[]; inner: number; gap: number }> {
  return page.evaluate(() => {
    const header = document.querySelector<HTMLElement>('.fo-header');
    if (!header) throw new Error('no header');
    const style = getComputedStyle(header);
    const controls = [...header.querySelectorAll<HTMLElement>(':scope > a, :scope > button')]
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0)
      .map(({ element, rect }) => ({ name: element.className.split(' ')[0] ?? '', left: rect.left, right: rect.right, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom }));
    return {
      height: header.getBoundingClientRect().height,
      tops: controls.map((control) => control.top),
      bottoms: controls.map((control) => control.bottom),
      overflow: header.scrollWidth - header.clientWidth,
      controls: controls.map(({ name, left, right, width, height }) => ({ name, left, right, width, height })),
      inner: header.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight),
      gap: Number.parseFloat(style.columnGap),
    };
  });
}

async function expectOneLine(page: Page, label: string): Promise<Awaited<ReturnType<typeof headerBox>>> {
  const box = await headerBox(page);
  expect(box.height, `${label}: the header is 64 px tall`).toBe(64);
  expect(Math.max(...box.tops) - Math.min(...box.tops), `${label}: one line`).toBeLessThanOrEqual(0.5);
  expect(Math.max(...box.bottoms) - Math.min(...box.bottoms), `${label}: one line`).toBeLessThanOrEqual(0.5);
  expect(box.overflow, `${label}: nothing overflows the header`).toBeLessThanOrEqual(0);
  return box;
}

const sheet = (page: Page) => page.locator('#fo-menu');
const menuButton = (page: Page) => page.locator('.fo-header__menu');
const opened = (page: Page) => page.evaluate(() => document.querySelector('#fo-menu')?.matches(':popover-open') ?? false);

test.describe('the Menu on one page per mold and per language, at 320, 360 and 1280 px', () => {
  for (const mold of MOLD_PAGES) {
    test(`${mold.lang} ${mold.mold} (${mold.path})`, async ({ page, browserName }) => {
      const t = TEXTS[mold.lang].common;
      const response = await page.goto(mold.path);
      expect(response?.status()).toBe(200);
      for (const width of WIDTHS) {
        const label = `${mold.path} at ${width}`;
        await page.setViewportSize({ width, height: 800 });
        await expectOneLine(page, label);
        // The button is named "Menu" (Menú in Spanish) at every width, its text shown from 768 px.
        await expect(page.getByRole('button', { name: t.header.menu, exact: true })).toBeVisible();

        // By click: the sheet opens under the button, with the hubs of the language and its section marked.
        await menuButton(page).click();
        await expect(sheet(page)).toBeVisible();
        const rows = sheet(page).locator('ul.fo-menu__list:not([aria-labelledby]) > li > a');
        expect(await rows.evaluateAll((links) => links.map((link) => link.getAttribute('href'))), label).toEqual(expectedSheet(mold.lang));
        for (const row of await rows.all()) await expect(row, label).toBeVisible();
        const box = await sheet(page).boundingBox();
        const button = await menuButton(page).boundingBox();
        expect(box && button && box.y >= button.y + button.height, `${label}: the sheet opens under the button`).toBe(true);
        expect(box && box.x >= 0 && box.x + box.width <= width, `${label}: the sheet stays in the window`).toBe(true);
        // Rows of 48 px, the tap-min, as the languages (52 px before the review F11 D-1; DECISOES § 404).
        for (const height of await rows.evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height))) expect(height, label).toBeGreaterThanOrEqual(48);
        const languages = sheet(page).locator('.fo-menu__lang a[hreflang]');
        if (width < 768) {
          await expect(sheet(page).locator('.fo-menu__lang')).toBeVisible();
          expect(await languages.evaluateAll((links) => links.map((link) => link.getAttribute('href'))), label).toEqual(expectedLanguages(mold.id));
          await expect(languages.nth(LANGS.indexOf(mold.lang))).toHaveAttribute('aria-current', 'true');
          // Three 48 px targets side by side, in one row, the name never cut (DECISOES § 388).
          const boxes = await languages.evaluateAll((links) => links.map((link) => ({ top: link.getBoundingClientRect().top, height: link.getBoundingClientRect().height, cut: link.scrollWidth - link.clientWidth })));
          for (const { height, cut } of boxes) {
            expect(height, label).toBeGreaterThanOrEqual(48);
            expect(cut, `${label}: a language name overflows its target`).toBeLessThanOrEqual(0);
          }
          expect(new Set(boxes.map((one) => one.top)).size, `${label}: the languages in one row`).toBe(1);
          // The language button is gone from the header under 768 px: the Menu has it.
          await expect(page.locator('.fo-header__lang')).toBeHidden();
        } else {
          await expect(sheet(page).locator('.fo-menu__lang')).toBeHidden();
          await expect(page.locator('.fo-header__lang')).toBeVisible();
        }
        // The header stays as it was with the sheet open (it floats in the top layer and pushes nothing).
        await expectOneLine(page, `${label}, open`);
        await page.keyboard.press('Escape');
        await expect(sheet(page)).toBeHidden();

        // By keyboard: Enter on the focused button opens it, the focus walks into the sheet, Esc closes it and gives the
        // focus back to the button. WebKit's Tab skips links (Option+Tab reaches them), so the row takes focus directly.
        await menuButton(page).focus();
        await page.keyboard.press('Enter');
        await expect(sheet(page)).toBeVisible();
        if (browserName === 'chromium') {
          await page.keyboard.press('Tab');
          await expect(rows.first(), `${label}: Tab goes into the sheet`).toBeFocused();
        } else {
          await rows.first().focus();
        }
        await page.keyboard.press('Escape');
        await expect(sheet(page)).toBeHidden();
        await expect(menuButton(page), `${label}: Esc gives the focus back`).toBeFocused();
        expect(await opened(page)).toBe(false);
      }

      // Under 768 px the language link of the sheet leads to the equivalent page of another language.
      await page.setViewportSize({ width: 360, height: 800 });
      await menuButton(page).click();
      const other = LANGS.find((lang) => lang !== mold.lang) as Lang;
      const target = expectedLanguages(mold.id)[LANGS.indexOf(other)] ?? '';
      await sheet(page).locator(`.fo-menu__lang a[hreflang]`).nth(LANGS.indexOf(other)).click();
      await expect(page).toHaveURL(new RegExp(`${target.replaceAll('/', '\\/')}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', other === 'pt' ? 'pt-BR' : other);
    });
  }
});

test('opening one menu closes the other, from 768 px (two auto popovers, no script)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/compress-image/');
  await page.locator('.fo-header__lang').click();
  await expect(page.locator('#fo-langmenu')).toBeVisible();
  await menuButton(page).click();
  await expect(sheet(page)).toBeVisible();
  await expect(page.locator('#fo-langmenu')).toBeHidden();
  await page.locator('.fo-header__lang').click();
  await expect(page.locator('#fo-langmenu')).toBeVisible();
  await expect(sheet(page)).toBeHidden();
  // The language menu is absolute too: it scrolls away with the page and never stays over it.
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#fo-langmenu') as Element).position)).toBe('absolute');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#fo-menu') as Element).position)).toBe('absolute');
});

test('the section of the page is marked by its weight too, so it still shows with forced colours', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  // WebKit does not emulate forced-colors (docs/claude/playwright.md, F7): there the weight is checked without it.
  if (browserName === 'chromium') await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(routeById('compress-image').paths.pt ?? '');
  await menuButton(page).click();
  const weights = await sheet(page).locator('ul.fo-menu__list:not([aria-labelledby]) .fo-menu__name').evaluateAll((names) =>
    names.map((name) => [name.closest('a')?.getAttribute('aria-current') ?? '', getComputedStyle(name).fontWeight]),
  );
  expect(weights.filter(([current]) => current).map(([, weight]) => weight)).toEqual(['700']);
  expect(new Set(weights.filter(([current]) => !current).map(([, weight]) => weight))).toEqual(new Set(['600']));
  // The language in use: 700, the others 600.
  const languages = await sheet(page).locator('.fo-menu__lang a[hreflang]').evaluateAll((links) => links.map((link) => [link.getAttribute('aria-current') ?? '', getComputedStyle(link).fontWeight]));
  expect(languages).toEqual([['', '600'], ['true', '700'], ['', '600']]);
});

// Review F11 B-1 (DECISOES § 404): with forced colours the background and every border look alike, and 700 against 600 is a
// faint mark. The current row, the language in use in the Menu and the one in the language menu are underlined there too,
// as the OptionGroup is (§ 280); with no forced colours nothing is underlined (WebKit, which does not emulate them).
test('with forced colours the section and the language in use are underlined too, in the Menu and in the language menu', async ({ page, browserName }) => {
  if (browserName === 'chromium') await page.emulateMedia({ forcedColors: 'active' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(routeById('compress-image').paths.pt ?? '');
  const forced = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
  expect(forced).toBe(browserName === 'chromium');
  const mark = forced ? 'underline' : 'none';
  await menuButton(page).click();
  await page.mouse.move(0, 0);
  const rows = await sheet(page).locator('ul.fo-menu__list:not([aria-labelledby]) .fo-menu__name').evaluateAll((names) =>
    names.map((name) => [name.closest('a')?.getAttribute('aria-current') ?? '', getComputedStyle(name).textDecorationLine]),
  );
  expect(rows.filter(([current]) => current).map(([, line]) => line)).toEqual([mark]);
  expect(new Set(rows.filter(([current]) => !current).map(([, line]) => line))).toEqual(new Set(['none']));
  const languages = await sheet(page).locator('.fo-menu__lang a[hreflang]').evaluateAll((links) => links.map((link) => [link.getAttribute('aria-current') ?? '', getComputedStyle(link).textDecorationLine]));
  expect(languages).toEqual([['', 'none'], ['true', mark], ['', 'none']]);
  await page.keyboard.press('Escape');

  // The language menu of the computer: before, with forced colours, nothing marked the language in use.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('.fo-header__lang').click();
  await expect(page.locator('#fo-langmenu')).toBeVisible();
  await page.mouse.move(0, 0);
  const menu = await page.locator('#fo-langmenu a[hreflang]').evaluateAll((links) => links.map((link) => [link.getAttribute('aria-current') ?? '', getComputedStyle(link).textDecorationLine]));
  expect(menu).toEqual([['', 'none'], ['true', mark], ['', 'none']]);
});

// Review F11 B-2 and its second pass (DECISOES § 405): the click that closes a menu (the light dismiss of an auto popover)
// went on to what was under it, so the DropZone opened the file picker and a radio of the tool changed. While a menu is
// open, and for 400 ms after it closes (a tap's click comes after the close in WebKit), the page under the header takes no
// pointer, and the click only closes the menu. page.mouse and page.touchscreen act by coordinate: locator.click would wait
// for the element to take the pointer.
/** Whether the page under the header takes the pointer again: the frame is not none and the unpainted sheet has left. */
const takesPointer = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('.fo-frame') as Element).pointerEvents === 'auto' && getComputedStyle(document.body, '::after').scale === '0');

/** The centre of an unchecked radio of the tool just under the open sheet, marked data-probe. */
async function radioUnderSheet(page: Page): Promise<{ x: number; y: number }> {
  const bottom = await sheet(page).evaluate((element) => element.getBoundingClientRect().bottom);
  const radio = await page.evaluate((below) => {
    const label = [...document.querySelectorAll<HTMLElement>('main label.fo-seg__opt')]
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .find(({ element, rect }) => element.querySelector('input:not(:checked)') && rect.top > below + 4 && rect.bottom < innerHeight - 4);
    if (!label) return null;
    label.element.setAttribute('data-probe', '');
    return { x: label.rect.left + label.rect.width / 2, y: label.rect.top + label.rect.height / 2 };
  }, bottom);
  if (!radio) throw new Error('no unchecked radio under the sheet');
  return radio;
}

test('the click that closes a menu does not reach the page under it: no file picker, no control changed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  let pickers = 0;
  page.on('filechooser', () => (pickers += 1));
  const drop = await page.locator('.fo-drop').first().boundingBox();
  if (!drop) throw new Error('no DropZone');
  const centre = { x: drop.x + drop.width / 2, y: drop.y + drop.height / 2 };
  for (const [button, menu] of [['.fo-header__menu', '#fo-menu'], ['.fo-header__lang', '#fo-langmenu']] as const) {
    await page.locator(button).click();
    await expect(page.locator(menu)).toBeVisible();
    await page.mouse.click(centre.x, centre.y);
    await expect(page.locator(menu), `${menu}: the click closes it`).toBeHidden();
  }
  await page.waitForTimeout(300);
  expect(pickers, 'no file picker from the click that closed a menu').toBe(0);
  // With no menu open, once the hold is over, the same click opens the picker: the page takes the pointer again.
  await expect.poll(() => takesPointer(page)).toBe(true);
  const picker = page.waitForEvent('filechooser');
  await page.mouse.click(centre.x, centre.y);
  await picker;

  // Under 768 px the sheet covers the DropZone: a click on a radio of Rotate image just under the sheet.
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/rotate-image/');
  await hydrated(page);
  await menuButton(page).click();
  await expect(sheet(page)).toBeVisible();
  const radio = await radioUnderSheet(page);
  await page.mouse.click(radio.x, radio.y);
  await expect(sheet(page)).toBeHidden();
  await expect(page.locator('[data-probe] input')).not.toBeChecked();
});

test('the tap that closes the Menu on a touch screen does not reach the page either, with reduced motion too', async ({ browser }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, hasTouch: true, reducedMotion, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto('/rotate-image/');
    await hydrated(page);
    // The cookie notice would cover the radio: at 390 × 900 it starts 10 px under the radio's centre in the Chromium of
    // Windows and higher in the CI's Linux, where its text takes more room (DECISOES § 408).
    await dismissCookies(page);
    await menuButton(page).tap();
    await expect(sheet(page)).toBeVisible();
    const radio = await radioUnderSheet(page);
    await page.touchscreen.tap(radio.x, radio.y);
    await expect(sheet(page), reducedMotion).toBeHidden();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-probe] input'), `${reducedMotion}: the closing tap changed nothing`).not.toBeChecked();
    // Once the hold is over, the same tap reaches the radio.
    await expect.poll(() => takesPointer(page)).toBe(true);
    await page.touchscreen.tap(radio.x, radio.y);
    await expect(page.locator('[data-probe] input'), reducedMotion).toBeChecked();
    await context.close();
  }
});

/** A first visit at one width, in a context of its own, with Figtree held until released (layout-shift.spec.ts). */
async function heldPage(browser: Browser, path: string, width: number): Promise<{ page: Page; release: () => Promise<void>; close: () => Promise<void> }> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  let open: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    open = resolve;
  });
  await page.route(FIGTREE, async (route) => {
    await held;
    await route.continue();
  });
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Two frames, or a second at most: WebKit paints no frame of some pages while Figtree is held.
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    setTimeout(resolve, 1000);
  }));
  return {
    page,
    release: async () => {
      open();
      await page.waitForFunction(() => [...document.fonts].some((font) => font.family.replaceAll('"', '') === 'Figtree' && font.status === 'loaded'));
      await page.evaluate(() => document.fonts.ready);
    },
    close: () => context.close(),
  };
}

test.describe('the header measured in the three languages, with Figtree held and released', () => {
  for (const lang of LANGS) {
    for (const width of ALL_WIDTHS) {
      test(`${lang} at ${width} px: 64 px and one line before and after Figtree, nothing changes width, 48 px targets${width === 1280 ? ', the rail 150 px under the header' : ''}`, async ({ browser, browserName }) => {
        const path = routeById('compress-image').paths[lang] ?? '';
        const { page, release, close } = await heldPage(browser, path, width);
        const lines: string[] = [];
        const measure = async (state: string) => {
          const box = await expectOneLine(page, `${lang} ${width} ${state}`);
          const used = box.controls.reduce((sum, control) => sum + control.width, 0) + box.gap * (box.controls.length - 1);
          // Every control is a 48 px target.
          for (const control of box.controls) {
            expect(control.height, `${lang} ${width} ${control.name}`).toBeGreaterThanOrEqual(48);
            expect(control.width, `${lang} ${width} ${control.name}`).toBeGreaterThanOrEqual(48);
          }
          lines.push(`[header] ${browserName} ${lang} ${width} ${state}: ${box.height} px, 1 linha, ${box.controls.length} controles, ocupa ${used.toFixed(1)} de ${box.inner.toFixed(1)}, sobra ${(box.inner - used).toFixed(1)}, último em x ${box.controls.at(-1)?.right.toFixed(1)}`);
          return box.controls.map((control) => `${control.name} ${control.left.toFixed(2)} ${control.width.toFixed(2)}`);
        };
        const held = await measure('Figtree segura');
        // WebKit still takes an optional face in the 100 ms after asking for it (layout-shift.spec.ts): the release comes later.
        if (browserName !== 'chromium') await page.waitForTimeout(150);
        await release();
        await page.waitForTimeout(200);
        // Every text of the header is in Figtree Steady, which keeps the face of the first paint: nothing moves.
        expect(await measure('Figtree solta'), `${lang} ${width}: the header does not move when Figtree arrives`).toEqual(held);
        if (width === 1280) {
          // On a page with the rail, the header runs over it, as the footer does (DECISOES § 409): the rail starts 150 px
          // under the header, so every control is 150 px or more from its AdSlot. The open sheet covers the top of the
          // rail, and the page under it, the rail with it, takes no pointer while it is open (review F11 B-2).
          const grid = await page.evaluate(() => {
            const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect() ?? null;
            const controls = [...document.querySelectorAll<HTMLElement>('.fo-header > a, .fo-header > button')].map((element) => element.getBoundingClientRect()).filter((r) => r.width > 0);
            return { header: rect('.fo-header'), rail: rect('.fo-rail .fo-ad'), logo: rect('.fo-header__logo'), last: Math.max(...controls.map((r) => r.right)), low: Math.max(...controls.map((r) => r.bottom)) };
          });
          expect(grid.rail && grid.header && grid.rail.top - grid.header.bottom, 'the rail starts 150 px under the header').toBeGreaterThanOrEqual(150);
          expect(grid.rail && grid.rail.top - grid.low, 'the controls are 150 px or more from the rail').toBeGreaterThanOrEqual(150);
          await menuButton(page).click();
          await expect(sheet(page)).toBeVisible();
          const open = await sheet(page).boundingBox();
          expect(await page.evaluate(() => getComputedStyle(document.querySelector('.fo-frame') as Element).pointerEvents), 'the page under the open sheet takes no pointer').toBe('none');
          lines.push(`[header] ${browserName} ${lang} 1280: logo em x ${grid.logo?.left.toFixed(1)}, último controle até x ${grid.last.toFixed(1)}, lateral em x ${grid.rail?.left.toFixed(1)} e y ${grid.rail?.top.toFixed(1)}, folha de x ${open?.x.toFixed(1)} a ${open ? (open.x + open.width).toFixed(1) : '?'} e ${open?.height.toFixed(1)} px de altura`);
        }
        console.log(lines.join('\n'));
        await close();
      });
    }
  }
});

// The header and the footer share their edges (DECISOES § 409): the first control of the header starts where the
// footer's columns and its base line start, and the last one ends where they end, at every width from 320 to 1920 px, on
// a page with the rail and on two without. The open sheet keeps to the same edges under 768 px, and to the right one from
// there. Before, from 1280 px the header ended where the tool column ends (x 794 at 1280, the footer at x 1256), and from
// 360 to 1279 px it was 8 px wider than the footer on each side. The edge narrows to 16 px under 340 px, and the footer
// never loses a column as the window widens (with the switch at 360 px it had two at 356 to 359 px and one at 360;
// review of § 409, b-2).
const EDGE_WIDTHS = [320, 339, 340, 359, 360, 390, 767, 768, 1024, 1279, 1280, 1288, 1440, 1920] as const;
for (const path of ['/compress-image/', '/pt/guias/', '/es/']) {
  test(`${path}: the header and the footer share their edges at every width, and the open sheet keeps to them`, async ({ page }) => {
    expect((await page.goto(path))?.status(), path).toBe(200);
    let columns = 0;
    for (const width of EDGE_WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      const label = `${path} a ${width} px`;
      const box = await expectOneLine(page, label);
      const first = Math.min(...box.controls.map((control) => control.left));
      const last = Math.max(...box.controls.map((control) => control.right));
      const footer = await page.evaluate(() => [...document.querySelectorAll('.fo-footer__cols, .fo-footer__base')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      }));
      expect(footer, label).toHaveLength(2);
      for (const edges of footer) {
        expect(Math.abs(first - edges.left), `${label}: o cabeçalho começa em x ${first.toFixed(1)}, o rodapé em x ${edges.left.toFixed(1)}`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(last - edges.right), `${label}: o cabeçalho termina em x ${last.toFixed(1)}, o rodapé em x ${edges.right.toFixed(1)}`).toBeLessThanOrEqual(0.5);
      }
      const now = await page.evaluate(() => getComputedStyle(document.querySelector('.fo-footer__cols') as Element).gridTemplateColumns.split(' ').length);
      expect(now, `${label}: o rodapé perdeu coluna ao alargar (${columns} antes, ${now} agora)`).toBeGreaterThanOrEqual(columns);
      columns = now;
      await menuButton(page).click();
      await expect(sheet(page)).toBeVisible();
      const open = await sheet(page).boundingBox();
      expect(open, label).not.toBeNull();
      if (width < 768) expect(Math.abs((open?.x ?? NaN) - first), `${label}: a folha começa na borda do cabeçalho`).toBeLessThanOrEqual(0.5);
      expect(Math.abs((open ? open.x + open.width : NaN) - last), `${label}: a folha termina na borda do cabeçalho`).toBeLessThanOrEqual(0.5);
      await page.keyboard.press('Escape');
      await expect(sheet(page)).toBeHidden();
    }
  });
}
