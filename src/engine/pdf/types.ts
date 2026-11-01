// What goes in and out of the PDF engine (F5a). Plain, serialisable data: the page sends an operation and the files,
// the worker answers with the outputs or a failure from a closed list of reasons. A bad file never rejects (decision 4).
// Self-contained: nothing here imports from outside src/engine/pdf/.

/** Why a file did not come out. The page turns each one into an Oli line; the events carry it in tool_error. */
export const PDF_REASONS = [
  'empty',
  'not-pdf',
  'truncated',
  'corrupted',
  'needs-password',
  'wrong-password',
  'restricted',
  'not-encrypted',
  'too-large',
  'encode',
  'load',
] as const;
export type PdfReason = (typeof PDF_REASONS)[number];

/** What the bytes are, read from the first kilobyte (never from the name). */
export type PdfSniffed = 'pdf' | 'jpeg' | 'png' | 'webp' | 'gif' | 'heic' | 'text' | 'unknown' | 'empty';

export interface PdfFailure {
  ok: false;
  reason: PdfReason;
  /** What the bytes looked like, for the line of a file that is not a PDF (an image gets the Image to PDF link). */
  source?: PdfSniffed;
}

/** One page as it shows on screen: the visible box (CropBox inside the MediaBox) and its /Rotate. */
export interface PageBox {
  /** Width and height of the visible box before the turn, in points. */
  width: number;
  height: number;
  /** 0, 90, 180 or 270. */
  rotate: number;
}

/** The lock of a file: none, owner restrictions only (it opens without a password), or a password to open it. */
export type PdfLock = 'none' | 'restricted' | 'password';

export interface PdfInspect {
  ok: true;
  pages: number;
  boxes: PageBox[];
  lock: PdfLock;
  /** Form widgets on the pages, and whether the catalog carries an XFA form. */
  form: { widgets: number; xfa: boolean };
  outline: boolean;
  /** The cross-reference table did not point at the objects: pdf-lib read them anyway, and the output is a sound file. */
  repaired: boolean;
}

export type PdfInspectResult = PdfInspect | PdfFailure;

export type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type NumberFormat = 'n' | 'page-n' | 'page-n-of-total' | 'n-of-total';
export type CompressMode = 'lossless' | 'recommended' | 'strong';

/**
 * One request. Page numbers are 0-based indices the page already parsed (the engine never reads a typed range);
 * merge takes every file in order, the others one file.
 */
export type PdfOperation =
  | { kind: 'merge' }
  | { kind: 'split'; parts: number[][] }
  | { kind: 'delete'; remove: number[] }
  | { kind: 'reorder'; order: number[] }
  /** Quarter turns clockwise per page (0 to 3); an empty list turns every page by `all`. */
  | { kind: 'rotate'; all: number; pages: Record<number, number> }
  | { kind: 'numbers'; position: Position; format: NumberFormat; start: number; skipFirst: boolean }
  | { kind: 'watermark'; text: string; size: 'small' | 'medium' | 'large'; opacity: 'light' | 'medium' | 'strong'; direction: 'diagonal' | 'horizontal' }
  /** The signature as a PNG, the pages it goes on, and its box as fractions of the page as shown (top left corner and width). */
  | { kind: 'sign'; image: Uint8Array; pages: number[]; box: { x: number; y: number; width: number } }
  | { kind: 'compress'; mode: CompressMode }
  | { kind: 'protect'; password: string }
  | { kind: 'unlock'; password: string | null }
  | { kind: 'images'; format: 'jpeg' | 'png'; ppi: 72 | 150 | 300; pages: number[] | null };

/** Something the result says about the file (one Oli line each). */
export type PdfNote =
  | 'repaired'
  | 'xfa-removed'
  | 'form-lost'
  | 'text-flattened'
  | 'bookmarks-kept'
  | 'downscaled'
  | 'form-kept';

export interface PdfOutput {
  bytes: Uint8Array;
  kind: 'pdf' | 'jpeg' | 'png';
  /** For an image of a page, or a part of a split: the 1-based page or part number it stands for. */
  index?: number;
  pages?: number;
  width?: number;
  height?: number;
}

export interface PdfSuccess {
  ok: true;
  outputs: PdfOutput[];
  /** 'unchanged': nothing got better, the original bytes came back (Compress). */
  outcome: 'new' | 'unchanged';
  notes: PdfNote[];
}

export type PdfResult = PdfSuccess | PdfFailure;
