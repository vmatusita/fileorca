// F6: esqueleto copiado do inglês até o hub brasileiro substituir este arquivo.
import type { MoneyHubTexts } from '../types.ts';

export default {
  title: 'Money Calculators: Mortgage, Loans, Debt and Savings',
  description: 'Free money calculators for mortgages, refinancing, car and personal loans, credit cards, debt payoff and savings. Your numbers stay on your device.',
  eyebrow: 'Money calculators',
  h1: 'Calculators for loans, debt and savings',
  intro: 'Each one answers one question with a schedule you can save. Nothing you type leaves your device.',
  creditHeading: 'Loans, homes and debt',
  educationalHeading: 'Savings and interest',
  presetsHeading: 'Calculators for one question',
  presetsCaption: 'Calculators that start from a parent calculator and answer one question',
  presetsHead: ['Calculator', 'What it answers'],
  guidesHeading: 'Guides with the numbers worked out',
  worksHeading: 'How these calculators work',
  worksIntro: [
    'Every calculator here runs in your browser. You type the numbers, including the interest rate: the value a field starts with is an example, not a rate anyone is offering you. The result changes as you type, and you can open the full schedule, save it as a PDF or a CSV, or copy a link that keeps your numbers after the #.',
    'All of them work in cents, the way a lender does. The interest of each month is rounded to the cent and the last payment closes the balance, so the schedule you download adds up exactly. The engines were checked against an independent oracle built on numpy-financial and against worked examples from the Consumer Financial Protection Bureau.',
  ],
  formulaHeading: 'The formula behind the loan calculators',
  formula: [
    'A fixed-rate loan has the same payment every month: M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the amount borrowed, r is the yearly rate divided by 12 and n is the number of payments. Each payment first covers the month’s interest (the balance times r) and the rest lowers the balance.',
    'The saving calculators run the same month-by-month loop the other way round: each month adds the interest on the balance and your deposit.',
  ],
  premisesHeading: 'What every calculator assumes',
  premises: [
    'The rate you type stays the same for the whole period.',
    'Interest is worked out once a month and rounded to the cent, half up.',
    'Taxes, deductions and fees appear only where a field asks for them; rules that change by state or every year are fields you fill in, never tables built into the page.',
  ],
  exampleHeading: 'A worked example',
  exampleIntro: 'The mortgage calculator opens with a $375,000 home, 20% down and a 6.5% example rate over 30 years. The engine gives:',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Consumer Financial Protection Bureau, Regulation Z, Appendix H, Loan Estimate sample H-24(B)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/h/' },
    { label: 'Consumer Financial Protection Bureau, Regulation Z, Appendix J, annual percentage rate computations', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' },
    { label: 'Consumer Financial Protection Bureau, Regulation DD, Appendix A, annual percentage yield calculation', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/' },
  ],
  disclaimerHeading: 'Educational tools',
  disclaimer: 'These calculators are educational tools, not financial advice and not offers of credit. A lender decides what it lends and at what rate; check every number with yours before you sign.',
} satisfies MoneyHubTexts;
