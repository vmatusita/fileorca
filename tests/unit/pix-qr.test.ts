// The QR of the Pix, read back (prompt F6, decision 8): every SVG the build put on /pt/apoie/ is rasterised with
// @resvg/resvg-js and decoded with jsqr (Apache-2.0), and must give exactly the code of fixtures/pix.json for its
// amount. The page is read from dist/ (run `pnpm build` first, as `pnpm verificar` does).
import { existsSync, readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { QUIET_ZONE, qrSvg } from '../../src/platform/pix-qr.ts';

interface PixFixture {
  codes: { amount: string | null; code: string }[];
}

const fixture = JSON.parse(readFileSync('fixtures/pix.json', 'utf8')) as PixFixture;
const PAGE = 'dist/pt/apoie/index.html';

/** The text a QR in SVG holds, as a phone would read it: rasterised at 8 px a module, then decoded. */
function decode(svg: string): string | null {
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: 480 }, background: '#FFFFFF' }).render();
  const pixels = image.pixels;
  return jsQR(new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.length), image.width, image.height)?.data ?? null;
}

const valueOf = (amount: string | null): string => (amount === null ? 'any' : String(Number(amount)));

describe('the Pix QR', () => {
  it('draws a code that reads back to itself, with the quiet zone and no hex but the white', () => {
    for (const { code } of fixture.codes) {
      const { svg, size } = qrSvg(code, 'QR');
      expect(decode(svg)).toBe(code);
      expect(svg).toContain(`viewBox="0 0 ${size + 2 * QUIET_ZONE} ${size + 2 * QUIET_ZONE}"`);
      expect(svg.match(/#[0-9A-Fa-f]{3,8}\b/g)).toEqual(['#FFFFFF']);
      expect(svg).toContain('fill="currentColor"');
    }
  });

  it('fails on a broken code (control): a QR of another text does not give the code', () => {
    const [first] = fixture.codes;
    expect(first).toBeDefined();
    const other = qrSvg(`${first!.code}0`, 'QR').svg;
    expect(decode(other)).not.toBe(first!.code);
  });

  it('puts on /pt/apoie/ one QR per amount, each reading back to the code of the fixture and shown next to it', () => {
    expect(existsSync(PAGE), 'run pnpm build first').toBe(true);
    const root = parse(readFileSync(PAGE, 'utf8'));
    const blocks = root.querySelectorAll('.fo-pix');
    expect(blocks.map((block) => block.getAttribute('data-pix'))).toEqual(fixture.codes.map((entry) => valueOf(entry.amount)));
    for (const { amount, code } of fixture.codes) {
      const block = root.querySelector(`.fo-pix[data-pix="${valueOf(amount)}"]`);
      const svg = block?.querySelector('svg.fo-pix__qr')?.toString() ?? '';
      expect(decode(svg), String(amount)).toBe(code);
      expect(block?.querySelector('code')?.text).toBe(code);
      expect(block?.querySelector('[data-pix-copy]')?.getAttribute('data-pix-copy')).toBe(code);
      expect(block?.querySelector('svg')?.getAttribute('aria-label')).toMatch(/^QR code do Pix, /);
    }
    const radios = root.querySelectorAll('.fo-pix-card input[type="radio"]');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual(fixture.codes.map((entry) => valueOf(entry.amount)));
    expect(radios[0]?.hasAttribute('checked')).toBe(true);
  });

  it('has no Pix on the support pages of English and Spanish', () => {
    for (const page of ['dist/support/index.html', 'dist/es/apoyo/index.html']) expect(readFileSync(page, 'utf8')).not.toContain('br.gov.bcb.pix');
  });
});
