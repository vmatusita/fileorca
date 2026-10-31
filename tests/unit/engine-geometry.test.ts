import { describe, expect, it } from 'vitest';
import { centeredBox, coverPlan, resizeSize, sameBox } from '../../src/engine/image/geometry.ts';

describe('geometry: Resize never enlarges and always fits the box', () => {
  it('fits the photo inside the box, keeping the aspect ratio', () => {
    expect(resizeSize({ width: 4000, height: 3000 }, { width: 1000, height: 1000 })).toEqual({ width: 1000, height: 750, notEnlarged: false });
    expect(resizeSize({ width: 3000, height: 4000 }, { width: 1000, height: 1000 })).toEqual({ width: 750, height: 1000, notEnlarged: false });
    expect(resizeSize({ width: 4000, height: 3000 }, { width: 800, height: 200 })).toEqual({ width: 267, height: 200, notEnlarged: false });
  });

  it('keeps the original size, and says so, when the box is bigger than the photo', () => {
    expect(resizeSize({ width: 1000, height: 800 }, { width: 4000, height: 4000 })).toEqual({ width: 1000, height: 800, notEnlarged: true });
    expect(resizeSize({ width: 1000, height: 800 }, { width: 1001, height: 801 })).toMatchObject({ notEnlarged: true });
  });

  it('has nothing to do, and says nothing, when the box is exactly the photo', () => {
    expect(resizeSize({ width: 1000, height: 800 }, { width: 1000, height: 800 })).toBeNull();
    expect(resizeSize({ width: 1000, height: 800 }, { width: 1000, height: 5000 })).toBeNull();
  });

  it('shrinks by the long side when one side of the box is generous', () => {
    expect(resizeSize({ width: 1000, height: 800 }, { width: 500, height: 5000 })).toEqual({ width: 500, height: 400, notEnlarged: false });
  });

  it('scales by percentage, between 1 and 100', () => {
    expect(resizeSize({ width: 4000, height: 3000 }, { percent: 50 })).toEqual({ width: 2000, height: 1500, notEnlarged: false });
    expect(resizeSize({ width: 4000, height: 3000 }, { percent: 1 })).toEqual({ width: 40, height: 30, notEnlarged: false });
    expect(resizeSize({ width: 4000, height: 3000 }, { percent: 0 })).toEqual({ width: 40, height: 30, notEnlarged: false });
    expect(resizeSize({ width: 4000, height: 3000 }, { percent: 100 })).toBeNull();
    expect(resizeSize({ width: 4000, height: 3000 }, { percent: 250 })).toBeNull(); // never more than 100
  });

  it('never leaves a pixel past the box, whatever the rounding does', () => {
    let seed = 99;
    const next = (max: number) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return 1 + (seed % max);
    };
    for (let i = 0; i < 3000; i += 1) {
      const source = { width: next(9000), height: next(9000) };
      const box = { width: next(9000), height: next(9000) };
      const plan = resizeSize(source, box);
      if (!plan || plan.notEnlarged) continue;
      expect(plan.width, JSON.stringify({ source, box })).toBeLessThanOrEqual(box.width);
      expect(plan.height, JSON.stringify({ source, box })).toBeLessThanOrEqual(box.height);
      expect(plan.width).toBeGreaterThanOrEqual(1);
      expect(plan.height).toBeGreaterThanOrEqual(1);
      expect(plan.width).toBeLessThanOrEqual(source.width);
      expect(plan.height).toBeLessThanOrEqual(source.height);
      // The long side is the one that touches the box (to within a pixel of rounding).
      const touches = Math.abs(plan.width - box.width) <= 1 || Math.abs(plan.height - box.height) <= 1;
      expect(touches, JSON.stringify({ source, box, plan })).toBe(true);
    }
  });
});

describe('geometry: Crop', () => {
  it('centres the largest box of a ratio', () => {
    expect(centeredBox({ width: 4000, height: 3000 }, 1)).toEqual({ x: 500, y: 0, width: 3000, height: 3000 });
    expect(centeredBox({ width: 4000, height: 3000 }, 16 / 9)).toEqual({ x: 0, y: 375, width: 4000, height: 2250 });
    expect(centeredBox({ width: 4000, height: 3000 }, 4 / 5)).toEqual({ x: 800, y: 0, width: 2400, height: 3000 });
    expect(centeredBox({ width: 3000, height: 4000 }, 4 / 5)).toEqual({ x: 0, y: 125, width: 3000, height: 3750 });
  });

  it('takes the whole picture for a ratio it cannot use', () => {
    const whole = { x: 0, y: 0, width: 800, height: 600 };
    for (const ratio of [0, -1, NaN, Infinity]) expect(centeredBox({ width: 800, height: 600 }, ratio)).toEqual(whole);
    expect(sameBox(centeredBox({ width: 800, height: 600 }, 800 / 600), whole)).toBe(true);
  });

  it('stays inside the picture for any shape', () => {
    for (const [w, h] of [
      [1, 1],
      [1, 5000],
      [5000, 1],
      [3, 2],
    ] as const) {
      for (const ratio of [1, 0.8, 16 / 9, 3, 0.01]) {
        const box = centeredBox({ width: w, height: h }, ratio);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(w);
        expect(box.y + box.height).toBeLessThanOrEqual(h);
        expect(box.width).toBeGreaterThanOrEqual(1);
        expect(box.height).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('geometry: the cover (YouTube thumbnail 1280 × 720)', () => {
  const frame = { width: 1280, height: 720 };

  it('cuts the sides or the top of a photo that is not 16:9, and says so', () => {
    expect(coverPlan({ width: 4032, height: 3024 }, frame)).toEqual({ box: { x: 0, y: 378, width: 4032, height: 2268 }, cropped: true, enlarged: false });
    expect(coverPlan({ width: 3024, height: 4032 }, frame)).toMatchObject({ cropped: true, enlarged: false, box: { width: 3024, height: 1701 } });
  });

  it('keeps a 16:9 photo whole, and does not mention a pixel of rounding', () => {
    expect(coverPlan({ width: 1920, height: 1080 }, frame)).toMatchObject({ cropped: false, enlarged: false });
    expect(coverPlan({ width: 1921, height: 1080 }, frame)).toMatchObject({ cropped: false });
  });

  it('says the photo is enlarged when the cut is smaller than the frame', () => {
    expect(coverPlan({ width: 640, height: 480 }, frame)).toMatchObject({ box: { width: 640, height: 360 }, cropped: true, enlarged: true });
    expect(coverPlan({ width: 1280, height: 720 }, frame)).toMatchObject({ cropped: false, enlarged: false });
    expect(coverPlan({ width: 1279, height: 719 }, frame)).toMatchObject({ enlarged: true });
  });
});
