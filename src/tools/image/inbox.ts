// The share inbox, read by the tool islands (F8, decision 10; DECISOES § 290). The "Open with" page writes in this
// tab's sessionStorage which tool the person chose and in what order the files go (the ones the tool takes first);
// that tool, and only it, takes the files the service worker kept from the share and deletes the inbox. The files
// then go the way of a drop or a paste. In the island chunk (astro.config.ts): no file is added to the tool pages.
import { INBOX_CACHE, INBOX_ENTRY_PREFIX, INBOX_NAME_HEADER, INBOX_TIME_HEADER, INBOX_TOOL_KEY, inboxExpired } from '../../sw/shared.ts';

interface Choice {
  tool: string;
  order: number[];
}

/** The choice the "Open with" page left in this tab, read once. */
export function readChoice(raw: string | null): Choice | null {
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as { tool?: unknown; order?: unknown };
    if (typeof parsed.tool !== 'string') return null;
    const order = Array.isArray(parsed.order) ? parsed.order.filter((index): index is number => Number.isInteger(index) && index >= 0) : [];
    return { tool: parsed.tool, order };
  } catch {
    return null;
  }
}

function takeChoice(): Choice | null {
  try {
    const raw = sessionStorage.getItem(INBOX_TOOL_KEY);
    if (raw !== null) sessionStorage.removeItem(INBOX_TOOL_KEY);
    return readChoice(raw);
  } catch {
    return null;
  }
}

/** Puts the entries in the order of the choice; entries it does not name follow, in the order they came. */
export function ordered<T extends { index: number }>(entries: T[], order: number[]): T[] {
  const byIndex = [...entries].sort((a, b) => a.index - b.index);
  const first = order.flatMap((index) => byIndex.filter((entry) => entry.index === index));
  return [...first, ...byIndex.filter((entry) => !first.includes(entry))];
}

/** The files the "Open with" page sent to `tool`, or none. The inbox is deleted once read, whatever was in it. */
export async function takeInbox(tool: string): Promise<File[]> {
  const choice = takeChoice();
  if (choice?.tool !== tool || typeof caches === 'undefined') return [];
  try {
    if (!(await caches.has(INBOX_CACHE))) return [];
    const inbox = await caches.open(INBOX_CACHE);
    const now = Date.now();
    const entries: { index: number; file: File }[] = [];
    for (const request of await inbox.keys()) {
      const path = new URL(request.url).pathname;
      if (!path.startsWith(INBOX_ENTRY_PREFIX)) continue;
      const response = await inbox.match(request);
      if (!response || inboxExpired(response.headers.get(INBOX_TIME_HEADER), now)) continue;
      let name = '';
      try {
        name = decodeURIComponent(response.headers.get(INBOX_NAME_HEADER) ?? '');
      } catch {
        name = '';
      }
      const type = response.headers.get('Content-Type') ?? '';
      const file = new File([await response.blob()], name, { type: type === 'application/octet-stream' ? '' : type });
      entries.push({ index: Number(path.slice(INBOX_ENTRY_PREFIX.length)), file });
    }
    return ordered(entries, choice.order).map((entry) => entry.file);
  } catch {
    return [];
  } finally {
    await caches.delete(INBOX_CACHE).catch(() => false);
  }
}
