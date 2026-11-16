// F19b (decision 5): guide 8, how much house an income can carry under the two limits of the home affordability calculator.
// Every number is a {placeholder} the engines fill at build (src/tools/calc/guides.ts, howMuchHouse), each one a case of the
// oracle; no digit is typed here. The 28% and 36% are the calculator's starting rules of thumb, never a rule of law, and no
// source below is said to give them.
import type { GuideTexts } from '../types.ts';

export default {
  title: 'How Much House Can I Afford? Which Income Limit Sets the Price',
  description: 'How two shares of your income turn into a home price, which of them sets it, and how other monthly debts move it, worked out on one example.',
  words: {
    head: ['Other debts per month', 'Limit that sets the price', 'Room for housing', 'Home price you can afford'],
    front: 'Housing limit, {rate}',
    back: 'Total debt limit, {rate}',
    both: 'Both limits',
  },
  h1: 'How much house can I afford',
  lead: 'Two shares of your income cap what a home may cost each month. The tighter one sets the price.',
  intro: [
    'A home price starts from a monthly payment, and the payment starts from your income. The calculator below sets two limits, each a share of your gross monthly income: the housing limit, for the home alone, and the total debt limit, for the home and your other debts. Whichever leaves less room caps the payment, and the payment caps the loan.',
    'This guide follows one household through the calculator’s engine: {income} a year before taxes, {debts} a month of other debts, {down} down, a fixed-rate loan over {term} at an example rate of {rate}, {tax} a year of property tax, {insurance} of insurance and no HOA dues. Under the two starting limits, the price comes to {price}.',
  ],
  calcHeading: 'Try your own numbers',
  calcIntro: 'The calculator opens on this example, and every number in the guide comes from the same engine. Change the debts or the limits and see which one sets the price.',
  sections: [
    {
      heading: 'Two limits, two rooms',
      paragraphs: [
        'The housing limit takes {front} of a twelfth of {income}, which gives {frontCap} a month. That room has to hold principal, interest, property tax, home insurance and any HOA dues. The CFPB groups principal, interest, taxes and insurance as PITI, the basic parts of a monthly mortgage payment.',
        'The total debt limit takes {back} of the same monthly income, {backTotal}, and that room has to hold the home and everything else you pay on debts each month. Taking off the {debts} of other debts leaves {backCap} for the home. This limit caps the debt-to-income ratio, which the CFPB defines as all monthly debt payments divided by gross monthly income.',
      ],
    },
    {
      heading: 'Which limit sets the price',
      paragraphs: [
        'In the example the housing limit leaves {frontCap} and the total debt limit leaves {backCap}, so the housing limit is the tighter one, and it sets the price. A twelfth of the yearly tax, {taxMonth}, and a twelfth of the insurance, {insuranceMonth}, come out of that room first. What is left, {maxPI} a month, goes to principal and interest.',
        'At {rate} over {term}, a payment of {maxPI} repays a loan of {loan}. Add the {down} down payment and the price is {price}.',
        'The total debt limit still has {room} a month to spare. Other debts could grow by that much before it became the tighter limit: at {sameRoomDebts} a month of debts, the two limits leave the same room.',
      ],
    },
    {
      heading: 'What other debts do, and when',
      paragraphs: [
        'While the housing limit sets the price, other debts do not touch it. With no other debts at all the price is still {noDebtsPrice}. Paying off the debts of {debts} a month would leave that money free each month, but under these limits it would not raise the price.',
        'Past {sameRoomDebts}, every dollar of another debt comes out of the room for the home. At {stepDebts} a month of debts the price is {stepPrice}; at {stepExtra} more, it is {stepExtraPrice}, which is {stepDrop} less. The table keeps that pace: past that point, each {stepExtra} a month of debts takes about {stepDrop} off the price.',
        'The pace comes from the loan. At {rate} over {term}, {stepExtra} a month is the payment on about {stepDrop} of loan, so once the total debt limit is the tighter one, a car payment of that size takes that much loan away.',
      ],
    },
    {
      heading: 'The costs of the home count too',
      paragraphs: [
        'Property tax, insurance and HOA dues come out of the room before the loan does, under either limit. A home with higher taxes or monthly dues leaves a smaller payment for the loan, so the same income reaches a lower price. The formula below shows where each one enters.',
        'The rate works on the other side, on how far a payment goes. At a higher rate more of the same {maxPI} is interest, so it repays a smaller loan, and the price falls with it.',
      ],
    },
    {
      heading: 'What the limits leave out',
      paragraphs: [
        'The calculation stops at the monthly payment. It leaves out private mortgage insurance, which the CFPB says a small down payment is likely to bring, and closing costs, which the CFPB suggests taking out of your savings before you settle on the down payment. Either one can lower the price that fits.',
        'The limits also say nothing about utilities, repairs, upkeep or savings for emergencies, which the CFPB lists among the costs to plan for before you choose a price. They describe what an income can carry under two ratios, not what a household is comfortable spending.',
      ],
    },
    {
      heading: 'Rules of thumb, not rules of law',
      paragraphs: [
        'The calculator starts from {front} for housing and {back} for all debts because they are common rules of thumb. They are not a rule of law, and none of the CFPB pages this guide cites gives them. The CFPB page on the debt-to-income ratio names no single figure: it says different loan products and lenders have different limits.',
        'So a lender may answer with a different price: its limits can differ from these, and it may count costs the calculator leaves out. If your lender quotes its own limits, enter them in the two limit fields and the price follows.',
      ],
    },
  ],
  tableHeading: 'The price by other monthly debts',
  tableIntro: 'The same household with different payments on other debts each month. The housing limit sets the price in the first rows, the total debt limit in the rest.',
  tableCaption: 'Limit that sets the price, room for housing and home price, by other debts per month',
  tableNote: 'Worked out with the engine of this site on {date}. The rate and the home costs are examples.',
  formulaHeading: 'The formula',
  formula: [
    'Monthly income = a twelfth of the gross yearly income. Housing room = monthly income × housing limit. Debt room = monthly income × total debt limit − other monthly debts. The smaller room is the most the home may cost a month.',
    'Payment for the loan M = that room − a twelfth of the yearly property tax − a twelfth of the yearly insurance − the monthly HOA dues. The largest loan L is the one that M pays off in equal monthly payments over the term, at a monthly rate of a twelfth of the yearly rate. Price = L + down payment.',
  ],
  premisesHeading: 'Assumptions',
  premises: [
    'Both limits are shares of gross income, before taxes. The calculator starts from the values of this guide; each lender and loan program sets its own.',
    'Other debts are the monthly payments on them: a car loan, student loans, the minimum on a card.',
    'A fixed rate and equal monthly payments for the whole term. The rate, the tax and the insurance are examples, not quotes.',
    'No private mortgage insurance, closing costs or cash reserves, and no HOA dues in the example.',
    'Each room and the largest loan are rounded down to the cent, as in the calculator; loans and prices are shown in whole dollars.',
  ],
  exampleHeading: 'Worked example',
  example: [
    'Income {income} a year, other debts {debts} a month. Housing room: {frontCap}. Debt room: {backTotal} − {debts} = {backCap}. The smaller is {frontCap}; minus {taxMonth} of tax and {insuranceMonth} of insurance, it leaves {maxPI}. Largest loan, {term} at {rate}: {loan}. Price: {loan} + {down} = {price}.',
  ],
  sourcesHeading: 'Sources',
  sources: [
    {
      label: 'Consumer Financial Protection Bureau, "What is a debt-to-income ratio?"',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-why-is-the-43-debt-to-income-ratio-important-en-1791/',
    },
    {
      label: 'Consumer Financial Protection Bureau, "Figure out how much you want to spend"',
      href: 'https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/',
    },
    { label: 'Consumer Financial Protection Bureau, "What is PITI?"', href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-piti-en-152/' },
  ],
  disclaimerHeading: 'Educational guide',
  disclaimer: 'This guide is educational, not financial advice and not a loan approval. A lender decides what it will lend you, at which rate and under which limits.',
  relatedHeading: 'Calculators for the next step',
} satisfies GuideTexts<'guides-how-much-house-can-i-afford'>;
