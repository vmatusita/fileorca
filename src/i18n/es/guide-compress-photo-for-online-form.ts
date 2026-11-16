// F19b, slice 1: the minimal text of guides-compress-photo-for-online-form in es, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Foto para un formulario en línea | FileOrca",
  description: "Qué quiere decir el límite de tamaño de un formulario y qué pierde una foto de celular para caber en él.",
  h1: "Foto para un formulario en línea",
  lead: "Qué quiere decir el límite de tamaño de un formulario y qué pierde una foto de celular para caber en él.",
  changed: "Publicado por primera vez el {published}.",
  intro: ["Esta guía se está escribiendo."],
  toolHeading: "Foto para un formulario en línea",
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
  // F19b (front M1): the shape of the table, which the front T rewrites in words and keeps.
  tables: [
    {
      heading: "Cada foto en cada límite",
      caption: "Lo que la opción Hasta un tamaño dio a cada foto de celular en cada límite en Chromium: el archivo, las dimensiones, la calidad a la que llegó y la calidad más alta con la que la foto entera cabría en su tamaño original",
      head: ["Límite", "Foto", "Archivo", "Dimensiones en píxeles", "Calidad alcanzada", "El tamaño original cabe hasta la calidad"],
    },
  ],
  sourcesHeading: "Fuentes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Herramientas y guías relacionadas",
} satisfies FileGuideTexts;
