// PDF worker: pdf-lib (about 240 KB gzipped) loads here and only here, the first time a PDF is built, so no other
// page and no other tool pays for it. The page talks to it through Comlink. Image to PDF and the money calculators use
// build() and report() (F2, F4) and never fetch more than this file. The PDF tools (F5a) use the rest: qpdf, PDF.js
// and the jSquash codecs load inside the calls that need them, never here; their files are configured below from the
// URLs the bundler gives (the .wasm unchanged, DECISOES § 61), and PDF.js's data folder is the copy the build makes of
// pdfjs-dist (src/platform/build-files.ts). Nothing rejects for a bad file: failures come back as { ok: false, reason }.
// Every output moves to the page with transfer, never copied.
import { expose, transfer } from 'comlink';
import { version as pdfjsVersion } from 'pdfjs-dist/package.json';
import qpdfWasm from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';
import jpegDecoder from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url';
import jpegEncoder from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import resizer from '@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url';
import { configurePdfAssets } from './assets.ts';
import { buildPdf } from './build.ts';
import { buildReport, type ReportInput } from './report.ts';
import { inspectPdf } from './open.ts';
import { processPdf, strongFromPages, type RenderedPage } from './process.ts';
import { pdfjsLibrary, drawPage, encodeCanvas, freeCanvas, openForDrawing, type PdfJsHandle } from './pdfjs.ts';
import { pdfjsRenderer } from './render.ts';
import { warmQpdf } from './qpdf.ts';
import { warmImageCodecs } from './images.ts';
import { zipStored, type ZipEntry } from './zip.ts';
import type { PdfPage, PdfPageSize } from './build.ts';
import type { PdfInspectResult, PdfOperation, PdfResult } from './types.ts';

/** Where the build copies PDF.js's decoders, CMaps and fonts: a folder per version, so its cache can be immutable. */
export const PDFJS_DATA_PATH = `/_astro/pdfjs/${pdfjsVersion}/`;

configurePdfAssets({ qpdfWasm, jpegDecoder, jpegEncoder, resizer, pdfjsData: PDFJS_DATA_PATH });

const canvasInWorker = (): boolean => {
  try {
    return typeof OffscreenCanvas !== 'undefined' && new OffscreenCanvas(1, 1).getContext('2d') !== null;
  } catch {
    return false;
  }
};

/** PDF.js with its parser in this same thread (the "fake worker"): this worker is already off the main thread. */
const loadPdfjs = () => pdfjsLibrary(() => import('pdfjs-dist/legacy/build/pdf.worker.mjs'));

const bytesOf = async (file: Blob): Promise<Uint8Array> => new Uint8Array(await file.arrayBuffer());

/** Open documents of the page grid: one per file the panel shows, until it says it is done with it. */
const open = new Map<string, Promise<PdfJsHandle>>();

function documentFor(id: string, file: Blob): Promise<PdfJsHandle> {
  let handle = open.get(id);
  if (!handle) {
    handle = loadPdfjs().then(async () => openForDrawing(await bytesOf(file)));
    open.set(id, handle);
    handle.catch(() => open.delete(id));
  }
  return handle;
}

function transferOutputs(result: PdfResult): PdfResult {
  if (!result.ok) return result;
  return transfer(result, result.outputs.map((output) => output.bytes.buffer as ArrayBuffer));
}

const api = {
  /**
   * The PDF of the pages, in order, as bytes. Changing only the page size builds it again. The bytes
   * move to the page instead of being copied: a PDF of a big batch can be tens of megabytes.
   */
  build: async (pages: PdfPage[], size: PdfPageSize): Promise<Uint8Array> => {
    const bytes = await buildPdf(pages, size);
    return transfer(bytes, [bytes.buffer as ArrayBuffer]);
  },
  /** The PDF of a money calculator: its inputs, result, assumptions and whole schedule (F4). */
  report: async (input: ReportInput): Promise<Uint8Array> => {
    const bytes = await buildReport(input);
    return transfer(bytes, [bytes.buffer as ArrayBuffer]);
  },
  /** Whether this worker can draw pages (OffscreenCanvas); when not, the page draws them (DECISOES § 22). */
  canvasInWorker: async (): Promise<boolean> => canvasInWorker(),
  /** Pages, boxes, lock, form and bookmarks of one file, before any tool runs. */
  inspect: async (file: Blob): Promise<PdfInspectResult> => inspectPdf(await bytesOf(file)),
  /** One request of a tool over the files (merge takes them all, the others the first). */
  process: async (op: PdfOperation, files: Blob[]): Promise<PdfResult> => {
    const bytes = await Promise.all(files.map(bytesOf));
    const draws = op.kind === 'images' || (op.kind === 'compress' && op.mode === 'strong');
    if (draws && canvasInWorker()) await loadPdfjs().catch(() => {});
    return transferOutputs(await processPdf(op, bytes, draws && canvasInWorker() ? pdfjsRenderer() : null));
  },
  /** The Strong mode from pages the page drew (no OffscreenCanvas here). */
  strongFromPages: async (file: Blob, pages: RenderedPage[]): Promise<PdfResult> => transferOutputs(await strongFromPages(await bytesOf(file), pages)),
  /** A JPEG of page `index` (0-based), `width` pixels wide: the thumbnail of the page grid. */
  thumbnail: async (id: string, file: Blob, index: number, width: number): Promise<Blob | null> => {
    try {
      const handle = await documentFor(id, file);
      const page = await handle.doc.getPage(index + 1);
      const scale = width / page.getViewport({ scale: 1 }).width;
      const drawn = await drawPage(handle, index, scale);
      try {
        return new Blob([(await encodeCanvas(drawn.canvas, 'image/jpeg', 0.8)) as BlobPart], { type: 'image/jpeg' });
      } finally {
        freeCanvas(drawn.canvas);
      }
    } catch {
      return null;
    }
  },
  /** The page grid is done with a file: its PDF.js document goes. */
  release: async (id: string): Promise<void> => {
    const handle = open.get(id);
    open.delete(id);
    await handle?.then((opened) => opened.destroy()).catch(() => {});
  },
  /** A stored ZIP of the outputs. */
  zip: async (entries: ZipEntry[]): Promise<Blob> => zipStored(entries),
  /** Fetches and compiles what a tool will need before the first file: qpdf, PDF.js (only where it can draw here) or the JPEG codecs. */
  warm: async (kinds: ('qpdf' | 'pdfjs' | 'codecs')[]): Promise<void> => {
    await Promise.all(
      kinds.map((kind) => {
        if (kind === 'qpdf') return warmQpdf().catch(() => {});
        if (kind === 'codecs') return warmImageCodecs().catch(() => {});
        return canvasInWorker() ? loadPdfjs().catch(() => {}) : Promise.resolve();
      }),
    );
  },
};

export type PdfEngineApi = typeof api;

expose(api);
