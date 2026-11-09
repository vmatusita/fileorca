// F15 (decision 6 of the run; DECISOES § 655): what a next-step chip leaves for the next tool, written in the page as the
// chip writes it (storeForNext of src/tools/image/inbox.ts: the entries of the share inbox with the name and the hour in
// their headers, and the choice {tool, order, from} in the tab), for the specs that want the arrival without the chip and
// its page before (privacy, the claims of the launch, the layout shift and axe). The page is opened again, and the tool
// takes the files the way of a drop. In the WebKit of Playwright the Cache Storage does not outlive a reload while service
// workers are blocked (docs/claude/playwright.md, F13a): a spec that uses this allows them.
import { expect, type Page } from '@playwright/test';
import { INBOX_CACHE, INBOX_NAME_HEADER, INBOX_TIME_HEADER, INBOX_TOOL_KEY, inboxEntryPath } from '../../../src/sw/shared.ts';
import { hydrated, type TestFile } from './page.ts';

/** Writes `files` in the inbox for `tool`, sent by the chip of `from`, opens the page again and waits for the island. */
export async function arriveFrom(page: Page, tool: string, from: string, files: readonly TestFile[]): Promise<void> {
  const entries = files.map((file, index) => ({ url: inboxEntryPath(index), name: encodeURIComponent(file.name), type: file.mimeType, base64: file.buffer.toString('base64') }));
  const choice = JSON.stringify({ tool, order: files.map((_, index) => index), from });
  await page.evaluate(
    async ({ cache, key, nameHeader, timeHeader, entries, choice }) => {
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
    { cache: INBOX_CACHE, key: INBOX_TOOL_KEY, nameHeader: INBOX_NAME_HEADER, timeHeader: INBOX_TIME_HEADER, entries, choice },
  );
  const response = await page.reload();
  expect(response?.status(), 'the tool answers 200').toBe(200);
  await hydrated(page);
}

/** The inbox and the choice are gone: the tool took them (or found nothing) and deleted both. */
export function inboxGone(page: Page): Promise<{ inbox: boolean; choice: string | null }> {
  return page.evaluate(async ([name, key]) => ({ inbox: await caches.has(name), choice: sessionStorage.getItem(key) }), [INBOX_CACHE, INBOX_TOOL_KEY] as const);
}
