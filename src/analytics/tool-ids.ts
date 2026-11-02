// The closed list of pages an event may name in `tool` (DECISOES § 10, § 113 and § 151). Written out here, inside
// src/analytics/ (the shared island chunk), because a value import of the registries would pull their
// pages' code into every tool page. tests/unit/consent.test.ts keeps both lists equal to the registries
// (src/tools/image/registry.ts, src/tools/calc/registry.ts and src/tools/pdf/registry.ts).

export const IMAGE_EVENT_TOOLS = [
  'compress-image',
  'resize-image',
  'crop-image',
  'rotate-image',
  'heic-to-jpg',
  'webp-to-jpg',
  'png-to-jpg',
  'image-to-pdf',
  'compress-image-to-100kb',
  'compress-image-to-1mb',
  'resize-image-youtube-thumbnail',
] as const;

export const CALC_EVENT_TOOLS = [
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
  'mortgage-calculator-extra-payments',
  'mortgage-calculator-biweekly',
  'mortgage-calculator-15-vs-30-year',
  'loan-amortization-calculator-balloon-payment',
  // The calculators adapted to Brazil (F6).
  'br-sac-price',
  'br-vehicle-loan',
  'br-personal-loan',
  'br-early-payoff',
  'br-credit-card',
  'br-debt-payoff',
  'br-compound-interest',
  'br-rent-or-buy',
] as const;

export const PDF_EVENT_TOOLS = [
  'merge-pdf',
  'split-pdf',
  'pdf-to-jpg',
  'compress-pdf',
  'rotate-pdf',
  'delete-pdf-pages',
  'add-page-numbers-to-pdf',
  'sign-pdf',
  'protect-pdf',
  'unlock-pdf',
  'reorder-pdf-pages',
  'watermark-pdf',
] as const;

export const EVENT_TOOLS: readonly string[] = [...IMAGE_EVENT_TOOLS, ...CALC_EVENT_TOOLS, ...PDF_EVENT_TOOLS];
