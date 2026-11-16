// F19b, slice 1: the minimal text of guides-webp-vs-avif-vs-jpg in es, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "WebP, AVIF o JPG | FileOrca",
  description: "Cuánto pesan las mismas fotos en cada formato y cuándo conviene cada uno.",
  h1: "WebP, AVIF o JPG",
  lead: "Cuánto pesan las mismas fotos en cada formato y cuándo conviene cada uno.",
  changed: "Publicado por primera vez el {published}.",
  intro: ["Esta guía se está escribiendo."],
  toolHeading: "WebP, AVIF o JPG",
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
  // F19b (front M1): the shape of the tables, which the front T rewrites in words and keeps.
  tables: [
    {
      heading: "Las tres fotos en cada formato",
      caption: "Cada foto de celular en JPG con Comprimir imagen y en WebP y AVIF con Convertir a WebP, en la opción Recomendada, en Chromium, con la parte del original",
      head: ["Foto", "Original", "JPG", "WebP", "AVIF"],
    },
    {
      heading: "El PNG con las esquinas transparentes",
      caption: "El PNG con las esquinas transparentes guardado en JPG con PNG a JPG y en WebP y AVIF con Convertir a WebP, en Chromium: el archivo, su parte del PNG y si la transparencia se conservó",
      head: ["Guardado como", "Archivo", "Transparencia conservada"],
      labels: ["JPG", "WebP", "AVIF"],
    },
  ],
  sourcesHeading: "Fuentes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Herramientas y guías relacionadas",
} satisfies FileGuideTexts;
