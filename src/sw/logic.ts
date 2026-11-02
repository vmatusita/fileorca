// The rules of the service worker as pure functions (F8, decisions 5, 6, 8 and 10; DECISOES § 285 to § 290), tested
// in tests/unit/sw-logic.test.ts. Only src/sw/shared.ts is imported: src/sw/build.ts stitches the three files of
// src/sw/ into the classic script /sw.js, so nothing here may touch a global of the page or of the worker.
import { CACHE_PREFIX, INBOX_ENTRY_PREFIX, pagesCacheName } from './shared.ts';

export type SwLang = 'en' | 'pt' | 'es';
export const SW_LANGS: readonly SwLang[] = ['en', 'pt', 'es'];

/** What the build writes into /sw.js (src/sw/build.ts). */
export interface SwConfig {
  /** The commit of the build, as in build.txt: the name of the pages cache. */
  version: string;
  /** false turns /sw.js into the kill switch (DECISOES § 288). */
  enabled: boolean;
  /** The offline page of each language and the files it needs to show (DECISOES § 289). */
  offline: Record<SwLang, { page: string; assets: string[] }>;
  /** The share_target action of each manifest (DECISOES § 290). */
  share: string[];
  /** Exact paths that never enter the cache and never go through the worker. */
  never: string[];
}

export type Strategy = 'pass' | 'share' | 'navigate' | 'cache-first' | 'network-first';

export interface RequestLike {
  method: string;
  url: string;
  mode: string;
  headers: { get(name: string): string | null };
}

export interface ResponseLike {
  status: number;
  type: string;
  redirected: boolean;
}

/** The cache key: the URL without the query and without the fragment (DECISOES § 286). */
export function cacheKey(url: string): string {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}`;
}

/** The language of a path, for the offline page: /pt/… in Portuguese, /es/… in Spanish, the rest in English. */
export function langOfPath(pathname: string): SwLang {
  if (pathname === '/pt' || pathname.startsWith('/pt/')) return 'pt';
  if (pathname === '/es' || pathname.startsWith('/es/')) return 'es';
  return 'en';
}

/** The offline pages to try for a path: its language first, then any other that is stored. */
export function offlineOrder(lang: SwLang): SwLang[] {
  return [lang, ...SW_LANGS.filter((other) => other !== lang)];
}

/** Paths that never enter the cache: build.txt, /cdn-cgi/, ads.txt, robots.txt, sitemaps, the IndexNow key and /sw.js. */
export function neverCached(pathname: string, config: Pick<SwConfig, 'never'>): boolean {
  return (
    config.never.includes(pathname) ||
    pathname.startsWith('/cdn-cgi/') ||
    /^\/sitemap[^/]*\.xml$/.test(pathname) ||
    pathname.startsWith(INBOX_ENTRY_PREFIX)
  );
}

/** How the worker answers a request (the table of DECISOES § 285). `pass` means no respondWith at all. */
export function strategyFor(request: RequestLike, origin: string, config: Pick<SwConfig, 'never' | 'share'>): Strategy {
  const url = new URL(request.url);
  if (url.origin !== origin) return 'pass';
  if (request.method === 'POST' && config.share.includes(url.pathname)) return 'share';
  if (request.method !== 'GET') return 'pass';
  if (request.headers.get('range') !== null) return 'pass';
  if (neverCached(url.pathname, config)) return 'pass';
  if (request.mode === 'navigate') return 'navigate';
  if (url.pathname.startsWith('/_astro/')) return 'cache-first';
  return 'network-first';
}

/** Only a full, same-origin, not redirected 200 enters the cache: never 206, 404, opaque or redirected. */
export function isCacheable(response: ResponseLike): boolean {
  return response.status === 200 && response.type === 'basic' && !response.redirected;
}

/** The caches to delete on activation: the other builds and the inbox; with the kill switch, every cache of the site. */
export function cachesToDelete(keys: readonly string[], config: Pick<SwConfig, 'version' | 'enabled'>): string[] {
  const own = keys.filter((key) => key.startsWith(CACHE_PREFIX));
  if (!config.enabled) return own;
  const current = pagesCacheName(config.version);
  return own.filter((key) => key !== current);
}

/**
 * The URLs a page asks the worker to store when it was loaded before the worker controlled it (its own address and
 * the files it fetched): same origin, cacheable paths, as keys, without repeats, at most 60.
 */
export function warmList(urls: unknown, origin: string, config: Pick<SwConfig, 'never' | 'share'>): string[] {
  if (!Array.isArray(urls)) return [];
  const keys = new Set<string>();
  for (const url of urls) {
    if (typeof url !== 'string' || keys.size >= 60) continue;
    let parsed: URL;
    try {
      parsed = new URL(url, origin);
    } catch {
      continue;
    }
    if (parsed.origin !== origin || !/^https?:$/.test(parsed.protocol)) continue;
    if (neverCached(parsed.pathname, config) || config.share.includes(parsed.pathname)) continue;
    keys.add(cacheKey(parsed.href));
  }
  return [...keys];
}

/** Whether a cached path is a page for the list of the offline page (not an offline or share page, not a file). */
export function isListedPage(pathname: string, config: Pick<SwConfig, 'offline' | 'share'>): boolean {
  if (!pathname.endsWith('/')) return false;
  if (config.share.includes(pathname)) return false;
  return !SW_LANGS.some((lang) => config.offline[lang].page === pathname);
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'" };

/** The text of the first <title> of an HTML page, or null. */
export function titleOf(html: string): string | null {
  const match = /<title>([^<]*)<\/title>/i.exec(html);
  if (!match) return null;
  const text = (match[1] ?? '').replace(/&(amp|lt|gt|quot|#39|apos);/g, (_, name: string) => ENTITIES[name] ?? '').trim();
  return text === '' ? null : text;
}
