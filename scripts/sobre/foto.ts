// pnpm sobre:foto <photo.jpg> [--out <dir>]: Victor's photo for the About page and the author box of the guides (F19a,
// decision 5; DECISOES § 762). It reads a JPEG photo, turns it upright by its Exif Orientation, crops the square in its
// middle and writes the two sizes the pages use (src/platform/about-photo.ts), each as WebP and as a JPG for the browsers
// that do not read WebP: victor-320.webp, victor-320.jpg, victor-128.webp and victor-128.jpg, in public/about/ (or --out).
// The work is done by the image engine of the site in Node, the path of pnpm guias:medir and of the fixtures: MozJPEG to
// read and to write the JPG, the Lanczos3 resize of jSquash, and the site's own libwebp codec for the WebP, at the
// Recommended quality of the site. Both encoders write the pixels only, so no output carries any metadata (no Exif, no
// XMP, no IPTC, no GPS); at the end the script prints the metadata report of each file (tests/e2e/lib/images.ts) and fails
// if any of them has anything. No new dependency. The original photo never goes into the repository (it would carry the
// place where it was taken): keep it outside, as in `pnpm sobre:foto "Claude outputs\victor.jpg"` (docs/OPERACAO.md).
// tests/unit/about-photo.test.ts runs this script on a fixture with GPS, into a temporary folder.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { configureWasm } from '../../src/engine/image/codecs/wasm.ts';
import { encodeWebp } from '../../src/engine/image/codecs/webp.ts';
import { QUALITY } from '../../src/engine/image/encode.ts';
import { PHOTO_DIR, PHOTO_SIZES, photoName } from '../../src/platform/about-photo.ts';
import { decodeJpegNode, encodeJpegNode, resizeNode } from '../fixtures/lib/mozjpeg.ts';
import type { Rgba } from '../fixtures/lib/rgba.ts';
import { metadataReport, sniff } from '../../tests/e2e/lib/images.ts';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const out = resolve(outAt >= 0 ? (args[outAt + 1] ?? '') : PHOTO_DIR);
// The photo is the one argument that is neither an option nor the folder after --out.
const [input, ...extra] = args.filter((arg, index) => !arg.startsWith('--') && !(outAt >= 0 && index === outAt + 1));
if (!input || extra.length > 0 || (outAt >= 0 && !args[outAt + 1])) {
  console.error('Use: pnpm sobre:foto <photo.jpg> [--out <dir>]');
  process.exit(1);
}

const bytes = new Uint8Array(readFileSync(input));
if (sniff(bytes) !== 'jpeg') {
  console.error(`${input}: not a JPEG photo. Save it as JPG and run again.`);
  process.exit(1);
}

/** The square in the middle of the picture, as wide as its shorter side. */
function centreSquare(image: Rgba): Rgba {
  const side = Math.min(image.width, image.height);
  const left = Math.floor((image.width - side) / 2);
  const top = Math.floor((image.height - side) / 2);
  const data = new Uint8ClampedArray(side * side * 4);
  for (let row = 0; row < side; row += 1) {
    const from = ((top + row) * image.width + left) * 4;
    data.set(image.data.subarray(from, from + side * 4), row * side * 4);
  }
  return { data, width: side, height: side };
}

// The WebP encoder of the engine fetches its .wasm by URL, as in the browser: here the URL is the package's file itself.
const require = createRequire(import.meta.url);
const webpWasm = readFileSync(require.resolve('@jsquash/webp/codec/enc/webp_enc_simd.wasm'));
configureWasm({ webpEncoder: `data:application/wasm;base64,${webpWasm.toString('base64')}` });

const upright = await decodeJpegNode(bytes, true);
const square = centreSquare(upright);
const largest = Math.max(...Object.values(PHOTO_SIZES));
if (square.width < largest) {
  console.error(`${input}: the shorter side has ${square.width} px; the photo needs at least ${largest} px.`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
let dirty = false;
for (const size of Object.values(PHOTO_SIZES)) {
  const pixels = await resizeNode(square, size, size);
  const files: [string, Uint8Array][] = [
    [photoName(size, 'webp'), await encodeWebp(pixels, QUALITY.webp.recommended)],
    [photoName(size, 'jpg'), await encodeJpegNode(pixels, QUALITY.mozjpeg.recommended)],
  ];
  for (const [name, data] of files) {
    writeFileSync(join(out, name), data);
    const report = metadataReport(data);
    const clean = !report.exif && !report.xmp && !report.gps && report.other.length === 0;
    if (!clean) dirty = true;
    console.log(`${join(out, name)}: ${size} × ${size} px, ${data.length} bytes, ${report.format}; metadata: ${JSON.stringify(report)}${clean ? '' : ' (NOT CLEAN)'}`);
  }
}
if (dirty) {
  console.error('A file came out with metadata: do not use it.');
  process.exit(1);
}
console.log(`Done: ${Object.values(PHOTO_SIZES).length * 2} files in ${out}, with no metadata. The About and the author box show them on the next build.`);
