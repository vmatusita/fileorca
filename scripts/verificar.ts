// pnpm verificar: every gate of the project, in order, with the time of each one (CLAUDE.md).
// Each step is also a package.json script, so a gate can run alone (see CLAUDE.md, F1a section).
// Stops at the first failure; nothing here is optional or skipped.
//
// The CI runs it in parts, one job each (ADR-003): `--sem-playwright` runs every gate except the Playwright suite;
// `--playwright=<project>` (with `--shard=i/n` when the project is split) builds and runs that part of the suite.
// Together the parts are the same steps as the whole, and every part keeps the 900 s limit. Without arguments it
// runs everything, as on a laptop.
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';

export interface Step {
  name: string;
  command: string;
}

const E2E = 'playwright (chromium e webkit, axe, anúncios, orçamentos)';

export const STEPS: Step[] = [
  { name: 'tipos (astro check)', command: 'pnpm run tipos' },
  { name: 'lint (eslint)', command: 'pnpm run lint' },
  { name: 'build (astro build do zero)', command: 'pnpm run build' },
  { name: 'vitest', command: 'pnpm run test' },
  { name: 'cabeçalhos gerados', command: 'pnpm run gate:cabecalhos' },
  { name: 'worker sem código', command: 'pnpm run gate:worker' },
  { name: 'seo (hreflang, sitemaps, canonical, robots)', command: 'pnpm run gate:seo' },
  { name: 'links internos e páginas órfãs', command: 'pnpm run gate:links' },
  { name: 'design (sprite, fontes, tema, movimento, setas)', command: 'pnpm run gate:design' },
  { name: 'licenças', command: 'pnpm run gate:licencas' },
  { name: 'conteúdo de dinheiro e saúde', command: 'pnpm run gate:dinheiro-saude' },
  { name: 'actionlint', command: 'pnpm run gate:actionlint' },
  { name: E2E, command: 'pnpm run e2e' },
  { name: 'lighthouse ci', command: 'pnpm run lhci' },
  { name: 'lint:texto (LanguageTool)', command: 'pnpm run lint:texto' },
];

const PROJECTS = ['chromium', 'webkit'] as const;

/** The steps a part runs, read from the command line. Throws on anything it does not know. */
export function plan(args: readonly string[]): { label: string; steps: Step[] } {
  if (args.length === 0) return { label: 'tudo', steps: STEPS };
  if (args.length === 1 && args[0] === '--sem-playwright') {
    return { label: 'sem o Playwright', steps: STEPS.filter((step) => step.name !== E2E) };
  }
  const project = /^--playwright=(.+)$/.exec(args[0] ?? '')?.[1];
  const shard = args.length === 2 ? /^--shard=(\d+)\/(\d+)$/.exec(args[1] ?? '') : null;
  if (!project || !(PROJECTS as readonly string[]).includes(project) || args.length > 2 || (args.length === 2 && !shard)) {
    throw new Error(`uso: pnpm verificar [--sem-playwright | --playwright=chromium|webkit [--shard=i/n]] (recebido: ${args.join(' ')})`);
  }
  const [index, total] = shard ? [Number(shard[1]), Number(shard[2])] : [1, 1];
  if (index < 1 || index > total) throw new Error(`--shard=${index}/${total} fora do intervalo`);
  const part = total > 1 ? `, parte ${index} de ${total}` : '';
  const build = STEPS.find((step) => step.name.startsWith('build')) as Step;
  return {
    label: `Playwright no ${project}${part}`,
    steps: [build, { name: `playwright (${project}${part}, axe, anúncios, orçamentos)`, command: `pnpm run e2e --project=${project}${total > 1 ? ` --shard=${index}/${total}` : ''}` }],
  };
}

function run(step: Step): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(step.command, { shell: true, stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

if (import.meta.main) {
  const { label, steps } = plan(process.argv.slice(2));
  const started = Date.now();
  const timings: { name: string; ms: number; ok: boolean }[] = [];
  rmSync('dist', { recursive: true, force: true });
  for (const step of steps) {
    console.log(`\n▶ ${step.name}\n  $ ${step.command}`);
    const begin = Date.now();
    const code = await run(step);
    timings.push({ name: step.name, ms: Date.now() - begin, ok: code === 0 });
    if (code !== 0) break;
  }
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
