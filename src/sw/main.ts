// The service worker of fileorca.com (F8, decisions 4 to 10; DECISOES § 285 to § 290). src/sw/build.ts stitches
// shared.ts, logic.ts and this file into the classic script /sw.js, with SW_CONFIG written by the build.
// It only stores files of its own origin, of the pages the person visited; what the person typed or opened never
// enters a cache (no `?`, no `#`, no POST but the share inbox, which is deleted when a tool takes it).
import { cacheKey, cachesToDelete, isCacheable, langOfPath, offlineOrder, strategyFor, warmList, type SwConfig, type SwLang } from './logic.ts';
import { INBOX_CACHE, INBOX_NAME_HEADER, INBOX_TIME_HEADER, SHARE_FIELD, inboxEntryPath, inboxExpired, pagesCacheName } from './shared.ts';

declare const SW_CONFIG: SwConfig;

// The service worker types, declared here because lib "webworker" fights lib "dom" in one tsconfig (DECISOES § 287).
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}
interface FetchEvent extends ExtendableEvent {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}
interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: unknown;
}
interface WorkerScope {
  readonly location: Location;
  readonly registration: { unregister(): Promise<boolean> };
  readonly clients: {
    claim(): Promise<void>;
    matchAll(options: { type: 'window'; includeUncontrolled: boolean }): Promise<readonly { url: string }[]>;
  };
  skipWaiting(): Promise<void>;
  addEventListener(type: 'install' | 'activate', listener: (event: ExtendableEvent) => void): void;
  addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void;
  addEventListener(type: 'message', listener: (event: ExtendableMessageEvent) => void): void;
}

const scope = self as unknown as WorkerScope;
const config = SW_CONFIG;
const origin = scope.location.origin;
const PAGES = pagesCacheName(config.version);

async function deleteOldCaches(): Promise<void> {
  const keys = await caches.keys();
  await Promise.all(cachesToDelete(keys, config).map((key) => caches.delete(key)));
}

async function store(key: string, response: Response): Promise<void> {
  try {
    const cache = await caches.open(PAGES);
    await cache.put(key, response);
  } catch {
    // A full disk or a closed cache only means the page is not kept offline.
  }
}

async function fetchAndStore(key: string): Promise<void> {
  try {
    const cache = await caches.open(PAGES);
    if (await cache.match(key)) return;
    const response = await fetch(key, { credentials: 'same-origin' });
    if (isCacheable(response)) await cache.put(key, response);
  } catch {
    // Offline or refused: the next visit with the network stores it.
  }
}

/** Stores the offline page of a language and its files, the page last, so a stored page has its files. */
async function ensureOffline(lang: SwLang): Promise<void> {
  const { page, assets } = config.offline[lang];
  const pageKey = new URL(page, origin).href;
  const cache = await caches.open(PAGES);
  if (await cache.match(pageKey)) return;
  for (const asset of assets) await fetchAndStore(new URL(asset, origin).href);
  await fetchAndStore(pageKey);
}

async function offlineAnswer(key: string): Promise<Response> {
  const cache = await caches.open(PAGES);
  const hit = await cache.match(key);
  if (hit) return hit;
  for (const lang of offlineOrder(langOfPath(new URL(key).pathname))) {
    const page = await cache.match(new URL(config.offline[lang].page, origin).href);
    if (page) return page;
  }
  return Response.error();
}

/** The inbox a tool never took is deleted after INBOX_TTL_MS (decision 10), checked on every navigation. */
async function dropStaleInbox(): Promise<void> {
  try {
    if (!(await caches.has(INBOX_CACHE))) return;
    const inbox = await caches.open(INBOX_CACHE);
    const first = (await inbox.keys())[0];
    const response = first ? await inbox.match(first) : undefined;
    if (!response || inboxExpired(response.headers.get(INBOX_TIME_HEADER), Date.now())) await caches.delete(INBOX_CACHE);
  } catch {
    // Checked again on the next navigation.
  }
}

async function navigate(event: FetchEvent): Promise<Response> {
  const key = cacheKey(event.request.url);
  event.waitUntil(dropStaleInbox());
  let response: Response;
  try {
    response = await fetch(event.request);
  } catch {
    return offlineAnswer(key);
  }
  // A redirect (auto-trailing-slash) comes back as an opaque redirect the browser follows; it is never stored.
  if (isCacheable(response)) {
    const copy = response.clone();
    event.waitUntil(store(key, copy).then(() => ensureOffline(langOfPath(new URL(key).pathname))));
  }
  return response;
}

async function cacheFirst(event: FetchEvent): Promise<Response> {
  const key = cacheKey(event.request.url);
  const cache = await caches.open(PAGES);
  const hit = await cache.match(key);
  if (hit) return hit;
  const response = await fetch(event.request);
  if (isCacheable(response)) event.waitUntil(store(key, response.clone()));
  return response;
}

async function networkFirst(event: FetchEvent): Promise<Response> {
  const key = cacheKey(event.request.url);
  try {
    const response = await fetch(event.request);
    if (isCacheable(response)) event.waitUntil(store(key, response.clone()));
    return response;
  } catch (error) {
    const hit = await (await caches.open(PAGES)).match(key);
    if (hit) return hit;
    throw error;
  }
}

/** The POST of the share target: the files go to the inbox, and the page answers itself in GET (DECISOES § 290). */
async function receiveShare(request: Request): Promise<Response> {
  const page = cacheKey(request.url);
  try {
    const form = await request.formData();
    const files = form.getAll(SHARE_FIELD).filter((item): item is File => typeof item !== 'string');
    await caches.delete(INBOX_CACHE);
    const inbox = await caches.open(INBOX_CACHE);
    const now = String(Date.now());
    for (const [index, file] of files.entries()) {
      const headers = {
        'Content-Type': file.type || 'application/octet-stream',
        [INBOX_NAME_HEADER]: encodeURIComponent(file.name),
        [INBOX_TIME_HEADER]: now,
      };
      await inbox.put(new URL(inboxEntryPath(index), origin).href, new Response(file, { headers }));
    }
  } catch {
    // The page explains an empty inbox.
  }
  return Response.redirect(page, 303);
}

function start(): void {
  scope.addEventListener('install', (event) => {
    event.waitUntil(
      (async () => {
        // Only the offline page of the language of the page that registered the worker (decision 8).
        const clients = await scope.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const langs = new Set(clients.map((client) => langOfPath(new URL(client.url).pathname)));
        if (langs.size === 0) langs.add('en');
        for (const lang of langs) await ensureOffline(lang);
        await scope.skipWaiting();
      })(),
    );
  });
  scope.addEventListener('activate', (event) => {
    event.waitUntil(deleteOldCaches().then(() => scope.clients.claim()));
  });
  scope.addEventListener('fetch', (event) => {
    const strategy = strategyFor(event.request, origin, config);
    if (strategy === 'pass') return;
    if (strategy === 'share') event.respondWith(receiveShare(event.request));
    else if (strategy === 'navigate') event.respondWith(navigate(event));
    else if (strategy === 'cache-first') event.respondWith(cacheFirst(event));
    else event.respondWith(networkFirst(event));
  });
  scope.addEventListener('message', (event) => {
    const data = event.data as { type?: unknown; urls?: unknown } | null;
    if (!data || data.type !== 'warm') return;
    const keys = warmList(data.urls, origin, config);
    event.waitUntil(
      (async () => {
        for (const key of keys) await fetchAndStore(key);
        if (keys[0]) await ensureOffline(langOfPath(new URL(keys[0]).pathname));
      })(),
    );
  });
}

/** The kill switch (DECISOES § 288): deletes every cache of the site and unregisters; the pages then come from the network. */
function stop(): void {
  scope.addEventListener('install', (event) => event.waitUntil(scope.skipWaiting()));
  scope.addEventListener('activate', (event) => {
    event.waitUntil(deleteOldCaches().then(() => scope.registration.unregister()));
  });
}

if (config.enabled) start();
else stop();
