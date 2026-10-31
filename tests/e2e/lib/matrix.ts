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
import { parsePdf, type PdfImage } from './pdf.ts';
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
}

export type Refusal = 'wrong-tool' | 'unsupported' | 'truncated' | 'decode' | 'empty';

export interface Refuse {
  refuse: Refusal;
  /** Link the row offers (HEIC and AVIF go to their converters): where it goes and how it is named. */
  link?: { href: string; name: string; sentence: RegExp };
}

export type Outcome = Expect | Refuse;
export const isRefusal = (outcome: Outcome): outcome is Refuse => 'refuse' in outcome;

/** The line each reason shows in the row of the file (src/tools/image/i18n/en.ts, errors). */
const REASON_TEXT: Record<Refusal, RegExp> = {
  'wrong-tool': /is a (HEIC|AVIF|JPG|PNG|WebP|GIF) file\./,
  unsupported: /isn't an image Oli can read\./,
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

const HEIC_LINK = { href: '/heic-to-jpg/', name: 'HEIC to JPG', sentence: /is a HEIC file\. Open it in HEIC to JPG\./ };
const AVIF_LINK = { href: '/avif-to-jpg/', name: 'AVIF to JPG', sentence: /is an? AVIF file\. Open it in AVIF to JPG\./ };

/** A good file of a format the tool does not take: HEIC and AVIF point to their converters. */
export function wrongTool(name: string): Refuse {
  const format = oracle(name).format;
  return format === 'heic' ? { refuse: 'wrong-tool', link: HEIC_LINK } : format === 'avif' ? { refuse: 'wrong-tool', link: AVIF_LINK } : { refuse: 'wrong-tool' };
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
  await page.goto(path);
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
  /** This browser can decode an AVIF on its own (the fixture decodes). */
  avif: boolean;
}

const FFLATE = resolve('node_modules/fflate/umd/index.js');

/**
 * Decodes what the Download link holds, in the page, without sending a byte through the protocol:
 * the page fetches its own blob, unpacks the ZIP with fflate and opens every entry as a bitmap. The
 * AVIF fixture is decoded too, to learn whether this browser can read an AVIF at all (the WebKit of
 * Playwright on Windows cannot), so an AVIF output is required to open only where one can.
 */
export async function decodeInPage(page: Page): Promise<DecodeReport> {
  if (!(await page.evaluate(() => 'fflate' in window))) await page.addScriptTag({ path: FFLATE });
  const avif = fixtureBytes('gen-avif.avif').toString('base64');
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
    let canAvif = false;
    try {
      const raw = Uint8Array.from(atob(avifBase64), (character) => character.charCodeAt(0));
      (await createImageBitmap(new Blob([raw], { type: 'image/avif' }))).close();
      canAvif = true;
    } catch {
      canAvif = false;
    }
    return { files, avif: canAvif };
  }, avif);
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
  const grid = await thumbnail(page, stored, 'image/jpeg', { size: GRID, ...(region ? { region } : {}) });
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

/** An AVIF with an alpha plane: an auxiliary image whose auxC type names alpha. */
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
  /** ok: what came out. */
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
  avifDecode: boolean;
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
    if (refusal.link) {
      await expect(row.locator('.fo-file__err')).toContainText(refusal.link.sentence);
      await expect(row.getByRole('link', { name: refusal.link.name })).toHaveAttribute('href', refusal.link.href);
    }
    record.push({ fixture: name, status: 'refused', reason: refusal.refuse });
  }
}

export const sizeOfFixture = (name: string): number => fixtureBytes(name).length;

// ---- the checks of one output -----------------------------------------------------------------------------------

export interface CheckContext {
  page: Page;
  /** This browser opens AVIF files by itself. */
  avif: boolean;
  references: Map<string, Reference>;
}

/** What is true of the output, whatever the tool: it is what it should be, it opens, it carries no metadata. */
async function checkOutput(context: CheckContext, fixture: string, want: Expect, out: OutFile, decoded: Decoded | undefined): Promise<RecordFile> {
  const { page } = context;
  const input = sizeOfFixture(fixture);
  expect(out.name, `${fixture}: name of the output`).toBe(want.name);
  expect(sniff(out.bytes), `${out.name}: real format`).toBe(want.format);
  const size = imageSize(out.bytes);
  expect([size.displayWidth, size.displayHeight], `${out.name}: size in the header`).toEqual([want.width, want.height]);
  if (want.smaller) expect(out.bytes.length, `${out.name} is smaller than the ${input} bytes that went in`).toBeLessThan(input);
  if (want.notBigger) expect(out.bytes.length, `${out.name} is not bigger than the ${input} bytes that went in`).toBeLessThanOrEqual(input);
  expectNoMetadata(out, want.tagMayStay ? { tagMayStay: true } : {});

  let opens: 'yes' | 'unsupported' = 'yes';
  if (want.format === 'avif' && !context.avif) {
    opens = 'unsupported';
  } else {
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
  }
  if (want.flatten || want.mostlyRed) {
    if (opens === 'yes') {
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
  await page.setInputFiles('input[type="file"]', kase.batch.map((name) => resolve(DIR, name)));
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
  if (kase.deliverable === 'pdf') {
    const result = await checkPdf(context, kase, accepted, delivered);
    accepting.push(...result.files);
    pdfRecord = result.pdf;
  } else {
    const outs = filesOf(delivered);
    const decoding = Date.now();
    const report = await decodeInPage(page);
    decodeMs = Date.now() - decoding;
    context.avif = report.avif;
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
    avifDecode: context.avif,
    files: ordered,
    ...(pdfRecord ? { pdf: pdfRecord } : {}),
  };
  writeRecord(record);
  return record;
}
