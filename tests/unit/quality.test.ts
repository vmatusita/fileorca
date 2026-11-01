import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { browserPackages, buildPackages, isAllowedLicense, isForbiddenLicense } from '../../src/platform/licenses.ts';

function files(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path, pattern);
    return pattern.test(path) ? [path] : [];
  });
}

describe('licenças', () => {
  it('evaluates SPDX expressions against the allowed list', () => {
    for (const ok of ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC', '0BSD', 'MPL-2.0', 'OFL-1.1', 'MIT OR Apache-2.0', '(MIT AND ISC)']) expect(isAllowedLicense(ok), ok).toBe(true);
    for (const bad of ['GPL-3.0', 'AGPL-3.0-only', 'CC-BY-NC-4.0', 'BUSL-1.1', 'UNKNOWN', 'MIT AND CC-BY-3.0', 'LGPL-3.0']) expect(isAllowedLicense(bad), bad).toBe(false);
  });

  it('forbids copyleft and non-commercial licenses anywhere in the tree', () => {
    for (const bad of ['GPL-2.0', 'GPL-3.0-or-later', 'AGPL-3.0', 'SSPL-1.0', 'CC-BY-NC-SA-4.0', 'BUSL-1.1', 'PolyForm-Noncommercial-1.0.0']) expect(isForbiddenLicense(bad), bad).toBe(true);
    for (const ok of ['LGPL-3.0', 'MIT', 'BlueOak-1.0.0', 'CC0-1.0', 'CC-BY-4.0']) expect(isForbiddenLicense(ok), ok).toBe(false);
  });

  it('splits what reaches the browser from build tools', () => {
    // The two fonts (OFL-1.1) are a browser dependency of the F1b: their .woff2 files ship with the site.
    // The F2 adds the libraries of the image tools (jSquash codecs, libheif-js, @cantoo/pdf-lib, fflate).
    expect(browserPackages().map((pkg) => pkg.name)).toEqual([
      '@astrojs/preact', '@cantoo/pdf-lib', '@fontsource-variable/figtree', '@fontsource-variable/fredoka',
      '@jsquash/avif', '@jsquash/jpeg', '@jsquash/oxipng', '@jsquash/resize', '@jsquash/webp',
      'astro', 'comlink', 'fflate', 'libheif-js', 'preact', 'tailwindcss',
    ]);
    expect(buildPackages().map((pkg) => pkg.name)).toContain('satori');
    expect(buildPackages().map((pkg) => pkg.name)).not.toContain('preact');
  });
});

describe('motor de imagem autocontido (lint)', () => {
  it('reports an import that leaves src/engine/image/ and accepts packages and local files', async () => {
    const eslint = new ESLint();
    const [outside] = await eslint.lintText("import { LANGS } from '../../i18n/routes.ts';\nexport const x = LANGS;\n", { filePath: 'src/engine/image/probe.ts' });
    expect(outside?.messages.map((message) => message.ruleId)).toContain('fileorca/engine-self-contained');
    const [dynamic] = await eslint.lintText("export const load = () => import('../../platform/site.ts');\n", { filePath: 'src/engine/image/probe.ts' });
    expect(dynamic?.messages.map((message) => message.ruleId)).toContain('fileorca/engine-self-contained');
    const [inside] = await eslint.lintText("import { expose } from 'comlink';\nimport { recompress } from './recompress.ts';\nexpose({ recompress });\n", { filePath: 'src/engine/image/probe.ts' });
    expect(inside?.messages.filter((message) => message.ruleId === 'fileorca/engine-self-contained')).toEqual([]);
  }, 30_000);
});

describe('motor de dinheiro sem dependências (lint)', () => {
  const rule = 'fileorca/engine-self-contained';
  const ids = async (code: string) => {
    const [result] = await new ESLint().lintText(code, { filePath: 'src/calc/probe.ts' });
    return result?.messages.map((message) => message.ruleId) ?? [];
  };

  it('reports an import from outside src/calc/, a dynamic one and a package', async () => {
    expect(await ids("import { LANGS } from '../i18n/routes.ts';\nexport const x = LANGS;\n")).toContain(rule);
    expect(await ids("export const load = () => import('../platform/site.ts');\n")).toContain(rule);
    expect(await ids("export { fmt } from 'src/i18n/format.ts';\n")).toContain(rule);
    expect(await ids("import { wrap } from 'comlink';\nexport const w = wrap;\n")).toContain(rule);
  }, 30_000);

  it('accepts a file of the same folder', async () => {
    expect(await ids("import { interest } from './money.ts';\nexport const f = interest;\n")).not.toContain(rule);
  }, 30_000);
});

/**
 * The hex values that only the yellow family of tokens.css uses (#FFC93C and #B8870F today; the dark ink of the
 * yellow button's text and lip is shared with other tokens, so it is not yellow), as hex or rgb().
 */
const literalYellow = (() => {
  const declared = [...readFileSync('docs/design/tokens.css', 'utf8').matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1] ?? '', match[2] ?? ''] as const);
  const family = new Set(['sun', 'on-sun', 'sun-edge', 'shadow-lip-sun', 'shadow-lip-on-deep']);
  const hexes = (value: string) => (value.match(/#[0-9A-Fa-f]{6}\b/g) ?? []).map((hex) => hex.toUpperCase());
  const elsewhere = new Set(declared.filter(([name]) => !family.has(name)).flatMap(([, value]) => hexes(value)));
  const only = [...new Set(declared.filter(([name]) => family.has(name)).flatMap(([, value]) => hexes(value)))].filter((hex) => !elsewhere.has(hex));
  // rgb() with commas or with spaces (second pass p2-integridade-02).
  const rgb = (hex: string) => `rgba?\\(\\s*${parseInt(hex.slice(1, 3), 16)}[\\s,]+${parseInt(hex.slice(3, 5), 16)}[\\s,]+${parseInt(hex.slice(5, 7), 16)}\\b`;
  return new RegExp([...only, ...only.map(rgb)].join('|'), 'i');
})();

describe('cores só dos tokens', () => {
  it('uses no hex colour outside docs/design/tokens.css in styles, components and pages', () => {
    const tokens = new Set([...readFileSync('docs/design/tokens.css', 'utf8').matchAll(/#[0-9A-Fa-f]{3,8}\b/g)].map((match) => match[0].toUpperCase()));
    const offenders: string[] = [];
    for (const file of [...files('src', /\.(css|astro|tsx)$/), ...files('src/seo', /\.ts$/), ...files('src/pages', /\.ts$/)]) {
      for (const match of readFileSync(file, 'utf8').matchAll(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b(?![\w-])/g)) {
        if (!tokens.has(match[0].toUpperCase())) offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps sun (yellow) only on the Download button', () => {
    // Every stylesheet under src/styles and every <style> block of a component or page.
    const sheets = [
      ...files('src/styles', /\.css$/).map((file) => ({ file, css: readFileSync(file, 'utf8') })),
      ...files('src', /\.astro$/).flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((block) => ({ file, css: block[1] ?? '' }))),
    ];
    expect(sheets.length).toBeGreaterThan(0);
    // The whole yellow family: the fill, its text and edge, and the two yellow lips (tokens.json).
    const yellow = /var\(--(?:sun|on-sun|sun-edge|shadow-lip-sun|shadow-lip-on-deep)\)/;
    for (const { file, css } of sheets) {
      const rules = css.split('}').filter((rule) => yellow.test(rule) || literalYellow.test(rule));
      for (const rule of rules) expect(rule, file).toMatch(/fo-btn--download/);
    }
    // The yellow written as itself, not through a token, is the same yellow (review f-01, DECISOES § 102).
    expect(literalYellow.test('.fo-banner { background: #FFC93C }')).toBe(true);
    expect(literalYellow.test('.fo-banner { box-shadow: 0 4px 0 #b8870f }')).toBe(true);
    expect(literalYellow.test('.fo-banner { color: rgb(255, 201, 60) }')).toBe(true);
    expect(literalYellow.test('.fo-banner { color: rgb(255 201 60 / 40%) }')).toBe(true);
    expect(literalYellow.test('.fo-banner { background: var(--brand) }')).toBe(false);
    // The same yellow in an inline style of a component or a page (second pass p2-integridade-02).
    const inline = files('src', /\.(astro|tsx)$/).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/style=(?:"([^"]*)"|\{`([^`]*)`\}|\{\{([^}]*)\}\})/g)].map((match) => ({ file, css: match[1] ?? match[2] ?? match[3] ?? '' })),
    );
    expect(inline.length, 'inline styles were read').toBeGreaterThan(0);
    for (const { file, css } of inline) expect(literalYellow.test(css), `${file}: ${css}`).toBe(false);
  });
});
