import { describe, expect, it } from 'vitest';
import {
  BR_PAGE_IDS,
  FILE_GUIDE_PAGE_IDS,
  HUB_ID,
  IMAGE_PAGE_IDS,
  LIFE_PAGE_IDS,
  MONEY_PAGE_IDS,
  PDF_PAGE_IDS,
  TRANSLATED_DESCRIPTION_RANGE,
  descriptionProblem,
  fileGuideTitleProblems,
  isImagePage,
  missingFromSitemap,
  requiredSchemaTypes,
  schemaProblems,
  titleProblem,
  type LdNode,
} from '../../scripts/lib/seo-pages.ts';
import { BR_CALC_IDS, BR_HUB_ID, HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS } from '../../src/tools/calc/registry.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { ROUTES, routeById } from '../../src/i18n/routes.ts';
import { sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';

// The SEO checks that depend on what a page is (scripts/lib/seo-pages.ts, used by gate:seo): they read the
// ids of the image registry, so a tool or preset declared there is covered without touching the gate.

const O = 'https://fileorca.com';

describe('the pages the SEO gate treats as image tools', () => {
  it('are the eight tools and the presets of the registry, each with a route', () => {
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
      expect(listed, `${lang} lists no English URL of an image page`).toEqual([]);
      // F6 (decision 4): they list the same pages at the paths of their language (none of them but Compress image before).
      const own = [...IMAGE_PAGE_IDS, HUB_ID].map((id) => `${O}${ROUTES.find((route) => route.id === id)?.paths[lang] ?? ''}`);
      expect(missingFromSitemap(sitemapXml(lang), own), lang).toEqual([]);
    }
  });
});

describe('the description length and the Brazilian pages (F6)', () => {
  const text = (length: number): string => 'a'.repeat(length);

  it('keeps 50 to 170 characters for every English page and for the pages that are not image or PDF ones', () => {
    for (const id of ['compress-image', 'image-tools', 'merge-pdf', 'pdf-tools', 'mortgage-calculator', 'about']) {
      expect(descriptionProblem(id, 'en', text(50)), id).toBeNull();
      expect(descriptionProblem(id, 'en', text(170)), id).toBeNull();
      expect(descriptionProblem(id, 'en', text(49)), id).toBe('descrição com 49 caracteres');
      expect(descriptionProblem(id, 'en', text(171)), id).toBe('descrição com 171 caracteres');
    }
    // The Spanish calculators and the institutional pages keep the old range too.
    expect(descriptionProblem('mortgage-calculator', 'es', text(60))).toBeNull();
    expect(descriptionProblem('about', 'pt', text(60))).toBeNull();
  });

  it('asks 120 to 160 characters of the image and PDF pages in Portuguese and Spanish (decision 4)', () => {
    for (const lang of ['pt', 'es'] as const) {
      for (const id of [...IMAGE_PAGE_IDS, HUB_ID, ...PDF_PAGE_IDS]) {
        expect(descriptionProblem(id, lang, text(120)), `${lang} ${id}`).toBeNull();
        expect(descriptionProblem(id, lang, text(160)), `${lang} ${id}`).toBeNull();
        expect(descriptionProblem(id, lang, text(119)), `${lang} ${id}`).toMatch(/descrição com 119 caracteres \(pede de 120 a 160/);
        expect(descriptionProblem(id, lang, text(161)), `${lang} ${id}`).toMatch(/descrição com 161 caracteres/);
      }
    }
    expect(TRANSLATED_DESCRIPTION_RANGE).toEqual({ min: 120, max: 160 });
  });

  it('treats the Brazilian calculators and hub as money pages, and keeps them out of the English list', () => {
    expect(BR_PAGE_IDS).toEqual([BR_HUB_ID, ...BR_CALC_IDS]);
    for (const id of BR_PAGE_IDS) expect(MONEY_PAGE_IDS, id).not.toContain(id);
    for (const id of BR_CALC_IDS) {
      expect(requiredSchemaTypes(id), id).toEqual(['Organization', 'BreadcrumbList', 'WebApplication', 'Person']);
      expect(titleProblem(id, 'Simulador SAC × PRICE: compare os dois sistemas | FileOrca', 'Simulador SAC × PRICE'), id).toBeNull();
      expect(titleProblem(id, 'Compare os sistemas | FileOrca', 'Simulador SAC × PRICE'), id).toMatch(/nome da calculadora/);
      const canonical = `${O}/pt/simulador-sac-price/`;
      expect(schemaProblems(id, [{ '@type': 'WebApplication', url: `${O}/pt/` }], canonical).join(), id).toMatch(/WebApplication aponta/);
    }
    expect(requiredSchemaTypes(BR_HUB_ID)).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage', 'Person']);
    expect(schemaProblems(BR_HUB_ID, [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/pt/` }] }], `${O}/pt/calculadoras-financeiras/`).join()).toMatch(/termina em/);
  });
});

describe('the home and health pages of the F7', () => {
  it('asks each calculator for its WebApplication and author, and each hub for its CollectionPage', () => {
    expect(LIFE_PAGE_IDS).toEqual([HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS]);
    expect(LIFE_PAGE_IDS).toHaveLength(2 + 11);
    for (const id of LIFE_CALC_IDS) expect(requiredSchemaTypes(id), id).toEqual(['Organization', 'BreadcrumbList', 'WebApplication', 'Person']);
    for (const id of [HOUSE_HUB_ID, HEALTH_HUB_ID]) expect(requiredSchemaTypes(id), id).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage', 'Person']);
  });

  it('wants the title to start with the calculator name, and checks the breadcrumb and the WebApplication against the canonical', () => {
    expect(titleProblem('bmi-calculator', 'BMI Calculator for Adults, in US or Metric Units | FileOrca', 'BMI calculator')).toBeNull();
    expect(titleProblem('bmi-calculator', 'Body Mass Index for Adults | FileOrca', 'BMI calculator')).toMatch(/nome da calculadora/);
    const canonical = `${O}/due-date-calculator/`;
    expect(schemaProblems('due-date-calculator', [{ '@type': 'WebApplication', url: canonical }], canonical)).toEqual([]);
    expect(schemaProblems('due-date-calculator', [{ '@type': 'WebApplication', url: `${O}/` }], canonical).join()).toMatch(/WebApplication aponta/);
    expect(schemaProblems(HEALTH_HUB_ID, [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }] }], `${O}/health-calculators/`).join()).toMatch(/termina em/);
  });
});

describe('the money pages of the F4', () => {
  it('asks each kind of money page for its schema types', () => {
    expect(MONEY_PAGE_IDS).toHaveLength(1 + 18 + 5);
    expect(requiredSchemaTypes('mortgage-calculator')).toEqual(['Organization', 'BreadcrumbList', 'WebApplication', 'Person']);
    expect(requiredSchemaTypes('mortgage-calculator-15-vs-30-year')).toEqual(['Organization', 'BreadcrumbList', 'WebApplication', 'Person']);
    expect(requiredSchemaTypes('money-calculators')).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage', 'Person']);
    expect(requiredSchemaTypes('guides-refinance-break-even')).toEqual(['Organization', 'BreadcrumbList', 'Article', 'Person']);
  });

  it('wants a calculator title to start with its name, in any case', () => {
    expect(titleProblem('mortgage-calculator-extra-payments', 'Mortgage Calculator with Extra Payments | FileOrca', 'Mortgage calculator with extra payments')).toBeNull();
    expect(titleProblem('mortgage-calculator', 'Monthly Payment Calculator | FileOrca', 'Mortgage calculator')).toMatch(/nome da calculadora/);
    expect(titleProblem('mortgage-calculator', 'Mortgage Calculator | FileOrca', '')).toMatch(/nome da calculadora/);
    // The image pages keep the exact comparison of the F2.
    expect(titleProblem('compress-image', 'compress image | FileOrca', 'Compress image')).toMatch(/nome da ferramenta/);
  });

  it('checks the breadcrumb and the WebApplication of a calculator against its canonical', () => {
    const canonical = `${O}/mortgage-calculator/`;
    const good: LdNode[] = [
      { '@type': 'WebApplication', url: canonical },
      { '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }, { position: 2, item: `${O}/money-calculators/` }, { position: 3, item: canonical }] },
    ];
    expect(schemaProblems('mortgage-calculator', good, canonical)).toEqual([]);
    expect(schemaProblems('mortgage-calculator', [{ '@type': 'WebApplication', url: `${O}/` }], canonical).join()).toMatch(/WebApplication aponta/);
    const guide = `${O}/guides/rent-vs-buy-break-even/`;
    expect(schemaProblems('guides-rent-vs-buy-break-even', [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }] }], guide).join()).toMatch(/termina em/);
  });
});

describe('the file guides of the F5b (DECISOES § 187)', () => {
  it('ask for an Article by the author, with a BreadcrumbList that ends at the guide', () => {
    for (const id of FILE_GUIDE_PAGE_IDS) expect(requiredSchemaTypes(id), id).toEqual(['Organization', 'BreadcrumbList', 'Article', 'Person']);
    const guide = `${O}/guides/jpg-vs-png/`;
    expect(schemaProblems('guides-jpg-vs-png', [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }, { position: 2, item: guide }] }], guide)).toEqual([]);
    expect(schemaProblems('guides-jpg-vs-png', [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }] }], guide).join()).toMatch(/termina em/);
  });

  it('start the title with the name of the guide, with no year, and never with the H1 of the tool they embed', () => {
    const name = 'How to convert HEIC to JPG on Windows';
    expect(fileGuideTitleProblems(name, 'How to Convert HEIC to JPG on Windows, Photo by Photo | FileOrca', name, 'HEIC to JPG')).toEqual([]);
    expect(fileGuideTitleProblems(name, 'Convert HEIC to JPG on Windows | FileOrca', name, 'HEIC to JPG').join()).toMatch(/não começa pelo nome do guia/);
    expect(fileGuideTitleProblems(name, 'How to Convert HEIC to JPG on Windows in 2026 | FileOrca', name, 'HEIC to JPG').join()).toMatch(/título com ano/);
    expect(fileGuideTitleProblems(name, 'How to Convert HEIC to JPG on Windows | FileOrca', `${name} (2026)`, 'HEIC to JPG').join()).toMatch(/H1 com ano/);
    expect(fileGuideTitleProblems('HEIC to JPG on Windows', 'HEIC to JPG on Windows | FileOrca', 'HEIC to JPG on Windows', 'HEIC to JPG').join()).toMatch(/começa pelo H1 da ferramenta/);
  });
});
