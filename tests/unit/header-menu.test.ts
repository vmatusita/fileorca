// The Menu of the header (F11, decision 3; DECISOES § 388 and § 389): the map of each route to the section its page marks
// with aria-current, the counts read from the registries, the rows of each language and the language links. The rendered
// Menu is checked in the dist by tests/e2e/header-links.spec.ts and in the browser by tests/e2e/header-menu.spec.ts.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { HTMLElement, parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import Header from '../../src/components/Header.astro';
import { MENU_GROUPS, MENU_SECTIONS, NO_SECTION, languageLinks, menuGroups, sectionCount, sectionOf, sectionPage, sectionsOfRoutes } from '../../src/components/header-menu.ts';
import { LANGS, QR_ID, ROUTES, moneyHubId, pagePath, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGE_IDS, GUIDE_IDS, HEALTH_CALC_IDS, HEALTH_HUB_ID, HOUSE_CALC_IDS, HOUSE_HUB_ID, HUB_MONEY_IDS, MONEY_HUB_ID } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDE_IDS, GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';
import { hubGuides } from '../../src/tools/guides/hub.ts';

describe('the section of each route (aria-current in the Menu)', () => {
  it('puts every route of the map in exactly one section, or in the closed list of pages without one', () => {
    const rows = sectionsOfRoutes();
    expect(rows.map((row) => row.id)).toEqual(ROUTES.map((route) => route.id));
    const without = rows.filter((row) => row.section === null).map((row) => row.id);
    expect([...without].sort()).toEqual([...NO_SECTION].sort());
    // Each own page is the page of exactly one section.
    const own = rows.filter((row) => row.section?.current === 'page').map((row) => row.id).sort();
    expect(own).toEqual(['image-tools', PDF_HUB_ID, MONEY_HUB_ID, BR_HUB_ID, HOUSE_HUB_ID, HEALTH_HUB_ID, QR_ID, GUIDES_HUB_ID, 'support'].sort());
  });

  it('marks the hub with "page" and a page of the category with "true"', () => {
    const expect_ = (ids: readonly RouteId[], section: string, current: 'page' | 'true') => {
      for (const id of ids) expect(sectionOf(id), id).toEqual({ section, current });
    };
    expect_(['image-tools'], 'image', 'page');
    expect_([...IMAGE_TOOL_IDS, ...IMAGE_PRESET_IDS], 'image', 'true');
    expect_([PDF_HUB_ID], 'pdf', 'page');
    expect_(PDF_TOOL_IDS, 'pdf', 'true');
    expect_([MONEY_HUB_ID, BR_HUB_ID], 'money', 'page');
    expect_([...CALC_PAGE_IDS, ...BR_CALC_IDS], 'money', 'true');
    expect_([HOUSE_HUB_ID], 'house', 'page');
    expect_(HOUSE_CALC_IDS, 'house', 'true');
    expect_([HEALTH_HUB_ID], 'health', 'page');
    expect_(HEALTH_CALC_IDS, 'health', 'true');
    expect_([QR_ID], 'qr', 'page');
    expect_(['support'], 'support', 'page');
    expect_([GUIDES_HUB_ID], 'guides', 'page');
  });

  it('marks Guides on every guide, never the category of the tool or calculator the guide is about', () => {
    for (const id of [...FILE_GUIDE_IDS, ...GUIDE_IDS]) expect(sectionOf(id), id).toEqual({ section: 'guides', current: 'true' });
  });

  it('marks nothing on the home and the institutional pages', () => {
    for (const id of NO_SECTION) expect(sectionOf(id), id).toBeNull();
  });
});

describe('the rows of the Menu in each language', () => {
  const t = (lang: Lang) => TEXTS[lang].common;

  it('reads every count from the registries, never by hand', () => {
    for (const lang of LANGS) {
      const existing = (ids: readonly RouteId[]) => ids.filter((id) => pagePath(id, lang)).length;
      expect(sectionCount('image', lang), lang).toBe(existing(IMAGE_TOOL_IDS));
      expect(sectionCount('pdf', lang), lang).toBe(existing(PDF_TOOL_IDS));
      expect(sectionCount('money', lang), lang).toBe(HUB_MONEY_IDS[lang].length);
      expect(sectionCount('house', lang), lang).toBe(existing(HOUSE_CALC_IDS));
      expect(sectionCount('health', lang), lang).toBe(existing(HEALTH_CALC_IDS));
      expect(sectionCount('guides', lang), lang).toBe(hubGuides(lang).length);
      expect(sectionCount('qr', lang)).toBeNull();
      expect(sectionCount('support', lang)).toBeNull();
    }
    // The money row counts the cards of the language's money hub: the Brazilian eight in Portuguese.
    expect(sectionCount('money', 'pt')).toBe(BR_CALC_IDS.length);
  });

  it('lists only the sections whose page exists in the language, in the order of the sheet, the counts in its format', () => {
    for (const lang of LANGS) {
      const groups = menuGroups(lang, 'home', t(lang));
      const sections = groups.flat().map((row) => row.section);
      const exists = MENU_SECTIONS.filter((section) => pagePath(sectionPage(section, lang), lang) !== undefined);
      expect(sections, lang).toEqual(exists);
      expect(groups.map((group) => group.map((row) => row.section)), lang).toEqual(MENU_GROUPS.map((group) => group.filter((section) => exists.includes(section))));
      for (const row of groups.flat()) {
        expect(row.href, `${lang} ${row.section}`).toBe(pagePath(sectionPage(row.section, lang), lang));
        expect(row.current, `${lang} ${row.section}`).toBeUndefined();
      }
      const money = groups.flat().find((row) => row.section === 'money');
      expect(money?.href, lang).toBe(pagePath(moneyHubId(lang), lang));
      expect(money?.meta, lang).toBe(fmt(t(lang).header.menuCalculators, { n: groupDigits(HUB_MONEY_IDS[lang].length, lang) }));
      const guides = groups.flat().find((row) => row.section === 'guides');
      expect(guides?.meta, lang).toBe(fmt(t(lang).header.menuGuides, { n: groupDigits(hubGuides(lang).length, lang) }));
      expect(guides?.name, lang).toBe(t(lang).guidesHub);
      const support = groups.flat().find((row) => row.section === 'support');
      expect([support?.name, support?.meta, support?.href], lang).toEqual([t(lang).header.support, t(lang).header.supportMeta, pagePath('support', lang)]);
    }
    // English has the home and health hubs; Portuguese and Spanish do not.
    expect(menuGroups('en', 'home', t('en')).flat().map((row) => row.section)).toEqual([...MENU_SECTIONS]);
    for (const lang of ['pt', 'es'] as const) expect(menuGroups(lang, 'home', t(lang)).flat().map((row) => row.section), lang).toEqual(['image', 'pdf', 'money', 'qr', 'guides', 'support']);
  });

  it('marks the section of the page, and only it', () => {
    const marked = (lang: Lang, id: RouteId) => menuGroups(lang, id, t(lang)).flat().filter((row) => row.current).map((row) => [row.section, row.current]);
    expect(marked('en', 'image-tools')).toEqual([['image', 'page']]);
    expect(marked('pt', 'compress-image')).toEqual([['image', 'true']]);
    expect(marked('pt', BR_HUB_ID)).toEqual([['money', 'page']]);
    expect(marked('es', 'mortgage-calculator')).toEqual([['money', 'true']]);
    expect(marked('en', FILE_GUIDE_IDS[0])).toEqual([['guides', 'true']]);
    expect(marked('es', GUIDE_IDS[0])).toEqual([['guides', 'true']]);
    expect(marked('pt', GUIDES_HUB_ID)).toEqual([['guides', 'page']]);
    expect(marked('en', 'support')).toEqual([['support', 'page']]);
    expect(marked('en', 'privacy')).toEqual([]);
  });
});

describe('the language links (the language menu and the end of the Menu)', () => {
  it('lead to the equivalent page, or to the home of a language without one, with the hreflang and lang of the language', () => {
    const english = routeById(HOUSE_CALC_IDS[0]);
    expect(languageLinks(english, 'en', TEXTS.en.common).map((link) => [link.code, link.href, link.tag, link.current])).toEqual([
      ['en', english.paths.en, 'en', true],
      ['pt', '/pt/', 'pt-BR', false],
      ['es', '/es/', 'es', false],
    ]);
    const guide = routeById(FILE_GUIDE_IDS[0]);
    expect(languageLinks(guide, 'pt', TEXTS.pt.common).map((link) => link.href)).toEqual([guide.paths.en, guide.paths.pt, guide.paths.es]);
    // A page out of the sitemaps (the offline page) leads to the homes.
    expect(languageLinks(routeById('offline'), 'es', TEXTS.es.common).map((link) => link.href)).toEqual(['/', '/pt/', '/es/']);
  });
});

describe('the Header rendered', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });
  const render = async (lang: Lang, id: RouteId) =>
    parse(await container.renderToString(Header as Parameters<AstroContainer['renderToString']>[0], { props: { lang, route: routeById(id), t: TEXTS[lang].common } }));

  it('has, in order, logo, search, language button and menu, theme button, status region, Menu button and its sheet right after it', async () => {
    const header = (await render('es', 'compress-image')).querySelector('header.fo-header');
    const names = (header?.childNodes ?? [])
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .map((element) => `${element.rawTagName}.${(element.getAttribute('class') ?? '').split(' ')[0]}`);
    expect(names).toEqual(['a.fo-header__logo', 'button.fo-header__search', 'button.fo-header__lang', 'nav.fo-langmenu', 'button.fo-header__theme', 'span.fo-sr', 'button.fo-header__menu', 'nav.fo-menu']);
  });

  it('names the theme button by state and the Menu in each language, and carries the Support Oli event with the place menu', async () => {
    for (const lang of LANGS) {
      const root = await render(lang, 'home');
      const theme = TEXTS[lang].common.header.theme;
      expect(root.querySelectorAll('.fo-header__theme .fo-sr').map((node) => node.text), lang).toEqual([theme.system, theme.light, theme.dark]);
      expect(root.querySelector('[role="status"][data-theme-status]')?.text, lang).toBe('');
      expect(root.querySelector('.fo-header__menu-text')?.text, lang).toBe(TEXTS[lang].common.header.menu);
      expect(root.querySelector('#fo-menu')?.getAttribute('aria-label'), lang).toBe(TEXTS[lang].common.header.menu);
      expect(root.querySelector('.fo-header__menu')?.getAttribute('popovertarget')).toBe('fo-menu');
      const support = root.querySelector(`#fo-menu a[href="${pagePath('support', lang)}"]`);
      expect([support?.getAttribute('data-track'), support?.getAttribute('data-track-place')], lang).toEqual(['donate_click', 'menu']);
      // Never aria-current="false": the row of another section has no attribute at all.
      expect(root.querySelectorAll('[aria-current="false"]'), lang).toHaveLength(0);
    }
    expect((await render('es', 'home')).querySelector('.fo-header__menu-text')?.text).toBe('Menú');
    expect((await render('pt', 'home')).querySelectorAll('.fo-header__theme .fo-sr').map((node) => node.text)).toEqual(['Tema: sistema', 'Tema: claro', 'Tema: escuro']);
  });

  it('puts the theme script right after the header', async () => {
    const html = await container.renderToString(Header as Parameters<AstroContainer['renderToString']>[0], { props: { lang: 'en', route: routeById('home'), t: TEXTS.en.common } });
    expect(html).toMatch(/<\/header>\s*<script>\(function\(\)\{var d=document\.documentElement/);
  });
});
