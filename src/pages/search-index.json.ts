// Index of the tool search, fetched only on first use (DECISOES § 15). It lists every image tool and
// preset of the registry. An entry carries a name, a category and a link only for the languages where the
// page exists; its terms (names and synonyms) come from every language that has the text, so a search
// in one language still finds a synonym typed in another. The search shows an entry only in a language
// that has its link (src/search/search.ts), so a page that exists only in English is not offered in
// Portuguese or Spanish. The money calculators and the guides (English only, F4) come after the image pages,
// in the money category.
import type { APIRoute } from 'astro';
import { LANGS, routeById } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import { blurbOf } from '../tools/image/page.ts';
import { IMAGE_PAGES, type ImagePageId } from '../tools/image/registry.ts';
import { normalize, type SearchEntry } from '../search/search.ts';
import { ICONS } from '../icons/icons.ts';
import enCommon from '../i18n/en/common.ts';
import { CALC_PAGES, CALC_PAGE_IDS, GUIDES, GUIDE_IDS } from '../tools/calc/registry.ts';

export function searchIndex(): SearchEntry[] {
  return [...imageEntries(), ...moneyEntries()];
}

/** A money page: English only, in the money category. */
function moneyEntry(id: string, path: string, blurb: { name: string; synonyms: string[] }, icon: string): SearchEntry {
  const terms = new Set([blurb.name, ...blurb.synonyms].map(normalize));
  return { id, href: { en: path }, name: { en: blurb.name }, category: { en: enCommon.search.moneyCategory }, cat: 'money', icon, terms: [...terms] };
}

function moneyEntries(): SearchEntry[] {
  return [
    ...CALC_PAGE_IDS.map((id) => moneyEntry(id, CALC_PAGES[id].path, enCommon.calcs[id], ICONS[CALC_PAGES[id].icon])),
    ...GUIDE_IDS.map((id) => moneyEntry(id, GUIDES[id].path, enCommon.guides[id], ICONS[CALC_PAGES[GUIDES[id].calc].icon])),
  ];
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
