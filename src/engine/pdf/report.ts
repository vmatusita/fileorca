// The PDF of a money calculator (F4; DECISOES § 115): the calculator's name, what the person entered, the
// result, the assumptions, the whole schedule, the educational notice and the site address, on Letter
// pages, in the standard Helvetica fonts (no font file is embedded). The island hands over strings that
// are already formatted; the standard fonts only encode WinAnsi, so every string goes through `winAnsi`
// first (a typographic minus becomes "-", a no-break space a space). Like build.ts: Producer and Creator
// "FileOrca" and nothing else in the Info dictionary (no title with numbers, no dates), object streams off.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from '@cantoo/pdf-lib';

export interface ReportInput {
  title: string;
  inputs: [string, string][];
  results: [string, string][];
  premises: string[];
  table: { head: string[]; rows: string[][] };
  notice: string;
  labels: { inputs: string; results: string; premises: string; schedule: string; notice: string; site: string; page: string };
}

const PAGE = { width: 612, height: 792 };
const MARGIN = 48;
const BODY = 10;
const SMALL = 8.5;
const LINE = 14;

/** Characters the standard fonts can draw (WinAnsi): what else would print as "?" is mapped or dropped. */
const REPLACE: Record<string, string> = {
  '−': '-',
  '–': '-',
  '—': '-',
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  '‘': "'",
  '’': "'",
  '“': '"',
  '”': '"',
  '…': '...',
  '×': 'x',
};

export function winAnsi(text: string): string {
  return [...text]
    .map((char) => REPLACE[char] ?? char)
    .join('')
    .replace(/[^\x20-\x7e¡-ÿ]/g, '');
}

interface Pen {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

function newPage(pen: Pen): void {
  pen.page = pen.doc.addPage([PAGE.width, PAGE.height]);
  pen.y = PAGE.height - MARGIN;
}

function room(pen: Pen, needed: number): void {
  if (pen.y - needed < MARGIN + LINE) newPage(pen);
}

/** Words of `text` cut into lines no wider than `width`. */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(pen: Pen, text: string, size = BODY, font = pen.regular): void {
  for (const line of wrap(winAnsi(text), font, size, PAGE.width - 2 * MARGIN)) {
    room(pen, LINE);
    pen.page.drawText(line, { x: MARGIN, y: pen.y, size, font });
    pen.y -= LINE;
  }
}

function heading(pen: Pen, text: string): void {
  room(pen, LINE * 3);
  pen.y -= LINE / 2;
  pen.page.drawText(winAnsi(text), { x: MARGIN, y: pen.y, size: 12, font: pen.bold });
  pen.y -= LINE * 1.4;
}

function pairs(pen: Pen, rows: [string, string][]): void {
  for (const [label, value] of rows) {
    room(pen, LINE);
    pen.page.drawText(winAnsi(label), { x: MARGIN, y: pen.y, size: BODY, font: pen.regular });
    const text = winAnsi(value);
    const width = pen.bold.widthOfTextAtSize(text, BODY);
    pen.page.drawText(text, { x: PAGE.width - MARGIN - width, y: pen.y, size: BODY, font: pen.bold });
    pen.y -= LINE;
  }
}

/** The table: the first column to the left, the numbers to the right, the header again on every page. */
function table(pen: Pen, head: string[], rows: string[][]): void {
  const width = PAGE.width - 2 * MARGIN;
  const first = width * 0.2;
  const rest = (width - first) / Math.max(1, head.length - 1);
  const draw = (cells: string[], font: PDFFont) => {
    cells.forEach((value, index) => {
      const text = winAnsi(value);
      if (index === 0) pen.page.drawText(text, { x: MARGIN, y: pen.y, size: SMALL, font });
      else {
        const right = MARGIN + first + rest * index;
        pen.page.drawText(text, { x: right - font.widthOfTextAtSize(text, SMALL), y: pen.y, size: SMALL, font });
      }
    });
    pen.y -= LINE - 2;
  };
  room(pen, LINE * 2);
  draw(head, pen.bold);
  for (const cells of rows) {
    if (pen.y - LINE < MARGIN + LINE) {
      newPage(pen);
      draw(head, pen.bold);
    }
    draw(cells, pen.regular);
  }
}

export async function buildReport(input: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.setProducer('FileOrca');
  doc.setCreator('FileOrca');
  const pen: Pen = {
    doc,
    page: doc.addPage([PAGE.width, PAGE.height]),
    y: PAGE.height - MARGIN,
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  pen.page.drawText(winAnsi(input.title), { x: MARGIN, y: pen.y, size: 18, font: pen.bold });
  pen.y -= LINE * 2;
  heading(pen, input.labels.inputs);
  pairs(pen, input.inputs);
  heading(pen, input.labels.results);
  pairs(pen, input.results);
  heading(pen, input.labels.premises);
  for (const premise of input.premises) paragraph(pen, `- ${premise}`);
  if (input.table.rows.length > 0) {
    heading(pen, input.labels.schedule);
    table(pen, input.table.head, input.table.rows);
  }
  heading(pen, input.labels.notice);
  paragraph(pen, input.notice);
  paragraph(pen, input.labels.site, BODY, pen.bold);
  const pages = doc.getPages();
  pages.forEach((page, index) => {
    const text = winAnsi(input.labels.page.replace('{n}', String(index + 1)).replace('{total}', String(pages.length)));
    page.drawText(text, { x: MARGIN, y: MARGIN / 2, size: SMALL, font: pen.regular });
  });
  return doc.save({ useObjectStreams: false });
}
