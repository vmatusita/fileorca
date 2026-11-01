import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Personal Loan Calculator with Origination Fee and APR',
  description: 'Work out the monthly payment, the total interest and the real APR of a personal loan with an origination fee, plus the full schedule. Free and private.',
  h1: 'Personal loan calculator',
  lead: 'What a personal loan costs a month, and its APR once the fee is counted.',
  panel: {
    fields: {
      a: { label: 'Loan amount', prefix: '$', error: 'Enter an amount from $100 to $1,000,000.' },
      r: { label: 'Interest rate', suffix: '%', error: 'Enter a rate from 0 to 40%.', help: 'The rate on the offer, before any fee.' },
      m: { label: 'Loan term', suffix: 'months', error: 'Enter a term from 1 to 120 months.' },
      f: { label: 'Origination fee', suffix: '%', error: 'Enter a fee from 0 to 20% of the loan.', help: 'Taken from the money you receive. Leave 0 if there is none.' },
    },
    moreHeading: 'Fees',
    view: {
      label: 'Monthly payment',
      unit: '/mo',
      placard: 'per month',
      sentence: "Over {time} at {rate} you'll repay {total}, of which {interest} is interest.",
      apr: 'With the {fee} fee taken out up front, the APR is {apr}.',
      principal: 'Principal',
      interest: 'Interest',
      caption: 'Payment schedule of the personal loan, by loan year',
      amount: 'Loan amount',
      fee: 'Origination fee',
      received: 'Money you receive',
      cost: 'Interest and fee',
      paid: 'Total of payments',
      aprLabel: 'APR',
    },
    premises: [
      'The rate stays the same for the whole term and the payments are monthly and equal; the last one closes the balance.',
      'Interest is charged once a month at the yearly rate divided by 12, on the balance, rounded to the cent.',
      'The origination fee comes out of the money you receive, so you repay the whole loan amount.',
      'The APR follows the actuarial method of Regulation Z, Appendix J: the monthly rate at which your payments are worth the money you receive, times 12.',
      'No late fees, insurance or other charges are included.',
    ],
  },
  howHeading: 'How to use the personal loan calculator',
  howSteps: [
    'Enter the amount you would borrow and the rate on the offer.',
    'Enter the term in months, from 1 to 120.',
    'Add the origination fee as a percent, if the lender charges one, to see the APR.',
    'Open the schedule or save it as a PDF or a CSV to compare offers side by side.',
  ],
  worksHeading: 'How the payment and the APR are worked out',
  formulaHeading: 'The formula',
  formula: [
    'The payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r is the yearly rate divided by 12 and n is the number of months.',
    'With a fee, you receive less than you repay. The APR is the yearly rate that makes the payments worth exactly the money you receive: the monthly rate x that solves (amount − fee) = M ÷ (1 + x) + M ÷ (1 + x)^2 + … + M ÷ (1 + x)^n, times 12. It is shown with two decimals.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "Do personal installment loans have fees?"', href: 'https://www.consumerfinance.gov/ask-cfpb/do-personal-installment-loans-have-fees-en-2120/' },
    {
      label: 'Consumer Financial Protection Bureau, "What is the difference between a loan interest rate and the APR?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/',
    },
    { label: 'Consumer Financial Protection Bureau, Regulation Z, Appendix J, annual percentage rate computations', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice and not a loan offer. The lender sets your rate, fees and APR.',
  faqHeading: 'Questions about personal loans',
  faq: [
    {
      q: 'Why is the APR higher than the interest rate?',
      a: 'The APR counts the origination fee as a cost of the loan. You repay the whole amount but receive less, so the yearly cost of the money you actually get is higher than the rate on the note.',
    },
    {
      q: 'How is the origination fee charged?',
      a: 'Here it comes out of the money you receive, which is how many lenders charge it. If yours adds it to the balance instead, enter the amount with the fee included and set the fee to zero.',
    },
    {
      q: 'Does a longer term save money?',
      a: 'It lowers the monthly payment but adds interest, because the balance stays higher for longer. Try the same amount with 36 and 60 months and compare the interest in the sentence.',
    },
    {
      q: 'Is the APR here the same as on my disclosure?',
      a: 'It uses the method of Regulation Z for a loan with equal monthly payments and a regular first period. A disclosure can include other charges or an odd first period, so small differences are possible.',
    },
    {
      q: 'Can I compare two offers?',
      a: 'Enter one offer and copy the link, then the other and copy that link. Each link opens the calculator with its own numbers, and the PDFs keep both schedules.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
