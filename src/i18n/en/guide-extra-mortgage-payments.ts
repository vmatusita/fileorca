import type { GuideTexts } from '../types.ts';

export default {
  title: 'How Extra Payments Shorten a Mortgage, Worked Out',
  description: 'How much sooner a mortgage ends and how much interest you save with extra monthly, yearly or one-time payments, measured on one loan with a calculator.',
  h1: 'How extra payments shorten a mortgage',
  lead: 'A little more each month comes off the balance, and the balance is what interest is charged on.',
  intro: [
    'Paying more than the required mortgage payment does not lower the payment; it ends the loan sooner. Every extra dollar goes straight to principal, so every later month charges interest on a smaller balance. Those savings repeat for the rest of the loan, which is why a modest extra amount can take years off a 30-year mortgage.',
    'This guide measures the effect on one loan with the engine of the calculator below: {loan} at an example rate of {rate} for 30 years, with a regular payment of {payment} in principal and interest. Without extra payments it runs {baseTime} and charges {baseInterest} of interest.',
  ],
  calcHeading: 'Try an extra payment',
  calcIntro: 'The calculator starts from the example of this guide, with {extra} extra every month. Every number in the text below comes from the same engine.',
  sections: [
    {
      heading: 'A fixed extra every month',
      paragraphs: [
        'Adding {extra} to every payment pays the loan off in {withTime} instead of {baseTime}: {saved} sooner. The interest saved is {interestSaved}.',
        'The required payment never changes. The extra lowers the balance a little more each month, so the share of the regular payment that goes to interest shrinks faster, and the last payment arrives years early.',
      ],
    },
    {
      heading: 'Once a year instead of every month',
      paragraphs: [
        'Some people prefer one larger extra payment a year, from a tax refund or a bonus. Paying {yearlyExtra} once a year, the same amount as {extra} a month, pays the loan off {yearlySaved} sooner and saves {yearlyInterest} of interest.',
        'That is a little less than the monthly extra saves, because part of the money waits until the end of each year before it starts lowering the balance. The difference is small; what matters most is the total you add and how early you add it.',
      ],
    },
    {
      heading: 'Early money works hardest',
      paragraphs: [
        'A single extra payment of {lump} with payment 12, at the end of the first year, saves {earlyInterest} of interest and ends the loan {earlySaved} sooner. The same {lump} with payment 240, twenty years in, saves {lateInterest} and ends it {lateSaved} sooner.',
        'Early in the loan the balance is large and most of each payment is interest, so a dollar of principal removed then stops interest from building for the longest time.',
      ],
    },
    {
      heading: 'Extra payments and PMI',
      paragraphs: [
        'If you put less than 20% down on a conventional loan, you probably pay private mortgage insurance. The CFPB explains that you can ask to cancel it once the balance reaches 80% of the home’s original value, and that it ends on its own at 78% of the original value on the regular schedule. Extra payments bring the balance down to 80% sooner, so you may be able to ask for the cancellation earlier; the automatic end at 78% follows the original schedule, not your extra payments.',
        'Keep the schedule the calculator gives you. It shows the balance at the end of each year, so you can see when it crosses 80% of the original value and make the request in writing.',
      ],
    },
    {
      heading: 'Before you pay extra',
      paragraphs: [
        'Ask your servicer to apply the extra to principal, not to the next payment. Check whether the loan has a prepayment penalty: the Loan Estimate and the Closing Disclosure say so. Many borrowers first build an emergency fund and pay off debts with a higher rate than the mortgage, since a dollar there saves more interest.',
        'If you would rather keep the flexibility of the lower payment, extra payments on a 30-year loan are a middle path between the 30-year and the 15-year terms: you can stop paying extra in a hard month.',
      ],
    },
  ],
  tableHeading: 'What each extra amount does',
  tableIntro: 'The same {loan} loan at {rate} for 30 years, with a different fixed extra added to every monthly payment.',
  tableCaption: 'Time to pay off, time saved and interest saved by extra amount per month',
  tableNote: 'Worked out with the engine of this site on {date}, month by month in cents. The rate is an example.',
  formulaHeading: 'The formula',
  formula: [
    'The regular payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), with r the yearly rate divided by 12 and n = 360. Each month: interest = balance × r, rounded to the cent; payment = M + the extra of that month; the balance falls by payment − interest.',
    'Months saved = payments without the extra − payments with it. Interest saved = interest without the extra − interest with it.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'A fixed-rate loan with no prepayment penalty; every extra payment goes to principal the month it is paid.',
    'The extra once a year is paid with every 12th payment.',
    'Taxes, insurance and PMI are left out: extra payments do not change them.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Loan of {loan} at {rate}, payment {payment}. With {extra} extra a month: paid off in {withTime} instead of {baseTime}, {interestSaved} of interest saved.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "How does paying down a mortgage work?"', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/' },
    { label: 'Consumer Financial Protection Bureau, "Mortgages key terms" (prepayment penalty)', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
    {
      label: 'Consumer Financial Protection Bureau, "When can I remove private mortgage insurance (PMI) from my loan?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/',
    },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice. Your loan contract says how extra payments are applied.',
  relatedHeading: 'Calculators for the next step',
  words: { head: ['Extra per month', 'Paid off in', 'Sooner by', 'Interest saved'] },
} satisfies GuideTexts<'guides-extra-mortgage-payments'>;
