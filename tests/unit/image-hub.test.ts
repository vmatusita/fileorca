import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { parse } from 'node-html-parser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import HomeView from '../../src/views/HomeView.astro';
import ImageToolsView from '../../src/views/ImageToolsView.astro';
import { ROUTES, routeById, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';

// The pages that list the image tools (home, footer, hub) are driven by the route map: a tool appears in a
// language only when its route has a path there, and never with a link to a page that does not exist (DECISOES § 6).
// Before the F6, Portuguese and Spanish showed Compress image alone; since the F6 (decision 4) every image page and the
// hub exist in the three languages, so pt and es show what English shows, with the paths of their language.
let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});

afterEach(() => vi.unstubAllEnvs());

const render = async (View: typeof HomeView | typeof ImageToolsView, lang: Lang) =>
  parse(await container.renderToString(View, { props: { lang } }));
const toolPaths = (lang: Lang) => IMAGE_TOOL_IDS.flatMap((id) => routeById(id).paths[lang] ?? []);

describe('home', () => {
  // F13b (UX-03 B; DECISOES § 576): the home is the sea by category, and the image band (still labelled by "tools") shows
  // the eight tools as chips, with the link to the hub under them; the money band the 6 credit calculators of the
  // specification (§ 570). The rule is the same: the catalogue order, the hub, no preset, no AdSlot in the default build.
  it('shows the eight image tools in English, in catalogue order, with a link to the hub under the chips', async () => {
    const page = await render(HomeView, 'en');
    // The image band is the first one; the money band of the F4 comes after the PDF one (DECISOES § 118).
    const tools = page.querySelector('main section[aria-labelledby="tools"]');
    expect(tools?.querySelectorAll('.fo-catband__chips a.fo-chip').map((chip) => chip.getAttribute('href'))).toEqual(toolPaths('en'));
    expect(toolPaths('en')).toHaveLength(8);
    expect(tools?.querySelectorAll('.fo-chip > span:last-child')).toHaveLength(8);
    const more = tools?.querySelector('.fo-catband__links a');
    expect(more?.getAttribute('href')).toBe('/image-tools/');
    expect(more?.text).toBe('All image tools and common sizes');
    // The presets are not tools: they are linked from the hub and their parent page, not from the home grid.
    for (const id of IMAGE_PRESET_IDS) expect(page.querySelector('main')?.querySelector(`a[href="${routeById(id).paths.en}"]`)).toBeNull();
    // The money band: the five credit calculators and Credit card payoff, and the money hub, and no AdSlot on the home.
    const money = page.querySelector('main section[aria-labelledby="money-home"]');
    expect(money?.querySelectorAll('a.fo-chip').map((chip) => chip.getAttribute('href'))).toEqual([
      '/mortgage-calculator/', '/refinance-calculator/', '/auto-loan-calculator/', '/personal-loan-calculator/', '/home-affordability-calculator/', '/credit-card-payoff-calculator/',
    ]);
    expect(money?.querySelector('.fo-catband__links a')?.getAttribute('href')).toBe('/money-calculators/');
    expect(page.querySelectorAll('.fo-ad')).toHaveLength(0);
  });

  it('shows the eight image tools in Portuguese and Spanish too, with the link to the hub of the language, and links only to pages of the language', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const page = await render(HomeView, lang);
      const tools = page.querySelector('main section[aria-labelledby="tools"]');
      expect(tools?.querySelectorAll('.fo-catband__chips a.fo-chip').map((chip) => chip.getAttribute('href')), lang).toEqual(toolPaths(lang));
      expect(toolPaths(lang), lang).toHaveLength(IMAGE_TOOL_IDS.length);
      expect(tools?.querySelector('.fo-catband__links a')?.getAttribute('href'), lang).toBe(routeById('image-tools').paths[lang]);
      expect(tools?.querySelector('.fo-catband__links a')?.text, lang).toBe(TEXTS[lang].home.image.all);
      for (const id of IMAGE_PRESET_IDS) expect(page.querySelector('main')?.querySelector(`a[href="${routeById(id).paths[lang]}"]`), `${lang} ${id}`).toBeNull();
      // § 6: every link of the page (the language menu aside, which leads to the other languages) is a page of this language.
      const own = new Set(ROUTES.flatMap((route) => route.paths[lang] ?? []));
      const internal = page.querySelectorAll('a[href^="/"]:not([hreflang])').map((link) => (link.getAttribute('href') ?? '').split('#')[0] ?? '');
      expect(internal.length, lang).toBeGreaterThan(20);
      expect(internal.filter((href) => !own.has(href)), lang).toEqual([]);
      expect(page.querySelectorAll('a').filter((link) => link.getAttribute('href')?.startsWith('/image-tools')), lang).toHaveLength(0);
    }
  });
});

describe('footer', () => {
  // F13b (UX-17 A; DECISOES § I-5 and § I-8): the hub left the list; it is the main link of the column, and the eight
  // tools are in the disclosure of the column. The links of the column are the same, in the same order.
  const imageColumn = (page: ReturnType<typeof parse>) => page.querySelectorAll('footer .fo-footer__cols > div:first-child a');

  it('lists the hub first and then the eight tools in English', async () => {
    const page = await render(HomeView, 'en');
    const links = imageColumn(page);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/image-tools/', ...toolPaths('en')]);
    expect(links.map((link) => link.text).slice(0, 3)).toEqual(['Image tools', 'Compress image', 'Resize image']);
    // The hub in sight, the tools in the disclosure.
    expect(links[0]?.classList.contains('fo-footer__hub')).toBe(true);
    const tools = page.querySelectorAll('footer .fo-footer__cols > div:first-child details.fo-footer__tools li a');
    expect(tools.map((link) => link.getAttribute('href'))).toEqual(toolPaths('en'));
  });

  it('lists the hub first and then the eight tools in Portuguese and Spanish too (F6; only Compress image before)', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const links = imageColumn(await render(HomeView, lang));
      expect(links.map((link) => link.getAttribute('href')), lang).toEqual([routeById('image-tools').paths[lang], ...toolPaths(lang)]);
      expect(links.map((link) => link.text), lang).toEqual([TEXTS[lang].common.imageTools, ...IMAGE_TOOL_IDS.map((id) => TEXTS[lang].common.tools[id].name)]);
    }
  });
});

describe('hub /image-tools/', () => {
  it('has the band, the grid of the eight tools, the presets table and the two AdSlots', async () => {
    const page = await render(ImageToolsView, 'en');
    // The eyebrow names the category and the H1 says something of its own, as in the ToolCard preview (DECISOES § 96).
    expect(page.querySelectorAll('h1').map((h1) => h1.text)).toEqual(['Eight image tools, zero uploads']);
    const band = page.querySelector('main .fo-hubband.fo-cat--image');
    expect(band?.querySelector('.fo-eyebrow')?.text).toBe('Image tools');
    expect(band?.querySelector('.fo-eyebrow')?.text).not.toBe(band?.querySelector('h1')?.text);
    expect(band?.querySelector('h1')?.getAttribute('class')).toBe('fo-h1 fo-h1--display');
    expect(page.querySelectorAll('main .fo-grid a.fo-tool').map((card) => card.getAttribute('href'))).toEqual(toolPaths('en'));
    // Image to PDF wears the PDF colour, the others the image colour.
    expect(page.querySelectorAll('main .fo-grid a.fo-tool.fo-cat--pdf').map((card) => card.getAttribute('href'))).toEqual(['/image-to-pdf/']);
    const presets = page.querySelectorAll('main table.fo-table tbody a');
    expect(presets.map((link) => link.getAttribute('href'))).toEqual(IMAGE_PRESET_IDS.map((id) => routeById(id).paths.en));
    // F12, Mudança 10 (DECISOES § 413 and § 418): with no unit id, no box; with the three variables, the content box in
    // the main and the rail one outside it.
    expect(page.querySelectorAll('.fo-ad')).toHaveLength(0);
    vi.stubEnv('PUBLIC_ADSENSE_CLIENT', 'ca-pub-1234567890123456');
    vi.stubEnv('PUBLIC_ADSENSE_SLOTS', JSON.stringify({ arquivos: { conteudo: '1111111111', lateral: '2222222222' } }));
    vi.stubEnv('PUBLIC_ADS_ENABLED', 'true');
    const withAds = await render(ImageToolsView, 'en');
    expect(withAds.querySelectorAll('main .fo-ad--content')).toHaveLength(1);
    expect(withAds.querySelectorAll('.fo-ad--rail')).toHaveLength(1);
    expect(withAds.querySelector('main .fo-ad--rail')).toBeNull();
  });

  it('has the breadcrumb Home > Image tools, the hreflang cluster of the three languages and the CollectionPage with the eight tools', async () => {
    const page = await render(ImageToolsView, 'en');
    const crumbs = page.querySelectorAll('.fo-crumbs li');
    expect(crumbs.map((crumb) => crumb.text.trim())).toEqual(['Home', 'Image tools']);
    expect(crumbs[0]?.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(crumbs[1]?.querySelector('[aria-current="page"]')?.text).toBe('Image tools');
    // F6 (decision 4): the hub is translated, so it carries the reciprocal cluster with the x-default in English (it had no
    // hreflang while it existed in English only, DECISOES § 58).
    const O = 'https://fileorca.com';
    const hub = routeById('image-tools').paths;
    const cluster = [['en', `${O}${hub.en}`], ['pt-BR', `${O}${hub.pt}`], ['es', `${O}${hub.es}`], ['x-default', `${O}${hub.en}`]];
    expect(page.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')])).toEqual(cluster);
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://fileorca.com/image-tools/');
    const graph = JSON.parse(page.querySelector('script[type="application/ld+json"]')?.text ?? '{}') as { '@graph': { '@type': string; mainEntity?: { itemListElement: unknown[] } }[] };
    const types = graph['@graph'].map((node) => node['@type']);
    expect(types).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage']);
    expect(graph['@graph'][2]?.mainEntity?.itemListElement).toHaveLength(8);
    // The Portuguese and Spanish hubs carry the same cluster, their own canonical and the crumbs of their language.
    for (const lang of ['pt', 'es'] as const) {
      const translated = await render(ImageToolsView, lang);
      expect(translated.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]), lang).toEqual(cluster);
      expect(translated.querySelector('link[rel="canonical"]')?.getAttribute('href'), lang).toBe(`${O}${hub[lang]}`);
      expect(translated.querySelectorAll('.fo-crumbs li').map((crumb) => crumb.text.trim()), lang).toEqual([TEXTS[lang].common.breadcrumb.home, TEXTS[lang].common.imageTools]);
      expect(translated.querySelectorAll('main .fo-grid a.fo-tool').map((card) => card.getAttribute('href')), lang).toEqual(toolPaths(lang));
    }
  });
});
