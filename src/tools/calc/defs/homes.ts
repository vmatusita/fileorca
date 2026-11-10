// Refinance, home affordability and the three mortgage presets: extra payments, biweekly and 15 vs 30 years
// (prompt F4, decision 1.4, 1.5, 1.11, 1.12, 1.13).
import { fmt } from '../../../i18n/format.ts';
import { dollars, money as cash, ratePercent, type NumberLang } from '../../../calc/parse.ts';
import { schedule } from '../../../calc/money.ts';
import {
  homeAffordability,
  mortgage15vs30,
  mortgageBiweekly,
  mortgageExtraPayments,
  refinance,
  type AffordabilityInput,
  type AffordabilityResult,
  type BiweeklyResult,
  type ExtraPaymentsInput,
  type ExtraPaymentsResult,
  type FifteenVsThirtyInput,
  type FifteenVsThirtyResult,
  type MortgageInput,
  type RefinanceInput,
  type RefinanceResult,
} from '../../../calc/loans.ts';
import { columns, duration, loanTable } from '../view.ts';
import { HOME_COSTS, mortgageInput } from './mortgage.ts';
import { HOME_EXAMPLE, count, downOf, homeFields, money, num, rate, say, text } from './shared.ts';
import type { CalcDef, Part, Table, Values } from '../types.ts';

/** "{x} less" or "{x} more" by the sign of a difference, from the view texts `less` and `more`. */
function lessOrMore(v: Record<string, string>, cents: number, lang: NumberLang): string {
  return fmt(text(v, cents >= 0 ? 'less' : 'more'), { x: dollars(Math.abs(cents), lang) });
}

/**
 * A count with its noun ("{n} months"), from the view text `key`; a count of exactly 1 takes `<key>One` where the texts give
 * it ("1 mes"; review of the languages adjustment, C-3). The English texts have none and write as before (PENDENCIAS F4 COR-6).
 */
function counted(v: Record<string, string>, key: string, n: number): string {
  return fmt((n === 1 ? v[`${key}One`] : undefined) ?? text(v, key), { n });
}

export const refinanceDef: CalcDef<RefinanceInput, RefinanceResult> = {
  id: 'refinance-calculator',
  fields: [
    money('b', 1_000, 20_000_000, { main: true, half: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    rate('nr', 0, 40, { main: true, half: true, example: true }),
    count('nt', 1, 40, { main: true, half: true }),
    count('ml', 1, 480),
    money('c', 0, 1_000_000),
    { kind: 'choice', key: 'cm', options: ['cash', 'loan'] },
  ],
  initial: { b: 25_000_000, r: 72_500, ml: 300, nr: 60_000, nt: 30, c: 600_000, cm: 'cash' },
  toInput: (v) => ({
    balance: num(v, 'b'),
    rate: num(v, 'r'),
    monthsLeft: num(v, 'ml'),
    newRate: num(v, 'nr'),
    newYears: num(v, 'nt'),
    costs: num(v, 'c'),
    costsMode: v['cm'] === 'loan' ? 'loan' : 'cash',
  }),
  compute: refinance,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const costs = num(values, 'c');
    const payment: Part[] = say(text(v, r.monthlySavings >= 0 ? 'lower' : 'higher'), { x: cash(Math.abs(r.monthlySavings), l) });
    const even: Part[] =
      r.breakEven === null
        ? say(text(v, 'never'), { costs: dollars(costs, l) })
        : say(text(v, 'breakEven'), { costs: dollars(costs, l), month: String(r.breakEven), time: duration(r.breakEven, s) });
    const row = (payment: number, summary: { totalInterest: number; totalPaid: number; count: number }, extra = 0): [string, string][] => [
      [text(v, 'payment'), cash(payment, l)],
      [text(v, 'interest'), dollars(summary.totalInterest, l)],
      [text(v, 'cost'), dollars(summary.totalPaid + extra, l)],
      [text(v, 'left'), duration(summary.count, s)],
    ];
    const upfront = values['cm'] === 'cash' ? costs : 0;
    return {
      hero: { label: text(v, 'label'), value: cash(r.new.payment, l), unit: text(v, 'unit'), sentence: [...payment, ' ', ...even] },
      placard: { n: dollars(r.new.payment, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: r.new.loan }, b: { label: text(v, 'interest'), cents: r.new.totalInterest } },
      compare: {
        a: { name: text(v, 'current'), rows: row(r.current.payment, r.current) },
        b: { name: text(v, 'new'), rows: row(r.new.payment, r.new, upfront) },
        diff: say(text(v, 'diff'), {
          paymentDiff: lessOrMore(v, r.monthlySavings, l),
          totalDiff: lessOrMore(v, r.costDiff, l),
        }),
      },
      table: () => loanTable(r.new.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'currentPayment'), cash(r.current.payment, l)],
        [text(v, 'label'), cash(r.new.payment, l)],
        [text(v, 'savings'), cash(r.monthlySavings, l, '-')],
        [text(v, 'breakEvenLabel'), r.breakEven === null ? text(v, 'none') : fmt(text(v, 'month'), { n: r.breakEven })],
        [text(v, 'simple'), r.simpleBreakEven === null ? text(v, 'none') : fmt(text(v, 'month'), { n: r.simpleBreakEven })],
        [text(v, 'interestDiff'), cash(r.interestDiff, l, '-')],
        [text(v, 'costDiff'), cash(r.costDiff, l, '-')],
      ],
      premises: t.premises,
    };
  },
};

export const affordabilityDef: CalcDef<AffordabilityInput, AffordabilityResult> = {
  id: 'home-affordability-calculator',
  problems: ['noRoom'],
  fields: [
    money('i', 1_000, 100_000_000, { main: true, half: true }),
    money('dt', 0, 1_000_000, { main: true, half: true }),
    money('d', 0, 100_000_000, { main: true, half: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    count('t', 1, 40, { half: true }),
    money('tx', 0, 1_000_000, { half: true }),
    money('in', 0, 100_000, { half: true }),
    money('hoa', 0, 10_000, { half: true }),
    rate('fr', 1, 100, { half: true }),
    rate('br', 1, 100, { half: true }),
  ],
  initial: { i: 9_500_000, dt: 45_000, d: 4_000_000, r: 65_000, t: 30, tx: 360_000, in: 150_000, hoa: 0, fr: 280_000, br: 360_000 },
  toInput: (v) => ({
    income: num(v, 'i'),
    debts: num(v, 'dt'),
    down: num(v, 'd'),
    rate: num(v, 'r'),
    years: num(v, 't'),
    taxYear: num(v, 'tx'),
    insuranceYear: num(v, 'in'),
    hoaMonth: num(v, 'hoa'),
    frontRatio: num(v, 'fr'),
    backRatio: num(v, 'br'),
  }),
  compute: homeAffordability,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const rows = r.noRoom ? [] : schedule(r.maxLoan, num(values, 'r'), num(values, 't') * 12, r.payment);
    const interest = rows.reduce((sum, row) => sum + row[2], 0);
    const front = ratePercent(num(values, 'fr'), l);
    const back = ratePercent(num(values, 'br'), l);
    const card = (cap: number): [string, string][] => [[text(v, 'cap'), cash(cap, l, '-')]];
    return {
      hero: {
        label: text(v, 'label'),
        value: dollars(r.maxPrice, l),
        sentence: say(text(v, 'sentence'), {
          rule: fmt(text(v, r.limit === 'front' ? 'ruleFront' : r.limit === 'back' ? 'ruleBack' : 'ruleBoth'), { front, back }),
          housing: cash(r.monthlyTotal, l),
          pi: cash(r.payment, l),
          loan: dollars(r.maxLoan, l),
        }),
      },
      ...(r.noRoom ? { problem: text(v, 'noRoom') } : {}),
      placard: { n: dollars(r.maxPrice, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: r.maxLoan }, b: { label: text(v, 'interest'), cents: interest } },
      compare: {
        a: { name: fmt(text(v, 'frontName'), { front }), rows: card(r.frontCap) },
        b: { name: fmt(text(v, 'backName'), { back }), rows: card(r.backCap) },
        diff: say(text(v, r.limit === 'front' ? 'diffFront' : r.limit === 'back' ? 'diffBack' : 'diffBoth'), {}),
      },
      table: () => loanTable(rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'label'), cash(r.maxPrice, l)],
        [text(v, 'loan'), cash(r.maxLoan, l)],
        [text(v, 'housing'), cash(r.monthlyTotal, l)],
        [text(v, 'pi'), cash(r.payment, l)],
        [fmt(text(v, 'frontName'), { front }), cash(r.frontCap, l, '-')],
        [fmt(text(v, 'backName'), { back }), cash(r.backCap, l, '-')],
      ],
      premises: t.premises,
    };
  },
};

function extraInput(v: Values): ExtraPaymentsInput {
  return { ...mortgageInput(v), extraMonthly: num(v, 'em'), extraYearly: num(v, 'ey'), extraOnce: num(v, 'eo'), extraOnceMonth: num(v, 'eom') };
}

export const extraPaymentsDef: CalcDef<ExtraPaymentsInput, ExtraPaymentsResult> = {
  id: 'mortgage-calculator-extra-payments',
  disclose: HOME_COSTS,
  fields: [
    ...homeFields().slice(0, 3),
    money('em', 0, 1_000_000, { main: true, half: true }),
    count('t', 1, 40, { half: true }),
    money('ey', 0, 10_000_000, { half: true }),
    money('eo', 0, 100_000_000, { half: true }),
    count('eom', 1, 480, { atMost: (v) => num(v, 't') * 12 }),
    ...homeFields().slice(4),
  ],
  initial: { ...HOME_EXAMPLE, em: 20_000, ey: 0, eo: 0, eom: 1 },
  toInput: extraInput,
  compute: mortgageExtraPayments,
  view(r, _values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const scenario = (summary: ExtraPaymentsResult['base']): [string, string][] => [
      [text(v, 'interest'), dollars(summary.totalInterest, l)],
      [text(v, 'paidOff'), duration(summary.count, s)],
      [text(v, 'paid'), dollars(summary.totalPaid, l)],
    ];
    return {
      hero: {
        label: text(v, 'label'),
        value: dollars(r.interestSaved, l),
        // An extra too small to end the loan a month sooner still saves interest: that sentence, not 'no extra'.
        sentence: say(text(v, r.monthsSaved > 0 ? 'sentence' : r.interestSaved > 0 ? 'sameTime' : 'same'), {
          time: duration(r.extra.count, s),
          base: duration(r.base.count, s),
          saved: duration(r.monthsSaved, s),
          interest: dollars(r.interestSaved, l),
        }),
      },
      placard: { n: dollars(r.interestSaved, l), l: text(v, 'placard') },
      more: fmt(text(v, 'moreMeta'), { extras: cash(r.monthlyTotal - r.payment, l) }),
      split: { a: { label: text(v, 'principal'), cents: r.loan }, b: { label: text(v, 'interestPart'), cents: r.extra.totalInterest } },
      compare: {
        a: { name: text(v, 'without'), rows: scenario(r.base) },
        b: { name: text(v, 'with'), rows: scenario(r.extra) },
        diff: say(text(v, 'diff'), { saved: duration(r.monthsSaved, s), interest: dollars(r.interestSaved, l) }),
      },
      table: () => loanTable(r.extra.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'pi'), cash(r.payment, l)],
        [text(v, 'monthly'), cash(r.monthlyTotal, l)],
        [text(v, 'label'), cash(r.interestSaved, l)],
        [text(v, 'monthsSaved'), counted(v, 'months', r.monthsSaved)],
        [text(v, 'paidOffWith'), counted(v, 'payments', r.extra.count)],
        [text(v, 'paidOffWithout'), counted(v, 'payments', r.base.count)],
      ],
      premises: t.premises,
    };
  },
};

export const biweeklyDef: CalcDef<MortgageInput, BiweeklyResult> = {
  id: 'mortgage-calculator-biweekly',
  fields: homeFields(),
  disclose: HOME_COSTS,
  initial: HOME_EXAMPLE,
  toInput: mortgageInput,
  compute: mortgageBiweekly,
  view(r, _values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const scenario = (payment: number, summary: BiweeklyResult['monthly'], months: number): [string, string][] => [
      [text(v, 'payment'), cash(payment, l)],
      [text(v, 'interest'), dollars(summary.totalInterest, l)],
      [text(v, 'paidOff'), duration(months, s)],
    ];
    return {
      hero: {
        label: text(v, 'label'),
        value: dollars(r.interestSaved, l),
        sentence: say(text(v, 'sentence'), {
          half: cash(r.halfPayment, l),
          payment: cash(r.payment, l),
          time: duration(r.biweeklyMonths, s),
          base: duration(r.monthly.count, s),
          interest: dollars(r.interestSaved, l),
        }),
      },
      placard: { n: dollars(r.interestSaved, l), l: text(v, 'placard') },
      more: fmt(text(v, 'moreMeta'), { extras: cash(r.monthlyTotal - r.payment, l) }),
      split: { a: { label: text(v, 'principal'), cents: r.loan }, b: { label: text(v, 'interestPart'), cents: r.biweekly.totalInterest } },
      compare: {
        a: { name: text(v, 'monthlyName'), rows: scenario(r.payment, r.monthly, r.monthly.count) },
        b: { name: text(v, 'biweeklyName'), rows: scenario(r.halfPayment, r.biweekly, r.biweeklyMonths) },
        diff: say(text(v, 'diff'), { saved: duration(r.monthsSaved, s), interest: dollars(r.interestSaved, l) }),
      },
      table: () => loanTable(r.biweekly.rows, 26, s, text(v, 'caption'), text(v, 'number')),
      summary: [
        [text(v, 'payment'), cash(r.payment, l)],
        [text(v, 'half'), cash(r.halfPayment, l)],
        [text(v, 'label'), cash(r.interestSaved, l)],
        [text(v, 'monthsSaved'), counted(v, 'months', r.monthsSaved)],
        [text(v, 'halfCount'), fmt(text(v, 'halves'), { n: r.biweekly.count })],
      ],
      premises: t.premises,
    };
  },
};

export const fifteenVsThirtyDef: CalcDef<FifteenVsThirtyInput, FifteenVsThirtyResult> = {
  id: 'mortgage-calculator-15-vs-30-year',
  fields: [...homeFields().slice(0, 2), rate('r15', 0, 40, { main: true, half: true, example: true }), rate('r30', 0, 40, { main: true, half: true, example: true })],
  initial: { p: 37_500_000, du: 'percent', d: 7_500_000, dp: 200_000, r15: 65_000, r30: 65_000 },
  toInput: (v) => ({ price: num(v, 'p'), down: downOf(v), rate15: num(v, 'r15'), rate30: num(v, 'r30') }),
  compute: mortgage15vs30,
  view(r, _values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const scenario = (term: FifteenVsThirtyResult['fifteen'], years: number): [string, string][] => [
      [text(v, 'payment'), dollars(term.payment, l)],
      [text(v, 'interest'), dollars(term.totalInterest, l)],
      [text(v, 'paidOff'), duration(years * 12, s)],
    ];
    const diff = say(text(v, 'diff'), {
      paymentDiff: fmt(text(v, r.paymentDiff >= 0 ? 'more' : 'less'), { x: dollars(Math.abs(r.paymentDiff), l) }),
      interestEffect: fmt(text(v, r.interestDiff >= 0 ? 'saves' : 'adds'), { x: dollars(Math.abs(r.interestDiff), l) }),
    });
    const head = [text(v, 'year'), text(v, 'balance15'), text(v, 'balance30')];
    const table = (): Table => ({
      caption: text(v, 'caption'),
      head,
      rows: r.thirty.yearEnd.map((balance, index) => [{ text: String(index + 1) }, { cents: r.fifteen.yearEnd[index] ?? 0 }, { cents: balance }]),
      csv: columns(head),
    });
    return {
      hero: { label: text(v, 'label'), value: cash(r.fifteen.payment, l), unit: text(v, 'unit'), sentence: diff },
      placard: { n: dollars(r.fifteen.payment, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: r.loan }, b: { label: text(v, 'interestPart'), cents: r.fifteen.totalInterest } },
      compare: { a: { name: text(v, 'thirty'), rows: scenario(r.thirty, 30) }, b: { name: text(v, 'fifteen'), rows: scenario(r.fifteen, 15) }, diff },
      table,
      summary: [
        [text(v, 'label'), cash(r.fifteen.payment, l)],
        [text(v, 'payment30'), cash(r.thirty.payment, l)],
        [text(v, 'interest15'), cash(r.fifteen.totalInterest, l)],
        [text(v, 'interest30'), cash(r.thirty.totalInterest, l)],
        [text(v, 'loan'), cash(r.loan, l)],
      ],
      premises: t.premises,
    };
  },
};
