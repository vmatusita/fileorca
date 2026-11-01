// PDF.js (the legacy build) in Node as an independent reader of the outputs of the PDF tools: pages, their visible
// box and /Rotate, the "Page N" markers, where each piece of text sits on the page as shown (the viewport applies the
// CropBox and /Rotate), links, widgets, bookmarks and the operator list of every page. It also draws a page through
// PDF.js's own Node canvas (@napi-rs/canvas, an optional dependency of pdfjs-dist) for the PSNR of Compress. The FileOrca
// engine is never asked: this is the other side of the check.
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const PDFJS = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
const DATA = `${dirname(require.resolve('pdfjs-dist/package.json')).replace(/\\/g, '/')}/`;

interface TextItem {
  str?: string;
  transform?: number[];
}
interface Viewport {
  width: number;
  height: number;
  transform: number[];
  convertToViewportPoint(x: number, y: number): [number, number];
}
interface Page {
  view: number[];
  rotate: number;
  getViewport(options: { scale: number }): Viewport;
  getTextContent(): Promise<{ items: TextItem[] }>;
  getAnnotations(): Promise<{ subtype: string; fieldType?: string; url?: string; dest?: unknown; action?: string }[]>;
  getOperatorList(): Promise<{ fnArray: number[] }>;
  render(options: Record<string, unknown>): { promise: Promise<void> };
  cleanup(): void;
}
interface Doc {
  numPages: number;
  getPage(n: number): Promise<Page>;
  getOutline(): Promise<{ title: string; items: unknown[] }[] | null>;
  getMetadata(): Promise<{ info: Record<string, unknown>; metadata: unknown }>;
  canvasFactory: { create(width: number, height: number): { canvas: { toBuffer(type: string): Buffer }; context: { getImageData(x: number, y: number, w: number, h: number): { data: Uint8ClampedArray } } } };
}
interface PdfJs {
  getDocument(options: Record<string, unknown>): { promise: Promise<Doc>; destroy(): Promise<void> };
  OPS: Record<string, number>;
}

let pdfjs: Promise<PdfJs> | null = null;
const library = (): Promise<PdfJs> => (pdfjs ??= import(pathToFileURL(PDFJS).href) as Promise<PdfJs>);

export interface ShownText {
  str: string;
  /** Where the text starts on the page as shown, from the top left corner, in points. */
  x: number;
  y: number;
  /** Direction of the baseline on screen, in degrees (0 = left to right). */
  angle: number;
}

export interface ReadPage {
  /** Width and height of the page as shown (rotation applied). */
  shown: { width: number; height: number };
  rotate: number;
  marker: string | null;
  texts: ShownText[];
  links: number;
  widgets: number;
  /** Count of image-drawing operators (paintImageXObject and kin). */
  images: number;
  operators: number;
}

export interface ReadPdf {
  pages: ReadPage[];
  outline: string[];
  info: Record<string, unknown>;
  hasXmp: boolean;
  acroForm: boolean;
  xfa: boolean;
}

/** Opens `bytes` with PDF.js (a password when given) and reads every page; throws when PDF.js cannot open it. */
export async function readWithPdfjs(bytes: Uint8Array, password?: string): Promise<ReadPdf> {
  const lib = await library();
  const task = lib.getDocument({ data: new Uint8Array(bytes), verbosity: 0, standardFontDataUrl: `${DATA}standard_fonts/`, cMapUrl: `${DATA}cmaps/`, wasmUrl: `${DATA}wasm/`, ...(password ? { password } : {}) });
  try {
    const doc = await task.promise;
    const imageOps = new Set(['paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject', 'paintImageXObjectRepeat', 'paintSolidColorImageMask'].map((name) => lib.OPS[name]));
    const pages: ReadPage[] = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const texts: ShownText[] = [];
      for (const item of content.items) {
        if (!item.str || !item.transform) continue;
        const [a = 0, b = 0, , , e = 0, f = 0] = item.transform;
        const [x, y] = viewport.convertToViewportPoint(e, f);
        const [dx, dy] = viewport.convertToViewportPoint(e + a, f + b);
        texts.push({ str: item.str, x, y, angle: Math.round(((Math.atan2(-(dy - y), dx - x) * 180) / Math.PI + 360) % 360) });
      }
      const annotations = await page.getAnnotations();
      const ops = await page.getOperatorList();
      pages.push({
        shown: { width: viewport.width, height: viewport.height },
        rotate: page.rotate,
        marker: texts.find((text) => /^Page \d+$/.test(text.str))?.str ?? null,
        texts,
        links: annotations.filter((annotation) => annotation.subtype === 'Link').length,
        widgets: annotations.filter((annotation) => annotation.subtype === 'Widget').length,
        images: ops.fnArray.filter((op) => imageOps.has(op)).length,
        operators: ops.fnArray.length,
      });
      page.cleanup();
    }
    const outline = ((await doc.getOutline()) ?? []).map((item) => item.title);
    const meta = await doc.getMetadata();
    return { pages, outline, info: meta.info, hasXmp: meta.metadata !== null, acroForm: meta.info['IsAcroFormPresent'] === true, xfa: meta.info['IsXFAPresent'] === true };
  } finally {
    await task.destroy();
  }
}

/** Whether PDF.js opens the file: false with no password when it asks for one. */
export async function opensWithoutPassword(bytes: Uint8Array): Promise<boolean> {
  try {
    await readWithPdfjs(bytes);
    return true;
  } catch {
    return false;
  }
}

/** Draws page `n` (1-based) at `scale` with PDF.js in Node and returns its RGBA pixels. */
export async function drawWithPdfjs(bytes: Uint8Array, n: number, scale: number): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const lib = await library();
  const task = lib.getDocument({ data: new Uint8Array(bytes), verbosity: 0, standardFontDataUrl: `${DATA}standard_fonts/`, cMapUrl: `${DATA}cmaps/`, wasmUrl: `${DATA}wasm/` });
  try {
    const doc = await task.promise;
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale });
    const width = Math.floor(viewport.width);
    const height = Math.floor(viewport.height);
    const { canvas, context } = doc.canvasFactory.create(width, height);
    await page.render({ canvas, canvasContext: context, viewport, background: 'rgb(255,255,255)' }).promise;
    return { data: new Uint8ClampedArray(context.getImageData(0, 0, width, height).data), width, height };
  } finally {
    await task.destroy();
  }
}

/** Peak signal-to-noise ratio of two RGB pictures of the same size, in dB (alpha ignored). */
export function psnr(a: { data: Uint8ClampedArray }, b: { data: Uint8ClampedArray }): number {
  if (a.data.length !== b.data.length) throw new Error('pictures of different sizes');
  let sum = 0;
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    for (let c = 0; c < 3; c += 1) {
      const diff = (a.data[i + c] as number) - (b.data[i + c] as number);
      sum += diff * diff;
      count += 1;
    }
  }
  const mse = sum / count;
  return mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
}
