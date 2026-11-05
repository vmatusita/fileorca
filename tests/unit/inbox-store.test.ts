// F13a, revisão d-3 (DECISOES § F13A-R-08): storeForNext(), the chip that takes the files along (§ 496), when the inbox is
// not written within its time (3 s) or fails half way: it says false, the navigation goes on without the choice in the tab,
// and nothing it wrote stays in the inbox. The Cache Storage of a browser runs its operations in the order they are asked
// (a queue), so the fake here is a queue too: an operation starts when the one before it ends, after its own delay.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INBOX_CACHE, INBOX_TOOL_KEY } from '../../src/sw/shared.ts';
import { storeForNext, type Outgoing } from '../../src/tools/image/inbox.ts';

interface Delays {
  /** The delay of each caches.delete, in the order they are asked (the inbox of before, then the clean-up of the late one). */
  deletes?: number[];
  open?: number;
  put?: number;
  /** The put (0-based) that fails, as a full quota does. */
  failPut?: number;
}

function fakeCaches(delays: Delays) {
  const store = new Map<string, Map<string, Response>>();
  let queue: Promise<unknown> = Promise.resolve();
  let deletes = 0;
  let puts = 0;
  const run = <T>(ms: number, op: () => T): Promise<T> => {
    const next = queue.then(() => new Promise<T>((done, fail) => setTimeout(() => {
      try {
        done(op());
      } catch (error) {
        fail(error);
      }
    }, ms)));
    queue = next.catch(() => undefined);
    return next;
  };
  const api = {
    delete: (name: string) => run(delays.deletes?.[deletes++] ?? 0, () => store.delete(name)),
    has: (name: string) => Promise.resolve(store.has(name)),
    open: (name: string) =>
      run(delays.open ?? 0, () => {
        const cache = store.get(name) ?? new Map<string, Response>();
        store.set(name, cache);
        return {
          put: (request: Request, response: Response) =>
            run(delays.put ?? 0, () => {
              if (puts++ === delays.failPut) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
              cache.set(request.url, response);
            }),
        };
      }),
  };
  return { store, api };
}

const FILES: Outgoing[] = [
  { name: 'photo-1.jpg', blob: new Blob([new Uint8Array(8)], { type: 'image/jpeg' }) },
  { name: 'photo-2.jpg', blob: new Blob([new Uint8Array(8)], { type: 'image/jpeg' }) },
];

let session: Map<string, string>;
let fake: ReturnType<typeof fakeCaches>;

function install(delays: Delays): void {
  fake = fakeCaches(delays);
  session = new Map();
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('location', { origin: 'https://fileorca.com' });
  vi.stubGlobal('caches', fake.api);
  vi.stubGlobal('sessionStorage', { setItem: (key: string, value: string) => void session.set(key, value), getItem: (key: string) => session.get(key) ?? null });
}

/** Lets every operation still in the queue run (the write that goes on after the deadline). */
const settle = (ms = 1000): Promise<void> => new Promise((done) => setTimeout(done, ms));

describe('storeForNext: past its time or failing, it leaves nothing in the inbox', () => {
  beforeEach(() => vi.useRealTimers());
  afterEach(() => vi.unstubAllGlobals());

  it('writes the files and the choice of the tab when the inbox answers in time', async () => {
    install({});
    expect(await storeForNext(FILES, 'resize-image', 'compress-image', 500)).toBe(true);
    expect(fake.store.get(INBOX_CACHE)?.size).toBe(2);
    expect(JSON.parse(session.get(INBOX_TOOL_KEY) ?? 'null')).toEqual({ tool: 'resize-image', order: [0, 1], from: 'compress-image' });
  });

  it('the delete of the inbox of before takes past the time: false, and the late write never makes the inbox', async () => {
    install({ deletes: [300] });
    expect(await storeForNext(FILES, 'resize-image', 'compress-image', 100)).toBe(false);
    await settle();
    expect(fake.store.has(INBOX_CACHE), 'an inbox made after the deadline').toBe(false);
    expect(session.has(INBOX_TOOL_KEY)).toBe(false);
  });

  it('the open of the inbox takes past the time: false, and what the open made is deleted', async () => {
    install({ open: 300 });
    expect(await storeForNext(FILES, 'resize-image', 'compress-image', 100)).toBe(false);
    await settle();
    expect(fake.store.has(INBOX_CACHE)).toBe(false);
    expect(session.has(INBOX_TOOL_KEY)).toBe(false);
  });

  it('the files take past the time to be written: false, and no file stays', async () => {
    install({ put: 150 });
    expect(await storeForNext(FILES, 'resize-image', 'compress-image', 100)).toBe(false);
    await settle();
    expect(fake.store.get(INBOX_CACHE)?.size ?? 0).toBe(0);
    expect(session.has(INBOX_TOOL_KEY)).toBe(false);
  });

  it('the second file fails (a full quota): false, and the first one is deleted', async () => {
    install({ failPut: 1 });
    expect(await storeForNext(FILES, 'resize-image', 'compress-image', 500)).toBe(false);
    await settle(200);
    expect(fake.store.has(INBOX_CACHE)).toBe(false);
    expect(session.has(INBOX_TOOL_KEY)).toBe(false);
  });
});
