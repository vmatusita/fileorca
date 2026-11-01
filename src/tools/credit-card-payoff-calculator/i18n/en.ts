import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Credit Card Payoff Calculator: Months to Pay Off',
  description: 'Find how many months a credit card takes to pay off at a fixed payment, or the payment that clears it by a target date, with the interest and schedule.',
  h1: 'Credit card payoff calculator',
  lead: 'How long a card takes to pay off, or the payment for a target date.',
  panel: {
    fields: {
      b: { label: 'Card balance', prefix: '$', error: 'Enter a balance from $1 to $1,000,000.' },
      r: { label: 'APR', suffix: '%', error: 'Enter an APR from 0 to 60%.' },
      md: { label: 'I want to know', error: '' },
      pay: { label: 'Payment per month', prefix: '$', error: 'Enter a payment from $1 to $1,000,000.' },
      m: { label: 'Months to pay it off', suffix: 'months', error: 'Enter from 1 to 600 months.' },
    },
    options: { md: { payment: 'The time', months: 'The payment' } },
    view: {
      labelTime: 'Time to pay it off',
      labelPayment: 'Monthly payment',
      unit: '/mo',
      placardMonths: 'payments',
      placardPayment: 'per month',
      sentencePayment: 'Paying {payment} a month clears {balance} in {count} payments, with {interest} of interest.',
      sentenceMonths: 'To clear {balance} in {time}, pay {payment} a month. You would pay {interest} in interest.',
      tooLow: "A payment of {payment} doesn't cover the interest of the first month. Pay at least {minimum} a month to bring the balance down.",
      tooLong: 'At {payment} a month the card would take more than 100 years to clear. Try a larger payment.',
      principal: 'Balance',
      interest: 'Interest',
      caption: 'Payoff schedule of the card, by year',
      paid: 'Total paid',
      last: 'Last payment',
      scheduleHeading: 'Payoff schedule',
    },
    premises: [
      'The interest of each month is the APR divided by 12, times the balance, rounded to the cent. Many card issuers charge daily on the average daily balance instead, so your statement can differ by a little.',
      'No new purchases, fees or rate changes while you pay it off.',
      'The payment stays the same every month; the last one closes the balance.',
      'A payment that does not cover the first month of interest never pays the card off.',
    ],
  },
  howHeading: 'How to use the credit card payoff calculator',
  howSteps: [
    'Enter the balance and the purchase APR from your statement.',
    'Choose whether you want the time with a payment you pick, or the payment for a number of months.',
    'Type the payment or the months, and read how long it takes or how much to pay.',
    'Open the schedule to see each month, or save it as a PDF or a CSV.',
  ],
  worksHeading: 'How the payoff is worked out',
  formulaHeading: 'The formula',
  formula: [
    'Each month, interest = balance × APR ÷ 12, rounded to the cent; the payment covers that interest and the rest lowers the balance, until a last payment closes it.',
    'For a target date, the payment is M = B × r × (1 + r)^n ÷ ((1 + r)^n − 1), with B the balance, r the APR divided by 12 and n the months.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    {
      label: 'Consumer Financial Protection Bureau, "How does my credit card company calculate the amount of interest I owe?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/',
    },
    {
      label: 'Consumer Financial Protection Bureau, "What is a daily periodic rate on a credit card?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-daily-periodic-rate-on-a-credit-card-en-46/',
    },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice. Your card agreement and statement set the interest you are charged.',
  faqHeading: 'Questions about paying off a credit card',
  faq: [
    {
      q: 'Why does the minimum payment take so long?',
      a: 'Much of a small payment goes to interest, so the balance falls slowly. Try your minimum, then a little more, and compare the months and the interest.',
    },
    {
      q: "What if my payment doesn't cover the interest?",
      a: 'Then the balance never goes down. The calculator says so and tells you the smallest monthly payment that starts to lower it.',
    },
    {
      q: 'Why can my statement show slightly different interest?',
      a: 'Many issuers work out interest daily on the average daily balance. The calculator uses the APR divided by 12 each month, a simpler rule that lands close but not to the cent.',
    },
    {
      q: 'Does it work with several cards?',
      a: 'It works with one balance. For several cards at once, the debt payoff calculator compares paying the smallest balance first with paying the highest rate first.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
