// F13b (F7 obs 2; DECISOES § 550): the dates of the ovulation's table, written by hand (§ 112), against the Intl of Node: a day
// is the medium date with its month glued to its day by a no-break space, and a range is what formatRange gives with the
// month short, with "to" for its dash. Every day of 2026 and 2027, and every range of six days, the length of a fertile window.
import { describe, expect, it } from 'vitest';
import { tableDate, tableRange } from '../../src/i18n/dates.ts';

const DAY = 86_400_000;
const iso = (time: number): string => new Date(time).toISOString().slice(0, 10);
const days = (): number[] => {
  const out: number[] = [];
  for (let time = Date.UTC(2026, 0, 1); time <= Date.UTC(2027, 11, 31); time += DAY) out.push(time);
  return out;
};
const medium = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

describe('the dates of a narrow table', () => {
  it('writes a day as the medium date of Intl, with the month glued to its day', () => {
    for (const time of days()) {
      const written = tableDate(iso(time), 'en');
      expect(written.replace(' ', ' ')).toBe(medium.format(time));
      expect(written).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    }
  });

  it('writes a range as the formatRange of Intl, with "to" for its dash and the year once', () => {
    for (const time of days()) {
      const written = tableRange(iso(time), iso(time + 5 * DAY), 'en', 'to');
      const intl = medium.formatRange(time, time + 5 * DAY).replace(/\s+–\s+/, ' to ').replace(/[  ]/g, ' ');
      expect(written.replaceAll(' ', ' ')).toBe(intl);
      // A month and its day never part: split at the ordinary spaces, no piece is a month alone.
      for (const piece of written.split(' ')) expect(piece).not.toMatch(/^[A-Z][a-z]{2}$/);
    }
  });
});
