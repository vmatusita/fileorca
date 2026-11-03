import { describe, expect, it } from 'vitest';
import { decide, fromGhJson, origin, touchesWorkflows, type PullRequestInfo } from '../../scripts/ci/pode-mesclar.ts';

const here = { headRepo: 'vmatusita/fileorca', repo: 'vmatusita/fileorca', repoOwner: 'vmatusita' };
const base: PullRequestInfo = { headRef: 'fase-02', author: 'vmatusita', isDraft: false, files: ['src/a.ts'], ...here };
const bot = (updateType: string | null, files = ['package.json', 'pnpm-lock.yaml']): PullRequestInfo => ({
  headRef: 'dependabot/npm_and_yarn/astro-7.4.5',
  author: 'dependabot[bot]',
  isDraft: false,
  files,
  dependabotUpdateType: updateType,
  ...here,
});

describe('pode-mesclar: decide', () => {
  it.each(['fase-02', 'fase-01a', 'fase-01b', 'fase-01c', 'fase-05b', 'ajuste-cookie-banner', 'ajuste-oli'])(
    'merges run branch %s',
    (headRef) => {
      expect(decide({ ...base, headRef })).toMatchObject({ merge: true });
    },
  );

  it.each(['main', 'feature/x', 'fase-', 'fase-1', 'fase-xx', 'ajuste-', 'ajuste_x', 'fase-02/x', 'Fase-02', 'my-fase-02'])(
    'refuses any other branch (%s) and comments',
    (headRef) => {
      const decision = decide({ ...base, headRef });
      expect(decision).toMatchObject({ merge: false, comment: true });
      expect(decision.reason).toContain('Victor');
    },
  );

  it('merges Dependabot patch and minor', () => {
    expect(decide(bot('version-update:semver-patch'))).toMatchObject({ merge: true });
    expect(decide(bot('version-update:semver-minor'))).toMatchObject({ merge: true });
  });

  it('leaves Dependabot major and unknown update types to the owner, with a comment', () => {
    expect(decide(bot('version-update:semver-major'))).toMatchObject({ merge: false, comment: true });
    expect(decide(bot(null))).toMatchObject({ merge: false, comment: true });
    expect(decide(bot('security-update'))).toMatchObject({ merge: false, comment: true });
  });

  it('refuses a Dependabot author outside a dependabot/ branch', () => {
    expect(decide({ ...bot('version-update:semver-patch'), headRef: 'fase-02' })).toMatchObject({ merge: false });
  });

  it('refuses any PR touching .github/workflows/, even run branches and Dependabot patch', () => {
    const files = ['src/a.ts', '.github/workflows/ci.yml'];
    const run = decide({ ...base, headRef: 'fase-01a', files });
    expect(run).toMatchObject({ merge: false, comment: true });
    expect(run.reason).toContain('.github/workflows/');
    expect(decide(bot('version-update:semver-patch', ['.github/workflows/ci.yml']))).toMatchObject({ merge: false });
    expect(decide({ ...base, files: ['.github\\workflows\\pos-deploy.yml'] })).toMatchObject({ merge: false });
  });

  it('does not treat other .github files as workflows', () => {
    expect(touchesWorkflows(['.github/dependabot.yml'])).toBe(false);
    expect(decide({ ...base, files: ['.github/dependabot.yml'] })).toMatchObject({ merge: true });
  });

  it('refuses drafts without comment or issue, before any other rule', () => {
    expect(decide({ ...base, isDraft: true })).toEqual({ merge: false, comment: false, reason: expect.any(String) });
    expect(decide({ ...bot('version-update:semver-patch'), isDraft: true })).toMatchObject({ merge: false, comment: false });
    expect(decide({ ...base, isDraft: true, files: ['.github/workflows/ci.yml'] })).toMatchObject({ comment: false });
  });
});

// F9 (decision 9; DECISOES § 333): a fork, another author or an event without the data is never merged, whatever the
// branch is called. Each case is a run branch and a Dependabot patch that would merge otherwise.
describe('pode-mesclar: the origin of the PR', () => {
  it('merges the owner and Dependabot from this repository', () => {
    expect(origin(base)).toBeNull();
    expect(origin(bot('version-update:semver-patch'))).toBeNull();
  });

  it('refuses a fork, even with the name of a run branch or the Dependabot login', () => {
    const fork = { ...base, headRef: 'fase-10', author: 'alguem', headRepo: 'alguem/fileorca' };
    expect(decide(fork)).toMatchObject({ merge: false, comment: true });
    expect(decide(fork).reason).toContain('fork');
    expect(decide({ ...base, headRepo: 'vmatusita-other/fileorca' })).toMatchObject({ merge: false });
    expect(decide({ ...bot('version-update:semver-patch'), headRepo: 'alguem/fileorca' })).toMatchObject({ merge: false });
  });

  it('refuses another author of this repository, on a run branch too', () => {
    const decision = decide({ ...base, headRef: 'fase-10', author: 'colaborador' });
    expect(decision).toMatchObject({ merge: false, comment: true });
    expect(decision.reason).toContain('colaborador');
    expect(decide({ ...base, author: 'VMATUSITA' })).toMatchObject({ merge: false });
  });

  it('refuses when the event did not carry the repositories or the owner', () => {
    for (const missing of [{ headRepo: null }, { repo: null }, { repoOwner: null }, { headRepo: '' }]) {
      expect(decide({ ...base, ...missing }), JSON.stringify(missing)).toMatchObject({ merge: false, comment: true });
    }
    // A pr.json from before the F9, without the three fields.
    const old: PullRequestInfo = { headRef: base.headRef, author: base.author, isDraft: base.isDraft, files: base.files };
    expect(decide(old)).toMatchObject({ merge: false, comment: true });
  });
});

describe('pode-mesclar: fromGhJson', () => {
  it('maps gh pr view JSON', () => {
    const info = fromGhJson(
      { headRefName: 'fase-01a', isDraft: true, author: { login: 'vmatusita' }, files: [{ path: 'a' }, { path: 'b' }] },
      undefined,
    );
    expect(info).toEqual({ headRef: 'fase-01a', author: 'vmatusita', isDraft: true, files: ['a', 'b'], dependabotUpdateType: null, headRepo: null, repo: null, repoOwner: null });
  });

  it('maps the fields the jq of the merge job adds since the F9', () => {
    const info = fromGhJson({ headRefName: 'fase-09', isDraft: false, author: { login: 'vmatusita' }, files: [], headRepo: 'vmatusita/fileorca', repo: 'vmatusita/fileorca', repoOwner: 'vmatusita' });
    expect(info).toMatchObject(here);
    expect(decide(info)).toMatchObject({ merge: true });
  });
});
