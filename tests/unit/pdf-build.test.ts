import { PDFDocument } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { buildPdf, MARGIN, MAX_PAGE_SIDE, place } from '../../src/engine/pdf/build.ts';
import type { PdfPage } from '../../src/engine/pdf/build.ts';
import { jpegShell, tinyPng } from './lib/bytes.ts';

const wide = jpegShell(300, 200);
const tall = jpegShell(200, 300);
const png = tinyPng(10, 5, [10, 200, 30, 128]); // a transparent PNG: pdf-lib adds a soft mask for it

const pages: PdfPage[] = [
  { bytes: wide, format: 'jpeg', width: 300, height: 200 },
  { bytes: tall, format: 'jpeg', width: 200, height: 300 },
  { bytes: png, format: 'png', width: 10, height: 5 },
];

async function sizes(pdf: Uint8Array): Promise<[number, number][]> {
  const doc = await PDFDocument.load(pdf, { updateMetadata: false });
  return doc.getPages().map((page) => [page.getWidth(), page.getHeight()]);
}

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes).toString('latin1');

describe('pdf: one page per image, in order', () => {
  it('"Image size" makes each page the size of its image (1 px is 1 pt)', async () => {
    const pdf = await buildPdf(pages, 'image');
    expect(await sizes(pdf)).toEqual([
      [300, 200],
      [200, 300],
      [10, 5],
    ]);
    expect(latin1(pdf.subarray(0, 8))).toMatch(/^%PDF-1\.\d/);
  });

  it('Letter turns the sheet to the image and keeps the whole image inside the margins', async () => {
    const pdf = await buildPdf(pages, 'letter');
    expect(await sizes(pdf)).toEqual([
      [792, 612], // landscape image, landscape sheet
      [612, 792],
      [792, 612], // 10 × 5 is landscape too
    ]);
    for (const page of pages) {
      const placement = place(page.width, page.height, 'letter');
      const { image } = placement;
      expect(image.x).toBeGreaterThanOrEqual(MARGIN - 1e-9);
      expect(image.y).toBeGreaterThanOrEqual(MARGIN - 1e-9);
      expect(image.x + image.width).toBeLessThanOrEqual(placement.page.width - MARGIN + 1e-9);
      expect(image.y + image.height).toBeLessThanOrEqual(placement.page.height - MARGIN + 1e-9);
      expect(image.width / image.height).toBeCloseTo(page.width / page.height, 9);
    }
  });

  it('A4 is 595.28 × 841.89 pt, turned for wide images', async () => {
    const pdf = await buildPdf(pages, 'a4');
    const [first, second] = await sizes(pdf);
    expect(first).toEqual([841.89, 595.28]);
    expect(second).toEqual([595.28, 841.89]);
  });

  it('puts the image on the sheet where the arithmetic says', () => {
    expect(place(1000, 500, 'letter')).toEqual({ page: { width: 792, height: 612 }, image: { x: 36, y: 126, width: 720, height: 360 } });
    const a4 = place(500, 1000, 'a4');
    expect(a4.page).toEqual({ width: 595.28, height: 841.89 });
    expect(a4.image.height).toBeCloseTo(769.89, 6);
    expect(a4.image.width).toBeCloseTo(384.945, 3);
    expect(a4.image.y).toBeCloseTo(36, 9);
    expect(a4.image.x).toBeCloseTo((595.28 - a4.image.width) / 2, 9);
    // A square picture takes a portrait sheet and is enlarged to fit, centred.
    expect(place(10, 10, 'letter')).toEqual({ page: { width: 612, height: 792 }, image: { x: 36, y: 126, width: 540, height: 540 } });
  });

  it('keeps a huge image inside the page-size limit of Acrobat, in proportion', () => {
    const huge = place(28_800, 14_400, 'image');
    expect(huge.page).toEqual({ width: MAX_PAGE_SIDE, height: MAX_PAGE_SIDE / 2 });
    expect(place(300, 200, 'image').page).toEqual({ width: 300, height: 200 });
  });

  it('takes the page shape from the embedded image when the width and height given are not usable', async () => {
    const pdf = await buildPdf([{ bytes: wide, format: 'jpeg', width: 0, height: 0 }], 'image');
    expect(await sizes(pdf)).toEqual([[300, 200]]);
  });

  it('opens with one page per image and nothing else', async () => {
    const pdf = await buildPdf(pages, 'image');
    const doc = await PDFDocument.load(pdf, { updateMetadata: false });
    expect(doc.getPageCount()).toBe(3);
    const text = latin1(pdf);
    expect(text.match(/\/Type\s*\/Page\b/g)).toHaveLength(3);
    // Three image XObjects plus the soft mask pdf-lib builds for the transparent PNG.
    expect(text.match(/\/Subtype\s*\/Image/g)).toHaveLength(4);
  });
});

describe('pdf: what the file says about itself', () => {
  it('has Producer and Creator "FileOrca" and no other metadata', async () => {
    const pdf = await buildPdf(pages, 'image');
    const doc = await PDFDocument.load(pdf, { updateMetadata: false });
    expect(doc.getProducer()).toBe('FileOrca');
    expect(doc.getCreator()).toBe('FileOrca');
    expect(doc.getTitle()).toBeUndefined();
    expect(doc.getAuthor()).toBeUndefined();
    expect(doc.getSubject()).toBeUndefined();
    expect(doc.getKeywords()).toBeUndefined();
    expect(doc.getCreationDate()).toBeUndefined();
    expect(doc.getModificationDate()).toBeUndefined();
  });

  it('writes nothing of the sort in the bytes either: no XMP, no dates, no pdf-lib, no document id', async () => {
    const text = latin1(await buildPdf(pages, 'letter'));
    for (const forbidden of ['/Metadata', '/CreationDate', '/ModDate', '/Title', '/Author', '/Subject', '/Keywords', 'pdf-lib', 'xpacket', '/ID']) {
      expect(text.includes(forbidden), forbidden).toBe(false);
    }
    // The Info dictionary is readable (no object streams) and holds exactly the two entries.
    const info = text.match(/\/Producer\s*<([0-9A-F]+)>\s*\/Creator\s*<([0-9A-F]+)>|\/Creator\s*<([0-9A-F]+)>\s*\/Producer\s*<([0-9A-F]+)>/);
    expect(info).not.toBeNull();
    const fileorca = 'FEFF00460069006C0065004F007200630061'; // "FileOrca" in UTF-16
    expect(text.split(fileorca).length - 1).toBe(2);
  });

  it('embeds the JPEG bytes exactly as given, which is why the original photo must never be passed in', async () => {
    const pdf = Buffer.from(await buildPdf(pages, 'image'));
    expect(pdf.indexOf(Buffer.from(wide))).toBeGreaterThan(0);
    expect(pdf.indexOf(Buffer.from(tall))).toBeGreaterThan(0);
  });

  it('builds the same bytes twice for the same pages (no date, no random id)', async () => {
    const first = await buildPdf(pages, 'a4');
    const second = await buildPdf(pages, 'a4');
    expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
  });

  it('refuses to make a PDF without pages', async () => {
    await expect(buildPdf([], 'image')).rejects.toThrow('at least one page');
  });
});
