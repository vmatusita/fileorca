// The PDF fixtures against their oracle (fixtures/pdf/expected.json, written by PDF.js and qpdf in
// scripts/fixtures/pdf.ts) and their record (fixtures/ORIGEM.md): every file is listed, nothing changed under its
// SHA-256, the oracle agrees with a second reader (the test parser of tests/e2e/lib/pdf.ts and qpdf), and each
// generated file has the structure it was built for. Nothing here asks src/engine/pdf/ anything (F5a, decision 3).
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parsePdf, pdfStructureProblems, strictPdf } from '../e2e/lib/pdf.ts';
import { segments } from '../e2e/lib/jpeg.ts';
import { qpdfCheck, qpdfEncryption, qpdfTransform } from '../../scripts/lib/qpdf.ts';
import { ACTIONS_HOST, LOSSLESS, PASSWORDS, type PdfOracleEntry } from '../../scripts/fixtures/pdf.ts';

const DIR = 'fixtures/pdf/';
const read = (name: string): Uint8Array => new Uint8Array(readFileSync(DIR + name));
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const latin1 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');
const oracle = JSON.parse(readFileSync(`${DIR}expected.json`, 'utf8')) as { note: string; passwords: typeof PASSWORDS; files: Record<string, PdfOracleEntry> };
const origem = readFileSync('fixtures/ORIGEM.md', 'utf8');
const pdfs = readdirSync(DIR).filter((name) => name.endsWith('.pdf'));
const generated = pdfs.filter((name) => name.startsWith('gen-'));
const entry = (name: string): PdfOracleEntry => {
  const found = oracle.files[name];
  if (!found) throw new Error(`${name} is not in expected.json`);
  return found;
};

describe('fixtures/pdf and its record', () => {
  it('lists every PDF in expected.json and every generated one in ORIGEM.md with its SHA-256', () => {
    expect(Object.keys(oracle.files).sort()).toEqual([...pdfs].sort());
    expect(generated.length).toBe(13);
    const rows = new Map<string, string>();
    for (const match of origem.matchAll(/^\| pdf\/(gen-\S+) \| .+? \| scripts\/fixtures\/pdf\.ts · sha256 ([0-9a-f]{64}) \| F5a \|$/gm)) rows.set(match[1] as string, match[2] as string);
    for (const name of generated) expect(sha256(read(name)), name).toBe(rows.get(name));
    expect(rows.size).toBe(generated.length);
  });

  it('keeps the four F0 files unchanged under the SHA-256 of the record', () => {
    for (const name of pdfs.filter((file) => file.startsWith('pdf-'))) expect(origem, name).toContain(`${sha256(read(name))}  pdf/${name}`);
  });

  it('stays under 15 MB, and the record and the oracle carry the same passwords', () => {
    const total = pdfs.reduce((sum, name) => sum + statSync(DIR + name).size, 0);
    expect(total).toBeLessThan(15 * 1024 * 1024);
    expect(oracle.passwords).toEqual(PASSWORDS);
    for (const password of Object.values(PASSWORDS)) expect(origem).toContain(`\`${password}\``);
    expect(oracle.note).toMatch(/never from src\/engine\/pdf/);
  });
});

describe('the oracle against a second reader', () => {
  const readable = pdfs.filter((name) => entry(name).expect === 'ok');

  it('agrees with the test parser on page count, size and /Rotate', () => {
    for (const name of readable) {
      const parsed = parsePdf(read(name));
      const expected = entry(name);
      expect(parsed.pageCount, name).toBe(expected.pages);
      expect(parsed.pages.map((page) => page.rotate), name).toEqual(expected.rotate);
      // PDF.js's view is the CropBox inside the MediaBox: with no CropBox it is the MediaBox the parser reads.
      if (name !== 'gen-paginas-mistas.pdf') {
        expect(parsed.pages.map((page) => [Math.round(page.width * 100) / 100, Math.round(page.height * 100) / 100]), name).toEqual(expected.sizes);
      }
    }
  });

  it('agrees with qpdf on --check and on the encryption of the three locked files', async () => {
    for (const name of pdfs) {
      const expected = entry(name);
      if (expected.expect === 'empty' || expected.expect === 'not-pdf') continue;
      const run = await qpdfCheck(read(name), expected.encryption?.password ?? undefined);
      expect(run.code, name).toBe(expected.qpdf.check);
    }
    const locked = pdfs.filter((name) => entry(name).encryption !== null);
    expect(locked.sort()).toEqual(['gen-cifrado-aes256.pdf', 'gen-cifrado-dono.pdf', 'gen-cifrado-rc4-128.pdf']);
    expect(entry('gen-cifrado-aes256.pdf').encryption).toMatchObject({ R: 6, method: 'AESv3', restricted: false, password: PASSWORDS.aes256 });
    expect(entry('gen-cifrado-rc4-128.pdf').encryption).toMatchObject({ R: 3, method: 'RC4', restricted: false, password: PASSWORDS.rc4 });
    expect(entry('gen-cifrado-dono.pdf').encryption).toMatchObject({ R: 6, method: 'AESv3', restricted: true, password: null });
    // Without the password the two with an open password say so; the owner-only one opens.
    expect((await qpdfEncryption(read('gen-cifrado-aes256.pdf'))).out.join(' ')).toMatch(/invalid password/);
    expect((await qpdfEncryption(read('gen-cifrado-rc4-128.pdf'))).out.join(' ')).toMatch(/invalid password/);
    expect((await qpdfEncryption(read('gen-cifrado-dono.pdf'))).code).toBe(0);
  });

  it('says what a tool must do with each file', () => {
    const expects = Object.fromEntries(pdfs.map((name) => [name, entry(name).expect]));
    expect(expects).toMatchObject({
      'gen-cifrado-aes256.pdf': 'needs-password',
      'gen-cifrado-rc4-128.pdf': 'needs-password',
      'gen-cifrado-dono.pdf': 'restricted',
      'gen-xref-estragada.pdf': 'repaired',
      'gen-cortado.pdf': 'truncated',
      'gen-vazio.pdf': 'empty',
      'gen-jpg-extensao-pdf.pdf': 'not-pdf',
      'gen-texto-extensao-pdf.pdf': 'not-pdf',
      'pdf-escaneado-02-relatorio-nasa-150p.pdf': 'ok',
    });
    // The NASA scan keeps its two linearization warnings: an output may show them only if they come from it.
    expect(entry('pdf-escaneado-02-relatorio-nasa-150p.pdf').qpdf).toMatchObject({ check: 3 });
    expect(entry('pdf-escaneado-02-relatorio-nasa-150p.pdf').qpdf.warnings).toHaveLength(2);
  });
});

describe('the generated files have the structure they were built for', () => {
  it('gen-paginas-300 and gen-paginas-mistas carry one "Page N" marker per page, in order', () => {
    expect(entry('gen-paginas-300.pdf').markers).toEqual(Array.from({ length: 300 }, (_, i) => `Page ${i + 1}`));
    const mixed = entry('gen-paginas-mistas.pdf');
    expect(mixed.markers).toEqual(Array.from({ length: 8 }, (_, i) => `Page ${i + 1}`));
    expect(mixed.rotate).toEqual([0, 0, 0, 90, 270, 180, 0, 90]);
    // Letter, A4, a landscape sheet, the CropBox of page 7 (432 x 576) and of page 8 (500 x 700).
    expect(mixed.sizes?.[0]).toEqual([612, 792]);
    expect(mixed.sizes?.[1]).toEqual([595.28, 841.89]);
    expect(mixed.sizes?.[2]).toEqual([792, 612]);
    expect(mixed.sizes?.[6]).toEqual([432, 576]);
    expect(mixed.sizes?.[7]).toEqual([500, 700]);
    expect(parsePdf(read('gen-paginas-mistas.pdf')).pages[7]?.mediaBox).toEqual([-200, -150, 395.28, 691.89]);
  });

  it('gen-ja-otimizado has object streams and comes out of the lossless options no smaller', async () => {
    const bytes = read('gen-ja-otimizado.pdf');
    expect(parsePdf(bytes).usesObjectStreams).toBe(true);
    const again = await qpdfTransform(bytes, [...LOSSLESS, '--deterministic-id']);
    expect(again.code).toBe(0);
    expect(again.bytes?.length ?? 0).toBeGreaterThanOrEqual(bytes.length);
  });

  it('gen-fotos holds three colour JPEGs and one grey JPEG, none with Exif', () => {
    const images = parsePdf(read('gen-fotos.pdf')).images;
    expect(images.map((image) => [image.filters.join('+'), image.colorSpace, image.bitsPerComponent])).toEqual([
      ['DCTDecode', 'DeviceRGB', 8],
      ['DCTDecode', 'DeviceRGB', 8],
      ['DCTDecode', 'DeviceRGB', 8],
      ['DCTDecode', 'DeviceGray', 8],
    ]);
    for (const image of images) {
      expect(Math.max(image.width, image.height)).toBeGreaterThanOrEqual(1600);
      expect(segments(image.jpeg as Uint8Array).some((segment) => segment.marker === 0xe1), 'no APP1').toBe(false);
    }
  });

  it('gen-acoes carries every action the tools must never run, and points only at a host that never resolves', () => {
    const text = latin1(read('gen-acoes.pdf'));
    expect(text).toMatch(/\/OpenAction\s+\d+ 0 R/);
    expect(text).toMatch(/\/S\s*\/JavaScript/);
    expect(text).toMatch(/\/S\s*\/Launch/);
    expect(text).toMatch(/\/S\s*\/URI/);
    expect(text).toMatch(/\/AA\s*<<\s*\/O/);
    expect(text).toContain(ACTIONS_HOST);
    expect(ACTIONS_HOST.endsWith('.invalid')).toBe(true);
    expect(entry('gen-acoes.pdf').links).toEqual([3, 0]);
  });

  it('the broken ones are broken the way their names say, and the rest pass the strict check', async () => {
    expect(pdfStructureProblems(read('gen-xref-estragada.pdf')).join(' ')).toMatch(/startxref offset 999999/);
    expect(latin1(read('gen-cortado.pdf'))).not.toContain('%%EOF');
    expect(read('gen-vazio.pdf').length).toBe(0);
    expect([...read('gen-jpg-extensao-pdf.pdf').subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    expect(latin1(read('gen-texto-extensao-pdf.pdf'))).not.toContain('%PDF-');
    for (const name of ['gen-paginas-300.pdf', 'gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf', 'gen-fotos.pdf', 'gen-acoes.pdf']) {
      const strict = await strictPdf(read(name));
      expect(strict.problems, name).toEqual([]);
      expect(strict.pageCount, name).toBe(entry(name).pages);
    }
  });

  it('no generated file carries a date or a Producer', () => {
    for (const name of ['gen-paginas-300.pdf', 'gen-paginas-mistas.pdf', 'gen-ja-otimizado.pdf', 'gen-fotos.pdf', 'gen-acoes.pdf']) {
      const info = parsePdf(read(name)).info;
      expect(info, name).not.toHaveProperty('CreationDate');
      expect(info, name).not.toHaveProperty('ModDate');
      expect(info, name).not.toHaveProperty('Producer');
    }
  });
});
