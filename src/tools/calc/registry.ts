// The money calculators, their presets and the guides (PLANO "Catálogo por fase", F4; DECISOES § 110): the
// page of each one, its icon, its place in the hub, the next-step chips, the related grid and the file
// name of its exports. Pages, the hub, the home, the footer, the search, the gates and the tests read
// this list, so a calculator is declared once. Plain data only: the engines live in src/calc/ and the
// behaviour of each page in src/tools/calc/defs/.
import type { IconName } from '../../icons/svg.ts';
import type { Lang } from '../../i18n/routes.ts';

/** The 14 calculators, in hub order: the credit ones first, then the educational ones (prompt F4, decision 1). */
export const CALC_TOOL_IDS = [
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
] as const;
export type CalcToolId = (typeof CALC_TOOL_IDS)[number];

/** Presets with `entra` in data/keywords.csv: pages of a parent calculator with their own question. */
export const CALC_PRESET_IDS = [
  'mortgage-calculator-extra-payments',
  'mortgage-calculator-biweekly',
  'mortgage-calculator-15-vs-30-year',
  'loan-amortization-calculator-balloon-payment',
] as const;
export type CalcPresetId = (typeof CALC_PRESET_IDS)[number];

export type CalcPageId = CalcToolId | CalcPresetId;
export const CALC_PAGE_IDS: readonly CalcPageId[] = [...CALC_TOOL_IDS, ...CALC_PRESET_IDS];

export const GUIDE_IDS = [
  'guides-15-vs-30-year-mortgage',
  'guides-debt-snowball-vs-avalanche',
  'guides-extra-mortgage-payments',
  'guides-refinance-break-even',
  'guides-rent-vs-buy-break-even',
] as const;
export type GuideId = (typeof GUIDE_IDS)[number];

export const MONEY_HUB_ID = 'money-calculators';

/**
 * The five calculators that also exist in Spanish (prompt F6, decision 6): the same definition, engine, fixtures
 * and example as the English page, for the Hispanic audience of the US, with a pair in hreflang.
 */
export const ES_CALC_IDS = [
  'mortgage-calculator',
  'personal-loan-calculator',
  'credit-card-payoff-calculator',
  'debt-payoff-calculator',
  'compound-interest-calculator',
] as const satisfies readonly CalcToolId[];
export type EsCalcId = (typeof ES_CALC_IDS)[number];

/**
 * The eight calculators adapted to Brazil (prompt F6, decision 5): pages of their own, only in Portuguese, with no
 * pair in hreflang. They sit beside the English registry, so nothing that reads CALC_PAGES (every one of which has
 * an English page) takes in a page without English.
 */
export const BR_CALC_IDS = [
  'br-sac-price',
  'br-vehicle-loan',
  'br-personal-loan',
  'br-early-payoff',
  'br-credit-card',
  'br-debt-payoff',
  'br-compound-interest',
  'br-rent-or-buy',
] as const;
export type BrCalcId = (typeof BR_CALC_IDS)[number];
/** The Brazilian money hub /pt/calculadoras-financeiras/: a page of its own, not the English hub translated. */
export const BR_HUB_ID = 'br-money-calculators';

/** Any money calculator page: the English ones (with their Spanish versions) and the Brazilian ones. */
export type MoneyPageId = CalcPageId | BrCalcId;

/** A money page in a language other than English: its own path, export file name and links, all within that language. */
export interface CalcLangPage {
  path: string;
  /** Base name of the PDF and the CSV, in the language (docs/i18n). */
  file: string;
  next: readonly MoneyPageId[];
  related: readonly MoneyPageId[];
}

export interface CalcPageDef {
  id: CalcPageId;
  /** URL path, with the trailing slash. */
  path: string;
  /** The calculator a preset belongs to. */
  parent?: CalcToolId;
  icon: IconName;
  /** Its block in the hub: credit before educational. */
  group: 'credit' | 'educational';
  /** Next-step chips: 2 to 4 calculators, chosen by what the person just worked out. */
  next: readonly CalcPageId[];
  /** Related grid at the end of the page: up to 6. */
  related: readonly CalcPageId[];
  /** The guide that explains this calculator, linked from its page. */
  guide?: GuideId;
  /** Base name of the PDF and the CSV: fixed, never a number the person typed. */
  file: string;
  /** The Spanish page, for the five of ES_CALC_IDS. */
  es?: CalcLangPage;
}

const preset = (parent: CalcToolId, name: string): string => `/${parent}/${name}/`;

export const CALC_PAGES: Record<CalcPageId, CalcPageDef> = {
  'mortgage-calculator': {
    id: 'mortgage-calculator',
    path: '/mortgage-calculator/',
    icon: 'home',
    group: 'credit',
    next: ['home-affordability-calculator', 'mortgage-calculator-extra-payments', 'refinance-calculator'],
    related: ['mortgage-calculator-15-vs-30-year', 'mortgage-calculator-extra-payments', 'mortgage-calculator-biweekly', 'home-affordability-calculator', 'refinance-calculator', 'rent-vs-buy-calculator'],
    guide: 'guides-15-vs-30-year-mortgage',
    file: 'mortgage-schedule',
    es: {
      path: '/es/calculadora-de-hipoteca/',
      file: 'tabla-hipoteca',
      next: ['personal-loan-calculator', 'compound-interest-calculator'],
      related: ['personal-loan-calculator', 'credit-card-payoff-calculator', 'debt-payoff-calculator', 'compound-interest-calculator'],
    },
  },
  'personal-loan-calculator': {
    id: 'personal-loan-calculator',
    path: '/personal-loan-calculator/',
    icon: 'calculator',
    group: 'credit',
    next: ['debt-consolidation-calculator', 'loan-amortization-calculator'],
    related: ['debt-consolidation-calculator', 'auto-loan-calculator', 'loan-amortization-calculator', 'credit-card-payoff-calculator', 'debt-payoff-calculator', 'apr-to-apy-calculator'],
    file: 'personal-loan-schedule',
    es: {
      path: '/es/calculadora-de-prestamo-personal/',
      file: 'tabla-prestamo-personal',
      next: ['debt-payoff-calculator', 'credit-card-payoff-calculator'],
      related: ['debt-payoff-calculator', 'credit-card-payoff-calculator', 'mortgage-calculator', 'compound-interest-calculator'],
    },
  },
  'auto-loan-calculator': {
    id: 'auto-loan-calculator',
    path: '/auto-loan-calculator/',
    icon: 'calculator',
    group: 'credit',
    next: ['loan-amortization-calculator', 'personal-loan-calculator'],
    related: ['personal-loan-calculator', 'loan-amortization-calculator', 'loan-amortization-calculator-balloon-payment', 'debt-payoff-calculator', 'savings-goal-calculator', 'mortgage-calculator'],
    file: 'auto-loan-schedule',
  },
  'refinance-calculator': {
    id: 'refinance-calculator',
    path: '/refinance-calculator/',
    icon: 'convert',
    group: 'credit',
    next: ['mortgage-calculator-extra-payments', 'mortgage-calculator'],
    related: ['mortgage-calculator', 'mortgage-calculator-15-vs-30-year', 'mortgage-calculator-extra-payments', 'mortgage-calculator-biweekly', 'loan-amortization-calculator', 'home-affordability-calculator'],
    guide: 'guides-refinance-break-even',
    file: 'refinance-comparison',
  },
  'home-affordability-calculator': {
    id: 'home-affordability-calculator',
    path: '/home-affordability-calculator/',
    icon: 'home',
    group: 'credit',
    next: ['mortgage-calculator', 'rent-vs-buy-calculator'],
    related: ['mortgage-calculator', 'rent-vs-buy-calculator', 'mortgage-calculator-15-vs-30-year', 'savings-goal-calculator', 'refinance-calculator', 'mortgage-calculator-biweekly'],
    file: 'home-affordability',
  },
  'loan-amortization-calculator': {
    id: 'loan-amortization-calculator',
    path: '/loan-amortization-calculator/',
    icon: 'table',
    group: 'credit',
    next: ['loan-amortization-calculator-balloon-payment', 'mortgage-calculator-extra-payments'],
    related: ['loan-amortization-calculator-balloon-payment', 'mortgage-calculator', 'personal-loan-calculator', 'auto-loan-calculator', 'mortgage-calculator-extra-payments', 'simple-interest-calculator'],
    file: 'loan-amortization-schedule',
  },
  'credit-card-payoff-calculator': {
    id: 'credit-card-payoff-calculator',
    path: '/credit-card-payoff-calculator/',
    icon: 'calculator',
    group: 'credit',
    next: ['debt-payoff-calculator', 'debt-consolidation-calculator'],
    related: ['debt-payoff-calculator', 'debt-consolidation-calculator', 'personal-loan-calculator', 'apr-to-apy-calculator', 'savings-goal-calculator', 'simple-interest-calculator'],
    file: 'credit-card-payoff-schedule',
    es: {
      path: '/es/calculadora-de-tarjeta-de-credito/',
      file: 'plan-tarjeta-de-credito',
      next: ['debt-payoff-calculator', 'personal-loan-calculator'],
      related: ['debt-payoff-calculator', 'personal-loan-calculator', 'compound-interest-calculator', 'mortgage-calculator'],
    },
  },
  'debt-payoff-calculator': {
    id: 'debt-payoff-calculator',
    path: '/debt-payoff-calculator/',
    icon: 'sparkline',
    group: 'credit',
    next: ['debt-consolidation-calculator', 'credit-card-payoff-calculator'],
    related: ['credit-card-payoff-calculator', 'debt-consolidation-calculator', 'personal-loan-calculator', 'savings-goal-calculator', 'compound-interest-calculator', 'mortgage-calculator-extra-payments'],
    guide: 'guides-debt-snowball-vs-avalanche',
    file: 'debt-payoff-plan',
    es: {
      path: '/es/calculadora-de-deudas/',
      file: 'plan-de-deudas',
      next: ['credit-card-payoff-calculator', 'personal-loan-calculator'],
      related: ['credit-card-payoff-calculator', 'personal-loan-calculator', 'compound-interest-calculator', 'mortgage-calculator'],
    },
  },
  'debt-consolidation-calculator': {
    id: 'debt-consolidation-calculator',
    path: '/debt-consolidation-calculator/',
    icon: 'merge',
    group: 'credit',
    next: ['debt-payoff-calculator', 'personal-loan-calculator'],
    related: ['debt-payoff-calculator', 'credit-card-payoff-calculator', 'personal-loan-calculator', 'loan-amortization-calculator', 'apr-to-apy-calculator', 'savings-goal-calculator'],
    file: 'debt-consolidation-comparison',
  },
  'rent-vs-buy-calculator': {
    id: 'rent-vs-buy-calculator',
    path: '/rent-vs-buy-calculator/',
    icon: 'home',
    group: 'credit',
    next: ['home-affordability-calculator', 'mortgage-calculator'],
    related: ['home-affordability-calculator', 'mortgage-calculator', 'mortgage-calculator-15-vs-30-year', 'compound-interest-calculator', 'savings-goal-calculator', 'refinance-calculator'],
    guide: 'guides-rent-vs-buy-break-even',
    file: 'rent-vs-buy-comparison',
  },
  'compound-interest-calculator': {
    id: 'compound-interest-calculator',
    path: '/compound-interest-calculator/',
    icon: 'sparkline',
    group: 'educational',
    next: ['savings-goal-calculator', 'apr-to-apy-calculator'],
    related: ['savings-goal-calculator', 'apr-to-apy-calculator', 'simple-interest-calculator', 'rent-vs-buy-calculator', 'debt-payoff-calculator', 'credit-card-payoff-calculator'],
    file: 'compound-interest-table',
    es: {
      path: '/es/calculadora-de-interes-compuesto/',
      file: 'interes-compuesto',
      next: ['debt-payoff-calculator', 'mortgage-calculator'],
      related: ['debt-payoff-calculator', 'credit-card-payoff-calculator', 'personal-loan-calculator', 'mortgage-calculator'],
    },
  },
  'savings-goal-calculator': {
    id: 'savings-goal-calculator',
    path: '/savings-goal-calculator/',
    icon: 'sparkline',
    group: 'educational',
    next: ['compound-interest-calculator', 'apr-to-apy-calculator'],
    related: ['compound-interest-calculator', 'apr-to-apy-calculator', 'simple-interest-calculator', 'home-affordability-calculator', 'debt-payoff-calculator', 'rent-vs-buy-calculator'],
    file: 'savings-goal-plan',
  },
  'simple-interest-calculator': {
    id: 'simple-interest-calculator',
    path: '/simple-interest-calculator/',
    icon: 'calculator',
    group: 'educational',
    next: ['compound-interest-calculator', 'apr-to-apy-calculator'],
    related: ['compound-interest-calculator', 'apr-to-apy-calculator', 'savings-goal-calculator', 'loan-amortization-calculator', 'personal-loan-calculator', 'credit-card-payoff-calculator'],
    file: 'simple-interest',
  },
  'apr-to-apy-calculator': {
    id: 'apr-to-apy-calculator',
    path: '/apr-to-apy-calculator/',
    icon: 'convert',
    group: 'educational',
    next: ['compound-interest-calculator', 'savings-goal-calculator'],
    related: ['compound-interest-calculator', 'savings-goal-calculator', 'simple-interest-calculator', 'personal-loan-calculator', 'credit-card-payoff-calculator', 'loan-amortization-calculator'],
    file: 'apr-to-apy-table',
  },
  'mortgage-calculator-extra-payments': {
    id: 'mortgage-calculator-extra-payments',
    path: preset('mortgage-calculator', 'extra-payments'),
    parent: 'mortgage-calculator',
    icon: 'home',
    group: 'credit',
    next: ['mortgage-calculator-biweekly', 'refinance-calculator'],
    related: ['mortgage-calculator', 'mortgage-calculator-biweekly', 'mortgage-calculator-15-vs-30-year', 'refinance-calculator', 'loan-amortization-calculator', 'home-affordability-calculator'],
    guide: 'guides-extra-mortgage-payments',
    file: 'extra-payments-schedule',
  },
  'mortgage-calculator-biweekly': {
    id: 'mortgage-calculator-biweekly',
    path: preset('mortgage-calculator', 'biweekly'),
    parent: 'mortgage-calculator',
    icon: 'home',
    group: 'credit',
    next: ['mortgage-calculator-extra-payments', 'mortgage-calculator-15-vs-30-year'],
    related: ['mortgage-calculator', 'mortgage-calculator-extra-payments', 'mortgage-calculator-15-vs-30-year', 'refinance-calculator', 'loan-amortization-calculator', 'home-affordability-calculator'],
    file: 'biweekly-mortgage-schedule',
  },
  'mortgage-calculator-15-vs-30-year': {
    id: 'mortgage-calculator-15-vs-30-year',
    path: preset('mortgage-calculator', '15-vs-30-year'),
    parent: 'mortgage-calculator',
    icon: 'split',
    group: 'credit',
    next: ['mortgage-calculator', 'mortgage-calculator-extra-payments'],
    related: ['mortgage-calculator', 'mortgage-calculator-extra-payments', 'mortgage-calculator-biweekly', 'refinance-calculator', 'home-affordability-calculator', 'rent-vs-buy-calculator'],
    guide: 'guides-15-vs-30-year-mortgage',
    file: '15-vs-30-year-mortgage',
  },
  'loan-amortization-calculator-balloon-payment': {
    id: 'loan-amortization-calculator-balloon-payment',
    path: preset('loan-amortization-calculator', 'balloon-payment'),
    parent: 'loan-amortization-calculator',
    icon: 'table',
    group: 'credit',
    next: ['loan-amortization-calculator', 'refinance-calculator'],
    related: ['loan-amortization-calculator', 'mortgage-calculator', 'refinance-calculator', 'auto-loan-calculator', 'personal-loan-calculator', 'simple-interest-calculator'],
    file: 'balloon-loan-schedule',
  },
};

export interface GuideDef {
  id: GuideId;
  path: string;
  /** The calculator embedded in the guide, filled with the guide's example. */
  calc: CalcPageId;
  /** The calculators the guide links to at the end. */
  related: readonly CalcPageId[];
}

export const GUIDES: Record<GuideId, GuideDef> = {
  'guides-15-vs-30-year-mortgage': {
    id: 'guides-15-vs-30-year-mortgage',
    path: '/guides/15-vs-30-year-mortgage/',
    calc: 'mortgage-calculator-15-vs-30-year',
    related: ['mortgage-calculator', 'mortgage-calculator-extra-payments', 'refinance-calculator', 'home-affordability-calculator'],
  },
  'guides-debt-snowball-vs-avalanche': {
    id: 'guides-debt-snowball-vs-avalanche',
    path: '/guides/debt-snowball-vs-avalanche/',
    calc: 'debt-payoff-calculator',
    related: ['credit-card-payoff-calculator', 'debt-consolidation-calculator', 'personal-loan-calculator'],
  },
  'guides-extra-mortgage-payments': {
    id: 'guides-extra-mortgage-payments',
    path: '/guides/extra-mortgage-payments/',
    calc: 'mortgage-calculator-extra-payments',
    related: ['mortgage-calculator', 'mortgage-calculator-biweekly', 'mortgage-calculator-15-vs-30-year', 'refinance-calculator'],
  },
  'guides-refinance-break-even': {
    id: 'guides-refinance-break-even',
    path: '/guides/refinance-break-even/',
    calc: 'refinance-calculator',
    related: ['mortgage-calculator', 'mortgage-calculator-extra-payments', 'loan-amortization-calculator'],
  },
  'guides-rent-vs-buy-break-even': {
    id: 'guides-rent-vs-buy-break-even',
    path: '/guides/rent-vs-buy-break-even/',
    calc: 'rent-vs-buy-calculator',
    related: ['home-affordability-calculator', 'mortgage-calculator', 'compound-interest-calculator'],
  },
};

/** The five credit calculators the ficha never cuts: the home's money section and the footer's Money column list them. */
export const HOME_CALC_IDS: readonly CalcToolId[] = [
  'mortgage-calculator',
  'refinance-calculator',
  'auto-loan-calculator',
  'personal-loan-calculator',
  'home-affordability-calculator',
];

/** A Brazilian calculator page (prompt F6, decision 5): like CalcPageDef, with the links only among the Brazilian pages. */
export interface BrCalcPageDef {
  id: BrCalcId;
  path: string;
  /** The English calculator it was adapted from (never linked: the pages are not equivalents). */
  base: CalcToolId;
  icon: IconName;
  group: 'credit' | 'educational';
  next: readonly BrCalcId[];
  related: readonly BrCalcId[];
  file: string;
}

export const BR_CALC_PAGES: Record<BrCalcId, BrCalcPageDef> = {
  'br-sac-price': {
    id: 'br-sac-price',
    path: '/pt/simulador-sac-price/',
    base: 'mortgage-calculator',
    icon: 'home',
    group: 'credit',
    next: ['br-early-payoff', 'br-rent-or-buy'],
    related: ['br-early-payoff', 'br-rent-or-buy', 'br-vehicle-loan', 'br-personal-loan', 'br-compound-interest'],
    file: 'simulacao-sac-price',
  },
  'br-vehicle-loan': {
    id: 'br-vehicle-loan',
    path: '/pt/simulador-financiamento-veiculo/',
    base: 'auto-loan-calculator',
    icon: 'calculator',
    group: 'credit',
    next: ['br-personal-loan', 'br-early-payoff'],
    related: ['br-personal-loan', 'br-early-payoff', 'br-sac-price', 'br-debt-payoff', 'br-compound-interest'],
    file: 'financiamento-veiculo',
  },
  'br-personal-loan': {
    id: 'br-personal-loan',
    path: '/pt/simulador-emprestimo/',
    base: 'personal-loan-calculator',
    icon: 'calculator',
    group: 'credit',
    next: ['br-debt-payoff', 'br-early-payoff'],
    related: ['br-debt-payoff', 'br-early-payoff', 'br-vehicle-loan', 'br-credit-card', 'br-compound-interest'],
    file: 'simulacao-emprestimo',
  },
  'br-early-payoff': {
    id: 'br-early-payoff',
    path: '/pt/amortizacao-antecipada/',
    base: 'loan-amortization-calculator',
    icon: 'table',
    group: 'credit',
    next: ['br-sac-price', 'br-personal-loan'],
    related: ['br-sac-price', 'br-vehicle-loan', 'br-personal-loan', 'br-debt-payoff', 'br-compound-interest'],
    file: 'amortizacao-antecipada',
  },
  'br-credit-card': {
    id: 'br-credit-card',
    path: '/pt/calculadora-cartao-de-credito/',
    base: 'credit-card-payoff-calculator',
    icon: 'calculator',
    group: 'credit',
    next: ['br-debt-payoff', 'br-personal-loan'],
    related: ['br-debt-payoff', 'br-personal-loan', 'br-early-payoff', 'br-compound-interest'],
    file: 'cartao-de-credito',
  },
  'br-debt-payoff': {
    id: 'br-debt-payoff',
    path: '/pt/calculadora-de-dividas/',
    base: 'debt-payoff-calculator',
    icon: 'sparkline',
    group: 'credit',
    next: ['br-credit-card', 'br-personal-loan'],
    related: ['br-credit-card', 'br-personal-loan', 'br-early-payoff', 'br-compound-interest'],
    file: 'plano-de-dividas',
  },
  'br-compound-interest': {
    id: 'br-compound-interest',
    path: '/pt/calculadora-juros-compostos/',
    base: 'compound-interest-calculator',
    icon: 'sparkline',
    group: 'educational',
    next: ['br-rent-or-buy', 'br-debt-payoff'],
    related: ['br-rent-or-buy', 'br-debt-payoff', 'br-early-payoff', 'br-sac-price'],
    file: 'juros-compostos',
  },
  'br-rent-or-buy': {
    id: 'br-rent-or-buy',
    path: '/pt/alugar-ou-comprar/',
    base: 'rent-vs-buy-calculator',
    icon: 'home',
    group: 'educational',
    next: ['br-sac-price', 'br-compound-interest'],
    related: ['br-sac-price', 'br-compound-interest', 'br-early-payoff', 'br-vehicle-loan'],
    file: 'alugar-ou-comprar',
  },
};

/** The calculators the home's money section and the footer's money column list, per language. */
export const HOME_MONEY_IDS: Record<Lang, readonly MoneyPageId[]> = {
  en: HOME_CALC_IDS,
  pt: ['br-sac-price', 'br-vehicle-loan', 'br-personal-loan', 'br-early-payoff', 'br-credit-card'],
  es: ES_CALC_IDS,
};

/** The calculators of each language's money hub, in hub order (credit first, then educational). */
export const HUB_MONEY_IDS: Record<Lang, readonly MoneyPageId[]> = {
  en: CALC_TOOL_IDS,
  pt: BR_CALC_IDS,
  es: ES_CALC_IDS,
};

/** The page of a money calculator in one language, or null where it does not exist (prompt F6, decision 2). */
export interface MoneyPage {
  id: MoneyPageId;
  path: string;
  file: string;
  icon: IconName;
  group: 'credit' | 'educational';
  next: readonly MoneyPageId[];
  related: readonly MoneyPageId[];
  parent?: CalcToolId;
  guide?: GuideId;
}

export function moneyPage(id: MoneyPageId, lang: Lang): MoneyPage | null {
  if (isBrCalc(id)) {
    const def = BR_CALC_PAGES[id];
    return lang === 'pt' ? { id, path: def.path, file: def.file, icon: def.icon, group: def.group, next: def.next, related: def.related } : null;
  }
  const def = CALC_PAGES[id];
  if (lang === 'en') return def;
  if (lang === 'es' && def.es) return { id, icon: def.icon, group: def.group, ...def.es };
  return null;
}

export function isBrCalc(id: string): id is BrCalcId {
  return Object.hasOwn(BR_CALC_PAGES, id);
}

/** Any money calculator page, English (with its Spanish version) or Brazilian. */
export function isMoneyCalc(id: string): id is MoneyPageId {
  return isCalcPage(id) || isBrCalc(id);
}

/** Presets of a calculator, in catalogue order. */
export function calcPresetsOf(id: CalcToolId): CalcPresetId[] {
  return CALC_PRESET_IDS.filter((preset) => CALC_PAGES[preset].parent === id);
}

export function isCalcPage(id: string): id is CalcPageId {
  return Object.hasOwn(CALC_PAGES, id);
}

export function isGuide(id: string): id is GuideId {
  return Object.hasOwn(GUIDES, id);
}
