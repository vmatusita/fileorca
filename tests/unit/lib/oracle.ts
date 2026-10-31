// The image fixtures and their oracle (fixtures/images/expected.json), for the engine tests. The
// oracle was written by hand and by an independent walk of the files; no engine code made it.

import { readFileSync } from 'node:fs';

export interface HeifOracle {
  majorBrand: string;
  compatibleBrands: string[];
  primaryItemId: number;
  primaryType: string;
  ispe: [number, number];
  /** Degrees anticlockwise, or null when the primary has no irot. */
  irot: number | null;
  imir: number | null;
  exifItem: boolean;
  exifItemIds: number[];
  topLevelImageItemIds: number[];
  auxiliaryItemIds: number[];
  thumbnailItemIds: number[];
  iccDisplayP3: boolean;
}

export interface OracleEntry {
  format: string;
  displayWidth: number;
  displayHeight: number;
  storedWidth: number;
  storedHeight: number;
  orientation: number;
  hasGps: boolean;
  gpsKind: string;
  hasAlpha: boolean;
  imageCount: number;
  animated?: boolean;
  expect: 'ok' | 'empty' | 'unsupported' | 'truncated' | 'decode';
  heif?: HeifOracle;
  notes?: string[];
}

const DIR = 'fixtures/images/';

export function oracle(): Record<string, OracleEntry> {
  return (JSON.parse(readFileSync(`${DIR}expected.json`, 'utf8')) as { files: Record<string, OracleEntry> }).files;
}

export function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(`${DIR}${name}`));
}

export function names(prefix: string): string[] {
  return Object.keys(oracle()).filter((name) => name.startsWith(prefix));
}
