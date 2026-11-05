// The five health calculators end to end (prompt F7, decision 11), in both browsers: the example each page opens with
// and cases of the oracle typed in, read on the ResultHero, in the open table of the result and in the CSV saved from the
// page, against fixtures/calc (written before the engines); US and metric units (DECISOES § 261); the days of the due
// date and of the cycles with the page's clock fixed, across a month, a year and a leap day, and today in the device's
// own time zone (§ 262); a day out of the range; no cheer of the Oli on a health result (decision 5); the PDF with its
// fixed name; and the number of the ResultHero on one line, also with the longest dates.
// The name starts with "money-" only for the order of the WebKit parts (DECISOES § 142).
import { isDeepStrictEqual } from 'node:util';
import { expect, test, type Page } from '@playwright/test';
import { HEALTH_CALC_IDS, LIFE_CALC_PAGES, type HealthCalcId } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import type { BmiResult, BodyFatInput, BodyInput, CalorieInput, CalorieResult, DueDateInput, DueDateResult, OvulationInput, OvulationResult } from '../../src/calc/health.ts';
import bmiTexts from '../../src/tools/bmi-calculator/i18n/en.ts';
import calorieTexts from '../../src/tools/calorie-calculator/i18n/en.ts';
import ovulationTexts from '../../src/tools/ovulation-calculator/i18n/en.ts';
import bodyFatTexts from '../../src/tools/body-fat-calculator/i18n/en.ts';
import dueTexts from '../../src/tools/due-date-calculator/i18n/en.ts';
import { pdfTextLines } from './lib/pdf-text.ts';
import { strictPdf } from './lib/pdf.ts';
import { settle } from './lib/page.ts';
import {
  chooseOption,
  expectCsv,
  expectHero,
  expectPdf,
  expectTable,
  filled,
  heroLines,
  heroNumber,
  longDay,
  oracleCase,
  openCalc,
  scaled,
  type,
  typed,
  whole,
  type Cell,
} from './lib/life-calc.ts';

interface Result {
  hero: string;
  sentence: string;
  rows: Cell[][];
  /** The rows the screen writes, when they are shorter than the CSV's (the ovulation's dates; F13b, DECISOES § C-7). */
  screen?: Cell[][];
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** A day as the narrow table writes it, by hand: "2027-06-14" → "Jun 14, 2027", the month glued to its day. */
function shortDay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${SHORT_MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}
/** Two days as one range of the narrow table: the year once, the month once when both are in it. */
function shortRange(from: string, to: string): string {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  if (y1 !== y2) return `${shortDay(from)} to ${shortDay(to)}`;
  const start = `${SHORT_MONTHS[(m1 ?? 1) - 1]} ${d1}`;
  return m1 === m2 ? `${start} to ${d2}, ${y1}` : `${start} to ${SHORT_MONTHS[(m2 ?? 1) - 1]} ${d2}, ${y1}`;
}

interface Health<I, E> {
  id: HealthCalcId;
  /** A corner of the oracle's grid and a random draw (and more), typed in the fields. */
  cases: readonly string[];
  head: readonly string[];
  fill: (page: Page, input: I) => Promise<void>;
  result: (input: I, expected: E) => Result;
}

const tenth = (value: number): string => scaled(value, 1, 1);

/** The height and weight of the unit system the case uses; the other system's fields keep their own values. */
async function fillBody(page: Page, input: BodyInput, weight = true): Promise<void> {
  await chooseOption(page, 'u', input.unit);
  if (input.unit === 'us') {
    await type(page, 'ft', String(input.feet));
    await type(page, 'in', typed(input.inches, 1));
    if (weight) await type(page, 'lb', typed(input.pounds, 1));
  } else {
    await type(page, 'cm', typed(input.cm, 1));
    if (weight) await type(page, 'kg', typed(input.kg, 1));
  }
}

// --- BMI ------------------------------------------------------------------------------------------------------------

const bv = bmiTexts.panel.view;
const CATEGORIES = ['underweight', 'healthy', 'overweight', 'obesity-1', 'obesity-2', 'obesity-3'] as const;
const categoryName = (category: BmiResult['category']): string => bv[`cat-${category}`];
const categoryBand = (category: BmiResult['category']): string => bv[`band-${category}`];

const bmi: Health<BodyInput, BmiResult> = {
  id: 'bmi-calculator',
  cases: ['grid-001', 'random-001'],
  head: [bv.colCategory, bv.colBmi, bv.colYours],
  fill: (page, input) => fillBody(page, input),
  result(_input, expected) {
    const value = tenth(expected.bmi);
    return {
      hero: value,
      sentence: filled(bv.sentence, { bmi: value, category: categoryName(expected.category), band: categoryBand(expected.category) }),
      // The table is the CDC's categories, with the BMI in the row of the oracle's category.
      rows: CATEGORIES.map((category) => [categoryName(category), categoryBand(category), category === expected.category ? value : '']),
    };
  },
};

// --- calories -------------------------------------------------------------------------------------------------------

const cv = calorieTexts.panel.view;

const calorie: Health<CalorieInput, CalorieResult> = {
  id: 'calorie-calculator',
  cases: ['grid-032', 'random-001'],
  head: [cv.colItem, cv.colAmount],
  async fill(page, input) {
    await fillBody(page, input);
    await type(page, 'ag', String(input.age));
    await chooseOption(page, 'sx', input.sex);
    await type(page, 'pa', typed(input.pal, 2));
  },
  result(input, expected) {
    const ree = whole(expected.ree);
    const tdee = whole(expected.tdee);
    const pal = scaled(input.pal, 2);
    return {
      hero: `${tdee} ${cv.unit}`,
      sentence: filled(cv.sentence, { sex: input.sex === 'male' ? cv.male : cv.female, ree, pal, tdee }),
      rows: [
        [cv.ree, `${ree} ${cv.unit}`],
        [cv.pal, pal],
        [cv.label, `${tdee} ${cv.unit}`],
      ],
    };
  },
};

// --- ovulation ------------------------------------------------------------------------------------------------------

const ov = ovulationTexts.panel.view;

const ovulation: Health<OvulationInput, OvulationResult> = {
  id: 'ovulation-calculator',
  cases: ['grid-001', 'random-001'],
  head: [ov.colWindow, ov.colOvulation, ov.colNext],
  async fill(page, input) {
    await type(page, 'd', input.lmp);
    await type(page, 'c', String(input.cycle));
  },
  result(_input, expected) {
    const first = expected.cycles[0];
    if (!first) throw new Error('no cycle');
    return {
      hero: longDay(first.ovulation),
      sentence: filled(ov.sentence, { from: longDay(first.fertileStart), to: longDay(first.ovulation), next: longDay(first.nextPeriod) }),
      rows: expected.cycles.map((cycle) => [
        filled(ov.window, { from: longDay(cycle.fertileStart), to: longDay(cycle.ovulation) }),
        longDay(cycle.ovulation),
        longDay(cycle.nextPeriod),
      ]),
      // F13b (F7 obs 2; DECISOES § C-7): the screen writes the short dates; the CSV keeps the long ones.
      screen: expected.cycles.map((cycle) => [shortRange(cycle.fertileStart, cycle.ovulation), shortDay(cycle.ovulation), shortDay(cycle.nextPeriod)]),
    };
  },
};

// --- body fat -------------------------------------------------------------------------------------------------------

const fv = bodyFatTexts.panel.view;

const bodyFat: Health<BodyFatInput, { percent: number }> = {
  id: 'body-fat-calculator',
  cases: ['page-example-male', 'grid-050', 'random-001'],
  head: [fv.colItem, fv.colAmount],
  async fill(page, input) {
    await chooseOption(page, 'u', input.unit);
    if (input.unit === 'us') {
      await type(page, 'ft', String(input.feet));
      await type(page, 'in', typed(input.inches, 1));
      await type(page, 'nk', typed(input.neck, 1));
      await type(page, 'wa', typed(input.waist, 1));
    } else {
      await type(page, 'cm', typed(input.cm, 1));
      await type(page, 'nkc', typed(input.neck, 1));
      await type(page, 'wac', typed(input.waist, 1));
    }
    await chooseOption(page, 'sx', input.sex);
    await type(page, input.unit === 'us' ? 'hp' : 'hpc', typed(input.hip, 1));
  },
  result(input, expected) {
    const percent = tenth(expected.percent);
    return {
      hero: `${percent}%`,
      sentence: filled(fv.sentence, { sex: input.sex === 'male' ? fv.male : fv.female, percent }),
      rows: [
        [fv.method, input.sex === 'male' ? fv.formulaMale : fv.formulaFemale],
        [fv.label, `${percent}%`],
      ],
    };
  },
};

// --- due date -------------------------------------------------------------------------------------------------------

const dv = dueTexts.panel.view;

function weeksAlong(age: { weeks: number; days: number }): string {
  return filled(dv.age, {
    weeks: filled(age.weeks === 1 ? dv.week : dv.weeks, { n: whole(age.weeks) }),
    days: filled(age.days === 1 ? dv.day : dv.days, { n: whole(age.days) }),
  });
}

const dueDate: Health<DueDateInput, DueDateResult> = {
  id: 'due-date-calculator',
  cases: [],
  head: [dv.colMilestone, dv.colDate],
  async fill(page, input) {
    await page.locator('#fo-calc-m').selectOption(input.method);
    await type(page, 'd', input.date);
  },
  result(_input, expected) {
    const today = expected.status === 'pregnant' && expected.age ? filled(dv.today, { age: weeksAlong(expected.age) }) : expected.status === 'before' ? dv.before : dv.after;
    return {
      hero: longDay(expected.due),
      sentence: filled(dv.sentence, { lmp: longDay(expected.lmp), today }),
      rows: [
        [dv.trimester1, longDay(expected.trimesters[0])],
        [dv.trimester2, longDay(expected.trimesters[1])],
        [dv.trimester3, longDay(expected.trimesters[2])],
        [dv.fullTerm, longDay(expected.fullTerm)],
        [dv.label, longDay(expected.due)],
      ],
    };
  },
};

const HEALTH = [bmi, calorie, ovulation, bodyFat, dueDate] as unknown as readonly Health<unknown, unknown>[];

/**
 * The days the clock is fixed on: the "clock" cases of the oracle (scripts/oracle/calc_home_health.py, source "clock"),
 * read from the fixtures like every other expected value: a last period at the turn of the year, February 29, 2028 typed
 * and as today, the example on November 3 and 4, 2026, and the longest date the page writes (September 30, 2027).
 */
const dueCase = (caseId: string) => oracleCase<DueDateInput, DueDateResult>('due-date-calculator', caseId);
const cycleCase = (caseId: string) => oracleCase<OvulationInput, OvulationResult>('ovulation-calculator', caseId);
const ORACLE_DUE = ['clock-new-year', 'clock-leap-typed', 'clock-leap-today', 'clock-leap-ivf5'].map(dueCase);
const EXAMPLE_ON = {
  '2026-11-03': dueCase('clock-example-11-03').expected.age ?? { weeks: -1, days: -1 },
  '2026-11-04': dueCase('clock-example-11-04').expected.age ?? { weeks: -1, days: -1 },
} as const;
const ORACLE_CYCLES = ['clock-new-year', 'clock-leap'].map(cycleCase);
/** The longest dates the page writes ("September" and two digits): a due date and an ovulation on September 30, 2027. */
const LONG_DUE = { input: dueCase('clock-longest-date').input, due: dueCase('clock-longest-date').expected.due } as const;
const LONG_CYCLE = { input: cycleCase('clock-longest-date').input, ovulation: cycleCase('clock-longest-date').expected.cycles[0]?.ovulation ?? '' } as const;

/** Noon of a day on the page's clock, in the time zone of the browser: today is that day wherever the test runs. */
async function today(page: Page, day: string): Promise<void> {
  await page.clock.setFixedTime(new Date(`${day}T12:00:00`));
}

async function expectResult<I, E>(page: Page, calc: Health<I, E>, input: I, expected: E): Promise<void> {
  const { hero, sentence, rows, screen } = calc.result(input, expected);
  await expectHero(page, hero, sentence);
  await expectTable(page, calc.head, screen ?? rows);
  await expectCsv(page, calc.id, calc.head, rows);
}

for (const calc of HEALTH) {
  test(`${LIFE_CALC_PAGES[calc.id].path}: the example and oracle cases on the ResultHero, in the open table and in the CSV`, async ({ page }) => {
    const example = oracleCase(calc.id, 'page-example');
    const def = DEFS[calc.id];
    expect(isDeepStrictEqual(JSON.parse(JSON.stringify(def.toInput(def.initial as never))), example.input), 'the page example is the oracle case').toBe(true);
    // The due date's example counts the weeks to November 2, 2026; the page reads today from the device once.
    if (calc.id === 'due-date-calculator') await today(page, '2026-11-02');
    await openCalc(page, calc.id);
    await expectResult(page, calc, example.input, example.expected);
    for (const id of calc.cases) {
      const kase = oracleCase(calc.id, id);
      await calc.fill(page, kase.input);
      await expectResult(page, calc, kase.input, kase.expected);
    }
  });
}

test('the due date example: 8 weeks and 0 days on November 2, 2026, due June 14, 2027', async ({ page }) => {
  await today(page, '2026-11-02');
  await openCalc(page, 'due-date-calculator');
  await expectHero(page, 'June 14, 2027');
  await expect(page.locator('.fo-rhero__sentence')).toContainText('Today the pregnancy is 8 weeks and 0 days along.');
  await expect(page.locator('#fo-calc-d')).toHaveValue('2026-09-07');
});

// The fixture's own days: a leap day typed and as today, the month after February 29, a turn of the year (2099 into
// 2100), a change of year between the period and today, before the first day and past 42 weeks, conception and IVF.
const DUE_FIXTURE = ['grid-020', 'grid-016', 'grid-022', 'grid-048', 'random-065', 'grid-019', 'grid-027', 'grid-074', 'nichd-ivf-day-5'] as const;

for (const id of DUE_FIXTURE) {
  test(`the due date with the clock fixed: oracle case ${id}`, async ({ page }) => {
    const kase = oracleCase<DueDateInput, DueDateResult>('due-date-calculator', id);
    await today(page, kase.input.today);
    await openCalc(page, 'due-date-calculator');
    await dueDate.fill(page, kase.input);
    await expectResult(page, dueDate, kase.input, kase.expected);
  });
}

for (const { input, expected } of ORACLE_DUE) {
  test(`the due date with the clock fixed: ${input.method} ${input.date}, today ${input.today}`, async ({ page }) => {
    await today(page, input.today);
    await openCalc(page, 'due-date-calculator');
    await dueDate.fill(page, input);
    await expectResult(page, dueDate, input, expected);
  });
}

test('the ovulation table across a year, a leap day and 2100: six cycles each, against the oracle', async ({ page }) => {
  await openCalc(page, 'ovulation-calculator');
  // The fixture: a last period on December 20, 2026; February 28, 2028 with a fertile window from February 29; December 31, 2099.
  for (const id of ['grid-013', 'grid-022', 'grid-028']) {
    const kase = oracleCase<OvulationInput, OvulationResult>('ovulation-calculator', id);
    await ovulation.fill(page, kase.input);
    await expectResult(page, ovulation, kase.input, kase.expected);
    if (id === 'grid-022') await expect(page.locator('#fo-calc-schedule tbody tr').first()).toContainText('Feb 29 to Mar 5, 2028');
  }
  // The oracle on the days the fixture has no case for: December 25, 2027 and February 29, 2028 typed.
  for (const { input, expected } of ORACLE_CYCLES) {
    await ovulation.fill(page, input);
    await expectResult(page, ovulation, input, expected);
  }
});

test('a day out of the range says the range in words and keeps the last result', async ({ page }) => {
  await today(page, '2026-11-02');
  for (const id of ['due-date-calculator', 'ovulation-calculator'] as const) {
    await openCalc(page, id);
    const field = page.locator('#fo-calc-d');
    // F13b (DECISOES § C-2): the words of the day out of the range are said in the card, which the field points to.
    const error = page.locator('#fo-rhero-error');
    const before = (await heroNumber(page).textContent()) ?? '';
    const sentence = (await page.locator('.fo-rhero__sentence').textContent()) ?? '';
    for (const day of ['1999-12-31', '2100-01-01']) {
      await field.fill(day);
      await expect(field, `${id} ${day}`).toHaveAttribute('aria-invalid', 'true');
      await expect(error, `${id} ${day}`).toHaveText('Enter a day from January 1, 2000 to December 31, 2099.');
      await expect(field).toHaveAttribute('aria-describedby', /fo-rhero-error/);
      await expect(heroNumber(page)).toHaveText(before);
      // The sentence keeps its place and its words, hidden, under the last result that worked.
      await expect(page.locator('.fo-rhero__sentence')).toHaveText(sentence);
      await expect(page.locator('.fo-rhero__stale')).toContainText('Last result that worked: ');
    }
    await field.fill('2026-09-14');
    await expect(error).toHaveCount(0);
    await expect(heroNumber(page)).not.toHaveText(before);
  }
});

test.describe('today in the time zone of the device', () => {
  test.use({ timezoneId: 'America/Sao_Paulo' });

  test('at 10:30 p.m. on November 3 in São Paulo, today is the 3rd, not the 4th of UTC', async ({ page }) => {
    // 2026-11-04 01:30 UTC is 2026-11-03 22:30 in São Paulo (UTC−3, no daylight saving time since 2019).
    await page.clock.setFixedTime(new Date('2026-11-04T01:30:00Z'));
    await openCalc(page, 'due-date-calculator');
    expect(await page.evaluate(() => [new Date().toISOString().slice(0, 10), new Date().getDate(), new Date().getHours()])).toEqual(['2026-11-04', 3, 22]);
    const example = oracleCase<DueDateInput, DueDateResult>('due-date-calculator', 'page-example');
    // The oracle: from September 7, 2026 to November 3 is 8 weeks and 1 day; the 4th would be 8 weeks and 2 days.
    const sentence = page.locator('.fo-rhero__sentence');
    await expect(sentence).toContainText(filled(dv.today, { age: weeksAlong(EXAMPLE_ON['2026-11-03']) }));
    await expect(sentence).not.toContainText(weeksAlong(EXAMPLE_ON['2026-11-04']));
    await expectHero(page, longDay(example.expected.due));
  });
});

// Units (DECISOES § 261): switching shows the other system's own fields, with its example or what was typed there, and
// nothing is converted. The metric example is the oracle's page-example-metric.
test.describe('US and metric units', () => {
  test('BMI: the metric example, then back to US with what was typed there', async ({ page }) => {
    await openCalc(page, 'bmi-calculator');
    const typedCase = oracleCase<BodyInput, BmiResult>('bmi-calculator', 'grid-001');
    await bmi.fill(page, typedCase.input);
    await expectHero(page, tenth(typedCase.expected.bmi));
    await chooseOption(page, 'u', 'metric');
    const metric = oracleCase<BodyInput, BmiResult>('bmi-calculator', 'page-example-metric');
    await expectHero(page, tenth(metric.expected.bmi), bmi.result(metric.input, metric.expected).sentence);
    await expect(page.locator('#fo-calc-cm')).toHaveValue(typed(metric.input.cm, 1));
    await expect(page.locator('#fo-calc-kg')).toHaveValue(typed(metric.input.kg, 1));
    await expect(page.locator('#fo-calc-ft, #fo-calc-in, #fo-calc-lb')).toHaveCount(0);
    await chooseOption(page, 'u', 'us');
    await expect(page.locator('#fo-calc-ft')).toHaveValue(String(typedCase.input.feet));
    await expect(page.locator('#fo-calc-in')).toHaveValue(typed(typedCase.input.inches, 1));
    await expect(page.locator('#fo-calc-lb')).toHaveValue(typed(typedCase.input.pounds, 1));
    await expect(page.locator('#fo-calc-cm, #fo-calc-kg')).toHaveCount(0);
    await expectHero(page, tenth(typedCase.expected.bmi));
  });

  test('Calorie: the metric example, then cases typed in each system, and US keeps its own', async ({ page }) => {
    await openCalc(page, 'calorie-calculator');
    const metric = oracleCase<CalorieInput, CalorieResult>('calorie-calculator', 'page-example-metric');
    await chooseOption(page, 'u', 'metric');
    await expectHero(page, `${whole(metric.expected.tdee)} ${cv.unit}`, calorie.result(metric.input, metric.expected).sentence);
    await expect(page.locator('#fo-calc-cm')).toHaveValue(typed(metric.input.cm, 1));
    await expect(page.locator('#fo-calc-kg')).toHaveValue(typed(metric.input.kg, 1));
    await chooseOption(page, 'u', 'us');
    const example = oracleCase<CalorieInput, CalorieResult>('calorie-calculator', 'page-example');
    await expectHero(page, `${whole(example.expected.tdee)} ${cv.unit}`);
    // The oracle's grid has the same person (female, 19, an activity level of 1.4, the smallest body) in both systems.
    const us = oracleCase<CalorieInput, CalorieResult>('calorie-calculator', 'grid-001');
    const metricTwin = oracleCase<CalorieInput, CalorieResult>('calorie-calculator', 'grid-017');
    expect([us.input.unit, us.input.sex, us.input.age, us.input.pal]).toEqual(['us', metricTwin.input.sex, metricTwin.input.age, metricTwin.input.pal]);
    expect(metricTwin.input.unit).toBe('metric');
    await calorie.fill(page, us.input);
    await expectHero(page, `${whole(us.expected.tdee)} ${cv.unit}`);
    await chooseOption(page, 'u', 'metric');
    await expect(page.locator('#fo-calc-cm')).toHaveValue(typed(metric.input.cm, 1));
    await fillBody(page, metricTwin.input);
    await expectHero(page, `${whole(metricTwin.expected.tdee)} ${cv.unit}`);
    await chooseOption(page, 'u', 'us');
    await expect(page.locator('#fo-calc-ft')).toHaveValue(String(us.input.feet));
    await expect(page.locator('#fo-calc-in')).toHaveValue(typed(us.input.inches, 1));
    await expect(page.locator('#fo-calc-lb')).toHaveValue(typed(us.input.pounds, 1));
    await expectHero(page, `${whole(us.expected.tdee)} ${cv.unit}`);
  });

  test('Body fat: the metric example, then back to US with what was typed there', async ({ page }) => {
    await openCalc(page, 'body-fat-calculator');
    const typedCase = oracleCase<BodyFatInput, { percent: number }>('body-fat-calculator', 'grid-008');
    expect([typedCase.input.unit, typedCase.input.sex]).toEqual(['us', 'female']);
    await bodyFat.fill(page, typedCase.input);
    await expectHero(page, `${tenth(typedCase.expected.percent)}%`);
    await chooseOption(page, 'u', 'metric');
    const metric = oracleCase<BodyFatInput, { percent: number }>('body-fat-calculator', 'page-example-metric');
    await expectHero(page, `${tenth(metric.expected.percent)}%`, bodyFat.result(metric.input, metric.expected).sentence);
    for (const [key, value] of [['cm', metric.input.cm], ['nkc', metric.input.neck], ['wac', metric.input.waist], ['hpc', metric.input.hip]] as const) {
      await expect(page.locator(`#fo-calc-${key}`), key).toHaveValue(typed(value, 1));
    }
    await expect(page.locator('#fo-calc-ft, #fo-calc-in, #fo-calc-nk, #fo-calc-wa, #fo-calc-hp')).toHaveCount(0);
    await chooseOption(page, 'u', 'us');
    for (const [key, value] of [['in', typedCase.input.inches], ['nk', typedCase.input.neck], ['wa', typedCase.input.waist], ['hp', typedCase.input.hip]] as const) {
      await expect(page.locator(`#fo-calc-${key}`), key).toHaveValue(typed(value, 1));
    }
    await expect(page.locator('#fo-calc-ft')).toHaveValue(String(typedCase.input.feet));
    await expectHero(page, `${tenth(typedCase.expected.percent)}%`);
  });
});

// Decision 5: the Oli never cheers a health result. The sprite of a health page has no cheer pose at all, and a change of
// a field neither makes her cheer nor marks the visit. F13b (DECISOES § C-2): she is in the card from the first paint and
// keeps waving.
test('no health page cheers: no cheer pose in the sprite, the Oli of the card keeps waving after a change', async ({ page }) => {
  await today(page, '2026-11-02');
  const change: Record<HealthCalcId, [string, string]> = {
    'bmi-calculator': ['lb', '170'],
    'calorie-calculator': ['lb', '170'],
    'ovulation-calculator': ['c', '30'],
    'body-fat-calculator': ['wa', '30'],
    'due-date-calculator': ['d', '2026-09-14'],
  };
  for (const id of HEALTH_CALC_IDS) {
    await openCalc(page, id);
    await expect(page.locator('symbol#oli-cheer'), id).toHaveCount(0);
    await expect(page.locator('symbol[id^="oli-"]').first(), id).toBeAttached();
    const before = (await heroNumber(page).textContent()) ?? '';
    const [key, value] = change[id];
    await type(page, key, value);
    await expect(heroNumber(page), id).not.toHaveText(before);
    await settle(page);
    await expect(page.locator('.fo-rhero__oli'), id).toHaveAttribute('data-oli', 'wave');
    await expect(page.locator('[data-oli="cheer"], use[href="#oli-cheer"]'), id).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem('fo-calc-cheer')), id).toBeNull();
  }
});

test('the due date PDF has the fixed name and draws the due date of the example', async ({ page }) => {
  await today(page, '2026-11-02');
  await openCalc(page, 'due-date-calculator');
  const bytes = await expectPdf(page, 'due-date-calculator');
  const strict = await strictPdf(new Uint8Array(bytes));
  expect(strict.problems).toEqual([]);
  const example = oracleCase<DueDateInput, DueDateResult>('due-date-calculator', 'page-example').expected;
  const lines = pdfTextLines(new Uint8Array(bytes));
  expect(lines).toContain(longDay(example.due));
  expect(lines).toContain(longDay(example.fullTerm));
});

// The number of the ResultHero stays on one line from 320 to 1280px (DECISOES § 246 and § 253) on the example of each health
// page, and with the longest date the page writes, September 30, 2027, as a due date and as an ovulation.
test('the ResultHero number of the health calculators stays on one line, also with "September 30, 2027"', async ({ page }) => {
  test.setTimeout(120_000);
  await today(page, '2026-11-02');
  const broken: string[] = [];
  const check = async (label: string) => {
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 768, 1280]) {
      const { lines, scroll } = await heroLines(page, width);
      if (lines !== 1) broken.push(`${label} a ${width}px: ${lines} linhas`);
      if (scroll > width) broken.push(`${label} a ${width}px: a página rola para o lado (${scroll}px)`);
    }
  };
  for (const id of HEALTH_CALC_IDS) {
    await page.setViewportSize({ width: 320, height: 900 });
    await openCalc(page, id);
    await check(id);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await openCalc(page, 'due-date-calculator');
  await dueDate.fill(page, LONG_DUE.input);
  await expectHero(page, longDay(LONG_DUE.due));
  await check(`due date ${LONG_DUE.due}`);
  await page.setViewportSize({ width: 320, height: 900 });
  await openCalc(page, 'ovulation-calculator');
  await ovulation.fill(page, LONG_CYCLE.input);
  await expectHero(page, longDay(LONG_CYCLE.ovulation));
  await check(`ovulation ${LONG_CYCLE.ovulation}`);
  expect(broken).toEqual([]);
});
