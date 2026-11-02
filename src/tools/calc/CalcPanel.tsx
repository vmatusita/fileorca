// The money calculator island (DECISOES § 110), shared by the 18 calculators and the guides: the main
// fields, the result (ResultHero, SplitChart, ExportBar), the other fields, the two scenarios where the
// account compares, and the next-step chips. There is no Calculate button: every valid key press runs the
// account at once (the engines are small and synchronous). On a phone the result sits right under the main
// fields; on a computer the fields and the result stand side by side.
import { useMemo } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import { track } from '../../analytics/events.ts';
import { dollars, type NumberLang } from '../../calc/parse.ts';
import { percent } from '../../i18n/format.ts';
import { shares } from './SplitChart.tsx';
import { DEFS } from './defs/index.ts';
import Fields from './Fields.tsx';
import ResultHero from './ResultHero.tsx';
import ExportBar from './ExportBar.tsx';
import ScenarioCompare from './ScenarioCompare.tsx';
import { createStore, useCalc, type CalcStore } from './store.ts';
import { linkHash } from './form.ts';
import { csvText, reportInput, reportPdf, save } from './exports.ts';
import { cellText, inputRows } from './view.ts';
import type { CalcPanelData, Values } from './types.ts';

/** The Oli cheers once per visit; the mark kept for that is a yes, never a number. */
export const CHEER_KEY = 'fo-calc-cheer';

export interface CalcIslandProps {
  data: CalcPanelData;
  /** The store the two islands share (the mount passes it; the server makes its own). */
  store?: CalcStore;
}

export function startValues(data: CalcPanelData): Values {
  return data.initial ?? DEFS[data.page].initial;
}

let completeSent = false;
let cheerChecked: boolean | null = null;

/** Whether this is the visit's first result: a sessionStorage yes/no that may be missing or blocked. */
function firstCheer(): boolean {
  if (cheerChecked !== null) return cheerChecked;
  try {
    cheerChecked = window.sessionStorage.getItem(CHEER_KEY) !== '1';
    window.sessionStorage.setItem(CHEER_KEY, '1');
  } catch {
    cheerChecked = true;
  }
  return cheerChecked;
}

export default function CalcPanel({ data, store: shared }: CalcIslandProps) {
  const def = DEFS[data.page];
  const store = useMemo(() => shared ?? createStore(def, data, startValues(data)), [shared, def, data]);
  const state = useCalc(store);
  const { values, view } = state;
  const lang = data.lang as NumberLang;
  const set = (next: Values) => {
    store.set(next, true);
    if (!completeSent && Object.keys(store.get().problems).length === 0) {
      completeSent = true;
      track('calc_complete', { tool: data.page, lang: data.lang });
    }
  };
  // The visit's one cheer waits for a result: a problem (a payment under the interest) shows no Oli and keeps it.
  const cheer = data.cheer && state.touched && !view.problem && typeof window !== 'undefined' && firstCheer();
  const main = def.fields.filter((spec) => spec.main);
  const more = def.fields.filter((spec) => !spec.main);
  const cell = cellText(lang);
  const fieldProps = { values, problems: state.problems, data, set };

  return (
    <div class="fo-calc">
      <div class="fo-calc__fields fo-calc__main">
        <Fields {...fieldProps} specs={main} />
      </div>
      <div class="fo-calc__result">
        <ResultHero
          view={view}
          touched={state.touched}
          cheer={cheer}
          money={(cents) => dollars(cents, lang)}
          percent={(value) => percent(value, lang)}
          splitName={(v) => {
            // In whole units, as the sentence above it says them, with the shares (README of the SplitChart).
            if (!v.split) return '';
            const [pa, pb] = shares(v.split.a.cents, v.split.b.cents);
            return `${v.split.a.label} ${dollars(v.split.a.cents, lang)}, ${percent(pa, lang)}. ${v.split.b.label} ${dollars(v.split.b.cents, lang)}, ${percent(pb, lang)}.`;
          }}
        />
        {state.stale && <p class="fo-field__help fo-calc__stale">{data.t.stale}</p>}
        <ExportBar
          page={data.page}
          lang={data.lang}
          t={data.t}
          icons={data.icons}
          off={view.problem !== undefined || state.stale}
          csv={() => save(new Blob([csvText(view.table(), data.t.year.replace(/\s*\{n\}/, ''), lang)], { type: 'text/csv;charset=utf-8' }), `${data.file}.csv`)}
          pdf={async () => {
            const input = reportInput(
              {
                title: data.name,
                inputs: inputRows(def.fields, values, data),
                results: view.summary,
                premises: view.premises,
                table: view.table(),
                tableHeading: data.texts.view['scheduleHeading'],
                notice: data.notice,
                cell,
              },
              data.t,
              lang,
            );
            save(await reportPdf(input), `${data.file}.pdf`);
          }}
          link={() => `${window.location.origin}${data.linkPath}${linkHash(def.fields, values)}`}
        />
      </div>
      {more.length > 0 && (
        <div class="fo-calc__fields fo-calc__more">
          {data.texts.moreHeading && <h2 class="fo-h3 fo-calc__moreheading">{data.texts.moreHeading}</h2>}
          <Fields {...fieldProps} specs={more} />
        </div>
      )}
      {view.compare && !view.problem && (
        <div class="fo-calc__compare">
          <ScenarioCompare compare={view.compare} info={data.icons.info} label={data.texts.view['compareLabel'] ?? ''} />
        </div>
      )}
      {data.chips.length > 0 && (
        <nav class="fo-next fo-calc__next" aria-labelledby="fo-next-label">
          <span class="fo-next__label" id="fo-next-label">
            {data.t.nextLabel}
          </span>
          {data.chips.map((chip) => (
            <a
              key={chip.href}
              class={`fo-chip fo-cat--${data.cat}`}
              href={chip.href}
              onClick={() => track('next_step_click', { tool: data.page, lang: data.lang, target: chip.target })}
            >
              <span class="fo-chip__dot" aria-hidden="true">
                <Icon inner={chip.icon} />
              </span>
              {chip.name}
              <Icon inner={data.icons.arrow} />
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
