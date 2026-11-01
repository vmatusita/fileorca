// node scripts/fixtures/pdf.ts: builds the derived PDF fixtures in fixtures/pdf/ (the gen-* files) and the oracle
// fixtures/pdf/expected.json (F5a, decision 3). Deterministic: pdf-lib with no dates and no Producer, the standard
// fonts (never embedded), photos from the F0 JPEGs through the jSquash MozJPEG and Lanczos builds, and every file that
// is a PDF passed through the qpdf WebAssembly with --deterministic-id (the encrypted ones with --static-id and
// --static-aes-iv, which qpdf offers for test files). Running it twice gives the same bytes on any machine. Not part of
// pnpm verificar: CI reads the committed files, and the SHA-256 in fixtures/ORIGEM.md are the truth.
//
// The oracle is written by readers that are not the FileOrca engine: PDF.js (the legacy build, in Node) for the pages,
// their sizes, rotation, markers, links, outline and form, and qpdf for --check and the encryption. It covers the four
// F0 files too. Nothing here asks src/engine/pdf/ anything.
//
//   node scripts/fixtures/pdf.ts           write the files and expected.json, print the ORIGEM rows
//   node scripts/fixtures/pdf.ts --check   build in memory and compare with the files on disk
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { PDFDocument, PDFName, PDFString, StandardFonts, degrees, rgb, type PDFArray, type PDFFont, type PDFPage, type PDFRef } from '@cantoo/pdf-lib';
import { qpdfCheck, qpdfEncryption, qpdfTransform } from '../lib/qpdf.ts';
import { decodeJpegNode, encodeJpegNode, resizeNode } from './lib/mozjpeg.ts';
import type { Rgba } from './lib/rgba.ts';

const DIR = fileURLToPath(new URL('../../fixtures/pdf/', import.meta.url));
const IMAGES = fileURLToPath(new URL('../../fixtures/images/', import.meta.url));
const SCRIPT = 'scripts/fixtures/pdf.ts';

/** The passwords of the encrypted fixtures (also in fixtures/ORIGEM.md). Test values, used nowhere else. */
export const PASSWORDS = {
  aes256: 'Orca-Open-256',
  aes256Owner: 'Orca-Owner-256',
  rc4: 'Orca-Open-128',
  rc4Owner: 'Orca-Owner-128',
  owner: 'Orca-Restrict-256',
} as const;

/** What qpdf does in the lossless mode of Compress PDF (the same options; gen-ja-otimizado is already through them). */
export const LOSSLESS = ['--object-streams=generate', '--compress-streams=y', '--recompress-flate', '--compression-level=9', '--remove-unreferenced-resources=yes'];

const FREE = 'uso livre, drewnoakes/metadata-extractor-images';
const NO_SOURCE = 'sem fonte externa, desenhado no script';

interface Output {
  name: string;
  bytes: Uint8Array;
  /** Column "Gerado de" of fixtures/ORIGEM.md. */
  from: string;
}

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const readImage = (name: string): Uint8Array => new Uint8Array(readFileSync(join(IMAGES, name)));

// ---- drawing ------------------------------------------------------------------------------------------------

/** Points of the sheets. */
const LETTER: [number, number] = [612, 792];
const A4: [number, number] = [595.28, 841.89];

/**
 * Draws `text` so that it reads upright on screen, at (vx, vy) measured from the bottom left of the page as shown
 * (the CropBox turned by /Rotate). The mapping is written here on its own: the fixtures do not use the engine.
 */
function drawUpright(page: PDFPage, text: string, vx: number, vy: number, size: number, font: PDFFont): void {
  const box = page.getCropBox();
  const turn = ((page.getRotation().angle % 360) + 360) % 360;
  const { x: x0, y: y0, width: w, height: h } = box;
  const map: Record<number, [number, number, number]> = {
    0: [x0 + vx, y0 + vy, 0],
    90: [x0 + w - vy, y0 + vx, 90],
    180: [x0 + w - vx, y0 + h - vy, 180],
    270: [x0 + vy, y0 + h - vx, 270],
  };
  const [x, y, angle] = map[turn] ?? map[0] as [number, number, number];
  page.drawText(text, { x, y, size, font, rotate: degrees(angle), color: rgb(0, 0, 0) });
}

/** Width and height of the page as shown. */
function shown(page: PDFPage): [number, number] {
  const box = page.getCropBox();
  const turn = ((page.getRotation().angle % 360) + 360) % 360;
  return turn === 90 || turn === 270 ? [box.height, box.width] : [box.width, box.height];
}

const PARAGRAPH = [
  'This page belongs to a test file of FileOrca. It holds plain text in a standard font,',
  'so a reader can find the marker above and tell the order of the pages after a tool runs.',
  'Nothing on it comes from a person: the words were written for the test, in the script.',
];

/** "Page N" near the top of the page as shown, and a short paragraph under it. */
function markPage(page: PDFPage, n: number, bold: PDFFont, regular: PDFFont, paragraph = true): void {
  const [, height] = shown(page);
  drawUpright(page, `Page ${n}`, 54, height - 96, 36, bold);
  if (paragraph) PARAGRAPH.forEach((line, i) => drawUpright(page, line, 54, height - 140 - i * 16, 11, regular));
}

async function fonts(doc: PDFDocument): Promise<{ bold: PDFFont; regular: PDFFont }> {
  return { bold: await doc.embedFont(StandardFonts.HelveticaBold), regular: await doc.embedFont(StandardFonts.Helvetica) };
}

/** pdf-lib with nothing of the machine in it: no Producer, no Creator, no dates. */
const create = (): Promise<PDFDocument> => PDFDocument.create({ updateMetadata: false });
const save = (doc: PDFDocument): Promise<Uint8Array> => doc.save({ useObjectStreams: false });

/** qpdf's normal form with an /ID computed from the content, the way every PDF fixture is written. */
async function normal(bytes: Uint8Array, extra: readonly string[] = []): Promise<Uint8Array> {
  const run = await qpdfTransform(bytes, ['--deterministic-id', ...extra]);
  if (run.code !== 0 || !run.bytes) throw new Error(`qpdf failed: ${run.out.join(' | ')}`);
  return run.bytes;
}

/**
 * qpdf with --static-id and --static-aes-iv, as its manual offers for test files. AES-256 (R6) also draws a random
 * file key, which no option fixes: while the fixture is written, the random source the glue reads
 * (crypto.getRandomValues, looked up on every call) gives a fixed stream from a SHA-256 counter, so the key is the
 * same on every run. Only this generator does that; the site's Protect PDF draws real random bytes.
 */
async function encrypt(bytes: Uint8Array, options: readonly string[], before: readonly string[] = []): Promise<Uint8Array> {
  const real = Object.getOwnPropertyDescriptor(globalThis.crypto, 'getRandomValues');
  let counter = 0;
  const fixed = <T extends ArrayBufferView | null>(array: T): T => {
    if (!array) return array;
    const out = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    for (let i = 0; i < out.length; i += 32) out.set(createHash('sha256').update(`fileorca-fixture-${counter++}`).digest().subarray(0, Math.min(32, out.length - i)), i);
    return array;
  };
  Object.defineProperty(globalThis.crypto, 'getRandomValues', { value: fixed, configurable: true, writable: true });
  try {
    const run = await qpdfTransform(bytes, ['--static-id', '--static-aes-iv', ...before, '--encrypt', ...options, '--']);
    if (run.code !== 0 || !run.bytes) throw new Error(`qpdf --encrypt failed: ${run.out.join(' | ')}`);
    return run.bytes;
  } finally {
    if (real) Object.defineProperty(globalThis.crypto, 'getRandomValues', real);
    else delete (globalThis.crypto as { getRandomValues?: unknown }).getRandomValues;
  }
}

// ---- the files ----------------------------------------------------------------------------------------------

async function pages300(): Promise<Uint8Array> {
  const doc = await create();
  const { bold, regular } = await fonts(doc);
  for (let n = 1; n <= 300; n += 1) markPage(doc.addPage(LETTER), n, bold, regular);
  return normal(await save(doc));
}

/** Letter, A4, a landscape sheet, /Rotate 90, 180 and 270, a CropBox moved off the MediaBox and a MediaBox off zero. */
async function mixedPages(): Promise<Uint8Array> {
  const doc = await create();
  const { bold, regular } = await fonts(doc);
  const add = (size: [number, number], setup?: (page: PDFPage) => void): PDFPage => {
    const page = doc.addPage(size);
    setup?.(page);
    return page;
  };
  const list = [
    add(LETTER),
    add(A4),
    add([LETTER[1], LETTER[0]]),
    add(LETTER, (page) => page.setRotation(degrees(90))),
    add(A4, (page) => page.setRotation(degrees(270))),
    add(LETTER, (page) => page.setRotation(degrees(180))),
    add(LETTER, (page) => page.setCropBox(72, 108, 432, 576)),
    add(A4, (page) => {
      page.setMediaBox(-200, -150, A4[0], A4[1]);
      page.setCropBox(-120, -90, 500, 700);
      page.setRotation(degrees(90));
    }),
  ];
  list.forEach((page, i) => markPage(page, i + 1, bold, regular));
  return normal(await save(doc));
}

/** Text only, already through the lossless options of Compress PDF: there is nothing left for it to gain. */
async function alreadyOptimized(): Promise<Uint8Array> {
  const doc = await create();
  const { bold, regular } = await fonts(doc);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  for (let n = 1; n <= 12; n += 1) {
    const page = doc.addPage(LETTER);
    markPage(page, n, bold, regular, false);
    for (let line = 0; line < 36; line += 1) {
      page.drawText(`Line ${line + 1} of page ${n}. ${PARAGRAPH[line % PARAGRAPH.length]}`, { x: 54, y: 640 - line * 16, size: 10, font: serif });
    }
  }
  return normal(await save(doc), LOSSLESS);
}

/** Photos the Recommended mode can make lighter: three colour JPEGs and one grey JPEG of the F0 photos, one per page. */
async function photos(): Promise<Uint8Array> {
  const doc = await create();
  const { bold, regular } = await fonts(doc);
  const sources = ['jpg-02-iphone6-paisagem-gps.jpg', 'jpg-01-pixel2-retrato-gps.jpg', 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg'];
  const longSide = 2000;
  const fitted = async (name: string): Promise<Rgba> => {
    const image = await decodeJpegNode(readImage(name), true);
    const k = longSide / Math.max(image.width, image.height);
    return resizeNode(image, Math.round(image.width * k), Math.round(image.height * k));
  };
  const place = async (jpeg: Uint8Array, n: number): Promise<void> => {
    const embedded = await doc.embedJpg(jpeg);
    const wide = embedded.width > embedded.height;
    const page = doc.addPage(wide ? [LETTER[1], LETTER[0]] : LETTER);
    const [pw, ph] = [page.getWidth(), page.getHeight()];
    const k = Math.min((pw - 72) / embedded.width, (ph - 144) / embedded.height);
    page.drawImage(embedded, { x: (pw - embedded.width * k) / 2, y: 36, width: embedded.width * k, height: embedded.height * k });
    markPage(page, n, bold, regular, false);
  };
  let n = 1;
  for (const name of sources) await place(await encodeJpegNode(await fitted(name), 92), n++);
  // Grey: the luma of the first photo, written as a one-component JPEG (/DeviceGray in the PDF).
  const grey = await fitted(sources[0] as string);
  for (let i = 0; i < grey.data.length; i += 4) {
    const y = Math.round(0.299 * (grey.data[i] as number) + 0.587 * (grey.data[i + 1] as number) + 0.114 * (grey.data[i + 2] as number));
    grey.data[i] = y;
    grey.data[i + 1] = y;
    grey.data[i + 2] = y;
  }
  const half = await resizeNode(grey, Math.round(grey.width * 0.8), Math.round(grey.height * 0.8));
  await place(await encodeJpegNode(half, 92, { gray: true }), n);
  return normal(await save(doc));
}

/** Three pages with markers: the source of the encrypted fixtures. */
async function small(): Promise<Uint8Array> {
  const doc = await create();
  const { bold, regular } = await fonts(doc);
  for (let n = 1; n <= 3; n += 1) markPage(doc.addPage(LETTER), n, bold, regular);
  return normal(await save(doc));
}

/** Host of every address in gen-acoes.pdf: no request may ever go there (the .invalid TLD never resolves). */
export const ACTIONS_HOST = 'actions.fileorca.invalid';

/**
 * Actions a PDF can carry: JavaScript at open (alert and a form submit), a Launch action, a link to a web address,
 * a link to the second page and JavaScript when page 2 opens. The tools must run none of them (decision 4).
 */
async function actions(): Promise<Uint8Array> {
  const doc = await create();
  const { bold, regular } = await fonts(doc);
  const [first, second] = [doc.addPage(LETTER), doc.addPage(LETTER)];
  markPage(first, 1, bold, regular);
  markPage(second, 2, bold, regular);
  const { context } = doc;
  const js = (code: string) => context.obj({ S: 'JavaScript', JS: PDFString.of(code) });
  const alert = `app.alert("FileOrca sentinel: a PDF script ran"); this.submitForm("https://${ACTIONS_HOST}/submit"); app.launchURL("https://${ACTIONS_HOST}/open", true);`;
  doc.catalog.set(PDFName.of('OpenAction'), context.register(js(alert)));
  const names = context.obj({ Names: [PDFString.of('fileorca-sentinel'), context.register(js('app.alert("FileOrca sentinel: document script");'))] });
  doc.catalog.set(PDFName.of('Names'), context.obj({ JavaScript: context.register(names) }));
  second.node.set(PDFName.of('AA'), context.obj({ O: context.register(js(`app.alert("FileOrca sentinel: page script"); app.launchURL("https://${ACTIONS_HOST}/page", true);`)) }));
  const link = (rect: [number, number, number, number], action: Record<string, unknown> | null, dest?: PDFArray): PDFRef =>
    context.register(
      context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: rect,
        Border: [0, 0, 1],
        ...(action ? { A: context.obj(action as never) } : {}),
        ...(dest ? { Dest: dest } : {}),
      }),
    );
  const label = (text: string, y: number) => first.drawText(text, { x: 54, y, size: 12, font: regular, color: rgb(0, 0, 0.6) });
  label('Launch a program (a Launch action)', 520);
  label(`Open https://${ACTIONS_HOST}/uri (a URI link)`, 490);
  label('Go to page 2 (a link annotation)', 460);
  const toSecond = context.obj([second.ref, PDFName.of('Fit')]);
  const annots = [
    link([50, 515, 400, 535], { S: 'Launch', F: PDFString.of('calc.exe'), NewWindow: true }),
    link([50, 485, 400, 505], { S: 'URI', URI: PDFString.of(`https://${ACTIONS_HOST}/uri`) }),
    link([50, 455, 400, 475], null, toSecond),
  ];
  first.node.set(PDFName.of('Annots'), context.obj(annots));
  return normal(await save(doc));
}

// ---- broken files -------------------------------------------------------------------------------------------

/** The xref table and startxref of a classic file overwritten with digits that point nowhere; the objects are whole. */
function brokenXref(bytes: Uint8Array): Uint8Array {
  const text = Buffer.from(bytes).toString('latin1');
  const xref = text.lastIndexOf('\nxref');
  const trailer = text.indexOf('trailer', xref);
  if (xref < 0 || trailer < 0) throw new Error('no classic xref to break');
  const table = text.slice(xref, trailer).replace(/\d{10} \d{5} n/g, (_entry, offset: number) => `${String(9_000_000_000 + offset).padStart(10, '0')} 00000 n`);
  const end = text.slice(trailer).replace(/startxref\s+\d+/, 'startxref\n999999');
  return new Uint8Array(Buffer.from(text.slice(0, xref) + table + end, 'latin1'));
}

/** The first half of the bytes: the end of the file, its xref and trailer, never arrived. */
const cutInHalf = (bytes: Uint8Array): Uint8Array => bytes.slice(0, Math.floor(bytes.length / 2));

async function smallJpeg(): Promise<Uint8Array> {
  const size = 96;
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      data[i] = (x * 255) / size;
      data[i + 1] = (y * 255) / size;
      data[i + 2] = 160;
      data[i + 3] = 255;
    }
  }
  return encodeJpegNode({ width: size, height: size, data }, 85);
}

// ---- build --------------------------------------------------------------------------------------------------

async function build(): Promise<Output[]> {
  const base = await small();
  // pdf-lib's classic layout, not qpdf's, for the broken ones: a plain xref table to break and a body to cut.
  const plainDoc = await create();
  const plainFonts = await fonts(plainDoc);
  for (let n = 1; n <= 3; n += 1) markPage(plainDoc.addPage(LETTER), n, plainFonts.bold, plainFonts.regular);
  const plain = await save(plainDoc);
  return [
    { name: 'gen-paginas-300.pdf', bytes: await pages300(), from: `${NO_SOURCE}: 300 páginas Letter, cada uma com o marcador "Page N" e um parágrafo em Helvetica` },
    {
      name: 'gen-paginas-mistas.pdf',
      bytes: await mixedPages(),
      from: `${NO_SOURCE}: 8 páginas (Letter, A4, Letter deitada, /Rotate 90, /Rotate 270, /Rotate 180, CropBox deslocada da MediaBox, MediaBox fora da origem com CropBox e /Rotate 90), cada uma com "Page N" de pé na tela`,
    },
    { name: 'gen-ja-otimizado.pdf', bytes: await alreadyOptimized(), from: `${NO_SOURCE}: 12 páginas só de texto (Helvetica e Times), passadas pelo qpdf com as opções do modo sem perda (${LOSSLESS.join(' ')})` },
    {
      name: 'gen-fotos.pdf',
      bytes: await photos(),
      from: `jpg-01, jpg-02 e jpg-03 (${FREE}): uma foto por página, 2000 px no lado maior, MozJPEG qualidade 92 (sem Exif nem GPS), e a jpg-02 em cinza a 1600 px num JPEG de um componente; "Page N" em cada página`,
    },
    {
      name: 'gen-cifrado-aes256.pdf',
      bytes: await encrypt(base, [`--user-password=${PASSWORDS.aes256}`, `--owner-password=${PASSWORDS.aes256Owner}`, '--bits=256']),
      from: `${NO_SOURCE}: 3 páginas com "Page N", senha de abrir \`${PASSWORDS.aes256}\` (dono \`${PASSWORDS.aes256Owner}\`), AES-256 (R6)`,
    },
    {
      name: 'gen-cifrado-rc4-128.pdf',
      bytes: await encrypt(base, [`--user-password=${PASSWORDS.rc4}`, `--owner-password=${PASSWORDS.rc4Owner}`, '--bits=128', '--use-aes=n'], ['--allow-weak-crypto']),
      from: `${NO_SOURCE}: 3 páginas com "Page N", senha de abrir \`${PASSWORDS.rc4}\` (dono \`${PASSWORDS.rc4Owner}\`), RC4 de 128 bits (R3, o legado)`,
    },
    {
      name: 'gen-cifrado-dono.pdf',
      bytes: await encrypt(base, ['--user-password=', `--owner-password=${PASSWORDS.owner}`, '--bits=256', '--print=none', '--modify=none', '--extract=n']),
      from: `${NO_SOURCE}: 3 páginas com "Page N", sem senha de abrir, só a de dono \`${PASSWORDS.owner}\`, com impressão, edição e cópia proibidas (AES-256, R6)`,
    },
    {
      name: 'gen-acoes.pdf',
      bytes: await actions(),
      from: `${NO_SOURCE}: 2 páginas com OpenAction em JavaScript (alerta, envio de formulário e abertura de endereço em ${ACTIONS_HOST}), JavaScript no /Names e ao abrir a página 2, uma ação Launch, um link URI e uma anotação de link para a página 2`,
    },
    { name: 'gen-xref-estragada.pdf', bytes: brokenXref(plain), from: `${NO_SOURCE}: 3 páginas com "Page N" (pdf-lib, xref clássica), com cada entrada da tabela xref e o startxref apontando para fora do arquivo` },
    { name: 'gen-cortado.pdf', bytes: cutInHalf(await pages300()), from: 'gen-paginas-300.pdf cortado na metade dos bytes: sem o fim das páginas, a xref, o trailer e o %%EOF' },
    { name: 'gen-vazio.pdf', bytes: new Uint8Array(0), from: 'arquivo vazio (0 bytes) com nome .pdf' },
    { name: 'gen-jpg-extensao-pdf.pdf', bytes: await smallJpeg(), from: `${NO_SOURCE}: JPEG de 96×96 (MozJPEG, sem metadados) com nome .pdf` },
    { name: 'gen-texto-extensao-pdf.pdf', bytes: new Uint8Array(Buffer.from('This is a plain text file with a .pdf name. It is not a PDF.\n', 'latin1')), from: 'texto puro com nome .pdf' },
  ];
}

// ---- the oracle ---------------------------------------------------------------------------------------------

export interface PdfOracleEntry {
  /**
   * What a tool that takes PDFs must do with it. 'repaired': PDF.js opens every page but qpdf --check cannot (the index of
   * the file is damaged, the objects are whole); 'truncated': PDF.js cannot open it.
   */
  expect: 'ok' | 'repaired' | 'empty' | 'not-pdf' | 'truncated' | 'needs-password' | 'restricted';
  bytes: number;
  /** PDF.js page count (with the password for the encrypted ones; null when PDF.js cannot open it). */
  pages: number | null;
  /** Width and height of each page as PDF.js shows it at /Rotate 0 (its `view`: the CropBox inside the MediaBox), in points, rounded to 0.01. */
  sizes: [number, number][] | null;
  /** /Rotate of each page, 0 to 270. */
  rotate: number[] | null;
  /** The "Page N" marker of each page (text read by PDF.js), or null for a page without one. */
  markers: (string | null)[] | null;
  /** Link annotations per page and the outline items at the first level. */
  links: number[] | null;
  outline: number;
  /** Widget annotations (form fields on the pages), and whether the catalog has an AcroForm and an XFA stream. */
  form: { widgets: number; acroForm: boolean; xfa: boolean };
  encryption: { password: string | null; R: number; method: string; restricted: boolean } | null;
  qpdf: { check: number; warnings: string[] };
}

const PDFJS = createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.mjs');

interface PdfJs {
  getDocument(options: Record<string, unknown>): { promise: Promise<PdfJsDocument>; destroy(): Promise<void> };
}
interface PdfJsDocument {
  numPages: number;
  getPage(n: number): Promise<{
    view: number[];
    rotate: number;
    getTextContent(): Promise<{ items: { str?: string }[] }>;
    getAnnotations(): Promise<{ subtype: string }[]>;
  }>;
  getOutline(): Promise<unknown[] | null>;
  getMetadata(): Promise<{ info: Record<string, unknown> }>;
}

const round = (n: number): number => Math.round(n * 100) / 100;

async function pdfjsRead(bytes: Uint8Array, password: string | null): Promise<Pick<PdfOracleEntry, 'pages' | 'sizes' | 'rotate' | 'markers' | 'links' | 'outline' | 'form'> | null> {
  const pdfjs = (await import(pathToFileURL(PDFJS).href)) as PdfJs;
  const task = pdfjs.getDocument({ data: bytes.slice(), verbosity: 0, disableFontFace: true, useSystemFonts: false, enableXfa: false, ...(password ? { password } : {}) });
  let doc: PdfJsDocument;
  try {
    doc = await task.promise;
  } catch {
    await task.destroy();
    return null;
  }
  const sizes: [number, number][] = [];
  const rotate: number[] = [];
  const markers: (string | null)[] = [];
  const links: number[] = [];
  let widgets = 0;
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = page.view;
    sizes.push([round(x1 - x0), round(y1 - y0)]);
    rotate.push(page.rotate);
    const text = (await page.getTextContent()).items.map((item) => item.str ?? '');
    markers.push(text.find((str) => /^Page \d+$/.test(str)) ?? null);
    const annotations = await page.getAnnotations();
    links.push(annotations.filter((a) => a.subtype === 'Link').length);
    widgets += annotations.filter((a) => a.subtype === 'Widget').length;
  }
  const outline = (await doc.getOutline())?.length ?? 0;
  const info = (await doc.getMetadata()).info;
  const result = { pages: doc.numPages, sizes, rotate, markers, links, outline, form: { widgets, acroForm: info['IsAcroFormPresent'] === true, xfa: info['IsXFAPresent'] === true } };
  await task.destroy();
  return result;
}

const PASSWORD_OF: Record<string, string> = {
  'gen-cifrado-aes256.pdf': PASSWORDS.aes256,
  'gen-cifrado-rc4-128.pdf': PASSWORDS.rc4,
};

async function oracleOf(name: string, bytes: Uint8Array): Promise<PdfOracleEntry> {
  const head = Buffer.from(bytes.subarray(0, 1024)).toString('latin1');
  const empty = { pages: null, sizes: null, rotate: null, markers: null, links: null, outline: 0, form: { widgets: 0, acroForm: false, xfa: false }, encryption: null };
  if (bytes.length === 0) return { expect: 'empty', bytes: 0, ...empty, qpdf: { check: 2, warnings: [] } };
  if (!head.includes('%PDF-')) return { expect: 'not-pdf', bytes: bytes.length, ...empty, qpdf: { check: 2, warnings: [] } };
  const password = PASSWORD_OF[name] ?? null;
  const check = await qpdfCheck(bytes, password ?? undefined);
  const warnings = check.out.filter((line) => /WARNING/.test(line)).map((line) => line.replace(/^.*?WARNING: \/in\/file\.pdf/, 'WARNING'));
  const shown = await qpdfEncryption(bytes, password ?? undefined);
  const lines = shown.out;
  const encrypted = !lines.some((line) => /File is not encrypted/.test(line)) && lines.some((line) => /^R = /.test(line));
  const needsPassword = (await qpdfEncryption(bytes)).out.some((line) => /invalid password/.test(line));
  const encryption = encrypted
    ? {
        password,
        R: Number(/^R = (\d+)/.exec(lines.find((line) => /^R = /.test(line)) ?? '')?.[1] ?? 0),
        method: /: (\S+)$/.exec(lines.find((line) => /stream encryption method/.test(line)) ?? '')?.[1] ?? 'RC4',
        restricted: lines.some((line) => /: not allowed$/.test(line)),
      }
    : null;
  const read = await pdfjsRead(bytes, password);
  const expect: PdfOracleEntry['expect'] = needsPassword
    ? 'needs-password'
    : encryption?.restricted
      ? 'restricted'
      : read === null || read.pages === 0
        ? 'truncated'
        : check.code === 2
          ? 'repaired'
          : 'ok';
  return { expect, bytes: bytes.length, ...(read ?? { pages: null, sizes: null, rotate: null, markers: null, links: null, outline: 0, form: { widgets: 0, acroForm: false, xfa: false } }), encryption, qpdf: { check: check.code, warnings } };
}

async function oracle(files: Map<string, Uint8Array>): Promise<string> {
  const out: Record<string, PdfOracleEntry> = {};
  for (const name of [...files.keys()].sort()) out[name] = await oracleOf(name, files.get(name) as Uint8Array);
  const note = 'Written by scripts/fixtures/pdf.ts from PDF.js (legacy build, in Node) and the qpdf WebAssembly: never from src/engine/pdf/.';
  return `${JSON.stringify({ note, passwords: PASSWORDS, files: out }, null, 2)}\n`;
}

// ---- main ---------------------------------------------------------------------------------------------------

export async function generatePdfFixtures(check: boolean): Promise<void> {
  const outputs = await build();
  const files = new Map<string, Uint8Array>();
  for (const name of readdirSync(DIR).filter((file) => file.endsWith('.pdf') && !file.startsWith('gen-'))) files.set(name, new Uint8Array(readFileSync(join(DIR, name))));
  for (const output of outputs) files.set(output.name, output.bytes);
  const expected = await oracle(files);
  const problems: string[] = [];
  for (const output of outputs) {
    const path = join(DIR, output.name);
    if (check) {
      if (!existsSync(path)) problems.push(`${output.name}: missing`);
      else if (sha256(new Uint8Array(readFileSync(path))) !== sha256(output.bytes)) problems.push(`${output.name}: differs from the generated bytes`);
    } else writeFileSync(path, output.bytes);
  }
  const expectedPath = join(DIR, 'expected.json');
  if (check) {
    if (!existsSync(expectedPath) || readFileSync(expectedPath, 'utf8') !== expected) problems.push('expected.json: differs from the oracle');
  } else writeFileSync(expectedPath, expected);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
    return;
  }
  const total = [...files.values()].reduce((sum, bytes) => sum + bytes.length, 0);
  console.log(check ? 'PDF fixtures match the generator.' : 'PDF fixtures written.');
  console.log(`fixtures/pdf: ${(total / 1024 / 1024).toFixed(2)} MB in ${files.size} PDFs`);
  if (!check) {
    console.log('\nRows for fixtures/ORIGEM.md ("Gerados por script"):');
    for (const output of outputs) console.log(`| pdf/${output.name} | ${output.from} | ${SCRIPT} · sha256 ${sha256(output.bytes)} | F5a |`);
  }
}

if (import.meta.main) await generatePdfFixtures(process.argv.includes('--check'));
