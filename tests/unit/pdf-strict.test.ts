// The strict check of the Image to PDF output (tests/e2e/lib/pdf.ts, strictPdf) proven to say NO when it must.
// The matrix reads the PDF with a lenient scanner; this check does not trust it: header, %%EOF, startxref, every
// xref entry, the trailer and a real load by @cantoo/pdf-lib. The positive controls are PDFs made by the engine.
import { PDFDocument } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { buildPdf } from '../../src/engine/pdf/build.ts';
import type { PdfPage } from '../../src/engine/pdf/build.ts';
import { pdfStructureProblems, strictPdf } from '../e2e/lib/pdf.ts';
import { jpegShell, tinyPng } from './lib/bytes.ts';

const pages: PdfPage[] = [
  { bytes: jpegShell(300, 200), format: 'jpeg', width: 300, height: 200 },
  { bytes: jpegShell(200, 300), format: 'jpeg', width: 200, height: 300 },
  { bytes: tinyPng(10, 5, [10, 200, 30, 128]), format: 'png', width: 10, height: 5 },
];

const latin1 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');
const bytesOf = (text: string): Uint8Array => new Uint8Array(Buffer.from(text, 'latin1'));

/** The PDF as text, changed by `edit`, and back to bytes: one flaw at a time. */
async function flawed(edit: (text: string) => string): Promise<Uint8Array> {
  const text = latin1(await buildPdf(pages, 'image'));
  const changed = edit(text);
  expect(changed, 'the edit changed the file').not.toBe(text);
  return bytesOf(changed);
}

describe('strictPdf: a sound PDF', () => {
  it('passes on what the engine makes, and pdf-lib counts one page per image', async () => {
    const pdf = await buildPdf(pages, 'image');
    expect(await strictPdf(pdf)).toEqual({ problems: [], pageCount: 3 });
  });

  it('passes on the other layout too, with an xref stream instead of a table', async () => {
    const document = await PDFDocument.create({ updateMetadata: false });
    document.addPage([100, 100]);
    document.addPage([100, 100]);
    const compressed = await document.save({ useObjectStreams: true });
    expect(latin1(compressed)).toContain('/XRef');
    expect(await strictPdf(compressed)).toEqual({ problems: [], pageCount: 2 });
  });
});

describe('strictPdf: it says NO', () => {
  it('without the %PDF header', async () => {
    const problems = pdfStructureProblems(await flawed((text) => text.replace('%PDF-', '%PDX-')));
    expect(problems.join('\n')).toMatch(/does not start with %PDF/);
  });

  it('without %%EOF at the end, or with something after it', async () => {
    expect(pdfStructureProblems(await flawed((text) => text.slice(0, text.lastIndexOf('%%EOF'))))).not.toEqual([]);
    expect(pdfStructureProblems(await flawed((text) => `${text}junk`)).join('\n')).toMatch(/does not end with %%EOF/);
  });

  it('when startxref is missing, or points at neither a table nor an xref stream', async () => {
    expect(pdfStructureProblems(await flawed((text) => text.replace('startxref', 'startxxxx'))).join('\n')).toMatch(/no startxref/);
    expect(pdfStructureProblems(await flawed((text) => text.replace(/startxref\s+\d+/, 'startxref\n12'))).join('\n')).toMatch(/points at neither/);
    expect(pdfStructureProblems(await flawed((text) => text.replace(/startxref\s+\d+/, 'startxref\n99999999'))).join('\n')).toMatch(/not inside the body/);
  });

  it('when startxref points at an object that is not the xref stream', async () => {
    const document = await PDFDocument.create({ updateMetadata: false });
    document.addPage([100, 100]);
    const text = latin1(await document.save({ useObjectStreams: true }));
    // The first object, which is not the xref stream (that is the last one in the file).
    const first = text.indexOf('\n1 0 obj') + 1;
    expect(first).toBeGreaterThan(0);
    const problems = pdfStructureProblems(bytesOf(text.replace(/startxref\s+\d+/, `startxref\n${first}`)));
    expect(problems.join('\n')).toMatch(/is not an xref stream/);
  });

  it('when an entry of the xref table points at the wrong place', async () => {
    const problems = pdfStructureProblems(
      await flawed((text) => {
        // The second entry of the table (object 1), moved by one byte.
        const entries = /xref\s+0 \d+\s+\d{10} 65535 f\s+(\d{10}) 00000 n/.exec(text);
        if (!entries) throw new Error('no xref table to bend');
        const wrong = String(Number(entries[1]) + 1).padStart(10, '0');
        return text.replace(`${entries[1]} 00000 n`, `${wrong} 00000 n`);
      }),
    );
    expect(problems.join('\n')).toMatch(/xref entry 1 .* does not point at "1 0 obj"/);
  });

  it('when the trailer Size is not the number of objects, or the Root is gone', async () => {
    expect(pdfStructureProblems(await flawed((text) => text.replace(/\/Size \d+/, '/Size 3'))).join('\n')).toMatch(/\/Size is 3/);
    expect(pdfStructureProblems(await flawed((text) => text.replace('/Root', '/Rxxt'))).join('\n')).toMatch(/no \/Root/);
  });

  it('when pdf-lib cannot load it, which also leaves no page count', async () => {
    const garbage = bytesOf('%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 9 0 R >>\nendobj\nstartxref\n9\n%%EOF\n');
    const result = await strictPdf(garbage);
    expect(result.pageCount).toBeNull();
    expect(result.problems.join('\n')).toMatch(/pdf-lib cannot load/);
  });
});
