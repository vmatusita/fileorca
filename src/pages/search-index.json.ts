// Index of the tool search, fetched only on first use (DECISOES § 15).
import type { APIRoute } from 'astro';
import { LANGS, pathFor } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import { normalize, type SearchEntry } from '../search/search.ts';

const TOOLS = ['compress-image'] as const;

export function searchIndex(): SearchEntry[] {
  return TOOLS.map((id) => {
    const entry: SearchEntry = { id, href: {}, name: {}, category: {}, terms: [] };
    const terms = new Set<string>();
    for (const lang of LANGS) {
      const tool = TEXTS[lang].common.tools[id];
      entry.href[lang] = pathFor(id, lang);
      entry.name[lang] = tool.name;
      entry.category[lang] = TEXTS[lang].common.search.imageCategory;
      for (const term of [tool.name, ...tool.synonyms]) terms.add(normalize(term));
    }
    entry.terms = [...terms];
    return entry;
  });
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchIndex()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
