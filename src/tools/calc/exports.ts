// The CSV and the PDF of a calculator, both made on the device (DECISOES § 115). The CSV comes from the
// island: UTF-8 with a BOM, quotes by RFC 4180, a header and then the same rows as the table; comma separator and dot
// decimal in English and Spanish, semicolon and decimal comma in Portuguese (PLANO "Regra das calculadoras"; F6,
// decisions 1, 5 and 6). The PDF is built by pdf-lib in the PDF worker that already exists, only on the click, on
// Letter pages (A4 in Portuguese); a failure to load it is the "reload the page" line, never a stuck page. File names
// are fixed (registry `file`), never a number the person typed.
import { formatScaled } from '../../calc/parse.ts';
import type { ReportInput } from '../../engine/pdf/report.ts';
import type { Lang } from '../../i18n/routes.ts';
import type { CalcSharedTexts, Cell, Table } from './types.ts';

/** The separator of the CSV columns: a semicolon where the decimal is a comma (Portuguese), a comma elsewhere. */
export const CSV_SEPARATOR: Record<Lang, string> = { en: ',', pt: ';', es: ',' };

/**
 * A cell as the CSV writes it: cents as 1896.20 (1896,20 in Portuguese; no thousands separator, ASCII minus), a measure with
 * its decimals (1234.50, F7), text as it is.
 */
export function csvCell(cell: Cell, lang: Lang = 'en'): string {
  const numbers = lang === 'pt' ? 'pt' : 'en';
  if ('cents' in cell) return formatScaled(cell.cents, 2, numbers, { min: 2, group: false, minus: '-' });
  if ('scaled' in cell) return formatScaled(cell.scaled, cell.decimals, numbers, { min: cell.decimals, group: false, minus: '-' });
  return cell.text;
}

function quote(text: string, separator: string): string {
  return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** The CSV of a table: grouped tables get the year as a first column. */
export function csvText(table: Table, yearHeading: string, lang: Lang = 'en'): string {
  const separator = CSV_SEPARATOR[lang];
  const lines: string[][] = [];
  if (table.groups) {
    lines.push([yearHeading, ...table.head]);
    for (const group of table.groups) for (const cells of table.rows.slice(group.from, group.to)) lines.push([group.label, ...cells.map((cell) => csvCell(cell, lang))]);
  } else {
    lines.push([...table.head]);
    for (const cells of table.rows) lines.push(cells.map((cell) => csvCell(cell, lang)));
  }
  return `﻿${lines.map((line) => line.map((text) => quote(text, separator)).join(separator)).join('\r\n')}\r\n`;
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
  /** The heading of the table in the PDF: the calculator's own (F7: "Your areas"), else "Schedule". */
  tableHeading?: string | undefined;
  inputs: [string, string][];
  results: [string, string][];
  premises: string[];
  table: Table;
  notice: string;
  cell: (value: Cell) => string;
}

export function reportInput(parts: ReportParts, t: CalcSharedTexts, lang: Lang = 'en'): ReportInput {
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
    labels: parts.tableHeading ? { ...t.pdfLabels, schedule: parts.tableHeading } : t.pdfLabels,
    ...(lang === 'pt' ? { paper: 'a4' as const } : {}),
  };
}

/** The PDF, from the worker; rejects with EngineUnavailable when the worker or its chunk cannot load. */
export async function reportPdf(input: ReportInput): Promise<Blob> {
  const client = await import('../image/pdf-client.ts').catch(() => {
    throw Object.assign(new Error('the PDF client failed to load'), { name: 'EngineUnavailable' });
  });
  return client.buildReport(input);
}
