// The PDF of a calculator (prompt F4, decision 7): built in Node by the same function the PDF worker runs,
// it passes strictPdf, carries no date and no title in its Info dictionary, and its content streams, inflated
// here, draw the calculator's name, the total, the whole schedule down to the last payment, the notice and the
// site address, with nothing drawn as "?" (the standard fonts only encode WinAnsi).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { buildReport, columnLayout, winAnsi } from '../../src/engine/pdf/report.ts';
import { CALC_PAGE_IDS, ES_CALC_IDS, LIFE_CALC_IDS, type AnyCalcId, type LifeCalcId } from '../../src/tools/calc/registry.ts';
import type { Values } from '../../src/tools/calc/types.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { viewOf } from '../../src/tools/calc/store.ts';
import { reportInput } from '../../src/tools/calc/exports.ts';
import { cellText, inputRows } from '../../src/tools/calc/view.ts';
import { parsePdf, strictPdf } from '../e2e/lib/pdf.ts';
import { pdfTextLines } from '../e2e/lib/pdf-text.ts';
import { readWithPdfjs } from '../e2e/lib/pdfjs-read.ts';

async function mortgagePdf() {
  const def = DEFS['mortgage-calculator'];
  const data = panelData('mortgage-calculator', 'en');
  const view = viewOf(def, data, def.initial);
  const input = reportInput(
    { title: data.name, inputs: inputRows(def.fields, def.initial, data), results: view.summary, premises: view.premises, table: view.table(), notice: data.notice, cell: cellText('en') },
    data.t,
  );
  return { input, bytes: await buildReport(input) };
}

describe('the calculator PDF', () => {
  it('is a strict PDF with only Producer and Creator in its Info', async () => {
    const { bytes } = await mortgagePdf();
    const strict = await strictPdf(bytes);
    expect(strict.problems).toEqual([]);
    expect(strict.pageCount).toBeGreaterThan(5);
    const info = parsePdf(bytes).info;
    expect(info).toEqual({ Producer: 'FileOrca', Creator: 'FileOrca' });
  });

  it('draws the name, the total, the whole schedule to the last payment, the notice and the address', async () => {
    const { input, bytes } = await mortgagePdf();
    const lines = pdfTextLines(bytes);
    expect(lines).toContain('Mortgage calculator');
    expect(lines).toContain('$2,396.20');
    expect(lines).toContain('$382,636.71');
    // The last row of the schedule: payment 360, $1,900.91 that closes the balance to $0.00.
    const last = input.table.rows.at(-1);
    expect(last?.slice(0, 2)).toEqual(['Year 30', '360']);
    for (const cell of last ?? []) expect(lines, cell).toContain(cell);
    expect(lines).toContain('$1,900.91');
    expect(lines.filter((line) => /^\d+$/.test(line)).map(Number)).toEqual(expect.arrayContaining([1, 12, 13, 359, 360]));
    expect(lines).toContain('Made with the free calculators at fileorca.com');
    expect(lines.join(' ')).toContain('educational tool');
    expect(lines.join('')).not.toContain('?');
  });

  it('keeps every string inside WinAnsi', () => {
    expect(winAnsi('−$1,234.56 a b ‘q’ “d” … ×')).toBe('-$1,234.56 a b \'q\' "d" ... x');
    expect(winAnsi('Price · 20%')).toBe('Price · 20%');
    // F7: the circle of the home calculators prints "pi"; the squares and the division sign are WinAnsi and stay.
    expect(winAnsi('π × diameter² ÷ 4')).toBe('pi x diameter² ÷ 4');
    // What WinAnsi has no glyph for is dropped, never drawn as "?": the F7 texts must not use these.
    expect(winAnsi('a ≥ b ≤ c ≈ d')).toBe('a  b  c  d');
    expect(winAnsi('arrow → emoji \u{1F600}')).toBe('arrow  emoji ');
  });
});

// F7 (decision 11): the PDF of a home calculator and of a health calculator, built in Node as the island builds it (the
// open table is the result), read back against the oracle: the values of the fixtures in fixtures/calc/, formatted here, never
// taken from the engine. Letter, only Producer and Creator in the Info, the results, the table, the assumptions, the notice,
// and nothing drawn as "?" (a character outside WinAnsi prints as nothing: π has to come out as "pi").
describe('the PDF of the home and health calculators (F7)', () => {
  interface Case {
    id: string;
    input: Record<string, unknown>;
    expected: Record<string, unknown>;
  }
  const fixture = (id: LifeCalcId, caseId: string): Case => {
    const file = JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: Case[] };
    const found = file.cases.find((entry) => entry.id === caseId);
    if (!found) throw new Error(`${id}: no case ${caseId}`);
    return found;
  };
  /** A scaled integer of the oracle as the English page writes it: 4165842 with 2 decimals is "41,658.42". */
  const scaled = (value: number, decimals: number): string => {
    const [whole = '', fraction] = (value / 10 ** decimals).toFixed(decimals).split('.');
    return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction ? `.${fraction}` : ''}`;
  };
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  /** A day of the oracle ("2024-02-29") as the English page writes it ("February 29, 2024"), written here apart from src/. */
  const longDay = (iso: string): string => {
    const [year, month, day] = iso.split('-').map(Number);
    return `${MONTHS[(month ?? 1) - 1]} ${day}, ${year}`;
  };
  /** What WinAnsi draws, plus what winAnsi() maps (the minus, the dashes, the curly quotes, the ellipsis, ×, π and the spaces). */
  const DRAWABLE = /^[\x20-\x7e¡-ÿ−–—‘’“”…×π   ]*$/;

  async function lifePdf(id: LifeCalcId, values: Values) {
    const def = DEFS[id];
    const data = panelData(id, 'en');
    const view = viewOf(def, data, values);
    expect(view.problem, id).toBeUndefined();
    const input = reportInput(
      {
        title: data.name,
        inputs: inputRows(def.fields, values, data),
        results: view.summary,
        premises: view.premises,
        table: view.table(),
        tableHeading: data.texts.view['scheduleHeading'],
        notice: data.notice,
        cell: cellText('en'),
      },
      data.t,
      'en',
    );
    const bytes = await buildReport(input);
    return { input, bytes, lines: pdfTextLines(bytes), data };
  }

  /** What every F7 PDF has: strict, Letter, the bare Info, every text of the report drawn, nothing outside WinAnsi. */
  async function common(report: Awaited<ReturnType<typeof lifePdf>>) {
    const { input, bytes, lines, data } = report;
    const strict = await strictPdf(bytes);
    expect(strict.problems).toEqual([]);
    expect(parsePdf(bytes).info).toEqual({ Producer: 'FileOrca', Creator: 'FileOrca' });
    const doc = await PDFDocument.load(bytes);
    for (const page of doc.getPages()) expect(page.getSize()).toEqual({ width: 612, height: 792 });
    expect(input.paper).toBeUndefined();
    const text = lines.join(' ');
    expect(lines).toContain(input.title);
    for (const [label, value] of [...input.inputs, ...input.results]) {
      expect(text, label).toContain(winAnsi(label));
      expect(text, `${label}: ${value}`).toContain(winAnsi(value));
    }
    for (const cell of [...input.table.head, ...input.table.rows.flat()]) expect(lines, cell).toContain(winAnsi(cell));
    for (const premise of input.premises) expect(text, premise).toContain(winAnsi(premise));
    expect(text).toContain(winAnsi(data.notice));
    expect(lines).toContain('Made with the free calculators at fileorca.com');
    expect(lines).toContain('Educational tool');
    // Nothing drawn as "?", and no string of the report needs a glyph WinAnsi lacks ("≥", "≤" and "≈" have none).
    expect(lines.join('')).not.toContain('?');
    const strings = [input.title, ...input.inputs.flat(), ...input.results.flat(), ...input.premises, ...input.table.head, ...input.table.rows.flat(), input.notice];
    for (const value of strings) expect(value, value).toMatch(DRAWABLE);
    expect(strings.join(' ')).not.toMatch(/[≥≤≈]/);
  }

  it('draws the square footage of a circle, two triangles and a rectangle with the areas of the oracle, and "pi" for π', async () => {
    const found = fixture('square-footage-calculator', 'random-001');
    const areas = found.input['areas'] as { shape: 'rect' | 'triangle' | 'circle'; x: number; y: number }[];
    expect(areas.map((area) => area.shape)).toEqual(['circle', 'triangle', 'rect', 'triangle']);
    const values: Values = { a: areas.map((area) => ({ s: ['rect', 'triangle', 'circle'].indexOf(area.shape), x: area.x, y: area.y })) };
    const report = await lifePdf('square-footage-calculator', values);
    await common(report);
    const { input, lines } = report;
    const expected = found.expected as { items: { sqft: number }[]; sqft: number; sqyd: number };
    // The open table: one row per area, with the square feet of the oracle; the total and the square yards in the results.
    expect(input.table.rows.map((row) => row.at(-1))).toEqual(expected.items.map((item) => scaled(item.sqft, 2)));
    expect(input.table.rows.map((row) => row[1])).toEqual(['Circle', 'Triangle', 'Rectangle', 'Triangle']);
    for (const item of expected.items) expect(lines, String(item.sqft)).toContain(scaled(item.sqft, 2));
    expect(lines).toContain(`${scaled(expected.sqft, 2)} sq ft`);
    expect(lines).toContain(`${scaled(expected.sqyd, 2)} sq yd`);
    expect(scaled(expected.sqft, 2)).toBe('41,658.42');
    // π reaches the PDF only through the premise of the circle, and prints as "pi".
    expect(lines.join(' ')).toContain('a circle is pi x diameter² ÷ 4');
    expect(lines.join('')).not.toContain('π');
  });

  it('draws the due date, the trimesters and the weeks along on a leap day, with the dates of the oracle', async () => {
    const found = fixture('due-date-calculator', 'grid-012');
    expect(found.input).toEqual({ method: 'lmp', date: '2023-05-25', today: '2023-05-31' });
    const report = await lifePdf('due-date-calculator', { m: String(found.input['method']), d: String(found.input['date']), today: String(found.input['today']) });
    await common(report);
    const { input, lines } = report;
    const expected = found.expected as { due: string; trimesters: string[]; fullTerm: string; age: { weeks: number; days: number } };
    expect(longDay(expected.due)).toBe('February 29, 2024');
    // The table of milestones: the three trimesters, full term and the due date, in that order.
    expect(input.table.rows.map((row) => row[1])).toEqual([...expected.trimesters, expected.fullTerm, expected.due].map(longDay));
    for (const day of [...expected.trimesters, expected.fullTerm, expected.due]) expect(lines, day).toContain(longDay(day));
    const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
    expect(lines.join(' ')).toContain(`Today the pregnancy is ${plural(expected.age.weeks, 'week')} and ${plural(expected.age.days, 'day')} along.`);
    // What was entered: the method and the day, written out; the day of "today" is not a field and is not listed.
    expect(input.inputs).toEqual([
      ['Count from', 'Last period'],
      ['Date', longDay('2023-05-25')],
    ]);
    // The notice of a health page: not medical advice.
    expect(lines.join(' ')).toContain('not medical advice');
  });

  it('draws the BMI and the CDC category of the oracle, in US and in metric units, with the CDC table', async () => {
    for (const caseId of ['cdc-5-ft-8-in-200-lb', 'page-example-metric']) {
      const found = fixture('bmi-calculator', caseId);
      const body = found.input as { unit: string; feet: number; inches: number; pounds: number; cm: number; kg: number };
      const report = await lifePdf('bmi-calculator', { u: body.unit, ft: body.feet, in: body.inches, lb: body.pounds, cm: body.cm, kg: body.kg, ag: 35 });
      await common(report);
      const { input, lines, data } = report;
      const expected = found.expected as { bmi: number; category: string };
      const category = data.texts.view[`cat-${expected.category}`] ?? '';
      expect(category, caseId).not.toBe('');
      expect(input.results, caseId).toEqual([
        ['Your BMI', scaled(expected.bmi, 1)],
        ['CDC category', category],
      ]);
      expect(lines, caseId).toContain(scaled(expected.bmi, 1));
      expect(lines, caseId).toContain(category);
      // The table is the six CDC categories with their ranges, in words, never only a colour, and the BMI of the oracle in
      // the row of its category alone.
      expect(input.table.rows, caseId).toHaveLength(6);
      expect(input.table.rows.filter((row) => row.at(-1) !== '').map((row) => [row[0], row.at(-1)]), caseId).toEqual([[category, scaled(expected.bmi, 1)]]);
      expect(lines.join(' '), caseId).toContain('not medical advice');
    }
    expect(scaled(fixture('bmi-calculator', 'cdc-5-ft-8-in-200-lb').expected['bmi'] as number, 1)).toBe('30.4');
  });
});

// Second pass of the review F6 (DECISOES § 255): the column of insurance and fees took the SAC × PRICE table to 8 columns in
// A4, and its texts ran into each other. The layout gives a table whose texts overflow their share columns as wide as their
// text (and a smaller type); every table whose texts fit keeps the even layout, so the English and Spanish PDFs keep their bytes.
// The review F4-F7 (h-3; DECISOES § 305): with ten debts the payoff order of the debt calculators in Portuguese and
// Spanish is longer than its line, and it was drawn over its label. Read back by PDF.js, every label of the summary is
// clear of the value on its line (a value that does not fit goes under it).
describe('the summary of the calculator PDF', () => {
  it('keeps every label clear of its value with ten debts, in Portuguese and in Spanish', async () => {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    for (const [id, lang] of [['br-debt-payoff', 'pt'], ['debt-payoff-calculator', 'es'], ['debt-payoff-calculator', 'en']] as const) {
      const def = DEFS[id];
      const list = def.fields.find((field) => field.kind === 'list' && field.key === 'd') as { blank: Record<string, number> } | undefined;
      expect(list, id).toBeDefined();
      // Ten debts and an extra that covers their interest, so the plan (and its payoff order) is made.
      const values = { ...def.initial, x: 500_000, d: Array.from({ length: 10 }, (_, index) => ({ ...list?.blank, b: 100_000 * (index + 1) })) } as Values;
      const data = panelData(id, lang);
      const view = viewOf(def, data, values);
      const input = reportInput(
        { title: data.name, inputs: inputRows(def.fields, values, data), results: view.summary, premises: view.premises, table: view.table(), notice: data.notice, cell: cellText(lang) },
        data.t,
      );
      const read = await readWithPdfjs(await buildReport(input));
      const texts = read.pages.flatMap((page, n) => page.texts.map((text) => ({ ...text, n })));
      const labels = new Set(view.summary.map(([label]) => winAnsi(label)));
      let checked = 0;
      for (const text of texts.filter((item) => labels.has(item.str))) {
        const end = text.x + regular.widthOfTextAtSize(text.str, 10);
        for (const other of texts) {
          if (other === text || other.str.trim() === '' || other.n !== text.n || Math.abs(other.y - text.y) > 1 || other.x < text.x) continue;
          expect(other.x, `${id} ${lang}: "${other.str}" after "${text.str}"`).toBeGreaterThan(end + 6);
        }
        checked += 1;
      }
      expect(checked, `${id} ${lang}`).toBeGreaterThan(5);
    }
  });
});

describe('the columns of the calculator PDF', () => {
  const tableOf = (id: AnyCalcId, lang: 'en' | 'es' | 'pt') => {
    const def = DEFS[id];
    const data = panelData(id, lang);
    const view = viewOf(def, data, def.initial);
    const table = view.table();
    const cell = cellText(lang);
    const head = table.groups ? [data.t.year.replace(/\s*\{n\}/, ''), ...table.head] : [...table.head];
    const rows = table.groups
      ? table.groups.flatMap((group) => table.rows.slice(group.from, group.to).map((cells) => [group.label, ...cells.map(cell)]))
      : table.rows.map((cells) => cells.map(cell));
    return { head, rows };
  };
  const fontsOf = async () => {
    const doc = await PDFDocument.create();
    return { regular: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  };

  it('keeps the even layout for every English and Spanish calculator', async () => {
    const fonts = await fontsOf();
    const width = 612 - 96;
    for (const [id, lang] of [...CALC_PAGE_IDS.map((id) => [id, 'en'] as const), ...ES_CALC_IDS.map((id) => [id, 'es'] as const)]) {
      const { head, rows } = tableOf(id, lang);
      if (rows.length === 0) continue;
      const layout = columnLayout(48, width, head, rows, fonts);
      const first = width * 0.2;
      const rest = (width - first) / Math.max(1, head.length - 1);
      expect(layout.size, `${id} ${lang}`).toBe(8.5);
      for (let index = 1; index < head.length; index += 1) expect(layout.rightOf(index), `${id} ${lang}`).toBe(48 + first + rest * index);
    }
  });

  // F7 (decision 11): the open table of each of the 11 home and health calculators, which is their result, in Letter. Every
  // text stays clear of its neighbours and inside the 516 pt, at the body size of the tables, whether the table keeps the even
  // layout of the money tables or, like the ovulation calendar with its dates, gets the columns as wide as its texts (§ 255).
  it('keeps every text of the open table of each home and health calculator clear of its neighbours in Letter', async () => {
    const fonts = await fontsOf();
    const width = 612 - 96;
    expect(LIFE_CALC_IDS).toHaveLength(11);
    for (const id of LIFE_CALC_IDS) {
      const { head, rows } = tableOf(id, 'en');
      expect(rows.length, id).toBeGreaterThan(0);
      const { rightOf, size } = columnLayout(48, width, head, rows, fonts);
      expect(size, id).toBe(8.5);
      for (const [line, font] of [[head, fonts.bold], ...rows.map((cells) => [cells, fonts.regular] as const)] as const) {
        let end = 48 + font.widthOfTextAtSize(winAnsi(line[0] ?? ''), size);
        for (let index = 1; index < line.length; index += 1) {
          const start = rightOf(index) - font.widthOfTextAtSize(winAnsi(line[index] ?? ''), size);
          expect(start, `${id}: "${line[index]}" after "${line[index - 1]}"`).toBeGreaterThan(end);
          end = rightOf(index);
        }
        expect(end, id).toBeLessThanOrEqual(48 + width + 0.01);
      }
    }
  });

  it('keeps every text of the SAC × PRICE table in A4 clear of its neighbours', async () => {
    const fonts = await fontsOf();
    const width = 595.28 - 96;
    const { head, rows } = tableOf('br-sac-price', 'pt');
    expect(head.length).toBe(8);
    const { rightOf, size } = columnLayout(48, width, head, rows, fonts);
    for (const [line, font] of [[head, fonts.bold], ...rows.map((cells) => [cells, fonts.regular] as const)] as const) {
      let end = 48 + font.widthOfTextAtSize(winAnsi(line[0] ?? ''), size);
      for (let index = 1; index < line.length; index += 1) {
        const start = rightOf(index) - font.widthOfTextAtSize(winAnsi(line[index] ?? ''), size);
        expect(start, `"${line[index]}" depois de "${line[index - 1]}"`).toBeGreaterThan(end);
        end = rightOf(index);
      }
      expect(end).toBeLessThanOrEqual(48 + width + 0.01);
    }
  });
});
