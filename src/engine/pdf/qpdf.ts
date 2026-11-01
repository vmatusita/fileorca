// qpdf 12.2.0 compiled to WebAssembly (@neslinesli93/qpdf-wasm), loaded on first use: the glue and its .wasm come
// only when Compress, Protect or Unlock run, or when a file turns out to be encrypted (to tell a password from owner
// restrictions). One single-thread instance per worker, reused across files; the files of each run are removed from its
// in-memory file system afterwards, and the instance is dropped when its memory grew past 512 MB (WebAssembly memory
// never shrinks) or when a run aborted. What qpdf prints goes into a buffer through FS.init (the glue takes no
// print/printErr), never to the console, so a password on its command line cannot reach the console.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import { asset } from './assets.ts';
import { loading } from './errors.ts';

interface QpdfInstance {
  callMain(args: string[]): number;
  FS: {
    init(input: (() => number | null) | null, output: (code: number) => void, error: (code: number) => void): void;
    mkdir(path: string): void;
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string): Uint8Array;
    unlink(path: string): void;
  };
  HEAPU8: Uint8Array;
}

type QpdfFactory = (options: Record<string, unknown>) => Promise<QpdfInstance>;

/** Exit codes of qpdf (manual, "Exit Status"). */
export const QPDF_OK = 0;
export const QPDF_ERROR = 2;
export const QPDF_WARNINGS = 3;

const MAX_MEMORY = 512 * 1024 * 1024;

let instance: Promise<QpdfInstance> | null = null;
let output: number[] = [];

function start(): Promise<QpdfInstance> {
  instance ??= (async () => {
    const module = (await loading(import('@neslinesli93/qpdf-wasm'))) as unknown as { default?: QpdfFactory } & QpdfFactory;
    const factory = (module.default ?? module) as QpdfFactory;
    const where = asset('qpdfWasm');
    const qpdf = await loading(
      factory({
        locateFile: () => where,
        noInitialRun: true,
        noFSInit: true,
        preRun: [
          (module: QpdfInstance) => {
            module.FS.init(null, (code) => void output.push(code), (code) => void output.push(code));
          },
        ],
      }),
    );
    qpdf.FS.mkdir('/in');
    qpdf.FS.mkdir('/out');
    return qpdf;
  })();
  instance.catch(() => (instance = null));
  return instance;
}

/** Fetches and compiles the glue and the .wasm; nothing runs. */
export async function warmQpdf(): Promise<void> {
  await start();
}

export interface QpdfRun {
  code: number;
  /** What qpdf wrote to stdout and stderr, as lines. */
  lines: string[];
  /** The file it wrote to /out/out.pdf, or null. */
  bytes: Uint8Array | null;
}

/**
 * Runs qpdf once. `args` name the input as IN and the output as OUT (replaced by their paths); the input bytes are
 * written to the in-memory file system first and every file is removed afterwards. A process exit in node sets
 * process.exitCode; that is put back, so a test or a script never inherits qpdf's status.
 */
export async function runQpdf(args: readonly string[], input: Uint8Array | null): Promise<QpdfRun> {
  const qpdf = await start();
  const nodeProcess = (globalThis as { process?: { exitCode?: number | string | undefined } }).process;
  const exitCode = nodeProcess?.exitCode;
  const inPath = '/in/in.pdf';
  const outPath = '/out/out.pdf';
  output = [];
  let code: number;
  let bytes: Uint8Array | null = null;
  try {
    if (input) qpdf.FS.writeFile(inPath, input);
    code = qpdf.callMain(args.map((arg) => (arg === 'IN' ? inPath : arg === 'OUT' ? outPath : arg)));
    try {
      bytes = new Uint8Array(qpdf.FS.readFile(outPath));
    } catch {
      bytes = null;
    }
  } catch (error) {
    // An abort leaves the module unusable: the next run starts a new one.
    instance = null;
    throw error;
  } finally {
    for (const path of [inPath, outPath]) {
      try {
        qpdf.FS.unlink(path);
      } catch {
        // not there
      }
    }
    if (nodeProcess) nodeProcess.exitCode = exitCode;
    if (qpdf.HEAPU8.length > MAX_MEMORY) instance = null;
  }
  const lines = new TextDecoder().decode(Uint8Array.from(output)).split('\n').filter((line) => line.length > 0);
  output = [];
  return { code, lines, bytes };
}

/** Whether qpdf can open the file without a password ('restricted' when it is encrypted but opens, 'password' when it does not). */
export async function lockOf(bytes: Uint8Array): Promise<'none' | 'restricted' | 'password'> {
  const run = await runQpdf(['--show-encryption', 'IN'], bytes);
  if (run.lines.some((line) => /invalid password/i.test(line))) return 'password';
  if (run.lines.some((line) => /File is not encrypted/i.test(line))) return 'none';
  return 'restricted';
}
