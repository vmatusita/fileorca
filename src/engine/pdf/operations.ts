// The tools that change a document in place (F5a): Rotate, Reorder, Add page numbers, Watermark and Sign. The file
// keeps everything it had (its form, links, bookmarks, Info and XMP) and gets nothing of the device: pdf-lib loads it
// with updateMetadata off. An XFA form goes (it describes the pages as they were, and only Adobe apps read it); the
// AcroForm fields stay. Text uses the standard fonts, so it is WinAnsi (winAnsi() maps or drops the rest).
// Positions are on the page as shown (geometry.ts): the CropBox and /Rotate of each page, never the MediaBox alone.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { PDFDict, PDFName, PDFNumber, PDFRef, StandardFonts, degrees, grayscale, rgb, type PDFDocument, type PDFPage } from '@cantoo/pdf-lib';
import { shownSize, toUser, turn } from './geometry.ts';
import { pageBox } from './open.ts';
import { winAnsi } from './report.ts';
import type { NumberFormat, Position } from './types.ts';

/** Takes the XFA form out of the AcroForm; returns whether there was one. */
export function removeXfa(doc: PDFDocument): boolean {
  const form = doc.catalog.lookup(PDFName.of('AcroForm'));
  if (!(form instanceof PDFDict) || !form.has(PDFName.of('XFA'))) return false;
  form.delete(PDFName.of('XFA'));
  return true;
}

/** Quarter turns clockwise for each page: `pages[i]` when set, else `all`. */
export function rotatePages(doc: PDFDocument, all: number, pages: Readonly<Record<number, number>>): void {
  doc.getPages().forEach((page, index) => {
    const quarters = ((pages[index] ?? all) % 4 + 4) % 4;
    if (quarters === 0) return;
    page.setRotation(degrees((pageBox(page).rotate + quarters * 90) % 360));
  });
}

const INHERITED = ['Resources', 'MediaBox', 'CropBox', 'Rotate'] as const;

/**
 * The pages in `order` (every index once). The page objects stay, so links and bookmarks still lead to them; the tree
 * becomes one flat list under the root (pdf-lib's own remove-and-insert breaks on nested trees), and what a page
 * inherited from an inner node is written on the page first.
 */
export function reorderPages(doc: PDFDocument, order: readonly number[]): void {
  const pages = doc.getPages();
  if (order.length !== pages.length || new Set(order).size !== pages.length || order.some((index) => !(index >= 0 && index < pages.length))) {
    throw new Error('the new order must name every page once');
  }
  const rootRef = doc.catalog.get(PDFName.of('Pages'));
  const root = doc.catalog.lookup(PDFName.of('Pages'));
  if (!(rootRef instanceof PDFRef) || !(root instanceof PDFDict)) throw new Error('no page tree');
  for (const page of pages) {
    for (const key of INHERITED) {
      const name = PDFName.of(key);
      if (page.node.has(name)) continue;
      const value = page.node.getInheritableAttribute(name);
      if (value !== undefined) page.node.set(name, value);
    }
  }
  root.set(PDFName.of('Kids'), doc.context.obj(order.map((index) => (pages[index] as PDFPage).ref)));
  root.set(PDFName.of('Count'), PDFNumber.of(pages.length));
  for (const page of pages) page.node.set(PDFName.of('Parent'), rootRef);
}

/** Size and margin of the page numbers, in points. */
export const NUMBER_SIZE = 10;
export const NUMBER_MARGIN = 28;

/** The text of one number ("Page" is English on every page until the F6). */
export function numberText(format: NumberFormat, n: number, last: number): string {
  switch (format) {
    case 'page-n':
      return `Page ${n}`;
    case 'page-n-of-total':
      return `Page ${n} of ${last}`;
    case 'n-of-total':
      return `${n} of ${last}`;
    default:
      return String(n);
  }
}

/**
 * Numbers the pages. With `skipFirst` the first page gets none and the second one gets `start`; "of N" is the last
 * number written (DECISOES § 146).
 */
export async function numberPages(doc: PDFDocument, options: { position: Position; format: NumberFormat; start: number; skipFirst: boolean }): Promise<void> {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const numbered = options.skipFirst ? pages.length - 1 : pages.length;
  const last = options.start + numbered - 1;
  const [vertical, horizontal] = options.position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
  pages.forEach((page, index) => {
    if (options.skipFirst && index === 0) return;
    const n = options.start + index - (options.skipFirst ? 1 : 0);
    const text = numberText(options.format, n, last);
    const { box, rotate } = pageBox(page);
    const { width, height } = shownSize(box, rotate);
    const textWidth = font.widthOfTextAtSize(text, NUMBER_SIZE);
    const vx = horizontal === 'left' ? NUMBER_MARGIN : horizontal === 'right' ? width - NUMBER_MARGIN - textWidth : (width - textWidth) / 2;
    const vy = vertical === 'top' ? height - NUMBER_MARGIN - font.heightAtSize(NUMBER_SIZE, { descender: false }) : NUMBER_MARGIN;
    const at = toUser(box, rotate, vx, vy);
    page.drawText(text, { x: at.x, y: at.y, size: NUMBER_SIZE, font, color: rgb(0, 0, 0), rotate: degrees(at.angle) });
  });
}

/** How wide the watermark is, as a share of the line it lies on (the diagonal, or the width), and how see-through. */
export const WATERMARK_SIZE = { small: 0.35, medium: 0.55, large: 0.8 } as const;
export const WATERMARK_OPACITY = { light: 0.15, medium: 0.3, strong: 0.5 } as const;

/** The watermark text with only what the standard font can draw, trimmed; empty when nothing is left. */
export function watermarkText(text: string): string {
  return winAnsi(text).replace(/\s+/g, ' ').trim();
}

export async function watermarkPages(
  doc: PDFDocument,
  options: { text: string; size: keyof typeof WATERMARK_SIZE; opacity: keyof typeof WATERMARK_OPACITY; direction: 'diagonal' | 'horizontal' },
): Promise<void> {
  const text = watermarkText(options.text);
  if (!text) throw new Error('no text the standard fonts can draw');
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const unit = font.widthOfTextAtSize(text, 1);
  for (const page of doc.getPages()) {
    const { box, rotate } = pageBox(page);
    const { width, height } = shownSize(box, rotate);
    const angle = options.direction === 'diagonal' ? 45 : 0;
    const line = options.direction === 'diagonal' ? Math.hypot(width, height) : width;
    // Never taller than a third of the page: a short word on a big page would be a block, not a mark.
    const size = Math.min((WATERMARK_SIZE[options.size] * line) / unit, height / 3);
    const textWidth = unit * size;
    const capHeight = font.heightAtSize(size, { descender: false });
    // The baseline starts where the middle of the text lands on the middle of the page, turned by the angle.
    const half = turn(textWidth / 2, capHeight / 2, angle);
    const at = toUser(box, rotate, width / 2 - half.x, height / 2 - half.y);
    page.drawText(text, {
      x: at.x,
      y: at.y,
      size,
      font,
      color: grayscale(0.5),
      opacity: WATERMARK_OPACITY[options.opacity],
      rotate: degrees(at.angle + angle),
    });
  }
}

/**
 * Draws the signature image (a PNG) on each page of `pages`, in the box given as fractions of the page as shown: the
 * top left corner (x, y from the top) and the width; the height follows the image.
 */
export async function signPages(doc: PDFDocument, png: Uint8Array, pages: readonly number[], box: { x: number; y: number; width: number }): Promise<void> {
  const image = await doc.embedPng(png);
  const all = doc.getPages();
  for (const index of new Set(pages)) {
    const page = all[index];
    if (!page) continue;
    const { box: visible, rotate } = pageBox(page);
    const { width, height } = shownSize(visible, rotate);
    const w = box.width * width;
    const h = (w * image.height) / image.width;
    const at = toUser(visible, rotate, box.x * width, height - box.y * height - h);
    page.drawImage(image, { x: at.x, y: at.y, width: w, height: h, rotate: degrees(at.angle) });
  }
}
