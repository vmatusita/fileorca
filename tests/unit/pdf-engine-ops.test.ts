// Every operation of the PDF engine on the fixtures, in Node (F5a, decision 12: the engine's arithmetic, at depth and
// cheaper than the browser). Each output is read back by PDF.js and qpdf (tests/e2e/lib/pdfjs-read.ts, scripts/lib/qpdf.ts),
// never by the engine, and compared with the oracle of fixtures/pdf/expected.json.
import { deflateSync } from 'node:zlib';
import { beforeAll, describe, expect, it } from 'vitest';
import { crc32 } from '../e2e/lib/zip.ts';
import { processPdf } from '../../src/engine/pdf/process.ts';
import type { PdfOperation, PdfResult, PdfSuccess } from '../../src/engine/pdf/types.ts';
import { readWithPdfjs, opensWithoutPassword, type ReadPdf } from '../e2e/lib/pdfjs-read.ts';
import { parsePdf, strictPdf } from '../e2e/lib/pdf.ts';
import { qpdfCheck, qpdfEncryption } from '../../scripts/lib/qpdf.ts';
import { ORACLE, fixture, nodeRenderer, oracle, useNodeAssets } from './lib/pdf-engine.ts';

beforeAll(() => useNodeAssets());

const run = (op: PdfOperation, ...names: string[]): Promise<PdfResult> => processPdf(op, names.map(fixture), nodeRenderer());

function ok(result: PdfResult): PdfSuccess {
  if (!result.ok) throw new Error(`failed: ${result.reason}`);
  return result;
}

/** Strict structure, qpdf --check with no warning of its own, and PDF.js's reading of every page. */
async function sound(bytes: Uint8Array, password?: string): Promise<ReadPdf> {
  if (!password) {
    const strict = await strictPdf(bytes);
    expect(strict.problems).toEqual([]);
  }
  const check = await qpdfCheck(bytes, password);
  expect(check.code, check.out.join('\n')).toBe(0);
  return readWithPdfjs(bytes, password);
}

const markers = (read: ReadPdf): (string | null)[] => read.pages.map((page) => page.marker);
const range = (from: number, to: number): string[] => Array.from({ length: to - from + 1 }, (_, i) => `Page ${from + i}`);

describe('merge', () => {
  it('puts every page of every file in order, with the markers to prove it', async () => {
    const result = ok(await run({ kind: 'merge' }, 'gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf'));
    expect(result.outputs).toHaveLength(1);
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(markers(read)).toEqual([...range(1, 8), ...range(1, 12)]);
    expect(read.pages.map((page) => page.rotate)).toEqual([...(oracle('gen-paginas-mistas.pdf').rotate ?? []), ...new Array(12).fill(0)]);
  });

  it('keeps the form fields of both copies of the IRS form, renamed apart, and drops the XFA layer', async () => {
    const result = ok(await run({ kind: 'merge' }, 'pdf-formulario-irs-1040-2019.pdf', 'pdf-formulario-irs-1040-2019.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(read.pages.reduce((sum, page) => sum + page.widgets, 0)).toBe(2 * oracle('pdf-formulario-irs-1040-2019.pdf').form.widgets);
    expect(read.acroForm).toBe(true);
    expect(read.xfa).toBe(false);
    expect(result.notes).toContain('xfa-removed');
  });

  it('carries the bookmarks of the 117-page notes and no date or Producer of its own', async () => {
    const result = ok(await run({ kind: 'merge' }, 'gen-paginas-mistas.pdf', 'pdf-grande-fontes-embutidas-117p.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(read.pages).toHaveLength(8 + 117);
    expect(read.outline).toHaveLength(oracle('pdf-grande-fontes-embutidas-117p.pdf').outline);
    // The first file has no Info of its own: the result has none either (the rule of a new document, DECISOES § 145).
    const info = parsePdf(result.outputs[0]?.bytes as Uint8Array).info;
    expect(info).not.toHaveProperty('Producer');
    expect(info).not.toHaveProperty('CreationDate');
  }, 60_000);

  it('refuses a locked file and a broken one with their reasons', async () => {
    expect(await run({ kind: 'merge' }, 'gen-paginas-mistas.pdf', 'gen-cifrado-aes256.pdf')).toMatchObject({ ok: false, reason: 'needs-password' });
    expect(await run({ kind: 'merge' }, 'gen-cifrado-dono.pdf')).toMatchObject({ ok: false, reason: 'restricted' });
    expect(await run({ kind: 'merge' }, 'gen-cortado.pdf')).toMatchObject({ ok: false, reason: 'truncated' });
    expect(await run({ kind: 'merge' }, 'gen-jpg-extensao-pdf.pdf')).toMatchObject({ ok: false, reason: 'not-pdf', source: 'jpeg' });
    expect(await run({ kind: 'merge' }, 'gen-vazio.pdf')).toMatchObject({ ok: false, reason: 'empty' });
  });

  it('repairs the file with the broken index and says so', async () => {
    const result = ok(await run({ kind: 'merge' }, 'gen-xref-estragada.pdf', 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(markers(read)).toEqual([...range(1, 3), ...range(1, 8)]);
    expect(result.notes).toContain('repaired');
  });
});

describe('split, delete and reorder', () => {
  it('splits into one file per part, each with only its pages', async () => {
    const result = ok(await run({ kind: 'split', parts: [[0, 1, 2], [4], [297, 298, 299]] }, 'gen-paginas-300.pdf'));
    expect(result.outputs.map((output) => output.index)).toEqual([1, 2, 3]);
    const reads = await Promise.all(result.outputs.map((output) => sound(output.bytes)));
    expect(reads.map(markers)).toEqual([range(1, 3), ['Page 5'], range(298, 300)]);
    // A one-page part of a 300-page file is small: nothing of the other pages came along.
    expect(result.outputs[1]?.bytes.length ?? 0).toBeLessThan(8_000);
  });

  it('keeps the links that stay inside a part and drops the ones that lead out of it', async () => {
    const source = await readWithPdfjs(fixture('pdf-grande-fontes-embutidas-117p.pdf'));
    const busy = source.pages.findIndex((page) => page.links >= 30);
    const result = ok(await run({ kind: 'split', parts: [[busy]] }, 'pdf-grande-fontes-embutidas-117p.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(read.pages[0]?.links ?? 0).toBeLessThan(source.pages[busy]?.links ?? 0);
    expect(result.outputs[0]?.bytes.length ?? 0).toBeLessThan(fixture('pdf-grande-fontes-embutidas-117p.pdf').length / 5);
  });

  it('deletes pages and keeps the form fields of the page that stays', async () => {
    const result = ok(await run({ kind: 'delete', remove: [1] }, 'pdf-formulario-irs-1040-2019.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    const before = await readWithPdfjs(fixture('pdf-formulario-irs-1040-2019.pdf'));
    expect(read.pages).toHaveLength(1);
    expect(read.pages[0]?.widgets).toBe(before.pages[0]?.widgets);
    const marked = ok(await run({ kind: 'delete', remove: [0, 2, 4] }, 'gen-paginas-mistas.pdf'));
    expect(markers(await sound(marked.outputs[0]?.bytes as Uint8Array))).toEqual(['Page 2', 'Page 4', 'Page 6', 'Page 7', 'Page 8']);
  });

  it('refuses to delete every page', async () => {
    expect(await run({ kind: 'delete', remove: [0, 1, 2] }, 'gen-xref-estragada.pdf')).toMatchObject({ ok: false });
  });

  it('reorders in place: the reversed order, the turns and the bookmarks stay', async () => {
    const order = Array.from({ length: 8 }, (_, i) => 7 - i);
    const result = ok(await run({ kind: 'reorder', order }, 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(markers(read)).toEqual(range(1, 8).reverse());
    expect(read.pages.map((page) => page.rotate)).toEqual([...(oracle('gen-paginas-mistas.pdf').rotate ?? [])].reverse());
    const notes = ok(await run({ kind: 'reorder', order: Array.from({ length: 117 }, (_, i) => 116 - i) }, 'pdf-grande-fontes-embutidas-117p.pdf'));
    expect((await sound(notes.outputs[0]?.bytes as Uint8Array)).outline).toHaveLength(oracle('pdf-grande-fontes-embutidas-117p.pdf').outline);
  }, 60_000);
});

describe('rotate', () => {
  it('turns every page, or one page, by quarter turns on top of its own /Rotate', async () => {
    const all = ok(await run({ kind: 'rotate', all: 1, pages: {} }, 'gen-paginas-mistas.pdf'));
    const before = oracle('gen-paginas-mistas.pdf').rotate ?? [];
    expect((await sound(all.outputs[0]?.bytes as Uint8Array)).pages.map((page) => page.rotate)).toEqual(before.map((turn) => (turn + 90) % 360));
    const one = ok(await run({ kind: 'rotate', all: 0, pages: { 0: 2, 3: 3 } }, 'gen-paginas-mistas.pdf'));
    const read = await sound(one.outputs[0]?.bytes as Uint8Array);
    expect(read.pages.map((page) => page.rotate)).toEqual(before.map((turn, i) => (i === 0 ? (turn + 180) % 360 : i === 3 ? (turn + 270) % 360 : turn)));
  });
});

describe('numbers, watermark and signature on the page as shown', () => {
  it('writes "Page N of M" at the bottom centre of every page, upright on screen, whatever its turn and CropBox', async () => {
    const result = ok(await run({ kind: 'numbers', position: 'bottom-center', format: 'page-n-of-total', start: 1, skipFirst: false }, 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    read.pages.forEach((page, i) => {
      const number = page.texts.find((text) => text.str === `Page ${i + 1} of 8`);
      expect(number, `page ${i + 1}`).toBeDefined();
      if (!number) return;
      expect(number.angle, `page ${i + 1} upright`).toBe(0);
      expect(number.y, `page ${i + 1} near the bottom`).toBeGreaterThan(page.shown.height - 40);
      expect(number.y).toBeLessThan(page.shown.height);
      expect(Math.abs(number.x + 30 - page.shown.width / 2), `page ${i + 1} centred`).toBeLessThan(40);
    });
  });

  it('skips the first page and starts where asked; the top right corner on a turned page', async () => {
    const result = ok(await run({ kind: 'numbers', position: 'top-right', format: 'n', start: 7, skipFirst: true }, 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(read.pages[0]?.texts.some((text) => /^\d+$/.test(text.str))).toBe(false);
    read.pages.slice(1).forEach((page, i) => {
      const number = page.texts.find((text) => text.str === String(7 + i));
      expect(number, `page ${i + 2}`).toBeDefined();
      expect(number?.angle).toBe(0);
      expect(number?.y ?? 0).toBeLessThan(45);
      expect(number?.x ?? 0).toBeGreaterThan(page.shown.width - 60);
    });
  });

  it('draws the watermark text once on every page, across the middle', async () => {
    const result = ok(await run({ kind: 'watermark', text: 'Orca draft ⟶ copy', size: 'medium', opacity: 'light', direction: 'diagonal' }, 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    for (const [i, page] of read.pages.entries()) {
      const mark = page.texts.find((text) => text.str.includes('Orca draft'));
      expect(mark, `page ${i + 1}`).toBeDefined();
      expect(mark?.angle, `page ${i + 1} at 45° on screen`).toBe(45);
    }
  });

  it('draws the signature on the chosen pages only, inside the visible box', async () => {
    const png = fixtureSignature();
    const result = ok(await run({ kind: 'sign', image: png, pages: [3, 6], box: { x: 0.6, y: 0.8, width: 0.25 } }, 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(read.pages.map((page) => page.images)).toEqual([0, 0, 0, 1, 0, 0, 1, 0]);
  });
});

describe('compress', () => {
  it('never gives back a bigger file, in any mode, and gives the original bytes back when it does not gain', async () => {
    for (const name of ['gen-ja-otimizado.pdf', 'gen-paginas-mistas.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf']) {
      for (const mode of ['lossless', 'recommended', 'strong'] as const) {
        const original = fixture(name);
        const result = ok(await run({ kind: 'compress', mode }, name));
        const out = result.outputs[0]?.bytes as Uint8Array;
        expect(out.length, `${name} ${mode}`).toBeLessThanOrEqual(original.length);
        if (result.outcome === 'unchanged') expect(Buffer.compare(Buffer.from(out), Buffer.from(original)), `${name} ${mode}: the same bytes`).toBe(0);
        else await sound(out);
      }
    }
    expect(ok(await run({ kind: 'compress', mode: 'lossless' }, 'gen-ja-otimizado.pdf')).outcome).toBe('unchanged');
  }, 120_000);

  it('Recommended makes the photos lighter', async () => {
    const result = ok(await run({ kind: 'compress', mode: 'recommended' }, 'gen-fotos.pdf'));
    expect(result.outcome).toBe('new');
    const out = result.outputs[0]?.bytes as Uint8Array;
    expect(out.length).toBeLessThan(fixture('gen-fotos.pdf').length * 0.6);
    const read = await sound(out);
    expect(markers(read)).toEqual(range(1, 4));
  }, 60_000);
});

describe('protect and unlock', () => {
  it('protects with AES-256 (R6): PDF.js opens it only with the password, which is nowhere in the bytes', async () => {
    const password = 'Orca-Sentinel-7391-Kq';
    const result = ok(await run({ kind: 'protect', password }, 'gen-paginas-mistas.pdf'));
    const out = result.outputs[0]?.bytes as Uint8Array;
    const shown = await qpdfEncryption(out, password);
    expect(shown.out).toEqual(expect.arrayContaining(['R = 6', 'stream encryption method: AESv3', 'file encryption method: AESv3']));
    expect(await opensWithoutPassword(out)).toBe(false);
    expect(markers(await sound(out, password))).toEqual(range(1, 8));
    expect(Buffer.from(out).includes(Buffer.from(password, 'latin1'))).toBe(false);
  });

  it('unlocks the three locked fixtures: no /Encrypt left, opens without a password', async () => {
    const cases: [string, string | null][] = [
      ['gen-cifrado-aes256.pdf', ORACLE.passwords['aes256'] ?? ''],
      ['gen-cifrado-rc4-128.pdf', ORACLE.passwords['rc4'] ?? ''],
      ['gen-cifrado-dono.pdf', null],
    ];
    for (const [name, password] of cases) {
      const result = ok(await run({ kind: 'unlock', password }, name));
      const out = result.outputs[0]?.bytes as Uint8Array;
      expect(Buffer.from(out).toString('latin1'), name).not.toMatch(/\/Encrypt\b/);
      expect(markers(await sound(out)), name).toEqual(range(1, 3));
    }
  });

  it('asks for the password, says when it is wrong, and leaves a plain file alone', async () => {
    expect(await run({ kind: 'unlock', password: null }, 'gen-cifrado-aes256.pdf')).toMatchObject({ ok: false, reason: 'needs-password' });
    expect(await run({ kind: 'unlock', password: 'not-it' }, 'gen-cifrado-aes256.pdf')).toMatchObject({ ok: false, reason: 'wrong-password' });
    expect(await run({ kind: 'unlock', password: 'not-it' }, 'gen-cifrado-rc4-128.pdf')).toMatchObject({ ok: false, reason: 'wrong-password' });
    expect(await run({ kind: 'unlock', password: null }, 'gen-paginas-mistas.pdf')).toMatchObject({ ok: false, reason: 'not-encrypted' });
    expect(await run({ kind: 'protect', password: 'x1234' }, 'gen-cifrado-dono.pdf')).toMatchObject({ ok: false, reason: 'restricted' });
  });
});

describe('PDF to JPG', () => {
  it('draws the asked pages at the asked resolution, the owner-restricted file included', async () => {
    const result = ok(await run({ kind: 'images', format: 'jpeg', ppi: 72, pages: [0, 3] }, 'gen-paginas-mistas.pdf'));
    expect(result.outputs.map((output) => [output.index, output.width, output.height])).toEqual([
      [1, 612, 792],
      [4, 792, 612],
    ]);
    const png = ok(await run({ kind: 'images', format: 'png', ppi: 150, pages: null }, 'gen-cifrado-dono.pdf'));
    expect(png.outputs).toHaveLength(3);
    expect(png.outputs[0]?.width).toBe(Math.floor((612 * 150) / 72));
    expect([...(png.outputs[0]?.bytes.subarray(0, 4) ?? [])]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(await run({ kind: 'images', format: 'png', ppi: 72, pages: null }, 'gen-cifrado-aes256.pdf')).toMatchObject({ ok: false, reason: 'needs-password' });
  });
});

/** A small PNG signature: a dark stroke on a transparent background (an 8-bit RGBA PNG written here with zlib). */
function fixtureSignature(): Uint8Array {
  const width = 40;
  const height = 12;
  const rows: number[] = [];
  for (let y = 0; y < height; y += 1) {
    rows.push(0);
    for (let x = 0; x < width; x += 1) rows.push(20, 30, 60, Math.abs(y - 6 - Math.round(4 * Math.sin(x / 4))) < 2 ? 255 : 0);
  }
  const chunk = (type: string, data: Uint8Array): Buffer => {
    const body = Buffer.concat([Buffer.from(type, 'latin1'), Buffer.from(data)]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.from(rows))), chunk('IEND', new Uint8Array(0))]));
}
