import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import ts from 'typescript';
import { AUTHOR, CONTACT_EMAIL, GA4_MEASUREMENT_ID, INDEXNOW_KEY, KOFI_URL, PRODUCTION_HOSTNAME, SITE_ORIGIN } from '../../src/platform/site.ts';
import { lgplSources } from '../../src/platform/licenses.ts';
import {
  dropUnusedDeclarations,
  dropUnusedImports,
  exportImageEngine,
  fixtureDecisions,
  importedPackages,
  packagePath,
  pruneTests,
  rewriteSpecifiers,
  ROOT,
} from '../../scripts/oss/image-engine.ts';
import type { ExportReport } from '../../scripts/oss/image-engine.ts';

// The engine of the image tools leaves the repository as a package (scripts/oss/image-engine.ts, F5a). This is the
// part of the proof that needs no network: the export is complete, it is MIT and carries what the LGPL asks, nothing
// of the site came with it, no import leaves it, and two exports in a row are the same bytes. That it installs,
// compiles and passes its own tests is `pnpm motor:exportar --conferir` (it needs npm install, so it is not here).

const hash = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');

function listing(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listing(path, base));
    else out.push(relative(base, path).split(sep).join('/'));
  }
  return out;
}

const TEXT_FILE = /(\.(ts|md|json|txt)|LICENSE|\.gitignore)$/;

let work: string;
let first: ExportReport;
let second: ExportReport;

beforeAll(() => {
  work = mkdtempSync(join(tmpdir(), 'oss-image-engine-test-'));
  first = exportImageEngine(join(work, 'one'));
  second = exportImageEngine(join(work, 'two'));
});

afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

describe('oss-image-engine: the package', () => {
  it('has exactly the top level a repository needs, and nothing of the site next to it', () => {
    const top = readdirSync(first.dir).sort();
    expect(top).toEqual(['.gitignore', 'LICENSE', 'README.md', 'THIRD-PARTY-NOTICES.md', 'fixtures', 'package.json', 'src', 'tests', 'tsconfig.json']);
    for (const name of ['src/index.ts', 'src/worker.ts', 'src/process.ts', 'src/codecs/wasm.ts', 'tests/engine-wasm.test.ts', 'tests/strip.test.ts', 'tests/lib/oracle.ts', 'fixtures/SOURCES.md', 'fixtures/images/expected.json']) {
      expect(existsSync(join(first.dir, name)), name).toBe(true);
    }
  });

  it('carries the engine of the site byte for byte (line endings aside), under src/', () => {
    const engine = join(ROOT, 'src', 'engine', 'image');
    const sources = listing(engine);
    expect(sources.length).toBeGreaterThan(25);
    for (const file of sources) {
      const site = readFileSync(join(engine, ...file.split('/')), 'utf8').replace(/\r\n/g, '\n');
      expect(readFileSync(join(first.dir, 'src', ...file.split('/')), 'utf8'), file).toBe(site);
    }
    expect(listing(join(first.dir, 'src'))).toEqual(sources);
  });

  it('is fileorca-image-engine 0.1.0, MIT, type module, with the dependencies the engine imports at the versions the site runs', () => {
    const manifest = JSON.parse(readFileSync(join(first.dir, 'package.json'), 'utf8')) as Record<string, unknown> & { dependencies: Record<string, string>; devDependencies: Record<string, string> };
    expect(manifest).toMatchObject({ name: 'fileorca-image-engine', version: '0.1.0', license: 'MIT', type: 'module', scripts: { typecheck: 'tsc --noEmit', test: 'vitest run' } });
    expect(manifest['private']).toBeUndefined();
    expect(manifest['exports']).toEqual({ '.': './src/index.ts', './worker': './src/worker.ts' });

    const sources = new Map<string, string>();
    for (const file of listing(join(first.dir, 'src'))) if (file.endsWith('.ts')) sources.set(file, readFileSync(join(first.dir, 'src', file), 'utf8'));
    const imported = importedPackages(sources);
    expect(imported).toEqual(['@jsquash/avif', '@jsquash/jpeg', '@jsquash/oxipng', '@jsquash/resize', '@jsquash/webp', 'comlink', 'fflate', 'libheif-js']);
    expect(Object.keys(manifest.dependencies).sort()).toEqual(imported);
    for (const [name, version] of Object.entries(manifest.dependencies)) {
      const installed = JSON.parse(readFileSync(join(ROOT, 'node_modules', name, 'package.json'), 'utf8')) as { version: string };
      expect(version, name).toBe(installed.version); // exact, never a range: the .wasm files are the site's
    }
    expect(Object.keys(manifest.devDependencies).sort()).toEqual(['@types/node', 'typescript', 'vitest']);
  });

  it('keeps the six fixtures that may be redistributed, and no other', () => {
    const decisions = fixtureDecisions();
    const included = decisions.filter((item) => item.included).map((item) => item.name);
    expect(included).toEqual([
      'gen-grande-4100x4100.jpg',
      'gen-texto-extensao-png.png',
      'gen-vazio.jpg',
      'gen-webp-animada.webp',
      'heic-08-iphone13pro-paisagem-hdr-ios17.heic',
      'heic-10-visionpro-espacial-2imagens.heic',
    ]);
    // On disk: those, the answers, and the sources page.
    expect(listing(join(first.dir, 'fixtures'))).toEqual(['SOURCES.md', 'images/expected.json', ...included.map((name) => `images/${name}`)].sort());
    const expected = JSON.parse(readFileSync(join(first.dir, 'fixtures', 'images', 'expected.json'), 'utf8')) as { files: Record<string, unknown> };
    expect(Object.keys(expected.files).sort()).toEqual(included);
    // The ones that stay out: the photos with real coordinates and the ones whose licence does not name redistribution.
    for (const out of ['heic-06', 'heic-07', 'heic-04', 'heic-05', 'jpg-01', 'jpg-02', 'jpg-03', 'gen-jpg-01', 'gen-webp-exif-gps', 'gen-png-transparente']) {
      expect(decisions.find((item) => item.name.startsWith(out))?.included, out).toBe(false);
    }
    const sourcesPage = readFileSync(join(first.dir, 'fixtures', 'SOURCES.md'), 'utf8');
    for (const item of decisions.filter((entry) => entry.included)) {
      expect(sourcesPage, item.name).toContain(item.sha256);
      expect(hash(join(first.dir, 'fixtures', 'images', item.name)), item.name).toBe(item.sha256);
    }
  });
});

describe('oss-image-engine: licences', () => {
  it('has the MIT licence with the name of the owner and the year', () => {
    const license = readFileSync(join(first.dir, 'LICENSE'), 'utf8');
    expect(license.startsWith('MIT License\n\nCopyright (c) 2026 Victor Yuki Matusita\n')).toBe(true);
    expect(license).toContain('Permission is hereby granted, free of charge');
  });

  it('lists every dependency in THIRD-PARTY-NOTICES with its version and licence, and the codecs inside the .wasm files', () => {
    const notices = readFileSync(join(first.dir, 'THIRD-PARTY-NOTICES.md'), 'utf8');
    for (const [name, version] of Object.entries(first.dependencies)) expect(notices, name).toContain(`\`${name}\` | ${version} |`);
    expect(notices).toMatch(/\| `libheif-js` \| 1\.23\.5 \| LGPL-3\.0 \|/);
    for (const codec of ['MozJPEG', 'libwebp', 'libavif', 'libaom', 'OxiPNG', 'libheif and libde265']) expect(notices, codec).toContain(codec);
    // The texts, not only their names.
    expect(notices).toContain('Apache License');
    expect(notices).toContain('GNU LESSER GENERAL PUBLIC LICENSE');
  });

  it('presents libheif as LGPL-3.0 in a separate .wasm, unmodified and replaceable, with the links to the source', () => {
    const notices = readFileSync(join(first.dir, 'THIRD-PARTY-NOTICES.md'), 'utf8');
    const section = notices.slice(notices.indexOf('## libheif (LGPL-3.0)'), notices.indexOf('## Licence texts'));
    expect(section.length).toBeGreaterThan(500);
    expect(section).toContain('libheif-wasm/libheif.wasm');
    expect(section).toMatch(/does not modify it/);
    expect(section).toMatch(/Replaceable/);
    for (const source of lgplSources('1.23.5')) expect(section, source.name).toContain(source.url);
    // And the package keeps the promise: no file of the package contains the library, the engine only fetches it.
    expect(listing(first.dir).filter((name) => name.endsWith('.wasm'))).toEqual([]);
  });

  it('names the licence and the holder of each fixture that is not the owner’s, with its text', () => {
    const notices = readFileSync(join(first.dir, 'THIRD-PARTY-NOTICES.md'), 'utf8');
    expect(notices).toContain('Copyright (c) 2024 John Charankattu');
    expect(notices).toContain('Copyright (c) 2021-2023, Pillow-Heif contributors.');
    expect(notices).toContain('heic-08-iphone13pro-paisagem-hdr-ios17.heic');
    expect(notices).toContain('heic-10-visionpro-espacial-2imagens.heic');
  });

  it('documents the contract, the nine .wasm URLs and the decisions the code cites', () => {
    const readme = readFileSync(join(first.dir, 'README.md'), 'utf8');
    for (const key of ['avifDecoder', 'avifEncoder', 'heif', 'jpegDecoder', 'jpegEncoder', 'oxipng', 'resize', 'webpDecoder', 'webpEncoder']) expect(readme, key).toContain(`\`${key}\``);
    for (const reason of ['empty', 'unsupported', 'wrong-tool', 'truncated', 'decode', 'load', 'encode', 'too-large']) expect(readme, reason).toContain(`\`${reason}\``);
    expect(readme).toContain('configureWasm');
    expect(readme).toContain('LGPL-3.0');
    // Decisions 59 to 66 and 86 are asked for; every number the code comments cite must be explained too.
    const wanted = new Set([59, 60, 61, 62, 63, 64, 65, 66, 86]);
    for (const file of listing(join(first.dir, 'src'))) {
      for (const match of readFileSync(join(first.dir, 'src', file), 'utf8').matchAll(/§ (\d+)/g)) wanted.add(Number(match[1]));
    }
    for (const number of wanted) expect(readme, `decision ${number}`).toMatch(new RegExp(`- \\*\\*${number}\\. `));
    expect(wanted.has(7) && wanted.has(22) && wanted.has(33) && wanted.has(104)).toBe(true);
  });
});

describe('oss-image-engine: nothing leaves the package, nothing of the site comes in', () => {
  const dependencies = (): Set<string> => {
    const manifest = JSON.parse(readFileSync(join(first.dir, 'package.json'), 'utf8')) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };
    return new Set([...Object.keys(manifest.dependencies), ...Object.keys(manifest.devDependencies)]);
  };

  it('has no import that leaves the folder, or that names a package the manifest does not declare', () => {
    const declared = dependencies();
    let checked = 0;
    for (const file of listing(first.dir).filter((name) => name.endsWith('.ts'))) {
      const path = join(first.dir, ...file.split('/'));
      const source = ts.createSourceFile(file, readFileSync(path, 'utf8'), ts.ScriptTarget.ESNext, true);
      const literals: string[] = [];
      const visit = (node: ts.Node): void => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) literals.push(node.moduleSpecifier.text);
        else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) literals.push(node.arguments[0].text);
        ts.forEachChild(node, visit);
      };
      visit(source);
      for (const specifier of literals) {
        checked += 1;
        expect(specifier, `${file}: the engine knows no bundler syntax`).not.toMatch(/[?#]|\.wasm$/);
        if (specifier.startsWith('.')) {
          const target = resolve(dirname(path), specifier);
          expect(target.startsWith(resolve(first.dir) + sep), `${file} -> ${specifier} leaves the package`).toBe(true);
          expect(existsSync(target), `${file} -> ${specifier} does not exist`).toBe(true);
        } else if (!specifier.startsWith('node:')) {
          const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : (specifier.split('/')[0] ?? '');
          expect(declared.has(name), `${file} imports ${name}`).toBe(true);
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('has no GA4 id, Ko-fi, Pix key, contact e-mail or author site; the domain only once, in the README credit link', () => {
    const forbidden: [string, RegExp][] = [
      ['the GA4 measurement id', new RegExp(GA4_MEASUREMENT_ID.replace(/[-]/g, '\\-'))],
      ['any GA4-looking id', /\bG-[A-Z0-9]{8,}\b/],
      ['Ko-fi', /ko-?fi/i],
      ['the Ko-fi address', new RegExp(KOFI_URL.replace(/[./]/g, '\\$&'))],
      ['Pix', /\bpix\b/i],
      ['the contact e-mail', new RegExp(CONTACT_EMAIL.replace(/[.]/g, '\\.'), 'i')],
      ['any e-mail address', /[\w.+-]+@[\w-]+\.[\w.-]+/],
      ['the IndexNow key', new RegExp(INDEXNOW_KEY)],
      ['the author site', new RegExp(AUTHOR.website.replace(/https?:\/\//, '').replace(/[.]/g, '\\.'))],
      ['the author LinkedIn', /linkedin\.com/i],
      ['AdSense', /adsense|adsbygoogle|ca-pub-/i],
      ['an absolute path of this machine', /[A-Za-z]:[\\/]Users|\/home\/|\.claude[\\/]/],
    ];
    let scanned = 0;
    for (const file of listing(first.dir).filter((name) => TEXT_FILE.test(name))) {
      const body = readFileSync(join(first.dir, ...file.split('/')), 'utf8');
      scanned += 1;
      for (const [what, pattern] of forbidden) {
        // The notices quote the Apache text, which has no address, and the MIT text of a fixture, which has none either.
        expect(pattern.test(body), `${file} has ${what}`).toBe(false);
      }
      const domain = body.split(PRODUCTION_HOSTNAME).length - 1;
      if (file === 'README.md') {
        expect(domain, 'README mentions the domain once').toBe(1);
        expect(body).toContain(`[FileOrca](${SITE_ORIGIN})`);
      } else {
        expect(domain, `${file} mentions the domain`).toBe(0);
      }
    }
    expect(scanned).toBeGreaterThan(40);
  });

  it('has no path of the site in the code or in the docs of the package', () => {
    for (const file of listing(first.dir).filter((name) => /\.(ts|md)$/.test(name))) {
      const body = readFileSync(join(first.dir, ...file.split('/')), 'utf8');
      // docs/, scripts/, src/tools, src/i18n, DECISOES.md and the like belong to the site. The one site path left is
      // src/engine/image/, in the "Self-contained" line that heads each engine file: the code is copied as it is.
      expect(body, file).not.toMatch(/\b(?:docs|scripts|public)\/[a-z]/);
      expect(body, file).not.toMatch(/src\/(?:tools|i18n|pages|components|analytics|platform|calc|search)\b/);
      expect(body.replace(/src\/engine\/image\//g, ''), file).not.toMatch(/src\/engine\b/);
      expect(body, file).not.toContain('DECISOES.md');
      expect(body, file).not.toContain('PLANO-FILEORCA');
    }
  });
});

describe('oss-image-engine: two exports in a row are the same', () => {
  it('writes the same files with the same bytes, and the same report', () => {
    expect(listing(first.dir)).toEqual(listing(second.dir));
    for (const file of listing(first.dir)) expect(hash(join(first.dir, ...file.split('/'))), file).toBe(hash(join(second.dir, ...file.split('/'))));
    expect(second.files).toEqual(first.files);
    expect(second.tests).toEqual(first.tests);
  });

  it('clears what an earlier export left in its folder, and keeps the history and the npm files of a clone', () => {
    const clone = join(work, 'clone');
    exportImageEngine(clone);
    mkdirSync(join(clone, '.git'));
    writeFileSync(join(clone, '.git', 'HEAD'), 'ref: refs/heads/main\n');
    mkdirSync(join(clone, 'node_modules'));
    writeFileSync(join(clone, 'node_modules', 'kept.txt'), 'x');
    writeFileSync(join(clone, 'package-lock.json'), '{}');
    writeFileSync(join(clone, 'stale.txt'), 'a file that left the engine');
    writeFileSync(join(clone, 'src', 'gone.ts'), 'export {};\n');
    const again = exportImageEngine(clone);
    expect(again.files).toEqual(first.files);
    expect(listing(clone).filter((name) => !name.startsWith('.git/') && !name.startsWith('node_modules/') && name !== 'package-lock.json')).toEqual(first.files);
    expect(readFileSync(join(clone, '.git', 'HEAD'), 'utf8')).toBe('ref: refs/heads/main\n');
    expect(existsSync(join(clone, 'node_modules', 'kept.txt'))).toBe(true);
    expect(existsSync(join(clone, 'package-lock.json'))).toBe(true);
  });

  it('refuses to empty a folder that is not an earlier export, and the repository itself', () => {
    const other = join(work, 'other');
    mkdirSync(other);
    writeFileSync(join(other, 'notes.txt'), 'mine');
    expect(() => exportImageEngine(other)).toThrow(/not an earlier export/);
    expect(readFileSync(join(other, 'notes.txt'), 'utf8')).toBe('mine');
    writeFileSync(join(other, 'package.json'), '{"name":"something-else"}');
    expect(() => exportImageEngine(other)).toThrow(/not an earlier export/);
    // The repository, or a folder above it: tried on a stand-in for the repository, so a broken guard deletes nothing real.
    const repo = join(work, 'repo');
    mkdirSync(join(repo, 'src'), { recursive: true });
    writeFileSync(join(repo, 'src', 'keep.ts'), 'export {};\n');
    expect(() => exportImageEngine(repo, repo)).toThrow(/repository/);
    expect(() => exportImageEngine(work, repo)).toThrow(/repository/);
    expect(() => exportImageEngine(join(repo, 'src'), repo)).toThrow(/only \.cache/);
    expect(readFileSync(join(repo, 'src', 'keep.ts'), 'utf8')).toBe('export {};\n');
  });
});

describe('oss-image-engine: the tests that stay in the site (removed by AST, never by text)', () => {
  const ALL = ['jpg-01-a.jpg', 'jpg-02-b.jpg', 'heic-08-c.heic', 'heic-09-d.heic', 'gen-vazio.jpg'];
  const IN = new Set(['heic-08-c.heic', 'gen-vazio.jpg']);
  const prune = (source: string) => pruneTests(source, 'tests/unit/sample.test.ts', ALL, IN);

  it('takes out the test that reads a fixture that stays out, and keeps the one that reads a fixture that goes', () => {
    const result = prune(`
import { describe, expect, it } from 'vitest';
import { fixture, names } from './lib/oracle.ts';

describe('a', () => {
  it('reads the photo with GPS', () => {
    expect(fixture(names('jpg-02')[0]!).length).toBeGreaterThan(0);
  });

  it('reads the empty one', () => {
    expect(fixture('gen-vazio.jpg').length).toBe(0);
  });

  it('reads one by its whole name', () => {
    expect(fixture('heic-09-d.heic').length).toBeGreaterThan(0);
  });
});
`);
    expect(result.removed).toEqual(['reads the photo with GPS', 'reads one by its whole name']);
    expect(result.kept).toBe(1);
    expect(result.text).toContain("it('reads the empty one'");
    expect(result.text).not.toContain('jpg-02');
    expect(result.text).not.toContain('heic-09');
  });

  it('keeps a test whose prefix still matches an included fixture, and one that names no fixture at all', () => {
    const result = prune(`
describe('b', () => {
  it('walks every HEIC that is in', () => {
    for (const name of names('heic-')) expect(fixture(name)).toBeDefined();
  });
  it('walks every JPG, all of them out', () => {
    for (const name of names('jpg-')) expect(fixture(name)).toBeDefined();
  });
  it('names nothing', () => {
    expect(names('zzz-')).toEqual([]);
  });
});
`);
    expect(result.removed).toEqual(['walks every JPG, all of them out']);
    expect(result.kept).toBe(2);
  });

  it('is not fooled by text: a name in a comment, in a string that is not a fixture reference, or an it( inside a string', () => {
    const result = prune(`
describe('c', () => {
  // this used to read fixture('jpg-02-b.jpg') and names('jpg-01')
  it('says "it(\\'x\\', () => fixture(\\'jpg-02-b.jpg\\'))" in a message only', () => {
    const message = "fixture('jpg-02-b.jpg')";
    expect(message.length).toBeGreaterThan(0);
  });
});
`);
    expect(result.removed).toEqual([]);
    expect(result.kept).toBe(1);
    expect(result.text).toContain("// this used to read fixture('jpg-02-b.jpg')");
  });

  it('takes out a loop over fixtures that all stay out together with the tests it makes, and an empty describe with it', () => {
    const result = prune(`
describe('d', () => {
  for (const name of [...names('jpg-01'), ...names('jpg-02')]) {
    it(\`reads \${name}\`, () => {
      expect(fixture(name)).toBeDefined();
    });
  }
});
describe('e', () => {
  it('stays', () => {
    expect(1).toBe(1);
  });
});
`);
    expect(result.kept).toBe(1);
    expect(result.text).not.toContain("describe('d'");
    expect(result.text).toContain("describe('e'");
  });

  it('follows a helper that reads a fixture that stays out: the tests that use it go, the helper goes with them, unused imports too', () => {
    const source = `
import { describe, expect, it } from 'vitest';
import { fixture, names, oracle } from './lib/oracle.ts';

const photo = () => fixture(names('jpg-02')[0]!);
const bigger = () => photo().length + 1;
const helper = (x: number) => x + 1;

describe('f', () => {
  it('uses the helper chain', () => {
    expect(bigger()).toBeGreaterThan(0);
  });
  it('uses the plain helper', () => {
    expect(helper(1)).toBe(2);
  });
});
`;
    const pruned = prune(source);
    expect(pruned.removed).toEqual(['uses the helper chain']);
    expect(pruned.text).not.toContain('const photo');
    expect(pruned.text).not.toContain('const bigger');
    expect(pruned.text).toContain('const helper');
    const clean = dropUnusedImports(pruned.text, 'tests/unit/sample.test.ts');
    expect(clean).toContain("import { describe, expect, it } from 'vitest';");
    expect(clean).not.toContain('./lib/oracle.ts'); // nothing of it is used any more
  });

  it('drops only the names of an import that nothing uses, and keeps the shape of the import', () => {
    const clean = dropUnusedImports(`import { a, b, c } from './x.ts';\nimport type { T, U } from './y.ts';\nconsole.log(a, c);\nconst v: U = 1 as never;\nconst o = { b: 1 }.b;\n`, 'x.ts');
    expect(clean).toContain("import { a, c } from './x.ts';");
    expect(clean).toContain("import type { U } from './y.ts';");
    expect(clean).not.toContain('T,');
  });

  it('leaves a declaration alone when something still reads it', () => {
    const kept = dropUnusedDeclarations(`const a = 1;\nconst b = a + 1;\nexport const c = b;\n`, 'x.ts');
    expect(kept).toContain('const a = 1;');
    const dropped = dropUnusedDeclarations(`const a = 1;\nconst b = a + 1;\n`, 'x.ts');
    expect(dropped.trim()).toBe('');
  });
});

describe('oss-image-engine: the layout and the imports of the tests', () => {
  it('maps the site files to the package and refuses anything else', () => {
    expect(packagePath('src/engine/image/codecs/jpeg.ts')).toBe('src/codecs/jpeg.ts');
    expect(packagePath('tests/unit/engine-probe.test.ts')).toBe('tests/engine-probe.test.ts');
    expect(packagePath('tests/unit/lib/bytes.ts')).toBe('tests/lib/bytes.ts');
    expect(packagePath('tests/e2e/lib/jpeg.ts')).toBe('tests/lib/jpeg.ts');
    expect(() => packagePath('src/tools/image/names.ts')).toThrow(/leave the package/);
    expect(() => packagePath('tests/unit/pdf-engine-ops.test.ts')).toThrow(/leave the package/);
  });

  it('rewrites the relative imports of a test to the package layout, keeping the quotes, and reports the helpers it needs', () => {
    const rewritten = rewriteSpecifiers(
      `import { processImage } from '../../src/engine/image/process.ts';\nimport { exifBlock } from "../e2e/lib/jpeg.ts";\nimport { cat } from './lib/bytes.ts';\nimport { it } from 'vitest';\nconst later = import('../../src/engine/image/zip.ts');\n`,
      'tests/unit/engine-process.test.ts',
    );
    expect(rewritten.text).toContain("from '../src/process.ts'");
    expect(rewritten.text).toContain('from "./lib/jpeg.ts"');
    expect(rewritten.text).toContain("from './lib/bytes.ts'");
    expect(rewritten.text).toContain("from 'vitest'");
    expect(rewritten.text).toContain("import('../src/zip.ts')");
    expect(rewritten.needs).toEqual(['tests/e2e/lib/jpeg.ts', 'tests/unit/lib/bytes.ts']);
  });

  it('fails when a test imports something of the site', () => {
    expect(() => rewriteSpecifiers(`import { names } from '../../src/tools/image/names.ts';\n`, 'tests/unit/engine-process.test.ts')).toThrow(/leave the package/);
  });
});
