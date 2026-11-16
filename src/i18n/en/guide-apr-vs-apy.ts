import type { GuideTexts } from '../types.ts';

// F19b (front E6): the English text of guide 6. Every rate below is a {placeholder} the engine works out at build
// (src/tools/calc/guides.ts, aprVsApy); the words of the table are the front O's.
export default {
  title: 'APR vs APY: What Compounding Adds to a Rate',
  description: 'What compounding adds to an APR, compounding by compounding, worked out on one rate, and why the APR of a deposit is not the APR of a loan.',
  words: {
    head: ['Compounding', 'Times a year', 'APY of a {rate} APR', 'Above the APR'],
    compounding: ['Yearly', 'Twice a year', 'Quarterly', 'Monthly', 'Daily'],
  },
  h1: 'APR vs APY',
  lead: 'The APR is the rate before compounding; the APY is what it earns in a year. Here is the gap at each compounding.',
  intro: [
    'A deposit account comes with two rates that sound alike. The interest rate, which the calculator below calls the APR, is the yearly rate before any compounding. The annual percentage yield, the APY, is what the money really earns in a year once the interest already added starts earning interest of its own. Both are yearly percentages, which is why they are easy to mix up.',
    'This guide works through one rate with the engine of the calculator below: an APR of {rate} compounded daily, which earns an APY of {apy}. It then runs the same APR through every compounding the calculator offers, and a lower and a higher rate, to show where the gap comes from and when it is too small to see.',
  ],
  calcHeading: 'Turn an APR into an APY',
  calcIntro: 'The calculator opens on the example of this guide. Change the rate or the compounding to see the APY move, or switch the direction to turn an APY back into an APR.',
  sections: [
    {
      heading: 'What each rate counts',
      paragraphs: [
        'Regulation DD, the federal rule for deposit accounts, defines the interest rate of an account as a yearly rate that does not reflect compounding. It is the interest a year would bring if it were added to the balance only at the end of that year. When interest is compounded more often, each addition joins the balance, and the next interest is worked out on the larger amount.',
        'The APY counts that growth. Regulation DD defines it as a rate that reflects the total interest paid on an account over a year, based on the interest rate and on how often it is compounded. Interest on interest can only add to a balance, so the APY of an account is never below its interest rate; with yearly compounding the two are the same number.',
      ],
    },
    {
      heading: 'The same APR, compounded more often',
      paragraphs: [
        'Compounded yearly, an APR of {rate} earns {yearlyApy}: with all the interest arriving at the end of the year, none of it has time to earn more. Compounded twice a year it earns {twiceApy}, quarterly {quarterlyApy}, monthly {monthlyApy} and daily {apy}. Every row of the table adds something to the row above it, and the daily APY ends {gap} above the APR.',
        'The size of a step does not follow how many more times interest is added. Going from monthly to daily compounding is the biggest jump in that number, yet it adds only {dailyStep}, the smallest step in the table. Monthly compounding already puts the APY {monthlyGap} above the APR. Each daily addition is a tiny part of the interest of a year, and the interest it earns in turn is tinier still.',
      ],
    },
    {
      heading: 'A lower rate, a higher rate',
      paragraphs: [
        'The gap depends on the rate as well as on the compounding. At an APR of {lowRate} compounded daily, the APY is {lowApy}, only {lowGap} above the APR. Yearly, twice a year, quarterly and monthly compounding all show {lowMonthlyApy}: the extra interest is there, but it is too small to move the APY once Regulation DD rounds it to the nearest hundredth of a percentage point, so it only shows with daily compounding.',
        'At {highRate} compounded daily, the APY is {highApy}, {highGap} above the APR, and monthly compounding gives {highMonthlyApy}. A higher rate puts more interest into the balance each time it is compounded, so the same compounding opens a wider gap. Both rates are examples picked to show the effect, not the rate of any account.',
      ],
    },
    {
      heading: 'From an APY back to an APR',
      paragraphs: [
        'The calculator also works the other way. If an account states an APY of {rate} with daily compounding, the interest rate behind it is {backApr}, which is {backGap} lower. With yearly compounding the two would match, and the more often an account compounds, the lower the interest rate that reaches the same APY.',
        'That direction helps when two accounts state their rates in different ways. Turned into APYs, each with its own compounding, two rates stand on the same footing and can be set side by side. Under Regulation DD, the disclosure of a deposit account gives the APY and the interest rate, using those terms, together with how often interest is compounded and credited.',
      ],
    },
    {
      heading: 'A loan APR is another number',
      paragraphs: [
        'On a loan, APR means something else. The CFPB explains that the APR of a loan is its interest rate plus any additional fees the lender charges, and that the federal Truth in Lending Act, which Regulation Z carries out, requires lenders to disclose it. On a mortgage it also counts points, broker fees and other charges, so it is usually higher than the interest rate. The CFPB advises comparing an APR with another APR, not with an interest rate.',
        'The calculator in this guide turns a deposit rate into its yield and does nothing more. Typing the APR of a loan into it gives the APY a deposit at that rate would earn, not what the loan costs.',
      ],
    },
  ],
  tableHeading: 'The same APR with each compounding',
  tableIntro: 'The APR of the example, {rate}, with each compounding the calculator offers: how many times a year the rate is compounded, the APY it earns, and how far that APY sits above the APR.',
  tableCaption: 'APY of the example APR and its gap over the APR, by compounding',
  tableNote: 'Worked out with the engine of this site on {date}, rounded as Regulation DD rounds the APY. The rate is an example.',
  formulaHeading: 'The formula',
  formula: [
    'APY = (1 + APR ÷ n)^n − 1, with the APR as a decimal and n the number of times a year the rate is compounded, the second column of the table. Going back, APR = n × ((1 + APY)^(1 ÷ n) − 1).',
    'Regulation DD, Appendix A, works the APY out from the interest an account pays over a term and the principal, with an exponent that brings any term to a year. Over a whole year the exponent drops out, and the APY is the interest of that year divided by the principal: for money left alone all year, the same number as the formula above. Both results are rounded to the nearest hundredth of a percentage point.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'The APR is the nominal yearly rate of a deposit, and it does not change during the year.',
    'The money stays in for a whole year, with nothing added or taken out, and the interest stays in the account.',
    'Daily compounding means a compounding for every day of a year without a leap day, as in the calculator.',
    'Fees, taxes and any minimum balance an account may ask for are left out.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Take an APR of {rate} with daily compounding. Put into the formula, with n the days of the year, it gives an APY of {apy} once rounded: {gap} above the APR. Monthly compounding would give {monthlyApy}, and yearly compounding {yearlyApy}.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, Regulation DD, "§ 1030.2 Definitions"', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/2/' },
    {
      label: 'Consumer Financial Protection Bureau, Regulation DD, "Appendix A to Part 1030 — Annual Percentage Yield Calculation"',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/',
    },
    { label: 'Consumer Financial Protection Bureau, Regulation DD, "§ 1030.3 General disclosure requirements" (rounding)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/3/' },
    { label: 'Consumer Financial Protection Bureau, Regulation DD, "§ 1030.4 Account disclosures"', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/4/' },
    {
      label: 'Consumer Financial Protection Bureau, "What is the difference between a loan interest rate and the APR?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/',
    },
    {
      label: 'Consumer Financial Protection Bureau, "What is the difference between a mortgage interest rate and an APR?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/',
    },
    {
      label: 'Consumer Financial Protection Bureau, Regulation Z, "§ 1026.1 Authority, purpose, coverage, organization, enforcement, and liability"',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/1/',
    },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice. Its rates are examples; the disclosure of an account states the APY and the interest rate that apply to it.',
  relatedHeading: 'Calculators for the next step',
} satisfies GuideTexts<'guides-apr-vs-apy'>;
