import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGS, QR_ID, ROUTES, languagesOf, pageFileFor, routeById, textFilesFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS } from '../../src/tools/image/texts.ts';
import { fileSize, fmt, groupDigits, percent } from '../../src/i18n/format.ts';
import { filterEntries, normalize } from '../../src/search/search.ts';
import { searchIndex } from '../../src/pages/search-index.json.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGES, CALC_PAGE_IDS, ES_CALC_IDS, GUIDES, GUIDE_IDS, HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS, LIFE_CALC_PAGES, MONEY_HUB_ID, isBrCalc, isLifeCalc, type LifeCalcId } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { FILE_GUIDE_IDS, isFileGuide } from '../../src/tools/guides/registry.ts';
import { FILE_SUFFIX } from '../../scripts/lib/design-checks.ts';
import type { Lang } from '../../src/i18n/routes.ts';

/** The Brazilian money pages (prompt F6, decision 5): pages of their own, in Portuguese only. They join the map together. */
const BR_IDS: readonly string[] = [BR_HUB_ID, ...BR_CALC_IDS];
const isBrPage = (id: string): boolean => BR_IDS.includes(id);
/** The Brazilian rows the map has today: none or all nine (the count is read from the map, never written here). */
const brRoutes = () => ROUTES.filter((route) => isBrPage(route.id));
const ES_IDS: readonly string[] = ES_CALC_IDS;
/** The 14 pages of the F7 (prompt F7, decision 1): the two hubs, the 11 home and health calculators and the QR code generator. */
const LIFE_IDS: readonly string[] = [HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS, QR_ID];
/** The search category of a home or health calculator: the one of its hub (F7, decision 9). */
const CALC_HUB_CATEGORY = (id: LifeCalcId): string => (LIFE_CALC_PAGES[id].hub === 'house' ? enCommon.search.homeCategory : enCommon.search.healthCategory);

/**
 * The languages each page has after the F6 (decisions 2, 4 and 6), from the registries: the image and PDF pages, the
 * home, the institutional pages and the 404 in the three languages; the money hub and the five calculators of ES_CALC_IDS
 * in English and Spanish; the Brazilian pages in Portuguese only; the money presets, the other calculators, the money
 * guides and the file guides in English only. F7 (decision 1): the two hubs, the 11 home and health calculators and the
 * QR code generator in English only, with no pair in hreflang.
 */
function languagesFor(id: string): Lang[] {
  if (isBrPage(id)) return ['pt'];
  if (id === MONEY_HUB_ID || ES_IDS.includes(id)) return ['en', 'es'];
  if (Object.hasOwn(CALC_PAGES, id) || Object.hasOwn(GUIDES, id) || isFileGuide(id)) return ['en'];
  if (LIFE_IDS.includes(id)) return ['en'];
  return [...LANGS];
}

function pageFiles(dir = 'src/pages'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry).split('\\').join('/');
    return statSync(path).isDirectory() ? pageFiles(path) : [path];
  });
}

describe('mapa de rotas', () => {
  it('has the routes of the site, each in the languages of the F6: image and PDF in three, the Spanish money pages paired, the Brazilian ones alone', () => {
    // The Brazilian rows are left out of the order: they join the map in a later step of the F6, all nine at once.
    expect(ROUTES.map((route) => route.id).filter((id) => !isBrPage(id))).toEqual([
      'home', 'compress-image', 'image-tools', 'resize-image', 'crop-image', 'rotate-image', 'heic-to-jpg', 'webp-to-jpg', 'png-to-jpg',
      'image-to-pdf', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail',
      MONEY_HUB_ID, ...CALC_PAGE_IDS, ...GUIDE_IDS,
      PDF_HUB_ID, ...PDF_TOOL_IDS,
      ...FILE_GUIDE_IDS,
      // F7 (decision 1; DECISOES § 259): the two hubs, the 11 home and health calculators in hub order and the QR code
      // generator, after the file guides and before the institutional pages.
      HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS, QR_ID,
      // F8 (DECISOES § 289 and § 290): the offline page and the page of the share target, before the 404.
      'privacy', 'terms', 'about', 'contact', 'licenses', 'support', 'offline', 'open-with', 'not-found',
    ]);
    expect([0, BR_IDS.length], 'the Brazilian money pages join the map together').toContain(brRoutes().length);
    // F7: the hubs and the 11 calculators are the area "casa-saude", and the QR code generator alone is "utilidades".
    expect(LIFE_CALC_IDS).toHaveLength(11);
    expect(ROUTES.filter((route) => route.adArea === 'casa-saude').map((route) => route.id)).toEqual([HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS]);
    expect(ROUTES.filter((route) => route.adArea === 'utilidades').map((route) => route.id)).toEqual([QR_ID]);
    for (const id of LIFE_CALC_IDS) expect(isLifeCalc(id), id).toBe(true);
    // F6 (decisions 2 and 4): every image page, the image hub, the PDF hub and the 12 PDF tools are translations, in the
    // three languages (before the F6 only Compress image was, DECISOES § 58). What stays English only: the 10 file guides
    // (F5b, DECISOES § 190), the 5 money guides, the 4 money presets and the 9 calculators without a Spanish page.
    const everyLanguage = ROUTES.filter((route) => route.adArea === 'arquivos' && !isFileGuide(route.id)).map((route) => route.id);
    expect(everyLanguage).toHaveLength(Object.keys(IMAGE_PAGES).length + 1 + PDF_TOOL_IDS.length + 1);
    for (const id of everyLanguage) expect(languagesOf(routeById(id)), id).toEqual([...LANGS]);
    const englishOnly = ROUTES.filter((route) => languagesFor(route.id).length === 1 && languagesFor(route.id)[0] === 'en').map((route) => route.id);
    // F7 (DECISOES § 259): plus the 14 English-only pages of the F7 (2 hubs, 11 calculators and the QR code generator).
    expect(englishOnly).toHaveLength(FILE_GUIDE_IDS.length + GUIDE_IDS.length + CALC_PAGE_IDS.length - ES_CALC_IDS.length + LIFE_IDS.length);
    expect(LIFE_IDS).toHaveLength(14);
    expect(CALC_PAGE_IDS.length - ES_CALC_IDS.length, 'the English-only calculators and presets').toBe(13);
    for (const route of ROUTES) expect(languagesOf(route), route.id).toEqual(languagesFor(route.id));
  });

  it('puts every page of the calculator registry, every guide and the money hub in the money ad area, read from the registries', () => {
    // The ids come from the registries, not from the URL: a calculator whose path does not end in "-calculator" is still checked.
    const english = [MONEY_HUB_ID, ...Object.keys(CALC_PAGES), ...Object.keys(GUIDES)];
    expect(english).toHaveLength(1 + 18 + 5);
    // F6 (decision 2): the Brazilian pages are in the money area too, read from the map (none or all nine of them).
    const money = [...english, ...brRoutes().map((route) => route.id)];
    for (const id of money) expect(routeById(id as Parameters<typeof routeById>[0]).adArea, id).toBe('dinheiro');
    // And only them: no other route is in the money area (gate:dinheiro-saude checks exactly these pages).
    expect(ROUTES.filter((route) => route.adArea === 'dinheiro').map((route) => route.id).sort()).toEqual([...money].sort());
    for (const route of brRoutes()) expect(isBrCalc(route.id) || route.id === BR_HUB_ID, route.id).toBe(true);
    for (const id of CALC_PAGE_IDS) expect(routeById(id).paths.en, id).toBe(CALC_PAGES[id].path);
    for (const id of GUIDE_IDS) expect(routeById(id).paths.en, id).toBe(GUIDES[id].path);
  });

  it('uses the slugs of DECISOES § 4, English at the root, always with a trailing slash', () => {
    expect(ROUTES.find((route) => route.id === 'support')?.paths).toEqual({ en: '/support/', pt: '/pt/apoie/', es: '/es/apoyo/' });
    expect(ROUTES.find((route) => route.id === 'about')?.paths).toEqual({ en: '/about/', pt: '/pt/sobre/', es: '/es/acerca-de/' });
    for (const route of ROUTES) {
      for (const lang of languagesOf(route)) {
        const path = route.paths[lang] ?? '';
        if (route.id === 'not-found') expect(path).toMatch(/404\.html$/);
        else expect(path.endsWith('/')).toBe(true);
        if (lang === 'en') expect(path.startsWith('/pt/') || path.startsWith('/es/')).toBe(false);
        else expect(path.startsWith(`/${lang}/`)).toBe(true);
      }
    }
  });

  it('keeps every path unique and leaves the 404, the offline page and the share page out of the index', () => {
    const paths = ROUTES.flatMap((route) => Object.values(route.paths));
    expect(new Set(paths).size).toBe(paths.length);
    expect(ROUTES.filter((route) => !route.indexable).map((route) => route.id)).toEqual(['offline', 'open-with', 'not-found']);
    // F8: in the three languages, with the slugs of the glossaries, no ads (DECISOES § 289 and § 290).
    expect(routeById('offline').paths).toEqual({ en: '/offline/', pt: '/pt/offline/', es: '/es/sin-conexion/' });
    expect(routeById('open-with').paths).toEqual({ en: '/open-with/', pt: '/pt/abrir-com/', es: '/es/abrir-con/' });
    expect(routeById('offline').adArea).toBeUndefined();
    expect(routeById('open-with').adArea).toBeUndefined();
  });

  it('has a page file for every route and no page outside the map', () => {
    const expected = ROUTES.flatMap((route) => languagesOf(route).map((lang) => pageFileFor(route.paths[lang] ?? '/')));
    for (const file of expected) expect(existsSync(file), file).toBe(true);
    const pages = pageFiles().filter((file) => file.endsWith('.astro'));
    expect(pages.sort()).toEqual([...expected].sort());
  });

  it('has no page of an account: no sign-in, sign-up, login or profile, the proof of "There is no account" in the launch kit (DECISOES § 205)', () => {
    const ACCOUNT = /(?:^|[/-])(?:login|log-?in|sign-?in|sign-?up|register|account|profile|my-?files|entrar|cadastro|conta|cuenta|registro|perfil)(?:[/-]|$)/i;
    const paths = ROUTES.flatMap((route) => Object.values(route.paths));
    expect(paths.filter((path) => ACCOUNT.test(path))).toEqual([]);
    expect(pageFiles().filter((file) => ACCOUNT.test(file.replace(/^src\/pages/, '').replace(/\/index\.astro$/, '')))).toEqual([]);
    // The rule sees an account page (control).
    expect(ACCOUNT.test('/account/')).toBe(true);
    expect(ACCOUNT.test('/pt/entrar/')).toBe(true);
  });

  it('points every route at its view and text files', () => {
    for (const route of ROUTES) {
      expect(existsSync(route.view), route.view).toBe(true);
      for (const lang of languagesOf(route)) for (const file of textFilesFor(route, lang)) expect(existsSync(file), file).toBe(true);
    }
  });

  it('keeps legal texts equivalent across languages (same sections)', () => {
    for (const page of ['privacy', 'terms'] as const) {
      const shape = (lang: (typeof LANGS)[number]) => TEXTS[lang][page].sections.map((section) => [section.paragraphs.length, section.list?.length ?? 0, section.action ?? '']);
      expect(shape('pt')).toEqual(shape('en'));
      expect(shape('es')).toEqual(shape('en'));
    }
  });

  it('uses the fixed texts of the design system and the plan', () => {
    expect(TEXTS.en.common.seal).toBe('Your files never leave your device');
    expect(TEXTS.pt.common.seal).toBe('Seu arquivo nem sai do aparelho');
    expect(TEXTS.es.common.seal).toBe('Tus archivos nunca salen de tu dispositivo');
    expect(TEXTS.pt.common.footer.coffee).toBe('Curtiu? Me paga um café');
    expect(TEXTS.en.support.h1).toBe('Free tools, made by one person');
    expect(TEXTS.es['not-found'].h1).toBe('Esta página se fue nadando.');
    for (const lang of LANGS) {
      // The texts of the image tools and presets live apart from TEXTS (src/tools/image/texts.ts): they get the same scan.
      // F6: the PDF texts of every language (the PDF hub texts are TEXTS[lang]['pdf-tools']).
      const text = JSON.stringify([TEXTS[lang], IMAGE_PANEL_TEXTS[lang], ...Object.values(IMAGE_TOOL_TEXTS).map((texts) => texts[lang] ?? null), PDF_PANEL_TEXTS[lang], PDF_TOOL_TEXTS[lang]]);
      expect(text).not.toMatch(/→|↔|\bup to 50\b/);
      expect(text).not.toMatch(/\b(seamless|effortless|supercharge|AI-powered|revolutionary|best-in-class)\b/i);
    }
  });

  // F3 (review f-02, DECISOES § 102): every word the design README forbids, with its endings ("supercharged",
  // "magical", "mágica"); no emoji; and the one exclamation of a screen only in the success line of a tool.
  it('keeps the voice of the design README: forbidden words, no emoji, one exclamation only on success', () => {
    const strings = (value: unknown, path: string, out: [string, string][] = []): [string, string][] => {
      if (typeof value === 'string') out.push([path, value]);
      else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) strings(item, `${path}.${key}`, out);
      return out;
    };
    const forbidden = /\b(seamless\w*|effortless\w*|unlock\w*|supercharge\w*|magic\w*|m[áa]gic\w*|ai-powered|revolutionary|best-in-class)\b/i;
    for (const sample of ['Unlock your photos', 'A magical way', 'Supercharged compression', 'Una forma mágica']) expect(sample).toMatch(forbidden);
    // F5a: "Unlock PDF" is the name of a tool (the search term of data/keywords.csv), not the marketing verb the design
    // README forbids: the exact name (and its route id, "unlock-pdf", which the hub's guide names) is taken out before the
    // check, so "unlock" anywhere else still fails (DECISOES § 153).
    const TOOL_NAME = /\bUnlock PDF\b|\bunlock-pdf\b/g;
    for (const sample of ['Open it in Unlock PDF first.', 'Unlock PDF: remove a password']) expect(sample.replace(TOOL_NAME, '')).not.toMatch(forbidden);
    for (const sample of ['Unlock your PDF', 'unlocked files', 'Unlock PDFs fast']) expect(sample.replace(TOOL_NAME, '')).toMatch(forbidden);
    let successLines = 0;
    for (const lang of LANGS) {
      const all = strings([TEXTS[lang], IMAGE_PANEL_TEXTS[lang], ...Object.values(IMAGE_TOOL_TEXTS).map((texts) => texts[lang] ?? null), PDF_PANEL_TEXTS[lang], PDF_TOOL_TEXTS[lang]], lang);
      expect(all.length).toBeGreaterThan(100);
      for (const [path, text] of all) {
        // The English file suffix of Unlock PDF ("-unlocked.pdf") is a file name, not the verb (DECISOES § 215).
        expect(FILE_SUFFIX(path, text).replace(TOOL_NAME, ''), path).not.toMatch(forbidden);
        expect(text.replace(/[©®™]/g, ''), path).not.toMatch(/\p{Extended_Pictographic}/u);
        if (/[!¡]/.test(text)) {
          successLines += 1;
          expect(path, `${path}: exclamação fora da fala de sucesso`).toMatch(/\.(done|doneMany)$/);
          expect(text.match(/!/g)?.length, path).toBe(1);
        }
      }
    }
    expect(successLines, 'the success lines were found').toBeGreaterThan(0);
  });
});

describe('formatting helpers', () => {
  it('fills placeholders and formats percent and sizes per language', () => {
    expect(fmt('Made by {name} in {city}', { name: 'Victor', city: 'Curitiba' })).toBe('Made by Victor in Curitiba');
    expect(fmt('{missing} stays', {})).toBe('{missing} stays');
    expect(percent(67.6, 'en')).toBe('68%');
    expect(percent(67.6, 'es')).toBe('68\u00a0%');
    expect(fileSize(2_400_000, 'en')).toBe('2.4\u00a0MB');
    expect(fileSize(2_400_000, 'pt')).toBe('2,4\u00a0MB');
    expect(fileSize(780_000, 'es')).toBe('780\u00a0KB');
    // Spanish writes sizes as English since the F6 (DECISOES \u00a7 213); it wrote "2,4 MB" before.
    expect(fileSize(2_400_000, 'es')).toBe('2.4\u00a0MB');
    expect(fileSize(999_600, 'en')).toBe('1,000\u00a0KB');
    expect(fileSize(999_600, 'pt')).toBe('1.000\u00a0KB');
    expect(fileSize(312, 'pt')).toBe('312\u00a0B');
    expect(groupDigits(20_000, 'es')).toBe('20,000');
    expect(groupDigits(20_000, 'pt')).toBe('20.000');
  });
});

describe('tool search', () => {
  const COMPRESS = ['compress-image', 'compress-image-to-100kb', 'compress-image-to-1mb'];
  const ids = (entries: ReturnType<typeof searchIndex>) => entries.map((entry) => entry.id);

  it('indexes every image tool and preset of the registry, once, with a link only where the page exists', () => {
    const index = searchIndex();
    // The image pages first, then the 12 PDF tools of the F5a (PDF category), then the money calculators and guides of
    // the F4 (money category; F6: the Brazilian calculators after the English ones, once their rows are in the map).
    // F5b: the 10 file guides come last, in the category of their hub (DECISOES § 190).
    // F7 (decision 9; DECISOES § 259): the 11 home and health calculators in hub order, then the QR code generator, come
    // last, after the file guides (the hubs are not searchable pages, as the money hub is not).
    const br = BR_CALC_IDS.filter((id) => brRoutes().some((route) => route.id === id));
    expect(ids(index)).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...CALC_PAGE_IDS, ...br, ...GUIDE_IDS, ...FILE_GUIDE_IDS, ...LIFE_CALC_IDS, QR_ID]);
    expect(index).toHaveLength(11 + PDF_TOOL_IDS.length + 18 + br.length + 5 + FILE_GUIDE_IDS.length + 11 + 1);
    expect(index[0]?.href).toEqual({ en: '/compress-image/', pt: '/pt/comprimir-imagem/', es: '/es/comprimir-imagen/' });
    for (const entry of index) {
      const route = routeById(entry.id as ImagePageId);
      // F6: an entry has the languages of its page, read from the registries (before, every PDF and money entry was English only).
      expect(languagesOf(route), entry.id).toEqual(languagesFor(entry.id));
      // The links, names and categories of an entry are exactly the languages of its route.
      expect(Object.keys(entry.href), entry.id).toEqual(languagesOf(route));
      expect(Object.keys(entry.name), entry.id).toEqual(languagesOf(route));
      expect(Object.keys(entry.category), entry.id).toEqual(languagesOf(route));
      expect(entry.href, entry.id).toEqual(route.paths);
      expect(entry.terms.length, entry.id).toBeGreaterThan(2);
    }
    expect(index.find((entry) => entry.id === 'image-to-pdf')?.cat).toBe('pdf');
    expect(index.find((entry) => entry.id === 'heic-to-jpg')?.cat).toBe('image');
    // F7 (decision 9): the home and health calculators have the violet of their category and the category of their hub;
    // the QR code generator has the lime of the utilities. None of them, nor the two new hubs, has a page in pt or es.
    for (const id of LIFE_CALC_IDS) {
      const found = index.find((entry) => entry.id === id);
      expect(found?.cat, id).toBe('home');
      expect(found?.category, id).toEqual({ en: CALC_HUB_CATEGORY(id) });
    }
    const qr = index.find((entry) => entry.id === QR_ID);
    expect(qr?.cat).toBe('util');
    expect(qr?.category).toEqual({ en: enCommon.search.utilityCategory });
    expect(qr?.href).toEqual({ en: '/qr-code-generator/' });
    expect(index.some((entry) => [HOUSE_HUB_ID, HEALTH_HUB_ID].includes(entry.id))).toBe(false);
  });

  it('indexes the 12 PDF tools from their registry: the PDF category, the hub order, the route paths and the blurb terms (F5a)', () => {
    const entries = searchIndex().filter((entry) => (PDF_TOOL_IDS as readonly string[]).includes(entry.id));
    expect(ids(entries)).toEqual([...PDF_TOOL_IDS]);
    for (const entry of entries) {
      const id = entry.id as (typeof PDF_TOOL_IDS)[number];
      expect(entry.cat, id).toBe('pdf');
      // F6 (decision 4): the category, the name and the link of each of the three languages (English only before).
      expect(entry.category, id).toEqual(Object.fromEntries(LANGS.map((lang) => [lang, TEXTS[lang].common.search.pdfCategory])));
      expect(entry.name, id).toEqual(Object.fromEntries(LANGS.map((lang) => [lang, TEXTS[lang].common.pdf[id].name])));
      expect(entry.href, id).toEqual(Object.fromEntries(LANGS.map((lang) => [lang, routeById(id).paths[lang]])));
      expect(entry.icon, id).toBeTruthy();
      for (const lang of LANGS) for (const synonym of TEXTS[lang].common.pdf[id].synonyms) expect(entry.terms, `${id} ${lang} ${synonym}`).toContain(normalize(synonym));
    }
    // The hubs are not searchable pages: the image hub and the money hub are not in the index, and the PDF hub is not either.
    expect(searchIndex().some((entry) => ['image-tools', MONEY_HUB_ID, PDF_HUB_ID, BR_HUB_ID].includes(entry.id))).toBe(false);
    // Each PDF tool is found by its name and by a synonym typed in lower case.
    const found = (query: string, lang = 'en') => ids(filterEntries(searchIndex(), query, lang));
    // Image to PDF says "merge images" and "pdf", so it shows too, but after Merge PDF, whose name is the query (DECISOES § 180).
    expect(found('merge pdf')).toEqual(['merge-pdf', 'image-to-pdf']);
    expect(found('combine')).toContain('merge-pdf');
    expect(found('password remover')).toEqual(['unlock-pdf']);
    expect(found('watermark')).toEqual(['watermark-pdf']);
    // F6: in Portuguese and Spanish the tool is found by its name in the language (and by the English one, since the
    // terms of every language are kept), and the result links to the page of that language (it found nothing before).
    for (const lang of ['pt', 'es'] as const) {
      expect(found(TEXTS[lang].common.pdf['merge-pdf'].name, lang)[0], lang).toBe('merge-pdf');
      expect(found('merge pdf', lang)[0], lang).toBe('merge-pdf');
      expect(filterEntries(searchIndex(), 'merge pdf', lang)[0]?.href[lang], lang).toBe(routeById('merge-pdf').paths[lang]);
    }
  });

  it('normalizes accents and finds synonyms of any language', () => {
    const index = searchIndex();
    expect(normalize('Diminuição')).toBe('diminuicao');
    // 'compress' finds Compress image and its two presets, and (F5a) Compress PDF after them; the synonyms and other
    // languages find the tool.
    expect(ids(filterEntries(index, 'compress'))).toEqual([...COMPRESS, 'compress-pdf']);
    // F6: the presets and Compress PDF have Portuguese and Spanish synonyms of their own now, so a synonym of another
    // language finds Compress image first and, after it, only the other compress pages (it found Compress image alone before).
    for (const query of ['reduzir', 'achicar', 'COMPRIMIR imagem']) {
      const result = ids(filterEntries(index, query));
      expect(result[0], query).toBe('compress-image');
      for (const id of result) expect([...COMPRESS, 'compress-pdf'], `${query} ${id}`).toContain(id);
    }
    // 'shrink' is a synonym of both Compress image and Resize image, and of the two compress presets (F5a: and of Compress PDF, "shrink pdf").
    expect(ids(filterEntries(index, 'shrink'))).toEqual(['compress-image', 'resize-image', 'compress-image-to-100kb', 'compress-image-to-1mb', 'compress-pdf']);
    expect(filterEntries(index, 'youtube downloader')).toEqual([]);
  });

  it('finds each new tool by its names and synonyms', () => {
    const index = searchIndex();
    // 'jpg' finds many: every page that takes or makes a JPG.
    const jpg = ids(filterEntries(index, 'jpg'));
    expect(jpg.length).toBeGreaterThanOrEqual(10);
    expect(jpg).toContain('heic-to-jpg');
    expect(jpg).toContain('image-to-pdf');
    expect(ids(filterEntries(index, 'jpeg'))).toEqual(jpg);
    const expected: [string, string[]][] = [
      ['heif', ['heic-to-jpg']],
      ['iphone photo', ['heic-to-jpg']],
      // F5a: PDF to JPG has all three words ("jpg", "to", "pdf") in its names, so it shows after Image to PDF.
      // F5b: the guide on PDF to JPG resolution has the three words too, and shows last (DECISOES § 190).
      ['jpg to pdf', ['image-to-pdf', 'pdf-to-jpg', 'guides-pdf-to-jpg-resolution']],
      ['100kb', ['compress-image-to-100kb']],
      ['1280x720', ['resize-image-youtube-thumbnail']],
      ['mirror', ['rotate-image']],
    ];
    for (const [query, found] of expected) expect(ids(filterEntries(index, query)), query).toEqual(found);
    // No AVIF page exists in this release (AVIF to JPG and Convert to WebP are run 2b), so the search must not offer one.
    expect(filterEntries(index, 'avif')).toEqual([]);
  });

  it('puts first the tool whose name is the query, where Enter goes, before the neighbours that only share its words (DECISOES § 180)', () => {
    const index = searchIndex();
    const first = (query: string) => ids(filterEntries(index, query, 'en'))[0];
    // The names of the PDF tools: Image to PDF has "pdf", "to" and "jpg" in its terms, and used to say "merge" and
    // "combine" (F2, before Merge PDF existed), so it came first and Enter opened the opposite tool.
    for (const query of ['merge pdf', 'Merge PDF', 'merge', 'combine', 'combine pdf']) expect(first(query), query).toBe('merge-pdf');
    for (const query of ['pdf to jpg', 'PDF to JPG', 'pdf to jpeg', 'pdf to image']) expect(first(query), query).toBe('pdf-to-jpg');
    for (const query of ['jpg to pdf', 'image to pdf', 'merge images', 'combine images']) expect(first(query), query).toBe('image-to-pdf');
    // Each one still finds the other as its neighbour, one arrow away.
    // F5b: the guide on PDF to JPG resolution says "pdf to jpg" in its name, so it comes before Image to PDF (DECISOES § 190).
    expect(ids(filterEntries(index, 'pdf to jpg'))).toEqual(['pdf-to-jpg', 'guides-pdf-to-jpg-resolution', 'image-to-pdf']);
    expect(ids(filterEntries(index, 'merge'))).toEqual(['merge-pdf', 'image-to-pdf']);
    // Inside one step the index order holds: every PDF tool says "pdf", and the image pages come first.
    // F5b: then the file guides whose names say PDF, in registry order (DECISOES § 190).
    const pdfGuides = FILE_GUIDE_IDS.filter((id) => /\bpdf/i.test(enCommon.fileGuides[id].name));
    expect(ids(filterEntries(index, 'pdf'))).toEqual(['image-to-pdf', ...PDF_TOOL_IDS, ...pdfGuides]);
  });

  it('shows in each language only the entries that exist in it, and never falls back to English', () => {
    const index = searchIndex();
    // English has all eleven image pages, the 12 PDF tools (F5a) and the 23 money pages. F6: Portuguese and Spanish have
    // the eleven image pages and the 12 PDF tools too (only Compress image before); Spanish has the five calculators of
    // ES_CALC_IDS, and Portuguese the Brazilian ones once their rows are in the map.
    // F7 (decision 9; DECISOES § 259): English ends with the 11 home and health calculators and the QR code generator;
    // Portuguese and Spanish do not change, since none of those pages exists in them.
    const br = BR_CALC_IDS.filter((id) => brRoutes().some((route) => route.id === id));
    expect(ids(filterEntries(index, '', 'en'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...CALC_PAGE_IDS, ...GUIDE_IDS, ...FILE_GUIDE_IDS, ...LIFE_CALC_IDS, QR_ID]);
    expect(ids(filterEntries(index, '', 'pt'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...br]);
    expect(ids(filterEntries(index, '', 'es'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...CALC_PAGE_IDS.filter((id) => ES_IDS.includes(id))]);
    // F7 (decision 9): the synonyms of the new categories find their page in English, and nothing in Portuguese or Spanish,
    // which never fall back to an English page.
    const F7_QUERIES: [string, string][] = [
      ['pregnancy', 'due-date-calculator'],
      ['ac size', 'btu-calculator'],
      ['cubic yards', 'concrete-calculator'],
      ['bmi', 'bmi-calculator'],
      ['qr code', QR_ID],
    ];
    for (const [query, id] of F7_QUERIES) {
      expect(ids(filterEntries(index, query, 'en')), query).toContain(id);
      for (const lang of ['pt', 'es'] as const) expect(ids(filterEntries(index, query, lang)).filter((found) => LIFE_IDS.includes(found)), `${query} ${lang}`).toEqual([]);
    }
    // 'mortgage' finds nothing in Portuguese: the Brazilian pages are adaptations with no English page, so no English term.
    // In Spanish it finds the Spanish mortgage calculator, and none of the English-only presets and guides it finds in English.
    expect(filterEntries(index, 'mortgage', 'pt')).toEqual([]);
    expect(ids(filterEntries(index, 'mortgage', 'es'))).toEqual(['mortgage-calculator']);
    expect(ids(filterEntries(index, 'mortgage', 'en'))).toEqual(expect.arrayContaining(['mortgage-calculator-extra-payments', 'guides-extra-mortgage-payments']));
    for (const lang of ['pt', 'es']) {
      // A search for 'compress' lists Compress image, its presets and Compress PDF, as in English (Compress image alone before).
      expect(ids(filterEntries(index, 'compress', lang)), lang).toEqual([...COMPRESS, 'compress-pdf']);
      // 'jpg' finds what it finds in English, less the file guides, which stay in English only (F5b; prompt F6, decision 4).
      const jpg = ids(filterEntries(index, 'jpg', lang));
      expect(jpg, lang).toEqual(ids(filterEntries(index, 'jpg', 'en')).filter((id) => !isFileGuide(id)));
      expect(jpg.length, lang).toBeGreaterThanOrEqual(10);
    }
    expect(ids(filterEntries(index, 'jpg', 'en')).some((id) => isFileGuide(id))).toBe(true);
    // 'heic' finds HEIC to JPG in English and, since the F6, in Portuguese and Spanish (nothing there before).
    // F5b: the HEIC guide comes after it in English only (DECISOES § 190).
    expect(ids(filterEntries(index, 'heic', 'en'))).toEqual(['heic-to-jpg', 'guides-heic-to-jpg-on-windows']);
    expect(ids(filterEntries(index, 'heic', 'pt'))).toEqual(['heic-to-jpg']);
    expect(ids(filterEntries(index, 'heic', 'es'))).toEqual(['heic-to-jpg']);
    // Every result has a name and a link in the language it is shown in.
    for (const lang of LANGS) {
      for (const entry of filterEntries(index, '', lang)) {
        expect(entry.href[lang], `${entry.id} ${lang}`).toBeTruthy();
        expect(entry.name[lang], `${entry.id} ${lang}`).toBeTruthy();
      }
    }
  });
});
