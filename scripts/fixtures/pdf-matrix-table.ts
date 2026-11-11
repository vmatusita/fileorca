// Builds the Markdown table "ferramenta × fixture × navegador" of the PDF tools (docs/relatorios/fase-05a-matriz.md) from
// the JSON records the matrix tests write while they run (test-results/matriz-pdf/*.json, one per test and browser, from
// tests/e2e/pdf-matrix.spec.ts through recordMatrix in tests/e2e/lib/pdf-tools.ts). Nothing in the table is written by
// hand: run the spec in both browsers in ONE Playwright run (it clears test-results at its start), then
//
//   node scripts/fixtures/pdf-matrix-table.ts > docs/relatorios/fase-05a-matriz.md
//
// F18 (decision 15; DECISOES § 738): each run that adds PDF pages has a table of its own, named in MATRIX_TABLES with its
// file, its title and the tools it holds: `--table <name>` builds that one from the records of its tools only (run just
// their tests, with --grep, in both browsers in one run), and `--out <file>` writes it there instead of the standard
// output. The table of the F5a is history (its 12 tools) and is never built again; the F18 table holds Organize PDF and
// the two PDF presets:
//
//   node scripts/fixtures/pdf-matrix-table.ts --table fase-18 --out docs/relatorios/fase-18-matriz-pdf.md
//
// The functions are exported so a Vitest can prove the layout (tests/unit/pdf-matrix-table.test.ts). Modelled on
// scripts/fixtures/matrix-table.ts of the image tools (DECISOES § 80). The table opens with the coverage of criterion 3
// (every way of running a tool against every fixture it takes, "ok" in both browsers), and the script exits with 1 when
// a combination is missing or failed; the Vitest reads the committed tables back and fails on the same, for every tool
// and preset of the registry (DECISOES § 175 and § 738).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PDF_PRESET_IDS, PDF_TOOL_IDS, toolOf, type PdfPageId } from '../../src/tools/pdf/registry.ts';
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

/** Every PDF page the matrix runs: the tools in the order of the hub, then the presets (F18). */
export const MATRIX_PAGE_IDS: readonly PdfPageId[] = [...PDF_TOOL_IDS, ...PDF_PRESET_IDS];

/**
 * The fixtures each way of running a tool takes, which the matrix must show as "ok" in both browsers: every readable
 * fixture (the oracle's `ok` and `repaired`) for every tool and for each mode of Compress; the three locked ones for
 * Unlock PDF, which refuses the others; and the owner-restricted one too for PDF to JPG, which draws it. F18: a preset
 * takes what its parent takes (PDF to PNG draws the restricted one too), and `tools` narrows the list to the pages of one
 * table (the modes of Compress come with Compress).
 */
export function acceptedFixtures(oracle: Record<string, { expect: string }>, tools: readonly PdfPageId[] = MATRIX_PAGE_IDS): Record<string, string[]> {
  const names = Object.keys(oracle).sort();
  const of = (...kinds: string[]) => names.filter((name) => kinds.includes(oracle[name]?.expect ?? ''));
  const readable = of('ok', 'repaired');
  const accepts: Record<string, string[]> = {};
  for (const tool of tools) {
    const kind = toolOf(tool);
    accepts[tool] = kind === 'unlock-pdf' ? of('needs-password', 'restricted') : kind === 'pdf-to-jpg' ? of('ok', 'repaired', 'restricted') : readable;
  }
  if (tools.includes('compress-pdf')) {
    accepts['compress-pdf (lossless)'] = readable;
    accepts['compress-pdf (strong)'] = readable;
  }
  return accepts;
}

// ---- the tables (F18, decision 15; DECISOES § 738) ---------------------------------------------------------------

/** The title and the paragraphs above the coverage of a table, and the line that opens the coverage. */
export interface TableHeading {
  title: string;
  prose: readonly string[];
  coverage: string;
}

const LEGEND = 'Legenda: `ok: o que foi conferido`, `refused: a fala da linha do arquivo` e `failed: a primeira linha do erro` (uma saída que não passou); `—` é uma linha que aquele navegador não gravou.';

const F5A_HEADING: TableHeading = {
  title: '# F5a · Matriz de fixtures dos PDFs',
  prose: [
    'Gerada por `node scripts/fixtures/pdf-matrix-table.ts` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode a spec nos dois navegadores numa execução só do Playwright (ela limpa o `test-results`) e o comando acima.',
    'Cada caso abriu a página da ferramenta uma vez por navegador. As ferramentas de lote receberam as fixtures pequenas num lote só, com as que recusam no meio dele (vazio, cortado, imagem ou texto com nome `.pdf`, e os PDFs com senha onde a ferramenta não os abre); as de um arquivo por vez receberam as fixtures uma depois da outra, com "Start over" entre elas. Cada arquivo grande (as 300 páginas, as 117 páginas e o escaneado de 150 páginas da NASA) tem um caso próprio em cada ferramenta (DECISOES § 175). Cada saída foi baixada e lida em Node por leitores que não são o motor: a estrutura estrita do arquivo, o `qpdf --check` (sem aviso novo), o PDF.js (cada página e a lista de operadores dela) e a conta da ferramenta contra o oráculo `fixtures/pdf/expected.json`: contagem e ordem das páginas pelos marcadores (ou, nas fixtures sem marcador, pelo tamanho, giro, imagens e primeiras palavras que o PDF.js lê da fixture), `/Rotate`, texto do número e da marca d\'água, imagem da assinatura em cada página, ausência de `/Encrypt` depois da Unlock, R6 com AESv3 depois da Protect, dimensões das imagens da PDF to JPG pela resolução (com 1 px de folga) e ausência de Exif e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli.',
    LEGEND,
  ],
  coverage: 'Cada forma de rodar uma ferramenta contra as fixtures que ela aceita (as legíveis do oráculo; na Unlock PDF, as três com senha ou restrição; na PDF to JPG, também a só com restrição de dono), com uma linha `ok` nos dois navegadores e nenhuma `failed`.',
};

const F18_HEADING: TableHeading = {
  title: '# F18 · Matriz de fixtures dos PDFs: Organizar PDF e as presets de PDF',
  prose: [
    'Gerada por `node scripts/fixtures/pdf-matrix-table.ts --table fase-18 --out docs/relatorios/fase-18-matriz-pdf.md` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode só os casos destas páginas (`--grep "Organize PDF|Extract pages|PDF to PNG"`) nos dois navegadores, numa execução só do Playwright (ela limpa o `test-results`), e o comando acima. As 12 ferramentas da F5a estão em `docs/relatorios/fase-05a-matriz.md`, que é histórica e não se regera (DECISOES § 738).',
    'Cada página recebeu toda fixture que a ferramenta dela aceita, como na F5a (DECISOES § 175), e cada saída foi baixada e lida em Node por leitores que não são o motor, contra o oráculo `fixtures/pdf/expected.json`. O Organizar PDF, com o plano determinista da decisão 6, que move, gira e tira páginas: a contagem, a ordem pelo texto de cada página, o `/Rotate` final e o `qpdf --check`. A Extrair páginas do PDF, uma fixture depois da outra, com páginas digitadas fora de ordem e repetidas, e as recusas no meio (vazio, cortado, imagem e texto com nome `.pdf`, o PDF com senha e o só com restrição, com o link para a Unlock PDF): um PDF só, com as páginas marcadas uma vez cada, na ordem do arquivo, conferidas pela chave e pelas primeiras palavras de cada página, com o giro e os campos de formulário. A PDF para PNG, num lote com as recusas no meio, a 150 ppi sem tocar em nada, e as grandes a 300 ppi por intervalo: as páginas, as dimensões pela resolução (com 1 px de folga), o formato PNG pelos bytes, nenhum Exif e GPS, e o tamanho de cada fixture contra o JPG da PDF to JPG a 150 ppi (DECISOES § 729).',
    LEGEND,
  ],
  coverage: 'Cada página contra as fixtures que a ferramenta dela aceita (as legíveis do oráculo; na PDF para PNG, como na PDF to JPG, também a só com restrição de dono), com uma linha `ok` nos dois navegadores e nenhuma `failed`.',
};

/**
 * The tables of the matrix, one per run that added PDF pages (F18, DECISOES § 738): the committed file, its heading and
 * the pages it holds. Every tool and preset of the registry is in exactly one of them, and the Vitest reads each one back.
 */
export const MATRIX_TABLES = {
  'fase-05a': {
    file: 'docs/relatorios/fase-05a-matriz.md',
    heading: F5A_HEADING,
    tools: ['merge-pdf', 'split-pdf', 'pdf-to-jpg', 'compress-pdf', 'rotate-pdf', 'delete-pdf-pages', 'add-page-numbers-to-pdf', 'sign-pdf', 'protect-pdf', 'unlock-pdf', 'reorder-pdf-pages', 'watermark-pdf'],
  },
  'fase-18': {
    file: 'docs/relatorios/fase-18-matriz-pdf.md',
    heading: F18_HEADING,
    tools: ['organize-pdf', 'split-pdf-extract-pages', 'pdf-to-jpg-to-png'],
  },
} as const satisfies Record<string, { file: string; heading: TableHeading; tools: readonly PdfPageId[] }>;
export type MatrixTableId = keyof typeof MATRIX_TABLES;

/** The records of the pages of one table (a mode of Compress goes with Compress). */
export function recordsOf<T extends MatrixRow>(records: readonly T[], tools: readonly string[]): T[] {
  return records.filter((record) => tools.includes(baseTool(record.tool)));
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

/**
 * `compress-pdf (strong)` is a way of running `compress-pdf`: the section follows the order of the registry, the tools
 * and then the presets (F18).
 */
const baseTool = (tool: string): string => tool.replace(/ \(.*\)$/, '');
function toolRank(tool: string): number {
  const rank = (MATRIX_PAGE_IDS as readonly string[]).indexOf(baseTool(tool));
  return rank < 0 ? MATRIX_PAGE_IDS.length : rank;
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

export function buildTable(
  records: MatrixRecord[],
  accepts: Record<string, readonly string[]> = acceptedFixtures(readOracle(), MATRIX_TABLES['fase-05a'].tools),
  heading: TableHeading = F5A_HEADING,
): string {
  const out: string[] = [];
  out.push(heading.title, '');
  for (const paragraph of heading.prose) out.push(paragraph, '');
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
  out.push('## Cobertura', '', heading.coverage, '', ...coverageSection(records, accepts), '');
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

/**
 * F18 (DECISOES § 738): the table `id` built from the records of its pages only, and what it still owes. Records of other
 * pages (a full run of the spec) are left out, so the table of a run never grows with the tools of another.
 */
export function tableFor(id: MatrixTableId, records: readonly MatrixRecord[], oracle = readOracle()): { markdown: string; gaps: string[] } {
  const table = MATRIX_TABLES[id];
  const mine = recordsOf(records, table.tools);
  const accepts = acceptedFixtures(oracle, table.tools);
  return { markdown: buildTable(mine, accepts, table.heading), gaps: coverageGaps(mine, accepts) };
}

/** `--table <name>` and `--out <file>` of the command line (the F5a table on the standard output when left out). */
export function argsOf(argv: readonly string[]): { table: MatrixTableId; out: string | null } {
  const value = (flag: string): string | null => {
    const at = argv.indexOf(flag);
    return at < 0 ? null : (argv[at + 1] ?? '');
  };
  const table = value('--table') ?? 'fase-05a';
  if (!Object.hasOwn(MATRIX_TABLES, table)) throw new Error(`pdf-matrix-table: --table ${table} não existe; as tabelas são ${Object.keys(MATRIX_TABLES).join(', ')}`);
  const out = value('--out');
  if (out === '') throw new Error('pdf-matrix-table: --out pede o caminho do arquivo');
  return { table: table as MatrixTableId, out };
}

const invoked = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) {
  const { table, out } = argsOf(process.argv.slice(2));
  const records = readRecords();
  if (recordsOf(records, MATRIX_TABLES[table].tools).length === 0) {
    console.error(`pdf-matrix-table: nenhum registro das páginas da tabela ${table} em ${RECORDS_DIR}. Rode tests/e2e/pdf-matrix.spec.ts primeiro, nos dois navegadores.`);
    process.exit(1);
  }
  const { markdown, gaps } = tableFor(table, records);
  if (out) {
    writeFileSync(out, markdown);
    console.log(`pdf-matrix-table: ${out} (${table})`);
  } else process.stdout.write(markdown);
  if (gaps.length > 0) {
    console.error(`pdf-matrix-table: a matriz ainda não cobre ${gaps.length} combinação(ões) de ferramenta e fixture (critério 3):\n  ${gaps.join('\n  ')}`);
    process.exit(1);
  }
}
