// A small reader of the HTML the site renders itself (F12, the ad map; DECISOES § F12-M1). The build reads the <main> of a
// page to place the ad boxes at the block boundaries the view marks, to estimate the height of the blocks between them at
// 360 px and to count the words of <main>. The HTML is the site's own (Astro output: closed tags, quoted attributes), so a
// tag reader is enough; nothing here runs in the browser.

export interface Element {
  tag: string;
  attrs: Record<string, string>;
  kids: Node[];
}
export type Node = Element | string;

/** The marks a view puts between two blocks of <main>: where the first content ad goes, and where a later one may go. */
export const AD_MARK = { first: '<!--fo-ad:first-->', break: '<!--fo-ad:break-->' } as const;
export type AdMarkKind = keyof typeof AD_MARK;
export const AD_MARKS = /<!--fo-ad:(first|break)-->/g;
/** The tag of a mark in the tree; its kind is in attrs.kind. */
export const MARK_TAG = '#mark';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
/** Elements whose content is not HTML: their text is kept as is, up to the closing tag. */
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const TOKEN = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s/>"'=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|[^<]+|</g;
const ATTR = /([^\s/>"'=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const MARK = /^<!--fo-ad:(first|break)-->$/;

function attrsOf(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(ATTR)) {
    const name = match[1];
    if (name) attrs[name.toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

/** The tree of a piece of HTML, under a root element "#root". The ad marks become "#mark" elements; other comments go. */
export function parseHtml(html: string): Element {
  const root: Element = { tag: '#root', attrs: {}, kids: [] };
  const stack: Element[] = [root];
  const lower = html.toLowerCase();
  const token = new RegExp(TOKEN.source, 'g');
  for (let match = token.exec(html); match; match = token.exec(html)) {
    const text = match[0];
    const top = stack[stack.length - 1] ?? root;
    if (text.startsWith('<!--')) {
      const mark = MARK.exec(text);
      if (mark?.[1]) top.kids.push({ tag: MARK_TAG, attrs: { kind: mark[1] }, kids: [] });
      continue;
    }
    if (match[1]) {
      const at = stack.map((element) => element.tag).lastIndexOf(match[1].toLowerCase());
      if (at > 0) stack.length = at;
      continue;
    }
    if (match[2]) {
      const tag = match[2].toLowerCase();
      const element: Element = { tag, attrs: attrsOf(match[3] ?? ''), kids: [] };
      top.kids.push(element);
      if (match[4] === '/' || VOID.has(tag)) continue;
      if (RAW.has(tag)) {
        const end = lower.indexOf(`</${tag}`, token.lastIndex);
        const stop = end < 0 ? html.length : end;
        element.kids.push(html.slice(token.lastIndex, stop));
        token.lastIndex = stop;
        continue;
      }
      stack.push(element);
      continue;
    }
    top.kids.push(text);
  }
  return root;
}

export const isElement = (node: Node): node is Element => typeof node !== 'string';

export function classesOf(element: Element): string[] {
  return (element.attrs['class'] ?? '').split(/\s+/).filter(Boolean);
}

export function hasClass(element: Element, name: string): boolean {
  return classesOf(element).includes(name);
}

/** Never visible text: scripts, styles, templates, the SVG drawings, hidden elements and the screen-reader-only ones. */
export function isInvisible(element: Element): boolean {
  return ['script', 'style', 'template', 'noscript', 'svg', 'link', 'meta', 'title', MARK_TAG].includes(element.tag) || 'hidden' in element.attrs || hasClass(element, 'fo-sr');
}

const ENTITY = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi;
const SPACE_ENTITY = /&(?:nbsp|#160|#xa0);/gi;
const NEVER_TEXT = new Set(['script', 'style', 'template', 'noscript', 'svg', MARK_TAG]);

/** The text of a node as a person reads it: an entity is one character; with `all`, the hidden text too. */
export function textOf(node: Node, options: { all?: boolean } = {}): string {
  if (!isElement(node)) return node.replace(SPACE_ENTITY, ' ').replace(ENTITY, '_');
  if (NEVER_TEXT.has(node.tag) || (!options.all && isInvisible(node))) return '';
  return ` ${node.kids.map((kid) => textOf(kid, options)).join(' ')} `;
}

export const normalized = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * The words of a piece of HTML as gate:prontidao counts them in <main> (visibleText of scripts/lib/conteudo.ts): the text
 * of every element but scripts, styles, noscript, templates and SVG, split on whitespace. The hidden and the
 * screen-reader-only text counts there, so it counts here.
 */
export function wordsOf(html: string): number {
  return normalized(textOf(parseHtml(html), { all: true })).split(' ').filter(Boolean).length;
}
