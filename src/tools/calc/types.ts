// What the calculator island is made of (DECISOES § 110): one island for every calculator (money since the F4, home and
// health since the F7, § 257), as § 69 did for the image tools. A calculator declares its fields and its account in a definition
// (src/tools/calc/defs/<id>.ts); the page writes the plain data of the island into data-props
// (CalcPanelData), and the texts arrive there too, so the browser never loads a text file.
import type { Lang } from '../../i18n/routes.ts';
import type { AnyCalcId } from './registry.ts';

/** A value of the form: a number in engine units, a choice or a day ("2026-03-17"), or a list of rows (the debts, the areas). */
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
  /** Below 360 px a half field whose label and tag do not fit half a row takes the whole row (F13b, F7 obs 3; § 550). */
  wide?: boolean;
}

/**
 * A number field. Money is in cents, a rate in 1/10,000 of a point, a count is whole; a measure ('dec', F7) is a whole
 * number of 10^-decimals of its unit (a length in hundredths of a foot, a weight in tenths of a pound).
 */
export interface NumberSpec extends FieldBase {
  kind: 'money' | 'rate' | 'int' | 'dec';
  /** The decimals of a measure ('dec' only). */
  decimals?: number;
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
  /**
   * A menu each row has before its numbers (the shape of an area, F7), kept in the row as the index of its option. The
   * label of an item may depend on it ("x-circle" before "x" in the texts), and `hide` says the options that hide an item.
   */
  pick?: { key: string; options: readonly string[]; hide?: Record<string, readonly number[]> };
  /** The Add button comes with the fields after the result, so a phone keeps the result above the fold (F7, DECISOES § 268). */
  addBelow?: boolean;
}

/**
 * A day of the calendar (F7: the first day of the last period, a conception or a transfer), from the browser's own date
 * field, as "2026-03-17", between two fixed days. Never a Date with a time zone: the engine counts whole days.
 */
export interface DateSpec extends FieldBase {
  kind: 'date';
  min: string;
  max: string;
}

export type FieldSpec = NumberSpec | DownSpec | ChoiceSpec | ListSpec | DateSpec;

/** A piece of the result sentence: plain text, or a number in bold. */
export type Part = string | { b: string };

export interface Scenario {
  name: string;
  rows: [label: string, value: string][];
}

/** What a CSV column holds (F16, item 5; DECISOES § 687): numbers (no grouping, ASCII minus, a % glued to its number), days (YYYY-MM-DD) or text. */
export type CsvKind = 'number' | 'date' | 'text';

/** One value a cell writes in the CSV: a number at a scale, money, a day, a text, or nothing (an empty cell). */
export type CsvValue = { scaled: number; decimals: number; percent?: boolean } | { cents: number } | { day: string } | { text: string } | null;

/**
 * A cell of the schedule: money (cents), a measure (a whole number of 10^-decimals, F7), or plain text. The CSV writes cents
 * as 1896.20 and a measure with its decimals, never with a thousands separator. A text cell may say what it writes in the CSV
 * (`csv`, one value per CSV column it spans): the screen and the PDF read `text` (or `short`), the CSV reads `csv` (F16).
 */
export type Cell = { cents: number } | { text: string; short?: string; csv?: readonly CsvValue[] } | { scaled: number; decimals: number };

export interface Table {
  caption: string;
  head: string[];
  rows: Cell[][];
  /** Rows grouped by loan year: the year rows are buttons, the first year starts open. */
  groups?: { label: string; end: Cell; from: number; to: number }[];
  /** Fixed columns, the first at 30 % (the dates of the ovulation; F13b, F7 obs 2). */
  even?: boolean;
  /** The column of the balance, where a year row shows the balance at its end; the last one when not given (DECISOES § 256). */
  endColumn?: number;
  /**
   * The columns of the CSV after the year of a grouped table (F16, item 5; DECISOES § 687): the header of each, with its unit
   * ("Area (sq ft)"), and the kind of what it holds. A text cell with `csv` writes its values in that many columns; every
   * other cell writes one.
   */
  csv?: readonly { head: string; kind: CsvKind }[];
}

/** What the result looks like for one set of values (CalcDef.view). */
export interface CalcView {
  hero: { label: string; value: string; unit?: string; sentence: Part[] };
  /** The account cannot be done (a payment that does not cover the interest): said in the hero. */
  problem?: string;
  /**
   * The field the problem points to, by its key (the payment that does not cover the interest): it is marked like a field
   * out of its range, with aria-invalid and the card's message in its description (F4 ACE-11; F13b, DECISOES § 545).
   */
  problemField?: string;
  /** The one number the Oli's placard shows. */
  placard: { n: string; l: string };
  /** The rows of the table are the result itself (the areas, the cycles, the dates): shown open, with no Show button (F7). */
  open?: boolean;
  /** Principal against interest, or deposits against interest (cents). */
  split?: { a: { label: string; cents: number }; b: { label: string; cents: number } };
  /** The other system in the card, under the Download (the SAC × PRICE: "Na PRICE: R$ 4.534,12 por mês"; F13b, DECISOES § 549). */
  versus?: Part[];
  /**
   * Two bars on one scale, in place of the split (the SplitChart, pair variant; the SAC × PRICE): the same principal and the
   * interest of each system. `name` is the name of the chart, `interest` the line of its legend for the interest.
   */
  pair?: { name: string; principal: { label: string; cents: number }; interest: Part[]; rows: { name: string; cents: number }[] };
  compare?: { a: Scenario; b: Scenario; diff: Part[] };
  /** The total of the fields of the block that folds (CalcDef.disclose), said in its title: "$500.00 a month in your payment". */
  more?: string;
  /** Under the name of the schedule's block: "360 payments, by loan year" (the mortgage and the SAC × PRICE; F13b, § 548). */
  scheduleMeta?: string;
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
  /** Said to a screen reader only, as the field's description, when the short label leaves out a word (F13b, Idiomas R2-03). */
  desc?: string;
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
  /** Title of the block that folds (CalcDef.disclose), when it is not the moreHeading (F13b, DECISOES § 547). */
  disclose?: string;
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
  /** The same, offline, when the PDF maker was never kept (F8; DECISOES § 292): it needs the internet once. */
  exportOffline: string;
  /** Shown while a field is wrong: the result stays the last one that worked. */
  stale: string;
  /** In the card while a field is wrong (F13b): the field and its value in the last result, "Last result that worked: Rate 6.5%." */
  lastWorked: string;
  /** Added to a field's error when what is typed is not a number of the page's language: how it writes decimals. */
  decimalHint: string;
  /**
   * The message of a number written right that has more decimals than its field keeps (F16, item 2; DECISOES § 684): with the
   * {n} of the field (two or more), with one, and with none. It replaces the range and the hint while the value with the extra
   * decimals cut off is in the range.
   */
  decimalsMany: string;
  decimalsOne: string;
  decimalsNone: string;
  /** The CSV's own words (F16, item 5; DECISOES § 687): the column of the units of a column that mixes them, and the two ends of a range ("{label} (from)"). */
  csvUnit: string;
  csvFrom: string;
  csvTo: string;
  nextLabel: string;
  scheduleHeading: string;
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
  target: AnyCalcId;
  /** Inner markup of the icon, read at build. */
  icon: string;
}

/** Everything the page writes into data-props (DECISOES § 23: the island hydrates from what the server rendered). */
export interface CalcPanelData {
  lang: Lang;
  page: AnyCalcId;
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
  /** The Oli may cheer the first result (never on a health page, F7). */
  cheer: boolean;
  /** The colour of the chips: the money category or the home and health one (violet fill, F7). */
  cat: 'money' | 'home';
  /** Icons the island draws, read at build: pdf, table, link, check, info, chevron, down (the chevron of a block), alert, trash, arrow. */
  icons: Record<'pdf' | 'table' | 'link' | 'check' | 'info' | 'chevron' | 'down' | 'alert' | 'trash' | 'arrow', string>;
}

/** The behaviour of one calculator (never serialised). */
export interface CalcDef<I = unknown, R = unknown> {
  id: AnyCalcId;
  fields: FieldSpec[];
  /**
   * The fields that fold into a block after the result, closed when the page opens, with their total in its title (the
   * taxes, insurance and fees of the mortgage and its presets, the TR of the SAC × PRICE; F13b, DECISOES § 547). Their
   * boxes are in the page only while the block is open.
   */
  disclose?: readonly string[];
  /**
   * The view texts of the problems the account may say in the card, in the place of the Download (the payment that does not
   * cover the interest, the doors and windows larger than the walls): the room of the Download keeps the longest of them
   * and of the fields' messages from the first paint, so the card never grows on an error (review F13b a-1; DECISOES § 595).
   */
  problems?: readonly string[];
  /** The example the page starts with: `toInput(initial)` is the page-example case of the oracle. */
  initial: Values;
  /**
   * The account needs today's date (the weeks of a pregnancy, F7): `initial.today` is the example's day, and the island
   * puts the device's local day there once, after hydration (never from the link, never written to it).
   */
  today?: boolean;
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
