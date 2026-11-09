import { expect, test, type Page } from '@playwright/test';
import { EVENT_PARAMS } from '../../src/analytics/events.ts';
import { groupDigits } from '../../src/i18n/format.ts';
import { routeById, type Lang } from '../../src/i18n/routes.ts';
import COMPRESS_EN from '../../src/tools/compress-image/i18n/en.ts';
import COMPRESS_ES from '../../src/tools/compress-image/i18n/es.ts';
import COMPRESS_PT from '../../src/tools/compress-image/i18n/pt.ts';
import { MAX_KB, MIN_KB, START_KB } from '../../src/tools/compress-image/size.ts';
import IMAGE_EN from '../../src/tools/image/i18n/en.ts';
import IMAGE_ES from '../../src/tools/image/i18n/es.ts';
import IMAGE_PT from '../../src/tools/image/i18n/pt.ts';
import { imageSize, sniff } from './lib/images.ts';
import { colours, filesOf, fixtureBytes, fixtureFile, openTool, showAllRows, takeDownload, type OutFile } from './lib/matrix.ts';
import { dataLayer, downloadBytes, openAdjust } from './lib/page.ts';

// F15 · Comprimir "até um tamanho" (item 5; PLANO-UX-QV, section D; DECISOES § 656, § 657, § 675 to § 678), in Chromium and
// WebKit: the third choice of Compress image, "Up to a size", with the field "Maximum size" in KB.
// - Criterion 5: "Up to 200 KB" with the 12 MP photo and the transparent PNG gives JPGs of at most 200,000 bytes, and the
//   PNG says its transparency became white; "Adjust" says "Up to 200 KB".
// - The minimum of the field (§ 657): the engine brings the 12 MP and the 16.8 MP photos under MIN_KB × 1,000 bytes.
// - A typed size (217) lives only in the page: not in the URL, the dataLayer, the localStorage or the sessionStorage.
// - The error of the field speaks through the field (aria-invalid, aria-describedby, the icon), never through the region.
// - The rail of three choices at 320 px stacks, in the three languages; from 480 px the three sit side by side (§ 675).
// The presets of 100 KB and 1 MB are image-presets.spec.ts, unchanged.

const JPG_01 = 'jpg-01-pixel2-retrato-gps.jpg'; // 12 MP, 3024 × 4032, 4.3 MB, GPS
const BIG = 'gen-grande-4100x4100.jpg'; // 16.8 MP, 4100 × 4100
const PNG_ALPHA = 'gen-png-transparente.png'; // 800 × 600, transparent corners, 1.1 MB

const COMPRESS = { en: COMPRESS_EN, pt: COMPRESS_PT, es: COMPRESS_ES } as const;
const IMAGE = { en: IMAGE_EN, pt: IMAGE_PT, es: IMAGE_ES } as const;
const pathOf = (lang: Lang): string => routeById('compress-image').paths[lang] ?? '/';
const optionsOf = (lang: Lang) => COMPRESS[lang].panel.options;

const field = (page: Page) => page.locator('#ci-max');
const region = '#fo-tool-root .fo-tool-island > p.fo-sr[role="status"]';

/** Clicks "Up to a size" (the radio is hidden inside the rail: the label is what a person presses). */
async function chooseSize(page: Page): Promise<void> {
  await page.locator('.fo-seg__opt', { has: page.locator('input[name="ci-level"][value="size"]') }).click();
  await expect(page.locator('input[name="ci-level"][value="size"]')).toBeChecked();
  await expect(field(page)).toBeVisible();
}

/** Types a limit and leaves the field (the field commits a valid number on blur). */
async function setLimit(page: Page, kb: string): Promise<void> {
  await field(page).fill(kb);
  await field(page).blur();
}

/** One upload; the outputs come back from the Download (the ZIP of a batch). */
async function compress(page: Page, fixtures: string[]): Promise<OutFile[]> {
  await page.setInputFiles('input[type="file"]', fixtures.map(fixtureFile));
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 100_000 });
  await showAllRows(page);
  await expect(page.locator('.fo-file[data-state="error"]'), 'every file of the batch came out').toHaveCount(0);
  const outs = filesOf(await takeDownload(page));
  expect(outs, 'one output per file').toHaveLength(fixtures.length);
  return outs;
}

/** Everything a typed number could leak to: the address, the events and the two storages (keys and values). */
const traces = (page: Page): Promise<{ url: string; layer: string; local: string; session: string }> =>
  page.evaluate(() => {
    const dump = (storage: Storage): string => JSON.stringify(Array.from({ length: storage.length }, (_, i) => [storage.key(i), storage.getItem(storage.key(i) ?? '')]));
    return { url: location.href, layer: JSON.stringify(window.dataLayer ?? []), local: dump(localStorage), session: dump(sessionStorage) };
  });

test.describe('Compress image, "Up to a size"', () => {
  test('criterion 5: "Up to 200 KB" turns the 12 MP photo and the transparent PNG into JPGs of at most 200,000 bytes', async ({ page, browserName }) => {
    test.setTimeout(150_000);
    await openTool(page, pathOf('en'));
    await chooseSize(page);
    await expect(field(page), 'the field starts at 200').toHaveValue(String(START_KB));
    const outs = await compress(page, [JPG_01, PNG_ALPHA]);
    const sizes: string[] = [];
    for (const [index, out] of outs.entries()) {
      const fixture = [JPG_01, PNG_ALPHA][index] as string;
      expect(out.bytes.length, `${out.name}: ${out.bytes.length} bytes against 200,000`).toBeLessThanOrEqual(200_000);
      expect(sniff(out.bytes), `${out.name} is a JPG`).toBe('jpeg');
      expect(out.name, 'the JPG extension').toMatch(/\.jpg$/);
      expect(fixtureBytes(fixture).length, `${fixture} is over the limit, so it was compressed`).toBeGreaterThan(200_000);
      const size = imageSize(out.bytes);
      sizes.push(`${fixture} ${out.bytes.length} B ${size.displayWidth}x${size.displayHeight}`);
    }
    // The transparent corners of the PNG are white in the JPG, and the result says so (the note of the engine).
    const png = outs[1] as OutFile;
    const seen = await colours(page, png, 'jpeg');
    const corners = [...seen.rgb.slice(0, 3), ...seen.rgb.slice(-3)];
    expect(corners.every((value) => value >= 235), `the corners are white (${corners.map(Math.round).join(',')})`).toBe(true);
    await expect(page.locator('.fo-result__notes')).toContainText(IMAGE.en.result.notes.flattened);
    // "Adjust" says the limit, in the words of the language.
    await expect(page.locator('details.fo-adjust > summary')).toHaveText(/^Adjust · Up to 200 KB$/);
    console.log(`[até 200 KB] ${browserName} ${sizes.join(' | ')}`);
  });

  test(`the minimum (§ 657): ${MIN_KB} KB brings the 12 MP and the 16.8 MP photos under ${MIN_KB * 1000} bytes`, async ({ page, browserName }) => {
    test.setTimeout(240_000);
    await openTool(page, pathOf('en'));
    await chooseSize(page);
    // One less than the minimum is refused in words, and the minimum itself is taken.
    await setLimit(page, String(MIN_KB - 1));
    await expect(field(page)).toHaveAttribute('aria-invalid', 'true');
    await setLimit(page, String(MIN_KB));
    await expect(field(page)).not.toHaveAttribute('aria-invalid', 'true');
    const started = Date.now();
    const outs = await compress(page, [JPG_01, BIG]);
    const sizes: string[] = [];
    for (const [index, out] of outs.entries()) {
      const fixture = [JPG_01, BIG][index] as string;
      expect(sniff(out.bytes), `${out.name} is a JPG`).toBe('jpeg');
      expect(out.bytes.length, `${fixture}: ${out.bytes.length} bytes against ${MIN_KB * 1000}`).toBeLessThanOrEqual(MIN_KB * 1000);
      const size = imageSize(out.bytes);
      sizes.push(`${fixture} ${out.bytes.length} B ${size.displayWidth}x${size.displayHeight}`);
    }
    await expect(page.locator('details.fo-adjust > summary')).toHaveText(new RegExp(`^Adjust · Up to ${MIN_KB} KB$`));
    console.log(`[mínimo ${MIN_KB} KB] ${browserName} ${sizes.join(' | ')} (${Date.now() - started} ms)`);
  });

  test('a typed size (217) never reaches the URL, the dataLayer, the localStorage or the sessionStorage', async ({ page }) => {
    test.setTimeout(120_000);
    await openTool(page, pathOf('en'));
    const clean = await traces(page);
    for (const [where, text] of Object.entries(clean)) expect(text, `${where} before anything is typed`).not.toContain('217');
    await chooseSize(page);
    await compress(page, [PNG_ALPHA]);
    const before = await page.locator('.fo-btn--download').getAttribute('href');
    await openAdjust(page);
    await setLimit(page, '217');
    // The value was taken: the batch was done again with it, and "Adjust" says it.
    await expect(page.locator('.fo-btn--download')).not.toHaveAttribute('href', before ?? '', { timeout: 60_000 });
    await expect(page.locator('details.fo-adjust > summary')).toHaveText(/^Adjust · Up to 217 KB$/);
    const bytes = await downloadBytes(page);
    expect(bytes.length, 'the new limit holds').toBeLessThanOrEqual(217_000);
    const after = await traces(page);
    expect(new URL(after.url).search, 'no query string').toBe('');
    expect(new URL(after.url).hash, 'no hash').toBe('');
    for (const [where, text] of Object.entries(after)) expect(text, `the typed size in ${where}`).not.toContain('217');
    // Every event is one of the closed list, with only its own parameters.
    const sent = (await dataLayer(page)).filter((entry) => entry[0] === 'event');
    expect(sent.length, 'the batch sent events').toBeGreaterThan(0);
    for (const [, name, params] of sent) {
      expect(Object.keys(EVENT_PARAMS), 'an event outside the closed list').toContain(name);
      const allowed: readonly string[] = EVENT_PARAMS[name as keyof typeof EVENT_PARAMS];
      for (const key of Object.keys(params as Record<string, unknown>)) expect(allowed, `${String(name)} sends ${key}`).toContain(key);
    }
    // The value lives only in the memory of the page: a new load starts again at Recommended and 200.
    await page.reload();
    await expect(page.locator('input[name="ci-level"][value="recommended"]')).toBeChecked();
    await chooseSize(page);
    await expect(field(page)).toHaveValue(String(START_KB));
  });

  for (const lang of ['en', 'pt'] as const) {
    test(`${lang}: the error of the field speaks through the field, not through the region, and the last result stays`, async ({ page }) => {
      test.setTimeout(120_000);
      const texts = optionsOf(lang);
      const error = texts.maxInvalid.replace('{min}', groupDigits(MIN_KB, lang)).replace('{max}', groupDigits(MAX_KB, lang));
      await openTool(page, pathOf(lang));
      await chooseSize(page);
      await expect(field(page)).toHaveAttribute('aria-describedby', 'ci-max-help');
      await expect(page.locator('#ci-max-help')).toHaveText(texts.maxHelp);
      await expect(page.locator('.fo-input', { has: field(page) }).locator('.fo-input__affix')).toHaveText(texts.kb);
      await compress(page, [PNG_ALPHA]);
      const href = await page.locator('.fo-btn--download').getAttribute('href');
      await openAdjust(page);
      // Count what the region of the island says from here on.
      await page.evaluate((selector) => {
        const node = document.querySelector(selector) as HTMLElement;
        const log: string[] = [];
        (window as unknown as { __said: string[] }).__said = log;
        new MutationObserver(() => log.push(node.textContent ?? '')).observe(node, { childList: true, characterData: true, subtree: true });
      }, region);
      for (const wrong of ['5', '10001', '1.500', '1,500', 'abc']) {
        await field(page).fill(wrong);
        await field(page).blur();
        await expect(field(page), `${wrong} is refused`).toHaveAttribute('aria-invalid', 'true');
        await expect(field(page)).toHaveAttribute('aria-describedby', 'ci-max-error ci-max-help');
        const line = page.locator('#ci-max-error');
        await expect(line).toHaveText(error);
        await expect(line).toHaveAttribute('role', 'alert');
        await expect(line.locator('svg')).toHaveCount(1);
        await expect(page.locator('.fo-field[data-state="error"]', { has: field(page) })).toHaveCount(1);
      }
      // Nothing ran: the last valid result is still the one on screen, and the region said nothing.
      await page.waitForTimeout(800);
      await expect(page.locator('.fo-btn--download')).toHaveAttribute('href', href ?? '');
      expect(await page.evaluate(() => (window as unknown as { __said: string[] }).__said), 'the region spoke for the error').toEqual([]);
      // A whole number without a separator is taken again: the error goes and the batch runs (1,500 KB in the language).
      await field(page).fill('1500');
      await field(page).blur();
      await expect(field(page)).not.toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#ci-max-error')).toHaveCount(0);
      await expect(page.locator('details.fo-adjust > summary .fo-adjust__now')).toHaveText(`· ${texts.upTo.replace('{n}', groupDigits(1500, lang))}`, { timeout: 60_000 });
    });
  }

  test('the rail of three stacks at 320 px in the three languages, and sits side by side from 480 px', async ({ page }) => {
    const found: string[] = [];
    for (const lang of ['en', 'pt', 'es'] as const) {
      for (const width of [320, 360, 479, 480, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        await openTool(page, pathOf(lang));
        await chooseSize(page);
        const m = await page.evaluate(() => {
          const seg = document.querySelector('.fo-band__now .fo-seg') as HTMLElement;
          const set = seg.closest('fieldset')!.getBoundingClientRect();
          const rail = seg.getBoundingClientRect();
          const opts = Array.from(seg.querySelectorAll<HTMLElement>('.fo-seg__opt')).map((opt) => {
            const box = opt.getBoundingClientRect();
            const text = Array.from(opt.childNodes).find((node) => node.nodeType === 3 && (node.textContent ?? '').trim()) as Text;
            const range = document.createRange();
            range.selectNodeContents(text);
            const lines = new Set(Array.from(range.getClientRects()).map((rect) => Math.round(rect.top))).size;
            return { label: text.textContent, x: box.x, y: box.y, w: box.width, h: box.height, lines, overflow: opt.scrollWidth > opt.clientWidth + 0.5 };
          });
          const input = (document.querySelector('#ci-max') as HTMLElement).closest('.fo-input')!.getBoundingClientRect();
          return { direction: getComputedStyle(seg).flexDirection, inside: rail.left >= set.left - 0.5 && rail.right <= set.right + 0.5, opts, scroll: document.documentElement.scrollWidth, inputRight: input.right, setRight: set.right };
        });
        const where = `${lang} ${width}px`;
        if (m.scroll > width) found.push(`${where}: the page scrolls sideways (${m.scroll}px)`);
        if (!m.inside) found.push(`${where}: the rail leaves the fieldset`);
        if (m.inputRight > m.setRight + 0.5) found.push(`${where}: the field leaves the column`);
        // One line per label stacked and at 1280 px; at 480 px "Hasta un tamaño" fills 115.6 of the 116 px of its choice on
        // Windows, and the wider fonts of the Linux of the CI may break it in two there (never overflowing): two lines at most.
        const most = width === 480 ? 2 : 1;
        for (const opt of m.opts) {
          if (opt.overflow) found.push(`${where}: "${opt.label}" overflows its choice`);
          if (opt.lines < 1 || opt.lines > most) found.push(`${where}: "${opt.label}" in ${opt.lines} lines`);
          if (opt.h < 48) found.push(`${where}: "${opt.label}" ${opt.h.toFixed(1)}px high`);
        }
        const [a, b, c] = m.opts;
        if (width < 480) {
          if (m.direction !== 'column') found.push(`${where}: the rail is not stacked (${m.direction})`);
          if (!(a && b && c && a.y < b.y && b.y < c.y && Math.abs(a.x - c.x) < 0.5 && Math.abs(a.w - c.w) < 0.5)) found.push(`${where}: the three choices are not one under the other`);
        } else {
          if (m.direction !== 'row') found.push(`${where}: the rail is not side by side (${m.direction})`);
          if (!(a && b && c && Math.abs(a.y - c.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(b.w - c.w) < 0.5)) found.push(`${where}: the three choices are not side by side, of one width`);
        }
      }
    }
    expect(found).toEqual([]);
  });
});
