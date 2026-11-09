// F15 (decision 6 of the run; DECISOES § 655): what a next-step chip leaves for the next tool, written in the page as the
// chip writes it (storeForNext of src/tools/image/inbox.ts: the entries of the share inbox with the name and the hour in
// their headers, and the choice {tool, order, from} in the tab), for the specs that want the arrival without the chip and
// its page before (privacy, the claims of the launch, the layout shift and axe). The page is opened again, and the tool
// takes the files the way of a drop. In the WebKit of Playwright the Cache Storage does not outlive a reload while service
// workers are blocked (docs/claude/playwright.md, F13a): a spec that uses this allows them.
import { expect, type Page } from '@playwright/test';
import { INBOX_CACHE, INBOX_NAME_HEADER, INBOX_TIME_HEADER, INBOX_TOOL_KEY, inboxEntryPath } from '../../../src/sw/shared.ts';
import { SW_ENABLED } from '../../../src/platform/site.ts';
import { hydrated, type TestFile } from './page.ts';

/** Writes `files` in the inbox for `tool`, sent by the chip of `from`, opens the page again and waits for the island. */
export async function arriveFrom(page: Page, tool: string, from: string, files: readonly TestFile[]): Promise<void> {
  const entries = files.map((file, index) => ({ url: inboxEntryPath(index), name: encodeURIComponent(file.name), type: file.mimeType, base64: file.buffer.toString('base64') }));
  const choice = JSON.stringify({ tool, order: files.map((_, index) => index), from });
  await page.evaluate(
    async ({ cache, key, nameHeader, timeHeader, entries, choice, worker }) => {
      // The activation of a worker deletes the caches of the site that are not its pages, the inbox among them (cachesToDelete
      // of src/sw/logic.ts): on a first visit, a worker that activates after the inbox is written leaves the tool with the
      // empty box. A chip writes the inbox only under a worker in control, so the arrival waits for the activation too (up
      // to 15 s; a context that blocks workers never gets one, and nothing deletes the inbox there).
      if (worker && 'serviceWorker' in navigator) {
        const activated = (async () => {
          const registration = await navigator.serviceWorker.ready;
          const active = registration.active;
          if (active && active.state !== 'activated') {
            await new Promise<void>((done) => active.addEventListener('statechange', () => active.state === 'activated' && done()));
          }
        })();
        await Promise.race([activated, new Promise((done) => setTimeout(done, 15_000))]);
      }
      await caches.delete(cache);
      const inbox = await caches.open(cache);
      const stored = String(Date.now());
      for (const entry of entries) {
        const bytes = Uint8Array.from(atob(entry.base64), (character) => character.charCodeAt(0));
        const headers = { 'Content-Type': entry.type, [nameHeader]: entry.name, [timeHeader]: stored };
        await inbox.put(new Request(new URL(entry.url, location.origin).href), new Response(new Blob([bytes], { type: entry.type }), { headers }));
      }
      sessionStorage.setItem(key, choice);
    },
    { cache: INBOX_CACHE, key: INBOX_TOOL_KEY, nameHeader: INBOX_NAME_HEADER, timeHeader: INBOX_TIME_HEADER, entries, choice, worker: SW_ENABLED },
  );
  const response = await page.reload();
  expect(response?.status(), 'the tool answers 200').toBe(200);
  await hydrated(page);
}

/** The inbox and the choice are gone: the tool took them (or found nothing) and deleted both. */
export function inboxGone(page: Page): Promise<{ inbox: boolean; choice: string | null }> {
  return page.evaluate(async ([name, key]) => ({ inbox: await caches.has(name), choice: sessionStorage.getItem(key) }), [INBOX_CACHE, INBOX_TOOL_KEY] as const);
}
