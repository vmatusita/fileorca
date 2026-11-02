import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { platformFiles } from './src/platform/build-files.ts';
import { recordBundledModules } from './src/platform/bundle-record.ts';
import { qrcodeEsm } from './src/platform/qrcode-esm.ts';
import { SITE_ORIGIN } from './src/platform/site.ts';

// Everything the image tool pages share in the browser lands in one chunk, so a tool page loads two JS
// files: its own mount entry (the tool's Panel, options and operation) and this chunk (the Preact runtime,
// the shared island, the FileCard, the icons, the formatting and the events). The lazy parts are left out
// on purpose: engine-client.ts and pdf-client.ts (Comlink and the workers load on the first file or when
// the pointer enters the zone), and the engine itself, which only the workers import. DECISOES § 23 and § 59.
const SHARED_ISLAND = new RegExp(
  [
    '[\\\\/]node_modules[\\\\/]preact[\\\\/]',
    'preload-helper',
    '[\\\\/]src[\\\\/]tools[\\\\/]image[\\\\/](?!engine-client|pdf-client)',
    '[\\\\/]src[\\\\/]components[\\\\/]FileCard',
    '[\\\\/]src[\\\\/]icons[\\\\/](?:Icon\\.tsx|svg\\.ts)',
    '[\\\\/]docs[\\\\/]design[\\\\/]assets[\\\\/]Icons[\\\\/]',
    '[\\\\/]src[\\\\/]i18n[\\\\/]format\\.ts',
    '[\\\\/]src[\\\\/]analytics[\\\\/]',
    '[\\\\/]src[\\\\/]platform[\\\\/]site\\.ts',
    '[\\\\/]src[\\\\/]oli[\\\\/]poses\\.ts',
    // F8: what the islands and the service worker agree on (the share inbox; DECISOES § 290).
    '[\\\\/]src[\\\\/]sw[\\\\/]shared\\.ts',
  ].join('|'),
);

// libheif's JavaScript glue (LGPL-3.0) is a chunk of its own in the page and the worker builds, next to its
// unmodified .wasm, so it can be replaced on its own (DECISOES § 7 and § 79; gate:licencas checks it).
const LIBHEIF_GLUE = { name: 'libheif', test: /[\\/]libheif-js[\\/]libheif-wasm[\\/]libheif\.js$/ };

// One instance for the page build and the worker build: both chunk sets go into one record (see bundle-record.ts).
const bundleRecord = recordBundledModules();

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  trailingSlash: 'always',
  // 'preserve' keeps src/pages/pt/404.astro as pt/404.html (the "404-page" handler needs it).
  build: { format: 'preserve' },
  integrations: [preact(), platformFiles()],
  vite: {
    // The QR code library as ES modules, so the QR page loads 2 JS files (DECISOES § 271).
    plugins: [tailwindcss(), qrcodeEsm()],
    worker: {
      format: 'es',
      plugins: () => [bundleRecord],
      rolldownOptions: { output: { codeSplitting: { groups: [LIBHEIF_GLUE] } } },
    },
    build: {
      rolldownOptions: {
        plugins: [bundleRecord],
        output: { codeSplitting: { groups: [{ name: 'island', test: SHARED_ISLAND }, LIBHEIF_GLUE] } },
      },
    },
  },
});
