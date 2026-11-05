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

  it('gives each page the texts of its own language, now that every page exists in the three (F6, decision 4)', () => {
    // Before the F6 a page without a translation had no texts there, and imageToolTexts refused it ('no pt texts'). Every
    // image page is in the three languages now, so the map has no gap to refuse (the type makes a missing language fail
    // to compile): each language gets its own file, never the English one standing in.
    for (const id of IMAGE_PAGE_IDS) {
      expect(languagesOf(routeById(id)), id).toEqual([...LANGS]);
      for (const lang of LANGS) expect(imageToolTexts(id, lang), `${id} ${lang}`).toBe(IMAGE_TOOL_TEXTS[id][lang]);
      expect(imageToolTexts(id, 'pt'), id).not.toBe(imageToolTexts(id, 'en'));
      expect(imageToolTexts(id, 'es'), id).not.toBe(imageToolTexts(id, 'en'));
    }
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
    // F6: every image tool exists in Portuguese and Spanish, so the chips there are the English ones, each with the path and
    // the name of the language (before, Compress image had only the home chip in pt and es). The home chip stays the
    // fallback for a page with no tool to offer in its language, with the text of the panel.
    for (const id of IMAGE_PAGE_IDS) {
      const targets = chipsFor(id, 'en').map((chip) => chip.target);
      for (const lang of ['pt', 'es'] as const) {
        const chips = chipsFor(id, lang);
        expect(chips.map((chip) => chip.target), `${id} ${lang}`).toEqual(targets);
        for (const chip of chips) {
          expect(chip.href, `${id} ${lang}`).toBe(routeById(chip.target as ImagePageId).paths[lang]);
          expect(chip.href.startsWith(`/${lang}/`), chip.href).toBe(true);
          expect(chip.name, `${id} ${lang}`).toBe(blurbOf(chip.target as ImagePageId, lang)?.name);
        }
      }
    }
    expect(IMAGE_PANEL_TEXTS.pt.next.moreTools).toBe('Mais ferramentas');
  });

  it('gives Image to PDF the PDF colour and the other tools the image colour', () => {
    const chips = chipsFor('compress-image', 'en');
    expect(chips.find((chip) => chip.target === 'image-to-pdf')?.category).toBe('pdf');
    expect(chips.find((chip) => chip.target === 'resize-image')?.category).toBe('image');
  });

  it('sends a refused HEIC to the converter of the page language, and gives a refused AVIF no link at all', () => {
    expect(panelData('compress-image', 'en').converters.heic).toEqual({ href: '/heic-to-jpg/', name: 'HEIC to JPG' });
    // F6: HEIC to JPG exists in Portuguese and Spanish, so the translated pages send there (to the English page before).
    expect(panelData('compress-image', 'pt').converters.heic).toEqual({ href: '/pt/heic-para-jpg/', name: 'HEIC para JPG' });
    expect(panelData('compress-image', 'es').converters.heic).toEqual({ href: '/es/heic-a-jpg/', name: 'HEIC a JPG' });
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

  it('builds the crumbs Home, Image tools, tool and preset in every language (F6: the hub exists in pt and es now)', () => {
    expect(crumbsFor('compress-image-to-100kb', 'en').map((crumb) => crumb.path)).toEqual(['/', '/image-tools/', '/compress-image/', '/compress-image/to-100kb/']);
    expect(crumbsFor('compress-image', 'en').map((crumb) => crumb.path)).toEqual(['/', '/image-tools/', '/compress-image/']);
    // Before the F6 the Portuguese crumbs were Home and the tool, with no hub to point to.
    expect(crumbsFor('compress-image', 'pt').map((crumb) => crumb.path)).toEqual(['/pt/', '/pt/ferramentas-de-imagem/', '/pt/comprimir-imagem/']);
    expect(crumbsFor('compress-image-to-100kb', 'es').map((crumb) => crumb.path)).toEqual(['/es/', '/es/herramientas-de-imagen/', '/es/comprimir-imagen/', '/es/comprimir-imagen/a-100kb/']);
    for (const lang of LANGS) {
      for (const id of IMAGE_PAGE_IDS) {
        const crumbs = crumbsFor(id, lang);
        expect(crumbs.at(-1)?.path, `${id} ${lang}`).toBe(routeById(id).paths[lang]);
        expect(crumbs[1]?.path, `${id} ${lang}`).toBe(routeById('image-tools').paths[lang]);
      }
    }
  });

  it('lists related tools and presets only where they exist', () => {
    expect(relatedFor('compress-image', 'en').length).toBeLessThanOrEqual(6);
    expect(relatedFor('compress-image', 'en').length).toBeGreaterThan(0);
    expect(presetRows('compress-image', 'en').map((row) => row.href)).toEqual(['/compress-image/to-100kb/', '/compress-image/to-1mb/']);
    expect(presetRows('compress-image-to-1mb', 'en')).toEqual([]);
    // F6: the related tools and the presets exist in Portuguese and Spanish now, so the grid and the table there are the
    // English ones, each with the path of the language (both were empty before).
    const idOfEnglishPath = new Map(IMAGE_PAGE_IDS.map((id) => [routeById(id).paths.en, id]));
    for (const lang of ['pt', 'es'] as const) {
      for (const id of IMAGE_PAGE_IDS) {
        const related = relatedFor(id, lang);
        const english = relatedFor(id, 'en').map((card) => idOfEnglishPath.get(card.href));
        expect(related.map((card) => card.href), `${id} ${lang}`).toEqual(english.map((other) => (other ? routeById(other).paths[lang] : 'unknown')));
        for (const card of related) expect(card.href.startsWith(`/${lang}/`), card.href).toBe(true);
      }
      expect(presetRows('compress-image', lang).map((row) => row.href), lang).toEqual(['compress-image-to-100kb', 'compress-image-to-1mb'].map((id) => routeById(id as ImagePageId).paths[lang]));
      expect(presetRows('compress-image-to-1mb', lang), lang).toEqual([]);
    }
  });

  it('has a blurb for every page in every language (F6; before, only Compress image had one in Portuguese and Spanish)', () => {
    for (const lang of LANGS) for (const id of IMAGE_PAGE_IDS) expect(blurbOf(id, lang)?.name, `${id} ${lang}`).toBeTruthy();
    expect(blurbOf('compress-image', 'pt')?.name).toBe('Comprimir imagem');
    expect(blurbOf('resize-image', 'pt')?.name).toBe('Redimensionar imagem');
    expect(blurbOf('resize-image', 'es')?.name).toBe('Redimensionar imagen');
    expect(IMAGE_PAGES['image-to-pdf'].pdf).toBe(true);
  });
});

// F13a, revisão e-4 (DECISOES § F13A-R-10): the hidden label of the change of size on the result card ("+66%") says the word
// of the glossary, the one of the column of the guides for the same thing: "Variação" (docs/i18n/pt.md) and "Cambio" (es.md).
describe('the words of the result card', () => {
  it('names the change of size with the word of the glossary', () => {
    expect([IMAGE_PANEL_TEXTS.en.result.change, IMAGE_PANEL_TEXTS.pt.result.change, IMAGE_PANEL_TEXTS.es.result.change]).toEqual(['Change', 'Variação', 'Cambio']);
  });
});
