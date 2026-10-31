import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import CompressImagePage from '../../src/tools/compress-image/CompressImagePage.astro';
import To100kbPage from '../../src/tools/compress-image/presets/to-100kb/To100kbPage.astro';
import To1mbPage from '../../src/tools/compress-image/presets/to-1mb/To1mbPage.astro';
import LegalView from '../../src/views/LegalView.astro';
import AboutView from '../../src/views/AboutView.astro';
import ContactView from '../../src/views/ContactView.astro';
import LicensesView from '../../src/views/LicensesView.astro';
import SupportView from '../../src/views/SupportView.astro';
import HomeView from '../../src/views/HomeView.astro';
import NotFoundView from '../../src/views/NotFoundView.astro';

// Whole pages in the three states of the build variables: the meta tag goes on every page once
// the client exists; the loader and the units only on tool pages, and only with all three.
const CLIENT = 'ca-pub-1234567890123456';
const SLOTS = JSON.stringify({ arquivos: { conteudo: '1111111111', lateral: '2222222222' } });
const STATES = {
  none: {},
  client: { PUBLIC_ADSENSE_CLIENT: CLIENT },
  all: { PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true' },
} as const;

// The tool pages that exist: Compress image in the three languages, and the presets (English only).
// A tool adds its page here when it is built; each one is the shared mold, so each has the same two AdSlots.
const TOOL_PAGES = [
  ...(['en', 'pt', 'es'] as const).map((lang) => ({ name: `compress-image ${lang}`, Page: CompressImagePage, lang })),
  { name: 'compress-image-to-100kb en', Page: To100kbPage, lang: 'en' as const },
  { name: 'compress-image-to-1mb en', Page: To1mbPage, lang: 'en' as const },
];

const NO_ADS = [
  ['privacy', LegalView, { page: 'privacy' }],
  ['terms', LegalView, { page: 'terms' }],
  ['about', AboutView, {}],
  ['contact', ContactView, {}],
  ['licenses', LicensesView, {}],
  ['support', SupportView, {}],
  ['home', HomeView, {}],
  ['404', NotFoundView, {}],
] as const;

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});
afterEach(() => vi.unstubAllEnvs());

describe('anúncio por página nos três estados', () => {
  for (const [state, env] of Object.entries(STATES)) {
    it(`tool page vs every other page (${state})`, async () => {
      for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
      for (const { name: page, Page, lang } of TOOL_PAGES) {
        const tool = await container.renderToString(Page, { props: { lang } });
        expect(tool.includes(`<meta name="google-adsense-account" content="${CLIENT}">`), page).toBe(state !== 'none');
        expect(tool.includes('adsbygoogle.js?client='), page).toBe(state === 'all');
        expect((tool.match(/class="adsbygoogle"/g) ?? []).length, page).toBe(state === 'all' ? 2 : 0);
        expect((tool.match(/class="fo-ad fo-ad--/g) ?? []).length, page).toBe(2);
      }
      for (const lang of ['en', 'pt', 'es'] as const) {
        for (const [name, View, props] of NO_ADS) {
          const html = await container.renderToString(View, { props: { lang, ...props } });
          expect(html.includes('google-adsense-account'), `${name} ${lang}`).toBe(state !== 'none');
          expect(html, `${name} ${lang}`).not.toContain('adsbygoogle.js');
          expect(html, `${name} ${lang}`).not.toContain('class="adsbygoogle"');
          expect(html, `${name} ${lang}`).not.toContain('class="fo-ad');
        }
      }
    }, 60_000);
  }
});
