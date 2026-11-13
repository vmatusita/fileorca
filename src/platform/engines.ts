// The libraries that do the work of the image and PDF tools in the browser, one row each of the table "What runs as
// WebAssembly" of the How it works page (F19a, decision 7; DECISOES § 761). Plain data, read in Node by the view at build
// time and by tests/unit/how-it-works.test.ts, never by an island.
// - `wasm`: the .wasm files of the row, by the name their package gives them; the build serves the image codecs and qpdf
//   from dist/_astro/ with a hash after the name (and each in two copies, one per bundle that asks for it), and the two
//   decoders of PDF.js from dist/_astro/pdfjs/<version>/wasm/ as they are. The test proves that every .wasm of dist/ has
//   its row here and that every file named here is in dist/.
// - `pkg`: the npm package that brings the library, which is the row of the Licenses page (licenseAnchor of
//   src/platform/licenses.ts) and the license of what is compiled into it. The page links only to that row, never to the
//   library's own address.
// - `tools`: the tool and preset pages that can use the library, from the engine (src/engine/image/ and src/engine/pdf/)
//   and the panels (src/tools/pdf/tools.tsx); the test proves each id is a page of the registries.
// PDF.js and pdf-lib are JavaScript: they are rows too, with no .wasm, so the page says so; the two image decoders inside
// PDF.js are WebAssembly rows of their own.
import type { ImagePageId } from '../tools/image/registry.ts';
import type { PdfPageId } from '../tools/pdf/registry.ts';

export type EngineId = 'mozjpeg' | 'libwebp' | 'oxipng' | 'resize' | 'libheif' | 'libavif' | 'qpdf' | 'jbig2' | 'openjpeg' | 'pdfjs' | 'pdf-lib';

export interface Engine {
  id: EngineId;
  /** The name of the library, a proper name, the same in every language. */
  library: string;
  /** The npm package that brings it: its row on the Licenses page. */
  pkg: string;
  kind: 'wasm' | 'js';
  /** The .wasm files of the row, by the name their package gives them; none for a JavaScript library. */
  wasm: readonly string[];
  /** The tool and preset pages that can use it, in the order of their registries. */
  tools: readonly (ImagePageId | PdfPageId)[];
}

/** The pages that draw the pages of a PDF with PDF.js (a grid, a view, the images of a page, the Strong compression). */
const DRAWS_PAGES = [
  'merge-pdf',
  'split-pdf',
  'pdf-to-jpg',
  'compress-pdf',
  'rotate-pdf',
  'delete-pdf-pages',
  'add-page-numbers-to-pdf',
  'sign-pdf',
  'organize-pdf',
  'reorder-pdf-pages',
  'split-pdf-extract-pages',
  'pdf-to-jpg-to-png',
] as const satisfies readonly PdfPageId[];

export const ENGINES: readonly Engine[] = [
  {
    id: 'mozjpeg',
    library: 'MozJPEG',
    pkg: '@jsquash/jpeg',
    kind: 'wasm',
    wasm: ['mozjpeg_enc.wasm', 'mozjpeg_dec.wasm'],
    tools: ['compress-image', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail', 'compress-pdf'],
  },
  { id: 'libwebp', library: 'libwebp', pkg: '@jsquash/webp', kind: 'wasm', wasm: ['webp_enc_simd.wasm', 'webp_dec.wasm'], tools: ['compress-image', 'webp-to-jpg', 'convert-to-webp'] },
  { id: 'oxipng', library: 'OxiPNG', pkg: '@jsquash/oxipng', kind: 'wasm', wasm: ['squoosh_oxipng_bg.wasm'], tools: ['compress-image'] },
  { id: 'resize', library: 'resize', pkg: '@jsquash/resize', kind: 'wasm', wasm: ['squoosh_resize_bg.wasm'], tools: ['resize-image', 'resize-image-youtube-thumbnail', 'compress-pdf'] },
  { id: 'libheif', library: 'libheif', pkg: 'libheif-js', kind: 'wasm', wasm: ['libheif.wasm'], tools: ['heic-to-jpg'] },
  { id: 'libavif', library: 'libavif', pkg: '@jsquash/avif', kind: 'wasm', wasm: ['avif_dec.wasm', 'avif_enc.wasm'], tools: ['avif-to-jpg', 'convert-to-webp'] },
  { id: 'qpdf', library: 'qpdf', pkg: '@neslinesli93/qpdf-wasm', kind: 'wasm', wasm: ['qpdf.wasm'], tools: ['compress-pdf', 'protect-pdf', 'unlock-pdf'] },
  { id: 'jbig2', library: 'JBIG2 (PDFium)', pkg: 'pdfjs-dist', kind: 'wasm', wasm: ['jbig2.wasm'], tools: DRAWS_PAGES },
  { id: 'openjpeg', library: 'OpenJPEG', pkg: 'pdfjs-dist', kind: 'wasm', wasm: ['openjpeg.wasm'], tools: DRAWS_PAGES },
  { id: 'pdfjs', library: 'PDF.js', pkg: 'pdfjs-dist', kind: 'js', wasm: [], tools: DRAWS_PAGES },
  {
    id: 'pdf-lib',
    library: 'pdf-lib',
    pkg: '@cantoo/pdf-lib',
    kind: 'js',
    wasm: [],
    tools: [
      'image-to-pdf',
      'merge-pdf',
      'split-pdf',
      'compress-pdf',
      'rotate-pdf',
      'delete-pdf-pages',
      'add-page-numbers-to-pdf',
      'sign-pdf',
      'protect-pdf',
      'unlock-pdf',
      'organize-pdf',
      'reorder-pdf-pages',
      'watermark-pdf',
      'split-pdf-extract-pages',
    ],
  },
];
