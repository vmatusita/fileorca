// The verdict of the ci-ok job (F9, decision 5; DECISOES § 327), on the shape of `toJSON(needs)`: green only when the
// class came out and every job ended in success, or in skipped when the class does not ask for it; red on failure, on
// cancelled, on a skipped job the class asks for, and without a class. The CLI is run too, as the job runs it: a copy of
// the script alone in a folder (the job copies only that file to $RUNNER_TEMP/ci/), with PR_DRAFT_NOW in the env.
// The review of the F9 (A-2): a leve run of a PR that is ready when ci-ok runs is red, and the CLI fails without
// PR_DRAFT_NOW or with anything but true or false.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { READY_LEVE, REQUIRED, verdict, WATCHED, type Klass, type NeedResult } from '../../scripts/ci/ci-ok.ts';

const scratch = mkdtempSync(join(tmpdir(), 'fo-ci-ok-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
// The script alone, as the job runs it: an import of a sibling file would fail here and not only on the runner.
mkdirSync(join(scratch, 'ci'));
const SCRIPT = join(scratch, 'ci', 'ci-ok.ts');
copyFileSync('scripts/ci/ci-ok.ts', SCRIPT);

/** The needs of an execution of the class: its jobs in success, the others skipped, as the ifs of ci.yml make them. */
function needsOf(klass: Klass): Record<string, NeedResult> {
  return Object.fromEntries(
    WATCHED.map((job) => [job, { result: REQUIRED[klass].includes(job) ? 'success' : 'skipped', outputs: job === 'classificar' ? { classe: klass } : {} }]),
  );
}

/** The draft state the job reads with gh api for each class, when the run is the one that should count. */
const DRAFT_NOW: Record<Klass, 'true' | 'false'> = { leve: 'true', 'portões': 'false', completo: 'false' };

/** Runs the CLI with PR_DRAFT_NOW (left out when undefined); the exit code and what it printed. */
function run(needs: unknown, draftNow: string | undefined): { status: number; out: string } {
  const path = join(scratch, `needs-${Math.round(performance.now() * 1000)}.json`);
  writeFileSync(path, typeof needs === 'string' ? needs : JSON.stringify(needs));
  const env = { ...process.env };
  delete env['PR_DRAFT_NOW'];
  if (draftNow !== undefined) env['PR_DRAFT_NOW'] = draftNow;
  try {
    const out = execFileSync(process.execPath, [SCRIPT, path], { encoding: 'utf8', stdio: 'pipe', env, cwd: scratch });
    return { status: 0, out };
  } catch (error) {
    const failed = error as { status?: number; stdout?: string; stderr?: string };
    return { status: failed.status ?? 1, out: `${failed.stdout ?? ''}${failed.stderr ?? ''}` };
  }
}

function cli(needs: unknown, draftNow: string | undefined = 'false'): number {
  return run(needs, draftNow).status;
}

describe('ci-ok', () => {
  it('watches the jobs of every class', () => {
    expect(WATCHED).toEqual(['classificar', 'leve', 'build', 'portoes', 'lighthouse', 'playwright']);
    expect(REQUIRED['leve']).not.toContain('playwright');
    expect(REQUIRED['portões']).not.toContain('playwright');
    expect(REQUIRED['portões']).not.toContain('lighthouse');
  });

  it.each(Object.keys(REQUIRED) as Klass[])('is green for a %s execution that went well', (klass) => {
    expect(verdict(needsOf(klass))).toMatchObject({ ok: true });
    expect(verdict(needsOf(klass), DRAFT_NOW[klass] === 'true')).toMatchObject({ ok: true });
    const { status, out } = run(needsOf(klass), DRAFT_NOW[klass]);
    expect(status, out).toBe(0);
    expect(out.split('\n')).toContain('ci-ok: verde');
  });

  // A synchronize sent while the PR was a draft and a ready_for_review a second later: if the run of the synchronize
  // is the one that survives the cancel-in-progress, its class is leve and the PR is ready (A-2).
  it('is red for a leve run when the PR is no longer a draft, and green for the leve run of a draft', () => {
    const ready = verdict(needsOf('leve'), false);
    expect(ready.ok).toBe(false);
    expect(ready.lines).toContain(READY_LEVE);
    expect(verdict(needsOf('leve'), true)).toMatchObject({ ok: true });
    const red = run(needsOf('leve'), 'false');
    expect(red.status).toBe(1);
    expect(red.out).toContain(READY_LEVE);
    expect(red.out.split('\n')).toContain('ci-ok: vermelho');
    expect(cli(needsOf('leve'), 'true')).toBe(0);
    // The other classes run everything they ask for, draft or not (a draft with the ci label).
    for (const klass of ['portões', 'completo'] as Klass[]) {
      expect(verdict(needsOf(klass), true).ok, klass).toBe(true);
      expect(cli(needsOf(klass), 'true'), klass).toBe(0);
    }
  });

  it.each([
    ['without PR_DRAFT_NOW', undefined],
    ['with an empty PR_DRAFT_NOW', ''],
    ['with PR_DRAFT_NOW that is not true or false', 'null'],
    ['with PR_DRAFT_NOW in capitals', 'False'],
  ])('fails closed %s, for every class', (_name, draftNow) => {
    for (const klass of Object.keys(REQUIRED) as Klass[]) {
      const { status, out } = run(needsOf(klass), draftNow);
      expect(status, klass).toBe(1);
      expect(out, klass).toContain('PR_DRAFT_NOW tem de ser true ou false');
      expect(out.split('\n'), klass).not.toContain('ci-ok: verde');
    }
  });

  it.each(['failure', 'cancelled'])('is red when any job ends in %s, asked for or not', (result) => {
    for (const klass of Object.keys(REQUIRED) as Klass[]) {
      for (const job of WATCHED.filter((name) => name !== 'classificar')) {
        const needs = { ...needsOf(klass), [job]: { result, outputs: {} } };
        expect(verdict(needs).ok, `${klass}/${job}`).toBe(false);
      }
    }
    expect(cli({ ...needsOf('completo'), playwright: { result, outputs: {} } })).toBe(1);
  });

  it('is red when a job the class asks for was skipped', () => {
    for (const klass of Object.keys(REQUIRED) as Klass[]) {
      for (const job of REQUIRED[klass].filter((name) => name !== 'classificar')) {
        const result = verdict({ ...needsOf(klass), [job]: { result: 'skipped', outputs: {} } });
        expect(result.ok, `${klass}/${job}`).toBe(false);
        expect(result.lines.join('\n')).toContain('a classe pede este job');
      }
    }
    expect(cli({ ...needsOf('portões'), portoes: { result: 'skipped', outputs: {} } })).toBe(1);
  });

  it('is red without a class: the classification failed, was skipped or gave something unknown', () => {
    for (const classifier of [
      { result: 'failure', outputs: {} },
      { result: 'cancelled', outputs: {} },
      { result: 'skipped', outputs: {} },
      { result: 'success', outputs: {} },
      { result: 'success', outputs: { classe: '' } },
      { result: 'success', outputs: { classe: 'tudo' } },
    ]) {
      expect(verdict({ ...needsOf('completo'), classificar: classifier }).ok, JSON.stringify(classifier)).toBe(false);
    }
    const without = needsOf('completo');
    delete without['classificar'];
    expect(verdict(without).ok).toBe(false);
    expect(cli(without)).toBe(1);
  });

  it('is red when ci.yml stopped waiting for a job, and when needs is unreadable', () => {
    const without = needsOf('leve');
    delete without['playwright'];
    expect(verdict(without)).toMatchObject({ ok: false, lines: ['playwright: ausente do needs do ci-ok'] });
    expect(cli('not json')).toBe(1);
  });

  it('is red for a job the class does not ask for that ran and failed, and green when it ran and passed', () => {
    expect(verdict({ ...needsOf('completo'), leve: { result: 'failure', outputs: {} } }).ok).toBe(false);
    expect(verdict({ ...needsOf('completo'), leve: { result: 'success', outputs: {} } }).ok).toBe(true);
  });
});
