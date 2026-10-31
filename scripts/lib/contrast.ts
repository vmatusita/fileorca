// WCAG 2.x contrast maths over the colour tokens of docs/design/tokens.json (tests/unit/contrast.test.ts).

export type Theme = 'light' | 'dark';
export const THEMES: readonly Theme[] = ['light', 'dark'];

/** What a pair is used for: body text, large text, an icon that carries meaning, a border or focus ring. */
export type Use = 'text' | 'large' | 'icon' | 'ui';

/** WCAG 1.4.3 (4.5 for text, 3 for large text) and 1.4.11 (3 for icons and UI parts). */
export const MIN_RATIO: Readonly<Record<Use, number>> = { text: 4.5, large: 3, icon: 3, ui: 3 };

export function parseHex(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  const digits = match?.[1];
  if (!digits) throw new Error(`cor inválida: ${hex} (só #RGB ou #RRGGBB)`);
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
  return [0, 2, 4].map((start) => Number.parseInt(full.slice(start, start + 2), 16)) as [number, number, number];
}

function linear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** Two decimals with a comma, cut (never rounded up) so a printed ratio never claims more than it has. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100 + 1e-9) / 100).toFixed(2).replace('.', ',');
}

function colorEntry(tokens: unknown, name: string): unknown {
  const list = ((tokens as { color?: { tokens?: unknown } } | null)?.color?.tokens ?? null) as { name: string; value: unknown }[] | null;
  const entry = list?.find((token) => token.name === name);
  if (!entry) throw new Error(`token de cor desconhecido: ${name}`);
  return entry.value;
}

/**
 * The hex value of a colour token in a theme. A plain string is the same in both themes and a
 * "{other-token}" string points to another token (ad-ground); both are resolved here.
 */
export function colorValue(tokens: unknown, name: string, theme: Theme, seen: readonly string[] = []): string {
  if (seen.includes(name)) throw new Error(`referência circular entre tokens: ${[...seen, name].join(' > ')}`);
  const raw = colorEntry(tokens, name);
  const value = typeof raw === 'string' ? raw : (raw as Partial<Record<Theme, string>>)[theme];
  if (typeof value !== 'string') throw new Error(`token ${name} sem valor no tema ${theme}`);
  const reference = /^\{([a-z0-9-]+)\}$/.exec(value);
  return reference?.[1] ? colorValue(tokens, reference[1], theme, [...seen, name]) : value;
}
