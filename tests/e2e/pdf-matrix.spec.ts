import { expect, test, type Page } from '@playwright/test';
import { metadataReport } from './lib/images.ts';
import { imageSize } from './lib/images.ts';
import { readWithPdfjs, opensWithoutPassword, type ReadPage, type ReadPdf } from './lib/pdfjs-read.ts';
import { dataLayer } from './lib/page.ts';
import { qpdfEncryption } from '../../scripts/lib/qpdf.ts';
import {
  BROKEN_PDFS,
  PDF_ORACLE,
  REFUSAL_TEXT,
  choosePdfs,
  filesOf,
  openTool,
  pdfBytes,
  pdfFile,
  pdfOracle,
  recordMatrix,
  rowReason,
  soundPdf,
  takePdfDownload,
  type MatrixRow,
} from './lib/pdf-tools.ts';
import splitTexts from '../../src/tools/split-pdf/i18n/en.ts';
import imagesTexts from '../../src/tools/pdf-to-jpg/i18n/en.ts';
import compressTexts from '../../src/tools/compress-pdf/i18n/en.ts';
import rotateTexts from '../../src/tools/rotate-pdf/i18n/en.ts';
import protectTexts from '../../src/tools/protect-pdf/i18n/en.ts';
import unlockTexts from '../../src/tools/unlock-pdf/i18n/en.ts';
import numbersTexts from '../../src/tools/add-page-numbers-to-pdf/i18n/en.ts';
import watermarkTexts from '../../src/tools/watermark-pdf/i18n/en.ts';
import signTexts from '../../src/tools/sign-pdf/i18n/en.ts';
import reorderTexts from '../../src/tools/reorder-pdf-pages/i18n/en.ts';
import organizeTexts from '../../src/tools/organize-pdf/i18n/en.ts';
import deleteTexts from '../../src/tools/delete-pdf-pages/i18n/en.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';
import panelTexts from '../../src/tools/pdf/i18n/en.ts';
import { leavingCount } from '../../src/tools/pdf/grid-math.ts';
// F18 (front P): the two PDF presets, in their block at the end of the file.
import extractTexts from '../../src/tools/split-pdf/presets/extract-pages/i18n/en.ts';
import pngTexts from '../../src/tools/pdf-to-jpg/presets/to-png/i18n/en.ts';
import { countOf } from '../../src/tools/pdf/grid-math.ts';

// The fixture matrix of the PDF tools (F5a, decision 12): every tool, every fixture it takes, both browsers, with the
// refused files in the middle of the batch. Every output is downloaded and read in Node by readers that are not the
// engine: the strict structure, qpdf --check, PDF.js (every page and its operator list), and the arithmetic of the tool
// against fixtures/pdf/expected.json. Each test loads its page once. A tool that takes a batch gets the small fixtures in
// one batch; a tool that takes one file at a time gets them one after the other ("Start over" in between). Each big file
// (the 300 pages, the 117 pages, the 150-page NASA scan) gets a test of its own in every tool, so no test runs past its
// timeout on the CI, and no fixture or page is left out (DECISOES § 175). tests/unit/pdf-matrix-table.test.ts proves the
// coverage on the table this spec's records build.

const SMALL = ['gen-paginas-mistas.pdf', 'gen-acoes.pdf', 'gen-fotos.pdf', 'gen-ja-otimizado.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'gen-xref-estragada.pdf'];
const BIG = ['gen-paginas-300.pdf', 'pdf-grande-fontes-embutidas-117p.pdf', 'pdf-escaneado-02-relatorio-nasa-150p.pdf'];
/** The short name of a big file in the name of its test and of its record. */
const BIG_CASE: Record<string, string> = { 'gen-paginas-300.pdf': '300', 'pdf-grande-fontes-embutidas-117p.pdf': '117', 'pdf-escaneado-02-relatorio-nasa-150p.pdf': 'nasa' };
const bigCase = (fixture: string): string => BIG_CASE[fixture] ?? fixture;
/** A big file takes longer in WebKit on the CI runner (about 4 times this machine): its download gets more time. */
const BIG_WAIT = 110_000;

const markers = (name: string) => pdfOracle(name).markers ?? [];
/** Clicks the label of a segmented option (the radio itself is hidden), the way image-smoke.spec.ts does. */
const option = (page: Page, label: string | RegExp) => page.locator('.fo-seg__opt').filter({ hasText: label }).first().click();
/** The run button of a tool that runs on a button: its label is in the tool's texts (only those tools have one). */
const actionButton = (page: Page, texts: { panel: { action?: string } }) => {
  if (!texts.panel.action) throw new Error('this tool has no run button');
  return page.getByRole('button', { name: texts.panel.action });
};
const startOver = (page: Page) => page.getByRole('button', { name: 'Start over' }).click();
/**
 * The file is read and the panel is ready (its run button is there). A big file takes seconds to read, and an option
 * set before that lands in fields the ready panel replaces: a page range typed then was gone when "Pick these" ran.
 */
const ready = (page: Page, texts: { panel: { action?: string } }, timeout = 30_000) => expect(actionButton(page, texts)).toBeVisible({ timeout });
const pages = (name: string) => pdfOracle(name).pages ?? 0;
const base = (name: string) => name.replace(/\.pdf$/, '');

/** The batch with the refused files in the middle. */
const withBroken = (files: readonly string[]) => [...files.slice(0, Math.ceil(files.length / 2)), ...BROKEN_PDFS, ...files.slice(Math.ceil(files.length / 2))];

// What PDF.js reads of a fixture, read once per worker: the page of a tool's output is known again by its key.
const originals = new Map<string, Promise<ReadPdf>>();
const original = (name: string): Promise<ReadPdf> => {
  let read = originals.get(name);
  if (!read) {
    read = readWithPdfjs(new Uint8Array(pdfBytes(name)));
    originals.set(name, read);
  }
  return read;
};
/**
 * A page as a reader tells it from the others: its "Page N" marker where the fixture has one, or else its shown size,
 * its turn, its images and its first words (the scans, the IRS form and the 117 pages have no marker in the oracle).
 */
const pageKey = (p: ReadPage): string =>
  p.marker ?? `${Math.round(p.shown.width)}x${Math.round(p.shown.height)} ${p.rotate}° ${p.images} images "${p.texts.map((t) => t.str).join(' ').replace(/\s+/g, ' ').trim().slice(0, 40)}"`;
const keysOf = async (name: string): Promise<string[]> => (await original(name)).pages.map(pageKey);

async function refusals(page: Page, tool: string, browser: string): Promise<MatrixRow[]> {
  const rows: MatrixRow[] = [];
  for (const name of BROKEN_PDFS) {
    const reason = await rowReason(page, name);
    expect(reason, name).toMatch(REFUSAL_TEXT[name]);
    rows.push({ tool, fixture: name, browser, result: `refused: ${reason}` });
  }
  const errors = (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'tool_error').map((entry) => (entry[2] as { reason?: string }).reason);
  expect(errors.filter((reason) => reason !== 'needs-password' && reason !== 'restricted').sort()).toEqual(['empty', 'not-pdf', 'not-pdf', 'truncated']);
  return rows;
}

const outputFor = (outs: { name: string; bytes: Uint8Array }[], fixture: string, tag: string) => {
  const found = outs.find((out) => out.name === `${base(fixture)}-${tag}.pdf`);
  expect(found, `${fixture}: ${base(fixture)}-${tag}.pdf in ${outs.map((out) => out.name).join(', ')}`).toBeDefined();
  return found?.bytes as Uint8Array;
};

/** The one file a tool that takes one file at a time gave back, with the name it must have. */
async function onlyOutput(page: Page, fixture: string, tag: string, timeout?: number): Promise<Uint8Array> {
  const outs = filesOf(await takePdfDownload(page, timeout));
  expect(outs.map((out) => out.name)).toEqual([`${base(fixture)}-${tag}.pdf`]);
  return outs[0]?.bytes as Uint8Array;
}

/** The first line of an error and what was received, without the colours of the terminal, for a row of the table. */
function firstLine(error: unknown): string {
  const lines = (error instanceof Error ? error.message : String(error)).replace(/\u001b\[[0-9;]*m/g, '').split('\n').map((line) => line.trim()).filter(Boolean);
  // The first value of the "+" side of a diff (not its "Array [" or "Object {" opening), or the "Received" line.
  const received = lines.find((line) => /^\+\s+(?!Array \[|Object \{|Received\b|\]|\})\S/.test(line)) ?? lines.find((line) => line.startsWith('Received'));
  return [lines[0], received].filter(Boolean).join(': ').slice(0, 200);
}

/**
 * Checks each fixture of a test in turn and records the rows (after `rows`, the refusals): a fixture whose check failed
 * gets a "failed:" row with the first line of the error, and the test then fails with the first error. One broken output
 * never hides what the other fixtures did, and the table says which one broke (DECISOES § 175).
 */
async function recordEach(name: string, who: { tool: string; browser: string }, rows: MatrixRow[], fixtures: readonly string[], check: (fixture: string) => Promise<string>): Promise<void> {
  let first: unknown;
  for (const fixture of fixtures) {
    try {
      rows.push({ ...who, fixture, result: await check(fixture) });
    } catch (error) {
      first ??= error;
      rows.push({ ...who, fixture, result: `failed: ${firstLine(error)}` });
    }
  }
  recordMatrix(`${name}-${who.browser}`, rows);
  if (first !== undefined) throw first;
}

/** The fixtures one after the other on the page of a tool that takes one file at a time, "Start over" in between. */
async function oneByOne(page: Page, name: string, who: { tool: string; browser: string }, fixtures: readonly string[], each: (fixture: string) => Promise<string>): Promise<void> {
  let started = false;
  await recordEach(name, who, [], fixtures, async (fixture) => {
    if (started) await startOver(page);
    started = true;
    await choosePdfs(page, [pdfFile(fixture)]);
    return each(fixture);
  });
}

test.describe.configure({ timeout: 120_000 });

// ---- Merge PDF --------------------------------------------------------------------------------------------------

test('Merge PDF: the small fixtures, the refused ones in the middle', async ({ page, browserName }) => {
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'merge-pdf', browserName);
  await actionButton(page, mergeTexts).click();
  const [out] = filesOf(await takePdfDownload(page));
  expect(out?.name).toBe('gen-paginas-mistas-merged.pdf');
  const read = await soundPdf(out?.bytes as Uint8Array);
  expect(read.pages).toHaveLength(SMALL.reduce((sum, name) => sum + pages(name), 0));
  expect(read.pages.map((p) => p.marker)).toEqual(SMALL.flatMap((name) => pdfOracle(name).markers ?? []));
  expect(read.pages.reduce((sum, p) => sum + p.widgets, 0)).toBe(pdfOracle('pdf-formulario-irs-1040-2019.pdf').form.widgets);
  rows.push(...SMALL.map((fixture) => ({ tool: 'merge-pdf', fixture, browser: browserName, result: `ok: in the merged file, ${pages(fixture)} pages in order` })));
  recordMatrix(`merge-small-${browserName}`, rows);
});

test('Merge PDF: the three big fixtures, and the locked ones refused with the link to Unlock PDF', async ({ page, browserName }) => {
  await openTool(page, '/merge-pdf/');
  const locked = ['gen-cifrado-aes256.pdf', 'gen-cifrado-rc4-128.pdf', 'gen-cifrado-dono.pdf'];
  await choosePdfs(page, [...BIG, ...locked].map((name) => pdfFile(name)));
  const rows: MatrixRow[] = [];
  for (const name of locked) {
    const reason = await rowReason(page, name);
    expect(reason).toMatch(name === 'gen-cifrado-dono.pdf' ? /editing restrictions/ : /needs a password/);
    await expect(page.locator('.fo-filelist__row').filter({ hasText: name }).getByRole('link', { name: 'Unlock PDF' })).toHaveAttribute('href', '/unlock-pdf/');
    rows.push({ tool: 'merge-pdf', fixture: name, browser: browserName, result: `refused: ${reason}` });
  }
  await actionButton(page, mergeTexts).click();
  const [out] = filesOf(await takePdfDownload(page, 90_000));
  const read = await soundPdf(out?.bytes as Uint8Array);
  expect(read.pages).toHaveLength(300 + 117 + 150);
  expect(read.pages.slice(0, 300).map((p) => p.marker)).toEqual(markers('gen-paginas-300.pdf'));
  expect(read.outline).toHaveLength(pdfOracle('pdf-grande-fontes-embutidas-117p.pdf').outline);
  rows.push(...BIG.map((fixture) => ({ tool: 'merge-pdf', fixture, browser: browserName, result: `ok: ${pages(fixture)} pages in order, bookmarks kept` })));
  recordMatrix(`merge-big-${browserName}`, rows);
});

// ---- Split PDF --------------------------------------------------------------------------------------------------

test('Split PDF: every page of the mixed pages, and a second file told it waits', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-fotos.pdf')]);
  expect(await rowReason(page, 'gen-fotos.pdf')).toMatch(/one PDF at a time/);
  await actionButton(page, splitTexts).click();
  const outs = filesOf(await takePdfDownload(page));
  expect(outs.map((out) => out.name)).toEqual(Array.from({ length: 8 }, (_, i) => `gen-paginas-mistas-page-${i + 1}.pdf`));
  for (const [i, out] of outs.entries()) {
    const read = await soundPdf(out.bytes);
    expect(read.pages.map((p) => [p.marker, p.rotate])).toEqual([[`Page ${i + 1}`, pdfOracle('gen-paginas-mistas.pdf').rotate?.[i]]]);
  }
  recordMatrix(`split-each-${browserName}`, [{ tool: 'split-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'ok: 8 files, one page each, turns kept' }, { tool: 'split-pdf', fixture: 'gen-fotos.pdf', browser: browserName, result: 'refused: one PDF at a time' }]);
});

test('Split PDF: every page of each other small fixture, one file after the other', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  // The mixed pages and the IRS form are split in their own tests (every page; pages picked on the grid).
  const files = ['gen-acoes.pdf', 'gen-fotos.pdf', 'gen-ja-otimizado.pdf', 'gen-xref-estragada.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf'];
  await oneByOne(page, 'split-small', { tool: 'split-pdf', browser: browserName }, files, async (fixture) => {
    await actionButton(page, splitTexts).click();
    const outs = filesOf(await takePdfDownload(page));
    expect(outs.map((out) => out.name), fixture).toEqual(Array.from({ length: pages(fixture) }, (_, i) => `${base(fixture)}-page-${i + 1}.pdf`));
    const keys = await keysOf(fixture);
    for (const [i, out] of outs.entries()) expect((await soundPdf(out.bytes)).pages.map(pageKey), `${fixture} page ${i + 1}`).toEqual([keys[i]]);
    return `ok: ${pages(fixture)} files, one page each, in order`;
  });
});

test('Split PDF: ranges of the 300 pages, named by part, never by the typed range', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-300.pdf')]);
  await option(page, splitTexts.panel.options.ranges);
  await page.getByLabel(splitTexts.panel.options.rangesLabel).fill('1-3, 150, 298-300');
  await actionButton(page, splitTexts).click();
  const outs = filesOf(await takePdfDownload(page));
  expect(outs.map((out) => out.name)).toEqual(['gen-paginas-300-part-1.pdf', 'gen-paginas-300-part-2.pdf', 'gen-paginas-300-part-3.pdf']);
  const reads = await Promise.all(outs.map((out) => soundPdf(out.bytes)));
  expect(reads.map((read) => read.pages.map((p) => p.marker))).toEqual([['Page 1', 'Page 2', 'Page 3'], ['Page 150'], ['Page 298', 'Page 299', 'Page 300']]);
  recordMatrix(`split-ranges-${browserName}`, [{ tool: 'split-pdf', fixture: 'gen-paginas-300.pdf', browser: browserName, result: 'ok: 3 parts by range' }]);
});

test('Split PDF: every page of the 117-page notes, and pages picked on the grid of the IRS form', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('pdf-grande-fontes-embutidas-117p.pdf')]);
  await actionButton(page, splitTexts).click();
  const outs = filesOf(await takePdfDownload(page, 90_000));
  expect(outs).toHaveLength(117);
  for (const out of [outs[0], outs[58], outs[116]]) expect((await soundPdf(out?.bytes as Uint8Array)).pages).toHaveLength(1);
  await startOver(page);
  await choosePdfs(page, [pdfFile('pdf-formulario-irs-1040-2019.pdf')]);
  await option(page, splitTexts.panel.options.pick);
  await page.getByRole('button', { name: /^Page 2 of 2/ }).click();
  await actionButton(page, splitTexts).click();
  const [picked] = filesOf(await takePdfDownload(page));
  expect(picked?.name).toBe('pdf-formulario-irs-1040-2019-selected.pdf');
  const read = await soundPdf(picked?.bytes as Uint8Array);
  expect(read.pages).toHaveLength(1);
  expect(read.pages[0]?.widgets).toBe((await readWithPdfjs(pdfBytes('pdf-formulario-irs-1040-2019.pdf'))).pages[1]?.widgets);
  recordMatrix(`split-big-${browserName}`, [
    { tool: 'split-pdf', fixture: 'pdf-grande-fontes-embutidas-117p.pdf', browser: browserName, result: 'ok: 117 files' },
    { tool: 'split-pdf', fixture: 'pdf-formulario-irs-1040-2019.pdf', browser: browserName, result: 'ok: page 2 picked on the grid, its form fields kept' },
  ]);
});

test('Split PDF: the 150-page NASA scan in three ranges that cover every page', async ({ page, browserName }) => {
  const fixture = 'pdf-escaneado-02-relatorio-nasa-150p.pdf';
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile(fixture)]);
  await option(page, splitTexts.panel.options.ranges);
  await page.getByLabel(splitTexts.panel.options.rangesLabel).fill('1-50, 51-100, 101-150');
  await actionButton(page, splitTexts).click();
  const outs = filesOf(await takePdfDownload(page, BIG_WAIT));
  await recordEach('split-nasa', { tool: 'split-pdf', browser: browserName }, [], [fixture], async () => {
    expect(outs.map((out) => out.name)).toEqual([1, 2, 3].map((n) => `${base(fixture)}-part-${n}.pdf`));
    const reads = [];
    for (const out of outs) reads.push(await soundPdf(out.bytes));
    expect(reads.flatMap((read) => read.pages.map(pageKey))).toEqual(await keysOf(fixture));
    return 'ok: 3 parts of 50 pages, every page in order';
  });
});

// ---- PDF to JPG -------------------------------------------------------------------------------------------------

async function checkImages(outs: { name: string; bytes: Uint8Array }[], fixture: string, ppi: number, wanted: number[], format: 'jpeg' | 'png'): Promise<void> {
  const sizes = pdfOracle(fixture).sizes ?? [];
  const turns = pdfOracle(fixture).rotate ?? [];
  for (const n of wanted) {
    const out = outs.find((item) => item.name === `${base(fixture)}-page-${n}.${format === 'png' ? 'png' : 'jpg'}`);
    expect(out, `${fixture} page ${n}`).toBeDefined();
    if (!out) continue;
    const [w = 0, h = 0] = sizes[n - 1] ?? [];
    const turned = turns[n - 1] === 90 || turns[n - 1] === 270;
    const size = imageSize(out.bytes);
    expect(size.format).toBe(format);
    expect(Math.abs((size.displayWidth ?? 0) - Math.floor(((turned ? h : w) * ppi) / 72)), `${fixture} page ${n} width`).toBeLessThanOrEqual(1);
    expect(Math.abs((size.displayHeight ?? 0) - Math.floor(((turned ? w : h) * ppi) / 72)), `${fixture} page ${n} height`).toBeLessThanOrEqual(1);
    const meta = metadataReport(out.bytes);
    expect(meta.exif || meta.gps, `${fixture} page ${n}: no Exif, no GPS`).toBe(false);
  }
}

test('PDF to JPG: the small fixtures at 72 ppi, the owner-restricted one drawn, the locked one refused', async ({ page, browserName }) => {
  await openTool(page, '/pdf-to-jpg/');
  await option(page, imagesTexts.panel.options.low);
  const files = [...SMALL.slice(0, 4), 'gen-cifrado-dono.pdf', ...SMALL.slice(4)];
  await choosePdfs(page, [...withBroken(files), 'gen-cifrado-aes256.pdf'].map((name) => pdfFile(name)));
  const rows = await refusals(page, 'pdf-to-jpg', browserName);
  expect(await rowReason(page, 'gen-cifrado-aes256.pdf')).toMatch(/needs a password/);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  await recordEach('images-small', { tool: 'pdf-to-jpg', browser: browserName }, rows, files, async (fixture) => {
    await checkImages(outs, fixture, 72, Array.from({ length: pages(fixture) }, (_, i) => i + 1), 'jpeg');
    return `ok: ${pages(fixture)} JPG at 72 ppi, sizes within 1 px, no Exif`;
  });
  expect(outs).toHaveLength(files.reduce((sum, name) => sum + pages(name), 0));
});

test('PDF to JPG: PNG at 150 ppi of a range of each big file', async ({ page, browserName }) => {
  await openTool(page, '/pdf-to-jpg/');
  await option(page, imagesTexts.panel.options.png);
  await option(page, imagesTexts.panel.options.range);
  await page.getByLabel(imagesTexts.panel.options.rangeLabel).fill('1-2, 117');
  await page.getByLabel(imagesTexts.panel.options.rangeLabel).blur();
  await choosePdfs(page, [...BIG, 'gen-fotos.pdf'].map((name) => pdfFile(name)));
  const outs = filesOf(await takePdfDownload(page, 110_000));
  await checkImages(outs, 'gen-paginas-300.pdf', 150, [1, 2, 117], 'png');
  await checkImages(outs, 'pdf-grande-fontes-embutidas-117p.pdf', 150, [1, 2, 117], 'png');
  await checkImages(outs, 'pdf-escaneado-02-relatorio-nasa-150p.pdf', 150, [1, 2, 117], 'png');
  await checkImages(outs, 'gen-fotos.pdf', 150, [1, 2], 'png');
  recordMatrix(`images-big-${browserName}`, [...BIG, 'gen-fotos.pdf'].map((fixture) => ({ tool: 'pdf-to-jpg', fixture, browser: browserName, result: 'ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has)' })));
});

// ---- Compress PDF -----------------------------------------------------------------------------------------------

/** One output of Compress: never bigger, the same pages, and the original bytes (with the original's qpdf warnings) when it does not gain. */
async function checkCompressed(out: Uint8Array, fixture: string): Promise<string> {
  const original = pdfBytes(fixture);
  expect(out.length, fixture).toBeLessThanOrEqual(original.length);
  const same = Buffer.compare(Buffer.from(out), original) === 0;
  const read = await soundPdf(out, same ? { originalWarnings: pdfOracle(fixture).qpdf.warnings } : {});
  expect(read.pages, fixture).toHaveLength(pages(fixture));
  return same ? `ok: no gain, original bytes (${original.length})` : `ok: ${original.length} → ${out.length} bytes`;
}

const COMPRESS_MODES = [
  { mode: 'recommended', label: compressTexts.panel.options.recommended, tool: 'compress-pdf' },
  { mode: 'lossless', label: compressTexts.panel.options.lossless, tool: 'compress-pdf (lossless)' },
  { mode: 'strong', label: compressTexts.panel.options.strong, tool: 'compress-pdf (strong)' },
] as const;

for (const { mode, label, tool } of COMPRESS_MODES) {
  test(`Compress PDF: ${mode} on the small fixtures, never bigger, the original back when it does not gain`, async ({ page, browserName }) => {
    await openTool(page, '/compress-pdf/');
    // Strong is said before it is chosen: it turns the pages into pictures.
    await expect(page.getByText(compressTexts.panel.options.strongWarning)).toBeVisible();
    await option(page, label);
    await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
    const rows = await refusals(page, tool, browserName);
    const outs = filesOf(await takePdfDownload(page, 90_000));
    await recordEach(`compress-${mode}-small`, { tool, browser: browserName }, rows, SMALL, (fixture) => checkCompressed(outputFor(outs, fixture, 'compressed'), fixture));
    if (mode === 'recommended') {
      expect(Buffer.compare(Buffer.from(outputFor(outs, 'gen-ja-otimizado.pdf', 'compressed')), pdfBytes('gen-ja-otimizado.pdf'))).toBe(0);
      expect(outputFor(outs, 'gen-fotos.pdf', 'compressed').length).toBeLessThan(pdfBytes('gen-fotos.pdf').length * 0.6);
    }
  });

  for (const fixture of BIG) {
    test(`Compress PDF: ${mode} on ${fixture}, never bigger`, async ({ page, browserName }) => {
      // Strong draws every page of one file and cannot be split into smaller cases: the 150-page scan takes 24 s in the
      // WebKit of this machine, about 105 s on the CI runner, so its cases get the time of two (DECISOES § 175).
      if (mode === 'strong') test.setTimeout(240_000);
      await openTool(page, '/compress-pdf/');
      await option(page, label);
      await choosePdfs(page, [pdfFile(fixture)]);
      const out = await onlyOutput(page, fixture, 'compressed', mode === 'strong' ? 220_000 : BIG_WAIT);
      await recordEach(`compress-${mode}-${bigCase(fixture)}`, { tool, browser: browserName }, [], [fixture], () => checkCompressed(out, fixture));
    });
  }
}

// ---- Protect and Unlock -----------------------------------------------------------------------------------------

const PASSWORD = 'Orca-Sentinel-7391-Kq';

async function protectWith(page: Page): Promise<void> {
  await page.getByLabel(protectTexts.panel.options.passwordLabel, { exact: true }).fill(PASSWORD);
  await page.getByLabel(protectTexts.panel.options.confirmLabel, { exact: true }).fill(PASSWORD);
  await actionButton(page, protectTexts).click();
}

/** R6 with AESv3, opens only with the password, every page there, and the password nowhere in the bytes. */
async function checkProtected(out: Uint8Array, fixture: string): Promise<void> {
  const shown = await qpdfEncryption(out, PASSWORD);
  expect(shown.out).toEqual(expect.arrayContaining(['R = 6', 'stream encryption method: AESv3']));
  expect(await opensWithoutPassword(out)).toBe(false);
  const read = await soundPdf(out, { password: PASSWORD });
  expect(read.pages.map((p) => p.marker), fixture).toEqual(markers(fixture));
  expect(Buffer.from(out).includes(Buffer.from(PASSWORD, 'latin1'))).toBe(false);
}

test('Protect PDF: AES-256 with the same password on the small fixtures, the password nowhere in the bytes', async ({ page, browserName }) => {
  await openTool(page, '/protect-pdf/');
  await choosePdfs(page, [...withBroken(SMALL), 'gen-cifrado-dono.pdf'].map((name) => pdfFile(name)));
  const rows = await refusals(page, 'protect-pdf', browserName);
  const owner = await rowReason(page, 'gen-cifrado-dono.pdf');
  expect(owner).toMatch(/editing restrictions/);
  rows.push({ tool: 'protect-pdf', fixture: 'gen-cifrado-dono.pdf', browser: browserName, result: `refused: ${owner}` });
  await protectWith(page);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  await recordEach('protect-small', { tool: 'protect-pdf', browser: browserName }, rows, SMALL, async (fixture) => {
    await checkProtected(outputFor(outs, fixture, 'protected'), fixture);
    return 'ok: R6 AESv3, opens only with the password';
  });
});

for (const fixture of BIG) {
  test(`Protect PDF: AES-256 on ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/protect-pdf/');
    await choosePdfs(page, [pdfFile(fixture)]);
    await protectWith(page);
    const out = await onlyOutput(page, fixture, 'protected', BIG_WAIT);
    await recordEach(`protect-${bigCase(fixture)}`, { tool: 'protect-pdf', browser: browserName }, [], [fixture], async () => {
      await checkProtected(out, fixture);
      return `ok: R6 AESv3, opens only with the password, ${pages(fixture)} pages`;
    });
  });
}

test('Unlock PDF: a wrong password said, then the right one; RC4 too; the owner-only file without asking', async ({ page, browserName }) => {
  const rows: MatrixRow[] = [];
  for (const [fixture, password] of [
    ['gen-cifrado-aes256.pdf', PDF_ORACLE.passwords['aes256']],
    ['gen-cifrado-rc4-128.pdf', PDF_ORACLE.passwords['rc4']],
  ] as const) {
    await openTool(page, '/unlock-pdf/');
    await choosePdfs(page, [pdfFile(fixture)]);
    const field = page.getByLabel(unlockTexts.panel.options.passwordLabel, { exact: true });
    await field.fill('not-the-password');
    await page.getByRole('button', { name: unlockTexts.panel.options.submit }).click();
    await expect(page.getByText(/That password didn't open/).first()).toBeVisible({ timeout: 30_000 });
    await field.fill(password ?? '');
    await page.getByRole('button', { name: unlockTexts.panel.options.submit }).click();
    const [out] = filesOf(await takePdfDownload(page));
    expect(out?.name).toBe(`${base(fixture)}-unlocked.pdf`);
    expect(Buffer.from(out?.bytes as Uint8Array).toString('latin1')).not.toMatch(/\/Encrypt\b/);
    expect((await soundPdf(out?.bytes as Uint8Array)).pages.map((p) => p.marker)).toEqual(markers(fixture));
    rows.push({ tool: 'unlock-pdf', fixture, browser: browserName, result: 'ok: wrong password said, right one removed it, no /Encrypt' });
  }
  await openTool(page, '/unlock-pdf/');
  await choosePdfs(page, [pdfFile('gen-cifrado-dono.pdf')]);
  const [owner] = filesOf(await takePdfDownload(page));
  expect(Buffer.from(owner?.bytes as Uint8Array).toString('latin1')).not.toMatch(/\/Encrypt\b/);
  await soundPdf(owner?.bytes as Uint8Array);
  rows.push({ tool: 'unlock-pdf', fixture: 'gen-cifrado-dono.pdf', browser: browserName, result: 'ok: restrictions removed without a password' });
  await startOver(page);
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  // F13a (UX-04 A; DECISOES § 487): the reason of the error is the line under the sentence (.fo-drop__why).
  expect(await page.locator('#fo-tool-root .fo-drop__why').innerText()).toMatch(/nothing to remove/);
  rows.push({ tool: 'unlock-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'refused: no password or restrictions' });
  recordMatrix(`unlock-${browserName}`, rows);
});

// ---- Rotate PDF -------------------------------------------------------------------------------------------------

const turnedRight = (fixture: string) => (pdfOracle(fixture).rotate ?? []).map((turn) => (turn + 90) % 360);

test('Rotate PDF: every page of a batch of the small fixtures a quarter to the right, on top of its own turn', async ({ page, browserName }) => {
  await openTool(page, '/rotate-pdf/');
  await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'rotate-pdf', browserName);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  await recordEach('rotate-small', { tool: 'rotate-pdf', browser: browserName }, rows, SMALL, async (fixture) => {
    const read = await soundPdf(outputFor(outs, fixture, 'rotated'));
    expect(read.pages.map((p) => p.rotate), fixture).toEqual(turnedRight(fixture));
    return 'ok: every /Rotate +90';
  });
});

for (const fixture of BIG) {
  test(`Rotate PDF: every page of ${fixture} a quarter to the right`, async ({ page, browserName }) => {
    await openTool(page, '/rotate-pdf/');
    await choosePdfs(page, [pdfFile(fixture)]);
    const out = await onlyOutput(page, fixture, 'rotated', BIG_WAIT);
    await recordEach(`rotate-${bigCase(fixture)}`, { tool: 'rotate-pdf', browser: browserName }, [], [fixture], async () => {
      expect((await soundPdf(out)).pages.map((p) => p.rotate)).toEqual(turnedRight(fixture));
      return `ok: every /Rotate +90, ${pages(fixture)} pages`;
    });
  });
}

test('Rotate PDF: page by page on the grid of one file', async ({ page, browserName }) => {
  await openTool(page, '/rotate-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  // F13a (UX-04 A; DECISOES § 487): Rotate runs as soon as the file is read, and after the result its options fold
  // under "Adjust"; the same choices are made there.
  await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 30_000 });
  await page.locator('#fo-tool-root .fo-adjust > summary').click();
  await option(page, rotateTexts.panel.options.pick);
  await page.getByRole('button', { name: /^Turn page 1 \(/ }).click();
  await page.getByRole('button', { name: /^Turn page 1 \(/ }).click();
  await page.getByRole('button', { name: /^Turn page 4 \(/ }).click();
  const [out] = filesOf(await takePdfDownload(page));
  const before = pdfOracle('gen-paginas-mistas.pdf').rotate ?? [];
  expect((await soundPdf(out?.bytes as Uint8Array)).pages.map((p) => p.rotate)).toEqual(before.map((turn, i) => (i === 0 ? (turn + 180) % 360 : i === 3 ? (turn + 90) % 360 : turn)));
  recordMatrix(`rotate-pages-${browserName}`, [{ tool: 'rotate-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'ok: page 1 +180, page 4 +90, the rest as they were' }]);
});


// ---- Delete PDF pages -------------------------------------------------------------------------------------------

/** Picks pages by number and deletes them: the pages left are the others, in order. A one-page file can lose none. */
async function deletePages(page: Page, fixture: string, typed: string, gone: readonly number[], timeout?: number): Promise<string> {
  await ready(page, deleteTexts, timeout);
  // F14 (item 4, DECISOES § 627): Delete counts what comes out and what the new PDF keeps; the typed range also says it in
  // the panel's region (d-2), so the count is read in the bar.
  const count = page.locator('#fo-tool-root .fo-pages__count');
  await expect(count).toHaveText(leavingCount(panelTexts.grid, 0, pages(fixture)));
  await page.getByLabel('Pick pages by number').fill(typed);
  await page.getByRole('button', { name: 'Pick these' }).click();
  await expect(count).toHaveText(leavingCount(panelTexts.grid, gone.length, pages(fixture)));
  if (gone.length === pages(fixture)) {
    await expect(page.getByText(deleteTexts.panel.options.allPicked)).toBeVisible();
    return 'ok: its only page picked, "needs at least one page" said, nothing deleted';
  }
  await page.getByRole('button', { name: /^Delete/ }).first().click();
  const read = await soundPdf(await onlyOutput(page, fixture, 'edited', timeout));
  expect(read.pages.map(pageKey), fixture).toEqual((await keysOf(fixture)).filter((_, i) => !gone.includes(i + 1)));
  return `ok: pages ${typed} out, ${pages(fixture) - gone.length} left in order`;
}

/** The first and the last page of a file (the second of two pages; the only one of one). */
const ends = (n: number): { typed: string; gone: number[] } => (n === 1 ? { typed: '1', gone: [1] } : n === 2 ? { typed: '2', gone: [2] } : { typed: `1, ${n}`, gone: [1, n] });

test('Delete PDF pages: the first and last page of each small fixture, one file after the other', async ({ page, browserName }) => {
  await openTool(page, '/delete-pdf-pages/');
  await oneByOne(page, 'delete-small', { tool: 'delete-pdf-pages', browser: browserName }, SMALL, (fixture) => {
    const { typed, gone } = ends(pages(fixture));
    return deletePages(page, fixture, typed, gone);
  });
});

test('Delete PDF pages: pages picked by number on the 300 pages; every page picked is said, not done', async ({ page, browserName }) => {
  await openTool(page, '/delete-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-300.pdf')]);
  const field = page.getByLabel('Pick pages by number');
  await field.fill('1-300');
  await page.getByRole('button', { name: 'Pick these' }).click();
  await expect(page.getByText(deleteTexts.panel.options.allPicked)).toBeVisible();
  await field.fill('2-299');
  await page.getByRole('button', { name: 'Pick these' }).click();
  await page.getByRole('button', { name: /^Delete/ }).first().click();
  const [out] = filesOf(await takePdfDownload(page));
  const read = await soundPdf(out?.bytes as Uint8Array);
  expect(read.pages.map((p) => p.marker)).toEqual(['Page 1', 'Page 300']);
  expect(out?.bytes.length ?? 0).toBeLessThan(pdfBytes('gen-paginas-300.pdf').length / 20);
  recordMatrix(`delete-300-${browserName}`, [{ tool: 'delete-pdf-pages', fixture: 'gen-paginas-300.pdf', browser: browserName, result: 'ok: pages 2-299 out, every page picked refused' }]);
});

// The 300 pages have their own test above; the other two big files lose every page but the first and the last.
for (const fixture of BIG.filter((name) => name !== 'gen-paginas-300.pdf')) {
  test(`Delete PDF pages: every page but the first and the last of ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/delete-pdf-pages/');
    await oneByOne(page, `delete-${bigCase(fixture)}`, { tool: 'delete-pdf-pages', browser: browserName }, [fixture], () => {
      const n = pages(fixture);
      return deletePages(page, fixture, `2-${n - 1}`, Array.from({ length: n - 2 }, (_, i) => i + 2), BIG_WAIT);
    });
  });
}

// ---- Add page numbers -------------------------------------------------------------------------------------------

/** "Page N of M" on every page, upright, at the bottom of the page as shown. */
function checkNumbers(read: ReadPdf, fixture: string): void {
  expect(read.pages, fixture).toHaveLength(pages(fixture));
  read.pages.forEach((p, i) => {
    const number = p.texts.find((text) => text.str === `Page ${i + 1} of ${read.pages.length}`);
    expect(number, `${fixture} page ${i + 1}`).toBeDefined();
    expect(number?.angle).toBe(0);
    expect(number?.y ?? 0).toBeGreaterThan(p.shown.height - 40);
  });
}

test('Add page numbers: "Page N of M" at the bottom centre of the small fixtures', async ({ page, browserName }) => {
  await openTool(page, '/add-page-numbers-to-pdf/');
  await option(page, numbersTexts.panel.options.pageNofTotal);
  await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'add-page-numbers-to-pdf', browserName);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  await recordEach('numbers-small', { tool: 'add-page-numbers-to-pdf', browser: browserName }, rows, SMALL, async (fixture) => {
    checkNumbers(await soundPdf(outputFor(outs, fixture, 'numbered')), fixture);
    return 'ok: "Page N of M" at the bottom centre, upright';
  });
});

for (const fixture of BIG) {
  test(`Add page numbers: "Page N of M" on every page of ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/add-page-numbers-to-pdf/');
    await option(page, numbersTexts.panel.options.pageNofTotal);
    await choosePdfs(page, [pdfFile(fixture)]);
    const out = await onlyOutput(page, fixture, 'numbered', BIG_WAIT);
    await recordEach(`numbers-${bigCase(fixture)}`, { tool: 'add-page-numbers-to-pdf', browser: browserName }, [], [fixture], async () => {
      checkNumbers(await soundPdf(out), fixture);
      return `ok: "Page N of M" at the bottom centre of ${pages(fixture)} pages, upright`;
    });
  });
}

// ---- Sign PDF ---------------------------------------------------------------------------------------------------

/**
 * A typed name on every page: each page has one image more than it had. Each file gets a name of its own: after "Start
 * over" the name field keeps the name typed for the previous file while the signature is gone, and typing the same
 * name again draws nothing (reported with DECISOES § 175, for the island).
 */
let signer = 0;
async function signEveryPage(page: Page, fixture: string, timeout?: number): Promise<string> {
  signer += 1;
  await ready(page, signTexts, timeout);
  await option(page, signTexts.panel.options.type);
  await page.getByLabel(signTexts.panel.options.typeLabel).fill(`Orca Signer ${signer}`);
  await page.getByLabel(signTexts.panel.options.typeLabel).blur();
  await expect(page.locator('.fo-sign__box')).toBeVisible({ timeout: 20_000 });
  await option(page, signTexts.panel.options.allPages);
  await actionButton(page, signTexts).click();
  const read = await soundPdf(await onlyOutput(page, fixture, 'signed', timeout));
  expect(read.pages.map((p) => p.images), fixture).toEqual((await original(fixture)).pages.map((p) => p.images + 1));
  return `ok: the signature image on each of ${pages(fixture)} pages`;
}

test('Sign PDF: a typed name on every page of each small fixture, one file after the other', async ({ page, browserName }) => {
  await openTool(page, '/sign-pdf/');
  await oneByOne(page, 'sign-small', { tool: 'sign-pdf', browser: browserName }, SMALL, (fixture) => signEveryPage(page, fixture));
});

for (const fixture of BIG) {
  test(`Sign PDF: a typed name on every page of ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/sign-pdf/');
    await oneByOne(page, `sign-${bigCase(fixture)}`, { tool: 'sign-pdf', browser: browserName }, [fixture], () => signEveryPage(page, fixture, BIG_WAIT));
  });
}

// ---- Reorder PDF pages ------------------------------------------------------------------------------------------

/** The reversed order saved; a one-page file has no other order, and that is said. */
async function reverseOrder(page: Page, fixture: string, timeout?: number): Promise<string> {
  await ready(page, reorderTexts, timeout);
  await page.getByRole('button', { name: reorderTexts.panel.options.reverse }).click();
  await actionButton(page, reorderTexts).click();
  if (pages(fixture) === 1) {
    await expect(page.getByText(reorderTexts.panel.options.unchanged)).toBeVisible();
    return 'ok: one page, "move a page" said, nothing written';
  }
  const read = await soundPdf(await onlyOutput(page, fixture, 'reordered', timeout));
  expect(read.pages.map(pageKey), fixture).toEqual([...(await keysOf(fixture))].reverse());
  return `ok: ${pages(fixture)} pages reversed`;
}

test('Reorder PDF pages: the reversed order of each small fixture, one file after the other', async ({ page, browserName }) => {
  await openTool(page, '/reorder-pdf-pages/');
  await oneByOne(page, 'reorder-small', { tool: 'reorder-pdf-pages', browser: browserName }, SMALL, (fixture) => reverseOrder(page, fixture));
});

for (const fixture of BIG) {
  test(`Reorder PDF pages: the reversed order of ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/reorder-pdf-pages/');
    await oneByOne(page, `reorder-${bigCase(fixture)}`, { tool: 'reorder-pdf-pages', browser: browserName }, [fixture], () => reverseOrder(page, fixture, BIG_WAIT));
  });
}

// ---- Organize PDF (F18, decisions 6 and 15) ---------------------------------------------------------------------

/** A page told from the others whatever its turn: its marker, or its images and first words (its size turns with it). */
const turnFree = (p: ReadPage): string => p.marker ?? `${p.images} images "${p.texts.map((t) => t.str).join(' ').replace(/\s+/g, ' ').trim().slice(0, 40)}"`;

/**
 * The deterministic plan of Organize PDF on the grid, as a person does it: page 2 one place earlier (the arrow of its cell),
 * pages 1 and N picked by number and turned right with the bar, then page 3 picked by number and taken out. Two pages:
 * the move and the turn. One page: the turn. The output is read in Node: the pages in the plan's order (by marker, or by
 * images and words), each /Rotate the page's own plus the turn, against what PDF.js reads of the fixture.
 */
async function organizePlan(page: Page, fixture: string, timeout?: number): Promise<string> {
  await ready(page, organizeTexts, timeout);
  const n = pages(fixture);
  const pick = async (typed: string) => {
    await page.getByLabel('Pick pages by number').fill(typed);
    await page.getByRole('button', { name: 'Pick these' }).click();
  };
  const bar = (which: 'right' | 'out') => page.locator(`#fo-tool-root .fo-pages__act--${which}`).click();
  if (n >= 2) await page.getByRole('button', { name: 'Move page 2 earlier', exact: true }).click();
  await pick(n === 1 ? '1' : `1, ${n}`);
  await bar('right');
  if (n >= 3) {
    await pick('3');
    await bar('out');
    await expect(page.locator('#fo-tool-root .fo-page[data-leaving="true"]')).toHaveCount(1);
  }
  await actionButton(page, organizeTexts).click();
  const read = await soundPdf(await onlyOutput(page, fixture, 'organized', timeout));
  const plan = (n === 1 ? [1] : [2, 1, ...Array.from({ length: n - 2 }, (_, i) => i + 3)]).filter((p) => n < 3 || p !== 3);
  const turned = new Set(n === 1 ? [1] : [1, n]);
  // The order by the oracle's markers where the fixture has them, else by what PDF.js reads of it; the /Rotate of the oracle.
  const before = (await original(fixture)).pages;
  const known = markers(fixture);
  const keyOf = (p: number) => known[p - 1] ?? turnFree(before[p - 1] as ReadPage);
  const rotate = pdfOracle(fixture).rotate ?? [];
  expect(read.pages, `${fixture}: the count`).toHaveLength(plan.length);
  expect(read.pages.map(turnFree), `${fixture}: the order`).toEqual(plan.map(keyOf));
  expect(read.pages.map((p) => p.rotate), `${fixture}: the turns`).toEqual(plan.map((p) => ((rotate[p - 1] ?? 0) + (turned.has(p) ? 90 : 0)) % 360));
  return n === 1 ? 'ok: its only page turned right' : n === 2 ? 'ok: page 2 moved first, pages 1 and 2 turned' : `ok: page 2 moved first, pages 1 and ${n} turned, page 3 out, ${plan.length} pages`;
}

test('Organize PDF: the plan on each small fixture, one file after the other, the refused ones in the middle', async ({ page, browserName }) => {
  await openTool(page, '/organize-pdf/');
  const who = { tool: 'organize-pdf', browser: browserName };
  // As oneByOne, but a refused file leaves no "Start over" (the panel offers to choose another): the next file goes in.
  await recordEach('organize-small', who, [], withBroken(SMALL), async (fixture) => {
    const again = page.getByRole('button', { name: 'Start over' });
    if (await again.isVisible()) await again.click();
    await choosePdfs(page, [pdfFile(fixture)]);
    if ((BROKEN_PDFS as readonly string[]).includes(fixture)) {
      const reason = await rowReason(page, fixture);
      expect(reason, fixture).toMatch(REFUSAL_TEXT[fixture as (typeof BROKEN_PDFS)[number]]);
      return `refused: ${reason}`;
    }
    return organizePlan(page, fixture);
  });
  const errors = (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'tool_error').map((entry) => (entry[2] as { reason?: string }).reason);
  expect(errors.sort()).toEqual(['empty', 'not-pdf', 'not-pdf', 'truncated']);
});

for (const fixture of BIG) {
  test(`Organize PDF: the plan on ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/organize-pdf/');
    await oneByOne(page, `organize-${bigCase(fixture)}`, { tool: 'organize-pdf', browser: browserName }, [fixture], () => organizePlan(page, fixture, BIG_WAIT));
  });
}

// ---- Watermark PDF ----------------------------------------------------------------------------------------------

const MARK = 'Orca-Mark-5521-Zt';

async function markWith(page: Page): Promise<void> {
  await page.getByLabel(watermarkTexts.panel.options.textLabel).fill(MARK);
  await page.getByLabel(watermarkTexts.panel.options.textLabel).blur();
}

function checkMarked(read: ReadPdf, fixture: string): void {
  expect(read.pages, fixture).toHaveLength(pages(fixture));
  for (const [i, p] of read.pages.entries()) expect(p.texts.some((t) => t.str.includes(MARK)), `${fixture} page ${i + 1}`).toBe(true);
}

test('Watermark PDF: the text across every page of the small fixtures', async ({ page, browserName }) => {
  await openTool(page, '/watermark-pdf/');
  await markWith(page);
  await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'watermark-pdf', browserName);
  await actionButton(page, watermarkTexts).click();
  const outs = filesOf(await takePdfDownload(page, 90_000));
  await recordEach('watermark-small', { tool: 'watermark-pdf', browser: browserName }, rows, SMALL, async (fixture) => {
    checkMarked(await soundPdf(outputFor(outs, fixture, 'watermarked')), fixture);
    return 'ok: the text on every page';
  });
});

for (const fixture of BIG) {
  test(`Watermark PDF: the text across every page of ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/watermark-pdf/');
    await markWith(page);
    await choosePdfs(page, [pdfFile(fixture)]);
    await actionButton(page, watermarkTexts).click();
    const out = await onlyOutput(page, fixture, 'watermarked', BIG_WAIT);
    await recordEach(`watermark-${bigCase(fixture)}`, { tool: 'watermark-pdf', browser: browserName }, [], [fixture], async () => {
      checkMarked(await soundPdf(out), fixture);
      return `ok: the text on each of ${pages(fixture)} pages`;
    });
  });
}

// ---- F18: the PDF presets (front P; DECISOES § 728 and § 729) ----------------------------------------------------
// Each preset against every fixture its parent takes (§ 175): Extract pages with pages picked by number, typed out of order,
// checked by the order and the text of each page; PDF to PNG with its pages, the size of each image by the resolution, the
// PNG format by the bytes, and the size it states against the JPG of PDF to JPG. Their tables are in
// docs/relatorios/fase-18-matriz-pdf.md (scripts/fixtures/pdf-matrix-table.ts --table fase-18).

/** The PDFs with a lock, which a tool that makes a PDF turns away with the link to Unlock PDF. */
const LOCKED_REFUSAL: Record<string, RegExp> = { 'gen-cifrado-aes256.pdf': /needs a password/, 'gen-cifrado-dono.pdf': /editing restrictions/ };

/**
 * The pages Extract pages picks in a file of n pages, typed out of order and with a repeat (the second and third, the middle
 * and the last): they come out once each, in the order of the file. One page or two: the last one.
 */
function extractPlan(n: number): { typed: string; picked: number[] } {
  if (n <= 2) return { typed: String(n), picked: [n] };
  const middle = Math.ceil(n / 2);
  return { typed: `${n}, ${middle}, 2-3`, picked: [...new Set([2, 3, middle, n])].sort((a, b) => a - b) };
}

/** The first words PDF.js reads on a page, for the order "by the text" of decision 15. */
const wordsOf = (p: ReadPage): string => p.texts.map((t) => t.str).join(' ').replace(/\s+/g, ' ').trim().slice(0, 60);

/** Picks the pages of the plan by number and extracts them: one PDF, the picked pages in the order of the file, as they were. */
async function extractPages(page: Page, fixture: string, timeout?: number): Promise<string> {
  await ready(page, extractTexts, timeout);
  // Decision 7: no segment of Split's three modes (the grid's own Small and Large stay), the grid from the start, and
  // Split's count ("picked").
  await expect(page.locator('#fo-tool-root input[name="fo-split-mode"]')).toHaveCount(0);
  const n = pages(fixture);
  const { typed, picked } = extractPlan(n);
  await page.getByLabel('Pick pages by number').fill(typed);
  await page.getByRole('button', { name: 'Pick these' }).click();
  await expect(page.locator('#fo-tool-root .fo-pages__count')).toHaveText(countOf(panelTexts.grid, picked.length, n, false));
  await actionButton(page, extractTexts).click();
  const read = await soundPdf(await onlyOutput(page, fixture, 'extracted', timeout));
  const before = (await original(fixture)).pages;
  const at = <T>(of: (p: ReadPage) => T): T[] => picked.map((number) => of(before[number - 1] as ReadPage));
  expect(read.pages.map(pageKey), `${fixture}: the order`).toEqual(at(pageKey));
  expect(read.pages.map(wordsOf), `${fixture}: the text`).toEqual(at(wordsOf));
  expect(read.pages.map((p) => p.rotate), `${fixture}: the turns`).toEqual(at((p) => p.rotate));
  expect(read.pages.map((p) => p.widgets), `${fixture}: the form fields of the extracted pages`).toEqual(at((p) => p.widgets));
  return `ok: "${typed}" typed, pages ${picked.join(', ')} out in the order of the file, text, turns and fields kept`;
}

test('Extract pages: pages typed out of order in each small fixture, one file after the other, the refused ones in the middle', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/extract-pages/');
  const refused: Record<string, RegExp> = { ...REFUSAL_TEXT, ...LOCKED_REFUSAL };
  const sequence = [...SMALL.slice(0, 4), ...BROKEN_PDFS, ...Object.keys(LOCKED_REFUSAL), ...SMALL.slice(4)];
  let after: 'nothing' | 'result' | 'refusal' = 'nothing';
  await recordEach('extract-small', { tool: 'split-pdf-extract-pages', browser: browserName }, [], sequence, async (fixture) => {
    // A tool of one file at a time: Start over after a result; after a refusal the next file is chosen at once.
    if (after === 'result') await startOver(page);
    await choosePdfs(page, [pdfFile(fixture)]);
    const reason = refused[fixture];
    if (reason) {
      after = 'refusal';
      // F13a (UX-04 A; DECISOES § 487): the reason of the error is the line under the sentence, with the link to Unlock PDF
      // for a locked file.
      const why = page.locator('#fo-tool-root .fo-drop__why');
      await expect(why).toHaveText(reason, { timeout: 30_000 });
      if (fixture in LOCKED_REFUSAL) await expect(why.getByRole('link', { name: 'Unlock PDF' })).toHaveAttribute('href', '/unlock-pdf/');
      return `refused: ${(await why.innerText()).trim()}`;
    }
    after = 'result';
    return extractPages(page, fixture);
  });
  const errors = (await dataLayer(page)).filter((entry) => entry[0] === 'event' && entry[1] === 'tool_error').map((entry) => (entry[2] as { reason?: string }).reason);
  expect(errors.sort()).toEqual(['empty', 'needs-password', 'not-pdf', 'not-pdf', 'restricted', 'truncated']);
});

for (const fixture of BIG) {
  test(`Extract pages: the second, third, middle and last page of ${fixture}`, async ({ page, browserName }) => {
    await openTool(page, '/split-pdf/extract-pages/');
    await oneByOne(page, `extract-${bigCase(fixture)}`, { tool: 'split-pdf-extract-pages', browser: browserName }, [fixture], () => extractPages(page, fixture, BIG_WAIT));
  });
}

/** The fixtures whose pages are photos or a colour scan: there the PNG files of all the pages add up to several times the JPG files (decision 8). */
const PHOTO_PAGES = new Set(['gen-fotos.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf']);
const bytesOf = (outs: { name: string; bytes: Uint8Array }[], fixture: string, extension: string): number =>
  Array.from({ length: pages(fixture) }, (_, i) => outs.find((out) => out.name === `${base(fixture)}-page-${i + 1}.${extension}`)?.bytes.length ?? Number.NaN).reduce((sum, bytes) => sum + bytes, 0);

test('PDF to PNG: the small fixtures at 150 ppi, the owner-restricted one drawn, the locked one refused, each against the JPG of PDF to JPG', async ({ page, browserName }) => {
  // The JPG of the parent at its default, 150 ppi, of the same files: the page states the size of the PNG against it.
  const files = [...SMALL.slice(0, 4), 'gen-cifrado-dono.pdf', ...SMALL.slice(4)];
  await openTool(page, '/pdf-to-jpg/');
  await choosePdfs(page, files.map((name) => pdfFile(name)));
  const jpgs = filesOf(await takePdfDownload(page, 90_000));
  await openTool(page, '/pdf-to-jpg/to-png/');
  // Decision 8: no format choice; PNG at the parent's default resolution, with no option touched.
  await expect(page.locator('#fo-tool-root input[name="fo-images-format"]')).toHaveCount(0);
  await choosePdfs(page, [...withBroken(files), 'gen-cifrado-aes256.pdf'].map((name) => pdfFile(name)));
  const rows = await refusals(page, 'pdf-to-jpg-to-png', browserName);
  const locked = await rowReason(page, 'gen-cifrado-aes256.pdf');
  expect(locked).toMatch(/needs a password/);
  rows.push({ tool: 'pdf-to-jpg-to-png', fixture: 'gen-cifrado-aes256.pdf', browser: browserName, result: `refused: ${locked}` });
  const download = await takePdfDownload(page, 90_000);
  // The ZIP of images of the parent (the panel names it by the base tool, DECISOES § 725).
  expect(download.name).toBe(`${panelTexts.files.imagesZip}.zip`);
  const outs = filesOf(download);
  expect(outs).toHaveLength(files.reduce((sum, name) => sum + pages(name), 0));
  await recordEach('png-small', { tool: 'pdf-to-jpg-to-png', browser: browserName }, rows, files, async (fixture) => {
    await checkImages(outs, fixture, 150, Array.from({ length: pages(fixture) }, (_, i) => i + 1), 'png');
    // "For a PDF of photos, the PNG files of all its pages add up to several times the size of the JPG files. For a PDF of
    // text and lines, the two are of a similar size: the PNG files of all its pages add up to between about half and about
    // twice the size of the JPG files, so they can even be the smaller ones." (the specs and the FAQ of the page; DECISOES
    // § 729). The sentence and this check are per PDF: the bytes of all the pages of a fixture added up (bytesOf). One page
    // alone goes further (0.39 to 2.9 on the other fixtures, down to 2.5 on a photo page; front P), so the page says it of
    // the PDF.
    // This test runs at 150 ppi, in both browsers. Several times: more than 3 (4.68 to 6.34 here in the recorded runs; 4.1
    // to 7.3 at the three resolutions, front P). Between about half and about twice: over 0.4 and under 2, both ways. Here
    // the recorded runs give 0.44 (WebKit, gen-ja-otimizado) to 1.28 (Chromium), the PNG files the smaller ones in WebKit.
    // At 300 ppi WebKit reaches 0.40 on gen-ja-otimizado (front P; the top, 1.91, is at 72 ppi in Chromium): that is why
    // the sentence says "about half", and why the bound is 0.4 and not the 0.44 measured here.
    const png = bytesOf(outs, fixture, 'png');
    const jpg = bytesOf(jpgs, fixture, 'jpg');
    const ratio = png / jpg;
    if (PHOTO_PAGES.has(fixture)) expect(ratio, `${fixture}: PNG ${png} B, JPG ${jpg} B`).toBeGreaterThan(3);
    else {
      expect(ratio, `${fixture}: PNG ${png} B, JPG ${jpg} B, at most about twice the JPG`).toBeLessThan(2);
      expect(ratio, `${fixture}: PNG ${png} B, JPG ${jpg} B, at least about half the JPG`).toBeGreaterThan(0.4);
    }
    return `ok: ${pages(fixture)} PNG at 150 ppi, sizes within 1 px, no Exif; ${png} B against ${jpg} B of JPG (${ratio.toFixed(2)}×)`;
  });
});

test('PDF to PNG: 300 ppi of a range of each big file', async ({ page, browserName }) => {
  await openTool(page, '/pdf-to-jpg/to-png/');
  await option(page, pngTexts.panel.options.high);
  await option(page, pngTexts.panel.options.range);
  await page.getByLabel(pngTexts.panel.options.rangeLabel).fill('1-2, 117');
  await page.getByLabel(pngTexts.panel.options.rangeLabel).blur();
  await choosePdfs(page, BIG.map((name) => pdfFile(name)));
  const outs = filesOf(await takePdfDownload(page, BIG_WAIT));
  expect(outs).toHaveLength(BIG.length * 3);
  await recordEach('png-big', { tool: 'pdf-to-jpg-to-png', browser: browserName }, [], BIG, async (fixture) => {
    await checkImages(outs, fixture, 300, [1, 2, 117], 'png');
    return 'ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif';
  });
});
