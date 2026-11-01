import { describe, expect, it } from 'vitest';
import { plan, STEPS } from '../../scripts/verificar.ts';

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

  // F5a (adendo da ADR-003): Chromium in two shards and WebKit in five, the parts of the ci.yml.
  it('covers the whole suite between the parts of the F5a, and each shard runs its own slice', () => {
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`]);
    const parts = [['--sem-playwright'], ...shards('chromium', 2), ...shards('webkit', 5)];
    const commands = new Set(parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, ''))));
    expect([...commands].sort()).toEqual(STEPS.map((step) => step.command).sort());
    expect(plan(['--playwright=chromium', '--shard=2/2']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run e2e --project=chromium --shard=2/2']);
    expect(plan(['--playwright=webkit', '--shard=5/5']).label).toBe('Playwright no webkit, parte 5 de 5');
  });

  it('refuses what it does not know', () => {
    for (const args of [['--playwright=firefox'], ['--playwright'], ['--shard=1/2'], ['--playwright=webkit', '--shard=3/2'], ['--playwright=webkit', '--shard=0/2'], ['--sem-playwright', '--playwright=webkit'], ['--tudo']]) {
      expect(() => plan(args), args.join(' ')).toThrow();
    }
  });
});
