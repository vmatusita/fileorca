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
  vite: { plugins: [tailwindcss()] },
});
