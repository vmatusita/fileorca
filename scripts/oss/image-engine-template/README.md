# fileorca-image-engine

The image engine behind [FileOrca](https://fileorca.com), free image and PDF tools that run in your browser. It compresses, resizes, crops, rotates and converts JPG, PNG, WebP, AVIF and HEIC photos, and every file it writes is free of Exif, XMP, IPTC and GPS data. Nothing leaves the device: the engine has no network code of its own, only the `fetch` of its `.wasm` files.

> **Status: 0.1.0.** This is the engine of the FileOrca site, cut out as it runs there. It ships TypeScript source (no build step yet), and it is not on npm. Use it from a bundler (Vite, esbuild, webpack 5) or copy the `src/` folder. The API can still change before 1.0.

## What is inside

- **Format from the bytes.** A file is what its first bytes say, never what its name or declared type says. A PNG called `.jpg` is a PNG.
- **Decoding.** The browser's own decoder first (`createImageBitmap`), and WebAssembly only where the browser cannot do the job: HEIC (libheif), AVIF, and any picture above 16,777,216 pixels, which never touches a canvas.
- **Encoding.** MozJPEG, OxiPNG, libwebp and libaom/libavif through [jSquash](https://github.com/jamsinclair/jSquash), single-thread builds only (no `SharedArrayBuffer`, so no COOP/COEP headers are needed).
- **Metadata.** New files are written from the decoded pixels. A file that gets no gain goes back with its metadata removed without recompressing it (`strip.ts`).
- **Damaged files.** Truncated and corrupted files are recognised from their structure before any decoder runs, so every browser gives the same answer.
- **Batches.** `zipStored` builds a ZIP of outputs without recompressing them.

## Install and use

The package is source-only for now. Add it from Git (or copy the folder) and let your bundler compile it:

```sh
npm install github:vmatusita/fileorca-image-engine
```

The engine imports no `.wasm` file and uses no bundler syntax. **You tell it where the nine `.wasm` files are, once, before the first file** (see "The .wasm files" below). With Vite:

```ts
import { configureWasm, processImage } from 'fileorca-image-engine';
import avifDecoder from '@jsquash/avif/codec/dec/avif_dec.wasm?url';
import avifEncoder from '@jsquash/avif/codec/enc/avif_enc.wasm?url';
import heif from 'libheif-js/libheif-wasm/libheif.wasm?url';
import jpegDecoder from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url';
import jpegEncoder from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import oxipng from '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm?url';
import resize from '@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url';
import webpDecoder from '@jsquash/webp/codec/dec/webp_dec.wasm?url';
import webpEncoder from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url';

configureWasm({ avifDecoder, avifEncoder, heif, jpegDecoder, jpegEncoder, oxipng, resize, webpDecoder, webpEncoder });

const result = await processImage(file, { kind: 'compress', level: 'recommended' }, ['jpeg', 'png', 'webp'], (percent) => console.log(percent));
if (result.ok) {
  save(result.blob); // result.format, result.width, result.height, result.outcome, result.notes
} else {
  console.warn(result.reason); // 'empty' | 'unsupported' | 'wrong-tool' | 'truncated' | 'decode' | 'load' | 'encode' | 'too-large'
}
```

In a Web Worker, use the optional entry `fileorca-image-engine/worker` (it exposes the engine through [Comlink](https://github.com/GoogleChromeLabs/comlink)). The page must send the URLs as its first message:

```ts
import { proxy, wrap } from 'comlink';
import type { ImageEngineApi } from 'fileorca-image-engine/worker';

const worker = new Worker(new URL('fileorca-image-engine/worker', import.meta.url), { type: 'module' });
const engine = wrap<ImageEngineApi>(worker);
void engine.configure({ /* the same nine URLs, as strings */ });
const result = await engine.process(file, { kind: 'compress', level: 'strong' }, ['jpeg', 'png', 'webp'], proxy(onProgress));
```

`canvasInWorker()` tells whether the worker has an `OffscreenCanvas`. When it does not (Safari before 16.4), call `processImage` on the page instead: it uses a `<canvas>` there. FileOrca does exactly this (decision 22).

## The contract

```ts
processImage(file: Blob, op: Operation, accepts: readonly ImageFormat[], onProgress?: (percent: number) => void): Promise<EngineResult>
```

- **It never rejects for a bad file.** Every failure comes back as `{ ok: false, reason, source? }`, so one bad file cannot stop a batch. `source` is the format the bytes really are.
- **`accepts`** is the list of formats the caller takes (`'jpeg' | 'png' | 'webp' | 'heic' | 'avif'`). A real format outside the list is refused as `wrong-tool`, with `source` saying what it is, so the caller can send the person to the right tool.
- **Progress** is coarse: 10 when the file is read, 40 decoded, 70 transformed, 100 encoded.
- **The result** is `{ ok: true, blob, format, width, height, outcome, notes, source, sourceWidth, sourceHeight, preview? }`.

| `outcome` | Meaning |
| --- | --- |
| `new` | A new file was written from the pixels. |
| `no-gain` | The new file would not be smaller. The original goes back with its metadata removed, byte for byte otherwise. |
| `cannot-encode` | This browser cannot write the format. The original goes back with its metadata removed. |
| `fits` | The file already met the request (a target size it fits, a resize that changes nothing). It goes back with its metadata removed. |

| `reason` | Meaning |
| --- | --- |
| `empty` | The file has no bytes. |
| `unsupported` | Not an image format the engine reads (`source` is `unknown` or `gif`). |
| `wrong-tool` | A known format that `accepts` does not list. |
| `truncated` | The file stops before its end. |
| `decode` | The bytes are damaged and no decoder could read them. |
| `load` | A codec's code or its `.wasm` could not be loaded (offline, URL not configured, a file that changed). It says nothing about the file, so the next call tries again. |
| `encode` | No encoder could write the output. |
| `too-large` | Beyond what the engine holds in memory: more than 50,000,000 pixels, or a PNG or animated WebP above the canvas limit. |

| `kind` | What it does |
| --- | --- |
| `compress` (`level: 'recommended' \| 'strong'`) | Same format. JPG by MozJPEG (quality 75 or 55, progressive), WebP by libwebp (75 or 55), PNG losslessly by OxiPNG on the file's own bytes. |
| `target` (`maxBytes`) | A JPG of at most `maxBytes`, found by measuring tiles of the photo and searching the quality. A file that already fits goes back clean. |
| `resize` (`mode: 'size'` with `width` and `height`, or `mode: 'percent'`) | Fits inside the box, keeping the ratio. It never enlarges, and says so (`not-enlarged`). |
| `cover` (`width`, `height`, `format: 'jpeg'`, `maxBytes`) | Exactly `width × height`: centre crop to the ratio, then scale, as a JPG of at most `maxBytes`. |
| `crop` (`ratio`, optional `box`) | Crops to a box in display pixels, or to the centred box of a ratio. |
| `rotate` (`turn`, `flip`) | Quarter turns and mirrors. |
| `convert` (`to: 'jpeg' \| 'png' \| 'webp' \| 'avif' \| 'swap'`, optional `level`) | Re-encodes. `level` only matters for WebP and AVIF. `swap` is PNG to JPG (transparency turns white) and anything else to PNG. |
| `pdf-page` | Prepares a picture for a PDF page: JPG for photos, PNG when it has transparency. |

Also exported: `warm(kinds)` (fetches and compiles codecs ahead of the first file; it never throws), `zipStored(entries)`, `sniff(bytes)`, `EngineError`, and the types. Limits: a picture goes through the canvas up to `CANVAS_MAX_PIXELS` (16,777,216), through WebAssembly above that, and is refused above `WASM_MAX_PIXELS` (50,000,000).

"No metadata" means no Exif, XMP, IPTC and GPS. A browser's canvas encoder may still write a standard sRGB colour profile.

## The .wasm files

`configureWasm(urls)` takes one URL (a string or a `URL`) per file. Nothing has a default: a codec asked for before its URL is set fails as `load`, and works on the next call once it is set. Each file is the one the package ships, byte for byte.

| Key | File | Package |
| --- | --- | --- |
| `avifDecoder` | `codec/dec/avif_dec.wasm` | `@jsquash/avif` {{version:@jsquash/avif}} |
| `avifEncoder` | `codec/enc/avif_enc.wasm` (single-thread; never `avif_enc_mt`) | `@jsquash/avif` {{version:@jsquash/avif}} |
| `heif` | `libheif-wasm/libheif.wasm` | `libheif-js` {{version:libheif-js}} |
| `jpegDecoder` | `codec/dec/mozjpeg_dec.wasm` | `@jsquash/jpeg` {{version:@jsquash/jpeg}} |
| `jpegEncoder` | `codec/enc/mozjpeg_enc.wasm` | `@jsquash/jpeg` {{version:@jsquash/jpeg}} |
| `oxipng` | `codec/pkg/squoosh_oxipng_bg.wasm` (single-thread; never `pkg-parallel`) | `@jsquash/oxipng` {{version:@jsquash/oxipng}} |
| `resize` | `lib/resize/pkg/squoosh_resize_bg.wasm` | `@jsquash/resize` {{version:@jsquash/resize}} |
| `webpDecoder` | `codec/dec/webp_dec.wasm` | `@jsquash/webp` {{version:@jsquash/webp}} |
| `webpEncoder` | `codec/enc/webp_enc_simd.wasm` (needs WebAssembly SIMD) | `@jsquash/webp` {{version:@jsquash/webp}} |

**libheif is LGPL-3.0.** Its `.wasm` is a file of its own, unmodified, and the engine fetches it from the URL you configure, so you can replace it with your own build of libheif. The JavaScript glue is `libheif-js/libheif-wasm/libheif.js`. Keep it that way: do not bundle the `.wasm` into your own code. The licence texts and the links to the source code are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Everything else in this repository is MIT.

## Where it runs

It is made for browsers and Web Workers: it needs `Blob`, `fetch`, `WebAssembly`, and for the canvas path `createImageBitmap` and an `OffscreenCanvas` or a `<canvas>`. Under Node 22 or newer the parts that need no canvas work as they are: `sniff`, the refusals of `processImage` (empty, unsupported, wrong tool, truncated, damaged), the metadata stripping that gives a file back clean, the ZIP builder and every WebAssembly codec, as long as your `fetch` can read the URLs you configure (`tests/engine-wasm.test.ts` shows it with a `fetch` that serves the files from `node_modules`). A picture that needs the canvas path cannot be processed in Node.

## Decisions

The comments in the code cite numbered decisions of the FileOrca project (a `DECISOES` file that is not part of this repository). These are the ones that shape the engine.

- **7. First engine.** Decode with the browser, write back on a canvas in the same format: that drops all metadata, GPS included. The WebAssembly codecs came later, on top of it (61).
- **22. Canvas or page.** The worker reports whether it has an `OffscreenCanvas`. When it has none, the same engine runs on the page with a `<canvas>`.
- **33. No gain, original back, clean.** If the new file is not smaller, or the browser cannot write the format, the original goes back with its metadata removed without loss (JPEG: Exif, XMP, IPTC and comments go, the colour profile stays and a rotated photo keeps a minimal Exif with only its Orientation; PNG and WebP lose their text and Exif chunks).
- **59. What a file is.** The format comes from the signature of the bytes. In an `ftyp` box AVIF is told by the major brand, HEIC by its brands, and when both families appear the primary item type decides. Empty files, non-images and formats the caller does not accept are refused per file, and the rest of a batch goes on.
- **60. A `cover` example.** The YouTube thumbnail preset of the FileOrca site is `{ kind: 'cover', width: 1280, height: 720, format: 'jpeg', maxBytes: 2000000 }`: 16:9, a centre crop to fill the frame, a JPG of at most 2,000,000 bytes (YouTube's limit on the phone). A photo smaller than the frame is enlarged, and the result says so (`enlarged`).
- **61. One thread, loaded on first use.** Only the single-thread glue of each codec is imported (never `avif_enc_mt`, `pkg-parallel`, the jSquash indexes or `wasm-feature-detect`), each as a dynamic import made when the first file that needs it arrives. The WebP encoder is the SIMD one: without SIMD the outcome is `cannot-encode`.
- **62. Quality and effort.** MozJPEG 75 (recommended) and 55 (strong), progressive; WebP 75 and 55; PNG by stripping plus OxiPNG on the bytes (level 2 up to 4 MP, level 1 above); AVIF quality 50 and 35 at speed 9. Speed 9 takes about 0.9 s for a 12 MP photo on a desktop CPU; speed 8 costs 2.7 times as long for 5% fewer bytes.
- **63. HEIC.** The native decoder is used only if the size it returns matches the container (`ispe` with `irot`). Otherwise libheif decodes the primary image, picked with `is_primary()`. The Exif Orientation of a HEIC is never applied, because libheif and the container already turn the picture. Display P3 pixels from libheif and from the AVIF decoder are converted to sRGB.
- **64. Truncated and corrupted.** Before decoding, the structure is walked: JPEG segments up to the `EOI` (bytes after it are accepted), PNG up to `IEND`, WebP by the RIFF size, HEIF and AVIF by the `iloc` extents. Browsers disagree about damaged files; the structure does not.
- **65. Pixel limit.** The canvas path is chosen by pixel count alone, the same in every browser: 4096 × 4096 on the canvas, one pixel more off it. Above it: WebAssembly decode, own crop, rotate and mirror code, Lanczos3 resize, then an encoder. A PNG or an animated WebP above the limit has no decoder and is refused as `too-large` (Compress does not need one for PNG).
- **66. Target size.** Bytes per pixel are measured on four tiles at native resolution, the scale is estimated once, and the MozJPEG quality (40 to 90, at most 6 tries) is searched on the reduced picture. A photo of 12 MP is encoded at full size at most once.
- **86. Review fixes.** The JPEG stripper copies only up to the image's own `EOI`, walks every scan (progressive JPEG), skips fill bytes and keeps only the ICC `APP2`; whatever follows the `EOI` (the second image of an MPF, an Ultra HDR gain map, a motion-photo video) can carry its own Exif and GPS and is not copied. Above 50,000,000 pixels the WebAssembly path refuses with `too-large` before loading a codec.
- **100. Allow-list for metadata.** PNG keeps only the chunks the picture needs (`IHDR`, `PLTE`, `IDAT`, `IEND`, `tRNS`, colour chunks, `pHYs` and the APNG chunks), WebP only `VP8X` (without the Exif and XMP bits), `VP8 `, `VP8L`, `ALPH`, `ANIM`, `ANMF` and `ICCP`, and JPEG keeps `APP0` only if it is JFIF and `APP14` only if it is Adobe. Unknown chunks go.
- **104. `load` is not the file's fault.** Loading a codec module, its glue or its `.wasm` goes through `loading()`: a failure becomes `EngineError('load')` and never "damaged file". `load` is not final, so the next call tries again.
- **Configured `.wasm` URLs.** The engine imports no `.wasm` and uses no bundler syntax (`?url`): the host passes the URLs with `configureWasm`. The FileOrca site and this package run the same code; the site names the files in its own client with Vite's `?url` and sends them to the engine and to its worker.

## Tests

```sh
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run
```

The unit tests are the engine's own, copied with the code. They need no browser. Fixtures are in `fixtures/images/`, with the answer for each in `expected.json`, written by hand and by an independent walk of the files, never by the engine. Only files whose licence allows redistribution are here: see [fixtures/SOURCES.md](fixtures/SOURCES.md). The tests of the FileOrca site that use other photos stay in the site, so a few more cases run there than here.

## Licence

MIT, see [LICENSE](LICENSE). The third-party code and fixtures have their own licences, in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), among them the LGPL-3.0 of libheif.
