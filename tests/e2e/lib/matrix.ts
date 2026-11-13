// Shared parts of the fixture matrix (tests/e2e/image-matrix.spec.ts): the oracle, the batches, one
// generic run of a tool page over a batch, and the checks that every output goes through. A tool page
// gets its whole batch in ONE upload and every output is read from the ZIP (or the PDF) in Node, so a
// test costs one page load and one pass of the engine, which is what keeps the CI under its time budget.
//
// Where the numbers come from: the sizes, the formats and the "has GPS" flags come from the oracle
// (fixtures/images/expected.json, written by hand); the options of each tool say what to do with them.
// Nothing here asks the engine what it should have produced.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { expect, type Download, type Locator, type Page } from '@playwright/test';
import { parseBmff } from './bmff.ts';
import { imageSize, metadataReport, sniff, type Format, type MetadataReport } from './images.ts';
import { exifBlock, tiffOrientation, withOrientation } from './jpeg.ts';
import { dataLayer, dismissCookies, hydrated, type TestFile } from './page.ts';
import { parsePdf, strictPdf, type PdfImage } from './pdf.ts';
import { meanAbsDiff, orientGrid, thumbnail, type Thumbnail } from './pixels.ts';
import { webpInfo } from './webp.ts';
import { readZip } from './zip.ts';

// ---- the oracle and the fixtures --------------------------------------------------------------------------

export interface OracleEntry {
  format: Format;
  displayWidth: number | null;
  displayHeight: number | null;
  storedWidth: number | null;
  storedHeight: number | null;
  orientation: number;
  hasGps: boolean;
  gpsKind: string;
  hasAlpha: boolean;
  imageCount: number;
  expect: 'ok' | 'empty' | 'unsupported' | 'truncated' | 'decode';
  animated?: boolean;
  frameCount?: number;
}

const DIR = 'fixtures/images';
export const ORACLE: Record<string, OracleEntry> = (JSON.parse(readFileSync(`${DIR}/expected.json`, 'utf8')) as { files: Record<string, OracleEntry> }).files;

/** The fixtures that are not images the tools can read, whatever the format of the tool. */
export const BROKEN = ['gen-jpg-corrompido.jpg', 'gen-jpg-truncado.jpg', 'gen-vazio.jpg', 'gen-texto-extensao-png.png'] as const;

const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', avif: 'image/avif' };

export function fixtureBytes(name: string): Buffer {
  return readFileSync(resolve(DIR, name));
}

/** As a browser would hand it over: the type comes from the NAME, which is why some of them lie. */
export function fixtureFile(name: string): TestFile {
  return { name: basename(name), mimeType: MIME[name.split('.').pop() ?? ''] ?? 'application/octet-stream', buffer: fixtureBytes(name) };
}

export function oracle(name: string): OracleEntry {
  const entry = ORACLE[name];
  if (!entry) throw new Error(`${name} is not in expected.json`);
  return entry;
}

/** Good fixtures of these real formats, in the order of expected.json. */
export function fixturesOf(...formats: Format[]): string[] {
  return Object.keys(ORACLE).filter((name) => ORACLE[name]?.expect === 'ok' && formats.includes((ORACLE[name] as OracleEntry).format));
}

/** The accepted fixtures with the refused ones together in the middle: the batch of a matrix test. */
export function batchOf(accepted: readonly string[], refused: readonly string[]): string[] {
  const middle = Math.ceil(accepted.length / 2);
  return [...accepted.slice(0, middle), ...refused, ...accepted.slice(middle)];
}

export const baseOf = (name: string): string => name.replace(/\.[^.]+$/, '');
// F17 (decision 10): Convert to WebP writes AVIF too, so an output may be an AVIF again (as in the F2 draft, 840d565^).
export const EXT: Record<string, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };

// ---- what a test expects of each fixture ----------------------------------------------------------------------

export type OutFormat = 'jpeg' | 'png' | 'webp' | 'avif';

/** Compare the output to the picture of a fixture (see pixels.ts for how the reference is built). */
export interface PixelCheck {
  /** Fixture whose STORED pixels, turned by its own Orientation, are the picture. */
  from: string;
  /** Orientation the tool applies on top of it (6 = Rotate right 90°), 1 for none. */
  after?: number;
  /** Part of the picture the output should show, as fractions of the display size [x, y, w, h]. */
  box?: [number, number, number, number];
  /** Largest mean difference of the 24 x 24 grey grids. */
  limit: number;
}

export interface Expect {
  name: string;
  format: OutFormat;
  width: number;
  height: number;
  /** The output must be smaller than the file that went in. */
  smaller?: boolean;
  /** The output must not be bigger than the file that went in. */
  notBigger?: boolean;
  /** Transparency stays: the four corners of the picture are transparent. */
  alpha?: 'kept';
  /** Transparency is painted white: the corners are opaque white. */
  flatten?: boolean;
  /** The picture on screen, compared by pixels. */
  pixels?: PixelCheck;
  /** The output is a still image though the source was an animation. */
  still?: boolean;
  /** The output is still the two-frame animation (an animated WebP that Compress hands back clean). */
  animated?: boolean;
  /** Some other judgement on the first-frame picture: mostly red (the animated WebP starts on red). */
  mostlyRed?: boolean;
  /** The Orientation tag may stay when the original goes back unchanged (a rotated JPEG that did not shrink). */
  tagMayStay?: boolean;
  /**
   * F18 (Remove EXIF data, decision 10): the picture is the one that went in. The bytes of the image equal the fixture's
   * (`imageBytes`, in Node), every decoded pixel equals the fixture's (`pixelHash`, in this browser), and the Orientation
   * is the fixture's own, alone in its block (a JPG with none has no Exif at all).
   */
  sameImage?: boolean;
}

export type Refusal = 'wrong-tool' | 'unsupported' | 'truncated' | 'decode' | 'empty';

export interface Refuse {
  refuse: Refusal;
  /** Link the row offers (HEIC and AVIF go to their converters, F17): where it goes, how it is named, and the whole line, word for word. */
  link?: ConverterLink;
  /** A good file of a format with no converter: the whole line, which names what the tool takes, and no link in the row. */
  plain?: RegExp;
}

export type Outcome = Expect | Refuse;
export const isRefusal = (outcome: Outcome): outcome is Refuse => 'refuse' in outcome;

/** The line each reason shows in the row of the file (src/tools/image/i18n/en.ts, errors). */
// F13a (D-06 and D-17; DECISOES § 468 and § 469): a name with an image extension over bytes that are no image
// hears that the two disagree ("ends in .png, but it isn't an image inside"), and a PNG on HEIC to JPG hears that it is a PNG.
// F17 (decision 7): an AVIF has a converter again, so its line is "is an AVIF file." (the article of English, never "an?").
const REASON_TEXT: Record<Refusal, RegExp> = {
  'wrong-tool': /is (a HEIC file\.|an AVIF file\.|in (JPG|PNG|WebP|GIF) format, which this tool doesn't take\.|a PNG, not a HEIC photo\.)/,
  unsupported: /isn't an image Oli can read\.|ends in \.\w+, but it isn't an image inside\./,
  truncated: /stops before its end/,
  decode: /is damaged/,
  empty: /is empty/,
};

/** What the dataLayer says about the same refusal: the closed values of tool_error. */
const REASON_EVENT: Record<Refusal, string> = { 'wrong-tool': 'wrong-tool', unsupported: 'unsupported', truncated: 'truncated', decode: 'decode', empty: 'empty' };

/** The refusal of a fixture that no tool can read, by what the oracle says it is. */
export function brokenRefusal(name: string): Refuse {
  const kind = oracle(name).expect;
  if (kind === 'empty') return { refuse: 'empty' };
  if (kind === 'unsupported') return { refuse: 'unsupported' };
  if (kind === 'truncated') return { refuse: 'truncated' };
  return { refuse: 'decode' };
}

export type Lang = 'en' | 'pt' | 'es';

export interface ConverterLink {
  href: string;
  name: string;
  /** The whole line of the row, file name included, as the page writes it. */
  line: string;
}

/**
 * F17 (decision 7; DECISOES § 708): the converter a refused HEIC or AVIF points to, in the language of the page, and the
 * line of the row word for word. English says "a HEIC file" and "an AVIF file"; the test holds the exact sentence, never
 * "an?" (the F2 matrix accepted "a AVIF"). The same sentences are agreed with the texts of the island
 * (src/tools/image/i18n/{en,pt,es}.ts, errors.wrongTool) and the paths with src/i18n/routes.ts.
 */
export function converterLink(format: 'heic' | 'avif', lang: Lang, name: string): ConverterLink {
  const links: Record<'heic' | 'avif', Record<Lang, ConverterLink>> = {
    heic: {
      en: { href: '/heic-to-jpg/', name: 'HEIC to JPG', line: `${name} is a HEIC file. Open it in HEIC to JPG.` },
      pt: { href: '/pt/heic-para-jpg/', name: 'HEIC para JPG', line: `${name} é um arquivo HEIC. Abra-o em HEIC para JPG.` },
      es: { href: '/es/heic-a-jpg/', name: 'HEIC a JPG', line: `${name} es un archivo HEIC. Ábrelo en HEIC a JPG.` },
    },
    avif: {
      en: { href: '/avif-to-jpg/', name: 'AVIF to JPG', line: `${name} is an AVIF file. Open it in AVIF to JPG.` },
      pt: { href: '/pt/avif-para-jpg/', name: 'AVIF para JPG', line: `${name} é um arquivo AVIF. Abra-o em AVIF para JPG.` },
      es: { href: '/es/avif-a-jpg/', name: 'AVIF a JPG', line: `${name} es un archivo AVIF. Ábrelo en AVIF a JPG.` },
    },
  };
  return links[format][lang];
}

/**
 * The row of a refused HEIC or AVIF: the line word for word, and the link to the converter, in the language of the page.
 * `.fo-file__err > span` holds only the line (the icon sits beside it), so its text is the sentence and nothing else.
 */
export async function expectConverterRow(page: Page, name: string, link: ConverterLink): Promise<void> {
  const row: Locator = page.locator('.fo-file[data-state="error"]', { has: page.getByText(name, { exact: true }) });
  await expect(row, `${name} has an error row`).toHaveCount(1);
  await expect(row.locator('.fo-file__err > span'), `${name}: the line of the row`).toHaveText(link.line);
  await expect(row.getByRole('link', { name: link.name, exact: true }), `${name}: the link to ${link.name}`).toHaveAttribute('href', link.href);
  await expect(row.locator('a'), `${name}: one link in the row`).toHaveCount(1);
}

/** How the line spells the format of the file it refuses. */
const FORMAT_NAME: Partial<Record<Format, string>> = { jpeg: 'JPG', png: 'PNG', webp: 'WebP', gif: 'GIF' };

/**
 * A good file of a format the tool does not take. HEIC and AVIF point to their converters (F17: AVIF to JPG is back,
 * DECISOES § 708). Every other format gets the line that names what the tool takes (`takes`, as the tool's panel says
 * it) and no link at all.
 */
export function wrongTool(name: string, takes: string): Refuse {
  const format = oracle(name).format;
  if (format === 'heic' || format === 'avif') return { refuse: 'wrong-tool', link: converterLink(format, 'en', name) };
  // F13a (D-17): HEIC to JPG says a PNG is a PNG and names the tool that makes a JPG of it; the row carries no link (the
  // chip to PNG to JPG is in the band under the rectangle, when the PNG is the one file).
  if (format === 'png' && takes === 'HEIC or HEIF') return { refuse: 'wrong-tool', plain: /is a PNG, not a HEIC photo\. To get a JPG from it, use PNG to JPG\./ };
  const spelled = FORMAT_NAME[format];
  if (!spelled) throw new Error(`no spelling for ${format}`);
  return { refuse: 'wrong-tool', plain: new RegExp(`is in ${spelled} format, which this tool doesn't take\\. Try ${takes}\\.`) };
}

export interface MatrixCase {
  /** Names the record file; unique. */
  id: string;
  /** The tool, as the table lists it. */
  tool: string;
  path: string;
  /** What the options were for this run, for the table. */
  options: string;
  /** Upload order (the refused files sit in the middle). */
  batch: readonly string[];
  /** Sets an option before the files go in. */
  setup?: (page: Page) => Promise<void>;
  /** One file out: the PDF of Image to PDF. */
  deliverable: 'files' | 'pdf';
  /** Phrases the result card must say beyond the line about the metadata every card has ("Transparent areas became white"). */
  says?: readonly string[];
  outcome: (fixture: string) => Outcome;
  /**
   * F17: the case reads or writes AVIF, so the page also learns whether this browser opens an AVIF by itself (the probe of
   * decodeInPage); an AVIF output must open only where one does, and the record and the table say which it was.
   */
  avif?: true;
  /** Files of the batch that are not fixtures (an output of an earlier step of the same test): name → path on disk. */
  paths?: Readonly<Record<string, string>>;
  /** A further step of the same test, on the same page, with what this batch delivered (F17: the AVIF with alpha goes on to AVIF to JPG). */
  then?: (page: Page, browser: string, outputs: OutFile[]) => Promise<void>;
}

// ---- requests -----------------------------------------------------------------------------------------------

export interface RequestLog {
  /** Every URL the page and its workers asked for. */
  urls: string[];
  /** Methods other than GET. */
  writes: string[];
  /** Requests to anywhere but the page's own origin (blob:, data: and about: stay in the browser). */
  outside(): string[];
}

export function watchRequests(page: Page): RequestLog {
  const log: RequestLog = {
    urls: [],
    writes: [],
    outside() {
      const own = new URL(page.url()).origin;
      return this.urls.filter((url) => !/^(blob|data|about):/.test(url) && new URL(url).origin !== own);
    },
  };
  page.on('request', (request) => {
    log.urls.push(request.url());
    if (request.method() !== 'GET') log.writes.push(`${request.method()} ${request.url()}`);
  });
  return log;
}

// ---- the page and the batch ----------------------------------------------------------------------------------

export async function openTool(page: Page, path: string): Promise<void> {
  // The serve-dist answers a path that is missing with the closest 404, which has no tool: the page must exist (F17,
  // decision 14: before this run /avif-to-jpg/ was such a 404).
  const response = await page.goto(path);
  expect(response?.status(), `${path} exists`).toBe(200);
  await hydrated(page);
  await dismissCookies(page);
}

/** The queue shows six rows; the rest wait behind "Show N more". */
export async function showAllRows(page: Page): Promise<void> {
  const more = page.getByRole('button', { name: /^Show \d+ more$/ });
  if (await more.count()) await more.click();
}

export interface Delivered {
  /** Name the browser saves it under. */
  name: string;
  bytes: Uint8Array;
}

/** Clicks the main Download and reads what was saved: no base64 through the protocol. */
export async function takeDownload(page: Page): Promise<Delivered> {
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.fo-btn--download').click()]);
  return { name: download.suggestedFilename(), bytes: new Uint8Array(readFileSync(await pathOf(download))) };
}

async function pathOf(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('the download has no file');
  return path;
}

export interface OutFile {
  name: string;
  bytes: Uint8Array;
}

/** One file out (a single result downloads as it is) or the entries of the ZIP. */
export function filesOf(delivered: Delivered): OutFile[] {
  return delivered.name.endsWith('.zip') ? readZip(delivered.bytes).map((entry) => ({ name: entry.name, bytes: entry.bytes })) : [{ name: delivered.name, bytes: delivered.bytes }];
}

// ---- decoding in the browser ---------------------------------------------------------------------------------

export interface Decoded {
  name: string;
  ok: boolean;
  width: number;
  height: number;
  /** Alpha of the four corners: top-left, top-right, bottom-left, bottom-right. */
  cornerAlpha: number[];
  error: string;
}

export interface DecodeReport {
  files: Decoded[];
  /** F17: this browser decodes an AVIF by itself (the AVIF fixture opens); undefined when the probe was not asked for. */
  avif?: boolean;
}

const FFLATE = resolve('node_modules/fflate/umd/index.js');

/**
 * Decodes what the Download link holds, in the page, without sending a byte through the protocol:
 * the page fetches its own blob, unpacks the ZIP with fflate and opens every entry as a bitmap.
 * F17 (the probe of the F2 draft, 840d565^): with `probeAvif`, the AVIF fixture is decoded too, to learn whether this
 * browser reads an AVIF at all (the WebKit of Playwright on Windows does not; the Linux one of the CI may), so an AVIF
 * output is required to open only where one can, and is checked by its bytes elsewhere.
 */
export async function decodeInPage(page: Page, options: { probeAvif?: boolean } = {}): Promise<DecodeReport> {
  if (!(await page.evaluate(() => 'fflate' in window))) await page.addScriptTag({ path: FFLATE });
  const probe = options.probeAvif ? fixtureBytes('gen-avif.avif').toString('base64') : '';
  return page.evaluate(async (avifBase64) => {
    const fflate = (window as unknown as { fflate: { unzipSync(zip: Uint8Array): Record<string, Uint8Array> } }).fflate;
    const link = document.querySelector<HTMLAnchorElement>('.fo-btn--download');
    if (!link) throw new Error('no download link');
    const data = new Uint8Array(await (await fetch(link.href)).arrayBuffer());
    const entries: [string, Uint8Array][] = data[0] === 0x50 && data[1] === 0x4b ? Object.entries(fflate.unzipSync(data)) : [[link.download, data]];
    const types: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const context = probe.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    const files: { name: string; ok: boolean; width: number; height: number; cornerAlpha: number[]; error: string }[] = [];
    for (const [name, bytes] of entries) {
      const type = types[name.split('.').pop() ?? ''];
      if (!type) continue;
      try {
        const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type }));
        const cornerAlpha: number[] = [];
        for (const [x, y] of [[0, 0], [bitmap.width - 1, 0], [0, bitmap.height - 1], [bitmap.width - 1, bitmap.height - 1]] as [number, number][]) {
          context.clearRect(0, 0, 1, 1);
          context.drawImage(bitmap, x, y, 1, 1, 0, 0, 1, 1);
          cornerAlpha.push(context.getImageData(0, 0, 1, 1).data[3] as number);
        }
        files.push({ name, ok: true, width: bitmap.width, height: bitmap.height, cornerAlpha, error: '' });
        bitmap.close();
      } catch (error) {
        files.push({ name, ok: false, width: 0, height: 0, cornerAlpha: [], error: String(error) });
      }
    }
    if (!avifBase64) return { files };
    let avif = false;
    try {
      const raw = Uint8Array.from(atob(avifBase64), (character) => character.charCodeAt(0));
      (await createImageBitmap(new Blob([raw], { type: 'image/avif' }))).close();
      avif = true;
    } catch {
      avif = false;
    }
    return { files, avif };
  }, probe);
}

// ---- pixels ----------------------------------------------------------------------------------------------------

const GRID = 24;

/** Where a box shown on screen sits in the STORED picture (inverse of the Exif orientation, on the unit square). */
export function storedBox(box: [number, number, number, number], tag: number): [number, number, number, number] {
  const [x, y, w, h] = box;
  const back = (u: number, v: number): [number, number] =>
    tag === 2 ? [1 - u, v] : tag === 3 ? [1 - u, 1 - v] : tag === 4 ? [u, 1 - v] : tag === 5 ? [v, u] : tag === 6 ? [v, 1 - u] : tag === 7 ? [1 - v, 1 - u] : tag === 8 ? [1 - v, u] : [u, v];
  const [ax, ay] = back(x, y);
  const [bx, by] = back(x + w, y + h);
  return [Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay)];
}

const MIME_OF: Record<OutFormat, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

export interface Reference {
  /** The grey grid the output should show. */
  expected: number[];
  /** The same stored grid seen the 7 other ways: an output that matches one of these turned the picture wrongly. */
  wrong: number[][];
}

/**
 * The picture a fixture shows, built from its STORED pixels (the copy with the Orientation set to 1)
 * and turned here, in Node, by its Exif tag; `after` is a further turn the tool adds. The browser's
 * own orientation is never used to make the reference, so a double or a missing turn shows.
 */
export async function reference(page: Page, check: PixelCheck): Promise<Reference> {
  const bytes = new Uint8Array(fixtureBytes(check.from));
  const tag = oracle(check.from).orientation;
  const stored = tag === 1 ? bytes : withOrientation(bytes, 1);
  const region = check.box ? storedBox(check.box, tag) : undefined;
  // F18: the type of what the fixture really is (the mirror of Flip image is checked on the PNG and WebP fixtures too).
  const real = sniff(stored);
  const mime = real === 'png' || real === 'webp' ? MIME_OF[real] : 'image/jpeg';
  const grid = await thumbnail(page, stored, mime, { size: GRID, ...(region ? { region } : {}) });
  if (!grid.ok) throw new Error(`could not decode the stored pixels of ${check.from}: ${grid.error}`);
  const upright = orientGrid(grid.gray, GRID, tag);
  const expected = (check.after ?? 1) > 1 ? orientGrid(upright, GRID, check.after ?? 1) : upright;
  const wrong = check.box
    ? []
    : [1, 2, 3, 4, 5, 6, 7, 8]
        .map((view) => orientGrid(grid.gray, GRID, view))
        .filter((candidate) => meanAbsDiff(candidate, expected) > 4);
  return { expected, wrong };
}

export interface PixelVerdict {
  /** Mean difference to the right picture. */
  right: number;
  /** Mean difference to the closest wrong way of turning it (null when the box leaves no wrong way to test). */
  closestWrong: number | null;
}

export async function comparePixels(page: Page, output: OutFile, format: OutFormat, check: PixelCheck, cache: Map<string, Reference>): Promise<PixelVerdict> {
  const key = JSON.stringify(check);
  let wanted = cache.get(key);
  if (!wanted) {
    wanted = await reference(page, check);
    cache.set(key, wanted);
  }
  const seen = await thumbnail(page, output.bytes, MIME_OF[format], { size: GRID });
  expect(seen.ok, `${output.name} decodes for the pixel check: ${seen.error}`).toBe(true);
  const right = meanAbsDiff(seen.gray, wanted.expected);
  const closestWrong = wanted.wrong.length ? Math.min(...wanted.wrong.map((candidate) => meanAbsDiff(seen.gray, candidate))) : null;
  return { right, closestWrong };
}

/** The 24 x 24 colours of a picture, over white, for the "painted white" and "first frame" checks. */
export async function colours(page: Page, output: OutFile, format: OutFormat): Promise<Thumbnail> {
  const seen = await thumbnail(page, output.bytes, MIME_OF[format], { size: GRID });
  expect(seen.ok, `${output.name} decodes: ${seen.error}`).toBe(true);
  return seen;
}

// ---- metadata ---------------------------------------------------------------------------------------------------

/** An AVIF with an alpha plane: an auxiliary image whose auxC type names alpha (F2 draft, 840d565^). */
export function avifHasAlpha(bytes: Uint8Array): boolean {
  return parseBmff(bytes).items.some((item) => item.properties.some((property) => property.type === 'auxC' && 'auxType' in property && /alpha/i.test(property.auxType)));
}

/** True when the Exif block says nothing but the Orientation (what strip.ts leaves on a rotated JPEG that went back as it was). */
export function orientationOnly(bytes: Uint8Array): boolean {
  const tiff = exifBlock(bytes);
  if (!tiff) return false;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const little = tiff[0] === 0x49;
  const first = view.getUint32(4, little);
  const count = view.getUint16(first, little);
  return count === 1 && tiffOrientation(tiff) !== null;
}

// ---- the same picture (F18, decision 15: Remove EXIF data hands the picture back as it came) -------------------------

const u16be = (bytes: Uint8Array, at: number): number => ((bytes[at] ?? 0) << 8) | (bytes[at + 1] ?? 0);
const u32be = (bytes: Uint8Array, at: number): number => u16be(bytes, at) * 0x10000 + u16be(bytes, at + 2);
const u32le = (bytes: Uint8Array, at: number): number => ((bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8) | ((bytes[at + 2] ?? 0) << 16)) + (bytes[at + 3] ?? 0) * 0x1000000;
const fourcc = (bytes: Uint8Array, at: number): string => String.fromCharCode(...bytes.subarray(at, at + 4));

/**
 * JPEG: from the SOI to the EOI of the image itself, every segment but the APPn and COM ones (where the metadata lives):
 * the tables, the SOF, each SOS with its entropy-coded data, the EOI. Nothing after the EOI. Fill bytes between
 * segments are left out on both sides.
 */
function jpegPicture(bytes: Uint8Array): Uint8Array[] {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a JPEG');
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let i = 2;
  for (;;) {
    if (i + 1 >= bytes.length) throw new Error('the JPEG ends before the EOI of its image');
    if (bytes[i] !== 0xff) throw new Error(`no JPEG marker at byte ${i}`);
    const marker = bytes[i + 1] as number;
    if (marker === 0xff) {
      i += 1; // a fill byte before a marker
      continue;
    }
    if (marker === 0xd9) {
      parts.push(bytes.subarray(i, i + 2));
      return parts;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(bytes.subarray(i, i + 2));
      i += 2;
      continue;
    }
    const end = i + 2 + u16be(bytes, i + 2);
    if (end > bytes.length) throw new Error(`the JPEG segment at byte ${i} runs past the end`);
    if (!((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe)) parts.push(bytes.subarray(i, end));
    i = end;
    if (marker === 0xda) {
      // The scan runs to the first marker that is neither a stuffed byte (FF00) nor a restart (FFD0 to FFD7).
      const start = i;
      while (i + 1 < bytes.length && !(bytes[i] === 0xff && bytes[i + 1] !== 0x00 && !((bytes[i + 1] as number) >= 0xd0 && (bytes[i + 1] as number) <= 0xd7))) i += 1;
      parts.push(bytes.subarray(start, i));
    }
  }
}

/** PNG: the IHDR, PLTE, tRNS and IDAT chunks, and the acTL, fcTL and fdAT of an APNG, whole (type, data and CRC), in order. */
const PNG_PICTURE = new Set(['IHDR', 'PLTE', 'tRNS', 'IDAT', 'acTL', 'fcTL', 'fdAT']);
function pngPicture(bytes: Uint8Array): Uint8Array[] {
  const parts: Uint8Array[] = [];
  let at = 8;
  while (at + 12 <= bytes.length) {
    const length = u32be(bytes, at);
    const type = fourcc(bytes, at + 4);
    if (PNG_PICTURE.has(type)) parts.push(bytes.subarray(at, at + 12 + length));
    at += 12 + length;
    if (type === 'IEND') break;
  }
  return parts;
}

/**
 * WebP: the VP8, VP8L, ALPH, ANIM and ANMF chunks (each frame with its own image data), whole, in order, and the VP8X
 * header with its EXIF and XMP flags read as zero (its canvas size and its alpha and animation flags count).
 */
const WEBP_PICTURE = new Set(['VP8 ', 'VP8L', 'ALPH', 'ANIM', 'ANMF']);
function webpPicture(bytes: Uint8Array): Uint8Array[] {
  const parts: Uint8Array[] = [];
  let at = 12;
  while (at + 8 <= bytes.length) {
    const type = fourcc(bytes, at);
    const size = u32le(bytes, at + 4);
    const chunk = bytes.subarray(at, at + 8 + size);
    if (type === 'VP8X') {
      const header = chunk.slice();
      header[8] = (header[8] ?? 0) & ~0x0c;
      parts.push(header);
    }
    if (WEBP_PICTURE.has(type)) parts.push(chunk);
    at += 8 + size + (size % 2);
  }
  return parts;
}

/**
 * The bytes that make the picture of a JPG, PNG or WebP, whatever metadata the file carries, read here and never by the
 * engine: two files with the same `imageBytes` hold the same picture, byte for byte (the proof of "the same pixels" of
 * Remove EXIF data, stronger than decoding them).
 */
export function imageBytes(bytes: Uint8Array): Uint8Array {
  const format = sniff(bytes);
  const parts = format === 'jpeg' ? jpegPicture(bytes) : format === 'png' ? pngPicture(bytes) : format === 'webp' ? webpPicture(bytes) : null;
  if (!parts) throw new Error(`no picture bytes for a ${format} file`);
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** True when the two files hold the same picture, byte for byte (see `imageBytes`). */
export function sameImageBytes(a: Uint8Array, b: Uint8Array): boolean {
  return Buffer.from(imageBytes(a)).equals(Buffer.from(imageBytes(b)));
}

export interface PixelHash {
  ok: boolean;
  error: string;
  width: number;
  height: number;
  /** SHA-256 of the SHA-256 of each band of rows: every RGBA value of the decoded picture counts. */
  sha256: string;
}

/**
 * Runs in the page (pass it to page.evaluate, or use `pixelHash`): decodes the bytes as the browser shows them (its own
 * orientation applied) and hashes every RGBA value, in bands of 256 rows, so a 16.8 MP picture never needs one canvas of
 * its whole size. Self-contained: Playwright sends its source.
 */
async function browserPixelHash(request: { base64: string; mime: string }): Promise<PixelHash> {
  try {
    const binary = atob(request.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const bitmap = await createImageBitmap(new Blob([bytes], { type: request.mime }));
    const { width, height } = bitmap;
    const band = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.min(band, height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('no 2d context');
    context.imageSmoothingEnabled = false;
    const digests: Uint8Array[] = [];
    for (let y = 0; y < height; y += band) {
      const rows = Math.min(band, height - y);
      context.clearRect(0, 0, width, canvas.height);
      context.drawImage(bitmap, 0, y, width, rows, 0, 0, width, rows);
      const data = context.getImageData(0, 0, width, rows).data;
      digests.push(new Uint8Array(await crypto.subtle.digest('SHA-256', data)));
    }
    bitmap.close();
    const all = new Uint8Array(digests.length * 32);
    digests.forEach((digest, index) => all.set(digest, index * 32));
    const sha = new Uint8Array(await crypto.subtle.digest('SHA-256', all));
    return { ok: true, error: '', width, height, sha256: Array.from(sha, (byte) => byte.toString(16).padStart(2, '0')).join('') };
  } catch (error) {
    return { ok: false, error: String(error), width: 0, height: 0, sha256: '' };
  }
}

/** Every decoded pixel of the bytes, hashed in the page (see `browserPixelHash`). */
export async function pixelHash(page: Page, bytes: Uint8Array, mime: string): Promise<PixelHash> {
  return page.evaluate(browserPixelHash, { base64: Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64'), mime });
}

/** No place, no author: no Exif, XMP, IPTC, PNG text or GPS in this output (PDF: inside its images too). */
export function expectNoMetadata(file: OutFile, options: { tagMayStay?: boolean } = {}): MetadataReport {
  const report = metadataReport(file.bytes);
  expect(report.gps, `${file.name}: GPS`).toBe(false);
  expect(report.xmp, `${file.name}: XMP`).toBe(false);
  expect(report.other, `${file.name}: IPTC, text chunks and other metadata`).toEqual([]);
  if (options.tagMayStay && report.format === 'jpeg' && report.exif) {
    expect(orientationOnly(file.bytes), `${file.name}: the only Exif left is the Orientation`).toBe(true);
  } else {
    expect(report.exif, `${file.name}: Exif`).toBe(false);
  }
  return report;
}

// ---- the record the table is built from ---------------------------------------------------------------------

export interface RecordFile {
  fixture: string;
  status: 'ok' | 'refused';
  /** ok: what came out; `unsupported` is an AVIF this browser does not open by itself, checked by its bytes (F17). */
  output?: { name: string; format: string; width: number; height: number; bytes: number; decoded: 'yes' | 'unsupported' | 'pdf'; note: string };
  /** refused: the reason the page gave. */
  reason?: string;
}

export interface MatrixRecord {
  id: string;
  tool: string;
  browser: string;
  path: string;
  options: string;
  /** The whole test, and the part of it the engine took (upload until the result card). */
  ms: number;
  processMs: number;
  /** Where the rest of the time went: the page load, taking the Download, opening the outputs in the page. */
  phases: { load: number; download: number; decode: number };
  requests: number;
  /** Requests that left the page origin (the test fails when there is one, so a record says 0). */
  outside: number;
  /** F17: whether this browser opened the AVIF fixture by itself, on the cases that read or write AVIF. */
  avifDecode?: boolean;
  files: RecordFile[];
  /** image-to-pdf: pages of the PDF. */
  pdf?: { pages: number; bytes: number };
}

/** What a preset page did with a batch: the bytes of each output, for the preset table of the report. */
export interface PresetRecord {
  id: string;
  browser: string;
  path: string;
  /** The byte limit of the preset. */
  limit: number;
  ms: number;
  files: { fixture: string; input: number; output: string; format: string; width: number; height: number; bytes: number; note: string }[];
}

function writeJson(name: string, record: MatrixRecord | PresetRecord): void {
  const dir = resolve('test-results', 'matriz');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, name), `${JSON.stringify(record, null, 2)}\n`);
}

export function writeRecord(record: MatrixRecord): void {
  writeJson(`${record.id}-${record.browser}.json`, record);
}

export function writePresetRecord(record: PresetRecord): void {
  writeJson(`preset-${record.id}-${record.browser}.json`, record);
}

// ---- one tool, one batch --------------------------------------------------------------------------------------

/** Rows of refused files: the Oli line with the file name, the link when there is one, and the event. */
export async function expectRefusals(page: Page, kase: MatrixCase, events: unknown[][], record: RecordFile[]): Promise<void> {
  const errors = events.filter((entry) => entry[0] === 'event' && entry[1] === 'tool_error').map((entry) => entry[2] as { reason: string; codec: string; tool: string });
  const expected = kase.batch.filter((name) => isRefusal(kase.outcome(name)));
  expect(errors, 'one tool_error per refused file').toHaveLength(expected.length);
  const reasons = errors.map((error) => error.reason).sort();
  expect(reasons).toEqual(expected.map((name) => REASON_EVENT[(kase.outcome(name) as Refuse).refuse]).sort());
  for (const error of errors) expect(error.tool).toBe(kase.tool);
  for (const name of expected) {
    const refusal = kase.outcome(name) as Refuse;
    const row: Locator = page.locator('.fo-file[data-state="error"]', { has: page.getByText(name, { exact: true }) });
    await expect(row, `${name} has an error row`).toHaveCount(1);
    await expect(row.locator('.fo-file__err')).toContainText(name);
    await expect(row.locator('.fo-file__err')).toContainText(REASON_TEXT[refusal.refuse]);
    if (refusal.link) await expectConverterRow(page, name, refusal.link);
    if (refusal.plain) {
      // The line names what the tool takes, and nothing in the row points to a page that does not exist.
      await expect(row.locator('.fo-file__err')).toContainText(refusal.plain);
      await expect(row.locator('a'), `${name}: no link in the row`).toHaveCount(0);
    }
    record.push({ fixture: name, status: 'refused', reason: refusal.refuse });
  }
}

export const sizeOfFixture = (name: string): number => fixtureBytes(name).length;

// ---- the checks of one output -----------------------------------------------------------------------------------

export interface CheckContext {
  page: Page;
  /** F17: this browser opens AVIF files by itself (the probe); an AVIF output that it cannot open is checked by its bytes. */
  avif: boolean;
  references: Map<string, Reference>;
}

/** What is true of the output, whatever the tool: it is what it should be, it opens, it carries no metadata. */
async function checkOutput(context: CheckContext, fixture: string, want: Expect, out: OutFile, decoded: Decoded | undefined): Promise<RecordFile> {
  const { page } = context;
  expect(out.name, `${fixture}: name of the output`).toBe(want.name);
  expect(sniff(out.bytes), `${out.name}: real format`).toBe(want.format);
  const size = imageSize(out.bytes);
  expect([size.displayWidth, size.displayHeight], `${out.name}: size in the header`).toEqual([want.width, want.height]);
  if (want.smaller || want.notBigger) {
    const input = sizeOfFixture(fixture);
    if (want.smaller) expect(out.bytes.length, `${out.name} is smaller than the ${input} bytes that went in`).toBeLessThan(input);
    if (want.notBigger) expect(out.bytes.length, `${out.name} is not bigger than the ${input} bytes that went in`).toBeLessThanOrEqual(input);
  }
  expectNoMetadata(out, want.tagMayStay ? { tagMayStay: true } : {});

  // F17 (as the F2 draft, 840d565^): an AVIF must open where this browser opens the AVIF fixture; where it does not (the
  // WebKit of Playwright on Windows), the AVIF is checked by its bytes only: the real format, the size in the header, the
  // alpha plane and the metadata above. Every other format must open everywhere.
  const opens: 'yes' | 'unsupported' = want.format === 'avif' && !context.avif ? 'unsupported' : 'yes';
  if (opens === 'yes') {
    expect(decoded?.ok, `${out.name} opens in the browser: ${decoded?.error ?? 'not in the bundle'}`).toBe(true);
    expect([decoded?.width, decoded?.height], `${out.name}: size once decoded`).toEqual([want.width, want.height]);
  }

  const notes: string[] = [];
  if (want.format === 'webp') {
    const info = webpInfo(out.bytes);
    if (want.animated) {
      expect([info.animated, info.frameCount], `${out.name} is still an animation`).toEqual([true, 2]);
      notes.push('animation kept');
    } else if (want.still) {
      expect(info.animated, `${out.name} is a still image`).toBe(false);
      notes.push('first frame');
    }
  }
  if (want.alpha === 'kept') {
    if (want.format === 'avif') expect(avifHasAlpha(out.bytes), `${out.name}: the AVIF carries an alpha plane`).toBe(true);
    if (opens === 'yes') expect(decoded?.cornerAlpha.every((alpha) => alpha < 40), `${out.name}: corners stay transparent (${decoded?.cornerAlpha.join(',')})`).toBe(true);
    notes.push('alpha kept');
  } else if (want.format === 'avif') {
    expect(avifHasAlpha(out.bytes), `${out.name}: an opaque picture gets no alpha plane`).toBe(false);
  }
  if ((want.flatten || want.mostlyRed) && opens === 'yes') {
    const seen = await colours(page, out, want.format);
    if (want.flatten) {
      expect(decoded?.cornerAlpha.every((alpha) => alpha === 255), `${out.name} is opaque`).toBe(true);
      const corner = seen.rgb.slice(0, 3);
      const last = seen.rgb.slice(-3);
      expect([...corner, ...last].every((value) => value >= 235), `${out.name}: transparent corners are white (${[...corner, ...last].map(Math.round).join(',')})`).toBe(true);
      notes.push('flattened on white');
    }
    if (want.mostlyRed) {
      const cells = seen.rgb.length / 3;
      let red = 0;
      let blue = 0;
      for (let cell = 0; cell < cells; cell += 1) {
        red += seen.rgb[cell * 3] as number;
        blue += seen.rgb[cell * 3 + 2] as number;
      }
      expect(red / cells, `${out.name} shows the first (red) frame: red ${Math.round(red / cells)}, blue ${Math.round(blue / cells)}`).toBeGreaterThan(blue / cells + 60);
      notes.push('first frame is red');
    }
  }
  if (want.sameImage) {
    const input = new Uint8Array(fixtureBytes(fixture));
    expect(sameImageBytes(out.bytes, input), `${out.name}: the bytes of the picture are the ones of ${fixture}`).toBe(true);
    notes.push('same picture bytes');
    const [before, after] = [await pixelHash(page, input, MIME_OF[want.format]), await pixelHash(page, out.bytes, MIME_OF[want.format])];
    expect(before.ok && after.ok, `${out.name} and ${fixture} decode for the pixel hash: ${before.error} ${after.error}`).toBe(true);
    expect(after, `${out.name}: every decoded pixel is the one of ${fixture}`).toEqual(before);
    notes.push('same decoded pixels');
    const tag = oracle(fixture).orientation;
    expect(metadataReport(out.bytes).orientation ?? 1, `${out.name}: the Orientation of ${fixture}`).toBe(tag);
    if (tag > 1) notes.push('Orientation tag only');
  }
  if (want.pixels && opens === 'yes') {
    const verdict = await comparePixels(page, out, want.format, want.pixels, context.references);
    expect(verdict.right, `${out.name}: mean difference to the upright picture`).toBeLessThan(want.pixels.limit);
    if (verdict.closestWrong !== null) {
      expect(verdict.closestWrong, `${out.name}: a wrong orientation must be clearly further (right ${verdict.right.toFixed(1)})`).toBeGreaterThan(verdict.right + 4);
    }
    notes.push(`orientation ok (Δ${verdict.right.toFixed(1)})`);
  }
  return { fixture, status: 'ok', output: { name: out.name, format: want.format, width: want.width, height: want.height, bytes: out.bytes.length, decoded: opens, note: notes.join(', ') } };
}

function pdfFormat(image: PdfImage): OutFormat {
  return image.jpeg ? 'jpeg' : 'png';
}

/** The PDF of Image to PDF: a page per image, in the order of the queue, with nothing of the originals inside. */
async function checkPdf(context: CheckContext, kase: MatrixCase, accepted: string[], delivered: Delivered): Promise<{ files: RecordFile[]; pdf: NonNullable<MatrixRecord['pdf']> }> {
  expect(delivered.name).toBe('fileorca-images.pdf');
  expect(sniff(delivered.bytes)).toBe('pdf');
  const pdf = parsePdf(delivered.bytes);
  expect(pdf.pageCount, 'one page per image').toBe(accepted.length);
  // The scanner above is lenient, so the same bytes also go through a strict check in Node (no page load): header,
  // %%EOF, startxref, every xref entry, and a load by @cantoo/pdf-lib that finds the same number of pages.
  const strict = await strictPdf(delivered.bytes);
  expect(strict.problems, 'the PDF structure is sound').toEqual([]);
  expect(strict.pageCount, 'pdf-lib loads the PDF and counts the same pages').toBe(pdf.pageCount);
  expect(pdf.info['Producer']).toBe('FileOrca');
  expect(pdf.info['Creator']).toBe('FileOrca');
  expect(Object.keys(pdf.info).filter((key) => /^(Title|Author|Subject|Keywords)$/.test(key)), 'no title, author or keywords').toEqual([]);
  expect(pdf.hasXmp, 'no XMP packet').toBe(false);
  expectNoMetadata({ name: delivered.name, bytes: delivered.bytes });
  const files: RecordFile[] = [];
  for (const [index, fixture] of accepted.entries()) {
    const want = kase.outcome(fixture) as Expect;
    const page = pdf.pages[index];
    expect(page, `page ${index + 1} (${fixture}) exists`).toBeDefined();
    if (!page) continue;
    expect([Math.round(page.width), Math.round(page.height)], `${fixture}: page size`).toEqual([want.width, want.height]);
    expect(page.images, `${fixture}: one image on the page`).toHaveLength(1);
    const image = page.images[0] as PdfImage;
    expect([image.width, image.height], `${fixture}: size of the image on the page`).toEqual([want.width, want.height]);
    expect(pdfFormat(image), `${fixture}: JPEG for a photo, PNG for transparency`).toBe(want.format);
    const notes: string[] = [`${image.width} x ${image.height} px on a ${Math.round(page.width)} x ${Math.round(page.height)} pt page`];
    if (image.jpeg) {
      expect(sniff(image.jpeg), `${fixture}: the image is a JPEG`).toBe('jpeg');
      expect(Buffer.compare(Buffer.from(image.jpeg), fixtureBytes(fixture)), `${fixture}: not the original file's bytes`).not.toBe(0);
      if (want.pixels) {
        const verdict = await comparePixels(context.page, { name: `${fixture} (page ${index + 1})`, bytes: image.jpeg }, 'jpeg', want.pixels, context.references);
        expect(verdict.right, `${fixture}: page shows the upright picture`).toBeLessThan(want.pixels.limit);
        if (verdict.closestWrong !== null) expect(verdict.closestWrong, `${fixture}: wrong orientations are further`).toBeGreaterThan(verdict.right + 4);
        notes.push(`orientation ok (Δ${verdict.right.toFixed(1)})`);
      }
    } else {
      expect(image.filters, `${fixture}: a PNG page is flate`).toEqual(['FlateDecode']);
      if (want.alpha === 'kept') {
        expect(image.hasSoftMask, `${fixture}: transparency travels as a soft mask`).toBe(true);
        notes.push('alpha kept (soft mask)');
      }
    }
    files.push({ fixture, status: 'ok', output: { name: `page ${index + 1}`, format: want.format, width: want.width, height: want.height, bytes: image.data.length, decoded: 'pdf', note: notes.join(', ') } });
  }
  return { files, pdf: { pages: pdf.pageCount, bytes: delivered.bytes.length } };
}

/**
 * One tool page, one upload with the whole batch: every accepted file must come out right, every
 * refused one must say why in its own row, nothing may leave the page, and the batch must not hang.
 */
export async function runCase(page: Page, browser: string, kase: MatrixCase): Promise<MatrixRecord> {
  const started = Date.now();
  const log = watchRequests(page);
  await openTool(page, kase.path);
  await kase.setup?.(page);
  const loaded = Date.now() - started;
  // By path: the files go from disk to the page as a person's would, without a copy through the protocol.
  await page.setInputFiles('input[type="file"]', kase.batch.map((name) => kase.paths?.[name] ?? resolve(DIR, name)));
  const uploaded = Date.now();
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: 50_000 });
  const processed = Date.now() - uploaded;

  const accepted = kase.batch.filter((name) => !isRefusal(kase.outcome(name)));
  const records: RecordFile[] = [];
  await showAllRows(page);
  await expectRefusals(page, kase, await dataLayer(page), records);
  await expect(page.locator('.fo-file[data-state="error"]'), 'only the refused files have an error row').toHaveCount(kase.batch.length - accepted.length);

  // What the card tells the person: the metadata line on every card, and the notes this batch earns.
  const said = (await page.locator('.fo-result__notes li').allTextContents()).join(' | ');
  for (const phrase of ['Oli removed the photo metadata, including the GPS location.', ...(kase.says ?? [])]) expect(said, `the result says "${phrase}"`).toContain(phrase);

  const downloading = Date.now();
  const delivered = await takeDownload(page);
  const downloaded = Date.now() - downloading;
  const context: CheckContext = { page, avif: false, references: new Map() };
  const accepting: RecordFile[] = [];
  let pdfRecord: MatrixRecord['pdf'];
  let decodeMs = 0;
  let outs: OutFile[] = [];
  let avifDecode: boolean | undefined;
  if (kase.deliverable === 'pdf') {
    const result = await checkPdf(context, kase, accepted, delivered);
    accepting.push(...result.files);
    pdfRecord = result.pdf;
  } else {
    outs = filesOf(delivered);
    const decoding = Date.now();
    const report = await decodeInPage(page, { probeAvif: kase.avif === true });
    decodeMs = Date.now() - decoding;
    context.avif = report.avif === true;
    avifDecode = report.avif;
    expect(outs.map((out) => out.name), 'one output per accepted file, in the order of the queue').toEqual(accepted.map((name) => (kase.outcome(name) as Expect).name));
    expect(new Set(outs.map((out) => out.name.toLowerCase())).size, 'names are unique').toBe(outs.length);
    for (const [index, fixture] of accepted.entries()) {
      const out = outs[index] as OutFile;
      accepting.push(await checkOutput(context, fixture, kase.outcome(fixture) as Expect, out, report.files.find((file) => file.name === out.name)));
    }
  }

  expect(log.outside(), 'no request leaves the page origin').toEqual([]);
  expect(log.writes, 'no request writes anything').toEqual([]);
  const ordered = kase.batch.map((name) => [...accepting, ...records].find((file) => file.fixture === name) as RecordFile);
  const record: MatrixRecord = {
    id: kase.id,
    tool: kase.tool,
    browser,
    path: kase.path,
    options: kase.options,
    ms: Date.now() - started,
    processMs: processed,
    phases: { load: loaded, download: downloaded, decode: decodeMs },
    requests: log.urls.length,
    outside: log.outside().length,
    ...(avifDecode === undefined ? {} : { avifDecode }),
    files: ordered,
    ...(pdfRecord ? { pdf: pdfRecord } : {}),
  };
  writeRecord(record);
  // F17: a further step on the same page, with what came out (the AVIF with alpha goes on to AVIF to JPG).
  await kase.then?.(page, browser, outs);
  return record;
}
