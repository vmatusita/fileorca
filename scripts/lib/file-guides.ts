// The content rules of the file guides (prompt F5b, decisions 4 and 5): the blocks of the page in their order, 800 to
// 1,500 words of text, no filler phrase. Pure functions over the HTML of a guide, returning problems in Portuguese;
// scripts/gates/conteudo.ts runs them on every guide of the registry, and tests/unit/conteudo.test.ts proves each one.
// Since the languages adjustment the guides exist in Portuguese and Spanish too: the date of the measurement is looked for
// as the page of each language writes it (src/i18n/dates.ts) and the filler phrases of each language are refused. The
// limit of 800 to 1,500 words is the same in the three languages.
import { parse, type HTMLElement } from 'node-html-parser';
import { longDate } from '../../src/i18n/dates.ts';
import { DEFAULT_LANG, LANGS, type Lang } from '../../src/i18n/routes.ts';

export const MIN_GUIDE_WORDS = 800;
export const MAX_GUIDE_WORDS = 1500;
/** At most this many related cards, as on a tool page. */
export const MAX_GUIDE_RELATED = 6;
/** F12 (DECISOES § 424): the content ads of a guide, conteudo to conteudo-5 of the ad map (ad-map.html, the 37 units). */
export const MAX_GUIDE_CONTENT_ADS = 5;

/** Phrases that fill space without saying anything (prompt F5b, decision 5.7; the F4 list). */
export const FILLER: { label: string; pattern: RegExp }[] = [
  { label: "in today's world", pattern: /\bin today[’']s (?:world|digital world|age)\b/i },
  { label: 'delve', pattern: /\bdelv(?:e|es|ed|ing)\b/i },
  { label: "it's important to note", pattern: /\bit[’']s (?:important|worth|crucial) to (?:note|mention|remember)\b|\bit is (?:important|worth|crucial) to (?:note|mention|remember)\b/i },
  { label: 'in conclusion', pattern: /\bin conclusion\b/i },
  { label: 'in summary', pattern: /\bin summary\b/i },
  { label: 'needless to say', pattern: /\bneedless to say\b/i },
];

/** A phrase of Portuguese or Spanish, whole words only: the boundaries know accents (\b does not), any case. */
const phrase = (source: string): RegExp => new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, 'iu');

/**
 * The same kind of phrase in Portuguese and Spanish (the languages adjustment): the openings and links that generated text
 * leans on and a person writing a guide does not need. A guide of those languages is held to its own list and to the
 * English one, so an English filler left in a translation fails too.
 */
export const FILLER_BY_LANG: Record<Lang, { label: string; pattern: RegExp }[]> = {
  en: FILLER,
  pt: [
    { label: 'no mundo de hoje', pattern: phrase('no mundo (?:de hoje|atual|digital de hoje)') },
    { label: 'vale ressaltar', pattern: phrase('vale (?:ressaltar|destacar|mencionar|notar)') },
    { label: 'é importante notar', pattern: phrase('é (?:importante|crucial|válido) (?:notar|ressaltar|destacar|mencionar|lembrar|observar)') },
    { label: 'em conclusão', pattern: phrase('em conclusão|em suma|em resumo') },
    { label: 'mergulhar fundo', pattern: phrase('mergulh(?:ar|e|emos|amos) fundo|mergulho profundo|vamos mergulhar') },
    { label: 'nem é preciso dizer', pattern: phrase('nem é preciso dizer|escusado será dizer') },
  ],
  es: [
    { label: 'en el mundo actual', pattern: phrase('en el mundo (?:actual|de hoy|digital de hoy)') },
    { label: 'cabe destacar', pattern: phrase('cabe (?:destacar|señalar|mencionar|resaltar)|vale la pena (?:destacar|señalar|mencionar)') },
    { label: 'es importante señalar', pattern: phrase('es (?:importante|crucial) (?:señalar|destacar|mencionar|notar|resaltar|recordar)') },
    { label: 'en conclusión', pattern: phrase('en conclusión|en resumen|en suma') },
    { label: 'sumergirse', pattern: phrase('sumerg(?:irse|irnos|ámonos|amonos|imos)|inmersión profunda') },
    { label: 'huelga decir', pattern: phrase('huelga decir|ni que decir tiene|no hace falta decir') },
  ],
};

/** The names of the months as longDate writes them in a language ("November", "novembro", "noviembre"). */
function monthNames(lang: Lang): string[] {
  return Array.from({ length: 12 }, (_, index) => {
    const written = longDate(`2000-${String(index + 1).padStart(2, '0')}-01`, lang);
    return (lang === 'en' ? written.split(' ')[0] : written.split(' de ')[1]) ?? '';
  });
}

/**
 * A date written out the way the page of each language writes the day of the measurement (src/i18n/dates.ts): "November 2,
 * 2026", "2 de novembro de 2026", "2 de noviembre de 2026". A space may be a no-break one.
 */
export const MEASURED_DATE: Record<Lang, RegExp> = Object.fromEntries(
  LANGS.map((lang) => {
    const months = monthNames(lang).join('|');
    const source = lang === 'en' ? `(?:${months})\\s\\d{1,2},\\s\\d{4}` : `\\d{1,2}\\sde\\s(?:${months})\\sde\\s\\d{4}`;
    return [lang, new RegExp(`(?<![\\p{L}\\p{N}])${source}(?![\\p{L}\\p{N}])`, 'u')];
  }),
) as Record<Lang, RegExp>;

function parsed(html: string): HTMLElement {
  const root = parse(html);
  for (const hidden of root.querySelectorAll('script, style, noscript, template, svg')) hidden.remove();
  return root;
}

/** The text of an element with a break between its blocks, so a heading and the paragraph after it stay two words. */
const textOf = (node: HTMLElement): string => node.structuredText;

const words = (text: string): number => text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

/** The words of the guide's own text: the blocks marked data-guide-text (not the tool, the tables, the sources or the cards). */
export function guideWords(html: string): number {
  return parsed(html)
    .querySelectorAll('[data-guide-text]')
    .reduce((sum, block) => sum + words(textOf(block)), 0);
}

/** The filler phrases of a text: its language's list and, for Portuguese and Spanish, the English one too. */
export function findFiller(text: string, lang: Lang = DEFAULT_LANG): string[] {
  const flat = text.replace(/\s+/g, ' ');
  const lists = lang === 'en' ? [FILLER] : [FILLER_BY_LANG[lang], FILLER];
  return lists.flat().filter(({ pattern }) => pattern.test(flat)).map(({ label }) => label);
}

export interface GuideWant {
  /** The path of the tool page the guide embeds and links to, in the language of the guide. */
  toolPath: string;
  /** The language of the guide (English by default, as in the F5b). */
  lang?: Lang;
}

/** Where a selector first appears in the HTML of main, or -1. */
function at(main: HTMLElement, selector: string): number {
  const node = main.querySelector(selector);
  if (!node) return -1;
  return main.toString().indexOf(node.toString().slice(0, 120));
}

export function checkFileGuide(html: string, want: GuideWant): string[] {
  const lang = want.lang ?? DEFAULT_LANG;
  const root = parsed(html);
  const main = root.querySelector('main');
  if (!main) return ['sem <main>'];
  const problems: string[] = [];
  // The blocks in this order. F13b (UX-13 A, decision 5; DECISOES § 376 and § 565): the signature, the sheet "What we
  // measured" and the tool before the introduction. Before, the introduction came before the tool, and the link to the
  // tool's page was a line of its own right under it (.fo-guide__open).
  const order: [string, string][] = [
    ['nav ol.fo-crumbs', 'o breadcrumb'],
    ['h1', 'o H1'],
    ['.fo-top .fo-reviewed', 'a linha "Reviewed"'],
    ['[data-content="facts"]', 'a ficha "What we measured"'],
    ['#fo-tool-root', 'a ferramenta embutida'],
    ['.fo-guide', 'a introdução'],
    ['.fo-ad--content', 'o AdSlot de conteúdo'],
    ['[data-content="measured"]', 'a seção das medidas'],
    ['[data-content="sources"]', 'as fontes'],
    ['[data-content="related"]', 'as relacionadas'],
  ];
  let last = -1;
  let lastName = '';
  for (const [selector, name] of order) {
    const position = at(main, selector);
    if (position < 0) {
      problems.push(`sem ${name} (${selector})`);
      continue;
    }
    if (position < last) problems.push(`${name} vem antes de ${lastName}`);
    last = position;
    lastName = name;
  }
  if (main.querySelectorAll('#fo-tool-root').length !== 1) problems.push(`${main.querySelectorAll('#fo-tool-root').length} raízes de ferramenta (pede 1)`);
  if (main.querySelectorAll('h1').length !== 1) problems.push('mais de um H1');
  const lead = main.querySelector('.fo-top .fo-lead');
  if (!lead || lead.text.trim() === '') problems.push('sem a linha da pergunta (.fo-lead)');
  // F13b (G-23, F5b F-13): the signature is one line with one date, the review; the first publication went to the history
  // line at the end of the measured section, so the two dates are still on the page. Before, the "Reviewed" line held both.
  const reviewed = main.querySelector('.fo-top .fo-reviewed');
  const reviewDates = reviewed?.querySelectorAll('time[datetime]').length ?? 0;
  if (reviewed && reviewDates !== 1) problems.push(`a linha "Reviewed" com ${reviewDates} datas (pede 1, a da revisão)`);
  // F13b (D-54): the link to the tool's own page is in the text of the guide, never a line of its own under the panel.
  if (main.querySelector('.fo-guide__open')) problems.push('o link "Open the tool" embaixo do painel (.fo-guide__open): o link da ferramenta vai no texto');
  const linked = main.querySelectorAll('[data-guide-text] a[href]').some((link) => link.getAttribute('href') === want.toolPath);
  if (!linked) problems.push(`sem o link para a página da ferramenta (${want.toolPath}) no texto do guia`);
  // What we measured: a table in its scrolling frame (DECISOES § 129), with rows, and a note with the date.
  const measured = main.querySelector('[data-content="measured"]');
  if (measured) {
    const tables = measured.querySelectorAll('.fo-table-wrap table');
    if (tables.length === 0) problems.push('a seção medida sem tabela em .fo-table-wrap');
    if (tables.some((table) => table.querySelectorAll('tbody tr').length === 0)) problems.push('uma tabela medida sem linha');
    if (!MEASURED_DATE[lang].test(measured.text)) problems.push('a seção medida sem a data da medida');
    if (measured.querySelectorAll('time[datetime]').length === 0) problems.push('a seção medida sem o histórico (a data da primeira publicação)');
  }
  const sources = main.querySelector('[data-content="sources"]');
  if (sources) {
    const items = sources.querySelectorAll('li');
    if (items.length === 0) problems.push('nenhuma fonte');
    for (const item of items) {
      const link = item.querySelector('a')?.getAttribute('href') ?? '';
      if (!/^https:\/\//.test(link)) problems.push(`fonte sem link https (${item.text.trim().slice(0, 40)})`);
      if (!item.querySelector('time[datetime]')) problems.push(`fonte sem a data da leitura (${item.text.trim().slice(0, 40)})`);
    }
  }
  const related = main.querySelector('[data-content="related"]');
  if (related) {
    const cards = related.querySelectorAll('a[href]');
    if (cards.length === 0) problems.push('as relacionadas sem link');
    if (cards.length > MAX_GUIDE_RELATED) problems.push(`${cards.length} relacionadas (no máximo ${MAX_GUIDE_RELATED})`);
  }
  // F12 (decision 3; DECISOES § 424): the ads of the map in the guide. Before, two AdSlots at most (the content one after
  // the tool and the rail one). Now the first content ad comes in the text after the tool, with a paragraph between them;
  // five content ads at most (conteudo to conteudo-5) and one multiplex, the last block of <main>; none in the tool and none
  // beside "What we measured". The density and the 1,110 px between them are measured in tests/e2e/fo-ad-map.spec.ts.
  const content = main.querySelectorAll('.fo-ad--content');
  if (content.length > MAX_GUIDE_CONTENT_ADS) problems.push(`${content.length} AdSlots de conteúdo (no máximo ${MAX_GUIDE_CONTENT_ADS})`);
  const multiplex = main.querySelectorAll('.fo-ad--multiplex');
  if (multiplex.length > 1) problems.push(`${multiplex.length} multiplex (no máximo 1)`);
  if (multiplex.length === 1 && main.childNodes.filter((node) => node.nodeType === 1).at(-1) !== multiplex[0]) problems.push('o multiplex não é o último bloco do <main>');
  if (main.querySelectorAll('.fo-ad--rail').length > 0) problems.push('a lateral dentro do <main>');
  if (main.querySelectorAll('#fo-tool-root .fo-ad').length > 0) problems.push('um AdSlot dentro da ferramenta');
  const first = content[0];
  const tool = main.querySelector('#fo-tool-root');
  if (first && tool) {
    const html = main.toString();
    const from = html.indexOf(tool.toString()) + tool.toString().length;
    const between = html.slice(from, html.indexOf(first.toString()));
    if (!/<p[\s>]/.test(between)) problems.push('o 1º AdSlot sem um parágrafo entre a ferramenta e ele');
  }
  const measuredBlock = main.querySelector('[data-content="measured"]');
  const beside = [measuredBlock?.previousElementSibling, measuredBlock?.nextElementSibling].some((element) => element?.classList.contains('fo-ad'));
  if (beside || (measuredBlock?.querySelectorAll('.fo-ad').length ?? 0) > 0) problems.push('um AdSlot ao lado de "What we measured"');
  const count = guideWords(html);
  if (count < MIN_GUIDE_WORDS || count > MAX_GUIDE_WORDS) problems.push(`${count} palavras de texto (pede de ${MIN_GUIDE_WORDS} a ${MAX_GUIDE_WORDS})`);
  for (const label of findFiller(main.querySelectorAll('[data-guide-text]').map(textOf).join(' '), lang)) problems.push(`frase de enchimento: "${label}"`);
  return problems;
}
