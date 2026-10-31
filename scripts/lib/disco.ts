// Disk diagnostics for pnpm verificar on the Linux CI runner: the free space of /, /tmp and /dev/shm every 20 s
// while the steps run, and at the end the biggest folders and files the run left. A WebKit part of the F2 CI
// stopped with "ENOSPC: no space left on device" while the runner itself warned of nothing, so the log has to
// say which file system filled up and with what. It only reads; on other systems it does nothing.
import { execSync } from 'node:child_process';

const ON = process.platform === 'linux' && Boolean(process.env['CI']);

function sh(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20_000 });
  } catch (error) {
    return (error as { stdout?: string }).stdout ?? '';
  }
}

function free(): string {
  return sh('df -k --output=target,used,avail / /tmp /dev/shm 2>/dev/null')
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [target, used, avail] = line.trim().split(/\s+/);
      return `${target} usado ${Math.round(Number(used) / 1024)} MB, livre ${Math.round(Number(avail) / 1024)} MB`;
    })
    .join(' | ');
}

/** Starts the sampler; the function it returns stops it and prints where the space went. */
export function watchDisk(): () => void {
  if (!ON) return () => {};
  console.log(`[disco] início: ${free()}`);
  let last = '';
  const timer = setInterval(() => {
    const now = free();
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
  }, 20_000);
  timer.unref();
  return () => {
    clearInterval(timer);
    console.log(`[disco] fim: ${free()}`);
    console.log('[disco] maiores pastas (MB):');
    console.log(sh('du -xm --max-depth=2 . /tmp /dev/shm "$HOME" 2>/dev/null | sort -rn | head -20'));
    console.log('[disco] arquivos acima de 200 MB:');
    console.log(sh('find / -xdev -type f -size +200M 2>/dev/null | head -20') || '(nenhum)');
  };
}
