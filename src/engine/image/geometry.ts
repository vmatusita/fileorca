// The size arithmetic of the tools, kept pure so a Vitest can check the edges: Resize never
// enlarges and always fits the box, Crop clamps and centres, the cover fills a frame exactly.
// Self-contained: nothing here imports from outside src/engine/image/.

import { clampBox } from './pixels.ts';
import type { Box } from './types.ts';

export interface Size {
  width: number;
  height: number;
}

export interface ResizePlan extends Size {
  /** True when the box asked for more pixels than the photo has, so the original size stays. */
  notEnlarged: boolean;
}

/**
 * New size for "fit inside width × height" (aspect kept) or "by percentage". Never enlarges:
 * null means nothing to do and the caller hands the original back; notEnlarged says the box asked
 * for more pixels than the photo has.
 */
export function resizeSize(source: Size, request: Size | { percent: number }): ResizePlan | null {
  const box = 'percent' in request ? null : request;
  const scale = box
    ? Math.min(Math.max(box.width, 1) / source.width, Math.max(box.height, 1) / source.height)
    : Math.min(Math.max('percent' in request ? request.percent : 100, 1), 100) / 100;
  if (scale >= 1) return box && scale > 1 ? { ...source, notEnlarged: true } : null;
  let width = Math.max(1, Math.round(source.width * scale));
  let height = Math.max(1, Math.round(source.height * scale));
  // Rounding can push a side one pixel past the box; the box wins.
  if (box) {
    width = Math.min(width, Math.max(1, Math.floor(box.width)));
    height = Math.min(height, Math.max(1, Math.floor(box.height)));
  }
  return { width, height, notEnlarged: false };
}

/** The largest box of the given ratio (width / height) centred in the picture. */
export function centeredBox(source: Size, ratio: number): Box {
  if (!(ratio > 0) || !Number.isFinite(ratio)) return { x: 0, y: 0, width: source.width, height: source.height };
  let width = source.width;
  let height = Math.round(width / ratio);
  if (height > source.height) {
    height = source.height;
    width = Math.round(height * ratio);
  }
  width = Math.max(1, Math.min(width, source.width));
  height = Math.max(1, Math.min(height, source.height));
  return { x: Math.round((source.width - width) / 2), y: Math.round((source.height - height) / 2), width, height };
}

export function sameBox(a: Box, b: Box): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

export interface CoverPlan {
  /** The centred box of the frame's ratio. */
  box: Box;
  /** The box cut edges off the photo (the ratios differ by more than a rounding). */
  cropped: boolean;
  /** The box is smaller than the frame in some side, so the photo is enlarged. */
  enlarged: boolean;
}

/** Centre crop to the frame's ratio, then scale to the frame: where the box is and what to tell. */
export function coverPlan(source: Size, frame: Size): CoverPlan {
  const box = clampBox(centeredBox(source, frame.width / frame.height), source.width, source.height);
  // A pixel or two of difference is rounding, not a crop worth a line on the result card.
  const cropped = source.width - box.width > Math.max(2, source.width * 0.01) || source.height - box.height > Math.max(2, source.height * 0.01);
  return { box, cropped, enlarged: box.width < frame.width || box.height < frame.height };
}
