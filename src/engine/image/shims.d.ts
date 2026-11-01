// Ambient types for the one import the codec loaders use that TypeScript cannot see: libheif-js, whose own
// libheif.d.ts lacks the HeifDecoder and HeifImage classes. The jSquash glue modules are typed in the loaders
// themselves. The engine imports no .wasm: the host passes their URLs (codecs/wasm.ts).

declare module 'libheif-js/libheif-wasm/libheif.js' {
  /** One decoded top-level image of a HEIF file. Call free() when done. */
  export interface HeifImage {
    free(): void;
    /** Size on screen: libheif has already applied irot, imir and clap. */
    get_width(): number;
    get_height(): number;
    is_primary(): boolean;
    has_alpha_channel(): boolean;
    /** Fills `target.data` with RGBA 8-bit pixels; the callback gets the filled object, or null. */
    display(target: { data: Uint8ClampedArray; width: number; height: number }, callback: (filled: { data: Uint8ClampedArray; width: number; height: number } | null) => void): void;
  }

  export interface HeifDecoder {
    decoder: unknown;
    /** The top-level images, in item-id order (not primary first). Empty when the file cannot be parsed. */
    decode(buffer: Uint8Array | ArrayBuffer): HeifImage[];
  }

  export interface HeifModule {
    HeifDecoder: new () => HeifDecoder;
    heif_context_free(context: unknown): void;
  }

  export interface HeifOptions {
    wasmBinary?: ArrayBuffer;
    locateFile?: (path: string) => string;
    onRuntimeInitialized?: () => void;
    print?: (message: string) => void;
    printErr?: (message: string) => void;
  }

  /** The module is ready when this returns (the wasm is instantiated synchronously from wasmBinary). */
  const libheif: (options?: HeifOptions) => HeifModule;
  export default libheif;
}
