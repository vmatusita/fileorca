// The share inbox, read by the tool islands (F8, decision 10; DECISOES § 290). The "Open with" page writes in this
// tab's sessionStorage which tool the person chose and in what order the files go (the ones the tool takes first);
// that tool, and only it, takes the files the service worker kept from the share and deletes the inbox. The files
// then go the way of a drop or a paste. In the island chunk (astro.config.ts): no file is added to the tool pages.
//
// F13a · UX-14 (DECISOES § 496 to § 500): the islands write the same inbox too. A next-step chip whose tool
// takes the result puts the files that came out in it (the same entries, headers and hour as a share, so the clean-up of
// the hour that the service worker does on every visit covers them; src/sw/ does not change), notes in the tab
// {tool, order, from} (ids of pages only, never a file name) and goes to the tool, which takes them by the way of a drop
// and says where they came from. A choice that names where it came from and finds the inbox empty is the empty box (lost).
import { INBOX_CACHE, INBOX_ENTRY_PREFIX, INBOX_NAME_HEADER, INBOX_TIME_HEADER, INBOX_TOOL_KEY, inboxEntryPath, inboxExpired } from '../../sw/shared.ts';

interface Choice {
  tool: string;
  order: number[];
  /** F13a · UX-14: the id of the page whose chip sent the files (the "Open with" page writes none). */
  from?: string;
}

/** An id of a page: what `from` may be (never a name, never a path). */
const PAGE_ID = /^[a-z0-9-]{1,64}$/;

/** The choice the "Open with" page (or a next-step chip) left in this tab, read once. */
export function readChoice(raw: string | null): Choice | null {
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as { tool?: unknown; order?: unknown; from?: unknown };
    if (typeof parsed.tool !== 'string') return null;
    const order = Array.isArray(parsed.order) ? parsed.order.filter((index): index is number => Number.isInteger(index) && index >= 0) : [];
    const from = typeof parsed.from === 'string' && PAGE_ID.test(parsed.from) ? parsed.from : null;
    return { tool: parsed.tool, order, ...(from ? { from } : {}) };
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

/**
 * What arrived for a tool: the files, the page they came from (an id the island checks against its own list), and
 * whether the choice was for this tool, came from a chip and found nothing (lost: the inbox was deleted by a new
 * service worker, by its hour or with the site data). `count` is how many files the choice named.
 */
export interface Arrival {
  files: File[];
  from: string | null;
  lost: boolean;
  count: number;
}

const NOTHING: Arrival = { files: [], from: null, lost: false, count: 0 };

/** The files the "Open with" page or a chip sent to `tool`, or none. The inbox is deleted once read, whatever was in it. */
export async function takeInbox(tool: string): Promise<Arrival> {
  const choice = takeChoice();
  if (choice?.tool !== tool) return NOTHING;
  const from = choice.from ?? null;
  const empty: Arrival = { files: [], from, lost: from !== null, count: choice.order.length };
  if (typeof caches === 'undefined') return empty;
  try {
    if (!(await caches.has(INBOX_CACHE))) return empty;
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
    const files = ordered(entries, choice.order).map((entry) => entry.file);
    return files.length > 0 ? { files, from, lost: false, count: files.length } : empty;
  } catch {
    return empty;
  } finally {
    await caches.delete(INBOX_CACHE).catch(() => false);
  }
}

// --- F13a · UX-14: the chip that takes the result along ------------------------------------------------------------------

/**
 * How many of the files a tool takes: the ones in its formats, and one at most for a one-file tool. A copy of takes() of
 * src/share/logic.ts, which the island cannot import (it imports the sniffers of the engines and would leave this chunk);
 * tests/unit/handoff.test.ts holds the two equal on a grid (DECISOES § 497).
 */
export function carries(accepts: readonly string[], single: boolean, formats: readonly string[]): number {
  const count = formats.filter((format) => accepts.includes(format)).length;
  return single ? Math.min(count, 1) : count;
}

/** A plain click: the main button, with no Ctrl, Shift, Alt or Cmd. Anything else (a new tab, a new window) only links. */
export function plainClick(event: { button: number; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean; defaultPrevented: boolean }): boolean {
  return !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
}

/** A service worker controls the page: it is the one that deletes an inbox left past its hour (§ 290), so only then a chip carries. */
export function workerControls(): boolean {
  try {
    return typeof navigator !== 'undefined' && Boolean(navigator.serviceWorker?.controller);
  } catch {
    return false;
  }
}

/** A file that goes along: its name (only in a header of the entry, encoded) and its bytes with their type. */
export interface Outgoing {
  name: string;
  blob: Blob;
}

/** How long the page waits for the inbox to be written before it goes to the tool without it. */
export const CARRY_LIMIT_MS = 3000;

/**
 * Writes `files` into the inbox for `tool` and notes the choice in the tab, with the id of the page they come from. The old
 * inbox goes first (a share still waiting for its tool too: the person moved on). True when everything was written within
 * `limit`; otherwise the choice is never noted (the tool opens empty, as a plain link, and never says the box is empty)
 * and what was written goes.
 */
export async function storeForNext(files: readonly Outgoing[], tool: string, from: string, limit = CARRY_LIMIT_MS): Promise<boolean> {
  if (typeof caches === 'undefined' || files.length === 0) return false;
  let late = false;
  const write = async (): Promise<boolean> => {
    await caches.delete(INBOX_CACHE);
    const inbox = await caches.open(INBOX_CACHE);
    const stored = String(Date.now());
    for (const [index, file] of files.entries()) {
      const headers = { 'Content-Type': file.blob.type || 'application/octet-stream', [INBOX_NAME_HEADER]: encodeURIComponent(file.name), [INBOX_TIME_HEADER]: stored };
      await inbox.put(new Request(new URL(inboxEntryPath(index), location.origin).href), new Response(file.blob, { headers }));
    }
    if (late) return false;
    sessionStorage.setItem(INBOX_TOOL_KEY, JSON.stringify({ tool, order: files.map((_, index) => index), from }));
    return true;
  };
  let timer = 0;
  const done = await Promise.race([
    write().catch(() => false),
    new Promise<boolean>((resolve) => {
      timer = window.setTimeout(() => resolve(false), limit);
    }),
  ]);
  window.clearTimeout(timer);
  if (!done) {
    late = true;
    await caches.delete(INBOX_CACHE).catch(() => false);
  }
  return done;
}
