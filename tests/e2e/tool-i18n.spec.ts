import { expect, test, type Page, type Request } from '@playwright/test';
import { routeById } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS } from '../../src/tools/image/texts.ts';
import { PDF_TOOL_IDS, type PdfToolId } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { imageSize, sniff } from './lib/images.ts';
import { fixtureFile } from './lib/matrix.ts';
import { dismissCookies, hydrated } from './lib/page.ts';
import { walkPdfTool } from './lib/pdf-states.ts';
import { filesOf, pdfFile, soundPdf, takePdfDownload, type Download } from './lib/pdf-tools.ts';
import { parsePdf } from './lib/pdf.ts';

// Every image tool, image preset and PDF tool in Portuguese and Spanish (F6, decision 4 and criterion 4), in both
// browsers: the page answers 200 in its language with its own H1 and title, takes a real file, gives the result
// in the words of the language, hands out a file named in the language (the ZIP, the PDF of images, the suffix of a
// PDF tool) that is the real thing, says no English sentence of the tool's own texts on the way, and asks the network
// for nothing but GETs of its own site, without a body or a query string. The name sorts after the other specs,
// so the new tests fall in the last parts of the CI split (DECISOES § 142 and § 233).

const LANGS = ['pt', 'es'] as const;
const HTML_LANG: Record<(typeof LANGS)[number], string> = { pt: 'pt-BR', es: 'es' };

const JPG = 'gen-jpg-02-orientacao8.jpg';
const JPG_2 = 'jpg-02-iphone6-paisagem-gps.jpg';
/** The input of each image page: one picture, or two where the result is one file made of both (the ZIP, the PDF). */
const IMAGE_INPUT: Record<ImagePageId, string[]> = {
  'compress-image': [JPG, JPG_2],
  'compress-image-to-100kb': [JPG],
  // The 1 MB preset gains only on a picture above 1 MB (on a smaller one it hands the original back, with another sentence).
  'compress-image-to-1mb': [JPG_2],
  'resize-image': [JPG],
  'resize-image-youtube-thumbnail': [JPG],
  'crop-image': [JPG],
  'rotate-image': [JPG],
  'heic-to-jpg': ['heic-08-iphone13pro-paisagem-hdr-ios17.heic'],
  'webp-to-jpg': ['gen-webp-exif-gps.webp'],
  'png-to-jpg': ['gen-png-transparente.png'],
  'avif-to-jpg': ['gen-avif.avif'],
  'convert-to-webp': [JPG],
  'image-to-pdf': [JPG, JPG_2],
};

/** Every string of a text object, deep. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

/** The English sentences of a text object: the parts between placeholders with four words or more. */
function englishSentences(...texts: unknown[]): string[] {
  const found = new Set<string>();
  for (const text of texts.flatMap(strings)) {
    for (const part of text.split(/\{[^}]+\}/)) {
      const words = part.trim().split(/\s+/).filter((word) => /\p{L}{2,}/u.test(word));
      if (words.length >= 4) found.add(part.trim());
    }
  }
  return [...found];
}

/** A template of the texts ("Prontinho! Suas {count} fotos...") as a pattern of the sentence on the page. */
function sentence(template: string): RegExp {
  const parts = template.split(/\{[^}]+\}/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(parts.join('.+?'));
}

/** Every request of the page and its workers; the checks run on them at the end. */
function watch(page: Page): Request[] {
  const seen: Request[] = [];
  page.context().on('request', (request) => {
    if (/^https?:/.test(request.url())) seen.push(request);
  });
  return seen;
}

function expectOnlyOwnGets(seen: Request[], origin: string): void {
  const broken = seen.flatMap((request) => {
    const url = new URL(request.url());
    const problems = [
      request.method() !== 'GET' ? `método ${request.method()}` : '',
      url.origin !== origin ? `outra origem ${url.origin}` : '',
      url.search ? `query ${url.search}` : '',
      request.postData() ? 'corpo' : '',
    ].filter(Boolean);
    return problems.length ? [`${request.url()}: ${problems.join(', ')}`] : [];
  });
  expect(seen.length).toBeGreaterThan(0);
  expect(broken).toEqual([]);
}

async function openInLanguage(page: Page, path: string, lang: (typeof LANGS)[number], texts: { h1: string; title: string }): Promise<void> {
  const response = await page.goto(path);
  expect(response?.status(), `${path} answers 200`).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANG[lang]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(texts.h1);
  expect(await page.title()).toContain(texts.title);
  await hydrated(page);
  await dismissCookies(page);
}

async function expectNoEnglish(page: Page, english: string[], what: string): Promise<void> {
  const shown = (await page.locator('#fo-tool-root').innerText()).replace(/\s+/g, ' ');
  const name = (await page.locator('#fo-tool-root .fo-btn--download').getAttribute('download')) ?? '';
  expect(english.filter((text) => shown.includes(text)), `${what}: frases em inglês no painel`).toEqual([]);
  expect(english.length).toBeGreaterThan(5);
  expect(name).not.toBe('');
}

const baseOf = (name: string): string => name.replace(/\.[^.]+$/, '');

for (const lang of LANGS) {
  for (const id of Object.keys(IMAGE_PAGES) as ImagePageId[]) {
    const path = routeById(id).paths[lang] ?? '';
    test(`${path}: a real picture in, the result and the file in ${lang}`, async ({ page, baseURL }) => {
      const texts = IMAGE_TOOL_TEXTS[id][lang];
      const panel = IMAGE_PANEL_TEXTS[lang];
      const seen = watch(page);
      await openInLanguage(page, path, lang, texts);
      const inputs = IMAGE_INPUT[id];
      await page.setInputFiles('#fo-tool-root input[type="file"]', inputs.map((name) => fixtureFile(name)));
      const download = page.locator('#fo-tool-root .fo-btn--download');
      await expect(download).toBeVisible({ timeout: 60_000 });
      const done = inputs.length > 1 ? texts.panel.doneMany : texts.panel.done;
      await expect(page.locator('#fo-tool-root .fo-result')).toContainText(sentence(done));
      await expectNoEnglish(page, englishSentences(IMAGE_TOOL_TEXTS[id].en.panel, IMAGE_PANEL_TEXTS.en), path);

      const out: Download = await takePdfDownload(page);
      if (id === 'image-to-pdf') {
        // The PDF of the pictures is named in the language, one page per picture.
        expect(out.name).toBe(`${panel.files.pdf}.pdf`);
        expect(parsePdf(out.bytes).pages).toHaveLength(inputs.length);
      } else if (inputs.length > 1) {
        // Two pictures out: the ZIP is named in the language and keeps each picture's own name.
        expect(out.name).toBe(`${panel.files.zip}.zip`);
        const files = filesOf(out);
        expect(files.map((file) => baseOf(file.name)).sort()).toEqual(inputs.map(baseOf).sort());
        for (const file of files) expect(sniff(file.bytes), file.name).toBe('jpeg');
      } else {
        // One picture out: its own name with the extension of what it became, a picture the size it should be.
        expect(baseOf(out.name)).toBe(baseOf(inputs[0] ?? ''));
        expect(['jpeg', 'png', 'webp']).toContain(sniff(out.bytes));
        const size = imageSize(out.bytes);
        expect(size.width * size.height).toBeGreaterThan(0);
        if (id === 'resize-image-youtube-thumbnail') expect([size.width, size.height]).toEqual([1280, 720]);
        if (id === 'compress-image-to-100kb') expect(out.bytes.length).toBeLessThanOrEqual(100 * 1024);
      }
      expectOnlyOwnGets(seen, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
    });
  }

  for (const id of PDF_TOOL_IDS) {
    const path = routeById(id).paths[lang] ?? '';
    test(`${path}: a real PDF in, the result and the file in ${lang}`, async ({ page, baseURL }) => {
      const texts = PDF_TOOL_TEXTS[lang][id];
      const panel = PDF_PANEL_TEXTS[lang];
      const seen = watch(page);
      await openInLanguage(page, path, lang, texts);
      // The same walk as the AdSlot and axe passes, with the labels of the language; it ends on the result card.
      await walkPdfTool(page, id, async () => {}, { hold: false, lang });
      await expectNoEnglish(page, englishSentences(PDF_TOOL_TEXTS.en[id].panel, PDF_PANEL_TEXTS.en), path);
      const out = await takePdfDownload(page);
      expect(out.name, path).toMatch(EXPECTED_NAME[id](texts.panel.suffix ?? '', panel.files));
      for (const file of filesOf(out)) {
        if (file.name.endsWith('.pdf')) {
          const read = await soundPdf(file.bytes, id === 'protect-pdf' ? { password: 'Orca-Sentinel-7391-Kq' } : {});
          expect(read.pages.length, file.name).toBeGreaterThan(0);
        } else {
          expect(sniff(file.bytes), file.name).toBe('jpeg');
        }
      }
      expectOnlyOwnGets(seen, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
    });
  }
}

type PdfFileWords = (typeof PDF_PANEL_TEXTS)['pt']['files'];
const MIXED = 'gen-paginas-mistas';
/** The name each walk hands out (pdf-states.ts: the files it chooses and the options it picks), with the words of the language. */
const EXPECTED_NAME: Record<PdfToolId, (suffix: string, files: PdfFileWords) => RegExp> = {
  'merge-pdf': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'split-pdf': (_, files) => new RegExp(`^${MIXED}-${files.selected}\\.pdf$`),
  'pdf-to-jpg': (_, files) => new RegExp(`^pdf-escaneado-01-pagina-livro-cor-${files.page}-1\\.jpg$`),
  'compress-pdf': (suffix) => new RegExp(`^gen-fotos-${suffix}\\.pdf$`),
  'rotate-pdf': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'delete-pdf-pages': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'add-page-numbers-to-pdf': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'sign-pdf': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'protect-pdf': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'unlock-pdf': (suffix) => new RegExp(`^gen-cifrado-aes256-${suffix}\\.pdf$`),
  'reorder-pdf-pages': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
  'watermark-pdf': (suffix) => new RegExp(`^${MIXED}-${suffix}\\.pdf$`),
};

// The ZIPs and the page words that the walks above do not reach: Split PDF on every page and PDF to JPG on a PDF of
// several pages each hand out a ZIP named in the language, with each page named in it.
for (const lang of LANGS) {
  test(`Split PDF and PDF to JPG name their ZIP and their pages in ${lang}`, async ({ page }) => {
    const files = PDF_PANEL_TEXTS[lang].files;
    const split = routeById('split-pdf').paths[lang] ?? '';
    await openInLanguage(page, split, lang, PDF_TOOL_TEXTS[lang]['split-pdf']);
    await page.setInputFiles('#fo-tool-root input[type="file"]', [pdfFile(`${MIXED}.pdf`)]);
    await expect(page.locator('#fo-tool-root .fo-ready')).toBeVisible({ timeout: 30_000 });
    await page.locator('#fo-tool-root .fo-ready .fo-btn--brand').click();
    const pages = await takePdfDownload(page);
    expect(pages.name).toBe(`${files.zip}.zip`);
    expect(filesOf(pages).map((file) => file.name)).toEqual(Array.from({ length: 8 }, (_, i) => `${MIXED}-${files.page}-${i + 1}.pdf`));

    const images = routeById('pdf-to-jpg').paths[lang] ?? '';
    await openInLanguage(page, images, lang, PDF_TOOL_TEXTS[lang]['pdf-to-jpg']);
    const low = (PDF_TOOL_TEXTS[lang]['pdf-to-jpg'].panel as unknown as { options: { low: string } }).options.low;
    await page.locator('#fo-tool-root .fo-seg__opt').filter({ hasText: low }).first().click();
    await page.setInputFiles('#fo-tool-root input[type="file"]', [pdfFile(`${MIXED}.pdf`)]);
    const jpgs = await takePdfDownload(page);
    expect(jpgs.name).toBe(`${files.imagesZip}.zip`);
    const out = filesOf(jpgs);
    expect(out.map((file) => file.name)).toEqual(Array.from({ length: 8 }, (_, i) => `${MIXED}-${files.page}-${i + 1}.jpg`));
    for (const file of out) expect(sniff(file.bytes), file.name).toBe('jpeg');
  });
}

// The language is what changes the name: the English walk of the same tool would hand out the English words.
test('the file words of pt and es differ from the English ones', () => {
  for (const lang of LANGS) {
    for (const id of PDF_TOOL_IDS) {
      const [own, english] = [PDF_TOOL_TEXTS[lang][id].panel.suffix, PDF_TOOL_TEXTS.en[id].panel.suffix];
      if (english !== undefined) expect(own, `${lang} ${id}`).not.toBe(english);
    }
    expect(PDF_PANEL_TEXTS[lang].files.selected).not.toBe(PDF_PANEL_TEXTS.en.files.selected);
    expect(IMAGE_PANEL_TEXTS[lang].files.zip).not.toBe(IMAGE_PANEL_TEXTS.en.files.zip);
  }
});

// Review F6 (f-2; DECISOES § 248): the "Image" way to sign, whose button has the longest label of the PDF tools, keeps the
// page from scrolling sideways at 320px in the three languages ("Escolher a imagem da assinatura" went 19px past it).
test('Sign PDF with an image to upload does not scroll sideways at 320px, in the three languages', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const lang of ['en', ...LANGS] as const) {
    const path = routeById('sign-pdf').paths[lang] ?? '';
    expect((await page.goto(path))?.status(), path).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    await page.setInputFiles('#fo-tool-root input[type="file"]', [pdfFile(`${MIXED}.pdf`)]);
    await expect(page.locator('#fo-tool-root .fo-ready')).toBeVisible({ timeout: 30_000 });
    const upload = (PDF_TOOL_TEXTS[lang]['sign-pdf'].panel as unknown as { options: { upload: string } }).options.upload;
    await page.locator('#fo-tool-root .fo-seg__opt').filter({ hasText: upload }).first().click();
    await expect(page.locator('#fo-tool-root .fo-sign__upload')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(320);
  }
});
