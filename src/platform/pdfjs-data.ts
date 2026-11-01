// The files of pdfjs-dist the PDF tools fetch at run time, copied unchanged into dist/ by the build (F5a, decision 4:
// from the site's own origin, never a CDN): the two WebAssembly decoders (JPEG 2000; JBIG2 and CCITT fax), the CMaps
// for CJK text and the Foxit standard fonts. Left out on purpose (DECISOES § 144): the Liberation fonts (GPL-2.0 with a
// font exception), the CC0 colour profile, qcms (PDF.js loads it only with useWorkerFetch, which the site turns off),
// the scripting sandbox (quickjs-eval) and the asm.js fallbacks. The folder carries the version, so its cache is
// immutable like the rest of /_astro/. gate:licencas and the tests compare every copy with the package file.
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export function pdfjsPackageDir(): string {
  return dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));
}

export function pdfjsVersion(): string {
  return (JSON.parse(readFileSync(join(pdfjsPackageDir(), 'package.json'), 'utf8')) as { version: string }).version;
}

/** The folder in dist/ (and the URL path) of the copy. */
export function pdfjsDataPath(): string {
  return `_astro/pdfjs/${pdfjsVersion()}`;
}

/** Package-relative paths of every file the site serves, in a fixed order. */
export function pdfjsDataFiles(): string[] {
  const dir = pdfjsPackageDir();
  const cmaps = readdirSync(join(dir, 'cmaps')).filter((name) => name.endsWith('.bcmap')).sort().map((name) => `cmaps/${name}`);
  const fonts = readdirSync(join(dir, 'standard_fonts')).filter((name) => /^Foxit[A-Za-z]+\.pfb$/.test(name)).sort().map((name) => `standard_fonts/${name}`);
  return ['wasm/jbig2.wasm', 'wasm/openjpeg.wasm', ...fonts, ...cmaps];
}

/** Copies the files into `out` (the dist folder); returns how many. */
export function copyPdfjsData(out: string): number {
  const from = pdfjsPackageDir();
  const to = join(out, pdfjsDataPath());
  const files = pdfjsDataFiles();
  for (const file of files) {
    mkdirSync(dirname(join(to, file)), { recursive: true });
    copyFileSync(join(from, file), join(to, file));
  }
  return files.length;
}
