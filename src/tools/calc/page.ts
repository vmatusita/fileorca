// Build-time side of the money pages (server only: never import this from an island). It turns the
// registry, the texts and the engines into the plain data the pages and the island need, in the language of the
// page: the island's data-props, the crumbs, the chips, the related grid, the presets table and the worked example,
// which the engine computes at build so every number on the page comes from it (prompt F4, decision 9). Links go only
// to pages of the same language (DECISOES § 6; prompt F6, decisions 5 and 6).
import { fmt } from '../../i18n/format.ts';
import { longDate as writtenDate } from '../../i18n/dates.ts';
import { TEXTS } from '../../i18n/texts.ts';
import { ICONS } from '../../icons/icons.ts';
import { AUTHOR } from '../../platform/site.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import { moneyHubId, pagePath, type Lang } from '../../i18n/routes.ts';
import { DEFS } from './defs/index.ts';
import { viewOf } from './store.ts';
import { inputRows } from './view.ts';
import enShared, { type CalcPageShared } from './i18n/en.ts';
import ptShared from './i18n/pt.ts';
import esShared from './i18n/es.ts';
import {
  CALC_PAGES,
  LIFE_HUB_ROUTE,
  calcAreaOf,
  calcPresetsOf,
  isCalcPage,
  isGuide,
  moneyPage,
  type AnyCalcId,
  type CalcArea,
  type CalcPageId,
  type CalcToolId,
  type GuideId,
  type MoneyPage,
} from './registry.ts';
import type { CalcChip, CalcPageTexts, CalcPanelData, CalcSharedTexts, Values } from './types.ts';

/** The day this run reviewed every English money page, and when they were first published (prompt F4, decision 9). */
export const REVIEWED = '2026-10-31';
export const FIRST_PUBLISHED = '2026-10-31';

/**
 * Per language: the day the pages were reviewed, first published, and the day their sources were read (the Spanish and
 * Brazilian pages were born in the F6, the day in Brasília, DECISOES § 207).
 */
export const REVIEWED_ON: Record<Lang, string> = { en: REVIEWED, pt: '2026-11-02', es: '2026-11-02' };
export const FIRST_PUBLISHED_ON: Record<Lang, string> = { en: FIRST_PUBLISHED, pt: '2026-11-02', es: '2026-11-02' };
export const SOURCES_READ_ON: Record<Lang, string> = { en: REVIEWED, pt: '2026-11-01', es: '2026-11-01' };

/** The five Spanish calculators of the F6, which keep their days; every other Spanish money page was born in the languages adjustment. */
const ES_OF_F6: readonly AnyCalcId[] = ['mortgage-calculator', 'personal-loan-calculator', 'credit-card-payoff-calculator', 'debt-payoff-calculator', 'compound-interest-calculator'];

/**
 * The day in Brasília of the languages adjustment (DECISOES § 207 and § 223): the Spanish calculators, presets and guides it
 * wrote were reviewed, first published and had their sources read on it, and the Spanish hub, whose text it rewrote, was
 * reviewed on it.
 */
export const IDIOMAS_DAY = '2026-11-03';

/**
 * The home and health pages (English only) were reviewed, first published and had their sources read in the F7, on the
 * day in Brasília the run wrote them (DECISOES § 207 and § 264).
 */
export const LIFE_REVIEWED = '2026-11-02';
export const LIFE_FIRST_PUBLISHED = '2026-11-02';
export const LIFE_SOURCES_READ_ON = '2026-11-02';

/** The days a calculator page shows: reviewed, first published and the day its sources were read. */
export function datesOf(id: AnyCalcId | CalcArea | GuideId, lang: Lang): { reviewed: string; first: string; read: string } {
  // A money guide: the English ones of the F4, the Spanish ones of the languages adjustment.
  if (isGuide(id)) return lang === 'en' ? { reviewed: REVIEWED, first: FIRST_PUBLISHED, read: REVIEWED } : { reviewed: IDIOMAS_DAY, first: IDIOMAS_DAY, read: IDIOMAS_DAY };
  const area = id === 'money' || id === 'house' || id === 'health' ? id : calcAreaOf(id);
  if (area !== 'money') return { reviewed: LIFE_REVIEWED, first: LIFE_FIRST_PUBLISHED, read: LIFE_SOURCES_READ_ON };
  if (lang === 'es' && id !== 'money' && !(ES_OF_F6 as readonly string[]).includes(id)) return { reviewed: IDIOMAS_DAY, first: IDIOMAS_DAY, read: IDIOMAS_DAY };
  if (lang === 'es' && id === 'money') return { reviewed: IDIOMAS_DAY, first: FIRST_PUBLISHED_ON.es, read: SOURCES_READ_ON.es };
  return { reviewed: REVIEWED_ON[lang], first: FIRST_PUBLISHED_ON[lang], read: SOURCES_READ_ON[lang] };
}

const texts = import.meta.glob<CalcPageTexts>(
  ['/src/tools/*-calculator/i18n/*.ts', '/src/tools/*-calculator/presets/*/i18n/*.ts', '/src/tools/br-*/i18n/pt.ts'],
  { import: 'default', eager: true },
);

/** The text file of a calculator page in a language. */
export function calcTexts(id: AnyCalcId, lang: Lang = 'en'): CalcPageTexts {
  const def = isCalcPage(id) ? CALC_PAGES[id] : null;
  const file = def?.parent ? `/src/tools/${def.parent}/presets/${def.path.split('/').at(-2) ?? ''}/i18n/${lang}.ts` : `/src/tools/${id}/i18n/${lang}.ts`;
  const found = texts[file];
  if (!found) throw new Error(`no texts for ${id} in ${lang} (${file})`);
  return found;
}

/** What every calculator page of a language shares: the island's texts and the page's. */
export interface SharedTexts {
  island: CalcSharedTexts;
  page: CalcPageShared;
}

export const SHARED_BY_LANG: Record<Lang, SharedTexts> = { en: enShared, pt: ptShared, es: esShared };
/** The English shared texts. */
export const SHARED = enShared;

/** The page of a calculator in a language; throws where it does not exist (it must not be linked there). */
function pageIn(id: AnyCalcId, lang: Lang): MoneyPage {
  const page = moneyPage(id, lang);
  if (!page) throw new Error(`money page ${id} has no ${lang} version`);
  return page;
}

export function calcName(id: AnyCalcId, lang: Lang = 'en'): string {
  const blurb = TEXTS[lang].common.calcs[id];
  if (!blurb) throw new Error(`no ${lang} card for ${id}`);
  return blurb.name;
}

/** "October 31, 2026", "1 de novembro de 2026". */
export function longDate(iso: string, lang: Lang = 'en'): string {
  return writtenDate(iso, lang);
}

/** The pages a list may link to: the ones that exist in the language (DECISOES § 6). */
const existing = (ids: readonly AnyCalcId[], lang: Lang): AnyCalcId[] => ids.filter((id) => moneyPage(id, lang) && pagePath(id, lang));

export function chipsFor(id: AnyCalcId, lang: Lang = 'en'): CalcChip[] {
  return existing(pageIn(id, lang).next, lang)
    .slice(0, 4)
    .map((target) => {
      const page = pageIn(target, lang);
      return { href: page.path, name: calcName(target, lang), target, icon: ICONS[page.icon] };
    });
}

/** The plain data of the island, for a calculator page or a guide that embeds one. */
export function panelData(id: AnyCalcId, lang: Lang, options: { initial?: Values; readLink?: boolean } = {}): CalcPanelData {
  const t = calcTexts(id, lang);
  const page = pageIn(id, lang);
  return {
    lang,
    page: id,
    name: calcName(id, lang),
    t: SHARED_BY_LANG[lang].island,
    texts: t.panel,
    ...(options.initial ? { initial: options.initial } : {}),
    readLink: options.readLink ?? true,
    linkPath: page.path,
    notice: t.disclaimer,
    file: page.file,
    chips: chipsFor(id, lang),
    // The Oli never cheers a health result (F7, decision 5); the home and health pages wear the violet category.
    cheer: calcAreaOf(id) !== 'health',
    cat: calcAreaOf(id) === 'money' ? 'money' : 'home',
    icons: {
      pdf: ICONS.pdf,
      table: ICONS.table,
      link: ICONS.link,
      check: ICONS.check,
      info: ICONS.info,
      chevron: ICONS['chevron-right'],
      alert: ICONS.alert,
      trash: ICONS.trash,
      arrow: ICONS['arrow-right'],
    },
  };
}

/** The hub of a calculator page and its name: the money hub of the language, or the home or health hub (F7). */
export function hubOf(id: AnyCalcId, lang: Lang): { name: string; path: string } | null {
  const area = calcAreaOf(id);
  const common = TEXTS[lang].common;
  const path = pagePath(area === 'money' ? moneyHubId(lang) : LIFE_HUB_ROUTE[area], lang);
  const name = area === 'money' ? common.moneyCalculators : area === 'house' ? common.homeCalculators : common.healthCalculators;
  return path && name ? { name, path } : null;
}

/** Home › Money (or Home, or Health) calculators › (parent ›) calculator, in the language (the Brazilian hub in Portuguese). */
export function crumbsFor(id: AnyCalcId, lang: Lang): Crumb[] {
  const common = TEXTS[lang].common;
  const page = pageIn(id, lang);
  const hub = hubOf(id, lang);
  const crumbs: Crumb[] = [{ name: common.breadcrumb.home, path: homePath(lang) }];
  if (hub) crumbs.push(hub);
  if (page.parent) crumbs.push({ name: calcName(page.parent, lang), path: pageIn(page.parent, lang).path });
  crumbs.push({ name: calcTexts(id, lang).h1, path: page.path });
  return crumbs;
}

export interface MoneyCard {
  href: string;
  name: string;
  description: string;
  icon: MoneyPage['icon'];
}

export function cardOf(id: AnyCalcId, lang: Lang = 'en'): MoneyCard {
  const blurb = TEXTS[lang].common.calcs[id];
  if (!blurb) throw new Error(`no ${lang} card for ${id}`);
  const page = pageIn(id, lang);
  return { href: page.path, name: blurb.name, description: blurb.description, icon: page.icon };
}

export function relatedFor(id: AnyCalcId, lang: Lang = 'en'): MoneyCard[] {
  return existing(pageIn(id, lang).related, lang)
    .slice(0, 6)
    .map((target) => cardOf(target, lang));
}

/** The presets of a calculator, for the table on its page, where they exist in the language (English and Spanish). */
export function presetRows(id: AnyCalcId, lang: Lang = 'en'): { href: string; name: string; description: string }[] {
  if (!isCalcPage(id) || CALC_PAGES[id].parent) return [];
  const common = TEXTS[lang].common;
  return existing(calcPresetsOf(id as CalcToolId), lang).map((preset) => ({ href: pageIn(preset, lang).path, name: calcName(preset, lang), description: common.calcs[preset]?.description ?? '' }));
}

/** The worked example: what the example values put in and what the engine gives back, as the page shows them. */
export function workedExample(id: AnyCalcId, lang: Lang, values?: Values): { inputs: [string, string][]; results: [string, string][]; sentence: string } {
  const data = panelData(id, lang, values ? { initial: values } : {});
  const def = DEFS[id];
  const start = values ?? def.initial;
  const view = viewOf(def, data, start);
  const sentence = view.problem ?? view.hero.sentence.map((part) => (typeof part === 'string' ? part : part.b)).join('');
  return { inputs: inputRows(def.fields, start, data), results: view.summary, sentence };
}

export function reviewedLine(lang: Lang = 'en'): { reviewed: string; first: string } {
  const shared = SHARED_BY_LANG[lang].page;
  return {
    reviewed: fmt(shared.reviewed, { name: AUTHOR.name, date: longDate(REVIEWED_ON[lang], lang) }),
    first: fmt(shared.firstPublished, { date: longDate(FIRST_PUBLISHED_ON[lang], lang) }),
  };
}

export type { CalcPageId, GuideId };
