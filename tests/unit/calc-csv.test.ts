// The CSV of every calculator (F16, item 5; prompt decisions 7 and 14, criterion 5; DECISOES § 687 and § 688): one thing per
// cell, a number in the format of the language's CSV (no thousands separator, an ASCII minus, the decimals of the cell, a
// percent glued to its number), a day as YYYY-MM-DD or a text (the name of a row, a category or an item, the label of a
// group), with the unit in the header or in the "Unit" column, a range in two columns, "—" empty, the rows of the screen,
// and the separator, the quotes, the CRLF and the BOM of before. Every page with the island in every language it has (the
// registry, and the guides that carry the island), with the example, with the card's nudges, with a negative BTU and with
// days. Each column holds what its table declares. The numbers of the home and health examples are those of the page-example
// case of the oracle (fixtures/calc/<id>.json), and the bands of the BMI are those of the engine.
// CALC_CSV_DIR points the example checks at a folder of downloaded CSVs named <lang>-<id>.csv (the negative control runs
// them on the CSVs of the starting point, .cache/f16/antes/csv/).
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bmiCategory } from '../../src/calc/health.ts';
import { longDate, mediumDate, shortDate, tableDate } from '../../src/i18n/dates.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import { nudges, startValues } from '../../src/tools/calc/CalcPanel.tsx';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { BMI_BANDS, BMI_CATEGORIES } from '../../src/tools/calc/defs/health.ts';
import { CSV_SEPARATOR, csvCells, csvText } from '../../src/tools/calc/exports.ts';
import { GUIDE_FACTS } from '../../src/tools/calc/guides.ts';
import { calcTexts, panelData } from '../../src/tools/calc/page.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS, GUIDE_IDS, LIFE_CALC_IDS, moneyPage, type AnyCalcId, type LifeCalcId } from '../../src/tools/calc/registry.ts';
import { viewOf } from '../../src/tools/calc/store.ts';
import type { CalcPanelData, CsvKind, Table, Values } from '../../src/tools/calc/types.ts';

const BOM = String.fromCharCode(0xfeff);
const MINUS = String.fromCharCode(0x2212);
const NBSP = String.fromCharCode(0xa0);
const DIR = process.env['CALC_CSV_DIR'];

/** A page with the calculator island: its name in the folder of downloads, its data and the values it starts with. */
interface Page {
  name: string;
  lang: Lang;
  data: CalcPanelData;
  start: Values;
}

const calcPage = (id: AnyCalcId, lang: Lang): Page => {
  const data = panelData(id, lang);
  return { name: `${lang}-${id}`, lang, data, start: startValues(data) };
};
const guidePage = (id: (typeof GUIDE_IDS)[number], lang: 'en' | 'es'): Page => {
  const facts = GUIDE_FACTS[id](lang);
  const data = panelData(facts.calc, lang, { initial: facts.example, readLink: false });
  return { name: `${lang}-${id}`, lang, data, start: startValues(data) };
};

const PAGES: Page[] = [
  ...CALC_PAGE_IDS.flatMap((id) => (['en', 'es'] as const).filter((lang) => moneyPage(id, lang) !== null).map((lang) => calcPage(id, lang))),
  ...BR_CALC_IDS.map((id) => calcPage(id, 'pt')),
  ...LIFE_CALC_IDS.map((id) => calcPage(id, 'en')),
  ...GUIDE_IDS.flatMap((id) => (['en', 'es'] as const).map((lang) => guidePage(id, lang))),
];

const tableOf = (page: Page, values: Values): Table => viewOf(DEFS[page.data.page], page.data, values).table();
/** The CSV the island saves (CalcPanel's ExportBar): the year word of the language, without its {n}. */
const csvOf = (page: Page, table: Table): string => csvText(table, page.data.t.year.replace(/\s*\{n\}/, ''), page.lang);

/** RFC 4180 with the language's separator; the text has no BOM and ends with a CRLF. */
function parseCsv(text: string, separator: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let at = 0; at < text.length; at += 1) {
    const char = text[at];
    if (quoted) {
      if (char === '"' && text[at + 1] === '"') {
        cell += '"';
        at += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === separator) {
      row.push(cell);
      cell = '';
    } else if (char === '\r' && text[at + 1] === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      at += 1;
    } else cell += char;
  }
  return rows;
}

// --- what a text cell may not have ---------------------------------------------------------------------------------

const DAYS = Array.from({ length: 12 }, (_, month) => `2026-${String(month + 1).padStart(2, '0')}-05`);
const LANGS: readonly Lang[] = ['en', 'pt', 'es'];
const words = (text: string): string[] => (text.match(/\p{L}+/gu) ?? []).filter((word) => !['de', 'del'].includes(word));
/** The month names of the three languages, written out (longDate) and short (the screen's and the signature's dates). */
const MONTHS = new Set(LANGS.flatMap((lang) => DAYS.flatMap((day) => words(longDate(day, lang)))).map((word) => word.toLowerCase()));
const SHORT_MONTHS = new Set(
  LANGS.flatMap((lang) => DAYS.flatMap((day) => [tableDate(day, lang), shortDate(day, lang), mediumDate(day, lang)].flatMap(words)))
    .map((word) => word.toLowerCase())
    .filter((word) => !MONTHS.has(word)),
);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
/**
 * The units of the calculators' fields and tables, in every language: the suffix of every field (a percent is a number's,
 * never a unit, decision 7), every unit of a view, and the units the tables write in words.
 */
const UNITS = (() => {
  const units = new Set(['sq ft', 'sq yd', 'cu ft', 'cu yd', 'gal', 'kcal', 'BTU', 'lb', 'kg', 'cm', 'in', 'ft', 'tons', 'short tons', 'square feet', 'square yards', 'cubic feet', 'cubic yards', 'gallons', 'pounds', 'inches', 'feet']);
  for (const page of PAGES) {
    const panel = calcTexts(page.data.page, page.lang).panel;
    for (const field of Object.values(panel.fields)) if (field.suffix && !field.suffix.startsWith('%')) units.add(field.suffix);
    for (const [key, value] of Object.entries(panel.view)) if (/unit$/i.test(key) && value) units.add(value);
  }
  return [...units].sort((a, b) => b.length - a.length);
})();
const NUMBER_AND_UNIT = new RegExp(`\\d\\s?(?:${UNITS.map(escape).join('|')})(?!\\p{L})`, 'iu');

/**
 * What is wrong with a text cell: nothing, or the reason. A header is a name and may carry its unit, "Area (sq ft)", or the
 * loan it is about, "Saldo a 15 años" (`header`): the rest holds for it too.
 */
function textProblem(text: string, lang: Lang, header = false): string | null {
  if (text.includes(MINUS)) return 'U+2212';
  if ((lang === 'pt' ? /\d\.\d{3}(?!\d)/ : /\d,\d{3}(?!\d)/).test(text)) return 'a number with a thousands separator';
  const unit = header ? null : NUMBER_AND_UNIT.exec(text);
  if (unit) return `a number with a unit ("${unit[0]}")`;
  const month = words(text).find((word) => MONTHS.has(word.toLowerCase()));
  if (month) return `a month ("${month}")`;
  const short = [...text.matchAll(/(\d\s*)?(\p{L}+)\.?(\s*\d)?/gu)].find((match) => SHORT_MONTHS.has((match[2] ?? '').toLowerCase()) && (match[1] || match[3]));
  if (short) return `a month ("${short[0].trim()}")`;
  return null;
}

const NUMBER: Record<Lang, RegExp> = { en: /^-?\d+(\.\d+)?%?$/, es: /^-?\d+(\.\d+)?%?$/, pt: /^-?\d+(,\d+)?%?$/ };

/** What is wrong with a cell of a column of this kind: nothing, or the reason. An empty cell is right in any column. */
function cellProblem(cell: string, kind: CsvKind, lang: Lang): string | null {
  if (cell === '') return null;
  if (kind === 'number') return NUMBER[lang].test(cell) ? null : 'not a number of the CSV';
  if (kind === 'date') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cell);
    if (!match) return 'not a YYYY-MM-DD day';
    const day = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return day.toISOString().slice(0, 10) === cell ? null : 'not a day of the calendar';
  }
  return textProblem(cell, lang);
}

/** The kinds of the columns of a table's CSV: the year of a grouped table is a text (the group's label), then the table's. */
const kindsOf = (table: Table): CsvKind[] => [...(table.groups ? (['text'] as const) : []), ...table.csv.map((column) => column.kind)];

/** Every problem of a CSV against the table it comes from (its kinds and its rows). */
function problemsOf(csv: string, lang: Lang, table: Table): string[] {
  const out: string[] = [];
  if (!csv.startsWith(BOM)) out.push('no BOM');
  if (!csv.endsWith('\r\n') || /[^\r]\n|\r(?!\n)/.test(csv)) out.push('a line that does not end in CRLF');
  if (csv.includes(NBSP)) out.push('a no-break space');
  const [head = [], ...rows] = parseCsv(csv.startsWith(BOM) ? csv.slice(1) : csv, CSV_SEPARATOR[lang]);
  const kinds = kindsOf(table);
  if (head.length !== kinds.length) out.push(`a header of ${head.length} columns for ${kinds.length} declared`);
  for (const cell of head) {
    const problem = textProblem(cell, lang, true);
    if (problem) out.push(`header "${cell}": ${problem}`);
  }
  if (rows.length !== table.rows.length) out.push(`${rows.length} rows for ${table.rows.length} on the screen`);
  rows.forEach((row, at) => {
    if (row.length !== kinds.length) out.push(`row ${at + 1}: ${row.length} cells for ${kinds.length} columns`);
    row.forEach((cell, column) => {
      const problem = cellProblem(cell, kinds[column] ?? 'text', lang);
      if (problem) out.push(`row ${at + 1}, column ${column + 1} ("${cell}"): ${problem}`);
    });
  });
  return out;
}

/** The cells of the columns that hold numbers or days, row by row (what the oracle can say). */
function figures(csv: string, lang: Lang, table: Table): string[][] {
  const kinds = kindsOf(table);
  const [, ...rows] = parseCsv(csv.slice(1), CSV_SEPARATOR[lang]);
  return rows.map((row) => row.filter((_, column) => kinds[column] !== 'text'));
}

// --- the oracle of the home and health examples -------------------------------------------------------------------

interface Case {
  id: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
}
const oracleCase = (id: LifeCalcId, caseId = 'page-example'): Case => {
  const cases = (JSON.parse(readFileSync(`fixtures/calc/${id}.json`, 'utf8')) as { cases: Case[] }).cases;
  const found = cases.find((one) => one.id === caseId);
  if (!found) throw new Error(`${id}: no case ${caseId}`);
  return found;
};
/** A whole number of 10^-decimals as the CSV writes it in English, by hand (never by the formatter under test). */
const fixed = (value: unknown, decimals: number): string => (Number(value) / 10 ** decimals).toFixed(decimals);
const record = (value: unknown): Record<string, number> => value as Record<string, number>;

/** The numbers and days of each example CSV row, from the oracle's page-example case (input and expected). */
const ORACLE: Record<LifeCalcId, (c: Case) => string[][]> = {
  'square-footage-calculator': ({ input, expected }) => {
    const area = (input['areas'] as Record<string, number>[])[0] ?? {};
    return [[fixed(area['x'], 2), fixed(area['y'], 2), fixed((expected['items'] as Record<string, number>[])[0]?.['sqft'], 2)]];
  },
  // The weight of each bag is the number in the oracle's names (y40, b40: the 40 lb bag).
  'concrete-calculator': ({ input, expected }) =>
    Object.keys(record(expected['bags'])).map((key) => {
      const pounds = key.slice(1);
      return [pounds, fixed(input[`y${pounds}`], 2), String(record(expected['bags'])[key])];
    }),
  'mulch-calculator': ({ input, expected }) => [
    [fixed(expected['sqft'], 2), ''],
    [fixed(expected['cuyd'], 2), ''],
    [fixed(expected['cuft'], 2), ''],
    [String(expected['bags']), fixed(input['bag'], 2)],
  ],
  'paint-calculator': ({ input, expected }) => [[fixed(expected['wall'], 2)], [fixed(expected['openings'], 2)], [fixed(expected['paintable'], 2)], [String(input['coats'])], [fixed(expected['gallons'], 2)], [String(expected['buy'])]],
  'tile-calculator': ({ input, expected }) => [
    [fixed(input['area'], 2), '', ''],
    ['', fixed(input['length'], 2), fixed(input['width'], 2)],
    [`${String(input['waste'])}%`, '', ''],
    [String(expected['tiles']), '', ''],
    [String(expected['boxes']), '', ''],
  ],
  'btu-calculator': ({ input, expected }) => [[String(expected['base']), fixed(input['area'], 2)], [String(expected['sun']), ''], [String(expected['people']), ''], [String(expected['kitchen']), ''], [String(expected['btu']), '']],
  // The bands are the engine's (checked below); the oracle gives the BMI and its category, the row the BMI goes in.
  'bmi-calculator': ({ expected }) =>
    BMI_CATEGORIES.map((category) => {
      const [from, to] = BMI_BANDS[category];
      return [from === null ? '' : fixed(from, 1), to === null ? '' : fixed(to, 1), category === expected['category'] ? fixed(expected['bmi'], 1) : ''];
    }),
  'calorie-calculator': ({ input, expected }) => [[String(expected['ree'])], [fixed(input['pal'], 2)], [String(expected['tdee'])]],
  'ovulation-calculator': ({ expected }) => (expected['cycles'] as Record<string, string>[]).map((cycle) => [cycle['fertileStart'] ?? '', cycle['ovulation'] ?? '', cycle['ovulation'] ?? '', cycle['nextPeriod'] ?? '']),
  'body-fat-calculator': ({ expected }) => [[''], [`${fixed(expected['percent'], 1)}%`]],
  'due-date-calculator': ({ expected }) => [...(expected['trimesters'] as string[]).map((day) => [day]), [String(expected['fullTerm'])], [String(expected['due'])]],
};

/** The values of the page for the oracle's input of a case (the BTU's, which the negative case needs). */
const btuValues = (input: Record<string, unknown>): Values => ({ ar: Number(input['area']), pe: Number(input['people']), su: String(input['sun']), ki: input['kitchen'] ? 'yes' : 'no' });

describe('the CSV of the calculators', () => {
  it('writes every kind of value with one thing in the cell', () => {
    expect(csvCells({ cents: -123_450 }, 'en')).toEqual(['-1234.50']);
    expect(csvCells({ cents: -123_450 }, 'pt')).toEqual(['-1234,50']);
    expect(csvCells({ cents: 123_456_789 }, 'es')).toEqual(['1234567.89']);
    expect(csvCells({ scaled: 1_234_567, decimals: 2 }, 'en')).toEqual(['12345.67']);
    expect(csvCells({ text: `1${NBSP}234`, csv: [{ scaled: -50_000, decimals: 0 }, { scaled: 259, decimals: 1, percent: true }, { day: '2026-11-02' }, { text: 'sq ft' }, null] }, 'pt')).toEqual(['-50000', '25,9%', '2026-11-02', 'sq ft', '']);
    expect(csvCells({ text: `5.13${NBSP}%` }, 'es')).toEqual(['5.13%']);
    expect(csvCells({ text: 'Area 1' }, 'en')).toEqual(['Area 1']);
  });

  it('finds what a CSV cell may not have', () => {
    expect(cellProblem('1234.50', 'number', 'en')).toBeNull();
    expect(cellProblem('-1234,50', 'number', 'pt')).toBeNull();
    expect(cellProblem('25.9%', 'number', 'en')).toBeNull();
    expect(cellProblem('9,000', 'number', 'en')).not.toBeNull();
    expect(cellProblem('+900', 'number', 'en')).not.toBeNull();
    expect(cellProblem(`${MINUS}500`, 'number', 'en')).not.toBeNull();
    expect(cellProblem('1234.50', 'number', 'pt')).not.toBeNull();
    expect(cellProblem('2026-11-02', 'date', 'en')).toBeNull();
    expect(cellProblem('2026-02-30', 'date', 'en')).not.toBeNull();
    expect(cellProblem('November 2, 2026', 'date', 'en')).not.toBeNull();
    expect(textProblem('Bags of 2 cu ft', 'en')).toMatch(/unit/);
    expect(textProblem('40 lb bags', 'en')).toMatch(/unit/);
    expect(textProblem('200.00 sq ft', 'en')).toMatch(/unit/);
    expect(textProblem('1,376 kcal', 'en')).toMatch(/thousands/);
    expect(textProblem('12 parcelas', 'pt')).toMatch(/unit/);
    expect(textProblem('R$ 1.234', 'pt')).toMatch(/thousands/);
    expect(textProblem(`${MINUS}500`, 'en')).toBe('U+2212');
    expect(textProblem('October 27, 2026', 'en')).toMatch(/month/);
    expect(textProblem('1 de novembro de 2026', 'pt')).toMatch(/month/);
    expect(textProblem('16 de noviembre de 2026', 'es')).toMatch(/month/);
    expect(textProblem(`Oct${NBSP}26`, 'en')).toMatch(/month/);
    expect(textProblem('5 nov 2026', 'es')).toMatch(/month/);
    for (const fine of ['Year 1', 'SAC · Ano 1', 'Energy Star table', 'Very sunny (10% more)', 'People past two (600 each)', 'Room area (sq ft)', 'Tiempo, en años', 'Not counted']) expect(textProblem(fine, 'en'), fine).toBeNull();
  });

  it('holds in every column what the table declares, with the example of every page in every language', () => {
    expect(PAGES.length).toBe(65);
    for (const page of PAGES) {
      const table = tableOf(page, page.start);
      const file = DIR ? `${DIR}/${page.name}.csv` : '';
      if (DIR && !existsSync(file)) throw new Error(`${page.name}: no ${file}`);
      const csv = DIR ? readFileSync(file, 'utf8') : csvOf(page, table);
      expect.soft(problemsOf(csv, page.lang, table), page.name).toEqual([]);
    }
  });

  it('holds it with the values of the card, each main field nudged as a person types it', () => {
    let count = 0;
    for (const page of PAGES) {
      for (const values of nudges(DEFS[page.data.page], page.data, page.start)) {
        const table = tableOf(page, values);
        expect(problemsOf(csvOf(page, table), page.lang, table), `${page.name} ${JSON.stringify(values)}`).toEqual([]);
        count += 1;
      }
    }
    // 144 sets on the starting point's reading of the fields (ee767e2).
    expect(count).toBeGreaterThan(100);
  });

  it('writes the numbers of the home and health examples that the oracle gives', () => {
    for (const id of LIFE_CALC_IDS) {
      const page = PAGES.find((one) => one.name === `en-${id}`);
      if (!page) throw new Error(`no page ${id}`);
      const table = tableOf(page, page.start);
      const csv = DIR ? readFileSync(`${DIR}/${page.name}.csv`, 'utf8') : csvOf(page, table);
      expect.soft(figures(csv, 'en', table), id).toEqual(ORACLE[id](oracleCase(id)));
    }
  });

  it('writes a negative step of the BTU with an ASCII minus, as the oracle gives it', () => {
    const page = PAGES.find((one) => one.name === 'en-btu-calculator');
    if (!page) throw new Error('no BTU page');
    for (const id of ['grid-005', 'grid-006']) {
      const oracle = oracleCase('btu-calculator', id);
      expect(Number(oracle.expected['sun'])).toBeLessThan(0);
      const table = tableOf(page, btuValues(oracle.input));
      const csv = csvOf(page, table);
      expect(problemsOf(csv, 'en', table), id).toEqual([]);
      expect(figures(csv, 'en', table)[1], id).toEqual([String(oracle.expected['sun']), '']);
      expect(csv, id).toContain(',-500');
    }
  });

  it('writes the days of a cycle and of a pregnancy as YYYY-MM-DD, across a new year too', () => {
    const ovulation = PAGES.find((one) => one.name === 'en-ovulation-calculator');
    const due = PAGES.find((one) => one.name === 'en-due-date-calculator');
    if (!ovulation || !due) throw new Error('no date pages');
    for (const [page, values] of [
      [ovulation, { d: '2026-12-20', c: 35 }],
      [due, { m: 'ivf5', d: '2026-12-31', today: '2027-01-15' }],
      [due, { m: 'conception', d: '2025-03-01', today: '2026-11-02' }],
    ] as const) {
      const table = tableOf(page, values);
      const csv = csvOf(page, table);
      expect(problemsOf(csv, 'en', table), JSON.stringify(values)).toEqual([]);
      for (const row of figures(csv, 'en', table)) for (const cell of row) expect(cell).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('writes the bands of the BMI with both ends in their category, by the engine’s rule', () => {
    for (const category of BMI_CATEGORIES) {
      const [from, to] = BMI_BANDS[category];
      if (from !== null) {
        expect(bmiCategory(from), `${category} from`).toBe(category);
        expect(bmiCategory(from - 1), `${category} before`).not.toBe(category);
      }
      if (to !== null) {
        expect(bmiCategory(to), `${category} to`).toBe(category);
        expect(bmiCategory(to + 1), `${category} after`).not.toBe(category);
      }
    }
    expect(BMI_BANDS.underweight[0]).toBeNull();
    expect(BMI_BANDS['obesity-3'][1]).toBeNull();
  });

  it('keeps the screen’s header on the money tables, whose cells never had a unit', () => {
    for (const page of PAGES.filter((one) => !(LIFE_CALC_IDS as readonly string[]).includes(one.data.page))) {
      const table = tableOf(page, page.start);
      expect(
        table.csv.map((column) => column.head),
        page.name,
      ).toEqual(table.head);
    }
  });
});
