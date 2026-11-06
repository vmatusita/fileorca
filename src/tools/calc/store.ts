// The state of one calculator island: the form, the result and, since the F13b, the schedule, which moved into the island
// (DECISOES § 547). A key press runs the account once and every part repaints.
import { useEffect, useRef, useState } from 'preact/hooks';
import { problems, type Problems } from './form.ts';
import type { CalcDef, CalcPanelData, CalcView, Values } from './types.ts';

/** A field that shows an error now: its message (the range, or the field it passes) and its label. */
export interface FieldError {
  message: string;
  label: string;
}

export interface CalcState {
  values: Values;
  /** The person changed something (the first change sends calc_complete and may bring the Oli's cheer). */
  touched: boolean;
  problems: Problems;
  /** The view of the last values that made an account: a wrong field keeps it on screen. It may be a problem. */
  view: CalcView;
  /**
   * The last view that was a result, not a problem, and the values it was made from: while the values on screen make none,
   * the card keeps its number and says which value of the field it was ("Last result that worked: Rate 6.5%."); the
   * example until the person has another result (F13b; DECISOES § 545).
   */
  good: { view: CalcView; values: Values };
  /** The fields that show an error now, by id, in the order they came (the card says the first one of the form). */
  errors: ReadonlyMap<string, FieldError>;
  /** The values on screen are not the ones the view was made from: a problem between fields, or a field that shows its range
   * error (DECISOES § 116; until the review F7 the range error left the line out and the PDF on, § 276). */
  stale: boolean;
}

export interface CalcStore {
  get(): CalcState;
  /** New values; `byPerson` is false for the scenario link read at load. */
  set(values: Values, byPerson: boolean): void;
  subscribe(listener: () => void): () => void;
  /** The field with this id shows an error (its message and label), or no longer does (null). */
  wrong(id: string, error: FieldError | null): void;
}

export function viewOf(def: CalcDef, data: CalcPanelData, values: Values): CalcView {
  return def.view(def.compute(def.toInput(values)), values, data.texts, data.t, data.lang);
}

export function createStore(def: CalcDef, data: CalcPanelData, initial: Values): CalcStore {
  const first = viewOf(def, data, initial);
  let state: CalcState = {
    values: initial,
    touched: false,
    problems: problems(def.fields, initial),
    view: first,
    good: { view: first, values: initial },
    errors: new Map(),
    stale: false,
  };
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  return {
    get: () => state,
    set(values, byPerson) {
      const found = problems(def.fields, values);
      const ok = Object.keys(found).length === 0;
      const view = ok ? viewOf(def, data, values) : state.view;
      state = {
        ...state,
        values,
        touched: state.touched || byPerson,
        problems: found,
        view,
        good: ok && !view.problem ? { view, values } : state.good,
        stale: !ok || state.errors.size > 0,
      };
      notify();
    },
    wrong(id, error) {
      const now = state.errors.get(id);
      if (now?.message === error?.message && now?.label === error?.label) return;
      const errors = new Map(state.errors);
      if (error) errors.set(id, error);
      else errors.delete(id);
      // An error shows only after the person typed or left the field: the card may say it (its region speaks when touched).
      state = { ...state, errors, touched: state.touched || error !== null, stale: Object.keys(state.problems).length > 0 || errors.size > 0 };
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** The first field of the form, in the order of the page, that shows an error now (the card says its message). */
export function firstError(errors: ReadonlyMap<string, FieldError>): [string, FieldError] | undefined {
  const entries = [...errors];
  if (entries.length < 2 || typeof document === 'undefined') return entries[0];
  return entries.sort(([a], [b]) => {
    const x = document.getElementById(a);
    const y = document.getElementById(b);
    if (!x || !y) return 0;
    return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  })[0];
}

/** The store's state, repainting the component on every change. */
export function useCalc(store: CalcStore): CalcState {
  const [, repaint] = useState(0);
  const state = store.get();
  const seen = useRef(state);
  seen.current = state;
  useEffect(() => {
    const unsubscribe = store.subscribe(() => repaint((n) => n + 1));
    // A change made between the render and this effect repaints now: the scenario link is set right after
    // hydrate(), before Preact runs the effects, and was lost when the page loaded fast.
    if (store.get() !== seen.current) repaint((n) => n + 1);
    return unsubscribe;
  }, [store]);
  return state;
}
