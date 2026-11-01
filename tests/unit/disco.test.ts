import { randomBytes } from 'node:crypto';
import { closeSync, existsSync, mkdtempSync, openSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createRecorder,
  createTrigger,
  FINE_STEP_MB,
  cutLabel,
  DROP_MB,
  MAX_LOOKS,
  openDeleted,
  parseDf,
  parseFind,
  shouldLook,
  summarizeOpenDeleted,
  type OpenDeleted,
} from '../../scripts/lib/disco.ts';

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
    expect(summarizeOpenDeleted(files, { mine: 1, others: 3 })).toEqual([
      '7000 MB em 2 arquivo(s); sem leitura: 1 processo(s) deste usuário e 3 de outros',
      '4000 MB /home/runner/b (deleted), aberto por MiniBrowser 12',
      '3000 MB /tmp/a (deleted), aberto por WebKitWebProces 10, WebKitNetworkPr 11',
    ]);
    expect(summarizeOpenDeleted([], { mine: 0, others: 0 })).toEqual(['0 MB em 0 arquivo(s); sem leitura: 0 processo(s) deste usuário e 0 de outros']);
  });

  it('reads find blocks as MB on disk, biggest first, and skips what is not a row', () => {
    expect(parseFind('2048\t/var/log/a b.log\n6144000\t/tmp/big\nfind: x\n')).toEqual(['3000 MB /tmp/big', '1 MB /var/log/a b.log']);
    expect(parseFind('')).toEqual([]);
  });

  it('says when a find stopped at its own limit instead of reaching the end', () => {
    expect(cutLabel(20.0, 20)).toBe('interrompido em 20 s, resultado parcial');
    expect(cutLabel(19.2, 20)).toBe('interrompido em 20 s, resultado parcial');
    expect(cutLabel(3.46, 20)).toBe('completo em 3.5 s');
  });

  // /proc exists only on Linux, the system of the CI runner, where this test runs in the Vitest of the verificar job.
  // On other systems the same test proves there is no /proc to read, so it never shows as skipped.
  it('finds a file deleted while this process still holds it open (on Linux; elsewhere there is no /proc)', () => {
    if (process.platform !== 'linux') {
      expect(existsSync('/proc/self/fd')).toBe(false);
      expect(() => openDeleted(0)).toThrow();
      return;
    }
    const dir = mkdtempSync(join(tmpdir(), 'fo-disco-'));
    const path = join(dir, 'held.bin');
    // Random bytes, so a compressing file system cannot make the blocks smaller than the size.
    writeFileSync(path, randomBytes(1048576));
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

  // F5a (DECISOES § 154): the 2 s sampler of / prints a line only when it moved FINE_STEP_MB, and sums up the lowest point
  // and the steepest fall. The series is the 20 s one of run 41277648653 (WebKit 3 de 3, DECISOES § 141), every 2 s.
  it('prints a line only when / moved FINE_STEP_MB, and keeps the lowest point and the steepest fall', () => {
    const recorder = createRecorder(10_878);
    const series = [10_878, 10_800, 9_600, 8_187, 3_435, 3_500, 10_837];
    const lines = series.map((free, i) => recorder.push(1_000 * (i + 1), free));
    expect(lines.filter(Boolean)).toHaveLength(4);
    expect(lines[1]).toBeNull();
    expect(lines[2]).toContain('9600 MB livres (−1278 MB');
    expect(lines[6]).toContain('+7402 MB');
    expect(recorder.summary()).toEqual({ minMb: 3_435, minAt: 5_000, dropMb: 4_752, dropAt: 5_000 });
    expect(FINE_STEP_MB).toBe(256);
  });

  it('says nothing for a steady disk', () => {
    const recorder = createRecorder(5_000);
    for (let i = 0; i < 30; i += 1) expect(recorder.push(i, 5_000 - (i % 3))).toBeNull();
    expect(recorder.summary()).toMatchObject({ minMb: 4_998, dropMb: 1 });
  });
});
