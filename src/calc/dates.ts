// Days of the calendar for the pregnancy and cycle calculators (prompt F7, decision 3): a day is "2026-03-17" outside the
// engine and a whole number of days since 1970-01-01 inside it, never a Date with a time zone, so 10 p.m. in Brazil
// (already tomorrow in UTC) never moves a due date. The conversion is the proleptic Gregorian calendar in whole
// numbers (H. Hinnant's days_from_civil and civil_from_days); scripts/oracle/calc_home_health.py counts the same days
// with Python's date.toordinal(), which never shares code with this file.

export interface CivilDay {
  year: number;
  month: number;
  day: number;
}

/** Days since 1970-01-01 of a day of the Gregorian calendar (any year from 1 to 9999). */
export function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146_097 + doe - 719_468;
}

/** The day of the calendar a number of days since 1970-01-01 falls on. */
export function civilFromDays(days: number): CivilDay {
  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  return { year: yoe + era * 400 + (month <= 2 ? 1 : 0), month, day };
}

export function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** The days since 1970-01-01 of "2026-03-17", or null when the text is not a real day of the calendar. */
export function dayOf(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return daysFromCivil(year, month, day);
}

/** "2026-03-17" for a number of days since 1970-01-01. */
export function isoOf(days: number): string {
  const { year, month, day } = civilFromDays(days);
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
