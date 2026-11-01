// The number format of the three languages (DECISOES § 112): what a person types becomes the exact
// whole number the engine takes, and the engine's numbers go back to the screen, the CSV and the PDF.
import { describe, expect, it } from 'vitest';
import { dollars, formatScaled, hundredthsPercent, money, parseScaled, ratePercent } from '../../src/calc/parse.ts';

describe('parseScaled', () => {
  it('reads English money, with or without the thousands separator and the dollar sign', () => {
    expect(parseScaled('300,000', 'en', 2)).toBe(30_000_000);
    expect(parseScaled('300000', 'en', 2)).toBe(30_000_000);
    expect(parseScaled('$1,234.56', 'en', 2)).toBe(123_456);
    expect(parseScaled(' 1234.5 ', 'en', 2)).toBe(123_450);
    expect(parseScaled('.5', 'en', 2)).toBe(50);
    expect(parseScaled('987654.32', 'en', 2)).toBe(98_765_432);
  });

  it('reads Portuguese and Spanish money', () => {
    expect(parseScaled('1.234,56', 'pt', 2)).toBe(123_456);
    expect(parseScaled('R$ 450.000,00', 'pt', 2)).toBe(45_000_000);
    expect(parseScaled('1.234,56', 'es', 2)).toBe(123_456);
    expect(parseScaled('1 234,56', 'es', 2)).toBe(123_456);
    expect(parseScaled('12 345,6', 'es', 2)).toBe(1_234_560);
  });

  it('reads a rate with up to four decimals, and the percent sign', () => {
    expect(parseScaled('6.5', 'en', 4)).toBe(65_000);
    expect(parseScaled('13.5791%', 'en', 4)).toBe(135_791);
    expect(parseScaled('6,5', 'pt', 4)).toBe(65_000);
    expect(parseScaled('0', 'en', 4)).toBe(0);
  });

  it('refuses what is not a number in the language, too many decimals and a sign the field does not take', () => {
    for (const text of ['', ' ', 'abc', '1,23', '1.2.3', '12,34,56', '6.55555', '1e5', '--1', '1,234.567'])
      expect(parseScaled(text, 'en', 2), text).toBeNull();
    expect(parseScaled('1,234.56', 'pt', 2)).toBeNull();
    expect(parseScaled('-5', 'en', 4)).toBeNull();
    expect(parseScaled('-5', 'en', 4, true)).toBe(-50_000);
    expect(parseScaled('−2.5', 'en', 4, true)).toBe(-25_000);
    expect(parseScaled('1234567890123456', 'en', 2)).toBeNull();
  });
});

describe('formatting', () => {
  it('writes money with cents and totals in whole dollars, half up', () => {
    expect(money(189_620, 'en')).toBe('$1,896.20');
    expect(money(-5, 'en', '-')).toBe('-$0.05');
    expect(dollars(68_263_671, 'en')).toBe('$682,637');
    expect(dollars(38_263_650, 'en')).toBe('$382,637');
    expect(dollars(38_263_649, 'en')).toBe('$382,636');
    expect(money(123_456, 'pt')).toBe('1.234,56 $');
  });

  it('writes rates without trailing zeros and APY with two decimals', () => {
    expect(ratePercent(65_000, 'en')).toBe('6.5%');
    expect(ratePercent(299_900, 'en')).toBe('29.99%');
    expect(ratePercent(0, 'en')).toBe('0%');
    expect(ratePercent(-20_000, 'en')).toBe('−2%');
    expect(hundredthsPercent(513, 'en')).toBe('5.13%');
    expect(hundredthsPercent(500, 'en')).toBe('5.00%');
    expect(hundredthsPercent(513, 'es')).toBe('5,13 %');
  });

  it('writes the CSV form: no thousands separator, an ASCII minus', () => {
    expect(formatScaled(189_620, 2, 'en', { min: 2, group: false })).toBe('1896.20');
    expect(formatScaled(-189_620, 2, 'en', { min: 2, group: false, minus: '-' })).toBe('-1896.20');
    expect(formatScaled(1_234_567_890, 2, 'en', { min: 2 })).toBe('12,345,678.90');
    expect(formatScaled(1234, 0, 'es')).toBe('1234');
    expect(formatScaled(12_345, 0, 'es')).toBe('12 345');
  });

  it('reads back what it writes', () => {
    for (const value of [0, 1, 99, 100, 189_620, 98_765_432, 2_000_000_000])
      for (const lang of ['en', 'pt', 'es'] as const) expect(parseScaled(formatScaled(value, 2, lang, { min: 2 }), lang, 2)).toBe(value);
  });
});
