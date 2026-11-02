// The QR code generator read back (prompt F7, decision 8): the matrix of src/tools/qr-code-generator/qr.ts is drawn as the page
// draws it, the SVG is rasterised by @resvg/resvg-js at a whole number of pixels per module and decoded by jsQR (Apache-2.0),
// and the bytes it gives (`binaryData`) must be the UTF-8 of the text, byte for byte; `data` is only a complement, since jsQR
// may decode accents in it another way. The page itself (PNG from the canvas, SVG file) is read back in qr-code.spec.ts.
import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';
import { create } from 'qrcode/lib/core/qrcode.js';
import { describe, expect, it } from 'vitest';
import {
  DARK,
  ICON_CLIP_ID,
  LEVEL_H_BIT,
  LIGHT,
  MAX_BYTES,
  MIN_MODULE_PX,
  OLI_SHARE,
  PNG_SIZES,
  QUIET_ZONE,
  drawingSide,
  encode,
  iconBox,
  iconSvg,
  oliFrame,
  pngIconBox,
  pngScale,
  pngSide,
  qrSvg,
  runs,
  utf8,
  type QrMatrix,
} from '../../src/tools/qr-code-generator/qr.ts';

/** A text of exactly `bytes` bytes of UTF-8, with accents and emoji in it (the longest text the page takes). */
function textOfBytes(bytes: number): string {
  const piece = 'Olá, José. Café às 7h 🐋 ñandú; ';
  let text = '';
  while (utf8(text + piece).length <= bytes) text += piece;
  while (utf8(text).length < bytes) text += 'x';
  return text;
}

const CONTENTS: Record<string, string> = {
  'endereço curto': 'https://fileorca.com/',
  'endereço longo': `https://example.com/path/to/a/page?${Array.from({ length: 24 }, (_, i) => `key${i}=value-${i * 37}`).join('&')}#section-7`,
  'acento e emoji': 'Olá! Café às 7h, ñandú e 🐋 na praia — até já ☕',
  'o maior permitido': textOfBytes(MAX_BYTES),
};

interface Read {
  bytes: Uint8Array;
  data: string;
}

/** What a camera reads from an SVG: rasterised at `k` whole pixels a module, then decoded with no options. */
function read(svg: string, side: number, k: number): Read | null {
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: side * k } }).render();
  const pixels = image.pixels;
  const found = jsQR(new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.length), image.width, image.height);
  return found ? { bytes: Uint8Array.from(found.binaryData), data: found.data } : null;
}

function matrixOf(text: string): QrMatrix {
  const encoded = encode(text);
  if (!encoded.ok) throw new Error(`no QR for ${JSON.stringify(text.slice(0, 20))}: ${encoded.problem}`);
  return encoded.matrix;
}

const same = (a: Uint8Array | undefined, b: Uint8Array): boolean => a !== undefined && Buffer.from(a).equals(Buffer.from(b));

describe('the matrix', () => {
  it('is always error correction H, and the check would see the silent fallback to M of an unknown level', () => {
    for (const text of Object.values(CONTENTS)) expect(matrixOf(text).levelBit).toBe(LEVEL_H_BIT);
    expect(LEVEL_H_BIT).toBe(2);
    // qrcode turns a level it does not know into M (bit 0) without a word: that is what levelBit would show.
    expect(create('x', { errorCorrectionLevel: 'X' as 'H' }).errorCorrectionLevel.bit).toBe(0);
    expect(create('x', { errorCorrectionLevel: 'H' }).errorCorrectionLevel.bit).toBe(LEVEL_H_BIT);
  });

  it('takes the UTF-8 bytes as they are, in one byte segment, up to the capacity of version 40 at H', () => {
    const longest = matrixOf(CONTENTS['o maior permitido'] ?? '');
    expect(utf8(CONTENTS['o maior permitido'] ?? '').length).toBe(MAX_BYTES);
    expect(longest.version).toBe(40);
    expect(longest.size).toBe(177);
    expect(matrixOf('https://fileorca.com/').version).toBe(3);
    // One byte past the limit is refused by the page, and the library itself would refuse it at H.
    expect(() => create([{ data: new Uint8Array(MAX_BYTES + 1).fill(120), mode: 'byte' }], { errorCorrectionLevel: 'H' })).toThrow();
  });

  it('gives no QR for an empty text, a text of white space only, or one over the limit, and says which', () => {
    expect(encode('')).toEqual({ ok: false, problem: 'empty', bytes: 0 });
    expect(encode('   ')).toMatchObject({ ok: false, problem: 'empty' });
    expect(encode(' \n\t \r\n')).toMatchObject({ ok: false, problem: 'empty' });
    expect(encode('x'.repeat(MAX_BYTES + 1))).toEqual({ ok: false, problem: 'long', bytes: MAX_BYTES + 1 });
    // An accented letter is 2 bytes and an emoji 4: 637 of "é" are 1,274 bytes, over; 636 and an "x" are 1,273, in.
    expect(encode('é'.repeat(637))).toEqual({ ok: false, problem: 'long', bytes: 1274 });
    expect(encode(`${'é'.repeat(636)}x`).ok).toBe(true);
    expect(encode('🐋'.repeat(319))).toMatchObject({ ok: false, problem: 'long', bytes: 1276 });
    expect(encode('🐋'.repeat(318))).toMatchObject({ ok: true, bytes: 1272 });
    // Spaces around a text are kept: the code carries what was typed.
    expect(encode(' a ').ok).toBe(true);
  });
});

describe('the drawing', () => {
  it('frames the Oli in an odd, centred square aligned to the grid, about 22% of the matrix, at every version', () => {
    for (let version = 1; version <= 40; version += 1) {
      const size = 4 * version + 17;
      const frame = oliFrame(size);
      expect(frame.side % 2, `v${version}`).toBe(1);
      expect(Number.isInteger(frame.at), `v${version}`).toBe(true);
      expect(frame.at * 2 + frame.side).toBe(size);
      expect(Math.abs(frame.side - OLI_SHARE * size), `v${version}`).toBeLessThanOrEqual(1);
      const box = iconBox(size);
      expect(box.x).toBeGreaterThan(QUIET_ZONE + frame.at);
      expect(box.x + box.side).toBeLessThan(QUIET_ZONE + frame.at + frame.side);
    }
    expect(oliFrame(21)).toEqual({ at: 8, side: 5 });
    expect(oliFrame(177)).toEqual({ at: 69, side: 39 });
  });

  it('keeps the quiet zone white and leaves no dark module under the frame', () => {
    const matrix = matrixOf(CONTENTS['endereço longo'] ?? '');
    const side = drawingSide(matrix.size);
    const frame = oliFrame(matrix.size);
    for (const oli of [false, true]) {
      for (const [x, y, length] of runs(matrix, oli)) {
        expect(x).toBeGreaterThanOrEqual(QUIET_ZONE);
        expect(y).toBeGreaterThanOrEqual(QUIET_ZONE);
        expect(x + length).toBeLessThanOrEqual(side - QUIET_ZONE);
        expect(y).toBeLessThan(side - QUIET_ZONE);
        if (oli && y - QUIET_ZONE >= frame.at && y - QUIET_ZONE < frame.at + frame.side) {
          const start = x - QUIET_ZONE;
          expect(start + length <= frame.at || start >= frame.at + frame.side, `run ${x},${y}`).toBe(true);
        }
      }
    }
    // Without the Oli, the runs are every dark module of the matrix.
    const counted = runs(matrix, false).reduce((sum, [, , length]) => sum + length, 0);
    expect(counted).toBe(matrix.dark.reduce((sum, value) => sum + value, 0));
  });

  it('is black on white with crisp edges, the icon with its own clip id, and none of the text', () => {
    const text = CONTENTS['acento e emoji'] ?? '';
    const matrix = matrixOf(text);
    const side = drawingSide(matrix.size);
    for (const oli of [false, true]) {
      const svg = qrSvg(matrix, oli);
      expect(svg).toContain(`viewBox="0 0 ${side} ${side}"`);
      expect(svg).toContain(`<rect width="${side}" height="${side}" fill="${LIGHT}"/>`);
      expect(svg).toContain(`<path fill="${DARK}" shape-rendering="crispEdges" d="M`);
      expect(svg).not.toMatch(/<title|<desc|<metadata|<text/);
      expect(svg).not.toContain(text);
      expect(svg).not.toContain('Café');
      expect(svg.includes(`url(#${ICON_CLIP_ID})`)).toBe(oli);
      expect(svg).not.toMatch(/id="ic"|url\(#ic\)/);
      // Outside the icon, the only colours are the black and the white of the code.
      const outside = oli ? svg.slice(0, svg.indexOf('<svg', 1)) : svg;
      expect([...new Set(outside.match(/#[0-9A-Fa-f]{3,8}\b/g))].sort()).toEqual([DARK, LIGHT].sort());
    }
    expect(iconSvg()).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="128" height="128" viewBox="0 0 128 128">/);
    expect(iconSvg()).toContain(`id="${ICON_CLIP_ID}"`);
    expect(iconSvg()).not.toMatch(/id="ic"|url\(#ic\)/);
  });

  it('gives the PNG a whole number of pixels per module, at least 4, larger at each size', () => {
    for (let version = 1; version <= 40; version += 1) {
      const size = 4 * version + 17;
      const scales = PNG_SIZES.map((choice) => pngScale(size, choice));
      for (const scale of scales) {
        expect(Number.isInteger(scale)).toBe(true);
        expect(scale).toBeGreaterThanOrEqual(MIN_MODULE_PX);
      }
      expect(scales[0]).toBeLessThan(scales[1] ?? 0);
      expect(scales[1]).toBeLessThan(scales[2] ?? 0);
      for (const choice of PNG_SIZES) expect(pngSide(size, choice)).toBe(drawingSide(size) * pngScale(size, choice));
      const icon = pngIconBox(size, scales[0] ?? 0);
      expect(Number.isInteger(icon.x) && Number.isInteger(icon.side)).toBe(true);
    }
    expect(pngSide(29, 'small')).toBe(37 * 13);
    expect(pngSide(177, 'small')).toBe(185 * 4);
    expect(pngSide(177, 'large')).toBe(185 * 11);
  });
});

describe('the code read back by jsQR', () => {
  for (const [name, text] of Object.entries(CONTENTS)) {
    it(`${name}: gives the exact UTF-8 bytes, with and without the Oli`, () => {
      const matrix = matrixOf(text);
      const side = drawingSide(matrix.size);
      for (const oli of [true, false]) {
        // 4 pixels a module is the least a PNG of the page gets (MIN_MODULE_PX).
        const found = read(qrSvg(matrix, oli), side, MIN_MODULE_PX);
        expect(found, `${name}, Oli ${oli}`).not.toBeNull();
        expect(same(found?.bytes, utf8(text)), `${name}, Oli ${oli}`).toBe(true);
        console.log(`[qr] ${name}: ${utf8(text).length} bytes, versão ${matrix.version}, SVG ${oli ? 'com' : 'sem'} a Oli: ok`);
      }
    });
  }

  it('reads the Oli in the middle at every version from 1 to 40, each filled to its capacity at H', { timeout: 60_000 }, () => {
    // Byte capacity of each version at H (ISO/IEC 18004, table 7).
    const capacity = [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273];
    expect(capacity.at(-1)).toBe(MAX_BYTES);
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789/:.-_?=&';
    const failed: number[] = [];
    capacity.forEach((bytes, index) => {
      const text = Array.from({ length: bytes }, (_, i) => alphabet[(i * 7 + index * 13) % alphabet.length]).join('');
      const matrix = matrixOf(text);
      expect(matrix.version).toBe(index + 1);
      const found = read(qrSvg(matrix, true), drawingSide(matrix.size), MIN_MODULE_PX);
      if (!same(found?.bytes, utf8(text))) failed.push(index + 1);
    });
    expect(failed, 'versões que não leram com a Oli').toEqual([]);
  });

  it('fails on another text (control): the bytes of a QR never match a text it does not hold', () => {
    const text = CONTENTS['endereço curto'] ?? '';
    const other = matrixOf(`${text}x`);
    const found = read(qrSvg(other, true), drawingSide(other.size), MIN_MODULE_PX);
    expect(found).not.toBeNull();
    expect(same(found?.bytes, utf8(text))).toBe(false);
    // And a code with its frame drawn over far more than H can rebuild does not read at all (the read is real).
    const crushed = { ...other, dark: other.dark.map((value, i) => (Math.floor(i / other.size) % 2 === 0 ? 0 : value)) };
    expect(read(qrSvg(crushed, false), drawingSide(other.size), MIN_MODULE_PX)).toBeNull();
  });
});
