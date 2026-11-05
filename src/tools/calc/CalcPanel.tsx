// The money calculator island (DECISOES § 110), shared by the 18 calculators and the guides: the main
// fields, the result (ResultHero with its Download PDF, the SplitChart, then Download CSV and Copy link), the other fields,
// the two scenarios where the account compares, the schedule (F13b) and the next-step chips. There is no Calculate button: every valid key
// press runs the account at once (the engines are small and synchronous). On a phone the result sits right under the main
// fields; on a computer the fields and the result stand side by side.
// F13b (UX-12 A; DECISOES § 545): the card is the one place of the result, of the Download PDF and of the error.
import { useMemo, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import { track } from '../../analytics/events.ts';
import { dollars, type NumberLang } from '../../calc/parse.ts';
import { fmt, percent } from '../../i18n/format.ts';
import type { Pose } from '../../oli/poses.ts';
import { shares } from './SplitChart.tsx';
import { DEFS } from './defs/index.ts';
import Fields, { AddRow } from './Fields.tsx';
import ResultHero from './ResultHero.tsx';
import ExportBar from './ExportBar.tsx';
import ScenarioCompare from './ScenarioCompare.tsx';
import CalcSchedule from './CalcSchedule.tsx';
import { createStore, firstError, useCalc, type CalcStore } from './store.ts';
import { linkHash, visible } from './form.ts';
import { csvText, reportInput, reportPdf, save } from './exports.ts';
import { cellText, fieldText, inputRows } from './view.ts';
import type { CalcDef, CalcPanelData, CalcView, Values } from './types.ts';

/** The Oli cheers once per visit; the mark kept for that is a yes, never a number. */
export const CHEER_KEY = 'fo-calc-cheer';

export interface CalcIslandProps {
  data: CalcPanelData;
  /** The store the island's parts share (the mount passes it; the server makes its own). */
  store?: CalcStore;
}

export function startValues(data: CalcPanelData): Values {
  return data.initial ?? DEFS[data.page].initial;
}

let completeSent = false;
let cheerChecked: boolean | null = null;
/** The cheer of the visit was shown and an error came after it: from then on the Oli waves (DECISOES § 545). */
let cheerSpent = false;

/**
 * The longest line the card may say in the place of the sentence: "Last result that worked: {label} {value}." of any field of
 * the form (and "Fix the highlighted field…"), or of the result itself (a problem with no field). The card keeps its room
 * from the first paint, so an error never grows it (DECISOES § 545).
 */
function reserveOf(def: CalcDef, data: CalcPanelData, good: { view: CalcView; values: Values }): string {
  const say = (label: string, value: string) => fmt(data.t.lastWorked, { label, value });
  const lines = [say(good.view.hero.label, `${good.view.hero.value}${good.view.hero.unit ?? ''}`)];
  for (const spec of def.fields) {
    if (!visible(spec, good.values) || spec.kind === 'choice' || spec.kind === 'select') continue;
    const keys = spec.kind === 'list' ? spec.item.map((item) => [`${spec.key}0${item.key}`, item.key] as const) : [[spec.key, spec.key] as const];
    for (const [name, key] of keys) {
      const label = data.texts.fields[key]?.label;
      const value = fieldText(def.fields, good.values, name, data);
      if (label && value !== null) lines.push(`${say(label, value)} ${data.t.stale}`);
    }
  }
  return lines.reduce((longest, line) => (line.length > longest.length ? line : longest), '');
}

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
  const { values, view, good } = state;
  const lang = data.lang as NumberLang;
  const [busy, setBusy] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const [costsOpen, setCostsOpen] = useState(false);
  const set = (next: Values) => {
    store.set(next, true);
    if (!completeSent && Object.keys(store.get().problems).length === 0) {
      completeSent = true;
      track('calc_complete', { tool: data.page, lang: data.lang });
    }
  };
  // The card says the first field of the form that shows an error, else the problem of the account (DECISOES § 545).
  const wrongField = firstError(state.errors);
  const error = wrongField?.[1].message ?? view.problem;
  const fixField = wrongField !== undefined || (view.problem !== undefined && view.problemField !== undefined);
  // "Last result that worked": the field in error (or the one the problem points to) with its value in the last result;
  // with no field, the last result itself. The example until the person has another one.
  let last: string | undefined;
  if (error !== undefined) {
    const key = wrongField ? wrongField[0].replace(/^fo-calc-/, '') : view.problemField;
    const label = wrongField ? wrongField[1].label : key ? data.texts.fields[key]?.label : undefined;
    const value = key ? fieldText(def.fields, good.values, key, data) : null;
    const said = label && value !== null ? { label, value } : { label: good.view.hero.label, value: `${good.view.hero.value}${good.view.hero.unit ?? ''}` };
    last = `${fmt(data.t.lastWorked, said)}${fixField ? ` ${data.t.stale}` : ''}`;
  }
  // The Oli: wave on the example, cheer once on the first result of the visit (never on a health page, and a re-render
  // never starts it again), oops on an error, and wave after it.
  if (error !== undefined && cheerChecked) cheerSpent = true;
  const cheer = data.cheer && state.touched && error === undefined && !cheerSpent && typeof window !== 'undefined' && firstCheer();
  const pose: Pose = error !== undefined ? 'oops' : cheer ? 'cheer' : 'wave';
  const main = def.fields.filter((spec) => spec.main);
  const more = def.fields.filter((spec) => !spec.main);
  // The fields that fold into the block of costs (CalcDef.disclose), and the others after the result.
  const folded = more.filter((spec) => def.disclose?.includes(spec.key));
  const open = more.filter((spec) => !def.disclose?.includes(spec.key));
  const shown = view.problem !== undefined ? good.view : view;
  // A list whose Add button comes after the result (F7: the areas of the square footage).
  const addBelow = main.flatMap((spec) => (spec.kind === 'list' && spec.addBelow ? [spec] : []));
  const cell = cellText(lang);
  const fieldProps = { values, problems: state.problems, data, set, report: store.wrong, flagged: view.problem !== undefined ? view.problemField : undefined, latest: () => store.get().values };
  const off = view.problem !== undefined || state.stale;

  const pdf = async () => {
    if (busy) return;
    track('export_click', { tool: data.page, lang: data.lang, format: 'pdf' });
    setBusy(true);
    setPdfFailed(false);
    try {
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
    } catch {
      setPdfFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class={data.cat === 'home' ? 'fo-calc fo-calc--home' : 'fo-calc'}>
      <div class="fo-calc__fields fo-calc__main">
        <Fields {...fieldProps} specs={main} />
      </div>
      <div class="fo-calc__result">
        <ResultHero
          view={shown}
          error={error}
          last={last}
          reserve={reserveOf(def, data, good)}
          touched={state.touched}
          pose={pose}
          download={{ label: data.t.pdf, icon: data.icons.pdf, busy, onClick: () => void pdf() }}
          alert={data.icons.alert}
          money={(cents) => dollars(cents, lang)}
          percent={(value) => percent(value, lang)}
          splitName={(v) => {
            // In whole units, as the sentence above it says them, with the shares (README of the SplitChart).
            if (!v.split) return '';
            const [pa, pb] = shares(v.split.a.cents, v.split.b.cents);
            return `${v.split.a.label} ${dollars(v.split.a.cents, lang)}, ${percent(pa, lang)}. ${v.split.b.label} ${dollars(v.split.b.cents, lang)}, ${percent(pb, lang)}.`;
          }}
        />
        <ExportBar
          page={data.page}
          lang={data.lang}
          t={data.t}
          icons={data.icons}
          off={off}
          pdfFailed={pdfFailed}
          csv={() => save(new Blob([csvText(view.table(), data.t.year.replace(/\s*\{n\}/, ''), lang)], { type: 'text/csv;charset=utf-8' }), `${data.file}.csv`)}
          link={() => `${window.location.origin}${data.linkPath}${linkHash(def.fields, values)}`}
        />
      </div>
      {(more.length > 0 || addBelow.length > 0) && (
        <div class="fo-calc__fields fo-calc__more">
          {data.texts.moreHeading && (open.length > 0 || addBelow.length > 0) && <h2 class="fo-calc__moreheading">{data.texts.moreHeading}</h2>}
          {addBelow.map((spec) => (
            <AddRow {...fieldProps} key={spec.key} specs={[]} spec={spec} />
          ))}
          <Fields {...fieldProps} specs={open} />
          {folded.length > 0 && (
            // F13b (UX-12 A, D-32 and D-33; DECISOES § 547): the costs fold into a block, closed when the page opens, with their
            // total in its title; its fields are in the page only while it is open, and on a phone it ends in the echo of the
            // result, since the card is above the screen while the person types there.
            <div class="fo-calc__fold">
              <h2 class="fo-disclose">
                <button type="button" class="fo-disclose__btn" aria-expanded={costsOpen} aria-controls="fo-calc-more-fields" onClick={() => setCostsOpen(!costsOpen)}>
                  <span class="fo-disclose__text">
                    <span class="fo-disclose__title">{data.texts.disclose ?? data.texts.moreHeading}</span>
                    {shown.more && <span class="fo-disclose__meta">{shown.more}</span>}
                  </span>
                  <span class="fo-disclose__icon" aria-hidden="true">
                    <Icon inner={data.icons.down} />
                  </span>
                </button>
              </h2>
              <div id="fo-calc-more-fields" class="fo-calc__fields fo-disclose__panel" hidden={!costsOpen}>
                {costsOpen && (
                  <>
                    <Fields {...fieldProps} specs={folded} />
                    <p class="fo-calc__echo" aria-hidden="true">
                      <span>{shown.hero.label}</span>
                      <span class="fo-calc__echo-n">
                        <b>{shown.hero.value}</b>
                        {shown.hero.unit && <small>{shown.hero.unit}</small>}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {view.compare && !view.problem && (
        <div class="fo-calc__compare">
          <ScenarioCompare compare={view.compare} info={data.icons.info} label={data.texts.view['compareLabel'] ?? ''} />
        </div>
      )}
      {/* F13b (D-43; DECISOES § 548): the schedule is part of the island, before the chips; the first ad stays after them. */}
      <CalcSchedule data={data} view={shown} />
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
