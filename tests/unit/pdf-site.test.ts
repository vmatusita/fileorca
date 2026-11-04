import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import HomeView from '../../src/views/HomeView.astro';
import PdfToolsView from '../../src/views/PdfToolsView.astro';
import PdfToolPage from '../../src/tools/pdf/PdfToolPage.astro';
import Header from '../../src/components/Header.astro';
import { LANGS, LANG_TAG, QR_ID, moneyHubId, pagePath, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS, LIFE_HUB_IDS, LIFE_HUB_ROUTE } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { ogImagePath } from '../../src/seo/meta.ts';
import { sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { PDF_PAGE_IDS, isPdfPage, missingFromSitemap, requiredSchemaTypes, schemaProblems, titleProblem, type LdNode } from '../../scripts/lib/seo-pages.ts';

// The PDF pages in the places that list them (F5a, DECISOES § 160): the home, the footer, the page
// mold and the SEO checks. Every list is read from src/tools/pdf/registry.ts, so a tool declared there is covered the
// day it is declared. Before the F6, Portuguese and Spanish had no PDF page and showed none of it (DECISOES § 6); since
// the F6 (decision 4) the PDF hub and the 12 tools exist in the three languages, and each language links to its own pages.
const O = 'https://fileorca.com';
const hubPath = routeById(PDF_HUB_ID).paths['en'] ?? '';
const toolPath = (id: (typeof PDF_TOOL_IDS)[number]) => routeById(id).paths['en'] ?? '';
const hubPathIn = (lang: Lang) => routeById(PDF_HUB_ID).paths[lang] ?? '';
const toolPathIn = (id: (typeof PDF_TOOL_IDS)[number], lang: Lang) => routeById(id).paths[lang] ?? '';
/** The 14 English-only pages of the F7 (decision 1): the two hubs, the 11 home and health calculators and the QR code. */
const F7_PATHS = ([HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS, QR_ID] as RouteId[]).map((id) => routeById(id).paths.en ?? '');

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});

const render = async (View: typeof HomeView, lang: Lang) => parse(await container.renderToString(View, { props: { lang } }));

describe('home', () => {
  it('has a PDF section with the 12 tools in registry order and the link to the PDF hub, between the image and the money sections', async () => {
    const page = await render(HomeView, 'en');
    const section = page.querySelector('main section[aria-labelledby="pdf-home"]');
    expect(section?.querySelector('h2')?.text).toBe(TEXTS.en.home.pdf?.heading);
    expect(section?.querySelectorAll('a.fo-tool').map((card) => card.getAttribute('href'))).toEqual(PDF_TOOL_IDS.map(toolPath));
    expect(section?.querySelectorAll('a.fo-tool h3').map((name) => name.text)).toEqual(PDF_TOOL_IDS.map((id) => enCommon.pdf[id].name));
    // Every card is a PDF card (the coral category) and none has more than the registry gives.
    expect(section?.querySelectorAll('a.fo-tool.fo-cat--pdf')).toHaveLength(PDF_TOOL_IDS.length);
    const more = section?.querySelector('.fo-more a');
    expect(more?.getAttribute('href')).toBe(hubPath);
    expect(more?.text).toBe('See all PDF tools');
    // The order of the sections: the image tools, the PDF tools, the money calculators, then the privacy line.
    // F7 (decision 9; DECISOES § 259): in English, after the money section, the home and health sections and the QR code.
    // F11 (decision 7; DECISOES § 398 and § 400): the "Read a guide" section between the QR code and the privacy line.
    const order = page.querySelectorAll('main > section').map((node) => node.getAttribute('aria-labelledby'));
    expect(order).toEqual(['tools', 'pdf-home', 'money-home', 'house-home', 'health-home', 'qr-home', 'guides-home', 'privacy-home']);
    // The home still has no AdSlot, and the Oli is still next to the H1 (above the fold rule of the home).
    expect(page.querySelectorAll('.fo-ad')).toHaveLength(0);
    expect(page.querySelectorAll('main .fo-hero [data-oli="wave"]')).toHaveLength(1);
  });

  it('has, in English, the home and health sections with every calculator of each hub in hub order and its hub link, then the QR code (F7, decision 9)', async () => {
    const page = await render(HomeView, 'en');
    for (const hub of ['house', 'health'] as const) {
      const section = page.querySelector(`main section[aria-labelledby="${hub}-home"]`);
      const texts = hub === 'house' ? TEXTS.en.home.house : TEXTS.en.home.health;
      expect(section?.querySelector('h2')?.text, hub).toBe(texts?.heading);
      // Every calculator of the hub, in the order of the hub, with the violet of the category (fill only).
      expect(section?.querySelectorAll('a.fo-tool').map((card) => card.getAttribute('href')), hub).toEqual(LIFE_HUB_IDS[hub].map((id) => routeById(id).paths.en));
      expect(section?.querySelectorAll('a.fo-tool h3').map((name) => name.text), hub).toEqual(LIFE_HUB_IDS[hub].map((id) => enCommon.calcs[id].name));
      expect(section?.querySelectorAll('a.fo-tool.fo-cat--home'), hub).toHaveLength(LIFE_HUB_IDS[hub].length);
      expect(section?.querySelector('.fo-more a')?.getAttribute('href'), hub).toBe(routeById(LIFE_HUB_ROUTE[hub]).paths.en);
      expect(section?.querySelector('.fo-more a')?.text, hub).toBe(texts?.hubLink);
    }
    // The QR code generator has one card, in the lime of the utilities, and no hub link (it has no hub).
    const qr = page.querySelector('main section[aria-labelledby="qr-home"]');
    expect(qr?.querySelector('h2')?.text).toBe(TEXTS.en.home.qr?.heading);
    expect(qr?.querySelectorAll('a.fo-tool').map((card) => card.getAttribute('href'))).toEqual([routeById(QR_ID).paths.en]);
    expect(qr?.querySelectorAll('a.fo-tool.fo-cat--util')).toHaveLength(1);
    expect(qr?.querySelector('a.fo-tool h3')?.text).toBe(enCommon.qr.name);
    expect(qr?.querySelector('.fo-more')).toBeNull();
    // Still no AdSlot on the home.
    expect(page.querySelectorAll('.fo-ad')).toHaveLength(0);
  });

  it('has the PDF section in Portuguese and Spanish too, with the 12 tools and the hub of the language, and links to no English PDF page', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const page = await render(HomeView, lang);
      const section = page.querySelector('main section[aria-labelledby="pdf-home"]');
      expect(section?.querySelector('h2')?.text, lang).toBe(TEXTS[lang].home.pdf?.heading);
      expect(section?.querySelectorAll('a.fo-tool').map((card) => card.getAttribute('href')), lang).toEqual(PDF_TOOL_IDS.map((id) => toolPathIn(id, lang)));
      expect(section?.querySelectorAll('a.fo-tool h3').map((name) => name.text), lang).toEqual(PDF_TOOL_IDS.map((id) => TEXTS[lang].common.pdf[id].name));
      expect(section?.querySelectorAll('a.fo-tool.fo-cat--pdf'), lang).toHaveLength(PDF_TOOL_IDS.length);
      expect(section?.querySelector('.fo-more a')?.getAttribute('href'), lang).toBe(hubPathIn(lang));
      expect(section?.querySelector('.fo-more a')?.text, lang).toBe(TEXTS[lang].home.pdf?.hubLink);
      // The image tools, the PDF tools, the money section where the language has a money hub, the QR code generator (since
      // the languages adjustment, as in English), then the privacy line. F11: the guides between the QR code and the privacy.
      const order = page.querySelectorAll('main > section').map((node) => node.getAttribute('aria-labelledby'));
      expect(order, lang).toEqual(['tools', 'pdf-home', ...(pagePath(moneyHubId(lang), lang) ? ['money-home'] : []), 'qr-home', 'guides-home', 'privacy-home']);
      // § 6: the English PDF pages are never linked from a page in another language.
      const hrefs = page.querySelectorAll('a:not([hreflang])').map((link) => link.getAttribute('href') ?? '');
      for (const id of PDF_TOOL_IDS) expect(hrefs, `${lang} ${id}`).not.toContain(toolPath(id));
      expect(hrefs, lang).not.toContain(hubPath);
      expect(page.querySelectorAll('.fo-ad'), lang).toHaveLength(0);
      // F7 (decision 9): nothing of the English-only home, health and QR pages, which do not exist in this language.
      for (const path of F7_PATHS) expect(hrefs, `${lang} ${path}`).not.toContain(path);
    }
  });
});

describe('footer', () => {
  const column = (page: ReturnType<typeof parse>, title: string) =>
    page.querySelectorAll('footer .fo-footer__cols > div').find((div) => div.querySelector('h2')?.text === title);

  it('has a PDF column in English: the hub first, then the first six tools in hub order, only pages that exist', async () => {
    const page = await render(HomeView, 'en');
    const pdf = column(page, enCommon.footer.pdfColumn);
    const links = pdf?.querySelectorAll('li a') ?? [];
    expect(links.map((link) => link.getAttribute('href'))).toEqual([hubPath, ...PDF_TOOL_IDS.slice(0, 6).map(toolPath)]);
    expect(links.map((link) => link.text)).toEqual([enCommon.pdfTools, ...PDF_TOOL_IDS.slice(0, 6).map((id) => enCommon.pdf[id].name)]);
    // The columns, in the order of the site: image, PDF, money, FileOrca.
    // F7 (decision 9; DECISOES § 259): in English, the Home, Health and Utilities columns come before FileOrca.
    // F11 (decision 7; DECISOES § 396 and § 400): the Guides block sits under Utilities, in the same column.
    expect(page.querySelectorAll('footer .fo-footer__cols > div h2').map((h2) => h2.text)).toEqual(['Image', 'PDF', 'Money', 'Home', 'Health', 'Utilities', 'Guides', 'FileOrca']);
    expect(page.querySelectorAll('footer .fo-footer__cols > div')).toHaveLength(7);
  });

  it('has, in English, a Home and a Health column with the hub and every calculator of it, and a Utilities column with the QR code, so no F7 page is an orphan', async () => {
    const page = await render(HomeView, 'en');
    for (const [hub, title, name] of [['house', enCommon.footer.homeColumn, enCommon.homeCalculators], ['health', enCommon.footer.healthColumn, enCommon.healthCalculators]] as const) {
      const links = column(page, title)?.querySelectorAll('li a') ?? [];
      expect(links.map((link) => link.getAttribute('href')), hub).toEqual([routeById(LIFE_HUB_ROUTE[hub]).paths.en, ...LIFE_HUB_IDS[hub].map((id) => routeById(id).paths.en)]);
      expect(links.map((link) => link.text), hub).toEqual([name, ...LIFE_HUB_IDS[hub].map((id) => enCommon.calcs[id].name)]);
    }
    // The first list of the column is the utilities one (F11: the Guides block follows it in the same column).
    const utility = column(page, enCommon.footer.utilityColumn)?.querySelector('ul')?.querySelectorAll('li a') ?? [];
    expect(utility.map((link) => link.getAttribute('href'))).toEqual([routeById(QR_ID).paths.en]);
    expect(utility.map((link) => link.text)).toEqual([enCommon.qr.name]);
    // Every one of the 14 F7 pages is linked from the English footer.
    const hrefs = new Set(page.querySelectorAll('footer a').map((link) => link.getAttribute('href') ?? ''));
    for (const path of F7_PATHS) expect(hrefs.has(path), path).toBe(true);
  });

  it('has the PDF column in Portuguese and Spanish too: the hub of the language, then its first six tools (F6; no column before)', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const page = await render(HomeView, lang);
      const common = TEXTS[lang].common;
      const links = column(page, common.footer.pdfColumn)?.querySelectorAll('li a') ?? [];
      expect(links.map((link) => link.getAttribute('href')), lang).toEqual([hubPathIn(lang), ...PDF_TOOL_IDS.slice(0, 6).map((id) => toolPathIn(id, lang))]);
      expect(links.map((link) => link.text), lang).toEqual([common.pdfTools, ...PDF_TOOL_IDS.slice(0, 6).map((id) => common.pdf[id].name)]);
      // The columns in the order of the site: image, PDF, money (where the language has a money hub), the utilities with the
      // QR code generator of the language (since the languages adjustment), FileOrca.
      const titles = page.querySelectorAll('footer .fo-footer__cols > div h2').map((h2) => h2.text);
      // F11: and the Guides block under the utilities, in the same column (DECISOES § 400).
      expect(titles, lang).toEqual([common.footer.imageColumn, common.footer.pdfColumn, ...(pagePath(moneyHubId(lang), lang) ? [common.footer.moneyColumn] : []), common.footer.utilityColumn, common.guidesHub, common.footer.siteColumn]);
      const utility = column(page, common.footer.utilityColumn ?? '')?.querySelector('ul')?.querySelectorAll('li a') ?? [];
      expect(utility.map((link) => link.getAttribute('href')), lang).toEqual([routeById(QR_ID).paths[lang]]);
      expect(utility.map((link) => link.text), lang).toEqual([common.qr?.name]);
      // No footer link to an English PDF page.
      const english = new Set([hubPath, ...PDF_TOOL_IDS.map(toolPath)]);
      expect(page.querySelectorAll('footer a').filter((link) => english.has(link.getAttribute('href') ?? '')), lang).toHaveLength(0);
      // F7 (decision 9): the footer of pt and es does not change, and links to none of the English-only F7 pages.
      const f7 = new Set(F7_PATHS);
      expect(page.querySelectorAll('footer a').filter((link) => f7.has(link.getAttribute('href') ?? '')), lang).toHaveLength(0);
    }
  });
});

describe('the PDF pages in search engines (item 5: schema, Open Graph, sitemap, hreflang, language menu)', () => {
  const pages = [...PDF_TOOL_IDS.map((id) => ({ id, render: () => container.renderToString(PdfToolPage as Parameters<AstroContainer['renderToString']>[0], { props: { id } }) })),
    { id: PDF_HUB_ID, render: () => container.renderToString(PdfToolsView as Parameters<AstroContainer['renderToString']>[0], { props: { lang: 'en' } }) }];

  it('carries a WebApplication with no rating and a BreadcrumbList that ends at the page, the canonical and the Open Graph image', async () => {
    for (const { id, render: renderPage } of pages) {
      const root = parse(await renderPage());
      const canonical = `${O}${routeById(id as Parameters<typeof routeById>[0]).paths['en']}`;
      expect(root.querySelector('link[rel="canonical"]')?.getAttribute('href'), id).toBe(canonical);
      expect(root.querySelector('meta[property="og:image"]')?.getAttribute('content'), id).toBe(`${O}${ogImagePath(id as Parameters<typeof ogImagePath>[0], 'en')}`);
      const nodes: LdNode[] = [];
      let raw = '';
      for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
        raw += script.text;
        nodes.push(...((JSON.parse(script.text) as { '@graph': LdNode[] })['@graph']));
      }
      const types = new Set(nodes.map((node) => node['@type']));
      for (const type of requiredSchemaTypes(id)) expect(types, `${id} ${type}`).toContain(type);
      expect(raw, id).not.toMatch(/aggregateRating|"review"/);
      expect(schemaProblems(id, nodes, canonical), id).toEqual([]);
      const crumbs = (nodes.find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement ?? []).map((crumb) => crumb.item);
      expect(crumbs, id).toEqual(id === PDF_HUB_ID ? [`${O}/`, canonical] : [`${O}/`, `${O}${hubPath}`, canonical]);
      // The title starts with the H1, which is the name of the tool.
      const title = root.querySelector('title')?.text.trim() ?? '';
      expect(title.endsWith(' | FileOrca'), id).toBe(true);
      expect(titleProblem(id, title, root.querySelector('h1')?.text.trim() ?? ''), id).toBeNull();
    }
    // The WebApplication is named like the H1 of the tool and sits in the free multimedia category, like the image tools.
    const merge = await container.renderToString(PdfToolPage as Parameters<AstroContainer['renderToString']>[0], { props: { id: 'merge-pdf' } });
    const app = parse(merge).querySelectorAll('script[type="application/ld+json"]').map((script) => script.text).join('');
    expect(app).toContain(`"name":"${PDF_TOOL_TEXTS.en['merge-pdf'].h1}"`);
    expect(app).toContain('"isAccessibleForFree":true');
  }, 60_000);

  it('has the reciprocal hreflang cluster of the three languages with the x-default in English, and the language menu leads to the equivalent page (F6)', async () => {
    // Before the F6 the PDF pages were English only: no hreflang (DECISOES § 58), and the language menu led to the home of
    // the other languages (§ 84). Since the F6 (decisions 2 and 4) each one is a translation, in every language.
    for (const { id, render: renderPage } of pages) {
      const paths = routeById(id as Parameters<typeof routeById>[0]).paths;
      const cluster = [['en', `${O}${paths.en}`], ['pt-BR', `${O}${paths.pt}`], ['es', `${O}${paths.es}`], ['x-default', `${O}${paths.en}`]];
      const root = parse(await renderPage());
      expect(root.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]), id).toEqual(cluster);
      const menu = root.querySelectorAll('a[hreflang]').map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]);
      expect(menu, id).toEqual([['en', paths.en], ['pt-BR', paths.pt], ['es', paths.es]]);
    }
    // The pages in Portuguese and Spanish carry the same cluster and their own canonical.
    for (const lang of ['pt', 'es'] as const) {
      const merge = parse(await container.renderToString(PdfToolPage as Parameters<AstroContainer['renderToString']>[0], { props: { id: 'merge-pdf', lang } }));
      const hub = parse(await container.renderToString(PdfToolsView as Parameters<AstroContainer['renderToString']>[0], { props: { lang } }));
      for (const [id, root] of [['merge-pdf', merge], [PDF_HUB_ID, hub]] as const) {
        const paths = routeById(id).paths;
        expect(root.querySelector('link[rel="canonical"]')?.getAttribute('href'), `${id} ${lang}`).toBe(`${O}${paths[lang]}`);
        expect(root.querySelectorAll('link[rel="alternate"][hreflang]').map((link) => link.getAttribute('hreflang')), `${id} ${lang}`).toEqual(['en', 'pt-BR', 'es', 'x-default']);
        expect(root.querySelector('html')?.getAttribute('lang'), `${id} ${lang}`).toBe(LANG_TAG[lang]);
      }
    }
  }, 60_000);

  it('keeps § 84 for what stays English only: the language menu of a home or health page leads to the home of the other languages', async () => {
    // The example of § 84 moved from the PDF pages (translated in the F6) to a PDF file guide, and from the file guides
    // (translated in the languages adjustment) to a page of home and health, which stays English only (F7, decision 1).
    const english = routeById(LIFE_CALC_IDS[0] ?? 'bmi-calculator');
    const header = async (route: typeof english) => parse(await container.renderToString(Header as Parameters<AstroContainer['renderToString']>[0], { props: { lang: 'en', route, t: TEXTS.en.common } }));
    const menuOf = async (route: typeof english) => (await header(route)).querySelectorAll('a[hreflang]').map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]);
    expect(await menuOf(english)).toEqual([['en', english.paths.en], ['pt-BR', '/pt/'], ['es', '/es/']]);
    // A PDF file guide now leads to the same guide in each language.
    const guide = routeById(FILE_GUIDE_IDS.find((id) => FILE_GUIDES[id].hub === 'pdf-tools') ?? 'guides-split-pdf-file-size');
    expect(await menuOf(guide)).toEqual([['en', guide.paths.en], ['pt-BR', guide.paths.pt], ['es', guide.paths.es]]);
  });

  it('is in the sitemap of each of its languages, with the path of that language (F6; English only before)', () => {
    for (const lang of LANGS) {
      const urls = PDF_PAGE_IDS.map((id) => `${O}${routeById(id as Parameters<typeof routeById>[0]).paths[lang]}`);
      expect(urls, lang).toHaveLength(PDF_TOOL_IDS.length + 1);
      expect(missingFromSitemap(sitemapXml(lang), urls), lang).toEqual([]);
      // And never in the sitemap of another language.
      for (const other of LANGS.filter((candidate) => candidate !== lang)) expect(sitemapUrls(other).filter((url) => urls.includes(url)), `${lang} in ${other}`).toEqual([]);
    }
  });
});

describe('the SEO checks that know the PDF pages (scripts/lib/seo-pages.ts)', () => {
  it('lists the hub and the 12 tools, and tells a tool from the hub', () => {
    expect(PDF_PAGE_IDS).toEqual([PDF_HUB_ID, ...PDF_TOOL_IDS]);
    for (const id of PDF_TOOL_IDS) expect(isPdfPage(id), id).toBe(true);
    for (const id of [PDF_HUB_ID, 'image-to-pdf', 'privacy', 'toString']) expect(isPdfPage(id), id).toBe(false);
  });

  it('asks each tool a WebApplication and a BreadcrumbList, and the hub a CollectionPage and a BreadcrumbList', () => {
    for (const id of PDF_TOOL_IDS) expect(requiredSchemaTypes(id), id).toEqual(['Organization', 'BreadcrumbList', 'WebApplication']);
    expect(requiredSchemaTypes(PDF_HUB_ID)).toEqual(['Organization', 'BreadcrumbList', 'CollectionPage']);
    // The image pages keep what they had, and Image to PDF is an image page, not a PDF one.
    expect(requiredSchemaTypes('image-to-pdf')).toEqual(['Organization', 'BreadcrumbList', 'WebApplication']);
  });

  it('wants the title of a PDF tool to start with its name, and flags a canonical it does not match', () => {
    for (const id of PDF_TOOL_IDS) {
      const name = PDF_TOOL_TEXTS.en[id].h1;
      expect(titleProblem(id, `${name}: online and free | FileOrca`, name), id).toBeNull();
      expect(titleProblem(id, 'Free PDF tools | FileOrca', name), id).toMatch(/não começa pelo nome da ferramenta/);
      expect(titleProblem(id, `${name} | FileOrca`, ''), id).toMatch(/não começa/);
    }
    const page = `${O}/merge-pdf/`;
    const crumbs: LdNode = { '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }, { position: 2, item: `${O}/pdf-tools/` }, { position: 3, item: page }] };
    expect(schemaProblems('merge-pdf', [crumbs, { '@type': 'WebApplication', url: page }], page)).toEqual([]);
    expect(schemaProblems('merge-pdf', [crumbs, { '@type': 'WebApplication', url: `${O}/split-pdf/` }], page).join()).toMatch(/WebApplication aponta .*split-pdf/);
    expect(schemaProblems('merge-pdf', [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }] }], page).join()).toMatch(/BreadcrumbList termina em/);
    // The hub has no WebApplication to check, only its breadcrumb.
    expect(schemaProblems(PDF_HUB_ID, [{ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${O}/` }, { position: 2, item: `${O}/pdf-tools/` }] }], `${O}/pdf-tools/`)).toEqual([]);
  });

  it('declares every tool with a path of its own that the route map has', () => {
    for (const id of PDF_TOOL_IDS) expect(PDF_PAGES[id].path).toBe(toolPath(id));
  });
});

describe('Privacy, Terms and About in the three languages (decision 10)', () => {
  const text = (page: 'privacy' | 'terms', lang: Lang) =>
    TEXTS[lang][page].sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.list ?? [])]).join('\n');

  it('Privacy says the PDF is read and written on the device by PDF.js and qpdf, that the password never leaves it and is not kept, and that the signature is stored nowhere', () => {
    const want: Record<Lang, RegExp[]> = {
      en: [/read and written on your device, by PDF\.js and qpdf/, /password you type in Protect PDF or Unlock PDF never leaves your device and is not kept/, /signature you draw, upload or type in Sign PDF is not stored anywhere/],
      pt: [/lido e gravado no seu aparelho, pelo PDF\.js e pelo qpdf/, /senha que você digita ao proteger ou desbloquear um PDF não sai do seu aparelho e não fica guardada/, /assinatura que você desenha, envia ou digita ao assinar um PDF também não fica guardada em lugar nenhum/],
      // F6: the Spanish wording follows docs/i18n/es.md ("subir" is only what the site never does; "ningún lugar", not "ningún sitio").
      es: [/se lee y se escribe en tu dispositivo, con PDF\.js y qpdf/, /contraseña que escribes al proteger o desbloquear un PDF no sale de tu dispositivo y no se guarda/, /firma que dibujas, tomas de una imagen o escribes al firmar un PDF tampoco se guarda en ningún lugar/],
    };
    for (const lang of LANGS) for (const pattern of want[lang]) expect(text('privacy', lang), `${lang} ${pattern}`).toMatch(pattern);
  });

  it('Terms say what Protect, Unlock and Sign are, and are not', () => {
    const want: Record<Lang, RegExp[]> = {
      en: [
        /Protect PDF locks a PDF with the password you choose[^\n]*never receives it and cannot recover it/,
        /Unlock PDF is for files you have the right to open and to change[^\n]*never guesses or breaks a password[^\n]*asks you for it/,
        /Sign PDF puts an image of your signature[^\n]*not a digital signature with a certificate[^\n]*gives no legal advice/,
      ],
      // F6 (decision 4): the tools have their names of the language now (docs/i18n), so Terms names them so.
      pt: [
        /Proteger PDF tranca um PDF com a senha que você escolhe[^\n]*nunca a recebe e não consegue recuperá-la/,
        /Desbloquear PDF serve para arquivos que você tem o direito de abrir e de alterar[^\n]*nunca adivinha nem quebra uma senha[^\n]*pede a senha a você/,
        /Assinar PDF põe nas páginas que você escolher uma imagem da sua assinatura[^\n]*não uma assinatura digital com certificado[^\n]*não dá conselho jurídico/,
      ],
      es: [
        /Proteger PDF bloquea un PDF con la contraseña que tú eliges[^\n]*nunca la recibe y no puede recuperarla/,
        /Desbloquear PDF sirve para archivos que tienes derecho a abrir y a modificar[^\n]*Nunca adivina ni rompe una contraseña[^\n]*te la pide a ti/,
        /Firmar PDF pone en las páginas que elijas una imagen de tu firma[^\n]*no una firma digital con certificado[^\n]*no da asesoramiento legal/,
      ],
    };
    for (const lang of LANGS) for (const pattern of want[lang]) expect(text('terms', lang), `${lang} ${pattern}`).toMatch(pattern);
  });

  it('Terms list the PDF tools among what the site has, and About counts them', () => {
    expect(TEXTS.en.terms.sections.flatMap((section) => section.paragraphs).join(' ')).toMatch(/PDF tools \(merge, split, compress, rotate, number, sign, protect and more\)/);
    expect(TEXTS.pt.terms.sections.flatMap((section) => section.paragraphs).join(' ')).toMatch(/ferramentas de PDF, como juntar, dividir, comprimir, numerar, assinar e proteger/);
    expect(TEXTS.es.terms.sections.flatMap((section) => section.paragraphs).join(' ')).toMatch(/herramientas de PDF, como unir, dividir, comprimir, numerar, firmar y proteger/);
    expect(TEXTS.en.about.intro.join(' ')).toContain(`${PDF_TOOL_IDS.length} PDF tools`);
    expect(TEXTS.pt.about.intro.join(' ')).toContain('as de PDF');
    expect(TEXTS.es.about.intro.join(' ')).toContain('las de PDF');
  });

  it('Privacy counts PDF batches in the coffee line, as the PDF panel does', () => {
    expect(text('privacy', 'en')).toMatch(/how many image or PDF batches ended with at least one real result/);
  });
});
