// F19b, slice 1: the minimal text of guides-compress-photo-for-online-form in pt, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Foto para formulário online | FileOrca",
  description: "O que o limite de tamanho de um formulário quer dizer, e o que uma foto de celular perde para caber nele.",
  h1: "Foto para formulário online",
  lead: "O que o limite de tamanho de um formulário quer dizer, e o que uma foto de celular perde para caber nele.",
  changed: "Publicado pela primeira vez em {published}.",
  intro: ["Este guia está sendo escrito."],
  toolHeading: "Foto para formulário online",
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
  // F19b (front M1): the shape of the table, which the front T rewrites in words and keeps.
  tables: [
    {
      heading: "Cada foto em cada limite",
      caption: "O que a opção Até um tamanho deu a cada foto de celular em cada limite no Chromium: o arquivo, as dimensões, a qualidade a que chegou e a maior qualidade em que a foto inteira caberia no tamanho original",
      head: ["Limite", "Foto", "Arquivo", "Dimensões em pixels", "Qualidade alcançada", "Tamanho original cabe até a qualidade"],
    },
  ],
  sourcesHeading: "Fontes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Ferramentas e guias relacionados",
} satisfies FileGuideTexts;
