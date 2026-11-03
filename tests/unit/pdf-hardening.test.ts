// The PDF.js and qpdf paths are locked down (F5a, criterion 7, decision 4; plan section 9): the source and the
// configuration are checked here, the built site in tests/e2e/pdf-hardening.spec.ts. Nothing runs a PDF in this file:
// it reads code, with the TypeScript parser, so a comment or a string cannot fool it and a line that moved is still
// found. What it holds:
//
//  - the published PDF.js (the legacy build the site imports, pdfjs-dist 6.x) has no eval, no `new Function` and no
//    string timer, bar the dead `Function('return this')` of core-js, and no isEvalSupported option left to turn off
//    (it was removed from PDF.js between 5.4.624 and 5.7.284); it does not carry the scripting sandbox (QuickJS);
//  - the site imports nothing of pdfjs-dist besides the legacy API and worker modules, and never sets a worker URL: the
//    engine hands PDF.js its own parser, so PDF.js never loads one from a URL (and never from a CDN wrapper);
//  - the options src/engine/pdf/pdfjs.ts gives getDocument keep XFA, scripting, system fonts, remote fetching and the
//    annotation layer off, and every folder PDF.js reads is the site's own;
//  - the engine reaches for no network address: no URL in its strings, a closed list of fetches, no XHR, socket or
//    beacon, and a Worker only from a module of the site;
//  - the data files the build copies are the decoders, fonts and CMaps and nothing else (no QuickJS, no colour
//    profile, no qcms, no Liberation fonts, no asm.js fallback), byte for byte the files of the package.
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { copyPdfjsData, pdfjsDataFiles, pdfjsPackageDir, pdfjsVersion } from '../../src/platform/pdfjs-data.ts';
import { dynamicCode, getDocumentOptions, line, namesIn, orChainOf, parse, parseText, sources, squash, visit } from '../e2e/lib/js-code.ts';

const require = createRequire(import.meta.url);
const PUBLISHED = dirname(require.resolve('pdfjs-dist/package.json'));
/** The two modules of PDF.js the site loads: the API and the parser (the "legacy" build covers the Safari 16.4 floor, DECISOES § 144). */
const LEGACY = ['legacy/build/pdf.mjs', 'legacy/build/pdf.worker.mjs'] as const;

// ---- the files read ------------------------------------------------------------------------------------------------

const published = new Map<string, ts.SourceFile>();
const publishedFile = (path: string): ts.SourceFile => {
  let source = published.get(path);
  if (!source) {
    source = parse(join(PUBLISHED, path));
    published.set(path, source);
  }
  return source;
};


// ---- the published PDF.js ------------------------------------------------------------------------------------------

describe('the reader of syntax', () => {
  it('finds every way of running code from a string, so finding none in the code below means something', () => {
    const found = dynamicCode(
      parseText(
        'probe.mjs',
        [
          'eval(a);',
          'window.eval(b);',
          "globalThis['eval'](c);",
          "new Function('x', 'return x');",
          "Function('return this')();",
          "globalThis.Function('y');",
          "setTimeout('go()', 1);",
          'setInterval(`go${a}()`, 1);',
          'import(where);',
          "import('./fine.js');",
          'setTimeout(() => go(), 1);',
          '// eval(inAComment); const s = "new Function(inAString)";',
          'const evaluator = { evaluate() {} }; evaluator.evaluate();',
        ].join('\n'),
      ),
    );
    expect(found.evals.map((hit) => hit.line)).toEqual([1, 2, 3]);
    expect(found.functions.map((hit) => hit.line)).toEqual([4, 5, 6]);
    expect(found.timers.map((hit) => hit.line)).toEqual([7, 8]);
    expect(found.computedImports.map((hit) => hit.text)).toEqual(['where']);
  });
});

describe('the published PDF.js', () => {
  it('is past the fix for CVE-2024-4367 (4.2.67)', () => {
    const [major = 0, minor = 0, patch = 0] = pdfjsVersion().split('.').map(Number);
    const newer = major > 4 || (major === 4 && (minor > 2 || (minor === 2 && patch >= 67)));
    expect(newer, `pdfjs-dist ${pdfjsVersion()}`).toBe(true);
    expect(pdfjsVersion()).toBe((JSON.parse(readFileSync(join(pdfjsPackageDir(), 'package.json'), 'utf8')) as { version: string }).version);
  });

  for (const file of LEGACY) {
    it(`${file}: no eval, no string timer, no \`new Function\`; its one Function call is the dead fallback of core-js`, () => {
      const found = dynamicCode(publishedFile(file));
      expect(found.evals.map((hit) => `${hit.line}: ${hit.text}`), 'eval').toEqual([]);
      expect(found.timers.map((hit) => `${hit.line}: ${hit.text}`), 'setTimeout or setInterval with a string').toEqual([]);
      expect(found.functions.filter((hit) => ts.isNewExpression(hit.node)).map((hit) => `${hit.line}: ${hit.text}`), 'new Function').toEqual([]);

      // The only Function(...) is `(function () { return this; })() || Function('return this')()` at the end of core-js's chain that
      // looks for the global object (typeof globalThis == 'object' && globalThis first): every engine the site runs on has
      // globalThis, so the chain stops at its first link and the call is never made.
      expect(found.functions.map((hit) => squash(hit.text))).toEqual(["Function('returnthis')"]);
      const inner = found.functions[0]?.node as ts.Node;
      expect(ts.isCallExpression(inner.parent) && inner.parent.expression === inner, 'Function(...) is called right away').toBe(true);
      const chain = orChainOf(inner.parent);
      expect(chain.at(0), 'the first link: globalThis').toBe("check(typeofglobalThis=='object'&&globalThis)");
      expect(chain.slice(-2), 'the last two: an IIFE, then Function(...)()').toEqual(['(function(){returnthis;})()', "Function('returnthis')()"]);
    });

    it(`${file}: no QuickJS and no reference to the scripting sandbox`, () => {
      const text = readFileSync(join(PUBLISHED, file), 'utf8');
      expect(text).not.toMatch(/quickjs/i);
      expect(text).not.toMatch(/pdf\.sandbox/);
    });
  }

  it('starts qcms (the ICC colour decoder, and the synchronous XHR that fetches its .wasm) only with useWorkerFetch on, which the engine turns off', () => {
    // So the site serves neither qcms_bg.wasm nor a colour profile (they are left out of the data folder, see below), and a
    // PDF with an ICC profile is drawn with PDF.js's own colour maths instead of asking for them.
    let gate = '';
    visit(publishedFile('legacy/build/pdf.worker.mjs'), (node) => {
      if (ts.isClassDeclaration(node) && node.name?.text === 'IccColorSpace') {
        for (const member of node.members) {
          if (ts.isMethodDeclaration(member) && member.name.getText() === 'setOptions' && member.body?.statements[0]) gate = squash(member.body.statements[0].getText());
        }
      }
    });
    expect(gate).toBe('if(!useWorkerFetch){this.#useWasm=false;return;}');
    expect(readFileSync('src/engine/pdf/pdfjs.ts', 'utf8')).toMatch(/useWorkerFetch: false/);
  });

  it('has no isEvalSupported option left to turn off; should one come back, the engine has to set it to false', () => {
    const mentions = [...LEGACY, 'types/src/display/api.d.ts'].filter((file) => readFileSync(join(PUBLISHED, file), 'utf8').includes('isEvalSupported'));
    const engine = readFileSync('src/engine/pdf/pdfjs.ts', 'utf8');
    if (mentions.length === 0) {
      // Nothing to turn off, as of 6.4.299: a value of true would still be a decision the engine should not take.
      expect(engine).not.toMatch(/isEvalSupported\s*:\s*true/);
    } else {
      expect(engine, `${mentions.join(', ')} mention isEvalSupported`).toMatch(/isEvalSupported\s*:\s*false/);
    }
  });

  it('builds the specifier of a dynamic import at run time in two places, and the engine leaves both unused', () => {
    // The API module: the loader of the "fake worker" imports `GlobalWorkerOptions.workerSrc`, but takes the parser the page
    // already put in globalThis.pdfjsWorker first. The engine sets it before the API loads, and never sets a workerSrc.
    expect(dynamicCode(publishedFile('legacy/build/pdf.mjs')).computedImports.map((hit) => squash(hit.text))).toEqual(['this.workerSrc']);
    // The parser module: the asm.js fallback of a WebAssembly decoder, imported from the wasmUrl folder when the .wasm cannot be
    // used. The site serves no such file (see the data files below), so the import fails and PDF.js reports it.
    expect(dynamicCode(publishedFile('legacy/build/pdf.worker.mjs')).computedImports.map((hit) => squash(hit.text))).toEqual(['`${WasmImage.#wasmUrl}${this._noWasmFilename}`']);
    const engine = readFileSync('src/engine/pdf/pdfjs.ts', 'utf8');
    expect(engine).toMatch(/\(globalThis as \{ pdfjsWorker\?: unknown \}\)\.pdfjsWorker = parser;/);
  });
});

// ---- what the site imports and sets ----------------------------------------------------------------------------------

describe('what the site takes from pdfjs-dist', () => {
  it('imports only the legacy API and the legacy parser (and the version), never the viewer, the sandbox or the modern build', () => {
    const specifiers = new Set<string>();
    for (const file of sources('src')) {
      visit(parse(file), (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specifiers.add(node.moduleSpecifier.text);
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) specifiers.add(node.arguments[0].text);
      });
    }
    expect([...specifiers].filter((specifier) => /^pdfjs-dist/.test(specifier)).sort()).toEqual(['pdfjs-dist/legacy/build/pdf.mjs', 'pdfjs-dist/legacy/build/pdf.worker.mjs', 'pdfjs-dist/package.json']);
    // The Astro components import nothing of it: the page never carries PDF.js in its own script.
    const components = readdirSync('src', { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.astro'));
    expect(components.filter((entry) => readFileSync(join(entry.parentPath, entry.name), 'utf8').includes('pdfjs-dist')).map((entry) => entry.name)).toEqual([]);
  });

  it('never sets a worker URL or port: the parser is the one the engine hands over, so PDF.js has no URL to load it from', () => {
    for (const file of [...sources('src/engine/pdf'), ...sources('src/tools/pdf')]) {
      const names = namesIn(parse(file));
      for (const forbidden of ['GlobalWorkerOptions', 'workerSrc', 'workerPort']) expect(names.has(forbidden), `${file}: ${forbidden}`).toBe(false);
    }
  });
});

// ---- the options of getDocument and of render ---------------------------------------------------------------------------

describe('getDocument in src/engine/pdf/pdfjs.ts', () => {
  const source = parse('src/engine/pdf/pdfjs.ts');
  const { options, calls } = getDocumentOptions(source);

  it('is called once, with the options of an object literal', () => {
    expect(calls).toBe(1);
  });

  it('hands PDF.js factories with every public method of its base factories, so a new one does not break the drawing in the worker', () => {
    // PDF.js 6.5 asks the canvas factory for getNoAlphaContext; the engine's OffscreenFactory had no such method, and the
    // worker drew nothing in Chromium (the Dependabot rehearsal, F8). The Node tests never draw through these factories.
    const methods = (file: ts.SourceFile, name: string): string[] => {
      const found: string[] = [];
      visit(file, (node) => {
        if (!ts.isClassDeclaration(node) || node.name?.text !== name) return;
        for (const member of node.members) if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name) && !member.name.text.startsWith('_')) found.push(member.name.text);
      });
      return found.sort();
    };
    const pdfjs = publishedFile('legacy/build/pdf.mjs');
    for (const [base, own] of [['BaseCanvasFactory', 'OffscreenFactory'], ['BaseFilterFactory', 'NoFilterFactory'], ['BaseBinaryDataFactory', 'SiteDataFactory']] as const) {
      const wanted = methods(pdfjs, base);
      expect(wanted.length, base).toBeGreaterThan(0);
      const have = methods(source, own);
      expect(wanted.filter((name) => !have.includes(name)), `${own} lacks a method of ${base}`).toEqual([]);
    }
  });

  it('turns off XFA, system fonts and the worker\'s own fetching, and keeps the WebAssembly decoders on', () => {
    expect(options.get('enableXfa')).toBe('false');
    expect(options.get('useWorkerFetch')).toBe('false');
    expect(options.get('useSystemFonts')).toBe('false');
    expect(options.get('useWasm')).toBe('true');
    expect(options.get('verbosity')).toBe('0');
    // The data of the file comes from memory; PDF.js is never given an address for the file.
    expect(options.has('data')).toBe(true);
  });

  it('does not ask for anything that reaches out or runs a script: no address, no headers, no ranges, no scripting, no GPU, no debug', () => {
    const forbidden = ['url', 'httpHeaders', 'withCredentials', 'range', 'rangeChunkSize', 'docBaseUrl', 'iccUrl', 'enableScripting', 'enableWebGPU', 'enableHWA', 'pdfBug', 'ownerDocument', 'fontExtraProperties', 'disableAutoFetch', 'disableRange', 'disableStream', 'workerSrc'];
    expect(forbidden.filter((key) => options.has(key))).toEqual([]);
  });

  it('reads its CMaps, fonts and decoders from the folder the engine was configured with (the site\'s own), and nowhere else', () => {
    expect(options.get('cMapUrl')).toBe('`${data}cmaps/`');
    expect(options.get('standardFontDataUrl')).toBe('`${data}standard_fonts/`');
    expect(options.get('wasmUrl')).toBe('`${data}wasm/`');
    expect(source.text).toMatch(/const data = asset\('pdfjsData'\);/);
    expect(options.get('BinaryDataFactory')).toBe('SiteDataFactory');
  });

  it('draws with the annotation layer off, and never asks a page for its text, annotations, scripts or XFA', () => {
    let annotationMode = '';
    visit(source, (node) => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === 'annotationMode') annotationMode = node.initializer.getText();
    });
    expect(annotationMode).toMatch(/AnnotationMode\.DISABLE$/);
    const used = new Set<string>();
    for (const file of [...sources('src/engine/pdf'), ...sources('src/tools/pdf')]) for (const name of namesIn(parse(file))) used.add(name);
    const layers = ['getTextContent', 'streamTextContent', 'TextLayer', 'getAnnotations', 'AnnotationLayer', 'getJSActions', 'getFieldObjects', 'hasJSActions', 'enableScripting', 'XfaLayer', 'getXfa', 'PDFScriptingManager'];
    expect(layers.filter((name) => used.has(name))).toEqual([]);
  });

  it('serves PDF.js only plain file names, and of the standard fonts only the Foxit ones (the Liberation fonts are GPL)', () => {
    let served: RegExp | null = null;
    const names: RegExp[] = [];
    visit(source, (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'SERVED_FONTS' && node.initializer && ts.isRegularExpressionLiteral(node.initializer)) {
        const [, body = '', flags = ''] = /^\/(.*)\/([a-z]*)$/s.exec(node.initializer.text) ?? [];
        served = new RegExp(body, flags);
      }
      if (ts.isClassDeclaration(node) && node.name?.text === 'SiteDataFactory') {
        visit(node, (inner) => {
          if (ts.isRegularExpressionLiteral(inner)) {
            const [, body = '', flags = ''] = /^\/(.*)\/([a-z]*)$/s.exec(inner.text) ?? [];
            names.push(new RegExp(body, flags));
          }
        });
      }
    });
    expect(served, 'SERVED_FONTS is a regular expression of the module').not.toBeNull();
    const fonts = served as unknown as RegExp;
    for (const ok of ['FoxitSerif.pfb', 'FoxitFixedBoldItalic.pfb', 'FoxitDingbats.pfb', 'FoxitSymbol.pfb']) expect(fonts.test(ok), ok).toBe(true);
    for (const no of ['LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf', 'FoxitSerif.ttf', 'FoxitSerif.pfb.exe', '../FoxitSerif.pfb']) expect(fonts.test(no), no).toBe(false);
    // The guard on every file name: no path, no scheme, no query. (A name made only of dots stays inside the folder.)
    expect(names, 'one pattern for the file names in SiteDataFactory').toHaveLength(1);
    const guard = names[0] as RegExp;
    for (const ok of ['jbig2.wasm', 'openjpeg.wasm', 'UniJIS-UTF16-H.bcmap', 'FoxitSerif.pfb']) expect(guard.test(ok), ok).toBe(true);
    for (const no of ['../x.wasm', 'a/b.bcmap', '/etc/passwd', 'https://example.com/x.wasm', '//example.com/x', 'x.wasm?y=1', 'x#y', 'c:\\x', '']) expect(guard.test(no), no).toBe(false);
  });
});

// ---- the engine reaches for no network address ---------------------------------------------------------------------------

describe('src/engine/pdf and src/tools/pdf', () => {
  const files = [...sources('src/engine/pdf'), ...sources('src/tools/pdf')];

  it('have no URL in any string, and no scheme that runs or navigates', () => {
    const offenders: string[] = [];
    for (const file of files) {
      visit(parse(file), (node) => {
        const text = ts.isStringLiteralLike(node) ? node.text : ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) ? node.text : null;
        if (text !== null && (/:\/\//.test(text) || text.startsWith('//') || /^(https?|wss?|ftp|data|blob|javascript|file):/i.test(text))) offenders.push(`${file}:${line(node)}: ${text.slice(0, 60)}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it('do not use XHR, sockets, beacons, importScripts, eval or the Function constructor', () => {
    const forbidden = ['XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon', 'importScripts', 'WebTransport'];
    for (const file of files) {
      const source = parse(file);
      const names = namesIn(source);
      expect(forbidden.filter((name) => names.has(name)), file).toEqual([]);
      const found = dynamicCode(source);
      expect([...found.evals, ...found.functions, ...found.timers].map((hit) => `${hit.line}: ${hit.text}`), file).toEqual([]);
      expect(found.computedImports.map((hit) => `${hit.line}: ${hit.text}`), `${file}: import() of a computed address`).toEqual([]);
    }
  });

  it('fetch in two places only, each of an address the site configured, and open a Worker only from a module of the site', () => {
    const fetches: string[] = [];
    const workers: string[] = [];
    for (const file of files) {
      visit(parse(file), (node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'fetch') fetches.push(`${file.split('\\').join('/')}: ${node.arguments[0]?.getText() ?? ''}`);
        if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Worker') workers.push(node.arguments?.[0]?.getText().replace(/\s+/g, ' ') ?? '');
      });
    }
    // The address of a .wasm the worker was given (a bundler URL of the site), and the folder of PDF.js's data plus a plain file name.
    expect(fetches).toEqual(['src/engine/pdf/images.ts: source', 'src/engine/pdf/pdfjs.ts: `${base}${filename}`']);
    expect(workers.length).toBeGreaterThan(0);
    for (const first of workers) expect(first, 'new URL("./module.ts", import.meta.url)').toMatch(/^new URL\('\.\.?\/[\w./-]+\.ts', import\.meta\.url\)$/);
  });

  it('give the engine worker PDF.js\'s folder as a path of the site\'s own origin, and the other assets as the bundler\'s URLs', () => {
    const worker = parse('src/engine/pdf/worker.ts');
    let path = '';
    let configured = '';
    visit(worker, (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'PDFJS_DATA_PATH' && node.initializer) path = node.initializer.getText();
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'configurePdfAssets') configured = squash(node.arguments[0]?.getText() ?? '');
    });
    expect(path).toBe('`/_astro/pdfjs/${pdfjsVersion}/`');
    expect(configured).toBe('{qpdfWasm,jpegDecoder,jpegEncoder,resizer,pdfjsData:PDFJS_DATA_PATH}');
    // Each of the first four is an `import x from '...wasm?url'`: the bundler gives the URL of a file of the build.
    const text = worker.text;
    for (const name of ['qpdfWasm', 'jpegDecoder', 'jpegEncoder', 'resizer']) expect(text, name).toMatch(new RegExp(`import ${name} from '[^']+\\.wasm\\?url';`));
  });
});

// ---- the data files the build copies ---------------------------------------------------------------------------------------

describe('the data of PDF.js the site serves', () => {
  const FORBIDDEN = /quickjs|qcms|sandbox|liberation|nowasm|\.icc$|\.js$|\.mjs$|^LICENSE/i;

  it('is the two WebAssembly decoders, the Foxit fonts and the packed CMaps, and nothing else', () => {
    const files = pdfjsDataFiles();
    expect(files.filter((file) => FORBIDDEN.test(file.split('/').at(-1) ?? '') || FORBIDDEN.test(file))).toEqual([]);
    expect(files.filter((file) => !/^(wasm\/(jbig2|openjpeg)\.wasm|standard_fonts\/Foxit[A-Za-z]+\.pfb|cmaps\/[\w-]+\.bcmap)$/.test(file))).toEqual([]);
    expect(files).toContain('wasm/jbig2.wasm');
    expect(files).toContain('wasm/openjpeg.wasm');
    expect(files.filter((file) => file.startsWith('standard_fonts/'))).toHaveLength(10);
    expect(files.filter((file) => file.startsWith('cmaps/')).length).toBeGreaterThan(100);
    // What the package has and the site leaves out is really there to leave out.
    const left = readdirSync(join(PUBLISHED, 'wasm'));
    for (const name of ['quickjs-eval.wasm', 'quickjs-eval.js', 'qcms_bg.wasm', 'jbig2_nowasm_fallback.js', 'openjpeg_nowasm_fallback.js']) expect(left, name).toContain(name);
    expect(readdirSync(join(PUBLISHED, 'iccs')).length).toBeGreaterThan(0);
    expect(readdirSync(join(PUBLISHED, 'standard_fonts')).some((name) => /^Liberation/.test(name))).toBe(true);
  });

  it('is copied unchanged: every file of the copy has the SHA-256 of the file in the package', () => {
    const out = mkdtempSync(join(tmpdir(), 'pdfjs-data-'));
    const count = copyPdfjsData(out);
    const copied = readdirSync(join(out, '_astro', 'pdfjs', pdfjsVersion()), { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
    expect(copied).toHaveLength(count);
    expect(count).toBe(pdfjsDataFiles().length);
    const sha = (file: string): string => createHash('sha256').update(readFileSync(file)).digest('hex');
    for (const file of pdfjsDataFiles()) expect(sha(join(out, '_astro', 'pdfjs', pdfjsVersion(), file)), file).toBe(sha(join(PUBLISHED, file)));
  });
});
