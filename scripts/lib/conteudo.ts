// Content check for the image tool and preset pages and for the whole site (prompt F2, decision 10;
// DECISOES § 58 and on). Pages mark each block with data-content="…" so the check does not depend on
// wording, the same way data-ymyl works in scripts/lib/ymyl.ts. Pure functions over HTML strings,
// returning problem strings in Portuguese; scripts/gates/conteudo.ts loops over dist/ and prints them.
import { relative } from 'node:path';
import { parse, NodeType, type HTMLElement, type Node } from 'node-html-parser';
import { DEFAULT_LANG, routeById, type Lang } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, presetsOf, type ImagePageId } from '../../src/tools/image/registry.ts';

export const CONTENT_BLOCKS = ['how', 'specs', 'faq', 'privacy', 'related'] as const;
export type ContentBlock = (typeof CONTENT_BLOCKS)[number];

export const MIN_HOW_STEPS = 3;
export const MIN_FAQ_QUESTIONS = 4;
export const MIN_PRIVACY_CHARS = 40;
/** A preset page needs this many blocks that appear on neither its parent nor its sibling presets. */
export const MIN_OWN_BLOCKS = 3;

/**
 * Placeholder wording that must not reach the visible text of any page. TODO and TBD are
 * case-sensitive: "todo" is a plain word in Portuguese and Spanish. The last two are the
 * Portuguese and Spanish forms of "more tools are coming" that the legal pages used to carry.
 */
export const PLACEHOLDERS: { label: string; pattern: RegExp }[] = [
  { label: 'coming soon', pattern: /\bcoming soon\b/i },
  { label: 'em breve', pattern: /\bem breve\b/i },
  { label: 'próximamente', pattern: /\bpr[oó]ximamente\b/i },
  { label: 'lorem', pattern: /\blorem\b/i },
  { label: 'ipsum', pattern: /\bipsum\b/i },
  { label: 'TODO', pattern: /\bTODO\b/ },
  { label: 'TBD', pattern: /\bTBD\b/ },
  { label: 'placeholder text', pattern: /\bplaceholder text\b/i },
  { label: 'más adelante', pattern: /\bm[aá]s adelante\b/i },
  { label: 'more tools are coming', pattern: /\bmore tools are coming\b/i },
  { label: 'mais ferramentas estão a caminho', pattern: /\bmais ferramentas est[aã]o a caminho\b/i },
  { label: 'vienen más en camino', pattern: /\bvienen m[aá]s en camino\b/i },
];

/** Lowercase, collapsed whitespace, digits kept: how block texts are compared between pages. */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Text of a node with a space at every element boundary, so "<li>a</li><li>b</li>" reads "a b". */
function textOf(node: Node): string {
  if (node.nodeType === NodeType.TEXT_NODE) return node.text;
  if (node.nodeType !== NodeType.ELEMENT_NODE) return '';
  return ` ${(node as HTMLElement).childNodes.map(textOf).join(' ')} `;
}

/** Parses a page and drops what is never visible text (scripts, styles, noscript, templates, SVG). */
function parsePage(html: string): HTMLElement {
  const root = parse(html);
  for (const hidden of root.querySelectorAll('script, style, noscript, template, svg')) hidden.remove();
  return root;
}

function plainText(node: Node): string {
  return normalizeText(textOf(node));
}

/** The element itself (when it is the tag) and the elements of that tag inside it. */
function selfOrInside(block: HTMLElement, tag: string): HTMLElement[] {
  const inside = block.querySelectorAll(tag);
  return block.tagName.toLowerCase() === tag ? [block, ...inside] : inside;
}

function blocksOf(root: HTMLElement, name: string): HTMLElement[] {
  return root.querySelectorAll(`[data-content="${name}"]`);
}

function children(element: HTMLElement, tag: string): HTMLElement[] {
  return element.children.filter((child) => child.tagName.toLowerCase() === tag);
}

function howProblems(blocks: HTMLElement[]): string[] {
  const lists = blocks.flatMap((block) => selfOrInside(block, 'ol'));
  if (lists.length === 0) return ['o bloco how não tem lista ordenada (<ol>)'];
  const steps = Math.max(...lists.map((list) => children(list, 'li').filter((li) => plainText(li) !== '').length));
  return steps >= MIN_HOW_STEPS ? [] : [`o bloco how tem ${steps} passo(s), pede pelo menos ${MIN_HOW_STEPS}`];
}

function specsProblems(blocks: HTMLElement[]): string[] {
  const tables = blocks.flatMap((block) => selfOrInside(block, 'table'));
  if (tables.length === 0) return ['o bloco specs não tem tabela (<table>)'];
  const hasBodyRow = tables.some((table) =>
    table
      .querySelectorAll('tr')
      .some((row) => row.parentNode.tagName?.toLowerCase() !== 'thead' && row.querySelector('td') !== null && plainText(row) !== ''),
  );
  return hasBodyRow ? [] : ['a tabela do bloco specs não tem linha de corpo'];
}

function faqProblems(blocks: HTMLElement[]): string[] {
  const questions = blocks
    .flatMap((block) => selfOrInside(block, 'details'))
    .filter((details) => {
      const summary = children(details, 'summary')[0];
      if (!summary) return false;
      const question = plainText(summary);
      return question !== '' && plainText(details).length > question.length;
    });
  return questions.length >= MIN_FAQ_QUESTIONS
    ? []
    : [`o bloco faq tem ${questions.length} pergunta(s) com resposta (<details><summary>), pede pelo menos ${MIN_FAQ_QUESTIONS}`];
}

function privacyProblems(blocks: HTMLElement[]): string[] {
  const length = blocks.reduce((sum, block) => sum + plainText(block).length, 0);
  return length >= MIN_PRIVACY_CHARS ? [] : [`o bloco privacy tem ${length} caractere(s) de texto, pede pelo menos ${MIN_PRIVACY_CHARS}`];
}

function relatedProblems(blocks: HTMLElement[]): string[] {
  const linked = blocks.some((block) =>
    selfOrInside(block, 'a').some((link) => {
      const href = (link.getAttribute('href') ?? '').trim();
      return href !== '' && !href.startsWith('#');
    }),
  );
  return linked ? [] : ['o bloco related não tem nenhum link (<a href>)'];
}

const BLOCK_CHECKS: Record<ContentBlock, (blocks: HTMLElement[]) => string[]> = {
  how: howProblems,
  specs: specsProblems,
  faq: faqProblems,
  privacy: privacyProblems,
  related: relatedProblems,
};

/** Rule 1: the five content blocks of a tool or preset page (the page path is added by the gate). */
export function checkToolPage(html: string): string[] {
  const root = parsePage(html);
  const problems: string[] = [];
  for (const name of CONTENT_BLOCKS) {
    const blocks = blocksOf(root, name);
    if (blocks.length === 0) problems.push(`sem o bloco ${name} (data-content="${name}")`);
    else problems.push(...BLOCK_CHECKS[name](blocks));
  }
  return problems;
}

/** Elements with data-content that are not inside another one: each is counted once. */
function topLevelBlocks(root: HTMLElement): HTMLElement[] {
  return root.querySelectorAll('[data-content]').filter((block) => {
    for (let parent: HTMLElement | null = block.parentNode; parent; parent = parent.parentNode) {
      if (parent.hasAttribute('data-content')) return false;
    }
    return true;
  });
}

/**
 * Rule 2: a preset page needs at least MIN_OWN_BLOCKS blocks whose text appears neither in the
 * parent page nor in a sibling preset. `others` are the whole pages to compare against (parent
 * first, then the siblings); a block counts as shared when its text is a piece of their text.
 */
export function checkPresetPage(html: string, others: Record<string, string>): string[] {
  const root = parsePage(html);
  const pages = Object.entries(others).map(([path, other]) => ({ path, text: plainText(parsePage(other)) }));
  const own: string[] = [];
  const shared: string[] = [];
  for (const block of topLevelBlocks(root)) {
    const name = block.getAttribute('data-content') ?? '';
    const text = plainText(block);
    const copy = pages.find((page) => page.text.includes(text));
    if (copy) shared.push(`${name} (igual em ${copy.path})`);
    else own.push(name);
  }
  if (own.length >= MIN_OWN_BLOCKS) return [];
  return [`só ${own.length} bloco(s) próprio(s) (${own.join(', ') || 'nenhum'}), pede pelo menos ${MIN_OWN_BLOCKS} que não existam na página-mãe nem nos presets irmãos; repetidos: ${shared.join(', ') || 'nenhum'}`];
}

/**
 * Visible text of a page inside `selector` (the body by default), one space at each element boundary;
 * scripts, styles, noscript, templates, SVG and the elements of `drop` are left out.
 */
export function visibleText(html: string, selector = 'body', drop: readonly string[] = []): string {
  const root = parsePage(html);
  for (const element of drop.length ? root.querySelectorAll(drop.join(', ')) : []) element.remove();
  const scope = root.querySelector(selector);
  if (!scope && selector !== 'body') return '';
  return textOf(scope ?? root).replace(/\s+/g, ' ').trim();
}

/** Placeholder wording found in the visible text of a page (not in attributes, scripts or styles). */
export function findPlaceholders(html: string): string[] {
  const text = visibleText(html);
  return PLACEHOLDERS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
}

export interface SitePage {
  path: string;
  html: string;
}

function metaOf(html: string): { title: string; description: string } {
  const root = parse(html);
  return {
    title: normalizeText(root.querySelector('title')?.text ?? ''),
    description: normalizeText(root.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''),
  };
}

function repeated(label: string, values: Map<string, string[]>): string[] {
  return [...values].filter(([, paths]) => paths.length > 1).map(([value, paths]) => `${label} em ${paths.join(', ')}: "${value}"`);
}

/** Rule 3: no title or description shared by two pages, and no placeholder wording in any page. */
export function checkSite(pages: SitePage[]): string[] {
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();
  const problems: string[] = [];
  for (const page of pages) {
    const { title, description } = metaOf(page.html);
    if (title) titles.set(title, [...(titles.get(title) ?? []), page.path]);
    if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), page.path]);
    for (const label of findPlaceholders(page.html)) problems.push(`${page.path}: texto provisório "${label}"`);
  }
  return [...repeated('título repetido', titles), ...repeated('descrição repetida', descriptions), ...problems];
}

/** The page of the registry that a route id names, or undefined for the hub, legal pages and so on. */
export function isImagePage(id: string): id is ImagePageId {
  return Object.hasOwn(IMAGE_PAGES, id);
}

/** Paths a preset is compared against in one language: its parent tool, then the sibling presets. */
export function comparisonPaths(id: ImagePageId, lang: Lang = DEFAULT_LANG): string[] {
  const parent = IMAGE_PAGES[id].parent;
  if (!parent) return [];
  return [parent, ...presetsOf(parent).filter((preset) => preset !== id)]
    .map((other) => routeById(other).paths[lang])
    .filter((path): path is string => path !== undefined);
}

/** URL path of a dist file: 'dist/pt/sobre/index.html' -> '/pt/sobre/'; 'dist/404.html' -> '/404.html'. */
export function pathOfFile(file: string, dist = 'dist'): string {
  const rel = `/${relative(dist, file).split('\\').join('/')}`;
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

/** The 404 pages are not content: they repeat the site title and have no description of their own. */
export function isNotFoundPath(path: string): boolean {
  return path.endsWith('/404.html');
}
