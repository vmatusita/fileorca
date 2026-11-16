// F19b, slice 1: the minimal text of guides-apr-vs-apy in en, so the page builds; the fronts O and E write the guide.
import type { GuideTexts } from '../types.ts';

export default {
  title: "APR vs APY | FileOrca",
  description: "Why the same rate gives a higher yield the more often it compounds, with the numbers.",
  words: {
    head: ['Compounding', 'Times a year', 'APY of a {rate} APR', 'Above the APR'],
    compounding: ['Yearly', 'Twice a year', 'Quarterly', 'Monthly', 'Daily'],
  },
  h1: "APR vs APY",
  lead: "Why the same rate gives a higher yield the more often it compounds, with the numbers.",
  intro: ["This guide is being written."],
  calcHeading: "The calculator",
  calcIntro: "This guide is being written.",
  sections: [{ heading: "The calculator", paragraphs: ["This guide is being written."] }],
  tableHeading: "The table",
  tableIntro: "This guide is being written.",
  tableCaption: "The table",
  tableNote: "Worked out by the calculator on {date}.",
  formulaHeading: "The formula",
  formula: ["This guide is being written."],
  premisesHeading: "What it assumes",
  premises: ["This guide is being written."],
  exampleHeading: "A worked example",
  example: ["This guide is being written."],
  sourcesHeading: "Sources",
  sources: [{ label: 'Consumer Financial Protection Bureau', href: 'https://www.consumerfinance.gov/' }],
  disclaimerHeading: "Before you decide",
  disclaimer: "This guide is being written.",
  relatedHeading: "Related calculators",
} satisfies GuideTexts<"guides-apr-vs-apy">;
