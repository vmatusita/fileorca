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
import { CALC_PAGES, GUIDES, calcPresetsOf, isCalcPage, moneyPage, type CalcPageId, type CalcToolId, type GuideId, type MoneyPage, type MoneyPageId } from './registry.ts';
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

const texts = import.meta.glob<CalcPageTexts>(
  ['/src/tools/*-calculator/i18n/*.ts', '/src/tools/*-calculator/presets/*/i18n/*.ts', '/src/tools/br-*/i18n/pt.ts'],
  { import: 'default', eager: true },
);

/** The text file of a calculator page in a language. */
export function calcTexts(id: MoneyPageId, lang: Lang = 'en'): CalcPageTexts {
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
/** The English shared texts (the guides, which exist only in English). */
export const SHARED = enShared;

/** The page of a money calculator in a language; throws where it does not exist (it must not be linked there). */
function pageIn(id: MoneyPageId, lang: Lang): MoneyPage {
  const page = moneyPage(id, lang);
  if (!page) throw new Error(`money page ${id} has no ${lang} version`);
  return page;
}

export function calcName(id: MoneyPageId, lang: Lang = 'en'): string {
  const blurb = TEXTS[lang].common.calcs[id];
  if (!blurb) throw new Error(`no ${lang} card for ${id}`);
  return blurb.name;
}

/** "October 31, 2026", "1 de novembro de 2026". */
export function longDate(iso: string, lang: Lang = 'en'): string {
  return writtenDate(iso, lang);
}

/** The pages a list may link to: the ones that exist in the language (DECISOES § 6). */
const existing = (ids: readonly MoneyPageId[], lang: Lang): MoneyPageId[] => ids.filter((id) => moneyPage(id, lang) && pagePath(id, lang));

export function chipsFor(id: MoneyPageId, lang: Lang = 'en'): CalcChip[] {
  return existing(pageIn(id, lang).next, lang)
    .slice(0, 4)
    .map((target) => {
      const page = pageIn(target, lang);
      return { href: page.path, name: calcName(target, lang), target, icon: ICONS[page.icon] };
    });
}

/** The plain data of the island, for a calculator page or a guide that embeds one. */
export function panelData(id: MoneyPageId, lang: Lang, options: { initial?: Values; readLink?: boolean } = {}): CalcPanelData {
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

/** Home › Money calculators › (parent ›) calculator, in the language (the Brazilian hub in Portuguese). */
export function crumbsFor(id: MoneyPageId, lang: Lang): Crumb[] {
  const common = TEXTS[lang].common;
  const page = pageIn(id, lang);
  const hub = pagePath(moneyHubId(lang), lang);
  const crumbs: Crumb[] = [{ name: common.breadcrumb.home, path: homePath(lang) }];
  if (hub) crumbs.push({ name: common.moneyCalculators, path: hub });
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

export function cardOf(id: MoneyPageId, lang: Lang = 'en'): MoneyCard {
  const blurb = TEXTS[lang].common.calcs[id];
  if (!blurb) throw new Error(`no ${lang} card for ${id}`);
  const page = pageIn(id, lang);
  return { href: page.path, name: blurb.name, description: blurb.description, icon: page.icon };
}

export function relatedFor(id: MoneyPageId, lang: Lang = 'en'): MoneyCard[] {
  return existing(pageIn(id, lang).related, lang)
    .slice(0, 6)
    .map((target) => cardOf(target, lang));
}

/** The presets of a calculator, for the table on its page (English only: the presets exist only there). */
export function presetRows(id: MoneyPageId, lang: Lang = 'en'): { href: string; name: string; description: string }[] {
  if (lang !== 'en' || !isCalcPage(id) || CALC_PAGES[id].parent) return [];
  const common = TEXTS.en.common;
  return calcPresetsOf(id as CalcToolId).map((preset) => ({ href: CALC_PAGES[preset].path, name: calcName(preset), description: common.calcs[preset]?.description ?? '' }));
}

/** The guide of a calculator (English only: the guides exist only there). */
export function guideOf(id: MoneyPageId, lang: Lang = 'en'): { href: string; title: string } | null {
  if (lang !== 'en' || !isCalcPage(id)) return null;
  const guide = CALC_PAGES[id].guide;
  const name = guide ? TEXTS.en.common.guides?.[guide]?.name : undefined;
  return guide && name ? { href: GUIDES[guide].path, title: name } : null;
}

/** The worked example: what the example values put in and what the engine gives back, as the page shows them. */
export function workedExample(id: MoneyPageId, lang: Lang, values?: Values): { inputs: [string, string][]; results: [string, string][]; sentence: string } {
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
