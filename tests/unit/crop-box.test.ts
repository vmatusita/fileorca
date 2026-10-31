import { describe, expect, it } from 'vitest';
import { centeredBox } from '../../src/engine/image/geometry.ts';
import type { Box } from '../../src/engine/image/types.ts';
import {
  RATIO_VALUE,
  dragCorner,
  fieldLimits,
  fitBox,
  minSide,
  moveBox,
  nudgeBox,
  percents,
  setField,
  startBox,
  stepOf,
  type Field,
  type Size,
} from '../../src/tools/crop-image/box.ts';

// The arithmetic behind the crop editor (src/tools/crop-image/box.ts): every function must hand back a
// whole-number box inside the picture, and with a locked ratio the shape must survive every move.

const PHOTO: Size = { width: 4032, height: 3024 };
const SMALL: Size = { width: 100, height: 60 };
const inside = (box: Box, size: Size) =>
  Number.isInteger(box.x) &&
  Number.isInteger(box.y) &&
  Number.isInteger(box.width) &&
  Number.isInteger(box.height) &&
  box.x >= 0 &&
  box.y >= 0 &&
  box.width >= 1 &&
  box.height >= 1 &&
  box.x + box.width <= size.width &&
  box.y + box.height <= size.height;
const shapeOf = (box: Box) => box.width / box.height;

describe('the box a picture starts with', () => {
  it('is the centred crop of the ratio, the same one the engine makes without a box', () => {
    // The page keeps its own copy (so it loads no chunk shared with the engine): it must never drift from the engine's.
    const sizes: Size[] = [PHOTO, SMALL, { width: 1200, height: 1600 }, { width: 3264, height: 2448 }, { width: 1, height: 1 }, { width: 7, height: 1999 }, { width: 5000, height: 3 }, { width: 4100, height: 4100 }];
    for (const size of sizes) {
      for (const ratio of [1, 4 / 5, 16 / 9]) expect(startBox(size, ratio), `${size.width}x${size.height} at ${ratio}`).toEqual(centeredBox(size, ratio));
    }
    expect(startBox(PHOTO, 1)).toEqual({ x: 504, y: 0, width: 3024, height: 3024 });
  });

  it('is the whole picture for Free', () => {
    expect(startBox(PHOTO, null)).toEqual({ x: 0, y: 0, width: 4032, height: 3024 });
  });

  it('maps the four buttons to their ratios', () => {
    expect(RATIO_VALUE).toEqual({ square: 1, portrait: 0.8, wide: 16 / 9, free: null });
  });
});

describe('fitBox', () => {
  it('rounds, clamps the position and keeps the box inside the picture', () => {
    expect(fitBox({ x: -10, y: 5.4, width: 50.6, height: 20 }, SMALL, null)).toEqual({ x: 0, y: 5, width: 51, height: 20 });
    expect(fitBox({ x: 90, y: 50, width: 40, height: 40 }, SMALL, null)).toEqual({ x: 60, y: 20, width: 40, height: 40 });
    expect(fitBox({ x: 0, y: 0, width: 500, height: 500 }, SMALL, null)).toEqual({ x: 0, y: 0, width: 100, height: 60 });
    expect(inside(fitBox({ x: 0, y: 0, width: 0, height: 0 }, SMALL, null), SMALL)).toBe(true);
  });

  it('shrinks a box that is too big for its ratio instead of stretching it', () => {
    const box = fitBox({ x: 0, y: 0, width: 4000, height: 4000 }, PHOTO, 1);
    expect(box).toEqual({ x: 0, y: 0, width: 3024, height: 3024 });
    const wide = fitBox({ x: 0, y: 0, width: 4032, height: 3024 }, PHOTO, 16 / 9);
    expect(wide.width).toBe(4032);
    expect(wide.height).toBe(Math.round(4032 / (16 / 9)));
  });
});

describe('moveBox', () => {
  const box: Box = { x: 100, y: 100, width: 200, height: 200 };

  it('moves by whole pixels', () => {
    expect(moveBox(box, 10.4, -20.6, PHOTO)).toEqual({ x: 110, y: 79, width: 200, height: 200 });
  });

  it('stops at every edge and never changes the size', () => {
    expect(moveBox(box, -9999, -9999, PHOTO)).toEqual({ x: 0, y: 0, width: 200, height: 200 });
    expect(moveBox(box, 9999, 9999, PHOTO)).toEqual({ x: 3832, y: 2824, width: 200, height: 200 });
  });
});

describe('dragCorner', () => {
  const box: Box = { x: 1000, y: 1000, width: 800, height: 800 };

  it('moves the dragged corner and leaves the opposite one where it was', () => {
    const grown = dragCorner(box, 'se', { x: 2300, y: 2100 }, PHOTO, null);
    expect(grown).toEqual({ x: 1000, y: 1000, width: 1300, height: 1100 });
    const topLeft = dragCorner(box, 'nw', { x: 500, y: 600 }, PHOTO, null);
    expect(topLeft).toEqual({ x: 500, y: 600, width: 1300, height: 1200 });
    const topRight = dragCorner(box, 'ne', { x: 2000, y: 900 }, PHOTO, null);
    expect(topRight).toEqual({ x: 1000, y: 900, width: 1000, height: 900 });
    const bottomLeft = dragCorner(box, 'sw', { x: 900, y: 2000 }, PHOTO, null);
    expect(bottomLeft).toEqual({ x: 900, y: 1000, width: 900, height: 1000 });
  });

  it('keeps a locked ratio and lets the bigger pull win', () => {
    for (const ratio of [1, 4 / 5, 16 / 9]) {
      const start = startBox(PHOTO, ratio);
      const half = fitBox({ x: 600, y: 500, width: start.width / 2, height: start.height / 2 }, PHOTO, ratio);
      for (const corner of ['nw', 'ne', 'sw', 'se'] as const) {
        const next = dragCorner(half, corner, { x: 1500, y: 1700 }, PHOTO, ratio);
        expect(inside(next, PHOTO), `${ratio} ${corner}`).toBe(true);
        expect(Math.abs(shapeOf(next) - ratio) < 0.02, `${ratio} ${corner}: ${shapeOf(next)}`).toBe(true);
      }
    }
  });

  it('never leaves the picture, however far the pointer goes', () => {
    for (const ratio of [null, 1, 16 / 9]) {
      for (const corner of ['nw', 'ne', 'sw', 'se'] as const) {
        for (const point of [{ x: -5000, y: -5000 }, { x: 99999, y: 99999 }, { x: -5000, y: 99999 }, { x: 1100, y: 1100 }]) {
          const next = dragCorner(box, corner, point, PHOTO, ratio);
          expect(inside(next, PHOTO), `${ratio} ${corner} ${JSON.stringify(point)} ${JSON.stringify(next)}`).toBe(true);
        }
      }
    }
  });

  it('does not shrink under the smallest side when the pointer crosses the anchor', () => {
    const next = dragCorner(box, 'se', { x: 100, y: 100 }, PHOTO, null);
    expect(next.width).toBeGreaterThanOrEqual(minSide(PHOTO));
    expect(next.height).toBeGreaterThanOrEqual(minSide(PHOTO));
    expect(next.x).toBe(1000);
    expect(next.y).toBe(1000);
  });
});

describe('nudgeBox (the keyboard)', () => {
  const box: Box = { x: 1000, y: 800, width: 1200, height: 900 };

  it('moves by 1% of the picture along each side', () => {
    expect(stepOf(PHOTO)).toEqual({ width: 40, height: 30 });
    expect(nudgeBox(box, 'ArrowRight', false, PHOTO, null)).toEqual({ ...box, x: 1040 });
    expect(nudgeBox(box, 'ArrowLeft', false, PHOTO, null)).toEqual({ ...box, x: 960 });
    expect(nudgeBox(box, 'ArrowDown', false, PHOTO, null)).toEqual({ ...box, y: 830 });
    expect(nudgeBox(box, 'ArrowUp', false, PHOTO, null)).toEqual({ ...box, y: 770 });
  });

  it('stops at the edges', () => {
    expect(nudgeBox({ ...box, x: 0 }, 'ArrowLeft', false, PHOTO, null).x).toBe(0);
    expect(nudgeBox({ ...box, x: PHOTO.width - box.width }, 'ArrowRight', false, PHOTO, null).x).toBe(PHOTO.width - box.width);
  });

  it('Shift with the arrows changes the size around the centre (Free: one side at a time)', () => {
    expect(nudgeBox(box, 'ArrowRight', true, PHOTO, null)).toEqual({ x: 980, y: 800, width: 1240, height: 900 });
    expect(nudgeBox(box, 'ArrowLeft', true, PHOTO, null)).toEqual({ x: 1020, y: 800, width: 1160, height: 900 });
    expect(nudgeBox(box, 'ArrowDown', true, PHOTO, null)).toEqual({ x: 1000, y: 785, width: 1200, height: 930 });
    expect(nudgeBox(box, 'ArrowUp', true, PHOTO, null)).toEqual({ x: 1000, y: 815, width: 1200, height: 870 });
  });

  it('Shift with a locked ratio keeps the shape, whichever arrow is used', () => {
    for (const ratio of [1, 4 / 5, 16 / 9]) {
      let current = fitBox({ x: 800, y: 600, width: 1000 * ratio, height: 1000 }, PHOTO, ratio);
      for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight'] as const) {
        const next = nudgeBox(current, key, true, PHOTO, ratio);
        expect(inside(next, PHOTO)).toBe(true);
        expect(Math.abs(shapeOf(next) - ratio) < 0.02, `${ratio} ${key}`).toBe(true);
        if (key === 'ArrowRight' || key === 'ArrowDown') expect(next.width).toBeGreaterThan(current.width);
        else expect(next.width).toBeLessThan(current.width);
        current = next;
      }
    }
  });

  it('keeps growing into the room that is left when the box sits against an edge', () => {
    const edge: Box = { x: 0, y: 0, width: 400, height: 400 };
    const next = nudgeBox(edge, 'ArrowRight', true, PHOTO, 1);
    expect(next.x).toBe(0);
    expect(next.width).toBeGreaterThan(400);
  });

  it('never goes under the smallest side', () => {
    let current: Box = { x: 100, y: 100, width: 200, height: 200 };
    for (let i = 0; i < 400; i += 1) current = nudgeBox(current, 'ArrowLeft', true, PHOTO, 1);
    expect(current.width).toBeGreaterThanOrEqual(minSide(PHOTO));
    expect(inside(current, PHOTO)).toBe(true);
  });
});

describe('the number fields', () => {
  const box: Box = { x: 500, y: 400, width: 1600, height: 900 };
  const ratio = 16 / 9;

  it('limit each field so that the whole box stays inside the picture', () => {
    expect(fieldLimits(box, 'x', PHOTO, null)).toEqual({ min: 0, max: 2432 });
    expect(fieldLimits(box, 'y', PHOTO, null)).toEqual({ min: 0, max: 2124 });
    expect(fieldLimits(box, 'width', PHOTO, null)).toEqual({ min: 1, max: 3532 });
    expect(fieldLimits(box, 'height', PHOTO, null)).toEqual({ min: 1, max: 2624 });
  });

  it('limit width and height by the room on both sides when the ratio is locked', () => {
    // Width: 3532 px are left to the right, and 2624 px of height are left, which is 4664 px at 16:9, so the right side caps it.
    expect(fieldLimits(box, 'width', PHOTO, ratio)).toEqual({ min: 1, max: 3532 });
    // Height: 2624 px are left below, and 3532 px of width are left, which is 1986 px of height at 16:9, so the right side caps it.
    expect(fieldLimits(box, 'height', PHOTO, ratio)).toEqual({ min: 1, max: 1986 });
    // The other way round: a box low in the picture is capped by the height that is left.
    expect(fieldLimits({ x: 0, y: 2500, width: 400, height: 224 }, 'width', PHOTO, ratio)).toEqual({ min: 1, max: Math.floor(524 * ratio) });
  });

  it('move the box with x and y without touching its size', () => {
    expect(setField(box, 'x', 700, PHOTO, null)).toEqual({ ...box, x: 700 });
    expect(setField(box, 'y', 0, PHOTO, ratio)).toEqual({ ...box, y: 0 });
  });

  it('change the other side too when the ratio is locked', () => {
    const wider = setField(box, 'width', 1920, PHOTO, ratio);
    expect(wider.width).toBe(1920);
    expect(wider.height).toBe(1080);
    const taller = setField(box, 'height', 450, PHOTO, ratio);
    expect(taller.height).toBe(450);
    expect(taller.width).toBe(800);
  });

  it('change one side only with Free', () => {
    expect(setField(box, 'width', 2000, PHOTO, null)).toEqual({ ...box, width: 2000 });
    expect(setField(box, 'height', 300, PHOTO, null)).toEqual({ ...box, height: 300 });
  });

  it('every value a field accepts gives a box inside the picture', () => {
    for (const ratioValue of [null, 1, 4 / 5, 16 / 9]) {
      const start = startBox(PHOTO, ratioValue);
      const here = fitBox({ x: start.x / 2, y: start.y / 2, width: start.width / 2, height: start.height / 2 }, PHOTO, ratioValue);
      for (const field of ['x', 'y', 'width', 'height'] as Field[]) {
        const { min, max } = fieldLimits(here, field, PHOTO, ratioValue);
        for (const value of [min, max, Math.round((min + max) / 2)]) {
          const next = setField(here, field, value, PHOTO, ratioValue);
          expect(inside(next, PHOTO), `${ratioValue} ${field}=${value} ${JSON.stringify(next)}`).toBe(true);
        }
      }
    }
  });
});

describe('percents (the CSS variables of the editor)', () => {
  it('give the box as a share of the picture', () => {
    expect(percents({ x: 1008, y: 0, width: 2016, height: 3024 }, PHOTO)).toEqual({ x: '25.0000%', y: '0.0000%', w: '50.0000%', h: '100.0000%' });
  });
});
