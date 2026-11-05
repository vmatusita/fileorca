// Hydrates the money calculator island (DECISOES § 23 and § 110): the form, the result and, since the F13b, the schedule
// (#fo-calc-schedule is part of the island, DECISOES § C-5; before, it was a second root of the same entry). On a calculator
// page the #v=1 link is read once, after hydration, so the server HTML and the first client render are the same; the page
// never writes to the URL. A guide fills the form from its props only.
import { h, hydrate } from 'preact';
import CalcPanel, { startValues } from './CalcPanel.tsx';
import { DEFS } from './defs/index.ts';
import { readLink } from './form.ts';
import { createStore } from './store.ts';
import type { CalcPanelData } from './types.ts';

/** The device's local day as "2026-11-02": 10 p.m. in Brasília is still today, whatever the day is in UTC. */
function localToday(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const root = document.getElementById('fo-tool-root');
if (root?.dataset['props']) {
  const data = JSON.parse(root.dataset['props']) as CalcPanelData;
  const def = DEFS[data.page];
  const start = startValues(data);
  const store = createStore(def, data, start);
  hydrate(h(CalcPanel, { data, store }), root);
  if (data.readLink && window.location.hash.length > 1) {
    const linked = readLink(window.location.hash, def.fields, start);
    if (linked !== start) store.set(linked, false);
  }
  // The weeks of a pregnancy count from the device's own day, read once and never written anywhere (F7, decision 3).
  if (def.today) store.set({ ...store.get().values, today: localToday() }, false);
  root.dataset['hydrated'] = 'true';
}
