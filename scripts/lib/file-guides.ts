// The content rules of the file guides (prompt F5b, decisions 4 and 5): the blocks of the page in their order, 800 to
// 1,500 words of text, no filler phrase. Pure functions over the HTML of a guide, returning problems in Portuguese;
// scripts/gates/conteudo.ts runs them on every guide of the registry, and tests/unit/conteudo.test.ts proves each one.
import { parse, type HTMLElement } from 'node-html-parser';

export const MIN_GUIDE_WORDS = 800;
export const MAX_GUIDE_WORDS = 1500;
/** At most this many related cards, as on a tool page. */
export const MAX_GUIDE_RELATED = 6;

/** Phrases that fill space without saying anything (prompt F5b, decision 5.7; the F4 list). */
export const FILLER: { label: string; pattern: RegExp }[] = [
  { label: "in today's world", pattern: /\bin today[’']s (?:world|digital world|age)\b/i },
  { label: 'delve', pattern: /\bdelv(?:e|es|ed|ing)\b/i },
  { label: "it's important to note", pattern: /\bit[’']s (?:important|worth|crucial) to (?:note|mention|remember)\b|\bit is (?:important|worth|crucial) to (?:note|mention|remember)\b/i },
  { label: 'in conclusion', pattern: /\bin conclusion\b/i },
  { label: 'in summary', pattern: /\bin summary\b/i },
  { label: 'needless to say', pattern: /\bneedless to say\b/i },
];

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

export function findFiller(text: string): string[] {
  const flat = text.replace(/\s+/g, ' ');
  return FILLER.filter(({ pattern }) => pattern.test(flat)).map(({ label }) => label);
}

export interface GuideWant {
  /** The path of the tool page the guide embeds and links to. */
  toolPath: string;
}

/** Where a selector first appears in the HTML of main, or -1. */
function at(main: HTMLElement, selector: string): number {
  const node = main.querySelector(selector);
  if (!node) return -1;
  return main.toString().indexOf(node.toString().slice(0, 120));
}

export function checkFileGuide(html: string, want: GuideWant): string[] {
  const root = parsed(html);
  const main = root.querySelector('main');
  if (!main) return ['sem <main>'];
  const problems: string[] = [];
  // The blocks of decision 4, in this order.
  const order: [string, string][] = [
    ['nav ol.fo-crumbs', 'o breadcrumb'],
    ['h1', 'o H1'],
    ['.fo-top .fo-reviewed', 'a linha "Reviewed"'],
    ['.fo-guide', 'a introdução'],
    ['#fo-tool-root', 'a ferramenta embutida'],
    ['.fo-guide__open', 'o link para a página da ferramenta'],
    ['.fo-ad--content', 'o AdSlot de conteúdo'],
    ['[data-content="measured"]', 'a seção "What we measured"'],
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
  const reviewed = main.querySelector('.fo-top .fo-reviewed');
  if (reviewed && reviewed.querySelectorAll('time[datetime]').length < 2) problems.push('a linha "Reviewed" sem as duas datas');
  const open = main.querySelector('.fo-guide__open a');
  if (open && open.getAttribute('href') !== want.toolPath) problems.push(`o link da ferramenta leva a ${open.getAttribute('href') ?? 'nada'} em vez de ${want.toolPath}`);
  // What we measured: a table in its scrolling frame (DECISOES § 129), with rows, and a note with the date.
  const measured = main.querySelector('[data-content="measured"]');
  if (measured) {
    const tables = measured.querySelectorAll('.fo-table-wrap table');
    if (tables.length === 0) problems.push('a seção medida sem tabela em .fo-table-wrap');
    if (tables.some((table) => table.querySelectorAll('tbody tr').length === 0)) problems.push('uma tabela medida sem linha');
    if (!/\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/.test(measured.text)) problems.push('a seção medida sem a data da medida');
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
  // Two AdSlots at most: the content one after the tool and the rail one.
  if (main.querySelectorAll('.fo-ad').length > 2) problems.push(`${main.querySelectorAll('.fo-ad').length} AdSlots (no máximo 2)`);
  const count = guideWords(html);
  if (count < MIN_GUIDE_WORDS || count > MAX_GUIDE_WORDS) problems.push(`${count} palavras de texto (pede de ${MIN_GUIDE_WORDS} a ${MAX_GUIDE_WORDS})`);
  for (const label of findFiller(main.querySelectorAll('[data-guide-text]').map(textOf).join(' '))) problems.push(`frase de enchimento: "${label}"`);
  return problems;
}
