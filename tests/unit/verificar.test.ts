import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { distProblem, plan, STEPS, type Step } from '../../scripts/verificar.ts';
import { ciParts, completeParts } from '../../scripts/lib/ci-parts.ts';

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
  // Lighthouse), Chromium in five shards and WebKit in thirteen: the 20 parts of the ci.yml, read from the matrices of the
  // workflow itself so the test follows it.
  it('covers the whole suite between the 20 parts of the languages adjustment, the same as the matrices of ci.yml', () => {
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`]);
    const gates = [['--sem-playwright', '--sem-lighthouse'], ['--lighthouse']];
    const parts = [...gates, ...shards('chromium', 5), ...shards('webkit', 13)];
    expect(parts).toHaveLength(20);
    const commands = parts.flatMap((part) => plan(part).steps.map((step) => step.command.replace(/ --.*$/, '')));
    expect([...new Set(commands)].sort()).toEqual(STEPS.map((step) => step.command).sort());
    // Every gate runs in one part only: the build runs in each part, which needs it, and the suite once per shard.
    const once = commands.filter((command) => command !== 'pnpm run build' && command !== 'pnpm run e2e');
    expect(once).toHaveLength(new Set(once).size);
    expect(plan(['--sem-playwright', '--sem-lighthouse']).steps.map((step) => step.command)).not.toContain('pnpm run lhci');
    expect(plan(['--sem-lighthouse', '--sem-playwright']).steps).toEqual(plan(['--sem-playwright', '--sem-lighthouse']).steps);
    expect(plan(['--lighthouse']).steps.map((step) => step.command)).toEqual(['pnpm run build', 'pnpm run lhci']);
    // Until the F9 this test also read the two matrices of ci.yml; since the F9 the parts of ci.yml are read by ciParts()
    // in the test of the F9 below, with the build once (DECISOES § 324).
    expect(plan(['--sem-playwright', '--sem-lighthouse']).distReady).toBe(false);
  });

  it('refuses what it does not know', () => {
    for (const args of [
      ['--playwright=firefox'],
      ['--playwright'],
      ['--shard=1/2'],
      ['--playwright=webkit', '--shard=3/2'],
      ['--playwright=webkit', '--shard=0/2'],
      ['--sem-playwright', '--playwright=webkit'],
      ['--tudo'],
      ['--sem-lighthouse'],
      ['--lighthouse', '--sem-playwright'],
      ['--lighthouse', '--shard=1/2'],
      ['--sem-playwright', '--sem-lighthouse', '--lighthouse'],
      // F9: the build alone takes nothing else, --dist-pronto goes once, and --partes is its own mode.
      ['--build', '--dist-pronto'],
      ['--build', '--sem-playwright'],
      ['--dist-pronto', '--dist-pronto'],
      ['--lighthouse', '--dist-pronto', '--dist-pronto'],
      ['--leve', '--sem-playwright'],
      ['--partes'],
      ['--partes', '--dist-pronto'],
    ]) {
      expect(() => plan(args), args.join(' ')).toThrow();
    }
  });
});

// F9, decision 2 (DECISOES § 324): the CI builds once, in the build job (--build), and every other part uses that dist/
// (--dist-pronto). Decision 6 (§ 329): pnpm verificar --partes runs the parts of ci.yml, read by ciParts().
describe('verificar com o build uma vez (F9)', () => {
  const CI = readFileSync('.github/workflows/ci.yml', 'utf8');
  const command = (step: Step): string => step.command.replace(/ --.*$/, '');

  it('builds alone with --build, and keeps the dist/ with --dist-pronto', () => {
    expect(plan(['--build'])).toEqual({ label: 'build', steps: [STEPS.find((step) => step.command === 'pnpm run build')], distReady: false });
    expect(plan(['--lighthouse', '--dist-pronto'])).toMatchObject({ distReady: true, steps: [{ command: 'pnpm run lhci' }] });
    expect(plan(['--dist-pronto', '--lighthouse']).steps).toEqual(plan(['--lighthouse', '--dist-pronto']).steps);
    expect(plan(['--playwright=webkit', '--shard=9/13', '--dist-pronto']).steps.map((step) => step.command)).toEqual(['pnpm run e2e --project=webkit --shard=9/13']);
    expect(plan(['--playwright=webkit', '--shard=9/13', '--dist-pronto']).label).toBe('Playwright no webkit, parte 9 de 13, com o dist/ pronto');
    expect(plan(['--dist-pronto']).steps).toEqual(STEPS.filter((step) => step.command !== 'pnpm run build'));
    // Without the option, nothing changes: every part builds, as before the F9.
    for (const args of [[], ['--sem-playwright'], ['--lighthouse'], ['--playwright=chromium', '--shard=2/5']]) {
      expect(plan(args).distReady, args.join(' ')).toBe(false);
      expect(plan(args).steps.map((step) => step.command), args.join(' ')).toContain('pnpm run build');
    }
  });

  it('runs tipos, lint, the build and Vitest with --leve, the job of a draft', () => {
    expect(plan(['--leve']).steps.map((step) => step.command)).toEqual(['pnpm run tipos', 'pnpm run lint', 'pnpm run build', 'pnpm run test']);
  });

  it('refuses a dist/ of another commit, or none', () => {
    const head = 'a'.repeat(40);
    expect(distProblem(`${head}\n`, head)).toBeNull();
    expect(distProblem(null, head)).toMatch(/não há dist\/build\.txt/);
    expect(distProblem(`${'b'.repeat(40)}\n`, head)).toMatch(/outro commit/);
    expect(distProblem('', head)).toMatch(/outro commit/);
  });

  it('reads the parts of ci.yml: the build first, then every part with the ready dist/', () => {
    const parts = completeParts(CI);
    expect(parts[0]).toEqual({ job: 'build', args: ['--build'] });
    for (const part of parts.slice(1)) expect(part.args, part.job).toContain('--dist-pronto');
    const kept = new Set(parts.map((part) => JSON.stringify(part)));
    expect(ciParts(CI).filter((part) => !kept.has(JSON.stringify(part)))).toEqual([{ job: 'leve', args: ['--leve'] }]);
    // The parts of the Playwright and of the gates are the ones of the languages adjustment (§ 320): the F9 changes none.
    const shards = (project: string, total: number) => Array.from({ length: total }, (_, i) => [`--playwright=${project}`, `--shard=${i + 1}/${total}`, '--dist-pronto']);
    expect(parts.map((part) => part.args)).toEqual([['--build'], ['--sem-playwright', '--sem-lighthouse', '--dist-pronto'], ['--lighthouse', '--dist-pronto'], ...shards('chromium', 5), ...shards('webkit', 13)]);
  });

  it('covers the whole of pnpm verificar between the parts of ci.yml, with the build once and every gate once', () => {
    const commands = completeParts(CI).flatMap((part) => plan(part.args).steps.map(command));
    expect([...new Set(commands)].sort()).toEqual(STEPS.map((step) => step.command).sort());
    expect(commands.filter((entry) => entry === 'pnpm run build')).toHaveLength(1);
    const once = commands.filter((entry) => entry !== 'pnpm run e2e');
    expect(once).toHaveLength(new Set(once).size);
    expect(commands.filter((entry) => entry === 'pnpm run e2e')).toHaveLength(18);
    // The light job is not part of the whole: it is the class of a draft, and runs alone.
    expect(plan(['--leve']).steps.every((step) => STEPS.includes(step))).toBe(true);
  });
});
