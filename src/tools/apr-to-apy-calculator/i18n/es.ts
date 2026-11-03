// STUB-IDIOMAS: copy of the English text, replaced by the writer of the lot.
import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'APR to APY Calculator, and APY to APR',
  description: 'Turn a yearly rate (APR) into the APY it earns with yearly, quarterly, monthly or daily compounding, or turn an APY back into the APR, with two decimals.',
  h1: 'APR to APY calculator',
  lead: 'What a rate earns once compounding is counted, and back.',
  panel: {
    fields: {
      dir: { label: 'Turn', error: '' },
      r: { label: 'Rate', suffix: '%', error: 'Enter a rate from 0 to 100%.' },
      c: { label: 'Compounding', error: '' },
    },
    options: {
      dir: { 'apr-to-apy': 'APR into APY', 'apy-to-apr': 'APY into APR' },
      c: { '1': 'yearly', '2': 'twice a year', '4': 'quarterly', '12': 'monthly', '365': 'daily' },
    },
    view: {
      labelApy: 'APY',
      labelApr: 'APR',
      placardApy: 'APY',
      placardApr: 'APR',
      sentenceApy: 'A rate of {rate} compounded {how} earns {result} a year.',
      sentenceApr: 'An APY of {rate} comes from a rate of {result} compounded {how}.',
      compounding: 'Compounding',
      caption: 'The same rate with each compounding',
      scheduleHeading: 'Every compounding',
    },
    premises: [
      'The rate is a nominal yearly rate, compounded the number of times a year you choose; daily compounding uses 365 days.',
      'The money stays in for a whole year with nothing added or taken out.',
      'The result is rounded to two decimals, half up, as Regulation DD asks for the APY.',
    ],
  },
  howHeading: 'How to use the APR to APY calculator',
  howSteps: [
    'Choose whether to turn an APR into an APY or the other way round.',
    'Type the rate and pick how often it compounds.',
    'Read the result, and the table with every compounding.',
  ],
  worksHeading: 'How APR and APY are related',
  formulaHeading: 'The formula',
  formula: [
    'APY = (1 + APR ÷ n)^n − 1, where n is the number of times a year the rate compounds.',
    'Going back, APR = n × ((1 + APY)^(1 ÷ n) − 1). Both are shown as percents with two decimals.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, Regulation DD, Appendix A, annual percentage yield calculation', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/' },
    { label: 'Consumer Financial Protection Bureau, Regulation DD, § 1030.3, general disclosure requirements (rounding)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/3/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice. The account disclosure states the APY that applies to you.',
  faqHeading: 'Questions about APR and APY',
  faq: [
    {
      q: 'What is the difference between APR and APY?',
      a: 'The APR is the yearly rate before compounding. The APY is what the money earns in a year once interest is added on interest, so it is never lower than the APR.',
    },
    {
      q: 'Why do savings accounts show the APY?',
      a: 'Regulation DD asks banks to state the annual percentage yield on deposit accounts, so accounts that compound differently can be compared.',
    },
    {
      q: 'Is a loan APR the same thing?',
      a: 'A loan APR also counts fees and is worked out by another rule, Regulation Z. This calculator only turns a nominal rate into its yearly yield and back.',
    },
    {
      q: 'Why do the CFPB examples match this calculator?',
      a: 'The examples of Regulation DD, Appendix A, with rates compounded daily give the same APY to two decimals: 5.25% daily is 5.39%, for instance.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
