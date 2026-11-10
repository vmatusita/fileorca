// The money calculator island (DECISOES § 110), shared by the 18 calculators and the guides: the main
// fields, the result (ResultHero with its Download PDF, the SplitChart, then Download CSV and Copy link), the other fields,
// the two scenarios where the account compares, the schedule (F13b) and the next-step chips. There is no Calculate button: every valid key
// press runs the account at once (the engines are small and synchronous). On a phone the result sits right under the main
// fields; on a computer the fields and the result stand side by side.
// F13b (UX-12 A; DECISOES § 545): the card is the one place of the result, of the Download PDF and of the error.
import { useMemo, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import { track } from '../../analytics/events.ts';
import { dollars, money, parseScaled, type NumberLang } from '../../calc/parse.ts';
import { fmt, percent } from '../../i18n/format.ts';
import type { Pose } from '../../oli/poses.ts';
import { shares } from './SplitChart.tsx';
import { DEFS } from './defs/index.ts';
import Fields, { AddRow } from './Fields.tsx';
import ResultHero, { plain } from './ResultHero.tsx';
import ExportBar from './ExportBar.tsx';
import ScenarioCompare from './ScenarioCompare.tsx';
import CalcSchedule from './CalcSchedule.tsx';
import { createStore, firstError, useCalc, viewOf, type CalcStore } from './store.ts';
import { decimalsMessage, decimalsOf, display, inRange, linkHash, problems, visible } from './form.ts';
import { csvText, reportInput, reportPdf, save } from './exports.ts';
import { cellText, fieldText, inputRows, lineWidth, widen } from './view.ts';
import type { CalcDef, CalcPanelData, CalcView, NumberSpec, Values } from './types.ts';

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

/** The room the card keeps (heroReserves). */
export interface HeroReserves {
  get: string;
  sentence: string;
  stale: string;
  label: string;
  legend: [string, string];
}

const longest = (lines: readonly string[], width: (line: string) => number = (line) => line.length): string =>
  lines.reduce((most, line) => (width(line) > width(most) ? line : most), '');

/**
 * The values of the start with one number field changed: one zero more and one digit less, as a person types them.
 * Since the F16 a zero more of a number with a thousands separator reads ("375,0000" is 3,750,000, decision 3), so the card
 * keeps the room of ten times each grouped number too: the "a zero more" of the money-card spec types it, and it is the value
 * of another order of magnitude typed key by key of the F13b c-3 (decision 13, the exception; DECISOES § 694).
 */
export function nudges(def: CalcDef, data: CalcPanelData, start: Values): Values[] {
  const lang = data.lang as NumberLang;
  const out: Values[] = [];
  const twice = (spec: NumberSpec, value: number, put: (value: number) => Values) => {
    const text = display(spec.kind, value, lang, spec.decimals);
    for (const typed of [`${text}0`, text.slice(0, -1)]) {
      const parsed = parseScaled(typed, lang, decimalsOf(spec.kind, spec.decimals), spec.negative === true);
      if (parsed !== null && parsed !== value && inRange(spec, parsed)) out.push(put(parsed));
    }
  };
  for (const spec of def.fields) {
    if (!spec.main || !visible(spec, start)) continue;
    if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec') twice(spec, Number(start[spec.key]), (value) => ({ ...start, [spec.key]: value }));
    if (spec.kind === 'down') {
      const percent = start[spec.unitKey] === 'percent';
      const key = percent ? spec.percentKey : spec.key;
      twice({ kind: percent ? 'rate' : 'money', key, min: 0, max: percent ? 1_000_000 : spec.max }, Number(start[key]), (value) => ({ ...start, [key]: value }));
    }
    if (spec.kind === 'list') {
      const rows = start[spec.key] as Record<string, number>[];
      rows.forEach((row, index) => {
        for (const item of spec.item) twice(item, row[item.key] ?? 0, (value) => ({ ...start, [spec.key]: rows.map((one, at) => (at === index ? { ...one, [item.key]: value } : one)) }));
      });
    }
  }
  return out.filter((values) => Object.keys(problems(def.fields, values)).length === 0);
}

/**
 * The room the card keeps from the first paint, so another value or an error never grows it and nothing under it moves
 * (DECISOES § 545; review F13b a-1, c-1, c-4 and f-7, § 595). Each is drawn hidden by a pseudo-element of its cell, never as
 * text of the page (the screen reader and the words of gate:prontidao do not read it), and is worked out once, from the
 * values the page starts with, so it never changes while the person types:
 * - `get`, the room of the Download: the longest message the card may put there, the range of any field (with the hint of
 *   the decimals and the "over" line), the decimals message of each number field (F16) and every problem of the account
 *   (CalcDef.problems), its numbers as wide as the largest amount of the example;
 * - `sentence`, the room of the sentence: the widest of the sentences of the example and of the example with one main field
 *   nudged as a person types it (one zero more, one digit less), every digit drawn as the widest one and the bold words in
 *   capitals (the reserve is drawn in one weight, and the capitals are wider than the bold);
 * - `stale`, the room of the error in the same cell: "Last result that worked: {label} {value}." of any field (with "Fix the
 *   highlighted field…") and of the result itself.
 */
export function heroReserves(def: CalcDef, data: CalcPanelData, start: Values): HeroReserves {
  const lang = data.lang as NumberLang;
  const view = viewOf(def, data, start);
  // The messages of the fields and of the problems.
  const messages: string[] = [];
  // The decimals message of each number field, by the decimals it keeps (F16, item 2; DECISOES § 684).
  const places = new Set<number>();
  const addField = (key: string, decimals: boolean, n?: number) => {
    if (n !== undefined) places.add(n);
    const texts = data.texts.fields[key];
    if (!texts) return;
    if (texts.error) messages.push(texts.error, ...(decimals ? [`${texts.error} ${data.t.decimalHint}`] : []));
    if (texts.over) messages.push(texts.over);
  };
  let largest = 0;
  for (const spec of def.fields) {
    if (spec.kind === 'choice' || spec.kind === 'select') continue;
    if (spec.kind === 'list') {
      for (const item of spec.item) {
        addField(item.key, item.kind !== 'int', decimalsOf(item.kind, item.decimals));
        for (const option of spec.pick?.options ?? []) addField(`${item.key}-${option}`, item.kind !== 'int');
        if (item.kind === 'money') for (const row of start[spec.key] as Record<string, number>[]) largest = Math.max(largest, row[item.key] ?? 0);
      }
      continue;
    }
    if (spec.kind === 'down') {
      addField(spec.key, true, decimalsOf('money'));
      addField(spec.percentKey, true, decimalsOf('rate'));
      largest = Math.max(largest, Number(start[spec.key]) || 0);
      continue;
    }
    if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec') addField(spec.key, spec.kind !== 'int', decimalsOf(spec.kind, spec.decimals));
    else addField(spec.key, false);
    if (spec.kind === 'money') largest = Math.max(largest, Number(start[spec.key]) || 0);
  }
  for (const n of places) messages.push(decimalsMessage(data.t, n));
  const amount = widen(money(largest, lang), lang);
  for (const key of def.problems ?? []) {
    const template = data.texts.view[key];
    if (template) messages.push(template.replace(/\{\w+\}/g, () => amount));
  }
  // The sentence of the example and of the example nudged, as wide as their digits and bold words draw.
  const drawn = (sentence: CalcView['hero']['sentence']) => sentence.map((part) => (typeof part === 'string' ? part : widen(part.b, lang).toUpperCase())).join('');
  const views = [view, ...nudges(def, data, start).map((values) => viewOf(def, data, values))].filter((one) => one.problem === undefined);
  const sentences = views.map((one) => drawn(one.hero.sentence));
  // The label of the card and the two lines of the legend of its chart, which other numbers may wrap again too.
  const labels = views.map((one) => one.hero.label);
  const legend = views.map((one): [string, string] => {
    if (one.pair) return [`${one.pair.principal.label} ${dollars(one.pair.principal.cents, lang)}`, plain(one.pair.interest)];
    if (!one.split) return ['', ''];
    const [pa, pb] = shares(one.split.a.cents, one.split.b.cents);
    return [`${one.split.a.label} ${dollars(one.split.a.cents, lang)} · ${percent(pa, lang)}`, `${one.split.b.label} ${dollars(one.split.b.cents, lang)} · ${percent(pb, lang)}`];
  });

  // The last result that worked, of each field and of the result.
  const say = (label: string, value: string) => fmt(data.t.lastWorked, { label, value: widen(value, lang) });
  const stale = [say(view.hero.label, `${view.hero.value}${view.hero.unit ?? ''}`)];
  for (const spec of def.fields) {
    if (!visible(spec, start) || spec.kind === 'choice' || spec.kind === 'select') continue;
    const keys = spec.kind === 'list' ? spec.item.map((item) => [`${spec.key}0${item.key}`, item.key] as const) : [[spec.key, spec.key] as const];
    // A row of a list is named before its label, with the number of its last row (review F13b f-4).
    const row = spec.kind === 'list' ? `${fmt(data.texts.view['row'] ?? data.t.row, { n: spec.max })} ` : '';
    for (const [name, key] of keys) {
      const label = data.texts.fields[key]?.label;
      const value = fieldText(def.fields, start, name, data);
      if (label && value !== null) stale.push(`${say(`${row}${label}`, value)} ${data.t.stale}`);
    }
  }
  const line = (index: 0 | 1) => widen(longest(legend.map((pair) => pair[index]), lineWidth), lang);
  return { get: longest(messages), sentence: longest(sentences, lineWidth), stale: longest(stale, lineWidth), label: longest(labels, lineWidth), legend: [line(0), line(1)] };
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
  // The room the card keeps (review F13b a-1; DECISOES § 595): once, from the values the page starts with.
  const reserves = useMemo(() => heroReserves(def, data, startValues(data)), [def, data]);
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
  // The field the card speaks for (review F13b b-2; DECISOES § 593): the first in error, else the one a problem points to.
  const named = wrongField?.[0] ?? (view.problem !== undefined && view.problemField !== undefined ? `fo-calc-${view.problemField}` : undefined);
  const fieldProps = { values, problems: state.problems, data, set, report: store.wrong, drafting: store.draft, flagged: view.problem !== undefined ? view.problemField : undefined, flagMessage: view.problem, named, latest: () => store.get().values };
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
          reserves={reserves}
          touched={state.touched}
          drafts={store}
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
                    <p class="fo-calc__echo" aria-hidden="true" data-state={error !== undefined ? 'error' : undefined}>
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
