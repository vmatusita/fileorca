// What the PDF island (PdfPanel) is given (F5a, decision 6): plain data the page computes at build and writes into
// data-props (DECISOES § 23), and the behaviour of each tool (tools.tsx), never serialised.
import type { ComponentType } from 'preact';
import type { PdfInspect, PdfOperation } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts, PdfToolPanelTexts } from '../../i18n/types.ts';
import type { Outcome } from '../../analytics/events.ts';
import type { ImageNeighbour, PdfPageDef, PdfToolId } from './registry.ts';

export interface PdfChip {
  href: string;
  name: string;
  target: PdfToolId | ImageNeighbour | 'home';
  /** Inner markup of the icon, read at build. */
  icon: string;
  category: 'image' | 'pdf' | 'none';
}

export interface PdfLink {
  href: string;
  name: string;
}

/** Inner markup of the icons only the PDF island uses, read at build (an island ?raw import would grow the shared chunk). */
export interface PdfIcons {
  pdf: string;
  rotate: string;
  trash: string;
  chevron: string;
  plus: string;
  /** The handle of a row of the Merge list: Space picks it up, the arrow keys move it. */
  reorder: string;
}

export interface PdfPanelData<O = object> {
  lang: 'en';
  page: PdfToolId;
  t: PdfPanelTexts;
  texts: PdfToolPanelTexts<O>;
  files: PdfPageDef['files'];
  run: PdfPageDef['run'];
  suffix: string;
  chips: PdfChip[];
  /** Where a locked file and an image named .pdf are sent. */
  links: { unlock: PdfLink; imageToPdf: PdfLink };
  icons: PdfIcons;
  /** The ink of the light theme (the "ink" token), for the signature: it lands on a white page in any theme. */
  ink: string;
  coffeeHref: string;
  adsOn: boolean;
}

/** A file of the panel as a tool sees it. */
export interface PdfFileView {
  id: number;
  name: string;
  size: number;
  /** What the engine read, once it has. */
  info: PdfInspect | null;
}

/** Thumbnails of the pages of the file a single-file tool works on. */
export interface Thumbnails {
  /** Object URL of a small JPEG of page `index`, or null. Draws it on first ask. */
  get(index: number): Promise<string | null>;
  /** The cell left the screen: its picture can go. */
  drop(index: number): void;
}

export interface PdfOptionsProps<S, O> {
  state: S;
  update: (patch: Partial<S>) => void;
  texts: O;
  panel: PdfPanelTexts;
  icons: PdfIcons;
  ink: string;
  /** The file of a single-file tool (or the only file of a batch), once read; null before. */
  file: PdfFileView | null;
  files: PdfFileView[];
  thumbnails: Thumbnails | null;
  busy: boolean;
  /** The action was tried with something missing: fields show their error. */
  showErrors: boolean;
  /** The last failure of the file, so a password field can say it was wrong. */
  failure: string | null;
  /** Says something once through the status region. */
  announce: (message: string) => void;
}

export interface PdfToolDef<S extends object, O = object> {
  initial: S;
  /** Options that come from the page's texts (the default watermark text). */
  start?: (texts: O) => Partial<S>;
  /** The word tool_complete carries when a file came out. */
  success: Outcome;
  /** What to fetch ahead of the first file. */
  warm: readonly ('qpdf' | 'pdfjs' | 'codecs')[];
  /** The request for these options and this file (a batch asks once per file); null while something is missing. */
  operation: (state: S, file: PdfFileView, files: readonly PdfFileView[]) => PdfOperation | null;
  /** The text of the action button for this state, when the tool has one. */
  actionLabel?: (state: S, texts: O, file: PdfFileView | null, fallback: string) => string;
  /** Thumbnails of the pages are drawn (a single-file tool with a page grid). */
  grid?: (state: S) => boolean;
  Options?: ComponentType<PdfOptionsProps<S, O>>;
}
