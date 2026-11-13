import type { CalcPageTexts } from '../../../../calc/types.ts';
import { homePanel } from '../../../i18n/en.ts';

export default {
  title: '15-Year vs 30-Year Mortgage Calculator',
  description: 'Put a 15-year and a 30-year mortgage side by side: the monthly payment, the total interest and how the balance falls each year, at the rates you choose.',
  h1: '15-year vs 30-year mortgage calculator',
  lead: 'What the shorter term costs a month, and what it saves in interest.',
  panel: {
    fields: {
      p: homePanel.fields['p']!,
      d: homePanel.fields['d']!,
      dp: homePanel.fields['dp']!,
      r15: { label: '15-yr rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
      r30: { label: '30-yr rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
    },
    view: {
      label: '15-year payment',
      unit: '/mo',
      placard: '15-year payment',
      more: '{x} more',
      less: '{x} less',
      saves: 'saves {x} of interest',
      adds: 'adds {x} of interest',
      diff: 'B costs {paymentDiff} a month and {interestEffect}.',
      principal: 'Principal',
      interestPart: 'Interest over 15 years',
      thirty: '30-year fixed',
      fifteen: '15-year fixed',
      payment: 'Monthly payment',
      interest: 'Total interest',
      paidOff: 'Paid off in',
      year: 'Year',
      balance15: '15-year balance',
      balance30: '30-year balance',
      caption: 'What is still owed at the end of each year, 15-year and 30-year loans',
      payment30: '30-year payment',
      interest15: '15-year total interest',
      interest30: '30-year total interest',
      loan: 'Loan amount',
      compareLabel: 'The 30-year and 15-year loans side by side',
      scheduleHeading: 'Balance by year, both terms',
    },
    premises: [
      'Both loans are fixed-rate, with equal monthly payments, for the same amount: the price minus the down payment.',
      'Interest is charged once a month at the yearly rate divided by 12, on the balance, rounded to the cent; the last payment closes the balance.',
      'Taxes, insurance, PMI and fees are left out, since they are the same for both terms.',
    ],
  },
  howHeading: 'How to use the 15-year vs 30-year calculator',
  howSteps: [
    'Enter the home price and the down payment.',
    'Type the rate you were quoted for each term; shorter terms are often quoted lower.',
    'Compare the payment and the interest of the two loans, and open the balance by year.',
  ],
  own: [
    {
      heading: 'What the shorter term trades',
      paragraphs: [
        'Repaying the same amount in half the time means a larger payment each month, but the balance falls much faster, so far less interest builds up. A lower rate on the 15-year loan widens the gap in interest.',
      ],
    },
    {
      heading: 'Questions to ask yourself',
      paragraphs: [
        'Would the larger payment still fit if your income dropped for a while? Would you rather keep the 30-year payment and pay extra when you can? The extra payments calculator shows that middle path with the same loan.',
      ],
    },
  ],
  worksHeading: 'How the two loans are worked out',
  formulaHeading: 'The formula',
  formula: [
    'Each payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), with P the loan, r the yearly rate of that term divided by 12, and n = 180 or 360.',
    'Each month, interest = balance × r rounded to the cent. The difference in interest is the 30-year total minus the 15-year total.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "Loan estimate explainer"', href: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/' },
    { label: 'Consumer Financial Protection Bureau, "Mortgages key terms"', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice and not a loan offer. Lenders quote rates for each term.',
  faqHeading: 'Questions about 15-year and 30-year mortgages',
  faq: [
    {
      q: 'Why is the 15-year payment not double the 30-year one?',
      a: 'Because the 30-year payment is mostly interest at the start. Halving the time removes much of that interest, so the payment grows by less than double.',
    },
    {
      q: 'Can I use the same rate for both?',
      a: 'Yes. Typing the same rate isolates the effect of the term alone; typing the rates you were quoted shows the real offers.',
    },
    {
      q: 'Where do I see taxes, insurance and PMI?',
      a: 'In the mortgage calculator, which adds them to the payment of one term at a time.',
    },
    {
      q: 'Does the table show both loans?',
      a: 'Yes: what is still owed on each loan at the end of each year, so you can see how fast each one falls.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
