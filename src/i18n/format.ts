// Formatting helpers shared by pages and the tool island (no texts imported here, so the
// island bundle never pulls every language).
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

/** Size in bytes as "2.4 MB" / "2,4 MB". */
export function fileSize(bytes: number, lang: Lang): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  const locale = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es';
  return `${value.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${units[unit]}`;
}
