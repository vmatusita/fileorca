// Shapes of the translation files. Every language file must satisfy these types, so a missing
// text fails `pnpm tipos`. Values are plain strings (placeholders like {name} are filled by `fmt`),
// which keeps lint:texto able to read every text without running page code.
import type { Lang } from './routes.ts';

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
  /** Short names and one-line descriptions of the tools that exist. */
  tools: {
    'compress-image': { name: string; description: string; synonyms: string[] };
  };
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

export interface CompressImageTexts extends PageMeta {
  h1: string;
  /** Used when a file has no name. */
  fileFallback: string;
  drop: {
    title: string;
    choose: string;
    /** Help line on desktop, with the paste shortcut: "or paste with {kbd} · JPG, PNG or WebP, one at a time" */
    helpDesktop: string;
    /** Help line on mobile: "JPG, PNG or WebP, one at a time" */
    help: string;
    pasteKey: string;
    over: string;
    overHelp: string;
    errorTitle: string;
    /** "{name} isn't an image Oli can read. Try a JPG or PNG." */
    errorHelp: string;
    chooseAnother: string;
  };
  options: {
    legend: string;
    recommended: string;
    recommendedHelp: string;
    strong: string;
    strongHelp: string;
    /** PNG is saved without loss: the level only changes JPG and WebP. */
    pngNote: string;
  };
  progress: {
    label: string;
    working: string;
  };
  result: {
    /** "Done! Your image is {percent} lighter." */
    done: string;
    /** No gain: the original image goes back, without its metadata. */
    unchanged: string;
    /** This browser cannot save the format: '{format}' is JPG, PNG or WebP. */
    cannotEncode: string;
    placardLabel: string;
    before: string;
    after: string;
    size: string;
    download: string;
    startOver: string;
    /** Visually hidden word between the sizes: "to" / "para" / "a". */
    to: string;
  };
  next: { label: string; moreTools: string };
  howHeading: string;
  howSteps: string[];
  privacyHeading: string;
  privacyNote: string;
  faqHeading: string;
  faq: { q: string; a: string }[];
}
