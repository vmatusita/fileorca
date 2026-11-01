import { expect, test, type Page } from '@playwright/test';
import { CODECS, ERROR_REASONS, EVENT_PARAMS, OUTCOMES } from '../../src/analytics/events.ts';
import { EVENT_TOOLS, PDF_EVENT_TOOLS } from '../../src/analytics/tool-ids.ts';
import { PDF_PAGES } from '../../src/tools/pdf/registry.ts';
import unlockTexts from '../../src/tools/unlock-pdf/i18n/en.ts';
import watermarkTexts from '../../src/tools/watermark-pdf/i18n/en.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import { dataLayer, dismissCookies, hydrated, useImage } from './lib/page.ts';
import { BROKEN_PDFS, PDF_ORACLE, choosePdfs, openTool, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';

// donate_click, next_step_click and the cookie notice, end to end.

async function lastEvent(page: Page, name: string) {
  return (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === name).at(-1);
}

test('the footer coffee link sends donate_click with place footer and the language', async ({ page }) => {
  await page.goto('/pt/sobre/');
  // The open notice floats over the end of the page (DECISOES § 106): the choice comes first, as a person's would.
  await dismissCookies(page);
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
  // A small generated photo through the shared helper, which waits for the result like every other spec: the
  // chip comes with the result card, and the 8 MP photo took more than the 5 s an expect waits on the CI runner.
  await useImage(page);
  const chip = page.locator('nav.fo-next a.fo-chip');
  await expect(chip).toHaveAttribute('href', '/es/');
  await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
  await chip.click();
  expect(await lastEvent(page, 'next_step_click')).toEqual(['event', 'next_step_click', { tool: 'compress-image', lang: 'es', target: 'home' }]);
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
    const buttons = page.locator('.fo-export .fo-btn');
    const csv = page.waitForEvent('download');
    await buttons.nth(1).click();
    await csv;
    expect(await lastEvent(page, 'export_click')).toEqual(['event', 'export_click', { tool: 'mortgage-calculator-biweekly', lang: 'en', format: 'csv' }]);
    const pdf = page.waitForEvent('download');
    await buttons.nth(0).click();
    await pdf;
    expect(await lastEvent(page, 'export_click')).toEqual(['event', 'export_click', { tool: 'mortgage-calculator-biweekly', lang: 'en', format: 'pdf' }]);
    await buttons.nth(2).click();
    expect(await lastEvent(page, 'share_click')).toEqual(['event', 'share_click', { tool: 'mortgage-calculator-biweekly', lang: 'en' }]);
    const chip = page.locator('.fo-calc__next a.fo-chip').first();
    const href = (await chip.getAttribute('href')) ?? '';
    await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), { capture: false }));
    await chip.click();
    expect(await lastEvent(page, 'next_step_click')).toEqual(['event', 'next_step_click', { tool: 'mortgage-calculator-biweekly', lang: 'en', target: href.replaceAll('/', '-').replace(/^-|-$/g, '') }]);
  });
});

// F5a (decision 11, DECISOES § F5a-eventos): the events of the PDF tools, from real runs. The tool list of the events is
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

  test('the hub lists exactly the PDF tools the events name', async ({ page }) => {
    await page.goto('/pdf-tools/');
    const hrefs = await page.locator('ul.fo-grid a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    const ids = hrefs.map((href) => href.replaceAll('/', '')).filter((id) => (PDF_EVENT_TOOLS as readonly string[]).includes(id));
    expect(ids).toEqual([...PDF_EVENT_TOOLS].filter((id) => ids.includes(id)));
    expect(new Set(ids)).toEqual(new Set(PDF_EVENT_TOOLS));
    // The one card that is not a PDF tool is the Image to PDF page, which has an event name of its own.
    const others = hrefs.map((href) => href.replaceAll('/', '')).filter((id) => !(PDF_EVENT_TOOLS as readonly string[]).includes(id));
    expect(others).toEqual(['image-to-pdf']);
    expect(EVENT_TOOLS).toContain('image-to-pdf');
  });
});
