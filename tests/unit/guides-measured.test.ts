// The file of measurements the ten file guides read (prompt F5b, decision 3; DECISOES § 185): data/guides-measured.json,
// written by pnpm guias:medir. This test does not measure the browser again (that is guias:medir --check, outside
// pnpm verificar); it proves that the file is the script's own output and that every number in it can be traced:
//  1. the SHA-256 of the script is the one in the file (a changed script means measuring again);
//  2. every number and table carries its sample, method, date and commit;
//  3. every {placeholder} of a guide text exists in the file, or among the official facts of that guide;
//  4. a deterministic part, measured again here in Node with the same code, gives exactly the file's values.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import type { MeasuredFile, Method, Sample } from '../../src/tools/guides/measured-types.ts';
import { scriptFiles, scriptHash } from '../../scripts/guides/lib/record.ts';
import { breakdown, compress, merge, pdfFixture, splitEach } from '../../scripts/guides/lib/node-pdf.ts';
import { globals, resolvePlaceholder } from '../../src/tools/guides/measured.ts';

const FILE = 'data/guides-measured.json';
const measured = JSON.parse(readFileSync(FILE, 'utf8')) as MeasuredFile;
const UNITS = ['bytes', 'ratio', 'count', 'px', 'db', 'ppi'];
const FIXTURES = new Set([...readdirSync('fixtures/images'), ...readdirSync('fixtures/pdf')]);

function sampleProblems(where: string, sample: Sample): string[] {
  const problems: string[] = [];
  if (!Array.isArray(sample.files) || sample.files.length === 0) problems.push(`${where}: no files in the sample`);
  if (sample.count !== sample.files.length) problems.push(`${where}: count ${sample.count} for ${sample.files.length} files`);
  for (const file of sample.files) if (!FIXTURES.has(file)) problems.push(`${where}: ${file} is not a fixture`);
  return problems;
}

function methodProblems(where: string, method: Method): string[] {
  if (method.runner === 'node') return method.engine.trim() ? [] : [`${where}: a Node method with no engine`];
  if (method.runner === 'playwright') {
    const problems: string[] = [];
    if (!['chromium', 'webkit'].includes(method.browser)) problems.push(`${where}: browser ${method.browser}`);
    if (!method.version.trim()) problems.push(`${where}: no browser version`);
    if (!method.os.trim()) problems.push(`${where}: no system`);
    if (!/^\/[\w/-]*\/$/.test(method.path)) problems.push(`${where}: path ${method.path}`);
    return problems;
  }
  return [`${where}: unknown runner`];
}

function stampProblems(where: string, stamp: { date: string; commit: string }): string[] {
  const problems: string[] = [];
  if (stamp.date !== measured.measuredOn) problems.push(`${where}: date ${stamp.date}, the file says ${measured.measuredOn}`);
  if (!/^[0-9a-f]{40}$/.test(stamp.commit)) problems.push(`${where}: commit ${stamp.commit}`);
  return problems;
}

/** Every structural problem of the file, as text (empty when it is sound). */
function fileProblems(file: MeasuredFile): string[] {
  const problems: string[] = [];
  if (file.version !== 1) problems.push(`version ${file.version}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(file.measuredOn)) problems.push(`measuredOn ${file.measuredOn}`);
  if (!file.environment.browsers.chromium || !file.environment.browsers.webkit) problems.push('a browser version is missing');
  const ids = Object.keys(file.guides);
  if (ids.join() !== FILE_GUIDE_IDS.join()) problems.push(`guides ${ids.join(', ')}`);
  for (const id of FILE_GUIDE_IDS) {
    const guide = file.guides[id];
    if (!guide) continue;
    if (Object.keys(guide.numbers).length === 0) problems.push(`${id}: no numbers`);
    for (const [name, number] of Object.entries(guide.numbers)) {
      const where = `${id}.${name}`;
      if (typeof number.value !== 'number' || !Number.isFinite(number.value)) problems.push(`${where}: value ${number.value}`);
      if (!UNITS.includes(number.unit)) problems.push(`${where}: unit ${number.unit}`);
      problems.push(...sampleProblems(where, number.sample), ...methodProblems(where, number.method), ...stampProblems(where, number));
    }
    for (const [name, table] of Object.entries(guide.tables)) {
      const where = `${id} table ${name}`;
      if (table.rows.length === 0) problems.push(`${where}: no rows`);
      for (const row of table.rows) if (row.length !== table.columns.length) problems.push(`${where}: a row of ${row.length} cells for ${table.columns.length} columns`);
      if (table.methods.length === 0) problems.push(`${where}: no method`);
      problems.push(...sampleProblems(where, table.sample), ...table.methods.flatMap((how) => methodProblems(where, how)), ...stampProblems(where, table));
    }
    for (const size of guide.official ?? []) {
      if (!/^https:\/\//.test(size.source.href) || !size.source.title || !/^\d{4}-\d{2}-\d{2}$/.test(size.source.read)) problems.push(`${id}: the source of ${size.id}`);
      if (!(size.width > 0 && size.height > 0)) problems.push(`${id}: the size of ${size.id}`);
    }
  }
  return problems;
}

describe('the measurements of the file guides', () => {
  it('come from the script as it is now (the SHA-256 of scripts/guides/ is the one in the file)', () => {
    const files = scriptFiles();
    expect(measured.script.files).toEqual(files);
    expect(measured.script.sha256, 'the script changed: run pnpm guias:medir and commit the file').toBe(scriptHash(files));
  });

  it('give every number and every table its sample, method, date and commit', () => {
    expect(fileProblems(measured)).toEqual([]);
  });

  it('reject a number with no sample, a method with no browser version, a date of another day and a hand-written guide', () => {
    const broken = JSON.parse(JSON.stringify(measured)) as MeasuredFile;
    const guide = broken.guides['guides-heic-to-jpg-on-windows'];
    const first = Object.values(guide.numbers)[0];
    const browserNumber = Object.values(guide.numbers).find((number) => number.method.runner === 'playwright');
    if (!first || !browserNumber || browserNumber.method.runner !== 'playwright') throw new Error('the HEIC guide has a Node number and a browser number');
    first.sample = { files: [], count: 0 };
    browserNumber.method.version = '';
    browserNumber.date = '2020-01-01';
    guide.numbers['typed'] = { ...first, sample: { files: ['my-photo.jpg'], count: 1 }, value: Number.NaN };
    const problems = fileProblems(broken);
    expect(problems.some((problem) => problem.includes('no files in the sample'))).toBe(true);
    expect(problems.some((problem) => problem.includes('no browser version'))).toBe(true);
    expect(problems.some((problem) => problem.includes('date 2020-01-01'))).toBe(true);
    expect(problems.some((problem) => problem.includes('my-photo.jpg is not a fixture'))).toBe(true);
    expect(problems.some((problem) => problem.includes('typed: value'))).toBe(true);
  });

  it('settle the tool of guide 6, and the registry embeds that tool (DECISOES § 186)', () => {
    expect(measured.guides['guides-remove-location-from-photos'].facts['winner']).toBe(FILE_GUIDES['guides-remove-location-from-photos'].tool);
  });

  it('hold every placeholder of every guide text, or the guide names it as an official fact', async () => {
    const texts = import.meta.glob<{ facts?: Record<string, unknown> }>('/src/i18n/en/guide-*.ts', { import: 'default' });
    const always = Object.keys(globals(measured));
    for (const id of FILE_GUIDE_IDS) {
      const file = `/src/i18n/en/guide-${id.replace(/^guides-/, '')}.ts`;
      const load = texts[file];
      expect(load, `${file} exists`).toBeDefined();
      if (!load) continue;
      const source = readFileSync(`.${file}`, 'utf8');
      const official = Object.keys((await load()).facts ?? {});
      const missing = [...source.matchAll(/{(w+)}/g)]
        .map((match) => match[1] as string)
        .filter((name) => !always.includes(name) && !official.includes(name) && resolvePlaceholder(id, name, measured) === null);
      expect(missing, `${file}: placeholders with no measurement`).toEqual([]);
    }
  });

  it('read a placeholder with a suffix as a way of writing the number, and nothing else', () => {
    expect(resolvePlaceholder('guides-heic-to-jpg-on-windows', 'ratioTotalChromium_more', measured)?.variant).toBe('more');
    expect(resolvePlaceholder('guides-heic-to-jpg-on-windows', 'ratioTotalChromium_typed', measured)).toBeNull();
    expect(resolvePlaceholder('guides-heic-to-jpg-on-windows', 'noSuchNumber', measured)).toBeNull();
  });
});

describe('a deterministic part, measured again in Node with the same code', () => {
  const numbers = (id: (typeof FILE_GUIDE_IDS)[number]) => measured.guides[id].numbers;
  const value = (id: (typeof FILE_GUIDE_IDS)[number], name: string): number => {
    const number = numbers(id)[name];
    if (!number) throw new Error(`${id}.${name} is not in the file`);
    return number.value;
  };

  it('Split PDF: the parts of the tax form and of the 117-page book add up to the file', async () => {
    const form = await splitEach('pdf-formulario-irs-1040-2019.pdf');
    expect(form.sum).toBe(value('guides-split-pdf-file-size', 'formSum'));
    expect(form.partFonts).toBe(value('guides-split-pdf-file-size', 'formPartFonts'));
    const book = await splitEach('pdf-grande-fontes-embutidas-117p.pdf');
    expect(book.sum).toBe(value('guides-split-pdf-file-size', 'bookSum'));
    expect(book.parts).toBe(value('guides-split-pdf-file-size', 'bookParts'));
  });

  it('Compress PDF: Lossless and Recommended on the scanned page give the file values', async () => {
    expect((await compress('pdf-escaneado-01-pagina-livro-cor.pdf', 'lossless')).after).toBe(value('guides-why-is-my-pdf-so-large', 'scanLossless'));
    expect((await compress('pdf-escaneado-01-pagina-livro-cor.pdf', 'recommended')).after).toBe(value('guides-why-is-my-pdf-so-large', 'scanRecommended'));
  });

  it('what takes the space in the tax form, and the merged pair of the scan and the form', async () => {
    const form = await breakdown(pdfFixture('pdf-formulario-irs-1040-2019.pdf'));
    expect(form.fonts).toBe(value('guides-why-is-my-pdf-so-large', 'formFonts'));
    expect(form.fontCount).toBe(value('guides-why-is-my-pdf-so-large', 'formFontCount'));
    const pair = await merge(['pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-formulario-irs-1040-2019.pdf']);
    expect(pair.merged).toBe(value('guides-combine-pdfs-on-phone', 'scanFormMerged'));
  });
});
