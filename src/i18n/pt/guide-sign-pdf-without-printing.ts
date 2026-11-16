// F19b, slice 1: the minimal text of guides-sign-pdf-without-printing in pt, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Como assinar um PDF sem imprimir | FileOrca",
  description: "O que é uma assinatura desenhada na página, o que ela não é, e o que ela muda no arquivo.",
  h1: "Como assinar um PDF sem imprimir",
  lead: "O que é uma assinatura desenhada na página, o que ela não é, e o que ela muda no arquivo.",
  changed: "Publicado pela primeira vez em {published}.",
  intro: ["Este guia está sendo escrito."],
  toolHeading: "Como assinar um PDF sem imprimir",
  toolIntro: "Este guia está sendo escrito.",
  sections: [
    { heading: "Parte 1", paragraphs: ["Este guia está sendo escrito."] },
    { heading: "Parte 2", paragraphs: ["Este guia está sendo escrito."] },
    { heading: "Parte 3", paragraphs: ["Este guia está sendo escrito."] },
  ],
  half: 1,
  measuredHeading: "O que medimos",
  sheet: {
    stats: [
      { label: "O que medimos", value: "Este guia está sendo escrito." },
      { label: "O que medimos", value: "Este guia está sendo escrito." },
    ],
    sample: "Este guia está sendo escrito.",
    link: "Veja a tabela",
  },
  tableHeading: "A medida",
  measuredIntro: "Este guia está sendo escrito.",
  measuredNote: "Medido em {date}.",
  tables: [],
  sourcesHeading: "Fontes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Ferramentas e guias relacionados",
} satisfies FileGuideTexts;
