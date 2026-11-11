// Shapes of the translation files. Every language file must satisfy these types, so a missing
// text fails `pnpm tipos`. Values are plain strings (placeholders like {name} are filled by `fmt`),
// which keeps lint:texto able to read every text without running page code.
import type { Lang } from './routes.ts';
import type { ImagePageId, ImageToolId } from '../tools/image/registry.ts';
import type { AnyCalcId, BrCalcId, CalcPageId, EsCalcId, GuideId, LifeCalcId } from '../tools/calc/registry.ts';
import type { PdfPageId, PdfToolId } from '../tools/pdf/registry.ts';
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
  /** The index of the H2 of a legal page and of the Licenses, in the right column from 1280 px (F13b, UX-17 A; DECISOES § 585). */
  pageIndex: string;
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
    /**
     * F13b (UX-17 A; DECISOES § 587): below 768 px each category shows its hub and puts its tools in a disclosure. The
     * summary shows `all` ("All {n}") when the list holds every tool of the category in the language, `popular` ("{n}
     * popular") when it holds some; {n} is the length of the list. The rest of its name is said only to a screen reader,
     * after the visible words (WCAG 2.5.3): the noun of the category after `all`, and `popularRest` ("{noun}", "entre as
     * {noun}") after `popular`.
     */
    tools: {
      all: string;
      popular: string;
      popularRest: string;
      image: string;
      pdf: string;
      money: string;
      home?: string;
      health?: string;
    };
    /**
     * The disclosure of the Guides block below 768 px (DECISOES § 587): "All guides" stays in sight and the groups of the
     * hub go in it. The summary shows "{n} topics" ({n} the groups of the language) and a screen reader hears the rest.
     */
    guidesTopics: string;
    guidesTopicsRest: string;
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
  /** Name of the PDF hub and the cards of the PDF tools and, since the F18, of the PDF presets (decision 5). */
  pdfTools: string;
  pdf: Record<PdfPageId, ToolBlurb>;
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

/**
 * One category section of the home (F13b, UX-03 B, DECISOES § 567; ajuste-home-cards, § 602 and § 604): the H2, its one
 * sentence and the link to the hub. The cards under the sentence are the registries' (src/components/home-bands.ts).
 */
export interface HomeBandTexts {
  heading: string;
  /** The one sentence of the section, in a p.fo-prose between the H2 and the cards. */
  more: string;
  /** The link to the hub of the section (the QR code section has no hub: its one card is the tool). */
  all?: string;
}

export interface HomeTexts extends PageMeta {
  /** F13b (UX-03 B): "{n} tools." with the count of the site, then the promise, kept on one line ("0 uploads."). */
  h1: string;
  h1Promise: string;
  intro: string;
  /** The link of the image tool pages back to the home ("Choose a tool"). */
  toolsHeading: string;
  privacyHeading: string;
  privacyBody: string;
  /** The category sections, in the order of the page: image, PDF, money, home and health (English only) and the QR code. */
  image: HomeBandTexts;
  pdf: HomeBandTexts;
  money: HomeBandTexts;
  /** The home and health section (English only, F7): two links, one to each hub. */
  life?: HomeBandTexts & { allHealth: string };
  qr?: HomeBandTexts;
  /**
   * The "Read a guide" section (F11, decision 7): the heading, the line and the link to the guides hub, whose {n} is the
   * number of guides of the language, read from the registries. The four cards are those of HOME_GUIDES.
   */
  guides: { heading: string; intro: string; hubLink: string };
}

/** The home of Portuguese and Spanish (languages adjustment): with the QR code section. */
export interface TranslatedHomeTexts extends HomeTexts {
  qr: HomeBandTexts;
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
  /**
   * The card "FileOrca in numbers" (F13b, UX-17 A; DECISOES § 586), on the About page and, from 1280 px, on the Contact
   * page: four counts and the zero. These are the labels; the numbers come from src/components/tool-count.ts and LANGS,
   * never typed here. The fourth count is the home and health calculators where the language has them (`life`, English),
   * and the languages of the site where it has none (`languages`).
   */
  stats: {
    heading: string;
    image: string;
    pdf: string;
    money: string;
    life?: string;
    languages?: string;
    /** The label of the "0" (no file is ever uploaded), shown with the PrivacySeal. */
    zero: string;
  };
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
  /** The heading of the three chips, the first tool of each hub of the language (F13b, UX-17 A; DECISOES § 584). */
  toolsHeading: string;
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
  /** F15 (DECISOES § 656): `lead`, a line under the heading before the table (Compress image: the third choice for any other size). */
  presets?: { heading: string; caption: string; head: [string, string]; lead?: string };
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
  /**
   * F13b (F5b F-13; DECISOES § 559): the sentence of the note that says what a column with one value in every row said,
   * since the page leaves that column out ("No JPG kept any GPS data."). There if and only if a column of the table is
   * left out: tests/unit/guide-page.test.ts ties the two.
   */
  constant?: string;
}

/** A number of the sheet "What we measured" under the H1 of a file guide (F13b, UX-13 A; DECISOES § 560). */
export interface FileGuideSheetStat {
  /** What the number is, in small text above it. */
  label: string;
  /** The number, in number-md: measured placeholders only ("{ratioTotalChromium_change}", "{gpsAfterChromium} of {files}"). */
  value: string;
  /** Under the number, before and after, with the arrow icon and a hidden "to" between them. */
  from?: string;
  to?: string;
  /** Under the number, a plain line instead ("{scanImages} of {scanTotal}"). */
  sub?: string;
}

/** The sheet "What we measured" of a file guide: two numbers of its measurement, the sample and the link to the table. */
export interface FileGuideSheetTexts {
  stats: [FileGuideSheetStat, FileGuideSheetStat];
  /** The sample the two numbers rest on, one sentence. */
  sample: string;
  /** The link to the table, after the sample ("See each one in the table"). */
  link: string;
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
  /**
   * The history line at the end of "What we measured" (F13b, G-23; DECISOES § 557): when the guide was first published
   * ({published}) and with which measurements ({measured}), and what each review changed. Until the F13b it followed the
   * "Reviewed" line at the top.
   */
  changed: string;
  intro: string[];
  toolHeading: string;
  /** The paragraph about the embedded tool, right under it since the F13b (DECISOES § 561; above it before). */
  toolIntro: string;
  /** The sections. The content AdSlot went after the first `half` of them until the F12; the ad map places the ads now. */
  sections: Section[];
  half: number;
  /** The title of the sheet under the H1 (F13b; until then, the heading of the section with the tables). */
  measuredHeading: string;
  /** The sheet "What we measured" under the H1 (F13b, G-17; DECISOES § 560). Not `facts`, which are the official figures. */
  sheet: FileGuideSheetTexts;
  /** The heading of the section with the tables ("Photo by photo"), which names their scrolling frames (F13b, F5b F-13). */
  tableHeading: string;
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
  /**
   * The signature under the H1, one line (F13b, G-23; DECISOES § 557): "Reviewed by {name} · {date}", with the short date.
   * Until the F13b it was a sentence with the long date, followed by the first publication ("First published {date}."),
   * which went to the history line at the end of "What we measured".
   */
  reviewed: string;
  /**
   * The sentence of the text that links to the tool's own page (F13b, D-54; DECISOES § 562): {link} is the link, whose
   * words are the name of the tool ("the same tool as our {link} page"). Until the F13b the link was a line of its own
   * under the panel ("Open the {name} tool").
   */
  toolLink: string;
  /**
   * The line over a measured table that is wider than its frame, under 768 px (F13b, F5b F-2; DECISOES § 563): "Scroll
   * sideways to see the {n} columns", with {n} counted from the table the page draws.
   */
  hint: string;
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
    /**
     * F15 (DECISOES § 651 and § 652): the rows of a batch move and go out as the rows of Merge PDF do, with its words in each
     * language and keys of their own (the image island never imports the texts of the PDF island). The arrows: "Move {name}
     * up", "Move {name} down"; what the moved row says: "{name} is now number {position} of {total}."; the line a row that
     * went out leaves, "{name} is out of the list.", with its "Undo".
     */
    moveEarlier: string;
    moveLater: string;
    moved: string;
    out: string;
    undo: string;
  };
  errors: {
    /** "Oops, Oli couldn't read this file" (fixed line, without the advice). */
    title: string;
    /** One sentence per reason, with {name}. */
    empty: string;
    unsupported: string;
    /**
     * A format that a converter here opens (CONVERTER_FOR), one sentence per format with the format written in it, so the
     * article is the text's and the lint:texto reads the real sentence (F17, decision 7): "{name} is a HEIC file. Open it in
     * {tool}." and "{name} is an AVIF file. Open it in {tool}." ({tool} becomes a link).
     */
    wrongTool: { heic: string; avif: string };
    /** A format this tool does not take and no converter here opens (GIF, or a JPG in AVIF to JPG): "{name} is in {format} format, which this tool doesn't take. Try {formats}." No link, no article before the format name. */
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
    /**
     * F13a (D-06, F10 p-14; DECISOES § 468): the name ends in an image extension and the bytes are no image: "{name}
     * ends in .{extension}, but it isn't an image inside. Save it again as {formats}." It never offers the same format as
     * the way out of a file that already says it is one.
     */
    mismatch: string;
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
    /** F13a (F10 p-13): hidden name of the signed change of size in the line "2.6 MB → 717 KB" ("Change"). */
    change: string;
  };
  compare: {
    /** Name of the range control: "Compare before and after". */
    label: string;
    /** "Before · {size}" */
    before: string;
    /** "After · {size}" */
    after: string;
    /** F13a (UX-04 A): the button that opens the comparison, which only opens when the person asks ("Before and after"). */
    open: string;
  };
  /** F13a (UX-04 A): the options folded under one line after the result ("Adjust · Recommended"). */
  adjust: {
    /** "Adjust", before the value the tool has now. */
    label: string;
    /** "Changing an option redoes the file right away." */
    help: string;
  };
  next: { label: string; moreTools: string };
  /** F13a · UX-14 (DECISOES § 496): the result that goes along to the next tool, and its arrival there. */
  carry: CarryTexts & {
    /**
     * What a chip says when it takes the images along, per destination ("Resize this image", "Resize these {count} images").
     * F15 (DECISOES § 653): the PDF tools Image to PDF leads to, with the words of the PDF island ("Compress this PDF").
     * F17 (decision 5; DECISOES § 707): Convert to WebP, a chip of Compress again; it takes a JPG or a PNG result along.
     * F18 (decision 11; DECISOES § 734): Remove EXIF data, which takes a JPG, a PNG or a WebP along when a chip leads there.
     */
    chips: Record<'compress-image' | 'resize-image' | 'crop-image' | 'rotate-image' | 'convert-to-webp' | 'image-to-pdf' | 'remove-exif-data' | 'compress-pdf' | 'merge-pdf' | 'add-page-numbers-to-pdf', CarryLabel>;
    /** F15 (DECISOES § 653): the line under the chips of Image to PDF, with the words of the PDF ("Oli takes the PDF to …"). */
    linePdf: string;
  };
  /** Format names as the site writes them. */
  formats: { jpeg: string; png: string; webp: string; heic: string; avif: string; gif: string };
}

/** F13a · UX-14 (DECISOES § 496): a chip that takes the result along says so, for one file and for several ({count}). */
export interface CarryLabel {
  one: string;
  many: string;
}

/**
 * F13a · UX-14 (DECISOES § 496 to § 499): the line under the chips that take the result along, the first note of
 * the result at the arrival ({tool} is the name of the page it came from, {count} how many files), and the empty box, when
 * the files did not arrive (the DropZone in the state lost).
 */
export interface CarryTexts {
  /** "Oli takes the image to the next tool. It never leaves your device." */
  line: string;
  lineMany: string;
  /** "Oli brought this image from {tool}." */
  from: string;
  fromMany: string;
  /** "Oli couldn't bring the image here" */
  lostTitle: string;
  lostTitleMany: string;
  /** "Nothing left your device. Choose the image again, or go back to {tool} and download it there." */
  lostHelp: string;
  lostHelpMany: string;
  /** "Back to {tool}" */
  back: string;
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
  /** F13a (UX-04 A): the help inside "Adjust" when the tool says it better than the shared line (Compress: "the level"). */
  adjustHelp?: string;
  /**
   * F13a (D-17): a file of a format that another tool of the site takes (a PNG on HEIC to JPG): the reason, with {name} and
   * {tool}, and the name of the row with the chip to that tool, in the band under the rectangle ("For a PNG:").
   */
  elsewhere?: { reason: string; label: string };
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
  /**
   * F15 (PLANO-UX-QV, section D; DECISOES § 656): the third choice, "Up to a size", with its short help; the field
   * "Maximum size" in KB (20 to 10,000, 200 at first) and its help, its error ("Type a whole number from {min} to {max}.")
   * and the summary of "Adjust" ("Up to {n} KB").
   */
  size: string;
  sizeHelp: string;
  maxLabel: string;
  /** The suffix of the field: "KB". */
  kb: string;
  maxHelp: string;
  maxInvalid: string;
  upTo: string;
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

/** F18 (decision 9): Flip image, the mirror alone: Horizontal (the default) or Vertical, with no turn. */
export interface FlipOptionsTexts {
  legend: string;
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

/** Convert to WebP (F17; the F2 shape, DECISOES § 85): the output format and the level, at sight or under "Adjust". */
export interface ConvertToOptionsTexts {
  formatLegend: string;
  webp: string;
  avif: string;
  levelLegend: string;
  recommended: string;
  recommendedHelp: string;
  strong: string;
  strongHelp: string;
  /** What "Adjust ·" says: the format and the level ("{format} · {level}" gives "WebP · Recommended"). */
  now: string;
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
 * The page blocks of a PDF tool (F5a, decision 9): like ToolPageContent, with "how to use" in three steps or more.
 * F18 (decision 5; DECISOES § 725): a parent tool has the table of its presets again, as the image parents do.
 */
export type PdfPageContent = Omit<ToolPageContent, 'howSteps'> & {
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
     * F13a (UX-04 A, D-27; DECISOES § 480): while the files are read the rectangle is already the list (or the
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
    /** Keyboard help under the grid; in the order mode, the keys only (F13a, F-14: the bar above already says to drag). */
    help: string;
    helpKeys: string;
    /** "Pick pages by number" field. */
    rangeLabel: string;
    rangeApply: string;
    rangeHelp: string;
    rangeError: string;
    /** F14 (section B of PLANO-UX-QV.md; DECISOES § 619): "Page size: Small · Large", the segment above the grid. */
    sizeLegend: string;
    sizeSmall: string;
    sizeLarge: string;
    /** F14 (DECISOES § 628): the third batch button, beside "Pick all" and "Pick none". */
    invert: string;
    /** F14 (DECISOES § 621): the name of the magnifier of a cell, "View page {n} enlarged" (never starting with "Page"). */
    zoom: string;
    /** F14, Delete (DECISOES § 627): the end of the name of a page that will go, ", comes out". */
    leaving: string;
    /**
     * F14, Delete: the count of the grid, "{count} of {total} come out · the new PDF keeps {left} pages", in two halves
     * with the forms of one ("1 of {total} comes out", "the new PDF keeps 1 page").
     */
    leavingCount: string;
    leavingOne: string;
    keptCount: string;
    keptOne: string;
    /** F14 (DECISOES § 628): what Shift+click says, "Pages {from} to {to} picked" (or "unpicked"). */
    spanOn: string;
    spanOff: string;
    /**
     * F18, Organize PDF (decision 6 of the prompt): the count of its grid, "{count} picked · the new PDF keeps {left}
     * pages", in two halves with the forms of one ("1 picked"); the second half is `keptCount` and `keptOne`.
     */
    markedCount: string;
    markedOne: string;
    /** F18, Organize PDF: the bar of actions over the picked pages, "Rotate right", "Rotate left", "Remove", "Put back". */
    turnRight: string;
    turnLeft: string;
    takeOut: string;
    putBack: string;
    /** F18: the help of that bar, which says to pick pages first (its buttons are aria-disabled until then). */
    actsHelp: string;
    /** F18: what the bar says after turning more than one page, "{count} pages turned right." (one page: `turned`). */
    turnedRight: string;
    turnedLeft: string;
  };
  /**
   * F14 (section A of PLANO-UX-QV.md; DECISOES § 624 to § 626): the page view, the large page inside the tool, with its
   * bars, the action of each tool and the buttons that open it from the result and from the Merge list.
   */
  view: {
    /** "Back to the pages", with the icon. */
    back: string;
    previous: string;
    next: string;
    /** The toggle of the frame: "Enlarge" (twice the column, scrolling) and "Fit" (the column). */
    enlarge: string;
    fit: string;
    /** The heading: "Page {n} of {total}"; in Reorder, "Page {n} · position {p} of {total}". */
    title: string;
    titleOrder: string;
    /** The action of each tool: Delete, Split (pick), Sign (pick) and Rotate (page by page). */
    remove: string;
    mark: string;
    sign: string;
    turn: string;
    /** The ghost button of a result that is one PDF with no password, "View the new PDF". */
    openResult: string;
    /** The button of a row of the Merge list, "View pages of {name}". */
    openFile: string;
    /** The name of the frame of the large page, "Page {n}, large". */
    frame: string;
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
    /** F13a (UX-04 A; DECISOES § 482): the count of the line of numbers, "246 KB · 4 files". */
    filesCount: string;
    /**
     * F13a (UX-04 A; DECISOES § 483): the options of a tool that runs by itself fold under "Adjust" after the
     * result, and the line inside says that a change redoes the file at once.
     */
    adjust: string;
    adjustHelp: string;
    /** One line per engine note (src/engine/pdf/types.ts PdfNote). */
    notes: { repaired: string; xfaRemoved: string; formLost: string; textFlattened: string; downscaled: string };
    /** The coffee line (PLANO-MELHORIAS, section C) and the sentence that replaces it after "don't show again" (§ 436). */
    coffee: { text: string; button: string; hide: string; done: string };
  };
  next: { label: string; moreTools: string };
  /** F13a · UX-14 (DECISOES § 496): the PDFs that go along to the next tool, and their arrival there. */
  carry: CarryTexts & {
    /**
     * What a chip says when it takes the PDFs along, per destination ("Compress this PDF", "Compress these {count} PDFs").
     * F18 (decision 11; DECISOES § 734): Organize PDF and Extract pages, which wait for their action as Split PDF does.
     */
    chips: Record<'compress-pdf' | 'add-page-numbers-to-pdf' | 'merge-pdf' | 'split-pdf' | 'reorder-pdf-pages' | 'organize-pdf' | 'split-pdf-extract-pages' | 'protect-pdf', CarryLabel>;
  };
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
  /**
   * F18 (decision 5; DECISOES § 725): the table of the PDF presets, with their links, as the image hub has (never cards:
   * the grid of the hub is the tools of the registry, checkPdfHub).
   */
  presetsHeading: string;
  /** Visually hidden caption of the presets table. */
  presetsCaption: string;
  /** Column heads of the presets table: the preset, what comes out. */
  presetsHead: [string, string];
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
