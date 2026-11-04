import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { languagesOf, routeById } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import LegalView from '../../src/views/LegalView.astro';
import AboutView from '../../src/views/AboutView.astro';
import ContactView from '../../src/views/ContactView.astro';
import LicensesView from '../../src/views/LicensesView.astro';
import SupportView from '../../src/views/SupportView.astro';
import HomeView from '../../src/views/HomeView.astro';
import NotFoundView from '../../src/views/NotFoundView.astro';
import GuidesHubView from '../../src/views/GuidesHubView.astro';
import PdfToolPage from '../../src/tools/pdf/PdfToolPage.astro';
import PdfToolsView from '../../src/views/PdfToolsView.astro';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

// Whole pages in the three states of the build variables: the meta tag goes on every page once
// the client exists; the loader and the units only on tool pages, and only with all three.
const CLIENT = 'ca-pub-1234567890123456';
// F12 (DECISOES § 423): the area "geral" of the home and of the guides hub, with the same two units.
const SLOTS = JSON.stringify({ arquivos: { conteudo: '1111111111', lateral: '2222222222' }, geral: { conteudo: '3333333333', lateral: '4444444444' } });
/** The one push script of a page with a box (src/ads/map.ts). */
const PUSH_SCRIPT = 'if(location.hostname==="fileorca.com"){document.querySelectorAll(".fo-ad[data-ad-id]")';
const STATES = {
  none: {},
  client: { PUBLIC_ADSENSE_CLIENT: CLIENT },
  all: { PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true' },
} as const;

// Every tool page and preset page of the image registry, in each language its route has (the Compress image in
// the three, the rest in English). They are found by their folder, so a tool declared in the registry with no page
// fails the check below, and each one is the shared mold, so each has the same two AdSlots.
type PageComponent = Parameters<AstroContainer['renderToString']>[0];
const modules = import.meta.glob<{ default: PageComponent }>(
  // The PDF mold (src/tools/pdf/, F5a) is one component for the 12 PDF tools: it is checked apart, below.
  ['../../src/tools/*/*Page.astro', '../../src/tools/*/presets/*/*Page.astro', '!../../src/tools/image/*', '!../../src/tools/pdf/*'],
  { eager: true },
);

function idOf(file: string): ImagePageId {
  const preset = /\/tools\/([\w-]+)\/presets\/([\w-]+)\//.exec(file);
  return (preset ? `${preset[1]}-${preset[2]}` : (/\/tools\/([\w-]+)\//.exec(file)?.[1] ?? '')) as ImagePageId;
}

const PAGE_OF = new Map(Object.entries(modules).map(([file, module]) => [idOf(file), module.default] as const));
const TOOL_PAGES: { name: string; Page: PageComponent; props: Record<string, unknown> }[] = [
  ...[...PAGE_OF].flatMap(([id, Page]) => languagesOf(routeById(id)).map((lang) => ({ name: `${id} ${lang}`, Page, props: { lang } }))),
  // F5a: the 12 PDF tools (one mold, told the tool by its id) and the PDF hub carry the same two AdSlots.
  ...PDF_TOOL_IDS.map((id) => ({ name: `${id} en`, Page: PdfToolPage as PageComponent, props: { id } })),
  { name: 'pdf-tools en', Page: PdfToolsView as PageComponent, props: { lang: 'en' } },
];

const NO_ADS = [
  ['privacy', LegalView, { page: 'privacy' }],
  ['terms', LegalView, { page: 'terms' }],
  ['about', AboutView, {}],
  ['contact', ContactView, {}],
  ['licenses', LicensesView, {}],
  ['support', SupportView, {}],
  ['404', NotFoundView, {}],
] as const;
// F12 (decision 3; DECISOES § 423): the home and the guides hub (born with no AdSlot in the F11) have the ads of the map
// now, in the area "geral".
const GERAL = [
  ['home', HomeView, {}],
  ['guides', GuidesHubView, {}],
] as const;

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});
afterEach(() => vi.unstubAllEnvs());

describe('anúncio por página nos três estados', () => {
  it('has a page component for every tool and preset of the registry, and none besides', () => {
    expect([...PAGE_OF.keys()].sort()).toEqual(Object.keys(IMAGE_PAGES).sort());
    expect(TOOL_PAGES.filter((page) => page.props['lang'] === 'en' && !page.name.startsWith('pdf-tools'))).toHaveLength(Object.keys(IMAGE_PAGES).length);
    expect(TOOL_PAGES.filter((page) => page.props['id'] !== undefined)).toHaveLength(PDF_TOOL_IDS.length);
  });

  for (const [state, env] of Object.entries(STATES)) {
    it(`tool page vs every other page (${state})`, async () => {
      for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
      for (const { name: page, Page, props } of TOOL_PAGES) {
        const tool = await container.renderToString(Page, { props });
        expect(tool.includes(`<meta name="google-adsense-account" content="${CLIENT}">`), page).toBe(state !== 'none');
        expect(tool.includes('adsbygoogle.js?client='), page).toBe(state === 'all');
        // F12, the ad map (plan B, DECISOES § 415 and § 423): no <ins> in the HTML in any state; the units come from the
        // one push script of the page, there only with a box.
        expect((tool.match(/class="adsbygoogle"/g) ?? []).length, page).toBe(0);
        expect(tool.split(PUSH_SCRIPT).length - 1, page).toBe(state === 'all' ? 1 : 0);
        // F12, Mudança 10 (DECISOES § 413 and § 418): the box exists only with the unit id of its position (here the first
        // content ad and the rail, the two units of the area in SLOTS).
        expect((tool.match(/class="fo-ad fo-ad--/g) ?? []).length, page).toBe(state === 'all' ? 2 : 0);
      }
      for (const lang of ['en', 'pt', 'es'] as const) {
        for (const [name, View, props] of NO_ADS) {
          const html = await container.renderToString(View, { props: { lang, ...props } });
          expect(html.includes('google-adsense-account'), `${name} ${lang}`).toBe(state !== 'none');
          expect(html, `${name} ${lang}`).not.toContain('adsbygoogle.js');
          expect(html, `${name} ${lang}`).not.toContain('class="adsbygoogle"');
          expect(html, `${name} ${lang}`).not.toContain('class="fo-ad');
          expect(html, `${name} ${lang}`).not.toContain(PUSH_SCRIPT);
        }
        for (const [name, View, props] of GERAL) {
          const html = await container.renderToString(View, { props: { lang, ...props } });
          expect(html.includes('google-adsense-account'), `${name} ${lang}`).toBe(state !== 'none');
          expect(html.includes('adsbygoogle.js?client='), `${name} ${lang}`).toBe(state === 'all');
          expect((html.match(/class="fo-ad fo-ad--[^"]*" data-ad-area="geral"/g) ?? []).length, `${name} ${lang}`).toBe(state === 'all' ? 2 : 0);
          expect(html.split(PUSH_SCRIPT).length - 1, `${name} ${lang}`).toBe(state === 'all' ? 1 : 0);
        }
      }
    }, 60_000);
  }
});
