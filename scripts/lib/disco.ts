// Disk diagnostics for pnpm verificar on the Linux CI runner: the free space of /, /tmp and /dev/shm every 20 s
// while the steps run, and at the end the biggest folders and files the run left. A WebKit part of the F2 CI
// stopped with "ENOSPC: no space left on device" while the runner itself warned of nothing, so the log has to
// say which file system filled up and with what. It only reads; on other systems it does nothing.
//
// When / loses more than DROP_MB (the WebKit 2 de 3 of run 41250641460 went from 10.9 GB to 609 MB free; DECISOES
// § 108 and § 109), it looks deeper while the processes are still alive: the files deleted but still open (from
// /proc), the big files written on / since the start, the system folders the du skips and the biggest processes.
// The same look runs again at the end if / has not come back. Every find runs under its own time limit, at the
// lowest priority, and says when it stopped before the end: a cut find is not "nothing found".
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';

const ON = process.platform === 'linux' && Boolean(process.env['CI']);

/** A fall of / this big since the baseline triggers a deep look. */
export const DROP_MB = 2048;
/** Deep looks while the steps run; the one at the end is apart. Each one can hold the parent for about a minute. */
export const MAX_LOOKS = 2;

function sh(command: string, timeout = 20_000): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout });
  } catch (error) {
    return (error as { stdout?: string }).stdout ?? '';
  }
}

export interface Mount {
  target: string;
  usedMb: number;
  freeMb: number;
}

/** Reads the output of `df -k --output=target,used,avail`. */
export function parseDf(text: string): Mount[] {
  return text
    .trim()
    .split('\n')
    .slice(1)
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const [target = '?', used, avail] = line.trim().split(/\s+/);
      return { target, usedMb: Math.round(Number(used) / 1024), freeMb: Math.round(Number(avail) / 1024) };
    });
}

function mounts(): Mount[] {
  return parseDf(sh('df -k --output=target,used,avail / /tmp /dev/shm 2>/dev/null'));
}

function describeMounts(list: readonly Mount[]): string {
  return list.map((mount) => `${mount.target} usado ${mount.usedMb} MB, livre ${mount.freeMb} MB`).join(' | ');
}

function rootFree(list: readonly Mount[]): number | null {
  const free = list.find((mount) => mount.target === '/')?.freeMb;
  return free !== undefined && Number.isFinite(free) ? free : null;
}

/** True when / has DROP_MB less free space than the baseline. */
export function shouldLook(freeMb: number | null, baselineMb: number | null): boolean {
  return freeMb !== null && baselineMb !== null && freeMb < baselineMb - DROP_MB;
}

/**
 * The trigger of the deep looks while the steps run: at most MAX_LOOKS, each one DROP_MB below the last. The
 * baseline goes back up when the space comes back, so a second fall to the same floor is seen too.
 */
export function createTrigger(startMb: number | null): (freeMb: number | null) => boolean {
  let baseline = startMb;
  let looks = 0;
  return (freeMb) => {
    if (freeMb === null) return false;
    if (baseline === null || freeMb > baseline) {
      baseline = freeMb;
      return false;
    }
    if (looks >= MAX_LOOKS || !shouldLook(freeMb, baseline)) return false;
    baseline = freeMb;
    looks += 1;
    return true;
  };
}

export interface OpenDeleted {
  pid: number;
  command: string;
  path: string;
  /** `dev:ino` of the file, so the same file open in several places counts once. */
  key: string;
  /** Blocks on disk, which df counts (a sparse file has a big size and few blocks). */
  bytes: number;
}

/** Processes whose descriptors could not be read: the ones of this user (a sandbox) are the blind spot that matters. */
export interface Unreadable {
  mine: number;
  others: number;
}

/**
 * Files deleted but still held open on the file system `dev` (the one of / by default): df counts them, du and find
 * do not. Only this user's dumpable processes can be read; the others are counted, so an empty list proves nothing.
 */
export function openDeleted(dev = statSync('/').dev): { files: OpenDeleted[]; unreadable: Unreadable } {
  const files: OpenDeleted[] = [];
  const unreadable: Unreadable = { mine: 0, others: 0 };
  const uid = process.getuid?.();
  for (const pid of readdirSync('/proc').filter((name) => /^\d+$/.test(name))) {
    let fds: string[];
    try {
      fds = readdirSync(`/proc/${pid}/fd`);
    } catch (error) {
      if ((error as { code?: string }).code === 'ENOENT') continue;
      let owner: number | null = null;
      try {
        owner = Number(/^Uid:\s+(\d+)/m.exec(readFileSync(`/proc/${pid}/status`, 'utf8'))?.[1]);
      } catch {
        // The process ended while it was read.
      }
      if (owner === uid) unreadable.mine += 1;
      else unreadable.others += 1;
      continue;
    }
    let command = '?';
    try {
      command = readFileSync(`/proc/${pid}/comm`, 'utf8').trim();
    } catch {
      // The process ended while it was read.
    }
    for (const fd of fds) {
      try {
        const path = readlinkSync(`/proc/${pid}/fd/${fd}`);
        if (!path.endsWith(' (deleted)')) continue;
        const stat = statSync(`/proc/${pid}/fd/${fd}`);
        if (!stat.isFile() || stat.dev !== dev) continue;
        files.push({ pid: Number(pid), command, path, key: `${stat.dev}:${stat.ino}`, bytes: stat.blocks * 512 });
      } catch {
        // The descriptor closed while it was read.
      }
    }
  }
  return { files, unreadable };
}

/** The biggest deleted-but-open files with the processes that hold them, each file once. */
export function summarizeOpenDeleted(files: readonly OpenDeleted[], unreadable: Unreadable, top = 10): string[] {
  const unique = new Map<string, { path: string; bytes: number; holders: Set<string> }>();
  for (const file of files) {
    const entry = unique.get(file.key) ?? { path: file.path, bytes: file.bytes, holders: new Set<string>() };
    entry.holders.add(`${file.command} ${file.pid}`);
    unique.set(file.key, entry);
  }
  const sorted = [...unique.values()].sort((a, b) => b.bytes - a.bytes);
  const total = sorted.reduce((sum, entry) => sum + entry.bytes, 0);
  return [
    `${toMb(total)} MB em ${sorted.length} arquivo(s); sem leitura: ${unreadable.mine} processo(s) deste usuário e ${unreadable.others} de outros`,
    ...sorted.slice(0, top).map((entry) => `${toMb(entry.bytes)} MB ${entry.path}, aberto por ${[...entry.holders].join(', ')}`),
  ];
}

function toMb(bytes: number): number {
  return Math.round(bytes / 1048576);
}

/** Turns `find -printf '%b\t%p\n'` lines (512-byte blocks, then the path) into "MB path", biggest first. */
export function parseFind(text: string): string[] {
  return text
    .trim()
    .split('\n')
    .map((line) => /^(\d+)\t(.+)$/.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({ bytes: Number(match[1]) * 512, path: match[2] ?? '' }))
    .sort((a, b) => b.bytes - a.bytes)
    .map((file) => `${toMb(file.bytes)} MB ${file.path}`);
}

/** Says whether a find stopped at its own limit, so a cut find is never read as "nothing found". */
export function cutLabel(elapsedSeconds: number, limitSeconds: number): string {
  return elapsedSeconds >= limitSeconds - 1 ? `interrompido em ${limitSeconds} s, resultado parcial` : `completo em ${elapsedSeconds.toFixed(1)} s`;
}

/**
 * A find under its own time limit (timeout ends the find itself, so sort prints what it saw and nothing is left
 * running), at the lowest CPU priority; it prints the files and whether it reached the end.
 */
function findFiles(args: string, seconds: number): string {
  const began = Date.now();
  const text = sh(`timeout -k 5 ${seconds} nice -n 19 find ${args} -printf '%b\\t%p\\n' 2>/dev/null | sort -rn | head -15`, (seconds + 15) * 1000);
  const lines = parseFind(text);
  return [...(lines.length > 0 ? lines : ['(nenhum)']), `(${cutLabel((Date.now() - began) / 1000, seconds)})`].join('\n');
}

/** One part of the deep look; a failure in it does not stop the others, and none fails the run. */
function section(title: string, body: () => string): void {
  console.log(`[disco] ${title}:`);
  try {
    console.log(body());
  } catch (error) {
    console.log(`(falhou: ${error instanceof Error ? error.message : String(error)})`);
  }
}

/** Everything that can say where the space of / went, while the run is still going or right after it. */
function deepLook(reason: string, startedAt: number): void {
  const began = Date.now();
  console.log(`[disco] busca funda: ${reason}`);
  section('arquivos apagados e ainda abertos no /', () => {
    const { files, unreadable } = openDeleted();
    return summarizeOpenDeleted(files, unreadable).join('\n');
  });
  const minutes = Math.ceil((Date.now() - startedAt) / 60_000) + 1;
  // Where a run writes first, so a cut find has already seen those; then the rest of /, minus what never changes.
  section(`arquivos acima de 20 MB gravados no / nos últimos ${minutes} min`, () =>
    findFiles(`/tmp /home /var /root /srv /opt /usr /etc -xdev -type f -mmin -${minutes} -size +20M`, 60),
  );
  section('pastas do sistema (MB)', () => sh('du -xsm /var/log /var/tmp /var/crash /var/cache /var/lib/systemd/coredump 2>/dev/null'));
  section('core dumps', () => `core_pattern: ${sh('cat /proc/sys/kernel/core_pattern').trim() || '?'}\n${sh('ls -la /var/crash /var/lib/systemd/coredump 2>/dev/null | head -20')}`);
  section('maiores processos (RSS em KB)', () => sh('ps -eo pid,ppid,rss,etimes,comm --sort=-rss 2>/dev/null | head -12'));
  console.log(`[disco] busca funda em ${((Date.now() - began) / 1000).toFixed(1)} s`);
}

/** Starts the sampler; the function it returns stops it and prints where the space went. */
export function watchDisk(): () => void {
  if (!ON) return () => {};
  const startedAt = Date.now();
  const start = mounts();
  console.log(`[disco] início: ${describeMounts(start)}`);
  const trigger = createTrigger(rootFree(start));
  let last = '';
  const timer = setInterval(() => {
    const list = mounts();
    const now = describeMounts(list);
    if (now !== last) {
      // The Playwright artifacts (traces) of each worker and the browsers' own temporary folders, the biggest first.
      const where = sh('du -sm test-results/.playwright-artifacts-* /tmp/playwright* /tmp/* 2>/dev/null | sort -rn | head -4')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => line.replace(/\s+/, ' MB '))
        .join(', ');
      console.log(`[disco] ${new Date().toISOString().slice(11, 19)} ${now}${where ? ` | maiores: ${where}` : ''}`);
    }
    last = now;
    const free = rootFree(list);
    if (trigger(free)) deepLook(`o / caiu para ${free} MB livres`, startedAt);
  }, 20_000);
  timer.unref();
  return () => {
    clearInterval(timer);
    const end = mounts();
    console.log(`[disco] fim: ${describeMounts(end)}`);
    console.log('[disco] maiores pastas (MB):');
    console.log(sh('du -xm --max-depth=2 . /tmp /dev/shm "$HOME" 2>/dev/null | sort -rn | head -20'));
    // The whole / does not fit in 20 s on the runner (in run 41250641460 that find stopped at its 20 s limit in every
    // part, DECISOES § 109): only where a run writes.
    section('arquivos acima de 200 MB em /tmp, /var e /home', () => findFiles('/tmp /var /home -xdev -type f -size +200M', 20));
    const startFree = rootFree(start);
    const endFree = rootFree(end);
    if (startFree !== null && endFree !== null && shouldLook(endFree, startFree)) {
      deepLook(`o / terminou com ${startFree - endFree} MB a menos que no início`, startedAt);
    }
  };
}
