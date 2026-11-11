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
import type { MeasuredFile, MeasuredNumber, MeasuredTable, Method, OfficialSize, Sample } from '../../src/tools/guides/measured-types.ts';
import { scriptFiles, scriptHash } from '../../scripts/guides/lib/record.ts';
import { breakdown, compress, merge, pdfFixture, splitEach } from '../../scripts/guides/lib/node-pdf.ts';
import { compareNumbers, compareTables } from '../../scripts/guides/lib/compare.ts';
import { VARIANTS, globals, guideTables, resolvePlaceholder } from '../../src/tools/guides/measured.ts';
import enShared from '../../src/i18n/en/file-guides.ts';
import ptShared from '../../src/i18n/pt/file-guides.ts';
import esShared from '../../src/i18n/es/file-guides.ts';
import esResolution from '../../src/i18n/es/guide-pdf-to-jpg-resolution.ts';
import pdfToJpgEs from '../../src/tools/pdf-to-jpg/i18n/es.ts';
import { GUIDE_PUBLISHED, GUIDE_REVIEWED } from '../../src/tools/guides/page.ts';
import enCommon from '../../src/i18n/en/common.ts';
import removeLocation from '../../src/i18n/en/guide-remove-location-from-photos.ts';
import splitPdf from '../../src/i18n/en/guide-split-pdf-file-size.ts';
import combinePdfs from '../../src/i18n/en/guide-combine-pdfs-on-phone.ts';

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
      if (!Array.isArray(table.kinds) || table.kinds.length !== table.columns.length) problems.push(`${where}: a kind for each of the ${table.columns.length} columns (who measured it, in which unit)`);
      else if (table.kinds.some((kind) => !['node', 'playwright'].includes(kind.runner) || ![...UNITS, 'label'].includes(kind.unit))) problems.push(`${where}: a column of an unknown kind`);
      for (const row of table.rows) if (row.length !== table.columns.length) problems.push(`${where}: a row of ${row.length} cells for ${table.columns.length} columns`);
      if (table.methods.length === 0) problems.push(`${where}: no method`);
      problems.push(...sampleProblems(where, table.sample), ...table.methods.flatMap((how) => methodProblems(where, how)), ...stampProblems(where, table));
    }
    for (const size of guide.official ?? []) {
      if (!/^https:\/\//.test(size.source.href) || !size.source.title || !/^\d{4}-\d{2}-\d{2}$/.test(size.source.read)) problems.push(`${id}: the source of ${size.id}`);
      if (!(size.width > 0 && size.height > 0)) problems.push(`${id}: the size of ${size.id}`);
      problems.push(...statedProblems(size).map((problem) => `${id}: ${problem}`));
    }
  }
  return problems;
}

/**
 * The sentence of guide 6 names the tools the browsers wrote differently (DECISOES § 210): with no such tool it would
 * read "with , the sizes differed", so an empty fact fails while the text reads it, and the sentence has to change.
 */
function differProblems(fact: string, text: string): string[] {
  return text.includes('{browsersDiffer}') && fact.trim() === '' ? ['o guia 6 diz "with {browsersDiffer}" sem nenhuma ferramenta: os navegadores concordaram em todas, troque a frase'] : [];
}

/**
 * An official size is only what its page says (prompt F5b, decision 2.3; DECISOES § 198): the width and the height (or
 * the width and a ratio that gives the height) and the limit appear in the words recorded from the page, never a size
 * the site's own preset makes.
 */
function statedProblems(size: OfficialSize): string[] {
  const words = size.stated ?? '';
  if (!words.trim()) return [`${size.id}: no words of its page`];
  const numbers = new Set([...words.replace(/(\d),(\d{3})/g, '$1$2').matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0])));
  const ratios = [...words.matchAll(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/g)].map((match) => [Number(match[1]), Number(match[2])] as const);
  const problems: string[] = [];
  if (!numbers.has(size.width)) problems.push(`${size.id}: ${size.width} wide is not in the words of its page`);
  if (!numbers.has(size.height) && !ratios.some(([w, h]) => Math.round((size.width * h) / w) === size.height)) problems.push(`${size.id}: ${size.height} tall is not in the words of its page`);
  if (size.limit !== null) {
    const said = new RegExp(`(?:^|[^\\d.])(?:${size.limit / 1e6}\\s?MB|${size.limit / 1e3}\\s?(?:KB|kilobytes))\\b`, 'i');
    if (!said.test(words)) problems.push(`${size.id}: the limit of ${size.limit} bytes is not in the words of its page`);
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

  // DECISOES § 207: the "Reviewed" line and the Article schema never date the review or the publication before the
  // day the numbers they show were measured (the script stamps the UTC day).
  it('are never newer than the review and publication dates the guides show', () => {
    expect(GUIDE_REVIEWED >= measured.measuredOn, `reviewed ${GUIDE_REVIEWED}, measured ${measured.measuredOn}`).toBe(true);
    expect(GUIDE_PUBLISHED >= measured.measuredOn, `published ${GUIDE_PUBLISHED}, measured ${measured.measuredOn}`).toBe(true);
    expect(GUIDE_REVIEWED >= GUIDE_PUBLISHED).toBe(true);
  });

  it('settle the tool of guide 6, and the registry embeds that tool (DECISOES § 186)', () => {
    expect(measured.guides['guides-remove-location-from-photos'].facts['winner']).toBe(FILE_GUIDES['guides-remove-location-from-photos'].tool);
  });

  // F18 (DECISOES § 733): the guide says that Resize image at the full size gave back the very same files as Remove EXIF
  // data, and that the tie went to the tool with nothing to set. Both halves come from the measurement: equal bytes in
  // each browser and every photo with identical pixels, for both tools; a new measurement that parts them fails here.
  it('say, in guide 6, that Resize image tied with Remove EXIF data only while the measurement shows the same files', () => {
    const numbers = measured.guides['guides-remove-location-from-photos'].numbers;
    const value = (name: string): number | undefined => numbers[name]?.value;
    for (const browser of ['Chromium', 'Webkit']) {
      expect(value(`removeExifDataBytes${browser}`), browser).toBe(value(`resizeImageBytes${browser}`));
      expect(value(`removeExifDataIdentical${browser}`), browser).toBe(value('photos'));
      expect(value(`resizeImageIdentical${browser}`), browser).toBe(value('photos'));
    }
    expect(JSON.stringify(removeLocation)).toContain('Resize image, set to keep the full size, gave back the very same files');
  });

  it('take an official size only from the words of its page, and fail a size the page does not give (DECISOES § 198)', () => {
    const youtube: OfficialSize = {
      id: 'youtube-thumbnail', network: 'YouTube', use: 'Video thumbnail', width: 3840, height: 2160, limit: 2_000_000, ad: false,
      stated: 'Have a resolution of 3840 x 2160 pixels for videos, with a minimum width of 640 pixels for videos. Mobile: 2 MB for video thumbnails.',
      source: { href: 'https://support.google.com/youtube/answer/72431?hl=en', title: 'Add custom thumbnails on YouTube', read: '2026-11-01' },
    };
    expect(statedProblems(youtube)).toEqual([]);
    // The width and a ratio of the page give the height (Instagram: 1080 wide at 3:4).
    expect(statedProblems({ ...youtube, width: 1080, height: 1440, limit: null, stated: 'a width between 320 and 1080 pixels, an aspect ratio between 1.91:1 and 3:4' })).toEqual([]);
    // The size the site's preset makes is not on the page: it cannot stand as the official one.
    expect(statedProblems({ ...youtube, width: 1280, height: 720 }).join()).toMatch(/1280 wide is not in the words.*720 tall is not in the words/);
    expect(statedProblems({ ...youtube, limit: 50_000_000, stated: youtube.stated.replace('2 MB', '') }).join()).toMatch(/the limit of 50000000 bytes/);
    expect(statedProblems({ ...youtube, stated: '' }).join()).toMatch(/no words of its page/);
  });

  it('explain, in guide 8, the growth of the scans with the metadata every part repeats, as measured (DECISOES § 200)', () => {
    const text = JSON.stringify(splitPdf);
    for (const name of ['reportMetadata', 'reportPartMetadata', 'reportMetadataShare', 'reportGrowthPerPart']) {
      expect(text, `guide 8 cites {${name}}`).toContain(`{${name}}`);
      expect(measured.guides['guides-split-pdf-file-size'].numbers[name], `${name} is measured`).toBeDefined();
    }
    // The cause the first version gave, and its two readings of a growth of a third as nothing (A-5).
    expect(text).not.toMatch(/small frame every PDF needs|barely grew|costs almost nothing extra/);
  });

  it('say, in guide 8, how much each file that grew grew, and what of a part is metadata (DECISOES § 209)', () => {
    const numbers = measured.guides['guides-split-pdf-file-size'].numbers;
    const sentences = [splitPdf.intro, ...splitPdf.sections.map((section) => section.paragraphs)].flat().flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/));
    const counting = sentences.find((sentence) => /\{bigger(?:_\w+)?\}/.test(sentence));
    expect(counting, 'a sentence counts the files that grew').toBeDefined();
    // Every file whose parts weighed more is named in that sentence with its growth, the one of a few bytes too.
    const grew = Object.keys(numbers).filter((name) => /Growth$/.test(name) && (numbers[name] as MeasuredNumber).value > 0).map((name) => name.replace(/Growth$/, ''));
    expect(grew.length).toBe(numbers['bigger']?.value);
    for (const key of grew) expect(counting, `the growth of ${key}`).toMatch(new RegExp(`\\{${key}(?:Growth|Ratio)(?:_\\w+)?\\}`));
    // The growth per part and the metadata in it are said together: the XMP is part of it, not all of it.
    expect(sentences.some((sentence) => sentence.includes('{reportGrowthPerPart}') && sentence.includes('{reportMetadata}'))).toBe(true);
  });

  it('say, in guide 9, how much smaller each merged pair came out (DECISOES § 208)', () => {
    const numbers = measured.guides['guides-combine-pdfs-on-phone'].numbers;
    const text = JSON.stringify(combinePdfs);
    // Each pair by its change, or by its bytes where the change rounds to nothing.
    for (const pair of Object.keys(numbers).filter((name) => /Ratio$/.test(name)).map((name) => name.replace(/Ratio$/, ''))) {
      expect(text, `guide 9 says what ${pair} came to`).toMatch(new RegExp(`\\{${pair}(?:Ratio|Merged)(?:_\\w+)?\\}`));
    }
    expect(text).not.toMatch(/a little smaller|One pair stood out/);
  });

  it('say, in guide 6, which tools the two browsers wrote differently, from the measurement (DECISOES § 202)', () => {
    const guide = measured.guides['guides-remove-location-from-photos'];
    const table = guide.tables['candidates'] as MeasuredTable;
    const at = (column: string): number => table.columns.indexOf(column);
    const bytes = (tool: string, browser: string): unknown => table.rows.find((row) => row[at('tool')] === tool && row[at('browser')] === browser)?.[at('afterBytes')];
    const tools = [...new Set(table.rows.map((row) => String(row[at('tool')])))];
    const differ = tools.filter((tool) => bytes(tool, 'chromium') !== bytes(tool, 'webkit'));
    const names = differ.map((tool) => (enCommon.tools as Record<string, { name: string }>)[tool]?.name ?? (enCommon.pdf as Record<string, { name: string }>)[tool]?.name ?? tool);
    expect(guide.facts['browsersDiffer'], 'the fact the script wrote').toBe(names.join(' and '));
    expect(guide.numbers['browsersSameSize']?.value).toBe(tools.length - differ.length);
    expect(guide.numbers['candidates']?.value).toBe(tools.length);
    // The guide says it through the fact, never as an agreement typed by hand.
    expect(JSON.stringify(removeLocation)).toContain('{browsersDiffer}');
    expect(JSON.stringify(removeLocation)).not.toMatch(/agreed on every tool/);
    expect(differProblems(guide.facts['browsersDiffer'] ?? '', JSON.stringify(removeLocation))).toEqual([]);
    // A new measurement where the two browsers agree on every tool leaves the sentence with no tool: it fails here.
    expect(differProblems('', JSON.stringify(removeLocation)).join()).toMatch(/sem nenhuma ferramenta/);
  });

  // Since the languages adjustment, the guides of pt and es too. The pattern lacked its backslash before (/{(w+)}/ matched
  // nothing), so the test proved nothing in any language until then (DECISOES § 314).
  it('hold every placeholder of every guide text, in the three languages, or the guide names it as an official fact', async () => {
    const texts = import.meta.glob<{ facts?: Record<string, unknown> }>(['/src/i18n/en/guide-*.ts', '/src/i18n/pt/guide-*.ts', '/src/i18n/es/guide-*.ts'], { import: 'default' });
    const always = Object.keys(globals(measured));
    for (const [lang, id] of FILE_GUIDE_IDS.flatMap((guide) => (['en', 'pt', 'es'] as const).map((lang) => [lang, guide] as const))) {
      const file = `/src/i18n/${lang}/guide-${id.replace(/^guides-/, '')}.ts`;
      const load = texts[file];
      expect(load, `${file} exists`).toBeDefined();
      if (!load) continue;
      const source = readFileSync(`.${file}`, 'utf8');
      const official = Object.keys((await load()).facts ?? {});
      const missing = [...source.matchAll(/\{(\w+)\}/g)]
        .map((match) => match[1] as string)
        .filter((name) => !always.includes(name) && !official.includes(name) && !(name in measured.guides[id].facts) && resolvePlaceholder(id, name, measured) === null);
      expect(missing, `${file}: placeholders with no measurement`).toEqual([]);
    }
  });

  it('read a placeholder with a suffix as a way of writing the number, and nothing else', () => {
    expect(resolvePlaceholder('guides-heic-to-jpg-on-windows', 'ratioTotalChromium_more', measured)?.variant).toBe('more');
    expect(resolvePlaceholder('guides-heic-to-jpg-on-windows', 'ratioTotalChromium_typed', measured)).toBeNull();
    expect(resolvePlaceholder('guides-heic-to-jpg-on-windows', 'noSuchNumber', measured)).toBeNull();
  });
});

describe('guias:medir --check compares each column by who measured it (DECISOES § 185 and § 196)', () => {
  const ID = 'guides-why-is-my-pdf-so-large';
  /** The Compress PDF table mixes Node columns (Lossless, Recommended) and browser columns (Strong, on the canvas). */
  const mutated = (column: string, factor: number): string[] => {
    const before = measured.guides[ID].tables;
    const after = JSON.parse(JSON.stringify(before)) as Record<string, MeasuredTable>;
    const table = after['compress'] as MeasuredTable;
    const at = table.columns.indexOf(column);
    const row = table.rows.find((cells) => cells[0] === 'gen-fotos.pdf') as MeasuredTable['rows'][number];
    row[at] = Math.round((row[at] as number) * factor);
    const problems: string[] = [];
    compareTables(ID, before, after, problems);
    return problems;
  };

  it('fails a Node value moved by 1.9% in a table that mixes Node and browser columns', () => {
    expect(mutated('losslessBytes', 1.019).join()).toMatch(/row 2, losslessBytes/);
    expect(mutated('recommendedBytes', 0.981).join()).toMatch(/row 2, recommendedBytes/);
  });

  it('passes a browser value moved within 2%, and fails one moved past it', () => {
    expect(mutated('strongBytesChromium', 1.019)).toEqual([]);
    expect(mutated('strongBytesWebkit', 0.981)).toEqual([]);
    expect(mutated('strongBytesChromium', 1.025).join()).toMatch(/row 2, strongBytesChromium/);
  });

  it('compares the measured numbers the same way, by the method of each one', () => {
    const before = measured.guides[ID].numbers;
    const bump = (name: string, factor: number): string[] => {
      const after = JSON.parse(JSON.stringify(before)) as Record<string, MeasuredNumber>;
      (after[name] as MeasuredNumber).value = Math.round((after[name] as MeasuredNumber).value * factor);
      const problems: string[] = [];
      compareNumbers(ID, before, after, problems);
      return problems;
    };
    expect(bump('photosRecommended', 1.019).join()).toMatch(/photosRecommended/);
    expect(bump('photosStrongChromium', 1.019)).toEqual([]);
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

  it('Split PDF: the metadata each part of the NASA report repeats is what the file says (DECISOES § 200)', async () => {
    const report = await splitEach('pdf-escaneado-02-relatorio-nasa-150p.pdf');
    expect(report.original.metadata).toBe(value('guides-split-pdf-file-size', 'reportMetadata'));
    expect(report.partMetadata).toBe(value('guides-split-pdf-file-size', 'reportPartMetadata'));
    expect(report.sum - report.original.total).toBe(value('guides-split-pdf-file-size', 'reportGrowth'));
    // Most of the growth of the scans is that copy, not the frame of each part (the guide says so with these numbers).
    expect(value('guides-split-pdf-file-size', 'reportMetadataShare')).toBeGreaterThan(0.5);
  }, 60_000);

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

// Review of the languages adjustment (C-1 and B2; DECISOES § 321): the guide to the resolution of PDF to JPG shows the tool
// and the measure on one page, and in Spanish the tool says "ppp" since the F6. The unit of a resolution comes from the
// shared texts of the language, so the guide says it the same way; the English and Portuguese pages stay "ppi".
describe('the unit of a resolution', () => {
  it('is ppp in Spanish and ppi in English and Portuguese, in the placeholders and in the table of the guide', () => {
    const base = Object.values(measured.guides['guides-pdf-to-jpg-resolution'].numbers)[0];
    if (!base) throw new Error('the resolution guide has numbers');
    const number = (value: number): MeasuredNumber => ({ ...base, value, unit: 'ppi' });
    expect(VARIANTS[''](number(150), { lang: 'en', shared: enShared })).toBe('150 ppi');
    expect(VARIANTS[''](number(150), { lang: 'pt', shared: ptShared })).toBe('150 ppi');
    expect(VARIANTS[''](number(1200), { lang: 'es', shared: esShared })).toBe('1,200 ppp');
    const cells = guideTables('guides-pdf-to-jpg-resolution', esShared, esResolution, measured, 'es').flat(2).join(' | ');
    expect(cells).toMatch(/\b(?:72|150|300) ppp\b/);
    expect(cells).not.toMatch(/\bppi\b/);
    // The tool embedded in the same page writes ppp (src/tools/pdf-to-jpg/i18n/es.ts).
    expect(JSON.stringify(pdfToJpgEs)).toMatch(/150 ppp/);
  });
});
