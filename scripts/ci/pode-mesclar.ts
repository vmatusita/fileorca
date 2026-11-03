// Merge decision for the CI merge job (PLANO "Da run ao ar", item 4; DECISOES §§ 13 e 14).
// Pure `decide()` is tested in Vitest; the CLI reads the PR JSON and writes GITHUB_OUTPUT.
import { appendFileSync, readFileSync } from 'node:fs';

export const OWNER = 'Victor';
export const DEPENDABOT_LOGIN = 'dependabot[bot]';

export interface PullRequestInfo {
  /** Head branch name, e.g. `fase-01a` or `dependabot/npm_and_yarn/astro-7.4.5`. */
  headRef: string;
  /** Login of the PR author. */
  author: string;
  isDraft: boolean;
  /** Paths changed by the PR. */
  files: string[];
  /** `update-type` from dependabot/fetch-metadata, when the PR is from Dependabot. */
  dependabotUpdateType?: string | null;
  /** `owner/name` of the repository of the head branch; null when the event did not carry it (a deleted fork). */
  headRepo?: string | null;
  /** `owner/name` of this repository. */
  repo?: string | null;
  /** Login of the owner of this repository. */
  repoOwner?: string | null;
}

export type Decision =
  | { merge: true; reason: string }
  | { merge: false; reason: string; comment: boolean };

const RUN_BRANCH = /^(?:fase-\d{2}[a-z]?|ajuste-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
const DEPENDABOT_AUTO = new Set(['version-update:semver-patch', 'version-update:semver-minor']);

export function touchesWorkflows(files: readonly string[]): boolean {
  return files.some((file) => file.replaceAll('\\', '/').startsWith('.github/workflows/'));
}

/**
 * F9 (decision 9; DECISOES § 333): only a PR whose head branch lives in this repository, opened by the owner of the
 * repository or by Dependabot, is merged. A fork, another author, or an event without these data never is.
 */
export function origin(pr: PullRequestInfo): string | null {
  if (!pr.headRepo || !pr.repo || !pr.repoOwner) {
    return `O evento não trouxe o repositório da branch, o deste repositório ou o dono: o merge fica para o ${OWNER}.`;
  }
  if (pr.headRepo !== pr.repo) {
    return `A PR vem de um fork (${pr.headRepo}): o merge fica para o ${OWNER}, depois de ler o diff.`;
  }
  if (pr.author !== pr.repoOwner && pr.author !== DEPENDABOT_LOGIN) {
    return `A PR é de ${pr.author}, que não é o dono do repositório nem o Dependabot: o merge fica para o ${OWNER}.`;
  }
  return null;
}

export function decide(pr: PullRequestInfo): Decision {
  if (pr.isDraft) {
    return { merge: false, comment: false, reason: 'PR em rascunho: o merge espera ela ficar pronta.' };
  }
  const refused = origin(pr);
  if (refused) return { merge: false, comment: true, reason: refused };
  if (touchesWorkflows(pr.files)) {
    return {
      merge: false,
      comment: true,
      reason: `A PR mexe em .github/workflows/, então o merge fica para o ${OWNER}.`,
    };
  }
  if (pr.author === DEPENDABOT_LOGIN) {
    if (!pr.headRef.startsWith('dependabot/')) {
      return { merge: false, comment: true, reason: `PR do Dependabot fora de uma branch dependabot/: fica para o ${OWNER}.` };
    }
    const type = pr.dependabotUpdateType ?? '';
    if (DEPENDABOT_AUTO.has(type)) {
      return { merge: true, reason: `Dependabot ${type.replace('version-update:semver-', '')}: merge automático.` };
    }
    const kind = type === 'version-update:semver-major' ? 'major' : `de tipo desconhecido (${type || 'vazio'})`;
    return { merge: false, comment: true, reason: `Atualização ${kind} do Dependabot: o merge fica para o ${OWNER}.` };
  }
  if (RUN_BRANCH.test(pr.headRef)) {
    return { merge: true, reason: `Branch de run (${pr.headRef}) com o verificar verde: merge automático.` };
  }
  return {
    merge: false,
    comment: true,
    reason: `A branch ${pr.headRef} não é fase-* nem ajuste-*: o merge fica para o ${OWNER}.`,
  };
}

interface GhPrJson {
  headRefName: string;
  isDraft: boolean;
  author: { login: string };
  files: { path: string }[];
  /** F9: written by the jq of the merge job; missing in a pr.json from before, so the merge is refused. */
  headRepo?: string;
  repo?: string;
  repoOwner?: string;
}

/** Builds the decision input from the pr.json of the merge job (the shape of `gh pr view --json`, plus the F9 fields). */
export function fromGhJson(json: GhPrJson, dependabotUpdateType?: string | null): PullRequestInfo {
  return {
    headRef: json.headRefName,
    author: json.author.login,
    isDraft: json.isDraft,
    files: json.files.map((file) => file.path),
    dependabotUpdateType: dependabotUpdateType ?? null,
    headRepo: json.headRepo || null,
    repo: json.repo || null,
    repoOwner: json.repoOwner || null,
  };
}

function writeOutput(name: string, value: string): void {
  const target = process.env['GITHUB_OUTPUT'];
  const line = value.includes('\n') ? `${name}<<EOF\n${value}\nEOF\n` : `${name}=${value}\n`;
  if (target) appendFileSync(target, line);
  else process.stdout.write(line);
}

if (import.meta.main) {
  // Usage: node scripts/ci/pode-mesclar.ts <pr.json> [dependabot-update-type]
  const [jsonPath, updateType] = process.argv.slice(2);
  if (!jsonPath) throw new Error('usage: pode-mesclar.ts <pr.json> [update-type]');
  const decision = decide(fromGhJson(JSON.parse(readFileSync(jsonPath, 'utf8')) as GhPrJson, updateType));
  writeOutput('merge', String(decision.merge));
  writeOutput('comment', String(decision.merge ? false : decision.comment));
  writeOutput('reason', decision.reason);
  console.log(`pode-mesclar: ${decision.merge ? 'merge' : 'sem merge'} - ${decision.reason}`);
}
