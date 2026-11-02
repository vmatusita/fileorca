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
