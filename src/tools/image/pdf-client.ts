// The page's door to the PDF engine (src/engine/pdf/): pdf-lib lives in its own worker and loads the
// first time a PDF is built, so no other tool and no other page pays for it. Changing only the page
// size builds the PDF again from the same pages.
import { transfer, wrap, type Remote } from 'comlink';
import type { PdfEngineApi } from '../../engine/pdf/worker.ts';
import type { PdfPage, PdfPageSize } from '../../engine/pdf/build.ts';

let remote: Remote<PdfEngineApi> | null = null;

function pdfEngine(): Remote<PdfEngineApi> {
  remote ??= wrap<PdfEngineApi>(new Worker(new URL('../../engine/pdf/worker.ts', import.meta.url), { type: 'module', name: 'fileorca-pdf' }));
  return remote;
}

/** One page: an output of the engine's pdf-page operation (a JPEG or a PNG written from the pixels). */
export interface PageImage {
  blob: Blob;
  format: 'jpeg' | 'png';
  width: number;
  height: number;
}

/** The PDF of the pages, in order. The page bytes are copied, so the blobs stay usable for another size. */
export async function buildPdf(pages: readonly PageImage[], size: PdfPageSize): Promise<Blob> {
  const prepared: PdfPage[] = await Promise.all(
    pages.map(async (page) => ({ bytes: new Uint8Array(await page.blob.arrayBuffer()), format: page.format, width: page.width, height: page.height })),
  );
  const bytes = await pdfEngine().build(transfer(prepared, prepared.map((page) => page.bytes.buffer)) as unknown as PdfPage[], size);
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
