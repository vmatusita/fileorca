// The QR code generator on the page (prompt F7, decisions 8 and 11), in Chromium and WebKit. For each content (a short
// address, a long one, a text with accents and emoji, and the longest the page takes), the PNG (the smallest size, and the
// largest for one content) and the SVG are downloaded with the Oli in the middle and without her; the PNG is decoded here
// (pngPixels: every pixel opaque) and the SVG rasterised by @resvg/resvg-js, both at a whole number of pixels per module,
// and jsQR (Apache-2.0) must give back the exact UTF-8 bytes of the text (`binaryData`; `data` may decode accents another
// way). Then the privacy of the text: a sentinel in the box is looked for in every request (URL and body), the dataLayer, the
// title, location.search, the storages, the cookies, the attributes of the page and the names of the files, and no request
// goes to another host; the export_click events carry only the page, the language and the format. Last, the empty box and
// the text over the limit show the error (role="alert"), no code and no download.
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';
import { expect, test, type Locator, type Page } from '@playwright/test';
import texts from '../../src/tools/qr-code-generator/i18n/en.ts';
import { dataLayer, dismissCookies, hydrated } from './lib/page.ts';
import { pngInfo, pngPixels } from './lib/png.ts';

const PATH = '/qr-code-generator/';
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

const box = (page: Page): Locator => page.locator('#fo-qr-text');
const pngButton = (page: Page): Locator => page.getByRole('button', { name: new RegExp(`^${texts.panel.download.png}`) });
const svgButton = (page: Page): Locator => page.getByRole('button', { name: texts.panel.download.svg, exact: true });
const preview = (page: Page): Locator => page.locator('.fo-qr__code > svg');

async function open(page: Page): Promise<void> {
  expect((await page.goto(PATH))?.status()).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

async function type(page: Page, text: string): Promise<void> {
  await box(page).fill(text);
  await expect(preview(page)).toBeVisible();
}

/** Clicks a choice of an OptionGroup by its label (the radio is hidden inside the rail). */
async function choose(page: Page, legend: string, label: string): Promise<void> {
  await page.locator('fieldset', { has: page.locator('legend', { hasText: legend }) }).locator('.fo-seg__opt', { hasText: label }).click();
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

/** The side the page says for the PNG of the chosen size ("· 481 × 481 px" after "Download PNG"). */
async function shownSide(page: Page): Promise<number> {
  const meta = (await pngButton(page).locator('.fo-btn__meta').textContent()) ?? '';
  return Number(/([\d,]+) ×/.exec(meta)?.[1]?.replaceAll(',', '') ?? 0);
}

test.describe('QR code generator', () => {
  for (const content of CONTENTS) {
    test(`${content.name}: the PNG and the SVG read back to the exact UTF-8, with and without the Oli`, async ({ page, browserName }) => {
      test.setTimeout(90_000);
      await open(page);
      await type(page, content.text);
      const rows: string[] = [];
      for (const oli of [true, false]) {
        await choose(page, texts.panel.oli.legend, oli ? texts.panel.oli.on : texts.panel.oli.off);
        await expect(page.locator('.fo-qr__code > svg > svg')).toHaveCount(oli ? 1 : 0);
        const sizes: ('Small' | 'Large')[] = content.large && oli ? ['Small', 'Large'] : ['Small'];
        for (const size of sizes) {
          await choose(page, texts.panel.size.legend, size);
          const side = await shownSide(page);
          const png = await download(page, pngButton(page));
          expect(png.name).toBe('qr-code.png');
          expect(pngInfo(new Uint8Array(png.bytes)).width).toBe(side);
          const read = readPng(png.bytes);
          expect(same(read.binary, content.text), `${content.name}: PNG ${size}, Oli ${oli}`).toBe(true);
          // The icon was really drawn on the canvas (an SVG image the browser failed to paint would leave the frame white).
          expect(read.blue > 0, `${content.name}: PNG ${size}, a Oli desenhada`).toBe(oli);
          rows.push(`PNG ${size} (${side} px) ${oli ? 'com' : 'sem'} a Oli: ok`);
        }
        await choose(page, texts.panel.size.legend, 'Small');
        const svg = await download(page, svgButton(page));
        expect(svg.name).toBe('qr-code.svg');
        expect(same(readSvg(svg.bytes), content.text), `${content.name}: SVG, Oli ${oli}`).toBe(true);
        rows.push(`SVG ${oli ? 'com' : 'sem'} a Oli: ok`);
      }
      for (const row of rows) console.log(`[qr] ${content.name} (${utf8(content.text).length} bytes), ${browserName}: ${row}`);
    });
  }

  test('the text never leaves the device: no request, event, store, title, attribute or file name carries it', async ({ page, context, baseURL }) => {
    test.setTimeout(90_000);
    const outgoing: { url: string; text: string }[] = [];
    context.on('request', (request) => outgoing.push({ url: request.url(), text: `${request.method()} ${request.url()}\n${request.postData() ?? ''}` }));
    await open(page);
    const sentinel = 'https://qr-sentinel-7f3k9q.example/olá/zq4815?code=Qs-9d2m';
    await type(page, sentinel);
    const names: string[] = [];
    names.push((await download(page, pngButton(page))).name);
    await choose(page, texts.panel.oli.legend, texts.panel.oli.off);
    names.push((await download(page, svgButton(page))).name);
    await choose(page, texts.panel.size.legend, 'Large');
    names.push((await download(page, pngButton(page))).name);
    expect(names).toEqual(['qr-code.png', 'qr-code.svg', 'qr-code.png']);

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
      ['event', 'export_click', { tool: 'qr-code-generator', lang: 'en', format: 'png' }],
      ['event', 'export_click', { tool: 'qr-code-generator', lang: 'en', format: 'svg' }],
      ['event', 'export_click', { tool: 'qr-code-generator', lang: 'en', format: 'png' }],
    ]);
    // The search is real: the same forms are found where the text is (control).
    expect(forms.every((form) => form.length > 0 && `${sentinel} ${encodeURIComponent(sentinel)} ${Buffer.from(sentinel).toString('base64')}`.includes(form))).toBe(true);
  });

  test('an empty box and a text over the limit show the error, with no code and no download', async ({ page }) => {
    await open(page);
    const alert = page.locator('#fo-qr-error');
    // Nothing typed yet: no error, no code, both downloads off.
    await expect(alert).toHaveCount(0);
    await expect(preview(page)).toHaveCount(0);
    await expect(pngButton(page)).toBeDisabled();
    await expect(svgButton(page)).toBeDisabled();
    await expect(page.locator('#fo-qr-count')).toHaveText('0 of 1,273');

    const noCode = async (message: RegExp): Promise<void> => {
      await expect(alert).toHaveAttribute('role', 'alert');
      await expect(alert).toHaveText(message);
      await expect(box(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(preview(page)).toHaveCount(0);
      await expect(pngButton(page)).toBeDisabled();
      await expect(svgButton(page)).toBeDisabled();
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
    await expect(pngButton(page)).toBeEnabled();
    await expect(page.locator('#fo-qr-count')).toHaveText('1,273 of 1,273');
  });
});
