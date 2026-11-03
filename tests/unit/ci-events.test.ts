// The class of each execution proved with example events (F9, decision 4; DECISOES § 326), the way merge-events.test.ts
// proves the merge rule. Each fixture of fixtures/ci-events/ is a pull_request payload in GitHub's shape (only the fields
// the job reads), the files the job's git diff lists and the class it must give. The test takes it through the
// classificar job of .github/workflows/ci.yml as written there: the env of the Classify step rendered from the event, the
// git diff (run for real, in a scratch repository, for the diff the job cannot read), the jq that writes pr.json (run for
// real wherever jq exists, as on the Ubuntu runner) and the CLI of scripts/ci/classificar.ts writing to GITHUB_OUTPUT.
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { classify, isDocumentation } from '../../scripts/ci/classificar.ts';
import { command, jobSteps, readOutputs, render, REPOSITORY, stepNamed } from './lib/merge-job.ts';

interface CiEventFixture {
  description: string;
  event: { action: string; number: number; pull_request: Record<string, unknown> };
  /** Paths the git diff of the job lists, or a diff the job cannot read (the test runs the job's own block). */
  files: string[] | { unreadable: true };
  expected: { classe: string; motivo: string };
}

const DIR = 'fixtures/ci-events';
const CI = readFileSync('.github/workflows/ci.yml', 'utf8');
const step = stepNamed(jobSteps(CI, 'classificar'), 'Classify');
const run = step.run ?? '';
const scratch = mkdtempSync(join(tmpdir(), 'fo-ci-events-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

// The jq and the call of the CLI of the job, kept here so a change to them in ci.yml is seen on machines without jq. The
// call must not change once it is on main: the job runs the script of the base (the same rule as § 297).
const JQ_ON_MAIN = [
  'jq -n --argjson draft "$DRAFT" --argjson labels "$LABELS" --rawfile files "$RUNNER_TEMP/files.txt" \\',
  `'{isDraft: $draft, labels: $labels, files: ($files | split("\\n") | map(select(length > 0)) | map({path: .}))}' \\`,
  '> "$RUNNER_TEMP/pr.json"',
].join('\n');
const CLI_ON_MAIN = 'node "$RUNNER_TEMP/ci/classificar.ts" "$RUNNER_TEMP/pr.json"';
const hasJq = spawnSync('jq', ['--version'], { encoding: 'utf8' }).status === 0;
const hasBash = spawnSync('bash', ['--version'], { encoding: 'utf8' }).status === 0;

const fixtures = readdirSync(DIR)
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => ({ name: name.replace(/\.json$/, ''), ...(JSON.parse(readFileSync(join(DIR, name), 'utf8')) as CiEventFixture) }));

/** The block of the job that writes files.txt, from the `if ! git` line to its `fi`. */
function diffBlock(): string {
  const lines = run.split('\n');
  const first = lines.findIndex((line) => line.startsWith('if ! git -c core.quotePath=false diff'));
  const last = lines.findIndex((line, i) => i > first && line === 'fi');
  if (first < 0 || last < 0) throw new Error('ci.yml: o bloco do git diff não foi achado no Classify');
  return lines.slice(first, last + 1).join('\n');
}

function git(cwd: string, args: string[]): void {
  execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'user.name=fo', '-c', 'user.email=fo@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' });
}

describe('the classificar job of ci.yml, as the fixtures read it', () => {
  it('keeps the call of the CLI, the git diff and the jq', () => {
    expect(command(run, 'node ')).toBe(CLI_ON_MAIN);
    expect(command(run, 'jq -n')).toBe(JQ_ON_MAIN);
    expect(diffBlock()).toContain('git -c core.quotePath=false diff --no-renames --name-only "$BASE_SHA...$HEAD_SHA" > "$RUNNER_TEMP/files.txt"');
    expect(diffBlock()).toContain(': > "$RUNNER_TEMP/files.txt"');
    expect(run).toContain('git show "$BASE_SHA:scripts/ci/classificar.ts" > "$RUNNER_TEMP/ci/classificar.ts"');
    expect(step.id).toBe('classify');
  });

  it('renders the env of Classify from the event', () => {
    expect(step.env).toEqual({
      BASE_SHA: '${{ github.event.pull_request.base.sha }}',
      HEAD_SHA: '${{ github.event.pull_request.head.sha }}',
      DRAFT: '${{ github.event.pull_request.draft }}',
      LABELS: '${{ toJSON(github.event.pull_request.labels.*.name) }}',
    });
  });

  it('runs jq and bash where they exist (the Ubuntu runner always has them)', () => {
    if (process.platform === 'linux') {
      expect(hasJq, 'jq tem de existir no runner do CI').toBe(true);
      expect(hasBash, 'bash tem de existir no runner do CI').toBe(true);
    }
  });

  it('has an event for each row of the table of classes and for each extra case', () => {
    const names = fixtures.map((fixture) => fixture.name);
    for (const name of [
      'rascunho-sem-rotulo-codigo',
      'rascunho-sem-rotulo-docs',
      'rascunho-com-ci-codigo',
      'rascunho-com-ci-docs',
      'pronta-codigo',
      'pronta-docs',
      'pronta-com-ci-docs',
      'fork-pronta-codigo',
      'fork-rascunho',
      'labeled-outro-rotulo',
      'ready-for-review',
      'reopened-docs',
      'misto-docs-e-codigo',
      'diff-vazio',
      'diff-ilegivel',
    ]) {
      expect(names).toContain(name);
    }
    expect(fixtures.find((fixture) => fixture.name === 'pronta-docs')?.expected.classe).toBe('portões');
    for (const action of ['opened', 'synchronize', 'reopened', 'ready_for_review', 'labeled']) {
      expect(fixtures.some((fixture) => fixture.event.action === action), action).toBe(true);
    }
  });
});

describe('the documentation that skips Playwright and Lighthouse', () => {
  it('is every file in docs/ but docs/design/ and docs/oli/, and the .md of the root', () => {
    for (const path of ['docs/OPERACAO.md', 'docs/relatorios/fase-09.md', 'docs/ops/ruleset-main.json', 'docs/prompts/prompt-fase-09.txt', 'README.md', 'CLAUDE.md', 'SECURITY.md', 'docs\\claude\\ci.md']) {
      expect(isDocumentation(path), path).toBe(true);
    }
    for (const path of ['docs/design/tokens.json', 'docs/oli/folha.html', 'LICENSE', 'fixtures/ORIGEM.md', 'src/pages/index.astro', 'package.json', '.github/workflows/ci.yml', 'docs', 'documentos/x.md']) {
      expect(isDocumentation(path), path).toBe(false);
    }
  });

  it('turns a labelled draft or a ready PR into portões only when every file is documentation', () => {
    expect(classify({ isDraft: false, labels: [], files: ['docs/a.md', 'src/a.ts'] }).klass).toBe('completo');
    expect(classify({ isDraft: true, labels: ['ci'], files: ['docs/a.md'] }).klass).toBe('portões');
    expect(classify({ isDraft: true, labels: ['CI'], files: ['src/a.ts'] }).klass).toBe('leve');
    expect(classify({ isDraft: false, labels: [], files: null }).klass).toBe('completo');
  });
});

describe.each(fixtures)('ci event $name', (fixture) => {
  it(`gives the class: ${fixture.description}`, () => {
    const dir = join(scratch, fixture.name);
    mkdirSync(join(dir, 'ci'), { recursive: true });
    const context = { github: { event: fixture.event, ...REPOSITORY } };
    const env = Object.fromEntries(Object.entries(step.env ?? {}).map(([key, value]) => [key, render(value, context)])) as Record<'BASE_SHA' | 'HEAD_SHA' | 'DRAFT' | 'LABELS', string>;

    if (Array.isArray(fixture.files)) {
      writeFileSync(join(dir, 'files.txt'), fixture.files.map((path) => `${path}\n`).join(''));
    } else if (hasBash) {
      // The job's own block, against commits the scratch repository does not have: git diff fails and files.txt empties.
      const repo = join(dir, 'repo');
      mkdirSync(repo, { recursive: true });
      git(repo, ['init', '-q', '-b', 'main']);
      writeFileSync(join(repo, 'README.md'), 'x\n');
      git(repo, ['add', '-A']);
      git(repo, ['commit', '-q', '-m', 'base']);
      writeFileSync(join(dir, 'files.txt'), 'stale\n');
      const result = spawnSync('bash', ['-e', '-c', diffBlock()], { cwd: repo, env: { ...process.env, ...env, RUNNER_TEMP: dir }, encoding: 'utf8' });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain('::warning::git diff failed');
      expect(readFileSync(join(dir, 'files.txt'), 'utf8')).toBe('');
    } else {
      writeFileSync(join(dir, 'files.txt'), '');
    }
    const filesTxt = readFileSync(join(dir, 'files.txt'), 'utf8');

    const expectedJson = {
      isDraft: JSON.parse(env.DRAFT) as boolean,
      labels: JSON.parse(env.LABELS) as string[],
      files: filesTxt.split('\n').filter((path) => path.length > 0).map((path) => ({ path })),
    };
    if (hasJq) {
      const result = spawnSync('bash', ['-e', '-c', command(run, 'jq -n')], { env: { ...process.env, ...env, RUNNER_TEMP: dir }, encoding: 'utf8' });
      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
      expect(JSON.parse(readFileSync(join(dir, 'pr.json'), 'utf8'))).toEqual(expectedJson);
    } else {
      writeFileSync(join(dir, 'pr.json'), JSON.stringify(expectedJson));
    }

    copyFileSync('scripts/ci/classificar.ts', join(dir, 'ci', 'classificar.ts'));
    const output = join(dir, 'github-output.txt');
    writeFileSync(output, '');
    const stdout = execFileSync(process.execPath, [join(dir, 'ci', 'classificar.ts'), join(dir, 'pr.json')], { env: { ...process.env, GITHUB_OUTPUT: output }, encoding: 'utf8' });
    expect(readOutputs(readFileSync(output, 'utf8'))).toEqual(fixture.expected);
    // The line the ci:custo reads to tell the class of an execution.
    expect(stdout).toContain(`classificar: classe ${fixture.expected.classe} - `);
  });
});
