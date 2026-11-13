import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Simple Interest Calculator for Years, Months or Days',
  description: 'Work out simple interest on a principal for years, months or days with a 365-day year: the interest, the total to repay or collect, and a table by year.',
  h1: 'Simple interest calculator',
  lead: 'Interest on a principal for years, months or days, without compounding.',
  panel: {
    fields: {
      pr: { label: 'Principal', prefix: '$', error: 'Enter a principal from $0.01 to $100,000,000.' },
      r: { label: 'Yearly rate', suffix: '%', error: 'Enter a rate from 0 to 100%.' },
      u: { label: 'Time in', error: '' },
      ty: { label: 'Time', suffix: 'years', error: 'Enter from 0 to 100 years.' },
      tmo: { label: 'Time', suffix: 'months', error: 'Enter from 0 to 1,200 months.' },
      td: { label: 'Time', suffix: 'days', error: 'Enter from 0 to 36,500 days.' },
    },
    options: { u: { years: 'years', months: 'months', days: 'days' } },
    view: {
      label: 'Interest',
      placard: 'interest',
      sentence: '{principal} at {rate} for {time} earns {interest} of simple interest, for a total of {total}.',
      principal: 'Principal',
      interest: 'Interest',
      total: 'Total',
      after: 'After, in {unit}',
      caption: 'Simple interest at the end of each year of the period',
      scheduleHeading: 'Interest for each year',
    },
    premises: [
      'Interest is charged on the principal only, never on earlier interest.',
      'A year has 365 days; a month is a twelfth of a year.',
      'The interest is rounded to the cent, half up, once, at the end.',
    ],
  },
  howHeading: 'How to use the simple interest calculator',
  howSteps: [
    'Enter the principal and the yearly rate.',
    'Choose years, months or days and type how long.',
    'Read the interest and the total, and save the table as a PDF or a CSV.',
  ],
  worksHeading: 'How simple interest is worked out',
  formulaHeading: 'The formula',
  formula: [
    'I = P × r × t, where P is the principal, r the yearly rate and t the time in years: months ÷ 12, or days ÷ 365. The total is P + I.',
    'The interest grows by the same amount every year.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [{ label: 'Consumer Financial Protection Bureau, "How does compound interest work?"', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-compound-interest-work-en-1683/' }],
  disclaimer: 'This calculator is an educational tool, not financial advice. A contract can count days differently, for example with a 360-day year.',
  faqHeading: 'Questions about simple interest',
  faq: [
    {
      q: 'What is the difference between simple and compound interest?',
      a: 'Compound interest is also charged on the interest already added, so over time it grows faster than simple interest.',
    },
    {
      q: 'Which loans use simple interest?',
      a: 'Many short loans and some car loans charge interest on what you owe, without adding unpaid interest to the balance. Check how your contract counts it.',
    },
    {
      q: 'Does it work for a loan I repay each month?',
      a: 'No. Here the whole principal stays out for the whole time. A loan you repay each month is charged interest on a falling balance, which the loan amortization calculator works out.',
    },
    {
      q: 'Can the time be a fraction of a year?',
      a: 'Yes. Eighteen months, for example, counts as a year and a half.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
