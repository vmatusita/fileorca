// The page's door to the PDF engine, loaded on the first file (or when the pointer enters the drop zone), so Comlink
// and the worker stay out of the initial JS of the PDF pages (decision 5). It talks to the same worker as Image to PDF
// and the calculators (src/engine/pdf/worker.ts). When that worker has no OffscreenCanvas (DECISOES § 22), the pages are
// drawn here, on the page, by PDF.js with its parser in a worker of its own (src/engine/pdf/pdfjs-core.ts); the PDF
// files are still written by the worker. Calls never reject for a bad file: that comes back as { ok: false, reason }.
// A worker that cannot start rejects with EngineUnavailable, which the panel shows as 'load' (DECISOES § 102).
import { transfer, wrap, type Remote } from 'comlink';
import { version as pdfjsVersion } from 'pdfjs-dist/package.json';
import type { PdfEngineApi } from '../../engine/pdf/worker.ts';
import type { OpenRenderer, RenderedPage } from '../../engine/pdf/process.ts';
import type { PdfInspectResult, PdfOperation, PdfResult } from '../../engine/pdf/types.ts';

interface Engine {
  api: Remote<PdfEngineApi>;
  broken: Promise<never>;
  canvas: Promise<boolean>;
}

let engine: Engine | null = null;

function start(): Engine {
  if (engine) return engine;
  const worker = new Worker(new URL('../../engine/pdf/worker.ts', import.meta.url), { type: 'module', name: 'fileorca-pdf' });
  const broken = new Promise<never>((_, reject) => {
    worker.addEventListener('error', () => {
      engine = null;
      worker.terminate();
      reject(Object.assign(new Error('the PDF worker failed'), { name: 'EngineUnavailable' }));
    });
  });
  broken.catch(() => {});
  const api = wrap<PdfEngineApi>(worker);
  engine = { api, broken, canvas: Promise.race([api.canvasInWorker(), broken]).catch(() => false) };
  return engine;
}

const call = <T>(work: (api: Remote<PdfEngineApi>) => Promise<T>): Promise<T> => {
  const { api, broken } = start();
  return Promise.race([work(api), broken]);
};

/** Pages, boxes, lock, form and bookmarks of one file. */
export function inspect(file: File): Promise<PdfInspectResult> {
  return call(async (api) => (await api.inspect(file)) as PdfInspectResult);
}

let pageRenderer: Promise<OpenRenderer> | null = null;

/** PDF.js on the page, for a worker without OffscreenCanvas. */
function onPage(): Promise<OpenRenderer> {
  pageRenderer ??= (async () => {
    const [{ pdfjsRenderer }, { configurePdfAssets }] = await Promise.all([import('../../engine/pdf/render.ts'), import('../../engine/pdf/assets.ts')]);
    configurePdfAssets({ pdfjsData: `/_astro/pdfjs/${pdfjsVersion}/` });
    return pdfjsRenderer(() => new Worker(new URL('../../engine/pdf/pdfjs-core.ts', import.meta.url), { type: 'module', name: 'fileorca-pdfjs' }));
  })();
  pageRenderer.catch(() => (pageRenderer = null));
  return pageRenderer;
}

const bytesOf = async (file: Blob): Promise<Uint8Array> => new Uint8Array(await file.arrayBuffer());

/** PDF to JPG drawn on the page: the same pages, scale and encoder settings as the worker uses. */
async function imagesOnPage(op: Extract<PdfOperation, { kind: 'images' }>, file: File): Promise<PdfResult> {
  const open = await onPage();
  const renderer = await open(await bytesOf(file));
  try {
    const wanted = (op.pages ?? Array.from({ length: renderer.pages }, (_, i) => i)).filter((index) => index >= 0 && index < renderer.pages);
    if (wanted.length === 0) return { ok: false, reason: 'encode' };
    const outputs = [];
    let downscaled = false;
    for (const index of wanted) {
      const page = await renderer.render(index, op.ppi / 72, op.format === 'png' ? 'image/png' : 'image/jpeg', 0.92);
      downscaled ||= page.downscaled;
      outputs.push({ bytes: page.bytes, kind: op.format, index: index + 1, width: page.width, height: page.height });
    }
    return { ok: true, outputs, outcome: 'new', notes: downscaled ? ['downscaled'] : [] };
  } catch (error) {
    const reason = (error as { reason?: string }).reason;
    return { ok: false, reason: reason === 'needs-password' || reason === 'wrong-password' ? reason : 'corrupted' };
  } finally {
    await renderer.close();
  }
}

/** The Strong mode with the pages drawn on the page; the worker writes the PDF. */
async function strongOnPage(file: File): Promise<PdfResult> {
  const open = await onPage();
  const renderer = await open(await bytesOf(file));
  const pages: RenderedPage[] = [];
  try {
    for (let index = 0; index < renderer.pages; index += 1) pages.push(await renderer.render(index, 100 / 72, 'image/jpeg', 0.6));
  } catch {
    return { ok: false, reason: 'corrupted' };
  } finally {
    await renderer.close();
  }
  return call(async (api) => (await api.strongFromPages(file, transfer(pages, pages.map((page) => page.bytes.buffer as ArrayBuffer)) as unknown as RenderedPage[])) as PdfResult);
}

/** One request over the files, in the worker or, for the drawing parts without OffscreenCanvas there, on the page. */
export async function processFiles(op: PdfOperation, files: File[]): Promise<PdfResult> {
  const draws = op.kind === 'images' || (op.kind === 'compress' && op.mode === 'strong');
  const first = files[0];
  if (draws && first && !(await start().canvas)) return op.kind === 'images' ? imagesOnPage(op, first) : strongOnPage(first);
  return call(async (api) => (await api.process(op, files)) as PdfResult);
}

/**
 * F14 (E-4, DECISOES § 630): one epoch per id, moved on by each `release()`. A thumbnail asked before a release and still
 * waiting when it comes would open the file again (a document, and on the page path a PDF.js worker) that nobody lets go:
 * it gives null instead.
 */
const epochs = new Map<string, number>();

/** A JPEG thumbnail of page `index`, `width` pixels wide (the page is `shownWidth` points wide on screen); null when it cannot be drawn. */
export async function thumbnail(id: string, file: File, index: number, width: number, shownWidth: number): Promise<Blob | null> {
  const epoch = epochs.get(id) ?? 0;
  const inWorker = await start().canvas;
  if ((epochs.get(id) ?? 0) !== epoch) return null;
  if (inWorker) return call((api) => api.thumbnail(id, file, index, width));
  const handles = pageHandles.get(id) ?? (async () => (await onPage())(await bytesOf(file)))();
  pageHandles.set(id, handles);
  try {
    const renderer = await handles;
    const page = await renderer.render(index, width / Math.max(1, shownWidth), 'image/jpeg', 0.8);
    return new Blob([page.bytes as BlobPart], { type: 'image/jpeg' });
  } catch {
    return null;
  }
}

const pageHandles = new Map<string, Promise<Awaited<ReturnType<OpenRenderer>>>>();

/**
 * The grid is done with a file: its document closes, and on the page path its PDF.js worker ends with it (F14, E-4;
 * DECISOES § 630).
 */
export async function release(id: string): Promise<void> {
  epochs.set(id, (epochs.get(id) ?? 0) + 1);
  const handle = pageHandles.get(id);
  pageHandles.delete(id);
  await handle?.then((renderer) => renderer.close()).catch(() => {});
  if (engine) await call((api) => api.release(id)).catch(() => {});
}

/** A stored ZIP of the outputs, built by the worker. */
export function zip(entries: { name: string; blob: Blob }[]): Promise<Blob> {
  return call((api) => api.zip(entries));
}

/** Fetches and compiles what a tool will need ahead of the first file. Never throws. */
export function warm(kinds: ('qpdf' | 'pdfjs' | 'codecs')[]): void {
  void call((api) => api.warm(kinds)).catch(() => {});
}
