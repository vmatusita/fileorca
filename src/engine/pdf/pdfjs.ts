// PDF.js (the legacy build, DECISOES § 144) for drawing pages: thumbnails of the page grid, PDF to JPG and the Strong
// mode of Compress. It is locked down (decision 4):
//  - canvas only: no text layer, no annotation layer, no XFA, no scripting (pdf.js 6 has no eval path left; the
//    published files are checked by tests/unit/pdf-hardening.test.ts), annotations not drawn either;
//  - its decoders, CMaps and standard fonts come from the site's own folder (copied unchanged from pdfjs-dist), never a
//    CDN; the Liberation fonts (GPL) are not served, so a page that asks for them gets PDF.js's built-in fallback;
//  - in the engine worker, the parser runs in the same thread (the "fake worker" fed with PDF.js's worker module, which
//    the caller loads), and pages are drawn on an OffscreenCanvas; on the page path (a worker without OffscreenCanvas,
//    DECISOES § 22) the caller hands a Worker running pdfjs-core.ts and pages are drawn on a <canvas>.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import './polyfills.ts';
import type * as PdfJsNamespace from 'pdfjs-dist/legacy/build/pdf.mjs';
import { asset } from './assets.ts';
import { PdfEngineError, loading } from './errors.ts';

type PdfJsModule = typeof PdfJsNamespace;
type LoadedDocument = Awaited<ReturnType<PdfJsModule['getDocument']>['promise']>;

let library: Promise<PdfJsModule> | null = null;

/** PDF.js's API module; in a worker, the parser module must be loaded first by `core` (the fake worker uses it). */
export function pdfjsLibrary(core?: () => Promise<unknown>): Promise<PdfJsModule> {
  library ??= (async () => {
    if (core) {
      const parser = await loading(core());
      (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = parser;
    }
    return loading(import('pdfjs-dist/legacy/build/pdf.mjs'));
  })();
  library.catch(() => (library = null));
  return library;
}

/** The standard fonts the site serves: the Foxit ones (BSD-3-Clause). The Liberation ones are GPL and stay out. */
const SERVED_FONTS = /^Foxit[A-Za-z]+\.pfb$/;

/** Reads PDF.js data files from the site's folder; refuses what the site does not serve, so PDF.js falls back. */
class SiteDataFactory {
  readonly #base: Record<string, string>;
  constructor(options: { cMapUrl?: string | null; standardFontDataUrl?: string | null; wasmUrl?: string | null }) {
    this.#base = { cMapUrl: options.cMapUrl ?? '', standardFontDataUrl: options.standardFontDataUrl ?? '', wasmUrl: options.wasmUrl ?? '' };
  }
  async fetch({ kind, filename }: { kind: string; filename: string }): Promise<Uint8Array> {
    if (kind === 'standardFontDataUrl' && !SERVED_FONTS.test(filename)) throw new Error(`${filename} is not served`);
    const base = this.#base[kind];
    if (!base || !/^[\w.-]+$/.test(filename)) throw new Error(`no ${kind} for ${filename}`);
    const response = await fetch(`${base}${filename}`);
    if (!response.ok) throw new Error(`${filename}: ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }
}

/** Canvases for PDF.js inside a worker: OffscreenCanvas instead of document.createElement. */
class OffscreenFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
    const canvas = new OffscreenCanvas(width, height);
    return { canvas, context: canvas.getContext('2d', { willReadFrequently: true }) };
  }
  reset(target: { canvas: OffscreenCanvas | null }, width: number, height: number) {
    if (!target.canvas) throw new Error('Canvas is not specified');
    target.canvas.width = width;
    target.canvas.height = height;
  }
  destroy(target: { canvas: OffscreenCanvas | null; context: unknown }) {
    if (target.canvas) {
      target.canvas.width = 0;
      target.canvas.height = 0;
    }
    target.canvas = null;
    target.context = null;
  }
  /**
   * The opaque context of the page canvas. PDF.js 6.5 asks the factory for it (BaseCanvasFactory#getNoAlphaContext);
   * 6.4 took the same context from the canvas itself, so the drawing is the same in both.
   */
  getNoAlphaContext(canvas: OffscreenCanvas) {
    return canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  }
}

/** No SVG filters in a worker (they need a document): PDF.js draws without them. */
class NoFilterFactory {
  addFilter() {
    return 'none';
  }
  addHCMFilter() {
    return 'none';
  }
  addAlphaFilter() {
    return 'none';
  }
  addLuminosityFilter() {
    return 'none';
  }
  addKnockoutFilter() {
    return 'none';
  }
  addHighlightHCMFilter() {
    return 'none';
  }
  addSelectionHCMFilter() {
    return 'none';
  }
  addSelectionFilter() {
    return 'none';
  }
  createSelectionStyle() {
    return null;
  }
  destroy() {}
}

export interface PdfJsOpen {
  /** The parser worker of the page path; leave out inside the engine worker. */
  port?: Worker;
  password?: string;
}

export interface PdfJsHandle {
  pages: number;
  doc: LoadedDocument;
  destroy(): Promise<void>;
}

const inWorker = (): boolean => typeof document === 'undefined';

/**
 * Opens a file for drawing. A password the file needs and does not get is 'needs-password' (or 'wrong-password'
 * when one was given); anything else PDF.js cannot read is 'corrupted'.
 */
export async function openForDrawing(bytes: Uint8Array, options: PdfJsOpen = {}): Promise<PdfJsHandle> {
  const pdfjs = await pdfjsLibrary();
  const data = asset('pdfjsData');
  const worker = options.port ? new pdfjs.PDFWorker({ port: options.port as never }) : undefined;
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    ...(options.password ? { password: options.password } : {}),
    ...(worker ? { worker } : {}),
    cMapUrl: `${data}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${data}standard_fonts/`,
    wasmUrl: `${data}wasm/`,
    useWasm: true,
    useWorkerFetch: false,
    useSystemFonts: false,
    disableFontFace: inWorker(),
    enableXfa: false,
    stopAtErrors: false,
    verbosity: 0,
    BinaryDataFactory: SiteDataFactory,
    ...(inWorker() ? { CanvasFactory: OffscreenFactory, FilterFactory: NoFilterFactory, isOffscreenCanvasSupported: true } : {}),
  } as Parameters<PdfJsModule['getDocument']>[0]);
  try {
    const doc = await task.promise;
    return { pages: doc.numPages, doc, destroy: () => task.destroy() };
  } catch (error) {
    await task.destroy().catch(() => {});
    worker?.destroy();
    const named = error as { name?: string; code?: number };
    if (named?.name === 'PasswordException') throw new PdfEngineError(named.code === 2 ? 'wrong-password' : 'needs-password');
    throw new PdfEngineError('corrupted');
  }
}

/** The largest canvas the engine draws (the canvas limit of Safari on the iPhone, DECISOES § 65). */
export const CANVAS_MAX_PIXELS = 16_777_216;

export interface DrawnPage {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  width: number;
  height: number;
  /** The scale was lowered to stay under CANVAS_MAX_PIXELS. */
  downscaled: boolean;
  /** Width and height of the page as shown, in points. */
  points: { width: number; height: number };
}

/** Draws page `index` (0-based) at `scale` (1 = 72 ppi), on a white background, as the page is shown (its /Rotate applied). */
export async function drawPage(handle: PdfJsHandle, index: number, scale: number): Promise<DrawnPage> {
  const pdfjs = await pdfjsLibrary();
  const page = await handle.doc.getPage(index + 1);
  const unit = page.getViewport({ scale: 1 });
  let k = scale;
  let downscaled = false;
  if (unit.width * k * unit.height * k > CANVAS_MAX_PIXELS) {
    k = Math.sqrt(CANVAS_MAX_PIXELS / (unit.width * unit.height)) * 0.999;
    downscaled = true;
  }
  const viewport = page.getViewport({ scale: k });
  const width = Math.max(1, Math.floor(viewport.width));
  const height = Math.max(1, Math.floor(viewport.height));
  const canvas: OffscreenCanvas | HTMLCanvasElement = inWorker() ? new OffscreenCanvas(width, height) : Object.assign(document.createElement('canvas'), { width, height });
  await page.render({ canvas: canvas as HTMLCanvasElement, viewport, annotationMode: pdfjs.AnnotationMode.DISABLE, background: 'rgb(255,255,255)' }).promise;
  page.cleanup();
  return { canvas, width, height, downscaled, points: { width: unit.width, height: unit.height } };
}

/** The drawn page as a JPEG or a PNG file, written by the browser's encoder (no metadata). */
export async function encodeCanvas(canvas: OffscreenCanvas | HTMLCanvasElement, type: 'image/jpeg' | 'image/png', quality: number): Promise<Uint8Array> {
  const blob =
    'convertToBlob' in canvas
      ? await canvas.convertToBlob({ type, quality })
      : await new Promise<Blob>((resolve, reject) => (canvas as HTMLCanvasElement).toBlob((value) => (value ? resolve(value) : reject(new Error('toBlob failed'))), type, quality));
  return new Uint8Array(await blob.arrayBuffer());
}

/** Lets go of a canvas's memory right away (Safari keeps it until the next collection otherwise). */
export function freeCanvas(canvas: OffscreenCanvas | HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}
