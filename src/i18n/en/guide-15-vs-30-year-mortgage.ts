import type { GuideTexts } from '../types.ts';

export default {
  title: '15-Year vs 30-Year Mortgage: The Real Cost of Each Term',
  description: 'What a 15-year mortgage costs a month and saves in interest against a 30-year one, worked out payment by payment at several rates, with a calculator.',
  h1: '15-year vs 30-year mortgage: the real cost',
  lead: 'The shorter term asks more each month and gives back far more in interest. Here is how much, with the numbers worked out.',
  intro: [
    'Most home buyers in the United States choose between two fixed-rate terms: 15 years and 30 years. The question sounds simple, but the two answers pull in opposite directions. The 30-year loan keeps the monthly payment low; the 15-year loan pays the house off in half the time and charges much less interest along the way.',
    'This guide runs both loans through the same engine as the calculator below, on one example home: a {price} price with {down} down, so a {loan} loan, at an example rate of {rate} for both terms. Change any number in the calculator to see your own case.',
  ],
  calcHeading: 'Try the two terms',
  calcIntro: 'The calculator starts from the example of this guide. Every number in the text below comes from the same engine.',
  sections: [
    {
      heading: 'The monthly payment',
      paragraphs: [
        'At {rate}, the 30-year loan costs {p30} a month in principal and interest. The 15-year loan costs {p15}: {more} more each month. Taxes, insurance and any PMI come on top of both and are the same for either term, so they do not change the comparison.',
        'The 15-year payment is not double the 30-year one, even though the time is halved. In the early years of a 30-year loan most of each payment is interest; halving the time removes much of that interest, so the payment rises by much less than you might expect.',
      ],
    },
    {
      heading: 'The interest over the life of the loan',
      paragraphs: [
        'Over 30 years the borrower pays {i30} in interest, for a total of {paid30}. Over 15 years the interest is {i15}, for a total of {paid15}. The shorter term saves {saved} of interest on the same house.',
        'The reason is the balance. Interest is charged every month on what is still owed, and the 15-year loan brings that balance down much faster. After five years the 15-year borrower has paid down {paidDown15y5} of principal and still owes {balance15y5}; the 30-year borrower has paid down {paidDown30y5} and still owes {balance30y5}. Halfway through its term, at year 15, the 30-year loan still has {balance30y15} left.',
      ],
    },
    {
      heading: 'When the 15-year rate is lower',
      paragraphs: [
        'Lenders often quote a lower rate for the shorter term, because their money is out for less time. That widens the gap in interest. If the 15-year loan in the example had a rate of {lowerRate} while the 30-year one stayed at {rate}, the 15-year payment would be {lowerP15}, {lowerMore} more than the 30-year one, and the interest saved would grow to {lowerSaved}.',
        'Use the rates on your own Loan Estimates in the calculator above. The values it starts with are examples, not offers. Ask two or three lenders for a Loan Estimate on each term: the forms are the same, so the rate, the payment and the costs on page one can be compared line by line.',
      ],
    },
    {
      heading: 'What the shorter term costs you',
      paragraphs: [
        'The price of the 15-year loan is flexibility. A payment that is {more} higher every month is money that cannot go to an emergency fund, to retirement savings or to debts with a higher rate. If income drops for a few months, a larger fixed payment is harder to meet.',
        'A middle path is to take the 30-year loan and pay extra when you can. You keep the lower required payment and still shorten the loan. The extra payments calculator shows how much a fixed extra amount each month saves on the same loan; a loan that charges no prepayment penalty lets you do it at any time.',
      ],
    },
  ],
  tableHeading: 'The two terms at five rates',
  tableIntro: 'The same {loan} loan, with both terms at the same rate, so the table shows the effect of the term alone. Interest is the total over the life of each loan.',
  tableCaption: 'Monthly payment and total interest of a 15-year and a 30-year loan at five example rates',
  tableNote: 'Worked out with the engine of this site on {date}, month by month in cents. The rates are examples, not offers.',
  formulaHeading: 'The formula',
  formula: [
    'Each payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan, r is the yearly rate divided by 12 and n is 180 or 360 payments.',
    'Each month the interest is the balance times r, rounded to the cent, and the rest of the payment lowers the balance. The last payment is whatever closes it.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'Both loans are fixed-rate with equal monthly payments, for the same amount.',
    'Taxes, insurance, PMI and closing costs are left out: they are the same for both terms.',
    'The rates are examples chosen for this guide; your lender quotes yours.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Loan of {loan} at {rate}. Thirty years: {p30} a month, {i30} of interest. Fifteen years: {p15} a month, {i15} of interest. Difference: {more} more a month for the 15-year loan, which pays {saved} less interest.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "Loan estimate explainer"', href: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/' },
    { label: 'Consumer Financial Protection Bureau, "Mortgages key terms"', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
    { label: 'Consumer Financial Protection Bureau, Regulation Z, Appendix H, Loan Estimate sample H-24(B)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/h/' },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice and not a loan offer. Your lender sets your rate and payment.',
  relatedHeading: 'Calculators for the next step',
} satisfies GuideTexts;
