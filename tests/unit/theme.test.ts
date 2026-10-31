import { readFileSync } from 'node:fs';
import { compile } from 'tailwindcss';
import { describe, expect, it } from 'vitest';
import { THEME_HEADER, YELLOW_COLORS, YELLOW_SHADOWS, renderTheme, tokenNames } from '../../scripts/lib/theme.ts';

const tokens: unknown = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8'));
const committed = readFileSync('src/styles/theme.css', 'utf8').replace(/\r\n/g, '\n');
const names = new Set(tokenNames(tokens));

/** The `--x: value;` lines inside the @theme block, in order. */
function declarationsOf(css: string): { property: string; value: string }[] {
  const block = /@theme[^{]*\{([\s\S]*)\}/.exec(css)?.[1] ?? '';
  return [...block.matchAll(/^\s*(--[\w*-]+)\s*:\s*([^;]+);/gm)].map((match) => ({ property: match[1] ?? '', value: (match[2] ?? '').trim() }));
}

const mappings = declarationsOf(committed).filter((declaration) => declaration.property !== '--*');

describe('src/styles/theme.css', () => {
  it('equals what renderTheme makes of docs/design/tokens.json (run: node scripts/design/tema.ts)', () => {
    expect(committed, 'src/styles/theme.css está desatualizado: rode node scripts/design/tema.ts').toBe(renderTheme(tokens));
  });

  it('is a reference theme that clears the Tailwind defaults', () => {
    expect(committed).toContain('@theme reference inline {');
    expect(committed).toContain('--*: initial;');
    expect(committed.startsWith(THEME_HEADER)).toBe(true);
    expect(committed.endsWith('}\n')).toBe(true);
    expect(committed).not.toContain('\r');
  });

  it('has no plain or inline @theme block (a name that maps to itself would be a cycle)', () => {
    expect(committed).not.toMatch(/@theme\s*\{/);
    expect(committed).not.toMatch(/@theme\s+inline\b/);
    expect(committed.match(/@theme\b/g)).toHaveLength(1);
  });

  it('maps every name to var(--token) of a token of tokens.json and nothing else', () => {
    expect(mappings.length).toBeGreaterThan(50);
    for (const { property, value } of mappings) {
      const token = /^var\(--([\w-]+)\)$/.exec(value)?.[1];
      expect(token, `${property}: ${value}`).toBeDefined();
      expect(names.has(token ?? ''), `${property}: ${value} não é um token`).toBe(true);
      expect(property, property).toMatch(/^--(?:color|spacing|radius|shadow|font|ease)-[\w-]+$/);
    }
    expect(new Set(mappings.map((mapping) => mapping.property)).size).toBe(mappings.length);
  });

  it('keeps yellow out: no sun, on-sun, sun-edge or yellow lip is mapped', () => {
    const forbidden = [...YELLOW_COLORS, ...YELLOW_SHADOWS];
    expect(forbidden).toEqual(['sun', 'on-sun', 'sun-edge', 'shadow-lip-sun', 'shadow-lip-on-deep']);
    for (const { property, value } of mappings) {
      for (const name of forbidden) {
        expect(value, `${property} aponta o amarelo`).not.toBe(`var(--${name})`);
        expect(property, `${property} é amarelo`).not.toBe(`--color-${name}`);
        expect(property, `${property} é amarelo`).not.toBe(`--${name}`);
      }
    }
    // "surface-sunken" is not yellow: the word `sun` alone, as a whole name part, is.
    expect(committed).not.toMatch(/(?<![a-z])sun(?![a-z])/);
    expect(committed).not.toContain('lip-on-deep');
  });

  it('maps every token of the kinds Tailwind knows, except the yellow ones', () => {
    const colors = (tokens as { color: { tokens: { name: string }[] } }).color.tokens.map((token) => token.name);
    const all = [...names];
    const wanted = [
      ...colors.filter((name) => !YELLOW_COLORS.includes(name)).map((name) => `--color-${name}`),
      ...all.filter((name) => /^space-\d+$/.test(name)).map((name) => `--spacing-${name.slice('space-'.length)}`),
      ...all.filter((name) => name.startsWith('radius-')).map((name) => `--${name}`),
      ...all.filter((name) => name.startsWith('shadow-') && !YELLOW_SHADOWS.includes(name)).map((name) => `--${name}`),
      ...all.filter((name) => name.startsWith('font-')).map((name) => `--${name}`),
      ...all.filter((name) => name.startsWith('ease-')).map((name) => `--${name}`),
    ];
    expect(mappings.map((mapping) => mapping.property)).toEqual(wanted);
  });
});

describe('renderTheme', () => {
  const mini = {
    color: { tokens: [{ name: 'ink', value: '#000' }, { name: 'sun', value: '#fc0' }, { name: 'on-sun', value: '#000' }, { name: 'sun-edge', value: '#000' }, { name: 'ad-ground', value: '{ink}' }] },
    spacing: { tokens: [{ name: 'space-4', value: '16px' }] },
    radius: { tokens: [{ name: 'radius-xl', value: '24px' }] },
    shadow: { tokens: [{ name: 'shadow-lift', value: 'x' }, { name: 'shadow-lip-sun', value: 'x' }, { name: 'shadow-lip-on-deep', value: 'x' }] },
    stroke: { tokens: [{ name: 'stroke-2', value: '2px' }] },
    size: { tokens: [{ name: 'tap-min', value: '48px' }] },
    duration: { tokens: [{ name: 'dur-quick', value: '160ms' }] },
    easing: { tokens: [{ name: 'ease-out', value: 'ease' }, { name: 'other', value: 'ease' }] },
    type: { families: { display: 'x', text: 'y' } },
  };

  it('writes the header, the reset and the mappings in order, with a trailing newline', () => {
    expect(renderTheme(mini)).toBe(
      [
        THEME_HEADER,
        '@theme reference inline {',
        '  --*: initial;',
        '  --color-ink: var(--ink);',
        '  --color-ad-ground: var(--ad-ground);',
        '  --spacing-4: var(--space-4);',
        '  --radius-xl: var(--radius-xl);',
        '  --shadow-lift: var(--shadow-lift);',
        '  --font-display: var(--font-display);',
        '  --font-text: var(--font-text);',
        '  --ease-out: var(--ease-out);',
        '}',
        '',
      ].join('\n'),
    );
  });

  it('lists every token name, including fonts, strokes, sizes and durations', () => {
    expect(tokenNames(mini)).toEqual(['ink', 'sun', 'on-sun', 'sun-edge', 'ad-ground', 'space-4', 'radius-xl', 'shadow-lift', 'shadow-lip-sun', 'shadow-lip-on-deep', 'stroke-2', 'tap-min', 'dur-quick', 'ease-out', 'other', 'font-display', 'font-text']);
    for (const name of ['bg', 'space-24', 'radius-pill', 'shadow-lip-on-deep', 'stroke-3', 'ad-clearance', 'dur-wave', 'ease-spring', 'font-display']) expect(names.has(name), name).toBe(true);
  });

  it('fails loudly on a tokens file with the wrong shape', () => {
    expect(() => renderTheme(null)).toThrow(/tokens\.json/);
    expect(() => renderTheme({})).toThrow(/color/);
    expect(() => renderTheme({ ...mini, spacing: { tokens: [{ name: 'gap-4', value: '1px' }] } })).toThrow(/space-/);
    expect(() => renderTheme({ ...mini, color: { tokens: [{ value: '#000' }] } })).toThrow(/sem nome/);
    expect(() => renderTheme({ ...mini, type: {} })).toThrow(/type\.families/);
  });
});

describe('o tema dentro do Tailwind', () => {
  async function build(candidates: string[]): Promise<string> {
    const compiler = await compile(`${committed}\n@tailwind utilities;`);
    return compiler.build(candidates);
  }

  it('makes utilities read the token variables directly, with no cycle and no :root variables', async () => {
    const css = await build(['text-ink', 'bg-surface-sunken', 'border-stroke', 'p-4', 'gap-6', 'rounded-xl', 'shadow-lift', 'font-display', 'ease-out']);
    for (const expected of ['color: var(--ink)', 'background-color: var(--surface-sunken)', 'border-color: var(--stroke)', 'padding: var(--space-4)', 'gap: var(--space-6)', 'border-radius: var(--radius-xl)', '--tw-shadow: var(--shadow-lift)', 'font-family: var(--font-display)', 'transition-timing-function: var(--ease-out)']) {
      expect(css, expected).toContain(expected);
    }
    expect(css).not.toMatch(/--color-|--radius-xl:|--spacing-/);
    expect(css).not.toMatch(/:root|:host/);
  });

  it('emits nothing for yellow, for the default palette, or for a size outside the tokens', async () => {
    const css = await build(['bg-sun', 'text-on-sun', 'border-sun-edge', 'shadow-lip-sun', 'shadow-lip-on-deep', 'bg-yellow-400', 'text-red-500', 'p-7', 'rounded-2xl', 'font-sans', 'shadow-md']);
    expect(css).not.toMatch(/\.(?:bg-sun|text-on-sun|border-sun-edge|shadow-lip-sun|shadow-lip-on-deep|bg-yellow-400|text-red-500|p-7|rounded-2xl|font-sans|shadow-md)\b/);
    expect(css).not.toMatch(/var\(--(?:sun|on-sun|sun-edge|shadow-lip-sun|shadow-lip-on-deep)\)/);
  });
});
