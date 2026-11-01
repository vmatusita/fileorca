// The PDF of a calculator (prompt F4, decision 7): built in Node by the same function the PDF worker runs,
// it passes strictPdf, carries no date and no title in its Info dictionary, and its content streams, inflated
// here, draw the calculator's name, the total, the whole schedule down to the last payment, the notice and the
// site address, with nothing drawn as "?" (the standard fonts only encode WinAnsi).
import { describe, expect, it } from 'vitest';
import { buildReport, winAnsi } from '../../src/engine/pdf/report.ts';
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
