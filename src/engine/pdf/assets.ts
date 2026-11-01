// Where the engine finds the files it loads on first use: the qpdf .wasm, the folder of PDF.js data (its decoders,
// CMaps and standard fonts, copied unchanged from pdfjs-dist), and the jSquash codecs of the Recommended mode. The site's
// worker sets them from the URLs the bundler gives (src/engine/pdf/worker.ts); the Node tests set them to the files in
// node_modules. Nothing has a default: a call that needs a file nobody configured fails as 'load'.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PdfEngineError } from './errors.ts';

export interface PdfAssets {
  /** The qpdf .wasm: a URL in the browser, a file path in Node (the glue reads it with fs). */
  qpdfWasm: string;
  /** A folder with cmaps/, standard_fonts/ and wasm/ of pdfjs-dist, ending in "/" (a URL, or a path in Node). */
  pdfjsData: string;
  /** MozJPEG decoder and encoder and the Lanczos resizer of jSquash: a URL or the bytes. */
  jpegDecoder: string | Uint8Array;
  jpegEncoder: string | Uint8Array;
  resizer: string | Uint8Array;
}

let assets: Partial<PdfAssets> = {};

export function configurePdfAssets(next: Partial<PdfAssets>): void {
  assets = { ...assets, ...next };
}

export function asset<K extends keyof PdfAssets>(key: K): PdfAssets[K] {
  const value = assets[key];
  if (value === undefined) throw new PdfEngineError('load', `no ${key} configured`);
  return value as PdfAssets[K];
}
