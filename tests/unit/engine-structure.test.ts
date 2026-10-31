import { describe, expect, it } from 'vitest';
import { parseHeif } from '../../src/engine/image/bmff.ts';
import { checkStructure } from '../../src/engine/image/structure.ts';
import { app1Exif, cat, jpegShell, pngChunk, riff, riffChunk, simpleHeif, tinyPng, u16, u32 } from './lib/bytes.ts';
import { fixture, names, oracle } from './lib/oracle.ts';

describe('structure: every fixture gets the verdict the oracle gives it', () => {
  it('ok, truncated or decode, whatever the extension says', () => {
    const verdict = { ok: 'ok', truncated: 'truncated', decode: 'decode' } as const;
    for (const [name, entry] of Object.entries(oracle())) {
      if (entry.expect === 'empty' || entry.expect === 'unsupported') continue; // not images: stopped by the sniffer
      expect(checkStructure(fixture(name), entry.format as 'jpeg' | 'png' | 'webp' | 'heic' | 'avif'), name).toBe(verdict[entry.expect]);
    }
  });
});

describe('structure: JPEG', () => {
  it('accepts the real photos and the shells with one scan, several scans, restarts and stuffing', () => {
    for (const name of names('jpg-')) expect(checkStructure(fixture(name), 'jpeg'), name).toBe('ok');
    expect(checkStructure(jpegShell(8, 8), 'jpeg')).toBe('ok');
    // Progressive: two scans, a DHT between them.
    const sos = cat([0xff, 0xda], u16(8), [1, 1, 0, 0, 63, 0]);
    const progressive = cat(jpegShell(8, 8, { eoi: false }), [0xff, 0xc4], u16(4), [0, 0], sos, [0x01, 0x02, 0xff, 0xd0, 0x03, 0xff, 0xd7, 0x04], [0xff, 0xd9]);
    expect(checkStructure(progressive, 'jpeg')).toBe('ok');
    expect(checkStructure(jpegShell(8, 8, { scan: [1, 0xff, 0x00, 0xff, 0xff, 0x00, 2] }), 'jpeg')).toBe('ok');
    expect(checkStructure(jpegShell(8, 8, { segments: [app1Exif(6)] }), 'jpeg')).toBe('ok');
  });

  it('accepts data after the EOI (motion photos, MPF)', () => {
    expect(checkStructure(jpegShell(8, 8, { trailing: [0, 0, 0, 0, 1, 2, 3, 0xff, 0xd8, 0xff, 0xe0] }), 'jpeg')).toBe('ok');
  });

  it('calls a file without its EOI truncated, however far it got', () => {
    expect(checkStructure(jpegShell(8, 8, { eoi: false }), 'jpeg')).toBe('truncated');
    for (const name of names('jpg-')) {
      const bytes = fixture(name);
      for (const share of [0.3, 0.5, 0.9, 0.999]) {
        expect(checkStructure(bytes.subarray(0, Math.floor(bytes.length * share)), 'jpeg'), `${name} cut at ${share}`).toBe('truncated');
      }
      expect(checkStructure(bytes.subarray(0, bytes.length - 1), 'jpeg'), `${name} without the last byte`).toBe('truncated');
      expect(checkStructure(bytes.subarray(0, bytes.length - 2), 'jpeg'), `${name} without the EOI`).toBe('truncated');
    }
  });

  it('calls a damaged structure decode', () => {
    expect(checkStructure(cat([0xff, 0xd8, 0x12, 0x34, 0x56, 0x78]), 'jpeg')).toBe('decode'); // not a marker
    expect(checkStructure(cat([0xff, 0xd8, 0xff, 0xd9]), 'jpeg')).toBe('decode'); // EOI before any scan
    const noFrame = cat([0xff, 0xd8], [0xff, 0xda], u16(12), [3, 1, 0, 2, 0x11, 3, 0x11, 0, 63, 0], [1, 2, 3], [0xff, 0xd9]);
    expect(checkStructure(noFrame, 'jpeg')).toBe('decode'); // a scan before the frame header
    expect(checkStructure(cat(jpegShell(0, 8)), 'jpeg')).toBe('decode'); // zero width
    expect(checkStructure(cat([0xff, 0xd8, 0xff, 0xe1], u16(5000), [1, 2, 3]), 'jpeg')).toBe('decode'); // segment past the end
    expect(checkStructure(cat([0xff, 0xd8, 0xff, 0xe1], u16(1), [1, 2, 3]), 'jpeg')).toBe('decode'); // length below 2
    expect(checkStructure(cat([0xff, 0xd8, 0xff, 0xd8]), 'jpeg')).toBe('decode'); // a second SOI
  });

  it('is not fooled by an EOI inside the Exif thumbnail', () => {
    const thumb = cat([0xff, 0xd8, 0xff, 0xd9]);
    const app1 = cat([0xff, 0xe1], u16(thumb.length + 2), thumb);
    const bytes = jpegShell(8, 8, { segments: [app1], eoi: false });
    expect(checkStructure(bytes, 'jpeg')).toBe('truncated');
  });
});

describe('structure: PNG', () => {
  it('accepts a whole PNG, with or without data after IEND', () => {
    expect(checkStructure(tinyPng(), 'png')).toBe('ok');
    expect(checkStructure(cat(tinyPng(), [0, 0, 0]), 'png')).toBe('ok');
    expect(checkStructure(tinyPng(2, 2, [1, 2, 3, 4], [pngChunk('tEXt', [65, 0, 66])]), 'png')).toBe('ok');
  });

  it('calls a cut PNG truncated', () => {
    const png = tinyPng(16, 16);
    for (const keep of [8, 20, 33, 40, png.length - 13, png.length - 1]) {
      expect(checkStructure(png.subarray(0, keep), 'png'), `cut at ${keep}`).toBe('truncated');
    }
  });

  it('calls a damaged PNG decode', () => {
    const body = tinyPng();
    const noHeader = cat(body.subarray(0, 8), pngChunk('IDAT', [1, 2, 3]), pngChunk('IEND', []));
    expect(checkStructure(noHeader, 'png')).toBe('decode');
    const noData = cat(body.subarray(0, 8), pngChunk('IHDR', cat(u32(1), u32(1), [8, 6, 0, 0, 0])), pngChunk('IEND', []));
    expect(checkStructure(noData, 'png')).toBe('decode');
    const shortHeader = cat(body.subarray(0, 8), pngChunk('IHDR', [0, 0, 0, 1]), pngChunk('IDAT', [1]), pngChunk('IEND', []));
    expect(checkStructure(shortHeader, 'png')).toBe('decode');
  });
});

describe('structure: WebP', () => {
  const frame = riffChunk('VP8 ', new Array(10).fill(1));

  it('accepts a RIFF that fits in the file, with data after it', () => {
    expect(checkStructure(riff([frame]), 'webp')).toBe('ok');
    expect(checkStructure(cat(riff([frame]), [0, 0, 0, 0]), 'webp')).toBe('ok');
    expect(checkStructure(riff([riffChunk('VP8X', new Array(10).fill(0)), riffChunk('ANIM', [0, 0, 0, 0, 0, 0]), frame]), 'webp')).toBe('ok');
  });

  it('calls a RIFF larger than the file truncated', () => {
    const whole = riff([frame]);
    expect(checkStructure(whole.subarray(0, whole.length - 3), 'webp')).toBe('truncated');
    expect(checkStructure(riff([frame], 5000), 'webp')).toBe('truncated');
    expect(checkStructure(whole.subarray(0, 14), 'webp')).toBe('truncated');
  });

  it('calls a file without an image chunk, or with a chunk past the RIFF, decode', () => {
    expect(checkStructure(riff([riffChunk('JUNK', new Array(10).fill(1))]), 'webp')).toBe('decode');
    const overrun = riff([riffChunk('VP8X', new Array(10).fill(0)), cat([...'ICCP'].map((c) => c.charCodeAt(0)), [0xff, 0x00, 0x00, 0x00], [1, 2])]);
    expect(checkStructure(overrun, 'webp')).toBe('decode');
  });
});

describe('structure: HEIC and AVIF', () => {
  it('accepts the whole HEIC files and cuts of them are truncated', () => {
    for (const name of names('heic-')) {
      const bytes = fixture(name);
      expect(checkStructure(bytes, 'heic'), name).toBe('ok');
      expect(checkStructure(bytes.subarray(0, Math.floor(bytes.length * 0.5)), 'heic'), `${name} at 50%`).toBe('truncated');
      expect(checkStructure(bytes.subarray(0, Math.floor(bytes.length * 0.95)), 'heic'), `${name} at 95%`).toBe('truncated');
    }
  });

  it('sees a cut in a file with meta after mdat (heic-09)', () => {
    const bytes = fixture(names('heic-09')[0]!);
    expect(checkStructure(bytes.subarray(0, 100_000), 'heic')).toBe('truncated');
  });

  it('checks every extent of the iloc box against the file, even when the boxes are whole', () => {
    const whole = simpleHeif({ width: 8, height: 8 });
    const heif = parseHeif(whole)!;
    const { offset, length } = heif.locations.get(1)!.extents[0]!;
    // Find offset+length in the iloc entry and make the item longer than the file.
    const needle = Uint8Array.from([...u32(offset), ...u32(length)]);
    let at = -1;
    for (let i = 0; i + 8 <= whole.length; i += 1) if (needle.every((byte, k) => whole[i + k] === byte)) at = i;
    expect(at).toBeGreaterThan(0);
    const patched = whole.slice();
    patched.set(u32(length + 100_000), at + 4);
    expect(checkStructure(patched, 'heic')).toBe('truncated');
  });

  it('calls a file without a primary item or a size decode', () => {
    expect(checkStructure(simpleHeif({ width: 8, height: 8, primary: null }), 'heic')).toBe('decode');
    expect(checkStructure(simpleHeif({ width: 8, height: 8, associations: {} }), 'heic')).toBe('decode');
    expect(checkStructure(new Uint8Array(40).fill(1), 'heic')).toBe('decode');
    expect(checkStructure(simpleHeif({ width: 8, height: 8, type: 'av01', major: 'avif', compatible: ['mif1', 'avif'] }), 'avif')).toBe('ok');
  });
});
