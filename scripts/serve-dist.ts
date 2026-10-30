// Static server for dist/ used by Playwright and Lighthouse CI. It mimics the Cloudflare assets
// handler of wrangler.jsonc: html_handling "auto-trailing-slash" (307 to the canonical form),
// not_found_handling "404-page" (nearest 404.html, status 404) and the path rules of _headers.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
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

function loadRules(): Rule[] {
  const path = join(ROOT, '_headers');
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

const rules = loadRules();

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

/** Resolves a request path like the Cloudflare handler: [status, file, location?]. */
export function resolve(pathname: string): { status: number; file?: string; location?: string } {
  const path = normalize(decodeURIComponent(pathname)).split('\\').join('/');
  if (path.includes('..')) return { status: 400 };
  if (path.endsWith('/index.html')) return { status: 307, location: path.slice(0, -'index.html'.length) };
  if (path.endsWith('.html') && isFile(join(ROOT, path))) return { status: 307, location: path.slice(0, -'.html'.length) };
  if (path.endsWith('/')) {
    if (isFile(join(ROOT, path, 'index.html'))) return { status: 200, file: join(ROOT, path, 'index.html') };
    if (path !== '/' && isFile(join(ROOT, `${path.slice(0, -1)}.html`))) return { status: 307, location: path.slice(0, -1) };
  } else {
    if (isFile(join(ROOT, path)) && !path.startsWith('/_headers') && !path.startsWith('/_redirects')) {
      return { status: 200, file: join(ROOT, path) };
    }
    if (isFile(join(ROOT, `${path}.html`))) return { status: 200, file: join(ROOT, `${path}.html`) };
    if (isFile(join(ROOT, path, 'index.html'))) return { status: 307, location: `${path}/` };
  }
  let dir = path;
  for (;;) {
    dir = dir.slice(0, dir.lastIndexOf('/'));
    const candidate = join(ROOT, dir, '404.html');
    if (isFile(candidate)) return { status: 404, file: candidate };
    if (!dir) return { status: 404 };
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const result = resolve(url.pathname);
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
  response.writeHead(result.status, { 'Content-Type': TYPES[extname(result.file)] ?? 'application/octet-stream' });
  createReadStream(result.file).pipe(response);
});

if (import.meta.main) {
  server.listen(PORT, '127.0.0.1', () => console.log(`dist servido em http://127.0.0.1:${PORT} (ready)`));
}
