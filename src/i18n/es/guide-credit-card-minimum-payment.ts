// F19b, slice 1: the minimal text of guides-credit-card-minimum-payment in es, so the page builds; the fronts O and T write the guide.
import type { GuideTexts } from '../types.ts';

export default {
  title: "Pago mínimo de la tarjeta de crédito: por qué tarda tanto | FileOrca",
  description: "Qué hace con el saldo un pago apenas mayor que los intereses, al lado de pagos fijos más grandes.",
  words: { head: ['Pago al mes', 'Primer mes, al saldo', 'Se termina de pagar en', 'Intereses totales'] },
  h1: "Pago mínimo de la tarjeta de crédito: por qué tarda tanto",
  lead: "Qué hace con el saldo un pago apenas mayor que los intereses, al lado de pagos fijos más grandes.",
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
} satisfies GuideTexts<"guides-credit-card-minimum-payment">;
