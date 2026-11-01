// Personal loan, auto loan, loan amortization and the balloon preset (prompt F4, decision 1.2, 1.3, 1.6, 1.14).
import { fmt } from '../../../i18n/format.ts';
import { dollars, hundredthsPercent, money as cash, ratePercent, type NumberLang } from '../../../calc/parse.ts';
import {
  autoLoan,
  balloonLoan,
  loanAmortization,
  personalLoan,
  type AutoLoanInput,
  type AutoLoanResult,
  type BalloonInput,
  type BalloonResult,
  type LoanAmortizationInput,
  type LoanAmortizationResult,
  type PersonalLoanInput,
  type PersonalLoanResult,
} from '../../../calc/loans.ts';
import { duration, loanTable } from '../view.ts';
import { count, money, num, rate, say, text } from './shared.ts';
import type { CalcDef } from '../types.ts';

export const personalLoanDef: CalcDef<PersonalLoanInput, PersonalLoanResult> = {
  id: 'personal-loan-calculator',
  fields: [
    money('a', 100, 1_000_000, { main: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    count('m', 1, 120, { main: true, half: true }),
    rate('f', 0, 20, { example: true }),
  ],
  initial: { a: 1_500_000, r: 115_000, m: 36, f: 50_000 },
  toInput: (v) => ({ amount: num(v, 'a'), rate: num(v, 'r'), months: num(v, 'm'), feeRate: num(v, 'f') }),
  compute: personalLoan,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const sentence = [
      ...say(text(v, 'sentence'), {
        time: duration(num(values, 'm'), s),
        rate: ratePercent(num(values, 'r'), l),
        total: dollars(r.totalPaid, l),
        interest: dollars(r.totalInterest, l),
      }),
      ...(r.aprHundredths !== null ? [' ', ...say(text(v, 'apr'), { fee: cash(r.fee, l), apr: hundredthsPercent(r.aprHundredths, l) })] : []),
    ];
    return {
      hero: { label: text(v, 'label'), value: cash(r.payment, l), unit: text(v, 'unit'), sentence },
      placard: { n: dollars(r.payment, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: num(values, 'a') }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
      table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'label'), cash(r.payment, l)],
        [text(v, 'amount'), cash(num(values, 'a'), l)],
        [text(v, 'fee'), cash(r.fee, l)],
        [text(v, 'received'), cash(num(values, 'a') - r.fee, l)],
        [text(v, 'interest'), cash(r.totalInterest, l)],
        [text(v, 'cost'), cash(r.totalCost, l)],
        [text(v, 'paid'), cash(r.totalPaid, l)],
        [text(v, 'aprLabel'), r.aprHundredths !== null ? hundredthsPercent(r.aprHundredths, l) : ratePercent(num(values, 'r'), l)],
      ],
      premises: t.premises,
    };
  },
};

export const autoLoanDef: CalcDef<AutoLoanInput, AutoLoanResult> = {
  id: 'auto-loan-calculator',
  fields: [
    money('p', 500, 2_000_000, { main: true, half: true }),
    money('d', 0, 2_000_000, { main: true, half: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    count('m', 1, 120, { main: true, half: true }),
    money('ti', 0, 2_000_000),
    money('tf', 0, 500_000),
  ],
  initial: { p: 3_200_000, d: 400_000, ti: 600_000, r: 75_000, m: 60, tf: 240_000 },
  toInput: (v) => ({ price: num(v, 'p'), down: num(v, 'd'), tradeIn: num(v, 'ti'), taxesFees: num(v, 'tf'), rate: num(v, 'r'), months: num(v, 'm') }),
  compute: autoLoan,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const sentence =
      r.financed === 0
        ? say(text(v, 'nothing'), {})
        : say(text(v, 'sentence'), {
            financed: dollars(r.financed, l),
            time: duration(num(values, 'm'), s),
            rate: ratePercent(num(values, 'r'), l),
            interest: dollars(r.totalInterest, l),
            total: dollars(r.totalCost, l),
          });
    return {
      hero: { label: text(v, 'label'), value: cash(r.payment, l), unit: text(v, 'unit'), sentence },
      placard: { n: dollars(r.payment, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: r.financed }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
      table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'label'), cash(r.payment, l)],
        [text(v, 'financed'), cash(r.financed, l)],
        [text(v, 'interest'), cash(r.totalInterest, l)],
        [text(v, 'cost'), cash(r.totalCost, l)],
        [text(v, 'paid'), cash(r.totalPaid, l)],
      ],
      premises: t.premises,
    };
  },
};

export const loanAmortizationDef: CalcDef<LoanAmortizationInput, LoanAmortizationResult> = {
  id: 'loan-amortization-calculator',
  fields: [money('a', 100, 100_000_000, { main: true }), rate('r', 0, 40, { main: true, half: true, example: true }), count('t', 1, 50, { main: true, half: true })],
  initial: { a: 2_500_000, r: 70_000, t: 5 },
  toInput: (v) => ({ amount: num(v, 'a'), rate: num(v, 'r'), years: num(v, 't') }),
  compute: loanAmortization,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    return {
      hero: {
        label: text(v, 'label'),
        value: cash(r.payment, l),
        unit: text(v, 'unit'),
        sentence: say(text(v, 'sentence'), {
          time: duration(num(values, 't') * 12, s),
          rate: ratePercent(num(values, 'r'), l),
          total: dollars(r.totalPaid, l),
          interest: dollars(r.totalInterest, l),
        }),
      },
      placard: { n: dollars(r.payment, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: num(values, 'a') }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
      table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'label'), cash(r.payment, l)],
        [text(v, 'interest'), cash(r.totalInterest, l)],
        [text(v, 'paid'), cash(r.totalPaid, l)],
        [text(v, 'last'), cash(r.lastPayment, l)],
        [text(v, 'count'), fmt(text(v, 'payments'), { n: r.count })],
      ],
      premises: t.premises,
    };
  },
};

export const balloonDef: CalcDef<BalloonInput, BalloonResult> = {
  id: 'loan-amortization-calculator-balloon-payment',
  fields: [
    money('a', 100, 100_000_000, { main: true, half: true }),
    rate('r', 0, 40, { main: true, half: true, example: true }),
    count('t', 1, 40, { main: true, half: true }),
    count('bm', 1, 479, { main: true, half: true, atMost: (v) => num(v, 't') * 12 - 1 }),
  ],
  initial: { a: 20_000_000, r: 70_000, t: 30, bm: 84 },
  toInput: (v) => ({ amount: num(v, 'a'), rate: num(v, 'r'), years: num(v, 't'), balloonMonth: num(v, 'bm') }),
  compute: balloonLoan,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const month = num(values, 'bm');
    return {
      hero: {
        label: text(v, 'label'),
        value: cash(r.balloon, l),
        sentence: say(text(v, 'sentence'), {
          count: String(month - 1),
          payment: cash(r.payment, l),
          month: String(month),
          interest: dollars(r.totalInterest, l),
          time: duration(num(values, 't') * 12, s),
        }),
      },
      placard: { n: dollars(r.balloon, l), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: num(values, 'a') }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
      table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'payment'), cash(r.payment, l)],
        [text(v, 'label'), cash(r.balloon, l)],
        [text(v, 'due'), fmt(text(v, 'dueValue'), { n: month })],
        [text(v, 'lastTotal'), cash(r.lastPayment, l)],
        [text(v, 'interest'), cash(r.totalInterest, l)],
        [text(v, 'paid'), cash(r.totalPaid, l)],
      ],
      premises: t.premises,
    };
  },
};
