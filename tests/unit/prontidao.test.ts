import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  MIN_MAIN_WORDS,
  MIN_WORDS_PER_AD,
  REQUIRED_PAGES,
  TEST_ADS_TXT,
  TEST_CLIENT,
  checkAllBuild,
  checkClientBuild,
  checkContent,
  checkCrawlable,
  checkNothingUnfinished,
  checkPdfPages,
  checkRequiredPages,
  checkTodayBuild,
  fileIn,
  formatTable,
  type Row,
  realSite,
  type Site,
  type SitePage,
} from '../../scripts/lib/prontidao.ts';
import { LANGS, ROUTES, languagesOf, routeById, type Lang } from '../../src/i18n/routes.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

// gate:prontidao proven on small fake sites written to a temporary folder: one that passes every item, then
// one break at a time (positive and negative controls, prompt F3, decision 5). From the F5a the fake site can carry the
// 12 PDF tools and the hub too (makeSite(change, true)), to prove the PDF cards, search and pages the same way.

const ORIGIN = 'https://fileorca.com';
const SLUGS: Record<string, Record<Lang, string>> = {
  home: { en: '/', pt: '/pt/', es: '/es/' },
  about: { en: '/about/', pt: '/pt/sobre/', es: '/es/acerca-de/' },
  contact: { en: '/contact/', pt: '/pt/contato/', es: '/es/contacto/' },
  privacy: { en: '/privacy/', pt: '/pt/privacidade/', es: '/es/privacidad/' },
  terms: { en: '/terms/', pt: '/pt/termos/', es: '/es/terminos/' },
  licenses: { en: '/licenses/', pt: '/pt/licencas/', es: '/es/licencias/' },
  support: { en: '/support/', pt: '/pt/apoie/', es: '/es/apoyo/' },
};
const TOOL = '/compress-image/';
const PAGES: SitePage[] = [
  ...Object.entries(SLUGS).flatMap(([id, paths]) => LANGS.map((lang) => ({ id, lang, path: paths[lang], indexable: true, ads: false }))),
  { id: 'compress-image', lang: 'en', path: TOOL, indexable: true, ads: true },
  ...LANGS.map((lang) => ({ id: 'not-found', lang, path: lang === 'en' ? '/404.html' : `/${lang}/404.html`, indexable: false, ads: false })),
];
const PRIVACY: Record<Lang, string> = {
  en: 'Google is the advertising partner of the site. Third-party vendors, including Google, use cookies to serve ads based on your prior visits. Declining does not switch Google Analytics off: it then works without cookies.',
  pt: 'O Google é o parceiro de publicidade do site. Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios. Recusar não desliga o Google Analytics: ele passa a funcionar sem cookies.',
  es: 'Google es el socio de publicidad del sitio. Proveedores externos, incluido Google, usan cookies para mostrar anuncios. Rechazar no apaga Google Analytics: entonces funciona sin cookies.',
};
/** Plain prose of n words with no placeholder wording, different per page. */
const prose = (n: number, seed: string): string => Array.from({ length: n }, (_, i) => (i % 9 === 0 ? `${seed}${i}` : 'files')).join(' ');

function pageHtml(page: SitePage, tweak: (main: string) => string = (main) => main): string {
  const lang = page.lang;
  const footer = REQUIRED_PAGES.map((id) => `<li><a href="${SLUGS[id]?.[lang]}">${id}</a></li>`).join('');
  let main = `<h1>Heading of ${page.path}</h1><p>${prose(page.ads ? 400 : 200, page.id + lang)}</p>`;
  if (page.id === 'contact') main += '<p><a href="mailto:contato@fileorca.com">contato@fileorca.com</a></p>';
  if (page.id === 'privacy') {
    main += `<p>${PRIVACY[lang]} Victor Yuki Matusita, contato@fileorca.com.</p><ul><li><a href="https://adssettings.google.com">Ads Settings</a></li><li><a href="https://policies.google.com/technologies/partner-sites">Partner sites</a></li></ul>`;
  }
  if (page.id === 'home' && lang === 'en') main += `<a class="fo-tool" href="${TOOL}">Compress</a>`;
  if (page.ads) main += '<div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements</span></div><div class="fo-ad fo-ad--rail"><span class="fo-ad__label">Advertisements</span></div>';
  return `<!doctype html><html lang="${lang}"><head><title>Title of ${page.path} | FileOrca</title><meta name="description" content="Description of ${page.path}"></head><body><main>${tweak(main)}</main><footer><ul>${footer}</ul></footer></body></html>`;
}

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

function write(dir: string, path: string, content: string): void {
  const file = path.includes('.') && !path.endsWith('/') ? join(dir, path) : fileIn(dir, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/** The PDF pages of a fake site with the PDF tools: the 12 of the registry and the hub, English only, with an ad area. */
const PDF_FAKE: SitePage[] = [
  ...PDF_TOOL_IDS.map((id) => ({ id, lang: 'en' as const, path: PDF_PAGES[id].path, indexable: true, ads: true })),
  { id: PDF_HUB_ID, lang: 'en' as const, path: '/pdf-tools/', indexable: true, ads: true },
];
const PDF_PATHS = PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path);
const IMAGE_TO_PDF = '/image-to-pdf/';
const cardsHtml = (paths: readonly string[]): string => paths.map((path) => `<a class="fo-tool" href="${path}">${path}</a>`).join('');

/** A complete fake site; `change` edits files after they are written. With `pdf`, it has the PDF tools, their hub, cards and search too. */
function makeSite(change: (dir: string) => void = () => {}, pdf = false): Site {
  const dir = mkdtempSync(join(tmpdir(), 'fo-prontidao-'));
  roots.push(dir);
  const pages = pdf ? [...PAGES, ...PDF_FAKE] : PAGES;
  for (const page of pages) write(dir, page.path, pageHtml(page));
  if (pdf) {
    // The home lists the PDF tools; the hub lists them and the Image to PDF card, whose page exists apart from the registry.
    const home = PAGES.find((candidate) => candidate.id === 'home' && candidate.lang === 'en') as SitePage;
    write(dir, home.path, pageHtml(home, (main) => `${main}${cardsHtml(PDF_PATHS)}`));
    const hub = PDF_FAKE.find((candidate) => candidate.id === PDF_HUB_ID) as SitePage;
    write(dir, hub.path, pageHtml(hub, (main) => `${main}${cardsHtml([...PDF_PATHS, IMAGE_TO_PDF])}`));
    write(dir, IMAGE_TO_PDF, pageHtml({ id: 'image-to-pdf', lang: 'en', path: IMAGE_TO_PDF, indexable: true, ads: true }));
  }
  write(dir, '/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`);
  write(dir, '/sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${LANGS.map((lang) => `  <sitemap><loc>${ORIGIN}/sitemap-${lang}.xml</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`);
  for (const lang of LANGS) {
    const urls = pages.filter((page) => page.lang === lang && page.indexable).map((page) => `  <url><loc>${ORIGIN}${page.path}</loc></url>`);
    write(dir, `/sitemap-${lang}.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  }
  write(dir, '/_headers', "/*\n  X-Content-Type-Options: nosniff\n\nhttps://:version.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex\n\n/404\n  X-Robots-Tag: noindex\n");
  write(dir, '/search-index.json', JSON.stringify([{ id: 'compress-image', href: { en: TOOL } }, ...(pdf ? PDF_TOOL_IDS.map((id) => ({ id, href: { en: PDF_PAGES[id].path } })) : [])]));
  change(dir);
  const site: Site = { dir, pages, tools: { en: [TOOL], pt: [], es: [] }, searchIds: ['compress-image'] };
  if (!pdf) return site;
  return {
    ...site,
    searchIds: ['compress-image', ...PDF_TOOL_IDS],
    cards: { home: { en: PDF_PATHS }, [PDF_HUB_ID]: { en: [...PDF_PATHS, IMAGE_TO_PDF] } },
    pdf: [...PDF_TOOL_IDS, PDF_HUB_ID],
  };
}

/** The same fake site after a build with the AdSense variables: a meta in every head, ads.txt, maybe the loader. */
function makeAdsBuild(options: { meta?: (path: string) => string; adsTxt?: string | null; loader?: (page: SitePage) => boolean } = {}): Site {
  const meta = options.meta ?? (() => `<meta name="google-adsense-account" content="${TEST_CLIENT}">`);
  const loader = options.loader ?? (() => false);
  return makeSite((dir) => {
    for (const page of PAGES) {
      const script = loader(page)
        ? '<script>if(location.hostname==="fileorca.com"){var s=document.createElement(\'script\');s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000";}</script>'
        : '';
      write(dir, page.path, pageHtml(page).replace('</head>', `${meta(page.path)}${script}</head>`));
    }
    if (options.adsTxt !== null) write(dir, '/ads.txt', options.adsTxt ?? `${TEST_ADS_TXT}\n`);
  });
}

const failing = (rows: Row[]): string[] => rows.filter((row) => !row.ok).flatMap((row) => row.problems.map((problem) => `${row.item}: ${problem}`));

describe('gate:prontidao, controle positivo', () => {
  it('passes a complete site on every item', () => {
    const site = makeSite();
    const rows = [...checkTodayBuild(site), ...checkRequiredPages(site), ...checkNothingUnfinished(site), ...checkContent(site), ...checkCrawlable(site)];
    expect(failing(rows)).toEqual([]);
    expect(rows).toHaveLength(14);
    expect(formatTable(rows)).toMatch(/^ok {4}/);
  });

  it('passes the builds with the test id: meta and ads.txt, and the loader only on the tool page', () => {
    expect(failing(checkClientBuild(makeAdsBuild()))).toEqual([]);
    expect(failing(checkAllBuild(makeAdsBuild({ loader: (page) => page.ads })))).toEqual([]);
  });
});

describe('gate:prontidao, (a) AdSense', () => {
  it('refuses an ads.txt with the wrong line, an extra line or no file', () => {
    for (const adsTxt of ['google.com, ca-pub-0000000000000000, DIRECT, f08c47fec0942fa0\n', 'google.com, pub-0000000000000000, RESELLER, f08c47fec0942fa0\n', `${TEST_ADS_TXT}\nexample.net, 1, DIRECT\n`, null]) {
      expect(failing(checkClientBuild(makeAdsBuild({ adsTxt }))).join('\n'), String(adsTxt)).toMatch(/ads\.txt/);
    }
  });

  it('refuses a page without the meta tag, with another id or with the meta outside the head', () => {
    expect(failing(checkClientBuild(makeAdsBuild({ meta: (path) => (path === '/terms/' ? '' : `<meta name="google-adsense-account" content="${TEST_CLIENT}">`) })))).toEqual([
      expect.stringMatching(/^Meta tag .*\/terms\/: 0 meta/),
    ]);
    expect(failing(checkClientBuild(makeAdsBuild({ meta: () => '<meta name="google-adsense-account" content="ca-pub-1111111111111111">' }))).length).toBeGreaterThan(0);
  });

  it('refuses the loader with only the id, on a legal page, or without the hostname lock', () => {
    expect(failing(checkClientBuild(makeAdsBuild({ loader: (page) => page.ads }))).join('\n')).toMatch(/carregador/);
    expect(failing(checkAllBuild(makeAdsBuild({ loader: (page) => page.ads || page.id === 'privacy' }))).join('\n')).toMatch(/\/privacy\/: carregador numa página sem área/);
    expect(failing(checkAllBuild(makeAdsBuild({ loader: () => false }))).join('\n')).toMatch(/\/compress-image\/: página de ferramenta sem o carregador/);
    const unlocked = makeAdsBuild({ loader: (page) => page.ads });
    write(unlocked.dir, TOOL, readTool(unlocked).replace('location.hostname==="fileorca.com"', 'true'));
    expect(failing(checkAllBuild(unlocked)).join('\n')).toMatch(/sem a trava do hostname/);
    // A locked unit push elsewhere on the page does not cover a loader without the lock (review c-03).
    const push = '<script>if(location.hostname==="fileorca.com"){(window.adsbygoogle=window.adsbygoogle||[]).push({});}</script>';
    const mixed = makeAdsBuild({ loader: (page) => page.ads });
    write(mixed.dir, TOOL, readTool(mixed).replace('location.hostname==="fileorca.com"', 'true').replace('</main>', `${push}</main>`));
    expect(failing(checkAllBuild(mixed))).toEqual([expect.stringMatching(/\/compress-image\/: carregador sem a trava do hostname/)]);
    // The snippet of the AdSense help, a <script src>, can carry no lock; a push in another form needs the lock too.
    const bySrc = makeAdsBuild();
    write(bySrc.dir, TOOL, readTool(bySrc).replace('</head>', '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossorigin="anonymous"></script></head>'));
    expect(failing(checkAllBuild(bySrc))).toEqual([expect.stringMatching(/\/compress-image\/: carregador por <script src>, sem trava possível/)]);
    const plainPush = makeAdsBuild({ loader: (page) => page.ads });
    write(plainPush.dir, TOOL, readTool(plainPush).replace('</main>', '<script>window.adsbygoogle.push({});</script></main>'));
    expect(failing(checkAllBuild(plainPush))).toEqual([expect.stringMatching(/\/compress-image\/: push de unidade sem a trava do hostname/)]);
    const openPush = makeAdsBuild({ loader: (page) => page.ads });
    write(openPush.dir, TOOL, readTool(openPush).replace('</main>', `${push.replace('location.hostname==="fileorca.com"', 'true')}</main>`));
    expect(failing(checkAllBuild(openPush))).toEqual([expect.stringMatching(/\/compress-image\/: push de unidade sem a trava do hostname/)]);
  });

  it('refuses the build of today with a meta tag, an ads.txt or an ad unit', () => {
    expect(failing(checkTodayBuild(makeAdsBuild())).join('\n')).toMatch(/meta do AdSense[\s\S]*ads\.txt existe sem o ID/);
    const unit = makeSite((dir) => write(dir, TOOL, pageHtml(PAGES.find((page) => page.ads) as SitePage, (main) => `${main}<ins class="adsbygoogle"></ins>`)));
    expect(failing(checkTodayBuild(unit)).join('\n')).toMatch(/carregador ou unidade/);
  });
});

function readTool(site: Site): string {
  return readFileSync(fileIn(site.dir, TOOL), 'utf8');
}

describe('gate:prontidao, (b) páginas obrigatórias', () => {
  it('refuses a missing required page in one language', () => {
    const site = makeSite((dir) => rmSync(fileIn(dir, '/es/terminos/')));
    expect(failing(checkRequiredPages(site))).toContain('Sobre, Contato, Privacidade, Termos, Licenças e Apoio nos três idiomas: /es/terminos/: não existe no build');
  });

  it('refuses a footer that misses one of the six', () => {
    const site = makeSite((dir) => write(dir, '/pt/', readFileSync(fileIn(dir, '/pt/'), 'utf8').replace('<li><a href="/pt/apoie/">support</a></li>', '')));
    expect(failing(checkRequiredPages(site))).toEqual(['As seis no rodapé de toda página: /pt/: rodapé sem /pt/apoie/']);
  });

  it('refuses a contact page without the address', () => {
    const contact = PAGES.find((page) => page.id === 'contact' && page.lang === 'en') as SitePage;
    const site = makeSite((dir) => write(dir, contact.path, pageHtml(contact, (main) => main.replace(/<p><a href="mailto[\s\S]*?<\/p>/, ''))));
    expect(failing(checkRequiredPages(site))).toEqual(['O Contato mostra contato@fileorca.com: /contact/: contato@fileorca.com não aparece']);
  });

  it('refuses a privacy policy without Google, the cookies, the cookieless Analytics, the links, the controller or the e-mail', () => {
    const privacy = PAGES.find((page) => page.id === 'privacy' && page.lang === 'pt') as SitePage;
    const cuts: [RegExp, RegExp][] = [
      [/O Google é o parceiro de publicidade do site\./, /parceiro de anúncios/],
      [/Fornecedores terceiros, incluindo o Google, usam cookies/, /cookies de terceiros/],
      [/Recusar não desliga o Google Analytics: ele passa a funcionar sem cookies./, /sem cookies depois da Recusa/],
      [/<li><a href="https:\/\/adssettings\.google\.com">Ads Settings<\/a><\/li>/, /opt-out/],
      [/<li><a href="https:\/\/policies\.google\.com\/technologies\/partner-sites">Partner sites<\/a><\/li>/, /sites parceiros/],
      [/Victor Yuki Matusita, /, /controlador/],
      [/contato@fileorca\.com\./, /e-mail/],
    ];
    for (const [cut, expected] of cuts) {
      const site = makeSite((dir) => write(dir, privacy.path, pageHtml(privacy, (main) => main.replace(cut, ''))));
      const problems = failing(checkRequiredPages(site));
      expect(problems, String(cut)).toHaveLength(1);
      expect(problems[0], String(cut)).toMatch(expected);
    }
  });
});

describe('gate:prontidao, (c) nenhuma página em breve', () => {
  it('refuses "coming soon" and its kin in the three languages', () => {
    for (const [lang, text] of [['en', 'Coming soon'], ['en', 'Under construction'], ['pt', 'Em breve'], ['pt', 'em construção'], ['es', 'Próximamente'], ['es', 'en construcción'], ['en', 'Lorem ipsum'], ['en', 'TODO']] as const) {
      const page = PAGES.find((candidate) => candidate.id === 'about' && candidate.lang === lang) as SitePage;
      const site = makeSite((dir) => write(dir, page.path, pageHtml(page, (main) => `${main}<p>${text}</p>`)));
      expect(failing(checkNothingUnfinished(site)).join('\n'), text).toMatch(new RegExp(`Nenhum texto de obra: ${page.path.replace(/\//g, '\\/')}`));
    }
  });

  it('does not take the Portuguese and Spanish word "todo" for a TODO', () => {
    const page = PAGES.find((candidate) => candidate.id === 'about' && candidate.lang === 'pt') as SitePage;
    const site = makeSite((dir) => write(dir, page.path, pageHtml(page, (main) => `${main}<p>Funciona em todo navegador, todo dia.</p>`)));
    expect(failing(checkNothingUnfinished(site))).toEqual([]);
  });

  it('refuses a fake id anywhere in the build, scripts included', () => {
    for (const fake of ['ca-pub-0000000000000000', 'G-XXXXXXXXXX', 'https://example.com/']) {
      const site = makeSite((dir) => write(dir, '/', readFileSync(fileIn(dir, '/'), 'utf8').replace('</head>', `<script>var id="${fake}";</script></head>`)));
      expect(failing(checkNothingUnfinished(site)).join('\n'), fake).toMatch(/Nenhum ID de mentira: \/:/);
    }
  });

  it('refuses a card or a search entry for a tool that does not exist', () => {
    const home = PAGES.find((page) => page.id === 'home' && page.lang === 'en') as SitePage;
    const card = makeSite((dir) => write(dir, '/', pageHtml(home, (main) => `${main}<a class="fo-tool" href="/convert-to-webp/">Convert to WebP</a>`)));
    expect(failing(checkNothingUnfinished(card)).join('\n')).toMatch(/cartão para \/convert-to-webp\/, que não existe[\s\S]*fora do registro/);
    const search = makeSite((dir) => write(dir, '/search-index.json', JSON.stringify([{ id: 'compress-image', href: { en: TOOL } }, { id: 'avif-to-jpg', href: { en: '/avif-to-jpg/' } }])));
    expect(failing(checkNothingUnfinished(search)).join('\n')).toMatch(/busca: avif-to-jpg leva a \/avif-to-jpg\/, que não existe[\s\S]*fora do registro/);
  });

  it('checks the extra cards of a page from the calculator registry: the money ones the home must list (F4)', () => {
    const home = PAGES.find((page) => page.id === 'home' && page.lang === 'en') as SitePage;
    const CALC = '/mortgage-calculator/';
    const withMoney = (site: Site): Site => ({ ...site, cards: { home: { en: [CALC] } } });
    const listed = withMoney(
      makeSite((dir) => {
        write(dir, CALC, pageHtml({ id: 'mortgage-calculator', lang: 'en', path: CALC, indexable: true, ads: true }));
        write(dir, '/', pageHtml(home, (main) => `${main}<a class="fo-tool" href="${CALC}">Mortgage calculator</a>`));
      }),
    );
    expect(failing(checkNothingUnfinished(listed))).toEqual([]);
    // The registry asks for the mortgage card and the home has none: it is missing.
    const missing = withMoney(makeSite((dir) => write(dir, CALC, pageHtml({ id: 'mortgage-calculator', lang: 'en', path: CALC, indexable: true, ads: true }))));
    expect(failing(checkNothingUnfinished(missing)).join('\n')).toMatch(/faltam os cartões de \/mortgage-calculator\//);
    // A calculator card the registry does not ask for (the home lists only its five) is refused.
    const extra = makeSite((dir) => {
      write(dir, CALC, pageHtml({ id: 'mortgage-calculator', lang: 'en', path: CALC, indexable: true, ads: true }));
      write(dir, '/', pageHtml(home, (main) => `${main}<a class="fo-tool" href="${CALC}">Mortgage calculator</a>`));
    });
    expect(failing(checkNothingUnfinished(extra)).join('\n')).toMatch(/cartões fora do registro: \/mortgage-calculator\//);
  });

  it('builds the real site with the image, money and PDF cards and the search of the three registries', () => {
    const site = realSite('dist');
    // F5a: the home also lists the 12 PDF tools of the PDF registry, after the five credit calculators.
    expect(site.cards?.['home']?.en).toEqual([
      '/mortgage-calculator/', '/refinance-calculator/', '/auto-loan-calculator/', '/personal-loan-calculator/', '/home-affordability-calculator/',
      ...PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path),
    ]);
    expect(site.cards?.['money-calculators']?.en).toHaveLength(14);
    // F5a: the search offers the 12 PDF tools as well.
    expect(site.searchIds).toHaveLength(11 + 18 + 5 + PDF_TOOL_IDS.length);
  });

  it('builds the PDF part of the real site from the PDF registry: hub cards, search ids and the pages to look at', () => {
    const site = realSite('dist');
    expect(site.cards?.[PDF_HUB_ID]?.en).toEqual([...PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path), '/image-to-pdf/']);
    expect(site.cards?.[PDF_HUB_ID]?.pt).toBeUndefined();
    expect(site.searchIds.slice(-PDF_TOOL_IDS.length)).toEqual([...PDF_TOOL_IDS]);
    expect(site.pdf).toEqual([...PDF_TOOL_IDS, PDF_HUB_ID]);
    // Each of them is a page of the route map, in English only, with an ad area.
    for (const id of site.pdf ?? []) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual(['en']);
      expect(route?.adArea, id).toBeDefined();
    }
    expect(routeById('image-to-pdf').paths.en).toBe('/image-to-pdf/');
  });
});

describe('gate:prontidao, (d) conteúdo de verdade', () => {
  it('refuses a repeated title, description or H1 and a page without its own H1', () => {
    const about = PAGES.find((page) => page.id === 'about' && page.lang === 'en') as SitePage;
    const repeated = makeSite((dir) => write(dir, about.path, pageHtml(about).replace('Title of /about/', 'Title of /terms/')));
    expect(failing(checkContent(repeated))).toEqual(['H1, título e descrição próprios: /terms/: title igual ao de /about/']);
    const twoH1 = makeSite((dir) => write(dir, about.path, pageHtml(about, (main) => `${main}<h1>Another</h1>`)));
    expect(failing(checkContent(twoH1))).toEqual(['H1, título e descrição próprios: /about/: 2 H1']);
  });

  it(`refuses a page with fewer than ${MIN_MAIN_WORDS} words in <main>, AdSlot labels not counted`, () => {
    const contact = PAGES.find((page) => page.id === 'contact' && page.lang === 'es') as SitePage;
    const site = makeSite((dir) => write(dir, contact.path, pageHtml(contact, () => `<h1>Contacto</h1><p>${prose(MIN_MAIN_WORDS - 5, 'c')}</p><div class="fo-ad"><span>${prose(50, 'ad')}</span></div>`)));
    expect(failing(checkContent(site)).join('\n')).toMatch(/\/es\/contacto\/: \d+ palavras no <main>/);
  });

  it(`refuses a page with less than ${MIN_WORDS_PER_AD} words for each AdSlot`, () => {
    const tool = PAGES.find((page) => page.ads) as SitePage;
    const site = makeSite((dir) => write(dir, tool.path, pageHtml(tool, (main) => main.replace(prose(400, 'compress-imageen'), prose(2 * MIN_WORDS_PER_AD - 20, 'x')))));
    expect(failing(checkContent(site))).toEqual([expect.stringMatching(/^Mais conteúdo que anúncio: \/compress-image\/: 2 AdSlot\(s\) para 2\d\d palavras/)]);
  });
});

describe('gate:prontidao, as páginas de PDF (F5a)', () => {
  const pdfSite = (change: (dir: string) => void = () => {}): Site => makeSite(change, true);
  const fakeOf = (id: string): SitePage => PDF_FAKE.find((page) => page.id === id) as SitePage;
  const MERGE = fakeOf('merge-pdf');
  const HUB = fakeOf(PDF_HUB_ID);
  const home = PAGES.find((page) => page.id === 'home' && page.lang === 'en') as SitePage;
  const allRows = (site: Site): Row[] => [...checkTodayBuild(site), ...checkRequiredPages(site), ...checkNothingUnfinished(site), ...checkContent(site), ...checkPdfPages(site), ...checkCrawlable(site)];

  it('passes a site with the 12 PDF tools, their hub, cards and search on every item', () => {
    const rows = allRows(pdfSite());
    expect(failing(rows)).toEqual([]);
    // The 14 items of before and the 3 rows of the PDF pages.
    expect(rows).toHaveLength(14 + 3);
    expect(checkPdfPages(pdfSite()).map((entry) => entry.ok)).toEqual([true, true, true]);
    expect(PDF_FAKE).toHaveLength(13);
  });

  it('has nothing to look at in a site without PDF pages (the rows pass on no page)', () => {
    expect(failing(checkPdfPages(makeSite()))).toEqual([]);
  });

  it('refuses a PDF tool that is not in the route map, not indexable, without an ad area or not in the build', () => {
    const site = pdfSite();
    const noRoute = { ...site, pages: site.pages.filter((page) => page.id !== 'merge-pdf') };
    expect(failing(checkPdfPages(noRoute))).toEqual(['As páginas de PDF estão no mapa de rotas e no build: merge-pdf: sem página em inglês no mapa de rotas']);
    const hidden = { ...site, pages: site.pages.map((page) => (page.id === 'split-pdf' ? { ...page, indexable: false } : page)) };
    expect(failing(checkPdfPages(hidden))).toEqual(['As páginas de PDF estão no mapa de rotas e no build: /split-pdf/: não indexável']);
    const noAds = { ...site, pages: site.pages.map((page) => (page.id === 'sign-pdf' ? { ...page, ads: false } : page)) };
    expect(failing(checkPdfPages(noAds))).toEqual([expect.stringMatching(/\/sign-pdf\/: sem área de anúncio/)]);
    const gone = pdfSite((dir) => rmSync(fileIn(dir, '/pdf-tools/')));
    expect(failing(checkPdfPages(gone)).join('\n')).toContain('/pdf-tools/: não existe no build');
  });

  it('refuses a PDF page without an H1, with two, or with a title or description of its own that another page already has', () => {
    const noTitle = pdfSite((dir) => write(dir, MERGE.path, pageHtml(MERGE).replace('<title>Title of /merge-pdf/ | FileOrca</title>', '')));
    expect(failing(checkPdfPages(noTitle))).toEqual(['PDF: H1, título e descrição próprios: /merge-pdf/: sem title']);
    const twoH1 = pdfSite((dir) => write(dir, MERGE.path, pageHtml(MERGE, (main) => `${main}<h1>Another</h1>`)));
    expect(failing(checkPdfPages(twoH1))).toEqual(['PDF: H1, título e descrição próprios: /merge-pdf/: 2 H1']);
    // Same title as the About page, same description as the compress-image page, same H1 as another PDF page.
    const about = PAGES.find((page) => page.id === 'about' && page.lang === 'en') as SitePage;
    const sameTitle = pdfSite((dir) => write(dir, MERGE.path, pageHtml(MERGE).replace('Title of /merge-pdf/', `Title of ${about.path}`)));
    expect(failing(checkPdfPages(sameTitle))).toEqual([`PDF: H1, título e descrição próprios: /merge-pdf/: title igual ao de ${about.path}`]);
    const sameDescription = pdfSite((dir) => write(dir, MERGE.path, pageHtml(MERGE).replace('Description of /merge-pdf/', `Description of ${TOOL}`)));
    expect(failing(checkPdfPages(sameDescription))).toEqual([`PDF: H1, título e descrição próprios: /merge-pdf/: description igual ao de ${TOOL}`]);
    const split = fakeOf('split-pdf');
    const sameH1 = pdfSite((dir) => write(dir, split.path, pageHtml(split).replace('Heading of /split-pdf/', 'Heading of /merge-pdf/')));
    expect(failing(checkPdfPages(sameH1)).join('\n')).toMatch(/\/(?:split|merge)-pdf\/: h1 igual ao de \/(?:merge|split)-pdf\//);
    // The same break on the hub.
    const hubTwin = pdfSite((dir) => write(dir, HUB.path, pageHtml(HUB, (main) => main).replace('Title of /pdf-tools/', 'Title of /merge-pdf/')));
    expect(failing(checkPdfPages(hubTwin)).join('\n')).toMatch(/title igual ao de \/merge-pdf\//);
  });

  it(`refuses a PDF page with fewer than ${MIN_MAIN_WORDS} words in <main>, AdSlot labels not counted, and the hub too`, () => {
    for (const page of [MERGE, HUB]) {
      const thin = pdfSite((dir) =>
        write(dir, page.path, pageHtml(page, () => `<h1>Heading of ${page.path}</h1><p>${prose(MIN_MAIN_WORDS - 5, 'p')}</p><div class="fo-ad fo-ad--content"><span>${prose(50, 'ad')}</span></div>`)),
      );
      expect(failing(checkPdfPages(thin)).join('\n'), page.path).toMatch(new RegExp(`PDF: texto mínimo e mais conteúdo que anúncio: ${page.path.replace(/\//g, '\\/')}: \\d+ palavras no <main>`));
    }
  });

  it(`refuses a PDF page with less than ${MIN_WORDS_PER_AD} words for each AdSlot, and one without any AdSlot`, () => {
    const dense = pdfSite((dir) => write(dir, MERGE.path, pageHtml(MERGE, (main) => main.replace(prose(400, 'merge-pdfen'), prose(2 * MIN_WORDS_PER_AD - 20, 'x')))));
    expect(failing(checkPdfPages(dense))).toEqual([expect.stringMatching(/^PDF: texto mínimo e mais conteúdo que anúncio: \/merge-pdf\/: 2 AdSlot\(s\) para 2\d\d palavras/)]);
    const bare = pdfSite((dir) => write(dir, MERGE.path, pageHtml(MERGE, (main) => main.replace(/<div class="fo-ad[\s\S]*$/, ''))));
    expect(failing(checkPdfPages(bare))).toEqual(['PDF: texto mínimo e mais conteúdo que anúncio: /merge-pdf/: nenhum AdSlot na página']);
  });

  it('checks the cards of the PDF hub and of the home against the PDF registry', () => {
    const hub = (cards: readonly string[]) => pdfSite((dir) => write(dir, HUB.path, pageHtml(HUB, (main) => `${main}${cardsHtml(cards)}`)));
    const missing = hub(PDF_PATHS.slice(1));
    expect(failing(checkNothingUnfinished(missing)).join('\n')).toMatch(/\/pdf-tools\/: faltam os cartões de \/merge-pdf\/, \/image-to-pdf\//);
    const extra = hub([...PDF_PATHS, IMAGE_TO_PDF, '/pdf-ocr/']);
    expect(failing(checkNothingUnfinished(extra)).join('\n')).toMatch(/\/pdf-tools\/: cartão para \/pdf-ocr\/, que não existe[\s\S]*cartões fora do registro: \/pdf-ocr\//);
    const noImageCard = hub(PDF_PATHS);
    expect(failing(checkNothingUnfinished(noImageCard))).toEqual([expect.stringMatching(/\/pdf-tools\/: faltam os cartões de \/image-to-pdf\//)]);
    const noHomeSection = pdfSite((dir) => write(dir, '/', pageHtml(home)));
    expect(failing(checkNothingUnfinished(noHomeSection)).join('\n')).toMatch(/\/: faltam os cartões de \/merge-pdf\/[^\n]*\/watermark-pdf\//);
    const oneMissing = pdfSite((dir) => write(dir, '/', pageHtml(home, (main) => `${main}${cardsHtml(PDF_PATHS.filter((path) => path !== '/rotate-pdf/'))}`)));
    expect(failing(checkNothingUnfinished(oneMissing))).toEqual([expect.stringMatching(/\/: faltam os cartões de \/rotate-pdf\/$/)]);
    const strangeCard = pdfSite((dir) => write(dir, '/', pageHtml(home, (main) => `${main}${cardsHtml([...PDF_PATHS, '/pdf-ocr/'])}`)));
    expect(failing(checkNothingUnfinished(strangeCard)).join('\n')).toMatch(/\/: cartão para \/pdf-ocr\/, que não existe[\s\S]*cartões fora do registro: \/pdf-ocr\//);
  });

  it('checks that the search has the 12 PDF tools of the registry, and only those', () => {
    const entries = (ids: readonly string[]) => JSON.stringify([{ id: 'compress-image', href: { en: TOOL } }, ...ids.map((id) => ({ id, href: { en: `/${id}/` } }))]);
    // Today's search has no PDF tool (the PDF pages are not in it yet): the item must say which ones are missing.
    const none = pdfSite((dir) => write(dir, '/search-index.json', entries([])));
    expect(failing(checkNothingUnfinished(none))).toEqual([`Cartões e busca só com o que existe: busca sem ${PDF_TOOL_IDS.join(', ')}`]);
    const one = pdfSite((dir) => write(dir, '/search-index.json', entries(PDF_TOOL_IDS.filter((id) => id !== 'sign-pdf'))));
    expect(failing(checkNothingUnfinished(one))).toEqual(['Cartões e busca só com o que existe: busca sem sign-pdf']);
    const extra = pdfSite((dir) => write(dir, '/search-index.json', entries([...PDF_TOOL_IDS, 'pdf-ocr'])));
    expect(failing(checkNothingUnfinished(extra)).join('\n')).toMatch(/busca: pdf-ocr leva a \/pdf-ocr\/, que não existe[\s\S]*busca com itens fora do registro: pdf-ocr/);
    const dangling = pdfSite((dir) => {
      write(dir, '/search-index.json', entries(PDF_TOOL_IDS));
      rmSync(fileIn(dir, '/watermark-pdf/'));
    });
    expect(failing(checkNothingUnfinished(dangling)).join('\n')).toMatch(/busca: watermark-pdf leva a \/watermark-pdf\/, que não existe/);
    expect(failing(checkNothingUnfinished(pdfSite()))).toEqual([]);
  });
});

describe('gate:prontidao, (e) rastreável', () => {
  it('refuses a robots.txt that blocks a crawler or forgets the sitemaps', () => {
    for (const robots of [
      `User-agent: *\nAllow: /\n\nUser-agent: Mediapartners-Google\nDisallow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`,
      `User-agent: Googlebot\nDisallow: /tools/\n\nUser-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`,
      'User-agent: *\nAllow: /\n',
    ]) {
      const site = makeSite((dir) => write(dir, '/robots.txt', robots));
      expect(failing(checkCrawlable(site)).join('\n'), robots).toMatch(/^robots\.txt/);
    }
  });

  it('refuses noindex on an indexable page, by meta or by a _headers rule of fileorca.com', () => {
    const terms = PAGES.find((page) => page.id === 'terms' && page.lang === 'en') as SitePage;
    const meta = makeSite((dir) => write(dir, terms.path, pageHtml(terms).replace('</head>', '<meta name="robots" content="noindex"></head>')));
    expect(failing(checkCrawlable(meta))).toEqual(['Nenhuma página indexável com noindex: /terms/: <meta name="robots"> com noindex']);
    const header = makeSite((dir) => write(dir, '/_headers', '/*\n  X-Robots-Tag: noindex\n'));
    expect(failing(checkCrawlable(header)).length).toBe(PAGES.filter((page) => page.indexable).length);
    const ownHost = makeSite((dir) => write(dir, '/_headers', `${ORIGIN}/pt/*\n  X-Robots-Tag: noindex, nofollow\n`));
    expect(failing(checkCrawlable(ownHost))).toHaveLength(PAGES.filter((page) => page.indexable && page.lang === 'pt').length);
  });

  it('refuses a sitemap with a page that does not exist or is not indexable', () => {
    const site = makeSite((dir) => {
      rmSync(fileIn(dir, '/es/apoyo/'));
      write(dir, '/sitemap-en.xml', readFileSync(join(dir, 'sitemap-en.xml'), 'utf8').replace('</urlset>', `  <url><loc>${ORIGIN}/404.html</loc></url>\n</urlset>`));
    });
    const problems = failing(checkCrawlable(site)).join('\n');
    expect(problems).toMatch(/sitemap-es\.xml: https:\/\/fileorca\.com\/es\/apoyo\/ não existe no build/);
    expect(problems).toMatch(/sitemap-en\.xml: https:\/\/fileorca\.com\/404\.html não é página indexável/);
  });
});
