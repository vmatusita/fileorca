import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Compound Interest Calculator with Monthly Deposits',
  description: 'See how a balance grows with monthly deposits and yearly, quarterly, monthly or daily compounding: the final balance, the interest and a table by year.',
  h1: 'Compound interest calculator',
  lead: 'How a balance grows with monthly deposits and compounding.',
  panel: {
    fields: {
      i: { label: 'Starting amount', prefix: '$', error: 'Enter a starting amount from $0 to $10,000,000.' },
      m: { label: 'Monthly deposit', prefix: '$', error: 'Enter a deposit from $0 to $1,000,000.' },
      r: { label: 'Yearly rate', suffix: '%', error: 'Enter a rate from 0 to 40%.' },
      y: { label: 'Years', suffix: 'years', error: 'Enter from 1 to 80 years.' },
      c: { label: 'Compounding', error: '' },
      tm: { label: 'Deposits at the', error: '' },
    },
    options: {
      c: { '1': 'yearly', '2': 'twice a year', '4': 'quarterly', '12': 'monthly', '365': 'daily' },
      tm: { end: 'End of the month', begin: 'Start of the month' },
    },
    moreHeading: 'Compounding and deposits',
    view: {
      label: 'Final balance',
      placard: 'final balance',
      sentence: 'You put in {contributed} and earn {interest} of interest over {time} at {rate} compounded {how}.',
      tooLarge: 'That balance is too large to show. Try a smaller amount, rate or number of years.',
      deposits: 'Your deposits',
      interest: 'Interest',
      balance: 'Balance',
      year: 'Year',
      caption: 'Deposits, interest and balance by year',
      scheduleHeading: 'Growth by year',
    },
    premises: [
      'The yearly rate is a nominal rate, compounded the number of times a year you choose.',
      'Interest is added once a month at the monthly rate that compounding gives, (1 + rate ÷ n)^(n ÷ 12) − 1, rounded to the cent. With monthly compounding that is exactly the rate divided by 12.',
      'Deposits are the same every month, at the start or at the end of the month.',
      'No taxes, fees or withdrawals are included.',
    ],
  },
  howHeading: 'How to use the compound interest calculator',
  howSteps: [
    'Enter what you start with and what you add each month.',
    'Type a yearly rate and the number of years.',
    'Pick the compounding and whether you deposit at the start or the end of each month.',
    'Open the table by year, or save it as a PDF or a CSV.',
  ],
  worksHeading: 'How compound interest is worked out',
  formulaHeading: 'The formula',
  formula: [
    'The monthly rate is j = (1 + r ÷ n)^(n ÷ 12) − 1, where r is the yearly rate and n the times it compounds a year. Each month: balance = balance + balance × j + deposit, with the interest rounded to the cent.',
    'Without deposits this is the familiar A = P × (1 + r ÷ n)^(n × t). The table adds up the deposits and the interest of each year.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "How does compound interest work?"', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-compound-interest-work-en-1683/' },
    { label: 'Consumer Financial Protection Bureau, Regulation DD, Appendix A, annual percentage yield calculation', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice. Real returns change, and no rate here is a promise.',
  faqHeading: 'Questions about compound interest',
  faq: [
    {
      q: 'What does compounding more often change?',
      a: 'Interest starts earning interest sooner. At the same yearly rate, daily compounding grows a little faster than yearly; the difference shows in the APY, the rate after compounding.',
    },
    {
      q: 'Should I deposit at the start or the end of the month?',
      a: 'A deposit at the start earns one more month of interest. Switch the choice to see how much that adds over the years.',
    },
    {
      q: 'Why does the calculator add interest monthly even with yearly compounding?',
      a: 'Deposits are monthly, so the balance is updated every month at the monthly rate that gives the same yearly result. It is a declared convention, so a bank statement can differ by a few cents.',
    },
    {
      q: 'Is the rate a return I can expect?',
      a: 'No. It is a number you choose to see what it would do. A savings account pays a stated rate; an investment can earn more, less or lose money.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
