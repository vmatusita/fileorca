import { expect, test, type Page } from '@playwright/test';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { PDF_PAGES } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { imageSize, metadataReport, sniff } from './lib/images.ts';
import { expectNoMetadata, filesOf, fixtureFile, takeDownload, type Delivered } from './lib/matrix.ts';
import { dismissCookies, hydrated, type TestFile } from './lib/page.ts';
import { pdfFile } from './lib/pdf-tools.ts';
import { parsePdf, strictPdf } from './lib/pdf.ts';
import { displaySize } from './lib/jpeg.ts';

// The tool each file guide embeds (prompt F5b, decision 7), in both browsers: the guide's own fixture goes in, the result
// shows, the Download hands it over, and what comes out passes the checks the tool's own page passes (it opens, it is the
// format asked for, it carries no GPS). Privacy the way image-privacy.spec.ts and pdf-privacy.spec.ts prove it: every
// request of the page and of its workers is a GET to the site's own origin, with no body and no query string, and the
// file's name appears only in the name of the download, never in a request.
// The file is named so it sorts at the end of the spec list, after the PDF specs (the CI shards by test count; § 142).
// Languages adjustment (decision 5): the 30 guides, each at its path in its language (FILE_GUIDES[id].paths), with the
// tool of the language embedded. The case of a guide holds in the three languages; what the language changes (the name of
// the PDF of photos, the words of the panel) is read from the panel texts of that language.

interface Case {
  files: () => TestFile[];
  /** A PDF tool that waits for its button (Split, Merge). */
  action?: true;
  check: (delivered: Delivered, lang: Lang) => Promise<void> | void;
}

const photo = (name: string): TestFile => fixtureFile(name);

/** Each output: the format asked for, a size it can be opened at, and no metadata but the Orientation. */
function expectImages(delivered: Delivered, format: 'jpeg' | 'png', count = 1): void {
  const outs = filesOf(delivered);
  expect(outs, 'one output per file').toHaveLength(count);
  for (const out of outs) {
    expect(sniff(out.bytes), `${out.name}: format`).toBe(format);
    const size = imageSize(out.bytes);
    expect(size.width * size.height, `${out.name}: opens with pixels`).toBeGreaterThan(0);
    expectNoMetadata(out, { tagMayStay: true });
  }
}

async function expectPdf(bytes: Uint8Array, pages: number): Promise<void> {
  expect(sniff(bytes), 'a PDF').toBe('pdf');
  const strict = await strictPdf(bytes);
  expect(strict.problems, 'the PDF structure is sound').toEqual([]);
  expect(strict.pageCount, 'pages').toBe(pages);
  expect(metadataReport(bytes).gps, 'no GPS in the PDF').toBe(false);
}

const CASES: Record<FileGuideId, Case> = {
  'guides-heic-to-jpg-on-windows': {
    files: () => [photo('heic-06-iphone7-paisagem-gps.heic')],
    check: (delivered) => {
      expect(delivered.name).toBe('heic-06-iphone7-paisagem-gps.jpg');
      expectImages(delivered, 'jpeg');
    },
  },
  'guides-why-is-my-pdf-so-large': {
    files: () => [pdfFile('gen-fotos.pdf')],
    check: async (delivered) => {
      expect(delivered.bytes.length, 'Recommended makes the PDF of photos smaller').toBeLessThan(pdfFile('gen-fotos.pdf').buffer.length);
      await expectPdf(delivered.bytes, 4);
    },
  },
  'guides-social-media-image-sizes': {
    files: () => [photo('jpg-02-iphone6-paisagem-gps.jpg')],
    check: (delivered) => {
      expectImages(delivered, 'jpeg');
      // Resize starts at half the size, as on its own page.
      const size = imageSize(delivered.bytes);
      expect([size.width, size.height]).toEqual([1632, 1224]);
    },
  },
  'guides-open-webp-save-as-jpg': {
    files: () => [photo('gen-webp-exif-gps.webp')],
    check: (delivered) => {
      expect(delivered.name).toBe('gen-webp-exif-gps.jpg');
      expectImages(delivered, 'jpeg');
    },
  },
  'guides-jpg-vs-png': {
    files: () => [photo('gen-png-transparente.png')],
    check: (delivered) => {
      expect(delivered.name).toBe('gen-png-transparente.jpg');
      expectImages(delivered, 'jpeg');
    },
  },
  'guides-remove-location-from-photos': {
    files: () => [photo('jpg-03-iphone5-paisagem-orientacao3-gps.jpg')],
    check: (delivered) => {
      expectImages(delivered, 'jpeg');
      // At By percentage, 100 the photo keeps its size as shown: only the metadata goes (DECISOES § 186).
      expect(displaySize(delivered.bytes)).toEqual({ width: 3264, height: 2448 });
      expect(delivered.bytes.length).toBeLessThan(fixtureFile('jpg-03-iphone5-paisagem-orientacao3-gps.jpg').buffer.length);
    },
  },
  'guides-pdf-to-jpg-resolution': {
    files: () => [pdfFile('gen-paginas-mistas.pdf')],
    check: (delivered) => {
      expect(delivered.name.endsWith('.zip'), 'several pages come as a ZIP').toBe(true);
      expectImages(delivered, 'jpeg', 8);
    },
  },
  'guides-split-pdf-file-size': {
    files: () => [pdfFile('gen-paginas-mistas.pdf')],
    action: true,
    check: async (delivered) => {
      const parts = filesOf(delivered);
      expect(parts, 'one part per page').toHaveLength(8);
      for (const part of parts) await expectPdf(part.bytes, 1);
    },
  },
  'guides-combine-pdfs-on-phone': {
    files: () => [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-acoes.pdf')],
    action: true,
    check: async (delivered) => {
      await expectPdf(delivered.bytes, 10);
    },
  },
  'guides-photos-to-one-pdf': {
    files: () => [photo('jpg-02-iphone6-paisagem-gps.jpg'), photo('gen-png-transparente.png')],
    check: async (delivered, lang) => {
      // The name of the PDF comes from the panel texts of the language ('fileorca-images.pdf' in English; DECISOES § 219).
      expect(delivered.name).toBe(`${IMAGE_PANEL_TEXTS[lang].files.pdf}.pdf`);
      await expectPdf(delivered.bytes, 2);
      expect(parsePdf(delivered.bytes).hasXmp, 'no XMP').toBe(false);
    },
  },
};

interface Seen {
  method: string;
  url: string;
  body: boolean;
}

/** Every request of the page and of its workers (the context sees both). */
function watch(page: Page): Seen[] {
  const seen: Seen[] = [];
  page.context().on('request', (request) => {
    seen.push({ method: request.method(), url: request.url(), body: (request.postDataBuffer()?.length ?? 0) > 0 });
  });
  return seen;
}

/** The words of the Download of the embedded panel, in the language of the page (an image panel or the PDF one). */
function downloadWords(id: FileGuideId, lang: Lang): string {
  const tool = FILE_GUIDES[id].tool;
  return (Object.hasOwn(PDF_PAGES, tool) ? PDF_PANEL_TEXTS : IMAGE_PANEL_TEXTS)[lang].result.download;
}

/** The guide's own fixture goes into the embedded tool of the language, the file comes out sound, and nothing leaves. */
async function expectToolWorks(page: Page, id: FileGuideId, lang: Lang): Promise<void> {
  const path = FILE_GUIDES[id].paths[lang];
  const kase = CASES[id];
  const seen = watch(page);
  expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
  await expect(page.locator('html'), 'the page is in its language').toHaveAttribute('lang', lang === 'pt' ? 'pt-BR' : lang);
  await hydrated(page);
  await dismissCookies(page);
  const files = kase.files();
  await page.setInputFiles('#fo-tool-root input[type="file"]', files);
  if (kase.action) {
    // F13a (UX-04 A; DECISOES § 487): the Merge has its list in the rectangle instead of the ready card.
    const ready = page.locator('#fo-tool-root :is(.fo-ready, .fo-merge-panel)');
    await expect(ready).toBeVisible({ timeout: 30_000 });
    await ready.locator('.fo-btn--brand').click();
  }
  const download = page.locator('#fo-tool-root .fo-btn--download');
  await expect(download).toBeVisible({ timeout: 60_000 });
  // The panel speaks the language of the page (its texts are the tool's own, read from the module of the language).
  await expect(download, 'the Download of the panel, in the language of the page').toContainText(downloadWords(id, lang));
  const delivered = await takeDownload(page);
  await kase.check(delivered, lang);

  const origin = new URL(page.url()).origin;
  const own = seen.filter((request) => !/^(blob|data|about):/.test(request.url));
  expect(own.filter((request) => request.method !== 'GET'), 'only GET').toEqual([]);
  expect(own.filter((request) => request.body), 'no request carries a body').toEqual([]);
  expect(own.filter((request) => new URL(request.url).origin !== origin).map((request) => request.url), 'no request leaves the site').toEqual([]);
  expect(own.filter((request) => new URL(request.url).search !== '').map((request) => request.url), 'no query string').toEqual([]);
  for (const file of files) {
    const stem = file.name.replace(/\.[^.]+$/, '');
    expect(own.filter((request) => decodeURIComponent(request.url).includes(stem)).map((request) => request.url), `${file.name} only in the download name`).toEqual([]);
  }
}

// The Oli of the panel sits on the top edge of the drop zone and rises 86 px above it (components.css). On a tool page
// the H1 keeps her room on its right; in a guide the paragraph above the tool has to (DECISOES § 206). Every line of text
// of the page is measured against her box, at the widths where she covered the end of that paragraph.
const OLI_WIDTHS = [320, 360, 390, 600, 768, 1280];

async function expectOliCoversNoText(page: Page, path: string): Promise<void> {
  const hits: string[] = [];
  for (const width of OLI_WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    expect((await page.goto(path))?.status(), `${path} answers 200`).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    await expect(page.locator('#fo-tool-root [data-oli]').first()).toBeVisible();
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
    hits.push(...found.map((hit) => `${width} px: ${hit}`));
  }
  expect(hits, 'text under the Oli').toEqual([]);
}

// English: the two tests of the F5b, one each.
for (const id of FILE_GUIDE_IDS) {
  const path = FILE_GUIDES[id].paths.en;
  test(`${path}: the embedded tool works, gives a sound file and keeps it in the browser`, async ({ page }) => {
    test.setTimeout(90_000);
    await expectToolWorks(page, id, 'en');
  });
}

for (const id of FILE_GUIDE_IDS) {
  const path = FILE_GUIDES[id].paths.en;
  test(`${path}: the Oli of the panel covers no line of text, at ${OLI_WIDTHS.join(', ')} px`, async ({ page }) => {
    await expectOliCoversNoText(page, path);
  });
}

// Portuguese and Spanish (languages adjustment, decision 8): the same two proofs in one test per guide, so the 20 guides
// add 20 tests and not 40 to the part of the CI where the file falls. The tool comes first, the Oli after, each with the
// same assertions as in English; the time limit is the one of the English tool test.
const TRANSLATED = LANGS.filter((lang) => lang !== 'en');

for (const lang of TRANSLATED) {
  for (const id of FILE_GUIDE_IDS) {
    const path = FILE_GUIDES[id].paths[lang];
    test(`${path}: the embedded tool of the language works and keeps the file in the browser, and the Oli of the panel covers no line of text`, async ({ page }) => {
      test.setTimeout(90_000);
      await expectToolWorks(page, id, lang);
      await expectOliCoversNoText(page, path);
    });
  }
}

test('every file guide has its case here, read from the registry, and a page in each language', () => {
  expect(Object.keys(CASES).sort()).toEqual([...FILE_GUIDE_IDS].sort());
  for (const id of FILE_GUIDE_IDS) expect(CASES[id].files().length, id).toBeGreaterThan(0);
  const paths = FILE_GUIDE_IDS.flatMap((id) => LANGS.map((lang) => FILE_GUIDES[id].paths[lang]));
  expect(new Set(paths).size, 'one path per guide and language').toBe(FILE_GUIDE_IDS.length * LANGS.length);
  for (const id of FILE_GUIDE_IDS) {
    expect(FILE_GUIDES[id].paths.en, id).toBe(FILE_GUIDES[id].path);
    for (const lang of TRANSLATED) expect(FILE_GUIDES[id].paths[lang], `${id} ${lang}`).toMatch(new RegExp(`^/${lang}/guias/[a-z0-9-]+/$`));
  }
});
