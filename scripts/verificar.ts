// pnpm verificar: every gate of the project, in order, with the time of each one (CLAUDE.md).
// Each step is also a package.json script, so a gate can run alone (see CLAUDE.md, F1a section).
// Stops at the first failure; nothing here is optional or skipped.
//
// The CI runs it in parts, one job each (ADR-003): `--sem-playwright` runs every gate except the Playwright suite;
// `--playwright=<project>` (with `--shard=i/n` when the project is split) builds and runs that part of the suite. Since the
// languages adjustment (DECISOES § 320) the gates are two parts: `--sem-playwright --sem-lighthouse` runs every gate but the
// Playwright suite and Lighthouse, and `--lighthouse` builds and runs Lighthouse alone.
// Together the parts are the same steps as the whole, and every part keeps the 900 s limit. Without arguments it
// runs everything, as on a laptop.
//
// F9 (DECISOES § 324 and § 329): the CI builds once. `--build` is the build alone (the build job, which uploads dist/), and
// `--dist-pronto` makes any part use the dist/ that is there: it does not delete it, skips the build and fails when
// dist/build.txt is not the `git rev-parse HEAD` of the checkout. `--leve` is the job of a draft PR: tipos, lint, the build
// and Vitest. `--partes` runs the parts of .github/workflows/ci.yml in sequence on this machine, the build once, each part
// with its own 900 s limit, and prints the total of each one and the sum.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { completeParts } from './lib/ci-parts.ts';
import { watchDisk } from './lib/disco.ts';

export interface Step {
  name: string;
  command: string;
}

const E2E = 'playwright (chromium e webkit, axe, anúncios, orçamentos)';
const LIGHTHOUSE = 'lighthouse ci';
const BUILD = 'build (astro build do zero)';

export const STEPS: Step[] = [
  { name: 'tipos (astro check)', command: 'pnpm run tipos' },
  { name: 'lint (eslint)', command: 'pnpm run lint' },
  { name: BUILD, command: 'pnpm run build' },
  { name: 'vitest', command: 'pnpm run test' },
  { name: 'cabeçalhos gerados', command: 'pnpm run gate:cabecalhos' },
  { name: 'worker sem código', command: 'pnpm run gate:worker' },
  { name: 'seo (hreflang, sitemaps, canonical, robots)', command: 'pnpm run gate:seo' },
  { name: 'links internos e páginas órfãs', command: 'pnpm run gate:links' },
  { name: 'conteúdo mínimo das ferramentas e do site', command: 'pnpm run gate:conteudo' },
  { name: 'prontidão para o AdSense (dois builds extras em .cache/)', command: 'pnpm run gate:prontidao' },
  { name: 'design (sprite, fontes, tema, movimento, setas)', command: 'pnpm run gate:design' },
  { name: 'licenças', command: 'pnpm run gate:licencas' },
  { name: 'conteúdo de dinheiro e saúde', command: 'pnpm run gate:dinheiro-saude' },
  { name: 'actionlint', command: 'pnpm run gate:actionlint' },
  { name: E2E, command: 'pnpm run e2e' },
  { name: LIGHTHOUSE, command: 'pnpm run lhci' },
  { name: 'lint:texto (LanguageTool)', command: 'pnpm run lint:texto' },
];

const PROJECTS = ['chromium', 'webkit'] as const;
const DIST_READY = '--dist-pronto';
const LIGHT = ['tipos (astro check)', 'lint (eslint)', BUILD, 'vitest'];

const step = (name: string): Step => STEPS.find((candidate) => candidate.name === name) as Step;

export interface Plan {
  label: string;
  steps: Step[];
  /** True with --dist-pronto: the part keeps dist/, skips the build and checks dist/build.txt first. */
  distReady: boolean;
}

/** The steps of a part with the dist/ built, before --dist-pronto takes the build out. */
function partOf(args: readonly string[]): { label: string; steps: Step[] } | null {
  if (args.length === 0) return { label: 'tudo', steps: STEPS };
  if (args.length === 1 && args[0] === '--sem-playwright') {
    return { label: 'sem o Playwright', steps: STEPS.filter((candidate) => candidate.name !== E2E) };
  }
  if (args.length === 2 && args.includes('--sem-playwright') && args.includes('--sem-lighthouse')) {
    return { label: 'sem o Playwright e sem o Lighthouse', steps: STEPS.filter((candidate) => candidate.name !== E2E && candidate.name !== LIGHTHOUSE) };
  }
  if (args.length === 1 && args[0] === '--lighthouse') return { label: 'Lighthouse', steps: [step(BUILD), step(LIGHTHOUSE)] };
  if (args.length === 1 && args[0] === '--leve') return { label: 'leve (tipos, lint, build e Vitest)', steps: LIGHT.map(step) };
  const project = /^--playwright=(.+)$/.exec(args[0] ?? '')?.[1];
  const shard = args.length === 2 ? /^--shard=(\d+)\/(\d+)$/.exec(args[1] ?? '') : null;
  if (!project || !(PROJECTS as readonly string[]).includes(project) || args.length > 2 || (args.length === 2 && !shard)) return null;
  const [index, total] = shard ? [Number(shard[1]), Number(shard[2])] : [1, 1];
  if (index < 1 || index > total) throw new Error(`--shard=${index}/${total} fora do intervalo`);
  const part = total > 1 ? `, parte ${index} de ${total}` : '';
  return {
    label: `Playwright no ${project}${part}`,
    steps: [step(BUILD), { name: `playwright (${project}${part}, axe, anúncios, orçamentos)`, command: `pnpm run e2e --project=${project}${total > 1 ? ` --shard=${index}/${total}` : ''}` }],
  };
}

/** The steps a part runs, read from the command line. Throws on anything it does not know. */
export function plan(args: readonly string[]): Plan {
  const usage = `uso: pnpm verificar [--sem-playwright [--sem-lighthouse] | --lighthouse | --playwright=chromium|webkit [--shard=i/n] | --leve] [--dist-pronto] | --build | --partes (recebido: ${args.join(' ')})`;
  if (args.length === 1 && args[0] === '--build') return { label: 'build', steps: [step(BUILD)], distReady: false };
  const distReady = args.includes(DIST_READY);
  const rest = args.filter((arg) => arg !== DIST_READY);
  if (rest.length < args.length - 1) throw new Error(usage);
  const part = partOf(rest);
  if (!part) throw new Error(usage);
  if (!distReady) return { ...part, distReady };
  return { label: `${part.label}, com o dist/ pronto`, steps: part.steps.filter((candidate) => candidate.name !== BUILD), distReady };
}

/** Why the dist/ that is there cannot stand for this checkout, or null when it can (F9; DECISOES § 324). */
export function distProblem(buildTxt: string | null, head: string): string | null {
  if (buildTxt === null) return '--dist-pronto: não há dist/build.txt; rode o build antes (pnpm verificar --build).';
  const built = buildTxt.trim();
  if (built !== head.trim()) return `--dist-pronto: o dist/build.txt é ${built || '(vazio)'}, mas o HEAD é ${head.trim()}; o dist/ é de outro commit.`;
  return null;
}

function run(command: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** --partes: each part of ci.yml as its own pnpm verificar, the build first, stopping at the first that fails. */
async function parts(): Promise<number> {
  const list = completeParts(readFileSync('.github/workflows/ci.yml', 'utf8'));
  const started = Date.now();
  const timings: { label: string; ms: number; ok: boolean }[] = [];
  for (const part of list) {
    const label = `${part.job}: pnpm verificar ${part.args.join(' ')}`;
    console.log(`\n▶▶ parte ${timings.length + 1} de ${list.length}: ${label}`);
    const begin = Date.now();
    const code = await run(`node scripts/verificar.ts ${part.args.join(' ')}`);
    timings.push({ label, ms: Date.now() - begin, ok: code === 0 });
    if (code !== 0) break;
  }
  console.log(`\nResumo das partes do CI (pnpm verificar --partes, ${list.length} partes lidas de .github/workflows/ci.yml)`);
  for (const timing of timings) console.log(`  ${timing.ok ? 'ok   ' : 'FALHA'} ${seconds(timing.ms).padStart(8)}  ${timing.label}`);
  console.log(`  soma ${seconds(timings.reduce((sum, timing) => sum + timing.ms, 0))} (parede ${seconds(Date.now() - started)}; cada parte com o limite de 900 s)`);
  return timings.length === list.length && timings.every((timing) => timing.ok) ? 0 : 1;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--partes') process.exit(await parts());
  const { label, steps, distReady } = plan(args);
  const started = Date.now();
  const timings: { name: string; ms: number; ok: boolean }[] = [];
  if (distReady) {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const problem = distProblem(existsSync('dist/build.txt') ? readFileSync('dist/build.txt', 'utf8') : null, head);
    if (problem) {
      console.error(problem);
      process.exit(1);
    }
    console.log(`dist/ pronto do commit ${head.slice(0, 7)}: o build não roda de novo.`);
  } else {
    rmSync('dist', { recursive: true, force: true });
  }
  const stopWatchingDisk = watchDisk();
  for (const step of steps) {
    console.log(`\n▶ ${step.name}\n  $ ${step.command}`);
    const begin = Date.now();
    const code = await run(step.command);
    timings.push({ name: step.name, ms: Date.now() - begin, ok: code === 0 });
    if (code !== 0) break;
  }
  stopWatchingDisk();
  const total = Date.now() - started;
  console.log(`\nResumo do pnpm verificar (${label})`);
  for (const timing of timings) console.log(`  ${timing.ok ? 'ok   ' : 'FALHA'} ${seconds(timing.ms).padStart(8)}  ${timing.name}`);
  const failed = timings.some((timing) => !timing.ok) || timings.length < steps.length;
  console.log(`  total ${seconds(total)} (limite 900 s)`);
  if (total > 900_000) {
    console.log('  FALHA: o verificar passou de 15 minutos.');
    process.exit(1);
  }
  process.exit(failed ? 1 : 0);
}
