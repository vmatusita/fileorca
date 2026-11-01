import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { pdfjsDataFiles, pdfjsPackageDir, pdfjsVersion } from '../../src/platform/pdfjs-data.ts';
import { getDocumentOptions, parseText } from './lib/js-code.ts';

// What the built site ships of PDF.js and qpdf is locked down (F5a, criterion 7, decision 4; plan section 9). The source
// and the published package are checked in tests/unit/pdf-hardening.test.ts; this file reads dist/, as image-privacy.spec.ts
// does, so it proves the build kept it: nothing that runs code from a string, no scripting sandbox, no colour profile or
// qcms, no Liberation fonts and no asm.js fallback among the data PDF.js fetches, no address of another origin in the code
// that opens the person's file, and the options the engine passes to PDF.js still in the minified worker. It reads files;
// no page is loaded. (The requests a page makes are asserted in pdf-privacy.spec.ts.)

const DIST = 'dist';
const ASTRO = join(DIST, '_astro');
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const squash = (text: string): string => text.replace(/\s+/g, '');

/** Every script the build made, by file name. */
const scripts = (): { name: string; text: string }[] =>
  readdirSync(ASTRO)
    .filter((file) => file.endsWith('.js'))
    .sort()
    .map((name) => ({ name, text: readFileSync(join(ASTRO, name), 'utf8') }));

/** The scripts that carry PDF.js: its API (GetDocRequest) or its parser (WorkerMessageHandler). */
const carriesPdfjs = (text: string): boolean => text.includes('GetDocRequest') || text.includes('WorkerMessageHandler');

test.describe('the data and the scripts of PDF.js in dist', () => {
  test('PDF.js\'s data folder is exactly what the build copies, byte for byte; no QuickJS, colour profile, qcms, Liberation font or asm.js fallback is anywhere', () => {
    const files = readdirSync(DIST, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(DIST, join(entry.parentPath, entry.name)).split('\\').join('/'));
    expect(files.length, 'dist is built').toBeGreaterThan(50);
    expect(files.filter((file) => /quickjs|qcms|sandbox|liberation|nowasm|fallback|\.icc$|\.iccprofile$/i.test(file))).toEqual([]);
    // Fonts of the PDF tools are the Foxit ones in the folder of PDF.js; the only other fonts are the site's .woff2.
    expect(files.filter((file) => /\.(ttf|otf|pfb|ttc)$/i.test(file) && !file.startsWith(`_astro/pdfjs/${pdfjsVersion()}/standard_fonts/Foxit`))).toEqual([]);

    // One copy, of the version installed, with the files the build lists and no other.
    expect(readdirSync(join(ASTRO, 'pdfjs'))).toEqual([pdfjsVersion()]);
    const folder = `_astro/pdfjs/${pdfjsVersion()}/`;
    const copied = files.filter((file) => file.startsWith(folder)).map((file) => file.slice(folder.length));
    expect(copied.sort()).toEqual([...pdfjsDataFiles()].sort());
    for (const file of pdfjsDataFiles()) {
      expect(sha256(readFileSync(join(ASTRO, 'pdfjs', pdfjsVersion(), file))), file).toBe(sha256(readFileSync(join(pdfjsPackageDir(), file))));
    }
  });

  test('no script of the build names QuickJS or the scripting sandbox, and none has an isEvalSupported option', () => {
    const named = scripts().filter(({ text }) => /quickjs|pdf\.sandbox|isEvalSupported/i.test(text));
    expect(named.map(({ name }) => name)).toEqual([]);
  });

  test('no script of the build runs code from a string; the one Function call left is the dead fallback of core-js, in the files that carry PDF.js', () => {
    // The exact fallback, as the minifier writes it: it is the last link of core-js's search for the global object, after a test
    // of globalThis, so every engine the site runs on stops before it.
    const shim = /typeof globalThis==`object`&&globalThis\)\|\|[^]{0,600}?\(function\(\)\{return this\}\)\(\)\|\|Function\(`return this`\)\(\)/g;
    // Anything that could build code from a string: eval(...) in any form, Function(...) and new Function, a string for a timer.
    const risky = /(?<![\w$])eval\s*\(|\.eval\s*\(|\[\s*[`'"]eval[`'"]\s*\]|(?<![\w$.])Function\s*\(|\.Function\s*\(|new\s+Function\b|set(?:Timeout|Interval)\s*\(\s*[`'"]/g;
    const withShim: string[] = [];
    const others: string[] = [];
    for (const { name, text } of scripts()) {
      const found = text.match(shim) ?? [];
      if (found.length > 0) {
        expect(found, `${name}: one fallback`).toHaveLength(1);
        expect(carriesPdfjs(text), `${name}: the fallback comes with PDF.js`).toBe(true);
        withShim.push(name);
      }
      const rest = text.replace(shim, '');
      for (const match of rest.matchAll(risky)) others.push(`${name}: ...${rest.slice(Math.max(0, (match.index ?? 0) - 30), (match.index ?? 0) + 50)}...`);
    }
    expect(others, 'a call that runs code from a string').toEqual([]);
    // PDF.js is in the build, and its fallback is the one thing the search above skipped.
    expect(scripts().filter(({ text }) => carriesPdfjs(text)).map(({ name }) => name).sort(), 'every file with PDF.js has it').toEqual([...withShim].sort());
  });

  test('the code that opens a file names no address but the XML namespaces of its formats, the documentation of core-js and the URL samples of PDF.js', () => {
    const known =
      /^(?:http:\/\/(?:www\.w3\.org|ns\.adobe\.com|purl\.org|www\.aiim\.org|www\.xfa\.org)\/|https:\/\/github\.com\/(?:zloirock\/core-js|Hopding\/pdf-lib)(?:\/blob\/v[\d.]+\/LICENSE)?$)/;
    // The feature tests of core-js's URL polyfill and the checks of PDF.js's link helper (a base to resolve against, a host to prefix): none is fetched.
    const samples = new Set(['https://a', 'https://a#б', 'https://a/c%20d?a=1&c=3', 'https://a@b', 'https://x', 'https://тест', 'https://foo.bar', 'http://example.com', 'http://${e}']);
    const unknown: string[] = [];
    const checked: string[] = [];
    for (const { name, text } of scripts()) {
      if (!carriesPdfjs(text) && !text.includes('BinaryDataFactory:') && !text.includes('PDFDocument') && !name.startsWith('qpdf')) continue;
      checked.push(name);
      for (const url of new Set(text.match(/(?:https?|wss?|ftp):\/\/[^\s"'`)\\<>]*/g) ?? [])) if (!known.test(url) && !samples.has(url)) unknown.push(`${name}: ${url}`);
    }
    expect(unknown, 'an address the code could reach').toEqual([]);
    expect(checked.length, 'the files that open the PDF: PDF.js (API and parser), pdf-lib, qpdf and the engine').toBeGreaterThanOrEqual(4);
  });

  test('the options the engine gives PDF.js are still there after minifying: no XFA, no system fonts, no remote fetching, no address, no annotation layer', () => {
    const chunks = scripts().filter(({ text }) => text.includes('BinaryDataFactory:'));
    // The engine worker and the file of the page path (a browser whose workers cannot draw), each with its own copy of pdfjs.ts.
    expect(chunks.length, 'the engine is in the build').toBeGreaterThanOrEqual(2);
    const bool = (value: string | undefined): string | undefined => (value === '!0' ? 'true' : value === '!1' ? 'false' : value);
    for (const { name, text } of chunks) {
      const { options, calls } = getDocumentOptions(parseText(name, text));
      expect(calls, `${name}: one call of getDocument`).toBe(1);
      expect(bool(options.get('enableXfa')), `${name}: enableXfa`).toBe('false');
      expect(bool(options.get('useWorkerFetch')), `${name}: useWorkerFetch`).toBe('false');
      expect(bool(options.get('useSystemFonts')), `${name}: useSystemFonts`).toBe('false');
      expect(bool(options.get('useWasm')), `${name}: useWasm`).toBe('true');
      expect(options.get('verbosity'), `${name}: verbosity`).toBe('0');
      expect(options.has('data'), `${name}: the file comes from memory`).toBe(true);
      for (const key of ['url', 'httpHeaders', 'withCredentials', 'range', 'docBaseUrl', 'iccUrl', 'enableScripting', 'enableWebGPU', 'isEvalSupported', 'pdfBug', 'ownerDocument', 'disableAutoFetch'])
        expect(options.has(key), `${name}: ${key}`).toBe(false);
      // The three folders PDF.js reads are the one the engine was configured with (the site's own).
      expect(squash(options.get('cMapUrl') ?? ''), `${name}: cMapUrl`).toMatch(/^`\$\{\w+\}cmaps\/`$/);
      expect(squash(options.get('standardFontDataUrl') ?? ''), `${name}: standardFontDataUrl`).toMatch(/^`\$\{\w+\}standard_fonts\/`$/);
      expect(squash(options.get('wasmUrl') ?? ''), `${name}: wasmUrl`).toMatch(/^`\$\{\w+\}wasm\/`$/);
      // Pages are drawn with the annotation layer off, and nothing in the engine asks for the text, annotations or scripts of a page.
      expect(text, `${name}: annotationMode`).toMatch(/annotationMode:\w+\.AnnotationMode\.DISABLE/);
    }
    const engine = chunks.map(({ text }) => text).join('\n');
    expect(engine).not.toMatch(/getTextContent|streamTextContent|getAnnotations|getJSActions|getFieldObjects|enableScripting\s*:\s*!0|GlobalWorkerOptions/);
  });
});
