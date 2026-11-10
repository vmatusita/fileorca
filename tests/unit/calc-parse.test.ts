// The number format of the three languages (DECISOES § 112 and § 213): what a person types becomes the exact
// whole number the engine takes, and the engine's numbers go back to the screen, the CSV and the PDF.
import { describe, expect, it } from 'vitest';
import { dollars, formatScaled, hundredthsPercent, money, parseScaled, ratePercent, readNumber } from '../../src/calc/parse.ts';

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

// F16, decision 3 (F4 DES-3; DECISOES § 683): a thousands separator followed by exactly three digits is a thousands separator
// wherever it is in the whole part, so a digit typed in the middle of "375,000" reads; one followed by one or two digits at
// the end of the text is the decimals of another language (the hint); anywhere else it is ignored. Every expected value is
// written here by hand, in the units of the field (cents for money, 1/10,000 of a point for a rate).
describe('readNumber and parseScaled, the format while typing (F16)', () => {
  /** [language, text, decimals of the field, what it reads: a number of the field's units, 'separator' or 'format']. */
  const CASES: [lang: 'en' | 'pt' | 'es', text: string, decimals: number, reads: number | 'separator' | 'format'][] = [
    // A digit typed in the middle of a grouped number (the D13 of the plan).
    ['en', '3755,000', 2, 375_500_000],
    ['es', '3755,000', 2, 375_500_000],
    ['pt', '3755.000', 2, 375_500_000],
    ['pt', '5005.000', 2, 500_500_000],
    ['en', '3755,000.50', 2, 375_500_050],
    ['pt', '3755.000,50', 2, 375_500_050],
    // As today: one group of three digits.
    ['en', '1,234', 2, 123_400],
    ['es', '1,234', 2, 123_400],
    ['pt', '1.234', 2, 123_400],
    ['en', '1,234', 0, 1234],
    // Four digits or more after a separator: it is ignored.
    ['en', '375,0005', 2, 375_000_500],
    ['es', '375,0005', 2, 375_000_500],
    ['pt', '375.0005', 2, 375_000_500],
    // A separator at the end, while "375,000" is typed key by key, and at the start.
    ['en', '375,', 2, 37_500],
    ['es', '375,', 2, 37_500],
    ['pt', '375.', 2, 37_500],
    ['en', ',500', 2, 50_000],
    // One or two digits after a separator and before another separator or the decimal mark: ignored.
    ['en', '12,34,567', 0, 1_234_567],
    ['en', '1,23.5', 2, 12_350],
    ['pt', '1.23,5', 2, 12_350],
    // One or two digits after the last separator and the end of the text: the decimals of another language.
    ['en', '6,5', 4, 'separator'],
    ['es', '6,5', 4, 'separator'],
    ['pt', '11.5', 4, 'separator'],
    ['en', '3,755,00', 2, 'separator'],
    ['es', '3,755,00', 2, 'separator'],
    ['pt', '3.755.00', 2, 'separator'],
    ['en', '12,34,56', 2, 'separator'],
    ['en', '1,23', 2, 'separator'],
    ['en', ',5', 2, 'separator'],
    ['en', '375,0', 2, 'separator'],
    ['pt', '375.00', 2, 'separator'],
    // A separator after the decimal mark does not read: the number of the other language.
    ['en', '1.234,56', 2, 'format'],
    ['es', '1.234,56', 2, 'format'],
    ['pt', '1,234.56', 2, 'format'],
    ['en', '1.5,0', 2, 'format'],
    ['pt', '1,5.0', 2, 'format'],
    // The refusals of always, in the three languages.
    ['en', 'abc', 2, 'format'],
    ['pt', 'abc', 2, 'format'],
    ['es', 'abc', 2, 'format'],
    ['en', '1.2.3', 2, 'format'],
    ['es', '1.2.3', 2, 'format'],
    ['pt', '1,2,3', 2, 'format'],
    ['en', '-5', 4, 'format'],
    ['pt', '-5', 4, 'format'],
    ['es', '−5', 4, 'format'],
    ['en', '', 2, 'format'],
    ['pt', ' ', 2, 'format'],
    ['es', '.', 2, 'format'],
    ['pt', ',', 2, 'format'],
    ['en', ',', 2, 'format'],
    ['en', '1 234', 2, 'format'],
    ['en', '1e5', 2, 'format'],
    ['en', '--1', 4, 'format'],
  ];

  it('reads each case of the ficha and of decision 3 in English, Portuguese and Spanish', () => {
    for (const [lang, text, decimals, reads] of CASES) {
      const typed = readNumber(text, lang);
      if (typeof reads === 'string') {
        expect(typed, `${lang} "${text}"`).toBe(reads);
        expect(parseScaled(text, lang, decimals), `${lang} "${text}"`).toBeNull();
      } else expect(parseScaled(text, lang, decimals), `${lang} "${text}"`).toBe(reads);
    }
  });

  it('keeps the sign, the 15 digits and the decimals of the field as they were', () => {
    // Sixteen digits, with or without separators, do not read.
    expect(parseScaled('1234567890123456', 'pt', 0)).toBeNull();
    expect(parseScaled('1,234,567,890,123,456', 'en', 0)).toBeNull();
    expect(parseScaled('123456789012345', 'en', 0)).toBe(123_456_789_012_345);
    // More decimals than the field keeps: a well-formed number, which the field does not take.
    expect(readNumber('1,234.567', 'en')).toEqual({ negative: false, whole: '1234', fraction: '567' });
    expect(parseScaled('1,234.567', 'en', 2)).toBeNull();
    expect(readNumber('3755.000,505', 'pt')).toEqual({ negative: false, whole: '3755000', fraction: '505' });
    expect(parseScaled('6.55555', 'es', 4)).toBeNull();
    expect(parseScaled('6.5555', 'es', 4)).toBe(65_555);
    // The minus only where the field takes it, also before a grouped number.
    expect(readNumber('−3,755,000', 'en', true)).toEqual({ negative: true, whole: '3755000', fraction: '' });
    expect(parseScaled('-3755,000', 'en', 0, true)).toBe(-3_755_000);
    expect(parseScaled('-0', 'en', 0, true)).toBe(0);
    // The currency sign and the percent, ignored as before.
    expect(parseScaled('$3755,000', 'en', 2)).toBe(375_500_000);
    expect(parseScaled('R$ 3755.000', 'pt', 2)).toBe(375_500_000);
    expect(parseScaled('6,5%', 'pt', 4)).toBe(65_000);
    expect(readNumber('6,5%', 'en')).toBe('separator');
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
