// One request of the PDF tools, from the bytes of the files to the outputs or a failure (F5a, decision 4). Nothing
// here rejects: whatever an operation throws becomes { ok: false, reason } at the end of process(). The drawing parts
// (PDF to JPG and the Strong mode) take a Renderer, so the same code runs in the worker (PDF.js on an OffscreenCanvas)
// and on the page path (DECISOES § 22).
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PDFDocument, PDFName, PDFObjectCopier } from '@cantoo/pdf-lib';
import { assemble, type PageSource } from './assemble.ts';
import { PdfEngineError, failureOf } from './errors.ts';
import { recompressImages } from './images.ts';
import { hasXfa, openPdf, type OpenedPdf } from './open.ts';
import { numberPages, removeXfa, reorderPages, rotatePages, signPages, watermarkPages } from './operations.ts';
import { QPDF_ERROR, runQpdf } from './qpdf.ts';
import type { PdfNote, PdfOperation, PdfOutput, PdfResult, PdfSuccess } from './types.ts';

/** What the lossless mode asks qpdf for (the same options gen-ja-otimizado went through). */
export const LOSSLESS_ARGS = [
  '--object-streams=generate',
  '--compress-streams=y',
  '--recompress-flate',
  '--compression-level=9',
  '--remove-unreferenced-resources=yes',
  '--deterministic-id',
];

/** Resolution and JPEG quality of the Strong mode (DECISOES § 147). */
export const STRONG_PPI = 100;
export const STRONG_QUALITY = 0.6;
/** JPEG quality of PDF to JPG. */
export const IMAGE_QUALITY = 0.92;

export interface RenderedPage {
  bytes: Uint8Array;
  /** Pixels of the image. */
  width: number;
  height: number;
  /** Width and height of the page as shown, in points. */
  points: { width: number; height: number };
  downscaled: boolean;
}

/** Draws pages of one file: PDF.js in the worker or on the page. */
export interface Renderer {
  pages: number;
  render(index: number, scale: number, type: 'image/jpeg' | 'image/png', quality: number): Promise<RenderedPage>;
  close(): Promise<void>;
}

export type OpenRenderer = (bytes: Uint8Array) => Promise<Renderer>;

const done = (outputs: PdfOutput[], notes: PdfNote[] = [], outcome: PdfSuccess['outcome'] = 'new'): PdfSuccess => ({ ok: true, outputs, outcome, notes: [...new Set(notes)] });

/** Opens a file that a tool other than Unlock may change: no lock (PDF to JPG may draw a restricted one). */
async function openUnlocked(bytes: Uint8Array, allowRestricted = false): Promise<OpenedPdf> {
  const opened = await openPdf(bytes);
  if (opened.lock === 'password') throw new PdfEngineError('needs-password');
  if (opened.lock === 'restricted' && !allowRestricted) throw new PdfEngineError('restricted');
  return opened;
}

/** pdf-lib's file: object streams for a new document; nothing of the device (updateMetadata stayed off at load). */
const saveDoc = (doc: PDFDocument): Promise<Uint8Array> => doc.save({ useObjectStreams: true, updateFieldAppearances: false });

/** A file qpdf can read: the original, or pdf-lib's rewrite of a file whose index was damaged. */
async function forQpdf(bytes: Uint8Array, opened: OpenedPdf): Promise<Uint8Array> {
  return opened.repaired ? opened.doc.save({ useObjectStreams: false, updateFieldAppearances: false }) : bytes;
}

async function qpdfOrFail(args: readonly string[], bytes: Uint8Array): Promise<Uint8Array> {
  const run = await runQpdf(args, bytes);
  if (run.code === QPDF_ERROR || !run.bytes) throw new PdfEngineError(run.lines.some((line) => /invalid password/i.test(line)) ? 'wrong-password' : 'corrupted');
  return run.bytes;
}

/** The smaller of the result and the original: an equal or bigger result gives the original bytes back (§ 33). */
function smallerOrOriginal(original: Uint8Array, result: Uint8Array, notes: PdfNote[]): PdfSuccess {
  if (result.length >= original.length) return done([{ bytes: original, kind: 'pdf' }], [], 'unchanged');
  return done([{ bytes: result, kind: 'pdf' }], notes);
}

/**
 * What Compress hands back when its result does not gain. The person's own bytes, untouched (§ 33), unless the file's
 * index was damaged: a damaged file never goes back damaged (decision 4; DECISOES § 156 and § 182), so its fallback is
 * the repaired rewrite through the lossless pass, taken before anything else changes the document.
 */
async function repairedBaseline(bytes: Uint8Array, opened: OpenedPdf): Promise<Uint8Array | null> {
  return opened.repaired ? qpdfOrFail([...LOSSLESS_ARGS, 'IN', 'OUT'], await forQpdf(bytes, opened)) : null;
}

/** The result when it is smaller than what the person would otherwise get back (the original, or its repaired rewrite). */
function smallerOrBaseline(original: Uint8Array, baseline: Uint8Array | null, result: Uint8Array, notes: PdfNote[]): PdfSuccess {
  if (!baseline) return smallerOrOriginal(original, result, notes);
  if (result.length < baseline.length) return done([{ bytes: result, kind: 'pdf' }], notes);
  return done([{ bytes: baseline, kind: 'pdf' }], ['repaired']);
}

async function compress(bytes: Uint8Array, mode: 'lossless' | 'recommended' | 'strong', openRenderer: OpenRenderer | null): Promise<PdfSuccess> {
  const opened = await openUnlocked(bytes);
  const notes: PdfNote[] = opened.repaired ? ['repaired'] : [];
  const baseline = await repairedBaseline(bytes, opened);
  if (mode === 'strong') {
    if (!openRenderer) throw new PdfEngineError('load');
    const renderer = await openRenderer(bytes);
    try {
      const pages: RenderedPage[] = [];
      for (let index = 0; index < renderer.pages; index += 1) pages.push(await renderer.render(index, STRONG_PPI / 72, 'image/jpeg', STRONG_QUALITY));
      const result = await imagesToPdf(opened.doc, pages);
      const strongNotes: PdfNote[] = ['text-flattened'];
      if (opened.doc.catalog.has(PDFName.of('AcroForm'))) strongNotes.push('form-lost');
      return smallerOrBaseline(bytes, baseline, result, [...notes, ...strongNotes]);
    } finally {
      await renderer.close();
    }
  }
  let source = await forQpdf(bytes, opened);
  if (mode === 'recommended') {
    const replaced = await recompressImages(opened.doc);
    if (replaced > 0) source = await opened.doc.save({ useObjectStreams: false, updateFieldAppearances: false });
  }
  const result = await qpdfOrFail([...LOSSLESS_ARGS, 'IN', 'OUT'], source);
  return smallerOrBaseline(bytes, baseline, result, notes);
}

/**
 * The PDF of the Strong mode: one image per page, each page the size of the page as shown, with the Info and XMP of
 * the source (the rule of a new document, DECISOES § 145).
 */
export async function imagesToPdf(source: PDFDocument | null, pages: readonly RenderedPage[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create({ updateMetadata: false });
  for (const page of pages) {
    const image = await doc.embedJpg(page.bytes);
    const sheet = doc.addPage([page.points.width, page.points.height]);
    sheet.drawImage(image, { x: 0, y: 0, width: page.points.width, height: page.points.height });
  }
  if (source) {
    const info = source.context.trailerInfo.Info;
    const metadata = source.catalog.get(PDFName.of('Metadata'));
    if (info || metadata) {
      const copier = PDFObjectCopier.for(source.context, doc.context);
      if (info) doc.context.trailerInfo.Info = copier.copy(info);
      if (metadata) doc.catalog.set(PDFName.of('Metadata'), copier.copy(metadata));
    }
  }
  return doc.save({ useObjectStreams: true });
}

/** The Strong mode when the pages were drawn on the page (no OffscreenCanvas in the worker, DECISOES § 22). */
export async function strongFromPages(bytes: Uint8Array, pages: readonly RenderedPage[]): Promise<PdfResult> {
  try {
    const opened = await openUnlocked(bytes);
    const notes: PdfNote[] = opened.repaired ? ['repaired', 'text-flattened'] : ['text-flattened'];
    if (opened.doc.catalog.has(PDFName.of('AcroForm'))) notes.push('form-lost');
    const baseline = await repairedBaseline(bytes, opened);
    return smallerOrBaseline(bytes, baseline, await imagesToPdf(opened.doc, pages), notes);
  } catch (error) {
    return failureOf(error, 'encode');
  }
}

async function lockTools(bytes: Uint8Array, op: Extract<PdfOperation, { kind: 'protect' | 'unlock' }>): Promise<PdfSuccess> {
  const opened = await openPdf(bytes);
  if (op.kind === 'protect') {
    if (opened.lock === 'password') throw new PdfEngineError('needs-password');
    if (opened.lock === 'restricted') throw new PdfEngineError('restricted');
    if (op.password.length === 0) throw new PdfEngineError('encode');
    const source = await forQpdf(bytes, opened);
    const out = await qpdfOrFail(['--encrypt', `--user-password=${op.password}`, `--owner-password=${op.password}`, '--bits=256', '--', 'IN', 'OUT'], source);
    return done([{ bytes: out, kind: 'pdf' }], opened.repaired ? ['repaired'] : []);
  }
  if (opened.lock === 'none') throw new PdfEngineError('not-encrypted');
  if (opened.lock === 'password' && !op.password) throw new PdfEngineError('needs-password');
  const args = ['--decrypt', ...(opened.lock === 'password' && op.password ? [`--password=${op.password}`] : []), 'IN', 'OUT'];
  const out = await qpdfOrFail(args, bytes);
  return done([{ bytes: out, kind: 'pdf' }]);
}

async function pageImages(bytes: Uint8Array, op: Extract<PdfOperation, { kind: 'images' }>, openRenderer: OpenRenderer | null): Promise<PdfSuccess> {
  const opened = await openUnlocked(bytes, true);
  if (!openRenderer) throw new PdfEngineError('load');
  const renderer = await openRenderer(bytes);
  try {
    const wanted = op.pages ?? Array.from({ length: renderer.pages }, (_, i) => i);
    const indices = wanted.filter((index) => index >= 0 && index < renderer.pages);
    if (indices.length === 0) throw new PdfEngineError('encode');
    const outputs: PdfOutput[] = [];
    let downscaled = false;
    const type = op.format === 'png' ? 'image/png' : 'image/jpeg';
    for (const index of indices) {
      const page = await renderer.render(index, op.ppi / 72, type, IMAGE_QUALITY);
      downscaled ||= page.downscaled;
      outputs.push({ bytes: page.bytes, kind: op.format, index: index + 1, width: page.width, height: page.height });
    }
    const notes: PdfNote[] = [];
    if (downscaled) notes.push('downscaled');
    if (opened.repaired) notes.push('repaired');
    return done(outputs, notes);
  } finally {
    await renderer.close();
  }
}

/** Every page index of a document, in order. */
const allPages = (doc: PDFDocument): number[] => Array.from({ length: doc.getPageCount() }, (_, i) => i);

async function structural(files: readonly Uint8Array[], op: Extract<PdfOperation, { kind: 'merge' | 'split' | 'delete' }>): Promise<PdfSuccess> {
  const opened: OpenedPdf[] = [];
  for (const bytes of files) opened.push(await openUnlocked(bytes));
  const notes: PdfNote[] = opened.some((file) => file.repaired) ? ['repaired'] : [];
  const build = async (sources: PageSource[], index?: number): Promise<PdfOutput> => {
    const { doc, report } = await assemble(sources);
    if (report.xfaDropped) notes.push('xfa-removed');
    return { bytes: await saveDoc(doc), kind: 'pdf', pages: sources.length, ...(index === undefined ? {} : { index }) };
  };
  const first = opened[0];
  if (!first) throw new PdfEngineError('encode');
  if (op.kind === 'merge') {
    return done([await build(opened.flatMap((file) => allPages(file.doc).map((index) => ({ doc: file.doc, index }))))], notes);
  }
  const count = first.doc.getPageCount();
  const valid = (index: number) => Number.isInteger(index) && index >= 0 && index < count;
  if (op.kind === 'delete') {
    const remove = new Set(op.remove.filter(valid));
    const keep = allPages(first.doc).filter((index) => !remove.has(index));
    if (keep.length === 0 || remove.size === 0) throw new PdfEngineError('encode');
    return done([await build(keep.map((index) => ({ doc: first.doc, index })))], notes);
  }
  const parts = op.parts.map((part) => [...new Set(part.filter(valid))]).filter((part) => part.length > 0);
  if (parts.length === 0) throw new PdfEngineError('encode');
  const outputs: PdfOutput[] = [];
  for (const [i, part] of parts.entries()) outputs.push(await build(part.map((index) => ({ doc: first.doc, index })), i + 1));
  return done(outputs, notes);
}

async function inPlace(bytes: Uint8Array, op: Extract<PdfOperation, { kind: 'reorder' | 'rotate' | 'numbers' | 'watermark' | 'sign' }>): Promise<PdfSuccess> {
  const opened = await openUnlocked(bytes);
  const { doc } = opened;
  const notes: PdfNote[] = opened.repaired ? ['repaired'] : [];
  if (hasXfa(doc) && removeXfa(doc)) notes.push('xfa-removed');
  switch (op.kind) {
    case 'reorder':
      reorderPages(doc, op.order);
      break;
    case 'rotate':
      rotatePages(doc, op.all, op.pages);
      break;
    case 'numbers':
      await numberPages(doc, op);
      break;
    case 'watermark':
      await watermarkPages(doc, op);
      break;
    case 'sign':
      await signPages(doc, op.image, op.pages, op.box);
      break;
  }
  return done([{ bytes: await saveDoc(doc), kind: 'pdf', pages: doc.getPageCount() }], notes);
}

/**
 * Runs one request. `files` are the bytes of the files in order (merge takes them all, the others the first).
 * `openRenderer` draws pages (null when this context cannot draw: the page path does it).
 */
export async function processPdf(op: PdfOperation, files: readonly Uint8Array[], openRenderer: OpenRenderer | null): Promise<PdfResult> {
  const first = files[0];
  try {
    if (!first) throw new PdfEngineError('empty');
    switch (op.kind) {
      case 'merge':
      case 'split':
      case 'delete':
        return await structural(files, op);
      case 'compress':
        return await compress(first, op.mode, openRenderer);
      case 'protect':
      case 'unlock':
        return await lockTools(first, op);
      case 'images':
        return await pageImages(first, op, openRenderer);
      default:
        return await inPlace(first, op);
    }
  } catch (error) {
    const failure = failureOf(error, 'encode');
    const source = (error as { source?: unknown }).source;
    return typeof source === 'string' ? { ...failure, source: source as never } : failure;
  }
}
