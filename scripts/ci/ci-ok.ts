// The verdict of the ci-ok job (F9, decision 5; DECISOES § 327): the one check that sums up the CI, the one the merge job
// waits for and the only one the ruleset of docs/ops/ruleset-main.json requires. The job runs with `if: always()`, because
// a skipped job counts as passed in a required check, and reads this script from the base branch, like pode-mesclar.ts, so
// a PR cannot turn its own check green. Pure verdict() is tested in Vitest (tests/unit/ci-ok.test.ts); the CLI reads
// `toJSON(needs)` from a file and fails the job when the verdict is red.
//
// Green only when the classification came out and every job ended in success, or in skipped when the class does not
// ask for it. Red on failure, on cancelled, and on skipped of a job the class asks for.
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

export function verdict(needs: Readonly<Record<string, NeedResult>>): { ok: boolean; lines: string[] } {
  const lines: string[] = [];
  const classifier = needs['classificar'];
  const klass = classifier?.outputs?.['classe'] ?? '';
  if (classifier?.result !== 'success' || !(klass in REQUIRED)) {
    lines.push(`a classificação não saiu (resultado ${classifier?.result ?? 'ausente'}, classe "${klass}")`);
    return { ok: false, lines };
  }
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
  // Usage: node scripts/ci/ci-ok.ts <needs.json>
  const [jsonPath] = process.argv.slice(2);
  if (!jsonPath) throw new Error('usage: ci-ok.ts <needs.json>');
  let needs: Record<string, NeedResult> = {};
  try {
    needs = JSON.parse(readFileSync(jsonPath, 'utf8')) as Record<string, NeedResult>;
  } catch (error) {
    console.error(`ci-ok: needs ilegível (${(error as Error).message})`);
    process.exit(1);
  }
  const { ok, lines } = verdict(needs);
  for (const line of lines) console.log(`ci-ok: ${line}`);
  console.log(ok ? 'ci-ok: verde' : 'ci-ok: vermelho');
  process.exit(ok ? 0 : 1);
}
