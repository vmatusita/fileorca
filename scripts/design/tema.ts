// Writes src/styles/theme.css from docs/design/tokens.json (pnpm design:gerar; DECISOES § 41).
import { readFileSync, writeFileSync } from 'node:fs';
import { renderTheme } from '../lib/theme.ts';

const SOURCE = 'docs/design/tokens.json';
const TARGET = 'src/styles/theme.css';

const css = renderTheme(JSON.parse(readFileSync(SOURCE, 'utf8')));
writeFileSync(TARGET, css, 'utf8');
console.log(`tema: ${TARGET} gerado de ${SOURCE} (${css.split('\n').length - 1} linhas)`);
