import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGS, ROUTES, languagesOf, pageFileFor, routeById, textFilesFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS } from '../../src/tools/image/texts.ts';
import { fileSize, fmt, groupDigits, percent } from '../../src/i18n/format.ts';
import { filterEntries, normalize } from '../../src/search/search.ts';
import { searchIndex } from '../../src/pages/search-index.json.ts';
import { CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS, MONEY_HUB_ID } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_PANEL_TEXTS, PDF_TOOL_TEXTS } from '../../src/tools/pdf/texts.ts';
import enPdfTools from '../../src/i18n/en/pdf-tools.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { FILE_SUFFIX } from '../../scripts/lib/design-checks.ts';

function pageFiles(dir = 'src/pages'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry).split('\\').join('/');
    return statSync(path).isDirectory() ? pageFiles(path) : [path];
  });
}

describe('mapa de rotas', () => {
  it('has the routes of the site, each equivalent in en, pt and es except the English-only image and money pages', () => {
    expect(ROUTES.map((route) => route.id)).toEqual([
      'home', 'compress-image', 'image-tools', 'resize-image', 'crop-image', 'rotate-image', 'heic-to-jpg', 'webp-to-jpg', 'png-to-jpg',
      'image-to-pdf', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail',
      MONEY_HUB_ID, ...CALC_PAGE_IDS, ...GUIDE_IDS,
      PDF_HUB_ID, ...PDF_TOOL_IDS,
      ...FILE_GUIDE_IDS,
      'privacy', 'terms', 'about', 'contact', 'licenses', 'support', 'not-found',
    ]);
    // Only Compress image is translated; the other image tools, their presets and hub (DECISOES § 58) and every money
    // page (F4: the hub, the 18 calculators and the 5 guides, DECISOES § 110) exist in English only, and so do the PDF
    // hub and the 12 PDF tools (F5a, in the files area like the image tools).
    const englishOnly = new Set([
      ...ROUTES.filter((route) => route.adArea === 'arquivos' && route.id !== 'compress-image').map((route) => route.id),
      MONEY_HUB_ID,
      ...CALC_PAGE_IDS,
      ...GUIDE_IDS,
    ]);
    // F5b: the 10 file guides, in the files area, are English only too (DECISOES § 190).
    expect(englishOnly.size).toBe(11 + 13 + 10 + 1 + 18 + 5);
    for (const route of ROUTES) expect(languagesOf(route), route.id).toEqual(englishOnly.has(route.id) ? ['en'] : [...LANGS]);
  });

  it('puts every page of the calculator registry, every guide and the money hub in the money ad area, read from the registries', () => {
    // The ids come from the registries, not from the URL: a calculator whose path does not end in "-calculator" is still checked.
    const money = [MONEY_HUB_ID, ...Object.keys(CALC_PAGES), ...Object.keys(GUIDES)];
    expect(money).toHaveLength(1 + 18 + 5);
    for (const id of money) expect(routeById(id as Parameters<typeof routeById>[0]).adArea, id).toBe('dinheiro');
    // And only them: no other route is in the money area (gate:dinheiro-saude checks exactly these pages).
    expect(ROUTES.filter((route) => route.adArea === 'dinheiro').map((route) => route.id).sort()).toEqual([...money].sort());
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

  it('keeps every path unique and leaves the 404 out of the index', () => {
    const paths = ROUTES.flatMap((route) => Object.values(route.paths));
    expect(new Set(paths).size).toBe(paths.length);
    expect(ROUTES.filter((route) => !route.indexable).map((route) => route.id)).toEqual(['not-found']);
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
      const text = JSON.stringify([TEXTS[lang], IMAGE_PANEL_TEXTS[lang], ...Object.values(IMAGE_TOOL_TEXTS).map((texts) => texts[lang] ?? null), ...(lang === 'en' ? [PDF_PANEL_TEXTS, PDF_TOOL_TEXTS, enPdfTools] : [])]);
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
      const all = strings([TEXTS[lang], IMAGE_PANEL_TEXTS[lang], ...Object.values(IMAGE_TOOL_TEXTS).map((texts) => texts[lang] ?? null), ...(lang === 'en' ? [PDF_PANEL_TEXTS, PDF_TOOL_TEXTS, enPdfTools] : [])], lang);
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
    // The image pages first, then the 12 PDF tools of the F5a (English only, PDF category: F5a), then the money
    // calculators and guides of the F4 (English only, money category).
    // F5b: the 10 file guides come last, in the category of their hub (DECISOES § 190).
    expect(ids(index)).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...CALC_PAGE_IDS, ...GUIDE_IDS, ...FILE_GUIDE_IDS]);
    expect(index).toHaveLength(11 + PDF_TOOL_IDS.length + 18 + 5 + FILE_GUIDE_IDS.length);
    expect(index[0]?.href).toEqual({ en: '/compress-image/', pt: '/pt/comprimir-imagem/', es: '/es/comprimir-imagen/' });
    for (const entry of index) {
      const route = routeById(entry.id as ImagePageId);
      if (entry.cat === 'money' || (entry.cat === 'pdf' && (PDF_TOOL_IDS as readonly string[]).includes(entry.id))) expect(languagesOf(route), entry.id).toEqual(['en']);
      // The links, names and categories of an entry are exactly the languages of its route.
      expect(Object.keys(entry.href), entry.id).toEqual(languagesOf(route));
      expect(Object.keys(entry.name), entry.id).toEqual(languagesOf(route));
      expect(Object.keys(entry.category), entry.id).toEqual(languagesOf(route));
      expect(entry.href, entry.id).toEqual(route.paths);
      expect(entry.terms.length, entry.id).toBeGreaterThan(2);
    }
    expect(index.find((entry) => entry.id === 'image-to-pdf')?.cat).toBe('pdf');
    expect(index.find((entry) => entry.id === 'heic-to-jpg')?.cat).toBe('image');
  });

  it('indexes the 12 PDF tools from their registry: the PDF category, the hub order, the route paths and the blurb terms (F5a)', () => {
    const entries = searchIndex().filter((entry) => (PDF_TOOL_IDS as readonly string[]).includes(entry.id));
    expect(ids(entries)).toEqual([...PDF_TOOL_IDS]);
    for (const entry of entries) {
      const id = entry.id as (typeof PDF_TOOL_IDS)[number];
      expect(entry.cat, id).toBe('pdf');
      expect(entry.category, id).toEqual({ en: TEXTS.en.common.search.pdfCategory });
      expect(entry.name, id).toEqual({ en: TEXTS.en.common.pdf?.[id].name });
      expect(entry.href, id).toEqual({ en: routeById(id).paths['en'] });
      expect(entry.icon, id).toBeTruthy();
      for (const synonym of TEXTS.en.common.pdf?.[id].synonyms ?? []) expect(entry.terms, `${id} ${synonym}`).toContain(normalize(synonym));
    }
    // The hubs are not searchable pages: the image hub and the money hub are not in the index, and the PDF hub is not either.
    expect(searchIndex().some((entry) => ['image-tools', MONEY_HUB_ID, PDF_HUB_ID].includes(entry.id))).toBe(false);
    // Each PDF tool is found by its name and by a synonym typed in lower case, and only in English.
    const found = (query: string, lang = 'en') => ids(filterEntries(searchIndex(), query, lang));
    // Image to PDF says "merge images" and "pdf", so it shows too, but after Merge PDF, whose name is the query (DECISOES § 180).
    expect(found('merge pdf')).toEqual(['merge-pdf', 'image-to-pdf']);
    expect(found('combine')).toContain('merge-pdf');
    expect(found('password remover')).toEqual(['unlock-pdf']);
    expect(found('watermark')).toEqual(['watermark-pdf']);
    expect(found('merge pdf', 'pt')).toEqual([]);
    expect(found('merge pdf', 'es')).toEqual([]);
  });

  it('normalizes accents and finds synonyms of any language', () => {
    const index = searchIndex();
    expect(normalize('Diminuição')).toBe('diminuicao');
    // 'compress' finds Compress image and its two presets, and (F5a) Compress PDF after them; the synonyms and other
    // languages find the tool.
    expect(ids(filterEntries(index, 'compress'))).toEqual([...COMPRESS, 'compress-pdf']);
    for (const query of ['reduzir', 'achicar', 'COMPRIMIR imagem']) {
      expect(ids(filterEntries(index, query)), query).toEqual(['compress-image']);
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
    // English has all eleven image pages, the 12 PDF tools (F5a) and the 23 money pages; Portuguese and Spanish only Compress image.
    expect(ids(filterEntries(index, '', 'en'))).toEqual([...Object.keys(IMAGE_PAGES), ...PDF_TOOL_IDS, ...CALC_PAGE_IDS, ...GUIDE_IDS, ...FILE_GUIDE_IDS]);
    for (const lang of ['pt', 'es']) {
      // No money page exists in Portuguese or Spanish yet (F6): 'mortgage' finds nothing there.
      expect(filterEntries(index, 'mortgage', lang), lang).toEqual([]);
      expect(ids(filterEntries(index, '', lang)), lang).toEqual(['compress-image']);
      // A search for 'compress' lists Compress image only: its presets exist in English only.
      expect(ids(filterEntries(index, 'compress', lang)), lang).toEqual(['compress-image']);
      expect(ids(filterEntries(index, 'jpg', lang)), lang).toEqual(['compress-image']);
    }
    // 'heic' finds HEIC to JPG in English and nothing in Portuguese: that page does not exist there.
    // F5b: and the HEIC guide after it (DECISOES § 190).
    expect(ids(filterEntries(index, 'heic', 'en'))).toEqual(['heic-to-jpg', 'guides-heic-to-jpg-on-windows']);
    expect(filterEntries(index, 'heic', 'pt')).toEqual([]);
    expect(filterEntries(index, 'heic', 'es')).toEqual([]);
    // Every result has a name and a link in the language it is shown in.
    for (const lang of LANGS) {
      for (const entry of filterEntries(index, '', lang)) {
        expect(entry.href[lang], `${entry.id} ${lang}`).toBeTruthy();
        expect(entry.name[lang], `${entry.id} ${lang}`).toBeTruthy();
      }
    }
  });
});
