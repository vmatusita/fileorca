import { expect, type Page } from '@playwright/test';

/** Waits until the tool island is hydrated (Astro removes the ssr attribute). */
export async function hydrated(page: Page): Promise<void> {
  await page.waitForSelector('#fo-tool-root[data-hydrated="true"]', { state: 'attached' });
}

/** Accepts or declines the cookie notice so it does not cover the page in a test. */
export async function dismissCookies(page: Page, choice: 'granted' | 'denied' = 'denied'): Promise<void> {
  const button = page.locator(`#fo-cookie [data-consent="${choice}"]`);
  if (await button.isVisible()) await button.click();
}

/** dataLayer entries as plain arrays (gtag pushes `arguments` objects). */
export async function dataLayer(page: Page): Promise<unknown[][]> {
  return page.evaluate(() =>
    (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>, (value) => (value instanceof Date ? 'DATE' : value))),
  );
}

export async function downloadBytes(page: Page): Promise<Uint8Array> {
  const base64 = await page.evaluate(async () => {
    const link = document.querySelector<HTMLAnchorElement>('.fo-btn--download');
    if (!link) throw new Error('no download link');
    const bytes = new Uint8Array(await (await fetch(link.href)).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  });
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

// ---- F1b: states of the tool panel -------------------------------------------------------------
// The helpers below drive the compress-image panel (idle, over, processing, result, error) and the
// search dialog. They assume the page is on a tool page and hydrated.

const FILE_INPUT = 'input[type="file"]';
const photos = new WeakMap<Page, Promise<Buffer>>();

/** A small noisy JPEG drawn in the page (so it needs no fixture); built once per page. */
export function generatedJpeg(page: Page): Promise<Buffer> {
  let made = photos.get(page);
  if (!made) {
    made = page
      .evaluate(async () => {
        const width = 640;
        const height = 480;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const pixels = context.createImageData(width, height);
        let seed = 4242;
        for (let i = 0; i < pixels.data.length; i += 4) {
          const x = (i / 4) % width;
          const y = Math.floor(i / 4 / width);
          seed = (seed * 1103515245 + 12345) % 2147483648;
          const noise = (seed % 24) - 12;
          pixels.data[i] = Math.max(0, Math.min(255, (x * 255) / width + noise));
          pixels.data[i + 1] = Math.max(0, Math.min(255, (y * 255) / height + noise));
          pixels.data[i + 2] = Math.max(0, Math.min(255, 128 + noise));
          pixels.data[i + 3] = 255;
        }
        context.putImageData(pixels, 0, 0);
        const blob = await new Promise<Blob>((done) => canvas.toBlob((b) => done(b as Blob), 'image/jpeg', 0.95));
        return new Promise<string>((done) => {
          const reader = new FileReader();
          reader.onload = () => done(String(reader.result).split(',')[1] ?? '');
          reader.readAsDataURL(blob);
        });
      })
      .then((base64) => Buffer.from(base64, 'base64'));
    photos.set(page, made);
  }
  return made;
}

/** Hands a generated JPEG to the file input and returns at once (the panel goes to processing). */
export async function chooseImage(page: Page, name = 'photo.jpg'): Promise<void> {
  await page.setInputFiles(FILE_INPUT, { name, mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
}

export interface TestFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** Hands several files to the file input at once: one batch. */
export async function chooseImages(page: Page, files: TestFile[]): Promise<void> {
  await page.setInputFiles(FILE_INPUT, files);
}

/** `count` copies of the generated JPEG with the names given (a number makes "photo-1.jpg", "photo-2.jpg"...). */
export async function jpegBatch(page: Page, names: number | string[]): Promise<TestFile[]> {
  const buffer = await generatedJpeg(page);
  const list = typeof names === 'number' ? Array.from({ length: names }, (_, index) => `photo-${index + 1}.jpg`) : names;
  return list.map((name) => ({ name, mimeType: 'image/jpeg', buffer }));
}

/** A DataTransfer in the page holding these files, for a paste or a drop. F13a (UX-18 A): exported for drop-anywhere.spec.ts. */
export async function transferOf(page: Page, files: TestFile[]) {
  return page.evaluateHandle((entries) => {
    const transfer = new DataTransfer();
    for (const entry of entries) {
      const bytes = Uint8Array.from(atob(entry.base64), (character) => character.charCodeAt(0));
      transfer.items.add(new File([bytes], entry.name, { type: entry.mimeType }));
    }
    return transfer;
  }, files.map((file) => ({ name: file.name, mimeType: file.mimeType, base64: file.buffer.toString('base64') })));
}

/**
 * Ctrl+V with these files on the clipboard. `page.dispatchEvent('paste')` hands the page a null
 * clipboardData in both browsers, so the event is built in the page with a DataTransfer.
 * `from` is where the paste starts (the focused element in a real paste); the default is the body.
 * Returns whether the page took the paste over (preventDefault).
 */
export async function pasteFiles(page: Page, files: TestFile[], from = 'body'): Promise<boolean> {
  const transfer = await transferOf(page, files);
  return page.evaluate(
    ([target, data]) => {
      const event = new ClipboardEvent('paste', { clipboardData: data as DataTransfer, bubbles: true, cancelable: true });
      (document.querySelector(target as string) ?? document.body).dispatchEvent(event);
      return event.defaultPrevented;
    },
    [from, transfer] as const,
  );
}

/** Drops these files on an element (a drop on the result card must start a new batch, not open the file). */
export async function dropFiles(page: Page, selector: string, files: TestFile[]): Promise<boolean> {
  const transfer = await transferOf(page, files);
  return page.evaluate(
    ([target, data]) => {
      const over = new DragEvent('dragover', { dataTransfer: data as DataTransfer, bubbles: true, cancelable: true });
      document.querySelector(target as string)?.dispatchEvent(over);
      const drop = new DragEvent('drop', { dataTransfer: data as DataTransfer, bubbles: true, cancelable: true });
      document.querySelector(target as string)?.dispatchEvent(drop);
      return over.defaultPrevented && drop.defaultPrevented;
    },
    [selector, transfer] as const,
  );
}

/**
 * F13a · UX-18 A (DECISOES § 501): what a person does when they drag files from the file manager and let go on an
 * element: dragenter, dragover and drop on it, one DataTransfer built in the page with the bytes (setInputFiles fires none
 * of them). Returns whether the page took the dragover and the drop over (preventDefault) and the dropEffect it left.
 */
export async function dropOn(page: Page, selector: string, files: TestFile[]): Promise<{ taken: boolean; effect: string }> {
  const transfer = await transferOf(page, files);
  return page.evaluate(
    ([target, data]) => {
      const element = document.querySelector(target as string) ?? document.body;
      const fire = (type: string) => {
        const event = new DragEvent(type, { dataTransfer: data as DataTransfer, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event;
      };
      fire('dragenter');
      const over = fire('dragover');
      const effect = (data as DataTransfer).dropEffect;
      const drop = fire('drop');
      return { taken: over.defaultPrevented && drop.defaultPrevented, effect };
    },
    [selector, transfer] as const,
  );
}

/** One full use: a generated JPEG goes in and the result card shows with Download focused. */
export async function useImage(page: Page, name?: string): Promise<void> {
  await chooseImage(page, name);
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.fo-btn--download')).toBeFocused();
}

/** A file the tool refuses (not an image): the drop zone goes to the error state. */
export async function useBadFile(page: Page): Promise<void> {
  await page.setInputFiles(FILE_INPUT, { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible();
}

/**
 * "Start over" on the result card; waits for the drop zone to come back. F13a (UX-04 A): on the image card it is the first
 * ghost button of the row under the Download (.fo-result__more), next to "Before and after"; the PDF card keeps it in its
 * row of actions.
 */
export async function startOver(page: Page): Promise<void> {
  await page.locator('.fo-result__more > button:first-child, .fo-result__actions > button').first().click();
  await expect(page.locator('.fo-drop')).toBeVisible();
}

/**
 * F13a (UX-04 A; DECISOES § 466): after a result, the options of the tool are folded under "Adjust" in the band under
 * the card. This opens it (once) and waits for the options inside it, the way a person does before changing one.
 */
export async function openAdjust(page: Page): Promise<void> {
  const adjust = page.locator('details.fo-adjust');
  await expect(adjust).toHaveCount(1, { timeout: 30_000 });
  if (!(await adjust.evaluate((node) => (node as HTMLDetailsElement).open))) {
    const summary = adjust.locator('summary');
    // The WebKit gives no focus on a click: the keyboard opens it the same way in both browsers.
    await summary.focus();
    await page.keyboard.press('Enter');
  }
  await expect(adjust).toHaveJSProperty('open', true);
  await expect(adjust.locator('.fo-adjust__body')).toBeVisible();
}

/** F13a (UX-04 A): "Before and after" on the result card opens the comparison, which starts closed. */
export async function openCompare(page: Page): Promise<void> {
  const button = page.locator('.fo-result__more button[aria-controls="fo-compare"]');
  await expect(button).toHaveAttribute('aria-expanded', 'false', { timeout: 30_000 });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#fo-compare .fo-ba')).toBeVisible();
}

/** startOver, then a new use: the next file reaches the result card. */
export async function nextUse(page: Page): Promise<void> {
  await startOver(page);
  await useImage(page);
}

/**
 * Holds the engine's Web Worker module back so the panel stays in "processing" (the WaterLevel shows
 * after 400 ms). The first use fetches two files: the `engine-client` chunk (a dynamic import) and
 * `worker-*.js`, which the client requests as soon as it starts the engine, in every browser (the
 * on-page fallback of Safari without OffscreenCanvas also starts the worker first). Only the worker
 * is held, so the import itself is not touched. Call before choosing the file; `release()` lets it
 * through. The route also lets go by itself when the page closes.
 */
export async function slowEngine(page: Page): Promise<{ release: () => void }> {
  let release = () => {};
  const gate = new Promise<void>((open) => {
    release = open;
  });
  page.once('close', release);
  await page.route(/\/_astro\/worker-[\w-]+\.js$/, async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  return { release };
}

/** dragenter on the drop zone with a File in the DataTransfer: the panel goes to "over". */
export async function dragOver(page: Page): Promise<void> {
  const dataTransfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(16)], 'dragged.jpg', { type: 'image/jpeg' }));
    return transfer;
  });
  await page.dispatchEvent('.fo-drop', 'dragenter', { dataTransfer });
  await expect(page.locator('.fo-drop[data-state="over"]')).toBeVisible();
}

/** Opens the search dialog (Ctrl+K) and types a query no tool matches: the empty state shows. */
export async function searchWithoutResult(page: Page, query = 'youtube downloader'): Promise<void> {
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox')).toBeFocused();
  await page.keyboard.type(query);
  await expect(dialog.locator('[data-search-empty]')).toBeVisible();
}

/** Accept the cookie notice, then three uses: the third one shows the coffee line in the result. */
export async function reachCoffeeLine(page: Page): Promise<void> {
  await dismissCookies(page, 'granted');
  for (let use = 1; use <= 3; use += 1) {
    if (use > 1) await startOver(page);
    await useImage(page);
  }
  await expect(page.locator('.fo-result .fo-result__support')).toBeVisible();
}

/**
 * The coffee line in one use, for tests that only need it on screen (axe, ad distance): Accept, a
 * count of two earlier uses, then the third. The rule itself is covered use by use in coffee.spec.ts.
 */
export async function coffeeLineInOneUse(page: Page): Promise<void> {
  await dismissCookies(page, 'granted');
  await page.evaluate(() => localStorage.setItem('fo-coffee', JSON.stringify({ uses: 2 })));
  await useImage(page);
  await expect(page.locator('.fo-result .fo-result__support')).toBeVisible();
}

/** A beat for effects and animations to start, so a "nothing shows" check is not vacuous. */
export async function settle(page: Page, ms = 300): Promise<void> {
  await page.waitForTimeout(ms);
}

/** Waits for the animations and transitions that end (the loops keep going), so axe reads final colors. */
export async function animationsDone(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished),
    ).then(() => undefined),
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
