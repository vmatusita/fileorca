// The merge job of .github/workflows/ci.yml, step by step, for the event fixtures of fixtures/merge-events/
// (DECISOES § 297). The job builds pr.json with jq; prJsonLikeJq() is the same transformation in TypeScript, and
// tests/unit/merge-events.test.ts proves both give the same pr.json wherever jq exists (the Ubuntu runner).
// F9: the same helpers read the classificar job for the events of fixtures/ci-events/ (DECISOES § 326).
import { parseYaml, type YamlValue } from './mini-yaml.ts';

export interface MergeEventFixture {
  description: string;
  event: { action: string; number: number; pull_request: Record<string, unknown> };
  /** Paths the `git diff --no-renames` of the job lists, or a rename the test replays in a scratch repository. */
  files: string[] | { rename: [string, string] };
  /** Outputs of dependabot/fetch-metadata; null when the step does not run (the author is not Dependabot). */
  fetchMetadata: { 'update-type': string; 'dependency-group': string } | null;
  expected: { merge: string; comment: string; reason: string };
}

export interface Step {
  name?: string;
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  with?: Record<string, string | number | boolean>;
}

/** The repository the fixtures run in: the github context the runner fills besides the event. */
export const REPOSITORY = { repository: 'vmatusita/fileorca', repository_owner: 'vmatusita' };

function record(value: YamlValue | undefined, what: string): Record<string, YamlValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`ci.yml: ${what} não é um mapa`);
  return value;
}

export function workflowJobs(source: string): Record<string, Record<string, YamlValue>> {
  const jobs = record(record(parseYaml(source), 'o arquivo')['jobs'], 'jobs');
  return Object.fromEntries(Object.entries(jobs).map(([name, job]) => [name, record(job, `o job ${name}`)]));
}

export function jobSteps(source: string, job: string): Step[] {
  const steps = workflowJobs(source)[job]?.['steps'];
  if (!Array.isArray(steps)) throw new Error(`ci.yml: o job ${job} não tem steps`);
  return steps as unknown as Step[];
}

export function mergeSteps(source: string): Step[] {
  return jobSteps(source, 'merge');
}

export function stepNamed(steps: Step[], name: string): Step {
  const step = steps.find((candidate) => candidate.name === name);
  if (!step) throw new Error(`ci.yml: passo "${name}" não encontrado`);
  return step;
}

/** A property path with `*` over arrays (an object filter, as in `labels.*.name`). */
function lookup(path: string, context: Record<string, unknown>): unknown {
  let value: unknown = context;
  let spread = false;
  for (const key of path.split('.')) {
    if (key === '*') {
      spread = true;
      value = Array.isArray(value) ? value : [];
      continue;
    }
    const get = (item: unknown): unknown => (item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : undefined);
    value = spread && Array.isArray(value) ? value.map(get).filter((item) => item !== undefined && item !== null) : get(value);
  }
  return value;
}

/**
 * Renders `${{ a.b.c }}` the way the runner does for plain property paths: booleans as text, missing as ''. It also
 * renders `${{ toJSON(a.*.b) }}`, which the runner prints as indented JSON.
 */
export function render(template: string, context: Record<string, unknown>): string {
  return template.replace(/\$\{\{\s*(toJSON\(\s*([\w.*-]+)\s*\)|([\w.-]+))\s*\}\}/g, (_, _all: string, json?: string, path?: string) => {
    if (json !== undefined) return JSON.stringify(lookup(json, context) ?? null, null, 2);
    const value = lookup(path as string, context);
    return value === undefined || value === null ? '' : String(value);
  });
}

/** The lines of a run: block from the first line that starts with `start` through the line that ends the command. */
export function command(run: string, start: string): string {
  const lines = run.split('\n');
  const first = lines.findIndex((line) => line.trimStart().startsWith(start));
  if (first < 0) throw new Error(`ci.yml: comando "${start}" não encontrado`);
  const out: string[] = [];
  for (let i = first; i < lines.length; i++) {
    const line = lines[i]!.trim();
    out.push(line);
    if (!line.endsWith('\\')) break;
  }
  return out.join('\n');
}

export interface PrJson {
  headRefName: string;
  isDraft: boolean;
  author: { login: string };
  headRepo: string;
  repo: string;
  repoOwner: string;
  files: { path: string }[];
}

/** What the jq of the Decide step writes to pr.json, from its env and files.txt. */
export function prJsonLikeJq(env: { HEAD_REF: string; AUTHOR: string; DRAFT: string; HEAD_REPO: string; REPO: string; REPO_OWNER: string }, filesTxt: string): PrJson {
  return {
    headRefName: env.HEAD_REF,
    isDraft: JSON.parse(env.DRAFT) as boolean,
    author: { login: env.AUTHOR },
    headRepo: env.HEAD_REPO,
    repo: env.REPO,
    repoOwner: env.REPO_OWNER,
    files: filesTxt.split('\n').filter((path) => path.length > 0).map((path) => ({ path })),
  };
}

/** Parses GITHUB_OUTPUT lines (`name=value` and `name<<EOF` blocks). */
export function readOutputs(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = text.replaceAll('\r\n', '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const heredoc = /^([\w-]+)<<(\w+)$/.exec(line);
    if (heredoc) {
      const body: string[] = [];
      for (i++; i < lines.length && lines[i] !== heredoc[2]; i++) body.push(lines[i]!);
      out[heredoc[1]!] = body.join('\n');
    } else if (line.includes('=')) {
      out[line.slice(0, line.indexOf('='))] = line.slice(line.indexOf('=') + 1);
    }
  }
  return out;
}
