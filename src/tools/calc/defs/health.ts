// The health calculators (prompt F7, decisions 2, 5 and 6): BMI, calories, ovulation, body fat and the due date, for adults
// only. BMI, calories and body fat take US or metric units (US first): each system keeps its own fields and values, so
// switching shows the other system's example (or what was typed there before) and nothing is converted (DECISOES § 261).
// The results are said in plain words, never with praise or a verdict, and the CDC's names for the categories; the Oli
// never cheers a health result (the island's `cheer` is off on these pages).
import { fmt } from '../../../i18n/format.ts';
import { formatScaled, type NumberLang } from '../../../calc/parse.ts';
import { longDate, tableDate, tableRange } from '../../../i18n/dates.ts';
import {
  bmi,
  bodyFat,
  calorie,
  dueDate,
  ovulation,
  type BmiCategory,
  type BmiResult,
  type BodyFatInput,
  type BodyFatResult,
  type BodyInput,
  type CalorieInput,
  type CalorieResult,
  type DueDateInput,
  type DueDateResult,
  type DueMethod,
  type OvulationInput,
  type OvulationResult,
} from '../../../calc/health.ts';
import { count, measure, num, say, text } from './shared.ts';
import type { CalcDef, CalcPanelTexts, Cell, DateSpec, FieldSpec, Table, Values } from '../types.ts';

const plain = (value: string): Cell => ({ text: value });
const tenth = (value: number, l: NumberLang): string => formatScaled(value, 1, l, { min: 1 });
const whole = (value: number, l: NumberLang): string => formatScaled(value, 0, l);

function twoColumns(caption: string, head: [string, string], lines: readonly [string, string][]): Table {
  return { caption, head: [...head], rows: lines.map(([item, amount]) => [plain(item), plain(amount)]) };
}

/** The days a date field takes: fixed, so the range never moves with the day the page is opened (DECISOES § 262). */
export const DAY_RANGE = { min: '2000-01-01', max: '2099-12-31' } as const;
const dateField = (key: string, extra: Partial<DateSpec> = {}): DateSpec => ({ kind: 'date', key, ...DAY_RANGE, ...extra });

/** The unit menu and the height and weight of both systems: US first, with feet and inches side by side (decision 2). */
function bodyFields(age: { min: number; max: number }, weight = true): FieldSpec[] {
  const us = { key: 'u', is: 'us' };
  const metric = { key: 'u', is: 'metric' };
  return [
    { kind: 'choice', key: 'u', options: ['us', 'metric'], main: true },
    count('ft', 3, 8, { main: true, half: true, when: us }),
    measure('in', 1, 0, 119, { main: true, half: true, when: us }),
    ...(weight ? [measure('lb', 1, 550, 10_000, { main: true, half: true, when: us })] : []),
    measure('cm', 1, 915, 2_743, { main: true, half: true, when: metric }),
    ...(weight ? [measure('kg', 1, 250, 4_535, { main: true, half: true, when: metric })] : []),
    count('ag', age.min, age.max, { main: true, half: true }),
  ];
}

const bodyInput = (values: Values): BodyInput => ({
  unit: values['u'] === 'metric' ? 'metric' : 'us',
  feet: num(values, 'ft'),
  inches: num(values, 'in'),
  pounds: num(values, 'lb'),
  cm: num(values, 'cm'),
  kg: num(values, 'kg'),
});

// --- BMI ------------------------------------------------------------------------------------------------------------

/** The CDC's adult categories, in order, with the BMI each one covers as the CDC calculator writes it (one decimal). */
export const BMI_CATEGORIES: readonly BmiCategory[] = ['underweight', 'healthy', 'overweight', 'obesity-1', 'obesity-2', 'obesity-3'];

export const BMI_EXAMPLE: Values = { u: 'us', ft: 5, in: 90, lb: 1600, cm: 1750, kg: 700, ag: 35 };

export const bmiDef: CalcDef<BodyInput, BmiResult> = {
  id: 'bmi-calculator',
  fields: bodyFields({ min: 20, max: 120 }),
  initial: BMI_EXAMPLE,
  toInput: bodyInput,
  compute: bmi,
  view(r, _values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const value = tenth(r.bmi, l);
    const name = (category: BmiCategory) => text(v, `cat-${category}`);
    const band = (category: BmiCategory) => text(v, `band-${category}`);
    return {
      hero: { label: text(v, 'label'), value, sentence: say(text(v, 'sentence'), { bmi: value, category: name(r.category), band: band(r.category) }) },
      placard: { n: value, l: text(v, 'label') },
      open: true,
      // The CDC categories, with the person's BMI in the row of its category (in words in the cell, never by colour), so the
      // CSV and the PDF carry the result too.
      table: () => ({
        caption: text(v, 'caption'),
        head: [text(v, 'colCategory'), text(v, 'colBmi'), text(v, 'colYours')],
        rows: BMI_CATEGORIES.map((category) => [plain(name(category)), plain(band(category)), plain(category === r.category ? value : '')]),
      }),
      summary: [
        [text(v, 'label'), value],
        [text(v, 'category'), name(r.category)],
      ],
      premises: t.premises,
    };
  },
};

// --- calories -------------------------------------------------------------------------------------------------------

export const CALORIE_EXAMPLE: Values = { u: 'us', sx: 'female', ft: 5, in: 50, lb: 1500, cm: 1650, kg: 680, ag: 35, pa: 160 };

export const calorieDef: CalcDef<CalorieInput, CalorieResult> = {
  id: 'calorie-calculator',
  fields: [
    ...bodyFields({ min: 19, max: 78 }).slice(0, 1),
    ...bodyFields({ min: 19, max: 78 }).slice(1),
    // After the result on a phone, with the activity level: the result stays above the fold (DECISOES § 124 and § 268).
    { kind: 'choice', key: 'sx', options: ['female', 'male'] },
    measure('pa', 2, 140, 250, { example: true }),
  ],
  initial: CALORIE_EXAMPLE,
  toInput: (values) => ({ ...bodyInput(values), sex: values['sx'] === 'male' ? 'male' : 'female', age: num(values, 'ag'), pal: num(values, 'pa') }),
  compute: calorie,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const tdee = whole(r.tdee, l);
    const ree = whole(r.ree, l);
    const pal = formatScaled(num(values, 'pa'), 2, l);
    const unit = text(v, 'unit');
    const lines: [string, string][] = [
      [text(v, 'ree'), `${ree} ${unit}`],
      [text(v, 'pal'), pal],
      [text(v, 'label'), `${tdee} ${unit}`],
    ];
    return {
      // The sentence says which formula made the number: the sex comes after the result on a phone (review F7, g-3; DECISOES § 281).
      hero: { label: text(v, 'label'), value: tdee, unit, sentence: say(text(v, 'sentence'), { sex: text(v, values['sx'] === 'male' ? 'male' : 'female'), ree, pal, tdee }) },
      placard: { n: tdee, l: text(v, 'label') },
      open: true,
      table: () => twoColumns(text(v, 'caption'), [text(v, 'colItem'), text(v, 'colAmount')], lines),
      summary: lines,
      premises: t.premises,
    };
  },
};

// --- ovulation ------------------------------------------------------------------------------------------------------

export const OVULATION_EXAMPLE: Values = { d: '2026-10-19', c: 28 };

export const ovulationDef: CalcDef<OvulationInput, OvulationResult> = {
  id: 'ovulation-calculator',
  fields: [dateField('d', { main: true, half: true }), count('c', 20, 40, { main: true, half: true })],
  initial: OVULATION_EXAMPLE,
  toInput: (values) => ({ lmp: String(values['d']), cycle: num(values, 'c') }),
  compute: ovulation,
  view(r, _values, t, _s, lang) {
    const v = t.view;
    const day = (iso: string) => longDate(iso, lang);
    const first = r.cycles[0];
    const window = (cycle: { fertileStart: string; ovulation: string }) => fmt(text(v, 'window'), { from: day(cycle.fertileStart), to: day(cycle.ovulation) });
    return {
      hero: {
        label: text(v, 'label'),
        value: first ? day(first.ovulation) : '',
        sentence: first ? say(text(v, 'sentence'), { from: day(first.fertileStart), to: day(first.ovulation), next: day(first.nextPeriod) }) : [],
      },
      placard: { n: first ? day(first.ovulation) : '', l: text(v, 'label') },
      open: true,
      // Three columns, so the table fits a 320 px phone: a cycle starts on the previous row's next period, and the first
      // one on the day typed in (review F7, f-2; DECISOES § 275). F13b (F7 obs 2; DECISOES § 550): fixed columns, and the
      // screen writes the short dates ("Oct 26 to 31, 2026"), which never break between the month and the day; the CSV and
      // the PDF keep the long ones.
      table: () => ({
        caption: text(v, 'caption'),
        head: [text(v, 'colWindow'), text(v, 'colOvulation'), text(v, 'colNext')],
        rows: r.cycles.map((cycle) => [
          { text: window(cycle), short: tableRange(cycle.fertileStart, cycle.ovulation, lang, text(v, 'rangeTo')) },
          { text: day(cycle.ovulation), short: tableDate(cycle.ovulation, lang) },
          { text: day(cycle.nextPeriod), short: tableDate(cycle.nextPeriod, lang) },
        ]),
        even: true,
      }),
      summary: first
        ? [
            [text(v, 'fertile'), window(first)],
            [text(v, 'label'), day(first.ovulation)],
            [text(v, 'next'), day(first.nextPeriod)],
          ]
        : [],
      premises: t.premises,
    };
  },
};

// --- body fat -------------------------------------------------------------------------------------------------------

export const BODY_FAT_EXAMPLE: Values = { u: 'us', sx: 'female', ft: 5, in: 50, cm: 1650, nk: 130, wa: 280, hp: 380, nkc: 330, wac: 710, hpc: 965, ag: 35 };

const US = { key: 'u', is: 'us' };
const METRIC = { key: 'u', is: 'metric' };

export const bodyFatDef: CalcDef<BodyFatInput, BodyFatResult> = {
  id: 'body-fat-calculator',
  fields: [
    { kind: 'choice', key: 'u', options: ['us', 'metric'], main: true },
    count('ft', 3, 8, { main: true, half: true, when: US }),
    measure('in', 1, 0, 119, { main: true, half: true, when: US }),
    measure('cm', 1, 915, 2_743, { main: true, half: true, when: METRIC }),
    measure('nk', 1, 80, 300, { main: true, half: true, when: US }),
    measure('wa', 1, 150, 800, { main: true, half: true, when: US }),
    measure('nkc', 1, 200, 760, { main: true, half: true, when: METRIC }),
    measure('wac', 1, 380, 2_030, { main: true, half: true, when: METRIC }),
    // The formula's sex, the hip and the age come after the result on a phone (DECISOES § 268).
    { kind: 'choice', key: 'sx', options: ['female', 'male'] },
    measure('hp', 1, 200, 800, { half: true, when: US }),
    measure('hpc', 1, 500, 2_030, { half: true, when: METRIC }),
    count('ag', 18, 120, { half: true }),
  ],
  initial: BODY_FAT_EXAMPLE,
  toInput: (values) => {
    const metric = values['u'] === 'metric';
    return {
      unit: metric ? 'metric' : 'us',
      sex: values['sx'] === 'male' ? 'male' : 'female',
      feet: num(values, 'ft'),
      inches: num(values, 'in'),
      cm: num(values, 'cm'),
      neck: num(values, metric ? 'nkc' : 'nk'),
      waist: num(values, metric ? 'wac' : 'wa'),
      hip: num(values, metric ? 'hpc' : 'hp'),
    };
  },
  compute: bodyFat,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const male = values['sx'] === 'male';
    if ('error' in r) {
      const problem = text(v, r.error === 'domain' ? (male ? 'domainMale' : 'domainFemale') : 'range');
      return {
        // A dash, as in the other calculators' problems: "0 %" read as a body fat (review F7, f-7; DECISOES § 281).
        hero: { label: text(v, 'label'), value: '-', sentence: [] },
        problem,
        placard: { n: '-', l: text(v, 'label') },
        open: true,
        table: () => twoColumns(text(v, 'caption'), [text(v, 'colItem'), text(v, 'colAmount')], [[text(v, 'label'), '—']]),
        summary: [[text(v, 'label'), '—']],
        premises: t.premises,
      };
    }
    const percent = tenth(r.percent, l);
    const formula = text(v, male ? 'formulaMale' : 'formulaFemale');
    const lines: [string, string][] = [
      [text(v, 'method'), formula],
      [text(v, 'label'), `${percent}%`],
    ];
    return {
      hero: { label: text(v, 'label'), value: percent, unit: '%', sentence: say(text(v, 'sentence'), { sex: text(v, male ? 'male' : 'female'), percent }) },
      placard: { n: `${percent}%`, l: text(v, 'label') },
      open: true,
      table: () => twoColumns(text(v, 'caption'), [text(v, 'colItem'), text(v, 'colAmount')], lines),
      summary: lines,
      premises: t.premises,
    };
  },
};

// --- due date -------------------------------------------------------------------------------------------------------

export const DUE_METHODS: readonly DueMethod[] = ['lmp', 'conception', 'ivf3', 'ivf5'];

export const DUE_DATE_EXAMPLE: Values = { m: 'lmp', d: '2026-09-07', today: '2026-11-02' };

/** The weeks and days of a pregnancy in words: "8 weeks and 0 days", "1 week and 1 day". */
function weeksText(age: { weeks: number; days: number }, v: CalcPanelTexts['view'], l: NumberLang): string {
  return fmt(text(v, 'age'), {
    weeks: fmt(text(v, age.weeks === 1 ? 'week' : 'weeks'), { n: whole(age.weeks, l) }),
    days: fmt(text(v, age.days === 1 ? 'day' : 'days'), { n: whole(age.days, l) }),
  });
}

export const dueDateDef: CalcDef<DueDateInput, DueDateResult> = {
  id: 'due-date-calculator',
  fields: [{ kind: 'select', key: 'm', options: DUE_METHODS, main: true, half: true }, dateField('d', { main: true, half: true })],
  initial: DUE_DATE_EXAMPLE,
  today: true,
  toInput: (values) => ({
    method: DUE_METHODS.find((method) => method === values['m']) ?? 'lmp',
    date: String(values['d']),
    today: String(values['today']),
  }),
  compute: dueDate,
  view(r, _values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const day = (iso: string) => longDate(iso, lang);
    const due = day(r.due);
    const today = r.status === 'pregnant' && r.age ? fmt(text(v, 'today'), { age: weeksText(r.age, v, l) }) : text(v, r.status === 'before' ? 'before' : 'after');
    const lines: [string, string][] = [
      [text(v, 'trimester1'), day(r.trimesters[0])],
      [text(v, 'trimester2'), day(r.trimesters[1])],
      [text(v, 'trimester3'), day(r.trimesters[2])],
      [text(v, 'fullTerm'), day(r.fullTerm)],
      [text(v, 'label'), due],
    ];
    return {
      hero: { label: text(v, 'label'), value: due, sentence: say(text(v, 'sentence'), { lmp: day(r.lmp), today }) },
      placard: { n: due, l: text(v, 'label') },
      open: true,
      table: () => twoColumns(text(v, 'caption'), [text(v, 'colMilestone'), text(v, 'colDate')], lines),
      summary: [...lines, [text(v, 'todayLabel'), today]],
      premises: t.premises,
    };
  },
};
