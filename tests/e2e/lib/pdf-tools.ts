// Shared parts of the PDF tool specs (F5a): the PDF fixtures as a browser hands them over, a run of a tool page over a
// batch, and the download of what came out (one file, or the ZIP opened in Node). The expected values come from the
// oracle fixtures/pdf/expected.json (PDF.js and qpdf), never from the engine.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';
import type { PdfOracleEntry } from '../../../scripts/fixtures/pdf.ts';
import { dismissCookies, hydrated, type TestFile } from './page.ts';
import { readZip } from './zip.ts';
import { strictPdf } from './pdf.ts';
import { readWithPdfjs, type ReadPdf } from './pdfjs-read.ts';
import { qpdfCheck } from '../../../scripts/lib/qpdf.ts';

const DIR = 'fixtures/pdf';
export const PDF_ORACLE = JSON.parse(readFileSync(`${DIR}/expected.json`, 'utf8')) as { files: Record<string, PdfOracleEntry>; passwords: Record<string, string> };

export function pdfOracle(name: string): PdfOracleEntry {
  const entry = PDF_ORACLE.files[name];
  if (!entry) throw new Error(`${name} is not in fixtures/pdf/expected.json`);
  return entry;
}

export const pdfBytes = (name: string): Buffer => readFileSync(resolve(DIR, name));

/** As a browser would hand it over: the type comes from the name (".pdf" says PDF even for a JPEG). */
export function pdfFile(name: string, as = basename(name)): TestFile {
  return { name: as, mimeType: 'application/pdf', buffer: pdfBytes(name) };
}

/** Readable fixtures (no lock, not broken), in the order of the oracle. */
export const READABLE_PDFS = Object.keys(PDF_ORACLE.files).filter((name) => PDF_ORACLE.files[name]?.expect === 'ok');
/** What every tool refuses (the repaired one is processed, with a note). */
export const BROKEN_PDFS = ['gen-cortado.pdf', 'gen-vazio.pdf', 'gen-jpg-extensao-pdf.pdf', 'gen-texto-extensao-pdf.pdf'] as const;

export async function openTool(page: Page, path: string): Promise<void> {
  const response = await page.goto(path);
  expect(response?.status(), `${path} answers 200`).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

export async function choosePdfs(page: Page, files: TestFile[]): Promise<void> {
  await page.setInputFiles('#fo-tool-root input[type="file"]', files);
}

export interface Download {
  name: string;
  bytes: Uint8Array;
}

/** What the Download button hands out, read in the page (no file system download). */
export async function takePdfDownload(page: Page, timeout = 60_000): Promise<Download> {
  const link = page.locator('#fo-tool-root .fo-btn--download');
  await expect(link).toBeVisible({ timeout });
  const name = (await link.getAttribute('download')) ?? '';
  const base64 = await link.evaluate(async (anchor: HTMLAnchorElement) => {
    const bytes = new Uint8Array(await (await fetch(anchor.href)).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  });
  return { name, bytes: new Uint8Array(Buffer.from(base64, 'base64')) };
}

/** The files of a download: the ZIP's entries, or the one file itself. */
export function filesOf(download: Download): Download[] {
  if (download.name.endsWith('.zip')) return readZip(download.bytes).map((entry) => ({ name: entry.name, bytes: entry.bytes }));
  return [download];
}

// ---- what every output goes through ---------------------------------------------------------------------------


/**
 * A PDF the site gave back: the strict structure (not for an encrypted one, which the test parser cannot read), qpdf
 * --check with no warning (or exactly the warnings of the original, for a file handed back as it was), and PDF.js
 * reading every page with its operator list.
 */
export async function soundPdf(bytes: Uint8Array, options: { password?: string; originalWarnings?: readonly string[] } = {}): Promise<ReadPdf> {
  if (!options.password) expect((await strictPdf(bytes)).problems, 'strict structure').toEqual([]);
  const check = await qpdfCheck(bytes, options.password);
  const warnings = check.out.filter((line) => /WARNING/.test(line)).map((line) => line.replace(/^.*?WARNING: \/in\/file\.pdf/, 'WARNING'));
  if (options.originalWarnings && options.originalWarnings.length > 0) expect(warnings, 'qpdf --check: only the warnings of the original').toEqual([...options.originalWarnings]);
  else expect(check.code, `qpdf --check: ${check.out.join(' | ')}`).toBe(0);
  return readWithPdfjs(bytes, options.password);
}

export interface MatrixRow {
  tool: string;
  fixture: string;
  browser: string;
  /** "ok" with what was checked, or the refusal reason the row showed. */
  result: string;
}

/** One JSON per test in test-results/matriz-pdf/: scripts/fixtures/pdf-matrix-table.ts builds the table from them. */
export function recordMatrix(name: string, rows: MatrixRow[]): void {
  const dir = resolve('test-results', 'matriz-pdf');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`);
}

/** The Oli line on the row of a refused file (FileCard error state). */
export async function rowReason(page: Page, fileName: string): Promise<string> {
  const more = page.locator('#fo-tool-root .fo-queue__more');
  if (await more.isVisible()) await more.click();
  const row = page.locator('#fo-tool-root .fo-filelist__row').filter({ hasText: fileName });
  await expect(row.locator('.fo-file__err')).toBeVisible({ timeout: 30_000 });
  return (await row.locator('.fo-file__err').innerText()).trim();
}

/** The same refusals for every tool: the line each broken fixture shows (src/tools/pdf/i18n/en.ts, errors). */
export const REFUSAL_TEXT: Record<(typeof BROKEN_PDFS)[number], RegExp> = {
  'gen-cortado.pdf': /stops before its end/,
  'gen-vazio.pdf': /is empty/,
  'gen-jpg-extensao-pdf.pdf': /is an image, not a PDF/,
  'gen-texto-extensao-pdf.pdf': /isn't a PDF/,
};
