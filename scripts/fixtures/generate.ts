// node scripts/fixtures/generate.ts: builds the derived image fixtures in
// fixtures/images/ (the gen-* files) from the real photos of the F0. Deterministic: fixed seeds, the
// pixels drawn and encoded by the Playwright Chromium (canvas + toBlob), the bytes assembled in Node,
// the AVIF from the jSquash encoder. Running it twice gives the same bytes on the same machine; across
// machines the committed files are the truth (the SHA-256 in fixtures/ORIGEM.md), because another
// Chromium build may encode a few bytes differently. Not part of pnpm verificar: CI reads the files.
//
//   node scripts/fixtures/generate.ts           write the files and print the ORIGEM rows
//   node scripts/fixtures/generate.ts --check   generate in memory and compare with the files on disk
//   node scripts/fixtures/generate.ts --no-webkit   skip the WebKit decode checks
//   node scripts/fixtures/generate.ts --no-pdf      skip the PDF fixtures (scripts/fixtures/pdf.ts runs after the images, F5a)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeAvif } from './lib/avif.ts';
import { BrowserSession } from './lib/browser.ts';
import { corruptJpegStructure, exifSegment, findExif, markerSegments, setOrientation, truncateJpeg, withSegmentAfterSoi } from './lib/jpeg.ts';
import { fadeToTransparent, grayThumbnail, meanAbsDiff, rotate } from './lib/rgba.ts';
import { animation, withExif } from './lib/webp.ts';
import { generatePdfFixtures } from './pdf.ts';

const DIR = fileURLToPath(new URL('../../fixtures/images/', import.meta.url));
const SCRIPT = 'scripts/fixtures/generate.ts';
const SEED = 0x0f11e;

const SOURCES = {
  jpg01: 'jpg-01-pixel2-retrato-gps.jpg',
  jpg02: 'jpg-02-iphone6-paisagem-gps.jpg',
  jpg03: 'jpg-03-iphone5-paisagem-orientacao3-gps.jpg',
} as const;

const FREE = 'uso livre, drewnoakes/metadata-extractor-images';
const NO_SOURCE = 'sem fonte externa';

interface Output {
  name: string;
  bytes: Uint8Array;
  mime: string;
  /** Column "Gerado de" of fixtures/ORIGEM.md. */
  from: string;
  /** What a browser must do with it, checked in Chromium and WebKit after the build. */
  browser: 'decode' | 'reject' | 'record';
  /** Pixels as stored and on screen, when the file decodes. */
  stored?: [number, number];
  display?: [number, number];
}

const read = (name: string): Uint8Array => new Uint8Array(readFileSync(join(DIR, name)));
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/** The JPEG with its Exif Orientation set to `value` and everything else untouched. */
function withOrientation(jpeg: Uint8Array, value: number): Uint8Array {
  return withSegmentAfterSoi(jpeg, exifSegment(setOrientation(must(findExif(jpeg), 'Exif segment').tiff, value)));
}

function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`missing ${what}`);
  return value;
}

async function build(chromium: BrowserSession): Promise<{ outputs: Output[]; references: Map<string, number[]> }> {
  const jpg01 = read(SOURCES.jpg01);
  const jpg02 = read(SOURCES.jpg02);
  const jpg03 = read(SOURCES.jpg03);
  const outputs: Output[] = [];
  // Grey thumbnails of the upright images, built before any rotation, to check the files against what
  // the browsers show: this is what proves the stored pixels and the Orientation tag agree.
  const references = new Map<string, number[]>();

  // Orientation 6: jpg-01 upright at 1200x1600, stored turned counter-clockwise (1600x1200), so a
  // viewer that turns it 90 degrees clockwise shows it upright. The APP1 is the original one, with
  // GPS; only the Orientation value changes (the stale size tags and the Exif thumbnail stay as they were).
  const upright1 = await chromium.decode(jpg01, 'image/jpeg', 1200, 1600);
  const stored1 = await chromium.encode(rotate(upright1, 'ccw'), 'image/jpeg', 0.85);
  outputs.push({
    name: 'gen-jpg-01-orientacao6.jpg',
    bytes: withSegmentAfterSoi(stored1, exifSegment(setOrientation(must(findExif(jpg01), 'Exif in jpg-01').tiff, 6))),
    mime: 'image/jpeg',
    from: `jpg-01 (${FREE}): reduzida a 1200×1600, gravada girada em 1600×1200 com Orientation 6 no APP1 original (GPS mantido)`,
    browser: 'decode',
    stored: [1600, 1200],
    display: [1200, 1600],
  });
  references.set('gen-jpg-01-orientacao6.jpg', grayThumbnail(upright1, 24));

  // Orientation 8: jpg-02 upright at 1600x1200, stored turned clockwise (1200x1600).
  const upright2 = await chromium.decode(jpg02, 'image/jpeg', 1600, 1200);
  const stored2 = await chromium.encode(rotate(upright2, 'cw'), 'image/jpeg', 0.85);
  outputs.push({
    name: 'gen-jpg-02-orientacao8.jpg',
    bytes: withSegmentAfterSoi(stored2, exifSegment(setOrientation(must(findExif(jpg02), 'Exif in jpg-02').tiff, 8))),
    mime: 'image/jpeg',
    from: `jpg-02 (${FREE}): gravada girada em 1200×1600 com Orientation 8 no APP1 original (GPS mantido), aparece em 1600×1200`,
    browser: 'decode',
    stored: [1200, 1600],
    display: [1600, 1200],
  });
  references.set('gen-jpg-02-orientacao8.jpg', grayThumbnail(upright2, 24));

  // Transparent PNG: the flowers of jpg-03 (upright) with an alpha fade and four transparent corners.
  const flowers = await chromium.decode(jpg03, 'image/jpeg', 800, 600);
  fadeToTransparent(flowers);
  outputs.push({
    name: 'gen-png-transparente.png',
    bytes: await chromium.encode(flowers, 'image/png', 1),
    mime: 'image/png',
    from: `jpg-03 (${FREE}): 800×600 em pé, com degradê de transparência e os quatro cantos transparentes`,
    browser: 'decode',
    stored: [800, 600],
    display: [800, 600],
  });

  // WebP with the Exif (and its GPS) of jpg-02 in an EXIF chunk.
  const photo = await chromium.decode(jpg02, 'image/jpeg', 1600, 1200);
  outputs.push({
    name: 'gen-webp-exif-gps.webp',
    bytes: withExif(await chromium.encode(photo, 'image/webp', 0.8), must(findExif(jpg02), 'Exif in jpg-02').tiff, 1600, 1200),
    mime: 'image/webp',
    from: `jpg-02 (${FREE}): 1600×1200 em WebP com perda, VP8X e chunk EXIF com o TIFF da jpg-02 (GPS)`,
    browser: 'decode',
    stored: [1600, 1200],
    display: [1600, 1200],
  });

  // Animated WebP: a red frame, then a blue one.
  const frames = [await chromium.frame(320, 240, '#d9381e', '#7a1306', 0.8), await chromium.frame(320, 240, '#1e5ad9', '#0b2a6e', 0.8)];
  outputs.push({
    name: 'gen-webp-animada.webp',
    bytes: animation(frames, 320, 240, 500),
    mime: 'image/webp',
    from: `${NO_SOURCE}, desenhada no script: 2 quadros de 320×240 (vermelho e azul), VP8X com animação, ANIM e 2 ANMF`,
    browser: 'decode',
    stored: [320, 240],
    display: [320, 240],
  });

  // AVIF: jpg-03 with its Orientation 3 applied (a 180 degree turn), so the file itself is upright. The
  // browser applies Orientation by itself, so the stored pixels come from a copy with the tag set to 1.
  const turned = await chromium.decode(withOrientation(jpg03, 1), 'image/jpeg', 1600, 1200);
  const upright3 = rotate(turned, '180');
  const reference3 = grayThumbnail(upright3, 24);
  const nativeThumb = await chromium.thumb(jpg03, 'image/jpeg', 24);
  const drift = meanAbsDiff(nativeThumb, reference3);
  if (drift > 4) throw new Error(`jpg-03 turned by 180 degrees does not match Chromium's own rotation (mean difference ${drift.toFixed(2)})`);
  outputs.push({
    name: 'gen-avif.avif',
    bytes: await encodeAvif(upright3, { quality: 50, speed: 8 }),
    mime: 'image/avif',
    from: `jpg-03 (${FREE}): 1600×1200 com a Orientation 3 já aplicada, AVIF do @jsquash/avif (qualidade 50, velocidade 8)`,
    browser: 'record',
    stored: [1600, 1200],
    display: [1600, 1200],
  });
  references.set('gen-avif.avif', reference3);

  // Truncated JPEG: 60% of a 1600x1200 baseline JPEG of jpg-02. Header, tables and the first rows of
  // the scan are intact; there is no EOI.
  const jpeg1600 = await chromium.encode(photo, 'image/jpeg', 0.8);
  outputs.push({
    name: 'gen-jpg-truncado.jpg',
    bytes: truncateJpeg(jpeg1600, 0.6),
    mime: 'image/jpeg',
    from: `jpg-02 (${FREE}): 1600×1200 cortada em 60% dos bytes, sem o marcador de fim (EOI)`,
    browser: 'record',
    stored: [1600, 1200],
    display: [1600, 1200],
  });

  // Corrupt JPEG: the marker structure damaged, SOI/EOI in place.
  const small = await chromium.decode(jpg02, 'image/jpeg', 800, 600);
  outputs.push({
    name: 'gen-jpg-corrompido.jpg',
    bytes: corruptJpegStructure(await chromium.encode(small, 'image/jpeg', 0.8)),
    mime: 'image/jpeg',
    from: `jpg-02 (${FREE}): 800×600 com o tamanho do primeiro DQT e a altura do SOF danificados (começa com FF D8 FF e termina com FF D9)`,
    browser: 'reject',
  });

  // A PNG that is called .jpg.
  const png = await chromium.decode(jpg02, 'image/jpeg', 640, 480);
  outputs.push({
    name: 'gen-png-extensao-jpg.jpg',
    bytes: await chromium.encode(png, 'image/png', 1),
    mime: 'image/png',
    from: `jpg-02 (${FREE}): PNG de 640×480 com extensão .jpg`,
    browser: 'decode',
    stored: [640, 480],
    display: [640, 480],
  });

  // Text called .png, an empty file called .jpg.
  outputs.push({
    name: 'gen-texto-extensao-png.png',
    bytes: new TextEncoder().encode('Este arquivo é texto, não imagem.\nSó o nome termina em .png.\n'),
    mime: 'image/png',
    from: `${NO_SOURCE}: texto UTF-8 escrito no script, com extensão .png`,
    browser: 'reject',
  });
  outputs.push({ name: 'gen-vazio.jpg', bytes: new Uint8Array(0), mime: 'image/jpeg', from: `${NO_SOURCE}: arquivo de 0 bytes com extensão .jpg`, browser: 'reject' });

  // Just over the 16,777,216 px canvas limit of Safari on iPhone (4096 x 4096), with simple content.
  outputs.push({
    name: 'gen-grande-4100x4100.jpg',
    bytes: await chromium.big(4100, 4100, SEED, 0.8),
    mime: 'image/jpeg',
    from: `${NO_SOURCE}, desenhada no script: 4100×4100 = 16.810.000 px (32.784 acima do limite do canvas), degradê e blocos de cor, sem metadados`,
    browser: 'decode',
    stored: [4100, 4100],
    display: [4100, 4100],
  });

  return { outputs, references };
}

interface Finding {
  browser: string;
  file: string;
  result: string;
}

/** Decodes every output in a browser and checks what the construction promises. */
async function verify(session: BrowserSession, outputs: Output[], references: Map<string, number[]>): Promise<Finding[]> {
  const findings: Finding[] = [];
  const say = (file: string, result: string): number => findings.push({ browser: `${session.name} ${session.version}`, file, result });
  for (const output of outputs) {
    const probe = output.bytes.length === 0 ? { ok: false, width: 0, height: 0, error: 'empty' } : await session.probe(output.bytes, output.mime);
    if (output.browser === 'reject') {
      if (probe.ok) throw new Error(`${session.name} decoded ${output.name}, which must be rejected`);
      say(output.name, `rejected (${probe.error.slice(0, 80)})`);
      continue;
    }
    if (!probe.ok) {
      if (output.browser === 'decode') throw new Error(`${session.name} could not decode ${output.name}: ${probe.error}`);
      say(output.name, `rejected (${probe.error.slice(0, 80)})`);
      continue;
    }
    const [dw, dh] = output.display ?? [0, 0];
    if (output.browser === 'decode' && (probe.width !== dw || probe.height !== dh)) throw new Error(`${session.name} shows ${output.name} as ${probe.width}x${probe.height}, expected ${dw}x${dh}`);
    say(output.name, `decoded ${probe.width}x${probe.height} on screen`);
    // Stored size: the browser always applies Orientation, so ask again with the tag set to 1.
    const flat = output.mime === 'image/jpeg' && output.browser === 'decode' && findExif(output.bytes) ? withOrientation(output.bytes, 1) : output.bytes;
    const raw = await session.probe(flat, output.mime);
    const [sw, sh] = output.stored ?? [0, 0];
    if (output.browser === 'decode' && (raw.width !== sw || raw.height !== sh)) throw new Error(`${session.name} stores ${output.name} as ${raw.width}x${raw.height}, expected ${sw}x${sh}`);
    const reference = references.get(output.name);
    if (reference) {
      const shown = await session.thumb(output.bytes, output.mime, 24);
      const difference = meanAbsDiff(shown, reference);
      if (difference > 6) throw new Error(`${session.name}: ${output.name} does not show upright (mean difference ${difference.toFixed(1)})`);
      say(output.name, `upright check ok (mean difference ${difference.toFixed(2)})`);
    }
  }
  return findings;
}

async function main(): Promise<void> {
  const started = Date.now();
  const check = process.argv.includes('--check');
  const chromium = await BrowserSession.open('chromium');
  let outputs: Output[];
  let references: Map<string, number[]>;
  try {
    ({ outputs, references } = await build(chromium));
  } catch (error) {
    await chromium.close();
    throw error;
  }

  const findings: Finding[] = [];
  try {
    findings.push(...(await verify(chromium, outputs, references)));
  } finally {
    await chromium.close();
  }
  if (!process.argv.includes('--no-webkit')) {
    try {
      const webkit = await BrowserSession.open('webkit');
      try {
        findings.push(...(await verify(webkit, outputs, references)));
      } finally {
        await webkit.close();
      }
    } catch (error) {
      findings.push({ browser: 'webkit', file: '(all)', result: `not checked: ${String(error).split('\n')[0]}` });
    }
  }

  // Structural sanity of the two JPEGs the engine must refuse, independent of any browser.
  const truncated = must(outputs.find((output) => output.name === 'gen-jpg-truncado.jpg'), 'truncated output').bytes;
  if (truncated[truncated.length - 2] === 0xff && truncated[truncated.length - 1] === 0xd9) throw new Error('the truncated JPEG still ends with an EOI');
  const corrupt = must(outputs.find((output) => output.name === 'gen-jpg-corrompido.jpg'), 'corrupt output').bytes;
  let walked = true;
  try {
    markerSegments(corrupt);
  } catch {
    walked = false;
  }
  if (walked || corrupt[0] !== 0xff || corrupt[1] !== 0xd8 || corrupt[2] !== 0xff || corrupt[corrupt.length - 2] !== 0xff || corrupt[corrupt.length - 1] !== 0xd9) {
    throw new Error('the corrupt JPEG must start with FF D8 FF, end with FF D9 and fail a marker walk');
  }

  let differs = 0;
  for (const output of outputs) {
    const path = join(DIR, output.name);
    const same = existsSync(path) && Buffer.compare(Buffer.from(readFileSync(path)), Buffer.from(output.bytes)) === 0;
    if (!same) differs += 1;
    if (!check) writeFileSync(path, output.bytes);
    console.log(`${sha256(output.bytes)}  ${String(output.bytes.length).padStart(8)}  ${output.name}${check ? (same ? '' : '  DIFFERS FROM DISK') : ''}`);
  }

  console.log('\nBrowser checks:');
  for (const finding of findings) console.log(`  ${finding.browser.padEnd(18)} ${finding.file.padEnd(30)} ${finding.result}`);

  console.log('\nRows for "Gerados por script" in fixtures/ORIGEM.md:');
  for (const output of outputs) console.log(`| images/${output.name} | ${output.from} | ${SCRIPT} · sha256 ${sha256(output.bytes)} | F2 |`);

  console.log(`\n${outputs.length} files, ${((Date.now() - started) / 1000).toFixed(1)} s${check ? (differs ? `, ${differs} differ from disk` : ', identical to disk') : ''}`);
  if (check && differs) process.exitCode = 1;
}

await main();
// The PDF fixtures (F5a) come with the same command and the same --check.
if (!process.argv.includes('--no-pdf')) await generatePdfFixtures(process.argv.includes('--check'));
