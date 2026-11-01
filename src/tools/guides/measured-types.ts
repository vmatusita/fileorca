// The shape of data/guides-measured.json (prompt F5b, decision 3): what scripts/guides/measure.ts writes and what the
// guide pages read at build. Every number a guide shows carries its sample, its method, the date and the commit, so
// tests/unit/guides-measured.test.ts can check each one; nothing in a guide is typed by hand.
import type { FileGuideId } from './registry.ts';

export type Unit = 'bytes' | 'ratio' | 'count' | 'px' | 'db' | 'ppi';

/** How a value was measured: the engine's own code in Node, or the site's dist/ in a browser driven by Playwright. */
export type Method =
  | { runner: 'node'; engine: string }
  | { runner: 'playwright'; browser: 'chromium' | 'webkit'; version: string; os: string; path: string };

export interface Sample {
  /** The fixture files (or the files the script made from them), by name. */
  files: string[];
  count: number;
  /** What else narrows the sample: the pages of a PDF, the options of the tool. */
  note?: string;
}

export interface MeasuredNumber {
  value: number;
  unit: Unit;
  sample: Sample;
  method: Method;
  /** ISO date of the measurement. */
  date: string;
  /** The commit the script ran on. */
  commit: string;
}

export type Cell = string | number | boolean | null;

/** The raw rows behind a guide's "What we measured" table; the page formats them. */
export interface MeasuredTable {
  columns: string[];
  rows: Cell[][];
  sample: Sample;
  methods: Method[];
  date: string;
  commit: string;
}

/** An official figure the script measured against (guide 3), with the page it was read on. */
export interface OfficialSize {
  id: string;
  network: string;
  use: string;
  width: number;
  height: number;
  /** The heaviest file the page allows, in bytes, when it says. */
  limit: number | null;
  /** Ad specs are labelled as such: the network publishes no organic figure. */
  ad: boolean;
  source: { href: string; title: string; read: string };
}

export interface GuideMeasure {
  numbers: Record<string, MeasuredNumber>;
  tables: Record<string, MeasuredTable>;
  /** Plain facts the measurement settled that are not numbers (the tool guide 6 embeds). */
  facts: Record<string, string>;
  official?: OfficialSize[];
}

export interface MeasuredFile {
  version: 1;
  script: { files: string[]; sha256: string };
  commit: string;
  measuredOn: string;
  environment: { os: string; node: string; browsers: { chromium: string; webkit: string } };
  /** Fixed before the first measurement (DECISOES § 185): Node values compare exactly. */
  tolerance: { bytesRelative: number; psnrDb: number };
  guides: Record<FileGuideId, GuideMeasure>;
}
