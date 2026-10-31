import { describe, expect, it } from 'vitest';
import { sniff } from '../../src/engine/image/sniff.ts';
import { box, buildHeif, cat, ispe, simpleHeif, text, u32 } from './lib/bytes.ts';
import { fixture, oracle } from './lib/oracle.ts';

function ftypOnly(major: string, compatible: string[]): Uint8Array {
  return box('ftyp', text(major), u32(0), ...compatible.map((brand) => text(brand)));
}

describe('sniff: the format comes from the bytes', () => {
  it('agrees with the oracle on every fixture, whatever its extension says', () => {
    for (const [name, entry] of Object.entries(oracle())) {
      const bytes = fixture(name);
      if (entry.expect === 'empty') expect(sniff(bytes), name).toBe('empty');
      else if (entry.expect === 'unsupported') expect(['unknown', 'gif'], name).toContain(sniff(bytes));
      else expect(sniff(bytes), name).toBe(entry.format);
    }
  });

  it('reads the signatures of the simple formats', () => {
    expect(sniff(new Uint8Array(0))).toBe('empty');
    expect(sniff(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe('jpeg');
    expect(sniff(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('png');
    expect(sniff(new Uint8Array([...text('RIFF'), 0, 0, 0, 0, ...text('WEBP'), ...text('VP8 ')]))).toBe('webp');
    expect(sniff(new Uint8Array(text('GIF89a....')))).toBe('gif');
    expect(sniff(new Uint8Array(text('just some text that is not an image')))).toBe('unknown');
    expect(sniff(new Uint8Array([0xff, 0xd8]))).toBe('unknown'); // two bytes are not a JPEG signature
  });

  it('tells HEIC from AVIF by the major brand', () => {
    for (const brand of ['avif', 'avis']) expect(sniff(ftypOnly(brand, ['mif1', 'miaf'])), brand).toBe('avif');
    for (const brand of ['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx']) expect(sniff(ftypOnly(brand, ['mif1'])), brand).toBe('heic');
  });

  it('decides a mif1 file by its compatible brands', () => {
    expect(sniff(ftypOnly('mif1', ['miaf', 'avif']))).toBe('avif');
    expect(sniff(ftypOnly('mif1', ['miaf', 'heic']))).toBe('heic');
    expect(sniff(ftypOnly('msf1', ['avis']))).toBe('avif');
    expect(sniff(ftypOnly('mif1', ['miaf', 'hevc']))).toBe('heic');
  });

  it('reads the primary item when both families are listed, or none', () => {
    const both = ['mif1', 'avif', 'heic'];
    expect(sniff(simpleHeif({ major: 'mif1', compatible: both, type: 'av01', width: 8, height: 8 }))).toBe('avif');
    expect(sniff(simpleHeif({ major: 'mif1', compatible: both, type: 'hvc1', width: 8, height: 8 }))).toBe('heic');
    expect(sniff(simpleHeif({ major: 'mif1', compatible: ['miaf'], type: 'av01', width: 8, height: 8 }))).toBe('avif');
    expect(sniff(simpleHeif({ major: 'mif1', compatible: ['miaf'], type: 'hvc1', width: 8, height: 8 }))).toBe('heic');
  });

  it('follows a grid to the codec of its first tile', () => {
    const grid = buildHeif({
      major: 'mif1',
      compatible: ['avif', 'heic'],
      primary: 1,
      items: [
        { id: 1, type: 'grid' },
        { id: 2, type: 'av01', hidden: true },
      ],
      properties: [ispe(16, 8)],
      associations: { 1: [1], 2: [1] },
      refs: [{ type: 'dimg', from: 1, to: [2] }],
      data: { 1: new Uint8Array(8), 2: new Uint8Array(8) },
    });
    expect(sniff(grid)).toBe('avif');
  });

  it('does not take a video or an unknown container for an image', () => {
    expect(sniff(ftypOnly('mp42', ['isom', 'mp42']))).toBe('unknown');
    expect(sniff(ftypOnly('qt  ', ['qt  ']))).toBe('unknown');
    expect(sniff(cat(box('moov', [1, 2, 3]), box('free', [])))).toBe('unknown');
    // mif1 with no way to tell: no meta box at all.
    expect(sniff(ftypOnly('mif1', ['miaf']))).toBe('unknown');
  });
});
