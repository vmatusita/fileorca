// The alerts of the workflows (F8, decisions 14 and 15; DECISOES § 300 and § 301), read from the YAML itself: the job
// that tells Victor about a red CI in a Dependabot PR (trigger, condition, permissions, needs, no checkout, one issue per
// PR), and every issue the workflows open is assigned to the owner of the repository, so GitHub e-mails him.
// F9 (DECISOES § 323 to § 333): the jobs of the classes and the condition of each one, the ci-ok that sums them up and
// that the merge waits for, the guards against a PR from a fork, the history only where it is read, and the protections
// of § 154 in every Playwright part.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REQUIRED, WATCHED } from '../../scripts/ci/ci-ok.ts';
import { parseYaml, type YamlValue } from './lib/mini-yaml.ts';
import { workflowJobs, type Step } from './lib/merge-job.ts';

const CI = readFileSync('.github/workflows/ci.yml', 'utf8');
const POS_DEPLOY = readFileSync('.github/workflows/pos-deploy.yml', 'utf8');
const jobs = workflowJobs(CI);
const alert = jobs['alerta-dependabot'] ?? {};
const steps = (alert['steps'] ?? []) as { name?: string; uses?: string; run?: string }[];
const stepsOf = (job: string): Step[] => (jobs[job]?.['steps'] ?? []) as unknown as Step[];
const FROM_HERE = 'github.event.pull_request.head.repo.full_name == github.repository';
const CLASS_IS = (klass: string): string => `needs.classificar.outputs.classe == '${klass}'`;

/** Every `gh issue create` of a workflow text, with its title and whether it is assigned to the owner. */
function issueCreates(source: string): { title: string; assigned: boolean }[] {
  return [...source.matchAll(/gh issue create --title "([^"]+)"([^\n]*)/g)].map((match) => ({ title: match[1] ?? '', assigned: (match[2] ?? '').includes('--assignee "$OWNER"') }));
}

describe('the alert of a red CI in a Dependabot PR', () => {
  it('runs on the pull_request of the CI, after ci-ok and the merge job, only when one failed and the PR is from Dependabot in this repository', () => {
    const on = (parseYaml(CI) as Record<string, YamlValue>)['on'] as Record<string, { types: string[] }>;
    // F9 (decision 4; DECISOES § 326): `labeled` recomputes the class; unlabeled and converted_to_draft run nothing.
    expect(on['pull_request']?.types).toEqual(['opened', 'synchronize', 'reopened', 'ready_for_review', 'labeled']);
    expect(alert['needs']).toEqual(['ci-ok', 'merge']);
    expect(alert['if']).toBe(`failure() && github.event.pull_request.user.login == 'dependabot[bot]' && ${FROM_HERE}`);
  });

  it('may write issues and comments, and nothing else; the workflow stays read-only', () => {
    expect(alert['permissions']).toEqual({ issues: 'write', 'pull-requests': 'write' });
    expect((parseYaml(CI) as Record<string, YamlValue>)['permissions']).toEqual({ contents: 'read' });
  });

  it('checks out nothing and runs only the gh CLI, with the number of the PR, never its title or branch', () => {
    expect(steps.some((step) => step.uses !== undefined)).toBe(false);
    const run = steps.map((step) => step.run ?? '').join('\n');
    expect(run).toContain('title="CI vermelho na PR #$PR do Dependabot"');
    expect(run).not.toMatch(/github\.event\.pull_request\.(?:title|head\.ref|body)/);
    expect(CI.slice(CI.indexOf('  alerta-dependabot:'))).not.toMatch(/pull_request\.(?:title|body)|head\.ref/);
  });

  it('opens one issue per PR and comments on it again on the next red run, and comments on the PR', () => {
    const run = steps.map((step) => step.run ?? '').join('\n');
    expect(run).toContain('gh issue list --state open');
    expect(run).toContain('gh issue comment "$issue"');
    expect(run).toContain('gh issue create --title "$title" --assignee "$OWNER"');
    expect(run).toContain('gh pr comment "$PR"');
  });
});

describe('the issues of the workflows', () => {
  it('are all assigned to the owner of the repository, so GitHub e-mails him', () => {
    const creates = [...issueCreates(CI), ...issueCreates(POS_DEPLOY)];
    expect(creates.map((create) => create.title)).toEqual([
      'Merge da PR #$PR sem commit de merge legível',
      'Merge automático falhou na PR #$PR',
      '$title',
      'Pós-deploy falhou para ${COMMIT:0:7}',
    ]);
    for (const create of creates) expect(create.assigned, create.title).toBe(true);
    expect(CI).toContain('OWNER: ${{ github.repository_owner }}');
    expect(POS_DEPLOY).toContain('OWNER: ${{ github.repository_owner }}');
  });
});

// F9, decisions 2, 4 and 5 (DECISOES § 324, § 326 and § 327).
describe('the classes of the CI and the ci-ok', () => {
  it('runs each job only for the classes that ask for it, by `if` and never by paths', () => {
    expect(jobs['classificar']?.['if']).toBeUndefined();
    expect(jobs['leve']?.['if']).toBe(CLASS_IS('leve'));
    expect(jobs['build']?.['if']).toBe(`${CLASS_IS('portões')} || ${CLASS_IS('completo')}`);
    expect(jobs['portoes']?.['if']).toBe(`${CLASS_IS('portões')} || ${CLASS_IS('completo')}`);
    expect(jobs['lighthouse']?.['if']).toBe(CLASS_IS('completo'));
    expect(jobs['playwright']?.['if']).toBe(CLASS_IS('completo'));
    for (const job of ['portoes', 'lighthouse', 'playwright']) expect(jobs[job]?.['needs'], job).toEqual(['classificar', 'build']);
    for (const job of ['leve', 'build']) expect(jobs[job]?.['needs'], job).toBe('classificar');
    const on = (parseYaml(CI) as Record<string, Record<string, Record<string, YamlValue>>>)['on']?.['pull_request'] ?? {};
    expect(Object.keys(on)).toEqual(['types']);
    expect(CI).not.toMatch(/^\s+paths(?:-ignore)?:/m);
    // Every class the jobs test is a class of the classification and of ci-ok.
    const classes = [...CI.matchAll(/needs\.classificar\.outputs\.classe == '([^']+)'/g)].map((match) => match[1]);
    expect([...new Set(classes)].sort()).toEqual(Object.keys(REQUIRED).sort());
  });

  it('has the ci-ok job: no matrix, the name ci-ok, always run, waiting for every job of every class', () => {
    const ok = jobs['ci-ok'] ?? {};
    expect(ok['name']).toBe('ci-ok');
    expect(ok['strategy']).toBeUndefined();
    expect(ok['if']).toBe('always()');
    expect(ok['needs']).toEqual(WATCHED);
    expect(Object.keys(jobs).filter((job) => !['ci-ok', 'merge', 'alerta-dependabot', 'pos-deploy'].includes(job))).toEqual(WATCHED);
    const run = stepsOf('ci-ok').map((step) => step.run ?? '').join('\n');
    expect(stepsOf('ci-ok').find((step) => step.run)?.env?.['NEEDS']).toBe('${{ toJSON(needs) }}');
    expect(run).toContain('git show "$BASE_SHA:scripts/ci/ci-ok.ts" > "$RUNNER_TEMP/ci/ci-ok.ts"');
    expect(run).toContain('node "$RUNNER_TEMP/ci/ci-ok.ts" "$RUNNER_TEMP/needs.json"');
    // The fetch of the base never falls back to the copy of the PR when it fails.
    expect(run).toMatch(/^git fetch --no-tags --depth=1 origin "\$BASE_SHA"$/m);
  });

  it('merges only after a green ci-ok, never a draft and never a fork, and the alert waits for both', () => {
    expect(jobs['merge']?.['needs']).toBe('ci-ok');
    expect(jobs['merge']?.['if']).toBe(`github.event.pull_request.draft == false && ${FROM_HERE}`);
    expect(jobs['pos-deploy']?.['needs']).toBe('merge');
    expect(jobs['pos-deploy']?.['if']).toBe(`needs.merge.outputs.merged == 'true' && ${FROM_HERE}`);
  });

  it('reads the classification from the base branch, with the copy of the PR only while the base has none', () => {
    const run = stepsOf('classificar').map((step) => step.run ?? '').join('\n');
    expect(run).toContain('git show "$BASE_SHA:scripts/ci/classificar.ts" > "$RUNNER_TEMP/ci/classificar.ts"');
    expect(run).toContain('git -c core.quotePath=false diff --no-renames --name-only "$BASE_SHA...$HEAD_SHA" > "$RUNNER_TEMP/files.txt"');
    expect(jobs['classificar']?.['outputs']).toEqual({ classe: '${{ steps.classify.outputs.classe }}' });
  });

  it('builds once, in the build job, and every other part downloads that build', () => {
    const builds = Object.keys(jobs).filter((job) => stepsOf(job).some((step) => /pnpm (?:run )?build\b|pnpm verificar --build/.test(step.run ?? '')));
    expect(builds).toEqual(['build']);
    const upload = stepsOf('build').find((step) => step.uses?.startsWith('actions/upload-artifact@'));
    expect(upload?.with).toMatchObject({ name: 'site', 'include-hidden-files': true, 'retention-days': 1, 'if-no-files-found': 'error' });
    expect(String(upload?.with?.['path'])).toContain('.cache/bundle-modules.json');
    for (const job of ['portoes', 'lighthouse', 'playwright']) {
      const list = stepsOf(job);
      const download = list.findIndex((step) => step.uses?.startsWith('actions/download-artifact@'));
      expect(download, job).toBeGreaterThan(-1);
      expect(list[download]?.with, job).toEqual({ name: 'site', path: '.' });
      expect(list.find((step) => (step.run ?? '').includes('pnpm verificar'))?.run, job).toContain('--dist-pronto');
      // The cache of .cache/ (tools) comes back before the artifact, so the bundle record of the build wins.
      const cache = list.findIndex((step) => step.uses?.startsWith('actions/cache@'));
      if (cache >= 0) expect(cache, job).toBeLessThan(download);
    }
  });
});

// F9, decision 6 (DECISOES § 328): the whole history only where it is read.
describe('the history of each checkout', () => {
  it('fetches the whole history only for lint:texto, the Vitest, the classification and the merge', () => {
    const deep = Object.keys(jobs).filter((job) => stepsOf(job).some((step) => step.uses?.startsWith('actions/checkout@') && step.with?.['fetch-depth'] === 0));
    expect(deep.sort()).toEqual(['classificar', 'leve', 'merge', 'portoes']);
  });

  it('keeps the credentials of the checkout only where a job fetches with them (ci-ok fetches the base commit)', () => {
    const kept = Object.keys(jobs).filter((job) => stepsOf(job).some((step) => step.uses?.startsWith('actions/checkout@') && step.with?.['persist-credentials'] !== false));
    expect(kept).toEqual(['ci-ok']);
  });
});

// F9, decision 9 (DECISOES § 333): nothing runs code of a fork with secrets or write permissions.
describe('a PR from a fork', () => {
  it('never reaches pull_request_target, in any workflow', () => {
    for (const name of readdirSync('.github/workflows')) {
      expect(readFileSync(`.github/workflows/${name}`, 'utf8'), name).not.toMatch(/pull_request_target/);
    }
  });

  it('never runs the jobs that write: merge, alerta-dependabot and pos-deploy, in ci.yml and in pos-deploy.yml', () => {
    const writers = Object.entries(jobs).filter(([, job]) => {
      const permissions = job['permissions'];
      return permissions && typeof permissions === 'object' && Object.values(permissions).includes('write');
    });
    expect(writers.map(([name]) => name).sort()).toEqual(['alerta-dependabot', 'merge', 'pos-deploy']);
    for (const [name, job] of writers) expect(String(job['if']), name).toContain(FROM_HERE);
    const conferir = workflowJobs(POS_DEPLOY)['conferir'] ?? {};
    expect(conferir['if']).toBe(`github.event_name != 'pull_request' || ${FROM_HERE}`);
  });
});

// § 154, kept by the F9 (decision 3): every Playwright part turns core dumps off before pnpm verificar, keeps ulimit -c 0
// in its step and ends with the state of the disk and of the core dumps, whatever happened.
describe('the protections of § 154 in every Playwright part', () => {
  it('keeps the core_pattern off, the ulimit and the final step', () => {
    const list = stepsOf('playwright');
    const off = list.findIndex((step) => step.name === 'Core dumps off');
    const verificar = list.findIndex((step) => (step.run ?? '').includes('pnpm verificar'));
    const disk = list.findIndex((step) => step.name === 'Disk and core dumps');
    expect(off).toBeGreaterThan(-1);
    expect(off).toBeLessThan(verificar);
    expect(list[off]?.run).toContain("sudo -n sysctl -w kernel.core_pattern='|/bin/false'");
    expect(list[verificar]?.run).toMatch(/^ulimit -c 0\npnpm verificar /);
    expect(disk).toBeGreaterThan(verificar);
    expect(list[disk]?.if).toBe('always()');
    expect(list[disk]?.run).toContain('df -h / /tmp');
    expect(list[disk]?.run).toContain('echo "core_pattern: $(cat /proc/sys/kernel/core_pattern)"');
  });

  it('installs the browser of the lockfile in the background and waits for it before the tests', () => {
    for (const job of ['playwright', 'lighthouse']) {
      const list = stepsOf(job);
      const start = list.findIndex((step) => step.name === 'Browser in the background');
      const wait = list.findIndex((step) => step.name === 'Wait for the browser');
      const verificar = list.findIndex((step) => (step.run ?? '').includes('pnpm verificar'));
      expect(start, job).toBeGreaterThan(-1);
      expect(start, job).toBeLessThan(wait);
      expect(wait, job).toBeLessThan(verificar);
      expect(list[start]?.run, job).toContain('pnpm-lock.yaml');
      expect(list[start]?.run, job).toContain('install --with-deps');
      expect(list[wait]?.run, job).toContain('test "$(cat "$RUNNER_TEMP/navegador/status" 2>/dev/null)" = 0');
    }
  });
});
