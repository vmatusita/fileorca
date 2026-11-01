import { expect, test, type Page } from '@playwright/test';
import { metadataReport } from './lib/images.ts';
import { imageSize } from './lib/images.ts';
import { readWithPdfjs, opensWithoutPassword } from './lib/pdfjs-read.ts';
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
import deleteTexts from '../../src/tools/delete-pdf-pages/i18n/en.ts';
import mergeTexts from '../../src/tools/merge-pdf/i18n/en.ts';

// The fixture matrix of the PDF tools (F5a, decision 12): every tool, every fixture it takes, both browsers, with the
// refused files in the middle of the batch. Every output is downloaded and read in Node by readers that are not the
// engine: the strict structure, qpdf --check, PDF.js (every page and its operator list), and the arithmetic of the tool
// against fixtures/pdf/expected.json. A big file gets a test of its own, so no test runs past its timeout.

const SMALL = ['gen-paginas-mistas.pdf', 'gen-acoes.pdf', 'gen-fotos.pdf', 'gen-ja-otimizado.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'gen-xref-estragada.pdf'];
const BIG = ['gen-paginas-300.pdf', 'pdf-grande-fontes-embutidas-117p.pdf', 'pdf-escaneado-02-relatorio-nasa-150p.pdf'];
const markers = (name: string) => pdfOracle(name).markers ?? [];
/** Clicks the label of a segmented option (the radio itself is hidden), the way image-smoke.spec.ts does. */
const option = (page: Page, label: string | RegExp) => page.locator('.fo-seg__opt').filter({ hasText: label }).first().click();
const pages = (name: string) => pdfOracle(name).pages ?? 0;
const base = (name: string) => name.replace(/\.pdf$/, '');

/** The batch with the refused files in the middle. */
const withBroken = (files: readonly string[]) => [...files.slice(0, Math.ceil(files.length / 2)), ...BROKEN_PDFS, ...files.slice(Math.ceil(files.length / 2))];

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

test.describe.configure({ timeout: 120_000 });

test('Merge PDF: the small fixtures, the refused ones in the middle', async ({ page, browserName }) => {
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'merge-pdf', browserName);
  await page.getByRole('button', { name: mergeTexts.panel.action }).click();
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
  await page.getByRole('button', { name: mergeTexts.panel.action }).click();
  const [out] = filesOf(await takePdfDownload(page, 90_000));
  const read = await soundPdf(out?.bytes as Uint8Array);
  expect(read.pages).toHaveLength(300 + 117 + 150);
  expect(read.pages.slice(0, 300).map((p) => p.marker)).toEqual(markers('gen-paginas-300.pdf'));
  expect(read.outline).toHaveLength(pdfOracle('pdf-grande-fontes-embutidas-117p.pdf').outline);
  rows.push(...BIG.map((fixture) => ({ tool: 'merge-pdf', fixture, browser: browserName, result: `ok: ${pages(fixture)} pages in order, bookmarks kept` })));
  recordMatrix(`merge-big-${browserName}`, rows);
});

test('Split PDF: every page of the mixed pages, and a second file told it waits', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-fotos.pdf')]);
  expect(await rowReason(page, 'gen-fotos.pdf')).toMatch(/one PDF at a time/);
  await page.getByRole('button', { name: splitTexts.panel.action }).click();
  const outs = filesOf(await takePdfDownload(page));
  expect(outs.map((out) => out.name)).toEqual(Array.from({ length: 8 }, (_, i) => `gen-paginas-mistas-page-${i + 1}.pdf`));
  for (const [i, out] of outs.entries()) {
    const read = await soundPdf(out.bytes);
    expect(read.pages.map((p) => [p.marker, p.rotate])).toEqual([[`Page ${i + 1}`, pdfOracle('gen-paginas-mistas.pdf').rotate?.[i]]]);
  }
  recordMatrix(`split-each-${browserName}`, [{ tool: 'split-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'ok: 8 files, one page each, turns kept' }, { tool: 'split-pdf', fixture: 'gen-fotos.pdf', browser: browserName, result: 'refused: one PDF at a time' }]);
});

test('Split PDF: ranges of the 300 pages, named by part, never by the typed range', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-300.pdf')]);
  await option(page, splitTexts.panel.options.ranges);
  await page.getByLabel(splitTexts.panel.options.rangesLabel).fill('1-3, 150, 298-300');
  await page.getByRole('button', { name: splitTexts.panel.action }).click();
  const outs = filesOf(await takePdfDownload(page));
  expect(outs.map((out) => out.name)).toEqual(['gen-paginas-300-part-1.pdf', 'gen-paginas-300-part-2.pdf', 'gen-paginas-300-part-3.pdf']);
  const reads = await Promise.all(outs.map((out) => soundPdf(out.bytes)));
  expect(reads.map((read) => read.pages.map((p) => p.marker))).toEqual([['Page 1', 'Page 2', 'Page 3'], ['Page 150'], ['Page 298', 'Page 299', 'Page 300']]);
  recordMatrix(`split-ranges-${browserName}`, [{ tool: 'split-pdf', fixture: 'gen-paginas-300.pdf', browser: browserName, result: 'ok: 3 parts by range' }]);
});

test('Split PDF: every page of the 117-page notes, and pages picked on the grid of the IRS form', async ({ page, browserName }) => {
  await openTool(page, '/split-pdf/');
  await choosePdfs(page, [pdfFile('pdf-grande-fontes-embutidas-117p.pdf')]);
  await page.getByRole('button', { name: splitTexts.panel.action }).click();
  const outs = filesOf(await takePdfDownload(page, 90_000));
  expect(outs).toHaveLength(117);
  for (const out of [outs[0], outs[58], outs[116]]) expect((await soundPdf(out?.bytes as Uint8Array)).pages).toHaveLength(1);
  await page.getByRole('button', { name: 'Start over' }).click();
  await choosePdfs(page, [pdfFile('pdf-formulario-irs-1040-2019.pdf')]);
  await option(page, splitTexts.panel.options.pick);
  await page.getByRole('button', { name: /^Page 2 of 2/ }).click();
  await page.getByRole('button', { name: splitTexts.panel.action }).click();
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
  const files = ['gen-paginas-mistas.pdf', 'gen-acoes.pdf', 'gen-cifrado-dono.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'gen-xref-estragada.pdf'];
  await choosePdfs(page, [...withBroken(files), 'gen-cifrado-aes256.pdf'].map((name) => pdfFile(name)));
  const rows = await refusals(page, 'pdf-to-jpg', browserName);
  expect(await rowReason(page, 'gen-cifrado-aes256.pdf')).toMatch(/needs a password/);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of files) await checkImages(outs, fixture, 72, Array.from({ length: pages(fixture) }, (_, i) => i + 1), 'jpeg');
  expect(outs).toHaveLength(files.reduce((sum, name) => sum + pages(name), 0));
  rows.push(...files.map((fixture) => ({ tool: 'pdf-to-jpg', fixture, browser: browserName, result: `ok: ${pages(fixture)} JPG at 72 ppi, sizes within 1 px, no Exif` })));
  recordMatrix(`images-small-${browserName}`, rows);
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

test('Compress PDF: Recommended on the small fixtures, never bigger, the original back when it does not gain', async ({ page, browserName }) => {
  await openTool(page, '/compress-pdf/');
  await choosePdfs(page, withBroken(SMALL).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'compress-pdf', browserName);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of SMALL) {
    const original = pdfBytes(fixture);
    const out = outputFor(outs, fixture, 'compressed');
    expect(out.length, fixture).toBeLessThanOrEqual(original.length);
    const same = Buffer.compare(Buffer.from(out), original) === 0;
    await soundPdf(out, same ? { originalWarnings: pdfOracle(fixture).qpdf.warnings } : {});
    rows.push({ tool: 'compress-pdf', fixture, browser: browserName, result: same ? `ok: already optimized, original bytes (${original.length})` : `ok: ${original.length} → ${out.length} bytes` });
  }
  expect(Buffer.compare(Buffer.from(outputFor(outs, 'gen-ja-otimizado.pdf', 'compressed')), pdfBytes('gen-ja-otimizado.pdf'))).toBe(0);
  expect(outputFor(outs, 'gen-fotos.pdf', 'compressed').length).toBeLessThan(pdfBytes('gen-fotos.pdf').length * 0.6);
  recordMatrix(`compress-recommended-${browserName}`, rows);
});

test('Compress PDF: Lossless on the big fixtures, Strong said before the choice and run on three', async ({ page, browserName }) => {
  await openTool(page, '/compress-pdf/');
  await expect(page.getByText(compressTexts.panel.options.strongWarning)).toBeVisible();
  await option(page, compressTexts.panel.options.lossless);
  await choosePdfs(page, BIG.map((name) => pdfFile(name)));
  const outs = filesOf(await takePdfDownload(page, 110_000));
  const rows: MatrixRow[] = [];
  for (const fixture of BIG) {
    const out = outputFor(outs, fixture, 'compressed');
    expect(out.length).toBeLessThanOrEqual(pdfBytes(fixture).length);
    await soundPdf(out);
    rows.push({ tool: 'compress-pdf (lossless)', fixture, browser: browserName, result: `ok: ${pdfBytes(fixture).length} → ${out.length} bytes` });
  }
  await page.getByRole('button', { name: 'Start over' }).click();
  await option(page, compressTexts.panel.options.strong);
  const strong = ['gen-fotos.pdf', 'gen-paginas-mistas.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf'];
  await choosePdfs(page, strong.map((name) => pdfFile(name)));
  const strongOuts = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of strong) {
    const out = outputFor(strongOuts, fixture, 'compressed');
    expect(out.length).toBeLessThanOrEqual(pdfBytes(fixture).length);
    const same = Buffer.compare(Buffer.from(out), pdfBytes(fixture)) === 0;
    const read = await soundPdf(out);
    expect(read.pages).toHaveLength(pages(fixture));
    rows.push({ tool: 'compress-pdf (strong)', fixture, browser: browserName, result: same ? 'ok: no gain, original bytes' : `ok: pages as pictures, ${pdfBytes(fixture).length} → ${out.length} bytes` });
  }
  recordMatrix(`compress-lossless-strong-${browserName}`, rows);
});

test('Protect PDF: AES-256 with the same password on a batch, the password nowhere in the bytes', async ({ page, browserName }) => {
  const password = 'Orca-Sentinel-7391-Kq';
  await openTool(page, '/protect-pdf/');
  const files = ['gen-paginas-mistas.pdf', 'gen-fotos.pdf', 'gen-paginas-300.pdf'];
  await choosePdfs(page, [...withBroken(files), 'gen-cifrado-dono.pdf'].map((name) => pdfFile(name)));
  const rows = await refusals(page, 'protect-pdf', browserName);
  await page.getByLabel(protectTexts.panel.options.passwordLabel, { exact: true }).fill(password);
  await page.getByLabel(protectTexts.panel.options.confirmLabel, { exact: true }).fill(password);
  await page.getByRole('button', { name: protectTexts.panel.action }).click();
  const outs = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of files) {
    const out = outputFor(outs, fixture, 'protected');
    const shown = await qpdfEncryption(out, password);
    expect(shown.out).toEqual(expect.arrayContaining(['R = 6', 'stream encryption method: AESv3']));
    expect(await opensWithoutPassword(out)).toBe(false);
    expect((await soundPdf(out, { password })).pages.map((p) => p.marker)).toEqual(markers(fixture));
    expect(Buffer.from(out).includes(Buffer.from(password, 'latin1'))).toBe(false);
    rows.push({ tool: 'protect-pdf', fixture, browser: browserName, result: 'ok: R6 AESv3, opens only with the password' });
  }
  recordMatrix(`protect-${browserName}`, rows);
});

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
  await page.getByRole('button', { name: 'Start over' }).click();
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  expect(await page.locator('.fo-drop__help').innerText()).toMatch(/nothing to remove/);
  rows.push({ tool: 'unlock-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'refused: no password or restrictions' });
  recordMatrix(`unlock-${browserName}`, rows);
});

test('Rotate PDF: every page of a batch a quarter to the right, on top of its own turn', async ({ page, browserName }) => {
  await openTool(page, '/rotate-pdf/');
  const files = [...SMALL, 'gen-paginas-300.pdf'];
  await choosePdfs(page, withBroken(files).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'rotate-pdf', browserName);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of files) {
    const read = await soundPdf(outputFor(outs, fixture, 'rotated'));
    expect(read.pages.map((p) => p.rotate), fixture).toEqual((pdfOracle(fixture).rotate ?? []).map((turn) => (turn + 90) % 360));
    rows.push({ tool: 'rotate-pdf', fixture, browser: browserName, result: 'ok: every /Rotate +90' });
  }
  recordMatrix(`rotate-batch-${browserName}`, rows);
});

test('Rotate PDF: page by page on the grid of one file', async ({ page, browserName }) => {
  await openTool(page, '/rotate-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, rotateTexts.panel.options.pick);
  await page.getByRole('button', { name: /^Turn page 1 \(/ }).click();
  await page.getByRole('button', { name: /^Turn page 1 \(/ }).click();
  await page.getByRole('button', { name: /^Turn page 4 \(/ }).click();
  const [out] = filesOf(await takePdfDownload(page));
  const before = pdfOracle('gen-paginas-mistas.pdf').rotate ?? [];
  expect((await soundPdf(out?.bytes as Uint8Array)).pages.map((p) => p.rotate)).toEqual(before.map((turn, i) => (i === 0 ? (turn + 180) % 360 : i === 3 ? (turn + 90) % 360 : turn)));
  recordMatrix(`rotate-pages-${browserName}`, [{ tool: 'rotate-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'ok: page 1 +180, page 4 +90, the rest as they were' }]);
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
  recordMatrix(`delete-${browserName}`, [{ tool: 'delete-pdf-pages', fixture: 'gen-paginas-300.pdf', browser: browserName, result: 'ok: pages 2-299 out, every page picked refused' }]);
});

test('Add page numbers: "Page N of M" at the bottom centre of the small fixtures and the 117 pages', async ({ page, browserName }) => {
  await openTool(page, '/add-page-numbers-to-pdf/');
  await option(page, numbersTexts.panel.options.pageNofTotal);
  const files = [...SMALL, 'pdf-grande-fontes-embutidas-117p.pdf'];
  await choosePdfs(page, withBroken(files).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'add-page-numbers-to-pdf', browserName);
  const outs = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of files) {
    const read = await soundPdf(outputFor(outs, fixture, 'numbered'));
    read.pages.forEach((p, i) => {
      const number = p.texts.find((text) => text.str === `Page ${i + 1} of ${read.pages.length}`);
      expect(number, `${fixture} page ${i + 1}`).toBeDefined();
      expect(number?.angle).toBe(0);
      expect(number?.y ?? 0).toBeGreaterThan(p.shown.height - 40);
    });
    rows.push({ tool: 'add-page-numbers-to-pdf', fixture, browser: browserName, result: 'ok: "Page N of M" at the bottom centre, upright' });
  }
  recordMatrix(`numbers-${browserName}`, rows);
});

test('Reorder PDF pages: the reversed order of the mixed pages', async ({ page, browserName }) => {
  await openTool(page, '/reorder-pdf-pages/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await page.getByRole('button', { name: reorderTexts.panel.options.reverse }).click();
  await page.getByRole('button', { name: reorderTexts.panel.action }).click();
  const [out] = filesOf(await takePdfDownload(page));
  expect((await soundPdf(out?.bytes as Uint8Array)).pages.map((p) => p.marker)).toEqual([...markers('gen-paginas-mistas.pdf')].reverse());
  recordMatrix(`reorder-${browserName}`, [{ tool: 'reorder-pdf-pages', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'ok: reversed' }]);
});

test('Watermark PDF: the text across every page of the small fixtures and the 300 pages', async ({ page, browserName }) => {
  await openTool(page, '/watermark-pdf/');
  const text = 'Orca-Mark-5521-Zt';
  await page.getByLabel(watermarkTexts.panel.options.textLabel).fill(text);
  await page.getByLabel(watermarkTexts.panel.options.textLabel).blur();
  const files = [...SMALL, 'gen-paginas-300.pdf'];
  await choosePdfs(page, withBroken(files).map((name) => pdfFile(name)));
  const rows = await refusals(page, 'watermark-pdf', browserName);
  await page.getByRole('button', { name: watermarkTexts.panel.action }).click();
  const outs = filesOf(await takePdfDownload(page, 90_000));
  for (const fixture of files) {
    const read = await soundPdf(outputFor(outs, fixture, 'watermarked'));
    for (const [i, p] of read.pages.entries()) expect(p.texts.some((t) => t.str.includes(text)), `${fixture} page ${i + 1}`).toBe(true);
    rows.push({ tool: 'watermark-pdf', fixture, browser: browserName, result: 'ok: the text on every page' });
  }
  recordMatrix(`watermark-${browserName}`, rows);
});

test('Sign PDF: a typed name on every page of the mixed pages, inside the visible box', async ({ page, browserName }) => {
  await openTool(page, '/sign-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf')]);
  await option(page, signTexts.panel.options.type);
  await page.getByLabel(signTexts.panel.options.typeLabel).fill('Orca Signer Nine');
  await page.getByLabel(signTexts.panel.options.typeLabel).blur();
  await expect(page.locator('.fo-sign__box')).toBeVisible({ timeout: 20_000 });
  await option(page, signTexts.panel.options.allPages);
  await page.getByRole('button', { name: signTexts.panel.action }).click();
  const [out] = filesOf(await takePdfDownload(page));
  const read = await soundPdf(out?.bytes as Uint8Array);
  expect(read.pages.map((p) => p.images)).toEqual(new Array(8).fill(1));
  recordMatrix(`sign-${browserName}`, [{ tool: 'sign-pdf', fixture: 'gen-paginas-mistas.pdf', browser: browserName, result: 'ok: the signature image on every page' }]);
});
