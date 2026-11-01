// Opening a PDF the way every tool does (F5a, decision 4): the type from the bytes, then pdf-lib, then a check that
// every page has what a viewer needs (its MediaBox and the content streams it names). A file whose index is broken
// but whose objects are whole is read by pdf-lib's scan and comes out repaired; a file that stops before its end, or
// whose pages point at objects that are not there, is refused. Encryption is caught here, before any tool touches the
// file: pdf-lib sees /Encrypt, and qpdf (loaded only for an encrypted file) tells a password from owner restrictions.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFRef, PDFStream, ParseSpeeds, type PDFPage } from '@cantoo/pdf-lib';
import { PdfEngineError } from './errors.ts';
import { boxOf, normalRotation, visibleBox, type Box } from './geometry.ts';
import { lockOf } from './qpdf.ts';
import { hasEnd, indexIsSound, sniffPdf } from './sniff.ts';
import type { PageBox, PdfInspectResult, PdfLock } from './types.ts';

export interface OpenedPdf {
  doc: PDFDocument;
  lock: PdfLock;
  repaired: boolean;
}

/** The largest file the engine opens: past this a phone browser runs out of memory long before pdf-lib does. */
export const MAX_PDF_BYTES = 1024 * 1024 * 1024;

const LOAD = { updateMetadata: false, ignoreEncryption: true, parseSpeed: ParseSpeeds.Fastest, throwOnInvalidObject: false } as const;

/** Whether the value of `key` is a reference (or an array of them) to an object the file does not have. */
function dangling(dict: PDFDict, key: string): boolean {
  const raw = dict.get(PDFName.of(key));
  const refs = raw instanceof PDFRef ? [raw] : raw instanceof PDFArray ? raw.asArray().filter((item): item is PDFRef => item instanceof PDFRef) : [];
  return refs.some((ref) => dict.context.lookup(ref) === undefined);
}

/** A page a viewer can draw: a MediaBox, and content streams that exist. */
function soundPage(page: PDFPage): boolean {
  const node = page.node;
  if (!node.MediaBox()) return false;
  if (dangling(node, 'Contents')) return false;
  const contents = node.Contents();
  if (contents instanceof PDFArray) return contents.asArray().every((item) => !(item instanceof PDFRef) || node.context.lookup(item) instanceof PDFStream);
  return contents === undefined || contents instanceof PDFStream;
}

/**
 * pdf-lib's view of the file, or the reason it is refused. `password` reads an encrypted file (Unlock decrypts with
 * qpdf instead; nothing else opens a locked file), so here an encrypted file comes back with its lock and the caller
 * decides.
 */
export async function openPdf(bytes: Uint8Array): Promise<OpenedPdf> {
  const kind = sniffPdf(bytes);
  if (kind === 'empty') throw new PdfEngineError('empty');
  if (kind !== 'pdf') throw Object.assign(new PdfEngineError('not-pdf'), { source: kind });
  if (bytes.length > MAX_PDF_BYTES) throw new PdfEngineError('too-large');
  const ended = hasEnd(bytes);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, LOAD);
  } catch {
    throw new PdfEngineError(ended ? 'corrupted' : 'truncated');
  }
  if (doc.isEncrypted) {
    const lock = await lockOf(bytes);
    return { doc, lock: lock === 'none' ? 'restricted' : lock, repaired: false };
  }
  let pages: PDFPage[];
  try {
    pages = doc.getPages();
  } catch {
    throw new PdfEngineError(ended ? 'corrupted' : 'truncated');
  }
  if (pages.length === 0 || !pages.every(soundPage)) throw new PdfEngineError(ended ? 'corrupted' : 'truncated');
  return { doc, lock: 'none', repaired: !indexIsSound(bytes) };
}

/** The numbers of a PDF rectangle (an entry may be a reference to a number). */
function numbersOf(page: PDFPage, array: PDFArray): number[] {
  return array.asArray().map((item) => {
    const value = item instanceof PDFRef ? page.doc.context.lookup(item) : item;
    return value instanceof PDFNumber ? value.asNumber() : 0;
  });
}

/** The visible box and the turn of a page. */
export function pageBox(page: PDFPage): PageBox & { box: Box } {
  const mediaRaw = page.node.MediaBox();
  const media = boxOf(mediaRaw ? numbersOf(page, mediaRaw) : [0, 0, 612, 792]);
  const cropRaw = page.node.CropBox();
  const crop = cropRaw ? boxOf(numbersOf(page, cropRaw)) : null;
  const box = visibleBox(media, crop);
  return { box, width: box.width, height: box.height, rotate: normalRotation(page.getRotation().angle) };
}

function countWidgets(doc: PDFDocument): number {
  let widgets = 0;
  for (const page of doc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (const item of annots.asArray()) {
      const annot = item instanceof PDFRef ? doc.context.lookup(item) : item;
      if (annot instanceof PDFDict && annot.get(PDFName.of('Subtype')) === PDFName.of('Widget')) widgets += 1;
    }
  }
  return widgets;
}

export function hasXfa(doc: PDFDocument): boolean {
  const form = doc.catalog.lookup(PDFName.of('AcroForm'));
  return form instanceof PDFDict && form.has(PDFName.of('XFA'));
}

export function hasOutline(doc: PDFDocument): boolean {
  const outlines = doc.catalog.lookup(PDFName.of('Outlines'));
  return outlines instanceof PDFDict && outlines.has(PDFName.of('First'));
}

/** What the panel shows before any tool runs: pages, their boxes, the lock, the form and the bookmarks. */
export async function inspectPdf(bytes: Uint8Array): Promise<PdfInspectResult> {
  try {
    const { doc, lock, repaired } = await openPdf(bytes);
    if (lock !== 'none') {
      // The page tree of an encrypted file is readable (only strings and streams are encrypted): count it if possible.
      let pages = 0;
      try {
        pages = doc.getPageCount();
      } catch {
        pages = 0;
      }
      return { ok: true, pages, boxes: [], lock, form: { widgets: 0, xfa: false }, outline: false, repaired: false };
    }
    const boxes = doc.getPages().map((page) => {
      const { width, height, rotate } = pageBox(page);
      return { width: Math.round(width * 100) / 100, height: Math.round(height * 100) / 100, rotate };
    });
    return { ok: true, pages: boxes.length, boxes, lock, form: { widgets: countWidgets(doc), xfa: hasXfa(doc) }, outline: hasOutline(doc), repaired };
  } catch (error) {
    if (error instanceof PdfEngineError) {
      const source = (error as PdfEngineError & { source?: ReturnType<typeof sniffPdf> }).source;
      return { ok: false, reason: error.reason, ...(source ? { source } : {}) };
    }
    return { ok: false, reason: 'corrupted' };
  }
}
