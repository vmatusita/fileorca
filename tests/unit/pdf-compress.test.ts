// Compress PDF, mode by mode, on every fixture each mode accepts (F5a, criterion 4; plan section 9). The table
// "mode x fixture" gives the size before, the size after and the ratio, and for Recommended the PSNR of page 1 drawn at
// 100 ppi against the original; every row is printed with the prefix "[compress]" and the whole table once more at the
// end as Markdown (the report copies it). The engine runs in Node with the same code the site's worker runs; what
// reads its outputs is not the engine: qpdf --check (scripts/lib/qpdf.ts) and PDF.js (tests/e2e/lib/pdfjs-read.ts),
// and the expected pages come from the oracle fixtures/pdf/expected.json.
//
// Asserted on every row:
//  - never bigger than the original, in any mode, on any fixture;
//  - when nothing gets smaller (outcome "unchanged") the original comes back byte for byte (gen-ja-otimizado, which is
//    already as small as qpdf makes it, in all three modes), and when the outcome is "new" the file is smaller, passes
//    qpdf --check and has the pages of the original;
//  - Recommended gains on the photos (gen-fotos) and its page 1 stays above the PSNR threshold below;
//  - Strong gives pages that are pictures, no text operators, each the size of the page as shown.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { STRONG_PPI, STRONG_QUALITY, imagesToPdf, processPdf, type RenderedPage } from '../../src/engine/pdf/process.ts';
import type { CompressMode, PdfResult, PdfSuccess } from '../../src/engine/pdf/types.ts';
import { drawWithPdfjs, psnr, readWithPdfjs } from '../e2e/lib/pdfjs-read.ts';
import { pdfTextLines } from '../e2e/lib/pdf-text.ts';
import { qpdf, qpdfCheck } from '../../scripts/lib/qpdf.ts';
import { ORACLE, fixture, nodeRenderer, oracle, useNodeAssets } from './lib/pdf-engine.ts';

beforeAll(() => useNodeAssets());

/**
 * The threshold of the Recommended mode, fixed here before the first measurement (plan section 4, DECISOES § 147):
 * page 1 of the result and of the original, both drawn by PDF.js at 100 ppi, must keep a PSNR of at least 30 dB.
 */
const PSNR_MIN_DB = 30;
const PSNR_SCALE = 100 / 72;
/** Recommended must take at least this share off a file made of photos far above 150 ppi (gen-fotos). */
const PHOTOS_MAX_RATIO = 0.6;
/** Not a quality bar: a picture of the wrong side up or of the wrong part of the page scores far below this (about 8 dB). */
const ORIENTATION_MIN_DB = 20;

const MODES: readonly CompressMode[] = ['lossless', 'recommended', 'strong'];
/** What every mode takes: the readable files and the one whose index pdf-lib has to rebuild (it comes out repaired). */
const ACCEPTED = Object.keys(ORACLE.files).filter((name) => ['ok', 'repaired'].includes(oracle(name).expect));
const REFUSED = Object.keys(ORACLE.files).filter((name) => !ACCEPTED.includes(name));

interface Row {
  mode: CompressMode;
  fixture: string;
  before: number;
  after: number;
  outcome: 'new' | 'unchanged';
  /** PSNR of page 1 in dB (Recommended only); Infinity when the page is drawn from the same bytes. */
  psnr: number | null;
  ms: number;
}
const rows: Row[] = [];

const bytesFmt = (n: number): string => n.toLocaleString('en-US');
const ratio = (row: Row): string => (row.after / row.before).toFixed(3);
const dB = (value: number | null): string => (value === null ? '' : Number.isFinite(value) ? value.toFixed(1) : 'same pixels');

/** A request, with the pages drawn the way the site's worker would (PDF.js with the Node canvas of @napi-rs/canvas). */
async function compress(name: string, mode: CompressMode): Promise<{ result: PdfResult; ms: number }> {
  const started = performance.now();
  const result = await processPdf({ kind: 'compress', mode }, [fixture(name)], nodeRenderer());
  return { result, ms: Math.round(performance.now() - started) };
}

function succeeded(result: PdfResult): PdfSuccess {
  if (!result.ok) throw new Error(`refused: ${result.reason}`);
  return result;
}

const sameBytes = (a: Uint8Array, b: Uint8Array): boolean => Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;

/** The time of the biggest case here is seconds; the limits leave room for a runner about 5 times slower (CLAUDE.md). */
const limitFor = (name: string, mode: CompressMode): number => 60_000 + (mode === 'strong' ? (oracle(name).pages ?? 1) * 1_000 : 0);

/** The pages of a Strong output: one picture each, no text, the size of the page as shown, no turn left. */
async function expectPicturePages(name: string, out: Uint8Array): Promise<void> {
  const read = await readWithPdfjs(out);
  const expected = oracle(name);
  expect(read.pages, `${name}: pages`).toHaveLength(expected.pages ?? 0);
  expect(pdfTextLines(out), `${name}: no text operator (Tj, TJ) in any content stream`).toEqual([]);
  for (const [i, page] of read.pages.entries()) {
    const [w = 0, h = 0] = expected.sizes?.[i] ?? [];
    const turned = (expected.rotate?.[i] ?? 0) % 180 !== 0;
    expect(page.images, `${name} page ${i + 1}: one picture`).toBe(1);
    expect(page.texts, `${name} page ${i + 1}: nothing to select`).toEqual([]);
    expect(page.rotate, `${name} page ${i + 1}: the turn is in the picture`).toBe(0);
    expect(page.shown.width, `${name} page ${i + 1}: width as shown`).toBeCloseTo(turned ? h : w, 1);
    expect(page.shown.height, `${name} page ${i + 1}: height as shown`).toBeCloseTo(turned ? w : h, 1);
  }
}

for (const mode of MODES) {
  describe(`Compress PDF, ${mode}`, () => {
    for (const name of ACCEPTED) {
      it(
        name,
        async () => {
          const original = fixture(name);
          const { result, ms } = await compress(name, mode);
          const done = succeeded(result);
          expect(done.outputs).toHaveLength(1);
          const out = done.outputs[0]?.bytes as Uint8Array;
          expect(done.outputs[0]?.kind).toBe('pdf');

          // Never bigger; when nothing gained, the original itself.
          expect(out.length, `${name} ${mode}: never bigger`).toBeLessThanOrEqual(original.length);
          if (name === 'gen-ja-otimizado.pdf') expect(done.outcome, `${name} ${mode}: nothing left to gain`).toBe('unchanged');
          let score: number | null = null;
          if (done.outcome === 'unchanged') {
            expect(sameBytes(out, original), `${name} ${mode}: the original, byte for byte`).toBe(true);
            if (mode === 'recommended') score = Infinity;
          } else {
            expect(out.length, `${name} ${mode}: smaller when it says it is new`).toBeLessThan(original.length);
            const check = await qpdfCheck(out);
            expect(check.code, `${name} ${mode}: qpdf --check ${check.out.join(' | ')}`).toBe(0);
            const pages = await qpdf(['--show-npages', '/in/file.pdf'], { 'file.pdf': out });
            expect(pages.out, `${name} ${mode}: page count`).toEqual([String(oracle(name).pages)]);
            if (mode === 'strong') await expectPicturePages(name, out);
            if (mode === 'recommended') {
              const before = await drawWithPdfjs(original, 1, PSNR_SCALE);
              const after = await drawWithPdfjs(out, 1, PSNR_SCALE);
              expect([after.width, after.height], `${name}: page 1 has the same size`).toEqual([before.width, before.height]);
              score = psnr(before, after);
              expect(score, `${name}: page 1 PSNR`).toBeGreaterThanOrEqual(PSNR_MIN_DB);
            }
          }
          if (mode === 'recommended' && name === 'gen-fotos.pdf') {
            expect(done.outcome, 'the photos get smaller').toBe('new');
            expect(out.length / original.length, 'at least 40% off the photos').toBeLessThan(PHOTOS_MAX_RATIO);
          }

          const row: Row = { mode, fixture: name, before: original.length, after: out.length, outcome: done.outcome, psnr: score, ms };
          rows.push(row);
          console.log(`[compress] ${mode.padEnd(11)} ${name.padEnd(42)} before=${row.before} after=${row.after} ratio=${ratio(row)} ${row.outcome} psnr=${dB(row.psnr) || '-'} ${row.ms} ms`);
        },
        limitFor(name, mode),
      );
    }
  });
}

describe('what the table does not show', () => {
  it('Strong draws every page as it is shown: the turns, the CropBox and the MediaBox off the origin end up in the picture', async () => {
    // On this file Strong gives the original back (the pictures are bigger than the text), so the pages it would have built are
    // built here with the same pieces (the renderer and imagesToPdf) to read what they look like.
    const name = 'gen-paginas-mistas.pdf';
    const original = fixture(name);
    const renderer = await nodeRenderer()(original);
    let out: Uint8Array;
    try {
      const pages: RenderedPage[] = [];
      for (let index = 0; index < renderer.pages; index += 1) pages.push(await renderer.render(index, STRONG_PPI / 72, 'image/jpeg', STRONG_QUALITY));
      out = await imagesToPdf(null, pages);
    } finally {
      await renderer.close();
    }
    await expectPicturePages(name, out);
    const scores: number[] = [];
    for (let n = 1; n <= (oracle(name).pages ?? 0); n += 1) {
      const before = await drawWithPdfjs(original, n, PSNR_SCALE);
      const after = await drawWithPdfjs(out, n, PSNR_SCALE);
      expect([after.width, after.height], `page ${n}: the picture is the size of the page as shown`).toEqual([before.width, before.height]);
      scores.push(psnr(before, after));
      expect(scores.at(-1), `page ${n}: the right side up and the right part of the page`).toBeGreaterThanOrEqual(ORIENTATION_MIN_DB);
    }
    console.log(`[compress] strong pictures of ${name}: PSNR by page ${scores.map((score) => score.toFixed(1)).join(' ')} dB`);
  }, 60_000);

  it('the detector of text operators finds the text in the lossless output, so its silence on Strong means something', async () => {
    const done = succeeded((await compress('gen-paginas-mistas.pdf', 'lossless')).result);
    const lines = pdfTextLines(done.outputs[0]?.bytes as Uint8Array);
    expect(lines.filter((line) => /^Page \d$/.test(line))).toHaveLength(8);
  });

  for (const name of REFUSED) {
    it(`refuses ${name} in every mode with the reason of the oracle`, async () => {
      for (const mode of MODES) {
        const { result } = await compress(name, mode);
        expect(result, `${name} ${mode}`).toMatchObject({ ok: false, reason: oracle(name).expect });
      }
    });
  }
});

afterAll(() => {
  const sorted = [...rows].sort((a, b) => MODES.indexOf(a.mode) - MODES.indexOf(b.mode) || a.fixture.localeCompare(b.fixture));
  const table = [
    '| Mode | Fixture | Before (bytes) | After (bytes) | Ratio | Result | PSNR page 1, 100 ppi (dB) | Time (ms) |',
    '| --- | --- | ---: | ---: | ---: | --- | ---: | ---: |',
    ...sorted.map((row) => `| ${row.mode} | \`${row.fixture}\` | ${bytesFmt(row.before)} | ${bytesFmt(row.after)} | ${ratio(row)} | ${row.outcome === 'new' ? 'smaller' : 'original back'} | ${dB(row.psnr)} | ${bytesFmt(row.ms)} |`),
  ];
  console.log(`[compress] table (PSNR threshold ${PSNR_MIN_DB} dB)\n${table.map((line) => `[compress] ${line}`).join('\n')}`);
});
