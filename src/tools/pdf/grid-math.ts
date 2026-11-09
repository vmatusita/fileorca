// The arithmetic of the page grid and of the page view (F14; DECISOES § 618, § 619 and § 622), kept pure so Vitest
// checks it (tests/unit/pdf-grid-math.test.ts):
//  - the shape of a page as it will come out: its box, its /Rotate and, in the rotate mode, the person's turns;
//  - the width asked of the thumbnail cache: the shown width times the device pixel ratio, rounded up to 60 px, capped;
//  - the span between the anchor and the page touched with Shift.
import type { PageBox } from '../../engine/pdf/types.ts';

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

/** The pages from the anchor to the page touched, both included, in order (page indices of the file). */
export function span(anchor: number, target: number): number[] {
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
