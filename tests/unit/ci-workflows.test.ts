// The alerts of the workflows (F8, decisions 14 and 15; DECISOES § 300 and § 301), read from the YAML itself: the job
// that tells Victor about a red CI in a Dependabot PR (trigger, condition, permissions, needs, no checkout, one issue per
// PR), and every issue the workflows open is assigned to the owner of the repository, so GitHub e-mails him.
// F9 (DECISOES § 323 to § 333): the jobs of the classes and the condition of each one, the ci-ok that sums them up and
// that the merge waits for, the guards against a PR from a fork, the history only where it is read, and the protections
// of § 154 in every Playwright part.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
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
const hasBash = spawnSync('bash', ['--version'], { encoding: 'utf8' }).status === 0;
type Jobs = ReturnType<typeof workflowJobs>;

/** The lines of the run of the Verdict step of ci-ok. */
function verdictLines(): string[] {
  return (stepsOf('ci-ok').find((step) => step.name === 'Verdict')?.run ?? '').trim().split('\n');
}

/** The jobs whose needs reach both the leve and the build jobs, whose classes exclude each other. */
function afterExclusiveClasses(all: Jobs): string[] {
  const ancestors = (job: string, seen = new Set<string>()): Set<string> => {
    const needs = all[job]?.['needs'];
    for (const parent of Array.isArray(needs) ? needs : needs ? [needs] : []) {
      if (seen.has(String(parent))) continue;
      seen.add(String(parent));
      ancestors(String(parent), seen);
    }
    return seen;
  };
  return Object.keys(all)
    .filter((job) => ancestors(job).has('leve') && ancestors(job).has('build'))
    .sort();
}

/**
 * Those jobs whose if has no explicit status function (always(), cancelled() as in !cancelled(), or failure()), or that
 * call success() anywhere: success() written out looks at every ancestor too, so it skips the job like the implicit one
 * (the second pass of the review of the F9, R2-7).
 */
function withoutStatusFunction(all: Jobs): string[] {
  return afterExclusiveClasses(all).filter((job) => {
    const condition = String(all[job]?.['if']);
    return !/\b(?:always|cancelled|failure)\(\)/.test(condition) || /\bsuccess\(\)/.test(condition);
  });
}

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
    // The review of the F9 (A-1): the ci-ok of a cancelled run ends red, because it always runs; a cancelled run is not
    // a red CI, so the alert never fires for one.
    expect(alert['if']).toBe(`failure() && !cancelled() && github.event.pull_request.user.login == 'dependabot[bot]' && ${FROM_HERE}`);
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

  // The review of the F9 (A-2): the class comes from the payload of the event, so ci-ok reads the draft state of the PR
  // as it is now and hands it to the script, which makes a leve run of a ready PR red. Reading a PR asks for
  // pull-requests: read; the job writes nothing.
  it('reads the draft state of the PR as it is now, with a token that only reads', () => {
    expect(jobs['ci-ok']?.['permissions']).toEqual({ contents: 'read', 'pull-requests': 'read' });
    const verdictStep = stepsOf('ci-ok').find((step) => step.name === 'Verdict');
    expect(verdictStep?.env).toEqual({
      NEEDS: '${{ toJSON(needs) }}',
      BASE_SHA: '${{ github.event.pull_request.base.sha }}',
      GH_TOKEN: '${{ github.token }}',
      GH_REPO: '${{ github.repository }}',
      PR: '${{ github.event.pull_request.number }}',
    });
    const lines = (verdictStep?.run ?? '').trim().split('\n');
    // The assignment alone, so a failing gh api fails the step (export VAR=$(…) would hide its status).
    const read = lines.indexOf('PR_DRAFT_NOW=$(gh api "repos/$GH_REPO/pulls/$PR" --jq .draft)');
    expect(read).toBeGreaterThan(-1);
    expect(lines[read + 1]).toBe('export PR_DRAFT_NOW');
    expect(lines.findIndex((line) => line.startsWith('node "$RUNNER_TEMP/ci/ci-ok.ts"'))).toBe(read + 2);
  });

  // The review of the F9 (A-4): the default shell of a run step is `bash -e {0}`, without pipefail. The step turns
  // pipefail on and is green only when the output has the line of the green verdict, so a script that never reaches
  // its verdict (an older Node from the .node-version of the PR, without import.meta.main) fails the step.
  it('is green only when the output of the script says ci-ok: verde', () => {
    expect(jobs['ci-ok']?.['defaults']).toBeUndefined();
    expect((parseYaml(CI) as Record<string, YamlValue>)['defaults']).toBeUndefined();
    const lines = verdictLines();
    expect(lines[0]).toBe('set -o pipefail');
    expect(lines.slice(-2)).toEqual([
      'node "$RUNNER_TEMP/ci/ci-ok.ts" "$RUNNER_TEMP/needs.json" | tee "$RUNNER_TEMP/ci-ok.log"',
      "grep -qx 'ci-ok: verde' \"$RUNNER_TEMP/ci-ok.log\"",
    ]);
  });

  it('fails the step, run in bash -e as GitHub runs it, when the script says nothing, says red or fails', () => {
    if (process.platform === 'linux') expect(hasBash, 'bash tem de existir no runner do CI').toBe(true);
    if (!hasBash) return;
    const tail = ['set -o pipefail', ...verdictLines().slice(-2)].join('\n');
    const dir = mkdtempSync(join(tmpdir(), 'fo-ci-ok-step-'));
    try {
      mkdirSync(join(dir, 'ci'));
      const green = Object.fromEntries(WATCHED.map((job) => [job, { result: REQUIRED.completo.includes(job) ? 'success' : 'skipped', outputs: job === 'classificar' ? { classe: 'completo' } : {} }]));
      writeFileSync(join(dir, 'needs.json'), JSON.stringify(green));
      const step = (script: string, draftNow: string): number => {
        writeFileSync(join(dir, 'ci', 'ci-ok.ts'), script);
        const env = { ...process.env, RUNNER_TEMP: dir, PR_DRAFT_NOW: draftNow, PATH: `${dirname(process.execPath)}${delimiter}${process.env['PATH'] ?? ''}` };
        return spawnSync('bash', ['-e', '-c', tail], { env, encoding: 'utf8' }).status ?? 1;
      };
      const real = readFileSync('scripts/ci/ci-ok.ts', 'utf8');
      expect(step(real, 'false'), 'the real script, a green complete run').toBe(0);
      expect(step(real, 'maybe'), 'the real script without a valid PR_DRAFT_NOW').not.toBe(0);
      expect(step('export {};\n', 'false'), 'a script that never reaches its verdict and exits 0').not.toBe(0);
      expect(step("console.log('ci-ok: vermelho');\n", 'false'), 'a script that says red and exits 0').not.toBe(0);
      expect(step("console.log('ci-ok: verde');\nprocess.exit(1);\n", 'false'), 'a script that says green and exits 1').not.toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('merges only after a green ci-ok, never a draft and never a fork, and the alert waits for both', () => {
    expect(jobs['merge']?.['needs']).toBe('ci-ok');
    expect(jobs['merge']?.['if']).toBe(`needs.ci-ok.result == 'success' && !cancelled() && github.event.pull_request.draft == false && ${FROM_HERE}`);
    expect(jobs['pos-deploy']?.['needs']).toBe('merge');
    expect(jobs['pos-deploy']?.['if']).toBe(`needs.merge.result == 'success' && !cancelled() && needs.merge.outputs.merged == 'true' && ${FROM_HERE}`);
  });

  // The first complete run of the F9 skipped the merge: the implicit success() of an if also looks at the jobs before the
  // ones in needs, and the leve job is skipped in every complete run (DECISOES § 327). A job after jobs of classes that
  // exclude each other needs an explicit status function, and success() written out is the same as the implicit one,
  // so it does not count (the review of the F9, D-1).
  it('gives an explicit status function to every job after jobs of classes that exclude each other', () => {
    expect(afterExclusiveClasses(jobs)).toEqual(['alerta-dependabot', 'ci-ok', 'merge', 'pos-deploy']);
    expect(withoutStatusFunction(jobs)).toEqual([]);
  });

  it('flags an if with success() in place of the status function (a control that fails)', () => {
    const merge = "needs.ci-ok.result == 'success' && !cancelled() && github.event.pull_request.draft == false";
    expect(CI).toContain(merge);
    const mutated = workflowJobs(CI.replace(merge, "success() && needs.ci-ok.result == 'success' && github.event.pull_request.draft == false"));
    expect(withoutStatusFunction(mutated)).toEqual(['merge']);
    const removed = workflowJobs(CI.replace(merge, "needs.ci-ok.result == 'success' && github.event.pull_request.draft == false"));
    expect(withoutStatusFunction(removed)).toEqual(['merge']);
    const both = workflowJobs(CI.replace(merge, "success() && needs.ci-ok.result == 'success' && !cancelled() && github.event.pull_request.draft == false"));
    expect(withoutStatusFunction(both)).toEqual(['merge']);
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
      if (cache >= 0) {
        expect(cache, job).toBeLessThan(download);
        // Only the folders of the pinned tools: never the whole .cache/, with the record and the builds of a past run.
        const paths = String(list[cache]?.with?.['path']).trim().split('\n');
        expect(paths.length, job).toBeGreaterThan(0);
        for (const path of paths) expect(path, job).toMatch(/^\.cache\/[a-z]+-\*$/);
      }
    }
  });
});

// F9, decision 6 (DECISOES § 328): the whole history only where it is read.
describe('the history of each checkout', () => {
  it('fetches the whole history only for lint:texto, the Vitest, the classification and the merge', () => {
    const deep = Object.keys(jobs).filter((job) => stepsOf(job).some((step) => step.uses?.startsWith('actions/checkout@') && step.with?.['fetch-depth'] === 0));
    expect(deep.sort()).toEqual(['classificar', 'leve', 'merge', 'portoes']);
  });

  // The final run of the F9 spent up to 132 s in the shallow checkout of the whole tree, 392 MB of it the screenshots of
  // docs/relatorios/ (DECISOES § 325). The jobs that only build, serve and test the site check out without them.
  it('checks out the build, Lighthouse and Playwright jobs without docs/relatorios/, which nothing they run reads', () => {
    const sparse = Object.keys(jobs).filter((job) => stepsOf(job).some((step) => step.uses?.startsWith('actions/checkout@') && step.with?.['sparse-checkout'] !== undefined));
    expect(sparse).toEqual(['build', 'lighthouse', 'playwright']);
    for (const job of sparse) {
      const checkout = stepsOf(job).find((step) => step.uses?.startsWith('actions/checkout@'));
      expect(String(checkout?.with?.['sparse-checkout']).trim().split('\n'), job).toEqual(['/*', '!/docs/relatorios/']);
      expect(checkout?.with?.['sparse-checkout-cone-mode'], job).toBe(false);
    }
    // Outside comments, nothing the build, the Playwright suite or Lighthouse runs names docs/relatorios/.
    const roots = ['src', 'tests/e2e', 'scripts/lib', 'scripts/gates/lighthouse.ts', 'scripts/serve-dist.ts', 'scripts/verificar.ts', 'astro.config.ts', 'playwright.config.ts', 'lighthouserc.json'];
    const files = roots.flatMap((root) => (statSync(root).isDirectory() ? readdirSync(root, { recursive: true, encoding: 'utf8' }).map((name) => join(root, name)) : [root])).filter((path) => statSync(path).isFile());
    const code = files.flatMap((path) => readFileSync(path, 'utf8').split('\n').filter((line) => line.includes('docs/relatorios') && !/^\s*(?:\/\/|\*|\/\*)/.test(line)).map((line) => `${path}: ${line.trim()}`));
    expect(code).toEqual([]);
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
      expect(list[start]?.run, job).toContain('install-deps "$2"');
      expect(list[start]?.run, job).toContain('install "$2"');
      expect(list[wait]?.run, job).toContain('if [ "$(cat "$RUNNER_TEMP/navegador/status" 2>/dev/null)" != 0 ]; then');
    }
  });
});
