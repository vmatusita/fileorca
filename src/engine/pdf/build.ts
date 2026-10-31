// Builds a PDF from pages that are already images: the seed of the PDF engine (F5 grows it). Each
// page is one image, in the order given. The images come from the image engine's pdf-page operation
// (pixels written fresh, so no Exif or GPS), and are embedded as they are: pdf-lib puts JPEG bytes
// in the file verbatim, which is why the original photo must never be passed in.
//
// The document carries Producer and Creator "FileOrca" and nothing else: no title, author or
// keywords (they would come from file names), no dates, no XMP. updateMetadata: false stops pdf-lib
// from adding its own producer and the current date; object streams are off so the Info dictionary
// stays readable and every viewer opens the file.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PDFDocument } from '@cantoo/pdf-lib';

export interface PdfPage {
  /** A JPEG file or a PNG file. */
  bytes: Uint8Array;
  format: 'jpeg' | 'png';
  /** Pixels of the image (used for the page shape; 1 px is 1 pt). */
  width: number;
  height: number;
}

/** 'image': the page is the size of the image. 'letter' and 'a4': the image fits inside the sheet. */
export type PdfPageSize = 'image' | 'letter' | 'a4';

const SHEETS = {
  letter: { width: 612, height: 792 },
  a4: { width: 595.28, height: 841.89 },
} as const;

/** Margin of Letter and A4 pages, in points (half an inch). */
export const MARGIN = 36;

/** The longest page side Acrobat accepts, in points. */
export const MAX_PAGE_SIDE = 14_400;

export interface Placement {
  /** The page. */
  page: { width: number; height: number };
  /** Where the image goes on it. */
  image: { x: number; y: number; width: number; height: number };
}

/**
 * Page and image rectangle for one picture. "Image size" makes the page the picture (scaled down
 * only when it would pass the Acrobat limit); Letter and A4 turn the sheet to the picture's shape
 * (wide picture, wide sheet), leave a 36 pt margin and fit the whole picture inside, centred.
 */
export function place(width: number, height: number, size: PdfPageSize): Placement {
  if (size === 'image') {
    const k = Math.min(1, MAX_PAGE_SIDE / Math.max(width, height));
    const w = width * k;
    const h = height * k;
    return { page: { width: w, height: h }, image: { x: 0, y: 0, width: w, height: h } };
  }
  const sheet = SHEETS[size];
  const wide = width > height;
  const page = wide ? { width: sheet.height, height: sheet.width } : { width: sheet.width, height: sheet.height };
  const box = { width: page.width - 2 * MARGIN, height: page.height - 2 * MARGIN };
  const k = Math.min(box.width / width, box.height / height);
  const w = width * k;
  const h = height * k;
  return { page, image: { x: (page.width - w) / 2, y: (page.height - h) / 2, width: w, height: h } };
}

export async function buildPdf(pages: readonly PdfPage[], size: PdfPageSize): Promise<Uint8Array> {
  // A PDF without pages is not a document viewers agree on.
  if (pages.length === 0) throw new Error('a PDF needs at least one page');
  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.setProducer('FileOrca');
  doc.setCreator('FileOrca');
  for (const source of pages) {
    const image = source.format === 'png' ? await doc.embedPng(source.bytes) : await doc.embedJpg(source.bytes);
    const placement = place(source.width > 0 ? source.width : image.width, source.height > 0 ? source.height : image.height, size);
    const page = doc.addPage([placement.page.width, placement.page.height]);
    page.drawImage(image, placement.image);
  }
  return doc.save({ useObjectStreams: false });
}
