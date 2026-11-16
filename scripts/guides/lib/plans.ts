// What each of the ten guides measures (prompt F5b, decision 2), and each file guide of the F19b (prompt F19b, decision 3,
// guides 11 to 14 below), on the fixtures, by the path a person's file takes:
// the browser where the site writes with the canvas, Node where it runs WebAssembly or pdf-lib. Every number goes into
// data/guides-measured.json with its sample, method, date and commit; the guides only read them.
import { randomUUID } from 'node:crypto';
import { readdirSync } from 'node:fs';
import type { FileGuideId } from '../../../src/tools/guides/registry.ts';
import type { Cell, GuideMeasure, MeasuredNumber, MeasuredTable, Method, OfficialSize, Sample, Unit } from '../../../src/tools/guides/measured-types.ts';
import type { Page } from '@playwright/test';
import type { TestFile } from '../../../tests/e2e/lib/page.ts';
import { parseBmff } from '../../../tests/e2e/lib/bmff.ts';
import { metadataReport, sniff } from '../../../tests/e2e/lib/images.ts';
import { opensWithoutPassword, readWithPdfjs, type ReadPdf } from '../../../tests/e2e/lib/pdfjs-read.ts';
import { pngPixels } from '../../../tests/e2e/lib/png.ts';
import { webpFrames, webpInfo } from '../../../tests/e2e/lib/webp.ts';
import { BROWSERS, bytesFile, download, drop, fileOf, imageResult, method, openTool, option, stem, typeField, type BrowserName, type Out, type Session } from './browser.ts';
import { NODE_CORNERS, NODE_DQT, NODE_FULL_SIZE, clearCorners, cornersOf, fullSizeQuality, qualityOf, whiteCorners } from './node-codecs.ts';
import { NODE_IMAGE, NODE_PIXELS, NODE_WEBP, imageFixture, photoFacts, pixelsOf, psnrOf, shownSize, webpOf, type Pixels } from './node-image.ts';
import { NODE_PDFJS, NODE_PDFLIB, NODE_PDF_ENGINE, NODE_QPDF_JSON, breakdown, compress, encryptionOf, lockFresh, merge, pdfFixture, signatureParts, splitEach, type SignatureParts } from './node-pdf.ts';
import { decibels, inBrowser, inNode, label, median, num, ratio, sample, sum, table, type Column, type Stamp } from './record.ts';
import enCommon from '../../../src/i18n/en/common.ts';

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
    t(name: string, columns: Column[], rows: Cell[][], sampled: Sample, methods: Method[]): void {
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
  g.t('files', [label('file'), label('camera'), inNode('heicBytes', 'bytes'), inNode('width', 'px'), inNode('height', 'px'), inBrowser('jpgBytesChromium', 'bytes'), inBrowser('jpgBytesWebkit', 'bytes'), label('gpsBefore'), inBrowser('gpsAfter', 'label')], inputs.map((input, index) => {
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
/** The other files Compress PDF takes, written by the fixture script (fixtures/ORIGEM.md); the text cites them too. */
const OTHER_COMPRESS: Record<string, string> = {
  actions: 'gen-acoes.pdf',
  textOnly: 'gen-paginas-300.pdf',
  mixed: 'gen-paginas-mistas.pdf',
  damaged: 'gen-xref-estragada.pdf',
};
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
  g.n('spaceFiles', PDF_KEYS.length, 'count', named, lib);
  g.t('space', [label('file'), inNode('pages', 'count'), inNode('totalBytes', 'bytes'), inNode('imageBytes', 'bytes'), inNode('images', 'count'), inNode('fontBytes', 'bytes'), inNode('fonts', 'count'), inNode('otherBytes', 'bytes')], rows, named, [lib]);

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
    for (const [mode, suffix, how] of [
      ['lossless', 'Lossless', engine],
      ['recommended', 'Recommended', engine],
      ['strongChromium', 'StrongChromium', strongChromium],
      ['strongWebkit', 'StrongWebkit', strongWebkit],
    ] as const) {
      const after = must(modes[mode]?.[name], `${mode} ${name}`);
      g.n(`${key}${suffix}`, after, 'bytes', one, how);
      g.n(`${key}${suffix}Ratio`, ratio(after, before), 'ratio', one, how);
    }
    g.n(`${key}LosslessSaved`, before - must(modes['lossless']?.[name], `lossless ${name}`), 'bytes', one, engine);
  }
  // The files of the Compress table that are not in the table of what takes the space: the Node modes, which the text
  // cites (DECISOES § 197), and an exact twin for each cell the --check compares.
  for (const [key, name] of Object.entries(OTHER_COMPRESS)) {
    const before = pdfFixture(name).length;
    const one = sample([name]);
    for (const [mode, suffix] of [['lossless', 'Lossless'], ['recommended', 'Recommended']] as const) {
      const after = must(modes[mode]?.[name], `${mode} ${name}`);
      g.n(`${key}${suffix}`, after, 'bytes', one, engine);
      g.n(`${key}${suffix}Ratio`, ratio(after, before), 'ratio', one, engine);
    }
  }
  g.t('compress', [label('file'), inNode('beforeBytes', 'bytes'), inNode('losslessBytes', 'bytes'), inNode('recommendedBytes', 'bytes'), inBrowser('strongBytesChromium', 'bytes'), inBrowser('strongBytesWebkit', 'bytes')], COMPRESSIBLE.map((name) => [
    name, pdfFixture(name).length, must(modes['lossless']?.[name], name), must(modes['recommended']?.[name], name), must(modes['strongChromium']?.[name], name), must(modes['strongWebkit']?.[name], name),
  ]), accepted, [engine, strongChromium, strongWebkit]);
  return g.done();
}

// ---- 3. Social media image sizes ---------------------------------------------------------------------------------

const READ = '2026-11-01';
/**
 * Read on the networks' own help pages on 2026-11-01 (prompt F5b, decision 2.3). A limit is stored in bytes, 1 MB =
 * 1,000,000. `stated` keeps the words of the page that give the size and the limit (DECISOES § 198): the test checks
 * that each size is in them. The Instagram and X pages give a reader only "Help Center" or an HTTP 403, so their words
 * are the page's own text as the search engine shows it.
 */
export const OFFICIAL_SIZES: OfficialSize[] = [
  { id: 'instagram-feed', network: 'Instagram', use: 'Feed photo at its tallest ratio, 3:4', width: 1080, height: 1440, limit: null, ad: false, stated: "When you share a photo that has a width between 320 and 1080 pixels, we keep that photo at its original resolution as long as the photo's aspect ratio is between 1.91:1 and 3:4.", source: { href: 'https://help.instagram.com/1631821640426723/?locale=en_US', title: 'Image resolution of photos you share on Instagram', read: READ } },
  { id: 'instagram-reel-cover', network: 'Instagram', use: 'Reel cover photo', width: 420, height: 654, limit: null, ad: false, stated: 'Instagram recommends 420px by 654px (or 1:1.55 ratio).', source: { href: 'https://help.instagram.com/1038071743007909/?locale=en_US', title: 'Reel size & aspect ratios on Instagram', read: READ } },
  { id: 'facebook-profile', network: 'Facebook', use: 'Page profile picture', width: 320, height: 320, limit: null, ad: false, stated: 'Should be 320 pixels wide and 320 pixels tall for best quality.', source: { href: 'https://www.facebook.com/help/125379114252045?locale=en_US', title: 'Facebook Page profile picture and cover photo dimensions', read: READ } },
  { id: 'facebook-cover', network: 'Facebook', use: 'Page cover photo, fastest under 100 KB', width: 851, height: 315, limit: 100_000, ad: false, stated: "Loads fastest as an sRGB JPG file that's 851 pixels wide, 315 pixels tall and less than 100 kilobytes.", source: { href: 'https://www.facebook.com/help/125379114252045?locale=en_US', title: 'Facebook Page profile picture and cover photo dimensions', read: READ } },
  { id: 'facebook-link', network: 'Facebook', use: 'Image of a shared link', width: 1200, height: 630, limit: 8_000_000, ad: false, stated: 'Use images that are at least 1200 x 630 pixels for the best display on high resolution devices. The size of the image file must not exceed 8 MB.', source: { href: 'https://developers.facebook.com/documentation/sharing/webmasters/images', title: 'Images in Link Shares', read: READ } },
  { id: 'x-profile', network: 'X', use: 'Profile photo', width: 400, height: 400, limit: 2_000_000, ad: false, stated: 'Use JPEG, GIF, or PNG files under 2MB with recommended dimensions of 400x400 pixels.', source: { href: 'https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo', title: 'Help with uploading a profile photo', read: READ } },
  { id: 'x-header', network: 'X', use: 'Header photo', width: 1500, height: 500, limit: null, ad: false, stated: 'Header photo, also known as a "banner" (recommended dimensions are 1500x500 pixels).', source: { href: 'https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo', title: 'Help with uploading a profile photo', read: READ } },
  { id: 'linkedin-post', network: 'LinkedIn', use: 'Photo in a post, recommended width at the tallest ratio, 4:5', width: 1080, height: 1350, limit: 5_000_000, ad: false, stated: "Photo must be at least 552 (w) x 276 (h) pixels, but we recommend 1080 (w) pixels to better connect with your audience. The photo's aspect ratio can range from 3:1 to 4:5 (width:height). The size limit for an upload is 5 MB.", source: { href: 'https://www.linkedin.com/help/lms/answer/a527229?lang=en', title: 'Share photos on LinkedIn', read: READ } },
  { id: 'linkedin-profile-cover', network: 'LinkedIn', use: 'Profile cover image', width: 1584, height: 396, limit: 8_000_000, ad: false, stated: 'Lesser than 8MB. 1584 (w) x 396 (h) pixels (recommended).', source: { href: 'https://www.linkedin.com/help/linkedin/answer/a568217/add-or-change-the-background-photo-on-your-profile?lang=en', title: 'Add or change the cover image on your profile', read: READ } },
  { id: 'linkedin-page-cover', network: 'LinkedIn', use: 'Page cover image', width: 1512, height: 256, limit: 3_000_000, ad: false, stated: 'Cover image: 1512 (w) x 256 (h) pixels. All images must be PNG or JPEG files and have a maximum size of 3MB.', source: { href: 'https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=en', title: 'Image specifications for your LinkedIn Pages and Career Pages', read: READ } },
  { id: 'youtube-banner', network: 'YouTube', use: 'Channel banner, smallest upload', width: 2048, height: 1152, limit: 6_000_000, ad: false, stated: 'Minimum dimension for upload: 2048 x 1152 px with an aspect ratio of 16:9. File size: 6 MB or smaller.', source: { href: 'https://support.google.com/youtube/answer/10456525?hl=en', title: 'Manage your channel branding', read: READ } },
  { id: 'pinterest-pin', network: 'Pinterest', use: 'Pin, uploaded from a computer', width: 1000, height: 1500, limit: 20_000_000, ad: true, stated: 'We recommend using a 2:3 aspect ratio, or 1000 x 1500 pixels. Max file size: Desktop 20 MB, In-app 32 MB.', source: { href: 'https://help.pinterest.com/en/business/article/pinterest-product-specs', title: 'Review ad specs', read: READ } },
];
/**
 * The YouTube thumbnail as its help page gives it (DECISOES § 198): 3840 × 2160 recommended, at least 640 pixels wide,
 * 16:9 suggested, 2 MB from the phone app. The preset of the site makes a smaller frame on purpose, so the file stays
 * under those 2 MB (DECISOES § 60); that frame is measured on the outputs, never written here as the official size.
 */
export const YOUTUBE_THUMBNAIL: OfficialSize = {
  id: 'youtube-thumbnail', network: 'YouTube', use: 'Video thumbnail, recommended size, uploaded from the phone app', width: 3840, height: 2160, limit: 2_000_000, ad: false,
  stated: 'Have a resolution of 3840 x 2160 pixels for videos, with a minimum width of 640 pixels for videos. For videos, try to upload a thumbnail with an aspect ratio of 16:9. Mobile: 2 MB for video thumbnails or 10 MB for podcasts.',
  source: { href: 'https://support.google.com/youtube/answer/72431?hl=en', title: 'Add custom thumbnails on YouTube', read: READ },
};
/** What the preset's own operation makes (src/tools/resize-image/presets/youtube-thumbnail/Panel.tsx). */
const YOUTUBE_PRESET = { width: 1280, height: 720 };

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
  g.n('photos', PHOTOS.length, 'count', photos, node(NODE_IMAGE));
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
  g.t('resized', [label('size'), label('photo'), label('browser'), inBrowser('width', 'px'), inBrowser('height', 'px'), inBrowser('bytes', 'bytes'), inBrowser('underLimit', 'label')], rows, photos, methods);

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
      if (size.width === YOUTUBE_PRESET.width && size.height === YOUTUBE_PRESET.height) exactThumbs += 1;
      thumbRows.push([photo, browser, size.width, size.height, bytes.length]);
    }
    g.n(`thumbnailMax${B[browser]}`, Math.max(...sizes), 'bytes', photos, run.how);
    g.n(`thumbnailExact${B[browser]}`, exactThumbs, 'count', photos, run.how);
    if (browser === 'chromium') {
      // The frame the preset made, read on its outputs (one shape for every photo, or the guide could not name one).
      const shapes = new Set(thumbRows.filter((row) => row[1] === browser).map((row) => `${String(row[2])}x${String(row[3])}`));
      if (shapes.size !== 1) throw new Error(`the YouTube preset made ${shapes.size} shapes`);
      const first = must(thumbRows.find((row) => row[1] === browser), 'a thumbnail');
      g.n('thumbnailWidth', first[2] as number, 'px', photos, run.how);
      g.n('thumbnailHeight', first[3] as number, 'px', photos, run.how);
    }
  }
  g.t('thumbnail', [label('photo'), label('browser'), inBrowser('width', 'px'), inBrowser('height', 'px'), inBrowser('bytes', 'bytes')], thumbRows, photos, thumbHow);
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
  g.n('photos', PHOTOS.length, 'count', photos, node(NODE_IMAGE));
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
  g.t('copies', [label('photo'), label('browser'), inNode('originalJpgBytes', 'bytes'), inNode('webpBytes', 'bytes'), inBrowser('jpgFromWebpBytes', 'bytes')], rows, photos, methods);
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
  g.n('photos', PHOTOS.length, 'count', photos, node(NODE_IMAGE));
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
  g.t('roundTrip', [label('photo'), label('browser'), inNode('jpgBytes', 'bytes'), inBrowser('pngBytes', 'bytes'), inBrowser('backBytes', 'bytes'), inBrowser('pngPsnrDb', 'db'), inBrowser('backPsnrDb', 'db')], rows, photos, methods);
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

/** The name a tool card gives a tool, for the facts the text reads. */
const toolName = (tool: string): string => (enCommon.tools as Record<string, { name: string }>)[tool]?.name ?? (enCommon.pdf as Record<string, { name: string }>)[tool]?.name ?? tool;

// F18 (DECISOES § 733): Remove EXIF data takes JPG and has no option, so it is a candidate of the rule as it is. It gives
// back the same bytes as Resize image at 100 % (both through strip.ts), which the rule of § 186 leaves tied; the tie goes to
// the tool with no option to set (the `steps` of the ranking), and the list keeps it before Resize image as well.
const CANDIDATES: Candidate[] = [
  { tool: 'compress-image', path: '/compress-image/', option: 'Recommended, the lighter of its two levels' },
  { tool: 'remove-exif-data', path: '/remove-exif-data/', option: 'none: it has no option to set' },
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
  const ranking: Record<BrowserName, { tool: string; worst: number; bytes: number; steps: number }[]> = { chromium: [], webkit: [] };
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
        ranking[browser].push({ tool: candidate.tool, worst: Math.min(...scores.map((score) => score as number)), bytes, steps: candidate.setup ? 1 : 0 });
      }
    }
  }
  // The rule fixed before the first measurement (DECISOES § 186): the most faithful worst PSNR, then the smallest file; a
  // tie that is left goes to the tool with no option to set (§ 733).
  const pick = (browser: BrowserName): string => must([...ranking[browser]].sort((a, b) => b.worst - a.worst || a.bytes - b.bytes || a.steps - b.steps)[0], `a winner in ${browser}`).tool;
  const winner = pick('chromium');
  if (pick('webkit') !== winner) throw new Error(`the browsers disagree on the tool that changes the photo least: ${winner} and ${pick('webkit')}`);
  g.fact('winner', winner);
  // Where the two browsers wrote files of different sizes, from the rows (the measured note says it from this fact).
  const after = (tool: string, browser: BrowserName): Cell => must(rows.find((row) => row[0] === tool && row[1] === browser), `${tool} in ${browser}`)[3] ?? null;
  const differ = CANDIDATES.filter((candidate) => after(candidate.tool, 'chromium') !== after(candidate.tool, 'webkit')).map((candidate) => toolName(candidate.tool));
  g.fact('browsersDiffer', differ.join(' and '));
  g.n('candidates', CANDIDATES.length, 'count', photos, meta);
  g.n('browsersSameSize', CANDIDATES.length - differ.length, 'count', photos, must(methods.find((how) => how.runner === 'playwright'), 'a browser'));
  g.fact('winnerOption', must(CANDIDATES.find((candidate) => candidate.tool === winner), winner).option);
  g.t('candidates', [label('tool'), label('browser'), inNode('beforeBytes', 'bytes'), inBrowser('afterBytes', 'bytes'), inBrowser('format', 'label'), inBrowser('sameSize', 'label'), inBrowser('psnrDb', 'db'), inBrowser('withGps', 'count'), inBrowser('withCamera', 'count')], rows, photos, methods);
  g.t('photos', [label('photo'), label('camera'), label('taken'), label('gps')], PHOTOS.map((photo, index) => {
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
  g.n('files', TO_JPG.length, 'count', pages, node(NODE_PDFLIB));
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
    // What doubling the resolution does: four times the pixels, and how much more file in each format.
    const area = (ppi: number): number => (find(name, 1, ppi, 'jpg', 'chromium')[5] as number) * (find(name, 1, ppi, 'jpg', 'chromium')[6] as number);
    g.n(`${key}Pixels300vs150`, ratio(area(300), area(150)), 'ratio', one, must(methods[0], 'chromium'));
    for (const browser of BROWSERS) {
      const how = must(methods.find((m) => m.runner === 'playwright' && m.browser === browser), browser);
      const bytes = (ppi: number, format: string): number => find(name, 1, ppi, format, browser)[7] as number;
      g.n(`${key}Jpg300vs150${B[browser]}`, ratio(bytes(300, 'jpg'), bytes(150, 'jpg')), 'ratio', one, how);
      g.n(`${key}Jpg150vs72${B[browser]}`, ratio(bytes(150, 'jpg'), bytes(72, 'jpg')), 'ratio', one, how);
      g.n(`${key}PngVsJpg150${B[browser]}`, ratio(bytes(150, 'png'), bytes(150, 'jpg')), 'ratio', one, how);
    }
  }
  // The resolution of each setting, measured on the output: pixels across the page of the tax form over its width in inches.
  const formName = 'pdf-formulario-irs-1040-2019.pdf';
  const formDoc = await breakdownPage(formName);
  for (const [ppi, level] of [[72, 'low'], [150, 'medium'], [300, 'high']] as const) {
    const width = find(formName, 1, ppi, 'jpg', 'chromium')[5] as number;
    g.n(`${level}Ppi`, Math.round((width * 72) / formDoc.widthPt), 'ppi', sample([formName], 'page 1'), must(methods[0], 'chromium'));
  }
  // The scanned page carries one picture: its own pixels against the page size say the resolution it was scanned at.
  const scan = await embeddedPpi('pdf-escaneado-01-pagina-livro-cor.pdf');
  g.n('scanImageWidth', scan.width, 'px', sample(['pdf-escaneado-01-pagina-livro-cor.pdf']), node(NODE_PDFLIB));
  g.n('scanImagePpi', scan.ppi, 'ppi', sample(['pdf-escaneado-01-pagina-livro-cor.pdf']), node(NODE_PDFLIB));
  g.t('images', [label('file'), label('page'), label('ppi'), label('format'), label('browser'), inBrowser('width', 'px'), inBrowser('height', 'px'), inBrowser('bytes', 'bytes')], rows, pages, methods);
  return g.done();
}

/** The width of page 1 in points (1/72 inch). */
async function breakdownPage(name: string): Promise<{ widthPt: number }> {
  const { PDFDocument } = await import('@cantoo/pdf-lib');
  const doc = await PDFDocument.load(pdfFixture(name), { updateMetadata: false, ignoreEncryption: true });
  return { widthPt: doc.getPage(0).getWidth() };
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
    // Each part gets the XMP of the document (DECISOES § 145): measured, so the text can say how much of the growth it is.
    const growth = split.sum - split.original.total;
    g.n(`${key}Metadata`, split.original.metadata, 'bytes', one, engine);
    g.n(`${key}PartMetadata`, split.partMetadata, 'bytes', one, engine);
    g.n(`${key}Growth`, growth, 'bytes', one, engine);
    g.n(`${key}GrowthPerPart`, Math.round(growth / split.parts), 'bytes', one, engine);
    if (growth > 0 && split.partMetadata > split.original.metadata) g.n(`${key}MetadataShare`, ratio(split.partMetadata - split.original.metadata, growth), 'ratio', one, engine);
    if (split.sum > split.original.total) bigger += 1;
    rows.push([name, split.parts, split.original.total, split.sum, split.original.fonts, split.partFonts, split.original.images, split.partImages, split.notes.join(', ')]);
  }
  g.n('files', SPLIT.length, 'count', all, engine);
  g.n('bigger', bigger, 'count', all, engine);
  g.t('parts', [label('file'), inNode('parts', 'count'), inNode('originalBytes', 'bytes'), inNode('partsBytes', 'bytes'), inNode('originalFontBytes', 'bytes'), inNode('partsFontBytes', 'bytes'), inNode('originalImageBytes', 'bytes'), inNode('partsImageBytes', 'bytes'), label('notes')], rows, all, [engine]);
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
  g.n('pdfs', all.count, 'count', all, engine);
  g.n('smaller', smaller, 'count', all, engine);
  g.t('pairs', [label('first'), label('second'), inNode('inputBytes', 'bytes'), inNode('mergedBytes', 'bytes'), label('notes')], rows, all, [engine]);
  return g.done();
}

// ---- 10. Photos into one PDF ----------------------------------------------------------------------------------

async function photosToPdf(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos, in one PDF, then compressed first with Compress image (Recommended)');
  const total = sum(PHOTOS.map((photo) => imageFixture(photo).length));
  g.n('photos', PHOTOS.length, 'count', photos, node(NODE_IMAGE));
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
  g.t('pdfs', [label('browser'), inNode('photosBytes', 'bytes'), inBrowser('pdfBytes', 'bytes'), inBrowser('compressedBytes', 'bytes'), inBrowser('pdfAfterBytes', 'bytes')], rows, photos, methods);
  return g.done();
}

// ---- 11. A phone photo under the size limit of an online form (F19b, decision 3.1) ------------------------------

/** The limits typed in Up to a size, in KB: the field reads 1 KB as 1,000 bytes (src/tools/compress-image/size.ts). */
const LIMITS_KB = [100, 200, 500] as const;
/** A short key per phone photo, for the names of the numbers. */
const PHOTO_KEY: Record<string, string> = {
  'jpg-01-pixel2-retrato-gps.jpg': 'pixel',
  'jpg-02-iphone6-paisagem-gps.jpg': 'iphone6',
  'jpg-03-iphone5-paisagem-orientacao3-gps.jpg': 'iphone5',
};
const photoKey = (photo: string): string => must(PHOTO_KEY[photo], photo);

/** Clicks "Up to a size" and types the limit, before the file goes in (a change after the result runs the batch again). */
const upToSize = (kb: number) => async (page: Page): Promise<void> => {
  await option(page, 'Up to a size');
  await typeField(page, '#ci-max', String(kb));
};

async function photoForForm(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos, each one alone in Compress image, Up to a size, at 100, 200 and 500 KB');
  const meta = node(NODE_IMAGE);
  const dqt = node(NODE_DQT);
  const before = new Map(PHOTOS.map((photo) => [photo, { bytes: imageFixture(photo).length, shown: shownSize(imageFixture(photo)) }]));
  const info = (photo: string) => must(before.get(photo), photo);
  g.n('photos', PHOTOS.length, 'count', photos, meta);
  g.n('limits', LIMITS_KB.length, 'count', photos, meta);
  g.n('photoMax', Math.max(...PHOTOS.map((photo) => info(photo).bytes)), 'bytes', photos, meta);
  g.n('photoMin', Math.min(...PHOTOS.map((photo) => info(photo).bytes)), 'bytes', photos, meta);
  for (const photo of PHOTOS) {
    const one = sample([photo]);
    g.n(`${photoKey(photo)}Bytes`, info(photo).bytes, 'bytes', one, meta);
    g.n(`${photoKey(photo)}Width`, info(photo).shown.width, 'px', one, meta);
    g.n(`${photoKey(photo)}Height`, info(photo).shown.height, 'px', one, meta);
  }
  // What lowering the quality alone could have given (Node, on the pixels of the MozJPEG decoder): the highest quality of
  // the search at which the whole photo, at its full size, fits each limit, or none.
  const full = node(NODE_FULL_SIZE);
  const fullFit = new Map<string, number | null>();
  for (const kb of LIMITS_KB) {
    for (const photo of PHOTOS) {
      ctx.log(`  The full size at ${kb} KB in Node: ${photo}`);
      const quality = await fullSizeQuality(photo, imageFixture(photo), kb * 1000);
      fullFit.set(`${photo}@${kb}`, quality);
      if (quality !== null) g.n(`${photoKey(photo)}At${kb}FullQuality`, quality, 'count', sample([photo]), full);
    }
  }
  g.n('fullSizeFits', [...fullFit.values()].filter((quality) => quality !== null).length, 'count', photos, full);
  const rows: Cell[][] = [];
  const methods: Method[] = [meta, dqt, full];
  let unmatched = 0;
  for (const browser of BROWSERS) {
    let reducedAnyway = 0;
    for (const kb of LIMITS_KB) {
      const limit = kb * 1000;
      const outs: { photo: string; bytes: number; width: number; height: number; reduced: boolean; quality: number | null }[] = [];
      let how: Method | null = null;
      for (const photo of PHOTOS) {
        ctx.log(`  Up to ${kb} KB, ${photo}, in ${browser}`);
        const run = await runImages(ctx, browser, '/compress-image/', [imageFile(photo)], upToSize(kb));
        how = run.how;
        if (!methods.some((m) => m.runner === 'playwright' && m.browser === browser)) methods.push(run.how);
        const out = must(run.by.get(stem(photo)), `${photo} at ${kb} KB in ${browser}`);
        if (sniff(out) !== 'jpeg') throw new Error(`${photo} at ${kb} KB in ${browser}: not a JPG`);
        if (out.length > limit) throw new Error(`${photo} at ${kb} KB in ${browser}: ${out.length} bytes over ${limit}`);
        const size = shownSize(out);
        const reduced = size.width !== info(photo).shown.width || size.height !== info(photo).shown.height;
        // The page says when the dimensions went down ("Oli also reduced the dimensions to W × H px."): it must agree.
        const noted = /reduced the dimensions/i.test(run.notes);
        if (noted !== reduced) throw new Error(`${photo} at ${kb} KB in ${browser}: the note says ${String(noted)}, the file ${String(reduced)}`);
        const found = await qualityOf(out);
        if (found.quality === null) {
          unmatched += 1;
          ctx.log(`    no single quality matches the tables of ${photo} at ${kb} KB in ${browser}: ${found.matches.join(', ') || 'none'}`);
        }
        outs.push({ photo, bytes: out.length, width: size.width, height: size.height, reduced, quality: found.quality });
        const fits = fullFit.get(`${photo}@${kb}`) ?? null;
        if (reduced && fits !== null) reducedAnyway += 1;
        rows.push([kb, photo, browser, info(photo).bytes, out.length, size.width, size.height, found.quality, fits]);
        const key = `${photoKey(photo)}At${kb}`;
        const one = sample([photo]);
        g.n(`${key}${B[browser]}`, out.length, 'bytes', one, run.how);
        g.n(`${key}Share${B[browser]}`, ratio(out.length, info(photo).bytes), 'ratio', one, run.how);
        g.n(`${key}Width${B[browser]}`, size.width, 'px', one, run.how);
        g.n(`${key}Height${B[browser]}`, size.height, 'px', one, run.how);
        if (found.quality !== null) g.n(`${key}Quality${B[browser]}`, found.quality, 'count', one, dqt);
      }
      const at = `at${kb}`;
      const run = must(how ?? undefined, `${kb} KB in ${browser}`);
      if (browser === 'chromium') g.n(`limit${kb}`, limit, 'bytes', photos, run);
      g.n(`${at}Max${B[browser]}`, Math.max(...outs.map((out) => out.bytes)), 'bytes', photos, run);
      g.n(`${at}Min${B[browser]}`, Math.min(...outs.map((out) => out.bytes)), 'bytes', photos, run);
      g.n(`${at}FillMax${B[browser]}`, ratio(Math.max(...outs.map((out) => out.bytes)), limit), 'ratio', photos, run);
      g.n(`${at}FillMin${B[browser]}`, ratio(Math.min(...outs.map((out) => out.bytes)), limit), 'ratio', photos, run);
      g.n(`${at}Reduced${B[browser]}`, outs.filter((out) => out.reduced).length, 'count', photos, run);
      g.n(`${at}Kept${B[browser]}`, outs.filter((out) => !out.reduced).length, 'count', photos, run);
      const qualities = outs.map((out) => out.quality);
      if (qualities.every((quality): quality is number => quality !== null)) {
        g.n(`${at}QualityMin${B[browser]}`, Math.min(...qualities), 'count', photos, dqt);
        g.n(`${at}QualityMax${B[browser]}`, Math.max(...qualities), 'count', photos, dqt);
      }
    }
    // Copies made smaller in pixels although the whole photo fitted at a quality of the search (the full-size column).
    g.n(`reducedFullFits${B[browser]}`, reducedAnyway, 'count', photos, full);
  }
  // Where the two browsers wrote the same dimensions (the canvas of each scales the photo its own way).
  const same = rows.filter((row) => row[2] === 'chromium').filter((row) => {
    const other = must(rows.find((cells) => cells[2] === 'webkit' && cells[0] === row[0] && cells[1] === row[1]), 'the WebKit row');
    return other[5] === row[5] && other[6] === row[6];
  }).length;
  g.n('sameDimensions', same, 'count', photos, must(methods.find((m) => m.runner === 'playwright'), 'a browser'));
  g.n('outputs', rows.length / BROWSERS.length, 'count', photos, meta);
  g.n('qualityUnmatched', unmatched, 'count', photos, dqt);
  g.t('fitted', [label('limitKb'), label('photo'), label('browser'), inNode('originalBytes', 'bytes'), inBrowser('bytes', 'bytes'), inBrowser('width', 'px'), inBrowser('height', 'px'), inNode('quality', 'count'), inNode('fullSizeQuality', 'count')], rows, photos, methods);
  return g.done();
}

// ---- 12. WebP, AVIF or JPG (F19b, decision 3.2) -------------------------------------------------------------------

async function webpAvifJpg(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const photos = sample(PHOTOS, 'the three real phone photos: Compress image (Recommended) for the JPG, Convert to WebP (Recommended) for the WebP and for the AVIF');
  const transparent = sample([TRANSPARENT], 'PNG to JPG for the JPG, Convert to WebP (Recommended) for the WebP and for the AVIF');
  const meta = node(NODE_IMAGE);
  const seen = node(NODE_CORNERS);
  const originals = PHOTOS.map((photo) => imageFixture(photo).length);
  const originalTotal = sum(originals);
  const png = imageFixture(TRANSPARENT);
  g.n('photos', PHOTOS.length, 'count', photos, meta);
  g.n('originalTotal', originalTotal, 'bytes', photos, meta);
  g.n('pngBytes', png.length, 'bytes', transparent, meta);
  g.n('pngClearCorners', clearCorners(await cornersOf(png)), 'count', transparent, seen);
  const rows: Cell[][] = [];
  const pngRows: Cell[][] = [];
  const methods: Method[] = [meta];
  const pngMethods: Method[] = [meta, seen];
  for (const browser of BROWSERS) {
    ctx.log(`  Compress image (Recommended) in ${browser}`);
    const jpg = await runImages(ctx, browser, '/compress-image/', PHOTOS.map(imageFile));
    ctx.log(`  Convert to WebP (WebP) in ${browser}`);
    const webp = await runImages(ctx, browser, '/convert-to-webp/', [...PHOTOS, TRANSPARENT].map(imageFile));
    ctx.log(`  Convert to WebP (AVIF) in ${browser}`);
    const avif = await runImages(ctx, browser, '/convert-to-webp/', [...PHOTOS, TRANSPARENT].map(imageFile), (page) => option(page, 'AVIF'));
    ctx.log(`  PNG to JPG (the transparent PNG) in ${browser}`);
    const flat = await runImages(ctx, browser, '/png-to-jpg/', [imageFile(TRANSPARENT)]);
    methods.push(webp.how);
    pngMethods.push(webp.how);
    const formats: [string, typeof jpg, string][] = [['jpg', jpg, 'jpeg'], ['webp', webp, 'webp'], ['avif', avif, 'avif']];
    const totals: Record<string, number> = {};
    for (const [name, run, format] of formats) {
      const outs = PHOTOS.map((photo) => must(run.by.get(stem(photo)), `${photo} as ${name} in ${browser}`));
      for (const out of outs) if (sniff(out) !== format) throw new Error(`a ${name} that is ${sniff(out)} in ${browser}`);
      const total = sum(outs.map((out) => out.length));
      totals[name] = total;
      const ratios = outs.map((out, index) => ratio(out.length, originals[index] as number));
      g.n(`${name}Total${B[browser]}`, total, 'bytes', photos, run.how);
      g.n(`${name}Ratio${B[browser]}`, ratio(total, originalTotal), 'ratio', photos, run.how);
      g.n(`${name}RatioMin${B[browser]}`, Math.min(...ratios), 'ratio', photos, run.how);
      g.n(`${name}RatioMax${B[browser]}`, Math.max(...ratios), 'ratio', photos, run.how);
      for (const [index, photo] of PHOTOS.entries()) g.n(`${photoKey(photo)}${name[0]?.toUpperCase()}${name.slice(1)}${B[browser]}`, (outs[index] as Uint8Array).length, 'bytes', sample([photo]), run.how);
    }
    const total = (name: string): number => must(totals[name], name);
    g.n(`webpVsJpg${B[browser]}`, ratio(total('webp'), total('jpg')), 'ratio', photos, webp.how);
    g.n(`avifVsJpg${B[browser]}`, ratio(total('avif'), total('jpg')), 'ratio', photos, avif.how);
    g.n(`avifVsWebp${B[browser]}`, ratio(total('avif'), total('webp')), 'ratio', photos, avif.how);
    const smaller = (a: string, b: string): number => PHOTOS.filter((photo) => (must(formats.find(([name]) => name === a), a)[1].by.get(stem(photo))?.length ?? Infinity) < (must(formats.find(([name]) => name === b), b)[1].by.get(stem(photo))?.length ?? 0)).length;
    g.n(`webpUnderJpg${B[browser]}`, smaller('webp', 'jpg'), 'count', photos, webp.how);
    g.n(`avifUnderWebp${B[browser]}`, smaller('avif', 'webp'), 'count', photos, avif.how);
    for (const [index, photo] of PHOTOS.entries()) {
      const out = (run: typeof jpg): number => must(run.by.get(stem(photo)), photo).length;
      rows.push([photo, browser, originals[index] as number, out(jpg), out(webp), out(avif)]);
    }
    // The PNG with transparent corners, in the three formats: the bytes, and what the four corners became.
    const pngJpg = must(flat.by.get(stem(TRANSPARENT)), `the PNG as JPG in ${browser}`);
    const pngWebp = must(webp.by.get(stem(TRANSPARENT)), `the PNG as WebP in ${browser}`);
    const pngAvif = must(avif.by.get(stem(TRANSPARENT)), `the PNG as AVIF in ${browser}`);
    if (sniff(pngJpg) !== 'jpeg' || sniff(pngWebp) !== 'webp' || sniff(pngAvif) !== 'avif') throw new Error(`the PNG in ${browser}: ${sniff(pngJpg)}, ${sniff(pngWebp)}, ${sniff(pngAvif)}`);
    const jpgWhite = whiteCorners(await cornersOf(pngJpg));
    const webpClear = clearCorners(await cornersOf(pngWebp));
    const avifClear = clearCorners(await cornersOf(pngAvif));
    const webpAlpha = webpInfo(pngWebp).hasAlpha ? 1 : 0;
    const avifAlpha = parseBmff(pngAvif).items.some((item) => item.properties.some((property) => property.type === 'auxC' && 'auxType' in property && /alpha/i.test(property.auxType))) ? 1 : 0;
    g.n(`pngJpgBytes${B[browser]}`, pngJpg.length, 'bytes', transparent, flat.how);
    g.n(`pngWebpBytes${B[browser]}`, pngWebp.length, 'bytes', transparent, webp.how);
    g.n(`pngAvifBytes${B[browser]}`, pngAvif.length, 'bytes', transparent, avif.how);
    g.n(`pngJpgRatio${B[browser]}`, ratio(pngJpg.length, png.length), 'ratio', transparent, flat.how);
    g.n(`pngWebpRatio${B[browser]}`, ratio(pngWebp.length, png.length), 'ratio', transparent, webp.how);
    g.n(`pngAvifRatio${B[browser]}`, ratio(pngAvif.length, png.length), 'ratio', transparent, avif.how);
    g.n(`pngJpgWhiteCorners${B[browser]}`, jpgWhite, 'count', transparent, seen);
    g.n(`pngWebpClearCorners${B[browser]}`, webpClear, 'count', transparent, seen);
    g.n(`pngAvifClearCorners${B[browser]}`, avifClear, 'count', transparent, seen);
    g.n(`pngWebpAlpha${B[browser]}`, webpAlpha, 'count', transparent, webp.how);
    g.n(`pngAvifAlpha${B[browser]}`, avifAlpha, 'count', transparent, avif.how);
    g.n(`pngFlattenedNote${B[browser]}`, /white/i.test(flat.notes) ? 1 : 0, 'count', transparent, flat.how);
    pngRows.push(['jpg', browser, png.length, pngJpg.length, jpgWhite, 0]);
    pngRows.push(['webp', browser, png.length, pngWebp.length, 0, webpClear]);
    pngRows.push(['avif', browser, png.length, pngAvif.length, 0, avifClear]);
  }
  // Where Chromium and WebKit wrote the same bytes: the photos in each format, and the formats of the transparent PNG.
  const at = (table: Cell[][], key: Cell, browser: BrowserName): Cell[] => must(table.find((row) => row[0] === key && row[1] === browser), `${String(key)} in ${browser}`);
  const webkitHow = must(methods.find((m) => m.runner === 'playwright' && m.browser === 'webkit'), 'WebKit');
  for (const [name, column] of [['jpg', 3], ['webp', 4], ['avif', 5]] as const) {
    g.n(`${name}SameBrowsers`, PHOTOS.filter((photo) => at(rows, photo, 'chromium')[column] === at(rows, photo, 'webkit')[column]).length, 'count', photos, webkitHow);
  }
  g.n('pngSameBrowsers', ['jpg', 'webp', 'avif'].filter((format) => at(pngRows, format, 'chromium')[3] === at(pngRows, format, 'webkit')[3]).length, 'count', transparent, webkitHow);
  g.t('photos', [label('photo'), label('browser'), inNode('originalBytes', 'bytes'), inBrowser('jpgBytes', 'bytes'), inBrowser('webpBytes', 'bytes'), inBrowser('avifBytes', 'bytes')], rows, photos, methods);
  g.t('transparent', [label('format'), label('browser'), inNode('pngBytes', 'bytes'), inBrowser('bytes', 'bytes'), inNode('whiteCorners', 'count'), inNode('clearCorners', 'count')], pngRows, transparent, pngMethods);
  return g.done();
}

// ---- 13. Sign a PDF without printing (F19b, decision 3.3) ---------------------------------------------------------

/** The PDFs signed: pages of mixed sizes and turns, a file of photos, and the tax form with its fields and XFA layer. */
const SIGN: Record<string, string> = {
  mixed: 'gen-paginas-mistas.pdf',
  photos: 'gen-fotos.pdf',
  form: 'pdf-formulario-irs-1040-2019.pdf',
};
const SIGN_KEYS = Object.keys(SIGN);
/** The three ways Sign PDF makes a signature, by the label of each option (src/tools/sign-pdf/i18n/en.ts). */
const SIGN_MODES = { Draw: 'Draw', Upload: 'Upload', Type: 'Type' } as const;
type SignMode = keyof typeof SIGN_MODES;
/** The image a person could upload: the fixture with transparent corners (no new file may join the fixtures). */
const SIGNATURE_IMAGE = TRANSPARENT;
/** The name typed in Type, made up for the measurement. */
const TYPED_NAME = 'Oli Orca';

/** Two strokes on the pad, drawn with the mouse: a loop of a capital letter and a line under it. */
async function drawOnPad(page: Page): Promise<void> {
  const pad = page.locator('.fo-sign__pad');
  await pad.scrollIntoViewIfNeeded();
  const box = await pad.boundingBox();
  if (!box) throw new Error('the pad has no box');
  const at = (x: number, y: number): [number, number] => [box.x + box.width * x, box.y + box.height * y];
  const strokes: [number, number][][] = [
    [at(0.15, 0.7), at(0.25, 0.2), at(0.35, 0.7), at(0.45, 0.25), at(0.55, 0.7), at(0.65, 0.3)],
    [at(0.12, 0.85), at(0.8, 0.8)],
  ];
  for (const stroke of strokes) {
    const [first, ...rest] = stroke;
    if (!first) continue;
    await page.mouse.move(...first);
    await page.mouse.down();
    for (const point of rest) await page.mouse.move(...point, { steps: 8 });
    await page.mouse.up();
  }
}

/** Signs one PDF on every page in one of the three ways, the way a person does it, and gives what Download holds. */
async function signOne(ctx: Context, browser: BrowserName, name: string, mode: SignMode): Promise<{ bytes: Uint8Array; notes: string; how: Method }> {
  const session = await ctx.session(browser);
  const tab = await openTool(session, '/sign-pdf/');
  try {
    const page = tab.page;
    await drop(page, [pdfFile(name)]);
    await page.getByRole('button', { name: 'Sign PDF' }).waitFor({ state: 'visible', timeout: 60_000 });
    await option(page, SIGN_MODES[mode]);
    if (mode === 'Draw') await drawOnPad(page);
    if (mode === 'Upload') await page.setInputFiles('.fo-sign__file', [imageFile(SIGNATURE_IMAGE)]);
    if (mode === 'Type') {
      const field = page.getByLabel('Type your name');
      await field.fill(TYPED_NAME);
      await field.blur();
    }
    await page.locator('.fo-sign__box').waitFor({ state: 'visible', timeout: 30_000 });
    await option(page, 'All pages');
    await page.getByRole('button', { name: 'Sign PDF' }).click();
    const { files } = await download(page);
    const notes = (await page.locator('.fo-result__notes li').allTextContents()).join(' | ');
    return { bytes: must(files[0], `${name} signed`).bytes, notes, how: method(session, '/sign-pdf/') };
  } finally {
    await tab.close();
  }
}

async function signPdf(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const files = SIGN_KEYS.map((key) => must(SIGN[key], key));
  const all = sample([...files, SIGNATURE_IMAGE], 'three PDFs, each signed on all pages in the three ways of Sign PDF: drawn with the mouse, the PNG with transparent corners uploaded, and a name typed');
  const reader = node(NODE_PDFJS);
  const lib = node(NODE_PDFLIB);
  const originals = new Map<string, { read: ReadPdf; parts: SignatureParts }>();
  for (const name of files) originals.set(name, { read: await readWithPdfjs(pdfFixture(name)), parts: await signatureParts(pdfFixture(name)) });
  const original = (name: string) => must(originals.get(name), name);
  // The PDFs, and every test file of the table (the three PDFs and the image uploaded as a signature): the text says the
  // second when it says how many files the table rests on (tests/unit/guides-numbers.test.ts).
  g.n('files', files.length, 'count', sample(files), reader);
  g.n('testFiles', all.count, 'count', all, reader);
  g.n('modes', Object.keys(SIGN_MODES).length, 'count', all, reader);
  for (const key of SIGN_KEYS) {
    const name = must(SIGN[key], key);
    const one = sample([name]);
    const read = original(name).read;
    g.n(`${key}Pages`, read.pages.length, 'count', one, reader);
    g.n(`${key}Before`, pdfFixture(name).length, 'bytes', one, reader);
    g.n(`${key}Texts`, sum(read.pages.map((p) => p.texts.length)), 'count', one, reader);
    g.n(`${key}Images`, sum(read.pages.map((p) => p.images)), 'count', one, reader);
    g.n(`${key}Widgets`, sum(read.pages.map((p) => p.widgets)), 'count', one, reader);
    g.n(`${key}Fields`, original(name).parts.fields, 'count', one, lib);
  }
  // The tax form comes with its own signature parts: the usage rights Adobe sealed into it (/Perms /UR3, a /Type /Sig
  // with a /ByteRange that covers the file). They are counted before, so "nothing new" compares like with like.
  const formName = must(SIGN['form'], 'form');
  const formOne = sample([formName]);
  const form = original(formName);
  g.n('formXfaBefore', form.read.xfa ? 1 : 0, 'count', formOne, reader);
  g.n('formSigDicts', form.parts.sigDicts, 'count', formOne, lib);
  g.n('formByteRanges', form.parts.byteRanges, 'count', formOne, lib);
  g.n('formRangesCovering', form.parts.rangesCovering, 'count', formOne, lib);
  g.n('formUsageRights', form.parts.usageRights ? 1 : 0, 'count', formOne, lib);
  g.n('sigDictsBefore', sum(files.map((name) => original(name).parts.sigDicts)), 'count', all, lib);
  const rows: Cell[][] = [];
  const methods: Method[] = [reader, lib];
  for (const browser of BROWSERS) {
    let runs = 0;
    let onePerPage = 0;
    let textKept = 0;
    let widgetsKept = 0;
    let fieldsKept = 0;
    let newSigDicts = 0;
    let newByteRanges = 0;
    let signedPages = 0;
    let xfaAfter = 0;
    let xfaNote = 0;
    let usageRightsAfter = 0;
    let rangesCoveringAfter = 0;
    let how: Method | null = null;
    for (const key of SIGN_KEYS) {
      const name = must(SIGN[key], key);
      const before = original(name);
      for (const mode of Object.keys(SIGN_MODES) as SignMode[]) {
        ctx.log(`  Sign PDF, ${mode}, ${name}, in ${browser}`);
        const run = await signOne(ctx, browser, name, mode);
        how = run.how;
        if (!methods.some((m) => m.runner === 'playwright' && m.browser === browser)) methods.push(run.how);
        const read = await readWithPdfjs(run.bytes);
        const parts = await signatureParts(run.bytes);
        if (read.pages.length !== before.read.pages.length) throw new Error(`${name} ${mode} in ${browser}: ${read.pages.length} pages`);
        runs += 1;
        signedPages += read.pages.length;
        const images = read.pages.every((p, index) => p.images === (before.read.pages[index]?.images ?? 0) + 1);
        const texts = read.pages.every((p, index) => p.texts.length === before.read.pages[index]?.texts.length && p.marker === before.read.pages[index]?.marker);
        const widgets = read.pages.every((p, index) => p.widgets === before.read.pages[index]?.widgets);
        if (images) onePerPage += 1;
        if (texts) textKept += 1;
        if (widgets && read.acroForm === before.read.acroForm) widgetsKept += 1;
        if (parts.fields === before.parts.fields) fieldsKept += 1;
        newSigDicts += parts.sigDicts - before.parts.sigDicts;
        newByteRanges += parts.byteRanges - before.parts.byteRanges;
        if (key === 'form') {
          if (read.xfa) xfaAfter += 1;
          if (/XFA/i.test(run.notes)) xfaNote += 1;
          if (parts.usageRights) usageRightsAfter += 1;
          rangesCoveringAfter += parts.rangesCovering;
        }
        const after = run.bytes.length;
        const one = sample([name, ...(mode === 'Upload' ? [SIGNATURE_IMAGE] : [])]);
        g.n(`${key}${mode}${B[browser]}`, after, 'bytes', one, run.how);
        g.n(`${key}${mode}Added${B[browser]}`, after - pdfFixture(name).length, 'bytes', one, run.how);
        g.n(`${key}${mode}Change${B[browser]}`, ratio(after, pdfFixture(name).length), 'ratio', one, run.how);
        rows.push([name, mode.toLowerCase(), browser, read.pages.length, pdfFixture(name).length, after, sum(before.read.pages.map((p) => p.images)), sum(read.pages.map((p) => p.images)), sum(read.pages.map((p) => p.texts.length)), sum(read.pages.map((p) => p.widgets)), parts.fields, parts.sigDicts - before.parts.sigDicts + parts.byteRanges - before.parts.byteRanges]);
      }
    }
    const run = must(how ?? undefined, browser);
    g.n(`signed${B[browser]}`, runs, 'count', all, run);
    g.n(`signedPages${B[browser]}`, signedPages, 'count', all, run);
    g.n(`onePerPage${B[browser]}`, onePerPage, 'count', all, reader);
    g.n(`textKept${B[browser]}`, textKept, 'count', all, reader);
    g.n(`widgetsKept${B[browser]}`, widgetsKept, 'count', all, reader);
    g.n(`fieldsKept${B[browser]}`, fieldsKept, 'count', all, lib);
    g.n(`newSigDicts${B[browser]}`, newSigDicts, 'count', all, lib);
    g.n(`newByteRanges${B[browser]}`, newByteRanges, 'count', all, lib);
    g.n(`formXfaAfter${B[browser]}`, xfaAfter, 'count', formOne, reader);
    g.n(`formXfaNote${B[browser]}`, xfaNote, 'count', formOne, run);
    g.n(`formUsageRightsAfter${B[browser]}`, usageRightsAfter, 'count', formOne, lib);
    g.n(`formRangesCoveringAfter${B[browser]}`, rangesCoveringAfter, 'count', formOne, lib);
    // What each way adds, across the three files: the smallest and the largest addition.
    for (const mode of Object.keys(SIGN_MODES) as SignMode[]) {
      const added = rows.filter((row) => row[1] === mode.toLowerCase() && row[2] === browser).map((row) => (row[5] as number) - (row[4] as number));
      const sampled = mode === 'Upload' ? sample([...files, SIGNATURE_IMAGE]) : sample(files);
      g.n(`${mode.toLowerCase()}AddedMin${B[browser]}`, Math.min(...added), 'bytes', sampled, run);
      g.n(`${mode.toLowerCase()}AddedMax${B[browser]}`, Math.max(...added), 'bytes', sampled, run);
    }
  }
  g.n('signatureImageBytes', imageFixture(SIGNATURE_IMAGE).length, 'bytes', sample([SIGNATURE_IMAGE]), node(NODE_IMAGE));
  g.n('signatureImageWidth', shownSize(imageFixture(SIGNATURE_IMAGE)).width, 'px', sample([SIGNATURE_IMAGE]), node(NODE_IMAGE));
  g.n('signatureImageHeight', shownSize(imageFixture(SIGNATURE_IMAGE)).height, 'px', sample([SIGNATURE_IMAGE]), node(NODE_IMAGE));
  g.t('signed', [label('file'), label('mode'), label('browser'), inNode('pages', 'count'), inNode('beforeBytes', 'bytes'), inBrowser('afterBytes', 'bytes'), inNode('imagesBefore', 'count'), inNode('imagesAfter', 'count'), inNode('textItems', 'count'), inNode('widgets', 'count'), inNode('fields', 'count'), inNode('newSignatureParts', 'count')], rows, all, methods);
  return g.done();
}

// ---- 14. What a PDF password protects (F19b, decision 3.4) -------------------------------------------------------

const PROTECT: Record<string, string> = {
  mixed: 'gen-paginas-mistas.pdf',
  photos: 'gen-fotos.pdf',
  optimized: 'gen-ja-otimizado.pdf',
};
const PROTECT_KEYS = Object.keys(PROTECT);
/** The only fixture locked by restrictions alone: no password to open, an owner password, printing and editing blocked. */
const OWNER_ONLY = 'gen-cifrado-dono.pdf';

/** A password made up for one measurement and never written anywhere (each run makes new ones, of the same length). */
const throwaway = (): string => `measure-${randomUUID()}`;

/** Protect PDF on one fixture, in a Node process of its own (the engine's qpdf fresh, as in a tab: lockFresh). */
function protects(name: string, password: string): Uint8Array {
  const result = lockFresh('protect', name, password);
  if (!result.ok) throw new Error(`Protect PDF refused ${name}: ${result.reason}`);
  return result.bytes;
}

const opensWith = async (bytes: Uint8Array, password: string): Promise<boolean> => {
  try {
    await readWithPdfjs(bytes, password);
    return true;
  } catch {
    return false;
  }
};

async function pdfPassword(ctx: Context): Promise<GuideMeasure> {
  const g = collector(ctx.stamp);
  const files = PROTECT_KEYS.map((key) => must(PROTECT[key], key));
  const protectedSample = sample(files, 'three PDFs, each protected twice by Protect PDF in Node, each time in a process of its own and with a new password made up for the measurement');
  const engine = node(`${NODE_PDF_ENGINE}, each run in a Node process of its own (scripts/guides/lib/lock-child.ts): the engine's qpdf fresh, as in a tab`);
  const qpdfJson = node(NODE_QPDF_JSON);
  const reader = node(NODE_PDFJS);
  const rows: Cell[][] = [];
  const added: number[] = [];
  let refusedWithout = 0;
  let openedWith = 0;
  let refusedWrong = 0;
  let passwordInBytes = 0;
  let sameSize = 0;
  let blocked = 0;
  const revisions = new Set<number>();
  const bits = new Set<number>();
  const methodsSeen = new Set<string>();
  for (const key of PROTECT_KEYS) {
    const name = must(PROTECT[key], key);
    ctx.log(`  Protect PDF ${name}`);
    const one = sample([name]);
    const password = throwaway();
    const first = protects(name, password);
    const second = protects(name, throwaway());
    if (first.length === second.length) sameSize += 1;
    else ctx.log(`    ${name}: ${first.length} and ${second.length} bytes in two runs`);
    const before = pdfFixture(name);
    const pages = (await readWithPdfjs(before)).pages.length;
    const encryption = await encryptionOf(first, password);
    revisions.add(encryption.revision);
    bits.add(encryption.bits);
    methodsSeen.add(encryption.method);
    const blockedHere = Object.values(encryption.capabilities).filter((allowed) => !allowed).length;
    blocked += blockedHere;
    if (!(await opensWithoutPassword(first))) refusedWithout += 1;
    if (await opensWith(first, password)) openedWith += 1;
    if (!(await opensWith(first, throwaway()))) refusedWrong += 1;
    if (Buffer.from(first).includes(Buffer.from(password, 'latin1'))) passwordInBytes += 1;
    g.n(`${key}Pages`, pages, 'count', one, reader);
    g.n(`${key}Before`, before.length, 'bytes', one, engine);
    g.n(`${key}After`, first.length, 'bytes', one, engine);
    g.n(`${key}Added`, first.length - before.length, 'bytes', one, engine);
    g.n(`${key}Change`, ratio(first.length, before.length), 'ratio', one, engine);
    added.push(first.length - before.length);
    rows.push([name, pages, before.length, first.length, second.length, encryption.revision, encryption.bits, blockedHere]);
  }
  if (revisions.size !== 1 || bits.size !== 1 || methodsSeen.size !== 1) throw new Error(`the protected files differ: R ${[...revisions].join(', ')}, ${[...bits].join(', ')} bits, ${[...methodsSeen].join(', ')}`);
  g.n('files', files.length, 'count', protectedSample, engine);
  g.n('revision', must([...revisions][0], 'R'), 'count', protectedSample, qpdfJson);
  g.n('keyBits', must([...bits][0], 'bits'), 'count', protectedSample, qpdfJson);
  g.fact('method', must([...methodsSeen][0], 'method'));
  g.n('blocked', blocked, 'count', protectedSample, qpdfJson);
  g.n('sameSize', sameSize, 'count', protectedSample, engine);
  g.n('addedMin', Math.min(...added), 'bytes', protectedSample, engine);
  g.n('addedMax', Math.max(...added), 'bytes', protectedSample, engine);
  g.n('refusedWithout', refusedWithout, 'count', protectedSample, reader);
  g.n('openedWith', openedWith, 'count', protectedSample, reader);
  g.n('refusedWrong', refusedWrong, 'count', protectedSample, reader);
  g.n('passwordInBytes', passwordInBytes, 'count', protectedSample, engine);
  g.t('protected', [label('file'), inNode('pages', 'count'), inNode('beforeBytes', 'bytes'), inNode('afterBytes', 'bytes'), inNode('secondRunBytes', 'bytes'), inNode('revision', 'count'), inNode('bits', 'count'), inNode('blocked', 'count')], rows, protectedSample, [engine, qpdfJson, reader]);

  // The file locked by restrictions alone: what it blocks, that a reader opens it with no password, what Unlock PDF does
  // with it (restrictions only: no password asked) and that Protect PDF turns it down.
  ctx.log(`  ${OWNER_ONLY}: Unlock PDF and Protect PDF`);
  const owner = sample([OWNER_ONLY], 'the fixture with restrictions and no password to open, through Unlock PDF (restrictions only) and Protect PDF in Node');
  const locked = pdfFixture(OWNER_ONLY);
  const lockedEncryption = await encryptionOf(locked);
  const capabilities = Object.keys(lockedEncryption.capabilities).length;
  const ownerBlocked = Object.values(lockedEncryption.capabilities).filter((allowed) => !allowed).length;
  const unlocked = lockFresh('unlock', OWNER_ONLY);
  if (!unlocked.ok) throw new Error(`Unlock PDF refused ${OWNER_ONLY}: ${unlocked.reason}`);
  const free = unlocked.bytes;
  const freeEncryption = await encryptionOf(free);
  const refused = lockFresh('protect', OWNER_ONLY, throwaway());
  g.n('ownerBytes', locked.length, 'bytes', owner, engine);
  g.n('ownerPages', (await readWithPdfjs(locked)).pages.length, 'count', owner, reader);
  g.n('ownerRevision', lockedEncryption.revision, 'count', owner, qpdfJson);
  g.n('ownerKeyBits', lockedEncryption.bits, 'count', owner, qpdfJson);
  g.n('capabilities', capabilities, 'count', owner, qpdfJson);
  g.n('ownerBlocked', ownerBlocked, 'count', owner, qpdfJson);
  g.n('ownerOpensWithout', (await opensWithoutPassword(locked)) ? 1 : 0, 'count', owner, reader);
  g.n('unlockedBytes', free.length, 'bytes', owner, engine);
  g.n('unlockedEncrypted', freeEncryption.encrypted ? 1 : 0, 'count', owner, qpdfJson);
  g.n('unlockedPages', (await readWithPdfjs(free)).pages.length, 'count', owner, reader);
  g.n('unlockedBlocked', freeEncryption.encrypted ? Object.values(freeEncryption.capabilities).filter((allowed) => !allowed).length : 0, 'count', owner, qpdfJson);
  g.n('protectRefused', !refused.ok && refused.reason === 'restricted' ? 1 : 0, 'count', owner, engine);
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
  'guides-compress-photo-for-online-form': photoForForm,
  'guides-webp-vs-avif-vs-jpg': webpAvifJpg,
  'guides-sign-pdf-without-printing': signPdf,
  'guides-what-a-pdf-password-protects': pdfPassword,
};
