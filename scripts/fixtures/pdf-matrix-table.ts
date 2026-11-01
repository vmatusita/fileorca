// Builds the Markdown table "ferramenta × fixture × navegador" of the PDF tools (docs/relatorios/fase-05a-matriz.md) from
// the JSON records the matrix tests write while they run (test-results/matriz-pdf/*.json, one per test and browser, from
// tests/e2e/pdf-matrix.spec.ts through recordMatrix in tests/e2e/lib/pdf-tools.ts). Nothing in the table is written by
// hand: run the spec in both browsers in ONE Playwright run (it clears test-results at its start), then
//
//   node scripts/fixtures/pdf-matrix-table.ts > docs/relatorios/fase-05a-matriz.md
//
// The functions are exported so a Vitest can prove the layout (tests/unit/pdf-matrix-table.test.ts). Modelled on
// scripts/fixtures/matrix-table.ts of the image tools (DECISOES § 80). The table opens with the coverage of criterion 3
// (every way of running a tool against every fixture it takes, "ok" in both browsers), and the script exits with 1 when
// a combination is missing or failed; the Vitest reads the committed table back and fails on the same (DECISOES § 175).
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
/** A fixture whose check failed in that test (recordEach in the spec): the row says what broke. */
const isFailure = (row: MatrixRow): boolean => row.result.startsWith('failed');
const isOk = (row: MatrixRow): boolean => row.result.startsWith('ok');
const browserName = (browser: string): string => BROWSER_NAME[browser] ?? browser;

// ---- coverage (decision 12, criterion 3; DECISOES § 175) -------------------------------------------------------

/** The oracle of the PDF fixtures, for what each tool takes. */
export const ORACLE_FILE = join('fixtures', 'pdf', 'expected.json');

export function readOracle(file = ORACLE_FILE): Record<string, { expect: string }> {
  return (JSON.parse(readFileSync(file, 'utf8')) as { files: Record<string, { expect: string }> }).files;
}

/**
 * The fixtures each way of running a tool takes, which the matrix must show as "ok" in both browsers: every readable
 * fixture (the oracle's `ok` and `repaired`) for every tool and for each mode of Compress; the three locked ones for
 * Unlock PDF, which refuses the others; and the owner-restricted one too for PDF to JPG, which draws it.
 */
export function acceptedFixtures(oracle: Record<string, { expect: string }>): Record<string, string[]> {
  const names = Object.keys(oracle).sort();
  const of = (...kinds: string[]) => names.filter((name) => kinds.includes(oracle[name]?.expect ?? ''));
  const readable = of('ok', 'repaired');
  const accepts: Record<string, string[]> = {};
  for (const tool of PDF_TOOL_IDS) accepts[tool] = tool === 'unlock-pdf' ? of('needs-password', 'restricted') : tool === 'pdf-to-jpg' ? of('ok', 'repaired', 'restricted') : readable;
  accepts['compress-pdf (lossless)'] = readable;
  accepts['compress-pdf (strong)'] = readable;
  return accepts;
}

export interface Coverage {
  tool: string;
  wanted: number;
  /** Fixtures with an "ok" line and no "failed" line in both browsers. */
  covered: number;
  /** "fixture (WebKit: no ok line)", "fixture (Chromium: failed)". */
  missing: string[];
}

export function coverageOf(records: readonly MatrixRow[], accepts: Record<string, readonly string[]>): Coverage[] {
  return Object.entries(accepts)
    .sort(([a], [b]) => toolRank(a) - toolRank(b) || a.localeCompare(b))
    .map(([tool, fixtures]) => {
      const missing: string[] = [];
      for (const fixture of fixtures) {
        const why = BROWSERS.flatMap((browser) => {
          const rows = records.filter((row) => row.tool === tool && row.fixture === fixture && row.browser === browser);
          if (rows.some(isFailure)) return [`${browserName(browser)}: failed`];
          return rows.some(isOk) ? [] : [`${browserName(browser)}: no ok line`];
        });
        if (why.length > 0) missing.push(`${fixture} (${why.join(', ')})`);
      }
      return { tool, wanted: fixtures.length, covered: fixtures.length - missing.length, missing };
    });
}

/** Every tool and fixture the matrix still owes, one line each; empty when criterion 3 holds. */
export function coverageGaps(records: readonly MatrixRow[], accepts: Record<string, readonly string[]>): string[] {
  return coverageOf(records, accepts).flatMap((item) => item.missing.map((what) => `${item.tool}: ${what}`));
}

/** The rows of the per-tool sections of a table buildTable wrote, read back (a cell holds the results of one test). */
export function readTable(markdown: string): MatrixRecord[] {
  const records: MatrixRecord[] = [];
  let tool: string | null = null;
  for (const line of markdown.split('\n')) {
    const heading = /^## (.+)$/.exec(line);
    if (heading) {
      tool = /^`([^`]+)`$/.exec(heading[1] ?? '')?.[1] ?? null;
      continue;
    }
    if (!tool || !line.startsWith('| `')) continue;
    const cells = line.slice(1, -1).split(/(?<!\\)\|/).map((cell) => cell.trim().replaceAll('\\|', '|'));
    const fixture = /^`(.+)`$/.exec(cells[0] ?? '')?.[1];
    const test = /^`(.+)`$/.exec(cells[1] ?? '')?.[1];
    if (!fixture || !test) continue;
    BROWSERS.forEach((browser, i) => {
      const result = cells[2 + i] ?? '—';
      if (result !== '—') records.push({ tool: tool as string, fixture, test, browser, result });
    });
  }
  return records;
}

function coverageSection(records: readonly MatrixRow[], accepts: Record<string, readonly string[]>): string[] {
  const lines = ['| Ferramenta | Fixtures que aceita | Com linha ok nos dois navegadores | Faltam |', '| --- | ---: | ---: | --- |'];
  for (const item of coverageOf(records, accepts)) lines.push(`| \`${item.tool}\` | ${item.wanted} | ${item.covered} | ${item.missing.length ? escape(item.missing.join('; ')) : '—'} |`);
  return lines;
}

/** `compress-pdf (strong)` is a way of running `compress-pdf`: the section follows the order of the registry. */
const baseTool = (tool: string): string => tool.replace(/ \(.*\)$/, '');
function toolRank(tool: string): number {
  const rank = (PDF_TOOL_IDS as readonly string[]).indexOf(baseTool(tool));
  return rank < 0 ? PDF_TOOL_IDS.length : rank;
}

function counts(rows: MatrixRecord[]): string {
  if (rows.length === 0) return '—';
  const refused = rows.filter(isRefusal).length;
  const failed = rows.filter(isFailure).length;
  return `${rows.length - refused - failed} ok · ${refused} recusadas${failed ? ` · ${failed} falharam` : ''}`;
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

export function buildTable(records: MatrixRecord[], accepts: Record<string, readonly string[]> = acceptedFixtures(readOracle())): string {
  const out: string[] = [];
  out.push('# F5a · Matriz de fixtures dos PDFs', '');
  out.push(
    'Gerada por `node scripts/fixtures/pdf-matrix-table.ts` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode a spec nos dois navegadores numa execução só do Playwright (ela limpa o `test-results`) e o comando acima.',
    '',
  );
  out.push(
    'Cada caso abriu a página da ferramenta uma vez por navegador. As ferramentas de lote receberam as fixtures pequenas num lote só, com as que recusam no meio dele (vazio, cortado, imagem ou texto com nome `.pdf`, e os PDFs com senha onde a ferramenta não os abre); as de um arquivo por vez receberam as fixtures uma depois da outra, com "Start over" entre elas. Cada arquivo grande (as 300 páginas, as 117 páginas e o escaneado de 150 páginas da NASA) tem um caso próprio em cada ferramenta (DECISOES § 175). Cada saída foi baixada e lida em Node por leitores que não são o motor: a estrutura estrita do arquivo, o `qpdf --check` (sem aviso novo), o PDF.js (cada página e a lista de operadores dela) e a conta da ferramenta contra o oráculo `fixtures/pdf/expected.json`: contagem e ordem das páginas pelos marcadores (ou, nas fixtures sem marcador, pelo tamanho, giro, imagens e primeiras palavras que o PDF.js lê da fixture), `/Rotate`, texto do número e da marca d\'água, imagem da assinatura em cada página, ausência de `/Encrypt` depois da Unlock, R6 com AESv3 depois da Protect, dimensões das imagens da PDF to JPG pela resolução (com 1 px de folga) e ausência de Exif e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli.',
    '',
  );
  out.push('Legenda: `ok: o que foi conferido`, `refused: a fala da linha do arquivo` e `failed: a primeira linha do erro` (uma saída que não passou); `—` é uma linha que aquele navegador não gravou.', '');
  if (records.length === 0) {
    out.push('_Nenhum registro encontrado em `test-results/matriz-pdf/`._', '');
    return `${out.join('\n').trimEnd()}\n`;
  }

  const refused = records.filter(isRefusal).length;
  const failed = records.filter(isFailure).length;
  const per = (browser: string): number => records.filter((record) => record.browser === browser).length;
  out.push(
    `Ao todo, ${records.length} linhas: ${records.length - refused - failed} conferidas e ${refused} recusas${failed ? `, e ${failed} falharam` : ''} (${BROWSERS.map((browser) => `${browserName(browser)} ${per(browser)}`).join(', ')}).`,
    '',
  );
  out.push('## Cobertura', '', 'Cada forma de rodar uma ferramenta contra as fixtures que ela aceita (as legíveis do oráculo; na Unlock PDF, as três com senha ou restrição; na PDF to JPG, também a só com restrição de dono), com uma linha `ok` nos dois navegadores e nenhuma `failed`.', '', ...coverageSection(records, accepts), '');
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
  const gaps = coverageGaps(records, acceptedFixtures(readOracle()));
  if (gaps.length > 0) {
    console.error(`pdf-matrix-table: a matriz ainda não cobre ${gaps.length} combinação(ões) de ferramenta e fixture (critério 3):\n  ${gaps.join('\n  ')}`);
    process.exit(1);
  }
}
