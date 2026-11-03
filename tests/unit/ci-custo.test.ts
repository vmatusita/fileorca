// pnpm ci:custo (F9, decision 1; DECISOES § 323), on a recorded execution of the CI: the baseline of the F9, run
// 41590377930 (the last green run of the PR of the languages adjustment), with the gh run view JSON and, per job, the lines
// of its log that the script reads. The numbers are the ones the report of the F9 quotes.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { billed, readClass, readVerificarSummary, span, summarize, toMarkdown, type RunJson } from '../../scripts/ci/custo.ts';

const recorded = JSON.parse(readFileSync('fixtures/ci-custo/run-41590377930.json', 'utf8')) as { run: RunJson; logs: Record<string, string> };
const baseline = summarize(recorded.run, recorded.logs);

describe('ci:custo on the baseline of the F9', () => {
  it('sums the billed minutes, the wall time and the jobs', () => {
    expect(baseline.id).toBe(41590377930);
    expect(baseline.billedMinutes).toBe(157);
    expect(baseline.ran).toBe(21);
    expect(baseline.skipped).toBe(2);
    expect(Math.round(baseline.wallSeconds)).toBe(667);
    expect(baseline.klass).toBe('completo (CI de antes da F9)');
  });

  it('measures the setup of each job up to the step of pnpm verificar, and reads the total of each part', () => {
    const job = (name: string) => baseline.jobs.find((candidate) => candidate.name === name);
    expect(job('playwright (webkit 8 de 13)')).toMatchObject({ seconds: 325, billedMinutes: 6, setupSeconds: 128, verificarTotal: 191.6 });
    expect(job('verificar (lighthouse)')?.verificarSteps).toEqual([
      { name: 'build (astro build do zero)', seconds: 22.3 },
      { name: 'lighthouse ci', seconds: 385.4 },
    ]);
    expect(job('merge')).toMatchObject({ billedMinutes: 1, setupSeconds: null, verificarTotal: null });
    expect(job('pos-deploy')).toMatchObject({ ran: false, billedMinutes: 0 });
    // Before the F9 every part built the site.
    expect(baseline.jobs.filter((candidate) => candidate.verificarSteps.some((step) => step.name.startsWith('build')))).toHaveLength(20);
    expect(Math.max(...baseline.jobs.map((candidate) => candidate.verificarTotal ?? 0))).toBe(574.7);
  });

  it('prints Markdown with every job, the skipped ones as skipped', () => {
    const text = toMarkdown(baseline);
    expect(text).toContain('Minutos cobrados: **157**');
    expect(text).toContain('| pos-deploy | pulado | | 0 | | | |');
    expect(text).toContain('| playwright (webkit 8 de 13) | success | 325 s | 6 | 128 s | 191.6 s |');
    expect(text).toContain('o maior foi 128 s (playwright (webkit 8 de 13)); 1 de 18 acima de 90 s');
    expect(text).toContain('0 de 20 partes acima do alvo de 700 s');
    // The parts in their order: chromium 2 before chromium 10, webkit 9 before webkit 13.
    expect(text.indexOf('playwright (webkit 9 de 13)')).toBeLessThan(text.indexOf('playwright (webkit 13 de 13)'));
  });
});

describe('ci:custo, the arithmetic', () => {
  it('bills each job by the minute, rounded up', () => {
    expect([billed(0), billed(1), billed(60), billed(60.5), billed(61), billed(636)]).toEqual([0, 1, 1, 2, 2, 11]);
    expect(span('2026-11-03T06:36:09Z', '2026-11-03T06:47:16Z')).toBe(667);
    expect(span(null, '2026-11-03T06:47:16Z')).toBe(0);
    expect(span('2026-11-03T06:47:16Z', '2026-11-03T06:36:09Z')).toBe(0);
    expect(span('0001-01-01T00:00:00Z', '2026-11-03T06:36:09Z')).toBe(0);
  });

  it('reads the last summary of a log, with a failed step and the class line', () => {
    const log = ['x  Resumo do pnpm verificar (velho)', '  total 1.0 s (limite 900 s)', 'Resumo do pnpm verificar (leve (tipos, lint, build e Vitest))', '  ok      15.0 s  tipos (astro check)', '  FALHA    120.5 s  vitest', '  total 140.2 s (limite 900 s)', 'classificar: classe leve - PR em rascunho'].join('\n');
    expect(readVerificarSummary(log)).toEqual({ total: 140.2, steps: [{ name: 'tipos (astro check)', seconds: 15 }, { name: 'vitest', seconds: 120.5 }] });
    expect(readVerificarSummary('nada aqui')).toEqual({ total: null, steps: [] });
    expect(readClass(log)).toBe('leve');
    expect(readClass('sem classe')).toBeNull();
  });

  it('takes the class from the log of the classification, and says when the line is missing', () => {
    const job = (databaseId: number, name: string, conclusion: string, startedAt: string, completedAt: string) => ({ databaseId, name, status: 'completed', conclusion, startedAt, completedAt, steps: [] });
    const run: RunJson = {
      databaseId: 1,
      attempt: 1,
      status: 'completed',
      conclusion: 'success',
      event: 'pull_request',
      headBranch: 'fase-09',
      headSha: 'a'.repeat(40),
      createdAt: '2026-11-03T10:00:00Z',
      jobs: [
        job(10, 'classificar', 'success', '2026-11-03T10:00:00Z', '2026-11-03T10:00:20Z'),
        job(11, 'verificar (leve)', 'success', '2026-11-03T10:00:30Z', '2026-11-03T10:04:00Z'),
        job(12, 'playwright (webkit 1 de 13)', 'skipped', '2026-11-03T10:00:21Z', '2026-11-03T10:00:21Z'),
      ],
    };
    const cost = summarize(run, { 10: 'classificar: classe leve - PR em rascunho sem o rótulo ci' });
    expect(cost).toMatchObject({ klass: 'leve', billedMinutes: 5, ran: 2, skipped: 1, wallSeconds: 240 });
    expect(summarize(run, {}).klass).toMatch(/^desconhecida/);
  });

  it('only reads: no method, no write call of gh', () => {
    const source = readFileSync('scripts/ci/custo.ts', 'utf8');
    expect(source).not.toMatch(/['"](?:-X|--method)['"]/);
    expect([...source.matchAll(/gh\(\[([^\]]*)\]/g)].map((match) => match[1])).toEqual(["'run', 'view', id, ...attemptArgs, '--json', RUN_FIELDS", "'run', 'view', '--job', String(job.databaseId), '--log'"]);
  });
});
