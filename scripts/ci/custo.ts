// pnpm ci:custo <run-id> [--attempt n]: what one execution of the CI cost (F9, decision 1; DECISOES § 323).
// It only reads, through the gh CLI: `gh run view --json` for the jobs and their steps, and `gh run view --job --log` for
// the summary pnpm verificar prints at the end of each job. It prints Markdown, ready for a report: per job the duration,
// the billed minute (the duration rounded up, as in a private repository), the setup (from the start of the job to the
// step that runs pnpm verificar), the steps that weigh most and the total of the verificar summary; for the execution the
// sum of the billed minutes, the wall time, the jobs that ran and the class (scripts/ci/classificar.ts). The arithmetic is
// the pure summarize(), tested on a recorded execution in fixtures/ci-custo/ (tests/unit/ci-custo.test.ts).
import { execFileSync } from 'node:child_process';

export interface RunStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface RunJob {
  databaseId: number;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  steps: RunStep[];
}

export interface RunJson {
  databaseId: number;
  attempt: number;
  status: string;
  conclusion: string | null;
  event: string;
  headBranch: string;
  headSha: string;
  createdAt: string;
  jobs: RunJob[];
}

export interface StepCost {
  name: string;
  seconds: number;
}

export interface JobCost {
  name: string;
  /** False for a job the run skipped (or never started): it costs nothing. */
  ran: boolean;
  conclusion: string;
  seconds: number;
  billedMinutes: number;
  /** From the start of the job to the start of the step that runs pnpm verificar; null when the job has none. */
  setupSeconds: number | null;
  /** The three slowest steps of the job. */
  heavy: StepCost[];
  /** The `total` line of the pnpm verificar summary in the log of the job, in seconds. */
  verificarTotal: number | null;
  /** The steps of the pnpm verificar summary, in order. */
  verificarSteps: StepCost[];
}

export interface RunCost {
  id: number;
  attempt: number;
  conclusion: string;
  event: string;
  branch: string;
  sha: string;
  createdAt: string;
  /** leve, portões or completo, from the log of the classification; `completo (CI de antes da F9)` without one. */
  klass: string;
  jobs: JobCost[];
  billedMinutes: number;
  wallSeconds: number;
  ran: number;
  skipped: number;
}

const ms = (iso: string | null): number | null => {
  if (!iso) return null;
  const value = Date.parse(iso);
  return Number.isFinite(value) && value > 0 ? value : null;
};

/** Seconds between two timestamps of the API; 0 when one is missing or the end comes first. */
export function span(start: string | null, end: string | null): number {
  const from = ms(start);
  const to = ms(end);
  return from === null || to === null || to < from ? 0 : (to - from) / 1000;
}

/** GitHub bills each job of a private repository by the minute, rounded up. */
export function billed(seconds: number): number {
  return seconds <= 0 ? 0 : Math.ceil(seconds / 60);
}

/** True for the step that runs pnpm verificar (its name starts with the command). */
export const isVerificarStep = (step: RunStep): boolean => step.name.startsWith('pnpm verificar');

/** The summary pnpm verificar prints at the end ("Resumo do pnpm verificar"): each step and the total. */
export function readVerificarSummary(log: string): { total: number | null; steps: StepCost[] } {
  const lines = log.replaceAll('\r\n', '\n').split('\n');
  const start = lines.findLastIndex((line) => line.includes('Resumo do pnpm verificar ('));
  if (start < 0) return { total: null, steps: [] };
  const steps: StepCost[] = [];
  let total: number | null = null;
  for (const line of lines.slice(start + 1)) {
    const step = /(?:ok {3}|FALHA)\s+(\d+(?:\.\d+)?) s {2}(.+?)\s*$/.exec(line);
    if (step) {
      steps.push({ name: step[2] as string, seconds: Number(step[1]) });
      continue;
    }
    const end = /total (\d+(?:\.\d+)?) s \(limite 900 s\)/.exec(line);
    if (end) {
      total = Number(end[1]);
      break;
    }
  }
  return { total, steps };
}

/** The class the classification printed (`classificar: classe <x>`), or null when the log has none. */
export function readClass(log: string): string | null {
  return /classificar: classe (\S+)/.exec(log)?.[1] ?? null;
}

export function summarize(run: RunJson, logs: Readonly<Record<number, string>>): RunCost {
  const jobs: JobCost[] = run.jobs.map((job) => {
    const ran = job.conclusion !== 'skipped' && ms(job.startedAt) !== null && span(job.startedAt, job.completedAt) > 0;
    const seconds = ran ? span(job.startedAt, job.completedAt) : 0;
    const verificar = job.steps.find(isVerificarStep);
    const setupSeconds = ran && verificar?.startedAt ? span(job.startedAt, verificar.startedAt) : null;
    const heavy = job.steps
      .map((step) => ({ name: step.name, seconds: span(step.startedAt, step.completedAt) }))
      .filter((step) => step.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 3);
    const summary = readVerificarSummary(logs[job.databaseId] ?? '');
    return {
      name: job.name,
      ran,
      conclusion: job.conclusion ?? job.status,
      seconds,
      billedMinutes: billed(seconds),
      setupSeconds,
      heavy,
      verificarTotal: summary.total,
      verificarSteps: summary.steps,
    };
  });
  const ranJobs = run.jobs.filter((_, i) => jobs[i]?.ran);
  const started = ranJobs.map((job) => ms(job.startedAt) as number);
  const ended = ranJobs.map((job) => ms(job.completedAt) ?? 0);
  const klass = run.jobs.map((job) => readClass(logs[job.databaseId] ?? '')).find((value) => value !== null) ?? null;
  const hasClassifier = run.jobs.some((job) => job.name === 'classificar');
  return {
    id: run.databaseId,
    attempt: run.attempt,
    conclusion: run.conclusion ?? run.status,
    event: run.event,
    branch: run.headBranch,
    sha: run.headSha,
    createdAt: run.createdAt,
    klass: klass ?? (hasClassifier ? 'desconhecida (sem a linha da classificação no log)' : 'completo (CI de antes da F9)'),
    jobs,
    billedMinutes: jobs.reduce((sum, job) => sum + job.billedMinutes, 0),
    wallSeconds: started.length > 0 ? (Math.max(...ended) - Math.min(...started)) / 1000 : 0,
    ran: jobs.filter((job) => job.ran).length,
    skipped: jobs.filter((job) => !job.ran).length,
  };
}

/** The setup of a Playwright job the F9 aims at (decision 3) and the target of each part (ADR-003). */
export const SETUP_LIMIT_S = 90;
export const PART_TARGET_S = 700;

/** Jobs in a stable order: by name, with the numbers of the parts compared as numbers. */
export function byName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, 'en', { numeric: true });
}

const sec = (seconds: number): string => `${seconds.toFixed(0)} s`;
const cell = (text: string): string => text.replaceAll('|', '\\|');

export function toMarkdown(cost: RunCost): string {
  const out: string[] = [];
  out.push(`### Execução ${cost.id} (tentativa ${cost.attempt})`, '');
  out.push(`- Branch \`${cost.branch}\`, commit \`${cost.sha.slice(0, 7)}\`, evento \`${cost.event}\`, criada em ${cost.createdAt}, resultado \`${cost.conclusion}\`.`);
  out.push(`- Classe: **${cost.klass}**.`);
  out.push(`- Minutos cobrados: **${cost.billedMinutes}** (soma dos jobs, cada um arredondado para cima).`);
  out.push(`- Tempo de parede: **${(cost.wallSeconds / 60).toFixed(1)} min** (do início do primeiro job ao fim do último).`);
  out.push(`- Jobs: ${cost.ran} rodaram, ${cost.skipped} pulados.`, '');
  out.push('| Job | Resultado | Duração | Cobrado | Preparo | Total do verificar | Passos que mais pesam |');
  out.push('| --- | --- | ---: | ---: | ---: | ---: | --- |');
  for (const job of [...cost.jobs].sort(byName)) {
    if (!job.ran) {
      out.push(`| ${cell(job.name)} | pulado | | 0 | | | |`);
      continue;
    }
    const heavy = job.heavy.map((step) => `${cell(step.name)} (${sec(step.seconds)})`).join('; ');
    const total = job.verificarTotal === null ? '' : `${job.verificarTotal.toFixed(1)} s`;
    const setup = job.setupSeconds === null ? '' : sec(job.setupSeconds);
    out.push(`| ${cell(job.name)} | ${job.conclusion} | ${sec(job.seconds)} | ${job.billedMinutes} | ${setup} | ${total} | ${heavy} |`);
  }
  const builds = [...cost.jobs].sort(byName).filter((job) => job.verificarSteps.some((step) => step.name.startsWith('build')));
  out.push('', `Jobs que rodaram o build do site no verificar: ${builds.length === 0 ? 'nenhum' : builds.map((job) => `${job.name} (${sec(job.verificarSteps.find((step) => step.name.startsWith('build'))?.seconds ?? 0)})`).join(', ')}.`);
  const setups = cost.jobs.filter((job) => job.ran && job.setupSeconds !== null && job.name.startsWith('playwright'));
  if (setups.length > 0) {
    const worst = setups.reduce((a, b) => ((a.setupSeconds ?? 0) >= (b.setupSeconds ?? 0) ? a : b));
    const over = setups.filter((job) => (job.setupSeconds ?? 0) > SETUP_LIMIT_S).length;
    out.push(`Preparo dos jobs do Playwright: o maior foi ${sec(worst.setupSeconds ?? 0)} (${worst.name}); ${over} de ${setups.length} acima de ${SETUP_LIMIT_S} s.`);
  }
  const totals = cost.jobs.filter((job) => job.verificarTotal !== null);
  if (totals.length > 0) {
    const longest = totals.reduce((a, b) => ((a.verificarTotal ?? 0) >= (b.verificarTotal ?? 0) ? a : b));
    const over = totals.filter((job) => (job.verificarTotal ?? 0) > PART_TARGET_S).length;
    out.push(`Total do verificar: o maior foi ${(longest.verificarTotal ?? 0).toFixed(1)} s (${longest.name}); ${over} de ${totals.length} partes acima do alvo de ${PART_TARGET_S} s.`);
  }
  return `${out.join('\n')}\n`;
}

function gh(args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

export const RUN_FIELDS = 'databaseId,attempt,status,conclusion,event,headBranch,headSha,createdAt,jobs';

if (import.meta.main) {
  const args = process.argv.slice(2);
  const id = args.find((arg) => /^\d+$/.test(arg));
  const attemptAt = args.indexOf('--attempt');
  const attempt = attemptAt >= 0 ? args[attemptAt + 1] : undefined;
  if (!id || (attemptAt >= 0 && !/^\d+$/.test(attempt ?? ''))) {
    console.error('uso: pnpm ci:custo <run-id> [--attempt n]');
    process.exit(2);
  }
  const attemptArgs = attempt ? ['--attempt', attempt] : [];
  const run = JSON.parse(gh(['run', 'view', id, ...attemptArgs, '--json', RUN_FIELDS])) as RunJson;
  const logs: Record<number, string> = {};
  for (const job of run.jobs) {
    if (job.conclusion === 'skipped' || !job.startedAt) continue;
    try {
      logs[job.databaseId] = gh(['run', 'view', '--job', String(job.databaseId), '--log']);
    } catch {
      logs[job.databaseId] = '';
    }
  }
  process.stdout.write(toMarkdown(summarize(run, logs)));
}
