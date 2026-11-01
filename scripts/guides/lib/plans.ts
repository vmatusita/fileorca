// What each of the ten guides measures (prompt F5b, decision 2), on the fixtures, by the path a person's file takes:
// the browser where the site writes with the canvas, Node where it runs WebAssembly or pdf-lib. Every number goes into
// data/guides-measured.json with its sample, method, date and commit; the guides only read them.
import { readdirSync } from 'node:fs';
import type { FileGuideId } from '../../../src/tools/guides/registry.ts';
import type { Cell, GuideMeasure, MeasuredNumber, MeasuredTable, Method, OfficialSize, Sample, Unit } from '../../../src/tools/guides/measured-types.ts';
import type { Page } from '@playwright/test';
import type { TestFile } from '../../../tests/e2e/lib/page.ts';
import { metadataReport } from '../../../tests/e2e/lib/images.ts';
import { pngPixels } from '../../../tests/e2e/lib/png.ts';
import { webpFrames } from '../../../tests/e2e/lib/webp.ts';
import { BROWSERS, bytesFile, download, drop, fileOf, imageResult, method, openTool, option, stem, typeField, type BrowserName, type Out, type Session } from './browser.ts';
import { NODE_IMAGE, NODE_PIXELS, NODE_WEBP, imageFixture, photoFacts, pixelsOf, psnrOf, shownSize, webpOf, type Pixels } from './node-image.ts';
import { NODE_PDFLIB, NODE_PDF_ENGINE, breakdown, compress, merge, pdfFixture, splitEach } from './node-pdf.ts';
import { decibels, median, num, ratio, sample, sum, table, type Stamp } from './record.ts';

export interface Context {
  stamp: Stamp;
  session(name: BrowserName): Promise<Session>;
  log(message: string): void;
}

/** Collects one guide's numbers, tables and facts. */
function collector(stamp: Stamp) {
  const numbers: Record<string, MeasuredNumber> = {};
  const tables: Record<string, MeasuredTable> = {};
  const facts: Record<string, string> = {};
  return {
    n(name: string, value: number, unit: Unit, sampled: Sample, how: Method): void {
      if (name in numbers) throw new Error(`number ${name} measured twice`);
      numbers[name] = num(stamp, value, unit, sampled, how);
    },
    t(name: string, columns: string[], rows: Cell[][], sampled: Sample, methods: Method[]): void {
      tables[name] = table(stamp, columns, rows, sampled, methods);
    },
    fact(name: string, value: string): void {
      facts[name] = value;
    },
    done(official?: OfficialSize[]): GuideMeasure {
      return official ? { numbers, tables, facts, official } : { numbers, tables, facts };
    },
  };
}

const B: Record<BrowserName, string> = { chromium: 'Chromium', webkit: 'Webkit' };
const node = (engine: string): Method => ({ runner: 'node', engine });
const IMAGES = 'fixtures/images';
const PDFS = 'fixtures/pdf';

const HEIC = readdirSync(IMAGES).filter((name) => name.endsWith('.heic')).sort();
/** The three real phone photos with GPS (fixtures/ORIGEM.md). */
const PHOTOS = ['jpg-01-pixel2-retrato-gps.jpg', 'jpg-02-iphone6-paisagem-gps.jpg', 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg'];

const imageFile = (name: string): TestFile => fileOf(`${IMAGES}/${name}`);
const pdfFile = (name: string): TestFile => fileOf(`${PDFS}/${name}`);

/** Runs a batch through an image tool page and gives the outputs by the stem of the input. */
async function runImages(ctx: Context, browser: BrowserName, path: string, files: TestFile[], setup?: (page: Page) => Promise<void>): Promise<{ by: Map<string, Uint8Array>; list: Out[]; notes: string; how: Method }> {
  const session = await ctx.session(browser);
  const tab = await openTool(session, path);
  try {
    if (setup) await setup(tab.page);
    await drop(tab.page, files);
    const { files: outs, notes } = await imageResult(tab.page);
    return { by: new Map(outs.map((out) => [stem(out.name), out.bytes])), list: outs, notes, how: method(session, path) };
  } finally {
    await tab.close();
  }
}

/** Runs a PDF tool page (it runs by itself when the file arrives) and gives what the Download button holds. */
async function runPdfTool(ctx: Context, browser: BrowserName, path: string, files: TestFile[], setup?: (page: Page) => Promise<void>): Promise<{ list: Out[]; how: Method }> {
  const session = await ctx.session(browser);
  const tab = await openTool(session, path);
  try {
    if (setup) await setup(tab.page);
    await drop(tab.page, files);
    const { files: outs } = await download(tab.page);
    return { list: outs, how: method(session, path) };
  } finally {
    await tab.close();
  }
}

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`missing ${what}`);
  return value;
}

const noGps = (bytes: Uint8Array): boolean => {
  const report = metadataReport(bytes);
  return !report.gps && report.gpsKind === 'none';
};

// ---- 1. HEIC to JPG on Windows ----------------------------------------------------------------------------------

async function heicToJpg(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const all = sample(HEIC, 'every HEIC photo of the fixtures');
  const inputs = HEIC.map((name) => ({ name, bytes: imageFixture(name) }));
  const facts = inputs.map((input) => ({ ...photoFacts(input.bytes), shown: shownSize(input.bytes) }));
  const meta = node(NODE_IMAGE);
  g.n('files', HEIC.length, 'count', all, meta);
  g.n('cameras', new Set(facts.map((fact) => fact.camera)).size, 'count', all, meta);
  g.n('heicTotal', sum(inputs.map((input) => input.bytes.length)), 'bytes', all, meta);
  g.n('gpsBefore', facts.filter((fact) => fact.gps === 'real').length, 'count', all, meta);
  g.n('gpsTagBefore', facts.filter((fact) => fact.gps !== 'none').length, 'count', all, meta);
  const out: Record<BrowserName, Map<string, Uint8Array>> = { chromium: new Map(), webkit: new Map() };
  const methods: Method[] = [meta];
  for (const browser of BROWSERS) {
    ctx.log(`  HEIC to JPG in ${browser}`);
    const run = await runImages(ctx, browser, '/heic-to-jpg/', HEIC.map(imageFile));
    out[browser] = run.by;
    methods.push(run.how);
    const jpgs = inputs.map((input) => must(run.by.get(stem(input.name)), `${input.name} in ${browser}`));
    const ratios = inputs.map((input, index) => ratio((jpgs[index] as Uint8Array).length, input.bytes.length));
    g.n(`jpgTotal${B[browser]}`, sum(jpgs.map((jpg) => jpg.length)), 'bytes', all, run.how);
    g.n(`ratioTotal${B[browser]}`, ratio(sum(jpgs.map((jpg) => jpg.length)), sum(inputs.map((input) => input.bytes.length))), 'ratio', all, run.how);
    g.n(`ratioMin${B[browser]}`, Math.min(...ratios), 'ratio', all, run.how);
    g.n(`ratioMax${B[browser]}`, Math.max(...ratios), 'ratio', all, run.how);
    g.n(`ratioMedian${B[browser]}`, median(ratios), 'ratio', all, run.how);
    g.n(`gpsAfter${B[browser]}`, jpgs.filter((jpg) => !noGps(jpg)).length, 'count', all, run.how);
    g.n(`sameSize${B[browser]}`, jpgs.filter((jpg, index) => {
      const size = shownSize(jpg);
      const shown = (facts[index] as (typeof facts)[number]).shown;
      return size.width === shown.width && size.height === shown.height;
    }).length, 'count', all, run.how);
  }
  g.n('identicalBrowsers', inputs.filter((input) => {
    const a = out.chromium.get(stem(input.name));
    const b = out.webkit.get(stem(input.name));
    return a !== undefined && b !== undefined && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;
  }).length, 'count', all, must(methods[1], 'method'));
  g.t('files', ['file', 'camera', 'heicBytes', 'width', 'height', 'jpgBytesChromium', 'jpgBytesWebkit', 'gpsBefore', 'gpsAfter'], inputs.map((input, index) => {
    const fact = facts[index] as (typeof facts)[number];
    const c = must(out.chromium.get(stem(input.name)), input.name);
    const w = must(out.webkit.get(stem(input.name)), input.name);
    return [input.name, fact.camera, input.bytes.length, fact.shown.width, fact.shown.height, c.length, w.length, fact.gps, noGps(c) && noGps(w) ? 'none' : 'kept'];
  }), all, methods);
  return g.done();
}

// ---- 2. Why is my PDF so large? --------------------------------------------------------------------------------

const PDF_KEY = {
  scan: 'pdf-escaneado-01-pagina-livro-cor.pdf',
  report: 'pdf-escaneado-02-relatorio-nasa-150p.pdf',
  form: 'pdf-formulario-irs-1040-2019.pdf',
  book: 'pdf-grande-fontes-embutidas-117p.pdf',
  photos: 'gen-fotos.pdf',
  optimized: 'gen-ja-otimizado.pdf',
} as const;
type PdfKey = keyof typeof PDF_KEY;
const PDF_KEYS = Object.keys(PDF_KEY) as PdfKey[];
/** What Compress PDF takes: the readable fixtures and the one it repairs (fixtures/pdf/expected.json). */
const COMPRESSIBLE = [
  'gen-acoes.pdf', 'gen-fotos.pdf', 'gen-ja-otimizado.pdf', 'gen-paginas-300.pdf', 'gen-paginas-mistas.pdf', 'gen-xref-estragada.pdf',
  'pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-escaneado-02-relatorio-nasa-150p.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'pdf-grande-fontes-embutidas-117p.pdf',
];

async function pdfLarge(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const lib = node(NODE_PDFLIB);
  const engine = node(NODE_PDF_ENGINE);
  const named = sample(PDF_KEYS.map((key) => PDF_KEY[key]), 'the four real PDFs of the fixtures, a file of photos and one already optimised');
  const rows: Cell[][] = [];
  for (const key of PDF_KEYS) {
    const name = PDF_KEY[key];
    const one = sample([name]);
    const parts = await breakdown(pdfFixture(name));
    g.n(`${key}Total`, parts.total, 'bytes', one, lib);
    g.n(`${key}Pages`, parts.pages, 'count', one, lib);
    g.n(`${key}Images`, parts.images, 'bytes', one, lib);
    g.n(`${key}ImageCount`, parts.imageCount, 'count', one, lib);
    g.n(`${key}ImagesShare`, ratio(parts.images, parts.total), 'ratio', one, lib);
    g.n(`${key}Fonts`, parts.fonts, 'bytes', one, lib);
    g.n(`${key}FontCount`, parts.fontCount, 'count', one, lib);
    g.n(`${key}FontsShare`, ratio(parts.fonts, parts.total), 'ratio', one, lib);
    g.n(`${key}OtherShare`, ratio(parts.other, parts.total), 'ratio', one, lib);
    rows.push([name, parts.pages, parts.total, parts.images, parts.imageCount, parts.fonts, parts.fontCount, parts.other]);
  }
  g.t('space', ['file', 'pages', 'totalBytes', 'imageBytes', 'images', 'fontBytes', 'fonts', 'otherBytes'], rows, named, [lib]);

  const accepted = sample(COMPRESSIBLE, 'every fixture Compress PDF takes: the readable ones and the one it repairs');
  g.n('accepted', COMPRESSIBLE.length, 'count', accepted, engine);
  const modes: Record<string, Record<string, number>> = { lossless: {}, recommended: {}, strongChromium: {}, strongWebkit: {} };
  for (const mode of ['lossless', 'recommended'] as const) {
    let unchanged = 0;
    for (const name of COMPRESSIBLE) {
      const result = await compress(name, mode);
      (modes[mode] as Record<string, number>)[name] = result.after;
      if (result.outcome === 'unchanged') unchanged += 1;
      if (result.after > result.before) throw new Error(`${mode} made ${name} bigger`);
    }
    g.n(`${mode}Unchanged`, unchanged, 'count', accepted, engine);
  }
  const strongHow: Partial<Record<BrowserName, Method>> = {};
  for (const browser of BROWSERS) {
    let unchanged = 0;
    for (const name of COMPRESSIBLE) {
      ctx.log(`  Compress PDF Strong in ${browser}: ${name}`);
      const run = await runPdfTool(ctx, browser, '/compress-pdf/', [pdfFile(name)], (page) => option(page, 'Strong'));
      strongHow[browser] = run.how;
      const after = must(run.list[0], `${name} strong`).bytes;
      const before = pdfFixture(name);
      (modes[`strong${B[browser]}`] as Record<string, number>)[name] = after.length;
      if (after.length > before.length) throw new Error(`Strong made ${name} bigger in ${browser}`);
      if (Buffer.compare(Buffer.from(after), Buffer.from(before)) === 0) unchanged += 1;
    }
    g.n(`strongUnchanged${B[browser]}`, unchanged, 'count', accepted, must(strongHow[browser], browser));
  }
  const strongChromium = must(strongHow.chromium, 'strong chromium');
  const strongWebkit = must(strongHow.webkit, 'strong webkit');
  for (const key of PDF_KEYS) {
    const name = PDF_KEY[key];
    const before = pdfFixture(name).length;
    const one = sample([name]);
    for (const [mode, label, how] of [
      ['lossless', 'Lossless', engine],
      ['recommended', 'Recommended', engine],
      ['strongChromium', 'StrongChromium', strongChromium],
      ['strongWebkit', 'StrongWebkit', strongWebkit],
    ] as const) {
      const after = must(modes[mode]?.[name], `${mode} ${name}`);
      g.n(`${key}${label}`, after, 'bytes', one, how);
      g.n(`${key}${label}Ratio`, ratio(after, before), 'ratio', one, how);
    }
  }
  g.t('compress', ['file', 'beforeBytes', 'losslessBytes', 'recommendedBytes', 'strongBytesChromium', 'strongBytesWebkit'], COMPRESSIBLE.map((name) => [
    name, pdfFixture(name).length, must(modes['lossless']?.[name], name), must(modes['recommended']?.[name], name), must(modes['strongChromium']?.[name], name), must(modes['strongWebkit']?.[name], name),
  ]), accepted, [engine, strongChromium, strongWebkit]);
  return g.done();
}

// ---- 3. Social media image sizes ---------------------------------------------------------------------------------

const READ = '2026-11-01';
/** Read on the networks' own help pages on 2026-11-01 (prompt F5b, decision 2.3). A limit is stored in bytes, 1 MB = 1,000,000. */
export const OFFICIAL_SIZES: OfficialSize[] = [
  { id: 'instagram-feed', network: 'Instagram', use: 'Feed photo at its tallest ratio, 3:4', width: 1080, height: 1440, limit: null, ad: false, source: { href: 'https://help.instagram.com/1631821640426723/?locale=en_US', title: 'Image resolution of photos you share on Instagram', read: READ } },
  { id: 'instagram-reel-cover', network: 'Instagram', use: 'Reel cover photo', width: 420, height: 654, limit: null, ad: false, source: { href: 'https://help.instagram.com/1038071743007909/?locale=en_US', title: 'Reel size & aspect ratios on Instagram', read: READ } },
  { id: 'facebook-profile', network: 'Facebook', use: 'Page profile picture', width: 320, height: 320, limit: null, ad: false, source: { href: 'https://www.facebook.com/help/125379114252045?locale=en_US', title: 'Facebook Page profile picture and cover photo dimensions', read: READ } },
  { id: 'facebook-cover', network: 'Facebook', use: 'Page cover photo, fastest under 100 KB', width: 851, height: 315, limit: 100_000, ad: false, source: { href: 'https://www.facebook.com/help/125379114252045?locale=en_US', title: 'Facebook Page profile picture and cover photo dimensions', read: READ } },
  { id: 'facebook-link', network: 'Facebook', use: 'Image of a shared link', width: 1200, height: 630, limit: 8_000_000, ad: false, source: { href: 'https://developers.facebook.com/documentation/sharing/webmasters/images', title: 'Images in Link Shares', read: READ } },
  { id: 'x-profile', network: 'X', use: 'Profile photo', width: 400, height: 400, limit: 2_000_000, ad: false, source: { href: 'https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo', title: 'Help with uploading a profile photo', read: READ } },
  { id: 'x-header', network: 'X', use: 'Header photo', width: 1500, height: 500, limit: null, ad: false, source: { href: 'https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo', title: 'Help with uploading a profile photo', read: READ } },
  { id: 'linkedin-post', network: 'LinkedIn', use: 'Photo in a post, recommended width at the tallest ratio, 4:5', width: 1080, height: 1350, limit: 5_000_000, ad: false, source: { href: 'https://www.linkedin.com/help/lms/answer/a527229?lang=en', title: 'Share photos on LinkedIn', read: READ } },
  { id: 'linkedin-profile-cover', network: 'LinkedIn', use: 'Profile cover image', width: 1584, height: 396, limit: 8_000_000, ad: false, source: { href: 'https://www.linkedin.com/help/linkedin/answer/a568217/add-or-change-the-background-photo-on-your-profile?lang=en', title: 'Add or change the cover image on your profile', read: READ } },
  { id: 'linkedin-page-cover', network: 'LinkedIn', use: 'Page cover image', width: 1512, height: 256, limit: 3_000_000, ad: false, source: { href: 'https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=en', title: 'Image specifications for your LinkedIn Pages and Career Pages', read: READ } },
  { id: 'youtube-banner', network: 'YouTube', use: 'Channel banner, smallest upload', width: 2048, height: 1152, limit: 6_000_000, ad: false, source: { href: 'https://support.google.com/youtube/answer/10456525?hl=en', title: 'Manage your channel branding', read: READ } },
  { id: 'pinterest-pin', network: 'Pinterest', use: 'Pin, from the ad specs', width: 1000, height: 1500, limit: 20_000_000, ad: true, source: { href: 'https://help.pinterest.com/en/business/article/pinterest-product-specs', title: 'Review ad specs', read: READ } },
];
/** The YouTube thumbnail: 16:9, at least 640 px wide, 2 MB on the phone app (the preset makes 1280 × 720 under 2,000,000 bytes). */
export const YOUTUBE_THUMBNAIL: OfficialSize = {
  id: 'youtube-thumbnail', network: 'YouTube', use: 'Video thumbnail, 16:9, uploaded from the phone app', width: 1280, height: 720, limit: 2_000_000, ad: false,
  source: { href: 'https://support.google.com/youtube/answer/72431?hl=en', title: 'Add custom thumbnails on YouTube', read: READ },
};

async function socialSizes(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos of the fixtures: one portrait (3:4), two landscape (4:3)');
  const rows: Cell[][] = [];
  const methods: Method[] = [];
  let outputs = 0;
  let exact = 0;
  let underLimit = 0;
  let withLimit = 0;
  let largest = 0;
  for (const browser of BROWSERS) {
    for (const box of OFFICIAL_SIZES) {
      ctx.log(`  Resize to ${box.width} x ${box.height} (${box.id}) in ${browser}`);
      const run = await runImages(ctx, browser, '/resize-image/', PHOTOS.map(imageFile), async (page) => {
        await typeField(page, '#rz-width', String(box.width));
        await typeField(page, '#rz-height', String(box.height));
      });
      if (!methods.some((how) => how.runner === 'playwright' && how.browser === browser)) methods.push(run.how);
      const sizes: number[] = [];
      for (const photo of PHOTOS) {
        const bytes = must(run.by.get(stem(photo)), `${photo} at ${box.id}`);
        const size = shownSize(bytes);
        sizes.push(bytes.length);
        rows.push([box.id, photo, browser, size.width, size.height, bytes.length, box.limit === null ? null : bytes.length <= box.limit]);
        if (browser === 'chromium') {
          outputs += 1;
          if (size.width === box.width && size.height === box.height) exact += 1;
          if (box.limit !== null) {
            withLimit += 1;
            if (bytes.length <= box.limit) underLimit += 1;
          }
          largest = Math.max(largest, bytes.length);
        }
      }
      const key = box.id.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
      g.n(`${key}Max${B[browser]}`, Math.max(...sizes), 'bytes', photos, run.how);
      g.n(`${key}Min${B[browser]}`, Math.min(...sizes), 'bytes', photos, run.how);
    }
  }
  const chromiumHow = must(methods[0], 'chromium');
  g.n('sizes', OFFICIAL_SIZES.length, 'count', photos, chromiumHow);
  g.n('outputs', outputs, 'count', photos, chromiumHow);
  g.n('exactFrames', exact, 'count', photos, chromiumHow);
  g.n('withLimit', withLimit, 'count', photos, chromiumHow);
  g.n('underLimit', underLimit, 'count', photos, chromiumHow);
  g.n('largestOutput', largest, 'bytes', photos, chromiumHow);
  // The portrait photo in the Instagram box and the landscape one in the LinkedIn post box: what "fits inside" gives.
  const at = (box: string, photo: string, browser: BrowserName): Cell[] => must(rows.find((row) => row[0] === box && row[1] === photo && row[2] === browser), `${box} ${photo}`);
  const portrait = at('instagram-feed', 'jpg-01-pixel2-retrato-gps.jpg', 'chromium');
  const landscape = at('instagram-feed', 'jpg-02-iphone6-paisagem-gps.jpg', 'chromium');
  g.n('instagramPortraitWidth', portrait[3] as number, 'px', sample([portrait[1] as string]), chromiumHow);
  g.n('instagramPortraitHeight', portrait[4] as number, 'px', sample([portrait[1] as string]), chromiumHow);
  g.n('instagramLandscapeWidth', landscape[3] as number, 'px', sample([landscape[1] as string]), chromiumHow);
  g.n('instagramLandscapeHeight', landscape[4] as number, 'px', sample([landscape[1] as string]), chromiumHow);
  const cover = at('facebook-cover', 'jpg-02-iphone6-paisagem-gps.jpg', 'chromium');
  g.n('facebookCoverLandscapeWidth', cover[3] as number, 'px', sample([cover[1] as string]), chromiumHow);
  g.n('facebookCoverLandscapeHeight', cover[4] as number, 'px', sample([cover[1] as string]), chromiumHow);
  g.t('resized', ['size', 'photo', 'browser', 'width', 'height', 'bytes', 'underLimit'], rows, photos, methods);

  // The YouTube preset: centre crop to 16:9, then exactly 1280 × 720, a JPEG under 2,000,000 bytes.
  const thumbRows: Cell[][] = [];
  const thumbHow: Method[] = [];
  for (const browser of BROWSERS) {
    ctx.log(`  YouTube thumbnail preset in ${browser}`);
    const run = await runImages(ctx, browser, '/resize-image/youtube-thumbnail/', PHOTOS.map(imageFile));
    thumbHow.push(run.how);
    const sizes: number[] = [];
    let exactThumbs = 0;
    for (const photo of PHOTOS) {
      const bytes = must(run.by.get(stem(photo)), `${photo} thumbnail`);
      const size = shownSize(bytes);
      sizes.push(bytes.length);
      if (size.width === YOUTUBE_THUMBNAIL.width && size.height === YOUTUBE_THUMBNAIL.height) exactThumbs += 1;
      thumbRows.push([photo, browser, size.width, size.height, bytes.length]);
    }
    g.n(`thumbnailMax${B[browser]}`, Math.max(...sizes), 'bytes', photos, run.how);
    g.n(`thumbnailExact${B[browser]}`, exactThumbs, 'count', photos, run.how);
  }
  g.t('thumbnail', ['photo', 'browser', 'width', 'height', 'bytes'], thumbRows, photos, thumbHow);
  return g.done([...OFFICIAL_SIZES, YOUTUBE_THUMBNAIL]);
}

// ---- 4. Open WebP and save as JPG -----------------------------------------------------------------------------

const WEBP_EXIF = 'gen-webp-exif-gps.webp';
const WEBP_ANIMATED = 'gen-webp-animada.webp';

async function webpToJpg(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const made = node(NODE_WEBP);
  const copies = new Map<string, Uint8Array>();
  for (const photo of PHOTOS) copies.set(photo, await webpOf(imageFixture(photo)));
  const photos = sample(PHOTOS, 'the three real phone photos, each written as WebP by the engine at the quality of the site WebP encoder');
  const jpgTotal = sum(PHOTOS.map((photo) => imageFixture(photo).length));
  const webpTotal = sum([...copies.values()].map((bytes) => bytes.length));
  g.n('jpgTotal', jpgTotal, 'bytes', photos, made);
  g.n('webpTotal', webpTotal, 'bytes', photos, made);
  g.n('webpRatio', ratio(webpTotal, jpgTotal), 'ratio', photos, made);
  const exifSample = sample([WEBP_EXIF]);
  const animatedSample = sample([WEBP_ANIMATED]);
  const meta = node(NODE_IMAGE);
  g.n('exifGpsBefore', photoFacts(imageFixture(WEBP_EXIF)).gps === 'real' ? 1 : 0, 'count', exifSample, meta);
  g.n('animatedFrames', webpFrames(imageFixture(WEBP_ANIMATED)).length, 'count', animatedSample, meta);
  const rows: Cell[][] = [];
  const methods: Method[] = [made];
  const files = [...PHOTOS.map((photo) => bytesFile(`${stem(photo)}.webp`, must(copies.get(photo), photo), 'image/webp')), imageFile(WEBP_EXIF), imageFile(WEBP_ANIMATED)];
  for (const browser of BROWSERS) {
    ctx.log(`  WebP to JPG in ${browser}`);
    const run = await runImages(ctx, browser, '/webp-to-jpg/', files);
    methods.push(run.how);
    const out = (name: string): Uint8Array => must(run.by.get(stem(name)), `${name} in ${browser}`);
    const back = sum(PHOTOS.map((photo) => out(photo).length));
    g.n(`backTotal${B[browser]}`, back, 'bytes', photos, run.how);
    g.n(`backRatio${B[browser]}`, ratio(back, webpTotal), 'ratio', photos, run.how);
    g.n(`backVsOriginal${B[browser]}`, ratio(back, jpgTotal), 'ratio', photos, run.how);
    g.n(`exifGpsAfter${B[browser]}`, noGps(out(WEBP_EXIF)) ? 0 : 1, 'count', exifSample, run.how);
    g.n(`exifJpgBytes${B[browser]}`, out(WEBP_EXIF).length, 'bytes', exifSample, run.how);
    g.n(`animatedJpgBytes${B[browser]}`, out(WEBP_ANIMATED).length, 'bytes', animatedSample, run.how);
    g.n(`firstFrameNote${B[browser]}`, /first frame/i.test(run.notes) ? 1 : 0, 'count', animatedSample, run.how);
    for (const photo of PHOTOS) rows.push([photo, browser, imageFixture(photo).length, must(copies.get(photo), photo).length, out(photo).length]);
  }
  g.n('exifWebpSize', imageFixture(WEBP_EXIF).length, 'bytes', exifSample, meta);
  g.t('copies', ['photo', 'browser', 'originalJpgBytes', 'webpBytes', 'jpgFromWebpBytes'], rows, photos, methods);
  return g.done();
}

// ---- 5. JPG or PNG -----------------------------------------------------------------------------------------------

const TRANSPARENT = 'gen-png-transparente.png';

async function jpgVsPng(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos: JPG to PNG with PNG to JPG, then the PNG back to JPG');
  const pixels = node(NODE_PIXELS);
  const originals = new Map<string, Pixels>();
  for (const photo of PHOTOS) originals.set(photo, await pixelsOf(imageFixture(photo)));
  const jpgTotal = sum(PHOTOS.map((photo) => imageFixture(photo).length));
  g.n('jpgTotal', jpgTotal, 'bytes', photos, node(NODE_IMAGE));
  const rows: Cell[][] = [];
  const methods: Method[] = [pixels];
  const transparent = sample([TRANSPARENT]);
  const corners = (data: Uint8ClampedArray | Uint8Array, width: number, height: number): number[][] =>
    [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]].map(([x, y]) => {
      const at = ((y as number) * width + (x as number)) * 4;
      return [data[at] as number, data[at + 1] as number, data[at + 2] as number, data[at + 3] as number];
    });
  const source = pngPixels(imageFixture(TRANSPARENT));
  g.n('transparentCornersBefore', corners(source.rgba, source.width, source.height).filter((corner) => corner[3] === 0).length, 'count', transparent, pixels);
  for (const browser of BROWSERS) {
    ctx.log(`  JPG to PNG and back in ${browser}`);
    const toPng = await runImages(ctx, browser, '/png-to-jpg/', PHOTOS.map(imageFile));
    const pngs = PHOTOS.map((photo) => must(toPng.by.get(stem(photo)), `${photo} as PNG`));
    const back = await runImages(ctx, browser, '/png-to-jpg/', [...pngs.map((png, index) => bytesFile(`${stem(PHOTOS[index] as string)}.png`, png, 'image/png')), imageFile(TRANSPARENT)]);
    methods.push(toPng.how);
    const jpgs = PHOTOS.map((photo) => must(back.by.get(stem(photo)), `${photo} back as JPG`));
    const pngTotal = sum(pngs.map((png) => png.length));
    const backTotal = sum(jpgs.map((jpg) => jpg.length));
    g.n(`pngTotal${B[browser]}`, pngTotal, 'bytes', photos, toPng.how);
    g.n(`pngRatio${B[browser]}`, ratio(pngTotal, jpgTotal), 'ratio', photos, toPng.how);
    const pngRatios = PHOTOS.map((photo, index) => ratio((pngs[index] as Uint8Array).length, imageFixture(photo).length));
    g.n(`pngRatioMin${B[browser]}`, Math.min(...pngRatios), 'ratio', photos, toPng.how);
    g.n(`pngRatioMax${B[browser]}`, Math.max(...pngRatios), 'ratio', photos, toPng.how);
    g.n(`backTotal${B[browser]}`, backTotal, 'bytes', photos, back.how);
    g.n(`backRatio${B[browser]}`, ratio(backTotal, pngTotal), 'ratio', photos, back.how);
    const pngPsnr: number[] = [];
    const jpgPsnr: number[] = [];
    for (const [index, photo] of PHOTOS.entries()) {
      const original = must(originals.get(photo), photo);
      const p = psnrOf(original, await pixelsOf(pngs[index] as Uint8Array));
      const j = psnrOf(original, await pixelsOf(jpgs[index] as Uint8Array));
      if (p === null || j === null) throw new Error(`${photo}: the copies changed size`);
      pngPsnr.push(p);
      jpgPsnr.push(j);
      rows.push([photo, browser, imageFixture(photo).length, (pngs[index] as Uint8Array).length, (jpgs[index] as Uint8Array).length, Number.isFinite(p) ? decibels(p) : 'same pixels', decibels(j)]);
    }
    // A PNG of a JPG keeps the decoded pixels: identical ones have no finite PSNR, so they are counted instead.
    g.n(`pngIdentical${B[browser]}`, pngPsnr.filter((value) => value === Infinity).length, 'count', photos, pixels);
    const finitePng = pngPsnr.filter((value) => Number.isFinite(value));
    if (finitePng.length > 0) g.n(`pngPsnrMin${B[browser]}`, decibels(Math.min(...finitePng)), 'db', photos, pixels);
    g.n(`backPsnrMin${B[browser]}`, decibels(Math.min(...jpgPsnr)), 'db', photos, pixels);
    g.n(`backPsnrMax${B[browser]}`, decibels(Math.max(...jpgPsnr)), 'db', photos, pixels);
    const flat = must(back.by.get(stem(TRANSPARENT)), 'the transparent PNG as JPG');
    const flatPixels = await pixelsOf(flat);
    const white = corners(flatPixels.data, flatPixels.width, flatPixels.height).filter((corner) => (corner[0] as number) >= 250 && (corner[1] as number) >= 250 && (corner[2] as number) >= 250).length;
    g.n(`transparentCornersWhite${B[browser]}`, white, 'count', transparent, back.how);
    g.n(`transparentJpgBytes${B[browser]}`, flat.length, 'bytes', transparent, back.how);
    g.n(`flattenedNote${B[browser]}`, /white|transparen/i.test(back.notes) ? 1 : 0, 'count', transparent, back.how);
  }
  g.n('transparentPngBytes', imageFixture(TRANSPARENT).length, 'bytes', transparent, node(NODE_IMAGE));
  g.t('roundTrip', ['photo', 'browser', 'jpgBytes', 'pngBytes', 'backBytes', 'pngPsnrDb', 'backPsnrDb'], rows, photos, methods);
  return g.done();
}

// ---- 6. Remove location data ---------------------------------------------------------------------------------------

interface Candidate {
  tool: string;
  path: string;
  /** The option of the tool that changes the photo least, set in one step (DECISOES § 186). */
  option: string;
  setup?: (page: Page) => Promise<void>;
  pdf?: true;
}

const CANDIDATES: Candidate[] = [
  { tool: 'compress-image', path: '/compress-image/', option: 'Recommended, the lighter of its two levels' },
  { tool: 'resize-image', path: '/resize-image/', option: 'By percentage, 100', setup: async (page) => {
    await option(page, 'By percentage');
    await typeField(page, '#rz-percent', '100');
  } },
  { tool: 'crop-image', path: '/crop-image/', option: 'Square, the default (the whole picture needs four fields)' },
  { tool: 'rotate-image', path: '/rotate-image/', option: 'Right, the default (there is no turn of zero)' },
  { tool: 'png-to-jpg', path: '/png-to-jpg/', option: 'the default: a JPG becomes a PNG' },
  { tool: 'image-to-pdf', path: '/image-to-pdf/', option: 'Fit to image, the default', pdf: true },
];

async function removeLocation(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos of the fixtures, all three with GPS');
  const meta = node(NODE_IMAGE);
  const pixels = node(NODE_PIXELS);
  const before = PHOTOS.map((photo) => photoFacts(imageFixture(photo)));
  g.n('photos', PHOTOS.length, 'count', photos, meta);
  g.n('withGps', before.filter((fact) => fact.gps === 'real').length, 'count', photos, meta);
  g.n('withCamera', before.filter((fact) => fact.camera !== null).length, 'count', photos, meta);
  g.n('withDate', before.filter((fact) => fact.taken !== null).length, 'count', photos, meta);
  const heic = HEIC.map((name) => photoFacts(imageFixture(name)));
  const heicSample = sample(HEIC, 'every HEIC photo of the fixtures');
  g.n('heicFiles', HEIC.length, 'count', heicSample, meta);
  g.n('heicWithGps', heic.filter((fact) => fact.gps === 'real').length, 'count', heicSample, meta);
  g.n('heicWithCamera', heic.filter((fact) => fact.camera !== null).length, 'count', heicSample, meta);
  const originals = new Map<string, Pixels>();
  for (const photo of PHOTOS) originals.set(photo, await pixelsOf(imageFixture(photo)));
  const total = sum(PHOTOS.map((photo) => imageFixture(photo).length));
  const rows: Cell[][] = [];
  const methods: Method[] = [meta, pixels];
  /** For the rule: per browser, the tools whose copies are JPGs of the same size as shown, with their worst PSNR and total size. */
  const ranking: Record<BrowserName, { tool: string; worst: number; bytes: number }[]> = { chromium: [], webkit: [] };
  for (const browser of BROWSERS) {
    for (const candidate of CANDIDATES) {
      ctx.log(`  ${candidate.tool} (${candidate.option}) in ${browser}`);
      const run = await runImages(ctx, browser, candidate.path, PHOTOS.map(imageFile), candidate.setup);
      if (!methods.some((how) => how.runner === 'playwright' && how.browser === browser)) methods.push(run.how);
      const key = candidate.tool.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
      if (candidate.pdf) {
        const pdf = must(run.list[0], 'the PDF');
        const report = metadataReport(pdf.bytes);
        g.n(`${key}Bytes${B[browser]}`, pdf.bytes.length, 'bytes', photos, run.how);
        g.n(`${key}Gps${B[browser]}`, report.gps || report.gpsKind !== 'none' ? 1 : 0, 'count', photos, run.how);
        rows.push([candidate.tool, browser, total, pdf.bytes.length, 'pdf', false, null, report.gps ? PHOTOS.length : 0, null]);
        continue;
      }
      const outs = PHOTOS.map((photo) => must(run.by.get(stem(photo)), `${photo} by ${candidate.tool}`));
      const after = outs.map((out) => photoFacts(out));
      const sameSize = outs.filter((out, index) => {
        const a = shownSize(out);
        const b = shownSize(imageFixture(PHOTOS[index] as string));
        return a.width === b.width && a.height === b.height;
      }).length;
      const scores: (number | null)[] = [];
      for (const [index, photo] of PHOTOS.entries()) scores.push(psnrOf(must(originals.get(photo), photo), await pixelsOf(outs[index] as Uint8Array)));
      const bytes = sum(outs.map((out) => out.length));
      const jpeg = outs.every((out) => out[0] === 0xff && out[1] === 0xd8);
      const finite = scores.filter((score): score is number => score !== null && Number.isFinite(score));
      const identical = scores.filter((score) => score === Infinity).length;
      g.n(`${key}Bytes${B[browser]}`, bytes, 'bytes', photos, run.how);
      g.n(`${key}Ratio${B[browser]}`, ratio(bytes, total), 'ratio', photos, run.how);
      g.n(`${key}SameSize${B[browser]}`, sameSize, 'count', photos, run.how);
      g.n(`${key}Identical${B[browser]}`, identical, 'count', photos, pixels);
      if (finite.length > 0) g.n(`${key}PsnrMin${B[browser]}`, decibels(Math.min(...finite)), 'db', photos, pixels);
      g.n(`${key}Gps${B[browser]}`, after.filter((fact) => fact.gps !== 'none').length, 'count', photos, run.how);
      g.n(`${key}Camera${B[browser]}`, after.filter((fact) => fact.camera !== null).length, 'count', photos, run.how);
      g.n(`${key}Date${B[browser]}`, after.filter((fact) => fact.taken !== null).length, 'count', photos, run.how);
      g.n(`${key}Orientation${B[browser]}`, after.filter((fact) => fact.orientation !== null && fact.orientation > 1).length, 'count', photos, run.how);
      rows.push([candidate.tool, browser, total, bytes, jpeg ? 'jpg' : 'png', sameSize === PHOTOS.length, identical === PHOTOS.length ? 'same pixels' : finite.length ? decibels(Math.min(...finite)) : null, after.filter((fact) => fact.gps !== 'none').length, after.filter((fact) => fact.camera !== null).length]);
      if (jpeg && sameSize === PHOTOS.length && scores.every((score) => score !== null)) {
        ranking[browser].push({ tool: candidate.tool, worst: Math.min(...scores.map((score) => score as number)), bytes });
      }
    }
  }
  // The rule fixed before the first measurement (DECISOES § 186): the most faithful worst PSNR, then the smallest file.
  const pick = (browser: BrowserName): string => must([...ranking[browser]].sort((a, b) => b.worst - a.worst || a.bytes - b.bytes)[0], `a winner in ${browser}`).tool;
  const winner = pick('chromium');
  if (pick('webkit') !== winner) throw new Error(`the browsers disagree on the tool that changes the photo least: ${winner} and ${pick('webkit')}`);
  g.fact('winner', winner);
  g.fact('winnerOption', must(CANDIDATES.find((candidate) => candidate.tool === winner), winner).option);
  g.t('candidates', ['tool', 'browser', 'beforeBytes', 'afterBytes', 'format', 'sameSize', 'psnrDb', 'withGps', 'withCamera'], rows, photos, methods);
  g.t('photos', ['photo', 'camera', 'taken', 'gps'], PHOTOS.map((photo, index) => {
    const fact = before[index] as (typeof before)[number];
    return [photo, fact.camera, fact.taken, fact.gps];
  }), photos, [meta]);
  return g.done();
}

// ---- 7. PDF to JPG: which resolution ----------------------------------------------------------------------------

const PPI = [72, 150, 300] as const;
const PPI_LABEL: Record<(typeof PPI)[number], string> = { 72: '72 ppi', 150: '150 ppi', 300: '300 ppi' };
/** The four real PDFs and the file of photos; pages 1 and 2 of each (the scanned page has one). */
const TO_JPG = ['pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-escaneado-02-relatorio-nasa-150p.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'pdf-grande-fontes-embutidas-117p.pdf', 'gen-fotos.pdf'];
const TO_JPG_KEY: Record<string, string> = {
  'pdf-escaneado-01-pagina-livro-cor.pdf': 'scan',
  'pdf-escaneado-02-relatorio-nasa-150p.pdf': 'report',
  'pdf-formulario-irs-1040-2019.pdf': 'form',
  'pdf-grande-fontes-embutidas-117p.pdf': 'book',
  'gen-fotos.pdf': 'photos',
};

async function pdfToJpg(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const pages = sample(TO_JPG, 'pages 1 and 2 of each PDF (the scanned page has only page 1)');
  const rows: Cell[][] = [];
  const methods: Method[] = [];
  for (const browser of BROWSERS) {
    for (const name of TO_JPG) {
      const single = (await breakdown(pdfFixture(name))).pages === 1;
      for (const ppi of PPI) {
        for (const format of ['jpg', 'png'] as const) {
          ctx.log(`  PDF to JPG ${name} at ${ppi} ppi, ${format}, in ${browser}`);
          const run = await runPdfTool(ctx, browser, '/pdf-to-jpg/', [pdfFile(name)], async (page) => {
            await option(page, format === 'jpg' ? 'JPG' : 'PNG');
            await option(page, PPI_LABEL[ppi]);
            if (!single) {
              await option(page, 'Page range');
              await typeField(page, '#fo-images-range', '1-2');
            }
          });
          if (!methods.some((how) => how.runner === 'playwright' && how.browser === browser)) methods.push(run.how);
          const images = [...run.list].sort((a, b) => a.name.localeCompare(b.name));
          for (const [index, image] of images.entries()) {
            const size = shownSize(image.bytes);
            rows.push([name, index + 1, ppi, format, browser, size.width, size.height, image.bytes.length]);
          }
        }
      }
    }
  }
  const find = (name: string, page: number, ppi: number, format: string, browser: BrowserName): Cell[] =>
    must(rows.find((row) => row[0] === name && row[1] === page && row[2] === ppi && row[3] === format && row[4] === browser), `${name} p${page} ${ppi} ${format} ${browser}`);
  for (const name of TO_JPG) {
    const key = TO_JPG_KEY[name] as string;
    const one = sample([name], 'page 1');
    for (const ppi of PPI) {
      const c = find(name, 1, ppi, 'jpg', 'chromium');
      g.n(`${key}Width${ppi}`, c[5] as number, 'px', one, must(methods[0], 'chromium'));
      g.n(`${key}Height${ppi}`, c[6] as number, 'px', one, must(methods[0], 'chromium'));
      for (const browser of BROWSERS) {
        const how = must(methods.find((m) => m.runner === 'playwright' && m.browser === browser), browser);
        g.n(`${key}Jpg${ppi}${B[browser]}`, find(name, 1, ppi, 'jpg', browser)[7] as number, 'bytes', one, how);
        g.n(`${key}Png${ppi}${B[browser]}`, find(name, 1, ppi, 'png', browser)[7] as number, 'bytes', one, how);
      }
    }
  }
  // The scanned page carries one picture: its own pixels against the page size say the resolution it was scanned at.
  const scan = await embeddedPpi('pdf-escaneado-01-pagina-livro-cor.pdf');
  g.n('scanImageWidth', scan.width, 'px', sample(['pdf-escaneado-01-pagina-livro-cor.pdf']), node(NODE_PDFLIB));
  g.n('scanImagePpi', scan.ppi, 'ppi', sample(['pdf-escaneado-01-pagina-livro-cor.pdf']), node(NODE_PDFLIB));
  g.t('images', ['file', 'page', 'ppi', 'format', 'browser', 'width', 'height', 'bytes'], rows, pages, methods);
  return g.done();
}

/** The width in pixels of the one image on page 1, and the ppi it makes over the page width. */
async function embeddedPpi(name: string): Promise<{ width: number; ppi: number }> {
  const { PDFDocument, PDFName, PDFNumber, PDFRawStream } = await import('@cantoo/pdf-lib');
  const doc = await PDFDocument.load(pdfFixture(name), { updateMetadata: false, ignoreEncryption: true });
  let width = 0;
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (object instanceof PDFRawStream && object.dict.get(PDFName.of('Subtype'))?.toString() === '/Image') {
      const value = object.dict.get(PDFName.of('Width'));
      if (value instanceof PDFNumber) width = Math.max(width, value.asNumber());
    }
  }
  const page = doc.getPage(0);
  const points = page.getWidth();
  return { width, ppi: Math.round(width / (points / 72)) };
}

// ---- 8. Split PDF: the parts against the whole -----------------------------------------------------------------

const SPLIT = ['pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-escaneado-02-relatorio-nasa-150p.pdf', 'pdf-formulario-irs-1040-2019.pdf', 'pdf-grande-fontes-embutidas-117p.pdf', 'gen-fotos.pdf'];

async function splitSize(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const engine = node(NODE_PDF_ENGINE);
  const all = sample(SPLIT, 'the four real PDFs of the fixtures and a file of photos, split into one part per page (the default)');
  const rows: Cell[][] = [];
  let bigger = 0;
  for (const name of SPLIT) {
    ctx.log(`  Split ${name}`);
    const key = TO_JPG_KEY[name] as string;
    const one = sample([name]);
    const split = await splitEach(name);
    g.n(`${key}Total`, split.original.total, 'bytes', one, engine);
    g.n(`${key}Parts`, split.parts, 'count', one, engine);
    g.n(`${key}Sum`, split.sum, 'bytes', one, engine);
    g.n(`${key}Ratio`, ratio(split.sum, split.original.total), 'ratio', one, engine);
    g.n(`${key}Fonts`, split.original.fonts, 'bytes', one, engine);
    g.n(`${key}PartFonts`, split.partFonts, 'bytes', one, engine);
    g.n(`${key}Images`, split.original.images, 'bytes', one, engine);
    g.n(`${key}PartImages`, split.partImages, 'bytes', one, engine);
    if (split.original.fonts > 0) g.n(`${key}FontsRatio`, ratio(split.partFonts, split.original.fonts), 'ratio', one, engine);
    if (split.sum > split.original.total) bigger += 1;
    rows.push([name, split.parts, split.original.total, split.sum, split.original.fonts, split.partFonts, split.original.images, split.partImages, split.notes.join(', ')]);
  }
  g.n('files', SPLIT.length, 'count', all, engine);
  g.n('bigger', bigger, 'count', all, engine);
  g.t('parts', ['file', 'parts', 'originalBytes', 'partsBytes', 'originalFontBytes', 'partsFontBytes', 'originalImageBytes', 'partsImageBytes', 'notes'], rows, all, [engine]);
  return g.done();
}

// ---- 9. Combine PDFs on a phone ---------------------------------------------------------------------------------

const PAIRS: [string, string, string][] = [
  ['scanForm', 'pdf-escaneado-01-pagina-livro-cor.pdf', 'pdf-formulario-irs-1040-2019.pdf'],
  ['photosScan', 'gen-fotos.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf'],
  ['bookForm', 'pdf-grande-fontes-embutidas-117p.pdf', 'pdf-formulario-irs-1040-2019.pdf'],
  ['reportScan', 'pdf-escaneado-02-relatorio-nasa-150p.pdf', 'pdf-escaneado-01-pagina-livro-cor.pdf'],
  ['mixedActions', 'gen-paginas-mistas.pdf', 'gen-acoes.pdf'],
];

async function combine(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const engine = node(NODE_PDF_ENGINE);
  const all = sample(PAIRS.flatMap(([, a, b]) => [a, b]), 'five pairs of fixtures, each merged in the order shown');
  const rows: Cell[][] = [];
  let smaller = 0;
  for (const [key, a, b] of PAIRS) {
    ctx.log(`  Merge ${a} + ${b}`);
    const pair = sample([a, b]);
    const merged = await merge([a, b]);
    const inputs = sum(merged.inputs);
    g.n(`${key}Inputs`, inputs, 'bytes', pair, engine);
    g.n(`${key}Merged`, merged.merged, 'bytes', pair, engine);
    g.n(`${key}Ratio`, ratio(merged.merged, inputs), 'ratio', pair, engine);
    if (merged.merged < inputs) smaller += 1;
    rows.push([a, b, inputs, merged.merged, merged.notes.join(', ')]);
  }
  g.n('pairs', PAIRS.length, 'count', all, engine);
  g.n('smaller', smaller, 'count', all, engine);
  g.t('pairs', ['first', 'second', 'inputBytes', 'mergedBytes', 'notes'], rows, all, [engine]);
  return g.done();
}

// ---- 10. Photos into one PDF ----------------------------------------------------------------------------------

async function photosToPdf(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos, in one PDF, then compressed first with Compress image (Recommended)');
  const total = sum(PHOTOS.map((photo) => imageFixture(photo).length));
  g.n('photosTotal', total, 'bytes', photos, node(NODE_IMAGE));
  const rows: Cell[][] = [];
  const methods: Method[] = [];
  for (const browser of BROWSERS) {
    ctx.log(`  Image to PDF in ${browser}`);
    const direct = await runImages(ctx, browser, '/image-to-pdf/', PHOTOS.map(imageFile));
    methods.push(direct.how);
    const pdf = must(direct.list[0], 'the PDF').bytes;
    const inside = await breakdown(pdf);
    ctx.log(`  Compress image, then Image to PDF, in ${browser}`);
    const compressed = await runImages(ctx, browser, '/compress-image/', PHOTOS.map(imageFile));
    const smaller = PHOTOS.map((photo) => must(compressed.by.get(stem(photo)), `${photo} compressed`));
    const after = await runImages(ctx, browser, '/image-to-pdf/', smaller.map((bytes, index) => bytesFile(PHOTOS[index] as string, bytes, 'image/jpeg')));
    const pdfAfter = must(after.list[0], 'the PDF after Compress image').bytes;
    const compressedTotal = sum(smaller.map((bytes) => bytes.length));
    g.n(`pdf${B[browser]}`, pdf.length, 'bytes', photos, direct.how);
    g.n(`pdfRatio${B[browser]}`, ratio(pdf.length, total), 'ratio', photos, direct.how);
    g.n(`pdfImages${B[browser]}`, inside.images, 'bytes', photos, direct.how);
    g.n(`compressed${B[browser]}`, compressedTotal, 'bytes', photos, compressed.how);
    g.n(`compressedRatio${B[browser]}`, ratio(compressedTotal, total), 'ratio', photos, compressed.how);
    g.n(`pdfAfter${B[browser]}`, pdfAfter.length, 'bytes', photos, after.how);
    g.n(`pdfAfterRatio${B[browser]}`, ratio(pdfAfter.length, total), 'ratio', photos, after.how);
    g.n(`pdfAfterVsCompressed${B[browser]}`, ratio(pdfAfter.length, compressedTotal), 'ratio', photos, after.how);
    g.n(`pdfGps${B[browser]}`, metadataReport(pdf).gps ? 1 : 0, 'count', photos, direct.how);
    rows.push([browser, total, pdf.length, compressedTotal, pdfAfter.length]);
  }
  g.t('pdfs', ['browser', 'photosBytes', 'pdfBytes', 'compressedBytes', 'pdfAfterBytes'], rows, photos, methods);
  return g.done();
}

export const PLANS: Record<FileGuideId, (ctx: Context) => Promise<GuideMeasure>> = {
  'guides-heic-to-jpg-on-windows': heicToJpg,
  'guides-why-is-my-pdf-so-large': pdfLarge,
  'guides-social-media-image-sizes': socialSizes,
  'guides-open-webp-save-as-jpg': webpToJpg,
  'guides-jpg-vs-png': jpgVsPng,
  'guides-remove-location-from-photos': removeLocation,
  'guides-pdf-to-jpg-resolution': pdfToJpg,
  'guides-split-pdf-file-size': splitSize,
  'guides-combine-pdfs-on-phone': combine,
  'guides-photos-to-one-pdf': photosToPdf,
};
