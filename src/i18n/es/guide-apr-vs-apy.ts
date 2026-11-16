// F19b, slice 1: the minimal text of guides-apr-vs-apy in es, so the page builds; the fronts O and T write the guide.
import type { GuideTexts } from '../types.ts';

export default {
  title: "APR o APY | FileOrca",
  description: "Por qué la misma tasa rinde más cuantas más veces se capitaliza, con los números.",
  words: { head: ["Caso"] },
  h1: "APR o APY",
  lead: "Por qué la misma tasa rinde más cuantas más veces se capitaliza, con los números.",
  intro: ["Esta guía se está escribiendo."],
  calcHeading: "La calculadora",
  calcIntro: "Esta guía se está escribiendo.",
  sections: [{ heading: "La calculadora", paragraphs: ["Esta guía se está escribiendo."] }],
  tableHeading: "La tabla",
  tableIntro: "Esta guía se está escribiendo.",
  tableCaption: "La tabla",
  tableNote: "Calculado por la calculadora el {date}.",
  formulaHeading: "La fórmula",
  formula: ["Esta guía se está escribiendo."],
  premisesHeading: "Lo que supone",
  premises: ["Esta guía se está escribiendo."],
  exampleHeading: "Un ejemplo resuelto",
  example: ["Esta guía se está escribiendo."],
  sourcesHeading: "Fuentes",
  sources: [{ label: 'Consumer Financial Protection Bureau', href: 'https://www.consumerfinance.gov/' }],
  disclaimerHeading: "Antes de decidir",
  disclaimer: "Esta guía se está escribiendo.",
  relatedHeading: "Calculadoras relacionadas",
} satisfies GuideTexts<"guides-apr-vs-apy">;
