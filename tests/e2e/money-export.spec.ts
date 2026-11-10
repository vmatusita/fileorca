// The CSV saved from the page, in both browsers (F16, item 5; prompt decision 14, criterion 5; DECISOES § 687, § 688 and
// § 695): one calculator of each kind with its example (money in English, home, health, Brazil in Portuguese and money in
// Spanish), byte for byte the CSV that tests/unit/calc-csv.test.ts checks, worked out here in Node by the same csvText from the
// definition and the page's own texts (the island's view, with no panelData: a spec does not import the icons), with the BOM,
// the separator and the CRLF of the language. A few lines of each are written here by hand too, from the oracle's examples.
// The name starts with "money-" for the order of the CI parts, between money-home and money-life-privacy (DECISOES § 695).
import { expect, test, type Page } from '@playwright/test';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { csvText } from '../../src/tools/calc/exports.ts';
import { moneyPage, type AnyCalcId } from '../../src/tools/calc/registry.ts';
import type { CalcPageTexts, CalcSharedTexts } from '../../src/tools/calc/types.ts';
import type { Lang } from '../../src/i18n/routes.ts';
import enShared from '../../src/tools/calc/i18n/en.ts';
import ptShared from '../../src/tools/calc/i18n/pt.ts';
import esShared from '../../src/tools/calc/i18n/es.ts';
import mortgageTexts from '../../src/tools/mortgage-calculator/i18n/en.ts';
import tileTexts from '../../src/tools/tile-calculator/i18n/en.ts';
import ovulationTexts from '../../src/tools/ovulation-calculator/i18n/en.ts';
import sacPriceTexts from '../../src/tools/br-sac-price/i18n/pt.ts';
import aprApyTexts from '../../src/tools/apr-to-apy-calculator/i18n/es.ts';
import { dismissCookies, hydrated } from './lib/page.ts';
import { csvButton, saved } from './lib/life-calc.ts';

interface Export {
  kind: string;
  id: AnyCalcId;
  lang: Lang;
  shared: CalcSharedTexts;
  texts: CalcPageTexts;
  /** Lines of the file by hand, from its first one (the header). */
  lines: readonly string[];
  /** The last line by hand, when the file is long. */
  last?: string;
}

const EXPORTS: readonly Export[] = [
  {
    kind: 'money in English',
    id: 'mortgage-calculator',
    lang: 'en',
    shared: enShared.island,
    texts: mortgageTexts,
    // The design system's home: $300,000 at 6.5% for 30 years, $1,896.20 a month, $1,625.00 of interest in the first one.
    lines: ['Year,Payment,Amount,Principal,Interest,Balance', 'Year 1,1,1896.20,271.20,1625.00,299728.80'],
    last: 'Year 30,360,1900.91,1890.67,10.24,0.00',
  },
  {
    kind: 'home',
    id: 'tile-calculator',
    lang: 'en',
    shared: enShared.island,
    texts: tileTexts,
    // The oracle's page-example: 120 sq ft, 12 × 12 in tiles, 10% extra, 132 tiles, 14 boxes of 10.
    lines: ['Item,Amount,Unit,Tile length (in),Tile width (in)', 'Area,120.00,sq ft,,', 'Tile size,,,12.00,12.00', 'Extra for cuts,10%,,,', 'Tiles needed,132,,,', 'Boxes to buy,14,,,'],
  },
  {
    kind: 'health',
    id: 'ovulation-calculator',
    lang: 'en',
    shared: enShared.island,
    texts: ovulationTexts,
    // The oracle's page-example: a last period on October 19, 2026, cycles of 28 days.
    lines: [
      'Fertile window (from),Fertile window (to),Ovulation,Next period',
      '2026-10-27,2026-11-01,2026-11-01,2026-11-16',
      '2026-11-24,2026-11-29,2026-11-29,2026-12-14',
      '2026-12-22,2026-12-27,2026-12-27,2027-01-11',
      '2027-01-19,2027-01-24,2027-01-24,2027-02-08',
      '2027-02-16,2027-02-21,2027-02-21,2027-03-08',
      '2027-03-16,2027-03-21,2027-03-21,2027-04-05',
    ],
  },
  {
    kind: 'Brazil in Portuguese',
    id: 'br-sac-price',
    lang: 'pt',
    shared: ptShared.island,
    texts: sacPriceTexts,
    // R$ 400.000,00 in 360 months, the first SAC payment with R$ 150,00 of insurance and fees.
    lines: ['Ano;Nº;Parcela;Amortização;Juros;Seguros e taxas;Saldo devedor;Correção (TR)', 'SAC · Ano 1;1;4754,95;1111,11;3493,84;150,00;398888,89;0,00'],
  },
  {
    kind: 'money in Spanish',
    id: 'apr-to-apy-calculator',
    lang: 'es',
    shared: esShared.island,
    texts: aprApyTexts,
    // 5% a year, each compounding: the percent glued to its number, as in English (C-5; DECISOES § 321).
    lines: ['Capitalización,APY', 'anual,5.00%', 'semestral,5.06%', 'trimestral,5.09%', 'mensual,5.12%', 'diaria,5.13%'],
  },
];

/** The CSV of the example as the island makes it: the definition's view with the page's texts, and the year word without its {n}. */
function expectedCsv(item: Export): string {
  const def = DEFS[item.id];
  const values = def.initial;
  const view = def.view(def.compute(def.toInput(values)), values, item.texts.panel, item.shared, item.lang);
  return csvText(view.table(), item.shared.year.replace(/\s*\{n\}/, ''), item.lang);
}

async function open(page: Page, path: string): Promise<void> {
  expect((await page.goto(path))?.status(), path).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

for (const item of EXPORTS) {
  test(`the CSV of a calculator (${item.kind}, ${item.id}) is the one the unit test checks, byte for byte`, async ({ page }) => {
    const where = moneyPage(item.id, item.lang);
    if (!where) throw new Error(`${item.id} has no page in ${item.lang}`);
    await open(page, where.path);
    await expect(csvButton(page)).toBeEnabled();
    const { name, bytes } = await saved(page, csvButton(page));
    expect(name).toBe(`${where.file}.csv`);
    // The BOM of UTF-8 (EF BB BF), then the text of the unit test, and nothing else.
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const expected = expectedCsv(item);
    expect(bytes.toString('utf8')).toBe(expected);
    expect(bytes.equals(Buffer.from(expected, 'utf8'))).toBe(true);
    // The lines by hand: CRLF after every one, the header and the first rows (and the last of a long schedule).
    const lines = bytes.toString('utf8').slice(1).split('\r\n');
    expect(lines.at(-1), 'the file ends with CRLF').toBe('');
    expect(lines.slice(0, item.lines.length)).toEqual([...item.lines]);
    if (item.last) expect(lines.at(-2)).toBe(item.last);
    expect(bytes.toString('utf8').slice(1).replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });
}
