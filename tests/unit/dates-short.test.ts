// The short and medium dates of the F13b (the one-line "Reviewed by" and the history line; DECISOES § 543) are written
// by hand, like longDate (DECISOES § 112), and say what Intl says in Node for every day of two years.
import { describe, expect, it } from 'vitest';
import { mediumDate, shortDate } from '../../src/i18n/dates.ts';

const DAYS = Array.from({ length: 731 }, (_, index) => new Date(Date.UTC(2026, 0, 1 + index)).toISOString().slice(0, 10));
const intl = (locale: string, options: Intl.DateTimeFormatOptions) => (iso: string) =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

describe('shortDate and mediumDate', () => {
  it('write the examples of the specification', () => {
    expect(shortDate('2026-11-05', 'en')).toBe('Nov 5, 2026');
    expect(shortDate('2026-11-05', 'pt')).toBe('05/11/2026');
    expect(shortDate('2026-11-05', 'es')).toBe('5/11/2026');
    expect(mediumDate('2026-11-05', 'pt')).toBe('5 de nov. de 2026');
    expect(mediumDate('2026-09-03', 'es')).toBe('3 sept 2026');
  });

  it('say what Intl says, every day of 2026 and 2027', () => {
    const want = {
      shortEn: intl('en-US', { dateStyle: 'medium' }),
      shortPt: intl('pt-BR', { dateStyle: 'short' }),
      shortEs: intl('es', { day: 'numeric', month: 'numeric', year: 'numeric' }),
      mediumPt: intl('pt-BR', { dateStyle: 'medium' }),
      mediumEs: intl('es', { dateStyle: 'medium' }),
    };
    for (const day of DAYS) {
      expect(shortDate(day, 'en'), day).toBe(want.shortEn(day));
      expect(mediumDate(day, 'en'), day).toBe(want.shortEn(day));
      expect(shortDate(day, 'pt'), day).toBe(want.shortPt(day));
      expect(shortDate(day, 'es'), day).toBe(want.shortEs(day));
      expect(mediumDate(day, 'pt'), day).toBe(want.mediumPt(day));
      expect(mediumDate(day, 'es'), day).toBe(want.mediumEs(day));
    }
  });

  it('refuse what is not an ISO day', () => {
    expect(() => shortDate('5/11/2026', 'en')).toThrow(/ISO/);
    expect(() => mediumDate('2026-11', 'pt')).toThrow(/ISO/);
  });
});
