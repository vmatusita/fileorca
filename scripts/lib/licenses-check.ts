// Checks behind `pnpm gate:licencas` that are about the real bundle (DECISOES § 13): which packages are
// in it, whether /licenses lists them, whether an LGPL library stays a separate file and, from the F5a, whether every
// .wasm and every PDF.js data file in dist/ is byte-identical to the file of its package. The checks are
// plain functions over plain data, so tests can feed them a fake dist; the readers at the bottom turn
// dist/ and the bundle record (src/platform/bundle-record.ts) into that data.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { parse } from 'node-html-parser';
import { BUNDLE_RECORD, type BundleRecord } from '../../src/platform/bundle-record.ts';
import type { LicenseText, SeparateFileRule } from '../../src/platform/licenses.ts';
import { listFiles } from './dist.ts';

export type ModuleKind = 'package' | 'source' | 'virtual';

export interface ModuleInfo {
  kind: ModuleKind;
  /** For a package: its name and the folder it was bundled from. For a first-party module: its path from the project root. */
  name: string;
  dir: string;
}

function normalise(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * What a module id from the bundle record is. A package is anything under node_modules (the last
 * node_modules in the path wins, which is how pnpm nests them); a virtual module is one the bundler
 * made up (`\0vite/preload-helper`, the empty stand-in for `fs` in a browser); the rest is first-party.
 */
export function classifyModule(id: string, root = process.cwd()): ModuleInfo {
  const clean = normalise(id).replace(/[?#].*$/, '');
  const marker = '/node_modules/';
  const at = clean.lastIndexOf(marker);
  if (at >= 0) {
    const parts = clean.slice(at + marker.length).split('/');
    const name = parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1] ?? ''}` : (parts[0] ?? '');
    return { kind: 'package', name, dir: clean.slice(0, at + marker.length + name.length) };
  }
  const base = clean.split('/').pop() ?? '';
  if (base.startsWith('__vite') || id.includes('\0') || /^(vite|rolldown)\//.test(clean)) return { kind: 'virtual', name: clean, dir: '' };
  const rootPath = `${normalise(root).replace(/\/$/, '')}/`;
  const rel = clean.startsWith(rootPath) ? clean.slice(rootPath.length) : clean.replace(/^(\.\.\/)+/, '');
  return { kind: 'source', name: rel, dir: '' };
}

/** package name -> folder it was bundled from and the chunks it is in, over the whole record. */
export function bundledPackageDirs(record: BundleRecord, root = process.cwd()): Map<string, { dir: string; chunks: string[] }> {
  const found = new Map<string, { dir: string; chunks: string[] }>();
  for (const [chunk, ids] of Object.entries(record)) {
    for (const id of ids) {
      const info = classifyModule(id, root);
      if (info.kind !== 'package') continue;
      const entry = found.get(info.name) ?? { dir: info.dir, chunks: [] };
      if (!entry.chunks.includes(chunk)) entry.chunks.push(chunk);
      found.set(info.name, entry);
    }
  }
  return found;
}

/** The packages in the bundle that /licenses does not list, and the listed transitive ones that left the bundle. */
export function compareBundleWithList(
  bundled: Map<string, { chunks: string[] }>,
  listed: { direct: readonly string[]; transitive: readonly string[] },
): string[] {
  const problems: string[] = [];
  const known = new Set([...listed.direct, ...listed.transitive]);
  for (const [name, { chunks }] of [...bundled].sort(([a], [b]) => a.localeCompare(b))) {
    if (!known.has(name)) problems.push(`${name} está no bundle (${chunks.join(', ')}) e a /licenses não o lista`);
  }
  for (const name of listed.transitive) {
    if (!bundled.has(name)) problems.push(`${name} está na lista de transitivos da /licenses, mas não está mais no bundle`);
  }
  return problems;
}

export interface DistFacts {
  /** Every .wasm in dist/ with its SHA-256; `file` is relative to dist/. */
  wasm: { file: string; sha256: string }[];
  /** Every JavaScript chunk of the record. `inlineWasm` is true when the chunk carries a base64 WebAssembly module. */
  chunks: { file: string; modules: string[]; inlineWasm: boolean }[];
}

/**
 * LGPL-3.0 stays allowed only as a separate file: the library's .wasm in dist/ is byte-identical to the
 * package's, and its JavaScript glue is not merged into a chunk with other code (another package, or
 * first-party code other than the loader the rule names).
 */
export function checkSeparateFile(rule: SeparateFileRule, packageWasmSha256: string, facts: DistFacts, root = process.cwd()): string[] {
  const problems: string[] = [];
  const stem = basename(rule.wasm, '.wasm');
  const copies = facts.wasm.filter((entry) => {
    const name = basename(entry.file);
    return name.endsWith('.wasm') && (name.startsWith(`${stem}.`) || name.startsWith(`${stem}-`));
  });
  // The chunks that carry the glue module itself (the package's ?url import of the .wasm is only a string
  // and may sit with its loader).
  const glueChunks = facts.chunks.filter((chunk) => chunk.modules.some((id) => {
    const info = classifyModule(id, root);
    return info.kind === 'package' && info.name === rule.package && normalise(id).replace(/[?#].*$/, '').endsWith(`/${rule.glue}`);
  }));

  if (copies.length === 0 && glueChunks.length === 0) return problems; // the library is not in the bundle at all
  if (copies.length === 0) problems.push(`${rule.package}: o ${basename(rule.wasm)} não está no dist como arquivo separado (embutido no JS ou ausente)`);
  for (const copy of copies) {
    if (copy.sha256 !== packageWasmSha256) problems.push(`${rule.package}: dist/${copy.file} difere do ${rule.wasm} do pacote (SHA-256 ${copy.sha256.slice(0, 12)}… no lugar de ${packageWasmSha256.slice(0, 12)}…)`);
  }
  if (glueChunks.length === 0) problems.push(`${rule.package}: o .wasm está no dist, mas nenhum chunk traz o ${rule.glue}`);
  for (const chunk of glueChunks) {
    if (chunk.inlineWasm) problems.push(`${rule.package}: ${chunk.file} traz um módulo WebAssembly embutido em base64`);
    for (const id of chunk.modules) {
      const info = classifyModule(id, root);
      if (info.kind === 'package' && info.name !== rule.package) problems.push(`${rule.package}: o ${rule.glue} divide o chunk ${chunk.file} com o pacote ${info.name}`);
      if (info.kind === 'source' && !rule.loaders.includes(info.name)) problems.push(`${rule.package}: o ${rule.glue} divide o chunk ${chunk.file} com código do projeto (${info.name})`);
    }
  }
  return problems;
}

// --- The libraries of the PDF tools (F5a, DECISOES § 163) ---

/** The two libraries the PDF tools bring: both must be in the bundle, or the PDF pages run on nothing. */
export const PDF_PACKAGES: readonly string[] = ['pdfjs-dist', '@neslinesli93/qpdf-wasm'];

/** Every package that must be in the bundle but is not. */
export function checkRequiredInBundle(bundled: ReadonlyMap<string, unknown>, required: readonly string[] = PDF_PACKAGES): string[] {
  return required.filter((name) => !bundled.has(name)).map((name) => `${name} não está no bundle, mas as ferramentas de PDF dependem dele`);
}

// --- The library of the QR code generator (F7, decision 8) ---

/** What the QR code generator brings to the browser: qrcode and the one package it carries (dijkstrajs). */
export const QR_PACKAGES: readonly string[] = ['qrcode', 'dijkstrajs'];

/** The chunk every tool page loads (astro.config.ts, the 'island' group): the QR library never goes into it. */
export const SHARED_ISLAND_CHUNK = /^_astro\/island[.-][\w-]+\.js$/;

/**
 * The QR library stays on its page: qrcode and dijkstrajs are both in the bundle, each in one chunk only, the same one, and
 * that chunk is not the shared `island` (which would put them on every image, PDF and calculator page). Of qrcode, only the
 * matrix (`lib/core/`) is bundled: the page draws the code itself, so the renderers of the package's index stay out.
 */
export function checkQrBundle(record: BundleRecord, root = process.cwd()): string[] {
  const problems: string[] = [];
  const found = new Map<string, Set<string>>();
  for (const [chunk, ids] of Object.entries(record)) {
    for (const id of ids) {
      const info = classifyModule(id, root);
      if (info.kind !== 'package' || !QR_PACKAGES.includes(info.name)) continue;
      found.set(info.name, (found.get(info.name) ?? new Set()).add(chunk));
      const path = normalise(id).replace(/[?#].*$/, '');
      if (info.name === 'qrcode' && !path.startsWith(`${info.dir}/lib/core/`)) problems.push(`qrcode traz ${path.slice(info.dir.length + 1)} ao bundle, fora de lib/core/ (só a matriz é usada)`);
    }
  }
  for (const name of QR_PACKAGES) {
    const chunks = [...(found.get(name) ?? [])].sort();
    if (chunks.length === 0) problems.push(`${name} não está no bundle, mas o gerador de QR code depende dele`);
    for (const chunk of chunks.filter((file) => SHARED_ISLAND_CHUNK.test(file))) problems.push(`${name} está no chunk compartilhado ${chunk}, que toda página de ferramenta carrega`);
    if (chunks.length > 1) problems.push(`${name} está em ${chunks.length} chunks (${chunks.join(', ')}), pede 1`);
  }
  const homes = new Set(QR_PACKAGES.flatMap((name) => [...(found.get(name) ?? [])]));
  if (homes.size > 1 && QR_PACKAGES.every((name) => found.get(name)?.size === 1)) problems.push(`qrcode e dijkstrajs estão em chunks diferentes (${[...homes].sort().join(', ')}), pede o mesmo`);
  return problems;
}

/**
 * The files of pdfjs-dist the site may serve, and nothing else (DECISOES § 144): the two WebAssembly decoders, the
 * CMaps and the Foxit fonts. Each is a kind whose license text is on /licenses; the Liberation fonts (GPL-2.0), the
 * ICC profile, qcms and the scripting sandbox have no place here.
 */
export const PDFJS_SERVED: readonly { kind: string; pattern: RegExp }[] = [
  { kind: 'decodificador WebAssembly', pattern: /^wasm\/(?:jbig2|openjpeg)\.wasm$/ },
  { kind: 'CMap', pattern: /^cmaps\/[\w-]+\.bcmap$/ },
  { kind: 'fonte padrão da Foxit', pattern: /^standard_fonts\/Foxit[A-Za-z]+\.pfb$/ },
];

export interface ServedFile {
  /** Path inside the folder (relative to dist/_astro/pdfjs/<version>/ or to the package). */
  file: string;
  sha256: string;
}

/**
 * The PDF.js data files in dist/ against the package (F5a): the site copies them unchanged, so each one is
 * byte-identical to the file of the installed pdfjs-dist, the set is exactly what the build means to copy, every
 * file is of a kind /licenses has a text for, and the folder carries the version of the package.
 * `served` and `source` come from dist/_astro/pdfjs/<version>/ and from node_modules/pdfjs-dist.
 */
export function checkPdfjsData(input: { versions: readonly string[]; version: string; served: readonly ServedFile[]; source: ReadonlyMap<string, string>; expected: readonly string[] }): string[] {
  const problems: string[] = [];
  if (input.versions.length !== 1 || input.versions[0] !== input.version) {
    problems.push(`dist/_astro/pdfjs/ tem ${input.versions.length ? input.versions.join(', ') : 'nenhuma pasta'}, esperado só ${input.version} (a versão do pdfjs-dist instalado)`);
  }
  const names = new Set(input.served.map((entry) => entry.file));
  for (const file of input.expected) if (!names.has(file)) problems.push(`falta ${file} no dist (o build deveria copiá-lo)`);
  for (const { file, sha256: served } of input.served) {
    const kind = PDFJS_SERVED.find((entry) => entry.pattern.test(file));
    if (!kind) problems.push(`${file} no dist não é de um tipo que a /licenses cobre (${PDFJS_SERVED.map((entry) => entry.kind).join(', ')})`);
    const original = input.source.get(file);
    if (original === undefined) problems.push(`${file} no dist não existe no pdfjs-dist instalado`);
    else if (original !== served) problems.push(`${file} no dist difere do arquivo do pdfjs-dist (SHA-256 ${served.slice(0, 12)}… no lugar de ${original.slice(0, 12)}…)`);
  }
  return problems;
}

/** `qpdf-C3Giu3T4.wasm` and `qpdf.C3Giu3T4.wasm` are the `qpdf.wasm` of a package: the stem, or null for a name that does not fit. */
export function wasmStem(name: string): string | null {
  return /^(.+?)[-.][A-Za-z0-9_-]{8}\.wasm$/.exec(basename(name))?.[1] ?? null;
}

export interface WasmSource {
  pkg: string;
  /** Path inside the package. */
  file: string;
  sha256: string;
}

/**
 * Every .wasm the bundler put in dist/_astro (F5a): it keeps the name of a .wasm of a package that reaches the
 * browser, its bytes are identical to that file, and the package is one /licenses lists, so the license text of
 * what is compiled into it is on the page. The ones under dist/_astro/pdfjs/ are the PDF.js data (checkPdfjsData);
 * a .wasm anywhere else has no business in dist/.
 */
export function checkWasmIdentity(dist: readonly { file: string; sha256: string }[], sources: readonly WasmSource[], listed: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  for (const { file, sha256: served } of dist) {
    const path = normalise(file);
    if (path.startsWith('_astro/pdfjs/')) continue;
    if (!/^_astro\/[^/]+\.wasm$/.test(path)) {
      problems.push(`dist/${path}: .wasm fora de _astro/`);
      continue;
    }
    const stem = wasmStem(path);
    if (!stem) {
      problems.push(`dist/${path}: o nome não segue o padrão <nome>-<hash>.wasm do bundler`);
      continue;
    }
    const candidates = sources.filter((source) => basename(source.file, '.wasm') === stem && source.file.endsWith('.wasm'));
    if (candidates.length === 0) {
      problems.push(`dist/${path}: nenhum pacote do navegador tem um ${stem}.wasm (de onde veio?)`);
      continue;
    }
    const same = candidates.find((source) => source.sha256 === served);
    if (!same) problems.push(`dist/${path} difere do ${stem}.wasm de ${[...new Set(candidates.map((source) => source.pkg))].join(' e ')} (SHA-256 ${served.slice(0, 12)}… no lugar de ${candidates[0]?.sha256.slice(0, 12)}…)`);
    else if (!listed.has(same.pkg)) problems.push(`dist/${path} vem de ${same.pkg}, que a /licenses não lista`);
  }
  return problems;
}

/**
 * A license text labelled "…, in x.wasm" says the library is compiled into that file; the file has to be served.
 * Listing a text for a binary the site does not ship tells the reader a falsehood about what runs on their device
 * (the qcms of PDF.js is the case: PDF.js loads it only with useWorkerFetch, which the site turns off, DECISOES § 144).
 * `served` holds the names of the served .wasm files without the bundler hash (`qpdf.wasm`, `jbig2.wasm`).
 */
export function checkWasmTexts(packages: readonly { name: string; texts: readonly { label: string | null }[] }[], served: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  for (const pkg of packages) {
    for (const { label } of pkg.texts) {
      const file = /\bin ([\w.-]+\.wasm)\b/.exec(label ?? '')?.[1];
      if (file && !served.has(file)) problems.push(`${pkg.name}: a /licenses tem um texto "${label}", mas o dist não serve ${file}`);
    }
  }
  return problems;
}

// --- Packages compiled into a prebuilt file of another package (DECISOES § 179) ---

/**
 * The npm packages a prebuilt file of a package carries inside it, from the `// MODULE: ./node_modules/<name>/…`
 * markers webpack leaves (the legacy build of PDF.js has core-js this way). The bundle record names only the outer
 * file, so without this the gate cannot see them.
 */
export function embeddedPackages(code: string): string[] {
  const found = new Set<string>();
  for (const match of code.matchAll(/^\/\/ MODULE: \.\/node_modules\/((?:@[\w.-]+\/)?[\w.-]+)\//gm)) if (match[1]) found.add(match[1]);
  return [...found].sort();
}

export interface PrebuiltFile {
  /** The package the file belongs to. */
  pkg: string;
  /** The file, as the bundle record names it (for the message). */
  file: string;
  /** What embeddedPackages() found in it. */
  embedded: readonly string[];
  /** The license addresses the code itself names for the packages inside (core-js: `…/core-js/blob/v3.50.0/LICENSE`). */
  licenseUrls: readonly string[];
}

/** Every `https://…/<name>/blob/<ref>/LICENSE` address in the code: the version a package inside says it is. */
export function licenseUrlsIn(code: string): string[] {
  return [...new Set([...code.matchAll(/https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/blob\/[\w.-]+\/LICENSE\b/g)].map((match) => match[0]))].sort();
}

/**
 * Every package compiled into a prebuilt file in the bundle has a license text of its own on /licenses: an upstream
 * text of the outer package that says it `embeds` that package. When the code names the license address of the
 * package inside (`…/<name>/blob/<ref>/LICENSE`), the text is the one of that address, so a new version inside a new
 * pdfjs-dist cannot keep the old text.
 */
export function checkEmbeddedTexts(files: readonly PrebuiltFile[], texts: Readonly<Record<string, readonly { embeds?: string; source: string; label: string }[]>>): string[] {
  const problems: string[] = [];
  for (const { pkg, file, embedded, licenseUrls } of files) {
    for (const name of embedded) {
      const text = (texts[pkg] ?? []).find((entry) => entry.embeds === name);
      if (!text) {
        problems.push(`${name} está compilado dentro de ${file} (${pkg}) e a /licenses não tem o texto dele`);
        continue;
      }
      const named = licenseUrls.filter((url) => url.includes(`/${name}/blob/`));
      if (named.length > 0 && !named.includes(text.source)) problems.push(`${file} traz o ${name} de ${named.join(', ')}, mas o texto da /licenses ("${text.label}") é de ${text.source}`);
    }
  }
  return problems;
}

/** The prebuilt files of the bundle: every package module of the record whose code carries webpack MODULE markers. */
export function readPrebuiltFiles(record: BundleRecord, root = process.cwd()): PrebuiltFile[] {
  const seen = new Map<string, PrebuiltFile>();
  for (const ids of Object.values(record)) {
    for (const id of ids) {
      const info = classifyModule(id, root);
      const path = normalise(id).replace(/[?#].*$/, '');
      if (info.kind !== 'package' || seen.has(path) || !/\.m?js$/.test(path) || !existsSync(path)) continue;
      const code = readFileSync(path, 'utf8');
      const embedded = embeddedPackages(code);
      if (embedded.length > 0) seen.set(path, { pkg: info.name, file: `${info.name}/${path.slice(info.dir.length + 1)}`, embedded, licenseUrls: licenseUrlsIn(code) });
    }
  }
  return [...seen.values()].sort((a, b) => a.file.localeCompare(b.file));
}

function squash(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Checks one rendered /licenses page: every listed package is in it (`>name<`), every license text it needs
 * is in a <pre>, no build-only package is, and the LGPL notice carries the links to the source.
 */
export function checkLicensesPage(
  html: string,
  expected: { name: string; texts: readonly Pick<LicenseText, 'text'>[] }[],
  buildOnly: readonly string[],
  lgpl: { sources: readonly string[] } | null,
): string[] {
  const problems: string[] = [];
  const page = parse(html);
  const shown = new Set(page.querySelectorAll('pre').map((pre) => squash(pre.text)));
  for (const pkg of expected) {
    if (!html.includes(`>${pkg.name}<`)) problems.push(`não lista ${pkg.name}`);
    for (const { text } of pkg.texts) {
      if (!shown.has(squash(text))) problems.push(`${pkg.name}: falta um texto de licença (começa com "${squash(text).slice(0, 40)}")`);
    }
  }
  for (const name of buildOnly) if (html.includes(`>${name}<`)) problems.push(`lista ${name}, que é só de build`);
  if (lgpl) {
    const notice = page.querySelector('[data-license-notice="lgpl"]');
    if (!notice) problems.push('sem o aviso da LGPL ([data-license-notice="lgpl"])');
    else {
      const links = new Set(notice.querySelectorAll('a').map((link) => link.getAttribute('href')));
      for (const url of lgpl.sources) if (!links.has(url)) problems.push(`o aviso da LGPL não leva a ${url}`);
    }
  }
  return problems;
}

// --- readers: dist/ and the bundle record -> data ---

export function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function readBundleRecord(path = BUNDLE_RECORD): BundleRecord | null {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as BundleRecord) : null;
}

/** Problems with the record itself: a record left from another build would make every check below meaningless. */
export function checkRecordMatchesDist(record: BundleRecord, dist = 'dist'): string[] {
  const problems: string[] = [];
  for (const chunk of Object.keys(record)) if (!existsSync(join(dist, chunk))) problems.push(`o registro do bundle cita ${chunk}, que não existe no dist (registro de outro build?)`);
  const recorded = new Set(Object.keys(record));
  for (const file of listFiles(join(dist, '_astro'))) {
    const name = normalise(relative(dist, file));
    if (name.endsWith('.js') && !recorded.has(name)) problems.push(`${name} está no dist e não está no registro do bundle`);
  }
  return problems;
}

/** `AGFzbQEAAAA` is the base64 of a WebAssembly module header: a chunk that has it carries a module inline. */
const INLINE_WASM = /AGFzbQEAAAA/;

export function readDistFacts(record: BundleRecord, dist = 'dist'): DistFacts {
  const wasm = listFiles(dist)
    .filter((file) => file.endsWith('.wasm'))
    .map((file) => ({ file: normalise(relative(dist, file)), sha256: sha256(file) }));
  const chunks = Object.entries(record).map(([file, modules]) => ({
    file,
    modules,
    inlineWasm: existsSync(join(dist, file)) && INLINE_WASM.test(readFileSync(join(dist, file), 'utf8')),
  }));
  return { wasm, chunks };
}

/** Every file under `dir` except what sits in a nested node_modules (those are other packages). */
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** Every .wasm of a package folder with its SHA-256 (F5a: what dist/_astro/*.wasm must be identical to). */
export function readWasmSources(pkg: string, dir: string): WasmSource[] {
  return walk(dir)
    .filter((file) => file.endsWith('.wasm'))
    .map((file) => ({ pkg, file: normalise(relative(dir, file)), sha256: sha256(file) }));
}

/** The folders under dist/_astro/pdfjs/ (each is a version) and the files of one of them, with their SHA-256. */
export function readPdfjsServed(version: string, dist = 'dist'): { versions: string[]; served: ServedFile[] } {
  const root = join(dist, '_astro', 'pdfjs');
  if (!existsSync(root)) return { versions: [], served: [] };
  const versions = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const folder = join(root, version);
  const served = existsSync(folder) ? walk(folder).map((file) => ({ file: normalise(relative(folder, file)), sha256: sha256(file) })) : [];
  return { versions, served };
}

/** The SHA-256 of each file of `files` that exists in the package folder (a file that does not exist is left out). */
export function readPackageHashes(dir: string, files: readonly string[]): Map<string, string> {
  return new Map(files.filter((file) => existsSync(join(dir, file))).map((file) => [file, sha256(join(dir, file))]));
}
