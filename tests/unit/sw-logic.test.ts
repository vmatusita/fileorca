// The rules of the service worker (src/sw/logic.ts; F8, decisions 5, 8 and 10; DECISOES § 285 to § 290) and the
// build of /sw.js (src/sw/build.ts; DECISOES § 287): the key, what enters the cache, the language of a path, the
// caches a new version and the kill switch delete, the inbox and the classic script the build joins.
import { describe, expect, it } from 'vitest';
import {
  cacheKey,
  cachesToDelete,
  isCacheable,
  isListedPage,
  langOfPath,
  neverCached,
  offlineOrder,
  strategyFor,
  titleOf,
  warmList,
  type RequestLike,
  type SwConfig,
} from '../../src/sw/logic.ts';
import { INBOX_CACHE, INBOX_TTL_MS, inboxExpired, pagesCacheName } from '../../src/sw/shared.ts';
import { joinable, offlineAssets, swScript } from '../../src/sw/build.ts';

const ORIGIN = 'https://fileorca.com';
const config: SwConfig = {
  version: 'abc1234',
  enabled: true,
  offline: {
    en: { page: '/offline/', assets: ['/_astro/island.css'] },
    pt: { page: '/pt/sem-conexao/', assets: ['/_astro/island.css'] },
    es: { page: '/es/sin-conexion/', assets: ['/_astro/island.css'] },
  },
  share: ['/open-with/', '/pt/abrir-com/', '/es/abrir-con/'],
  never: ['/build.txt', '/ads.txt', '/robots.txt', '/sw.js', '/4ad5aef34d8b1746ec596c51d0f4fa1a.txt'],
};

function request(url: string, init: Partial<RequestLike> & { range?: string } = {}): RequestLike {
  const headers = new Map<string, string>(init.range ? [['range', init.range]] : []);
  return { method: init.method ?? 'GET', url, mode: init.mode ?? 'no-cors', headers: { get: (name) => headers.get(name.toLowerCase()) ?? null } };
}

describe('cacheKey', () => {
  it('drops the query and the fragment, keeps origin and path', () => {
    expect(cacheKey('https://fileorca.com/mortgage-calculator/#p=350000&r=6.5')).toBe('https://fileorca.com/mortgage-calculator/');
    expect(cacheKey('https://fileorca.com/due-date-calculator/?utm_source=x#lmp=2026-01-01')).toBe('https://fileorca.com/due-date-calculator/');
    expect(cacheKey('https://fileorca.com/_astro/island.BwFYAQYF.js')).toBe('https://fileorca.com/_astro/island.BwFYAQYF.js');
  });
});

describe('langOfPath', () => {
  it('reads /pt/ and /es/, and English for the rest', () => {
    expect(langOfPath('/pt/')).toBe('pt');
    expect(langOfPath('/pt/juntar-pdf/')).toBe('pt');
    expect(langOfPath('/es/unir-pdf/')).toBe('es');
    expect(langOfPath('/')).toBe('en');
    expect(langOfPath('/compress-image/')).toBe('en');
    expect(langOfPath('/ptx/')).toBe('en');
    expect(langOfPath('/espresso/')).toBe('en');
  });

  it('tries the language of the path first, then the others', () => {
    expect(offlineOrder('pt')).toEqual(['pt', 'en', 'es']);
    expect(offlineOrder('en')).toEqual(['en', 'pt', 'es']);
  });
});

describe('strategyFor', () => {
  it('passes other origins, non-GET requests and ranges straight to the network', () => {
    expect(strategyFor(request('https://www.googletagmanager.com/gtag/js?id=G-X'), ORIGIN, config)).toBe('pass');
    expect(strategyFor(request('https://pagead2.googlesyndication.com/x.js'), ORIGIN, config)).toBe('pass');
    expect(strategyFor(request(`${ORIGIN}/compress-image/`, { method: 'POST' }), ORIGIN, config)).toBe('pass');
    expect(strategyFor(request(`${ORIGIN}/_astro/x.wasm`, { range: 'bytes=0-99' }), ORIGIN, config)).toBe('pass');
  });

  it('never touches build.txt, /cdn-cgi/, ads.txt, robots.txt, the sitemaps, the IndexNow key and /sw.js', () => {
    for (const path of ['/build.txt', '/cdn-cgi/scripts/x.js', '/ads.txt', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml', '/4ad5aef34d8b1746ec596c51d0f4fa1a.txt', '/sw.js']) {
      expect(strategyFor(request(`${ORIGIN}${path}`), ORIGIN, config), path).toBe('pass');
      expect(neverCached(path, config), path).toBe(true);
    }
    expect(neverCached('/__fileorca-inbox/0', config)).toBe(true);
  });

  it('receives the share POST only at the share actions', () => {
    for (const path of config.share) expect(strategyFor(request(`${ORIGIN}${path}`, { method: 'POST', mode: 'navigate' }), ORIGIN, config)).toBe('share');
    expect(strategyFor(request(`${ORIGIN}/open-with/`, { mode: 'navigate' }), ORIGIN, config)).toBe('navigate');
  });

  it('goes network first for pages and own files, cache first for the hashed /_astro/ files', () => {
    expect(strategyFor(request(`${ORIGIN}/compress-image/`, { mode: 'navigate' }), ORIGIN, config)).toBe('navigate');
    expect(strategyFor(request(`${ORIGIN}/_astro/island.BwFYAQYF.js`, { mode: 'cors' }), ORIGIN, config)).toBe('cache-first');
    expect(strategyFor(request(`${ORIGIN}/_astro/pdfjs/6.4.299/cmaps/Adobe-Japan1-0.bcmap`), ORIGIN, config)).toBe('cache-first');
    expect(strategyFor(request(`${ORIGIN}/manifest-en.webmanifest`), ORIGIN, config)).toBe('network-first');
    expect(strategyFor(request(`${ORIGIN}/icon-192.png`), ORIGIN, config)).toBe('network-first');
  });
});

describe('isCacheable', () => {
  it('stores only a full, basic, not redirected 200', () => {
    expect(isCacheable({ status: 200, type: 'basic', redirected: false })).toBe(true);
    expect(isCacheable({ status: 200, type: 'basic', redirected: true })).toBe(false);
    expect(isCacheable({ status: 206, type: 'basic', redirected: false })).toBe(false);
    expect(isCacheable({ status: 404, type: 'basic', redirected: false })).toBe(false);
    expect(isCacheable({ status: 0, type: 'opaque', redirected: false })).toBe(false);
    expect(isCacheable({ status: 0, type: 'opaqueredirect', redirected: false })).toBe(false);
    expect(isCacheable({ status: 200, type: 'cors', redirected: false })).toBe(false);
    expect(isCacheable({ status: 304, type: 'basic', redirected: false })).toBe(false);
  });
});

describe('cachesToDelete', () => {
  const keys = [pagesCacheName('old1234'), pagesCacheName('abc1234'), INBOX_CACHE, 'other-site-cache'];

  it('keeps only the pages of this build, and empties the inbox, when a new version activates', () => {
    expect(cachesToDelete(keys, config)).toEqual([pagesCacheName('old1234'), INBOX_CACHE]);
  });

  it('deletes every cache of the site with the kill switch, and nothing of anyone else', () => {
    expect(cachesToDelete(keys, { ...config, enabled: false })).toEqual([pagesCacheName('old1234'), pagesCacheName('abc1234'), INBOX_CACHE]);
  });
});

describe('warmList', () => {
  it('keeps same-origin files as keys, without repeats, and nothing it never stores', () => {
    const urls = [
      `${ORIGIN}/compress-image/`,
      `${ORIGIN}/_astro/island.BwFYAQYF.js`,
      `${ORIGIN}/_astro/island.BwFYAQYF.js?x=1`,
      'https://www.google-analytics.com/g/collect?v=2',
      `${ORIGIN}/build.txt`,
      `${ORIGIN}/open-with/`,
      'blob:https://fileorca.com/0b1c',
      'data:image/png;base64,AAAA',
      42,
    ];
    expect(warmList(urls, ORIGIN, config)).toEqual([`${ORIGIN}/compress-image/`, `${ORIGIN}/_astro/island.BwFYAQYF.js`]);
    expect(warmList('nope', ORIGIN, config)).toEqual([]);
    expect(warmList(Array.from({ length: 100 }, (_, i) => `${ORIGIN}/_astro/${i}.js`), ORIGIN, config)).toHaveLength(60);
  });
});

describe('inbox', () => {
  it('expires after an hour, and when the time is missing, odd or in the future', () => {
    const now = 1_800_000_000_000;
    expect(inboxExpired(String(now - 1000), now)).toBe(false);
    expect(inboxExpired(String(now - INBOX_TTL_MS - 1), now)).toBe(true);
    expect(inboxExpired(String(now + 10 * 60_000), now)).toBe(true);
    expect(inboxExpired(null, now)).toBe(true);
    expect(inboxExpired('soon', now)).toBe(true);
  });
});

describe('the list of the offline page', () => {
  it('lists pages, not the offline and share pages or files', () => {
    expect(isListedPage('/compress-image/', config)).toBe(true);
    expect(isListedPage('/pt/', config)).toBe(true);
    expect(isListedPage('/offline/', config)).toBe(false);
    expect(isListedPage('/pt/abrir-com/', config)).toBe(false);
    expect(isListedPage('/_astro/island.css', config)).toBe(false);
  });

  it('reads the title of a stored page', () => {
    expect(titleOf('<html><head><title>Compress image &amp; photo | FileOrca</title></head>')).toBe('Compress image & photo | FileOrca');
    expect(titleOf('<title></title>')).toBeNull();
    expect(titleOf('<p>no title</p>')).toBeNull();
  });
});

describe('the build of /sw.js', () => {
  it('joins the three files into one classic script that parses, with the config first', async () => {
    const script = await swScript(config);
    expect(script).toContain(`const SW_CONFIG = ${JSON.stringify(config)};`);
    expect(script).not.toMatch(/^\s*(?:import|export)\b/m);
    expect(() => new Function(script)).not.toThrow();
    for (const name of ['shared.ts', 'logic.ts', 'main.ts']) expect(script).toContain(`// src/sw/${name}`);
  });

  it('refuses an import or export it cannot join', () => {
    expect(joinable("import { a } from './shared.ts';\nexport function f() {}\n", 'x.ts')).toBe('function f() {}');
    expect(() => joinable("import x from 'node:fs';\n", 'x.ts')).toThrow(/import ou export/);
    expect(() => joinable('export { a };\n', 'x.ts')).toThrow(/import ou export/);
  });

  it('lists the stylesheets, scripts and fonts the offline page needs', () => {
    const html = '<link rel="preload" href="/_astro/fredoka.woff2"><link rel="stylesheet" href="/_astro/island.css"><a href="/pt/">x</a>';
    const css = '@font-face{src:url(/_astro/figtree.woff2)format("woff2")}@font-face{src:url(/_astro/fredoka.woff2)}';
    expect(offlineAssets(html, () => css)).toEqual(['/_astro/figtree.woff2', '/_astro/fredoka.woff2', '/_astro/island.css']);
  });
});
