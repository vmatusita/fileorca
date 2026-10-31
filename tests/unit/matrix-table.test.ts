// The table of the fixture matrix is built from the records the matrix tests write: every cell comes
// from a record, nothing is typed in. This proves the layout on records made up here.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTable, note, readRecords, size } from '../../scripts/fixtures/matrix-table.ts';
import type { MatrixRecord, PresetRecord, RecordFile } from '../e2e/lib/matrix.ts';

const ok = (fixture: string, name: string, format: string, width: number, height: number, bytes: number, extra: Partial<NonNullable<RecordFile['output']>> = {}): RecordFile => ({
  fixture,
  status: 'ok',
  output: { name, format, width, height, bytes, decoded: 'yes', note: '', ...extra },
});

const record = (id: string, tool: string, browser: string, options: string, files: RecordFile[], extra: Partial<MatrixRecord> = {}): MatrixRecord => ({
  id,
  tool,
  browser,
  path: `/${tool}/`,
  options,
  ms: 4200,
  processMs: 3000,
  phases: { load: 500, download: 100, decode: 200 },
  requests: 20,
  outside: 0,
  avifDecode: browser === 'chromium',
  files,
  ...extra,
});

const refused = (fixture: string, reason: string): RecordFile => ({ fixture, status: 'refused', reason });

describe('size and note', () => {
  it('writes sizes in decimal units with the comma of Portuguese', () => {
    expect(size(512)).toBe('512 B');
    expect(size(99_769)).toBe('100 KB');
    expect(size(1_242_014)).toBe('1,2 MB');
  });

  it('puts the notes of the tests in Portuguese and leaves an unknown one as it is', () => {
    expect(note('orientation ok (Δ0.4)')).toBe('orientação ok (Δ0.4)');
    expect(note('alpha kept, first frame')).toBe('transparência mantida; primeiro quadro');
    expect(note('800 x 600 px on a 800 x 600 pt page')).toBe('800×600 px numa página de 800×600 pt');
    expect(note('something new')).toBe('something new');
  });
});

describe('buildTable', () => {
  const matrix: MatrixRecord[] = [
    record('compress-image', 'compress-image', 'chromium', 'Recommended', [ok('jpg-01.jpg', 'jpg-01.jpg', 'jpeg', 3024, 4032, 1_242_014), refused('gen-vazio.jpg', 'empty')]),
    record('compress-image', 'compress-image', 'webkit', 'Recommended', [ok('jpg-01.jpg', 'jpg-01.jpg', 'jpeg', 3024, 4032, 1_250_000, { note: 'orientation ok (Δ0.5)' }), refused('gen-vazio.jpg', 'empty')]),
    record('heic-to-jpg-a', 'heic-to-jpg', 'chromium', 'JPG (default)', [ok('heic-05.heic', 'heic-05.jpg', 'jpeg', 3024, 4032, 900_000)]),
    record('heic-to-jpg-png', 'heic-to-jpg', 'chromium', 'PNG', [ok('heic-05.heic', 'heic-05.png', 'png', 3024, 4032, 9_000_000)]),
    record('convert-to-webp-avif', 'convert-to-webp', 'webkit', 'AVIF, Recommended', [ok('gen-avif.avif', 'x.avif', 'avif', 1600, 1200, 70_000, { decoded: 'unsupported' })], { avifDecode: false }),
    record('image-to-pdf', 'image-to-pdf', 'chromium', 'Image size', [ok('jpg-01.jpg', 'page 1', 'jpeg', 3024, 4032, 1000)], { pdf: { pages: 1, bytes: 1_500_000 } }),
  ];
  const presets: PresetRecord[] = [
    {
      id: 'compress-image-to-100kb',
      browser: 'chromium',
      path: '/compress-image/to-100kb/',
      limit: 100_000,
      ms: 3900,
      files: [{ fixture: 'jpg-01.jpg', input: 4_360_452, output: 'jpg-01.jpg', format: 'jpeg', width: 783, height: 1044, bytes: 99_769, note: 'reduced to 783 x 1044 px' }],
    },
  ];
  const table = buildTable({ matrix, presets });

  it('has a section per tool, in the order the records came, with a row per fixture and options', () => {
    const tools = [...table.matchAll(/^## `([^`]+)`$/gm)].map((match) => match[1]);
    expect(tools).toEqual(['compress-image', 'heic-to-jpg', 'convert-to-webp', 'image-to-pdf']);
    // the same HEIC under two options is two rows, not one overwritten
    expect(table).toContain('| `heic-05.heic` | JPG (default) | ok · JPG 3024×4032 · 900 KB · abre | — |');
    expect(table).toContain('| `heic-05.heic` | PNG | ok · PNG 3024×4032 · 9,0 MB · abre | — |');
  });

  it('shows what each browser did in its own column, a refusal as its reason, and a missing browser as a dash', () => {
    expect(table).toContain('| `jpg-01.jpg` | Recommended | ok · JPG 3024×4032 · 1,2 MB · abre | ok · JPG 3024×4032 · 1,3 MB · abre · orientação ok (Δ0.5) |');
    expect(table).toContain('| `gen-vazio.jpg` | Recommended | recusado (empty) | recusado (empty) |');
    expect(table).toContain('| — | ok · AVIF 1600×1200 · 70 KB · não abre neste navegador |');
  });

  it('summarises each test with its times and the requests that left the page', () => {
    expect(table).toContain('| `compress-image` | `compress-image` | Recommended | 2 | 1 | 1 | 4,2 s | 4,2 s | 0 |');
    expect(table).toContain('Chromium: abre AVIF sozinho; WebKit: não abre AVIF sozinho');
  });

  it('says how many pages the PDF has, and gives the presets their own table with the bytes of each output', () => {
    expect(table).toContain('Um PDF com 1 páginas (1,5 MB em Chromium)');
    expect(table).toContain('### `/compress-image/to-100kb/`');
    expect(table).toContain('| `jpg-01.jpg` | 4.360.452 | 99.769 JPG (783×1044) | — | reduzida para 783×1044 px |');
  });

  it('is the same text for the same records', () => {
    expect(buildTable({ matrix, presets })).toBe(table);
  });

  it('says so when there is nothing to build from', () => {
    expect(buildTable({ matrix: [], presets: [] })).toContain('Nenhum registro encontrado');
  });
});

describe('readRecords', () => {
  it('reads matrix records and preset records apart, by name', () => {
    const dir = mkdtempSync(join(tmpdir(), 'matriz-'));
    writeFileSync(join(dir, 'compress-image-chromium.json'), JSON.stringify({ id: 'compress-image', files: [] }));
    writeFileSync(join(dir, 'preset-to-100kb-webkit.json'), JSON.stringify({ id: 'to-100kb', files: [] }));
    writeFileSync(join(dir, 'notes.txt'), 'not a record');
    const records = readRecords(dir);
    expect(records.matrix.map((entry) => entry.id)).toEqual(['compress-image']);
    expect(records.presets.map((entry) => entry.id)).toEqual(['to-100kb']);
  });

  it('finds nothing in a folder that does not exist', () => {
    expect(readRecords(join(tmpdir(), 'no-such-matriz-folder'))).toEqual({ matrix: [], presets: [] });
  });
});
