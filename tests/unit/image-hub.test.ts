import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import HomeView from '../../src/views/HomeView.astro';
import ImageToolsView from '../../src/views/ImageToolsView.astro';
import { routeById, type Lang } from '../../src/i18n/routes.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';

// The pages that list the image tools (home, footer, hub) are driven by the route map: a tool appears in a
// language only when its route has a path there, so Portuguese and Spanish show Compress image alone and
// never a link to a page that does not exist (DECISOES § 6).
let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});

const render = async (View: typeof HomeView | typeof ImageToolsView, lang: Lang) =>
  parse(await container.renderToString(View, { props: { lang } }));
const toolPaths = (lang: Lang) => IMAGE_TOOL_IDS.flatMap((id) => routeById(id).paths[lang] ?? []);

describe('home', () => {
  it('shows the eight image tools in English, in catalogue order, with a link to the hub under the grid', async () => {
    const page = await render(HomeView, 'en');
    expect(page.querySelectorAll('main .fo-grid a.fo-tool').map((card) => card.getAttribute('href'))).toEqual(toolPaths('en'));
    expect(toolPaths('en')).toHaveLength(8);
    expect(page.querySelectorAll('main .fo-tool h3')).toHaveLength(8);
    const more = page.querySelector('main .fo-more a');
    expect(more?.getAttribute('href')).toBe('/image-tools/');
    expect(more?.text).toBe('See all image tools and common sizes');
    // The presets are not tools: they are linked from the hub and their parent page, not from the home grid.
    for (const id of IMAGE_PRESET_IDS) expect(page.querySelector('main')?.querySelector(`a[href="${routeById(id).paths.en}"]`)).toBeNull();
  });

  it('keeps Portuguese and Spanish with Compress image only and no link to the hub', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const page = await render(HomeView, lang);
      expect(page.querySelectorAll('main .fo-grid a.fo-tool').map((card) => card.getAttribute('href')), lang).toEqual(toolPaths(lang));
      expect(toolPaths(lang), lang).toHaveLength(1);
      expect(page.querySelector('main .fo-more'), lang).toBeNull();
      expect(page.querySelectorAll('a').filter((link) => link.getAttribute('href')?.startsWith('/image-tools')), lang).toHaveLength(0);
    }
  });
});

describe('footer', () => {
  const imageColumn = (page: ReturnType<typeof parse>) => page.querySelectorAll('footer .fo-footer__cols > div:first-child li a');

  it('lists the hub first and then the eight tools in English', async () => {
    const links = imageColumn(await render(HomeView, 'en'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/image-tools/', ...toolPaths('en')]);
    expect(links.map((link) => link.text).slice(0, 3)).toEqual(['Image tools', 'Compress image', 'Resize image']);
  });

  it('lists only Compress image in Portuguese and Spanish, with no hub', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const links = imageColumn(await render(HomeView, lang));
      expect(links.map((link) => link.getAttribute('href')), lang).toEqual(toolPaths(lang));
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
    expect(page.querySelectorAll('.fo-ad--content')).toHaveLength(1);
    expect(page.querySelectorAll('.fo-ad--rail')).toHaveLength(1);
    expect(page.querySelector('main .fo-ad--rail')).toBeNull();
  });

  it('has the breadcrumb Home > Image tools, no hreflang and the CollectionPage with the eight tools', async () => {
    const page = await render(ImageToolsView, 'en');
    const crumbs = page.querySelectorAll('.fo-crumbs li');
    expect(crumbs.map((crumb) => crumb.text.trim())).toEqual(['Home', 'Image tools']);
    expect(crumbs[0]?.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(crumbs[1]?.querySelector('[aria-current="page"]')?.text).toBe('Image tools');
    expect(page.querySelectorAll('link[rel="alternate"][hreflang]')).toHaveLength(0);
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://fileorca.com/image-tools/');
    const graph = JSON.parse(page.querySelector('script[type="application/ld+json"]')?.text ?? '{}') as { '@graph': { '@type': string; mainEntity?: { itemListElement: unknown[] } }[] };
    const types = graph['@graph'].map((node) => node['@type']);
    expect(types).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage']);
    expect(graph['@graph'][2]?.mainEntity?.itemListElement).toHaveLength(8);
  });
});
