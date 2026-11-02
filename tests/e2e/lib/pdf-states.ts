// The states each PDF tool page reaches in use (F5a, decision 12; DECISOES § 170), walked once per page load
// and handed to the spec that looks at them: ads.spec.ts measures the distance of the AdSlots in each one, a11y.spec.ts
// runs axe in each one. The flows are written once, here, so the two specs read the same states. Only small fixtures
// go in (the heavy content checks are in the matrix, pdf-matrix.spec.ts) and every state is reached on one page load.
// F6: the walk reads the labels it clicks from the texts of the page's language, so it walks the Portuguese and Spanish
// pages the same way (English by default, with the same labels as before).
import { expect, type Page } from '@playwright/test';
import { fmt } from '../../../src/i18n/format.ts';
import { routeById, type Lang } from '../../../src/i18n/routes.ts';
import { PDF_PAGES, PDF_TOOL_IDS, type PdfToolId } from '../../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../../src/tools/pdf/texts.ts';
import { animationsDone, slowEngine } from './page.ts';
import { PDF_ORACLE, choosePdfs, openTool, pdfFile } from './pdf-tools.ts';

/**
 * Where a PDF page can be:
 *  - rest: the drop zone, nothing chosen;
 *  - processing: a file chosen with the engine held back, so the panel is the WaterLevel (only when the walk holds it);
 *  - ready: the file is read and the options wait for the button;
 *  - list: the Merge list with its move buttons;
 *  - grid: the page grid open (with a selection, a turn or a move made);
 *  - password: a password field showing its error (Protect: the two do not match; Unlock: the password is wrong);
 *  - signature: the signature area of Sign PDF (draw, upload, type);
 *  - result: the result card with Download.
 */
export type PdfState = 'rest' | 'processing' | 'ready' | 'list' | 'grid' | 'password' | 'signature' | 'result';

/** Called on each state with a short note of what was done to reach it (it shows in the failure messages). */
export type VisitPdf = (state: PdfState, note: string) => Promise<void>;

/** The PDF tools to walk, read from the registry: id and path, in the order of the hub. */
export const PDF_WALKS: readonly { id: PdfToolId; path: string }[] = PDF_TOOL_IDS.map((id) => ({ id, path: PDF_PAGES[id].path }));

/** The 8-page file of mixed sizes and turns: small, and every grid and preview has cells to show. */
const MIXED = 'gen-paginas-mistas.pdf';
const MIXED_PAGES = 8;
/** One page, a scan: PDF to JPG has something to draw. */
const SCAN = 'pdf-escaneado-01-pagina-livro-cor.pdf';
/** Four pages of photos: Compress PDF gains on it, so its result shows the Placard. */
const PHOTOS = 'gen-fotos.pdf';
const SECOND = 'gen-ja-otimizado.pdf';
const SENTINEL = 'Orca-Sentinel-7391-Kq';

/** Clicks the label of a segmented option (the radio itself is hidden). */
const option = (page: Page, label: string) => page.locator('#fo-tool-root .fo-seg__opt').filter({ hasText: label }).first().click();

/** The option labels of a PDF tool in a language (each tool has its own shape; the walk reads only strings). */
const optionsOf = (id: PdfToolId, lang: Lang): Record<string, string> => (PDF_TOOL_TEXTS[lang][id].panel as unknown as { options: Record<string, string> }).options;
const escaped = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Walks one PDF tool page through its states on a single load: `visit` is called on each one, after the finite animations
 * have ended. With `hold`, the engine's worker is held back until the file is chosen, so the WaterLevel state exists and
 * `visit('processing')` is called; without it that state is skipped (the worker may answer before anyone looks).
 */
export async function walkPdfTool(page: Page, id: PdfToolId, visit: VisitPdf, options: { hold: boolean; path?: string; lang?: Lang }): Promise<void> {
  const lang = options.lang ?? 'en';
  const labels = optionsOf(id, lang);
  const grid = PDF_PANEL_TEXTS[lang].grid;
  // The worker is held before the load: a pointer resting over the panel starts it before the first file.
  const gate = options.hold ? await slowEngine(page) : null;
  // `path` walks the same tool where a file guide embeds it (F5b); the tool's own page, in its language, by default.
  await openTool(page, options.path ?? routeById(id).paths[lang] ?? PDF_PAGES[id].path);

  const seen = async (state: PdfState, note = ''): Promise<void> => {
    await animationsDone(page);
    await visit(state, note);
  };
  const root = page.locator('#fo-tool-root');
  const ready = root.locator('.fo-ready');
  const action = ready.locator('.fo-btn--brand');
  const download = root.locator('.fo-btn--download');
  const cells = root.locator('.fo-pages__grid .fo-page');

  const enter = async (names: string[]): Promise<void> => {
    await choosePdfs(page, names.map((name) => pdfFile(name)));
    if (gate) {
      await expect(root.locator('.fo-level')).toBeVisible();
      await seen('processing', `${names.length} file(s) being read`);
      gate.release();
    }
  };
  /** The files are read and the options wait for the button. */
  const waitReady = async (): Promise<void> => {
    await expect(ready).toBeVisible({ timeout: 30_000 });
  };
  const result = async (note: string): Promise<void> => {
    await expect(download).toBeVisible({ timeout: 60_000 });
    await seen('result', note);
  };

  await seen('rest');

  switch (id) {
    case 'merge-pdf': {
      await enter([MIXED, SECOND]);
      await waitReady();
      await expect(root.locator('.fo-merge .fo-filelist__row')).toHaveCount(2);
      await seen('list', 'two files in the Merge list');
      await action.click();
      await result('merged');
      break;
    }
    case 'split-pdf': {
      await enter([MIXED]);
      await waitReady();
      await seen('ready', 'every page, no grid');
      await option(page, labels['pick'] ?? '');
      await expect(cells).toHaveCount(MIXED_PAGES);
      await cells.nth(0).locator('.fo-page__main').click();
      await cells.nth(2).locator('.fo-page__main').click();
      await expect(root.locator('.fo-page[data-selected="true"]')).toHaveCount(2);
      await seen('grid', 'two pages picked');
      await action.click();
      await result('the picked pages');
      break;
    }
    case 'pdf-to-jpg': {
      await option(page, labels['low'] ?? '');
      await enter([SCAN]);
      await result('one page at 72 ppi');
      break;
    }
    case 'compress-pdf': {
      await enter([PHOTOS]);
      await result('Recommended on photos');
      break;
    }
    case 'rotate-pdf': {
      await enter([MIXED]);
      await result('every page turned');
      await option(page, labels['pick'] ?? '');
      await expect(cells).toHaveCount(MIXED_PAGES);
      await waitReady();
      await seen('grid', 'page by page, no page turned yet');
      await root.getByRole('button', { name: new RegExp(`^${escaped(fmt(grid.turn, { n: 1 }))} \\(`) }).click();
      await result('page 1 turned on the grid');
      break;
    }
    case 'delete-pdf-pages': {
      await enter([MIXED]);
      await waitReady();
      await expect(cells).toHaveCount(MIXED_PAGES);
      await cells.nth(1).locator('.fo-page__main').click();
      await cells.nth(3).locator('.fo-page__main').click();
      await expect(root.locator('.fo-page[data-selected="true"]')).toHaveCount(2);
      await seen('grid', 'two pages picked');
      await action.click();
      await result('two pages deleted');
      break;
    }
    case 'add-page-numbers-to-pdf': {
      await enter([MIXED]);
      await result('numbered');
      break;
    }
    case 'sign-pdf': {
      await enter([MIXED]);
      await waitReady();
      await seen('signature', 'draw: the empty pad');
      await option(page, labels['upload'] ?? '');
      await expect(root.locator('.fo-sign__file')).toBeVisible();
      await seen('signature', 'upload: the file field');
      await option(page, labels['type'] ?? '');
      const typed = root.getByLabel(labels['typeLabel'] ?? '');
      await typed.fill('Orca Signer');
      await typed.blur();
      await expect(root.locator('.fo-sign__box')).toBeVisible({ timeout: 30_000 });
      // The preview of the page (the box holds the signature's own picture, which is another img).
      await expect(root.locator('.fo-sign__page > img')).toBeVisible({ timeout: 30_000 });
      await seen('signature', 'type: the name on the preview of the page');
      await option(page, labels['pickPages'] ?? '');
      await expect(cells).toHaveCount(MIXED_PAGES);
      await cells.nth(0).locator('.fo-page__main').click();
      await cells.nth(1).locator('.fo-page__main').click();
      await expect(root.locator('.fo-page[data-selected="true"]')).toHaveCount(2);
      await seen('grid', 'two pages picked to be signed');
      await action.click();
      await result('signed');
      break;
    }
    case 'protect-pdf': {
      await enter([MIXED]);
      await waitReady();
      await seen('ready', 'the two empty password fields');
      await root.getByLabel(labels['passwordLabel'] ?? '', { exact: true }).fill(SENTINEL);
      await root.getByLabel(labels['confirmLabel'] ?? '', { exact: true }).fill(`${SENTINEL.slice(0, -2)}Zz`);
      await expect(root.locator('.fo-pass .fo-field__error')).toBeVisible();
      await seen('password', 'the two passwords do not match');
      await root.getByLabel(labels['confirmLabel'] ?? '', { exact: true }).fill(SENTINEL);
      await action.click();
      await result('protected');
      break;
    }
    case 'unlock-pdf': {
      await enter(['gen-cifrado-aes256.pdf']);
      await waitReady();
      const field = root.getByLabel(labels['passwordLabel'] ?? '', { exact: true });
      await expect(field).toBeVisible();
      await seen('ready', 'the password field, nothing typed');
      await field.fill('not-the-password');
      await root.getByRole('button', { name: labels['submit'] ?? '' }).click();
      await expect(root.locator('.fo-pass .fo-field__error')).toBeVisible({ timeout: 30_000 });
      await seen('password', 'a wrong password');
      await field.fill(PDF_ORACLE.passwords['aes256'] ?? '');
      await root.getByRole('button', { name: labels['submit'] ?? '' }).click();
      await result('unlocked');
      break;
    }
    case 'reorder-pdf-pages': {
      await enter([MIXED]);
      await waitReady();
      await expect(cells).toHaveCount(MIXED_PAGES);
      await seen('ready', 'the pages in their own order');
      await root.getByRole('button', { name: fmt(grid.moveLater, { n: 1 }) }).click();
      await seen('grid', 'page 1 moved later');
      await action.click();
      await result('reordered');
      break;
    }
    case 'watermark-pdf': {
      await enter([MIXED]);
      await waitReady();
      await seen('ready', 'the options with the default text');
      await action.click();
      await result('watermarked');
      break;
    }
  }
}
