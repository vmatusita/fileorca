// The form side of a calculator: which fields show, whether the values make an account, and the
// scenario link. The link keeps the numbers after the # (the part the browser never sends): the page
// reads it once, after hydration, and never writes to the URL (no pushState, no replaceState, no
// location.hash =); the Copy link button only builds the text (DECISOES § 114).
import { formatScaled, type NumberLang } from '../../calc/parse.ts';
import type { FieldSpec, ListSpec, NumberSpec, Values } from './types.ts';

export const LINK_VERSION = '1';

/** Decimals a number field keeps: cents for money, four for a rate (1/10,000 of a point), none for a count. */
export const DECIMALS: Record<NumberSpec['kind'], number> = { money: 2, rate: 4, int: 0 };

export function visible(spec: FieldSpec, values: Values): boolean {
  return !spec.when || values[spec.when.key] === spec.when.is;
}

/** The value as the field shows it once the person leaves it: 300,000 or 1,234.50; 6.5; 30. */
export function display(kind: NumberSpec['kind'], value: number, lang: NumberLang): string {
  if (kind === 'money') return formatScaled(value, 2, lang, { min: value % 100 === 0 ? 0 : 2 });
  return formatScaled(value, DECIMALS[kind], lang);
}

export function inRange(spec: { min: number; max: number }, value: number): boolean {
  return Number.isSafeInteger(value) && value >= spec.min && value <= spec.max;
}

/** A field whose value passes the one it depends on: key → the problem ('over'). */
export type Problems = Record<string, 'over'>;

/** The cross-field problems of the visible fields (each field's own range is checked as the person types). */
export function problems(specs: readonly FieldSpec[], values: Values): Problems {
  const out: Problems = {};
  for (const spec of specs) {
    if (!visible(spec, values)) continue;
    if (spec.kind === 'down' && values[spec.unitKey] === 'amount' && Number(values[spec.key]) > Number(values[spec.of])) out[spec.key] = 'over';
    if ((spec.kind === 'money' || spec.kind === 'int' || spec.kind === 'rate') && spec.atMost !== undefined) {
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
    for (const item of spec.item) {
      const value = readNumber(params, `${spec.key}${index}${item.key}`, item);
      if (value === undefined) break;
      row[item.key] = value;
    }
    if (Object.keys(row).length !== spec.item.length) break;
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
    } else if (spec.kind === 'money' || spec.kind === 'rate' || spec.kind === 'int') {
      const value = readNumber(params, spec.key, spec);
      if (value !== undefined) out[spec.key] = value;
    }
  }
  // A pair the link broke (a down payment above the price) falls back to the base values of both.
  return Object.keys(problems(specs, out)).length > 0 ? base : out;
}
