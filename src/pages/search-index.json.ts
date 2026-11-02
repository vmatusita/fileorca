// Index of the tool search, fetched only on first use (DECISOES § 15). It lists every image tool and
// preset of the registry. An entry carries a name, a category and a link only for the languages where the
// page exists; its terms (names and synonyms) come from every language that has the text, so a search
// in one language still finds a synonym typed in another. The search shows an entry only in a language
// that has its link (src/search/search.ts), so a page that exists only in English is not offered in
// Portuguese or Spanish. The 12 PDF tools (English only, F5a) come after the image pages, in the PDF category,
// and the money calculators and the guides (English only, F4) after them, in the money category. The hubs are not
// listed, as the image hub is not (DECISOES § 160). The ten file guides (English only, F5b) come last, each in the category
// of its hub, image or PDF, with its name as its only term (DECISOES § 190).
import type { APIRoute } from 'astro';
import { LANGS, routeById } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import { blurbOf } from '../tools/image/page.ts';
import { IMAGE_PAGES, type ImagePageId } from '../tools/image/registry.ts';
import { normalize, type SearchEntry } from '../search/search.ts';
import { ICONS } from '../icons/icons.ts';
import enCommon from '../i18n/en/common.ts';
import { CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS } from '../tools/calc/registry.ts';
import { PDF_PAGES, PDF_TOOL_IDS } from '../tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../tools/guides/registry.ts';

export function searchIndex(): SearchEntry[] {
  return [...imageEntries(), ...pdfEntries(), ...moneyEntries(), ...fileGuideEntries()];
}

/** A page that exists in English only: its category is the one of its area (money, PDF). */
function englishEntry(id: string, path: string, blurb: { name: string; synonyms: string[] }, icon: string, cat: 'money' | 'pdf' | 'image', category: string): SearchEntry {
  const terms = new Set([blurb.name, ...blurb.synonyms].map(normalize));
  return { id, href: { en: path }, name: { en: blurb.name }, category: { en: category }, cat, icon, terms: [...terms] };
}

function moneyEntries(): SearchEntry[] {
  const entry = (id: string, path: string, blurb: { name: string; synonyms: string[] }, icon: string) => englishEntry(id, path, blurb, icon, 'money', enCommon.search.moneyCategory);
  return [
    ...CALC_PAGE_IDS.map((id) => entry(id, CALC_PAGES[id].path, enCommon.calcs[id], ICONS[CALC_PAGES[id].icon])),
    ...GUIDE_IDS.map((id) => entry(id, GUIDES[id].path, enCommon.guides[id], ICONS[CALC_PAGES[GUIDES[id].calc].icon])),
  ];
}

/** The file guides, in registry order: the icon of the tool each one embeds, the category of its hub. */
function fileGuideEntries(): SearchEntry[] {
  return FILE_GUIDE_IDS.map((id) => {
    const def = FILE_GUIDES[id];
    const icon = def.tool in PDF_PAGES ? PDF_PAGES[def.tool as keyof typeof PDF_PAGES].icon : IMAGE_PAGES[def.tool as ImagePageId].icon;
    const pdf = def.hub === 'pdf-tools';
    return englishEntry(id, def.path, enCommon.fileGuides[id], ICONS[icon], pdf ? 'pdf' : 'image', pdf ? enCommon.search.pdfCategory : enCommon.search.imageCategory);
  });
}

/** The 12 PDF tools, in hub order, with the path of the route map (the same one the pages are built on). */
function pdfEntries(): SearchEntry[] {
  return PDF_TOOL_IDS.flatMap((id) => {
    const path = routeById(id).paths['en'];
    return path ? [englishEntry(id, path, enCommon.pdf[id], ICONS[PDF_PAGES[id].icon], 'pdf', enCommon.search.pdfCategory)] : [];
  });
}

function imageEntries(): SearchEntry[] {
  return (Object.keys(IMAGE_PAGES) as ImagePageId[]).map((id) => {
    const def = IMAGE_PAGES[id];
    const route = routeById(id);
    const entry: SearchEntry = { id, href: {}, name: {}, category: {}, cat: def.pdf ? 'pdf' : 'image', icon: ICONS[def.icon], terms: [] };
    const terms = new Set<string>();
    for (const lang of LANGS) {
      const path = route.paths[lang];
      const blurb = path ? blurbOf(id, lang) : undefined;
      if (!path || !blurb) continue;
      entry.href[lang] = path;
      entry.name[lang] = blurb.name;
      entry.category[lang] = TEXTS[lang].common.search.imageCategory;
      for (const term of [blurb.name, ...blurb.synonyms]) terms.add(normalize(term));
    }
    entry.terms = [...terms];
    return entry;
  });
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchIndex()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
