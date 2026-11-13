// The changes a person sees, the single source of the What's new page, of the <lastmod> of the sitemaps, of the line
// "Updated on" of the tool pages and of the date in the footer (F19a, decisions 1 to 4; DECISOES § 751 to § 754).
// Plain data, read in Node by the build, the gates and the tests: never import it from an island.
//
// One entry per change a person sees on the site, oldest first; a run that changes what a person sees appends its entry
// at the end (docs/claude/idiomas.md, F19a). Each entry has:
// - `date`: the day the pull request was merged into main, in Brasília (AAAA-MM-DD); tests/unit/changelog.test.ts checks it
//   against the squash commit of that pull request in the history of main, with one day of tolerance;
// - `pr`: the number of that pull request; null only in the newest entry, until the next run checks it;
// - `kind`: 'conteudo' when it changes what a person reads or uses on a page (a text, a tool, a calculation, a guide);
//   'site' when it changes only what belongs to every page (the menu, the theme, the footer, the cookie notice, the
//   signature, the author box). Only 'conteudo' moves the <lastmod> of a page;
// - `pages`: the routes the change touched, as a RouteId or as a named group (`all:<group>`, resolved from the registries).
//   A group stands for the pages of it that already existed in that language on the date of the entry: the first entry
//   that names a page by its RouteId, in a language, is the birth of the page there, and the test proves every birth
//   against the first commit of main that has the page file (the pages of before the launch are born at the launch);
// - `langs`: the languages the change happened in (all three when absent).
// The texts of each entry (a short title and one to three sentences in the voice of the site) are in
// src/i18n/{en,pt,es}/whats-new.ts, under its id.
import { LANGS, ROUTES, type Lang, type RouteId } from '../i18n/routes.ts';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../tools/image/registry.ts';
import { PDF_PRESET_IDS, PDF_TOOL_IDS } from '../tools/pdf/registry.ts';
import { BR_CALC_IDS, CALC_PRESET_IDS, CALC_TOOL_IDS, GUIDE_IDS, HEALTH_CALC_IDS, HOUSE_CALC_IDS } from '../tools/calc/registry.ts';
import { FILE_GUIDE_IDS } from '../tools/guides/registry.ts';

export type ChangeKind = 'conteudo' | 'site';

/** The named groups of pages, each resolved from its registry (decision 1: never a list copied by hand). */
export const PAGE_GROUPS = {
  'image-tools': IMAGE_TOOL_IDS,
  'image-presets': IMAGE_PRESET_IDS,
  'pdf-tools': PDF_TOOL_IDS,
  'pdf-presets': PDF_PRESET_IDS,
  'money-calculators': CALC_TOOL_IDS,
  'money-presets': CALC_PRESET_IDS,
  'money-guides': GUIDE_IDS,
  'br-calculators': BR_CALC_IDS,
  'home-calculators': HOUSE_CALC_IDS,
  'health-calculators': HEALTH_CALC_IDS,
  'file-guides': FILE_GUIDE_IDS,
  hubs: ['image-tools', 'pdf-tools', 'money-calculators', 'br-money-calculators', 'home-calculators', 'health-calculators', 'guides'],
  institutional: ['privacy', 'terms', 'about', 'contact', 'licenses', 'support'],
} as const satisfies Record<string, readonly RouteId[]>;
export type PageGroup = keyof typeof PAGE_GROUPS;
export type PageRef = RouteId | `all:${PageGroup}`;

export interface ChangeEntry {
  id: string;
  date: string;
  pr: number | null;
  kind: ChangeKind;
  pages: readonly PageRef[];
  langs?: readonly Lang[];
}

export const CHANGELOG = [
  // F2 (#5), the launch (DECISOES § 75): the pages that existed before it in the three languages went live with it.
  { id: 'launch', date: '2026-10-31', pr: 5, kind: 'conteudo', pages: ['home', 'compress-image', 'privacy', 'terms', 'about', 'contact', 'licenses', 'support'] },
  {
    id: 'image-tools',
    date: '2026-10-31',
    pr: 5,
    kind: 'conteudo',
    langs: ['en'],
    pages: ['image-tools', 'resize-image', 'crop-image', 'rotate-image', 'heic-to-jpg', 'webp-to-jpg', 'png-to-jpg', 'image-to-pdf', 'compress-image-to-100kb', 'compress-image-to-1mb', 'resize-image-youtube-thumbnail'],
  },
  // F3 (#7) and the adjustment of the cookie notice (#8).
  { id: 'private-chunks', date: '2026-10-31', pr: 7, kind: 'conteudo', pages: ['all:image-tools', 'all:image-presets', 'all:hubs'] },
  { id: 'cookie-notice-space', date: '2026-10-31', pr: 8, kind: 'site', pages: [] },
  // F4 (#11): the money calculators, their presets and guides, in English.
  {
    id: 'money-calculators',
    date: '2026-11-01',
    pr: 11,
    kind: 'conteudo',
    langs: ['en'],
    pages: [
      'money-calculators',
      'mortgage-calculator',
      'personal-loan-calculator',
      'auto-loan-calculator',
      'refinance-calculator',
      'home-affordability-calculator',
      'loan-amortization-calculator',
      'credit-card-payoff-calculator',
      'debt-payoff-calculator',
      'debt-consolidation-calculator',
      'rent-vs-buy-calculator',
      'compound-interest-calculator',
      'savings-goal-calculator',
      'simple-interest-calculator',
      'apr-to-apy-calculator',
      'mortgage-calculator-extra-payments',
      'mortgage-calculator-biweekly',
      'mortgage-calculator-15-vs-30-year',
      'loan-amortization-calculator-balloon-payment',
      'guides-15-vs-30-year-mortgage',
      'guides-debt-snowball-vs-avalanche',
      'guides-extra-mortgage-payments',
      'guides-refinance-break-even',
      'guides-rent-vs-buy-break-even',
      'home',
    ],
  },
  // F5a (#12): the PDF tools in English.
  {
    id: 'pdf-tools',
    date: '2026-11-01',
    pr: 12,
    kind: 'conteudo',
    langs: ['en'],
    pages: ['pdf-tools', 'merge-pdf', 'split-pdf', 'pdf-to-jpg', 'compress-pdf', 'rotate-pdf', 'delete-pdf-pages', 'add-page-numbers-to-pdf', 'sign-pdf', 'protect-pdf', 'unlock-pdf', 'reorder-pdf-pages', 'watermark-pdf', 'home'],
  },
  // F5b (#13): the file guides in English.
  {
    id: 'file-guides',
    date: '2026-11-01',
    pr: 13,
    kind: 'conteudo',
    langs: ['en'],
    pages: [
      'guides-heic-to-jpg-on-windows',
      'guides-why-is-my-pdf-so-large',
      'guides-social-media-image-sizes',
      'guides-open-webp-save-as-jpg',
      'guides-jpg-vs-png',
      'guides-remove-location-from-photos',
      'guides-pdf-to-jpg-resolution',
      'guides-split-pdf-file-size',
      'guides-combine-pdfs-on-phone',
      'guides-photos-to-one-pdf',
    ],
  },
  // F6 (#14): Portuguese and Spanish.
  {
    id: 'portuguese-spanish',
    date: '2026-11-02',
    pr: 14,
    kind: 'conteudo',
    langs: ['pt', 'es'],
    pages: [
      'image-tools',
      'resize-image',
      'crop-image',
      'rotate-image',
      'heic-to-jpg',
      'webp-to-jpg',
      'png-to-jpg',
      'image-to-pdf',
      'compress-image-to-100kb',
      'compress-image-to-1mb',
      'resize-image-youtube-thumbnail',
      'pdf-tools',
      'merge-pdf',
      'split-pdf',
      'pdf-to-jpg',
      'compress-pdf',
      'rotate-pdf',
      'delete-pdf-pages',
      'add-page-numbers-to-pdf',
      'sign-pdf',
      'protect-pdf',
      'unlock-pdf',
      'reorder-pdf-pages',
      'watermark-pdf',
      'br-money-calculators',
      'br-sac-price',
      'br-vehicle-loan',
      'br-personal-loan',
      'br-early-payoff',
      'br-credit-card',
      'br-debt-payoff',
      'br-compound-interest',
      'br-rent-or-buy',
      'money-calculators',
      'mortgage-calculator',
      'personal-loan-calculator',
      'credit-card-payoff-calculator',
      'debt-payoff-calculator',
      'compound-interest-calculator',
      'home',
      'support',
    ],
  },
  // F7 (#15): home and health calculators and the QR code generator, in English.
  {
    id: 'home-health-calculators',
    date: '2026-11-02',
    pr: 15,
    kind: 'conteudo',
    langs: ['en'],
    pages: [
      'home-calculators',
      'health-calculators',
      'square-footage-calculator',
      'concrete-calculator',
      'mulch-calculator',
      'paint-calculator',
      'tile-calculator',
      'btu-calculator',
      'bmi-calculator',
      'calorie-calculator',
      'ovulation-calculator',
      'body-fat-calculator',
      'due-date-calculator',
      'home',
    ],
  },
  { id: 'qr-code', date: '2026-11-02', pr: 15, kind: 'conteudo', langs: ['en'], pages: ['qr-code-generator'] },
  // F8 (#18): offline and "Open with".
  { id: 'offline', date: '2026-11-02', pr: 18, kind: 'site', pages: [] },
  // The languages adjustment (#19).
  {
    id: 'more-in-portuguese-spanish',
    date: '2026-11-03',
    pr: 19,
    kind: 'conteudo',
    langs: ['pt', 'es'],
    pages: [
      'qr-code-generator',
      'auto-loan-calculator',
      'refinance-calculator',
      'home-affordability-calculator',
      'loan-amortization-calculator',
      'debt-consolidation-calculator',
      'rent-vs-buy-calculator',
      'savings-goal-calculator',
      'simple-interest-calculator',
      'apr-to-apy-calculator',
      'mortgage-calculator-extra-payments',
      'mortgage-calculator-biweekly',
      'mortgage-calculator-15-vs-30-year',
      'loan-amortization-calculator-balloon-payment',
      'guides-15-vs-30-year-mortgage',
      'guides-debt-snowball-vs-avalanche',
      'guides-extra-mortgage-payments',
      'guides-refinance-break-even',
      'guides-rent-vs-buy-break-even',
      'guides-heic-to-jpg-on-windows',
      'guides-why-is-my-pdf-so-large',
      'guides-social-media-image-sizes',
      'guides-open-webp-save-as-jpg',
      'guides-jpg-vs-png',
      'guides-remove-location-from-photos',
      'guides-pdf-to-jpg-resolution',
      'guides-split-pdf-file-size',
      'guides-combine-pdfs-on-phone',
      'guides-photos-to-one-pdf',
      'money-calculators',
      'home',
    ],
  },
  // F11 (#23), the header adjustment (#24) and F12 (#25).
  { id: 'theme-and-menu', date: '2026-11-04', pr: 23, kind: 'site', pages: [] },
  { id: 'guides-hub', date: '2026-11-04', pr: 23, kind: 'conteudo', pages: ['guides', 'home'] },
  { id: 'header-width', date: '2026-11-04', pr: 24, kind: 'site', pages: [] },
  { id: 'support-page', date: '2026-11-04', pr: 25, kind: 'conteudo', pages: ['support'] },
  // F13a (#26).
  { id: 'tool-page', date: '2026-11-05', pr: 26, kind: 'conteudo', pages: ['all:image-tools', 'all:image-presets', 'all:pdf-tools'] },
  { id: 'cookie-notice', date: '2026-11-05', pr: 26, kind: 'site', pages: [] },
  // F13b (#27) and the adjustment of the home cards (#28).
  {
    id: 'calculator-card',
    date: '2026-11-06',
    pr: 27,
    kind: 'conteudo',
    pages: ['all:money-calculators', 'all:money-presets', 'all:br-calculators', 'all:home-calculators', 'all:health-calculators', 'qr-code-generator'],
  },
  { id: 'file-guide-page', date: '2026-11-06', pr: 27, kind: 'conteudo', pages: ['all:file-guides'] },
  { id: 'home-and-hubs', date: '2026-11-06', pr: 27, kind: 'conteudo', pages: ['home', 'all:hubs'] },
  { id: 'institutional-pages', date: '2026-11-06', pr: 27, kind: 'conteudo', pages: ['all:institutional'] },
  { id: 'footer-phone', date: '2026-11-06', pr: 27, kind: 'site', pages: [] },
  { id: 'home-cards', date: '2026-11-06', pr: 28, kind: 'conteudo', pages: ['home'] },
  // F14 (#29), F15 (#31), F16 (#32) and F17 (#33).
  { id: 'pdf-pages', date: '2026-11-09', pr: 29, kind: 'conteudo', pages: ['all:pdf-tools'] },
  { id: 'next-steps', date: '2026-11-09', pr: 31, kind: 'conteudo', pages: ['all:image-tools', 'all:image-presets', 'all:pdf-tools', 'qr-code-generator'] },
  {
    id: 'calculator-typing',
    date: '2026-11-10',
    pr: 32,
    kind: 'conteudo',
    pages: ['all:money-calculators', 'all:money-presets', 'all:br-calculators', 'all:home-calculators', 'all:health-calculators'],
  },
  { id: 'avif-webp', date: '2026-11-10', pr: 33, kind: 'conteudo', pages: ['avif-to-jpg', 'convert-to-webp', 'image-tools', 'compress-image', 'home'] },
  // F18 (#35).
  {
    id: 'organize-exif',
    date: '2026-11-13',
    pr: 35,
    kind: 'conteudo',
    pages: ['remove-exif-data', 'rotate-image-flip', 'organize-pdf', 'split-pdf-extract-pages', 'pdf-to-jpg-to-png', 'image-tools', 'pdf-tools', 'home'],
  },
  { id: 'file-guides-measured', date: '2026-11-13', pr: 35, kind: 'conteudo', pages: ['all:file-guides'] },
  // F19a (this run; decision 9): the two new pages and the texts of the tools without repetition.
  {
    id: 'trust-and-content',
    date: '2026-11-13',
    pr: null,
    kind: 'conteudo',
    pages: [
      'whats-new',
      'how-it-works',
      'about',
      'privacy',
      'home',
      'all:image-tools',
      'all:image-presets',
      'all:pdf-tools',
      'all:pdf-presets',
      'qr-code-generator',
      'all:money-calculators',
      'all:money-presets',
      'all:br-calculators',
      'all:home-calculators',
      'all:health-calculators',
    ],
  },
] as const satisfies readonly ChangeEntry[];

export type ChangeId = (typeof CHANGELOG)[number]['id'];
export type Change = (typeof CHANGELOG)[number];

function isGroup(ref: PageRef): ref is `all:${PageGroup}` {
  return ref.startsWith('all:');
}

function langsOf(entry: ChangeEntry): readonly Lang[] {
  return entry.langs ?? LANGS;
}

function hasPath(id: RouteId, lang: Lang): boolean {
  return ROUTES.some((route) => route.id === id && route.paths[lang] !== undefined);
}

/**
 * The births: for each language, the index of the first entry that names each page by its RouteId there. A group
 * resolves only to pages already born in that language at the entry (decision 1, "the pages of it that existed").
 */
function birthsIn(lang: Lang): Map<RouteId, number> {
  const born = new Map<RouteId, number>();
  (CHANGELOG as readonly ChangeEntry[]).forEach((entry, index) => {
    if (!langsOf(entry).includes(lang)) return;
    for (const ref of entry.pages) {
      if (isGroup(ref)) continue;
      if (hasPath(ref, lang) && !born.has(ref)) born.set(ref, index);
    }
  });
  return born;
}

const BIRTHS: Record<Lang, Map<RouteId, number>> = { en: birthsIn('en'), pt: birthsIn('pt'), es: birthsIn('es') };

/** The index of the entry where a page was born in a language, or undefined where it does not exist there. */
export function birthOf(id: RouteId, lang: Lang): number | undefined {
  return BIRTHS[lang].get(id);
}

/** The pages an entry touched in a language, in its order, with no repetition: what the What's new page links to. */
export function pagesIn(entry: ChangeEntry, lang: Lang): RouteId[] {
  if (!langsOf(entry).includes(lang)) return [];
  const index = (CHANGELOG as readonly ChangeEntry[]).indexOf(entry);
  const out: RouteId[] = [];
  const add = (id: RouteId) => {
    const born = BIRTHS[lang].get(id);
    if (born !== undefined && born <= index && !out.includes(id)) out.push(id);
  };
  for (const ref of entry.pages) {
    if (isGroup(ref)) for (const id of PAGE_GROUPS[ref.slice(4) as PageGroup]) add(id);
    else add(ref);
  }
  return out;
}

/** The entries a language shows, newest first: a 'site' entry of its languages, or one that touched a page there. */
export function entriesIn(lang: Lang): Change[] {
  return CHANGELOG.filter((entry: ChangeEntry) => langsOf(entry).includes(lang) && (entry.kind === 'site' || pagesIn(entry, lang).length > 0)).reverse();
}

/** The newest entry a language shows: the date in the footer of every page. */
export function newestIn(lang: Lang): Change {
  const [newest] = entriesIn(lang);
  if (!newest) throw new Error(`no entry of the changelog in ${lang}`);
  return newest;
}

/**
 * The <lastmod> of a page (decision 3): the date of the newest 'conteudo' entry that touched it in the language. Every
 * indexable page of every language has one (its birth at least), so a missing one stops the build.
 */
export function lastmodOf(id: RouteId, lang: Lang): string {
  let date: string | undefined;
  for (const entry of CHANGELOG as readonly ChangeEntry[]) {
    if (entry.kind === 'conteudo' && pagesIn(entry, lang).includes(id) && (date === undefined || entry.date > date)) date = entry.date;
  }
  if (date === undefined) throw new Error(`no 'conteudo' entry of the changelog touched ${id} in ${lang}`);
  return date;
}
