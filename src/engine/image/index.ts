// The public entry of the engine when it is used as a package (scripts/oss/image-engine.ts exports this folder as
// fileorca-image-engine). The site does not import it: its pages load process.ts, zip.ts and the worker one by
// one, on demand, to keep the initial JavaScript at two files. Here they are together, in the order of use:
//
//   configureWasm({ ... });                                    // once, with the URL of each .wasm file
//   const result = await processImage(file, operation, accepts, onProgress);
//
// Everything runs on the thread that calls it. For a Web Worker, use the optional entry `./worker` (Comlink).
// Self-contained: nothing here imports from outside src/engine/image/.

export { processImage } from './process.ts';
export { configureWasm } from './codecs/wasm.ts';
export type { WasmUrls } from './codecs/wasm.ts';
export { warm } from './codecs/warm.ts';
export { zipStored } from './zip.ts';
export type { ZipEntry } from './zip.ts';
export { EngineError } from './errors.ts';
export { sniff } from './sniff.ts';
export { CANVAS_MAX_PIXELS, WASM_MAX_PIXELS } from './types.ts';
export type {
  Box,
  EngineFailure,
  EngineOutput,
  EngineResult,
  FailureReason,
  Flip,
  ImageFormat,
  Level,
  Note,
  Operation,
  OutputFormat,
  Probe,
  Progress,
  Sniffed,
  Turn,
  WarmKind,
} from './types.ts';
