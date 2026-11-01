// Builds the Markdown table "ferramenta × fixture × navegador" of the PDF tools (docs/relatorios/fase-05a-matriz.md) from
// the JSON records the matrix tests write while they run (test-results/matriz-pdf/*.json, one per test and browser, from
// tests/e2e/pdf-matrix.spec.ts through recordMatrix in tests/e2e/lib/pdf-tools.ts). Nothing in the table is written by
// hand: run the spec in both browsers in ONE Playwright run (it clears test-results at its start), then
//
//   node scripts/fixtures/pdf-matrix-table.ts > docs/relatorios/fase-05a-matriz.md
//
// The functions are exported so a Vitest can prove the layout (tests/unit/pdf-matrix-table.test.ts). Modelled on
// scripts/fixtures/matrix-table.ts of the image tools (DECISOES § 80).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import type { MatrixRow } from '../../tests/e2e/lib/pdf-tools.ts';

export const RECORDS_DIR = join('test-results', 'matriz-pdf');
const BROWSERS = ['chromium', 'webkit'] as const;
const BROWSER_NAME: Record<string, string> = { chromium: 'Chromium', webkit: 'WebKit' };

/** A row the spec recorded, with the id of the test that wrote it (the file name without the browser). */
export interface MatrixRecord extends MatrixRow {
  test: string;
}

/** `merge-small-chromium.json` is the test `merge-small` run in Chromium. */
export const testOf = (file: string): string => file.replace(/\.json$/, '').replace(/-(chromium|webkit)$/, '');

export function readRecords(dir = RECORDS_DIR): MatrixRecord[] {
  if (!existsSync(dir)) return [];
  const records: MatrixRecord[] = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json')).sort()) {
    const rows = JSON.parse(readFileSync(join(dir, file), 'utf8')) as MatrixRow[];
    for (const row of rows) records.push({ ...row, test: testOf(file) });
  }
  return records;
}

const escape = (text: string): string => text.replaceAll('|', '\\|');
const isRefusal = (row: MatrixRow): boolean => row.result.startsWith('refused');
const browserName = (browser: string): string => BROWSER_NAME[browser] ?? browser;

/** `compress-pdf (strong)` is a way of running `compress-pdf`: the section follows the order of the registry. */
const baseTool = (tool: string): string => tool.replace(/ \(.*\)$/, '');
function toolRank(tool: string): number {
  const rank = (PDF_TOOL_IDS as readonly string[]).indexOf(baseTool(tool));
  return rank < 0 ? PDF_TOOL_IDS.length : rank;
}

function counts(rows: MatrixRecord[]): string {
  if (rows.length === 0) return '—';
  const refused = rows.filter(isRefusal).length;
  return `${rows.length - refused} ok · ${refused} recusadas`;
}

function summary(records: MatrixRecord[]): string[] {
  const lines = ['| Caso | Ferramentas | Chromium | WebKit |', '| --- | --- | ---: | ---: |'];
  for (const test of [...new Set(records.map((record) => record.test))]) {
    const mine = records.filter((record) => record.test === test);
    const tools = [...new Set(mine.map((record) => record.tool))];
    lines.push(`| \`${test}\` | ${tools.map((tool) => `\`${tool}\``).join(', ')} | ${counts(mine.filter((record) => record.browser === 'chromium'))} | ${counts(mine.filter((record) => record.browser === 'webkit'))} |`);
  }
  return lines;
}

interface Line {
  fixture: string;
  test: string;
  byBrowser: { [browser: string]: string | undefined };
}

/** One line per fixture and test inside a tool, in the order the rows were recorded; a browser without a row gets a dash. */
function linesOf(rows: MatrixRecord[]): Line[] {
  const lines = new Map<string, Line>();
  for (const row of rows) {
    const key = `${row.test}\u0000${row.fixture}`;
    const line = lines.get(key) ?? { fixture: row.fixture, test: row.test, byBrowser: {} };
    const known = line.byBrowser[row.browser];
    line.byBrowser[row.browser] = known === undefined ? row.result : `${known}; ${row.result}`;
    lines.set(key, line);
  }
  return [...lines.values()];
}

export function buildTable(records: MatrixRecord[]): string {
  const out: string[] = [];
  out.push('# F5a · Matriz de fixtures dos PDFs', '');
  out.push(
    'Gerada por `node scripts/fixtures/pdf-matrix-table.ts` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode a spec nos dois navegadores numa execução só do Playwright (ela limpa o `test-results`) e o comando acima.',
    '',
  );
  out.push(
    'Cada ferramenta recebeu a página uma vez por navegador e um lote com as fixtures que aceita e, no meio dele, as que recusa (vazio, cortado, imagem ou texto com nome `.pdf`, e os PDFs com senha onde a ferramenta não os abre). Cada saída foi baixada e lida em Node por leitores que não são o motor: a estrutura estrita do arquivo, o `qpdf --check` (sem aviso novo), o PDF.js (cada página e a lista de operadores dela) e a conta da ferramenta contra o oráculo `fixtures/pdf/expected.json`: contagem e ordem das páginas pelos marcadores, `/Rotate`, texto do número e da marca d\'água, imagem da assinatura em cada página, ausência de `/Encrypt` depois da Unlock, R6 com AESv3 depois da Protect, dimensões das imagens da PDF to JPG pela resolução (com 1 px de folga) e ausência de Exif e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli.',
    '',
  );
  out.push('Legenda: `ok: o que foi conferido` e `refused: a fala da linha do arquivo`; `—` é uma linha que aquele navegador não gravou.', '');
  if (records.length === 0) {
    out.push('_Nenhum registro encontrado em `test-results/matriz-pdf/`._', '');
    return `${out.join('\n').trimEnd()}\n`;
  }

  const refused = records.filter(isRefusal).length;
  const per = (browser: string): number => records.filter((record) => record.browser === browser).length;
  out.push(
    `Ao todo, ${records.length} linhas: ${records.length - refused} conferidas e ${refused} recusas (${BROWSERS.map((browser) => `${browserName(browser)} ${per(browser)}`).join(', ')}).`,
    '',
  );
  out.push('## Resumo por caso', '', ...summary(records), '');

  const tools = [...new Set(records.map((record) => record.tool))].sort((a, b) => toolRank(a) - toolRank(b) || a.localeCompare(b));
  for (const tool of tools) {
    out.push(`## \`${tool}\``, '', '| Fixture | Caso | Chromium | WebKit |', '| --- | --- | --- | --- |');
    for (const line of linesOf(records.filter((record) => record.tool === tool))) {
      out.push(`| \`${line.fixture}\` | \`${line.test}\` | ${escape(line.byBrowser['chromium'] ?? '—')} | ${escape(line.byBrowser['webkit'] ?? '—')} |`);
    }
    out.push('');
  }
  return `${out.join('\n').trimEnd()}\n`;
}

const invoked = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) {
  const records = readRecords();
  if (records.length === 0) {
    console.error(`pdf-matrix-table: nenhum registro em ${RECORDS_DIR}. Rode tests/e2e/pdf-matrix.spec.ts primeiro, nos dois navegadores.`);
    process.exit(1);
  }
  process.stdout.write(buildTable(records));
}
