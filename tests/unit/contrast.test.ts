import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MIN_RATIO, THEMES, colorValue, contrastRatio, formatRatio, parseHex, relativeLuminance, type Use } from '../../scripts/lib/contrast.ts';
import { TEXT_COLOR_TOKENS } from '../../scripts/lib/design-checks.ts';

const tokens: unknown = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8'));

interface Pair {
  fg: string;
  bg: string;
  use: Use;
}

// Every (foreground, background) pair the site's CSS puts on screen. `text` >= 4.5, `large` >= 3
// (Fredoka from 24px, or 18.66px bold), `icon` >= 3 (an icon that carries meaning), `ui` >= 3
// (borders, focus rings and the Download button against the deep sea). Values come from tokens.json.
const PAIRS: readonly Pair[] = [
  ...['bg', 'surface', 'surface-sunken', 'water', 'brand-soft', 'danger-soft', 'turquesa-soft', 'coral-soft', 'alga-soft', 'violeta-soft', 'lima-soft'].map((bg) => ({ fg: 'ink', bg, use: 'text' as const })),
  // ink-muted on water: the DropZone help line sits on the risen water while a file is over it.
  ...['bg', 'surface', 'surface-sunken', 'ad-ground', 'water', 'brand-soft'].map((bg) => ({ fg: 'ink-muted', bg, use: 'text' as const })),
  { fg: 'brand', bg: 'bg', use: 'text' },
  { fg: 'brand', bg: 'surface', use: 'text' },
  { fg: 'danger', bg: 'bg', use: 'text' },
  { fg: 'danger', bg: 'surface', use: 'text' },
  { fg: 'danger', bg: 'danger-soft', use: 'text' },
  { fg: 'success', bg: 'bg', use: 'text' },
  { fg: 'success', bg: 'surface', use: 'text' },
  { fg: 'on-brand', bg: 'brand', use: 'text' },
  { fg: 'on-sun', bg: 'sun', use: 'text' },
  ...['turquesa', 'coral', 'alga', 'lima'].map((bg) => ({ fg: 'on-cat', bg, use: 'text' as const })),
  { fg: 'on-violeta', bg: 'violeta', use: 'text' },
  { fg: 'on-deep', bg: 'deep', use: 'text' },
  { fg: 'on-deep-muted', bg: 'deep', use: 'text' },
  { fg: 'brand-on-deep', bg: 'deep', use: 'icon' },
  { fg: 'brand', bg: 'brand-soft', use: 'icon' },
  { fg: 'danger', bg: 'danger-soft', use: 'icon' },
  { fg: 'focus', bg: 'bg', use: 'ui' },
  { fg: 'focus', bg: 'surface', use: 'ui' },
  { fg: 'focus', bg: 'surface-sunken', use: 'ui' },
  { fg: 'on-deep', bg: 'deep', use: 'ui' },
  { fg: 'stroke', bg: 'bg', use: 'ui' },
  { fg: 'stroke', bg: 'surface', use: 'ui' },
  { fg: 'stroke', bg: 'surface-sunken', use: 'ui' },
  { fg: 'sun', bg: 'deep', use: 'ui' },
];

const label = (pair: Pair) => `${pair.fg} sobre ${pair.bg}`;
const ratioOf = (pair: Pair, theme: (typeof THEMES)[number]) => contrastRatio(colorValue(tokens, pair.fg, theme), colorValue(tokens, pair.bg, theme));

describe('fórmula de contraste da WCAG', () => {
  it('matches the reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 10);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 10);
    expect(contrastRatio('#123456', '#123456')).toBe(1);
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
    expect(contrastRatio('#777', '#FFF')).toBeCloseTo(4.48, 2);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 10);
    expect(relativeLuminance('#000')).toBe(0);
    expect(relativeLuminance('#FF0000')).toBeCloseTo(0.2126, 4);
  });

  it('parses #RGB and #RRGGBB and rejects anything else', () => {
    expect(parseHex('#0b63F6')).toEqual([11, 99, 246]);
    expect(parseHex('#abc')).toEqual([170, 187, 204]);
    for (const bad of ['0B63F6', '#0B63F6AA', '#12', 'rgb(1,2,3)', 'var(--ink)']) expect(() => parseHex(bad), bad).toThrow(/cor inválida/);
  });

  it('prints ratios cut to two decimals with a comma', () => {
    expect(formatRatio(4.5)).toBe('4,50');
    expect(formatRatio(4.499)).toBe('4,49');
    expect(formatRatio(13.2999)).toBe('13,29');
    expect(formatRatio(21)).toBe('21,00');
  });

  it('keeps the thresholds of WCAG 1.4.3 and 1.4.11', () => {
    expect(MIN_RATIO).toEqual({ text: 4.5, large: 3, icon: 3, ui: 3 });
  });
});

describe('tokens de cor', () => {
  it('uses the same value in both themes for a plain string', () => {
    for (const name of ['deep', 'on-deep', 'sun', 'on-cat', 'on-violeta', 'brand-on-deep']) expect(colorValue(tokens, name, 'light'), name).toBe(colorValue(tokens, name, 'dark'));
  });

  it('keeps the two themes apart for a themed token', () => {
    expect(colorValue(tokens, 'bg', 'light')).toBe('#F7FAFD');
    expect(colorValue(tokens, 'bg', 'dark')).toBe('#0B1524');
  });

  it('resolves a token that points to another one, in each theme', () => {
    for (const theme of THEMES) expect(colorValue(tokens, 'ad-ground', theme)).toBe(colorValue(tokens, 'surface-sunken', theme));
  });

  it('rejects an unknown token and a circular reference', () => {
    expect(() => colorValue(tokens, 'nao-existe', 'light')).toThrow(/desconhecido/);
    const loop = { color: { tokens: [{ name: 'a', value: '{b}' }, { name: 'b', value: { light: '{a}', dark: '#000000' } }] } };
    expect(() => colorValue(loop, 'a', 'light')).toThrow(/circular/);
    expect(colorValue(loop, 'a', 'dark')).toBe('#000000');
  });
});

describe('contraste dos pares do site (claro e escuro)', () => {
  for (const pair of PAIRS) {
    it(`${label(pair)} (${pair.use}) passa de ${MIN_RATIO[pair.use]}:1`, () => {
      for (const theme of THEMES) {
        const ratio = ratioOf(pair, theme);
        expect(ratio, `${label(pair)} (${pair.use}) no tema ${theme}: ${formatRatio(ratio)}:1`).toBeGreaterThanOrEqual(MIN_RATIO[pair.use]);
      }
    });
  }

  it('has a text pair for every colour the CSS may use as text', () => {
    const covered = new Set(PAIRS.filter((pair) => pair.use === 'text').map((pair) => pair.fg));
    expect(TEXT_COLOR_TOKENS.filter((name) => !covered.has(name))).toEqual([]);
  });

  it('lists each pair once', () => {
    const keys = PAIRS.map((pair) => `${pair.fg}|${pair.bg}|${pair.use}`);
    expect(keys.filter((key, index) => keys.indexOf(key) !== index)).toEqual([]);
  });

  it('prints the table of pairs (par | uso | claro | escuro)', () => {
    const rows = PAIRS.map((pair) => `| ${label(pair)} | ${pair.use} | ${formatRatio(ratioOf(pair, 'light'))} | ${formatRatio(ratioOf(pair, 'dark'))} |`);
    console.log(['| par | uso | claro | escuro |', '| --- | --- | --- | --- |', ...rows].join('\n'));
    expect(rows).toHaveLength(PAIRS.length);
  });
});
