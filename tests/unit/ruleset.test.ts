// The ruleset of the main branch that the owner imports when the repository goes public (docs/ops/ruleset-main.json;
// prompt F9, decision 11; DECISOES § 336). Same JSON as the body of POST /repos/{owner}/{repo}/rulesets, which is what
// Settings > Rules > Rulesets > New ruleset > Import a ruleset reads. It must protect only the default branch: a pull
// request with no approval required (the owner works alone and the CI merges), the ci-ok check from GitHub Actions as
// the only required check (changing the CI parts never touches the ruleset), no up-to-date branch requirement, no
// force push, no deletion and nobody who bypasses it.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { workflowJobs } from './lib/merge-job.ts';

/** The id of the GitHub Actions app (gh api apps/github-actions): a check named ci-ok from anything else does not count. */
const GITHUB_ACTIONS_APP = 15368;
const RULE_TYPES = ['deletion', 'non_fast_forward', 'pull_request', 'required_status_checks'];

type Json = Record<string, unknown>;

const read = (): Json => JSON.parse(readFileSync('docs/ops/ruleset-main.json', 'utf8')) as Json;

function ruleOf(ruleset: Json, type: string): Json | undefined {
  return (ruleset['rules'] as Json[] | undefined)?.find((rule) => rule['type'] === type);
}

/** Every way the ruleset can drift from what decision 11 asks; empty when it is right. */
function rulesetProblems(ruleset: Json): string[] {
  const problems: string[] = [];
  const expectKeys = (object: Json | undefined, keys: string[], where: string): void => {
    const actual = Object.keys(object ?? {}).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...keys].sort())) problems.push(`${where}: chaves ${actual.join(', ')}`);
  };
  expectKeys(ruleset, ['name', 'target', 'enforcement', 'bypass_actors', 'conditions', 'rules'], 'ruleset');
  if (ruleset['name'] !== 'main') problems.push('nome diferente de main');
  if (ruleset['target'] !== 'branch') problems.push('não é um ruleset de branch');
  if (ruleset['enforcement'] !== 'active') problems.push('não está ativo');
  if (!Array.isArray(ruleset['bypass_actors']) || ruleset['bypass_actors'].length > 0) problems.push('alguém pode contornar o ruleset');
  const refName = (ruleset['conditions'] as Json | undefined)?.['ref_name'] as Json | undefined;
  if (JSON.stringify(refName?.['include']) !== JSON.stringify(['~DEFAULT_BRANCH'])) problems.push('não cobre só a branch padrão');
  if (JSON.stringify(refName?.['exclude']) !== JSON.stringify([])) problems.push('exclui alguma branch');
  const types = ((ruleset['rules'] as Json[] | undefined) ?? []).map((rule) => String(rule['type']));
  if (JSON.stringify([...types].sort()) !== JSON.stringify([...RULE_TYPES].sort())) problems.push(`regras ${types.join(', ')}`);
  for (const type of ['deletion', 'non_fast_forward']) {
    const rule = ruleOf(ruleset, type);
    if (!rule || Object.keys(rule).length !== 1) problems.push(`${type} ausente ou com parâmetros`);
  }
  const pull = ruleOf(ruleset, 'pull_request')?.['parameters'] as Json | undefined;
  expectKeys(pull, ['required_approving_review_count', 'dismiss_stale_reviews_on_push', 'require_code_owner_review', 'require_last_push_approval', 'required_review_thread_resolution', 'allowed_merge_methods'], 'pull_request');
  if (pull?.['required_approving_review_count'] !== 0) problems.push('a PR pede aprovação');
  for (const flag of ['dismiss_stale_reviews_on_push', 'require_code_owner_review', 'require_last_push_approval', 'required_review_thread_resolution']) {
    if (pull?.[flag] !== false) problems.push(`pull_request.${flag} não é false`);
  }
  if (JSON.stringify(pull?.['allowed_merge_methods']) !== JSON.stringify(['squash'])) problems.push('o merge não é só squash');
  const checks = ruleOf(ruleset, 'required_status_checks')?.['parameters'] as Json | undefined;
  expectKeys(checks, ['strict_required_status_checks_policy', 'do_not_enforce_on_create', 'required_status_checks'], 'required_status_checks');
  if (checks?.['strict_required_status_checks_policy'] !== false) problems.push('exige a branch atualizada');
  if (checks?.['do_not_enforce_on_create'] !== false) problems.push('não exige o check na criação');
  if (JSON.stringify(checks?.['required_status_checks']) !== JSON.stringify([{ context: 'ci-ok', integration_id: GITHUB_ACTIONS_APP }])) problems.push('o único check exigido não é o ci-ok do GitHub Actions');
  return problems;
}

describe('docs/ops/ruleset-main.json', () => {
  it('is valid JSON in the import format and has no problem', () => {
    expect(rulesetProblems(read())).toEqual([]);
  });

  it('protects only the default branch, with no bypass', () => {
    const ruleset = read();
    expect((ruleset['conditions'] as Json)['ref_name']).toEqual({ include: ['~DEFAULT_BRANCH'], exclude: [] });
    expect(ruleset['bypass_actors']).toEqual([]);
  });

  it('requires a pull request with no approval, and only ci-ok from GitHub Actions, without an up-to-date branch', () => {
    const ruleset = read();
    expect((ruleOf(ruleset, 'pull_request')?.['parameters'] as Json)['required_approving_review_count']).toBe(0);
    const checks = ruleOf(ruleset, 'required_status_checks')?.['parameters'] as Json;
    expect(checks['required_status_checks']).toEqual([{ context: 'ci-ok', integration_id: GITHUB_ACTIONS_APP }]);
    expect(checks['strict_required_status_checks_policy']).toBe(false);
  });

  it('forbids force push and deletion', () => {
    const ruleset = read();
    expect(ruleOf(ruleset, 'non_fast_forward')).toEqual({ type: 'non_fast_forward' });
    expect(ruleOf(ruleset, 'deletion')).toEqual({ type: 'deletion' });
  });

  // The controls: each change that would weaken (or overreach) the ruleset is caught.
  const mutations: [string, (ruleset: Json) => void][] = [
    ['a bypass actor', (ruleset) => (ruleset['bypass_actors'] = [{ actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }])],
    ['every branch', (ruleset) => (((ruleset['conditions'] as Json)['ref_name'] as Json)['include'] = ['~ALL'])],
    ['no deletion rule', (ruleset) => (ruleset['rules'] = (ruleset['rules'] as Json[]).filter((rule) => rule['type'] !== 'deletion'))],
    ['no force-push rule', (ruleset) => (ruleset['rules'] = (ruleset['rules'] as Json[]).filter((rule) => rule['type'] !== 'non_fast_forward'))],
    ['an approval', (ruleset) => ((ruleOf(ruleset, 'pull_request')?.['parameters'] as Json)['required_approving_review_count'] = 1)],
    ['an up-to-date branch', (ruleset) => ((ruleOf(ruleset, 'required_status_checks')?.['parameters'] as Json)['strict_required_status_checks_policy'] = true)],
    ['a check from any app', (ruleset) => ((ruleOf(ruleset, 'required_status_checks')?.['parameters'] as Json)['required_status_checks'] = [{ context: 'ci-ok' }])],
    ['a second check', (ruleset) => ((ruleOf(ruleset, 'required_status_checks')?.['parameters'] as Json)['required_status_checks'] = [{ context: 'ci-ok', integration_id: GITHUB_ACTIONS_APP }, { context: 'playwright (chromium 1 de 5)', integration_id: GITHUB_ACTIONS_APP }])],
    ['an update restriction', (ruleset) => (ruleset['rules'] as Json[]).push({ type: 'update' })],
    ['evaluate mode', (ruleset) => (ruleset['enforcement'] = 'evaluate')],
  ];
  for (const [name, mutate] of mutations) {
    it(`a control fails: ${name}`, () => {
      const ruleset = read();
      mutate(ruleset);
      expect(rulesetProblems(ruleset)).not.toEqual([]);
    });
  }
});

// The check the ruleset requires is the one the CI reports: the job ci-ok of ci.yml, named ci-ok, with no matrix (a
// matrix would report one check per entry, none of them named ci-ok), always run (DECISOES § 327).
describe('the ci-ok check of the ruleset in ci.yml', () => {
  it('is reported by a job named ci-ok, with no matrix, that always runs', () => {
    const job = workflowJobs(readFileSync('.github/workflows/ci.yml', 'utf8'))['ci-ok'];
    expect(job?.['name']).toBe('ci-ok');
    expect(job?.['strategy']).toBeUndefined();
    expect(job?.['if']).toBe('always()');
  });
});
