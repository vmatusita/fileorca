// Organize PDF on the engine, in Node, before the island (F18, decision 6 of the prompt). Every fixture that Delete
// takes gets a deterministic plan that moves, turns and removes pages; the output is read back by PDF.js and qpdf
// (tests/e2e/lib/pdfjs-read.ts, scripts/lib/qpdf.ts), never by the engine, and compared with the oracle of
// fixtures/pdf/expected.json: the page count, the order (the text of each page), the final /Rotate and the box as
// shown, the notes, and qpdf --check. Links and bookmarks are followed to the page they lead to in the new file.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { processPdf } from '../../src/engine/pdf/process.ts';
import type { PdfNote, PdfOperation, PdfResult, PdfSuccess } from '../../src/engine/pdf/types.ts';
import { readWithPdfjs, type ReadPage, type ReadPdf } from '../e2e/lib/pdfjs-read.ts';
import { strictPdf } from '../e2e/lib/pdf.ts';
import { qpdfCheck } from '../../scripts/lib/qpdf.ts';
import { ORACLE, fixture, nodeRenderer, oracle, useNodeAssets } from './lib/pdf-engine.ts';

beforeAll(() => useNodeAssets());

type Plan = { index: number; turn: number }[];

const NAMES = Object.keys(ORACLE.files);
/** The fixtures Delete takes (the repaired one with a note): the same list Organize takes. */
const TAKEN = NAMES.filter((name) => ['ok', 'repaired'].includes(oracle(name).expect));
const NOT_TAKEN = NAMES.filter((name) => !TAKEN.includes(name));

const run = (op: PdfOperation, name: string): Promise<PdfResult> => processPdf(op, [fixture(name)], nodeRenderer());

function ok(result: PdfResult): PdfSuccess {
  if (!result.ok) throw new Error(`failed: ${result.reason}`);
  return result;
}

/** Strict structure, qpdf --check with no warning of its own, and PDF.js's reading of every page. */
async function sound(bytes: Uint8Array): Promise<ReadPdf> {
  expect((await strictPdf(bytes)).problems).toEqual([]);
  const check = await qpdfCheck(bytes);
  expect(check.code, check.out.join('\n')).toBe(0);
  return readWithPdfjs(bytes);
}

/**
 * The plan of each fixture: one page gets a turn; two pages, the second goes first with a turn and the first comes out;
 * three or more, the pages reversed, every third one of the file (the 2nd, 5th, 8th…) out, and a turn of
 * (position + 1) quarters, so every turn from 0 to 3 shows up.
 */
function planOf(count: number): Plan {
  if (count === 1) return [{ index: 0, turn: 1 }];
  if (count === 2) return [{ index: 1, turn: 1 }];
  const reversed = Array.from({ length: count }, (_, i) => count - 1 - i);
  return reversed.filter((index) => index % 3 !== 1).map((index, position) => ({ index, turn: (position + 1) % 4 }));
}

/** What tells one page from another: its "Page N" marker, or its images and the start of its text. */
const keyOf = (page: ReadPage): string => page.marker ?? `${page.images} images "${page.texts.map((text) => text.str).join(' ').slice(0, 60)}"`;

const NOTES: Partial<Record<string, PdfNote[]>> = {
  'gen-xref-estragada.pdf': ['repaired'],
  'pdf-formulario-irs-1040-2019.pdf': ['xfa-removed'],
};

describe('organize: every fixture Delete takes, with a plan that moves, turns and removes pages', () => {
  it('takes the same ten fixtures as Delete', () => {
    expect(TAKEN).toHaveLength(10);
  });

  for (const name of TAKEN) {
    it(`${name}: the count, the order, the /Rotate, the box as shown and the notes`, async () => {
      const entry = oracle(name);
      const count = entry.pages ?? 0;
      const plan = planOf(count);
      if (count >= 3) {
        expect(plan.length, 'some pages come out').toBeLessThan(count);
        expect(plan.map(({ index }) => index), 'the order moved').toEqual(plan.map(({ index }) => index).sort((a, b) => b - a));
      }
      const result = ok(await run({ kind: 'organize', pages: plan }, name));
      expect(result.outcome).toBe('new');
      expect(result.outputs).toHaveLength(1);
      const output = result.outputs[0];
      expect(output?.kind).toBe('pdf');
      expect(output?.pages).toBe(plan.length);
      const read = await sound(output?.bytes as Uint8Array);
      expect(read.pages).toHaveLength(plan.length);
      const before = await readWithPdfjs(fixture(name));
      expect(read.pages.map(keyOf), 'the order, by the text of each page').toEqual(plan.map(({ index }) => keyOf(before.pages[index] as ReadPage)));
      const rotate = entry.rotate ?? [];
      const sizes = entry.sizes ?? [];
      expect(read.pages.map((page) => page.rotate), 'the turn on top of the page’s own /Rotate').toEqual(plan.map(({ index, turn }) => ((rotate[index] ?? 0) + 90 * turn) % 360));
      read.pages.forEach((page, position) => {
        const { index } = plan[position] as Plan[number];
        const [width, height] = sizes[index] ?? [0, 0];
        const sideways = page.rotate % 180 === 90;
        expect(page.shown.width, `${name} position ${position + 1}: width as shown`).toBeCloseTo(sideways ? height : width, 1);
        expect(page.shown.height, `${name} position ${position + 1}: height as shown`).toBeCloseTo(sideways ? width : height, 1);
      });
      expect([...result.notes].sort()).toEqual(NOTES[name] ?? []);
    }, 90_000);
  }
});

// ---- links and bookmarks lead to the page in its new place --------------------------------------------------------

interface Destinations {
  /** For each page, the page indices its links lead to. */
  links: number[][];
  /** The first-level bookmarks: title and the page index they lead to (null when they lead nowhere). */
  outline: { title: string; page: number | null }[];
}

interface PdfJsRef {
  num: number;
  gen: number;
}
interface PdfJsDoc {
  numPages: number;
  getPage(n: number): Promise<{ getAnnotations(): Promise<{ subtype: string; dest?: unknown }[]> }>;
  getOutline(): Promise<{ title: string; dest: unknown }[] | null>;
  getDestination(name: string): Promise<unknown[] | null>;
  getPageIndex(ref: PdfJsRef): Promise<number>;
}

const PDFJS = createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.mjs');

/** Follows every internal link and first-level bookmark of a file to its page, with PDF.js (not the engine). */
async function destinations(bytes: Uint8Array): Promise<Destinations> {
  const lib = (await import(pathToFileURL(PDFJS).href)) as { getDocument(options: Record<string, unknown>): { promise: Promise<PdfJsDoc>; destroy(): Promise<void> } };
  const task = lib.getDocument({ data: new Uint8Array(bytes), verbosity: 0 });
  try {
    const doc = await task.promise;
    const pageOf = async (dest: unknown): Promise<number | null> => {
      const explicit = typeof dest === 'string' ? await doc.getDestination(dest) : dest;
      const target = Array.isArray(explicit) ? explicit[0] : null;
      if (typeof target === 'number') return target;
      if (target && typeof target === 'object' && 'num' in target) return doc.getPageIndex(target as PdfJsRef);
      return null;
    };
    const links: number[][] = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const annotations = await (await doc.getPage(n)).getAnnotations();
      const pages: number[] = [];
      for (const annotation of annotations) {
        if (annotation.subtype !== 'Link' || annotation.dest === undefined || annotation.dest === null) continue;
        const page = await pageOf(annotation.dest);
        if (page !== null) pages.push(page);
      }
      links.push(pages);
    }
    const outline: Destinations['outline'] = [];
    for (const item of (await doc.getOutline()) ?? []) outline.push({ title: item.title, page: await pageOf(item.dest) });
    return { links, outline };
  } finally {
    await task.destroy();
  }
}

describe('organize: what goes with the pages', () => {
  it('a link to another page still leads to that page in its new place', async () => {
    const before = await destinations(fixture('gen-acoes.pdf'));
    expect(before.links, 'gen-acoes: page 1 links to page 2').toEqual([[1], []]);
    const swapped = ok(await run({ kind: 'organize', pages: [{ index: 1, turn: 0 }, { index: 0, turn: 3 }] }, 'gen-acoes.pdf'));
    const after = await destinations(swapped.outputs[0]?.bytes as Uint8Array);
    expect(after.links, 'the old page 1 is now page 2 and still links to the old page 2, now page 1').toEqual([[], [0]]);
    const alone = ok(await run({ kind: 'organize', pages: [{ index: 0, turn: 0 }] }, 'gen-acoes.pdf'));
    expect((await destinations(alone.outputs[0]?.bytes as Uint8Array)).links, 'a link to a page that came out goes').toEqual([[]]);
  });

  it('the bookmarks of the 117-page notes lead to their pages in the new order, and the ones of pages that came out go', async () => {
    const name = 'pdf-grande-fontes-embutidas-117p.pdf';
    const before = await destinations(fixture(name));
    expect(before.outline).toHaveLength(oracle(name).outline);
    const plan = planOf(117);
    const result = ok(await run({ kind: 'organize', pages: plan }, name));
    const after = await destinations(result.outputs[0]?.bytes as Uint8Array);
    const positionOf = new Map(plan.map(({ index }, position) => [index, position]));
    const kept = before.outline.filter((item) => item.page !== null && positionOf.has(item.page));
    expect(kept.length, 'some bookmarks lead to pages that stay').toBeGreaterThan(0);
    for (const item of kept) {
      const found = after.outline.find((mark) => mark.title === item.title);
      expect(found?.page, `"${item.title}" leads to the old page ${(item.page ?? 0) + 1} in its new place`).toBe(positionOf.get(item.page as number));
    }
    for (const mark of after.outline) {
      if (mark.page === null) continue;
      const old = before.outline.find((item) => item.title === mark.title);
      expect(old && old.page !== null && positionOf.get(old.page), `"${mark.title}"`).toBe(mark.page);
    }
  }, 90_000);

  it('the IRS form keeps the fields of the pages that stay, in their new order, and drops the XFA layer', async () => {
    const name = 'pdf-formulario-irs-1040-2019.pdf';
    const before = await readWithPdfjs(fixture(name));
    const swapped = ok(await run({ kind: 'organize', pages: [{ index: 1, turn: 2 }, { index: 0, turn: 0 }] }, name));
    const read = await sound(swapped.outputs[0]?.bytes as Uint8Array);
    expect(read.pages.map((page) => page.widgets)).toEqual([before.pages[1]?.widgets, before.pages[0]?.widgets]);
    expect(read.pages.reduce((sum, page) => sum + page.widgets, 0)).toBe(oracle(name).form.widgets);
    expect(read.acroForm).toBe(true);
    expect(read.xfa).toBe(false);
    expect(swapped.notes).toEqual(['xfa-removed']);
    const one = ok(await run({ kind: 'organize', pages: [{ index: 1, turn: 1 }] }, name));
    const alone = await sound(one.outputs[0]?.bytes as Uint8Array);
    expect(alone.pages.map((page) => page.widgets)).toEqual([before.pages[1]?.widgets]);
    expect(alone.pages[0]?.rotate).toBe(90);
  }, 60_000);

  it('what only the removed pages used is left out: one page of 300 is small', async () => {
    const result = ok(await run({ kind: 'organize', pages: [{ index: 149, turn: 1 }] }, 'gen-paginas-300.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    expect(read.pages.map((page) => [page.marker, page.rotate])).toEqual([['Page 150', 90]]);
    expect(result.outputs[0]?.bytes.length ?? 0).toBeLessThan(8_000);
  });
});

describe('organize: the list the engine is given', () => {
  it('leaves out an index out of the file and an index named twice (the first one counts); a turn counts modulo 4', async () => {
    const pages = [
      { index: 99, turn: 1 },
      { index: 2, turn: 1 },
      { index: -1, turn: 0 },
      { index: 2, turn: 3 },
      { index: 1.5, turn: 0 },
      { index: 0, turn: 5 },
      { index: 6, turn: -1 },
      { index: 7, turn: 0.5 },
    ];
    const result = ok(await run({ kind: 'organize', pages }, 'gen-paginas-mistas.pdf'));
    const read = await sound(result.outputs[0]?.bytes as Uint8Array);
    const rotate = oracle('gen-paginas-mistas.pdf').rotate ?? [];
    expect(read.pages.map((page) => page.marker)).toEqual(['Page 3', 'Page 1', 'Page 7', 'Page 8']);
    expect(read.pages.map((page) => page.rotate)).toEqual([
      ((rotate[2] ?? 0) + 90) % 360,
      ((rotate[0] ?? 0) + 90) % 360,
      ((rotate[6] ?? 0) + 270) % 360,
      // A turn that is not a whole number is no turn.
      rotate[7] ?? 0,
    ]);
  });

  it('the same order with no turn gives every page as it was', async () => {
    const pages = Array.from({ length: 8 }, (_, index) => ({ index, turn: 0 }));
    const read = await sound(ok(await run({ kind: 'organize', pages }, 'gen-paginas-mistas.pdf')).outputs[0]?.bytes as Uint8Array);
    expect(read.pages.map((page) => [page.marker, page.rotate])).toEqual((oracle('gen-paginas-mistas.pdf').rotate ?? []).map((turn, i) => [`Page ${i + 1}`, turn]));
  });

  it('an empty list, or one where every page comes out, is "encode" (the island never sends it)', async () => {
    expect(await run({ kind: 'organize', pages: [] }, 'gen-paginas-mistas.pdf')).toMatchObject({ ok: false, reason: 'encode' });
    expect(await run({ kind: 'organize', pages: [{ index: 8, turn: 0 }, { index: -2, turn: 1 }] }, 'gen-paginas-mistas.pdf')).toMatchObject({ ok: false, reason: 'encode' });
  });

  for (const name of NOT_TAKEN) {
    it(`${name} is refused as "${oracle(name).expect}", the reason Delete gives`, async () => {
      const organize = await run({ kind: 'organize', pages: [{ index: 0, turn: 1 }] }, name);
      const remove = await run({ kind: 'delete', remove: [0] }, name);
      expect(organize).toMatchObject({ ok: false, reason: oracle(name).expect });
      expect(organize).toEqual(remove);
    });
  }
});
