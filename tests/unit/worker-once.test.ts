import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Comlink from 'comlink';

// F5a (DECISOES § 168 and § 172): WebKit evaluates the entry script of a module worker a second time when a chunk the
// worker loads on demand imports from it, and the bundler puts its CommonJS helper in that entry (the codec chunks of the
// image worker and the qpdf glue of the PDF worker import it). Every module of the worker then exists twice in the same
// global scope, and a second expose() answers every call again: the work runs twice and a second .wasm is fetched. Each
// worker must expose its API once. The test evaluates each worker entry twice in one global scope, the way WebKit does,
// and counts the calls to expose().
const exposed = vi.hoisted(() => ({ calls: 0 }));
vi.mock('comlink', async (original) => ({
  ...(await original<typeof Comlink>()),
  expose: () => {
    exposed.calls += 1;
  },
}));

const MARKS = ['fileorca.image-engine.exposed', 'fileorca.pdf-engine.exposed'];

describe('a worker evaluated twice in the same scope answers once', () => {
  beforeEach(() => {
    exposed.calls = 0;
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

  it('the PDF worker', async () => {
    await import('../../src/engine/pdf/worker.ts');
    expect(exposed.calls).toBe(1);
    vi.resetModules();
    await import('../../src/engine/pdf/worker.ts');
    expect(exposed.calls, 'the second copy of the entry must not expose the API again').toBe(1);
  });
});
