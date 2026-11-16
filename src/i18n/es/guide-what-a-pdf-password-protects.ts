// F19b, slice 1: the minimal text of guides-what-a-pdf-password-protects in es, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Qué protege la contraseña de un PDF | FileOrca",
  description: "Qué hace la contraseña para abrir, qué no hacen las restricciones y por qué una contraseña corta es débil.",
  h1: "Qué protege la contraseña de un PDF",
  lead: "Qué hace la contraseña para abrir, qué no hacen las restricciones y por qué una contraseña corta es débil.",
  changed: "Publicado por primera vez el {published}.",
  intro: ["Esta guía se está escribiendo."],
  toolHeading: "Qué protege la contraseña de un PDF",
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
      heading: "Tres PDF con contraseña",
      caption: "Tres PDF protegidos con Proteger PDF: sus páginas, el archivo antes y después y los bytes que el cifrado añadió",
      head: ["PDF", "Páginas", "Antes", "Después", "Añadido"],
    },
    {
      heading: "Restricciones sin contraseña",
      caption: "El PDF con restricciones y sin contraseña para abrir, como llegó y después de Desbloquear PDF, junto a un PDF después de Proteger PDF: el archivo, si un lector lo abrió sin contraseña y las acciones que bloquea",
      head: ["Archivo", "Tamaño", "Se abre sin contraseña", "Acciones bloqueadas"],
      labels: ["Solo restricciones, como llegó", "El mismo PDF después de Desbloquear PDF", "Un PDF después de Proteger PDF"],
    },
  ],
  sourcesHeading: "Fuentes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Herramientas y guías relacionadas",
} satisfies FileGuideTexts;
