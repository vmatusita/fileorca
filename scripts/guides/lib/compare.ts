// How pnpm guias:medir --check compares a new measurement with data/guides-measured.json (prompt F5b, decision 3;
// DECISOES § 185): a value measured in Node must come back equal; one measured in a browser may move within the
// tolerance fixed before the first measurement, because the canvas changes with the browser's version. Kept apart from
// measure.ts, which measures when it is imported, so tests/unit/guides-measured.test.ts can run it on mutated copies.
import type { Cell, MeasuredNumber, MeasuredTable } from '../../../src/tools/guides/measured-types.ts';

/** DECISOES § 185: fixed before the first measurement. */
export const TOLERANCE = { bytesRelative: 0.02, psnrDb: 0.5 };

export function close(a: number, b: number, unit: string, browser: boolean): boolean {
  if (a === b) return true;
  if (!browser) return false;
  if (unit === 'bytes') return Math.abs(a - b) <= TOLERANCE.bytesRelative * Math.max(Math.abs(a), Math.abs(b));
  if (unit === 'db') return Math.abs(a - b) <= TOLERANCE.psnrDb;
  if (unit === 'ratio') return Math.abs(a - b) <= TOLERANCE.bytesRelative * Math.max(Math.abs(a), Math.abs(b));
  return false;
}

export function compareNumbers(id: string, before: Record<string, MeasuredNumber>, after: Record<string, MeasuredNumber>, problems: string[]): void {
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const a = before[name];
    const b = after[name];
    if (!a || !b) {
      problems.push(`${id}.${name}: ${a ? 'not measured now' : 'new number'}`);
      continue;
    }
    if (!close(a.value, b.value, a.unit, a.method.runner === 'playwright')) problems.push(`${id}.${name}: ${a.value} in the file, ${b.value} now (${a.unit}, ${a.method.runner})`);
  }
}

export function compareTables(id: string, before: Record<string, MeasuredTable>, after: Record<string, MeasuredTable>, problems: string[]): void {
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const a = before[name];
    const b = after[name];
    if (!a || !b || a.rows.length !== b.rows.length || a.columns.join() !== b.columns.join() || JSON.stringify(a.kinds) !== JSON.stringify(b.kinds)) {
      problems.push(`${id} table ${name}: a different shape`);
      continue;
    }
    // Each column says who measured it and in which unit (DECISOES § 196): a Node column compares exactly even in a
    // table that also has browser columns, and a browser column gets the tolerance of its unit, whatever its name.
    a.rows.forEach((row, r) =>
      row.forEach((cell: Cell, c) => {
        const other = b.rows[r]?.[c];
        const column = a.columns[c] ?? '';
        const kind = a.kinds[c];
        if (!kind) {
          problems.push(`${id} table ${name}, ${column}: no kind for the column`);
          return;
        }
        const same = typeof cell === 'number' && typeof other === 'number' ? close(cell, other, kind.unit, kind.runner === 'playwright') : cell === other;
        if (!same) problems.push(`${id} table ${name}, row ${r + 1}, ${column}: ${String(cell)} in the file, ${String(other)} now`);
      }),
    );
  }
}
