// pnpm verificar: every gate of the project, in order, with the time of each one (CLAUDE.md).
// Each step is also a package.json script, so a gate can run alone (see CLAUDE.md, F1a section).
// Stops at the first failure; nothing here is optional or skipped.
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';

interface Step {
  name: string;
  command: string;
}

const STEPS: Step[] = [
  { name: 'tipos (astro check)', command: 'pnpm run tipos' },
  { name: 'lint (eslint)', command: 'pnpm run lint' },
  { name: 'build (astro build do zero)', command: 'pnpm run build' },
  { name: 'vitest', command: 'pnpm run test' },
  { name: 'cabeçalhos gerados', command: 'pnpm run gate:cabecalhos' },
  { name: 'worker sem código', command: 'pnpm run gate:worker' },
  { name: 'seo (hreflang, sitemaps, canonical, robots)', command: 'pnpm run gate:seo' },
  { name: 'links internos e páginas órfãs', command: 'pnpm run gate:links' },
  { name: 'conteúdo mínimo das ferramentas e do site', command: 'pnpm run gate:conteudo' },
  { name: 'design (sprite, fontes, tema, movimento, setas)', command: 'pnpm run gate:design' },
  { name: 'licenças', command: 'pnpm run gate:licencas' },
  { name: 'conteúdo de dinheiro e saúde', command: 'pnpm run gate:dinheiro-saude' },
  { name: 'actionlint', command: 'pnpm run gate:actionlint' },
  { name: 'playwright (chromium e webkit, axe, anúncios, orçamentos)', command: 'pnpm run e2e' },
  { name: 'lighthouse ci', command: 'pnpm run lhci' },
  { name: 'lint:texto (LanguageTool)', command: 'pnpm run lint:texto' },
];

function run(step: Step): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(step.command, { shell: true, stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

const started = Date.now();
const timings: { name: string; ms: number; ok: boolean }[] = [];
rmSync('dist', { recursive: true, force: true });
for (const step of STEPS) {
  console.log(`\n▶ ${step.name}\n  $ ${step.command}`);
  const begin = Date.now();
  const code = await run(step);
  timings.push({ name: step.name, ms: Date.now() - begin, ok: code === 0 });
  if (code !== 0) break;
}
const total = Date.now() - started;
console.log('\nResumo do pnpm verificar');
for (const timing of timings) console.log(`  ${timing.ok ? 'ok   ' : 'FALHA'} ${seconds(timing.ms).padStart(8)}  ${timing.name}`);
const failed = timings.some((timing) => !timing.ok) || timings.length < STEPS.length;
console.log(`  total ${seconds(total)} (limite 900 s)`);
if (total > 900_000) {
  console.log('  FALHA: o verificar passou de 15 minutos.');
  process.exit(1);
}
process.exit(failed ? 1 : 0);
