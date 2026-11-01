// The table of the PDF fixture matrix is built from the records the matrix tests write: every cell comes from a
// record, nothing is typed in. This proves the layout on records made up here (the model is matrix-table.test.ts of the
// image tools), and that the real spec writes the shape the script reads.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTable, readRecords, testOf, type MatrixRecord } from '../../scripts/fixtures/pdf-matrix-table.ts';
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
    const tools = [...table.matchAll(/^## `([^`]+)`$/gm)].map((match) => match[1]);
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
