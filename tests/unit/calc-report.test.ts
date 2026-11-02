// The PDF of a calculator (prompt F4, decision 7): built in Node by the same function the PDF worker runs,
// it passes strictPdf, carries no date and no title in its Info dictionary, and its content streams, inflated
// here, draw the calculator's name, the total, the whole schedule down to the last payment, the notice and the
// site address, with nothing drawn as "?" (the standard fonts only encode WinAnsi).
import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { buildReport, columnLayout, winAnsi } from '../../src/engine/pdf/report.ts';
import { CALC_PAGE_IDS, ES_CALC_IDS, type MoneyPageId } from '../../src/tools/calc/registry.ts';
import { DEFS } from '../../src/tools/calc/defs/index.ts';
import { panelData } from '../../src/tools/calc/page.ts';
import { viewOf } from '../../src/tools/calc/store.ts';
import { reportInput } from '../../src/tools/calc/exports.ts';
import { cellText, inputRows } from '../../src/tools/calc/view.ts';
import { parsePdf, strictPdf } from '../e2e/lib/pdf.ts';
import { pdfTextLines } from '../e2e/lib/pdf-text.ts';

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
    expect(winAnsi('arrow → emoji \u{1F600}')).toBe('arrow  emoji ');
  });
});

// Second pass of the review F6 (DECISOES § 255): the column of insurance and fees took the SAC × PRICE table to 8 columns in
// A4, and its texts ran into each other. The layout gives a table whose texts overflow their share columns as wide as their
// text (and a smaller type); every table whose texts fit keeps the even layout, so the English and Spanish PDFs keep their bytes.
describe('the columns of the calculator PDF', () => {
  const tableOf = (id: MoneyPageId, lang: 'en' | 'es' | 'pt') => {
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
