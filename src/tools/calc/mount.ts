// Hydrates the money calculator island (DECISOES § 23 and § 110): the form and result (#fo-tool-root)
// and the schedule (#fo-calc-schedule) share one store. On a calculator page the #v=1 link is read once,
// after hydration, so the server HTML and the first client render are the same; the page never writes to
// the URL. A guide fills the form from its props only.
import { h, hydrate } from 'preact';
import CalcPanel, { startValues } from './CalcPanel.tsx';
import CalcSchedule from './CalcSchedule.tsx';
import { DEFS } from './defs/index.ts';
import { readLink } from './form.ts';
import { createStore } from './store.ts';
import type { CalcPanelData } from './types.ts';

const root = document.getElementById('fo-tool-root');
if (root?.dataset['props']) {
  const data = JSON.parse(root.dataset['props']) as CalcPanelData;
  const def = DEFS[data.page];
  const start = startValues(data);
  const store = createStore(def, data, start);
  hydrate(h(CalcPanel, { data, store }), root);
  const schedule = document.getElementById('fo-calc-schedule');
  if (schedule) hydrate(h(CalcSchedule, { data, store }), schedule);
  if (data.readLink && window.location.hash.length > 1) {
    const linked = readLink(window.location.hash, def.fields, start);
    if (linked !== start) store.set(linked, false);
  }
  root.dataset['hydrated'] = 'true';
}
