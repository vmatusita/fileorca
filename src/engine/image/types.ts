// The image engine contract: what the page asks for and what comes back, the same in the worker and
// in the page fallback (DECISOES § 22). Plain data only, so it crosses the Comlink boundary as is.
// Self-contained: nothing here imports from outside src/engine/image/ (lint rule).

/** Real formats, read from the first bytes of the file (never from the name or the declared type). */
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'heic' | 'avif';

/** What the sniffer says about a file: an image format, or why it is not one we can read. */
export type Sniffed = ImageFormat | 'gif' | 'empty' | 'unknown';

export type Level = 'recommended' | 'strong';

/** Output formats the engine writes. */
export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export type Turn = 'right' | 'left' | 'half';
export type Flip = 'none' | 'horizontal' | 'vertical';

/** A rectangle in display pixels (after the photo orientation is applied). */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Operation =
  /** Same format; JPG by MozJPEG, PNG by OxiPNG (lossless), WebP by the jSquash encoder. */
  | { kind: 'compress'; level: Level }
  /** JPG of at most `maxBytes`; a file that already fits goes back without metadata, in its format. */
  | { kind: 'target'; maxBytes: number }
  /** Fits inside width × height (never enlarges), or scales by `percent` (1 to 100). */
  | { kind: 'resize'; mode: 'size'; width: number; height: number }
  | { kind: 'resize'; mode: 'percent'; percent: number }
  /** Exactly width × height: centre crop to the ratio, then scale (the YouTube thumbnail). */
  | { kind: 'cover'; width: number; height: number; format: 'jpeg'; maxBytes: number }
  /** Crop to `box` (display pixels); without a box, the centred box of `ratio` (width / height). */
  | { kind: 'crop'; ratio: number | null; box?: Box }
  | { kind: 'rotate'; turn: Turn; flip: Flip }
  /**
   * Re-encode in another format; `level` only matters for WebP and AVIF. 'swap' is PNG to JPG and
   * JPG to PNG: a PNG becomes a JPEG (transparency turns white), anything else becomes a PNG.
   */
  | { kind: 'convert'; to: OutputFormat | 'swap'; level?: Level }
  /** One page of a PDF: JPEG for photos, PNG when the image has transparency (src/engine/pdf/). */
  | { kind: 'pdf-page' };

/** Facts the result card states in one line each. */
export type Note =
  /** Transparent pixels were painted white (JPG has no alpha). */
  | 'flattened'
  /** Animated WebP: only the first frame was kept. */
  | 'first-frame'
  /** Resize asked for more pixels than the photo has: the original size was kept. */
  | 'not-enlarged'
  /** The target size needed smaller dimensions (width × height are in the result). */
  | 'downscaled'
  /** The cover crop cut the edges to fill the frame. */
  | 'center-cropped'
  /** The cover needed more pixels than the photo has: the photo was enlarged. */
  | 'enlarged';

export interface EngineOutput {
  ok: true;
  blob: Blob;
  format: OutputFormat;
  width: number;
  height: number;
  /**
   * new: a new file was written from the pixels; no-gain: the copy would not be smaller and the
   * original goes back without metadata; cannot-encode: this browser cannot save the format, the
   * original goes back without metadata; fits: the file already fit the target size.
   */
  outcome: 'new' | 'no-gain' | 'cannot-encode' | 'fits';
  notes: Note[];
  /** Displayable copy of the source when the browser cannot show it (HEIC, AVIF decoded by WASM). */
  preview?: Blob;
  /** The source format, read from the bytes. */
  source: ImageFormat;
  /** Display size of the source, after orientation. */
  sourceWidth: number;
  sourceHeight: number;
}

export type FailureReason =
  /** The file has no bytes. */
  | 'empty'
  /** Not an image format we know (a text file named .png). */
  | 'unsupported'
  /** A known format this tool does not take (HEIC in Compress): `source` says which. */
  | 'wrong-tool'
  /** The file stops before its end (a truncated JPEG). */
  | 'truncated'
  /** The bytes are damaged and no decoder could read them. */
  | 'decode'
  /** No encoder could write the output. */
  | 'encode'
  /** Bigger than this tool can handle in this browser (the no-canvas path is not wired here). */
  | 'too-large';

export interface EngineFailure {
  ok: false;
  reason: FailureReason;
  source?: Sniffed;
}

export type EngineResult = EngineOutput | EngineFailure;

export type Progress = (percent: number) => void;

/** Above this many pixels the image skips the canvas (the Safari limit on the iPhone). */
export const CANVAS_MAX_PIXELS = 16_777_216;

/** Display size and facts of a source, read without decoding the pixels. */
export interface Probe {
  format: ImageFormat;
  width: number;
  height: number;
}

/** Codec families the page can ask the worker to fetch ahead of the first file (pointer over the zone). */
export type WarmKind = 'jpeg' | 'webp' | 'avif' | 'png' | 'resize' | 'heic';
