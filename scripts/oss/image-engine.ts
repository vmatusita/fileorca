// Exports src/engine/image/ as the standalone package fileorca-image-engine (F5a, DECISOES § 165).
//
//   pnpm motor:exportar                 writes .cache/oss/fileorca-image-engine/
//   pnpm motor:exportar --out <dir>     writes there instead
//   pnpm motor:exportar --conferir      exports, copies the package to a temporary folder OUTSIDE the repository and
//                                       runs npm install, tsc --noEmit and vitest run there, as a plain user (no pnpm,
//                                       no site files). Needs the network for npm install, so it is not in `verificar`.
//
// It never publishes anything: no npm publish, no git push, no gh. The public repository is the owner's to create
// (docs/lancamento/codigo-aberto.md).
//
// What goes in, and how:
//   - src/        the engine, copied as it is (same code as the site). Only the line endings are normalised to LF.
//   - tests/      tests/unit/engine-*.test.ts and strip.test.ts, with the imports rewritten to the package layout, and
//                 the helpers they import. A test that reads a fixture that stays out is removed by AST (never by a
//                 regex on the text), then the imports it leaves unused are dropped, again by AST.
//   - fixtures/   only the files whose licence in fixtures/ORIGEM.md allows redistribution, checked against that file.
//   - the rest    package.json, tsconfig.json, README.md, LICENSE, THIRD-PARTY-NOTICES.md, .gitignore, fixtures/SOURCES.md.
// Nothing of the site goes in (tests/unit/oss-image-engine.test.ts checks it). Two exports in a row are identical:
// no date, no absolute path, every list sorted.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, cpSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { findPackageDir, lgplSources, readPackage, SEPARATE_FILE_RULES } from '../../src/platform/licenses.ts';
import type { LicenseText, PackageLicense } from '../../src/platform/licenses.ts';

export const ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url)));
export const DEFAULT_OUT = join(ROOT, '.cache', 'oss', 'fileorca-image-engine');
const TEMPLATE = join(ROOT, 'scripts', 'oss', 'image-engine-template');

export const PACKAGE_NAME = 'fileorca-image-engine';
export const PACKAGE_VERSION = '0.1.0';

/** The tests of the engine: tests/unit/engine-*.test.ts and strip.test.ts. */
const ENGINE_TEST = /^(?:engine-[a-z0-9-]+|strip)\.test\.ts$/;

const posix = (path: string): string => path.split('\\').join('/');
const rel = (absolute: string, root = ROOT): string => posix(relative(root, absolute));
const sha256 = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex');
const text = (path: string): string => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// The layout: where each file of the site lands in the package. Anything else would be an import that leaves the package.

export function packagePath(siteRelative: string): string {
  if (siteRelative.startsWith('src/engine/image/')) return `src/${siteRelative.slice('src/engine/image/'.length)}`;
  let match = /^tests\/unit\/lib\/(.+)$/.exec(siteRelative);
  if (match) return `tests/lib/${match[1]}`;
  match = /^tests\/e2e\/lib\/(.+)$/.exec(siteRelative);
  if (match) return `tests/lib/${match[1]}`;
  match = /^tests\/unit\/([^/]+\.test\.ts)$/.exec(siteRelative);
  if (match && ENGINE_TEST.test(match[1] ?? '')) return `tests/${match[1]}`;
  throw new Error(`${siteRelative} would leave the package: it is not part of the engine, of its tests or of their helpers`);
}

// ---------------------------------------------------------------------------------------------------------------------
// Fixtures: only what fixtures/ORIGEM.md allows to redistribute.

export interface FixtureDecision {
  name: string;
  included: boolean;
  /** The licence that lets it in, or why it stays out. */
  why: string;
  license?: 'MIT' | 'BSD-3-Clause' | 'drawn';
  source?: string;
  holder?: string;
  sha256: string;
}

/**
 * Third-party files that may be redistributed: an OSI licence named in ORIGEM.md, and no real GPS in the file.
 * Everything else that is not drawn by the fixture script stays out (drewnoakes "use freely" never names
 * redistribution, the CC BY-SA files would make the package share-alike, and two files carry real coordinates).
 */
const THIRD_PARTY: Record<string, { source: string; license: 'MIT' | 'BSD-3-Clause'; holder: string }> = {
  'heic-08-iphone13pro-paisagem-hdr-ios17.heic': { source: 'johncf/apple-hdr-heic', license: 'MIT', holder: '2024 John Charankattu' },
  'heic-10-visionpro-espacial-2imagens.heic': { source: 'bigcat88/pillow_heif', license: 'BSD-3-Clause', holder: '2021-2023 Pillow-Heif contributors' },
};

export function fixtureDecisions(root = ROOT): FixtureDecision[] {
  const dir = join(root, 'fixtures', 'images');
  const origem = text(join(root, 'fixtures', 'ORIGEM.md'));
  const expected = JSON.parse(text(join(dir, 'expected.json'))) as { files: Record<string, { gpsKind: string }> };
  const lines = origem.split('\n');
  const decisions: FixtureDecision[] = [];
  for (const name of Object.keys(expected.files).sort()) {
    const bytes = readFileSync(join(dir, name));
    const digest = sha256(bytes);
    const base = { name, sha256: digest };
    // The SHA-256 in ORIGEM.md is the proof that the file is the one whose origin is described there.
    if (!origem.includes(digest)) throw new Error(`fixtures/images/${name} does not match any SHA-256 in fixtures/ORIGEM.md`);
    const row = lines.find((line) => line.startsWith(`| images/${name} |`));
    const third = THIRD_PARTY[name];
    if (third) {
      const id = name.slice(0, name.indexOf('-', name.indexOf('-') + 1));
      const licensed = lines.some((line) => line.includes(third.source) && line.includes(third.license) && line.includes(id));
      if (!licensed) throw new Error(`fixtures/ORIGEM.md no longer says that ${id} is ${third.license} from ${third.source}`);
      if (expected.files[name]?.gpsKind === 'real') throw new Error(`${name} has real GPS coordinates and cannot be redistributed`);
      decisions.push({ ...base, included: true, why: `${third.license}, ${third.holder}`, license: third.license, source: third.source, holder: third.holder });
    } else if (row?.includes('sem fonte externa')) {
      decisions.push({ ...base, included: true, why: 'drawn by the fixture script, no outside source', license: 'drawn' });
    } else {
      const why = expected.files[name]?.gpsKind === 'real' ? 'real GPS coordinates inside the file' : 'its licence does not clearly allow redistribution (left out when in doubt)';
      decisions.push({ ...base, included: false, why });
    }
  }
  return decisions;
}

// ---------------------------------------------------------------------------------------------------------------------
// TypeScript helpers (the compiler API parses; nothing here edits code with a regular expression).

function parse(source: string, fileName: string): ts.SourceFile {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
}

interface Splice {
  start: number;
  end: number;
  replacement: string;
}

function splice(source: string, edits: readonly Splice[]): string {
  let out = source;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
  return out;
}

/** Every module specifier of a file: import, export-from, dynamic import() and import types, with its literal. */
function specifiersOf(file: ts.SourceFile): ts.StringLiteralLike[] {
  const found: ts.StringLiteralLike[] = [];
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) found.push(node.moduleSpecifier);
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) found.push(node.arguments[0]);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteralLike(node.argument.literal)) found.push(node.argument.literal);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

const BUILTINS = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);

/** The npm package a bare specifier names, or null for a relative path or a Node built-in. */
function packageOf(specifier: string): string | null {
  if (specifier.startsWith('.') || specifier.startsWith('/') || BUILTINS.has(specifier) || specifier.startsWith('node:')) return null;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? null);
}

/** The npm packages a set of TypeScript sources imports (type-only imports included: tsc needs them installed). */
export function importedPackages(sources: ReadonlyMap<string, string>): string[] {
  const names = new Set<string>();
  for (const [name, source] of sources) {
    for (const literal of specifiersOf(parse(source, name))) {
      const pkg = packageOf(literal.text);
      if (pkg) names.add(pkg);
    }
  }
  return [...names].sort();
}

/** Points every relative import of a file at the package layout. Returns the new text and the site files it needs. */
export function rewriteSpecifiers(source: string, siteFile: string, root = ROOT): { text: string; needs: string[] } {
  const file = parse(source, siteFile);
  const from = join(root, siteFile);
  const target = packagePath(siteFile);
  const needs = new Set<string>();
  const edits: Splice[] = [];
  for (const literal of specifiersOf(file)) {
    const specifier = literal.text;
    if (!specifier.startsWith('.')) continue;
    const absolute = resolve(dirname(from), specifier);
    if (!existsSync(absolute)) throw new Error(`${siteFile} imports ${specifier}, which does not exist`);
    const siteTarget = rel(absolute, root);
    const mapped = packagePath(siteTarget);
    if (!mapped.startsWith('src/')) needs.add(siteTarget);
    let next = posix(relative(dirname(target), mapped));
    if (!next.startsWith('.')) next = `./${next}`;
    // Inside the quotes only: the quote style of the file stays.
    edits.push({ start: literal.getStart() + 1, end: literal.getEnd() - 1, replacement: next });
  }
  return { text: splice(source, edits), needs: [...needs].sort() };
}

// ---------------------------------------------------------------------------------------------------------------------
// Removing the tests that need fixtures that stay out.

interface Ref {
  kind: 'exact' | 'prefix';
  value: string;
}

export interface PruneResult {
  text: string;
  /** Titles of the tests taken out. */
  removed: string[];
  /** Tests left in the file. */
  kept: number;
}

const TEST_CALLS = new Set(['it', 'test']);
const SUITE_CALLS = new Set(['describe']);

function calleeName(call: ts.CallExpression): string | null {
  const callee = call.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) return callee.expression.text;
  return null;
}

function titleOf(call: ts.CallExpression): string {
  const first = call.arguments[0];
  return first && ts.isStringLiteralLike(first) ? first.text : first ? first.getText().slice(0, 80) : '(untitled)';
}

const isReference = (node: ts.Identifier): boolean => {
  const parent = node.parent;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
  if (ts.isBindingElement(parent) && parent.propertyName === node) return false;
  if ((ts.isPropertySignature(parent) || ts.isMethodSignature(parent) || ts.isMethodDeclaration(parent) || ts.isPropertyDeclaration(parent)) && parent.name === node) return false;
  if (ts.isQualifiedName(parent) && parent.right === node) return false;
  return true;
};

/**
 * Takes out of a test file every test (and every `describe` that ends up empty) that reads a fixture that is not in
 * `included`, and every declaration that only exists for them. A test reads a fixture when a string in it is the exact
 * name of a fixture file, or the prefix handed to `names()` (the helper that lists fixtures by prefix) matches only
 * fixtures that stay out. A prefix that still matches some included fixture keeps the test: it runs on those.
 */
export function pruneTests(source: string, fileName: string, all: readonly string[], included: ReadonlySet<string>): PruneResult {
  const file = parse(source, fileName);

  const refsOf = (node: ts.Node): Ref[] => {
    const refs: Ref[] = [];
    const visit = (child: ts.Node): void => {
      if (ts.isStringLiteralLike(child)) {
        const parent = child.parent;
        if (ts.isCallExpression(parent) && parent.arguments[0] === child && ts.isIdentifier(parent.expression) && parent.expression.text === 'names') refs.push({ kind: 'prefix', value: child.text });
        else if (all.includes(child.text)) refs.push({ kind: 'exact', value: child.text });
      }
      ts.forEachChild(child, visit);
    };
    visit(node);
    return refs;
  };
  const isBad = (ref: Ref): boolean => {
    if (ref.kind === 'exact') return !included.has(ref.value);
    const matched = all.filter((name) => name.startsWith(ref.value));
    return matched.length > 0 && !matched.some((name) => included.has(name));
  };
  const identifiersOf = (node: ts.Node): Set<string> => {
    const names = new Set<string>();
    const visit = (child: ts.Node): void => {
      if (ts.isIdentifier(child) && isReference(child)) names.add(child.text);
      ts.forEachChild(child, visit);
    };
    visit(node);
    return names;
  };

  // Declarations (const, function) outside the tests, with the names they declare: tainted when they read a fixture that
  // stays out, or use a name that is tainted. The test that uses a tainted name goes too.
  const declarations: { node: ts.Statement; declares: string[] }[] = [];
  const collect = (node: ts.Node): void => {
    if (ts.isVariableStatement(node)) {
      const declares = node.declarationList.declarations.flatMap((declaration) => (ts.isIdentifier(declaration.name) ? [declaration.name.text] : []));
      declarations.push({ node, declares });
      return;
    }
    if (ts.isFunctionDeclaration(node)) {
      declarations.push({ node, declares: node.name ? [node.name.text] : [] });
      return;
    }
    if (ts.isCallExpression(node)) {
      const name = calleeName(node);
      if (name && TEST_CALLS.has(name)) return; // inside a test, declarations are the test's own
    }
    ts.forEachChild(node, collect);
  };
  collect(file);
  const taintedNames = new Set<string>();
  const taintedNodes = new Set<ts.Node>();
  for (let changed = true; changed; ) {
    changed = false;
    for (const declaration of declarations) {
      if (taintedNodes.has(declaration.node)) continue;
      const used = identifiersOf(declaration.node);
      if (refsOf(declaration.node).some(isBad) || [...used].some((name) => taintedNames.has(name) && !declaration.declares.includes(name))) {
        taintedNodes.add(declaration.node);
        for (const name of declaration.declares) taintedNames.add(name);
        changed = true;
      }
    }
  }
  const touchesBad = (node: ts.Node): boolean => refsOf(node).some(isBad) || [...identifiersOf(node)].some((name) => taintedNames.has(name));

  const removals: Splice[] = [];
  const removed: string[] = [];
  const cut = (node: ts.Node): void => {
    removals.push({ start: node.getFullStart(), end: node.getEnd(), replacement: '' });
  };

  const walkNode = (node: ts.Node): { had: number; kept: number } => {
    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
      const call = node.expression;
      const name = calleeName(call);
      if (name && TEST_CALLS.has(name)) {
        if (touchesBad(call)) {
          cut(node);
          removed.push(titleOf(call));
          return { had: 1, kept: 0 };
        }
        return { had: 1, kept: 1 };
      }
      if (name && SUITE_CALLS.has(name)) {
        const mark = removals.length;
        const total = { had: 0, kept: 0 };
        for (const argument of call.arguments) {
          if (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) {
            const inner = walkNode(argument.body);
            total.had += inner.had;
            total.kept += inner.kept;
          }
        }
        if (total.had > 0 && total.kept === 0) {
          removals.length = mark; // the whole suite goes, so the cuts inside it do not matter
          cut(node);
        }
        return total;
      }
    }
    if ((ts.isForOfStatement(node) || ts.isForInStatement(node)) && refsOf(node.expression).some(isBad)) {
      // A loop over fixtures that all stay out: the tests it makes go with it.
      const probe = { had: 0, kept: 0 };
      const count = (child: ts.Node): void => {
        if (ts.isCallExpression(child)) {
          const name = calleeName(child);
          if (name && TEST_CALLS.has(name)) {
            probe.had += 1;
            removed.push(titleOf(child));
            return;
          }
        }
        ts.forEachChild(child, count);
      };
      count(node.statement);
      if (probe.had > 0) {
        cut(node);
        return { had: probe.had, kept: 0 };
      }
    }
    if (taintedNodes.has(node)) {
      cut(node);
      return { had: 0, kept: 0 };
    }
    const total = { had: 0, kept: 0 };
    ts.forEachChild(node, (child) => {
      const inner = walkNode(child);
      total.had += inner.had;
      total.kept += inner.kept;
    });
    return total;
  };

  const total = walkNode(file);
  const pruned = splice(source, removals);
  return { text: removals.length > 0 ? dropUnusedDeclarations(pruned, fileName) : pruned, removed, kept: total.kept };
}

/**
 * Drops the const and function declarations outside the tests that nothing reads any more (a helper whose only users
 * were the tests taken out), until no more go. A declaration the site's own tests leave unused cannot exist: the site
 * type-checks with noUnusedLocals, so only what the removal orphaned is touched.
 */
export function dropUnusedDeclarations(source: string, fileName: string): string {
  let current = source;
  for (;;) {
    const file = parse(current, fileName);
    const declarations: { node: ts.Statement; declares: string[] }[] = [];
    const collect = (node: ts.Node): void => {
      if (ts.isVariableStatement(node) && !node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
        declarations.push({ node, declares: node.declarationList.declarations.flatMap((declaration) => (ts.isIdentifier(declaration.name) ? [declaration.name.text] : [])) });
        return;
      }
      if (ts.isFunctionDeclaration(node) && node.name && !node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
        declarations.push({ node, declares: [node.name.text] });
        return;
      }
      if (ts.isCallExpression(node)) {
        const name = calleeName(node);
        if (name && TEST_CALLS.has(name)) return;
      }
      ts.forEachChild(node, collect);
    };
    collect(file);
    const edits: Splice[] = [];
    for (const declaration of declarations) {
      if (declaration.declares.length === 0) continue;
      const used = new Set<string>();
      const visit = (node: ts.Node): void => {
        if (node === declaration.node || ts.isImportDeclaration(node)) return;
        if (ts.isIdentifier(node) && isReference(node)) used.add(node.text);
        ts.forEachChild(node, visit);
      };
      visit(file);
      if (declaration.declares.every((name) => !used.has(name))) edits.push({ start: declaration.node.getFullStart(), end: declaration.node.getEnd(), replacement: '' });
    }
    if (edits.length === 0) return current;
    // One at a time keeps the offsets honest when two declarations used each other.
    current = splice(current, edits.slice(0, 1));
  }
}

/** Drops the imports (and the names inside an import) that nothing in the file uses any more. */
export function dropUnusedImports(source: string, fileName: string): string {
  const file = parse(source, fileName);
  const used = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && isReference(node)) used.add(node.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  const edits: Splice[] = [];
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
    const clause = statement.importClause;
    const keepDefault = clause.name !== undefined && used.has(clause.name.text);
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) {
      if (!keepDefault && !used.has(bindings.name.text)) edits.push({ start: statement.getFullStart(), end: statement.getEnd(), replacement: '' });
      continue;
    }
    const specifiers = bindings && ts.isNamedImports(bindings) ? bindings.elements : [];
    const kept = specifiers.filter((element) => used.has(element.name.text));
    if (kept.length === specifiers.length && (clause.name === undefined || keepDefault)) continue;
    if (!keepDefault && kept.length === 0) {
      edits.push({ start: statement.getFullStart(), end: statement.getEnd(), replacement: '' });
      continue;
    }
    const multiline = statement.getText().includes('\n');
    const names = kept.map((element) => element.getText());
    const list = multiline ? `{\n${names.map((name) => `  ${name},`).join('\n')}\n}` : `{ ${names.join(', ')} }`;
    const head = `import ${clause.phaseModifier === ts.SyntaxKind.TypeKeyword ? 'type ' : ''}${keepDefault && clause.name ? clause.name.text : ''}${keepDefault && kept.length > 0 ? ', ' : ''}${kept.length > 0 ? list : ''}`;
    edits.push({ start: statement.getStart(), end: statement.moduleSpecifier.getStart(), replacement: `${head} from ` });
  }
  return splice(source, edits);
}

// ---------------------------------------------------------------------------------------------------------------------
// The package.

export interface ExportReport {
  dir: string;
  files: string[];
  tests: { file: string; kept: number; removed: string[] }[];
  testsLeftOut: string[];
  fixtures: FixtureDecision[];
  dependencies: Record<string, string>;
}

function installedVersion(name: string, root: string): string {
  const dir = findPackageDir(name, root);
  if (!dir) throw new Error(`${name} is not installed`);
  return (JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { version: string }).version;
}

function packageJson(dependencies: Record<string, string>, root: string): string {
  const site = JSON.parse(text(join(root, 'package.json'))) as { devDependencies: Record<string, string> };
  const dev: Record<string, string> = {};
  for (const name of ['@types/node', 'typescript', 'vitest']) {
    const range = site.devDependencies[name];
    if (!range) throw new Error(`the site has no devDependency ${name}`);
    dev[name] = range;
  }
  const manifest = {
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    description: 'The browser image engine of FileOrca: compress, resize, crop, rotate and convert JPG, PNG, WebP, AVIF and HEIC, with no metadata in the output.',
    license: 'MIT',
    author: 'Victor Yuki Matusita',
    keywords: ['image', 'compress', 'resize', 'convert', 'heic', 'avif', 'webp', 'jpeg', 'png', 'wasm', 'exif', 'browser'],
    type: 'module',
    exports: { '.': './src/index.ts', './worker': './src/worker.ts' },
    files: ['src', 'README.md', 'LICENSE', 'THIRD-PARTY-NOTICES.md'],
    engines: { node: '^22.12.0 || ^24.0.0 || >=26.0.0' },
    scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' },
    dependencies,
    devDependencies: dev,
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** The strictest settings of the site's tsconfig (astro/tsconfigs/strictest), without Astro. */
function tsconfigJson(): string {
  const config = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      lib: ['ESNext', 'DOM', 'DOM.Iterable'],
      types: ['node'],
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      verbatimModuleSyntax: true,
      isolatedModules: true,
      noEmit: true,
      forceConsistentCasingInFileNames: true,
      esModuleInterop: true,
      skipLibCheck: true,
      allowJs: true,
      strict: true,
      noFallthroughCasesInSwitch: true,
      noImplicitOverride: true,
      noImplicitReturns: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      allowUnreachableCode: false,
      allowUnusedLabels: false,
    },
    include: ['src', 'tests'],
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

function repositoryOf(pkg: PackageLicense): string {
  if (pkg.repository) return pkg.repository;
  if (pkg.name.startsWith('@jsquash/')) return 'https://github.com/jamsinclair/jSquash';
  return '';
}

/** THIRD-PARTY-NOTICES.md: the packages the engine needs, their licences, the LGPL notice and the fixtures' licences. */
function noticesMarkdown(dependencies: Record<string, string>, fixtures: readonly FixtureDecision[], root: string): string {
  const packages = Object.keys(dependencies).sort().map((name) => readPackage(name, root));
  const licenseTexts = JSON.parse(text(join(TEMPLATE, 'fixture-licenses.json'))) as Record<string, string>;
  const out: string[] = [];
  out.push('# Third-party notices', '');
  out.push(`${PACKAGE_NAME} is MIT-licensed (see LICENSE). It depends on the packages below, which keep their own licences. None of them is bundled into this repository: they are installed by \`npm install\`, and their \`.wasm\` files are loaded from the URLs the application configures.`, '');
  out.push('| Package | Version | Licence | Source |', '| --- | --- | --- | --- |');
  for (const pkg of packages) out.push(`| \`${pkg.name}\` | ${pkg.version} | ${pkg.license} | ${repositoryOf(pkg)} |`);
  out.push('');

  const libheif = packages.find((pkg) => pkg.name === 'libheif-js');
  const rule = SEPARATE_FILE_RULES.find((item) => item.package === 'libheif-js');
  if (libheif && rule) {
    out.push('## libheif (LGPL-3.0): a separate, unmodified, replaceable file', '');
    out.push(`HEIC photos are decoded with libheif (and the HEVC decoder libde265 inside it), through \`libheif-js\` ${libheif.version}, which is licensed under the GNU Lesser General Public License v3.0.`, '');
    out.push(`- **Separate file.** The compiled library is the file \`${rule.wasm}\` of the \`${libheif.name}\` package. This engine does not contain it, does not bundle it into any other file and does not modify it: it fetches it, byte for byte, from the URL the application passes as \`heif\` to \`configureWasm()\`.`);
    out.push(`- **Replaceable.** To use your own build of libheif, serve your file and pass its URL as \`heif\`. Nothing else has to change. The JavaScript glue that starts it is \`${rule.glue}\`.`);
    out.push('- **Source code.** The source of the library in use:');
    for (const source of lgplSources(libheif.version)) out.push(`  - ${source.name} ${source.version}: ${source.url}`);
    out.push('- **Licence text.** The full text of the LGPL-3.0 (and of the GPL-3.0 it refers to) is below, as shipped with the package.', '');
  }

  out.push('## Licence texts', '');
  // One block per distinct text, listing everything it covers.
  const blocks = new Map<string, { label: string | null; text: string; source: string | null; covers: string[] }>();
  for (const pkg of packages) {
    for (const item of pkg.texts as LicenseText[]) {
      const key = `${item.label ?? ''}\u0000${item.text}`;
      const covers = item.label ? `${item.label} (inside ${pkg.name} ${pkg.version})` : `${pkg.name} ${pkg.version}`;
      const block = blocks.get(key);
      if (block) block.covers.push(covers);
      else blocks.set(key, { label: item.label, text: item.text, source: item.source, covers: [covers] });
    }
  }
  for (const block of blocks.values()) {
    out.push(`### ${block.covers.join('; ')}`, '');
    if (block.source) out.push(`Text copied from ${block.source}`, '');
    out.push('```text', block.text, '```', '');
  }

  const thirdParty = fixtures.filter((fixture) => fixture.included && fixture.license && fixture.license !== 'drawn');
  if (thirdParty.length > 0) {
    out.push('## Test fixtures', '');
    out.push('Most fixtures in `fixtures/images/` were drawn by the script of the FileOrca project and are MIT like the rest. These are files by other people, kept under their licences (details in [fixtures/SOURCES.md](fixtures/SOURCES.md)):', '');
    for (const fixture of thirdParty) out.push(`- \`${fixture.name}\`: ${fixture.license}, ${fixture.holder}, from github.com/${fixture.source}`);
    out.push('');
    for (const license of [...new Set(thirdParty.map((fixture) => fixture.license))]) {
      const body = licenseTexts[license ?? ''];
      if (!body) throw new Error(`no licence text for ${license}`);
      const owners = thirdParty.filter((fixture) => fixture.license === license).map((fixture) => fixture.name);
      out.push(`### ${license}: ${owners.join(', ')}`, '', '```text', body, '```', '');
    }
  }
  return `${out.join('\n').trimEnd()}\n`;
}

function sourcesMarkdown(fixtures: readonly FixtureDecision[]): string {
  const out: string[] = ['# Fixtures', ''];
  out.push('The test fixtures in `fixtures/images/` and the answer for each one in `expected.json`. The answers were written by hand and by an independent walk of the files, never by the engine.', '');
  out.push('Only files that may be redistributed are here. Files by other people are kept only under an open licence that names redistribution, and never with real GPS coordinates inside. The FileOrca project has more photos for its own tests; they stay in the project, and so do the tests that read them.', '');
  out.push('| File | Origin | Licence | SHA-256 |', '| --- | --- | --- | --- |');
  for (const fixture of fixtures.filter((item) => item.included)) {
    const origin = fixture.source ? `github.com/${fixture.source}, unchanged` : 'drawn by the fixture script of the FileOrca project';
    const license = fixture.license === 'drawn' ? 'MIT (this package)' : fixture.license;
    out.push(`| \`${fixture.name}\` | ${origin} | ${license} | \`${fixture.sha256}\` |`);
  }
  out.push('');
  return `${out.join('\n')}`;
}

/**
 * The `_doc` of the oracle names the site's files; in the package it names the package's. Each phrase is replaced as a
 * whole and its absence is an error, so a change in the oracle's text is noticed here and not shipped half-rewritten.
 */
function packageDoc(doc: string): string {
  const replacements: [string, string][] = [
    ['Written by hand from fixtures/ORIGEM.md (exiftool 13.60 + pillow-heif 1.8.1, columns "Gravado" and "Aparece") plus', 'Written by hand from exiftool 13.60 and pillow-heif 1.8.1 readings plus'],
    ['Generated files (gen-*, built by scripts/fixtures/generate.ts, SHA-256 in fixtures/ORIGEM.md)', 'Generated files (gen-*, drawn by the fixture script of the FileOrca project, SHA-256 in fixtures/SOURCES.md)'],
  ];
  let out = doc;
  for (const [from, to] of replacements) {
    if (!out.includes(from)) throw new Error(`the _doc of fixtures/images/expected.json changed: "${from.slice(0, 40)}..." is not in it`);
    out = out.replace(from, to);
  }
  return `${out}\nThis package keeps only the fixtures listed in fixtures/SOURCES.md; the entries of the other FileOrca fixtures were removed.`;
}

function fromTemplate(name: string, dependencies: Record<string, string>): string {
  return text(join(TEMPLATE, name)).replace(/\{\{version:([^}]+)\}\}/g, (_, pkg: string) => {
    const version = dependencies[pkg];
    if (!version) throw new Error(`the README names ${pkg}, which the engine does not import`);
    return version;
  });
}

/** What an export leaves alone in its folder: the clone's history and what npm made there. */
const KEEP = new Set(['.git', 'node_modules', 'package-lock.json']);

const contains = (parent: string, child: string): boolean => {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith('..') && !isAbsolute(path));
};

/**
 * Empties the folder an export goes to, so a file that left the engine does not stay behind, without ever touching
 * anything but an earlier export: the folder is new or empty, or it holds the manifest of this package. The history
 * (.git), node_modules and package-lock.json of a clone survive, which makes `--out <clone>` the update command.
 */
function prepareOutput(out: string, root: string): void {
  if (contains(out, root)) throw new Error(`refusing to export over ${out}: it is, or holds, the repository`);
  if (contains(root, out) && !contains(join(root, '.cache'), out)) throw new Error(`refusing to export to ${out}: inside the repository, only .cache/ is allowed`);
  if (existsSync(out) && readdirSync(out).length > 0) {
    const manifest = join(out, 'package.json');
    const name = existsSync(manifest) ? (JSON.parse(readFileSync(manifest, 'utf8')) as { name?: string }).name : undefined;
    if (name !== PACKAGE_NAME) throw new Error(`refusing to export to ${out}: it is not empty and it is not an earlier export of ${PACKAGE_NAME}`);
  }
  mkdirSync(out, { recursive: true });
  for (const entry of readdirSync(out)) if (!KEEP.has(entry)) rmSync(join(out, entry), { recursive: true, force: true });
}

export function exportImageEngine(outDir = DEFAULT_OUT, root = ROOT): ExportReport {
  const out = resolve(outDir);
  prepareOutput(out, root);
  const written = new Map<string, string | Uint8Array>();
  const put = (path: string, body: string | Uint8Array): void => {
    if (written.has(path)) throw new Error(`two files want to be ${path}`);
    written.set(path, body);
  };

  // 1. The engine, as it is.
  const engineDir = join(root, 'src', 'engine', 'image');
  const engineFiles = walk(engineDir);
  const sources = new Map<string, string>();
  for (const file of engineFiles) {
    const body = text(file);
    const target = packagePath(rel(file, root));
    sources.set(target, body);
    put(target, body);
  }

  // 2. The fixtures that may go, and the tests that can run on them.
  const fixtures = fixtureDecisions(root);
  const all = fixtures.map((fixture) => fixture.name);
  const included = new Set(fixtures.filter((fixture) => fixture.included).map((fixture) => fixture.name));
  const testsDir = join(root, 'tests', 'unit');
  const testFiles = readdirSync(testsDir).filter((name) => ENGINE_TEST.test(name)).sort();
  const helpers = new Set<string>();
  const tests: ExportReport['tests'] = [];
  const testsLeftOut: string[] = [];
  const testSources = new Map<string, string>();
  for (const name of testFiles) {
    const siteFile = `tests/unit/${name}`;
    const pruned = pruneTests(text(join(root, siteFile)), siteFile, all, included);
    if (pruned.kept === 0) {
      testsLeftOut.push(siteFile);
      tests.push({ file: siteFile, kept: 0, removed: pruned.removed });
      continue;
    }
    const rewritten = rewriteSpecifiers(pruned.text, siteFile, root);
    const clean = dropUnusedImports(rewritten.text, siteFile);
    for (const need of rewritten.needs) helpers.add(need);
    put(packagePath(siteFile), clean);
    testSources.set(packagePath(siteFile), clean);
    tests.push({ file: siteFile, kept: pruned.kept, removed: pruned.removed });
  }
  // The helpers, and the helpers of the helpers.
  const queue = [...helpers];
  const done = new Set<string>();
  while (queue.length > 0) {
    const siteFile = queue.shift() as string;
    if (done.has(siteFile)) continue;
    done.add(siteFile);
    const rewritten = rewriteSpecifiers(text(join(root, siteFile)), siteFile, root);
    put(packagePath(siteFile), rewritten.text);
    testSources.set(packagePath(siteFile), rewritten.text);
    queue.push(...rewritten.needs);
  }

  // 3. The dependencies: exactly what the engine imports, at the versions the site runs.
  const dependencies: Record<string, string> = {};
  for (const name of importedPackages(sources)) dependencies[name] = installedVersion(name, root);
  const devNames = new Set(['vitest', 'typescript', '@types/node']);
  for (const name of importedPackages(testSources)) {
    if (!dependencies[name] && !devNames.has(name)) throw new Error(`a test imports ${name}, which is not a dependency of the package`);
  }

  // 4. Fixtures on disk.
  const expected = JSON.parse(text(join(root, 'fixtures', 'images', 'expected.json'))) as { _doc: string; files: Record<string, unknown> };
  const files: Record<string, unknown> = {};
  for (const name of Object.keys(expected.files).sort()) if (included.has(name)) files[name] = expected.files[name];
  put('fixtures/images/expected.json', `${JSON.stringify({ _doc: packageDoc(expected._doc), files }, null, 2)}\n`);
  for (const name of [...included].sort()) put(`fixtures/images/${name}`, readFileSync(join(root, 'fixtures', 'images', name)));
  put('fixtures/SOURCES.md', sourcesMarkdown(fixtures));

  // 5. The rest of the package.
  put('package.json', packageJson(dependencies, root));
  put('tsconfig.json', tsconfigJson());
  put('README.md', fromTemplate('README.md', dependencies));
  put('LICENSE', text(join(TEMPLATE, 'LICENSE')));
  put('THIRD-PARTY-NOTICES.md', noticesMarkdown(dependencies, fixtures, root));
  put('.gitignore', text(join(TEMPLATE, 'gitignore.txt')));

  const names = [...written.keys()].sort();
  for (const name of names) {
    const path = join(out, ...name.split('/'));
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, written.get(name) as string | Uint8Array);
  }
  return { dir: out, files: names, tests, testsLeftOut, fixtures, dependencies };
}

// ---------------------------------------------------------------------------------------------------------------------
// --conferir: install, typecheck and test the package as a stranger would.

/** The environment of a plain user: no pnpm, no npm_* variables of a running script, no project node_modules/.bin. */
function plainEnvironment(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^npm_/i.test(key) || /^pnpm_/i.test(key) || key === 'NODE_PATH' || key === 'INIT_CWD' || key === 'CI') continue;
    env[key] = value;
  }
  const pathKey = Object.keys(env).find((key) => key.toLowerCase() === 'path') ?? 'PATH';
  env[pathKey] = (env[pathKey] ?? '').split(process.platform === 'win32' ? ';' : ':').filter((entry) => !/node_modules[\\/]\.bin/.test(entry)).join(process.platform === 'win32' ? ';' : ':');
  return env;
}

function run(label: string, args: string[], cwd: string): number {
  const started = Date.now();
  console.log(`\n$ npm ${args.join(' ')}   (in ${cwd})`);
  // On Windows npm is npm.cmd, which Node only starts through a shell; the command line is built here, all of it fixed text.
  const result = process.platform === 'win32'
    ? spawnSync(`npm ${args.join(' ')}`, { cwd, env: plainEnvironment(), stdio: 'inherit', shell: true })
    : spawnSync('npm', args, { cwd, env: plainEnvironment(), stdio: 'inherit' });
  const code = result.status ?? 1;
  console.log(`[conferir] ${label}: exit ${code} in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  return code;
}

export function conferir(dir: string): number {
  const parent = mkdtempSync(join(tmpdir(), 'fileorca-image-engine-'));
  const copy = join(parent, PACKAGE_NAME);
  if (resolve(copy).startsWith(ROOT)) throw new Error('the temporary folder must be outside the repository');
  // What a stranger gets from a clone: the files, not the history of the maintainer nor the packages npm installed there.
  cpSync(dir, copy, { recursive: true, filter: (source) => !['.git', 'node_modules'].includes(basename(source)) });
  console.log(`[conferir] package copied to ${copy}`);
  const steps: [string, string[]][] = [
    ['npm install', ['install', '--no-audit', '--no-fund']],
    ['tsc --noEmit', ['run', 'typecheck']],
    ['vitest run', ['test']],
  ];
  const results: string[] = [];
  let failed = 0;
  for (const [label, args] of steps) {
    const code = run(label, args, copy);
    results.push(`${label}: ${code === 0 ? 'ok' : `FAILED (${code})`}`);
    if (code !== 0) {
      failed = code;
      break;
    }
  }
  console.log(`\n[conferir] ${results.join(' | ')}`);
  if (failed === 0) {
    rmSync(parent, { recursive: true, force: true });
    console.log('[conferir] zero: the package installs, compiles and passes its own tests outside the repository.');
  } else {
    console.log(`[conferir] failed; the copy stays at ${copy} for a look.`);
  }
  return failed;
}

function main(argv: string[]): number {
  const outIndex = argv.indexOf('--out');
  const outDir = outIndex >= 0 && argv[outIndex + 1] ? resolve(argv[outIndex + 1] as string) : DEFAULT_OUT;
  const report = exportImageEngine(outDir);
  const sizeOf = (path: string): number => statSync(path).size;
  const bytes = report.files.reduce((sum, name) => sum + sizeOf(join(report.dir, ...name.split('/'))), 0);
  console.log(`[motor:exportar] ${PACKAGE_NAME}@${PACKAGE_VERSION} written to ${report.dir}: ${report.files.length} files, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[motor:exportar] dependencies: ${Object.entries(report.dependencies).map(([name, version]) => `${name}@${version}`).join(', ')}`);
  console.log(`[motor:exportar] fixtures in: ${report.fixtures.filter((f) => f.included).map((f) => f.name).join(', ')}`);
  console.log(`[motor:exportar] fixtures left out: ${report.fixtures.filter((f) => !f.included).length} (${[...new Set(report.fixtures.filter((f) => !f.included).map((f) => f.why))].join('; ')})`);
  for (const test of report.tests) {
    console.log(`[motor:exportar] ${test.file}: ${test.kept} tests in the package, ${test.removed.length} left in the site${test.kept === 0 ? ' (file left out)' : ''}`);
    for (const title of test.removed) console.log(`    - ${title}`);
  }
  if (argv.includes('--conferir')) return conferir(report.dir);
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
