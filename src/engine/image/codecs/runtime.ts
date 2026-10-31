// Shared plumbing of the WASM codec loaders: fetch and compile a .wasm once, start an Emscripten
// module from the compiled module, and keep the warnings the codecs print instead of the console.
//
// Only the single-thread glue of each codec is ever imported (DECISOES § 7): the package entry
// points (encode.js of AVIF and WebP, optimise.js of OxiPNG, the resize index) would pull the
// multi-thread builds, the worker helpers and the SharedArrayBuffer probe into dist/.
// Self-contained: nothing here imports from outside src/engine/image/.

const compiledModules = new Map<string, Promise<WebAssembly.Module>>();
const fetchedBytes = new Map<string, Promise<ArrayBuffer>>();

async function compileWasm(url: string): Promise<WebAssembly.Module> {
  try {
    return await WebAssembly.compileStreaming(fetch(url));
  } catch {
    // compileStreaming needs Content-Type: application/wasm; the second fetch comes from the HTTP cache.
    const response = await fetch(url);
    if (!response.ok) throw new Error(`could not fetch ${url}: ${response.status}`);
    return WebAssembly.compile(await response.arrayBuffer());
  }
}

/** The compiled module of a .wasm URL, fetched and compiled once (a failed attempt is retried next time). */
export function compiled(url: string): Promise<WebAssembly.Module> {
  let module = compiledModules.get(url);
  if (!module) {
    module = compileWasm(url);
    compiledModules.set(url, module);
    module.catch(() => compiledModules.delete(url));
  }
  return module;
}

/** The raw bytes of a .wasm URL, fetched once (libheif wants the bytes, not a compiled module). */
export function bytesOf(url: string): Promise<ArrayBuffer> {
  let bytes = fetchedBytes.get(url);
  if (!bytes) {
    bytes = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`could not fetch ${url}: ${response.status}`);
      return response.arrayBuffer();
    });
    fetchedBytes.set(url, bytes);
    bytes.catch(() => fetchedBytes.delete(url));
  }
  return bytes;
}

export interface EmscriptenOptions {
  print?: (message: string) => void;
  printErr?: (message: string) => void;
}

type Factory<T> = (options: Record<string, unknown>) => Promise<T>;

/** Starts an Emscripten module from a compiled WebAssembly.Module (the way jSquash's own init does). */
export function startEmscripten<T>(factory: unknown, module: WebAssembly.Module, options: EmscriptenOptions = {}): Promise<T> {
  return (factory as Factory<T>)({
    noInitialRun: true,
    instantiateWasm: (imports: WebAssembly.Imports, done: (instance: WebAssembly.Instance) => void) => {
      const instance = new WebAssembly.Instance(module, imports);
      done(instance);
      return instance.exports;
    },
    print: () => {},
    printErr: () => {},
    ...options,
  });
}

/** Copy of bytes the wasm side returned (they may be a view of the module memory, which can grow). */
export function copyOut(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(bytes);
}
