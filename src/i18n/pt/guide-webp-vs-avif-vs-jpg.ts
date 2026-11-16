// F19b, slice 1: the minimal text of guides-webp-vs-avif-vs-jpg in pt, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "WebP, AVIF ou JPG | FileOrca",
  description: "Quanto as mesmas fotos pesam em cada formato, e quando cada um é o que serve.",
  h1: "WebP, AVIF ou JPG",
  lead: "Quanto as mesmas fotos pesam em cada formato, e quando cada um é o que serve.",
  changed: "Publicado pela primeira vez em {published}.",
  intro: ["Este guia está sendo escrito."],
  toolHeading: "WebP, AVIF ou JPG",
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
  // F19b (front M1): the shape of the tables, which the front T rewrites in words and keeps.
  tables: [
    {
      heading: "As três fotos em cada formato",
      caption: "Cada foto de celular em JPG pelo Comprimir imagem e em WebP e AVIF pelo Converter para WebP, na opção Recomendada, no Chromium, com a parte do original",
      head: ["Foto", "Original", "JPG", "WebP", "AVIF"],
    },
    {
      heading: "O PNG com os cantos transparentes",
      caption: "O PNG com os cantos transparentes salvo em JPG pelo PNG para JPG e em WebP e AVIF pelo Converter para WebP, no Chromium: o arquivo, a parte do PNG e se a transparência ficou",
      head: ["Salvo como", "Arquivo", "Transparência mantida"],
      labels: ["JPG", "WebP", "AVIF"],
    },
  ],
  sourcesHeading: "Fontes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Ferramentas e guias relacionados",
} satisfies FileGuideTexts;
