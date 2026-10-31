// Shapes of the translation files. Every language file must satisfy these types, so a missing
// text fails `pnpm tipos`. Values are plain strings (placeholders like {name} are filled by `fmt`),
// which keeps lint:texto able to read every text without running page code.
import type { Lang } from './routes.ts';
import type { ImagePageId } from '../tools/image/registry.ts';

export type LangNames = Record<Lang, string>;

export interface PageMeta {
  /** <title>, without the " | FileOrca" suffix. Starts with the page or tool name. */
  title: string;
  /** Meta description, 120 to 160 characters. */
  description: string;
}

export interface CommonTexts {
  skipToContent: string;
  header: {
    homeLabel: string;
    search: string;
    /** Visible code in the language button: EN, PT, ES. */
    langCode: string;
    /** Completes the button name for screen readers: " · Language: English". */
    langSr: string;
    langMenuLabel: string;
    langNames: LangNames;
  };
  breadcrumb: { label: string; home: string };
  seal: string;
  footer: {
    imageColumn: string;
    siteColumn: string;
    about: string;
    privacy: string;
    terms: string;
    licenses: string;
    contact: string;
    /** Support line at the base of the footer (PLANO, Doações). */
    coffee: string;
    /** "Made by {name} in {city}" */
    signature: string;
  };
  cookie: {
    title: string;
    body: string;
    privacyLink: string;
    accept: string;
    decline: string;
    /** Privacy page button that clears the stored choice and shows the notice again. */
    change: string;
  };
  /** The only words AdSense accepts per language: Advertisements, Publicidade, Anuncios. */
  adLabel: string;
  search: {
    dialogLabel: string;
    inputLabel: string;
    listLabel: string;
    placeholder: string;
    close: string;
    /** No result: 'No tool called "{query}"' */
    emptyTitle: string;
    emptyHint: string;
    imageCategory: string;
    shortcut: string;
  };
  /** Short names and one-line descriptions of the tools that exist in this language. */
  tools: { 'compress-image': ToolBlurb } & Partial<Record<Exclude<ImagePageId, 'compress-image'>, ToolBlurb>>;
  /** Name of the image hub (breadcrumb, footer), where the hub exists. */
  imageTools?: string;
}

/** English has every image tool, preset and the hub. */
export interface EnCommonTexts extends CommonTexts {
  tools: Record<ImagePageId, ToolBlurb>;
  imageTools: string;
}

export interface Section {
  heading: string;
  paragraphs: string[];
  list?: string[];
  /** Renders a control after the section (the privacy page button that reopens the cookie notice). */
  action?: 'consent-choice';
}

export interface HomeTexts extends PageMeta {
  h1: string;
  intro: string;
  toolsHeading: string;
  privacyHeading: string;
  privacyBody: string;
  /** Link under the tool grid to the image hub, only in the languages that have the hub. */
  hubLink?: string;
}

export interface LegalTexts extends PageMeta {
  h1: string;
  /** "Last updated: {date}" already formatted for the language. */
  updated: string;
  intro: string;
  sections: Section[];
}

export interface AboutTexts extends PageMeta {
  h1: string;
  intro: string[];
  whyHeading: string;
  why: string[];
  orcaHeading: string;
  orca: string;
  linksHeading: string;
  websiteLabel: string;
  linkedinLabel: string;
}

export interface ContactTexts extends PageMeta {
  h1: string;
  intro: string;
  emailLabel: string;
  notes: string[];
}

export interface LicensesTexts extends PageMeta {
  h1: string;
  intro: string;
  packagesHeading: string;
  fontsHeading: string;
  noFonts: string;
  packageColumn: string;
  versionColumn: string;
  licenseColumn: string;
  showText: string;
  sourceLabel: string;
  /** Packages that enter the bundle inside another package (not in `dependencies`). */
  bundledHeading: string;
  bundledIntro: string;
  /** "Comes with @cantoo/pdf-lib". */
  viaLabel: string;
  /** "Show the license of MozJPEG and libjpeg-turbo": a codec inside the package. */
  showTextOf: string;
  /** "Copied from github.com/…": a text the package does not ship. */
  copiedFrom: string;
  /** The LGPL notice for libheif (HEIC photos). */
  lgplHeading: string;
  lgplWhat: string;
  lgplSeparate: string;
  lgplReplace: string;
  lgplSourceHeading: string;
  /** What each source link is: the library, its HEVC decoder, the npm wrapper and the build repository. */
  lgplRoles: { libheif: string; libde265: string; wrapper: string; build: string };
  lgplTexts: string;
}

export interface SupportTexts extends PageMeta {
  /** "Free tools, made by one person" (PLANO, Doações). */
  h1: string;
  /** "No accounts, no paywalls, no upload limits. Ads cover the costs; coffees pay for new tools." */
  body: string;
  whoHeading: string;
  who: string;
  nextHeading: string;
  next: string;
  button: string;
  amountsNote: string;
}

export interface NotFoundTexts extends PageMeta {
  /** "This page swam away." (Oli line for the 404) */
  h1: string;
  body: string;
  searchLabel: string;
  homeLink: string;
}

/** One question of a tool page: researched, answered in our own words. */
export interface FaqItem {
  q: string;
  a: string;
}

/** A two-column table of facts ("specs") on a tool or preset page. */
export interface SpecTable {
  /** Visually hidden caption that names the table. */
  caption: string;
  head: [string, string];
  rows: [string, string][];
}

/**
 * The content blocks of a tool or preset page (PLANO "Molde da página de ferramenta"; gate:conteudo):
 * how-to in three steps, the specs table, at least four real questions and the privacy note.
 */
export interface ToolPageContent extends PageMeta {
  /** The promise: the tool name first ("Compress image"), never a slogan. */
  h1: string;
  howHeading: string;
  /** Exactly three steps, each one sentence. */
  howSteps: [string, string, string];
  specsHeading: string;
  specs: SpecTable;
  faqHeading: string;
  /** At least four questions people really ask about this tool. */
  faq: FaqItem[];
  privacyHeading: string;
  privacyNote: string;
  relatedHeading: string;
  /** Parent tools only: the table of their presets (one row per preset, with its link). */
  presets?: { heading: string; caption: string; head: [string, string] };
}

/** The image hub /image-tools/ (fo-hubband: eyebrow, H1 and one line). */
export interface ImageToolsTexts extends PageMeta {
  eyebrow: string;
  h1: string;
  intro: string;
  toolsHeading: string;
  presetsHeading: string;
  /** Visually hidden caption of the presets table. */
  presetsCaption: string;
  /** Column heads of the presets table: the preset, what comes out. */
  presetsHead: [string, string];
}

/**
 * Texts shared by every image tool panel in one language (src/tools/image/i18n/{lang}.ts): the batch
 * queue, the errors, the result card and the comparison. Placeholders are filled by `fmt`.
 */
export interface ImagePanelTexts {
  /** Used when a file has no name. */
  fileFallback: string;
  drop: {
    /** "Drop images here" */
    title: string;
    /** "Choose images" */
    choose: string;
    /** Desktop help: "or paste with {kbd} · {formats}" ({formats} comes from the tool texts). */
    helpDesktop: string;
    /** Phone help: "{formats}" plus the no-limit fact, e.g. "{formats}, as many as you like". */
    help: string;
    pasteKey: string;
    /** "Let go, Oli's ready" (fixed line). */
    over: string;
    /** Under the over line: "{count} images" when the count is known, else overHelp. */
    overCount: string;
    overHelp: string;
  };
  progress: {
    /** "Oli is on it…" (fixed line). */
    working: string;
    /** Visible count: "{done} of {total} images". */
    count: string;
    /** aria-valuetext: "{percent}, {done} of {total} images". */
    valueText: string;
  };
  queue: {
    /** Name of the file list. */
    label: string;
    /** "Show {count} more" */
    showMore: string;
    /** A file waiting its turn. */
    waiting: string;
    /** A file being processed. */
    working: string;
    /** Hidden word between the two sizes: "to" / "para" / "a". */
    to: string;
    /** "Download {name}" (the output name). */
    download: string;
    /** "Cancel {name}" */
    cancel: string;
    /** "Remove {name}" */
    remove: string;
    /** Toggle that picks the file the comparison or the crop box shows: "Show {name}". */
    select: string;
    /** No gain: "Already optimized". */
    unchanged: string;
  };
  errors: {
    /** "Oops, Oli couldn't read this file" (fixed line, without the advice). */
    title: string;
    /** One sentence per reason, with {name}. */
    empty: string;
    unsupported: string;
    /** A format another tool opens: "{name} is a {format} file. Open it in {tool}." ({tool} becomes a link). */
    wrongTool: string;
    /** A format no tool here opens: "{name} is a {format} file. Try {formats}." */
    wrongFormat: string;
    truncated: string;
    decode: string;
    encode: string;
    tooLarge: string;
    /** "Choose other files" (DropZone error button). */
    chooseAnother: string;
    /** Mixed batch: "{count} files couldn't be read; the rest are ready." */
    some: string;
    /** Several files, none readable (under the DropZone error title; the list below says why): "{count}" */
    all: string;
  };
  result: {
    download: string;
    /** "Download all · ZIP {size}" */
    downloadZip: string;
    /** While the ZIP is being put together: "Zipping {count} files…" */
    zipping: string;
    startOver: string;
    before: string;
    after: string;
    size: string;
    /** "Images" (stat label of a batch). */
    files: string;
    /** "{count} images" */
    count: string;
    /** Every file came back unchanged (no gain). */
    unchanged: string;
    /** The same, for a batch of several images. */
    unchangedMany: string;
    /** "This browser can't save {format} files, so Oli kept the original image, without the photo metadata." */
    cannotEncode: string;
    /** One line per engine note (src/engine/image/types.ts `Note`). */
    notes: {
      flattened: string;
      firstFrame: string;
      notEnlarged: string;
      /** "Oli also made it smaller: {width} × {height}." */
      downscaled: string;
      centerCropped: string;
      enlarged: string;
    };
    /** The metadata line every result shows: the photo data, GPS included, is gone. */
    metadata: string;
    coffee: { text: string; button: string; hide: string };
  };
  compare: {
    /** Name of the range control: "Compare before and after". */
    label: string;
    /** "Before · {size}" */
    before: string;
    /** "After · {size}" */
    after: string;
  };
  next: { label: string; moreTools: string };
  /** Format names as the site writes them. */
  formats: { jpeg: string; png: string; webp: string; heic: string; avif: string; gif: string };
}

/**
 * The panel texts of one image tool or preset: the H1-adjacent bits the island shows. Options are
 * per tool (`O`), each label a verb-free noun phrase in sentence case.
 */
export interface ImageToolPanelTexts<O = Record<string, never>> {
  /** "JPG, PNG or WebP": the formats this tool takes, as the drop zone says them. */
  formats: string;
  /** Name of the WaterLevel: "Compressing images". */
  progressLabel: string;
  /** Oli's success line for one file and for a batch ({percent}, {count}). One exclamation. */
  done: string;
  doneMany: string;
  /** Label of the Placard under the number (compression only: "lighter"). */
  placardLabel?: string;
  options: O;
}

/** A tool or preset text file: the page blocks plus the panel bits. */
export type ImageToolTexts<O = Record<string, never>> = ToolPageContent & { panel: ImageToolPanelTexts<O> };

export interface CompressOptionsTexts {
  legend: string;
  recommended: string;
  recommendedHelp: string;
  strong: string;
  strongHelp: string;
  /** PNG is saved without loss: the level only changes JPG and WebP. */
  pngNote: string;
}

/** Presets with no choice to make: one line that says what comes out. */
export interface PresetOptionsTexts {
  /** "Each image comes out as a JPG of 100 KB or less." */
  note: string;
}

export interface ResizeOptionsTexts {
  legend: string;
  bySize: string;
  byPercent: string;
  width: string;
  height: string;
  percent: string;
  /** Unit suffixes: "px", "%". */
  px: string;
  pct: string;
  /** "Each image fits inside this box and keeps its proportions." */
  fitNote: string;
  /** Field error: "Type a whole number from 1 to {max}." */
  invalid: string;
}

export interface CropOptionsTexts {
  legend: string;
  square: string;
  portrait: string;
  wide: string;
  free: string;
  /** Name of the crop box (a group): "Crop area". */
  boxLabel: string;
  /** How to move it by keyboard: "Arrow keys move the box; Shift with the arrows changes its size." */
  keyboardHelp: string;
  x: string;
  y: string;
  width: string;
  height: string;
  px: string;
  invalid: string;
  /** Batch: "Each image gets the centred crop; pick one in the list to adjust its box." */
  batchNote: string;
}

export interface RotateOptionsTexts {
  turnLegend: string;
  right: string;
  left: string;
  half: string;
  flipLegend: string;
  none: string;
  horizontal: string;
  vertical: string;
}

export interface SaveAsOptionsTexts {
  legend: string;
  jpg: string;
  png: string;
  /** What changes between the two, in one line. */
  help: string;
}

export interface ConvertToOptionsTexts {
  formatLegend: string;
  webp: string;
  avif: string;
  levelLegend: string;
  recommended: string;
  recommendedHelp: string;
  strong: string;
  strongHelp: string;
}

export interface PdfOptionsTexts {
  legend: string;
  image: string;
  letter: string;
  a4: string;
  /** "One image per page, in the order of the list." */
  help: string;
}

/** Tools with no option: one line that says what the tool does to each file. */
export interface NoteOptionsTexts {
  note: string;
}

/** Name, one-line gain and search synonyms of a tool or preset (cards, search, footer). */
export interface ToolBlurb {
  name: string;
  description: string;
  synonyms: string[];
}
