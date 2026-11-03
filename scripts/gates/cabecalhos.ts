// Gate: the generated dist/_headers and dist/_redirects match src/platform/headers.ts, with the
// security headers, no COOP/COEP, noindex on every workers.dev URL and on the whole site while
// LAUNCHED = false; build.txt carries a commit.
import { existsSync, readFileSync } from 'node:fs';
import { DIST, Problems, requireDist } from '../lib/dist.ts';
import { headerBlocks } from '../lib/headers-file.ts';
import { SW_SCRIPT_HEADERS, WORKERS_DEV_PATTERN, headerRules, noindexPagePaths, redirectRules, toHeadersFile, toRedirectsFile } from '../../src/platform/headers.ts';
import { LAUNCHED } from '../../src/platform/site.ts';

requireDist();
const problems = new Problems();
const headers = readFileSync(`${DIST}/_headers`, 'utf8');
if (headers !== toHeadersFile(headerRules({ launched: LAUNCHED }))) problems.add('dist/_headers difere do que src/platform/headers.ts gera');
const lower = headers.toLowerCase();
for (const banned of ['cross-origin-opener-policy', 'cross-origin-embedder-policy']) {
  if (lower.includes(banned)) problems.add(`dist/_headers tem ${banned}`);
}
const blocks = headerBlocks(headers);
const site = blocks.get('/*') ?? [];
for (const expected of [
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: strict-origin-when-cross-origin',
  "Content-Security-Policy: frame-ancestors 'self'",
  'Strict-Transport-Security: max-age=31536000; includeSubDomains',
]) {
  if (!site.includes(expected)) problems.add(`/* sem "${expected}"`);
}
if (!LAUNCHED && !site.includes('X-Robots-Tag: noindex')) problems.add('LAUNCHED = false e /* sem X-Robots-Tag: noindex');
if (LAUNCHED && site.some((line) => line.startsWith('X-Robots-Tag'))) problems.add('LAUNCHED = true e /* ainda com X-Robots-Tag');
if (!(blocks.get(WORKERS_DEV_PATTERN) ?? []).includes('X-Robots-Tag: noindex')) problems.add(`${WORKERS_DEV_PATTERN} sem noindex`);
// F8: /sw.js revalidates on every update check, and the offline and share pages stay out of the index (DECISOES § 287).
if (!(blocks.get('/sw.js') ?? []).includes(`Cache-Control: ${SW_SCRIPT_HEADERS['Cache-Control']}`)) problems.add('/sw.js sem Cache-Control: no-cache');
if (!existsSync(`${DIST}/sw.js`)) problems.add('dist/sw.js não existe');
for (const path of noindexPagePaths()) {
  if (!(blocks.get(path) ?? []).includes('X-Robots-Tag: noindex')) problems.add(`${path} sem X-Robots-Tag: noindex`);
}
if (blocks.size > 100) problems.add(`_headers com ${blocks.size} regras (limite do Cloudflare: 100)`);
if (readFileSync(`${DIST}/_redirects`, 'utf8') !== toRedirectsFile(redirectRules())) problems.add('dist/_redirects difere do gerado');
const build = existsSync(`${DIST}/build.txt`) ? readFileSync(`${DIST}/build.txt`, 'utf8') : '';
if (!/^[0-9a-f]{40}\n$/.test(build)) problems.add(`dist/build.txt sem um commit (${JSON.stringify(build)})`);
problems.finish('cabeçalhos', `${blocks.size} regras, LAUNCHED = ${LAUNCHED}, build.txt ${build.slice(0, 7)}`);
