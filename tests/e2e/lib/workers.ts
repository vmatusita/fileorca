import type { Page } from '@playwright/test';

// F15 (frente L; DECISOES § 667): the spy of the F14 on the Worker constructor (island-pdf-workers.spec.ts), with the
// messages each worker gets. The image island talks to its two workers through Comlink, and every call is a postMessage:
// "fileorca-image" encodes the photos (and makes the first ZIP of a batch), "fileorca-pdf" makes the PDF of Image to PDF.
// `class Spy extends Worker` in an init script works in both browsers (the code of Vite calls the global Worker at `new`).

export interface MadeWorker {
  name: string;
  url: string;
  ended: boolean;
  messages: number;
}

/** Writes down every Worker the page makes, the messages it is sent and whether it was ended. Call before `goto`. */
export async function spyOnWorkers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const Native = window.Worker;
    const made: { name: string; url: string; ended: boolean; messages: number }[] = [];
    (window as unknown as { __workers: typeof made }).__workers = made;
    class Spy extends Native {
      entry: { name: string; url: string; ended: boolean; messages: number };
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        this.entry = { name: options?.name ?? '', url: String(url), ended: false, messages: 0 };
        made.push(this.entry);
      }
      override postMessage(message: unknown, options?: Transferable[] | StructuredSerializeOptions): void {
        this.entry.messages += 1;
        super.postMessage(message, options as StructuredSerializeOptions);
      }
      override terminate(): void {
        this.entry.ended = true;
        super.terminate();
      }
    }
    window.Worker = Spy;
  });
}

/** Every worker made so far, in order. */
export const workersMade = (page: Page): Promise<MadeWorker[]> =>
  page.evaluate(() => ((window as unknown as { __workers?: { name: string; url: string; ended: boolean; messages: number }[] }).__workers ?? []).map((made) => ({ ...made })));

/** The messages sent so far to the workers of this name (all of them: a worker may be made again). */
export async function messagesTo(page: Page, name: string): Promise<number> {
  return (await workersMade(page)).filter((made) => made.name === name).reduce((sum, made) => sum + made.messages, 0);
}

/** The messages to each worker of the image island now, to compare with the count after a gesture. */
export async function imageIslandMessages(page: Page): Promise<{ image: number; pdf: number }> {
  return { image: await messagesTo(page, 'fileorca-image'), pdf: await messagesTo(page, 'fileorca-pdf') };
}

/**
 * Holds the script of one worker of the image island until `release`: the image worker (the photos wait to be encoded, in
 * the worker or on the page path, which waits to know the worker has no canvas) or the PDF worker (the photos are ready and
 * the PDF waits to be made). Tells them apart by the script, as island-pdf-workers.spec.ts does: only the PDF one holds
 * pdf-lib ("PDFDocument").
 */
export async function holdWorker(page: Page, which: 'image' | 'pdf'): Promise<{ release: () => void }> {
  let release = () => {};
  const gate = new Promise<void>((open) => {
    release = open;
  });
  page.once('close', release);
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes('PDFDocument') === (which === 'pdf')) await gate;
    await route.fulfill({ response, body }).catch(() => {});
  });
  return { release };
}
