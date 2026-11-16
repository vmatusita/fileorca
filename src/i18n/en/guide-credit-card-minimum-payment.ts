// F19b (front E7; DECISOES § 780 and § 788): the guide to the credit card minimum payment. The calculator it embeds does not work
// out the minimum a statement asks for, and the guide never says it does: it sets the payment that barely covers the first
// month of interest beside larger fixed payments (every number from src/tools/calc/guides.ts, cases of the oracle), and
// explains with the CFPB why a statement minimum is slow (Regulation Z, the repayment disclosures of the periodic statement;
// the CFPB answer on the box of a statement; its report on how issuers set the minimum). No digit is typed here.
import type { GuideTexts } from '../types.ts';

export default {
  title: 'Credit Card Minimum Payment: Why It Takes So Long',
  description: 'Why a card balance lingers when the payment barely covers the interest, worked out on one card next to larger fixed payments, with the CFPB rules.',
  h1: 'Credit card minimum payment: why it takes so long',
  lead: 'A payment just over the interest leaves almost nothing for the balance. Here is what that does on one card.',
  intro: [
    'Every card statement asks for a minimum payment, the amount you must pay by the due date to keep the account from falling behind. Each payment first covers the interest of the month, and only what is left lowers the balance. When the payment is close to the interest, the balance barely moves, and the next month charges interest on almost the same amount again.',
    'This guide works through one card with the calculator below: a balance of {balance} at an APR of {apr}, with no new purchases. The calculator does not work out the minimum your statement asks for, because each card issuer has its own formula for it. Instead, the guide sets the payment that barely covers the first month of interest beside larger fixed payments, and turns to the CFPB for what a statement has to tell you about paying only the minimum.',
  ],
  calcHeading: 'Try a payment on this card',
  calcIntro: 'The calculator opens with the example of this guide, {payment} a month on {balance}. Type another payment and watch the months and the interest change; the numbers in the text below come from the same engine.',
  sections: [
    {
      heading: 'A payment equal to the interest',
      paragraphs: [
        'In the first month, {balance} at {apr} charges {firstInterest} of interest. A payment of exactly that amount pays the interest and leaves the balance where it was, month after month. The calculator calls that payment too low and asks for at least {minimum}.',
        'Regulation Z, the CFPB rule that sets, among other things, what a card statement must show, covers this case as well. When the minimum payments would not reduce the balance, the statement has to warn that paying only the minimum will never pay the balance off, even with no new charges on the card.',
      ],
    },
    {
      heading: 'Just over the interest',
      paragraphs: [
        'The first whole dollar above that interest is {barely}. Of that payment, {barelyToBalance} lowers the balance in the first month, and the rest is interest. The balance then falls a little, the interest of the next month falls with it, and the part left for the balance grows, slowly. The card is paid off in {barelyTime}, after {barelyCount} payments.',
        'Over those years the interest adds up to {barelyInterest}, more than {barelyTimes} times the balance at the start, and the payments come to {barelyPaid} in all. The early payments are almost all interest, and that is where the years go.',
      ],
    },
    {
      heading: 'A few dollars more change the most',
      paragraphs: [
        'Raising the payment to {nextPayment} pays the same card off in {nextTime}, with {nextInterest} of interest. Every added dollar goes to the balance, so the balance falls sooner, and each later month charges interest on less.',
        'The table below shows the same pattern all the way up: each larger payment ends sooner and costs less interest than the one before it, and each added dollar saves fewer months than the dollars before it. Near the interest, a few dollars cut years; higher up, a dollar buys much less time. At {topPayment} a month the card is paid off in {topTime}, with {topInterest} of interest.',
      ],
    },
    {
      heading: 'Why a statement minimum is so slow',
      paragraphs: [
        'The minimum on a real statement is set by the card issuer, and the rules differ between issuers and even between cards of the same issuer. In its report on the credit card market, the CFPB found that the issuers it reviewed set the minimum as a percentage of the statement balance, typically with the interest and fees added on top, and with a fixed dollar floor.',
        'With a minimum built that way, the part that lowers the balance is about that percentage of the balance. As the balance falls, that part falls too, so each minimum takes less off the balance than the one before, until the minimum reaches the floor. The calculator keeps one payment for every month and does not follow a shrinking minimum; typing your current minimum into it shows how long that amount takes if it stays fixed.',
      ],
    },
    {
      heading: 'The box on your statement',
      paragraphs: [
        'Regulation Z also has card issuers print a minimum payment warning on a credit card statement, outside a few exempt cases: paying only the minimum means more interest and a longer time to pay off the balance. Next to it, the statement estimates how long the current balance would take at the minimum and what it would cost in all, assuming no new charges. Unless an exception applies, such as a minimum that already clears the balance within {boxTime}, it also shows the monthly payment that would clear it in {boxTime}, the total cost of that payment and what it saves.',
        'On the card of this guide, the calculator puts that payment at {boxPayment}, with {boxInterest} of interest and {boxPaid} in all; the issuer works out its own figure, so the box on a real statement can differ a little. The example of {payment} sits just under it and takes {time}. The CFPB points out that you only have to pay the minimum, not the amount in the box, and that the box does not count new purchases.',
      ],
    },
  ],
  tableHeading: 'Each fixed payment: the months and the interest',
  tableIntro: 'The same {balance} at {apr}, paid with the same amount every month and no new purchases. The second column is what the first payment takes off the balance once the {firstInterest} of interest is paid.',
  tableCaption: 'For each fixed monthly payment: what the first payment takes off the balance, the time to pay off and the total interest',
  tableNote: 'Worked out with the engine of this site on {date}, month by month in cents. The balance and the APR are examples.',
  formulaHeading: 'The formula',
  formula: [
    'Each month: interest = balance × APR ÷ the months in a year, rounded to the cent. The payment covers that interest first, the balance falls by payment − interest, and the months are counted until a last payment closes the balance.',
    'A fixed payment pays the card off only if it is larger than the interest of the first month. For the payment that clears the balance in a set number of months, the calculator runs the same monthly account and solves it for the payment instead of the time.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'No new purchases, fees or rate changes while the card is paid off, and every payment arrives on time.',
    'The interest is charged once a month on the balance. The CFPB explains that many card companies charge it daily on the average daily balance, so a statement can show slightly different amounts.',
    'The payment is the same every month, unlike a statement minimum, which the issuer works out again from each new balance.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Card: {balance} at {apr}. First month: {firstInterest} of interest. Paying {barely} a month, the first payment takes {barelyToBalance} off the balance, and the card takes {barelyTime} and {barelyInterest} of interest. Paying {payment} a month, the first payment takes {toBalance} off, and the card takes {count} payments, {time}, with {interest} of interest: {interestDiff} less.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    {
      label: 'Consumer Financial Protection Bureau, Regulation Z, "Periodic statement" (the repayment disclosures and the minimum payment warning)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/7/',
    },
    {
      label: 'Consumer Financial Protection Bureau, "A box on my credit card bill says that I will pay off the balance in three years if I pay a certain amount. What does that mean? …"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/a-box-on-my-credit-card-bill-says-that-i-will-pay-off-the-balance-in-three-years-if-i-pay-a-certain-amount-what-does-that-mean-do-i-have-to-pay-that-much-if-i-pay-that-much-and-make-new-purchases-will-i-still-owe-nothing-after-three-years-en-36/',
    },
    {
      label: 'Consumer Financial Protection Bureau, "The Consumer Credit Card Market" (report; the section on the minimum payment)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_consumer-credit-card-market-report_2023.pdf',
    },
    {
      label: 'Consumer Financial Protection Bureau, "How does my credit card company calculate the amount of interest I owe?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/',
    },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice. Your card agreement and your statement set the minimum payment and the interest you are charged.',
  relatedHeading: 'Calculators for the next step',
  words: { head: ['Payment per month', 'First month, to the balance', 'Paid off in', 'Total interest'] },
} satisfies GuideTexts<'guides-credit-card-minimum-payment'>;
