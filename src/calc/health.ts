// The health calculators (prompt F7, decision 5): BMI, calories (Mifflin-St Jeor), ovulation, body fat (the Navy
// circumference method) and the due date. For adults only; the fields refuse an age under the page's minimum before
// the engine ever runs. US and metric units: inches and pounds become centimetres and kilograms by the exact NIST
// factors (1 in = 2.54 cm, 1 lb = 0.45359237 kg). BMI and calories are exact fractions in BigInt, rounded once, half
// up; the body fat needs log10, so it runs in floating point and also returns `exact`, held within 1e-9 of the 50-digit
// oracle (scripts/oracle/calc_home_health.py). Days are whole numbers of the calendar (src/calc/dates.ts), never a
// Date with a time zone, and "today" comes in from the island.
import { dayOf, isoOf } from './dates.ts';
import { roundFloat } from './home.ts';

interface Q {
  n: bigint;
  d: bigint;
}

const q = (n: number | bigint, d: number | bigint = 1n): Q => ({ n: BigInt(n), d: BigInt(d) });
const add = (a: Q, b: Q): Q => ({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const mul = (a: Q, b: Q): Q => ({ n: a.n * b.n, d: a.d * b.d });

/** a × scale rounded half up (a >= 0). */
function round(a: Q, scale = 1): number {
  const n = a.n * BigInt(scale);
  return Number((2n * n + a.d) / (2n * a.d));
}

/** 0.45359237 kg per pound and 2.54 cm per inch, exactly. */
const KG_PER_LB = q(45_359_237n, 100_000_000n);
const CM_PER_IN = q(254n, 100n);

export type UnitSystem = 'us' | 'metric';

/** A height and a weight in both systems: the page keeps each system's own values, and `unit` says which one counts. */
export interface BodyInput {
  unit: UnitSystem;
  feet: number;
  /** Tenths of an inch. */
  inches: number;
  /** Tenths of a pound. */
  pounds: number;
  /** Tenths of a centimetre. */
  cm: number;
  /** Tenths of a kilogram. */
  kg: number;
}

/** Tenths of an inch. */
const heightTenthsIn = (input: { feet: number; inches: number }): number => input.feet * 120 + input.inches;

// --- BMI (CDC) ------------------------------------------------------------------------------------------------------

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obesity-1' | 'obesity-2' | 'obesity-3';

/** The CDC adult categories by the BMI shown (one decimal): under 18.5, 18.5 to 24.9, 25.0 to 29.9, 30.0 to 34.9, 35.0 to 39.9, 40.0 or more. */
export function bmiCategory(tenths: number): BmiCategory {
  if (tenths < 185) return 'underweight';
  if (tenths < 250) return 'healthy';
  if (tenths < 300) return 'overweight';
  if (tenths < 350) return 'obesity-1';
  if (tenths < 400) return 'obesity-2';
  return 'obesity-3';
}

export interface BmiResult {
  /** Tenths of kg/m². */
  bmi: number;
  category: BmiCategory;
}

/** CDC: 703 × pounds ÷ inches², or kilograms ÷ metres². */
export function bmi(input: BodyInput): BmiResult {
  const h = heightTenthsIn(input);
  const value = input.unit === 'us' ? q(703 * input.pounds * 10, h * h) : q(BigInt(input.kg) * 100_000n, BigInt(input.cm) * BigInt(input.cm));
  const tenths = round(value, 10);
  return { bmi: tenths, category: bmiCategory(tenths) };
}

// --- calories: Mifflin-St Jeor (1990) times the physical activity level -----------------------------------------

export interface CalorieInput extends BodyInput {
  sex: 'female' | 'male';
  age: number;
  /** Physical activity level, in hundredths (1.40 to 2.50). */
  pal: number;
}

export interface CalorieResult {
  /** Resting energy and the day's total, in kcal per day. */
  ree: number;
  tdee: number;
}

/** 10 × kg + 6.25 × cm − 5 × age + 5 (male) or − 161 (female); the day's total is that times the activity level. */
export function calorie(input: CalorieInput): CalorieResult {
  const kg = input.unit === 'us' ? mul(q(input.pounds, 10), KG_PER_LB) : q(input.kg, 10);
  const cm = input.unit === 'us' ? mul(q(heightTenthsIn(input), 10), CM_PER_IN) : q(input.cm, 10);
  const ree = add(add(mul(q(10), kg), mul(q(625, 100), cm)), q(-5 * input.age + (input.sex === 'male' ? 5 : -161)));
  return { ree: round(ree), tdee: round(mul(ree, q(input.pal, 100))) };
}

// --- ovulation (Office on Women's Health; NICHD) ------------------------------------------------------------------

export interface OvulationInput {
  /** The first day of the last period, "2026-10-19". */
  lmp: string;
  /** Days, 20 to 40. */
  cycle: number;
}

export interface Cycle {
  start: string;
  fertileStart: string;
  ovulation: string;
  nextPeriod: string;
}

export interface OvulationResult {
  cycles: Cycle[];
}

/** Six cycles from the day typed: ovulation on day (cycle − 14) of each, the five days before it and that day fertile. */
export function ovulation(input: OvulationInput): OvulationResult {
  const first = dayOf(input.lmp) ?? 0;
  const cycles: Cycle[] = [];
  for (let k = 0; k < 6; k += 1) {
    const start = first + k * input.cycle;
    const ovulates = start + input.cycle - 15;
    cycles.push({ start: isoOf(start), fertileStart: isoOf(ovulates - 5), ovulation: isoOf(ovulates), nextPeriod: isoOf(start + input.cycle) });
  }
  return { cycles };
}

// --- body fat: the Navy circumference method (Hodgdon and Beckett, 1984) ---------------------------------------

export interface BodyFatInput {
  unit: UnitSystem;
  sex: 'female' | 'male';
  feet: number;
  /** Tenths of an inch. */
  inches: number;
  /** Tenths of a centimetre. */
  cm: number;
  /** Tenths of an inch (us) or of a centimetre (metric); the man's waist is taken at the navel. */
  neck: number;
  waist: number;
  hip: number;
}

export type BodyFatResult = { percent: number; exact: number } | { error: 'domain' } | { error: 'range'; exact: number };

/**
 * In inches: men 86.010 × log10(abdomen − neck) − 70.041 × log10(height) + 36.76; women 163.205 × log10(waist + hip − neck)
 * − 97.684 × log10(height) − 78.387. Centimetres are divided by 2.54 first. A span of zero or less has no logarithm
 * ('domain'); a result outside 0.1% to 99.9% is not a body fat ('range').
 */
export function bodyFat(input: BodyFatInput): BodyFatResult {
  const scale = input.unit === 'us' ? 10 : 25.4;
  const height = input.unit === 'us' ? heightTenthsIn(input) / 10 : input.cm / scale;
  const span = input.sex === 'male' ? input.waist - input.neck : input.waist + input.hip - input.neck;
  if (span <= 0) return { error: 'domain' };
  const exact =
    input.sex === 'male'
      ? 86.01 * Math.log10(span / scale) - 70.041 * Math.log10(height) + 36.76
      : 163.205 * Math.log10(span / scale) - 97.684 * Math.log10(height) - 78.387;
  if (exact < 0.05 || exact >= 99.95) return { error: 'range', exact };
  return { percent: roundFloat(exact, 10), exact };
}

// --- due date (NICHD: 40 weeks; NIH nuMoM2b: 266, 263 and 261 days) -----------------------------------------------

export type DueMethod = 'lmp' | 'conception' | 'ivf3' | 'ivf5';

/** Days from the date typed to the due date. */
export const DUE_OFFSET: Record<DueMethod, number> = { lmp: 280, conception: 266, ivf3: 263, ivf5: 261 };

/** The weeks of a pregnancy are shown from 0 days up to 42 weeks and 6 days. */
export const MAX_AGE_DAYS = 300;

export interface DueDateInput {
  method: DueMethod;
  date: string;
  /** The device's own day, read once by the island. */
  today: string;
}

export interface DueDateResult {
  due: string;
  /** The first day of the last period the due date implies. */
  lmp: string;
  /** The first day of each trimester: week 1, week 13 and week 29 (NICHD). */
  trimesters: [string, string, string];
  /** 39 weeks and 0 days: full term begins. */
  fullTerm: string;
  status: 'before' | 'pregnant' | 'after';
  age: { weeks: number; days: number } | null;
}

export function dueDate(input: DueDateInput): DueDateResult {
  const due = (dayOf(input.date) ?? 0) + DUE_OFFSET[input.method];
  const lmp = due - 280;
  const age = (dayOf(input.today) ?? 0) - lmp;
  const status = age < 0 ? 'before' : age > MAX_AGE_DAYS ? 'after' : 'pregnant';
  return {
    due: isoOf(due),
    lmp: isoOf(lmp),
    trimesters: [isoOf(lmp), isoOf(lmp + 84), isoOf(lmp + 196)],
    fullTerm: isoOf(lmp + 273),
    status,
    age: status === 'pregnant' ? { weeks: Math.floor(age / 7), days: age % 7 } : null,
  };
}
