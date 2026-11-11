import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  AD_WIDTHS,
  MIN_MAIN_WORDS,
  MIN_WORDS_PER_AD,
  REQUIRED_PAGES,
  TEST_ADS_TXT,
  TEST_CLIENT,
  boxesAtWidths,
  showsAt,
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
import { LANGS, QR_ID, ROUTES, languagesOf, moneyHubId, pagePath, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_PRESET_IDS, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import {
  BR_CALC_IDS,
  BR_HUB_ID,
  CALC_TOOL_IDS,
  HEALTH_HUB_ID,
  HOUSE_HUB_ID,
  HUB_MONEY_IDS,
  LIFE_CALC_IDS,
  LIFE_CALC_PAGES,
  LIFE_HUB_IDS,
  LIFE_HUB_ROUTE,
  type LifeCalcId,
} from '../../src/tools/calc/registry.ts';
import { HOME_BAND_MONEY_IDS } from '../../src/components/home-bands.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { AD_MEDIA, adBoxHtml } from '../../src/ads/map.ts';
import type { AdUnit } from '../../src/ads/config.ts';

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

/**
 * The PDF pages of a fake site with the PDF tools: the 13 tools of the registry, its 2 presets (F18, decision 5) and the hub,
 * English only, with an ad area.
 */
const PDF_FAKE: SitePage[] = [
  ...[...PDF_TOOL_IDS, ...PDF_PRESET_IDS].map((id) => ({ id, lang: 'en' as const, path: PDF_PAGES[id].path, indexable: true, ads: true })),
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
  write(dir, '/search-index.json', JSON.stringify([{ id: 'compress-image', href: { en: TOOL } }, ...(pdf ? [...PDF_TOOL_IDS, ...PDF_PRESET_IDS].map((id) => ({ id, href: { en: PDF_PAGES[id].path } })) : [])]));
  change(dir);
  const site: Site = { dir, pages, tools: { en: [TOOL], pt: [], es: [] }, searchIds: ['compress-image'] };
  if (!pdf) return site;
  return {
    ...site,
    searchIds: ['compress-image', ...PDF_TOOL_IDS, ...PDF_PRESET_IDS],
    cards: { home: { en: PDF_PATHS }, [PDF_HUB_ID]: { en: [...PDF_PATHS, IMAGE_TO_PDF] } },
    pdf: [...PDF_TOOL_IDS, ...PDF_PRESET_IDS, PDF_HUB_ID],
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

/**
 * The same fake site as the default build makes it (F12, Mudança 10; DECISOES § 413 and § 418): no ad box, since no
 * position has a unit id. The gate reads the words for each AdSlot on the build with the ids, and the boxes there.
 */
function withoutBoxes(site: Site): Site {
  const dir = mkdtempSync(join(tmpdir(), 'fo-prontidao-'));
  roots.push(dir);
  cpSync(site.dir, dir, { recursive: true });
  for (const name of readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((entry) => entry.endsWith('.html'))) {
    const path = join(dir, name);
    writeFileSync(path, readFileSync(path, 'utf8').replace(/<div class="fo-ad[^"]*"><span[^>]*>[^<]*<\/span><\/div>/g, ''));
  }
  return { ...site, dir };
}

const failing = (rows: Row[]): string[] => rows.filter((row) => !row.ok).flatMap((row) => row.problems.map((problem) => `${row.item}: ${problem}`));

describe('gate:prontidao, controle positivo', () => {
  it('passes a complete site on every item', () => {
    const site = makeSite();
    const rows = [...checkTodayBuild(withoutBoxes(site)), ...checkRequiredPages(site), ...checkNothingUnfinished(site), ...checkContent(site), ...checkCrawlable(site)];
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

  // F12 (decision 4; DECISOES § 421): the build with the ads and the wall off carries nothing of the wall, and a box of the
  // map (no <ins> since the plan B) is a unit too, never on a page without an ad area.
  it('refuses anything of the wall in the build with the wall off, and a box of the map on a page without an ad area', () => {
    for (const [piece, what] of [
      ['<dialog id="fo-wall"></dialog>', 'fo-wall'],
      ['<div id="fo-bait"></div>', 'fo-bait'],
      ['<script async src="https://fundingchoicesmessages.google.com/i/pub-0000000000000000?ers=1"></script>', 'fundingchoicesmessages'],
      ['<script>window.googlefc=window.googlefc||{};</script>', 'googlefc'],
      ['<svg><symbol id="oli-sad"></symbol></svg>', 'oli-sad'],
    ] as const) {
      const wall = makeAdsBuild({ loader: (page) => page.ads });
      write(wall.dir, '/terms/', readFileSync(fileIn(wall.dir, '/terms/'), 'utf8').replace('</main>', `${piece}</main>`));
      expect(failing(checkAllBuild(wall)), what).toEqual([expect.stringMatching(new RegExp(`^Nada da parede com a parede desligada: /terms/: .*${what}`))]);
    }
    const box = makeAdsBuild({ loader: (page) => page.ads });
    write(box.dir, '/about/', readFileSync(fileIn(box.dir, '/about/'), 'utf8').replace('</main>', `${adBoxHtml({ area: 'geral', unit: 'conteudo', id: '9100000000', label: 'Advertisements' })}</main>`));
    expect(failing(checkAllBuild(box))).toEqual([expect.stringMatching(/\/about\/: unidade de anúncio numa página sem área/)]);
  });

  it('refuses the build of today with a meta tag, an ads.txt or an ad unit', () => {
    expect(failing(checkTodayBuild(makeAdsBuild())).join('\n')).toMatch(/meta do AdSense[\s\S]*ads\.txt existe sem o ID/);
    const unit = makeSite((dir) => write(dir, TOOL, pageHtml(PAGES.find((page) => page.ads) as SitePage, (main) => `${main}<ins class="adsbygoogle"></ins>`)));
    expect(failing(checkTodayBuild(unit)).join('\n')).toMatch(/carregador ou unidade/);
    // F12, Mudança 10 (DECISOES § 413): with no unit id, not even the neutral box with its label.
    expect(failing(checkTodayBuild(withoutBoxes(makeSite())))).toEqual([]);
    // The box left behind has a space withoutBoxes() does not take, so the today build keeps one box on the tool page.
    const box = withoutBoxes(makeSite((dir) => write(dir, TOOL, pageHtml(PAGES.find((page) => page.ads) as SitePage, (main) => `${main}<div class="fo-ad fo-ad--content"><span class="fo-ad__label">Ad</span> </div>`))));
    expect(failing(checkTodayBuild(box)).join('\n')).toMatch(/\/compress-image\/: 1 caixa\(s\) de anúncio sem ID de unidade/);
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

  // F13b (UX-03 B; DECISOES § 576) and ajuste-home-cards (§ 610 and § 612): the home shows its tools as the ToolCards of
  // its category sections again, and the gate reads them (TOOL_LINKS, `main a.fo-tool`); a card of a section to a page
  // that does not exist, or that the registry does not ask of the home, fails; and a tool shown only as a chip (the band
  // of the F13b) is no card: the home misses it.
  it('reads the cards of the category sections of the home, never a chip (ajuste-home-cards)', () => {
    const home = PAGES.find((page) => page.id === 'home' && page.lang === 'en') as SitePage;
    const CALC = '/mortgage-calculator/';
    const cards = (paths: string[]) => `<section class="fo-section fo-section--cat" aria-labelledby="money-home"><h2 id="money-home">Money</h2><ul class="fo-grid">${paths.map((path) => `<li><a class="fo-tool fo-dogear fo-cat--money" href="${path}"><span class="fo-tool__icon" aria-hidden="true"></span><h3 class="fo-tool__name">x</h3><p class="fo-tool__desc">y</p></a></li>`).join('')}</ul></section>`;
    const chips = (paths: string[]) => `<section class="fo-catband"><ul class="fo-catband__chips">${paths.map((path) => `<li><a class="fo-chip fo-cat--money" href="${path}"><span class="fo-chip__dot" aria-hidden="true"></span><span>x</span></a></li>`).join('')}</ul></section>`;
    const calcPage = (dir: string) => write(dir, CALC, pageHtml({ id: 'mortgage-calculator', lang: 'en', path: CALC, indexable: true, ads: true }));
    // The base fake home lists the image tool as a card; the cards of the section add to it.
    const listed = { ...makeSite((dir) => { calcPage(dir); write(dir, '/', pageHtml(home, (main) => `${main}${cards([CALC])}`)); }), cards: { home: { en: [CALC] } } };
    expect(failing(checkNothingUnfinished(listed))).toEqual([]);
    const gone = makeSite((dir) => write(dir, '/', pageHtml(home, (main) => `${main}${cards(['/convert-to-webp/'])}`)));
    expect(failing(checkNothingUnfinished(gone)).join('\n')).toMatch(/cartão para \/convert-to-webp\/, que não existe[\s\S]*fora do registro/);
    const extra = makeSite((dir) => { calcPage(dir); write(dir, '/', pageHtml(home, (main) => `${main}${cards([CALC])}`)); });
    expect(failing(checkNothingUnfinished(extra)).join('\n')).toMatch(/cartões fora do registro: \/mortgage-calculator\//);
    // The tool the registry asks for, shown only as a chip of a band (the home of the F13b): its card is missing.
    const asChip = { ...makeSite((dir) => { calcPage(dir); write(dir, '/', pageHtml(home, (main) => `${main}${chips([CALC])}`)); }), cards: { home: { en: [CALC] } } };
    expect(failing(checkNothingUnfinished(asChip)).join('\n')).toMatch(/faltam os cartões de \/mortgage-calculator\//);
    // A chip outside a section (the next-step chips of a tool page) is not a card of the catalogue either.
    const nextStep = makeSite((dir) => write(dir, '/', pageHtml(home, (main) => `${main}<nav class="fo-next"><a class="fo-chip" href="/convert-to-webp/">x</a></nav>`)));
    expect(failing(checkNothingUnfinished(nextStep))).toEqual([]);
  });

  it('builds the real site with the image, money and PDF cards and the search of the three registries', () => {
    const site = realSite('dist');
    // F5a: the home also lists the 12 PDF tools of the PDF registry, after the five credit calculators.
    // F7 (decision 9; DECISOES § 259): and, after them, the 6 home and the 5 health calculators and the QR code generator.
    // F13b (UX-03 B; DECISOES § 570 and § 576): the money section of the home has the 6 credit calculators of the
    // specification (the five and Credit card payoff); since the ajuste-home-cards (§ 610) the home lists them as cards.
    expect(site.cards?.['home']?.en).toEqual([
      '/mortgage-calculator/', '/refinance-calculator/', '/auto-loan-calculator/', '/personal-loan-calculator/', '/home-affordability-calculator/', '/credit-card-payoff-calculator/',
      ...PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path),
      ...LIFE_HUB_IDS.house.map((id) => LIFE_CALC_PAGES[id].path),
      ...LIFE_HUB_IDS.health.map((id) => LIFE_CALC_PAGES[id].path),
      '/qr-code-generator/',
    ]);
    expect(site.cards?.['money-calculators']?.en).toHaveLength(14);
    // F6 (decision 7): the home of each language lists its money calculators (HOME_BAND_MONEY_IDS since the F13b, when the language has its money
    // hub) and its 12 PDF tools, all with the paths of the language; the Spanish money hub lists the five Spanish
    // calculators; the Brazilian hub its own once its row is in the map. Before the F6 only English had cards to check.
    // The languages adjustment (decision 6): and the QR code generator of the language, last, as in English.
    for (const lang of ['pt', 'es'] as const) {
      const hub = moneyHubId(lang);
      const money = pagePath(hub, lang) ? HOME_BAND_MONEY_IDS[lang].map((id) => pagePath(id, lang)) : [];
      expect(site.cards?.['home']?.[lang], lang).toEqual([...money, ...PDF_TOOL_IDS.map((id) => pagePath(id, lang)), pagePath(QR_ID, lang)]);
      for (const path of site.cards?.['home']?.[lang] ?? []) expect(path.startsWith(`/${lang}/`), path).toBe(true);
      if (pagePath(hub, lang)) expect(site.cards?.[hub]?.[lang], lang).toEqual(HUB_MONEY_IDS[lang].map((id) => pagePath(id, lang)));
      else expect(site.cards?.[hub]?.[lang], lang).toBeUndefined();
    }
    // The Spanish money hub lists the 14 calculators, as the English one (the five of the F6 before the languages adjustment).
    expect(site.cards?.['money-calculators']?.es).toEqual(CALC_TOOL_IDS.map((id) => pagePath(id, 'es')));
    expect(site.cards?.['money-calculators']?.pt).toBeUndefined();
    // F5a: the search offers the 12 PDF tools as well; F5b: and the 10 file guides (DECISOES § 190); F6: and the Brazilian
    // calculators once their rows are in the map.
    const brazilian = BR_CALC_IDS.filter((id) => pagePath(id, 'pt') !== undefined);
    expect([0, BR_CALC_IDS.length]).toContain(brazilian.length);
    // F7 (decision 9; DECISOES § 259): and the 11 home and health calculators and the QR code generator.
    // F17 (DECISOES § 716): 13 image pages, with AVIF to JPG and Convert to WebP (11 before). F18 (DECISOES § 743): 15,
    // with Remove EXIF data and Flip image, and the 2 PDF presets after the PDF tools.
    expect(site.searchIds).toHaveLength(15 + 18 + brazilian.length + 5 + PDF_TOOL_IDS.length + PDF_PRESET_IDS.length + FILE_GUIDE_IDS.length + 11 + 1);
  });

  it('builds the F7 part of the real site from the calculator registry: the home cards, the two hubs and the search, home and health in English only (F7, decision 9)', () => {
    const site = realSite('dist');
    // Each hub lists its calculators in the order of the registry, and nothing else; neither hub exists in pt or es.
    for (const hub of ['house', 'health'] as const) {
      const id = LIFE_HUB_ROUTE[hub];
      expect(site.cards?.[id]?.en, hub).toEqual(LIFE_HUB_IDS[hub].map((calc) => routeById(calc).paths.en));
      expect(site.cards?.[id]?.pt, hub).toBeUndefined();
      expect(site.cards?.[id]?.es, hub).toBeUndefined();
    }
    expect(Object.keys(site.cards ?? {}).sort()).toEqual(['home', 'money-calculators', PDF_HUB_ID, HOUSE_HUB_ID, HEALTH_HUB_ID, ...(pagePath(BR_HUB_ID, 'pt') ? [BR_HUB_ID] : [])].sort());
    // The home of pt and es has none of the 13 home and health pages (the QR code generator of the language is a card
    // there since the languages adjustment, at its own path).
    const f7 = new Set(([HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS, QR_ID] as RouteId[]).map((id) => routeById(id).paths.en));
    for (const lang of ['pt', 'es'] as const) expect((site.cards?.['home']?.[lang] ?? []).filter((path) => f7.has(path)), lang).toEqual([]);
    // The search ends with the 11 calculators in hub order and the QR code generator; the hubs are not search entries.
    expect(site.searchIds.slice(-12)).toEqual([...LIFE_CALC_IDS, QR_ID]);
    expect(site.searchIds).not.toContain(HOUSE_HUB_ID);
    expect(site.searchIds).not.toContain(HEALTH_HUB_ID);
    // The 14 pages are pages of the route map with an ad area: they get the loader and the content rows. The 13 of home and
    // health are English only; the QR code generator is in the three languages since the languages adjustment.
    for (const id of [HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS, QR_ID]) {
      const pages = site.pages.filter((page) => page.id === id);
      expect(pages.map((page) => page.lang), id).toEqual(id === QR_ID ? ['en', 'pt', 'es'] : ['en']);
      expect(pages[0]?.ads, id).toBe(true);
      expect(pages[0]?.indexable, id).toBe(true);
    }
  });

  it('builds the PDF part of the real site from the PDF registry: hub cards, search ids and the pages to look at', () => {
    const site = realSite('dist');
    expect(site.cards?.[PDF_HUB_ID]?.en).toEqual([...PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path), '/image-to-pdf/']);
    // F6 (decision 4): the PDF hub of Portuguese and Spanish lists the 12 tools and Image to PDF of its language (no PDF
    // hub there before, so no cards).
    for (const lang of ['pt', 'es'] as const) {
      expect(site.cards?.[PDF_HUB_ID]?.[lang], lang).toEqual([...PDF_TOOL_IDS.map((id) => routeById(id).paths[lang]), routeById('image-to-pdf').paths[lang]]);
    }
    // F7 (decision 9; DECISOES § 259): the 12 PDF tools come right before the 11 home and health calculators and the QR
    // code generator, which close the search (they closed it before the F7).
    // F18 (decision 5; DECISOES § 725): and the 2 PDF presets right after the tools, which are PDF pages to look at too.
    expect(site.searchIds.slice(-PDF_TOOL_IDS.length - PDF_PRESET_IDS.length - 12, -12)).toEqual([...PDF_TOOL_IDS, ...PDF_PRESET_IDS]);
    expect(site.pdf).toEqual([...PDF_TOOL_IDS, ...PDF_PRESET_IDS, PDF_HUB_ID]);
    // Each of them is a page of the route map, in the three languages since the F6 (English only before), with an ad area.
    for (const id of site.pdf ?? []) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual([...LANGS]);
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

  it('compares the H1 within one language (F6): "Dividir PDF" in Portuguese and in Spanish is one page in two languages; two pages of a language still may not share it', () => {
    const about = (lang: Lang) => PAGES.find((page) => page.id === 'about' && page.lang === lang) as SitePage;
    const terms = PAGES.find((page) => page.id === 'terms' && page.lang === 'pt') as SitePage;
    const h1 = (page: SitePage, text: string) => pageHtml(page).replace(`<h1>Heading of ${page.path}</h1>`, `<h1>${text}</h1>`);
    // Positive control: the same H1 in Portuguese and in Spanish (and in English) passes.
    const across = makeSite((dir) => {
      for (const lang of LANGS) write(dir, about(lang).path, h1(about(lang), 'Dividir PDF'));
    });
    expect(failing(checkContent(across))).toEqual([]);
    // Negative control: the same H1 on two Portuguese pages fails, as two English pages do.
    const within = makeSite((dir) => {
      write(dir, about('pt').path, h1(about('pt'), 'Dividir PDF'));
      write(dir, terms.path, h1(terms, 'Dividir PDF'));
    });
    expect(failing(checkContent(within))).toEqual([`H1, título e descrição próprios: ${terms.path}: h1 igual ao de ${about('pt').path}`]);
    // The title is still compared across languages: a Portuguese page with the title of an English one fails.
    const title = makeSite((dir) => write(dir, about('pt').path, pageHtml(about('pt')).replace(`Title of ${about('pt').path}`, `Title of ${about('en').path}`)));
    expect(failing(checkContent(title))).toEqual([`H1, título e descrição próprios: ${about('pt').path}: title igual ao de ${about('en').path}`]);
  });

  it(`refuses a page with fewer than ${MIN_MAIN_WORDS} words in <main>, AdSlot labels not counted`, () => {
    const contact = PAGES.find((page) => page.id === 'contact' && page.lang === 'es') as SitePage;
    const site = makeSite((dir) => write(dir, contact.path, pageHtml(contact, () => `<h1>Contacto</h1><p>${prose(MIN_MAIN_WORDS - 5, 'c')}</p><div class="fo-ad"><span>${prose(50, 'ad')}</span></div>`)));
    expect(failing(checkContent(site)).join('\n')).toMatch(/\/es\/contacto\/: \d+ palavras no <main>/);
  });

  // F12 (decision 4; DECISOES § 421 and § 423): the two boxes of the fake page say no width, so they show at every
  // width and the page needs 300 words at each one, as when the gate counted every box of the HTML.
  it(`refuses a page with less than ${MIN_WORDS_PER_AD} words for each AdSlot`, () => {
    const tool = PAGES.find((page) => page.ads) as SitePage;
    const site = makeSite((dir) => write(dir, tool.path, pageHtml(tool, (main) => main.replace(prose(400, 'compress-imageen'), prose(2 * MIN_WORDS_PER_AD - 20, 'x')))));
    expect(failing(checkContent(site))).toEqual([expect.stringMatching(/^Mais conteúdo que anúncio: \/compress-image\/: 2 AdSlot\(s\) a 360 e 768 e 1280 px para 2\d\d palavras/)]);
  });
});

// F12 (decision 4; DECISOES § 421): the boxes of the ad map, counted at the widths they show at. A page of the map with
// the 1st content ad, three more on the phone, the multiplex and both rails has 7 boxes in its HTML but shows 4 at most
// at any width: 600 words pass, and one box more than the words allow fails at that width only.
describe('gate:prontidao, as caixas por largura (F12)', () => {
  const box = (unit: AdUnit): string => adBoxHtml({ area: 'arquivos', unit, id: '9200000000', label: 'Advertisements' });
  const tool = PAGES.find((page) => page.ads) as SitePage;
  const withMap = (words: number, units: AdUnit[], rail: AdUnit[] = []): Site =>
    makeSite((dir) =>
      write(
        dir,
        tool.path,
        pageHtml(tool, (main) => main.replace(prose(400, 'compress-imageen'), prose(words, 'x')).replace(/<div class="fo-ad[\s\S]*$/, '') + units.map(box).join('')).replace('</main>', `</main><aside class="fo-rail">${rail.map(box).join('')}</aside>`),
      ),
    );
  const PHONE_MAP: AdUnit[] = ['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'multiplex'];

  it('reads the width of each box', () => {
    expect([showsAt(null, 360), showsAt(null, 1280)]).toEqual([true, true]);
    // Review A-3 (§ 454): the queries the map writes (src/ads/map.ts), the 2nd content ad up to 459 px since § 445.
    expect(AD_WIDTHS.map((width) => showsAt(AD_MEDIA.phone, width))).toEqual([true, false, false]);
    expect(AD_WIDTHS.map((width) => showsAt(AD_MEDIA.wide, width))).toEqual([false, true, true]);
    expect(AD_WIDTHS.map((width) => showsAt(AD_MEDIA.rail, width))).toEqual([false, false, true]);
    expect(AD_MEDIA.phone).toBe('(max-width: 459px)');
    const html = [...PHONE_MAP, 'lateral', 'lateral-2'].map((unit) => box(unit as AdUnit)).join('');
    expect(boxesAtWidths(html)).toEqual({ slots: 7, atWidth: { 360: 4, 768: 2, 1280: 4 } });
  });

  it(`passes ${4 * MIN_WORDS_PER_AD} words for the 7 boxes of the map, 4 at most at any width (control)`, () => {
    expect(failing(checkContent(withMap(4 * MIN_WORDS_PER_AD, PHONE_MAP, ['lateral', 'lateral-2'])))).toEqual([]);
  });

  it('refuses one content box more than the words allow on the phone, and only there', () => {
    const site = withMap(3 * MIN_WORDS_PER_AD, PHONE_MAP, ['lateral']);
    expect(failing(checkContent(site))).toEqual([expect.stringMatching(/^Mais conteúdo que anúncio: \/compress-image\/: 4 AdSlot\(s\) a 360 px para 4\d\d palavras/)]);
  });

  it('refuses one box more than the words allow on a computer (the lateral-2 without 600 words), and only there', () => {
    const site = withMap(3 * MIN_WORDS_PER_AD, ['conteudo', 'conteudo-2', 'multiplex'], ['lateral', 'lateral-2']);
    expect(failing(checkContent(site))).toEqual([expect.stringMatching(/^Mais conteúdo que anúncio: \/compress-image\/: 4 AdSlot\(s\) a 1280 px para 4\d\d palavras/)]);
  });
});

describe('gate:prontidao, as páginas de PDF (F5a)', () => {
  const pdfSite = (change: (dir: string) => void = () => {}): Site => makeSite(change, true);
  const fakeOf = (id: string): SitePage => PDF_FAKE.find((page) => page.id === id) as SitePage;
  const MERGE = fakeOf('merge-pdf');
  const HUB = fakeOf(PDF_HUB_ID);
  const home = PAGES.find((page) => page.id === 'home' && page.lang === 'en') as SitePage;
  const allRows = (site: Site): Row[] => [...checkTodayBuild(withoutBoxes(site)), ...checkRequiredPages(site), ...checkNothingUnfinished(site), ...checkContent(site), ...checkPdfPages(site), ...checkCrawlable(site)];

  it('passes a site with the 13 PDF tools, the 2 PDF presets, their hub, cards and search on every item', () => {
    const rows = allRows(pdfSite());
    expect(failing(rows)).toEqual([]);
    // The 14 items of before and the 3 rows of the PDF pages.
    expect(rows).toHaveLength(14 + 3);
    expect(checkPdfPages(pdfSite()).map((entry) => entry.ok)).toEqual([true, true, true]);
    // F18 (decision 5; DECISOES § 725): 13 tools (Organize PDF), the 2 presets and the hub (12 tools and the hub before).
    expect(PDF_FAKE).toHaveLength(PDF_TOOL_IDS.length + PDF_PRESET_IDS.length + 1);
    expect(PDF_TOOL_IDS).toHaveLength(13);
    expect(PDF_PRESET_IDS).toHaveLength(2);
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

  it('looks at every language of the PDF pages (F6): a translated page that drops out of the map or the build fails by name', () => {
    // The fake site with the PDF pages in Portuguese as well, at the paths of the route map.
    const PT_PDF: SitePage[] = PDF_FAKE.map((page) => ({ ...page, lang: 'pt' as const, path: routeById(page.id as Parameters<typeof routeById>[0]).paths.pt ?? '' }));
    const ptSite = (change: (dir: string) => void = () => {}): Site => {
      const site = pdfSite((dir) => {
        for (const page of PT_PDF) write(dir, page.path, pageHtml(page));
        change(dir);
      });
      return { ...site, pages: [...site.pages, ...PT_PDF] };
    };
    // Positive control: every PDF page in both languages passes, and the row says which languages it read.
    const rows = checkPdfPages(ptSite());
    expect(failing(rows)).toEqual([]);
    expect(rows[0]?.how).toContain('em inglês, português');
    // A Portuguese page missing from the map, one missing from the build, and one without an ad area.
    const site = ptSite();
    const noRoute = { ...site, pages: site.pages.filter((page) => !(page.id === 'merge-pdf' && page.lang === 'pt')) };
    expect(failing(checkPdfPages(noRoute))).toEqual(['As páginas de PDF estão no mapa de rotas e no build: merge-pdf: sem página em pt no mapa de rotas']);
    const split = routeById('split-pdf').paths.pt ?? '';
    const gone = ptSite((dir) => rmSync(fileIn(dir, split)));
    expect(failing(checkPdfPages(gone))).toEqual([`As páginas de PDF estão no mapa de rotas e no build: ${split}: não existe no build`]);
    const noAds = { ...site, pages: site.pages.map((page) => (page.id === 'sign-pdf' && page.lang === 'pt' ? { ...page, ads: false } : page)) };
    expect(failing(checkPdfPages(noAds))).toEqual([expect.stringMatching(new RegExp(`${(routeById('sign-pdf').paths.pt ?? '').replace(/\//g, '\\/')}: sem área de anúncio`))]);
    // A Portuguese page with the title of its English page is a repeat, as between two English pages.
    const merge = PT_PDF.find((page) => page.id === 'merge-pdf') as SitePage;
    const twin = ptSite((dir) => write(dir, merge.path, pageHtml(merge).replace(`Title of ${merge.path}`, 'Title of /merge-pdf/')));
    expect(failing(checkPdfPages(twin)).join('\n')).toMatch(/title igual ao de \/merge-pdf\//);
    // The English page stays required on its own: a site whose PDF pages are only in Portuguese fails for English.
    const ptOnly = { ...site, pages: site.pages.filter((page) => !(PDF_FAKE.includes(page))) };
    expect(failing(checkPdfPages(ptOnly)).join('\n')).toContain('merge-pdf: sem página em inglês no mapa de rotas');
  });

  it('checks the cards of the home of each language against what the registries give it (F6)', () => {
    // The Portuguese home of the fake site lists the Portuguese PDF tools; the registry asks for them, so it passes, and
    // the English paths on the Portuguese home are refused.
    const PT_PATHS = PDF_TOOL_IDS.map((id) => routeById(id).paths.pt ?? '');
    const ptHome = PAGES.find((page) => page.id === 'home' && page.lang === 'pt') as SitePage;
    const withPt = (cards: readonly string[]): Site => {
      const site = pdfSite((dir) => {
        for (const path of PT_PATHS) write(dir, path, pageHtml({ id: 'pdf', lang: 'pt', path, indexable: true, ads: true }));
        write(dir, ptHome.path, pageHtml(ptHome, (main) => `${main}${cardsHtml(cards)}`));
      });
      return { ...site, cards: { ...site.cards, home: { ...site.cards?.['home'], pt: PT_PATHS } } };
    };
    expect(failing(checkNothingUnfinished(withPt(PT_PATHS)))).toEqual([]);
    expect(failing(checkNothingUnfinished(withPt(PDF_PATHS))).join('\n')).toMatch(/\/pt\/: cartões fora do registro: \/merge-pdf\/[\s\S]*\/pt\/: faltam os cartões de \/pt\/juntar-pdf\//);
    expect(failing(checkNothingUnfinished(withPt(PT_PATHS.slice(1)))).join('\n')).toMatch(/\/pt\/: faltam os cartões de \/pt\/juntar-pdf\/$/);
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
    expect(failing(checkPdfPages(dense))).toEqual([expect.stringMatching(/^PDF: texto mínimo e mais conteúdo que anúncio: \/merge-pdf\/: 2 AdSlot\(s\) a 360 e 768 e 1280 px para 2\d\d palavras/)]);
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

  // F18 (decision 5; DECISOES § 725 and § 743): the 2 PDF presets are search entries of the registry too, at their paths.
  it('checks that the search has the 13 PDF tools and the 2 PDF presets of the registry, and only those', () => {
    const pathOf = (id: string): string => (Object.hasOwn(PDF_PAGES, id) ? PDF_PAGES[id as keyof typeof PDF_PAGES].path : `/${id}/`);
    const entries = (ids: readonly string[]) => JSON.stringify([{ id: 'compress-image', href: { en: TOOL } }, ...ids.map((id) => ({ id, href: { en: pathOf(id) } }))]);
    const PDF_SEARCH = [...PDF_TOOL_IDS, ...PDF_PRESET_IDS];
    // Today's search has no PDF tool (the PDF pages are not in it yet): the item must say which ones are missing.
    const none = pdfSite((dir) => write(dir, '/search-index.json', entries([])));
    expect(failing(checkNothingUnfinished(none))).toEqual([`Cartões e busca só com o que existe: busca sem ${PDF_SEARCH.join(', ')}`]);
    const one = pdfSite((dir) => write(dir, '/search-index.json', entries(PDF_SEARCH.filter((id) => id !== 'sign-pdf'))));
    expect(failing(checkNothingUnfinished(one))).toEqual(['Cartões e busca só com o que existe: busca sem sign-pdf']);
    const preset = pdfSite((dir) => write(dir, '/search-index.json', entries(PDF_SEARCH.filter((id) => id !== 'pdf-to-jpg-to-png'))));
    expect(failing(checkNothingUnfinished(preset))).toEqual(['Cartões e busca só com o que existe: busca sem pdf-to-jpg-to-png']);
    const extra = pdfSite((dir) => write(dir, '/search-index.json', entries([...PDF_SEARCH, 'pdf-ocr'])));
    expect(failing(checkNothingUnfinished(extra)).join('\n')).toMatch(/busca: pdf-ocr leva a \/pdf-ocr\/, que não existe[\s\S]*busca com itens fora do registro: pdf-ocr/);
    const dangling = pdfSite((dir) => {
      write(dir, '/search-index.json', entries(PDF_SEARCH));
      rmSync(fileIn(dir, '/watermark-pdf/'));
    });
    expect(failing(checkNothingUnfinished(dangling)).join('\n')).toMatch(/busca: watermark-pdf leva a \/watermark-pdf\/, que não existe/);
    expect(failing(checkNothingUnfinished(pdfSite()))).toEqual([]);
  });
});

describe('gate:prontidao, as páginas de casa, saúde e QR (F7, decision 11)', () => {
  const HOUSE_PATHS = LIFE_HUB_IDS.house.map((id) => LIFE_CALC_PAGES[id].path);
  const HEALTH_PATHS = LIFE_HUB_IDS.health.map((id) => LIFE_CALC_PAGES[id].path);
  const QR = '/qr-code-generator/';
  const HUB_PATH: Record<'house' | 'health', string> = { house: '/home-calculators/', health: '/health-calculators/' };
  const LIFE_FAKE: SitePage[] = [
    ...LIFE_CALC_IDS.map((id) => ({ id, lang: 'en' as const, path: LIFE_CALC_PAGES[id].path, indexable: true, ads: true })),
    { id: HOUSE_HUB_ID, lang: 'en' as const, path: HUB_PATH.house, indexable: true, ads: true },
    { id: HEALTH_HUB_ID, lang: 'en' as const, path: HUB_PATH.health, indexable: true, ads: true },
    { id: QR_ID, lang: 'en' as const, path: QR, indexable: true, ads: true },
  ];
  const home = PAGES.find((page) => page.id === 'home' && page.lang === 'en') as SitePage;
  const hubPage = (hub: 'house' | 'health') => LIFE_FAKE.find((page) => page.path === HUB_PATH[hub]) as SitePage;
  const entries = (ids: readonly string[]) =>
    JSON.stringify([{ id: 'compress-image', href: { en: TOOL } }, ...ids.map((id) => ({ id, href: { en: id === QR_ID ? QR : LIFE_CALC_PAGES[id as LifeCalcId].path } }))]);
  /**
   * A fake site with the 14 F7 pages, as the real one has them: the home lists the 11 calculators and the QR code, each hub
   * its calculators in registry order, the search the 11 and the QR code. `change` edits files after they are written.
   */
  const lifeSite = (change: (dir: string) => void = () => {}): Site => {
    const site = makeSite((dir) => {
      for (const page of LIFE_FAKE) write(dir, page.path, pageHtml(page));
      write(dir, home.path, pageHtml(home, (main) => `${main}${cardsHtml([...HOUSE_PATHS, ...HEALTH_PATHS, QR])}`));
      for (const hub of ['house', 'health'] as const) write(dir, HUB_PATH[hub], pageHtml(hubPage(hub), (main) => `${main}${cardsHtml(hub === 'house' ? HOUSE_PATHS : HEALTH_PATHS)}`));
      write(dir, '/search-index.json', entries([...LIFE_CALC_IDS, QR_ID]));
      change(dir);
    });
    return {
      ...site,
      pages: [...site.pages, ...LIFE_FAKE],
      searchIds: [...site.searchIds, ...LIFE_CALC_IDS, QR_ID],
      cards: { home: { en: [...HOUSE_PATHS, ...HEALTH_PATHS, QR] }, [HOUSE_HUB_ID]: { en: HOUSE_PATHS }, [HEALTH_HUB_ID]: { en: HEALTH_PATHS } },
    };
  };

  it('passes a site with the home and health calculators, their hubs, the QR code, cards and search (positive control)', () => {
    const site = lifeSite();
    expect(failing([...checkTodayBuild(withoutBoxes(site)), ...checkRequiredPages(site), ...checkNothingUnfinished(site), ...checkContent(site)])).toEqual([]);
    expect(LIFE_FAKE).toHaveLength(14);
  });

  it('refuses a hub that misses a calculator, lists one of the other hub, or lists a page that does not exist', () => {
    const hub = (which: 'house' | 'health', cards: readonly string[]) => lifeSite((dir) => write(dir, HUB_PATH[which], pageHtml(hubPage(which), (main) => `${main}${cardsHtml(cards)}`)));
    expect(failing(checkNothingUnfinished(hub('house', HOUSE_PATHS.filter((path) => path !== '/tile-calculator/'))))).toEqual([
      'Cartões e busca só com o que existe: /home-calculators/: faltam os cartões de /tile-calculator/',
    ]);
    // A health calculator on the home hub is a card the registry does not ask of it.
    expect(failing(checkNothingUnfinished(hub('house', [...HOUSE_PATHS, '/bmi-calculator/'])))).toEqual([
      'Cartões e busca só com o que existe: /home-calculators/: cartões fora do registro: /bmi-calculator/',
    ]);
    const ghost = failing(checkNothingUnfinished(hub('health', [...HEALTH_PATHS, '/pregnancy-week-by-week/']))).join('\n');
    expect(ghost).toMatch(/\/health-calculators\/: cartão para \/pregnancy-week-by-week\/, que não existe[\s\S]*cartões fora do registro: \/pregnancy-week-by-week\//);
    // The cards come from the registry and its order is the one of the hub (any order of the same cards passes the item).
    expect(failing(checkNothingUnfinished(hub('health', [...HEALTH_PATHS].reverse())))).toEqual([]);
  });

  it('refuses a home without the QR code card, without a health calculator, or with a hub where the registry wants calculators', () => {
    const homeWith = (cards: readonly string[]) => lifeSite((dir) => write(dir, home.path, pageHtml(home, (main) => `${main}${cardsHtml(cards)}`)));
    expect(failing(checkNothingUnfinished(homeWith([...HOUSE_PATHS, ...HEALTH_PATHS])))).toEqual(['Cartões e busca só com o que existe: /: faltam os cartões de /qr-code-generator/']);
    expect(failing(checkNothingUnfinished(homeWith([...HOUSE_PATHS, ...HEALTH_PATHS.slice(1), QR])))).toEqual(['Cartões e busca só com o que existe: /: faltam os cartões de /bmi-calculator/']);
    expect(failing(checkNothingUnfinished(homeWith([...HOUSE_PATHS, ...HEALTH_PATHS, QR, HUB_PATH.health])))).toEqual([
      'Cartões e busca só com o que existe: /: cartões fora do registro: /health-calculators/',
    ]);
  });

  it('refuses a search without the QR code or a calculator, or with a hub, and a QR code card whose page is not in the build', () => {
    const search = (ids: readonly string[]) => lifeSite((dir) => write(dir, '/search-index.json', entries(ids)));
    expect(failing(checkNothingUnfinished(search(LIFE_CALC_IDS)))).toEqual(['Cartões e busca só com o que existe: busca sem qr-code-generator']);
    expect(failing(checkNothingUnfinished(search([...LIFE_CALC_IDS.filter((id) => id !== 'due-date-calculator'), QR_ID])))).toEqual([
      'Cartões e busca só com o que existe: busca sem due-date-calculator',
    ]);
    const withHub = lifeSite((dir) => write(dir, '/search-index.json', JSON.stringify([...JSON.parse(entries([...LIFE_CALC_IDS, QR_ID])), { id: HOUSE_HUB_ID, href: { en: HUB_PATH.house } }])));
    expect(failing(checkNothingUnfinished(withHub))).toEqual(['Cartões e busca só com o que existe: busca com itens fora do registro: home-calculators']);
    const noQrPage = failing(checkNothingUnfinished(lifeSite((dir) => rmSync(fileIn(dir, QR))))).join('\n');
    expect(noQrPage).toMatch(/\/: cartão para \/qr-code-generator\/, que não existe/);
    expect(noQrPage).toMatch(/busca: qr-code-generator leva a \/qr-code-generator\/, que não existe/);
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
