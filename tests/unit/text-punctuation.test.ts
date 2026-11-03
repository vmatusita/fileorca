// What the review of the languages adjustment found in the punctuation and the sources of the texts (DECISOES § 321):
// - two sentences glued at a placeholder ("con la opción {winnerOption}.Una foto", B1 and C-2): no text of any language
//   ends a sentence and starts the next one without a space;
// - a source title that ends in "?" or "!" gets the period of the list after it ("Adobe: Por que meu PDF está tão grande?.
//   Lido em…", PT-03): in Portuguese and Spanish no source label ends that way (the English pages keep their texts: the
//   prompt of the adjustment leaves them as they are);
// - a source whose page is in English is cited in the language of the page that cites it, with "(em inglês)" or "(en
//   inglés)" after it, as the Spanish money pages do since the F6: an English title inside a Portuguese or Spanish
//   sentence would be read by a screen reader with the voice of the page (WCAG 3.1.2; D2 and E-4).
// The texts are the files of each language, imported, every string at any depth but the keys that are not prose.
import { describe, expect, it } from 'vitest';

type Lang = 'en' | 'pt' | 'es';

const MODULES: Record<Lang, Record<string, Record<string, unknown>>> = {
  en: { ...import.meta.glob<Record<string, unknown>>('/src/i18n/en/*.ts', { eager: true }), ...import.meta.glob<Record<string, unknown>>('/src/tools/**/i18n/en.ts', { eager: true }) },
  pt: { ...import.meta.glob<Record<string, unknown>>('/src/i18n/pt/*.ts', { eager: true }), ...import.meta.glob<Record<string, unknown>>('/src/tools/**/i18n/pt.ts', { eager: true }) },
  es: { ...import.meta.glob<Record<string, unknown>>('/src/i18n/es/*.ts', { eager: true }), ...import.meta.glob<Record<string, unknown>>('/src/tools/**/i18n/es.ts', { eager: true }) },
};

/** Keys whose strings are not sentences (links, ids, file names, search words). */
const NOT_PROSE = new Set(['href', 'synonyms', 'id', 'path', 'url', 'file', 'files', 'slug', 'email', 'mime', 'icon', 'icons', 'placeholder']);

function strings(value: unknown, path: string, out: { path: string; text: string }[] = []): { path: string; text: string }[] {
  if (typeof value === 'string') out.push({ path, text: value });
  else if (Array.isArray(value)) value.forEach((item, index) => strings(item, `${path}.${index}`, out));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) if (!NOT_PROSE.has(key)) strings(item, `${path}.${key}`, out);
  return out;
}

interface Source {
  path: string;
  label: string;
}

/** Every item of a `sources` list (a label and a link) at any depth. */
function sources(value: unknown, path: string, out: Source[] = []): Source[] {
  if (Array.isArray(value)) value.forEach((item, index) => sources(item, `${path}.${index}`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'sources' && Array.isArray(item)) {
        item.forEach((entry: unknown, index) => {
          const source = entry as { label?: unknown; href?: unknown };
          if (typeof source.label === 'string' && typeof source.href === 'string') out.push({ path: `${path}.sources.${index}`, label: source.label });
        });
      } else sources(item, `${path}.${key}`, out);
    }
  }
  return out;
}

/** A sentence that ends and a next one that starts with no space between them: "…100 %.Una foto". */
const GLUED = /[\p{Ll}\d%)}»”][.!?][\p{Lu}]/u;
/** The words of an English title that no Portuguese or Spanish title has (whole words, without case). */
const ENGLISH = ['the', 'of', 'with', 'and', 'for', 'to', 'your', 'how', 'what', 'why', 'help', 'uploading', 'profile', 'photo', 'specification', 'release', 'notes', 'guide', 'about', 'from', 'when'];
const englishWords = (text: string): string[] => ENGLISH.filter((word) => new RegExp(`(?<![\\p{L}\\p{N}])${word}(?![\\p{L}\\p{N}])`, 'iu').test(text));
const ENGLISH_PAGE: Record<'pt' | 'es', RegExp> = { pt: /\(em inglês\)$/, es: /\(en inglés\)$/ };

const relative = (path: string): string => path.replace(/^\/src\//, 'src/');

describe('the punctuation of the texts', () => {
  it('finds the glued sentence, the question mark and the English title it looks for (controls)', () => {
    expect(GLUED.test('con la opción Por porcentaje, 100 %.Una foto')).toBe(true);
    expect(GLUED.test('con la opción {winnerOption}.Una foto')).toBe(true);
    expect(GLUED.test('con la opción {winnerOption}. Una foto')).toBe(false);
    expect(GLUED.test('Outlook.com, Node.js e 2.4 MB')).toBe(false);
    expect(englishWords('Central de Ajuda do X: Help with uploading a profile photo (em inglês)')).toEqual(['with', 'help', 'uploading', 'profile', 'photo']);
    expect(englishWords('W3C: Portable Network Graphics (PNG) Specification (en inglés)')).toEqual(['specification']);
    expect(englishWords('CFPB, Regulation Z, Apéndice J, cómo se calcula la tasa porcentual anual (APR) (en inglés)')).toEqual([]);
    expect(englishWords('Central de Ajuda do X: Ajuda para enviar uma foto do perfil (em inglês)')).toEqual([]);
  });

  for (const lang of ['en', 'pt', 'es'] as const) {
    it(`has a space after the end of every sentence in the ${lang} texts`, () => {
      const files = Object.entries(MODULES[lang]);
      expect(files.length, 'arquivos de texto lidos').toBeGreaterThan(30);
      const glued = files.flatMap(([file, exports]) => strings(exports, file).filter(({ text }) => GLUED.test(text)).map(({ path, text }) => `${relative(path)}: "${GLUED.exec(text)?.[0] ?? ''}"`));
      expect(glued).toEqual([]);
    });
  }

  for (const lang of ['pt', 'es'] as const) {
    it(`cites every source of the ${lang} texts with a label that takes the period of the list, in ${lang} when the page is in English`, () => {
      const all = Object.entries(MODULES[lang]).flatMap(([file, exports]) => sources(exports, file));
      expect(all.length, 'fontes lidas').toBeGreaterThan(60);
      expect(all.filter(({ label }) => /[?!]$/.test(label)).map(({ path, label }) => `${relative(path)}: ${label}`)).toEqual([]);
      const english = all.filter(({ label }) => ENGLISH_PAGE[lang].test(label));
      expect(english.length, 'fontes marcadas como página em inglês').toBeGreaterThan(lang === 'pt' ? 3 : 30);
      expect(english.filter(({ label }) => englishWords(label).length > 0).map(({ path, label }) => `${relative(path)}: ${label} (${englishWords(label).join(', ')})`)).toEqual([]);
    });
  }
});
