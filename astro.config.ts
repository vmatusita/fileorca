import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { platformFiles } from './src/platform/build-files.ts';
import { SITE_ORIGIN } from './src/platform/site.ts';

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  trailingSlash: 'always',
  // 'preserve' keeps src/pages/pt/404.astro as pt/404.html (the "404-page" handler needs it).
  build: { format: 'preserve' },
  integrations: [preact(), platformFiles()],
  vite: {
    plugins: [tailwindcss()],
    worker: { format: 'es' },
    build: {
      rolldownOptions: {
        // One shared chunk for the Preact runtime, so a tool page loads two JS files (DECISOES § 23).
        output: { codeSplitting: { groups: [{ name: 'preact-runtime', test: /[\\/]node_modules[\\/]preact[\\/]|preload-helper/ }] } },
      },
    },
  },
});
