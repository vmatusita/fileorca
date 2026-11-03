// The verdict of the ci-ok job (F9, decision 5; DECISOES § 327): the one check that sums up the CI, the one the merge job
// waits for and the only one the ruleset of docs/ops/ruleset-main.json requires. The job runs with `if: always()`, because
// a skipped job counts as passed in a required check, and reads this script from the base branch, like pode-mesclar.ts, so
// a PR cannot turn its own check green. Pure verdict() is tested in Vitest (tests/unit/ci-ok.test.ts); the CLI reads
// `toJSON(needs)` from a file and fails the job when the verdict is red.
//
// Green only when the classification came out and every job ended in success, or in skipped when the class does not
// ask for it. Red on failure, on cancelled, and on skipped of a job the class asks for.
//
// The class comes from the payload of the event, so a run of a synchronize sent while the PR was a draft can end after
// the ready_for_review that should replace it (the review of the F9, A-2). The job reads the draft state of the PR as
// it is now (gh api, in PR_DRAFT_NOW) and the leve class of a PR that is already ready is red: that run came from a
// draft event, and the complete run has to run. Without PR_DRAFT_NOW, or with anything but true or false, the CLI fails.
import { readFileSync } from 'node:fs';

export type Klass = 'leve' | 'portões' | 'completo';

/** The jobs each class asks for, by their id in ci.yml. */
export const REQUIRED: Record<Klass, readonly string[]> = {
  leve: ['classificar', 'leve'],
  'portões': ['classificar', 'build', 'portoes'],
  completo: ['classificar', 'build', 'portoes', 'lighthouse', 'playwright'],
};

/** Every job ci-ok waits for: the union of the classes. */
export const WATCHED = [...new Set(Object.values(REQUIRED).flat())];

export interface NeedResult {
  result: string;
  outputs?: Record<string, string>;
}

/** The line of a leve run of a PR that is no longer a draft. */
export const READY_LEVE =
  'a classe é leve, mas a PR está pronta: esta execução veio de um evento de rascunho; a execução completa tem de rodar';

/**
 * The verdict on `toJSON(needs)`. `draftNow` is the draft state of the PR read when ci-ok runs: false makes a leve
 * run red. Left out, only the needs count (the CLI never leaves it out).
 */
export function verdict(needs: Readonly<Record<string, NeedResult>>, draftNow?: boolean): { ok: boolean; lines: string[] } {
  const lines: string[] = [];
  const classifier = needs['classificar'];
  const klass = classifier?.outputs?.['classe'] ?? '';
  if (classifier?.result !== 'success' || !(klass in REQUIRED)) {
    lines.push(`a classificação não saiu (resultado ${classifier?.result ?? 'ausente'}, classe "${klass}")`);
    return { ok: false, lines };
  }
  if (klass === 'leve' && draftNow === false) lines.push(READY_LEVE);
  const required = REQUIRED[klass as Klass];
  for (const job of WATCHED) {
    if (!(job in needs)) lines.push(`${job}: ausente do needs do ci-ok`);
  }
  for (const [job, need] of Object.entries(needs)) {
    const asked = required.includes(job);
    if (need.result === 'success') continue;
    if (need.result === 'skipped' && !asked) continue;
    lines.push(`${job}: ${need.result}${asked ? ' (a classe pede este job)' : ''}`);
  }
  return { ok: lines.length === 0, lines: lines.length === 0 ? [`classe ${klass}: ${required.join(', ')} verdes`] : lines };
}

if (import.meta.main) {
  // Usage: PR_DRAFT_NOW=true|false node scripts/ci/ci-ok.ts <needs.json>
  const [jsonPath] = process.argv.slice(2);
  if (!jsonPath) throw new Error('usage: ci-ok.ts <needs.json>');
  const draftNow = process.env['PR_DRAFT_NOW'];
  if (draftNow !== 'true' && draftNow !== 'false') {
    console.error(`ci-ok: PR_DRAFT_NOW tem de ser true ou false (veio "${draftNow ?? ''}")`);
    console.log('ci-ok: vermelho');
    process.exit(1);
  }
  let needs: Record<string, NeedResult> = {};
  try {
    needs = JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<string, NeedResult>;
  } catch (error) {
    console.error(`ci-ok: needs ilegível (${(error as Error).message})`);
    process.exit(1);
  }
  const { ok, lines } = verdict(needs, draftNow === 'true');
  for (const line of lines) console.log(`ci-ok: ${line}`);
  console.log(ok ? 'ci-ok: verde' : 'ci-ok: vermelho');
  process.exit(ok ? 0 : 1);
}
