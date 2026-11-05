// The schedule section of a calculator. F13b (UX-12 A, D-43 and F4 ACE-8; DECISOES § C-5): it is part of the island, before
// the next-step chips, as a block that folds, closed when the page opens, with a fixed name (its heading, the same open and
// closed) and the round chevron of the Faq that turns with aria-expanded; the first ad stays after the chips, never inside
// it. Before, it was an island of its own after the first ad, and its button said "Show the full schedule" or "Hide the
// schedule". The table is only built when the person opens the block, so a key press never pays for it while it is closed.
// A table that is the result itself (the areas, the bags, the cycles, the dates of a pregnancy: CalcView.open, F7) is short
// and shows open, with no button, under its heading. The frame of the table is the region named by that heading; the section
// itself takes no name, or the page would have two regions of the same name (axe landmark-unique).
import { useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import type { NumberLang } from '../../calc/parse.ts';
import AmortTable from './AmortTable.tsx';
import { cellText } from './view.ts';
import type { CalcPanelData, CalcView, Cell } from './types.ts';

export const SCHEDULE_HEADING_ID = 'fo-schedule-heading';

export default function CalcSchedule({ data, view }: { data: CalcPanelData; view: CalcView }) {
  const [open, setOpen] = useState(false);
  const heading = data.texts.view['scheduleHeading'] ?? data.t.scheduleHeading;
  // A text cell may carry a shorter form for the screen (the dates of the ovulation; the CSV and the PDF keep the long one).
  const long = cellText(data.lang as NumberLang);
  const cell = (value: Cell) => ('text' in value && value.short !== undefined ? value.short : long(value));
  if (view.open) {
    return (
      <section id="fo-calc-schedule" class="fo-calc-schedule fo-calc__schedule">
        <h2 class="fo-calc__moreheading" id={SCHEDULE_HEADING_ID}>
          {heading}
        </h2>
        <div id="fo-schedule-table">
          <AmortTable table={view.table()} cell={cell} chevron={data.icons.chevron} labelledBy={SCHEDULE_HEADING_ID} />
        </div>
      </section>
    );
  }
  return (
    <section id="fo-calc-schedule" class="fo-calc-schedule fo-calc__schedule">
      <h2 class="fo-disclose">
        <button type="button" class="fo-disclose__btn" aria-expanded={open} aria-controls="fo-schedule-table" onClick={() => setOpen(!open)}>
          <span class="fo-disclose__text">
            <span class="fo-disclose__title" id={SCHEDULE_HEADING_ID}>
              {heading}
            </span>
            {view.scheduleMeta && <span class="fo-disclose__meta">{view.scheduleMeta}</span>}
          </span>
          <span class="fo-disclose__icon" aria-hidden="true">
            <Icon inner={data.icons.down} />
          </span>
        </button>
      </h2>
      <div id="fo-schedule-table" class="fo-disclose__panel" hidden={!open}>
        {open && <AmortTable table={view.table()} cell={cell} chevron={data.icons.chevron} labelledBy={SCHEDULE_HEADING_ID} />}
      </div>
    </section>
  );
}
