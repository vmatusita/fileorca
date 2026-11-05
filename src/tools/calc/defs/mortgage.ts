// Mortgage: the monthly payment of a home loan, with taxes, insurance, PMI and HOA (prompt F4, decision 1.1).
import { fmt } from '../../../i18n/format.ts';
import { dollars, money as cash, ratePercent, type NumberLang } from '../../../calc/parse.ts';
import { mortgage, type MortgageInput, type MortgageResult } from '../../../calc/loans.ts';
import { duration, loanTable } from '../view.ts';
import { HOME_EXAMPLE, downOf, homeFields, num, say, text } from './shared.ts';
import type { CalcDef, Values } from '../types.ts';

export function mortgageInput(values: Values): MortgageInput {
  return {
    price: num(values, 'p'),
    down: downOf(values),
    years: num(values, 't'),
    rate: num(values, 'r'),
    taxYear: num(values, 'tx'),
    insuranceYear: num(values, 'in'),
    pmiMonth: num(values, 'pmi'),
    hoaMonth: num(values, 'hoa'),
  };
}

/** The costs of a home loan that fold into a block after the result (F13b, DECISOES § C-4). */
export const HOME_COSTS = ['tx', 'in', 'pmi', 'hoa'] as const;

export const mortgageDef: CalcDef<MortgageInput, MortgageResult> = {
  id: 'mortgage-calculator',
  fields: homeFields(),
  disclose: HOME_COSTS,
  initial: HOME_EXAMPLE,
  toInput: mortgageInput,
  compute: mortgage,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const extras = r.monthlyTotal - r.payment;
    const sentence = r.loan === 0
      ? say(text(v, 'noLoan'), { extras: cash(extras, l) })
      : [
          ...say(text(v, 'sentence'), {
            years: duration(num(values, 't') * 12, s),
            rate: ratePercent(num(values, 'r'), l),
            total: dollars(r.totalPaid, l),
            interest: dollars(r.totalInterest, l),
          }),
          ...(extras > 0 ? [' ', ...say(text(v, 'extras'), { extras: cash(extras, l) })] : []),
        ];
    return {
      hero: { label: text(v, 'label'), value: cash(r.monthlyTotal, l), unit: text(v, 'unit'), sentence },
      placard: { n: dollars(r.monthlyTotal, l), l: text(v, 'placard') },
      more: fmt(text(v, 'moreMeta'), { extras: cash(extras, l) }),
      split: { a: { label: text(v, 'principal'), cents: r.loan }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
      table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
      summary: [
        [text(v, 'label'), cash(r.monthlyTotal, l)],
        [text(v, 'pi'), cash(r.payment, l)],
        [text(v, 'taxMonth'), cash(r.taxMonth, l)],
        [text(v, 'insuranceMonth'), cash(r.insuranceMonth, l)],
        [text(v, 'pmiHoa'), cash(num(values, 'pmi') + num(values, 'hoa'), l)],
        [text(v, 'loan'), cash(r.loan, l)],
        [text(v, 'interest'), cash(r.totalInterest, l)],
        [text(v, 'paid'), cash(r.totalPaid, l)],
        [text(v, 'count'), fmt(text(v, 'payments'), { n: r.count })],
      ],
      premises: t.premises,
    };
  },
};
