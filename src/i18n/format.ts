// Formatting helpers shared by pages and the tool island (no texts imported here, so the
// island bundle never pulls every language). Numbers are written by hand, never with Intl, so the
// build and every browser write the same thing (DECISOES § 112): English and Spanish write 2.4 MB and
// 20,000; Portuguese 2,4 MB and 20.000 (prompt F6, decision 1).
import type { Lang } from './routes.ts';

/** Fills {placeholders}: fmt('Made by {name}', { name: 'Victor' }). */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}

/** Percent as each language writes it: 68% (en, pt) and 68 % (es, with a no-break space). */
export function percent(value: number, lang: Lang): string {
  const rounded = Math.round(value);
  return lang === 'es' ? `${rounded} %` : `${rounded}%`;
}

/** A whole number with the language's thousands separator: 20,000 (en, es), 20.000 (pt). */
export function groupDigits(value: number, lang: Lang): string {
  const digits = String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'pt' ? '.' : ',');
  return value < 0 ? `−${digits}` : digits;
}

/** Size in bytes as "2.4 MB" / "2,4 MB": one decimal under 100, none from 100 or in bytes, half up. */
export function fileSize(bytes: number, lang: Lang): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const tenths = unit === 0 || value >= 100 ? null : Math.round(value * 10);
  const body = tenths === null ? groupDigits(value, lang) : `${Math.floor(tenths / 10)}${lang === 'pt' ? ',' : '.'}${tenths % 10}`;
  return `${body} ${units[unit]}`;
}
