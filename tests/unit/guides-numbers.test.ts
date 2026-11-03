// No number typed by hand in a file guide (prompt F5b, decisions 3 and 5.1; DECISOES § 189). Every digit of a guide's
// texts sits in a {placeholder}, which the page fills from data/guides-measured.json or from an official figure of the
// guide's own short list (`facts`, each with a source the guide cites), or in a technical name of the guide's `names`
// ("Windows 11", "H.264"). Anything else fails: a measured result written by hand would not change when the measurement
// does. The voice of the design README holds too: no forbidden word, emoji, arrow or exclamation. Since the languages
// adjustment the rule reads the guides of the three languages, each with the words of its own language (DECISOES § 315):
// the generalizations, the direction of a minimum or a maximum, the sources, and the gender of a count in words.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkVoice } from '../../scripts/lib/design-checks.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import enShared from '../../src/i18n/en/file-guides.ts';
import ptShared from '../../src/i18n/pt/file-guides.ts';
import esShared from '../../src/i18n/es/file-guides.ts';
import type { FileGuideTexts } from '../../src/i18n/types.ts';
import type { MeasuredFile } from '../../src/tools/guides/measured-types.ts';
import { resolvePlaceholder } from '../../src/tools/guides/measured.ts';
import { FILE_GUIDE_IDS, type FileGuideId } from '../../src/tools/guides/registry.ts';

const texts = import.meta.glob<FileGuideTexts>(['/src/i18n/en/guide-*.ts', '/src/i18n/pt/guide-*.ts', '/src/i18n/es/guide-*.ts'], { import: 'default', eager: true });
const measured = JSON.parse(readFileSync('data/guides-measured.json', 'utf8')) as MeasuredFile;
const LANGS: readonly Lang[] = ['en', 'pt', 'es'];
const SHARED = { en: enShared, pt: ptShared, es: esShared } as const;

const textsOf = (id: FileGuideId, lang: Lang = 'en'): FileGuideTexts => {
  const found = texts[`/src/i18n/${lang}/guide-${id.replace(/^guides-/, '')}.ts`];
  if (!found) throw new Error(`no ${lang} texts for ${id}`);
  return found;
};

/** A word or phrase as a whole word in any language: \b is ASCII only and misses "até" or "típicamente". */
const words = (alternatives: string, flags = 'iu'): RegExp => new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, flags);

/** Every string of a value with its path, except the keys that are data, not prose: the sources' links and dates. */
function prose(value: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => prose(item, `${path}[${index}]`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      // The measured terms are the words of data/guides-measured.json translated: their digits are checked against the
      // English words they translate (the test of measuredTerms below), never typed as a result.
      if (['href', 'read', 'id', 'source', 'facts', 'names', 'measuredTerms'].includes(key)) continue;
      prose(item, `${path}.${key}`, out);
    }
  }
  return out;
}

/** The digits left in a text once its placeholders and its technical names are taken out. */
function strayDigits(text: string, names: readonly string[]): string[] {
  let rest = text.replace(/\{\w+\}/g, ' ');
  for (const name of [...names].sort((a, b) => b.length - a.length)) rest = rest.split(name).join(' ');
  return [...rest.matchAll(/[^\s]*\d[^\s]*/g)].map((match) => match[0]);
}

/** What an official figure with no digit may say: that something is free, in the words of each language. */
const FREE: Record<Lang, RegExp> = { en: /\d|free/i, pt: /\d|grátis|gratuit[oa]s?/i, es: /\d|gratis|gratuit[oa]s?/i };

/** Problems of one guide's texts: stray digits, facts with no source, sources no fact or table needs are fine. */
function numberProblems(id: string, t: FileGuideTexts, lang: Lang = 'en'): string[] {
  const problems: string[] = [];
  for (const [path, text] of prose(t, id)) {
    // The table heads and captions describe columns; they may not carry numbers either.
    const stray = strayDigits(text, t.names);
    if (stray.length) problems.push(`${path}: algarismo fora de placeholder: ${stray.join(', ')}`);
  }
  const sources = new Set(t.sources.map((source) => source.id));
  for (const [name, fact] of Object.entries(t.facts)) {
    if (!sources.has(fact.source)) problems.push(`${id}.facts.${name}: a fonte ${fact.source} não está nas fontes do guia`);
    if (!FREE[lang].test(fact.text)) problems.push(`${id}.facts.${name}: um fato oficial sem número`);
  }
  for (const source of t.sources) {
    if (!/^https:\/\//.test(source.href)) problems.push(`${id}: a fonte ${source.id} sem link https`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.read)) problems.push(`${id}: a fonte ${source.id} sem a data da leitura`);
  }
  for (const name of t.names) if (!/\d/.test(name)) problems.push(`${id}.names: "${name}" não tem algarismo (não precisa estar na lista)`);
  return problems;
}

/**
 * Words that carry a claim past the sample (prompt F5b, decision 5.4: "nas nossas 13 fotos", não "as fotos"; DECISOES
 * § 197): a guide says what its files did, not what files usually do, and does not lend a source more than it says.
 * "Real PDFs" and "real files" call real what the test script wrote too (DECISOES § 208); "real phone photos" are real.
 */
export const GENERAL = /\b(?:usually|usual|often|most of the time|almost always|almost nothing|almost free|typically|rarely|in most cases|never a dramatic|says the same|real (?:PDFs|files)|most (?:PDFs|photos|files|people|sites|phones))\b/i;

/**
 * The same, in Portuguese and Spanish (languages adjustment, decision 5): the words of the ficha ("geralmente",
 * "normalmente", "em geral", "quase sempre", "a maioria dos PDFs"; "generalmente", "normalmente", "por lo general", "casi
 * siempre", "la mayoría de los PDF") and the ones that carry a claim past the sample the way the English list does.
 * "Fotos reais de celular" are real; "PDFs reais" and "arquivos reais" call real what the test script wrote (§ 208).
 */
const GENERAL_BY_LANG: Record<Lang, RegExp> = {
  en: GENERAL,
  pt: words('geralmente|normalmente|em geral|quase sempre|a maioria d[oa]s (?:PDFs?|fotos|arquivos|pessoas|sites|celulares|casos|vezes)|na maioria das vezes|na maioria dos casos|muitas vezes|frequentemente|costuma(?:m)?|tipicamente|raramente|habitual|usual|quase nada|quase de graça|diz o mesmo|(?:PDFs|arquivos) reais'),
  es: words('generalmente|normalmente|por lo general|casi siempre|la mayoría de (?:los|las) (?:PDF|fotos|archivos|personas|sitios|teléfonos|celulares|casos|veces)|en la mayoría de los casos|a menudo|con frecuencia|suele(?:n)?|típicamente|rara vez|habitual|usual|casi nada|casi gratis|dice lo mismo|(?:PDF|archivos) reales'),
};

/**
 * {date} is the day of the measurement; the sources were read on their own day, which each source gives (DECISOES
 * § 208). A sentence with {date} that speaks of the help pages or the sources dates them wrong.
 */
const SOURCES = /\b(?:help|developer|official|own) pages?\b|\bsources?\b|\bread on\b/i;
const SOURCES_BY_LANG: Record<Lang, RegExp> = {
  en: SOURCES,
  pt: words('páginas? (?:de|da|do|oficial|oficiais) (?:ajuda|suporte|desenvolvedor(?:es)?)|páginas? oficia(?:l|is)|fontes?|lid[oa]s? em'),
  es: words('páginas? (?:de|del) (?:ayuda|soporte|desarrolladores?)|páginas? oficial(?:es)?|fuentes?|leíd[oa]s? el'),
};

function dateProblems(id: string, t: FileGuideTexts, lang: Lang = 'en'): string[] {
  return prose(t, id).flatMap(([path, text]) => sentences(text).filter((sentence) => sentence.includes('{date}') && SOURCES_BY_LANG[lang].test(sentence)).map((sentence) => `${path}: {date} é a data da medida, não a da leitura das fontes: "${sentence}"`));
}

function generalProblems(id: string, t: FileGuideTexts, lang: Lang = 'en'): string[] {
  return prose(t, id).flatMap(([path, text]) => {
    const found = GENERAL_BY_LANG[lang].exec(text)?.[0];
    return found ? [`${path}: "${found}" generaliza além da amostra`] : [];
  });
}

/** Sentences of a text, kept whole around their placeholders. */
const sentences = (text: string): string[] => text.split(/(?<=[.!?])\s+/);
const LOW: Record<Lang, RegExp> = {
  en: /\b(?:lowest|least|smallest|lightest|worst|fewest|minimum)\b|\bas low as\b/i,
  pt: words('menor|menores|mais baix[oa]s?|mínim[oa]s?|pior(?:es)?|mais leve|mais leves|a partir de|menos'),
  es: words('menor|menores|más baj[oa]s?|mínim[oa]s?|peor(?:es)?|más liger[oa]s?|más livian[oa]s?|desde|menos'),
};
const HIGH: Record<Lang, RegExp> = {
  en: /\b(?:highest|largest|heaviest|biggest|best|maximum)\b|\bup to\b/i,
  pt: words('maior|maiores|mais alt[oa]s?|mais pesad[oa]s?|máxim[oa]s?|até|melhor(?:es)?'),
  es: words('mayor|mayores|más alt[oa]s?|más grandes?|más pesad[oa]s?|máxim[oa]s?|hasta|mejor(?:es)?'),
};
const CLAIMS_BEST: Record<Lang, RegExp> = {
  en: /\b(?:closest|best|highest)\b/i,
  pt: words('mais próxim[oa]s?|melhor(?:es)?|mais alt[oa]s?'),
  es: words('más cercan[oa]s?|mejor(?:es)?|más alt[oa]s?'),
};

/**
 * A measured minimum or maximum says which one it is (DECISOES § 199): the sentence gives the range (the other end is
 * there too) or a word of its direction, and a minimum is never called the best or the closest.
 */
function directionProblems(id: FileGuideId, t: FileGuideTexts, file: MeasuredFile = measured, lang: Lang = 'en'): string[] {
  return prose(t, id).flatMap(([path, text]) => directionInText(id, path, text, file, lang));
}

function directionInText(id: FileGuideId, path: string, text: string, file: MeasuredFile = measured, lang: Lang = 'en'): string[] {
  const problems: string[] = [];
  for (const sentence of sentences(text)) {
    const names = [...sentence.matchAll(/\{(\w+)\}/g)].map((match) => match[1] as string);
    const bases = names.map((name) => name.replace(/_[a-z]+$/, ''));
    for (const name of names) {
      const base = name.replace(/_[a-z]+$/, '');
      const end = /(Min|Max)(?=[A-Z]|$)/.exec(base)?.[1];
      if (!end || resolvePlaceholder(id, name, file) === null) continue;
      const other = base.replace(/(Min|Max)(?=[A-Z]|$)/, end === 'Min' ? 'Max' : 'Min');
      if (bases.includes(other)) continue;
      if (end === 'Min' && (!LOW[lang].test(sentence) || CLAIMS_BEST[lang].test(sentence))) problems.push(`${path}: {${name}} é o mínimo, e a frase não diz isso: "${sentence}"`);
      if (end === 'Max' && !HIGH[lang].test(sentence)) problems.push(`${path}: {${name}} é o máximo, e a frase não diz isso: "${sentence}"`);
    }
  }
  return problems;
}

/**
 * The sample, stated (prompt F5b, decision 5.4; DECISOES § 203): the note under the table, or its introduction, names a
 * measured count that is the sample of one of the guide's tables, so the reader knows how many files the numbers rest on.
 */
function sampleProblems(id: FileGuideId, t: FileGuideTexts, file: MeasuredFile = measured): string[] {
  const sizes = new Set(Object.values(file.guides[id].tables).map((table) => table.sample.count));
  const counts = [...`${t.measuredIntro} ${t.measuredNote}`.matchAll(/\{(\w+)\}/g)]
    .map((match) => resolvePlaceholder(id, match[1] as string, file)?.number)
    .filter((number) => number !== undefined && number.unit === 'count' && number.value === number.sample.count);
  return counts.some((number) => number && sizes.has(number.value)) ? [] : [`${id}: a nota e a introdução da tabela não dizem quantos arquivos a amostra tem (${[...sizes].join(' ou ')})`];
}

describe('the claims of the file guides stay inside their sample', () => {
  for (const lang of LANGS) {
    it(`say what the sample did, never what files usually do (${lang})`, () => {
      expect(FILE_GUIDE_IDS.flatMap((id) => generalProblems(id, textsOf(id, lang), lang))).toEqual([]);
    });

    it(`say whether a measured number is the lowest or the highest (${lang})`, () => {
      expect(FILE_GUIDE_IDS.flatMap((id) => directionProblems(id, textsOf(id, lang), measured, lang))).toEqual([]);
    });

    it(`state how many files each measurement rests on (${lang})`, () => {
      expect(FILE_GUIDE_IDS.flatMap((id) => sampleProblems(id, textsOf(id, lang)))).toEqual([]);
    });

    it(`never give the sources the date of the measurement (${lang})`, () => {
      expect(FILE_GUIDE_IDS.flatMap((id) => dateProblems(id, textsOf(id, lang), lang))).toEqual([]);
    });
  }

  it('catch a generalization, a minimum called the best and a missing sample (controls)', () => {
    const only = (text: string): FileGuideTexts => ({ ...textsOf('guides-remove-location-from-photos'), intro: [text], sections: [], lead: '', toolIntro: '', measuredIntro: '', measuredNote: '', tables: [] });
    expect(generalProblems('control', only('A PDF of text usually gains almost nothing.')).join()).toMatch(/"usually" generaliza/);
    expect(generalProblems('control', only('Adobe says the same in its guide.')).join()).toMatch(/"says the same"/);
    expect(generalProblems('control', only('Most PDFs are small.')).join()).toMatch(/"Most PDFs"/);
    expect(generalProblems('control', only('On our files, Lossless took a quarter off.'))).toEqual([]);
    expect(generalProblems('control', only('Pictures: the usual suspect')).join()).toMatch(/"usual"/);
    expect(generalProblems('control', only('Merging is almost free.')).join()).toMatch(/"almost free"/);
    expect(generalProblems('control', only('What we measured when we merged real PDFs.')).join()).toMatch(/"real PDFs"/);
    expect(generalProblems('control', only('Measured on real files.')).join()).toMatch(/"real files"/);
    expect(generalProblems('control', only('We took our real phone photos and the real documents.'))).toEqual([]);
    expect(dateProblems('control', only('First version, with the measurements and the help pages of {date}.')).join()).toMatch(/não a da leitura das fontes/);
    expect(dateProblems('control', only('Measured on {date} through the tool pages of this site. The help pages were read on the date given with each source.'))).toEqual([]);
    const location = 'guides-remove-location-from-photos';
    expect(directionInText(location, 'x', 'The closest it came was {compressImagePsnrMinChromium} of PSNR.').join()).toMatch(/é o mínimo/);
    expect(directionInText(location, 'x', 'It scored {compressImagePsnrMinChromium} of PSNR.').join()).toMatch(/é o mínimo/);
    expect(directionInText(location, 'x', 'Its lowest score was {compressImagePsnrMinChromium} of PSNR.')).toEqual([]);
    expect(directionInText('guides-heic-to-jpg-on-windows', 'x', 'It grew by {ratioMaxChromium_more}.').join()).toMatch(/é o máximo/);
    expect(directionInText('guides-heic-to-jpg-on-windows', 'x', 'It went from {ratioMinChromium_change} to {ratioMaxChromium_change}.')).toEqual([]);
    const heic = textsOf('guides-heic-to-jpg-on-windows');
    expect(sampleProblems('guides-heic-to-jpg-on-windows', { ...heic, measuredIntro: 'Our photos.', measuredNote: 'Measured on {date}.' }).join()).toMatch(/não dizem quantos arquivos/);
    // A count that is not the size of the sample does not state it.
    expect(sampleProblems('guides-heic-to-jpg-on-windows', { ...heic, measuredIntro: 'Our photos.', measuredNote: '{gpsBefore} had GPS.' }).join()).toMatch(/não dizem quantos arquivos/);
    expect(sampleProblems('guides-heic-to-jpg-on-windows', { ...heic, measuredIntro: 'Our {files} photos.', measuredNote: 'Measured on {date}.' })).toEqual([]);
  });

  it('catch them in Portuguese and Spanish too (controls)', () => {
    const only = (text: string): FileGuideTexts => ({ ...textsOf('guides-remove-location-from-photos'), intro: [text], sections: [], lead: '', toolIntro: '', measuredIntro: '', measuredNote: '', tables: [] });
    expect(generalProblems('control', only('Um PDF de texto geralmente ganha pouco.'), 'pt').join()).toMatch(/"geralmente" generaliza/);
    expect(generalProblems('control', only('A maioria dos PDFs é pequena.'), 'pt').join()).toMatch(/"A maioria dos PDFs"/);
    expect(generalProblems('control', only('Juntar é quase de graça.'), 'pt').join()).toMatch(/"quase de graça"/);
    expect(generalProblems('control', only('Medido em PDFs reais.'), 'pt').join()).toMatch(/"PDFs reais"/);
    expect(generalProblems('control', only('Em geral, o JPG fica menor.'), 'pt').join()).toMatch(/"Em geral"/);
    expect(generalProblems('control', only('Usamos nossas fotos reais de celular e os documentos de teste.'), 'pt')).toEqual([]);
    expect(generalProblems('control', only('Por lo general, el JPG pesa menos.'), 'es').join()).toMatch(/"Por lo general"/);
    expect(generalProblems('control', only('La mayoría de los PDF son pequeños.'), 'es').join()).toMatch(/"La mayoría de los PDF"/);
    expect(generalProblems('control', only('Un PDF de texto típicamente gana poco.'), 'es').join()).toMatch(/"típicamente"/);
    expect(generalProblems('control', only('Medido en archivos reales.'), 'es').join()).toMatch(/"archivos reales"/);
    expect(generalProblems('control', only('Usamos nuestras fotos reales de celular.'), 'es')).toEqual([]);
    // The English list does not read Portuguese: each language is checked with its own words.
    expect(generalProblems('control', only('Um PDF de texto geralmente ganha pouco.'), 'en')).toEqual([]);
    expect(dateProblems('control', only('Primeira versão, com as medidas e as páginas de ajuda de {date}.'), 'pt').join()).toMatch(/não a da leitura das fontes/);
    expect(dateProblems('control', only('Medido em {date} nas páginas das ferramentas deste site.'), 'pt')).toEqual([]);
    expect(dateProblems('control', only('Primera versión, con las mediciones y las fuentes del {date}.'), 'es').join()).toMatch(/não a da leitura das fontes/);
    expect(dateProblems('control', only('Medido el {date} en las páginas de las herramientas de este sitio.'), 'es')).toEqual([]);
    const location = 'guides-remove-location-from-photos';
    expect(directionInText(location, 'x', 'O mais próximo foi {compressImagePsnrMinChromium} de PSNR.', measured, 'pt').join()).toMatch(/é o mínimo/);
    expect(directionInText(location, 'x', 'A nota foi {compressImagePsnrMinChromium} de PSNR.', measured, 'pt').join()).toMatch(/é o mínimo/);
    expect(directionInText(location, 'x', 'A menor nota foi {compressImagePsnrMinChromium} de PSNR.', measured, 'pt')).toEqual([]);
    expect(directionInText(location, 'x', 'La nota fue {compressImagePsnrMinChromium} de PSNR.', measured, 'es').join()).toMatch(/é o mínimo/);
    expect(directionInText(location, 'x', 'Su nota más baja fue {compressImagePsnrMinChromium} de PSNR.', measured, 'es')).toEqual([]);
    expect(directionInText('guides-heic-to-jpg-on-windows', 'x', 'Cresceu {ratioMaxChromium_more}.', measured, 'pt').join()).toMatch(/é o máximo/);
    expect(directionInText('guides-heic-to-jpg-on-windows', 'x', 'Cresceu até {ratioMaxChromium_more}.', measured, 'pt')).toEqual([]);
    expect(directionInText('guides-heic-to-jpg-on-windows', 'x', 'Creció {ratioMaxChromium_more}.', measured, 'es').join()).toMatch(/é o máximo/);
    expect(directionInText('guides-heic-to-jpg-on-windows', 'x', 'Creció hasta {ratioMaxChromium_more}.', measured, 'es')).toEqual([]);
  });
});

/**
 * The gender of each count in words (languages adjustment, decision 5; DECISOES § 314): {x_word} is masculine and
 * {x_wordf} feminine, by the noun each count goes with in the language. Only the counts of a feminine noun are listed; any
 * other count in words is masculine. Read from the texts: a writer who counts a noun of the other gender changes this list
 * in the same commit.
 */
const FEMININE: Record<'pt' | 'es', Partial<Record<FileGuideId, readonly string[]>>> = {
  pt: {
    'guides-heic-to-jpg-on-windows': ['identicalBrowsers'],
    'guides-social-media-image-sizes': ['exactFrames', 'thumbnailExactChromium', 'photos'],
    'guides-open-webp-save-as-jpg': ['photos'],
    'guides-jpg-vs-png': ['photos'],
    'guides-remove-location-from-photos': ['withGps', 'withCamera', 'withDate', 'resizeImageIdenticalChromium', 'resizeImageOrientationChromium', 'photos', 'browsersSameSize', 'candidates'],
    'guides-photos-to-one-pdf': ['photos'],
  },
  es: {
    'guides-heic-to-jpg-on-windows': ['identicalBrowsers'],
    'guides-social-media-image-sizes': ['exactFrames', 'thumbnailExactChromium', 'photos'],
    'guides-open-webp-save-as-jpg': ['photos'],
    'guides-jpg-vs-png': ['photos', 'transparentCornersBefore', 'transparentCornersWhiteChromium'],
    'guides-remove-location-from-photos': ['withGps', 'withCamera', 'withDate', 'resizeImageIdenticalChromium', 'resizeImageOrientationChromium', 'photos', 'browsersSameSize', 'candidates'],
    'guides-photos-to-one-pdf': ['photos'],
  },
};

/** Problems of the counts in words of one guide: the gender, the start of a sentence, and "un" with no noun in Spanish. */
function countProblems(id: FileGuideId, t: FileGuideTexts, lang: Lang, file: MeasuredFile = measured): string[] {
  const problems: string[] = [];
  const feminine = lang === 'en' ? [] : (FEMININE[lang][id] ?? []);
  for (const [path, text] of prose(t, id)) {
    for (const match of text.matchAll(/\{(\w+)_(wordf?)\}/g)) {
      const [whole, base = '', variant] = match;
      if (lang === 'en' && variant === 'wordf') problems.push(`${path}: ${whole} no inglês, que não tem gênero`);
      if (lang !== 'en' && feminine.includes(base) !== (variant === 'wordf')) problems.push(`${path}: ${whole} conta um substantivo ${feminine.includes(base) ? 'feminino' : 'masculino'} em ${lang}`);
      const at = match.index ?? 0;
      if (at === 0 || /[.!?]\s*$/.test(text.slice(0, at))) problems.push(`${path}: ${whole} começa uma frase e sairia em minúscula`);
      // Spanish writes 1 as "un" before a masculine noun: the noun has to follow, or the page would say "un de".
      const value = file.guides[id].numbers[base]?.value;
      if (lang === 'es' && variant === 'word' && value === 1 && !/^\s+[\p{L}]/u.test(text.slice(at + whole.length)) ) problems.push(`${path}: ${whole} vale 1 ("un") e não tem o substantivo depois`);
      if (lang === 'es' && variant === 'word' && value === 1 && /^\s+(?:de|del)\b/.test(text.slice(at + whole.length))) problems.push(`${path}: ${whole} vale 1 e sairia "un de"`);
    }
  }
  return problems;
}

describe('the counts in words of the file guides', () => {
  for (const lang of LANGS) {
    it(`agree with the noun they count, and never open a sentence (${lang})`, () => {
      expect(FILE_GUIDE_IDS.flatMap((id) => countProblems(id, textsOf(id, lang), lang))).toEqual([]);
    });
  }

  it('catch a wrong gender, a count that opens a sentence and a bare "un" (controls)', () => {
    const only = (id: FileGuideId, text: string): FileGuideTexts => ({ ...textsOf(id), intro: [text], sections: [], lead: '', toolIntro: '', measuredIntro: '', measuredNote: '', tables: [] });
    expect(countProblems('guides-jpg-vs-png', only('guides-jpg-vs-png', 'Usamos {photos_word} fotos.'), 'pt').join()).toMatch(/feminino em pt/);
    expect(countProblems('guides-jpg-vs-png', only('guides-jpg-vs-png', 'Usamos {photos_wordf} fotos.'), 'pt')).toEqual([]);
    expect(countProblems('guides-jpg-vs-png', only('guides-jpg-vs-png', 'Os {transparentCornersBefore_word} cantos.'), 'pt')).toEqual([]);
    expect(countProblems('guides-jpg-vs-png', only('guides-jpg-vs-png', 'Las {transparentCornersBefore_word} esquinas.'), 'es').join()).toMatch(/feminino em es/);
    expect(countProblems('guides-why-is-my-pdf-so-large', only('guides-why-is-my-pdf-so-large', 'Usamos {spaceFiles_wordf} PDF.'), 'es').join()).toMatch(/masculino em es/);
    expect(countProblems('guides-jpg-vs-png', only('guides-jpg-vs-png', 'Fotos. {photos_wordf} fotos ficaram iguais.'), 'pt').join()).toMatch(/começa uma frase/);
    expect(countProblems('guides-jpg-vs-png', only('guides-jpg-vs-png', 'Our {photos_wordf} photos.'), 'en').join()).toMatch(/no inglês/);
    expect(countProblems('guides-why-is-my-pdf-so-large', only('guides-why-is-my-pdf-so-large', 'Sin pérdida devolvió {losslessUnchanged_word} de ellos.'), 'es').join()).toMatch(/"un de"/);
    expect(countProblems('guides-why-is-my-pdf-so-large', only('guides-why-is-my-pdf-so-large', 'Sin pérdida devolvió {losslessUnchanged_word} archivo igual.'), 'es')).toEqual([]);
  });
});

describe('the numbers of the file guides', () => {
  for (const lang of LANGS) {
    it(`are all placeholders, official figures with a source, or technical names (${lang})`, () => {
      const problems = FILE_GUIDE_IDS.flatMap((id) => numberProblems(id, textsOf(id, lang), lang));
      expect(problems).toEqual([]);
    });

    it(`hold no stray digit in the texts every guide shares, nor in the cards of the guides (${lang})`, () => {
      const { names, ...rest } = SHARED[lang] as typeof SHARED[typeof lang] & { names: string[] };
      for (const [path, text] of prose(rest, 'file-guides')) expect(strayDigits(text, names), path).toEqual([]);
      for (const id of FILE_GUIDE_IDS) {
        const blurb = TEXTS[lang].common.fileGuides?.[id];
        expect(blurb, `${id} (${lang})`).toBeDefined();
        expect(strayDigits(`${blurb?.name} ${blurb?.description}`, []), `${id} (${lang})`).toEqual([]);
      }
    });

    it(`follow the voice of the design README: no forbidden word, emoji, arrow or exclamation (${lang})`, () => {
      for (const id of FILE_GUIDE_IDS) expect(checkVoice(textsOf(id, lang), id, lang), `${id} (${lang})`).toEqual([]);
      expect(checkVoice(SHARED[lang], 'file-guides', lang)).toEqual([]);
      expect(checkVoice(TEXTS[lang].common.fileGuides, 'fileGuides', lang)).toEqual([]);
    });
  }

  it('cite, in guide 3, every page the measured sizes were read on: the English page, or its version in pt and es', () => {
    const t = textsOf('guides-social-media-image-sizes');
    const cited = new Set(t.sources.map((source) => source.href));
    for (const size of measured.guides['guides-social-media-image-sizes'].official ?? []) expect(cited.has(size.source.href), size.id).toBe(true);
    // Portuguese and Spanish cite the page of their language where it gives the same figure: the same source ids as the
    // English guide, each with its own address (DECISOES § 314).
    const official = new Set((measured.guides['guides-social-media-image-sizes'].official ?? []).map((size) => size.source.href));
    const ids = t.sources.filter((source) => official.has(source.href)).map((source) => source.id);
    for (const lang of ['pt', 'es'] as const) {
      const own = new Set(textsOf('guides-social-media-image-sizes', lang).sources.map((source) => source.id));
      for (const id of ids) expect(own.has(id), `${lang} ${id}`).toBe(true);
    }
  });

  it('translate the words of the measurement with the same digits as the English words (measuredTerms)', () => {
    const digits = (text: string): string[] => [...text.matchAll(/\d+/g)].map((match) => match[0]).sort();
    for (const lang of ['pt', 'es'] as const) {
      for (const id of FILE_GUIDE_IDS) {
        for (const [english, own] of Object.entries(textsOf(id, lang).measuredTerms ?? {})) expect(digits(own), `${id} (${lang}) "${english}"`).toEqual(digits(english));
      }
    }
    // A translation that changes a figure of the English words keeps different digits, which the comparison above refuses.
    expect(digits('Foto do feed na proporção mais alta, 4:5')).not.toEqual(digits('Feed photo at its tallest ratio, 3:4'));
  });
});

describe('the number check catches what it should (controls)', () => {
  const base = textsOf('guides-heic-to-jpg-on-windows');
  const variant = (patch: Partial<FileGuideTexts>): FileGuideTexts => ({ ...base, ...patch });

  it('accepts "free" as an official figure in the words of each language, and nothing else without a digit', () => {
    const sources = [{ id: 'ms', label: 'Microsoft', href: 'https://example.com/', read: '2026-11-03' }];
    expect(numberProblems('control', variant({ sources, facts: { price: { text: 'grátis', source: 'ms' } } }), 'pt')).toEqual([]);
    expect(numberProblems('control', variant({ sources, facts: { price: { text: 'gratis', source: 'ms' } } }), 'es')).toEqual([]);
    expect(numberProblems('control', variant({ sources, facts: { price: { text: 'barato', source: 'ms' } } }), 'pt').join()).toMatch(/um fato oficial sem número/);
    expect(numberProblems('control', variant({ intro: ['Os JPGs ficaram 25% maiores.'] }), 'pt').join()).toMatch(/algarismo fora de placeholder: 25%/);
  });

  it('passes a guide whose numbers are placeholders, facts and names', () => {
    expect(numberProblems('control', base)).toEqual([]);
    expect(strayDigits('The JPG was {ratio_more} bigger on Windows 11.', ['Windows 11'])).toEqual([]);
  });

  it('fails a measured result typed by hand, in prose, a list, a heading or a table head', () => {
    expect(numberProblems('control', variant({ intro: ['The JPGs were 25% bigger.'] })).join()).toMatch(/algarismo fora de placeholder: 25%/);
    expect(numberProblems('control', variant({ sections: [{ heading: 'Our 10 photos', paragraphs: ['x'] }] })).join()).toMatch(/algarismo fora de placeholder: 10/);
    expect(numberProblems('control', variant({ sections: [{ heading: 'x', paragraphs: ['x'], list: ['about 3 MB'] }] })).join()).toMatch(/algarismo fora de placeholder: 3/);
    expect(numberProblems('control', variant({ tables: [{ heading: 'x', caption: 'x', head: ['Size at 300 ppi'] }] })).join()).toMatch(/algarismo fora de placeholder: 300/);
    expect(strayDigits('Install it on Windows 12.', ['Windows 11'])).toEqual(['12.']);
  });

  it('fails an official figure whose source the guide does not cite, and a source with no date', () => {
    expect(numberProblems('control', variant({ facts: { limit: { text: '25 MB', source: 'nowhere' } } })).join()).toMatch(/a fonte nowhere não está nas fontes do guia/);
    const sources = [{ id: 'x', label: 'X', href: 'https://example.com/', read: 'today' }];
    expect(numberProblems('control', variant({ sources, facts: {} })).join()).toMatch(/sem a data da leitura/);
  });

  it('catches a forbidden word and an exclamation in a guide', () => {
    expect(checkVoice(variant({ lead: 'A seamless way to convert!' }), 'control').length).toBeGreaterThan(0);
  });
});
