import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGS, ROUTES, languagesOf, pageFileFor, textFilesFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
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
      'avif-to-jpg', 'convert-to-webp', 'image-to-pdf', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail',
      'privacy', 'terms', 'about', 'contact', 'licenses', 'support', 'not-found',
    ]);
    // Only Compress image is translated; the other tools, the presets and the hub exist in English only (DECISOES § 58).
    const englishOnly = new Set(ROUTES.filter((route) => route.adArea === 'arquivos' && route.id !== 'compress-image').map((route) => route.id));
    expect(englishOnly.size).toBe(13);
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
  it('normalizes accents and finds synonyms of any language', () => {
    const index = searchIndex();
    expect(normalize('Diminuição')).toBe('diminuicao');
    for (const query of ['compress', 'shrink', 'reduzir', 'achicar', 'COMPRIMIR imagem', 'jpg']) {
      expect(filterEntries(index, query).map((entry) => entry.id), query).toEqual(['compress-image']);
    }
    expect(filterEntries(index, 'youtube downloader')).toEqual([]);
    expect(index[0]?.href).toEqual({ en: '/compress-image/', pt: '/pt/comprimir-imagem/', es: '/es/comprimir-imagen/' });
  });
});
