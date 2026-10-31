// Disk diagnostics for pnpm verificar on the Linux CI runner: the free space of /, /tmp and /dev/shm every 20 s
// while the steps run, and at the end the biggest folders and files the run left. A WebKit part of the F2 CI
// stopped with "ENOSPC: no space left on device" while the runner itself warned of nothing, so the log has to
// say which file system filled up and with what. It only reads; on other systems it does nothing.
//
// When / loses more than DROP_MB (the WebKit 2 de 3 of run 41250641460 went from 10.9 GB to 609 MB free, and du
// and find saw nothing; DECISOES § 108), it looks deeper while the processes are still alive: the files deleted
// but still open (from /proc), the big files written on / since the start, the system folders the du skips and
// the biggest processes. The same look runs again at the end if / has not come back.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';

const ON = process.platform === 'linux' && Boolean(process.env['CI']);

/** A fall of / this big since the start, or since the last deep look, triggers the next deep look. */
export const DROP_MB = 2048;

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
  return list.find((mount) => mount.target === '/')?.freeMb ?? null;
}

/** True when / has DROP_MB less free space than at the baseline (the start, or the last deep look). */
export function shouldLook(freeMb: number | null, baselineMb: number | null): boolean {
  return freeMb !== null && baselineMb !== null && freeMb < baselineMb - DROP_MB;
}

export interface OpenDeleted {
  pid: number;
  command: string;
  path: string;
  /** `dev:ino` of the file, so the same file open in several places counts once. */
  key: string;
  bytes: number;
}

/** Files deleted but still held open: df counts them, du and find do not. Only this user's processes are readable. */
function openDeleted(): OpenDeleted[] {
  const found: OpenDeleted[] = [];
  for (const pid of readdirSync('/proc').filter((name) => /^\d+$/.test(name))) {
    let fds: string[];
    try {
      fds = readdirSync(`/proc/${pid}/fd`);
    } catch {
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
        if (!stat.isFile()) continue;
        found.push({ pid: Number(pid), command, path, key: `${stat.dev}:${stat.ino}`, bytes: stat.size });
      } catch {
        // The descriptor closed while it was read.
      }
    }
  }
  return found;
}

/** The biggest deleted-but-open files with the processes that hold them. memfd and /dev/shm live in memory, not on /. */
export function summarizeOpenDeleted(files: readonly OpenDeleted[], top = 10): string[] {
  const unique = new Map<string, { path: string; bytes: number; holders: Set<string> }>();
  for (const file of files) {
    if (file.path.startsWith('/memfd:') || file.path.startsWith('/dev/shm/')) continue;
    const entry = unique.get(file.key) ?? { path: file.path, bytes: file.bytes, holders: new Set<string>() };
    entry.holders.add(`${file.command} ${file.pid}`);
    unique.set(file.key, entry);
  }
  const sorted = [...unique.values()].sort((a, b) => b.bytes - a.bytes);
  const total = sorted.reduce((sum, entry) => sum + entry.bytes, 0);
  const mb = (bytes: number) => Math.round(bytes / 1048576);
  return [
    `${mb(total)} MB em ${sorted.length} arquivo(s)`,
    ...sorted.slice(0, top).map((entry) => `${mb(entry.bytes)} MB ${entry.path}, aberto por ${[...entry.holders].join(', ')}`),
  ];
}

/** Everything that can say where the space of / went, while the run is still going or right after it. */
function deepLook(reason: string, startedAt: number): void {
  // A diagnostic never fails the run it watches.
  try {
    look(reason, startedAt);
  } catch (error) {
    console.log(`[disco] a busca funda falhou: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function look(reason: string, startedAt: number): void {
  const began = Date.now();
  console.log(`[disco] busca funda: ${reason}`);
  console.log('[disco] arquivos apagados e ainda abertos (MB):');
  for (const line of summarizeOpenDeleted(openDeleted())) console.log(`  ${line}`);
  const minutes = Math.ceil((Date.now() - startedAt) / 60_000) + 1;
  console.log(`[disco] arquivos acima de 20 MB gravados no / nos últimos ${minutes} min (MB):`);
  const written = sh(`find / -xdev -type f -mmin -${minutes} -size +20M -printf '%s\\t%p\\n' 2>/dev/null | sort -rn | head -15`, 90_000)
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/^(\d+)\t/, (_, bytes: string) => `${Math.round(Number(bytes) / 1048576)} `));
  console.log(written.length > 0 ? written.join('\n') : '(nenhum)');
  console.log('[disco] pastas do sistema (MB):');
  console.log(sh('du -xsm /var/log /var/tmp /var/crash /var/cache /var/lib/systemd/coredump 2>/dev/null'));
  console.log(`[disco] core_pattern: ${sh('cat /proc/sys/kernel/core_pattern').trim() || '?'}`);
  console.log(sh('ls -la /var/crash /var/lib/systemd/coredump 2>/dev/null | head -20'));
  console.log('[disco] maiores processos (RSS em KB):');
  console.log(sh('ps -eo pid,ppid,rss,etimes,comm --sort=-rss 2>/dev/null | head -12'));
  console.log(`[disco] busca funda em ${((Date.now() - began) / 1000).toFixed(1)} s`);
}

/** Starts the sampler; the function it returns stops it and prints where the space went. */
export function watchDisk(): () => void {
  if (!ON) return () => {};
  const startedAt = Date.now();
  const start = mounts();
  console.log(`[disco] início: ${describeMounts(start)}`);
  let baseline = rootFree(start);
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
    if (shouldLook(free, baseline)) {
      baseline = free;
      deepLook(`o / caiu para ${free} MB livres`, startedAt);
    }
  }, 20_000);
  timer.unref();
  return () => {
    clearInterval(timer);
    const end = mounts();
    console.log(`[disco] fim: ${describeMounts(end)}`);
    console.log('[disco] maiores pastas (MB):');
    console.log(sh('du -xm --max-depth=2 . /tmp /dev/shm "$HOME" 2>/dev/null | sort -rn | head -20'));
    console.log('[disco] arquivos acima de 200 MB:');
    console.log(sh('find / -xdev -type f -size +200M 2>/dev/null | head -20') || '(nenhum)');
    const startFree = rootFree(start);
    const endFree = rootFree(end);
    if (shouldLook(endFree, startFree) && startFree !== null && endFree !== null) {
      deepLook(`o / terminou com ${startFree - endFree} MB a menos que no início`, startedAt);
    }
  };
}
