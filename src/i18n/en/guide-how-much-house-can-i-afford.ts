// F19b, slice 1: the minimal text of guides-how-much-house-can-i-afford in en, so the page builds; the fronts O and E write the guide.
import type { GuideTexts } from '../types.ts';

export default {
  title: "How much house can I afford | FileOrca",
  description: "The two income limits a lender starts from, and which one sets the price you can pay.",
  words: { head: ["Case"] },
  h1: "How much house can I afford",
  lead: "The two income limits a lender starts from, and which one sets the price you can pay.",
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
} satisfies GuideTexts<"guides-how-much-house-can-i-afford">;
