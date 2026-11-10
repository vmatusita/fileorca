// Dates written out in the language of the page (prompt F6, decision 1): "October 31, 2026", "1 de novembro de 2026",
// "1 de noviembre de 2026". By hand, without Intl, so the build and every browser write the same thing (DECISOES § 112).
// Since the F7 the calculator island also writes the days of a pregnancy and of a cycle with it (DECISOES § 262). The dates a page carries ("Reviewed on", "Last updated") are the
// day in Brasília (DECISOES § 207), written as an ISO day.
import type { Lang } from './routes.ts';

const MONTHS: Record<Lang, readonly string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

/** An ISO day (2026-11-01) written out in the language. */
export function longDate(iso: string, lang: Lang): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`not an ISO day: ${iso}`);
  const [, year, month, day] = match;
  const name = MONTHS[lang][Number(month) - 1];
  if (!name) throw new Error(`no month ${month}`);
  return lang === 'en' ? `${name} ${Number(day)}, ${year}` : `${Number(day)} de ${name} de ${year}`;
}

// F13b (DECISOES § 543): the short dates of the one-line signature ("Reviewed by … · Nov 5, 2026", G-23) and of the
// history line, by hand as above. They are what Intl gives in Node (the test compares them): en "Nov 5, 2026"
// (dateStyle medium); pt "05/11/2026" (dateStyle short); es "5/11/2026" (day, month and year numeric); and the medium
// date of a history line, pt "5 de nov. de 2026" and es "5 nov 2026" (dateStyle medium).
const SHORT_MONTHS: Record<Lang, readonly string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  pt: ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
};

function isoParts(iso: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`not an ISO day: ${iso}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** An ISO day in its shortest written form: "Nov 5, 2026", "05/11/2026", "5/11/2026". */
export function shortDate(iso: string, lang: Lang): string {
  const [year, month, day] = isoParts(iso);
  if (lang === 'en') return `${SHORT_MONTHS.en[month - 1] ?? ''} ${day}, ${year}`;
  if (lang === 'pt') return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  return `${day}/${month}/${year}`;
}

/** An ISO day with the month abbreviated: "Nov 5, 2026", "5 de nov. de 2026", "5 nov 2026". */
export function mediumDate(iso: string, lang: Lang): string {
  const [year, month, day] = isoParts(iso);
  const name = SHORT_MONTHS[lang][month - 1] ?? '';
  if (lang === 'en') return `${name} ${day}, ${year}`;
  return lang === 'pt' ? `${day} de ${name} de ${year}` : `${day} ${name} ${year}`;
}

// F13b (F7 obs 2; DECISOES § 550): the dates of a narrow table on the screen (the ovulation's), by hand as above. The month is
// abbreviated and kept with its day by a no-break space, so a narrow column breaks a date only after its comma ("Nov 1," and
// "2026"), never inside "Nov 1". A range says its year once: "Oct 26 to 31, 2026", "Oct 26 to Nov 1, 2026", "Dec 30, 2026 to
// Jan 4, 2027", what Intl.DateTimeFormat#formatRange gives in Node with the month short, with the word of the page for the
// dash (the test compares them). The PDF keeps the long date; the CSV writes the day as YYYY-MM-DD (F16, DECISOES § 688).
const NBSP = ' ';

/** A day of a narrow table: "Oct 31, 2026" (the medium date with the month glued to its day). */
export function tableDate(iso: string, lang: Lang): string {
  const [year, month, day] = isoParts(iso);
  const name = SHORT_MONTHS[lang][month - 1] ?? '';
  if (lang === 'en') return `${name}${NBSP}${day}, ${year}`;
  return lang === 'pt' ? `${day}${NBSP}de ${name} de ${year}` : `${day}${NBSP}${name} ${year}`;
}

/** Two days of a narrow table as one range, with `to` between them ("to", "a"): the year once when both are in it. */
export function tableRange(from: string, to: string, lang: Lang, join: string): string {
  const [y1, m1, d1] = isoParts(from);
  const [y2, m2, d2] = isoParts(to);
  if (lang !== 'en' || y1 !== y2) return `${tableDate(from, lang)} ${join} ${tableDate(to, lang)}`;
  const name = (month: number) => SHORT_MONTHS.en[month - 1] ?? '';
  return m1 === m2 ? `${name(m1)}${NBSP}${d1} ${join} ${d2}, ${y1}` : `${name(m1)}${NBSP}${d1} ${join} ${name(m2)}${NBSP}${d2}, ${y1}`;
}
