// Helpers the calculator definitions share to say a result: the schedule of a loan grouped by loan year,
// a number of months as "3 years 4 months", the inputs as the PDF lists them, and the cells as the screen
// writes them. The schedule runs by payment number and loan year, never by calendar date (prompt F4).
import { fmt } from '../../i18n/format.ts';
import { money, ratePercent, type NumberLang } from '../../calc/parse.ts';
import type { Row } from '../../calc/money.ts';
import { display, visible } from './form.ts';
import type { CalcPanelData, CalcSharedTexts, Cell, FieldSpec, Table, Values } from './types.ts';

/** A cell as the screen and the PDF write it: money with cents. */
export const cellText =
  (lang: NumberLang) =>
  (cell: Cell): string =>
    'cents' in cell ? money(cell.cents, lang) : cell.text;

/** The schedule of a loan: one row per payment, grouped by loan year (`perYear` payments a year). */
export function loanTable(rows: readonly Row[], perYear: number, s: CalcSharedTexts, caption: string, numberHead = s.columns.number): Table {
  const groups: NonNullable<Table['groups']> = [];
  for (let from = 0, year = 1; from < rows.length; from += perYear, year += 1) {
    const to = Math.min(from + perYear, rows.length);
    groups.push({ label: fmt(s.year, { n: year }), end: { cents: rows[to - 1]![4] }, from, to });
  }
  return {
    caption,
    head: [numberHead, s.columns.payment, s.columns.principal, s.columns.interest, s.columns.balance],
    rows: rows.map((row) => [{ text: String(row[0]) }, { cents: row[1] }, { cents: row[3] }, { cents: row[2] }, { cents: row[4] }]),
    groups,
  };
}

/** Months as "3 years 4 months", "1 year", "5 months"; zero is `none`. */
export function duration(months: number, s: CalcSharedTexts): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(fmt(years === 1 ? s.duration.year : s.duration.years, { n: years }));
  if (rest) parts.push(fmt(rest === 1 ? s.duration.month : s.duration.months, { n: rest }));
  return parts.length ? parts.join(s.duration.join) : s.duration.none;
}

/** A number field's value as the PDF lists it: money with cents, a rate, a count with its unit. */
function valueText(kind: 'money' | 'rate' | 'int', value: number, lang: NumberLang, suffix?: string): string {
  if (kind === 'money') return money(value, lang);
  if (kind === 'rate') return ratePercent(value, lang);
  return suffix ? `${display('int', value, lang)} ${suffix}` : display('int', value, lang);
}

/** What the person entered, label and value, for the PDF (only the fields on screen). */
export function inputRows(specs: readonly FieldSpec[], values: Values, data: CalcPanelData): [string, string][] {
  const lang = data.lang as NumberLang;
  const out: [string, string][] = [];
  for (const spec of specs) {
    if (!visible(spec, values)) continue;
    const texts = data.texts.fields[spec.key];
    const label = texts?.label ?? spec.key;
    if (spec.kind === 'list') {
      const rows = values[spec.key] as Record<string, number>[];
      rows.forEach((row, index) => {
        const parts = spec.item.map((item) => valueText(item.kind, row[item.key] ?? 0, lang, data.texts.fields[item.key]?.suffix));
        out.push([fmt(data.t.row, { n: index + 1 }), parts.join(', ')]);
      });
    } else if (spec.kind === 'down') {
      const percent = values[spec.unitKey] === 'percent';
      out.push([label, percent ? ratePercent(Number(values[spec.percentKey]), lang) : money(Number(values[spec.key]), lang)]);
    } else if (spec.kind === 'choice' || spec.kind === 'select') {
      const value = String(values[spec.key]);
      out.push([label, data.texts.options?.[spec.key]?.[value] ?? value]);
    } else out.push([label, valueText(spec.kind, Number(values[spec.key]), lang, texts?.suffix)]);
  }
  return out;
}
