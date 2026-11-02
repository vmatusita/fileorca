// The texts and the island data of the QR code generator (prompt F7, decision 8). English only, so the type lives with the
// tool instead of src/i18n/types.ts; the shape follows the image tools (ImageToolTexts) where the page is the same.
import type { Lang } from '../../i18n/routes.ts';

/** What the island shows: it goes to the browser in data-props, so nothing here is page-only text. */
export interface QrPanelTexts {
  field: {
    label: string;
    placeholder: string;
    /** The limit in words, under the box. {max} is the limit in characters (bytes of UTF-8). */
    help: string;
    /** Next to the label: how much of the limit the text takes. */
    count: string;
  };
  oli: { legend: string; on: string; off: string };
  size: {
    legend: string;
    small: string;
    medium: string;
    large: string;
    /** The real side of the PNG under each choice: {side}. */
    px: string;
    note: string;
  };
  preview: {
    /** The accessible name of the drawn code. */
    label: string;
    /** In the box before anything is typed. */
    empty: string;
    /** The status line while there is a code to save. */
    ready: string;
  };
  download: {
    png: string;
    svg: string;
    /** After "Download PNG": the real side, {side}. */
    pngMeta: string;
  };
  errors: {
    /** Nothing but white space in the box. */
    empty: string;
    /**
     * Over the limit: {max}. It says no count, so the alert stays the same while the person types on (a live count in a
     * role="alert" would be read out at every key); the count is next to the label.
     */
    long: string;
    /** The canvas could not give a PNG. */
    png: string;
  };
}

export interface QrPageTexts {
  title: string;
  description: string;
  h1: string;
  /** The PrivacySeal of this page: the text, not a file. */
  seal: string;
  howHeading: string;
  howSteps: string[];
  specsHeading: string;
  specs: { caption: string; head: [string, string]; rows: [string, string][] };
  faqHeading: string;
  faq: { q: string; a: string }[];
  privacyHeading: string;
  privacyNote: string;
  relatedHeading: string;
  panel: QrPanelTexts;
}

/** The island's props (data-props): the language and the panel texts, nothing the person typed. */
export interface QrPanelData {
  lang: Lang;
  t: QrPanelTexts;
}
