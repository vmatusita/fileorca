// qpdf in Node, from the same WebAssembly build the site serves (@neslinesli93/qpdf-wasm): the PDF fixtures are
// made with it (scripts/fixtures/pdf.ts) and the tests read every output with it (qpdf --check, --show-encryption).
// One module per call: qpdf keeps no state between runs that a test could lean on, and a fresh module means a fresh
// in-memory file system. The glue prints through console.log and console.error, bound when the module starts (it
// does not take print/printErr), so both are swapped for a collector while the module starts and runs.
import { createRequire } from 'node:module';

interface QpdfModule {
  callMain(args: string[]): number;
  FS: {
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string): Uint8Array;
    unlink(path: string): void;
    readdir(path: string): string[];
    mkdir(path: string): void;
  };
}

type Factory = (options: Record<string, unknown>) => Promise<QpdfModule>;

const factory = createRequire(import.meta.url)('@neslinesli93/qpdf-wasm') as Factory;

export interface QpdfRun {
  /** Exit code: 0 ok, 2 error, 3 warnings (qpdf manual, "Exit Status"). --requires-password: 0 needs one, 2 not encrypted, 3 encrypted without one. */
  code: number;
  /** stdout and stderr lines, in order. */
  out: string[];
  /** Files the run left in /out/ (name to bytes). */
  files: Map<string, Uint8Array>;
}

/**
 * Runs qpdf with `args`; `inputs` are written to /in/<name> first, and every file qpdf writes under /out/ comes back.
 * Paths in `args` are written as /in/<name> and /out/<name>.
 */
export async function qpdf(args: readonly string[], inputs: Record<string, Uint8Array> = {}): Promise<QpdfRun> {
  const out: string[] = [];
  const log = console.log;
  const error = console.error;
  const exitCode = process.exitCode;
  console.log = (...parts: unknown[]) => void out.push(parts.join(' '));
  console.error = (...parts: unknown[]) => void out.push(parts.join(' '));
  try {
    const module = await factory({ noInitialRun: true });
    module.FS.mkdir('/in');
    module.FS.mkdir('/out');
    for (const [name, bytes] of Object.entries(inputs)) module.FS.writeFile(`/in/${name}`, bytes);
    const code = module.callMain([...args]);
    const files = new Map<string, Uint8Array>();
    for (const name of module.FS.readdir('/out')) {
      if (name !== '.' && name !== '..') files.set(name, new Uint8Array(module.FS.readFile(`/out/${name}`)));
    }
    return { code, out, files };
  } finally {
    console.log = log;
    console.error = error;
    // The glue sets process.exitCode on exit, as a command-line program would; a test run must not inherit it.
    process.exitCode = exitCode;
  }
}

/** `qpdf --check` of one file: exit code and what it said. */
export async function qpdfCheck(bytes: Uint8Array, password?: string): Promise<QpdfRun> {
  return qpdf(['--check', ...(password === undefined ? [] : [`--password=${password}`]), '/in/file.pdf'], { 'file.pdf': bytes });
}

/** `qpdf --show-encryption` lines of one file. */
export async function qpdfEncryption(bytes: Uint8Array, password?: string): Promise<QpdfRun> {
  return qpdf(['--show-encryption', ...(password === undefined ? [] : [`--password=${password}`]), '/in/file.pdf'], { 'file.pdf': bytes });
}

/** Runs qpdf from /in/file.pdf to /out/file.pdf with `options` in between, and returns the output. */
export async function qpdfTransform(bytes: Uint8Array, options: readonly string[]): Promise<{ code: number; out: string[]; bytes: Uint8Array | null }> {
  const run = await qpdf([...options, '/in/file.pdf', '/out/file.pdf'], { 'file.pdf': bytes });
  return { code: run.code, out: run.out, bytes: run.files.get('file.pdf') ?? null };
}
