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
  /** The values on screen are not the ones the view was made from: a problem between fields, or a field that shows its range
   * error (DECISOES § 116; until the review F7 the range error left the line out and the PDF on, § 276). */
  stale: boolean;
}

export interface CalcStore {
  get(): CalcState;
  /** New values; `byPerson` is false for the scenario link read at load. */
  set(values: Values, byPerson: boolean): void;
  subscribe(listener: () => void): () => void;
  /** The field with this id shows its range error, or no longer does. */
  wrong(id: string, is: boolean): void;
}

export function viewOf(def: CalcDef, data: CalcPanelData, values: Values): CalcView {
  return def.view(def.compute(def.toInput(values)), values, data.texts, data.t, data.lang);
}

export function createStore(def: CalcDef, data: CalcPanelData, initial: Values): CalcStore {
  let state: CalcState = { values: initial, touched: false, problems: problems(def.fields, initial), view: viewOf(def, data, initial), stale: false };
  const listeners = new Set<() => void>();
  const wrongIds = new Set<string>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
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
        stale: !ok || wrongIds.size > 0,
      };
      notify();
    },
    wrong(id, is) {
      if (wrongIds.has(id) === is) return;
      if (is) wrongIds.add(id);
      else wrongIds.delete(id);
      state = { ...state, stale: Object.keys(state.problems).length > 0 || wrongIds.size > 0 };
      notify();
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
