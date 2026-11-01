// Build-time side of the money pages (server only: never import this from an island). It turns the
// registry, the texts and the engines into the plain data the pages and the island need: the island's
// data-props, the crumbs, the chips, the related grid, the presets table and the worked example, which
// the engine computes at build so every number on the page comes from it (prompt F4, decision 9).
import { fmt } from '../../i18n/format.ts';
import enCommon from '../../i18n/en/common.ts';
import { ICONS } from '../../icons/icons.ts';
import { AUTHOR } from '../../platform/site.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import type { Lang } from '../../i18n/routes.ts';
import { DEFS } from './defs/index.ts';
import { viewOf } from './store.ts';
import { inputRows } from './view.ts';
import shared from './i18n/en.ts';
import { CALC_PAGES, GUIDES, MONEY_HUB_ID, calcPresetsOf, type CalcPageId, type CalcToolId, type GuideId } from './registry.ts';
import type { CalcChip, CalcPageTexts, CalcPanelData, Values } from './types.ts';

/** The date this run reviewed every money page, and when they were first published (prompt F4, decision 9). */
export const REVIEWED = '2026-10-31';
export const FIRST_PUBLISHED = '2026-10-31';

const texts = import.meta.glob<CalcPageTexts>(['/src/tools/*-calculator/i18n/en.ts', '/src/tools/*-calculator/presets/*/i18n/en.ts'], {
  import: 'default',
  eager: true,
});

/** The text file of a calculator page (English only for now). */
export function calcTexts(id: CalcPageId): CalcPageTexts {
  const def = CALC_PAGES[id];
  const file = def.parent ? `/src/tools/${def.parent}/presets/${def.path.split('/').at(-2) ?? ''}/i18n/en.ts` : `/src/tools/${id}/i18n/en.ts`;
  const found = texts[file];
  if (!found) throw new Error(`no texts for ${id} (${file})`);
  return found;
}

export const SHARED = shared;

export function calcName(id: CalcPageId): string {
  return enCommon.calcs[id].name;
}

/** "October 31, 2026" (the page language is English for now). */
export function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[(month ?? 1) - 1]} ${day}, ${year}`;
}

export function chipsFor(id: CalcPageId): CalcChip[] {
  return CALC_PAGES[id].next.slice(0, 4).map((target) => ({ href: CALC_PAGES[target].path, name: calcName(target), target, icon: ICONS[CALC_PAGES[target].icon] }));
}

/** The plain data of the island, for a calculator page or a guide that embeds one. */
export function panelData(id: CalcPageId, lang: Lang, options: { initial?: Values; readLink?: boolean } = {}): CalcPanelData {
  const t = calcTexts(id);
  return {
    lang,
    page: id,
    name: calcName(id),
    t: shared.island,
    texts: t.panel,
    ...(options.initial ? { initial: options.initial } : {}),
    readLink: options.readLink ?? true,
    linkPath: CALC_PAGES[id].path,
    notice: t.disclaimer,
    file: CALC_PAGES[id].file,
    chips: chipsFor(id),
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

/** Home › Money calculators › (parent ›) calculator. */
export function crumbsFor(id: CalcPageId, lang: Lang): Crumb[] {
  const def = CALC_PAGES[id];
  const crumbs: Crumb[] = [
    { name: enCommon.breadcrumb.home, path: homePath(lang) },
    { name: enCommon.moneyCalculators, path: `/${MONEY_HUB_ID}/` },
  ];
  if (def.parent) crumbs.push({ name: calcName(def.parent), path: CALC_PAGES[def.parent].path });
  crumbs.push({ name: calcTexts(id).h1, path: def.path });
  return crumbs;
}

export interface MoneyCard {
  href: string;
  name: string;
  description: string;
  icon: (typeof CALC_PAGES)[CalcPageId]['icon'];
}

export function cardOf(id: CalcPageId): MoneyCard {
  return { href: CALC_PAGES[id].path, name: calcName(id), description: enCommon.calcs[id].description, icon: CALC_PAGES[id].icon };
}

export function relatedFor(id: CalcPageId): MoneyCard[] {
  return CALC_PAGES[id].related.slice(0, 6).map(cardOf);
}

/** The presets of a calculator, for the table on its page. */
export function presetRows(id: CalcPageId): { href: string; name: string; description: string }[] {
  if (CALC_PAGES[id].parent) return [];
  return calcPresetsOf(id as CalcToolId).map((preset) => ({ href: CALC_PAGES[preset].path, name: calcName(preset), description: enCommon.calcs[preset].description }));
}

export function guideOf(id: CalcPageId): { href: string; title: string } | null {
  const guide = CALC_PAGES[id].guide;
  return guide ? { href: GUIDES[guide].path, title: enCommon.guides[guide].name } : null;
}

/** The worked example: what the example values put in and what the engine gives back, as the page shows them. */
export function workedExample(id: CalcPageId, lang: Lang, values?: Values): { inputs: [string, string][]; results: [string, string][]; sentence: string } {
  const data = panelData(id, lang, values ? { initial: values } : {});
  const def = DEFS[id];
  const start = values ?? def.initial;
  const view = viewOf(def, data, start);
  const sentence = view.problem ?? view.hero.sentence.map((part) => (typeof part === 'string' ? part : part.b)).join('');
  return { inputs: inputRows(def.fields, start, data), results: view.summary, sentence };
}

export function reviewedLine(): { reviewed: string; first: string } {
  return {
    reviewed: fmt(shared.page.reviewed, { name: AUTHOR.name, date: longDate(REVIEWED) }),
    first: fmt(shared.page.firstPublished, { date: longDate(FIRST_PUBLISHED) }),
  };
}

export type { GuideId };
