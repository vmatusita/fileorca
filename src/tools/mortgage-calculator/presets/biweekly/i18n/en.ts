import type { CalcPageTexts } from '../../../../calc/types.ts';
import { homePanel, homePremises } from '../../../i18n/en.ts';

export default {
  title: 'Biweekly Mortgage Calculator: Half Payments Every Two Weeks',
  description: 'Compare paying half your mortgage payment every two weeks with paying monthly: the months and the interest saved, and the full biweekly schedule.',
  h1: 'Biweekly mortgage calculator',
  lead: 'What paying half the payment every two weeks saves against paying monthly.',
  panel: {
    ...homePanel,
    view: {
      label: 'Interest saved',
      placard: 'interest saved',
      sentence: 'Paying {half} every two weeks instead of {payment} a month ends the loan in {time} instead of {base}, and saves {interest} of interest.',
      principal: 'Principal',
      interestPart: 'Interest paying biweekly',
      monthlyName: 'Monthly payments',
      biweeklyName: 'Biweekly payments',
      payment: 'Each payment',
      interest: 'Interest',
      paidOff: 'Paid off in',
      diff: 'B ends the loan {saved} sooner and saves {interest} of interest.',
      caption: 'Biweekly schedule, 26 half payments a year, by loan year',
      number: 'Half payment',
      half: 'Half payment',
      monthsSaved: 'Months saved',
      months: '{n} months',
      halfCount: 'Number of half payments',
      halves: '{n} half payments',
      compareLabel: 'Monthly and biweekly payments side by side',
      scheduleHeading: 'Biweekly schedule',
    },
    premises: [
      // The second home premise is the monthly loan's; here it is said as the comparison it is (review F4, ANU-4).
      ...homePremises.map((premise, index) =>
        index === 1 ? 'The monthly loan it is compared with is charged interest once a month at the yearly rate divided by 12, on the balance, and rounded to the cent.' : premise,
      ),
      'A biweekly payment is half the monthly payment, rounded to the cent, paid 26 times a year: the same as 13 monthly payments a year.',
      'Interest is charged on the balance every two weeks at the yearly rate divided by 26. The time in months is the number of half payments × 12 ÷ 26, rounded up to a whole month.',
    ],
  },
  howHeading: 'How to use the biweekly mortgage calculator',
  howSteps: [
    'Enter the home price, the down payment, the rate and the term of the mortgage.',
    'Read the half payment and how much sooner the loan ends.',
    'Compare the monthly and biweekly payments side by side, and open the biweekly schedule.',
  ],
  own: [
    {
      heading: 'Where the savings come from',
      paragraphs: [
        'A year has 52 weeks, so half a payment every two weeks is 26 half payments, which add up to 13 monthly payments instead of 12. That extra payment a year goes to principal, and the interest charged every two weeks on a smaller balance does the rest.',
      ],
    },
    {
      heading: 'Biweekly programs that charge a fee',
      paragraphs: [
        'You can usually reach the same result by adding one twelfth of a payment to each monthly payment, at no cost. The CFPB sued a company that charged enrollment and yearly fees for biweekly plans, saying the fees could take years to recover. Ask your servicer how it applies payments before you sign up for a program.',
      ],
    },
  ],
  worksHeading: 'How the biweekly schedule is worked out',
  formulaHeading: 'The formula',
  formula: [
    'The monthly payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1) with r the yearly rate ÷ 12. The half payment is M ÷ 2, rounded to the cent.',
    'Every two weeks: interest = balance × yearly rate ÷ 26, rounded to the cent, and the half payment lowers the balance by what is left, until a last half payment closes it.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    {
      label: 'Consumer Financial Protection Bureau, "CFPB files suit against Nationwide Biweekly for luring consumers with false promises of mortgage savings"',
      href: 'https://www.consumerfinance.gov/archive/newsroom/cfpb-files-suit-against-nationwide-biweekly-for-luring-consumers-with-false-promises-of-mortgage-savings/',
    },
    { label: 'Consumer Financial Protection Bureau, "Mortgages key terms"', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
  ],
  disclaimer: 'This calculator is an educational tool, not financial advice. Your servicer decides how and when biweekly payments are applied.',
  faqHeading: 'Questions about biweekly mortgages',
  faq: [
    {
      q: 'Is a biweekly mortgage a different loan?',
      a: 'No. It is the same loan paid in halves every two weeks. Whether the servicer credits each half at once or holds it until the monthly due date changes how much you save.',
    },
    {
      q: 'Why does it save money?',
      a: 'Mostly because 26 half payments make one extra monthly payment a year, and that extra lowers the balance. Interest charged every two weeks adds a little more.',
    },
    {
      q: 'Can I get the same result without a biweekly plan?',
      a: 'Close to it, by paying one twelfth more with each monthly payment. The extra payments calculator shows that case.',
    },
    {
      q: 'Does biweekly fit my pay schedule?',
      a: 'If you are paid every two weeks it can make budgeting easier. Two months a year have three paydays, which is where the extra payment comes from.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so nothing you type is sent anywhere, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
