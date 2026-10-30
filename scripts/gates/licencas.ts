// Gate: licenses (CLAUDE.md, "Fora de toda run"; DECISOES § 13).
// 1. Direct `dependencies` (what reaches the browser) and direct `devDependencies` (build, test,
//    CI): each one must have an allowed license.
// 2. The whole installed tree (license-checker-rseidelsohn): nothing AGPL/GPL/SSPL/non-commercial,
//    nothing unknown; LGPL only as a separate file; other permissive licenses of transitive build
//    tools are listed, since they never reach the browser.
// 3. /licenses lists exactly the browser dependencies.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Problems } from '../lib/dist.ts';
import {
  SEPARATE_FILE_ONLY,
  browserPackages,
  buildPackages,
  isAllowedLicense,
  isForbiddenLicense,
} from '../../src/platform/licenses.ts';

const problems = new Problems();
const browser = browserPackages();
const build = buildPackages();
for (const pkg of browser) {
  if (!isAllowedLicense(pkg.license)) problems.add(`dependencies: ${pkg.name} ${pkg.license} fora da lista`);
  if (!pkg.text) problems.add(`dependencies: ${pkg.name} sem arquivo de licença para a /licenses`);
}
for (const pkg of build) if (!isAllowedLicense(pkg.license)) problems.add(`devDependencies: ${pkg.name} ${pkg.license} fora da lista`);

const require = createRequire(import.meta.url);
const checker = require.resolve('license-checker-rseidelsohn/bin/license-checker-rseidelsohn');
const tree = JSON.parse(execFileSync(process.execPath, [checker, '--json', '--excludePrivatePackages'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })) as Record<string, { licenses?: string | string[] }>;
const informative = new Map<string, string[]>();
for (const [id, info] of Object.entries(tree)) {
  const license = Array.isArray(info.licenses) ? info.licenses.join(' OR ') : info.licenses ?? 'UNKNOWN';
  if (isForbiddenLicense(license)) problems.add(`árvore: ${id} com licença proibida ${license}`);
  else if (/UNKNOWN|UNLICENSED|Custom/i.test(license)) problems.add(`árvore: ${id} com licença desconhecida (${license})`);
  else if ((SEPARATE_FILE_ONLY as readonly string[]).some((lgpl) => license.includes(lgpl))) {
    informative.set(license, [...(informative.get(license) ?? []), id]);
  } else if (!isAllowedLicense(license)) {
    informative.set(license, [...(informative.get(license) ?? []), id]);
  }
}

const page = 'dist/licenses/index.html';
if (existsSync(page)) {
  const html = readFileSync(page, 'utf8');
  for (const pkg of browser) if (!html.includes(`>${pkg.name}<`)) problems.add(`/licenses não lista ${pkg.name}`);
  for (const pkg of build) if (html.includes(`>${pkg.name}<`)) problems.add(`/licenses lista ${pkg.name}, que é só de build`);
}

if (informative.size) {
  console.log('licenças: transitivas de ferramentas de build fora da lista principal (não vão ao navegador):');
  for (const [license, ids] of informative) console.log(`  ${license}: ${ids.join(', ')}`);
}
problems.finish('licenças', `${browser.length} dependências de navegador, ${build.length} de build, ${Object.keys(tree).length} pacotes na árvore`);
