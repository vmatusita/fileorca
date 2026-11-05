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
import type { ImagePageId, ImageToolId } from './registry.ts';
import type { Success } from './summary.ts';

/** A next-step chip: a link to another tool that exists in this language (or to the home). */
export interface ChipData {
  href: string;
  name: string;
  target: ImageToolId | 'home';
  /** Inner markup of the icon (docs/design/assets/Icons), read at build. */
  icon: string;
  /** Colour of the chip dot; the home chip has none (brand-soft). */
  category: 'image' | 'pdf' | 'none';
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
   * F13a (D-17; DECISOES § F13A-I-06): a format another tool of the site takes better (a PNG on HEIC to JPG) and the chip to
   * it, which the band under the rectangle shows in place of the options when the one file refused is of that format.
   */
  elsewhere?: { format: ImageFormat; chip: ChipData };
  /** Where the coffee line leads: Ko-fi, or the Pix of the support page in Portuguese (F6). */
  coffeeHref: string;
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
   * UX-04 A; DECISOES § F13A-I-03).
   */
  Options?: ComponentType<OptionsProps<S, O>>;
  /**
   * What the options are now, said after "Adjust ·" ("Recommended", "50%", "Square"). A tool without it has nothing to
   * adjust (PNG to JPG and the presets: one sentence), and its sentence stays at sight under the chips.
   */
  now?: (state: S, texts: O, lang: Lang) => string;
}
