import { describe, expect, it } from 'vitest';
import type { EngineOutput } from '../../src/engine/image/types.ts';
import { EXTENSION, PDF_BATCH_NAME, ZIP_NAME, baseName, uniqueNames } from '../../src/tools/image/names.ts';
import { carriesFiles, dragCount, filesOf, imageFilesOf, pasteBelongsToElement } from '../../src/tools/image/paste.ts';
import { acceptAttribute, batchOutcome, batchPercent, codecOf, isLossy, totals, worthSaying, type Ready } from '../../src/tools/image/summary.ts';
import { TYPING_PAUSE_MS, parseWhole } from '../../src/tools/image/NumberField.tsx';

describe('names of the files a batch gives back', () => {
  it('swaps the extension for the one of the output and keeps the rest of the name', () => {
    expect(uniqueNames([{ name: 'IMG_2041.HEIC', extension: 'jpg' }, { name: 'photo.final.png', extension: 'webp' }], 'image')).toEqual(['IMG_2041.jpg', 'photo.final.webp']);
  });

  it('numbers a repeated name (2), (3) and compares without regard to case', () => {
    const names = uniqueNames(
      [
        { name: 'photo.jpg', extension: 'jpg' },
        { name: 'photo.png', extension: 'jpg' },
        { name: 'PHOTO.webp', extension: 'jpg' },
        { name: 'photo (2).jpg', extension: 'jpg' },
        { name: 'other.jpg', extension: 'jpg' },
      ],
      'image',
    );
    expect(names).toEqual(['photo.jpg', 'photo (2).jpg', 'PHOTO (3).jpg', 'photo (2) (2).jpg', 'other.jpg']);
    expect(new Set(names.map((name) => name.toLowerCase())).size).toBe(names.length);
  });

  it('falls back for an empty name, and keeps folders and unsafe characters out of a ZIP entry', () => {
    expect(uniqueNames([{ name: '', extension: 'jpg' }, { name: '.jpg', extension: 'jpg' }], 'image')).toEqual(['image.jpg', '.jpg.jpg']);
    expect(baseName('a/b\\c:d*e?.png')).toBe('a_b_c_d_e_');
    expect(baseName('noextension')).toBe('noextension');
    expect(baseName('.hidden')).toBe('.hidden');
  });

  it('names the ZIP and the PDF in English, and knows the extension of every output', () => {
    expect(ZIP_NAME).toBe('fileorca-images.zip');
    expect(PDF_BATCH_NAME).toBe('fileorca-images.pdf');
    expect(EXTENSION).toEqual({ jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif', pdf: 'pdf' });
  });
});

describe('paste and drop', () => {
  const file = (name: string, type: string) => new File([new Uint8Array(4)], name, { type });

  it('takes every image of a clipboard, and a file whose type the system did not give', () => {
    expect(imageFilesOf([file('a.png', 'image/png'), file('notes.txt', 'text/plain'), file('b.heic', ''), file('c.webp', 'image/webp')]).map((f) => f.name)).toEqual(['a.png', 'b.heic', 'c.webp']);
    expect(imageFilesOf(null)).toEqual([]);
    expect(filesOf(null)).toEqual([]);
  });

  it('knows a drag that carries files and counts them on dragenter', () => {
    const transfer = (types: string[], kinds: string[]) => ({ types, items: kinds.map((kind) => ({ kind })) }) as unknown as DataTransfer;
    expect(carriesFiles(transfer(['Files'], ['file']))).toBe(true);
    expect(carriesFiles(transfer(['text/plain'], ['string']))).toBe(false);
    expect(carriesFiles(null)).toBe(false);
    expect(dragCount(transfer(['Files'], ['file', 'file', 'string']))).toBe(2);
    expect(dragCount(undefined)).toBe(0);
  });

  it('leaves a paste alone in a text field, the search and a dialog, and takes it elsewhere', () => {
    const target = (matches: Record<string, { tagName: string; type?: string } | null>) => ({
      closest: (selector: string) => matches[selector.split(',')[0] ?? ''] ?? null,
    }) as unknown as EventTarget;
    const dialog = 'dialog[open]';
    const fields = 'input';
    expect(pasteBelongsToElement(target({ [dialog]: { tagName: 'DIALOG' } }))).toBe(true);
    expect(pasteBelongsToElement(target({ [fields]: { tagName: 'INPUT', type: 'text' } }))).toBe(true);
    expect(pasteBelongsToElement(target({ [fields]: { tagName: 'INPUT' } }))).toBe(true);
    expect(pasteBelongsToElement(target({ [fields]: { tagName: 'TEXTAREA' } }))).toBe(true);
    expect(pasteBelongsToElement(target({ [fields]: { tagName: 'INPUT', type: 'radio' } }))).toBe(false);
    expect(pasteBelongsToElement(target({}))).toBe(false);
    expect(pasteBelongsToElement(null)).toBe(false);
  });
});

describe('the arithmetic of a batch', () => {
  it('counts the finished files and the share of the one in progress', () => {
    expect(batchPercent(0, 12, 0)).toBe(0);
    expect(batchPercent(5, 12, 0.7)).toBe(48);
    expect(batchPercent(11, 12, 1)).toBe(100);
    expect(batchPercent(0, 0, 0.5)).toBe(0);
    expect(batchPercent(2, 1, 5)).toBe(100);
  });

  it('builds the file picker filter from the formats a tool takes', () => {
    expect(acceptAttribute(['jpeg', 'png', 'webp'])).toBe('image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp');
    expect(acceptAttribute(['heic'])).toBe('image/heic,image/heif,.heic,.heif');
    expect(acceptAttribute(['avif'])).toBe('image/avif,.avif');
  });

  it('says which outputs lose detail, and maps what the engine read to the closed codec values', () => {
    expect(['jpeg', 'webp', 'avif'].every((format) => isLossy(format as 'jpeg'))).toBe(true);
    expect(isLossy('png')).toBe(false);
    expect(codecOf('jpeg')).toBe('image/jpeg');
    expect(codecOf('heic')).toBe('image/heic');
    expect(codecOf('gif')).toBe('image/gif');
    expect(codecOf('empty')).toBe('empty');
    expect(codecOf('unknown')).toBe('unknown');
    expect(codecOf(undefined)).toBe('unknown');
  });

  const output = (size: number, outcome: EngineOutput['outcome'], notes: EngineOutput['notes'] = []): Ready => ({
    inputSize: 1000,
    output: { ok: true, blob: new Blob([new Uint8Array(size)]), format: 'jpeg', width: 10, height: 10, outcome, notes, source: 'jpeg', sourceWidth: 10, sourceHeight: 10 },
  });

  it('adds up the batch: bytes, the saved share, each note once in a fixed order', () => {
    const tot = totals([output(400, 'new', ['flattened']), output(600, 'new', ['downscaled', 'flattened']), output(1000, 'no-gain')]);
    expect(tot).toMatchObject({ count: 3, before: 3000, after: 2000, anyNew: true, allKept: false, cannotEncode: null });
    expect(tot.saved).toBeCloseTo(33.33, 1);
    expect(tot.notes).toEqual(['flattened', 'downscaled']);
    expect(totals([output(1000, 'no-gain'), output(900, 'cannot-encode')])).toMatchObject({ anyNew: false, allKept: true, cannotEncode: 'jpeg' });
    expect(totals([])).toMatchObject({ count: 0, saved: 0, allKept: false });
  });

  it('gives a batch the outcome of its tool, unchanged when nothing was written, failed when nothing came out', () => {
    expect(batchOutcome('smaller', [output(400, 'new')])).toBe('smaller');
    expect(batchOutcome('converted', [output(400, 'fits'), output(400, 'new')])).toBe('converted');
    expect(batchOutcome('resized', [output(400, 'fits')])).toBe('unchanged');
    expect(batchOutcome('pdf', [])).toBe('failed');
    expect(worthSaying(0.4)).toBe(false);
    expect(worthSaying(0.5)).toBe(true);
    expect(worthSaying(-3)).toBe(false);
  });
});

describe('NumberField', () => {
  it('accepts a whole number inside the range and nothing else', () => {
    expect(parseWhole('800', 1, 16000)).toBe(800);
    expect(parseWhole(' 12 ', 1, 100)).toBe(12);
    expect(parseWhole('0800', 1, 16000)).toBe(800);
    for (const bad of ['', ' ', '0', '101', '1.5', '1,5', '-3', '12px', 'abc', '99999999']) expect(parseWhole(bad, 1, 100), bad).toBeNull();
  });

  it('waits half a second for the person to stop typing', () => {
    expect(TYPING_PAUSE_MS).toBe(500);
  });
});
