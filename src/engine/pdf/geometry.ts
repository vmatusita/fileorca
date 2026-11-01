// Where things go on a page as the person sees it (F5a, decision 4): the visible box is the CropBox inside the
// MediaBox, turned by /Rotate. The page numbers, the watermark and the signature are placed in that picture ("bottom
// centre" is the bottom of the screen, whatever the page's own axes), then mapped back to the page's user space, with
// the angle that keeps them upright. Plain math, no pdf-lib: tests run it on plain numbers.
// Self-contained: nothing here imports from outside src/engine/pdf/.

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** [x0, y0, x1, y1] of a PDF rectangle, ordered (the spec allows any two opposite corners). */
export function boxOf(rect: readonly number[]): Box {
  const [a = 0, b = 0, c = 0, d = 0] = rect;
  const x0 = Math.min(a, c);
  const y0 = Math.min(b, d);
  return { x: x0, y: y0, width: Math.abs(c - a), height: Math.abs(d - b) };
}

/** The visible part: the CropBox clipped to the MediaBox (a CropBox outside the MediaBox shows nothing of it). */
export function visibleBox(media: Box, crop: Box | null): Box {
  if (!crop) return media;
  const x0 = Math.max(media.x, crop.x);
  const y0 = Math.max(media.y, crop.y);
  const x1 = Math.min(media.x + media.width, crop.x + crop.width);
  const y1 = Math.min(media.y + media.height, crop.y + crop.height);
  if (x1 <= x0 || y1 <= y0) return media;
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

/** /Rotate as 0, 90, 180 or 270 (negative and above 360 are allowed by viewers; anything else counts as 0). */
export function normalRotation(value: number): 0 | 90 | 180 | 270 {
  const turn = ((Math.round(value) % 360) + 360) % 360;
  return turn === 90 || turn === 180 || turn === 270 ? turn : 0;
}

/** Width and height of the page on screen. */
export function shownSize(box: Box, rotate: number): { width: number; height: number } {
  const turn = normalRotation(rotate);
  return turn === 90 || turn === 270 ? { width: box.height, height: box.width } : { width: box.width, height: box.height };
}

/**
 * A point of the page as shown (vx to the right, vy up from the bottom left corner of the screen picture) in the
 * page's user space, and the angle (degrees, counter-clockwise) that draws something upright on screen. A page with
 * /Rotate 90 is shown turned 90 degrees clockwise: its top edge points right, so the page's +y is the screen's +x and
 * the page's +x is the screen's -y.
 */
export function toUser(box: Box, rotate: number, vx: number, vy: number): { x: number; y: number; angle: number } {
  const { x: x0, y: y0, width: w, height: h } = box;
  switch (normalRotation(rotate)) {
    case 90:
      return { x: x0 + w - vy, y: y0 + vx, angle: 90 };
    case 180:
      return { x: x0 + w - vx, y: y0 + h - vy, angle: 180 };
    case 270:
      return { x: x0 + vy, y: y0 + h - vx, angle: 270 };
    default:
      return { x: x0 + vx, y: y0 + vy, angle: 0 };
  }
}

/** Turns (dx, dy) by `degrees` counter-clockwise. */
export function turn(dx: number, dy: number, degrees: number): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}
