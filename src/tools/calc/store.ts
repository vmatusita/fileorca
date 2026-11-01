// The state one calculator's two islands share: the form and result (#fo-tool-root) and the schedule
// (#fo-calc-schedule), which sits after the first AdSlot as the page mold asks. Both are hydrated by the
// same mount entry and read this store, so a key press runs the account once and both repaint.
import { useEffect, useRef, useState } from 'preact/hooks';
import { problems, type Problems } from './form.ts';
import type { CalcDef, CalcPanelData, CalcView, Values } from './types.ts';

export interface CalcState {
  values: Values;
  /** The person changed something (the first change sends calc_complete and may bring the Oli). */
  touched: boolean;
  problems: Problems;
  /** The view of the last values that made an account: a wrong field keeps it on screen. */
  view: CalcView;
  /** The values on screen are not the ones the view was made from. */
  stale: boolean;
}

export interface CalcStore {
  get(): CalcState;
  /** New values; `byPerson` is false for the scenario link read at load. */
  set(values: Values, byPerson: boolean): void;
  subscribe(listener: () => void): () => void;
}

export function viewOf(def: CalcDef, data: CalcPanelData, values: Values): CalcView {
  return def.view(def.compute(def.toInput(values)), values, data.texts, data.t, data.lang);
}

export function createStore(def: CalcDef, data: CalcPanelData, initial: Values): CalcStore {
  let state: CalcState = { values: initial, touched: false, problems: problems(def.fields, initial), view: viewOf(def, data, initial), stale: false };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(values, byPerson) {
      const found = problems(def.fields, values);
      const ok = Object.keys(found).length === 0;
      state = {
        values,
        touched: state.touched || byPerson,
        problems: found,
        view: ok ? viewOf(def, data, values) : state.view,
        stale: !ok,
      };
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
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
