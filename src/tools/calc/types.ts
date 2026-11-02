// What the money calculator island is made of (DECISOES § 110): one island for the 18 calculators, as § 69
// did for the image tools. A calculator declares its fields and its account in a definition
// (src/tools/calc/defs/<id>.ts); the page writes the plain data of the island into data-props
// (CalcPanelData), and the texts arrive there too, so the browser never loads a text file.
import type { Lang } from '../../i18n/routes.ts';
import type { MoneyPageId } from './registry.ts';

/** A value of the form: a number in engine units, a choice, or a list of rows (the debts). */
export type Value = number | string | Record<string, number>[];
export type Values = Record<string, Value>;

interface FieldBase {
  /** The state key, and the short key of the scenario link (#v=1&key=value). */
  key: string;
  /** Shown only while another field has this value. */
  when?: { key: string; is: string };
  /** Comes before the result on a phone (the main fields); the rest follow it. */
  main?: boolean;
  /** Half a row on a phone, next to the other half (two short fields side by side). */
  half?: boolean;
}

/** A number field. Money is in cents, a rate in 1/10,000 of a point, a count is whole. */
export interface NumberSpec extends FieldBase {
  kind: 'money' | 'rate' | 'int';
  min: number;
  max: number;
  /** The value cannot pass another field's value (a key) or a limit worked out from the values (a balloon month and the term). */
  atMost?: string | ((values: Values) => number);
  /** A typed rate starts with an example and wears the "example" tag (never "today's rate"). */
  example?: boolean;
  negative?: boolean;
}

/** A down payment in dollars or in percent of the price: one field, a unit menu, two state keys. */
export interface DownSpec extends FieldBase {
  kind: 'down';
  /** The state key of the percent (rate units) and of the unit ('amount' | 'percent'). */
  percentKey: string;
  unitKey: string;
  /** The price it cannot pass. */
  of: string;
  max: number;
}

/** A choice: the segmented rail (OptionGroup) for 2 to 4, or a <select>. */
export interface ChoiceSpec extends FieldBase {
  kind: 'choice' | 'select';
  options: readonly string[];
}

/** A list of up to `max` rows of number fields (the debts). Each row's keys are prefixed in the link: d0b, d0a… */
export interface ListSpec extends FieldBase {
  kind: 'list';
  min: number;
  max: number;
  item: NumberSpec[];
  /** A new row starts with these values. */
  blank: Record<string, number>;
}

export type FieldSpec = NumberSpec | DownSpec | ChoiceSpec | ListSpec;

/** A piece of the result sentence: plain text, or a number in bold. */
export type Part = string | { b: string };

export interface Scenario {
  name: string;
  rows: [label: string, value: string][];
}

/** A cell of the schedule: money (cents), or plain text. The CSV writes cents as 1896.20. */
export type Cell = { cents: number } | { text: string };

export interface Table {
  caption: string;
  head: string[];
  rows: Cell[][];
  /** Rows grouped by loan year: the year rows are buttons, the first year starts open. */
  groups?: { label: string; end: Cell; from: number; to: number }[];
}

/** What the result looks like for one set of values (CalcDef.view). */
export interface CalcView {
  hero: { label: string; value: string; unit?: string; sentence: Part[] };
  /** The account cannot be done (a payment that does not cover the interest): said in the hero. */
  problem?: string;
  /** The one number the Oli's placard shows. */
  placard: { n: string; l: string };
  /** Principal against interest, or deposits against interest (cents). */
  split?: { a: { label: string; cents: number }; b: { label: string; cents: number } };
  compare?: { a: Scenario; b: Scenario; diff: Part[] };
  /** The schedule, built only when the person opens it or exports. */
  table: () => Table;
  /** The results, for the PDF. */
  summary: [label: string, value: string][];
  /** The assumptions in force, for the PDF. */
  premises: string[];
}

export interface FieldTexts {
  label: string;
  help?: string;
  /** The range in words, shown for any value outside it: "Enter a rate from 0 to 40%." */
  error: string;
  /** Shown when the value passes the field it depends on: "Can't be more than the home price." */
  over?: string;
  prefix?: string;
  suffix?: string;
}

/** The panel texts of one calculator (in its src/tools/<slug>/i18n/<lang>.ts, under `panel`). */
export interface CalcPanelTexts {
  fields: Record<string, FieldTexts>;
  /** Labels of the choices, by field key and option. */
  options?: Record<string, Record<string, string>>;
  /** Heading of the fields that come after the result on a phone. */
  moreHeading?: string;
  /** Strings the definition's view fills in ({placeholders}). */
  view: Record<string, string>;
  /** Premises in force, for the PDF. */
  premises: string[];
}

/** Texts every calculator island shares (src/tools/calc/i18n/<lang>.ts). */
export interface CalcSharedTexts {
  example: string;
  pdf: string;
  csv: string;
  copyLink: string;
  copied: string;
  copyThis: string;
  /** The PDF maker did not load (offline, or an update replaced it): reload the page. */
  exportFailed: string;
  /** Shown while a field is wrong: the result stays the last one that worked. */
  stale: string;
  /** Added to a field's error when what is typed is not a number of the page's language: how it writes decimals. */
  decimalHint: string;
  nextLabel: string;
  scheduleHeading: string;
  showSchedule: string;
  hideSchedule: string;
  /** "Year {n}" (a loan year, never a calendar year) and "{n}" for a payment number. */
  year: string;
  /** Column heads of a loan schedule. */
  columns: { number: string; payment: string; principal: string; interest: string; balance: string };
  /** "3 years 4 months": the parts and how they join. */
  duration: { year: string; years: string; month: string; months: string; join: string; none: string };
  addRow: string;
  removeRow: string;
  row: string;
  unitLabel: string;
  units: { amount: string; percent: string };
  pdfLabels: { inputs: string; results: string; premises: string; schedule: string; notice: string; site: string; page: string };
}

/** A next-step chip: a link to another calculator that exists. */
export interface CalcChip {
  href: string;
  name: string;
  target: MoneyPageId;
  /** Inner markup of the icon, read at build. */
  icon: string;
}

/** Everything the page writes into data-props (DECISOES § 23: the island hydrates from what the server rendered). */
export interface CalcPanelData {
  lang: Lang;
  page: MoneyPageId;
  /** The calculator's name (PDF title). */
  name: string;
  t: CalcSharedTexts;
  texts: CalcPanelTexts;
  /** Values the page fills in (a guide's example); the calculator's own example otherwise. */
  initial?: Values;
  /** Read the #v=1 link once after hydration (calculator pages); a guide fills the form from its props only. */
  readLink: boolean;
  /** The page the copied link opens (the calculator itself, also from a guide). */
  linkPath: string;
  /** The page's own disclaimer, for the PDF. */
  notice: string;
  /** Base name of the exports (registry `file`). */
  file: string;
  chips: CalcChip[];
  /** Icons the island draws, read at build: pdf, table, link, check, info, chevron, alert, trash, arrow. */
  icons: Record<'pdf' | 'table' | 'link' | 'check' | 'info' | 'chevron' | 'alert' | 'trash' | 'arrow', string>;
}

/** The behaviour of one calculator (never serialised). */
export interface CalcDef<I = unknown, R = unknown> {
  id: MoneyPageId;
  fields: FieldSpec[];
  /** The example the page starts with: `toInput(initial)` is the page-example case of the oracle. */
  initial: Values;
  toInput(values: Values): I;
  compute(input: I): R;
  view(result: R, values: Values, t: CalcPanelTexts, shared: CalcSharedTexts, lang: Lang): CalcView;
}

/** A source the page cites: an official page, read on the date given (gate:dinheiro-saude). */
export interface SourceLink {
  label: string;
  href: string;
}

/**
 * The texts of a calculator or preset page (src/tools/<slug>/i18n/<lang>.ts): the mold of the plan's
 * calculator page, the YMYL blocks of "Confiança em dinheiro e saúde" and the content blocks of
 * gate:conteudo (how-to in three steps or more, four real questions or more, the privacy note).
 */
export interface CalcPageTexts {
  /** <title> without " | FileOrca": the calculator's name first, in Title Case. */
  title: string;
  description: string;
  /** The calculator's name, sentence case. */
  h1: string;
  /** One line: the question the page answers. */
  lead: string;
  panel: CalcPanelTexts;
  howHeading: string;
  howSteps: string[];
  worksHeading: string;
  formulaHeading: string;
  /** The formula in words (paragraphs). */
  formula: string[];
  premisesHeading: string;
  exampleHeading: string;
  /** One line before the worked example (inputs and results from the engine at build). */
  exampleIntro: string;
  sourcesHeading: string;
  /** "Read on {date}." after each source. */
  sources: SourceLink[];
  disclaimer: string;
  /** Blocks of a preset that neither its parent nor its siblings have (Regra da página programática). */
  own?: { heading: string; paragraphs: string[] }[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  privacyHeading: string;
  privacyNote: string;
  relatedHeading: string;
  /** Parent calculators only: the table of their presets. */
  presets?: { heading: string; caption: string; head: [string, string] };
}
