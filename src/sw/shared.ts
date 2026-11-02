// What the service worker and the pages agree on (F8, decisions 5 and 10; DECISOES § 286 and § 290). It imports
// nothing: src/sw/build.ts stitches it into /sw.js, and the tool islands and the "Open with" page import it.

/** Every cache of the site starts with this; the kill switch deletes all of them (DECISOES § 288). */
export const CACHE_PREFIX = 'fileorca-';
/** The cache of the pages and files of one build: `fileorca-pages-<commit>`. */
export const PAGES_CACHE_PREFIX = `${CACHE_PREFIX}pages-`;
/** The share inbox: the files shared with the installed app, until a tool takes them (DECISOES § 290). */
export const INBOX_CACHE = `${CACHE_PREFIX}inbox`;
/** Synthetic paths of the inbox entries: a counter, never a file name. Nothing is ever fetched from them. */
export const INBOX_ENTRY_PREFIX = '/__fileorca-inbox/';
/** The inbox is deleted after this long, even when no tool took it. */
export const INBOX_TTL_MS = 60 * 60 * 1000;
/** Headers of an inbox entry: the encoded file name, its type and when it was stored. */
export const INBOX_NAME_HEADER = 'X-FileOrca-Name';
export const INBOX_TIME_HEADER = 'X-FileOrca-Stored';
/** The form field of the share_target in the manifests. */
export const SHARE_FIELD = 'files';
/** sessionStorage key, per tab: the tool the "Open with" page sent the files to. Never in the URL. */
export const INBOX_TOOL_KEY = 'fo-inbox-tool';

export function pagesCacheName(version: string): string {
  return `${PAGES_CACHE_PREFIX}${version}`;
}

export function inboxEntryPath(index: number): string {
  return `${INBOX_ENTRY_PREFIX}${index}`;
}
