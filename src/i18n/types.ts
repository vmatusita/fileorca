// Shapes of the translation files. Every language file must satisfy these types, so a missing
// text fails `pnpm tipos`. Values are plain strings (placeholders like {name} are filled by `fmt`),
// which keeps lint:texto able to read every text without running page code.
import type { Lang } from './routes.ts';
import type { ImagePageId, ImageToolId } from '../tools/image/registry.ts';
import type { AnyCalcId, BrCalcId, CalcPageId, EsCalcId, GuideId, LifeCalcId } from '../tools/calc/registry.ts';
import type { PdfToolId } from '../tools/pdf/registry.ts';
import type { FileGuideId } from '../tools/guides/registry.ts';

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
    /** The Menu button and the name of its sheet (F11, decision 3): "Menu", "Menú". */
    menu: string;
    /** The name of the theme button in each state (F11, decision 2): "Theme: system", "Theme: light", "Theme: dark". */
    theme: { system: string; light: string; dark: string };
    /** The label of the language list at the end of the Menu, under 768 px: "Language". */
    menuLanguage: string;
    /** The line under a Menu row, {n} from the registries: "{n} tools", "{n} calculators", "{n} guides". */
    menuTools: string;
    menuCalculators: string;
    menuGuides: string;
    /** The line under the QR code row: the formats it saves ("PNG or SVG"). */
    menuQr: string;
    /** The support row of the Menu ("Support Oli") and the line under it (how to support: "Ko-fi"). */
    support: string;
    supportMeta: string;
  };
  breadcrumb: { label: string; home: string };
  seal: string;
  footer: {
    imageColumn: string;
    moneyColumn: string;
    pdfColumn: string;
    /** The home and health columns (English only, F7) and the QR code (en, pt and es since the languages adjustment). */
    homeColumn?: string;
    healthColumn?: string;
    utilityColumn?: string;
    siteColumn: string;
    about: string;
    privacy: string;
    terms: string;
    licenses: string;
    contact: string;
    /**
     * The Guides block under the Utilities column (F11, decision 7): "All guides", the link to the guides hub. Its title is
     * common.guidesHub and the links of the groups are the headings of the hub's groups (TEXTS[lang].guides.groups).
     */
    guidesAll: string;
    /** The coffee line at the top of the footer (PLANO-MELHORIAS, section C; DECISOES § 437). */
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
    /** No result: 'No tool or guide called "{query}"' */
    emptyTitle: string;
    emptyHint: string;
    /** The titles of the two groups of results (F11, decision 7): "Tools", then "Guides". An empty group has no title. */
    toolsGroup: string;
    guidesGroup: string;
    /** The category written beside every guide in the results ("Guide"), whatever its group. */
    guideCategory: string;
    imageCategory: string;
    moneyCategory: string;
    pdfCategory: string;
    /** "Home calculators" and "Health calculators" (English only, F7) and "Utilities" (every language since the languages adjustment). */
    homeCategory?: string;
    healthCategory?: string;
    utilityCategory?: string;
    shortcut: string;
  };
  /** Short names and one-line descriptions of the image tools and presets (all of them exist in every language, F6). */
  tools: Record<ImagePageId, ToolBlurb>;
  /** Name of the image hub (breadcrumb, footer). */
  imageTools: string;
  /** Name of the language's money hub and the seal of its money pages. */
  moneyCalculators: string;
  calcSeal: string;
  /** The cards of the calculators that exist in this language (exact per language, below). */
  calcs: Partial<Record<AnyCalcId, ToolBlurb>>;
  /** The names of the home and health hubs (English only, F7) and the QR code card (every language since the languages adjustment). */
  homeCalculators?: string;
  healthCalculators?: string;
  qr?: ToolBlurb;
  /** The cards of the money guides (English and Spanish). */
  guides?: Record<GuideId, ToolBlurb>;
  /** Name of the PDF hub and the cards of the PDF tools. */
  pdfTools: string;
  pdf: Record<PdfToolId, ToolBlurb>;
  /** The cards of the file guides (the three languages since the languages adjustment). */
  fileGuides?: Record<FileGuideId, ToolBlurb>;
  /** Name of the guides hub (F11): the second step of its breadcrumb and of the guides' breadcrumbs ("Guides"). */
  guidesHub: string;
}

/** What every language has since the languages adjustment: the QR code card, its footer column and search category, and the file guides. */
interface TranslatedCommonTexts extends CommonTexts {
  qr: ToolBlurb;
  footer: CommonTexts['footer'] & { utilityColumn: string };
  search: CommonTexts['search'] & { utilityCategory: string };
  fileGuides: Record<FileGuideId, ToolBlurb>;
}

/** English has every calculator, preset and guide, and the home and health calculators and the QR code of the F7. */
export interface EnCommonTexts extends CommonTexts {
  calcs: Record<CalcPageId | LifeCalcId, ToolBlurb>;
  homeCalculators: string;
  healthCalculators: string;
  qr: ToolBlurb;
  footer: CommonTexts['footer'] & { homeColumn: string; healthColumn: string; utilityColumn: string };
  search: CommonTexts['search'] & { homeCategory: string; healthCategory: string; utilityCategory: string };
  guides: Record<GuideId, ToolBlurb>;
  fileGuides: Record<FileGuideId, ToolBlurb>;
}

/** Portuguese has the eight calculators adapted to Brazil (prompt F6, decision 5), the QR code and the file guides. */
export interface PtCommonTexts extends TranslatedCommonTexts {
  calcs: Record<BrCalcId, ToolBlurb>;
}

/**
 * Spanish has every English calculator and preset and the money guides, translated (prompt F6, decision 6; languages
 * adjustment, decision 4), the QR code and the file guides.
 */
export interface EsCommonTexts extends TranslatedCommonTexts {
  calcs: Record<EsCalcId, ToolBlurb>;
  guides: Record<GuideId, ToolBlurb>;
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
  /** Link under the tool grid to the image hub. */
  hubLink: string;
  /** The money section: heading, line and the hub link. */
  money: { heading: string; intro: string; hubLink: string };
  /** The PDF section: heading, line and the hub link. */
  pdf: { heading: string; intro: string; hubLink: string };
  /** The home and health sections (English only, F7, decision 9) and the QR code section (every language). */
  house?: { heading: string; intro: string; hubLink: string };
  health?: { heading: string; intro: string; hubLink: string };
  qr?: { heading: string; intro: string };
  /**
   * The "Read a guide" section (F11, decision 7): the heading, the line and the link to the guides hub, whose {n} is the
   * number of guides of the language, read from the registries. The four cards are those of HOME_GUIDES.
   */
  guides: { heading: string; intro: string; hubLink: string };
}

/** The home of Portuguese and Spanish (languages adjustment): with the QR code section. */
export interface TranslatedHomeTexts extends HomeTexts {
  qr: { heading: string; intro: string };
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
  /** "Help Oli keep swimming" (PLANO-MELHORIAS, section C; DECISOES § 438). */
  h1: string;
  /** "FileOrca is free, with no sign-ups and no limits, and it's made by one person in Curitiba, Brazil. Ads cover the costs; every coffee becomes the next tool." */
  body: string;
  whoHeading: string;
  who: string;
  nextHeading: string;
  next: string;
  button: string;
  amountsNote: string;
  /** The Pix block of the Portuguese page (PLANO "Doações"; F6, decision 8): only where the Pix exists. */
  pix?: SupportPixTexts;
}

export interface SupportPixTexts {
  /** Heading of the block, one level under the card's title: "Um café no Pix". */
  heading: string;
  /** Name of the amount choice (OptionGroup): "Valor". */
  legend: string;
  /** The choice with no amount: "Qualquer valor". */
  any: string;
  /** An amount, from the BR Code's "5.00": "R$ {amount}". */
  amount: string;
  /** Name of the QR: "QR code do Pix, {amount}" ({amount}: "qualquer valor" or "R$ 5"). */
  qrLabel: string;
  anyLower: string;
  /** The visible label above the code, its name: "Pix copia e cola" (F12; DECISOES § 440). */
  codeLabel: string;
  copy: string;
  /** What the status region says after the copy. */
  copied: string;
  /** What it says when the browser does not let the page copy (no clipboard, or the copy refused). */
  copyFailed: string;
  /** The receiver, for the person to check: "Em nome de {name}". */
  receiver: string;
  /** The Pix is static: the site does not know who paid; refunds only through the Pix's own button. */
  note: string;
}

export interface NotFoundTexts extends PageMeta {
  /** "This page swam away." (Oli line for the 404) */
  h1: string;
  body: string;
  searchLabel: string;
  homeLink: string;
}

/** The offline page (F8, decision 8; DECISOES § 289): what the service worker shows for a page it did not keep. */
export interface OfflineTexts extends PageMeta {
  h1: string;
  /** The offline line of the Oli (buoy), true for a page that was not kept, and its second line. */
  says: string;
  saysDetail: string;
  savedHeading: string;
  /** Shown when the device keeps no page yet (or the list cannot be read). */
  savedEmpty: string;
  homeLink: string;
}

/** The page of the share target (F8, decision 1; DECISOES § 290). {count} and {total} are numbers of files. */
export interface OpenWithTexts extends PageMeta {
  h1: string;
  lead: string;
  filesHeading: string;
  /** Under a tool card: how many of the shared files the tool takes. */
  takesThis: string;
  takesAll: string;
  takesSome: string;
  /** The files arrived but no tool takes any of them. */
  noTool: string;
  /** No files: the page was opened directly, or the browser has no service worker. */
  emptySays: string;
  emptyDetail: string;
  /** Next to a file whose format the page cannot read from its bytes, and for a file with no name. */
  unknown: string;
  unnamed: string;
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
  /** The guide under the presets: which tool does which job (DECISOES § 96); `tool` is linked to its page. */
  guideHeading: string;
  guideIntro: string;
  /** One line per job: the text before the tool name, the tool (linked to its page), the text after it. */
  guide: { before: string; tool: ImageToolId; after: string }[];
  guideOutro: string;
}

/** A source a money page cites, with the official page's address. */
export interface MoneySource {
  label: string;
  href: string;
}

/** The money hub /money-calculators/ (fo-hubband, the grid, presets, guides and "how these calculators work"). */
export interface MoneyHubTexts extends PageMeta {
  eyebrow: string;
  h1: string;
  intro: string;
  creditHeading: string;
  educationalHeading: string;
  /** The presets and the guides: English and Spanish (the Brazilian hub has none; prompt F6, decision 5). */
  presetsHeading?: string;
  presetsCaption?: string;
  presetsHead?: [string, string];
  guidesHeading?: string;
  worksHeading: string;
  worksIntro: string[];
  formulaHeading: string;
  formula: string[];
  premisesHeading: string;
  premises: string[];
  exampleHeading: string;
  exampleIntro: string;
  sourcesHeading: string;
  sources: MoneySource[];
  disclaimerHeading: string;
  disclaimer: string;
}

/** The Spanish money hub (languages adjustment, decision 4): with the presets and the guides, like the English one. */
export interface EsMoneyHubTexts extends MoneyHubTexts {
  presetsHeading: string;
  presetsCaption: string;
  presetsHead: [string, string];
  guidesHeading: string;
}

/**
 * The home and the health hubs (/home-calculators/ and /health-calculators/, F7, decision 9), on the mold of the money hub:
 * English only, with the data-ymyl blocks of "How these calculators work".
 */
export interface LifeHubTexts extends PageMeta {
  eyebrow: string;
  h1: string;
  intro: string;
  listHeading: string;
  worksHeading: string;
  worksIntro: string[];
  formulaHeading: string;
  formula: string[];
  premisesHeading: string;
  premises: string[];
  exampleHeading: string;
  exampleIntro: string;
  sourcesHeading: string;
  sources: MoneySource[];
  disclaimerHeading: string;
  disclaimer: string;
}

/**
 * The words the engines write into the facts and the table of a money guide (src/tools/calc/guides.ts), in the language of
 * the guide (languages adjustment): the headings of the table, and the few words a fact or a cell is made of.
 */
export interface GuideWordsById {
  'guides-15-vs-30-year-mortgage': { head: [string, string, string, string, string, string] };
  /** The name of each of the four debts of the example, and what goes between two of them in a payoff order. */
  'guides-debt-snowball-vs-avalanche': { head: [string, string, string, string, string, string]; debts: [string, string, string, string]; then: string };
  'guides-extra-mortgage-payments': { head: [string, string, string, string] };
  /** The month of a break-even ("month {n}") and a break-even that never comes. */
  'guides-refinance-break-even': { head: [string, string, string, string, string]; month: string; never: string };
  /** The first heading, the heading of a column of returns ("Savings earn {rate}"), the year of a break-even and none in 30 years. */
  'guides-rent-vs-buy-break-even': { head: string; savings: string; year: string; notWithin: string };
}

/** A guide /guides/<slug>/ (F4, decision 10): {placeholders} are numbers the engines work out at build. */
export interface GuideTexts<Id extends GuideId = GuideId> extends PageMeta {
  /** The words of the engines' facts and table (GuideWordsById). */
  words: GuideWordsById[Id];
  h1: string;
  lead: string;
  intro: string[];
  calcHeading: string;
  calcIntro: string;
  sections: { heading: string; paragraphs: string[] }[];
  tableHeading: string;
  tableIntro: string;
  tableCaption: string;
  /** Says the table was measured by the engine of the site, with the date: "{date}". */
  tableNote: string;
  formulaHeading: string;
  formula: string[];
  premisesHeading: string;
  premises: string[];
  exampleHeading: string;
  example: string[];
  sourcesHeading: string;
  sources: MoneySource[];
  disclaimerHeading: string;
  disclaimer: string;
  relatedHeading: string;
}

/** A source of a file guide: an official page read in this run, with the date it was read (ISO). */
export interface FileGuideSource {
  id: string;
  label: string;
  href: string;
  read: string;
}

/** An official figure a file guide quotes, by placeholder: its text (with the number) and the source it comes from. */
export interface FileGuideFact {
  text: string;
  source: string;
}

/** One table of the "What we measured" section of a file guide; the rows come from data/guides-measured.json. */
export interface FileGuideTableTexts {
  heading: string;
  caption: string;
  head: string[];
  /** Row labels, where the rows are steps rather than files. */
  labels?: string[];
}

/**
 * A file guide /guides/<slug>/ (F5b, decisions 4 and 5). Every number in it is a {placeholder}: a measured value of
 * data/guides-measured.json (src/tools/guides/measured.ts formats it), or an official figure of `facts` with its source.
 * The only other digits allowed are the technical names of `names` (tests/unit/guides-numbers.test.ts).
 */
export interface FileGuideTexts extends PageMeta {
  h1: string;
  /** The question the guide answers, in one line under the H1. */
  lead: string;
  /** What the last review changed, after the "Reviewed" line. */
  changed: string;
  intro: string[];
  toolHeading: string;
  toolIntro: string;
  /** The sections. The content AdSlot went after the first `half` of them until the F12; the ad map places the ads now. */
  sections: Section[];
  half: number;
  measuredHeading: string;
  measuredIntro: string;
  /** Says when, in what and on which files it was measured ("{date}", "{chromiumVersion}"…). */
  measuredNote: string;
  tables: FileGuideTableTexts[];
  sourcesHeading: string;
  sources: FileGuideSource[];
  facts: Record<string, FileGuideFact>;
  names: string[];
  relatedHeading: string;
  /**
   * Portuguese and Spanish: the English words data/guides-measured.json holds (a fact the measurement settled, the use
   * of an official size), keyed by the English words, in this language (src/tools/guides/measured.ts).
   */
  measuredTerms?: Record<string, string>;
}

/** Texts every file guide shares (src/i18n/en/file-guides.ts). */
export interface FileGuidesSharedTexts {
  /** "Reviewed by {name} on {date}." */
  reviewed: string;
  /** "First published {date}." */
  firstPublished: string;
  /** "Open the {name} tool" */
  openTool: string;
  /** "Read on {date}" after a source. */
  readOn: string;
  /** A table cell of identical pixels. */
  samePixels: string;
  yes: string;
  no: string;
  /** An empty cell: nothing of that kind. */
  none: string;
  /** Compress gave the same file back. */
  sameFile: string;
  /** After a network figure that only an ad spec page gives. */
  adSpec: string;
  /** A limit the page does not give. */
  notStated: string;
  /** A PSNR where the copy is not the same size (a crop, a turn, a PDF). */
  notComparable: string;
  /** Between two sizes: "19 KB to 30 KB". */
  becomes: string;
  /** GPS kinds of a photo, as the tables say them. */
  gps: { real: string; none: string; empty: string; zeroed: string; kept: string };
  /** Readable names of the fixtures, by file name. */
  fixtures: Record<string, string>;
  /** Heading of the guides list of a hub. */
  hubGuidesHeading: string;
  /**
   * The counts in words, from zero to twelve, for {name_word} (masculine, and the only form in English) and {name_wordf}
   * (before a feminine noun: "duas fotos", "una imagen").
   */
  numbers: { masculine: readonly string[]; feminine: readonly string[] };
  /** A ratio as a multiple, {name_times}: "{n} times"; and the singular, where the language uses it (pt below 2, es at exactly 1). */
  times: string;
  timesOne: string;
  /** Bytes to the byte, {name_exact}: "{n} bytes". */
  bytes: string;
  /** A resolution, the unit of a "ppi" measure: "{n} ppi", and "{n} ppp" in Spanish, as the PDF to JPG tool writes it. */
  ppi: string;
}

/**
 * Texts shared by every image tool panel in one language (src/tools/image/i18n/{lang}.ts): the batch
 * queue, the errors, the result card and the comparison. Placeholders are filled by `fmt`.
 */
export interface ImagePanelTexts {
  /** Used when a file has no name. */
  fileFallback: string;
  /** Base names of the batch downloads, in the language (docs/i18n): the ZIP and the one PDF of Image to PDF. */
  files: { zip: string; pdf: string };
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
    /** A format this tool does not take and no converter here opens (AVIF, GIF): "{name} is in {format} format, which this tool doesn't take. Try {formats}." No link, no article before the format name. */
    wrongFormat: string;
    truncated: string;
    decode: string;
    encode: string;
    /** The engine could not be loaded (offline, or the site changed since the page opened). */
    load: string;
    /** Offline, with the engine never kept (F8; DECISOES § 292): the Oli line (buoy), what to do, and the row of a file. */
    offline: string;
    offlineHelp: string;
    offlineRow: string;
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
    /** The coffee line (PLANO-MELHORIAS, section C) and the sentence that replaces it after "don't show again" (§ 436). */
    coffee: { text: string; button: string; hide: string; done: string };
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
  /** What the box covers, said with its name (F2 low 1, DECISOES § 102): "{width} by {height} pixels, at {x}, {y}". */
  boxValue: string;
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

/**
 * The page blocks of a PDF tool (F5a, decision 9): like ToolPageContent, with "how to use" in three steps or more and
 * no presets table.
 */
export type PdfPageContent = Omit<ToolPageContent, 'howSteps' | 'presets'> & {
  /** Three steps or more, each one sentence. */
  howSteps: string[];
};

/**
 * Texts shared by every PDF tool panel (src/tools/pdf/i18n/en.ts): the drop zone, the queue, the page grid, the
 * errors and the result card. Placeholders are filled by `fmt`.
 */
export interface PdfPanelTexts {
  fileFallback: string;
  /**
   * The words of the output file names, in the language (docs/i18n): the tag of one page or one part of Split and PDF to
   * JPG ("page-3", "part-2", "selected"), the base names of the ZIPs and the name of a PDF that has none.
   */
  files: { page: string; part: string; selected: string; zip: string; imagesZip: string; document: string };
  drop: {
    /** "Drop PDFs here" / "Drop a PDF here" */
    titleMany: string;
    titleOne: string;
    chooseMany: string;
    chooseOne: string;
    /** Desktop help: "or paste with {kbd} · {note}" ({note} is the tool's own line). */
    helpDesktop: string;
    pasteKey: string;
    over: string;
    overCount: string;
    overHelp: string;
  };
  progress: { working: string; reading: string; count: string; valueText: string };
  queue: {
    label: string;
    showMore: string;
    waiting: string;
    reading: string;
    working: string;
    to: string;
    download: string;
    cancel: string;
    remove: string;
    /** "{count} pages" and "1 page" */
    pages: string;
    page: string;
    /** Merge list: "Move {name} up" / "Move {name} down" and what the status region says after a move. */
    moveEarlier: string;
    moveLater: string;
    moved: string;
    unchanged: string;
    /** In the slot before the action: "{count} PDFs ready" and "1 PDF ready". */
    ready: string;
    readyOne: string;
    /**
     * F13a (UX-04 A, D-27; DECISOES § F13A-P-03): while the files are read the rectangle is already the list (or the
     * ready card), and its count says so: "Reading {count} PDFs…" and "Reading 1 PDF…".
     */
    readingCount: string;
    readingOne: string;
    /** F13a (D-21): the row that left the Merge list, in its place until the next action: "{name} is out of the list." and "Undo". */
    out: string;
    undo: string;
  };
  grid: {
    /** Name of the grid: "Pages of {name}". */
    label: string;
    /** Name of one page: "Page {n} of {total}", then ", rotated {degrees}°" and ", selected". */
    page: string;
    rotated: string;
    selected: string;
    selectedCount: string;
    selectAll: string;
    selectNone: string;
    moveEarlier: string;
    moveLater: string;
    /** "Page {n} moved to position {position}." */
    moved: string;
    /** "Page {n} picked up: use the arrow keys, then Space to drop it." */
    picked: string;
    /** "Page {n} dropped at position {position}.": the drop is not a second "moved", so each move is said once. */
    dropped: string;
    turn: string;
    turned: string;
    /** Keyboard help under the grid. */
    help: string;
    helpOrder: string;
    /** "Pick pages by number" field. */
    rangeLabel: string;
    rangeApply: string;
    rangeHelp: string;
    rangeError: string;
  };
  /**
   * The toggle of a password field (DECISOES § 177): its visible text, and the name of each field's toggle, which starts
   * with that text and never changes (the state is aria-pressed).
   */
  password: { show: string; showPassword: string; showConfirm: string };
  errors: {
    title: string;
    empty: string;
    notPdf: string;
    /** An image named .pdf: "{name} is an image, not a PDF. Turn it into one with {tool}." ({tool} becomes a link). */
    notPdfImage: string;
    truncated: string;
    corrupted: string;
    /** "{name} needs a password to open. Remove it first with {tool}." ({tool} becomes a link). */
    needsPassword: string;
    restricted: string;
    wrongPassword: string;
    notEncrypted: string;
    tooLarge: string;
    encode: string;
    load: string;
    /** Offline, with the engine never kept (F8; DECISOES § 292): the Oli line (buoy), what to do, and the row of a file. */
    offline: string;
    offlineHelp: string;
    offlineRow: string;
    /** A second file in a tool that works on one: "Oli works on one PDF at a time here. Start over to use {name}." */
    oneAtATime: string;
    /** PDF to JPG, a file with no page in the typed range: "{name} has no page in that range, so Oli left it out." (DECISOES § 178) */
    noPages: string;
    chooseAnother: string;
    some: string;
    all: string;
  };
  result: {
    download: string;
    downloadZip: string;
    zipping: string;
    startOver: string;
    before: string;
    after: string;
    files: string;
    pages: string;
    unchanged: string;
    unchangedMany: string;
    /** F13a (UX-04 A; DECISOES § F13A-P-05): the count of the line of numbers, "246 KB · 4 files". */
    filesCount: string;
    /**
     * F13a (UX-04 A; DECISOES § F13A-P-06): the options of a tool that runs by itself fold under "Adjust" after the
     * result, and the line inside says that a change makes the file again at once.
     */
    adjust: string;
    adjustHelp: string;
    /** One line per engine note (src/engine/pdf/types.ts PdfNote). */
    notes: { repaired: string; xfaRemoved: string; formLost: string; textFlattened: string; downscaled: string };
    /** The coffee line (PLANO-MELHORIAS, section C) and the sentence that replaces it after "don't show again" (§ 436). */
    coffee: { text: string; button: string; hide: string; done: string };
  };
  next: { label: string; moreTools: string };
}

/** The panel bits of one PDF tool: the progress name, the Oli's success lines, the action button and its options. */
export interface PdfToolPanelTexts<O = Record<string, never>> {
  /** The suffix of the output name ("report-merged.pdf"), in the language; in English, the registry's `suffix`. */
  suffix: string;
  /** What the drop zone says the tool takes ("PDF files, as many as you like"). */
  note: string;
  progressLabel: string;
  /** Oli's success line for one file and for several ({count}, {percent}). One exclamation. */
  done: string;
  doneMany: string;
  /** The button of a tool that waits for it ("Merge PDFs"); left out by the tools that run when the file arrives. */
  action?: string;
  placardLabel?: string;
  options: O;
}

export type PdfToolTexts<O = Record<string, never>> = PdfPageContent & { panel: PdfToolPanelTexts<O> };

/** The PDF hub /pdf-tools/ (fo-hubband, the grid, the guide of which tool does which job, DECISOES § 96). */
export interface PdfToolsTexts extends PageMeta {
  eyebrow: string;
  h1: string;
  intro: string;
  toolsHeading: string;
  guideHeading: string;
  guideIntro: string;
  /** One line per job: the text before the tool name, the tool (linked), the text after it. */
  guide: { before: string; tool: PdfToolId | 'image-to-pdf'; after: string }[];
  guideOutro: string;
  privacyHeading: string;
  privacy: string[];
}

/** A group of the guides hub (F11): the text of its shortcut chip and the heading of its section. */
export interface GuidesHubGroupTexts {
  /** The shortcut chip at the top of the hub ("Image"), which leads to the section. */
  jump: string;
  /** The H2 of the section ("Image guides"; in pt the money group is only "Dinheiro", the section of the note). */
  heading: string;
}

/**
 * The guides hub /guides/ (F11, decision 5; DECISOES § 364), with the texts of the specification
 * (docs/propostas/ux-v2/guides-hub.html, alternative A). In the description and the line of the band, {n} is the number of
 * guides of the language, read from the registries, never written by hand.
 */
export interface GuidesHubTexts extends PageMeta {
  eyebrow: string;
  h1: string;
  /** The line of the band, with {n}. */
  intro: string;
  /** The name of the nav of the shortcuts (aria-label). */
  jumpLabel: string;
  groups: Record<'image' | 'pdf' | 'money', GuidesHubGroupTexts>;
  /**
   * Only in a language with no money guide (pt): the note of the money group, which says why and leads to the money hub of
   * the language (the text before the link, the link, the text after it).
   */
  moneyNote?: { before: string; link: string; after: string };
  /** "How these guides are made", at the end. */
  howHeading: string;
  how: string;
  /** The words of the guide card (F11, decision 6; src/components/GuideCard.astro), wherever the card appears. */
  card: GuideCardTexts;
}

/**
 * The words of a guide card: the kind that opens it ("Guide", the first word of its accessible name), the measure of a file
 * guide with {n}, the number of its test files, and that of a money guide (only in a language with money guides: pt has
 * none), and the label of the tool at its foot.
 */
export interface GuideCardTexts {
  kind: string;
  measured: string;
  workedOut?: string;
  tool: string;
}

/* F12 · a parede do bloqueador (decision 10, with adjustment 3; § 431) */

/** The nine entries of the help of the ad-block wall (AdblockWall.astro shows them in the order of the proposal). */
export type WallHelpId = 'ubo' | 'adblock' | 'abp' | 'adguard' | 'brave' | 'firefox' | 'safari-mac' | 'safari-ios' | 'other';

/** One entry of the help: the name of the blocker or browser, its three steps and a note. No link, no "click". */
export interface WallHelpEntry {
  name: string;
  steps: [string, string, string];
  note: string;
}

/**
 * The texts of the ad-block wall, one file per language (src/i18n/<lang>/wall.ts), read by src/components/AdblockWall.astro.
 * Sad without blame: no "Warning" in the title, no request to see or touch an ad, nothing about the coffee.
 */
export interface WallTexts {
  /** The h2: "Oli lives on ads". */
  title: string;
  /** The three sentences under it. */
  body: string;
  /** The line shown once the escape was used today: it names the escape with its own label. */
  later: string;
  /** The three buttons, each starting with a verb: reload (brand), help (neutral), escape (ghost). */
  reload: string;
  help: string;
  escape: string;
  /** The accessible name of the close button of the notice (an icon only). */
  close: string;
  /** The h3 of the help panel and the line under it. */
  helpTitle: string;
  helpHint: string;
  entries: Record<WallHelpId, WallHelpEntry>;
}
