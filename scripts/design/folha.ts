// Writes docs/oli/folha.html, the Oli sheet, from the same sprite the site uses (F1b, decision 8).
// Run: node scripts/design/folha.ts   (a unit test fails when the committed sheet is out of date)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadSprite } from '../../src/oli/sprite.ts';
import { renderFolha, type FolhaInput } from '../lib/folha.ts';

export const FOLHA_PATH = 'docs/oli/folha.html';

interface TokenFile {
  color: { tokens: Array<{ name: string; value: string | { light: string; dark: string } }> };
}

function themed(tokens: TokenFile, name: string, theme: 'light' | 'dark'): string {
  const value = tokens.color.tokens.find((token) => token.name === name)?.value;
  if (typeof value !== 'object') throw new Error(`docs/design/tokens.json: token "${name}" não tem valores por tema`);
  return value[theme];
}

/** The real inputs of the sheet: the sprite, the app icon and the colors of the design tokens. */
export function folhaInput(root: string = process.cwd()): FolhaInput {
  const tokens = JSON.parse(readFileSync(join(root, 'docs/design/tokens.json'), 'utf8')) as TokenFile;
  return {
    sprite: loadSprite(root),
    appIconSvg: readFileSync(join(root, 'docs/design/assets/Logo/app-icon.svg'), 'utf8'),
    colors: {
      lightBg: themed(tokens, 'bg', 'light'),
      lightInk: themed(tokens, 'ink', 'light'),
      darkBg: themed(tokens, 'bg', 'dark'),
      darkInk: themed(tokens, 'ink', 'dark'),
      muted: themed(tokens, 'ink-muted', 'light'),
    },
  };
}

export function renderFolhaFile(root: string = process.cwd()): string {
  return renderFolha(folhaInput(root));
}

if (import.meta.main) {
  const target = join(process.cwd(), FOLHA_PATH);
  const html = renderFolhaFile();
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`folha: ${FOLHA_PATH} (${Buffer.byteLength(html, 'utf8')} B)`);
}
