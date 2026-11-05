// Credit card payoff, debt payoff (snowball and avalanche) and debt consolidation (prompt F4, decision 1.8,
// 1.9, 1.16).
import { fmt } from '../../../i18n/format.ts';
import { dollars, money as cash, ratePercent, type NumberLang } from '../../../calc/parse.ts';
import {
  creditCardPayoff,
  debtConsolidation,
  debtPayoff,
  type CardInput,
  type CardResult,
  type ConsolidationInput,
  type ConsolidationResult,
  type DebtPayoffInput,
  type DebtPayoffResult,
  type PayoffPlan,
} from '../../../calc/debts.ts';
import { duration, loanTable } from '../view.ts';
import { count, money, num, rate, say, text } from './shared.ts';
import type { CalcDef, CalcSharedTexts, CalcView, Part, Table, Values } from '../types.ts';

/**
 * The view of an account that cannot be done: the problem said in the hero, the rest empty. `field` is the field it points
 * to, marked in the form (F4 ACE-11; F13b, DECISOES § C-2).
 */
function problemView(label: string, problem: string, premises: string[], field?: string): CalcView {
  return {
    hero: { label, value: '-', sentence: [] },
    problem,
    ...(field ? { problemField: field } : {}),
    placard: { n: '-', l: label },
    table: () => ({ caption: label, head: [label], rows: [] }),
    summary: [[label, problem]],
    premises,
  };
}

export const creditCardDef: CalcDef<CardInput, CardResult> = {
  id: 'credit-card-payoff-calculator',
  fields: [
    money('b', 1, 1_000_000, { main: true, half: true }),
    rate('r', 0, 60, { main: true, half: true, example: true }),
    { kind: 'select', key: 'md', options: ['payment', 'months'], main: true, half: true },
    money('pay', 1, 1_000_000, { main: true, half: true, when: { key: 'md', is: 'payment' } }),
    count('m', 1, 600, { main: true, half: true, when: { key: 'md', is: 'months' } }),
  ],
  initial: { b: 650_000, r: 229_900, md: 'payment', pay: 25_000, m: 24 },
  toInput: (v) =>
    v['md'] === 'months'
      ? { balance: num(v, 'b'), apr: num(v, 'r'), mode: 'months', months: num(v, 'm') }
      : { balance: num(v, 'b'), apr: num(v, 'r'), mode: 'payment', payment: num(v, 'pay') },
  compute: creditCardPayoff,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    if ('error' in r) {
      const problem =
        r.error === 'too-low'
          ? fmt(text(v, 'tooLow'), { payment: cash(num(values, 'pay'), l), minimum: cash(r.minimum, l) })
          : fmt(text(v, 'tooLong'), { payment: cash(num(values, 'pay'), l) });
      return problemView(text(v, 'labelTime'), problem, t.premises, 'pay');
    }
    const byPayment = values['md'] !== 'months';
    const facts = { payment: cash(r.payment, l), balance: dollars(num(values, 'b'), l), interest: dollars(r.totalInterest, l), time: duration(r.months, s), count: String(r.months) };
    return {
      hero: byPayment
        ? { label: text(v, 'labelTime'), value: duration(r.months, s), sentence: say(text(v, 'sentencePayment'), facts) }
        : { label: text(v, 'labelPayment'), value: cash(r.payment, l), unit: text(v, 'unit'), sentence: say(text(v, 'sentenceMonths'), facts) },
      placard: byPayment ? { n: String(r.months), l: text(v, 'placardMonths') } : { n: dollars(r.payment, l), l: text(v, 'placardPayment') },
      split: { a: { label: text(v, 'principal'), cents: num(values, 'b') }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
      table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'labelPayment'), cash(r.payment, l)],
        [text(v, 'labelTime'), duration(r.months, s)],
        [text(v, 'interest'), cash(r.totalInterest, l)],
        [text(v, 'paid'), cash(r.totalPaid, l)],
        [text(v, 'last'), cash(r.lastPayment, l)],
      ],
      premises: t.premises,
    };
  },
};

const DEBT_ITEM = { b: 0, r: 0, m: 0 };

function debtsOf(values: Values): Record<string, number>[] {
  return values['d'] as Record<string, number>[];
}

function orderText(plan: PayoffPlan, s: CalcSharedTexts): string {
  return plan.payoffOrder.map((index) => fmt(s.row, { n: index + 1 })).join(', ');
}

export const debtPayoffDef: CalcDef<DebtPayoffInput, DebtPayoffResult> = {
  id: 'debt-payoff-calculator',
  fields: [
    money('x', 0, 1_000_000, { main: true }),
    { kind: 'list', key: 'd', min: 1, max: 10, blank: { ...DEBT_ITEM, b: 100_000, r: 200_000, m: 2_500 }, item: [money('b', 1, 1_000_000), rate('r', 0, 60, { example: true }), money('m', 0, 100_000)] },
  ],
  initial: {
    d: [
      { b: 480_000, r: 249_900, m: 12_000 },
      { b: 120_000, r: 199_900, m: 3_500 },
      { b: 950_000, r: 79_000, m: 26_000 },
      { b: 360_000, r: 115_000, m: 11_000 },
    ],
    x: 20_000,
  },
  toInput: (v) => ({ debts: debtsOf(v).map((d) => ({ balance: d['b'] ?? 0, apr: d['r'] ?? 0, minimum: d['m'] ?? 0 })), extra: num(v, 'x') }),
  compute: debtPayoff,
  view(r, _values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    if ('error' in r) {
      const problem =
        r.error === 'too-low'
          ? fmt(text(v, 'tooLow'), { budget: cash(r.budget, l), minimum: cash(r.minimum, l) })
          : fmt(text(v, 'tooLong'), { budget: cash(r.budget, l) });
      return problemView(text(v, 'label'), problem, t.premises, 'x');
    }
    const plan = (p: PayoffPlan): [string, string][] => [
      [text(v, 'free'), duration(p.months, s)],
      [text(v, 'interest'), dollars(p.totalInterest, l)],
      [text(v, 'order'), orderText(p, s)],
    ];
    const interestPart = r.interestDiff === 0 ? text(v, 'sameInterest') : fmt(text(v, r.interestDiff > 0 ? 'lessInterest' : 'moreInterest'), { x: dollars(Math.abs(r.interestDiff), l) });
    const timePart = r.monthsDiff === 0 ? text(v, 'sameTime') : fmt(text(v, r.monthsDiff > 0 ? 'sooner' : 'later'), { x: duration(Math.abs(r.monthsDiff), s) });
    const diff: Part[] = say(text(v, 'diff'), { interestPart, timePart });
    const table = (): Table => ({
      caption: text(v, 'caption'),
      head: [text(v, 'year'), text(v, 'snowball'), text(v, 'avalanche')],
      rows: Array.from({ length: Math.max(r.snowball.yearEnd.length, r.avalanche.yearEnd.length) }, (_, index) => [
        { text: String(index + 1) },
        { cents: r.snowball.yearEnd[index] ?? 0 },
        { cents: r.avalanche.yearEnd[index] ?? 0 },
      ]),
    });
    return {
      hero: {
        label: text(v, 'label'),
        value: cash(r.budget, l),
        unit: text(v, 'unit'),
        sentence: say(text(v, 'sentence'), {
          snow: duration(r.snowball.months, s),
          snowInterest: dollars(r.snowball.totalInterest, l),
          aval: duration(r.avalanche.months, s),
          avalInterest: dollars(r.avalanche.totalInterest, l),
        }),
      },
      placard: { n: dollars(r.budget, l), l: text(v, 'placard') },
      compare: { a: { name: text(v, 'snowball'), rows: plan(r.snowball) }, b: { name: text(v, 'avalanche'), rows: plan(r.avalanche) }, diff },
      table,
      summary: [
        [text(v, 'label'), cash(r.budget, l)],
        [`${text(v, 'snowball')}: ${text(v, 'free')}`, duration(r.snowball.months, s)],
        [`${text(v, 'snowball')}: ${text(v, 'interest')}`, cash(r.snowball.totalInterest, l)],
        [`${text(v, 'snowball')}: ${text(v, 'order')}`, orderText(r.snowball, s)],
        [`${text(v, 'avalanche')}: ${text(v, 'free')}`, duration(r.avalanche.months, s)],
        [`${text(v, 'avalanche')}: ${text(v, 'interest')}`, cash(r.avalanche.totalInterest, l)],
        [`${text(v, 'avalanche')}: ${text(v, 'order')}`, orderText(r.avalanche, s)],
      ],
      premises: t.premises,
    };
  },
};

export const consolidationDef: CalcDef<ConsolidationInput, ConsolidationResult> = {
  id: 'debt-consolidation-calculator',
  fields: [
    rate('nr', 0, 40, { main: true, half: true, example: true }),
    count('nm', 1, 120, { main: true, half: true }),
    { kind: 'list', key: 'd', min: 1, max: 10, blank: { b: 100_000, r: 200_000, p: 5_000 }, item: [money('b', 1, 1_000_000), rate('r', 0, 60, { example: true }), money('p', 1, 100_000)] },
    rate('f', 0, 20, { example: true }),
  ],
  initial: {
    d: [
      { b: 520_000, r: 249_900, p: 18_000 },
      { b: 310_000, r: 199_900, p: 11_000 },
      { b: 170_000, r: 279_900, p: 6_500 },
    ],
    nr: 125_000,
    nm: 48,
    f: 40_000,
  },
  toInput: (v) => ({
    debts: debtsOf(v).map((d) => ({ balance: d['b'] ?? 0, apr: d['r'] ?? 0, payment: d['p'] ?? 0 })),
    newRate: num(v, 'nr'),
    newMonths: num(v, 'nm'),
    feeRate: num(v, 'f'),
  }),
  compute: debtConsolidation,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    if ('error' in r) {
      const problem = fmt(text(v, r.error === 'too-low' ? 'tooLow' : 'tooLong'), {
        n: r.debt + 1,
        minimum: r.error === 'too-low' ? cash(r.minimum, l) : '',
      });
      return problemView(text(v, 'label'), problem, t.premises, `d${r.debt}p`);
    }
    const side = (payment: number, interest: number, paid: number, months: number): [string, string][] => [
      [text(v, 'payment'), dollars(payment, l)],
      [text(v, 'interest'), dollars(interest, l)],
      [text(v, 'paid'), dollars(paid, l)],
      [text(v, 'free'), duration(months, s)],
    ];
    const lessMore = (cents: number) => fmt(text(v, cents >= 0 ? 'less' : 'more'), { x: dollars(Math.abs(cents), l) });
    return {
      hero: {
        label: text(v, 'label'),
        value: cash(r.new.payment, l),
        unit: text(v, 'unit'),
        sentence: say(text(v, 'sentence'), {
          loan: dollars(r.new.loan, l),
          fee: dollars(r.new.fee, l),
          rate: ratePercent(num(values, 'nr'), l),
          time: duration(num(values, 'nm'), s),
          interest: dollars(r.new.totalInterest + r.new.fee, l),
          current: dollars(r.current.totalInterest, l),
        }),
      },
      placard: { n: dollars(r.new.payment, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: r.new.loan }, b: { label: text(v, 'interestPart'), cents: r.new.totalInterest } },
      compare: {
        a: { name: text(v, 'now'), rows: side(r.current.payment, r.current.totalInterest, r.current.totalPaid, r.current.months) },
        b: { name: text(v, 'loan'), rows: side(r.new.payment, r.new.totalInterest + r.new.fee, r.new.totalPaid, r.new.count) },
        diff: say(text(v, 'diff'), { paymentDiff: lessMore(r.paymentDiff), totalDiff: lessMore(r.costDiff) }),
      },
      table: () => loanTable(r.new.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'label'), cash(r.new.payment, l)],
        [text(v, 'currentPayment'), cash(r.current.payment, l)],
        [text(v, 'loanAmount'), cash(r.new.loan, l)],
        [text(v, 'feeLabel'), cash(r.new.fee, l)],
        [text(v, 'newInterest'), cash(r.new.totalInterest, l)],
        [text(v, 'currentInterest'), cash(r.current.totalInterest, l)],
        [text(v, 'costDiff'), cash(r.costDiff, l, '-')],
      ],
      premises: t.premises,
    };
  },
};
