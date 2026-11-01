import { closeSync, mkdtempSync, openSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTrigger, DROP_MB, MAX_LOOKS, openDeleted, parseDf, parseFind, shouldLook, summarizeOpenDeleted, type OpenDeleted } from '../../scripts/lib/disco.ts';

// The disk diagnostics of the Linux CI (DECISOES § 90, § 108 e § 109): the parts that read and decide.
describe('disco', () => {
  it('reads df in MB, one row per mount, /tmp on / included', () => {
    const text = ['Mounted on      Used    Avail', '/          63864832 11173888', '/          63864832 11173888', '/dev/shm          0  4061184', ''].join('\n');
    expect(parseDf(text)).toEqual([
      { target: '/', usedMb: 62368, freeMb: 10912 },
      { target: '/', usedMb: 62368, freeMb: 10912 },
      { target: '/dev/shm', usedMb: 0, freeMb: 3966 },
    ]);
    expect(parseDf('')).toEqual([]);
  });

  it('looks deeper only after / lost more than DROP_MB since the baseline', () => {
    expect(shouldLook(10_897 - DROP_MB - 1, 10_897)).toBe(true);
    expect(shouldLook(10_897 - DROP_MB, 10_897)).toBe(false);
    expect(shouldLook(10_900, 10_897)).toBe(false);
    expect(shouldLook(null, 10_897)).toBe(false);
    expect(shouldLook(609, null)).toBe(false);
  });

  it('triggers at most MAX_LOOKS times while the steps run, each DROP_MB below the last', () => {
    // The samples of the WebKit 2 de 3 in run 41250641460, attempt 1.
    const trigger = createTrigger(10_941);
    const fired = [10_897, 7939, 3936, 609, 609, 608].map((free) => trigger(free));
    expect(fired).toEqual([false, true, true, false, false, false]);
    expect(fired.filter(Boolean)).toHaveLength(MAX_LOOKS);
  });

  it('raises the baseline when the space comes back, so a second fall is seen', () => {
    const trigger = createTrigger(10_000);
    expect(trigger(7000)).toBe(true);
    expect(trigger(10_500)).toBe(false);
    expect(trigger(8000)).toBe(true);
    expect(createTrigger(null)(500)).toBe(false);
    expect(createTrigger(10_000)(null)).toBe(false);
  });

  it('sums each deleted file once, biggest first, and says how many processes it could not read', () => {
    const mb = 1048576;
    const files: OpenDeleted[] = [
      { pid: 10, command: 'WebKitWebProces', path: '/tmp/a (deleted)', key: '1:1', bytes: 3000 * mb },
      { pid: 11, command: 'WebKitNetworkPr', path: '/tmp/a (deleted)', key: '1:1', bytes: 3000 * mb },
      { pid: 12, command: 'MiniBrowser', path: '/home/runner/b (deleted)', key: '1:2', bytes: 4000 * mb },
    ];
    expect(summarizeOpenDeleted(files, 3)).toEqual([
      '7000 MB em 2 arquivo(s); 3 processo(s) sem leitura',
      '4000 MB /home/runner/b (deleted), aberto por MiniBrowser 12',
      '3000 MB /tmp/a (deleted), aberto por WebKitWebProces 10, WebKitNetworkPr 11',
    ]);
    expect(summarizeOpenDeleted([], 0)).toEqual(['0 MB em 0 arquivo(s); 0 processo(s) sem leitura']);
  });

  it('reads find blocks as MB on disk, biggest first, and skips what is not a row', () => {
    expect(parseFind('2048\t/var/log/a b.log\n6144000\t/tmp/big\nfind: x\n')).toEqual(['3000 MB /tmp/big', '1 MB /var/log/a b.log']);
    expect(parseFind('')).toEqual([]);
  });

  // /proc exists only on Linux: this runs in the Vitest of the CI (Ubuntu), the system the diagnostics are for.
  it.runIf(process.platform === 'linux')('finds a file deleted while this process still holds it open', () => {
    const dir = mkdtempSync(join(tmpdir(), 'fo-disco-'));
    const path = join(dir, 'held.bin');
    writeFileSync(path, Buffer.alloc(1048576, 1));
    const fd = openSync(path, 'r');
    unlinkSync(path);
    try {
      const { files } = openDeleted(statSync(dir).dev);
      const held = files.find((file) => file.pid === process.pid && file.path === `${path} (deleted)`);
      expect(held?.bytes).toBeGreaterThanOrEqual(1048576);
    } finally {
      closeSync(fd);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
