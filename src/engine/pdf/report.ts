// The PDF of a money calculator (F4; DECISOES § 115): the calculator's name, what the person entered, the
// result, the assumptions, the whole schedule, the educational notice and the site address, on Letter
// pages (A4 for the Portuguese pages, F6 decision 5), in the standard Helvetica fonts (no font file is embedded). The island hands over strings that
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
  /** The paper: Letter when left out (the English and Spanish pages), A4 for the Portuguese ones. */
  paper?: 'a4';
}

/** Page sizes in points: US Letter, and A4 as build.ts has it. */
const PAPER = { letter: { width: 612, height: 792 }, a4: { width: 595.28, height: 841.89 } };
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
  // F7: the circle of the home calculators.
  'π': 'pi',
};

export function winAnsi(text: string): string {
  return [...text]
    .map((char) => REPLACE[char] ?? char)
    .join('')
    .replace(/[^\x20-\x7e¡-ÿ]/g, '');
}

interface Pen {
  doc: PDFDocument;
  size: { width: number; height: number };
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

function newPage(pen: Pen): void {
  pen.page = pen.doc.addPage([pen.size.width, pen.size.height]);
  pen.y = pen.size.height - MARGIN;
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
  for (const line of wrap(winAnsi(text), font, size, pen.size.width - 2 * MARGIN)) {
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

/** Least room between a label and its value on one line, in points; a value that would come closer goes under it. */
const PAIR_GAP = 12;

function pairs(pen: Pen, rows: [string, string][]): void {
  const available = pen.size.width - 2 * MARGIN;
  for (const [label, value] of rows) {
    room(pen, LINE);
    const name = winAnsi(label);
    pen.page.drawText(name, { x: MARGIN, y: pen.y, size: BODY, font: pen.regular });
    const text = winAnsi(value);
    const width = pen.bold.widthOfTextAtSize(text, BODY);
    if (pen.regular.widthOfTextAtSize(name, BODY) + PAIR_GAP + width <= available) {
      pen.page.drawText(text, { x: pen.size.width - MARGIN - width, y: pen.y, size: BODY, font: pen.bold });
      pen.y -= LINE;
      continue;
    }
    // A value too long for the line of its label (the payoff order of ten debts in pt and es) goes under the label, in
    // lines that keep to the right like the other values (review F4-F7 h-3; DECISOES § 305).
    pen.y -= LINE;
    for (const line of wrap(text, pen.bold, BODY, available)) {
      room(pen, LINE);
      pen.page.drawText(line, { x: pen.size.width - MARGIN - pen.bold.widthOfTextAtSize(line, BODY), y: pen.y, size: BODY, font: pen.bold });
      pen.y -= LINE;
    }
  }
}

/** Room between two columns of the table, in points. */
const COLUMN_GAP = 6;

/**
 * Where each column of the table ends (its numbers end there) and the size of the text. The first column is a fifth of the
 * width and the others share the rest, as since the F4, whenever every text fits its share (every English table): the
 * drawing, and so the bytes, stay as they were. A table whose text would run into the next column (the SAC × PRICE in A4,
 * with its column of insurance and fees) gets columns as wide as their widest text instead, and a smaller type if they
 * still do not fit (review F6, second pass; DECISOES § 255).
 */
export function columnLayout(left: number, width: number, head: string[], rows: string[][], fonts: { regular: PDFFont; bold: PDFFont }): { rightOf: (index: number) => number; size: number } {
  const measure = (size: number) =>
    head.map((label, index) => Math.max(fonts.bold.widthOfTextAtSize(winAnsi(label), size), ...rows.map((cells) => fonts.regular.widthOfTextAtSize(winAnsi(cells[index] ?? ''), size))));
  const widest = measure(SMALL);
  const first = width * 0.2;
  const rest = (width - first) / Math.max(1, head.length - 1);
  if (widest.every((need, index) => need + COLUMN_GAP <= (index === 0 ? first : rest))) return { rightOf: (index) => left + first + rest * index, size: SMALL };
  const gaps = COLUMN_GAP * head.length;
  const text = widest.reduce((sum, need) => sum + need, 0);
  const size = text + gaps > width ? (SMALL * (width - gaps)) / text : SMALL;
  const columns = measure(size).map((need) => need + COLUMN_GAP);
  const spare = Math.max(0, width - columns.reduce((sum, column) => sum + column, 0)) / Math.max(1, head.length - 1);
  const rights: number[] = [];
  let x = left;
  columns.forEach((column, index) => {
    x += column + (index === 0 ? 0 : spare);
    rights.push(x);
  });
  return { rightOf: (index) => rights[index] ?? left + width, size };
}

/** The table: the first column to the left, the numbers to the right, the header again on every page. */
function table(pen: Pen, head: string[], rows: string[][]): void {
  const { rightOf, size } = columnLayout(MARGIN, pen.size.width - 2 * MARGIN, head, rows, pen);
  const draw = (cells: string[], font: PDFFont) => {
    cells.forEach((value, index) => {
      const text = winAnsi(value);
      if (index === 0) pen.page.drawText(text, { x: MARGIN, y: pen.y, size, font });
      else {
        const right = rightOf(index);
        pen.page.drawText(text, { x: right - font.widthOfTextAtSize(text, size), y: pen.y, size, font });
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
  const size = PAPER[input.paper ?? 'letter'];
  const pen: Pen = {
    doc,
    size,
    page: doc.addPage([size.width, size.height]),
    y: size.height - MARGIN,
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
