// The extra builds of the same code (F12, decision 2; DECISOES § 414): one helper for the two builds of gate:prontidao
// ("client", with only the test publisher id, and "all", with the ads on and the wall off) and for the test build
// ("teste": the test publisher id, fake ids in the 37 units of the ad map, the worst case, and the wall in "bloqueio"),
// which the Playwright specs of the ad map and of the wall read through scripts/serve-test-build.ts.
// Each build goes to .cache/builds/<name>/, never to dist/ (the site the other gates, the budgets and Lighthouse
// measure), and the bundle record that gate:licencas reads is put back as it was. The build is reused only when its key
// (the commit and the variables) is the same and the tree is clean; with a dirty tree it is built again, so a test never
// reads a build of another commit or of other files. A lock directory keeps two processes from building one at once.
import { execFileSync, spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUNDLE_RECORD } from '../../src/platform/bundle-record.ts';
import { AD_AREAS, type AdUnit } from '../../src/ads/config.ts';
import { TEST_CLIENT } from './prontidao.ts';

export const BUILDS = join('.cache', 'builds');
export { TEST_CLIENT };

/** The 37 units of the map (ad-map.html, "As unidades e o PUBLIC_ADSENSE_SLOTS"): 8 per area, 5 in "utilidades". */
const UNITS_OF: Record<(typeof AD_AREAS)[number], readonly AdUnit[]> = {
  geral: ['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'conteudo-5', 'lateral', 'lateral-2', 'multiplex'],
  arquivos: ['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'conteudo-5', 'lateral', 'lateral-2', 'multiplex'],
  dinheiro: ['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'conteudo-5', 'lateral', 'lateral-2', 'multiplex'],
  'casa-saude': ['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'conteudo-5', 'lateral', 'lateral-2', 'multiplex'],
  utilidades: ['conteudo', 'conteudo-2', 'lateral', 'lateral-2', 'multiplex'],
};

/** Fake unit ids, one per position: 9 + area (1 to 5) + unit (01 to 12) + 000000, ten digits each (^\d{6,}$). */
export const TEST_SLOTS: Record<string, Record<string, string>> = Object.fromEntries(
  AD_AREAS.map((area, a) => [area, Object.fromEntries(UNITS_OF[area].map((unit, u) => [unit, `9${a + 1}${String(u + 1).padStart(2, '0')}000000`]))]),
);
export const TEST_UNIT_COUNT = Object.values(TEST_SLOTS).reduce((sum, units) => sum + Object.keys(units).length, 0);

/** The variables of each extra build. Every build starts from the four empty, so the shell never leaks a real value in. */
export const VARIANTS = {
  client: { PUBLIC_ADSENSE_CLIENT: TEST_CLIENT },
  all: { PUBLIC_ADSENSE_CLIENT: TEST_CLIENT, PUBLIC_ADSENSE_SLOTS: JSON.stringify(TEST_SLOTS), PUBLIC_ADS_ENABLED: 'true' },
  teste: {
    PUBLIC_ADSENSE_CLIENT: TEST_CLIENT,
    PUBLIC_ADSENSE_SLOTS: JSON.stringify(TEST_SLOTS),
    PUBLIC_ADS_ENABLED: 'true',
    PUBLIC_ADBLOCK_WALL: 'bloqueio',
  },
} as const satisfies Record<string, Record<string, string>>;
export type Variant = keyof typeof VARIANTS;

const EMPTY = { PUBLIC_ADSENSE_CLIENT: '', PUBLIC_ADSENSE_SLOTS: '', PUBLIC_ADS_ENABLED: 'false', PUBLIC_ADBLOCK_WALL: '' };
/** Where a new, untracked file can change the build (a changed tracked file anywhere makes the tree dirty). */
const BUILD_INPUTS = ['src/', 'public/', 'docs/design/', 'scripts/', 'astro.config.', 'package.json', 'pnpm-lock.yaml', 'tsconfig.'];
/*
 * The lock (review E-3; DECISOES § 453). The holder writes its PID in the lock and renews it every LOCK_BEAT_MS while it
 * builds (the build is a child process, so the event loop is free). A lock is left over when its process is gone (a
 * Ctrl-C, a killed webServer) or when it was not renewed for LOCK_STALE_MS (a frozen holder, a PID used again, or a lock
 * of before § 453, with no PID): far below the 600 s the specs wait for the build (tests/e2e/lib/test-build.ts), and
 * never while a live holder builds, however long the build takes.
 */
export const LOCK_STALE_MS = 60_000;
const LOCK_BEAT_MS = 10_000;
/** The file of the lock with the PID of the holder; its time is the last renewal. */
const LOCK_OWNER = 'pid';
/** A takeover directory older than this was left by a process that died inside it (it lives for a few milliseconds). */
const TAKEOVER_STALE_MS = 10_000;

export interface BuildResult {
  name: Variant;
  dir: string;
  /** False when the cached build of the same key was reused. */
  built: boolean;
  seconds: number;
}

interface Key {
  commit: string;
  env: string;
}

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

/** True when a tracked file changed, or a new file exists where the build reads (or git is missing). */
export function treeIsDirty(): boolean {
  const status = git(['status', '--porcelain', '--untracked-files=all']);
  if (status === null) return true;
  return status
    .split('\n')
    .filter(Boolean)
    .some((line) => !line.startsWith('??') || BUILD_INPUTS.some((prefix) => line.slice(3).replace(/^"/, '').startsWith(prefix)));
}

function keyOf(name: Variant): Key {
  const env = createHash('sha256').update(JSON.stringify(VARIANTS[name])).digest('hex').slice(0, 16);
  return { commit: git(['rev-parse', 'HEAD'])?.trim() ?? 'unknown', env };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Whether a process is running (EPERM: it runs, as another user). */
function running(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

/** The time of a file in ms, or null when it is not there. */
function mtimeOf(path: string): number | null {
  try {
    return statSync(path).mtimeMs;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

/** The owner written in a lock (the PID, a colon and a token of that holder), or null when there is none. */
function ownerOf(path: string): string | null {
  try {
    return readFileSync(join(path, LOCK_OWNER), 'utf8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') return null;
    throw error;
  }
}

/** Removes a directory; false when Windows holds it for a moment (EPERM, EBUSY, ENOTEMPTY), to try again later. */
function removed(path: string): boolean {
  try {
    rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
    return true;
  } catch (error) {
    if (['EPERM', 'EBUSY', 'ENOTEMPTY'].includes((error as NodeJS.ErrnoException).code ?? '')) return false;
    throw error;
  }
}

/**
 * The state of a lock another process made: "free" when it is gone (released between our mkdir and this look), "stale"
 * when its process is gone or it was not renewed for staleMs, "held" otherwise.
 */
export function lockState(path: string, staleMs = LOCK_STALE_MS, now = Date.now()): 'free' | 'stale' | 'held' {
  const owner = join(path, LOCK_OWNER);
  const pid = Number.parseInt(ownerOf(path) ?? '', 10);
  if (Number.isInteger(pid) && pid > 0 && !running(pid)) return 'stale';
  // The time of the last renewal; with no PID yet (the holder is between its mkdir and its write), that of the lock.
  const renewed = mtimeOf(owner) ?? mtimeOf(path);
  if (renewed === null) return 'free';
  return now - renewed > staleMs ? 'stale' : 'held';
}

export interface LockOptions {
  staleMs?: number;
  beatMs?: number;
  pollMs?: number;
  /** Where the line about the wait goes (once per wait). */
  log?: (line: string) => void;
}

/**
 * Takes the stale lock at path away, one waiter at a time (second pass of the review; § 455): the waiter that makes the
 * takeover directory reads the state again inside it and removes the lock only if it is still stale, so a lock another
 * waiter has just taken is never removed. A takeover directory left by a process that died inside it goes after a while.
 */
async function takeOver(path: string, staleMs: number, pollMs: number): Promise<void> {
  const takeover = `${path}.takeover`;
  try {
    mkdirSync(takeover);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const since = mtimeOf(takeover);
    if (since !== null && Date.now() - since > TAKEOVER_STALE_MS) removed(takeover);
    else await sleep(pollMs);
    return;
  }
  try {
    if (lockState(path, staleMs) === 'stale' && !removed(path)) await sleep(pollMs);
  } finally {
    removed(takeover);
  }
}

/** Takes the lock directory at path, waiting for a live holder and taking over a stale one; returns its release. */
export async function lock(path: string, options: LockOptions = {}): Promise<() => void> {
  const { staleMs = LOCK_STALE_MS, beatMs = LOCK_BEAT_MS, pollMs = 500, log = (line: string) => console.warn(line) } = options;
  let told = false;
  for (;;) {
    try {
      mkdirSync(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const state = lockState(path, staleMs);
      if (state === 'stale') await takeOver(path, staleMs, pollMs);
      else if (state === 'held') {
        if (!told) {
          log(`[test-build] esperando a trava ${path}, de outro processo (fica velha se o processo some ou passa ${staleMs / 1000} s sem renová-la)`);
          told = true;
        }
        await sleep(pollMs);
      }
      continue;
    }
    // The owner is this process and this call: two holders of one process (the tests) are told apart by the token.
    const me = `${process.pid}:${randomUUID()}`;
    const owner = join(path, LOCK_OWNER);
    const mine = () => ownerOf(path) === me;
    writeFileSync(owner, me);
    // A holder that froze past staleMs and lost the lock to another one stops renewing it, and never removes it.
    const beat = setInterval(() => {
      try {
        if (mine()) writeFileSync(owner, me);
        else clearInterval(beat);
      } catch {
        clearInterval(beat);
      }
    }, beatMs);
    beat.unref();
    return () => {
      clearInterval(beat);
      if (mine()) removed(path);
    };
  }
}

function run(command: string, env: NodeJS.ProcessEnv): Promise<{ status: number | null; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.on('close', (status) => resolve({ status, output }));
  });
}

/**
 * astro build of the same code into .cache/builds/<name>/, with the variables of the variant. The build of the same key
 * on a clean tree is reused (unless fresh is set); a failed build throws with the end of its output.
 */
export async function buildVariant(name: Variant, options: { fresh?: boolean } = {}): Promise<BuildResult> {
  const dir = join(BUILDS, name);
  const keyFile = join(BUILDS, `${name}.key.json`);
  mkdirSync(BUILDS, { recursive: true });
  const release = await lock(join(BUILDS, `${name}.lock`));
  try {
    const key = keyOf(name);
    const clean = !treeIsDirty();
    const cached = existsSync(keyFile) ? (JSON.parse(readFileSync(keyFile, 'utf8')) as Partial<Key> & { clean?: boolean }) : null;
    if (!options.fresh && clean && cached?.clean && cached.commit === key.commit && cached.env === key.env && existsSync(join(dir, 'index.html'))) {
      return { name, dir, built: false, seconds: 0 };
    }
    rmSync(keyFile, { force: true });
    rmSync(dir, { recursive: true, force: true });
    const record = existsSync(BUNDLE_RECORD) ? readFileSync(BUNDLE_RECORD) : null;
    const begin = Date.now();
    const result = await run(`pnpm exec astro build --outDir ${dir.split('\\').join('/')}`, {
      ...process.env,
      ...EMPTY,
      ...VARIANTS[name],
      ASTRO_TELEMETRY_DISABLED: '1',
    });
    if (record) writeFileSync(BUNDLE_RECORD, record);
    if (result.status !== 0) throw new Error(`o build ${name} falhou:\n${result.output.slice(-4000)}`);
    writeFileSync(keyFile, `${JSON.stringify({ ...key, clean })}\n`);
    return { name, dir, built: true, seconds: (Date.now() - begin) / 1000 };
  } finally {
    release();
  }
}
