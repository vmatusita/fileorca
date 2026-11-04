// Every prefers-color-scheme rule of the site's CSS has its pair with data-theme (F11, decision 2; DECISOES § 386). The
// person picks System, Light or Dark in the header: System puts no data-theme and the media query decides, while Light and
// Dark put data-theme on <html>. So a rule inside @media (prefers-color-scheme: dark) must:
// - skip a page forced to light: each selector carries :not([data-theme="light"]) (the guard);
// - have its twin for a page forced to dark: the same declarations under [data-theme="dark"] (on the same element, or on
//   <html>/:root when the rule targets the root), outside any colour-scheme media query;
// - have a light value for each property it sets, under the same element (or [data-theme="light"]), so the page forced to
//   light on a dark system gets the colours of the light page.
// The same, mirrored, for a prefers-color-scheme: light rule. The files read are every CSS file of src/styles/ and
// docs/design/tokens.css (the variables the site imports). The tests/unit/theme.test.ts of the Tailwind theme is another test.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface StyleRule {
  selectors: string[];
  declarations: Map<string, string>;
  /** The colour scheme of the @media this rule sits in, if any. */
  scheme: 'dark' | 'light' | null;
  /** The preludes of the @media blocks around the rule, outermost first (review F11 C-1). */
  media: string[];
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalizeSelector = (selector: string) => selector.trim().replace(/\s+/g, ' ').replace(/\[\s*data-theme\s*=\s*"?([a-z]+)"?\s*\]/g, '[data-theme="$1"]');

function declarationsOf(body: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of body.split(';')) {
    const colon = part.indexOf(':');
    if (colon < 0) continue;
    const property = part.slice(0, colon).trim().toLowerCase();
    if (property) map.set(property, part.slice(colon + 1).trim().replace(/\s+/g, ' '));
  }
  return map;
}

/** The end of the block that opens at `open` (the index of its "{"). */
function blockEnd(css: string, open: number): number {
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    else if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error('unbalanced braces');
}

/** Every style rule of a stylesheet, at any depth of @media, @supports and @layer, with the colour scheme it depends on. */
export function styleRules(source: string, scheme: StyleRule['scheme'] = null, media: string[] = []): StyleRule[] {
  const css = stripComments(source);
  const rules: StyleRule[] = [];
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf('{', index);
    const semicolon = css.indexOf(';', index);
    if (open < 0) break;
    // A statement at-rule (@import, @layer a, b;) before the next block.
    if (semicolon >= 0 && semicolon < open && css.slice(index, semicolon).trim().startsWith('@')) {
      index = semicolon + 1;
      continue;
    }
    const prelude = css.slice(index, open).trim();
    const close = blockEnd(css, open);
    const body = css.slice(open + 1, close);
    if (prelude.startsWith('@')) {
      const match = /prefers-color-scheme\s*:\s*(dark|light)/.exec(prelude);
      if (/^@(media|supports|layer|container)\b/.test(prelude)) {
        rules.push(...styleRules(body, match ? (match[1] as 'dark' | 'light') : scheme, prelude.startsWith('@media') ? [...media, prelude.replace(/\s+/g, ' ')] : media));
      }
      // @font-face, @keyframes and the like hold no selector of the theme.
    } else if (prelude) {
      rules.push({ selectors: prelude.split(',').map(normalizeSelector), declarations: declarationsOf(body), scheme, media });
    }
    index = close + 1;
  }
  return rules;
}

const guardOf = (scheme: 'dark' | 'light') => `:not([data-theme="${scheme === 'dark' ? 'light' : 'dark'}"])`;

/** What is wrong with the colour-scheme rules of a stylesheet: [] when every one has its guard, its twin and its other side. */
export function themePairProblems(css: string, file = 'css'): string[] {
  const rules = styleRules(css);
  const plain = rules.filter((rule) => rule.scheme === null);
  const problems: string[] = [];
  for (const rule of rules.filter((candidate) => candidate.scheme !== null)) {
    const scheme = rule.scheme as 'dark' | 'light';
    const other = scheme === 'dark' ? 'light' : 'dark';
    for (const selector of rule.selectors) {
      const guard = guardOf(scheme);
      if (!selector.includes(guard)) {
        problems.push(`${file}: "${selector}" em prefers-color-scheme: ${scheme} sem a guarda ${guard} (a página forçada em ${other} pegaria este valor)`);
        continue;
      }
      const base = selector.replace(guard, '').trim() || ':root';
      const root = base === ':root' || base === 'html';
      const twins = new Set([`${base}[data-theme="${scheme}"]`, ...(root ? [`[data-theme="${scheme}"]`, `html[data-theme="${scheme}"]`, `:root[data-theme="${scheme}"]`] : [])]);
      const twin = plain.filter((candidate) => candidate.selectors.some((s) => twins.has(s)));
      for (const [property, value] of rule.declarations) {
        if (!twin.some((candidate) => candidate.declarations.get(property) === value)) {
          problems.push(`${file}: "${selector}" tem ${property}: ${value} em prefers-color-scheme: ${scheme}, sem o par em [data-theme="${scheme}"]`);
        }
      }
      const sides = new Set([base, `${base}[data-theme="${other}"]`, ...(root ? [`[data-theme="${other}"]`, `html[data-theme="${other}"]`, `:root[data-theme="${other}"]`, ':root', 'html'] : [])]);
      const otherSide = plain.filter((candidate) => candidate.selectors.some((s) => sides.has(s)));
      for (const property of rule.declarations.keys()) {
        if (!otherSide.some((candidate) => candidate.declarations.has(property))) {
          problems.push(`${file}: "${selector}" tem ${property} em prefers-color-scheme: ${scheme}, sem o valor ${other} fora da media query`);
        }
      }
    }
  }
  return problems;
}

/** A declaration that paints: a variable of the theme, the color-scheme of the page or a colour of its own. */
const PAINTS = (property: string) => property.startsWith('--') || ['color-scheme', 'color', 'background', 'background-color'].includes(property);
const ON_SCREEN = /^@media (only )?screen\b|^@media not print\b/;

/**
 * The dark rules that would reach paper (review F11 C-1; DECISOES § 404): a rule in prefers-color-scheme: dark, or under
 * [data-theme="dark"], that sets a colour must sit in @media screen. Paper is white and the browser prints no background
 * by default, so the dark theme on paper is pale text on white; the print is always the light theme.
 */
export function darkOnPaperProblems(css: string, file = 'css'): string[] {
  return styleRules(css)
    .filter((rule) => rule.scheme === 'dark' || rule.selectors.some((selector) => selector.includes('[data-theme="dark"]')))
    .filter((rule) => [...rule.declarations.keys()].some(PAINTS))
    .filter((rule) => !rule.media.some((prelude) => ON_SCREEN.test(prelude)))
    .map((rule) => `${file}: "${rule.selectors.join(', ')}" pinta o tema escuro fora de @media screen (a impressão sairia com o texto claro no papel branco)`);
}

const FILES = [
  ...readdirSync('src/styles').filter((file) => file.endsWith('.css')).map((file) => `src/styles/${file}`),
  'docs/design/tokens.css',
];

describe('o par prefers-color-scheme e data-theme no CSS do site', () => {
  it('reads every CSS file of src/styles and the tokens, and finds the colour-scheme rules of global.css and tokens.css', () => {
    expect(FILES).toContain('src/styles/global.css');
    expect(FILES).toContain('src/styles/components.css');
    // The two files that switch the theme today: the color-scheme of <html> and the 28 colour variables.
    const schemed = (file: string) => styleRules(readFileSync(file, 'utf8')).filter((rule) => rule.scheme !== null);
    expect(schemed('src/styles/global.css').length).toBeGreaterThan(0);
    expect(schemed('docs/design/tokens.css').length).toBeGreaterThan(0);
    expect(schemed('docs/design/tokens.css').flatMap((rule) => [...rule.declarations.keys()]).length).toBeGreaterThanOrEqual(20);
  });

  it('gives every prefers-color-scheme rule its guard, its data-theme twin and its other side, in every file', () => {
    for (const file of FILES) expect(themePairProblems(readFileSync(file, 'utf8'), file), file).toEqual([]);
  });

  it('reports a rule without the guard, without the twin, with a twin of another value and without the other side (negative controls)', () => {
    const good = `html { color-scheme: light; }
      html[data-theme="dark"] { color-scheme: dark; }
      @media (prefers-color-scheme: dark) { html:not([data-theme="light"]) { color-scheme: dark; } }
      :root, [data-theme="light"] { --bg: #fff; --ink: #000; }
      [data-theme="dark"] { --bg: #000; --ink: #fff; }
      @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #000; --ink: #fff; } }`;
    expect(themePairProblems(good)).toEqual([]);
    // The page forced to light on a dark system would take the dark value.
    expect(themePairProblems(good.replace('html:not([data-theme="light"])', 'html')).join('\n')).toMatch(/sem a guarda/);
    // The page forced to dark on a light system would stay light.
    expect(themePairProblems(good.replace('html[data-theme="dark"] { color-scheme: dark; }', '')).join('\n')).toMatch(/color-scheme: dark em prefers-color-scheme: dark, sem o par/);
    expect(themePairProblems(good.replace('[data-theme="dark"] { --bg: #000;', '[data-theme="dark"] { --bg: #111;')).join('\n')).toMatch(/--bg: #000 .* sem o par/);
    // A dark value with no light one: a page forced to light on a dark system would keep the browser default.
    expect(themePairProblems(`${good} [data-theme="dark"] { --line: #333; } @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --line: #333; } }`).join('\n')).toMatch(/--line .* sem o valor light/);
    // The light mirror is held to the same rule.
    expect(themePairProblems(`.x { color: red; } @media (prefers-color-scheme: light) { .x:not([data-theme="dark"]) { color: blue; } }`).join('\n')).toMatch(/sem o par em \[data-theme="light"\]/);
    expect(themePairProblems(`.x { color: red; } .x[data-theme="light"] { color: blue; } @media (prefers-color-scheme: light) { .x:not([data-theme="dark"]) { color: blue; } }`)).toEqual([]);
  });

  it('reads rules inside @layer and @supports, and skips @font-face and @keyframes', () => {
    const css = `@import "x.css"; @layer base { @supports (color: red) { @media (prefers-color-scheme: dark) { .y { color: red; } } } }
      @font-face { font-family: X; src: url(x.woff2); } @keyframes k { to { opacity: 1; } }`;
    expect(styleRules(css).map((rule) => [rule.selectors, rule.scheme])).toEqual([[['.y'], 'dark']]);
    expect(themePairProblems(css).join('\n')).toMatch(/sem a guarda/);
  });
});

describe('o tema escuro só na tela: a impressão sai no tema claro (revisão F11 C-1)', () => {
  it('keeps every dark colour of the site CSS and the tokens in @media screen, and finds the dark rules of tokens.css and global.css', () => {
    for (const file of FILES) expect(darkOnPaperProblems(readFileSync(file, 'utf8'), file), file).toEqual([]);
    // The check reads the rules it guards: the 28 dark variables twice (System and Dark) and the color-scheme of <html>.
    const dark = (file: string) => styleRules(readFileSync(file, 'utf8')).filter((rule) => rule.scheme === 'dark' || rule.selectors.some((selector) => selector.includes('[data-theme="dark"]')));
    expect(dark('docs/design/tokens.css').filter((rule) => rule.media.some((prelude) => ON_SCREEN.test(prelude))).length).toBeGreaterThanOrEqual(2);
    expect(dark('src/styles/global.css').filter((rule) => rule.media.some((prelude) => ON_SCREEN.test(prelude))).length).toBeGreaterThanOrEqual(2);
  });

  it('reports a dark rule that reaches paper, and leaves alone the light theme and a dark rule that paints nothing (negative controls)', () => {
    const screen = `:root, [data-theme="light"] { --ink: #000; }
      @media screen { [data-theme="dark"] { --ink: #fff; } }
      @media screen and (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink: #fff; } }
      html[data-theme="dark"] .x { display: inline-flex; }`;
    expect(darkOnPaperProblems(screen)).toEqual([]);
    expect(darkOnPaperProblems(screen.replace('@media screen { [data-theme="dark"] { --ink: #fff; } }', '[data-theme="dark"] { --ink: #fff; }')).join('\n')).toMatch(/"\[data-theme="dark"\]" pinta o tema escuro/);
    expect(darkOnPaperProblems(screen.replace('@media screen and (prefers-color-scheme: dark)', '@media (prefers-color-scheme: dark)')).join('\n')).toMatch(/:root:not\(\[data-theme="light"\]\)" pinta o tema escuro/);
    expect(darkOnPaperProblems('@media not print { html[data-theme="dark"] { color-scheme: dark; } }')).toEqual([]);
    expect(darkOnPaperProblems('html[data-theme="dark"] { color-scheme: dark; }')).toHaveLength(1);
  });
});
