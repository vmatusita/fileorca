// STUB-IDIOMAS: copy of the English text, replaced by the writer of the lot.
import type { GuideTexts } from '../types.ts';

export default {
  title: 'Rent vs Buy: When Buying a Home Starts to Pay Off',
  description: 'The year buying a home catches up with renting, how home prices and investment returns move it, and a calculator to run your own numbers.',
  h1: 'Rent vs buy: when buying starts to pay off',
  lead: 'Buying costs more at first and can come out ahead later. The question is when, and it depends on numbers nobody knows in advance.',
  intro: [
    'Renting and buying are both ways to pay for a place to live, and neither is always cheaper. Buying ties up a down payment and adds costs a renter never sees: interest, property tax, insurance, upkeep, and the cost of selling one day. Renting keeps that money free to be invested. Over time, the home may gain value and the rent may rise, and at some point the owner can come out ahead.',
    'This guide follows one example with the engine of the calculator below: a {price} home with {down} down at an example rate of {rate}, against a similar home rented for {rent} a month. The other example values are {tax} of property tax and {insurance} of insurance a year, upkeep of {upkeep} of the value a year, home values rising {appreciation} a year, rent rising {rentIncrease} a year, a cost to sell of {selling}, and savings earning {return} a year.',
  ],
  calcHeading: 'Compare renting and buying',
  calcIntro: 'The calculator starts from the example of this guide. Every number in the text below comes from the same engine.',
  sections: [
    {
      heading: 'How the two paths are compared',
      paragraphs: [
        'Each month, the owner pays the mortgage, the tax, the insurance and the upkeep, and the renter pays the rent. Whichever costs less that month invests the difference, so the comparison is fair: neither side gets to spend money the other has to set aside. The renter also starts with the down payment invested.',
        'At the end of each year, the owner is worth what the home would sell for, minus the cost of selling and what is still owed on the loan, plus any savings. The renter is worth the savings. Buying catches up in the first year it is worth at least as much as renting.',
      ],
    },
    {
      heading: 'The example, year by year',
      paragraphs: [
        'The mortgage payment is {payment} in principal and interest. After the first year, buying is worth {firstYearBuyer} and renting {firstYearRenter}: the owner is behind, mostly because selling would cost {selling} of the value and early payments are mostly interest.',
        'The gap closes as the home gains value and the loan balance falls. In this example buying catches up in {breakEven}. After {years} years, buying leaves {buyer} and renting {renter}. Along the way the owner pays {ownerCost} for the home and the renter pays {rentPaid} in rent.',
      ],
    },
    {
      heading: 'The two numbers that move the answer most',
      paragraphs: [
        'Home value growth and investment returns decide most of the result, and both are guesses about the future. The table below keeps everything else from the example and changes those two over a 30-year horizon. When home values rise faster, buying catches up sooner; when savings earn more, renting holds its lead longer, and at the highest return in the table buying only catches up with fast-rising home values.',
        'With home values that stay flat, buying catches up only in {flatBreakEven} in the example. No rate in this table is a forecast. The CFPB warns that calculators like this rest on assumptions about the economy and suggests trying several scenarios, which is what the table does.',
      ],
    },
    {
      heading: 'What the numbers leave out',
      paragraphs: [
        'Taxes are left out: the mortgage interest deduction and the tax on capital gains depend on your situation, and the CFPB suggests asking a tax professional. So are closing costs to buy, moving costs and the value of stability or flexibility. If you might move within a few years, renting usually keeps more options open; if you expect to stay a long time, buying has more years to catch up.',
      ],
    },
  ],
  tableHeading: 'When buying catches up, by home values and returns',
  tableIntro: 'The example of this guide over a 30-year horizon, with the yearly change of the home value (rows) and the yearly return on savings (columns) changed.',
  tableCaption: 'The year buying catches up with renting, by home value change and return on savings',
  tableNote: 'Worked out with the engine of this site on {date}, month by month in cents. The rates are examples, not forecasts.',
  formulaHeading: 'The method',
  formula: [
    'Owner cost each month = mortgage payment + tax ÷ 12 + insurance ÷ 12 + HOA + value × upkeep ÷ 12. The cheaper path saves the difference; savings grow by the yearly return ÷ 12 each month.',
    'Each year end: buying = value × (1 − cost to sell) − loan balance + savings; renting = savings. The home value and the rent change once a year by their rates.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'A fixed-rate mortgage; tax, insurance and HOA stay at the amounts entered.',
    'Both paths invest whatever they save, at the same return.',
    'No income tax, deductions, capital gains tax or closing costs to buy.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Home {price}, {down} down, rate {rate}, rent {rent}. Buying catches up in {breakEven}. After {years} years: buying {buyer}, renting {renter}.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    {
      label: 'Consumer Financial Protection Bureau, "Consider whether it\'s the right time for you to buy"',
      href: 'https://www.consumerfinance.gov/owning-a-home/prepare/consider-whether-its-the-right-time-for-you-to-buy/',
    },
    {
      label: 'Consumer Financial Protection Bureau, "What are some of the financial considerations of buying a home?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-are-some-of-the-financial-considerations-of-buying-a-home-en-119/',
    },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice. It rests on rates chosen for the example, and the future ones are unknown.',
  relatedHeading: 'Calculators for the next step',
  words: { head: 'Home value change per year', savings: 'Savings earn {rate}', year: 'year {n}', notWithin: 'not within 30 years' },
} satisfies GuideTexts<'guides-rent-vs-buy-break-even'>;
