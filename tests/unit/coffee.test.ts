import { describe, expect, it } from 'vitest';
import * as coffee from '../../src/tools/image/coffee.ts';
import { decideCoffee, parseCoffee, USES_BEFORE_ASKING, WEEK_MS, type CoffeeState } from '../../src/tools/image/coffee.ts';

const NOW = Date.UTC(2026, 10, 1, 12);
const accepted = { now: NOW, consent: true };

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

  // F12 (Mudança 11; DECISOES § 435, which closes the F3 c-08): someone who blocks ads gets the ad-block wall, and the
  // coffee line no longer asks them on the 1st use. Before, the context carried adsBlocked and the 1st use showed the line
  // ({ adsBlocked: true } gave show: true on { uses: 0 }); a context that still says so is ignored.
  it('asks someone who blocks ads on the 3rd use too, still only with the Accept: the 1st-use ask is gone', () => {
    const blocked = { ...accepted, adsBlocked: true } as typeof accepted;
    expect(decideCoffee({ uses: 0 }, blocked)).toEqual({ show: false, next: { uses: 1 } });
    expect(uses(3, blocked).shown).toEqual([false, false, true]);
    expect(decideCoffee({ uses: 0 }, { ...blocked, consent: false }).show).toBe(false);
  });

  // It took the place of "detects blocked ads only with ads on, on the production host" (isAdBlocked): the guess that read
  // a loader that never ran, or an empty unit, as an ad blocker (the false positive of the c-08) is gone from the module,
  // and countUse takes no flag for it. The wall has a detection of its own (DECISOES § 416).
  it('has no ad-block guess any more: no isAdBlocked, and countUse takes no ad-block flag', () => {
    expect(Object.keys(coffee)).not.toContain('isAdBlocked');
    expect(coffee.countUse.length, 'countUse(now?)').toBe(0);
  });

  // F13a (UX-04 A; DECISOES § 470): the 3rd use is known before its result. The page asks before the first paint (an
  // inline script) and the island when a batch starts and at Start over; both answer what decideCoffee would show, and
  // neither writes. Before the F13a there was no peek: the line was only known in finish(), with the card already drawn.
  it('peeks at the next use without writing, in the island and in the inline script of the page, as decideCoffee decides', () => {
    expect(Object.keys(coffee)).toContain('coffeeAhead');
    const states: (Record<string, unknown> | string | null)[] = [
      null, 'not json', {}, { uses: 0 }, { uses: 1 }, { uses: 2 }, { uses: 3 }, { uses: 9 }, { uses: 2, never: true }, { uses: 2.5 }, { uses: -2 },
      { uses: 5, shownAt: NOW - WEEK_MS + 1 }, { uses: 5, shownAt: NOW - WEEK_MS }, { uses: 2, shownAt: 'x' }, { uses: 4, shownAt: NOW - 10 * WEEK_MS },
    ];
    for (const consent of ['granted', 'denied', null]) {
      for (const state of states) {
        const raw = state === null ? null : typeof state === 'string' ? state : JSON.stringify(state);
        const items = new Map<string, string>();
        if (raw !== null) items.set('fo-coffee', raw);
        if (consent !== null) items.set('fo-consent', consent);
        const before = JSON.stringify([...items]);
        const storage = { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) };
        const want = decideCoffee(parseCoffee(raw), { now: NOW, consent: consent === 'granted' }).show;
        // The island: coffeeAhead reads the same storage.
        const window = { localStorage: storage };
        (globalThis as unknown as { window: unknown }).window = window;
        expect(coffee.coffeeAhead(NOW), `${consent} ${raw}`).toBe(want);
        // The page: the inline script marks the rectangle, with the same clock.
        const slot = { marked: false, setAttribute: () => (slot.marked = true) };
        const document = { querySelector: (selector: string) => (selector === '#fo-tool-root .fo-slot' ? slot : null) };
        new Function('localStorage', 'document', 'Date', coffee.COFFEE_AHEAD_SCRIPT)(storage, document, { now: () => NOW });
        expect(slot.marked, `inline ${consent} ${raw}`).toBe(want);
        expect(JSON.stringify([...items]), 'nothing written').toBe(before);
      }
    }
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('reads a damaged or foreign value as a fresh start', () => {
    expect(parseCoffee(null)).toEqual({ uses: 0 });
    expect(parseCoffee('not json')).toEqual({ uses: 0 });
    expect(parseCoffee('{"uses":-3,"shownAt":"x","never":"yes"}')).toEqual({ uses: 0 });
    expect(parseCoffee('{"uses":4,"shownAt":5,"never":true}')).toEqual({ uses: 4, shownAt: 5, never: true });
  });
});
