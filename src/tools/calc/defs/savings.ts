// Compound interest, savings goal, simple interest and APR to APY (prompt F4, decision 1.7, 1.15, 1.17, 1.18).
import { fmt } from '../../../i18n/format.ts';
import { dollars, hundredthsPercent, money as cash, ratePercent, type NumberLang } from '../../../calc/parse.ts';
import {
  aprToApy,
  compoundInterest,
  savingsGoal,
  simpleInterest,
  type AprApyInput,
  type AprApyResult,
  type CompoundInput,
  type CompoundResult,
  type Compounding,
  type SavingsInput,
  type SavingsResult,
  type SimpleInterestInput,
  type SimpleInterestResult,
} from '../../../calc/savings.ts';
import { duration } from '../view.ts';
import { count, money, num, rate, say, text } from './shared.ts';
import type { CalcDef, CalcPanelTexts, Table } from '../types.ts';

const COMPOUNDING_OPTIONS = ['1', '2', '4', '12', '365'] as const;

function compoundingWord(t: CalcPanelTexts, value: string): string {
  return t.options?.['c']?.[value] ?? value;
}

export const compoundDef: CalcDef<CompoundInput, CompoundResult> = {
  id: 'compound-interest-calculator',
  fields: [
    money('i', 0, 10_000_000, { main: true, half: true }),
    money('m', 0, 1_000_000, { main: true, half: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    count('y', 1, 80, { main: true, half: true }),
    { kind: 'select', key: 'c', options: COMPOUNDING_OPTIONS, half: true },
    { kind: 'choice', key: 'tm', options: ['end', 'begin'] },
  ],
  initial: { i: 1_000_000, m: 30_000, r: 60_000, y: 20, c: '12', tm: 'end' },
  toInput: (v) => ({
    initial: num(v, 'i'),
    monthly: num(v, 'm'),
    rate: num(v, 'r'),
    compounding: Number(v['c']) as Compounding,
    years: num(v, 'y'),
    timing: v['tm'] === 'begin' ? 'begin' : 'end',
  }),
  compute: compoundInterest,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    if ('error' in r) {
      return {
        hero: { label: text(v, 'label'), value: '-', sentence: [] },
        problem: text(v, 'tooLarge'),
        placard: { n: '-', l: text(v, 'placard') },
        table: () => ({ caption: text(v, 'caption'), head: [text(v, 'year')], rows: [] }),
        summary: [[text(v, 'label'), text(v, 'tooLarge')]],
        premises: t.premises,
      };
    }
    const years = num(values, 'y');
    const table = (): Table => ({
      caption: text(v, 'caption'),
      head: [text(v, 'year'), text(v, 'deposits'), text(v, 'interest'), text(v, 'balance')],
      rows: r.years.map(([year, deposits, interest, balance]) => [{ text: String(year) }, { cents: deposits }, { cents: interest }, { cents: balance }]),
    });
    return {
      hero: {
        label: text(v, 'label'),
        value: dollars(r.final, l),
        sentence: say(text(v, 'sentence'), {
          contributed: dollars(r.contributed, l),
          interest: dollars(r.interest, l),
          time: duration(years * 12, s),
          rate: ratePercent(num(values, 'r'), l),
          how: compoundingWord(t, String(values['c'])),
        }),
      },
      placard: { n: dollars(r.final, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'deposits'), cents: r.contributed }, b: { label: text(v, 'interest'), cents: r.interest } },
      table,
      summary: [
        [text(v, 'label'), cash(r.final, l)],
        [text(v, 'deposits'), cash(r.contributed, l)],
        [text(v, 'interest'), cash(r.interest, l)],
      ],
      premises: t.premises,
    };
  },
};

export const savingsGoalDef: CalcDef<SavingsInput, SavingsResult> = {
  id: 'savings-goal-calculator',
  fields: [
    money('g', 1, 100_000_000, { main: true }),
    money('s', 0, 100_000_000, { main: true, half: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    { kind: 'choice', key: 'md', options: ['months', 'deposit'], main: true },
    count('m', 1, 1200, { main: true, when: { key: 'md', is: 'months' } }),
    money('dep', 0, 1_000_000, { main: true, when: { key: 'md', is: 'deposit' } }),
  ],
  initial: { g: 2_000_000, s: 200_000, r: 40_000, md: 'months', m: 36, dep: 50_000 },
  toInput: (v) =>
    v['md'] === 'deposit'
      ? { goal: num(v, 'g'), current: num(v, 's'), rate: num(v, 'r'), mode: 'deposit', deposit: num(v, 'dep') }
      : { goal: num(v, 'g'), current: num(v, 's'), rate: num(v, 'r'), mode: 'months', months: num(v, 'm') },
  compute: savingsGoal,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    if ('error' in r) {
      return {
        hero: { label: text(v, 'labelTime'), value: '-', sentence: [] },
        problem: fmt(text(v, 'tooLong'), { deposit: cash(num(values, 'dep'), l) }),
        placard: { n: '-', l: text(v, 'placardTime') },
        table: () => ({ caption: text(v, 'caption'), head: [text(v, 'month')], rows: [] }),
        summary: [[text(v, 'labelTime'), text(v, 'tooLong')]],
        premises: t.premises,
      };
    }
    const byMonths = values['md'] !== 'deposit';
    const facts = {
      deposit: cash(r.deposit, l),
      time: duration(r.months, s),
      rate: ratePercent(num(values, 'r'), l),
      saved: dollars(num(values, 's'), l),
      goal: dollars(num(values, 'g'), l),
      final: dollars(r.final, l),
      deposited: dollars(r.deposited, l),
      interest: dollars(r.interest, l),
    };
    const table = (): Table => {
      const groups: NonNullable<Table['groups']> = [];
      for (let from = 0, year = 1; from < r.rows.length; from += 12, year += 1) {
        const to = Math.min(from + 12, r.rows.length);
        groups.push({ label: fmt(s.year, { n: year }), end: { cents: r.rows[to - 1]![3] }, from, to });
      }
      return {
        caption: text(v, 'caption'),
        head: [text(v, 'month'), text(v, 'deposit'), text(v, 'interest'), text(v, 'balance')],
        rows: r.rows.map(([month, deposit, interest, balance]) => [{ text: String(month) }, { cents: deposit }, { cents: interest }, { cents: balance }]),
        groups,
      };
    };
    return {
      hero: byMonths
        ? { label: text(v, 'labelDeposit'), value: cash(r.deposit, l), unit: text(v, 'unit'), sentence: say(text(v, r.deposit === 0 ? 'alreadyThere' : 'sentenceMonths'), facts) }
        : { label: text(v, 'labelTime'), value: duration(r.months, s), sentence: say(text(v, r.months === 0 ? 'alreadyThere' : 'sentenceDeposit'), facts) },
      placard: byMonths ? { n: dollars(r.deposit, l), l: text(v, 'placardDeposit') } : { n: String(r.months), l: text(v, 'placardTime') },
      split: { a: { label: text(v, 'yours'), cents: num(values, 's') + r.deposited }, b: { label: text(v, 'interest'), cents: r.interest } },
      table,
      summary: [
        [text(v, 'labelDeposit'), cash(r.deposit, l)],
        [text(v, 'labelTime'), duration(r.months, s)],
        [text(v, 'final'), cash(r.final, l)],
        [text(v, 'deposited'), cash(r.deposited, l)],
        [text(v, 'interest'), cash(r.interest, l)],
      ],
      premises: t.premises,
    };
  },
};

const TIME_KEY: Record<SimpleInterestInput['unit'], string> = { years: 'ty', months: 'tmo', days: 'td' };

export const simpleInterestDef: CalcDef<SimpleInterestInput, SimpleInterestResult> = {
  id: 'simple-interest-calculator',
  fields: [
    money('pr', 0.01, 100_000_000, { main: true }),
    rate('r', 0, 100, { main: true, half: true, example: true }),
    { kind: 'select', key: 'u', options: ['years', 'months', 'days'], main: true, half: true },
    count('ty', 0, 100, { main: true, when: { key: 'u', is: 'years' } }),
    count('tmo', 0, 1200, { main: true, when: { key: 'u', is: 'months' } }),
    count('td', 0, 36_500, { main: true, when: { key: 'u', is: 'days' } }),
  ],
  initial: { pr: 1_000_000, r: 50_000, u: 'years', ty: 3, tmo: 36, td: 1095 },
  toInput: (v) => {
    const unit = (v['u'] === 'months' || v['u'] === 'days' ? v['u'] : 'years') as SimpleInterestInput['unit'];
    return { principal: num(v, 'pr'), rate: num(v, 'r'), unit, time: num(v, TIME_KEY[unit]) };
  },
  compute: simpleInterest,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const input = simpleInterestDef.toInput(values);
    const unitWord = t.options?.['u']?.[input.unit] ?? input.unit;
    // The table: interest at the end of each whole year of the period (the same formula, for the time so far).
    const table = (): Table => {
      const perYear = { years: 1, months: 12, days: 365 }[input.unit];
      const marks: number[] = [];
      for (let time = perYear; time < input.time; time += perYear) marks.push(time);
      marks.push(input.time);
      return {
        caption: text(v, 'caption'),
        head: [fmt(text(v, 'after'), { unit: unitWord }), text(v, 'interest'), text(v, 'total')],
        rows: marks.map((time) => {
          const at = simpleInterest({ ...input, time });
          return [{ text: String(time) }, { cents: at.interest }, { cents: at.total }];
        }),
      };
    };
    return {
      hero: {
        label: text(v, 'label'),
        value: cash(r.interest, l),
        sentence: say(text(v, 'sentence'), {
          principal: cash(input.principal, l),
          rate: ratePercent(input.rate, l),
          time: `${input.time} ${unitWord}`,
          interest: cash(r.interest, l),
          total: cash(r.total, l),
        }),
      },
      placard: { n: dollars(r.interest, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: input.principal }, b: { label: text(v, 'interest'), cents: r.interest } },
      table,
      summary: [
        [text(v, 'label'), cash(r.interest, l)],
        [text(v, 'total'), cash(r.total, l)],
      ],
      premises: t.premises,
    };
  },
};

export const aprApyDef: CalcDef<AprApyInput, AprApyResult> = {
  id: 'apr-to-apy-calculator',
  fields: [
    { kind: 'choice', key: 'dir', options: ['apr-to-apy', 'apy-to-apr'], main: true },
    rate('r', 0, 100, { main: true, half: true, example: true }),
    { kind: 'select', key: 'c', options: COMPOUNDING_OPTIONS, main: true, half: true },
  ],
  initial: { dir: 'apr-to-apy', r: 50_000, c: '365' },
  toInput: (v) => ({ rate: num(v, 'r'), compounding: Number(v['c']) as Compounding, direction: v['dir'] === 'apy-to-apr' ? 'apy-to-apr' : 'apr-to-apy' }),
  compute: aprToApy,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const toApy = values['dir'] !== 'apy-to-apr';
    const result = hundredthsPercent(r.result, l);
    return {
      hero: {
        label: text(v, toApy ? 'labelApy' : 'labelApr'),
        value: result,
        sentence: say(text(v, toApy ? 'sentenceApy' : 'sentenceApr'), {
          rate: ratePercent(num(values, 'r'), l),
          result,
          how: compoundingWord(t, String(values['c'])),
        }),
      },
      placard: { n: result, l: text(v, toApy ? 'placardApy' : 'placardApr') },
      table: () => ({
        caption: text(v, 'caption'),
        head: [text(v, 'compounding'), text(v, toApy ? 'labelApy' : 'labelApr')],
        rows: r.table.map(([comp, value]) => [{ text: compoundingWord(t, String(comp)) }, { text: hundredthsPercent(value, l) }]),
      }),
      summary: [
        [text(v, toApy ? 'labelApy' : 'labelApr'), result],
        ...r.table.map(([comp, value]): [string, string] => [compoundingWord(t, String(comp)), hundredthsPercent(value, l)]),
      ],
      premises: t.premises,
    };
  },
};
