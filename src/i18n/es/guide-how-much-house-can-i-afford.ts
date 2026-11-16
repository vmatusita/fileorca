// F19b, slice 1: the minimal text of guides-how-much-house-can-i-afford in es, so the page builds; the fronts O and T write the guide.
import type { GuideTexts } from '../types.ts';

export default {
  title: "Cuánta casa puedo pagar | FileOrca",
  description: "Los dos límites de ingreso de los que parte un prestamista y cuál de ellos fija el precio que puedes pagar.",
  words: {
    head: ['Otras deudas al mes', 'Límite que fija el precio', 'Margen para la vivienda', 'Precio de vivienda que puedes pagar'],
    front: 'Límite de vivienda, {rate}',
    back: 'Límite de deuda total, {rate}',
    both: 'Los dos límites',
  },
  h1: "Cuánta casa puedo pagar",
  lead: "Los dos límites de ingreso de los que parte un prestamista y cuál de ellos fija el precio que puedes pagar.",
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
} satisfies GuideTexts<"guides-how-much-house-can-i-afford">;
