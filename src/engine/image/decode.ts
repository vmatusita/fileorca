// Decoding: from the bytes of a file to an upright picture (a Work). The native decoder of the
// browser comes first (createImageBitmap with the photo orientation); WASM only where the native
// one cannot do the job: HEIC in browsers that do not read it, AVIF in the same case, and every
// picture above CANVAS_MAX_PIXELS, which never touches a canvas (DECISOES § 7).
//
// Orientation is applied exactly once:
//   JPEG: by the browser ('from-image'), or by jSquash with the Exif Orientation on the WASM path.
//   HEIC: by the container (irot, imir, clap), by libheif or by the browser. The Exif Orientation of
//         a HEIC is never applied: the iPhone writes 6 next to an irot that already turns the picture.
// Display P3 pixels from libheif and jSquash (neither converts colour) go to sRGB here; the
// browser's canvas path converts on its own.
// Self-contained: nothing here imports from outside src/engine/image/.

import { beyondDecoding, decodePath, nativeIfSizeMatches } from './choice.ts';
import { EngineError } from './errors.ts';
import { clampBox, crop, displayP3ToSrgb, exifSpin, transform } from './pixels.ts';
import type { Raster } from './pixels.ts';
import type { Transform } from './bmff.ts';
import type { SourceInfo } from './probe.ts';
import { mimeOf } from './sniff.ts';
import { WASM_MAX_PIXELS, type ImageFormat } from './types.ts';
import { canvasAvailable, CanvasWork, RasterWork } from './work.ts';
import type { Work } from './work.ts';

export interface Decoded {
  work: Work;
  /** This browser can show the source file itself; false for HEIC and for AVIF decoded by WASM. */
  viewable: boolean;
  /** The picture may carry transparency (a hint: the real check is work.hasTransparency()). */
  alpha: boolean;
}

function arrayBufferOf(bytes: Uint8Array): ArrayBuffer {
  return bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength ? (bytes.buffer as ArrayBuffer) : (bytes.slice().buffer as ArrayBuffer);
}

/** createImageBitmap on the file's own type (the declared one comes from the file name). */
async function bitmapOf(blob: Blob, format: ImageFormat): Promise<ImageBitmap> {
  const typed = blob.slice(0, blob.size, mimeOf(format));
  try {
    return await createImageBitmap(typed, { imageOrientation: 'from-image' });
  } catch (error) {
    // An engine that does not know the option value throws a TypeError; the plain call still
    // applies the photo orientation there.
    if (error instanceof TypeError) return createImageBitmap(typed);
    throw error;
  }
}

/** Pixels from a WASM decoder: on a canvas when one exists (native encoders), else as they are. */
function workOfPixels(raster: Raster, path: 'canvas' | 'wasm'): Work {
  return path === 'canvas' && canvasAvailable() ? CanvasWork.fromRaster(raster) : new RasterWork(raster);
}

async function canvasDecode(blob: Blob, info: SourceInfo): Promise<Decoded> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await bitmapOf(blob, info.format);
  } catch {
    throw new EngineError('decode', 'the browser could not decode this file');
  }
  const { width, height } = bitmap;
  let work: Work = CanvasWork.fromBitmap(bitmap);
  // A browser that ignored the Orientation leaves the stored size (turned photos only: for 1 to 4
  // the size is the same either way, and those are trusted).
  if (info.format === 'jpeg' && info.orientation >= 5 && width !== height && width === info.storedWidth && height === info.storedHeight) {
    const upright = await work.spin(exifSpin(info.orientation));
    work.close();
    work = upright;
  }
  return { work, viewable: true, alpha: info.alpha };
}

async function wasmJpeg(bytes: Uint8Array, info: SourceInfo): Promise<Decoded> {
  const { decodeJpeg } = await import('./codecs/jpeg.ts');
  const { image, truncated } = await decodeJpeg(arrayBufferOf(bytes));
  if (truncated) throw new EngineError('truncated', 'libjpeg: premature end of file');
  if (info.displayP3) displayP3ToSrgb(image);
  return { work: new RasterWork(image), viewable: true, alpha: false };
}

async function wasmWebp(bytes: Uint8Array, info: SourceInfo): Promise<Decoded> {
  // The jSquash decoder (libwebp 1.0.2) cannot read animated files, and a picture this big
  // cannot go through a canvas to take the first frame.
  if (info.animated) throw new EngineError('too-large', 'animated WebP above the canvas limit');
  const { decodeWebp } = await import('./codecs/webp.ts');
  return { work: new RasterWork(await decodeWebp(arrayBufferOf(bytes))), viewable: true, alpha: info.alpha };
}

/** irot, imir and clap of the container, in order, for decoders that do not apply them (jSquash AVIF). */
export function applyContainerTransforms(image: Raster, transforms: readonly Transform[]): Raster {
  let current = image;
  for (const item of transforms) {
    if (item.kind === 'irot' && item.degrees !== 0) {
      // irot counts degrees anticlockwise; Spin counts clockwise.
      current = transform(current, { rotate: (360 - item.degrees) as 90 | 180 | 270, flipH: false, flipV: false });
    } else if (item.kind === 'imir') {
      current = transform(current, { rotate: 0, flipH: item.axis === 0, flipV: item.axis === 1 });
    } else if (item.kind === 'clap' && item.width > 0 && item.height > 0) {
      const x = (current.width - item.width) / 2 + item.xOffset;
      const y = (current.height - item.height) / 2 + item.yOffset;
      current = crop(current, clampBox({ x, y, width: item.width, height: item.height }, current.width, current.height));
    }
  }
  return current;
}

async function heicDecode(bytes: Uint8Array, blob: Blob, info: SourceInfo, path: 'canvas' | 'wasm'): Promise<Decoded> {
  let alpha = false;
  const wasm = async (): Promise<Raster> => {
    const { decodeHeic } = await import('./codecs/heic.ts');
    const decoded = await decodeHeic(bytes);
    alpha = decoded.alpha;
    if (info.displayP3) displayP3ToSrgb(decoded.image);
    return decoded.image;
  };
  if (path === 'wasm') return { work: new RasterWork(await wasm()), viewable: false, alpha };
  const decision = await nativeIfSizeMatches<ImageBitmap | Raster>(
    { width: info.width, height: info.height },
    { native: () => bitmapOf(blob, 'heic'), wasm, discard: (value) => ('close' in value ? value.close() : undefined) },
  );
  if (decision.via === 'native') return { work: CanvasWork.fromBitmap(decision.value as ImageBitmap), viewable: true, alpha: false };
  return { work: workOfPixels(decision.value as Raster, path), viewable: false, alpha };
}

async function avifDecode(bytes: Uint8Array, blob: Blob, info: SourceInfo, path: 'canvas' | 'wasm'): Promise<Decoded> {
  const wasm = async (): Promise<Raster> => {
    const { decodeAvif } = await import('./codecs/avif.ts');
    // libavif leaves irot, imir and clap to the application, so the container's are applied here.
    const image = applyContainerTransforms(await decodeAvif(arrayBufferOf(bytes)), info.transforms);
    if (info.displayP3) displayP3ToSrgb(image);
    return image;
  };
  if (path === 'wasm') return { work: new RasterWork(await wasm()), viewable: false, alpha: info.alpha };
  const decision = await nativeIfSizeMatches<ImageBitmap | Raster>(
    { width: info.width, height: info.height },
    { native: () => bitmapOf(blob, 'avif'), wasm, discard: (value) => ('close' in value ? value.close() : undefined) },
  );
  if (decision.via === 'native') return { work: CanvasWork.fromBitmap(decision.value as ImageBitmap), viewable: true, alpha: info.alpha };
  return { work: workOfPixels(decision.value as Raster, path), viewable: false, alpha: info.alpha };
}

/** Decodes the file into an upright picture; throws EngineError with the reason to show. */
export async function decodeSource(bytes: Uint8Array, blob: Blob, info: SourceInfo): Promise<Decoded> {
  const path = decodePath(info.width, info.height);
  // The size comes from the headers (probe), so a picture too big for the WASM decoders is refused before one is loaded.
  if (path === 'wasm' && beyondDecoding(info.width, info.height)) {
    throw new EngineError('too-large', `${info.width} × ${info.height} is more than the ${WASM_MAX_PIXELS} pixels the no-canvas path decodes`);
  }
  switch (info.format) {
    case 'jpeg':
      return path === 'canvas' ? canvasDecode(blob, info) : wasmJpeg(bytes, info);
    case 'png':
      // No PNG decoder is allowed in the dependencies; only Compress takes a big PNG, and it never decodes.
      if (path === 'wasm') throw new EngineError('too-large', 'PNG above the canvas limit');
      return canvasDecode(blob, info);
    case 'webp':
      return path === 'canvas' ? canvasDecode(blob, info) : wasmWebp(bytes, info);
    case 'heic':
      return heicDecode(bytes, blob, info, path);
    case 'avif':
      return avifDecode(bytes, blob, info, path);
  }
}
