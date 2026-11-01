import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { decodeAvif, encodeAvif } from '../../src/engine/image/codecs/avif.ts';
import { decodeHeic } from '../../src/engine/image/codecs/heic.ts';
import { decodeJpeg, encodeJpeg } from '../../src/engine/image/codecs/jpeg.ts';
import { encodePng, optimisePng } from '../../src/engine/image/codecs/png.ts';
import { resizeRaster } from '../../src/engine/image/codecs/resize.ts';
import { configureWasm } from '../../src/engine/image/codecs/wasm.ts';
import type { WasmUrls } from '../../src/engine/image/codecs/wasm.ts';
import { decodeWebp, encodeWebp } from '../../src/engine/image/codecs/webp.ts';
import { EngineError } from '../../src/engine/image/errors.ts';
import { makeRaster } from '../../src/engine/image/pixels.ts';
import type { Raster } from '../../src/engine/image/pixels.ts';
import { fixture, names } from './lib/oracle.ts';

// The engine imports no .wasm: whoever hosts it passes the URLs (codecs/wasm.ts). These tests are the proof that the
// engine works that way with nothing but Node: the files are the ones the packages ship, served through a fetch
// that knows only the URLs the test configured, and every codec runs from them. In the exported package this is the
// test that shows the package needs no bundler.

const require = createRequire(import.meta.url);

/** The .wasm files of the installed packages, by the key of WasmUrls. */
const FILES: Record<keyof WasmUrls, string> = {
  avifDecoder: '@jsquash/avif/codec/dec/avif_dec.wasm',
  avifEncoder: '@jsquash/avif/codec/enc/avif_enc.wasm',
  heif: 'libheif-js/libheif-wasm/libheif.wasm',
  jpegDecoder: '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm',
  jpegEncoder: '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm',
  oxipng: '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm',
  resize: '@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm',
  webpDecoder: '@jsquash/webp/codec/dec/webp_dec.wasm',
  webpEncoder: '@jsquash/webp/codec/enc/webp_enc_simd.wasm',
};

const KEYS = Object.keys(FILES) as (keyof WasmUrls)[];

/** Addresses that exist nowhere: only the stubbed fetch below can answer them. */
const URLS = Object.fromEntries(KEYS.map((key) => [key, `https://assets.example.test/wasm/${key}.wasm`])) as Record<keyof WasmUrls, string>;

describe('wasm: the engine has no default for where the .wasm files are', () => {
  it('fails as load, naming the file, until configureWasm is called', async () => {
    vi.resetModules(); // a fresh copy of the module, before any test below configured it
    const wasm = await import('../../src/engine/image/codecs/wasm.ts');
    const errors = await import('../../src/engine/image/errors.ts');
    let caught: unknown;
    try {
      wasm.wasmUrl('jpegEncoder');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(errors.EngineError);
    expect((caught as EngineError).reason).toBe('load');
    expect((caught as EngineError).message).toContain('jpegEncoder');
  });

  it('takes strings or URLs, keeps them as strings, adds to the earlier call and ignores undefined', async () => {
    vi.resetModules();
    const wasm = await import('../../src/engine/image/codecs/wasm.ts');
    wasm.configureWasm({ resize: new URL('https://a.example.test/resize.wasm'), oxipng: '/files/oxipng.wasm' });
    wasm.configureWasm({ resize: undefined as unknown as string, jpegEncoder: 'enc.wasm' });
    expect(wasm.wasmUrl('resize')).toBe('https://a.example.test/resize.wasm');
    expect(wasm.wasmUrl('oxipng')).toBe('/files/oxipng.wasm');
    expect(wasm.wasmUrl('jpegEncoder')).toBe('enc.wasm');
    expect(() => wasm.wasmUrl('heif')).toThrow();
  });

  it('turns a codec that was never configured into a refused file, never a crash', async () => {
    vi.resetModules();
    const { encodePng: fresh } = await import('../../src/engine/image/codecs/png.ts');
    await expect(fresh(makeRaster(2, 2), 1)).rejects.toMatchObject({ name: 'EngineError', reason: 'load' });
  });
});

/** A 24 × 16 picture with a gradient, so the codecs have something to encode. */
function gradient(): Raster {
  const raster = makeRaster(24, 16);
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 24; x += 1) raster.data.set([x * 10, y * 15, 128, 255], (y * 24 + x) * 4);
  }
  return raster;
}

describe('wasm: every codec runs from the URLs it was given, and fetches nothing else', () => {
  const served = new Map<string, Uint8Array>();
  const fetched: string[] = [];

  beforeAll(() => {
    for (const key of KEYS) served.set(URLS[key], new Uint8Array(readFileSync(require.resolve(FILES[key]))));
    vi.stubGlobal('fetch', async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      fetched.push(url);
      const bytes = served.get(url);
      if (!bytes) return new Response('not found', { status: 404 });
      return new Response(bytes as BlobPart, { headers: { 'content-type': 'application/wasm' } });
    });
    configureWasm(URLS);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('JPEG: MozJPEG encodes and its decoder reads the file back at the same size', async () => {
    const out = await encodeJpeg(gradient(), 80);
    expect(Array.from(out.subarray(0, 3))).toEqual([0xff, 0xd8, 0xff]);
    const back = await decodeJpeg(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer);
    expect([back.image.width, back.image.height, back.truncated]).toEqual([24, 16, false]);
  });

  it('PNG: OxiPNG writes a PNG from pixels and recompresses PNG bytes', async () => {
    const png = await encodePng(gradient(), 1);
    expect(Buffer.from(png.subarray(0, 8)).toString('hex')).toBe('89504e470d0a1a0a');
    const again = await optimisePng(png, 1);
    expect(Buffer.from(again.subarray(0, 8)).toString('hex')).toBe('89504e470d0a1a0a');
  });

  it('Resize: Lanczos3 returns exactly the size asked for', async () => {
    const small = await resizeRaster(gradient(), 12, 8);
    expect([small.width, small.height, small.data.length]).toEqual([12, 8, 12 * 8 * 4]);
  });

  it('WebP: the SIMD encoder writes a RIFF/WEBP file and the decoder reads it back', async () => {
    const out = await encodeWebp(gradient(), 75);
    expect([Buffer.from(out.subarray(0, 4)).toString('latin1'), Buffer.from(out.subarray(8, 12)).toString('latin1')]).toEqual(['RIFF', 'WEBP']);
    const back = await decodeWebp(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer);
    expect([back.width, back.height]).toEqual([24, 16]);
  });

  it('AVIF: the single-thread encoder writes an AVIF and the decoder reads it back', async () => {
    const out = await encodeAvif(gradient(), 50);
    expect(Buffer.from(out.subarray(4, 12)).toString('latin1')).toBe('ftypavif');
    const back = await decodeAvif(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer);
    expect([back.width, back.height]).toEqual([24, 16]);
  });

  it('HEIC: libheif starts from the separate .wasm and decodes the primary image', async () => {
    const decoded = await decodeHeic(fixture(names('heic-08')[0]!));
    expect([decoded.image.width, decoded.image.height]).toEqual([1512, 850]);
  });

  it('fetched each of the nine files once, from the configured URL, and nothing else', () => {
    expect([...fetched].sort()).toEqual(Object.values(URLS).sort());
  });
});
