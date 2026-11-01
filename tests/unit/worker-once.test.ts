import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Comlink from 'comlink';

// F5a (DECISOES § 168 and § 172): WebKit evaluates the entry script of a module worker a second time when a chunk the
// worker loads on demand imports from it, and the bundler puts its CommonJS helper in that entry (the codec chunks of the
// image worker and the qpdf glue of the PDF worker import it). Every module of the worker then exists twice in the same
// global scope, and a second expose() answers every call again: the work runs twice and a second .wasm is fetched. Each
// worker must expose its API once. The test evaluates each worker entry twice in one global scope, the way WebKit does,
// and counts the calls to expose(). The codecs of the image worker read where the .wasm files are, and make their errors,
// with helpers they import from the entry, so they run against the second copy: it must know the URLs the page sent to
// the first one, and its errors must be EngineErrors to the first (the image tools failed this way in the WebKit of the
// CI, run 41330210631).
const exposed = vi.hoisted(() => ({ calls: 0, api: null as Record<string, (...args: never[]) => unknown> | null }));
vi.mock('comlink', async (original) => ({
  ...(await original<typeof Comlink>()),
  expose: (api: Record<string, (...args: never[]) => unknown>) => {
    exposed.calls += 1;
    exposed.api = api;
  },
}));

const MARKS = ['fileorca.image-engine.exposed', 'fileorca.pdf-engine.exposed', 'fileorca.image-engine.wasm-urls'];

describe('a worker evaluated twice in the same scope answers once', () => {
  beforeEach(() => {
    exposed.calls = 0;
    exposed.api = null;
    const scope = globalThis as unknown as Record<symbol, unknown>;
    for (const mark of MARKS) delete scope[Symbol.for(mark)];
    vi.resetModules();
  });

  it('the image worker', async () => {
    await import('../../src/engine/image/worker.ts');
    expect(exposed.calls).toBe(1);
    vi.resetModules();
    await import('../../src/engine/image/worker.ts');
    expect(exposed.calls, 'the second copy of the entry must not expose the API again').toBe(1);
  });

  it('the image worker: the second copy knows the .wasm URLs the page sent to the first', async () => {
    await import('../../src/engine/image/worker.ts');
    const configure = exposed.api?.['configure'] as ((urls: Record<string, string>) => void) | undefined;
    expect(configure).toBeTypeOf('function');
    configure?.({ jpegEncoder: '/_astro/mozjpeg_enc.test.wasm', resize: '/_astro/squoosh_resize_bg.test.wasm' });
    vi.resetModules();
    await import('../../src/engine/image/worker.ts');
    // The module registry now holds the second copy: this is the wasm.ts the codecs of that copy read.
    const second = await import('../../src/engine/image/codecs/wasm.ts');
    expect(second.wasmUrl('jpegEncoder')).toBe('/_astro/mozjpeg_enc.test.wasm');
    expect(second.wasmUrl('resize')).toBe('/_astro/squoosh_resize_bg.test.wasm');
  });

  it('the image engine: an error of the other copy is an EngineError, with its reason', async () => {
    const first = await import('../../src/engine/image/errors.ts');
    vi.resetModules();
    const second = await import('../../src/engine/image/errors.ts');
    expect(second.EngineError).not.toBe(first.EngineError);
    const error = new second.EngineError('truncated');
    expect(error).toBeInstanceOf(first.EngineError);
    expect(first.reasonOf(error, 'decode')).toBe('truncated');
    await expect(first.loading(Promise.reject(error))).rejects.toBe(error);
    expect(first.reasonOf(new Error('truncated'), 'decode'), 'a plain Error is not one').toBe('decode');
  });

  it('the PDF worker', async () => {
    await import('../../src/engine/pdf/worker.ts');
    expect(exposed.calls).toBe(1);
    vi.resetModules();
    await import('../../src/engine/pdf/worker.ts');
    expect(exposed.calls, 'the second copy of the entry must not expose the API again').toBe(1);
  });
});
