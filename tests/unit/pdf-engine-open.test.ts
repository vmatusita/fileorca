// The core of the PDF engine (F5a, decision 4): what a file is, from its bytes; the files refused and why; the lock of
// an encrypted file; and what the panel shows before a tool runs. The expected values come from the oracle that PDF.js
// and qpdf wrote (fixtures/pdf/expected.json), never from the engine.
import { PDFDocument, PDFName, PDFRef } from '@cantoo/pdf-lib';
import { beforeAll, describe, expect, it } from 'vitest';
import { inspectPdf } from '../../src/engine/pdf/open.ts';
import { processPdf } from '../../src/engine/pdf/process.ts';
import { boxOf, normalRotation, shownSize, toUser, visibleBox } from '../../src/engine/pdf/geometry.ts';
import { headerOffset, indexIsSound, sniffPdf } from '../../src/engine/pdf/sniff.ts';
import { ORACLE, fixture, oracle, useNodeAssets } from './lib/pdf-engine.ts';

beforeAll(() => useNodeAssets());

describe('the type comes from the bytes', () => {
  it('finds %PDF- in the first kilobyte, even after junk, and nowhere later', () => {
    const pdf = new TextEncoder().encode('%PDF-1.7\n');
    expect(sniffPdf(pdf)).toBe('pdf');
    const junk = new Uint8Array(900).fill(0x20);
    expect(headerOffset(new Uint8Array([...junk, ...pdf]))).toBe(900);
    expect(sniffPdf(new Uint8Array([...new Uint8Array(1100).fill(0x20), ...pdf]))).toBe('text');
  });

  it('tells an image or a text named .pdf from a PDF', () => {
    expect(sniffPdf(fixture('gen-jpg-extensao-pdf.pdf'))).toBe('jpeg');
    expect(sniffPdf(fixture('gen-texto-extensao-pdf.pdf'))).toBe('text');
    expect(sniffPdf(fixture('gen-vazio.pdf'))).toBe('empty');
    expect(sniffPdf(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('png');
  });

  it('sees a sound index in a sound file and a broken one in gen-xref-estragada', () => {
    expect(indexIsSound(fixture('gen-paginas-mistas.pdf'))).toBe(true);
    expect(indexIsSound(fixture('pdf-grande-fontes-embutidas-117p.pdf'))).toBe(true);
    expect(indexIsSound(fixture('gen-xref-estragada.pdf'))).toBe(false);
  });
});

describe('inspect: every fixture as the oracle says', () => {
  for (const name of Object.keys(ORACLE.files)) {
    it(name, async () => {
      const expected = oracle(name);
      const result = await inspectPdf(fixture(name));
      switch (expected.expect) {
        case 'ok':
        case 'repaired': {
          expect(result.ok, JSON.stringify(result)).toBe(true);
          if (!result.ok) return;
          expect(result.lock).toBe('none');
          expect(result.repaired).toBe(expected.expect === 'repaired');
          expect(result.pages).toBe(expected.pages);
          expect(result.boxes.map((box) => box.rotate)).toEqual(expected.rotate);
          expect(result.boxes.map((box) => [box.width, box.height])).toEqual(expected.sizes);
          expect(result.form.widgets).toBe(expected.form.widgets);
          expect(result.form.xfa).toBe(expected.form.xfa);
          expect(result.outline).toBe(expected.outline > 0);
          break;
        }
        case 'needs-password':
        case 'restricted':
          expect(result).toMatchObject({ ok: true, lock: expected.expect === 'needs-password' ? 'password' : 'restricted', pages: expected.pages });
          break;
        case 'not-pdf':
          expect(result).toMatchObject({ ok: false, reason: 'not-pdf' });
          break;
        default:
          expect(result).toMatchObject({ ok: false, reason: expected.expect });
      }
    });
  }
});

// A file cut short is refused whatever the cut took (DECISOES § 174). The fixture gen-cortado loses text, which the
// page check always saw; a scan or a photo PDF cut inside its image used to come back "repaired", with the image gone.
describe('a file cut short is refused, whatever the cut took', () => {
  const cut = (name: string, fraction: number): Uint8Array => {
    const full = fixture(name);
    return full.slice(0, Math.floor(full.length * fraction));
  };
  const refused = async (bytes: Uint8Array, reason: 'truncated' | 'corrupted') => {
    expect(await inspectPdf(bytes)).toMatchObject({ ok: false, reason });
    expect(await processPdf({ kind: 'rotate', all: 1, pages: {} }, [bytes], null)).toMatchObject({ ok: false, reason });
    expect(await processPdf({ kind: 'merge' }, [fixture('gen-paginas-mistas.pdf'), bytes], null)).toMatchObject({ ok: false, reason });
  };

  for (const percent of [10, 30, 50, 60, 80, 95]) {
    it(`the scanned page cut at ${percent}% (its image is cut)`, async () => {
      await refused(cut('pdf-escaneado-01-pagina-livro-cor.pdf', percent / 100), 'truncated');
    });
  }

  for (const part of [28, 29, 30, 31]) {
    it(`gen-fotos cut at ${part}/32 of its length (the fourth photo is cut)`, async () => {
      await refused(cut('gen-fotos.pdf', part / 32), 'truncated');
    });
  }

  it('gen-xref-estragada cut in its middle (pages lost), while the whole file stays repaired', async () => {
    for (const fraction of [0.4, 0.45, 0.55, 0.65, 0.7]) await refused(cut('gen-xref-estragada.pdf', fraction), 'truncated');
    expect(await inspectPdf(fixture('gen-xref-estragada.pdf'))).toMatchObject({ ok: true, repaired: true });
    expect(await inspectPdf(fixture('gen-cortado.pdf'))).toMatchObject({ ok: false, reason: 'truncated' });
  });

  it('a complete file whose page names an image or a font that is not there is corrupted', async () => {
    for (const key of ['XObject', 'Font'] as const) {
      const doc = await PDFDocument.create({ updateMetadata: false });
      const page = doc.addPage([200, 200]);
      // An object number the file never writes: the reference leads nowhere.
      page.node.set(PDFName.of('Resources'), doc.context.obj({ [key]: { Missing: PDFRef.of(999) } }));
      const bytes = await doc.save({ useObjectStreams: false });
      expect(indexIsSound(bytes)).toBe(true);
      await refused(bytes, 'corrupted');
    }
  });
});

describe('geometry of the page as shown', () => {
  it('clips the CropBox to the MediaBox and orders the corners', () => {
    expect(boxOf([612, 792, 0, 0])).toEqual({ x: 0, y: 0, width: 612, height: 792 });
    expect(visibleBox({ x: 0, y: 0, width: 612, height: 792 }, { x: -50, y: 100, width: 300, height: 1000 })).toEqual({ x: 0, y: 100, width: 250, height: 692 });
    expect(visibleBox({ x: 0, y: 0, width: 100, height: 100 }, { x: 200, y: 200, width: 10, height: 10 })).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('turns the screen picture back into user space for each /Rotate', () => {
    const box = { x: 10, y: 20, width: 600, height: 800 };
    expect(normalRotation(-90)).toBe(270);
    expect(normalRotation(450)).toBe(90);
    expect(normalRotation(45)).toBe(0);
    expect(shownSize(box, 90)).toEqual({ width: 800, height: 600 });
    // The bottom left corner of the screen picture, and a point 100 to its right.
    expect(toUser(box, 0, 0, 0)).toEqual({ x: 10, y: 20, angle: 0 });
    expect(toUser(box, 90, 0, 0)).toEqual({ x: 610, y: 20, angle: 90 });
    expect(toUser(box, 90, 100, 0)).toEqual({ x: 610, y: 120, angle: 90 });
    expect(toUser(box, 180, 0, 0)).toEqual({ x: 610, y: 820, angle: 180 });
    expect(toUser(box, 270, 0, 0)).toEqual({ x: 10, y: 820, angle: 270 });
    expect(toUser(box, 270, 100, 0)).toEqual({ x: 10, y: 720, angle: 270 });
  });
});
