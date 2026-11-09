// What the shared image island (ImagePanel) is given. Two kinds of input:
//  - ImagePanelData: plain data the page computes at build and writes into data-props, so the island
//    hydrates from exactly what the server rendered (DECISOES § 23);
//  - ImageTool: the behaviour of one tool (its options, the operation each file goes through), written
//    in the tool's own Panel.tsx and never serialised.
import type { ComponentType } from 'preact';
import type { Lang } from '../../i18n/routes.ts';
import type { ImagePanelTexts, ImageToolPanelTexts } from '../../i18n/types.ts';
import type { ImageFormat, Operation, WarmKind } from '../../engine/image/types.ts';
import type { PdfPageSize } from '../../engine/pdf/build.ts';
import type { ImagePageId, ImageToolId, PdfNeighbour } from './registry.ts';
import type { Success } from './summary.ts';

/** A next-step chip: a link to another tool that exists in this language (or to the home). */
export interface ChipData {
  href: string;
  name: string;
  target: ImageToolId | PdfNeighbour | 'home';
  /** Inner markup of the icon (docs/design/assets/Icons), read at build. */
  icon: string;
  /** Colour of the chip dot; the home chip has none (brand-soft). */
  category: 'image' | 'pdf' | 'none';
  /** F13a · UX-14 (DECISOES § 496): the chip can take the result along to its tool; only a link without this. */
  carry?: ChipCarry;
}

/**
 * F13a · UX-14 (DECISOES § 496 and § 497): what a chip needs to take the result along: what its tool takes (the
 * formats of its registry, an image format or "pdf") and whether it takes one file at a time, the rule of takes() in
 * src/share/logic.ts, and the label it shows when it does (one file, or several with {count}).
 */
export interface ChipCarry {
  accepts: string[];
  single: boolean;
  one: string;
  many: string;
}

export interface ConverterLink {
  href: string;
  name: string;
}

/** Everything the page writes into data-props. */
export interface ImagePanelData<O = object> {
  lang: Lang;
  page: ImagePageId;
  t: ImagePanelTexts;
  texts: ImageToolPanelTexts<O>;
  /** Real formats the tool takes (the registry). */
  accepts: ImageFormat[];
  beforeAfter: 'always' | 'lossy' | 'never';
  /** One PDF with the whole batch instead of one file per image. */
  pdf: boolean;
  chips: ChipData[];
  /** Where a HEIC or an AVIF can go instead, for the "open it in …" link of a refused file (CONVERTER_FOR: a format with no converter has no entry). */
  converters: { heic?: ConverterLink; avif?: ConverterLink };
  /**
   * F13a (D-17; DECISOES § 469): a format another tool of the site takes better (a PNG on HEIC to JPG) and the chip to
   * it, which the band under the rectangle shows in place of the options when the one file refused is of that format.
   */
  elsewhere?: { format: ImageFormat; chip: ChipData };
  /** Where the coffee line leads: Ko-fi, or the Pix of the support page in Portuguese (F6). */
  coffeeHref: string;
  /**
   * F13a · UX-14 (DECISOES § 498): the pages that can send their result here with a chip, by id, with their name in the
   * language: the note of the arrival and the empty box say it, and a choice that names another page is not believed.
   */
  origins: Record<string, string>;
  /**
   * F13a · UX-14: inner markup of the icons only the result that goes along uses (the info of the empty box, the shield of
   * the line under the chips), read at build like the icons of the PDF island: a ?raw import would grow the shared chunk.
   */
  carryIcons: { info: string; shield: string };
  /**
   * F15 (DECISOES § 651 and § 652): inner markup of the arrows and of the bin outside the card in the rows of a batch, read at
   * build like carryIcons (the card has its own bin; a second ?raw import of it would grow the shared chunk).
   */
  listIcons: { chevron: string; trash: string };
  /** Options the page starts the tool with, over the tool's own (a guide, by property of the page; never the URL). */
  initial?: Record<string, unknown>;
}

/** A file of the queue, as the tool sees it when it builds an operation. */
export interface FileInfo {
  id: number;
  name: string;
  size: number;
  /** Display size of the picture, known once the file went through the engine at least once. */
  width: number | null;
  height: number | null;
}

/** The file the comparison or the crop box shows, with a picture the browser can display. */
export interface SelectedFile extends FileInfo {
  /** Object URL of the original, or of a decoded copy when the browser cannot show the format. */
  url: string | null;
}

export interface OptionsProps<S, O> {
  state: S;
  /** Changes some options: the whole batch is processed again at once. */
  update: (patch: Partial<S>) => void;
  /** The tool's own option texts (ImageToolPanelTexts.options). */
  texts: O;
  /** The texts shared by every image tool. */
  panel: ImagePanelTexts;
  lang: Lang;
  /** The queue, in order, and the file picked in it (the first ready one by default). */
  files: FileInfo[];
  selected: SelectedFile | null;
  select: (id: number) => void;
  /** A run is going on (the options stay usable: changing one starts the batch again). */
  busy: boolean;
}

export interface ImageTool<S extends object, O = object> {
  /** Codecs to fetch ahead of the first file (the pointer over the zone, the focus on the button). */
  warm: readonly WarmKind[];
  /** The word tool_complete and the coffee count carry when a file came out. */
  success: Success;
  initial: S;
  /** What each file goes through for these options. A file is processed again only when this changes. */
  operation: (state: S, file: FileInfo) => Operation;
  /** The sheet of the PDF (Image to PDF): changing it only builds the PDF again. */
  pdfSize?: (state: S) => PdfPageSize;
  /** Show the pick toggle on every ready row (Crop uses it to choose the box to adjust). */
  selectable?: boolean;
  /**
   * The option fields, in the band under the rectangle: at sight before the result, folded under "Adjust" after it (F13a,
   * UX-04 A; DECISOES § 466).
   */
  Options?: ComponentType<OptionsProps<S, O>>;
  /**
   * What the options are now, said after "Adjust ·" ("Recommended", "50%", "Square"). A tool without it has nothing to
   * adjust (PNG to JPG and the presets: one sentence), and its sentence stays at sight under the chips.
   */
  now?: (state: S, texts: O, lang: Lang) => string;
}
