// The CSV and the PDF of a calculator, both made on the device (DECISOES § 115). The CSV comes from the
// island: UTF-8 with a BOM, quotes by RFC 4180, a header and then the same rows as the table; comma separator and dot
// decimal in English and Spanish, semicolon and decimal comma in Portuguese (PLANO "Regra das calculadoras"; F6,
// decisions 1, 5 and 6). The PDF is built by pdf-lib in the PDF worker that already exists, only on the click, on
// Letter pages (A4 in Portuguese); a failure to load it is the "reload the page" line, never a stuck page. File names
// are fixed (registry `file`), never a number the person typed.
import { formatScaled } from '../../calc/parse.ts';
import type { ReportInput } from '../../engine/pdf/report.ts';
import type { Lang } from '../../i18n/routes.ts';
import type { CalcSharedTexts, Cell, CsvValue, Table } from './types.ts';

/** The separator of the CSV columns: a semicolon where the decimal is a comma (Portuguese), a comma elsewhere. */
export const CSV_SEPARATOR: Record<Lang, string> = { en: ',', pt: ';', es: ',' };

/**
 * A value as the CSV writes it (F16, item 5; DECISOES § 687): money as 1896.20 and a number with the decimals of its cell
 * (1896,20 in Portuguese; no thousands separator, ASCII minus, a percent glued to its number), a day as it is (2026-11-02),
 * a text as it is, and nothing as an empty cell.
 */
function csvValue(value: CsvValue, lang: Lang): string {
  if (value === null) return '';
  const numbers = lang === 'pt' ? 'pt' : 'en';
  if ('cents' in value) return formatScaled(value.cents, 2, numbers, { min: 2, group: false, minus: '-' });
  if ('scaled' in value) return `${formatScaled(value.scaled, value.decimals, numbers, { min: value.decimals, group: false, minus: '-' })}${value.percent ? '%' : ''}`;
  return 'day' in value ? value.day : value.text;
}

/**
 * What a cell writes in the CSV, one value per column: cents and a measure as numbers (F7), a text cell its `csv` values
 * (F16), else its text with a percent glued to its number: the no-break space Spanish puts before the "%" on the screen and
 * in the PDF (DECISOES § 213) stays out of the file ("5.00%", so a spreadsheet reads a number; languages adjustment, C-5).
 */
export function csvCells(cell: Cell, lang: Lang = 'en'): string[] {
  if ('cents' in cell || 'scaled' in cell) return [csvValue(cell, lang)];
  return cell.csv ? cell.csv.map((value) => csvValue(value, lang)) : [cell.text.replace(/(\d)\u00A0%/g, '$1%')];
}

function quote(text: string, separator: string): string {
  return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** The CSV of a table: the header of its CSV columns and the rows of the screen; grouped tables get the year as a first column. */
export function csvText(table: Table, yearHeading: string, lang: Lang = 'en'): string {
  const separator = CSV_SEPARATOR[lang];
  const head = table.csv.map((column) => column.head);
  const row = (cells: readonly Cell[]): string[] => cells.flatMap((cell) => csvCells(cell, lang));
  const lines: string[][] = table.groups
    ? [[yearHeading, ...head], ...table.groups.flatMap((group) => table.rows.slice(group.from, group.to).map((cells) => [group.label, ...row(cells)]))]
    : [head, ...table.rows.map(row)];
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
