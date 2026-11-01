// Content check for the image tool and preset pages, the calculators, the PDF tools and hub (prompt F5a, decision 9)
// and for the whole site (prompt F2, decision 10;
// DECISOES § 58 and on). Pages mark each block with data-content="…" so the check does not depend on
// wording, the same way data-ymyl works in scripts/lib/ymyl.ts. Pure functions over HTML strings,
// returning problem strings in Portuguese; scripts/gates/conteudo.ts loops over dist/ and prints them.
import { relative } from 'node:path';
import { parse, NodeType, type HTMLElement, type Node } from 'node-html-parser';
import { DEFAULT_LANG, routeById, type Lang } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, presetsOf, type ImagePageId } from '../../src/tools/image/registry.ts';
import { CALC_PAGES, calcPresetsOf, type CalcPageId } from '../../src/tools/calc/registry.ts';
import { PDF_PAGES, type PdfToolId } from '../../src/tools/pdf/registry.ts';

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

/** The blocks of a money calculator page (prompt F4, decision 9): how-to, questions, the privacy note, related. */
export const CALC_BLOCKS = ['how', 'faq', 'privacy', 'related'] as const;
/** The privacy note of a calculator says this, in so many words (prompt F4, decision 9). */
export const CALC_PRIVACY_PHRASE = 'your numbers stay on your device';

/** Rule 1 for a calculator or calculator preset: its four blocks, and the privacy note says the numbers stay on the device. */
export function checkCalcPage(html: string): string[] {
  const root = parsePage(html);
  const problems: string[] = [];
  for (const name of CALC_BLOCKS) {
    const blocks = blocksOf(root, name);
    if (blocks.length === 0) problems.push(`sem o bloco ${name} (data-content="${name}")`);
    else problems.push(...BLOCK_CHECKS[name](blocks));
  }
  const privacy = blocksOf(root, 'privacy').map(plainText).join(' ');
  if (privacy && !privacy.includes(CALC_PRIVACY_PHRASE)) problems.push(`o bloco privacy não diz "${CALC_PRIVACY_PHRASE}"`);
  return problems;
}

// ---- The PDF tool pages and the PDF hub (prompt F5a, decision 9; DECISOES § 162) ----------------------------

/** A PDF tool page shows at most this many related cards. */
export const MAX_RELATED_CARDS = 6;
/** A FAQ answer shorter than this is not an answer. */
export const MIN_ANSWER_CHARS = 40;

/**
 * Claims the PDF pages must not make (prompt F5a, decision 9): a superlative, a rank or a number that no
 * measurement backs (a saving, a speed, a head count). The numbers the pages do give are fixed by the code
 * (the 35% of the watermark, the 150 ppi, the 4 to 100 characters of a password) and read as facts, not as
 * benefits, so they do not match: a claim is a number tied to a promise.
 */
export const CLAIMS: { label: string; pattern: RegExp }[] = [
  { label: 'best', pattern: /\bbest\b/i },
  { label: '#1', pattern: /#\s?1\b|\bno\.\s?1\b|\bnumber (?:one|1)\b/i },
  { label: 'fastest', pattern: /\bfastest\b/i },
  { label: 'most popular', pattern: /\bmost (?:popular|trusted|powerful|accurate)\b|\btop[- ]rated\b|\btrusted by\b/i },
  { label: 'economia medida', pattern: /\b(?:up to|as much as|as little as|saves?|shrinks?|reduces?|cuts?|smaller by)\b[^.!?]{0,30}\b\d[\d.,]*\s*(?:%|x\b|×|times\b)/i },
  { label: 'ganho em %', pattern: /\b\d[\d.,]*\s*(?:%|x\b|×)\s*(?:smaller|lighter|faster|less|more|better|off)\b/i },
  { label: 'número de usuários', pattern: /\b\d[\d.,]*\s*(?:million|billion|thousand|k)\+?\s+(?:users|people|customers|files|pdfs|documents|downloads)\b/i },
  { label: 'tempo prometido', pattern: /\b(?:in|within|under|less than)\s+(?:just\s+)?\d+\s*(?:seconds?|secs?|ms|minutes?)\b/i },
];

/** Claims found in a text, by label. */
export function findClaims(text: string): string[] {
  const flat = text.replace(/\s+/g, ' ');
  return CLAIMS.filter(({ pattern }) => pattern.test(flat)).map(({ label }) => label);
}

/** What a PDF tool page must carry besides the five blocks. */
export interface PdfPageWant {
  /** The name of the tool as the cards and the search show it ("Merge PDF"): the H1 and the title start with it. */
  name: string;
  /** The fixed text of the PrivacySeal. */
  seal: string;
  id: PdfToolId;
}

/** The tools whose result is images, not a PDF: what stays in a PDF (form, bookmarks, links) does not apply to them. */
const IMAGE_RESULT: readonly PdfToolId[] = ['pdf-to-jpg'];

/** The specs table says what the tool takes: a row headed "Takes", "What it takes", "Files it takes" or just "Files". */
const SPEC_TAKES = /\btakes?\b|\baccepts?\b|^files$/i;
/** It states a limit: how many files, how big, which range of values or "one at a time". */
const SPEC_LIMIT = /\b(?:no limit|limit|at a time|at most|at least|up to|too (?:big|large)|over \d+|\d+ to \d+|as many as you like|maximum)\b/i;
/** What stays in the file: its form fields, its bookmarks and its links (each needs its word). */
const SPEC_KEPT: { label: string; pattern: RegExp }[] = [
  { label: 'formulário', pattern: /\bforms?\b|\bform fields?\b/i },
  { label: 'marcadores', pattern: /\bbookmarks?\b/i },
  { label: 'links', pattern: /\blinks?\b/i },
];

/**
 * The modes (or options) a tool offers and the row of the specs table that says what each one does, by header
 * (th). A tool that is not here has no modes. Keyed by registry id, so a renamed tool fails to compile.
 */
export const PDF_MODES: Partial<Record<PdfToolId, readonly { mode: string; header: RegExp }[]>> = {
  'split-pdf': [
    { mode: 'every page', header: /every page|each page/i },
    { mode: 'page ranges', header: /range/i },
    { mode: 'picked pages', header: /pick/i },
  ],
  'pdf-to-jpg': [
    { mode: 'formats', header: /format/i },
    { mode: 'resolution', header: /resolution|ppi/i },
    { mode: 'pages', header: /^pages$/i },
  ],
  'compress-pdf': [
    { mode: 'lossless', header: /lossless/i },
    { mode: 'recommended', header: /recommended/i },
    { mode: 'strong', header: /strong/i },
  ],
  'rotate-pdf': [
    { mode: 'all pages', header: /all pages/i },
    { mode: 'page by page', header: /page by page/i },
  ],
  'add-page-numbers-to-pdf': [
    { mode: 'position', header: /position/i },
    { mode: 'format', header: /format/i },
  ],
  'sign-pdf': [
    { mode: 'draw', header: /draw/i },
    { mode: 'upload', header: /image|upload/i },
    { mode: 'type', header: /typed|type/i },
  ],
  'unlock-pdf': [
    { mode: 'restrictions only', header: /restriction/i },
    { mode: 'password to open', header: /password/i },
  ],
  'watermark-pdf': [
    { mode: 'size', header: /size/i },
    { mode: 'opacity', header: /opacity/i },
    { mode: 'direction', header: /direction/i },
  ],
};

/** The word a privacy note must say for the tools that take a secret: it is not kept and does not leave the device. */
export const PDF_SECRETS: Partial<Record<PdfToolId, RegExp>> = {
  'protect-pdf': /\bpassword\b/i,
  'unlock-pdf': /\bpassword\b/i,
  'sign-pdf': /\bsignature\b/i,
};

/** The privacy note says where the work happens and that nothing is sent. */
const PRIVACY_DEVICE = /\b(?:your device|in your browser)\b/i;
const PRIVACY_NOT_SENT = /\b(?:never|not|nothing|no)\b[^.]*\b(?:sent|uploaded|upload|server|leaves?)\b/i;

function specRows(root: HTMLElement): { header: string; text: string }[] {
  return blocksOf(root, 'specs')
    .flatMap((block) => selfOrInside(block, 'tr'))
    .filter((row) => row.querySelector('td') !== null)
    .map((row) => ({ header: plainText(row.querySelector('th') ?? row), text: plainText(row) }));
}

function pdfSpecsProblems(root: HTMLElement, id: PdfToolId): string[] {
  const rows = specRows(root);
  if (rows.length === 0) return []; // checkToolPage already said the table is missing
  const problems: string[] = [];
  const all = rows.map((row) => row.text).join(' ');
  if (!rows.some((row) => SPEC_TAKES.test(row.header))) problems.push('o bloco specs não diz o que a ferramenta aceita (uma linha "Takes" ou "Files")');
  if (!SPEC_LIMIT.test(all)) problems.push('o bloco specs não diz um limite (quantos arquivos, o tamanho ou "um por vez")');
  if (!IMAGE_RESULT.includes(id)) {
    for (const { label, pattern } of SPEC_KEPT) if (!pattern.test(all)) problems.push(`o bloco specs não diz o que acontece com ${label}`);
  }
  for (const { mode, header } of PDF_MODES[id] ?? []) {
    if (!rows.some((row) => header.test(row.header))) problems.push(`o bloco specs não tem uma linha para o modo "${mode}"`);
  }
  return problems;
}

/** The FAQ has real questions: each ends with a question mark, has an answer of some length and is asked once. */
function pdfFaqProblems(root: HTMLElement): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];
  let real = 0;
  for (const details of blocksOf(root, 'faq').flatMap((block) => selfOrInside(block, 'details'))) {
    const summary = children(details, 'summary')[0];
    if (!summary) continue;
    const question = plainText(summary);
    const answer = plainText(details).slice(question.length).trim();
    if (!question.endsWith('?')) problems.push(`a pergunta "${question}" do bloco faq não termina em ?`);
    else if (answer.length < MIN_ANSWER_CHARS) problems.push(`a pergunta "${question}" do bloco faq tem uma resposta de ${answer.length} caractere(s), pede pelo menos ${MIN_ANSWER_CHARS}`);
    else if (seen.has(question)) problems.push(`a pergunta "${question}" aparece duas vezes no bloco faq`);
    else real += 1;
    seen.add(question);
  }
  if (real < MIN_FAQ_QUESTIONS) problems.push(`o bloco faq tem ${real} pergunta(s) de verdade, pede pelo menos ${MIN_FAQ_QUESTIONS}`);
  return problems;
}

function pdfPrivacyProblems(root: HTMLElement, id: PdfToolId): string[] {
  const text = blocksOf(root, 'privacy').map(plainText).join(' ');
  if (!text) return [];
  const problems: string[] = [];
  if (!PRIVACY_DEVICE.test(text)) problems.push('o bloco privacy não diz que o trabalho é feito no aparelho ou no navegador');
  if (!PRIVACY_NOT_SENT.test(text)) problems.push('o bloco privacy não diz que o arquivo não é enviado');
  const secret = PDF_SECRETS[id];
  if (secret && !secret.test(text)) problems.push(`o bloco privacy não fala de ${secret.source.replace(/\\b/g, '')}, que a ferramenta recebe`);
  return problems;
}

function pdfRelatedProblems(root: HTMLElement): string[] {
  const hrefs = new Set(
    blocksOf(root, 'related')
      .flatMap((block) => selfOrInside(block, 'a'))
      .map((link) => (link.getAttribute('href') ?? '').trim())
      .filter((href) => href !== '' && !href.startsWith('#')),
  );
  return hrefs.size <= MAX_RELATED_CARDS ? [] : [`o bloco related tem ${hrefs.size} cartões, no máximo ${MAX_RELATED_CARDS}`];
}

/**
 * Rule 4 (F5a): a PDF tool page. The five blocks of rule 1, and on top: one H1 that starts with the tool name and
 * sits with the PrivacySeal; the title starts with the tool name too; the specs say what the tool takes, a limit,
 * what stays (form, bookmarks, links) and what each mode does; four real questions; a privacy note that says the
 * work is done on the device, that nothing is sent and, for a password or a signature, that it is not kept; at most
 * six related cards; and no best, #1 or unmeasured number (CLAIMS).
 */
export function checkPdfPage(html: string, want: PdfPageWant): string[] {
  const root = parsePage(html);
  const problems = checkToolPage(html);
  const name = normalizeText(want.name);

  const h1s = root.querySelectorAll('h1');
  const h1 = h1s[0];
  if (h1s.length !== 1 || !h1) problems.push(`${h1s.length} H1, pede 1`);
  else {
    if (!plainText(h1).startsWith(name)) problems.push(`o H1 "${plainText(h1)}" não começa pelo nome da ferramenta ("${want.name}")`);
    const seal = h1.parentNode?.querySelector('.fo-seal');
    if (!seal) problems.push('sem o PrivacySeal (.fo-seal) junto do H1');
    else if (plainText(seal) !== normalizeText(want.seal)) problems.push(`o PrivacySeal diz "${plainText(seal)}", o texto fixo é "${want.seal}"`);
  }

  const title = normalizeText(root.querySelector('title')?.text ?? '');
  if (!title.startsWith(name)) problems.push(`o título "${title}" não começa pelo nome da ferramenta ("${want.name}")`);
  if (normalizeText(root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '') === '') problems.push('sem meta description');

  problems.push(...pdfSpecsProblems(root, want.id), ...pdfFaqProblems(root), ...pdfPrivacyProblems(root, want.id), ...pdfRelatedProblems(root));

  const claims = findClaims(`${root.querySelector('title')?.text ?? ''} ${root.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''} ${visibleText(html, 'main', ['.fo-ad'])}`);
  for (const claim of claims) problems.push(`afirmação sem medida na página: ${claim}`);
  return problems;
}

/** What the PDF hub must carry: its name, and the path of every card (the tools of the registry and the Image to PDF card). */
export interface PdfHubWant {
  name: string;
  paths: readonly string[];
}

/**
 * Rule 5 (F5a): the PDF hub. One H1 that names the PDF tools, a title that starts with the hub name, a card for
 * every tool of the registry (and no other), a guide that links to each of them, the note on how the files stay
 * on the device, and no best, #1 or unmeasured number. The hub has no PrivacySeal: like the image hub, it is a list.
 */
export function checkPdfHub(html: string, want: PdfHubWant): string[] {
  const root = parsePage(html);
  const problems: string[] = [];
  const h1s = root.querySelectorAll('h1');
  const h1 = h1s[0];
  if (h1s.length !== 1 || !h1) problems.push(`${h1s.length} H1, pede 1`);
  else if (!/\bpdf\b/i.test(plainText(h1))) problems.push(`o H1 "${plainText(h1)}" não fala de PDF`);
  const title = normalizeText(root.querySelector('title')?.text ?? '');
  if (!title.startsWith(normalizeText(want.name))) problems.push(`o título "${title}" não começa pelo nome do hub ("${want.name}")`);
  if (normalizeText(root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '') === '') problems.push('sem meta description');

  const cards = root.querySelectorAll('main a.fo-tool').map((card) => card.getAttribute('href') ?? '');
  const absent = want.paths.filter((path) => !cards.includes(path));
  const extra = cards.filter((path) => !want.paths.includes(path));
  if (absent.length) problems.push(`faltam os cartões de ${absent.join(', ')}`);
  if (extra.length) problems.push(`cartões fora do registro: ${extra.join(', ')}`);
  if (new Set(cards).size !== cards.length) problems.push('um cartão aparece duas vezes');

  const guide = root.querySelector('section[aria-labelledby="guide"]');
  if (!guide) problems.push('sem a seção do guia (aria-labelledby="guide")');
  else {
    const linked = new Set(guide.querySelectorAll('a').map((link) => link.getAttribute('href') ?? ''));
    const missing = want.paths.filter((path) => !linked.has(path));
    if (missing.length) problems.push(`o guia não leva a ${missing.join(', ')}`);
  }
  const privacy = root.querySelector('section[aria-labelledby="privacy"]');
  const privacyText = privacy ? plainText(privacy) : '';
  if (!privacy) problems.push('sem a seção de privacidade (aria-labelledby="privacy")');
  else if (!PRIVACY_DEVICE.test(privacyText) || !PRIVACY_NOT_SENT.test(privacyText)) problems.push('a seção de privacidade não diz que o trabalho é feito no aparelho e que nada é enviado');

  for (const claim of findClaims(`${root.querySelector('title')?.text ?? ''} ${root.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''} ${visibleText(html, 'main', ['.fo-ad'])}`)) {
    problems.push(`afirmação sem medida na página: ${claim}`);
  }
  return problems;
}

/** The PDF tool a route id names (the hub and every other page are not). */
export function isPdfPage(id: string): id is PdfToolId {
  return Object.hasOwn(PDF_PAGES, id);
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

/** The calculator page a route id names. */
export function isCalcPage(id: string): id is CalcPageId {
  return Object.hasOwn(CALC_PAGES, id);
}

/** Paths a calculator preset is compared against: its parent calculator, then the sibling presets. */
export function calcComparisonPaths(id: CalcPageId): string[] {
  const parent = CALC_PAGES[id].parent;
  if (!parent) return [];
  return [parent, ...calcPresetsOf(parent).filter((preset) => preset !== id)].map((other) => CALC_PAGES[other].path);
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
