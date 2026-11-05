// Gate: internal links and orphan pages. Every same-site href or src in dist/*.html must resolve
// to a file (or a directory index) in dist; every indexable page must be linked by an <a> on a
// page of another route (its own translations do not count; scripts/lib/links-graph.ts). F13b (DECISOES § I-3): every
// link to a part of a page (#id, on the same page or on another of the site) leads to an id that the page has.
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';
import { DIST, Problems, allPages, listFiles, requireDist } from '../lib/dist.ts';
import { missingFragments, orphanPaths, type PageLinks } from '../lib/links-graph.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';

requireDist();
const problems = new Problems();
const htmlFiles = listFiles(DIST).filter((file) => file.endsWith('.html'));
const pages = allPages();
const routeByPath = new Map(pages.map((page) => [page.path, page.route.id]));

function pagePathOf(file: string): string {
  const rel = `/${relative(DIST, file).split('\\').join('/')}`;
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

function resolves(path: string): boolean {
  if (path.endsWith('/')) return existsSync(join(DIST, path, 'index.html'));
  return existsSync(join(DIST, path)) || existsSync(join(DIST, `${path}.html`));
}

function sameSite(ref: string, from: string): string | null {
  if (!ref || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('data:')) return null;
  const url = new URL(ref, `${SITE_ORIGIN}${from}`);
  return url.origin === SITE_ORIGIN ? decodeURI(url.pathname) : null;
}

let checked = 0;
const graph: PageLinks[] = [];
// F13b (DECISOES § I-3): the ids of every page, so a link to a part of a page ("#id", the index of the legal pages, the
// groups of the guides hub) leads to an element that exists.
const roots = new Map(htmlFiles.map((file) => [pagePathOf(file), parse(readFileSync(file, 'utf8'))]));
const ids = new Map([...roots].map(([path, root]) => [path, new Set(root.querySelectorAll('[id]').map((node) => node.id))]));
let fragments = 0;
for (const file of htmlFiles) {
  const from = pagePathOf(file);
  const routeId = routeByPath.get(from);
  if (!routeId) {
    problems.add(`${from} existe no dist mas não está no mapa de rotas`);
    continue;
  }
  const root = roots.get(from) ?? parse(readFileSync(file, 'utf8'));
  const hrefs = root.querySelectorAll('a[href*="#"]').map((node) => node.getAttribute('href') ?? '').filter((href) => href.startsWith('#') || href.startsWith('/'));
  fragments += hrefs.length;
  for (const href of missingFragments(from, hrefs, ids)) problems.add(`${from} aponta ${href}, e a página não tem esse id`);
  const anchors: string[] = [];
  const refs = [
    ...root.querySelectorAll('a[href]').map((node) => ({ ref: node.getAttribute('href') ?? '', anchor: true })),
    ...root.querySelectorAll('link[href]').map((node) => ({ ref: node.getAttribute('href') ?? '', anchor: false })),
    ...root.querySelectorAll('script[src], img[src]').map((node) => ({ ref: node.getAttribute('src') ?? '', anchor: false })),
  ];
  for (const { ref, anchor } of refs) {
    const path = sameSite(ref, from);
    if (path === null) continue;
    checked += 1;
    if (!resolves(path)) problems.add(`${from} aponta ${path}, que não existe no dist`);
    else if (anchor && !path.endsWith('/') && !/\.\w+$/.test(path)) problems.add(`${from} aponta ${path} sem barra no fim`);
    if (anchor) anchors.push(path);
  }
  graph.push({ path: from, routeId, anchors });
}

const indexable = new Set(pages.filter((page) => page.route.indexable).map((page) => page.path));
for (const path of orphanPaths(graph, indexable)) problems.add(`${path} é órfã (nenhuma página de outra rota linka para ela)`);
problems.finish('links', `${checked} links internos em ${htmlFiles.length} páginas, nenhuma órfã, ${fragments} links para uma parte de página, todos com o id`);
