// HEIC through libheif-js (LGPL-3.0), with the .wasm as its own unmodified file: the glue is
// libheif-wasm/libheif.js and the wasm is fetched from the URL the host configured (wasm.ts), so the
// host serves it byte for byte as the package ships it and anyone can replace it (DECISOES § 7; the
// LGPL notice is on /licenses and in THIRD-PARTY-NOTICES.md of the exported package).
//
// The glue starts the module synchronously from wasmBinary, so the bytes are fetched first (and can
// be prefetched). libheif lists top-level images in item-id order, not primary first, so the primary
// is found with is_primary(). It applies irot, imir and clap itself, so the pixels are upright and
// the Exif Orientation of the file must never be applied on top. It does no colour conversion:
// the caller converts Display P3 to sRGB.
// Self-contained: nothing here imports from outside src/engine/image/.

import libheif from 'libheif-js/libheif-wasm/libheif.js';
import type { HeifDecoder, HeifImage, HeifModule } from 'libheif-js/libheif-wasm/libheif.js';
import type { Raster } from '../pixels.ts';
import { bytesOf } from './runtime.ts';
import { wasmUrl } from './wasm.ts';

let ready: Promise<{ heif: HeifModule; decoder: HeifDecoder }> | undefined;

function start(): Promise<{ heif: HeifModule; decoder: HeifDecoder }> {
  ready ??= (async () => {
    const wasmBinary = await bytesOf(wasmUrl('heif'));
    let initialised: () => void = () => {};
    const done = new Promise<void>((resolve) => (initialised = resolve));
    const quiet = () => {};
    const heif = libheif({ wasmBinary, onRuntimeInitialized: () => initialised(), print: quiet, printErr: quiet });
    if (typeof heif.HeifDecoder !== 'function') await done;
    return { heif, decoder: new heif.HeifDecoder() };
  })();
  ready.catch(() => (ready = undefined));
  return ready;
}

/** Downloads the .wasm into the HTTP cache and keeps the bytes; libheif itself starts on the first file. */
export async function warmHeic(): Promise<void> {
  await bytesOf(wasmUrl('heif'));
}

export interface DecodedHeic {
  image: Raster;
  alpha: boolean;
}

/** The primary image of a HEIC file as upright RGBA pixels (colours still as stored). */
export async function decodeHeic(bytes: Uint8Array): Promise<DecodedHeic> {
  const { heif, decoder } = await start();
  let images: HeifImage[] = [];
  try {
    images = decoder.decode(bytes);
    const primary = images.find((candidate) => candidate.is_primary()) ?? images[0];
    if (!primary) throw new Error('heic: no image in the file');
    const width = primary.get_width();
    const height = primary.get_height();
    const target = { data: new Uint8ClampedArray(width * height * 4), width, height };
    const filled = await new Promise<Raster | null>((resolve) => primary.display(target, resolve));
    if (!filled) throw new Error('heic: the image could not be decoded');
    return { image: filled, alpha: primary.has_alpha_channel() };
  } finally {
    for (const image of images) image.free();
    // The context holds a copy of the file in the wasm heap; the next decode() would free it, but
    // that may be minutes away.
    if (decoder.decoder) heif.heif_context_free(decoder.decoder);
    decoder.decoder = null;
  }
}
