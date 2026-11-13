// Index of the tool search, fetched only on first use (DECISOES § 15). It lists every image tool and
// preset of the registry. An entry carries a name, a category and a link only for the languages where the
// page exists; its terms (names and synonyms) come from every language that has the text, so a search
// in one language still finds a synonym typed in another. The search shows an entry only in a language
// that has its link (src/search/search.ts), so a page that exists only in English is not offered in
// Portuguese or Spanish. The PDF tools and presets come after the image pages, in the PDF category, then the money calculators
// in the money category: the English ones (all of them also in Spanish since the languages adjustment), the eight
// Brazilian ones (only in Portuguese, F6) and the money guides (English and Spanish). The hubs are not listed, as the image
// hub is not (DECISOES § 160). The ten file guides (in the three languages since the languages adjustment) come next, each
// in the category of its hub, image or PDF, with its name as its only term (DECISOES § 190). F11 (decision 7; DECISOES § 397): every
// guide, of money or of a file, is of the kind 'guide', with the file icon and the category "Guide" of the language, in the
// colour of its group (cat); the rest are of the kind 'tool'. The search shows the guides in their own group, after the
// tools; the order of the index does not change. Last, in English only, the
// home and health calculators, in the categories "Home calculators" and "Health calculators" with the violet of their
// category, and the QR code generator in "Utilities" (F7, decision 9; in pt and es since the languages adjustment).
import type { APIRoute } from 'astro';
import { LANGS, QR_ID, ROUTES, type Lang, type RouteId } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import type { ToolBlurb } from '../i18n/types.ts';
import { IMAGE_PAGES, type ImagePageId } from '../tools/image/registry.ts';
import { normalize, type SearchEntry } from '../search/search.ts';
import { ICONS } from '../icons/icons.ts';
import { BR_CALC_IDS, BR_CALC_PAGES, CALC_PAGES, CALC_PAGE_IDS, GUIDE_IDS, LIFE_CALC_IDS, LIFE_CALC_PAGES, isGuide } from '../tools/calc/registry.ts';
import { PDF_PAGES, type PdfPageId } from '../tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, isFileGuide } from '../tools/guides/registry.ts';

export function searchIndex(): SearchEntry[] {
  return [...imageEntries(), ...pdfEntries(), ...moneyEntries(), ...fileGuideEntries(), ...lifeEntries()];
}

/** The colour of an entry (the design system's category class) and the category written beside its name. */
type Cat = 'money' | 'pdf' | 'image' | 'home' | 'util';
type Area = 'money' | 'pdf' | 'image' | 'house' | 'health' | 'util' | 'guide';
const CATEGORY: Record<Area, (lang: Lang) => string> = {
  guide: (lang) => TEXTS[lang].common.search.guideCategory,
  image: (lang) => TEXTS[lang].common.search.imageCategory,
  pdf: (lang) => TEXTS[lang].common.search.pdfCategory,
  money: (lang) => TEXTS[lang].common.search.moneyCategory,
  house: (lang) => TEXTS[lang].common.search.homeCategory ?? '',
  health: (lang) => TEXTS[lang].common.search.healthCategory ?? '',
  util: (lang) => TEXTS[lang].common.search.utilityCategory ?? '',
};

/**
 * One entry per page: the link, the name and the category in each language where the page has a path and a card,
 * and the terms of every one of those languages. A page with no row in the route map (not built) gets no entry. The
 * colour (`cat`) and the category written beside the name (`area`) are the same but for Image to PDF, which has the
 * PDF colour and stays in the image category, as before the F6.
 */
function entry(id: RouteId, cat: Cat, icon: string, blurbOf: (lang: Lang) => ToolBlurb | undefined, area: Area = cat as Area): SearchEntry[] {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (!route) return [];
  const kind = isGuide(id) || isFileGuide(id) ? 'guide' : 'tool';
  const found: SearchEntry = { id, kind, href: {}, name: {}, category: {}, cat, icon, terms: [] };
  const terms = new Set<string>();
  for (const lang of LANGS) {
    const path = route.paths[lang];
    const blurb = path ? blurbOf(lang) : undefined;
    if (!path || !blurb) continue;
    found.href[lang] = path;
    found.name[lang] = blurb.name;
    found.category[lang] = CATEGORY[area](lang);
    for (const term of [blurb.name, ...blurb.synonyms]) terms.add(normalize(term));
  }
  found.terms = [...terms];
  return [found];
}

function imageEntries(): SearchEntry[] {
  return (Object.keys(IMAGE_PAGES) as ImagePageId[]).flatMap((id) =>
    entry(id, IMAGE_PAGES[id].pdf ? 'pdf' : 'image', ICONS[IMAGE_PAGES[id].icon], (lang) => TEXTS[lang].common.tools[id], 'image'),
  );
}

/**
 * The PDF tools, in hub order, with the paths of the route map (the same ones the pages are built on). F18 (decision 5):
 * then the PDF presets, as the image presets follow the image tools (the key order of PDF_PAGES).
 */
function pdfEntries(): SearchEntry[] {
  return (Object.keys(PDF_PAGES) as PdfPageId[]).flatMap((id) => entry(id, 'pdf', ICONS[PDF_PAGES[id].icon], (lang) => TEXTS[lang].common.pdf[id]));
}

function moneyEntries(): SearchEntry[] {
  const calc = (lang: Lang, id: keyof typeof TEXTS.en.common.calcs | (typeof BR_CALC_IDS)[number]) => TEXTS[lang].common.calcs[id];
  return [
    ...CALC_PAGE_IDS.flatMap((id) => entry(id, 'money', ICONS[CALC_PAGES[id].icon], (lang) => calc(lang, id))),
    ...BR_CALC_IDS.flatMap((id) => entry(id, 'money', ICONS[BR_CALC_PAGES[id].icon], (lang) => calc(lang, id))),
    ...GUIDE_IDS.flatMap((id) => entry(id, 'money', ICONS.file, (lang) => TEXTS[lang].common.guides?.[id], 'guide')),
  ];
}

/** The file guides, in registry order: the file icon, in the colour of its hub, in the category "Guide" (F11). */
function fileGuideEntries(): SearchEntry[] {
  return FILE_GUIDE_IDS.flatMap((id) => entry(id, FILE_GUIDES[id].hub === 'pdf-tools' ? 'pdf' : 'image', ICONS.file, (lang) => TEXTS[lang].common.fileGuides?.[id], 'guide'));
}

/** The home and health calculators in hub order (English only, F7), then the QR code generator (en, pt and es). */
function lifeEntries(): SearchEntry[] {
  return [
    ...LIFE_CALC_IDS.flatMap((id) => entry(id, 'home', ICONS[LIFE_CALC_PAGES[id].icon], (lang) => (lang === 'en' ? TEXTS.en.common.calcs[id] : undefined), LIFE_CALC_PAGES[id].hub)),
    ...entry(QR_ID, 'util', ICONS.qr, (lang) => TEXTS[lang].common.qr),
  ];
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchIndex()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
