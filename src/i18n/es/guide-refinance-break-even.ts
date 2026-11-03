// STUB-IDIOMAS: copy of the English text, replaced by the writer of the lot.
import type { GuideTexts } from '../types.ts';

export default {
  title: 'Refinance Break-Even: How to Find Your Month',
  description: 'Two ways to find the month a mortgage refinance pays back its closing costs, why they disagree when the term changes, and a calculator for your own loan.',
  h1: 'Refinancing: find your break-even month',
  lead: 'A lower rate saves money only after it has paid back the cost of getting it. Here is how to find that month, and a common shortcut that can mislead.',
  intro: [
    'Refinancing replaces your mortgage with a new loan, usually at a lower rate, and that new loan comes with closing costs: appraisal, title, lender fees. The break-even month is when what you save has paid those costs back. Before it, refinancing has cost you money; after it, it starts to save.',
    'This guide works through one example with the engine of the calculator below: {balance} still owed at {rate}, with {left} left, refinanced into a new loan of {newTerm} at an example rate of {newRate}, with {costs} of closing costs paid at closing.',
  ],
  calcHeading: 'Find the break-even of your loan',
  calcIntro: 'The calculator starts from the example of this guide. Every number in the text below comes from the same engine.',
  sections: [
    {
      heading: 'The shortcut: closing costs divided by monthly savings',
      paragraphs: [
        'The current payment is {currentPayment}; the new one would be {newPayment}, so the payment drops by {savings} a month. The usual rule of thumb divides the closing costs by that drop: {costs} ÷ {savings} gives month {simple}. The Federal Reserve guide to refinancing uses this kind of division to find how long it takes to recover the costs.',
        'The shortcut is quick, and it works well when the new loan has the same term as what is left on the old one. When the term changes, it can mislead, because part of a lower payment comes from spreading the same debt over more years, not from paying less interest.',
      ],
    },
    {
      heading: 'Counting interest instead of payments',
      paragraphs: [
        'A stricter test asks when the interest you avoid has covered the closing costs. Each month, add up the interest paid so far on the new loan, plus the closing costs, and compare it with the interest the current loan would have charged by then. In the example that happens in month {breakEven}, later than the shortcut says.',
        'Over the whole life of the loans the picture changes again. The new loan charges {newInterest} of interest against {currentInterest} for the current one, a saving of only {interestDiff}, because it runs five years longer. Counting the closing costs, the new loan costs {costDiff} more in all, even though the payment is lower every month.',
      ],
    },
    {
      heading: 'Keeping the same term',
      paragraphs: [
        'If the new loan instead lasted 25 years, the same as what is left, the payment would be {sameTermPayment}, a drop of only {sameTermSavings} a month. The shortcut would now say month {sameTermSimple}. Counting interest, the break-even is month {sameTermBreakEven}, and over the life of the loan the interest falls by {sameTermInterest}.',
        'So the shortcut can err in both directions: it looked too good for the longer loan and too gloomy for the same term. The interest test gives the same answer whichever way the payment moves.',
      ],
    },
    {
      heading: 'Paying the costs or adding them to the loan',
      paragraphs: [
        'Many lenders let you add the closing costs to the new balance, or offer a no-closing-cost loan with a higher rate. The CFPB points out that the costs do not disappear either way. In the example, adding the {costs} to the loan raises the payment to {rolledPayment} and moves the interest break-even to month {rolledBreakEven}, because you now pay interest on the costs too.',
        'Whatever the method, compare the break-even with how long you expect to keep the home. If you may sell before it, refinancing is likely to cost more than it saves.',
      ],
    },
  ],
  tableHeading: 'Break-even by closing costs and new rate',
  tableIntro: 'The same {balance} balance at {rate} with {left} left, refinanced into a 30-year loan. The shortcut and the interest test side by side.',
  tableCaption: 'Monthly savings and break-even month by closing costs and new rate, with both methods',
  tableNote: 'Worked out with the engine of this site on {date}, month by month in cents. The rates are examples.',
  formulaHeading: 'The two methods',
  formula: [
    'Shortcut: break-even month = closing costs ÷ (current payment − new payment), rounded up.',
    'Interest test: the first month m in which closing costs + interest paid on the new loan by month m ≤ interest the current loan would have charged by month m. Each payment is M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), and each month the interest is the balance times r, rounded to the cent.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'Both loans are fixed-rate with equal monthly payments; the current payment is worked out from the balance, rate and months left.',
    'No prepayment penalty, tax effect or change in escrow.',
    'The rates and costs are examples chosen for this guide.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Current loan: {balance} at {rate}, {left} left, {currentPayment} a month. New loan: {newTerm} at {newRate}, {newPayment} a month, {costs} of closing costs. Shortcut: month {simple}. Interest test: month {breakEven}.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Federal Reserve, "A Consumer\'s Guide to Mortgage Refinancings"', href: 'https://www.federalreserve.gov/pubs/refinancings/' },
    {
      label: 'Consumer Financial Protection Bureau, "Is there such a thing as a no-cost or no-closing cost loan or refinancing?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/is-there-such-a-thing-as-a-no-cost-or-no-closing-loan-or-refinancing-en-141/',
    },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice and not a loan offer. A lender decides whether you qualify and at what rate and cost.',
  relatedHeading: 'Calculators for the next step',
  words: {
    head: ['Closing costs', 'New rate', 'Monthly savings', 'Shortcut: costs ÷ savings', 'Interest break-even'],
    month: 'month {n}',
    never: 'never',
  },
} satisfies GuideTexts<'guides-refinance-break-even'>;
