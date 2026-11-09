// F14 (DECISOES § 618, § 619 and § 622): the arithmetic of the page grid and of the page view.
import { describe, expect, it } from 'vitest';
import { THUMB_CAP, VIEW_FIT_CAP, VIEW_ZOOM_CAP, askWidth, pageRatio, quarters, samePages, sheetRatio, span } from '../../src/tools/pdf/grid-math.ts';

const letter = { width: 612, height: 792, rotate: 0 as const };
const landscape = { width: 792, height: 612, rotate: 0 as const };

describe('the shape of a page as it will come out (§ 618)', () => {
  it('counts the quarter turns of the /Rotate and of the person', () => {
    expect(quarters(letter)).toBe(0);
    expect(quarters({ rotate: 90 })).toBe(1);
    expect(quarters({ rotate: 270 })).toBe(3);
    expect(quarters({ rotate: 180 }, 1)).toBe(3);
    expect(quarters({ rotate: 270 }, 1)).toBe(0);
    expect(quarters({ rotate: 90 }, 7)).toBe(0);
    expect(quarters(undefined, 2)).toBe(2);
  });

  it('is the box standing, lying and turned by its /Rotate', () => {
    expect(pageRatio(letter)).toBeCloseTo(612 / 792, 6);
    expect(pageRatio(landscape)).toBeCloseTo(792 / 612, 6);
    expect(pageRatio({ ...letter, rotate: 90 })).toBeCloseTo(792 / 612, 6);
    expect(pageRatio({ ...letter, rotate: 180 })).toBeCloseTo(612 / 792, 6);
    expect(pageRatio({ width: 595.28, height: 841.89, rotate: 270 })).toBeCloseTo(841.89 / 595.28, 6);
  });

  it('swaps width and height when the turns add up to an odd number of quarters', () => {
    expect(pageRatio(letter, 1)).toBeCloseTo(792 / 612, 6);
    expect(pageRatio(letter, 2)).toBeCloseTo(612 / 792, 6);
    expect(pageRatio(letter, 3)).toBeCloseTo(792 / 612, 6);
    expect(pageRatio({ ...letter, rotate: 90 }, 1)).toBeCloseTo(612 / 792, 6);
    expect(pageRatio({ width: 500, height: 700, rotate: 90 }, 3)).toBeCloseTo(500 / 700, 6);
  });

  it('keeps the sheet between half and twice as wide as tall, and the page shape inside that', () => {
    expect(sheetRatio(letter)).toBeCloseTo(612 / 792, 6);
    expect(sheetRatio({ width: 226.77, height: 850.39, rotate: 0 })).toBe(0.5);
    expect(sheetRatio({ width: 2000, height: 400, rotate: 0 })).toBe(2);
    expect(sheetRatio({ width: 2000, height: 400, rotate: 90 })).toBe(0.5);
  });

  it('falls back to a Letter page for a box it cannot read', () => {
    expect(pageRatio(undefined)).toBeCloseTo(612 / 792, 6);
    expect(pageRatio({ width: 0, height: 0, rotate: 0 })).toBeCloseTo(612 / 792, 6);
  });
});

describe('the width asked of the thumbnail cache (§ 619)', () => {
  it('is the shown width times the pixel ratio, rounded up to 60 px', () => {
    expect(askWidth(122, 1, THUMB_CAP)).toBe(180);
    expect(askWidth(120, 1, THUMB_CAP)).toBe(120);
    expect(askWidth(138, 2, THUMB_CAP)).toBe(300);
    expect(askWidth(138, 2.625, THUMB_CAP)).toBe(420);
  });

  it('never asks more than the cap of the grid, of "Fit" or of "Enlarge"', () => {
    expect(askWidth(400, 3, THUMB_CAP)).toBe(720);
    expect(askWidth(328, 2, VIEW_FIT_CAP)).toBe(660);
    expect(askWidth(758, 3, VIEW_FIT_CAP)).toBe(1620);
    expect(askWidth(1516, 2, VIEW_ZOOM_CAP)).toBe(2400);
  });

  it('never asks less than 60 px, and reads a missing pixel ratio as 1', () => {
    expect(askWidth(0, 1, THUMB_CAP)).toBe(60);
    expect(askWidth(10, 0, THUMB_CAP)).toBe(60);
    expect(askWidth(100, Number.NaN, THUMB_CAP)).toBe(120);
  });
});

describe('the span of Shift+click (§ 622)', () => {
  it('goes from the anchor to the page touched, both included, in either direction', () => {
    expect(span(2, 5)).toEqual([2, 3, 4, 5]);
    expect(span(5, 2)).toEqual([2, 3, 4, 5]);
    expect(span(3, 3)).toEqual([3]);
  });

  it('tells two selections apart only by their pages', () => {
    expect(samePages([1, 3, 2], [2, 1, 3])).toBe(true);
    expect(samePages([1, 2], [1, 2, 3])).toBe(false);
    expect(samePages([], [])).toBe(true);
    expect(samePages([1, 4], [1, 2])).toBe(false);
  });
});
