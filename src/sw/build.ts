// Builds /sw.js (F8, decision 6; DECISOES § 287). The three files of src/sw/ are TypeScript without types the
// browser would choke on; the build strips the types with the TypeScript compiler, drops the relative imports and the
// `export` keywords, and joins them in one function scope after SW_CONFIG: a classic script, so every browser that
// has service workers runs it, with no bundler chunk to share (the name never says "worker": DECISOES § 287).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type TypeScript from 'typescript';
import type { SwConfig, SwLang } from './logic.ts';

/** The files of the worker, in the order they are joined: each one only imports the ones before it. */
export const SW_FILES = ['shared.ts', 'logic.ts', 'main.ts'] as const;

const RELATIVE_IMPORT = /^import\s[^;]*?from\s+'\.\/[\w-]+\.ts';[ \t]*$/gm;
const EXPORT_KEYWORD = /^export\s+(?=(?:async\s+)?function\b|const\b|let\b|class\b)/gm;

/** Removes the relative imports and the `export` keywords of one transpiled file; anything else is refused. */
export function joinable(js: string, name: string): string {
  const out = js.replace(RELATIVE_IMPORT, '').replace(EXPORT_KEYWORD, '');
  if (/^\s*(?:import|export)\b/m.test(out)) throw new Error(`src/sw/${name}: import ou export que o build do /sw.js não sabe juntar`);
  return out.trim();
}

/** The text of /sw.js for a config. */
export async function swScript(config: SwConfig): Promise<string> {
  // require, not import(): the hook runs after Astro closed the Vite module runner that loaded the config.
  const ts = createRequire(import.meta.url)('typescript') as typeof TypeScript;
  const parts = SW_FILES.map((name) => {
    const source = readFileSync(new URL(`./${name}`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, removeComments: true },
      fileName: name,
    });
    return `// src/sw/${name}\n${joinable(outputText, name)}`;
  });
  return [
    '// /sw.js of fileorca.com, built by src/sw/build.ts from src/sw/. Do not edit.',
    '(() => {',
    "'use strict';",
    `const SW_CONFIG = ${JSON.stringify(config)};`,
    ...parts,
    '})();',
    '',
  ].join('\n');
}

/**
 * The files the offline page of a language needs, read from its built HTML and CSS: the /_astro/ stylesheets and
 * scripts it links, the font it preloads and the fonts of its stylesheets.
 */
export function offlineAssets(html: string, readAsset: (path: string) => string): string[] {
  const assets = new Set<string>();
  for (const match of html.matchAll(/(?:href|src)="(\/_astro\/[^"#?]+)"/g)) assets.add(match[1]!);
  for (const asset of [...assets]) {
    if (!asset.endsWith('.css')) continue;
    for (const font of readAsset(asset).matchAll(/url\((\/_astro\/[^)"'#?]+\.woff2)\)/g)) assets.add(font[1]!);
  }
  return [...assets].sort();
}

export type OfflinePages = Record<SwLang, { page: string; assets: string[] }>;
