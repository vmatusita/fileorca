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
    expect(browserPackages().map((pkg) => pkg.name)).toEqual(['@astrojs/preact', '@fontsource-variable/figtree', '@fontsource-variable/fredoka', 'astro', 'comlink', 'preact', 'tailwindcss']);
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
      const rules = css.split('}').filter((rule) => yellow.test(rule));
      for (const rule of rules) expect(rule, file).toMatch(/fo-btn--download/);
    }
  });
});
