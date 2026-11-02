// The number format of the three languages (DECISOES § 112 and § 213): what a person types becomes the exact
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

  it('reads Portuguese money', () => {
    expect(parseScaled('1.234,56', 'pt', 2)).toBe(123_456);
    expect(parseScaled('R$ 450.000,00', 'pt', 2)).toBe(45_000_000);
    expect(parseScaled('R$ 1.896,20', 'pt', 2)).toBe(189_620);
  });

  // Spanish writes numbers as in the US since the F6 (prompt F6 decision 1; DECISOES § 213): until then it read
  // "1.234,56" and "1 234,56", which are now refused.
  it('reads Spanish money as English', () => {
    expect(parseScaled('1,234.56', 'es', 2)).toBe(123_456);
    expect(parseScaled('$1,234.56', 'es', 2)).toBe(123_456);
    expect(parseScaled('987654.32', 'es', 2)).toBe(98_765_432);
    expect(parseScaled('6.5', 'es', 4)).toBe(65_000);
    for (const text of ['1.234,56', '1 234,56', '12 345,6', '6,5']) expect(parseScaled(text, 'es', 4), text).toBeNull();
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
  it('writes money with cents and totals in whole units, half up, with the currency of the page', () => {
    expect(money(189_620, 'en')).toBe('$1,896.20');
    expect(money(-5, 'en', '-')).toBe('-$0.05');
    expect(dollars(68_263_671, 'en')).toBe('$682,637');
    expect(dollars(38_263_650, 'en')).toBe('$382,637');
    expect(dollars(38_263_649, 'en')).toBe('$382,636');
    // Until the F6, Portuguese and Spanish wrote "1.234,56 $" (DECISOES § 213).
    expect(money(123_456, 'pt')).toBe('R$ 1.234,56');
    expect(dollars(38_263_650, 'pt')).toBe('R$ 382.637');
    expect(money(-5, 'pt', '-')).toBe('-R$ 0,05');
    expect(money(189_620, 'es')).toBe('$1,896.20');
    expect(dollars(68_263_671, 'es')).toBe('$682,637');
  });

  it('writes rates without trailing zeros and APY with two decimals', () => {
    expect(ratePercent(65_000, 'en')).toBe('6.5%');
    expect(ratePercent(299_900, 'en')).toBe('29.99%');
    expect(ratePercent(0, 'en')).toBe('0%');
    expect(ratePercent(-20_000, 'en')).toBe('−2%');
    expect(hundredthsPercent(513, 'en')).toBe('5.13%');
    expect(hundredthsPercent(500, 'en')).toBe('5.00%');
    // The Spanish percent keeps the no-break space of the design system; the decimal is a point since the F6.
    expect(hundredthsPercent(513, 'es')).toBe('5.13 %');
    expect(ratePercent(65_000, 'es')).toBe('6.5 %');
    expect(ratePercent(65_000, 'pt')).toBe('6,5%');
  });

  it('writes the CSV form: no thousands separator, an ASCII minus', () => {
    expect(formatScaled(189_620, 2, 'en', { min: 2, group: false })).toBe('1896.20');
    expect(formatScaled(-189_620, 2, 'en', { min: 2, group: false, minus: '-' })).toBe('-1896.20');
    expect(formatScaled(1_234_567_890, 2, 'en', { min: 2 })).toBe('12,345,678.90');
    expect(formatScaled(189_620, 2, 'pt', { min: 2, group: false })).toBe('1896,20');
  });

  // Until the F6, Spanish only grouped numbers of five digits or more, with a no-break space (RAE): "1234" and
  // "12 345". It now groups like English (DECISOES § 213).
  it('groups four digits too, with the separator of the language', () => {
    expect(formatScaled(1234, 0, 'es')).toBe('1,234');
    expect(formatScaled(12_345, 0, 'es')).toBe('12,345');
    expect(formatScaled(1234, 0, 'pt')).toBe('1.234');
    expect(formatScaled(1234, 0, 'en')).toBe('1,234');
  });

  it('reads back what it writes', () => {
    for (const value of [0, 1, 99, 100, 189_620, 98_765_432, 2_000_000_000])
      for (const lang of ['en', 'pt', 'es'] as const) expect(parseScaled(formatScaled(value, 2, lang, { min: 2 }), lang, 2)).toBe(value);
    for (const cents of [5, 189_620, 98_765_432])
      for (const lang of ['en', 'pt', 'es'] as const) expect(parseScaled(money(cents, lang), lang, 2)).toBe(cents);
  });
});
