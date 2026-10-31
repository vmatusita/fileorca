// PDF worker: pdf-lib (about 240 KB gzipped) loads here and only here, the first time a PDF is
// built, so no other page and no other tool pays for it. The page talks to it through Comlink.
import { expose } from 'comlink';
import { buildPdf } from './build.ts';
import type { PdfPage, PdfPageSize } from './build.ts';

const api = {
  /** The PDF of the pages, in order, as bytes. Changing only the page size builds it again. */
  build: (pages: PdfPage[], size: PdfPageSize): Promise<Uint8Array> => buildPdf(pages, size),
};

export type PdfEngineApi = typeof api;

expose(api);
