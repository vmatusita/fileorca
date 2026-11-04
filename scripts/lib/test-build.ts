// The extra builds of the same code (F12, decision 2; DECISOES § 414): one helper for the two builds of gate:prontidao
// ("client", with only the test publisher id, and "all", with the ads on and the wall off) and for the test build
// ("teste": the test publisher id, fake ids in the 37 units of the ad map, the worst case, and the wall in "bloqueio"),
// which the Playwright specs of the ad map and of the wall read through scripts/serve-test-build.ts.
// Each build goes to .cache/builds/<name>/, never to dist/ (the site the other gates, the budgets and Lighthouse
// measure), and the bundle record that gate:licencas reads is put back as it was. The build is reused only when its key
// (the commit and the variables) is the same and the tree is clean; with a dirty tree it is built again, so a test never
// reads a build of another commit or of other files. A lock directory keeps two processes from building one at once.
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
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
const LOCK_STALE_MS = 15 * 60_000;

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

async function lock(path: string): Promise<() => void> {
  for (;;) {
    try {
      mkdirSync(path);
      return () => rmSync(path, { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (Date.now() - statSync(path).mtimeMs > LOCK_STALE_MS) rmSync(path, { recursive: true, force: true });
      else await sleep(500);
    }
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
