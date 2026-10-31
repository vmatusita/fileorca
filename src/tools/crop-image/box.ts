// The arithmetic of the crop box, kept apart from the component so Vitest can prove its edges. Everything
// is in display pixels of the picture (the Exif orientation already applied), as whole numbers, and every
// function returns a box that is inside the picture. With a locked ratio (Square, 4:5, 16:9) the box keeps
// its shape whatever moves it: the pointer, the keys or a field; with Free it does not.
import type { Box } from '../../engine/image/types.ts';

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** The ratio buttons, in the order the page shows them. */
export type Ratio = 'square' | 'portrait' | 'wide' | 'free';
export const RATIOS: readonly Ratio[] = ['square', 'portrait', 'wide', 'free'];

/** Width over height of each choice; null is Free. */
export const RATIO_VALUE: Record<Ratio, number | null> = { square: 1, portrait: 4 / 5, wide: 16 / 9, free: null };

export type Corner = 'nw' | 'ne' | 'sw' | 'se';
export type Arrow = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';
export type Field = 'x' | 'y' | 'width' | 'height';

export const ARROWS: readonly Arrow[] = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

const clamp = (value: number, low: number, high: number): number => Math.min(Math.max(value, low), high);

/**
 * The largest box of the ratio, centred in the picture: the box a picture starts with, and the one the engine
 * cuts when it is given a ratio and no box. It is written again here, and not imported from the engine, so
 * the page does not load a chunk shared with the engine (the initial JS stays in two files); the unit test
 * proves both give the same box.
 */
function centred(size: Size, ratio: number): Box {
  let width = size.width;
  let height = Math.round(width / ratio);
  if (height > size.height) {
    height = size.height;
    width = Math.round(height * ratio);
  }
  width = Math.max(1, Math.min(width, size.width));
  height = Math.max(1, Math.min(height, size.height));
  return { x: Math.round((size.width - width) / 2), y: Math.round((size.height - height) / 2), width, height };
}

/** The box a picture starts with: the centred crop of the ratio, or the whole picture for Free. */
export function startBox(size: Size, ratio: number | null): Box {
  return ratio ? centred(size, ratio) : { x: 0, y: 0, width: size.width, height: size.height };
}

/** Smallest side the pointer and the keys leave: 2% of the shorter side of the picture. */
export function minSide(size: Size): number {
  return Math.max(1, Math.round(Math.min(size.width, size.height) * 0.02));
}

/** Smallest width of a box: the smallest side, and with a ratio also the smallest height. */
function minWidth(size: Size, ratio: number | null): number {
  return Math.max(1, Math.round(minSide(size) * (ratio ? Math.max(1, ratio) : 1)));
}

/**
 * Puts any box inside the picture: whole pixels, at least 1 × 1, and the shape kept (by shrinking) when
 * the ratio is locked. The position moves before the size shrinks, so a box pushed against an edge slides.
 */
export function fitBox(box: Box, size: Size, ratio: number | null): Box {
  let width = clamp(Math.round(box.width), 1, size.width);
  let height = clamp(Math.round(box.height), 1, size.height);
  if (ratio) {
    height = Math.round(width / ratio);
    if (height > size.height) {
      height = size.height;
      width = Math.round(height * ratio);
    }
    width = clamp(width, 1, size.width);
    height = clamp(height, 1, size.height);
  }
  return { x: clamp(Math.round(box.x), 0, size.width - width), y: clamp(Math.round(box.y), 0, size.height - height), width, height };
}

/** The box moved by (dx, dy) pixels; it stops at the edges. */
export function moveBox(box: Box, dx: number, dy: number, size: Size): Box {
  return {
    ...box,
    x: clamp(Math.round(box.x + dx), 0, size.width - box.width),
    y: clamp(Math.round(box.y + dy), 0, size.height - box.height),
  };
}

/**
 * The box with one corner dragged to `point`, the opposite corner staying where it was. With a ratio
 * the pull that asks for the bigger box wins, and the room on both sides caps it.
 */
export function dragCorner(start: Box, corner: Corner, point: Point, size: Size, ratio: number | null): Box {
  const left = corner === 'nw' || corner === 'sw';
  const top = corner === 'nw' || corner === 'ne';
  const anchorX = left ? start.x + start.width : start.x;
  const anchorY = top ? start.y + start.height : start.y;
  const roomX = left ? anchorX : size.width - anchorX;
  const roomY = top ? anchorY : size.height - anchorY;
  const low = minSide(size);
  let width = clamp(left ? anchorX - point.x : point.x - anchorX, low, Math.max(low, roomX));
  let height = clamp(top ? anchorY - point.y : point.y - anchorY, low, Math.max(low, roomY));
  if (ratio) {
    width = Math.min(Math.max(width, height * ratio, minWidth(size, ratio)), roomX, roomY * ratio);
    height = width / ratio;
  }
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  return fitBox({ x: left ? anchorX - w : anchorX, y: top ? anchorY - h : anchorY, width: w, height: h }, size, ratio);
}

/** How far one arrow press goes: 1% of the picture along each side. */
export function stepOf(size: Size): Size {
  return { width: Math.max(1, Math.round(size.width / 100)), height: Math.max(1, Math.round(size.height / 100)) };
}

/**
 * One arrow press on the box. Plain arrows move it; with Shift they change its size around its centre:
 * Right and Down make it bigger, Left and Up smaller (width with the horizontal keys, height with the
 * vertical ones; with a locked ratio the other side follows).
 */
export function nudgeBox(box: Box, key: Arrow, resize: boolean, size: Size, ratio: number | null): Box {
  const step = stepOf(size);
  const dx = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
  const dy = key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0;
  if (!resize) return moveBox(box, dx * step.width, dy * step.height, size);
  const low = minWidth(size, ratio);
  let width = box.width;
  let height = box.height;
  if (ratio) {
    width = dx !== 0 ? box.width + dx * step.width : (box.height + dy * step.height) * ratio;
    width = Math.max(width, low);
    height = width / ratio;
  } else {
    width = Math.max(box.width + dx * step.width, minSide(size));
    height = Math.max(box.height + dy * step.height, minSide(size));
  }
  return fitBox(
    { x: box.x - (width - box.width) / 2, y: box.y - (height - box.height) / 2, width, height },
    size,
    ratio,
  );
}

/** What a field of the box accepts right now: it keeps the whole box inside the picture. */
export function fieldLimits(box: Box, field: Field, size: Size, ratio: number | null): { min: number; max: number } {
  switch (field) {
    case 'x':
      return { min: 0, max: Math.max(0, size.width - box.width) };
    case 'y':
      return { min: 0, max: Math.max(0, size.height - box.height) };
    case 'width': {
      const room = ratio ? Math.min(size.width - box.x, (size.height - box.y) * ratio) : size.width - box.x;
      return { min: 1, max: Math.max(1, Math.floor(room)) };
    }
    case 'height': {
      const room = ratio ? Math.min(size.height - box.y, (size.width - box.x) / ratio) : size.height - box.y;
      return { min: 1, max: Math.max(1, Math.floor(room)) };
    }
  }
}

/** The box after a field took a value inside its limits; with a locked ratio the other side follows. */
export function setField(box: Box, field: Field, value: number, size: Size, ratio: number | null): Box {
  switch (field) {
    case 'x':
      return fitBox({ ...box, x: value }, size, ratio);
    case 'y':
      return fitBox({ ...box, y: value }, size, ratio);
    case 'width':
      return fitBox({ ...box, width: value, height: ratio ? value / ratio : box.height }, size, ratio);
    case 'height':
      return fitBox({ ...box, height: value, width: ratio ? value * ratio : box.width }, size, ratio);
  }
}

/** The box as percentages of the picture, for the CSS variables of .fo-crop (--x --y --w --h). */
export function percents(box: Box, size: Size): { x: string; y: string; w: string; h: string } {
  const pct = (value: number, whole: number) => `${((value / whole) * 100).toFixed(4)}%`;
  return { x: pct(box.x, size.width), y: pct(box.y, size.height), w: pct(box.width, size.width), h: pct(box.height, size.height) };
}
