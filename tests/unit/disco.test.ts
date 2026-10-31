import { describe, expect, it } from 'vitest';
import { DROP_MB, parseDf, shouldLook, summarizeOpenDeleted, type OpenDeleted } from '../../scripts/lib/disco.ts';

// The disk diagnostics of the Linux CI (DECISOES § 90 e § 108): the parts that read and decide, without a runner.
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

  it('sums each deleted file once, biggest first, and leaves out what lives in memory', () => {
    const mb = 1048576;
    const files: OpenDeleted[] = [
      { pid: 10, command: 'WebKitWebProces', path: '/tmp/a (deleted)', key: '1:1', bytes: 3000 * mb },
      { pid: 11, command: 'WebKitNetworkPr', path: '/tmp/a (deleted)', key: '1:1', bytes: 3000 * mb },
      { pid: 12, command: 'MiniBrowser', path: '/home/runner/b (deleted)', key: '1:2', bytes: 4000 * mb },
      { pid: 12, command: 'MiniBrowser', path: '/memfd:shm (deleted)', key: '5:9', bytes: 9000 * mb },
      { pid: 13, command: 'node', path: '/dev/shm/x (deleted)', key: '6:3', bytes: 9000 * mb },
    ];
    expect(summarizeOpenDeleted(files)).toEqual([
      '7000 MB em 2 arquivo(s)',
      '4000 MB /home/runner/b (deleted), aberto por MiniBrowser 12',
      '3000 MB /tmp/a (deleted), aberto por WebKitWebProces 10, WebKitNetworkPr 11',
    ]);
    expect(summarizeOpenDeleted([])).toEqual(['0 MB em 0 arquivo(s)']);
  });
});
