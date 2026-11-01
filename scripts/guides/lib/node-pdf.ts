// The PDF measurements that need no browser (guides 2, 8 and 9): the engine of the site, src/engine/pdf/, run in Node with
// its assets read from node_modules (the helpers of the unit tests). Lossless and Recommended, Split and Merge are
// qpdf, MozJPEG and pdf-lib in WebAssembly and JavaScript, the same bytes the site's worker gives. What takes the space
// in a file is read with pdf-lib, which the engine also uses.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PDFDict, PDFDocument, PDFName, PDFRawStream, PDFRef, ParseSpeeds } from '@cantoo/pdf-lib';
import { processPdf } from '../../../src/engine/pdf/process.ts';
import type { CompressMode, PdfResult } from '../../../src/engine/pdf/types.ts';
import { useNodeAssets } from '../../../tests/unit/lib/pdf-engine.ts';

const DIR = 'fixtures/pdf';
export const pdfFixture = (name: string): Uint8Array => new Uint8Array(readFileSync(join(DIR, name)));

let ready = false;
function assets(): void {
  if (!ready) useNodeAssets();
  ready = true;
}

export const NODE_PDF_ENGINE = 'src/engine/pdf (qpdf, MozJPEG and pdf-lib in Node, the code of the site worker)';
export const NODE_PDFLIB = '@cantoo/pdf-lib in Node (the library the engine opens files with)';

/** Where the bytes of a PDF are: image streams, embedded font programs, and everything else (pages, forms, index). */
export interface Breakdown {
  total: number;
  pages: number;
  images: number;
  imageCount: number;
  fonts: number;
  /** Font programs (FontFile, FontFile2, FontFile3), each counted once however many fonts share it. */
  fontCount: number;
  other: number;
}

export async function breakdown(bytes: Uint8Array): Promise<Breakdown> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true, parseSpeed: ParseSpeeds.Fastest, throwOnInvalidObject: false });
  const fontFiles = new Set<string>();
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFDict)) continue;
    if (object.get(PDFName.of('Type'))?.toString() !== '/FontDescriptor') continue;
    for (const key of ['FontFile', 'FontFile2', 'FontFile3']) {
      const ref = object.get(PDFName.of(key));
      if (ref instanceof PDFRef) fontFiles.add(ref.toString());
    }
  }
  let images = 0;
  let imageCount = 0;
  let fonts = 0;
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const length = object.contents.length;
    if (object.dict.get(PDFName.of('Subtype'))?.toString() === '/Image') {
      images += length;
      imageCount += 1;
    } else if (fontFiles.has(ref.toString())) {
      fonts += length;
    }
  }
  return { total: bytes.length, pages: doc.getPageCount(), images, imageCount, fonts, fontCount: fontFiles.size, other: bytes.length - images - fonts };
}

function success(result: PdfResult, what: string): Extract<PdfResult, { ok: true }> {
  if (!result.ok) throw new Error(`${what}: the engine said ${result.reason}`);
  return result;
}

export interface Compressed {
  before: number;
  after: number;
  /** 'unchanged': nothing got smaller and the original bytes came back. */
  outcome: 'new' | 'unchanged';
  notes: string[];
}

/** Compress PDF in one of the modes that never draws a page (Strong draws them on the browser's canvas). */
export async function compress(name: string, mode: Exclude<CompressMode, 'strong'>): Promise<Compressed> {
  assets();
  const bytes = pdfFixture(name);
  const result = success(await processPdf({ kind: 'compress', mode }, [bytes], null), `${mode} on ${name}`);
  const out = result.outputs[0];
  if (!out) throw new Error(`${mode} on ${name}: no output`);
  return { before: bytes.length, after: out.bytes.length, outcome: result.outcome, notes: [...result.notes] };
}

export interface SplitMeasure {
  original: Breakdown;
  parts: number;
  sum: number;
  /** The bytes of images and fonts summed over every part. */
  partImages: number;
  partFonts: number;
  notes: string[];
}

/** Split PDF with its default, one part per page, and what each part carries. */
export async function splitEach(name: string): Promise<SplitMeasure> {
  assets();
  const bytes = pdfFixture(name);
  const original = await breakdown(bytes);
  const parts = Array.from({ length: original.pages }, (_, index) => [index]);
  const result = success(await processPdf({ kind: 'split', parts }, [bytes], null), `split ${name}`);
  let sumBytes = 0;
  let partImages = 0;
  let partFonts = 0;
  for (const out of result.outputs) {
    sumBytes += out.bytes.length;
    const part = await breakdown(out.bytes);
    partImages += part.images;
    partFonts += part.fonts;
  }
  return { original, parts: result.outputs.length, sum: sumBytes, partImages, partFonts, notes: [...result.notes] };
}

export interface MergeMeasure {
  inputs: number[];
  merged: number;
  notes: string[];
}

export async function merge(names: readonly string[]): Promise<MergeMeasure> {
  assets();
  const files = names.map(pdfFixture);
  const result = success(await processPdf({ kind: 'merge' }, files, null), `merge ${names.join(' + ')}`);
  const out = result.outputs[0];
  if (!out) throw new Error('merge: no output');
  return { inputs: files.map((file) => file.length), merged: out.bytes.length, notes: [...result.notes] };
}
