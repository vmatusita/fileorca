// Rent vs buy: each path's net worth by year and the year buying catches up (prompt F4, decision 1.10).
import { fmt } from '../../../i18n/format.ts';
import { dollars, money as cash, type NumberLang } from '../../../calc/parse.ts';
import { rentVsBuy, type RentVsBuyInput, type RentVsBuyResult } from '../../../calc/rent-vs-buy.ts';
import { count, money, num, rate, say, text } from './shared.ts';
import type { CalcDef, Table } from '../types.ts';

export const rentVsBuyDef: CalcDef<RentVsBuyInput, RentVsBuyResult> = {
  id: 'rent-vs-buy-calculator',
  fields: [
    money('p', 10_000, 20_000_000, { main: true, half: true }),
    money('rent', 1, 1_000_000, { main: true, half: true }),
    money('d', 0, 20_000_000, { main: true, half: true, atMost: 'p' }),
    count('y', 1, 40, { main: true, half: true }),
    rate('r', 0, 40, { half: true, example: true }),
    count('t', 1, 40, { half: true }),
    money('tx', 0, 1_000_000, { half: true }),
    money('in', 0, 100_000, { half: true }),
    rate('mt', 0, 10, { half: true, example: true }),
    money('hoa', 0, 10_000, { half: true }),
    rate('ap', -10, 20, { half: true, example: true, negative: true }),
    rate('sc', 0, 20, { half: true, example: true }),
    rate('ri', 0, 20, { half: true, example: true }),
    rate('ret', 0, 20, { half: true, example: true }),
  ],
  initial: { p: 40_000_000, rent: 220_000, d: 8_000_000, y: 10, r: 65_000, t: 30, tx: 480_000, in: 180_000, mt: 10_000, hoa: 0, ap: 30_000, sc: 60_000, ri: 30_000, ret: 60_000 },
  toInput: (v) => ({
    price: num(v, 'p'),
    down: num(v, 'd'),
    rate: num(v, 'r'),
    termYears: num(v, 't'),
    taxYear: num(v, 'tx'),
    insuranceYear: num(v, 'in'),
    maintenanceRate: num(v, 'mt'),
    hoaMonth: num(v, 'hoa'),
    appreciationRate: num(v, 'ap'),
    sellingRate: num(v, 'sc'),
    rent: num(v, 'rent'),
    rentIncreaseRate: num(v, 'ri'),
    returnRate: num(v, 'ret'),
    years: num(v, 'y'),
  }),
  compute: rentVsBuy,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const years = num(values, 'y');
    const gap = r.buyerFinal - r.renterFinal;
    const table = (): Table => ({
      caption: text(v, 'caption'),
      head: [text(v, 'year'), text(v, 'buying'), text(v, 'renting')],
      rows: r.buyer.map((buyer, index) => [{ text: String(index + 1) }, { cents: buyer }, { cents: r.renter[index] ?? 0 }]),
    });
    const side = (net: number, paid: number, paidLabel: string): [string, string][] => [
      [fmt(text(v, 'netAfter'), { n: years }), dollars(net, l)],
      [paidLabel, dollars(paid, l)],
    ];
    return {
      hero: {
        label: text(v, 'label'),
        value: r.breakEven === null ? fmt(text(v, 'notWithin'), { n: years }) : fmt(text(v, 'yearN'), { n: r.breakEven }),
        sentence: say(text(v, 'sentence'), { years: String(years), buyer: dollars(r.buyerFinal, l), renter: dollars(r.renterFinal, l) }),
      },
      placard: { n: r.breakEven === null ? '-' : fmt(text(v, 'yearN'), { n: r.breakEven }), l: text(v, 'placard') },
      compare: {
        a: { name: text(v, 'buying'), rows: side(r.buyerFinal, r.totalOwnerCost, text(v, 'ownerCost')) },
        b: { name: text(v, 'renting'), rows: side(r.renterFinal, r.totalRent, text(v, 'rentPaid')) },
        diff: say(text(v, gap === 0 ? 'even' : gap > 0 ? 'diffBuy' : 'diffRent'), { x: dollars(Math.abs(gap), l), n: String(years) }),
      },
      table,
      summary: [
        [text(v, 'label'), r.breakEven === null ? fmt(text(v, 'notWithin'), { n: years }) : fmt(text(v, 'yearN'), { n: r.breakEven })],
        [fmt(text(v, 'buyingAfter'), { n: years }), cash(r.buyerFinal, l)],
        [fmt(text(v, 'rentingAfter'), { n: years }), cash(r.renterFinal, l)],
        [text(v, 'payment'), cash(r.payment, l)],
        [text(v, 'ownerCost'), cash(r.totalOwnerCost, l)],
        [text(v, 'rentPaid'), cash(r.totalRent, l)],
      ],
      premises: t.premises,
    };
  },
};
