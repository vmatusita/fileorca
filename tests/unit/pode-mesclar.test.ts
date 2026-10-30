import { describe, expect, it } from 'vitest';
import { decide, fromGhJson, touchesWorkflows, type PullRequestInfo } from '../../scripts/ci/pode-mesclar.ts';

const base: PullRequestInfo = { headRef: 'fase-02', author: 'vmatusita', isDraft: false, files: ['src/a.ts'] };
const bot = (updateType: string | null, files = ['package.json', 'pnpm-lock.yaml']): PullRequestInfo => ({
  headRef: 'dependabot/npm_and_yarn/astro-7.4.5',
  author: 'dependabot[bot]',
  isDraft: false,
  files,
  dependabotUpdateType: updateType,
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

describe('pode-mesclar: fromGhJson', () => {
  it('maps gh pr view JSON', () => {
    const info = fromGhJson(
      { headRefName: 'fase-01a', isDraft: true, author: { login: 'vmatusita' }, files: [{ path: 'a' }, { path: 'b' }] },
      undefined,
    );
    expect(info).toEqual({ headRef: 'fase-01a', author: 'vmatusita', isDraft: true, files: ['a', 'b'], dependabotUpdateType: null });
  });
});
