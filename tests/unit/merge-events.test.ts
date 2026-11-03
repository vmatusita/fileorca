// The merge rule proved with example events (F8, decision 13; DECISOES § 297). Each fixture of fixtures/merge-events/
// is a pull_request payload in GitHub's shape (only the fields the job reads), the files the job's git diff lists and
// the outputs of dependabot/fetch-metadata. The test takes it through the merge job of .github/workflows/ci.yml as
// written there: the env of the Decide step rendered from the event, the git diff (replayed for the rename case),
// the jq that writes pr.json (run for real wherever jq exists, as on the Ubuntu runner) and the CLI of
// scripts/ci/pode-mesclar.ts writing merge, comment and reason to GITHUB_OUTPUT.
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { command, mergeSteps, prJsonLikeJq, readOutputs, render, stepNamed, type MergeEventFixture } from './lib/merge-job.ts';

const DIR = 'fixtures/merge-events';
const CI = readFileSync('.github/workflows/ci.yml', 'utf8');
const steps = mergeSteps(CI);
const decideStep = stepNamed(steps, 'Decide');
const metadataStep = stepNamed(steps, 'Dependabot metadata');
const run = decideStep.run ?? '';
const scratch = mkdtempSync(join(tmpdir(), 'fo-merge-events-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

// The jq of the job, kept here so a change to it in ci.yml is seen on machines without jq (Windows).
const JQ_ON_MAIN = [
  'jq -n --arg head "$HEAD_REF" --arg author "$AUTHOR" --argjson draft "$DRAFT" \\',
  '--rawfile files "$RUNNER_TEMP/files.txt" \\',
  `'{headRefName: $head, isDraft: $draft, author: {login: $author}, files: ($files | split("\\n") | map(select(length > 0)) | map({path: .}))}' \\`,
  '> "$RUNNER_TEMP/pr.json"',
].join('\n');
// The call of the CLI on main. It must not change with this PR: the job runs the script of the base (DECISOES § 297).
const CLI_ON_MAIN = 'node "$RUNNER_TEMP/ci/pode-mesclar.ts" "$RUNNER_TEMP/pr.json" "$UPDATE_TYPE"';
const DIFF_ON_MAIN = 'git -c core.quotePath=false diff --no-renames --name-only "$BASE_SHA...$HEAD_SHA" > "$RUNNER_TEMP/files.txt"';

const jqVersion = spawnSync('jq', ['--version'], { encoding: 'utf8' });
const hasJq = jqVersion.status === 0;

const fixtures = readdirSync(DIR)
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => ({ name: name.replace(/\.json$/, ''), ...(JSON.parse(readFileSync(join(DIR, name), 'utf8')) as MergeEventFixture) }));

function git(cwd: string, args: string[]): string {
  return execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'user.name=fo', '-c', 'user.email=fo@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' }).trim();
}

/** Replays a rename in a scratch repository and runs the job's git diff between the two commits. */
function filesOfRename([from, to]: [string, string], dir: string): string {
  mkdirSync(dir, { recursive: true });
  git(dir, ['init', '-q', '-b', 'main']);
  mkdirSync(join(dir, from, '..'), { recursive: true });
  writeFileSync(join(dir, from), 'name: old\n');
  writeFileSync(join(dir, 'README.md'), 'x\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'base']);
  const base = git(dir, ['rev-parse', 'HEAD']);
  mkdirSync(join(dir, to, '..'), { recursive: true });
  git(dir, ['mv', from, to]);
  git(dir, ['commit', '-q', '-m', 'rename']);
  const head = git(dir, ['rev-parse', 'HEAD']);
  const diff = command(run, 'git -c core.quotePath=false diff');
  const args = diff
    .replace(/^git /, '')
    .replace(/\s*>.*$/, '')
    .replace('"$BASE_SHA...$HEAD_SHA"', `${base}...${head}`)
    .split(/\s+/);
  return `${execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()}\n`;
}

describe('the merge job of ci.yml, as the fixtures read it', () => {
  it('keeps the call of the CLI, the git diff and the jq of main', () => {
    expect(command(run, 'node ')).toBe(CLI_ON_MAIN);
    expect(command(run, 'git -c core.quotePath=false diff')).toBe(DIFF_ON_MAIN);
    expect(command(run, 'jq -n')).toBe(JQ_ON_MAIN);
    expect(run).toContain('git show "$BASE_SHA:scripts/ci/pode-mesclar.ts" > "$RUNNER_TEMP/ci/pode-mesclar.ts"');
  });

  it('renders the env of Decide from the event and the metadata step only for Dependabot', () => {
    expect(decideStep.env).toEqual({
      HEAD_REF: '${{ github.event.pull_request.head.ref }}',
      AUTHOR: '${{ github.event.pull_request.user.login }}',
      DRAFT: '${{ github.event.pull_request.draft }}',
      UPDATE_TYPE: '${{ steps.dependabot.outputs.update-type }}',
    });
    expect(metadataStep.if).toBe("github.event.pull_request.user.login == 'dependabot[bot]'");
    expect(metadataStep.id).toBe('dependabot');
    expect(metadataStep.uses).toMatch(/^dependabot\/fetch-metadata@[0-9a-f]{40}$/);
  });

  it('runs jq where it exists (the Ubuntu runner always has it)', () => {
    if (process.platform === 'linux') expect(hasJq, 'jq tem de existir no runner do CI').toBe(true);
    else expect(hasJq || process.platform === 'win32').toBe(true);
  });

  it('has the cases of the F8 decision 13', () => {
    const names = fixtures.map((fixture) => fixture.name);
    for (const name of [
      'dependabot-patch',
      'dependabot-minor',
      'dependabot-group-minor',
      'dependabot-major',
      'dependabot-empty-type',
      'dependabot-outside-branch',
      'run-fase-08',
      'run-fase-05a',
      'run-ajuste-ci-disco',
      'other-branch',
      'draft',
      'run-touches-workflows',
      'run-renames-workflow-out',
      'run-dependabot-config',
    ]) {
      expect(names).toContain(name);
    }
    const group = fixtures.find((fixture) => fixture.name === 'dependabot-group-minor');
    expect(group?.fetchMetadata).toEqual({ 'update-type': 'version-update:semver-minor', 'dependency-group': 'npm-minor-patch' });
  });
});

describe.each(fixtures)('merge event $name', (fixture) => {
  it(`decides as expected: ${fixture.description}`, () => {
    const dir = join(scratch, fixture.name);
    mkdirSync(join(dir, 'ci'), { recursive: true });
    const isBot = fixture.event.pull_request['user'] && (fixture.event.pull_request['user'] as { login: string }).login === 'dependabot[bot]';
    // The metadata step runs only for Dependabot; otherwise its outputs are empty.
    expect(fixture.fetchMetadata === null).toBe(!isBot);
    const context = { github: { event: fixture.event }, steps: { dependabot: { outputs: isBot ? fixture.fetchMetadata : {} } } };
    const env = Object.fromEntries(Object.entries(decideStep.env ?? {}).map(([key, value]) => [key, render(value, context)])) as Record<
      'HEAD_REF' | 'AUTHOR' | 'DRAFT' | 'UPDATE_TYPE',
      string
    >;

    const filesTxt = Array.isArray(fixture.files) ? `${fixture.files.join('\n')}\n` : filesOfRename(fixture.files.rename, join(dir, 'repo'));
    if (!Array.isArray(fixture.files)) expect(filesTxt.trim().split('\n').sort()).toEqual([...fixture.files.rename].sort());
    writeFileSync(join(dir, 'files.txt'), filesTxt);

    const expectedJson = prJsonLikeJq(env, filesTxt);
    if (hasJq) {
      const result = spawnSync('bash', ['-e', '-c', command(run, 'jq -n')], {
        env: { ...process.env, ...env, RUNNER_TEMP: dir },
        encoding: 'utf8',
      });
      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
      expect(JSON.parse(readFileSync(join(dir, 'pr.json'), 'utf8'))).toEqual(expectedJson);
    } else {
      writeFileSync(join(dir, 'pr.json'), JSON.stringify(expectedJson));
    }

    copyFileSync('scripts/ci/pode-mesclar.ts', join(dir, 'ci', 'pode-mesclar.ts'));
    const output = join(dir, 'github-output.txt');
    writeFileSync(output, '');
    execFileSync(process.execPath, [join(dir, 'ci', 'pode-mesclar.ts'), join(dir, 'pr.json'), env.UPDATE_TYPE], {
      env: { ...process.env, GITHUB_OUTPUT: output },
      encoding: 'utf8',
    });
    expect(readOutputs(readFileSync(output, 'utf8'))).toEqual(fixture.expected);
  });
});
