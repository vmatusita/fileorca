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
// 6. (F5a) The libraries of the PDF tools: pdfjs-dist and @neslinesli93/qpdf-wasm are in the bundle; every .wasm in
//    dist/_astro/ and every PDF.js data file in dist/_astro/pdfjs/<version>/ (decoders, CMaps, fonts) is byte-identical
//    to the file of the package it comes from, and nothing /licenses has no text for is served; a text that says
//    "in x.wasm" has that x.wasm in dist/.
// 7. (DECISOES § 179) A package compiled into another package's prebuilt file (core-js inside the legacy build of PDF.js,
//    which the bundle record sees only as pdfjs-dist) has its own license text on /licenses, of the version the code names.
// 8. (F7, decision 8) The QR code generator's library stays on its page: qrcode and dijkstrajs in one chunk, the same one,
//    never the shared island chunk every tool page loads, and of qrcode only the matrix (lib/core/).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join } from 'node:path';
import { Problems, fileForPath, requireDist } from '../lib/dist.ts';
import {
  bundledPackageDirs,
  checkLicensesPage,
  checkPdfjsData,
  checkRecordMatchesDist,
  checkRequiredInBundle,
  checkSeparateFile,
  checkWasmIdentity,
  checkWasmTexts,
  checkEmbeddedTexts,
  checkQrBundle,
  compareBundleWithList,
  readBundleRecord,
  readDistFacts,
  readPackageHashes,
  readPdfjsServed,
  readPrebuiltFiles,
  readWasmSources,
  sha256,
  wasmStem,
} from '../lib/licenses-check.ts';
import { pdfjsDataFiles, pdfjsPackageDir, pdfjsVersion } from '../../src/platform/pdfjs-data.ts';
import { languagesOf, routeById } from '../../src/i18n/routes.ts';
import {
  SEPARATE_FILE_ONLY,
  SEPARATE_FILE_RULES,
  BUNDLED_TRANSITIVE,
  UPSTREAM_TEXTS,
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

// 6. The PDF tools (F5a): the two libraries in the bundle, every .wasm and every PDF.js data file identical to its package's.
const listedNames = new Set([...browser, ...bundledList].map((pkg) => pkg.name));
let distWasm = 0;
let pdfjsFiles = 0;
let prebuilt: ReturnType<typeof readPrebuiltFiles> = [];
if (record) {
  for (const issue of checkRequiredInBundle(bundledDirs)) problems.add(`PDF: ${issue}`);
  // 8. (F7) The QR code generator.
  for (const issue of checkQrBundle(record)) problems.add(`QR: ${issue}`);
  const facts = readDistFacts(record);
  distWasm = facts.wasm.filter((entry) => !entry.file.startsWith('_astro/pdfjs/')).length;
  const sourceDirs = new Map<string, string>();
  for (const pkg of browser) {
    const dir = findPackageDir(pkg.name, process.cwd());
    if (dir) sourceDirs.set(pkg.name, dir);
  }
  for (const [name, { dir }] of bundledDirs) if (!sourceDirs.has(name)) sourceDirs.set(name, dir);
  const sources = [...sourceDirs].flatMap(([name, dir]) => readWasmSources(name, dir));
  for (const issue of checkWasmIdentity(facts.wasm, sources, listedNames)) problems.add(`.wasm: ${issue}`);
  // The names of the .wasm the site serves, without the hash of the bundler (qpdf.wasm, jbig2.wasm), for the texts of /licenses.
  const served = new Set(facts.wasm.map((entry) => (wasmStem(entry.file) ? `${wasmStem(entry.file)}.wasm` : basename(entry.file))));
  for (const issue of checkWasmTexts([...browser, ...bundledList], served)) problems.add(`.wasm: ${issue}`);
  // 7. (DECISOES § 179) What a prebuilt file of a package carries inside it (core-js in the PDF.js legacy build).
  prebuilt = readPrebuiltFiles(record);
  for (const issue of checkEmbeddedTexts(prebuilt, UPSTREAM_TEXTS)) problems.add(`dentro de outro pacote: ${issue}`);
}
{
  const version = pdfjsVersion();
  const { versions, served } = readPdfjsServed(version);
  pdfjsFiles = served.length;
  const source = readPackageHashes(pdfjsPackageDir(), served.map((entry) => entry.file));
  for (const issue of checkPdfjsData({ versions, version, served, source, expected: pdfjsDataFiles() })) problems.add(`PDF.js: ${issue}`);
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
  `${browser.length} dependências de navegador, ${BUNDLED_TRANSITIVE.length} dentro de outras, ${bundledDirs.size} pacotes no bundle, ${prebuilt.flatMap((file) => file.embedded).filter((name, i, all) => all.indexOf(name) === i).length} compilados dentro de ${prebuilt.length} arquivos prontos, ${distWasm} .wasm e ${pdfjsFiles} arquivos do PDF.js idênticos aos dos pacotes, ${build.length} de build, ${Object.keys(tree).length} pacotes na árvore, /licenses em ${pages} idiomas`,
);
