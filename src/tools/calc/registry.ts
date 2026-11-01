// The money calculators, their presets and the guides (PLANO "Catálogo por fase", F4; DECISOES § 110): the
// page of each one, its icon, its place in the hub, the next-step chips, the related grid and the file
// name of its exports. Pages, the hub, the home, the footer, the search, the gates and the tests read
// this list, so a calculator is declared once. Plain data only: the engines live in src/calc/ and the
// behaviour of each page in src/tools/calc/defs/.
import type { IconName } from '../../icons/svg.ts';

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
  },
  'personal-loan-calculator': {
    id: 'personal-loan-calculator',
    path: '/personal-loan-calculator/',
    icon: 'calculator',
    group: 'credit',
    next: ['debt-consolidation-calculator', 'loan-amortization-calculator'],
    related: ['debt-consolidation-calculator', 'auto-loan-calculator', 'loan-amortization-calculator', 'credit-card-payoff-calculator', 'debt-payoff-calculator', 'apr-to-apy-calculator'],
    file: 'personal-loan-schedule',
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
