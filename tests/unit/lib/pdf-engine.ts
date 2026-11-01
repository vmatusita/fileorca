// The PDF engine in Node for the unit tests: its assets point at the files in node_modules (the worker of the site
// points at the URLs the bundler gives), the fixtures and their oracle are read from fixtures/pdf/, and pages are drawn
// by PDF.js with its own Node canvas (for PDF to JPG and the Strong mode).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { configurePdfAssets } from '../../../src/engine/pdf/assets.ts';
import type { OpenRenderer, RenderedPage } from '../../../src/engine/pdf/process.ts';
import type { PdfOracleEntry } from '../../../scripts/fixtures/pdf.ts';

const require = createRequire(import.meta.url);
const file = (specifier: string): string => require.resolve(specifier);
const PDFJS_DATA = `${dirname(file('pdfjs-dist/package.json')).split('\\').join('/')}/`;

export function useNodeAssets(): void {
  configurePdfAssets({
    qpdfWasm: file('@neslinesli93/qpdf-wasm/dist/qpdf.wasm'),
    pdfjsData: PDFJS_DATA,
    jpegDecoder: new Uint8Array(readFileSync(file('@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm'))),
    jpegEncoder: new Uint8Array(readFileSync(file('@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm'))),
    resizer: new Uint8Array(readFileSync(file('@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm'))),
  });
}

const DIR = 'fixtures/pdf/';
export const ORACLE = JSON.parse(readFileSync(join(DIR, 'expected.json'), 'utf8')) as { files: Record<string, PdfOracleEntry>; passwords: Record<string, string> };

export const fixture = (name: string): Uint8Array => new Uint8Array(readFileSync(join(DIR, name)));

export function oracle(name: string): PdfOracleEntry {
  const entry = ORACLE.files[name];
  if (!entry) throw new Error(`${name} is not in expected.json`);
  return entry;
}

/** Fixtures every tool takes as they are (no lock, readable). */
export const READABLE = Object.keys(ORACLE.files).filter((name) => ORACLE.files[name]?.expect === 'ok');

interface NodeCanvas {
  toBuffer(type: string, quality?: number): Buffer;
}
interface NodePage {
  getViewport(options: { scale: number }): { width: number; height: number };
  render(options: Record<string, unknown>): { promise: Promise<void> };
}
interface NodeDoc {
  numPages: number;
  getPage(n: number): Promise<NodePage>;
  canvasFactory: { create(width: number, height: number): { canvas: NodeCanvas; context: unknown } };
}
interface NodePdfJs {
  getDocument(options: Record<string, unknown>): { promise: Promise<NodeDoc>; destroy(): Promise<void> };
}

/** A Renderer for process.ts in Node: PDF.js draws, @napi-rs/canvas (through PDF.js) encodes. */
export function nodeRenderer(): OpenRenderer {
  return async (bytes) => {
    const pdfjs = (await import(pathToFileURL(file('pdfjs-dist/legacy/build/pdf.mjs')).href)) as NodePdfJs;
    const task = pdfjs.getDocument({ data: bytes.slice(), verbosity: 0, standardFontDataUrl: `${PDFJS_DATA}standard_fonts/`, cMapUrl: `${PDFJS_DATA}cmaps/`, wasmUrl: `${PDFJS_DATA}wasm/` });
    const doc = await task.promise;
    return {
      pages: doc.numPages,
      async render(index, scale, type, quality): Promise<RenderedPage> {
        const page = await doc.getPage(index + 1);
        const unit = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale });
        const width = Math.floor(viewport.width);
        const height = Math.floor(viewport.height);
        const { canvas, context } = doc.canvasFactory.create(width, height);
        await page.render({ canvas, canvasContext: context, viewport, background: 'rgb(255,255,255)' }).promise;
        const out = type === 'image/png' ? canvas.toBuffer('image/png') : canvas.toBuffer('image/jpeg', Math.round(quality * 100));
        return { bytes: new Uint8Array(out), width, height, points: { width: unit.width, height: unit.height }, downscaled: false };
      },
      close: () => task.destroy(),
    };
  };
}
