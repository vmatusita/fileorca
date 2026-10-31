// Builds the Markdown table "ferramenta × fixture × navegador" of the report (docs/relatorios/fase-02-matriz.md)
// from the JSON records the matrix tests write while they run (test-results/matriz/*.json, one per test and
// browser, from tests/e2e/image-matrix.spec.ts and image-presets.spec.ts). Nothing in the table is written by
// hand: run the two specs in both browsers in ONE Playwright run (it clears test-results at its start), then
//
//   node scripts/fixtures/matrix-table.ts > docs/relatorios/fase-02-matriz.md
//
// The functions are exported so a Vitest can prove the layout (tests/unit/matrix-table.test.ts).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { MatrixRecord, PresetRecord, RecordFile } from '../../tests/e2e/lib/matrix.ts';

export const RECORDS_DIR = join('test-results', 'matriz');
const BROWSERS = ['chromium', 'webkit'] as const;
const BROWSER_NAME: Record<string, string> = { chromium: 'Chromium', webkit: 'WebKit' };

export interface Records {
  matrix: MatrixRecord[];
  presets: PresetRecord[];
}

export function readRecords(dir = RECORDS_DIR): Records {
  const records: Records = { matrix: [], presets: [] };
  if (!existsSync(dir)) return records;
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json')).sort()) {
    const data = JSON.parse(readFileSync(join(dir, file), 'utf8')) as MatrixRecord | PresetRecord;
    if (file.startsWith('preset-')) records.presets.push(data as PresetRecord);
    else records.matrix.push(data as MatrixRecord);
  }
  return records;
}

const FORMAT: Record<string, string> = { jpeg: 'JPG', png: 'PNG', webp: 'WebP', avif: 'AVIF', heic: 'HEIC' };
const format = (name: string): string => FORMAT[name] ?? name;
const number = (value: number, digits = 0): string => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 1.234.567 bytes as "1,2 MB"; below 1 KB as "512 B" (decimal units, as the presets count them). */
export function size(bytes: number): string {
  if (bytes >= 1_000_000) return `${number(bytes / 1_000_000, 1)} MB`;
  if (bytes >= 1_000) return `${number(bytes / 1_000, 0)} KB`;
  return `${number(bytes)} B`;
}

const seconds = (ms: number): string => number(ms / 1000, 1);

/** The notes the tests record, in the language of the report. */
export function note(text: string): string {
  return text
    .split(', ')
    .map((part) => {
      const orientation = /^orientation ok \(Δ([\d.]+)\)$/.exec(part);
      if (orientation) return `orientação ok (Δ${orientation[1]})`;
      const dims = /^(\d+) x (\d+) px on a (\d+) x (\d+) pt page$/.exec(part);
      if (dims) return `${dims[1]}×${dims[2]} px numa página de ${dims[3]}×${dims[4]} pt`;
      const reduced = /^reduced to (\d+) x (\d+) px$/.exec(part);
      if (reduced) return `reduzida para ${reduced[1]}×${reduced[2]} px`;
      const known: Record<string, string> = {
        'alpha kept': 'transparência mantida',
        'alpha kept (soft mask)': 'transparência mantida (máscara)',
        'flattened on white': 'transparência em branco',
        'first frame': 'primeiro quadro',
        'first frame is red': 'primeiro quadro (vermelho)',
        'animation kept': 'animação mantida',
        'quality only': 'só a qualidade',
        'transparency white': 'transparência em branco',
        'transparency white (said on the result)': 'transparência em branco (dito no resultado)',
        'already fits: own format, no metadata': 'já cabia: mesmo formato, sem metadados',
        '16:9 from the centre': '16:9 pelo centro',
      };
      return known[part] ?? part;
    })
    .filter(Boolean)
    .join('; ');
}

function cell(file: RecordFile | undefined): string {
  if (!file) return '—';
  if (file.status === 'refused') return `recusado (${file.reason ?? '?'})`;
  const out = file.output;
  if (!out) return 'ok';
  const parts = [`ok`, `${format(out.format)} ${out.width}×${out.height}`, size(out.bytes)];
  if (out.decoded === 'unsupported') parts.push('não abre neste navegador');
  else parts.push('abre');
  if (out.note) parts.push(note(out.note));
  return parts.join(' · ');
}

interface Row {
  fixture: string;
  options: string;
  byBrowser: Record<string, RecordFile | undefined>;
}

function rowsOf(records: MatrixRecord[]): Row[] {
  const rows = new Map<string, Row>();
  for (const record of records) {
    for (const file of record.files) {
      const key = `${record.options}\u0000${file.fixture}`;
      const row = rows.get(key) ?? { fixture: file.fixture, options: record.options, byBrowser: {} };
      row.byBrowser[record.browser] = file;
      rows.set(key, row);
    }
  }
  return [...rows.values()];
}

const escape = (text: string): string => text.replaceAll('|', '\\|');

function summary(records: MatrixRecord[]): string[] {
  const lines = ['| Teste | Ferramenta | Opções | Arquivos | Saídas | Recusados | Chromium | WebKit | Requisições para fora |', '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
  const ids = [...new Set(records.map((record) => record.id))];
  for (const id of ids) {
    const mine = records.filter((record) => record.id === id);
    const first = mine[0] as MatrixRecord;
    const done = first.files.filter((file) => file.status === 'ok').length;
    const time = (browser: string): string => {
      const found = mine.find((record) => record.browser === browser);
      return found ? `${seconds(found.ms)} s` : '—';
    };
    lines.push(`| \`${id}\` | \`${first.tool}\` | ${escape(first.options)} | ${first.files.length} | ${done} | ${first.files.length - done} | ${time('chromium')} | ${time('webkit')} | ${mine.reduce((sum, record) => sum + record.outside, 0)} |`);
  }
  return lines;
}

export function buildTable(records: Records): string {
  const out: string[] = [];
  const { matrix, presets } = records;
  out.push('# F2 · Matriz de fixtures', '');
  out.push(
    'Gerada por `node scripts/fixtures/matrix-table.ts` a partir de `test-results/matriz/*.json`, que `tests/e2e/image-matrix.spec.ts` e `tests/e2e/image-presets.spec.ts` gravam a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode as duas specs numa execução do Playwright (ela limpa o `test-results`) e o comando acima.',
    '',
  );
  out.push(
    'Cada ferramenta recebeu a página uma vez por navegador e um lote só com todas as fixtures que aceita (pelo formato real dos bytes) e, no meio dele, as que recusa. Cada saída foi lida do ZIP (ou do PDF) em Node: formato real, dimensões de exibição conforme o oráculo `fixtures/images/expected.json` e as opções, se abre no navegador (o AVIF só onde o navegador sabe abri-lo), orientação por pixels contra a imagem em pé montada dos pixels gravados, transparência e ausência de Exif, XMP, IPTC e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli, o link quando há e o evento `tool_error`. Nenhuma requisição saiu de `127.0.0.1` em nenhum teste.',
    '',
  );
  out.push('Legenda: `ok · formato largura×altura · tamanho · abre · notas`; `recusado (motivo)` é a fala da Oli na linha do arquivo; `—` é fixture que aquele lote não trouxe.', '');
  if (matrix.length === 0) out.push('_Nenhum registro encontrado em `test-results/matriz/`._', '');

  if (matrix.length > 0) {
    out.push('## Resumo por teste', '', ...summary(matrix), '');
    const avif = BROWSERS.map((browser) => {
      const found = matrix.find((record) => record.browser === browser && record.pdf === undefined);
      return `${BROWSER_NAME[browser]}: ${found ? (found.avifDecode ? 'abre AVIF sozinho' : 'não abre AVIF sozinho') : '—'}`;
    });
    out.push(`Decodificação nativa de AVIF nesta máquina: ${avif.join('; ')}. Onde o navegador não abre AVIF, a saída em AVIF foi conferida só nos bytes (cabeçalho, dimensões, plano alfa e metadados).`, '');
    const tools = [...new Set(matrix.map((record) => record.tool))];
    for (const tool of tools) {
      const mine = matrix.filter((record) => record.tool === tool);
      out.push(`## \`${tool}\``, '');
      const pdf = mine.find((record) => record.pdf);
      if (pdf?.pdf) out.push(`Um PDF com ${pdf.pdf.pages} páginas (${size(pdf.pdf.bytes)} em ${BROWSER_NAME[pdf.browser] ?? pdf.browser}), uma imagem por página, na ordem da fila; a página tem o tamanho da imagem.`, '');
      out.push('| Fixture | Opções | Chromium | WebKit |', '| --- | --- | --- | --- |');
      for (const row of rowsOf(mine)) {
        out.push(`| \`${row.fixture}\` | ${escape(row.options)} | ${escape(cell(row.byBrowser['chromium']))} | ${escape(cell(row.byBrowser['webkit']))} |`);
      }
      out.push('');
    }
  }

  if (presets.length > 0) {
    out.push('## Presets', '');
    out.push('Bytes de cada saída (o limite é o do preset). Cada célula: `bytes (largura×altura)`; a coluna Entrada é o arquivo que entrou.', '');
    const ids = [...new Set(presets.map((record) => record.id))];
    for (const id of ids) {
      const mine = presets.filter((record) => record.id === id);
      const first = mine[0] as PresetRecord;
      out.push(`### \`${first.path}\``, '', `Limite: ${number(first.limit)} bytes.`, '');
      out.push('| Fixture | Entrada | Chromium | WebKit | Notas |', '| --- | ---: | ---: | ---: | --- |');
      for (const file of first.files) {
        const of = (browser: string): string => {
          const found = mine.find((record) => record.browser === browser)?.files.find((candidate) => candidate.fixture === file.fixture);
          return found ? `${number(found.bytes)} ${format(found.format)} (${found.width}×${found.height})` : '—';
        };
        out.push(`| \`${file.fixture}\` | ${number(file.input)} | ${of('chromium')} | ${of('webkit')} | ${escape(note(file.note))} |`);
      }
      out.push('');
    }
  }
  return `${out.join('\n').trimEnd()}\n`;
}

const invoked = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) {
  const records = readRecords();
  if (records.matrix.length === 0 && records.presets.length === 0) {
    console.error(`matrix-table: nenhum registro em ${RECORDS_DIR}. Rode tests/e2e/image-matrix.spec.ts e image-presets.spec.ts primeiro.`);
    process.exit(1);
  }
  process.stdout.write(buildTable(records));
}
