import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { plan, STEPS } from '../../scripts/verificar.ts';
import { workflowJobs } from './lib/merge-job.ts';

// ADR-003: the CI runs pnpm verificar in parts, one job each. The parts together must be the same steps as the
// whole, so no gate is lost when the run is split.
describe('verificar em partes', () => {
  it('runs every step, in order, without arguments', () => {
    expect(plan([]).steps).toEqual(STEPS);
  });

  it('runs every step but the Playwright suite with --sem-playwright', () => {
    const steps = plan(['--sem-playwright']).steps;
    expect(steps).toEqual(STEPS.filter((step) => step.command !== 'pnpm run e2e'));
    expect(steps).toHaveLength(STEPS.length - 1);
  });

  it('builds and runs one project, or one shard of it, with --playwright', () => {
    expect(plan(['--playwright=chromium']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run e2e --project=chromium']);
    expect(plan(['--playwright=webkit', '--shard=2/2']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run e2e --project=webkit --shard=2/2']);
    expect(plan(['--playwright=webkit', '--shard=1/2']).label).toBe('Playwright no webkit, parte 1 de 2');
  });

  it('covers the whole suite between the parts the CI runs', () => {
    const parts = [['--sem-playwright'], ['--playwright=chromium'], ['--playwright=webkit', '--shard=1/2'], ['--playwright=webkit', '--shard=2/2']];
    const commands = new Set(parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, ''))));
    expect([...commands].sort()).toEqual(STEPS.map((step) => step.command).sort());
  });

  // F5a (adendo da ADR-003): Chromium in three shards and WebKit in seven, the parts of the ci.yml.
  it('covers the whole suite between the parts of the F5a, and each shard runs its own slice', () => {
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`]);
    const parts = [['--sem-playwright'], ...shards('chromium', 3), ...shards('webkit', 7)];
    const commands = new Set(parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, ''))));
    expect([...commands].sort()).toEqual(STEPS.map((step) => step.command).sort());
    expect(plan(['--playwright=chromium', '--shard=3/3']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run e2e --project=chromium --shard=3/3']);
    expect(plan(['--playwright=webkit', '--shard=7/7']).label).toBe('Playwright no webkit, parte 7 de 7');
  });

  // F7 (second adendo of ADR-003): Chromium in four shards and WebKit in eight, the 13 parts of the ci.yml.
  it('covers the whole suite between the 13 parts of the F7, and each shard runs its own slice', () => {
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`]);
    const parts = [['--sem-playwright'], ...shards('chromium', 4), ...shards('webkit', 8)];
    expect(parts).toHaveLength(13);
    const commands = new Set(parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, ''))));
    expect([...commands].sort()).toEqual(STEPS.map((step) => step.command).sort());
    expect(plan(['--playwright=chromium', '--shard=4/4']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run e2e --project=chromium --shard=4/4']);
    expect(plan(['--playwright=webkit', '--shard=8/8']).label).toBe('Playwright no webkit, parte 8 de 8');
  });

  // F8 (third adendo of ADR-003; DECISOES § 302): Chromium in four shards and WebKit in ten, the 15 parts of the ci.yml
  // until the languages adjustment.
  it('covers the whole suite between the 15 parts of the F8', () => {
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`]);
    const parts = [['--sem-playwright'], ...shards('chromium', 4), ...shards('webkit', 10)];
    expect(parts).toHaveLength(15);
    const commands = new Set(parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, ''))));
    expect([...commands].sort()).toEqual(STEPS.map((step) => step.command).sort());
    expect(plan(['--playwright=webkit', '--shard=10/10']).label).toBe('Playwright no webkit, parte 10 de 10');
  });

  // The languages adjustment (fourth adendo of ADR-003; DECISOES § 320): the gates in two parts (all but Lighthouse, and
  // Lighthouse), Chromium in five shards and WebKit in twelve: the 19 parts of the ci.yml, read from the matrices of the
  // workflow itself so the test follows it.
  it('covers the whole suite between the 19 parts of the languages adjustment, the same as the matrices of ci.yml', () => {
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`]);
    const gates = [['--sem-playwright', '--sem-lighthouse'], ['--lighthouse']];
    const parts = [...gates, ...shards('chromium', 5), ...shards('webkit', 12)];
    expect(parts).toHaveLength(19);
    const commands = parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, '')));
    expect([...new Set(commands)].sort()).toEqual(STEPS.map((step) => step.command).sort());
    // Every gate runs in one part only: the build runs in each part, which needs it, and the suite once per shard.
    const once = commands.filter((command) => command !== 'pnpm run build' && command !== 'pnpm run e2e');
    expect(once).toHaveLength(new Set(once).size);
    expect(plan(['--sem-playwright', '--sem-lighthouse']).steps.map((step) => step.command)).not.toContain('pnpm run lhci');
    expect(plan(['--sem-lighthouse', '--sem-playwright']).steps).toEqual(plan(['--sem-playwright', '--sem-lighthouse']).steps);
    expect(plan(['--lighthouse']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run lhci']);
    const jobs = workflowJobs(readFileSync('.github/workflows/ci.yml', 'utf8'));
    const matrixOf = (job: string) => (jobs[job]?.['strategy'] as { matrix: { include: { args: string }[] } }).matrix.include.map((entry) => entry.args.split(' '));
    expect(matrixOf('verificar')).toEqual(gates);
    expect(matrixOf('playwright')).toEqual(parts.slice(gates.length));
  });

  it('refuses what it does not know', () => {
    for (const args of [['--playwright=firefox'], ['--playwright'], ['--shard=1/2'], ['--playwright=webkit', '--shard=3/2'], ['--playwright=webkit', '--shard=0/2'], ['--sem-playwright', '--playwright=webkit'], ['--tudo'], ['--sem-lighthouse'], ['--lighthouse', '--sem-playwright'], ['--lighthouse', '--shard=1/2'], ['--sem-playwright', '--sem-lighthouse', '--lighthouse']]) {
      expect(() => plan(args), args.join(' ')).toThrow();
    }
  });
});
