import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { LANGS, ROUTES, routeById, type Lang } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { iconInner } from '../../src/icons/svg.ts';
import { dismissCookies, dragOver, generatedJpeg, hydrated, openAdjust, openCompare, slowEngine, startOver, type TestFile } from './lib/page.ts';

// F13a · a página de ferramenta "um lugar só" nas ferramentas de imagem (UX-04 A; decision 5 of the run; DECISOES § 463 and
// § 464 to § 474). The rectangle (.fo-slot) has one height in every state (356px on a phone, 340px from
// 768px) and never changes without a gesture; the one Oli sits in its corner; the result is the sea that rose; the band
// under it keeps its height; the comparison and the options open only when asked; the error says the case (D-06, D-17);
// the handle of the comparison has two arrows (D-09); a HEIC that grows says so (F10 p-13); the interaction does not move
// the page (F4-F7 e-2); the rectangle ends above the fold of a phone (F4-F7 f-2). The axe of every state is in
// tool-slot-axe.spec.ts.

const SLOT = { phone: 356, wide: 340 } as const;
const PHONE = { width: 360, height: 740 } as const;
const WIDE = { width: 1280, height: 800 } as const;

/** Every image tool and preset page, in the three languages, from the route map. */
const IMAGE_ROUTES = ROUTES.filter((route) => Object.hasOwn(IMAGE_PAGES, route.id));
const PAGES = IMAGE_ROUTES.flatMap((route) => LANGS.flatMap((lang) => (route.paths[lang] ? [{ id: route.id as ImagePageId, lang, path: route.paths[lang] }] : [])));
const pathOf = (id: ImagePageId, lang: Lang): string => routeById(id).paths[lang] ?? '/';

const fixture = (name: string, as = name, mimeType = 'image/jpeg'): TestFile => ({ name: as, mimeType, buffer: readFileSync(resolve('fixtures/images', name)) });
/** The file each page takes on its usual path: the converters take their one format, the thumbnail a photo bigger than its frame. */
const INPUT: Partial<Record<ImagePageId, () => TestFile>> = {
  'heic-to-jpg': () => fixture('heic-08-iphone13pro-paisagem-hdr-ios17.heic', 'photo.heic', 'image/heic'),
  'webp-to-jpg': () => fixture('gen-webp-exif-gps.webp', 'photo.webp', 'image/webp'),
  // 1600 × 1200: cut to 16:9, not enlarged. A photo smaller than 1280 × 720 adds a second note (DECISOES § 464).
  'resize-image-youtube-thumbnail': () => fixture('gen-jpg-02-orientacao8.jpg', 'photo.jpg'),
};
async function inputFor(page: Page, id: ImagePageId): Promise<TestFile> {
  const own = INPUT[id];
  return own ? own() : { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) };
}
const NOT_AN_IMAGE = (): TestFile => fixture('gen-texto-extensao-png.png', 'notes.png', 'image/png');

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
  await hydrated(page);
  await page.evaluate(() => document.fonts.ready);
}

const height = (page: Page, selector: string): Promise<number> => page.evaluate((sel) => document.querySelector(sel)?.getBoundingClientRect().height ?? -1, selector);
const frames = (page: Page): Promise<unknown> => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));

/** The height of the rectangle at 360 and at 1280px, on the page as it is now (the layout is CSS: a resize gives what a load gives). */
async function slotAtBothWidths(page: Page, state: string, found: string[]): Promise<void> {
  for (const [viewport, wanted] of [[PHONE, SLOT.phone], [WIDE, SLOT.wide]] as const) {
    await page.setViewportSize(viewport);
    await frames(page);
    const got = await height(page, '.fo-slot');
    if (Math.abs(got - wanted) > 1) found.push(`${state} a ${viewport.width}px: ${got.toFixed(1)}px (esperado ${wanted})`);
  }
  await page.setViewportSize(PHONE);
}

test.describe('the rectangle keeps one height in the five states of the first use', () => {
  for (const { id, path } of PAGES) {
    test(`${path}: at rest, with a file over it, processing, with the result and with the error, at 360 and 1280px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(PHONE);
      const engine = await slowEngine(page);
      await open(page, path);
      await dismissCookies(page);
      const found: string[] = [];
      await slotAtBothWidths(page, 'repouso', found);

      const transfer = await page.evaluateHandle(() => {
        const data = new DataTransfer();
        data.items.add(new File([new Uint8Array(16)], 'dragged.jpg', { type: 'image/jpeg' }));
        return data;
      });
      await page.dispatchEvent('.fo-drop', 'dragenter', { dataTransfer: transfer });
      await expect(page.locator('.fo-drop[data-state="over"]')).toBeVisible();
      await slotAtBothWidths(page, 'arquivo em cima', found);
      await page.dispatchEvent('.fo-drop', 'dragleave', { dataTransfer: transfer });
      await expect(page.locator('.fo-drop[data-state="over"]')).toHaveCount(0);

      await page.setInputFiles('input[type="file"]', await inputFor(page, id));
      await expect(page.locator('.fo-level')).toBeVisible();
      await slotAtBothWidths(page, 'processando', found);
      engine.release();

      await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 55_000 });
      await slotAtBothWidths(page, 'resultado', found);

      await startOver(page);
      await page.setInputFiles('input[type="file"]', NOT_AN_IMAGE());
      await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible({ timeout: 30_000 });
      await slotAtBothWidths(page, 'erro', found);
      expect(found, `${path}: o retângulo mudou de altura`).toEqual([]);
    });
  }
});

// F4-F7 f-2: the H1 takes the whole measure and only the seal row leaves room for the Oli, so the rectangle of every tool
// and preset page ends above the fold of a 360 × 740 phone, with the fonts and with the fallback faces (the fonts aborted).
const FONTS = /(figtree|fredoka)[^/]*\.woff2$/;

async function slotBottoms(browser: Browser, lang: Lang, withFonts: boolean): Promise<string[]> {
  const context = await browser.newContext({ viewport: PHONE, serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
  if (!withFonts) await context.route(FONTS, (route) => route.abort());
  const page = await context.newPage();
  const over: string[] = [];
  for (const { path } of PAGES.filter((one) => one.lang === lang)) {
    await open(page, path);
    const bottom = await page.evaluate(() => (document.querySelector('.fo-slot')?.getBoundingClientRect().bottom ?? 9999) + scrollY);
    if (bottom > PHONE.height) over.push(`${path} ${withFonts ? 'com' : 'sem'} a fonte: base em ${bottom.toFixed(0)}px`);
  }
  await context.close();
  return over;
}

test.describe('the rectangle ends above the fold of a 360 × 740 phone', () => {
  for (const lang of LANGS) {
    test(`every image tool and preset page in ${lang}, with and without the fonts`, async ({ browser }) => {
      test.setTimeout(120_000);
      const over = [...(await slotBottoms(browser, lang, true)), ...(await slotBottoms(browser, lang, false))];
      expect(over).toEqual([]);
    });
  }
});

// Obs. 8 of the F10: on the first visit (the cookie notice open), the focus that goes to the Download when the result
// comes does not scroll the page, and the notice covers neither the Download nor "Choose images".
for (const lang of LANGS) {
  test(`first visit at 360 × 740 (${lang}): the focus on the Download does not scroll the page, and the notice covers nothing of it`, async ({ page }) => {
    await page.setViewportSize(PHONE);
    await open(page, pathOf('compress-image', lang));
    await expect(page.locator('#fo-cookie')).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
    await expect(page.locator('.fo-btn--download')).toBeFocused({ timeout: 30_000 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => scrollY), 'the focus on the Download scrolled the page').toBe(0);
    const overlap = await page.evaluate(() => {
      const notice = document.getElementById('fo-cookie')?.getBoundingClientRect();
      const download = document.querySelector('.fo-btn--download')?.getBoundingClientRect();
      if (!notice || !download) return -1;
      return Math.max(0, Math.min(notice.bottom, download.bottom) - Math.max(notice.top, download.top)) * Math.max(0, Math.min(notice.right, download.right) - Math.max(notice.left, download.left));
    });
    expect(overlap, 'the notice over the Download').toBe(0);
  });
}

// D-05, D-11 and D-49 of the F10: the chips sit right under the rectangle, at most 220px under the Download.
test('the chips are at most 220px under the Download, at 360 and 1280px', async ({ page }) => {
  for (const viewport of [PHONE, WIDE]) {
    await page.setViewportSize(viewport);
    await open(page, '/compress-image/');
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
    await expect(page.locator('.fo-btn--download')).toBeFocused({ timeout: 30_000 });
    const gap = await page.evaluate(() => {
      const download = document.querySelector('.fo-btn--download')?.getBoundingClientRect();
      const chip = document.querySelector('nav.fo-next a.fo-chip')?.getBoundingClientRect();
      return download && chip ? chip.top - download.bottom : Infinity;
    });
    expect(gap, `${viewport.width}px: from the Download to the first chip`).toBeLessThanOrEqual(220);
    expect(gap).toBeGreaterThanOrEqual(0);
  }
});

// D-06 and F10 p-14: a .png with no image inside hears that its name and its content disagree, never "try PNG".
const MISMATCH: Record<Lang, RegExp> = {
  en: /^notes\.png ends in \.png, but it isn't an image inside\. Save it again as JPG, PNG or WebP\.$/,
  pt: /^notes\.png termina em \.png, mas por dentro não é uma imagem\. Salve de novo como JPG, PNG ou WebP\.$/,
  es: /^notes\.png termina en \.png, pero por dentro no es una imagen\. Guárdalo de nuevo como JPG, PNG o WebP\.$/,
};
for (const lang of LANGS) {
  test(`D-06 (${lang}): a .png that is no image hears that the content does not match the name, with no "try PNG"`, async ({ page }) => {
    await open(page, pathOf('compress-image', lang));
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', NOT_AN_IMAGE());
    const alert = page.locator('.fo-drop[data-state="error"] [role="alert"]');
    await expect(alert).toBeVisible({ timeout: 30_000 });
    const why = page.locator('.fo-drop__why');
    await expect(why).toHaveText(MISMATCH[lang]);
    expect(await why.textContent(), 'no "try PNG" for a .png').not.toMatch(/\b(Try|Tente|Prueba)\b[^.]*PNG/);
    // The error has no round seal: the sentence carries the alert icon, and the way out comes right after the reason.
    await expect(page.locator('.fo-drop[data-state="error"] .fo-drop__badge')).toHaveCount(0);
    await expect(page.locator('.fo-drop__error-title svg')).toHaveCount(1);
    expect(await page.locator('.fo-drop[data-state="error"] > button').evaluate((button) => button.previousElementSibling?.className)).toBe('fo-drop__error');
  });
}

// D-17: a PNG on HEIC to JPG hears that it is a PNG, and the band under the rectangle shows the chip to PNG to JPG (48px).
const ELSEWHERE: Record<Lang, { label: string; name: string; reason: RegExp }> = {
  en: { label: 'For a PNG:', name: 'PNG to JPG', reason: /^notes\.png is a PNG, not a HEIC photo\. To get a JPG from it, use PNG to JPG\.$/ },
  pt: { label: 'Para um PNG:', name: 'PNG para JPG', reason: /^notes\.png é um PNG, não uma foto HEIC\. Para ter um JPG, use o PNG para JPG\.$/ },
  es: { label: 'Para un PNG:', name: 'PNG a JPG', reason: /^notes\.png es un PNG, no una foto HEIC\. Para tener un JPG, usa PNG a JPG\.$/ },
};
for (const lang of LANGS) {
  test(`D-17 (${lang}): a PNG on HEIC to JPG gets the chip to PNG to JPG in the band, 48px tall`, async ({ page }) => {
    await open(page, pathOf('heic-to-jpg', lang));
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', fixture('gen-png-transparente.png', 'notes.png', 'image/png'));
    await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.fo-drop__why')).toHaveText(ELSEWHERE[lang].reason);
    const nav = page.locator('.fo-band').getByRole('navigation', { name: ELSEWHERE[lang].label, exact: true });
    await expect(nav).toBeVisible();
    const chip = nav.getByRole('link', { name: ELSEWHERE[lang].name, exact: true });
    await expect(chip).toHaveAttribute('href', pathOf('png-to-jpg', lang));
    expect((await chip.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    // In place of the options: the "Save as" choice is not in the band while the chip is.
    await expect(page.locator('.fo-band input[name="hj-to"]')).toHaveCount(0);
  });
}

// UX-04 A: the comparison opens only when asked, and "Adjust" holds the options after the result: changing the level
// there redoes the image at once, with the disclosure still open and the focus on the option.
test('the comparison is closed until "Before and after" is pressed, and "Adjust" redoes the image at once', async ({ page }) => {
  await open(page, '/compress-image/');
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', fixture('jpg-02-iphone6-paisagem-gps.jpg', 'photo.jpg'));
  await expect(page.locator('.fo-btn--download')).toBeFocused({ timeout: 30_000 });
  const button = page.getByRole('button', { name: 'Before and after', exact: true });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toHaveAttribute('aria-controls', 'fo-compare');
  await expect(page.locator('#fo-compare')).toBeHidden();
  await expect(page.locator('.fo-ba')).toHaveCount(0);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('slider', { name: 'Compare before and after' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.fo-ba')).toHaveCount(0);

  const adjust = page.locator('details.fo-adjust');
  await expect(adjust).toHaveJSProperty('open', false);
  await expect(adjust.locator('summary')).toHaveText(/^Adjust · Recommended$/);
  const before = await page.locator('.fo-btn--download').getAttribute('href');
  await openAdjust(page);
  await expect(adjust.locator('.fo-adjust__body')).toContainText('Changing the level redoes the image right away.');
  await page.locator('input[name="ci-level"][value="recommended"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.fo-btn--download')).not.toHaveAttribute('href', before ?? '', { timeout: 30_000 });
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  await expect(adjust.locator('summary')).toHaveText(/^Adjust · Strong$/);
  await expect(adjust).toHaveJSProperty('open', true);
  await expect(page.locator('input[name="ci-level"][value="strong"]')).toBeFocused();
  await expect(page.getByRole('button', { name: /apply/i })).toHaveCount(0);
});

// D-09: the handle of the comparison has the two arrows, so it reads as "drag both ways".
test('D-09: the handle of the comparison draws two arrows', async ({ page }) => {
  await open(page, '/compress-image/');
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
  await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
  await openCompare(page);
  const paths = page.locator('.fo-ba__knob svg path');
  await expect(paths).toHaveCount(2);
  expect(await paths.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('d')))).toEqual(['m9 7-4 5 4 5', 'm15 7 4 5-4 5']);
});

// F13a · UX-16 (decision 8; DECISOES § 493): the round seal of the DropZone at rest is the file-drop (a file that goes into the
// water), in both islands; with a file over the zone it is still the download. Before, the seal at rest was the upload arrow.
test('the seal of the DropZone is the file-drop at rest and the download with a file over it, in both islands', async ({ page }) => {
  // The file's drawing, serialized by the browser as the inline icon is (the file closes its paths with "/>").
  const inner = (name: string): Promise<string> =>
    page.evaluate((raw) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.innerHTML = raw;
      return svg.innerHTML.replace(/\s+/g, ' ').trim();
    }, iconInner(readFileSync(resolve('docs/design/assets/Icons', `${name}.svg`), 'utf8')));
  const drawn = () => page.locator('.fo-drop__badge svg').first().evaluate((svg) => svg.innerHTML.replace(/\s+/g, ' ').trim());
  for (const path of ['/compress-image/', '/pt/juntar-pdf/', '/es/heic-a-jpg/', '/merge-pdf/']) {
    await open(page, path);
    await dismissCookies(page);
    expect(await drawn(), `${path} at rest`).toBe(await inner('file-drop'));
    await dragOver(page);
    expect(await drawn(), `${path} with a file over it`).toBe(await inner('download'));
  }
});

// F10 p-13: a HEIC whose JPG comes out bigger says the change with its sign, and nothing on the HEIC page says the JPG is lighter.
// A sentence that says the JPG is the lighter one (the old "Save as" help: "JPG is lighter and opens everywhere"; pt "O JPG é
// mais leve"; es "El JPG pesa menos"). The card of Compress image ("Make a JPG, PNG or WebP lighter") is another claim.
const LIGHTER: Record<Lang, RegExp> = { en: /JPG (is|gets|comes out) lighter/i, pt: /JPG (é|fica|sai) mais leve/i, es: /JPG (pesa menos|es más liger|queda más liger)/i };
test('F10 p-13: a JPG bigger than its HEIC says "+N%", and no text of the HEIC page says the JPG is lighter', async ({ page }) => {
  test.setTimeout(120_000);
  for (const lang of LANGS) {
    await open(page, pathOf('heic-to-jpg', lang));
    await dismissCookies(page);
    expect(await page.locator('main').innerText(), `${lang}: the page at rest`).not.toMatch(LIGHTER[lang]);
  }
  await open(page, '/heic-to-jpg/');
  await dismissCookies(page);
  // heic-01: 721,093 bytes; its JPG is about 1.2 MB (D-14 and D-51 of the F10).
  await page.setInputFiles('input[type="file"]', fixture('heic-01-iphone11pro-retrato-livephoto.heic', 'photo.heic', 'image/heic'));
  await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 90_000 });
  const change = page.locator('.fo-numbers__change dd');
  await expect(change).toHaveText(/^\+\d+%$/);
  expect(Number((await change.textContent())?.replace(/\D/g, ''))).toBeGreaterThan(20);
  await openAdjust(page);
  expect(await page.locator('main').innerText(), 'the page with the result and the options open').not.toMatch(LIGHTER.en);
});

// Every button of the island is 48px tall or more, at 360 and at 1280px: at rest, with the result (the comparison, "Adjust"
// and the coffee line of the 3rd use open) and with the error. The new controls are in the list.
test('every visible button of the island is at least 48px tall, at 360 and 1280px', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('fo-consent', 'granted');
    if (!localStorage.getItem('fo-coffee')) localStorage.setItem('fo-coffee', JSON.stringify({ uses: 2 }));
  });
  const short: string[] = [];
  const seen = new Set<string>();
  const measure = async (state: string) => {
    for (const viewport of [PHONE, WIDE]) {
      await page.setViewportSize(viewport);
      await frames(page);
      const controls = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('#fo-tool-root :is(button, a.fo-btn, a.fo-chip, summary, [role="button"])')]
          .filter((node) => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden')
          .map((node) => ({ name: (node.getAttribute('aria-label') ?? node.textContent ?? '').trim().replace(/\s+/g, ' '), height: node.getBoundingClientRect().height })),
      );
      for (const control of controls) {
        seen.add(control.name.split(' · ')[0] ?? control.name);
        if (control.height < 48) short.push(`${state} ${viewport.width}px: "${control.name}" ${control.height.toFixed(1)}px`);
      }
    }
  };
  await open(page, '/compress-image/');
  await measure('repouso');
  await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
  await expect(page.locator('.fo-result .fo-result__support')).toBeVisible({ timeout: 30_000 });
  await openCompare(page);
  await openAdjust(page);
  await measure('resultado');
  await page.locator('.fo-result__more > button').first().click();
  await page.setInputFiles('input[type="file"]', NOT_AN_IMAGE());
  await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible({ timeout: 30_000 });
  await measure('erro');
  expect(short).toEqual([]);
  for (const name of ['Choose images', 'Download', 'Start over', 'Before and after', 'Adjust', 'Buy me a coffee', "Don't show this again", 'Choose other files']) {
    expect([...seen].some((one) => one.startsWith(name)), `${name} was measured`).toBe(true);
  }
});

// The Oli of the rectangle sits on its top border, over the seal row. No line of text of the page falls under her box, from
// 320 to 1280px, on every tool and preset page (the same measure as tool-guides.spec.ts makes on the guides).
const OLI_WIDTHS = [320, 360, 390, 600, 768, 1280];
for (const lang of LANGS) {
  test(`the Oli in the corner of the rectangle covers no text, from 320 to 1280px (${lang})`, async ({ page }) => {
    test.setTimeout(120_000);
    const hits: string[] = [];
    for (const { path } of PAGES.filter((one) => one.lang === lang)) {
      await open(page, path);
      await dismissCookies(page);
      for (const width of OLI_WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await frames(page);
        const found = await page.evaluate(() => {
          const olis = [...document.querySelectorAll('main [data-oli]')].map((oli) => oli.getBoundingClientRect()).filter((box) => box.width > 0 && box.height > 0);
          const out: string[] = [];
          const walker = document.createTreeWalker(document.querySelector('main') as Node, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent ?? '';
            if (!text.trim() || node.parentElement?.closest('.fo-sr, [aria-hidden="true"], [data-oli]')) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const line of range.getClientRects()) {
              for (const oli of olis) {
                const x = Math.min(line.right, oli.right) - Math.max(line.left, oli.left);
                const y = Math.min(line.bottom, oli.bottom) - Math.max(line.top, oli.top);
                if (x > 0.5 && y > 0.5) out.push(`"${text.trim().slice(0, 40)}" (${Math.round(x)} × ${Math.round(y)} px)`);
              }
            }
          }
          return out;
        });
        hits.push(...found.map((hit) => `${path} ${width}px: ${hit}`));
      }
    }
    expect(hits, 'text under the Oli').toEqual([]);
  });
}

// F4-F7 e-2: the interaction moves nothing. A PerformanceObserver of layout-shift, opened before the file is chosen, adds
// every shift without a recent input from the choice until 1.5 s after the Download (Chromium; the WebKit has no such API,
// and there the rectangle and the band keep their place).
interface Shifts {
  cls: number;
  moved: string[];
}

async function watchShifts(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    const shifts = { cls: 0, moved: [] as string[], from: Infinity };
    (window as unknown as { __shifts: typeof shifts }).__shifts = shifts;
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Shift[]) {
        if (entry.hadRecentInput || entry.startTime < shifts.from) continue;
        shifts.cls += entry.value;
        for (const { node, previousRect, currentRect } of entry.sources) {
          const name = node instanceof Element ? `<${node.tagName.toLowerCase()} class="${node.className}">` : `"${(node?.textContent ?? '').trim().slice(0, 24)}"`;
          shifts.moved.push(`${entry.value.toFixed(3)} ${name} y ${Math.round(previousRect.y)}→${Math.round(currentRect.y)}`);
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

/** One use at 360 × 740: the shifts after the choice, and where the rectangle and the band were before and after. */
async function oneUse(page: Page, path: string, file: TestFile, until = '.fo-btn--download'): Promise<{ shifts: Shifts; before: number[]; after: number[] }> {
  await page.setViewportSize(PHONE);
  await open(page, path);
  await frames(page);
  const place = () => page.evaluate(() => [document.querySelector('.fo-band')?.getBoundingClientRect().top ?? -1, document.querySelector('.fo-slot')?.getBoundingClientRect().height ?? -1].map(Math.round));
  const before = await place();
  await page.evaluate(() => {
    (window as unknown as { __shifts: { from: number } }).__shifts.from = performance.now();
  });
  await page.setInputFiles('input[type="file"]', file);
  await expect(page.locator(until)).toBeVisible({ timeout: 55_000 });
  await page.waitForTimeout(1500);
  const shifts = await page.evaluate(() => (window as unknown as { __shifts: Shifts }).__shifts);
  return { shifts, before, after: await place() };
}

test.describe('the interaction moves nothing at 360 × 740', () => {
  test('compress, HEIC to JPG, WebP to JPG and resize: the layout shift of the use is 0.05 at most', async ({ browser, browserName }) => {
    test.setTimeout(180_000);
    const results: string[] = [];
    for (const id of ['compress-image', 'heic-to-jpg', 'webp-to-jpg', 'resize-image'] as const) {
      const context = await browser.newContext({ viewport: PHONE, serviceWorkers: 'block' });
      await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
      await watchShifts(context);
      const page = await context.newPage();
      const file = await inputFor(page, id);
      const { shifts, before, after } = await oneUse(page, pathOf(id, 'en'), file);
      results.push(`${id}: ${shifts.cls.toFixed(3)}${shifts.moved.length ? ` (${shifts.moved.slice(0, 4).join('; ')})` : ''}`);
      if (browserName === 'chromium') expect(shifts.cls, `${id}: ${shifts.moved.join('; ')}`).toBeLessThanOrEqual(0.05);
      expect(after, `${id}: the band and the rectangle keep their place`).toEqual(before);
      await context.close();
    }
    console.log(`[cls da interação] ${browserName} ${results.join(' | ')}`);
  });

  // The 3rd use shows the coffee line (DECISOES § 49 and § 436). It is known when the batch starts, so the rectangle takes
  // its room then (DECISOES § 470), and the result pushes nothing down.
  test('the 3rd use, with the coffee line: the layout shift of the use is 0.05 at most', async ({ browser, browserName }) => {
    const context = await browser.newContext({ viewport: PHONE, serviceWorkers: 'block' });
    await context.addInitScript(() => {
      localStorage.setItem('fo-consent', 'granted');
      localStorage.setItem('fo-coffee', JSON.stringify({ uses: 2 }));
    });
    await watchShifts(context);
    const page = await context.newPage();
    const file = await inputFor(page, 'compress-image');
    const { shifts } = await oneUse(page, '/compress-image/', file, '.fo-result .fo-result__support');
    console.log(`[cls da interação] ${browserName} 3º uso: ${shifts.cls.toFixed(3)} ${shifts.moved.slice(0, 6).join('; ')}`);
    if (browserName === 'chromium') expect(shifts.cls, shifts.moved.join('; ')).toBeLessThanOrEqual(0.05);
    // The line lives in the sea of the result, inside the card, and the room the rectangle kept from the start of the batch
    // holds it: the rectangle is no taller than that room.
    const fits = await page.evaluate(() => {
      const slot = document.querySelector('.fo-slot') as HTMLElement;
      const card = document.querySelector('.fo-result')?.getBoundingClientRect();
      const line = document.querySelector('.fo-result__support')?.getBoundingClientRect();
      return { height: slot.getBoundingClientRect().height, room: parseFloat(getComputedStyle(slot).minHeight), inside: Boolean(card && line && line.bottom <= card.bottom) };
    });
    expect(fits.inside, 'the coffee line inside the card').toBe(true);
    expect(fits.room, 'the room of the coffee line is kept').toBeGreaterThan(SLOT.phone);
    expect(fits.height, 'the room kept holds the line').toBeLessThanOrEqual(fits.room + 1);
    await context.close();
  });
});
