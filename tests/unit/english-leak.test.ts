// No English sentence on a page in Portuguese or Spanish (prompt F6, decision 4). For every page of pt and es in dist/
// (the route map × its languages), the text a person reads and every string the island gets in data-props are compared
// with the phrases of the English text files (src/i18n/en/*.ts and src/tools/**/i18n/en.ts). A phrase that appears there
// word for word is a leak: a text left in English, or an English text written inside a component. Read dist/ after
// `pnpm build` (as `pnpm verificar` does: the build runs before the Vitest step).
//
// The rules, so a page translated by the glossaries passes and a page left in English does not:
// - The English phrases are the string values of those files, minus the keys that are not prose (links, synonyms, language
//   names, keyboard keys, icons, file names and suffixes, ids) and minus the titles of the official sources an English page
//   cites (`sources[].label`): the Spanish money pages may cite the English page of the same body, saying so (decision 6).
// - Each string is cut where a placeholder ({name}), a URL or an e-mail stands, and at the end of each sentence or clause
//   (. ! ? : ; parentheses, quotes, the middle dot, dashes and line breaks). The whole string and each piece count.
// - A piece counts when it has at least 4 words, or 3 words and 20 characters, and at least 3 of its words are prose: not a
//   proper name (FileOrca, Oli, the author, Ko-fi, YouTube, iPhone, Chrome…), a format (JPG, PNG, HEIC, WebP, AVIF, GIF, PDF,
//   ZIP…), a technical token (px, KB, MB, Ctrl, AES-256, an acronym in capitals, anything with a digit) or a word of a
//   name in ALLOWED_NAMES. So "JPG, PNG or WebP" and "Victor Yuki Matusita" never count, and "Drop your images here" does.
// - Words are compared without case and without punctuation, in order: "Drop your images here." is found in "drop your
//   images here". Whitespace, the no-break space and line breaks are all one space.
// - On the page: the visible text of the body (scripts, styles, SVG aside, a space at every element boundary, so
//   neighbours never glue), the <title>, the meta description and the Open Graph title and description, the accessible
//   attributes (aria-label, alt, title, placeholder), the <template> and <noscript> contents, and every string in the
//   JSON of each [data-props]. On the Licenses page only, the license texts (<pre>) are left out: the licenses ask for
//   them word for word, and they are in English.
import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { visibleText } from '../../scripts/lib/conteudo.ts';
import { fileForPath } from '../../scripts/lib/dist.ts';
import { ROUTES, languagesOf, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';

/** Keys whose strings are not prose, at any depth. */
const NOT_PROSE = new Set(['href', 'synonyms', 'langNames', 'langCode', 'kbd', 'shortcut', 'icon', 'icons', 'file', 'files', 'suffix', 'path', 'url', 'id', 'slug', 'lang', 'email', 'mime']);

/** Names made of several words that stay as they are in every language: a piece made of them and of allowed tokens is not prose. */
const ALLOWED_NAMES = [
  'Victor Yuki Matusita',
  'Consumer Financial Protection Bureau',
  'Federal Reserve',
  'Banco Central do Brasil',
  'GNU Lesser General Public License',
  'Lesser General Public License',
  'SIL Open Font License',
  'Apache License',
  'MIT License',
  'Google Analytics',
  'Google AdSense',
  'Consent Mode',
  'My Ad Center',
  'Ads Settings',
  'Product Hunt',
  'Cloudflare Workers',
  'Buy Me a Coffee',
];

/** Single words that stay as they are in every language: brands, products, formats and technical tokens, in lower case. */
const ALLOWED_TOKENS = new Set(
  [
    'fileorca', 'oli', 'victor', 'yuki', 'matusita', 'ko-fi', 'kofi', 'youtube', 'iphone', 'ipad', 'android', 'chrome', 'safari', 'firefox', 'edge',
    'windows', 'macos', 'ios', 'linux', 'google', 'adsense', 'analytics', 'cloudflare', 'pix', 'apple', 'adobe', 'acrobat', 'microsoft',
    'jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'avif', 'gif', 'pdf', 'pdfs', 'zip', 'svg', 'bmp', 'tiff', 'csv', 'exif', 'xmp', 'iptc', 'gps',
    'icc', 'srgb', 'rgb', 'cmyk', 'mozjpeg', 'oxipng', 'libheif', 'libheif-js', 'libde265', 'pdf.js', 'qpdf', 'pdf-lib', 'jsquash', 'wasm',
    'webassembly', 'aes', 'aes-256', 'rc4', 'xfa', 'kb', 'mb', 'gb', 'px', 'ppi', 'dpi', 'ctrl', 'cmd', 'v', 'k', 'a4', 'fileorca.com',
  ],
);

/** A hard cut: a URL, an e-mail or a placeholder. Nothing is joined across one. */
const CUT = /https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+|\{[A-Za-z_]+\}/;
/** Where a sentence or a clause ends: the pieces are compared one by one. */
const BREAK = /[.!?;:()[\]"“”«»·|—–\n]+(?:\s|$)|[()[\]"“”«»·|—–\n]/;
const WORD = /[\p{L}\p{N}]+(?:['’.\-][\p{L}\p{N}]+)*/gu;

const words = (text: string): string[] => text.normalize('NFC').match(WORD) ?? [];

/** A word that is a name, a format or a technical token, never English prose. */
function allowedWord(word: string): boolean {
  if (/\d/.test(word)) return true;
  if (ALLOWED_TOKENS.has(word.toLowerCase())) return true;
  // An acronym in capitals (PDF, GPS, APR, CET, IOF, HOA, PRICE…).
  return word.length >= 2 && word.length <= 6 && word === word.toUpperCase() && /\p{Lu}/u.test(word);
}

/** The words of a piece that are prose: allowed names and tokens taken out. */
function proseWords(piece: string): string[] {
  let text = piece;
  for (const name of ALLOWED_NAMES) text = text.replaceAll(name, ' ');
  return words(text).filter((word) => !allowedWord(word));
}

/** Whether a piece is English prose worth looking for (the rules at the top). */
export function counts(piece: string): boolean {
  const all = words(piece);
  const long = all.length >= 4 || (all.length >= 3 && piece.trim().length >= 20);
  return long && proseWords(piece).length >= 3;
}

/** The whole string (between hard cuts) and its sentence pieces, each as a list of lower-case words, the ones that count. */
export function phrasesOf(text: string): string[][] {
  const found = new Map<string, string[]>();
  for (const segment of text.split(CUT)) {
    for (const piece of [segment, ...segment.split(BREAK)].map((part) => part.trim())) {
      if (!piece || !counts(piece)) continue;
      const list = words(piece).map((word) => word.toLowerCase());
      found.set(list.join(' '), list);
    }
  }
  return [...found.values()];
}

type Strings = { path: string; text: string }[];

/** Every string of a value with its key path; `skip` leaves out the keys that are not prose. */
function stringsOf(value: unknown, path: string, skip: (path: string, key: string) => boolean, out: Strings = []): Strings {
  if (typeof value === 'string') out.push({ path, text: value });
  else if (Array.isArray(value)) value.forEach((item, index) => stringsOf(item, `${path}.${index}`, skip, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (!skip(path, key)) stringsOf(item, `${path}.${key}`, skip, out);
  }
  return out;
}

/** Not prose: the keys of NOT_PROSE, and the label of an official source (sources[].label). */
const skipEnglish = (path: string, key: string): boolean => NOT_PROSE.has(key) || (key === 'label' && /\.sources\.\d+$/.test(path));

const ENGLISH_MODULES = {
  ...import.meta.glob<Record<string, unknown>>('/src/i18n/en/*.ts', { eager: true }),
  ...import.meta.glob<Record<string, unknown>>('/src/tools/**/i18n/en.ts', { eager: true }),
};

/** The English phrases, each with where it came from (the first file and key that has it). */
export function englishPhrases(modules: Record<string, Record<string, unknown>> = ENGLISH_MODULES): Map<string, { words: string[]; from: string }> {
  const phrases = new Map<string, { words: string[]; from: string }>();
  for (const [file, exports] of Object.entries(modules)) {
    for (const { path, text } of stringsOf(exports, file, skipEnglish)) {
      for (const list of phrasesOf(text)) {
        const key = list.join(' ');
        if (!phrases.has(key)) phrases.set(key, { words: list, from: path });
      }
    }
  }
  return phrases;
}

/**
 * The texts of a page a person reads or hears, and the strings of its island (the rules at the top). `drop` leaves
 * elements out of the visible text: on the Licenses page, the license texts (`<pre>`), which the licenses ask to be
 * reproduced word for word, in English.
 */
export function pageTexts(html: string, drop: readonly string[] = []): Strings {
  const root = parse(html);
  const out: Strings = [{ path: 'texto visível', text: visibleText(html, 'body', drop) }];
  const head = (selector: string, attribute?: string): void => {
    for (const element of root.querySelectorAll(selector)) out.push({ path: selector, text: attribute ? (element.getAttribute(attribute) ?? '') : element.text });
  };
  head('title');
  head('meta[name="description"]', 'content');
  head('meta[property="og:title"]', 'content');
  head('meta[property="og:description"]', 'content');
  for (const attribute of ['aria-label', 'alt', 'title', 'placeholder']) {
    for (const element of root.querySelectorAll(`body [${attribute}]`)) out.push({ path: `[${attribute}]`, text: element.getAttribute(attribute) ?? '' });
  }
  for (const element of root.querySelectorAll('template, noscript')) out.push({ path: element.tagName.toLowerCase(), text: visibleText(`<body>${element.innerHTML}</body>`) });
  for (const element of root.querySelectorAll('[data-props]') as HTMLElement[]) {
    const props: unknown = JSON.parse(element.getAttribute('data-props') ?? '{}');
    out.push(...stringsOf(props, 'data-props', () => false));
  }
  return out;
}

type Phrases = Map<string, { words: string[]; from: string }>;
const BY_START = new WeakMap<Phrases, Map<string, { phrase: string; words: string[]; from: string }[]>>();

/** The phrases by their first three words, built once for a set of phrases. */
function byStart(phrases: Phrases): Map<string, { phrase: string; words: string[]; from: string }[]> {
  let index = BY_START.get(phrases);
  if (!index) {
    index = new Map();
    for (const [phrase, { words: list, from }] of phrases) {
      const key = list.slice(0, 3).join(' ');
      index.set(key, [...(index.get(key) ?? []), { phrase, words: list, from }]);
    }
    BY_START.set(phrases, index);
  }
  return index;
}

/** The English phrases found in the texts of a page: each with where it is on the page and where it comes from. */
export function findLeaks(texts: Strings, phrases: Phrases): { where: string; phrase: string; from: string }[] {
  const index = byStart(phrases);
  const leaks: { where: string; phrase: string; from: string }[] = [];
  for (const { path, text } of texts) {
    const list = words(text).map((word) => word.toLowerCase());
    const seen = new Set<string>();
    // At every run of three words of the text, only the phrases that start with those three are compared, word by word.
    for (let start = 0; start + 3 <= list.length; start += 1) {
      for (const candidate of index.get(`${list[start]} ${list[start + 1]} ${list[start + 2]}`) ?? []) {
        if (seen.has(candidate.phrase)) continue;
        if (candidate.words.every((word, offset) => list[start + offset] === word)) {
          seen.add(candidate.phrase);
          leaks.push({ where: path, phrase: candidate.phrase, from: candidate.from });
        }
      }
    }
  }
  return leaks;
}

/** The leaks in a list of texts, minus a phrase found inside a longer one also found (the longest says where). */
function longest(leaks: { where: string; phrase: string; from: string }[]): { where: string; phrase: string; from: string }[] {
  return leaks.filter((leak) => !leaks.some((other) => other !== leak && other.where === leak.where && other.phrase.length > leak.phrase.length && ` ${other.phrase} `.includes(` ${leak.phrase} `)));
}

const PHRASES = englishPhrases();

describe('the English phrases the pages are compared with', () => {
  it('reads the English text files: thousands of phrases, the known ones among them, and none made of names and formats', () => {
    expect(Object.keys(ENGLISH_MODULES).length).toBeGreaterThan(60);
    expect(PHRASES.size).toBeGreaterThan(2000);
    // A sentence of the support page, a panel line and a whole short title are phrases.
    expect(PHRASES.has('free tools made by one person')).toBe(true);
    expect([...PHRASES.keys()].some((phrase) => phrase.includes('files never leave your device'))).toBe(true);
    // Names, formats and technical tokens alone never are.
    for (const phrase of ['victor yuki matusita', 'jpg png or webp', 'ctrl v', 'consumer financial protection bureau']) expect(PHRASES.has(phrase), phrase).toBe(false);
  });

  it('cuts at placeholders, URLs, e-mails and the end of a sentence, and keeps the pieces of 4 words, or of 3 words and 20 characters', () => {
    expect(phrasesOf('Drop your images here. Or {action} them from the folder.')).toEqual([
      ['drop', 'your', 'images', 'here', 'or'],
      ['drop', 'your', 'images', 'here'],
      ['them', 'from', 'the', 'folder'],
    ]);
    // Nothing is joined across an e-mail or a URL, and the short pieces between them do not count.
    expect(phrasesOf('Write to contato@fileorca.com or see https://fileorca.com/about/ for more')).toEqual([]);
    expect(phrasesOf('Write to us at contato@fileorca.com, we answer every message.')).toEqual([['write', 'to', 'us', 'at'], ['we', 'answer', 'every', 'message']]);
    // Three words and 20 characters count; three short words do not; an acronym, a number and a format are not prose.
    expect(counts('Choose your photographs')).toBe(true);
    expect(counts('Pick a file')).toBe(false);
    expect(counts('Compress image to 100 KB')).toBe(true);
    expect(counts('HEIC to JPG')).toBe(false);
    expect(counts('A 1280 × 720 JPG')).toBe(false);
  });
});

describe('the detector, on pages made here (controls)', () => {
  const ptPage = (body: string, props: unknown = { lang: 'pt' }) =>
    `<!doctype html><html lang="pt-BR"><head><title>Comprimir imagem | FileOrca</title><meta name="description" content="Comprima fotos no navegador, sem enviar nada."></head><body><main>${body}<div id="fo-tool-root" data-props="${JSON.stringify(props).replaceAll('"', '&quot;')}"></div></main></body></html>`;
  const sentence = TEXTS.en.support.h1;
  const panelLine = IMAGE_PANEL_TEXTS.en.errors.title;

  it('catches an English sentence put in the visible text of a Portuguese page (positive control)', () => {
    const leaks = findLeaks(pageTexts(ptPage(`<h1>Comprimir imagem</h1><p>Solte as imagens aqui.</p><p>${sentence}</p>`)), PHRASES);
    expect(leaks.map((leak) => leak.where)).toContain('texto visível');
    expect(leaks.map((leak) => leak.phrase)).toContain(words(sentence).map((word) => word.toLowerCase()).join(' '));
  });

  it('catches an English line in the data-props of the island, at any depth (positive control)', () => {
    expect(counts(panelLine), panelLine).toBe(true);
    const leaks = findLeaks(pageTexts(ptPage('<h1>Comprimir imagem</h1>', { lang: 'pt', t: { errors: { title: panelLine } } })), PHRASES);
    expect(leaks.map((leak) => leak.where)).toContain('data-props.t.errors.title');
  });

  it('catches an English title, an English aria-label and a glued neighbour (positive controls)', () => {
    const page = ptPage(`<h1>Comprimir imagem</h1><button aria-label="${sentence}">x</button><ul><li>Free tools,</li><li>made by one person</li></ul>`).replace('<title>Comprimir imagem | FileOrca</title>', `<title>${sentence} | FileOrca</title>`);
    const where = findLeaks(pageTexts(page), PHRASES).map((leak) => leak.where);
    expect(where).toEqual(expect.arrayContaining(['title', '[aria-label]', 'texto visível']));
  });

  it('leaves out the license texts of the Licenses page only, and nothing around them', () => {
    const terms = TEXTS.en.terms.sections.map((section) => section.heading).find((heading) => counts(heading)) ?? '';
    expect(terms).not.toBe('');
    const page = ptPage(`<h1>Licenças</h1><details><summary>Texto da licença</summary><pre>${terms}. Permission is granted.</pre></details>`);
    expect(findLeaks(pageTexts(page, ['pre']), PHRASES)).toEqual([]);
    // Without the exception (any other page), the same text is a leak; and English outside the <pre> is one on the Licenses page.
    expect(findLeaks(pageTexts(page), PHRASES).length).toBeGreaterThan(0);
    expect(findLeaks(pageTexts(page.replace('<h1>Licenças</h1>', `<h1>Licenças</h1><p>${sentence}</p>`), ['pre']), PHRASES).length).toBeGreaterThan(0);
  });

  it('passes a Portuguese page made only of names, formats, numbers, links and Portuguese (negative control)', () => {
    const body = [
      '<h1>Comprimir imagem</h1>',
      '<p>FileOrca · Oli · Victor Yuki Matusita · Ko-fi · YouTube · iPhone · Chrome</p>',
      '<p>JPG, PNG, HEIC, WebP, AVIF, GIF, PDF e ZIP. 1280 × 720 px, 2,4 MB, AES-256, Ctrl V e Ctrl K.</p>',
      '<p>Escreva para contato@fileorca.com ou veja https://fileorca.com/pt/sobre/.</p>',
      // Near misses: English words that are also Portuguese, and two English words in a row.
      '<p>O total do PDF fica menor. Use o modo Forte para fotos. Baixe o ZIP com um clique: download grátis, sem upload.</p>',
    ].join('');
    const props = { lang: 'pt', href: '/pt/', synonyms: ['compress image', 'reduce file size'], files: { zip: 'fileorca-imagens' }, accepts: ['image/jpeg'], t: { title: 'Solte as imagens aqui' } };
    expect(findLeaks(pageTexts(ptPage(body, props)), PHRASES)).toEqual([]);
  });
});

describe('no English phrase on the pages of Portuguese and Spanish in dist/ (prompt F6, decision 4)', () => {
  const pages = ROUTES.flatMap((route) => languagesOf(route).filter((lang): lang is Exclude<Lang, 'en'> => lang !== 'en').map((lang) => ({ id: route.id, lang, path: route.paths[lang] ?? '' })));

  it('reads every page of pt and es of the route map from dist/', () => {
    expect(existsSync(fileForPath('/')), 'dist/ não existe: rode pnpm build antes do Vitest').toBe(true);
    expect(pages.length).toBeGreaterThan(60);
    for (const page of pages) expect(existsSync(fileForPath(page.path)), page.path).toBe(true);
  });

  for (const lang of ['pt', 'es'] as const) {
    it(`has no English phrase in the visible text or the data-props of a page in ${lang}`, () => {
      const found: string[] = [];
      for (const page of pages.filter((candidate) => candidate.lang === lang)) {
        const file = fileForPath(page.path);
        if (!existsSync(file)) continue;
        const drop = page.id === 'licenses' ? ['pre'] : [];
        for (const leak of longest(findLeaks(pageTexts(readFileSync(file, 'utf8'), drop), PHRASES))) found.push(`${page.path} [${leak.where}] "${leak.phrase}" (de ${leak.from.replace(/^\/src\//, 'src/')})`);
      }
      expect(found, `${found.length} frase(s) em inglês nas páginas em ${lang}`).toEqual([]);
      // Reading some 70 pages: the limit of the other tests that read many pages (pdf-site.test.ts).
    }, 60_000);
  }
});
