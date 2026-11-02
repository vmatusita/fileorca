// Index of the tool search, fetched only on first use (DECISOES § 15). It lists every image tool and
// preset of the registry. An entry carries a name, a category and a link only for the languages where the
// page exists; its terms (names and synonyms) come from every language that has the text, so a search
// in one language still finds a synonym typed in another. The search shows an entry only in a language
// that has its link (src/search/search.ts), so a page that exists only in English is not offered in
// Portuguese or Spanish. The 12 PDF tools come after the image pages, in the PDF category, then the money calculators
// in the money category: the English ones (five of them also in Spanish), the eight Brazilian ones (only in Portuguese,
// F6) and the money guides (English only, F4). The hubs are not listed, as the image hub is not (DECISOES § 160). The
// ten file guides (English only, F5b) come last, each in the category of its hub, image or PDF, with its name as its
// only term (DECISOES § 190).
import type { APIRoute } from 'astro';
import { LANGS, ROUTES, type Lang, type RouteId } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import type { ToolBlurb } from '../i18n/types.ts';
import { IMAGE_PAGES, type ImagePageId } from '../tools/image/registry.ts';
import { normalize, type SearchEntry } from '../search/search.ts';
import { ICONS } from '../icons/icons.ts';
import enCommon from '../i18n/en/common.ts';
import { BR_CALC_IDS, BR_CALC_PAGES, CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS } from '../tools/calc/registry.ts';
import { PDF_PAGES, PDF_TOOL_IDS } from '../tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../tools/guides/registry.ts';

export function searchIndex(): SearchEntry[] {
  return [...imageEntries(), ...pdfEntries(), ...moneyEntries(), ...fileGuideEntries()];
}

type Cat = 'money' | 'pdf' | 'image';
const CATEGORY: Record<Cat, (lang: Lang) => string> = {
  image: (lang) => TEXTS[lang].common.search.imageCategory,
  pdf: (lang) => TEXTS[lang].common.search.pdfCategory,
  money: (lang) => TEXTS[lang].common.search.moneyCategory,
};

/**
 * One entry per page: the link, the name and the category in each language where the page has a path and a card,
 * and the terms of every one of those languages. A page with no row in the route map (not built) gets no entry.
 */
function entry(id: RouteId, cat: Cat, icon: string, blurbOf: (lang: Lang) => ToolBlurb | undefined): SearchEntry[] {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (!route) return [];
  const found: SearchEntry = { id, href: {}, name: {}, category: {}, cat, icon, terms: [] };
  const terms = new Set<string>();
  for (const lang of LANGS) {
    const path = route.paths[lang];
    const blurb = path ? blurbOf(lang) : undefined;
    if (!path || !blurb) continue;
    found.href[lang] = path;
    found.name[lang] = blurb.name;
    found.category[lang] = CATEGORY[cat](lang);
    for (const term of [blurb.name, ...blurb.synonyms]) terms.add(normalize(term));
  }
  found.terms = [...terms];
  return [found];
}

function imageEntries(): SearchEntry[] {
  return (Object.keys(IMAGE_PAGES) as ImagePageId[]).flatMap((id) =>
    entry(id, IMAGE_PAGES[id].pdf ? 'pdf' : 'image', ICONS[IMAGE_PAGES[id].icon], (lang) => TEXTS[lang].common.tools[id]),
  );
}

/** The 12 PDF tools, in hub order, with the paths of the route map (the same ones the pages are built on). */
function pdfEntries(): SearchEntry[] {
  return PDF_TOOL_IDS.flatMap((id) => entry(id, 'pdf', ICONS[PDF_PAGES[id].icon], (lang) => TEXTS[lang].common.pdf[id]));
}

function moneyEntries(): SearchEntry[] {
  const calc = (lang: Lang, id: keyof typeof TEXTS.en.common.calcs | (typeof BR_CALC_IDS)[number]) => TEXTS[lang].common.calcs[id];
  return [
    ...CALC_PAGE_IDS.flatMap((id) => entry(id, 'money', ICONS[CALC_PAGES[id].icon], (lang) => calc(lang, id))),
    ...BR_CALC_IDS.flatMap((id) => entry(id, 'money', ICONS[BR_CALC_PAGES[id].icon], (lang) => calc(lang, id))),
    ...GUIDE_IDS.flatMap((id) => entry(id, 'money', ICONS[CALC_PAGES[GUIDES[id].calc].icon], (lang) => (lang === 'en' ? enCommon.guides[id] : undefined))),
  ];
}

/** The file guides, in registry order: the icon of the tool each one embeds, the category of its hub. */
function fileGuideEntries(): SearchEntry[] {
  return FILE_GUIDE_IDS.flatMap((id) => {
    const def = FILE_GUIDES[id];
    const icon = def.tool in PDF_PAGES ? PDF_PAGES[def.tool as keyof typeof PDF_PAGES].icon : IMAGE_PAGES[def.tool as ImagePageId].icon;
    const blurb = enCommon.fileGuides[id];
    return entry(id, def.hub === 'pdf-tools' ? 'pdf' : 'image', ICONS[icon], (lang) => (lang === 'en' ? blurb : undefined));
  });
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchIndex()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
