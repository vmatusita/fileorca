// The How it works page (F19a, decision 7; DECISOES § 759 to § 761): its table of the libraries against the files the
// build serves, the links of the table to the Licenses page and to the tools, the five parts in order, the Article and
// the breadcrumb, and no ad. Read over dist/ after `pnpm build`, as tests/unit/tool-count.test.ts does.
//  - Every .wasm of dist/_astro/ (the image codecs and qpdf with a hash after the name, each in two copies, told apart
//    by wasmStem of scripts/lib/licenses-check.ts; the two PDF.js decoders under _astro/pdfjs/<version>/wasm/) has its row
//    in src/platform/engines.ts, and every file a row names is in dist/.
//  - Every one of them is the file its package publishes, byte for byte.
//  - Each row links to the row of its package on the Licenses page, whose id exists in dist/, and to tool pages of the
//    registries only.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, pathFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { CHANGELOG, birthOf, lastmodOf } from '../../src/platform/changelog.ts';
import { ENGINES } from '../../src/platform/engines.ts';
import { findPackageDir, licenseAnchor, listedPackages } from '../../src/platform/licenses.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { PDF_PAGES } from '../../src/tools/pdf/registry.ts';
import { readWasmSources, sha256, wasmStem } from '../../scripts/lib/licenses-check.ts';

const DIST = 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const fileOf = (path: string): string => join(DIST, ...path.split('/').filter(Boolean), 'index.html');
const page = (path: string): HTMLElement => parse(readFileSync(fileOf(path), 'utf8'));
const mainOf = (path: string): HTMLElement => {
  const main = page(path).querySelector('main');
  if (!main) throw new Error(`${path}: no <main>`);
  return main;
};

/** Every file under a folder, relative to dist/, with forward slashes. */
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(relative(DIST, path).replace(/\\/g, '/'));
  }
  return out;
}

/** The .wasm files of dist/ by the name their package gives them: one name for the two hashed copies of a codec. */
function servedWasm(): Map<string, string[]> {
  const byName = new Map<string, string[]>();
  for (const file of walk(join(DIST, '_astro')).filter((name) => name.endsWith('.wasm'))) {
    const name = file.startsWith('_astro/pdfjs/') ? basename(file) : `${wasmStem(file) ?? basename(file, '.wasm')}.wasm`;
    byName.set(name, [...(byName.get(name) ?? []), file]);
  }
  return byName;
}

describe('the table of the libraries (src/platform/engines.ts)', () => {
  it('names each library once, with a package the Licenses page lists, and pages of the registries', () => {
    expect(new Set(ENGINES.map((engine) => engine.id)).size).toBe(ENGINES.length);
    const listed = new Set(listedPackages().map((item) => item.name));
    for (const engine of ENGINES) {
      expect(listed.has(engine.pkg), `${engine.id}: ${engine.pkg} on /licenses`).toBe(true);
      expect(engine.tools.length, engine.id).toBeGreaterThan(0);
      for (const tool of engine.tools) expect(Object.hasOwn(IMAGE_PAGES, tool) || Object.hasOwn(PDF_PAGES, tool), `${engine.id}: ${tool}`).toBe(true);
      // A JavaScript library has no .wasm file; a WebAssembly one has at least one.
      expect(engine.kind === 'js' ? engine.wasm.length === 0 : engine.wasm.length > 0, engine.id).toBe(true);
    }
    // No file is in two rows.
    const files = ENGINES.flatMap((engine) => engine.wasm);
    expect(new Set(files).size).toBe(files.length);
  });

  it('has a sentence of what each library does, in every language', () => {
    for (const lang of LANGS) {
      const does = TEXTS[lang]['how-it-works'].wasm.does;
      expect(Object.keys(does).sort(), lang).toEqual(ENGINES.map((engine) => engine.id).sort());
      for (const engine of ENGINES) expect(does[engine.id].trim(), `${lang} ${engine.id}`).not.toBe('');
    }
  });
});

describe.runIf(BUILT)('the table of the libraries against dist/', () => {
  it('every .wasm of dist/_astro has its row in the table, and every row has its files', () => {
    const served = servedWasm();
    const named = new Set(ENGINES.flatMap((engine) => engine.wasm));
    expect([...served.keys()].filter((name) => !named.has(name)), 'a .wasm of dist/ with no row').toEqual([]);
    expect([...named].filter((name) => !served.has(name)), 'a row with a file that is not in dist/').toEqual([]);
    // The two decoders of PDF.js are served as they are, under the folder of their version.
    for (const name of ['jbig2.wasm', 'openjpeg.wasm']) expect(served.get(name)?.every((file) => /^_astro\/pdfjs\/[^/]+\/wasm\//.test(file)), name).toBe(true);
  });

  it('every .wasm of dist/ is the file its package publishes, byte for byte', () => {
    const wrong: string[] = [];
    for (const [name, files] of servedWasm()) {
      const engine = ENGINES.find((row) => row.wasm.includes(name));
      if (!engine) {
        wrong.push(`${name}: sem linha`);
        continue;
      }
      const dir = findPackageDir(engine.pkg, process.cwd());
      if (!dir) throw new Error(`${engine.pkg} not installed`);
      const published = new Set(readWasmSources(engine.pkg, dir).filter((source) => basename(source.file) === name).map((source) => source.sha256));
      for (const file of files) if (!published.has(sha256(join(DIST, file)))) wrong.push(`${file}: não é o ${name} de ${engine.pkg}`);
    }
    expect(wrong).toEqual([]);
  });

  it('the JavaScript rows have no .wasm, and the only .wasm files of PDF.js in dist/ are its two image decoders', () => {
    expect(ENGINES.filter((engine) => engine.kind === 'js').map((engine) => engine.library)).toEqual(['PDF.js', 'pdf-lib']);
    const pdfjs = walk(join(DIST, '_astro')).filter((file) => file.startsWith('_astro/pdfjs/') && file.endsWith('.wasm')).map((file) => basename(file));
    expect(pdfjs.sort()).toEqual(['jbig2.wasm', 'openjpeg.wasm']);
    expect(ENGINES.filter((engine) => engine.pkg === 'pdfjs-dist' && engine.kind === 'wasm').flatMap((engine) => engine.wasm).sort()).toEqual(['jbig2.wasm', 'openjpeg.wasm']);
    // pdf-lib brings no WebAssembly into dist/: no .wasm of the build is a file of its package.
    const pdfLib = findPackageDir('@cantoo/pdf-lib', process.cwd());
    expect(pdfLib && readWasmSources('@cantoo/pdf-lib', pdfLib)).toEqual([]);
  });

  for (const lang of LANGS) {
    const path = pathFor('how-it-works', lang);
    const licenses = pathFor('licenses', lang);

    it(`links each row to the row of its package on the Licenses page, in the three languages (${lang})`, () => {
      const main = mainOf(path);
      const rows = main.querySelectorAll('table[data-engines] tbody tr');
      expect(rows.map((row) => row.getAttribute('data-engine')), lang).toEqual(ENGINES.map((engine) => engine.id));
      const ids = new Set(page(licenses).querySelectorAll('[id]').map((element) => element.getAttribute('id')));
      for (const engine of ENGINES) {
        const link = main.querySelector(`tr[data-engine="${engine.id}"] a[data-license]`);
        expect(link?.getAttribute('href'), `${lang} ${engine.id}`).toBe(`${licenses}#${licenseAnchor(engine.pkg)}`);
        expect(ids.has(licenseAnchor(engine.pkg)), `${lang}: ${licenses} has #${licenseAnchor(engine.pkg)}`).toBe(true);
        const files = main.querySelectorAll(`tr[data-engine="${engine.id}"] code[data-wasm]`).map((code) => code.getAttribute('data-wasm'));
        expect(files, `${lang} ${engine.id}`).toEqual([...engine.wasm]);
      }
    });

    it(`links each library to the pages of its tools in the language (${lang})`, () => {
      const main = mainOf(path);
      for (const engine of ENGINES) {
        const hrefs = main.querySelectorAll(`tr[data-engine="${engine.id}"] .fo-engines__tools a`).map((link) => link.getAttribute('href'));
        expect(hrefs, `${lang} ${engine.id}`).toEqual(engine.tools.map((tool) => pathFor(tool, lang)));
        for (const href of hrefs) expect(existsSync(fileOf(href ?? '')), `${lang}: ${href}`).toBe(true);
      }
    });

    it(`links the Privacy and the Licenses page of its language (${lang})`, () => {
      const hrefs = mainOf(path).querySelectorAll('[data-claim] a').map((link) => link.getAttribute('href'));
      expect(hrefs, lang).toContain(pathFor('privacy', lang));
      expect(hrefs, lang).toContain(licenses);
    });

    it(`has the five parts in order, each a section with its id, an Article with the dates of the changelog, the breadcrumb and no ad (${lang})`, () => {
      const root = page(path);
      const main = mainOf(path);
      expect(main.querySelectorAll('section.fo-how').map((section) => section.getAttribute('id')), lang).toEqual(['file', 'webassembly', 'network', 'check', 'limits']);
      const t = TEXTS[lang]['how-it-works'];
      expect(main.querySelectorAll('section.fo-how > h2').map((heading) => heading.text.trim()), lang).toEqual([t.file.heading, t.wasm.heading, t.network.heading, t.check.heading, t.limits.heading]);
      // The index of the right column links to the five parts.
      expect(main.querySelectorAll('.fo-toc a').map((link) => link.getAttribute('href')), lang).toEqual(['#file', '#webassembly', '#network', '#check', '#limits']);
      const graph = root.querySelectorAll('script[type="application/ld+json"]').flatMap((script) => (JSON.parse(script.text) as { '@graph'?: Record<string, unknown>[] })['@graph'] ?? []);
      const article = graph.find((node) => node['@type'] === 'Article');
      const born = birthOf('how-it-works', lang);
      expect(born, lang).toBeDefined();
      expect(article?.['author'], lang).toEqual({ '@id': 'https://fileorca.com/#victor' });
      expect(article?.['dateModified'], lang).toBe(lastmodOf('how-it-works', lang));
      expect(article?.['datePublished'], lang).toBe(CHANGELOG[born ?? -1]?.date);
      expect(graph.some((node) => node['@type'] === 'BreadcrumbList'), lang).toBe(true);
      expect(graph.some((node) => node['@type'] === 'Person'), lang).toBe(true);
      // No ad: no box, no mark and no loader of AdSense anywhere in the page.
      // The same reading as the free pages of tests/e2e/ads.spec.ts.
      expect(root.querySelectorAll('.fo-ad, aside.fo-rail, script[src*="adsbygoogle"], ins.adsbygoogle').length, lang).toBe(0);
      const html = readFileSync(fileOf(path), 'utf8');
      expect(html, lang).not.toContain('pagead2.googlesyndication.com');
      expect(html, lang).not.toMatch(/adsbygoogle[^;]*\.push\s*\(/);
    });
  }
});

