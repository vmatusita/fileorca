// The verdict of the ci-ok job (F9, decision 5; DECISOES § 327), on the shape of `toJSON(needs)`: green only when the
// class came out and every job ended in success, or in skipped when the class does not ask for it; red on failure, on
// cancelled, on a skipped job the class asks for, and without a class. The CLI is run too, as the job runs it.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { REQUIRED, verdict, WATCHED, type Klass, type NeedResult } from '../../scripts/ci/ci-ok.ts';

const scratch = mkdtempSync(join(tmpdir(), 'fo-ci-ok-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** The needs of an execution of the class: its jobs in success, the others skipped, as the ifs of ci.yml make them. */
function needsOf(klass: Klass): Record<string, NeedResult> {
  return Object.fromEntries(
    WATCHED.map((job) => [job, { result: REQUIRED[klass].includes(job) ? 'success' : 'skipped', outputs: job === 'classificar' ? { classe: klass } : {} }]),
  );
}

function cli(needs: unknown): number {
  const path = join(scratch, `needs-${Math.round(performance.now() * 1000)}.json`);
  writeFileSync(path, typeof needs === 'string' ? needs : JSON.stringify(needs));
  try {
    execFileSync(process.execPath, ['scripts/ci/ci-ok.ts', path], { encoding: 'utf8', stdio: 'pipe' });
    return 0;
  } catch (error) {
    return (error as { status?: number }).status ?? 1;
  }
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
    expect(cli(needsOf(klass))).toBe(0);
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
