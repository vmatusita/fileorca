// Where the engine finds the .wasm files its codecs load on first use. The engine never imports a .wasm and never
// builds a URL on its own: whoever hosts it hands the URLs over, once, before the first file. The FileOrca site does
// it with the URLs its bundler gives, on the page and, through the worker's `configure`, in the worker; the exported
// package is this same code, and its users pass the URLs of their own copies of the files. That is what keeps the
// engine free of the bundler's `?url` syntax.
// Nothing has a default: a call that needs a file nobody configured fails as 'load', and the next attempt may work
// once the URLs are set (DECISOES § 104).
// Self-contained: nothing here imports from outside src/engine/image/.

import { EngineError } from '../errors.ts';

/**
 * One URL per .wasm file the engine can load, each the file the package ships byte for byte (the libheif one is
 * LGPL-3.0 and must stay a file of its own, unmodified, so the user can replace it).
 * A string, or a URL (which the hosting code turns into a string; only strings cross a worker boundary).
 */
export interface WasmUrls {
  /** @jsquash/avif codec/dec/avif_dec.wasm */
  avifDecoder: string | URL;
  /** @jsquash/avif codec/enc/avif_enc.wasm (the single-thread encoder, never avif_enc_mt) */
  avifEncoder: string | URL;
  /** libheif-js libheif-wasm/libheif.wasm */
  heif: string | URL;
  /** @jsquash/jpeg codec/dec/mozjpeg_dec.wasm */
  jpegDecoder: string | URL;
  /** @jsquash/jpeg codec/enc/mozjpeg_enc.wasm */
  jpegEncoder: string | URL;
  /** @jsquash/oxipng codec/pkg/squoosh_oxipng_bg.wasm (the single-thread build, never pkg-parallel) */
  oxipng: string | URL;
  /** @jsquash/resize lib/resize/pkg/squoosh_resize_bg.wasm */
  resize: string | URL;
  /** @jsquash/webp codec/dec/webp_dec.wasm */
  webpDecoder: string | URL;
  /** @jsquash/webp codec/enc/webp_enc_simd.wasm (the SIMD encoder) */
  webpEncoder: string | URL;
}

let urls: Partial<Record<keyof WasmUrls, string>> = {};

/** Sets the URLs (or some of them: a later call adds to the earlier ones). Cheap to repeat. */
export function configureWasm(next: Partial<WasmUrls>): void {
  const merged = { ...urls };
  for (const [key, value] of Object.entries(next) as [keyof WasmUrls, string | URL | undefined][]) {
    if (value !== undefined) merged[key] = String(value);
  }
  urls = merged;
}

/** The URL of a .wasm file; 'load' when nobody configured it. */
export function wasmUrl(key: keyof WasmUrls): string {
  const url = urls[key];
  if (url === undefined) throw new EngineError('load', `no .wasm URL configured for ${key}: call configureWasm() first`);
  return url;
}
