import type { CalcPageTexts } from '../../../../calc/types.ts';
import { homePanel, homePremises } from '../../../i18n/en.ts';

export default {
  title: 'Mortgage Calculator with Extra Payments',
  description: 'See how many months and how much interest extra mortgage payments save: monthly, once a year or a single lump sum, side by side with the plain loan.',
  h1: 'Mortgage calculator with extra payments',
  lead: 'How much sooner the loan ends, and the interest saved, when you pay a little more.',
  panel: {
    ...homePanel,
    fields: {
      ...homePanel.fields,
      em: { label: 'Extra every month', prefix: '$', error: 'Enter an extra payment from $0 to $1,000,000.' },
      ey: { label: 'Extra once a year', prefix: '$', error: 'Enter an extra payment from $0 to $10,000,000.', help: 'Paid with every 12th payment.' },
      eo: { label: 'One extra payment', prefix: '$', error: 'Enter an extra payment from $0 to $100,000,000.' },
      eom: { label: 'With payment number', error: 'Enter a payment number from 1 to 480.', over: "Can't come after the last payment of the term." },
    },
    moreHeading: 'More extra payments, taxes and fees',
    view: {
      label: 'Interest saved',
      placard: 'interest saved',
      sentence: 'With the extra payments the loan is paid off in {time} instead of {base}, {saved} sooner, and you save {interest} of interest.',
      same: 'Without an extra payment the loan runs its {base}. Add an extra payment to see what it saves.',
      principal: 'Principal',
      interestPart: 'Interest with extra payments',
      without: 'Without extra payments',
      with: 'With extra payments',
      interest: 'Interest',
      paidOff: 'Paid off in',
      paid: 'Total paid',
      diff: 'B pays the loan off {saved} sooner and saves {interest} of interest.',
      caption: 'Payment schedule with the extra payments, by loan year',
      pi: 'Principal and interest',
      monthly: 'Monthly payment with taxes, insurance and fees',
      monthsSaved: 'Months saved',
      months: '{n} months',
      paidOffWith: 'Payments with the extra',
      paidOffWithout: 'Payments without the extra',
      payments: '{n} payments',
      compareLabel: 'The loan without and with extra payments',
      scheduleHeading: 'Schedule with extra payments',
    },
    premises: [
      ...homePremises,
      'Every extra payment goes straight to the balance; the regular payment stays the same, so the loan ends sooner. The extra once a year is paid with every 12th payment.',
    ],
  },
  howHeading: 'How to use the extra payments calculator',
  howSteps: [
    'Enter the home price, the down payment, the rate and the term of the mortgage.',
    'Type how much extra you could pay every month.',
    'Add an extra once a year or a single lump sum with the payment number it goes with, if you plan one.',
    'Compare the loan without and with the extra payments, and save the new schedule.',
  ],
  own: [
    {
      heading: 'Why an extra payment saves interest',
      paragraphs: [
        'Interest is charged on the balance. An extra payment lowers the balance at once, so every later month charges a little less interest, and more of the same regular payment goes to principal. The effect adds up: early extras save more than late ones, because they shorten more months of interest.',
        "The regular payment doesn't change. What changes is the last payment number: the loan simply ends sooner.",
      ],
    },
    {
      heading: 'Before you pay extra',
      paragraphs: [
        'Ask your servicer to apply the extra to principal, and check that the loan has no prepayment penalty. Some people keep an emergency fund or pay off higher-rate debts first; the debt payoff calculator compares those debts.',
      ],
    },
  ],
  worksHeading: 'How the savings are worked out',
  formulaHeading: 'The formula',
  formula: [
    'The regular payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). Each month: interest = balance × r rounded to the cent, payment = M + the extras of that month, and the new balance is the old one minus (payment − interest), until a last payment closes it.',
    'Months saved = payments without extras − payments with extras. Interest saved = interest without extras − interest with extras.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "How does paying down a mortgage work?"', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/' },
    { label: 'Consumer Financial Protection Bureau, "Mortgages key terms" (prepayment penalty)', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice. Your loan contract says how extra payments are applied.',
  faqHeading: 'Questions about extra mortgage payments',
  faq: [
    {
      q: 'Is it better to pay extra monthly or once a year?',
      a: 'The same total paid earlier saves a little more, because it lowers the balance sooner. Try both in the calculator with the same yearly amount.',
    },
    {
      q: 'Does an extra payment lower my monthly payment?',
      a: 'No. On a regular fixed-rate loan the payment stays the same and the loan ends earlier. A recast, which some lenders offer for a fee, is a different thing.',
    },
    {
      q: 'Can a lender charge me for paying early?',
      a: 'Some loans have a prepayment penalty. The Loan Estimate and Closing Disclosure say whether yours does.',
    },
    {
      q: 'Does the lump sum have to be in the first year?',
      a: 'No. Pick the payment number it goes with; a lump sum later in the loan saves less interest than the same amount early on.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
