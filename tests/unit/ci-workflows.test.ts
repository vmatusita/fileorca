// The alerts of the workflows (F8, decisions 14 and 15; DECISOES § 300 and § 301), read from the YAML itself: the job
// that tells Victor about a red CI in a Dependabot PR (trigger, condition, permissions, needs, no checkout, one issue per
// PR), and every issue the workflows open is assigned to the owner of the repository, so GitHub e-mails him.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseYaml, type YamlValue } from './lib/mini-yaml.ts';
import { workflowJobs } from './lib/merge-job.ts';

const CI = readFileSync('.github/workflows/ci.yml', 'utf8');
const POS_DEPLOY = readFileSync('.github/workflows/pos-deploy.yml', 'utf8');
const jobs = workflowJobs(CI);
const alert = jobs['alerta-dependabot'] ?? {};
const steps = (alert['steps'] ?? []) as { name?: string; uses?: string; run?: string }[];

/** Every `gh issue create` of a workflow text, with its title and whether it is assigned to the owner. */
function issueCreates(source: string): { title: string; assigned: boolean }[] {
  return [...source.matchAll(/gh issue create --title "([^"]+)"([^\n]*)/g)].map((match) => ({ title: match[1] ?? '', assigned: (match[2] ?? '').includes('--assignee "$OWNER"') }));
}

describe('the alert of a red CI in a Dependabot PR', () => {
  it('runs on the pull_request of the CI, after every part and the merge job, only when one failed and the PR is from Dependabot', () => {
    const on = (parseYaml(CI) as Record<string, YamlValue>)['on'] as Record<string, { types: string[] }>;
    expect(on['pull_request']?.types).toEqual(['opened', 'synchronize', 'reopened', 'ready_for_review']);
    expect(alert['needs']).toEqual(['verificar', 'playwright', 'merge']);
    expect(alert['if']).toBe("failure() && github.event.pull_request.user.login == 'dependabot[bot]'");
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
