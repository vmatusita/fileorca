import { describe, expect, it } from 'vitest';
import { fmt } from '../../src/i18n/format.ts';
import { LANGS, languagesOf, routeById } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../src/tools/image/registry.ts';
import { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS, imageToolTexts } from '../../src/tools/image/texts.ts';
import { blurbOf, chipsFor, crumbsFor, panelData, presetRows, relatedFor } from '../../src/tools/image/page.ts';

const IMAGE_PAGE_IDS = Object.keys(IMAGE_PAGES) as ImagePageId[];

// A tool exists only in English unless it is translated: its texts must follow the route map exactly, so
// there is never a translation for a page that does not exist and never a page without its texts.
describe('texts of the image pages against the route map', () => {
  it('has English texts for every page and the other languages exactly where the page exists', () => {
    for (const id of IMAGE_PAGE_IDS) {
      const languages = Object.keys(IMAGE_TOOL_TEXTS[id]).sort();
      expect(languages, id).toEqual([...languagesOf(routeById(id))].sort());
      expect(IMAGE_TOOL_TEXTS[id].en, id).toBeDefined();
    }
  });

  it('has the panel texts of the shared island in every language', () => {
    for (const lang of LANGS) expect(Object.keys(IMAGE_PANEL_TEXTS[lang]).sort()).toEqual(Object.keys(IMAGE_PANEL_TEXTS.en).sort());
  });

  it('refuses the texts of a page in a language it does not exist in', () => {
    expect(() => imageToolTexts('resize-image', 'pt')).toThrow(/no pt texts/);
    expect(imageToolTexts('compress-image', 'es').h1).toBe('Comprimir imagen');
  });

  it('writes the page names a gate can rely on: the title starts with the H1', () => {
    for (const id of IMAGE_PAGE_IDS) for (const lang of languagesOf(routeById(id))) {
      const texts = imageToolTexts(id, lang);
      expect(texts.title.startsWith(texts.h1), `${id} ${lang}`).toBe(true);
    }
  });
});

describe('what the page hands to the island', () => {
  it('links the next-step chips to tools that exist in the language and falls back to the home', () => {
    for (const id of IMAGE_PAGE_IDS) {
      const chips = chipsFor(id, 'en');
      expect(chips.length, id).toBeGreaterThanOrEqual(2);
      expect(chips.length, id).toBeLessThanOrEqual(4);
      for (const chip of chips) expect(chip.href.endsWith('/'), chip.href).toBe(true);
    }
    const pt = chipsFor('compress-image', 'pt');
    expect(pt).toHaveLength(1);
    expect(pt[0]).toMatchObject({ href: '/pt/', target: 'home', name: 'Mais ferramentas' });
    expect(chipsFor('compress-image', 'es')[0]).toMatchObject({ href: '/es/', target: 'home' });
  });

  it('gives Image to PDF the PDF colour and the other tools the image colour', () => {
    const chips = chipsFor('compress-image', 'en');
    expect(chips.find((chip) => chip.target === 'image-to-pdf')?.category).toBe('pdf');
    expect(chips.find((chip) => chip.target === 'resize-image')?.category).toBe('image');
  });

  it('sends a refused HEIC to the English converter, also from the translated pages, and gives a refused AVIF no link at all', () => {
    expect(panelData('compress-image', 'pt').converters.heic).toEqual({ href: '/heic-to-jpg/', name: 'HEIC to JPG' });
    expect(panelData('compress-image', 'es').converters.heic).toEqual({ href: '/heic-to-jpg/', name: 'HEIC to JPG' });
    for (const lang of ['en', 'pt', 'es'] as const) expect(panelData('compress-image', lang).converters.avif, lang).toBeUndefined();
  });

  it('refuses an AVIF with the line that names what the tool takes, in every language the page exists in, and links to no page', () => {
    const expected = {
      en: "photo.avif is in AVIF format, which this tool doesn't take. Try JPG, PNG or WebP.",
      pt: 'photo.avif é um arquivo AVIF. Tente um arquivo JPG, PNG ou WebP.',
      es: 'photo.avif es un archivo AVIF. Prueba con un archivo JPG, PNG o WebP.',
    } as const;
    for (const id of IMAGE_PAGE_IDS) {
      for (const lang of languagesOf(routeById(id))) {
        const panel = IMAGE_PANEL_TEXTS[lang];
        const { formats } = imageToolTexts(id, lang).panel;
        const line = fmt(panel.errors.wrongFormat, { name: 'photo.avif', format: panel.formats.avif, formats });
        expect(line, `${id} ${lang}`).toContain('photo.avif');
        expect(line, `${id} ${lang}`).toContain(formats);
        expect(line, `${id} ${lang}`).not.toMatch(/[{}]/);
        if (id === 'compress-image') expect(line, lang).toBe(expected[lang]);
        // No converter for AVIF in this release: the island is given no link for it, on any page.
        expect(panelData(id, lang).converters.avif, `${id} ${lang}`).toBeUndefined();
      }
    }
  });

  it('builds the crumbs Home, Image tools, tool and preset in English; Home and tool in the other languages', () => {
    expect(crumbsFor('compress-image-to-100kb', 'en').map((crumb) => crumb.path)).toEqual(['/', '/image-tools/', '/compress-image/', '/compress-image/to-100kb/']);
    expect(crumbsFor('compress-image', 'en').map((crumb) => crumb.path)).toEqual(['/', '/image-tools/', '/compress-image/']);
    expect(crumbsFor('compress-image', 'pt').map((crumb) => crumb.path)).toEqual(['/pt/', '/pt/comprimir-imagem/']);
  });

  it('lists related tools and presets only where they exist', () => {
    expect(relatedFor('compress-image', 'en').length).toBeLessThanOrEqual(6);
    expect(relatedFor('compress-image', 'en').length).toBeGreaterThan(0);
    expect(relatedFor('compress-image', 'pt')).toEqual([]);
    expect(presetRows('compress-image', 'en').map((row) => row.href)).toEqual(['/compress-image/to-100kb/', '/compress-image/to-1mb/']);
    expect(presetRows('compress-image', 'pt')).toEqual([]);
    expect(presetRows('compress-image-to-1mb', 'en')).toEqual([]);
  });

  it('has a blurb for every page in English, and in Portuguese and Spanish for Compress image', () => {
    for (const id of IMAGE_PAGE_IDS) expect(blurbOf(id, 'en')?.name, id).toBeTruthy();
    expect(blurbOf('compress-image', 'pt')?.name).toBe('Comprimir imagem');
    expect(blurbOf('resize-image', 'pt')).toBeUndefined();
    expect(IMAGE_PAGES['image-to-pdf'].pdf).toBe(true);
  });
});
