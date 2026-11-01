// The table of the PDF fixture matrix is built from the records the matrix tests write: every cell comes from a
// record, nothing is typed in. This proves the layout on records made up here (the model is matrix-table.test.ts of the
// image tools), and that the real spec writes the shape the script reads.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { acceptedFixtures, buildTable, coverageGaps, readOracle, readRecords, readTable, testOf, type MatrixRecord } from '../../scripts/fixtures/pdf-matrix-table.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

const row = (test: string, tool: string, fixture: string, browser: string, result: string): MatrixRecord => ({ test, tool, fixture, browser, result });

const records: MatrixRecord[] = [
  row('sign', 'sign-pdf', 'gen-paginas-mistas.pdf', 'chromium', 'ok: the signature image on every page'),
  row('merge-small', 'merge-pdf', 'gen-cortado.pdf', 'chromium', 'refused: This file stops before its end.'),
  row('merge-small', 'merge-pdf', 'gen-fotos.pdf', 'chromium', 'ok: in the merged file, 4 pages in order'),
  row('merge-small', 'merge-pdf', 'gen-cortado.pdf', 'webkit', 'refused: This file stops before its end.'),
  row('merge-small', 'merge-pdf', 'gen-fotos.pdf', 'webkit', 'ok: in the merged file, 4 pages in order'),
  row('compress-lossless-strong', 'compress-pdf (strong)', 'gen-fotos.pdf', 'chromium', 'ok: pages as pictures, 2917866 → 354186 bytes'),
  row('compress-lossless-strong', 'compress-pdf (lossless)', 'gen-paginas-300.pdf', 'chromium', 'ok: 234441 → 144327 bytes'),
  row('compress-lossless-strong', 'compress-pdf (lossless)', 'gen-paginas-300.pdf', 'webkit', 'ok: 234441 → 144327 bytes'),
  row('rotate-batch', 'rotate-pdf', 'gen-paginas-mistas.pdf', 'chromium', 'ok: every /Rotate +90'),
  row('rotate-pages', 'rotate-pdf', 'gen-paginas-mistas.pdf', 'chromium', 'ok: page 1 +180, page 4 +90 | the rest as they were'),
];
const table = buildTable(records);

describe('testOf', () => {
  it('takes the browser off the name of the file', () => {
    expect(testOf('merge-small-chromium.json')).toBe('merge-small');
    expect(testOf('compress-lossless-strong-webkit.json')).toBe('compress-lossless-strong');
    expect(testOf('sign-firefox.json')).toBe('sign-firefox');
  });
});

describe('buildTable', () => {
  it('has a section per tool in the order of the registry, the ways of running Compress together and by name, whatever order the rows came in', () => {
    const tools = [...table.matchAll(/^## `([^`]+)`$/gm)].map((match) => match[1] as string);
    expect(tools).toEqual(['merge-pdf', 'compress-pdf (lossless)', 'compress-pdf (strong)', 'rotate-pdf', 'sign-pdf']);
    const registry = (tool: string) => PDF_TOOL_IDS.indexOf(tool.replace(/ \(.*\)$/, '') as (typeof PDF_TOOL_IDS)[number]);
    expect(tools.map(registry)).toEqual([...tools.map(registry)].sort((a, b) => a - b));
  });

  it('shows what each browser did in its own column, a refusal as the line it showed, and a missing browser as a dash', () => {
    expect(table).toContain('| `gen-fotos.pdf` | `merge-small` | ok: in the merged file, 4 pages in order | ok: in the merged file, 4 pages in order |');
    expect(table).toContain('| `gen-cortado.pdf` | `merge-small` | refused: This file stops before its end. | refused: This file stops before its end. |');
    expect(table).toContain('| `gen-fotos.pdf` | `compress-lossless-strong` | ok: pages as pictures, 2917866 → 354186 bytes | — |');
    expect(table).toContain('| `gen-paginas-mistas.pdf` | `sign` | ok: the signature image on every page | — |');
  });

  it('keeps two tests of one tool on one fixture as two lines, and escapes the bar of a cell', () => {
    expect(table).toContain('| `gen-paginas-mistas.pdf` | `rotate-batch` | ok: every /Rotate +90 | — |');
    expect(table).toContain('| `gen-paginas-mistas.pdf` | `rotate-pages` | ok: page 1 +180, page 4 +90 \\| the rest as they were | — |');
  });

  it('counts the lines of each test in each browser', () => {
    expect(table).toContain('| `merge-small` | `merge-pdf` | 1 ok · 1 recusadas | 1 ok · 1 recusadas |');
    expect(table).toContain('| `compress-lossless-strong` | `compress-pdf (strong)`, `compress-pdf (lossless)` | 2 ok · 0 recusadas | 1 ok · 0 recusadas |');
    expect(table).toContain('| `sign` | `sign-pdf` | 1 ok · 0 recusadas | — |');
    expect(table).toContain('Ao todo, 10 linhas: 8 conferidas e 2 recusas (Chromium 7, WebKit 3).');
  });

  it('is the same text for the same records, and says so when there is nothing to build from', () => {
    expect(buildTable(records)).toBe(table);
    expect(buildTable([])).toContain('Nenhum registro encontrado');
    expect(buildTable([])).not.toContain('## ');
  });
});

describe('readRecords', () => {
  it('reads the rows of every record file, with the test each one belongs to, in the order of the names', () => {
    const dir = mkdtempSync(join(tmpdir(), 'matriz-pdf-'));
    writeFileSync(join(dir, 'unlock-webkit.json'), JSON.stringify([{ tool: 'unlock-pdf', fixture: 'gen-cifrado-dono.pdf', browser: 'webkit', result: 'ok' }]));
    writeFileSync(join(dir, 'merge-small-chromium.json'), JSON.stringify([{ tool: 'merge-pdf', fixture: 'gen-fotos.pdf', browser: 'chromium', result: 'ok' }]));
    writeFileSync(join(dir, 'notes.txt'), 'not a record');
    expect(readRecords(dir).map((record) => [record.test, record.tool, record.browser])).toEqual([
      ['merge-small', 'merge-pdf', 'chromium'],
      ['unlock', 'unlock-pdf', 'webkit'],
    ]);
  });

  it('finds nothing in a folder that does not exist', () => {
    expect(readRecords(join(tmpdir(), 'no-such-matriz-pdf-folder'))).toEqual([]);
  });
});

// DECISOES § 175: criterion 3 ("a matriz fica verde nos dois navegadores, com toda ferramenta e toda fixture que ela
// aceita") read on the table the spec's records built, the way the adversarial review counted it.
describe('the coverage of the matrix (DECISOES § 175)', () => {
  const accepts = acceptedFixtures(readOracle());
  const READABLE = ['gen-acoes.pdf', 'gen-fotos.pdf', 'gen-ja-otimizado.pdf', 'gen-paginas-300.pdf', 'gen-paginas-mistas.pdf', 'gen-xref-estragada.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-escaneado-02-relatorio-nasa-150p.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'pdf-grande-fontes-embutidas-117p.pdf'];

  it('takes from the oracle what each way of running a tool accepts', () => {
    expect(Object.keys(accepts).sort()).toEqual([...PDF_TOOL_IDS, 'compress-pdf (lossless)', 'compress-pdf (strong)'].sort());
    for (const tool of [...PDF_TOOL_IDS.filter((id) => id !== 'unlock-pdf' && id !== 'pdf-to-jpg'), 'compress-pdf (lossless)', 'compress-pdf (strong)']) expect(accepts[tool], tool).toEqual(READABLE);
    expect(accepts['pdf-to-jpg']).toEqual([...READABLE, 'gen-cifrado-dono.pdf'].sort());
    expect(accepts['unlock-pdf']).toEqual(['gen-cifrado-aes256.pdf', 'gen-cifrado-dono.pdf', 'gen-cifrado-rc4-128.pdf']);
  });

  it('reads back the rows the table shows, by tool, fixture, test and browser', () => {
    const back = readTable(table);
    expect(back).toHaveLength(records.length);
    for (const record of records) expect(back, `${record.tool} ${record.fixture} ${record.browser}`).toContainEqual(record);
  });

  it('finds a fixture with no ok line in a browser, and a fixture whose output failed, and nothing when both browsers say ok', () => {
    const tiny = { 'sign-pdf': ['gen-acoes.pdf', 'gen-fotos.pdf'] };
    const ok = (fixture: string, browser: string) => row('sign-small', 'sign-pdf', fixture, browser, 'ok: the signature image on each of 2 pages');
    expect(coverageGaps([ok('gen-acoes.pdf', 'chromium'), ok('gen-acoes.pdf', 'webkit'), ok('gen-fotos.pdf', 'chromium'), ok('gen-fotos.pdf', 'webkit')], tiny)).toEqual([]);
    expect(coverageGaps([ok('gen-acoes.pdf', 'chromium'), ok('gen-acoes.pdf', 'webkit'), ok('gen-fotos.pdf', 'chromium')], tiny)).toEqual(['sign-pdf: gen-fotos.pdf (WebKit: no ok line)']);
    const failed = row('sign-small', 'sign-pdf', 'gen-fotos.pdf', 'webkit', 'failed: expect(received).toEqual(expected)');
    expect(coverageGaps([ok('gen-acoes.pdf', 'chromium'), ok('gen-acoes.pdf', 'webkit'), ok('gen-fotos.pdf', 'chromium'), ok('gen-fotos.pdf', 'webkit'), failed], tiny)).toEqual(['sign-pdf: gen-fotos.pdf (WebKit: failed)']);
    // A refusal is not coverage, and the table counts a failed line apart.
    expect(coverageGaps([row('t', 'sign-pdf', 'gen-acoes.pdf', 'chromium', 'refused: x'), ok('gen-acoes.pdf', 'webkit')], { 'sign-pdf': ['gen-acoes.pdf'] })).toEqual(['sign-pdf: gen-acoes.pdf (Chromium: no ok line)']);
    expect(buildTable([ok('gen-acoes.pdf', 'chromium'), failed], tiny)).toContain('| `sign-small` | `sign-pdf` | 1 ok · 0 recusadas | 0 ok · 0 recusadas · 1 falharam |');
  });

  it('holds on the committed table: every tool, every fixture it takes, both browsers, nothing failed', () => {
    const committed = readTable(readFileSync('docs/relatorios/fase-05a-matriz.md', 'utf8'));
    expect(committed.length).toBeGreaterThan(0);
    expect(coverageGaps(committed, accepts)).toEqual([]);
  });
});

describe('the spec and the script agree', () => {
  it('every tool the matrix spec records is a tool of the registry, so no section lands after the others', () => {
    const spec = readFileSync('tests/e2e/pdf-matrix.spec.ts', 'utf8');
    const recorded = new Set([...spec.matchAll(/tool: '([^']+)'/g)].map((match) => match[1] as string));
    const first = (tool: string) => tool.replace(/ \(.*\)$/, '');
    for (const tool of recorded) expect(PDF_TOOL_IDS as readonly string[], tool).toContain(first(tool));
    // The spec records all twelve tools.
    expect([...new Set([...recorded].map(first))].sort()).toEqual([...PDF_TOOL_IDS].sort());
  });
});
