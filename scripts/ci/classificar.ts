// The class of one execution of the CI (F9, decision 4; DECISOES § 326), for the classificar job of ci.yml. The job reads
// this script from the base branch, like pode-mesclar.ts, so a PR cannot change the class of its own run. Pure classify()
// is tested in Vitest and with the example events of fixtures/ci-events/ (tests/unit/ci-events.test.ts); the CLI reads the
// JSON the job writes with jq and writes `classe` and `motivo` to GITHUB_OUTPUT.
//
//   draft, no `ci` label        -> leve:     tipos, lint and Vitest, with the build the Vitest needs
//   draft with `ci`, or ready   -> completo: everything; or portões (the build and the gates, no Playwright, no
//                                             Lighthouse) when every changed file is documentation
//
// An empty diff, or one the job could not read, counts as code: completo.
import { appendFileSync, readFileSync } from 'node:fs';

export const CLASSES = ['leve', 'portões', 'completo'] as const;
export type Klass = (typeof CLASSES)[number];

/** The label that turns a draft into a full run. */
export const CI_LABEL = 'ci';

export interface ClassifyInput {
  isDraft: boolean;
  labels: string[];
  /** Paths the `git diff --no-renames` of the job lists; null when the job could not read the diff. */
  files: string[] | null;
}

/** True for documentation that no Playwright spec, no Lighthouse step and no build reads (DECISOES § 326). */
export function isDocumentation(path: string): boolean {
  const file = path.replaceAll('\\', '/');
  if (file.startsWith('docs/')) return !file.startsWith('docs/design/') && !file.startsWith('docs/oli/');
  return !file.includes('/') && file.toLowerCase().endsWith('.md');
}

export function classify(input: ClassifyInput): { klass: Klass; reason: string } {
  const labelled = input.labels.includes(CI_LABEL);
  if (input.isDraft && !labelled) return { klass: 'leve', reason: 'PR em rascunho sem o rótulo ci: tipos, lint e Vitest.' };
  const why = input.isDraft ? 'PR em rascunho com o rótulo ci' : 'PR pronta';
  if (!input.files || input.files.length === 0) return { klass: 'completo', reason: `${why}, sem diff legível: tudo.` };
  if (input.files.every(isDocumentation)) return { klass: 'portões', reason: `${why}, só documentação: o build e os portões, sem o Playwright e sem o Lighthouse.` };
  return { klass: 'completo', reason: `${why}, com código: tudo.` };
}

interface PrJson {
  isDraft: boolean;
  labels: string[];
  files: { path: string }[] | null;
}

/** Builds the input from the JSON the job writes (`isDraft`, `labels` and `files`, the same shape as pode-mesclar.ts). */
export function fromJson(json: PrJson): ClassifyInput {
  return {
    isDraft: json.isDraft === true,
    labels: Array.isArray(json.labels) ? json.labels.filter((label): label is string => typeof label === 'string') : [],
    files: Array.isArray(json.files) ? json.files.map((file) => file.path) : null,
  };
}

function writeOutput(name: string, value: string): void {
  const target = process.env['GITHUB_OUTPUT'];
  const line = `${name}=${value}\n`;
  if (target) appendFileSync(target, line);
  else process.stdout.write(line);
}

if (import.meta.main) {
  // Usage: node scripts/ci/classificar.ts <pr.json>
  const [jsonPath] = process.argv.slice(2);
  if (!jsonPath) throw new Error('usage: classificar.ts <pr.json>');
  const { klass, reason } = classify(fromJson(JSON.parse(readFileSync(jsonPath, 'utf8')) as PrJson));
  writeOutput('classe', klass);
  writeOutput('motivo', reason);
  console.log(`classificar: classe ${klass} - ${reason}`);
}
