// Helpers the calculator definitions share to say a result: the schedule of a loan grouped by loan year,
// a number of months as "3 years 4 months", the inputs as the PDF lists them, and the cells as the screen
// writes them. The schedule runs by payment number and loan year, never by calendar date (prompt F4).
import { fmt } from '../../i18n/format.ts';
import { formatScaled, money, ratePercent, type NumberLang } from '../../calc/parse.ts';
import { longDate } from '../../i18n/dates.ts';
import type { Row } from '../../calc/money.ts';
import { display, visible } from './form.ts';
import type { CalcPanelData, CalcSharedTexts, Cell, FieldSpec, Table, Values } from './types.ts';

/** A cell as the screen and the PDF write it: money with cents, a measure with its decimals (F7), or the text. */
export const cellText =
  (lang: NumberLang) =>
  (cell: Cell): string =>
    'cents' in cell ? money(cell.cents, lang) : 'scaled' in cell ? formatScaled(cell.scaled, cell.decimals, lang, { min: cell.decimals }) : cell.text;

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

/** A number field's value as the PDF lists it: money with cents, a rate, a count or a measure with its unit. */
function valueText(kind: 'money' | 'rate' | 'int' | 'dec', value: number, lang: NumberLang, suffix?: string, decimals?: number): string {
  if (kind === 'money') return money(value, lang);
  if (kind === 'rate') return ratePercent(value, lang);
  const number = display(kind, value, lang, decimals);
  // A percent sticks to its number (10%); any other unit follows a space (12.5 ft).
  return suffix ? (suffix === '%' ? `${number}%` : `${number} ${suffix}`) : number;
}

/**
 * The value of one field as the PDF lists it, by its key in the link (a row's field as "d0b"): what "Last result that worked:
 * Rate 6.5%." says of the field in error (F13b; DECISOES § 545). Null for a field the values do not have.
 */
export function fieldText(specs: readonly FieldSpec[], values: Values, keyName: string, data: CalcPanelData): string | null {
  const lang = data.lang as NumberLang;
  for (const spec of specs) {
    if (spec.kind === 'list') {
      const match = new RegExp(`^${spec.key}(\\d+)(\\w+)$`).exec(keyName);
      const row = match ? (values[spec.key] as Record<string, number>[] | undefined)?.[Number(match[1])] : undefined;
      const item = match ? spec.item.find((entry) => entry.key === match[2]) : undefined;
      if (row && item) return valueText(item.kind, row[item.key] ?? 0, lang, data.texts.fields[item.key]?.suffix, item.decimals);
      continue;
    }
    if (spec.key !== keyName) continue;
    if (spec.kind === 'down') return values[spec.unitKey] === 'percent' ? ratePercent(Number(values[spec.percentKey]), lang) : money(Number(values[spec.key]), lang);
    if (spec.kind === 'date') return longDate(String(values[spec.key]), data.lang);
    if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec') return valueText(spec.kind, Number(values[spec.key]), lang, data.texts.fields[spec.key]?.suffix, spec.decimals);
    return data.texts.options?.[spec.key]?.[String(values[spec.key])] ?? String(values[spec.key]);
  }
  return null;
}

/**
 * Every number of a text as wide as its digits may draw (review F13b a-1; DECISOES § 595): each digit as a "0", the widest
 * one of Figtree (10.9 px at 17 px, wider than any bold digit but the bold 0, 11.0), and `more` digits more, with the grouping
 * of the language. widen("$2,396.20", 'en') → "$0,000.00"; widen("R$ 284.596", 'pt', 1) → "R$ 0.000.000". Only for the room
 * the card keeps (a reserve drawn hidden), never for a text that is read.
 */
export function widen(text: string, lang: NumberLang, more = 0): string {
  const point = lang === 'pt' ? ',' : '.';
  const group = lang === 'pt' ? '.' : ',';
  return text.replace(/\d(?:[\d.,]*\d)?/g, (run) => {
    const at = run.lastIndexOf(point);
    const whole = (at >= 0 ? run.slice(0, at) : run).replace(/\D/g, '');
    const part = at >= 0 ? run.slice(at + 1).replace(/\d/g, '0') : '';
    const grouped = '0'.repeat(whole.length + more).replace(/\B(?=(\d{3})+(?!\d))/g, group);
    return at >= 0 ? `${grouped}${point}${part}` : grouped;
  });
}

/** A rough width of a line of the sentence at 17 px, to pick the longest of several (the 0, a capital, a letter, a space). */
export function lineWidth(text: string): number {
  let width = 0;
  for (const char of text) width += /\d/.test(char) ? 10.9 : /[A-ZÀ-Ý]/.test(char) ? 12 : /[a-zß-ÿ]/.test(char) ? 8.4 : char === ' ' ? 4.2 : /[.,;:]/.test(char) ? 3.8 : 9;
  return width;
}

/** A text of a list (a row's name): the calculator's own ("Area {n}", F7), else the shared one ("Debt {n}"). */
const rowName = (data: CalcPanelData): string => data.texts.view['row'] ?? data.t.row;

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
      const pick = spec.pick;
      rows.forEach((row, index) => {
        const at = pick ? (row[pick.key] ?? 0) : 0;
        const items = spec.item.filter((item) => !pick?.hide?.[item.key]?.includes(at));
        const parts = items.map((item) => valueText(item.kind, row[item.key] ?? 0, lang, data.texts.fields[item.key]?.suffix, item.decimals));
        const option = pick ? (pick.options[at] ?? '') : '';
        const value = pick ? `${data.texts.options?.[pick.key]?.[option] ?? option}: ${parts.join(' × ')}` : parts.join(', ');
        out.push([fmt(rowName(data), { n: index + 1 }), value]);
      });
    } else if (spec.kind === 'down') {
      const percent = values[spec.unitKey] === 'percent';
      out.push([label, percent ? ratePercent(Number(values[spec.percentKey]), lang) : money(Number(values[spec.key]), lang)]);
    } else if (spec.kind === 'choice' || spec.kind === 'select') {
      const value = String(values[spec.key]);
      out.push([label, data.texts.options?.[spec.key]?.[value] ?? value]);
    } else if (spec.kind === 'date') out.push([label, longDate(String(values[spec.key]), data.lang)]);
    else out.push([label, valueText(spec.kind, Number(values[spec.key]), lang, texts?.suffix, 'decimals' in spec ? spec.decimals : undefined)]);
  }
  return out;
}
