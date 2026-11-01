import type { CalcPageTexts } from '../../../../calc/types.ts';

export default {
  title: 'Balloon Loan Calculator: Payment and Balloon Due',
  description: 'Work out the monthly payment of a balloon loan and the lump sum still due on the balloon date, with the interest paid until then and the schedule.',
  h1: 'Balloon loan calculator',
  lead: 'The monthly payment of a balloon loan, and what is left to pay at the end.',
  panel: {
    fields: {
      a: { label: 'Loan amount', prefix: '$', error: 'Enter an amount from $100 to $100,000,000.' },
      r: { label: 'Interest rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
      t: { label: 'Amortization term', suffix: 'years', error: 'Enter a term from 1 to 40 years.', help: 'The term the payment is worked out on.' },
      bm: { label: 'Balloon due with payment', error: 'Enter a payment number from 1 to 479.', over: 'Must come before the last payment of the amortization term.' },
    },
    view: {
      label: 'Balloon payment',
      placard: 'balloon',
      sentence: 'After {count} payments of {payment}, the balloon is due with payment {month}, on top of it. Until then you pay {interest} of interest.',
      principal: 'Loan',
      interest: 'Interest',
      caption: 'Payment schedule up to the balloon, by loan year',
      payment: 'Monthly payment',
      due: 'Due with payment',
      dueValue: 'Payment {n}',
      lastTotal: 'Last payment with the balloon',
      paid: 'Total paid',
      scheduleHeading: 'Schedule up to the balloon',
    },
    premises: [
      'The monthly payment is worked out as if the loan ran the whole amortization term, at a fixed rate.',
      'Interest is charged once a month at the yearly rate divided by 12, on the balance, rounded to the cent.',
      'The balloon is the balance left after the regular payment of the balloon month; that last payment is the regular payment plus the balloon.',
      'No refinancing of the balloon, fees or rate changes are included.',
    ],
  },
  howHeading: 'How to use the balloon loan calculator',
  howSteps: [
    'Enter the loan amount, the rate and the amortization term the payment is based on.',
    'Type the payment number the balloon is due with, for example 84 for seven years.',
    'Read the monthly payment and the balloon, and open the schedule up to the balloon.',
  ],
  own: [
    {
      heading: 'What a balloon loan is',
      paragraphs: [
        'The payments are figured as if the loan ran long, so they stay low, but the loan ends early: what is still owed then falls due at once. The CFPB describes a balloon as a large, one-time payment at the end of the loan term.',
      ],
    },
    {
      heading: 'The risk at the end',
      paragraphs: [
        'Many borrowers plan to sell or refinance before the balloon. If rates are higher then, or the property is worth less, that can be hard. Check the balloon against what you could pay or borrow, and keep the schedule.',
      ],
    },
  ],
  worksHeading: 'How the balloon is worked out',
  formulaHeading: 'The formula',
  formula: [
    'The payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1) with n the months of the amortization term and r the yearly rate ÷ 12.',
    'The schedule runs month by month until the balloon month; the balloon is the balance left after that regular payment, the same as the future value of the loan minus the payments made.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "What is a balloon payment? When is one allowed?"', href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-balloon-payment-when-is-one-allowed-en-104/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice and not a loan offer. Your contract sets the balloon amount and date.',
  faqHeading: 'Questions about balloon loans',
  faq: [
    {
      q: 'Why is the monthly payment so low?',
      a: 'It is worked out on a long amortization term, so each payment only repays a little principal. The rest waits for the balloon.',
    },
    {
      q: 'Where are balloon loans used?',
      a: 'In some car loans, business loans and commercial or private mortgages. The CFPB notes they are generally not allowed in a Qualified Mortgage, with limited exceptions.',
    },
    {
      q: 'What happens if I cannot pay the balloon?',
      a: 'You would need to refinance, sell or reach an agreement with the lender. Plan for it from the start.',
    },
    {
      q: 'Is the balloon the same as the last payment?',
      a: 'The balloon is what is left after the regular payment of that month; the last payment is the two together. The calculator shows both.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
