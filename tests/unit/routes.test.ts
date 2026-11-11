import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGS, QR_ID, ROUTES, languagesOf, pageFileFor, routeById, textFilesFor, type RouteId } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS } from '../../src/tools/image/texts.ts';
import { fileSize, fmt, groupDigits, percent } from '../../src/i18n/format.ts';
import { filterEntries, normalize } from '../../src/search/search.ts';
import { searchIndex } from '../../src/pages/search-index.json.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS, HEALTH_HUB_ID, HOUSE_HUB_ID, LIFE_CALC_IDS, LIFE_CALC_PAGES, MONEY_HUB_ID, isBrCalc, isLifeCalc, type LifeCalcId } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PRESET_IDS, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { FILE_GUIDE_IDS, GUIDES_HUB_ID, isFileGuide } from '../../src/tools/guides/registry.ts';
import { FILE_SUFFIX } from '../../scripts/lib/design-checks.ts';
import type { Lang } from '../../src/i18n/routes.ts';

/** The Brazilian money pages (prompt F6, decision 5): pages of their own, in Portuguese only. They join the map together. */
const BR_IDS: readonly string[] = [BR_HUB_ID, ...BR_CALC_IDS];
const isBrPage = (id: string): boolean => BR_IDS.includes(id);
/** The Brazilian rows the map has today: none or all nine (the count is read from the map, never written here). */
const brRoutes = () => ROUTES.filter((route) => isBrPage(route.id));
/**
 * The 13 English-only pages of the F7 (prompt F7, decision 1): the two hubs and the 11 home and health calculators. The QR
 * code generator of the F7 is in the three languages since the languages adjustment (decision 3).
 */
const LIFE_IDS: readonly string[] = [HOUSE_HUB_ID, HEALTH_HUB_ID, ...LIFE_CALC_IDS];
/** The search category of a home or health calculator: the one of its hub (F7, decision 9). */
const CALC_HUB_CATEGORY = (id: LifeCalcId): string => (LIFE_CALC_PAGES[id].hub === 'house' ? enCommon.search.homeCategory : enCommon.search.healthCategory);

/**
 * The languages each page has, from the registries. F6 (decisions 2, 4 and 6): the image and PDF pages, the home, the
 * institutional pages and the 404 in the three languages; the Brazilian pages in Portuguese only. F7 (decision 1): the two
 * hubs and the 11 home and health calculators in English only, with no pair in hreflang. The languages adjustment
 * (decisions 1 to 5): every US money page (the hub, the 14 calculators, the 4 presets and the 5 guides) in English and
 * Spanish, never in Portuguese; the 10 file guides and the QR code generator in the three languages.
 */
function languagesFor(id: string): Lang[] {
  if (isBrPage(id)) return ['pt'];
  if (id === MONEY_HUB_ID || Object.hasOwn(CALC_PAGES, id) || Object.hasOwn(GUIDES, id)) return ['en', 'es'];
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
      // F17 (decision 3; DECISOES § 716): AVIF to JPG and Convert to WebP back where the F2 had them, before Image to PDF.
      'avif-to-jpg', 'convert-to-webp', 'image-to-pdf',
      // F18 (decision 4; DECISOES § 724 and § 743): Remove EXIF data after the ten tools, Flip image after the three presets.
      'remove-exif-data', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail', 'rotate-image-flip',
      MONEY_HUB_ID, ...CALC_PAGE_IDS, ...GUIDE_IDS,
      // F18 (decision 5; DECISOES § 725): the PDF presets after the PDF tools, as the image presets after the image tools.
      PDF_HUB_ID, ...PDF_TOOL_IDS, ...PDF_PRESET_IDS,
      // F11 (decision 5): the guides hub, right before the file guides, as each hub comes before its pages.
      GUIDES_HUB_ID, ...FILE_GUIDE_IDS,
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
    // three languages (before the F6 only Compress image was, DECISOES § 58). The languages adjustment: the 10 file guides
    // too (English only in the F5b, DECISOES § 190), and the QR code generator.
    const everyLanguage = ROUTES.filter((route) => route.adArea === 'arquivos').map((route) => route.id);
    expect(everyLanguage).toHaveLength(Object.keys(IMAGE_PAGES).length + 1 + PDF_TOOL_IDS.length + PDF_PRESET_IDS.length + 1 + FILE_GUIDE_IDS.length);
    for (const id of [...everyLanguage, QR_ID] as RouteId[]) expect(languagesOf(routeById(id)), id).toEqual([...LANGS]);
    // What stays English only: the 13 pages of home and health (F7, decision 1; their trigger is DECISOES § 273).
    const englishOnly = ROUTES.filter((route) => languagesFor(route.id).length === 1 && languagesFor(route.id)[0] === 'en').map((route) => route.id);
    expect(englishOnly).toEqual([...LIFE_IDS]);
    expect(LIFE_IDS).toHaveLength(13);
    // The languages adjustment (decision 4): every calculator and preset and every money guide has its Spanish page, and
    // none of them a Portuguese one.
    for (const id of [MONEY_HUB_ID, ...CALC_PAGE_IDS, ...GUIDE_IDS] as RouteId[]) expect(languagesOf(routeById(id)), id).toEqual(['en', 'es']);
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
    // F12 (decision 7; DECISOES § 441): the coffee texts of PLANO-MELHORIAS section C, where "Curtiu? Me paga um café"
    // and "Free tools, made by one person" were the PLANO's "Doações" ones.
    expect(TEXTS.pt.common.footer.coffee).toBe('Me ajude a manter o FileOrca grátis: paga um café?');
    expect(TEXTS.en.support.h1).toBe('Help Oli keep swimming');
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
          // F13a (D-10; DECISOES § 486): Rotate PDF has two success lines more, doneOne and donePicked.
          expect(path, `${path}: exclamação fora da fala de sucesso`).toMatch(/\.done(?:Many|One|Picked)?$/);
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
    // F18 (decision 5; DECISOES § 725): the 2 PDF presets right after the PDF tools, as the image presets after the image tools.
    expect(ids(index)).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...PDF_PRESET_IDS, ...CALC_PAGE_IDS, ...br, ...GUIDE_IDS, ...FILE_GUIDE_IDS, ...LIFE_CALC_IDS, QR_ID]);
    // F17: 13 image pages (10 tools and 3 presets; 11 before). F18 (DECISOES § 743): 15 (11 tools and 4 presets).
    expect(index).toHaveLength(15 + PDF_TOOL_IDS.length + PDF_PRESET_IDS.length + 18 + br.length + 5 + FILE_GUIDE_IDS.length + 11 + 1);
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
    // none of them, nor the two hubs, has a page in pt or es. The QR code generator has the lime of the utilities, and
    // since the languages adjustment the utilities category and a link in the three languages.
    for (const id of LIFE_CALC_IDS) {
      const found = index.find((entry) => entry.id === id);
      expect(found?.cat, id).toBe('home');
      expect(found?.category, id).toEqual({ en: CALC_HUB_CATEGORY(id) });
    }
    const qr = index.find((entry) => entry.id === QR_ID);
    expect(qr?.cat).toBe('util');
    expect(qr?.category).toEqual(Object.fromEntries(LANGS.map((lang) => [lang, TEXTS[lang].common.search.utilityCategory])));
    expect(qr?.href).toEqual({ en: '/qr-code-generator/', pt: '/pt/gerador-de-qr-code/', es: '/es/generador-de-codigo-qr/' });
    expect(index.some((entry) => [HOUSE_HUB_ID, HEALTH_HUB_ID].includes(entry.id))).toBe(false);
  });

  // F18 (decision 5; DECISOES § 725): and the 2 PDF presets after the 13 tools, with the same category and blurbs.
  it('indexes the 13 PDF tools and the 2 PDF presets from their registry: the PDF category, the hub order, the route paths and the blurb terms (F5a)', () => {
    const pages = [...PDF_TOOL_IDS, ...PDF_PRESET_IDS];
    const entries = searchIndex().filter((entry) => (pages as readonly string[]).includes(entry.id));
    expect(ids(entries)).toEqual(pages);
    for (const entry of entries) {
      const id = entry.id as (typeof pages)[number];
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
      // F18 (decision 9; DECISOES § 743): Flip image says "mirror" too, and comes after its parent, as a preset after its
      // tool ("compress"); "flip image", its name, finds it first.
      ['mirror', ['rotate-image', 'rotate-image-flip']],
      ['flip image', ['rotate-image-flip', 'rotate-image']],
      // F18 (decision 10): Remove EXIF data by the words of its synonyms; Organize PDF before Reorder pages (DECISOES § 724).
      // The file guide on the location of photos says EXIF and GPS too, and comes after the tool, as guides do (§ 190).
      ['exif', ['remove-exif-data', 'guides-remove-location-from-photos']],
      ['organize pdf', ['organize-pdf']],
      // PDF to PNG by its name, then the two pages that share its words (Image to PDF first, in the order of the index, and
      // PDF to JPG, which makes PNG too); Extract pages by its name, and "extract pages" Split PDF first, as a tool before its preset.
      ['pdf to png', ['pdf-to-jpg-to-png', 'image-to-pdf', 'pdf-to-jpg']],
      ['extract pages from pdf', ['split-pdf-extract-pages']],
      ['extract pages', ['split-pdf', 'split-pdf-extract-pages']],
      // F18 (decision 4; DECISOES § 737): Organize PDF says "delete" and "rotate" (the prompt asks it), words of the names of
      // Delete PDF pages and Rotate PDF; each of those says its word too, so the tie goes to the order of the index and the
      // page whose name has the word comes before Organize PDF (Rotate image, an image page, before both, as before the F18).
      ['delete', ['delete-pdf-pages', 'organize-pdf']],
      ['rotate', ['rotate-image', 'rotate-pdf', 'organize-pdf']],
      // F17 (decision 9; DECISOES § 716): the AVIF pages of the F2 are back. "avif" finds AVIF to JPG (its name) and then
      // Convert to WebP (a synonym: it makes AVIF too), as before the 3812f49; it found nothing from the F2 to the F16.
      ['avif', ['avif-to-jpg', 'convert-to-webp']],
      ['convert to avif', ['convert-to-webp', 'avif-to-jpg']],
    ];
    for (const [query, found] of expected) expect(ids(filterEntries(index, query)), query).toEqual(found);
    // F18 (DECISOES § 737): the verb of the name of Delete PDF pages and of Rotate PDF finds that page before Organize PDF,
    // whatever the language of the page and of the word (the search joins the terms of the three languages).
    const before: [string, string][] = [
      ['delete', 'delete-pdf-pages'], ['excluir', 'delete-pdf-pages'], ['eliminar', 'delete-pdf-pages'],
      ['rotate', 'rotate-pdf'], ['girar', 'rotate-pdf'], ['rotar', 'rotate-pdf'],
    ];
    for (const lang of LANGS) {
      for (const [query, page] of before) {
        const found = ids(filterEntries(index, query, lang));
        expect(found, `${query} ${lang}`).toContain(page);
        if (found.includes('organize-pdf')) expect(found.indexOf(page), `${query} ${lang}: ${found.join(', ')}`).toBeLessThan(found.indexOf('organize-pdf'));
      }
    }
    // In each language, "avif" finds the two, each at the page of that language.
    for (const lang of LANGS) {
      const avif = filterEntries(index, 'avif', lang);
      expect(ids(avif), lang).toEqual(['avif-to-jpg', 'convert-to-webp']);
      expect(avif.map((entry) => entry.href[lang]), lang).toEqual([routeById('avif-to-jpg').paths[lang], routeById('convert-to-webp').paths[lang]]);
      // The WebP pages: Convert to WebP joins the tools that take or make a WebP.
      expect(ids(filterEntries(index, 'webp', lang)), lang).toContain('convert-to-webp');
    }
  });

  it('puts first the tool whose name is the query, where Enter goes, before the neighbours that only share its words (DECISOES § 180)', () => {
    const index = searchIndex();
    const first = (query: string, lang = 'en') => ids(filterEntries(index, query, lang))[0];
    // The names of the PDF tools: Image to PDF has "pdf", "to" and "jpg" in its terms, and used to say "merge" and
    // "combine" (F2, before Merge PDF existed), so it came first and Enter opened the opposite tool.
    for (const query of ['merge pdf', 'Merge PDF', 'merge', 'combine', 'combine pdf']) expect(first(query), query).toBe('merge-pdf');
    for (const query of ['pdf to jpg', 'PDF to JPG', 'pdf to jpeg', 'pdf to image']) expect(first(query), query).toBe('pdf-to-jpg');
    for (const query of ['jpg to pdf', 'image to pdf', 'merge images', 'combine images']) expect(first(query), query).toBe('image-to-pdf');
    // F17: the two tools of the run 2b, by their names in each language; WebP to JPG, whose words "Convert to WebP"
    // shares, stays one arrow away.
    for (const lang of LANGS) {
      for (const id of ['avif-to-jpg', 'convert-to-webp'] as const) {
        const name = TEXTS[lang].common.tools[id].name;
        expect(ids(filterEntries(index, name, lang))[0], `${name} ${lang}`).toBe(id);
      }
    }
    expect(ids(filterEntries(index, 'convert to webp'))).toEqual(['convert-to-webp', 'webp-to-jpg']);
    // Each one still finds the other as its neighbour, one arrow away.
    // F5b: the guide on PDF to JPG resolution says "pdf to jpg" in its name, so it comes before Image to PDF (DECISOES § 190).
    expect(ids(filterEntries(index, 'pdf to jpg'))).toEqual(['pdf-to-jpg', 'guides-pdf-to-jpg-resolution', 'image-to-pdf']);
    expect(ids(filterEntries(index, 'merge'))).toEqual(['merge-pdf', 'image-to-pdf']);
    // Inside one step the index order holds: every PDF tool says "pdf", and the image pages come first.
    // F5b: then the file guides whose names say PDF, in registry order (DECISOES § 190).
    const pdfGuides = FILE_GUIDE_IDS.filter((id) => /\bpdf/i.test(enCommon.fileGuides[id].name));
    // F18 (decision 5; DECISOES § 743): and the PDF presets after the tools, in the same step.
    expect(ids(filterEntries(index, 'pdf'))).toEqual(['image-to-pdf', ...PDF_TOOL_IDS, ...PDF_PRESET_IDS, ...pdfGuides]);
    // F18 (decision 4; DECISOES § 724): each of the five pages of the run is the first by its name, in each language.
    for (const lang of LANGS) {
      for (const id of ['remove-exif-data', 'rotate-image-flip'] as const) expect(first(TEXTS[lang].common.tools[id].name, lang), `${id} ${lang}`).toBe(id);
      for (const id of ['organize-pdf', 'split-pdf-extract-pages', 'pdf-to-jpg-to-png'] as const) expect(first(TEXTS[lang].common.pdf[id].name, lang), `${id} ${lang}`).toBe(id);
    }
  });

  it('shows in each language only the entries that exist in it, and never falls back to English', () => {
    const index = searchIndex();
    // English has all thirteen image pages (eleven before the F17), the 12 PDF tools (F5a) and the 23 money pages. F6:
    // Portuguese and Spanish have the image pages and the 12 PDF tools too (only Compress image before), and Portuguese the
    // Brazilian ones.
    // F7 (decision 9; DECISOES § 259): English ends with the 11 home and health calculators and the QR code generator.
    // The languages adjustment: Spanish has the 18 calculator pages and the 5 money guides; Portuguese and Spanish have the
    // 10 file guides and the QR code generator; the home and health pages stay out of both.
    const br = BR_CALC_IDS.filter((id) => brRoutes().some((route) => route.id === id));
    // F18 (DECISOES § 743): the 2 PDF presets after the PDF tools, in the three languages.
    expect(ids(filterEntries(index, '', 'en'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...PDF_PRESET_IDS, ...CALC_PAGE_IDS, ...GUIDE_IDS, ...FILE_GUIDE_IDS, ...LIFE_CALC_IDS, QR_ID]);
    expect(ids(filterEntries(index, '', 'pt'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...PDF_PRESET_IDS, ...br, ...FILE_GUIDE_IDS, QR_ID]);
    expect(ids(filterEntries(index, '', 'es'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...PDF_PRESET_IDS, ...CALC_PAGE_IDS, ...GUIDE_IDS, ...FILE_GUIDE_IDS, QR_ID]);
    // F7 (decision 9): the synonyms of the home and health categories find their page in English, and nothing in
    // Portuguese or Spanish, which never fall back to an English page.
    const F7_QUERIES: [string, string][] = [
      ['pregnancy', 'due-date-calculator'],
      ['ac size', 'btu-calculator'],
      ['cubic yards', 'concrete-calculator'],
      ['bmi', 'bmi-calculator'],
    ];
    for (const [query, id] of F7_QUERIES) {
      expect(ids(filterEntries(index, query, 'en')), query).toContain(id);
      for (const lang of ['pt', 'es'] as const) expect(ids(filterEntries(index, query, lang)).filter((found) => LIFE_IDS.includes(found)), `${query} ${lang}`).toEqual([]);
    }
    // The QR code generator is found in the three languages, by the words of each (languages adjustment, decision 6), and
    // links to the page of the language.
    for (const [query, lang] of [['qr code', 'en'], ['código qr', 'pt'], ['gerar qr code', 'pt'], ['código qr', 'es'], ['generar qr', 'es'], ['crear código qr', 'es']] as const) {
      const found = filterEntries(index, query, lang);
      expect(found[0]?.id, `${query} ${lang}`).toBe(QR_ID);
      expect(found[0]?.href[lang], `${query} ${lang}`).toBe(routeById(QR_ID).paths[lang]);
    }
    // 'mortgage' finds nothing in Portuguese: the Brazilian pages are adaptations with no English page, so no English term,
    // and no US money page exists in Portuguese. Since the languages adjustment Spanish finds what English finds: the
    // calculator, its presets and its guides, each at its Spanish page.
    expect(filterEntries(index, 'mortgage', 'pt')).toEqual([]);
    expect(ids(filterEntries(index, 'mortgage', 'en'))).toEqual(expect.arrayContaining(['mortgage-calculator-extra-payments', 'guides-extra-mortgage-payments']));
    expect([...ids(filterEntries(index, 'mortgage', 'es'))].sort()).toEqual([...ids(filterEntries(index, 'mortgage', 'en'))].sort());
    for (const lang of ['pt', 'es']) {
      // A search for 'compress' lists Compress image, its presets and Compress PDF, as in English (Compress image alone before).
      expect(ids(filterEntries(index, 'compress', lang)), lang).toEqual([...COMPRESS, 'compress-pdf']);
      // 'jpg' finds what it finds in English, the file guides included since the languages adjustment (F5b and F6 kept them out).
      const jpg = ids(filterEntries(index, 'jpg', lang));
      expect([...jpg].sort(), lang).toEqual([...ids(filterEntries(index, 'jpg', 'en'))].sort());
      expect(jpg.some((id) => isFileGuide(id)), lang).toBe(true);
    }
    // 'heic' finds HEIC to JPG, then the HEIC guide (DECISOES § 190), in the three languages since the languages adjustment.
    for (const lang of LANGS) expect(ids(filterEntries(index, 'heic', lang)), lang).toEqual(['heic-to-jpg', 'guides-heic-to-jpg-on-windows']);
    // Every result has a name and a link in the language it is shown in.
    for (const lang of LANGS) {
      for (const entry of filterEntries(index, '', lang)) {
        expect(entry.href[lang], `${entry.id} ${lang}`).toBeTruthy();
        expect(entry.name[lang], `${entry.id} ${lang}`).toBeTruthy();
      }
    }
  });
});
