import { expect, test, type Page } from '@playwright/test';
import { FILE_GUIDES, FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';
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

interface Case {
  files: () => TestFile[];
  /** A PDF tool that waits for its button (Split, Merge). */
  action?: true;
  check: (delivered: Delivered) => Promise<void> | void;
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
    check: async (delivered) => {
      expect(delivered.name).toBe('fileorca-images.pdf');
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

for (const id of FILE_GUIDE_IDS) {
  const guide = FILE_GUIDES[id];
  const kase = CASES[id];
  test(`${guide.path}: the embedded tool works, gives a sound file and keeps it in the browser`, async ({ page }) => {
    test.setTimeout(90_000);
    const seen = watch(page);
    expect((await page.goto(guide.path))?.status(), `${guide.path} answers 200`).toBe(200);
    await hydrated(page);
    await dismissCookies(page);
    const files = kase.files();
    await page.setInputFiles('#fo-tool-root input[type="file"]', files);
    if (kase.action) {
      const ready = page.locator('#fo-tool-root .fo-ready');
      await expect(ready).toBeVisible({ timeout: 30_000 });
      await ready.locator('.fo-btn--brand').click();
    }
    await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 60_000 });
    const delivered = await takeDownload(page);
    await kase.check(delivered);

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
  });
}

// The Oli of the panel sits on the top edge of the drop zone and rises 86 px above it (components.css). On a tool page
// the H1 keeps her room on its right; in a guide the paragraph above the tool has to (DECISOES § 206). Every line of text
// of the page is measured against her box, at the widths where she covered the end of that paragraph.
const OLI_WIDTHS = [320, 360, 390, 600];

for (const id of FILE_GUIDE_IDS) {
  const guide = FILE_GUIDES[id];
  test(`${guide.path}: the Oli of the panel covers no line of text, at ${OLI_WIDTHS.join(', ')} px`, async ({ page }) => {
    const hits: string[] = [];
    for (const width of OLI_WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      expect((await page.goto(guide.path))?.status(), `${guide.path} answers 200`).toBe(200);
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
  });
}

test('every file guide has its case here, read from the registry', () => {
  expect(Object.keys(CASES).sort()).toEqual([...FILE_GUIDE_IDS].sort());
  for (const id of FILE_GUIDE_IDS) expect(CASES[id].files().length, id).toBeGreaterThan(0);
});
