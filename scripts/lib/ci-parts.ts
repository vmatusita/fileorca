// The parts of pnpm verificar the CI runs, read from .github/workflows/ci.yml (F9; DECISOES § 324 and § 329): every
// `pnpm verificar <args>` line of a job's steps, in the order of the jobs, with `${{ matrix.args }}` expanded for each
// entry of the job's matrix. pnpm verificar --partes runs them in sequence and tests/unit/verificar.test.ts proves that
// together they are the whole of pnpm verificar, with the build once.
import { parseYaml, type YamlValue } from './mini-yaml.ts';

export interface CiPart {
  /** Id of the job in ci.yml. */
  job: string;
  /** The arguments of pnpm verificar in that part. */
  args: string[];
}

const record = (value: YamlValue | undefined): Record<string, YamlValue> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function ciParts(source: string): CiPart[] {
  const jobs = record(record(parseYaml(source))['jobs']);
  const parts: CiPart[] = [];
  for (const [job, value] of Object.entries(jobs)) {
    const steps = record(value)['steps'];
    if (!Array.isArray(steps)) continue;
    const include = record(record(record(value)['strategy'])['matrix'])['include'];
    const entries = Array.isArray(include) ? include.map(record) : [];
    for (const step of steps) {
      const run = record(step)['run'];
      if (typeof run !== 'string') continue;
      for (const line of run.split('\n')) {
        const match = /^\s*pnpm verificar\b(.*)$/.exec(line);
        if (!match) continue;
        const template = (match[1] ?? '').trim();
        const lines = template.includes('${{ matrix.args }}')
          ? entries.map((entry) => template.replace('${{ matrix.args }}', String(entry['args'] ?? '')))
          : [template];
        for (const text of lines) parts.push({ job, args: text.split(/\s+/).filter((arg) => arg !== '') });
      }
    }
  }
  return parts;
}

/** The parts of a complete execution: every part but the draft's light job (`--leve`), which runs alone. */
export function completeParts(source: string): CiPart[] {
  return ciParts(source).filter((part) => !part.args.includes('--leve'));
}
