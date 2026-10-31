import { describe, expect, it } from 'vitest';
import { HUB_ID, IMAGE_PAGE_IDS, isImagePage, missingFromSitemap, requiredSchemaTypes, schemaProblems, titleProblem, type LdNode } from '../../scripts/lib/seo-pages.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { ROUTES, routeById } from '../../src/i18n/routes.ts';
import { sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';

// The SEO checks that depend on what a page is (scripts/lib/seo-pages.ts, used by gate:seo): they read the
// ids of the image registry, so a tool or preset declared there is covered without touching the gate.

const O = 'https://fileorca.com';

describe('the pages the SEO gate treats as image tools', () => {
  it('are the ten tools and the presets of the registry, each with a route', () => {
    expect(IMAGE_PAGE_IDS).toEqual([...IMAGE_TOOL_IDS, ...IMAGE_PRESET_IDS]);
    expect(IMAGE_PAGE_IDS).toHaveLength(Object.keys(IMAGE_PAGES).length);
    for (const id of IMAGE_PAGE_IDS) {
      expect(isImagePage(id), id).toBe(true);
      expect(routeById(id as Parameters<typeof routeById>[0]).paths['en'], `${id} has an English page`).toBeTruthy();
    }
    expect(isImagePage(HUB_ID)).toBe(false);
    expect(isImagePage('privacy')).toBe(false);
    expect(isImagePage('toString')).toBe(false);
  });
});

describe('required schema types', () => {
  it('asks a WebApplication and a BreadcrumbList of every tool and preset', () => {
    for (const id of IMAGE_PAGE_IDS) expect(requiredSchemaTypes(id), id).toEqual(['Organization', 'BreadcrumbList', 'WebApplication']);
  });

  it('asks the hub a BreadcrumbList and no WebApplication, and keeps the other pages as they were', () => {
    expect(requiredSchemaTypes(HUB_ID)).toEqual(['Organization', 'BreadcrumbList']);
    expect(requiredSchemaTypes('home')).toEqual(['Organization', 'WebSite']);
    expect(requiredSchemaTypes('about')).toEqual(['Organization', 'BreadcrumbList', 'Person', 'AboutPage']);
    expect(requiredSchemaTypes('privacy')).toEqual(['Organization']);
  });
});

describe('title against the H1', () => {
  it('accepts a title that starts with the name of the tool', () => {
    expect(titleProblem('resize-image', 'Resize image online, free | FileOrca', 'Resize image')).toBeNull();
    expect(titleProblem('compress-image-to-100kb', 'Compress image to 100 KB: under 100,000 bytes | FileOrca', 'Compress image to 100 KB')).toBeNull();
  });

  it('flags a title that does not, and an empty H1, on every tool and preset', () => {
    for (const id of IMAGE_PAGE_IDS) {
      expect(titleProblem(id, 'Shrink your pictures | FileOrca', 'Resize image'), id).toMatch(/não começa pelo nome da ferramenta \(Resize image\)/);
      expect(titleProblem(id, 'Anything | FileOrca', ''), id).toMatch(/não começa/);
    }
  });

  it('leaves the other pages alone', () => {
    expect(titleProblem(HUB_ID, 'Free image tools | FileOrca', 'Image tools')).toBeNull();
    expect(titleProblem('privacy', 'Privacy | FileOrca', 'Something else')).toBeNull();
  });
});

describe('schema nodes point at the page', () => {
  const crumbs = (...items: string[]): LdNode => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ position: index + 1, item })),
  });
  const page = `${O}/heic-to-jpg/`;
  const good: LdNode[] = [{ '@type': 'Organization' }, crumbs(`${O}/`, `${O}/image-tools/`, page), { '@type': 'WebApplication', url: page }];

  it('accepts a tool whose WebApplication and breadcrumb end at its canonical', () => {
    expect(schemaProblems('heic-to-jpg', good, page)).toEqual([]);
    expect(schemaProblems(HUB_ID, [crumbs(`${O}/`, `${O}/image-tools/`)], `${O}/image-tools/`)).toEqual([]);
  });

  it('flags a WebApplication of another page, a breadcrumb that ends elsewhere and positions out of order', () => {
    const other = [good[0] as LdNode, good[1] as LdNode, { '@type': 'WebApplication', url: `${O}/png-to-jpg/` }];
    expect(schemaProblems('heic-to-jpg', other, page).join()).toMatch(/WebApplication aponta .*png-to-jpg/);
    expect(schemaProblems('heic-to-jpg', [crumbs(`${O}/`, `${O}/image-tools/`), good[2] as LdNode], page).join()).toMatch(/BreadcrumbList termina em .*image-tools/);
    const shuffled: LdNode = { '@type': 'BreadcrumbList', itemListElement: [{ position: 2, item: `${O}/` }, { position: 1, item: page }] };
    expect(schemaProblems('heic-to-jpg', [shuffled, good[2] as LdNode], page).join()).toMatch(/fora de ordem/);
  });

  it('does not ask the hub for a WebApplication, and ignores the pages it does not know', () => {
    expect(schemaProblems(HUB_ID, [], `${O}/image-tools/`)).toEqual([]);
    expect(schemaProblems('privacy', [], `${O}/privacy/`)).toEqual([]);
    expect(schemaProblems('privacy', [crumbs(`${O}/`)], `${O}/privacy/`)).toEqual([]);
  });
});

describe('the English sitemap', () => {
  it('lists the URLs given and names the ones it does not', () => {
    const xml = '<urlset><url><loc>https://fileorca.com/a/</loc></url><url><loc>https://fileorca.com/b/</loc></url></urlset>';
    expect(missingFromSitemap(xml, [`${O}/a/`, `${O}/b/`])).toEqual([]);
    expect(missingFromSitemap(xml, [`${O}/a/`, `${O}/c/`, `${O}/d/`])).toEqual([`${O}/c/`, `${O}/d/`]);
  });

  it('has every image tool, preset and the hub, and the pt and es sitemaps list none of those English URLs', () => {
    const urls = [...IMAGE_PAGE_IDS, HUB_ID].map((id) => `${O}${ROUTES.find((route) => route.id === id)?.paths['en'] ?? ''}`);
    expect(urls.every((url) => url.length > O.length + 1)).toBe(true);
    expect(missingFromSitemap(sitemapXml('en'), urls)).toEqual([]);
    for (const lang of ['pt', 'es'] as const) {
      const listed = sitemapUrls(lang).filter((url) => urls.includes(url));
      expect(listed, `${lang} lists no English-only image page`).toEqual([]);
    }
  });
});
