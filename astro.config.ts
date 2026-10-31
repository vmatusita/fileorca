import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { platformFiles } from './src/platform/build-files.ts';
import { recordBundledModules } from './src/platform/bundle-record.ts';
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
  ].join('|'),
);

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
    plugins: [tailwindcss()],
    worker: { format: 'es', plugins: () => [bundleRecord] },
    build: {
      rolldownOptions: {
        plugins: [bundleRecord],
        output: { codeSplitting: { groups: [{ name: 'island', test: SHARED_ISLAND }] } },
      },
    },
  },
});
