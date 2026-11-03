// The US money calculators in Spanish (languages adjustment, decisions 4 and 8): the 14 calculators and the 4 presets, the
// five of the F6 and the 13 new ones, each on its Spanish page with the example it opens with. For each one:
// - the number of the ResultHero and the numbers of the table, once opened, are those of the English page, compared as
//   numbers (Spanish writes "$1,234.56" like English, and "6.5 %" with a no-break space before the sign);
// - the CSV saved from the page, read back, is the oracle's fixture (fixtures/calc, written before the engines): every row of
//   the schedule where the oracle has them, the year ends of the yearly tables, and the totals and the result where it has
//   no rows (the home a person can afford, the simple interest);
// - the PDF saved from the page is Letter (612 × 792) on every sheet and is written in Spanish: the headings, the line of
//   the site and the page footer of src/tools/calc/i18n/es.ts, and none of the English ones.
// The pages go in blocks, a test each (DECISOES § 306), so no test walks the 18 pages and every one fits the 60 s of a test.
// The name puts this file between money-calc and money-health in the split of the CI.
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { CALC_PAGES, CALC_PAGE_IDS, moneyPage, type CalcPageId } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import { hydrated } from './lib/page.ts';
import { parsePdf } from './lib/pdf.ts';
import { pdfTextLines } from './lib/pdf-text.ts';

test.beforeEach(async ({ page }) => {
  // No cookie card over the buttons: the consent is already answered (the card has its own specs).
  await page.addInitScript(() => window.localStorage.setItem('fo-consent', 'denied'));
});

type Row = number[];
interface Schedule {
  rows?: Row[];
  yearEnd?: number[];
}
/** What the oracle says about the example of a page (fixtures/calc/<id>.json): each calculator has its own shape. */
interface OracleExpected extends Schedule {
  new?: Schedule;
  extra?: Schedule;
  biweekly?: Schedule;
  snowball?: Schedule;
  avalanche?: Schedule;
  fifteen?: Schedule;
  thirty?: Schedule;
  years?: Row[];
  buyer?: number[];
  renter?: number[];
  table?: Row[];
  interest?: number;
  total?: number;
  payment?: number;
  maxLoan?: number;
}
interface OracleCase {
  id: string;
  input: Record<string, unknown>;
  expected: OracleExpected;
}

/** The oracle's case for the example a page opens with. */
function oracleCase(id: CalcPageId): OracleCase {
  const def = DEFS[id];
  const input = JSON.parse(JSON.stringify(def.toInput(def.initial as never))) as Record<string, unknown>;
  const cases = (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: OracleCase[] }).cases;
  const example = cases.find((entry) => entry.id === 'page-example');
  expect(example?.input, `${id}: o exemplo da página é o do oráculo`).toEqual(input);
  // The mortgage's page example has no rows in the oracle; a drawn case with the same input has them (as money-calc reads it).
  const found = id === 'mortgage-calculator' ? cases.find((entry) => entry.expected.rows && isDeepStrictEqual(entry.input, input)) : example;
  if (!found) throw new Error(`no oracle case for the example of ${id}`);
  return found;
}

/** A row of payments in the oracle is [number, payment, interest, principal, balance]; the table puts the principal first. */
const payments = (rows: Row[] | undefined): Row[] => (rows ?? []).map(([n = 0, payment = 0, interest = 0, principal = 0, balance = 0]) => [n, payment, principal, interest, balance]);
/** A yearly table of two balances: the year, then each one, 0 once it is paid off. */
const yearly = (a: number[] | undefined, b: number[] | undefined): Row[] =>
  Array.from({ length: Math.max(a?.length ?? 0, b?.length ?? 0) }, (_, index) => [index + 1, a?.[index] ?? 0, b?.[index] ?? 0]);

/**
 * The numbers each CSV line must have, from the oracle (cents, a rate in hundredths of a point, counts as they are), and
 * whether the lines are grouped by loan year (a first column with the year in words). The two calculators whose oracle has
 * no rows get their totals and their result checked instead (`check`).
 */
function oracleTable(id: CalcPageId, oracle: OracleCase): { grouped: boolean; rows?: Row[]; check?: (rows: Row[]) => void } {
  const e = oracle.expected;
  switch (id) {
    case 'mortgage-calculator':
    case 'personal-loan-calculator':
    case 'auto-loan-calculator':
    case 'loan-amortization-calculator':
    case 'credit-card-payoff-calculator':
    case 'loan-amortization-calculator-balloon-payment':
      return { grouped: true, rows: payments(e.rows) };
    case 'refinance-calculator':
    case 'debt-consolidation-calculator':
      return { grouped: true, rows: payments(e.new?.rows) };
    case 'mortgage-calculator-extra-payments':
      return { grouped: true, rows: payments(e.extra?.rows) };
    case 'mortgage-calculator-biweekly':
      return { grouped: true, rows: payments(e.biweekly?.rows) };
    case 'savings-goal-calculator':
      // [month, deposit, interest, balance], in the order of the table.
      return { grouped: true, rows: e.rows ?? [] };
    case 'compound-interest-calculator':
      // [year, deposits, interest, balance], in the order of the table.
      return { grouped: false, rows: e.years ?? [] };
    case 'debt-payoff-calculator':
      return { grouped: false, rows: yearly(e.snowball?.yearEnd, e.avalanche?.yearEnd) };
    case 'rent-vs-buy-calculator':
      return { grouped: false, rows: yearly(e.buyer, e.renter) };
    case 'mortgage-calculator-15-vs-30-year':
      return { grouped: false, rows: yearly(e.fifteen?.yearEnd, e.thirty?.yearEnd) };
    case 'apr-to-apy-calculator':
      // [periods a year, APY]: the table names the compounding in words, so only the APY is a number.
      return { grouped: false, rows: (e.table ?? []).map(([, apy = 0]) => [apy]) };
    case 'simple-interest-calculator':
      // The oracle has the interest and the total at the end of the time: the last line of the table.
      return {
        grouped: false,
        check: (rows) => {
          expect(rows.length, id).toBeGreaterThan(0);
          expect(rows.at(-1), id).toEqual([Number(oracle.input['time']), e.interest, e.total]);
        },
      };
    case 'home-affordability-calculator':
      // The schedule of the largest loan: the oracle's payment, principal that adds up to its largest loan, nothing left.
      return {
        grouped: true,
        check: (rows) => {
          expect(rows.length, id).toBe(Number(oracle.input['years']) * 12);
          expect(rows.map((row) => row[0]), id).toEqual(rows.map((_, index) => index + 1));
          expect(rows[0]?.[1], `${id}: a prestação`).toBe(e.payment);
          expect(rows.reduce((sum, row) => sum + (row[2] ?? 0), 0), `${id}: o capital somado`).toBe(e.maxLoan);
          expect(rows.at(-1)?.[4], `${id}: o saldo no fim`).toBe(0);
        },
      };
  }
}

/** The cells of a CSV line, by RFC 4180 (a cell with the separator comes in quotes). */
function csvCells(line: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let at = 0; at < line.length; at += 1) {
    const char = line[at];
    if (quoted) {
      if (char === '"' && line[at + 1] === '"') {
        cell += '"';
        at += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      cells.push(cell);
      cell = '';
    } else cell += char;
  }
  cells.push(cell);
  return cells;
}

/**
 * A number cell of the CSV in whole units: money as cents (1896.20), a percent as hundredths ("5.13%", glued to its number
 * as in the English CSV, so a spreadsheet reads it; the no-break space of the screen stays out, review C-5), a count as it is.
 */
function csvNumber(cell: string): number | null {
  const plain = cell.replace(/(?<=\d)%$/, '');
  if (!/^-?\d+(?:\.\d{2})?$/.test(plain)) return null;
  return plain.includes('.') ? Math.round(Number(plain) * 100) : Number(plain);
}

/** The numbers of a text as a page shows them ("$1,234.56", "−$3,489.77", "5.13 %", "3 años y 1 mes"), commas out. */
function numbersIn(text: string): number[] {
  const plain = text.replace(/−/g, '-').replace(/-\s*\$/g, '-').replace(/\$/g, '');
  return [...plain.matchAll(/-?\d[\d,]*(?:\.\d+)?/g)].map((match) => Number(match[0].replace(/,/g, '')));
}

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function saved(page: Page, button: Locator): Promise<{ name: string; bytes: Buffer }> {
  const download = page.waitForEvent('download');
  await button.click();
  const file = await download;
  return { name: file.suggestedFilename(), bytes: readFileSync((await file.path()) ?? '') };
}

/** What a page shows with its example: the hero's text, and the numbers of each row of the table, once opened. */
async function shown(page: Page, path: string): Promise<{ hero: string; table: number[][] }> {
  expect((await page.goto(path))?.status(), path).toBe(200);
  await hydrated(page);
  const hero = (await page.locator('.fo-rhero__num').first().textContent()) ?? '';
  const open = page.locator('.fo-calc-schedule button[aria-controls="fo-schedule-table"]');
  if (await open.count()) await open.click();
  await expect(page.locator('#fo-schedule-table table'), path).toBeVisible();
  const cells = await page.locator('#fo-schedule-table tbody tr').evaluateAll((rows) => rows.map((row) => [...row.querySelectorAll('td')].map((cell) => cell.textContent ?? '')));
  return { hero, table: cells.map((row) => row.flatMap(numbersIn)) };
}

const sum = (rows: number[][]): number => rows.flat().reduce((total, value) => total + value, 0);

const BLOCK = 3;
for (let start = 0; start < CALC_PAGE_IDS.length; start += BLOCK) {
  const block = CALC_PAGE_IDS.slice(start, start + BLOCK);
  test(`Spanish money pages ${start + 1} to ${start + block.length}: the English numbers, the oracle's CSV and a Letter PDF in Spanish`, async ({ page, browserName }) => {
    for (const id of block) {
      const es = moneyPage(id, 'es');
      if (!es) throw new Error(`${id} has no Spanish page`);

      // The hero and the table show the numbers of the English page.
      const english = await shown(page, CALC_PAGES[id].path);
      const spanish = await shown(page, es.path);
      expect(numbersIn(english.hero).length, `${id}: um número no hero`).toBeGreaterThan(0);
      expect(numbersIn(spanish.hero), `${id}: o número do hero`).toEqual(numbersIn(english.hero));
      // The Spanish percent has a no-break space before the sign ("5.13 %"), never glued to the number.
      if (english.hero.includes('%')) expect(spanish.hero, id).toMatch(/\d %/);
      expect(spanish.hero, id).not.toMatch(/\d%/);
      expect(spanish.table.length, `${id}: linhas da tabela`).toBeGreaterThan(0);
      expect(spanish.table, `${id}: os números da tabela`).toEqual(english.table);
      expect(sum(spanish.table), `${id}: a soma da tabela`).toBe(sum(english.table));

      // The CSV, read back, is the oracle's.
      const csv = await saved(page, page.locator('.fo-export .fo-btn').nth(1));
      expect(csv.name, id).toBe(`${es.file}.csv`);
      const text = csv.bytes.toString('utf8');
      expect(text.startsWith('﻿'), `${id}: BOM UTF-8`).toBe(true);
      const lines = text.slice(1).split('\r\n');
      expect(lines.pop(), `${id}: o arquivo termina em CRLF`).toBe('');
      const [header = [], ...body] = lines.map(csvCells);
      for (const cells of body) expect(cells.length, `${id}: colunas de ${cells.join(',')}`).toBe(header.length);
      const oracle = oracleTable(id, oracleCase(id));
      if (oracle.grouped) {
        // The year column is in Spanish: its heading and the label of every line ("Año 3").
        const year = esShared.island.year;
        expect(header[0], id).toBe(year.replace(/\s*\{n\}/, ''));
        const label = new RegExp(`^${escape(year).replace(escape('{n}'), '\\d+')}$`);
        for (const cells of body) expect(cells[0], id).toMatch(label);
      }
      const numbers = body.map((cells) => cells.map(csvNumber).filter((value): value is number => value !== null));
      if (oracle.rows) {
        expect(oracle.rows.length, `${id}: linhas do oráculo`).toBeGreaterThan(0);
        expect(numbers, `${id}: o CSV e o oráculo`).toEqual(oracle.rows);
      }
      oracle.check?.(numbers);

      // The PDF is Letter, in Spanish.
      const pdf = await saved(page, page.locator('.fo-export .fo-btn--download'));
      expect(pdf.name, id).toBe(`${es.file}.pdf`);
      const sheets = parsePdf(new Uint8Array(pdf.bytes)).pages;
      expect(sheets.length, id).toBeGreaterThan(0);
      for (const sheet of sheets) expect([sheet.width, sheet.height], `${id}: Letter`).toEqual([612, 792]);
      const drawn = pdfTextLines(new Uint8Array(pdf.bytes));
      const labels = esShared.island.pdfLabels;
      for (const words of [labels.inputs, labels.results, labels.notice, labels.site]) expect(drawn, `${id}: "${words}" no PDF`).toContain(words);
      expect(drawn, `${id}: o rodapé`).toContain(labels.page.replace('{n}', '1').replace('{total}', String(sheets.length)));
      const enLabels = enShared.island.pdfLabels;
      for (const words of [enLabels.inputs, enLabels.results, enLabels.site, enLabels.page.replace('{n}', '1').replace('{total}', String(sheets.length))]) {
        expect(drawn, `${id}: "${words}" em inglês no PDF`).not.toContain(words);
      }
      console.log(`[money-es] ${es.path}, ${browserName}: hero ${spanish.hero.replace(/\s+/g, ' ')}, tabela ${spanish.table.length} linhas (soma ${sum(spanish.table).toFixed(2)}), CSV ${body.length} linhas, PDF ${sheets.length} folhas`);
    }
  });
}
