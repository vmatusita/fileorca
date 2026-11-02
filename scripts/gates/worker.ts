// Gate: the Worker has no code (ADR-001, item 2). wrangler.jsonc has exactly the allowed fields,
// including the empty previews block of ADR-002, and nothing in the repository or in dist/ could
// become Worker code.
import { existsSync, readFileSync } from 'node:fs';
import { DIST, Problems, listFiles, requireDist } from '../lib/dist.ts';
import { parseJsonc } from '../lib/jsonc.ts';

requireDist();
const problems = new Problems();
const config = parseJsonc(readFileSync('wrangler.jsonc', 'utf8')) as Record<string, unknown>;
const expectedKeys = ['$schema', 'assets', 'compatibility_date', 'name', 'preview_urls', 'previews', 'workers_dev'];
const keys = Object.keys(config).sort();
if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) problems.add(`wrangler.jsonc com campos ${keys.join(', ')}`);
if (JSON.stringify(config['previews']) !== '{}') problems.add(`previews deve ser um objeto vazio: ${JSON.stringify(config['previews'])}`);
if (config['name'] !== 'fileorca') problems.add('name diferente de "fileorca"');
if (typeof config['compatibility_date'] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(config['compatibility_date'])) {
  problems.add('compatibility_date não é uma data fixa');
}
if (config['workers_dev'] !== true || config['preview_urls'] !== true) problems.add('workers_dev e preview_urls devem ser true');
const assets = config['assets'] as Record<string, unknown> | undefined;
if (JSON.stringify(assets) !== JSON.stringify({ directory: './dist', not_found_handling: '404-page', html_handling: 'auto-trailing-slash' })) {
  problems.add(`assets fora do contrato: ${JSON.stringify(assets)}`);
}
if ('main' in config) problems.add('wrangler.jsonc tem main');
if (JSON.stringify(config).includes('run_worker_first')) problems.add('wrangler.jsonc tem run_worker_first');
for (const path of ['functions', '_worker.js', 'public/_worker.js', 'src/worker.ts', 'wrangler.toml', 'wrangler.json']) {
  if (existsSync(path)) problems.add(`existe ${path}`);
}
for (const file of listFiles(DIST)) {
  const name = file.split(/[\\/]/).pop() ?? '';
  if (name === '_worker.js' || /[\\/]functions[\\/]/.test(file)) problems.add(`dist tem ${file}`);
  if (name === '_routes.json') problems.add(`dist tem ${file} (rotas de função)`);
}
if (!existsSync(`${DIST}/404.html`) || !existsSync(`${DIST}/pt/404.html`) || !existsSync(`${DIST}/es/404.html`)) {
  problems.add('faltam dist/404.html, dist/pt/404.html ou dist/es/404.html');
}
if (existsSync(`${DIST}/pt/404/index.html`) || existsSync(`${DIST}/es/404/index.html`)) problems.add('404 emitido como pasta (404/index.html)');
// F8 (DECISOES § 287): /sw.js is the browser's service worker, a static file of the assets like any other. It is never
// the Worker's code: no main points at it, and it holds no Worker entry (export default, fetch handler of a module).
const sw = existsSync(`${DIST}/sw.js`) ? readFileSync(`${DIST}/sw.js`, 'utf8') : null;
if (sw === null) problems.add('dist/sw.js não existe');
else {
  if (!sw.startsWith('// /sw.js of fileorca.com, built by src/sw/build.ts')) problems.add('dist/sw.js não é o que src/sw/build.ts gera');
  if (/^\s*(?:import|export)\b/m.test(sw)) problems.add('dist/sw.js tem import ou export (seria módulo, não o script clássico do navegador)');
  if (JSON.stringify(config).includes('sw.js')) problems.add('wrangler.jsonc cita sw.js');
}
problems.finish('worker sem código', 'só assets em ./dist, sem main, sem run_worker_first, sem _worker.js e sem functions/; o sw.js é arquivo estático');
