// The eight calculators adapted to Brazil (prompt F6, decision 5): their fields, with fixed ranges (DECISOES § 116),
// the example each page starts with (the page-example case of scripts/oracle/calc_br.py) and what the result says.
// On a phone the main fields fit in two rows of two (DECISOES § 124); the rest comes after the result.
import { fmt } from '../../../i18n/format.ts';
import { dollars, hundredthsPercent, money as cash, ratePercent, type NumberLang } from '../../../calc/parse.ts';
import {
  brCompound,
  brDebtPayoff,
  brPersonalLoan,
  creditCard,
  earlyPayoff,
  rentOrBuy,
  sacPrice,
  vehicleLoan,
  type BrCompoundInput,
  type BrCompoundResult,
  type BrDebtPayoffInput,
  type BrPersonalLoanInput,
  type CardPlan,
  type CreditCardInput,
  type CreditCardResult,
  type CreditResult,
  type EarlyPayoffInput,
  type EarlyPayoffResult,
  type RentOrBuyInput,
  type RentOrBuyResult,
  type SacPriceInput,
  type SacPriceResult,
  type SavedPart,
  type SystemResult,
  type VehicleLoanInput,
} from '../../../calc/br.ts';
import type { DebtPayoffResult } from '../../../calc/debts.ts';
import { debtPayoffDef } from './debts.ts';
import { duration, loanTable } from '../view.ts';
import { count, downOf, money, num, rate, say, text } from './shared.ts';
import type { CalcDef, CalcPanelTexts, CalcSharedTexts, CalcView, Cell, Part, Table, Values } from '../types.ts';

const l = (lang: string): NumberLang => lang as NumberLang;

/**
 * The view of an account that cannot be done: the problem said in the hero, the rest empty. `field` is the field it points
 * to, marked in the form (F4 ACE-11; F13b, DECISOES § 545).
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

/**
 * Two or more schedules in one table, grouped by plan and loan year ("SAC · Ano 1"): the CSV and the PDF write the
 * group in the first column, and the schedule island draws each group as a year button (one table per page, F4).
 */
function plansTable(
  plans: { name: string; rows: readonly (readonly number[])[] }[],
  s: CalcSharedTexts,
  caption: string,
  extraHead?: string,
  /** Insurance and fees of every month (SAC × PRICE): in the payment, and in a column of their own (review F6, a-2; DECISOES § 252). */
  fees?: { cents: number; head: string },
): Table {
  const rows: Cell[][] = [];
  const groups: NonNullable<Table['groups']> = [];
  for (const plan of plans) {
    for (let from = 0, year = 1; from < plan.rows.length; from += 12, year += 1) {
      const to = Math.min(from + 12, plan.rows.length);
      groups.push({ label: `${plan.name} · ${fmt(s.year, { n: year })}`, end: { cents: plan.rows[to - 1]![4]! }, from: rows.length, to: rows.length + (to - from) });
      for (const row of plan.rows.slice(from, to)) {
        const extra = fees && fees.cents > 0 ? fees.cents : 0;
        const cells: Cell[] = [{ text: String(row[0]) }, { cents: row[1]! + extra }, { cents: row[3]! }, { cents: row[2]! }];
        if (extra > 0) cells.push({ cents: extra });
        cells.push({ cents: row[4]! });
        if (extraHead) cells.push({ cents: row[5] ?? 0 });
        rows.push(cells);
      }
    }
  }
  const head = [s.columns.number, s.columns.payment, s.columns.principal, s.columns.interest, ...(fees && fees.cents > 0 ? [fees.head] : []), s.columns.balance];
  return { caption, head: extraHead ? [...head, extraHead] : head, rows, groups, endColumn: head.length - 1 };
}

// --- SAC x PRICE ------------------------------------------------------------------------------------------

export function sacPriceInput(values: Values): SacPriceInput {
  return { price: num(values, 'p'), down: downOf(values), months: num(values, 'n'), rate: num(values, 'r'), tr: num(values, 'tr'), fees: num(values, 'f') };
}

export const brSacPriceDef: CalcDef<SacPriceInput, SacPriceResult> = {
  id: 'br-sac-price',
  problems: ['noLoan'],
  // The TR and the insurance and fees fold into a block after the result (F13b, DECISOES § 547).
  disclose: ['tr', 'f'],
  fields: [
    money('p', 10_000, 20_000_000, { main: true, half: true }),
    { kind: 'down', key: 'd', percentKey: 'dp', unitKey: 'du', of: 'p', max: 2_000_000_000, main: true, half: true },
    count('n', 12, 420, { main: true, half: true }),
    rate('r', 0, 30, { main: true, half: true, example: true }),
    rate('tr', 0, 2, { half: true, example: true }),
    money('f', 0, 10_000, { half: true }),
  ],
  initial: { p: 50_000_000, du: 'percent', d: 10_000_000, dp: 200_000, n: 360, r: 110_000, tr: 0, f: 15_000 },
  toInput: sacPriceInput,
  compute: sacPrice,
  view(r, values, t, s, lang) {
    const ln = l(lang);
    const v = t.view;
    const fees = num(values, 'f');
    if (r.loan === 0) return problemView(text(v, 'label'), text(v, 'noLoan'), t.premises, 'd');
    const first = (plan: SystemResult) => plan.firstPayment + fees;
    const last = (plan: SystemResult) => plan.lastPayment + fees;
    const scenario = (plan: SystemResult): [string, string][] => [
      [text(v, 'first'), cash(first(plan), ln)],
      [text(v, 'last'), cash(last(plan), ln)],
      [text(v, 'interest'), dollars(plan.totalInterest, ln)],
      [text(v, 'paid'), dollars(plan.totalWithFees, ln)],
    ];
    const diffKey = r.interestDiff > 0 ? 'priceMore' : r.interestDiff < 0 ? 'priceLess' : 'same';
    const diff = say(text(v, diffKey), { x: dollars(Math.abs(r.interestDiff), ln) });
    const tr = num(values, 'tr');
    // F13b (D-38; DECISOES § 549): the PRICE is in the card, under the Download, and the sentence says where the SAC ends and
    // how much more interest the PRICE pays; the two bars put both systems on one scale.
    const sentenceDiff = r.interestDiff > 0 ? 'sentenceMore' : r.interestDiff < 0 ? 'sentenceLess' : 'sentenceSame';
    const interests = { loan: dollars(r.loan, ln), sac: dollars(r.sac.totalInterest, ln), price: dollars(r.price.totalInterest, ln) };
    return {
      hero: {
        label: text(v, 'label'),
        value: cash(first(r.sac), ln),
        unit: text(v, 'unit'),
        sentence: [
          ...say(text(v, 'sentence'), {
            sacLast: cash(last(r.sac), ln),
            months: duration(num(values, 'n'), s),
          }),
          ' ',
          ...say(text(v, sentenceDiff), { x: dollars(Math.abs(r.interestDiff), ln) }),
          ...(tr > 0 ? [' ', ...say(text(v, 'withTr'), { tr: ratePercent(tr, ln) })] : []),
        ],
      },
      versus: say(text(v, 'versus'), { price: cash(first(r.price), ln) }),
      pair: {
        name: fmt(text(v, 'pairName'), interests),
        principal: { label: text(v, 'principal'), cents: r.loan },
        interest: say(text(v, 'pairInterest'), { sac: interests.sac, price: interests.price }),
        rows: [
          { name: text(v, 'sac'), cents: r.sac.totalInterest },
          { name: text(v, 'price'), cents: r.price.totalInterest },
        ],
      },
      placard: { n: dollars(first(r.sac), ln), l: text(v, 'placard') },
      more: fmt(text(v, 'moreMeta'), { fees: cash(fees, ln), tr: ratePercent(tr, ln) }),
      scheduleMeta: fmt(text(v, 'scheduleMeta'), { n: num(values, 'n') }),
      split: { a: { label: text(v, 'principal'), cents: r.loan }, b: { label: text(v, 'interestSac'), cents: r.sac.totalInterest } },
      compare: { a: { name: text(v, 'sac'), rows: scenario(r.sac) }, b: { name: text(v, 'price'), rows: scenario(r.price) }, diff },
      table: () =>
        plansTable([{ name: text(v, 'sac'), rows: r.sac.rows }, { name: text(v, 'price'), rows: r.price.rows }], s, text(v, 'caption'), text(v, 'correction'), {
          cents: fees,
          head: text(v, 'feesColumn'),
        }),
      summary: [
        [text(v, 'loan'), cash(r.loan, ln)],
        [`${text(v, 'sac')}: ${text(v, 'first')}`, cash(first(r.sac), ln)],
        [`${text(v, 'sac')}: ${text(v, 'last')}`, cash(last(r.sac), ln)],
        [`${text(v, 'sac')}: ${text(v, 'interest')}`, cash(r.sac.totalInterest, ln)],
        [`${text(v, 'sac')}: ${text(v, 'paid')}`, cash(r.sac.totalWithFees, ln)],
        [`${text(v, 'price')}: ${text(v, 'first')}`, cash(first(r.price), ln)],
        [`${text(v, 'price')}: ${text(v, 'last')}`, cash(last(r.price), ln)],
        [`${text(v, 'price')}: ${text(v, 'interest')}`, cash(r.price.totalInterest, ln)],
        [`${text(v, 'price')}: ${text(v, 'paid')}`, cash(r.price.totalWithFees, ln)],
        ...(tr > 0 ? ([[text(v, 'correctionTotal'), `${cash(r.sac.totalCorrection, ln)} / ${cash(r.price.totalCorrection, ln)}`]] as [string, string][]) : []),
      ],
      premises: t.premises,
    };
  },
};

// --- credit with the CET (vehicle, personal) -----------------------------------------------------------------

/**
 * The CET a year above this, in hundredths of a percent (10,000,000 %), is past what the page writes whole: costs at the
 * top of their ranges on a tiny credit gave "6.09.029.304.277.568e+,29%" (review F4-F7 h-2; DECISOES § 305).
 */
export const CET_YEAR_LIMIT = 1_000_000_000;

function creditView(r: CreditResult, values: Values, t: CalcPanelTexts, s: CalcSharedTexts, lang: string): CalcView {
  const ln = l(lang);
  const v = t.view;
  if (r.credit === 0) return problemView(text(v, 'label'), text(v, 'noLoan'), t.premises);
  if (r.released <= 0 || r.cetYear === null || r.cetMonth === null) return problemView(text(v, 'label'), text(v, 'costsTooHigh'), t.premises);
  if (r.cetYear > CET_YEAR_LIMIT) return problemView(text(v, 'label'), text(v, 'cetTooHigh'), t.premises);
  const cet = { cetYear: hundredthsPercent(r.cetYear, ln), cetMonth: hundredthsPercent(r.cetMonth, ln) };
  return {
    hero: {
      label: text(v, 'label'),
      value: cash(r.payment, ln),
      unit: text(v, 'unit'),
      sentence: say(text(v, 'sentence'), { months: duration(num(values, 'n'), s), total: dollars(r.totalPaid, ln), interest: dollars(r.totalInterest, ln), ...cet }),
    },
    placard: { n: fmt(text(v, 'cetShort'), { x: cet.cetYear }), l: text(v, 'placard') },
    split: { a: { label: text(v, 'principal'), cents: r.principal }, b: { label: text(v, 'interest'), cents: r.totalInterest } },
    table: () => loanTable(r.rows, 12, s, text(v, 'caption')),
    summary: [
      [text(v, 'label'), cash(r.payment, ln)],
      [text(v, 'cetYear'), cet.cetYear],
      [text(v, 'cetMonth'), cet.cetMonth],
      [text(v, 'financed'), cash(r.principal, ln)],
      [text(v, 'upfront'), cash(r.upfront, ln)],
      [text(v, 'released'), cash(r.released, ln)],
      [text(v, 'interest'), cash(r.totalInterest, ln)],
      [text(v, 'paid'), cash(r.totalPaid, ln)],
      [text(v, 'last'), cash(r.lastPayment, ln)],
    ],
    premises: t.premises,
  };
}

const costFields = () => [money('iof', 0, 500_000, { half: true }), money('tf', 0, 500_000, { half: true }), { kind: 'choice' as const, key: 'c', options: ['financed', 'upfront'] }];
const costsOf = (v: Values) => ({ months: num(v, 'n'), rate: num(v, 'r'), iof: num(v, 'iof'), fees: num(v, 'tf'), costs: v['c'] === 'upfront' ? ('upfront' as const) : ('financed' as const) });

export const brVehicleLoanDef: CalcDef<VehicleLoanInput, CreditResult> = {
  id: 'br-vehicle-loan',
  problems: ['noLoan', 'costsTooHigh', 'cetTooHigh'],
  fields: [
    money('p', 1_000, 5_000_000, { main: true, half: true }),
    money('e', 0, 5_000_000, { main: true, half: true, atMost: 'p' }),
    count('n', 1, 96, { main: true, half: true }),
    rate('r', 0, 15, { main: true, half: true, example: true }),
    ...costFields(),
  ],
  initial: { p: 8_000_000, e: 2_000_000, n: 48, r: 18_000, iof: 150_000, tf: 80_000, c: 'financed' },
  toInput: (v) => ({ price: num(v, 'p'), down: num(v, 'e'), ...costsOf(v) }),
  compute: vehicleLoan,
  view: creditView,
};

export const brPersonalLoanDef: CalcDef<BrPersonalLoanInput, CreditResult> = {
  id: 'br-personal-loan',
  problems: ['noLoan', 'costsTooHigh', 'cetTooHigh'],
  fields: [money('a', 100, 1_000_000, { main: true }), count('n', 1, 120, { main: true, half: true }), rate('r', 0, 20, { main: true, half: true, example: true }), ...costFields()],
  initial: { a: 1_000_000, n: 24, r: 25_000, iof: 30_000, tf: 0, c: 'financed' },
  toInput: (v) => ({ amount: num(v, 'a'), ...costsOf(v) }),
  compute: brPersonalLoan,
  view: creditView,
};

// --- early payoff -----------------------------------------------------------------------------------------

export const brEarlyPayoffDef: CalcDef<EarlyPayoffInput, EarlyPayoffResult> = {
  id: 'br-early-payoff',
  fields: [
    money('b', 1_000, 20_000_000, { main: true, half: true }),
    money('x', 0, 20_000_000, { main: true, half: true, atMost: 'b' }),
    rate('r', 0, 15, { main: true, half: true, example: true }),
    count('n', 1, 420, { main: true, half: true }),
    { kind: 'choice', key: 'sys', options: ['price', 'sac'] },
  ],
  initial: { b: 20_000_000, x: 2_000_000, r: 9_000, n: 300, sys: 'price' },
  toInput: (v) => ({ balance: num(v, 'b'), rate: num(v, 'r'), months: num(v, 'n'), system: v['sys'] === 'sac' ? 'sac' : 'price', prepay: num(v, 'x') }),
  compute: earlyPayoff,
  view(r, values, t, s, lang) {
    const ln = l(lang);
    const v = t.view;
    const sac = values['sys'] === 'sac';
    const side = (part: SavedPart, payLabel: string): [string, string][] => [
      [text(v, 'term'), duration(part.count, s)],
      [payLabel, cash(part.firstPayment, ln)],
      [text(v, 'saved'), dollars(part.interestSaved, ln)],
    ];
    const payLabel = text(v, sac ? 'firstPayment' : 'payment');
    const sentence: Part[] =
      r.left === 0
        ? say(text(v, 'payoff'), { saved: dollars(r.shorter.interestSaved, ln) })
        : num(values, 'x') === 0
          ? // Nothing prepaid: nothing changes, and the sentence says so (review F6, second pass; DECISOES § 256).
            [text(v, 'nothing')]
          : // A prepayment below one amortization does not shorten the term (review F6, g-1): the sentence says so.
            say(text(v, `${sac ? 'sentenceSac' : 'sentence'}${r.shorter.monthsSaved > 0 ? '' : 'SameTerm'}`), {
              sooner: duration(r.shorter.monthsSaved, s),
              savedShorter: dollars(r.shorter.interestSaved, ln),
              before: cash(r.base.firstPayment, ln),
              after: cash(r.lower.firstPayment, ln),
              savedLower: dollars(r.lower.interestSaved, ln),
            });
    const gap = r.shorter.interestSaved - r.lower.interestSaved;
    return {
      hero: { label: text(v, 'label'), value: cash(r.shorter.interestSaved, ln), sentence },
      placard: { n: dollars(r.shorter.interestSaved, ln), l: text(v, 'placard') },
      compare: {
        a: { name: text(v, 'shorter'), rows: side(r.shorter, payLabel) },
        b: { name: text(v, 'lower'), rows: side(r.lower, payLabel) },
        diff: say(text(v, gap > 0 ? 'diffShorter' : gap < 0 ? 'diffLower' : 'diffSame'), { x: dollars(Math.abs(gap), ln) }),
      },
      table: () =>
        plansTable(
          [
            { name: text(v, 'shorter'), rows: r.shorter.rows },
            { name: text(v, 'lower'), rows: r.lower.rows },
          ],
          s,
          text(v, 'caption'),
        ),
      summary: [
        [text(v, 'left'), cash(r.left, ln)],
        [text(v, 'baseInterest'), cash(r.base.totalInterest, ln)],
        [`${text(v, 'shorter')}: ${text(v, 'term')}`, duration(r.shorter.count, s)],
        [`${text(v, 'shorter')}: ${text(v, 'saved')}`, cash(r.shorter.interestSaved, ln)],
        [`${text(v, 'lower')}: ${payLabel}`, cash(r.lower.firstPayment, ln)],
        [`${text(v, 'lower')}: ${text(v, 'saved')}`, cash(r.lower.interestSaved, ln)],
      ],
      premises: t.premises,
    };
  },
};

// --- credit card ------------------------------------------------------------------------------------------

export const brCreditCardDef: CalcDef<CreditCardInput, CreditCardResult> = {
  id: 'br-credit-card',
  fields: [
    money('f', 10, 100_000, { main: true, half: true }),
    money('m', 0, 100_000, { main: true, half: true, atMost: 'f' }),
    rate('rr', 0, 30, { main: true, half: true, example: true }),
    rate('rp', 0, 20, { main: true, half: true, example: true }),
    count('n', 1, 48, { half: true }),
    money('iof', 0, 10_000, { half: true }),
  ],
  initial: { f: 300_000, m: 45_000, rr: 140_000, rp: 80_000, n: 12, iof: 5_000 },
  toInput: (v) => ({ bill: num(v, 'f'), minimum: num(v, 'm'), revolvingRate: num(v, 'rr'), installmentRate: num(v, 'rp'), installments: num(v, 'n'), iof: num(v, 'iof') }),
  compute: creditCard,
  view(r, _values, t, s, lang) {
    const ln = l(lang);
    const v = t.view;
    const plan = (p: CardPlan): [string, string][] => [
      [text(v, 'installment'), p.count > 0 ? fmt(text(v, 'times'), { n: p.count, x: cash(p.payment, ln) }) : cash(0, ln)],
      [text(v, 'interest'), dollars(p.totalInterest, ln)],
      [text(v, 'paid'), dollars(p.totalPaid, ln)],
    ];
    const sentenceKey = r.diff > 0 ? 'sentenceMore' : r.diff < 0 ? 'sentenceLess' : 'sentenceSame';
    const sentence: Part[] = [
      ...say(text(v, sentenceKey), { totalA: dollars(r.a.totalPaid, ln), totalB: dollars(r.b.totalPaid, ln), x: dollars(Math.abs(r.diff), ln) }),
      ...(r.a.capped || r.b.capped ? [' ', ...say(text(v, 'capped'), {})] : []),
    ];
    return {
      hero: { label: text(v, r.diff >= 0 ? 'label' : 'labelLess'), value: cash(Math.abs(r.diff), ln), sentence },
      placard: { n: dollars(Math.abs(r.diff), ln), l: text(v, 'placard') },
      split: { a: { label: text(v, 'principal'), cents: r.a.revolving }, b: { label: text(v, 'interestA'), cents: r.a.totalInterest } },
      compare: {
        a: { name: text(v, 'minimum'), rows: [[text(v, 'today'), cash(r.a.minimum, ln)], [text(v, 'revolvingInterest'), cash(r.a.revolvingInterest, ln)], ...plan(r.a)] },
        b: { name: text(v, 'now'), rows: [[text(v, 'today'), cash(0, ln)], ...plan(r.b)] },
        diff: say(text(v, 'diff'), { x: dollars(Math.abs(r.diff), ln) }),
      },
      table: () =>
        plansTable(
          [
            { name: text(v, 'minimum'), rows: r.a.rows },
            { name: text(v, 'now'), rows: r.b.rows },
          ],
          s,
          text(v, 'caption'),
        ),
      summary: [
        [`${text(v, 'minimum')}: ${text(v, 'today')}`, cash(r.a.minimum, ln)],
        [`${text(v, 'minimum')}: ${text(v, 'revolvingInterest')}`, cash(r.a.revolvingInterest, ln)],
        [`${text(v, 'minimum')}: ${text(v, 'installment')}`, r.a.count > 0 ? fmt(text(v, 'times'), { n: r.a.count, x: cash(r.a.payment, ln) }) : cash(0, ln)],
        [`${text(v, 'minimum')}: ${text(v, 'interest')}`, cash(r.a.totalInterest, ln)],
        [`${text(v, 'minimum')}: ${text(v, 'paid')}`, cash(r.a.totalPaid, ln)],
        [`${text(v, 'now')}: ${text(v, 'installment')}`, fmt(text(v, 'times'), { n: r.b.count, x: cash(r.b.payment, ln) })],
        [`${text(v, 'now')}: ${text(v, 'interest')}`, cash(r.b.totalInterest, ln)],
        [`${text(v, 'now')}: ${text(v, 'paid')}`, cash(r.b.totalPaid, ln)],
      ],
      premises: t.premises,
    };
  },
};

// --- debts ------------------------------------------------------------------------------------------------

export const brDebtPayoffDef: CalcDef<BrDebtPayoffInput, DebtPayoffResult> = {
  id: 'br-debt-payoff',
  problems: ['tooLow', 'tooLong'],
  fields: [
    money('x', 0, 1_000_000, { main: true }),
    {
      kind: 'list',
      key: 'd',
      min: 1,
      max: 10,
      blank: { b: 100_000, r: 50_000, m: 10_000 },
      item: [money('b', 1, 1_000_000), rate('r', 0, 20, { example: true }), money('m', 0, 100_000)],
    },
  ],
  initial: {
    d: [
      { b: 400_000, r: 120_000, m: 60_000 },
      { b: 150_000, r: 80_000, m: 15_000 },
      { b: 900_000, r: 30_000, m: 45_000 },
    ],
    x: 30_000,
  },
  toInput: (v) => ({ debts: (v['d'] as Record<string, number>[]).map((d) => ({ balance: d['b'] ?? 0, rate: d['r'] ?? 0, minimum: d['m'] ?? 0 })), extra: num(v, 'x') }),
  compute: brDebtPayoff,
  // The same result as the English calculator: the same view, with the Portuguese texts.
  view: debtPayoffDef.view,
};

// --- compound interest ------------------------------------------------------------------------------------

export const brCompoundDef: CalcDef<BrCompoundInput, BrCompoundResult> = {
  id: 'br-compound-interest',
  problems: ['tooLarge'],
  fields: [
    money('i', 0, 10_000_000, { main: true, half: true }),
    money('a', 0, 1_000_000, { main: true, half: true }),
    rate('ry', 0, 60, { main: true, half: true, example: true, when: { key: 'u', is: 'year' } }),
    rate('rm', 0, 5, { main: true, half: true, example: true, when: { key: 'u', is: 'month' } }),
    count('n', 1, 600, { main: true, half: true }),
    { kind: 'choice', key: 'u', options: ['year', 'month'] },
  ],
  initial: { i: 500_000, a: 50_000, ry: 100_000, rm: 8_000, u: 'year', n: 120 },
  toInput: (v) => {
    const unit = v['u'] === 'month' ? 'month' : 'year';
    return { initial: num(v, 'i'), monthly: num(v, 'a'), rate: num(v, unit === 'month' ? 'rm' : 'ry'), unit, months: num(v, 'n') };
  },
  compute: brCompound,
  view(r, values, t, s, lang) {
    const ln = l(lang);
    const v = t.view;
    if ('error' in r) return problemView(text(v, 'label'), text(v, 'tooLarge'), t.premises);
    const table = (): Table => ({
      caption: text(v, 'caption'),
      head: [text(v, 'year'), text(v, 'deposits'), text(v, 'interest'), text(v, 'balance')],
      rows: r.years.map(([year, deposits, interest, balance]) => [{ text: String(year) }, { cents: deposits }, { cents: interest }, { cents: balance }]),
    });
    return {
      hero: {
        label: text(v, 'label'),
        value: dollars(r.final, ln),
        sentence: say(text(v, 'sentence'), { months: duration(num(values, 'n'), s), deposits: dollars(r.deposits, ln), interest: dollars(r.interest, ln) }),
      },
      placard: { n: dollars(r.final, ln), l: text(v, 'placard') },
      split: { a: { label: text(v, 'deposits'), cents: r.deposits }, b: { label: text(v, 'interest'), cents: r.interest } },
      table,
      summary: [
        [text(v, 'label'), cash(r.final, ln)],
        [text(v, 'deposits'), cash(r.deposits, ln)],
        [text(v, 'interest'), cash(r.interest, ln)],
      ],
      premises: t.premises,
    };
  },
};

// --- rent or buy ------------------------------------------------------------------------------------------

export const brRentOrBuyDef: CalcDef<RentOrBuyInput, RentOrBuyResult> = {
  id: 'br-rent-or-buy',
  fields: [
    money('p', 10_000, 20_000_000, { main: true, half: true }),
    money('al', 1, 1_000_000, { main: true, half: true }),
    money('e', 0, 20_000_000, { main: true, half: true, atMost: 'p' }),
    count('y', 1, 40, { main: true, half: true }),
    { kind: 'choice', key: 'sys', options: ['sac', 'price'] },
    rate('r', 0, 30, { half: true, example: true }),
    count('n', 12, 420, { half: true }),
    rate('itbi', 0, 10, { half: true, example: true }),
    rate('cart', 0, 10, { half: true, example: true }),
    money('iptu', 0, 1_000_000, { half: true }),
    rate('man', 0, 10, { half: true, example: true }),
    rate('val', -10, 20, { half: true, example: true, negative: true }),
    rate('venda', 0, 20, { half: true, example: true }),
    rate('reaj', 0, 20, { half: true, example: true }),
    rate('rend', 0, 30, { half: true, example: true }),
  ],
  initial: { p: 50_000_000, al: 250_000, e: 10_000_000, y: 10, sys: 'sac', r: 110_000, n: 360, itbi: 30_000, cart: 10_000, iptu: 150_000, man: 10_000, val: 40_000, venda: 60_000, reaj: 50_000, rend: 90_000 },
  toInput: (v) => ({
    price: num(v, 'p'),
    down: num(v, 'e'),
    rent: num(v, 'al'),
    years: num(v, 'y'),
    system: v['sys'] === 'price' ? 'price' : 'sac',
    rate: num(v, 'r'),
    months: num(v, 'n'),
    itbiRate: num(v, 'itbi'),
    notaryRate: num(v, 'cart'),
    iptuYear: num(v, 'iptu'),
    maintenanceRate: num(v, 'man'),
    appreciationRate: num(v, 'val'),
    sellingRate: num(v, 'venda'),
    rentIncreaseRate: num(v, 'reaj'),
    returnRate: num(v, 'rend'),
  }),
  compute: rentOrBuy,
  view(r, values, t, _s, lang) {
    const ln = l(lang);
    const v = t.view;
    const years = num(values, 'y');
    const gap = r.buyerFinal - r.renterFinal;
    const table = (): Table => ({
      caption: text(v, 'caption'),
      head: [text(v, 'year'), text(v, 'buying'), text(v, 'renting')],
      rows: r.buyer.map((buyer, index) => [{ text: String(index + 1) }, { cents: buyer }, { cents: r.renter[index] ?? 0 }]),
    });
    const side = (net: number, paid: number, paidLabel: string): [string, string][] => [
      [fmt(text(v, 'netAfter'), { n: years }), dollars(net, ln)],
      [paidLabel, dollars(paid, ln)],
    ];
    const when = r.breakEven === null ? fmt(text(v, 'notWithin'), { n: years }) : fmt(text(v, 'yearN'), { n: r.breakEven });
    return {
      hero: { label: text(v, 'label'), value: when, sentence: say(text(v, 'sentence'), { years: String(years), buyer: dollars(r.buyerFinal, ln), renter: dollars(r.renterFinal, ln) }) },
      placard: { n: r.breakEven === null ? '-' : fmt(text(v, 'yearN'), { n: r.breakEven }), l: text(v, 'placard') },
      compare: {
        a: { name: text(v, 'buying'), rows: side(r.buyerFinal, r.totalOwnerCost, text(v, 'ownerCost')) },
        b: { name: text(v, 'renting'), rows: side(r.renterFinal, r.totalRent, text(v, 'rentPaid')) },
        diff: say(text(v, gap === 0 ? 'even' : gap > 0 ? 'diffBuy' : 'diffRent'), { x: dollars(Math.abs(gap), ln), n: String(years) }),
      },
      table,
      summary: [
        [text(v, 'label'), when],
        [fmt(text(v, 'buyingAfter'), { n: years }), cash(r.buyerFinal, ln)],
        [fmt(text(v, 'rentingAfter'), { n: years }), cash(r.renterFinal, ln)],
        [text(v, 'payment'), cash(r.payment, ln)],
        [text(v, 'upfront'), cash(r.upfront, ln)],
        [text(v, 'ownerCost'), cash(r.totalOwnerCost, ln)],
        [text(v, 'rentPaid'), cash(r.totalRent, ln)],
      ],
      premises: t.premises,
    };
  },
};
