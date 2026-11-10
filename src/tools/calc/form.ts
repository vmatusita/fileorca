// The form side of a calculator: which fields show, whether the values make an account, and the
// scenario link. The link keeps the numbers after the # (the part the browser never sends): the page
// reads it once, after hydration, and never writes to the URL (no pushState, no replaceState, no
// location.hash =); the Copy link button only builds the text (DECISOES § 114).
import { formatScaled, parseScaled, readNumber as readTyped, scaledOf, type NumberLang } from '../../calc/parse.ts';
import { dayOf } from '../../calc/dates.ts';
import { fmt } from '../../i18n/format.ts';
import type { CalcSharedTexts, DateSpec, FieldSpec, ListSpec, NumberSpec, Values } from './types.ts';

export const LINK_VERSION = '1';

/**
 * How long a field waits, after the last key, before a value out of its range shows the error, its alert and the stale
 * result: typing 425,000 in a field that starts at 10,000 passed through 4, 42, 425 and 4,250, and each one was announced
 * as an error (review F4-F7 d-4; DECISOES § 305). A valid value reaches the account at once; leaving the field shows the
 * error at once.
 */
export const SETTLE_MS = 800;

/** Decimals a number field keeps: cents for money, four for a rate (1/10,000 of a point), none for a count. */
export const DECIMALS: Record<'money' | 'rate' | 'int', number> = { money: 2, rate: 4, int: 0 };

/** The decimals of a field: those of its kind, or the measure's own (F7: a length in hundredths of a foot). */
export function decimalsOf(kind: NumberSpec['kind'], decimals?: number): number {
  return kind === 'dec' ? (decimals ?? 0) : DECIMALS[kind];
}

export function visible(spec: FieldSpec, values: Values): boolean {
  return !spec.when || values[spec.when.key] === spec.when.is;
}

/** The value as the field shows it once the person leaves it: 300,000 or 1,234.50; 6.5; 30; a measure as 12.5. */
export function display(kind: NumberSpec['kind'], value: number, lang: NumberLang, decimals?: number): string {
  if (kind === 'money') return formatScaled(value, 2, lang, { min: value % 100 === 0 ? 0 : 2 });
  return formatScaled(value, decimalsOf(kind, decimals), lang);
}

/** A day the date field may hold: a real day of the calendar between the field's two fixed days (F7). */
export function dayInRange(spec: Pick<DateSpec, 'min' | 'max'>, iso: string): boolean {
  return dayOf(iso) !== null && iso >= spec.min && iso <= spec.max;
}

export function inRange(spec: { min: number; max: number }, value: number): boolean {
  return Number.isSafeInteger(value) && value >= spec.min && value <= spec.max;
}

/** The three texts of the decimals message (F16, item 2; DECISOES § 684). */
export type DecimalsTexts = Pick<CalcSharedTexts, 'decimalsMany' | 'decimalsOne' | 'decimalsNone'>;

/** The decimals message of a field that keeps `n` decimals: "Use up to 2 decimal places.", "…1 decimal place.", "Use a whole number." */
export function decimalsMessage(texts: DecimalsTexts, n: number): string {
  if (n === 0) return texts.decimalsNone;
  return n === 1 ? texts.decimalsOne : fmt(texts.decimalsMany, { n });
}

/** What a number field needs to say about a text: its kind and decimals, its fixed range and whether it takes a minus. */
export interface FieldRule {
  kind: NumberSpec['kind'];
  decimals?: number | undefined;
  min: number;
  max: number;
  negative?: boolean | undefined;
}

/** The words of one field: its range, how the page writes decimals (the hint) and the decimals message. */
export interface FieldTexts extends DecimalsTexts {
  error: string;
  hint?: string | undefined;
}

/**
 * The message of a text typed in a number field (F16, items 1 and 2; DECISOES § 683 and § 684):
 * - none when it reads and is in the range;
 * - the range alone when it reads and is out of the range ("99" in a rate);
 * - the decimals message when it is a number of the language with more decimals than the field keeps and the value with those
 *   decimals cut off is in the range, with no range and no hint ("6.55555" in a rate, "30.5" in a term);
 * - else the range, and in a field that has decimals the hint of how the page writes them when the text ends in a thousands
 *   separator and one or two digits ("6,5" in English) or reads with the two separators swapped ("1.234,56" in English,
 *   "375.000" in an English price; DECISOES § 251 and § 254).
 */
export function fieldMessage(text: string, lang: NumberLang, field: FieldRule, texts: FieldTexts): string | undefined {
  const places = decimalsOf(field.kind, field.decimals);
  const negative = field.negative === true;
  const typed = readTyped(text, lang, negative);
  const value = typeof typed === 'string' ? null : scaledOf(typed, places);
  if (value !== null) return inRange(field, value) ? undefined : texts.error;
  if (typeof typed !== 'string' && typed.fraction.length > places) {
    const cut = scaledOf({ ...typed, fraction: typed.fraction.slice(0, places) }, places);
    if (cut !== null && inRange(field, cut)) return decimalsMessage(texts, places);
  }
  if (texts.hint === undefined || places === 0) return texts.error;
  const swapped = text.replace(/[.,]/g, (mark) => (mark === '.' ? ',' : '.'));
  return typed === 'separator' || parseScaled(swapped, lang, places, negative) !== null ? `${texts.error} ${texts.hint}` : texts.error;
}

/** A field whose value passes the one it depends on: key → the problem ('over'). */
export type Problems = Record<string, 'over'>;

/** The cross-field problems of the visible fields (each field's own range is checked as the person types). */
export function problems(specs: readonly FieldSpec[], values: Values): Problems {
  const out: Problems = {};
  for (const spec of specs) {
    if (!visible(spec, values)) continue;
    if (spec.kind === 'down' && values[spec.unitKey] === 'amount' && Number(values[spec.key]) > Number(values[spec.of])) out[spec.key] = 'over';
    if ((spec.kind === 'money' || spec.kind === 'int' || spec.kind === 'rate' || spec.kind === 'dec') && spec.atMost !== undefined) {
      const limit = typeof spec.atMost === 'string' ? Number(values[spec.atMost]) : spec.atMost(values);
      if (Number(values[spec.key]) > limit) out[spec.key] = 'over';
    }
  }
  return out;
}

/** The text after the # for these values: #v=1&p=37500000&r=65000… (engine units, never formatted). */
export function linkHash(specs: readonly FieldSpec[], values: Values): string {
  const params: [string, string][] = [['v', LINK_VERSION]];
  for (const spec of specs) {
    if (spec.kind === 'list') {
      const rows = values[spec.key] as Record<string, number>[];
      rows.forEach((row, index) => {
        if (spec.pick) params.push([`${spec.key}${index}${spec.pick.key}`, String(row[spec.pick.key])]);
        for (const item of spec.item) params.push([`${spec.key}${index}${item.key}`, String(row[item.key])]);
      });
    } else if (spec.kind === 'down') {
      params.push([spec.unitKey, String(values[spec.unitKey])], [spec.key, String(values[spec.key])], [spec.percentKey, String(values[spec.percentKey])]);
    } else params.push([spec.key, String(values[spec.key])]);
  }
  return `#${params.map(([key, value]) => `${key}=${value}`).join('&')}`;
}

const WHOLE = /^-?\d{1,15}$/;

function readNumber(params: URLSearchParams, key: string, spec: { min: number; max: number }): number | undefined {
  const text = params.get(key);
  if (text === null || !WHOLE.test(text)) return undefined;
  const value = Number(text);
  return inRange(spec, value) ? value : undefined;
}

function readList(params: URLSearchParams, spec: ListSpec): Record<string, number>[] | undefined {
  const rows: Record<string, number>[] = [];
  for (let index = 0; index < spec.max; index += 1) {
    const row: Record<string, number> = {};
    if (spec.pick) {
      const option = readNumber(params, `${spec.key}${index}${spec.pick.key}`, { min: 0, max: spec.pick.options.length - 1 });
      if (option === undefined) break;
      row[spec.pick.key] = option;
    }
    for (const item of spec.item) {
      const value = readNumber(params, `${spec.key}${index}${item.key}`, item);
      if (value === undefined) break;
      row[item.key] = value;
    }
    if (Object.keys(row).length !== spec.item.length + (spec.pick ? 1 : 0)) break;
    rows.push(row);
  }
  return rows.length >= spec.min ? rows : undefined;
}

/**
 * The values a #v=1 link carries, over `base`. Every value goes through its field's range and anything
 * outside it, unknown or malformed is ignored without a word, keeping the base value.
 */
export function readLink(hash: string, specs: readonly FieldSpec[], base: Values): Values {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('v') !== LINK_VERSION) return base;
  const out: Values = { ...base };
  for (const spec of specs) {
    if (spec.kind === 'list') {
      const rows = readList(params, spec);
      if (rows) out[spec.key] = rows;
    } else if (spec.kind === 'choice' || spec.kind === 'select') {
      const value = params.get(spec.key);
      if (value !== null && spec.options.includes(value)) out[spec.key] = value;
    } else if (spec.kind === 'down') {
      const unit = params.get(spec.unitKey);
      if (unit === 'amount' || unit === 'percent') out[spec.unitKey] = unit;
      const cents = readNumber(params, spec.key, { min: 0, max: spec.max });
      if (cents !== undefined) out[spec.key] = cents;
      const rate = readNumber(params, spec.percentKey, { min: 0, max: 1_000_000 });
      if (rate !== undefined) out[spec.percentKey] = rate;
    } else if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int' || spec.kind === 'dec') {
      const value = readNumber(params, spec.key, spec);
      if (value !== undefined) out[spec.key] = value;
    } else if (spec.kind === 'date') {
      const value = params.get(spec.key);
      if (value !== null && dayInRange(spec, value)) out[spec.key] = value;
    }
  }
  // A pair the link broke (a down payment above the price) falls back to the base values of both.
  return Object.keys(problems(specs, out)).length > 0 ? base : out;
}
