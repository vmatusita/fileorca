import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import HomeView from '../../src/views/HomeView.astro';
import PdfToolsView from '../../src/views/PdfToolsView.astro';
import PdfToolPage from '../../src/tools/pdf/PdfToolPage.astro';
import { LANGS, routeById, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { ogImagePath } from '../../src/seo/meta.ts';
import { sitemapUrls, sitemapXml } from '../../src/seo/sitemap.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import { PDF_PAGE_IDS, isPdfPage, missingFromSitemap, requiredSchemaTypes, schemaProblems, titleProblem, type LdNode } from '../../scripts/lib/seo-pages.ts';

// The PDF pages in the places that list them (F5a, DECISOES § F5a-home-footer-search): the home, the footer, the page
// mold and the SEO checks. Every list is read from src/tools/pdf/registry.ts, so a tool declared there is covered the
// day it is declared; Portuguese and Spanish have no PDF page and show none of it (DECISOES § 6).
const O = 'https://fileorca.com';
const hubPath = routeById(PDF_HUB_ID).paths['en'] ?? '';
const toolPath = (id: (typeof PDF_TOOL_IDS)[number]) => routeById(id).paths['en'] ?? '';

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
    const order = page.querySelectorAll('main > section').map((node) => node.getAttribute('aria-labelledby'));
    expect(order).toEqual(['tools', 'pdf-home', 'money-home', 'privacy-home']);
    // The home still has no AdSlot, and the Oli is still next to the H1 (above the fold rule of the home).
    expect(page.querySelectorAll('.fo-ad')).toHaveLength(0);
    expect(page.querySelectorAll('main .fo-hero [data-oli="wave"]')).toHaveLength(1);
  });

  it('shows no PDF section in Portuguese and Spanish, and links to no PDF page', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const page = await render(HomeView, lang);
      expect(page.querySelector('#pdf-home'), lang).toBeNull();
      const hrefs = page.querySelectorAll('a').map((link) => link.getAttribute('href') ?? '');
      for (const id of PDF_TOOL_IDS) expect(hrefs, `${lang} ${id}`).not.toContain(toolPath(id));
      expect(hrefs, lang).not.toContain(hubPath);
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
    expect(page.querySelectorAll('footer .fo-footer__cols > div h2').map((h2) => h2.text)).toEqual(['Image', 'PDF', 'Money', 'FileOrca']);
  });

  it('has no PDF column in Portuguese and Spanish', async () => {
    for (const lang of ['pt', 'es'] as const) {
      const page = await render(HomeView, lang);
      const titles = page.querySelectorAll('footer .fo-footer__cols > div h2').map((h2) => h2.text);
      expect(titles, lang).not.toContain('PDF');
      expect(page.querySelectorAll('footer a').filter((link) => (link.getAttribute('href') ?? '').includes('pdf')), lang).toHaveLength(0);
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
    expect(app).toContain(`"name":"${PDF_TOOL_TEXTS['merge-pdf'].h1}"`);
    expect(app).toContain('"isAccessibleForFree":true');
  }, 60_000);

  it('is English only: no hreflang cluster (DECISOES § 58), and the language menu leads to the home of the other languages (§ 84)', async () => {
    for (const { id, render: renderPage } of pages) {
      const root = parse(await renderPage());
      expect(root.querySelectorAll('link[rel="alternate"][hreflang]'), id).toHaveLength(0);
      const menu = root.querySelectorAll('a[hreflang]').map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]);
      const own = routeById(id as Parameters<typeof routeById>[0]).paths['en'];
      expect(menu, id).toEqual([['en', own], ['pt-BR', '/pt/'], ['es', '/es/']]);
    }
  }, 60_000);

  it('is in the English sitemap and in no other', () => {
    const urls = PDF_PAGE_IDS.map((id) => `${O}${routeById(id as Parameters<typeof routeById>[0]).paths['en']}`);
    expect(urls).toHaveLength(PDF_TOOL_IDS.length + 1);
    expect(missingFromSitemap(sitemapXml('en'), urls)).toEqual([]);
    for (const lang of LANGS.filter((candidate) => candidate !== 'en')) {
      expect(sitemapUrls(lang).filter((url) => urls.includes(url)), lang).toEqual([]);
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
      const name = PDF_TOOL_TEXTS[id].h1;
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
      es: [/se lee y se escribe en tu dispositivo, con PDF\.js y qpdf/, /contraseña que escribes al proteger o desbloquear un PDF no sale de tu dispositivo y no se guarda/, /firma que dibujas, subes o escribes al firmar un PDF tampoco se guarda en ningún sitio/],
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
      pt: [
        /Protect PDF tranca um PDF com a senha que você escolhe[^\n]*nunca a recebe e não consegue recuperá-la/,
        /Unlock PDF serve para arquivos que você tem o direito de abrir e de alterar[^\n]*nunca adivinha nem quebra uma senha[^\n]*pede a senha a você/,
        /Sign PDF põe nas páginas que você escolher uma imagem da sua assinatura[^\n]*não uma assinatura digital com certificado[^\n]*não dá conselho jurídico/,
      ],
      es: [
        /Protect PDF cierra un PDF con la contraseña que tú eliges[^\n]*nunca la recibe y no puede recuperarla/,
        /Unlock PDF sirve para archivos que tienes derecho a abrir y a modificar[^\n]*Nunca adivina ni rompe una contraseña[^\n]*te la pide a ti/,
        /Sign PDF pone en las páginas que elijas una imagen de tu firma[^\n]*no una firma digital con certificado[^\n]*no da asesoramiento legal/,
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
