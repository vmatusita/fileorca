import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Loan Amortization Calculator with Full Schedule',
  description: 'See the full amortization schedule of a fixed-rate loan, payment by payment: principal, interest and balance, grouped by year, with PDF and CSV.',
  h1: 'Loan amortization calculator',
  lead: 'The whole schedule of a loan, payment by payment.',
  panel: {
    fields: {
      a: { label: 'Loan amount', prefix: '$', error: 'Enter an amount from $100 to $100,000,000.' },
      r: { label: 'Rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
      t: { label: 'Loan term', suffix: 'years', error: 'Enter a term from 1 to 50 years.' },
    },
    view: {
      label: 'Monthly payment',
      unit: '/mo',
      placard: 'per month',
      sentence: "Over {time} at {rate} you'll pay {total}, of which {interest} is interest.",
      principal: 'Principal',
      interest: 'Interest',
      caption: 'Amortization schedule, by loan year',
      paid: 'Total of payments',
      last: 'Last payment',
      count: 'Number of payments',
      payments: '{n} payments',
      scheduleHeading: 'Amortization schedule',
    },
    premises: [
      'A fixed rate and equal monthly payments for the whole term.',
      'Interest is charged once a month at the yearly rate divided by 12, on the balance, rounded to the cent; the rest of the payment lowers the balance.',
      'The last payment is whatever closes the balance, so it can differ from the others by a few cents.',
      'No fees, insurance or taxes are included.',
    ],
  },
  howHeading: 'How to use the amortization calculator',
  howSteps: [
    'Enter the loan amount, the yearly rate and the term in years.',
    'Read the monthly payment and how much of the total goes to interest.',
    'Open the schedule and any of its years.',
    'Save the schedule as a PDF or a CSV to open it in a spreadsheet.',
  ],
  worksHeading: 'How amortization works',
  formulaHeading: 'The formula',
  formula: [
    'The payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the amount, r is the yearly rate divided by 12 and n is the number of months.',
    'Each month, interest = balance × r, rounded to the cent; principal = M − interest; the new balance is the old one minus that principal.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "Mortgages key terms" (amortization)', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
    { label: 'Consumer Financial Protection Bureau, "How does paying down a mortgage work?"', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice and not a loan offer. Your lender sets your rate and payment.',
  faqHeading: 'Questions about amortization',
  faq: [
    {
      q: 'Why does so much of the first payment go to interest?',
      a: 'Interest is charged on the balance, and the balance is largest at the start. As it goes down, the interest part shrinks and more of the same payment lowers the balance.',
    },
    {
      q: 'What does each year in the schedule show?',
      a: 'The balance left at the end of that loan year. Open a year to see its payments one by one: the amount, the principal, the interest and the balance after each.',
    },
    {
      q: 'Does a longer term cost more?',
      a: 'At any rate above zero, yes. Each payment is smaller, but the balance falls more slowly, so interest is charged on more money for more months. Try the same amount over a few terms and compare the interest in the sentence.',
    },
    {
      q: 'Can I use it for any loan?',
      a: 'A mortgage, a car loan, a personal or a student loan: any loan that fits the assumptions above.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
  presets: { heading: 'More amortization calculators', caption: 'Amortization calculators that each answer one question', head: ['Calculator', 'What it answers'] },
} satisfies CalcPageTexts;
