// The height of the blocks of <main> at 360 px, estimated at build time (F12, decision 3; DECISOES § 419). The build
// places the content ads after the first by this estimate, so it errs on the short side: the text counts with more
// characters per line than the site shows on average, a card with the height of the shortest one, a margin only where
// the CSS surely puts it. The Playwright test of the map (tests/e2e/fo-ad-map.spec.ts) measures the real heights, and a
// page that fails the 1,110 px there is fixed here or in the view, never in the limit.
//
// The model, calibrated on the dist/ of the F12 at 360 × 740 with the fonts loaded (the estimate of each block of <main>
// against its real height, on the 184 pages with ads): the column is 328 px wide (360 minus the 16 px gutters); the
// running text, Figtree 16/26, with 48 characters a line at 328 px (the site averages 44); a list item at its 304 px;
// a heading in Fredoka 24/30 with 34 a line; a question of the FAQ, 17/24 bold, with 36 a line in its 280 px; a table
// row 17 px of padding and border plus 22 px a line of its longest cell, which gets the column but 82 px a cell; a
// ToolCard 158 px, a GuideCard 239 px and the GuideCard of the "How to" 176 px (the shortest of each), one per row at
// this width; a section 48 px above it; the 16 px gap of the grids of <main>, of the cards and of the schedule. The
// margins of the text (12 px under a paragraph or a list) only inside .fo-prose, where the CSS puts them.
import { MARK_TAG, classesOf, hasClass, isElement, isInvisible, normalized, parseHtml, textOf, type AdMarkKind, type Element } from './html.ts';

/** The width of <main> at 360 px. */
export const PHONE_COLUMN = 328;

interface Font {
  /** Characters a line at the full column width (328 px). */
  cpl: number;
  /** Line height. */
  lh: number;
}

const BODY: Font = { cpl: 48, lh: 26 };
const H2: Font = { cpl: 34, lh: 30 };
const H3: Font = { cpl: 40, lh: 26 };
const SMALL: Font = { cpl: 54, lh: 20 };
const CRUMBS: Font = { cpl: 50, lh: 32 };
const QUESTION: Font = { cpl: (36 * PHONE_COLUMN) / 280, lh: 24 };
const CELL: Font = { cpl: 49, lh: 22 };

const TOOL_CARD = 158;
const GUIDE_CARD = 239;
const GUIDE_CARD_HERE = 176;
const GAP = 16;
const SECTION_TOP = 48;
const PROSE_MARGIN = 12;
const ROW_PADDING = 17;
const WRAPPED_ROW = 38;
/** The room of a narrow cell (the label column of the two-column tables). */
const NARROW_CELL = 82;

/** A mark of a view and where it falls, in px from the top of <main>, at 360 px. */
export interface PlacedMark {
  kind: AdMarkKind;
  y: number;
}

interface Context {
  width: number;
  /** Inside .fo-prose, where a paragraph and a list keep 12 px under them. */
  prose: boolean;
  marks: PlacedMark[];
}

function lines(text: string, font: Font, width: number): number {
  const length = normalized(text).length;
  if (length === 0) return 0;
  return Math.max(1, Math.ceil(length / ((font.cpl * width) / PHONE_COLUMN)));
}

const textBlock = (element: Element, font: Font, width: number): number => lines(textOf(element), font, width) * font.lh;

/** The children that take room: elements that are not hidden, and the marks (which take none). */
const kidsOf = (element: Element): Element[] => element.kids.filter(isElement).filter((kid) => kid.tag === MARK_TAG || !isInvisible(kid));

const BLOCKS = new Set(['p', 'ul', 'ol', 'div', 'section', 'table', 'details', 'h1', 'h2', 'h3', 'h4', 'nav', 'figure', 'form', 'fieldset', 'blockquote', 'dl', 'aside', 'header', 'footer']);
const hasBlocks = (element: Element): boolean => kidsOf(element).some((kid) => BLOCKS.has(kid.tag) || hasClass(kid, 'fo-tool') || hasClass(kid, 'fo-guidecard'));

function mark(element: Element, y: number, context: Context): void {
  context.marks.push({ kind: element.attrs['kind'] === 'first' ? 'first' : 'break', y });
}

function tableHeight(table: Element, width: number, wrapped: boolean): number {
  const rows: Element[] = [];
  const collect = (element: Element): void => {
    for (const kid of kidsOf(element)) {
      if (kid.tag === 'tr') rows.push(kid);
      else if (['thead', 'tbody', 'tfoot'].includes(kid.tag)) collect(kid);
    }
  };
  collect(table);
  const caption = kidsOf(table).some((kid) => kid.tag === 'caption') ? 28 : 0;
  return rows.reduce((sum, row) => {
    if (wrapped) return sum + WRAPPED_ROW;
    const cells = kidsOf(row).filter((cell) => cell.tag === 'td' || cell.tag === 'th');
    const longest = Math.max(0, ...cells.map((cell) => normalized(textOf(cell)).length));
    const room = Math.max(NARROW_CELL, width - NARROW_CELL * Math.max(0, cells.length - 1));
    return sum + ROW_PADDING + CELL.lh * Math.max(1, Math.ceil(longest / ((CELL.cpl * room) / PHONE_COLUMN)));
  }, caption);
}

/**
 * Lays the children of a block one under the other from `y`, with `gap` between them (a grid container), records where each
 * mark falls and returns the height. A mark falls at the end of the block before it, margin included.
 */
function stack(element: Element, y: number, context: Context, gap = 0): number {
  let at = y;
  let first = true;
  for (const kid of kidsOf(element)) {
    if (kid.tag === MARK_TAG) {
      mark(kid, at, context);
      continue;
    }
    if (!first) at += gap;
    first = false;
    at += layout(kid, at, context);
  }
  return at - y;
}

function faqHeight(faq: Element, y: number, context: Context): number {
  let at = y + 2;
  for (const details of kidsOf(faq)) {
    if (details.tag === MARK_TAG) {
      mark(details, at, context);
      continue;
    }
    const summary = kidsOf(details).find((kid) => kid.tag === 'summary');
    at += summary ? Math.max(56, 24 + QUESTION.lh * lines(textOf(summary), QUESTION, context.width)) : 56;
    if ('open' in details.attrs) {
      const answer: Context = { width: context.width - 40, prose: false, marks: [] };
      for (const kid of kidsOf(details).filter((part) => part.tag !== 'summary')) at += 16 + stack(kid, at, answer);
    }
    at += 1;
  }
  return at - y;
}

/** The estimated height of one element, its own vertical margins included; the marks inside it are recorded. */
function layout(element: Element, y: number, context: Context): number {
  if (isInvisible(element) || element.tag === 'br') return 0;
  const { width } = context;
  const classes = classesOf(element);
  const has = (name: string): boolean => classes.includes(name);
  const inner: Context = has('fo-prose') && !context.prose ? { ...context, prose: true } : context;
  const sealed: Context = { ...inner, marks: [] };
  if (has('fo-tool')) return TOOL_CARD;
  if (has('fo-guidecard')) return has('fo-guidecard--here') ? GUIDE_CARD_HERE : GUIDE_CARD;
  if (has('fo-grid') || has('fo-guidecards')) return stack(element, y, sealed, GAP);
  if (has('fo-faq')) return faqHeight(element, y, inner);
  if (has('fo-crumbs')) return textBlock(element, CRUMBS, width);
  if (has('fo-table-wrap')) return kidsOf(element).reduce((sum, kid) => sum + (kid.tag === 'table' ? tableHeight(kid, width, true) : layout(kid, y, sealed)), 0);
  if (element.tag === 'table') return tableHeight(element, width, false);
  // The island of a tool: never between two content ads, held at a small height all the same.
  if (element.attrs['id'] === 'fo-tool-root') return 300;
  if (element.tag === 'section') {
    const top = has('fo-section') ? SECTION_TOP : 0;
    return top + stack(element, y + top, inner, has('fo-calc-schedule') ? GAP : 0);
  }
  if (element.tag === 'h1') return lines(textOf(element), H2, width) * 34;
  if (element.tag === 'h2') return textBlock(element, H2, width) + 12;
  if (element.tag === 'h3' || element.tag === 'h4') return textBlock(element, H3, width);
  if (element.tag === 'ul' || element.tag === 'ol') {
    const steps = has('fo-steps');
    const indented: Context = { ...sealed, width: inner.prose || steps ? width - 24 : width };
    const items = kidsOf(element).filter((kid) => kid.tag === 'li');
    const height = items.reduce((sum, item) => sum + (hasBlocks(item) ? stack(item, y, indented) : textBlock(item, BODY, indented.width)), 0);
    return height + (steps ? 8 * Math.max(0, items.length - 1) : inner.prose ? PROSE_MARGIN : 0);
  }
  if (element.tag === 'button' || has('fo-btn')) return 48;
  if (has('fo-guidehere')) return 16 + stack(element, y + 16, sealed, GAP);
  if (has('fo-example')) return 12 + stack(element, y + 12, sealed, GAP) + 12;
  if (has('fo-reviewed')) return textBlock(element, SMALL, width);
  if (element.tag === 'p') return textBlock(element, BODY, width) + (has('fo-more') ? 16 : inner.prose && !has('fo-reviewed') ? PROSE_MARGIN : 0);
  if (hasBlocks(element)) return stack(element, y, inner, has('fo-calc-schedule') || has('fo-hubband') || has('fo-top') ? 8 : 0);
  return textBlock(element, BODY, width);
}

/** The marks of a <main> and where each falls at 360 px, laid out as the grid of <main> lays its blocks (16 px apart). */
export function placeMarks(mainHtml: string): { marks: PlacedMark[]; height: number } {
  const context: Context = { width: PHONE_COLUMN, prose: false, marks: [] };
  const height = stack(parseHtml(mainHtml), 0, context, GAP);
  return { marks: context.marks, height };
}
