// The lock of the extra builds (scripts/lib/test-build.ts; review E-3, DECISOES § 453), in a temporary folder, with no
// build: a lock left by a process that is gone is taken at once, one that was not renewed is taken after its time (far
// below the 600 s the specs wait), a live holder is waited for (with the path of the lock in the line that says so) and is
// never taken over while it renews its lock, and a lock released between the mkdir and the look is free, not an error.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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

  // Second pass of the review (DECISOES § 455): two processes that find one stale lock at the same moment. Before, each
  // read "stale" and removed the lock, and the slower one could remove the lock the faster had just taken, so both held it
  // (7 to 9 times in 30 rounds). Now one waiter at a time takes the stale lock over, and a holder releases only its own.
  it('lets one process at a time take over a stale lock, when two find it together', async () => {
    const module = process.env['FO_LOCK_MODULE'] ?? join(process.cwd(), 'scripts/lib/test-build.ts');
    const worker = join(ROOT, 'worker.mjs');
    writeFileSync(
      worker,
      [
        'const [, , path, startAt, holdMs] = process.argv;',
        `const { lock } = await import(${JSON.stringify(pathToFileURL(module).href)});`,
        'const wait = Number(startAt) - Date.now();',
        'if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));',
        'const release = await lock(path, { pollMs: 5, log: () => {} });',
        'const acquired = Date.now();',
        'await new Promise((resolve) => setTimeout(resolve, Number(holdMs)));',
        'const released = Date.now();',
        'release();',
        'console.log(JSON.stringify({ acquired, released }));',
      ].join('\n'),
    );
    const ROUNDS = 20;
    const startAt = Date.now() + 6_000;
    const run = (path: string) =>
      new Promise<{ acquired: number; released: number }>((resolve, reject) => {
        const child = spawn(process.execPath, [worker, path, String(startAt), '150'], { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        let err = '';
        child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()));
        child.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()));
        child.on('close', (status) => (status === 0 ? resolve(JSON.parse(out.trim().split('\n').pop() ?? '{}') as { acquired: number; released: number }) : reject(new Error(err))));
      });
    const rounds = Array.from({ length: ROUNDS }, () => {
      const path = fresh();
      mkdirSync(path);
      writeFileSync(join(path, 'pid'), String(goneProcess()));
      return Promise.all([run(path), run(path)]);
    });
    const overlaps = (await Promise.all(rounds)).filter(([a, b]) => a.acquired < b.released && b.acquired < a.released);
    expect(overlaps, 'rounds where both processes held the lock').toEqual([]);
  }, 120_000);
});
