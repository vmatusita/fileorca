import { describe, expect, it } from 'vitest';
import { bundleKey, moved, putBack, successor } from '../../src/tools/image/batch.ts';

// F15 (DECISOES § 651, § 652 and § 667): the list of an image batch as plain data. A move, a row that goes out and an Undo
// change the order of the ids, and the key of the bundle follows it: the island packs the outputs again only when the key
// of the list differs from the key of the bundle it has.

describe('moving a row of the list', () => {
  const list = ['a', 'b', 'c', 'd'] as const;

  it('moves one place by an arrow, either way', () => {
    expect(moved(list, 2, 1)).toEqual(['a', 'c', 'b', 'd']);
    expect(moved(list, 1, 2)).toEqual(['a', 'c', 'b', 'd']);
    expect(moved(list, 0, 1)).toEqual(['b', 'a', 'c', 'd']);
    expect(moved(list, 3, 2)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('moves any distance by a drag, and leaves the list it was given as it was', () => {
    expect(moved(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moved(list, 0, 3)).toEqual(['b', 'c', 'd', 'a']);
    expect(list).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does nothing past an end, to the same place, or from a place that is not there', () => {
    expect(moved(list, 0, -1)).toBeNull();
    expect(moved(list, 3, 4)).toBeNull();
    expect(moved(list, 2, 2)).toBeNull();
    expect(moved(list, 4, 0)).toBeNull();
    expect(moved([], 0, 0)).toBeNull();
  });
});

describe('a row that goes out and comes back', () => {
  it('comes back to the place it left', () => {
    const list = ['a', 'b', 'c'];
    for (const [at, entry] of list.entries()) {
      const rest = list.filter((other) => other !== entry);
      expect(putBack(rest, entry, at), `${entry} at ${at}`).toEqual(list);
    }
  });

  it('comes back at the end when the list got shorter, and never before the start', () => {
    expect(putBack(['a'], 'c', 2)).toEqual(['a', 'c']);
    expect(putBack(['a', 'b'], 'z', -3)).toEqual(['z', 'a', 'b']);
  });

  it('passes the pick to the next row, or to the one before when it was the last (Crop)', () => {
    expect(successor([1, 2, 3], 0)).toBe(2);
    expect(successor([1, 2, 3], 1)).toBe(3);
    expect(successor([1, 2, 3], 2)).toBe(2);
    expect(successor([7], 0)).toBeNull();
  });
});

describe('the key of the bundle', () => {
  it('is the sheet and the order of the ready ids for the PDF, a PDF of one page included', () => {
    expect(bundleKey('pdf', [3, 1, 2], 'image')).toBe('image|3,1,2');
    expect(bundleKey('pdf', [4], 'a4')).toBe('a4|4');
    expect(bundleKey('pdf', [], 'letter')).toBeNull();
  });

  it('is the order of the ids for the ZIP, of two files or more (one file downloads as it is)', () => {
    expect(bundleKey('zip', [1, 2, 3], '')).toBe('1,2,3');
    expect(bundleKey('zip', [2, 3], '')).toBe('2,3');
    expect(bundleKey('zip', [3], '')).toBeNull();
    expect(bundleKey('zip', [], '')).toBeNull();
  });

  it('changes with a move, a row that left, a row that came back and a new sheet, and with nothing else', () => {
    const ids = [1, 2, 3];
    const key = bundleKey('pdf', ids, 'image');
    const swapped = moved(ids, 2, 0);
    expect(swapped).not.toBeNull();
    expect(bundleKey('pdf', swapped ?? [], 'image')).not.toBe(key);
    const out = ids.filter((id) => id !== 2);
    expect(bundleKey('pdf', out, 'image')).not.toBe(key);
    expect(bundleKey('pdf', putBack(out, 2, 1), 'image')).toBe(key);
    expect(bundleKey('pdf', ids, 'a4')).not.toBe(key);
    expect(bundleKey('pdf', [...ids], 'image')).toBe(key);
    expect(bundleKey('zip', moved(ids, 0, 1) ?? [], '')).not.toBe(bundleKey('zip', ids, ''));
  });
});
