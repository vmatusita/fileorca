// Reading and writing the numbers people type, in the format of each language (PLANO "Regra das
// calculadoras": "o campo aceita o formato da página"). English and Spanish write 1,234.56 (the Spanish
// pages are for the Hispanic audience of the US, prompt F6 decision 1); Portuguese writes 1.234,56.
// A number becomes a whole number at a fixed scale (cents, rate units) straight from its digits, with no
// floating point in between, so what the person typed is exactly what the engine gets.

export type NumberLang = 'en' | 'pt' | 'es';

const DECIMAL: Record<NumberLang, string> = { en: '.', pt: ',', es: '.' };
/** Thousands separators each language accepts. */
const GROUP: Record<NumberLang, string> = { en: ',', pt: '.', es: ',' };

/** The digits of a number as typed, before the scale of a field: its sign, the whole part and the decimals (F16). */
export interface TypedNumber {
  negative: boolean;
  /** The digits before the decimal mark, without the thousands separators (may be empty: ".5"). */
  whole: string;
  /** The digits after the decimal mark, as many as typed (may be empty: "5."). */
  fraction: string;
}

/**
 * Why a text is not a number of the language: 'separator' when its whole part ends in a thousands separator and one or two
 * digits, with no decimal mark ("6,5" in English, "3,755,00": the decimals written the way of another language), 'format'
 * for anything else (letters, two decimal marks, a separator after the decimal mark, a minus the field does not take, nothing).
 */
export type Unread = 'format' | 'separator';

const DIGITS = /^\d*$/;

/**
 * Reads what a person typed in the format of the language (F16, decision 3; DECISOES § 683). G is the thousands separator and D
 * the decimal mark of the language. The text splits at D: more than one D, or a G after it, does not read. In the whole part,
 * each G followed by exactly three digits and then another G, D or the end is a thousands separator, whatever the group before
 * it ("3755,000" is 3,755,000 in English, "1,234" is 1,234); a G followed by one or two digits and the end of the text, with no
 * D, does not read ('separator', the hint of the decimals); a G anywhere else is ignored (followed by four digits or more,
 * "375,0005"; by one or two digits and another G or D; at the start or at the end, "375," while typing "375,000"). A leading
 * currency sign and a trailing % are ignored, and the minus is read only when `negative` is true.
 */
export function readNumber(text: string, lang: NumberLang, negative = false): TypedNumber | Unread {
  let clean = text.trim().replace(/^(?:US\$|R\$|\$|€)\s*/, '').replace(/\s*%$/, '');
  let minus = false;
  if (/^[-−]/.test(clean)) {
    if (!negative) return 'format';
    minus = true;
    clean = clean.slice(1).trimStart();
  }
  const [head = '', fraction = '', ...rest] = clean.split(DECIMAL[lang]);
  const marked = clean.includes(DECIMAL[lang]);
  if (rest.length > 0 || !DIGITS.test(fraction)) return 'format';
  const runs = head.split(GROUP[lang]);
  if (!runs.every((run) => DIGITS.test(run))) return 'format';
  // The run of digits after the last G, when the text ends there: one or two digits are decimals written with a G.
  const last = runs[runs.length - 1] ?? '';
  if (runs.length > 1 && !marked && (last.length === 1 || last.length === 2)) return 'separator';
  // Every other G goes: a thousands separator (three digits after it) or one that is ignored.
  const whole = runs.join('');
  if (whole === '' && fraction === '') return 'format';
  return { negative: minus, whole, fraction };
}

/**
 * The typed number as a whole number of 10^−decimals, or null when it has more decimals than the scale holds or more than 15
 * digits (the engine's numbers stay exact as JavaScript numbers).
 */
export function scaledOf(typed: TypedNumber, decimals: number): number | null {
  if (typed.fraction.length > decimals) return null;
  const digits = `${typed.whole}${typed.fraction.padEnd(decimals, '0')}`.replace(/^0+(?=\d)/, '');
  if (digits.length > 15) return null;
  const value = Number(digits);
  return typed.negative && value !== 0 ? -value : value;
}

/**
 * The number in `text` as a whole number of 10^−decimals (cents for decimals = 2), or null when it is not
 * a number in that language's format (readNumber), has more decimals than the scale holds, or is negative while
 * `negative` is false. A leading currency sign and a trailing % are ignored.
 */
export function parseScaled(text: string, lang: NumberLang, decimals: number, negative = false): number | null {
  const typed = readNumber(text, lang, negative);
  return typeof typed === 'string' ? null : scaledOf(typed, decimals);
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
