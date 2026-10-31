import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  bundledPackageDirs,
  checkLicensesPage,
  checkRecordMatchesDist,
  checkSeparateFile,
  classifyModule,
  compareBundleWithList,
  readDistFacts,
  type DistFacts,
} from '../../scripts/lib/licenses-check.ts';
import {
  BUNDLED_TRANSITIVE,
  LIBDE265_VERSION,
  SEPARATE_FILE_RULES,
  UPSTREAM_TEXT_DIR,
  UPSTREAM_TEXTS,
  browserPackages,
  bundledPackages,
  isAllowedLicense,
  isSeparateFileOnly,
  lgplSources,
  listedPackages,
} from '../../src/platform/licenses.ts';

const ROOT = '/work/fileorca';
const PNPM = `${ROOT}/node_modules/.pnpm`;
const GLUE = `${PNPM}/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js`;
const WASM_URL = `${PNPM}/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.wasm?url`;
const LOADER = `${ROOT}/src/engine/image/codecs/heic.ts`;
const PACKAGE_SHA = 'a'.repeat(64);
const rule = SEPARATE_FILE_RULES[0]!;

/** A dist where libheif is the way the gate wants it: the glue and its loader in one chunk, the .wasm apart. */
function goodFacts(): DistFacts {
  return {
    wasm: [
      { file: '_astro/libheif-BfiPCEgt.wasm', sha256: PACKAGE_SHA },
      { file: '_astro/libheif.BfiPCEgt.wasm', sha256: PACKAGE_SHA },
      { file: '_astro/mozjpeg_enc-DO-zoExo.wasm', sha256: 'b'.repeat(64) },
    ],
    chunks: [
      { file: '_astro/heic-wrc4mF59.js', modules: [GLUE, WASM_URL, LOADER, '__vite-browser-external'], inlineWasm: false },
      { file: '_astro/worker-C2Qald36.js', modules: [`${ROOT}/src/engine/image/worker.ts`, `${PNPM}/comlink@4.4.2/node_modules/comlink/dist/esm/comlink.mjs`], inlineWasm: false },
    ],
  };
}

describe('módulos do bundle', () => {
  it('names the package of a module id, scoped or nested, with / or \\', () => {
    expect(classifyModule(GLUE, ROOT)).toEqual({ kind: 'package', name: 'libheif-js', dir: `${PNPM}/libheif-js@1.23.5/node_modules/libheif-js` });
    expect(classifyModule(`C:\\work\\fileorca\\node_modules\\.pnpm\\@cantoo+pdf-lib@2.11.1_html-entities@2.6.0\\node_modules\\@cantoo\\pdf-lib\\es\\index.js`, 'C:\\work\\fileorca')).toMatchObject({ kind: 'package', name: '@cantoo/pdf-lib' });
    expect(classifyModule(`${PNPM}/culori@4.0.2/node_modules/culori/src/index.js?commonjs-proxy`, ROOT)).toMatchObject({ kind: 'package', name: 'culori' });
    // The last node_modules wins, so a package nested inside another one is itself.
    expect(classifyModule(`${ROOT}/node_modules/a/node_modules/@s/b/index.js`, ROOT)).toMatchObject({ kind: 'package', name: '@s/b' });
  });

  it('tells first-party code from what the bundler makes up', () => {
    expect(classifyModule(LOADER, ROOT)).toMatchObject({ kind: 'source', name: 'src/engine/image/codecs/heic.ts' });
    expect(classifyModule('../../src/tools/image/mount.ts', ROOT)).toMatchObject({ kind: 'source', name: 'src/tools/image/mount.ts' });
    for (const virtual of ['__vite-browser-external', `${ROOT}/__vite-browser-external`, 'vite/preload-helper.js', 'rolldown/runtime.js']) {
      expect(classifyModule(virtual, ROOT).kind, virtual).toBe('virtual');
    }
  });

  it('collects every package of the record with the chunks it is in', () => {
    const found = bundledPackageDirs({
      '_astro/a.js': [GLUE, LOADER],
      '_astro/b.js': [GLUE, `${PNPM}/tslib@2.8.1/node_modules/tslib/tslib.es6.mjs`],
    }, ROOT);
    expect([...found.keys()].sort()).toEqual(['libheif-js', 'tslib']);
    expect(found.get('libheif-js')?.chunks).toEqual(['_astro/a.js', '_astro/b.js']);
  });
});

describe('o bundle contra a lista da /licenses', () => {
  const bundled = new Map([['culori', { chunks: ['_astro/w.js'] }], ['preact', { chunks: ['_astro/i.js'] }]]);

  it('passes when every bundled package is listed and every listed transitive is bundled', () => {
    expect(compareBundleWithList(bundled, { direct: ['preact', 'astro'], transitive: ['culori'] })).toEqual([]);
  });

  it('fails when a package in the bundle is missing from the page', () => {
    const problems = compareBundleWithList(bundled, { direct: ['preact'], transitive: [] });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('culori');
    expect(problems[0]).toContain('_astro/w.js');
  });

  it('fails when a listed transitive package has left the bundle', () => {
    const problems = compareBundleWithList(bundled, { direct: ['preact'], transitive: ['culori', 'tslib'] });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('tslib');
  });
});

describe('LGPL só como arquivo separado', () => {
  it('passes for a .wasm apart and byte-identical, with the glue next to nothing but its loader', () => {
    expect(checkSeparateFile(rule, PACKAGE_SHA, goodFacts(), ROOT)).toEqual([]);
  });

  it('passes when the library is not in the bundle at all', () => {
    const facts = goodFacts();
    facts.wasm = facts.wasm.filter((entry) => !entry.file.includes('libheif'));
    facts.chunks = facts.chunks.filter((chunk) => !chunk.file.includes('heic'));
    expect(checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT)).toEqual([]);
  });

  it('fails when a .wasm in dist differs from the package file', () => {
    const facts = goodFacts();
    facts.wasm[1] = { file: '_astro/libheif.BfiPCEgt.wasm', sha256: 'c'.repeat(64) };
    const problems = checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('libheif.BfiPCEgt.wasm');
    expect(problems[0]).toContain('difere');
  });

  it('fails when there is no separate .wasm (inlined or missing)', () => {
    const facts = goodFacts();
    facts.wasm = facts.wasm.filter((entry) => !entry.file.includes('libheif'));
    expect(checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT).join('\n')).toContain('arquivo separado');
  });

  it('fails when the .wasm is inlined in a chunk as base64', () => {
    const facts = goodFacts();
    facts.chunks[0] = { ...facts.chunks[0]!, inlineWasm: true };
    expect(checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT).join('\n')).toContain('base64');
  });

  it('fails when the glue is merged into a chunk with another package', () => {
    const facts = goodFacts();
    facts.chunks[0]!.modules.push(`${PNPM}/comlink@4.4.2/node_modules/comlink/dist/esm/comlink.mjs`);
    const problems = checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('comlink');
    expect(problems[0]).toContain('heic-wrc4mF59.js');
  });

  it('fails when the glue is merged into a chunk with first-party code other than its loader', () => {
    const facts = goodFacts();
    facts.chunks[0]!.modules.push(`${ROOT}/src/engine/image/process.ts`);
    const problems = checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('src/engine/image/process.ts');
  });

  it('fails when the glue sits in the same chunk as another codec (the merge a bundler does when asked to)', () => {
    const facts = goodFacts();
    facts.chunks = [{ file: '_astro/codecs.js', modules: [GLUE, `${PNPM}/@jsquash+jpeg@1.6.0/node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.js`], inlineWasm: false }];
    expect(checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT).join('\n')).toContain('@jsquash/jpeg');
  });

  it('fails when the .wasm is in dist but no chunk has the glue', () => {
    const facts = goodFacts();
    facts.chunks = facts.chunks.filter((chunk) => !chunk.file.includes('heic'));
    expect(checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT).join('\n')).toContain('nenhum chunk');
  });
});

describe('a página /licenses', () => {
  const sources = lgplSources('1.23.5').map((link) => link.url);
  function page(options: { packages?: string[]; texts?: string[]; notice?: boolean; links?: string[]; extra?: string } = {}): string {
    const rows = (options.packages ?? ['libheif-js', 'culori']).map((name) => `<tr><td><a href="https://x">${name}</a></td></tr>`).join('');
    const pres = (options.texts ?? ['LGPL text\nline two', 'MIT text']).map((text) => `<pre>${text}</pre>`).join('');
    const links = (options.links ?? sources).map((url) => `<a href="${url}">x</a>`).join('');
    const notice = options.notice === false ? '' : `<section data-license-notice="lgpl">${links}</section>`;
    return `<html><body>${notice}<table>${rows}</table>${pres}${options.extra ?? ''}</body></html>`;
  }
  const expected = [{ name: 'libheif-js', texts: [{ text: 'LGPL text\n  line two' }] }, { name: 'culori', texts: [{ text: 'MIT text' }] }];

  it('passes with every package, every text and the notice with its links', () => {
    expect(checkLicensesPage(page(), expected, ['satori'], { sources })).toEqual([]);
  });

  it('fails when a package is missing, a text is missing or a build-only package is listed', () => {
    expect(checkLicensesPage(page({ packages: ['libheif-js'] }), expected, [], null).join('\n')).toContain('culori');
    expect(checkLicensesPage(page({ texts: ['LGPL text, shortened'] }), expected, [], null).join('\n')).toContain('falta um texto');
    expect(checkLicensesPage(page({ extra: '<a>satori</a>' }), expected, ['satori'], null).join('\n')).toContain('só de build');
  });

  it('fails without the LGPL notice or without one of its source links', () => {
    expect(checkLicensesPage(page({ notice: false }), expected, [], { sources }).join('\n')).toContain('sem o aviso da LGPL');
    const problems = checkLicensesPage(page({ links: sources.slice(1) }), expected, [], { sources });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(sources[0]);
  });
});

describe('o registro do bundle e o dist', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function fakeDist(files: Record<string, string | Buffer>): string {
    const dir = mkdtempSync(join(tmpdir(), 'fileorca-dist-'));
    dirs.push(dir);
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(join(dir, name, '..'), { recursive: true });
      writeFileSync(join(dir, name), content);
    }
    return dir;
  }

  it('reads the .wasm hashes and the chunks of the record, and spots an inlined module', () => {
    const wasm = Buffer.from([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0]);
    const dist = fakeDist({
      '_astro/libheif-x.wasm': wasm,
      '_astro/a.js': 'export default 1;',
      '_astro/b.js': `export default "data:application/wasm;base64,${wasm.toString('base64')}AAAA";`,
    });
    const facts = readDistFacts({ '_astro/a.js': [GLUE], '_astro/b.js': [GLUE] }, dist);
    expect(facts.wasm).toEqual([{ file: '_astro/libheif-x.wasm', sha256: createHash('sha256').update(wasm).digest('hex') }]);
    expect(facts.chunks.map((chunk) => [chunk.file, chunk.inlineWasm])).toEqual([['_astro/a.js', false], ['_astro/b.js', true]]);
  });

  it('rejects a record that does not match the dist', () => {
    const dist = fakeDist({ '_astro/a.js': '1', '_astro/b.js': '2' });
    expect(checkRecordMatchesDist({ '_astro/a.js': [], '_astro/b.js': [] }, dist)).toEqual([]);
    expect(checkRecordMatchesDist({ '_astro/a.js': [], '_astro/gone.js': [] }, dist).join('\n')).toMatch(/gone\.js.*não existe/);
    expect(checkRecordMatchesDist({ '_astro/a.js': [] }, dist).join('\n')).toMatch(/b\.js.*não está no registro/);
  });
});

describe('os pacotes e os textos de licença', () => {
  it('lists the direct dependencies and the packages that come inside them', () => {
    const names = listedPackages().map((pkg) => pkg.name);
    for (const expected of ['@cantoo/pdf-lib', '@jsquash/avif', '@jsquash/jpeg', '@jsquash/oxipng', '@jsquash/resize', '@jsquash/webp', 'fflate', 'libheif-js']) expect(names, expected).toContain(expected);
    expect(bundledPackages().map((pkg) => pkg.name).sort()).toEqual(BUNDLED_TRANSITIVE.map((entry) => entry.name).sort());
    expect(bundledPackages().map((pkg) => pkg.name)).toEqual(expect.arrayContaining(['culori', 'node-html-better-parser', 'html-entities', 'tslib']));
  });

  it('gives every listed package an allowed license (LGPL only with its rule) and a license text', () => {
    for (const pkg of listedPackages()) {
      expect(pkg.version, pkg.name).toMatch(/^\d/);
      expect(pkg.text, pkg.name).toBeTruthy();
      expect(pkg.texts[0]?.text, pkg.name).toBe(pkg.text);
      if (isSeparateFileOnly(pkg.license)) expect(SEPARATE_FILE_RULES.map((item) => item.package), pkg.name).toContain(pkg.name);
      else expect(isAllowedLicense(pkg.license), `${pkg.name} ${pkg.license}`).toBe(true);
    }
  });

  it('shows the codec licenses of the jSquash packages and the libheif license file with the GPL it refers to', () => {
    const byName = new Map(listedPackages().map((pkg) => [pkg.name, pkg]));
    const labels = (name: string) => byName.get(name)?.texts.map((entry) => entry.label);
    expect(labels('@jsquash/jpeg')).toEqual([null, 'MozJPEG and libjpeg-turbo']);
    expect(labels('@jsquash/webp')).toEqual([null, 'libwebp']);
    expect(labels('@jsquash/oxipng')).toEqual([null, 'OxiPNG']);
    expect(labels('@jsquash/resize')).toEqual([null, 'resize (Rust crate)']);
    expect(labels('@jsquash/avif')).toEqual([null, 'libsharpyuv (from libwebp)', 'libavif 1.0.1', 'libaom 3.7.0', 'libaom 3.7.0, patent license']);
    const heif = byName.get('libheif-js');
    expect(heif?.license).toBe('LGPL-3.0');
    const whole = heif?.texts.map((entry) => entry.text).join('\n');
    expect(whole).toContain('GNU LESSER GENERAL PUBLIC LICENSE');
    expect(whole).toContain('GNU GENERAL PUBLIC LICENSE');
  });

  it('keeps the upstream texts byte for byte, with the address they were copied from', () => {
    const hashes: Record<string, string> = {
      'libavif-1.0.1-LICENSE.txt': '10952217a6d404de8bf8a997fbea9b88f682df1fe98cb9b9f467ade641525639',
      'libaom-3.7.0-LICENSE.txt': '4764a286d8b2faeaf42f4418e7d7a28d58fc8fd4d00a3d0a7f44b0a4099de7f2',
      'libaom-3.7.0-PATENTS.txt': '661fb8e504744e95587b556b94a58343448300606a41bea8c7a9b97125696e61',
    };
    const entries = Object.values(UPSTREAM_TEXTS).flat();
    expect(entries.map((entry) => entry.file).sort()).toEqual(Object.keys(hashes).sort());
    for (const entry of entries) {
      expect(entry.source).toMatch(/^https:\/\//);
      expect(createHash('sha256').update(readFileSync(join(UPSTREAM_TEXT_DIR, entry.file))).digest('hex'), entry.file).toBe(hashes[entry.file]);
    }
    const texts = listedPackages().find((pkg) => pkg.name === '@jsquash/avif')?.texts ?? [];
    expect(texts.find((entry) => entry.label === 'libavif 1.0.1')?.text).toContain('Copyright 2019 Joe Drago');
    expect(texts.find((entry) => entry.label === 'libaom 3.7.0')?.text).toContain('Alliance for Open Media');
    expect(texts.find((entry) => entry.label === 'libaom 3.7.0, patent license')?.source).toContain('PATENTS');
  });

  it('points to the source of the libheif version in use', () => {
    const version = browserPackages().find((pkg) => pkg.name === 'libheif-js')?.version ?? '';
    const links = Object.fromEntries(lgplSources(version).map((link) => [link.id, link]));
    expect(links['libheif']?.url).toBe(`https://github.com/strukturag/libheif/tree/v${version}`);
    expect(links['wrapper']?.url).toBe(`https://github.com/catdad-experiments/libheif-js/tree/${version}`);
    expect(links['build']?.url).toBe(`https://github.com/catdad-experiments/libheif-emscripten/tree/v${version}`);
    expect(links['libde265']?.url).toBe(`https://github.com/strukturag/libde265/tree/v${LIBDE265_VERSION}`);
  });
});
