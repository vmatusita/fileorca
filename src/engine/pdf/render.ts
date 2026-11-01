// PDF.js as the Renderer of process.ts: one opened document, its pages drawn one at a time and written by the browser's
// encoder, the canvas emptied right after. A short pause between pages gives the thread back (on the page path that
// thread is the main one). Used by the engine worker (OffscreenCanvas) and by the page path (a <canvas>).
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { drawPage, encodeCanvas, freeCanvas, openForDrawing, type PdfJsHandle } from './pdfjs.ts';
import type { OpenRenderer, Renderer } from './process.ts';

const pause = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export function rendererOf(handle: PdfJsHandle): Renderer {
  return {
    pages: handle.pages,
    async render(index, scale, type, quality) {
      await pause();
      const drawn = await drawPage(handle, index, scale);
      try {
        const bytes = await encodeCanvas(drawn.canvas, type, quality);
        return { bytes, width: drawn.width, height: drawn.height, points: drawn.points, downscaled: drawn.downscaled };
      } finally {
        freeCanvas(drawn.canvas);
      }
    },
    close: () => handle.destroy(),
  };
}

/** Opens files with PDF.js; `port` makes the parser worker of the page path for each file. */
export function pdfjsRenderer(port?: () => Worker): OpenRenderer {
  return async (bytes) => rendererOf(await openForDrawing(bytes, port ? { port: port() } : {}));
}
