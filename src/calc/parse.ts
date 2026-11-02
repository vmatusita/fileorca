// Reading and writing the numbers people type, in the format of each language (PLANO "Regra das
// calculadoras": "o campo aceita o formato da página"). English and Spanish write 1,234.56 (the Spanish
// pages are for the Hispanic audience of the US, prompt F6 decision 1); Portuguese writes 1.234,56.
// A number becomes a whole number at a fixed scale (cents, rate units) straight from its digits, with no
// floating point in between, so what the person typed is exactly what the engine gets.

export type NumberLang = 'en' | 'pt' | 'es';

const DECIMAL: Record<NumberLang, string> = { en: '.', pt: ',', es: '.' };
/** Thousands separators each language accepts. */
const GROUP: Record<NumberLang, string> = { en: ',', pt: '.', es: ',' };

/** Escapes text for a RegExp (inside or outside a character class). */
const escape = (chars: string): string => chars.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

const PATTERNS = Object.fromEntries(
  (Object.keys(DECIMAL) as NumberLang[]).map((lang) => {
    const group = `[${escape(GROUP[lang])}]`;
    const decimal = escape(DECIMAL[lang]);
    return [lang, new RegExp(`^(\\d{1,3}(?:${group}\\d{3})+|\\d*)(?:${decimal}(\\d*))?$`)];
  }),
) as Record<NumberLang, RegExp>;

/**
 * The number in `text` as a whole number of 10^−decimals (cents for decimals = 2), or null when it is not
 * a number in that language's format, has more decimals than the scale holds, or is negative while
 * `negative` is false. A leading currency sign and a trailing % are ignored.
 */
export function parseScaled(text: string, lang: NumberLang, decimals: number, negative = false): number | null {
  let clean = text.trim().replace(/^(?:US\$|R\$|\$|€)\s*/, '').replace(/\s*%$/, '');
  let sign = 1;
  if (/^[-−]/.test(clean)) {
    if (!negative) return null;
    sign = -1;
    clean = clean.slice(1).trimStart();
  }
  const match = PATTERNS[lang].exec(clean);
  if (!match) return null;
  const whole = (match[1] ?? '').replace(/\D/g, '');
  const fraction = match[2] ?? '';
  if (whole === '' && fraction === '') return null;
  if (fraction.length > decimals) return null;
  const digits = `${whole}${fraction.padEnd(decimals, '0')}`.replace(/^0+(?=\d)/, '');
  if (digits.length > 15) return null;
  const value = Number(digits);
  return sign < 0 && value !== 0 ? -value : value;
}

/** Groups the digits of a whole number with the language's thousands separator (also four digits: 1,234). */
function grouped(digits: string, lang: NumberLang): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP[lang]);
}

export interface ScaledFormat {
  /** Decimals always shown (cents: 2). */
  min?: number;
  /** The typographic minus (screen) or the ASCII hyphen (CSV, PDF). */
  minus?: '−' | '-';
  /** Thousands separators (the CSV leaves them out). */
  group?: boolean;
}

/** A whole number of 10^−decimals written back in the language's format, trailing zeros cut down to `min`. */
export function formatScaled(value: number, decimals: number, lang: NumberLang, { min = 0, minus = '−', group = true }: ScaledFormat = {}): string {
  const negative = value < 0;
  const digits = String(Math.abs(value)).padStart(decimals + 1, '0');
  const whole = digits.slice(0, digits.length - decimals);
  let fraction = decimals ? digits.slice(digits.length - decimals) : '';
  while (fraction.length > min && fraction.endsWith('0')) fraction = fraction.slice(0, -1);
  const body = (group ? grouped(whole, lang) : whole) + (fraction ? DECIMAL[lang] + fraction : '');
  return negative ? `${minus}${body}` : body;
}

/** The currency sign before the number: $1,896.20 (en, es) and R$ 1.896,20 (pt, with a no-break space). */
function withCurrency(sign: string, body: string, lang: NumberLang): string {
  return lang === 'pt' ? `${sign}R$ ${body}` : `${sign}$${body}`;
}

/** Cents as money with the cents: $1,896.20, R$ 1.896,20. */
export function money(cents: number, lang: NumberLang, minus: ScaledFormat['minus'] = '−'): string {
  return withCurrency(cents < 0 ? minus : '', formatScaled(Math.abs(cents), 2, lang, { min: 2 }), lang);
}

/** Cents as whole units, half up: $682,637, R$ 682.637 (the totals of a sentence). */
export function dollars(cents: number, lang: NumberLang, minus: ScaledFormat['minus'] = '−'): string {
  const whole = Math.floor((Math.abs(cents) + 50) / 100);
  return withCurrency(cents < 0 && whole > 0 ? minus : '', formatScaled(whole, 0, lang), lang);
}

/** Rate units (1/10,000 of a point) as a percent: 6.5%, 29.99%, 0%. Spanish puts a no-break space before %. */
export function ratePercent(units: number, lang: NumberLang, minus: ScaledFormat['minus'] = '−'): string {
  const body = formatScaled(units, 4, lang, { minus });
  return lang === 'es' ? `${body} %` : `${body}%`;
}

/** Hundredths of a percent, always with two decimals: 5.13%. */
export function hundredthsPercent(value: number, lang: NumberLang): string {
  const body = formatScaled(value, 2, lang, { min: 2 });
  return lang === 'es' ? `${body} %` : `${body}%`;
}
