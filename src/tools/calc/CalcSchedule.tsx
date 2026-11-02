// The schedule section of a calculator: its own island after the first AdSlot (the page mold puts the ad
// between the chips and the schedule), sharing the form's store. The table is only built when the person
// opens the section, so a key press never pays for it while it is closed. A table that is the result itself (the
// areas, the bags, the cycles, the dates of a pregnancy: CalcView.open, F7) is short and shows open, with no button.
import { useMemo, useState } from 'preact/hooks';
import type { NumberLang } from '../../calc/parse.ts';
import { DEFS } from './defs/index.ts';
import AmortTable from './AmortTable.tsx';
import { startValues, type CalcIslandProps } from './CalcPanel.tsx';
import { createStore, useCalc } from './store.ts';
import { cellText } from './view.ts';

export default function CalcSchedule({ data, store: shared }: CalcIslandProps) {
  const def = DEFS[data.page];
  const store = useMemo(() => shared ?? createStore(def, data, startValues(data)), [shared, def, data]);
  const { view } = useCalc(store);
  const [open, setOpen] = useState(false);
  const heading = data.texts.view['scheduleHeading'] ?? data.t.scheduleHeading;
  if (view.open) {
    return (
      <section class="fo-section fo-calc-schedule" aria-labelledby="fo-schedule-heading">
        <h2 id="fo-schedule-heading">{heading}</h2>
        <div id="fo-schedule-table">
          <AmortTable table={view.table()} cell={cellText(data.lang as NumberLang)} chevron={data.icons.chevron} />
        </div>
      </section>
    );
  }
  return (
    <section class="fo-section fo-calc-schedule" aria-labelledby="fo-schedule-heading">
      <h2 id="fo-schedule-heading">{heading}</h2>
      <button type="button" class="fo-btn" aria-expanded={open} aria-controls="fo-schedule-table" onClick={() => setOpen(!open)}>
        {open ? data.t.hideSchedule : data.t.showSchedule}
      </button>
      <div id="fo-schedule-table">{open && <AmortTable table={view.table()} cell={cellText(data.lang as NumberLang)} chevron={data.icons.chevron} />}</div>
    </section>
  );
}
