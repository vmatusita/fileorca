// What the definitions share: the sentence of a result from a text template, the field specs that several
// calculators use (price, down payment, rate, term, the monthly costs of a home) with their fixed ranges
// (DECISOES § 116), and the down payment as the engine takes it.
import type { Down } from '../../../calc/loans.ts';
import type { FieldSpec, NumberSpec, Part, Values } from '../types.ts';

/** A template's {placeholders} as bold parts: say('You pay {total}.', { total: '$9' }) → ['You pay ', { b: '$9' }, '.']. */
export function say(template: string, values: Record<string, string>): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const match of template.matchAll(/\{(\w+)\}/g)) {
    const key = match[1] ?? '';
    if (!(key in values)) continue;
    if (match.index > last) parts.push(template.slice(last, match.index));
    parts.push({ b: values[key] ?? '' });
    last = match.index + match[0].length;
  }
  if (last < template.length) parts.push(template.slice(last));
  return parts;
}

/** The view text of a key, or an error that names it (a test renders every view, so a missing text fails there). */
export function text(view: Record<string, string>, key: string): string {
  const value = view[key];
  if (value === undefined) throw new Error(`missing view text ${key}`);
  return value;
}

const DOLLAR = 100;
export const RATE_PCT = 10_000;

export const money = (key: string, minDollars: number, maxDollars: number, extra: Partial<NumberSpec> = {}): NumberSpec => ({
  kind: 'money',
  key,
  min: minDollars * DOLLAR,
  max: maxDollars * DOLLAR,
  ...extra,
});

export const rate = (key: string, minPct: number, maxPct: number, extra: Partial<NumberSpec> = {}): NumberSpec => ({
  kind: 'rate',
  key,
  min: minPct * RATE_PCT,
  max: maxPct * RATE_PCT,
  ...extra,
});

export const count = (key: string, min: number, max: number, extra: Partial<NumberSpec> = {}): NumberSpec => ({ kind: 'int', key, min, max, ...extra });

/** The fields of a home loan, in the mortgage pages' order: price, down payment, rate, term, then the monthly costs. */
export function homeFields(): FieldSpec[] {
  return [
    money('p', 10_000, 20_000_000, { main: true }),
    { kind: 'down', key: 'd', percentKey: 'dp', unitKey: 'du', of: 'p', max: 2_000_000_000, main: true },
    rate('r', 0, 40, { main: true, half: true, example: true }),
    count('t', 1, 40, { main: true, half: true }),
    money('tx', 0, 1_000_000, { half: true }),
    money('in', 0, 100_000, { half: true }),
    money('pmi', 0, 10_000, { half: true }),
    money('hoa', 0, 10_000, { half: true }),
  ];
}

/** The example home of the mortgage pages (the design system's: $375,000 with 20% down, $300,000 at 6.5% for 30 years). */
export const HOME_EXAMPLE: Values = { p: 37_500_000, du: 'percent', d: 7_500_000, dp: 200_000, r: 65_000, t: 30, tx: 450_000, in: 150_000, pmi: 0, hoa: 0 };

export function downOf(values: Values): Down {
  return values['du'] === 'percent' ? { kind: 'percent', rate: Number(values['dp']) } : { kind: 'amount', cents: Number(values['d']) };
}

export const num = (values: Values, key: string): number => Number(values[key]);
