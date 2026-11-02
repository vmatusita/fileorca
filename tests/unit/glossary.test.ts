// The glossaries of docs/i18n/ are followed (prompt F6, decision 3): no term of the "Nunca" table of docs/i18n/pt.md is in
// a Portuguese text, and none of docs/i18n/es.md in a Spanish one. Two places are read for each language:
// - the text files of the language, src/i18n/<lang>/*.ts and src/tools/**/i18n/<lang>.ts, imported, every string value
//   at any depth. The `synonyms` are left out: they are what people type in the search, regional words included (an
//   "ordenador" or a "móvil" typed by a visitor from Spain must still find the tool), and they never show on a page;
// - every page of the language in dist/ (the route map × its languages): the visible text of the body (a space at every
//   element boundary, so neighbours never glue), the <title>, the meta description and the accessible attributes
//   (aria-label, alt, title, placeholder). Read dist/ after `pnpm build`, as `pnpm verificar` does.
// A term is matched without case, as a whole word with boundaries that know accents ("móvil" is not found in
// "automóvil"), and a term of several words matches across any run of spaces or a line break.
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { visibleText } from '../../scripts/lib/conteudo.ts';
import { fileForPath } from '../../scripts/lib/dist.ts';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';

type Lang = 'pt' | 'es';

/** The terms of the "## Nunca" table of a glossary: the first column of each row, under the header and its rule. */
export function neverTerms(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+Nunca\s*$/.test(line));
  if (start < 0) return [];
  const terms: string[] = [];
  let row = 0;
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,2}\s/.test(line)) break;
    if (!line.trim().startsWith('|')) continue;
    row += 1;
    const first = line.trim().replace(/^\|/, '').split('|')[0]?.trim().replace(/^`|`$/g, '') ?? '';
    // Row 1 is the header and row 2 the rule under it (| --- |).
    if (row <= 2 || /^:?-{3,}:?$/.test(first) || first === '') continue;
    terms.push(first);
  }
  return terms;
}

/** A term as a whole word, without case, with accent-aware boundaries; spaces in the term match any whitespace. */
export function termPattern(term: string): RegExp {
  const escaped = term.normalize('NFC').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu');
}

const PATTERNS = new Map<string, RegExp>();

/** The terms found in a text. */
export function findTerms(text: string, terms: readonly string[]): string[] {
  const clean = text.normalize('NFC');
  return terms.filter((term) => {
    let pattern = PATTERNS.get(term);
    if (!pattern) PATTERNS.set(term, (pattern = termPattern(term)));
    return pattern.test(clean);
  });
}

const GLOSSARY: Record<Lang, string> = { pt: 'docs/i18n/pt.md', es: 'docs/i18n/es.md' };
const NEVER: Record<Lang, string[]> = { pt: neverTerms(readFileSync(GLOSSARY.pt, 'utf8')), es: neverTerms(readFileSync(GLOSSARY.es, 'utf8')) };

const TEXT_MODULES: Record<Lang, Record<string, Record<string, unknown>>> = {
  pt: {
    ...import.meta.glob<Record<string, unknown>>('/src/i18n/pt/*.ts', { eager: true }),
    ...import.meta.glob<Record<string, unknown>>('/src/tools/**/i18n/pt.ts', { eager: true }),
  },
  es: {
    ...import.meta.glob<Record<string, unknown>>('/src/i18n/es/*.ts', { eager: true }),
    ...import.meta.glob<Record<string, unknown>>('/src/tools/**/i18n/es.ts', { eager: true }),
  },
};

/** Every string of a value with its key path, `synonyms` aside. */
function stringsOf(value: unknown, path: string, out: { path: string; text: string }[] = []): { path: string; text: string }[] {
  if (typeof value === 'string') out.push({ path, text: value });
  else if (Array.isArray(value)) value.forEach((item, index) => stringsOf(item, `${path}.${index}`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (key !== 'synonyms') stringsOf(item, `${path}.${key}`, out);
  }
  return out;
}

/** What a person reads or hears on a page: the visible text, the title, the description and the accessible attributes. */
function pageText(html: string): string {
  const root = parse(html);
  const parts = [visibleText(html), root.querySelector('title')?.text ?? '', root.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''];
  for (const attribute of ['aria-label', 'alt', 'title', 'placeholder']) for (const element of root.querySelectorAll(`body [${attribute}]`)) parts.push(element.getAttribute(attribute) ?? '');
  return parts.join('\n');
}

describe('the "Nunca" tables of the glossaries', () => {
  it('finds the terms of each glossary, the known ones among them (so an empty or broken table cannot pass)', () => {
    expect(NEVER.pt.length).toBeGreaterThanOrEqual(15);
    expect(NEVER.es.length).toBeGreaterThanOrEqual(12);
    expect(NEVER.pt).toEqual(expect.arrayContaining(['ficheiro', 'telemóvel', 'fazer upload', 'palavra-passe', 'vocês', 'hipoteca', 'taxa de hoje']));
    expect(NEVER.es).toEqual(expect.arrayContaining(['ordenador', 'móvil', 'vosotros', 'usted', 'enganche', 'cuota mensual', 'tasa de hoy']));
    // The header ("Termo") and the rule under it are not terms.
    for (const lang of ['pt', 'es'] as const) expect(NEVER[lang].some((term) => /^termo$|^-+$/i.test(term)), lang).toBe(false);
  });

  it('reads only the table under "## Nunca": the header, the rule and the other sections are left out', () => {
    const markdown = ['# G', '## Termos', '| Inglês | Português |', '| --- | --- |', '| file | arquivo |', '## Nunca', 'Texto.', '', '| Termo | Use |', '| --- | --- |', '| `ficheiro` | arquivo |', '| fazer upload | enviar |', '## Depois', '| outro | x |'].join('\n');
    expect(neverTerms(markdown)).toEqual(['ficheiro', 'fazer upload']);
    expect(neverTerms('# G\n## Termos\n| a | b |\n| --- | --- |\n| c | d |')).toEqual([]);
    expect(neverTerms('## Nunca\n\n| Termo | Use |\n| --- | --- |\n')).toEqual([]);
  });
});

describe('the matcher (controls)', () => {
  it('catches every term of each glossary, in any case, inside a sentence and across a line break (positive control)', () => {
    for (const lang of ['pt', 'es'] as const) {
      for (const term of NEVER[lang]) {
        expect(findTerms(`Antes. ${term} depois.`, NEVER[lang]), `${lang} ${term}`).toContain(term);
        expect(findTerms(`Antes, ${term.toUpperCase()}!`, NEVER[lang]), `${lang} ${term} em maiúsculas`).toContain(term);
        if (term.includes(' ')) expect(findTerms(`Antes ${term.replace(' ', '\n  ')} depois`, NEVER[lang]), `${lang} ${term} quebrado`).toContain(term);
      }
    }
  });

  it('lets the near misses and the words that only hold a term pass (negative control)', () => {
    const ptOk = 'Use o celular ou o computador. Baixe o arquivo: download grátis, sem upload. A palavra que você digitou é a senha. A taxa do exemplo é 1% ao mês.';
    const esOk = 'Usa tu celular, tu teléfono o tu computadora. Un automóvil no es un teléfono. Tus archivos nunca salen de tu dispositivo. La tasa del ejemplo es 6.5 %.';
    expect(findTerms(ptOk, NEVER.pt)).toEqual([]);
    expect(findTerms(esOk, NEVER.es)).toEqual([]);
    // "móvil" inside "automóvil", "palavra-passe" against "palavra", "fazer upload" against "sem upload".
    expect(findTerms('automóvil', ['móvil'])).toEqual([]);
    expect(findTerms('a palavra passa', ['palavra-passe'])).toEqual([]);
    expect(findTerms('sem upload', ['fazer upload'])).toEqual([]);
  });
});

for (const lang of ['pt', 'es'] as const) {
  describe(`the ${lang} texts follow docs/i18n/${lang}.md`, () => {
    it(`has no "Nunca" term in a text file of ${lang} (src/i18n/${lang}/*.ts and src/tools/**/i18n/${lang}.ts)`, () => {
      const modules = TEXT_MODULES[lang];
      expect(Object.keys(modules).length, 'text files read').toBeGreaterThan(lang === 'pt' ? 40 : 30);
      const found: string[] = [];
      for (const [file, exports] of Object.entries(modules)) {
        for (const { path, text } of stringsOf(exports, file)) for (const term of findTerms(text, NEVER[lang])) found.push(`${path.replace(/^\/src\//, 'src/')}: "${term}"`);
      }
      expect(found).toEqual([]);
    });

    it(`has no "Nunca" term on a page of ${lang} in dist/`, () => {
      expect(existsSync(fileForPath('/')), 'dist/ não existe: rode pnpm build antes do Vitest').toBe(true);
      const pages = ROUTES.filter((route) => languagesOf(route).includes(lang)).map((route) => route.paths[lang] ?? '');
      expect(pages.length).toBeGreaterThan(30);
      const found: string[] = [];
      for (const path of pages) {
        const file = fileForPath(path);
        expect(existsSync(file), path).toBe(true);
        if (!existsSync(file)) continue;
        for (const term of findTerms(pageText(readFileSync(file, 'utf8')), NEVER[lang])) found.push(`${path}: "${term}"`);
      }
      expect(found).toEqual([]);
      // Reading some 40 pages: the limit of the other tests that read many pages (pdf-site.test.ts).
    }, 60_000);
  });
}
