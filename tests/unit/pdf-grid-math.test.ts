// F14 (DECISOES § 618, § 619 and § 622): the arithmetic of the page grid and of the page view.
import { describe, expect, it } from 'vitest';
import { THUMB_CAP, VIEW_FIT_CAP, VIEW_ZOOM_CAP, askWidth, pageRatio, quarters, samePages, sheetRatio, span } from '../../src/tools/pdf/grid-math.ts';
import { countOf, inverted, leavingCount, setOf, spanned } from '../../src/tools/pdf/grid-math.ts';
import enPanel from '../../src/tools/pdf/i18n/en.ts';
import esPanel from '../../src/tools/pdf/i18n/es.ts';
import ptPanel from '../../src/tools/pdf/i18n/pt.ts';

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

// F14 (items 4, 5 and 9; DECISOES § 627 to § 629): the picks of Invert and of Shift, and the sentence of the count.
describe('the picks of Invert selection and of Shift (§ 628)', () => {
  it('inverts to every page that was not picked, in page order', () => {
    expect(inverted([4, 0, 2], 6)).toEqual([1, 3, 5]);
    expect(inverted([], 3)).toEqual([0, 1, 2]);
    expect(inverted([0, 1, 2], 3)).toEqual([]);
    expect(inverted([], 0)).toEqual([]);
  });

  it('gives every page from the anchor to the page the new state of the page, keeping the picks outside the span', () => {
    // On: the pages picked before keep their order, the new ones come after in page order.
    expect(spanned([7, 1], 2, 5, true)).toEqual([7, 1, 2, 3, 4, 5]);
    expect(spanned([3], 5, 2, true)).toEqual([3, 2, 4, 5]);
    // Off: the span goes, the rest stays.
    expect(spanned([0, 2, 3, 4, 9], 2, 4, false)).toEqual([0, 9]);
    expect(spanned([0, 2, 3, 4, 9], 4, 2, false)).toEqual([0, 9]);
    expect(spanned([], 1, 3, false)).toEqual([]);
  });

  it('gives one Set per list of picks: the same list, the same Set; a new list of the same pages, a new one', () => {
    const list = [2, 5];
    expect(setOf(list)).toBe(setOf(list));
    expect(setOf([2, 5])).not.toBe(setOf(list));
    expect([...setOf(list)]).toEqual([2, 5]);
    expect(setOf(list).has(5)).toBe(true);
  });
});

describe("the sentence of the count, and Delete's that says what comes out (§ 627 and § 629)", () => {
  const forms = { en: enPanel.grid, pt: ptPanel.grid, es: esPanel.grid };

  it('says how many of how many pages come out and what the new PDF keeps, in en, pt and es', () => {
    expect(leavingCount(forms.en, 3, 12)).toBe('3 of 12 come out · the new PDF keeps 9 pages');
    expect(leavingCount(forms.pt, 3, 12)).toBe('3 de 12 saem · o PDF novo fica com 9 páginas');
    expect(leavingCount(forms.es, 3, 12)).toBe('3 de 12 salen · el PDF nuevo queda con 9 páginas');
  });

  it('has the forms of one, on both sides (section B: "1 de 12 sai" and "fica com 1 página")', () => {
    expect(leavingCount(forms.pt, 1, 12)).toBe('1 de 12 sai · o PDF novo fica com 11 páginas');
    expect(leavingCount(forms.pt, 11, 12)).toBe('11 de 12 saem · o PDF novo fica com 1 página');
    expect(leavingCount(forms.pt, 1, 2)).toBe('1 de 2 sai · o PDF novo fica com 1 página');
    expect(leavingCount(forms.en, 1, 12)).toBe('1 of 12 comes out · the new PDF keeps 11 pages');
    expect(leavingCount(forms.en, 11, 12)).toBe('11 of 12 come out · the new PDF keeps 1 page');
    expect(leavingCount(forms.es, 1, 2)).toBe('1 de 2 sale · el PDF nuevo queda con 1 página');
  });

  it('counts none and every page as they are, never below zero', () => {
    expect(leavingCount(forms.pt, 0, 12)).toBe('0 de 12 saem · o PDF novo fica com 12 páginas');
    expect(leavingCount(forms.pt, 12, 12)).toBe('12 de 12 saem · o PDF novo fica com 0 páginas');
    expect(leavingCount(forms.en, 13, 12)).toBe('13 of 12 come out · the new PDF keeps 0 pages');
  });

  it("is Delete's form only where a picked page comes out; Split and Sign say the pages picked", () => {
    expect(countOf(forms.en, 3, 12, true)).toBe(leavingCount(forms.en, 3, 12));
    expect(countOf(forms.en, 3, 12, false)).toBe('3 of 12 pages picked');
    expect(countOf(forms.pt, 1, 12, false)).toBe('1 de 12 páginas marcadas');
    expect(countOf(forms.es, 0, 8, false)).toBe('0 de 8 páginas elegidas');
  });
});
