// Licenses of what reaches the browser (DECISOES § 13). Build-time only (reads node_modules).
// /licenses lists the `dependencies`, the packages that enter the bundle inside them (BUNDLED_TRANSITIVE)
// and the fonts, each with the license texts it requires. The license gate checks this list against the
// real bundle (src/platform/bundle-record.ts) and the page it produced.
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Licenses allowed by CLAUDE.md. LGPL-3.0 only as a separate file (checked by the gate). */
export const ALLOWED_LICENSES = [
  'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'MPL-2.0', 'OFL-1.1',
] as const;
export const SEPARATE_FILE_ONLY = ['LGPL-3.0', 'LGPL-3.0-only', 'LGPL-3.0-or-later'] as const;

/** One license text shown on /licenses. */
export interface LicenseText {
  /** What it covers when that is not the package itself (a codec compiled into its .wasm). */
  label: string | null;
  text: string;
  /** Where the text was copied from when the package does not ship it. */
  source: string | null;
}

export interface PackageLicense {
  name: string;
  version: string;
  license: string;
  repository: string | null;
  /** The package's own license file. */
  text: string | null;
  /** Every text the page shows for it: the package's own first, then the codecs inside it. */
  texts: LicenseText[];
  font: boolean;
  /** The package it comes inside of, for the ones that are not in `dependencies`. */
  via: string | null;
}

interface Manifest {
  name: string;
  version: string;
  license?: string | { type: string };
  repository?: string | { url: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Packages that enter the browser bundle without being in `dependencies`: they come with a package that
 * is. The list is what `pnpm gate:licencas` found in the real bundle (module list of every chunk under
 * dist/_astro/); the gate fails when a bundled package is not here, or when one here has left the bundle.
 * `via` is the package that depends on it (it is looked up next to that package, as pnpm lays them out).
 */
export const BUNDLED_TRANSITIVE: readonly { name: string; via: string }[] = [
  { name: 'culori', via: '@cantoo/pdf-lib' },
  { name: 'html-entities', via: '@cantoo/pdf-lib' },
  { name: 'node-html-better-parser', via: '@cantoo/pdf-lib' },
  { name: 'tslib', via: '@cantoo/pdf-lib' },
  { name: '@preact/signals', via: '@astrojs/preact' },
  { name: '@preact/signals-core', via: '@preact/signals' },
  // The QR code generator (F7, decision 8): lib/core/segments.js of qrcode requires it.
  { name: 'dijkstrajs', via: 'qrcode' },
];

/**
 * License files of the codecs compiled into a package's .wasm. They sit in the package but are not
 * named LICENSE, so the generic lookup misses them. `package` points at another package's copy.
 */
const CODEC_LICENSE_FILES: Record<string, readonly { label: string; file: string; package?: string }[]> = {
  '@jsquash/jpeg': [{ label: 'MozJPEG and libjpeg-turbo', file: 'codec/LICENSE.codec.md' }],
  '@jsquash/webp': [{ label: 'libwebp', file: 'codec/LICENSE.codec.md' }],
  // The AVIF codec builds libsharpyuv from libwebp, so the libwebp license applies to it too.
  '@jsquash/avif': [{ label: 'libsharpyuv (from libwebp)', file: 'codec/LICENSE.codec.md', package: '@jsquash/webp' }],
  '@jsquash/oxipng': [{ label: 'OxiPNG', file: 'codec/LICENSE.codec.md' }],
  '@jsquash/resize': [{ label: 'resize (Rust crate)', file: 'lib/resize/LICENSE.codec.md' }],
  // libheif's own license file: LGPL-3.0, the GPL-3.0 text it refers to, and the MIT license of its sample apps.
  'libheif-js': [{ label: 'libheif and libde265', file: 'libheif-wasm/LICENSE' }],
  // What the site ships from pdfjs-dist besides its JavaScript (F5a, DECISOES § 144): the two .wasm decoders with the
  // license of the library compiled in, PDF.js's own glue of the three decoders (it is JavaScript inside the worker, so it
  // ships even for qcms), the CMaps and the Foxit standard fonts. /licenses lists only what ships (gate:licencas,
  // checkWasmTexts): qcms_bg.wasm, with the qcms library compiled into it (LICENSE_QCMS), is not copied because PDF.js loads
  // it only with useWorkerFetch, which the site turns off, so that text is not here. The Liberation fonts (GPL-2.0 with a
  // font exception) and the CC0 .icc are not copied either.
  'pdfjs-dist': [
    { label: 'JBIG2 and CCITT decoder (PDFium), in jbig2.wasm', file: 'wasm/LICENSE_JBIG2' },
    { label: 'PDF.js glue of jbig2.wasm', file: 'wasm/LICENSE_PDFJS_JBIG2' },
    { label: 'OpenJPEG (JPEG 2000), in openjpeg.wasm', file: 'wasm/LICENSE_OPENJPEG' },
    { label: 'PDF.js glue of openjpeg.wasm', file: 'wasm/LICENSE_PDFJS_OPENJPEG' },
    { label: 'PDF.js glue of qcms_bg.wasm', file: 'wasm/LICENSE_PDFJS_QCMS' },
    { label: 'Adobe CMaps', file: 'cmaps/LICENSE' },
    { label: 'Foxit standard fonts (PDFium)', file: 'standard_fonts/LICENSE_FOXIT' },
  ],
};

/** Folder of the license texts copied from upstream repositories, relative to the project root. */
export const UPSTREAM_TEXT_DIR = 'src/platform/license-texts';

/** A license text copied from upstream. */
export interface UpstreamText {
  label: string;
  file: string;
  source: string;
  /**
   * The npm package this text covers when that package is compiled into the outer package's own prebuilt JavaScript
   * (a webpack build that ships in the outer package, so the bundle record sees only the outer file). The license gate
   * reads the `// MODULE: ./node_modules/<name>/` markers of every such file in the bundle and fails on a package with
   * no text here (DECISOES § 179).
   */
  embeds?: string;
}

/**
 * Codec licenses the package does not ship (@jsquash/avif has only its own). They were copied, read-only,
 * from the official upstream repositories at the versions compiled into the .wasm (libaom 3.7.0 is the
 * string inside avif_enc.wasm; libavif 1.0.1 is the tag in jSquash's codec Makefile).
 */
export const UPSTREAM_TEXTS: Record<string, readonly UpstreamText[]> = {
  '@jsquash/avif': [
    { label: 'libavif 1.0.1', file: 'libavif-1.0.1-LICENSE.txt', source: 'https://github.com/AOMediaCodec/libavif/blob/v1.0.1/LICENSE' },
    { label: 'libaom 3.7.0', file: 'libaom-3.7.0-LICENSE.txt', source: 'https://aomedia.googlesource.com/aom/+/refs/tags/v3.7.0/LICENSE' },
    { label: 'libaom 3.7.0, patent license', file: 'libaom-3.7.0-PATENTS.txt', source: 'https://aomedia.googlesource.com/aom/+/refs/tags/v3.7.0/PATENTS' },
  ],
  // qpdf 12.2.0 and what its .wasm is built with (the Dockerfile of neslinesli93/qpdf-wasm 0.3.0 pins zlib and the
  // ImageMagick fork of libjpeg-turbo 2.1.1 by commit; DECISOES § 143). The npm package ships none of these texts.
  '@neslinesli93/qpdf-wasm': [
    { label: 'qpdf 12.2.0', file: 'qpdf-12.2.0-LICENSE.txt', source: 'https://github.com/qpdf/qpdf/blob/v12.2.0/LICENSE.txt' },
    { label: 'qpdf 12.2.0, notices', file: 'qpdf-12.2.0-NOTICE.md', source: 'https://github.com/qpdf/qpdf/blob/v12.2.0/NOTICE.md' },
    { label: 'zlib', file: 'zlib-21767c6-README.txt', source: 'https://github.com/madler/zlib/blob/21767c654d31d2dccdde4330529775c6c5fd5389/README' },
    { label: 'libjpeg-turbo 2.1.1', file: 'libjpeg-turbo-7aa2a89-LICENSE.md', source: 'https://github.com/ImageMagick/jpeg-turbo/blob/7aa2a898c564041a24b09d0a6e780aaa632d08d3/LICENSE.md' },
    { label: 'libjpeg-turbo 2.1.1, the IJG license', file: 'libjpeg-turbo-7aa2a89-README.ijg', source: 'https://github.com/ImageMagick/jpeg-turbo/blob/7aa2a898c564041a24b09d0a6e780aaa632d08d3/README.ijg' },
  ],
  // The legacy build of PDF.js (the Safari 16.4 floor, DECISOES § 144) has core-js 3.50.0 compiled into pdf.mjs and
  // pdf.worker.mjs; pdfjs-dist ships only its own Apache-2.0 text (DECISOES § 179). The bytes are the LICENSE of the core-js
  // 3.50.0 npm package, the version and the address the shared store of the bundled code names.
  'pdfjs-dist': [
    { label: 'core-js 3.50.0, inside the PDF.js legacy build', file: 'core-js-3.50.0-LICENSE.txt', source: 'https://github.com/zloirock/core-js/blob/v3.50.0/LICENSE', embeds: 'core-js' },
  ],
  // The matrix code of qrcode is Kazuhiko Arase's "QRCode for JavaScript" (MIT), whose notice lives only in the comment at the
  // top of lib/core/qrcode.js, which the minifier drops (F7, decision 8). The text is that comment, byte for byte, as the npm
  // package of qrcode 1.5.4 ships it; licenses.test.ts finds it in the installed file.
  qrcode: [
    { label: 'QRCode for JavaScript (Kazuhiko Arase), the notice in lib/core/qrcode.js', file: 'qrcode-1.5.4-qrcode-for-javascript.txt', source: 'https://unpkg.com/qrcode@1.5.4/lib/core/qrcode.js' },
  ],
};

/**
 * The package's own license text when the package does not ship one: @neslinesli93/qpdf-wasm declares ISC in its
 * package.json and keeps the text only in its repository (copied, read-only, from the master branch on 1/nov/2026).
 */
export const UPSTREAM_OWN_TEXTS: Record<string, { file: string; source: string }> = {
  '@neslinesli93/qpdf-wasm': { file: 'qpdf-wasm-ISC-LICENSE.txt', source: 'https://github.com/neslinesli93/qpdf-wasm/blob/master/LICENSE' },
};

/**
 * LGPL packages and the conditions under which they may reach the browser (CLAUDE.md: LGPL-3.0 only as
 * a separate file). The gate checks them against dist/: the .wasm is byte-identical to the package's,
 * and the glue shares its chunk with nothing but the loaders named here (none for libheif: its glue is a chunk of its own).
 */
export interface SeparateFileRule {
  package: string;
  /** The compiled library, relative to the package folder. */
  wasm: string;
  /** The JavaScript glue module, relative to the package folder. */
  glue: string;
  /** First-party modules (relative to the project root) allowed to share the glue's chunk. */
  loaders: readonly string[];
}

export const SEPARATE_FILE_RULES: readonly SeparateFileRule[] = [
  {
    package: 'libheif-js',
    wasm: 'libheif-wasm/libheif.wasm',
    glue: 'libheif-wasm/libheif.js',
    // The glue is a chunk of its own (astro.config.ts, the 'libheif' group): no loader shares it.
    loaders: [],
  },
];

/** The libde265 version libheif's own build-emscripten.sh downloads by default (v1.23.5 of libheif). */
export const LIBDE265_VERSION = '1.0.15';

export interface SourceLink {
  id: 'libheif' | 'libde265' | 'wrapper' | 'build';
  name: string;
  version: string;
  url: string;
}

/**
 * Where the source code of the LGPL library in use is: libheif, the HEVC decoder inside the .wasm, the
 * npm wrapper and the repository that builds the .wasm. The tags exist upstream (checked 31/oct/2026):
 * libheif and libheif-emscripten use `v1.23.5`, libheif-js uses `1.23.5` (no `v`).
 */
export function lgplSources(libheifJsVersion: string): SourceLink[] {
  return [
    { id: 'libheif', name: 'libheif', version: libheifJsVersion, url: `https://github.com/strukturag/libheif/tree/v${libheifJsVersion}` },
    { id: 'libde265', name: 'libde265', version: LIBDE265_VERSION, url: `https://github.com/strukturag/libde265/tree/v${LIBDE265_VERSION}` },
    { id: 'wrapper', name: 'libheif-js', version: libheifJsVersion, url: `https://github.com/catdad-experiments/libheif-js/tree/${libheifJsVersion}` },
    { id: 'build', name: 'libheif-emscripten', version: libheifJsVersion, url: `https://github.com/catdad-experiments/libheif-emscripten/tree/v${libheifJsVersion}` },
  ];
}

function readJson(path: string): Manifest {
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

function repositoryUrl(repository: Manifest['repository']): string | null {
  const raw = typeof repository === 'string' ? repository : repository?.url;
  if (!raw) return null;
  const cleaned = raw.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^git:\/\//, 'https://');
  if (/^[\w-]+\/[\w.-]+$/.test(cleaned)) return `https://github.com/${cleaned}`;
  return cleaned.startsWith('https://') ? cleaned : null;
}

function licenseText(dir: string): string | null {
  const file = readdirSync(dir).find((entry) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(entry));
  return file ? readFileSync(join(dir, file), 'utf8').trim() : null;
}

/** Looks a package up the way Node does, from `fromDir` upwards; pnpm keeps a package's dependencies next to it. */
export function findPackageDir(name: string, fromDir: string): string | null {
  let dir = fromDir;
  for (;;) {
    const candidate = join(dir, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return realpathSync(candidate);
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function packageTexts(name: string, dir: string, root: string, own: string | null, ownSource: string | null): LicenseText[] {
  const texts: LicenseText[] = own ? [{ label: null, text: own, source: ownSource }] : [];
  for (const extra of CODEC_LICENSE_FILES[name] ?? []) {
    const from = extra.package ? findPackageDir(extra.package, dir) : dir;
    const path = from ? join(from, extra.file) : null;
    if (!path || !existsSync(path)) throw new Error(`license file ${extra.package ?? name}/${extra.file} not found (needed for ${name})`);
    texts.push({ label: extra.label, text: readFileSync(path, 'utf8').trim(), source: null });
  }
  for (const upstream of UPSTREAM_TEXTS[name] ?? []) {
    texts.push({ label: upstream.label, text: readFileSync(join(root, UPSTREAM_TEXT_DIR, upstream.file), 'utf8').trim(), source: upstream.source });
  }
  return texts;
}

/** A package read from a known folder (the folder the bundle record names, or `node_modules/<name>`). */
export function readPackageAt(name: string, dir: string, root = process.cwd(), via: string | null = null): PackageLicense {
  const manifest = readJson(join(dir, 'package.json'));
  const license = typeof manifest.license === 'string' ? manifest.license : manifest.license?.type ?? 'UNKNOWN';
  const upstreamOwn = UPSTREAM_OWN_TEXTS[name];
  const shipped = existsSync(dir) ? licenseText(dir) : null;
  const own = shipped ?? (upstreamOwn ? readFileSync(join(root, UPSTREAM_TEXT_DIR, upstreamOwn.file), 'utf8').trim() : null);
  return {
    name,
    version: manifest.version,
    license,
    repository: repositoryUrl(manifest.repository),
    text: own,
    texts: packageTexts(name, dir, root, own, shipped ? null : (upstreamOwn?.source ?? null)),
    font: name.startsWith('@fontsource'),
    via,
  };
}

export function readPackage(name: string, root = process.cwd()): PackageLicense {
  return readPackageAt(name, join(root, 'node_modules', name), root);
}

export function projectManifest(root = process.cwd()): Manifest {
  return readJson(join(root, 'package.json'));
}

/** Packages that reach the browser: the `dependencies` of package.json. */
export function browserPackages(root = process.cwd()): PackageLicense[] {
  return Object.keys(projectManifest(root).dependencies ?? {}).sort().map((name) => readPackage(name, root));
}

/** The packages of BUNDLED_TRANSITIVE, read from where their parent finds them. */
export function bundledPackages(root = process.cwd()): PackageLicense[] {
  const dirs = new Map<string, string>();
  const dirOf = (name: string): string => {
    const known = dirs.get(name);
    if (known) return known;
    const entry = BUNDLED_TRANSITIVE.find((item) => item.name === name);
    const dir = entry ? findPackageDir(name, dirOf(entry.via)) : findPackageDir(name, root);
    if (!dir) throw new Error(`package ${name} not found${entry ? ` next to ${entry.via}` : ''}`);
    dirs.set(name, dir);
    return dir;
  };
  return BUNDLED_TRANSITIVE.map((entry) => readPackageAt(entry.name, dirOf(entry.name), root, entry.via)).sort((a, b) => a.name.localeCompare(b.name));
}

/** What /licenses lists: the browser dependencies and the packages that come inside them. */
export function listedPackages(root = process.cwd()): PackageLicense[] {
  return [...browserPackages(root), ...bundledPackages(root)];
}

export function buildPackages(root = process.cwd()): PackageLicense[] {
  return Object.keys(projectManifest(root).devDependencies ?? {}).sort().map((name) => readPackage(name, root));
}

/** An SPDX expression is allowed when every alternative of an OR, or every term of an AND, is allowed. */
export function isAllowedLicense(expression: string): boolean {
  const clean = expression.replace(/[()]/g, ' ').trim();
  if (/\sOR\s/.test(clean)) return clean.split(/\s+OR\s+/).some((part) => isAllowedLicense(part));
  if (/\sAND\s/.test(clean)) return clean.split(/\s+AND\s+/).every((part) => isAllowedLicense(part));
  return (ALLOWED_LICENSES as readonly string[]).includes(clean);
}

/** LGPL-3.0: allowed only while the library stays a separate file (SEPARATE_FILE_RULES, checked by the gate). */
export function isSeparateFileOnly(expression: string): boolean {
  return (SEPARATE_FILE_ONLY as readonly string[]).includes(expression.trim());
}

/** Never allowed anywhere in the installed tree, not even in build tools (CLAUDE.md). */
export function isForbiddenLicense(expression: string): boolean {
  return /\b(AGPL|SSPL|BUSL|Elastic|Commons[- ]Clause|CC-BY-NC|NonCommercial|PolyForm-Noncommercial)\b/i.test(expression)
    || /(^|[^L])GPL/.test(expression);
}

/**
 * The id of a package's row on the Licenses page ("@jsquash/jpeg" gives "pkg-jsquash-jpeg"). F19a (decision 7; DECISOES
 * § 761): the Licenses page names its rows with it, and the table of How it works links each library to that row.
 */
export function licenseAnchor(name: string): string {
  return `pkg-${name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;
}
