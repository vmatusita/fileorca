// Gate: internal links and orphan pages. Every same-site href in dist/*.html must resolve to a
// file (or a directory index) in dist; every indexable page must be linked from another page.
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';
import { readFileSync } from 'node:fs';
import { DIST, Problems, allPages, listFiles, requireDist } from '../lib/dist.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';

requireDist();
const problems = new Problems();
const htmlFiles = listFiles(DIST).filter((file) => file.endsWith('.html'));
const inbound = new Map<string, Set<string>>();

function pagePathOf(file: string): string {
  const rel = `/${relative(DIST, file).split('\\').join('/')}`;
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

function resolves(path: string): boolean {
  if (path.endsWith('/')) return existsSync(join(DIST, path, 'index.html'));
  return existsSync(join(DIST, path)) || existsSync(join(DIST, `${path}.html`));
}

let checked = 0;
for (const file of htmlFiles) {
  const from = pagePathOf(file);
  const root = parse(readFileSync(file, 'utf8'));
  const refs = [
    ...root.querySelectorAll('a[href]').map((node) => node.getAttribute('href') ?? ''),
    ...root.querySelectorAll('link[href]').map((node) => node.getAttribute('href') ?? ''),
    ...root.querySelectorAll('script[src], img[src]').map((node) => node.getAttribute('src') ?? ''),
  ];
  for (const ref of refs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('data:')) continue;
    const url = new URL(ref, `${SITE_ORIGIN}${from}`);
    if (url.origin !== SITE_ORIGIN) continue;
    checked += 1;
    const path = decodeURI(url.pathname);
    if (!resolves(path)) problems.add(`${from} aponta ${path}, que não existe no dist`);
    else if (!path.endsWith('/') && !/\.\w+$/.test(path)) problems.add(`${from} aponta ${path} sem barra no fim`);
    if (path !== from) {
      const set = inbound.get(path) ?? new Set<string>();
      set.add(from);
      inbound.set(path, set);
    }
  }
}

for (const page of allPages()) {
  if (!page.route.indexable) continue;
  if (!(inbound.get(page.path)?.size)) problems.add(`${page.path} é órfã (nenhuma outra página linka para ela)`);
}
for (const file of htmlFiles) {
  const path = pagePathOf(file);
  if (!allPages().some((page) => page.path === path)) problems.add(`${path} existe no dist mas não está no mapa de rotas`);
}
problems.finish('links', `${checked} links internos em ${htmlFiles.length} páginas, nenhuma órfã`);
