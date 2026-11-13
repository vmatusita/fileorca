import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { CODECS, ERROR_REASONS, EVENT_PARAMS, OUTCOMES } from '../../src/analytics/events.ts';
import { CALC_EVENT_TOOLS, EVENT_TOOLS, IMAGE_EVENT_TOOLS, PDF_EVENT_TOOLS } from '../../src/analytics/tool-ids.ts';
import { PDF_PAGES, PDF_PRESET_IDS, PDF_TOOL_IDS, type PdfPageId } from '../../src/tools/pdf/registry.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { routeById } from '../../src/i18n/routes.ts';
import { LIFE_CALC_PAGES } from '../../src/tools/calc/registry.ts';
import unlockTexts from '../../src/tools/unlock-pdf/i18n/en.ts';
import watermarkTexts from '../../src/tools/watermark-pdf/i18n/en.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import { dataLayer, dismissCookies, hydrated, useImage } from './lib/page.ts';
import { BROKEN_PDFS, PDF_ORACLE, choosePdfs, openTool, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
/* F12 · a parede do bloqueador (§ 432) */
import { WALL_ACTIONS, WALL_EVENT_MODES } from '../../src/analytics/events.ts';
import { PRODUCTION_ORIGIN } from './lib/production.ts';
import { useTestBuild } from './lib/test-build.ts';
import { STATUS, expectWallOpen, googlefcStub, openAsProduction, wallEvents } from './lib/wall.ts';

// donate_click, next_step_click and the cookie notice, end to end.

async function lastEvent(page: Page, name: string) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === name).at(-1);
}

test('the footer coffee link sends donate_click with place footer and the language', async ({ page }) => {
  await page.goto('/pt/sobre/');
  // The open notice floats over the end of the page (DECISOES § 106): the choice comes first, as a person's would.
  await dismissCookies(page);
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  // F12 (DECISOES § 443): the footer line of PLANO-MELHORIAS section C, at the top of the footer.
  await page.locator('footer').getByRole('link', { name: 'Me ajude a manter o FileOrca grátis: paga um café?', exact: true }).click();
  expect(await lastEvent(page, 'donate_click')).toEqual(['event', 'donate_click', { lang: 'pt', place: 'footer' }]);
});

test('the support page button links to Ko-fi without any Ko-fi script and sends donate_click', async ({ page }) => {
  await page.goto('/support/');
  // F12 (DECISOES § 443): the Ko-fi button of section C. Exact: the footer line of the same page ends in "buy me a coffee".
  const button = page.getByRole('link', { name: 'Buy me a coffee', exact: true });
  await expect(button).toHaveAttribute('href', 'https://ko-fi.com/victormatusita');
  expect(await page.locator('script[src*="ko-fi"], iframe[src*="ko-fi"]').count()).toBe(0);
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await button.click();
  expect(await lastEvent(page, 'donate_click')).toEqual(['event', 'donate_click', { lang: 'en', place: 'support_page' }]);
});

// F11 (decision 3; DECISOES § 390): the Support Oli row of the header Menu leads to the support page of the language and
// sends donate_click with the place menu, a value of the closed list DONATE_PLACES, on the phone and on the computer.
test('the Support Oli row of the Menu sends donate_click with place menu and the language', async ({ page }) => {
  for (const [width, path, lang, name, href] of [[360, '/es/unir-pdf/', 'es', 'Apoya a Oli', '/es/apoyo/'], [1280, '/guides/', 'en', 'Support Oli', '/support/']] as const) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
    await dismissCookies(page);
    // The Menu opens first: a click whose default is prevented would not open the popover either.
    await page.locator('.fo-header__menu').click();
    await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false, once: true }));
    const link = page.locator('#fo-menu').getByRole('link', { name: new RegExp(`^${name}`) });
    await expect(link).toHaveAttribute('href', href);
    await link.click();
    expect(await lastEvent(page, 'donate_click'), path).toEqual(['event', 'donate_click', { lang, place: 'menu' }]);
  }
});

test('the next-step chip sends next_step_click', async ({ page }) => {
  await page.goto('/es/comprimir-imagen/');
  await hydrated(page);
  await dismissCookies(page);
  // A small generated photo through the shared helper, which waits for the result like every other spec: the
  // chip comes with the result card, and the 8 MP photo took more than the 5 s an expect waits on the CI runner.
  await useImage(page);
  // F6: Resize image exists in Spanish, so the first chip leads to it instead of the home (DECISOES § 233).
  const chip = page.locator('nav.fo-next a.fo-chip').first();
  await expect(chip).toHaveAttribute('href', '/es/redimensionar-imagen/');
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await chip.click();
  expect(await lastEvent(page, 'next_step_click')).toEqual(['event', 'next_step_click', { tool: 'compress-image', lang: 'es', target: 'resize-image' }]);
});

test('an English chip names the tool it leads to, and the preset page names itself', async ({ page }) => {
  await page.goto('/compress-image/to-100kb/');
  await hydrated(page);
  await dismissCookies(page);
  // A small generated photo through the shared helper, which waits for the result like every other spec: the
  // chip comes with the result card, and the 8 MP photo took more than the 5 s an expect waits on the CI runner.
  await useImage(page);
  const chip = page.locator('nav.fo-next a.fo-chip').first();
  await expect(chip).toHaveAttribute('href', '/resize-image/');
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await chip.click();
  expect(await lastEvent(page, 'next_step_click')).toEqual(['event', 'next_step_click', { tool: 'compress-image-to-100kb', lang: 'en', target: 'resize-image' }]);
  expect(await lastEvent(page, 'tool_start')).toEqual(['event', 'tool_start', { tool: 'compress-image-to-100kb', lang: 'en' }]);
});

// F17 (decision 9; DECISOES § 710): the two tools of the run 2b send the events of every image tool, with `tool` equal to
// their id (the two ids entered IMAGE_EVENT_TOOLS, the closed list of `tool` and `target`) and no parameter that the event
// did not have: tool_start, tool_complete with "converted", download and next_step_click, in that order, every value from
// its closed list, and nothing of the file in the dataLayer. Convert to WebP runs with AVIF chosen (its encoder on the way).
test.describe('the AVIF to JPG and Convert to WebP events', () => {
  for (const { id, file, mimeType, avif } of [
    { id: 'avif-to-jpg', file: 'gen-avif.avif', mimeType: 'image/avif', avif: false },
    { id: 'convert-to-webp', file: 'gen-jpg-01-orientacao6.jpg', mimeType: 'image/jpeg', avif: true },
  ] as const) {
    test(`${id}: tool_start, tool_complete, download and next_step_click name the tool by its id, with no new parameter`, async ({ page }) => {
      expect((await page.goto(`/${id}/`))?.status()).toBe(200);
      await hydrated(page);
      await dismissCookies(page);
      if (avif) await page.locator('.fo-seg__opt', { hasText: 'AVIF' }).click();
      await page.setInputFiles('input[type="file"]', { name: `Sentinel-Photo-6283.${file.split('.').pop()}`, mimeType, buffer: readFileSync(resolve('fixtures/images', file)) });
      const download = page.locator('#fo-tool-root .fo-btn--download');
      await expect(download).toBeVisible({ timeout: 30_000 });
      await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
      await download.click();
      const chip = page.locator('nav.fo-next a.fo-chip').first();
      const target = ((await chip.getAttribute('href')) ?? '').replaceAll('/', '');
      await chip.click();

      const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => [entry[1], entry[2]]);
      expect(events).toEqual([
        ['tool_start', { tool: id, lang: 'en' }],
        ['tool_complete', { tool: id, lang: 'en', outcome: 'converted' }],
        ['download', { tool: id, lang: 'en' }],
        ['next_step_click', { tool: id, lang: 'en', target }],
      ]);
      expect(IMAGE_EVENT_TOOLS as readonly string[], `${id} is in the closed list of tool`).toContain(id);
      expect(EVENT_TOOLS as readonly string[], `${target} is in the closed list of target`).toContain(target);
      for (const [name, params] of events as [string, Record<string, unknown>][]) {
        const allowed = (EVENT_PARAMS as Record<string, readonly string[]>)[name] ?? [];
        for (const key of Object.keys(params)) expect(allowed, `${name}.${key} is a parameter of the event`).toContain(key);
      }
      expect(OUTCOMES as readonly string[]).toContain('converted');
      const everything = JSON.stringify(await dataLayer(page));
      expect(everything, 'the name of the file in the dataLayer').not.toMatch(/Sentinel|6283|\.avif|\.jpe?g/i);
    });
  }
});

// F18 (criterion 5 and decision 14 of the prompt; DECISOES § 737): the five pages of the run send the events of their
// island, in the mould of the F17 block above, with `tool` equal to their id (the five ids entered IMAGE_EVENT_TOOLS and
// PDF_EVENT_TOOLS, the closed lists of `tool` and `target`) and no parameter the event did not have: tool_start,
// tool_complete with the page's outcome (`cleaned` and `organized` are the values the run added to OUTCOMES; a preset says
// its parent's: `rotated`, `split`, `converted`), download and next_step_click, in that order, every value from its closed
// list, and nothing of the file in the dataLayer. Two pages go through the image island, three through the PDF island.
test.describe('the events of the five pages of the F18', () => {
  const NAME = 'Sentinel-Photo-6283';
  const CASES = [
    { id: 'remove-exif-data', outcome: 'cleaned', file: 'gen-jpg-02-orientacao8.jpg' },
    { id: 'rotate-image-flip', outcome: 'rotated', file: 'gen-jpg-01-orientacao6.jpg' },
    { id: 'organize-pdf', outcome: 'organized', file: 'gen-paginas-mistas.pdf' },
    { id: 'split-pdf-extract-pages', outcome: 'split', file: 'gen-paginas-mistas.pdf' },
    { id: 'pdf-to-jpg-to-png', outcome: 'converted', file: 'pdf-escaneado-01-pagina-livro-cor.pdf' },
  ] as const;
  for (const { id, outcome, file } of CASES) {
    test(`${id}: tool_start, tool_complete "${outcome}", download and next_step_click name the page by its id, with no new parameter`, async ({ page }) => {
      const image = (IMAGE_EVENT_TOOLS as readonly string[]).includes(id);
      await openTool(page, routeById(id).paths.en ?? `(${id} sem página em en)`);
      const root = page.locator('#fo-tool-root');
      if (image) {
        await page.setInputFiles('#fo-tool-root input[type="file"]', { name: `${NAME}.jpg`, mimeType: 'image/jpeg', buffer: readFileSync(resolve('fixtures/images', file)) });
      } else {
        await choosePdfs(page, [pdfFile(file, `${NAME}.pdf`)]);
        if (id !== 'pdf-to-jpg-to-png') {
          // Organize PDF and Extract pages wait for the action: a page turned in one, two pages picked in the other.
          const cells = root.locator('.fo-pages__grid .fo-page');
          await expect(cells).toHaveCount(8, { timeout: 30_000 });
          await cells.nth(1).locator('.fo-page__main').click();
          if (id === 'organize-pdf') await root.locator('.fo-pages__act--right').click();
          else await cells.nth(2).locator('.fo-page__main').click();
          await root.locator('.fo-ready:not(.fo-ready--reading) .fo-btn--brand').click();
        }
      }
      const download = root.locator('.fo-btn--download');
      await expect(download).toBeVisible({ timeout: 60_000 });
      await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
      await download.click();
      const chip = page.locator('nav.fo-next a.fo-chip').first();
      const target = ((await chip.getAttribute('href')) ?? '').replaceAll('/', '');
      await chip.click();

      const events = (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => [entry[1], entry[2]]);
      expect(events).toEqual([
        ['tool_start', { tool: id, lang: 'en' }],
        ['tool_complete', { tool: id, lang: 'en', outcome }],
        ['download', { tool: id, lang: 'en' }],
        ['next_step_click', { tool: id, lang: 'en', target }],
      ]);
      expect((image ? IMAGE_EVENT_TOOLS : PDF_EVENT_TOOLS) as readonly string[], `${id} is in the closed list of tool`).toContain(id);
      expect(EVENT_TOOLS as readonly string[], `${target} is in the closed list of target`).toContain(target);
      expect((image ? IMAGE_PAGES[id as ImagePageId].next : PDF_PAGES[id as PdfPageId].next) as readonly string[], 'the chip leads to a page of the registry').toContain(target);
      expect(OUTCOMES as readonly string[], `${outcome} is in the closed list of outcome`).toContain(outcome);
      for (const [name, params] of events as [string, Record<string, unknown>][]) {
        const allowed = (EVENT_PARAMS as Record<string, readonly string[]>)[name] ?? [];
        for (const key of Object.keys(params)) expect(allowed, `${name}.${key} is a parameter of the event`).toContain(key);
      }
      const everything = JSON.stringify(await dataLayer(page));
      expect(everything, 'the name of the file in the dataLayer').not.toMatch(/Sentinel|6283|mistas|escaneado|\.jpe?g|\.pdf/i);
    });
  }
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

// The WebKit of the Ubuntu runner once left the focus under the notice in spite of the
// scroll-padding. The notice moves a focused element out from under itself, so the test takes the
// scroll-padding away to stand for a browser that ignores it (DECISOES § 36).
test('an element focused under the cookie notice moves above it, even without scroll-padding', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const notice = page.locator('#fo-cookie');
  await expect(notice).toBeVisible();
  const link = page.locator('footer a').first();
  const covered = () => link.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return !(hit && (hit === element || element.contains(hit)));
  });
  await link.evaluate((element) => {
    const box = document.getElementById('fo-cookie')!.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    window.scrollBy(0, rect.top + rect.height / 2 - (box.top + box.height / 2));
  });
  expect(await covered(), 'o link precisa começar sob o aviso').toBe(true);
  await page.evaluate(() => document.documentElement.style.setProperty('scroll-padding-bottom', '0px'));
  await link.focus();
  expect(await covered()).toBe(false);
  const gap = await link.evaluate((element) => document.getElementById('fo-cookie')!.getBoundingClientRect().top - element.getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThanOrEqual(0);
});

test('the search dialog has a visible close button', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('button', { name: /Buscar ferramentas/ }).click();
  const dialog = page.locator('#fo-search-dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();
});

// F4 (DECISOES § 113): the calculator events carry the page id, the language and a closed value, never a number.
test.describe('the calculator events', () => {
  test('calc_complete goes once, on the first change, never on load nor on a scenario link', async ({ page }) => {
    await page.goto('/mortgage-calculator/#v=1&p=40000000');
    await hydrated(page);
    await dismissCookies(page);
    await expect(page.locator('#fo-calc-p')).toHaveValue('400,000');
    const sent = async () => (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'calc_complete');
    expect(await sent()).toEqual([]);
    for (const value of ['410000', '420000', '430000']) await page.locator('#fo-calc-p').fill(value);
    expect(await sent()).toEqual([['event', 'calc_complete', { tool: 'mortgage-calculator', lang: 'en' }]]);
  });

  test('export_click names the format, share_click and next_step_click name the page and the target', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
    await page.goto('/mortgage-calculator/biweekly/');
    await hydrated(page);
    await dismissCookies(page);
    // F13b (DECISOES § 545): Download CSV and Copy link under the card; the Download PDF in it.
    const buttons = page.locator('.fo-export .fo-btn');
    const csv = page.waitForEvent('download');
    await buttons.nth(0).click();
    await csv;
    expect(await lastEvent(page, 'export_click')).toEqual(['event', 'export_click', { tool: 'mortgage-calculator-biweekly', lang: 'en', format: 'csv' }]);
    const pdf = page.waitForEvent('download');
    await page.locator('.fo-rhero .fo-btn--download').click();
    await pdf;
    expect(await lastEvent(page, 'export_click')).toEqual(['event', 'export_click', { tool: 'mortgage-calculator-biweekly', lang: 'en', format: 'pdf' }]);
    await buttons.nth(1).click();
    expect(await lastEvent(page, 'share_click')).toEqual(['event', 'share_click', { tool: 'mortgage-calculator-biweekly', lang: 'en' }]);
    const chip = page.locator('.fo-calc__next a.fo-chip').first();
    const href = (await chip.getAttribute('href')) ?? '';
    await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
    await chip.click();
    expect(await lastEvent(page, 'next_step_click')).toEqual(['event', 'next_step_click', { tool: 'mortgage-calculator-biweekly', lang: 'en', target: href.replaceAll('/', '-').replace(/^-|-$/g, '') }]);
  });
});

// F7 (decision 11; DECISOES § 263): a home calculator and a health one, end to end. The first valid change sends
// calc_complete once (a value out of the field's range sends nothing); the CSV, the PDF, Copy link and the first chip send
// export_click with the format, share_click and next_step_click with the page it leads to. Every event carries only its
// parameters (tool, lang, format or target), with the page id of the registry, and nothing typed: no measure in any form,
// no date in any way it can be written.
test.describe('the home and health calculator events', () => {
  type Sent = readonly [name: string, params: Record<string, unknown>];
  const sent = async (page: Page): Promise<Sent[]> =>
    (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => [entry[1] as string, entry[2] as Record<string, unknown>] as const);

  /** Only the parameters of its event, every value a word of a closed list: the page, the language, the format, the target. */
  function expectClosed([name, params]: Sent): void {
    const allowed: readonly string[] = (EVENT_PARAMS as Record<string, readonly string[]>)[name] ?? [];
    for (const [key, value] of Object.entries(params)) {
      expect(allowed, `${name}.${key} is a parameter of the event`).toContain(key);
      expect(typeof value, `${name}.${key} is a word, not a number`).toBe('string');
    }
    expect(CALC_EVENT_TOOLS as readonly string[], `${name}.tool`).toContain(params['tool']);
    if ('target' in params) expect(CALC_EVENT_TOOLS as readonly string[], `${name}.target`).toContain(params['target']);
    if ('format' in params) expect(['pdf', 'csv'], `${name}.format`).toContain(params['format']);
  }

  /** Saves the CSV and the PDF, copies the link and clicks the first chip (its link held back), as a person would. */
  async function exportShareAndChip(page: Page): Promise<string> {
    const buttons = page.locator('.fo-export .fo-btn');
    for (const button of [buttons.nth(0), page.locator('.fo-rhero .fo-btn--download')]) {
      const saved = page.waitForEvent('download');
      await button.click();
      await saved;
    }
    await buttons.nth(1).click();
    const chip = page.locator('.fo-calc__next a.fo-chip').first();
    const href = (await chip.getAttribute('href')) ?? '';
    await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
    await chip.click();
    return href;
  }

  test('a home calculator: calc_complete once on the first valid change, then export, share and the chip, with no measure', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
    const id = 'square-footage-calculator';
    const own = LIFE_CALC_PAGES[id];
    expect((await page.goto(own.path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    expect(await sent(page), 'nada no carregamento').toEqual([]);
    // Out of the range (0.01 to 300 ft): the field says so, the result stays, nothing is sent.
    await page.locator('#fo-calc-a0x').fill('987.65');
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    expect(await sent(page), 'nada com um valor fora da faixa').toEqual([]);
    for (const [field, value] of [['#fo-calc-a0x', '287.53'], ['#fo-calc-a0y', '263.41'], ['#fo-calc-a0x', '241.87']] as const) await page.locator(field).fill(value);
    expect(await sent(page)).toEqual([['calc_complete', { tool: id, lang: 'en' }]]);
    const href = await exportShareAndChip(page);
    const target = own.next[0];
    expect(href).toBe(target ? LIFE_CALC_PAGES[target].path : '');
    const events = await sent(page);
    expect(events).toEqual([
      ['calc_complete', { tool: id, lang: 'en' }],
      ['export_click', { tool: id, lang: 'en', format: 'csv' }],
      ['export_click', { tool: id, lang: 'en', format: 'pdf' }],
      ['share_click', { tool: id, lang: 'en' }],
      ['next_step_click', { tool: id, lang: 'en', target }],
    ]);
    for (const event of events) expectClosed(event);
    const everything = JSON.stringify(await dataLayer(page));
    for (const typed of ['987.65', '98765', '287.53', '28753', '263.41', '26341', '241.87', '24187']) expect(everything, `"${typed}" is in the dataLayer`).not.toContain(typed);
  });

  test('a health calculator: calc_complete once on the first valid date, then export, share and the chip, with no date', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
    const id = 'due-date-calculator';
    const own = LIFE_CALC_PAGES[id];
    expect((await page.goto(own.path))?.status()).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    expect(await sent(page), 'nada no carregamento').toEqual([]);
    // A day out of the field's fixed range (2000 to 2099): the error, the last result, no event.
    const date = page.locator('#fo-calc-d');
    await date.fill('1999-12-31');
    await expect(page.locator('#fo-rhero-error')).toBeVisible();
    expect(await sent(page), 'nada com um dia fora da faixa').toEqual([]);
    await date.fill('2026-03-17');
    await expect(page.locator('#fo-rhero-error')).toHaveCount(0);
    await page.locator('#fo-calc-m').selectOption('ivf5');
    await date.fill('2026-04-09');
    expect(await sent(page)).toEqual([['calc_complete', { tool: id, lang: 'en' }]]);
    const href = await exportShareAndChip(page);
    const target = own.next[0];
    expect(href).toBe(target ? LIFE_CALC_PAGES[target].path : '');
    const events = await sent(page);
    expect(events).toEqual([
      ['calc_complete', { tool: id, lang: 'en' }],
      ['export_click', { tool: id, lang: 'en', format: 'csv' }],
      ['export_click', { tool: id, lang: 'en', format: 'pdf' }],
      ['share_click', { tool: id, lang: 'en' }],
      ['next_step_click', { tool: id, lang: 'en', target }],
    ]);
    for (const event of events) expectClosed(event);
    const everything = JSON.stringify(await dataLayer(page));
    for (const day of ['1999-12-31', '2026-03-17', '03/17/2026', '3/17/2026', 'March 17, 2026', '20260317', '2026-04-09', '04/09/2026', '4/9/2026', 'April 9, 2026', '20260409']) {
      expect(everything, `"${day}" is in the dataLayer`).not.toContain(day);
    }
    // Nor the method, a word the person chose: the events carry only their closed parameters.
    expect(everything).not.toContain('ivf5');
  });
});

// F5a (decision 11, DECISOES § 169): the events of the PDF tools, from real runs. The tool list of the events is
// the registry's, the outcome and the reason come from closed lists, and nothing the person typed or chose (a password,
// a watermark text, a file name) is in any event: the sentinels below are long and unique, so any trace of them is found.
// tests/unit/consent.test.ts proves the same lists in Node, tool by tool.
test.describe('the PDF tool events', () => {
  /** A text a tool page must have (the type allows a tool without an action button). */
  const must = (text: string | undefined): string => {
    if (!text) throw new Error('the page has no such text');
    return text;
  };
  const PASSWORD = 'Orca-Sentinel-7391-Kq';
  const MARK = 'Orca-Mark-5521-Zt';
  const NAME = 'Sentinel-Contract-4471';
  const SENTINELS = [PASSWORD, MARK, NAME, '7391', '5521', '4471'];

  type Sent = readonly [name: string, params: Record<string, unknown>];

  const sent = async (page: Page): Promise<Sent[]> =>
    (await dataLayer(page)).filter((entry) => entry[0] === 'event').map((entry) => [entry[1] as string, entry[2] as Record<string, unknown>] as const);

  /** One event: only the parameters of its event, every value a word from its closed list, never a number. */
  function expectClosed([name, params]: Sent): void {
    const allowed = (EVENT_PARAMS as Record<string, readonly string[]>)[name] ?? [];
    for (const [key, value] of Object.entries(params)) {
      expect(allowed, `${name}.${key} is a parameter of the event`).toContain(key);
      expect(typeof value, `${name}.${key} is a word, not a number`).toBe('string');
      const closed: Record<string, readonly string[]> = {
        lang: ['en'],
        tool: PDF_EVENT_TOOLS,
        outcome: OUTCOMES,
        reason: ERROR_REASONS,
        codec: CODECS,
        target: [...EVENT_TOOLS, 'home'],
      };
      if (key === 'browser') expect(value, `${name}.browser`).toMatch(/^(chrome|safari|firefox|edge)-\d+$/);
      else expect(closed[key], `${name}.${key} has a closed list`).toContain(value);
    }
  }

  /** Nothing of the run is in the dataLayer: not the typed text, not the password, not the name of the file. */
  async function expectNoTrace(page: Page): Promise<void> {
    const everything = JSON.stringify(await dataLayer(page));
    for (const sentinel of SENTINELS) expect(everything, `"${sentinel}" is in the dataLayer`).not.toContain(sentinel);
    expect(everything, 'a PDF file name in the dataLayer').not.toMatch(/\.pdf/i);
  }

  test('a PDF run sends tool_start, tool_complete, download and next_step_click with the registry name and closed values', async ({ page }) => {
    await openTool(page, '/watermark-pdf/');
    await page.getByLabel(watermarkTexts.panel.options.textLabel).fill(MARK);
    await page.getByLabel(watermarkTexts.panel.options.textLabel).blur();
    await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf', `${NAME}.pdf`)]);
    await page.getByRole('button', { name: must(watermarkTexts.panel.action) }).click();
    // F14 (criterion 5 of the prompt; review F14 d-1): the page view of the new PDF opens and closes on the way, and sends
    // no event of its own (the list below stays the four).
    const viewButton = page.locator('#fo-tool-root .fo-result__view');
    await expect(viewButton).toBeVisible({ timeout: 60_000 });
    await viewButton.click();
    await expect(page.locator('#fo-tool-root .fo-pview .fo-pview__img')).toBeVisible({ timeout: 30_000 });
    await page.locator('#fo-tool-root .fo-pview__back').click();
    await expect(viewButton).toBeFocused();
    await takePdfDownload(page);
    await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
    await page.locator('#fo-tool-root .fo-btn--download').click();
    const chip = page.locator('nav.fo-next a.fo-chip').first();
    const target = ((await chip.getAttribute('href')) ?? '').replaceAll('/', '');
    await chip.click();

    const events = await sent(page);
    // The page name is the registry's, the outcome is this tool's word, the chip names the page it leads to.
    expect(events).toEqual([
      ['tool_start', { tool: 'watermark-pdf', lang: 'en' }],
      ['tool_complete', { tool: 'watermark-pdf', lang: 'en', outcome: 'watermarked' }],
      ['download', { tool: 'watermark-pdf', lang: 'en' }],
      ['next_step_click', { tool: 'watermark-pdf', lang: 'en', target }],
    ]);
    expect(PDF_PAGES['watermark-pdf'].next as readonly string[], 'the chip leads to a page of the registry').toContain(target);
    for (const event of events) expectClosed(event);
    await expectNoTrace(page);
  });

  test('a PDF tool that refuses files sends tool_error with the reason and the format, nothing else', async ({ page }) => {
    await openTool(page, '/merge-pdf/');
    // Six files no merge can use, each under a name with the sentinel: they are refused one by one, on their own rows.
    const refused = [...BROKEN_PDFS, 'gen-cifrado-aes256.pdf', 'gen-cifrado-dono.pdf'];
    await choosePdfs(page, refused.map((name, i) => pdfFile(name, `${NAME}-${i}.pdf`)));
    await expect(page.locator('.fo-filelist__row .fo-file__err')).toHaveCount(refused.length, { timeout: 30_000 });
    await expect(page.getByRole('button', { name: must(mergeTexts.panel.action) })).toHaveCount(0);

    const events = await sent(page);
    const errors = events.filter(([name]) => name === 'tool_error');
    expect(errors.map(([, params]) => `${String(params['reason'])} / ${String(params['codec'])}`).sort()).toEqual([
      'empty / empty',
      'needs-password / application/pdf',
      'not-pdf / image/jpeg',
      'not-pdf / unknown',
      'restricted / application/pdf',
      'truncated / application/pdf',
    ]);
    for (const [, params] of errors) expect(Object.keys(params).sort()).toEqual(['browser', 'codec', 'lang', 'reason', 'tool']);
    // One start for the whole batch, and one end: nothing came out.
    expect(events.filter(([name]) => name !== 'tool_error')).toEqual([
      ['tool_start', { tool: 'merge-pdf', lang: 'en' }],
      ['tool_complete', { tool: 'merge-pdf', lang: 'en', outcome: 'failed' }],
    ]);
    for (const event of events) expectClosed(event);
    await expectNoTrace(page);
  });

  test('a wrong password is an event without the password, and the right one ends the run as "unlocked"', async ({ page }) => {
    await openTool(page, '/unlock-pdf/');
    await choosePdfs(page, [pdfFile('gen-cifrado-aes256.pdf', `${NAME}.pdf`)]);
    const field = page.getByLabel(unlockTexts.panel.options.passwordLabel, { exact: true });
    await field.fill(PASSWORD);
    await page.getByRole('button', { name: must(unlockTexts.panel.options.submit) }).click();
    await expect(page.getByText(/That password didn't open/).first()).toBeVisible({ timeout: 30_000 });
    await field.fill(PDF_ORACLE.passwords['aes256'] ?? '');
    await page.getByRole('button', { name: must(unlockTexts.panel.options.submit) }).click();
    await takePdfDownload(page);

    const events = await sent(page);
    expect(events.map(([name]) => name)).toEqual(['tool_start', 'tool_error', 'tool_complete']);
    expect(events[1]?.[1]).toMatchObject({ tool: 'unlock-pdf', lang: 'en', codec: 'application/pdf', reason: 'wrong-password' });
    expect(Object.keys(events[1]?.[1] ?? {}).sort()).toEqual(['browser', 'codec', 'lang', 'reason', 'tool']);
    expect(events[2]).toEqual(['tool_complete', { tool: 'unlock-pdf', lang: 'en', outcome: 'unlocked' }]);
    for (const event of events) expectClosed(event);
    // Neither the wrong password nor the right one, and not the name of the file.
    expect(JSON.stringify(await dataLayer(page))).not.toContain(PDF_ORACLE.passwords['aes256'] ?? 'unreachable');
    await expectNoTrace(page);
  });

  // F18 (DECISOES § 725 and § 743): PDF_EVENT_TOOLS names the two PDF presets too, after the tools, and a PDF preset is a
  // link of the table of the presets of the hub, never a card of its grid. The registry tells the two apart (PDF_TOOL_IDS):
  // the grid is exactly the tools of the event list, and every other name of the list is a PDF preset, linked from the
  // table, so no name of the event list is left without its place on the hub.
  test('the hub lists exactly the PDF tools the events name, and its table of presets the PDF presets they name', async ({ page }) => {
    expect((await page.goto('/pdf-tools/'))?.status()).toBe(200);
    const tools: readonly string[] = PDF_EVENT_TOOLS.filter((id) => (PDF_TOOL_IDS as readonly string[]).includes(id));
    const presets: readonly string[] = PDF_EVENT_TOOLS.filter((id) => !tools.includes(id));
    const hrefs = await page.locator('ul.fo-grid a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    const ids = hrefs.map((href) => href.replaceAll('/', '')).filter((id) => tools.includes(id));
    expect(ids).toEqual(tools.filter((id) => ids.includes(id)));
    expect(new Set(ids)).toEqual(new Set(tools));
    expect(new Set(tools), 'every PDF tool of the registry is in the event list').toEqual(new Set(PDF_TOOL_IDS));
    // The one card that is not a PDF tool is the Image to PDF page, which has an event name of its own (a card of a
    // preset would be here too).
    const others = hrefs.map((href) => href.replaceAll('/', '')).filter((id) => !tools.includes(id));
    expect(others).toEqual(['image-to-pdf']);
    expect(EVENT_TOOLS).toContain('image-to-pdf');
    // The rest of the event list: the PDF presets of the registry, in its order, each a link of the table of the hub.
    expect(presets, 'the names of the event list that are not tools are the PDF presets').toEqual([...PDF_PRESET_IDS]);
    const table = await page.locator('section[aria-labelledby="presets"] table tbody a').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(table).toEqual(presets.map((id) => PDF_PAGES[id as PdfPageId].path));
  });
});

/* F12 · a parede do bloqueador (decision 5; § 432). The adblock_wall event, in the test build seen as fileorca.com
   (tests/e2e/lib/wall.ts): each action of the closed list (shown, help only when the panel opens, reload and escape, never
   a "close") with the mode of the closed list and the language, and nothing else. The reload empties the dataLayer, so
   the events go through the sessionStorage of the tab too, kept by an init script. */
test.describe('adblock_wall', () => {
  useTestBuild(test);
  test.use({ timezoneId: 'America/Sao_Paulo' });

  test('carries only an action and a mode of its closed lists, and the language', async ({ page, context }) => {
    await page.addInitScript(() => {
      const KEY = 'fo-test-wall-events';
      const kept: unknown[] = JSON.parse(sessionStorage.getItem(KEY) ?? '[]');
      const layer: unknown[] = [];
      const push = layer.push.bind(layer);
      layer.push = (...items: unknown[]) => {
        for (const item of items) {
          const entry = Array.from(item as ArrayLike<unknown>);
          if (entry[0] === 'event' && entry[1] === 'adblock_wall') kept.push(entry[2]);
        }
        sessionStorage.setItem(KEY, JSON.stringify(kept));
        return push(...items);
      };
      (window as unknown as { dataLayer: unknown[] }).dataLayer = layer;
    });
    const kept = async () => JSON.parse((await page.evaluate(() => sessionStorage.getItem('fo-test-wall-events'))) ?? '[]') as Record<string, unknown>[];

    // The wall (bloqueio): shown, the help opened and closed (one help), the reload (the page comes back with the wall),
    // then the escape.
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.EXTENSION) });
    await expectWallOpen(page, 'bloqueio');
    await page.locator('[data-wall="help"]').click();
    await page.locator('[data-wall="help"]').click();
    await Promise.all([page.waitForEvent('load'), page.locator('[data-wall="reload"]').click()]);
    await expectWallOpen(page, 'bloqueio');
    await page.locator('[data-wall="escape"]').click();
    // A page in Portuguese: free for 30 minutes after the escape (no event); without the escape, the wall again.
    await page.goto(`${PRODUCTION_ORIGIN}/pt/comprimir-imagem/`);
    await page.evaluate(() => localStorage.removeItem('fo-wall-escape'));
    await page.reload();
    await expectWallOpen(page, 'bloqueio');
    const events = await kept();
    expect(events.map((event) => [event['action'], event['mode'], event['lang']])).toEqual([
      ['shown', 'bloqueio', 'en'],
      ['help', 'bloqueio', 'en'],
      ['reload', 'bloqueio', 'en'],
      ['shown', 'bloqueio', 'en'],
      ['escape', 'bloqueio', 'en'],
      ['shown', 'bloqueio', 'pt'],
    ]);
    for (const event of events) {
      expect(Object.keys(event).sort()).toEqual(['action', 'lang', 'mode']);
      expect(WALL_ACTIONS).toContain(event['action']);
      expect(WALL_EVENT_MODES).toContain(event['mode']);
    }
    // Esc does not close the wall, and sends nothing.
    await page.keyboard.press('Escape');
    expect((await wallEvents(page)).map((event) => event['action'])).toEqual(['shown']);
  });

  test('the notice of the network-level blocker sends its mode, and Esc sends nothing', async ({ page, context }) => {
    await openAsProduction(page, context, { recovery: googlefcStub(STATUS.NETWORK) }, `${PRODUCTION_ORIGIN}/es/comprimir-imagen/`);
    await expectWallOpen(page, 'aviso');
    await page.keyboard.press('Escape');
    await expect(page.locator('#fo-wall')).not.toHaveAttribute('open', '');
    expect(await wallEvents(page)).toEqual([{ action: 'shown', mode: 'aviso', lang: 'es' }]);
  });
});
