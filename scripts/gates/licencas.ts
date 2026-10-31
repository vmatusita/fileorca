// Gate: licenses (CLAUDE.md, "Fora de toda run"; DECISOES § 13).
// 1. Direct `dependencies` (what reaches the browser) and direct `devDependencies` (build, test,
//    CI): each one must have an allowed license. LGPL-3.0 passes only as a separate file (item 3).
// 2. The real bundle (module list of every chunk under dist/_astro/, recorded by the build): every
//    package in it is listed on /licenses, with an allowed license and a license text; the list of
//    packages that come inside others (BUNDLED_TRANSITIVE) has no entry that left the bundle.
// 3. LGPL stays a separate file: the .wasm in dist/ is byte-identical to the package's and the glue
//    is not merged into a chunk with other code (SEPARATE_FILE_RULES).
// 4. The whole installed tree (license-checker-rseidelsohn): nothing AGPL/GPL/SSPL/non-commercial,
//    nothing unknown; LGPL only as a separate file; other permissive licenses of transitive build
//    tools are listed, since they never reach the browser.
// 5. /licenses, in every language, lists exactly the browser packages and carries every license text
//    and the LGPL notice with the links to the source.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { Problems, fileForPath, requireDist } from '../lib/dist.ts';
import {
  bundledPackageDirs,
  checkLicensesPage,
  checkRecordMatchesDist,
  checkSeparateFile,
  compareBundleWithList,
  readBundleRecord,
  readDistFacts,
  sha256,
} from '../lib/licenses-check.ts';
import { languagesOf, routeById } from '../../src/i18n/routes.ts';
import {
  SEPARATE_FILE_ONLY,
  SEPARATE_FILE_RULES,
  BUNDLED_TRANSITIVE,
  bundledPackages,
  browserPackages,
  buildPackages,
  findPackageDir,
  isAllowedLicense,
  isForbiddenLicense,
  isSeparateFileOnly,
  lgplSources,
  readPackageAt,
  type PackageLicense,
} from '../../src/platform/licenses.ts';

requireDist();
const problems = new Problems();
const browser = browserPackages();
const bundledList = bundledPackages();
const build = buildPackages();

// 2. The real bundle.
const record = readBundleRecord();
const bundledDirs = record ? bundledPackageDirs(record) : new Map<string, { dir: string; chunks: string[] }>();
if (!record) {
  problems.add('sem o registro do bundle (.cache/bundle-modules.json): rode pnpm build antes deste portão');
} else {
  for (const issue of checkRecordMatchesDist(record)) problems.add(issue);
  const direct = new Set(browser.map((pkg) => pkg.name));
  const transitive = bundledList.map((pkg) => pkg.name);
  for (const issue of compareBundleWithList(bundledDirs, { direct: [...direct], transitive })) problems.add(`bundle: ${issue}`);
  for (const [name] of bundledDirs) {
    if (build.some((pkg) => pkg.name === name)) problems.add(`bundle: ${name} é devDependency, mas está no bundle do navegador`);
  }
}

// What reaches the browser, with licenses: the direct dependencies and everything found in the bundle.
const reaching = new Map<string, PackageLicense>();
for (const pkg of [...browser, ...bundledList]) reaching.set(pkg.name, pkg);
for (const [name, { dir }] of bundledDirs) {
  if (!reaching.has(name) && existsSync(join(dir, 'package.json'))) reaching.set(name, readPackageAt(name, dir));
}

// 3. LGPL as a separate file.
const separateFileProblems = new Map<string, string[]>();
for (const pkg of reaching.values()) {
  if (!isSeparateFileOnly(pkg.license)) continue;
  const rule = SEPARATE_FILE_RULES.find((item) => item.package === pkg.name);
  const found: string[] = [];
  if (!rule) found.push(`${pkg.name} (${pkg.license}) não tem regra de arquivo separado em SEPARATE_FILE_RULES`);
  else if (record) {
    const dir = findPackageDir(pkg.name, process.cwd());
    const wasm = dir ? join(dir, rule.wasm) : null;
    if (!wasm || !existsSync(wasm)) found.push(`${pkg.name}: ${rule.wasm} não existe no pacote instalado`);
    else found.push(...checkSeparateFile(rule, sha256(wasm), readDistFacts(record)));
  }
  separateFileProblems.set(pkg.name, found);
  for (const issue of found) problems.add(`LGPL: ${issue}`);
}

// 1 and 2 (licenses): every package that reaches the browser.
for (const pkg of reaching.values()) {
  const separate = isSeparateFileOnly(pkg.license) && (separateFileProblems.get(pkg.name) ?? ['sem verificação']).length === 0;
  if (!isAllowedLicense(pkg.license) && !separate) problems.add(`navegador: ${pkg.name} ${pkg.license} fora da lista`);
  if (!pkg.text) problems.add(`navegador: ${pkg.name} sem arquivo de licença para a /licenses`);
}
for (const pkg of build) if (!isAllowedLicense(pkg.license)) problems.add(`devDependencies: ${pkg.name} ${pkg.license} fora da lista`);

// 4. The installed tree.
const require = createRequire(import.meta.url);
const checker = require.resolve('license-checker-rseidelsohn/bin/license-checker-rseidelsohn');
const tree = JSON.parse(execFileSync(process.execPath, [checker, '--json', '--excludePrivatePackages'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })) as Record<string, { licenses?: string | string[] }>;
const informative = new Map<string, string[]>();
for (const [id, info] of Object.entries(tree)) {
  const license = Array.isArray(info.licenses) ? info.licenses.join(' OR ') : info.licenses ?? 'UNKNOWN';
  if (isForbiddenLicense(license)) problems.add(`árvore: ${id} com licença proibida ${license}`);
  else if (/UNKNOWN|UNLICENSED|Custom/i.test(license)) problems.add(`árvore: ${id} com licença desconhecida (${license})`);
  else if ((SEPARATE_FILE_ONLY as readonly string[]).some((lgpl) => license.includes(lgpl))) {
    // An LGPL package that reaches the browser was judged above (item 3); only the others are news here.
    if (!reaching.has(id.slice(0, id.lastIndexOf('@')))) informative.set(license, [...(informative.get(license) ?? []), id]);
  } else if (!isAllowedLicense(license)) {
    informative.set(license, [...(informative.get(license) ?? []), id]);
  }
}

// 5. The rendered page, in every language.
const libheif = reaching.get('libheif-js');
const lgpl = libheif && isSeparateFileOnly(libheif.license) ? { sources: lgplSources(libheif.version).map((source) => source.url) } : null;
const route = routeById('licenses');
const listed = [...browser, ...bundledList];
let pages = 0;
for (const lang of languagesOf(route)) {
  const path = route.paths[lang] ?? '/';
  const file = fileForPath(path);
  if (!existsSync(file)) {
    problems.add(`${path} não existe no dist`);
    continue;
  }
  pages += 1;
  const issues = checkLicensesPage(readFileSync(file, 'utf8'), listed, build.map((pkg) => pkg.name), lgpl);
  for (const issue of issues) problems.add(`${path}: ${issue}`);
}

if (informative.size) {
  console.log('licenças: transitivas de ferramentas de build fora da lista principal (não vão ao navegador):');
  for (const [license, ids] of informative) console.log(`  ${license}: ${ids.join(', ')}`);
}
problems.finish(
  'licenças',
  `${browser.length} dependências de navegador, ${BUNDLED_TRANSITIVE.length} dentro de outras, ${bundledDirs.size} pacotes no bundle, ${build.length} de build, ${Object.keys(tree).length} pacotes na árvore, /licenses em ${pages} idiomas`,
);
