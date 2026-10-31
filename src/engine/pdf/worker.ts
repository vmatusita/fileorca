// PDF worker: pdf-lib (about 240 KB gzipped) loads here and only here, the first time a PDF is
// built, so no other page and no other tool pays for it. The page talks to it through Comlink.
import { expose, transfer } from 'comlink';
import { buildPdf } from './build.ts';
import type { PdfPage, PdfPageSize } from './build.ts';

const api = {
  /**
   * The PDF of the pages, in order, as bytes. Changing only the page size builds it again. The bytes
   * move to the page instead of being copied: a PDF of a big batch can be tens of megabytes.
   */
  build: async (pages: PdfPage[], size: PdfPageSize): Promise<Uint8Array> => {
    const bytes = await buildPdf(pages, size);
    return transfer(bytes, [bytes.buffer as ArrayBuffer]);
  },
};

export type PdfEngineApi = typeof api;

expose(api);
