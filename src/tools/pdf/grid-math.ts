// The arithmetic of the page grid and of the page view (F14; DECISOES § 618, § 619 and § 622), kept pure so Vitest
// checks it (tests/unit/pdf-grid-math.test.ts):
//  - the shape of a page as it will come out: its box, its /Rotate and, in the rotate mode, the person's turns;
//  - the width asked of the thumbnail cache: the shown width times the device pixel ratio, rounded up to 60 px, capped;
//  - the span between the anchor and the page touched with Shift;
//  - the picks of Invert selection and of Shift, and the sentence of the count (Delete's says what comes out).
import type { PageBox } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';

/** The widest picture the grid asks for (section B of PLANO-UX-QV.md). */
export const THUMB_CAP = 720;
/** The widest picture of the page view, in "Fit" and in "Enlarge" (section A). */
export const VIEW_FIT_CAP = 1600;
export const VIEW_ZOOM_CAP = 2400;
/** Widths are asked in steps of 60 px, so a small change of the window does not draw every page again. */
export const WIDTH_STEP = 60;
/** The sheet of a cell keeps the page's shape between these ratios (width over height); an odder page is drawn inside it. */
export const SHEET_MIN_RATIO = 0.5;
export const SHEET_MAX_RATIO = 2;

/** Quarter turns of the page as it will come out (0 to 3): its /Rotate plus the person's turns. */
export function quarters(box: Pick<PageBox, 'rotate'> | undefined, turns = 0): number {
  return ((Math.round((box?.rotate ?? 0) / 90) + turns) % 4 + 4) % 4;
}

/** Width over height of the page as it will come out: the box turned by its /Rotate and by the person's turns. */
export function pageRatio(box: Pick<PageBox, 'width' | 'height' | 'rotate'> | undefined, turns = 0): number {
  const width = box && box.width > 0 ? box.width : 612;
  const height = box && box.height > 0 ? box.height : 792;
  return quarters(box, turns) % 2 === 1 ? height / width : width / height;
}

/** The ratio of the sheet of a cell: the page's own, kept between SHEET_MIN_RATIO and SHEET_MAX_RATIO. */
export function sheetRatio(box: Pick<PageBox, 'width' | 'height' | 'rotate'> | undefined, turns = 0): number {
  return Math.min(SHEET_MAX_RATIO, Math.max(SHEET_MIN_RATIO, pageRatio(box, turns)));
}

/**
 * The width in pixels to ask of the thumbnail cache for a picture shown `cssWidth` CSS pixels wide on a screen of
 * `dpr` device pixels per CSS pixel: `min(cap, cssWidth × dpr)`, rounded up to a multiple of 60, never under 60.
 */
export function askWidth(cssWidth: number, dpr: number, cap: number): number {
  const wanted = Math.min(cap, Math.max(0, cssWidth) * (dpr > 0 ? dpr : 1));
  return Math.max(WIDTH_STEP, Math.ceil(wanted / WIDTH_STEP) * WIDTH_STEP);
}

/**
 * The pages from the anchor to the page touched, both included, in order (page indices of the file). F18: in a grid in
 * another order (Organize PDF), the pages between the two places of `sequence`, in that order.
 */
export function span(anchor: number, target: number, sequence?: readonly number[]): number[] {
  const a = sequence ? sequence.indexOf(anchor) : -1;
  const b = sequence ? sequence.indexOf(target) : -1;
  if (sequence && a >= 0 && b >= 0) return sequence.slice(Math.min(a, b), Math.max(a, b) + 1);
  const from = Math.min(anchor, target);
  const to = Math.max(anchor, target);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Two selections are the same pages (whatever their order). */
export function samePages(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const seen = new Set(a);
  return b.every((page) => seen.has(page));
}

// F14 (items 4, 5 and 9; DECISOES § 627 to § 629): the picks of the grid and the sentence of the count.

/** The words of a count: the grid's texts have them all. */
export type CountTexts = Pick<PdfPanelTexts['grid'], 'selectedCount' | 'leavingCount' | 'leavingOne' | 'keptCount' | 'keptOne'>;

/**
 * Delete's count (section B): "3 of 12 come out · the new PDF keeps 9 pages", with the forms of one ("1 of 12 comes
 * out", "keeps 1 page"), the two halves joined by " · ".
 */
export function leavingCount(texts: CountTexts, count: number, total: number): string {
  const left = Math.max(0, total - count);
  const out = count === 1 ? fmt(texts.leavingOne, { total }) : fmt(texts.leavingCount, { count, total });
  return `${out} · ${left === 1 ? texts.keptOne : fmt(texts.keptCount, { left })}`;
}

/**
 * The count of a grid that picks pages, as the bar shows it and the region says it: Delete's form where a picked page
 * comes out (`removes`), "{count} of {total} pages picked" in Split and Sign. The page view says the same after a pick.
 */
export function countOf(texts: CountTexts, count: number, total: number, removes: boolean): string {
  return removes ? leavingCount(texts, count, total) : fmt(texts.selectedCount, { count, total });
}

// F18 (decision 6 of the prompt): Organize PDF, where a picked page is one the bar acts on and a page that comes out is
// another state of its own.

/** The words of Organize's count. */
export type MarkedTexts = Pick<PdfPanelTexts['grid'], 'markedCount' | 'markedOne' | 'keptCount' | 'keptOne'>;

/**
 * Organize's count: "3 picked · the new PDF keeps 9 pages", with the forms of one ("1 picked", "keeps 1 page"), the two
 * halves joined by " · " like Delete's. `left` is the pages that do not come out.
 */
export function markedCount(texts: MarkedTexts, count: number, left: number): string {
  const kept = Math.max(0, left);
  return `${count === 1 ? texts.markedOne : fmt(texts.markedCount, { count })} · ${kept === 1 ? texts.keptOne : fmt(texts.keptCount, { left: kept })}`;
}

/** Quarter turns from 0 to 3. */
export const quarter = (turns: number): number => ((Math.trunc(turns) % 4) + 4) % 4;

/** Rotate right (1) and Rotate left (3) of the bar: the picked pages take the turn on top of the ones they had. */
export function turnedBy(turns: Readonly<Record<number, number>>, pages: readonly number[], by: number): Record<number, number> {
  const next: Record<number, number> = { ...turns };
  for (const page of pages) next[page] = quarter((turns[page] ?? 0) + by);
  return next;
}

/**
 * Remove and Put back of the bar: when every picked page already comes out, they come back (Put back); else they all come
 * out. The pages that came out before keep their order; the new ones come after.
 */
export function outAfter(out: readonly number[], picked: readonly number[]): number[] {
  const had = new Set(out);
  if (picked.length > 0 && picked.every((page) => had.has(page))) {
    const back = new Set(picked);
    return out.filter((page) => !back.has(page));
  }
  return [...out, ...picked.filter((page) => !had.has(page))];
}

/**
 * The request of Organize PDF (decision 6): the pages in the grid's order without the ones that come out, each with its
 * turns; null when nothing would change (the same order, no turn, nothing out) or when every page comes out.
 */
export function organizePages(total: number, order: readonly number[] | null, out: readonly number[], turns: Readonly<Record<number, number>>): { index: number; turn: number }[] | null {
  const sequence = order ?? Array.from({ length: total }, (_, i) => i);
  const gone = new Set(out);
  const pages = sequence.filter((index) => !gone.has(index)).map((index) => ({ index, turn: quarter(turns[index] ?? 0) }));
  if (pages.length === 0) return null;
  const changed = pages.length < sequence.length || pages.some((page, i) => page.turn !== 0 || page.index !== i);
  return changed ? pages : null;
}

/** "Invert selection": every page that was not picked, in page order. */
export function inverted(picked: readonly number[], total: number): number[] {
  const had = new Set(picked);
  return Array.from({ length: total }, (_, i) => i).filter((page) => !had.has(page));
}

/**
 * Shift+click and Shift+Space: every page from the anchor to the page touched takes the new state of the page touched
 * (`on`: picked). The pages picked before keep their order; the new ones come after, in page order.
 */
export function spanned(picked: readonly number[], anchor: number, target: number, on: boolean, sequence?: readonly number[]): number[] {
  const pages = span(anchor, target, sequence);
  if (!on) return picked.filter((page) => !pages.includes(page));
  const had = new Set(picked);
  return [...picked, ...pages.filter((page) => !had.has(page))];
}

const sets = new WeakMap<readonly number[], ReadonlySet<number>>();

/**
 * The grid's `selected`, one Set per list of picks: the same list gives the same Set at every render, and a new list (a
 * typed range, even of the same pages) a new one. The grid tells a selection it did not hand out by that (§ 628).
 */
export function setOf(pages: readonly number[]): ReadonlySet<number> {
  let found = sets.get(pages);
  if (!found) {
    found = new Set(pages);
    sets.set(pages, found);
  }
  return found;
}
