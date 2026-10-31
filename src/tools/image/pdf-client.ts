// The page's door to the PDF engine (src/engine/pdf/): pdf-lib lives in its own worker and loads the
// first time a PDF is built, so no other tool and no other page pays for it. Changing only the page
// size builds the PDF again from the same pages. A worker that cannot start rejects with an
// EngineUnavailable error instead of leaving the build pending, and the next build starts a new one
// (DECISOES § 102, review a-02).
import { transfer, wrap, type Remote } from 'comlink';
import type { PdfEngineApi } from '../../engine/pdf/worker.ts';
import type { PdfPage, PdfPageSize } from '../../engine/pdf/build.ts';

interface PdfEngine {
  api: Remote<PdfEngineApi>;
  /** Rejects when the worker script fails to load or throws at the top level. */
  broken: Promise<never>;
}

let engine: PdfEngine | null = null;

function pdfEngine(): PdfEngine {
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
  engine = { api: wrap<PdfEngineApi>(worker), broken };
  return engine;
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
  const { api, broken } = pdfEngine();
  const bytes = await Promise.race([api.build(transfer(prepared, prepared.map((page) => page.bytes.buffer)) as unknown as PdfPage[], size), broken]);
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
