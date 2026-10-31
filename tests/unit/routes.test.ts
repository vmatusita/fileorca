import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGS, ROUTES, languagesOf, pageFileFor, routeById, textFilesFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS } from '../../src/tools/image/texts.ts';
import { fileSize, fmt, percent } from '../../src/i18n/format.ts';
import { filterEntries, normalize } from '../../src/search/search.ts';
import { searchIndex } from '../../src/pages/search-index.json.ts';

function pageFiles(dir = 'src/pages'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry).split('\\').join('/');
    return statSync(path).isDirectory() ? pageFiles(path) : [path];
  });
}

describe('mapa de rotas', () => {
  it('has the routes of the site, each equivalent in en, pt and es except the English-only image pages', () => {
    expect(ROUTES.map((route) => route.id)).toEqual([
      'home', 'compress-image', 'image-tools', 'resize-image', 'crop-image', 'rotate-image', 'heic-to-jpg', 'webp-to-jpg', 'png-to-jpg',
      'image-to-pdf', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail',
      'privacy', 'terms', 'about', 'contact', 'licenses', 'support', 'not-found',
    ]);
    // Only Compress image is translated; the other tools, the presets and the hub exist in English only (DECISOES § 58).
    const englishOnly = new Set(ROUTES.filter((route) => route.adArea === 'arquivos' && route.id !== 'compress-image').map((route) => route.id));
    expect(englishOnly.size).toBe(11);
    for (const route of ROUTES) expect(languagesOf(route), route.id).toEqual(englishOnly.has(route.id) ? ['en'] : [...LANGS]);
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
      const text = JSON.stringify([TEXTS[lang], IMAGE_PANEL_TEXTS[lang], ...Object.values(IMAGE_TOOL_TEXTS).map((texts) => texts[lang] ?? null)]);
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
    let successLines = 0;
    for (const lang of LANGS) {
      const all = strings([TEXTS[lang], IMAGE_PANEL_TEXTS[lang], ...Object.values(IMAGE_TOOL_TEXTS).map((texts) => texts[lang] ?? null)], lang);
      expect(all.length).toBeGreaterThan(100);
      for (const [path, text] of all) {
        expect(text, path).not.toMatch(forbidden);
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
  });
});

describe('tool search', () => {
  const COMPRESS = ['compress-image', 'compress-image-to-100kb', 'compress-image-to-1mb'];
  const ids = (entries: ReturnType<typeof searchIndex>) => entries.map((entry) => entry.id);

  it('indexes every image tool and preset of the registry, once, with a link only where the page exists', () => {
    const index = searchIndex();
    expect(ids(index)).toEqual(Object.keys(IMAGE_PAGES));
    expect(index).toHaveLength(11);
    expect(index[0]?.href).toEqual({ en: '/compress-image/', pt: '/pt/comprimir-imagem/', es: '/es/comprimir-imagen/' });
    for (const entry of index) {
      const route = routeById(entry.id as ImagePageId);
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

  it('normalizes accents and finds synonyms of any language', () => {
    const index = searchIndex();
    expect(normalize('Diminuição')).toBe('diminuicao');
    // 'compress' finds Compress image and its two presets; the synonyms and other languages find the tool.
    expect(ids(filterEntries(index, 'compress'))).toEqual(COMPRESS);
    for (const query of ['reduzir', 'achicar', 'COMPRIMIR imagem']) {
      expect(ids(filterEntries(index, query)), query).toEqual(['compress-image']);
    }
    // 'shrink' is a synonym of both Compress image and Resize image, and of the two compress presets.
    expect(ids(filterEntries(index, 'shrink'))).toEqual(['compress-image', 'resize-image', 'compress-image-to-100kb', 'compress-image-to-1mb']);
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
      ['jpg to pdf', ['image-to-pdf']],
      ['100kb', ['compress-image-to-100kb']],
      ['1280x720', ['resize-image-youtube-thumbnail']],
      ['mirror', ['rotate-image']],
    ];
    for (const [query, found] of expected) expect(ids(filterEntries(index, query)), query).toEqual(found);
    // No AVIF page exists in this release (AVIF to JPG and Convert to WebP are run 2b), so the search must not offer one.
    expect(filterEntries(index, 'avif')).toEqual([]);
  });

  it('shows in each language only the entries that exist in it, and never falls back to English', () => {
    const index = searchIndex();
    // English has all eleven; Portuguese and Spanish only Compress image.
    expect(ids(filterEntries(index, '', 'en'))).toEqual(Object.keys(IMAGE_PAGES));
    for (const lang of ['pt', 'es']) {
      expect(ids(filterEntries(index, '', lang)), lang).toEqual(['compress-image']);
      // A search for 'compress' lists Compress image only: its presets exist in English only.
      expect(ids(filterEntries(index, 'compress', lang)), lang).toEqual(['compress-image']);
      expect(ids(filterEntries(index, 'jpg', lang)), lang).toEqual(['compress-image']);
    }
    // 'heic' finds HEIC to JPG in English and nothing in Portuguese: that page does not exist there.
    expect(ids(filterEntries(index, 'heic', 'en'))).toEqual(['heic-to-jpg']);
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
