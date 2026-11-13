import type { CalcPageTexts, CalcPanelTexts } from '../../calc/types.ts';

/** The fields and result texts of a home loan, shared with the mortgage presets. */
export const homePanel: Omit<CalcPanelTexts, 'view' | 'premises'> = {
  fields: {
    p: { label: 'Home price', prefix: '$', error: 'Enter a home price from $10,000 to $20,000,000.' },
    d: { label: 'Down payment', prefix: '$', error: 'Enter a down payment from $0 to $20,000,000.', over: "Can't be more than the home price." },
    dp: { label: 'Down payment', error: 'Enter a down payment from 0 to 100% of the price.' },
    r: { label: 'Rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
    t: { label: 'Loan term', suffix: 'years', error: 'Enter a term from 1 to 40 years.' },
    tx: { label: 'Property tax per year', prefix: '$', error: 'Enter a property tax from $0 to $1,000,000.' },
    in: { label: 'Home insurance per year', prefix: '$', error: 'Enter an insurance cost from $0 to $100,000.' },
    pmi: { label: 'PMI per month', prefix: '$', error: 'Enter PMI from $0 to $10,000.', help: 'Private mortgage insurance, usually asked with less than 20% down.' },
    hoa: { label: 'HOA dues per month', prefix: '$', error: 'Enter HOA dues from $0 to $10,000.' },
  },
  moreHeading: 'Taxes, insurance and fees',
};

/** Assumptions of every home loan account on the site. */
export const homePremises = [
  'The rate stays the same for the whole term: a fixed-rate loan.',
  'Interest is charged once a month at the yearly rate divided by 12, on the balance, and rounded to the cent.',
  'Property tax and insurance stay at the yearly amounts you enter. In real life they can change every year.',
  "PMI and HOA dues stay at the monthly amounts you enter. Here PMI doesn't stop on its own; on most loans it can end once the balance falls to 78% to 80% of the home's original value.",
  'No closing costs, points or lender fees are included.',
];

export default {
  title: 'Mortgage Calculator with Taxes, Insurance and PMI',
  description: 'Work out your monthly mortgage payment with property tax, insurance, PMI and HOA, the total interest and the full schedule. Free, private, no sign-up.',
  h1: 'Mortgage calculator',
  lead: 'What your monthly payment will be, with taxes, insurance and fees.',
  panel: {
    ...homePanel,
    view: {
      label: 'Monthly payment',
      unit: '/mo',
      placard: 'per month',
      sentence: "Over {years} at {rate} you'll pay {total} on the loan, of which {interest} is interest.",
      extras: 'Taxes, insurance and fees add {extras} a month.',
      moreMeta: '{extras} a month in your payment',
      scheduleMeta: '{n} payments, by loan year',
      noLoan: 'With no loan to repay, you pay {extras} a month in taxes, insurance and fees.',
      principal: 'Principal',
      interest: 'Interest',
      caption: 'Payment schedule of the loan, by loan year',
      pi: 'Principal and interest',
      taxMonth: 'Property tax per month',
      insuranceMonth: 'Insurance per month',
      pmiHoa: 'PMI and HOA per month',
      loan: 'Loan amount',
      paid: 'Total of loan payments',
      count: 'Number of payments',
      payments: '{n} payments',
    },
    premises: homePremises,
  },
  howHeading: 'How to use the mortgage calculator',
  howSteps: [
    'Enter the home price and your down payment, in dollars or as a percent of the price.',
    'Type the interest rate your lender quoted and the loan term in years.',
    'Open "Taxes, insurance and fees" and add the yearly property tax and insurance, and any PMI or HOA dues, to see the whole monthly payment.',
    'Open the schedule to see every payment, or save it as a PDF or a CSV.',
  ],
  worksHeading: 'How the mortgage payment is worked out',
  formulaHeading: 'The formula',
  formula: [
    'The principal and interest payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). P is the loan (the price minus the down payment), r is the monthly rate (the yearly rate divided by 12) and n is the number of monthly payments.',
    'Each month the interest is the balance times r, rounded to the cent, and the rest of the payment lowers the balance.',
    'The monthly total adds one twelfth of the yearly property tax and insurance, plus the PMI and HOA dues.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "What is PITI?"', href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-piti-en-152/' },
    {
      label: 'Consumer Financial Protection Bureau, "When can I remove private mortgage insurance (PMI) from my loan?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/',
    },
    {
      label: 'Consumer Financial Protection Bureau, Regulation Z, Appendix H, Loan Estimate sample H-24(B)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/h/',
    },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice and not a loan offer. Your lender sets your rate, your costs and your payment.',
  faqHeading: 'Questions about mortgage payments',
  faq: [
    {
      q: 'What is PITI?',
      a: 'Principal, interest, taxes and insurance: lenders often call those four parts of the payment PITI, and collect the taxes and insurance through an escrow account.',
    },
    {
      q: 'Why is the last payment a little different?',
      a: 'After hundreds of payments, the cents gained or lost in rounding add up, so the last payment is whatever closes the balance exactly and can differ from the others by a few cents.',
    },
    {
      q: 'Where does the interest rate come from?',
      a: 'The starting value is an example, not a quote. Use the rate on your Loan Estimate, or try a few rates to see how much each point changes the payment.',
    },
    {
      q: 'How do I see the payment once PMI is gone?',
      a: 'Set PMI per month to zero. The monthly payment then shows what you would pay without it, with the same principal and interest, taxes, insurance and HOA dues.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
  presets: { heading: 'More mortgage calculators', caption: 'Mortgage calculators that each answer one question', head: ['Calculator', 'What it answers'] },
} satisfies CalcPageTexts;
