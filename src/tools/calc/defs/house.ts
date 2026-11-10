// The home calculators (prompt F7, decisions 2, 5 and 6): square footage, concrete, mulch and gravel, paint, tile and the
// size of a room air conditioner, in US units only. Every field has a fixed range (DECISOES § 116 and § 258); a length
// is a measure in hundredths of a foot or of an inch, an area in hundredths of a square foot. The table of each page is
// its result (the areas, the bags, the steps of the BTU), so it shows open (CalcView.open).
import { fmt } from '../../../i18n/format.ts';
import { formatScaled, type NumberLang } from '../../../calc/parse.ts';
import {
  SHAPES,
  btu,
  concrete,
  mulch,
  paint,
  squareFootage,
  tile,
  type BtuInput,
  type BtuResult,
  type ConcreteInput,
  type ConcreteResult,
  type MulchInput,
  type MulchResult,
  type PaintInput,
  type PaintResult,
  type SquareFootageInput,
  type SquareFootageResult,
  type TileInput,
  type TileResult,
} from '../../../calc/home.ts';
import { count, csvNumber as n, fieldHead, measure, num, say, text, unitOf } from './shared.ts';
import { headed, itemPairs, itemTable, type ItemLine } from '../view.ts';
import type { CalcDef, CalcSharedTexts, Cell, CsvColumn, CsvValue, Values } from '../types.ts';

/** A measure of 2 decimals as the page writes it: 1,234.5 (trailing zeros cut) or 1,234.50 (`min` 2). */
const m2 = (value: number, l: NumberLang, min = 0): string => formatScaled(value, 2, l, { min });
const whole = (value: number, l: NumberLang): string => formatScaled(value, 0, l);
const scaled = (value: number): Cell => ({ scaled: value, decimals: 2 });
const plain = (value: string): Cell => ({ text: value });
/** A unit in the CSV's own column of units (F16, DECISOES § 688). */
const unit = (value: string): CsvValue => ({ text: value });

/** The CSV columns of an amount that mixes units: the number, then its unit (F16, DECISOES § 688). */
const amountColumns = (head: string, s: CalcSharedTexts): CsvColumn[] => [
  { head, kind: 'number' },
  { head: s.csvUnit, kind: 'text' },
];

// --- square footage -------------------------------------------------------------------------------------------------

/** One area, so the result stays above the fold on a phone (DECISOES § 268). */
export const SQUARE_FOOTAGE_EXAMPLE: Values = { a: [{ s: 0, x: 1500, y: 1200 }] };

export const squareFootageDef: CalcDef<SquareFootageInput, SquareFootageResult> = {
  id: 'square-footage-calculator',
  fields: [
    {
      kind: 'list',
      key: 'a',
      min: 1,
      max: 10,
      main: true,
      pick: { key: 's', options: SHAPES, hide: { y: [2] } },
      addBelow: true,
      item: [measure('x', 2, 1, 30_000, { half: true }), measure('y', 2, 1, 30_000, { half: true })],
      blank: { s: 0, x: 1000, y: 1000 },
    },
  ],
  initial: SQUARE_FOOTAGE_EXAMPLE,
  toInput: (values) => ({
    areas: (values['a'] as Record<string, number>[]).map((row) => ({ shape: SHAPES[row['s'] ?? 0] ?? 'rect', x: row['x'] ?? 0, y: row['y'] ?? 0 })),
  }),
  compute: squareFootage,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const rows = values['a'] as Record<string, number>[];
    const shapeName = (row: Record<string, number>) => t.options?.['s']?.[SHAPES[row['s'] ?? 0] ?? 'rect'] ?? '';
    const sizeOf = (row: Record<string, number>) =>
      (row['s'] ?? 0) === 2 ? fmt(text(v, 'diameter'), { x: m2(row['x'] ?? 0, l) }) : fmt(text(v, 'sides'), { x: m2(row['x'] ?? 0, l), y: m2(row['y'] ?? 0, l) });
    const total = m2(r.sqft, l, 2);
    return {
      hero: { label: text(v, 'label'), value: total, unit: text(v, 'unit'), sentence: say(text(v, 'sentence'), { yards: m2(r.sqyd, l, 2), n: whole(rows.length, l) }) },
      placard: { n: m2(r.sqft, l), l: text(v, 'placard') },
      open: true,
      // The CSV unfolds the size into its two measures, in feet: the length, base or diameter, and the width or height, empty
      // for a circle (F16, DECISOES § 688); the shape says which ones they are.
      table: () => ({
        caption: text(v, 'caption'),
        head: [text(v, 'colArea'), text(v, 'colShape'), text(v, 'colSize'), text(v, 'colSqft')],
        rows: r.items.map((item, index) => {
          const row = rows[index] ?? {};
          const size: Cell = { text: sizeOf(row), csv: [n(row['x'] ?? 0), (row['s'] ?? 0) === 2 ? null : n(row['y'] ?? 0)] };
          return [plain(fmt(text(v, 'row'), { n: index + 1 })), plain(shapeName(row)), size, scaled(item.sqft)];
        }),
        csv: [
          { head: text(v, 'colArea'), kind: 'text' },
          { head: text(v, 'colShape'), kind: 'text' },
          { head: headed(text(v, 'csvX'), unitOf(t, 'x')), kind: 'number' },
          { head: headed(text(v, 'csvY'), unitOf(t, 'y')), kind: 'number' },
          { head: text(v, 'colSqft'), kind: 'number' },
        ],
      }),
      summary: [
        [text(v, 'label'), `${total} ${text(v, 'unit')}`],
        [text(v, 'yards'), `${m2(r.sqyd, l, 2)} ${text(v, 'yardUnit')}`],
        [text(v, 'count'), whole(rows.length, l)],
      ],
      premises: t.premises,
    };
  },
};

// --- concrete -------------------------------------------------------------------------------------------------------

export const CONCRETE_EXAMPLE: Values = { sh: 'slab', l: 1000, w: 1000, t: 400, d: 1200, h: 3600, q: 1, wa: 10, y4: 30, y6: 45, y8: 60 };

export const concreteDef: CalcDef<ConcreteInput, ConcreteResult> = {
  id: 'concrete-calculator',
  fields: [
    { kind: 'choice', key: 'sh', options: ['slab', 'round'], main: true },
    measure('l', 2, 1, 50_000, { main: true, half: true, when: { key: 'sh', is: 'slab' } }),
    measure('w', 2, 1, 50_000, { main: true, half: true, when: { key: 'sh', is: 'slab' } }),
    measure('t', 2, 1, 6_000, { main: true, half: true, when: { key: 'sh', is: 'slab' } }),
    measure('d', 2, 1, 24_000, { main: true, half: true, when: { key: 'sh', is: 'round' } }),
    measure('h', 2, 1, 24_000, { main: true, half: true, when: { key: 'sh', is: 'round' } }),
    count('q', 1, 100, { main: true, half: true }),
    count('wa', 0, 50, { half: true }),
    measure('y4', 2, 1, 500, { half: true, example: true }),
    measure('y6', 2, 1, 500, { half: true, example: true }),
    measure('y8', 2, 1, 500, { half: true, example: true }),
  ],
  initial: CONCRETE_EXAMPLE,
  toInput: (values) => ({
    shape: values['sh'] === 'round' ? 'round' : 'slab',
    length: num(values, 'l'),
    width: num(values, 'w'),
    thickness: num(values, 't'),
    diameter: num(values, 'd'),
    depth: num(values, 'h'),
    quantity: num(values, 'q'),
    waste: num(values, 'wa'),
    y40: num(values, 'y4'),
    y60: num(values, 'y6'),
    y80: num(values, 'y8'),
  }),
  compute: concrete,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const yards = m2(r.total.cuyd, l, 2);
    return {
      hero: {
        label: text(v, 'label'),
        value: yards,
        unit: text(v, 'unit'),
        sentence: say(text(v, 'sentence'), { feet: m2(r.total.cuft, l, 2), waste: whole(num(values, 'wa'), l), bags: whole(r.bags.b80, l) }),
      },
      placard: { n: yards, l: text(v, 'placard') },
      open: true,
      // The CSV writes the bag by its weight in pounds, a number under "Bag weight (lb)", and the bags with no thousands
      // separator (F16, DECISOES § 688).
      table: () => {
        const bag = (key: string, pounds: number, yieldKey: string, bags: number): Cell[] => [
          { text: text(v, key), csv: [n(pounds, 0)] },
          scaled(num(values, yieldKey)),
          { text: whole(bags, l), csv: [n(bags, 0)] },
        ];
        return {
          caption: text(v, 'caption'),
          head: [text(v, 'colBag'), text(v, 'colYield'), text(v, 'colBags')],
          rows: [bag('bag40', 40, 'y4', r.bags.b40), bag('bag60', 60, 'y6', r.bags.b60), bag('bag80', 80, 'y8', r.bags.b80)],
          csv: [
            { head: headed(text(v, 'colWeight'), text(v, 'weightUnit')), kind: 'number' },
            { head: text(v, 'colYield'), kind: 'number' },
            { head: text(v, 'colBags'), kind: 'number' },
          ],
        };
      },
      summary: [
        [text(v, 'label'), `${yards} ${text(v, 'unit')}`],
        [text(v, 'feet'), `${m2(r.total.cuft, l, 2)} ${text(v, 'feetUnit')}`],
        [text(v, 'net'), `${m2(r.net.cuyd, l, 2)} ${text(v, 'unit')} (${m2(r.net.cuft, l, 2)} ${text(v, 'feetUnit')})`],
        [text(v, 'bag40'), whole(r.bags.b40, l)],
        [text(v, 'bag60'), whole(r.bags.b60, l)],
        [text(v, 'bag80'), whole(r.bags.b80, l)],
      ],
      premises: t.premises,
    };
  },
};

// --- mulch and gravel -----------------------------------------------------------------------------------------------

export const MULCH_EXAMPLE: Values = { m: 'mulch', mo: 'dims', l: 2000, w: 1000, ar: 20_000, de: 300, bm: 200, bg: 50, dn: 128 };

export const mulchDef: CalcDef<MulchInput, MulchResult> = {
  id: 'mulch-calculator',
  fields: [
    { kind: 'select', key: 'mo', options: ['dims', 'area'], main: true, half: true },
    measure('de', 2, 1, 3_600, { main: true, half: true }),
    measure('l', 2, 1, 50_000, { main: true, half: true, when: { key: 'mo', is: 'dims' } }),
    measure('w', 2, 1, 50_000, { main: true, half: true, when: { key: 'mo', is: 'dims' } }),
    measure('ar', 2, 1, 25_000_000, { main: true, half: true, when: { key: 'mo', is: 'area' } }),
    // The volume does not depend on the material: the material, its bag and the density of gravel come after the result
    // on a phone, so the result stays above the fold (DECISOES § 124 and § 268).
    { kind: 'choice', key: 'm', options: ['mulch', 'gravel'] },
    measure('bm', 2, 1, 1_000, { half: true, example: true, when: { key: 'm', is: 'mulch' } }),
    measure('bg', 2, 1, 1_000, { half: true, example: true, when: { key: 'm', is: 'gravel' } }),
    measure('dn', 2, 1, 500, { half: true, example: true, when: { key: 'm', is: 'gravel' } }),
  ],
  initial: MULCH_EXAMPLE,
  toInput: (values) => {
    const gravel = values['m'] === 'gravel';
    return {
      material: gravel ? 'gravel' : 'mulch',
      mode: values['mo'] === 'area' ? 'area' : 'dims',
      length: num(values, 'l'),
      width: num(values, 'w'),
      area: num(values, 'ar'),
      depth: num(values, 'de'),
      bag: num(values, gravel ? 'bg' : 'bm'),
      density: num(values, 'dn'),
    };
  },
  compute: mulch,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const gravel = values['m'] === 'gravel';
    const bagKey = gravel ? 'bg' : 'bm';
    const yards = m2(r.cuyd, l, 2);
    const bag = m2(num(values, bagKey), l);
    const sentence = say(text(v, gravel ? 'sentenceGravel' : 'sentence'), {
      feet: m2(r.cuft, l, 2),
      bags: whole(r.bags, l),
      bag,
      tons: m2(r.tons ?? 0, l, 2),
    });
    // In the CSV, a number and its unit in two columns, and the bags by their own name with the bag size in a column of its
    // own (F16, DECISOES § 688).
    const measured = (item: string, value: number, unitKey: string): ItemLine => ({ item, amount: `${m2(value, l, 2)} ${text(v, unitKey)}`, csv: [n(value), unit(text(v, unitKey))] });
    const lines: ItemLine[] = [
      measured(text(v, 'area'), r.sqft, 'areaUnit'),
      measured(text(v, 'label'), r.cuyd, 'unit'),
      measured(text(v, 'feet'), r.cuft, 'feetUnit'),
      { item: fmt(text(v, 'bags'), { bag }), amount: whole(r.bags, l), csv: [n(r.bags, 0), null, n(num(values, bagKey))], name: text(v, 'bagsName') },
      ...(gravel && r.tons !== null ? [{ item: text(v, 'tons'), amount: m2(r.tons, l, 2), csv: [n(r.tons)] }] : []),
    ];
    return {
      hero: { label: text(v, 'label'), value: yards, unit: text(v, 'unit'), sentence },
      placard: { n: yards, l: text(v, 'placard') },
      open: true,
      table: () =>
        itemTable(text(v, 'caption'), [text(v, 'colItem'), text(v, 'colAmount')], lines, [
          ...amountColumns(text(v, 'colAmount'), s),
          { head: fieldHead(t, bagKey), kind: 'number' },
        ]),
      summary: itemPairs(lines),
      premises: t.premises,
    };
  },
};

// --- paint ----------------------------------------------------------------------------------------------------------

export const PAINT_EXAMPLE: Values = { mo: 'walls', pe: 4800, he: 800, ar: 38_400, dr: 1, da: 2100, wi: 2, wn: 1500, co: 2, cv: 350 };

export const paintDef: CalcDef<PaintInput, PaintResult> = {
  id: 'paint-calculator',
  problems: ['noArea'],
  fields: [
    { kind: 'select', key: 'mo', options: ['walls', 'area'], main: true, half: true },
    count('co', 1, 3, { main: true, half: true }),
    measure('pe', 2, 100, 100_000, { main: true, half: true, when: { key: 'mo', is: 'walls' } }),
    measure('he', 2, 100, 3_000, { main: true, half: true, when: { key: 'mo', is: 'walls' } }),
    measure('ar', 2, 100, 2_000_000, { main: true, half: true, when: { key: 'mo', is: 'area' } }),
    count('cv', 100, 1_000, { half: true, example: true }),
    count('dr', 0, 50, { half: true }),
    // F13b (F7 obs 3 with the F10 p-3; DECISOES § 550): below 360 px the door area, the windows and the window area take the
    // whole row, so "Door area" and "Window area" stay on one line with their tag.
    measure('da', 2, 100, 10_000, { half: true, example: true, wide: true }),
    count('wi', 0, 100, { half: true, wide: true }),
    measure('wn', 2, 100, 10_000, { half: true, example: true, wide: true }),
  ],
  initial: PAINT_EXAMPLE,
  toInput: (values) => ({
    mode: values['mo'] === 'area' ? 'area' : 'walls',
    perimeter: num(values, 'pe'),
    height: num(values, 'he'),
    area: num(values, 'ar'),
    doors: num(values, 'dr'),
    doorArea: num(values, 'da'),
    windows: num(values, 'wi'),
    windowArea: num(values, 'wn'),
    coats: num(values, 'co'),
    coverage: num(values, 'cv'),
  }),
  compute: paint,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    // In the CSV, a number and its unit in two columns (F16, DECISOES § 688).
    const measured = (item: string, value: number, unitKey: string): ItemLine => ({ item, amount: `${m2(value, l, 2)} ${text(v, unitKey)}`, csv: [n(value), unit(text(v, unitKey))] });
    const counted = (item: string, value: number): ItemLine => ({ item, amount: whole(value, l), csv: [n(value, 0)] });
    const lines: ItemLine[] = [measured(text(v, 'wall'), r.wall, 'areaUnit'), measured(text(v, 'openings'), r.openings, 'areaUnit')];
    const head: [string, string] = [text(v, 'colItem'), text(v, 'colAmount')];
    const table = () => itemTable(text(v, 'caption'), head, lines, amountColumns(head[1], s));
    if ('error' in r) {
      return {
        hero: { label: text(v, 'label'), value: '0', unit: text(v, 'unit'), sentence: [] },
        problem: text(v, 'noArea'),
        placard: { n: '0', l: text(v, 'placard') },
        open: true,
        table,
        summary: itemPairs(lines),
        premises: t.premises,
      };
    }
    const gallons = m2(r.gallons, l, 2);
    lines.push(measured(text(v, 'paintable'), r.paintable, 'areaUnit'), counted(text(v, 'coats'), num(values, 'co')), measured(text(v, 'label'), r.gallons, 'unit'), counted(text(v, 'buy'), r.buy));
    return {
      hero: {
        label: text(v, 'label'),
        value: gallons,
        unit: text(v, 'unit'),
        sentence: say(text(v, 'sentence'), { buy: whole(r.buy, l), coats: whole(num(values, 'co'), l), area: m2(r.paintable, l, 2), coverage: whole(num(values, 'cv'), l) }),
      },
      placard: { n: whole(r.buy, l), l: text(v, 'placard') },
      open: true,
      table,
      summary: itemPairs(lines),
      premises: t.premises,
    };
  },
};

// --- tile -----------------------------------------------------------------------------------------------------------

export const TILE_EXAMPLE: Values = { ar: 12_000, wa: 10, tl: 1200, tw: 1200, pb: 10 };

export const tileDef: CalcDef<TileInput, TileResult> = {
  id: 'tile-calculator',
  fields: [
    measure('ar', 2, 1, 2_000_000, { main: true, half: true }),
    count('wa', 0, 50, { main: true, half: true }),
    measure('tl', 2, 50, 9_600, { main: true, half: true }),
    measure('tw', 2, 50, 9_600, { main: true, half: true }),
    count('pb', 0, 500, { half: true }),
  ],
  initial: TILE_EXAMPLE,
  toInput: (values) => ({ area: num(values, 'ar'), length: num(values, 'tl'), width: num(values, 'tw'), waste: num(values, 'wa'), perBox: num(values, 'pb') }),
  compute: tile,
  view(r, values, t, s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const tiles = whole(r.tiles, l);
    const size = fmt(text(v, 'size'), { x: m2(num(values, 'tl'), l), y: m2(num(values, 'tw'), l) });
    // In the CSV, the area's number and unit in two columns, the tile size in the columns of its length and width, the extra
    // as a percent, and boxes not counted as an empty cell, like the "—" of other tables (F16, DECISOES § 688).
    const lines: ItemLine[] = [
      { item: text(v, 'area'), amount: `${m2(num(values, 'ar'), l, 2)} ${text(v, 'areaUnit')}`, csv: [n(num(values, 'ar')), unit(text(v, 'areaUnit'))] },
      { item: text(v, 'tile'), amount: size, csv: [null, null, n(num(values, 'tl')), n(num(values, 'tw'))] },
      { item: text(v, 'waste'), amount: `${whole(num(values, 'wa'), l)}%`, csv: [{ scaled: num(values, 'wa'), decimals: 0, percent: true }] },
      { item: text(v, 'label'), amount: tiles, csv: [n(r.tiles, 0)] },
      { item: text(v, 'boxes'), amount: r.boxes === null ? text(v, 'noBox') : whole(r.boxes, l), csv: r.boxes === null ? [] : [n(r.boxes, 0)] },
    ];
    return {
      hero: {
        label: text(v, 'label'),
        value: tiles,
        unit: text(v, 'unit'),
        sentence: r.boxes === null ? say(text(v, 'sentenceNoBox'), { size, waste: whole(num(values, 'wa'), l) }) : say(text(v, 'sentence'), { size, waste: whole(num(values, 'wa'), l), boxes: whole(r.boxes, l), per: whole(num(values, 'pb'), l) }),
      },
      placard: { n: tiles, l: text(v, 'placard') },
      open: true,
      table: () =>
        itemTable(text(v, 'caption'), [text(v, 'colItem'), text(v, 'colAmount')], lines, [
          ...amountColumns(text(v, 'colAmount'), s),
          { head: fieldHead(t, 'tl'), kind: 'number' },
          { head: fieldHead(t, 'tw'), kind: 'number' },
        ]),
      summary: itemPairs(lines),
      premises: t.premises,
    };
  },
};

// --- BTU ------------------------------------------------------------------------------------------------------------

export const BTU_EXAMPLE: Values = { ar: 35_000, pe: 3, su: 'sun', ki: 'no' };

export const btuDef: CalcDef<BtuInput, BtuResult> = {
  id: 'btu-calculator',
  fields: [
    measure('ar', 2, 10_000, 250_000, { main: true, half: true }),
    count('pe', 1, 20, { main: true, half: true }),
    { kind: 'choice', key: 'su', options: ['normal', 'shade', 'sun'], main: true },
    // F13b (F7 f-13; DECISOES § 550): the kitchen goes after the result, so the note of the sunlight fits above the fold.
    { kind: 'select', key: 'ki', options: ['no', 'yes'], half: true },
  ],
  initial: BTU_EXAMPLE,
  toInput: (values) => ({
    area: num(values, 'ar'),
    sun: values['su'] === 'shade' ? 'shade' : values['su'] === 'sun' ? 'sun' : 'normal',
    people: num(values, 'pe'),
    kitchen: values['ki'] === 'yes',
  }),
  compute: btu,
  view(r, values, t, _s, lang) {
    const l = lang as NumberLang;
    const v = t.view;
    const total = whole(r.btu, l);
    const signed = (value: number) => (value < 0 ? `−${whole(-value, l)}` : `+${whole(value, l)}`);
    // In the CSV, every step as a number with no thousands separator, an ASCII minus and no "+" (the "+" is how the screen
    // says a step adds), and the table's area in a column of its own, so the step's name has no number (F16, DECISOES § 688).
    const step = (item: string, value: number): ItemLine => ({ item, amount: signed(value), csv: [n(value, 0)] });
    const lines: ItemLine[] = [
      { item: fmt(text(v, 'base'), { area: m2(num(values, 'ar'), l, 2) }), amount: whole(r.base, l), csv: [n(r.base, 0), n(num(values, 'ar'))], name: text(v, 'baseName') },
      step(text(v, values['su'] === 'shade' ? 'shade' : values['su'] === 'sun' ? 'sunny' : 'normal'), r.sun),
      step(text(v, 'people'), r.people),
      step(text(v, 'kitchen'), r.kitchen),
      { item: text(v, 'label'), amount: total, csv: [n(r.btu, 0)] },
    ];
    return {
      hero: { label: text(v, 'label'), value: total, unit: text(v, 'unit'), sentence: say(text(v, 'sentence'), { base: whole(r.base, l) }) },
      placard: { n: total, l: text(v, 'placard') },
      open: true,
      table: () =>
        itemTable(text(v, 'caption'), [text(v, 'colStep'), text(v, 'colBtu')], lines, [
          { head: text(v, 'colBtu'), kind: 'number' },
          { head: fieldHead(t, 'ar'), kind: 'number' },
        ]),
      summary: itemPairs(lines),
      premises: t.premises,
    };
  },
};
