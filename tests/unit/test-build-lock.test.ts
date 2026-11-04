// The lock of the extra builds (scripts/lib/test-build.ts; review E-3, DECISOES § 453), in a temporary folder, with no
// build: a lock left by a process that is gone is taken at once, one that was not renewed is taken after its time (far
// below the 600 s the specs wait), a live holder is waited for (with the path of the lock in the line that says so) and is
// never taken over while it renews its lock, and a lock released between the mkdir and the look is free, not an error.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { LOCK_STALE_MS, lock, lockState } from '../../scripts/lib/test-build.ts';

const ROOT = mkdtempSync(join(tmpdir(), 'fo-lock-'));
afterAll(() => rmSync(ROOT, { recursive: true, force: true }));
let count = 0;
const fresh = (): string => join(ROOT, `teste-${(count += 1)}.lock`);

/** Resolves with what the promise gave, or with "still waiting" after ms. */
const within = <T>(promise: Promise<T>, ms: number): Promise<T | 'still waiting'> =>
  Promise.race([promise, new Promise<'still waiting'>((resolve) => setTimeout(() => resolve('still waiting'), ms))]);

/** The PID of a process that ran and ended. */
function goneProcess(): number {
  const child = spawnSync(process.execPath, ['-e', '']);
  expect(child.status).toBe(0);
  return child.pid as number;
}

describe('a trava do build de teste (§ 453)', () => {
  it('is stale well before the specs give up on the build (600 s)', () => {
    expect(LOCK_STALE_MS).toBeLessThan(600_000 / 2);
  });

  it('takes over at once a lock whose process is gone, renewed a moment ago (a Ctrl-C in the middle of a build)', async () => {
    const path = fresh();
    mkdirSync(path);
    writeFileSync(join(path, 'pid'), String(goneProcess()));
    expect(lockState(path)).toBe('stale');
    const release = await within(lock(path, { pollMs: 20, log: () => undefined }), 2_000);
    expect(release).not.toBe('still waiting');
    if (typeof release === 'function') release();
    expect(existsSync(path)).toBe(false);
  });

  it('takes over a lock that was not renewed for its time, with no PID (a lock of before § 453)', async () => {
    const path = fresh();
    mkdirSync(path);
    const old = new Date(Date.now() - LOCK_STALE_MS - 60_000);
    utimesSync(path, old, old);
    expect(lockState(path)).toBe('stale');
    const release = await within(lock(path, { pollMs: 20, log: () => undefined }), 2_000);
    expect(release).not.toBe('still waiting');
    if (typeof release === 'function') release();
  });

  it('waits for a live holder, saying once where the lock is, and takes it when it is released', async () => {
    const path = fresh();
    const first = await lock(path, { beatMs: 20 });
    expect(lockState(path)).toBe('held');
    const lines: string[] = [];
    const second = lock(path, { pollMs: 20, log: (line) => lines.push(line) });
    expect(await within(second, 300)).toBe('still waiting');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain(path);
    first();
    const release = await within(second, 2_000);
    expect(release).not.toBe('still waiting');
    if (typeof release === 'function') release();
  });

  it('never takes over a live holder that renews its lock, even past the time of a stale one', async () => {
    const path = fresh();
    const first = await lock(path, { beatMs: 25 });
    const second = lock(path, { staleMs: 200, pollMs: 20, log: () => undefined });
    // Three times the stale time: the holder renewed the lock all along.
    expect(await within(second, 600)).toBe('still waiting');
    first();
    const release = await within(second, 2_000);
    expect(release).not.toBe('still waiting');
    if (typeof release === 'function') release();
  });

  it('reads a lock released between the mkdir and the look as free, not as an error (ENOENT)', () => {
    expect(lockState(join(ROOT, 'never-made.lock'))).toBe('free');
  });
});
