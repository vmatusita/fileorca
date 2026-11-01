import type { GuideTexts } from '../types.ts';

export default {
  title: 'Snowball vs Avalanche: Debt Payoff Methods with Numbers',
  description: 'The debt snowball and the debt avalanche run on the same four debts and budget: months to debt-free, interest paid and payoff order, with a calculator.',
  h1: 'Snowball vs avalanche, with numbers',
  lead: 'Two ways to pay off several debts with the same money each month, compared on one set of debts.',
  intro: [
    'When you owe on several cards and loans, two plans come up again and again. The debt snowball pays the smallest balance first; the debt avalanche pays the highest interest rate first. Both pay the minimum on everything else, and both roll the payment of a finished debt into the next one. The only difference is the order.',
    'This guide runs both plans on four debts and the same monthly budget, with the engine of the calculator below: a big credit card of {b1} at {r1} with a {m1} minimum, a small card of {b2} at {r2} with a {m2} minimum, a car loan of {b3} at {r3} with a {m3} minimum, and a personal loan of {b4} at {r4} with a {m4} minimum. On top of the {minimums} of minimums, the borrower adds {extra} a month, for a budget of {budget}.',
  ],
  calcHeading: 'Run both plans on your debts',
  calcIntro: 'The calculator starts from the four debts of this guide. Replace them with yours; every number in the text below comes from the same engine.',
  sections: [
    {
      heading: 'How the snowball plays out',
      paragraphs: [
        'The snowball puts the extra on the smallest balance, the small card, and clears it in month {snowFirst}. Its payment then joins the extra and moves to the next smallest balance. The order of payoff is {snowOrder}. The borrower is debt-free in {snowMonths} and pays {snowInterest} of interest in all.',
        'The appeal is early progress. A debt disappears within months, and each one that goes frees a payment for the next. The CFPB describes this approach as paying off the smallest balance first and moving the freed amount to the next one.',
      ],
    },
    {
      heading: 'How the avalanche plays out',
      paragraphs: [
        'The avalanche puts the extra on the highest rate first: the big card at {r1}. That card is larger, so the first debt only disappears in month {avalFirst}. The order of payoff is {avalOrder}. The borrower is debt-free in {avalMonths} and pays {avalInterest} of interest.',
        'With these debts the avalanche pays {interestDiff} less interest and finishes {monthsDiff} sooner. The money that would have gone to interest on the most expensive debt goes to principal instead.',
      ],
    },
    {
      heading: 'Why the gap is small here, and when it grows',
      paragraphs: [
        'The two plans share the same budget and the same minimums, so they can only differ in where the extra goes. The gap is widest when the rates are far apart and the high-rate debt is large; it shrinks when the extra is small, because both plans spend most of their time paying minimums, and when the extra is very large, because both plans clear everything quickly.',
        'The table below shows this on the same four debts. With no extra at all, the two plans end up almost the same. The gap is widest in the middle rows, and it narrows again with a large extra.',
      ],
    },
    {
      heading: 'Choosing between them',
      paragraphs: [
        'The avalanche pays less interest whenever the rates differ, and the calculator shows by how much on your own debts. The snowball gives sooner wins, which helps some people keep going. A plan you follow beats a plan you drop, so the right choice is the one you will stick with.',
        'Two things matter more than the order: paying more than the minimums, and not adding new balances while you pay down the old ones. If a minimum is lower than the interest on that debt, the debt grows while the extra goes elsewhere; the calculator says so when the whole budget does not cover the first month of interest.',
      ],
    },
  ],
  tableHeading: 'The same debts with different extra payments',
  tableIntro: 'The four debts of this guide, with the extra payment on top of the minimums changed each row.',
  tableCaption: 'Months to debt-free and interest paid with the snowball and the avalanche, by extra payment',
  tableNote: 'Worked out with the engine of this site on {date}, month by month in cents.',
  formulaHeading: 'The method',
  formula: [
    'Budget = sum of the minimums + extra. Each month, every debt is charged its APR divided by 12 on its balance, rounded to the cent; every debt gets its minimum; what is left of the budget goes to the first debt in the chosen order, then the next.',
    'Snowball orders the debts by their starting balance, smallest first. Avalanche orders them by APR, highest first.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'The APRs and minimums stay the same, and nothing new is charged on the debts.',
    'The budget stays the same every month; a finished debt leaves its minimum in the budget.',
    'Interest is charged once a month at the APR divided by 12. Card issuers that charge daily give slightly different numbers.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Budget {budget} a month. Snowball: debt-free in {snowMonths}, {snowInterest} of interest, order {snowOrder}. Avalanche: debt-free in {avalMonths}, {avalInterest} of interest, order {avalOrder}.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, "How to reduce your debt"', href: 'https://www.consumerfinance.gov/archive/blog/how-reduce-your-debt/' },
    {
      label: 'Consumer Financial Protection Bureau, "How does my credit card company calculate the amount of interest I owe?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/',
    },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice. Your lenders set the rates and minimums on your debts.',
  relatedHeading: 'Calculators for the next step',
} satisfies GuideTexts;
