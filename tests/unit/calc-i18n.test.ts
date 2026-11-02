// The money calculators in Portuguese and Spanish (F6, decisions 1, 5 and 6). The five Spanish pages run the same
// definition, the same engine and so the same fixtures as their English pair: every amount of the page example is the
// same cent, written the same way ("$1,234.56", decision 1). The CSV is the English one in Spanish (comma, dot decimal)
// and, in Portuguese, semicolon and decimal comma with the BOM, its cents taken from the oracle's fixture; the PDF is
// Letter in English and Spanish and A4 in Portuguese, with the page footer in each language.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildReport } from '../../src/engine/pdf/report.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { csvText, reportInput } from '../../src/tools/calc/exports.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { BR_CALC_IDS, ES_CALC_IDS, type MoneyPageId } from '../../src/tools/calc/registry.ts';
import { viewOf } from '../../src/tools/calc/store.ts';
import type { Cell } from '../../src/tools/calc/types.ts';
import { cellText, inputRows } from '../../src/tools/calc/view.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import { parsePdf } from '../e2e/lib/pdf.ts';
import { pdfTextLines } from '../e2e/lib/pdf-text.ts';

const BOM = '﻿';
const cents = (cells: readonly Cell[]): (number | null)[] => cells.map((cell) => ('cents' in cell ? cell.cents : null));

function pageExample(id: MoneyPageId, lang: Lang) {
  const def = DEFS[id];
  const data = panelData(id, lang);
  return { def, data, view: viewOf(def, data, def.initial) };
}

function pdfOf(id: MoneyPageId, lang: Lang) {
  const { def, data, view } = pageExample(id, lang);
  return buildReport(
    reportInput({ title: data.name, inputs: inputRows(def.fields, def.initial, data), results: view.summary, premises: view.premises, table: view.table(), notice: data.notice, cell: cellText(lang) }, data.t, lang),
  );
}

describe('the five Spanish calculators', () => {
  for (const id of ES_CALC_IDS) {
    it(`${id} works out the English page example to the same cent, written the same way`, () => {
      const en = pageExample(id, 'en');
      const es = pageExample(id, 'es');
      expect(es.def).toBe(en.def);
      expect(es.view.problem ?? null).toBe(en.view.problem ?? null);
      // The hero and every result row: the label and the words ("360 pagos", "2 años y 8 meses") are translated, every
      // amount and rate is the same text, in the same place.
      // The one difference is the space before the percent sign, a no-break space in Spanish ("15.09 %", decision 1).
      const amounts = (rows: readonly [string, string][]) => rows.map(([, value]) => (/^[−-]?\$[\d,]+\.\d{2}$|%$/.test(value) ? value : 'texto'));
      const esAmounts = amounts(es.view.summary);
      expect(esAmounts.filter((value) => value !== 'texto').length).toBeGreaterThan(1);
      for (const value of esAmounts.filter((text) => text.endsWith('%'))) expect(value).toMatch(/\d %$/);
      expect(esAmounts.map((value) => value.replace(' %', '%'))).toEqual(amounts(en.view.summary));
      const [enTable, esTable] = [en.view.table(), es.view.table()];
      expect(esTable.rows.length).toBeGreaterThan(0);
      expect(esTable.rows.map(cents)).toEqual(enTable.rows.map(cents));
      // The CSV has the English shape: comma and dot decimal, so the lines after the header are the same.
      const lines = (text: string) => text.split('\r\n');
      const [enCsv, esCsv] = [csvText(enTable, en.data.t.year, 'en'), csvText(esTable, es.data.t.year, 'es')];
      expect(esCsv.startsWith(BOM)).toBe(true);
      expect(lines(esCsv).length).toBe(lines(enCsv).length);
      const body = (text: string) => lines(text).slice(1).map((line) => line.split(',').filter((cell) => /^-?\d+\.\d{2}$/.test(cell)));
      expect(body(esCsv)).toEqual(body(enCsv));
    });
  }
});

describe('the Portuguese CSV', () => {
  it('of the SAC × PRICE page example uses semicolons and the decimal comma, with the oracle cents', () => {
    const { data, view } = pageExample('br-sac-price', 'pt');
    const fixture = JSON.parse(readFileSync(resolve('fixtures/calc/br-sac-price.json'), 'utf8')) as {
      cases: { id: string; expected: { sac: { rows: number[][] }; price: { rows: number[][] } } }[];
    };
    const expected = fixture.cases.find((entry) => entry.id === 'page-example')?.expected;
    if (!expected) throw new Error('page-example missing from fixtures/calc/br-sac-price.json');
    const csv = csvText(view.table(), data.t.year, 'pt');
    expect(csv.startsWith(BOM)).toBe(true);
    expect(csv.endsWith('\r\n')).toBe(true);
    const lines = csv.slice(1).trimEnd().split('\r\n');
    // The header and every row have the same number of columns, split by the semicolon only.
    const width = lines[0]?.split(';').length ?? 0;
    expect(width).toBeGreaterThan(4);
    for (const line of lines) expect(line.split(';').length, line).toBe(width);
    expect(csv).not.toMatch(/\d\.\d{2}(?:;|\r)/);
    // Each oracle row of each plan is a CSV line: the payment with the insurance and fees of the month (review F6, a-2;
    // DECISOES § 252), the interest, the amortization, the insurance and fees, and the balance, in "1234,56".
    const real = (value: number) => `${Math.trunc(value / 100)},${String(Math.abs(value) % 100).padStart(2, '0')}`;
    const fees = Number(DEFS['br-sac-price'].initial['f']);
    expect(fees).toBeGreaterThan(0);
    for (const rows of [expected.sac.rows, expected.price.rows]) {
      for (const row of [rows[0], rows[11], rows.at(-1)]) {
        const [n, payment, interest, amortization, balance] = row ?? [];
        const wanted = [(payment ?? 0) + fees, interest, amortization, fees, balance].map((value) => real(value ?? 0));
        expect(lines.some((line) => { const cells = line.split(';'); return cells.includes(String(n)) && wanted.every((cell) => cells.includes(cell)); }), `linha ${n}: ${wanted.join(' ')}`).toBe(true);
      }
    }
  });

  for (const id of BR_CALC_IDS) {
    it(`${id}: every cent cell is written as 1234,56, with no thousands separator`, () => {
      const { data, view } = pageExample(id, 'pt');
      const csv = csvText(view.table(), data.t.year, 'pt');
      const cells = csv.slice(1).trimEnd().split('\r\n').slice(1).flatMap((line) => line.split(';'));
      const money = cells.filter((cell) => /\d,\d{2}$/.test(cell));
      expect(money.length, id).toBeGreaterThan(0);
      for (const cell of money) expect(cell, id).toMatch(/^-?\d+,\d{2}$/);
    });
  }
});

describe('the calculator PDF by language', () => {
  const LETTER = [612, 792];
  const A4 = [595.28, 841.89];

  it('is Letter in English and Spanish and A4 in Portuguese', async () => {
    for (const [id, lang, size] of [['mortgage-calculator', 'en', LETTER], ['mortgage-calculator', 'es', LETTER], ['br-sac-price', 'pt', A4]] as const) {
      const pages = parsePdf(await pdfOf(id, lang)).pages;
      expect(pages.length, `${id} ${lang}`).toBeGreaterThan(1);
      for (const page of pages) expect([page.width, page.height], `${id} ${lang}`).toEqual(size);
    }
  });

  it('writes the footer and the amounts in the language of the page', async () => {
    const pt = pdfTextLines(await pdfOf('br-sac-price', 'pt')).join('\n');
    expect(pt).toMatch(/Página 1 de \d+/);
    // The first SAC payment with the R$ 150 of insurance and fees, as the result says it (review F6, a-2; DECISOES § 252).
    expect(pt).toContain('R$ 4.754,95');
    expect(pt).not.toContain('?');
    const es = pdfTextLines(await pdfOf('mortgage-calculator', 'es')).join('\n');
    expect(es).toContain('$2,396.20');
    expect(es).not.toMatch(/Page 1 of/);
    expect(es).not.toContain('?');
  });
});
