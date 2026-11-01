// The CSV and the PDF of a calculator, both made on the device (DECISOES § 115). The CSV comes from the
// island: UTF-8 with a BOM, comma separator and dot decimal in English, quotes by RFC 4180, a header and
// then the same rows as the table. The PDF is built by pdf-lib in the PDF worker that already exists, only
// on the click; a failure to load it is the "reload the page" line, never a stuck page. File names are
// fixed (registry `file`), never a number the person typed.
import { formatScaled } from '../../calc/parse.ts';
import type { ReportInput } from '../../engine/pdf/report.ts';
import type { CalcSharedTexts, Cell, Table } from './types.ts';

/** A cell as the CSV writes it: cents as 1896.20 (no thousands separator, ASCII minus), text as it is. */
export function csvCell(cell: Cell): string {
  return 'cents' in cell ? formatScaled(cell.cents, 2, 'en', { min: 2, group: false, minus: '-' }) : cell.text;
}

function quote(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** The CSV of a table: grouped tables get the year as a first column. */
export function csvText(table: Table, yearHeading: string): string {
  const lines: string[][] = [];
  if (table.groups) {
    lines.push([yearHeading, ...table.head]);
    for (const group of table.groups) for (const cells of table.rows.slice(group.from, group.to)) lines.push([group.label, ...cells.map(csvCell)]);
  } else {
    lines.push([...table.head]);
    for (const cells of table.rows) lines.push(cells.map(csvCell));
  }
  return `﻿${lines.map((line) => line.map(quote).join(',')).join('\r\n')}\r\n`;
}

/** Hands a file to the browser's download, from the page itself (nothing leaves the device). */
export function save(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export interface ReportParts {
  title: string;
  inputs: [string, string][];
  results: [string, string][];
  premises: string[];
  table: Table;
  notice: string;
  cell: (value: Cell) => string;
}

export function reportInput(parts: ReportParts, t: CalcSharedTexts): ReportInput {
  const { table, cell } = parts;
  const rows = table.groups
    ? table.groups.flatMap((group) => table.rows.slice(group.from, group.to).map((cells) => [group.label, ...cells.map(cell)]))
    : table.rows.map((cells) => cells.map(cell));
  return {
    title: parts.title,
    inputs: parts.inputs,
    results: parts.results,
    premises: parts.premises,
    table: { head: table.groups ? [t.year.replace(/\s*\{n\}/, ''), ...table.head] : [...table.head], rows },
    notice: parts.notice,
    labels: t.pdfLabels,
  };
}

/** The PDF, from the worker; rejects with EngineUnavailable when the worker or its chunk cannot load. */
export async function reportPdf(input: ReportInput): Promise<Blob> {
  const client = await import('../image/pdf-client.ts').catch(() => {
    throw Object.assign(new Error('the PDF client failed to load'), { name: 'EngineUnavailable' });
  });
  return client.buildReport(input);
}
