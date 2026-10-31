import { describe, expect, it } from 'vitest';
import { decideCoffee, isAdBlocked, parseCoffee, USES_BEFORE_ASKING, WEEK_MS, type CoffeeState } from '../../src/tools/compress-image/coffee.ts';

const NOW = Date.UTC(2026, 10, 1, 12);
const accepted = { now: NOW, consent: true, adsBlocked: false };

function uses(count: number, context = accepted): { shown: boolean[]; state: CoffeeState } {
  let state: CoffeeState = { uses: 0 };
  const shown: boolean[] = [];
  for (let i = 0; i < count; i++) {
    const { show, next } = decideCoffee(state, context);
    shown.push(show);
    if (next) state = next;
  }
  return { shown, state };
}

describe('linha do café (DECISOES § 49)', () => {
  it('shows on the 3rd successful use, not on the 1st or 2nd', () => {
    expect(USES_BEFORE_ASKING).toBe(3);
    const { shown, state } = uses(3);
    expect(shown).toEqual([false, false, true]);
    expect(state).toEqual({ uses: 3, shownAt: NOW });
  });

  it('then at most once every 7 days', () => {
    const { state } = uses(3);
    expect(decideCoffee(state, accepted).show).toBe(false);
    expect(decideCoffee(state, { ...accepted, now: NOW + WEEK_MS - 1 }).show).toBe(false);
    const later = decideCoffee(state, { ...accepted, now: NOW + WEEK_MS });
    expect(later).toEqual({ show: true, next: { uses: 4, shownAt: NOW + WEEK_MS } });
  });

  it('never shows nor stores anything without the Accept of the cookie notice', () => {
    for (const state of [{ uses: 0 }, { uses: 2 }, { uses: 9 }]) {
      expect(decideCoffee(state, { ...accepted, consent: false })).toEqual({ show: false, next: null });
    }
    expect(uses(5, { ...accepted, consent: false }).shown).toEqual([false, false, false, false, false]);
  });

  it('respects "don\'t show again" for good', () => {
    expect(decideCoffee({ uses: 2, never: true }, accepted)).toEqual({ show: false, next: null });
    expect(decideCoffee({ uses: 2, never: true }, { ...accepted, now: NOW + 10 * WEEK_MS })).toEqual({ show: false, next: null });
  });

  it('shows on the 1st use for someone who blocks ads, still only with the Accept', () => {
    expect(decideCoffee({ uses: 0 }, { ...accepted, adsBlocked: true }).show).toBe(true);
    expect(decideCoffee({ uses: 0 }, { now: NOW, consent: false, adsBlocked: true }).show).toBe(false);
  });

  it('detects blocked ads only with ads on, on the production host', () => {
    expect(isAdBlocked({ adsOn: true, production: true, loaded: false, unitHeight: null })).toBe(true);
    expect(isAdBlocked({ adsOn: true, production: true, loaded: true, unitHeight: 0 })).toBe(true);
    expect(isAdBlocked({ adsOn: true, production: true, loaded: true, unitHeight: 280 })).toBe(false);
    expect(isAdBlocked({ adsOn: false, production: true, loaded: false, unitHeight: null })).toBe(false);
    expect(isAdBlocked({ adsOn: true, production: false, loaded: false, unitHeight: null })).toBe(false);
  });

  it('reads a damaged or foreign value as a fresh start', () => {
    expect(parseCoffee(null)).toEqual({ uses: 0 });
    expect(parseCoffee('not json')).toEqual({ uses: 0 });
    expect(parseCoffee('{"uses":-3,"shownAt":"x","never":"yes"}')).toEqual({ uses: 0 });
    expect(parseCoffee('{"uses":4,"shownAt":5,"never":true}')).toEqual({ uses: 4, shownAt: 5, never: true });
  });
});
