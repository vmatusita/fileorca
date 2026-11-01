import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Auto Loan Calculator with Trade-In, Taxes and Fees',
  description: 'Work out a car loan payment with your down payment, trade-in, taxes and fees, plus the interest, the total cost and the full schedule. Free and private.',
  h1: 'Auto loan calculator',
  lead: 'What a car loan costs a month, and what the car costs in all.',
  panel: {
    fields: {
      p: { label: 'Car price', prefix: '$', error: 'Enter a price from $500 to $2,000,000.' },
      d: { label: 'Down payment', prefix: '$', error: 'Enter a down payment from $0 to $2,000,000.' },
      ti: { label: 'Trade-in value', prefix: '$', error: 'Enter a trade-in value from $0 to $2,000,000.' },
      r: { label: 'Rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
      m: { label: 'Loan term', suffix: 'months', error: 'Enter a term from 1 to 120 months.' },
      tf: {
        label: 'Sales tax, title and fees',
        prefix: '$',
        error: 'Enter taxes and fees from $0 to $500,000.',
        help: 'One total, as the dealer quotes it: the rules change by state, so the page does not work them out.',
      },
    },
    moreHeading: 'Trade-in, taxes and fees',
    view: {
      label: 'Monthly payment',
      unit: '/mo',
      placard: 'per month',
      sentence: "You finance {financed}. Over {time} at {rate} you'll pay {interest} in interest, and the car costs {total} in all.",
      nothing: 'Your down payment and trade-in cover the price, taxes and fees, so there is nothing to finance.',
      principal: 'Amount financed',
      interest: 'Interest',
      caption: 'Payment schedule of the car loan, by loan year',
      financed: 'Amount financed',
      cost: 'Total cost of the car',
      paid: 'Total of payments',
    },
    premises: [
      'The amount financed is the price plus taxes and fees, minus the down payment and the trade-in, and never less than zero.',
      'The rate stays the same for the whole term, with equal monthly payments; the last one closes the balance.',
      'Interest is charged once a month at the yearly rate divided by 12, on the balance, rounded to the cent.',
      'The total cost of the car is the price, taxes and fees plus the interest.',
      'No negative equity from an older loan, extended warranty or add-ons are included.',
    ],
  },
  howHeading: 'How to use the auto loan calculator',
  howSteps: [
    "Enter the car's price and your down payment.",
    'Type the rate the dealer or lender quoted and the term in months.',
    'Add the value of your trade-in, and the sales tax, title and fees as one total, to see what you finance.',
    'Open the schedule, or save it as a PDF or a CSV.',
  ],
  worksHeading: 'How the car payment is worked out',
  formulaHeading: 'The formula',
  formula: [
    'Amount financed = price + taxes and fees − down payment − trade-in.',
    'The payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the amount financed, r is the yearly rate divided by 12 and n is the number of months. Each month the interest is the balance times r, rounded to the cent.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    {
      label: 'Consumer Financial Protection Bureau, "How do I compare auto loan offers?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-compare-auto-loan-offers-what-should-i-look-at-besides-the-monthly-payment-en-753/',
    },
    { label: 'Consumer Financial Protection Bureau, "Auto loans key terms"', href: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/answers/key-terms/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice and not a loan offer. The dealer or lender sets your rate, fees and payment.',
  faqHeading: 'Questions about car loans',
  faq: [
    {
      q: 'Why does the calculator ask for taxes and fees as one number?',
      a: 'Sales tax, title and registration change by state and county, and some states tax the price after the trade-in. Ask the dealer for the total and type it in.',
    },
    {
      q: 'Is a longer loan cheaper?',
      a: 'The monthly payment goes down, but you pay interest for longer. The CFPB shows the same loan costing more than twice as much interest over six years as over three.',
    },
    {
      q: 'What if I still owe money on my trade-in?',
      a: 'Subtract what you owe from the trade-in value before you enter it. If you owe more than the car is worth, enter zero and add the difference to the taxes and fees, since it gets financed too.',
    },
    {
      q: 'Does the payment include insurance?',
      a: 'No. Car insurance, fuel and maintenance are paid apart from the loan, so add them to your budget separately.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
