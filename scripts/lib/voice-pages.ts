// The pages whose voice gate:design reads (docs/design/README, "Voz"; DECISOES § 164 and § 188) and the check of one
// page: its visible text and, where the page has an island, the texts the island gets in data-props (`t`, the bits a kind
// of tool shares, and `texts`, the tool's own), against checkVoice in the language of the page. The pages come from the
// registries and the route map, never from a hand list of paths. Pure functions, proven in tests/unit/design-checks.test.ts.
import { parse } from 'node-html-parser';
import { checkVoice } from './design-checks.ts';
import { visibleText } from './conteudo.ts';
import { LANGS, QR_ID, languagesOf, routeById, type Lang, type RouteId } from '../../src/i18n/routes.ts';
import { CALC_PAGE_IDS, GUIDE_IDS, MONEY_HUB_ID, type CalcPageId } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';

export interface VoicePage {
  id: RouteId;
  lang: Lang;
  path: string;
}

/** Every language a route has, as voice pages, or only the languages given. */
function pagesOf(ids: readonly RouteId[], only?: readonly Lang[]): VoicePage[] {
  return ids.flatMap((id) => {
    const route = routeById(id);
    return languagesOf(route)
      .filter((lang) => !only || only.includes(lang))
      .map((lang) => ({ id, lang, path: route.paths[lang] ?? '' }));
  });
}

/** The 12 PDF tools and the PDF hub, in every language of their route (F5a; the three since the F6). */
export function pdfVoicePages(): VoicePage[] {
  return pagesOf([...PDF_TOOL_IDS, PDF_HUB_ID]);
}

/** The ten file guides (F5b), in each language of the registry: the three since the languages adjustment. */
export function fileGuideVoicePages(): VoicePage[] {
  return FILE_GUIDE_IDS.flatMap((id) => LANGS.map((lang) => ({ id, lang, path: FILE_GUIDES[id].paths[lang] })));
}

/**
 * The five calculators with a Spanish page since the F6 (decision 6). Their Spanish pages, like every other page that
 * existed before the languages adjustment, stay out of the voice check until PENDENCIAS F7 f-11 is done.
 */
export const F6_ES_CALC_IDS: readonly CalcPageId[] = [
  'mortgage-calculator',
  'personal-loan-calculator',
  'credit-card-payoff-calculator',
  'debt-payoff-calculator',
  'compound-interest-calculator',
];

/**
 * The other pages the languages adjustment added: the QR code generator in Portuguese and Spanish, and in Spanish the nine
 * calculators and four presets that had no Spanish page, the money hub (which now lists them, the presets and the guides)
 * and the five money guides. The English pages and the pages of the F6 are left as they are (PENDENCIAS F7 f-11).
 */
export function newVoicePages(): VoicePage[] {
  const calculators = CALC_PAGE_IDS.filter((id) => !F6_ES_CALC_IDS.includes(id));
  return [...pagesOf([QR_ID], ['pt', 'es']), ...pagesOf([...calculators, MONEY_HUB_ID, ...GUIDE_IDS], ['es'])];
}

/**
 * The voice problems of one page, in its language: the visible text (visibleText puts a space at every element boundary,
 * so "…AES-256.<a>Unlock PDF</a><p>Remove…" reads "Unlock PDF Remove") and, unless `props` is false, the `t` and `texts`
 * of every data-props of the page (the island's texts, which the browser shows as the person works).
 */
export function pageVoiceProblems(html: string, lang: Lang, props = true): string[] {
  const islands = props
    ? parse(html)
        .querySelectorAll('[data-props]')
        .flatMap((element) => {
          const parsed = JSON.parse(element.getAttribute('data-props') ?? '{}') as { t?: unknown; texts?: unknown };
          return [checkVoice(parsed.t, 'data-props.t', lang), checkVoice(parsed.texts, 'data-props.texts', lang)].flat();
        })
    : [];
  return [...checkVoice(visibleText(html), 'texto visível', lang), ...islands];
}
