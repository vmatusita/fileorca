// The bookkeeping of the measurements: who measured what (the method), on which files (the sample), when and on which
// commit, and the SHA-256 of the script itself, which tests/unit/guides-measured.test.ts recomputes the same way.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Cell, ColumnKind, MeasuredNumber, MeasuredTable, Method, Sample, Unit } from '../../../src/tools/guides/measured-types.ts';

export const SCRIPT_DIR = 'scripts/guides';

/** Every file of the script, sorted, with forward slashes. */
export function scriptFiles(dir = SCRIPT_DIR): string[] {
  const out: string[] = [];
  const walk = (at: string): void => {
    for (const name of readdirSync(at).sort()) {
      const full = join(at, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.ts')) out.push(full.split('\\').join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

/** SHA-256 over each file's path and text, line endings made LF (a Windows checkout and the CI hash the same). */
export function scriptHash(files: readonly string[]): string {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(`${file}\0`);
    hash.update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export function headCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

export interface Stamp {
  date: string;
  commit: string;
}

export function sample(files: readonly string[], note?: string): Sample {
  const unique = [...new Set(files)];
  return note ? { files: unique, count: unique.length, note } : { files: unique, count: unique.length };
}

/** One number with everything the test asks of it. */
export function num(stamp: Stamp, value: number, unit: Unit, sampled: Sample, method: Method): MeasuredNumber {
  if (!Number.isFinite(value)) throw new Error(`a measured number must be finite (got ${value})`);
  return { value, unit, sample: sampled, method, date: stamp.date, commit: stamp.commit };
}

/** A column of a table: its name, who measured it and its unit (a label is a name, a browser, a format). */
export type Column = [name: string, runner: ColumnKind['runner'], unit: ColumnKind['unit']];
/** A label column, and a column measured in Node or in the browser. */
export const label = (name: string): Column => [name, 'node', 'label'];
export const inNode = (name: string, unit: Unit): Column => [name, 'node', unit];
export const inBrowser = (name: string, unit: ColumnKind['unit']): Column => [name, 'playwright', unit];

export function table(stamp: Stamp, columns: Column[], rows: Cell[][], sampled: Sample, methods: Method[]): MeasuredTable {
  for (const row of rows) if (row.length !== columns.length) throw new Error(`a row has ${row.length} cells for ${columns.length} columns`);
  const kinds = columns.map(([, runner, unit]) => ({ runner, unit }));
  if (kinds.some((kind) => kind.runner === 'playwright') && !methods.some((how) => how.runner === 'playwright')) throw new Error('a browser column in a table measured with no browser');
  return { columns: columns.map(([name]) => name), kinds, rows, sample: sampled, methods, date: stamp.date, commit: stamp.commit };
}

export const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

export function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? (sorted[middle] as number) : ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;
}

/** A ratio kept to four decimals, so the JSON reads the same on every run. */
export const ratio = (a: number, b: number): number => Math.round((a / b) * 10_000) / 10_000;
/** A decibel value to two decimals. */
export const decibels = (value: number): number => Math.round(value * 100) / 100;
