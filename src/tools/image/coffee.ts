// The coffee line of the ResultCard (PLANO "Doações", DECISOES § 49): on the 3rd successful use in this
// browser, then at most once every 7 days, never after "don't show again". The count lives in
// localStorage and is written only after the cookie notice's Accept: storing something that is not
// strictly necessary needs consent in the EU (ePrivacy art. 5(3)), and the site does not know where the
// person is. Without Accept nothing is written and the line never shows; a count left from an earlier
// Accept is erased (consent withdrawn). "Don't show again" is the person's own request and is always
// kept. A use is a batch with at least one real output (smaller, converted, turned, cropped, resized or
// put into a PDF), and the count is one for all the image tools in this browser. With ads on, someone who blocks them sees it on the 1st.
import { CONSENT_STORAGE_KEY } from '../../analytics/consent.ts';

export const COFFEE_KEY = 'fo-coffee';
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const USES_BEFORE_ASKING = 3;

export interface CoffeeState {
  uses: number;
  shownAt?: number;
  never?: true;
}

export interface CoffeeContext {
  now: number;
  consent: boolean;
  adsBlocked: boolean;
}

export function parseCoffee(raw: string | null): CoffeeState {
  try {
    const value = JSON.parse(raw ?? '{}') as Partial<CoffeeState>;
    const state: CoffeeState = { uses: Number.isInteger(value.uses) && (value.uses ?? 0) > 0 ? (value.uses as number) : 0 };
    if (typeof value.shownAt === 'number' && Number.isFinite(value.shownAt)) state.shownAt = value.shownAt;
    if (value.never === true) state.never = true;
    return state;
  } catch {
    return { uses: 0 };
  }
}

/** One successful use: whether the line shows, and the state to store (null: store nothing). */
export function decideCoffee(state: CoffeeState, context: CoffeeContext): { show: boolean; next: CoffeeState | null } {
  if (state.never || !context.consent) return { show: false, next: null };
  const uses = state.uses + 1;
  const due = uses >= (context.adsBlocked ? 1 : USES_BEFORE_ASKING) && (state.shownAt === undefined || context.now - state.shownAt >= WEEK_MS);
  return { show: due, next: due ? { ...state, uses, shownAt: context.now } : { ...state, uses } };
}

/** Ads on at build, on the production host, and the AdSense loader never ran or the unit stayed empty. */
export function isAdBlocked(input: { adsOn: boolean; production: boolean; loaded: boolean; unitHeight: number | null }): boolean {
  return input.adsOn && input.production && (!input.loaded || input.unitHeight === 0);
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Without the Accept, a stored count goes away; only "don't show again" stays. */
function forget(store: Storage): void {
  const raw = store.getItem(COFFEE_KEY);
  if (raw === null) return;
  if (parseCoffee(raw).never) store.setItem(COFFEE_KEY, JSON.stringify({ uses: 0, never: true }));
  else store.removeItem(COFFEE_KEY);
}

/** On load: a count kept from an Accept that was later withdrawn is erased. */
export function forgetWithoutConsent(): void {
  const store = storage();
  if (!store) return;
  try {
    if (store.getItem(CONSENT_STORAGE_KEY) !== 'granted') forget(store);
  } catch {
    // private mode: nothing kept
  }
}

/** Counts a successful use in this browser; returns whether the coffee line shows. */
export function countUse(adsBlocked: boolean, now = Date.now()): boolean {
  const store = storage();
  if (!store) return false;
  try {
    const consent = store.getItem(CONSENT_STORAGE_KEY) === 'granted';
    if (!consent) {
      forget(store);
      return false;
    }
    const { show, next } = decideCoffee(parseCoffee(store.getItem(COFFEE_KEY)), { now, consent, adsBlocked });
    if (next) store.setItem(COFFEE_KEY, JSON.stringify(next));
    return show;
  } catch {
    return false;
  }
}

/** "Don't show this again": always stored, consent or not. */
export function dontShowAgain(): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(COFFEE_KEY, JSON.stringify({ ...parseCoffee(store.getItem(COFFEE_KEY)), never: true }));
  } catch {
    // private mode: nothing to keep
  }
}
