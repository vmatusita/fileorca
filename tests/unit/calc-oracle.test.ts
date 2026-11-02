// The money engines against the independent oracle (PLANO "Regra das calculadoras"; DECISOES of the F4).
// The expected values come from scripts/oracle/calc.py (numpy-financial and a cent loop in Python's
// decimal), written to fixtures/calc/ in a commit before any engine. Every case must match to the cent:
// the engine's output, without the full schedule when the case does not store it, deep-equals the
// expected object. CALC_FIXTURES_DIR points the test at a copy (the one-cent mutant of the report). Since the F7 the home and
// health calculators have an oracle of their own (scripts/oracle/calc_home_health.py, standard library only); where pi or
// log10 enters, the case also stores `exact`, the value before rounding, which the engine must hold within 1e-9 while
// every shown value stays equal (prompt F7, decision 3; DECISOES § 258).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CALC_IDS, ENGINES, type CalcId } from '../../src/calc/index.ts';
import { LIFE_CALC_IDS } from '../../src/tools/calc/registry.ts';

interface Case {
  id: string;
  source: string;
  full: boolean;
  input: unknown;
  expected: unknown;
}
interface Fixture {
  calculator: CalcId;
  oracle: { script: string; sha256: string; python: string; numpy?: string; numpyFinancial?: string; date: string; nearTiesDrawnAgain?: number };
  cases: Case[];
}

const DIR = process.env['CALC_FIXTURES_DIR'] ?? 'fixtures/calc';
/**
 * The oracle of each calculator: scripts/oracle/calc.py for the English ones (F4) and scripts/oracle/calc_br.py for the
 * ones adapted to Brazil (F6), a script of its own so the 18 English fixtures stay byte for byte (DECISOES § 225).
 */
const LIFE = new Set<string>(LIFE_CALC_IDS);
const scriptOf = (calculator: string): string =>
  calculator.startsWith('br-') ? 'scripts/oracle/calc_br.py' : LIFE.has(calculator) ? 'scripts/oracle/calc_home_health.py' : 'scripts/oracle/calc.py';
/** The two money oracles check their loops against numpy-financial; the home and health one uses no package. */
const NUMPY_SCRIPTS = new Set(['scripts/oracle/calc.py', 'scripts/oracle/calc_br.py']);
/** The largest gap allowed between the engine and the oracle before rounding, where pi or log10 enters. */
export const EXACT_GAP = 1e-9;
const shaOf = (script: string): string => createHash('sha256').update(readFileSync(script, 'utf8').replaceAll('\r\n', '\n')).digest('hex');
const fixtures: Fixture[] = readdirSync(DIR)
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(DIR, file), 'utf8')) as Fixture);

/**
 * The `exact` values of an output (anywhere in it) against the oracle's, within EXACT_GAP: the problems found, with
 * the `exact` keys taken out of both sides so the rest compares by equality.
 */
export function exactGaps(got: unknown, expected: unknown, path = ''): string[] {
  if (expected === null || typeof expected !== 'object' || got === null || typeof got !== 'object') return [];
  const gaps: string[] = [];
  const g = got as Record<string, unknown>;
  const e = expected as Record<string, unknown>;
  for (const key of Object.keys(e)) {
    if (key === 'exact') {
      const pairs: [unknown, unknown, string][] =
        typeof e[key] === 'object' && e[key] !== null
          ? Object.keys(e[key] as object).map((k) => [(g[key] as Record<string, unknown> | undefined)?.[k], (e[key] as Record<string, unknown>)[k], `${path}exact.${k}`])
          : [[g[key], e[key], `${path}exact`]];
      for (const [mine, theirs, where] of pairs) {
        const gap = typeof mine === 'number' ? Math.abs(mine - Number(theirs)) : Number.POSITIVE_INFINITY;
        if (!(gap < EXACT_GAP)) gaps.push(`${where}: ${String(mine)} vs ${String(theirs)}`);
      }
      delete g[key];
      delete e[key];
    } else gaps.push(...exactGaps(g[key], e[key], `${path}${key}.`));
  }
  return gaps;
}

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

  it('was written by the current oracle script (SHA-256 of scripts/oracle/calc.py or calc_br.py, LF line ends)', () => {
    for (const fixture of fixtures) {
      const script = scriptOf(fixture.calculator);
      expect(fixture.oracle.script, fixture.calculator).toBe(script);
      expect(fixture.oracle.sha256, `${fixture.calculator}: run the oracle again`).toBe(shaOf(script));
    }
    // The three scripts are there, and each one wrote at least one fixture.
    expect(new Set(fixtures.map((fixture) => fixture.oracle.script))).toEqual(
      new Set(['scripts/oracle/calc.py', 'scripts/oracle/calc_br.py', 'scripts/oracle/calc_home_health.py']),
    );
  });

  it('pins numpy-financial 1.1.0 in the money oracles, and the home and health one uses no package (F7)', () => {
    for (const fixture of fixtures) {
      if (NUMPY_SCRIPTS.has(fixture.oracle.script)) expect(fixture.oracle.numpyFinancial, fixture.calculator).toBe('1.1.0');
      else {
        expect(fixture.oracle.numpyFinancial, fixture.calculator).toBeUndefined();
        expect(fixture.oracle.nearTiesDrawnAgain, fixture.calculator).toBeTypeOf('number');
      }
    }
  });

  it('keeps every exact value within 1e-9 and nothing else loose (F7, decision 3)', () => {
    expect(exactGaps({ a: 1, exact: 2.0000000005 }, { a: 1, exact: '2' })).toEqual([]);
    expect(exactGaps({ exact: 2.000000002 }, { exact: '2' })).toHaveLength(1);
    expect(exactGaps({ total: { exact: { sqft: 1 } } }, { total: { exact: { sqft: '1.1' } } })).toHaveLength(1);
    expect(exactGaps({ x: 1 }, { exact: '1' })).toHaveLength(1);
    const got = { sqft: 12_345, exact: { sqft: 123.45 } };
    exactGaps(got, { sqft: 12_345, exact: { sqft: '123.45' } });
    expect(got).toEqual({ sqft: 12_345 });
  });
});

for (const fixture of fixtures) {
  describe(fixture.calculator, () => {
    it(`matches the oracle to the cent in all ${fixture.cases.length} cases`, () => {
      const engine = ENGINES[fixture.calculator] as (input: unknown) => unknown;
      const wrong: string[] = [];
      for (const item of fixture.cases) {
        const got = stored(engine(item.input), item.full);
        const expected = structuredClone(item.expected);
        const gaps = exactGaps(got, expected);
        if (gaps.length > 0) wrong.push(`${item.id} (${item.source}): ${gaps.join('; ')}`);
        try {
          expect(got).toEqual(expected);
        } catch {
          wrong.push(`${item.id} (${item.source}): got ${JSON.stringify(got).slice(0, 600)} expected ${JSON.stringify(item.expected).slice(0, 600)}`);
        }
      }
      expect(wrong, `${wrong.length} of ${fixture.cases.length} cases differ`).toEqual([]);
    });
  });
}
