// What the PDF island (PdfPanel) is given (F5a, decision 6): plain data the page computes at build and writes into
// data-props (DECISOES § 23), and the behaviour of each tool (tools.tsx), never serialised.
import type { ComponentType } from 'preact';
import type { PdfInspect, PdfOperation } from '../../engine/pdf/types.ts';
import type { CarryLabel, PdfPanelTexts, PdfToolPanelTexts } from '../../i18n/types.ts';
import type { Outcome } from '../../analytics/events.ts';
import type { ChipCarry } from '../image/types.ts';
import type { ImageNeighbour, PdfPageDef, PdfToolId } from './registry.ts';
import type { Lang } from '../../i18n/routes.ts';

export interface PdfChip {
  href: string;
  name: string;
  target: PdfToolId | ImageNeighbour | 'home';
  /** Inner markup of the icon, read at build. */
  icon: string;
  category: 'image' | 'pdf' | 'none';
  /** F13a · UX-14 (DECISOES § F13A-H-01): the chip can take the result along to its tool; only a link without this. */
  carry?: ChipCarry;
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
  /** The chevron of the "Adjust" and "Order" disclosures after the result (F13a, UX-04 A). */
  down: string;
  /** The icon of a note of the design system (F13a, F-10): brand-soft with the info icon. */
  info: string;
  /** F13a · UX-14 (DECISOES § F13A-H-01): the shield of the line under the chips that take the result along. */
  shield: string;
}

export interface PdfPanelData<O = object> {
  lang: Lang;
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
  /** F13a · UX-14 (DECISOES § F13A-H-03): the pages that can send their result here with a chip, by id, with their name. */
  origins: Record<string, string>;
  /** F13a · UX-14: the line under the chips that take the result along, in the words of what this page makes (PDFs, or images). */
  carryLine: CarryLabel;
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
  /**
   * Object URL of a small JPEG of page `index`, or null. Draws it on first ask. `width` is the width of the picture in
   * pixels, 240 for the grid by default; the Sign preview asks for its own (F13a, F-5).
   */
  get(index: number, width?: number): Promise<string | null>;
  /** The cell left the screen: its picture can go. */
  drop(index: number, width?: number): void;
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
  /** What the options are set to, in a few words: the "Adjust · …" line after the result of a tool that runs by itself. */
  summary?: (state: S, texts: O) => string;
  /** Thumbnails of the pages are drawn (a single-file tool with a page grid). */
  grid?: (state: S) => boolean;
  /**
   * Options of a batch tool that belong to one file (Rotate's page-by-page turns): back to `initial` when a new drop
   * replaces the files, as every option of a single-file tool is (DECISOES § 178).
   */
  perFile?: readonly (keyof S)[];
  Options?: ComponentType<PdfOptionsProps<S, O>>;
}
