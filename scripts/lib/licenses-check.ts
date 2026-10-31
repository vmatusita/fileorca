// Checks behind `pnpm gate:licencas` that are about the real bundle (DECISOES § 13): which packages are
// in it, whether /licenses lists them, and whether an LGPL library stays a separate file. The checks are
// plain functions over plain data, so tests can feed them a fake dist; the readers at the bottom turn
// dist/ and the bundle record (src/platform/bundle-record.ts) into that data.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
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
  const glueChunks = facts.chunks.filter((chunk) => chunk.modules.some((id) => {
    const info = classifyModule(id, root);
    return info.kind === 'package' && info.name === rule.package;
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
