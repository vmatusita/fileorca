// The money engines against the independent oracle (PLANO "Regra das calculadoras"; DECISOES of the F4).
// The expected values come from scripts/oracle/calc.py (numpy-financial and a cent loop in Python's
// decimal), written to fixtures/calc/ in a commit before any engine. Every case must match to the cent:
// the engine's output, without the full schedule when the case does not store it, deep-equals the
// expected object. CALC_FIXTURES_DIR points the test at a copy (the one-cent mutant of the report).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CALC_IDS, ENGINES, type CalcId } from '../../src/calc/index.ts';

interface Case {
  id: string;
  source: string;
  full: boolean;
  input: unknown;
  expected: unknown;
}
interface Fixture {
  calculator: CalcId;
  oracle: { script: string; sha256: string; python: string; numpy: string; numpyFinancial: string; date: string };
  cases: Case[];
}

const DIR = process.env['CALC_FIXTURES_DIR'] ?? 'fixtures/calc';
const SCRIPT = 'scripts/oracle/calc.py';
const fixtures: Fixture[] = readdirSync(DIR)
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(DIR, file), 'utf8')) as Fixture);

/** The stored shape of an output: the schedules (`rows`, `years`) only in the cases that keep them. */
function stored(value: unknown, full: boolean): unknown {
  if (Array.isArray(value)) return value.map((item) => stored(item, full));
  if (value === null || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!full && (key === 'rows' || key === 'years')) continue;
    out[key] = stored(item, full);
  }
  return out;
}

describe('the oracle fixtures', () => {
  it('has one file per calculator in the registry of engines', () => {
    expect(fixtures.map((fixture) => fixture.calculator).sort()).toEqual([...CALC_IDS].sort());
  });

  it('was written by the current oracle script (SHA-256 of scripts/oracle/calc.py, LF line ends)', () => {
    const sha = createHash('sha256').update(readFileSync(SCRIPT, 'utf8').replaceAll('\r\n', '\n')).digest('hex');
    for (const fixture of fixtures) expect(fixture.oracle.sha256, `${fixture.calculator}: run the oracle again`).toBe(sha);
  });

  it('pins numpy-financial 1.1.0', () => {
    for (const fixture of fixtures) expect(fixture.oracle.numpyFinancial).toBe('1.1.0');
  });
});

for (const fixture of fixtures) {
  describe(fixture.calculator, () => {
    it(`matches the oracle to the cent in all ${fixture.cases.length} cases`, () => {
      const engine = ENGINES[fixture.calculator] as (input: unknown) => unknown;
      const wrong: string[] = [];
      for (const item of fixture.cases) {
        const got = stored(engine(item.input), item.full);
        try {
          expect(got).toEqual(item.expected);
        } catch {
          wrong.push(`${item.id} (${item.source}): got ${JSON.stringify(got).slice(0, 600)} expected ${JSON.stringify(item.expected).slice(0, 600)}`);
        }
      }
      expect(wrong, `${wrong.length} of ${fixture.cases.length} cases differ`).toEqual([]);
    });
  });
}
