// The QR code generator on the page (prompt F7, decisions 8 and 11), in Chromium and WebKit. For each content (a short
// address, a long one, a text with accents and emoji, and the longest the page takes), the PNG (the smallest size, and the
// largest for one content) and the SVG are downloaded with the Oli in the middle and without her; the PNG is decoded here
// (pngPixels: every pixel opaque) and the SVG rasterised by @resvg/resvg-js, both at a whole number of pixels per module,
// and jsQR (Apache-2.0) must give back the exact UTF-8 bytes of the text (`binaryData`; `data` may decode accents another
// way). Then the privacy of the text: a sentinel in the box is looked for in every request (URL and body), the dataLayer, the
// title, location.search, the storages, the cookies, the attributes of the page and the names of the files, and no request
// goes to another host; the export_click events carry only the page, the language and the format. Last, the empty box and
// the text over the limit show the error (role="alert"), no code and no download.
// The languages adjustment (decisions 3 and 8): the page in Portuguese and Spanish, at its own path, with its own texts and
// file names (QR_TEXTS, `panel.file`, no accents). Each language gets one round trip, a text with "ação", "año", "ñandú" and
// an emoji read back from the PNG and the SVG with and without the Oli, and the privacy test with a sentinel with an accent;
// the box keeps autocomplete, spellcheck and autocapitalize off in the three languages.
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { LANGS, QR_ID, routeById, type Lang } from '../../src/i18n/routes.ts';
import { QR_TEXTS } from '../../src/tools/qr-code-generator/page.ts';
import type { PngSize } from '../../src/tools/qr-code-generator/qr.ts';
import type { QrPanelTexts } from '../../src/tools/qr-code-generator/types.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';
import { pngInfo, pngPixels } from './lib/png.ts';

/** The page in a language, from the route map. */
function pathOf(lang: Lang): string {
  const path = routeById(QR_ID).paths[lang];
  if (!path) throw new Error(`no ${lang} page for the QR code generator`);
  return path;
}
/** The texts of the island in a language. */
const panelOf = (lang: Lang): QrPanelTexts => QR_TEXTS[lang].panel;
/** The names of the two downloads in a language: the base name of the texts, never the text typed. */
const filesOf = (t: QrPanelTexts): { png: string; svg: string } => ({ png: `${t.file}.png`, svg: `${t.file}.svg` });

/** The longest text, in bytes of UTF-8: the capacity of version 40 at error correction H (MAX_BYTES of qr.ts). */
const MAX_BYTES = 1273;
const utf8 = (text: string): Uint8Array => new TextEncoder().encode(text);

/** A text of exactly `bytes` bytes of UTF-8, with accents and emoji in it. */
function textOfBytes(bytes: number): string {
  const piece = 'Olá, José. Café às 7h 🐋 ñandú; ';
  let text = '';
  while (utf8(text + piece).length <= bytes) text += piece;
  while (utf8(text).length < bytes) text += 'x';
  return text;
}

const CONTENTS: { name: string; text: string; large?: true }[] = [
  { name: 'endereço curto', text: 'https://fileorca.com/', large: true },
  { name: 'endereço longo', text: `https://example.com/path/to/a/page?${Array.from({ length: 24 }, (_, i) => `key${i}=value-${i * 37}`).join('&')}#section-7` },
  { name: 'acento e emoji', text: 'Olá! Café às 7h, ñandú e 🐋 na praia — até já ☕' },
  { name: 'o maior permitido', text: textOfBytes(MAX_BYTES) },
];

/** The text of the round trip in Portuguese and in Spanish: "ação", "año", "ñandú" and an emoji in each. */
const ACCENTS: Record<Exclude<Lang, 'en'>, string> = {
  pt: 'https://fileorca.com/pt/ — Ação de graças: o ñandú no año novo 🐋 até já ☕',
  es: '¡Feliz año! El ñandú y la ação 🐋 — https://fileorca.com/es/ ☕',
};

const box = (page: Page): Locator => page.locator('#fo-qr-text');
const pngButton = (page: Page, t: QrPanelTexts): Locator => page.getByRole('button', { name: new RegExp(`^${t.download.png}`) });
const svgButton = (page: Page, t: QrPanelTexts): Locator => page.getByRole('button', { name: t.download.svg, exact: true });
const preview = (page: Page): Locator => page.locator('.fo-qr__code > svg');

async function open(page: Page, lang: Lang = 'en'): Promise<void> {
  expect((await page.goto(pathOf(lang)))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

async function type(page: Page, text: string): Promise<void> {
  await box(page).fill(text);
  await expect(preview(page)).toBeVisible();
}

/**
 * Clicks a choice of an OptionGroup (the radio is hidden inside the rail): the group under its legend, the option by its
 * value, after checking that it shows the label of the language (a label may be part of another one, "Ligada" of "Desligada").
 */
async function choose(page: Page, t: QrPanelTexts, group: 'oli', value: 'on' | 'off'): Promise<void>;
async function choose(page: Page, t: QrPanelTexts, group: 'size', value: PngSize): Promise<void>;
async function choose(page: Page, t: QrPanelTexts, group: 'oli' | 'size', value: string): Promise<void> {
  const set = page.locator('fieldset', { has: page.locator(`input[name="fo-qr-${group}"]`) });
  await expect(set.locator('legend')).toHaveText(t[group].legend);
  const option = set.locator('.fo-seg__opt', { has: page.locator(`input[value="${value}"]`) });
  await expect(option).toContainText(group === 'oli' ? t.oli[value as 'on' | 'off'] : t.size[value as PngSize]);
  await option.click();
}

async function download(page: Page, button: Locator): Promise<{ name: string; bytes: Buffer }> {
  const [file] = await Promise.all([page.waitForEvent('download'), button.click()]);
  return { name: file.suggestedFilename(), bytes: readFileSync((await file.path()) ?? '') };
}

const same = (bytes: Uint8ClampedArray | number[] | undefined, text: string): boolean => bytes !== undefined && Buffer.from(Uint8Array.from(bytes)).equals(Buffer.from(utf8(text)));

/** The bytes of the PNG's code, after checking that every pixel is opaque, and how many pixels have the blue of the icon. */
function readPng(bytes: Buffer): { binary: number[] | undefined; side: number; blue: number } {
  const { width, height, rgba } = pngPixels(new Uint8Array(bytes));
  expect(width).toBe(height);
  let blue = 0;
  for (let at = 0; at < rgba.length; at += 4) {
    if (rgba[at + 3] !== 255) throw new Error(`pixel ${at / 4} with alpha ${rgba[at + 3]}`);
    // The Oceano of the app icon, #0B63F6: drawn only when the Oli is in the middle (the code is black and white).
    if ((rgba[at] ?? 255) < 60 && (rgba[at + 1] ?? 0) > 70 && (rgba[at + 1] ?? 255) < 130 && (rgba[at + 2] ?? 0) > 200) blue += 1;
  }
  return { binary: jsQR(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.length), width, height)?.binaryData, side: width, blue };
}

/** The bytes of the SVG's code, rasterised at 4 pixels a module. */
function readSvg(bytes: Buffer): number[] | undefined {
  const svg = bytes.toString('utf8');
  const side = Number(/viewBox="0 0 (\d+) \1"/.exec(svg)?.[1] ?? 0);
  expect(side).toBeGreaterThan(20);
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: side * 4 } }).render();
  const pixels = image.pixels;
  return jsQR(new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.length), image.width, image.height)?.binaryData;
}

/**
 * The side the page says for the PNG of the chosen size ("481 × 481 px" under "Download PNG", F13b): the first number of the
 * line, with the thousands separator of any language taken out ("2,048" in English and Spanish, "2.048" in Portuguese).
 */
async function shownSide(page: Page, t: QrPanelTexts): Promise<number> {
  const meta = (await pngButton(page, t).locator('.fo-btn__meta').textContent()) ?? '';
  return Number(/\d[\d.,]*/.exec(meta)?.[0]?.replace(/[.,]/g, '') ?? 0);
}

test.describe('QR code generator', () => {
  const en = panelOf('en');
  for (const content of CONTENTS) {
    test(`${content.name}: the PNG and the SVG read back to the exact UTF-8, with and without the Oli`, async ({ page, browserName }) => {
      test.setTimeout(90_000);
      await open(page);
      await type(page, content.text);
      const rows: string[] = [];
      for (const oli of [true, false]) {
        await choose(page, en, 'oli', oli ? 'on' : 'off');
        await expect(page.locator('.fo-qr__code > svg > svg')).toHaveCount(oli ? 1 : 0);
        const sizes: PngSize[] = content.large && oli ? ['small', 'large'] : ['small'];
        for (const size of sizes) {
          await choose(page, en, 'size', size);
          const side = await shownSide(page, en);
          const png = await download(page, pngButton(page, en));
          expect(png.name).toBe('qr-code.png');
          expect(pngInfo(new Uint8Array(png.bytes)).width).toBe(side);
          const read = readPng(png.bytes);
          expect(same(read.binary, content.text), `${content.name}: PNG ${size}, Oli ${oli}`).toBe(true);
          // The icon was really drawn on the canvas (an SVG image the browser failed to paint would leave the frame white).
          expect(read.blue > 0, `${content.name}: PNG ${size}, a Oli desenhada`).toBe(oli);
          rows.push(`PNG ${size} (${side} px) ${oli ? 'com' : 'sem'} a Oli: ok`);
        }
        await choose(page, en, 'size', 'small');
        const svg = await download(page, svgButton(page, en));
        expect(svg.name).toBe('qr-code.svg');
        expect(same(readSvg(svg.bytes), content.text), `${content.name}: SVG, Oli ${oli}`).toBe(true);
        rows.push(`SVG ${oli ? 'com' : 'sem'} a Oli: ok`);
      }
      for (const row of rows) console.log(`[qr] ${content.name} (${utf8(content.text).length} bytes), ${browserName}: ${row}`);
    });
  }

  // The languages adjustment (decision 8): one round trip per language, the four files of a text with accents and an emoji.
  for (const lang of ['pt', 'es'] as const) {
    test(`${pathOf(lang)}: "ação", "año", "ñandú" and an emoji read back from the PNG and the SVG, with and without the Oli`, async ({ page, browserName }) => {
      test.setTimeout(90_000);
      const t = panelOf(lang);
      const text = ACCENTS[lang];
      const names = filesOf(t);
      // The names come from the texts of the language, with no accent and no space (docs/i18n, § 219).
      expect(t.file).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      await open(page, lang);
      await type(page, text);
      // The count next to the label is the language's: the bytes of the text and the limit with its own thousands separator.
      await expect(page.locator('#fo-qr-count')).toHaveText(fmt(t.field.count, { count: groupDigits(utf8(text).length, lang), max: groupDigits(MAX_BYTES, lang) }));
      const rows: string[] = [];
      for (const oli of [true, false]) {
        await choose(page, t, 'oli', oli ? 'on' : 'off');
        await expect(page.locator('.fo-qr__code > svg > svg')).toHaveCount(oli ? 1 : 0);
        const side = await shownSide(page, t);
        const png = await download(page, pngButton(page, t));
        expect(png.name).toBe(names.png);
        expect(pngInfo(new Uint8Array(png.bytes)).width).toBe(side);
        const read = readPng(png.bytes);
        expect(same(read.binary, text), `${lang}: PNG, Oli ${oli}`).toBe(true);
        expect(read.blue > 0, `${lang}: PNG, a Oli desenhada`).toBe(oli);
        const svg = await download(page, svgButton(page, t));
        expect(svg.name).toBe(names.svg);
        expect(same(readSvg(svg.bytes), text), `${lang}: SVG, Oli ${oli}`).toBe(true);
        rows.push(`PNG (${side} px) e SVG ${oli ? 'com' : 'sem'} a Oli: ok`);
      }
      for (const row of rows) console.log(`[qr] ${lang} (${utf8(text).length} bytes), ${browserName}: ${row}`);
    });
  }

  for (const lang of LANGS) {
    const title = 'the text never leaves the device: no request, event, store, title, attribute or file name carries it';
    test(lang === 'en' ? title : `${pathOf(lang)}: ${title}`, async ({ page, context, baseURL }) => {
      test.setTimeout(90_000);
      const t = panelOf(lang);
      const outgoing: { url: string; text: string }[] = [];
      context.on('request', (request) => outgoing.push({ url: request.url(), text: `${request.method()} ${request.url()}\n${request.postData() ?? ''}` }));
      await open(page, lang);
      // The box asks the browser to keep nothing: no autofill store, no spelling service, no capital letter added.
      await expect(box(page)).toHaveAttribute('autocomplete', 'off');
      await expect(box(page)).toHaveAttribute('spellcheck', 'false');
      await expect(box(page)).toHaveAttribute('autocapitalize', 'off');
      const accent = { en: 'olá', pt: 'ação', es: 'año' }[lang];
      const sentinel = `https://qr-sentinel-7f3k9q.example/${accent}/zq4815?code=Qs-9d2m`;
      await type(page, sentinel);
      const names: string[] = [];
      names.push((await download(page, pngButton(page, t))).name);
      await choose(page, t, 'oli', 'off');
      names.push((await download(page, svgButton(page, t))).name);
      await choose(page, t, 'size', 'large');
      names.push((await download(page, pngButton(page, t))).name);
      const files = filesOf(t);
      expect(names).toEqual([files.png, files.svg, files.png]);
      if (lang === 'en') expect(files).toEqual({ png: 'qr-code.png', svg: 'qr-code.svg' });

      const seen = await page.evaluate(() => {
        const store = (storage: Storage) => Object.keys(storage).map((key) => `${key}=${storage.getItem(key)}`).join(';');
        const attributes = [...document.querySelectorAll('*')].flatMap((element) => [...element.attributes].map((attribute) => `${attribute.name}=${attribute.value}`)).join('\n');
        return { title: document.title, search: location.search, hash: location.hash, local: store(localStorage), session: store(sessionStorage), cookie: document.cookie, attributes };
      });
      const events = await dataLayer(page);
      const forms = ['7f3k9q', 'zq4815', 'Qs-9d2m', encodeURIComponent(sentinel), Buffer.from(sentinel).toString('base64').slice(0, 24)];
      const surfaces: [string, string][] = [
        ...outgoing.map((request): [string, string] => [`requisição ${request.url}`, request.text]),
        ['dataLayer', JSON.stringify(events)],
        ['título', seen.title],
        ['location.search', seen.search],
        ['location.hash', seen.hash],
        ['localStorage', seen.local],
        ['sessionStorage', seen.session],
        ['cookies', seen.cookie],
        ['atributos da página', seen.attributes],
        ['nomes de arquivo', names.join('\n')],
      ];
      const found = surfaces.flatMap(([where, text]) => forms.filter((form) => text.includes(form)).map((form) => `${where}: ${form}`));
      expect(found, 'o texto fora do aparelho').toEqual([]);
      expect(seen.search).toBe('');
      expect(seen.hash).toBe('');
      // Every request stays on the site's own origin (a data: or blob: URL is the page's own memory).
      const origin = new URL(baseURL ?? '').origin;
      const away = outgoing.map((request) => request.url).filter((url) => !/^(?:data|blob):/.test(url) && new URL(url).origin !== origin);
      expect(away, 'requisições a outro host').toEqual([]);
      // The events of the downloads name the page, the language and the format, and nothing else.
      const exports = events.filter((entry) => entry[0] === 'event' && entry[1] === 'export_click');
      expect(exports).toEqual([
        ['event', 'export_click', { tool: 'qr-code-generator', lang, format: 'png' }],
        ['event', 'export_click', { tool: 'qr-code-generator', lang, format: 'svg' }],
        ['event', 'export_click', { tool: 'qr-code-generator', lang, format: 'png' }],
      ]);
      // The search is real: the same forms are found where the text is (control).
      expect(forms.every((form) => form.length > 0 && `${sentinel} ${encodeURIComponent(sentinel)} ${Buffer.from(sentinel).toString('base64')}`.includes(form))).toBe(true);
    });
  }

  // Review of the languages adjustment (E-1; DECISOES § 321): at 320 px the Spanish rail of the PNG size ("Pequeño",
  // "Mediano", "Grande", each over its pixels) was 17 px wider than its column and touched the border of the card, while the
  // page itself did not scroll (the reflow test only reads the page). Each part of each choice group stays in its column.
  test('every choice group keeps its rail and its note inside the column at 320 px, in the three languages', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    for (const lang of LANGS) {
      await open(page, lang);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const groups = await page.locator('#fo-tool-root fieldset.fo-field').evaluateAll((sets) =>
        sets.map((set) => {
          const style = getComputedStyle(set);
          const box = set.getBoundingClientRect();
          const right = box.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth);
          const widest = Math.max(...[...set.children].map((child) => child.getBoundingClientRect().right));
          return { legend: set.querySelector('legend')?.textContent ?? '', over: widest - right };
        }),
      );
      expect(groups.length, `${lang}: os dois grupos de opções`).toBe(2);
      // Under a pixel: the rounding of the layout (the Portuguese rail is 0.3 px over, inside the padding of the card).
      for (const group of groups) expect(group.over, `${lang} "${group.legend}" a 320 px`).toBeLessThan(1);
    }
  });

  test('an empty box and a text over the limit show the error, with no code and no download', async ({ page }) => {
    await open(page);
    const alert = page.locator('#fo-qr-error');
    // Nothing typed yet: no error, no code, and no download (F13b, F7 f-10 saída A; DECISOES § C-8: the place of the two
    // buttons says why, where they were turned off before).
    const wait = page.locator('.fo-qr__actions .fo-qr__wait');
    await expect(alert).toHaveCount(0);
    await expect(preview(page)).toHaveCount(0);
    await expect(pngButton(page, en)).toHaveCount(0);
    await expect(svgButton(page, en)).toHaveCount(0);
    await expect(wait).toHaveText(en.download.wait);
    await expect(page.locator('#fo-qr-count')).toHaveText('0 of 1,273');

    const noCode = async (message: RegExp): Promise<void> => {
      await expect(alert).toHaveAttribute('role', 'alert');
      await expect(alert).toHaveText(message);
      await expect(box(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(preview(page)).toHaveCount(0);
      await expect(pngButton(page, en)).toHaveCount(0);
      await expect(svgButton(page, en)).toHaveCount(0);
      await expect(wait).toBeVisible();
    };
    await type(page, 'abc');
    await box(page).fill('');
    await noCode(/nothing to put in the code yet/);
    await box(page).fill('   \n  ');
    await noCode(/nothing to put in the code yet/);
    // 637 letters with an accent are 1,274 bytes: one over.
    await box(page).fill('é'.repeat(637));
    await noCode(/too long for one QR code.*1,273 characters.*accent counts as 2 and an emoji as 4/);
    await expect(page.locator('#fo-qr-count')).toHaveText('1,274 of 1,273');
    // The longest text the page takes makes a code again.
    await type(page, textOfBytes(MAX_BYTES));
    await expect(alert).toHaveCount(0);
    await expect(box(page)).not.toHaveAttribute('aria-invalid', 'true');
    await expect(pngButton(page, en)).toBeEnabled();
    await expect(page.locator('#fo-qr-count')).toHaveText('1,273 of 1,273');
  });

  // F7 f-9 (DECISOES § C-8): the size of the PNG is always on the second line of its Download, with no middle dot, in the
  // button of 60 px (button-lg), at 1280, 360 and 320 px, in the three languages. Before, it followed a "·" on the same line and
  // went under it on a narrow phone, leaving the dot at the start of the line.
  for (const lang of LANGS) {
    test(`${pathOf(lang)}: the size of the PNG is on the second line of its button, with no dot, at 1280, 360 and 320 px (f-9)`, async ({ page }) => {
      const t = panelOf(lang);
      await open(page, lang);
      await type(page, 'https://fileorca.com/');
      for (const width of [1280, 360, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const button = pngButton(page, t);
        const seen = await button.evaluate((node) => {
          const name = node.querySelector('.fo-qr__name > span:first-child')!.getBoundingClientRect();
          const meta = node.querySelector('.fo-btn__meta')!.getBoundingClientRect();
          return { height: node.getBoundingClientRect().height, below: meta.top >= name.bottom - 1, text: node.querySelector('.fo-btn__meta')!.textContent ?? '' };
        });
        expect(seen.height, `${width} px`).toBe(60);
        expect(seen.below, `${width} px: o tamanho na segunda linha`).toBe(true);
        expect(seen.text, `${width} px`).not.toMatch(/^\s*·/);
        expect(seen.text, `${width} px`).toMatch(/^\d[\d.,]* × \d[\d.,]* px$/);
      }
    });
  }

  // F7 f-10, saída A (DECISOES § C-8; § 139 and § 276): no Download is ever turned off. Before there is a code the place of the
  // two buttons says why, and it keeps their height, so nothing moves when the code comes; with a code, the two buttons.
  for (const width of [360, 1280]) {
    test(`no Download is turned off, and the place of the two buttons keeps its height before and after the code, at ${width} px (f-10)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      const actions = page.locator('.fo-qr__actions');
      const height = () => actions.evaluate((node) => node.getBoundingClientRect().height);
      await expect(page.locator('button.fo-btn--download[disabled], #fo-tool-root button[disabled]')).toHaveCount(0);
      await expect(actions.locator('.fo-qr__wait')).toHaveText(en.download.wait);
      const before = await height();
      await type(page, 'https://fileorca.com/');
      await expect(pngButton(page, en)).toBeVisible();
      expect(Math.abs((await height()) - before)).toBeLessThanOrEqual(1);
      await expect(page.locator('button.fo-btn--download[disabled]')).toHaveCount(0);
      await box(page).fill('');
      await expect(actions.locator('.fo-qr__wait')).toBeVisible();
      expect(Math.abs((await height()) - before)).toBeLessThanOrEqual(1);
    });
  }
});
