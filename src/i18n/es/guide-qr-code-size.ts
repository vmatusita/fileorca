// F19b (front M5): the minimal text of guides-qr-code-size in es, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Tamaño del código QR | FileOrca",
  description: "Cómo el texto que escribes define cuántos cuadritos tiene un código QR, y qué cambia eso en el PNG y al imprimir.",
  h1: "Tamaño del código QR",
  lead: "Cómo el texto que escribes define cuántos cuadritos tiene un código QR, y qué cambia eso en el PNG y al imprimir.",
  changed: "Publicado por primera vez el {published}.",
  intro: ["Esta guía se está escribiendo."],
  toolHeading: "Tamaño del código QR",
  toolIntro: "Esta guía se está escribiendo.",
  sections: [
    { heading: "Parte 1", paragraphs: ["Esta guía se está escribiendo."] },
    { heading: "Parte 2", paragraphs: ["Esta guía se está escribiendo."] },
    { heading: "Parte 3", paragraphs: ["Esta guía se está escribiendo."] },
  ],
  half: 1,
  measuredHeading: "Lo que medimos",
  sheet: {
    stats: [
      { label: "Lo que medimos", value: "Esta guía se está escribiendo." },
      { label: "Lo que medimos", value: "Esta guía se está escribiendo." },
    ],
    sample: "Esta guía se está escribiendo.",
    link: "Mira la tabla",
  },
  tableHeading: "La medida",
  measuredIntro: "Esta guía se está escribiendo.",
  measuredNote: "Medido el {date}.",
  // F19b (front M5): the shape of the tables, which the front T rewrites in words and keeps (the labels in the order of
  // the measurement).
  tables: [
    {
      heading: "Los textos y sus códigos",
      caption: "Cada texto escrito en el Generador de códigos QR, en Chromium: los caracteres, lo que cuenta la herramienta, la versión que encontró el lector, los cuadritos de cada lado y los cuadritos oscuros bajo Oli",
      head: ["Texto", "Caracteres", "Contados por la herramienta", "Versión", "Cuadritos por lado", "Cuadritos oscuros bajo Oli"],
      labels: ["Enlace corto", "Frase sin acentos", "La misma frase con acentos", "Enlace largo"],
    },
    {
      heading: "El PNG de cada texto en cada tamaño",
      caption: "El PNG de cada texto en cada tamaño del Generador de códigos QR, en Chromium: los píxeles, los píxeles de cada cuadrito y el archivo",
      head: ["Texto", "Tamaño del PNG", "Píxeles", "Píxeles por cuadrito", "Archivo"],
    },
  ],
  sourcesHeading: "Fuentes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Herramientas y guías relacionadas",
} satisfies FileGuideTexts;
