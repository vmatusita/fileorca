import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  PDFJS_SERVED,
  PDF_PACKAGES,
  QR_PACKAGES,
  SHARED_ISLAND_CHUNK,
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
  classifyModule,
  compareBundleWithList,
  embeddedPackages,
  licenseUrlsIn,
  readDistFacts,
  readPackageHashes,
  readPdfjsServed,
  readPrebuiltFiles,
  readWasmSources,
  wasmStem,
  type DistFacts,
  type ServedFile,
  type WasmSource,
} from '../../scripts/lib/licenses-check.ts';
import { copyPdfjsData, pdfjsDataFiles, pdfjsDataPath, pdfjsPackageDir, pdfjsVersion } from '../../src/platform/pdfjs-data.ts';
import {
  BUNDLED_TRANSITIVE,
  LIBDE265_VERSION,
  SEPARATE_FILE_RULES,
  UPSTREAM_OWN_TEXTS,
  UPSTREAM_TEXT_DIR,
  UPSTREAM_TEXTS,
  browserPackages,
  bundledPackages,
  findPackageDir,
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

/** A dist where libheif is the way the gate wants it: the glue alone in its chunk, the .wasm apart, the loader elsewhere. */
function goodFacts(): DistFacts {
  return {
    wasm: [
      { file: '_astro/libheif-BfiPCEgt.wasm', sha256: PACKAGE_SHA },
      { file: '_astro/libheif.BfiPCEgt.wasm', sha256: PACKAGE_SHA },
      { file: '_astro/mozjpeg_enc-DO-zoExo.wasm', sha256: 'b'.repeat(64) },
    ],
    chunks: [
      { file: '_astro/libheif-n4nZnanS.js', modules: [GLUE, '__vite-browser-external'], inlineWasm: false },
      { file: '_astro/heic-wrc4mF59.js', modules: [WASM_URL, LOADER], inlineWasm: false },
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
  it('passes for a .wasm apart and byte-identical, with the glue alone in its chunk', () => {
    expect(checkSeparateFile(rule, PACKAGE_SHA, goodFacts(), ROOT)).toEqual([]);
  });

  it('passes when the library is not in the bundle at all', () => {
    const facts = goodFacts();
    facts.wasm = facts.wasm.filter((entry) => !entry.file.includes('libheif'));
    facts.chunks = facts.chunks.filter((chunk) => !chunk.file.includes('heic') && !chunk.file.includes('libheif'));
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
    expect(problems[0]).toContain('libheif-n4nZnanS.js');
  });

  it('fails when the glue is merged with its own loader (the layout before the libheif chunk group)', () => {
    const facts = goodFacts();
    facts.chunks[0]!.modules.push(LOADER);
    const problems = checkSeparateFile(rule, PACKAGE_SHA, facts, ROOT);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('src/engine/image/codecs/heic.ts');
  });

  it('fails when the glue is merged into a chunk with any other first-party code', () => {
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
    facts.chunks = facts.chunks.filter((chunk) => !chunk.file.includes('libheif'));
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

// ---- F5a: the PDF libraries, every .wasm and every PDF.js data file identical to the package's ------------------------------

const sha = (char: string): string => char.repeat(64);

describe('as bibliotecas de PDF no bundle (F5a)', () => {
  const bundled = new Map<string, unknown>([['pdfjs-dist', {}], ['@neslinesli93/qpdf-wasm', {}], ['preact', {}]]);

  it('passes when pdfjs-dist and qpdf-wasm are in the bundle', () => {
    expect(PDF_PACKAGES).toEqual(['pdfjs-dist', '@neslinesli93/qpdf-wasm']);
    expect(checkRequiredInBundle(bundled)).toEqual([]);
  });

  it('fails when one of the two is not in the bundle', () => {
    expect(checkRequiredInBundle(new Map([['pdfjs-dist', {}]]))).toEqual(['@neslinesli93/qpdf-wasm não está no bundle, mas as ferramentas de PDF dependem dele']);
    expect(checkRequiredInBundle(new Map([['@neslinesli93/qpdf-wasm', {}]]))).toEqual(['pdfjs-dist não está no bundle, mas as ferramentas de PDF dependem dele']);
    expect(checkRequiredInBundle(new Map())).toHaveLength(2);
  });

  it('is listed on /licenses: both are browser dependencies with a license text', () => {
    const names = browserPackages().map((pkg) => pkg.name);
    for (const name of PDF_PACKAGES) expect(names, name).toContain(name);
  });
});

// ---- F7, decision 8: the library of the QR code generator stays on its own page -----------------------------------------

describe('a biblioteca do gerador de QR code no bundle (F7)', () => {
  const QR = `${PNPM}/qrcode@1.5.4/node_modules/qrcode`;
  const core = (file: string): string => `${QR}/lib/core/${file}`;
  const DIJKSTRA = `${PNPM}/qrcode@1.5.4/node_modules/dijkstrajs/dijkstra.js`;
  const ENTRY = '_astro/QrTool.astro_astro_type_script_index_0_lang.BaprFXds.js';
  const ISLAND = '_astro/island.B96aGO_S.js';
  /** The bundle as the build makes it: the matrix and dijkstrajs in the QR page's own entry, nothing of them in the island. */
  const good = () => ({
    [ENTRY]: [core('qrcode.js'), core('segments.js'), core('byte-data.js'), DIJKSTRA, `${ROOT}/src/tools/qr-code-generator/qr.ts`],
    [ISLAND]: [`${PNPM}/preact@11.1.0/node_modules/preact/dist/preact.mjs`, `${ROOT}/src/tools/image/OptionGroup.tsx`],
    '_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bn3BoR6T.js': [`${ROOT}/src/tools/compress-image/Panel.tsx`],
  });

  it('passes when qrcode and dijkstrajs are in one chunk, the same one, and it is not the shared island', () => {
    expect(QR_PACKAGES).toEqual(['qrcode', 'dijkstrajs']);
    expect(checkQrBundle(good(), ROOT)).toEqual([]);
    expect(SHARED_ISLAND_CHUNK.test(ISLAND)).toBe(true);
    expect(SHARED_ISLAND_CHUNK.test(ENTRY)).toBe(false);
  });

  it('fails when either of them goes into the island chunk every tool page loads', () => {
    const record = good();
    record[ISLAND].push(DIJKSTRA);
    record[ENTRY] = record[ENTRY].filter((id) => id !== DIJKSTRA);
    expect(checkQrBundle(record, ROOT)).toEqual([`dijkstrajs está no chunk compartilhado ${ISLAND}, que toda página de ferramenta carrega`, `qrcode e dijkstrajs estão em chunks diferentes (${ENTRY}, ${ISLAND}), pede o mesmo`]);
    const both = { [ISLAND]: [...good()[ENTRY], ...good()[ISLAND]] };
    expect(checkQrBundle(both, ROOT)).toEqual([
      `qrcode está no chunk compartilhado ${ISLAND}, que toda página de ferramenta carrega`,
      `dijkstrajs está no chunk compartilhado ${ISLAND}, que toda página de ferramenta carrega`,
    ]);
  });

  it('fails when a package is in more than one chunk, or missing from the bundle', () => {
    const twice = { ...good(), '_astro/other.Abc12345.js': [core('version.js')] };
    expect(checkQrBundle(twice, ROOT)).toEqual([`qrcode está em 2 chunks (${ENTRY}, _astro/other.Abc12345.js), pede 1`]);
    const none = { [ISLAND]: good()[ISLAND] };
    expect(checkQrBundle(none, ROOT)).toEqual(['qrcode não está no bundle, mas o gerador de QR code depende dele', 'dijkstrajs não está no bundle, mas o gerador de QR code depende dele']);
  });

  it('fails when the bundle takes more of qrcode than the matrix (the renderers of its index)', () => {
    const record = good();
    record[ENTRY].push(`${QR}/lib/renderer/svg-tag.js`, `${QR}/lib/browser.js`);
    expect(checkQrBundle(record, ROOT)).toEqual([
      'qrcode traz lib/renderer/svg-tag.js ao bundle, fora de lib/core/ (só a matriz é usada)',
      'qrcode traz lib/browser.js ao bundle, fora de lib/core/ (só a matriz é usada)',
    ]);
  });

  it('is listed on /licenses: qrcode is a browser dependency and dijkstrajs comes inside it, both MIT with a text', () => {
    expect(browserPackages().map((pkg) => pkg.name)).toContain('qrcode');
    expect(BUNDLED_TRANSITIVE).toContainEqual({ name: 'dijkstrajs', via: 'qrcode' });
    const byName = new Map(listedPackages().map((pkg) => [pkg.name, pkg]));
    for (const name of QR_PACKAGES) expect(byName.get(name)?.license, name).toBe('MIT');
    expect(byName.get('qrcode')?.text).toMatch(/Copyright \(c\) 2012 Ryan Day[\s\S]*Permission is hereby granted, free of charge/);
    expect(byName.get('dijkstrajs')?.text).toMatch(/Wyatt Baldwin[\s\S]*Licensed under the MIT license/);
    expect(byName.get('dijkstrajs')?.via).toBe('qrcode');
  });

  it('carries the notice of Kazuhiko Arase, which the minifier drops from the code, exactly as the installed qrcode has it', () => {
    const notice = listedPackages().find((pkg) => pkg.name === 'qrcode')?.texts.find((entry) => entry.label?.startsWith('QRCode for JavaScript'));
    expect(notice?.text).toContain('Copyright (c) 2009 Kazuhiko Arase');
    expect(notice?.source).toBe('https://unpkg.com/qrcode@1.5.4/lib/core/qrcode.js');
    const installed = readFileSync(join(findPackageDir('qrcode', process.cwd()) ?? '', 'lib/core/qrcode.js'), 'utf8');
    expect(installed).toContain(readFileSync(join(UPSTREAM_TEXT_DIR, 'qrcode-1.5.4-qrcode-for-javascript.txt'), 'utf8').trimEnd());
    expect(browserPackages().find((pkg) => pkg.name === 'qrcode')?.version).toBe('1.5.4');
  });
});

describe('os arquivos de dados do PDF.js (F5a)', () => {
  const FILES = ['wasm/jbig2.wasm', 'wasm/openjpeg.wasm', 'standard_fonts/FoxitSerif.pfb', 'cmaps/Adobe-Japan1-0.bcmap'];
  // The same input the check takes, with the arrays and the map open to the changes of the tests.
  interface Input { versions: string[]; version: string; served: ServedFile[]; source: Map<string, string>; expected: string[] }
  const input = (change: (entry: Input) => void = () => {}): Input => {
    const entry: Input = {
      versions: ['6.4.299'],
      version: '6.4.299',
      served: FILES.map((file, index) => ({ file, sha256: sha(String(index)) })),
      source: new Map(FILES.map((file, index) => [file, sha(String(index))])),
      expected: [...FILES],
    };
    change(entry);
    return entry;
  };

  it('passes when every file is served unchanged, in the folder of the installed version', () => {
    expect(checkPdfjsData(input())).toEqual([]);
  });

  it('fails when a served file differs from the package file', () => {
    const problems = checkPdfjsData(input((entry) => entry.served.splice(0, 1, { file: 'wasm/jbig2.wasm', sha256: sha('f') })));
    expect(problems).toEqual([`wasm/jbig2.wasm no dist difere do arquivo do pdfjs-dist (SHA-256 ${'f'.repeat(12)}… no lugar de ${'0'.repeat(12)}…)`]);
  });

  it('fails when the build leaves out a file it means to copy', () => {
    const problems = checkPdfjsData(input((entry) => entry.served.pop()));
    expect(problems).toEqual(['falta cmaps/Adobe-Japan1-0.bcmap no dist (o build deveria copiá-lo)']);
  });

  it('fails when the folder is of another version, or there are two', () => {
    expect(checkPdfjsData(input((entry) => { entry.versions = ['6.3.289']; })).join()).toMatch(/tem 6\.3\.289, esperado só 6\.4\.299/);
    expect(checkPdfjsData(input((entry) => { entry.versions = ['6.4.299', '6.3.289']; })).join()).toMatch(/tem 6\.4\.299, 6\.3\.289, esperado só 6\.4\.299/);
    expect(checkPdfjsData(input((entry) => { entry.versions = []; })).join()).toMatch(/tem nenhuma pasta/);
  });

  it('fails for a file of a kind /licenses has no text for: Liberation fonts, the colour profile, qcms, the scripting sandbox', () => {
    for (const file of ['standard_fonts/LiberationSans-Regular.ttf', 'iccs/CGATS001Compat-v2-micro.icc', 'wasm/qcms_bg.wasm', 'wasm/quickjs-eval.wasm', 'wasm/jbig2_nowasm_fallback.js', 'cmaps/LICENSE', 'standard_fonts/LICENSE_LIBERATION']) {
      const problems = checkPdfjsData(
        input((entry) => {
          entry.served.push({ file, sha256: sha('9') });
          entry.source.set(file, sha('9'));
        }),
      );
      expect(problems.join('\n'), file).toMatch(new RegExp(`${file.replace(/[.\\/]/g, '\\$&')} no dist não é de um tipo que a /licenses cobre`));
    }
  });

  it('fails for a file that the package does not have', () => {
    const problems = checkPdfjsData(input((entry) => entry.served.push({ file: 'cmaps/Made-Up-H.bcmap', sha256: sha('8') })));
    expect(problems).toEqual(['cmaps/Made-Up-H.bcmap no dist não existe no pdfjs-dist instalado']);
  });

  it('knows the kinds the build copies: the two decoders, the CMaps and the Foxit fonts', () => {
    expect(PDFJS_SERVED.map((entry) => entry.kind)).toEqual(['decodificador WebAssembly', 'CMap', 'fonte padrão da Foxit']);
    for (const file of pdfjsDataFiles()) expect(PDFJS_SERVED.some((entry) => entry.pattern.test(file)), file).toBe(true);
  });

  it('proves it on the real package: the build list exists in pdfjs-dist, a copy passes and a changed byte fails', () => {
    const version = pdfjsVersion();
    const files = pdfjsDataFiles();
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) expect(existsSync(join(pdfjsPackageDir(), file)), file).toBe(true);
    // A dist with the copy the build makes (the files of the list), then the same with one byte of jbig2.wasm changed.
    const dist = mkdtempSync(join(tmpdir(), 'fileorca-pdfjs-'));
    try {
      const out = join(dist, pdfjsDataPath());
      expect(copyPdfjsData(dist)).toBe(files.length);
      const read = () => readPdfjsServed(version, dist);
      const sources = (served: { file: string }[]) => readPackageHashes(pdfjsPackageDir(), served.map((entry) => entry.file));
      const clean = read();
      expect(clean.versions).toEqual([version]);
      expect(clean.served).toHaveLength(files.length);
      expect(checkPdfjsData({ versions: clean.versions, version, served: clean.served, source: sources(clean.served), expected: files })).toEqual([]);
      const target = join(out, 'wasm', 'jbig2.wasm');
      const bytes = readFileSync(target);
      bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0xff;
      writeFileSync(target, bytes);
      const changed = read();
      expect(checkPdfjsData({ versions: changed.versions, version, served: changed.served, source: sources(changed.served), expected: files }).join('\n')).toMatch(/wasm\/jbig2\.wasm no dist difere do arquivo do pdfjs-dist/);
    } finally {
      rmSync(dist, { recursive: true, force: true });
    }
  });
});

describe('os .wasm do dist contra os dos pacotes (F5a)', () => {
  const QPDF = sha('1');
  const MOZ = sha('2');
  const sources: WasmSource[] = [
    { pkg: '@neslinesli93/qpdf-wasm', file: 'dist/qpdf.wasm', sha256: QPDF },
    { pkg: '@jsquash/jpeg', file: 'codec/enc/mozjpeg_enc.wasm', sha256: MOZ },
    { pkg: 'pdfjs-dist', file: 'wasm/jbig2.wasm', sha256: sha('3') },
  ];
  const listed = new Set(['@neslinesli93/qpdf-wasm', '@jsquash/jpeg', 'pdfjs-dist']);
  const good = [
    { file: '_astro/qpdf-C3Giu3T4.wasm', sha256: QPDF },
    { file: '_astro/mozjpeg_enc-DO-zoExo.wasm', sha256: MOZ },
    { file: '_astro/mozjpeg_enc.DO-zoExo.wasm', sha256: MOZ },
    { file: '_astro/pdfjs/6.4.299/wasm/jbig2.wasm', sha256: sha('3') },
  ];

  it('takes the name of the .wasm a package has, without the hash of the bundler', () => {
    for (const [name, stem] of [['_astro/qpdf-C3Giu3T4.wasm', 'qpdf'], ['_astro/qpdf.C3Giu3T4.wasm', 'qpdf'], ['_astro/mozjpeg_enc-DO-zoExo.wasm', 'mozjpeg_enc'], ['_astro/squoosh_oxipng_bg-OFMN1KwG.wasm', 'squoosh_oxipng_bg'], ['_astro/webp_enc_simd.CFvKQ_80.wasm', 'webp_enc_simd']] as const) {
      expect(wasmStem(name), name).toBe(stem);
    }
    for (const name of ['jbig2.wasm', 'wasm/openjpeg.wasm', 'qpdf-short.wasm', 'qpdf.js']) expect(wasmStem(name), name).toBeNull();
  });

  it('passes when every .wasm is identical to its package file, both copies of a name, and leaves the PDF.js ones to their own check', () => {
    expect(checkWasmIdentity(good, sources, listed)).toEqual([]);
  });

  it('fails when a .wasm differs from the package file', () => {
    const problems = checkWasmIdentity([{ file: '_astro/qpdf-C3Giu3T4.wasm', sha256: sha('e') }], sources, listed);
    expect(problems).toEqual([`dist/_astro/qpdf-C3Giu3T4.wasm difere do qpdf.wasm de @neslinesli93/qpdf-wasm (SHA-256 ${'e'.repeat(12)}… no lugar de ${'1'.repeat(12)}…)`]);
    // One copy of two changed is caught.
    const one = checkWasmIdentity([good[1] as (typeof good)[number], { file: '_astro/mozjpeg_enc.DO-zoExo.wasm', sha256: sha('d') }], sources, listed);
    expect(one).toHaveLength(1);
    expect(one[0]).toContain('mozjpeg_enc.DO-zoExo.wasm difere do mozjpeg_enc.wasm de @jsquash/jpeg');
  });

  it('fails when no package has a .wasm of that name, or the name does not look like the bundler\'s', () => {
    expect(checkWasmIdentity([{ file: '_astro/mystery-AbCdEf12.wasm', sha256: sha('7') }], sources, listed)).toEqual(['dist/_astro/mystery-AbCdEf12.wasm: nenhum pacote do navegador tem um mystery.wasm (de onde veio?)']);
    expect(checkWasmIdentity([{ file: '_astro/qpdf.wasm', sha256: QPDF }], sources, listed)).toEqual(['dist/_astro/qpdf.wasm: o nome não segue o padrão <nome>-<hash>.wasm do bundler']);
  });

  it('fails for a .wasm outside _astro/ and for one from a package /licenses does not list', () => {
    expect(checkWasmIdentity([{ file: 'tools/qpdf-C3Giu3T4.wasm', sha256: QPDF }], sources, listed)).toEqual(['dist/tools/qpdf-C3Giu3T4.wasm: .wasm fora de _astro/']);
    expect(checkWasmIdentity([{ file: '_astro/pdfjs/6.4.299/wasm/deep.wasm', sha256: sha('3') }], sources, listed)).toEqual([]);
    expect(checkWasmIdentity([{ file: '_astro/pdfjs/x/y/z/q.wasm', sha256: sha('3') }], sources, listed)).toEqual([]);
    expect(checkWasmIdentity(good, sources, new Set(['@jsquash/jpeg']))).toEqual(['dist/_astro/qpdf-C3Giu3T4.wasm vem de @neslinesli93/qpdf-wasm, que a /licenses não lista']);
  });

  it('reads the .wasm of a package folder with their hashes and skips a nested node_modules', () => {
    const dir = mkdtempSync(join(tmpdir(), 'fileorca-pkg-'));
    try {
      mkdirSync(join(dir, 'dist'), { recursive: true });
      mkdirSync(join(dir, 'node_modules', 'other'), { recursive: true });
      writeFileSync(join(dir, 'dist', 'qpdf.wasm'), 'one');
      writeFileSync(join(dir, 'dist', 'qpdf.js'), 'js');
      writeFileSync(join(dir, 'node_modules', 'other', 'other.wasm'), 'two');
      expect(readWasmSources('p', dir)).toEqual([{ pkg: 'p', file: 'dist/qpdf.wasm', sha256: createHash('sha256').update('one').digest('hex') }]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('os textos de .wasm da /licenses (F5a)', () => {
  const served = new Set(['jbig2.wasm', 'openjpeg.wasm', 'qpdf.wasm']);
  const texts = (...labels: (string | null)[]) => [{ name: 'pdfjs-dist', texts: labels.map((label) => ({ label })) }];

  it('passes when the .wasm of every "in x.wasm" text is served, and ignores texts that name no file', () => {
    expect(checkWasmTexts(texts(null, 'JBIG2 and CCITT decoder (PDFium), in jbig2.wasm', 'PDF.js glue of qcms_bg.wasm', 'Adobe CMaps', 'libwebp'), served)).toEqual([]);
  });

  it('fails for a text that says a library is in a .wasm the site does not serve (the qcms of PDF.js)', () => {
    expect(checkWasmTexts(texts('qcms (colour management), in qcms_bg.wasm'), served)).toEqual(['pdfjs-dist: a /licenses tem um texto "qcms (colour management), in qcms_bg.wasm", mas o dist não serve qcms_bg.wasm']);
  });

  it('holds for the real list: no text of /licenses names a .wasm that the build does not copy or the bundler does not emit', () => {
    // The .wasm of the build list and the ones the engines import with ?url (dist/_astro): the names without hash.
    const copied = new Set(pdfjsDataFiles().filter((file) => file.endsWith('.wasm')).map((file) => basename(file)));
    for (const name of ['qpdf.wasm', 'libheif.wasm']) copied.add(name);
    const problems = checkWasmTexts(listedPackages().filter((pkg) => pkg.name === 'pdfjs-dist' || pkg.name === '@neslinesli93/qpdf-wasm'), copied);
    expect(problems).toEqual([]);
  });
});

describe('os pacotes compilados dentro de um arquivo pronto de outro (DECISOES § 179)', () => {
  const CORE_JS = 'https://github.com/zloirock/core-js/blob/v3.50.0/LICENSE';
  const prebuilt = (embedded: string[], licenseUrls: string[] = [CORE_JS]) => [{ pkg: 'pdfjs-dist', file: 'pdfjs-dist/legacy/build/pdf.worker.mjs', embedded, licenseUrls }];
  const declared = (entries: { embeds?: string; source: string; label: string }[]) => ({ 'pdfjs-dist': entries });
  const coreJsText = { label: 'core-js 3.50.0, inside the PDF.js legacy build', source: CORE_JS, embeds: 'core-js' };

  it('reads the webpack MODULE markers of a prebuilt file, scoped names too, and the license addresses its code names', () => {
    const code = [
      '// MODULE: ./node_modules/core-js/internals/a-callable.js',
      '// MODULE: ./node_modules/core-js/modules/es.array.push.js',
      '// MODULE: ./node_modules/@babel/runtime/helpers/x.js',
      "  license: 'https://github.com/zloirock/core-js/blob/v3.50.0/LICENSE',",
      '// MODULE: ./src/core/worker.js',
      'const x = "// MODULE: ./node_modules/not-at-line-start/y.js";',
    ].join('\n');
    expect(embeddedPackages(code)).toEqual(['@babel/runtime', 'core-js']);
    expect(licenseUrlsIn(code)).toEqual([CORE_JS]);
    expect(embeddedPackages('export const a = 1;')).toEqual([]);
  });

  it('passes when every package inside has a text of the version the code names', () => {
    expect(checkEmbeddedTexts(prebuilt(['core-js']), declared([coreJsText]))).toEqual([]);
    expect(checkEmbeddedTexts(prebuilt(['core-js'], []), declared([coreJsText]))).toEqual([]);
  });

  it('fails for a package inside with no text (core-js before the § 179), and for a text of another version', () => {
    expect(checkEmbeddedTexts(prebuilt(['core-js']), declared([]))).toEqual(['core-js está compilado dentro de pdfjs-dist/legacy/build/pdf.worker.mjs (pdfjs-dist) e a /licenses não tem o texto dele']);
    expect(checkEmbeddedTexts(prebuilt(['core-js']), {})).toHaveLength(1);
    // A text of the outer package that covers something else does not count.
    expect(checkEmbeddedTexts(prebuilt(['core-js']), declared([{ label: 'Adobe CMaps', source: 'https://example.org/LICENSE' }]))).toHaveLength(1);
    const newer = 'https://github.com/zloirock/core-js/blob/v3.51.0/LICENSE';
    expect(checkEmbeddedTexts(prebuilt(['core-js'], [newer]), declared([coreJsText]))).toEqual([
      `pdfjs-dist/legacy/build/pdf.worker.mjs traz o core-js de ${newer}, mas o texto da /licenses ("core-js 3.50.0, inside the PDF.js legacy build") é de ${CORE_JS}`,
    ]);
  });

  it('holds on the real files: the legacy build of PDF.js carries the core-js of the /licenses text and only that, with its MIT text', () => {
    // The version is the one src/platform/licenses.ts declares (the text copied by hand, DECISOES § 179), never a literal
    // of this test: a pdfjs-dist with another core-js fails here and in gate:licencas until the text is copied again.
    const real = (UPSTREAM_TEXTS['pdfjs-dist'] ?? []).find((entry) => entry.embeds === 'core-js');
    expect(real?.source).toMatch(/^https:\/\/github\.com\/zloirock\/core-js\/blob\/v\d+\.\d+\.\d+\/LICENSE$/);
    const dir = pdfjsPackageDir();
    const record = { '_astro/pdf.js': [`${dir}/legacy/build/pdf.mjs`], '_astro/pdf.worker.js': [`${dir}/legacy/build/pdf.worker.mjs`, `${dir}/package.json`] };
    const files = readPrebuiltFiles(record, dirname(dirname(dir)));
    expect(files.map((file) => [file.file, file.embedded])).toEqual([
      ['pdfjs-dist/legacy/build/pdf.mjs', ['core-js']],
      ['pdfjs-dist/legacy/build/pdf.worker.mjs', ['core-js']],
    ]);
    for (const file of files) expect(file.licenseUrls.filter((url) => url.includes('/core-js/'))).toEqual([real?.source]);
    expect(checkEmbeddedTexts(files, UPSTREAM_TEXTS)).toEqual([]);
    // Negative control: the same files against the list without the core-js text fail, which is the gate before the § 179.
    const without = { ...UPSTREAM_TEXTS, 'pdfjs-dist': (UPSTREAM_TEXTS['pdfjs-dist'] ?? []).filter((entry) => entry.embeds !== 'core-js') };
    expect(checkEmbeddedTexts(files, without)).toEqual([
      'core-js está compilado dentro de pdfjs-dist/legacy/build/pdf.mjs (pdfjs-dist) e a /licenses não tem o texto dele',
      'core-js está compilado dentro de pdfjs-dist/legacy/build/pdf.worker.mjs (pdfjs-dist) e a /licenses não tem o texto dele',
    ]);
    // The modern build carries nothing: the check reads only files with the markers.
    expect(readPrebuiltFiles({ '_astro/pdf.js': [`${dir}/build/pdf.mjs`] }, dirname(dirname(dir)))).toEqual([]);
    const text = listedPackages().find((pkg) => pkg.name === 'pdfjs-dist')?.texts.find((entry) => entry.label === real?.label);
    expect(text?.text).toMatch(/^Copyright \(c\) 2013–2025 Denis Pushkarev \(zloirock\.ru\)\nCopyright \(c\) 2025–2026 CoreJS Company \(core-js\.io\)\n\nPermission is hereby granted, free of charge/);
    expect(text?.source).toBe(real?.source);
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
      // F5a: qpdf 12.2.0 and the zlib and libjpeg-turbo commits its .wasm is built from (DECISOES § 143).
      'qpdf-12.2.0-LICENSE.txt': 'cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30',
      'qpdf-12.2.0-NOTICE.md': 'd590610848429da713cef608a0183dbf3c7726d738c3be6fa5b36c507444b645',
      'zlib-21767c6-README.txt': 'fc2c3368901700f0acdeb1d8afeaca5923296768ec6824ecdf627aac396001fd',
      'libjpeg-turbo-7aa2a89-LICENSE.md': '7d8683a7f048e715e08b4cada8b7f0d9a6ab8afad88ed09c1143ef764ecbc0f2',
      'libjpeg-turbo-7aa2a89-README.ijg': '4b7b9f8c03bb8d60270dfd12684e70ab21e4abfd27e73905cd1a7c4cae6f5cdb',
      // The LICENSE of the core-js 3.50.0 npm package, inside the PDF.js legacy build (DECISOES § 179).
      'core-js-3.50.0-LICENSE.txt': 'b87653fff2d44426ab5cd4723cee3b1364dc8d35a0acdf098c54689543123bf8',
      // F7: the notice of Kazuhiko Arase's QRCode for JavaScript at the top of qrcode 1.5.4's lib/core/qrcode.js.
      'qrcode-1.5.4-qrcode-for-javascript.txt': '746098406af06d2bed157818aed05b43c823f757a650b8bed4b8d2b6797ee8c7',
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

  it('gives qpdf-wasm the ISC text of its repository and every library inside its .wasm, and PDF.js the decoders, CMaps and fonts it ships', () => {
    // The package declares ISC but ships no text: the copy from its repository is its own text (DECISOES § 143).
    expect(createHash('sha256').update(readFileSync(join(UPSTREAM_TEXT_DIR, UPSTREAM_OWN_TEXTS['@neslinesli93/qpdf-wasm']?.file ?? ''))).digest('hex')).toBe(
      '68f98c117f69f4e2838603ebef2b05187a6fd2a1aefe0d4d4806a8fb5d3407b7',
    );
    const byName = new Map(listedPackages().map((pkg) => [pkg.name, pkg]));
    const qpdf = byName.get('@neslinesli93/qpdf-wasm');
    expect(qpdf?.license).toBe('ISC');
    expect(qpdf?.text).toContain('ISC License');
    expect(qpdf?.texts[0]?.source).toBe('https://github.com/neslinesli93/qpdf-wasm/blob/master/LICENSE');
    expect(qpdf?.texts.map((entry) => entry.label)).toEqual([null, 'qpdf 12.2.0', 'qpdf 12.2.0, notices', 'zlib', 'libjpeg-turbo 2.1.1', 'libjpeg-turbo 2.1.1, the IJG license']);
    expect(qpdf?.texts.find((entry) => entry.label === 'qpdf 12.2.0')?.text).toContain('Apache License');
    expect(qpdf?.texts.find((entry) => entry.label === 'zlib')?.text).toContain('Jean-loup Gailly and Mark Adler');
    const pdfjs = byName.get('pdfjs-dist');
    expect(pdfjs?.license).toBe('Apache-2.0');
    expect(pdfjs?.texts.map((entry) => entry.label)).toEqual([
      null,
      'JBIG2 and CCITT decoder (PDFium), in jbig2.wasm',
      'PDF.js glue of jbig2.wasm',
      'OpenJPEG (JPEG 2000), in openjpeg.wasm',
      'PDF.js glue of openjpeg.wasm',
      // F5a: no text for the qcms library (LICENSE_QCMS): qcms_bg.wasm is not served (DECISOES § 144), so /licenses does not
      // list it (checkWasmTexts in gate:licencas). The glue of qcms is JavaScript inside the PDF.js worker, so its text stays.
      'PDF.js glue of qcms_bg.wasm',
      'Adobe CMaps',
      'Foxit standard fonts (PDFium)',
      // DECISOES § 179: core-js is compiled into the legacy build, which ships no text of it. The version is the one of
      // the copied text (src/platform/licenses.ts), which the test of the real files ties to the code of pdfjs-dist.
      expect.stringMatching(/^core-js \d+\.\d+\.\d+, inside the PDF\.js legacy build$/),
    ]);
    expect(pdfjs?.texts.some((entry) => /Marti Maria/.test(entry.text))).toBe(false);
    // Nothing GPL among the texts: the Liberation fonts stay out of the dist (DECISOES § 144).
    expect(pdfjs?.texts.some((entry) => /GNU GENERAL PUBLIC LICENSE/.test(entry.text))).toBe(false);
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
