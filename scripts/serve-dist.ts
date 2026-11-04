// Static server for dist/ used by Playwright and Lighthouse CI. It mimics the Cloudflare assets
// handler of wrangler.jsonc: html_handling "auto-trailing-slash" (307 to the canonical form),
// not_found_handling "404-page" (nearest 404.html, status 404) and the path rules of _headers. A method other than GET
// and HEAD gets 405 with an empty body, like the assets-only Worker (F8: the POST of the share target must never reach
// the server; DECISOES § 294). The tests of the service worker build their own servers with createDistServer().
// F12 (DECISOES § 414): the folder served is an option (dist/ by default), so scripts/serve-test-build.ts serves the test
// build under .cache/builds/ with the same rules.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type RequestListener, type Server } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = 'dist';
const PORT = Number(process.env['PORT'] ?? 4173);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

interface Rule {
  pattern: RegExp;
  headers: [string, string][];
}

function loadRules(root: string): Rule[] {
  const path = join(root, '_headers');
  if (!existsSync(path)) return [];
  const rules: Rule[] = [];
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (/^([^\s]+:\/\/|\/)/.test(line)) {
      // Absolute URL rules (workers.dev) never match localhost; path rules use * and :placeholders.
      const source = line.startsWith('/') ? line : null;
      const pattern = source
        ? new RegExp(`^${source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:[A-Za-z]\w*/g, '[^/]+')}$`)
        : /^$a/;
      rules.push({ pattern, headers: [] });
    } else {
      const index = line.indexOf(':');
      rules.at(-1)?.headers.push([line.slice(0, index).trim(), line.slice(index + 1).trim()]);
    }
  }
  return rules;
}


function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

/** Resolves a request path like the Cloudflare handler: [status, file, location?]. */
export function resolve(pathname: string, root: string = ROOT): { status: number; file?: string; location?: string } {
  const path = normalize(decodeURIComponent(pathname)).split('\\').join('/');
  if (path.includes('..')) return { status: 400 };
  if (path.endsWith('/index.html')) return { status: 307, location: path.slice(0, -'index.html'.length) };
  if (path.endsWith('.html') && isFile(join(root, path))) return { status: 307, location: path.slice(0, -'.html'.length) };
  if (path.endsWith('/')) {
    if (isFile(join(root, path, 'index.html'))) return { status: 200, file: join(root, path, 'index.html') };
    if (path !== '/' && isFile(join(root, `${path.slice(0, -1)}.html`))) return { status: 307, location: path.slice(0, -1) };
  } else {
    if (isFile(join(root, path)) && !path.startsWith('/_headers') && !path.startsWith('/_redirects')) {
      return { status: 200, file: join(root, path) };
    }
    if (isFile(join(root, `${path}.html`))) return { status: 200, file: join(root, `${path}.html`) };
    if (isFile(join(root, path, 'index.html'))) return { status: 307, location: `${path}/` };
  }
  let dir = path;
  for (;;) {
    dir = dir.slice(0, dir.lastIndexOf('/'));
    const candidate = join(root, dir, '404.html');
    if (isFile(candidate)) return { status: 404, file: candidate };
    if (!dir) return { status: 404 };
  }
}

export interface DistServerOptions {
  /** The folder served, dist/ by default. */
  root?: string;
  /** Answers for some paths instead of the file in dist/ (the tests swap /sw.js). */
  overrides?: Map<string, string>;
  /** Called for every request, before the answer. */
  onRequest?: (method: string, pathname: string) => void;
}

/** The request handler of the static server (createDistServer wraps it in an HTTP server). */
export function distHandler(options: DistServerOptions = {}): RequestListener {
  const root = options.root ?? ROOT;
  const rules = loadRules(root);
  return (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    options.onRequest?.(request.method ?? 'GET', url.pathname);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    const result = resolve(url.pathname, root);
    for (const rule of rules) {
      if (rule.pattern.test(url.pathname)) for (const [name, value] of rule.headers) response.appendHeader(name, value);
    }
    if (result.location) {
      response.writeHead(result.status, { Location: result.location + url.search });
      response.end();
      return;
    }
    if (!result.file) {
      response.writeHead(result.status);
      response.end();
      return;
    }
    const override = options.overrides?.get(url.pathname);
    if (override !== undefined) {
      response.writeHead(200, { 'Content-Type': TYPES[extname(url.pathname)] ?? 'application/octet-stream' });
      response.end(override);
      return;
    }
    response.writeHead(result.status, { 'Content-Type': TYPES[extname(result.file)] ?? 'application/octet-stream' });
    createReadStream(result.file).pipe(response);
  };
}

export function createDistServer(options: DistServerOptions = {}): Server {
  return createServer(distHandler(options));
}

if (import.meta.main) {
  const server = createDistServer({
    onRequest: (method, pathname) => {
      if (method !== 'GET' && method !== 'HEAD') console.log(`[serve-dist] ${method} ${pathname} 405`);
    },
  });
  server.listen(PORT, '127.0.0.1', () => console.log(`dist servido em http://127.0.0.1:${PORT} (ready)`));
}
