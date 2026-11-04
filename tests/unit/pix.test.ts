// The Pix generator against its oracle (prompt F6, decision 8): src/platform/pix.ts must give, byte for byte, the
// static example of the BCB manual and the four codes scripts/oracle/pix.py wrote to fixtures/pix.json in a commit
// before the generator existed; the oracle's SHA-256 pins the fixture to the script that wrote it.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PIX_AMOUNTS, PIX_CITY, PIX_KEY, PIX_NAME, brCode, crc16, sitePixCode } from '../../src/platform/pix.ts';
import { DONATE_PLACES, cleanParams } from '../../src/analytics/events.ts';

interface PixFixture {
  oracle: { script: string; sha256: string; python: string; date: string };
  manual: { key: string; name: string; city: string; code: string };
  receiver: { key: string; name: string; city: string };
  codes: { amount: string | null; code: string }[];
}

const fixture = JSON.parse(readFileSync('fixtures/pix.json', 'utf8')) as PixFixture;

describe('the Pix oracle fixture', () => {
  it('was written by the current oracle script (SHA-256 of scripts/oracle/pix.py, LF line ends)', () => {
    const sha = createHash('sha256').update(readFileSync(fixture.oracle.script, 'utf8').replaceAll('\r\n', '\n')).digest('hex');
    expect(fixture.oracle.script).toBe('scripts/oracle/pix.py');
    expect(fixture.oracle.sha256).toBe(sha);
  });

  it('holds the manual example and the four amounts of the support page', () => {
    expect(fixture.manual.code).toBe('00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D');
    expect(fixture.codes.map((entry) => entry.amount)).toEqual([...PIX_AMOUNTS]);
  });

  it('has the receiver of docs/F0-SAIDA.md, the one the generator is configured with', () => {
    expect(fixture.receiver).toEqual({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY });
    expect(readFileSync('docs/F0-SAIDA.md', 'utf8')).toContain(`| Chave Pix aleatória (só do site) | ${PIX_KEY} |`);
  });
});

describe('the Pix generator', () => {
  it('reproduces the static example of the manual, byte for byte', () => {
    const { key, name, city, code } = fixture.manual;
    expect(brCode({ key, name, city, amount: null })).toBe(code);
  });

  it('reproduces the four codes of the oracle, byte for byte', () => {
    for (const { amount, code } of fixture.codes) expect(sitePixCode(amount as (typeof PIX_AMOUNTS)[number]), String(amount)).toBe(code);
  });

  it('computes the CRC16-CCITT (0x1021, start 0xFFFF): the check value and the manual', () => {
    expect(crc16('123456789')).toBe('29B1');
    expect(crc16(fixture.manual.code.slice(0, -4))).toBe('1D3D');
  });

  it('changes the CRC with another key, and refuses a name over 25 characters or a city over 15', () => {
    const other = brCode({ key: '123e4567-e12b-12d1-a456-426655440001', name: PIX_NAME, city: PIX_CITY, amount: null });
    expect(other.slice(-4)).not.toBe(fixture.codes[0]?.code.slice(-4));
    expect(() => brCode({ key: PIX_KEY, name: 'A'.repeat(26), city: PIX_CITY, amount: null })).toThrow(/1 to 25/);
    expect(() => brCode({ key: PIX_KEY, name: PIX_NAME, city: 'C'.repeat(16), amount: null })).toThrow(/1 to 15/);
    expect(() => brCode({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY, amount: '5' })).toThrow(/amount/);
    expect(brCode({ key: PIX_KEY, name: 'A'.repeat(25), city: 'C'.repeat(15), amount: null })).toMatch(/^000201/);
  });

  it('writes the amount only when there is one, as field 54 between 53 and 58', () => {
    expect(sitePixCode(null)).not.toContain('5404');
    expect(sitePixCode('5.00')).toContain('53039865404' + '5.00' + '5802BR');
    expect(sitePixCode('20.00')).toContain('530398654052' + '0.005802BR');
  });
});

describe('the donate_click of the Pix', () => {
  // The Copy code button sends donate_click with the place pix, a value of the closed list (DECISOES § 10 and § 216). The
  // list gained `menu` in the F11 (the Support Oli row of the header Menu, § 390 and § 392): it stays closed and ordered.
  it('keeps the place pix and drops a place outside the list', () => {
    expect(DONATE_PLACES).toEqual(['result', 'footer', 'support_page', 'pix', 'menu']);
    expect(cleanParams('donate_click', { place: 'menu', lang: 'es' })).toEqual({ place: 'menu', lang: 'es' });
    expect(cleanParams('donate_click', { place: 'header', lang: 'es' })).toEqual({ lang: 'es' });
    expect(cleanParams('donate_click', { place: 'pix', lang: 'pt' })).toEqual({ place: 'pix', lang: 'pt' });
    expect(cleanParams('donate_click', { place: 'pix-copia-e-cola', lang: 'pt' })).toEqual({ lang: 'pt' });
  });
});
